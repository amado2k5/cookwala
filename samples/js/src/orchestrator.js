// Sample orchestrator: one request, several devices, gates first, recovery throughout, a record at the end.
//
// Orchestrators are optional in Cookwala: a household, a hub or a single device must work without
// one (docs/PROTOCOL.md). This one shows the pattern for a kitchen or a fleet:
//
//     order -> planner agent -> gates (no device) -> dry run on every device -> best device
//           -> start (the executor checks again) -> poll, monitor, ask people, recover -> log -> report
//
// Ranking prefers the plan that needs the fewest people, then the fewest steps verified only by time.
import { MonitorAgent } from './agents.js';
import { CookwalaProblem } from './errors.js';
import { GateContext, GatePipeline } from './gates.js';
import { RecoveryPolicy, TRY_NEXT_DEVICE, ASK_PRESENCE, RESUME, DISCARD_AND_REPORT, RETRY } from './recovery.js';
import { RunRecord, incidentFrom } from './reporting.js';
import { FINAL } from './simulator.js';
import { sleepS } from './util.js';

/** A job: an order for the planner agent, or a ready ExecuteRequest with the recipe it names. Plain objects of the same shape work too. */
export class Job {
  constructor(id, { order = null, request = null, recipe = null, humanPresent = false, tags = {} } = {}) {
    Object.assign(this, { id, order, request, recipe, humanPresent, tags });
  }
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export class Orchestrator {
  /**
   * @param devices {name: HubClient | LocalClient} (an object or a Map)
   * @param opts {planner, gates, recovery, human, recalls, sleep(seconds) -> Promise}
   */
  constructor(devices, { planner = null, gates = null, recovery = null, human = null, recalls = null, sleep = sleepS } = {}) {
    this.devices = devices instanceof Map ? new Map(devices) : new Map(Object.entries(devices));
    this.planner = planner;
    this.human = human;
    this.gates = gates || GatePipeline.default().without('capability'); // the device check happens per device below
    this.recovery = recovery || new RecoveryPolicy();
    this.monitor = new MonitorAgent();
    this.recallDocs = recalls;
    this.sleep = sleep;
  }

  async recalls() {
    if (this.recallDocs !== null && this.recallDocs !== undefined) return this.recallDocs;
    const out = [];
    for (const c of this.devices.values()) {
      try {
        out.push(...((await c.recalls()) || []));
      } catch (e) {
        if (!(e instanceof CookwalaProblem)) throw e;
      }
    }
    return out;
  }

  async _retrying(rec, fn) {
    let attempt = 0;
    for (;;) {
      try {
        return await fn();
      } catch (p) {
        if (!(p instanceof CookwalaProblem) || p.status !== 0) throw p;
        const act = this.recovery.onTransportError(attempt);
        rec.recovery.push(act.asDict());
        if (act.kind !== RETRY) throw p;
        await this.sleep(act.waitS);
        attempt += 1;
      }
    }
  }

  /** Dry-run the recipe on every device; accepted plans first, best first. Resolves to [[name, dryRun], ...]. */
  async rank(recipe, humanPresent) {
    const out = [];
    for (const [name, c] of this.devices) {
      let dr;
      try {
        dr = await c.dryRun(recipe, humanPresent);
      } catch (p) {
        if (!(p instanceof CookwalaProblem)) throw p;
        dr = { state: 'refused', refusal: { reason: 'busy', detail: p.message }, plan: [] };
      }
      const people = dr.plan.filter((p) => p.verifiedBy === 'human').length;
      const timed = dr.plan.filter((p) => p.verifiedBy === 'time').length;
      out.push([dr.state !== 'accepted' ? 1 : 0, people, timed, name, dr]);
    }
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || cmp(a[3], b[3]));
    return out.map((t) => [t[3], t[4]]);
  }

  async run(job) {
    const rec = new RunRecord(job.id, { tags: { ...(job.tags || {}) } });
    let request = job.request ?? null;
    let recipe = job.recipe ?? null;
    if (job.order !== null && job.order !== undefined) {
      const prop = await this.planner.propose(job.order);
      rec.notes.push(...prop.notes);
      if (!prop.ok) return rec.refused({ reason: prop.reason, detail: prop.detail, gate: 'planner' }, prop.recipe);
      request = prop.request;
      recipe = prop.recipe;
    }
    rec.request = request;
    rec.recipe = (recipe || {}).id ?? null;
    let humanPresent = Boolean(job.humanPresent ?? job.human_present);

    let decision = this.gates.run(new GateContext(request, recipe, null, humanPresent, { recalls: await this.recalls() }));
    if (!decision.allowed) {
      const act = this.recovery.onRefusal(decision.refusal, humanPresent, false);
      rec.recovery.push(act.asDict());
      if (act.kind === ASK_PRESENCE && this.human && this.human.present &&
          (await this.human.confirm('presence', 'a step may not run unattended; can a person stay in the kitchen?'))) {
        humanPresent = true;
        rec.human.push({ kind: 'presence', why: decision.refusal.detail });
        decision = this.gates.run(new GateContext(request, recipe, null, true, { recalls: await this.recalls() }));
      }
    }
    rec.gates = decision.asDict();
    rec.findings.push(...decision.findings);
    if (!decision.allowed) return rec.refused(decision.refusal);

    const ranked = await this.rank(recipe, humanPresent);
    for (let i = 0; i < ranked.length; i++) {
      const [name, dr] = ranked[i];
      const client = this.devices.get(name);
      rec.attempts.push({ device: name, dryRun: dr.state, ...(dr.refusal ? { reason: dr.refusal.reason } : {}) });
      if (dr.state !== 'accepted') {
        const act = this.recovery.onRefusal(dr.refusal, humanPresent, i + 1 < ranked.length);
        rec.recovery.push(act.asDict());
        if (act.kind === TRY_NEXT_DEVICE) continue;
        return rec.refused({ ...dr.refusal, device: name });
      }
      const st = await this._retrying(rec, () => client.startExecution(request, request.idempotencyKey, humanPresent));
      this.monitor.observe(st, name);
      if (st.state === 'refused') { // the executor is the authority; its refusal wins over our dry run
        rec.attempts.at(-1).executor = 'refused';
        const act = this.recovery.onRefusal(st.refusal, humanPresent, i + 1 < ranked.length);
        rec.recovery.push(act.asDict());
        if (act.kind === TRY_NEXT_DEVICE) continue;
        return rec.refused({ ...st.refusal, device: name });
      }
      rec.device = name;
      return this._drive(rec, client, st, name);
    }
    return rec.refused({ reason: 'missing_capability', detail: 'no device accepted the recipe' });
  }

  async _drive(rec, client, st, name) {
    const exId = st.id;
    const observe = (s) => this.monitor.observe(s, name);
    let ended = false;
    for (let n = 0; n < this.recovery.maxTicks; n++) {
      if (FINAL.has(st.state)) { ended = true; break; }
      await client.advance();
      st = observe(await this._retrying(rec, () => client.getExecution(exId)));
      if (st.state === 'needs_human') {
        const act = await this.recovery.onNeedsHuman(st, this.human);
        rec.recovery.push(act.asDict());
        if (act.kind === RESUME) {
          rec.human.push({ kind: 'confirm', why: act.detail });
          st = observe(await client.resumeExecution(exId, st.seq));
        } else {
          st = observe(await this._retrying(rec, () => client.stopExecution(exId, 'no_person_answered')));
        }
      }
    }
    if (!ended) {
      rec.recovery.push(this.recovery.onStall(st).asDict());
      await this._retrying(rec, () => client.stopExecution(exId, 'stalled'));
      for (let n = 0; n < 20; n++) {
        await client.advance();
        st = observe(await client.getExecution(exId));
        if (FINAL.has(st.state)) break;
      }
    }
    rec.transitions = this.monitor.transitions(exId, name);
    rec.status = st;
    try {
      rec.log = await client.executionLog(exId);
    } catch (e) {
      if (!(e instanceof CookwalaProblem)) throw e;
      rec.log = null;
    }
    const end = this.recovery.onEnd(st, rec.log);
    if (end !== null) {
      rec.recovery.push(end.asDict());
      if (end.kind === DISCARD_AND_REPORT && (end.extra.report ?? true)) {
        rec.incident = incidentFrom(rec);
        try {
          await client.reportIncident(rec.incident);
        } catch (p) {
          if (!(p instanceof CookwalaProblem)) throw p;
          rec.notes.push(`incident not accepted: ${p.message}`);
        }
      }
    }
    rec.anomalies = this.monitor.anomalies.filter((a) => a.execution === exId);
    return rec.finish(st.state, end && end.extra.discard ? 'discard' : st.state === 'completed' ? 'served' : 'not_served');
  }

  async runAll(jobs) {
    const out = [];
    for (const j of jobs) out.push(await this.run(j));
    return out;
  }
}
