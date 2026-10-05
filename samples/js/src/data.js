// The bundled snapshot: envelopes, heat bands, limits, four recipes, four devices, expected answers.
// Regenerated from the repository by samples/tools/build_bundle.py; never edited by hand.
import { readFileSync } from 'node:fs';

let cached = null;

export function loadBundle() {
  if (!cached) cached = JSON.parse(readFileSync(new URL('../data/bundle.json', import.meta.url), 'utf8'));
  return cached;
}

/** Find a recipe by global reference (cw:cookwala.ai:example-shakshuka), document id or bundle key. */
export function recipeByRef(recipes, gref) {
  const rid = String(gref).split(':').at(-1).split('#').at(-1);
  for (const [key, doc] of Object.entries(recipes)) {
    if (rid === key || rid === doc.id) return doc;
  }
  return null;
}

export function globalRef(recipe) {
  return `cw:cookwala.ai:${recipe.id}`;
}

/** Every allergen the recipe declares, in any scheme, plus per-ingredient allergens (a Set). */
export function recipeAllergens(recipe) {
  const present = new Set();
  const declared = recipe?.safety?.allergens ?? {};
  if (declared && typeof declared === 'object' && !Array.isArray(declared)) {
    for (const lst of Object.values(declared)) if (Array.isArray(lst)) lst.forEach((a) => present.add(a));
  } else if (Array.isArray(declared)) declared.forEach((a) => present.add(a));
  for (const ing of recipe?.ingredients ?? []) for (const a of ing.allergens ?? []) present.add(a);
  return present;
}

export function intersect(list, set) {
  return new Set([...(list ?? [])].filter((x) => set.has(x)));
}
