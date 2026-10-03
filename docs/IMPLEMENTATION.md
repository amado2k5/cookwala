# Cookwala: Full Implementation Plan

How to build everything in the specs, in order. Each milestone ships something usable on
its own. Timelines assume a small core team (see §6) plus local GPU time for content work.
Patent clearance gates are marked **[FTO]** (see [PATENT-LANDSCAPE.md](PATENT-LANDSCAPE.md)).

## 1. Architecture at a glance

```
                ┌──────────────────── cookwala.ai (reference index, free) ─────────────────────┐
                │ static catalog (Pages/CDN) · edge worker: search, match, advise (stateless),   │
                │ GraphQL, MCP, A2A, registry, reports, safety reports · signing service (CI)     │
                └───────────────▲──────────────────────────────────────▲─────────────────────────┘
                                │ federation (any catalog, registry,   │ relief coordinators
                                │ provider feed, private or public)    │ (programs, needs, pledges)
 ┌──────────────────────────────┴──────────┐               ┌───────────┴──────────────────────┐
 │ Kitchen hub (home, restaurant, school,  │◄─ events ───► │ Coordinator hub (food bank, NGO, │
 │ community kitchen; any vendor)          │   A2A/MCP     │ government): relief allocator     │
 │ sessions · planner · reasoner · safety  │               └──────────────────────────────────┘
 │ flows · extensions (WASM) · profiles    │
 │ MQTT/WS/SSE · REST · GraphQL · MCP · A2A│
 └──┬──────────┬──────────┬──────────┬─────┘
 executors   appliance   sensors &   apps / CLI / voice / SMS
 (robots,    bridges     alarms      (fifi apps, Home Assistant, chat assistants)
 ROS 2)      (Matter…)
```

## 2. Repositories and packages

| Repo / package | Contents | Language | License |
|---|---|---|---|
| `amado2k5/cookwala` (this) | Specs, schemas, vocab, knowledge, policies, examples, docs, site | JSON/YAML/MD | CC BY 4.0 / CC0 / Apache-2.0 |
| `cookwala/core` → npm `@cookwala/core` | Generated types, validators, graph utils, patch engine, expression evaluator, policy engine, matcher, storage rules, safety gate | TypeScript (+ WASM build) | Apache-2.0 |
| `cookwala/cli` → npm `cookwala`, Homebrew, single binary | All CLI commands | TypeScript | Apache-2.0 |
| `cookwala/reasoner` → PyPI `cookwala-reasoner`, OCI image | Playbooks, CP-SAT planner, MILP menu optimizer, simulator, relief allocator, LLM orchestration | Python 3.12 | Apache-2.0 |
| `cookwala/hub` → OCI image, Home Assistant add-on | Hub API, event bus, sessions, executors dispatch, flows runner, extension host, profile vault | TypeScript/Node (Rust later for embedded) | Apache-2.0 |
| `cookwala/index` | Static builder + Cloudflare Worker (search, match, advise, GraphQL, MCP, registry) | TypeScript | Apache-2.0 |
| `cookwala/sdk-{python,kotlin,swift,ros2}` | Clients, executor scaffolds, ROS 2 action bridge | Various | Apache-2.0 |
| `cookwala/adapters` | Matter bridge, Home Assistant, Home Connect, vendor adapters, UCP/ACP adapter, notification bridges (FCM/APNs/SMS/TTS) | TS/Python | Apache-2.0 |
| `cookwala/cookbench` | Benchmark scenarios + runner | Python/JSON | CC0 + Apache-2.0 |
| `cookwala/conformance` | Profile test suites (Reader … Hub, Commerce, Notifier, Relief) | TypeScript | Apache-2.0 |
| `amado2k5/fifirecipes` | Export pipeline (EXPORT-FIFI), World Cuisines, app badges | Mixed | existing |

Create a GitHub organization `cookwala` for the code repos (the spec stays here or moves
there later).

## 3. Milestones

### M0: Foundations (done in this draft)
Specs v0.1 (18 schemas), APIs (OpenAPI × 2, GraphQL, AsyncAPI), vocab (56 ops, 45
incidents), seed knowledge (19 playbooks, 11 storage profiles, 30 roles, 17
substitutions, 12 transformations, 9 energy models), 28 validated examples, docs,
validator, Pages workflow.

### M1: Publish and core library (weeks 1–4)
- Push the repo, run the Pages deploy, live `cookwala.ai` with discovery, schemas, vocab
  and examples.
- `@cookwala/core`: types generated from the schemas (json-schema-to-typescript),
  validators (Ajv), semantic validator (DAG, ingredient consumption, CCP and hazard
  coverage), RFC 8785 canonical hash, Ed25519 sign and verify, expression evaluator,
  policy engine, patch engine.
- `cookwala` CLI v0.1: `validate`, `lint`, `hash`, `sign`, `verify`, `get`, `search`
  (static), `vocab`, `convert` (schema.org ↔ Cookwala, fifi → Cookwala V0).
- 10 hand-written gold recipes; CookBench skeleton with the **safety suite** (100% pass
  required).
- Defensive publication of the v0.1 spec (dated GitHub release).

### M2: fifi export to V0 + live index (weeks 3–8)
- EXPORT-FIFI stages E0–E3, E6, E7 (ingredient vocabulary ~2,500, quantity parser,
  equipment inference, text sidecars), with the rights decisions applied.
- Index build: manifest + signatures, recipe files, index pages, changes, dumps.
- Edge worker: `/v1/search`, `/v1/match` (static capability matching), GraphQL catalog
  queries, read-only MCP.
- fifi.cooking pages link to their Cookwala documents; apps show the "Robot-ready" badge.

### M3: Reasoner v1, stateless (weeks 6–14)
- Matcher + substitution graph → `cook_from`, `substitute`, `diet_merge`, `leftovers`.
- Playbook engine + patch builder + verifier → `recover`, `repurpose`,
  `adapt_equipment`.
- Storage engine → `store`.
- Scaler → `rescale`.
- LLM parse/explain with schema-constrained output (local models; BYO via extension).
  `ask` routes free text in 24 languages.
- `/v1/advise/{intent}` on the index (stateless; no personal data), plus MCP tools and
  GraphQL `advise`.
- CLI: `ask`, `can-cook`, `fix`, `rescue`, `swap`, `adapt`, `store`, `scale`.
- CookBench: recovery, matching and multilingual suites.

### M4: V1 recipes at scale (weeks 8–16, mostly GPU time)
- EXPORT-FIFI E4, E5, E8 → V1 in batches of 100; World Cuisines emits V1 natively.
- Node `alternatives[]` and `energy` estimates generated for gas, induction, oven and
  pressure cooker.
- Policy packs: `us.fda-food-code-2022`, `eu.reg-852-2004`, `dietary.halal`,
  `humanitarian.sphere`. Expert review starts.

### M5: Hub v1 (weeks 12–24) **[FTO before public release]**
- Hub API (REST + GraphQL + SSE/WS + embedded MQTT), pairing (RFC 8628), scopes,
  sessions, tasks, leases, handoffs, CCP log, safety supervisor (e-stop, alarms,
  unattended-heat watchdog), notifications.
- Planner (CP-SAT) → `team_plan`, `retime`. Contract-net teaming (`cookwala.team.*`).
- Operating modes: energy sources, peak limits, battery-aware assignment, ingredient
  horizon, budget.
- Simulator v1 → V2 for the top 200 recipes.
- Flows runner + extension host (WASM sandbox; HTTP/MCP/A2A runtimes); profile vault
  (encrypted).
- Hub MCP server + A2A AgentCard.
- Guided mode in the fifi apps (phone, tablet, TV) driving sessions with humans only.

### M6: Devices and appliances (weeks 20–32) **[FTO]**
- Matter bridge (oven, cook surface, hood, fridge, smoke/CO) and a Home Assistant add-on.
- ROS 2 executor bridge + Python and Kotlin executor SDKs.
- One robot-maker pilot (executor conformance); one appliance-maker pilot.
- Conformance suites: Reader, Guided, Executor, Appliance Bridge, Hub.

### M7: Feed, relief and marketplace (weeks 24–40) **[FTO for ordering/inventory features]**
- Menu optimizer (MILP) → `feed`, `nutrition_target`, `shopping_optimize`.
- Market: provider and offer feeds, registry, quote requests, UCP/ACP adapter (sandbox),
  credentials verification (W3C VC).
- Relief: programs, needs, pledges, `relief_allocate` (min-cost flow + MILP + per-kitchen
  CP-SAT), impact reports with HXL export, `lowTech` guided mode (SMS/voice), surplus
  rescue flow.
- **Pilot with a community kitchen or food bank** (see MISSION §6).

### M8: v1.0 and adoption (months 10–14)
- Spec freeze v1.0 after RFC review; steering group formed; security audit of hub and
  index; legal review of terms and patent pledge; trademark registration.
- SDKs (Swift, C++), docs site, tutorials, sample flows and extensions.
- Outreach: device makers, Matter/CSA, IEEE RAS 1872 working group, humanitarian data
  community, agent platforms.

## 4. Engineering practices

- **Schema-first:** schemas → generated types for TS, Python, Kotlin and Swift. CI
  validates all examples, knowledge and vocab (`tools/validate_specs.py` today; Ajv in
  core later).
- **Tests:**
  - unit;
  - property-based (patch engine, scaler, expression evaluator);
  - golden files (advice responses);
  - CookBench (safety suite gates every release);
  - conformance;
  - fuzzing of the hub APIs;
  - chaos tests (devices dropping out mid-session).
- **Security:**
  - signed releases (Sigstore);
  - SBOMs;
  - dependency scanning;
  - least-privilege tokens;
  - WASM sandbox with no ambient network;
  - audit logs;
  - private vulnerability reporting.
- **Privacy:** sensitive profiles stay local, telemetry and reports are opt-in and
  anonymous, and data processing records are kept for GDPR-style compliance.
- **Observability:** OpenTelemetry in the hub and reasoner, plus public uptime and status
  for cookwala.ai.
- **Internationalization:** every user-facing string is a `LangMap`. The 24 fifi
  languages are the baseline.

## 5. Infrastructure and cost

| Item | Choice | Cost driver |
|---|---|---|
| Static index | GitHub Pages → Cloudflare Pages when traffic grows | Free tier initially |
| Edge worker | Cloudflare Workers (search, match, advise-lite, GraphQL, MCP) | Requests |
| Heavy reasoning (stateless) | Container service (Fly.io / Cloud Run) running cookwala-reasoner; LLM via local-capable models or BYO | CPU/GPU hours |
| Content pipeline | Local M4 Max (as for fifi) | Owner's hardware |
| Signing keys | CI secret + offline root key | — |
| Reference hub images | GHCR | Free for public |

## 6. Team (minimum viable)

- **Spec and standards lead** (you + 1). RFCs, partnerships, governance.
- **Core/platform engineer ×2.** Core library, CLI, index, hub.
- **Optimization/AI engineer ×1.** Reasoner, planner, optimizer, LLM orchestration.
- **Robotics integration engineer ×1** (from M5). ROS 2, Matter, device pilots.
- **Food-safety and nutrition advisor** (part-time, expert review of packs and playbooks).
- **Humanitarian partnerships lead** (from M7). Programs, pilots, data standards.
- **Community and docs** (part-time).

Claude Code sessions can carry much of M1–M4 (specs, core library, CLI, export,
knowledge) with your review, as they have for fifi.cooking.

## 7. Success metrics

| Area | Metric |
|---|---|
| Content | Recipes at V0 / V1 / V2 / V3; languages; countries covered |
| Safety | CookBench safety suite pass rate (must be 100%); field safety incidents (target 0); recall time |
| Adoption | Devices and vendors passing conformance; hubs running; catalogs and extensions in registries; MCP/A2A clients |
| Usefulness | Advice acceptance rate; recovery success rate; plan on-time rate |
| Mission | Meals served through Cookwala-coordinated programs; cost per meal; surplus rescued (kg); people reached; programs and kitchens connected |

## 8. Top risks

1. **Physical safety.** Safety gate, verification levels, conformance, insurance and
   legal review.
2. **Patents.** FTO before the hub, devices, ordering and inventory features ship
   publicly.
3. **Content rights.** Per-collection export rules.
4. **Adoption.** Ship free tools, real recipes and MCP/A2A first; pilot partners.
5. **Food-safety rule accuracy across jurisdictions.** Expert-reviewed packs, with
   `reviewStatus` shown.
6. **Scope.** Milestones ship independently; relief and market build on proven
   reasoner and hub layers.
