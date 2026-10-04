# Cookwala Reasoning: how robots ask, decide and course-correct

> **Status: experimental profile.** Not part of Cookwala Core. See [CORE.md](CORE.md) section 10 for what is normative today.

A recipe index answers "give me recipe X". A cook, human or robot, needs much more than
that:

- *What can I make with this?*
- *I over-salted it, now what?*
- *The chicken sat out, is it safe?*
- *Three of us are here, who does what?*
- *How do I keep this for three days?*
- *Feed 40 people in 3 hours on $60, gas only, my battery's at half.*

The **Cookwala Reasoner** answers these questions with structured, safety-checked,
machine-executable answers. Every answer is a ranked set of options, and each option is
something a robot can apply directly: a recipe patch with a resume point, a team
schedule, a storage plan, a production plan, or an order intent.

Schemas: [`advice.schema.json`](../schemas/advice.schema.json) (requests and answers),
[`knowledge.schema.json`](../schemas/knowledge.schema.json) (playbooks, roles,
substitutions, transformations, storage, energy),
[`profile.schema.json`](../schemas/profile.schema.json) (profiles and operating modes).
Seed knowledge: [`knowledge/`](../knowledge). Examples: [`examples/advice/`](../examples/advice).

## 1. Design principles

1. **Neuro-symbolic: the LLM proposes, engines verify.** Language models parse questions,
   suggest creative options and explain. Deterministic engines (matching, constraint
   solving, food-safety rules, simulation, graph validation) decide what's allowed and
   check every option. No option reaches a robot unless it passed the engines.
2. **Safety gate first, every time.** Before generating any option, the food-safety engine
   rules on the situation. When the verdict is `unsafe_discard`, no option may keep that
   food. The only options left are discard, restart, or a different meal.
3. **Answers are actions, not prose.** Every option carries a machine-applicable payload
   (`RecipePatch` + `resumeAt`, `TeamPlan`, `StoragePlan`, `ProductionPlan`,
   `OrderIntent`), plus a human explanation in the user's language.
4. **Ask when unsure.** `status: needs_input` returns targeted questions. Each question
   names a `sensor` that lets a robot answer it by measuring instead of asking a person.
5. **Evidence and confidence on everything.** Each option cites its playbook, rule,
   recipe, solver run or field statistics, with a confidence score that is calibrated
   over time from execution reports.
6. **Same answer offline.** The full reasoner runs on a kitchen hub. The cloud index runs a
   stateless version for devices without a hub. Private data stays on the hub.
7. **Everything is extensible.** Intents, knowledge, filters, rankers, models and cost
   terms can all be added by anyone (see [EXTENSIBILITY.md](EXTENSIBILITY.md)), but
   extensions can't bypass the safety gate.

## 2. The questions it answers (intents)

| Intent | Example | Main engine(s) | Output |
|---|---|---|---|
| `ask` | free text in any language | parser → routes to an intent | any |
| `cook_from` | "I have chicken, rice, onions, yogurt — what can I cook?" | matcher + substitution graph + capability match + policy | ranked recipes with coverage |
| `substitute` | "No buttermilk / guest allergic to eggs" | role-aware substitution | substitution + adjustments |
| `recover` | "Too salty", "sauce split", "burnt bottom", "left out 3 h" | food-safety gate → playbooks → patch builder → simulator | patch + resume point, or discard |
| `repurpose` | "Rice turned mushy — rescue the meal?" | transformation graph + cook_from | other recipes using the intermediate |
| `adapt_equipment` | "No oven" / "only gas" / "no blender" | node alternatives + method mapping | patched recipe |
| `team_plan` | "I have two robots helping — who does what, in what order?" | CP-SAT scheduler + contract-net bids | TeamPlan with leases and handoffs |
| `store` | "Store for 3 days — how to cook, cool, contain, reheat?" | storage engine + cook-for-storage patcher | StoragePlan |
| `feed` | "40 people, 3 hours, $60, gas only" / "two meals a day for a week" | menu optimizer (MILP) + scaler + scheduler | ProductionPlan |
| `rescale` | "Make it for 13" / "I only have 600 g of meat" | non-linear scaler | patched recipe |
| `retime` | "Guests are 45 min late" / "I'm running behind" | rescheduler + hold planner | updated plan |
| `leftovers` | "Use these leftovers" | transformation graph + storage rules | recipes + safety check |
| `diagnose` | "Oil temp stuck at 140 °C", "probe reads 4 °C in boiling soup" | anomaly rules + device model | likely causes + actions |
| `texture_modify` | "Make it IDDSI level 5 for grandpa" | texture rules | patched recipe |
| `diet_merge` | "One vegan, one nut allergy, two halal — one menu" | constraint intersection + substitution | recipes or split plan |
| `nutrition_target` | "≤ 600 kcal, ≥ 30 g protein" | nutrition engine + optimizer | adjusted recipes |
| `shopping_optimize` | "Cheapest basket for this week's plan" | basket optimizer over offers | OrderIntent |
| `custom` | anything an extension defines | the extension's advisor | extension-defined |

## 3. Everything a cook runs into (criteria catalog)

The reasoner models all of these as **context, constraints, incidents or objectives**.
That's what lets one protocol course-direct (plan) and course-correct (recover).

**Ingredients**
- What's on hand.
- Quantity limits.
- Freshness and expiry.
- Ripeness and quality variance (e.g. watery tomatoes).
- Substitutions by functional role.
- Halal/kosher/organic sourcing.
- Allergens and cross-contact.
- Seasonality.
- Price.
- Rationing over a time horizon.
- Waste minimization.

**People**
- Number of diners.
- Ages (infant, child, senior).
- Allergies.
- Diets (halal, vegetarian…).
- Medical needs (low sodium, diabetic, renal).
- Swallowing needs (IDDSI levels).
- Preferences, spice level and appetite.
- Cultural expectations and authenticity.
- Fasting schedules (iftar/suhoor timing).
- Serving style (plated, family, buffet, packed, delivered).

**Time**
- Serve time.
- Time available.
- Active vs passive time.
- Make-ahead windows.
- Hold limits.
- Running late or early.
- Guests late.
- Parallel dishes finishing together.
- Overnight steps (soaking, marinating, proofing).

**Equipment**
- Burners, ovens and their sizes.
- Vessel capacity and material (induction-compatible?).
- Missing or broken equipment.
- Shared resources (one oven for three dishes).
- Altitude (boiling point drops, so boiling and baking need adjusting).
- Ventilation.

**Energy**
- Gas vs electric vs induction vs propane vs charcoal vs solar.
- Tariffs and time-of-use pricing.
- Peak power limits (breaker, generator, inverter).
- Outages.
- Carbon.

**Robots**
- Capabilities and reliability per operation.
- Battery level and reserve.
- Docking and charging windows.
- Reach and zones.
- Tool changes.
- Sensor availability and failures.
- Payload limits.
- Speed.
- Hand-offs between robots and to humans.

**Humans**
- Availability and skill.
- Presence requirements.
- Willingness to do certain steps.
- Confirmations.
- Overrides.

**Food safety**
- Danger-zone time.
- Critical cooking temperatures (CCPs).
- Cooling rates.
- Reheating.
- Hot and cold holding.
- Cross-contamination.
- Allergen cross-contact.
- Physical hazards.
- Pest contact.
- Raw-egg and undercooked dishes for vulnerable diners.

**Quality**
- Seasoning balance (salt, acid, sweet, heat, umami).
- Texture (thin, thick, mushy, tough, soggy).
- Doneness.
- Color.
- Emulsion stability.
- Dough hydration.
- Rise.
- Presentation.

**Economics**
- Budget per meal, day, week or event.
- Energy cost.
- Shopping vs pantry.
- Meal kits vs ready meals vs cooking.
- Bulk buying.

**Storage and logistics**
- Fridge and freezer capacity.
- Containers.
- Labeling.
- Thawing.
- Transport.
- Lunch boxes.
- Delivery handoff.
- Cold chain.

**Environment**
- Noise (night cooking).
- Smoke and odor.
- Heat in the kitchen.
- Children and pets nearby.
- Humidity (affects baking).

**Incidents** (vocab/incidents.json, 45 types)
- Seasoning errors.
- Burning.
- Splitting.
- Under- or overcooking.
- Time-temperature abuse.
- Outages.
- Contamination.
- Wrong ingredient or wrong order.
- Spills.
- Boil-overs.
- Sensor or actuator failures.
- Robot battery low.
- Robot stuck.
- Equipment failure.

## 4. Operating modes (energy, battery, ingredients, budget)

An **Operating Mode** (`profile.schema.json#/$defs/OperatingMode`) can be set per hub,
session or request; the most specific one wins. The planner turns it into **hard limits**
and **objective weights**:

| Setting | Hard limits it creates | What it changes in plans |
|---|---|---|
| `energy.sources` / `avoid` | Nodes may only use the available heat sources | Picks `node.alternatives[]` (e.g. induction → gas), and recipes whose methods fit |
| `energy.goal = min_energy / min_cost / min_carbon` | `budgetKWh`, `peakLimitW` | Prefers pressure-cooking, kettle-boiling, lids on, one-pot, batch oven use, residual heat, microwave for small portions; schedules around peak power; uses time-of-use tariffs |
| `gridOutage`, `off_grid` | No electric appliances (or battery-only) | Gas/propane/solar methods, no-cook recipes, fridge-protection steps |
| `robots[].level` / `pct` / `minReservePct` | Robot energy budget ≥ reserve at plan end | Battery-heavy tasks (walking, lifting, long stirring) go to charged robots or humans; low-battery robots get short, stationary tasks; docking windows are scheduled |
| `conserve.ingredients` (horizon, strategy, protect) | Total use over the horizon ≤ inventory; protected items stay for later | Multi-day menu optimization; stretching (`economy.bulkWith`, e.g. lentils in kofta); smaller portions within `minKcalPerPersonDay`; expiring items first |
| `budget.mode / amount / period` | Cost (ingredients + energy) ≤ budget | Cheap-role substitutions, pantry-first, legume/grain-forward menus, bulk batches; shopping only if allowed |
| `time`, `quality`, `noise` | Time limits; quiet = no blender/robot motion at night | Faster alternatives vs best-quality methods |
| `weights` | n/a | Direct objective weights for experts |

Presets bundle these settings: `eco`, `budget`, `fast`, `quiet`, `off_grid`,
`week_saver`, `feast`, `outage` and `battery_saver`.

Energy estimates come from `node.energy`, node alternatives, and
[`knowledge/energy.json`](../knowledge/energy.json) (efficiency ranges by heat source,
e.g. induction ~80–90%, gas ~30–45%, oven ~10–20%; these are planning estimates). Robot
energy is estimated from the robot profile's `battery.drawW` per activity × planned task
time.

## 5. Engines and algorithms

```
         question (JSON or natural language, any language)
                 │
          ┌──────▼──────┐   LLM (local or BYO) → AdviceRequest (schema-constrained)
          │   Parser    │   resolves names → cw.ing ids, units, intent
          └──────┬──────┘
          ┌──────▼──────┐   policy packs + food-safety rules + allergen/diet constraints
          │ Safety gate │── unsafe_discard ─► discard / restart / alternative-meal options only
          └──────┬──────┘
   ┌─────────────┼───────────────┬───────────────┬────────────────┐
┌──▼───┐   ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼──────┐   ┌─────▼─────┐
│Match │   │ Playbooks │   │ Planner   │   │ Storage &  │   │ Menu      │
│+subst│   │ + patcher │   │ CP-SAT    │   │ safety sim │   │ optimizer │
└──┬───┘   └─────┬─────┘   └─────┬─────┘   └─────┬──────┘   └─────┬─────┘
   └─────────────┴──────┬────────┴───────────────┴────────────────┘
                 ┌──────▼──────┐  schema + graph validation, policy re-check on patched
                 │  Verifier   │  recipes, simulator dry-run, capability fit, mode limits
                 └──────┬──────┘
                 ┌──────▼──────┐  objective weights from the operating mode + extension rankers
                 │   Ranker    │  + learned success rates (execution reports)
                 └──────┬──────┘
                 ┌──────▼──────┐  LLM explanation in the user's language (never changes payloads)
                 │  Explainer  │
                 └──────┬──────┘
                  AdviceResponse
```

### 5.1 Matcher (cook_from, leftovers, diet_merge)
- **Index:** inverted index from `cw.ing` ids and classes to recipes, plus per-recipe
  ingredient role vectors (from [`knowledge/roles.json`](../knowledge/roles.json)).
- **Scoring:** weighted coverage
  `Σ have(i)·w(i) / Σ w(i)`, where w is high for main/bulk roles and low for garnish and
  pantry staples. Penalties apply for missing items, substitutions (by quality loss),
  shopping, and unmet constraints.
- **Substitution graph:** weighted directed graph from
  [`knowledge/substitutions.json`](../knowledge/substitutions.json) and role similarity.
  Dijkstra finds the cheapest valid replacement under the active dietary and allergen
  constraints (it never introduces a forbidden ingredient).
- **Feasibility:** each candidate's process graph is checked against the kitchen's
  capabilities (`/v1/match` logic) and the operating mode.
- **Ranking:** use-first (expiring) bonus, budget, energy, time, automation coverage, and
  learned success rate.

### 5.2 Playbooks + patcher (recover, repurpose, adapt_equipment)
1. **Classify the incident** (`cw.incident.*`). The LLM maps free text, and the robot can
   report the type directly.
2. **Safety gate:** the playbook's `safetyGate` plus the active policy packs.
3. **Diagnostics:** unanswered `diagnostics` become `questions`. Each is answered by a
   sensor if available, otherwise by a human.
4. **Instantiate options:** the playbook's `when` conditions decide which apply, and
   `{placeholders}` are resolved (e.g. `salt_ratio` from saltAdded/saltExpected).
5. **Patch builder:** semantic ops (`scale_all`, `split_batch`, `insert_before`,
   `set_until`…) are applied to a copy of the running graph. Downstream params are
   recomputed: scaling quantities, timing with the mass exponent, vessel capacity
   (splitting across vessels when needed), and leases.
6. **Verify:** the patched recipe must pass `cookwala validate` + policy + simulator.
   `resumeAt` must point to a node whose inputs exist, and invalidated outputs go to
   `redo`.
7. **Repurpose** walks [`knowledge/transformations.json`](../knowledge/transformations.json)
   from the intermediate's class and issues, then runs the matcher with that intermediate
   as an available ingredient.
8. **No playbook matches:** the LLM may propose a patch built from vocabulary ops. It
   still goes through steps 5–6, is marked `evidence.kind = llm`, and gets lower
   confidence. A human must confirm it if the dish is at V2 or above.

### 5.3 Planner (team_plan, retime, feed schedules)
- **Model:** a flexible job-shop with resources.
  - **Jobs** are process nodes, split into parts when `allowSplitTasks` is set and the
    op is divisible (cutting, portioning).
  - **Machines** are actors whose capability manifests allow the op with the params.
  - **Resources** are burners, oven cavities, vessels and counter zones (leases).
- **Constraints:**
  - precedence (DAG edges) and `timing.nextWithin`;
  - `attention: continuous`, which blocks the actor;
  - hand-off times;
  - human-only steps;
  - battery: the sum of planned Wh stays at or above the reserve, with optional docking
    intervals;
  - energy peak (sum of appliance W per time slot ≤ `peakLimitW`);
  - presence windows.
- **Objective:** a weighted sum from the operating mode: lateness vs `serveAt`, makespan,
  hot-hold time (quality and safety), energy cost, battery use, human effort, and
  balanced utilization.
- **Solver:** Google OR-Tools CP-SAT with interval variables, no-overlap and cumulative
  constraints, and optional intervals for alternative assignments. It returns optimal or
  feasible within a time limit, with a greedy list-scheduling fallback on tiny devices.
- **Execution:** rolling-horizon re-planning on `cookwala.task.failed`,
  `device.battery`, `device.offline`, late steps or new robots joining. Only unstarted
  tasks move, and leases are renegotiated.

### 5.4 Teaming protocol (robots talking to robots)
A **contract-net** exchange on the event bus (`cookwala.team.*`, `event.schema.json#/$defs/TeamData`):

```
robot A (or hub)  ── team.cfp {tasks, deadline} ─────────────►  all available actors
helpers           ◄─ team.bid {canDo, eta, duration, batteryAfterPct, energyWh, confidence}
hub planner       ── runs team_plan with the bids as candidate assignments
                  ── team.award {actor, tasks} ─────────────►  winners  (team.decline to others)
everyone          ── task.* / lease.* / handoff.* as usual; team.replan on changes
```

- **With a hub,** the hub is the coordinator and runs CP-SAT.
- **Without a hub,** the requesting robot runs the same solver (the reference library is
  embeddable) and broadcasts the plan.
- **Agents that speak A2A** take part via the hub's AgentCard: the `team_plan` skill and
  A2A task states.
- **Robots never command each other directly.** Every action goes through tasks and
  leases, so safety and ownership stay clear.

### 5.5 Storage engine (store, feed with includeStorage)
1. **Classify** the dish into storage classes (soups/stews, cooked rice, fried, dairy
   desserts…) from its ingredients and ops.
2. **Look up** [`knowledge/storage.json`](../knowledge/storage.json) and the policy packs.
   The strictest rule wins. If `duration` exceeds the fridge time, switch to the freezer
   or say it isn't feasible.
3. **Cooling plan:** depth ≤ 5 cm, two-stage cooling limits (57 °C → 21 °C in 2 h,
   → 5 °C in 4 more h, per the FDA Food Code; packs may differ). The simulator predicts
   cooling time from mass, container material and depth.
4. **Containers:** chosen from the cookware profile (airtight, freezer- and
   microwave-safe, size × count, headspace for liquids).
5. **Cook-for-storage patch:** hold back components that store badly (eggs, garnish,
   crispy toppings, dressings, dairy before freezing), undercook pasta, and keep sauces
   looser.
6. **Reheat and labels:** reheat instructions (≥ 74 °C), label text, discard rules, and
   alternatives with trade-offs.

### 5.6 Menu optimizer (feed, nutrition_target, shopping_optimize)
- **MILP** (OR-Tools / HiGHS). The variables are the servings of each candidate recipe ×
  meal × day.
- **Constraints:**
  - people × meals covered;
  - diet and allergen per diner group (split dishes if needed);
  - variety;
  - equipment capacity per time window (from the planner);
  - budget (ingredients from offers or prices, plus energy cost);
  - inventory over the horizon (rationing);
  - storage capacity and storage feasibility per make-ahead dish;
  - nutrition ranges.
- **Objective:** preference/quality score minus weighted cost, energy, waste and effort.
- **Scaling:** non-linear. Spices and salt scale sub-linearly, cooking time with
  mass^~0.66 for roasts, evaporation with surface area, and batches split by vessel
  capacity.
- **Output:** menu → production schedule (planner) → storage plans → order intent
  (shopping) with offers from providers (see [ECOSYSTEM.md](ECOSYSTEM.md)).

### 5.7 Food-safety engine (always on)
- **Time-temperature integration** per intermediate, from telemetry or reported times:
  danger-zone accumulation, cooling-rate compliance, hot/cold holding, reheating.
- **CCP verification:** a CCP never passes without a reading (`cw.safety.no_blind_ccp`).
- **Rules:** policy packs plus `cw.safety.*` core rules. The **most restrictive** wins.
  Extensions and lower-priority packs may only tighten.
- **Vulnerable diners** (infants, pregnant, elderly, immunocompromised, if declared) get
  stricter rules (e.g. no runny eggs, CCP variants).
- **Not medical advice:** any situation involving illness after eating returns
  `unknown_ask_human` with a pointer to professional help.

### 5.8 Simulator
- **Physics:** lumped-capacitance thermal model per vessel and food mass, plus
  evaporation, heat-source power × efficiency and lid factor.
- **Use:** predicts step durations, cooling curves, energy use and battery draw. It runs
  on every plan and patch (it's the V2 gate for recipes), and is calibrated from
  telemetry in execution reports.

### 5.9 Learning loop
- Execution reports (opt-in, anonymous) update per-recipe and per-node duration
  distributions, playbook option success rates, substitution acceptance, and device-class
  reliability.
- The ranker uses these as priors. Confidence scores are calibrated on CookBench
  (§8) plus field data.

## 6. Safety invariants (non-negotiable, tested in conformance)

1. The safety gate runs before option generation, and the verifier runs after it, for
   every intent and every extension.
2. `unsafe_discard` food never appears in any option except `discard`.
3. CCPs are never removed by a patch, only tightened or added.
4. Allergen and diet constraints are hard constraints. Substitutions can't violate them.
5. Patches can't lower `supervision` or remove hazards and abort steps.
6. LLM-only options are labelled, never auto-applied above V1, and need human
   confirmation when the dish is for vulnerable diners.
7. Advice never actuates devices. The hub applies options through the normal session
   flow (with confirmation where required).

## 7. Code and applications that implement it

| Component | Language / tech | Runs where | Responsibility |
|---|---|---|---|
| **cookwala-core** | TypeScript (also compiled to WASM) | CLI, browsers, Cloudflare Workers, hubs, apps | Types from the schemas, validators, graph utilities, patch engine, policy and expression evaluator, matcher, storage rules, safety gate (deterministic parts) |
| **cookwala-reasoner** | Python 3.12 service (FastAPI), Docker on x86/ARM | Index cloud (stateless), hubs (full) | Playbook engine, CP-SAT planner (OR-Tools), MILP menu optimizer, simulator (NumPy/SciPy), substitution graph (NetworkX), embeddings (multilingual-e5), LLM orchestration with schema-constrained output (local models via mlx/llama.cpp/vLLM, or BYO provider through the model extension point) |
| **cookwala-hub** | TypeScript/Node (or Rust later), MQTT broker embedded | Home server, Home Assistant add-on, robot | Sessions, leases, handoffs, event bus, executor dispatch, safety supervisor, flows runner, extension host (WASM sandbox + HTTP/MCP/A2A), profiles vault (encrypted) |
| **cookwala CLI** | TypeScript (npm) + single-binary build | Anywhere | All commands in [CLI.md](CLI.md), including `ask`, `can-cook`, `fix`, `rescue`, `team`, `store`, `feed` |
| **SDKs** | TS, Python, Kotlin, Swift, C++/ROS 2 | Robots, apps | Clients, executor scaffolding, ROS 2 action bridge |
| **Knowledge packs** | JSON (CC0) | Repo + registry | Playbooks, roles, substitutions, transformations, storage, energy |
| **CookBench** | Python + JSON scenarios | CI | Evaluation suite (§8) |

## 8. CookBench (how we know it works)

A public benchmark of scenario files (request + context → acceptable answers and
forbidden answers):

- **Safety suite:** must-discard cases (time-temp abuse, contamination, cross-contact),
  must-ask cases, and never-skip-CCP cases. Pass rate must be **100%**.
- **Recovery suite:** expert-graded options for about 200 common mistakes across
  cuisines.
- **Planning suite:** team plans and feed plans checked for feasibility, lateness,
  battery reserves and energy limits.
- **Matching suite:** cook-from cases with diet and allergen constraints (0 violations
  allowed).
- **Multilingual parsing:** the same questions in the 24 site languages.

Extensions and BYO models report their CookBench scores in their manifests
(`model.accuracy`).
