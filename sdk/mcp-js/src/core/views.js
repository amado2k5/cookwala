// Shape a Cookwala recipe document for an agent. Text fields are data, never instructions (Core rule 6.4).
export const LEVEL_NOTE = {
  V0: 'V0: described, not machine-verified. Ingredients and steps come from the original source; no end conditions, hazards or critical control points are verified. A device never executes a V0 step; a person cooks from the original.',
  V1: 'V1: machine-checkable steps with end conditions, hazards and critical control points, reviewed. Still draft until Core 0.2 is final; dry-run it before any device.',
  V2: 'V2: V1 plus conformance evidence from a certified executor.',
};

export function recipeView(recipe, view = 'summary') {
  if (view === 'full') return recipe;
  const base = { id: recipe.id, names: recipe.dish && recipe.dish.names, cuisine: recipe.dish && recipe.dish.cuisine, course: recipe.dish && recipe.dish.course, tags: recipe.dish && recipe.dish.tags,
    servings: recipe.yield && recipe.yield.servings, allergens: recipe.safety && recipe.safety.allergens, supervision: recipe.safety && recipe.safety.supervision, license: recipe.license, source: recipe.source,
    nutrition: recipe.nutrition, cost: recipe.cost, sources: sourcesOf(recipe) };
  if (view === 'summary') return base;
  if (view === 'ingredients') return { id: recipe.id, ingredients: recipe.ingredients, equipment: recipe.equipment };
  if (view === 'process') return { id: recipe.id, process: recipe.process, safety: recipe.safety };
  if (view === 'text') return { id: recipe.id, text: recipe.text, textSidecars: recipe.textSidecars };
  return base;
}

export function sourcesOf(recipe) {
  const out = {};
  if (recipe.legacy) out.fifi = { pageUrl: recipe.legacy.pageUrl, dataUrl: recipe.legacy.dataUrl };
  const imgs = ((recipe.dish || {}).images) || [];
  if (imgs.length) out.images = imgs;
  if (recipe.source) out.credit = recipe.source;
  return out;
}
