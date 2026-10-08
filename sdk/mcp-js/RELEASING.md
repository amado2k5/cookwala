# Releasing @cookwala/mcp

## Status: set up and published

The one-time setup below is **done** (2026-10-06). Do not redo it unless you are rotating the key.

| Version | Date | npm | MCP Registry |
|---|---|---|---|
| 0.1.0 | 2026-10-06 | published | listed as `ai.cookwala/cookwala` |
| 0.2.0 | 2026-10-07 | published, with provenance | listed (adds `verify_certification`, `current_certifications`; fail-closed timestamps) |

- The domain proof is live at https://cookwala.ai/.well-known/mcp-registry-auth. The key was regenerated once, a few
  minutes after the 0.1.0 release; the `MCP_PRIVATE_KEY` secret matches the current line (the 0.2.0 login succeeded).
- If you rotate the key, change the published line and the secret together, then confirm with a release run.
- npm takes a short while to serve a new version; the workflow waits for it before registering. A registry
  "package not found" right after publishing means it did not wait long enough, not that publishing failed.


## Hosted endpoint status

| What | State |
|---|---|
| `https://mcp.cookwala.ai/mcp` (Cloudflare Worker `cookwala-mcp`) | live since 2026-10-08; custom domain attached in the Cloudflare dashboard (Worker, Settings, Domains and Routes) |
| mcprush listing | claimed as [*Cookwala MCP*](https://mcprush.com/cookwala/cookwala-mcp), reference CLM-0139; its endpoint check passes |
| Token | mcprush's token is stored as repository secret `MCP_GATEWAY_TOKEN`; the Worker answers 401 to `/mcp` without it |
| Not changed | `server.json` lists only the npm package: the hosted endpoint is token-protected, so it is not a public `remotes` entry |

Setup and operation: see "Hosted endpoint (optional)" at the end of this file.

One-time setup (maintainer):

1. **Registry name proof.** Generate an Ed25519 key, publish the public line, keep the private key as a secret:
   ```bash
   openssl genpkey -algorithm Ed25519 -out key.pem
   PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
   echo "v=MCPv1; k=ed25519; p=${PUBLIC_KEY}" > site/.well-known/mcp-registry-auth   # commit this file
   openssl pkey -in key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n'  # the value for MCP_PRIVATE_KEY
   ```
   Add the printed hex as the repository secret `MCP_PRIVATE_KEY`, then delete `key.pem`.
2. **npm.** `NPM_TOKEN` must be allowed to publish under the `@cookwala` scope (it already publishes `@cookwala/samples`).
3. Merge; wait for Pages to serve `https://cookwala.ai/.well-known/mcp-registry-auth`.

Each release:

1. Bump `version` in `package.json` and both places in `server.json` (`python tools/build_mcp_assets.py /tmp/x` fails if they disagree).
2. `cd sdk/mcp-js && npm ci && npm test`.
3. `git tag mcp-vX.Y.Z && git push origin mcp-vX.Y.Z`, **or** run the `publish-mcp` workflow by hand on `main`
   (GitHub, Actions, "Publish MCP server", "Run workflow"; agent sessions that cannot push tags use this). The workflow
   tests, publishes to npm with provenance (skipped if that version is already on npm), waits until npm serves it, logs in
   to the registry by HTTP proof, publishes, and checks the registry lists it.
4. Update the table at the top of this file.

Fallback name: if the domain proof cannot be completed, change `name` in `server.json` and `mcpName` in `package.json` to
`io.github.amado2k5/cookwala` and use `mcp-publisher login github-oidc` in the workflow. `mcpName` is inside the npm tarball,
so decide before the first publish.

Check: `curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.cookwala"`.

## Hosted endpoint (optional)

`worker/` serves the same 24 read-only tools over Streamable HTTP (stateless, JSON responses) at `/mcp`, with `/health` unauthenticated.
It exists for directories that need an https address (for example mcprush call tracking). The npm package stays the default, and the
Worker logs nothing and stores nothing.

1. Cloudflare: create an API token with *Workers Scripts: Edit*; add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
2. Add the repository variable (not a secret) `CF_WORKERS_SUBDOMAIN` with your workers.dev subdomain (`ahamdy`), or `MCP_URL` with the full
   base URL; the workflow's last step uses it for the health check and only prints a notice when neither is set.
3. Run the `Deploy hosted MCP endpoint` workflow (Actions, "Run workflow" on `main`). It prints nothing secret; the endpoint is
   `https://cookwala-mcp.<your-subdomain>.workers.dev/mcp`.
4. Custom name (done for `mcp.cookwala.ai`): with `cookwala.ai` on Cloudflare, open the Worker, Settings, Domains and Routes, Add,
   Custom domain. Cloudflare creates the DNS record and certificate; delete any existing `mcp` record first (one that pointed at
   GitHub Pages made the name answer 404). Alternatively uncomment `routes` in `worker/wrangler.toml`. A GitHub Pages apex cannot be
   proxied by a Worker; use a subdomain.
5. Gateway token: add the token the directory gives you as repository secret `MCP_GATEWAY_TOKEN` (mcprush calls it `MCPRUSH_TOKEN`; the
   Worker reads `MCP_GATEWAY_TOKEN`) and re-run the workflow, which copies it into the Worker. `/mcp` then answers 401 unless the call
   carries it as `x-mcprush-token` or `Authorization: Bearer`. Rotating it means changing the secret and re-running the workflow.
6. Check: `curl https://<endpoint>/health`, then POST `{"jsonrpc":"2.0","id":1,"method":"tools/list"}` to `/mcp`.

Local: `npx wrangler dev -c worker/wrangler.toml`.
