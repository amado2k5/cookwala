import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demo, Orchestrator, LocalClient, Reporter } from '../src/index.js';
import { B } from './helpers.js';

const rep = await demo();
const by = Object.fromEntries(rep.records.map((r) => [r.job, r]));

test('demo outcomes are the ones in SPEC.md', () => {
  const table = {
    'lentil-soup': ['completed', 'demo-hob-robot-basic', ['try_next_device', 'resume'], 'served'],
    shakshuka: ['refused', null, [], 'not_cooked'],
    salata: ['completed', 'demo-hob-robot', ['ask_presence'], 'served'],
    koshari: ['stopped', 'demo-hob-robot', ['discard_and_report'], 'discard'],
    'shakshuka-2': ['failed', 'demo-hob-robot', ['discard_and_report'], 'discard'],
    'lentil-note': ['completed', 'demo-hob-robot', ['resume'], 'served'],
  };
  assert.deepEqual(Object.keys(by), Object.keys(table));
  for (const [job, [outcome, device, recovery, food]] of Object.entries(table)) {
    const r = by[job];
    assert.equal(r.outcome, outcome, job);
    assert.equal(r.device, device, job);
    assert.deepEqual(r.recovery.map((a) => a.action), recovery, job);
    assert.equal(r.disposition, food, job);
  }
  assert.equal(by.shakshuka.refusal.reason, 'allergen_block');
  assert.equal(by.shakshuka.refusal.gate, 'planner');
  assert.equal(by['lentil-soup'].recovery[0].reason, 'busy');
  assert.deepEqual(by.koshari.incident.safetyLimitsFired, ['oil.max_temp']);
  assert.equal(by['shakshuka-2'].incident.category, 'cw.incident.sensor_failure');
  assert.equal(by['lentil-note'].findings.length, 1);
  assert.equal(rep.summary().untrustedTextFindings, 1);
  assert.equal(rep.records.reduce((n, r) => n + r.anomalies.length, 0), 0);
  for (const r of rep.records) if (r.incident) assert.ok(!JSON.stringify(r.incident).includes(r.job));
});

test('ranking prefers accepted plans and fewer people', async () => {
  const devices = Object.fromEntries(Object.keys(B.devices).map((d) => [d, LocalClient.forDevice(d)]));
  const ranked = await new Orchestrator(devices).rank(B.recipes.koshari, true);
  assert.equal(ranked[0][1].state, 'accepted');
  assert.equal(ranked.at(-1)[1].state, 'refused');
});

test('renderings: JSON, JUnit, CSV, Markdown', () => {
  const j = JSON.parse(rep.toJson());
  assert.deepEqual(Object.keys(j), ['report', 'summary', 'runs']);
  assert.deepEqual(Object.keys(j.summary), ['runs', 'outcomes', 'refusals', 'recoveryActions', 'humanInterventions', 'incidents',
    'untrustedTextFindings', 'anomalies', 'served', 'discarded']);
  assert.equal(j.summary.runs, 6);
  assert.deepEqual(j.summary.outcomes, { completed: 3, refused: 1, stopped: 1, failed: 1 });
  assert.equal(j.summary.served, 3);
  assert.equal(j.summary.discarded, 2);
  assert.equal(j.runs[0].requestedBy, 'agent:planner-demo');
  const x = rep.toJunit();
  assert.match(x, /<testsuite name="Cookwala samples demo \(offline, simulated kitchen\)" tests="6" failures="1" skipped="1">/);
  assert.equal((x.match(/<testcase /g) || []).length, 6);
  const csv = rep.toCsv();
  assert.equal(csv.trim().split(/\r?\n/).length, 7);
  assert.ok(csv.includes('\r\n'));
  assert.ok(rep.toMarkdown().includes('| koshari |'));
  assert.ok(rep.toMarkdown().includes("allergen_block: example-shakshuka contains blocked allergen(s) ['eggs']"));
  assert.equal(new Reporter().summary().runs, 0);
  assert.throws(() => rep.render('pdf'));
});
