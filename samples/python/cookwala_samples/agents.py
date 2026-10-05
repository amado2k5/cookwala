"""Sample agents: a planner that acts under a mandate, a monitor that watches executions, and people.

The planner turns a structured order into an ExecuteRequest. It does not read recipe text as
instructions, it never removes an allergen block or picks a dish that contains a blocked allergen
without asking, and it asks a person before anything its mandate lists in confirmBefore (always
before irreversible and safety_override actions, Core 6.5). Plug a language model in front of it if
you like; the model proposes an order, this code decides what is sent.

The monitor checks what an executor reports: legal state transitions, a sequence that only goes up,
and media temperatures inside the operation envelope.
"""
import datetime as dt

from .clients import new_key
from .data import load_bundle, recipe_allergens
from .simulator import transition_allowed

__all__ = ['make_mandate', 'PlannerAgent', 'Proposal', 'MonitorAgent', 'ScriptedHuman', 'ConsoleHuman', 'ALWAYS_CONFIRM']

ALWAYS_CONFIRM = ('irreversible', 'safety_override')


def _time(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def make_mandate(principal, agent, scopes=('plan_meals', 'start_cooking', 'stop_cooking'), expires='2026-12-31T23:59:00Z',
                 confirm_before=('irreversible', 'safety_override', 'diet_or_allergen_change'), vendor='cookwala-samples', model='rules', version='0.1.0'):
    """An AgentMandate (common.schema.json#/$defs/AgentMandate). Sign it with the principal's key before use
    (sdk/python: cookwala.sign); executors verify the signature, the sample gates check scope and expiry."""
    return {'principal': principal, 'agent': agent, 'agentInfo': {'vendor': vendor, 'model': model, 'version': version},
            'scopes': list(scopes), 'confirmBefore': list(confirm_before), 'expires': expires}


class Proposal:
    def __init__(self, ok, request=None, recipe=None, reason=None, detail=None, notes=None):
        self.ok, self.request, self.recipe, self.reason, self.detail, self.notes = ok, request, recipe, reason, detail, notes or []

    def as_dict(self):
        return {'ok': self.ok, 'request': self.request, 'recipe': self.recipe and self.recipe.get('id'), 'reason': self.reason, 'detail': self.detail, 'notes': self.notes}


class PlannerAgent:
    def __init__(self, agent_id, mandate, catalog, human=None, now=None):
        self.id, self.mandate, self.catalog, self.human = agent_id, mandate, catalog, human
        self.now = now or load_bundle()['now']
        self.seq = 0

    def _may(self, scope):
        m = self.mandate
        if scope not in m.get('scopes', []): return f'mandate lacks {scope}'
        if m.get('expires') and _time(m['expires']) <= _time(self.now): return 'mandate expired'
        return None

    def _confirm(self, item, detail):
        if item not in self.mandate.get('confirmBefore', []) and item not in ALWAYS_CONFIRM:
            return True
        return bool(self.human and self.human.confirm(item, detail))

    def propose(self, order):
        """order: {dish, servings?, allergenBlocks?, serveBy?, alternatives?: bool, triggers?: [confirmBefore items]}."""
        why = self._may('plan_meals') or self._may('start_cooking')
        if why: return Proposal(False, reason='mandate_scope', detail=why)
        blocks = list(order.get('allergenBlocks', []))
        hits = self.catalog.find(order['dish'])
        if not hits: return Proposal(False, reason='missing_capability', detail=f"no recipe matches {order['dish']!r}")
        notes = []
        safe = [r for r in hits if not set(blocks) & recipe_allergens(r)]
        if safe:
            recipe = safe[0]
        elif order.get('alternatives'):
            alts = [d for k in self.catalog.list() for d in [self.catalog.get(k)] if not set(blocks) & recipe_allergens(d)]
            if not alts: return Proposal(False, reason='allergen_block', detail='every recipe in the catalog contains a blocked allergen')
            recipe = alts[0]
            detail = f"{hits[0]['id']} contains {sorted(set(blocks) & recipe_allergens(hits[0]))}; propose {recipe['id']} instead"
            if not self._confirm('diet_or_allergen_change', detail):
                return Proposal(False, reason='not_authorized', detail=f'a person did not confirm: {detail}')
            notes.append(detail)
        else:
            # Never drop the block and never substitute an ingredient around it: send the request and let it be refused, or stop here.
            r = hits[0]
            return Proposal(False, recipe=r, reason='allergen_block', detail=f"{r['id']} contains blocked allergen(s) {sorted(set(blocks) & recipe_allergens(r))}")
        for item in order.get('triggers', []):
            if not self._confirm(item, f"order {order['dish']!r} triggers {item}"):
                return Proposal(False, recipe=recipe, reason='not_authorized', detail=f'a person did not confirm {item}')
        gref, h = self.catalog.ref_and_hash(recipe)
        self.seq += 1
        key = new_key('ex')
        req = {'core': '0.2.0', 'kind': 'ExecuteRequest', 'id': f"{self.id.split(':')[-1]}-{self.seq:04d}-{key[-6:]}", 'recipe': gref, 'recipeHash': h,
               'requestedBy': self.id, 'idempotencyKey': key, 'mandate': self.mandate}
        if order.get('servings'): req['servings'] = order['servings']
        if order.get('serveBy'): req['serveBy'] = order['serveBy']
        if blocks: req['allergenBlocks'] = blocks
        return Proposal(True, req, recipe, notes=notes)


class MonitorAgent:
    """Watches status documents. Anomalies are reported, never 'fixed': the executor owns safety."""

    def __init__(self):
        self.history = {}
        self.anomalies = []
        self.ops = load_bundle()['ops']

    def observe(self, status, device=None):
        """Record one status document. Executions are keyed by device and id: one request may be tried on several devices."""
        key = f"{device}/{status['id']}" if device else status['id']
        h = self.history.setdefault(key, [])
        if h:
            prev = h[-1]
            if status['seq'] < prev['seq']:
                self.anomalies.append({'execution': status['id'], 'kind': 'seq_regressed', 'detail': f"{prev['seq']} -> {status['seq']}"})
            elif status['state'] != prev['state'] and not transition_allowed(prev['state'], status['state']):
                # Polling can miss states in between; flag only transitions no path explains.
                if not self._reachable(prev['state'], status['state']):
                    self.anomalies.append({'execution': status['id'], 'kind': 'illegal_transition', 'detail': f"{prev['state']} -> {status['state']}"})
        t = status.get('x-hub-mediumTempC'); step = status.get('step') or {}
        band = self.ops.get(step.get('op'), {}).get('envelope', {}).get('tempC')
        if t is not None and band and t > band['max']:
            self.anomalies.append({'execution': status['id'], 'kind': 'above_envelope', 'detail': f"{step.get('op')} {t} °C > {band['max']} °C"})
        if not h or h[-1]['seq'] != status['seq']:
            h.append({'seq': status['seq'], 'state': status['state']})
        return status

    @staticmethod
    def _reachable(a, b, seen=None):
        from .simulator import TRANSITIONS
        seen = seen or set()
        for n in TRANSITIONS.get(a, ()):
            if n == b: return True
            if n not in seen:
                seen.add(n)
                if MonitorAgent._reachable(n, b, seen): return True
        return False

    def transitions(self, execution_id, device=None):
        return [h['state'] for h in self.history.get(f'{device}/{execution_id}' if device else execution_id, [])]


class ScriptedHuman:
    """A person for demos and tests: answers from a script, records every interaction."""

    def __init__(self, present=True, confirm=True, attend=True):
        self.present, self._confirm, self._attend = present, confirm, attend
        self.log = []

    def confirm(self, item, detail):
        ok = self._confirm(item, detail) if callable(self._confirm) else bool(self._confirm)
        self.log.append({'kind': 'confirm', 'item': item, 'detail': detail, 'answer': ok}); return ok

    def attend(self, execution_id, why):
        ok = self.present and (self._attend(execution_id, why) if callable(self._attend) else bool(self._attend))
        self.log.append({'kind': 'attend', 'execution': execution_id, 'why': why, 'answer': ok}); return ok


class ConsoleHuman(ScriptedHuman):
    """Asks on the terminal."""

    def __init__(self, present=True):
        ask = lambda *a: input(f"[person] {a[-1]} - ok? [y/N] ").strip().lower().startswith('y')  # noqa: E731
        super().__init__(present, ask, ask)
