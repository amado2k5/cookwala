// Hosted MCP endpoint (Streamable HTTP, stateless) for Cloudflare Workers or any Fetch-API runtime.
// Same read-only tools as the stdio server. Writes nothing, logs nothing, starts no cooking.
// If env.MCP_GATEWAY_TOKEN is set, every /mcp call must carry it as x-mcprush-token or Authorization: Bearer.
// /open/mcp serves the same tools with no token (for chat apps that cannot send headers). The data is public and read-only.
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer, VERSION } from './server.js';
import { Catalog } from './catalog.js';
import { handleApi } from './api.js';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });

// Constant-time comparison of two strings (hashes first so the length does not leak).
async function sameSecret(a, b) {
  const h = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

export async function authorized(request, env) {
  const want = env && env.MCP_GATEWAY_TOKEN;
  if (!want) return true;
  const bearer = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  const got = request.headers.get('x-mcprush-token') || (bearer && bearer[1]) || '';
  return got !== '' && sameSecret(got, want);
}

export async function handleRequest(request, env = {}, opts = {}) {
  const url = new URL(request.url);
  if (url.pathname === '/health') return json(200, { ok: true, name: 'cookwala', version: opts.version || VERSION, readOnly: true });
  // The bare domain doubles as the open endpoint for POST, so a chat app only needs https://mcp.cookwala.ai
  if (url.pathname === '/' && request.method !== 'POST') return json(200, { name: 'cookwala', endpoint: '/mcp', openEndpoint: '/open/mcp', api: '/api/openapi.json', docs: 'https://cookwala.ai/mcp/', transport: 'streamable-http', readOnly: true });
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    const catalog = opts.catalog || new Catalog({ diskCache: false, baseUrl: env.COOKWALA_BASE_URL, offline: false, lang: 'en' });
    return handleApi(request, env, { catalog, version: opts.version || VERSION });
  }
  const open = url.pathname === '/open/mcp' || url.pathname === '/';
  if (url.pathname !== '/mcp' && !open) return json(404, { error: 'not_found' });
  if (!open && !(await authorized(request, env))) return json(401, { error: 'unauthorized' }, { 'www-authenticate': 'Bearer' });
  // Stateless server: no sessions, no server-initiated stream, so only POST is meaningful.
  if (request.method !== 'POST') return json(405, { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed: POST JSON-RPC to /mcp' }, id: null }, { allow: 'POST' });

  const catalog = opts.catalog || new Catalog({ diskCache: false, baseUrl: env.COOKWALA_BASE_URL, offline: false, lang: 'en' });
  const { server } = createServer({ catalog, version: opts.version });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request);
}
