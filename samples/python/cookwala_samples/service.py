"""The samples as a small HTTP service: one framework-free handler, used by every deployment target.

`handle(method, path, query, body)` returns (status, content_type, text). The container image,
`cookwala-samples serve`, the Azure Functions app, the AWS Lambda handler, the Google Cloud
function and the OpenShift/Knative service all call it, so they behave the same.

Endpoints:
  GET  /health                         liveness
  GET  /v1/samples                     what is bundled (recipes, devices) and the endpoints
  POST /v1/samples/gates               run the gate pipeline: {recipe, device?, humanPresent?, allergenBlocks?, requestedBy?, mandate?}
  POST /v1/samples/plan                planner agent + device ranking: {order: {dish, servings?, allergenBlocks?}, humanPresent?}
  POST /v1/samples/run                 orchestrate jobs on the simulated kitchen: {jobs?: [{id, order, humanPresent}], faults?, format?}
  GET  /v1/samples/demo?format=        the demo report (json | markdown | junit | csv)

Everything runs on simulated devices from the bundle. The service never calls another host, so it
can run as a public function without becoming a proxy to anyone's kitchen.
"""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from . import __version__
from .agents import PlannerAgent, ScriptedHuman, make_mandate
from .clients import BundleCatalog
from .data import load_bundle, global_ref
from .gates import GateContext, GatePipeline
from .jcs import doc_hash
from .orchestrators import Job, Orchestrator
from .reporting import Reporter
from .scenarios import kitchen, demo

MAX_BODY = 256 * 1024
MAX_JOBS = 20
TYPES = {'json': 'application/json', 'markdown': 'text/markdown; charset=utf-8', 'md': 'text/markdown; charset=utf-8',
         'junit': 'application/xml', 'csv': 'text/csv; charset=utf-8'}
FAULT_KINDS = {'sensor_fault', 'timeout', 'overheat'}


def _json(status, body):
    return status, 'application/json', json.dumps(body, ensure_ascii=False)


def _problem(status, title, detail=None):
    return status, 'application/problem+json', json.dumps({'type': f'https://cookwala.ai/errors/{title}', 'title': title, **({'detail': detail} if detail else {})})


def _report(rep, fmt):
    if fmt not in TYPES: return _problem(400, 'invalid-request', f'format must be one of {sorted(TYPES)}')
    return 200, TYPES[fmt], rep.render(fmt)


def _jobs(raw):
    if not isinstance(raw, list) or not 1 <= len(raw) <= MAX_JOBS: raise ValueError(f'jobs must be a list of 1..{MAX_JOBS}')
    out = []
    for i, j in enumerate(raw):
        if not isinstance(j, dict) or not isinstance(j.get('order'), dict) or not isinstance(j['order'].get('dish'), str):
            raise ValueError(f'jobs[{i}] needs order.dish')
        out.append(Job(str(j.get('id', f'job-{i + 1}'))[:64], order=j['order'], human_present=bool(j.get('humanPresent', False))))
    return out


def run_jobs(jobs, faults=None):
    """Run jobs on the simulated kitchen with a planner and a person who says yes. Returns a Reporter."""
    human = ScriptedHuman(present=True)
    planner = PlannerAgent('agent:planner-svc', make_mandate('household:h-svc/person:p-1', 'agent:planner-svc'), BundleCatalog(), human)
    orch = Orchestrator(kitchen(faults or {}), planner=planner, human=human, recalls=[])
    return Reporter([orch.run(j) for j in jobs], title='Cookwala samples run')


def handle(method, path, query=None, body=None):
    q = query or {}
    fmt = (q.get('format') or 'json').lower()
    b = load_bundle()
    try:
        if method == 'GET' and path in ('/health', '/healthz', '/'):
            return _json(200, {'ok': True, 'service': 'cookwala-samples', 'version': __version__, 'core': b['core']})
        if method == 'GET' and path == '/v1/samples':
            return _json(200, {'version': __version__, 'recipes': {k: {'ref': global_ref(r), 'hash': doc_hash(r)} for k, r in b['recipes'].items()},
                               'devices': sorted(b['devices']), 'endpoints': ['/v1/samples/gates', '/v1/samples/plan', '/v1/samples/run', '/v1/samples/demo'],
                               'note': 'simulated devices; nothing is cooked'})
        if method == 'GET' and path == '/v1/samples/demo':
            return _report(demo(), fmt)
        if method != 'POST':
            return _problem(404, 'not-found')
        body = body or {}
        if not isinstance(body, dict): return _problem(400, 'invalid-request', 'body must be a JSON object')
        if path == '/v1/samples/gates':
            recipe = BundleCatalog().get(str(body.get('recipe', '')))
            if recipe is None: return _problem(400, 'invalid-request', f"recipe must be one of {sorted(b['recipes'])}")
            device = b['devices'].get(body['device']) if body.get('device') else None
            if body.get('device') and device is None: return _problem(400, 'invalid-request', f"device must be one of {sorted(b['devices'])}")
            req = {'core': '0.2.0', 'kind': 'ExecuteRequest', 'id': 'gates-check', 'recipe': global_ref(recipe), 'recipeHash': body.get('recipeHash', doc_hash(recipe)),
                   'requestedBy': str(body.get('requestedBy', 'person:p-1')), 'idempotencyKey': 'gates-check-0001', 'allergenBlocks': list(body.get('allergenBlocks', []))}
            if isinstance(body.get('mandate'), dict): req['mandate'] = body['mandate']
            d = GatePipeline.default().run(GateContext(req, recipe, device, bool(body.get('humanPresent', False))))
            return _json(200, d.as_dict())
        if path == '/v1/samples/plan':
            order = body.get('order')
            if not isinstance(order, dict) or not isinstance(order.get('dish'), str): return _problem(400, 'invalid-request', 'order.dish is required')
            human = ScriptedHuman(present=bool(body.get('humanPresent', False)), confirm=bool(body.get('confirm', False)))
            planner = PlannerAgent('agent:planner-svc', make_mandate('household:h-svc/person:p-1', 'agent:planner-svc'), BundleCatalog(), human)
            p = planner.propose(order)
            out = p.as_dict()
            if p.ok:
                orch = Orchestrator(kitchen(), planner=planner)
                out['ranking'] = [{'device': n, 'state': dr['state'], **({'reason': dr['refusal']['reason']} if dr.get('refusal') else {}),
                                   'humanSteps': sum(1 for s in dr['plan'] if s['verifiedBy'] == 'human')} for n, dr in orch.rank(p.recipe, human.present)]
            return _json(200, out)
        if path == '/v1/samples/run':
            jobs = _jobs(body['jobs']) if 'jobs' in body else None
            faults = body.get('faults', {})
            if not isinstance(faults, dict) or any(v not in FAULT_KINDS for v in faults.values()):
                return _problem(400, 'invalid-request', f'faults maps "recipe-id#node" to one of {sorted(FAULT_KINDS)}')
            return _report(demo() if jobs is None else run_jobs(jobs, faults), fmt)
        return _problem(404, 'not-found')
    except (ValueError, KeyError, TypeError) as e:
        return _problem(400, 'invalid-request', f'{type(e).__name__}: {e}')


def handle_raw(method, url, raw_body=b''):
    """Adapters call this: url may carry ?format=, raw_body is bytes or str."""
    parts = urlsplit(url)
    query = {k: v[-1] for k, v in parse_qs(parts.query).items()}
    if raw_body and len(raw_body) > MAX_BODY:
        return _problem(413, 'too-large', f'body over {MAX_BODY} bytes')
    try:
        body = json.loads(raw_body) if raw_body else None
    except ValueError as e:
        return _problem(400, 'invalid-request', f'body is not JSON: {e}')
    return handle(method.upper(), parts.path.rstrip('/') or '/', query, body)


class _Handler(BaseHTTPRequestHandler):
    server_version = f'cookwala-samples/{__version__}'

    def _go(self, method):
        n = int(self.headers.get('Content-Length') or 0)
        raw = self.rfile.read(min(n, MAX_BODY + 1)) if n else b''
        status, ctype, text = handle_raw(method, self.path, raw)
        data = text.encode('utf-8')
        self.send_response(status); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(data))); self.end_headers()
        self.wfile.write(data)

    def do_GET(self): self._go('GET')
    def do_POST(self): self._go('POST')


def serve(port=8080, bind='127.0.0.1'):
    srv = ThreadingHTTPServer((bind, port), _Handler)
    print(f'cookwala-samples {__version__} on http://{bind}:{port}  (simulated devices; GET /v1/samples)', flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
