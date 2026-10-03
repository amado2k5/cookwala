# Exporting fifi.cooking into Cookwala (and making every recipe robot-ready)

Goal: every fifi.cooking recipe becomes a Cookwala document in this repo. Each one is
enriched with structured quantities, canonical ingredients, equipment, a process graph,
end conditions, hazards, CCPs, allergens and dietary claims. Each one then climbs the
verification levels (V0 → V1 → V2) and is published on the Cookwala index. New
fifi.cooking recipes (including World Cuisines) flow in automatically.

## 1. Starting point (measured 2026-10-03)

| Collection | Ids | Recipes | Source |
|---|---|---|---|
| `abuhaty` | `fah-*` | 808 | Fatma Abu Haty YouTube channel, rewritten |
| `archive` | `meat/des/veg/pasta/bake/sea/salad/stuff/savory/quick/bev/soup/leg-*` | 334 | Family recipe archive (chapters 1–6) |
| `osool` | `osool-*` | 324 | *Osool El Tahy* cookbook |
| `chefteta` | `add-*` | 257 | Additional recipes (chapter 7) |
| `abdennour` | `ec-*` | 158 | *Egyptian Cooking* book |
| `world` | `w-<iso2>-*` | in progress | World Cuisines project (rewritten, credited, halal-gated) |
| **Total** | | **1,881 + world** | |

Each recipe is already published as `fifirecipes/public/data/recipes/{id}.json` (recipe +
estimate + 24-language translations; ~96 MB total). The format is documented in
[`schemas/legacy/fifi-data-v1.schema.json`](../schemas/legacy/fifi-data-v1.schema.json).
That file is the export source, with `src/data` as the fallback for fields the public
files drop.

What's missing for robots: amounts are free Arabic text ("3 أكواب", "حسب الرغبة"),
ingredients are per-recipe strings with no shared id, steps are prose, and there are no
temperatures, end conditions, equipment, hazards, CCPs or allergen flags.

## 2. Decisions needed before exporting

1. **Rights per collection (blocking).** The open index licenses content CC BY 4.0, and
   only content we have the right to license can go in. Recommendation:
   `world` and `archive` yes (rewritten / family-owned).
   `chefteta` yes if it's original fifi content.
   `abuhaty`: the recipes are rewritten and credited, but channel-derived, so get the
   creator's permission or publish only facts (ingredients + our own process graph +
   credit link).
   `osool` and `abdennour` (books): exclude, or publish only a structured V0 card with a
   citation, until rights are clear. The export tool has a per-collection switch.
2. **Halal claim.** World Cuisines recipes passed the halal gate. The other collections
   were never machine-checked. Run the same two-layer gate on all of them before adding
   `dietary: halal`. Recipes that fail don't get the claim; they're flagged for review, not
   silently changed.
3. **Text size.** The core document carries `en` + `ar` text. The other 22 languages go in
   sidecars (`/v1/recipes/{id}/text/{lang}.json`) so robots download small documents.

## 3. Repo layout

```
recipes/<collection>/<id>.cookwala.json          core documents (en + ar text)
recipes/<collection>/<id>/text/<lang>.json       language sidecars
vocab/{ingredients,ops,equipment,sensors,hazards,units,classes}.json
bindings/matter.json                             op → Matter cluster mapping
policies/*.json                                  policy packs
tools/export-fifi/                               this pipeline (Python + TS)
tools/validator/  tools/simulator/               shared with the CLI
build/                                           generated index site (gitignored; deployed by CI)
```

Images are **not copied**. Documents link the fifi.cooking banner and thumbnail URLs.

## 4. Pipeline (tools/export-fifi)

All bulk model work runs locally on the M4 Max (mlx-lm; the same models used for fifi
translations and briefs), resumable via `tools/export-fifi/state.db`, one GPU job at a time.

| Stage | What | How | Output |
|---|---|---|---|
| **E0 Extract** | Read `public/data/recipes/*.json`, apply the collection rights switch | Deterministic | `work/raw/<id>.json` |
| **E1 Ingredient vocabulary** | Cluster all ingredient names (~1,881 recipes × ~10 = ~19k mentions) into canonical `cw.ing.*` entries with labels in 24 languages, classes (pork/alcohol/blood classes for policy, nut/dairy/gluten for allergens), density, typical piece mass, links to Wikidata / FoodOn / USDA FDC | English translations + multilingual-e5 embeddings → candidate clusters → LLM adjudication → human review of the top 500 by frequency | `vocab/ingredients.json` (~2,500 entries) |
| **E2 Quantities** | Parse Arabic/English amounts into SI `qty` + tolerance; keep the original as `display` | Deterministic parser (Arabic numerals and words: نصف، ربع، ثلث، كوب، ملعقة كبيرة/صغيرة، جرام، كيلو، حبة، فص، رشة، حسب الرغبة) + density/piece tables from E1; LLM fallback for the long tail, each fallback flagged | `ingredients[]` |
| **E3 Equipment** | Infer vessels, heat sources, tools, sensors from steps + cooking method | LLM constrained to `vocab/equipment.json` | `equipment[]` |
| **E4 Process graph** | Turn steps into nodes: `op`, `inputs/output`, `params` (heat level, target temps, shape/size, lid), `until` (food-state cues + time window), `onTimeout`, `attention`, `assignment`, `sourceSteps` | Local LLM with JSON-schema-constrained decoding against `recipe.schema.json#/$defs/Node` + op param schemas; few-shot from hand-written gold recipes; Arabic and English steps both given | `process` |
| **E5 Safety** | Hazards per node (frying, boiling, knives, pressure, open flame); CCPs by rule (poultry/meat/fish/eggs core temp; cooked rice/legume cooling; reheating); allergens from vocab classes; dietary claims via the halal gate; supervision level; abort steps | Deterministic rules first, LLM only to place them on the right node | `safety` |
| **E6 Carry-over** | Nutrition + cost from fifi estimates; servings → `yield`; dish names, cuisine, course, tags; source + license; `legacy.dataUrl`/`pageUrl` | Deterministic | L0 fields |
| **E7 Text** | `en` + `ar`: title, intro, cultural notes, `legacySteps` (original), per-node step text (generated from the original wording); other languages → sidecars from the existing translations (`legacySteps`) + translated per-node text | Existing translations reused; per-node text translated with the fifi translation pipeline (Gemma 4) | `text`, sidecars |
| **E8 Validate & fix** | Schema validation + semantic checks (each ingredient consumed once, DAG acyclic, heat nodes have until + timeout, CCP coverage, params in op ranges, temps plausible per op, total time within ±30% of the fifi prep+cook times) | `cookwala validate`; failures go back to E4/E5 with the error message (max 3 rounds), then to the review queue | pass/fail + report |
| **E9 Level** | V0 if E0–E3, E6, E7 pass; V1 if E4–E5, E8 pass too | Automatic | `verification` |
| **E10 Simulate & review** | Thermal/time simulator; human review of params for the top 200 recipes by fifi traffic | `cookwala simulate` + review UI (diff view: original steps ↔ graph) | V2 |
| **E11 Publish** | Canonical hash, revision bump only when content changes, sign the manifest, build the index site, deploy | CI | `build/` → cookwala.ai |

### Quality gates (per batch of 100)

- 100% schema-valid; 0 nodes without an end condition among heat ops; 0 missing CCPs.
- Quantity parse: ≥ 95% deterministic; every LLM-parsed amount flagged.
- Random 5% sample reviewed by a human against the original page. Defect rate < 5% to
  publish the batch as V1, otherwise it's fixed and re-run.
- Any safety-related defect (wrong temperature, missing hazard/CCP) blocks the batch.

### Throughput estimate (local)

E1: ~1 day including review. E4/E5: ~1–2 min per recipe with a 30B MoE model, so about
1.5–3 days of GPU time for 1,881 recipes. E7 sidecars: ~22 languages × node text, reusing
existing translations where steps map 1:1, so about 3–5 days. In total, about **2 weeks**
to all-V1, plus ongoing V2 review.

## 5. Keeping in sync

- A workflow in **fifirecipes** (on push to `main` touching `src/data` or
  `public/recipe-images`) sends a `repository_dispatch` to **cookwala** with the changed ids.
- The cookwala workflow re-runs E0–E9 for those ids only (or the cheap stages, if only
  text or estimates changed). It opens a PR, and on green CI it merges and deploys the
  index.
- World Cuisines: its pipeline emits Cookwala V1 directly as a stage. The export then
  only verifies and publishes.
- fifi.cooking pages gain `<link rel="alternate" type="application/vnd.cookwala+json"
  href="https://cookwala.ai/v1/recipes/{id}.cookwala.json">` next to their
  schema.org JSON-LD. The Android, iOS and TV apps can show a "Robot-ready (V1)" badge.

## 6. Order of work

1. Decide rights (§2.1) and the domain (`cookwala.ai` assumed).
2. Hand-write **10 gold recipes** (varied: stew, frying, baking, rice, dessert, salad,
   drink, egg dish, fish, stuffed vegetables) as few-shot examples and test fixtures.
3. Build E0–E3 + E6–E7 → publish **all allowed recipes at V0** (the index goes live early).
4. Build E4–E5 + E8 → V1 in batches of 100 (`archive` first: smallest and family-owned).
5. Simulator + review → V2 for the top 200.
6. Turn on sync; World Cuisines joins automatically.
