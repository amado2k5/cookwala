// A simulated executor that serves the Core 0.2 API in process, so every sample runs offline.
//
// The dry run is a port of tools/cookwala_ref.py `dry_run` working from the bundled vocabulary; the
// tests check it gives the reference answer for every bundled recipe and device. Executions advance
// one transition per `tick()`, deterministically, so samples and tests need no clock or threads.
//
// Faults can be injected per step to exercise recovery: `sensor_fault` fails the execution when the
// step starts, `timeout` pauses it in needs_human (the step's onTimeout), `overheat` fires a local
// safety limit, which cuts heat and stops the execution. No request field can change a limit.
import { loadBundle, recipeByRef, recipeAllergens, intersect } from './data.js';
import { problem } from './errors.js';
import { docHash } from './jcs.js';
import { truthy, get, formatG, pyRepr, sorted, iso, parseTime } from './util.js';

export const FINAL = new Set(['refused', 'stopped', 'completed', 'failed']);
export const TRANSITIONS = {
  accepted: new Set(['preparing', 'refused', 'stopped']),
  preparing: new Set(['running', 'needs_human', 'stopping', 'failed']),
  running: new Set(['paused', 'needs_human', 'stopping', 'completed', 'failed']),
  paused: new Set(['running', 'stopping']),
  needs_human: new Set(['running', 'stopping', 'failed']),
  stopping: new Set(['stopped']),
};

export function transitionAllowed(from, to) {
  return TRANSITIONS[from]?.has(to) ?? false;
}

const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const has = (o, k) => o !== null && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);
const toDate = (now) => (typeof now === 'string' ? parseTime(now) : now instanceof Date ? now : new Date());

/** Sensors that may satisfy a ladder rung (RFC-0011): state ok and calibration not expired. */
export function trustedSensors(capabilities, now = null) {
  const t = toDate(now);
  const out = new Set();
  for (const s of capabilities?.capabilities?.sensors ?? []) {
    if (get(s, 'state', 'ok') !== 'ok') continue;
    const vu = (s.calibration || {}).validUntil;
    if (vu && t > parseTime(vu)) continue;
    out.add(s.sensor);
    for (const c of s.visionCues ?? []) out.add(c);
  }
  return out;
}

export function ladderChoice(opId, sensors, allowModel = true, humanPresent = false, ops = null) {
  const env = get(get(ops || loadBundle().ops, opId, {}), 'envelope', {}) ?? {};
  for (const rung of get(env, 'sensorLadder', ['time'])) {
    if (rung === 'model' && allowModel) return 'model';
    if (rung === 'time') return 'time';
    if (rung === 'human' && humanPresent) return 'human';
    if (sensors.has(rung)) return rung;
  }
  return null;
}

/** [reason, detail] when a step's numbers break the envelope or a local limit, else null. */
export function checkNodeParams(opId, node, limits = null, ops = null, heatBands = null) {
  const b = loadBundle();
  ops = ops || b.ops;
  heatBands = heatBands || b.heatBands;
  const env = get(ops, opId, {}).envelope || {};
  const params = node.params || {};
  const temps = ['tempC', 'oilTempC'].filter((k) => has(params, k)).map((k) => [k, params[k]]);
  const tgt = params.target || node.target;
  if (tgt && typeof tgt === 'object' && !Array.isArray(tgt) && has(tgt, 'value') && ['degC', 'C'].includes(get(tgt, 'unit', 'degC'))) {
    temps.push(['target', tgt.value]);
  }
  for (const [key, t] of temps) if (!finite(t)) return ['envelope_out_of_range', `${key} is not a finite number`];
  const band = env.tempC;
  if (truthy(band)) {
    for (const [key, t] of temps) {
      if (t < band.min || t > band.max) {
        return ['envelope_out_of_range', `${key} ${formatG(t)} °C is outside the ${opId} envelope ${band.min}–${band.max} °C`];
      }
    }
    const heat = params.heat;
    if (env.medium === 'pan_surface' && typeof heat === 'string' && has(heatBands, heat)) {
      const hb = heatBands[heat];
      if (hb.max < band.min || hb.min > band.max) {
        return ['envelope_out_of_range', `heat level ${heat} (pan ${hb.min}–${hb.max} °C) cannot hold the ${opId} envelope ${band.min}–${band.max} °C`];
      }
    }
  }
  const pk = params.pressureKPa ?? null;
  if (pk !== null) {
    if (!finite(pk)) return ['envelope_out_of_range', 'pressureKPa is not a finite number'];
    const pb = env.pressureKPa;
    if (truthy(pb) && (pk < pb.min || pk > pb.max)) {
      return ['envelope_out_of_range', `pressure ${formatG(pk)} kPa is outside the ${opId} envelope ${pb.min}–${pb.max} kPa`];
    }
  }
  for (const lim of (limits || {}).limits ?? []) {
    const applies = get(lim, 'appliesTo', {});
    if (truthy(applies.ops) && !applies.ops.includes(opId)) continue;
    if (truthy(applies.medium) && applies.medium !== env.medium) continue;
    if (!truthy(applies.ops) && !truthy(applies.medium)) continue;
    if (lim.kind === 'max_temp' && lim.unit === 'degC') {
      for (const [key, t] of temps) {
        if (t > lim.max) return ['safety_limit', `${key} ${formatG(t)} °C exceeds local limit ${lim.id} (${lim.max} °C)`];
      }
    }
    if (lim.kind === 'pressure' && pk !== null && pk > get(lim, 'max', Infinity)) {
      return ['safety_limit', `pressure ${formatG(pk)} kPa exceeds local limit ${lim.id} (${lim.max} kPa)`];
    }
  }
  return null;
}

/** Can this device cook every step? {state: accepted|refused, plan: [...], refusal?}. Nothing runs. */
export function dryRun(recipe, capabilities, humanPresent = false, allowModel = true, limits = null, now = null) {
  const ops = loadBundle().ops;
  const caps = capabilities?.capabilities ?? {};
  const can = new Set((caps.ops ?? []).filter((o) => get(get(ops, o.op, {}), 'executable', true) !== false).map((o) => o.op));
  const sensors = trustedSensors(capabilities, now);
  const plan = [];
  for (const node of recipe?.process?.nodes ?? []) {
    const op = node.op;
    const assign = get(node.assignment ?? {}, 'allowed', ['any']);
    if (!can.has(op)) {
      if (humanPresent && (assign.includes('human') || assign.includes('any'))) {
        plan.push({ node: node.id, op, by: 'human', verifiedBy: 'human' });
        continue;
      }
      return { state: 'refused', refusal: { reason: 'missing_capability', node: node.id, detail: `device cannot perform ${op} and no person is present to do it` }, plan };
    }
    const bad = checkNodeParams(op, node, limits, ops);
    if (bad) return { state: 'refused', refusal: { reason: bad[0], node: node.id, detail: bad[1] }, plan };
    const env = get(get(ops, op, {}), 'envelope', {}) ?? {};
    if (truthy(env) && !get(env, 'unattended', true) && !humanPresent) {
      return { state: 'refused', refusal: { reason: 'needs_human_present', node: node.id, detail: `${op} may not run unattended` }, plan };
    }
    const rung = truthy(env) ? ladderChoice(op, sensors, allowModel, humanPresent, ops) : 'time';
    if (rung === null) {
      return { state: 'refused', refusal: { reason: 'missing_sensor_no_fallback', node: node.id, detail: `no way to verify ${op} on this device` }, plan };
    }
    plan.push({ node: node.id, op, by: 'device', verifiedBy: rung.startsWith('cw.') || rung.startsWith('x-') ? 'sensor' : rung, rung });
  }
  return { state: 'accepted', plan };
}

/** One simulated device behind the Core API. Not a safety case: a test bed for the samples. */
export class SimulatedExecutor {
  constructor(capabilities, { limits = null, recipes = null, recalls = null, faults = null, now = null, clockStepS = 60, busy = 0 } = {}) {
    const b = loadBundle();
    this.caps = capabilities;
    this.limits = limits || b.safetyLimits;
    this.recipes = recipes ?? b.recipes;
    this.recallDocs = [...(recalls || [])];
    this.faults = { ...(faults || {}) }; // 'node' or 'recipe-id#node' -> sensor_fault | timeout | overheat
    this.now = parseTime(now || b.now);
    this.clockStepMs = clockStepS * 1000;
    this.executions = new Map();
    this.idem = new Map();
    this.incidents = [];
    this.busy = busy; // refuse the next `busy` starts with reason busy (another pot is on this device)
  }

  static fromBundle(device, opts = {}) {
    return new SimulatedExecutor(loadBundle().devices[device], opts);
  }

  // ---- Core API
  capabilities() { return this.caps; }
  safetyLimits() { return this.limits; }
  recalls() { return [...this.recallDocs]; }

  startExecution(req, idempotencyKey, humanPresent = false) {
    if (!idempotencyKey || idempotencyKey.length < 8) {
      throw problem(400, 'missing-idempotency-key', 'Idempotency-Key header (8..128 chars) is required on every POST');
    }
    if (this.idem.has(idempotencyKey)) return { ...this.executions.get(this.idem.get(idempotencyKey)).status };
    for (const k of ['core', 'kind', 'id', 'recipe', 'recipeHash', 'requestedBy', 'idempotencyKey']) {
      if (!has(req, k)) throw problem(400, 'invalid-request', `missing ${k}`);
    }
    if (!String(req.core).startsWith('0.2.')) throw problem(400, 'unsupported-version', null, 'unsupported_version');
    if (this.executions.has(req.id)) throw problem(409, 'conflict', 'execution id already exists');
    const st = { core: '0.2.0', kind: 'ExecutionStatus', id: req.id, seq: 0, state: 'accepted', request: req.id, updatedAt: iso(this.now) };
    this.idem.set(idempotencyKey, req.id);
    const recipe = recipeByRef(this.recipes, req.recipe);
    let refusal = this._precheck(req, recipe);
    if (refusal === null && this.busy > 0) {
      this.busy -= 1;
      refusal = { reason: 'busy', detail: 'this device is cooking something else' };
    }
    let dry = null;
    if (refusal === null) {
      dry = dryRun(recipe, this.caps, humanPresent, true, this.limits, iso(this.now));
      refusal = dry.refusal ?? null;
    }
    if (refusal) {
      Object.assign(st, { state: 'refused', refusal });
      this.executions.set(req.id, { status: st, final: true });
      return { ...st };
    }
    st['x-sim-plan'] = dry.plan;
    this.executions.set(req.id, { status: st, req, recipe, plan: dry.plan, step: -1, steps: [], safety: [], human: [], startedAt: this.now, heated: false });
    return { ...st };
  }

  _precheck(req, recipe) {
    if (recipe === null) return { reason: 'missing_capability', detail: "recipe not found in this executor's catalog" };
    if (docHash(recipe) !== req.recipeHash) return { reason: 'recipe_hash_mismatch', detail: `this executor holds ${docHash(recipe)}` };
    for (const rc of this.recallDocs) {
      for (const t of rc.targets ?? []) {
        if (recipeByRef({ r: recipe }, get(t, 'ref', '')) !== null && (t.allRevisions || t.revision === recipe.revision)) {
          return { reason: 'recipe_recalled', detail: `recall ${pyStr2(rc.id)} is in force` };
        }
      }
    }
    const mandate = req.mandate;
    if (truthy(mandate) && !(mandate.scopes ?? []).includes('start_cooking')) return { reason: 'mandate_scope', detail: 'the agent mandate lacks start_cooking' };
    if (truthy(mandate) && mandate.expires && parseTime(mandate.expires) <= this.now) return { reason: 'mandate_scope', detail: 'the agent mandate has expired' };
    const blocks = intersect(req.allergenBlocks ?? [], recipeAllergens(recipe));
    if (blocks.size) return { reason: 'allergen_block', detail: `recipe contains blocked allergen(s): ${pyRepr(sorted(blocks))}` };
    return null;
  }

  _get(executionId) {
    const ex = this.executions.get(executionId);
    if (!ex) throw problem(404, 'not-found');
    return ex;
  }

  getExecution(executionId) {
    return { ...this._get(executionId).status };
  }

  /** Never refused once the caller reaches the executor (Core 6.2); no If-Match, no token. */
  stopExecution(executionId, reason = 'requested') {
    const ex = this._get(executionId);
    const st = ex.status;
    if (st.state === 'accepted') {
      // Nothing has started: accepted -> stopped is the legal transition. (The Python sample raises here; see README.)
      this._set(ex, 'stopped');
      ex.stopReason = reason;
      this._finish(ex, 'aborted_safe');
    } else if (!FINAL.has(st.state) && st.state !== 'stopping') {
      this._set(ex, 'stopping');
      ex.stopReason = reason;
    }
    return { ...st };
  }

  resumeExecution(executionId, seq) {
    const ex = this._get(executionId);
    const st = ex.status;
    if (seq === null || seq === undefined) throw problem(428, 'if-match-required');
    if (String(seq).replace(/^"+|"+$/g, '') !== String(st.seq)) throw problem(412, 'precondition-failed', `seq is ${st.seq}`);
    if (st.state === 'paused' || st.state === 'needs_human') {
      ex.human.push({ kind: 'confirm', minutes: 1 });
      delete st.humanNeeded;
      this._set(ex, 'running');
    }
    return { ...st };
  }

  executionLog(executionId) {
    const ex = this._get(executionId);
    if (!ex.final || !ex.log) throw problem(404, 'not-found', 'the log exists once the execution has ended');
    return ex.log;
  }

  reportIncident(doc) {
    for (const k of ['core', 'kind', 'id', 'date', 'category', 'severity', 'description']) {
      if (!has(doc, k)) throw problem(400, 'invalid-request', `not a valid IncidentReport: missing ${k}`);
    }
    this.incidents.push(doc);
    return { received: true };
  }

  // ---- the clock
  /** Advance every running execution by one transition and the clock by one step. */
  tick() {
    this.now = new Date(this.now.getTime() + this.clockStepMs);
    for (const ex of this.executions.values()) if (!ex.final) this._advance(ex);
  }

  _set(ex, state) {
    const st = ex.status;
    if (!transitionAllowed(st.state, state)) throw new Error(`AssertionError: ${st.state} -> ${state}`);
    st.seq += 1;
    st.state = state;
    st.updatedAt = iso(this.now);
  }

  _advance(ex) {
    const state = ex.status.state;
    if (state === 'stopping') { this._set(ex, 'stopped'); this._finish(ex, 'aborted_safe'); return; }
    if (state === 'accepted') { this._set(ex, 'preparing'); return; }
    if (state === 'preparing') { this._set(ex, 'running'); this._enter(ex, 0); return; }
    if (state !== 'running') return;
    this._close(ex);
    if (ex.step + 1 >= ex.plan.length) {
      this._set(ex, 'completed');
      this._finish(ex, 'served');
    } else this._enter(ex, ex.step + 1);
  }

  _enter(ex, i) {
    ex.step = i;
    const p = ex.plan[i];
    const st = ex.status;
    st.step = { node: p.node, op: p.op, startedAt: iso(this.now), progress: 0, verifiedBy: p.verifiedBy };
    const env = get(get(loadBundle().ops, p.op, {}), 'envelope', {}) ?? {};
    if (get(get(env, 'tempC', {}), 'max', 0) > 60) ex.heated = true; // a hot step started; chilling does not count
    const fault = this.faults[`${ex.recipe.id}#${p.node}`] || this.faults[p.node];
    if (fault === 'sensor_fault') {
      st['x-sim-fault'] = { node: p.node, kind: 'sensor_fault', detail: `the sensor for ${p.op} stopped reporting` };
      this._set(ex, 'failed');
      this._finish(ex, 'failed');
      return;
    }
    if (fault === 'overheat') {
      const lim = this._limitFor(p.op, env);
      const action = get(lim, 'action', 'cut_heat');
      ex.safety.push({ limit: lim.id, action, node: p.node, at: iso(this.now) });
      st['x-sim-fault'] = { node: p.node, kind: 'overheat', detail: `local safety limit ${lim.id} fired (${action}) during ${p.op}` };
      this._set(ex, 'stopping');
      ex.stopReason = 'safety_limit';
      return;
    }
    if (fault === 'timeout') {
      this._set(ex, 'needs_human');
      st.humanNeeded = { why: `${p.op} reached its maxTime; onTimeout asks a person` };
      return;
    }
    if (p.by === 'human') {
      this._set(ex, 'needs_human');
      st.humanNeeded = { why: `a person performs ${p.op}` };
    } else if (p.verifiedBy === 'human') {
      this._set(ex, 'needs_human');
      st.humanNeeded = { why: `a person confirms ${p.op} is done` };
    } else delete st.humanNeeded;
  }

  _limitFor(op, env) {
    for (const lim of this.limits.limits ?? []) {
      const a = get(lim, 'appliesTo', {});
      if (lim.kind === 'max_temp' && ((a.ops ?? []).includes(op) || (truthy(a.medium) && a.medium === env.medium))) return lim;
    }
    return { id: 'x-sim.max_temp', action: 'cut_heat' };
  }

  _close(ex) {
    const p = ex.plan[ex.step];
    ex.steps.push({ node: p.node, op: p.op, verifiedBy: p.verifiedBy, envelopeOk: true, endedAt: iso(this.now) });
    ex.status.step.progress = 1;
  }

  _finish(ex, outcome) {
    ex.final = true;
    if (!ex.req) return;
    const req = ex.req;
    const actor = get(this.caps, 'actor', {});
    ex.log = {
      core: '0.2.0', kind: 'ExecutionLog', id: `log-${req.id}`, recipe: req.recipe, recipeHash: req.recipeHash,
      device: { vendor: get(actor, 'vendor', 'simulated'), model: get(actor, 'model', 'simulated'), firmware: 'samples-sim-0.1',
        safetyLimits: `${this.limits.id}@${this.limits.version}` },
      startedAt: iso(ex.startedAt), endedAt: iso(this.now), outcome,
      servings: get(req, 'servings', get(get(ex.recipe, 'yield', {}), 'servings', 1)), steps: ex.steps,
      safetyEvents: ex.safety, humanInterventions: ex.human, 'x-heatStarted': ex.heated,
      consent: { dataset: 'none', withdrawable: true }, privacy: { personalData: 'none', timePrecision: 'day' },
    };
  }
}

function pyStr2(v) {
  return v === undefined || v === null ? 'None' : String(v);
}
