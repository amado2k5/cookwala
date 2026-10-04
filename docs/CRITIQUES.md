# Critiques we published

We asked hard questions about Cookwala and wrote the answers down. Each concern has an id
in the [action plan's concern register](ACTION-PLAN.md#2-concern-register), along with our
response and its status. Reviews from outside are welcome and will be listed here.

## Is this going to work? (strategy)

| Concern | Short answer | Status |
|---|---|---|
| The market doesn't exist yet; the spec is ahead of products | Small Core, demo first, no new spec without users | Core 0.2 done; device demo next |
| Nobody powerful has a reason to adopt | Lead with each adopter's gain; useful without robots | Food-bank pilot and device partner sought |
| The simulators prove what they assume | Fair baseline, ranges, "illustrative" labels; pilots replace them | Open |
| Hunger is about poverty and conflict, not surplus | Cookwala contributes; it doesn't claim to end hunger alone | Message changed |
| Safety, liability and attack surface | Limits enforced on the device; refusal; recalls; incident reports | Spec done; certifier review open |
| Privacy (health and religion data, ledgers vs erasure) | Local-first, selective disclosure, hash-only logs, consent | Spec done; impact assessment open |
| Too complex | Core 0.2; everything else marked experimental | Done |
| Founder dependency | Governance path to a neutral home | GOVERNANCE.md |

## Is the technical design sound?

| Concern | What changed in Core 0.2 |
|---|---|
| Operations had no physical meaning | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| Unit and number bugs | °C only, absolute tolerances, kitchen units, densities, decimal money |
| Schemas accepted typos | Strict schemas with `x-` extensions; offline bundle |
| One mutable Mission document | Event log + projection, single sequencer, transitions table |
| The ledger proved little | Key records with revocation, witnessed checkpoints, rewrite detection |
| Undefined event delivery; safety on the bus | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces drift | Core OpenAPI; every reference checked in CI |
| No verifier | Reference library and 44 conformance vectors |

## Reviews we are asking for

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), food scientists
(envelopes), food-safety officers and dietitians (rule packs), a security audit, a
data-protection review, and a certifier's gap analysis. See the
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).
