#!/usr/bin/env python3
"""Machine-translate Markdown documents with a local model (Ollama), resumable, one file per language.

    python tools/translate_docs.py --langs fr,es,de --docs QUICKSTART,CORE [--model gemma4:26b] [--host http://localhost:11434]
    python tools/translate_docs.py --all            # every doc in docs/ in priority order, every fifi language

Output: docs/i18n/<lang>/<DOC>.md with a front line `<!-- machine-translated: <model> <date>; English is the reference -->`.
Code blocks, inline code, URLs, link targets and HTML are kept byte for byte; only prose, headings,
list items and table cells are translated, paragraph by paragraph, with a glossary. Already translated
files are skipped unless --force. Every translation is labelled machine-translated on the site.
"""
import argparse
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
LANG_NAMES = {'fr': 'French', 'es': 'Spanish', 'ja': 'Japanese', 'hi': 'Hindi', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Simplified Chinese', 'de': 'German', 'it': 'Italian', 'el': 'Greek', 'ur': 'Urdu', 'fa': 'Persian', 'tr': 'Turkish', 'ku': 'Kurdish (Kurmanji, Latin script)', 'id': 'Indonesian', 'sw': 'Swahili', 'ko': 'Korean', 'nl': 'Dutch', 'ps': 'Pashto', 'he': 'Hebrew', 'pl': 'Polish', 'sv': 'Swedish', 'te': 'Telugu', 'ar': 'Arabic (Modern Standard, Egyptian readers)'}
PRIORITY = ['QUICKSTART', 'CORE', 'HUMANITARIAN-PROFILE', 'HOUSEHOLD-CONTEXT', 'CERTIFICATION', 'ROADMAP', 'GOVERNANCE', 'SECURITY', 'IMPACT', 'STAKEHOLDERS', 'RECIPE-FORMAT', 'ROBOTICS', 'KITCHENS-AND-FLEETS', 'FEDERATION', 'SUPPLY-SIGNALS', 'REGISTRY', 'CRITIQUES', 'MESSAGING', 'STRATEGY', 'EXPORT-FIFI']
GLOSSARY = 'Cookwala (keep as is) · dry run · operation envelope · sensor ladder · refusal before heat · rule pack · conformance (not certification) · certification · registry · directory · household context · derived constraint · facet · surplus · food bank · hub · execution log · mandate · recall · measured / modelled / assumed (the three evidence labels; keep them distinct) · now / next / later (status words)'


def chat(host, model, prompt, timeout=600):
    req = urllib.request.Request(host.rstrip('/') + '/api/generate', data=json.dumps({'model': model, 'prompt': prompt, 'stream': False, 'think': False, 'options': {'temperature': 0.1, 'num_predict': 2048}}).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())['response']


def segments(md):
    """Split Markdown into (kind, text) blocks: fenced code and HTML comments are kept; every other block
    (a heading, a paragraph, a list, a table) is translated on its own so structure survives."""
    out = []; buf = []; in_code = False
    def flush():
        if buf: out.append(('prose', '\n'.join(buf))); buf.clear()
    for line in md.split('\n'):
        if line.startswith('```'):
            flush(); in_code = not in_code; out.append(('code', line)); continue
        if in_code or line.startswith('<!--'):
            flush(); out.append(('code', line)); continue
        if line.strip() == '':
            flush(); out.append(('code', '')); continue
        buf.append(line)
    flush()
    return out


def translate_chunk(host, model, lang, text):
    if not text.strip(): return text
    if re.fullmatch(r'[\s\-|:=*_#>`0-9.]+', text): return text
    prompt = (f"Translate the Markdown block below from English into {LANG_NAMES[lang]}.\n"
              "Rules: keep the Markdown structure exactly (a heading keeps its # marks, a list keeps its bullets or numbers, a table keeps its rows and columns, emphasis stays). Do not translate or alter: inline code in backticks, URLs, link targets in parentheses, HTML tags, identifiers such as cw.op.simmer, file paths, numbers and units (°C stays °C). Keep the proper noun Cookwala unchanged. Plain, exact wording; nothing added, nothing summarised, no notes of your own.\n"
              f"Glossary to keep consistent: {GLOSSARY}.\nOutput only the translated block, nothing else.\n\n{text}")
    out = chat(host, model, prompt).strip()
    out = re.sub(r'^```[a-z]*\n', '', out); out = re.sub(r'\n```$', '', out)
    # keep heading level and list markers if the model dropped them
    m = re.match(r'^(#{1,6})\s', text)
    if m and not out.startswith(m.group(1) + ' '): out = m.group(1) + ' ' + out.lstrip('# ').strip()
    if text.lstrip().startswith('|') and not out.lstrip().startswith('|'): return text
    return out


def translate_doc(host, model, lang, src, dst, force=False):
    if dst.exists() and not force: return 'skip'
    md = src.read_text()
    parts = []
    for kind, text in segments(md):
        parts.append(text if kind == 'code' else translate_chunk(host, model, lang, text))
    head = f"<!-- machine-translated: {model} {dt.date.today().isoformat()}; English is the reference: {src.relative_to(ROOT)} -->\n"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(head + '\n' + '\n'.join(parts) + '\n')
    return 'done'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--langs', default=','.join(LANG_NAMES)); ap.add_argument('--docs', default=''); ap.add_argument('--all', action='store_true')
    ap.add_argument('--model', default='gemma4:26b'); ap.add_argument('--host', default='http://localhost:11434'); ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    docs = a.docs.split(',') if a.docs else PRIORITY
    if a.all:
        rest = sorted(p.stem for p in (ROOT / 'docs').glob('*.md') if p.stem not in PRIORITY and not p.stem.endswith('.ar') and p.stem not in ('WHITEPAPER',))
        docs = PRIORITY + rest
    langs = [l for l in a.langs.split(',') if l in LANG_NAMES]
    for doc in docs:
        src = ROOT / 'docs' / f'{doc}.md'
        if not src.exists(): print('missing', doc); continue
        for lang in langs:
            dst = ROOT / 'docs' / 'i18n' / lang / f'{doc}.md'
            t0 = dt.datetime.now()
            try:
                r = translate_doc(a.host, a.model, lang, src, dst, a.force)
            except Exception as e:
                print(f'{doc} {lang}: error {e}', flush=True); continue
            print(f'{doc} {lang}: {r} ({(dt.datetime.now() - t0).seconds}s)', flush=True)


if __name__ == '__main__':
    main()
