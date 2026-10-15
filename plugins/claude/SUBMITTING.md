# Submitting Cookwala to the Claude directory

Covers claude.ai (web), the Claude desktop app, the mobile apps, Cowork and Claude Code. One listing serves all of them.
Sources: [Publish to the directory](https://claude.com/docs/directory/publish), [Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist),
[Submit a plugin](https://claude.com/docs/plugins/submit), [Submit a connector](https://claude.com/docs/connectors/building/submission).

Two submissions, both at <https://claude.ai/directory/manage> (Submit new). Anthropic asks for the server as a connector even when a plugin points at it.

| Submission | Source | What is in the repo |
|---|---|---|
| MCP connector | the URL `https://mcp.cookwala.ai/open/mcp` | nothing; the server already exists |
| Plugin bundle | this repository, plugin path `plugins/claude/cookwala`, branch `main` | `plugins/claude/cookwala/` (checked by `python tools/check_claude_plugin.py` and `claude plugin validate ./plugins/claude/cookwala`) |

The repository must be public before the listing goes live. Submit from the organization that should own the listing for good (the first one to submit a folder holds it).

## Before you start (You)
1. A paid Claude plan (Pro, Max, Team or Enterprise); Team and Enterprise need an Owner or a role with the Directory permission.
2. Merge this folder to `main` (the portal reads the repository, not your disk).

## 1. MCP connector
- Connection: paste `https://mcp.cookwala.ai/open/mcp`. Tools sync automatically; all carry `title` and `readOnlyHint`.
- Listing: name `Cookwala`, one-liner (200 chars) and description (2,000 chars) from the README, documentation URL `https://cookwala.ai/assistants/`, privacy `https://cookwala.ai/privacy/`, support `https://cookwala.ai/contribute/#contact`, an icon (PNG from `site/`; the portal wants an image).
- Authentication: none (public, read-only data). Data handling: own API, no personal health data, no sponsored content.
- Test & launch: no credentials needed; say so and give the three sample prompts. Run every tool yourself first (custom connector in Claude, or MCP Inspector).
- Compliance: seven acknowledgements. Note `fifi_search` and `fifi_source` fetch public pages from fifi.cooking (open-world).

## 2. Plugin bundle
- Source: `amado2k5/cookwala`, path `plugins/claude/cookwala`, then Validate; fix every "Blocks" row and re-validate.
- Data handling: reads no personal data, sends only the user's query to mcp.cookwala.ai, keeps none, not aimed at under 18s (the content is suitable for them; alcohol recipes exist).
- Compliance: contact `eat@cookwala.ai`, four acknowledgements. Pair it with the connector if the portal offers it.
- Releasing updates: merge to the tracked branch and raise `version` in `.claude-plugin/plugin.json`; each commit is rescanned.

## Test it yourself first
```bash
claude --plugin-dir ./plugins/claude/cookwala        # Claude Code
(cd plugins/claude && zip -r /tmp/cookwala-claude.zip cookwala)   # then claude.ai: Customize > Plugins > Add > Upload plugin
```
Then connect the `cookwala` connector on the plugin's Connectors tab and try the prompts in the README, including "Turn on my oven" (must refuse) and an allergy-guarantee request (must not guarantee).

## Keeping it in sync
`skills/` here are copies of `plugins/chatgpt/cookwala/skills/` (folder names differ because Claude requires the folder to equal the skill name). `python tools/check_claude_plugin.py` fails if they drift; it runs in `tools/build_site.sh`.
