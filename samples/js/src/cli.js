// `cookwala-samples` command line; bin/cookwala-samples.js calls main().
import { writeFileSync } from 'node:fs';
import { version } from './version.js';
import { loadBundle } from './data.js';
import { demo } from './scenarios.js';
import { handle, serve } from './service.js';
import { pyDumps } from './util.js';

export const USAGE = `\`cookwala-samples\` command line.

    cookwala-samples demo [--format markdown|json|junit|csv] [--hub URL [--token T]] [--out FILE]
    cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]
    cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]
    cookwala-samples run DISH [DISH ...] [--human-present] [--fault recipe-id#node=sensor_fault|timeout|overheat] [--format F]
    cookwala-samples serve [--port 8080] [--bind 127.0.0.1]
    cookwala-samples list                                bundled recipes and devices
    cookwala-samples version

Offline by default: four simulated devices and four example recipes from the Cookwala repository.
\`demo --hub URL\` runs the fault-free jobs against a real hub (python hub/cookwala_hub.py).
Exit codes: 0 ok, 1 something was refused or failed, 2 usage.
`;

const opt = (a, name, dflt = null) => (a.includes(name) ? a[a.indexOf(name) + 1] ?? dflt : dflt);
const many = (a, name) => a.flatMap((x, i) => (x === name && i + 1 < a.length ? [a[i + 1]] : []));

function positional(a, flagsWithValue) {
  const out = [];
  let skip = false;
  for (const x of a) {
    if (skip) { skip = false; continue; }
    if (flagsWithValue.has(x)) { skip = true; continue; }
    if (x.startsWith('--')) continue;
    out.push(x);
  }
  return out;
}

function emit(text, out = null) {
  if (out) {
    writeFileSync(out, text, 'utf8');
    console.log(`wrote ${out}`);
  } else process.stdout.write(text.endsWith('\n') ? text : text + '\n');
}

/** Resolves to the exit code, or null for `serve` (the server keeps running). */
export async function main(argv = process.argv.slice(2)) {
  let a = [...argv];
  if (!a.length || ['-h', '--help', 'help'].includes(a[0])) {
    console.log(USAGE);
    return a.length ? 0 : 2;
  }
  const cmd = a[0];
  a = a.slice(1);
  const fmt = opt(a, '--format', 'markdown');
  if (cmd === 'version') {
    console.log(`cookwala-samples ${version} (Core ${loadBundle().core})`);
    return 0;
  }
  if (cmd === 'list') {
    const b = loadBundle();
    console.log('recipes: ' + Object.keys(b.recipes).sort().join(', '));
    console.log('devices: ' + Object.keys(b.devices).sort().join(', '));
    return 0;
  }
  if (cmd === 'demo') {
    const rep = await demo({ hubUrl: opt(a, '--hub'), token: opt(a, '--token', process.env.COOKWALA_HUB_TOKEN ?? null) });
    emit(rep.render(fmt), opt(a, '--out'));
    return 0;
  }
  if (cmd === 'serve') {
    await serve(parseInt(opt(a, '--port', process.env.PORT ?? '8080'), 10), opt(a, '--bind', process.env.BIND ?? '127.0.0.1'));
    return null;
  }
  if (cmd === 'gates') {
    const pos = positional(a, new Set(['--device', '--block', '--format', '--out']));
    const r = await handle('POST', '/v1/samples/gates', {}, { recipe: pos[0] ?? null, device: opt(a, '--device'), humanPresent: a.includes('--human-present'),
      allergenBlocks: many(a, '--block') });
    const out = JSON.parse(r.body);
    console.log(pyDumps(out, 1));
    return r.status === 200 && out.allowed ? 0 : 1;
  }
  if (cmd === 'plan') {
    const pos = positional(a, new Set(['--servings', '--block', '--format', '--out']));
    const order = { dish: pos.join(' '), allergenBlocks: many(a, '--block') };
    if (opt(a, '--servings')) {
      const n = Number(opt(a, '--servings'));
      if (!Number.isFinite(n)) throw new Error(`could not convert string to float: '${opt(a, '--servings')}'`);
      order.servings = n;
    }
    const r = await handle('POST', '/v1/samples/plan', {}, { order, humanPresent: a.includes('--human-present') });
    const out = JSON.parse(r.body);
    console.log(pyDumps(out, 1));
    return r.status === 200 && out.ok ? 0 : 1;
  }
  if (cmd === 'run') {
    const pos = positional(a, new Set(['--fault', '--format', '--out', '--block']));
    const faults = {};
    for (const f of many(a, '--fault')) {
      const i = f.indexOf('=');
      if (i < 0) throw new Error(`--fault ${f}: expected recipe-id#node=kind`);
      faults[f.slice(0, i)] = f.slice(i + 1);
    }
    const jobs = pos.map((d, i) => ({ id: `${i + 1}-${d}`, order: { dish: d, allergenBlocks: many(a, '--block') }, humanPresent: a.includes('--human-present') }));
    const r = await handle('POST', '/v1/samples/run', { format: fmt }, { jobs, faults });
    emit(r.body, opt(a, '--out'));
    if (r.status !== 200) return 2;
    if (fmt === 'json') return Object.keys(JSON.parse(r.body).summary.outcomes).every((k) => k === 'completed') ? 0 : 1;
    return 0;
  }
  console.log(USAGE);
  return 2;
}
