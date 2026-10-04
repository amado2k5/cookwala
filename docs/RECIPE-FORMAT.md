# Cookwala Recipe Format: recipes that work with Missions

A recipe in Cookwala isn't a list of instructions. It's **portable cooking knowledge**
that a planner *compiles* against a specific Mission (household, robots, appliances,
energy, budget, health, timing) into an executable plan. The robot then runs that plan,
adapting through contingencies and playbooks when reality changes.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Full worked example:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Four layers (adapted from the WHO SMART Guidelines approach)

| Layer | What it holds | Who writes it | Where it lives |
|---|---|---|---|
| **R1 Narrative** | Human recipe text, story, cultural notes, photos | Cooks, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | What the dish *is* and *must be*: identity (essential vs flexible), sensory targets, nutrition, serving and eating style, storage, acceptance checks | Recipe editors, AI-assisted, reviewed | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Device-agnostic method: formula (ratios + roles), process graph of typed ops with food-state pre/post conditions, `until` conditions, alternatives, pause rules, failure modes, affordances, hazards, CCPs, environment prep | Export pipeline + review; simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | The R3 recipe compiled for *this* Mission: exact quantities, chosen variants, assigned actors and devices, schedule, leases, monitors, contingencies | The planner/compiler, at run time | Inside the **Mission** (`plan`), never in the catalog |

Like source code and a compiler: **the recipe is portable intermediate representation
(R3 + R2). The Mission is the target machine.** That's what keeps recipes valid as robots
and AI change: a better planner produces a better R4 from the same recipe.

## 2. What each section does in a Mission

| Recipe section | Used by the Mission for… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutions, budget and ration modes, diet adaptations: change the flexible parts, never the essentials, so the dish is still itself |
| `formula` (ratios, min/max, role, scaling) | Exact scaling to any number of people, rationing ingredients over a week, budget stretching, using up what's on hand (the limiting-ingredient rescale) |
| `sensory` | Vision, aroma and taste checkpoints; household taste profiles (salt 2 vs 4); repurpose and fix decisions |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Environment preparation tasks:** if the sink or hob is occupied, the planner adds "clear, wash, dry" tasks; soak or thaw tasks are scheduled hours ahead |
| `process.nodes[]` with `pre`/`post` food states | Planning (only start what's ready), verification (did the step produce the state?), resume after interruptions |
| `until`, `onTimeout`, `retry` | Knowing when a step is done and what to do when it isn't |
| `alternatives[]` + `energy` | Gas vs induction vs oven, battery saver, no-oven kitchens, quiet hours |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruptions:** a child needs help, the owner calls, the dog knocks something over. The robot puts the step into its safe state, handles the event, then resumes, reheats, salvages or discards based on the pause budget |
| `failureModes` (incident, detect, prevent, playbook) | Early detection of known problems and the exact playbook to recover |
| `affordances`, `space` | Matching steps to robots that can grip, lift and reach; keeping hot zones away from children |
| `safety` (hazards, CCPs, supervision, abort) | The safety kernel: invariants that every plan must preserve |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Serving: what goes on the table, to the room, in the lunchbox; reminders and hold limits; cultural eating style |
| `storage` | Leftovers, cook-ahead and lunchbox Missions |
| `acceptance` | The recipe's *tests*: the Mission is done when these hold |
| `nutrition`, `cost` | Personal portions, budget, relief rations |

## 3. Example: one step with everything attached

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Compiling a recipe for a Mission (what the planner does)

1. **Select the variant:** diet, texture (IDDSI), equipment, energy and mode pick from
   `alternatives`. Identity essentials must survive.
2. **Scale:** from `formula` and the servings, portions per person (HEALTH.md), the
   limiting ingredient, or a ration horizon. Spices sub-linearly, time by mass exponent.
3. **Substitute** within roles, respecting `identity.neverAdd`, allergens, dietary packs
   and inventory.
4. **Prepare the environment:** compare `prep` with the Mission's space facets (sink full?
   hob occupied? board dirty?) and add tidy, wash, dry and stage tasks. Schedule
   `advanceTasks` (soak, thaw, marinate, preheat).
5. **Bind:** assign each node to robots, appliances or humans by affordances and
   capabilities. Lease burners, vessels and zones. Attach monitors (smart pot, delivery
   ETA, smoke detector).
6. **Schedule** back from the serve time, honoring pause budgets, battery and energy
   limits, household quiet hours and kitchen-sharing windows.
7. **Attach contingencies:** each node's `failureModes` and `pause` rules, plus the
   Mission's global policies (interruptions, child or pet near the hob, stove watchdog,
   spoilage watch).
8. **Verify:** schema + semantic checks, policy packs, CCP coverage, simulator dry-run,
   priority-stack invariants (PROTOCOL §7.2).
9. **Emit R4** into the Mission's `plan`, sign it, and hand it to the robot.

## 5. Authoring and converting

- **From fifi.cooking:** the EXPORT-FIFI pipeline generates R1 + R2 + R3. The new
  sections (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  are generated by local models from the existing text and checked by validators and
  sampled human review.
- **From the web:** `cookwala convert --from schema-org` → R1/R2 (V0), then the same
  enrichment.
- **To other formats:** schema.org Recipe (R1/R2 for search engines), Cooklang (human
  editing), PDDL or temporal logic (research planners) can all be generated from R3.
- **By hand:** `cookwala init recipe` scaffolds all layers; `cookwala validate` and
  `cookwala simulate` check them.
- **Versioning:** revisions are immutable and hashed. Forks record `meta.derivedFrom`.
  Recipe **patches** (from playbooks or feedback) are proposed as diffs and promoted only
  after review and evidence.

## 6. Why this stays future-proof

- Recipes describe **food outcomes and constraints, not motions**. New robots and new AI
  produce better R4 plans from the same R3.
- All new sections are **optional and additive**. A V0 recipe (R1 only) still works for
  guided human cooking; each layer added unlocks more automation.
- Unknown `x-` fields pass through. Vendors, chefs and health bodies can extend recipes
  without breaking anyone.
- **Acceptance checks** let any executor, human or robot, prove the dish came out right,
  which is how recipes climb to V3 with field evidence.
