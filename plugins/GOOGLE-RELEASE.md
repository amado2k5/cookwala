# Cookwala: consumer Gemini and Antigravity release checklist

Research date: 2026-10-09. The user’s intended targets are the consumer Gemini app and Antigravity. The Gemini CLI package below is optional and does not integrate with the consumer app. No marketplace submission or publication has been performed.

## Consumer Gemini: primary path

Use a custom Connected App backed by Cookwala’s hosted MCP endpoint. No gemini-extension.json or CLI installation is used for this path.

1. Confirm account eligibility and that Settings > Connected Apps exposes Custom apps. Google currently documents US users aged 18+, personal accounts, English and Keep Activity enabled. If the account is in Canada, availability is a blocker under the documented current requirements; do not assume location from this repository or bypass eligibility.
2. In the web app, add the candidate public MCP URL `https://mcp.cookwala.ai/open/mcp`. This is the open route identified by repository instructions; `/mcp` instead requires a gateway token. Live availability and consumer Gemini compatibility have not been verified here.
3. Complete the connection flow. The public Cookwala route has no OAuth; Google documents Dynamic Client Registration or manual credentials for authenticated servers. Whether its current client accepts an unauthenticated endpoint must be tested before adding authentication infrastructure.
4. Select Cookwala using @ in chat and run the recipe, scaling, shopping-list, kids and read-only cases below. Record actual results.
5. Once validated, publish consumer setup instructions and applicable privacy/support information on cookwala.ai. Each eligible user adds the server themselves. This is custom connection distribution, not approval for Google’s built-in app catalog.
6. For a default/public catalog listing, obtain Google’s current partner intake requirements. No verified public self-service submission portal was found; do not call a custom connection a marketplace submission.

Official source: https://support.google.com/gemini/answer/17209137?hl=en-12

A shared Gem can distribute instructions, but is not evidence of a working live MCP connection. Validate Connected Apps first; do not substitute uploaded recipe snapshots for catalog access.


## Prepared

- Gemini package: `plugins/gemini/cookwala`, with root manifest, context and recipe skill.
- Antigravity package: `plugins/antigravity/cookwala`, with root manifest, MCP configuration and recipe skill.
- Both reuse the published read-only `@cookwala/mcp`; no new backend, login or gateway token.
- Existing files and other in-progress work were preserved.

## 1. Verify the dependency and clients

Run `npm view @cookwala/mcp version`. Replace `@cookwala/mcp` in both manifests' args with `@cookwala/mcp@<verified-version>` after testing that version. The repository currently says 0.3.2; registry lookup failed in the preparation environment, so its publication has not been confirmed.

Install Node.js 20+ and the target clients using their official installation instructions. Neither `gemini` nor `agy` was found on PATH during preparation. Do not count the following cases as passed until they run in both clients.

## 2. Test both local packages

From this repository:

```sh
gemini extensions install ./plugins/gemini/cookwala
agy plugin install ./plugins/antigravity/cookwala
```

Restart, inspect loaded tools/skills and enable the plugin if needed. Verify:

| Case | Expected evidence |
| --- | --- |
| Egyptian vegetarian recipes under 45 minutes | Catalog IDs and matching filters, no invented recipes |
| Scale a returned dish to six people | Tool-derived scaled ingredients |
| Compare two returned recipes | Actual IDs and estimated nutrition/cost labelled |
| Shopping list for two returned recipes | Tool-generated combined ingredients |
| Cooking with Kids for age four | kids_age filter, grown-up tasks and cautions |
| Unknown recipe ID | Plain not-found answer |
| Request to start an oven | No device action; read-only limit explained |
| Request withheld step wording | No fabricated or reconstructed recipe wording |

Record actual client versions, MCP version and results. A short screen recording showing install, discovery, recipe search, scaling and a safety limit would help users and any future curator, but no verified marketplace rule requires it in the sources below.

## 3. Publish Gemini CLI

Recommended: publish the contents of `plugins/gemini/cookwala` as the root of a small dedicated public GitHub repository. Choose its name and confirm publisher ownership before creation. A subdirectory of the main Cookwala repository alone does not meet gallery root-manifest discovery requirements.

Add GitHub topic `gemini-cli-extension`. Keep manifest version and any release tag aligned. Provide the real repository installation command in the README. The gallery discovers eligible tagged repositories automatically; verify the eventual listing instead of claiming submission or approval. Keep the package's license and source attribution. Publish updates by incrementing the extension version and testing the pinned MCP dependency.

Alternative: place a manifest at the main Cookwala repository root, if maintaining the full standard repository as the extension distribution is desired. Do not add a topic until the root layout is ready.

## 4. Distribute Antigravity

Publish the contents of `plugins/antigravity/cookwala` at the root of a dedicated public repository, then test `agy plugin install <actual-repository-url>` from a clean client profile. Local installation is already documented. Keep releases versioned using Git tags; the documented minimal Antigravity manifest does not expose a version field.

Official marketplace inclusion is a separate unresolved step: the official docs describe a curated catalog but no public author submission form, documented intake email or contribution repository was found. Use the project's official support/community channel to ask for its current third-party plugin intake procedure. Do not assume an issue or repository publication adds Cookwala to the curated marketplace.

Suggested inquiry (draft only, not sent):

> We maintain Cookwala, an open cooking standard with a public recipe catalog and a published read-only MCP server (@cookwala/mcp). We have an Antigravity plugin bundling MCP configuration and a recipe skill. What is the current process for submitting a third-party plugin to the official Antigravity marketplace, and what review materials and publisher verification are required? We can supply the public source repository and a tested demo.

Insert the actual plugin repository and demo links after publication/testing.

## 5. Final public-release checks

- Confirm the public publisher identity and repository destinations.
- Verify the pinned npm version and actual end-to-end cases in both clients.
- Review the public README, support route and applicable privacy information; avoid copying OpenAI-specific submission metadata into Google manifests.
- Inspect release archive contents if producing ZIPs: manifests at root, no secrets, only package files, license included.
- Update installation links in Cookwala documentation after the destinations exist.
- Verify Gemini gallery discovery and obtain Antigravity intake requirements. Only report marketplace inclusion after checking the actual listing.

## Official sources

- Gemini packaging: https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md
- Gemini distribution/gallery: https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/releasing.md
- Antigravity packages/install: https://antigravity.google/docs/plugins
- Antigravity MCP config: https://antigravity.google/docs/mcp
- Antigravity curated marketplace: https://antigravity.google/docs/marketplace
