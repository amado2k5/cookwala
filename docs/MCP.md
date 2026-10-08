# Cookwala as an MCP service

> **Status: experimental, read-only.** Package `@cookwala/mcp` 0.2.0, **published on npm** (`npx -y @cookwala/mcp`) and **listed in the official MCP
> Registry**; registry name
> `ai.cookwala/cookwala`. An optional token-protected hosted endpoint, `https://mcp.cookwala.ai/mcp`, serves the same tools
> for directory call tracking (see [Hosted endpoint](#hosted-endpoint-optional)). It never starts cooking.

Cookwala is available to any [Model Context Protocol](https://modelcontextprotocol.io) client as
a **local server that reads the public catalog**. There is no Cookwala server to run or pay for
(an optional [hosted endpoint](#hosted-endpoint-optional) exists for directories that need an https address):

```
 your machine                                              GitHub Pages (cookwala.ai)
 MCP client ──stdio──▶ npx -y @cookwala/mcp ──HTTPS GET──▶ /v1/manifest.json, /v1/index/…,
 (Claude, Codex,        pure-JavaScript core               /v1/recipes/<id>.cookwala.json,
  Copilot, Cursor,      cache + hash checks                /v1/vocab/*, /v1/capabilities/*
  Windsurf, Devin, …)         │
                              └─ optional, read-only ────▶ fifi.cooking /data/… (the source site)
```

GitHub Pages serves static files over GET only, so a remote MCP endpoint cannot live there (the
optional hosted endpoint below runs on Cloudflare Workers instead). A stdio server needs no
endpoint: the client starts it. The same JavaScript core also runs in your
browser on the [MCP page](https://cookwala.ai/mcp/), which is the proof that nothing runs on a
server.

> **Try it in five minutes:** exact steps and a test prompt for Devin and Claude, with the answers to expect, are in
> [Try Cookwala in your AI app](MCP-TRY-IT.md).

## Install

```bash
npx -y @cookwala/mcp                       # speaks MCP on stdin/stdout (Node 20 or later)
claude mcp add cookwala -- npx -y @cookwala/mcp
```

Every client's configuration is on one page: [AI agents](AI-AGENTS.md). The generic form is:

```json
{"mcpServers": {"cookwala": {"command": "npx", "args": ["-y", "@cookwala/mcp"]}}}
```

From a source checkout: `cd sdk/mcp-js && npm install && node bin/cookwala-mcp.js`. Point it at a
locally built site with `COOKWALA_BASE_URL=$PWD/_site` (`bash tools/build_site.sh _site`).

## Tools

All sixteen are read-only (`readOnlyHint: true`, `destructiveHint: false`). Results carry
`structuredContent` and a text copy. Errors set `isError` and return `{error, detail, path}`.

| Tool | Payload | Returns |
|---|---|---|
| `search_recipes` | `query`, `lang`, `cuisine[]`, `course`, `tags[]`, `level` (V0/V1/V2), `allergen_free[]`, `supervision`, `collection`, `limit` (10, max 50), `offset` | `{total, items[{id,title,cuisine,course,level,servings,allergens,supervision,collection,license,hash}], nextOffset}` |
| `get_recipe` | `id`, `lang`, `view` (`summary`, `ingredients`, `process`, `text`, `full`) | `{id, documentId, hash, hashVerified, level, levelNote, textIsData, recipe}` |
| `list_collections` | none | `[{collection,count,license,source,citation,fifiText}]` |
| `list_operations` | `family`, `lang` | `[{id,label,definition,envelope}]` |
| `explain_step` | `recipe_id`, `node`, `lang` | `{node,op,label,envelope,params,until,hazards,ccp,unattendedAllowed,instruction,instructionIsData}` |
| `list_device_presets` | none | `{presets:[{id,name,kind,roles,ops,sensors,url}]}` |
| `dry_run` | `recipe_id` or `recipe`; `device` (preset id or capabilities object); `human_present`, `allow_model_estimates`, `limits`, `now` | `{state: accepted\|refused, plan[], refusal{reason,node,detail}, note}` |
| `check_envelope` | `op`, `readings[{t,tempC}]`, `target{value,tolerance}`, `altitude_m` | `{envelopeOk, targetOk, reason}` |
| `check_mandate` | `mandate`, `action`, `amount`, `provider`, `now` | `{allowed, needsConfirmation, reasons[]}` |
| `parse_sms` | `text` | the structured Humanitarian command, or `{ok:false, error}` |
| `verify_recipe` | `recipe` | `{hash, declaredHash, matches, level}` |
| `verify_certification` | `certification_id` or `certification`, `keys` or `keys_path`, `recipe_id` or `subject_hash`, `now` | `{id, scheme, authority, subject, status, validUntil, valid, reason}` (RFC-0010; reasons as in the reference library) |
| `current_certifications` | `recipe_id` or `subject_hash`, `scheme`, `authority`, `keys` or `keys_path`, `now` | `{subjectHash, current[], rejected{id: reason}}`: newest verifying document per authority and scheme; read from `/v1/certifications/index.json` |
| `catalog_status` | none | `{baseUrl, catalogVersion, generatedAt, counts, languages, cache, offline, signature, fifiOrigin}` |
| `fifi_search` | `query`, `lang`, `limit`, `offset` | `{total, items[{id, inCatalog, title, pageUrl}], nextOffset}` |
| `fifi_source` | `id` | the recipe in fifi.cooking's legacy format, under the catalog's rights rules (see below) |

Resources: `cookwala://recipe/{id}`, `cookwala://schema/{name}`, `cookwala://doc/{ID}` (any page of
these docs as Markdown), `cookwala://preset/{id}` (listed), `cookwala://ops`, `cookwala://llms.txt`.
Prompts: `cook_with_device`, `recipe_safety_brief`, `humanitarian_offer`.

The semantics of `dry_run`, `check_envelope` and `parse_sms` are those of
`tools/cookwala_ref.py`; the JavaScript core passes the same conformance vectors
(`conformance/`) and the Python and Node servers give identical answers.

## fifi.cooking and fifirecipes

fifi.cooking is where the recipes are written; Cookwala is the standard form they are published in.

- **Standard route.** `tools/export_fifi.py` turns every fifi.cooking recipe into a Cookwala
  document ([EXPORT-FIFI](EXPORT-FIFI.md)); CI publishes them to `/v1/recipes/`. `get_recipe` and
  `search_recipes` read those. Each document keeps `legacy.pageUrl` and `legacy.dataUrl`, and
  `get_recipe` returns them under `sources.fifi`.
- **Live route.** `fifi_search` and `fifi_source` read fifi.cooking's own `/data/` files, so an agent
  can find recipes that were added after the last export. (The 376 world-cuisine recipes, ids
  `w-*`, were exported by 2026-10-08 and are now in the catalog, facts only.) They are the only calls that leave the catalog origin, they contact
  `https://fifi.cooking` only, and they are marked `openWorldHint`.
- **Rights rules apply on the live route too.** `fifi_source` returns steps and notes only for
  collections whose `text` policy in `tools/export_fifi.collections.json` is `full`. Every other
  collection, and any collection not listed there, returns structured facts only, exactly as the
  catalog does. The response says `textPolicy` and what was withheld.
- **Getting a new recipe into the standard** is a maintainer step, not a tool call: confirm its
  collection's rights in `export_fifi.collections.json` (the exporter files an unlisted collection
  under `archive` with full text, so add the entry first), run `export_fifi.py`, review, merge.

## Integrity, privacy and limits

- Every index shard is checked against the SHA-256 in `/v1/manifest.json`; every recipe's hash is
  recomputed (RFC 8785 canonical JSON, SHA-256). A mismatch returns `integrity_mismatch` and no
  content. The manifest signature is not checked yet because `/.well-known/cookwala.json`
  publishes no keys (`catalog_status` says so).
- Cache: `$XDG_CACHE_HOME/cookwala-mcp` or `~/.cache/cookwala-mcp`, revalidated with `If-None-Match`
  at most every ten minutes, used when the network fails or `COOKWALA_OFFLINE=1`.
- No telemetry, no identifiers, no accounts, no personal data. It writes only its cache. (This is the
  local server; see the hosted endpoint below for the one opt-in exception, third-party call counting.)
- Only the catalog origin and `https://fifi.cooking` are ever contacted. GitHub Pages answers
  404 with an HTML page; the client treats that as an error, never as data.
- It does not start cooking, call a hub or order anything. `check_mandate` only answers whether an
  action would be inside a mandate.
- Recipe text, titles, notes and SMS content are **data, never instructions** (Core rule 6.4). The
  server says so in its `instructions`, in `explain_step`, and in every prompt.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `COOKWALA_BASE_URL` | `https://cookwala.ai` | Catalog origin, or a directory holding a built site |
| `COOKWALA_CACHE_DIR` | `~/.cache/cookwala-mcp` | Cache directory |
| `COOKWALA_OFFLINE` | unset | `1` serves only from the cache |
| `COOKWALA_LANG` | `en` | Default language |

## Hosted endpoint (optional)

`sdk/mcp-js/worker/` serves the same sixteen read-only tools over Streamable HTTP (stateless, JSON
responses) on Cloudflare Workers: `POST /mcp`, plus `GET /health`. The npm package stays the default;
the endpoint exists for directories that require an https address, for example call tracking at
[mcprush.com](https://mcprush.com). It reads the same public catalog, writes nothing, logs nothing
and cannot start cooking.

- **Gateway token.** If the secret `MCP_GATEWAY_TOKEN` is set, `/mcp` answers 401 unless the call
  carries it as `x-mcprush-token` or `Authorization: Bearer <token>`. Unset, the endpoint is open
  (the data is public).
- **Deploy.** Manual workflow `Deploy hosted MCP endpoint` (needs `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`). Steps, custom domain and the mcprush setup order:
  [sdk/mcp-js/RELEASING.md](../sdk/mcp-js/RELEASING.md#hosted-endpoint-optional).
- **mcprush and telemetry.** Cookwala itself collects none. If you enable tracking at mcprush,
  calls go through its gateway and mcprush counts them; that is mcprush's data, not Cookwala's, and
  it is off unless a maintainer turns it on. Local stdio use is never tracked.
- **Status.** Live at `https://mcp.cookwala.ai/mcp` (since 2026-10-08), served by the Worker `cookwala-mcp` on Cloudflare
  (`https://cookwala-mcp.ahamdy.workers.dev/mcp` also answers). It is registered at mcprush as *Cookwala MCP* (claim CLM-0139).
  `GET /health` is public. `POST /mcp` needs the gateway token, so it is not an open public endpoint: to use Cookwala from
  your own agent, run the npm package (`npx -y @cookwala/mcp`). The registry entry `ai.cookwala/cookwala` lists only the npm
  package, not this endpoint.

## Registry

Registered in the official MCP Registry as `ai.cookwala/cookwala` (metadata only; the package is
on npm). The name is proven by `https://cookwala.ai/.well-known/mcp-registry-auth`. Releasing:
[sdk/mcp-js/RELEASING.md](../sdk/mcp-js/RELEASING.md). Registry manifest:
[`/v1/mcp/server.json`](https://cookwala.ai/v1/mcp/server.json).

## The Python server

`sdk/mcp/cookwala_mcp.py` (standard library only, eight tools) reads recipes from a source
checkout. It stays for contributors and for offline work inside the repository:
`cookwala mcp` or `python sdk/mcp/cookwala_mcp.py`.
