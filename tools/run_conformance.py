"""Run the Cookwala Core conformance vectors (and the profile vectors) against the reference library.

    python tools/run_conformance.py                       # all suites: conformance/*.json and conformance/profiles/*.json
    python tools/run_conformance.py envelope              # one suite
    python tools/run_conformance.py --report report.json  # also write a ConformanceReport (RFC-0008)

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
    # ---- profile vector kinds (conformance/profiles/, RFC-0001/0002/0003/0007)
    if k == 'disclosure_policy':
        return ref.derive_constraints(i['facets'], i['recipientRole'], i.get('consents'))
    if k == 'registry_name':
        ok, why = ref.registry_name_valid(i['name']); return {'valid': ok, 'reason': why}
    if k == 'registry_version':
        ok, why = ref.version_exact(i['version']); return {'exact': ok, 'reason': why}
    if k == 'sms_parse':
        return ref.parse_sms(i['text'])
    if k == 'signal_policy':
        ok, reasons = ref.check_signal(i['signal']); return {'ok': ok, 'reasons': reasons}
    raise ValueError(f'unknown kind {k}')


def main():
    report_path = sys.argv[sys.argv.index('--report') + 1] if '--report' in sys.argv else None
    args = [a for a in sys.argv[1:] if not a.startswith('--') and a != report_path]
    only = args[0] if args else None
    vec_schema = Draft202012Validator({'$ref': 'https://cookwala.ai/v1/schemas/core.schema.json#/$defs/ConformanceVector'}, registry=REG)
    prof_schema = Draft202012Validator({'$ref': 'https://cookwala.ai/v1/schemas/conformance.schema.json#/$defs/ProfileVector'}, registry=REG)
    total = failed = 0
    suites = []; used = []
    paths = sorted((ROOT / 'conformance').glob('*.json')) + sorted((ROOT / 'conformance' / 'profiles').glob('*.json'))
    for path in paths:
        suite = path.stem if path.parent.name == 'conformance' else f'profiles/{path.stem}'
        if only and path.stem != only: continue
        schema = vec_schema if path.parent.name == 'conformance' else prof_schema
        s_total = s_failed = 0; failed_ids = []
        for v in json.loads(path.read_text()):
            total += 1; s_total += 1
            errs = list(schema.iter_errors(v))
            got = run(v)
            used.append([suite, v['id'], v['expected']])
            if errs or got != v['expected']:
                failed += 1; s_failed += 1; failed_ids.append(v['id'])
                print(f'FAIL {suite}/{v["id"]}: expected {v["expected"]}, got {got}{" (vector invalid)" if errs else ""}')
        suites.append({'suite': suite, 'total': s_total, 'passed': s_total - s_failed, **({'failed': failed_ids} if failed_ids else {})})
    print(f'conformance: {total - failed}/{total} passed ({sum(1 for p in paths if p.parent.name == "conformance")} core suites, {sum(1 for p in paths if p.parent.name == "profiles")} profile suites)')
    if report_path:
        import datetime as dt, subprocess
        try: commit = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, cwd=ROOT).stdout.strip()[:40]
        except Exception: commit = ''
        report = {'profile': '0.1.0', 'kind': 'ConformanceReport', 'id': f'report-{dt.date.today().isoformat()}-reference', 'core': '0.2.0', 'claim': 'verifier',
                  'subject': {'name': 'cookwala_ref.py', 'vendor': 'cookwala.ai', 'version': '0.2.0'}, 'suites': suites,
                  'vectorsHash': ref.doc_hash(sorted(used, key=lambda x: (x[0], x[1]))), 'tool': {'name': 'run_conformance.py', 'version': '0.2.0', **({'commit': commit} if commit else {})},
                  'date': dt.date.today().isoformat(), 'status': 'self_declared'}
        report['hash'] = ref.doc_hash(report)
        pathlib.Path(report_path).write_text(json.dumps(report, indent=1) + '\n')
        print(f'report -> {report_path}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
