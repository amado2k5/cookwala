// Sample clients: one interface, two transports, and two recipe catalogs.
//
// `HubClient` speaks HTTP to any executor or hub that serves the Core 0.2 API (the reference hub in
// hub/ also serves /v1/tools/*). `LocalClient` drives a SimulatedExecutor in process. Orchestrators,
// agents and recovery only use the methods both share, so a sample written offline runs unchanged
// against a real hub. Every method of both clients returns a Promise.
//
// Network retries reuse the same Idempotency-Key, so a POST that reached the executor before the
// connection dropped is not executed twice.
import { randomBytes } from 'node:crypto';
import { loadBundle, globalRef } from './data.js';
import { CookwalaProblem } from './errors.js';
import { docHash } from './jcs.js';
import { SimulatedExecutor, dryRun } from './simulator.js';
import { iso, sleepS, sorted } from './util.js';

export function newKey(prefix = 'cw') {
  return `${prefix}-${randomBytes(10).toString('hex')}`;
}

/** Core 0.2 API over HTTP, with global fetch. */
export class HubClient {
  constructor(baseUrl = 'http://localhost:7878', { token = null, timeoutS = 30, retries = 4, backoffS = 0.5, pollS = 0.5, name = null } = {}) {
    this.base = baseUrl.replace(/\/+$/, '');
    this.token = token;
    this.timeoutS = timeoutS;
    this.retries = retries;
    this.backoffS = backoffS;
    this.pollS = pollS;
    this.name = name || this.base;
    this.lastHeaders = null;
  }

  async call(method, path, body = null, headers = null) {
    const data = body !== null && body !== undefined ? JSON.stringify(body) : null;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const h = { Accept: 'application/vnd.cookwala+json, application/json, application/problem+json' };
      if (data !== null) h['Content-Type'] = 'application/vnd.cookwala+json';
      if (this.token) h.Authorization = `Bearer ${this.token}`;
      Object.assign(h, headers || {}); // the same Idempotency-Key on every attempt
      let res;
      try {
        res = await fetch(this.base + path, { method, headers: h, body: data, signal: AbortSignal.timeout(this.timeoutS * 1000) });
      } catch (e) {
        if (attempt >= this.retries) throw new CookwalaProblem(0, { title: 'unreachable', detail: String(e?.cause?.message || e?.message || e) });
        await sleepS(this.backoffS * 2 ** attempt);
        continue;
      }
      const raw = await res.text();
      this.lastHeaders = Object.fromEntries(res.headers.entries());
      if (res.ok) return raw ? JSON.parse(raw) : null;
      let payload;
      try { payload = JSON.parse(raw); } catch { payload = { title: 'http-error', detail: raw }; }
      if ([502, 503, 504].includes(res.status) && attempt < this.retries) {
        await sleepS(this.backoffS * 2 ** attempt);
        continue;
      }
      throw new CookwalaProblem(res.status, payload);
    }
    throw new CookwalaProblem(0, { title: 'unreachable' });
  }

  // Core API
  capabilities() { return this.call('GET', '/v1/capabilities'); }
  safetyLimits() { return this.call('GET', '/v1/safety-limits'); }
  recalls() { return this.call('GET', '/v1/recalls'); }

  startExecution(request, idempotencyKey = null, humanPresent = null) {
    const key = idempotencyKey || request.idempotencyKey || newKey('ex');
    const body = { ...request };
    if (humanPresent !== null && humanPresent !== undefined) body['x-hub-human-present'] = Boolean(humanPresent); // reference-hub extension
    return this.call('POST', '/v1/executions', body, { 'Idempotency-Key': key });
  }

  getExecution(id) { return this.call('GET', `/v1/executions/${id}`); }
  stopExecution(id, reason = 'requested') { return this.call('POST', `/v1/executions/${id}/stop`, { reason }); }
  resumeExecution(id, seq) {
    return this.call('POST', `/v1/executions/${id}/resume`, {}, { 'Idempotency-Key': newKey('resume'), 'If-Match': `"${seq}"` });
  }
  executionLog(id) { return this.call('GET', `/v1/executions/${id}/log`); }
  reportIncident(doc) { return this.call('POST', '/v1/incidents', doc, { 'Idempotency-Key': newKey('inc') }); }

  // Reference-hub tools (not Core): the dry run the hub would do, without starting anything
  async dryRun(recipe, humanPresent = false) {
    return this.call('POST', '/v1/tools/dryrun', { recipe, device: await this.capabilities(), humanPresent: Boolean(humanPresent) });
  }

  advance() {
    return sleepS(this.pollS); // a real executor runs on its own clock; the client only waits and polls
  }
}

/** The same interface over an in-process SimulatedExecutor. */
export class LocalClient {
  constructor(executor, name = null) {
    this.ex = executor;
    this.name = name || executor.caps?.actor?.id || 'simulated';
  }

  static forDevice(device, opts = {}) {
    return new LocalClient(SimulatedExecutor.fromBundle(device, opts), device);
  }

  async capabilities() { return this.ex.capabilities(); }
  async safetyLimits() { return this.ex.safetyLimits(); }
  async recalls() { return this.ex.recalls(); }
  async startExecution(request, idempotencyKey = null, humanPresent = false) {
    return this.ex.startExecution(request, idempotencyKey || request.idempotencyKey || newKey('ex'), Boolean(humanPresent));
  }
  async getExecution(id) { return this.ex.getExecution(id); }
  async stopExecution(id, reason = 'requested') { return this.ex.stopExecution(id, reason); }
  async resumeExecution(id, seq) { return this.ex.resumeExecution(id, seq); }
  async executionLog(id) { return this.ex.executionLog(id); }
  async reportIncident(doc) { return this.ex.reportIncident(doc); }
  async dryRun(recipe, humanPresent = false) {
    return dryRun(recipe, this.ex.caps, humanPresent, true, this.ex.limits, iso(this.ex.now));
  }
  async advance() { this.ex.tick(); }
}

/** Recipes from the bundled snapshot (four example recipes from this repository). */
export class BundleCatalog {
  constructor(recipes = null) {
    this.recipes = recipes ?? loadBundle().recipes;
  }

  list() {
    return sorted(Object.keys(this.recipes));
  }

  get(key) {
    for (const [k, doc] of Object.entries(this.recipes)) {
      if (key === k || key === doc.id || key === globalRef(doc)) return doc;
    }
    return null;
  }

  /** Match a dish by key, id or English name. The text is a lookup key, never an instruction. */
  find(text) {
    const t = String(text).trim().toLowerCase();
    return Object.entries(this.recipes)
      .filter(([k, d]) => k.includes(t) || (d.id ?? '').includes(t) || (d.dish?.names?.en ?? '').toLowerCase().includes(t))
      .map(([, d]) => d);
  }

  refAndHash(doc) {
    return [globalRef(doc), docHash(doc)];
  }
}

/** Recipes served by the reference hub's /v1/tools/recipes (file stems) and /v1/tools/recipes/{stem}. */
export class HubCatalog extends BundleCatalog {
  static async create(client) {
    const stems = (await client.call('GET', '/v1/tools/recipes')).recipes;
    const recipes = {};
    for (const s of stems) recipes[s] = await client.call('GET', `/v1/tools/recipes/${s}`);
    return new HubCatalog(recipes);
  }
}
