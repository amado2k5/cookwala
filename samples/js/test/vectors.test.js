import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonical, docHash, dryRun } from '../src/index.js';
import { B } from './helpers.js';

test('canonical JSON matches every RFC 8785 vector', () => {
  for (const v of B.expected.canonical) assert.equal(canonical(v.value), v.text);
});

test('canonical JSON details: -0, escapes, UTF-16 key order, no NaN', () => {
  assert.equal(canonical(-0), '0');
  assert.equal(canonical({ b: [-0, 1e21, 1e-7] }), '{"b":[0,1e+21,1e-7]}');
  assert.equal(canonical('\u0001\b\f\n\r\t"\\\u007f'), '"\\u0001\\b\\f\\n\\r\\t\\"\\\\\u007f"');
  assert.equal(canonical({ '\u{1F600}': 1, 'ﬁ': 2 }), '{"\u{1F600}":1,"ﬁ":2}'); // surrogates sort before U+FB01
  assert.throws(() => canonical(NaN));
  assert.throws(() => canonical(Infinity));
});

test('document hashes match the reference', () => {
  for (const [k, h] of Object.entries(B.expected.hashes)) assert.equal(docHash(B.recipes[k]), h, k);
  const r = B.recipes['lentil-soup'];
  assert.equal(docHash({ ...r, hash: 'x', signature: { y: 1 } }), docHash(r));
});

test('every expected dry run: state, reason and plan', () => {
  assert.ok(B.expected.dryRuns.length > 0);
  for (const e of B.expected.dryRuns) {
    const got = dryRun(B.recipes[e.recipe], B.devices[e.device], e.humanPresent, true, B.safetyLimits, B.now);
    const label = `${e.recipe} on ${e.device} (human ${e.humanPresent})`;
    assert.equal(got.state, e.state, label);
    assert.equal(got.refusal?.reason ?? null, e.reason ?? null, label);
    if (e.node !== undefined && e.node !== null) assert.equal(got.refusal?.node ?? null, e.node, label);
    assert.deepEqual(got.plan.map((p) => [p.node, p.by, p.verifiedBy]), e.plan, label);
  }
});
