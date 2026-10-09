# Cookwala as a ChatGPT plugin

OpenAI is retiring Custom GPTs (reported for 11 December 2026) and replacing them with **plugins**: skills (instructions and reference files),
connected apps, and optional MCP tools. Custom Actions do not carry over, so Cookwala ships as a plugin whose tools come from its open MCP server.
Sources: [Build plugins](https://learn.chatgpt.com/docs/build-plugins), [Package your plugin](https://developers.openai.com/plugins/build/plugins),
[Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission), [Remote MCP server review requirements](https://developers.openai.com/plugins/deploy/app-review),
[Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines). The older [Custom GPT recipe](CUSTOM-GPT.md) still works until the retirement date.

## What is in the repository

`plugins/chatgpt/cookwala/` is the whole package, in OpenAI's portable "Agent Plugins" layout:

| File | What it is |
|---|---|
| `plugin.json` | Name, version, listing text, URLs, brand, icons, the 5 positive and 3 negative review test cases |
| `mcp.json` | Exactly one server: `https://mcp.cookwala.ai/open/mcp` (streamable HTTP, no sign-in, read-only) |
| `skills/cookwala/SKILL.md` | The workflow and honesty rules (the Custom GPT instructions, rewritten for the MCP tools) |
| `skills/cookwala/references/filters.md` | Everyday words mapped to `query_recipes` filters |
| `skills/get-started/SKILL.md` | The onboarding skill |
| `assets/` | Logo and composer icon, light and dark (SVG, square) |

No `.app.json`, hooks, credentials or screenshots are included (ZIPs with apps or hooks cannot be submitted; the Directory no longer shows screenshots).

```bash
python tools/build_chatgpt_plugin.py            # validates every documented limit, writes build/cookwala-chatgpt-plugin-<version>.zip
python tools/build_chatgpt_plugin.py --check    # validate only; runs in tools/build_site.sh
python tools/build_chatgpt_plugin.py --final    # also fails until review.demo_recording_url is filled in
```

Version 1.0.2 (before the first submission): tool definitions gained output schemas, parameter descriptions, status text
and an explicit `noauth` declaration, `get_recipe` and friends answer a missing id in plain words, and the skill description
is narrower ("when the person asks for recipes, meal plans or shopping lists from the Cookwala catalog"). Tool definitions
changed, so the hosted endpoint must be deployed before the portal Rescan shows them.

## Why the server needs no changes for the review

- Every tool declares `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true` and a `title`; `openWorldHint` is `false` except on `fifi_search` and `fifi_source`, which fetch live from https://fifi.cooking and are `true` (the other tools read the fixed catalog). OpenAI's scan imports these and a submission justification cannot override them.
- No sign-in: reviewers need no account. Responses carry no personal data, session ids or logs.
- The privacy policy ([/privacy/](https://cookwala.ai/privacy/)), terms ([/terms/](https://cookwala.ai/terms/)), support contact ([/contribute/](https://cookwala.ai/contribute/#contact)) and website ([/assistants/](https://cookwala.ai/assistants/)) are public.
- The MCP **origin cannot change** between versions (`https://mcp.cookwala.ai`); only the path may. Do not move the endpoint to another host after publishing.
- OpenAI rescans the server daily. New tools stay unavailable until approved; changed tools keep their old definition until the update passes. Keep existing input schemas working.

## Steps to publish

Things only the account owner can do are marked **You**.

1. **You:** in the OpenAI Platform dashboard, complete individual or business verification. The listing name (`developerName`, "Cookwala") should match the verified identity; edit `plugin.json` if it differs. Submitting needs the `api.apps.write` permission (organization owners have it). Projects with EU data residency cannot submit; use a global-residency project.
2. Run `python tools/build_chatgpt_plugin.py` and take the ZIP from `build/`.
3. **You:** Plugins, Upload new or existing plugin, choose the developer identity, upload the ZIP. Fix validation errors by editing the package and uploading again. The category must be one of OpenAI's fixed titles (there is no food category, so the plugin uses `Other`); the validator enforces the list.
4. **You:** MCPs, Connect. The server URL comes from `mcp.json`; authentication is none. The portal then shows a **domain-verification token**. Publish it as plain text, and only the token, at `https://mcp.cookwala.ai/.well-known/openai-apps-challenge` (or on the parent `https://cookwala.ai/.well-known/openai-apps-challenge`, which is a file in `site/.well-known/` served by GitHub Pages). Give the token to the agent or commit the file, wait for the site to publish, then Connect and let the tool scan run. Resolve any issue it lists, then Rescan.
5. **You:** record a short demo video that walks through the 5 positive and 3 negative cases (they are in `plugin.json`), host it where reviewers can open it, put the URL in `review.demo_recording_url`, run `--final`, rebuild the ZIP and upload it again ("Upload plugin to fix issues").
6. **You:** run each positive case in ChatGPT yourself (after installing the draft) on desktop and mobile; output must match `expected_behavior` with no errors.
7. **You:** Submit for review, accept the policy attestations, track the status and the emails. Only one review is active at a time. After approval choose Publish plugin.

## Updating later

- Server-only changes that keep the published contract go live with the daily scan, with no new ZIP. Redeploy the Worker, then Rescan to speed it up.
- Changes to listing text, icons or skills need a new version in `plugin.json`, a new ZIP, review and Publish.
- After editing a skill that names tools, deploy the server and rescan before submitting.

## Reinstalling in the ChatGPT desktop app (observed 2026-10-08, not documented by OpenAI)

"Add, Upload plugin archive" in the ChatGPT desktop app (Customize, Plugins) installs a ZIP of this package for testing. After a plugin is uninstalled, a ZIP with the **same
`name` in `plugin.json`** failed every time with "Couldn't add plugin. Try again.", whatever it contained: the original `cookwala`, and later a test copy named `cookwala-test`, both failed
once they had been installed and removed. The identical content under a never-used `name` installed straight away, so the installer seems to remember a removed plugin's name, on OpenAI's side
(there was no trace on the Mac). The ZIP's **file name does not matter**, only `name` inside `plugin.json`; the listing shows `interface.displayName` ("Cookwala").

- To record a fresh install, build the package with a new `name` (for example `cookwala-demo-b`) and do not uninstall it afterwards.
- Do not use the name `cookwala` for ad-hoc tests: it may now be unusable in that installer. The review submission in the developer portal is a different route and may behave differently.
- If an upload fails, change `name` and try once more before suspecting the contents. The local validator (`python tools/build_chatgpt_plugin.py --check`) does not know about this behaviour.

## Known risks and decisions

- **Health content.** The guidelines have no dedicated rule for allergy, diet or diabetes information, but results must be accurate and relevant and plugins may not collect protected health information. Cookwala collects none; the labels are screens, worded as "no allergen found" and "diabetic-friendly estimate", with advice to read labels and consult a clinician. The thresholds are not dietitian-reviewed.
- **Age rating.** Plugins must suit ages 13 to 17. Recipes with alcohol are filtered by `alcohol_free` but not removed; review if a reviewer objects.
- **Wording.** No pricing, comparisons or unverifiable claims in the listing text. The long description avoids numbers it cannot back with the live catalog ("more than 2,000 recipes").
- **Unverified details.** Review times are not in the public documentation. The validator checks every limit that is documented, including the category list and the shape of the review test cases.
