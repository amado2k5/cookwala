#!/usr/bin/env python3
"""Machine-translate the website content with a local model (Ollama), structure-preserving and resumable.

    python tools/translate_site.py --langs fr,es [--what strings,for,pages,whitepaper] [--model gemma4:26b]
    python tools/translate_site.py --all                       # every fifi language, strings first, then pages

Output per language under site/content/<lang>/: strings.json, for.json (slug -> block), one HTML fragment
per English page, and a marker file .machine-translated. The whitepaper goes to docs/i18n/<lang>/WHITEPAPER.md.
What is kept byte for byte: tags and attributes, hrefs, ids, classes, data-* values, <code>/<pre> content,
{{placeholders}}, SMS keywords, identifiers, numbers and units. Only human-readable text is translated, block by
block, with the glossary from tools/translate_docs.py. Every page built from these files carries a visible
"machine-translated, English is the reference" notice (tools/build_site.py).
"""
import argparse
import datetime as dt
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from translate_docs import LANG_NAMES, GLOSSARY, chat  # noqa: E402

AUTONYM = {'fr': 'Français', 'es': 'Español', 'ja': '日本語', 'hi': 'हिन्दी', 'pt': 'Português', 'ru': 'Русский', 'zh': '简体中文', 'de': 'Deutsch', 'it': 'Italiano', 'el': 'Ελληνικά', 'ur': 'اردو', 'fa': 'فارسی', 'tr': 'Türkçe', 'ku': 'Kurdî', 'id': 'Bahasa Indonesia', 'sw': 'Kiswahili', 'ko': '한국어', 'nl': 'Nederlands', 'ps': 'پښتو', 'he': 'עברית', 'pl': 'Polski', 'sv': 'Svenska', 'te': 'తెలుగు', 'ar': 'العربية', 'en': 'English'}
BLOCK_TAGS = ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'td', 'th', 'dt', 'dd', 'label', 'button', 'option', 'summary', 'figcaption', 'blockquote')
SKIP_TAGS = ('code', 'pre', 'script', 'style', 'kbd', 'samp')
PLACEHOLDER = re.compile(r'\{\{[^}]+\}\}')
SEP = '\n⟪⟫\n'


def protect(s):
    """Replace {{placeholders}} and <code>…</code> spans with numbered tokens the model must keep."""
    keep = []
    def tok(m):
        keep.append(m.group(0)); return f'⟦{len(keep) - 1}⟧'
    s = re.sub(r'<(code|kbd|samp)\b[^>]*>.*?</\1>', tok, s, flags=re.S)
    s = PLACEHOLDER.sub(tok, s)
    return s, keep


def restore(s, keep):
    for i, k in enumerate(keep): s = s.replace(f'⟦{i}⟧', k)
    return s


def translate_blocks(model, host, lang, blocks):
    """Translate a list of HTML/plain blocks in batches; returns the same number of strings."""
    out = [None] * len(blocks)
    todo = [i for i, b in enumerate(blocks) if b.strip() and not re.fullmatch(r'[\s\d.,;:%°+\-/()×·|→←→#]*', b)]
    for i in range(len(blocks)):
        if i not in todo: out[i] = blocks[i]
    batch = 6
    for start in range(0, len(todo), batch):
        idx = todo[start:start + batch]
        prot = [protect(blocks[i]) for i in idx]
        prompt = (f"Translate each block below from English into {LANG_NAMES[lang]}. Blocks are separated by the line ⟪⟫; output the translated blocks separated by the same line ⟪⟫, in the same order, the same number of blocks.\n"
                  "Rules: a block may contain HTML tags and attributes: keep every tag, attribute, href, id, class and data value exactly; translate only the human-readable text between tags (and the text of title/alt/aria-label/placeholder attributes). Keep tokens like ⟦3⟧ exactly where they are. Do not translate or alter identifiers (cw.op.simmer, needs_human_present), SMS keywords (OFFER, CLAIM, HAND, DIST, MENU, HELP, CANCEL and codes like T4.6, UB0511), file paths, URLs, numbers, units (°C), or the proper noun Cookwala. Plain, exact wording; nothing added, nothing summarised, no notes.\n"
                  f"Glossary to keep consistent: {GLOSSARY}.\nOutput only the translated blocks.\n\n" + SEP.join(p[0] for p in prot))
        try:
            resp = chat(host, model, prompt)
        except Exception as e:
            print(f'   batch error {e}; keeping English', flush=True); resp = SEP.join(p[0] for p in prot)
        parts = [x.strip() for x in re.split(r'\n?⟪⟫\n?', resp.strip())]
        if len(parts) != len(idx):
            # retry one by one
            parts = []
            for p in prot:
                try: parts.append(chat(host, model, prompt.split('\n\n', 1)[0].replace('Blocks are separated by the line ⟪⟫; output the translated blocks separated by the same line ⟪⟫, in the same order, the same number of blocks.', 'Output only the translated block.') + '\n\n' + p[0]).strip())
                except Exception: parts.append(p[0])
        for i, (p, t) in enumerate(zip(prot, parts)):
            t = re.sub(r'^```[a-z]*\n?', '', t); t = re.sub(r'\n?```$', '', t)
            r = restore(t, p[1])
            if r.count('<') != blocks[idx[i]].count('<') or any(f'⟦' in r for _ in [0]):
                r = blocks[idx[i]]  # structure changed: keep English rather than ship a broken block
            out[idx[i]] = r
    return out


def split_html(fragment):
    """Yield (kind, text): 'keep' for markup, 'block' for translatable inner HTML of block elements."""
    out = []; pos = 0
    pat = re.compile(r'<(%s)\b([^>]*)>(.*?)</\1>' % '|'.join(BLOCK_TAGS), re.S)
    for m in pat.finditer(fragment):
        inner = m.group(3)
        if re.search(r'<(%s)\b' % '|'.join(BLOCK_TAGS), inner):  # nested block: handle the inner blocks instead
            continue
        out.append(('keep', fragment[pos:m.start(3)])); out.append(('block', inner)); pos = m.end(3)
    out.append(('keep', fragment[pos:]))
    return out


def translate_fragment(model, host, lang, text):
    m = re.match(r'\s*<!--meta\s*(\{.*?\})\s*-->', text, re.S)
    meta = json.loads(m.group(1)); body = text[m.end():]
    parts = split_html(body)
    blocks = [t for k, t in parts if k == 'block']
    tr = translate_blocks(model, host, lang, [meta.get('title', ''), meta.get('description', '')] + blocks)
    meta['title'], meta['description'] = tr[0], tr[1]
    it = iter(tr[2:])
    rebuilt = ''.join(t if k == 'keep' else next(it) for k, t in parts)
    return '<!--meta ' + json.dumps(meta, ensure_ascii=False) + ' -->' + rebuilt


def walk_strings(obj, skip_keys=('font_link',)):
    """Collect translatable string leaves (path, value) from a JSON structure; URLs and paths are skipped."""
    found = []
    def rec(o, path):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in skip_keys: continue
                rec(v, path + [k])
        elif isinstance(o, list):
            for i, v in enumerate(o): rec(v, path + [i])
        elif isinstance(o, str):
            if o.startswith(('/', 'http', 'mailto:')) or not re.search(r'[A-Za-z]{2}', o): return
            found.append((path, o))
    rec(obj, []); return found


def set_path(obj, path, value):
    for p in path[:-1]: obj = obj[p]
    obj[path[-1]] = value


def translate_json_value(model, host, lang, obj):
    leaves = walk_strings(obj)
    tr = translate_blocks(model, host, lang, [v for _, v in leaves])
    for (path, _), v in zip(leaves, tr): set_path(obj, path, v)
    return obj


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--langs', default=','.join(l for l in LANG_NAMES if l != 'ar')); ap.add_argument('--what', default='strings,for,pages,whitepaper,scenarios')
    ap.add_argument('--model', default='gemma4:26b'); ap.add_argument('--host', default='http://localhost:11434'); ap.add_argument('--force', action='store_true'); ap.add_argument('--all', action='store_true')
    a = ap.parse_args()
    langs = [l for l in a.langs.split(',') if l in LANG_NAMES and l != 'ar']
    what = a.what.split(',')
    en_strings = json.loads((ROOT / 'site' / 'content' / 'strings.json').read_text())['en']
    for_groups = json.loads((ROOT / 'site' / 'content' / 'for.json').read_text())['groups']
    pages = sorted((ROOT / 'site' / 'content' / 'en').glob('*.html'))
    for lang in langs:
        d = ROOT / 'site' / 'content' / lang; d.mkdir(parents=True, exist_ok=True)
        t0 = dt.datetime.now()
        if 'strings' in what and (a.force or not (d / 'strings.json').exists()):
            s = translate_json_value(a.model, a.host, lang, json.loads(json.dumps(en_strings)))
            s['switch'] = AUTONYM[lang]
            (d / 'strings.json').write_text(json.dumps(s, ensure_ascii=False, indent=1) + '\n'); print(f'{lang} strings done', flush=True)
        if 'for' in what and (a.force or not (d / 'for.json').exists()):
            out = {g['slug']: translate_json_value(a.model, a.host, lang, json.loads(json.dumps(g['en']))) for g in for_groups}
            (d / 'for.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n'); print(f'{lang} for.json done', flush=True)
        if 'pages' in what:
            for p in pages:
                dst = d / p.name
                if dst.exists() and not a.force: continue
                dst.write_text(translate_fragment(a.model, a.host, lang, p.read_text()) + '\n'); print(f'{lang} {p.name} done', flush=True)
        if 'scenarios' in what:
            sd = ROOT / 'scenarios' / 'i18n'; sd.mkdir(exist_ok=True); sf = sd / f'{lang}.json'
            done = json.loads(sf.read_text()) if sf.exists() else {}
            for p in sorted((ROOT / 'scenarios').glob('[0-9][0-9][0-9]-*.json')):
                s = json.loads(p.read_text(encoding='utf-8'))
                if s['id'] in done and not a.force: continue
                blocks = [s['title']['en'], s['goal']['en'], (s.get('outcome') or {}).get('en', '')] + [st['note']['en'] for st in s['steps']]
                tr = translate_blocks(a.model, a.host, lang, blocks)
                done[s['id']] = {'title': tr[0], 'goal': tr[1], 'outcome': tr[2], 'notes': tr[3:]}
                sf.write_text(json.dumps(done, ensure_ascii=False, indent=1) + '\n')
            print(f'{lang} scenarios done', flush=True)
        if 'whitepaper' in what:
            from translate_docs import translate_doc
            r = translate_doc(a.host, a.model, lang, ROOT / 'docs' / 'WHITEPAPER.md', ROOT / 'docs' / 'i18n' / lang / 'WHITEPAPER.md', a.force); print(f'{lang} whitepaper {r}', flush=True)
        (d / '.machine-translated').write_text(f'{a.model} {dt.date.today().isoformat()}\n')
        print(f'{lang}: {(dt.datetime.now() - t0).seconds}s', flush=True)


if __name__ == '__main__':
    main()
