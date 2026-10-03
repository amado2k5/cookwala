# Cookwala: Plan

**Cookwala: the world's first and largest robot cooking recipes index and CLI.**
An open, royalty-free standard and a free public index that lets any robot, appliance or AI
agent find a recipe, check that it is safe and allowed where it runs, and cook it end to end,
alone or together with other machines and people.

**Mission:** help end world hunger and make people healthier. Every person should eat, including
people who can't pay, and get the right food, cooked the right way, in the right amount, at a
known cost, with minimal waste. See [MISSION.md](MISSION.md) and [HEALTH.md](HEALTH.md).

Status: draft v0.1, 2026-10-03. Owner: fifi.cooking. Repo: https://github.com/amado2k5/cookwala

> "First and largest" is the positioning goal. Our landscape scan ([RESEARCH.md](RESEARCH.md))
> found no open recipe-execution standard or shared index today, so "first" is defensible
> once we publish. "Largest" becomes true when the index passes the biggest closed
> libraries (Posha advertises 1,000+). We start with 1,881 fifi.cooking recipes plus World
> Cuisines. Re-check both claims before using them in marketing.

## 1. What Cookwala is

| Piece | What | Where |
|---|---|---|
| **Standard** | JSON documents for recipes (machine-executable), devices, policies, sessions, events, inventory, orders, reports | [`schemas/`](../schemas), [`vocab/`](../vocab) |
| **Index** | Free public catalog of signed Cookwala recipes, searchable, syncable offline | `https://cookwala.ai` · [index.openapi.yaml](../api/index.openapi.yaml) |
| **Hub protocol** | Local coordination of a kitchen: robots + appliances + sensors + humans + agents + services | [hub.openapi.yaml](../api/hub.openapi.yaml), [events.asyncapi.yaml](../api/events.asyncapi.yaml), [INTEROP.md](INTEROP.md) |
| **Interfaces** | REST, GraphQL, CloudEvents (MQTT/WS/SSE/webhooks), MCP, A2A, CLI | [API.md](API.md), [schema.graphql](../api/schema.graphql), [CLI.md](CLI.md) |
| **Recipes** | All fifi.cooking recipes, enriched to be robot-ready | [EXPORT-FIFI.md](EXPORT-FIFI.md) |
| **Reasoner** | Answers what-can-I-cook, fix-and-resume, rescue, store, feed-N, team plans, personalized portions; neuro-symbolic engines with a safety gate | [REASONING.md](REASONING.md), [advice.schema.json](../schemas/advice.schema.json), [knowledge/](../knowledge) |
| **Operating modes and profiles** | Gas/electric/induction, battery levels, energy/ingredient conservation, budget; client/kitchen/cookware/robot/org profiles | [profile.schema.json](../schemas/profile.schema.json) |
| **Extensibility and federation** | Anyone's recipes, fields, rules, filters, AI, agents, flows; public or private catalogs hosted anywhere | [EXTENSIBILITY.md](EXTENSIBILITY.md), [extension](../schemas/extension.schema.json), [flow](../schemas/flow.schema.json) |
| **Ecosystem and market** | Grocers, restaurants, robot and cookware makers, chefs, certifiers, delivery, energy, AI vendors | [ECOSYSTEM.md](ECOSYSTEM.md), [market.schema.json](../schemas/market.schema.json) |
| **Relief** | Programs, aggregated needs, pledges, network allocation, impact (HXL) | [MISSION.md](MISSION.md), [relief.schema.json](../schemas/relief.schema.json) |
| **Health** | Per-person nutrition targets, portion plans, organic and sourcing preferences, waste minimization | [HEALTH.md](HEALTH.md) |
| **Tools** | Validator, simulator, converter, reference hub, adapters, conformance suite | `tools/` (validator today; rest per [IMPLEMENTATION.md](IMPLEMENTATION.md)) |

What it is **not**: firmware, a motion controller, a safety certification, or legal advice.
Device makers stay responsible for safe hardware. Cookwala supplies the data and the
coordination contracts that make safe execution possible and checkable.

## 2. Principles

1. **Food state first, device-agnostic.** Steps say what must happen to the food and how to
   tell it's done, never "speed 4".
2. **Every step ends on a measurable condition.** Sensor or vision cue plus a time window,
   with a defined timeout path.
3. **Safety is data.** Hazards, CCPs, allergens, supervision, abort procedures and safety
   events are typed and enforced.
4. **Rules are separate.** Local food-safety, dietary, venue and device rules are versioned
   policy packs evaluated at run time.
5. **Honest trust levels.** V0 described → V1 structured → V2 simulated + reviewed → V3
   field-verified. Devices choose the minimum level per supervision mode.
6. **Mixed teams by default.** Any step can be done by a robot, an appliance or a human, with
   handoffs and fallbacks (research shows long autonomous tasks still mostly fail).
7. **Reuse, don't reinvent.** Matter for appliances and alarms, ROS 2 / Open-RMF ideas for
   robots, A2A + MCP for agents, UCP/ACP/AP2 for commerce, CloudEvents + MQTT for events,
   schema.org / FoodOn / Wikidata / IEEE 1872.1 for meaning.
8. **Local-first, cloud-optional.** Kitchens keep working offline. The index is static and
   cacheable.
9. **Verifiable.** Hashes, signed manifests, recall feed, audit logs.
10. **Open to everyone.** Royalty-free, no keys, no membership. Any manufacturer can
    implement it.

## 3. The data model (layers)

```
L4 Policy packs   jurisdiction · dietary · venue · household · device     policy.schema.json
L3 Safety         hazards · CCPs · allergens · dietary · supervision · abort
L2 Bindings       optional device-class hints (x-oven.matter, x-thermocooker …)
L1 Process graph  typed ops (vocab/ops.json) · params · until · onTimeout · assignment
L0 Semantics      dish · yield · ingredients (cw.ing ids, SI qty) · equipment · nutrition · cost · text
                                                                          recipe.schema.json
Runtime:  capabilities.schema.json → session.schema.json (plan, tasks, leases, handoffs, CCP log)
          event.schema.json (CloudEvents) · inventory.schema.json · order.schema.json · report.schema.json
Index:    catalog.schema.json (discovery, manifest, index entries, changes, vocabularies)
Existing: legacy/fifi-data-v1.schema.json (fifi.cooking /data API, unchanged)
```

Worked example: [examples/shakshuka.cookwala.json](../examples/shakshuka.cookwala.json)
(validates against the schema).

### Schema inventory

| Schema | Purpose | Status |
|---|---|---|
| `legacy/fifi-data-v1.schema.json` | What fifi.cooking publishes today (`/data/recipes`, index, search, ingredients, manifest) | Documents existing |
| `common.schema.json` | Quantities, units, durations, conditions, actors, signatures | New |
| `recipe.schema.json` | The executable recipe | New |
| `capabilities.schema.json` | Device/actor capability manifest | New |
| `policy.schema.json` | Policy packs and rule expression language | New |
| `session.schema.json` | Cook session: plan, tasks (A2A states), leases, handoffs, CCP records | New |
| `event.schema.json` | CloudEvents envelope + 60 event types incl. safety | New |
| `inventory.schema.json` | Fridge/pantry contents | New |
| `order.schema.json` | Shopping/delivery intents (maps to UCP/ACP, no credentials) | New |
| `report.schema.json` | Anonymous execution feedback | New |
| `catalog.schema.json` | Index discovery, manifest, entries, changes, vocabularies | New |
| `advice.schema.json` | Reasoner requests/answers for 20 intents; RecipePatch, TeamPlan, StoragePlan, ProductionPlan, PortionPlan | New |
| `knowledge.schema.json` | Playbooks, roles, substitutions, transformations, storage, energy, nutrition packs | New |
| `profile.schema.json` | Operating modes; client (incl. per-person nutrition), kitchen, cookware, robot, organization profiles | New |
| `extension.schema.json` | Extension manifests (hooks, permissions, runtimes) | New |
| `flow.schema.json` | Declarative workflows | New |
| `market.schema.json` | Providers, offers, feeds, quotes | New |
| `relief.schema.json` | Programs, needs, pledges, allocations, impact | New |
| `context.jsonld` | Linked-data mapping to schema.org, Wikidata, FoodOn | New |

## 4. Verification levels

| Level | Meaning | How a recipe gets there | Allowed use |
|---|---|---|---|
| **V0 Described** | L0 complete, steps as text | Export + quantity parsing | Display, guided human cooking, AI assistants |
| **V1 Structured** | Process graph, conditions, hazards, CCPs; passes validators | LLM conversion + deterministic validators + sampled review | Assisted mode (robot + human present) |
| **V2 Simulated** | Passes the simulator; params reviewed by a person | Simulator + reviewer sign-off | Robot execution with `presence_required` |
| **V3 Field-verified** | ≥ N successful reports on ≥ 2 device classes, 0 safety incidents | Execution reports | Per device policy, incl. unattended where the law and policy allow |

## 5. Interoperability (summary of [INTEROP.md](INTEROP.md))

- **Robots ↔ robots:** through the hub. Resource leases (burner, pan, counter zone, arm) and
  handoffs with acknowledgement; ROS 2 action bridge; fleet managers act as one executor.
- **Robots ↔ humans:** per-step assignment and fallback to humans, human confirmations of
  vision checks, guided mode, presence requirements, overrides limited by policy.
- **Appliances:** Matter oven/cooktop/microwave/hood/fridge/smoke-CO bindings
  ([bindings/matter.json](../bindings/matter.json)), plus Home Connect / SmartThings / vendor
  adapters.
- **Smart fridge / pantry:** `inventory.schema.json` (Matter covers fridge state, not
  contents), reservations, expiry-driven suggestions.
- **Ordering and delivery:** `OrderIntent` → UCP/ACP adapters; human approval or an explicit
  standing budget rule; robot receive of deliveries.
- **Safety and security systems:** `cookwala.safety.*` events with a mandatory response
  matrix, e-stop, unattended-heat watchdog, never silencing alarms, signed data, scoped
  pairing.
- **Notifications:** urgency-based routing to phones, speakers, TVs, watches, lights,
  SMS/email, with escalation.
- **AI agents:** MCP tools and an A2A AgentCard. Agents prepare, humans confirm.

## 6. Interfaces (summary of [API.md](API.md) and [CLI.md](CLI.md))

REST (two OpenAPI 3.1 specs), GraphQL (one schema: catalog + kitchen, with
subscriptions), events (AsyncAPI 3 over MQTT/WS/SSE + webhooks), MCP server, A2A agent,
and the `cookwala` CLI (search, get, validate, simulate, convert, sign, hub, pair, plan,
session, inventory, order, policy, estop, conformance).

## 7. Index operations

- Static build from this repo (`recipes/`, `vocab/`, `policies/`) → GitHub Pages or
  Cloudflare at `cookwala.ai`. An edge worker serves search, match, plan-preview,
  reports, GraphQL and MCP.
- Signing key in CI secrets (Ed25519), rotated yearly, published in
  `/.well-known/cookwala.json`.
- Recalls: a safety report triggers triage within 24 h. A recall entry in `changes` makes
  hubs refuse the revision.
- Mirrors welcome (signed content stays verifiable anywhere).

## 8. Open source and governance

- **Licenses:** schemas, tools, SDKs and reference hub under Apache-2.0 (patent grant).
  Spec text CC BY 4.0. Vocabularies, bindings and policy packs CC0. Recipe data CC BY 4.0
  only where we hold the rights (see EXPORT-FIFI §2).
- **Patent pledge** ([PATENTS.md](../PATENTS.md)): no assertion against conforming
  implementations.
- **No gatekeeping:** reading the index needs no key. Implementing needs no permission.
  The conformance suite is free, and passing it lets a product say "Cookwala Compatible"
  for its profile (Reader, Guided, Executor, Appliance Bridge, Hub, Inventory Source,
  Commerce Adapter, Notifier).
- **Process** ([GOVERNANCE.md](../GOVERNANCE.md)): public RFCs, 30-day comment period,
  SemVer, additive minor versions, a 3-year support window for `/v1`. fifi.cooking edits
  at first. A steering group with device makers, food-safety and dietary experts forms once
  there are independent adopters. Later: present to the CSA (Matter), the IEEE RAS 1872
  working groups and the EU ICT standardisation rolling plan.
- **Vendor extensions:** `x-<vendor>` namespaces registered by PR. Popular ones get promoted
  to core.

## 9. Roadmap

The full milestone plan (M0–M8, repos, team, infrastructure, metrics) is in
[IMPLEMENTATION.md](IMPLEMENTATION.md). M0 (this draft) is done. M1 publishes the specs at
cookwala.ai and ships the core library and CLI.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Physical harm from machine cooking (highest) | Verification levels, mandatory human confirmation, signed data, safety events, e-stop, never-leave steps, recalls, no-warranty terms. **Have a lawyer review the terms before v1.0.** |
| Content rights | Per-collection export switch; only owned or licensed recipes go open (EXPORT-FIFI §2) |
| Food-safety accuracy of CCPs and policy packs | Expert review per jurisdiction; `reviewStatus` on every pack |
| Halal claims | Two-layer gate on every recipe before claiming; claims carry `basis` and `ruleset` |
| Adoption chicken-and-egg | Ship tools and real recipes first; MCP/A2A make it usable by AI assistants on day one; guided mode in the fifi apps gives real users immediately |
| Security of connected kitchens | Pairing with human approval, scoped tokens, LAN TLS, signed docs, audit logs; aligns with ETSI EN 303 645 / EU CRA |
| Name and trademark | `cookwala.com` is registered by someone else (2025) and an Indian cooks-marketplace startup used the name from 2014 (now defunct). Domain: **cookwala.ai** (being registered). Still to do: trademark search (USPTO, EUIPO, WIPO, India) and register the mark before launch; consider also securing `cookwala.org` as a redirect |
| Third-party patents | Several active patents overlap execution features (hub orchestration, appliance control, auto-ordering). See [PATENT-LANDSCAPE.md](PATENT-LANDSCAPE.md). FTO opinion before releasing the hub, bridges or commerce adapter; spec, index and data ship first |
| Marketing claims ("first", "largest") | Re-verify before launch (see top) |

## 11. Decisions needed

1. Register `cookwala.ai` and point it at the index host (GitHub Pages or Cloudflare). All schema ids and endpoints already use `https://cookwala.ai`.
2. Content rights per collection (EXPORT-FIFI §2.1).
3. Push this draft to the public repo now?
4. First real-device target for phase 5 (Matter induction cook surface + oven is the
   cheapest real demo).
