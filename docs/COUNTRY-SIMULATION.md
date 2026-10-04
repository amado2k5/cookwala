# Country Simulation: one country, one year

Playable at **cookwala.ai/sim/country** (code: [`sim/country/`](../sim/country)).

**Meridia** is a fictional country of 27.5 million people in six provinces: a capital
district, a northern port province, a farming heartland, a southern coast, low-income
eastern highlands and a desert province. It has 15 cities and rural regions, of three
types: urban, suburban and rural. Each province adopts robot cooks and the Cookwala
protocol at its own pace, and **every city and region is compared with itself without
robots or the protocol**: same people, same months, same seasons.

## Method: three linked scales

1. **Home simulator** ([SIMULATION.md](SIMULATION.md)): one kitchen, every protocol step,
   to find gaps in the spec.
2. **City simulator** ([CITY-SIMULATION.md](CITY-SIMULATION.md)): individual homes,
   stores, wholesale, farms, vehicles, garbage and energy for a month. Calibrated to UNEP
   (household waste ≈0.22 kg/person/day) and FAO (≈13% loss before retail).
3. **Country simulator (this one):** [`calibrate.mjs`](../sim/country/calibrate.mjs) runs
   the city simulator for **urban, suburban and rural** settings at **0, 25, 50, 75 and
   100% robot homes**, with and without the protocol (2 seeds each, 60 runs). It stores
   per-person daily rates in [`calibration.js`](../sim/country/calibration.js). The country
   engine applies those rates month by month:
   - to each region's population;
   - with S-curve adoption;
   - with the protocol switching on in its start month;
   - with seasonal effects: winter cooking, a festival month, summer heat, the harvest
     glut and December holidays.

### What calibration revealed about places

| Setting | Household waste g/person-day (none → all robots + protocol) | Energy kWh/person-day | With all robots but **no** protocol |
|---|---|---|---|
| Urban | 223 → 121 | 1.62 → 1.55 (−4%) | 1.70 (**+5%**, robot electricity, no logistics gains) |
| Suburban | 223 → 121 | 1.60 → 1.37 (−14%) | 1.60 (±0%) |
| Rural | 223 → 121 | 1.81 → 1.20 (**−34%**) | 1.59 (−13%) |

**The protocol's energy and traffic benefits are largest in rural areas,** where long
shopping drives are replaced by consolidated deliveries. In dense cities, the robots'
own electricity offsets most of the kitchen savings.

## Results: mixed national rollout (default), whole year

| | With rollout vs without |
|---|---|
| Household food waste | **−13.0%** (2,088 vs 2,400 kt; 312 kt saved) |
| Food lost before homes (farms, wholesale, stores) | **−9.5%** (246 kt saved) |
| Garbage collected | **−9.0%** (322 kt) |
| Natural gas for cooking | **−4.7%** (17 million m³) |
| Total energy (cooking, robots, transport fuel, cold chain) | **−2.5%** (423 GWh), after **+273 GWh** of robot electricity |
| Vehicle fuel / food vehicle-km | −4.9% / −9.4% |
| Greenhouse gases | **−13.9%** |
| Household food spend | −3.9% (≈$1.26 billion) |
| Meals rescued from store surplus | **161 million**, ≈4.7% of what Meridia's 3.1 million food-insecure people need |
| Cooking & shopping time | −20.5% (≈250 million hours freed) |

### By province

| Province | Rollout | Household waste | Lost before homes | Garbage | Natural gas | Energy | CO2e | Meals rescued (M) |
|---|---|---|---|---|---|---|---|---|
| Capital District | Incentives + protocol from January, 20 → 55% | −19.2% | −21.0% | −15.9% | −7.7% | −3.3% | −22.7% | 68.6 |
| Northshore | Protocol from March, 10 → 45% | −14.4% | −15.3% | −11.9% | −5.8% | −3.9% | −17.1% | 33.6 |
| Central Plains | Protocol from July, 3 → 30% | −8.9% | −7.9% | −6.7% | −3.6% | −3.3% | −10.3% | 24.0 |
| **Southern Coast** | Robots 12 → 40%, **no protocol** | −13.7% | **+9.3%** ⚠ | −1.4% | −3.0% | −0.2% | −8.2% | 0 |
| Eastern Highlands | Relief program runs the protocol from January; robots 2 → 15% | −4.6% | −10.4% | −7.4% | −2.1% | −2.3% | −6.8% | 34.7 |
| Western Desert | No adoption (control) | 0% | 0% | 0% | 0% | 0% | 0% | 0 |

### Scenarios (whole year, country vs its own baseline)

| Scenario | Household waste | Lost before homes | Garbage | Natural gas | Total energy | CO2e | Meals rescued | Time |
|---|---|---|---|---|---|---|---|---|
| Mixed national rollout | −13.0% | −9.5% | −9.0% | −4.7% | −2.5% | −13.9% | 161 M | −20.5% |
| Nationwide rollout with the protocol (60% robot homes by Dec) | −18.5% | −20.6% | −15.7% | −7.1% | −5.6% | −22.3% | 229 M | −30.0% |
| Robots everywhere, no protocol anywhere | −18.5% | **+12.8%** ⚠ | −1.8% | −3.4% | −0.7% | −10.6% | 0 | −30.0% |
| Protocol everywhere, very few robots | −1.9% | −8.1% | −5.9% | −0.9% | −0.6% | −3.3% | 363 M | −2.8% |

## What it shows

1. **Robots plus the protocol beats either alone.** Robots alone help homes but push
   waste upstream: the national bullwhip is **+12.8%** more food lost before homes.
   The protocol alone mostly redistributes surplus. Together they cut waste at every
   stage.
2. **Where the protocol runs, every province improves upstream.** Where robots sell
   without it (Southern Coast), the supply chain gets *worse*. That's an argument for
   making the protocol part of any national robot-cooking policy, not only the robots.
3. **Geography matters.** Rural regions gain most in energy and traffic. Cities gain most
   in tonnes of waste avoided (more people).
4. **Seasons matter.** The biggest monthly gains come in summer heat, the September–October
   harvest glut (demand shaping toward abundant produce) and December holidays.
5. **The hunger contribution is real but partial.** Rescued surplus covers about 5% of
   the food-insecure population's needs in the mixed rollout. Rescue matters most where
   supply chains are still wasteful, so the "protocol, few robots" scenario rescues more
   *because* more is wasted upstream. Ending hunger needs Cookwala's relief layer
   together with funding, production and policy.
6. **Energy is a modest win nationally (−2.5% to −5.6%),** larger in rural areas. Robot
   electricity (+273 to +389 GWh a year) has to be planned for. Natural gas falls more
   than total energy.

## Limitations

- Illustrative, not a forecast. Rates are interpolated linearly between calibrated
  adoption levels. Seasonal multipliers are assumptions.
- No robot costs, no food service or restaurants, no cross-region trade, no price
  feedback or rebound effects, no home fridge energy.
- Food-insecurity shares per region are illustrative inputs.
- Next steps:
  - multi-seed uncertainty bands;
  - a guided-human-planning home type (protocol without robots, via apps);
  - region-to-region food flows;
  - policy levers (subsidies, mandates) as scenario inputs.

## Protocol on/off for the whole country

The **Cookwala protocol** selector offers three modes:

- *as planned per province*;
- *off everywhere (robots alone)*;
- *on everywhere from January*.

The robot adoption curves stay the same in all three. A four-way table compares them with
the no-robot baseline. In the mixed rollout, food lost before homes is **2,827 kt with
robots alone** and **2,348 kt with the protocol as planned (−16.9%)**. Switching the
protocol on everywhere from January cuts it further.
