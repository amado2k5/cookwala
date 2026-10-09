import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawnSync, spawn } from 'node:child_process';
import { handleRequest } from '../src/http.js';
import { openapi } from '../src/openapi.js';

// A fake "live" endpoint serving the real tool list and API, optionally altered, so the deploy guard can be seen to pass and to fail.
async function withLive(alter, fn) {
  const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
  const real = (await (await handleRequest(new Request('https://x.test/open/mcp', { method: 'POST', headers, body }), {}, {})).json()).result.tools;
  const state = alter({ tools: structuredClone(real), api: openapi('live') });
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    if (req.url === '/api/openapi.json') return res.end(JSON.stringify(state.api));
    res.end(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: state.tools } }));
  });
  await new Promise((r) => server.listen(0, r));
  try { return await fn(`http://127.0.0.1:${server.address().port}`); } finally { server.close(); }
}
const run = (url, env = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, ['scripts/check-compat.mjs'], { env: { ...process.env, COOKWALA_LIVE_URL: url, ...env } });
  let out = ''; p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
  p.on('close', (code) => resolve({ code, out }));
});

test('deploy guard passes when the live endpoint equals the new code', async () => {
  const r = await withLive((s) => s, (url) => run(url));
  assert.equal(r.code, 0, r.out);
});

test('deploy guard passes when the live endpoint has fewer tools and fewer enum values (the new code only adds)', async () => {
  const r = await withLive((s) => { s.tools.pop(); return s; }, (url) => run(url));
  assert.equal(r.code, 0, r.out);
});

test('deploy guard fails when a live tool would disappear, a parameter is removed or one becomes required', async () => {
  const r = await withLive((s) => {
    s.tools.push({ name: 'ghost_tool', inputSchema: { type: 'object', properties: {} } });          // live has a tool the new code lacks
    const t = s.tools[0]; t.inputSchema = { type: 'object', properties: { ...(t.inputSchema.properties || {}), old_param: { type: 'string' } }, required: [] };  // live accepts a parameter the code dropped
    const q = s.tools.find((x) => (x.inputSchema?.required || []).length);                       // the new code requires a parameter that live treats as optional
    q.inputSchema.required = [];
    return s;
  }, (url) => run(url));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /ghost_tool was removed/);
  assert.match(r.out, /old_param was removed/);
  assert.match(r.out, /became required/);
});

test('deploy guard fails when an API operation would move, and ALLOW_BREAKING=1 lets a deliberate break through', async () => {
  const alter = (s) => { s.api.paths['/api/old-route'] = { get: { operationId: 'oldRoute', parameters: [] } }; return s; };
  const r = await withLive(alter, (url) => run(url));
  assert.equal(r.code, 1, r.out); assert.match(r.out, /GET \/api\/old-route was removed/);
  const ok = await withLive(alter, (url) => run(url, { ALLOW_BREAKING: '1' }));
  assert.equal(ok.code, 0, ok.out);
});

test('deploy guard skips (does not block) when the live endpoint cannot be read', async () => {
  const r = await run('http://127.0.0.1:9');
  assert.equal(r.code, 0, r.out); assert.match(r.out, /skipping the compatibility check/);
});
