"""Bundle every Cookwala schema into one file for offline validators and devices.

    python tools/bundle_schemas.py OUT.json

The bundle maps each schema $id to its contents. Validators load it into their registry so no
network fetch of https://cookwala.ai is ever needed (devices must validate offline).
"""
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
schemas = {}
for p in sorted((ROOT / 'schemas').rglob('*.schema.json')):
    s = json.loads(p.read_text())
    schemas[s['$id']] = s
body = json.dumps(schemas, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
bundle = {'kind': 'SchemaBundle', 'version': '0.2.0', 'sha256': hashlib.sha256(body.encode()).hexdigest(), 'schemas': schemas}
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'schemas-bundle.json')
out.write_text(json.dumps(bundle, ensure_ascii=False) + '\n')
print(f'{len(schemas)} schemas -> {out} (sha256 {bundle["sha256"][:12]}…)')
