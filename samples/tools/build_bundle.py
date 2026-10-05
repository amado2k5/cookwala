#!/usr/bin/env python3
"""Build samples/data/bundle.json from this repository, and copy it into the ports that need a copy.

The bundle is the only data the sample ports carry: operation envelopes (vocab/ops.json), hob heat
bands (vocab/units.json), the default SafetyLimits pack, four example recipes, four example devices,
and the expected answers of the reference library (tools/cookwala_ref.py) for hashing,
canonical JSON and dry runs. Every port tests itself against those expected answers, so a port that
drifts from the reference fails its own tests.

    python samples/tools/build_bundle.py           # write the bundle and the copies
    python samples/tools/build_bundle.py --check   # exit 1 if any committed copy is stale (CI)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools'))
import cookwala_ref as ref  # noqa: E402

RECIPES = ['shakshuka', 'lentil-soup', 'koshari', 'salata-baladi']
DEVICES = ['robot-arm', 'demo-hob-robot', 'demo-hob-robot-basic', 'demo-oven']
OUT = ROOT / 'samples' / 'data' / 'bundle.json'
COPIES = [ROOT / 'samples' / 'python' / 'cookwala_samples' / 'data' / 'bundle.json',
          ROOT / 'samples' / 'js' / 'data' / 'bundle.json']
# The reference dry run trusts a sensor whose calibration has not expired at "now"; the bundle pins one instant.
NOW = '2026-10-05T00:00:00Z'

CANON_VECTORS = [
    {'a': 1, 'b': [True, False, None]},
    {'numbers': [0, -0.0, 1.0, 0.1, 1e21, 1e-7, 123456789012, -1.5, 1e300, 5e-324]},
    {'€': 'euro', '\r': 'cr', '😀': 'emoji', 'a': 'ascii', 'é': 'e-acute'},
    {'s': 'tab\there "quote" back\\slash \u0001 \u001f nl\n arabic شكشوكة'},
    [[], {}, '', 0],
]


def ops_subset():
    out = {}
    for e in json.loads((ROOT / 'vocab' / 'ops.json').read_text())['entries']:
        env = e.get('envelope') or {}
        keep = {k: env[k] for k in ('medium', 'tempC', 'pressureKPa', 'unattended', 'sensorLadder') if k in env}
        out[e['id']] = {'label': e.get('label', {}).get('en', e['id']), 'executable': e.get('executable', True), 'envelope': keep}
    return out


def heat_bands():
    return {e['id'].split('.')[-1]: e['surfaceTempC'] for e in json.loads((ROOT / 'vocab' / 'units.json').read_text())['entries'] if 'surfaceTempC' in e}


def build():
    limits = json.loads((ROOT / 'profiles' / 'core' / 'safety-limits.default.json').read_text())
    recipes = {r: json.loads((ROOT / 'examples' / f'{r}.cookwala.json').read_text()) for r in RECIPES}
    devices = {d: json.loads((ROOT / 'examples' / 'capabilities' / f'{d}.json').read_text()) for d in DEVICES}
    dry = []
    for rid, r in recipes.items():
        for did, d in devices.items():
            for human in (False, True):
                res = ref.dry_run(r, d, human, True, limits, NOW)
                dry.append({'recipe': rid, 'device': did, 'humanPresent': human, 'state': res['state'],
                            'reason': res.get('refusal', {}).get('reason'), 'node': res.get('refusal', {}).get('node'),
                            'plan': [[p['node'], p['by'], p['verifiedBy']] for p in res['plan']]})
    return {
        'bundle': 'cookwala-samples',
        'core': '0.2.0',
        'generatedFrom': 'vocab/ops.json, vocab/units.json, profiles/core/safety-limits.default.json, examples/*.cookwala.json, examples/capabilities/*.json, tools/cookwala_ref.py',
        'license': 'Vocabularies CC0-1.0; recipes CC-BY-4.0 (see each recipe license and source); limits pack and expected values Apache-2.0',
        'now': NOW,
        'ops': ops_subset(),
        'heatBands': heat_bands(),
        'safetyLimits': limits,
        'recipes': recipes,
        'devices': devices,
        'expected': {
            'hashes': {rid: ref.doc_hash(r) for rid, r in recipes.items()},
            'canonical': [{'value': v, 'text': ref.canonical(v)} for v in CANON_VECTORS],
            'dryRuns': dry,
        },
    }


def main(argv):
    text = json.dumps(build(), ensure_ascii=False, indent=1) + '\n'
    targets = [OUT, *COPIES]
    if '--check' in argv:
        stale = [str(p.relative_to(ROOT)) for p in targets if not p.exists() or p.read_text() != text]
        if stale:
            print('stale: ' + ', '.join(stale) + '\nrun: python samples/tools/build_bundle.py'); return 1
        print('bundle up to date'); return 0
    for p in targets:
        p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text)
    print(f'wrote {len(targets)} copies, {len(text) // 1024} KiB each'); return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
