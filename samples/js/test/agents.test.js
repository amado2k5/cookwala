import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlannerAgent, MonitorAgent, ScriptedHuman, BundleCatalog, makeMandate } from '../src/index.js';

const planner = (human = null, kw = {}) => new PlannerAgent('agent:p', makeMandate('household:h/person:p', 'agent:p', kw), new BundleCatalog(), human);

test('never substitutes around a block', async () => {
  const p = await planner(new ScriptedHuman()).propose({ dish: 'shakshuka', allergenBlocks: ['eggs'] });
  assert.equal(p.ok, false);
  assert.equal(p.reason, 'allergen_block');
  assert.equal(p.detail, "example-shakshuka contains blocked allergen(s) ['eggs']");
});

test('an alternative needs a person to confirm', async () => {
  const yes = await planner(new ScriptedHuman({ confirm: true })).propose({ dish: 'shakshuka', allergenBlocks: ['eggs'], alternatives: true });
  assert.ok(yes.ok);
  assert.notEqual(yes.recipe.id, 'example-shakshuka');
  assert.deepEqual(yes.request.allergenBlocks, ['eggs']);
  const no = await planner(new ScriptedHuman({ confirm: false })).propose({ dish: 'shakshuka', allergenBlocks: ['eggs'], alternatives: true });
  assert.equal(no.ok, false);
  assert.equal(no.reason, 'not_authorized');
});

test('irreversible is always confirmed', async () => {
  const p = await planner(null, { confirmBefore: [] }).propose({ dish: 'lentil', triggers: ['irreversible'] });
  assert.equal(p.ok, false);
});

test('the mandate limits the agent', async () => {
  assert.equal((await planner(null, { scopes: ['plan_meals'] }).propose({ dish: 'lentil' })).reason, 'mandate_scope');
  assert.equal((await planner(null, { expires: '2026-01-01T00:00:00Z' }).propose({ dish: 'lentil' })).reason, 'mandate_scope');
});

test('a good order becomes a request under the mandate', async () => {
  const p = await planner().propose({ dish: 'lentil', servings: 6 });
  assert.ok(p.ok);
  assert.match(p.request.id, /^p-0001-[0-9a-f]{6}$/);
  assert.equal(p.request.requestedBy, 'agent:p');
  assert.equal(p.request.servings, 6);
  assert.equal((await planner().propose({ dish: 'pizza' })).reason, 'missing_capability');
});

test('monitor: skipped states are fine, illegal transitions and seq regressions are not', () => {
  const m = new MonitorAgent();
  m.observe({ id: 'e', seq: 0, state: 'accepted' });
  m.observe({ id: 'e', seq: 3, state: 'running' });
  assert.deepEqual(m.anomalies, []);
  m.observe({ id: 'e', seq: 4, state: 'accepted' });
  assert.equal(m.anomalies[0].kind, 'illegal_transition');
  m.observe({ id: 'e', seq: 1, state: 'running' });
  assert.equal(m.anomalies.at(-1).kind, 'seq_regressed');
  m.observe({ id: 'f', seq: 0, state: 'running', step: { op: 'cw.op.simmer' }, 'x-hub-mediumTempC': 500 });
  assert.equal(m.anomalies.at(-1).kind, 'above_envelope');
});

test('scripted human records what it was asked', () => {
  const h = new ScriptedHuman({ present: false });
  assert.equal(h.attend('e', 'why'), false);
  assert.equal(h.confirm('x', 'd'), true);
  assert.equal(h.log.length, 2);
});
