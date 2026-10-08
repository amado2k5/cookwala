// Read-only REST API over the Cookwala catalog, for ChatGPT Actions, Gemini and any HTTP client.
// Open (no token), GET except the two POST calculators, never writes, never starts cooking.
// Served by the Worker under /api/*. The OpenAPI document is /api/openapi.json (src/openapi.js).
import { CatalogError } from './catalog.js';
import { explainStep, listOperations, checkEnvelope, dryRun } from './core/index.js';
import { openapi } from './openapi.js';
import { NOTE, QueryError, loadQuery, recipeOp, searchOp, pantryOp, randomOp, compareOp, ingredientOp, aggregateOp, mealPlanOp, similarOp, shoppingListOp, dietRecipesOp, methodRecipesOp, listingOp } from './queries.js';

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const reply = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': status === 200 ? 'public, max-age=300' : 'no-store', ...CORS, ...extra } });
const err = (status, error, detail, extra = {}) => reply(status, { error, detail, ...extra });

const params = (url) => Object.fromEntries(url.searchParams.entries());

export async function handleApi(request, env, { catalog, version }) {
  const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, '');
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (path === '/api/openapi.json') return reply(200, openapi(version));
  if (env && env.API_LIMITER && env.API_LIMITER.limit) { // optional Cloudflare rate-limit binding; absent in tests and local runs
    const key = request.headers.get('cf-connecting-ip') || 'anon';
    const { success } = await env.API_LIMITER.limit({ key });
    if (!success) return err(429, 'rate_limited', 'too many requests; try again in a minute');
  }
  const a = params(url); const cat = catalog;
  try {
    if (request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return err(400, 'bad_json', 'the body must be JSON'); }
      if (path === '/api/dry-run') {
        if (!body.recipe_id) return err(400, 'missing_recipe', 'give recipe_id');
        const { doc } = await cat.recipe(String(body.recipe_id));
        const caps = typeof body.device === 'string' ? await cat.preset(body.device) : body.device;
        if (!caps) return err(400, 'missing_device', 'give device: a preset id from /api/devices');
        const res = dryRun(await cat.vocab(), doc, caps, { humanPresent: !!body.human_present, allowModel: body.allow_model_estimates !== false, limits: body.limits || null, now: null });
        return reply(200, { ...res, note: 'Dry run only. Nothing is executed. A plan is not proof a device can cook safely, and V0 recipes are not machine-verified.' });
      }
      if (path === '/api/check-temperature') {
        const r = checkEnvelope(await cat.vocab(), body.operation, body.readings || [], body.target || null, Number(body.altitude_m) || 0);
        return r.error ? err(400, r.error, `unknown operation ${body.operation}`) : reply(200, r);
      }
      return err(404, 'not_found', 'unknown API route');
    }
    if (request.method !== 'GET') return err(405, 'method_not_allowed', 'use GET (or POST for dry-run and check-temperature)', { allow: 'GET, POST' });

    if (path === '/api' || path === '/api/health') return reply(200, { ok: true, name: 'cookwala-api', version, readOnly: true, docs: 'https://mcp.cookwala.ai/api/openapi.json', note: NOTE });
    if (path === '/api/devices') return reply(200, await cat.presetsIndex());
    if (path === '/api/operations') return reply(200, listOperations(await cat.vocab(), a.family, a.lang || 'en'));
    if (path === '/api/explain-step') {
      if (!a.recipe_id || !a.node) return err(400, 'missing_param', 'give recipe_id and node');
      const { doc } = await cat.recipe(a.recipe_id); const r = explainStep(await cat.vocab(), doc, a.node, a.lang || 'en');
      return r.error ? err(404, r.error, 'no such step', r) : reply(200, r);
    }
    let m;
    const srcPath = /^\/api\/sources\/([^/]+)$/.exec(path);
    const ctx = await loadQuery(cat, a, { source: srcPath ? decodeURIComponent(srcPath[1]) : undefined });
    const LISTS = { '/api/facets': 'facets', '/api/languages': 'languages', '/api/countries': 'countries', '/api/categories': 'categories', '/api/sources': 'sources', '/api/methods': 'methods', '/api/diets': 'diets', '/api/diets/review': 'diet_review', '/api/ingredients': 'ingredients', '/api/certifications': 'certifications' };
    if (LISTS[path]) return reply(200, await listingOp(ctx, LISTS[path]));
    if (path === '/api/search' || srcPath) return reply(200, searchOp(ctx));
    if (path === '/api/pantry') return reply(200, pantryOp(ctx));
    if (path === '/api/random') return reply(200, randomOp(ctx), { 'cache-control': 'no-store' });
    if (path === '/api/compare') return reply(200, compareOp(ctx));
    if (path === '/api/ingredient') return reply(200, ingredientOp(ctx));
    if (path === '/api/aggregate') return reply(200, aggregateOp(ctx));
    if (path === '/api/meal-plan') return reply(200, mealPlanOp(ctx));
    if (path === '/api/shopping-list') return reply(200, await shoppingListOp(ctx));
    if ((m = /^\/api\/diets\/([^/]+)$/.exec(path))) return reply(200, dietRecipesOp(ctx, decodeURIComponent(m[1])));
    if ((m = /^\/api\/methods\/([^/]+)$/.exec(path))) return reply(200, methodRecipesOp(ctx, decodeURIComponent(m[1])));
    if ((m = /^\/api\/recipes\/([^/]+)\/similar$/.exec(path))) return reply(200, similarOp(ctx, decodeURIComponent(m[1])));
    if ((m = /^\/api\/recipes\/([^/]+)$/.exec(path))) return reply(200, await recipeOp(ctx, decodeURIComponent(m[1])));
    return err(404, 'not_found', 'unknown API route; see /api/openapi.json');
  } catch (e) {
    if (e instanceof QueryError) return err(e.status, e.code, e.detail, e.extra);
    if (e instanceof CatalogError) return err(e.code === 'not_found' ? 404 : 502, e.code, e.detail);
    return err(500, 'internal_error', String(e && e.message || e));
  }
}
