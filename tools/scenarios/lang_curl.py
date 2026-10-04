"""curl / shell renderer: the raw HTTP calls, for any language without a client."""
import json

EXT = '.sh'
LABEL = 'curl'
RUN = 'bash scenarios/out/{id}-{slug}/curl.sh   # needs curl, jq and a hub on :7878'

PATHS = {
    'hash': ('POST', '/v1/tools/hash'), 'verify': ('POST', '/v1/tools/verify'), 'dryRun': ('POST', '/v1/tools/dryrun'), 'checkEnvelope': ('POST', '/v1/tools/envelope'),
    'parseSms': ('POST', '/v1/tools/sms'), 'deriveConstraints': ('POST', '/v1/tools/constraints'), 'convert': ('POST', '/v1/tools/convert'), 'ladder': ('POST', '/v1/tools/ladder'),
    'validate': ('POST', '/v1/tools/validate'), 'humanitarianCheck': ('POST', '/v1/tools/humanitarian'), 'listRecipes': ('GET', '/v1/tools/recipes'), 'getRecipe': ('GET', '/v1/tools/recipes/{id}'),
    'getDevices': ('GET', '/v1/tools/devices'), 'getOps': ('GET', '/v1/tools/vocab/ops'), 'getRegistry': ('GET', '/v1/tools/registry'), 'capabilities': ('GET', '/v1/capabilities'),
    'safetyLimits': ('GET', '/v1/safety-limits'), 'recalls': ('GET', '/v1/recalls'), 'conformance': ('GET', '/v1/conformance'), 'startExecution': ('POST', '/v1/executions'),
    'getExecution': ('GET', '/v1/executions/{id}'), 'stopExecution': ('POST', '/v1/executions/{id}/stop'), 'resumeExecution': ('POST', '/v1/executions/{id}/resume'),
    'executionLog': ('GET', '/v1/executions/{id}/log'), 'reportIncident': ('POST', '/v1/incidents'),
}


def jqpath(path):
    """'a.b[0].length' -> '.a.b[0] | length'"""
    if path.endswith('.length'): return '.' + path[:-7] + ' | length'
    if path == 'length': return 'length'
    return '.' + path


class Renderer:
    def header(self, s):
        return (f'#!/usr/bin/env bash\n# Scenario {s["id"]}: {s["title"]["en"]}\n# {s["goal"]["en"]}\n'
                '# Run a hub first: python hub/cookwala_hub.py --recipes examples\nset -euo pipefail\nH=${COOKWALA_HUB:-http://localhost:7878}\n'
                'key() { head -c 12 /dev/urandom | od -An -tx1 | tr -d " \\n"; }\n')

    def comment(self, text): return f'\n# {text}'
    def lit(self, value): return json.dumps(value, ensure_ascii=False)
    def file(self, path): return f'$(cat {path})'
    def sub(self, expr, path): return f"$(echo '{expr}' | jq -c '{jqpath(path)}')" if not expr.startswith('$(') else f"$({expr[2:-1]} | jq -c '{jqpath(path)}')"
    def var(self, name, path=None): return f'$(echo "${name}" | jq -c \'{jqpath(path)}\')' if path else f'${name}'

    def _body(self, op, args):
        if op in ('getRecipe', 'getExecution', 'executionLog', 'stopExecution', 'resumeExecution'):
            args = [(n, e) for n, e in args if n != 'id']
        if op == 'reportIncident': return args[0][1] if args else '{}'
        if op == 'startExecution':
            req = dict(args).get('request', '{}'); hp = dict(args).get('humanPresent')
            return f'$(echo \'{req}\' | jq -c \'. + {{"x-hub-human-present": {hp}}}\')' if hp and not req.startswith('$') else (f'$(echo {req} | jq -c \'. + {{"x-hub-human-present": {hp}}}\')' if hp else req)
        parts = []
        for n, e in args:
            if e.startswith('$(') or e.startswith('$'): parts.append(f'"{n}": \'{e}\'')
            else: parts.append(f'"{n}": {e}')
        return '{' + ', '.join(parts) + '}'

    def call(self, op, args, save):
        method, path = PATHS[op]
        a = dict(args)
        if '{id}' in path: path = path.replace('{id}', a.get('id', '').strip('"') if not a.get('id', '').startswith('$') else a['id'])
        hdr = ''
        if method == 'POST' and path.startswith('/v1/executions') or op == 'reportIncident': hdr += ' -H "Idempotency-Key: $(key)"'
        if op == 'resumeExecution': hdr += f' -H "If-Match: {a.get("seq")}"'
        if method == 'GET': cmd = f'curl -s "$H{path}"'
        else:
            body = self._body(op, args)
            body = body.replace("'$(", "$(").replace(")'", ")")  # shell substitutions inside JSON
            cmd = f'curl -s -X POST "$H{path}" -H "Content-Type: application/json"{hdr} -d \'{body}\'' if not ('$(' in body or body.startswith('$')) else f'curl -s -X POST "$H{path}" -H "Content-Type: application/json"{hdr} -d "{body.replace(chr(34), chr(92) + chr(34))}"'
        return f'{save}=$({cmd})\necho "${save}" | jq -c . | head -c 400; echo' if save else f'{cmd} | jq -c . | head -c 400; echo'

    def expect(self, var, path, value):
        got = f'$(echo "${var}" | jq -c \'{jqpath(path)}\')' if path else f'${var}'
        return f'[ "{got}" = \'{self.lit(value)}\' ] && echo "ok {path or var} = {self.lit(value)}" || {{ echo "MISMATCH {path or var}: {got}"; exit 1; }}'

    def wait(self, seconds): return f'sleep {seconds}'
    def footer(self): return '\necho "scenario complete"'
