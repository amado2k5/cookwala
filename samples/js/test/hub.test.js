// Drives the reference hub (hub/cookwala_hub.py) over HTTP when this runs inside the Cookwala repository.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { demo, HubClient, CookwalaProblem } from '../src/index.js';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const HUB = `${REPO}hub/cookwala_hub.py`;
const hasPython = spawnSync('python3', ['--version']).status === 0;
const skip = !existsSync(HUB) ? 'needs the Cookwala repository (reference hub)' : !hasPython ? 'needs python3' : false;

const freePort = () => new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});

let proc;
let base;

before(async () => {
  if (skip) return;
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  proc = spawn('python3', ['hub/cookwala_hub.py', '--port', String(port), '--speed', '2000', '--token', 'test-token'], { cwd: REPO, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    try { await fetch(`${base}/v1/capabilities`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
});

after(() => { if (proc) proc.kill(); });

test('demo against the reference hub', { skip, timeout: 120000 }, async () => {
  const rep = await demo({ hubUrl: base, token: 'test-token' });
  const outcomes = Object.fromEntries(rep.records.map((r) => [r.job, r.outcome]));
  assert.equal(outcomes.shakshuka, 'refused');
  assert.equal(outcomes.salata, 'completed', rep.toMarkdown());
  assert.equal(outcomes['lentil-note'], 'completed', rep.toMarkdown());
});

test('a wrong token is a problem', { skip }, async () => {
  await assert.rejects(new HubClient(base, { token: 'wrong', retries: 0 }).capabilities(), (e) => e instanceof CookwalaProblem && e.status === 401);
});

test('an unreachable hub is status 0 after retries', async () => {
  const port = await freePort();
  await assert.rejects(new HubClient(`http://127.0.0.1:${port}`, { retries: 1, backoffS: 0.01 }).capabilities(), (e) => e instanceof CookwalaProblem && e.status === 0);
});
