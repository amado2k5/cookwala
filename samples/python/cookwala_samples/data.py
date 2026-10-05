"""The bundled snapshot: envelopes, heat bands, limits, four recipes, four devices, expected answers.

Regenerated from the repository by samples/tools/build_bundle.py; never edited by hand.
"""
import functools
import importlib.resources
import json


@functools.lru_cache(maxsize=1)
def load_bundle():
    # importlib.resources also reads from a wheel, an egg or the single-file zipapp
    return json.loads(importlib.resources.files(__package__).joinpath('data').joinpath('bundle.json').read_text(encoding='utf-8'))


def recipe_by_ref(recipes, gref):
    """Find a recipe by global reference (cw:cookwala.ai:example-shakshuka), document id or bundle key."""
    rid = gref.split(':')[-1].split('#')[-1]
    for key, doc in recipes.items():
        if rid in (key, doc.get('id')):
            return doc
    return None


def global_ref(recipe):
    return f"cw:cookwala.ai:{recipe['id']}"


def recipe_allergens(recipe):
    """Every allergen the recipe declares, in any scheme, plus per-ingredient allergens."""
    present = set()
    declared = recipe.get('safety', {}).get('allergens', {})
    if isinstance(declared, dict):
        for lst in declared.values():
            present.update(lst if isinstance(lst, list) else [])
    else:
        present.update(declared or [])
    for ing in recipe.get('ingredients', []):
        present.update(ing.get('allergens', []) or [])
    return present
