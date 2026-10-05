# Reviewing a Cookwala rule pack: template for dietitians and food-safety officers

**Status:** draft, 2026-10-04 (RFC-0004). A rule pack is a list of machine-checkable
nutrition and food-safety rules (`schemas/humanitarian.schema.json#/$defs/RulePack`). Packs
ship as **drafts derived from public guidance**. They become **reviewed** only after a
qualified professional checks them rule by rule and the review is recorded in the pack's
`reviews` array. Your name is never recorded; your profession and organization are.

## 1. What you are reviewing

| File | Audience | Rules |
|---|---|---|
| `profiles/humanitarian/basic-nutrition-food-safety.rulepack.json` | all | sodium, free sugars, fats, fruit and vegetables, rations, cold chain, time out of temperature control, date marks, allergens |
| `profiles/humanitarian/care-vulnerable-groups.rulepack.json` | children under five, pregnancy, older adults, immunocompromised | foods to avoid, stricter hot-holding and cooked-rice time, sodium and energy per meal for older adults |
| `profiles/humanitarian/school-meals-basic.rulepack.json` | school-age children | fruit and vegetables, sodium, free sugars, saturated fat, energy and protein per meal, choking, allergens |
| `profiles/humanitarian/sodium-reduction.rulepack.json` | programs that adopt sodium reduction | per-meal warn and block tiers, per-day |

## 2. Checklist per rule

For each rule, answer:

1. **Source current?** Is the cited guideline the latest version? Note the replacement if not.
2. **Population right?** Does `audienceGroup` match who the guideline covers? Should it be
   narrower?
3. **Numbers right?** Threshold, unit, and whether it is per meal, per person per day, or per
   item. Check conversions (energy share uses 9 kcal/g fat, 4 kcal/g sugars and protein).
4. **Block or warn justified?** `block` means the receiver should not accept or serve. Is that
   proportionate for this rule?
5. **Jurisdiction?** Does a national rule override this default where the program operates?
6. **Wording.** Is the message clear to a volunteer with no training in nutrition?
7. **Missing.** Is a rule you would expect absent from the pack?

## 3. What the packs deliberately do not do

- Diagnose, treat or compute therapeutic diets. Condition-specific targets are entered
  locally by a clinician (`PersonNutrition.clinician`) and never live in a pack.
- Cover infant formula, therapeutic feeding or clinical nutrition.
- Replace national food codes. Packs are defaults; `jurisdiction` says so.

If you think a rule crosses one of these lines, say so; it is a reason to remove it.

## 4. How to file the review

Open an issue on the repository with the label `health-review`, or send the completed table
to the maintainers. The maintainers add an entry to the pack's `reviews`:

```json
{
 "role": "registered dietitian",
 "organization": "Example Hospital nutrition department",
 "date": "2026-11-15",
 "scope": "all nutrition rules; not the cold-chain rules",
 "outcome": "approved_with_changes",
 "notes": "Lower the school fruit and vegetable minimum to 60 g for children under 8."
}
```

Changes you asked for are applied in a new pack version. Only after at least one `approved`
or `approved_with_changes` review does `status` move from `draft` to `reviewed`. The
checker refuses a pack marked `reviewed` without such a review.

## 5. Time needed

About two hours for `basic-nutrition-food-safety`, one hour for each of the others. Reviews are
voluntary unless a program funds them; the repository records the review, not the fee.
