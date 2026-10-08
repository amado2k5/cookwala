#!/usr/bin/env python3
"""Query index for the recipe REST API (sdk/mcp-js/src/api.js), written into a built site directory.

    python tools/build_query_index.py _site

Writes /v1/query/recipes.json: one compact record per recipe with everything the API filters on
(cuisine, course, ingredients, nutrition, cost, cooking operations and methods, time, allergens and diet flags
inferred from ingredient names), and /v1/query/facets.json: every value a filter accepts, with counts.

Diet flags are INFERRED from ingredient names. They are a convenience filter, never a certification.
Same recipe sources and ids as tools/build_recipes_scenarios.py.
"""
import json
import pathlib
import re
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]

HEAT_OPS = {'fry', 'deep_fry', 'saute', 'bake', 'roast', 'grill', 'boil', 'simmer', 'steam', 'heat', 'toast', 'caramelize', 'melt', 'reduce', 'broil', 'poach', 'sear', 'braise', 'stew'}
COLD_OPS = {'chill', 'freeze', 'cool', 'refrigerate', 'ferment'}
# cooking method -> operations that imply it
METHODS = {
    'fry': {'fry', 'saute', 'sear'}, 'deep_fry': {'deep_fry'}, 'bake': {'bake'}, 'roast': {'roast'}, 'grill': {'grill', 'broil'},
    'boil': {'boil', 'poach'}, 'simmer': {'simmer', 'stew', 'braise', 'reduce'}, 'steam': {'steam'}, 'toast': {'toast'},
    'chill': {'chill', 'refrigerate'}, 'freeze': {'freeze'}, 'marinate': {'marinate'}, 'ferment': {'ferment'},
}
MEAT = {'beef', 'lamb', 'mutton', 'veal', 'chicken', 'turkey', 'duck', 'goose', 'rabbit', 'meat', 'mince', 'minced', 'liver', 'kidney', 'tripe', 'oxtail', 'goat', 'camel', 'quail', 'pigeon', 'sausage', 'sausages', 'kofta', 'shawarma', 'brisket', 'steak', 'ribs', 'drumsticks', 'wings', 'bone', 'bones', 'marrow', 'broth', 'stock', 'bouillon', 'gelatin', 'gelatine', 'suet', 'tallow', 'sujuk', 'pastrami', 'salami', 'ham', 'bacon', 'pork', 'lard', 'chorizo', 'prosciutto', 'pancetta', 'chashu', 'guanciale'}
FISH = {'fish', 'shrimp', 'prawn', 'prawns', 'shrimps', 'tuna', 'sardine', 'sardines', 'salmon', 'cod', 'tilapia', 'mullet', 'bass', 'bream', 'calamari', 'squid', 'octopus', 'crab', 'lobster', 'mussels', 'clams', 'oyster', 'oysters', 'anchovy', 'anchovies', 'fillet', 'seafood', 'catfish', 'trout', 'mackerel', 'herring', 'eel'}
PORK = {'pork', 'bacon', 'ham', 'lard', 'chorizo', 'prosciutto', 'pancetta', 'chashu', 'guanciale', 'salami', 'pepperoni', 'hamhock'}
ALCOHOL = {'wine', 'beer', 'rum', 'brandy', 'liqueur', 'vodka', 'mirin', 'sake', 'whisky', 'whiskey', 'cognac', 'gin', 'amaretto', 'kirsch', 'sherry', 'port', 'marsala', 'bourbon', 'tequila', 'champagne', 'cider'}
DAIRY = {'milk', 'butter', 'ghee', 'cheese', 'yogurt', 'yoghurt', 'cream', 'labneh', 'feta', 'halloumi', 'mozzarella', 'parmesan', 'ricotta', 'kashk', 'whey', 'casein', 'custard', 'cheddar', 'mascarpone', 'buttermilk', 'samna', 'qishta', 'kaymak', 'rumi', 'rumy', 'cottage'}
EGG = {'egg', 'eggs', 'mayonnaise', 'mayo', 'meringue'}
HONEY = {'honey'}
DAIRY_FREE_PAIRS = {'peanut_butter', 'almond_butter', 'cocoa_butter', 'shea_butter', 'nut_butter', 'coconut_milk', 'almond_milk', 'soy_milk', 'oat_milk', 'rice_milk', 'coconut_cream', 'cream_of_tartar', 'sesame_butter', 'seed_butter', 'coconut_butter', 'butter_beans', 'butter_bean', 'butterbeans', 'ice_cream_cone'}
MEAT_FREE_PAIRS = {'vegetable_stock', 'vegetable_broth', 'veg_stock', 'veggie_stock', 'vegetable_bouillon', 'bone_marrow_free', 'ham_free', 'fish_sauce_free'}
for _w in (MEAT, FISH, PORK, ALCOHOL, DAIRY, EGG, HONEY):
    pass

def stem(w): return w[:-1] if len(w) > 3 and w.endswith('s') and not w.endswith('ss') else w


MEAT |= {'lung', 'sweetbread', 'spleen', 'intestine', 'heart', 'cheek', 'trotter', 'offal', 'giblet', 'gizzard', 'brain', 'tongue', 'trotter', 'poultry', 'fowl', 'hen', 'squab', 'chickens', 'lambs', 'cutlet', 'shank', 'thigh', 'breast', 'leg', 'rib'} - {'breast', 'leg', 'rib'}
STEMMED = {id(w): {stem(x) for x in w} for w in (MEAT, FISH, PORK, ALCOHOL, DAIRY, EGG, HONEY)}
NOT_MEATLESS_TITLE = re.compile(r'\b(vegetarian|vegan|meatless|mock|veggie|plant-based)\b', re.I)
# what most kitchens already have: ignored when ranking by "ingredients I have"
STAPLES = {'salt', 'water', 'warm_water', 'cold_water', 'hot_water', 'boiling_water', 'oil', 'pepper', 'black_pepper', 'salt_and_pepper', 'sugar', 'ice', 'ice_water', 'cooking_oil', 'vegetable_oil', 'sunflower_oil'}




def tokens(ref): return {stem(t) for t in re.split(r'[^a-z]+', ref.lower()) if t}


def has(ref, words, exceptions=()):
    r = ref.lower()
    if any(e in r for e in exceptions): return False
    return bool(tokens(r) & STEMMED[id(words)])


def op_of(node):
    p = node.get('params') or {}
    op = p.get('opHint') or node.get('op') or ''
    return op.replace('cw.op.', '')


def duration_min(iso):
    m = re.fullmatch(r'P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?', iso or '')
    if not m: return None
    d, h, mi, s = (float(x) if x else 0 for x in m.groups())
    return int(round(d * 1440 + h * 60 + mi + s / 60)) or None


def load_docs():
    docs = {}
    for p in sorted((ROOT / 'recipes').glob('*/*.cookwala.json')):
        d = json.loads(p.read_text(encoding='utf-8')); docs[d['id']] = d
    com = ROOT / 'recipes' / 'community'
    if com.exists():
        for p in sorted(com.glob('*/*.cookwala.json')):
            d = json.loads(p.read_text(encoding='utf-8')); docs[d['id']] = d
    for p in sorted((ROOT / 'examples').glob('*.cookwala.json')):
        d = json.loads(p.read_text(encoding='utf-8')); d['id'] = p.name.replace('.cookwala.json', ''); docs[d['id']] = d
    return docs


def record(rid, d):
    dish = d['dish']; names = dish.get('names', {})
    refs = [i['ref'] for i in d.get('ingredients', [])]
    ops = [op_of(n) for n in d.get('process', {}).get('nodes', [])]
    opset = {o for o in ops if o and o != 'legacy_step'}
    heat = opset & HEAT_OPS; cold = opset & COLD_OPS
    methods = sorted(m for m, w in METHODS.items() if opset & w)
    style = 'no_cook' if not heat else ('mixed' if cold else 'hot')
    if not heat and cold: style = 'cold'
    title = names.get('en') or ''
    by_title = not NOT_MEATLESS_TITLE.search(title)
    meat = any(has(r, MEAT, MEAT_FREE_PAIRS) for r in refs) or (by_title and has(title, MEAT)); fish = any(has(r, FISH) for r in refs) or (by_title and has(title, FISH))
    pork = any(has(r, PORK) for r in refs) or (by_title and has(title, PORK)); alcohol = any(has(r, ALCOHOL, ('port_', 'portion', 'sauce_wine_free')) for r in refs)
    dairy = any(has(r, DAIRY, DAIRY_FREE_PAIRS) for r in refs); egg = any(has(r, EGG) for r in refs); honey = any(has(r, HONEY) for r in refs)
    diet = []
    if not meat and not fish: diet.append('vegetarian')
    if not meat and not fish and not dairy and not egg and not honey: diet.append('vegan')
    if not meat: diet.append('pescatarian')
    if not pork: diet.append('pork_free')
    if not alcohol: diet.append('alcohol_free')
    if not dairy: diet.append('dairy_free')
    if not egg: diet.append('egg_free')
    al = d.get('safety', {}).get('allergens', {})
    alist = sorted(set(al.get('eu14', [])) | set(al.get('us9', [])))
    n = (d.get('nutrition') or {}).get('perServing') or {}
    c = d.get('cost') or {}
    serv = d.get('yield', {}).get('servings') or None
    total = c.get('total')
    rec = {
        'id': rid, 't': names.get('en') or next(iter(names.values()), rid), 'ta': names.get('ar'),
        'cu': dish.get('cuisine') or ['EG'], 'co': dish.get('course', 'other'), 'tg': dish.get('tags', []),
        'df': dish.get('difficulty'), 'lv': d['verification']['level'], 'k': (d.get('source') or {}).get('collection') or 'cookwala',
        'sv': serv, 'ig': refs, 'ni': len(refs), 'op': sorted(opset), 'me': methods, 'st': style, 'ns': len(ops),
        'mn': duration_min(d.get('process', {}).get('totalTime')), 'al': alist,
        'am': sorted(al.get('mayContain', [])), 'di': diet,
        'eq': sorted({e.get('class', '').replace('cw.eq.', '') for e in d.get('equipment', []) if e.get('class')}),
        'img': bool(dish.get('images')),
    }
    for k, key in (('kcal', 'kcal'), ('protein', 'pr'), ('fat', 'fa'), ('carbs', 'ca'), ('fiber', 'fi'), ('sugar', 'su'), ('sodiumMg', 'na')):
        if k in n: rec[key] = n[k]
    if total is not None:
        rec['cost'] = total; rec['cb'] = c.get('buckets') or {}
        if serv: rec['cps'] = round(total / serv, 2)
        if c.get('currency'): rec['cur'] = c['currency']
    return {k: v for k, v in rec.items() if v not in (None, [], {})}


def main(out):
    out = pathlib.Path(out)
    docs = load_docs()
    recs = [record(rid, d) for rid, d in docs.items()]
    # relative cost tier from the catalog itself, because the data states no currency
    costs = sorted(r['cps'] for r in recs if 'cps' in r)
    if costs:
        lo, hi = costs[len(costs) // 3], costs[2 * len(costs) // 3]
        for r in recs:
            if 'cps' in r: r['ct'] = 'budget' if r['cps'] <= lo else ('mid' if r['cps'] <= hi else 'premium')
    q = out / 'v1' / 'query'; q.mkdir(parents=True, exist_ok=True)
    (q / 'recipes.json').write_text(json.dumps({'count': len(recs), 'staples': sorted(STAPLES), 'items': recs}, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

    def cnt(key, many=True):
        c = Counter()
        for r in recs:
            v = r.get(key)
            if v is None: continue
            for x in (v if many and isinstance(v, list) else [v]): c[x] += 1
        return dict(sorted(c.items(), key=lambda kv: (-kv[1], kv[0])))
    ing = Counter(i for r in recs for i in r.get('ig', []))
    facets = {'count': len(recs), 'cuisine': cnt('cu'), 'course': cnt('co', False), 'tags': cnt('tg'), 'difficulty': cnt('df', False), 'level': cnt('lv', False),
              'collection': cnt('k', False), 'method': cnt('me'), 'operation': cnt('op'), 'style': cnt('st', False), 'diet': cnt('di'), 'allergen': cnt('al'),
              'equipment': cnt('eq'), 'cost_tier': cnt('ct', False), 'top_ingredients': dict(ing.most_common(300)),
              'ranges': {k: [min(r[k] for r in recs if k in r), max(r[k] for r in recs if k in r)] for k in ('kcal', 'pr', 'fa', 'ca', 'fi', 'su', 'mn', 'cps', 'ni', 'ns') if any(k in r for r in recs)},
              'notes': {'diet': 'inferred from ingredient names, not certified', 'nutrition': 'per serving, modelled estimates unless the recipe says otherwise',
                        'cost': 'the data states no currency; cost_tier is relative within this catalog', 'time': 'mn is total minutes where the recipe states it'}}
    (q / 'facets.json').write_text(json.dumps(facets, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'query index: {len(recs)} recipes, {len(ing)} distinct ingredients')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '_site'))
