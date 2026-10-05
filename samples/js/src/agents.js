// Sample agents: a planner that acts under a mandate, a monitor that watches executions, and people.
//
// The planner turns a structured order into an ExecuteRequest. It does not read recipe text as
// instructions, it never removes an allergen block or picks a dish that contains a blocked allergen
// without asking, and it asks a person before anything its mandate lists in confirmBefore (always
// before irreversible and safety_override actions, Core 6.5). Plug a language model in front of it if
// you like; the model proposes an order, this code decides what is sent.
//
// The monitor checks what an executor reports: legal state transitions, a sequence that only goes up,
// and media temperatures inside the operation envelope.
import { createInterface } from 'node:readline/promises';
import { newKey } from './clients.js';
import { loadBundle, recipeAllergens, intersect } from './data.js';
import { TRANSITIONS, transitionAllowed } from './simulator.js';
import { get, pyRepr, sorted, parseTime } from './util.js';

export const ALWAYS_CONFIRM = ['irreversible', 'safety_override'];

/**
 * An AgentMandate (common.schema.json#/$defs/AgentMandate). Sign it with the principal's key before use;
 * executors verify the signature, the sample gates check scope and expiry.
 */
export function makeMandate(principal, agent, { scopes = ['plan_meals', 'start_cooking', 'stop_cooking'], expires = '2026-12-31T23:59:00Z',
  confirmBefore = ['irreversible', 'safety_override', 'diet_or_allergen_change'], vendor = 'cookwala-samples', model = 'rules', version = '0.1.0' } = {}) {
  return { principal, agent, agentInfo: { vendor, model, version }, scopes: [...scopes], confirmBefore: [...confirmBefore], expires };
}

export class Proposal {
  constructor(ok, { request = null, recipe = null, reason = null, detail = null, notes = null } = {}) {
    Object.assign(this, { ok, request, recipe, reason, detail, notes: notes || [] });
  }

  asDict() {
    return { ok: this.ok, request: this.request, recipe: this.recipe && this.recipe.id, reason: this.reason, detail: this.detail, notes: this.notes };
  }
}

export class PlannerAgent {
  constructor(agentId, mandate, catalog, human = null, now = null) {
    this.id = agentId;
    this.mandate = mandate;
    this.catalog = catalog;
    this.human = human;
    this.now = now || loadBundle().now;
    this.seq = 0;
  }

  _may(scope) {
    const m = this.mandate;
    if (!(m.scopes ?? []).includes(scope)) return `mandate lacks ${scope}`;
    if (m.expires && parseTime(m.expires) <= parseTime(this.now)) return 'mandate expired';
    return null;
  }

  async _confirm(item, detail) {
    if (!(this.mandate.confirmBefore ?? []).includes(item) && !ALWAYS_CONFIRM.includes(item)) return true;
    return Boolean(this.human && (await this.human.confirm(item, detail)));
  }

  /** order: {dish, servings?, allergenBlocks?, serveBy?, alternatives?: bool, triggers?: [confirmBefore items]}. Resolves to a Proposal. */
  async propose(order) {
    const why = this._may('plan_meals') || this._may('start_cooking');
    if (why) return new Proposal(false, { reason: 'mandate_scope', detail: why });
    const blocks = [...(order.allergenBlocks ?? [])];
    const hits = this.catalog.find(order.dish);
    if (!hits.length) return new Proposal(false, { reason: 'missing_capability', detail: `no recipe matches ${pyRepr(order.dish)}` });
    const notes = [];
    const safe = hits.filter((r) => !intersect(blocks, recipeAllergens(r)).size);
    let recipe;
    if (safe.length) {
      recipe = safe[0];
    } else if (order.alternatives) {
      const alts = this.catalog.list().map((k) => this.catalog.get(k)).filter((d) => !intersect(blocks, recipeAllergens(d)).size);
      if (!alts.length) return new Proposal(false, { reason: 'allergen_block', detail: 'every recipe in the catalog contains a blocked allergen' });
      recipe = alts[0];
      const detail = `${hits[0].id} contains ${pyRepr(sorted(intersect(blocks, recipeAllergens(hits[0]))))}; propose ${recipe.id} instead`;
      if (!(await this._confirm('diet_or_allergen_change', detail))) return new Proposal(false, { reason: 'not_authorized', detail: `a person did not confirm: ${detail}` });
      notes.push(detail);
    } else {
      // Never drop the block and never substitute an ingredient around it: stop here.
      const r = hits[0];
      return new Proposal(false, { recipe: r, reason: 'allergen_block', detail: `${r.id} contains blocked allergen(s) ${pyRepr(sorted(intersect(blocks, recipeAllergens(r))))}` });
    }
    for (const item of order.triggers ?? []) {
      if (!(await this._confirm(item, `order ${pyRepr(order.dish)} triggers ${item}`))) {
        return new Proposal(false, { recipe, reason: 'not_authorized', detail: `a person did not confirm ${item}` });
      }
    }
    const [gref, h] = this.catalog.refAndHash(recipe);
    this.seq += 1;
    const key = newKey('ex');
    const req = { core: '0.2.0', kind: 'ExecuteRequest', id: `${this.id.split(':').at(-1)}-${String(this.seq).padStart(4, '0')}-${key.slice(-6)}`,
      recipe: gref, recipeHash: h, requestedBy: this.id, idempotencyKey: key, mandate: this.mandate };
    if (order.servings) req.servings = order.servings;
    if (order.serveBy) req.serveBy = order.serveBy;
    if (blocks.length) req.allergenBlocks = blocks;
    return new Proposal(true, { request: req, recipe, notes });
  }
}

function reachable(a, b, seen = new Set()) {
  for (const n of TRANSITIONS[a] ?? []) {
    if (n === b) return true;
    if (!seen.has(n)) {
      seen.add(n);
      if (reachable(n, b, seen)) return true;
    }
  }
  return false;
}

/** Watches status documents. Anomalies are reported, never 'fixed': the executor owns safety. */
export class MonitorAgent {
  constructor() {
    this.history = new Map();
    this.anomalies = [];
    this.ops = loadBundle().ops;
  }

  /** Record one status document. Executions are keyed by device and id: one request may be tried on several devices. */
  observe(status, device = null) {
    const key = device ? `${device}/${status.id}` : status.id;
    if (!this.history.has(key)) this.history.set(key, []);
    const h = this.history.get(key);
    if (h.length) {
      const prev = h.at(-1);
      if (status.seq < prev.seq) {
        this.anomalies.push({ execution: status.id, kind: 'seq_regressed', detail: `${prev.seq} -> ${status.seq}` });
      } else if (status.state !== prev.state && !transitionAllowed(prev.state, status.state)) {
        // Polling can miss states in between; flag only transitions no path explains.
        if (!reachable(prev.state, status.state)) {
          this.anomalies.push({ execution: status.id, kind: 'illegal_transition', detail: `${prev.state} -> ${status.state}` });
        }
      }
    }
    const t = status['x-hub-mediumTempC'] ?? null;
    const step = status.step || {};
    const band = get(get(this.ops, step.op, {}), 'envelope', {})?.tempC;
    if (t !== null && band && t > band.max) {
      this.anomalies.push({ execution: status.id, kind: 'above_envelope', detail: `${step.op} ${t} °C > ${band.max} °C` });
    }
    if (!h.length || h.at(-1).seq !== status.seq) h.push({ seq: status.seq, state: status.state });
    return status;
  }

  transitions(executionId, device = null) {
    return (this.history.get(device ? `${device}/${executionId}` : executionId) ?? []).map((x) => x.state);
  }
}

/** A person for demos and tests: answers from a script, records every interaction. */
export class ScriptedHuman {
  constructor({ present = true, confirm = true, attend = true } = {}) {
    this.present = present;
    this._confirmAnswer = confirm;
    this._attendAnswer = attend;
    this.log = [];
  }

  confirm(item, detail) {
    const ok = typeof this._confirmAnswer === 'function' ? Boolean(this._confirmAnswer(item, detail)) : Boolean(this._confirmAnswer);
    this.log.push({ kind: 'confirm', item, detail, answer: ok });
    return ok;
  }

  attend(executionId, why) {
    const ok = Boolean(this.present) && (typeof this._attendAnswer === 'function' ? Boolean(this._attendAnswer(executionId, why)) : Boolean(this._attendAnswer));
    this.log.push({ kind: 'attend', execution: executionId, why, answer: ok });
    return ok;
  }
}

/** Asks on the terminal (answers are Promises; the planner and the orchestrator await them). */
export class ConsoleHuman extends ScriptedHuman {
  constructor({ present = true } = {}) {
    super({ present });
  }

  static async ask(text) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      return (await rl.question(`[person] ${text} - ok? [y/N] `)).trim().toLowerCase().startsWith('y');
    } finally {
      rl.close();
    }
  }

  async confirm(item, detail) {
    const ok = await ConsoleHuman.ask(detail);
    this.log.push({ kind: 'confirm', item, detail, answer: ok });
    return ok;
  }

  async attend(executionId, why) {
    const ok = Boolean(this.present) && (await ConsoleHuman.ask(why));
    this.log.push({ kind: 'attend', execution: executionId, why, answer: ok });
    return ok;
  }
}
