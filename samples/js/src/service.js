// The samples as a small HTTP service: one framework-free handler, used by every deployment target.
//
// `handle(method, path, query, body)` resolves to {status, contentType, body} (body is text).
// `cookwala-samples serve` and any serverless adapter call it, so they behave the same.
//
// Endpoints:
//   GET  /health                         liveness
//   GET  /v1/samples                     what is bundled (recipes, devices) and the endpoints
//   POST /v1/samples/gates               run the gate pipeline: {recipe, device?, humanPresent?, allergenBlocks?, requestedBy?, mandate?}
//   POST /v1/samples/plan                planner agent + device ranking: {order: {dish, servings?, allergenBlocks?}, humanPresent?}
//   POST /v1/samples/run                 orchestrate jobs on the simulated kitchen: {jobs?: [{id, order, humanPresent}], faults?, format?}
//   GET  /v1/samples/demo?format=        the demo report (json | markdown | junit | csv)
//
// Everything runs on simulated devices from the bundle. The service never calls another host, so it
// can run as a public function without becoming a proxy to anyone's kitchen.
import { createServer } from 'node:http';
import { version } from './version.js';
import { PlannerAgent, ScriptedHuman, makeMandate } from './agents.js';
import { BundleCatalog } from './clients.js';
import { loadBundle, globalRef } from './data.js';
import { GateContext, GatePipeline } from './gates.js';
import { docHash } from './jcs.js';
import { Job, Orchestrator } from './orchestrator.js';
import { Reporter } from './reporting.js';
import { kitchen, demo } from './scenarios.js';
import { truthy, get, pyStr, pyRepr, pyDumps, sorted, ValueError, KeyError } from './util.js';

export const MAX_BODY = 256 * 1024;
export const MAX_JOBS = 20;
export const TYPES = { json: 'application/json', markdown: 'text/markdown; charset=utf-8', md: 'text/markdown; charset=utf-8',
  junit: 'application/xml', csv: 'text/csv; charset=utf-8' };
export const FAULT_KINDS = new Set(['sensor_fault', 'timeout', 'overheat']);

const isDict = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const json = (status, body) => ({ status, contentType: 'application/json', body: pyDumps(body) });

function problemResponse(status, title, detail = null) {
  return { status, contentType: 'application/problem+json', body: pyDumps({ type: `https://cookwala.ai/errors/${title}`, title, ...(detail ? { detail } : {}) }) };
}

function report(rep, fmt) {
  if (!(fmt in TYPES)) return problemResponse(400, 'invalid-request', `format must be one of ${pyRepr(sorted(Object.keys(TYPES)))}`);
  return { status: 200, contentType: TYPES[fmt], body: rep.render(fmt) };
}

function pyList(v) {
  if (Array.isArray(v)) return [...v];
  if (typeof v === 'string') return [...v];
  if (isDict(v)) return Object.keys(v);
  throw new TypeError(`'${v === null ? 'NoneType' : typeof v}' object is not iterable`);
}

function toJobs(raw) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_JOBS) throw new ValueError(`jobs must be a list of 1..${MAX_JOBS}`);
  return raw.map((j, i) => {
    if (!isDict(j) || !isDict(j.order) || typeof j.order.dish !== 'string') throw new ValueError(`jobs[${i}] needs order.dish`);
    return new Job(pyStr(get(j, 'id', `job-${i + 1}`)).slice(0, 64), { order: j.order, humanPresent: truthy(get(j, 'humanPresent', false)) });
  });
}

function svcPlanner(human) {
  return new PlannerAgent('agent:planner-svc', makeMandate('household:h-svc/person:p-1', 'agent:planner-svc'), new BundleCatalog(), human);
}

/** Resolves to {status, contentType, body}. */
export async function handle(method, path, query = null, body = null) {
  const q = query || {};
  const fmt = String(q.format || 'json').toLowerCase();
  const b = loadBundle();
  try {
    if (method === 'GET' && ['/health', '/healthz', '/'].includes(path)) {
      return json(200, { ok: true, service: 'cookwala-samples', version, core: b.core });
    }
    if (method === 'GET' && path === '/v1/samples') {
      const recipes = {};
      for (const [k, r] of Object.entries(b.recipes)) recipes[k] = { ref: globalRef(r), hash: docHash(r) };
      return json(200, { version, recipes, devices: sorted(Object.keys(b.devices)),
        endpoints: ['/v1/samples/gates', '/v1/samples/plan', '/v1/samples/run', '/v1/samples/demo'], note: 'simulated devices; nothing is cooked' });
    }
    if (method === 'GET' && path === '/v1/samples/demo') return report(await demo(), fmt);
    if (method !== 'POST') return problemResponse(404, 'not-found');
    body = truthy(body) ? body : {};
    if (!isDict(body)) return problemResponse(400, 'invalid-request', 'body must be a JSON object');
    if (path === '/v1/samples/gates') {
      const recipe = new BundleCatalog().get(pyStr(get(body, 'recipe', '')));
      if (recipe === null) return problemResponse(400, 'invalid-request', `recipe must be one of ${pyRepr(sorted(Object.keys(b.recipes)))}`);
      const device = truthy(body.device) ? get(b.devices, body.device, null) : null;
      if (truthy(body.device) && device === null) return problemResponse(400, 'invalid-request', `device must be one of ${pyRepr(sorted(Object.keys(b.devices)))}`);
      const req = { core: '0.2.0', kind: 'ExecuteRequest', id: 'gates-check', recipe: globalRef(recipe), recipeHash: get(body, 'recipeHash', docHash(recipe)),
        requestedBy: pyStr(get(body, 'requestedBy', 'person:p-1')), idempotencyKey: 'gates-check-0001', allergenBlocks: pyList(get(body, 'allergenBlocks', [])) };
      if (isDict(body.mandate)) req.mandate = body.mandate;
      const d = GatePipeline.default().run(new GateContext(req, recipe, device, truthy(get(body, 'humanPresent', false))));
      return json(200, d.asDict());
    }
    if (path === '/v1/samples/plan') {
      const order = body.order;
      if (!isDict(order) || typeof order.dish !== 'string') return problemResponse(400, 'invalid-request', 'order.dish is required');
      const human = new ScriptedHuman({ present: truthy(get(body, 'humanPresent', false)), confirm: truthy(get(body, 'confirm', false)) });
      const planner = svcPlanner(human);
      const p = await planner.propose(order);
      const out = p.asDict();
      if (p.ok) {
        const orch = new Orchestrator(kitchen(), { planner });
        out.ranking = (await orch.rank(p.recipe, human.present)).map(([n, dr]) => ({ device: n, state: dr.state, ...(dr.refusal ? { reason: dr.refusal.reason } : {}),
          humanSteps: dr.plan.filter((s) => s.verifiedBy === 'human').length }));
      }
      return json(200, out);
    }
    if (path === '/v1/samples/run') {
      const jobs = 'jobs' in body ? toJobs(body.jobs) : null;
      const faults = get(body, 'faults', {});
      if (!isDict(faults) || Object.values(faults).some((v) => !FAULT_KINDS.has(v))) {
        return problemResponse(400, 'invalid-request', `faults maps "recipe-id#node" to one of ${pyRepr(sorted(FAULT_KINDS))}`);
      }
      if (jobs === null) return report(await demo(), fmt);
      const human = new ScriptedHuman({ present: true });
      const orch = new Orchestrator(kitchen(faults), { planner: svcPlanner(human), human, recalls: [] });
      const records = [];
      for (const j of jobs) records.push(await orch.run(j));
      return report(new Reporter(records, 'Cookwala samples run'), fmt);
    }
    return problemResponse(404, 'not-found');
  } catch (e) {
    if (e instanceof ValueError || e instanceof KeyError || e instanceof TypeError) return problemResponse(400, 'invalid-request', `${e.name}: ${e.message}`);
    throw e;
  }
}

/** Adapters call this: url may carry ?format=, rawBody is a Buffer, Uint8Array or string. */
export async function handleRaw(method, url, rawBody = '') {
  const u = new URL(url, 'http://localhost');
  const query = {};
  for (const [k, v] of u.searchParams) if (v !== '') query[k] = v; // parse_qs drops blank values; the last one wins
  const size = typeof rawBody === 'string' ? Buffer.byteLength(rawBody) : rawBody?.length ?? 0;
  if (size > MAX_BODY) return problemResponse(413, 'too-large', `body over ${MAX_BODY} bytes`);
  let body = null;
  if (size) {
    try {
      body = JSON.parse(typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody).toString('utf8'));
    } catch (e) {
      return problemResponse(400, 'invalid-request', `body is not JSON: ${e.message}`);
    }
  }
  return handle(method.toUpperCase(), u.pathname.replace(/\/+$/, '') || '/', query, body);
}

/** Serve the handler with node:http. Resolves to the listening http.Server. */
export function serve(port = 8080, bind = '127.0.0.1', { quiet = false } = {}) {
  const server = createServer((req, res) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      if (size <= MAX_BODY) chunks.push(c);
      size += c.length;
    });
    req.on('end', async () => {
      let r;
      try {
        const raw = Buffer.concat(chunks);
        r = await handleRaw(req.method, req.url, size > MAX_BODY ? Buffer.alloc(MAX_BODY + 1) : raw);
      } catch (e) {
        r = problemResponse(500, 'internal-error', `${e?.name}: ${e?.message}`);
      }
      const data = Buffer.from(r.body, 'utf8');
      res.writeHead(r.status, { 'Content-Type': r.contentType, 'Content-Length': data.length, Server: `cookwala-samples/${version}` });
      res.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, bind, () => {
      if (!quiet) console.log(`cookwala-samples ${version} on http://${bind}:${server.address().port}  (simulated devices; GET /v1/samples)`);
      resolve(server);
    });
  });
}
