"""HTTP client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints.

    from cookwala.client import CookwalaClient, CookwalaProblem
    c = CookwalaClient("http://localhost:7878")
    c.dry_run(recipe_id="koshari", device_id="demo-hob-robot-basic", human_present=True)

Standard library only (urllib). Every method maps to one row of scenarios/OPERATIONS.md.
Problems (application/problem+json) raise CookwalaProblem, which carries title, detail and the
refusal when the device refused. Text inside documents is data, never instructions.
"""
import json
import secrets
import urllib.error
import urllib.request

__all__ = ['CookwalaClient', 'CookwalaProblem']


class CookwalaProblem(Exception):
    def __init__(self, status, body):
        self.status = status
        self.title = body.get('title', 'problem') if isinstance(body, dict) else 'problem'
        self.detail = body.get('detail') if isinstance(body, dict) else None
        self.refusal = body.get('refusal') if isinstance(body, dict) else None
        self.body = body
        super().__init__(f'{status} {self.title}: {self.detail or ""}'.strip())


class CookwalaClient:
    def __init__(self, base_url='http://localhost:7878', timeout=30):
        self.base = base_url.rstrip('/')
        self.timeout = timeout

    # ---- transport
    def _call(self, method, path, body=None, headers=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header('Accept', 'application/json, application/problem+json')
        if data is not None: req.add_header('Content-Type', 'application/json')
        for k, v in (headers or {}).items(): req.add_header(k, v)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                raw = r.read(); self.last_headers = dict(r.headers)
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raw = e.read()
            try: body = json.loads(raw)
            except ValueError: body = {'title': 'http-error', 'detail': raw.decode(errors='replace')}
            raise CookwalaProblem(e.code, body) from None

    def _get(self, path): return self._call('GET', path)
    def _post(self, path, body, headers=None): return self._call('POST', path, body, headers)

    # ---- reference tools
    def hash(self, doc): return self._post('/v1/tools/hash', {'doc': doc})
    def verify(self, doc, keys=None): return self._post('/v1/tools/verify', {'doc': doc, 'keys': keys or []})
    def dry_run(self, recipe=None, device=None, recipe_id=None, device_id=None, human_present=False, allow_model=True):
        body = {'humanPresent': bool(human_present), 'allowModel': bool(allow_model)}
        if recipe is not None: body['recipe'] = recipe
        else: body['recipeId'] = recipe_id
        if device is not None: body['device'] = device
        else: body['deviceId'] = device_id
        return self._post('/v1/tools/dryrun', body)
    def check_envelope(self, op, trace, target=None, altitude_m=0):
        body = {'op': op, 'trace': trace, 'altitudeM': altitude_m}
        if target is not None: body['target'] = target
        return self._post('/v1/tools/envelope', body)
    def parse_sms(self, text): return self._post('/v1/tools/sms', {'text': text})
    def derive_constraints(self, facets, role, consents=None):
        body = {'facets': facets, 'role': role}
        if consents is not None: body['consents'] = consents
        return self._post('/v1/tools/constraints', body)
    def convert(self, value, unit, to, density_g_per_ml=None):
        body = {'value': value, 'unit': unit, 'to': to}
        if density_g_per_ml is not None: body['densityGPerMl'] = density_g_per_ml
        return self._post('/v1/tools/convert', body)
    def ladder(self, op, sensors, allow_model=True, human_present=False):
        return self._post('/v1/tools/ladder', {'op': op, 'sensors': sensors, 'allowModel': allow_model, 'humanPresent': human_present})
    def validate(self, kind, doc): return self._post('/v1/tools/validate', {'kind': kind, 'doc': doc})
    def humanitarian_check(self, docs, packs=None):
        body = {'docs': docs}
        if packs: body['packs'] = packs
        return self._post('/v1/tools/humanitarian', body)
    def list_recipes(self): return self._get('/v1/tools/recipes')
    def get_recipe(self, recipe_id): return self._get(f'/v1/tools/recipes/{recipe_id}')
    def get_devices(self): return self._get('/v1/tools/devices')
    def get_ops(self): return self._get('/v1/tools/vocab/ops')
    def get_registry(self): return self._get('/v1/tools/registry')

    # ---- Core 0.2 API
    def capabilities(self): return self._get('/v1/capabilities')
    def safety_limits(self): return self._get('/v1/safety-limits')
    def recalls(self): return self._get('/v1/recalls')
    def conformance(self): return self._get('/v1/conformance')
    def start_execution(self, request, idempotency_key=None, human_present=None):
        key = idempotency_key or secrets.token_hex(12)
        body = dict(request)
        if human_present is not None: body['x-hub-human-present'] = bool(human_present)
        out = self._post('/v1/executions', body, {'Idempotency-Key': key})
        self.last_idempotency_key = key
        return out
    def get_execution(self, execution_id): return self._get(f'/v1/executions/{execution_id}')
    def stop_execution(self, execution_id, reason='requested'):
        return self._post(f'/v1/executions/{execution_id}/stop', {'reason': reason}, {'Idempotency-Key': secrets.token_hex(12)})
    def resume_execution(self, execution_id, seq):
        return self._post(f'/v1/executions/{execution_id}/resume', {}, {'Idempotency-Key': secrets.token_hex(12), 'If-Match': str(seq)})
    def execution_log(self, execution_id): return self._get(f'/v1/executions/{execution_id}/log')
    def report_incident(self, doc): return self._post('/v1/incidents', doc, {'Idempotency-Key': secrets.token_hex(12)})
