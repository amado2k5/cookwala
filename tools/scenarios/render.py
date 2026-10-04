#!/usr/bin/env python3
"""Render every scenario in scenarios/*.json into code samples, one per language, plus a Markdown page.

    python tools/scenarios/render.py [--out OUT_DIR] [--lang python,typescript,...] [--ids 001,002]

A language module lives in tools/scenarios/lang_<name>.py and exposes:
    EXT, LABEL, RUN (how to run the sample, one line), and a Renderer class with
    header(scenario), comment(text), lit(value), file(path), var(name, path), call(op, args, save),
    expect(var, path, value), wait(seconds), footer()
where `args` is a list of (name, expr-string) in the operation's canonical order (SIGNATURES
below), `op` is the canonical camelCase operation name and `save` the variable to assign to.
The base renderer resolves {"$file"}, {"$var"} and literals into expressions and keeps the
sample structure identical across languages so a reader can compare them side by side.
"""
import argparse
import importlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SCEN = ROOT / 'scenarios'
sys.path.insert(0, str(ROOT / 'tools' / 'scenarios'))

SIGNATURES = {
    'hash': ['doc'], 'verify': ['doc', 'keys'], 'dryRun': ['recipe', 'recipeId', 'device', 'deviceId', 'humanPresent', 'allowModel'],
    'checkEnvelope': ['op', 'trace', 'target', 'altitudeM'], 'parseSms': ['text'], 'deriveConstraints': ['facets', 'role', 'consents'],
    'convert': ['value', 'unit', 'to', 'densityGPerMl'], 'ladder': ['op', 'sensors', 'allowModel', 'humanPresent'], 'validate': ['kind', 'doc'],
    'humanitarianCheck': ['docs', 'packs'], 'listRecipes': [], 'getRecipe': ['id'], 'getDevices': [], 'getOps': [], 'getRegistry': [],
    'capabilities': [], 'safetyLimits': [], 'recalls': [], 'conformance': [], 'startExecution': ['request', 'idempotencyKey', 'humanPresent'],
    'getExecution': ['id'], 'stopExecution': ['id', 'reason'], 'resumeExecution': ['id', 'seq'], 'executionLog': ['id'], 'reportIncident': ['doc'],
}
LANGS = ['python', 'typescript', 'javascript', 'curl', 'go', 'rust', 'java', 'kotlin', 'csharp', 'swift', 'cpp', 'ruby', 'php']


def load_scenarios(ids=None):
    out = []
    for p in sorted(SCEN.glob('[0-9][0-9][0-9]-*.json')):
        s = json.loads(p.read_text())
        if ids and s['id'] not in ids: continue
        out.append(s)
    return out


def resolve(r, value):
    """Turn a scenario argument value into a language expression string."""
    if isinstance(value, dict) and '$file' in value:
        e = r.file(value['$file'])
        return r.sub(e, value['path']) if value.get('path') else e
    if isinstance(value, dict) and '$var' in value: return r.var(value['$var'], value.get('path'))
    return r.lit(value)


def render_one(lang_mod, s, lang_code='en'):
    r = lang_mod.Renderer()
    out = [r.header(s)]
    for i, st in enumerate(s['steps'], 1):
        note = st['note'].get(lang_code) or st['note']['en']
        out.append(r.comment(f"Step {i}: {note}"))
        op = st['op']
        if op == 'wait':
            out.append(r.wait(st.get('seconds', 1))); continue
        if op == 'assert':
            for path, val in (st.get('expect') or {}).items():
                var, _, sub = path.partition('.')
                out.append(r.expect(var, sub or None, val))
            continue
        args = st.get('args') or {}
        ordered = [(name, resolve(r, args[name])) for name in SIGNATURES[op] if name in args]
        out.append(r.call(op, ordered, st.get('save')))
        for path, val in (st.get('expect') or {}).items():
            if st.get('save'): out.append(r.expect(st['save'], path, val))
    out.append(r.footer())
    return '\n'.join(x for x in out if x is not None)


def render_markdown(s, samples, lang_code='en'):
    L = lambda m: (m.get(lang_code) or m['en']) if isinstance(m, dict) else m
    md = [f"# {s['id']} · {L(s['title'])}", '', L(s['goal']), '', f"Audience: {s['audience']} · Goals: {', '.join(s['northStar'])} · Level: {s.get('level', 'beginner')}", '', '## Steps', '']
    for i, st in enumerate(s['steps'], 1):
        md.append(f"{i}. {L(st['note'])}" + (f" (`{st['op']}`)" if st['op'] not in ('wait', 'assert') else ''))
    md += ['', '## Command line', '', '```bash'] + s['cli'] + ['```', '']
    if s.get('outcome'): md += ['## Outcome', '', L(s['outcome']), '']
    for lang, (label, ext, code, run) in samples.items():
        md += [f'## {label}', '', f'Run: `{run}`', '', f'```{ext.lstrip(".")}', code, '```', '']
    return '\n'.join(md)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(ROOT / 'scenarios' / 'out'))
    ap.add_argument('--lang', default=','.join(LANGS))
    ap.add_argument('--ids', default='')
    a = ap.parse_args()
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    mods = {}
    for lang in a.lang.split(','):
        try: mods[lang] = importlib.import_module(f'lang_{lang}')
        except ModuleNotFoundError: print(f'  (no renderer for {lang} yet)')
    n = 0
    for s in load_scenarios(a.ids.split(',') if a.ids else None):
        d = out / f"{s['id']}-{s['slug']}"; d.mkdir(parents=True, exist_ok=True)
        samples = {}
        for lang, mod in mods.items():
            code = render_one(mod, s)
            (d / f"sample{mod.EXT}").write_text(code + '\n') if lang == 'python' else None
            (d / f"{lang}{mod.EXT}").write_text(code + '\n')
            samples[lang] = (mod.LABEL, mod.EXT, code, mod.RUN.format(id=s['id'], slug=s['slug'], ext=mod.EXT))
        (d / 'README.md').write_text(render_markdown(s, samples) + '\n')
        n += 1
    print(f'rendered {n} scenarios x {len(mods)} languages into {out}')


if __name__ == '__main__':
    main()
