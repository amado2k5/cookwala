import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFixture } from './helpers.js';
import { handleRequest } from '../src/http.js';
import { Catalog } from '../src/catalog.js';

const fx = buildFixture();
const catalog = () => new Catalog({ baseUrl: fx.dir, diskCache: false });
const rpc = (method, params, headers = {}, id = 1) => new Request('https://mcp.test/mcp', {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...headers },
  body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
});
const INIT = { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } };

test('health and root need no token and say read-only', async () => {
  const env = { MCP_GATEWAY_TOKEN: 's3cret' };
  const h = await handleRequest(new Request('https://mcp.test/health'), env, { catalog: catalog() });
  assert.equal(h.status, 200);
  assert.equal((await h.json()).readOnly, true);
  assert.equal((await handleRequest(new Request('https://mcp.test/nope'), env)).status, 404);
});

test('/mcp initializes and lists the 16 read-only tools over JSON', async () => {
  const init = await handleRequest(rpc('initialize', INIT), {}, { catalog: catalog() });
  assert.equal(init.status, 200);
  assert.equal((await init.json()).result.serverInfo.name, 'cookwala');
  const list = await handleRequest(rpc('tools/list', {}, {}, 2), {}, { catalog: catalog() });
  const tools = (await list.json()).result.tools;
  assert.equal(tools.length, 16);
  for (const t of tools) assert.equal(t.annotations.readOnlyHint, true, t.name);
});

test('a tool call works through the endpoint', async () => {
  const res = await handleRequest(rpc('tools/call', { name: 'search_recipes', arguments: { query: '' } }, {}, 3), {}, { catalog: catalog() });
  const body = await res.json();
  assert.ok(!body.result.isError);
  assert.ok(body.result.structuredContent.total > 0);
});

test('the gateway token is enforced when set, via either header, and never when unset', async () => {
  const env = { MCP_GATEWAY_TOKEN: 's3cret' };
  const opts = { catalog: catalog() };
  assert.equal((await handleRequest(rpc('tools/list', {}), env, opts)).status, 401);
  assert.equal((await handleRequest(rpc('tools/list', {}, { 'x-mcprush-token': 'wrong' }), env, opts)).status, 401);
  assert.equal((await handleRequest(rpc('tools/list', {}, { 'x-mcprush-token': 's3cret' }), env, opts)).status, 200);
  assert.equal((await handleRequest(rpc('tools/list', {}, { authorization: 'Bearer s3cret' }), env, opts)).status, 200);
  assert.equal((await handleRequest(rpc('tools/list', {}), {}, opts)).status, 200);
});

test('only POST is accepted on /mcp', async () => {
  const res = await handleRequest(new Request('https://mcp.test/mcp'), {}, { catalog: catalog() });
  assert.equal(res.status, 405);
});

test('/open/mcp needs no token and /mcp still does', async () => {
  const env = { MCP_GATEWAY_TOKEN: 's3cret' };
  const opts = { catalog: catalog() };
  const mk = (path) => new Request('https://mcp.test' + path, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }) });
  assert.equal((await handleRequest(mk('/mcp'), env, opts)).status, 401);
  const res = await handleRequest(mk('/open/mcp'), env, opts);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).result.tools.length, 16);
});
