# City Simulation: one month, two cities

Playable at **cookwala.ai/sim/city** (code: [`sim/city/`](../sim/city)). A deterministic,
agent-based model of two cities of about 5,000 people each:

- **Farms and producers:** vegetable farms, orchards, grain farms, cattle and dairy,
  poultry, fisheries.
- **Distribution:** a wholesale hub and supply trucks, plus a supermarket and a corner shop
  in each of three neighbourhoods (mid, high and low income).
- **Homes:** 1,500 per city, with and without Cookwala robot cooks.
- **Transport and waste:** delivery vans, shopping car trips, garbage trucks, and
  rush-hour traffic (BPR congestion model).
- **Energy:** gas, electric and induction stoves; robot electricity; vehicle fuel; and
  store and wholesale refrigeration.

Each home's daily appetite varies (weekends, guests, eating out). The **same people,
appetites and randomness** run in both cities. What differs is how many homes plan with
robot cooks, and whether the city's stores, wholesale, farms and logistics use the
protocol:
- demand signals;
- consolidated delivery slots;
- surplus rescue to a community kitchen;
- reusable or bulk packaging.

A 7-day warm-up runs before the measured month.

## Calibration (traditional homes and supply chain)

| Measure | Model | Published reference |
|---|---|---|
| Household food waste, traditional homes | 6.6 kg/person/month (0.22 kg/day), incl. inedible parts | ≈79 kg/person/year ≈0.22 kg/day: [UNEP Food Waste Index 2024](https://www.unep.org/resources/publication/food-waste-index-report-2024) |
| Retail food waste (business-as-usual city) | ≈0.03–0.05 kg/person/day | ≈17 kg/person/year ≈0.047 kg/day: UNEP 2024 |
| Loss between farm and retail | ≈14–16 % | ≈13 %: [FAO](https://www.fao.org/newsroom/detail/tackling-food-loss-and-waste-from-the-farm-to-the-table-and-beyond/en) |

Robot-home behaviour is deliberately conservative:
- they buy a 5% buffer;
- cook 4% extra;
- waste 30% of leftovers;
- spoilage watch saves only 60% of items about to expire;
- 12% of days are unplanned eating-out, the same as traditional homes.

Inedible parts (peels, bones, shells) are identical for every kitchen. Every assumption
is listed on the page.

## Results (seed 11, 30 days)

| Scenario | City | Robot homes | Household waste kg/person | Loss before homes (t) | Garbage (t) | Food vehicle-km | Spend $/person | Natural gas m³ | Robot kWh | Vehicle fuel L | Refrigeration kWh | Total energy MWh | CO2e (t) | Meals rescued |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cookwala vs business as usual | **Nilebridge** | 637 | **5.37** | **29.0** | **41.9** | **56,238** | **89** | **4,741** | 6,689 | **11,072** | **20,883** | **207.5** | **202.8** | **2,909** |
|  | Harborfield | 142 | 6.39 | 37.5 | 49.5 | 66,963 | 94 | 4,874 | 1,491 | 11,934 | 22,538 | 214.7 | 254.5 | 0 |
| Robots without the protocol | Nilebridge | 637 | 5.38 | **42.4** ⚠ | 49.5 | 62,901 | 91 | 4,951 | 6,689 | 11,767 | 22,718 | **219.6** ⚠ | 237.0 | 0 |
|  | Harborfield | 143 | 6.40 | 38.2 | 49.5 | 66,969 | 94 | 4,867 | 1,502 | 11,941 | 22,627 | 215.1 | 255.2 | 0 |
| Protocol, almost no robots | Nilebridge | 63 | 6.55 | 35.1 | 47.3 | 67,562 | 95 | 5,426 | 662 | 12,058 | 22,611 | 218.4 | 254.0 | 5,126 |
|  | Harborfield | 138 | 6.41 | 40.7 | 51.5 | 67,122 | 95 | 4,919 | 1,449 | 11,914 | 23,052 | 215.8 | 263.1 | 0 |
| Both cities adopt | Nilebridge | 637 | 5.37 | 29.0 | 41.9 | 56,238 | 89 | 4,741 | 6,689 | 11,072 | 20,883 | 207.5 | 202.8 | 2,909 |
|  | Harborfield | 635 | 5.39 | 28.2 | 40.9 | 56,297 | 89 | 4,650 | 6,668 | 11,118 | 20,696 | 207.0 | 193.6 | 3,039 |

(The headless runner `node sim/run.mjs` regenerates this table into `sim/out/city-results.json`; CI runs it on every push.)

## What it shows

1. **Homes:** in the same neighbourhood, robot-cook homes waste about **45% less food
   per person** (edible waste about 70% less). The causes are planned buying, exact
   portions, leftovers repurposed, use-first and freezer planning. At 40% adoption
   that's −15% city-wide household waste.
2. **The ecosystem matters more than the robot.** With the protocol, food lost *before*
   homes falls about **22%**, garbage about **16%**, food-related traffic about **15%**,
   and emissions about **25%**. Stockouts fall too, while about 3,000 meals' worth of
   end-of-life food reaches the low-income neighbourhood instead of the bin.
3. **Robots without the protocol can make things worse upstream.** Robot homes ordering
   in batches every few days look like erratic demand to stores that can't see their
   plans (a bullwhip effect). Losses before homes *rose* to 41 t vs 37 t. The protocol's
   demand signals turn home planning into upstream savings.
4. **The protocol without plans is weak.** With demand signals but only 5% planning
   homes, upstream gains are small. Most of the benefit came from surplus rescue.
   Plans, made by robots or by guided humans, are what the protocol runs on.
5. **Traffic:** about 35% fewer car shopping trips and about 25% faster deliveries in
   consolidated slots. But **rush-hour speed barely moves (+1%)**, because food trips
   are a small share of city traffic. Food logistics alone won't fix congestion.
6. **Energy and natural gas:**
   - **In the kitchen:** robot homes need about 14% less stove energy per person (energy-saver methods: lids, pressure cooking, residual heat, batching). That means less natural gas in gas-stove homes. But each robot adds about 0.35 kWh of electricity a day, which offsets most of that saving.
   - **Across the chain:** the Cookwala city uses **~3% less natural gas** and **~3% less total energy** (cooking, robots, transport fuel, store and wholesale refrigeration). Most of the saving comes from **7% less vehicle fuel** and **7% less refrigeration energy** (smaller chilled inventories), not from the stove.
   - **Without the protocol:** robots raise total energy (+2%). Their electricity is added with no supply-chain savings to offset it.
   - **Emissions:** they fall more than energy (**−20%**), because most of the CO2e saved is in food that was never wasted.
7. **Money and time:** about $5 per person per month less food spend (robot hardware not
   included), and about 10 fewer hours of cooking and shopping per home per month.

## Limitations and next steps

- Illustrative model, not a forecast. Behavioural parameters are assumptions,
  adjustable in the code and listed on the page.
- Excludes restaurants and food service (UNEP's 36 kg/person/year), robot costs, energy
  prices, home fridge/freezer energy, farm and food-processing energy, and the energy
  embedded in producing food that is later wasted (only its CO2e is counted).
- Energy values are planning estimates: 0.47 kWh of useful heat per kg cooked, and stove
  efficiency of 38% (gas), 72% (electric) and 85% (induction). Stove mix 55/35/10 in both
  cities.
- One wholesale hub per city; no cross-city trade; no seasonality or price elasticity.
- Next steps:
  - multi-seed runs with confidence intervals;
  - guided-human planning homes (no robot) as a third home type;
  - food-service kitchens;
  - farm planting decisions over a season;
  - a relief-program layer feeding the low-income community at scale.

## Protocol on/off per city

Each city card has a **Cookwala protocol: On | Off · robots alone** switch. The *Robots
alone vs robots + the Cookwala protocol* panel reruns each city at the same robot share.
It does this twice: once with demand signals, consolidated delivery, surplus rescue,
bulk packaging and energy-saver modes, and once without them. Nilebridge, default preset:

- food lost before homes: **−32%**;
- garbage: −15%;
- CO2e: −14%;
- delivery vehicle-km: −25%.

Robots alone order through their own vendors' apps, so stores cannot see their plans and
upstream losses grow (the bullwhip effect).
