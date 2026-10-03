# Cookwala Extensibility, Federation and Profiles

Cookwala is meant to be **customizable in any way**. Anyone can add:

- their own recipes;
- fields, vocabularies and knowledge;
- rules, filters and rankers;
- AI models and agents;
- flows and intents;
- device adapters;
- profiles of clients, kitchens, cookware and robots.

They can host it **anywhere**, publicly or privately, and it all flows through the same
protocol. One limit stays fixed: **core safety checks always run, and extensions can only
make them stricter.**

## 1. What you can add

| You want to… | Mechanism | Schema / where |
|---|---|---|
| Add your own recipes (family, restaurant, brand, chef) | Host a **catalog** (static files are enough) | `recipe.schema.json`, `catalog.schema.json` |
| Add fields anywhere (recipe, node, ingredient, profile, offer, event…) | `x-<namespace>` properties + a `fields` contribution with its JSON Schema | `extension.schema.json` |
| Add vocabulary (ingredients, ops, equipment, cues, incidents) | Vocabulary file with `x-<ns>.` ids | `catalog.schema.json#/$defs/Vocabulary` |
| Add culinary knowledge | Knowledge pack (playbooks, roles, substitutions, transformations, storage, energy) | `knowledge.schema.json` |
| Add rules (food safety, dietary, house rules, venue, company policy) | Policy pack | `policy.schema.json` |
| Add filters / rankers for search and advice | `filter` / `ranker` contribution at `catalog.search_*` / `reasoner.filter` / `reasoner.rank` hooks | `extension.schema.json` |
| Add a new kind of question | `intent` contribution with request/response schemas; called with `intent: custom` | `advice.schema.json`, `extension.schema.json` |
| Bring your own AI (LLM, vision cues, embeddings, translation) | `model` / `sensor_classifier` contribution with declared roles and CookBench accuracy | `extension.schema.json` |
| Add your own agent | `agent` contribution (A2A AgentCard) or `tool` (MCP server) | `extension.schema.json` |
| Add planner behavior (cost terms, constraints) | `planner_terms` at `planner.cost_terms` / `planner.constraints` | `extension.schema.json` |
| Automate a routine | **Flow** | `flow.schema.json` |
| Connect a device | `adapter` contribution + capability manifest | `capabilities.schema.json` |
| Describe clients, kitchens, cookware, robots, organizations | **Profiles** | `profile.schema.json` |
| Add an operating-mode preset | `mode_preset` contribution or `kind: mode` profile | `profile.schema.json` |
| Offer goods or services | Provider + offer feed | `market.schema.json`, [ECOSYSTEM.md](ECOSYSTEM.md) |

Worked examples: [`examples/extension/`](../examples/extension),
[`examples/flow/`](../examples/flow), [`examples/profile/`](../examples/profile),
[`examples/market/`](../examples/market).

## 2. Extension model

- **Namespaces:** each publisher owns `x-<name>` (e.g. `x-acme`). Everything they add
  (fields, vocab ids, events, intents) carries the prefix, so nothing collides. Namespaces
  are registered by PR to `vocab/namespaces.json`, or self-asserted for private use.
- **Manifest:** `extension.schema.json` lists contributions, hooks, permissions, runtime,
  pricing (extensions may be free or commercial) and integrity (hash + signature).
- **Runtimes:**
  - `data`: files only (vocab, knowledge, policies, recipes).
  - `wasm`: a sandboxed component run in-process by hubs/indexes, with no network unless
    granted. This is the default for filters, rankers and validators.
  - `http`: a remote webhook at a hook.
  - `mcp` / `a2a`: remote tools and agents.
  - `container`: heavier services such as models.
- **Hooks** (pipeline order):
  1. `reasoner.parse`
  2. `retrieve`
  3. `filter`
  4. `generate`
  5. `verify`
  6. `rank`
  7. `explain`

  Also available:
  - planner hooks: `cost_terms`, `constraints`, `post_plan`;
  - policy hook: `evaluate`;
  - session hooks: `before_start`, `on_event`, `after_complete`;
  - catalog hooks: `ingest`, `enrich`, `search_filter`, `search_rank`;
  - `inventory.ingest`, `order.route`, `notify.deliver`, `sense.classify`.

  Extensions at the same hook run in `priority` order.
- **Permissions:** the operator grants read and write scopes. `profiles.client.sensitive`
  is never granted by default, and `actuate` is always false: extensions **propose**,
  the hub **decides**.
- **Trust:** hubs only load extensions the operator approves. Signed manifests and the
  registry's verification flag help with that, and CookBench scores are shown for models
  and advisors.
- **Safety invariant:** the core safety gate runs before `generate`, and the core verifier
  runs after the last extension. An extension policy can add `deny`/`require`/`warn`
  rules or `adjust` limits tighter. It can never loosen core rules.

## 3. Flows

`flow.schema.json` is a small declarative workflow language:

- **Triggers:** schedule, event, ask phrase, webhook, manual.
- **Steps:** `advise`, `plan_session`, `start_session`, `confirm_with_human`,
  `order_intent`, `approve_with_human`, `notify`, `wait`/`wait_for_event`, `branch`,
  `foreach`, `call_tool`, `call_agent`, `call_extension`, `store_profile`,
  `publish_recipe`.
- **Data:** `{{steps.<id>.output…}}` and `{{inputs.<name>}}` templates.

Flows are shareable (public registries) and installable with inputs. They run in the hub's
flow runner and can't skip approval or safety steps that the session requires.

Ideas flows enable:
- weekly budget plan;
- Ramadan iftar countdown cooking;
- "use expiring items" alerts;
- restaurant order → robot schedule;
- school lunch production with allergen segregation;
- disaster-relief mass feeding with rationing;
- elderly-care texture-modified meals.

## 4. Federation: host anywhere, public or private

```
            ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
            │ cookwala.ai         │   │ chef.example        │   │ acme-restaurant.local│
            │ public catalog      │   │ paid recipe catalog │   │ private catalog      │
            │ (fifi + world)      │   │ (oauth2)            │   │ (LAN only)           │
            └──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘
                       │  same /.well-known/cookwala.json + /v1 layout + signatures │
                       └───────────────────────┬────────────────────────────────────┘
                                       ┌───────▼────────┐
                                       │ Kitchen hub    │ catalogs: [local, acme, chef, cookwala.ai]
                                       │ (any vendor)   │ trust: keys per catalog, priorities
                                       └────────────────┘
```

- **Catalogs:** any server (or folder) that serves `/.well-known/cookwala.json` and the
  `/v1` layout is a catalog. Static hosting works: GitHub Pages, S3, a NAS, a USB stick.
  Dynamic features (search, match, advise) are optional.
- **Visibility:** `meta.visibility` takes `public`, `unlisted`, `shared` (with listed
  parties), `private` (authenticated), or `local_only` (never leaves the hub). Private
  catalogs declare `auth` (OAuth2, API key, mTLS, DID auth) in discovery.
- **Global references:** recipes and profiles are referenced across catalogs as
  `https://<catalog>#<id>` or `cw:<authority>:<id>` (`common.schema.json#/$defs/GlobalRef`).
  Forks record `meta.derivedFrom`.
- **Trust:** each catalog signs its manifest. Hubs keep a trust list (catalog → keys →
  priority). A recipe's safety-relevant content is only used when its signature verifies.
- **Registries:** anyone can run a registry (`/v1/registry.json`,
  `catalog.schema.json#/$defs/RegistryEntry`) listing catalogs, extensions, flows,
  providers, knowledge and policy packs hosted anywhere. cookwala.ai runs one public
  registry. It isn't required.
- **Custom recipes:** authors use the CLI (`cookwala init recipe`, `validate`,
  `simulate`, `publish --catalog …`). Private recipes can still be advised on by a hub
  locally. Public ones can be submitted to cookwala.ai or any registry.

## 5. Profiles (setup of everything in the lifecycle)

`profile.schema.json` kinds:

- **client:** diners, allergies, diets, preferences, schedule (incl. fasting), default
  mode, consent. Usually `local_only` and `sensitive`.
- **kitchen:** energy sources and tariffs, appliances, zones, storage capacity, altitude,
  water, ventilation, accessibility.
- **cookware:** every pot, pan and container, with capacity, material, induction and oven
  safety, airtightness, handle type (robot grasping), and dedicated-use flags (e.g.
  halal-only, allergen-free).
- **robot:** capabilities (inline or URL), battery model (capacity, charge rate, draw
  per activity), dock, zones, maintenance.
- **organization:** type (home, restaurant, school, hospital, charity kitchen,
  caterer…), licenses, policy packs, catalogs.
- **mode:** a saved operating mode (e.g. "make it last the week").

Profiles are documents like everything else: owned, versioned, optionally signed, stored
wherever the owner wants, and referenced from requests and sessions via `profiles`. Hubs
keep private profiles encrypted at rest and resolve them locally. The index never
receives `sensitive` data.

## 6. Compatibility promises

- Unknown `x-` fields are preserved and ignored by everyone who doesn't understand them.
- Extensions declare `compat.cookwala`; hubs refuse incompatible ones.
- Core schemas only add optional fields in minor versions.
- Popular extensions can be promoted to core via RFC (see GOVERNANCE.md).
