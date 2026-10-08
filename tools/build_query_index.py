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
MEAT = {'beef', 'lamb', 'mutton', 'veal', 'chicken', 'turkey', 'duck', 'goose', 'rabbit', 'meat', 'mince', 'liver', 'kidney', 'tripe', 'oxtail', 'goat', 'camel', 'quail', 'pigeon', 'sausage', 'sausages', 'kofta', 'shawarma', 'brisket', 'steak', 'ribs', 'drumsticks', 'wings', 'bone', 'bones', 'marrow', 'broth', 'stock', 'bouillon', 'gelatin', 'gelatine', 'suet', 'tallow', 'sujuk', 'pastrami', 'salami', 'ham', 'bacon', 'pork', 'lard', 'chorizo', 'prosciutto', 'pancetta', 'chashu', 'guanciale'}
FISH = {'fish', 'shrimp', 'prawn', 'prawns', 'shrimps', 'tuna', 'sardine', 'sardines', 'salmon', 'cod', 'tilapia', 'mullet', 'bass', 'bream', 'calamari', 'squid', 'octopus', 'crab', 'lobster', 'mussels', 'clams', 'oyster', 'oysters', 'anchovy', 'anchovies', 'seafood', 'catfish', 'trout', 'mackerel', 'herring', 'eel', 'sole', 'flounder', 'haddock', 'hake', 'snapper', 'grouper', 'carp', 'perch', 'pike', 'halibut', 'swordfish', 'sea', 'monkfish', 'turbot', 'pollock', 'plaice', 'whiting', 'sprat', 'skate', 'ray', 'shark', 'barramundi', 'mahi', 'roe', 'caviar', 'bonito', 'katsuo', 'katsuobushi', 'niboshi', 'dashi', 'shirodashi', 'hondashi', 'worcestershire', 'belacan', 'terasi', 'nam', 'pla', 'nuoc', 'mam', 'scallop', 'scallops', 'cuttlefish', 'urchin', 'tobiko', 'surimi', 'kamaboko', 'narutomaki'} - {'sea', 'ray', 'nam', 'mam'}
PORK = {'pork', 'bacon', 'ham', 'lard', 'chorizo', 'prosciutto', 'pancetta', 'chashu', 'guanciale', 'salami', 'pepperoni', 'hamhock'}
ALCOHOL = {'wine', 'beer', 'rum', 'brandy', 'liqueur', 'vodka', 'mirin', 'sake', 'whisky', 'whiskey', 'cognac', 'gin', 'amaretto', 'kirsch', 'sherry', 'port', 'marsala', 'bourbon', 'tequila', 'champagne', 'cider'}
DAIRY = {'milk', 'butter', 'ghee', 'cheese', 'yogurt', 'yoghurt', 'cream', 'labneh', 'feta', 'halloumi', 'mozzarella', 'parmesan', 'ricotta', 'kashk', 'whey', 'casein', 'custard', 'cheddar', 'mascarpone', 'buttermilk', 'samna', 'qishta', 'kaymak', 'cottage'}
EGG = {'egg', 'eggs', 'mayonnaise', 'mayo', 'meringue'}
HONEY = {'honey'}
DAIRY_FREE_PAIRS = {'peanut_butter', 'almond_butter', 'cocoa_butter', 'shea_butter', 'nut_butter', 'coconut_milk', 'almond_milk', 'soy_milk', 'oat_milk', 'rice_milk', 'coconut_cream', 'cream_of_tartar', 'sesame_butter', 'seed_butter', 'coconut_butter', 'butter_beans', 'butter_bean', 'butterbeans', 'ice_cream_cone'}
MEAT_FREE_PAIRS = {'vegetable_stock', 'vegetable_broth', 'veg_stock', 'veggie_stock', 'vegetable_bouillon', 'bone_marrow_free', 'ham_free', 'fish_sauce_free'}
for _w in (MEAT, FISH, PORK, ALCOHOL, DAIRY, EGG, HONEY):
    pass

def stem(w): return w[:-1] if len(w) > 3 and w.endswith('s') and not w.endswith('ss') else w


MEAT -= {'minced', 'heart', 'cheek', 'cheeks', 'cutlet', 'cutlets'}
MEAT |= {'basturma', 'pastirma', 'sujuk', 'soujouk', 'merguez', 'mortadella', 'kielbasa', 'bratwurst', 'frankfurter', 'hotdog', 'pepperoni', 'sheep', 'lahma', 'lahm', 'laham', 'aspic', 'jellied', 'rennet', 'lung', 'sweetbread', 'spleen', 'intestine', 'trotter', 'offal', 'giblet', 'gizzard', 'brain', 'tongue', 'trotter', 'poultry', 'fowl', 'hen', 'squab', 'chickens', 'lambs', 'shank', 'thigh', 'breast', 'leg', 'rib'} - {'breast', 'leg', 'rib'}
STEMMED = {id(w): {stem(x) for x in w} for w in (MEAT, FISH, PORK, ALCOHOL, DAIRY, EGG, HONEY)}
NOT_MEATLESS_TITLE = re.compile(r'\b(vegetarian|vegan|meatless|mock|veggie|plant-based)\b', re.I)
SPICY = {'chili', 'chilli', 'chile', 'chilies', 'chillies', 'chilis', 'cayenne', 'harissa', 'jalapeno', 'habanero', 'serrano', 'sambal', 'gochujang', 'gochugaru', 'wasabi', 'tabasco', 'sriracha', 'shatta', 'datta', 'scotch', 'bonnet', 'vindaloo', 'piri'}
OFFAL = {'liver', 'kidney', 'tripe', 'brain', 'lung', 'sweetbread', 'spleen', 'tongue', 'heart', 'giblet', 'gizzard', 'head', 'trotter', 'intestine', 'offal', 'mumbar'}
CAFFEINE = {'coffee', 'espresso', 'mocha', 'matcha'}
KID_WORDS = {'pasta', 'macaroni', 'pizza', 'nugget', 'nuggets', 'fries', 'pancake', 'pancakes', 'cake', 'cupcake', 'cookie', 'cookies', 'biscuit', 'biscuits', 'sandwich', 'sandwiches', 'burger', 'burgers', 'wrap', 'wraps', 'pudding', 'custard', 'smoothie', 'milkshake', 'popcorn', 'fritters', 'fritter', 'dumpling', 'dumplings', 'noodles', 'mini', 'kid', 'kids', 'child', 'children', 'lunchbox', 'sweets', 'candy', 'chocolate', 'jelly', 'pie', 'rolls', 'roll', 'toast', 'omelette', 'omelet', 'meatballs', 'meatball', 'kofta', 'sausage', 'sausages', 'basbousa', 'konafa', 'kunafa', 'mashed', 'bread', 'waffle', 'waffles', 'crepe', 'crepes', 'donut', 'doughnut', 'muffin', 'muffins', 'brownie', 'brownies', 'tart'}
SHELLFISH = {'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'crawfish', 'langoustine', 'mussel', 'clam', 'oyster', 'scallop', 'squid', 'calamari', 'octopus', 'cuttlefish', 'snail', 'abalone', 'urchin', 'cockle', 'whelk', 'shellfish', 'krill', 'tobiko', 'uni'}
NONKOSHER_FISH = {'eel', 'catfish', 'shark', 'swordfish', 'monkfish', 'sturgeon', 'caviar', 'skate', 'unagi', 'anago', 'pangasius', 'basa', 'anglerfish'}
BYPRODUCT = {'rennet', 'aspic', 'gelatin', 'gelatine', 'isinglass', 'lard', 'jellied', 'blood'}
MEAT_STRICT_EXCLUDE = {'rennet', 'aspic', 'gelatin', 'gelatine', 'jellied', 'isinglass'}
GLUTEN = {'flour', 'wheat', 'semolina', 'bread', 'breadcrumbs', 'breadcrumb', 'pasta', 'macaroni', 'spaghetti', 'noodles', 'vermicelli', 'couscous', 'bulgur', 'burghul', 'freekeh', 'farika', 'barley', 'rye', 'phyllo', 'filo', 'pastry', 'dough', 'biscuit', 'biscuits', 'cake', 'oat', 'oats', 'orzo', 'lasagna', 'lasagne', 'crackers', 'cracker', 'pita', 'toast', 'baguette', 'croissant', 'tortilla', 'seitan', 'malt', 'ramen', 'udon', 'somen', 'soba', 'panko', 'beer'}
GLUTEN_FREE_FLOUR = {'rice', 'corn', 'cornflour', 'chickpea', 'gram', 'almond', 'coconut', 'besan', 'potato', 'tapioca', 'cassava', 'sorghum', 'millet', 'masa', 'arrowroot', 'glutinous'}
NUTS = {'almond', 'walnut', 'pistachio', 'hazelnut', 'cashew', 'pecan', 'peanut', 'macadamia', 'nut', 'nuts', 'praline', 'marzipan', 'nutella', 'gianduja'}
ALLERGEN_WORDS = {
    'milk': DAIRY | {'whey', 'casein', 'lactose'}, 'eggs': EGG, 'fish': FISH | {'anchovy', 'anchovies'},
    'crustaceans': {'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'crawfish', 'langoustine', 'krill'},
    'molluscs': {'mussel', 'clam', 'oyster', 'scallop', 'squid', 'calamari', 'octopus', 'cuttlefish', 'snail', 'abalone', 'cockle', 'whelk'},
    'nuts': {'almond', 'walnut', 'pistachio', 'hazelnut', 'cashew', 'pecan', 'macadamia', 'praline', 'marzipan', 'nutella', 'gianduja', 'nut', 'nuts'}, 'peanuts': {'peanut'},
    'sesame': {'sesame', 'tahini', 'tahina', 'halawa', 'halva', 'halwa', 'gomasio'}, 'soybeans': {'soy', 'soya', 'soybean', 'tofu', 'edamame', 'miso', 'tempeh', 'natto'},
    'celery': {'celery', 'celeriac'}, 'mustard': {'mustard'}, 'lupin': {'lupin', 'lupini', 'termis'},
}
# what most kitchens already have: ignored when ranking by "ingredients I have"
STAPLES = {'salt', 'water', 'warm_water', 'cold_water', 'hot_water', 'boiling_water', 'oil', 'pepper', 'black_pepper', 'salt_and_pepper', 'sugar', 'ice', 'ice_water', 'cooking_oil', 'vegetable_oil', 'sunflower_oil'}




LANG_NAMES = {'ar': 'Arabic', 'bn': 'Bengali', 'cs': 'Czech', 'de': 'German', 'el': 'Greek', 'en': 'English', 'es': 'Spanish', 'fa': 'Persian', 'fr': 'French', 'he': 'Hebrew', 'hi': 'Hindi', 'id': 'Indonesian', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'ku': 'Kurdish (Kurmanji)', 'nl': 'Dutch', 'pl': 'Polish', 'ps': 'Pashto', 'pt': 'Portuguese', 'ru': 'Russian', 'sq': 'Albanian', 'sv': 'Swedish', 'sw': 'Swahili', 'te': 'Telugu', 'tr': 'Turkish', 'ur': 'Urdu', 'vi': 'Vietnamese', 'zh': 'Chinese'}


# other names people use for a source, so "Fatma Abu Haty" or "Samia Abdennour" finds the right collection
SOURCE_ALIASES = {
    'abuhaty': ['Fatma Abu Haty', 'Fatma Abu Hati', 'Abu Haty', 'Abu Hati', 'Fatma Abou Haty', 'YouTube channel', 'فاطمة أبو حاتي', 'فاطمة ابو حاتي'],
    'archive': ['Fatma Alkawokgy', 'Dr Fatma', 'family archive', 'family recipes', 'fifi.cooking archive', 'Alkawokgy'],
    'chefteta': ['Chef Teta', 'Teta', 'chefteta.com'],
    'osool': ['Osool El Tahy', 'Osool', 'Nazira Nicola', 'Bahia Othman', 'Nazira', 'أصول الطهي'],
    'abdennour': ['Samia Abdennour', 'Abdennour', 'AUC Press', 'Egyptian Cooking and Other Middle Eastern Recipes'],
    'world': ['World Cuisines', 'world cuisine', 'international'],
    'cookwala': ['Cookwala', 'examples', 'Cookwala examples'],
}


def tokens(ref): return {stem(t) for t in re.split(r'[^a-z]+', ref.lower()) if t}


GENERIC_BASE = {'stock', 'broth', 'bouillon', 'dashi', 'shirodashi', 'hondashi'}
MEAT_NG = MEAT - GENERIC_BASE  # fixed sets (has() caches stems by id), used for titles where a bare 'stock' means nothing
FISH_NG = FISH - GENERIC_BASE
PLANT_BASE = {'vegetable', 'veg', 'veggie', 'mushroom', 'kombu', 'kelp', 'shiitake', 'miso', 'vegan', 'plant', 'seaweed'}


def has(ref, words, exceptions=()):
    r = ref.lower()
    toks = tokens(r)
    st = STEMMED.get(id(words))
    if st is None: st = STEMMED[id(words)] = {stem(x) for x in words}
    if words in (MEAT, FISH):
        specific = toks & (st - {stem(x) for x in GENERIC_BASE})
        if specific and not (toks & {'free', 'less', 'without'}): return True  # "chicken or vegetable stock" is still chicken
        generic = toks & {stem(x) for x in GENERIC_BASE}
        if generic: return not (toks & {stem(x) for x in PLANT_BASE}) and bool(toks & st)
        return False
    if words is ALCOHOL and ('vinegar' in toks or ('cheese' in toks and 'rum' in toks)): return False  # vinegars are not alcohol; a truncated 'grated rum[i] cheese' is not rum
    if False: return False  # vinegars (cider, wine, rice) are not counted as alcohol, as in the reviewed rule set
    if words is PORK and 'halal' in toks: return False  # e.g. pepperoni_slices_halal (beef)
    if any(e in r for e in exceptions): return False
    st = STEMMED.get(id(words))
    if st is None: st = STEMMED[id(words)] = {stem(x) for x in words}
    return bool(tokens(r) & st)


def op_of(node):
    p = node.get('params') or {}
    op = p.get('opHint') or node.get('op') or ''
    return op.replace('cw.op.', '')


def duration_min(iso):
    m = re.fullmatch(r'P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?', iso or '')
    if not m: return None
    d, h, mi, s = (float(x) if x else 0 for x in m.groups())
    return int(round(d * 1440 + h * 60 + mi + s / 60)) or None


NOTES_IDS = set()


def load_notes():
    import gzip
    for p in (ROOT / 'recipes' / 'text').glob('*/*.json.gz'):
        with gzip.open(p, 'rt', encoding='utf-8') as fh:
            for rid, t in json.load(fh).items():
                if t.get('culturalNotes'): NOTES_IDS.add(rid)


def title_core_early(names):
    # titles for the allergen screen: drop 'for X' accompaniment phrases and scallop shells
    t = (names or {}).get('en') or ''
    t = re.sub(r'\bscallop(?:ed)?\s+shells?\b', '', t, flags=re.I)
    return re.sub(r'\((?:for|to serve with|served with)\b[^)]*\)', '', re.sub(r'\b(?:for|to serve with|served with)\b[^()]*', '', t, flags=re.I), flags=re.I)


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
    al_codes = list((d.get('safety') or {}).get('allergens', {}).get('eu14', [])) + list((d.get('safety') or {}).get('allergens', {}).get('us9', []))
    ops = [op_of(n) for n in d.get('process', {}).get('nodes', [])]
    opset = {o for o in ops if o and o != 'legacy_step'}
    heat = opset & HEAT_OPS; cold = opset & COLD_OPS
    methods = sorted(m for m, w in METHODS.items() if opset & w)
    style = 'no_cook' if not heat else ('mixed' if cold else 'hot')
    if not heat and cold: style = 'cold'
    title = names.get('en') or ''
    title_core = re.sub(r'\bscallop(?:ed)?\s+shells?\b', '', title, flags=re.I) if False else re.sub(r'\((?:for|to serve with|served with)\b[^)]*\)', '', re.sub(r'\b(?:for|to serve with|served with)\b[^()]*', '', title, flags=re.I), flags=re.I)
    by_title = not NOT_MEATLESS_TITLE.search(title)
    meat = any(has(r, MEAT, MEAT_FREE_PAIRS) for r in refs) or (by_title and has(title_core, MEAT_NG)); fish = any(has(r, FISH) for r in refs) or (by_title and has(title_core, FISH_NG))
    pork = any(has(r, PORK) for r in refs) or (by_title and not any('halal' in r.lower() for r in refs) and has(title_core, PORK)); alcohol = any(has(r, ALCOHOL, ('port_', 'portion', 'sauce_wine_free')) for r in refs)
    dairy = any(has(r, DAIRY, DAIRY_FREE_PAIRS) for r in refs); egg = any(has(r, EGG) for r in refs); honey = any(has(r, HONEY) for r in refs)
    diet = []
    if not meat and not fish: diet.append('vegetarian')
    if not meat and not fish and not dairy and not egg and not honey: diet.append('vegan')
    if not meat: diet.append('pescatarian')
    if not pork: diet.append('pork_free')
    if not alcohol: diet.append('alcohol_free')
    if not dairy: diet.append('dairy_free'); diet.append('lactose_free')
    gelatin_like = any(has(r, BYPRODUCT) for r in refs) or bool(tokens(title) & {stem(x) for x in BYPRODUCT})
    shell = any(tokens(r) & {stem(x) for x in SHELLFISH} for r in refs) or bool({'crustaceans', 'molluscs'} & set(al_codes)) or bool(tokens(re.sub(r'\bscallop(?:ed)?\s+shells?\b', '', title, flags=re.I)) & {stem(x) for x in SHELLFISH})
    bad_fish = any(tokens(r) & {stem(x) for x in NONKOSHER_FISH} for r in refs) or bool(tokens(title) & {stem(x) for x in NONKOSHER_FISH})
    meat_strict = meat and any(tokens(r) & ({stem(x) for x in MEAT} - {stem(x) for x in MEAT_STRICT_EXCLUDE}) for r in refs + [title])
    if not pork and not alcohol and not gelatin_like: diet.append('halal_ingredients')
    if not pork and not alcohol and not shell and not bad_fish and not gelatin_like and not (meat_strict and dairy) and not (meat_strict and fish):
        diet.append('kosher_meat' if meat_strict else ('kosher_dairy' if dairy else 'kosher_pareve'))
    glut = 'cereals_gluten' in al_codes or any((tokens(r) & {stem(x) for x in GLUTEN}) and not ('flour' in tokens(r) and tokens(r) & GLUTEN_FREE_FLOUR) for r in refs) or any('soy_sauce' in r.lower() for r in refs) or bool(tokens(title) & {'bread', 'pasta', 'cake', 'pizza', 'noodle', 'couscous', 'pie', 'biscuit', 'cookie', 'sandwich', 'pastry', 'dumpling', 'burger'})
    if not glut: diet.append('gluten_free')
    if not ({'nuts', 'peanuts'} & set(al_codes)) and not any(tokens(r) & {stem(x) for x in NUTS} for r in refs): diet.append('nut_free')
    if not shell: diet.append('shellfish_free')
    if not egg: diet.append('egg_free')
    al_codes = list((d.get('safety') or {}).get('allergens', {}).get('eu14', [])) + list((d.get('safety') or {}).get('allergens', {}).get('us9', []))
    ttoks = tokens(title + ' ' + ' '.join(dish.get('tags', [])))
    spicy = any(has(r, SPICY) or (('hot' in tokens(r)) and (tokens(r) & {'pepper', 'sauce', 'peppers', 'chill'})) for r in refs)
    offal = any(has(r, OFFAL) for r in refs) or bool(tokens(title) & {stem(w) for w in OFFAL})
    caff = any(has(r, CAFFEINE) for r in refs)
    mild = not alcohol and not spicy and not offal and not caff and dish.get('difficulty') in (None, 'easy', 'medium') and len(refs) <= 15
    appeal = dish.get('course') in ('dessert', 'bread', 'breakfast') or bool(ttoks & {stem(w) for w in KID_WORDS})
    explicit_kids = bool(tokens(title + ' ' + ' '.join(dish.get('tags', []))) & {'kid', 'child', 'lunchbox', 'toddler'})
    kids_coll = (d.get('source') or {}).get('collection') == 'kids'  # the "Cooking with Kids" recipes written for children (docs/EXPORT-FIFI.md section 12)
    xk = d.get('x-kids') or {}
    kid = (mild and appeal) or (explicit_kids and not alcohol) or kids_coll
    cautions = []
    if any(has(r, HONEY) for r in refs): cautions.append('contains honey: not for babies under 12 months')
    if 'nuts' in set(al_codes) or 'peanuts' in set(al_codes): cautions.append('contains nuts or peanuts: allergy risk, and whole nuts are a choking hazard for young children')
    if 'sesame' in set(al_codes): cautions.append('contains sesame: allergy risk')
    al = d.get('safety', {}).get('allergens', {})
    alist = sorted(set(al.get('eu14', [])) | set(al.get('us9', [])))
    found = set()
    for code, words in ALLERGEN_WORDS.items():
        st_ = {stem(x) for x in words}
        if any(tokens(r) & st_ for r in refs) or (code in ('fish', 'crustaceans', 'molluscs', 'eggs', 'milk') and bool(tokens(title_core_early(names)) & st_)): found.add(code)
    if any((tokens(r) & {stem(x) for x in GLUTEN}) and not ('flour' in tokens(r) and tokens(r) & GLUTEN_FREE_FLOUR) for r in refs) or any('soy_sauce' in r.lower() for r in refs): found.add('cereals_gluten')
    if 'soy_sauce' in ' '.join(refs).lower(): found.add('soybeans')
    published_allergens = ((d.get('safety') or {}).get('allergens') or {}).get('x-status')  # fifi.cooking's analysis replaces the screen below
    extra_allergens = sorted(found - set(alist) - ({'nuts', 'peanuts'} if 'nuts' in alist and 'peanuts' not in found else set()))
    n = (d.get('nutrition') or {}).get('perServing') or {}
    c = d.get('cost') or {}
    serv = d.get('yield', {}).get('servings') or None
    total = c.get('total')
    rec = {
        'id': rid, 't': names.get('en') or next(iter(names.values()), rid), 'ta': names.get('ar'),
        'cu': dish.get('cuisine') or ['EG'], 'co': dish.get('course', 'other'), 'tg': dish.get('tags', []),
        'df': dish.get('difficulty'), 'lv': d['verification']['level'], 'k': (d.get('source') or {}).get('collection') or 'cookwala',
        'sv': serv, 'ig': refs, 'ni': len(refs), 'op': sorted(opset), 'me': methods, 'st': style, 'ns': len(ops),
        'mn': duration_min(d.get('process', {}).get('totalTime')), 'ac': duration_min(d.get('process', {}).get('activeTime')), 'al': alist, 'ax': [] if published_allergens else extra_allergens, 'as': published_allergens,
        'am': sorted(al.get('mayContain', [])), 'di': diet,
        'eq': sorted({e.get('class', '').replace('cw.eq.', '') for e in d.get('equipment', []) if e.get('class')}),
        'img': bool(dish.get('images')),
        'kd': True if kid else None, 'kc': cautions if kid else None, 'ka': xk.get('ages') or None, 'kh': sorted({g['reason'] for g in xk.get('grownUpSteps', []) if g.get('reason')}) or None,
        'hn': True if (rid in NOTES_IDS or any((t or {}).get('intro') for t in (d.get('text') or {}).values()) or any(n.get('notes') for n in d.get('process', {}).get('nodes', []))) else None,
        'vid': True if re.search(r'(youtube\.com|youtu\.be|vimeo\.com)', (d.get('source') or {}).get('url') or '') else None,
        'sn': (d.get('source') or {}).get('name') if ((d.get('source') or {}).get('collection') or 'cookwala') in ('world', 'community') else None,
    }
    for k, key in (('kcal', 'kcal'), ('protein', 'pr'), ('fat', 'fa'), ('carbs', 'ca'), ('fiber', 'fi'), ('sugar', 'su'), ('sodiumMg', 'na')):
        if k in n: rec[key] = n[k]
    if rec.get('mn') and rec.get('ac') and rec['mn'] >= rec['ac']: rec['pt'] = rec['mn'] - rec['ac']  # unattended cooking, resting or waiting time
    if serv and 'kcal' in rec: rec['tk'] = round(rec['kcal'] * serv)
    if serv and 'pr' in rec: rec['tp'] = round(rec['pr'] * serv)
    xd = (d.get('safety') or {}).get('x-diabetic')
    if isinstance(xd, dict) and xd.get('status'): rec['dsx'] = xd['status']
    # gluten and lactose status published for every fifi.cooking recipe (free, contains, check_labels / low_or_possible, not_assessed)
    for key, rk in (('x-gluten', 'gx'), ('x-lactose', 'lx')):
        xs = (d.get('safety') or {}).get(key)
        if isinstance(xs, dict) and xs.get('status'): rec[rk] = xs['status']
    sd = (d.get('safety') or {}).get('dietary')
    if isinstance(sd, list):  # published classification (schema: safety.dietary[]): authoritative when present, even if empty
        rec['dk'] = True
        rec['dc'] = sorted({x.get('claim') for x in sd if x.get('claim')})
        cert = sorted({x['claim'] for x in sd if x.get('basis') == 'certified' and x.get('claim')})
        if cert: rec['dcc'] = cert
        rs = {x['claim']: x['ruleset'] for x in sd if x.get('ruleset') and x.get('claim')}
        if rs: rec['drs'] = rs
        for x in sd:
            if x.get('claim') == 'kosher':
                m = re.search(r'\((dairy|pareve|meat)\)', x.get('note') or '')
                if m: rec['dkt'] = m.group(1)
        # a published claim that the recipe's own title or ingredient names contradict is held back and listed for review
        conflicts = []
        if ({'vegetarian', 'vegan'} & set(rec['dc'])) and (meat_strict or fish): conflicts.append('vegetarian' if 'vegetarian' in rec['dc'] else 'vegan')
        if 'vegan' in rec['dc'] and (dairy or egg or honey): conflicts.append('vegan')
        if 'halal' in rec['dc'] and (pork or alcohol): conflicts.append('halal')
        if 'kosher' in rec['dc'] and (pork or shell or bad_fish): conflicts.append('kosher')
        if conflicts: rec['dx'] = sorted(set(conflicts))
        nt = {x['claim']: x['note'] for x in sd if x.get('note') and x.get('claim')}
        if nt: rec['dcn'] = nt
        refs_c = {x['claim']: [c.get('id') for c in x.get('certifications', []) if c.get('id')] for x in sd if x.get('certifications') and x.get('claim')}
        if refs_c: rec['dcr'] = refs_c
    if total is not None:
        rec['cost'] = total; rec['cb'] = c.get('buckets') or {}
        if serv: rec['cps'] = round(total / serv, 2)
        if c.get('currency'): rec['cur'] = c['currency']
    return {k: v for k, v in rec.items() if v not in (None, [], {})}


def main(out):
    out = pathlib.Path(out)
    docs = load_docs(); load_notes()
    recs = [record(rid, d) for rid, d in docs.items()]
    # relative cost tier from the catalog itself, because the data states no currency
    costs = sorted(r['cps'] for r in recs if 'cps' in r)
    if costs:
        lo, hi = costs[len(costs) // 3], costs[2 * len(costs) // 3]
        for r in recs:
            if 'cps' in r: r['ct'] = 'budget' if r['cps'] <= lo else ('mid' if r['cps'] <= hi else 'premium')
    q = out / 'v1' / 'query'; q.mkdir(parents=True, exist_ok=True)
    # recipe names per language: /v1/query/names/<lang>.json {id: name}, loaded only when a caller asks for that language
    nd = q / 'names'; nd.mkdir(exist_ok=True)
    langs = sorted({k for d in docs.values() for k in d['dish'].get('names', {})})
    for lg in langs:
        m = {rid: d['dish']['names'][lg] for rid, d in docs.items() if d['dish'].get('names', {}).get(lg)}
        (nd / f'{lg}.json').write_text(json.dumps(m, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    cfg = {c['id']: c for c in json.loads((ROOT / 'tools' / 'export_fifi.collections.json').read_text(encoding='utf-8')).get('collections', [])}
    sources = {}
    for r in recs:
        e = sources.setdefault(r['k'], {'recipes': 0, 'sites': Counter()})
        e['recipes'] += 1
        if r.get('sn'): e['sites'][r['sn']] += 1
    for k, e in sources.items():
        c = cfg.get(k, {}); sample = next((d for d in docs.values() if ((d.get('source') or {}).get('collection') or 'cookwala') == k), {})
        e['name'] = c.get('sourceName') or (sample.get('source') or {}).get('name') or k
        e['citation'] = c.get('citation') or (sample.get('source') or {}).get('citation')
        e['step_text'] = c.get('text', 'full' if k == 'cookwala' else 'unknown')
        e['aliases'] = SOURCE_ALIASES.get(k, [])
        e['sites'] = dict(e['sites'].most_common(60)) or None
        sources[k] = {a: b for a, b in e.items() if b not in (None, {}, [])}
    (q / 'recipes.json').write_text(json.dumps({'count': len(recs), 'staples': sorted(STAPLES), 'items': recs}, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

    def cnt(key, many=True):
        c = Counter()
        for r in recs:
            v = r.get(key)
            if v is None: continue
            for x in (v if many and isinstance(v, list) else [v]): c[x] += 1
        return dict(sorted(c.items(), key=lambda kv: (-kv[1], kv[0])))
    src_ids = {r['k'] for r in recs}
    cats = Counter(t for r in recs for t in r.get('tg', []) if t not in src_ids)
    ing = Counter(i for r in recs for i in r.get('ig', []))
    facets = {'count': len(recs), 'languages': {lg: LANG_NAMES.get(lg, lg) for lg in langs}, 'sources': sources, 'cuisine': cnt('cu'), 'course': cnt('co', False), 'tags': cnt('tg'), 'difficulty': cnt('df', False), 'level': cnt('lv', False),
              'collection': cnt('k', False), 'method': cnt('me'), 'operation': cnt('op'), 'style': cnt('st', False), 'diet': cnt('di'), 'allergen': cnt('al'),
              'equipment': cnt('eq'), 'cost_tier': cnt('ct', False), 'kids': sum(1 for r in recs if r.get('kd')), 'dietary_classified': sum(1 for r in recs if r.get('dk')), 'dietary_certified': sum(1 for r in recs if r.get('dcc')), 'dietary_conflicts': sum(1 for r in recs if r.get('dx')), 'with_background_notes': sum(1 for r in recs if r.get('hn')), 'top_ingredients': dict(ing.most_common(300)), 'categories': dict(cats.most_common(150)),
              'ranges': {k: [min(r[k] for r in recs if k in r), max(r[k] for r in recs if k in r)] for k in ('kcal', 'pr', 'fa', 'ca', 'fi', 'su', 'mn', 'ac', 'pt', 'tk', 'tp', 'cps', 'ni', 'ns', 'sv') if any(k in r for r in recs)},
              'notes': {'diet': 'inferred from ingredient names and declared allergens, never certified; halal_ingredients and kosher_* only screen ingredients and cannot verify slaughter, supervision or utensils', 'kids': 'kid_friendly is INFERRED: mild (no chilli, alcohol, caffeine or offal), simple (easy or medium, 15 ingredients or fewer) and kid-appealing; not medical advice', 'nutrition': 'per serving, modelled estimates unless the recipe says otherwise',
                        'cost': 'the data states no currency; cost_tier is relative within this catalog', 'time': 'mn is total minutes where the recipe states it; ac is hands-on (active) minutes and pt is the unattended remainder (cooking, resting, waiting)'}}
    (q / 'facets.json').write_text(json.dumps(facets, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'query index: {len(recs)} recipes, {len(ing)} distinct ingredients')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '_site'))
