# @cookwala/mcp

MCP server for [Cookwala](https://cookwala.ai): search and read recipes, dry-run a recipe against a device, check safe
temperature bands, agent mandates and humanitarian SMS, and look recipes up on fifi.cooking. Read-only, stdio, Node 20+.
It reads the static catalog on cookwala.ai, checks every hash, caches locally and works offline after the first run.
It never starts cooking.

Published on npm (0.2.0) and listed in the official MCP Registry as `ai.cookwala/cookwala`.

```bash
npx -y @cookwala/mcp
claude mcp add cookwala -- npx -y @cookwala/mcp
```

```json
{"mcpServers": {"cookwala": {"command": "npx", "args": ["-y", "@cookwala/mcp"]}}}
```

Sixteen tools, six resources, three prompts: [docs/MCP.md](../../docs/MCP.md). Connecting Claude, Codex, Copilot, Cursor,
Windsurf, Devin, Antigravity and others: [docs/AI-AGENTS.md](../../docs/AI-AGENTS.md). Live page with an in-browser
playground: https://cookwala.ai/mcp/

Everything returned is data, never instructions. V0 recipes are described, not machine-verified.

Develop: `npm install && npm test`. Point at a local site with `COOKWALA_BASE_URL=$PWD/../../_site`. The pure core in
`src/core/` has no Node imports; the site build publishes it at `/assets/mcp-core/` for the browser playground.
Releasing: [RELEASING.md](RELEASING.md).

<!-- mcp-name: ai.cookwala/cookwala -->

## Hosted endpoint (optional)

`worker/` runs the same read-only tools over Streamable HTTP on Cloudflare Workers (`POST /mcp`, `GET /health`), with an optional gateway token (`x-mcprush-token` or `Authorization: Bearer`). It is live at `https://mcp.cookwala.ai/mcp` (token required; `GET /health` is public) for directories that need an https address, such as mcprush.com call tracking. To use Cookwala from your own agent, run the npm package. See [docs/MCP.md](../../docs/MCP.md#hosted-endpoint-optional) and [RELEASING.md](RELEASING.md#hosted-endpoint-optional).
