# Cookwala APIs

Cookwala exposes the same data model through six surfaces, so any robot, appliance, app or
AI system can use whatever it already speaks. All of them read and write documents that
validate against [`schemas/`](../schemas).

| Surface | Index (global, public) | Hub (per kitchen, local) | Spec file |
|---|---|---|---|
| **Static JSON** | `/.well-known/cookwala.json`, `/v1/manifest.json`, `/v1/recipes/{id}.cookwala.json`, index pages, changes, dumps, vocab, policies, schemas | — | [catalog.schema.json](../schemas/catalog.schema.json) |
| **REST** | search, match, plan-preview, reports, safety-reports | sessions, tasks, devices, leases, handoffs, inventory, orders, notify, policy, safety, executor | [index.openapi.yaml](../api/index.openapi.yaml), [hub.openapi.yaml](../api/hub.openapi.yaml) |
| **GraphQL** | catalog queries | queries, mutations, subscriptions | [schema.graphql](../api/schema.graphql) |
| **Events** | — | CloudEvents over MQTT 5 / WebSocket / SSE / webhooks | [events.asyncapi.yaml](../api/events.asyncapi.yaml), [event.schema.json](../schemas/event.schema.json) |
| **MCP** | read-only tools | full tools (scoped) | §4 below |
| **A2A** | AgentCard with catalog skills | AgentCard with kitchen skills | §5 below |
| **Advice (reasoner)** | `POST /v1/advise/{intent}` (stateless, no personal data) | `POST /cookwala/v1/advise/{intent}` + `/apply` (full context) | [advice.schema.json](../schemas/advice.schema.json), [REASONING.md](REASONING.md) |
| **Market / relief / registry** | offers, providers, quote routing, programs, open needs, impact, registry | quotes, pledges, allocation, impact publishing | [market](../schemas/market.schema.json), [relief](../schemas/relief.schema.json), [catalog](../schemas/catalog.schema.json) |
| **CLI** | `cookwala` command | `cookwala hub …`, `cookwala session …`, `ask`, `fix`, `team`, `feed`, `relief` | [CLI.md](CLI.md) |

## 1. Conventions

- **Versioning:** URL major version (`/v1`), spec version in every document (`"cookwala": "0.1.0"`).
  Minor versions are additive only.
- **Media types:** recipes `application/vnd.cookwala+json`; everything else
  `application/json`; errors `application/problem+json` (RFC 9457); events
  `application/cloudevents+json`.
- **Ids:** recipe ids are stable and shared with fifi.cooking (`fah-234`, `w-ma-001`).
  Vocabulary ids are `cw.<vocab>.<name>`, vendor extensions `x-<vendor>.<name>`.
- **Integrity:** `hash` = `sha256` over RFC 8785 canonical JSON without `hash`/`signature`.
  The manifest is signed with Ed25519 over its RFC 8785 hash (docs/CORE.md section 5). Clients verify before executing.
- **Caching:** static files are immutable per catalog version. Add `?v=<version>`.
- **i18n:** `lang` parameter (BCP 47). Text fields are `LangMap`s. Machines never depend
  on text.
- **Units:** SI + UCUM codes; temperatures in °C (`degC`); durations ISO 8601.
- **Rate limits:** none on static files; dynamic index endpoints are limited per IP.
  Bulk users should use dumps + changes.
- **Recalls:** `/v1/changes/{since}.json` lists `recalls`. Hubs check before every session
  and refuse recalled revisions.

## 2. Index quick reference

```bash
curl https://cookwala.ai/.well-known/cookwala.json
curl https://cookwala.ai/v1/recipes/fah-234.cookwala.json
curl "https://cookwala.ai/v1/search?q=shakshuka&lang=ar&min_level=V1"
curl -X POST https://cookwala.ai/v1/match -H 'content-type: application/json' \
     -d @my-kitchen-capabilities.json
```

GraphQL:

```graphql
query {
  search(query: "couscous", filter: { cuisine: ["MA"], excludeAllergens: ["nuts"], minLevel: V1 }, lang: "fr") {
    total
    edges { node { id title(lang: "fr") level totalTime supervision allergensEU } }
  }
}
```

## 3. Hub quick reference

```bash
# create, confirm and start a session (assisted mode, dinner at 19:30)
curl -X POST https://cookwala-hub.local:7878/cookwala/v1/sessions -H "authorization: Bearer $T" \
  -d '{"recipes":[{"recipeId":"fah-234","servings":4}],"serveAt":"2026-10-03T19:30:00+03:00","mode":"assisted"}'
curl -X POST .../sessions/$S/confirm -d '{"acknowledgedRules":["us.fda-food-code-2022/allergen-disclosure"]}'
curl -X POST .../sessions/$S/start
# follow along
curl -N ".../events?types=cookwala.task.,cookwala.safety.&session=$S"
```

```graphql
subscription { taskUpdated(sessionId: "s-123") { id state assignee { id kind } message(lang: "en") } }
```

## 4. MCP server

Endpoint: index `https://cookwala.ai/v1/mcp` (read-only), hub
`https://cookwala-hub.local:7878/cookwala/v1/mcp` (streamable HTTP; bearer token = paired
token with the agent's scopes).

| Tool | Where | Input → output | Scope |
|---|---|---|---|
| `search_recipes` | index, hub | `{query, filter, lang, limit}` → index entries | — |
| `get_recipe` | index, hub | `{id, lang}` → recipe document | — |
| `match_kitchen` | index, hub | `{actors?, inventory?}` → match results (the hub fills its own actors) | read |
| `plan_preview` | index, hub | `{recipeId, scale, serveAt}` → draft session | read |
| `create_session` | hub | `{recipes, serveAt, mode}` → session | cook |
| `get_session` / `list_tasks` | hub | `{id}` → session / tasks | read |
| `confirm_session` | hub | prepares the confirmation; **a human completes it** on a paired UI | cook |
| `start_session` / `pause_session` / `abort_session` | hub | `{id}` → session | cook |
| `get_inventory` / `update_inventory` | hub | inventory / patch | read / inventory |
| `create_order_intent` | hub | lines → OrderIntent (awaiting_approval) | order:create |
| `notify` | hub | audience, urgency, message | notify |
| `emergency_stop` | hub | `{reason}` | any |
| `advise` | index (stateless), hub | AdviceRequest → AdviceResponse (all intents in REASONING.md) | — / read |
| `ask` | index, hub | `{text, lang}` → AdviceResponse | — |
| `apply_advice` | hub | `{responseId, optionId}` → session | cook |
| `team_call_for_proposals` | hub | `{sessionId, tasks}` → TeamPlan | cook |
| `set_mode` / `get_mode` | hub | OperatingMode | admin / read |
| `search_offers` / `request_quote` | index, hub | offers / QuoteRequest | — / order:create |
| `relief_needs` / `relief_pledge` / `relief_allocate` | index (read), coordinator hub | needs / Pledge / Allocation | — / relief |
| `run_flow` | hub | `{flowId, inputs}` | cook |

Resources: `cookwala://recipe/{id}`, `cookwala://session/{id}`, `cookwala://inventory`.
Prompts: `plan_dinner`, `use_expiring_items`.

## 5. A2A AgentCard

Hub: `https://cookwala-hub.local:7878/.well-known/agent-card.json`.
Index: `https://cookwala.ai/.well-known/agent-card.json`.

```json
{
  "name": "Cookwala Kitchen Hub",
  "description": "Plans and runs cooking sessions with this kitchen's robots, appliances and people.",
  "url": "https://cookwala-hub.local:7878/a2a",
  "version": "1.0.0",
  "capabilities": { "streaming": true, "pushNotifications": true },
  "defaultInputModes": ["text/plain", "application/json"],
  "defaultOutputModes": ["application/json", "text/plain"],
  "skills": [
    { "id": "plan_meal", "name": "Plan a meal", "description": "Choose recipes that this kitchen can cook for given diners, time and inventory.", "tags": ["cooking", "planning"] },
    { "id": "cook_recipe", "name": "Cook a recipe", "description": "Create, confirm (with a human) and run a cook session; streams task updates.", "tags": ["cooking", "robotics"] },
    { "id": "restock_kitchen", "name": "Restock", "description": "Build an order intent for missing ingredients; requires human approval.", "tags": ["groceries"] },
    { "id": "advise", "name": "Cooking advice", "description": "What can I cook, fix a mistake, rescue a meal, store food, feed N people, personalize portions.", "tags": ["cooking", "reasoning"] },
    { "id": "team_plan", "name": "Team plan", "description": "Split work across robots, appliances and people; contract-net teaming.", "tags": ["robotics", "planning"] },
    { "id": "relief_allocate", "name": "Relief allocation", "description": "Match aggregated needs with pledges across kitchens (coordinator hubs).", "tags": ["humanitarian"] }
  ],
  "securitySchemes": { "paired": { "type": "http", "scheme": "bearer" } },
  "security": [{ "paired": [] }]
}
```

A2A task states map 1:1 to Cookwala task/session states (`submitted`, `working`,
`input_required`, `auth_required`, `completed`, `failed`, `canceled`, `rejected`).
`input_required` is how a hub asks the delegating agent (and through it a human) to confirm
allergens or answer a cooking check.

## 6. Webhooks

`POST /subscriptions {url, types, secret}`. Deliveries are CloudEvents (structured mode).
Each one carries `X-Cookwala-Signature: sha256=<HMAC of body>` and retries with
exponential backoff for 24 h. Safety events are also always delivered on the local bus,
so a webhook is never the only path for them.

## 7. Errors

RFC 9457 problem details. `type` values:
`https://cookwala.ai/errors/{policy-deny|no-feasible-plan|verification-level|recalled|hash-mismatch|lease-conflict|capability-mismatch|presence-required|not-human-approver|rate-limited}`.
