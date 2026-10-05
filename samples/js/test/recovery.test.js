import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RecoveryPolicy, Orchestrator, LocalClient, ScriptedHuman, Job } from '../src/index.js';
import { B, requestFor } from './helpers.js';

test('policy', () => {
  const p = new RecoveryPolicy();
  for (const reason of ['allergen_block', 'recipe_recalled', 'safety_limit', 'mandate_scope', 'envelope_out_of_range']) {
    assert.equal(p.onRefusal({ reason }, true, true).kind, 'give_up');
  }
  assert.equal(p.onRefusal({ reason: 'busy' }, false, true).kind, 'try_next_device');
  assert.equal(p.onRefusal({ reason: 'busy' }, false, false).kind, 'give_up');
  assert.equal(p.onRefusal({ reason: 'needs_human_present' }, false, true).kind, 'ask_presence');
  assert.equal(p.onTransportError(1).kind, 'retry');
  assert.equal(p.onTransportError(1).asDict().waitS, 1);
  assert.equal(p.onTransportError(9).kind, 'give_up');
});

test('end of run: failed or limit fired -> discard and report; stopped after heat -> discard only', () => {
  const p = new RecoveryPolicy();
  assert.equal(p.onEnd({ state: 'failed' }, { 'x-heatStarted': true }).asDict().discard, true);
  assert.equal(p.onEnd({ state: 'stopped' }, { safetyEvents: [{ limit: 'oil.max_temp' }] }).kind, 'discard_and_report');
  assert.deepEqual(p.onEnd({ state: 'stopped' }, { 'x-heatStarted': true, safetyEvents: [] }).extra, { discard: true, report: false });
  assert.equal(p.onEnd({ state: 'completed' }, {}), null);
});

test('nobody answers means stop', async () => {
  const orch = new Orchestrator({ hob: LocalClient.forDevice('demo-hob-robot', { faults: { 'example-lentil-soup#n5': 'timeout' } }) },
    { human: new ScriptedHuman({ attend: false }) });
  const r = await orch.run(new Job('j', { request: requestFor('lentil-soup'), recipe: B.recipes['lentil-soup'], humanPresent: true }));
  assert.equal(r.outcome, 'stopped');
  assert.equal(r.disposition, 'discard');
  assert.ok(r.recovery.map((a) => a.action).includes('stop'));
});

test('a plain job object works too', async () => {
  const orch = new Orchestrator({ hob: LocalClient.forDevice('demo-hob-robot') }, { human: new ScriptedHuman() });
  const r = await orch.run({ id: 'plain', request: requestFor('lentil-soup'), recipe: B.recipes['lentil-soup'], humanPresent: true });
  assert.equal(r.outcome, 'completed');
});

test('transport errors are retried with the same request, then give up', async () => {
  let calls = 0;
  const client = LocalClient.forDevice('demo-hob-robot');
  const flaky = Object.create(client);
  flaky.startExecution = async (...a) => {
    calls += 1;
    if (calls < 3) { const { CookwalaProblem } = await import('../src/errors.js'); throw new CookwalaProblem(0, { title: 'unreachable' }); }
    return client.startExecution(...a);
  };
  const waits = [];
  const orch = new Orchestrator({ hob: flaky }, { human: new ScriptedHuman(), sleep: async (s) => { waits.push(s); } });
  const r = await orch.run(new Job('t', { request: requestFor('lentil-soup'), recipe: B.recipes['lentil-soup'], humanPresent: true }));
  assert.equal(r.outcome, 'completed');
  assert.deepEqual(waits, [0.5, 1]);
  assert.equal(r.recovery.filter((a) => a.action === 'retry').length, 2);
});
