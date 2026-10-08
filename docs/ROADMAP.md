# Roadmap: now, next, later

**Status:** 2026-10-04. Every item carries a status: **done**, **in progress**, **planned**,
**not yet funded**. Gates come from `ACTION-PLAN.md` section 4. Nothing moves from planned
to done without the evidence named.

## Now (this release)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server (Python script), reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| MCP service for AI agents: `@cookwala/mcp` (24 read-only tools from 0.3.0, 16 in 0.2.0, stdio, reads the static catalog, no hosting), agent guide for Claude, Codex, Copilot, Cursor, Windsurf, Devin, Antigravity, fifi.cooking bridge | published: `npx -y @cookwala/mcp`, listed in the MCP Registry as `ai.cookwala/cookwala` |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| 2,430 fifi.cooking recipes imported at V0 (1,881 Egyptian family and book collections, 499 World Cuisines, 50 Cooking with Kids), text in 29 languages | done (RFC-0009; five collections publish facts only until rights are confirmed) |
| SDK clients in 13 languages; 100 executed scenarios | done (Go, Rust, Kotlin, C#, PHP not yet compiled on CI) |
| Site and documentation in 25 languages | in progress (English and Arabic by hand; the rest machine-translated and labelled) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (within about a year, as resources allow)

| Item | Status | Gate |
|---|---|---|
| Food scientist review of the operation envelopes | planned | reviewer agrees |
| Dietitian and food-safety officer reviews of the four rule packs | planned | reviews filed; packs move to reviewed |
| Data-protection impact assessment of the household profile | planned | reviewer agrees |
| A food-bank pilot (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Agent-safety benchmark results for several model families | planned | runs published with method |
| `pip install cookwala` wheel and `@cookwala/sdk` on npm | planned | packaging that bundles vocabularies and schemas |
| Registry service (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| First device maker implementing the Core API against the reference hub | planned | one maker agrees; conformance report published |
| Conversion of the first fifi.cooking collections | planned | founder decides rights per collection |
| Core 0.3 from device feedback | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Item | Status |
|---|---|
| A real device cooking a Cookwala recipe, unedited, on video | not yet funded; needs a device partner |
| Certification scheme with an independent certifier | planned; no certifier engaged |
| Neutral foundation for the specification, trademark and mark | planned |
| Contributor network: consented recordings of real recipes with credit | planned |
| Demand and supply signals published by programs and cooperatives | planned, after competition-law review |
| "Cook in simulation" benchmark (Isaac Lab, Gazebo or MuJoCo) | planned |
| Digital Public Good recognition for the Humanitarian Profile | planned, after pilot evidence |
| Cross-region relief flows in the world simulator; clean-cooking effects | planned |

## What we will not do

Collect personal data; publish numbers without a method; name a partner before it agrees;
claim a certification that does not exist; put household data on any ledger; build a central
orchestrator that kitchens depend on; claim to end hunger.

## Kill and pivot rules

From the action plan: if two external review rounds fail to produce a device maker or a
pilot partner, Cookwala narrows to the Humanitarian Profile and the recipe format. If a pilot
shows less than a 5 % gain, the results are published and the profile redesigned before any
scaling.
