# Health: the right food, the right amount, for the right person

Second mission pillar, next to [ending hunger](MISSION.md): **make people healthier.**
The goal is to deliver the right food, cooked the right way, in the right amount, at the
right time, for each person, at an exact and known cost, with as little waste as possible.

## 1. What Cookwala does

| Need | Mechanism |
|---|---|
| Know each person's needs | `PersonNutrition` profiles (age, sex, height, weight, activity, life stage, goals, conditions, allergies, intolerances, IDDSI texture, clinician-set targets). **Sensitive, local-only**; the public index rejects requests that contain them |
| Turn needs into numbers | Nutrition engine computes `NutritionTargets` per person (energy, macros, fiber, sodium, free sugars, micronutrients). Clinician targets always override computed ones |
| Choose the right dishes | `personalize` / `nutrition_target` / `feed` intents rank recipes by fit to everyone at the table at once, plus cost, waste, organic/local preference, variety, time and energy |
| Cook it the right way | Recipe patches for health goals: less salt (salt added at the end, per-person seasoning), healthier fats, steaming/baking instead of deep-frying, texture modification (IDDSI), low-FODMAP swaps; diet and allergen rules stay hard constraints |
| Serve the right amount | `PortionPlan`: grams per person per component, nutrients per portion, share of daily targets reached, per-person modifications |
| Exact cost | Ingredient cost from offers or prices (+ energy), per person |
| Least waste | Cook quantity factor so portions + *planned* leftovers are exact; leftovers get a storage plan and a next use; exact-quantity shopping; use-expiring-first ranking |
| Right food sources | `preferences.sourcing` (organic / local / seasonal: no_preference, prefer, require; certifications; max premium). Organic and other claims count only when backed by a **verified credential** on the offer |
| Right time | Meal schedule and fasting windows in the client profile; planner aligns serve times |

## 2. Nutrition engine (how targets are computed)

- **Adults, energy:** Mifflin-St Jeor resting energy × activity factor, adjusted for the
  goal (e.g. a moderate deficit for weight loss, floored at safe minimums).
- **Children, adolescents, pregnancy, lactation, older adults:** reference-value tables
  (national DRIs or WHO/EFSA tables), loaded as **knowledge packs per country**, not
  hard-coded formulas.
- **Population guidance used by default** (overridable by packs and clinicians): sodium
  under WHO limits, free sugars under 10% of energy (WHO), fiber at reference intakes,
  and adult protein at about 0.8 g/kg (higher for older adults, athletes and recovery).
- **Recipe nutrition:** the nutrition panel per serving (from the fifi estimates today,
  then computed per ingredient from USDA FoodData Central / national food composition
  tables), recalculated after every patch, scale and substitution. That's what makes
  portions exact.
- **Portioning:** a small quadratic program per meal. It minimizes the deviation of each
  person's day from their targets, weighted by priority nutrients (e.g. sodium for
  hypertension). It's subject to the total cooked mass, minimum and maximum portion sizes,
  appetite, and component availability. The result is an integer gram allocation.

## 3. Guardrails

- **Not medical advice.** Medical conditions are used for filtering and for applying
  clinician-set targets. Cookwala never diagnoses, and never computes therapeutic diets
  (e.g. CKD, diabetes carbohydrate plans) without clinician input. Answers carry that
  warning.
- **Privacy:** person data is `sensitive`, encrypted at rest on the hub, never in
  execution reports, and never shared with providers, extensions or the index unless the
  user grants it per extension (`profiles.client.sensitive`, off by default).
- **Kids, pregnancy, elderly, immunocompromised:** stricter food-safety variants (CCP
  variants such as firm yolks; no raw-egg sauces; no high-risk foods per policy packs).
- **No shaming:** weight goals are opt-in; the defaults are "maintain" and "eat well".
- **Equity:** health features work in `very_low` budget and `relief` modes. Healthy
  doesn't mean expensive: legumes, whole grains and seasonal produce rank high on
  nutrition per cost.

## 4. Where it lives in the specs

- `profile.schema.json#/$defs/PersonNutrition`, `#/$defs/NutritionTargets`, `ClientProfile.members`, `preferences.sourcing`
- `advice.schema.json` intent `personalize`, `#/$defs/PersonalizeQuery`, `#/$defs/PortionPlan`
- Example: [`examples/advice/personalize.request.json`](../examples/advice/personalize.request.json) → [`response`](../examples/advice/personalize.response.json)
- Implementation: reasoner nutrition engine and portioner (IMPLEMENTATION M3/M7). Country reference tables become knowledge packs (`kind: nutrition`, to add).
