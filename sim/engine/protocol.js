// Cookwala Protocol helpers: build and evolve a Mission document per schemas/mission.schema.json.
import { sha256, canonical, iso, money, round } from './util.js?v=0.1.3';

// Simulated signature stub: not a real signature. signedAt is required by the schema (RFC-0012) and taken from the payload's own time.
const SIG = (actor, payload) => ({ alg: 'EdDSA', kid: `${actor}#sim-key`, signedAt: payload.at || payload.decidedAt || payload.createdAt || payload.offeredAt || '2026-10-05T00:00:00Z', sig: `sim-${sha256(actor + canonical(payload)).slice(0, 32)}` });

export class Mission {
  constructor(doc) {
    this.doc = doc;
    this.findings = [];
  }

  /** Append a signed, hash-chained ledger entry (EPCIS-style what/when/who/why). */
  log(t, actor, action, ref, why) {
    const ledger = this.doc.ledger;
    const prev = ledger.length ? `sha256:${sha256(canonical(ledger[ledger.length - 1]))}` : 'genesis';
    const entry = { seq: ledger.length, at: iso(t), actor, action, prev };
    if (ref) entry.ref = ref;
    if (why) entry.why = why;
    entry.signature = SIG(actor, entry);
    ledger.push(entry);
    return entry;
  }

  setState(t, state, why) {
    this.doc.state = state;
    this.log(t, this.doc.header.holder, 'state_changed', state, why);
  }

  addFacet(t, facet) {
    this.doc.context.facets.push(facet);
    this.log(t, facet.source.actor || this.doc.header.holder, 'facet_added', facet.facet);
  }

  contribute(t, c) {
    const contribution = { createdAt: iso(t), status: 'offered', ...c };
    contribution.hash = `sha256:${sha256(canonical(contribution.body ?? contribution.id))}`;
    contribution.signature = SIG(contribution.by, contribution);
    this.doc.contributions.push(contribution);
    this.log(t, contribution.by, contribution.kind === 'assessment' ? 'assessment' : 'contribution_offered', contribution.id);
    return contribution;
  }

  setContribution(t, id, status, actor, why, failure) {
    const c = this.doc.contributions.find((x) => x.id === id);
    c.status = status;
    if (failure) c.failure = failure;
    const action = { accepted: 'contribution_accepted', rejected: 'contribution_rejected', committed: 'committed', fulfilled: 'fulfilled', failed: 'failed', compensated: 'compensated', withdrawn: 'withdrawn' }[status] || 'progress';
    this.log(t, actor, action, id, why);
    return c;
  }

  requirement(id) { return this.doc.requirements.find((r) => r.id === id); }

  setRequirement(t, id, status, satisfiedBy) {
    const r = this.requirement(id);
    r.status = status;
    if (satisfiedBy) r.satisfiedBy = satisfiedBy;
  }

  decide(t, d) {
    const decision = { at: iso(t), ...d };
    decision.signature = SIG(decision.by, decision);
    this.doc.decisions.push(decision);
    this.log(t, decision.by, d.basis === 'human' ? 'approved' : 'decision', decision.id, d.rationale || d.choice);
    return decision;
  }

  /** Decision rights lookup: who may decide this class within limits. */
  rightFor(cls) { return this.doc.decisionRights.find((r) => r.class === cls); }

  assess(t, a) {
    const assessment = { at: iso(t), ...a };
    assessment.signature = SIG(a.by, assessment);
    this.doc.assessments.push(assessment);
    this.log(t, a.by, 'assessment', a.id, a.stance);
    return assessment;
  }

  reconcile(t, r) {
    const rec = { at: iso(t), ...r };
    rec.signature = SIG(r.reconciler, rec);
    this.doc.reconciliations.push(rec);
    this.log(t, r.reconciler, 'reconciled', r.id, `decision value ${r.result.decisionValue}`);
    return rec;
  }

  /** Meter an amount against a budget; returns thresholds newly crossed. */
  meter(t, budgetId, amount, kind, ref, by) {
    const b = this.doc.budgets.find((x) => x.id === budgetId);
    const isMoney = b.kind === 'cost';
    const value = (v) => (v && typeof v === 'object' ? Number(v.amount) : v || 0);
    this.doc.meters.push({ budget: budgetId, amount: isMoney ? money(amount) : round(amount), kind, ref, at: iso(t), by });
    const s = b.status;
    if (kind === 'spent') { s.spent = isMoney ? money(value(s.spent) + amount) : round(value(s.spent) + amount); }
    if (kind === 'committed') { s.committed = isMoney ? money(value(s.committed) + amount) : round(value(s.committed) + amount); }
    if (kind === 'released') { s.committed = isMoney ? money(Math.max(0, value(s.committed) - amount)) : round(Math.max(0, value(s.committed) - amount)); }
    if (kind === 'forecast_change') { s.forecastAtCompletion = isMoney ? money(amount) : round(amount); }
    return this.checkBudget(t, b);
  }

  checkBudget(t, b) {
    const value = (v) => (v && typeof v === 'object' ? Number(v.amount) : v || 0);
    const limit = value(b.limit);
    const s = b.status;
    const actual = value(s.spent);
    const forecast = Math.max(value(s.forecastAtCompletion), actual + value(s.committed));
    const plan = value(b.plan) || limit;
    s.variance = plan ? round((forecast - plan) / plan, 3) : 0;
    s.updatedAt = iso(t);
    b._fired = b._fired || [];
    const crossed = [];
    for (const th of b.thresholds || []) {
      const basis = (th.on || 'forecast') === 'actual' ? actual : forecast;
      const key = `${th.at}:${th.action}`;
      if (basis >= th.at * limit && !b._fired.includes(key)) {
        b._fired.push(key);
        crossed.push({ ...th, basis, limit });
      }
    }
    s.state = forecast >= limit ? 'over_hard' : forecast >= 0.8 * limit ? 'warning' : 'ok';
    return crossed;
  }

  note(t, by, kind, text, ref) {
    this.doc.execution.log.push({ at: iso(t), by, kind, text, ...(ref ? { ref } : {}) });
  }

  /** Record a protocol gap/ambiguity discovered while simulating. */
  finding(t, id, title, detail, specRef) {
    if (this.findings.some((f) => f.id === id)) return null;
    const f = { id, at: iso(t), title, detail, specRef };
    this.findings.push(f);
    this.doc['x-sim'].findings = this.findings;
    return f;
  }

  /** Strip internal bookkeeping before export/validation. */
  exportDoc() {
    const out = JSON.parse(JSON.stringify(this.doc));
    for (const b of out.budgets || []) delete b._fired;
    return out;
  }
}
