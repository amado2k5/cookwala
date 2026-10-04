# The Cookwala Protocol: Missions, Context and Swarm Coordination

**Status:** architecture vision, draft 0.1 (2026-10-03). It builds on the existing
Cookwala specs (recipes, sessions, advice, profiles, market, relief) and defines the layer
that ties them together.

## 0. The idea in one paragraph

A cooking robot shouldn't ask "give me a recipe". It should send a **Mission**: a
signed, privacy-scoped, self-describing document that carries everything relevant to the
request:

- **who it is:** health, firmware, patches, licenses, subscriptions, warranty,
  insurance, recalls, standing with its maker;
- **what it's allowed to do:** cook only, or also clean, fetch, open the door, serve;
  which rooms, stairs, hard NOs, when to ask a human;
- **the world it's in:** layout, appliances, other robots and devices, pets, kids,
  guests, workers, light, Wi-Fi, construction, schedules;
- **who it serves and how:** tastes, culture, rituals, health, medications, budget,
  shopping habits, feedback history;
- **what it remembers:** past incidents, conflicts, lessons.

Providers (AI planners, grocers, delivery, device makers, monitors, orchestrators) then
pass the Mission along. Each one **adds what it knows and signs what it did**, until the
document is "ready enough". The robot verifies it and executes the resulting **living
plan**, writing progress, deviations and lessons back into the same document. It adapts
like a good human cook, and better, when reality changes.

Multiplied across millions of kitchens, restaurants, factories and relief kitchens, and
aggregated anonymously, those Missions become the world's most accurate signal of what
food is actually needed, where and when. Farms, stores, logistics, cities, the WFP and
the WHO can then produce, move and plan to near-exact need, with much less waste.

## 1. The core concept: the Mission document

A Mission is to cooking what a container is to shipping: one standard box that any
participant can handle without knowing what's inside the other compartments.

```
Mission
├── header        id, type, created, originator (robot DID), owner (DID), jurisdiction, spec version
├── intent        the goal in structured form + natural language ("dinner for 5 at 19:30, halal, low budget")
│                 + commander's intent: what matters most if the plan breaks
├── mandate       what the robot may do, where, with whom, escalation rules, hard NOs, caution level
├── context       facets: typed, sourced, timestamped, confidence-scored claims about self, household,
│                 space, devices, health, commerce, service, history (see §4)
├── credentials   verifiable proofs: robot identity, owner, subscriptions, warranties, licenses, insurance
├── routing       preferred providers / orchestrators, allowed hops, forwarding permissions, budgets, deadlines
├── contributions append-only: each provider's additions (plans, quotes, data, monitors), signed
├── readiness     the "definition of ready": what must be present and true before execution
├── plan          the living plan: tasks, contingencies, invariants, checkpoints, monitors (see §7)
├── execution     progress, telemetry pointers, deviations, decisions, human interactions
├── outcome       result, consumption, waste, feedback, lessons, incidents
└── ledger        hash-chained, multi-party signatures over every state change (see §5)
```

**Properties:**

| Property | Meaning |
|---|---|
| **Self-describing** | Every section references its schema/version; unknown sections are preserved and passed on, never dropped |
| **Content-addressed** | Each contribution is hashed; the Mission id is stable, its state is a hash chain |
| **Append-only** | Providers add; they never silently edit others' contributions (corrections are new entries) |
| **Concurrently mergeable** | Contributions are designed as CRDT-friendly entries, so parallel providers can merge without conflicts |
| **Scoped** | Each provider receives a **view**: only the facets its role needs, encrypted to it (§6) |
| **Living** | The same document carries planning, execution and outcome, so there's one source of truth for the whole lifecycle |
| **Human- and AI-readable** | Every structured section also carries a short natural-language summary, so future AI agents can use facets no schema anticipated |

Relation to existing Cookwala specs: a Mission **wraps** an AdviceRequest/Response, a
Session, OrderIntents, TeamPlans and so on. They become typed contributions inside one
envelope. Profiles become facets.

## 2. Design principles (how it survives the next 20 years of AI)

1. **Narrow waist.** Like IP for the internet, the core is tiny and very stable:
   envelope, identity, signatures, facets, capability tokens, states and safety
   invariants. Everything else (facet types, plan formats, AI capabilities, provider
   types) lives above it as versioned, namespaced, negotiable extensions. The core changes
   rarely; the edges evolve daily.
2. **Specify outcomes, not methods.** Contracts state what must be true (postconditions,
   invariants, acceptance tests, food-safety limits), not how to achieve them. Smarter AIs
   can then find better methods without changing the standard.
3. **Separate intelligence from safety.** A small, verifiable **safety kernel** (rules,
   interlocks, invariants, CCPs, escalation) sits between any intelligence (local model,
   cloud AI, future superintelligence) and the physical world. Intelligence can be swapped
   freely; the kernel only gets stricter. This is aviation's envelope protection applied
   to kitchens.
4. **Graduated autonomy.** Explicit Cookwala Autonomy Levels (§13) tie what a robot may
   do unsupervised to verified competence, the way the SAE levels do for cars.
5. **Semantic and AI-native.** Facets have JSON-LD contexts *and* natural-language
   summaries. Interfaces are intent-based, not brittle RPCs. Agents negotiate
   capabilities.
6. **Negotiation everywhere.** Versions, profiles, facets, plan formats, payment terms,
   SLAs: parties declare what they support and agree, like TLS cipher or HTTP content
   negotiation.
7. **Local-first, cloud-optional, offline-capable.** Missions are created and executed at
   the edge. Providers are consulted when available, with graceful degradation to
   on-device reasoning and cached knowledge. There's a delay-tolerant mode for low
   connectivity (store-and-forward, SMS/USSD bridges, mesh).
8. **Privacy by architecture.** Raw household data stays home. Providers get
   minimum-necessary views, derived constraints, or zero-knowledge answers.
9. **Decentralized by default.** No central command is needed. Optional orchestrators are
   a service, not a dependency (§8, nature).
10. **Everything learns, nothing forgets badly.** Outcomes, incidents and lessons feed
    learning at three speeds (§9). The history is auditable, while personal data stays
    deletable (crypto-shredding).
11. **Conformance by behavior.** Implementations are judged by public test suites and
    benchmarks (CookBench), not by code, so any AI, robot or vendor can compete on quality.
12. **Open and royalty-free,** with neutral governance that can outlive any company.

## 3. Layered architecture

```
 L6  Planet & public good   demand signals · supply/logistics/city planning · relief allocation · public-health insights
 L5  Learning               outcomes · incident "immunity" · playbook updates · federated & private aggregation
 L4  Plan & execution       mission plan (HTN / behavior trees) · contingencies · invariants · checkpoints · monitors
 L3  Coordination           routing: direct · chain · orchestrated · swarm · readiness convergence · negotiation
 L2  Context                facet registry · situational model · digital twin of the space · memory
 L1  Mission envelope       document structure · states · contributions · views · summaries
 L0  Trust                  DIDs · verifiable credentials · capability tokens · consent · signatures · ledger
 ─── cross-cutting ───      Safety kernel · Privacy · Security · Economics (metering, payment, SLAs) · Governance
```

## 4. The context model: facets

Everything you listed, and much you didn't, is a **facet**: a typed claim about the
world.

```json
{
  "facet": "cw.facet.device.status",
  "subject": "appliance:fridge-1",
  "value": { "doorSeal": "leaking", "coldSpot": "shelf-2-left", "fillPct": 85 },
  "summary": "Fridge door seal leaks; shelf 2 left is colder; 85% full.",
  "source": { "kind": "robot_observation", "actor": "robot:neo-1", "evidence": ["frame:8812"] },
  "observedAt": "2026-10-03T17:40:00Z",
  "validFor": "P7D",
  "confidence": 0.8,
  "privacy": "household",
  "consent": ["owner"]
}
```

Every facet has the same anatomy: type, subject, value, NL summary, source (declared by
the owner, observed by the robot, reported by a device, or inferred by AI), time, freshness
(TTL), confidence, privacy class and consent. So any party can judge **how much to trust
it and whether it's still true**. This is the pheromone-evaporation idea from §8.

### 4.1 Facet families (registry seed)

| Family | What it covers (from your notes) | Plus what you didn't mention |
|---|---|---|
| **self** | Identity, model, health, battery, last maintenance, firmware, patches, extensions and mods, licenses, upgrades, subscriptions and tier, warranty, maintainer, insurance, recalls, unpaid services at risk, account standing, capability limits, sensor quality (vision blurry in glare or dim light) | Calibration dates, wear of grippers and knives, cleanliness and sanitation state of food-contact parts, compute and AI model versions in use, energy cost of its own compute, known failure modes |
| **mandate** | Allowed tasks (cook / clean / fetch / open the door for delivery / take out trash / serve to table / deliver to rooms); allowed zones, stairs, floors; who it may add to a flow; may it ask the owner; what to do if not; hard NOs; caution level (extra slow) or relaxations; manufacturer SLA guidance for critical situations or unknowns | **Authority hierarchy** (whose instruction wins: parent vs child vs guest vs housekeeper); time-bound delegations; instructions it must refuse (unsafe, illegal, harmful to pets); emergency powers (call emergency services) |
| **household.people** | Members, roles, ages, babies and small kids, elderly, disabled or wheelchair users, babysitter, housekeeper, visitors, repair crews, gardeners, mail carriers; schedules for arriving and leaving and overlap with the robot's path; who handles pets | **Consent of every member and guest** (not just the owner); quiet hours; who may override; emergency contacts |
| **household.culture** | Economic level, conservative or open, outgoing, routine vs novelty, rituals (prayer, music, holding hands), eating by hand or with utensils, cultural table rules | Religious calendars (fasting, feast days), gender or modesty norms around serving, language and tone the robot should use, things that are offensive |
| **household.tastes** | Food preferences, style, colors, table and plate layouts, hot/cold/reheat habits, eating immediately or later, coffee and drinks (who makes them, iced or hot, same or varying), extras, spices, sauces, sides, things always on the table, snacking habits and where snacks get left | Texture dislikes, portion norms per person, spice tolerance, presentation for kids vs adults |
| **household.health** | Diets (halal, vegetarian…), allergies, conditions (diabetes, cancer…), medications and timing before or after food, food–drug and food–drink interactions | Swallowing (IDDSI), pregnancy, intolerances, clinician-set targets, **always sensitive and local-only** |
| **household.behavior** | Waste habits, signs they've finished, eating speed, bringing dishes back, arguments, kids fighting or running, throwing things (incl. at pets), guests known or unknown and their behavior, satisfaction, complaints, recurring change requests (and whether they were applied), times the humans cook themselves and why | Tidiness patterns, which surfaces get cluttered, typical spill zones, the "messy eater" accommodations already agreed |
| **space** | Kitchen layout; positions of utensils and tools; appliances (smart or not, how full); fridge, pantry and freezer contents and positions; deep freezer; distances (kitchen ↔ dining table, rooms); where each person sits; serve-to locations; garden and indoor garden; garage; doors | **Digital twin** (3D scene graph, e.g. OpenUSD + semantic labels), reachability maps, grasp notes per object, slip and fall hazards, child locks, safe zones for hot items |
| **space.environment** | Ventilation, temperature, humidity, airflow, floor level (basement/upper), tight or wide, foot traffic per zone and time, lighting and glare, construction or repairs, unrepaired damage, power outlet locations, **Wi-Fi strength and internet speed per location** | Noise limits, water quality and pressure, smoke-detector placement vs cooking zone, fire extinguisher and blanket location, emergency exits |
| **devices** | Other robots (same model or not, multi-skilled), cleaning robots, fridge, washing machine, smoke detectors: whether they're smart, commandable by data or only physically, capabilities, interfaces, expected data, status, health, response time, self-reported issues, robot-observed issues, recalls, risk, alarm history | Firmware currency, security posture, who owns each device (some may not accept this robot's commands), interference (two robots needing the same path) |
| **resources** | Power and gas quotas or limits per appliance (stove, microwave, dishwasher, blender, grill), other energy and water, time-of-day cooking rules and durations, kitchen-sharing schedules with humans and robots | Tariffs, peak limits, generator/solar/battery availability, outage likelihood, cylinder levels |
| **commerce** | Shopping habits (self, delivery, mixed, by robot), ordering method (automated, phone, robot), cadence (daily … monthly), discount-seeking, preferred stores, apps and providers, excluded brands and ingredients, bundled services (groceries, utensils, appliance maintenance), delivery subscriptions | Payment authority limits for the robot, receiving rules for deliveries (who can open the door, when), returns, packaging preferences (reusable containers) |
| **service** | Purpose: dining, breakfast, school lunch, boxed or packed, event, wedding, shipping, delivery, donation; individual vs group; who serves; reminders (before ready, at ready, after serving; how long before); table setting (utensils, layout per person or family); serving in rooms (sick, studying), plates vs containers vs wraps vs zip bags | Labeling (allergens, date), temperature at delivery, timing windows per person |
| **history** | Incidents: robot vs robot, device, appliance, utensil, pot; triggered alarms; tasks it couldn't do; give-ups after retries and who helped; human–robot conflicts, how they were resolved, lessons; escalations to customer service; app overrides; forced reboots and shutdowns; recall handling and scheduling | Near-misses, unexplained events, trust score per human instruction source, success statistics per task |
| **economics** | Budget posture: low, flexible or fancy; per meal, event or period | Who pays which provider, metering limits, cost caps per mission |

You also mentioned the long tail: when to clean floors and dishes, interruptions, stove
left on or turned off mid-cook, milk or cheese spoiled after sitting out. These aren't
facets. They're **policies and contingencies** in the plan layer (§7) plus **playbooks**
in the knowledge layer (already started in `knowledge/playbooks.json`).

### 4.2 Where facets come from
- **Declared** by owners and household members in onboarding and over time.
- **Observed** by the robot, with evidence (frames, sensor logs) kept locally.
- **Reported** by devices and services (appliance status, recall feeds, delivery status).
- **Inferred** by AI, always marked `inferred` with confidence, never treated as fact for
  safety decisions.
- **Expiring:** every facet has freshness. Stale facets trigger re-observation instead
  of blind trust.

## 5. Trust: identity, authority, consent, ledger

| Need | Mechanism |
|---|---|
| Who is this robot, who owns it, who maintains it | **W3C Decentralized Identifiers (DIDs)** for robots, owners, providers; maker-issued device certificates |
| Proof of subscriptions, tier, warranty, insurance, licenses, certifications | **W3C Verifiable Credentials**, presented with **selective disclosure** (SD-JWT / BBS+) so the robot can prove "has premium tier" without revealing account details |
| Permission for providers to act and forward | **Capability tokens** (UCAN / ZCAP-style): delegable, attenuated, time-boxed, revocable. The robot grants a planner "read facets A, B; may forward to grocers in my list; budget ≤ $20; until 19:00", and the planner can pass on a *narrower* token to the next hop |
| Legal acceptance | Signed acceptance of terms per provider (e-signature frameworks such as eIDAS/ESIGN), referenced in the ledger |
| "Everyone signs what they did" | **Mission ledger:** an append-only, hash-chained log of entries (accepted, responded, delivered, executed, failed), each signed by its actor. **Optional anchoring** of the chain head to a public transparency log or public blockchain for tamper-evident timestamps. No need to put data on-chain |
| Right to be forgotten vs immutable history | Only hashes and signatures go on the ledger. Data lives off-ledger, encrypted per Mission; deleting the key (**crypto-shredding**) erases it while the audit trail survives |
| Liability across the chain | Each contribution states its role (advice / binding offer / executed action), its SLA and its insurer, so responsibility is traceable when something goes wrong |

## 6. Privacy and minimum disclosure

The context you described is the most intimate data a home has: layouts, schedules,
when nobody's home, children, health and medications. **In the wrong hands it's a
burglary plan and a profiling tool.** So:

- **Views, not copies:** each provider gets a computed view with only the facets its role
  needs, encrypted to its key. A grocer sees "deliver 2 kg halal chicken between 17:00
  and 18:00 to the door; robot will receive". It never sees the family schedule.
- **Derived constraints instead of raw data:** "no robot movement in hallway 15:00–15:30"
  instead of "the kids come home at 15:00". "Avoid grapefruit" instead of the medication
  name.
- **On-device answers** for the most sensitive reasoning (health, medications,
  children). Providers can be asked zero-knowledge-style questions ("is ingredient X
  compatible with the household's constraints?" → yes/no).
- **Privacy classes** on every facet (`public`, `household`, `sensitive`, `secret`),
  enforced by the robot's disclosure engine. **Children's data** and **security data**
  (layouts, absences) default to `secret`.
- **Anti-profiling rules:** economic level, religion and culture are owner-declared
  preferences used *only* to serve the household. Providers must not use them for price
  discrimination or anything else (a conformance rule, audited).
- **Aggregation with formal privacy** (k-anonymity thresholds, differential privacy)
  before any data leaves the home for planet-scale signals (§10).

## 7. Plan and execution: a living plan with judgment

### 7.1 Mission command
Military doctrine learned long ago that detailed orders break on contact with reality,
so you give the **intent** too ("feed the family a warm halal dinner by 19:30; safety
first; budget matters"). The Mission plan carries:

- **Intent:** the goal and its priorities.
- **Plan:** a hierarchy of tasks (HTN / behavior tree):
  - environment prep (clear sink and range, wash and dry dishes, fetch pots, rice and
    oil, cutting board on the counter);
  - recipe execution (the Cookwala process graph);
  - serving (reminders, table setting, delivery to seats or rooms);
  - cleanup;
  - leftovers and storage.
- **Constraints and invariants:** things that must always hold (stove never left on
  unattended; CCPs met; no hot items within child reach; pet-toxic foods never left
  accessible).
- **Contingencies:** "if X then Y" policies attached to tasks or global (spill, drop,
  interruption, missing item, device failure, power or gas cut, spoilage).
- **Freedom of action:** what the robot may change on its own, and what needs asking.

### 7.2 Priority stack (applies at every decision)
1. **Human life and safety:** choking, burns, fire, falls, medical emergencies, children.
2. **Animal safety.**
3. **Food safety.**
4. **Property and equipment.**
5. **Mandate and household rules.**
6. **Mission goals:** time, quality, cost, waste.

A higher priority preempts a lower one. A child crying near spilled hot liquid preempts
the sauce.

### 7.3 Interrupts, checkpoints and resume
- Every task declares whether it's **pausable**, its **safe-pause state** (heat to hold or
  off, lid on, knife down) and its **resume conditions** (food-safety timers: how long
  can it pause before the food must be discarded or re-heated?).
- An interruption (an owner calls the robot elsewhere, a kid needs help, the dog knocks
  something over) goes **safe-pause → handle → re-plan → resume**. If the resume window
  has expired, the robot runs a playbook: re-heat, salvage, discard, or switch dish.
- **Stove watchdog:** any heat source on with no active cooking task, or an unexpected
  off (outage, someone turned it off), triggers immediate reconciliation with the
  playbooks.
- **Spoilage watch:** perishables carry time-temperature budgets. Exceeding them (milk
  left out) triggers discard plus an inventory update and a reorder suggestion.

### 7.4 Monitors and multi-party execution
Plans name **monitors**: a smart pot reporting temperature, a delivery provider reporting
ETA, a remote AI watching the cooking from frames, a smoke detector, a family member's
phone. The robot subscribes to them (Cookwala event bus) and writes their signals into the
Mission. Fleets (restaurants, weddings, factories, relief kitchens) use the same model
with more actors and leases (`team_plan`, contract-net).

### 7.5 Failure, salvage and switching
Every plan declares:
- **Retry policies** per task: how many times, with what variation.
- **Non-retryable conditions:** food safety, human risk.
- **Failure thresholds:** when the mission counts as failed.
- **Salvage paths:** repurpose intermediates, swap the dish using what's available
  (`recover`, `repurpose`, `cook_from`).
- **Escalation ladder:** robot → household → orchestrator → maker support → emergency
  services.

The robot can also **re-open the Mission** (send an amendment) for new guidance, rather
than start over.

### 7.6 Many opinions, one decision: assessments and reconciliation

Providers (and groups of providers that share capabilities) don't just add facts. They
add **assessments**: estimates and judgments with uncertainty, evidence, assumptions and
method (`mission.schema.json#/$defs/Assessment`). Several can cover the same topic:
- energy the plan will take on *this* robot model with *this* battery health;
- duration;
- cost;
- whether a substitution is safe;
- whether milk has spoiled.

They may **agree, refine or disagree**, and every assessment records which one it
responds to and why.

A **reconciler** (the robot by default, or a chosen agent, orchestrator, quorum or human)
fuses them under per-topic **reconcile rules**:
- **Strategies:** conservative, calibration-weighted, evidence priority (measurement >
  historical stats > physics model > vendor spec > LLM judgment), Bayesian fusion,
  median, quorum, debate-then-decide, or ask a human.
- **Safety bias:** for feasibility and safety topics, decide on the cautious quantile
  (e.g. energy need at p90).
- **Conflict detection:** spread above a threshold triggers a **rebuttal round**. The
  reconciler asks the dissenting provider to re-estimate with the facets it missed, or
  asks the robot to measure, before deciding.
- **Consequences:** the result drives decisions. For example: *battery need at p90 is
  60%, but only 43% is usable above the 15% reserve, so dock for 25 minutes during the
  passive rice-steaming step. If the dock window slips, hand fluffing and plating to the
  parent or the other robot, then resume for serving.* Other outcomes are "charge to full
  first" (if time allows), "notify the owner" or "change the dish".
- **Learning:** after the Mission, `closure.calibration` scores each assessment against
  the actual value (was it inside its interval? how large was the error?). Reconcilers
  weight providers by verified calibration, not by claims. Good estimators earn
  influence; bad ones lose it. This is the protocol's version of bees recruiting to the
  scouts whose dances proved right.

Worked example: `examples/mission/home-dinner.json` (`as-1`…`as-3`, `rc-1`, `d-6`, `d-7`).

## 8. Learning from nature: decentralized harmony

| Natural system | How it works | Cookwala mechanism |
|---|---|---|
| **Honeybee foraging (waggle dance)** | Scouts advertise food sources; dance intensity encodes quality; more bees recruit to better sources | Providers **advertise** capabilities, offers and quality (signed, rated). Robots and orchestrators recruit to the best, by evidence, not authority |
| **Honeybee nest-site choice (quorum sensing)** | No leader; scouts independently evaluate, and a decision fires when a quorum agrees | **Quorum decisions** for multi-robot and multi-provider choices: proceed when enough independent evaluations agree (e.g. 2 of 3 planners agree the plan is safe) |
| **Division of labor (response thresholds)** | Each insect has a threshold per task stimulus; whoever is most sensitive and available responds; it rebalances as stimuli change | Fleet task allocation: robots bid when task "stimulus" (urgency × fit) exceeds their threshold, which is modulated by battery, skill and load. Self-balancing without a dispatcher |
| **Ant stigmergy (pheromone trails)** | Ants leave marks in the environment; others follow strong trails; trails evaporate | **The Mission document is the shared environment.** Contributions are marks that guide the next provider. Facet freshness and decaying reputation are the evaporation. Successful paths (provider chains) are reinforced |
| **Slime mold networks** | *Physarum* grows an efficient, fault-tolerant transport network (famously reproducing the Tokyo rail layout) | Logistics and relief routing: reinforce used delivery routes and pickup clusters, prune unused ones, and keep redundancy for resilience |
| **Immune system** | Distributed detection, memory cells, rapid response to known threats, tolerance to self | **Incident immunity:** anonymized incident signatures (a pot that slips on a model of hob, a recipe step that fails at altitude) become "antibodies" (playbook and recipe patches) pushed to every robot. Recalls (devices, food) spread like alarms |
| **Mycorrhizal networks** | Trees share resources through fungal networks with neighbors in need | **Surplus sharing:** kitchens with surplus pledge it; neighbors in need receive it (relief layer, community fridges) |
| **Flocking (boids)** | Three local rules (separation, alignment, cohesion) create global coordination | Robot motion etiquette in shared spaces: keep separation, align with traffic, yield to humans. No global controller needed |
| **Homeostasis** | Set points plus negative feedback keep a body stable | Household set points (budget, nutrition, waste, energy) with feedback loops nudging plans back toward targets |
| **Octopus** | Arms have their own neurons and act semi-autonomously under the brain's intent | **Edge autonomy:** robots act locally under mission intent; the cloud advises, it doesn't micromanage |
| **The internet / email / DNS** | Federated, end-to-end, narrow waist, no single owner | Federated catalogs, providers and orchestrators; anyone can run any role |

**Takeaway:** orchestrators are allowed, but the system must work **without** them. With
local rules (thresholds, quorum, stigmergic marks, evaporation, immunity) the swarm
stays coherent, recovers from failures and keeps improving.

## 9. Learning at three speeds

| Speed | Loop | Example |
|---|---|---|
| **Seconds to minutes** (in-mission) | Sense → compare with plan → adapt | Sauce reducing too fast → lower heat, adjust timing, update monitors |
| **Hours to days** (fleet and household) | Outcomes and incidents → playbook, recipe and preference updates | The family always leaves rice → portion 15% less. Model X robots fail to grip pot Y → new grasp hint pushed |
| **Weeks to months** (ecosystem) | Aggregated, privacy-protected evidence → knowledge packs, benchmarks, standard RFCs | New contingency type standardized; V3 recipe promotions; new facet types registered |

Learning uses **federated learning and differential privacy** where models are trained
on household data. Every learned change still passes the safety kernel and CookBench
before rollout.

## 10. Planet scale: from millions of Missions to near-exact supply

1. **Demand signals:** each hub derives forward-looking ingredient demand from planned
   Missions (meal plans, standing orders, events). It aggregates and anonymizes it
   (k-anonymity, differential privacy, region/time buckets) and publishes it to opt-in
   **demand exchanges** that grocers, wholesalers, farms, logistics firms and city
   planners subscribe to.
2. **Supply signals back:** surplus, seasonality, prices, carbon and shortages flow back
   into planners. Recipes get **demand-shaped** toward what's abundant (a glut of
   tomatoes → more tomato dishes this week), which closes the loop.
3. **Logistics:** known delivery windows and volumes allow pooled routes and off-peak
   slots, and give cities visibility into traffic and curb use.
4. **Packaging and waste:** exact quantities, bulk and reusable container protocols,
   predictable waste pickup volumes.
5. **Production planning:** farms and processors plan planting and slaughter against
   real forward demand.

**Caveat (nature again):** a perfectly lean supply chain is fragile (just-in-time systems
broke during the pandemic). The standard should help planners keep **deliberate buffers
and strategic reserves**, sized from the same signals. Ecosystems that survive keep some
redundancy.

## 11. Ending hunger and improving public health

Built on the relief layer (`relief.schema.json`, [MISSION.md](MISSION.md)) and
[HEALTH.md](HEALTH.md):

- **Food organizations** (e.g. WFP-style programs): Missions at kitchen scale, needs at
  program scale, pledges from anyone, allocation across kitchens. Robot kitchens add
  capacity; low-tech guided mode covers places without robots. Consumption-vs-waste ratios
  are measured per meal and published.
- **Health organizations** (e.g. WHO-style programs):
  - publish **policy packs and flows** (sodium reduction, fortification, diabetes-friendly
    menus, child nutrition), which hubs and kitchens adopt;
  - receive **privacy-protected aggregate outcomes** (dietary patterns, adherence,
    nutrient coverage) to plan campaigns;
  - extend the standard with their own facets, knowledge packs and reports.
- **Low-resource settings:** offline-first hubs, delay-tolerant sync, SMS/voice
  interfaces in local languages, solar and fuel-efficient methods, local-ingredient
  recipes (World Cuisines), and free tooling.
- **Learning network:** every relief kitchen's outcomes improve every other kitchen's
  plans, at machine speed, across borders.

## 12. What else must be covered (beyond your notes)

| Area | Requirement |
|---|---|
| **Medical emergencies at the table** | Detect choking, falls, allergic reactions; stop tasks; alert; call emergency services per mandate |
| **Pets** | Pet-toxic foods (onion, garlic, chocolate, grapes/raisins, xylitol, cooked bones…) never left within reach; clean spills immediately |
| **Children** | Hot items out of reach; knives secured; authority limits (a child can't order candy at midnight or disable safety) |
| **Conflicting instructions** | Authority hierarchy + "ask the authority holder" + log; never obey unsafe orders |
| **Food product recalls** | Subscribe to official recall feeds (e.g. FDA/FSIS/RASFF); match against inventory by product and lot; discard and notify |
| **Adversarial inputs** | Treat every provider output as untrusted until it passes the safety kernel. **Prompt-injection defense**: text facets and contributions are data, never instructions. Signed plans only; anomaly checks on plans |
| **Fraud and abuse** | Spending limits, order approval rules, provider reputation, signed quotes, capability-token budgets |
| **Latency** | Real-time cooking can't wait on a 10-hop chain: plan ahead, cache, precompute contingencies, keep local fallbacks, set deadlines per hop |
| **Economics between providers** | Metering, pricing, SLAs, refunds, dispute resolution, all recorded in the ledger; payments through existing rails, never raw credentials |
| **Sanitation** | Robot self-cleaning and food-contact hygiene logs; cross-contamination rules (raw meat, allergens, halal-dedicated utensils) |
| **Disasters** | Earthquake, flood, fire: stop motion, heat off, safe state; switch to emergency food plans |
| **Accessibility** | Voice-first, multilingual, screen-reader-friendly; adapt service to disabilities |
| **Jurisdictions** | Data residency; health data laws; children's data laws; local food codes as policy packs |
| **Compute footprint** | Prefer on-device and small models; account for AI inference energy in the Mission's energy budget |
| **Human dignity and work** | Humans can always cook themselves; robots assist. In community kitchens, robots augment jobs and keep humans in the loop |
| **Time and units** | Synchronized clocks for multi-party plans; locale-aware units, languages and calendars |

## 13. Cookwala Autonomy Levels (trust that grows with evidence)

| Level | Robot may… | Requires |
|---|---|---|
| **CA0 Assist** | Advise humans only (guided mode) | — |
| **CA1 Supervised steps** | Execute single tasks with a human present and confirming | V1 recipes, executor conformance |
| **CA2 Supervised missions** | Run whole missions with a human present; human confirms safety-critical steps | V2 recipes, hub conformance, presence detection |
| **CA3 Conditional autonomy** | Run missions with humans at home but not watching; escalates on any unknown | V3 recipes on its device class, incident record below threshold, insurance |
| **CA4 High autonomy** | Unattended in defined conditions (e.g. no children home, daytime, no deep-frying) | CA3 track record, certification, household opt-in |
| **CA5 Full autonomy** | Any household mission it accepts, including handling emergencies | Future: regulatory approval, independent audits |

Levels are per robot × household × mission type, recorded as credentials, and can be
lowered automatically after incidents.

## 14. How this fits Cookwala today and what to build next

| Existing spec | Becomes |
|---|---|
| `profile.schema.json` | Facet families `household.*`, `space`, `self`, `resources` (profiles stay as convenient bundles) |
| `capabilities.schema.json` | `self.capabilities` facet |
| `advice.schema.json` | Contribution type `advice` inside a Mission |
| `session.schema.json` | The Mission's `plan` + `execution` for cooking tasks |
| `event.schema.json` | Monitor and execution signals, plus ledger events |
| `market.schema.json`, `order.schema.json` | Contributions `offer`, `quote`, `order` |
| `relief.schema.json` | Program-level Missions, needs and pledges |
| `knowledge/` | Playbooks for contingencies and salvage |

**Next concrete artifacts:**
1. `schemas/mission.schema.json`: envelope, header, intent, mandate, facet, credential
   refs, routing, contribution, readiness, plan (HTN/BT nodes, invariants,
   contingencies, checkpoints, monitors), execution, outcome, ledger entry.
2. `vocab/facets.json`: the facet registry seed from §4.1 (≈150 facet types with privacy
   defaults).
3. `schemas/capability-token.schema.json` + ledger entry format (hash chain, signatures,
   anchoring).
4. Disclosure-engine spec: views per provider role, privacy classes, derived-constraint
   transforms.
5. Mission examples: home dinner with pets and kids; restaurant fleet; wedding; relief
   kitchen; school lunch boxes; all with interruptions and recoveries.
6. CookBench additions: interruption and resume, conflicting instructions,
   prompt-injection, pet/child safety, recall handling.
7. RFC-0001 "Mission envelope" for public comment.

## 14a. Related documents

- Mission schema: [mission.schema.json](../schemas/mission.schema.json); worked example: [examples/mission/home-dinner.json](../examples/mission/home-dinner.json)
- Decisions, commitments, budgets, degraded operation: [DECISIONS.md](DECISIONS.md)
- Recipe format that plugs into Missions: [RECIPE-FORMAT.md](RECIPE-FORMAT.md)
- Prior art, parallels and novelty: [PRIOR-ART.md](PRIOR-ART.md)

## 15. Decisions for you

1. **Ledger anchoring:** a transparency log only (simpler, cheaper), or also anchor to a
   public blockchain for legal timestamping?
2. **Default autonomy ceiling** for the first release (recommended: CA2).
3. **Demand exchange:** run by cookwala.ai, by partners, or only as a protocol for others
   to operate?
4. **Who to invite first** to the steering group: one robot maker, one food bank or
   humanitarian program, one grocer, one privacy expert, one food-safety expert.
