"""Python renderer for scenarios (reference renderer; other languages mirror its structure)."""
import json
import re

EXT = '.py'
LABEL = 'Python'
RUN = 'python scenarios/out/{id}-{slug}/python.py   # needs: pip install -e sdk/python and a hub on :7878'


def snake(name):
    return re.sub(r'([A-Z])', lambda m: '_' + m.group(1).lower(), name)


class Renderer:
    def header(self, s):
        return (f'# Scenario {s["id"]}: {s["title"]["en"]}\n# {s["goal"]["en"]}\n'
                f'# Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                'import json, os\nfrom cookwala.client import CookwalaClient, CookwalaProblem\n\n'
                'def load(path):\n    with open(path, encoding="utf-8") as f:\n        return json.load(f)\n\n'
                'def pick(obj, path):\n    for part in path.replace("]", "").replace("[", ".").split("."):\n'
                '        obj = obj[int(part)] if part.isdigit() else (len(obj) if part == "length" else obj.get(part))\n    return obj\n\n'
                'c = CookwalaClient(os.environ.get("COOKWALA_HUB", "http://localhost:7878"))\n')

    def comment(self, text): return f'\n# {text}'
    def lit(self, value): return json.dumps(value, ensure_ascii=False).replace('true', 'True').replace('false', 'False').replace('null', 'None') if not isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    def file(self, path): return f'load("{path}")'
    def sub(self, expr, path): return f'pick({expr}, "{path}")'
    def var(self, name, path=None): return f'pick({name}, "{path}")' if path else name

    def call(self, op, args, save):
        if op == 'dryRun':
            kw = ', '.join(f'{snake(n)}={e}' for n, e in args)
            expr = f'c.dry_run({kw})'
        else:
            expr = f'c.{snake(op)}({", ".join(e for _, e in args)})'
        if op in ('startExecution', 'stopExecution', 'resumeExecution'):
            body = (f'try:\n    {save or "result"} = {expr}\nexcept CookwalaProblem as p:\n'
                    f'    {save or "result"} = p.body  # a refusal is a result, not a crash\n    print("refused:", p.refusal)')
            return body
        return f'{save} = {expr}' if save else expr

    def expect(self, var, path, value):
        got = f'pick({var}, "{path}")' if path else var
        return f'assert {got} == {self.lit(value)}, {got}\nprint("ok", {json.dumps(path or var)}, "=", {self.lit(value)})'

    def wait(self, seconds): return f'import time; time.sleep({seconds})'
    def footer(self): return '\nprint("scenario complete")'
