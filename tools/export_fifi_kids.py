#!/usr/bin/env python3
"""Export fifi.cooking's "Cooking with Kids" recipes into Cookwala V0 documents (collection `kids`, ids `kids-<slug>`).

    python tools/export_fifi_kids.py --src ~/Documents/GitHub/fifirecipes/public/data/kids [--out recipes]

The 50 recipes live in fifi.cooking's own dataset (src/data/kids/*.ts, served as public/data/kids/<lang>/<id>.json), not in the
public/data/recipes files that tools/export_fifi.py reads. This script reuses that exporter's conversion (quantities, text, hash) after
mapping a kids recipe onto the same intermediate shape, and writes ONLY the kids documents: recipes/kids/, recipes/text/<lang>/kids.json.gz,
their entries in recipes/INDEX.json and any new ingredient names in vocab/ingredients.json. Nothing else in the catalogue is touched, so it
can run without importing the other recipes fifi.cooking has gained (docs/EXPORT-FIFI.md section 12).

Kids-specific facts go in the document's `x-kids` block: age band, group, no-cook, minutes, the tools, and which steps need a grown-up and why.
Allergens are the ones the authors declared; a recipe with none declared is "check_labels", never "none_found" (nobody ran the strict review).
"""
import argparse
import collections
import datetime as dt
import gzip
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import export_fifi as ex  # noqa: E402

FIFI = ex.FIFI
GROUP_COURSE = {'breakfast': 'breakfast', 'snack': 'snack', 'savoury': 'main', 'sweet': 'dessert', 'drink': 'drink'}
ALLERGEN_MAP = {'nuts': 'nuts', 'peanuts': 'peanuts', 'eggs': 'eggs', 'milk': 'milk', 'gluten': 'cereals_gluten', 'sesame': 'sesame'}
ADULT_REASON = {'knife': 'a sharp knife', 'oven': 'the oven', 'stove': 'the stove', 'hot': 'something hot', 'blender': 'the blender', 'microwave': 'the microwave'}

UNIT = r'(?:cups?|tablespoons?|tbsps?|teaspoons?|tsps?|kg|g|grams?|ml|l|litres?|liters?|slices?|pieces?|cloves?|handfuls?|pinch(?:es)?|bunch(?:es)?|cans?|sticks?|leaves|leaf|sprigs?|drops?|scoops?|sheets?|squares?|strips?)'
NUM = r'(?:\d+\s*[½¼¾⅓⅔⅛]|\d+(?:\.\d+)?(?:\s+\d/\d|/\d+)?|[½¼¾⅓⅔⅛])'
SPLIT = re.compile(r'^(?P<amt>(?:' + NUM + r')\s*(?:' + UNIT + r'\b)?\s*(?:\([^)]*\))?\s*(?:of\s+)?|(?:a handful of|a pinch of|a few|a little|half an?|half of|an?)\s+(?:of\s+)?)(?P<name>.+)$', re.I)


def split_en(line):
    """'1 cup soft butter or ghee' -> ('1 cup', 'soft butter or ghee'); 'Bread for dipping' -> ('', 'Bread for dipping')."""
    line = line.strip()
    m = SPLIT.match(line)
    if not m: return '', line
    amt = m.group('amt').strip(); name = m.group('name').strip()
    name = re.sub(r'\s*(?:,|\(| or ).*$', '', name).strip() or name  # "small onion, grated by a grown-up", "butter (or ghee)", "yogurt or mayonnaise" -> the first name only (the full line stays as the display text)
    amt = re.sub(r'^(a|an)\b', '1', amt, flags=re.I)  # "a / an" is one; "a handful of" and "half a" stay as written
    if re.match(r'^1\s*$', amt): amt = '1'
    return amt, name


def build_d(rid, by_lang):
    en, ar = by_lang['en'], by_lang['ar']
    slug = 'kids-' + rid
    masters, tr = [], {}
    for l, r in by_lang.items():
        tr[l] = {'title': r['title'], 'culturalNotes': (r.get('intro') or '') + (('\n\n' + r['tip']) if r.get('tip') else ''), 'category': 'Cooking with Kids', 'cookingMethod': '', 'ingredients': {}, 'instructions': {}}
    for i, ing_ar in enumerate(ar['ingredients'], 1):
        iid = f'i{i}'
        amt, name = split_en(en['ingredients'][i - 1]['text'])
        masters.append({'id': iid, 'name': ing_ar['text'], 'standardAmount': ing_ar['text'], 'category': None})
        for l, r in by_lang.items():
            text = r['ingredients'][i - 1]['text'] if i - 1 < len(r['ingredients']) else ''
            tr[l]['ingredients'][iid] = {'name': name, 'standardAmount': amt} if l == 'en' else {'name': text, 'standardAmount': ''}
    steps = []
    for n, st in enumerate(ar['steps'], 1):
        steps.append({'stepNumber': n, 'text': st['text']})
        for l, r in by_lang.items():
            if n - 1 < len(r['steps']): tr[l]['instructions'][str(n)] = r['steps'][n - 1]['text']
    declared = sorted({ALLERGEN_MAP[a] for a in en.get('allergens', []) if a in ALLERGEN_MAP})
    d = {
        'recipe': {'id': slug, 'title': ar['title'], 'titleEn': en['title'], 'category': '', 'servings': str(en['servings']), 'prepTime': f"{en['minutes']} min", 'cookTime': '',
                   'cookingMethod': '', 'difficulty': 'easy', 'culturalNotes': tr['ar']['culturalNotes'], 'masterIngredients': masters, 'uniqueInstructions': steps},
        'estimate': {'servings': float(en['servings'])},
        'translations': tr,
        'allergens': {'status': 'contains' if declared else 'check_labels', 'contains': declared, 'ruleset': 'fifi-kids-declared-1'},
    }
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=str(pathlib.Path.home() / 'Documents/GitHub/fifirecipes/public/data/kids'))
    ap.add_argument('--out', default=str(ROOT / 'recipes'))
    a = ap.parse_args()
    src, out = pathlib.Path(a.src), pathlib.Path(a.out)
    langs = sorted(p.name for p in src.iterdir() if (p / 'index.json').exists())
    assert 'en' in langs and 'ar' in langs, 'the kids data needs en and ar'
    ids = sorted(p.stem for p in (src / 'en').glob('*.json') if p.stem != 'index')
    coll = next(c for c in ex.COLLECTIONS if c['id'] == 'kids')
    throw_vocab = {}; stats = {'qty': collections.Counter(), 'hints': collections.Counter(), 'coll': collections.Counter(), 'langs': collections.Counter()}
    sidecars = collections.defaultdict(dict); index = []; vocab_new = {}
    for rid in ids:
        by_lang = {l: json.loads((src / l / f'{rid}.json').read_text(encoding='utf-8')) for l in langs if (src / l / f'{rid}.json').exists()}
        en = by_lang['en']
        d = build_d(rid, by_lang)
        doc, side, ix = ex.convert(d, throw_vocab, stats)
        cid = doc['id']
        # --- kids-specific fields on top of the generic conversion
        doc['legacy'] = {'dataUrl': f'{FIFI}/data/kids/en/{rid}.json', 'pageUrl': f'{FIFI}/?kids=1'}
        doc['dish'].pop('images', None)
        doc['dish']['course'] = GROUP_COURSE.get(en['group'], 'other')
        doc['dish']['tags'] = ['Kids', 'Cooking with Kids', f"Ages {en['ages']}", en['group'].title()] + (['No-cook'] if en.get('noCook') else [])
        doc['dish']['difficulty'] = 'easy'
        for item, ing_en, ing_ar in zip(doc['ingredients'], en['ingredients'], by_lang['ar']['ingredients']):
            item['display'] = {'ar': ing_ar['text'], 'en': ing_en['text']}  # the whole original line, including notes such as "grated by a grown-up"
        grownup = [{'step': n, 'reason': st['adult']} for n, st in enumerate(en['steps'], 1) if st.get('adult')]
        doc['safety']['supervision'] = {'default': 'presence_required', 'reasons': {'all': 'Cooking with Kids: a grown-up is with the child for the whole recipe and does the steps marked for a grown-up (a sharp knife, the stove, the oven, something hot, the blender or the microwave).'}}
        doc['x-kids'] = {'ages': en['ages'], 'group': en['group'], 'noCook': bool(en.get('noCook')), 'minutes': en['minutes'], 'tools': en.get('tools', []), 'grownUpSteps': grownup}
        doc['source'] = {'name': coll['sourceName'], 'url': f'{FIFI}/?kids=1', 'collection': 'kids', 'citation': coll['citation']}
        doc['verification']['notes'] = 'Described, not machine-verified: written for children by fifi.cooking (Cooking with Kids); allergens are the ones the authors declared, not a strict analysis.'
        doc.pop('hash')
        doc['hash'] = ex.ref.doc_hash(doc)
        p = out / 'kids' / f'{cid}.cookwala.json'; p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')) + '\n')
        for l, s in side.items(): sidecars[l][cid] = s; stats['langs'][l] += 1
        ix.update({'hash': doc['hash'], 'course': doc['dish']['course'], 'tags': doc['dish']['tags'], 'x-collection': 'kids', 'x-license': coll['license'], 'x-kids': {'ages': en['ages'], 'group': en['group'], 'noCook': bool(en.get('noCook'))}})
        ix.pop('thumb', None)
        ix['x-steps'] = len(doc['process']['nodes']); ix['x-ingredients'] = len(doc['ingredients']); ix.pop('x-text', None)
        index.append(ix)
        for item in doc['ingredients']:
            vid = item['ingredientId']
            vocab_new.setdefault(vid, (en['ingredients'][doc['ingredients'].index(item)]['text'], throw_vocab[vid]['_labels']['en'].most_common(1)[0][0]))
        stats['coll']['kids'] += 1
    for l, bundle in sidecars.items():
        p = out / 'text' / l / 'kids.json.gz'; p.parent.mkdir(parents=True, exist_ok=True)
        with gzip.open(p, 'wt', encoding='utf-8', compresslevel=9) as fh: fh.write(json.dumps(bundle, ensure_ascii=False, separators=(',', ':')) + '\n')
    # ingredient vocabulary: add only names that are new, with their English label (the other languages' lines are whole phrases, not names)
    vp = ROOT / 'vocab' / 'ingredients.json'; v = json.loads(vp.read_text(encoding='utf-8')); have = {e['id'] for e in v['entries']}
    added = 0
    for vid, (_, label) in sorted(vocab_new.items()):
        if vid in have: continue
        v['entries'].append({'id': vid, 'label': {'en': label}, 'classes': ['cw.ingclass.other'], 'definition': 'fifi.cooking ingredient; used in Cooking with Kids recipes.'}); added += 1
    v['entries'].sort(key=lambda e: e['id'])
    vp.write_text(json.dumps(v, ensure_ascii=False, indent=0) + '\n')
    # index: replace any earlier kids entries, keep everything else exactly as it was
    ip = out / 'INDEX.json'; idx = json.loads(ip.read_text(encoding='utf-8'))
    idx['items'] = [x for x in idx['items'] if not x['id'].startswith('kids-')] + index
    idx['count'] = len(idx['items']); idx['generatedAt'] = dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')
    ip.write_text(json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f"kids documents {len(index)}; languages {len(langs)}; new vocabulary entries {added}; quantities en {stats['qty']['en']} ar {stats['qty']['ar']} fallback {stats['qty']['fallback']}; INDEX now {idx['count']}")


if __name__ == '__main__':
    main()
