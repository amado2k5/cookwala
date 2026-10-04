# World Simulation: the whole world, five years

Playable at **cookwala.ai/sim/world** (code: [`sim/world/`](../sim/world)).

This is the fourth simulator: home → city → country → **world**. It covers 2027–2031,
quarter by quarter, for 8.3 billion people in ten regions, drawn on a world map
(Natural Earth). Two switches set the scenario:

- **Robot cooks:** None · Few (mainly wealthy homes) · Many.
- **Cookwala protocol:** On · Off (robots alone).

Every combination is compared with **the same world without robots or the protocol**: the
same people, the same population growth, and the same grids getting cleaner by about 2% a year.

## Method

- **Per-person rates.** These come from the country calibration
  ([`calibration.js`](../sim/country/calibration.js)), which is built from city-simulator
  runs. Rates cover urban, suburban and rural homes at 0–100% robot adoption, with the
  protocol on and off.
- **Regional factors.** Each region adjusts those rates for:
  - population, growth and urban share (UN WPP 2024, WUP);
  - undernourishment (FAO SOFI 2024);
  - loss between harvest and retail (FAO SOFA 2019);
  - household food waste (UNEP Food Waste Index 2024);
  - gas or LPG cooking share and car dependence;
  - refrigeration and price level;
  - grid carbon intensity (Ember).
- **Robots.** Adoption follows an S-curve to each region's 2031 target. Rural homes adopt at
  half the rate. Targets for the *Many* scenario range from 45% (North America, East Asia)
  to 3% (Sub-Saharan Africa), because robots need reliable electricity and income. You can
  edit the targets on the page.
- **Protocol coverage.** This is the share of a region's food system on the protocol:
  stores, farms, logistics, relief programs, robots and apps. It rises from 3% in 2027 to
  45–85% by about 2029.
- **Hunger.** Rescued surplus counts only toward hungry people in the same region, at three
  meals a day.

## Results: five years, whole world, vs no robots and no protocol

| Scenario | Household waste | Lost before homes | All food lost or wasted | CO2e | Total energy | Robot electricity | Meals rescued | Hungry people covered by rescue |
|---|---|---|---|---|---|---|---|---|
| Few robots, no protocol | −1.1% | **+0.6%** ⚠ | −0.1% | −0.7% | 0.0% | 36 TWh | 0 | 0 |
| Protocol, no robots | 0.0% | −2.7% | −1.4% | −0.5% | 0.0% | 0 | 223 billion | 40 M |
| Few robots + protocol | −1.1% | −2.9% | −2.1% | −1.6% | −0.2% | 36 TWh | 216 billion | 39 M |
| **Many robots alone** | −4.8% | **+3.0%** ⚠ | −0.6% | −3.0% | +0.1% | 164 TWh | 0 | 0 |
| **Many robots + protocol** | −4.8% | **−3.5%** | **−4.1%** (284 Mt) | **−5.2%** (1.3 Gt) | −0.9% | 164 TWh | 192 billion | 35 M |

### By region: many robots, with the protocol vs alone

| Region | Lost before homes: alone → with protocol | CO2e: alone → with protocol | Hungry covered by rescue (M) |
|---|---|---|---|
| North America | +8.7% → −7.9% | −5.7% → −11.5% | 2.0 of 4 |
| Europe | +7.3% → −7.4% | −5.5% → −11.3% | 3.0 of 5 |
| East Asia | +7.8% → −5.7% | −7.1% → −10.5% | 3.9 of 32 |
| Oceania | +7.1% → −6.5% | −5.6% → −8.3% | 0.1 of 3 |
| Latin America & Caribbean | +3.4% → −3.1% | −3.4% → −5.2% | 2.5 of 41 |
| Middle East & North Africa | +3.5% → −3.1% | −3.5% → −4.9% | 2.1 of 57 |
| Eastern Europe & Central Asia | +2.5% → −2.0% | −2.0% → −3.6% | 1.4 of 9 |
| Southeast Asia | +2.3% → −2.9% | −2.6% → −3.5% | 1.8 of 36 |
| South Asia | +1.0% → −2.5% | −0.7% → −2.0% | 13.3 of 277 |
| Sub-Saharan Africa | +0.4% → −2.0% | −0.5% → −1.0% | 4.9 of 308 |

## What it shows

1. **Robots alone are close to a wash for the world's food.** Homes waste 4.8% less, but
   about 3% more is lost before food reaches homes. Vendors' apps order in lumps, and
   stores and farms keep bigger safety stocks (the bullwhip effect). In regions with many
   robots this reaches +7–9%. Net food lost or wasted falls only 0.6%, and no surplus
   reaches anyone hungry.
2. **The same robots with the protocol cut waste at every stage:** −4.1% of all food lost
   or wasted, or 284 Mt over five years. That is about the yearly food of 156 million
   people. Greenhouse gases fall 5.2%, against 3.0% with robots alone.
3. **The protocol helps countries without robots.** With no robots at all, the protocol in
   stores, farms, logistics, relief programs and people's apps cuts losses before homes by
   2.7% and rescues 223 billion meals. Few robots without the protocol change almost
   nothing.
4. **Hunger is where robots are not.** 76% of the world's ~770 million hungry people live
   in Sub-Saharan Africa and South Asia. Rescue covers only 1.6% and 4.8% of the hungry
   there, against about half in North America. Robots prevent surplus, so "protocol, no
   robots" leaves more to rescue (40 M vs 35 M people). Ending hunger needs Cookwala's
   relief layer to move food and money across regions, together with production, funding
   and policy.
5. **Energy is roughly flat and CO2 depends on the grid.** Many robots add 164 TWh over five
   years. Total energy for food changes −0.9% with the protocol and +0.1% without. The
   largest CO2 cuts are in North America and Europe; the smallest are in Sub-Saharan Africa.
6. **Time:** many robots free about 148 billion hours of cooking and shopping over five
   years, with or without the protocol. The protocol changes what happens to the food.

## Limitations

- This is an illustrative model, not a forecast. Regional factors are rounded from the
  sources above.
- Not modelled:
  - wood and charcoal cooking, and the health benefits of clean cooking;
  - robot manufacturing and costs;
  - restaurants and food service;
  - trade between regions;
  - price feedback and rebound effects;
  - conflict and climate shocks.
- Next steps:
  - country-level data for the largest countries;
  - cross-region relief flows, so surplus can reach other regions' hungry;
  - uncertainty bands;
  - clean-cooking and health co-benefits.
