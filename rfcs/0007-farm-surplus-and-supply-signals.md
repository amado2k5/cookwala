# RFC-0007: Farm surplus and supply signals

**Status:** proposed, 2026-10-04, **experimental**. **Kind:** new experimental schema.
**Gate:** competition-law review before any production use (action plan C7).

## Problem

The founder's macro idea (M45): if cooking is planned, the amounts grown, moved and sold can
match what is needed, with less waste, fewer trips and better planting decisions. The
simulators show the effect; the standard has no document for it. Farmers meanwhile have no
way to list a glut before it rots, and small producers fear a signal that favours large
buyers.

## Proposal

1. **Surplus now, through the Humanitarian Profile.** A farm is a donor (`Item.origin:
   farm`, `harvestedAt`), and the SMS grammar accepts `FARM` offers (RFC-0003). No new
   document is needed for rescue.
2. **`schemas/supply.schema.json`** (experimental) with two documents:
   - **`DemandSignal`**: publisher (organization), region (country, admin1, optional P-code),
     period (a week), ingredient **class** (never a product or brand), quantity range in kg
     with `method`, number of contributing sources, `delayDays` since the period ended,
     basis (`planned_meals`, `distributions`, `orders`), and `prices: "none"` as a constant;
   - **`SupplySignal`**: publisher, region, period, ingredient class, availability (`glut`,
     `normal`, `short`), optional quantity range, harvest window, and `openToAll: true` as a
     constant.
3. **Policy rules**, checkable by `check_signal()` in the reference library with profile
   vectors (`signal_policy`): at least 20 contributing sources; a delay of at least 7 days;
   no price fields; class-level only; region no finer than admin1 unless the source count
   is at least 100.
4. **Fairness:** a published signal is public, free, and identical for every reader; no
   early access; publishers are organizations with a verified namespace.
5. **Status on the site:** "next, after counsel review". Nothing is published by cookwala.ai
   until then.

## Alternatives considered

- **Per-product demand forecasts shared with retailers.** Rejected: this is the
  information exchange competition authorities warn about.
- **Leave it to the simulators.** Rejected: farmers need at least the surplus path today.

## Migration

New experimental schema; nothing else changes.

## Open questions

1. Thresholds (20 sources, 7 days) are starting points; counsel and a statistician should
   set them.
2. Should cooperatives be able to publish supply signals by SMS? Proposal: yes, later, via
   the same gateway.
