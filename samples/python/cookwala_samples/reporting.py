"""Sample reporting: a record per run, a summary across runs, and four renderings.

JSON for machines, Markdown for people, JUnit XML so a CI system shows each run as a test case,
CSV for spreadsheets. `incident_from` builds an anonymous IncidentReport (Core 6.9): a date and no
names, ids, addresses or exact times.
"""
import csv
import io
import json
import secrets
from dataclasses import dataclass, field
from xml.sax.saxutils import escape, quoteattr

__all__ = ['RunRecord', 'Reporter', 'incident_from']

CATEGORY = {'sensor_fault': 'cw.incident.sensor_failure', 'overheat': 'cw.incident.overheat', 'timeout': 'cw.incident.running_late'}


@dataclass
class RunRecord:
    job: str
    outcome: str = 'pending'          # completed | refused | stopped | failed
    recipe: str = None
    device: str = None
    request: dict = None
    refusal: dict = None
    gates: dict = None
    attempts: list = field(default_factory=list)
    recovery: list = field(default_factory=list)
    human: list = field(default_factory=list)
    findings: list = field(default_factory=list)
    transitions: list = field(default_factory=list)
    anomalies: list = field(default_factory=list)
    notes: list = field(default_factory=list)
    status: dict = None
    log: dict = None
    incident: dict = None
    disposition: str = None           # served | discard | not_served | not_cooked
    tags: dict = field(default_factory=dict)

    def refused(self, refusal, recipe=None):
        self.refusal = refusal
        if recipe is not None and self.recipe is None: self.recipe = recipe.get('id')
        return self.finish('refused', disposition='not_cooked')

    def finish(self, outcome, disposition=None):
        self.outcome, self.disposition = outcome, disposition
        return self

    def as_dict(self):
        d = {k: v for k, v in self.__dict__.items() if v not in (None, [], {})}
        d.pop('request', None)
        if self.request: d['requestId'] = self.request.get('id'); d['requestedBy'] = self.request.get('requestedBy')
        return d


def incident_from(rec, date=None):
    st = rec.status or {}
    fault = st.get('x-sim-fault') or {}
    log = rec.log or {}
    date = date or (log.get('endedAt') or st.get('updatedAt') or '1970-01-01')[:10]
    step = st.get('step') or {}
    # The id is random: an incident must not link back to a job, a household or a device.
    doc = {'core': '0.2.0', 'kind': 'IncidentReport', 'id': f'inc-{date}-{secrets.token_hex(4)}', 'date': date,
           'category': CATEGORY.get(fault.get('kind'), 'cw.incident.equipment_failure' if rec.outcome == 'failed' else 'cw.incident.overheat'),
           'severity': 'medium' if log.get('safetyEvents') else 'low', 'outcome': 'near_miss',
           'description': f"Execution ended {st.get('state', rec.outcome)} during {step.get('op', 'an unknown step')}; " +
                          ('food discarded, no injury.' if log.get('x-heatStarted') else 'no heat had started, no injury.'),
           'contributingFactors': ['sensor_fault'] if fault.get('kind') == 'sensor_fault' else ['other']}
    if step.get('op'): doc['op'] = step['op']
    dev = log.get('device') or {}
    if dev.get('model'): doc['deviceModel'] = dev['model']
    if log.get('safetyEvents'): doc['safetyLimitsFired'] = sorted({e['limit'] for e in log['safetyEvents']})
    return doc


class Reporter:
    def __init__(self, records=None, title='Cookwala sample run'):
        self.records = list(records or [])
        self.title = title

    def add(self, rec):
        self.records.append(rec); return rec

    def summary(self):
        s = {'runs': len(self.records), 'outcomes': {}, 'refusals': {}, 'recoveryActions': {}, 'humanInterventions': 0, 'incidents': 0,
             'untrustedTextFindings': 0, 'anomalies': 0, 'served': 0, 'discarded': 0}
        for r in self.records:
            s['outcomes'][r.outcome] = s['outcomes'].get(r.outcome, 0) + 1
            if r.refusal: s['refusals'][r.refusal['reason']] = s['refusals'].get(r.refusal['reason'], 0) + 1
            for a in r.recovery: s['recoveryActions'][a['action']] = s['recoveryActions'].get(a['action'], 0) + 1
            s['humanInterventions'] += len(r.human); s['incidents'] += bool(r.incident); s['anomalies'] += len(r.anomalies)
            s['untrustedTextFindings'] += sum(1 for f in r.findings if f.get('incident') == 'cw.incident.untrusted_instruction')
            s['served'] += r.disposition == 'served'; s['discarded'] += r.disposition == 'discard'
        return s

    def to_json(self, indent=1):
        return json.dumps({'report': self.title, 'summary': self.summary(), 'runs': [r.as_dict() for r in self.records]}, indent=indent, ensure_ascii=False)

    def to_markdown(self):
        s = self.summary()
        out = [f'# {self.title}', '', f"{s['runs']} runs: " + ', '.join(f'{v} {k}' for k, v in sorted(s['outcomes'].items())) +
               f". Served {s['served']}, discarded {s['discarded']}, incidents reported {s['incidents']}, people asked {s['humanInterventions']} times.", '',
               '| Job | Recipe | Device | Outcome | Why | Recovery | Food |', '|---|---|---|---|---|---|---|']
        for r in self.records:
            why = f"{r.refusal['reason']}: {r.refusal.get('detail', '')}" if r.refusal else ((r.status or {}).get('x-sim-fault') or {}).get('detail', '')
            rec = ', '.join(a['action'] for a in r.recovery) or '-'
            out.append(f"| {r.job} | {r.recipe or '-'} | {r.device or '-'} | {r.outcome} | {why.replace('|', '/') or '-'} | {rec} | {r.disposition or '-'} |")
        if s['untrustedTextFindings']:
            out += ['', f"Untrusted text: {s['untrustedTextFindings']} instruction-like strings were found, ignored and logged (cw.incident.untrusted_instruction)."]
        if s['anomalies']:
            out += ['', f"Monitor anomalies: {s['anomalies']}."]
        out += ['', 'Simulated devices; nothing was cooked. The executor is the authority on every refusal.']
        return '\n'.join(out) + '\n'

    def to_junit(self):
        s = self.summary()
        fails = sum(1 for r in self.records if r.outcome in ('failed',))
        cases = []
        for r in self.records:
            name = quoteattr(f'{r.job} {r.recipe or ""}'.strip())
            body = ''
            if r.outcome == 'failed':
                body = f'<failure message={quoteattr(((r.status or {}).get("x-sim-fault") or {}).get("detail", "failed"))}/>'
            elif r.outcome == 'refused':
                body = f'<skipped message={quoteattr(r.refusal["reason"] + ": " + str(r.refusal.get("detail", "")))}/>'
            brief = {k: v for k, v in r.as_dict().items() if k in ('job', 'outcome', 'device', 'refusal', 'recovery', 'transitions', 'disposition', 'findings')}
            body += f'<system-out>{escape(json.dumps(brief, ensure_ascii=False))}</system-out>'
            cases.append(f'  <testcase classname="cookwala.samples" name={name}>{body}</testcase>')
        return (f'<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name={quoteattr(self.title)} tests="{s["runs"]}" failures="{fails}" '
                f'skipped="{s["outcomes"].get("refused", 0)}">\n' + '\n'.join(cases) + '\n</testsuite>\n')

    def to_csv(self):
        buf = io.StringIO(); w = csv.writer(buf)
        w.writerow(['job', 'recipe', 'device', 'outcome', 'refusal', 'recovery', 'disposition', 'human', 'incident'])
        for r in self.records:
            w.writerow([r.job, r.recipe or '', r.device or '', r.outcome, (r.refusal or {}).get('reason', ''), ' '.join(a['action'] for a in r.recovery),
                        r.disposition or '', len(r.human), (r.incident or {}).get('category', '')])
        return buf.getvalue()

    def render(self, fmt):
        return {'json': self.to_json, 'markdown': self.to_markdown, 'md': self.to_markdown, 'junit': self.to_junit, 'csv': self.to_csv}[fmt]()
