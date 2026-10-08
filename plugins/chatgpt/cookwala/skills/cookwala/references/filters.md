# Everyday words to `query_recipes` filters

| The person says | Use |
|---|---|
| light, low calorie | `kcal_max` (per serving) |
| high protein | `protein_min`, or `sort=-protein` |
| low carb, low sugar | `carbs_max`, `sugar_max` |
| cheap, budget | `cost_tier=budget`, or `sort=cost` |
| quick, under 30 minutes | `time_max=30` |
| hands-on time | `prep_time_max` |
| few ingredients | `ingredients_max` |
| no oven | exclude `method=bake` (use `method=` with the methods they do want) |
| cold dish, no cooking | `style=cold` or `style=no_cook` |
| fried | `method=fry,deep_fry` |
| baked | `method=bake` |
| serves six | `serves=6` |
| vegetarian, vegan, pescatarian | `diet=vegetarian` and so on (screens, not certifications) |
| halal, kosher | `diet=halal`, `diet=kosher` (reviewed claims, not certifications) |
| gluten-free, dairy-free, nut-free | `diet=gluten_free`, `dairy_free`, `nut_free` |
| no allergens | `no_allergens=true` (means none found, not a guarantee) |
| without milk or eggs | `allergen_free=milk,eggs` |
| good for diabetics | `diabetic_friendly=true` (an estimate) |
| for kids | `kids=true`: the 50 Cooking with Kids recipes first, then inferred ones (repeat the cautions) |
| for a child of a given age | `kids_age=3-5`, `6-8`, `9+`, or `kids_age=7` |
| only the Cooking with Kids recipes | `collection=kids` |
| no cooking at all, with kids | `kids=true` with `style=no_cook` |
| from a named cook or book | `source=` (use `catalog_listing` kind sources to see names) |
| in another language | `lang=ar`, `fr`, `zh`, and so on |
| with a video | `has_video=true` |
