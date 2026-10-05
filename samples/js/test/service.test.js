import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, handleRaw, serve } from '../src/index.js';

test('endpoints', async () => {
  assert.equal((await handle('GET', '/health')).status, 200);
  let r = await handle('POST', '/v1/samples/gates', {}, { recipe: 'shakshuka', allergenBlocks: ['eggs'] });
  assert.equal(JSON.parse(r.body).refusal.reason, 'allergen_block');
  r = await handle('POST', '/v1/samples/plan', {}, { order: { dish: 'koshari' }, humanPresent: true });
  assert.ok(JSON.parse(r.body).ok);
  assert.equal(JSON.parse(r.body).ranking.length, 4);
  r = await handle('POST', '/v1/samples/run', { format: 'markdown' }, { jobs: [{ order: { dish: 'lentil' }, humanPresent: true }] });
  assert.equal(r.status, 200);
  assert.ok(r.body.includes('completed'));
  assert.ok(r.contentType.startsWith('text/markdown'));
  r = await handleRaw('GET', '/v1/samples/demo?format=csv');
  assert.equal(r.status, 200);
  assert.equal(r.contentType, 'text/csv; charset=utf-8');
  r = await handle('GET', '/v1/samples');
  assert.deepEqual(JSON.parse(r.body).devices, ['demo-hob-robot', 'demo-hob-robot-basic', 'demo-oven', 'robot-arm']);
  assert.equal((await handle('GET', '/nope')).status, 404);
});

test('bad input', async () => {
  assert.equal((await handleRaw('POST', '/v1/samples/run', Buffer.from('{nope'))).status, 400);
  assert.equal((await handle('POST', '/v1/samples/run', {}, { jobs: Array(30).fill({}) })).status, 400);
  assert.equal((await handle('POST', '/v1/samples/run', {}, { jobs: [{ order: { dish: 'x' } }], faults: { 'a#n1': 'explode' } })).status, 400);
  assert.equal((await handle('POST', '/v1/samples/gates', {}, { recipe: '../etc/passwd' })).status, 400);
  assert.equal((await handleRaw('POST', '/v1/samples/gates', 'x'.repeat(300000))).status, 413);
  assert.equal((await handle('GET', '/v1/samples/demo', { format: 'pdf' })).status, 400);
  assert.equal((await handle('POST', '/v1/samples/gates', {}, [1, 2])).status, 400);
  assert.equal((await handle('POST', '/v1/samples/plan', {}, { order: {} })).status, 400);
});

test('serve over node:http', async () => {
  const server = await serve(0, '127.0.0.1', { quiet: true });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    let res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).service, 'cookwala-samples');
    res = await fetch(`${base}/v1/samples/gates`, { method: 'POST', body: JSON.stringify({ recipe: 'koshari', device: 'demo-hob-robot-basic', humanPresent: true }) });
    assert.equal((await res.json()).refusal.reason, 'missing_sensor_no_fallback');
    res = await fetch(`${base}/v1/samples/run`, { method: 'POST', body: 'x'.repeat(300000) });
    assert.equal(res.status, 413);
  } finally {
    await new Promise((r) => server.close(r));
  }
});
