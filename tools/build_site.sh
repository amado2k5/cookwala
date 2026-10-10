#!/usr/bin/env bash
# Assemble the cookwala.ai site into a directory (default _site). Used by CI and for local previews.
#   bash tools/build_site.sh [OUT]
set -euo pipefail
OUT="${1:-_site}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf "$OUT"
mkdir -p "$OUT"/v1/{schemas,vocab,api,recipes,bindings,profiles} "$OUT"/docs/md "$OUT"/sim "$OUT"/assets
cp site/CNAME "$OUT"/
cp site/[0-9a-f]*.txt "$OUT"/   # IndexNow key file (tools/indexnow.py)
cp -R site/.well-known "$OUT"/.well-known
cp -R site/assets/. "$OUT"/assets/
cp -R site/v1/. "$OUT"/v1/
mkdir -p "$OUT"/whitepaper && [ -d site/whitepaper ] && cp -R site/whitepaper/. "$OUT"/whitepaper/ || true
cp sdk/typescript/src/dryrun.js "$OUT"/assets/dryrun.js   # single source for the browser dry run (also the TS SDK)
cp -R schemas/. "$OUT"/v1/schemas/
cp schemas/context.jsonld "$OUT"/v1/context.jsonld
cp vocab/*.json "$OUT"/v1/vocab/
cp api/* "$OUT"/v1/api/
cp -R bindings/. "$OUT"/v1/bindings/
cp examples/*.cookwala.json "$OUT"/v1/recipes/
cp -R profiles/humanitarian profiles/core profiles/mission profiles/household "$OUT"/v1/profiles/
cp -R conformance "$OUT"/v1/conformance
python3 tools/build_certifications.py "$OUT"   # /v1/certifications/{id}.json and index.json (RFC-0010), verified first
cp -R sim/index.html sim/app.js sim/style.css sim/engine sim/city sim/country sim/world "$OUT"/sim/
python3 tools/build_mcp_assets.py "$OUT"   # MCP service: device presets, fifi rights, registry manifest, browser core
python3 tools/build_query_index.py "$OUT"   # REST API index: /v1/query/recipes.json and facets.json
python3 tools/bundle_schemas.py "$OUT"/v1/schemas/bundle.json
python3 tools/site_stats.py "$OUT"/v1/stats.json > /dev/null
# scenarios: execute against a local hub (records real output) and render the code samples (scenarios/out, gitignored)
python3 tools/scenarios/run.py --keep-going > /dev/null || echo "warning: some scenarios failed; see scenarios/out/*/result.json"
python3 tools/scenarios/render.py > /dev/null
python3 tools/build_chatgpt_plugin.py --check
# pages, docs, whitepaper, essays, deck, llms.txt, sitemap (tools/build_site.py)
python3 tools/build_site.py "$OUT"
python3 tools/indexnow.py manifest "$OUT"   # page hashes, so a deploy can tell search engines which pages changed
touch "$OUT"/.nojekyll
echo "site built in $OUT ($(find "$OUT" -type f | wc -l | tr -d ' ') files)"
