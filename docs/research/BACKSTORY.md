# Backstory: what the founder set out to do

**Status:** working document, 2026-10-04. Source: `prompts/SESSION-PROMPTS.md` (85 messages,
3–4 October 2026) read in full, against the repository at commit `83bfb91`. Every claim here
points to a message number (M1…M85) or a file. Where the founder's intent and a repository
document disagree, this file says so instead of choosing quietly.

---

## 1. The founder's intentions, in their own terms

### 1.1 Where it started (M1–M3)

The session opened with a plan for **fifi.cooking**, a family collection of Egyptian home
recipes: build a worldwide encyclopedia of cuisines, the top recipes of almost every country,
filtered so that nothing haram (alcohol, pork, blood) gets in, with banner images, 24-language
translations, nutrition and cost estimates, and searchable on web, phone, tablet and TV. The
founder is a builder who ships: scripts, repos, pushes in chunks of fifty.

### 1.2 The turn to robots (M4–M11)

Within forty minutes the question changed: *how do cooking robots cook, and is there any
standard, index or governance they share?* There wasn't. The founder's response was not to
build another product but to make fifi.cooking, then a new repo, **the centralized, free index
that any robot anywhere can use**, with a standard that is "our invention" (M6), open source
for every manufacturer (M7), with API specs, schemas, a CLI, GraphQL, and interoperability
with other robots, humans, smart fridges and stoves, ordering and delivery, safety and
notification systems (M9). The repo was created and named in minutes (M10), the domain
registered the same evening (M13, M15).

### 1.3 The three goals (M23, M24, M47, M48)

Stated plainly, and repeated:

1. **Eliminate world hunger.** "Everything in it should aim toward utilizing all platforms,
   intelligence, robots, ecosystem to … allow humans to eat, and to eat even if they cannot
   afford it," and let world food organizations run "a massive mega global workflow that
   allows all humans to be fed" (M23). Robots and the standard in "poor and areas of famine"
   (M47).
2. **Make the world healthier.** "The right organic food with the right and correct nutrition
   values that matches the age, health, weight, gender and other needs of individuals … the
   right amounts cooked the right way at the right time to the right person with the exact
   cost with the least amount of waste" (M24). Health organizations should "rely on this
   system, extend it and report on it" to change eating habits, "specially for poorer
   nations" (M48).
3. **Put robots to work for people.** Robots that command the directory and reason like a
   cook (M17), that work in teams (M17), in homes, restaurants, weddings, factories and relief
   kitchens (M46), and that learn and relearn "at quantum robot/AI speeds" (M47).

### 1.4 What the founder kept repeating

| Theme | Where | What it tells us |
|---|---|---|
| **Free and open for everyone** | M6, M7, M19, M20, M21 | No keys, no membership, any manufacturer, any extension, hosted anywhere |
| **Our own standard** | M6, M10, M12 | Pride of invention and a wish for worldwide recognition of the name |
| **Full picture before acting** | M31–M42 | A request should carry everything a provider needs "to respond with full awareness" (M42) |
| **Everyone signs** | M43, M54 | Legal acceptance, a ledger "everyone doing anything next can sign and confirm" |
| **Course-correct like a human cook, and beyond** | M17, M43, M44, M50 | Recovery, salvage, switching dishes, interruptions, stove left on, spoiled milk |
| **Exact amounts, less waste** | M24, M45 | The macro claim: planning at scale shrinks waste, garbage, plastic, deliveries, traffic |
| **Nature as a model** | M49 | No central command, harmony, recovery, "like bees" |
| **Future-proof** | M51 | Must survive "massive daily improvements and leaps in technology and in AI" |
| **Honest critique** | M67–M72, M75 | Asked to be told why it won't work, from six viewpoints, and to publish it |
| **World-class presentation** | M79, M81, M84 | Study the best sites; a message every role understands in a minute |
| **Memory and provenance** | M85 | Asked for every prompt saved; this file is the answer to that wish |

### 1.5 Values and fears visible between the lines

- **Dignity in the household.** The brainstorm asks about elderly and disabled family
  members, babies, sick people fed in their rooms, prayer, holding hands, music (M39). The
  robot is meant to fit the family, not the other way round.
- **Safety first, always.** Stove left on, smoke detectors, pets knocking things over, kids
  asking to disable guards, medication timing, allergies (M31, M33, M44, M50).
- **Fear of waste** more than fear of cost: waste of food, energy, time, plastic, trips (M45).
- **Fear of being copied or blocked:** patents (M14, M16), name recognition (M12).
- **Impatience with hype in the other direction:** the critiques were requested, not
  resisted, and the honest reframing of hunger was accepted (the action plan was approved
  and committed, M78).

### 1.6 Ideas the founder had that the repository does not yet reflect

These come straight from the brainstorm and are the richest unbuilt material:

1. **A machine-readable registry of household and robot context** (the "enhanced payload",
   M31–M41). The repo describes 15 facet families in prose (`PROTOCOL.md` §4.1) and has a
   generic `Facet` object, but no `vocab/facets.json`, no per-facet privacy default, no
   derived-constraint transforms, and only five facets in the worked example.
2. **Fleets:** restaurants, weddings, donation kitchens and food factories (M46). Mentioned,
   never modelled or simulated.
3. **The farm side of the loop:** what to grow, when and where, from forward demand (M45).
   The city simulator models farms; the standard has no farm, harvest or demand-signal
   document.
4. **Service and serving:** reminders before food is ready, table setting, cultural eating
   style, serving to rooms, lunch boxes, packing for donation (M31). The recipe format has a
   `service` section; nothing executes it.
5. **The robot's own standing:** warranty, subscriptions, recalls, unpaid services that may
   stop (M31, M41). Partly in `self` facets; no credential or subscription model beyond
   prose.
6. **Public figures and influencers who might care** (M74). Deliberately not in the repo,
   because naming people reads as endorsement. See the tension in §4.6.
7. **The WFP/WHO evaluation draft** (M72–M73) and the **stakeholder tracker** (M74, M76):
   `ACTION-PLAN.md` refers to both ("the concept note", "the stakeholder tracker"), but
   neither file is in the repository. They need to be recreated or the references removed.
8. **Twenty-four languages** (M1): the standard carries `en` and `ar`; the other 22 fifi
   languages are planned as sidecars.
9. **Recipes at scale:** the 1,881 fifi recipes and the World Cuisines project (M1, M11).
   Zero have been converted; the index holds one example recipe.

---

## 2. How the idea evolved

| Stage | Messages | What changed and why |
|---|---|---|
| **Encyclopedia for one site** | M1–M3 | A content project with a halal filter and a Devin prompt |
| **Index for every robot** | M4–M11 | Discovery that no shared standard exists; decision to invent one and give it away |
| **The reasoner** | M17–M18 | Not a database: "what can I cook", "fix and resume", "feed 40 in 3 hours", modes for gas, battery and budget |
| **Open to everyone and a marketplace** | M19–M21 | Extensions, private catalogs, grocers and restaurants trading through the standard |
| **The mission** | M23–M24 | Hunger and health become the stated purpose of everything |
| **The brainstorm** | M30–M57 | The Mission document: context facets, providers, ledger, orchestrators, PACE fallbacks, budgets, degradations, assessments, nature |
| **Proof by simulation** | M60–M66 | Four simulators, each with the protocol on and off, to find breaking points |
| **The critique round** | M67–M77 | Red team, technical, Musk, Claude, Anthropic, WFP/WHO, reviewers → `ACTION-PLAN.md` → **Core 0.2**: small normative core, everything else experimental; envelopes, strict schemas, safety on the device, signed records |
| **World-class presentation** | M79–M84 | Study of fourteen sites and the robotics landscape → `STRATEGY.md`, website v1.5, docs site, this brief |

**Decisions already made, and why** (from the repository):

- **Core small, profiles optional** (`CORE.md`, concern C8): a device should implement
  Cookwala in a week. The Mission, market and relief layers stay experimental until two
  independent implementations exist.
- **"Safety is local"** (C5, C14): no safety function depends on the network or any message.
- **Refusal instead of guessing** (C9): sensor ladders; no oil thermometer means no deep
  frying.
- **Temperatures in °C only, money as decimal strings** (C10).
- **Honest hunger claims** (C4): "Cookwala contributes; it doesn't claim to end hunger alone".
- **People without robots first** (C20): the Humanitarian Profile works by SMS and CSV.
- **The one-liner changed** from "the world's first and largest robot cooking recipes index
  and CLI" to "the open standard for cooking safely: people, kitchens and robots"
  (`STRATEGY.md` §3). **The founder chose the first wording (M10); the strategy proposed the
  second and the website uses it. `README.md` and `PLAN.md` still open with the first.** This
  needs the founder's explicit confirmation (see §4.5).

---

## 3. Gap list: every intention mapped to the repository

Legend: **Done** (exists and works), **Spec** (designed and documented, not implemented),
**Partial**, **Missing**. The last column says what this engagement does about it.

### 3.1 Standard, index and tools

| # | Intention (message) | Where in the repo | Status | This engagement |
|---|---|---|---|---|
| G1 | A free index any robot can use, JSON, all details needed to cook end to end safely (M6) | `CORE.md`, `recipe.schema.json`, `/v1/recipes/` | **Partial**: 1 recipe published | Publish a first set of real Cookwala recipes (Egyptian home cooking, labelled by verification level); recipe browser |
| G2 | Follow local governance rules (M6) | `policy.schema.json`, `profiles/humanitarian/*.rulepack.json` | **Spec**: schema exists, one humanitarian pack | Nutrition and food-safety rule packs reviewable by dietitians and food-safety officers (RFC) |
| G3 | Open source for any manufacturer (M7) | Licences, `PATENTS.md`, `GOVERNANCE.md` | **Done** | Keep; add certification path |
| G4 | API specs, schemas, CLI, GraphQL (M9) | `api/`, `schemas/`, `CLI.md`, `API.md` | **Partial**: Core OpenAPI real; CLI is a design doc; only `cookwala_ref.py` runs | `pip install cookwala` package + CLI; TypeScript types; MCP server; reference hub |
| G5 | Interop with other robots, humans, fridge, stove, delivery, safety, notifications (M9) | `INTEROP.md`, `hub.openapi.yaml`, `bindings/matter.json`, ROS 2 actions | **Spec** (experimental) | Keep as profiles; reference hub shows robot + oven + person |
| G6 | Robots command the directory: what can I cook, fix and resume, rescue, store, feed N, teams (M17) | `REASONING.md`, `advice.schema.json`, `knowledge/`, examples | **Spec**: no running reasoner | Expose as MCP tools over the examples; mark experimental; a demo of "recover" over knowledge packs is a stretch goal |
| G7 | Modes: gas/electric, battery, conserve, week, budget (M18) | `profile.schema.json#OperatingMode`, `REASONING.md` §4 | **Spec** | Keep in profile; show in envelope explorer where modes change heat alternatives |
| G8 | Anyone adds extensions, agents, filters, rules, recipes; private or public, hosted anywhere (M19–M20) | `EXTENSIBILITY.md`, `extension.schema.json`, federation | **Spec** | Registry and directory pages with empty states; publish flow documented; federation RFC |
| G9 | Marketplace: grocers, restaurants, robot makers trade (M21) | `ECOSYSTEM.md`, `market.schema.json` | **Spec**, competition-law caveat | Keep experimental; "For companies" page says what exists |
| G10 | Export all fifi recipes, robot-ready (M11) | `EXPORT-FIFI.md` | **Missing**: 0 of 1,881 converted; rights decisions pending | Convert a first batch by hand with care; the bulk pipeline stays in fifirecipes. **Founder input: rights per collection** |
| G11 | 24 languages (M1) | `text` carries `en` + `ar`; sidecars planned | **Partial** | Site in English and Arabic; vocabulary labels in both; sidecar path documented |
| G12 | Halal filtering (M1) | fifirecipes' gate; `dietary` claims in recipe schema | **Partial** | Dietary rule packs (halal first) as data; the standard itself stays diet-neutral (§4.8) |
| G13 | Patent landscape and freedom to operate (M14, M16) | `PATENT-LANDSCAPE.md` | **Done** (preliminary) | Keep; link from Trust |

### 3.2 The enhanced payload (M31–M42)

| # | Intention | Where | Status | This engagement |
|---|---|---|---|---|
| G14 | Robot self: health, battery, maintenance, firmware, patches, mods, licences, subscriptions, tier, warranty, maintainer, recalls, unpaid services (M31, M41) | `PROTOCOL.md` §4.1 `self`; `capabilities.schema.json`; `cw.facet.self.battery` in the example | **Partial** | `vocab/facets.json` with the `self` family; `capabilities` gains `standing` (warranty, recalls, subscriptions) as optional, local-first fields (RFC-0001) |
| G15 | Delivery, grocery and maintenance subscriptions; bundled services (M31) | `commerce` facet prose; `market.schema.json` | **Spec** | Facet entries; nothing leaves the home except a derived constraint ("deliver to door 17:00–18:00") |
| G16 | Power and gas quotas per appliance; time-of-day rules; shared kitchen schedules (M31) | `resources` facet; `OperatingMode.energy` | **Partial** | Facets with privacy defaults; the envelope explorer shows heat alternatives |
| G17 | People's schedules and overlap with the robot's path (M31) | `household.people`; `cw.facet.household.schedule` | **Partial** | Facet, class `secret` (absence = burglary data); shared only as "no movement in hallway 15:00–15:30" |
| G18 | Authorization: cook, clean, fetch, open the door, trash, serve; rooms, stairs (M31) | `mandate` section of Mission; `AgentMandate` in Core | **Spec** | Mandate vocabulary in facets; Core `AgentMandate` stays the normative piece |
| G19 | Dining: how many eat, pick up or deliver to seats, reminders, utensils, layout, cultural eating style, standing table items, food to rooms, containers (M31) | `service` facet; `recipe.service` | **Spec** | `service` facet family and recipe `service` kept; one worked example (lunch boxes) |
| G20 | Purpose: dining, school, box, event, wedding, shipping, donation (M31) | `Mission.header.type`; `intent` | **Partial** | Mission types enumerated: `home_meal`, `school_meals`, `event`, `packed`, `donation`, `relief` (fleet RFC) |
| G21 | Restrictions: halal, allergies, vegetarian, diabetes, cancer, medication timing, interactions (M31) | `household.health`; `PersonNutrition`; allergen blocks in Core | **Partial** | Health facets `sensitive`, local-only; allergen block normative; medication timing as a local constraint, never shared; **clinician boundary** (§4.9) |
| G22 | Kitchen layout, tool positions, appliances smart or not, fullness, fridge notes (leaking, cold spots, overstacked), time to fetch, leftover space and preferences, deep freezer (M32) | `space` facet; `inventory.schema.json`; `KitchenProfile` | **Partial** | Facets; a "kitchen operational design domain" view in the architecture review |
| G23 | Power, Wi-Fi and internet strength per location (M32) | `space.environment` | **Prose** | Facet entries |
| G24 | Other robots and devices: same model, capabilities, interfaces, commandable or physical only, status, health, response time, issues, recalls, risk, smoke detector state, alarm history (M33) | `devices` facet; `session.schema.json` leases; finding F2 | **Partial** | Facets; device recall feed reuse; Matter lease adapter stays an open item |
| G25 | Pets, babies, kids, babysitter, housekeeper, mail, repair, garden crews; who handles pets; conflicts (M34) | `household.people`; `cw.facet.household.pets`; home simulator (dog) | **Partial** | Facets; pet-toxic foods rule in a household safety pack |
| G26 | Family rules, quotas, speed, minimum expectations, hard NOs; may the robot ask; manufacturer SLA for unknowns (M34) | `mandate`; `decisionRights`; `escalation` | **Spec** | Keep; mandate facets |
| G27 | Construction, repairs, lighting, glare, low vision; insurance; caution level (M34) | `degradations`, `adaptations`; `space.environment` | **Spec**, simulated | Keep |
| G28 | Household economic level, openness, routine vs novelty, preferences, colours, layouts, hot/cold/reheat (M35) | `household.culture`, `household.tastes`; anti-profiling rule | **Prose** | **Economic level is replaced by an owner-set budget posture; never inferred, never shared** (§4.1) |
| G29 | Drinks and coffee habits, extras, sauces, snacks, where snacks are left (M36) | `household.tastes` | **Prose** | Facets, class `household` |
| G30 | Ventilation, temperature, humidity, airflow, floor level, space, foot traffic; garden produce (M37) | `space.environment`; `KitchenProfile.ventilation` | **Partial** | Facets |
| G31 | Shopping habits, cadence, discounts, stores, apps, excluded brands (M38) | `commerce`; `order.schema.json` | **Prose** | Facets; providers get derived order constraints only |
| G32 | Rituals: music, prayer, holding hands; baby, elderly, disabled, wheelchair; messy eaters (M39) | `household.culture`; `ClientProfile.schedule.fasting` | **Partial**: fasting yes, prayer and rituals no | Facets with class `sensitive` for religion; prayer windows as "do not serve 18:40–18:55" derived constraints |
| G33 | Waste habits, signs of finishing, speed, dishes back, arguments, throwing, guests, complaints, consistent change requests, times humans cook themselves (M40) | `household.behavior`; `outcome.feedback` | **Prose** | Facets (class `household`); feedback loop into outcome; **no behavioural scoring of people** |
| G34 | Incident memory: robot vs robot/device/pot, alarms, give-ups, who helped, conflicts and lessons, escalations to support, overrides, reboots, recalls, unpaid services (M41) | `history` facet; `IncidentReport` (anonymous, public); `vocab/incidents.json` | **Partial**: public anonymous reports exist; household-local memory does not | Local incident memory schema in the household profile; the public report stays anonymous |
| G35 | Full picture for every provider in the chain (M42) | Mission views, `PROTOCOL.md` §6 | **Spec** | Resolved as "full picture at home, derived constraints abroad" (§4.1) |

### 3.3 Providers, trust, decisions, degraded operation (M43–M57)

| # | Intention | Where | Status | This engagement |
|---|---|---|---|---|
| G36 | Subscriptions, preferred stores, AI providers, authorized people; evidence and keys; identity of robot and owner (M43) | `credentials`, `routing`; DIDs and VCs in `PROTOCOL.md` §5 | **Spec** | Keep in Mission profile; Core keeps `KeyRecord`, `AgentMandate` |
| G37 | Legal acceptance with blockchain signature; ledger everyone signs (M43) | Event log + witnessed checkpoints (`CORE.md` §5); anchoring optional | **Done** in Core (not a blockchain) | **Founder decision:** transparency log only, or also public-chain anchoring (§4.7) |
| G38 | Providers invoked directly, by chain, or via optional orchestrators with tiers; retries (M43) | `routing`, `DECISIONS.md` §5 | **Spec**, simulated | Keep |
| G39 | A plan with steps, expectations, what to wait for, monitors; robot writes progress, lessons, failures (M43) | `plan`, `execution`, `outcome`; `ExecutionLog` in Core | **Spec**; Core log is real | Keep; LeRobot and OTel exporters use the Core log |
| G40 | Retry rules, non-retryable failures, salvage, switch dish (M43) | `DECISIONS.md` §3–4; playbooks | **Spec** | Keep |
| G41 | Environment prep plan; deviations (baby, cat, dog); stop, clean, prioritize the human, resume, escalate, re-request (M44) | `RECIPE-FORMAT.md` `prep`; `PROTOCOL.md` §7.2–7.3 | **Spec** | Keep; worked example in docs |
| G42 | Mass adoption → exact amounts, less waste, garbage, plastic, deliveries; what to grow; traffic and cities (M45) | `PROTOCOL.md` §10; city, country and world simulators | **Partial**: simulated, labelled illustrative | Farm and supply RFC (surplus and aggregated demand signals); Impact page with measured / modelled / assumed labels |
| G43 | Fleets: restaurants, weddings, donations, factories; budget posture (M46) | Mentions in `PROTOCOL.md` §7.4, Open-RMF in `ROBOTICS.md` | **Missing** | Fleet and community-kitchen profile RFC; disaster-kitchen flow; one example |
| G44 | WFP-style programs feed with high consumption and low waste; robots in famine areas (M47) | `MISSION.md`, `relief.schema.json`, Humanitarian Profile | **Partial**, honestly reframed | Surplus-to-plate end-to-end design; pilot protocol; impact measures |
| G45 | WHO-style programs extend and report; healthier habits; poorer nations (M48) | `HEALTH.md`, nutrition rules in the humanitarian pack | **Partial** | Health profile with rule packs for sodium, sugar, fat, fruit and vegetables, allergens, hot-holding, cooling, vulnerable groups; review template for dietitians |
| G46 | Like bees: no central command, harmony, recovery (M49) | `PROTOCOL.md` §8 (table of natural analogues) | **Prose** | Federation architecture RFC: catalogs, registries, hubs, recall and incident gossip, transparency logs; cookwala.ai as one node among many |
| G47 | Floors and dishes, interruptions, stove left on or turned off, spoiled milk (M50) | `cw.op.clean`, playbooks (19), stove watchdog and spoilage watch in prose | **Partial** | Playbooks listed in docs; household safety pack rules (unattended heat, time-temperature) |
| G48 | Future-proof against AI leaps (M51) | `PROTOCOL.md` §2 (narrow waist, outcomes not methods) | **Done** as principle | Restate in the architecture review |
| G49 | Prior art, parallels, novelty (M52) | `PRIOR-ART.md` | **Done** | Keep; cite on Ideas page |
| G50 | Recipe format for all of this (M53) | `RECIPE-FORMAT.md` | **Spec** | Keep; more recipes exercise it |
| G51 | Signing, closing, failing; decisions when the robot lacks knowledge; partial deciders; drop vs alternatives; plan B and C (M54) | `DECISIONS.md` | **Spec**, simulated | Keep |
| G52 | Cost and time overruns: who escalates, how tracked (M55) | Budgets with thresholds | **Spec**, simulated | Keep |
| G53 | Low vision, low light: who adapts, deviations in taste accepted (M56) | Degradations and adaptations | **Spec**, simulated | Keep |
| G54 | Providers share capabilities and disagree; a chosen agent decides; recharge before cooking (M57) | Assessments, reconciliation, calibration | **Spec**, simulated | Keep |

### 3.4 Simulators, critiques, presentation (M60–M84)

| # | Intention | Where | Status | This engagement |
|---|---|---|---|---|
| G55 | Four playable simulators with protocol on and off (M60–M65) | `sim/` | **Done** | Explain for non-experts; label "illustrative model" on every chart; add ranges where cheap |
| G56 | Critiques from six viewpoints; reviewers; a plan; design changes (M67–M77) | `CRITIQUES.md`, `ACTION-PLAN.md`, Core 0.2 | **Done** | Repeat the exercise on the new work; publish |
| G57 | WFP/WHO evaluation draft and concept note (M72–M73) | Referenced in `ACTION-PLAN.md`; **file absent** | **Missing** | Write `docs/humanitarian/CONCEPT-NOTE.md` (no partner names as commitments) |
| G58 | Stakeholder map and tracker (M74, M76) | Referenced; **file absent** | **Missing** | `docs/STAKEHOLDERS.md` (message, options, first success, flow per group); outreach list as "who we want to work with", clearly not contacted |
| G59 | Public figures and influencers (M74) | Not in repo | **Deliberately missing** | §4.6: do not name people as supporters; the founder may keep a private list |
| G60 | Learn from world-class sites and the robotics landscape (M79–M80) | `STRATEGY.md` §1 (one table) | **Partial** | `docs/research/WEB-BENCHMARK.md` with per-site notes |
| G61 | New mission statement, vision, story, website, docs, API, SDK, demos (M81, M84) | `STRATEGY.md`, site v1.5 | **Partial** | This engagement's Part B |
| G62 | Every role understands in a minute how it affects them (M84) | Five path cards on the home page | **Partial** | A page per stakeholder group, a pathfinder, in English and Arabic |

---

## 4. Tensions, and how this engagement resolves them

### 4.1 A full picture for providers vs privacy and dignity (M42 vs `PROTOCOL.md` §6)

The founder wants the request to carry everything so providers "respond with full awareness".
The same data (absences, children, health, religion, income) is a burglary plan and a
profiling tool. **Resolution:** the full picture lives at home, in a local **Household
Context Profile**. Providers receive **derived constraints** ("deliver 17:00–18:00 to the
door", "no grapefruit"), never the facts behind them. Every facet type carries a default
privacy class; `secret` for absences, children and layouts; `sensitive` for health,
religion and culture; nothing leaves without consent, and everything is erasable. The
founder's "rich, moderate or poor" becomes an **owner-set budget posture**, never inferred
and never shared. No behavioural scoring of family members is ever produced. This is
RFC-0001.

### 4.2 Ending hunger vs honest claims (M23 vs C4)

Hunger is driven by poverty, conflict, climate and prices. Cookwala's contribution is real
but partial. **Resolution:** the mission stays plainly stated ("help end hunger"), and the
site shows the contribution path with evidence: kilograms rescued, meals served, nutrition
pass rate, cost per meal, time to claim, safety incidents, each labelled measured, modelled
or assumed. Cookwala never claims to end hunger alone. The world simulator already says
where robots are not (Sub-Saharan Africa, South Asia) and that rescue covers a small share.

### 4.3 One standard vs "like bees" (M6 vs M49)

A single index run by one company contradicts decentralization. **Resolution:** Cookwala is
a **narrow-waist standard** plus a **federation**: anyone can run a catalog, a registry or a
hub; cookwala.ai is one node; recalls and incidents spread through signed feeds; event logs
use witnessed checkpoints so no party can rewrite history. Governance moves to a neutral
foundation. RFC-0006 makes this concrete.

### 4.4 Robots vs jobs and dignity

**Resolution:** prioritize uses that help people who cannot cook for themselves (older
people, disabled people, care homes, community and disaster kitchens); humans can always
cook; robots augment kitchen staff and never replace the cook's name on a recipe; a labour
seat on the steering committee; the site names the new roles that appear (recipe engineers,
food-robot technicians, certifiers) without promising numbers.

### 4.5 "The world's first and largest robot cooking recipes index and CLI" (M10) vs the new one-liner

The founder named the project. The strategy retired the phrase because "largest" is false
with one recipe and "first" needs verification. **Resolution proposed:** keep the founder's
sentence as the **origin and the goal** ("started as…", "aims to become…") and lead with
"the open standard for cooking safely: people, kitchens and robots". `README.md` and
`PLAN.md` are updated to match the site. **This needs the founder's confirmation.**

### 4.6 Naming people and organizations (M74) vs no impersonation

Listing CEOs, influencers or agencies on the site reads as endorsement. **Resolution:**
organizations appear only as sources or as "who we want to work with", labelled as not
contacted; no person is named as a supporter; the founder may keep a private outreach list
outside the public repo.

### 4.7 "Blockchain signature" (M43) vs a transparency log

Core 0.2 uses hash-chained event logs with witnessed checkpoints, which gives tamper
evidence without a blockchain; public-chain anchoring is optional. A blockchain holding
household data would conflict with erasure. **Founder decision needed** (open since
`PROTOCOL.md` §15): transparency log only, or also optional public anchoring of checkpoint
heads. The architecture review recommends the first for now.

### 4.8 Halal-only origin (M1) vs every cuisine

fifi.cooking's content is halal-checked; the standard must serve every cuisine and every
diet. **Resolution:** the standard is diet-neutral; dietary rules are **rule packs** that a
household, program or venue turns on; the halal pack ships first because the corpus and the
region call for it; no recipe is excluded from the standard, only filtered where a pack is
active.

### 4.9 Personal nutrition for health conditions (M24) vs medical-device rules

**Resolution:** general nutrition guidance only (sodium, free sugars, fats, fruit and
vegetables, portion), with care variants for children, older people and pregnancy as
food-safety rules; condition-specific diets only with a clinician's targets, entered locally;
every rule pack names its reviewer and review status. Health content is written to be
reviewable by dietitians and food-safety officers, and says what it does not do.

### 4.10 Demand signals for cities and farms (M45) vs competition law (C7)

**Resolution:** signals are aggregated, delayed and never carry prices between competitors;
the farm RFC designs the aggregation, and the site marks the whole area "next, after counsel
review".

### 4.11 Everything at once (the brainstorm) vs adoption

**Resolution:** the order stays "useful before robots": food banks, kitchens and device
makers first; the Mission profile remains the long-term architecture, visible and
experimental.

---

## 5. What needs the founder's own voice (TODOs carried into the work)

1. The origin story, in their words (one paragraph for the home page and the whitepaper).
2. Confirmation of the one-liner change (§4.5).
3. Rights per fifi collection before any bulk conversion (`EXPORT-FIFI.md` §2).
4. Transparency log vs public anchoring (§4.7).
5. Whether a private outreach list of people and organizations should exist, and where.
6. Pricing of any future services (certification, hub software, dataset licences).
7. Partner names: none are used until a partner agrees in writing.
