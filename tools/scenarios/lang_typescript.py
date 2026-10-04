"""TypeScript renderer for scenarios."""
import json

EXT = '.ts'
LABEL = 'TypeScript'
RUN = 'npx tsx scenarios/out/{id}-{slug}/typescript.ts   # needs a hub on :7878; import path assumes the repository layout'


class Renderer:
    def header(self, s):
        return (f'// Scenario {s["id"]}: {s["title"]["en"]}\n// {s["goal"]["en"]}\n'
                '// Run a hub first: python hub/cookwala_hub.py --recipes examples\n'
                'import { readFileSync } from "node:fs";\nimport { CookwalaClient, CookwalaProblem } from "../../../sdk/typescript/src/client.ts";\n\n'
                'const load = (p: string) => JSON.parse(readFileSync(p, "utf8"));\n'
                'const pick = (o: any, path: string) => path.replace(/\\]/g, "").split(/[.[]/).reduce((x, k) => (k === "length" ? x.length : x?.[k]), o);\n'
                'const expect = (got: any, want: any, label: string) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${label}: got ${JSON.stringify(got)}`); console.log("ok", label, "=", JSON.stringify(want)); };\n\n'
                'const c = new CookwalaClient(process.env.COOKWALA_HUB ?? "http://localhost:7878");\n\nasync function main() {')

    def comment(self, text): return f'\n  // {text}'
    def lit(self, value): return json.dumps(value, ensure_ascii=False)
    def file(self, path): return f'load("{path}")'
    def sub(self, expr, path): return f'pick({expr}, "{path}")'
    def var(self, name, path=None): return f'pick({name}, "{path}")' if path else name

    def call(self, op, args, save):
        if op == 'dryRun':
            expr = f'await c.dryRun({{ {", ".join(f"{n}: {e}" for n, e in args)} }})'
        else:
            expr = f'await c.{op}({", ".join(e for _, e in args)})'
        target = f'{save}' if save else '_'
        if op in ('startExecution', 'stopExecution', 'resumeExecution'):
            return (f'  let {target}: any;\n  try {{ {target} = {expr}; }} catch (e) {{\n    if (!(e instanceof CookwalaProblem)) throw e;\n'
                    f'    {target} = e.body; console.log("refused:", e.refusal); // a refusal is a result, not a crash\n  }}')
        return f'  const {save} = {expr};' if save else f'  {expr};'

    def expect(self, var, path, value):
        got = f'pick({var}, "{path}")' if path else var
        return f'  expect({got}, {self.lit(value)}, {json.dumps(path or var)});'

    def wait(self, seconds): return f'  await new Promise((r) => setTimeout(r, {int(seconds * 1000)}));'
    def footer(self): return '\n  console.log("scenario complete");\n}\n\nmain().catch((e) => { console.error(e); process.exit(1); });'
