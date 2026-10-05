// Sample reporting: a record per run, a summary across runs, and four renderings.
//
// JSON for machines, Markdown for people, JUnit XML so a CI system shows each run as a test case,
// CSV for spreadsheets. `incidentFrom` builds an anonymous IncidentReport (Core 6.9): a date and no
// names, ids, addresses or exact times.
import { randomBytes } from 'node:crypto';
import { get, pyStr, pyDumps, xmlEscape, quoteattr, csvRow, sorted, KeyError } from './util.js';

export const CATEGORY = { sensor_fault: 'cw.incident.sensor_failure', overheat: 'cw.incident.overheat', timeout: 'cw.incident.running_late' };

const FIELDS = ['job', 'outcome', 'recipe', 'device', 'request', 'refusal', 'gates', 'attempts', 'recovery', 'human', 'findings', 'transitions',
  'anomalies', 'notes', 'status', 'log', 'incident', 'disposition', 'tags'];

const empty = (v) => v === null || v === undefined || (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype && Object.keys(v).length === 0);

export class RunRecord {
  constructor(job, init = {}) {
    this.job = job;
    this.outcome = 'pending'; // completed | refused | stopped | failed
    this.recipe = null;
    this.device = null;
    this.request = null;
    this.refusal = null;
    this.gates = null;
    this.attempts = [];
    this.recovery = [];
    this.human = [];
    this.findings = [];
    this.transitions = [];
    this.anomalies = [];
    this.notes = [];
    this.status = null;
    this.log = null;
    this.incident = null;
    this.disposition = null; // served | discard | not_served | not_cooked
    this.tags = {};
    Object.assign(this, init);
  }

  refused(refusal, recipe = null) {
    this.refusal = refusal;
    if (recipe !== null && recipe !== undefined && this.recipe === null) this.recipe = recipe.id ?? null;
    return this.finish('refused', 'not_cooked');
  }

  finish(outcome, disposition = null) {
    this.outcome = outcome;
    this.disposition = disposition;
    return this;
  }

  asDict() {
    const d = {};
    for (const k of FIELDS) if (k !== 'request' && !empty(this[k])) d[k] = this[k];
    if (this.request && Object.keys(this.request).length) {
      d.requestId = this.request.id ?? null;
      d.requestedBy = this.request.requestedBy ?? null;
    }
    return d;
  }

  toJSON() {
    return this.asDict();
  }
}

export function incidentFrom(rec, date = null) {
  const st = rec.status || {};
  const fault = st['x-sim-fault'] || {};
  const log = rec.log || {};
  date = date || (log.endedAt || st.updatedAt || '1970-01-01').slice(0, 10);
  const step = st.step || {};
  // The id is random: an incident must not link back to a job, a household or a device.
  const doc = {
    core: '0.2.0', kind: 'IncidentReport', id: `inc-${date}-${randomBytes(4).toString('hex')}`, date,
    category: get(CATEGORY, fault.kind, rec.outcome === 'failed' ? 'cw.incident.equipment_failure' : 'cw.incident.overheat'),
    severity: log.safetyEvents?.length ? 'medium' : 'low', outcome: 'near_miss',
    description: `Execution ended ${pyStr(get(st, 'state', rec.outcome))} during ${pyStr(get(step, 'op', 'an unknown step'))}; ` +
      (log['x-heatStarted'] ? 'food discarded, no injury.' : 'no heat had started, no injury.'),
    contributingFactors: fault.kind === 'sensor_fault' ? ['sensor_fault'] : ['other'],
  };
  if (step.op) doc.op = step.op;
  const dev = log.device || {};
  if (dev.model) doc.deviceModel = dev.model;
  if (log.safetyEvents?.length) doc.safetyLimitsFired = sorted(new Set(log.safetyEvents.map((e) => e.limit)));
  return doc;
}

const bump = (o, k) => { o[k] = (o[k] ?? 0) + 1; };

export class Reporter {
  constructor(records = null, title = 'Cookwala sample run') {
    this.records = [...(records || [])];
    this.title = title;
  }

  add(rec) {
    this.records.push(rec);
    return rec;
  }

  summary() {
    const s = { runs: this.records.length, outcomes: {}, refusals: {}, recoveryActions: {}, humanInterventions: 0, incidents: 0,
      untrustedTextFindings: 0, anomalies: 0, served: 0, discarded: 0 };
    for (const r of this.records) {
      bump(s.outcomes, r.outcome);
      if (r.refusal) bump(s.refusals, r.refusal.reason);
      for (const a of r.recovery) bump(s.recoveryActions, a.action);
      s.humanInterventions += r.human.length;
      s.incidents += r.incident && Object.keys(r.incident).length ? 1 : 0;
      s.anomalies += r.anomalies.length;
      s.untrustedTextFindings += r.findings.filter((f) => f.incident === 'cw.incident.untrusted_instruction').length;
      s.served += r.disposition === 'served' ? 1 : 0;
      s.discarded += r.disposition === 'discard' ? 1 : 0;
    }
    return s;
  }

  toJson(indent = 1) {
    return pyDumps({ report: this.title, summary: this.summary(), runs: this.records.map((r) => r.asDict()) }, indent);
  }

  toMarkdown() {
    const s = this.summary();
    const out = [`# ${this.title}`, '',
      `${s.runs} runs: ` + sorted(Object.keys(s.outcomes)).map((k) => `${s.outcomes[k]} ${k}`).join(', ') +
      `. Served ${s.served}, discarded ${s.discarded}, incidents reported ${s.incidents}, people asked ${s.humanInterventions} times.`, '',
      '| Job | Recipe | Device | Outcome | Why | Recovery | Food |', '|---|---|---|---|---|---|---|'];
    for (const r of this.records) {
      const why = r.refusal ? `${pyStr(r.refusal.reason)}: ${pyStr(get(r.refusal, 'detail', ''))}` : pyStr(get((r.status || {})['x-sim-fault'] || {}, 'detail', ''));
      const rec = r.recovery.map((a) => a.action).join(', ') || '-';
      out.push(`| ${r.job} | ${r.recipe || '-'} | ${r.device || '-'} | ${r.outcome} | ${why.replaceAll('|', '/') || '-'} | ${rec} | ${r.disposition || '-'} |`);
    }
    if (s.untrustedTextFindings) {
      out.push('', `Untrusted text: ${s.untrustedTextFindings} instruction-like strings were found, ignored and logged (cw.incident.untrusted_instruction).`);
    }
    if (s.anomalies) out.push('', `Monitor anomalies: ${s.anomalies}.`);
    out.push('', 'Simulated devices; nothing was cooked. The executor is the authority on every refusal.');
    return out.join('\n') + '\n';
  }

  toJunit() {
    const s = this.summary();
    const fails = this.records.filter((r) => r.outcome === 'failed').length;
    const keep = ['job', 'outcome', 'device', 'refusal', 'recovery', 'transitions', 'disposition', 'findings'];
    const cases = this.records.map((r) => {
      const name = quoteattr(`${r.job} ${r.recipe || ''}`.trim());
      let body = '';
      if (r.outcome === 'failed') body = `<failure message=${quoteattr(pyStr(get((r.status || {})['x-sim-fault'] || {}, 'detail', 'failed')))}/>`;
      else if (r.outcome === 'refused') body = `<skipped message=${quoteattr(r.refusal.reason + ': ' + pyStr(get(r.refusal, 'detail', '')))}/>`;
      const brief = Object.fromEntries(Object.entries(r.asDict()).filter(([k]) => keep.includes(k)));
      body += `<system-out>${xmlEscape(pyDumps(brief))}</system-out>`;
      return `  <testcase classname="cookwala.samples" name=${name}>${body}</testcase>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name=${quoteattr(this.title)} tests="${s.runs}" failures="${fails}" ` +
      `skipped="${s.outcomes.refused ?? 0}">\n` + cases.join('\n') + '\n</testsuite>\n';
  }

  toCsv() {
    let out = csvRow(['job', 'recipe', 'device', 'outcome', 'refusal', 'recovery', 'disposition', 'human', 'incident']);
    for (const r of this.records) {
      out += csvRow([r.job, r.recipe || '', r.device || '', r.outcome, get(r.refusal || {}, 'reason', ''), r.recovery.map((a) => a.action).join(' '),
        r.disposition || '', r.human.length, get(r.incident || {}, 'category', '')]);
    }
    return out;
  }

  render(fmt) {
    const f = { json: () => this.toJson(), markdown: () => this.toMarkdown(), md: () => this.toMarkdown(), junit: () => this.toJunit(), csv: () => this.toCsv() }[fmt];
    if (!f) throw new KeyError(fmt);
    return f();
  }
}
