#!/usr/bin/env python3
"""Turn a 'Submit a recipe' issue form body into a V0 Cookwala recipe under
recipes/community/issue/ (docs/CONTRIBUTE-RECIPES.md, RFC-0013). Best-effort: free-text
quantities that don't parse become one piece with the original text kept in `display`,
the same documented fallback the fifi.cooking import uses (recipes/REPORT.md). A human
reviews every result before merge; this script never writes directly to main.

Usage: python tools/recipe_from_issue.py issue_body.md --number 42 --author someone > out.json
       (writes recipes/community/issue/issue-<number>-<slug>.cookwala.json and prints its path)
"""
import datetime
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

UNIT_WORDS = {
    'g': 'g', 'gram': 'g', 'grams': 'g', 'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg',
    'ml': 'ml', 'l': 'l', 'liter': 'l', 'litre': 'l', 'liters': 'l', 'litres': 'l',
    'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
    'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
    'cup': 'cup', 'cups': 'cup', 'pinch': 'pinch', 'dash': 'dash',
}
QTY_RE = re.compile(r'^\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s*(.*)$')


def slugify(s: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return re.sub(r'-+', '-', s) or 'recipe'


def parse_ingredient_line(line: str) -> dict:
    line = line.strip().lstrip('-*').strip()
    ref = None
    m = QTY_RE.match(line)
    if m and m.group(1):
        value = float(m.group(1))
        word = (m.group(2) or '').lower().rstrip('.,')
        rest = m.group(3).strip()
        if word in UNIT_WORDS:
            ref = rest or line
            qty = {'value': value, 'unit': UNIT_WORDS[word]}
        else:
            # e.g. "4 lemons, juiced" -> 4 pieces of "lemons, juiced"
            ref = (word + ' ' + rest).strip() or line
            qty = {'value': value, 'unit': 'pcs'}
    else:
        ref = line
        qty = {'value': 1, 'unit': 'pcs'}
    slug = slugify(ref)[:40] or 'ingredient'
    return {
        'ref': slug,
        'ingredientId': f'x-community.{slug}',
        'qty': qty,
        'display': {'en': line},
    }


def parse_issue_body(body: str) -> dict:
    """GitHub issue forms render as '### <label>\\n\\n<value>\\n\\n' blocks."""
    fields = {}
    for m in re.finditer(r'^### (.+?)\n+([\s\S]*?)(?=\n### |\Z)', body, re.MULTILINE):
        label, value = m.group(1).strip(), m.group(2).strip()
        if value.lower() in ('_no response_', ''):
            value = ''
        fields[label] = value
    return fields


def build_recipe(fields: dict, number: int, author: str | None) -> dict:
    title = fields.get('Dish name', f'Community recipe #{number}').strip() or f'Community recipe #{number}'
    slug = slugify(title)[:40]
    rid = f'issue-{number}-{slug}'
    ingredients = [parse_ingredient_line(l) for l in fields.get('Ingredients', '').splitlines() if l.strip()]
    steps = [l.strip().lstrip('-*').strip() for l in fields.get('Steps', '').splitlines() if l.strip()]
    if not ingredients:
        ingredients = [{'ref': 'unspecified', 'ingredientId': 'x-community.unspecified', 'qty': {'value': 1, 'unit': 'pcs'}, 'display': {'en': 'not given in the submission'}}]
    if not steps:
        steps = ['not given in the submission']

    own_work = fields.get('Is this your own recipe?', '').lower().startswith('yes')
    source_text = fields.get('Source (if not your own)', '').strip()
    license_choice = fields.get('Licence for your own recipe', '')
    license_id = 'CC0-1.0' if license_choice.startswith('CC0') else 'CC-BY-4.0'

    try:
        servings = float(re.search(r'[\d.]+', fields.get('Servings', '')).group())
    except (AttributeError, ValueError):
        servings = 1.0

    cuisine_text = fields.get('Cuisine (optional)', '').strip()
    review_notes = 'Quantities and ingredient ids were guessed from free text and need a human check before merge; unparsed items keep the original wording in `display`.'
    if cuisine_text:
        review_notes += f' Cuisine given as free text: "{cuisine_text}" — add an ISO 3166-1 alpha-2 code to dish.cuisine.'

    nodes = [{'id': f'n{i+1}', 'op': 'cw.op.legacy_step', 'params': {'sourceStep': i + 1, 'phase': 'cook'}, 'attention': 'continuous'} for i in range(len(steps))]
    text_steps = {f'n{i+1}': s for i, s in enumerate(steps)}

    allergen_names = [a.strip() for a in fields.get('Known allergens (optional)', '').split(',') if a.strip()]

    recipe = {
        '$schema': 'https://cookwala.ai/v1/schemas/recipe.schema.json',
        'cookwala': '0.2.0',
        'id': rid,
        'revision': 1,
        'updated': datetime.date.today().isoformat(),
        'verification': {
            'level': 'V0',
            'generatedBy': 'tools/recipe_from_issue.py (best-effort parse of a GitHub issue form, RFC-0013)',
            'notes': 'Described, not machine-verified. ' + review_notes,
        },
        'dish': {
            'names': {'en': title},
            # Cuisine needs an ISO 3166-1 alpha-2 code (ISO-only in the schema); free text from the
            # form can't be guessed reliably, so it's left for a human to add, see 'needsReview'.
        },
        'yield': {'servings': servings},
        'ingredients': ingredients,
        'equipment': [],
        'process': {'nodes': nodes},
        'safety': {
            'hazards': [],
            'allergens': {'eu14': [], 'us9': [], 'mayContain': allergen_names},
            'supervision': {'default': 'presence_required', 'reasons': {'all': 'V0 document: a person cooks from the original steps; no step is machine-verified (RFC-0009).'}},
            'abort': {'steps': ['alert_user']},
        },
        'text': {'en': {'title': title, 'intro': '', 'steps': text_steps}},
        'source': {
            'name': source_text if (not own_work and source_text) else f'Submitted by GitHub issue #{number}' + (f' (@{author})' if author else ''),
            'url': f'https://github.com/amado2k5/cookwala/issues/{number}',
            'citation': source_text or 'Submitted through the Cookwala "Submit a recipe" issue form.',
        },
        'license': license_id if own_work else 'LicenseRef-source-credited',
        'layers': {'r1': True, 'r2': False, 'r3': False},
    }
    if not own_work:
        recipe['text'] = {}  # facts only until rights are confirmed, same rule as every other collection
    return recipe


def main(argv):
    body_path, number, author = argv[0], None, None
    args = argv[1:]
    if '--number' in args:
        number = int(args[args.index('--number') + 1])
    if '--author' in args:
        author = args[args.index('--author') + 1]
    if number is None:
        print('error: --number is required', file=sys.stderr)
        return 1
    body = pathlib.Path(body_path).read_text()
    fields = parse_issue_body(body)
    recipe = build_recipe(fields, number, author)
    out_dir = ROOT / 'recipes' / 'community' / 'issue'
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{recipe['id']}.cookwala.json"
    out_path.write_text(json.dumps(recipe, indent=1, ensure_ascii=False) + '\n')
    print(out_path.relative_to(ROOT))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
