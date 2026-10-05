// Sample gates: checks a request must pass before it is sent to an executor.
//
// A gate looks at one thing and answers pass or refuse, with a Core RefusalReason
// (core.schema.json#/$defs/RefusalReason). A pipeline runs the gates in order and fails closed: the
// first refusal stops it, and a gate that throws is a refusal too. Gates never relax a request,
// never substitute around an allergen block and never touch a safety limit.
//
// The executor checks everything again; it is the authority (Core section 6). Gates exist so a
// client, an agent or an orchestrator can explain a refusal early, pick another device, or not
// bother a device at all.
import { loadBundle, recipeByRef, recipeAllergens, intersect } from './data.js';
import { docHash } from './jcs.js';
import { checkNodeParams, dryRun } from './simulator.js';
import { truthy, get, pyStr, pyRepr, sorted, parseTime } from './util.js';

export class GateContext {
  /**
   * @param request ExecuteRequest
   * @param recipe the recipe it names (or null)
   * @param device capabilities document of the target device, when one is chosen
   * @param opts {now, recalls, limits, verifyMandate(mandate) -> [ok, why]}
   */
  constructor(request, recipe = null, device = null, humanPresent = false, { now = null, recalls = [], limits = null, verifyMandate = null } = {}) {
    const b = loadBundle();
    this.request = request;
    this.recipe = recipe ?? null;
    this.device = device ?? null;
    this.humanPresent = Boolean(humanPresent);
    this.now = now || b.now; // the bundle's pinned instant, so results are reproducible
    this.recalls = recalls ?? [];
    this.limits = limits || b.safetyLimits;
    this.verifyMandate = verifyMandate;
  }
}

export class GateResult {
  constructor(gate, ok, reason = null, detail = null, node = null, findings = []) {
    Object.assign(this, { gate, ok, reason, detail, node, findings });
  }

  asDict() {
    const d = { gate: this.gate, ok: this.ok };
    for (const k of ['reason', 'detail', 'node']) if (this[k]) d[k] = this[k];
    if (this.findings.length) d.findings = this.findings;
    return d;
  }
}

export class GateDecision {
  constructor(allowed, results) {
    this.allowed = allowed;
    this.results = results;
  }

  get refusal() {
    const bad = this.results.find((r) => !r.ok);
    if (!bad) return null;
    return { reason: bad.reason, detail: bad.detail, gate: bad.gate, ...(bad.node ? { node: bad.node } : {}) };
  }

  get findings() {
    return this.results.flatMap((r) => r.findings);
  }

  asDict() {
    return { allowed: this.allowed, refusal: this.refusal, findings: this.findings, results: this.results.map((r) => r.asDict()) };
  }
}

export class Gate {
  name = 'gate';
  check(_ctx) { throw new Error('NotImplementedError'); }
  ok(findings = null) { return new GateResult(this.name, true, null, null, null, findings || []); }
  refuse(reason, detail, node = null) { return new GateResult(this.name, false, reason, detail, node); }
}

export class CoreVersionGate extends Gate {
  name = 'core-version';
  check(ctx) {
    const v = String(get(ctx.request, 'core', ''));
    return v.startsWith('0.2.') ? this.ok() : this.refuse('unsupported_version', `core ${v || 'missing'}; this sample speaks 0.2.x`);
  }
}

/** The request names exactly one revision; the recipe in hand must be that revision. */
export class RecipeHashGate extends Gate {
  name = 'recipe-hash';
  check(ctx) {
    if (ctx.recipe === null) return this.refuse('missing_capability', `recipe ${pyStr(ctx.request.recipe)} is not in the catalog`);
    const h = docHash(ctx.recipe);
    return h === ctx.request.recipeHash ? this.ok() : this.refuse('recipe_hash_mismatch', `catalog holds ${h}`);
  }
}

export class RecallGate extends Gate {
  name = 'recall';
  check(ctx) {
    for (const rc of ctx.recalls || []) {
      for (const t of rc.targets ?? []) {
        if (ctx.recipe !== null && recipeByRef({ r: ctx.recipe }, get(t, 'ref', '')) !== null && (t.allRevisions || t.revision === ctx.recipe.revision)) {
          return this.refuse('recipe_recalled', `recall ${pyStr(rc.id)} (${get(rc, 'reason', 'unspecified')}) is in force`);
        }
      }
    }
    return this.ok();
  }
}

/** An agent acts only under a mandate: right agent, start_cooking scope, not expired, signature checked if a verifier is given. */
export class MandateGate extends Gate {
  name = 'mandate';
  check(ctx) {
    const req = ctx.request;
    const m = req.mandate ?? null;
    const by = String(get(req, 'requestedBy', ''));
    if (m === null) return by.startsWith('agent:') ? this.refuse('not_authorized', `${by} is an agent and sent no mandate`) : this.ok();
    if (m.agent && m.agent !== by) return this.refuse('not_authorized', `mandate is for ${m.agent}, request is from ${by}`);
    if (!(m.scopes ?? []).includes('start_cooking')) return this.refuse('mandate_scope', 'the mandate lacks start_cooking');
    if (m.expires && parseTime(m.expires) <= parseTime(ctx.now)) return this.refuse('mandate_scope', `the mandate expired at ${m.expires}`);
    if (ctx.verifyMandate) {
      const [ok, why] = ctx.verifyMandate(m);
      if (!ok) return this.refuse('not_authorized', `mandate signature: ${why}`);
    }
    return this.ok();
  }
}

/** Any blocked allergen in the recipe refuses; there are no substitutions around a block (Core 6.7). */
export class AllergenGate extends Gate {
  name = 'allergen';
  check(ctx) {
    const blocks = intersect(get(ctx.request, 'allergenBlocks', []), recipeAllergens(ctx.recipe || {}));
    return blocks.size ? this.refuse('allergen_block', `recipe contains blocked allergen(s): ${pyRepr(sorted(blocks))}`) : this.ok();
  }
}

/** Every step's numbers sit inside the operation envelope and under the local safety limits. */
export class EnvelopeGate extends Gate {
  name = 'envelope';
  check(ctx) {
    for (const node of (ctx.recipe || {}).process?.nodes ?? []) {
      const bad = checkNodeParams(node.op, node, ctx.limits);
      if (bad) return this.refuse(bad[0], bad[1], node.id);
    }
    return this.ok();
  }
}

/** Operations whose envelope says unattended:false need a person present. */
export class AttendanceGate extends Gate {
  name = 'attendance';
  check(ctx) {
    const ops = loadBundle().ops;
    for (const node of (ctx.recipe || {}).process?.nodes ?? []) {
      const env = get(get(ops, node.op, {}), 'envelope', {}) ?? {};
      if (truthy(env) && get(env, 'unattended', true) === false && !ctx.humanPresent) {
        return this.refuse('needs_human_present', `${node.op} may not run unattended`, node.id);
      }
    }
    return this.ok();
  }
}

export const INSTRUCTION_PATTERNS = [
  'ignore (all |any )?(previous|prior|above) (instructions|rules)', 'disregard (the )?(rules|instructions|limits)',
  '(raise|increase|disable|bypass|override) (the )?(safety|temperature|heat) ?(limit|limits|check|checks)?',
  'you are (now )?(an?|the) ', 'system prompt', 'act as ', 'skip (the )?(allergen|safety)', 'without (a )?(person|human|supervision)',
];

/** Free text is data, never an instruction (Core 6.4). This gate never obeys and never refuses: it logs a finding. */
export class UntrustedTextGate extends Gate {
  name = 'untrusted-text';
  constructor(patterns = INSTRUCTION_PATTERNS) {
    super();
    this.rx = patterns.map((p) => new RegExp(p, 'i'));
  }

  *strings(v, path) {
    if (typeof v === 'string') yield [path, v];
    else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* this.strings(v[i], `${path}/${i}`);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* this.strings(x, `${path}/${k}`);
  }

  check(ctx) {
    const findings = [];
    for (const [where, doc] of [['request', ctx.request], ['recipe', ctx.recipe || {}]]) {
      for (const [path, s] of this.strings(doc, '')) {
        if (this.rx.some((r) => r.test(s))) findings.push({ incident: 'cw.incident.untrusted_instruction', where: `${where}${path}`, action: 'ignored_and_logged' });
      }
    }
    return this.ok(findings);
  }
}

/** When a device is chosen: the dry run the executor will do, done early. */
export class CapabilityGate extends Gate {
  name = 'capability';
  check(ctx) {
    if (ctx.device === null || ctx.recipe === null) return this.ok();
    const res = dryRun(ctx.recipe, ctx.device, ctx.humanPresent, true, ctx.limits, ctx.now);
    if (res.state === 'refused') {
      const r = res.refusal;
      return this.refuse(r.reason, r.detail, r.node ?? null);
    }
    return this.ok();
  }
}

export class GatePipeline {
  constructor(gates) {
    this.gates = [...gates];
  }

  /** Order: cheap and final first (version, hash, recall, mandate, allergens), then the recipe's numbers, then the device. */
  static default() {
    return new GatePipeline([new CoreVersionGate(), new RecipeHashGate(), new RecallGate(), new MandateGate(), new AllergenGate(),
      new UntrustedTextGate(), new EnvelopeGate(), new AttendanceGate(), new CapabilityGate()]);
  }

  without(...names) {
    return new GatePipeline(this.gates.filter((g) => !names.includes(g.name)));
  }

  run(ctx) {
    const results = [];
    for (const g of this.gates) {
      let r;
      try {
        r = g.check(ctx);
      } catch (e) { // fail closed: a gate that cannot decide refuses
        r = new GateResult(g.name, false, 'x-gate-error', `${e?.name ?? 'Error'}: ${e?.message ?? e}`);
      }
      results.push(r);
      if (!r.ok) return new GateDecision(false, results);
    }
    return new GateDecision(true, results);
  }
}
