#!/usr/bin/env python3
"""Execute every scenario against a reference hub and check the expectations.

    python tools/scenarios/run.py [--ids 001,002] [--hub http://localhost:7878] [--keep-going]

Without --hub, a hub is started on a free port with the example recipes at --speed 200. The
results (what each step returned) are written to scenarios/out/<id>-<slug>/result.json so the
site can show real output next to the code. Exit code 1 if any scenario fails.
"""
import argparse
import json
import pathlib
import re
import socket
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'sdk' / 'python'))
sys.path.insert(0, str(ROOT / 'tools' / 'scenarios'))
from cookwala.client import CookwalaClient, CookwalaProblem  # noqa: E402
from render import SIGNATURES, load_scenarios  # noqa: E402


def snake(name): return re.sub(r'([A-Z])', lambda m: '_' + m.group(1).lower(), name)


def pick(obj, path):
    for part in path.replace(']', '').replace('[', '.').split('.'):
        if part == 'length': obj = len(obj)
        elif part.isdigit(): obj = obj[int(part)]
        else: obj = obj.get(part) if isinstance(obj, dict) else None
    return obj


def resolve(v, vars_):
    if isinstance(v, dict) and '$file' in v:
        doc = json.loads((ROOT / v['$file']).read_text())
        return pick(doc, v['path']) if v.get('path') else doc
    if isinstance(v, dict) and '$var' in v:
        base = vars_[v['$var']]
        return pick(base, v['path']) if v.get('path') else base
    return v


def run_scenario(s, client):
    vars_ = {}; log = []; failures = []
    for i, st in enumerate(s['steps'], 1):
        op = st['op']
        if op == 'wait': time.sleep(st.get('seconds', 1)); continue
        if op == 'assert':
            for path, want in (st.get('expect') or {}).items():
                var, _, sub = path.partition('.')
                got = pick(vars_[var], sub) if sub else vars_[var]
                if got != want: failures.append(f'step {i}: {path} = {got!r}, expected {want!r}')
            continue
        args = {k: resolve(v, vars_) for k, v in (st.get('args') or {}).items()}
        try:
            if op == 'dryRun': out = client.dry_run(**{snake(k): v for k, v in args.items()})
            else: out = getattr(client, snake(op))(*[args[n] for n in SIGNATURES[op] if n in args])
        except CookwalaProblem as p:
            if op in ('startExecution', 'stopExecution', 'resumeExecution'): out = p.body
            else: failures.append(f'step {i} {op}: {p}'); log.append({'step': i, 'op': op, 'error': p.body}); continue
        log.append({'step': i, 'op': op, 'result': out})
        if st.get('save'): vars_[st['save']] = out
        for path, want in (st.get('expect') or {}).items():
            got = pick(out, path)
            if got != want: failures.append(f'step {i} {op}: {path} = {got!r}, expected {want!r}')
    return failures, log


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', default=''); ap.add_argument('--hub', default=''); ap.add_argument('--keep-going', action='store_true')
    a = ap.parse_args()
    proc = None; base = a.hub
    if not base:
        s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
        proc = subprocess.Popen([sys.executable, str(ROOT / 'hub' / 'cookwala_hub.py'), '--port', str(port), '--recipes', str(ROOT / 'examples'), '--speed', '200'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        base = f'http://127.0.0.1:{port}'
        for _ in range(50):
            try: CookwalaClient(base).capabilities(); break
            except Exception: time.sleep(0.1)
    client = CookwalaClient(base)
    out_dir = ROOT / 'scenarios' / 'out'
    total = failed = 0
    try:
        for s in load_scenarios(a.ids.split(',') if a.ids else None):
            total += 1
            failures, log = run_scenario(s, client)
            d = out_dir / f"{s['id']}-{s['slug']}"; d.mkdir(parents=True, exist_ok=True)
            (d / 'result.json').write_text(json.dumps({'id': s['id'], 'ok': not failures, 'failures': failures, 'steps': log}, ensure_ascii=False, indent=1) + '\n')
            if failures:
                failed += 1; print(f"FAIL {s['id']} {s['slug']}: " + '; '.join(failures[:3]))
                if not a.keep_going: break
            else: print(f"ok   {s['id']} {s['slug']}")
    finally:
        if proc: proc.terminate()
    print(f'scenarios: {total - failed}/{total} passed')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
