"""Sample gates: checks a request must pass before it is sent to an executor.

A gate looks at one thing and answers pass or refuse, with a Core RefusalReason
(core.schema.json#/$defs/RefusalReason). A pipeline runs the gates in order and fails closed: the
first refusal stops it, and a gate that raises is a refusal too. Gates never relax a request,
never substitute around an allergen block and never touch a safety limit.

The executor checks everything again; it is the authority (Core section 6). Gates exist so a
client, an agent or an orchestrator can explain a refusal early, pick another device, or not
bother a device at all.
"""
import datetime as dt
import re
from dataclasses import dataclass, field

from .data import load_bundle, recipe_by_ref, recipe_allergens
from .jcs import doc_hash
from .simulator import check_node_params, dry_run

__all__ = ['GateContext', 'GateResult', 'GateDecision', 'GatePipeline', 'CoreVersionGate', 'RecipeHashGate', 'RecallGate', 'MandateGate',
           'AllergenGate', 'EnvelopeGate', 'AttendanceGate', 'UntrustedTextGate', 'CapabilityGate']


def _time(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


@dataclass
class GateContext:
    request: dict
    recipe: dict = None
    device: dict = None          # capabilities document of the target device, when one is chosen
    human_present: bool = False
    now: str = None              # ISO 8601; defaults to the bundle's pinned instant so results are reproducible
    recalls: list = field(default_factory=list)
    limits: dict = None
    verify_mandate: object = None  # optional callable(mandate) -> (ok, why); e.g. cookwala.verify from sdk/python

    def __post_init__(self):
        b = load_bundle()
        self.now = self.now or b['now']
        self.limits = self.limits or b['safetyLimits']


@dataclass
class GateResult:
    gate: str
    ok: bool
    reason: str = None
    detail: str = None
    node: str = None
    findings: list = field(default_factory=list)

    def as_dict(self):
        d = {'gate': self.gate, 'ok': self.ok}
        for k in ('reason', 'detail', 'node'):
            if getattr(self, k): d[k] = getattr(self, k)
        if self.findings: d['findings'] = self.findings
        return d


@dataclass
class GateDecision:
    allowed: bool
    results: list

    @property
    def refusal(self):
        bad = next((r for r in self.results if not r.ok), None)
        return None if bad is None else {'reason': bad.reason, 'detail': bad.detail, 'gate': bad.gate, **({'node': bad.node} if bad.node else {})}

    @property
    def findings(self):
        return [f for r in self.results for f in r.findings]

    def as_dict(self):
        return {'allowed': self.allowed, 'refusal': self.refusal, 'findings': self.findings, 'results': [r.as_dict() for r in self.results]}


class Gate:
    name = 'gate'

    def check(self, ctx):  # -> GateResult
        raise NotImplementedError

    def ok(self, findings=None): return GateResult(self.name, True, findings=findings or [])
    def refuse(self, reason, detail, node=None): return GateResult(self.name, False, reason, detail, node)


class CoreVersionGate(Gate):
    name = 'core-version'

    def check(self, ctx):
        v = str(ctx.request.get('core', ''))
        return self.ok() if v.startswith('0.2.') else self.refuse('unsupported_version', f'core {v or "missing"}; this sample speaks 0.2.x')


class RecipeHashGate(Gate):
    """The request names exactly one revision; the recipe in hand must be that revision."""
    name = 'recipe-hash'

    def check(self, ctx):
        if ctx.recipe is None:
            return self.refuse('missing_capability', f"recipe {ctx.request.get('recipe')} is not in the catalog")
        h = doc_hash(ctx.recipe)
        return self.ok() if h == ctx.request.get('recipeHash') else self.refuse('recipe_hash_mismatch', f'catalog holds {h}')


class RecallGate(Gate):
    name = 'recall'

    def check(self, ctx):
        for rc in ctx.recalls or []:
            for t in rc.get('targets', []):
                if ctx.recipe is not None and recipe_by_ref({'r': ctx.recipe}, t.get('ref', '')) is not None and (t.get('allRevisions') or t.get('revision') == ctx.recipe.get('revision')):
                    return self.refuse('recipe_recalled', f"recall {rc.get('id')} ({rc.get('reason', 'unspecified')}) is in force")
        return self.ok()


class MandateGate(Gate):
    """An agent acts only under a mandate: right agent, start_cooking scope, not expired, signature checked if a verifier is given."""
    name = 'mandate'

    def check(self, ctx):
        req, m = ctx.request, ctx.request.get('mandate')
        by = str(req.get('requestedBy', ''))
        if m is None:
            return self.refuse('not_authorized', f'{by} is an agent and sent no mandate') if by.startswith('agent:') else self.ok()
        if m.get('agent') and m['agent'] != by:
            return self.refuse('not_authorized', f"mandate is for {m['agent']}, request is from {by}")
        if 'start_cooking' not in m.get('scopes', []):
            return self.refuse('mandate_scope', 'the mandate lacks start_cooking')
        if m.get('expires') and _time(m['expires']) <= _time(ctx.now):
            return self.refuse('mandate_scope', f"the mandate expired at {m['expires']}")
        if ctx.verify_mandate is not None:
            ok, why = ctx.verify_mandate(m)
            if not ok: return self.refuse('not_authorized', f'mandate signature: {why}')
        return self.ok()


class AllergenGate(Gate):
    """Any blocked allergen in the recipe refuses; there are no substitutions around a block (Core 6.7)."""
    name = 'allergen'

    def check(self, ctx):
        blocks = set(ctx.request.get('allergenBlocks', [])) & recipe_allergens(ctx.recipe or {})
        return self.refuse('allergen_block', f'recipe contains blocked allergen(s): {sorted(blocks)}') if blocks else self.ok()


class EnvelopeGate(Gate):
    """Every step's numbers sit inside the operation envelope and under the local safety limits."""
    name = 'envelope'

    def check(self, ctx):
        for node in (ctx.recipe or {}).get('process', {}).get('nodes', []):
            bad = check_node_params(node['op'], node, ctx.limits)
            if bad: return self.refuse(bad[0], bad[1], node['id'])
        return self.ok()


class AttendanceGate(Gate):
    """Operations whose envelope says unattended:false need a person present."""
    name = 'attendance'

    def check(self, ctx):
        ops = load_bundle()['ops']
        for node in (ctx.recipe or {}).get('process', {}).get('nodes', []):
            env = ops.get(node['op'], {}).get('envelope', {})
            if env and env.get('unattended', True) is False and not ctx.human_present:
                return self.refuse('needs_human_present', f"{node['op']} may not run unattended", node['id'])
        return self.ok()


INSTRUCTION_PATTERNS = [r'ignore (all |any )?(previous|prior|above) (instructions|rules)', r'disregard (the )?(rules|instructions|limits)',
                        r'(raise|increase|disable|bypass|override) (the )?(safety|temperature|heat) ?(limit|limits|check|checks)?',
                        r'you are (now )?(an?|the) ', r'system prompt', r'act as ', r'skip (the )?(allergen|safety)', r'without (a )?(person|human|supervision)']


class UntrustedTextGate(Gate):
    """Free text is data, never an instruction (Core 6.4). This gate never obeys and never refuses: it logs a finding."""
    name = 'untrusted-text'

    def __init__(self, patterns=INSTRUCTION_PATTERNS):
        self.rx = [re.compile(p, re.I) for p in patterns]

    def _strings(self, v, path):
        if isinstance(v, str): yield path, v
        elif isinstance(v, dict):
            for k, x in v.items(): yield from self._strings(x, f'{path}/{k}')
        elif isinstance(v, list):
            for i, x in enumerate(v): yield from self._strings(x, f'{path}/{i}')

    def check(self, ctx):
        findings = []
        for where, doc in (('request', ctx.request), ('recipe', ctx.recipe or {})):
            for path, s in self._strings(doc, ''):
                if any(r.search(s) for r in self.rx):
                    findings.append({'incident': 'cw.incident.untrusted_instruction', 'where': f'{where}{path}', 'action': 'ignored_and_logged'})
        return self.ok(findings)


class CapabilityGate(Gate):
    """When a device is chosen: the dry run the executor will do, done early."""
    name = 'capability'

    def check(self, ctx):
        if ctx.device is None or ctx.recipe is None: return self.ok()
        res = dry_run(ctx.recipe, ctx.device, ctx.human_present, True, ctx.limits, ctx.now)
        if res['state'] == 'refused':
            r = res['refusal']; return self.refuse(r['reason'], r['detail'], r.get('node'))
        return self.ok()


class GatePipeline:
    def __init__(self, gates):
        self.gates = list(gates)

    @classmethod
    def default(cls):
        """Order: cheap and final first (version, hash, recall, mandate, allergens), then the recipe's numbers, then the device."""
        return cls([CoreVersionGate(), RecipeHashGate(), RecallGate(), MandateGate(), AllergenGate(), UntrustedTextGate(),
                    EnvelopeGate(), AttendanceGate(), CapabilityGate()])

    def without(self, *names):
        return GatePipeline([g for g in self.gates if g.name not in names])

    def run(self, ctx):
        results = []
        for g in self.gates:
            try:
                r = g.check(ctx)
            except Exception as e:  # fail closed: a gate that cannot decide refuses
                r = GateResult(g.name, False, 'x-gate-error', f'{type(e).__name__}: {e}')
            results.append(r)
            if not r.ok:
                return GateDecision(False, results)
        return GateDecision(True, results)
