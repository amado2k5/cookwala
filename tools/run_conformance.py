"""Run the Cookwala Core conformance vectors against the reference library.

    python tools/run_conformance.py            # all suites
    python tools/run_conformance.py envelope   # one suite

Other implementations can reuse conformance/*.json directly: each vector has an input and the
expected output. Exit status is non-zero if any vector fails.
"""
import json
import pathlib
import sys

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import cookwala_ref as ref  # noqa: E402

ROOT = ref.ROOT
schemas = {}
for p in (ROOT / 'schemas').glob('*.schema.json'):
    s = json.loads(p.read_text()); schemas[s['$id']] = s
REG = Registry().with_resources([(k, Resource.from_contents(v)) for k, v in schemas.items()])
QTY = Draft202012Validator({'$ref': 'https://cookwala.ai/v1/schemas/common.schema.json#/$defs/Quantity'}, registry=REG)


def run(v):
    i, k = v['input'], v['kind']
    if k == 'hash':
        body = {a: b for a, b in i.items() if a not in ('hash', 'signature')}
        return {'canonical': ref.canonical(body), 'hash': ref.doc_hash(i)}
    if k == 'signature':
        if 'seed' in i:
            from cryptography.hazmat.primitives.asymmetric import ed25519
            sk = ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(i['seed']))
            return {'publicKey': ref.public_key_from_seed(i['seed']), 'signatureHex': sk.sign(bytes.fromhex(i['messageHex'])).hex()}
        ok, why = ref.verify(i['document'], i['keys'])
        return {'ok': ok, 'reason': why}
    if k == 'disclosure':
        return {'ok': ref.verify_disclosure(i)}
    if k == 'ledger':
        if 'checkpoint' in i:
            ok, why, _ = ref.verify_chain(i['events'], i['keys'])
            if not ok: return {'ok': False, 'reason': why}
            ok, why = ref.verify_checkpoint(i['checkpoint'], i['events'], i['keys'])
            return {'ok': ok, 'reason': why}
        ok, why, head = ref.verify_chain(i['events'], i['keys'])
        return {'ok': ok, 'reason': why, **({'head': head} if ok else {})}
    if k == 'units':
        if 'quantity' in i:
            return {'schemaValid': not list(QTY.iter_errors(i['quantity']))}
        try:
            return {'value': round(ref.convert(i['value'], i['unit'], i['to'], i.get('density')), 6)}
        except ValueError as e:
            return {'error': 'needs_density' if 'density' in str(e) else str(e)}
    if k == 'envelope':
        if 'sensors' in i:
            return {'choice': ref.ladder_choice(i['op'], i['sensors'], i['allowModel'], i['humanPresent'])}
        return ref.check_envelope(i['op'], i['readings'], i['target'], i['altitudeM'])
    if k == 'execution_transition':
        return {'allowed': ref.execution_transition_allowed(i['from'], i['to'])}
    if k == 'mission_transition':
        return {'allowed': ref.mission_transition_allowed(i['from'], i['to'], i['role'])}
    raise ValueError(f'unknown kind {k}')


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    vec_schema = Draft202012Validator({'$ref': 'https://cookwala.ai/v1/schemas/core.schema.json#/$defs/ConformanceVector'}, registry=REG)
    total = failed = 0
    for path in sorted((ROOT / 'conformance').glob('*.json')):
        if only and path.stem != only: continue
        for v in json.loads(path.read_text()):
            total += 1
            errs = list(vec_schema.iter_errors(v))
            got = run(v)
            if errs or got != v['expected']:
                failed += 1
                print(f'FAIL {path.stem}/{v["id"]}: expected {v["expected"]}, got {got}{" (vector invalid)" if errs else ""}')
    print(f'conformance: {total - failed}/{total} passed')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
