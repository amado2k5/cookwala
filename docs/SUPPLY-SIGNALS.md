# Farm surplus and supply signals

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Examples:
> `examples/supply/`. **Gate:** competition-law review before any production use
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai publishes no signals today.

## 1. Two things farmers need now

1. **A way to list a glut before it rots.** A farm is a donor in the Humanitarian Profile:
   an `Offer` with `Item.origin: farm` and `harvestedAt`, or by SMS:

   ```
   FARM 120KG TOMATO A BB0411
   ```

   The food bank claims it, a kitchen cooks it, the distribution counts it. No new document,
   no personal data, organizations only.
2. **A fair signal of what will be needed.** That is the experimental part below.

## 2. Demand and supply signals

| Document | Says | Rules |
|---|---|---|
| `DemandSignal` | In region R, in ISO week W, kitchens and programs planned to use between L and H kg of ingredient **class** C | at least 20 contributing sources; published at least 7 days after the week ends; class level (legume, leafy vegetable, poultry), never a product or brand; **no prices**; region no finer than admin1 unless 100 sources or more |
| `SupplySignal` | In region R, in week W, class C is in glut, normal or short supply, with a harvest window | published by a cooperative, program or market operator; **open to all**: public, free, identical for every reader |

The reference check is `check_signal()` in `tools/cookwala_ref.py`; the profile vectors
(`conformance/profiles/signal.json`) show what is accepted and rejected.

## 3. Why these rules

Sharing forecasts between competitors is the information exchange competition authorities
warn about. Aggregation, delay, class level, no prices and open publication keep the signal
useful for planning and useless for coordinating prices. The thresholds are starting points;
counsel and a statistician should set them.

## 4. What the founder's idea becomes

The macro loop (RFC-0007): planned cooking → aggregated demand →
farms and stores plan to need → less grown, moved and thrown away. The city, country and
world simulators show the size of the effect under their assumptions (illustrative, not a
forecast). These two documents are the smallest honest step toward it.

## 5. Later

Planting advice from forward demand; reserve sizing (a perfectly lean supply chain is
fragile); cross-region relief flows; supply signals by SMS from cooperatives.
