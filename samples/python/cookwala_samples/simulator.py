"""A simulated executor that serves the Core 0.2 API in process, so every sample runs offline.

The dry run is a port of tools/cookwala_ref.py `dry_run` working from the bundled vocabulary; the
tests check it gives the reference answer for every bundled recipe and device. Executions advance
one transition per `tick()`, deterministically, so samples and tests need no clock or threads.

Faults can be injected per step to exercise recovery: `sensor_fault` fails the execution when the
step starts, `timeout` pauses it in needs_human (the step's onTimeout), `overheat` fires a local
safety limit, which cuts heat and stops the execution. No request field can change a limit.
"""
import datetime as dt
import math

from .data import load_bundle, recipe_by_ref, recipe_allergens
from .errors import problem
from .jcs import doc_hash

FINAL = {'refused', 'stopped', 'completed', 'failed'}
TRANSITIONS = {'accepted': {'preparing', 'refused', 'stopped'}, 'preparing': {'running', 'needs_human', 'stopping', 'failed'},
               'running': {'paused', 'needs_human', 'stopping', 'completed', 'failed'}, 'paused': {'running', 'stopping'},
               'needs_human': {'running', 'stopping', 'failed'}, 'stopping': {'stopped'}}


def transition_allowed(frm, to):
    return to in TRANSITIONS.get(frm, set())


def _time(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def _finite(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def trusted_sensors(capabilities, now=None):
    """Sensors that may satisfy a ladder rung (RFC-0011): state ok and calibration not expired."""
    t = _time(now) if isinstance(now, str) else (now or dt.datetime.now(dt.timezone.utc))
    out = set()
    for s in capabilities.get('capabilities', {}).get('sensors', []):
        if s.get('state', 'ok') != 'ok': continue
        vu = (s.get('calibration') or {}).get('validUntil')
        if vu and t > _time(vu): continue
        out.add(s['sensor']); out.update(s.get('visionCues', []))
    return out


def ladder_choice(op_id, sensors, allow_model=True, human_present=False, ops=None):
    env = (ops or load_bundle()['ops']).get(op_id, {}).get('envelope', {})
    for rung in env.get('sensorLadder', ['time']):
        if rung == 'model' and allow_model: return 'model'
        if rung == 'time': return 'time'
        if rung == 'human' and human_present: return 'human'
        if rung in sensors: return rung
    return None


def check_node_params(op_id, node, limits=None, ops=None, heat_bands=None):
    """(reason, detail) when a step's numbers break the envelope or a local limit, else None."""
    b = load_bundle()
    ops = ops or b['ops']; heat_bands = heat_bands or b['heatBands']
    env = ops.get(op_id, {}).get('envelope') or {}
    params = node.get('params') or {}
    temps = [(k, params[k]) for k in ('tempC', 'oilTempC') if k in params]
    tgt = params.get('target') or node.get('target')
    if isinstance(tgt, dict) and 'value' in tgt and tgt.get('unit', 'degC') in ('degC', 'C'):
        temps.append(('target', tgt['value']))
    for key, t in temps:
        if not _finite(t): return 'envelope_out_of_range', f'{key} is not a finite number'
    band = env.get('tempC')
    if band:
        for key, t in temps:
            if t < band['min'] or t > band['max']:
                return 'envelope_out_of_range', f'{key} {t:g} °C is outside the {op_id} envelope {band["min"]}–{band["max"]} °C'
        heat = params.get('heat')
        if env.get('medium') == 'pan_surface' and isinstance(heat, str) and heat in heat_bands:
            hb = heat_bands[heat]
            if hb['max'] < band['min'] or hb['min'] > band['max']:
                return 'envelope_out_of_range', f'heat level {heat} (pan {hb["min"]}–{hb["max"]} °C) cannot hold the {op_id} envelope {band["min"]}–{band["max"]} °C'
    pk = params.get('pressureKPa')
    if pk is not None:
        if not _finite(pk): return 'envelope_out_of_range', 'pressureKPa is not a finite number'
        pb = env.get('pressureKPa')
        if pb and (pk < pb['min'] or pk > pb['max']):
            return 'envelope_out_of_range', f'pressure {pk:g} kPa is outside the {op_id} envelope {pb["min"]}–{pb["max"]} kPa'
    for lim in (limits or {}).get('limits', []):
        applies = lim.get('appliesTo', {})
        if applies.get('ops') and op_id not in applies['ops']: continue
        if applies.get('medium') and applies['medium'] != env.get('medium'): continue
        if not applies.get('ops') and not applies.get('medium'): continue
        if lim.get('kind') == 'max_temp' and lim.get('unit') == 'degC':
            for key, t in temps:
                if t > lim['max']: return 'safety_limit', f'{key} {t:g} °C exceeds local limit {lim["id"]} ({lim["max"]} °C)'
        if lim.get('kind') == 'pressure' and pk is not None and pk > lim.get('max', float('inf')):
            return 'safety_limit', f'pressure {pk:g} kPa exceeds local limit {lim["id"]} ({lim["max"]} kPa)'
    return None


def dry_run(recipe, capabilities, human_present=False, allow_model=True, limits=None, now=None):
    """Can this device cook every step? {'state': accepted|refused, 'plan': [...], 'refusal'?}. Nothing runs."""
    ops = load_bundle()['ops']
    caps = capabilities.get('capabilities', {})
    can = {o['op'] for o in caps.get('ops', []) if ops.get(o['op'], {}).get('executable', True) is not False}
    sensors = trusted_sensors(capabilities, now)
    plan = []
    for node in recipe.get('process', {}).get('nodes', []):
        op = node['op']
        assign = node.get('assignment', {}).get('allowed', ['any'])
        if op not in can:
            if human_present and ('human' in assign or 'any' in assign):
                plan.append({'node': node['id'], 'op': op, 'by': 'human', 'verifiedBy': 'human'}); continue
            return {'state': 'refused', 'refusal': {'reason': 'missing_capability', 'node': node['id'], 'detail': f'device cannot perform {op} and no person is present to do it'}, 'plan': plan}
        bad = check_node_params(op, node, limits, ops)
        if bad:
            return {'state': 'refused', 'refusal': {'reason': bad[0], 'node': node['id'], 'detail': bad[1]}, 'plan': plan}
        env = ops.get(op, {}).get('envelope', {})
        if env and not env.get('unattended', True) and not human_present:
            return {'state': 'refused', 'refusal': {'reason': 'needs_human_present', 'node': node['id'], 'detail': f'{op} may not run unattended'}, 'plan': plan}
        rung = ladder_choice(op, sensors, allow_model, human_present, ops) if env else 'time'
        if rung is None:
            return {'state': 'refused', 'refusal': {'reason': 'missing_sensor_no_fallback', 'node': node['id'], 'detail': f'no way to verify {op} on this device'}, 'plan': plan}
        plan.append({'node': node['id'], 'op': op, 'by': 'device', 'verifiedBy': 'sensor' if rung.startswith(('cw.', 'x-')) else rung, 'rung': rung})
    return {'state': 'accepted', 'plan': plan}


def _iso(t):
    return t.strftime('%Y-%m-%dT%H:%M:%SZ')


class SimulatedExecutor:
    """One simulated device behind the Core API. Not a safety case: a test bed for the samples."""

    def __init__(self, capabilities, limits=None, recipes=None, recalls=None, faults=None, now=None, clock_step_s=60, busy=0):
        b = load_bundle()
        self.caps = capabilities
        self.limits = limits or b['safetyLimits']
        self.recipes = recipes if recipes is not None else b['recipes']
        self.recall_docs = list(recalls or [])
        self.faults = dict(faults or {})  # 'node' or 'recipe-id#node' -> sensor_fault | timeout | overheat
        self.now = _time(now or b['now'])
        self.clock_step = dt.timedelta(seconds=clock_step_s)
        self.executions = {}
        self.idem = {}
        self.incidents = []
        self.busy = busy  # refuse the next `busy` starts with reason busy (another pot is on this device)

    @classmethod
    def from_bundle(cls, device, **kw):
        return cls(load_bundle()['devices'][device], **kw)

    # ---- Core API
    def capabilities(self): return self.caps
    def safety_limits(self): return self.limits
    def recalls(self): return list(self.recall_docs)

    def start_execution(self, req, idempotency_key, human_present=False):
        if not idempotency_key or len(idempotency_key) < 8:
            raise problem(400, 'missing-idempotency-key', 'Idempotency-Key header (8..128 chars) is required on every POST')
        if idempotency_key in self.idem:
            return dict(self.executions[self.idem[idempotency_key]]['status'])
        for k in ('core', 'kind', 'id', 'recipe', 'recipeHash', 'requestedBy', 'idempotencyKey'):
            if k not in req: raise problem(400, 'invalid-request', f'missing {k}')
        if not str(req['core']).startswith('0.2.'): raise problem(400, 'unsupported-version', refusal='unsupported_version')
        if req['id'] in self.executions: raise problem(409, 'conflict', 'execution id already exists')
        st = {'core': '0.2.0', 'kind': 'ExecutionStatus', 'id': req['id'], 'seq': 0, 'state': 'accepted', 'request': req['id'], 'updatedAt': _iso(self.now)}
        self.idem[idempotency_key] = req['id']
        recipe = recipe_by_ref(self.recipes, req['recipe'])
        refusal = self._precheck(req, recipe)
        if refusal is None and self.busy > 0:
            self.busy -= 1; refusal = {'reason': 'busy', 'detail': 'this device is cooking something else'}
        if refusal is None:
            dry = dry_run(recipe, self.caps, human_present, True, self.limits, _iso(self.now))
            refusal = dry.get('refusal')
        if refusal:
            st.update({'state': 'refused', 'refusal': refusal})
            self.executions[req['id']] = {'status': st, 'final': True}
            return dict(st)
        st['x-sim-plan'] = dry['plan']
        self.executions[req['id']] = {'status': st, 'req': req, 'recipe': recipe, 'plan': dry['plan'], 'step': -1, 'steps': [], 'safety': [],
                                      'human': [], 'startedAt': self.now, 'heated': False}
        return dict(st)

    def _precheck(self, req, recipe):
        if recipe is None:
            return {'reason': 'missing_capability', 'detail': "recipe not found in this executor's catalog"}
        if doc_hash(recipe) != req['recipeHash']:
            return {'reason': 'recipe_hash_mismatch', 'detail': f'this executor holds {doc_hash(recipe)}'}
        for rc in self.recall_docs:
            for t in rc.get('targets', []):
                if recipe_by_ref({'r': recipe}, t.get('ref', '')) is not None and (t.get('allRevisions') or t.get('revision') == recipe.get('revision')):
                    return {'reason': 'recipe_recalled', 'detail': f"recall {rc.get('id')} is in force"}
        mandate = req.get('mandate')
        if mandate and 'start_cooking' not in mandate.get('scopes', []):
            return {'reason': 'mandate_scope', 'detail': 'the agent mandate lacks start_cooking'}
        if mandate and mandate.get('expires') and _time(mandate['expires']) <= self.now:
            return {'reason': 'mandate_scope', 'detail': 'the agent mandate has expired'}
        blocks = set(req.get('allergenBlocks', [])) & recipe_allergens(recipe)
        if blocks:
            return {'reason': 'allergen_block', 'detail': f'recipe contains blocked allergen(s): {sorted(blocks)}'}
        return None

    def _get(self, execution_id):
        ex = self.executions.get(execution_id)
        if not ex: raise problem(404, 'not-found')
        return ex

    def get_execution(self, execution_id):
        return dict(self._get(execution_id)['status'])

    def stop_execution(self, execution_id, reason='requested'):
        """Never refused once the caller reaches the executor (Core 6.2); no If-Match, no token."""
        ex = self._get(execution_id); st = ex['status']
        if st['state'] not in FINAL and st['state'] != 'stopping':
            self._set(ex, 'stopping'); ex['stopReason'] = reason
        return dict(st)

    def resume_execution(self, execution_id, seq):
        ex = self._get(execution_id); st = ex['status']
        if seq is None: raise problem(428, 'if-match-required')
        if str(seq).strip('"') != str(st['seq']): raise problem(412, 'precondition-failed', f"seq is {st['seq']}")
        if st['state'] in ('paused', 'needs_human'):
            ex['human'].append({'kind': 'confirm', 'minutes': 1}); st.pop('humanNeeded', None)
            self._set(ex, 'running')
        return dict(st)

    def execution_log(self, execution_id):
        ex = self._get(execution_id)
        if not ex.get('final') or not ex.get('log'): raise problem(404, 'not-found', 'the log exists once the execution has ended')
        return ex['log']

    def report_incident(self, doc):
        for k in ('core', 'kind', 'id', 'date', 'category', 'severity', 'description'):
            if k not in doc: raise problem(400, 'invalid-request', f'not a valid IncidentReport: missing {k}')
        self.incidents.append(doc); return {'received': True}

    # ---- the clock
    def tick(self):
        """Advance every running execution by one transition and the clock by one step."""
        self.now += self.clock_step
        for ex in self.executions.values():
            if not ex.get('final'): self._advance(ex)

    def _set(self, ex, state):
        st = ex['status']
        assert transition_allowed(st['state'], state), f"{st['state']} -> {state}"
        st['seq'] += 1; st['state'] = state; st['updatedAt'] = _iso(self.now)

    def _advance(self, ex):
        st = ex['status']; state = st['state']
        if state == 'stopping':
            self._set(ex, 'stopped'); self._finish(ex, 'aborted_safe'); return
        if state == 'accepted':
            self._set(ex, 'preparing'); return
        if state == 'preparing':
            self._set(ex, 'running'); self._enter(ex, 0); return
        if state != 'running':
            return
        self._close(ex)
        if ex['step'] + 1 >= len(ex['plan']):
            self._set(ex, 'completed'); self._finish(ex, 'served')
        else:
            self._enter(ex, ex['step'] + 1)

    def _enter(self, ex, i):
        ex['step'] = i; p = ex['plan'][i]; st = ex['status']
        st['step'] = {'node': p['node'], 'op': p['op'], 'startedAt': _iso(self.now), 'progress': 0, 'verifiedBy': p['verifiedBy']}
        env = load_bundle()['ops'].get(p['op'], {}).get('envelope', {})
        if env.get('tempC', {}).get('max', 0) > 60: ex['heated'] = True  # a hot step started; chilling does not count
        fault = self.faults.get(f"{ex['recipe']['id']}#{p['node']}") or self.faults.get(p['node'])
        if fault == 'sensor_fault':
            st['x-sim-fault'] = {'node': p['node'], 'kind': 'sensor_fault', 'detail': f"the sensor for {p['op']} stopped reporting"}
            self._set(ex, 'failed'); self._finish(ex, 'failed'); return
        if fault == 'overheat':
            lim = self._limit_for(p['op'], env)
            ex['safety'].append({'limit': lim['id'], 'action': lim.get('action', 'cut_heat'), 'node': p['node'], 'at': _iso(self.now)})
            st['x-sim-fault'] = {'node': p['node'], 'kind': 'overheat', 'detail': f"local safety limit {lim['id']} fired ({lim.get('action', 'cut_heat')}) during {p['op']}"}
            self._set(ex, 'stopping'); ex['stopReason'] = 'safety_limit'; return
        if fault == 'timeout':
            self._set(ex, 'needs_human'); st['humanNeeded'] = {'why': f"{p['op']} reached its maxTime; onTimeout asks a person"}; return
        if p['by'] == 'human':
            self._set(ex, 'needs_human'); st['humanNeeded'] = {'why': f"a person performs {p['op']}"}
        elif p['verifiedBy'] == 'human':
            self._set(ex, 'needs_human'); st['humanNeeded'] = {'why': f"a person confirms {p['op']} is done"}
        else:
            st.pop('humanNeeded', None)

    def _limit_for(self, op, env):
        for lim in self.limits.get('limits', []):
            a = lim.get('appliesTo', {})
            if lim.get('kind') == 'max_temp' and (op in a.get('ops', []) or (a.get('medium') and a.get('medium') == env.get('medium'))):
                return lim
        return {'id': 'x-sim.max_temp', 'action': 'cut_heat'}

    def _close(self, ex):
        p = ex['plan'][ex['step']]
        ex['steps'].append({'node': p['node'], 'op': p['op'], 'verifiedBy': p['verifiedBy'], 'envelopeOk': True, 'endedAt': _iso(self.now)})
        ex['status']['step']['progress'] = 1

    def _finish(self, ex, outcome):
        ex['final'] = True
        if 'req' not in ex: return
        req, actor = ex['req'], self.caps.get('actor', {})
        ex['log'] = {'core': '0.2.0', 'kind': 'ExecutionLog', 'id': f"log-{req['id']}", 'recipe': req['recipe'], 'recipeHash': req['recipeHash'],
                     'device': {'vendor': actor.get('vendor', 'simulated'), 'model': actor.get('model', 'simulated'), 'firmware': 'samples-sim-0.1',
                                'safetyLimits': f"{self.limits['id']}@{self.limits['version']}"},
                     'startedAt': _iso(ex['startedAt']), 'endedAt': _iso(self.now), 'outcome': outcome,
                     'servings': req.get('servings', ex['recipe'].get('yield', {}).get('servings', 1)), 'steps': ex['steps'],
                     'safetyEvents': ex['safety'], 'humanInterventions': ex['human'], 'x-heatStarted': ex['heated'],
                     'consent': {'dataset': 'none', 'withdrawable': True}, 'privacy': {'personalData': 'none', 'timePrecision': 'day'}}
