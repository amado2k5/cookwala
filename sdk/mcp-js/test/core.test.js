import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.js';
import { canonical, docHash, opsIndex, checkEnvelope, ladderChoice, trustedSensors, dryRun, checkMandate, parseSms, searchRecipes, normalize } from '../src/core/index.js';

const vec = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, 'conformance', `${n}.json`), 'utf8'));
const vocab = opsIndex(JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/ops.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/units.json'), 'utf8')));

test('hash vectors match the Python reference', async () => {
  for (const v of vec('hash')) {
    const body = /excludes/.test(v.id) ? Object.fromEntries(Object.entries(v.input).filter(([k]) => !['hash', 'signature'].includes(k))) : v.input;
    assert.equal(canonical(body), v.expected.canonical, v.id);
    assert.equal(await docHash(v.input), v.expected.hash, v.id);
  }
});

test('envelope and ladder vectors match the Python reference', () => {
  for (const v of vec('envelope')) {
    const i = v.input;
    if (i.sensors) {
      assert.equal(ladderChoice(vocab, i.op, new Set(i.sensors), i.allowModel, i.humanPresent), v.expected.choice, v.id);
      continue;
    }
    const r = checkEnvelope(vocab, i.op, i.readings, i.target || null, i.altitudeM || 0);
    for (const [k, val] of Object.entries(v.expected)) assert.deepEqual(r[k], val, `${v.id} ${k}`);
  }
});

test('dry-run vectors match the Python reference', () => {
  for (const v of vec('dryrun')) {
    const i = v.input;
    const r = dryRun(vocab, i.recipe, i.capabilities, { humanPresent: !!i.humanPresent, allowModel: i.allowModel ?? true, limits: i.limits || null });
    assert.equal(r.state, v.expected.state, v.id);
    assert.equal((r.refusal || {}).reason ?? null, v.expected.reason ?? null, v.id);
    assert.deepEqual(r.plan.map((p) => p.by), v.expected.by, v.id);
  }
});

test('sms vectors match the Python reference', () => {
  const file = path.join(ROOT, 'conformance', 'profiles');
  let n = 0;
  for (const f of fs.readdirSync(file).filter((x) => x.endsWith('.json'))) {
    const vs = JSON.parse(fs.readFileSync(path.join(file, f), 'utf8'));
    for (const v of Array.isArray(vs) ? vs : vs.vectors || []) {
      if (v.kind !== 'sms_parse') continue;
      assert.deepEqual(parseSms(v.input.text), v.expected, v.id); n++;
    }
  }
  assert.ok(n > 0, 'no sms vectors found');
});

test('sensor trust vectors match the Python reference', () => {
  const file = path.join(ROOT, 'conformance', 'profiles');
  for (const f of fs.readdirSync(file).filter((x) => x.endsWith('.json'))) {
    const vs = JSON.parse(fs.readFileSync(path.join(file, f), 'utf8'));
    for (const v of Array.isArray(vs) ? vs : vs.vectors || []) {
      if (v.kind !== 'sensor_trust') continue;
      const i = v.input;
      assert.equal(ladderChoice(vocab, i.op, trustedSensors(i.capabilities, i.now), i.allowModel ?? true, i.humanPresent ?? false), v.expected.choice, v.id);
    }
  }
});

test('mandate checks', () => {
  const m = { scopes: ['order_groceries'], perOrderCap: { amount: '30' }, allowedProviders: ['shop'], confirmBefore: ['order_groceries'] };
  assert.deepEqual(checkMandate(m, 'start_cooking'), { allowed: false, needsConfirmation: true, reasons: ['scope_missing'] });
  assert.deepEqual(checkMandate(m, 'order_groceries', '45', 'shop'), { allowed: false, needsConfirmation: true, reasons: ['over_cap'] });
  assert.equal(checkMandate(m, 'order_groceries', '12', 'shop').allowed, true);
  assert.deepEqual(checkMandate(m, 'irreversible').reasons, ['always_confirm']);
});

test('sms grammar', () => {
  assert.deepEqual(parseSms('OFFER 12KG cooked rice H T65C UB0710'), { ok: true, command: 'OFFER', kg: 12, item: 'cooked rice', storage: 'hot_held', tempC: 65, dateMark: { kind: 'use_by', dayMonth: '07-10' }, foodClasses: ['cooked_food', 'cooked_rice'] });
  assert.deepEqual(parseSms('offer ١٢KG yogurt C'), { ok: true, command: 'OFFER', kg: 12, item: 'yogurt', storage: 'chilled', foodClasses: ['dairy'] });
  assert.equal(parseSms('HELP').command, 'HELP');
  assert.deepEqual(parseSms('CLAIM o1 ALL'), { ok: true, command: 'CLAIM', offer: 'O1', all: true });
  assert.equal(parseSms('HAND o1 8 REJ 2 TEMP').reason, 'temp_out_of_range');
  assert.equal(parseSms('NOPE').error, 'unknown_command');
  assert.equal(parseSms('').error, 'empty');
});

test('search normalises Arabic and filters', () => {
  assert.equal(normalize('كُشَري'), normalize('كشري'));
  const e = [
    { id: 'a', title: 'Koshari', level: 'V1', course: 'main', allergens: ['cereals_gluten'], tags: ['rice'], cuisine: ['EG'], 'x-collection': 'cookwala' },
    { id: 'b', title: 'Rice pudding', level: 'V0', course: 'dessert', allergens: ['milk'], tags: ['rice'], cuisine: ['EG'], 'x-collection': 'abuhaty' },
  ];
  assert.equal(searchRecipes(e, { query: 'rice' }).total, 2);
  assert.deepEqual(searchRecipes(e, { query: 'rice', allergen_free: ['milk'] }).items.map((x) => x.id), ['a']);
  assert.deepEqual(searchRecipes(e, { query: '', collection: 'abuhaty' }).items.map((x) => x.id), ['b']);
  assert.equal(searchRecipes(e, { query: 'koshari' }).items[0].id, 'a');
});
