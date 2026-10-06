# Releasing @cookwala/mcp

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
3. `git tag mcp-vX.Y.Z && git push origin mcp-vX.Y.Z`. The `publish-mcp` workflow tests, publishes to npm with provenance,
   logs in to the registry by HTTP proof, publishes, and checks the registry lists it.

Fallback name: if the domain proof cannot be completed, change `name` in `server.json` and `mcpName` in `package.json` to
`io.github.amado2k5/cookwala` and use `mcp-publisher login github-oidc` in the workflow. `mcpName` is inside the npm tarball,
so decide before the first publish.

Check: `curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.cookwala"`.
