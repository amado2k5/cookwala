import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/cookwala-samples.js', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('run exits 1 when a job does not complete, in every format', () => {
  for (const fmt of ['csv', 'markdown', 'json', 'junit']) {
    const r = run('run', 'koshari', '--human-present', '--fault', 'example-koshari#n14=overheat', '--format', fmt);
    assert.equal(r.status, 1, fmt);
    assert.match(r.stdout, /stopped/);
  }
});

test('run exits 0 when every job completes, 2 without a dish', () => {
  assert.equal(run('run', 'lentil', '--human-present', '--format', 'csv').status, 0);
  assert.equal(run('run').status, 2);
  assert.equal(run('run', 'koshari', '--fault', 'n1=explode').status, 2);
  assert.equal(run('run', 'koshari', '--fault', 'noequals').status, 2);
});
