"""Sample clients: one interface, two transports, and two recipe catalogs.

`HubClient` speaks HTTP to any executor or hub that serves the Core 0.2 API (the reference hub in
hub/ also serves /v1/tools/*). `LocalClient` drives a SimulatedExecutor in process. Orchestrators,
agents and recovery only use the methods both share, so a sample written offline runs unchanged
against a real hub.

Network retries reuse the same Idempotency-Key, so a POST that reached the executor before the
connection dropped is not executed twice. Stop is never retried away: it is retried until it lands.
"""
import json
import secrets
import time
import urllib.error
import urllib.request

from .data import load_bundle, global_ref
from .errors import CookwalaProblem
from .jcs import doc_hash
from .simulator import SimulatedExecutor, dry_run

__all__ = ['HubClient', 'LocalClient', 'BundleCatalog', 'HubCatalog', 'new_key']


def new_key(prefix='cw'):
    return f'{prefix}-{secrets.token_hex(10)}'


class HubClient:
    """Core 0.2 API over HTTP, standard library only."""

    def __init__(self, base_url='http://localhost:7878', token=None, timeout=30, retries=4, backoff_s=0.5, poll_s=0.5, name=None):
        self.base = base_url.rstrip('/')
        self.token, self.timeout, self.retries, self.backoff, self.poll_s = token, timeout, retries, backoff_s, poll_s
        self.name = name or self.base

    def _call(self, method, path, body=None, headers=None):
        data = json.dumps(body).encode() if body is not None else None
        for attempt in range(self.retries + 1):
            req = urllib.request.Request(self.base + path, data=data, method=method)
            req.add_header('Accept', 'application/vnd.cookwala+json, application/json, application/problem+json')
            if data is not None: req.add_header('Content-Type', 'application/vnd.cookwala+json')
            if self.token: req.add_header('Authorization', f'Bearer {self.token}')
            for k, v in (headers or {}).items(): req.add_header(k, v)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as r:
                    raw = r.read(); self.last_headers = dict(r.headers)
                    return json.loads(raw) if raw else None
            except urllib.error.HTTPError as e:
                raw = e.read()
                try: payload = json.loads(raw)
                except ValueError: payload = {'title': 'http-error', 'detail': raw.decode(errors='replace')}
                if e.code in (502, 503, 504) and attempt < self.retries:
                    time.sleep(self.backoff * 2 ** attempt); continue
                raise CookwalaProblem(e.code, payload) from None
            except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
                if attempt >= self.retries:
                    raise CookwalaProblem(0, {'title': 'unreachable', 'detail': str(e)}) from None
                time.sleep(self.backoff * 2 ** attempt)

    # Core API
    def capabilities(self): return self._call('GET', '/v1/capabilities')
    def safety_limits(self): return self._call('GET', '/v1/safety-limits')
    def recalls(self): return self._call('GET', '/v1/recalls')

    def start_execution(self, request, idempotency_key=None, human_present=None):
        key = idempotency_key or request.get('idempotencyKey') or new_key('ex')
        body = dict(request)
        if human_present is not None: body['x-hub-human-present'] = bool(human_present)  # reference-hub extension; real hubs sense presence
        return self._call('POST', '/v1/executions', body, {'Idempotency-Key': key})

    def get_execution(self, execution_id): return self._call('GET', f'/v1/executions/{execution_id}')
    def stop_execution(self, execution_id, reason='requested'): return self._call('POST', f'/v1/executions/{execution_id}/stop', {'reason': reason})
    def resume_execution(self, execution_id, seq):
        return self._call('POST', f'/v1/executions/{execution_id}/resume', {}, {'Idempotency-Key': new_key('resume'), 'If-Match': f'"{seq}"'})
    def execution_log(self, execution_id): return self._call('GET', f'/v1/executions/{execution_id}/log')
    def report_incident(self, doc): return self._call('POST', '/v1/incidents', doc, {'Idempotency-Key': new_key('inc')})

    # Reference-hub tools (not Core): the dry run the hub would do, without starting anything
    def dry_run(self, recipe, human_present=False):
        return self._call('POST', '/v1/tools/dryrun', {'recipe': recipe, 'device': self.capabilities(), 'humanPresent': bool(human_present)})

    def advance(self):
        time.sleep(self.poll_s)  # a real executor runs on its own clock; the client only waits and polls


class LocalClient:
    """The same interface over an in-process SimulatedExecutor."""

    def __init__(self, executor, name=None):
        self.ex = executor
        self.name = name or executor.caps.get('actor', {}).get('id', 'simulated')

    @classmethod
    def for_device(cls, device, **kw):
        return cls(SimulatedExecutor.from_bundle(device, **kw), name=device)

    def capabilities(self): return self.ex.capabilities()
    def safety_limits(self): return self.ex.safety_limits()
    def recalls(self): return self.ex.recalls()
    def start_execution(self, request, idempotency_key=None, human_present=False):
        return self.ex.start_execution(request, idempotency_key or request.get('idempotencyKey') or new_key('ex'), bool(human_present))
    def get_execution(self, execution_id): return self.ex.get_execution(execution_id)
    def stop_execution(self, execution_id, reason='requested'): return self.ex.stop_execution(execution_id, reason)
    def resume_execution(self, execution_id, seq): return self.ex.resume_execution(execution_id, seq)
    def execution_log(self, execution_id): return self.ex.execution_log(execution_id)
    def report_incident(self, doc): return self.ex.report_incident(doc)
    def dry_run(self, recipe, human_present=False):
        return dry_run(recipe, self.ex.caps, human_present, True, self.ex.limits, self.ex.now.strftime('%Y-%m-%dT%H:%M:%SZ'))
    def advance(self): self.ex.tick()


class BundleCatalog:
    """Recipes from the bundled snapshot (four example recipes from this repository)."""

    def __init__(self, recipes=None):
        self.recipes = recipes if recipes is not None else load_bundle()['recipes']

    def list(self):
        return sorted(self.recipes)

    def get(self, key):
        for k, doc in self.recipes.items():
            if key in (k, doc.get('id'), global_ref(doc)):
                return doc
        return None

    def find(self, text):
        """Match a dish by key, id or English name. The text is a lookup key, never an instruction."""
        t = text.strip().lower()
        hits = [d for k, d in self.recipes.items() if t in k or t in d.get('id', '') or t in d.get('dish', {}).get('names', {}).get('en', '').lower()]
        return hits

    def ref_and_hash(self, doc):
        return global_ref(doc), doc_hash(doc)


class HubCatalog(BundleCatalog):
    """Recipes served by the reference hub's /v1/tools/recipes (file stems) and /v1/tools/recipes/{stem}."""

    def __init__(self, client):
        stems = client._call('GET', '/v1/tools/recipes')['recipes']
        super().__init__({s: client._call('GET', f'/v1/tools/recipes/{s}') for s in stems})
