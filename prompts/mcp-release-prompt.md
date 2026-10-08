> **Historical: executed on 2026-10-06.** `@cookwala/mcp` is published on npm and listed in the MCP Registry; the
> domain proof and secrets exist. Do not run this prompt again. For the next release follow `sdk/mcp-js/RELEASING.md`.

# Release the Cookwala MCP server: one prompt for Claude desktop (or Devin)

Written 2026-10-06. Everything is already built, tested and merged to `main` of `amado2k5/cookwala`.
What is left is release plumbing that needs your accounts. Part A is what only you can do. Part B is the prompt
to paste into **Claude desktop (Code tab, local session)**. Prefer Claude desktop over Devin: the private key
stays on your own machine. If you use Devin, do Part A step 3 yourself and never let the key enter Devin's session.

## Part A: what only you can do

Do these first, from a Mac or desktop with a terminal. Nothing here can be delegated.

1. **Tools on your machine.** Node 20 or later, `git`, `openssl`, `curl`, and the GitHub CLI `gh`.
2. **Log in to GitHub as a repository admin.** Run `gh auth login`, choose GitHub.com, HTTPS, browser. The account
   needs admin rights on `amado2k5/cookwala` (to set secrets and push tags). If `main` is protected, either allow your
   account to push to it, or tell the agent to open a pull request for the one proof-file commit and you merge it.
3. **npm account and scope.** Sign in at npmjs.com (2FA on). Confirm you own the `@cookwala` organization or user
   scope (`npm login`, then `npm access list packages @cookwala` or look at the org page). It already publishes
   `@cookwala/samples`, so it should exist.
4. **npm publish token for CI.** The workflow publishes with the secret `NPM_TOKEN`. In npmjs.com, Access Tokens,
   Generate New Token, Granular: permission Read and write, scope all packages under `@cookwala` (a new package is not
   covered by a token limited to existing packages), "bypass two-factor authentication" ticked for automation, expiry
   as you like. If the existing `NPM_TOKEN` already meets that, keep it. If you made a new one, give it to the agent
   only through `gh secret set NPM_TOKEN` in your own terminal, never in chat.
5. **Decide the registry name.** Default and recommended: `ai.cookwala/cookwala`, proven by a file on cookwala.ai, so
   it needs no DNS change. Fallback if that fails: `io.github.amado2k5/cookwala`. The name is baked into the npm
   package, so decide before the first publish.
6. **Approve when the agent asks.** It will pause before: pushing to `main`, setting repository secrets, pushing the
   release tag. A tag cannot be taken back from npm (a published version is permanent), so read that prompt.
7. **Optional, your call:** the 376 world recipes are published facts-only. To publish their steps, confirm the source
   rights and say so; that is a separate change.

Things that are not needed: a DNS record, a domain transfer, paid hosting, a registry account (the MCP Registry has
none; the key proves the name).

## Part B: the prompt (copy everything between the lines)

------------------------------------------------------------------------------------------

You are releasing the Cookwala MCP server. Work on my machine in a clone of `https://github.com/amado2k5/cookwala`
(clone to `~/cookwala-release` if it is not there; use `main`). I am present and will approve the steps marked ASK.
Be terse, show command output for every check, and stop at the first failure with the exact error and your diagnosis.

## What already exists (do not rebuild)
- `sdk/mcp-js/`: the npm package `@cookwala/mcp` 0.1.0, `mcpName` `ai.cookwala/cookwala`, 14 read-only tools, stdio.
  `npm test` passes 15 tests. `sdk/mcp-js/server.json` is the registry manifest. `sdk/mcp-js/RELEASING.md` is the runbook.
- `.github/workflows/publish-mcp.yml`: on a tag `mcp-v*` it tests, checks versions, checks that
  `https://cookwala.ai/.well-known/mcp-registry-auth` is live, publishes to npm with provenance (secret `NPM_TOKEN`),
  installs `mcp-publisher`, logs in with `mcp-publisher login http --domain cookwala.ai --private-key "$MCP_PRIVATE_KEY"`,
  publishes, and confirms the registry lists `ai.cookwala/cookwala`.
- The site deploys to GitHub Pages from `main` (workflow "Validate and publish cookwala.ai"). The page
  https://cookwala.ai/mcp/ and the guide https://cookwala.ai/docs/AI-AGENTS/ are live. The package is NOT on npm yet,
  and `site/.well-known/mcp-registry-auth` does not exist yet.

## Hard rules
1. Never print, paste, log, commit or send the private key anywhere except directly into `gh secret set`. Keep it in a
   file under `~/.cookwala-release/` (mode 600), never inside the repository. Delete it when done.
2. Never commit `key.pem`, tokens or `.env` files. Run `git status` before every commit and show it to me.
3. ASK before: pushing to `main`, setting a repository secret, pushing the release tag, anything that publishes.
4. Do not change package code, tests, workflows or recipes unless a step below fails because of them; if so, show me the
   diff and ASK.
5. Do not delete or move tags, force-push, or skip a failing check.

## Steps
1. **Preflight.** Show `node -v` (need 20+), `gh auth status`, `git status`, `git log --oneline -3`. Run
   `cd sdk/mcp-js && npm ci && npm test` (expect 15 pass). Run `python3 tools/build_mcp_assets.py /tmp/cw-assets`
   (expect it to print "server ai.cookwala/cookwala 0.1.0"). Check the name is free:
   `npm view @cookwala/mcp version` should say 404 (not found). If it already exists, stop and report.
2. **Check secrets exist.** `gh secret list -R amado2k5/cookwala`. Report whether `NPM_TOKEN` and `MCP_PRIVATE_KEY` are
   present. If `NPM_TOKEN` is missing, tell me to run `gh secret set NPM_TOKEN -R amado2k5/cookwala` in my own terminal
   and wait.
3. **Make the registry key (local only).**
   ```bash
   mkdir -p ~/.cookwala-release && chmod 700 ~/.cookwala-release && cd ~/.cookwala-release
   openssl genpkey -algorithm Ed25519 -out key.pem && chmod 600 key.pem
   PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
   echo "v=MCPv1; k=ed25519; p=${PUBLIC_KEY}" > mcp-registry-auth
   openssl pkey -in key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n' > priv.hex
   ```
   Check `priv.hex` is exactly 64 hex characters (`wc -c` gives 64). Do not display its contents.
4. **ASK, then set the secret.** `gh secret set MCP_PRIVATE_KEY -R amado2k5/cookwala < ~/.cookwala-release/priv.hex`.
   Confirm with `gh secret list`. Then `shred -u priv.hex` (macOS: `rm -P priv.hex`). Keep `key.pem` until the release has
   succeeded, as a backup, then delete it and tell me.
5. **Commit the public proof.** Copy `~/.cookwala-release/mcp-registry-auth` to
   `site/.well-known/mcp-registry-auth` in the repo (one line, starts with `v=MCPv1; k=ed25519; p=`). `git status` must show
   only that file. ASK, then commit "site: publish the MCP registry domain proof" and push to `main` (if `main` is
   protected, push a branch `release/mcp-proof`, open a PR with `gh pr create`, and wait for me to merge).
6. **Wait for Pages.** Poll the deploy: `gh run list -R amado2k5/cookwala --workflow pages.yml --limit 1`, then
   `gh run watch <id>`. When it succeeds, check
   `curl -fsS https://cookwala.ai/.well-known/mcp-registry-auth` prints exactly the line you committed. GitHub Pages can
   take a minute after the run; retry for up to 5 minutes. If it still fails, stop and diagnose (Pages settings, custom
   domain, `.well-known` copied by `tools/build_site.sh`).
7. **Dry-check the package.** `cd sdk/mcp-js && npm pack --dry-run` (expect under 300 KB, contains `bin/cookwala-mcp.js`
   and `server.json`). Run the stdio smoke test from the repo README of the package: send `initialize` and `tools/list`
   to `node bin/cookwala-mcp.js` with `COOKWALA_BASE_URL=https://cookwala.ai`; expect 14 tools.
8. **ASK, then release.** Show me the version (`0.1.0`) and the registry name, then:
   `git tag mcp-v0.1.0 && git push origin mcp-v0.1.0`. Watch it: `gh run watch` on the "Publish MCP server" run.
   If a step fails, show the log tail (`gh run view --log-failed`) and diagnose before doing anything else. Typical causes:
   | Failure | Cause | Fix |
   |---|---|---|
   | npm 403 / E404 on publish | `NPM_TOKEN` cannot create a new package under `@cookwala` | I regenerate a granular token covering the scope (Part A step 4); re-run the failed job with `gh run rerun --failed` |
   | "domain proof is not live" | step 6 not finished | wait, re-run |
   | registry login fails | wrong key in the secret, or the proof line differs | compare the public key derived from `key.pem` with the live file; reset the secret from `key.pem` |
   | registry "package validation failed" | `mcpName` mismatch or package not yet visible on npm | check `npm view @cookwala/mcp@0.1.0 mcpName`; wait a minute; re-run |
   | "You do not have permission to publish this server" | namespace proof mismatch | confirm the name is `ai.cookwala/cookwala` and the proof is served from `cookwala.ai` exactly |
   If the domain proof cannot be made to work, ASK me before switching to the fallback name
   `io.github.amado2k5/cookwala` (change `name` in `sdk/mcp-js/server.json` and `mcpName` in `package.json`, bump to 0.1.1
   because 0.1.0 may already be on npm with the old name, use `mcp-publisher login github-oidc` in the workflow, and
   add `id-token: write` which it already has).
9. **Verify end to end, with evidence for each:**
   - `npm view @cookwala/mcp version dist.tarball` shows 0.1.0.
   - `curl -fsS "https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.cookwala"` lists `ai.cookwala/cookwala`.
   - From a clean temp directory with an empty npm cache (`npm_config_cache=$(mktemp -d)`): run
     `npx -y @cookwala/mcp` with the MCP smoke test (initialize, tools/list, then tools/call `search_recipes` with
     `{"query":"ramen","cuisine":["CN"]}` and `get_recipe` for `w-cn-001`); expect 14 tools, a hit, and `hashVerified: true`.
   - `claude mcp add cookwala -- npx -y @cookwala/mcp` then `claude mcp list` shows it connected (skip if the `claude`
     CLI is not installed; say so).
   - Open https://cookwala.ai/mcp/ and run each playground form once (headless browser is fine); expect no console errors.
   - Check whether the server appears at https://github.com/mcp (it can lag a day; if absent, report and do not
     improvise a submission).
10. **Clean up and report.** Delete `~/.cookwala-release/key.pem` only after step 9 passes, and tell me you did. Update the
    docs status line only if I ask. Report, in under 15 lines: what succeeded with the evidence, the commit and tag, the
    workflow run URL, anything that failed or was skipped and why, and what I must still do by hand.

## If something is ambiguous
Prefer the safe, reversible option and ask. Do not guess account names, token scopes or domains.

------------------------------------------------------------------------------------------

## After the release (nothing for the AI to do)

- Bookmark the registry listing: `https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.cookwala`.
- Every later release: bump the version in `sdk/mcp-js/package.json` and both places in `server.json`, tag `mcp-vX.Y.Z`.
- Keep `MCP_PRIVATE_KEY` and a backup of `key.pem` somewhere private; losing both means generating a new key and
  replacing the proof file, which is harmless but needs another commit.
