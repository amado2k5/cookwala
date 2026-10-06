"""Validate every Cookwala schema, example and vocabulary. Usage: python tools/validate_specs.py"""
import json
import pathlib
import sys

import yaml
from graphql import build_schema
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'https://cookwala.ai/v1/schemas/'
failures = 0

schemas = {}
for path in (ROOT / 'schemas').rglob('*.schema.json'):
    schema = json.loads(path.read_text())
    Draft202012Validator.check_schema(schema)
    schemas[schema['$id']] = schema
registry = Registry().with_resources([(k, Resource.from_contents(v)) for k, v in schemas.items()])
print(f'schemas: {len(schemas)} valid')


def check(doc, ref, label):
    global failures
    errors = list(Draft202012Validator({'$ref': ref}, registry=registry).iter_errors(doc))
    for error in errors[:20]:
        print(f'  {label} {list(error.path)}: {error.message[:200]}')
    failures += len(errors)
    print(f'{label}: {"ok" if not errors else f"{len(errors)} errors"}')


for path in sorted((ROOT / 'examples').glob('*.cookwala.json')):
    check(json.loads(path.read_text()), BASE + 'recipe.schema.json', path.name)
for path in sorted((ROOT / 'vocab').glob('*.json')):
    check(json.loads(path.read_text()), BASE + 'catalog.schema.json#/$defs/Vocabulary', path.name)
for path in sorted((ROOT / 'knowledge').glob('*.json')):
    check(json.loads(path.read_text()), BASE + 'knowledge.schema.json', 'knowledge/' + path.name)
EXAMPLE_SCHEMAS = {
    'advice': 'advice.schema.json#/$defs/{kind}',
    'profile': 'profile.schema.json',
    'extension': 'extension.schema.json',
    'flow': 'flow.schema.json',
    'market': 'market.schema.json#/$defs/{kind}',
    'capabilities': 'capabilities.schema.json',
    'relief': 'relief.schema.json#/$defs/{kind}',
    'mission': 'mission.schema.json',
}
for folder, ref in EXAMPLE_SCHEMAS.items():
    for path in sorted((ROOT / 'examples' / folder).glob('*.json')) if (ROOT / 'examples' / folder).exists() else []:
        doc = json.loads(path.read_text())
        kind = doc.pop('$kind', None)
        check(doc, BASE + ref.format(kind=kind), f'examples/{folder}/{path.name}')
for folder in ('examples/humanitarian', 'profiles/humanitarian'):
    for path in sorted((ROOT / folder).rglob('*.json')):
        doc = json.loads(path.read_text())
        check(doc, BASE + f"humanitarian.schema.json#/$defs/{doc['kind']}", f'{folder}/{path.name}')
for folder, schema_name in (('examples/household', 'household'), ('profiles/household', 'household'), ('examples/registry', 'catalog'), ('examples/fleet', 'fleet'), ('examples/supply', 'supply'), ('examples/conformance', 'conformance'), ('examples/certifications', 'common')):
    for path in sorted((ROOT / folder).glob('*.json')) if (ROOT / folder).exists() else []:
        doc = json.loads(path.read_text())
        check(doc, BASE + f"{schema_name}.schema.json#/$defs/{doc['kind']}", f'{folder}/{path.name}')
for folder in ('examples/core', 'profiles/core'):
    for path in sorted((ROOT / folder).glob('*.json')):
        doc = json.loads(path.read_text())
        check(doc, BASE + f"core.schema.json#/$defs/{doc['kind']}", f'{folder}/{path.name}')


# ---- facet registry integrity (RFC-0001): ids unique, families known, inferred facts never safety-relevant,
#      derivesTo types exist, recipient roles only name existing types
FACETS = json.loads((ROOT / 'vocab' / 'facets.json').read_text())
HH = json.loads((ROOT / 'schemas' / 'household.schema.json').read_text())
ctypes = set(HH['$defs']['ConstraintType']['enum'])
fam_ok = {'self', 'mandate', 'household.people', 'household.pets', 'household.culture', 'household.tastes', 'household.health', 'household.behavior', 'household.economics', 'space', 'space.environment', 'devices', 'resources', 'commerce', 'service', 'history'}
fproblems = []
seen = set()
for e in FACETS['entries']:
    if e['id'] in seen: fproblems.append(f"duplicate {e['id']}")
    seen.add(e['id'])
    for k in ('family', 'privacy', 'travel', 'sources', 'safetyUse'):
        if k not in e: fproblems.append(f"{e['id']} missing {k}")
    if e.get('family') not in fam_ok: fproblems.append(f"{e['id']} unknown family {e.get('family')}")
    if 'inferred' in e.get('sources', []) and e.get('safetyUse') != 'never': fproblems.append(f"{e['id']} inferred facts must have safetyUse never")
    if e.get('travel') == 'never' and e.get('derivesTo'): fproblems.append(f"{e['id']} travel never cannot derive")
    if e.get('travel') == 'derived' and not e.get('derivesTo'): fproblems.append(f"{e['id']} travel derived needs derivesTo")
    for t in e.get('derivesTo', []):
        if t not in ctypes: fproblems.append(f"{e['id']} unknown constraint type {t}")
    if e.get('family') in ('household.people', 'household.health') and e['id'].split('.')[-1] in ('children', 'schedule', 'conditions', 'medications', 'clinician_targets', 'pregnancy') and e.get('privacy') != 'secret':
        fproblems.append(f"{e['id']} must be secret")
roles = json.loads((ROOT / 'profiles' / 'household' / 'recipient-roles.json').read_text())['roles']
for role, types in roles.items():
    for t in types:
        if t not in ctypes: fproblems.append(f'recipient role {role}: unknown constraint type {t}')
if roles.get('program') or roles.get('dataset'): fproblems.append('program and dataset roles must receive nothing')
for m in fproblems: print(f'  facets: {m}')
failures += len(fproblems)
print(f"facets registry: {len(FACETS['entries'])} entries, {'ok' if not fproblems else f'{len(fproblems)} problems'}")


# ---- recipe semantics: op params, envelopes, no template placeholders
OPS = {e['id']: e for e in json.loads((ROOT / 'vocab' / 'ops.json').read_text())['entries']}


def placeholders(node, where=''):
    if isinstance(node, dict):
        for k, v in node.items(): yield from placeholders(v, f'{where}/{k}')
    elif isinstance(node, list):
        for i, v in enumerate(node): yield from placeholders(v, f'{where}/{i}')
    elif isinstance(node, str) and node.startswith('{') and node.endswith('}') and node[1:-1].replace('_', '').isalpha():
        yield where


def check_recipe_semantics(recipe, label):
    global failures
    problems = [f'template placeholder at {w}' for w in placeholders(recipe.get('process', {}))]
    for node in recipe.get('process', {}).get('nodes', []):
        op = OPS.get(node.get('op'))
        if not op:
            problems.append(f"{node.get('id')}: unknown op {node.get('op')}"); continue
        params = node.get('params', {})
        for e in Draft202012Validator(op.get('paramsSchema', {}), registry=registry).iter_errors(params):
            problems.append(f"{node['id']} params: {e.message[:120]}")
        env = op.get('envelope', {})
        if 'tempC' in env:
            lo, hi = env['tempC']['min'], env['tempC']['max']
            temps = [params['tempC']] if 'tempC' in params else []
            tgt = params.get('target')
            medium_sensors = {'water': 'liquid_temp', 'oil': 'oil_temp', 'pan_surface': 'pan_surface_temp', 'air': 'oven_temp', 'steam': 'chamber_temp', 'product': 'core_temp'}
            if tgt and tgt.get('unit') == 'degC' and tgt.get('sensor', '').endswith(medium_sensors.get(env['medium'], '#')):
                temps.append(tgt['value'])
            for t in temps:
                if not lo <= t <= hi:
                    problems.append(f"{node['id']}: {t} °C is outside the {node['op']} envelope {lo}–{hi} °C")
    for msg in problems:
        print(f'  {label} {msg}')
    failures += len(problems)
    print(f'{label} semantics: {"ok" if not problems else f"{len(problems)} problems"}')


for path in sorted((ROOT / 'examples').glob('*.cookwala.json')):
    check_recipe_semantics(json.loads(path.read_text()), path.name)

# ---- imported V0 recipes (RFC-0009): schema plus semantics, summarised
import time as _time
_t0 = _time.time(); _n = 0; _bad = 0
_rv = Draft202012Validator(json.loads((ROOT / 'schemas' / 'recipe.schema.json').read_text()), registry=registry)
for path in sorted((ROOT / 'recipes').rglob('*.cookwala.json')) if (ROOT / 'recipes').exists() else []:
    doc = json.loads(path.read_text()); _n += 1
    errs = [e.message[:100] for e in _rv.iter_errors(doc)]
    probs = [f"{n.get('id')}: unknown op {n.get('op')}" for n in doc.get('process', {}).get('nodes', []) if n.get('op') not in OPS]
    if doc.get('verification', {}).get('level') == 'V0' and any(n.get('op') != 'cw.op.legacy_step' for n in doc['process']['nodes']):
        probs.append('V0 document with an executable node (RFC-0009)')
    if errs or probs:
        _bad += 1
        if _bad <= 5: print(f'  recipes/{path.relative_to(ROOT / "recipes")}: {(errs + probs)[0]}')
failures += _bad
print(f'recipes/: {_n} imported documents, {_bad} with problems ({_time.time() - _t0:.1f}s)')

# ---- community recipe submissions (RFC-0013): namespace ownership and placement
sys.path.insert(0, str(ROOT / 'tools'))
import check_community_namespaces as _ccn
_ccn_problems = _ccn.check(ROOT)
for _p in _ccn_problems[:20]:
    print(f'  {_p}')
failures += len(_ccn_problems)
print(f'recipes/community/: {"ok" if not _ccn_problems else f"{len(_ccn_problems)} problem(s)"}')


# ---- strictness: every object schema with properties must say what to do with unknown fields
def strictness(node, where, in_branch=False):
    out = []
    if isinstance(node, dict):
        if isinstance(node.get('properties'), dict) and not in_branch and 'additionalProperties' not in node and 'unevaluatedProperties' not in node:
            out.append(where)
        for k, v in node.items():
            if k in ('properties', '$defs', 'patternProperties') and isinstance(v, dict):
                for kk, vv in v.items(): out += strictness(vv, f'{where}/{k}/{kk}')
            elif k in ('allOf', 'anyOf', 'oneOf') and isinstance(v, list):
                for i, vv in enumerate(v): out += strictness(vv, f'{where}/{k}/{i}', True)
            elif k in ('if', 'then', 'else', 'not'):
                out += strictness(v, f'{where}/{k}', True)
            elif isinstance(v, (dict, list)) and k not in ('enum', 'const', 'examples', 'default', 'required'):
                out += strictness(v, f'{where}/{k}', in_branch)
    elif isinstance(node, list):
        for i, v in enumerate(node): out += strictness(v, f'{where}/{i}', in_branch)
    return out


PERMISSIVE_BY_DESIGN = {'profile.schema.json': ('ClientProfile', 'KitchenProfile', 'CookwareProfile', 'RobotProfile', 'OrganizationProfile')}
loose = []
for sid, schema in schemas.items():
    name = sid.rsplit('/', 1)[-1]
    if '/legacy/' in sid or name.startswith('fifi-data'):
        continue  # describes existing fifi.cooking site data as it is; not a Cookwala format
    for w in strictness(schema, name):
        if not any(f'$defs/{d}' in w and w.endswith(d) for d in PERMISSIVE_BY_DESIGN.get(name, ())):
            loose.append(w)
for w in loose[:20]:
    print(f'  not strict: {w}')
failures += len(loose)
print(f'strictness: {"ok" if not loose else f"{len(loose)} loose objects"}')

for path in sorted((ROOT / 'sim' / 'out').glob('*.mission.json')) if (ROOT / 'sim' / 'out').exists() else []:
    check(json.loads(path.read_text()), BASE + 'mission.schema.json', 'sim/out/' + path.name)
for path in sorted((ROOT / 'site' / '.well-known').glob('cookwala.json')):
    check(json.loads(path.read_text()), BASE + 'catalog.schema.json#/$defs/Discovery', '.well-known/cookwala.json')

def refs(node):
    if isinstance(node, dict):
        for k, v in node.items():
            if k == '$ref' and isinstance(v, str): yield v
            else: yield from refs(v)
    elif isinstance(node, list):
        for v in node: yield from refs(v)


def resolve_pointer(doc, pointer):
    cur = doc
    for part in [p.replace('~1', '/').replace('~0', '~') for p in pointer.lstrip('/').split('/') if p]:
        cur = cur[part]
    return cur


for path in sorted((ROOT / 'api').glob('*.yaml')):
    api = yaml.safe_load(path.read_text())
    bad = []
    for r in refs(api):
        try:
            if r.startswith('#'):
                resolve_pointer(api, r[1:])
            elif r.startswith(BASE):
                base, _, frag = r.partition('#')
                if base not in schemas: raise KeyError(base)
                if frag: resolve_pointer(schemas[base], frag)
            else:
                raise KeyError('unexpected external ref')
        except (KeyError, IndexError, TypeError):
            bad.append(r)
    for r in bad:
        print(f'  {path.name}: unresolved $ref {r}')
    failures += len(bad)
    print(f'{path.name}: yaml ok, refs {"ok" if not bad else f"{len(bad)} unresolved"}')
build_schema((ROOT / 'api' / 'schema.graphql').read_text())
print('schema.graphql: ok')

sys.exit(1 if failures else 0)
