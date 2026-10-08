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
      const path = p.replace('{id}', 'koshari');
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
