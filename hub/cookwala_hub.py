#!/usr/bin/env python3
"""Cookwala reference hub: the Core 0.2 API with a simulated device.

Standard library only. Serves the Core API (api/core.openapi.yaml) for one simulated executor
whose capabilities and safety limits come from JSON files. Executions are dry-run first
(refusal before heat, Core section 3), then advance through the state machine on a timer, with
medium temperatures that stay inside the operation envelopes. Safety limits are enforced
locally: no request field can change them. Stop always works.

    python hub/cookwala_hub.py --port 7878 \
        --device examples/capabilities/robot-arm.json \
        --limits profiles/core/safety-limits.default.json \
        --recipes examples            # folder of *.cookwala.json the hub can fetch by id

Then, in another shell:

    curl -s http://localhost:7878/v1/capabilities | head
    curl -s -X POST http://localhost:7878/v1/executions \
      -H 'Content-Type: application/vnd.cookwala+json' -H 'Idempotency-Key: demo-0001' \
      -d '{"core":"0.2.0","kind":"ExecuteRequest","id":"ex-1","recipe":"cw:cookwala.ai:example-shakshuka",
           "recipeHash":"<hash from cookwala hash>","requestedBy":"person-1","idempotencyKey":"demo-0001",
           "x-hub-human-present":true}'

This is a test bed for makers and the quickstart, not a product. It has no persistence and no
authentication beyond accepting any bearer token on the local network.
"""
import argparse
import json
import pathlib
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import cookwala_ref as ref  # noqa: E402

MEDIA = 'application/vnd.cookwala+json'
PROBLEM = 'application/problem+json'


class Device:
    """A simulated executor. Advances executions on a clock; keeps media inside envelopes."""

    def __init__(self, capabilities, limits, recipes_dir, speed=20.0):
        self.capabilities = capabilities
        self.limits = limits
        self.recipes_dir = pathlib.Path(recipes_dir) if recipes_dir else None
        self.speed = speed  # simulated seconds per real second
        self.ops = {e['id']: e for e in json.loads((ROOT / 'vocab' / 'ops.json').read_text())['entries']}
        self.executions = {}
        self.idem = {}
        self.lock = threading.Lock()
        self.recalled = set()
        threading.Thread(target=self._tick, daemon=True).start()

    # ---- recipes
    def find_recipe(self, gref):
        rid = gref.split(':')[-1].split('#')[-1]
        if not self.recipes_dir:
            return None
        for p in self.recipes_dir.rglob('*.cookwala.json'):
            doc = json.loads(p.read_text())
            if doc.get('id') == rid:
                return doc
        return None

    # ---- requests
    def start(self, req, human_present):
        now = time.time()
        recipe = self.find_recipe(req['recipe'])
        status = {'core': '0.2.0', 'kind': 'ExecutionStatus', 'id': req['id'], 'seq': 0, 'state': 'accepted', 'recipe': req['recipe'], 'recipeHash': req.get('recipeHash'), 'updatedAt': ref_time(now)}
        if recipe is None:
            return self._refuse(status, 'missing_capability', 'recipe not found in this hub\'s catalog')
        if ref.doc_hash(recipe) != req.get('recipeHash'):
            return self._refuse(status, 'recipe_hash_mismatch', f'this hub holds {ref.doc_hash(recipe)}')
        if req['recipe'] in self.recalled:
            return self._refuse(status, 'recipe_recalled', 'a recall is in force for this revision')
        if req.get('mandate') and 'start_cooking' not in req['mandate'].get('scopes', []):
            return self._refuse(status, 'mandate_scope', 'the agent mandate lacks start_cooking')
        blocks = set(req.get('allergenBlocks', [])) & set(recipe.get('safety', {}).get('allergens', []))
        if blocks:
            return self._refuse(status, 'allergen_block', f'recipe contains blocked allergen(s): {sorted(blocks)}')
        dry = ref.dry_run(recipe, self.capabilities, human_present, True)
        if dry['state'] == 'refused':
            return self._refuse(status, dry['refusal']['reason'], dry['refusal']['detail'], dry['refusal']['node'])
        status.update({'state': 'accepted', 'plan': dry['plan']})
        ex = {'status': status, 'recipe': recipe, 'plan': dry['plan'], 'step': -1, 'stepStarted': None, 'log': {'steps': []}, 'startedAt': now, 'humanPresent': human_present, 'request': req}
        self.executions[req['id']] = ex
        return status

    def _refuse(self, status, reason, detail, node=None):
        status.update({'state': 'refused', 'refusal': {'reason': reason, 'detail': detail, **({'node': node} if node else {})}})
        self.executions[status['id']] = {'status': status, 'final': True, 'log': None}
        return status

    def stop(self, ex, reason):
        st = ex['status']
        if st['state'] in ('completed', 'refused', 'failed', 'stopped'):
            return st
        st['seq'] += 1; st['state'] = 'stopping'; st['updatedAt'] = ref_time(time.time()); ex['stopReason'] = reason
        return st

    def resume(self, ex):
        st = ex['status']
        if st['state'] in ('paused', 'needs_human'):
            st['seq'] += 1; st['state'] = 'running'; st['updatedAt'] = ref_time(time.time()); ex['stepStarted'] = time.time()
        return st

    # ---- clock
    def _tick(self):
        while True:
            time.sleep(0.5)
            with self.lock:
                for ex in list(self.executions.values()):
                    if ex.get('final'):
                        continue
                    self._advance(ex)

    def _advance(self, ex):
        st = ex['status']; now = time.time()
        if st['state'] == 'stopping':
            st['seq'] += 1; st['state'] = 'stopped'; st['updatedAt'] = ref_time(now); ex['final'] = True; self._finish_log(ex, 'aborted_safe'); return
        if st['state'] == 'accepted':
            st['seq'] += 1; st['state'] = 'preparing'; st['updatedAt'] = ref_time(now); return
        if st['state'] == 'preparing':
            st['seq'] += 1; st['state'] = 'running'; ex['step'] = 0; ex['stepStarted'] = now; st['updatedAt'] = ref_time(now); self._enter_step(ex); return
        if st['state'] != 'running':
            return
        plan = ex['plan']; i = ex['step']
        if i >= len(plan):
            st['seq'] += 1; st['state'] = 'completed'; st['updatedAt'] = ref_time(now); ex['final'] = True; self._finish_log(ex, 'served'); return
        p = plan[i]; node = next(n for n in ex['recipe']['process']['nodes'] if n['id'] == p['node'])
        dur = self._nominal_seconds(node)
        elapsed = (now - ex['stepStarted']) * self.speed
        env = self.ops.get(node['op'], {}).get('envelope', {})
        if 'tempC' in env:
            lo, hi = env['tempC']['min'], env['tempC']['max']
            target = (lo + hi) / 2
            warm = min(1.0, elapsed / max(30.0, dur * 0.2))
            st['mediumTempC'] = round(22 + (target - 22) * warm, 1)
        st['node'] = node['id']; st['op'] = node['op']; st['progress'] = round(min(1.0, elapsed / dur), 2); st['verifiedBy'] = p['verifiedBy']
        if elapsed >= dur:
            self._close_step(ex, node, p)
            ex['step'] += 1; ex['stepStarted'] = now
            if ex['step'] < len(plan):
                self._enter_step(ex)
        st['updatedAt'] = ref_time(now)

    def _enter_step(self, ex):
        st = ex['status']; p = ex['plan'][ex['step']]
        st['seq'] += 1
        if p['by'] == 'human':
            st['state'] = 'needs_human'; st['humanNeeded'] = f"a person performs {p['op']}"
        elif p['verifiedBy'] == 'human':
            st['state'] = 'needs_human'; st['humanNeeded'] = f"a person confirms {p['op']} is done"
        else:
            st.pop('humanNeeded', None)

    def _close_step(self, ex, node, p):
        env = self.ops.get(node['op'], {}).get('envelope', {})
        entry = {'node': node['id'], 'op': node['op'], 'verifiedBy': p['verifiedBy'], 'envelopeOk': True, 'startedAt': ref_time(ex['stepStarted']), 'endedAt': ref_time(time.time())}
        if 'tempC' in env and p['verifiedBy'] == 'sensor':
            lo, hi = env['tempC']['min'], env['tempC']['max']
            entry['summary'] = [{'sensor': p.get('rung', 'cw.sense.liquid_temp'), 'unit': 'degC', 'min': 22, 'max': round((lo + hi) / 2 + 1, 1), 'end': round((lo + hi) / 2, 1)}]
        ex['log']['steps'].append(entry)

    def _nominal_seconds(self, node):
        until = node.get('until', {})
        for key in ('minTime', 'maxTime'):
            if key in until:
                return max(10.0, iso_seconds(until[key]))
        return 60.0

    def _finish_log(self, ex, outcome):
        now = time.time()
        ex['log'] = {'core': '0.2.0', 'kind': 'ExecutionLog', 'id': f"log-{ex['status']['id']}", 'recipe': ex['status']['recipe'], 'recipeHash': ex['status']['recipeHash'],
                     'device': {'vendor': self.capabilities['actor'].get('vendor', 'reference'), 'model': self.capabilities['actor'].get('model', 'simulated'), 'firmware': 'hub-0.1', 'safetyLimits': f"{self.limits['id']}@{self.limits['version']}"},
                     'startedAt': ref_time(ex['startedAt']), 'endedAt': ref_time(now), 'outcome': outcome, 'servings': ex['request'].get('servings', ex['recipe']['yield']['servings']),
                     'steps': ex['log']['steps'], 'safetyEvents': [], 'humanInterventions': [{'kind': 'confirm', 'minutes': 1}] if any(p['verifiedBy'] == 'human' for p in ex['plan']) else [],
                     'consent': {'dataset': 'none', 'withdrawable': True}, 'privacy': {'personalData': 'none', 'timePrecision': 'day'}}


def iso_seconds(d):
    import re
    m = re.fullmatch(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d)
    if not m: return 60.0
    h, mi, s = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mi * 60 + s


def ref_time(t):
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(t))


TOOLS = ['hash', 'verify', 'dryrun', 'envelope', 'sms', 'constraints', 'convert', 'ladder', 'validate', 'humanitarian']


class Handler(BaseHTTPRequestHandler):
    device: Device = None
    server_version = 'cookwala-hub/0.1'

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - %s\n' % (self.address_string(), fmt % args))

    def _send(self, code, body, ctype=MEDIA, headers=None):
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        for k, v in (headers or {}).items(): self.send_header(k, v)
        self.end_headers(); self.wfile.write(data)

    def _problem(self, code, title, detail=None, refusal=None):
        body = {'type': f'https://cookwala.ai/errors/{title}', 'title': title}
        if detail: body['detail'] = detail
        if refusal: body['refusal'] = refusal
        self._send(code, body, PROBLEM)

    def _body(self):
        n = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(n) or b'{}')

    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Access-Control-Allow-Headers', '*'); self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); self.end_headers()

    def do_GET(self):
        d = self.device; path = self.path.split('?')[0]
        if path == '/v1/capabilities': return self._send(200, d.capabilities)
        if path == '/v1/safety-limits': return self._send(200, d.limits)
        if path == '/v1/recalls': return self._send(200, [])
        if path == '/v1/conformance': return self._send(200, {'claims': ['executor'], 'report': None, 'note': 'reference hub, self-declared; run tools/run_conformance.py --report'})
        if path.startswith('/v1/executions/'):
            parts = path.split('/')
            with d.lock:
                ex = d.executions.get(parts[3])
                if not ex: return self._problem(404, 'not-found')
                if len(parts) == 4: return self._send(200, ex['status'], headers={'ETag': str(ex['status']['seq'])})
                if len(parts) == 5 and parts[4] == 'log':
                    if not ex.get('final') or not ex.get('log') or 'kind' not in (ex['log'] or {}): return self._problem(404, 'not-found', 'the log exists once the execution has ended')
                    return self._send(200, ex['log'])
        if path == '/v1/tools/recipes':
            return self._send(200, {'recipes': sorted(p.stem.replace('.cookwala', '') for p in pathlib.Path(d.recipes_dir).glob('*.cookwala.json'))})
        if path.startswith('/v1/tools/recipes/'):
            rid = path.split('/')[4]; f = pathlib.Path(d.recipes_dir) / f'{rid}.cookwala.json'
            return self._send(200, json.loads(f.read_text())) if f.exists() else self._problem(404, 'not-found')
        if path == '/v1/tools/devices':
            return self._send(200, {'devices': {p.stem: json.loads(p.read_text()) for p in sorted((ROOT / 'examples' / 'capabilities').glob('*.json'))}})
        if path == '/v1/tools/vocab/ops':
            return self._send(200, json.loads((ROOT / 'vocab' / 'ops.json').read_text()))
        if path == '/v1/tools/registry':
            return self._send(200, json.loads((ROOT / 'site' / 'v1' / 'registry.json').read_text()))
        if path in ('/', '/v1'):
            return self._send(200, {'name': 'Cookwala reference hub', 'core': '0.2.0', 'endpoints': ['/v1/capabilities', '/v1/safety-limits', '/v1/executions', '/v1/recalls', '/v1/conformance', '/v1/tools/*'], 'tools': TOOLS, 'docs': 'https://cookwala.ai/docs/HUB/'}, 'application/json')
        self._problem(404, 'not-found')

    # ---- reference tools (not part of the Core API; the same functions the CLI exposes, over HTTP, so every language SDK can call them)
    def _tool(self, name, body):
        if name == 'hash': return {'hash': ref.doc_hash(body['doc'])}
        if name == 'verify':
            ok, why = ref.verify(body['doc'], body.get('keys', []))[:2]
            return {'ok': bool(ok), 'reason': why}
        if name == 'dryrun':
            recipe = body.get('recipe') or json.loads((pathlib.Path(self.device.recipes_dir) / f"{body['recipeId']}.cookwala.json").read_text())
            device = body.get('device') or json.loads((ROOT / 'examples' / 'capabilities' / f"{body['deviceId']}.json").read_text())
            return ref.dry_run(recipe, device, bool(body.get('humanPresent', False)), bool(body.get('allowModel', True)))
        if name == 'envelope': return ref.check_envelope(body['op'], body['trace'], body.get('target'), body.get('altitudeM', 0))
        if name == 'sms':
            cmd = ref.parse_sms(body['text']); out = dict(cmd)
            if cmd.get('ok'): out['findings'] = ref.sms_storage_findings(cmd)
            return out
        if name == 'constraints': return ref.derive_constraints(body['facets'], body['role'], body.get('consents'))
        if name == 'convert': return {'value': ref.convert(body['value'], body['unit'], body['to'], body.get('densityGPerMl')), 'unit': body['to']}
        if name == 'ladder': return ref.ladder_choice(body['op'], body.get('sensors', []), bool(body.get('allowModel', True)), bool(body.get('humanPresent', False)))
        if name == 'validate':
            try:
                from jsonschema import Draft202012Validator
                from referencing import Registry, Resource
            except ImportError:
                return {'ok': None, 'errors': ['jsonschema not installed on this hub; pip install -e "sdk/python[full]"']}
            reg = Registry()
            for sp in (ROOT / 'schemas').glob('*.schema.json'):
                s = json.loads(sp.read_text()); reg = reg.with_resource(s.get('$id', sp.name), Resource.from_contents(s))
            schema = json.loads((ROOT / 'schemas' / f"{body.get('kind', 'recipe')}.schema.json").read_text())
            doc_kind = body['doc'].get('kind') if isinstance(body['doc'], dict) else None
            if doc_kind and doc_kind in schema.get('$defs', {}) and not schema.get('properties'):
                schema = {'$ref': f"{schema['$id']}#/$defs/{doc_kind}"}  # container schemas: validate the named document kind (same as tools/validate_specs.py)
            elif not schema.get('properties') and not schema.get('required'):
                return {'ok': None, 'errors': [f"{body.get('kind')} is a container schema; the document needs a 'kind' naming one of: {', '.join(sorted(schema.get('$defs', {})))}"]}
            errs = [f"{'/'.join(map(str, e.absolute_path))}: {e.message[:160]}" for e in Draft202012Validator(schema, registry=reg).iter_errors(body['doc'])]
            return {'ok': not errs, 'errors': errs}
        if name == 'humanitarian':
            import importlib.util
            spec = importlib.util.spec_from_file_location('humanitarian_check', ROOT / 'tools' / 'humanitarian_check.py'); hc = importlib.util.module_from_spec(spec); spec.loader.exec_module(hc)
            pack = hc.merge_packs([ROOT / 'profiles' / 'humanitarian' / f'{p}.rulepack.json' for p in body.get('packs', ['who-codex-basic'])])
            out = []
            for doc in body['docs']:
                f = hc.temperature_findings(doc, pack) + (hc.menu_findings(doc, pack) if doc.get('kind') == 'Distribution' else [])
                out.append({'id': doc.get('id'), 'kind': doc.get('kind'), 'findings': [{'rule': r['id'], 'severity': r['severity'], 'detail': d_} for r, d_ in f]})
            return {'results': out}
        return None

    def do_POST_tool(self, path):
        name = path.split('/')[3] if len(path.split('/')) > 3 else ''
        if name not in TOOLS: return self._problem(404, 'not-found', f'unknown tool {name}; see /v1 for the list')
        try:
            out = self._tool(name, self._body())
        except (KeyError, FileNotFoundError, ValueError, TypeError) as e:
            return self._problem(400, 'invalid-request', f'{type(e).__name__}: {e}')
        except Exception as e:  # never close the socket without a problem document
            return self._problem(500, 'tool-error', f'{type(e).__name__}: {e}')
        return self._send(200, out)

    def do_POST(self):
        d = self.device; path = self.path.split('?')[0]
        if path.startswith('/v1/tools/'): return self.do_POST_tool(path)
        idem = self.headers.get('Idempotency-Key')
        if not idem or len(idem) < 8: return self._problem(400, 'missing-idempotency-key', 'Idempotency-Key header (8..128 chars) is required on every POST')
        if path == '/v1/executions':
            with d.lock:
                if idem in d.idem: return self._send(202, d.executions[d.idem[idem]]['status'])
                req = self._body()
                for k in ('core', 'kind', 'id', 'recipe', 'recipeHash', 'requestedBy', 'idempotencyKey'):
                    if k not in req: return self._problem(400, 'invalid-request', f'missing {k}')
                if not str(req['core']).startswith('0.2.'): return self._problem(400, 'unsupported-version', refusal='unsupported_version')
                if req['id'] in d.executions: return self._problem(409, 'conflict', 'execution id already exists')
                human = bool(req.get('x-hub-human-present', False))
                st = d.start(req, human); d.idem[idem] = req['id']
                return self._send(202, st)
        if path == '/v1/incidents':
            return self._send(202, {'received': True})
        if path.startswith('/v1/executions/'):
            parts = path.split('/')
            with d.lock:
                ex = d.executions.get(parts[3])
                if not ex: return self._problem(404, 'not-found')
                if parts[4] == 'stop':
                    body = self._body(); return self._send(202, d.stop(ex, body.get('reason', 'requested')))
                if parts[4] == 'resume':
                    im = self.headers.get('If-Match')
                    if im is None: return self._problem(428, 'if-match-required')
                    if im != str(ex['status']['seq']): return self._problem(412, 'precondition-failed', f"seq is {ex['status']['seq']}")
                    return self._send(202, d.resume(ex))
        self._problem(404, 'not-found')


def main():
    ap = argparse.ArgumentParser(description='Cookwala reference hub (Core 0.2 API with a simulated device)')
    ap.add_argument('--port', type=int, default=7878)
    ap.add_argument('--device', default=str(ROOT / 'examples' / 'capabilities' / 'robot-arm.json'))
    ap.add_argument('--limits', default=str(ROOT / 'profiles' / 'core' / 'safety-limits.default.json'))
    ap.add_argument('--recipes', default=str(ROOT / 'examples'))
    ap.add_argument('--speed', type=float, default=20.0, help='simulated seconds per real second')
    a = ap.parse_args()
    Handler.device = Device(json.loads(pathlib.Path(a.device).read_text()), json.loads(pathlib.Path(a.limits).read_text()), a.recipes, a.speed)
    srv = ThreadingHTTPServer(('0.0.0.0', a.port), Handler)
    print(f'Cookwala reference hub on http://localhost:{a.port}/v1  device={pathlib.Path(a.device).name}  limits={Handler.device.limits["id"]}  recipes={a.recipes}  speed=x{a.speed}')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
