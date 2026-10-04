# Impact: what Cookwala can change, with sources and labels

**Status:** 2026-10-04. Every number below is labelled **measured** (counted or reported by
the source named), **modelled** (produced by our simulators under stated assumptions) or
**assumed** (a planning figure). Nothing here is a result of Cookwala in the field: no pilot
has run. This page states the size of the problems and the mechanisms by which Cookwala
contributes.

## 1. Hunger

| Fact | Figure | Label and source |
|---|---|---|
| People who faced hunger in 2023 | about 733 million | measured by the source: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| People moderately or severely food insecure in 2023 | about 2.3 billion | measured by the source: SOFI 2024 |
| Food lost between harvest and retail | about 14 % of food produced | measured by the source: FAO, *The State of Food and Agriculture 2019* (UNEP rounds the same figure to 13 %) |
| Food wasted at retail, food service and households in 2022 | about 1.05 billion tonnes; about 132 kg per person; about 79 kg per person in households | measured by the source: UNEP, *Food Waste Index Report 2024* |

**Cookwala's mechanisms:** surplus offers that reach a kitchen before the food spoils, with a
cold-chain check at every handover (Humanitarian Profile); impact counted the same way at
every site so programs can compare and improve; later, aggregated demand and supply signals
so less is grown and moved to be thrown away (experimental, gated on competition-law
review). **What it does not do:** address poverty, conflict, climate shocks, prices or
policy, which drive most hunger.

**Modelled, illustrative, not a forecast:** the country simulator's mixed rollout rescues
meals equal to about 4.7 % of what its fictional food-insecure population needs; the world
simulator's "protocol, no robots" scenario reaches about 40 million of roughly 770 million (the simulator's assumed baseline, a round-up of the 733 million measured above)
hungry people through rescue alone. Both say the same thing: rescue matters and is not
enough.

## 2. Health

| Fact | Figure | Label and source |
|---|---|---|
| Illnesses from unsafe food each year | about 600 million; about 420,000 deaths | measured by the source: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Salt intake versus the guideline | most people eat 9 to 12 g of salt a day; WHO recommends under 5 g (2 g sodium) | measured by the source: WHO fact sheet on salt reduction |
| Deaths attributable to high sodium each year | about 1.9 million | measured by the source: WHO, *Global report on sodium intake reduction* (2023) |
| People relying on polluting cooking fuels | about 2.1 billion; about 3.2 million deaths a year from household air pollution | measured by the source: WHO fact sheet on household air pollution (2024) |

**Cookwala's mechanisms:** critical control points and hot-holding, cooling and reheating
limits enforced on the device and recorded; rule packs that flag sodium, free sugars,
saturated fat and fruit and vegetables on menus; care rules for children, pregnancy and
older adults; a review record so dietitians and food-safety officers can vouch for a pack.
**What it does not do:** diagnose, treat or compute therapeutic diets; see
`docs/health/CLAIMS-POLICY.md`.

**Clean cooking** is in the picture but not in the model: the simulators do not yet count
wood and charcoal cooking or its health effects (listed as a limitation; next).

## 3. Environment

| Fact | Figure | Label and source |
|---|---|---|
| Share of global greenhouse-gas emissions from food loss and waste | about 8 to 10 % | measured by the source: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** in the world simulator, "many robots with the protocol" cuts all
food lost or wasted by about 4.1 % and emissions by about 5.2 % over five years against the
same world without them; "many robots alone" cuts household waste but raises losses before
homes by about 3 % (a bullwhip effect). Robot electricity (about 164 TWh over five years in
that scenario) is counted. These are the model's outputs under its assumptions, listed on
each simulator page.

## 4. Economy and work

**Assumed and modelled:** the city simulator estimates about 5 USD per person per month
less food spend and about 10 hours per home per month less cooking and shopping with robot
cooks, hardware not included. No figure for jobs is given anywhere; new roles are named
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) without
numbers.

## 5. Culture

No number. The claim is qualitative and checkable: a Cookwala recipe carries the cook's
name, the dish's identity (what is essential, what is flexible, what is never added), text in
the cook's language, and a signature. Machines that cook it inherit the recipe as working
knowledge, with credit.

## 6. What we will measure when there is something to measure

| Measure | Method | Where defined |
|---|---|---|
| Kilograms rescued, meals served, people reached, nutrition pass rate, cost per meal, time to claim, claim rate, safety block findings, safety incidents | computed from Offer, Claim, Handover and Distribution documents | Humanitarian Profile section 10; `ImpactSummary` |
| Verified cooks: executions that ran a signed recipe end to end with a conforming log | execution logs with consent | `STRATEGY.md` section 11 |
| Independent implementations passing conformance | published conformance reports | `docs/CERTIFICATION.md` |
| Agent-safety results per model | the promptfoo benchmark, with model id, date and config hash | `evals/kitchen-agent-safety/` |

## 7. What we don't know yet

Whether a food bank rescues more with the profile than with its current method (the pilot
protocol exists; no pilot has run). Whether the envelopes are right for every cuisine (a food
scientist has not reviewed them). Whether the simulators' behavioural assumptions hold (they
are listed and adjustable). How large the rebound effects are. Nothing here is a promise.

## 8. What went wrong

Nothing has been deployed, so nothing has gone wrong in the field. In the repository: the
first one-liner ("world's first and largest robot cooking recipes index") overstated what
existed and was changed; the first Mission schema accepted unknown fields and was made
strict; the first simulators used a strawman baseline and gained a competent-integration
baseline and ranges. The critiques that drove these changes are published
(`docs/CRITIQUES.md`).

## 9. Sources

- FAO, IFAD, UNICEF, WFP and WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

Figures are quoted as the sources publish them, rounded; re-check each against the current
edition before quoting in print. The organizations are sources, not partners.
