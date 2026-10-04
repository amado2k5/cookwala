# Mission: everyone eats

> **Status: experimental profile.** Not part of Cookwala Core. See [CORE.md](CORE.md) section 10 for what is normative today.

**Cookwala's ultimate goal is to help end world hunger.** Every part of it points that way:

- the standard, the free index and the reasoning engines;
- robots and appliances;
- the marketplace, extensions and federation.

Together they help people eat, including people who cannot afford to. They also let food
organizations, governments, food banks, community kitchens, businesses and volunteers run
one **federated, global feeding workflow**: a digital assembly line from surplus and
supply to a hot, safe, culturally right meal.

Cookwala does not replace humanitarian organizations or their judgment. It is shared
infrastructure: open, free and interoperable, so their work scales and connects.

## 1. Why a cooking protocol matters for hunger

Hunger is mostly a problem of **coordination and cost**, not of a lack of food in the
world. Food is wasted in one place while people go without nearby. Kitchens sit idle
while others are overloaded. Donations don't match needs. Cooking knowledge for cheap,
local, nutritious food isn't where it's needed. Cookwala attacks each of these gaps:

| Gap | What Cookwala provides |
|---|---|
| Surplus food wasted near hungry people | `Pledge(kind: surplus_food)` with use-by and safety data; allocator routes it to kitchens within its safe window |
| Donations don't match needs | Aggregated `Need`s (no personal data) and `Pledge`s (food, capacity, transport, volunteers, funds-as-meals) matched by an optimizer |
| Idle or overloaded kitchens | Every kitchen is a hub with capacity; pledged kitchen and **robot capacity** joins the network |
| Cooking at scale is hard | `feed` intent, `relief` operating mode, production planning, rationing, batch scaling, hot-hold and storage plans |
| Nutrition and safety at scale | Ration standards (e.g. Sphere ~2,100 kcal/person/day), CCPs, cooling, allergen and diet rules as hard constraints |
| Culturally wrong food | World Cuisines catalog: halal-checked, local dishes from local ingredients in 24 languages |
| No equipment, fuel or power | `lowTech` relief mode: guided human cooking on phones/SMS/voice, fuel-efficient methods, no-cook options, solar/gas alternatives |
| No transparency | Open `ImpactReport`s (meals, cost per meal, surplus rescued, waste, incidents), HXL tags, IATI/HDX links |

## 2. How people eat even when they can't pay

- **Pay-it-forward and sponsored meals:** `Offer(type: sponsored_meal | donated_meal)`,
  `Pledge(kind: funds)` expressed as meals. Payment always stays in the program's own
  donation channel.
- **Surplus rescue:** grocers, restaurants, caterers and farms publish surplus. Hubs and
  community kitchens see it in their `cook_from` and `feed` plans.
- **Community kitchens and food banks** run Cookwala hubs (free software), get free
  recipes, planning and safety tools, and receive pledges.
- **Budget mode `very_low`** and the `week_saver` and `relief` presets make families'
  own food go further: rationing over a horizon, stretching proteins with legumes,
  pantry-first cooking, energy-saving methods.
- **No-cost access:** the index, CLI, knowledge packs and reference hub are free. There
  are no API keys and no fees for programs.
- **Dignity and privacy:** beneficiaries are never tracked. Needs are aggregated counts.
  No personal data enters the protocol.

## 3. The global assembly line

```
 SUPPLY                         COORDINATION                         PRODUCTION                 DELIVERY        LEARNING
 farms, grocers, restaurants ─┐                                      community kitchens,
 (surplus + donations)        │  ┌─────────────────────────────┐    school kitchens,          distribution   impact reports,
 donors (funds as meals)      ├─►│ Relief allocator            │──► caterers, robot kitchens ─► points,     ─► recipe & plan
 robot operators (capacity)   │  │ needs × pledges × kitchens  │    (Cookwala hubs running    schools,       feedback,
 transport, cold storage      │  │ min-cost flow + MILP +      │     sessions with robots     camps, homes   CookBench
 volunteers                   ┘  │ CP-SAT per kitchen          │     and/or people)
                                 └──────────────▲──────────────┘
 NEEDS: programs publish aggregated needs ──────┘   (WFP-style programs, food banks, schools, governments, NGOs)
```

1. **Programs** (`relief.schema.json#/$defs/Program`) declare area, ration standards,
   policy packs, kitchens and what they accept.
2. **Needs** come from programs (aggregated people × meals × window × place × diets).
3. **Pledges** come from anyone: food, surplus, kitchen and robot capacity, transport,
   cold storage, volunteers, fuel, equipment, funds-as-meals.
4. **The allocator** (`intent: relief_allocate`, run by a program's coordinator hub or a
   shared coordinator) solves three things:
   - **Network flow:** min-cost flow / MILP over supply nodes → kitchens → sites. It
     respects use-by windows, cold chain, transport capacity, kitchen capacity and ration
     standards. The objective is `max_people_fed`, `max_nutrition_per_cost`, `min_waste`
     or `equity_first` (programs set priorities with their own vulnerability criteria).
   - **Menu per kitchen:** the `feed` optimizer, using what actually arrives.
   - **Schedule per kitchen:** the CP-SAT planner across robots, people and equipment.

   Output: `Allocation` with assignments, production plans, coverage and **gaps**. Gaps
   become new calls for pledges.
5. **Kitchens execute** normal Cookwala sessions, with CCP logs. Robots are optional;
   `lowTech` guided mode works with people alone.
6. **Delivery** is coordinated through events (`cookwala.relief.dispatched` /
   `delivered`) and existing logistics partners.
7. **Impact** reports are published openly and feed the learning loop: better recipes,
   better plans, lower cost per meal.

Federation means no single operator is required. A national food bank network, a city's
school-meal program and a disaster response can each run their own coordinators, and
still exchange needs, pledges and recipes through the same protocol.

## 4. What this asks of each participant

| Participant | Contribution | What they get |
|---|---|---|
| UN agencies, NGOs, food banks | Programs, needs, ration standards, coordination | Free planning, allocation, safety and impact tooling; a network of pledges |
| Governments | Policy packs (food codes), school-meal programs, data links | Interoperable programs; transparent impact data |
| Grocers, farms, restaurants | Surplus and donation pledges; discounted offers | Less waste; verified impact; recognition (opt-in) |
| Robot makers and operators | Robot capacity pledges for central kitchens | Real-world field data (V3 recipes), impact |
| Chefs and communities | Local, cheap, nutritious recipes | Their food cooked at scale, credited |
| Volunteers | Time (cooking, transport) | Clear tasks from the same plans robots use |
| Developers and AI builders | Extensions, models, flows (e.g. new allocators, local-language voice) | A global platform for good, open source |

## 5. Guardrails

- **Food safety at scale is non-negotiable:** the same safety gate and CCP rules apply,
  and mass feeding gets stricter cooling/hot-hold rules via `humanitarian.*` policy packs.
- **Humanitarian principles:** humanity, neutrality, impartiality, independence. The
  protocol has no feature for excluding groups. Prioritization is set by the program
  under its own accountable criteria.
- **Do no harm:** no beneficiary tracking, no profiling, no data sales. Aggregated
  data only, with `sensitive` fields never leaving a hub.
- **No commercial capture:** sponsored placement is always disclosed and never shown in
  relief allocations. Programs are free.
- **Cultural and dietary respect:** halal and other dietary packs are hard constraints.
  Recipes come from local cuisines and local ingredients.
- **Honesty about scale:** Cookwala is coordination infrastructure. Ending hunger also
  needs funding, peace, agriculture and policy, which are outside any protocol.

## 6. First steps toward the mission

1. Ship the open index with the fifi.cooking and World Cuisines catalogs (free,
   multilingual, halal-checked, local ingredients).
2. Build the `feed` optimizer, the `relief` mode and `lowTech` guided mode, and test them
   with one community kitchen.
3. Pilot with a food bank or community kitchen network: surplus pledges → kitchen →
   impact report.
4. Publish the `humanitarian.sphere` policy pack (expert-reviewed) and HXL export.
5. Invite humanitarian technologists to the steering group (GOVERNANCE.md), and present
   at humanitarian data forums (OCHA HDX community, Humanitarian Data Exchange).
6. Robot kitchens pledge capacity once V2/V3 recipes and hubs are proven.
