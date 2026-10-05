import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SimulatedExecutor, CookwalaProblem } from '../src/index.js';
import { requestFor } from './helpers.js';

const status = (fn) => {
  try { fn(); } catch (e) { assert.ok(e instanceof CookwalaProblem, String(e)); return e.status; }
  assert.fail('expected a problem');
};

test('lifecycle: idempotent replay, 409, 412, 428, stop', () => {
  const ex = SimulatedExecutor.fromBundle('demo-hob-robot');
  const req = requestFor('lentil-soup');
  const st = ex.startExecution(req, 'key-0000001', true);
  assert.equal(st.state, 'accepted');
  assert.equal(ex.startExecution(req, 'key-0000001', true).id, st.id); // replay
  assert.equal(status(() => ex.startExecution(req, 'key-0000002', true)), 409);
  assert.equal(status(() => ex.resumeExecution(st.id, 99)), 412);
  assert.equal(status(() => ex.resumeExecution(st.id, null)), 428);
  assert.equal(status(() => ex.executionLog(st.id)), 404); // no log until final
  ex.tick(); ex.tick();
  assert.equal(ex.getExecution(st.id).state, 'running');
  ex.stopExecution(st.id);
  ex.tick();
  assert.equal(ex.getExecution(st.id).state, 'stopped');
  assert.equal(ex.executionLog(st.id).outcome, 'aborted_safe');
});

test('stop always works and is idempotent once final', () => {
  const ex = SimulatedExecutor.fromBundle('demo-hob-robot');
  const st = ex.startExecution(requestFor('lentil-soup'), 'key-0000004', true);
  assert.equal(ex.stopExecution(st.id).state, 'stopped'); // straight from accepted: accepted -> stopped
  assert.equal(ex.stopExecution(st.id, 'again').state, 'stopped'); // a final state: stop is still answered
  assert.equal(ex.executionLog(st.id).outcome, 'aborted_safe');
  const st2 = ex.startExecution(requestFor('lentil-soup', { id: 'ex-2', key: 'key-0000005' }), 'key-0000005', true);
  ex.tick(); ex.tick(); ex.tick(); // preparing, running, a step or two
  assert.equal(ex.stopExecution(st2.id).state, 'stopping');
  assert.equal(ex.stopExecution(st2.id).state, 'stopping'); // twice is fine
  ex.tick();
  assert.equal(ex.getExecution(st2.id).state, 'stopped');
});

test('refuses before heat', () => {
  const ex = SimulatedExecutor.fromBundle('demo-oven');
  assert.equal(ex.startExecution(requestFor('lentil-soup'), 'key-0000003', false).refusal.reason, 'missing_capability');
});

test('prechecks: idempotency key, hash, allergens, mandate, busy', () => {
  const ex = SimulatedExecutor.fromBundle('demo-hob-robot', { busy: 1 });
  assert.equal(status(() => ex.startExecution(requestFor('lentil-soup'), 'short', true)), 400);
  assert.equal(ex.startExecution(requestFor('lentil-soup', { id: 'a', recipeHash: 'sha256:00' }), 'key-a-00001', true).refusal.reason, 'recipe_hash_mismatch');
  assert.equal(ex.startExecution(requestFor('shakshuka', { id: 'b', allergenBlocks: ['eggs'] }), 'key-b-00001', true).refusal.reason, 'allergen_block');
  assert.equal(ex.startExecution(requestFor('lentil-soup', { id: 'c', mandate: { scopes: [] } }), 'key-c-00001', true).refusal.reason, 'mandate_scope');
  assert.equal(ex.startExecution(requestFor('lentil-soup', { id: 'd' }), 'key-d-00001', true).refusal.reason, 'busy');
  assert.equal(ex.startExecution(requestFor('lentil-soup', { id: 'e' }), 'key-e-00001', true).state, 'accepted');
});

test('faults: sensor_fault fails, overheat stops with a safety event, timeout asks a person', () => {
  const ex = SimulatedExecutor.fromBundle('demo-hob-robot', { faults: { 'example-shakshuka#n7': 'sensor_fault', 'example-koshari#n14': 'overheat', 'example-lentil-soup#n7': 'timeout' } });
  const a = ex.startExecution(requestFor('shakshuka'), 'key-sh-0001', true);
  const k = ex.startExecution(requestFor('koshari'), 'key-ko-0001', true);
  const l = ex.startExecution(requestFor('lentil-soup'), 'key-le-0001', true);
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    ex.tick();
    for (const id of [a.id, k.id, l.id]) {
      const s = ex.getExecution(id);
      if (s.state === 'needs_human') { seen.add(`${id}:${s.humanNeeded.why}`); ex.resumeExecution(id, s.seq); }
    }
  }
  assert.equal(ex.getExecution(a.id).state, 'failed');
  assert.equal(ex.executionLog(a.id).outcome, 'failed');
  assert.equal(ex.getExecution(k.id).state, 'stopped');
  assert.deepEqual(ex.executionLog(k.id).safetyEvents.map((e) => e.limit), ['oil.max_temp']);
  assert.equal(ex.getExecution(l.id).state, 'completed');
  assert.ok([...seen].some((x) => x.includes('reached its maxTime')));
});

test('report_incident validates', () => {
  const ex = SimulatedExecutor.fromBundle('demo-hob-robot');
  assert.equal(status(() => ex.reportIncident({ core: '0.2.0' })), 400);
  assert.deepEqual(ex.reportIncident({ core: '0.2.0', kind: 'IncidentReport', id: 'i', date: '2026-10-05', category: 'c', severity: 'low', description: 'd' }), { received: true });
});
