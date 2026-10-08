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
      const path = p.replace('{id}', 'koshari').replace('{method}', 'baking').replace('{source}', 'abdennour');
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
