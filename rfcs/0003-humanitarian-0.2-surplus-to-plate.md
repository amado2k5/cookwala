# RFC-0003: Humanitarian Profile 0.2, surplus to plate

**Status:** proposed, 2026-10-04. **Kind:** additive minor version of a draft profile
(`0.1.x` → `0.2.0`). **Safety relevant:** yes (food safety). Reviewer wanted: a food-safety
officer and a food-bank operator.

## Problem

Humanitarian Profile 0.1 covers offer → claim → handover → distribution for food banks and
kitchens. The founder's goal (M23, M47) and the brief ask for the **whole path from a farm or
store to a plate**, for four settings: a food bank in Cairo with phones and spreadsheets, a
school-meal program, a disaster kitchen, and eventually robot kitchens. The profile lacks:
the farm end (origin, harvest date), program types, an **impact summary** with the six
measures that prove impact, SMS messages for farms, and an honest **pilot protocol**.

## Proposal

1. **Items carry origin.** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`,
   `food_service`, `kitchen`) and `Item.harvestedAt` (date). A farm is a donor like any
   other; it is still an organization, never a person.
2. **Roles:** add `farm`, `caterer`, `robot_kitchen` to `Role`.
3. **Manifest** gains `programTypes` (`food_bank`, `school_meals`, `community_kitchen`,
   `disaster_kitchen`, `robot_kitchen`, `surplus_rescue`).
4. **`ImpactSummary`** document: organization, period, optional site, and measures, each
   with `value`, `method` (`measured`, `modelled`, `assumed`) and `source`:
   kilograms rescued, meals served, people reached (small-cell suppressed), nutrition pass
   rate, cost per meal, median time to claim, claim rate, safety block findings, safety
   incidents. It is computed from Handovers, Claims and Distributions, never typed by hand
   when the documents exist.
5. **SMS grammar additions:** `FARM` (an offer with origin farm), `HELP`, `CANCEL <id>`, and
   `MENU` to attach per-meal nutrients to a distribution. The grammar is specified exactly
   and a parser ships in the Python package with profile vectors (`sms_parse`).
6. **Four worked flows** with example documents under `examples/humanitarian/flows/`:
   food bank (phones and CSV, level H0), school-meal program (menu rule checks, H2),
   disaster kitchen (hot-holding, cooling, rations), robot kitchen (a `ProductionRun`,
   RFC-0005, linked to Core execution logs and a Distribution).
7. **Pilot protocol** (`docs/humanitarian/PILOT-PROTOCOL.md`): hypotheses, baseline,
   duration, sites, the nine measures, kill criteria, data-responsibility review, ethics
   approval, pre-registration, and publication of results whatever they show.
8. **`api/humanitarian.openapi.yaml`** formalizing section 8.1 of the profile.
9. **Checker:** `tools/humanitarian_check.py` validates the new document and summarizes
   impact from a folder of documents (`--summary`).

## Alternatives considered

- **A separate farm profile.** Rejected for now: a farm offering surplus is a donor; the
  signal layer is RFC-0007.
- **Hand-typed impact reports.** Rejected: the summary must be derived from the operational
  documents so sites can be compared.

## Migration

Additive. 0.1 documents validate under 0.2 (readers accept `0.1.x` and `0.2.x` during the
transition; the version pattern is widened). New fields are optional.

## Open questions

1. Should `ImpactSummary` carry a signature by the program and a counter-signature by a
   partner, as checkpoints do? Proposal: optional in 0.2, recommended for published summaries.
2. Cost categories: `food`, `transport`, `staff`, `energy` exist on Distribution; volunteer
   time is minutes. Should a shadow cost of volunteer time be reported? Proposal: no;
   report minutes.
