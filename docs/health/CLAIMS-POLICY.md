# Health claims policy

**Status:** policy, 2026-10-04 (RFC-0004, action plan C23). Applies to every document, page,
rule pack, tool and demo that carries the Cookwala name.

## 1. What Cookwala may say

- **General nutrition guidance** from public health bodies, cited: sodium, free sugars,
  total and saturated fat, trans fat, fruit and vegetables, fibre, energy ranges by broad age
  band, protein minima.
- **Food-safety rules** from public guidance and national codes: cooking temperatures,
  hot-holding, cooling, time out of temperature control, date marks, allergen labelling,
  foods to avoid for vulnerable groups.
- **Care variants** for children under five, pregnancy, older adults and immunocompromised
  people, when they come from the same public sources.
- **Measured outcomes** of programs that used the tools, with the method under each number.

## 2. What Cookwala never says

- That it diagnoses, treats, prevents or manages any condition.
- That a recipe or menu is "healthy" without saying which rule it passed.
- That a diet for a condition (diabetes, kidney disease, allergy management beyond
  avoidance) is computed by Cookwala. Clinician-set targets are entered locally and belong to
  the clinician.
- Anything about infant formula, therapeutic feeding or clinical nutrition.
- That any health organization endorses, reviews or uses Cookwala, unless it has said so in
  writing.

## 3. How rules carry their status

Every rule pack has `status` (`draft`, `reviewed`, `adopted`, `retired`), `reviews` with
the reviewer's profession and outcome, `jurisdiction`, and a `disclaimer`. The website shows
the status next to every pack and never shows a draft pack as reviewed.

## 4. Personal nutrition

Per-person data (`PersonNutrition`) is sensitive, stays on the household's device
(RFC-0001), and never reaches a rule pack, a provider or a dataset. Weight goals are opt-in;
the default is "eat well". Nothing produces a score of a person.

## 5. Where this policy comes from

Concern C23 in `docs/ACTION-PLAN.md`: health claims are close to medical-device rules in
most jurisdictions. Staying with population-level public guidance and clinician-entered
targets keeps Cookwala out of that territory and keeps the content reviewable.
