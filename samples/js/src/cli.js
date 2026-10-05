// `cookwala-samples` command line; bin/cookwala-samples.js calls main().
import { writeFileSync } from 'node:fs';
import { version } from './version.js';
import { loadBundle } from './data.js';
import { demo } from './scenarios.js';
import { handle, runJobs, serve } from './service.js';
import { Job } from './orchestrator.js';
import { pyDumps } from './util.js';

// The overview (`cookwala-samples help`) and each command's help (`cookwala-samples help COMMAND`); the same text in every language.
export const USAGE = `cookwala-samples: runnable samples for the Cookwala Core 0.2 API.

Plans, checks and cooks the bundled example recipes on four simulated devices, so every Cookwala role
(client, planner agent, orchestrator, safety gates, recovery, reporting) can be seen without hardware.
Nothing is really cooked, and everything runs offline unless you pass --hub.

Commands:
  demo      run the six-job demo and print its report
  run       cook one or more dishes on the simulated kitchen and report what happened
  plan      ask the planner agent to turn a dish into a checked cooking request
  gates     run the safety gates on one recipe and show which gate allows or refuses it
  list      show the bundled recipes and simulated devices
  serve     start the samples HTTP service (the same samples over HTTP)
  version   print the samples version and the Core version it speaks
  help      show this help, or the help for one command

Run \`cookwala-samples help COMMAND\` or \`cookwala-samples COMMAND --help\` for options and examples.
Exit codes: 0 ok; 1 a gate refused, a plan failed, or a run did not complete; 2 usage error.`;

export const HELP = {
  demo: `cookwala-samples demo [--format markdown|json|junit|csv] [--out FILE] [--hub URL [--token T]]

Runs six orders through a four-device kitchen with a planner agent and a person, so every role appears
in one run, and prints the report. What each job shows:
  lentil-soup  the best device is busy, so the job moves to the next; a timed-out step is confirmed by the person
  shakshuka    refused by the planner: eggs are blocked and no alternative is allowed
  salata       the cutting step may not run unattended; the person agrees to stay
  koshari      the oil limit fires while deep frying: heat cut, stopped, food discarded, incident reported
  shakshuka-2  a sensor fails mid-simmer: failed, food discarded, incident reported
  lentil-note  the order carries an injected instruction: logged as untrusted text, ignored, cooked normally

Options:
  --format F   report format: markdown (default), json, junit (for CI test reports) or csv
  --out FILE   write the report to FILE instead of standard output
  --hub URL    run the fault-free jobs against a real Cookwala hub instead of the simulated kitchen
  --token T    bearer token for --hub (default: the COOKWALA_HUB_TOKEN environment variable)

Examples:
  cookwala-samples demo
  cookwala-samples demo --format junit --out demo.xml

Exit code: 0 when the report was produced.`,
  run: `cookwala-samples run DISH [DISH ...] [--human-present] [--block ALLERGEN ...] [--fault RECIPE#NODE=KIND ...]
                     [--format markdown|json|junit|csv] [--out FILE]

Cooks each DISH as its own job on the simulated kitchen: the planner picks and scales the recipe, the
orchestrator ranks the devices, the gates check the request, the device runs it step by step, and
recovery handles what goes wrong (next device, ask the person, stop and discard). Prints one report.

Arguments:
  DISH                    a dish name, matched against the bundled recipes (see \`list\`), e.g. lentil or koshari
Options:
  --human-present         a person is in the kitchen and can watch or confirm steps
  --block ALLERGEN        refuse any recipe containing ALLERGEN; repeat for more, e.g. --block eggs --block peanuts
  --fault RECIPE#NODE=KIND
                          inject a fault at one step; KIND is sensor_fault, timeout or overheat; repeatable,
                          e.g. --fault 'example-koshari#n14=overheat'
  --format F              report format: markdown (default), json, junit or csv
  --out FILE              write the report to FILE instead of standard output

Examples:
  cookwala-samples run lentil --human-present
  cookwala-samples run koshari --human-present --fault 'example-koshari#n14=overheat' --format csv

Exit code: 0 when every job completed; 1 when a job was refused, failed or stopped; 2 usage error.`,
  plan: `cookwala-samples plan DISH [--servings N] [--block ALLERGEN ...] [--human-present]

Asks the planner agent to turn an order into a Cookwala ExecuteRequest: it finds the recipe, scales it
to the servings, checks the allergen blocks, and ranks the simulated devices that could cook it, with the
reason a device would refuse. Prints the proposal as JSON. Nothing is cooked.

Arguments:
  DISH              a dish name, matched against the bundled recipes (see \`list\`)
Options:
  --servings N      scale the recipe to N servings (default: as written in the recipe)
  --block ALLERGEN  refuse the plan if the recipe contains ALLERGEN; repeatable
  --human-present   a person is in the kitchen, which changes which devices can take the job

Example:
  cookwala-samples plan koshari --servings 4 --human-present

Exit code: 0 when the planner produced a request; 1 when it refused.`,
  gates: `cookwala-samples gates RECIPE [--device DEVICE] [--human-present] [--block ALLERGEN ...]

Runs the default safety gate pipeline on one recipe, as a device does before it cooks, and prints every
gate's result and the refusal, if any, as JSON. The gates check the Core version, the recipe hash, recalls,
the mandate, allergens, untrusted text, the safety envelope, attendance and, with --device, capability.

Arguments:
  RECIPE            a bundled recipe (see \`list\`), e.g. shakshuka
Options:
  --device DEVICE   also check this simulated device's capabilities (see \`list\`)
  --human-present   a person is in the kitchen; recipes with steps that may not run unattended need this
  --block ALLERGEN  refuse if the recipe contains ALLERGEN; repeatable

Example:
  cookwala-samples gates shakshuka --block eggs --human-present

Exit code: 0 when every gate allows the request; 1 when a gate refuses.`,
  list: `cookwala-samples list

Prints the bundled example recipes and the simulated devices; use these names with run, plan and gates.

Exit code: 0.`,
  serve: `cookwala-samples serve [--port 8080] [--bind 127.0.0.1]

Starts an HTTP service with the same samples, for containers and cloud functions. Stop it with Ctrl+C.
  GET  /health                    status, samples version and Core version
  GET  /v1/samples                bundled recipes (with references and hashes), devices and endpoints
  GET  /v1/samples/demo?format=F  the demo report (json by default; markdown, junit or csv)
  POST /v1/samples/gates          {"recipe", "device"?, "humanPresent"?, "allergenBlocks"?}: the gate results
  POST /v1/samples/plan           {"order": {"dish", "servings"?, "allergenBlocks"?}, "humanPresent"?}: the proposal
  POST /v1/samples/run?format=F   {"jobs"?, "faults"?}: a report; without jobs, the demo

Options:
  --port N     port to listen on (default: the PORT environment variable, else 8080)
  --bind ADDR  address to listen on (default: the BIND environment variable, else 127.0.0.1;
               use 0.0.0.0 inside a container)

Example:
  cookwala-samples serve --port 8080`,
  version: `cookwala-samples version

Prints the samples version and the Core version it speaks, e.g. \`cookwala-samples 0.3.0 (Core 0.2.0)\`.

Exit code: 0.`,
  help: `cookwala-samples help [COMMAND]

Without COMMAND, lists the commands. With COMMAND, explains it: what it does, its options and examples.
\`cookwala-samples COMMAND --help\` and \`-h\` do the same.

Exit code: 0; 2 for an unknown command.`,
};

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
    let topic = a[0] === 'help' && a.length > 1 ? a[1] : null;
    if (topic === '-h' || topic === '--help') topic = 'help';
    if (topic !== null && !Object.hasOwn(HELP, topic)) { console.log(`unknown command: ${topic}\n\n${USAGE}`); return 2; }
    console.log(topic === null ? USAGE : HELP[topic]);
    return a.length ? 0 : 2;
  }
  const cmd = a[0];
  a = a.slice(1);
  if (Object.hasOwn(HELP, cmd) && (a.includes('--help') || a.includes('-h'))) { console.log(HELP[cmd]); return 0; }
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
      if (i < 0 || !['sensor_fault', 'timeout', 'overheat'].includes(f.slice(i + 1))) { console.log('usage error: --fault takes recipe-id#node=sensor_fault|timeout|overheat'); return 2; }
      faults[f.slice(0, i)] = f.slice(i + 1);
    }
    if (!pos.length) { console.log(HELP.run); return 2; }
    const jobs = pos.map((d, i) => new Job(`${i + 1}-${d}`, { order: { dish: d, allergenBlocks: many(a, '--block') }, humanPresent: a.includes('--human-present') }));
    const rep = await runJobs(jobs, faults);
    emit(rep.render(fmt), opt(a, '--out'));
    return Object.keys(rep.summary().outcomes).every((k) => k === 'completed') ? 0 : 1;
  }
  console.log(`unknown command: ${cmd}\n\n${USAGE}`);
  return 2;
}
