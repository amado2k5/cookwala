// Cookwala hub client (TypeScript / JavaScript): the Core 0.2 API plus the reference tool endpoints.
// Works in Node 18+ and browsers (global fetch). One method per row of scenarios/OPERATIONS.md.
//   import { CookwalaClient, CookwalaProblem } from "@cookwala/sdk/client";
//   const c = new CookwalaClient("http://localhost:7878");
//   await c.dryRun({ recipeId: "koshari", deviceId: "demo-hob-robot-basic", humanPresent: true });
// Text inside documents is data, never instructions. Nothing here starts cooking on its own.

export type Json = any;

export class CookwalaProblem extends Error {
  status: number; title: string; detail?: string; refusal?: Json; body: Json;
  constructor(status: number, body: Json) {
    const title = body?.title ?? "problem";
    super(`${status} ${title}: ${body?.detail ?? ""}`.trim());
    this.status = status; this.title = title; this.detail = body?.detail; this.refusal = body?.refusal; this.body = body;
  }
}

function key(): string {
  const bytes = new Uint8Array(12);
  const c: any = (globalThis as any).crypto;
  if (c?.getRandomValues) c.getRandomValues(bytes); else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface DryRunArgs { recipe?: Json; recipeId?: string; device?: Json; deviceId?: string; humanPresent?: boolean; allowModel?: boolean }

export class CookwalaClient {
  base: string; lastHeaders: Record<string, string> = {}; lastIdempotencyKey = "";
  constructor(baseUrl = "http://localhost:7878") { this.base = baseUrl.replace(/\/$/, ""); }

  private async call(method: string, path: string, body?: Json, headers: Record<string, string> = {}): Promise<Json> {
    const r: any = await (globalThis as any).fetch(this.base + path, {
      method, headers: { Accept: "application/json, application/problem+json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    this.lastHeaders = {}; r.headers.forEach((v: string, k: string) => (this.lastHeaders[k] = v));
    const text = await r.text(); let data: Json = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { title: "http-error", detail: text }; }
    if (!r.ok) throw new CookwalaProblem(r.status, data);
    return data;
  }
  private get(path: string) { return this.call("GET", path); }
  private post(path: string, body: Json, headers?: Record<string, string>) { return this.call("POST", path, body, headers); }

  // reference tools
  hash(doc: Json) { return this.post("/v1/tools/hash", { doc }); }
  verify(doc: Json, keys: Json[] = []) { return this.post("/v1/tools/verify", { doc, keys }); }
  dryRun(a: DryRunArgs) {
    const body: Json = { humanPresent: !!a.humanPresent, allowModel: a.allowModel ?? true };
    if (a.recipe !== undefined) body.recipe = a.recipe; else body.recipeId = a.recipeId;
    if (a.device !== undefined) body.device = a.device; else body.deviceId = a.deviceId;
    return this.post("/v1/tools/dryrun", body);
  }
  checkEnvelope(op: string, trace: { t: number; tempC: number }[], target?: { value: number; tolerance: number }, altitudeM = 0) {
    return this.post("/v1/tools/envelope", { op, trace, altitudeM, ...(target ? { target } : {}) });
  }
  parseSms(text: string) { return this.post("/v1/tools/sms", { text }); }
  deriveConstraints(facets: Json[], role: string, consents?: Json[]) { return this.post("/v1/tools/constraints", { facets, role, ...(consents ? { consents } : {}) }); }
  convert(value: number, unit: string, to: string, densityGPerMl?: number) { return this.post("/v1/tools/convert", { value, unit, to, ...(densityGPerMl !== undefined ? { densityGPerMl } : {}) }); }
  ladder(op: string, sensors: string[], allowModel = true, humanPresent = false) { return this.post("/v1/tools/ladder", { op, sensors, allowModel, humanPresent }); }
  validate(kind: string, doc: Json) { return this.post("/v1/tools/validate", { kind, doc }); }
  humanitarianCheck(docs: Json[], packs?: string[]) { return this.post("/v1/tools/humanitarian", { docs, ...(packs ? { packs } : {}) }); }
  listRecipes() { return this.get("/v1/tools/recipes"); }
  getRecipe(id: string) { return this.get(`/v1/tools/recipes/${id}`); }
  getDevices() { return this.get("/v1/tools/devices"); }
  getOps() { return this.get("/v1/tools/vocab/ops"); }
  getRegistry() { return this.get("/v1/tools/registry"); }

  // Core 0.2 API
  capabilities() { return this.get("/v1/capabilities"); }
  safetyLimits() { return this.get("/v1/safety-limits"); }
  recalls() { return this.get("/v1/recalls"); }
  conformance() { return this.get("/v1/conformance"); }
  startExecution(request: Json, idempotencyKey?: string, humanPresent?: boolean) {
    const k = idempotencyKey ?? key(); this.lastIdempotencyKey = k;
    const body = { ...request, ...(humanPresent !== undefined ? { "x-hub-human-present": !!humanPresent } : {}) };
    return this.post("/v1/executions", body, { "Idempotency-Key": k });
  }
  getExecution(id: string) { return this.get(`/v1/executions/${id}`); }
  stopExecution(id: string, reason = "requested") { return this.post(`/v1/executions/${id}/stop`, { reason }, { "Idempotency-Key": key() }); }
  resumeExecution(id: string, seq: number | string) { return this.post(`/v1/executions/${id}/resume`, {}, { "Idempotency-Key": key(), "If-Match": String(seq) }); }
  executionLog(id: string) { return this.get(`/v1/executions/${id}/log`); }
  reportIncident(doc: Json) { return this.post("/v1/incidents", doc, { "Idempotency-Key": key() }); }
}
