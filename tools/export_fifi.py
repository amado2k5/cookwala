#!/usr/bin/env python3
"""Export fifi.cooking recipes into Cookwala V0 documents (RFC-0009), deterministically.

    python tools/export_fifi.py --src ~/Documents/GitHub/fifirecipes/public/data/recipes [--out recipes] [--limit N]

Stages (docs/EXPORT-FIFI.md): E0 extract and the collection rights switch, E1-lite ingredient
vocabulary (one entry per distinct English name, labels in every language the source has),
E2 quantities (English amount parsed to SI or pieces, Arabic fallback, original kept as display),
E6 carry-over (dish names, course, tags, servings, nutrition and cost estimates, source, licence,
legacy links), E7 text (en and ar in the document; other languages as sidecar bundles).
Every step becomes a `cw.op.legacy_step` node: the document is V0, described, not executable.

Outputs:
  recipes/<collection>/<id>.cookwala.json       core documents (en + ar text, hashed)
  recipes/text/<lang>/<collection>.json.gz      sidecar bundles (gzip): id -> {title, notes, ingredients, steps}
  vocab/ingredients.json                        ingredient vocabulary with multilingual labels
  recipes/INDEX.json                            compact index (IndexEntry per recipe) for the site
  recipes/REPORT.md                             what parsed, what fell back, per collection
"""
import argparse
import collections
import gzip
import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import cookwala_ref as ref  # noqa: E402

CONFIG = json.loads((ROOT / 'tools' / 'export_fifi.collections.json').read_text())
COLLECTIONS = CONFIG['collections']
FIFI = 'https://fifi.cooking'

# ---------------------------------------------------------------- collections
def collection_of(rid):
    for c in COLLECTIONS:
        if any(rid.startswith(p) for p in c['prefixes']):
            return c
    return next(c for c in COLLECTIONS if c['id'] == 'archive')


def cuisine_of(rid):
    """ISO 3166 country code of a recipe's cuisine: w-<iso2>-NNN ids (World Cuisines) carry it; the family collections are Egyptian."""
    m = re.match(r'^w-([a-z]{2})-', rid)
    return [m.group(1).upper()] if m else ['EG']


# ---------------------------------------------------------------- quantities (E2)
FRACS = {'½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875, '⅕': 0.2}
UNITS_EN = [
    (r'cups?|c\.', 'cup'), (r'tbsps?|tablespoons?|tbs|tbl', 'tbsp'), (r'tsps?|teaspoons?', 'tsp'),
    (r'kgs?|kilos?|kilograms?', 'kg'), (r'g|grams?|gr', 'g'), (r'mg', 'mg'), (r'ml|milliliters?|millilitres?', 'ml'),
    (r'l|liters?|litres?', 'l'), (r'pinch(es)?', 'pinch'), (r'dash(es)?', 'dash'),
]
PIECE_WORDS = r'pieces?|pcs?|cloves?|eggs?|onions?|lemons?|limes?|oranges?|tomatoes?|potatoes?|peppers?|cucumbers?|carrots?|packets?|packs?|cubes?|cans?|tins?|slices?|bunch(es)?|sheets?|leaves|leaf|stalks?|sprigs?|heads?|sticks?|loaves|loaf|whole|medium|large|small|chickens?|fish|fillets?|bags?|bottles?|jars?|drops?|handfuls?|squares?|bars?|balls?'
TO_TASTE = re.compile(r'^(to taste|as needed|as required|a little|a bit|optional|some|enough|for frying|for greasing|for serving|for garnish(ing)?|for decoration|for dusting|as desired|if needed)\b', re.I)
AR_WORDS = {'نصف': 0.5, 'نص': 0.5, 'ربع': 0.25, 'ثلث': 1 / 3, 'ثلاثة أرباع': 0.75, 'واحد': 1, 'اثنين': 2, 'اتنين': 2, 'ثلاث': 3, 'ثلاثة': 3, 'تلات': 3, 'أربع': 4, 'أربعة': 4, 'خمس': 5, 'خمسة': 5, 'ست': 6, 'ستة': 6}
AR_UNITS = [(r'كوب|أكواب|كباية|كبايات', 'cup'), (r'ملعقة كبيرة|ملاعق كبيرة|معلقة كبيرة|معالق كبيرة|م\.ك', 'tbsp'), (r'ملعقة صغيرة|ملاعق صغيرة|معلقة صغيرة|معالق صغيرة|م\.ص', 'tsp'),
            (r'كيلو|كجم|كغ', 'kg'), (r'جرام|جم|غرام|غ', 'g'), (r'لتر', 'l'), (r'مل|ملل', 'ml'), (r'رشة', 'pinch'),
            (r'حبة|حبات|ثمرة|ثمرات|فص|فصوص|بيضة|بيضات|بصلة|عود|أعواد|علبة|علب|كيس|أكياس|مكعب|مكعبات|شريحة|شرائح|حزمة|ورقة|ورقات|قطعة|قطع', 'pcs')]
AR_TO_TASTE = ('حسب الرغبة', 'حسب الحاجة', 'قليل', 'للتزيين', 'للقلي', 'للتقديم', 'حسب الذوق', 'اختياري', 'للدهن', 'للتغطية', 'حسب اللزوم')
AR_DIGITS = {ord(c): str(i) for i, c in enumerate('٠١٢٣٤٥٦٧٨٩')}


def _num(s):
    """'1', '1½', '1 1/2', '1/2', '½', '1.5', '2-3' -> float or None."""
    s = s.strip().translate(AR_DIGITS)
    m = re.match(r'^(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)$', s)
    if m: return (float(m.group(1)) + float(m.group(2))) / 2
    total = 0.0; found = False
    for part in re.findall(r'\d+/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞⅕]', s):
        found = True
        if part in FRACS: total += FRACS[part]
        elif '/' in part:
            a, b = part.split('/'); total += float(a) / float(b) if float(b) else 0
        else: total += float(part)
    return total if found else None


def parse_amount_en(text):
    t = (text or '').strip()
    if not t: return None
    if TO_TASTE.match(t): return {'value': 0, 'unit': 'g', 'toTaste': True}
    m = re.match(r'^(?:a|an|one)\s+(pinch|dash|cup|tbsp|tablespoon|tsp|teaspoon|little|few|handful)', t, re.I)
    if m:
        w = m.group(1).lower()
        if w in ('little', 'few'): return {'value': 0, 'unit': 'g', 'toTaste': True}
        unit = {'pinch': 'pinch', 'dash': 'dash', 'cup': 'cup', 'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tsp': 'tsp', 'teaspoon': 'tsp', 'handful': 'pcs'}[w]
        return {'value': 1, 'unit': unit}
    m = re.match(r'^((?:\d+\s+)?\d+/\d+|\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?|[½¼¾⅓⅔⅛⅜⅝⅞⅕]|\d+[½¼¾⅓⅔⅛])\s*(.*)$', t)
    if not m: return None
    n = _num(m.group(1)); rest = m.group(2).strip().lower()
    if n is None: return None
    rest = re.sub(r'^\(.*?\)\s*', '', rest)
    for pat, unit in UNITS_EN:
        mm = re.match(r'^(%s)\b' % pat, rest)
        if mm: return {'value': round(n, 4), 'unit': unit}
    if rest == '' or re.match(r'^(%s)\b' % PIECE_WORDS, rest) or re.match(r'^[a-z][a-z\- ]*$', rest):
        return {'value': round(n, 4), 'unit': 'pcs'}
    return None


def parse_amount_ar(text):
    t = (text or '').strip().translate(AR_DIGITS)
    if not t: return None
    if any(w in t for w in AR_TO_TASTE): return {'value': 0, 'unit': 'g', 'toTaste': True}
    n = None
    m = re.match(r'^(\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?|\d+\s+\d/\d)', t)
    if m: n = _num(m.group(1).replace(',', '.')); rest = t[m.end():].strip()
    else:
        for w, v in AR_WORDS.items():
            if t.startswith(w): n = v; rest = t[len(w):].strip(); break
        else:
            rest = t
    for pat, unit in AR_UNITS:
        mm = re.search(r'(%s)' % pat, rest if n is not None else t)
        if mm:
            if n is None:
                # 'كوب', 'رشة', 'ملعقة كبيرة' alone = one
                n = 1
            return {'value': round(n, 4), 'unit': unit}
    if n is not None and re.match(r'^[؀-ۿ\s]*$', rest): return {'value': round(n, 4), 'unit': 'pcs'}
    return None


# ---------------------------------------------------------------- vocabulary (E1-lite)
def slug(name):
    s = re.sub(r'[^a-z0-9]+', '_', (name or '').lower()).strip('_')
    return s[:60] or 'unnamed'


# ---------------------------------------------------------------- allergens, course, equipment, op hints (E5-lite, E6)
ALLERGEN_KEYS = [
    (('milk', 'butter', 'ghee', 'cheese', 'yogurt', 'yoghurt', 'cream', 'labneh', 'whey', 'qeshta', 'kashta', 'mozzarella', 'feta', 'halloumi', 'rumi', 'cheddar'), 'milk', 'milk'),
    (('egg',), 'eggs', 'eggs'),
    (('flour', 'wheat', 'semolina', 'vermicelli', 'pasta', 'macaroni', 'spaghetti', 'bread', 'bulgur', 'barley', 'breadcrumb', 'filo', 'phyllo', 'puff pastry', 'noodle', 'couscous', 'freekeh', 'biscuit', 'cake mix', 'pita', 'dough', 'rusk'), 'cereals_gluten', 'wheat'),
    (('almond', 'walnut', 'pistachio', 'hazelnut', 'cashew', 'pine nut', 'pecan', 'mixed nuts', 'nuts'), 'nuts', 'tree_nuts'),
    (('peanut',), 'peanuts', 'peanuts'),
    (('sesame', 'tahini', 'tahina'), 'sesame', 'sesame'),
    (('fish', 'tuna', 'sardine', 'salmon', 'mackerel', 'tilapia', 'bass', 'mullet', 'anchov', 'cod', 'sole'), 'fish', 'fish'),
    (('shrimp', 'prawn', 'crab', 'lobster', 'crayfish'), 'crustaceans', 'crustacean_shellfish'),
    (('calamari', 'squid', 'octopus', 'clam', 'mussel', 'oyster'), 'molluscs', None),
    (('soy', 'tofu'), 'soybeans', 'soybeans'),
    (('mustard',), 'mustard', None), (('celery',), 'celery', None), (('lupin',), 'lupin', None),
]
COURSE = {'لحوم وطيور': 'main', 'خضروات': 'side', 'وجبات سريعة': 'main', 'حلويات شرقية': 'dessert', 'حلويات خفيفة': 'dessert', 'فطائر حلوة': 'dessert', 'حلويات غربية': 'dessert', 'نشويات': 'main', 'أكلات شهية': 'main', 'بحريات': 'main', 'معجنات': 'bread', 'سلطات': 'salad', 'شوربات وحساء': 'soup', 'مشروبات': 'drink', 'بقوليات': 'main', 'محشوات': 'main', 'آيس كريم': 'dessert', 'خشاف': 'drink', 'مشروبات وآيس كريم': 'drink'}
EQUIP = {
    'فرن': [('oven', 'cw.eq.heat.oven'), ('tray', 'cw.eq.vessel.tray.baking')],
    'خبز وتسوية بالفرن': [('oven', 'cw.eq.heat.oven'), ('tray', 'cw.eq.vessel.tray.baking')],
    'تسبيك': [('hob', 'cw.eq.heat.hob'), ('pot', 'cw.eq.vessel.pot.sauce')],
    'سلق': [('hob', 'cw.eq.heat.hob'), ('pot', 'cw.eq.vessel.pot.stock')],
    'قلي': [('hob', 'cw.eq.heat.hob'), ('pan', 'cw.eq.vessel.pan.skillet')],
    'تحمير': [('hob', 'cw.eq.heat.hob'), ('pan', 'cw.eq.vessel.pan.skillet')],
    'تحمير وقلي': [('hob', 'cw.eq.heat.hob'), ('pan', 'cw.eq.vessel.pan.skillet')],
    'شي': [('grill', 'cw.eq.heat.grill')], 'شوي': [('grill', 'cw.eq.heat.grill')],
    'بخار': [('hob', 'cw.eq.heat.hob'), ('steamer', 'cw.eq.vessel.pot.steamer')],
    'سلطات ومشروبات': [('bowl', 'cw.eq.tool.bowl.mixing')],
    'حفظ وتجميد': [('fridge', 'cw.eq.cold.fridge')],
}
OP_HINTS = [
    (('deep fry', 'deep-fry', 'قلي غزير', 'زيت غزير', 'زيت عميق'), 'deep_fry'), (('fry', 'اقل', 'قلي', 'حمّر', 'حمر', 'تحمير'), 'fry'),
    (('boil', 'اسلق', 'سلق', 'اغل', 'غلي', 'مغلي'), 'boil'), (('simmer', 'نار هادئة', 'نار هاديه', 'على نار خفيفة'), 'simmer'),
    (('bake', 'oven', 'فرن', 'اخبز', 'خبز'), 'bake'), (('roast', 'شوي', 'اشوي', 'يشوى'), 'roast'), (('grill', 'جريل', 'مشوي'), 'grill'),
    (('steam', 'بخار'), 'steam'), (('knead', 'اعجن', 'عجن'), 'knead'), (('whisk', 'beat', 'اخفق', 'خفق', 'اضرب'), 'whisk'),
    (('mix', 'stir', 'combine', 'اخلط', 'خلط', 'قلّب', 'قلب', 'امزج', 'مزج'), 'mix'), (('cut', 'chop', 'slice', 'dice', 'قطع', 'قطّع', 'شرائح', 'مكعبات', 'افرم', 'فرم'), 'cut'),
    (('grate', 'ابشر', 'بشر', 'مبشور'), 'grate'), (('crush', 'mash', 'اهرس', 'هرس', 'ادق', 'مدقوق'), 'crush'), (('peel', 'قشر', 'اقشر'), 'peel'),
    (('soak', 'انقع', 'نقع', 'منقوع'), 'soak'), (('drain', 'صفي', 'صفّي', 'تصفية', 'يصفى'), 'drain'), (('wash', 'rinse', 'اغسل', 'غسل'), 'wash'),
    (('marinate', 'تتبيل', 'تبّل', 'تبل', 'انقع في'), 'marinate'), (('season', 'salt and pepper', 'ملح وفلفل', 'بهار'), 'season'),
    (('stuff', 'احش', 'حشو', 'محشي'), 'stuff'), (('roll out', 'افرد', 'فرد', 'رقّ', 'ارق'), 'roll_out'), (('shape', 'form', 'شكّل', 'شكل', 'كور', 'كرات'), 'form'),
    (('layer', 'arrange', 'رص', 'صف', 'طبقة', 'طبقات'), 'layer'), (('melt', 'اذب', 'ذوّب', 'ذوب', 'سيح', 'سيّح'), 'melt'),
    (('caramel', 'كراميل'), 'caramelize'), (('toast', 'حمص', 'حمّص', 'محمص'), 'toast'), (('reduce', 'يتسبك', 'تسبك', 'يثقل', 'يغلظ'), 'reduce'),
    (('saute', 'sauté', 'شوّح', 'شوح', 'تشويح'), 'saute'), (('freeze', 'فريزر', 'جمّد', 'جمد'), 'freeze'), (('chill', 'refrigerat', 'fridge', 'ثلاجة', 'برّد في'), 'chill'),
    (('cool', 'يبرد', 'تبرد', 'اتركه يبرد', 'اتركيه يبرد'), 'cool'), (('rest', 'leave', 'let it', 'اترك', 'اتركي', 'يرتاح', 'ترتاح', 'يختمر', 'تختمر'), 'rest'),
    (('garnish', 'decorate', 'زين', 'زيّن', 'للتزيين'), 'garnish'), (('serve', 'قدم', 'قدّم', 'تقدم', 'يقدم', 'التقديم'), 'serve'),
    (('blend', 'الخلاط', 'اخلط في الخلاط', 'اضرب في الخلاط'), 'blend'), (('heat', 'سخّن', 'سخن', 'تسخين'), 'heat'), (('add', 'أضف', 'أضيفي', 'ضع', 'ضعي', 'اضيف', 'نضيف'), 'transfer'),
]


def op_hint(text_ar, text_en):
    t = ((text_en or '') + ' ' + (text_ar or '')).lower()
    for keys, op in OP_HINTS:
        if any(k in t for k in keys): return 'cw.op.' + op
    return None


EU14 = {'cereals_gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans', 'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'}
US9 = {'milk': 'milk', 'eggs': 'eggs', 'fish': 'fish', 'crustaceans': 'crustacean_shellfish', 'nuts': 'tree_nuts', 'peanuts': 'peanuts', 'cereals_gluten': 'wheat', 'soybeans': 'soybeans', 'sesame': 'sesame'}
ALLERGEN_STATUS = {'contains', 'none_found', 'check_labels', 'not_assessed'}
DIABETIC_STATUS = {'friendly', 'borderline', 'not_friendly', 'unknown'}


def allergens(names_en):
    eu, us = set(), set()
    low = [n.lower() for n in names_en]
    for keys, e, u in ALLERGEN_KEYS:
        if any(k in n for n in low for k in keys):
            eu.add(e)
            if u: us.add(u)
    return sorted(eu), sorted(us)


def servings_of(rec, est):
    if isinstance(est.get('servings'), (int, float)) and est['servings'] > 0: return float(est['servings'])
    m = re.findall(r'\d+', (rec.get('servings') or '').translate(AR_DIGITS))
    if m:
        nums = [float(x) for x in m[:2]]; return sum(nums) / len(nums)
    return 4.0


def minutes_of(s):
    s = (s or '').translate(AR_DIGITS)
    h = re.search(r'(\d+(?:\.\d+)?)\s*(ساعة|ساعات|hour|hr|h\b)', s); m = re.search(r'(\d+)\s*(دقيقة|دقائق|min|mins|minute)', s)
    tot = (float(h.group(1)) * 60 if h else 0) + (float(m.group(1)) if m else 0)
    if not tot:
        n = re.search(r'\d+', s)
        if n and ('دق' in s or 'min' in s.lower()): tot = float(n.group(0))
    return int(tot)


def duration(minutes):
    if not minutes: return None
    h, m = divmod(int(minutes), 60)
    return 'PT' + (f'{h}H' if h else '') + (f'{m}M' if m or not h else '')


# ---------------------------------------------------------------- main conversion
def convert(d, vocab, stats):
    rec = d['recipe']; est = d.get('estimate') or {}; tr = d.get('translations') or {}
    rid = rec['id']; coll = collection_of(rid)
    en = tr.get('en', {})
    langs = sorted(l for l in tr if l != 'ar')
    # ingredients
    ingredients = []; names_en = []; refs = set()
    for i, ing in enumerate(rec.get('masterIngredients', []), 1):
        en_i = (en.get('ingredients') or {}).get(ing['id'], {})
        name_en = en_i.get('name') or ing.get('name') or f'ingredient {i}'
        names_en.append(name_en)
        s = slug(name_en); base = s; k = 2
        ref_ = re.sub(r'[^A-Za-z0-9_-]', '', s[:40]) or f'ing{i}'
        if not ref_[0].isalpha(): ref_ = 'i' + ref_
        while ref_ in refs: ref_ = f'{base[:36]}_{k}'; k += 1
        refs.add(ref_)
        vid = 'cw.ing.' + s
        entry = vocab.setdefault(vid, {'id': vid, 'label': {}, 'category': ing.get('category'), 'count': 0, '_labels': collections.defaultdict(collections.Counter)})
        entry['count'] += 1
        entry['_labels']['en'][name_en] += 1; entry['_labels']['ar'][ing.get('name') or ''] += 1
        for l in langs:
            nm = ((tr[l].get('ingredients') or {}).get(ing['id']) or {}).get('name')
            if nm: entry['_labels'][l][nm] += 1
        q = parse_amount_en(en_i.get('standardAmount')); how = 'en'
        if q is None: q = parse_amount_ar(ing.get('standardAmount')); how = 'ar' if q else None
        if q is None: q = {'value': 1, 'unit': 'pcs'}; how = 'fallback'
        stats['qty'][how] += 1
        to_taste = q.pop('toTaste', False)
        item = {'ref': ref_, 'ingredientId': vid, 'legacyId': ing['id'], 'qty': q, 'display': {'ar': ing.get('standardAmount') or '', 'en': en_i.get('standardAmount') or ''}}
        if to_taste: item['toTaste'] = True
        if how == 'fallback': item['x-qtyParse'] = 'fallback: amount not parsed, see display'
        ingredients.append(item)
    # steps -> legacy nodes
    steps = sorted(rec.get('uniqueInstructions', []), key=lambda s: s.get('stepNumber', 0))
    nodes = []; steps_en = {}; steps_ar = {}; legacy_en = []; legacy_ar = []
    for n, st in enumerate(steps, 1):
        nid = f'n{n}'; t_ar = st.get('text') or ''; t_en = (en.get('instructions') or {}).get(str(st.get('stepNumber')), '')
        params = {'sourceStep': int(st.get('stepNumber') or n)}
        if st.get('phase') in ('prep', 'cook', 'finish', 'alternative'): params['phase'] = st['phase']
        h = op_hint(t_ar, t_en)
        if h: params['opHint'] = h; stats['hints'][h] += 1
        else: stats['hints']['none'] += 1
        nodes.append({'id': nid, 'op': 'cw.op.legacy_step', 'params': params, 'attention': 'continuous'})
        steps_ar[nid] = t_ar; legacy_ar.append(t_ar)
        if t_en: steps_en[nid] = t_en; legacy_en.append(t_en)
    if not nodes:
        nodes = [{'id': 'n1', 'op': 'cw.op.legacy_step', 'params': {'sourceStep': 1}, 'attention': 'continuous'}]
        steps_ar['n1'] = rec.get('title', ''); legacy_ar = [rec.get('title', '')]
    # equipment
    eq = EQUIP.get(rec.get('cookingMethod') or '', [('bowl', 'cw.eq.tool.bowl.mixing')])
    equipment = [{'ref': r, 'class': c} for r, c in eq]
    if any((n['params'].get('opHint') == 'cw.op.cut') for n in nodes):
        equipment.append({'ref': 'knife', 'class': 'cw.eq.tool.knife.chef'})
    # names in every language
    names = {'ar': rec.get('title') or rid}
    for l in langs:
        t = tr[l].get('title')
        if t: names[l] = t
    if 'en' not in names and rec.get('titleEn'): names['en'] = rec['titleEn']
    eu, us = allergens(names_en)
    # fifi.cooking's own allergen analysis (scripts/diet/allergens.py there: whole-word scan of ingredients and steps plus reviewed facts)
    # replaces the substring guess above, which read "eggplant" as eggs, "cornflour" as wheat and "coconut" as nuts. The status says whether
    # none were found for sure ("none_found"), or labels must be checked ("check_labels"), or the recipe was not assessed.
    fa = d.get('allergens'); x_allergen = {}
    if isinstance(fa, dict) and fa.get('status') in ALLERGEN_STATUS:
        eu = sorted(c for c in fa.get('contains', []) if c in EU14); us = sorted({US9[c] for c in eu if c in US9})
        x_allergen = {'x-status': fa['status'], **({'x-ruleset': fa['ruleset']} if fa.get('ruleset') else {})}
    prep_min, cook_min = minutes_of(rec.get('prepTime')), minutes_of(rec.get('cookTime'))
    doc = {
        '$schema': 'https://cookwala.ai/v1/schemas/recipe.schema.json',
        'cookwala': '0.2.0', 'id': rid, 'revision': 1, 'updated': dt.date.today().isoformat(),
        'legacy': {'dataUrl': f'{FIFI}/data/recipes/{rid}.json', 'pageUrl': f'{FIFI}/recipe/{rid}/'},
        'verification': {'level': 'V0', 'generatedBy': 'tools/export_fifi.py (deterministic, RFC-0009)', 'notes': 'Described, not machine-verified: original ingredients and steps from fifi.cooking; quantities parsed from the text where possible; no end conditions, hazards or critical control points have been verified. Every step is an unclassified legacy step that a device never executes.'},
        'dish': {'names': names, 'localName': rec.get('title') or rid, 'cuisine': cuisine_of(rid), 'course': COURSE.get(rec.get('category') or '', 'other'),
                 'tags': [t for t in [en.get('category'), en.get('cookingMethod'), coll['id']] if t],
                 'images': [{'url': f'{FIFI}/recipe-images/{rid}.jpg', 'role': 'banner'}, {'url': f'{FIFI}/recipe-images/thumbs/{rid}.jpg', 'role': 'thumb'}]},
        'yield': {'servings': servings_of(rec, est)},
        'ingredients': ingredients, 'equipment': equipment,
        'process': {'nodes': nodes, 'edges': 'implicit-from-inputs'},
        'safety': {'hazards': [], 'allergens': {'eu14': eu, 'us9': us, 'mayContain': [], **x_allergen},
                   'supervision': {'default': 'presence_required', 'reasons': {'all': 'V0 document: a person cooks from the original steps; no step is machine-verified (RFC-0009).'}},
                   'abort': {'steps': ['heat_off', 'alert_user']}},
        'text': {'ar': {'title': rec.get('title') or rid, 'intro': rec.get('culturalNotes') or '', 'steps': steps_ar, 'legacySteps': legacy_ar},
                 'en': {'title': names.get('en', rid), 'intro': en.get('culturalNotes') or '', 'steps': steps_en, 'legacySteps': legacy_en}},
        'textSidecars': {'languages': [l for l in langs if l != 'en'], 'url': '/v1/recipes/{id}/text/{lang}.json'},
        'source': {'name': (rec.get('source') or {}).get('name') or coll['sourceName'], 'url': (rec.get('source') or {}).get('url') or f'{FIFI}/recipe/{rid}/', 'collection': coll['id'], 'citation': coll['citation']},
        'license': coll['license'],
        'layers': {'r1': True, 'r2': False, 'r3': False},
    }
    # Dietary claims come from fifi.cooking (scripts/diet there): positive claims, basis "ingredients".
    # Only the keys the schema allows are copied; anything else in the source is ignored.
    claims = [{k: c[k] for k in ('claim', 'basis', 'ruleset', 'note') if c.get(k)} for c in (d.get('dietary') or []) if c.get('claim') and c.get('basis') == 'ingredients']
    if claims: doc['safety']['dietary'] = claims
    # diabetic estimate from fifi.cooking (never "safe", never medical advice): friendly is also a diabetic_friendly claim above;
    # borderline and not_friendly are kept here so a reader can tell them from "not assessed".
    fd = d.get('diabetic')
    if isinstance(fd, dict) and fd.get('status') in DIABETIC_STATUS:
        doc['safety']['x-diabetic'] = {k: v for k, v in (('status', fd['status']), ('ruleset', fd.get('ruleset')), ('basis', fd.get('basis'))) if v}
    if rec.get('difficulty') in ('easy', 'medium'): doc['dish']['difficulty'] = rec['difficulty']
    elif rec.get('difficulty') == 'master': doc['dish']['difficulty'] = 'hard'
    if prep_min or cook_min:
        doc['process']['totalTime'] = duration(prep_min + cook_min)
        if prep_min: doc['process']['activeTime'] = duration(prep_min)
    if est.get('kcal'):
        doc['nutrition'] = {'perServing': {k: est[j] for k, j in (('kcal', 'kcal'), ('protein', 'protein'), ('fat', 'fat'), ('carbs', 'carbs'), ('fiber', 'fiber'), ('sugar', 'sugar')) if isinstance(est.get(j), (int, float))},
                            'basis': 'fifi.cooking estimate per serving (modelled from typical composition tables; not measured)'}
    if isinstance(est.get('cost'), dict):
        doc['cost'] = {'buckets': {k: v for k, v in est['cost'].items() if isinstance(v, (int, float))}, 'total': round(sum(v for v in est['cost'].values() if isinstance(v, (int, float))), 2)}
    for k in ('nutrition', 'cost'):
        if k in doc and not doc[k].get('perServing', doc[k].get('buckets')): doc.pop(k)
    if not doc['text']['en']['steps']: doc['text']['en'].pop('steps'); doc['text']['en'].pop('legacySteps')
    facts_only = coll.get('text', 'full') == 'facts'
    if facts_only:  # rights not confirmed: structured facts only, no step text, no notes (docs/EXPORT-FIFI.md section 2)
        for lang_ in list(doc['text']):
            for k in ('steps', 'legacySteps', 'intro'): doc['text'][lang_].pop(k, None)
        doc['x-cookwala-text'] = 'facts'
    doc['hash'] = ref.doc_hash(doc)
    # sidecars
    side = {}
    for l in langs:
        if l == 'en': continue
        t = tr[l]
        stp = {f'n{i}': (t.get('instructions') or {}).get(str(st.get('stepNumber')), '') for i, st in enumerate(steps, 1)}
        side[l] = {'title': t.get('title') or names.get('en', rid), 'culturalNotes': '' if facts_only else (t.get('culturalNotes') or ''),
                   'steps': {} if facts_only else {k: v for k, v in stp.items() if v}, 'legacySteps': [] if facts_only else [v for v in stp.values() if v],
                   'x-ingredients': {ing['ref']: ((t.get('ingredients') or {}).get(ing['legacyId']) or {}) for ing in ingredients},
                   'x-category': t.get('category') or '', 'x-cookingMethod': t.get('cookingMethod') or ''}
    index = {'id': rid, 'revision': 1, 'hash': doc['hash'], 'title': names.get('en', rid), 'cuisine': cuisine_of(rid), 'course': doc['dish']['course'], 'tags': doc['dish']['tags'], 'level': 'V0',
             'servings': doc['yield']['servings'], 'allergens': eu, 'supervision': 'presence_required', 'thumb': f'{FIFI}/recipe-images/thumbs/{rid}.jpg',
             'x-titles': names, 'x-collection': coll['id'], 'x-license': coll['license'], 'x-steps': len(nodes), 'x-ingredients': len(ingredients), **({'x-text': 'facts'} if facts_only else {})}
    if claims: index['x-dietary'] = [c['claim'] for c in claims]
    if est.get('kcal'): index['kcal'] = est['kcal']
    if doc['process'].get('totalTime'): index['totalTimeS'] = (prep_min + cook_min) * 60
    return doc, side, index


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=str(pathlib.Path.home() / 'Documents/GitHub/fifirecipes/public/data/recipes'))
    ap.add_argument('--out', default=str(ROOT / 'recipes'))
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--collections', default='all')
    a = ap.parse_args()
    src = pathlib.Path(a.src); out = pathlib.Path(a.out)
    files = sorted(src.glob('*.json'))
    if a.limit: files = files[:a.limit]
    vocab = {}; stats = {'qty': collections.Counter(), 'hints': collections.Counter(), 'coll': collections.Counter(), 'langs': collections.Counter()}
    sidecars = collections.defaultdict(dict); index = []
    for f in files:
        d = json.loads(f.read_text())
        rid = d['recipe']['id']; coll = collection_of(rid)
        if a.collections != 'all' and coll['id'] not in a.collections.split(','): continue
        if not coll.get('export', True): stats['coll'][coll['id'] + ' (skipped by switch)'] += 1; continue
        doc, side, ix = convert(d, vocab, stats)
        p = out / coll['id'] / f'{rid}.cookwala.json'; p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')) + '\n')
        for l, s in side.items(): sidecars[(l, coll['id'])][rid] = s; stats['langs'][l] += 1
        index.append(ix); stats['coll'][coll['id']] += 1
    for (l, c), bundle in sidecars.items():
        p = out / 'text' / l / f'{c}.json.gz'; p.parent.mkdir(parents=True, exist_ok=True)
        with gzip.open(p, 'wt', encoding='utf-8', compresslevel=9) as fh: fh.write(json.dumps(bundle, ensure_ascii=False, separators=(',', ':')) + '\n')
    # vocabulary
    entries = []
    for vid, e in sorted(vocab.items()):
        labels = {l: c.most_common(1)[0][0] for l, c in e['_labels'].items() if c and c.most_common(1)[0][0]}
        entries.append({'id': vid, 'label': labels, 'classes': ['cw.ingclass.' + (e['category'] or 'other')], 'definition': f"fifi.cooking ingredient; used in {e['count']} recipe line{'s' if e['count'] != 1 else ''}."})
    (ROOT / 'vocab' / 'ingredients.json').write_text(json.dumps({'name': 'ingredients', 'version': '0.1.0', 'entries': entries}, ensure_ascii=False, indent=0) + '\n')
    (out / 'INDEX.json').write_text(json.dumps({'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'), 'count': len(index), 'items': index}, ensure_ascii=False, separators=(',', ':')) + '\n')
    total_q = sum(stats['qty'].values()) or 1
    report = ['# fifi.cooking export report', '', f'Generated {dt.date.today().isoformat()} by `tools/export_fifi.py` (deterministic stages only; every document is V0, RFC-0009).', '',
              '| Collection | Documents | Licence | Text |', '|---|---|---|---|'] + [f"| {c['id']} | {stats['coll'][c['id']]} | `{c['license']}` | {c.get('text', 'full')} |" for c in COLLECTIONS] + ['',
              f"Ingredients: {total_q} lines; parsed from English amounts {stats['qty']['en']} ({stats['qty']['en'] / total_q:.1%}), from Arabic {stats['qty']['ar']} ({stats['qty']['ar'] / total_q:.1%}), fallback to 1 piece with the original text kept {stats['qty']['fallback']} ({stats['qty']['fallback'] / total_q:.1%}).", '',
              f"Vocabulary: {len(entries)} ingredient entries with labels in {len(stats['langs']) + 2} languages.", '',
              'Step operation hints (for the V1 conversion; never used for control):', ''] + [f'- {k}: {v}' for k, v in stats['hints'].most_common()] + ['',
              'Sidecar languages: ' + ', '.join(sorted(stats['langs'])) + '.']
    (out / 'REPORT.md').write_text('\n'.join(report) + '\n')
    print('\n'.join(report[-3 - len(stats['hints']):]) if False else f"documents {len(index)}; vocab {len(entries)}; qty en {stats['qty']['en']} ar {stats['qty']['ar']} fallback {stats['qty']['fallback']}")


if __name__ == '__main__':
    main()
