"""Generate TypeScript type declarations from the Cookwala JSON Schemas.

    python tools/gen_ts_types.py            # writes sdk/typescript/src/types/*.ts and index.ts

One .ts file per schema; every $def becomes an exported type, the root schema becomes the type
named after the file (Recipe, Capabilities...). Cross-file $refs become imports. Strict objects
(unevaluatedProperties: false with an ^x- pattern) get an index signature for x- fields.
Run it after any schema change; the output is committed so the package works without a build.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'sdk' / 'typescript' / 'src' / 'types'
BASE = 'https://cookwala.ai/v1/schemas/'


def pascal(s):
    # Keep existing CamelCase (ExecuteRequest stays ExecuteRequest); capitalize the first letter of each token.
    return ''.join(t[0].upper() + t[1:] for t in re.split(r'[^A-Za-z0-9]+', s) if t)


def file_type_name(stem):
    return pascal(stem.replace('.schema', ''))


def esc_key(k):
    return k if re.fullmatch(r'[A-Za-z_$][A-Za-z0-9_$]*', k) else json.dumps(k)


class Gen:
    def __init__(self, schema, stem, all_stems):
        self.schema = schema; self.stem = stem; self.imports = set(); self.all_stems = all_stems

    def ref(self, r):
        if r.startswith('#/$defs/'):
            return pascal(r.split('/')[-1])
        m = re.match(r'^(?:' + re.escape(BASE) + r')?([a-z-]+)\.schema\.json(?:#/\$defs/([A-Za-z0-9_]+))?$', r)
        if m:
            other, d = m.group(1), m.group(2)
            if other == self.stem.replace('.schema', ''):
                return pascal(d) if d else file_type_name(self.stem)
            mod = other.replace('-', '_')
            name = pascal(d) if d else file_type_name(other + '.schema')
            self.imports.add((mod, name))
            return name
        return 'unknown'

    def ts(self, s, indent=0):
        if s is True or s == {}: return 'unknown'
        if s is False: return 'never'
        if '$ref' in s:
            rest = {k: v for k, v in s.items() if k not in ('$ref', 'description')}
            if rest:  # a $ref next to properties (used for shared x- extension patterns): intersect
                return '(' + self.ref(s['$ref']) + ' & ' + self.ts(rest, indent) + ')'
            return self.ref(s['$ref'])
        if 'const' in s: return json.dumps(s['const'])
        if 'enum' in s: return ' | '.join(json.dumps(v) for v in s['enum'])
        for key in ('oneOf', 'anyOf'):
            if key in s: return '(' + ' | '.join(self.ts(x, indent) for x in s[key]) + ')'
        if 'allOf' in s: return '(' + ' & '.join(self.ts(x, indent) for x in s['allOf']) + ')'
        t = s.get('type')
        if isinstance(t, list): return ' | '.join(self.ts({**s, 'type': x}, indent) for x in t)
        if t == 'string': return 'string'
        if t in ('number', 'integer'): return 'number'
        if t == 'boolean': return 'boolean'
        if t == 'null': return 'null'
        if t == 'array':
            items = s.get('items', {})
            inner = self.ts(items, indent) if isinstance(items, dict) else 'unknown'
            return f'Array<{inner}>' if ('|' in inner or ' ' in inner) else f'{inner}[]'
        if t == 'object' or 'properties' in s or 'additionalProperties' in s or 'patternProperties' in s:
            props = s.get('properties', {}); req = set(s.get('required', []))
            pad = '  ' * (indent + 1); lines = ['{']
            for k, v in props.items():
                desc = v.get('description') if isinstance(v, dict) else None
                if desc: lines.append(f'{pad}/** {desc.replace("*/", "* /")} */')
                lines.append(f'{pad}{esc_key(k)}{"" if k in req else "?"}: {self.ts(v, indent + 1)};')
            ap = s.get('additionalProperties')
            if isinstance(ap, dict): lines.append(f'{pad}[key: string]: {self.ts(ap, indent + 1)};')
            elif ap is True or (ap is None and not props and not s.get('patternProperties') and s.get('unevaluatedProperties') is not False): lines.append(f'{pad}[key: string]: unknown;')
            elif s.get('patternProperties'):
                lines.append(f'{pad}/** Vendor extensions (x-<name>) and other pattern properties. */')
                lines.append(f'{pad}[key: `x-${{string}}`]: unknown;')
            lines.append('  ' * indent + '}')
            return '\n'.join(lines)
        return 'unknown'

    def render(self):
        out = []
        root_name = file_type_name(self.stem)
        body = []
        for name, d in self.schema.get('$defs', {}).items():
            desc = d.get('description') if isinstance(d, dict) else None
            if desc: body.append(f'/** {desc.replace("*/", "* /")} */')
            body.append(f'export type {pascal(name)} = {self.ts(d)};\n')
        if 'properties' in self.schema or 'oneOf' in self.schema or 'allOf' in self.schema or 'type' in self.schema:
            desc = self.schema.get('description')
            if desc: body.append(f'/** {desc.replace("*/", "* /")} */')
            body.append(f'export type {root_name} = {self.ts({k: v for k, v in self.schema.items() if k not in ("$schema", "$id", "title", "$defs", "description")})};\n')
        header = [f'// Generated from {self.stem}.json by tools/gen_ts_types.py. Do not edit; regenerate.', f'// Status: {self.schema.get("x-cookwala-status", "unknown")}. {self.schema.get("title", "")}', '']
        by_mod = {}
        for mod, name in sorted(self.imports): by_mod.setdefault(mod, []).append(name)
        for mod, names in sorted(by_mod.items()):
            header.append(f'import type {{ {", ".join(sorted(set(names)))} }} from "./{mod}";')
        if by_mod: header.append('')
        return '\n'.join(header + body)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    stems = [p.stem for p in sorted((ROOT / 'schemas').glob('*.schema.json'))]
    index = ['// Cookwala TypeScript types, generated from the JSON Schemas. One namespace per schema so shared names (Id, Version, Offer) never collide.', '// Usage: import type { core, recipe } from "@cookwala/sdk"; let r: core.ExecuteRequest;', '']
    for p in sorted((ROOT / 'schemas').glob('*.schema.json')):
        schema = json.loads(p.read_text()); stem = p.stem
        mod = stem.replace('.schema', '').replace('-', '_')
        (OUT / f'{mod}.ts').write_text(Gen(schema, stem, stems).render())
        index.append(f'export * as {mod} from "./types/{mod}";')
    (OUT.parent / 'index.ts').write_text('\n'.join(index) + '\n')
    print(f'{len(stems)} schema files -> {OUT}')


if __name__ == '__main__':
    main()
