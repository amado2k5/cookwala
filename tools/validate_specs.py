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
for path in sorted((ROOT / 'site' / '.well-known').glob('cookwala.json')):
    check(json.loads(path.read_text()), BASE + 'catalog.schema.json#/$defs/Discovery', '.well-known/cookwala.json')

for path in sorted((ROOT / 'api').glob('*.yaml')):
    yaml.safe_load(path.read_text())
    print(f'{path.name}: yaml ok')
build_schema((ROOT / 'api' / 'schema.graphql').read_text())
print('schema.graphql: ok')

sys.exit(1 if failures else 0)
