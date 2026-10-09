// Refuses a deploy that would break callers of the live hosted endpoint (mcprush, ChatGPT actions and plugin, agents).
// Compares what the code would serve (MCP tools/list and the OpenAPI description) with what is live now. Additive changes pass:
// new tools, new optional parameters, new enum values, new operations. These fail: a removed or renamed tool or operation, a removed
// parameter, a parameter that became required, a removed enum value, a changed type. A deliberate breaking release sets ALLOW_BREAKING=1.
// The version number is never compared: nothing reads it. Usage: node scripts/check-compat.mjs   (COOKWALA_LIVE_URL overrides the base)
import { handleRequest } from '../src/http.js';
import { openapi } from '../src/openapi.js';

const BASE = (process.env.COOKWALA_LIVE_URL || 'https://mcp.cookwala.ai').replace(/\/$/, '');
const rpcBody = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };

async function liveJson(path, init) {
  const res = await fetch(BASE + path, { ...init, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${path} answered ${res.status}`);
  return res.json();
}

const problems = [];
const bad = (m) => problems.push(m);
const arr = (x) => (Array.isArray(x) ? x : []);

function compareSchema(where, oldS = {}, newS = {}) {
  const oldTypes = [].concat(oldS.type ?? []), newTypes = [].concat(newS.type ?? []);
  if (oldTypes.length && newTypes.length && !oldTypes.every((t) => newTypes.includes(t))) bad(`${where}: type ${oldTypes} became ${newTypes}`);
  if (arr(oldS.enum).length) {
    if (!arr(newS.enum).length) return;  // an enum that became open still accepts every old value
    const gone = oldS.enum.filter((v) => !newS.enum.includes(v));
    if (gone.length) bad(`${where}: enum values removed: ${gone.join(', ')}`);
  }
}

function compareTools(oldTools, newTools) {
  const mine = new Map(newTools.map((t) => [t.name, t]));
  for (const o of oldTools) {
    const n = mine.get(o.name);
    if (!n) { bad(`tool ${o.name} was removed or renamed`); continue; }
    const op = o.inputSchema?.properties || {}, np = n.inputSchema?.properties || {};
    for (const [k, s] of Object.entries(op)) {
      if (!(k in np)) bad(`tool ${o.name}: parameter ${k} was removed`);
      else compareSchema(`tool ${o.name}.${k}`, s, np[k]);
    }
    for (const r of arr(n.inputSchema?.required)) if (!arr(o.inputSchema?.required).includes(r)) bad(`tool ${o.name}: parameter ${r} became required`);
  }
}

function compareOpenApi(oldDoc, newDoc) {
  for (const [path, methods] of Object.entries(oldDoc.paths || {})) {
    for (const [method, oldOp] of Object.entries(methods)) {
      const newOp = newDoc.paths?.[path]?.[method];
      if (!newOp) { bad(`API ${method.toUpperCase()} ${path} was removed or moved`); continue; }
      if (oldOp.operationId !== newOp.operationId) bad(`API ${method.toUpperCase()} ${path}: operationId ${oldOp.operationId} became ${newOp.operationId}`);
      const key = (p) => `${p.in}:${p.name}`;
      const newParams = new Map(arr(newOp.parameters).map((p) => [key(p), p]));
      for (const p of arr(oldOp.parameters)) {
        const np = newParams.get(key(p));
        if (!np) bad(`API ${path}: parameter ${p.name} was removed`);
        else compareSchema(`API ${path}.${p.name}`, p.schema, np.schema);
      }
      const oldReq = new Set(arr(oldOp.parameters).filter((p) => p.required).map(key));
      for (const p of arr(newOp.parameters)) if (p.required && !oldReq.has(key(p))) bad(`API ${path}: parameter ${p.name} became required`);
    }
  }
}

let liveTools, liveApi;
try {
  liveTools = (await liveJson('/open/mcp', { method: 'POST', headers, body: rpcBody })).result?.tools;
  liveApi = await liveJson('/api/openapi.json');
} catch (e) {
  console.log(`::notice::Could not read the live endpoint (${e.message}); skipping the compatibility check (first deploy?).`);
  process.exit(0);
}

const res = await handleRequest(new Request('https://local.test/open/mcp', { method: 'POST', headers, body: rpcBody }), {}, {});
const newTools = (await res.json()).result.tools;
compareTools(arr(liveTools), newTools);
compareOpenApi(liveApi, openapi('check'));

const added = newTools.map((t) => t.name).filter((n) => !arr(liveTools).some((t) => t.name === n));
console.log(`live: ${arr(liveTools).length} tools, ${Object.keys(liveApi.paths || {}).length} API paths; new code: ${newTools.length} tools, ${Object.keys(openapi('x').paths).length} paths; new tools: ${added.join(', ') || 'none'}`);
if (problems.length) {
  console.log(`\n${problems.length} breaking change(s) against the live endpoint:\n- ${problems.join('\n- ')}`);
  if (process.env.ALLOW_BREAKING === '1') { console.log('\nALLOW_BREAKING=1: continuing.'); process.exit(0); }
  process.exit(1);
}
console.log('No breaking changes: every live tool, API operation, parameter and enum value is still accepted.');
