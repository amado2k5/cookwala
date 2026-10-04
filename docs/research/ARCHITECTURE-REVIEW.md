# Architecture review: Cookwala from Core 0.2 to a platform

**Status:** review, 2026-10-04. Answers the questions in `prompts/fable-website-brief.md`
§3.1 against the repository at `83bfb91`, the backstory (`BACKSTORY.md`) and the critiques
(`docs/ACTION-PLAN.md`). Each decision names the RFC that carries it. Nothing here weakens
Core 0.2.

---

## 0. Summary of decisions

| # | Question | Decision | Where |
|---|---|---|---|
| 1 | Core / profiles split | Keep Core 0.2 as is. Core 1.0 = Core 0.2 minus nothing, plus a conformance report format and a frozen vocabulary of operations and refusal reasons. Everything the founder brainstormed stays in profiles | §1 |
| 2 | Household context | A **local-first Household Context Profile** with a machine-readable facet registry, privacy classes per facet type, and **derived constraints** as the only thing that travels | RFC-0001 |
| 3 | Providers, commitments, failure | The Mission profile stays the long-term shape; the **simple shape for today** is Core executions plus Humanitarian offers/claims plus market offers, each with idempotency, versions and typed failures | §3 |
| 4 | "Like bees" | **Federation**: catalogs, registries, hubs and feeds that anyone can run; signed items verified against the issuer, not the relay; witnessed checkpoints; cookwala.ai is one node | RFC-0006 |
| 5 | Farmers and supply | Farms as donors in the Humanitarian Profile today; **aggregated, delayed demand and supply signals** as an experimental profile, gated on competition-law review | RFC-0007 |
| 6 | Fleets | A **Kitchen and Production Run** profile for restaurants, community, school, disaster and robot kitchens, linking Core executions to Humanitarian distributions | RFC-0005 |
| 7 | API per actor | Formal OpenAPI for the Registry and Directory, the Humanitarian Profile and the local Household API; Core API unchanged | RFC-0002, RFC-0003, RFC-0001 |
| 8 | SDKs | Minimum: Python package and CLI, TypeScript types, MCP server, reference hub with a simulated device, ROS 2 message package skeleton, the existing exporters | §8 |
| 9 | Demos | Dry run with a device builder, envelope explorer, SMS food-rescue walkthrough, simulators explained, agent-safety benchmark page with method; a real-device video stays "later" | §9 |
| 10 | Versioning, governance, certification | Semver per spec; conformance report format; three-step path self-declared → verified → certified; foundation path unchanged | RFC-0008 |

---

## 1. Is the Core / profiles split right?

**Yes, and the boundary should not move for the founder's brainstorm.** Core 0.2 says what
to make, when it is done and what must never happen, and it can be implemented in about a
week. The critiques (C1, C8) and the Musk-lens review were unanimous that a small core is the
only way a device maker adopts anything. Every brainstorm idea is either a *profile* (optional,
versioned separately) or *tooling*.

**What belongs in Core 1.0** (the freeze after first device feedback):

- Everything in Core 0.2 sections 2–9.
- The operation vocabulary's **envelope fields** frozen (ids, media, bands, ladders); new
  operations stay additive.
- The `RefusalReason` enum and the execution state machine frozen.
- A **ConformanceReport** document (RFC-0008) so a claim of conformance is itself a signed,
  verifiable record.
- A `/v1/conformance` discovery endpoint listing which classes an executor claims and the
  report hash.

**What stays optional:** Missions, sessions and hubs, market, relief planning, reasoning,
health personalization, extensions, flows, and the new profiles in this review. The test for
promotion is unchanged: two independent implementations and real users.

**One Core gap worth fixing soon (not now):** `ExecuteRequest` has no field for a *service
context* (serve to room, lunch box, hot-hold until). It is a profile concern today
(`recipe.service`), and should become a Core 0.3 optional field only if two implementers
ask for it.

---

## 2. How to model the household context (the enhanced payload)

### 2.1 The problem

Messages M31–M41 describe about 150 facts a robot could know about a home. `PROTOCOL.md`
groups them into 15 facet families and `mission.schema.json` has a generic `Facet`. Nothing
is machine-readable about *which* facts exist, *how private* each is, or *what may leave the
home*. Without that, every implementer decides alone, and the most intimate data in a house
becomes a product.

### 2.2 The model (RFC-0001)

1. **A facet registry** (`vocab/facets.json`): one entry per fact type, with a family, labels
   in English and Arabic, a light value schema, the allowed sources (declared, observed,
   reported, inferred), a **default privacy class** (`public`, `household`, `sensitive`,
   `secret`) and a **travel rule**:
   - `never`: the fact never leaves the home, not even derived (children's data, layouts,
     absences, health conditions, religion, income posture);
   - `derived`: only a derived constraint may leave (delivery window, "avoid grapefruit",
     "no robot movement in the hallway 15:00–15:30");
   - `consented`: may leave as a selective disclosure after explicit consent (an allergen
     block sent to a grocer for labelling).
2. **A Household Context document** (`household.schema.json`): local-only, `sensitive`,
   holding facets, consent grants, retention and erasure settings, and a **local incident
   memory** (the founder's "what happened before" list, M41) that is never exported. The
   public, anonymous `IncidentReport` in Core is a different document.
3. **Derived constraints** (`household.schema.json#/$defs/DerivedConstraint`): the only
   household-originated object a provider or an agent ever receives. Each names its type, its
   value, its validity and the facet *types* (never values) it was derived from.
4. **Rules** (normative inside the profile): raw facets never leave the device; `inferred`
   facets are never used for safety decisions; there is no behavioural score of any person;
   economic level is an owner-set budget posture and is never inferred; every facet is
   erasable, and erasure completes within a stated window; children's and absence data are
   `secret` by default and `never` travel.
5. **Conformance:** a `disclosure_policy` vector kind: given facets and a recipient role, the
   expected set of derived constraints. The reference library gains `derive_constraints()`.

### 2.3 What is shared, with whom

| Recipient | Receives | Never receives |
|---|---|---|
| Grocer or delivery | Delivery window, door or lobby, allergen labels required, budget cap for this order | Schedules, who is home, why |
| Planner or AI provider | Diet and allergen constraints, equipment list, heat sources, time window, budget posture, serving form | Names, health conditions, religion, income, layout |
| Device maker (support) | Device self-state facets the owner chooses to share | Household facets |
| Food bank or program | Nothing from households. The Humanitarian Profile has no household data at all | |
| Dataset (with consent) | Execution logs with no personal data, times coarsened to the day | Any facet |

This resolves the founder's "full picture" (M42) by giving the **planner at home** the full
picture and everyone else a constraint.

---

## 3. Providers, commitments, failure and recovery: is the Mission the right shape?

**For the long run, yes.** The Mission profile (`PROTOCOL.md`, `DECISIONS.md`) is the most
complete answer to M43–M57 and it survived the home simulator. Its parallels (sagas, PACE,
earned value, EPCIS, ONE Record) are mature.

**For adoption today, it is too heavy to be the first thing anyone implements.** The simple
shape that already exists and should be presented as the way in:

| Need (message) | Simple shape today | Mission later |
|---|---|---|
| Cook a recipe safely (M6) | Core `ExecuteRequest` → `ExecutionStatus` → `ExecutionLog`, idempotency, If-Match, refusal | Wrapped as a task in `plan` |
| Rescue surplus (M23) | Humanitarian `Offer` → `Claim` → `Handover` → `Distribution` with a versioned state machine and 409 on conflict | A relief Mission |
| Buy ingredients (M21, M38) | Market `Offer`, `QuoteRequest`, `Quote`; checkout in the provider's own system | A `commitment` contribution |
| Agents acting for people (M43) | Core `AgentMandate`: scopes, caps, allowed providers, expiry, confirm-before list | Mission `mandate` |
| Typed failure (M54) | HTTP problem details with `RefusalReason`; Humanitarian reject reasons | `Failure` objects with retryability |
| Who decides (M54) | The device's safety limits and the person; agents ask the principal | Decision rights, arbiters, quorum |

The site therefore shows **three loops**: *cook* (Core), *rescue* (Humanitarian), *buy*
(Market, experimental), and names the Mission as the experimental layer that joins them.

---

## 4. "Like bees": from metaphor to architecture (RFC-0006)

The founder wants no central command (M49). The pieces exist; the review makes them a
system:

| Mechanism | How it works | Exists? |
|---|---|---|
| **Catalogs anyone can run** | Serve `/.well-known/cookwala.json` and the `/v1` layout from any host, including a folder | Spec yes; cookwala.ai is one |
| **Registries anyone can run** | `/v1/registry.json` listing entries hosted anywhere, with proven namespaces and pinned versions | Spec yes (RFC-0002 formalizes) |
| **Hubs are local** | A kitchen works offline; the index is a cache | Core §8 |
| **Signed items verified against the issuer** | A recall or recipe relayed by a mirror still verifies with the issuer's `KeyRecord`; relays add nothing but provenance | Core §5; a vector is added |
| **Feeds instead of commands** | Recalls, anonymous incidents, key records and registry changes are polled feeds; nodes republish what they trust (stigmergy: marks, not orders) | Recalls yes; registry and incidents formalized |
| **Evaporation** | Every facet and listing has freshness; stale items are re-observed or dropped | Facet `validFor`; registry `status` |
| **Witnessed history** | Event logs with checkpoints counter-signed by a second party; rewrites are detectable | Core §5 |
| **Quorum for high-stakes choices** | Mission profile, N of M arbiters | Experimental |
| **Immunity** | Incident signatures become playbook and recipe patches pushed as feeds | Partly (playbooks); feeds formalized |

**What is explicitly not built:** a central orchestrator, a central identity provider, a
blockchain. Transparency logs give tamper evidence; public anchoring stays optional and is
the founder's call (`BACKSTORY.md` §4.7).

---

## 5. Farmers and supply chains (RFC-0007)

Farmers need three things from a food standard and get none today: a way to **list surplus
and gluts** that reaches kitchens before food rots, **fair demand signals** that say what
will be needed where, and **a price-neutral channel** that does not favour large buyers.

- **Now:** a farm is a donor in the Humanitarian Profile. `Item.origin` (`farm`, `processor`,
  `retail`, `kitchen`) and `harvestedAt` are added; the SMS grammar accepts `FARM` offers.
  No personal data, organizations only.
- **Next (experimental):** `DemandSignal` and `SupplySignal` documents: aggregated per
  region and week, ingredient class not product, minimum count before publication, a delay
  before release, **no prices**. Programs and cooperatives publish and subscribe. This is the
  founder's "exact amounts" loop (M45) in a form competition counsel can review.
- **Later:** planting advice from forward demand, reserve sizing, cross-region relief flows.

Fairness rules: signals are public once published, never sold, and a small producer sees the
same signal as a large one.

---

## 6. Fleets: restaurants, community kitchens, disaster kitchens (RFC-0005)

M46 asks for the same protocol in a restaurant, a wedding, a donation drive or a food factory.
The brief adds school-meal programs and disaster kitchens. One profile covers them:

- **Kitchen**: an organization's kitchen with stations, devices (capability documents),
  capacity (meals per hour), rule packs, heat sources and hot-hold and cooling equipment.
- **ProductionRun**: recipes and batch counts, a serve window, assignments per station
  (device, person or either), critical control points to record, hot-hold and cooling plan,
  outcome. Each device step is a Core execution; the run links its logs.
- **Link to impact**: a run that serves a program emits a Humanitarian `Distribution`.
- **Fleet dispatch**: out of scope for the profile; Open-RMF tasks or a vendor's fleet manager
  take `ExecuteNode` goals (ROS 2 binding).

---

## 7. The API for each actor

| Actor | API today | Added in this work |
|---|---|---|
| Device or robot (executor) | Core API | Nothing |
| Catalog | Core recall and incident endpoints; static `/v1` layout | Registry entries it publishes |
| Registry operator | prose in `REGISTRY.md` | `api/registry.openapi.yaml`: validate, publish, search, entry by name, tombstones; directory of organizations |
| Household hub (local) | `hub.openapi.yaml` (experimental) | `api/household.openapi.yaml`: read and write the local context, grant and revoke consent, derive constraints for a role, erase |
| Food bank, kitchen, donor | prose in the Humanitarian Profile | `api/humanitarian.openapi.yaml`: offers, claims, transitions, handovers, distributions, reports, manifest |
| Farm or cooperative | none | Offers as donor (now); signals (experimental) |
| Restaurant or community kitchen | none | Kitchen and ProductionRun documents (profile; API in the hub later) |
| AI agent | MCP tools in prose | A runnable MCP server |
| Program or health body | rule packs | Rule-pack review template and a `ReviewRecord` |

---

## 8. SDKs: the minimum set for a great developer experience

| Package | Contents | Why minimum |
|---|---|---|
| `sdk/python` (`pip install -e sdk/python`, `cookwala` CLI) | hash, verify, dry run, validate, envelope check, units, humanitarian check, exports, conformance runner, SMS parser | One command to first success; wraps the reference library |
| `sdk/typescript` | Types generated from the schemas; the browser dry run as a module | Web and agent developers; keeps the site's demo and the Python reference in step |
| `sdk/mcp` | A stdio MCP server exposing `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_envelope`, `check_mandate` | Every MCP-capable agent can use Cookwala safely on day one |
| `hub/` | Reference hub: Core API with a simulated device, safety limits, recall polling; Dockerfile | The quickstart `curl` works locally; makers test against something real |
| `bindings/ros2` | Existing actions plus a `cookwala_msgs` package skeleton | Robot makers build it in minutes |
| `tools/execlog_export.py` | LeRobot and OpenTelemetry (exists) | Learning and observability |

Not in the minimum set: a GraphQL server, the reasoner, a recipe editor.

---

## 9. Demos: what convinces each audience

| Audience | Demo | Status |
|---|---|---|
| Everyone | In-browser dry run with several real recipes, a device builder and a shareable link | Build now |
| Device makers | Envelope explorer: drag a temperature trace, see when it leaves the band; sensor ladder choice per device | Build now |
| AI-agent builders | Agent-safety benchmark page: the ten cases, how to run, how to publish results | Build now (results: next) |
| Food banks | SMS walkthrough: type messages, see the documents and rule findings they produce | Build now |
| Funders, policy | Simulators explained for non-experts, with "illustrative model" on every chart | Improve now |
| Robotics researchers | Conformance vectors as simulation test conditions; LeRobot export | Exists; document |
| Everyone | A real device cooking a Cookwala recipe, unedited | Later (needs a device partner) |

---

## 10. Versioning, governance, certification, neutral home (RFC-0008)

- **Versioning:** unchanged (semver per spec, additive minors, 12-month notice for majors,
  3-year index support). Profiles declare the Core version they need.
- **Conformance report:** a signed `ConformanceReport` (class, vectors run, pass counts,
  tool version, commit, device model, date) so a claim is a record anyone can check.
- **Certification path:** *self-declared* (report published by the maker) → *verified*
  (report reproduced by a registry operator) → *certified* (an independent certifier with
  a mark). The mark and its rules move to the foundation with the trademark.
- **Governance:** `GOVERNANCE.md` stands. The review adds that RFC comment periods are
  announced in GitHub Discussions and that safety-relevant RFCs name their reviewer.

---

## 11. RFC set produced by this review

| RFC | Title | Changes |
|---|---|---|
| 0001 | Household Context Profile | `vocab/facets.json`, `schemas/household.schema.json`, `api/household.openapi.yaml`, conformance `disclosure_policy` |
| 0002 | Registry and Directory | `api/registry.openapi.yaml`, `DirectoryEntry`, name and version vectors, `site/v1/registry.json`, `site/v1/directory.json` (empty-state) |
| 0003 | Humanitarian Profile 0.2: surplus to plate | `Item.origin`, `harvestedAt`, program types, `ImpactSummary`, SMS additions, four worked flows, pilot protocol, `api/humanitarian.openapi.yaml` |
| 0004 | Health and food-safety rule packs | New packs (care for vulnerable groups, sodium reduction, school meals), `ReviewRecord`, review template, claims policy |
| 0005 | Kitchens and production runs (fleets) | `schemas/fleet.schema.json`, examples (disaster kitchen, restaurant) |
| 0006 | Federation | `Discovery.feeds`, relay-verification vector, federation guide |
| 0007 | Farm surplus and supply signals | `schemas/supply.schema.json` (experimental), SMS `FARM`, fairness rules |
| 0008 | Conformance reports and certification path | `schemas/conformance.schema.json`, `docs/CERTIFICATION.md` |

---

## 12. What this review does not change

- Core 0.2 normative text, schemas and vectors.
- The safety-is-local rule, refusal semantics, untrusted-text rule, mandate rule.
- The honesty rules: measured, modelled, assumed; now, next, later.
- The order of adoption: people without robots first.
