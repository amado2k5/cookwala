# RFC-0004: Health and food-safety rule packs

**Status:** proposed, 2026-10-04. **Kind:** additive changes to the Humanitarian Profile
rule model; new rule packs; a review record. **Safety relevant:** yes. Reviewers wanted: a
registered dietitian and a food-safety officer. **Not medical advice.**

## Problem

The founder's second goal is a healthier world (M24, M48). Today one draft rule pack
(`who-codex-basic`) covers sodium, sugars, fats, rations and basic cold-chain rules. Missing:
fruit and vegetables per meal, care for children, older people and pregnancy (foods to avoid,
stricter reheating), school-meal patterns, a way to express "no raw egg" or "no unpasteurized
dairy" (the rule kinds cannot say it), and a record of **who reviewed what**. Health content
must be reviewable by professionals and must say what it does not do.

## Proposal

1. **Rule model (additive):**
   - `Item.foodClasses`: a list from a closed enum (`raw_egg`, `undercooked_egg`,
     `raw_meat`, `raw_fish`, `unpasteurized_dairy`, `soft_cheese`, `raw_sprouts`,
     `high_mercury_fish`, `honey`, `whole_nuts`, `hard_candy`, `alcohol`, `caffeine_high`,
     `deli_meat_cold`, `leafy_greens_raw`, `cut_melon`, `cooked_rice`, `none`);
   - `Rule.kind` gains `food_class` with `check.foodClass` and `check.audience`;
   - `Rule.audience` stays free text; a new optional `audienceGroup` enum
     (`all`, `children_under_5`, `children`, `pregnant`, `older_adults`,
     `immunocompromised`) lets a program select rules for the people it serves.
2. **`reviews`** on `RulePack` (additive): `[{ role, organization, date, scope, outcome
   (`approved`, `approved_with_changes`, `rejected`), notes }]` where `role` is a
   profession (for example "registered dietitian"), never a person's name. `status` moves
   to `reviewed` only when at least one review with `approved*` exists.
3. **New packs** (all `status: draft`, derived from public guidance, each rule with a
   source):
   - `care-vulnerable-groups`: food classes to avoid for children under five, pregnancy,
     older adults and immunocompromised people; reheating and hot-holding stricter; cooked
     rice time limits;
   - `school-meals-basic`: per-meal fruit and vegetables minimum, sodium and free sugars
     maxima per meal, energy range per meal by age band;
   - `sodium-reduction`: per-meal sodium maxima consistent with the WHO daily guideline
     spread over three meals, with a warning tier and a block tier for programs that adopt it.
4. **Review template** (`docs/health/REVIEW-TEMPLATE.md`): how a dietitian or food-safety
   officer reviews a pack, rule by rule, with a checklist (source current? population
   right? unit right? block vs warn justified? jurisdiction?) and how to file the review.
5. **Claims policy** (`docs/health/CLAIMS-POLICY.md`): general nutrition and food safety
   only; no diagnosis; condition-specific diets only with a clinician's targets entered
   locally (`PersonNutrition.clinician`); packs say which populations they exclude; infant
   and therapeutic feeding excluded.
6. **Mapping to Core safety limits:** hot-holding, two-stage cooling and reheating rules
   in the packs correspond to `SafetyLimits` kinds `time_temp` and `min_core_temp` for robot
   kitchens; the mapping is documented, not automated.

## Alternatives considered

- **Encode personal nutrition targets in packs.** Rejected: personal targets are
  `PersonNutrition`, local and sensitive; packs are population rules.
- **A medical profile.** Rejected: outside what can be claimed without clinicians and
  regulators.

## Migration

Additive. Existing packs validate unchanged.

## Open questions

1. Energy per meal by age band varies by country table; the pack ships one global default
   and tells programs to replace it. Is a per-country pack structure needed now? Proposal:
   later, as `extends`.
2. Fruit and vegetable grams per meal: use 80 g portions and a per-meal minimum of one
   portion as the default. To be confirmed by a dietitian.
