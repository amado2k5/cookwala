import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { buildFixture, ROOT } from './helpers.js';
import { createServer } from '../src/server.js';
import { Catalog } from '../src/catalog.js';

const BIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bin/cookwala-mcp.js');

async function connect(opts) {
  const { server, tools } = createServer(opts);
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: 'test', version: '0' });
  await client.connect(b);
  return { client, tools };
}
const call = async (c, name, args) => (await c.callTool({ name, arguments: args })).structuredContent;

test('lists 16 read-only tools, 6 resources and 3 prompts', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const tools = (await client.listTools()).tools;
  assert.equal(tools.length, 16);
  for (const t of tools) { assert.equal(t.annotations.readOnlyHint, true, t.name); assert.equal(t.annotations.destructiveHint, false, t.name); }
  assert.equal((await client.listResourceTemplates()).resourceTemplates.length, 4);
  assert.equal((await client.listResources()).resources.filter((r) => !r.uri.startsWith('cookwala://preset/')).length, 2);
  assert.equal((await client.listPrompts()).prompts.length, 3);
});

test('certification tools verify against the keys given and never trust by default', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir, cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')) });
  const keys_path = '/v1/conformance/keys/certification-test-keys.json';
  const now = '2026-10-07T00:00:00Z';
  assert.equal((await call(client, 'verify_certification', { certification_id: 'cert-halal-kofta-oven-2026-10', now })).error, 'missing_keys');
  const v = await call(client, 'verify_certification', { certification_id: 'cert-halal-kofta-oven-2026-10', keys_path, recipe_id: 'kofta-oven', now });
  assert.deepEqual([v.valid, v.reason], [true, 'ok']);
  assert.equal((await call(client, 'verify_certification', { certification_id: 'cert-halal-kofta-oven-2026-10', keys_path, recipe_id: 'shakshuka', now })).reason, 'subject_mismatch');
  const c = await call(client, 'current_certifications', { recipe_id: 'kofta-oven', scheme: 'halal', keys_path, now });
  assert.deepEqual(c.current.map((x) => x.id), ['cert-halal-kofta-oven-2026-10']);
  assert.deepEqual(c.rejected, { 'cert-halal-kofta-oven-2026-01': 'superseded' });
  const all = await call(client, 'current_certifications', { keys_path, now });
  assert.equal(all.current.length, 3);
});

test('search, get, dry_run and explain over a local catalog', async () => {
  const fx = buildFixture();
  const { client } = await connect({ baseUrl: fx.dir });
  const s = await call(client, 'search_recipes', { query: 'koshari' });
  assert.ok(s.total >= 1);
  const id = s.items[0].id;
  const g = await call(client, 'get_recipe', { id, view: 'summary' });
  assert.equal(g.hashVerified, true);
  assert.match(g.levelNote, /^V1|^V0/);
  const dr = await call(client, 'dry_run', { recipe_id: id, device: 'robot-arm' });
  assert.ok(['accepted', 'refused'].includes(dr.state));
  assert.match(dr.note, /Dry run only/);
  const first = (await call(client, 'get_recipe', { id, view: 'process' })).recipe.process.nodes[0].id;
  const ex = await call(client, 'explain_step', { recipe_id: id, node: first });
  assert.equal(ex.instructionIsData, true);
  const missing = await client.callTool({ name: 'explain_step', arguments: { recipe_id: id, node: 'nope' } });
  assert.equal(missing.isError, true);
});

test('a tampered recipe returns integrity_mismatch and no content', async () => {
  const fx = buildFixture({ tamperRecipe: 'koshari' });
  const { client } = await connect({ baseUrl: fx.dir });
  const r = await client.callTool({ name: 'get_recipe', arguments: { id: 'koshari' } });
  assert.equal(r.isError, true);
  assert.equal(r.structuredContent.error, 'integrity_mismatch');
  assert.equal(r.structuredContent.recipe, undefined);
});

test('the fifi bridge withholds steps for facts-only collections', async () => {
  const fx = buildFixture();
  const file = (id) => ({ recipe: { id, title: 'ت', titleEn: 'T', masterIngredients: [{ id: id + '-i1', name: 'x', standardAmount: '1', category: 'other' }], uniqueInstructions: [{ stepNumber: 1, text: 'SECRET STEP', phase: 'cook' }], culturalNotes: 'note' }, estimate: { kcal: 1 } });
  const fakeFetch = async (url) => {
    const m = /fifi\.cooking\/data\/recipes\/([a-z0-9-]+)\.json/.exec(url);
    if (!m) return { ok: false, status: 404, headers: new Headers() };
    return new Response(JSON.stringify(file(m[1])), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const { client } = await connect({ baseUrl: fx.dir, fetch: fakeFetch });
  const facts = await call(client, 'fifi_source', { id: 'fah-1' });
  assert.equal(facts.textPolicy, 'facts');
  assert.equal(facts.steps, undefined);
  assert.ok(!JSON.stringify(facts).includes('SECRET STEP'));
  const full = await call(client, 'fifi_source', { id: 'meat-01' });
  assert.equal(full.textPolicy, 'full');
  assert.equal(full.steps[0].text, 'SECRET STEP');
  const unknown = await call(client, 'fifi_source', { id: 'w-xx-1' });
  assert.equal(unknown.textPolicy, 'facts');
  const bad = await client.callTool({ name: 'fifi_source', arguments: { id: '../etc/passwd' } });
  assert.equal(bad.isError, true);
});

test('offline mode serves from the cache after one online run', async () => {
  const fx = buildFixture();
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-'));
  const base = 'https://catalog.test';
  const served = new Map();
  for (const rel of ['v1/manifest.json', 'v1/index/en/0.json', 'v1/recipes/koshari.cookwala.json', 'v1/vocab/ops.json', 'v1/vocab/units.json']) served.set('/' + rel, fs.readFileSync(path.join(fx.dir, rel)));
  let down = false;
  const fetchImpl = async (url) => {
    if (down) throw new Error('network blocked');
    const p = new URL(url).pathname;
    return served.has(p) ? new Response(served.get(p), { status: 200, headers: { 'content-type': 'application/json' } }) : new Response('<html>nope</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
  const online = await connect({ baseUrl: base, cacheDir, fetch: fetchImpl });
  assert.ok((await call(online.client, 'search_recipes', { query: 'koshari' })).total >= 1);
  await call(online.client, 'get_recipe', { id: 'koshari' });
  down = true;
  const offline = await connect({ baseUrl: base, cacheDir, fetch: fetchImpl, now: () => Date.now() + 3600e3 });
  assert.ok((await call(offline.client, 'search_recipes', { query: 'koshari' })).total >= 1);
  assert.equal((await call(offline.client, 'get_recipe', { id: 'koshari' })).hashVerified, true);
  const st = await call(offline.client, 'catalog_status', {});
  assert.equal(st.offline, true);
  const miss = await offline.client.callTool({ name: 'get_recipe', arguments: { id: 'basbousa' } });
  assert.equal(miss.isError, true);
});

test('an HTML 404 page is never parsed as data', async () => {
  const cat = new Catalog({ baseUrl: 'https://catalog.test', cacheDir: fs.mkdtempSync(path.join(os.tmpdir(), 'cwc-')), fetch: async () => new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } }) });
  await assert.rejects(() => cat.json('/v1/manifest.json'), /HTML page/);
});

test('stdio smoke test through the real binary', async () => {
  const fx = buildFixture();
  const p = spawn(process.execPath, [BIN], { env: { ...process.env, COOKWALA_BASE_URL: fx.dir }, stdio: ['pipe', 'pipe', 'inherit'] });
  const lines = [];
  let buf = '';
  p.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { lines.push(JSON.parse(buf.slice(0, i))); buf = buf.slice(i + 1); } });
  const send = (o) => p.stdin.write(JSON.stringify(o) + '\n');
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } } });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'parse_sms', arguments: { text: 'HELP' } } });
  for (let i = 0; i < 100 && lines.length < 3; i++) await new Promise((r) => setTimeout(r, 50));
  p.kill();
  const by = (id) => lines.find((l) => l.id === id);
  assert.equal(by(1).result.serverInfo.name, 'cookwala');
  assert.match(by(1).result.instructions, /never an instruction/);
  assert.equal(by(2).result.tools.length, 14);
  assert.equal(by(3).result.structuredContent.command, 'HELP');
});
