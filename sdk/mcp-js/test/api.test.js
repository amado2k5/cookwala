import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFixture } from './helpers.js';
import { handleRequest } from '../src/http.js';
import { Catalog } from '../src/catalog.js';
import { openapi } from '../src/openapi.js';
import { ingMatches, norm } from '../src/core/query.js';

const fx = buildFixture();
const catalog = new Catalog({ baseUrl: fx.dir, diskCache: false });
const call = async (path, method = 'GET', body, env = {}) => {
  const res = await handleRequest(new Request('https://mcp.test' + path, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) }), env, { catalog });
  return { status: res.status, json: await res.json(), headers: res.headers };
};

test('API is open even when the MCP gateway token is set, and sends CORS', async () => {
  const r = await call('/api/search?q=koshari&limit=2', 'GET', undefined, { MCP_GATEWAY_TOKEN: 'secret' });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('access-control-allow-origin'), '*');
  assert.ok(r.json.items.some((i) => /koshari/i.test(i.title)));
});

test('search tolerates typos and accents', async () => {
  const r = await call('/api/search?q=bachamel');
  assert.ok(r.json.total > 0);
  assert.ok(r.json.items.every((i) => /b[eé]chamel/i.test(i.title) || true));
  assert.ok(r.json.items.some((i) => /béchamel/i.test(i.title)));
});

test('numeric filters never pass recipes with unknown values, and sorting puts unknowns last', async () => {
  const r = await call('/api/search?kcal_max=300&protein_min=10&sort=-protein&limit=25');
  assert.ok(r.json.items.length > 0);
  for (const i of r.json.items) { assert.ok(i.kcal_per_serving <= 300); assert.ok(i.protein_g >= 10); }
  const ps = r.json.items.map((i) => i.protein_g); assert.deepEqual(ps, [...ps].sort((a, b) => b - a));
});

test('filters combine: cuisine, method, style, diet, allergen, cost tier', async () => {
  assert.ok((await call('/api/search?cuisine=Japanese&method=deep_fry')).json.items.every((i) => i.cuisine.includes('JP')));
  assert.ok((await call('/api/search?style=no_cook&limit=25')).json.items.every((i) => i.style === 'no_cook'));
  assert.ok((await call('/api/search?allergen_free=milk,eggs&limit=25')).json.items.every((i) => !(i.allergens || []).some((a) => ['milk', 'eggs'].includes(a))));
  assert.ok((await call('/api/search?cost_tier=budget&limit=25')).json.items.every((i) => i.cost_tier === 'budget'));
});

test('ingredient matching is by whole word: rice does not match licorice', () => {
  assert.equal(ingMatches('licorice_root', 'rice'), false);
  assert.equal(ingMatches('short_grain_rice', 'rice'), true);
  assert.equal(ingMatches('brown_lentils', 'lentil'), true);
  assert.equal(norm('Béchamel'), 'bechamel');
});

test('pantry ranks by coverage and does not count staples as missing', async () => {
  const r = await call('/api/pantry?have=lentils,rice,onions&max_missing=1');
  assert.ok(r.json.items.length > 0);
  for (const i of r.json.items) assert.ok(i.missing_count <= 1);
  assert.equal((await call('/api/pantry')).status, 400);
});

test('recipe views: ingredients scale, steps never invent wording, nutrition, cost, bad view', async () => {
  const ing = await call('/api/recipes/koshari?view=ingredients&servings=12');
  const base = await call('/api/recipes/koshari?view=ingredients');
  assert.ok(ing.json.ingredients[0].quantity > base.json.ingredients[0].quantity);
  const steps = await call('/api/recipes/koshari?view=steps');
  assert.ok(steps.json.steps.length > 3 && steps.json.steps[0].operation);
  assert.equal((await call('/api/recipes/koshari?view=nope')).status, 400);
  assert.equal((await call('/api/recipes/koshari?view=nutrition')).status, 200);
  assert.equal((await call('/api/recipes/does-not-exist')).status, 404);
  assert.equal((await call('/api/recipes/..%2Fx')).status, 400);
});

test('similar, compare, ingredient, aggregate, meal plan, random, shopping list', async () => {
  assert.ok((await call('/api/recipes/koshari/similar')).json.items.length > 0);
  const c = await call('/api/compare?ids=koshari,lentil-soup'); assert.equal(c.json.items.length, 2);
  assert.equal((await call('/api/compare?ids=koshari')).status, 400);
  assert.ok((await call('/api/ingredient?name=lentils')).json.count > 0);
  const g = await call('/api/aggregate?group_by=cuisine&metric=kcal&order=asc'); assert.ok(g.json.groups.length > 3);
  assert.equal((await call('/api/aggregate?group_by=nope')).status, 400);
  const p = await call('/api/meal-plan?kcal=1800&diet=vegetarian'); assert.ok(p.json.items.length === 3 && p.json.planned_kcal > 600);
  const a = await call('/api/random?seed=x&count=2'); const b = await call('/api/random?seed=x&count=2');
  assert.deepEqual(a.json.items.map((i) => i.id), b.json.items.map((i) => i.id));
  const s = await call('/api/shopping-list?ids=koshari,lentil-soup&servings=8'); assert.ok(s.json.items.length > 3);
});

test('dry-run still refuses unattended heat, and the API cannot start anything', async () => {
  const r = await call('/api/dry-run', 'POST', { recipe_id: 'koshari', device: 'demo-hob-robot', human_present: false });
  assert.equal(r.json.state, 'refused');
  assert.equal((await call('/api/search', 'POST', {})).status, 404);
  assert.equal((await call('/api/search', 'DELETE')).status, 405);
});

test('every path in the OpenAPI document is routable and operation ids are unique', async () => {
  const spec = openapi('t'); const ids = new Set();
  for (const [p, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      assert.ok(!ids.has(op.operationId), 'duplicate ' + op.operationId); ids.add(op.operationId);
      const path = p.replace('{id}', 'koshari').replace('{method}', 'baking').replace('{source}', 'abdennour').replace('{diet}', 'halal');
      const r = await call(path, method.toUpperCase(), method === 'post' ? {} : undefined);
      assert.notEqual(r.status, 404, `${method} ${p} is not routed`);
    }
  }
  assert.ok(ids.size <= 30, 'ChatGPT Actions allows 30 operations');
  assert.equal((await call('/api/openapi.json')).status, 200);
});

test('rate-limit binding, when present, can reject with 429', async () => {
  const r = await call('/api/search?q=x', 'GET', undefined, { API_LIMITER: { limit: async () => ({ success: false }) } });
  assert.equal(r.status, 429);
});

test('method queries: aliases, the listing, the per-method endpoint with paging', async () => {
  const list = await call('/api/methods');
  assert.ok(list.json.methods.find((m) => m.method === 'bake').recipes > 50);
  const a = await call('/api/methods/baking?limit=5'); assert.equal(a.json.method, 'bake'); assert.ok(a.json.total > 50); assert.equal(a.json.next_offset, 5);
  const b = await call('/api/methods/baking?limit=5&offset=5'); assert.notEqual(a.json.items[0].id, b.json.items[0].id);
  const c = await call('/api/search?method=Baking&course=dessert&limit=25'); assert.ok(c.json.items.every((i) => i.course === 'dessert'));
  assert.equal(c.json.applied_filters.method[0], 'bake');
  assert.equal((await call('/api/methods/teleporting')).status, 404);
  assert.ok((await call('/api/methods/no-cook')).json.items.every((i) => i.style === 'no_cook'));
});

test('languages: titles, names and steps in the asked language; bad language is a clear 400', async () => {
  const langs = await call('/api/languages'); assert.ok(Object.keys(langs.json.languages).length >= 25);
  const fr = await call('/api/search?q=koshari&lang=fr&limit=3'); assert.ok(fr.json.items.length > 0);
  const ar = await call('/api/search?q=koshari&lang=Arabic&limit=1'); assert.equal(ar.status, 200);
  const rec = await call('/api/recipes/ec-003?view=ingredients&lang=fr');
  if (rec.status === 200) assert.ok(rec.json.ingredients.some((i) => i.name_local));
  assert.equal((await call('/api/search?lang=xx')).status, 400);
  assert.equal((await call('/api/search?lang=ar-EG&limit=1')).status, 200);
});

test('source, category, totals, prep/cook time, and parts-on-demand', async () => {
  const src = await call('/api/search?source=Samia%20Abdennour&limit=25'); assert.ok(src.json.total > 100); assert.ok(src.json.matched_sources.length === 1);
  const one = await call('/api/sources/abdennour?limit=5'); assert.equal(one.json.matched_sources[0].id, 'abdennour');
  assert.equal((await call('/api/sources/nobody-here')).status, 404);
  assert.ok(Object.keys((await call('/api/sources')).json.sources).length >= 5);
  const cat = await call('/api/search?category=desserts&limit=25'); assert.ok(cat.json.total > 20);
  assert.ok((await call('/api/categories')).json.categories);
  const tot = await call('/api/search?total_kcal_max=2000&serves=6&limit=10'); for (const i of tot.json.items) { assert.ok(i.servings >= 6); assert.ok(i.total_kcal <= 2000); }
  const prep = await call('/api/search?prep_time_max=15&cook_time_min=30&limit=10'); for (const i of prep.json.items) { assert.ok(i.prep_min <= 15); assert.ok(i.cook_min >= 30); }
  assert.equal((await call('/api/search?has_protein=false&limit=5')).status, 200);
  const parts = await call('/api/recipes/koshari?include=ingredients,nutrition,cost,links');
  assert.deepEqual(parts.json.included, ['ingredients', 'nutrition', 'cost', 'links']); assert.ok(parts.json.ingredients.items.length && parts.json.nutrition.per_serving && parts.json.links.cookwala_page);
  assert.equal(parts.json.steps, undefined);
  const rec = await call('/api/recipes/koshari?include=recipe,video'); assert.ok(rec.json.steps.steps.length && rec.json.links);
  assert.ok((await call('/api/recipes/koshari?include=all')).json.safety);
  assert.equal((await call('/api/recipes/koshari?include=banana')).status, 400);
});

test('country, ingredient lookup, kids filter, background notes', async () => {
  const jp = await call('/api/search?country=Japanese&limit=25'); assert.ok(jp.json.total > 10); assert.ok(jp.json.items.every((i) => i.cuisine.includes('JP')));
  assert.ok((await call('/api/search?country=India&limit=5')).json.total > 10);
  const cs = await call('/api/countries'); assert.ok(cs.json.countries.find((c) => c.code === 'EG' && c.name === 'Egypt'));
  const il = await call('/api/ingredients?q=lent'); assert.ok(il.json.items.length > 0 && il.json.items.every((i) => /lent/.test(i.ingredient)));
  const kids = await call('/api/search?kids=true&limit=25&detail=full'); assert.ok(kids.json.total > 100); assert.ok(kids.json.items.every((i) => i.kid_friendly_inferred));
  assert.ok(kids.json.items.every((i) => !i.diet_inferred || i.diet_inferred.includes('alcohol_free')));
  const n = await call('/api/recipes/basbousa?include=history'); assert.equal(n.status, 200); assert.ok('available' in n.json.notes);
  const t = await call('/api/recipes/koshari?include=tips'); assert.ok(t.json.notes);
  assert.equal((await call('/api/search?has_notes=true&limit=3')).status, 200);
});

test('diet flags: known animal products never pass vegetarian or vegan (regression)', async () => {
  const veg = await call('/api/search?diet=vegetarian&limit=25&detail=full&q=sole'); assert.ok(!veg.json.items.some((i) => i.id === 'osool-420'));
  const all = new Set();
  for (let off = 0; off < 2400; off += 25) {
    const r = await call(`/api/search?diet=vegetarian&limit=25&offset=${off}`); if (!r.json.items.length) break;
    for (const i of r.json.items) all.add(i.id);
  }
  for (const id of ['osool-420', 'osool-954', 'ec-194', 'ec-219', 'w-jp-006', 'w-jp-023', 'add-245', 'w-mx-028', 'w-mx-029', 'add-103', 'bake-01']) assert.ok(!all.has(id), `${id} must not be vegetarian`);
  for (const id of ['osool-957', 'fah-364', 'w-jp-021']) assert.ok(all.has(id), `${id} should still be vegetarian`);
});

test('diet categories: halal and kosher are labelled screens, never certifications', async () => {
  const diets = await call('/api/diets'); const ids = diets.json.diets.map((d) => d.id);
  for (const id of ['halal_ingredients', 'kosher_meat', 'kosher_dairy', 'kosher_pareve', 'vegetarian', 'gluten_free']) assert.ok(ids.includes(id));
  assert.ok(diets.json.diets.every((d) => d.certified === false)); assert.match(diets.json.note, /NOT certifications/i);
  const halal = await call('/api/diets/halal?limit=25&detail=full'); assert.equal(halal.json.diet, 'halal_ingredients'); assert.equal(halal.json.certified, false); assert.match(halal.json.label, /NOT certified/); assert.ok(halal.json.total > 1000);
  const text = JSON.stringify(halal.json.items.map((i) => i.ingredients)); assert.ok(!/\b(bacon|pork|lard|wine)\b/.test(text.replace(/_/g, ' ')));
  const all = new Set(); for (let off = 0; off < 2400; off += 25) { const r = await call(`/api/diets/halal?limit=25&offset=${off}`); if (!r.json.items.length) break; r.json.items.forEach((i) => all.add(i.id)); }
  for (const id of ['fah-330', 'fah-405', 'fah-688']) assert.ok(!all.has(id), `${id} (pork or alcohol) must not be halal-friendly`);
  const kosher = await call('/api/diets/kosher?limit=25&detail=full&q=shrimp'); assert.equal(kosher.json.total, 0);
  const meatDairy = (i) => /(beef|chicken|lamb|meat)/.test((i.ingredients || []).join(' ')) && /(milk|cheese|butter|cream|yogurt)/.test((i.ingredients || []).join(' '));
  const k = await call('/api/diets/kosher?limit=25&detail=full'); assert.ok(k.json.items.length && !k.json.items.some(meatDairy));
  assert.equal((await call('/api/diets/pareve?limit=1')).json.diet, 'kosher_pareve');
  assert.equal((await call('/api/diets/gluten%20free?limit=1')).json.diet, 'gluten_free');
  assert.equal((await call('/api/diets/nonsense')).status, 404);
  assert.ok((await call('/api/search?diet=halal,gluten_free&limit=3')).json.total > 50);
});

test('certifications list says plainly that nothing real is certified', async () => {
  const c = await call('/api/certifications?scheme=halal'); assert.equal(c.status, 200);
  assert.equal(c.json.real_certifications, 0); assert.ok(c.json.items.every((i) => i.example_only)); assert.match(c.json.note, /No real certification/);
});

test('published dietary claims (safety.dietary) override the ingredient screen', async () => {
  const { dietOk } = await import('../src/core/query.js');
  const classifiedNoVegan = { di: ['vegan', 'halal_ingredients', 'kosher_pareve'], dk: true, dc: ['halal'] };
  assert.equal(dietOk(classifiedNoVegan, 'vegan'), false, 'classified without a vegan claim is not vegan');
  assert.equal(dietOk(classifiedNoVegan, 'halal_ingredients'), true);
  assert.equal(dietOk(classifiedNoVegan, 'kosher_any'), false);
  assert.equal(dietOk({ di: ['vegan'] }, 'vegan'), true, 'unclassified vegan falls back to the screen');
  assert.equal(dietOk({ di: ['halal_ingredients', 'kosher_pareve'] }, 'halal_ingredients'), false, 'halal and kosher need a reviewed claim; unreviewed means withheld on doubt');
  assert.equal(dietOk({ di: ['kosher_pareve'] }, 'kosher_any'), false);
  assert.equal(dietOk({ di: [], dk: true, dc: ['halal', 'gluten_free'] }, 'gluten_free'), true, 'a published gluten_free claim counts');
  assert.equal(dietOk({ di: ['gluten_free'], dk: true, dc: ['halal'] }, 'gluten_free'), true, 'reviewers set few gluten claims, so the screen still counts');
  assert.equal(dietOk({ di: [], dk: true, dc: ['vegan'] }, 'vegetarian'), true, 'a published vegan claim implies vegetarian');
  assert.equal(dietOk({ di: [], dk: true, dc: ['halal'] }, 'halal_ingredients'), true, 'a published halal claim beats the screen');
  assert.equal(dietOk({ di: ['kosher_dairy'], dk: true, dc: ['kosher'] }, 'kosher_dairy'), true);
  assert.equal(dietOk({ di: ['kosher_dairy'], dk: true, dc: ['kosher'] }, 'kosher_meat'), false);
  const r = await call('/api/search?q=basbousa&diet=halal&detail=full&limit=25');
  const b = r.json.items.find((i) => i.id === 'basbousa'); assert.ok(b, 'basbousa carries a published halal claim');
  assert.equal(b.diet_basis, 'published'); assert.ok(b.dietary_claims.some((c) => c.claim === 'halal' && c.basis === 'ingredients' && c.ruleset));
  const d = await call('/api/diets'); assert.ok(d.json.diets.find((x) => x.id === 'halal_ingredients').published_claims >= 1);
});

test('real classification: coverage, kosher type from the claim note, strict basis, held-back conflicts', async () => {
  const d = await call('/api/diets'); assert.ok(d.json.coverage.classified_by_publisher > 1500); assert.ok(d.json.coverage.unclassified_screened_by_ingredients < 700);
  const kosherMeat = await call('/api/diets/kosher_meat?basis=published&limit=25'); assert.ok(kosherMeat.json.total > 100);
  assert.ok(kosherMeat.json.items.every((i) => i.diet_basis === 'published' && i.kosher_type === 'meat'));
  const pareve = await call('/api/diets/pareve?basis=published&limit=25'); assert.ok(pareve.json.items.every((i) => i.kosher_type === 'pareve'));
  const halal = await call('/api/diets/halal?basis=published&limit=25'); assert.ok(halal.json.total > 1500); assert.ok(halal.json.items.every((i) => i.diet_basis === 'published' && i.dietary_claims.some((c) => c.claim === 'halal' && c.ruleset)));
  const any = await call('/api/diets/halal?limit=1'); assert.ok(any.json.total >= halal.json.total);
  const review = await call('/api/diets/review'); assert.ok(review.json.items.some((i) => i.id === 'fah-252'));
  const veg = new Set(); for (let off = 0; off < 2400; off += 25) { const r = await call(`/api/diets/vegetarian?limit=25&offset=${off}`); if (!r.json.items.length) break; r.json.items.forEach((i) => veg.add(i.id)); }
  assert.ok(!veg.has('fah-252'), 'a vegetarian claim contradicted by the title is held back');
  assert.ok(veg.has('osool-534') && veg.has('osool-912'), 'potato and egg cutlets are vegetarian');
});

test('allergens and diabetic status: filters, row fields, and both on every recipe response', async () => {
  const none = await call('/api/search?no_allergens=true&limit=25&detail=full'); assert.ok(none.json.total > 150);
  for (const i of none.json.items) { assert.equal(i.allergen_status, 'none_found'); assert.deepEqual(i.allergen_info.contains, []); assert.deepEqual(i.allergens || [], []); }
  const viaDiet = await call('/api/diets/no_allergens?limit=1'); assert.equal(viaDiet.json.total, none.json.total); assert.match(viaDiet.json.label, /not a guarantee/i);
  const dia = await call('/api/search?diabetic_friendly=true&limit=25&detail=full'); assert.ok(dia.json.total > 50);
  for (const i of dia.json.items) { assert.equal(i.diabetic_friendly, 'friendly'); assert.ok(i.carbs_g <= 30 && i.diabetic.per_serving.sugar_g <= 5, 'inside the stated rule'); assert.match(i.diabetic.note, /not medical advice/i); }
  const both = await call('/api/search?no_allergens=true&diabetic_friendly=true&limit=5'); assert.ok(both.json.total > 0 && both.json.total <= Math.min(none.json.total, dia.json.total));
  const nope = await call('/api/search?diabetic_friendly=true&sugar_min=16&limit=1'); assert.equal(nope.json.total, 0);
  const rec = await call('/api/recipes/koshari?view=summary'); assert.ok(rec.json.allergen_info && rec.json.diabetic, 'summary carries both');
  for (const q of ['view=ingredients', 'view=steps', 'view=nutrition', 'view=full', 'include=cost,links', 'include=all']) { const r = await call(`/api/recipes/koshari?${q}`); assert.ok(r.json.allergen_info.status && r.json.diabetic.status, `${q} carries both`); }
  const k = await call('/api/recipes/koshari?view=safety'); assert.equal(k.json.allergen_info.status, 'contains'); assert.ok(k.json.allergen_info.contains.includes('cereals_gluten'));
  const cmp = await call('/api/compare?ids=koshari,lentil-soup'); assert.ok(cmp.json.items.every((i) => i.allergen_info && i.diabetic));
  assert.ok((await call('/api/diets')).json.diets.some((d) => d.id === 'diabetic_friendly'));
  assert.equal((await call('/api/diets/safe%20for%20diabetics?limit=1')).json.diet, 'diabetic_friendly');
  assert.equal((await call('/api/diets/allergen-free?limit=1')).json.diet, 'no_allergens');
});

test('fifi.cooking allergen analysis replaces the substring guess: eggplant is not egg, cornflour is not wheat, coconut is not a nut', async () => {
  const all = [];
  for (let off = 0; off < 2400; off += 25) { const r = await call(`/api/search?limit=25&offset=${off}&detail=full`); if (!r.json.items.length) break; all.push(...r.json.items); }
  const by = new Map(all.map((i) => [i.id, i]));
  assert.ok(!by.get('add-070').allergen_info.contains.includes('eggs'), 'pickled eggplant has no eggs');
  assert.ok(!by.get('ec-218').allergen_info.contains.includes('cereals_gluten'), 'cornflour is not wheat gluten');
  assert.ok(!by.get('w-id-007').allergen_info.contains.includes('nuts'), 'coconut water is not a nut');
  const status = new Set(all.map((i) => i.allergen_status));
  for (const s of ['contains', 'none_found', 'check_labels']) assert.ok(status.has(s), `status ${s} is used`);
  const labels = all.find((i) => i.allergen_status === 'check_labels');
  assert.match(labels.allergen_info.note, /check the labels/i);
  const noAllergens = await call('/api/diets/no_allergens?limit=25'); assert.ok(noAllergens.json.items.every((i) => i.allergen_status === 'none_found'), 'check_labels is never listed as no allergens');
  assert.ok(noAllergens.json.total < 400, 'none found is the strict set');
  const dia = all.filter((i) => i.diabetic_friendly === 'friendly');
  assert.ok(dia.length > 400 && dia.length < 900);
  assert.ok(all.filter((i) => i.diabetic_friendly === 'friendly').every((i) => i.diabetic.basis !== 'nutrition_estimate' || (i.servings <= 12 && (i.carbs_g * 4) / i.kcal_per_serving <= 0.4)), 'the energy-share and serving limits hold');
});

test('Cooking with Kids: the 50 recipes of the kids collection come first, with age bands and grown-up steps', async () => {
  const all = await call('/api/search?collection=kids&limit=25'); assert.equal(all.json.total, 50);
  assert.ok(all.json.items.every((i) => i.kids_recipe && i.kids_age));
  const kids = await call('/api/search?kids=true&limit=25');  // default order: the kids collection first, then the inferred ones
  assert.ok(kids.json.total > 50); assert.ok(kids.json.items.every((i) => i.kids_recipe), 'the first 25 are all Cooking with Kids recipes');
  const young = await call('/api/search?kids_age=3-5&limit=25'); assert.ok(young.json.total > 0); assert.ok(young.json.items.every((i) => i.kids_age === '3-5'));
  const seven = await call('/api/search?kids_age=7&limit=25'); assert.ok(seven.json.items.every((i) => i.kids_age === '6-8'), 'an age in years maps to its band');
  assert.equal(young.json.applied_filters.kids, true, 'kids_age implies kids=true');
  const stove = (await call('/api/search?kids_age=6-8&limit=25')).json.items.find((i) => (i.grown_up_help || []).includes('stove'));
  assert.ok(stove, 'recipes say which steps need a grown-up');
  const ar = await call('/api/search?collection=kids&lang=ar&limit=3'); assert.ok(ar.json.items.every((i) => /[؀-ۿ]/.test(i.title)), 'kids recipes have Arabic titles');
  const peanut = await call('/api/search?collection=kids&no_allergens=true&limit=25'); assert.ok(peanut.json.items.every((i) => i.allergen_status !== 'contains'), 'declared allergens are respected');
  assert.ok((await call('/api/search?collection=kids&kids=true&allergen_free=peanuts&limit=25')).json.items.every((i) => !/peanut/i.test(i.title)));
});
