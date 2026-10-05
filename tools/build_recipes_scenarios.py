"""Site build steps for the recipe index and the SDK scenarios (imported by tools/build_site.py).

Recipes: /v1/recipes/<id>.cookwala.json (all collections), /v1/recipes/<id>/text/<lang>.json sidecars,
/v1/index/<lang>/<page>.json (IndexEntry pages), /v1/index/<lang>/search.json (compact), /v1/manifest.json,
/recipes/<id>/ and /ar/recipes/<id>/ static pages, /<lang>/recipes/view/ viewer for the other languages.
Scenarios: /v1/scenarios/<id>/<lang>.<ext> samples and results, /<lang>/scenarios/<id>/ pages, the cards and
list placeholders of the scenarios page.
"""
import gzip
import hashlib
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SDK = [  # dir, label, ext, status (tested = run on the maintainer's machine; untested = reviewed, not compiled here yet)
    ('python', 'Python', 'py', 'tested'), ('typescript', 'TypeScript', 'ts', 'tested'), ('javascript', 'JavaScript', 'mjs', 'tested'), ('curl', 'curl', 'sh', 'tested'),
    ('go', 'Go', 'go', 'untested'), ('rust', 'Rust', 'rs', 'untested'), ('java', 'Java', 'java', 'tested'), ('kotlin', 'Kotlin', 'kt', 'untested'),
    ('csharp', 'C#', 'cs', 'untested'), ('swift', 'Swift', 'swift', 'tested'), ('cpp', 'C++', 'cpp', 'tested'), ('ruby', 'Ruby', 'rb', 'tested'), ('php', 'PHP', 'php', 'untested'),
]
SDK_DIR = {'javascript': 'typescript', 'curl': None}
GOALS = {'hunger': 'goal_hunger', 'health': 'goal_health', 'robots': 'goal_robots'}


def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()


def L(m, lang):
    return (m.get(lang) or m.get('en') or '') if isinstance(m, dict) else (m or '')


class RecipeBuilder:
    def __init__(self, b):
        self.b = b; self.out = b.out; self.langs = b.LANGS_ALL
        self.docs = {}
        for p in sorted((ROOT / 'recipes').glob('*/*.cookwala.json')):
            d = json.loads(p.read_text(encoding='utf-8')); self.docs[d['id']] = d
        self.examples = {}
        for p in sorted((ROOT / 'examples').glob('*.cookwala.json')):
            d = json.loads(p.read_text(encoding='utf-8')); d['id'] = p.name.replace('.cookwala.json', ''); self.examples[d['id']] = d  # URLs use the file name, as /v1/recipes/ does
        self.side = {}
        for p in sorted((ROOT / 'recipes' / 'text').glob('*/*.json.gz')):
            lang = p.parent.name
            with gzip.open(p, 'rt', encoding='utf-8') as fh: bundle = json.load(fh)
            self.side.setdefault(lang, {}).update(bundle)

    def entries(self, lang):
        out = []
        for rid, d in self.examples.items():
            out.append({'id': rid, 'revision': d.get('revision', 1), 'hash': d['hash'], 'title': L(d['dish']['names'], lang), 'cuisine': d['dish'].get('cuisine', []), 'course': d['dish'].get('course', 'other'), 'tags': d['dish'].get('tags', []),
                        'level': d['verification']['level'], 'servings': d['yield']['servings'], 'allergens': d['safety']['allergens'].get('eu14', []), 'supervision': d['safety']['supervision']['default'], 'x-collection': 'cookwala', 'x-license': d.get('license', 'CC-BY-4.0')})
        for rid, d in self.docs.items():
            out.append({'id': rid, 'revision': 1, 'hash': d['hash'], 'title': L(d['dish']['names'], lang), 'cuisine': ['EG'], 'course': d['dish']['course'], 'tags': d['dish'].get('tags', []), 'level': 'V0', 'servings': d['yield']['servings'],
                        'allergens': d['safety']['allergens'].get('eu14', []), 'supervision': 'presence_required', 'thumb': next((i['url'] for i in d['dish'].get('images', []) if i.get('role') == 'thumb'), None), 'x-collection': d['source'].get('collection'), 'x-license': d.get('license')})
        return [{k: v for k, v in e.items() if v is not None} for e in out]

    def build_data(self):
        v1 = self.out / 'v1' / 'recipes'; v1.mkdir(parents=True, exist_ok=True)
        for rid, d in self.docs.items():
            (v1 / f'{rid}.cookwala.json').write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
            for lang, bundle in self.side.items():
                s = bundle.get(rid)
                if not s: continue
                t = v1 / rid / 'text'; t.mkdir(parents=True, exist_ok=True)
                (t / f'{lang}.json').write_text(json.dumps(s, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        shards = []
        for lang in self.langs:
            ents = self.entries(lang); d = self.out / 'v1' / 'index' / lang; d.mkdir(parents=True, exist_ok=True)
            pages = [ents[i:i + 500] for i in range(0, len(ents), 500)]
            for n, page in enumerate(pages):
                raw = json.dumps({'page': n, 'pageCount': len(pages), 'items': page}, ensure_ascii=False, separators=(',', ':')).encode()
                (d / f'{n}.json').write_bytes(raw); shards.append({'path': f'/v1/index/{lang}/{n}.json', 'hash': sha(raw), 'bytes': len(raw)})
            compact = [{'id': e['id'], 't': e['title'], 'c': e['course'], 'k': e.get('x-collection'), 'l': e['level']} for e in ents]
            (d / 'search.json').write_text(json.dumps(compact, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        counts = {'recipes': len(self.docs) + len(self.examples), 'byLevel': {'V0': len(self.docs), 'V1': len(self.examples)}, 'countries': 1, 'languages': len(self.langs)}
        version = sha(json.dumps([e['hash'] for e in self.entries('en')]).encode())[7:19]
        manifest = {'cookwala': '0.2.0', 'version': version, 'generatedAt': self.b.now, 'counts': counts, 'languages': self.langs, 'shards': shards}
        (self.out / 'v1' / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        return counts

    def page_html(self, lang, d, is_example):
        S = self.b.strings[lang]['recipes']; rid = d['id']
        text = d['text'].get(lang) or d['text'].get('en') or d['text'].get('ar') or {}
        title = L(d['dish']['names'], lang)
        level = d['verification']['level']
        lic = d.get('license', ''); lic_txt = 'CC BY 4.0' if lic == 'CC-BY-4.0' else S['licence_review']
        coll = d.get('source', {}).get('collection', 'cookwala')
        ings = ''.join(f"<li><span>{html.escape(((i.get('display') or {}).get(lang) or (i.get('display') or {}).get('en') or i['ref']))}</span></li>" if is_example else
                       f"<li><span>{html.escape(self.ing_name(d, i, lang))}</span><span class=\"qty\">{html.escape(((i.get('display') or {}).get(lang) or (i.get('display') or {}).get('en') or ''))}</span></li>" for i in d['ingredients'])
        steps = text.get('legacySteps') or [text.get('steps', {}).get(n['id'], '') for n in d['process']['nodes']]
        steps_html = ''.join(f'<li>{html.escape(s)}</li>' for s in steps if s)
        nut = d.get('nutrition', {}).get('perServing')
        nut_html = f"<p class=\"note\">{html.escape(S['nutrition'])}: " + ', '.join(f'{k} {v}' for k, v in nut.items()) + '</p>' if nut else ''
        al = d['safety']['allergens'].get('eu14', [])
        al_html = f"<p class=\"note\">{html.escape(S['allergens'])}: {html.escape(', '.join(al) if al else '-')}</p>"
        src = d.get('source', {})
        legacy = d.get('legacy', {})
        links = f'<a class="btn" href="/v1/recipes/{rid}.cookwala.json">{html.escape(S["data"])}</a>'
        if legacy.get('pageUrl'): links += f' <a class="btn" href="{html.escape(legacy["pageUrl"])}" rel="noopener">{html.escape(S["original_page"])}</a>'
        if is_example: links += f' <a class="btn primary" href="{self.b.path_for(lang, "/playground/")}?r={rid}">{html.escape(S["dry_run"])}</a>'
        meta_line = f"{html.escape(S['servings'])}: {d['yield']['servings']:g}"
        if d['process'].get('totalTime'): meta_line += f" · {html.escape(d['process']['totalTime'].replace('PT', '').replace('H', ' h ').replace('M', ' min'))}"
        intro = text.get('intro') or ''
        note = S['v0_note'] if level == 'V0' else S['v1']
        body = (f'<section class="hero wrap recipe-head"><p class="crumb"><a href="{self.b.path_for(lang, "/")}">Cookwala</a> / <a href="{self.b.path_for(lang, "/recipes/")}">{html.escape(S["title"])}</a></p>'
                f'<p class="chip"><span class="dot {"exp" if level == "V0" else "draft"}" aria-hidden="true"></span>{html.escape(S["v0"] if level == "V0" else S["v1"])}</p>'
                f'<h1>{html.escape(title)}</h1><p class="meta">{meta_line} · {html.escape(S["collection"])}: {html.escape(coll)} · <span class="lic">{html.escape(S["licence"])}: {html.escape(lic_txt)}</span></p>'
                + (f'<p class="lead">{html.escape(intro)}</p>' if intro else '') + f'<p class="cta">{links}</p></section>'
                f'<section class="wrap two"><div><h2>{html.escape(S["ingredients"])}</h2><ul class="ingredients">{ings}</ul>{al_html}{nut_html}</div>'
                f'<div><h2>{html.escape(S["original_steps"] if level == "V0" else S["steps"])}</h2><ol class="steps">{steps_html}</ol></div></section>'
                f'<section class="band"><div class="wrap"><p class="note">{html.escape(note)}</p><p class="note">{html.escape(S["source"])}: {html.escape(src.get("name", ""))}. {html.escape(src.get("citation", ""))}</p></div></section>')
        return body, title

    def ing_name(self, d, i, lang):
        vid = i['ingredientId']
        lab = self.b.ing_labels.get(vid, {})
        return lab.get(lang) or lab.get('en') or vid.replace('cw.ing.', '').replace('_', ' ')

    def build_pages(self):
        for lang in ('en', 'ar'):
            S = self.b.strings[lang]['recipes']
            for rid, d in list(self.examples.items()) + list(self.docs.items()):
                body, title = self.page_html(lang, d, rid in self.examples)
                pf = (lambda r: (lambda l, path: f'/{l}/recipes/view/?id={r}' if l not in ('en', 'ar') else self.b.path_for(l, path)))(rid)
                meta = {'title': f'{title} · {S["title"]}', 'description': (d['text'].get(lang) or d['text'].get('en') or {}).get('intro') or f'{title}: {S["v0"] if d["verification"]["level"] == "V0" else S["v1"]}', 'path': f'/recipes/{rid}/', 'path_fn': pf}
                self.b.write(lang, f'/recipes/{rid}/', self.b.page(lang, meta, body, current='/recipes/'))
        for lang in self.langs:
            if lang in ('en', 'ar'): continue
            S = self.b.strings[lang]['recipes']
            body = (f'<section class="hero wrap recipe-head" id="recipeView" data-lang="{lang}"><p class="crumb"><a href="{self.b.path_for(lang, "/")}">Cookwala</a> / <a href="{self.b.path_for(lang, "/recipes/")}">{html.escape(S["title"])}</a></p>'
                    f'<h1 id="rvTitle">…</h1><p class="meta" id="rvMeta"></p><p class="cta" id="rvLinks"></p></section>'
                    f'<section class="wrap two"><div><h2>{html.escape(S["ingredients"])}</h2><ul class="ingredients" id="rvIngs"></ul></div><div><h2>{html.escape(S["original_steps"])}</h2><ol class="steps" id="rvSteps"></ol></div></section>'
                    f'<section class="band"><div class="wrap"><p class="note">{html.escape(S["v0_note"])}</p><p class="note">{html.escape(S["machine_text"])}</p><p class="note" id="rvSource"></p></div></section>')
            meta = {'title': S['title'], 'description': S['v0_note'][:160], 'path': '/recipes/view/', 'scripts': ['recipe-view.js'], 'langs': [l for l in self.langs if l not in ('en', 'ar')]}
            self.b.write(lang, '/recipes/view/', self.b.page(lang, meta, body, current='/recipes/'))


class ScenarioBuilder:
    def __init__(self, b):
        self.b = b; self.out = b.out
        self.scen = b.scenarios
        self.outdir = ROOT / 'scenarios' / 'out'

    def sdk_cards(self, lang):
        S = self.b.strings[lang]['scenarios']
        cards = []
        for d, label, ext, st in SDK:
            folder = SDK_DIR.get(d, d)
            href = f'https://github.com/amado2k5/cookwala/tree/main/sdk/{folder}' if folder else 'https://github.com/amado2k5/cookwala/tree/main/scenarios/OPERATIONS.md'
            cards.append(f'<a class="card sdk-card" href="{href}" rel="noopener"><h3>{html.escape(label)}</h3><p class="st">{html.escape(S["tested"] if st == "tested" else S["untested"])}</p></a>')
        return ''.join(cards)

    def list_html(self, lang):
        S = self.b.strings[lang]['scenarios']
        items = []
        for s in self.scen:
            goals = ', '.join(html.escape(S.get(GOALS[g], g)) for g in s['northStar'])
            items.append(f'<li data-aud="{s["audience"]}" data-goal="{" ".join(s["northStar"])}" data-level="{s.get("level", "beginner")}"><a href="{self.b.path_for(lang, f"/scenarios/{s[chr(105)+chr(100)]}/")}">{s["id"]} · {html.escape(L(s["title"], lang))}</a><div class="meta">{html.escape(s["audience"].replace("_", " "))} · {goals} · {html.escape(s.get("level", "beginner"))}</div></li>')
        return ''.join(items)

    def build_samples(self):
        for s in self.scen:
            d = self.outdir / f"{s['id']}-{s['slug']}"
            if not d.exists(): continue
            t = self.out / 'v1' / 'scenarios' / s['id']; t.mkdir(parents=True, exist_ok=True)
            for f in d.iterdir():
                if f.name == 'sample.py' or f.name == 'README.md': continue
                (t / f.name).write_bytes(f.read_bytes())

    def page_html(self, lang, s):
        S = self.b.strings[lang]['scenarios']
        d = self.outdir / f"{s['id']}-{s['slug']}"
        py = (d / 'python.py').read_text(encoding='utf-8') if (d / 'python.py').exists() else ''
        result = json.loads((d / 'result.json').read_text(encoding='utf-8')) if (d / 'result.json').exists() else None
        steps = ''.join(f'<li><p>{html.escape(L(st["note"], lang))}' + (f' <code>{st["op"]}</code>' if st['op'] not in ('wait', 'assert') else '') + '</p></li>' for st in s['steps'])
        cli = html.escape('\n'.join(s['cli']))
        tabs = ''.join(f'<button type="button" role="tab" aria-selected="{"true" if dd == "python" else "false"}" data-lang="{dd}" data-ext="{ext}">{html.escape(label)}</button>' for dd, label, ext, st in SDK)
        out_html = ''
        if result:
            lines = []
            for st in result['steps']:
                r = st.get('result', st.get('error'))
                txt = json.dumps(r, ensure_ascii=False)
                lines.append(f"[{st['step']}] {st['op']}: {txt[:600]}{'…' if len(txt) > 600 else ''}")
            out_html = f'<h2>{html.escape(S["output"])}</h2><p class="note">{html.escape(S["status"])}: {"ok" if result["ok"] else "failed"}</p><pre class="code"><code>{html.escape(chr(10).join(lines))}</code></pre>'
        docs = ''.join(f'<a href="{p if p.startswith("/docs/") else self.b.path_for(lang, p)}">{html.escape(p)}</a> ' for p in s.get('docs', []))
        goals = ', '.join(html.escape(S.get(GOALS[g], g)) for g in s['northStar'])
        idx = self.scen.index(s)
        prev_ = self.scen[idx - 1] if idx > 0 else None; next_ = self.scen[idx + 1] if idx + 1 < len(self.scen) else None
        pager = (f'<a href="{self.b.path_for(lang, f"/scenarios/{prev_[chr(105)+chr(100)]}/")}">{html.escape(S["prev"])}: {prev_["id"]}</a> ' if prev_ else '') + (f'<a href="{self.b.path_for(lang, f"/scenarios/{next_[chr(105)+chr(100)]}/")}">{html.escape(S["next"])}: {next_["id"]}</a>' if next_ else '')
        body = (f'<section class="hero wrap" data-scenario="{s["id"]}"><p class="crumb"><a href="{self.b.path_for(lang, "/")}">Cookwala</a> / <a href="{self.b.path_for(lang, "/scenarios/")}">{html.escape(S["title"])}</a> / {s["id"]}</p>'
                f'<h1>{html.escape(L(s["title"], lang))}</h1><p class="lead">{html.escape(L(s["goal"], lang))}</p>'
                f'<p class="meta">{html.escape(S["audience"])}: {html.escape(s["audience"].replace("_", " "))} · {html.escape(S["goal"])}: {goals} · {html.escape(S["level"])}: {html.escape(s.get("level", "beginner"))}</p>'
                + (f'<p class="note">{html.escape(S["read_first"])}: {docs}</p>' if docs else '') + '</section>'
                f'<section class="wrap two"><div><h2>{html.escape(S["steps"])}</h2><ol class="steps">{steps}</ol>' + (f'<h2>{html.escape(S["outcome"])}</h2><p>{html.escape(L(s["outcome"], lang))}</p>' if s.get('outcome') else '') + '</div>'
                f'<div><h2>{html.escape(S["cli"])}</h2><pre class="code"><code>{cli}</code></pre>{out_html}</div></section>'
                f'<section class="band"><div class="wrap"><h2>{html.escape(S["code"])}</h2><div class="tabs" role="tablist">{tabs}</div><p class="note" id="runLine">{html.escape(S["run"])}: <code>python scenarios/out/{s["id"]}-{s["slug"]}/python.py</code></p>'
                f'<div class="sample"><pre class="code"><code id="sampleCode">{html.escape(py)}</code></pre></div><p class="note"><a href="https://github.com/amado2k5/cookwala/blob/main/scenarios/{s["id"]}-{s["slug"]}.json" rel="noopener">scenarios/{s["id"]}-{s["slug"]}.json</a></p></div></section>'
                f'<section class="wrap"><p class="pager-inline">{pager}</p></section>')
        return body

    def build_pages(self):
        for lang in self.b.LANGS_ALL:
            S = self.b.strings[lang]['scenarios']
            for s in self.scen:
                meta = {'title': f'{s["id"]} · {L(s["title"], lang)} · {S["title"]}', 'description': L(s['goal'], lang)[:160], 'path': f'/scenarios/{s["id"]}/', 'scripts': ['scenario.js']}
                self.b.write(lang, f'/scenarios/{s["id"]}/', self.b.page(lang, meta, self.page_html(lang, s), current='/scenarios/'))
