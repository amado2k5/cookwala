"""Sample orchestrator: one request, several devices, gates first, recovery throughout, a record at the end.

Orchestrators are optional in Cookwala: a household, a hub or a single device must work without
one (docs/PROTOCOL.md). This one shows the pattern for a kitchen or a fleet:

    order -> planner agent -> gates (no device) -> dry run on every device -> best device
          -> start (the executor checks again) -> poll, monitor, ask people, recover -> log -> report

Ranking prefers the plan that needs the fewest people, then the fewest steps verified only by time.
"""
import time
from dataclasses import dataclass, field

from .agents import MonitorAgent
from .errors import CookwalaProblem
from .gates import GateContext, GatePipeline
from .recovery import RecoveryPolicy, TRY_NEXT_DEVICE, ASK_PRESENCE, RESUME, DISCARD_AND_REPORT, RETRY
from .reporting import RunRecord, incident_from
from .simulator import FINAL

__all__ = ['Job', 'Orchestrator']


@dataclass
class Job:
    id: str
    order: dict = None        # for the planner agent: {dish, servings, allergenBlocks, ...}
    request: dict = None      # or a ready ExecuteRequest ...
    recipe: dict = None       # ... with the recipe it names
    human_present: bool = False
    tags: dict = field(default_factory=dict)


class Orchestrator:
    def __init__(self, devices, planner=None, gates=None, recovery=None, human=None, recalls=None, sleep=time.sleep):
        self.devices = dict(devices)            # name -> HubClient | LocalClient
        self.planner, self.human = planner, human
        self.gates = gates or GatePipeline.default().without('capability')  # the device check happens per device below
        self.recovery = recovery or RecoveryPolicy()
        self.monitor = MonitorAgent()
        self.recall_docs = recalls
        self.sleep = sleep

    def recalls(self):
        if self.recall_docs is not None: return self.recall_docs
        out = []
        for c in self.devices.values():
            try: out.extend(c.recalls() or [])
            except CookwalaProblem: pass
        return out

    def _retrying(self, rec, fn):
        attempt = 0
        while True:
            try:
                return fn()
            except CookwalaProblem as p:
                if p.status != 0: raise
                act = self.recovery.on_transport_error(attempt); rec.recovery.append(act.as_dict())
                if act.kind != RETRY: raise
                self.sleep(act.wait_s); attempt += 1

    def rank(self, recipe, human_present):
        """Dry-run the recipe on every device; accepted plans first, best first."""
        out = []
        for name, c in self.devices.items():
            try:
                dr = c.dry_run(recipe, human_present)
            except CookwalaProblem as p:
                dr = {'state': 'refused', 'refusal': {'reason': 'busy', 'detail': str(p)}, 'plan': []}
            people = sum(1 for p in dr['plan'] if p['verifiedBy'] == 'human')
            timed = sum(1 for p in dr['plan'] if p['verifiedBy'] == 'time')
            out.append((dr['state'] != 'accepted', people, timed, name, dr))
        out.sort(key=lambda t: t[:4])
        return [(name, dr) for *_, name, dr in out]

    def run(self, job):
        rec = RunRecord(job=job.id, tags=dict(job.tags))
        request, recipe = job.request, job.recipe
        if job.order is not None:
            prop = self.planner.propose(job.order)
            rec.notes.extend(prop.notes)
            if not prop.ok:
                return rec.refused({'reason': prop.reason, 'detail': prop.detail, 'gate': 'planner'}, recipe=prop.recipe)
            request, recipe = prop.request, prop.recipe
        rec.request, rec.recipe = request, (recipe or {}).get('id')
        human_present = bool(job.human_present)

        decision = self.gates.run(GateContext(request, recipe, None, human_present, recalls=self.recalls()))
        if not decision.allowed:
            act = self.recovery.on_refusal(decision.refusal, human_present, devices_left=False); rec.recovery.append(act.as_dict())
            if act.kind == ASK_PRESENCE and self.human and self.human.present and self.human.confirm('presence', 'a step may not run unattended; can a person stay in the kitchen?'):
                human_present = True
                rec.human.append({'kind': 'presence', 'why': decision.refusal['detail']})
                decision = self.gates.run(GateContext(request, recipe, None, True, recalls=self.recalls()))
        rec.gates = decision.as_dict()
        rec.findings.extend(decision.findings)
        if not decision.allowed:
            return rec.refused(decision.refusal)

        ranked = self.rank(recipe, human_present)
        for i, (name, dr) in enumerate(ranked):
            client = self.devices[name]
            rec.attempts.append({'device': name, 'dryRun': dr['state'], **({'reason': dr['refusal']['reason']} if dr.get('refusal') else {})})
            if dr['state'] != 'accepted':
                act = self.recovery.on_refusal(dr['refusal'], human_present, devices_left=i + 1 < len(ranked)); rec.recovery.append(act.as_dict())
                if act.kind == TRY_NEXT_DEVICE: continue
                return rec.refused({**dr['refusal'], 'device': name})
            st = self._retrying(rec, lambda: client.start_execution(request, request['idempotencyKey'], human_present))
            self.monitor.observe(st, name)
            if st['state'] == 'refused':  # the executor is the authority; its refusal wins over our dry run
                rec.attempts[-1]['executor'] = 'refused'
                act = self.recovery.on_refusal(st['refusal'], human_present, devices_left=i + 1 < len(ranked)); rec.recovery.append(act.as_dict())
                if act.kind == TRY_NEXT_DEVICE: continue
                return rec.refused({**st['refusal'], 'device': name})
            rec.device = name
            return self._drive(rec, client, st, name)
        return rec.refused({'reason': 'missing_capability', 'detail': 'no device accepted the recipe'})

    def _drive(self, rec, client, st, name):
        ex_id = st['id']
        observe = lambda s: self.monitor.observe(s, name)  # noqa: E731
        for _ in range(self.recovery.max_ticks):
            if st['state'] in FINAL: break
            client.advance()
            st = observe(self._retrying(rec, lambda: client.get_execution(ex_id)))
            if st['state'] == 'needs_human':
                act = self.recovery.on_needs_human(st, self.human); rec.recovery.append(act.as_dict())
                if act.kind == RESUME:
                    rec.human.append({'kind': 'confirm', 'why': act.detail})
                    st = observe(client.resume_execution(ex_id, st['seq']))
                else:
                    st = observe(self._retrying(rec, lambda: client.stop_execution(ex_id, 'no_person_answered')))
        else:
            rec.recovery.append(self.recovery.on_stall(st).as_dict())
            self._retrying(rec, lambda: client.stop_execution(ex_id, 'stalled'))
            for _ in range(20):
                client.advance(); st = observe(client.get_execution(ex_id))
                if st['state'] in FINAL: break
        rec.transitions = self.monitor.transitions(ex_id, name)
        rec.status = st
        try:
            rec.log = client.execution_log(ex_id)
        except CookwalaProblem:
            rec.log = None
        end = self.recovery.on_end(st, rec.log)
        if end is not None:
            rec.recovery.append(end.as_dict())
            if end.kind == DISCARD_AND_REPORT and end.extra.get('report', True):
                rec.incident = incident_from(rec)
                try: client.report_incident(rec.incident)
                except CookwalaProblem as p: rec.notes.append(f'incident not accepted: {p}')
        rec.anomalies = [a for a in self.monitor.anomalies if a['execution'] == ex_id]
        return rec.finish(st['state'], disposition=('discard' if end and end.extra.get('discard') else ('served' if st['state'] == 'completed' else 'not_served')))

    def run_all(self, jobs):
        return [self.run(j) for j in jobs]
