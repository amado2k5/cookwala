"""`cookwala-samples` command line.

    cookwala-samples demo [--format markdown|json|junit|csv] [--hub URL [--token T]] [--out FILE]
    cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]
    cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]
    cookwala-samples run DISH [DISH ...] [--human-present] [--fault recipe-id#node=sensor_fault|timeout|overheat] [--format F]
    cookwala-samples serve [--port 8080] [--bind 127.0.0.1]
    cookwala-samples list                                bundled recipes and devices
    cookwala-samples version

Offline by default: four simulated devices and four example recipes from the Cookwala repository.
`demo --hub URL` runs the fault-free jobs against a real hub (python hub/cookwala_hub.py).
Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage.
"""
import json
import os
import sys

from . import __version__
from .data import load_bundle
from .scenarios import demo
from .orchestrators import Job
from .service import handle, run_jobs, serve


def _opt(a, name, default=None):
    return a[a.index(name) + 1] if name in a else default


def _many(a, name):
    return [a[i + 1] for i, x in enumerate(a) if x == name and i + 1 < len(a)]


def _positional(a, flags_with_value):
    out, skip = [], False
    for i, x in enumerate(a):
        if skip: skip = False; continue
        if x in flags_with_value: skip = True; continue
        if x.startswith('--'): continue
        out.append(x)
    return out


def _emit(text, out=None):
    if out:
        with open(out, 'w', encoding='utf-8') as f: f.write(text)
        print(f'wrote {out}')
    else:
        sys.stdout.write(text if text.endswith('\n') else text + '\n')


def main(argv=None):
    a = sys.argv[1:] if argv is None else argv
    if not a or a[0] in ('-h', '--help', 'help'):
        print(__doc__); return 0 if a else 2
    cmd, a = a[0], a[1:]
    fmt = _opt(a, '--format', 'markdown')
    if cmd == 'version':
        print(f'cookwala-samples {__version__} (Core {load_bundle()["core"]})'); return 0
    if cmd == 'list':
        b = load_bundle()
        print('recipes: ' + ', '.join(sorted(b['recipes']))); print('devices: ' + ', '.join(sorted(b['devices']))); return 0
    if cmd == 'demo':
        rep = demo(hub_url=_opt(a, '--hub'), token=_opt(a, '--token', os.environ.get('COOKWALA_HUB_TOKEN')))
        _emit(rep.render(fmt), _opt(a, '--out')); return 0
    if cmd == 'serve':
        serve(int(_opt(a, '--port', os.environ.get('PORT', 8080))), _opt(a, '--bind', os.environ.get('BIND', '127.0.0.1'))); return 0
    if cmd == 'gates':
        pos = _positional(a, {'--device', '--block', '--format', '--out'})
        status, _, text = handle('POST', '/v1/samples/gates', {}, {'recipe': pos[0], 'device': _opt(a, '--device'), 'humanPresent': '--human-present' in a,
                                                                    'allergenBlocks': _many(a, '--block')})
        print(json.dumps(json.loads(text), indent=1, ensure_ascii=False)); return 0 if status == 200 and json.loads(text).get('allowed') else 1
    if cmd == 'plan':
        pos = _positional(a, {'--servings', '--block', '--format', '--out'})
        order = {'dish': ' '.join(pos), 'allergenBlocks': _many(a, '--block')}
        if _opt(a, '--servings'): order['servings'] = float(_opt(a, '--servings'))
        status, _, text = handle('POST', '/v1/samples/plan', {}, {'order': order, 'humanPresent': '--human-present' in a})
        print(json.dumps(json.loads(text), indent=1, ensure_ascii=False)); return 0 if status == 200 and json.loads(text).get('ok') else 1
    if cmd == 'run':
        pos = _positional(a, {'--fault', '--format', '--out', '--block'})
        if not pos: print(__doc__); return 2
        faults = dict(f.split('=', 1) for f in _many(a, '--fault'))
        jobs = [Job(f'{i + 1}-{d}', order={'dish': d, 'allergenBlocks': _many(a, '--block')}, human_present='--human-present' in a) for i, d in enumerate(pos)]
        rep = run_jobs(jobs, faults)
        _emit(rep.render(fmt), _opt(a, '--out'))
        return 0 if set(rep.summary()['outcomes']) <= {'completed'} else 1
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main())
