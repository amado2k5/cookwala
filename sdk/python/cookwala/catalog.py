"""Find, view and export recipes from the repository's catalog (recipes/INDEX.json, examples/).

    cookwala search koshari [--cuisine EG] [--course main] [--tag rice] [--free-of nuts] [--level V1] [--limit 20]
    cookwala get koshari [--lang ar] [--json]
    cookwala export cooklang koshari [-o koshari.cook]
    cookwala export schema-org koshari

Standard library only. Offline: it reads the checkout, never the network.
"""
import json
import pathlib
import re

from . import ROOT

LEVELS = ['V0', 'V1', 'V2', 'V3']


def _index():
    p = ROOT / 'recipes' / 'INDEX.json'
    items = json.loads(p.read_text())['items'] if p.exists() else []
    seen = {i['id'] for i in items}
    for f in sorted((ROOT / 'examples').glob('*.cookwala.json')):  # the hand-written examples
        d = json.loads(f.read_text())
        if d['id'] in seen: continue
        names = d['dish']['names']
        items.append({'id': d['id'], 'title': names.get('en') or next(iter(names.values())), 'x-titles': names, 'cuisine': d['dish'].get('cuisine', []),
                      'course': d['dish'].get('course'), 'tags': d['dish'].get('tags', []), 'level': d['verification']['level'], 'servings': d['yield'].get('servings'),
                      'allergens': [], 'x-file': str(f)})
    return items


def search(query='', cuisine=None, course=None, tag=None, free_of=None, level=None, limit=20):
    """Case-insensitive match over id, title and names in every language. Returns (hits, total)."""
    terms = query.lower().split()
    out = []
    for it in _index():
        hay = ' '.join([it['id'], it.get('title', ''), *it.get('x-titles', {}).values(), *it.get('tags', [])]).lower()
        if not all(t in hay for t in terms): continue
        if cuisine and cuisine.upper() not in it.get('cuisine', []): continue
        if course and (it.get('course') or '').lower() != course.lower(): continue
        if tag and tag.lower() not in [t.lower() for t in it.get('tags', [])]: continue
        if free_of and any(a in it.get('allergens', []) for a in free_of): continue
        if level and LEVELS.index(it.get('level', 'V0')) < LEVELS.index(level.upper()): continue
        out.append(it)
    # exact id first, then title prefix, then the rest by verification level (higher first)
    q = query.lower().strip()
    out.sort(key=lambda i: (i['id'].lower() != q, not i.get('title', '').lower().startswith(q), -LEVELS.index(i.get('level', 'V0')), i['id']))
    return out[:limit], len(out)


def find_file(recipe_id):
    p = pathlib.Path(recipe_id)
    if p.suffix == '.json' and p.exists(): return p
    for f in [*(ROOT / 'examples').glob('*.cookwala.json'), *(ROOT / 'recipes').glob('*/*.cookwala.json')]:
        if f.name == f'{recipe_id}.cookwala.json': return f
    for it in _index():  # ids like example-shakshuka live in files named shakshuka.cookwala.json
        if it['id'] == recipe_id and it.get('x-file'): return pathlib.Path(it['x-file'])
    raise FileNotFoundError(f'no recipe "{recipe_id}"; try `cookwala search {recipe_id}`')


def load(recipe_id):
    return json.loads(find_file(recipe_id).read_text())


def _name(d, lang):
    n = d['dish']['names']
    return n.get(lang) or n.get('en') or next(iter(n.values()))


def _ing_label(ing, lang):
    disp = ing.get('display', {})
    return disp.get(lang) or disp.get('en') or ing['ingredientId'].split('.')[-1].replace('_', ' ')


def _mins(iso):
    m = re.fullmatch(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso or '')
    if not m: return None
    h, mi, s = (int(x or 0) for x in m.groups())
    return h * 60 + mi + (1 if s and not (h or mi) else 0) if (h or mi or s) else None


def _steps(d, lang):
    """[(node, text-or-None)] in process order; steps with no text come back as None."""
    txt = d.get('text', {}).get(lang, {}).get('steps') or d.get('text', {}).get('en', {}).get('steps') or {}
    return [(n, txt.get(n['id'])) for n in d['process']['nodes'] if n['op'] != 'cw.op.serve']


def render(d, lang='en'):
    """Human-readable view of a recipe (R1/R2 facts, then steps with their end conditions)."""
    v, y = d['verification'], d.get('yield', {})
    L = [f"{_name(d, lang)}  [{d['id']}]", f"verification {v['level']} · serves {y.get('servings', '?')} · {', '.join(d['dish'].get('cuisine', []))} · {d['dish'].get('course', '')}"]
    if d.get('nutrition', {}).get('perServing', {}).get('kcal'): L[-1] += f" · {d['nutrition']['perServing']['kcal']} kcal/serving"
    intro = d.get('text', {}).get(lang, {}).get('intro') or d.get('text', {}).get('en', {}).get('intro')
    if intro: L += ['', intro]
    L += ['', 'Ingredients'] + [f"  - {_ing_label(i, lang)}" + (' (optional)' if i.get('optional') else '') for i in d['ingredients']]
    L += ['', 'Steps']
    for k, (n, t) in enumerate(_steps(d, lang), 1):
        u = n.get('until', {})
        extra = []
        if u.get('minTime') or u.get('maxTime'): extra.append(f"{_mins(u.get('minTime')) or '?'}-{_mins(u.get('maxTime')) or '?'} min")
        if n.get('ccp'): extra.append(f"CCP {n['ccp']}")
        L.append(f"  {k}. {t or n['op'].replace('cw.op.', '')}" + (f"  [{'; '.join(extra)}]" if extra else ''))
    if v['level'] == 'V0': L += ['', 'V0: described, not machine-verified. A device will not run this recipe.']
    return '\n'.join(L)


# ---- Cooklang (https://cooklang.org/docs/spec/)
def _ck(name):
    return name if re.fullmatch(r'[A-Za-z]+', name) else name + '{}'


def _ck_ing(ing, d_lang):
    name = re.sub(r'[{}@#~%]', '', ing['ingredientId'].split('.')[-1].replace('_', ' '))
    q = ing.get('qty', {})
    qty = f"{q['value']:g}%{q['unit']}" if q.get('value') is not None else ''
    return f"@{name}{{{qty}}}"


def to_cooklang(d, lang='en'):
    """Cookwala recipe -> Cooklang text. Safety data (hazards, CCPs, end conditions) has no Cooklang
    equivalent and is not exported; the header says so."""
    ings = {i['ref']: i for i in d['ingredients']}
    eq = {e['ref']: re.sub(r'[{}@#~%]', '', e['class'].split('.')[-1].replace('_', ' ')) for e in d.get('equipment', [])}
    node_out = {n.get('output'): n for n in d['process']['nodes'] if n.get('output')}
    head = [f">> title: {_name(d, lang)}", f">> servings: {d['yield'].get('servings', '')}", f">> source: cookwala {d['id']} (rev {d.get('revision', 1)}, {d['verification']['level']})"]
    if d['dish'].get('cuisine'): head.append(f">> cuisine: {', '.join(d['dish']['cuisine'])}")
    if d['dish'].get('tags'): head.append(f">> tags: {', '.join(d['dish']['tags'])}")
    if d.get('license'): head.append(f">> license: {d['license']}")
    head.append('-- Exported from Cookwala. Hazards, critical control points and end conditions are not part of Cooklang and are not included; do not use this file to drive a device.')

    used, steps = set(), []
    for n, t in _steps(d, lang):
        refs = []
        for r in n.get('inputs', []):
            while r in node_out and r not in ings:  # follow intermediates back to raw ingredients
                refs += [x for x in node_out[r].get('inputs', []) if x in ings and x not in used]
                break
            if r in ings and r not in used: refs.append(r)
        refs = list(dict.fromkeys(refs))
        used.update(refs)
        mentions = ', '.join(_ck_ing(ings[r], lang) for r in refs)
        if t:
            s = t
            tm = (n.get('until', {}).get('maxTime') and _mins(n['until'].get('minTime') or n['until']['maxTime']))
            if mentions: s += f' ({mentions})'
            if tm: s += f' ~{{{tm}%minutes}}'
            cw = [eq[e] for e in n.get('equipment', []) if e in eq and eq[e] in ('skillet', 'pan', 'pot', 'oven', 'saucepan')]
            if cw: s += ' Use ' + ', '.join(f'#{_ck(c)}' for c in cw) + '.'
        elif mentions:
            s = f"{n['op'].replace('cw.op.', '').replace('_', ' ').capitalize()}: {mentions}."
        else:
            continue  # facts-only (V0) recipes publish no step text
        steps.append(s)
    leftover = [i for r, i in ings.items() if r not in used]
    if leftover: steps.insert(0, 'Gather ' + ', '.join(_ck_ing(i, lang) for i in leftover) + '.')
    if not steps: steps = ['(This recipe publishes facts only; no step text.)']
    return '\n'.join(head) + '\n\n' + '\n\n'.join(steps) + '\n'


def to_schema_org(d, lang='en'):
    nut = d.get('nutrition', {}).get('perServing', {})
    out = {'@context': 'https://schema.org', '@type': 'Recipe', 'name': _name(d, lang), 'identifier': d['id'], 'recipeYield': f"{d['yield'].get('servings', '')} servings",
           'recipeCuisine': d['dish'].get('cuisine', []), 'keywords': ', '.join(d['dish'].get('tags', [])), 'license': d.get('license'),
           'recipeIngredient': [_ing_label(i, lang) for i in d['ingredients']]}
    steps = [t for _, t in _steps(d, lang) if t]
    if steps: out['recipeInstructions'] = [{'@type': 'HowToStep', 'text': t} for t in steps]
    if nut.get('kcal'): out['nutrition'] = {'@type': 'NutritionInformation', 'calories': f"{nut['kcal']} kcal", 'proteinContent': f"{nut.get('protein', 0)} g", 'fatContent': f"{nut.get('fat', 0)} g", 'carbohydrateContent': f"{nut.get('carbs', 0)} g"}
    return {k: v for k, v in out.items() if v not in (None, '', [])}
