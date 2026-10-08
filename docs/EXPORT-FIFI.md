# Exporting fifi.cooking into Cookwala (and making every recipe robot-ready)

Goal: every fifi.cooking recipe becomes a Cookwala document in this repo. Each one is
enriched with structured quantities, canonical ingredients, equipment, a process graph,
end conditions, hazards, CCPs, allergens and dietary claims. Each one then climbs the
verification levels (V0 → V1 → V2) and is published on the Cookwala index. New
fifi.cooking recipes (including World Cuisines) flow in automatically.

## 0. Status (2026-10-05)

**Decision 2026-10-05:** the four collections whose rights are not confirmed in writing (chefteta, osool, abdennour, abuhaty) are exported with `text: facts`: structured facts only, no step text, no notes, licence `LicenseRef-source-credited` as defined in `LICENSES/LicenseRef-source-credited.md`. The family archive keeps full text under CC BY 4.0. A collection moves to full text when its rights holder confirms in writing.

Done, deterministically, by `tools/export_fifi.py`: E0 extract with the per-collection rights switch
(`tools/export_fifi.collections.json`), E1-lite (one vocabulary entry per distinct English ingredient
name, labels in 25 languages; no clustering or FoodOn/USDA links yet), E2 quantities (99.3 % parsed;
the rest keep the original text as `display` with a flag), E6 carry-over, E7 text (en and ar in the
document; 23 languages as sidecars). All 2,042 documents are published (1,881 on 2026-10-05, the 161 world recipes on 2026-10-06) at **V0** under RFC-0009:
every step is an unclassified `cw.op.legacy_step`, so no device executes them. Not done: E3 to E5
(equipment beyond the cooking-method default, process graphs, hazards and critical control points),
E8 to E11 at V1 and above, and the sync workflow. The licences of four collections await the
founder's confirmation and are shown as "credited; licence under review".

> **Refresh 2026-10-08.** A full re-run produced 2,257 documents (215 new world recipes). The source gained bn, cs, sq and vi, so documents now carry 29 name languages; existing documents were rewritten.

## 1. Starting point (measured 2026-10-03)

| Collection | Ids | Recipes | Source |
|---|---|---|---|
| `abuhaty` | `fah-*` | 808 | Fatma Abu Haty YouTube channel, rewritten |
| `archive` | `meat/des/veg/pasta/bake/sea/salad/stuff/savory/quick/bev/soup/leg-*` | 334 | Family recipe archive (chapters 1–6) |
| `osool` | `osool-*` | 324 | *Osool El Tahy* cookbook |
| `chefteta` | `add-*` | 257 | Additional recipes (chapter 7) |
| `abdennour` | `ec-*` | 158 | *Egyptian Cooking* book |
| `world` | `w-<iso2>-*` | 376 (CN 21, ES 19, ET 5, FR 14, GR 16, ID 35, IN 50, IR 31, IT 26, JP 43, KR 33, MA 27, MX 49, VN 7) | World Cuisines project (rewritten, credited, halal-gated); facts only |
| **Total** | | **2,257** | |

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

## 10. Live access from agents, and the `world` collection (2026-10-06)

The MCP server (`@cookwala/mcp`, [MCP](MCP.md)) has two tools that read fifi.cooking's own `/data/` files, so an
agent can find recipes added after the last export: `fifi_search` and `fifi_source`. They apply the same per-collection
`text` policy as this exporter. On 2026-10-06 fifi.cooking listed 2,042 recipes and the catalog held 1,881. The 161 missing ones, the World
Cuisines recipes (`w-cn-*`, `w-fr-*`, `w-jp-*`, `w-ma-*`, `w-mx-*`, `w-vn-*`), were exported the same day.

**Decision taken 2026-10-06.** `tools/export_fifi.collections.json` now has a `world` entry with `text: facts` and the
licence `LicenseRef-source-credited`. The world recipes are rewritten from public recipe sites (each recipe's `source`
names and links the site), so they follow the 2026-10-05 rule for derived content: structured facts only, no step text,
until the source rights are confirmed. To publish steps for a source you have cleared, set `text` to `full` for it and
re-run the exporter. The cuisine of a `w-<iso2>-*` recipe is that country; the family collections stay Egyptian. Existing
documents were not regenerated in this run: the source site has changed since 2026-10-05 and a full re-export would
rewrite about 1,200 of them, which is a separate review.

## 11. Dietary claims (2026-10-08)

fifi.cooking now publishes `dietary` per recipe in `public/data/recipes/<id>.json` (source of truth:
`src/data/recipeDietary.json` there, method in its `docs/DIETARY-CLASSIFICATION.md`). `tools/export_fifi.py` copies the
claims into `safety.dietary` of each document (`basis: ingredients`, `ruleset: fifi-diet-1`) and adds `x-dietary` to the
index. They are positive claims only (halal, kosher, vegetarian, vegan), never certifications; a claim is withheld whenever
a relevant fact is uncertain. `tools/build_query_index.py` adds halal and kosher to the `diet` facet from these claims. Vegetarian and vegan in search still
use the looser name heuristic (about 114 more recipes pass it than hold a reviewed vegetarian claim); the documents carry the stricter reviewed claims.

### Allergens, diabetic estimate and gluten, dairy and nut-free claims (2026-10-08)

fifi.cooking also publishes `allergens` and `diabetic` per recipe (method in its `docs/DIETARY-CLASSIFICATION.md`, script
`scripts/diet/allergens.py`). The exporter now uses them instead of its own substring guess, which read "eggplant" as eggs, "cornflour" as
wheat gluten and "coconut" as nuts:

- `safety.allergens.eu14` and `us9` come from fifi.cooking's list (whole-word scan of ingredients and steps plus the reviewed facts), with
  `x-status` (`contains`, `none_found`, `check_labels`, `not_assessed`) and `x-ruleset` (`fifi-allergen-1`). `none_found` is strict: the recipe
  was reviewed and has no bought or compound item that could hide an allergen. The old guess remains only for a source file without `allergens`.
- `gluten_free`, `dairy_free`, `nut_free` (`fifi-allergen-1`) and `diabetic_friendly` (`fifi-diabetic-1`) arrive as ordinary `safety.dietary`
  claims. `safety.x-diabetic` carries the estimate for every recipe (`friendly`, `borderline`, `not_friendly`, `unknown`), so "not friendly" can be
  told from "not assessed".
- Nothing here is a certification, a guarantee or medical advice. The diabetic estimate comes from the modelled nutrition per serving (sugar 5 g or
  less, carbohydrate 30 g or less, carbohydrate at most 40% of the energy, 12 servings or fewer; not friendly above 15 g sugar or 60 g carbohydrate).
- 2,257 existing documents were re-exported for this change. The 105 recipes fifi.cooking has gained since the last export (world cuisines: Lebanon,
  Iran, Italy, Korea, Peru, the Philippines and others) were deliberately left out; importing them is a separate run and review.

Do not edit claims in this repo: change them in fifi.cooking and re-run the export. Adding claims changes a document's hash
but the exporter does not bump `revision`.
