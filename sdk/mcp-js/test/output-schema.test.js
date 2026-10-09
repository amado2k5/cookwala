import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { buildFixture, ROOT } from './helpers.js';
import { createServer, OUTPUT_SCHEMAS } from '../src/server.js';
import { compare } from '../src/core/query.js';

async function connect(opts) {
  const { server, tools } = createServer(opts);
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: 'test', version: '0' });
  await client.connect(b);
  return { client, tools };
}

test('every tool declares an output schema, parameter descriptions, status text and noauth', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const tools = (await client.listTools()).tools;
  assert.equal(tools.length, Object.keys(OUTPUT_SCHEMAS).length);
  for (const t of tools) {
    assert.equal(t.outputSchema && t.outputSchema.type, 'object', `${t.name} outputSchema`);
    for (const [k, v] of Object.entries(t.inputSchema.properties || {})) assert.ok(v.description, `${t.name}.${k} has no description`);
    const json = JSON.stringify(t.outputSchema);
    assert.ok(!json.includes('$ref'), `${t.name} outputSchema uses $ref (scanners reject it)`);
    assert.notEqual(t.outputSchema.additionalProperties, false, `${t.name} outputSchema must allow extra properties`);
    const m = t._meta || {};
    for (const key of ['openai/toolInvocation/invoking', 'openai/toolInvocation/invoked']) assert.ok(m[key] && m[key].length <= 64, `${t.name} ${key}`);
    assert.deepEqual(m.securitySchemes, [{ type: 'noauth' }], t.name);
  }
});

test('real results validate against the output schemas (the client checks structuredContent)', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const ids = JSON.parse(fs.readFileSync(path.join(fx.dir, 'v1/index/en/0.json'), 'utf8')).items.map((e) => e.id);
  const [id, id2] = ids;
  const recipe = JSON.parse(fs.readFileSync(path.join(fx.dir, `v1/recipes/${id}.cookwala.json`), 'utf8'));
  const mandate = { scopes: ['start_cooking', 'order_groceries'], expires: '2027-01-01T00:00:00Z', spendCaps: { USD: '50' }, providers: ['grocer-a'], confirmBefore: ['order_groceries'] };
  const calls = [
    ['search_recipes', { query: '' }], ['get_recipe', { id }], ['get_recipe', { id, view: 'full' }], ['get_recipe', { id, include: 'ingredients,nutrition' }],
    ['list_collections', {}], ['list_operations', {}], ['list_device_presets', {}], ['dry_run', { recipe_id: id, device: 'robot-arm' }],
    ['check_envelope', { op: 'cw.op.simmer', readings: [{ t: 0, tempC: 20 }, { t: 60, tempC: 95 }] }], ['check_mandate', { mandate, action: 'start_cooking' }],
    ['parse_sms', { text: 'MENU 12' }], ['parse_sms', { text: 'nonsense' }], ['verify_recipe', { recipe }], ['catalog_status', {}],
    ['query_recipes', { limit: 2 }], ['similar_recipes', { id }], ['compare_recipes', { ids: [id, id2].join(',') }], ['ingredient_profile', { name: 'lentils' }],
    ['catalog_stats', { group_by: 'cuisine' }], ['plan_meals', {}], ['shopping_list', { ids: id }], ['catalog_listing', { kind: 'countries' }], ['catalog_listing', { kind: 'diets' }],
  ];
  for (const [name, args] of calls) {
    const r = await client.callTool({ name, arguments: args }); // throws if structuredContent breaks the schema
    assert.ok(r.structuredContent && typeof r.structuredContent === 'object', name);
  }
});

test('a missing recipe gives a plain message, not an internal URL', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const r = await client.callTool({ name: 'get_recipe', arguments: { id: 'no-such-recipe' } });
  assert.equal(r.isError, true);
  assert.equal(r.structuredContent.error, 'not_found');
  assert.match(r.structuredContent.detail, /search_recipes/);
  assert.doesNotMatch(r.structuredContent.detail, /https?:|returned 404|\.json/);
});

test('compare_recipes needs 2 to 6 different ids and says so instead of truncating', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const ids = JSON.parse(fs.readFileSync(path.join(fx.dir, 'v1/index/en/0.json'), 'utf8')).items.map((e) => e.id);
  const call = (v) => client.callTool({ name: 'compare_recipes', arguments: { ids: v } });
  assert.equal((await call([ids[0], ids[1]])).isError, undefined);
  const repeated = await call([ids[0], ids[1], ids[0], ids[1], ids[0], ids[1], ids[0]]);
  assert.equal(repeated.structuredContent.items.length, 2);
  const unexpected = await client.callTool({ name: 'compare_recipes', arguments: { ids: [ids[0], ids[1]], unexpected: true } });
  assert.equal(unexpected.isError, true);
  assert.match(unexpected.content[0].text, /unexpected/);
  assert.equal((await call(`${ids[0]},${ids[1]}`)).isError, undefined);
  assert.equal((await call([ids[0]])).isError, true);
  assert.equal((await call([ids[0], ids[0]])).isError, true); // duplicates count once
  assert.equal((await call([...ids, 'a', 'b', 'c', 'd'])).isError, true);
});

test('comparison schemas require typed success fields and document normalized bounds', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const tool = (await client.listTools()).tools.find((t) => t.name === 'compare_recipes');
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.match(tool.inputSchema.properties.ids.description, /comma-separated.*duplicates.*normalization/);
  assert.equal(tool.inputSchema.properties.ids.anyOf.find((s) => s.type === 'array').minItems, 2);
  assert.deepEqual(tool.outputSchema.required.sort(), ['best', 'items', 'missing']);
  assert.equal(OUTPUT_SCHEMAS.compare_recipes.safeParse({ error: 'bad', detail: 'bad' }).success, false);
  assert.equal(OUTPUT_SCHEMAS.compare_recipes.safeParse({ missing: [42], items: [], best: {} }).success, false);
  assert.equal(OUTPUT_SCHEMAS.compare_recipes.safeParse({ missing: [], items: [], best: { time_min: { lowest: 1, highest: 'b' } } }).success, false);
});

test('comparison ranks available cost and time values and lists servings without ranking them', () => {
  const items = [{ id: 'a', t: 'A', cu: [], co: [], cps: 2, mn: 30, sv: 4 }, { id: 'b', t: 'B', cu: [], co: [], cps: 5, mn: 10, sv: 2 }];
  const result = compare(items, ['a', 'b']);
  assert.deepEqual(result.best.cost_per_serving, { lowest: 'a', highest: 'b' });
  assert.deepEqual(result.best.time_min, { lowest: 'b', highest: 'a' });
  assert.deepEqual(result.items.map((r) => r.servings), [4, 2]);
  assert.equal(result.best.servings, undefined);
  assert.equal(OUTPUT_SCHEMAS.compare_recipes.safeParse(result).success, true);
});

test('only the fifi bridge tools are open-world', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const open = (await client.listTools()).tools.filter((t) => t.annotations.openWorldHint).map((t) => t.name).sort();
  assert.deepEqual(open, ['fifi_search', 'fifi_source']);
});
