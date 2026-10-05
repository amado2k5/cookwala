"""Run the Cookwala Core conformance vectors (and the profile vectors) against the reference library.

    python tools/run_conformance.py                       # all suites: conformance/*.json and conformance/profiles/*.json
    python tools/run_conformance.py envelope              # one suite
    python tools/run_conformance.py --report report.json --key SEED_HEX --kid did:web:you.example#k1
                                                          # also write a signed ConformanceReport (RFC-0008)
    python tools/run_conformance.py --verify-report report.json [--keys keys.json]
                                                          # check a report: schema, hash, signature, published vectors hash
The vectors hash of this commit is in conformance/VECTORS-HASH.txt (written by make_conformance.py);
a report whose vectorsHash differs was not run against these vectors. Unsigned reports are not written:
the key seed may also come from $COOKWALA_REPORT_KEY and the kid from $COOKWALA_REPORT_KID.

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
    if k == 'dryrun':
        r = ref.dry_run(i['recipe'], i['capabilities'], i.get('humanPresent', False), i.get('allowModel', True), i.get('limits'))
        return {'state': r['state'], 'reason': (r.get('refusal') or {}).get('reason'), 'by': [p['by'] for p in r.get('plan', [])]}
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


def _opt(name, env=None):
    if name in sys.argv: return sys.argv[sys.argv.index(name) + 1]
    import os
    return os.environ.get(env) if env else None


def vectors_hash():
    """Hash of every (suite, vector id, expected) triple: the identity of this vector set."""
    used = []
    for path in sorted((ROOT / 'conformance').glob('*.json')) + sorted((ROOT / 'conformance' / 'profiles').glob('*.json')):
        suite = path.stem if path.parent.name == 'conformance' else f'profiles/{path.stem}'
        for v in json.loads(path.read_text()): used.append([suite, v['id'], v['expected']])
    return ref.doc_hash(sorted(used, key=lambda x: (x[0], x[1])))


def verify_report(path, keys_path=None):
    """Verify a ConformanceReport: schema, hash, signature (when keys are given) and the published vectors hash."""
    rep = json.loads(pathlib.Path(path).read_text())
    problems = []
    schema = Draft202012Validator({'$ref': 'https://cookwala.ai/v1/schemas/conformance.schema.json#/$defs/ConformanceReport'}, registry=REG)
    problems += [f"schema: {'/'.join(map(str, e.absolute_path)) or '$'}: {e.message[:120]}" for e in schema.iter_errors(rep)]
    body = {k: v for k, v in rep.items() if k not in ('hash', 'signature')}
    if rep.get('hash') != ref.doc_hash(body): problems.append('hash: does not match the report body')
    if keys_path:
        ok, why = ref.verify(rep, json.loads(pathlib.Path(keys_path).read_text()))
        if not ok: problems.append(f'signature: {why}')
    else:
        problems.append('signature: not checked (pass --keys with the signer\'s KeyRecords)')
    published = (ROOT / 'conformance' / 'VECTORS-HASH.txt')
    if published.exists() and rep.get('vectorsHash') != published.read_text().strip():
        problems.append(f"vectorsHash: {rep.get('vectorsHash')} is not this commit's vector set ({published.read_text().strip()})")
    for s in rep.get('suites', []):
        if s.get('failed') and rep.get('claim'): problems.append(f"suite {s['suite']} has failures; a report that fails a vector of a class may not claim that class")
    return problems


def main():
    if '--verify-report' in sys.argv:
        problems = verify_report(_opt('--verify-report'), _opt('--keys'))
        hard = [p for p in problems if not p.startswith('signature: not checked')]
        for p in problems: print(('FAIL ' if not p.startswith('signature: not checked') else 'NOTE ') + p)
        print('report: ' + ('ok' if not hard else f'{len(hard)} problem(s)'))
        sys.exit(1 if hard else 0)
    report_path = _opt('--report')
    key_seed, kid = _opt('--key', 'COOKWALA_REPORT_KEY'), _opt('--kid', 'COOKWALA_REPORT_KID')
    if report_path and not (key_seed and kid):
        print('a ConformanceReport must be signed: pass --key SEED_HEX --kid KID (or set COOKWALA_REPORT_KEY and COOKWALA_REPORT_KID)'); sys.exit(2)
    skip = {report_path, key_seed, kid, _opt('--keys'), _opt('--note')}
    args = [a for a in sys.argv[1:] if not a.startswith('--') and a not in skip]
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
    vh = vectors_hash(); published = ROOT / 'conformance' / 'VECTORS-HASH.txt'
    if not only and published.exists() and published.read_text().strip() != vh:
        print(f'FAIL vectors hash {vh} differs from conformance/VECTORS-HASH.txt; the vector set changed without make_conformance.py'); failed += 1
    if report_path:
        import datetime as dt, subprocess
        try: commit = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, cwd=ROOT).stdout.strip()[:40]
        except Exception: commit = ''
        report = {'profile': '0.1.0', 'kind': 'ConformanceReport', 'id': f'report-{dt.date.today().isoformat()}-reference', 'core': '0.2.0', 'claim': 'verifier',
                  'subject': {'name': 'cookwala_ref.py', 'vendor': 'cookwala.ai', 'version': '0.2.0'}, 'suites': suites,
                  'vectorsHash': ref.doc_hash(sorted(used, key=lambda x: (x[0], x[1]))), 'tool': {'name': 'run_conformance.py', 'version': '0.2.0', **({'commit': commit} if commit else {})},
                  'date': dt.date.today().isoformat(), 'status': 'self_declared'}
        note = _opt('--note')
        if note: report['notes'] = note
        report['hash'] = ref.doc_hash(report)
        report['signature'] = ref.sign(report, key_seed, kid, signed_at=dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))
        pathlib.Path(report_path).write_text(json.dumps(report, indent=1) + '\n')
        print(f'report -> {report_path}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
