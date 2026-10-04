# RFC-0009: V0 import profile and the unclassified step

**Status:** draft, 2026-10-04 · **Touches:** `vocab/ops.json` (one new entry), `recipes/`, the index site · **Core 0.2 normative text:** unchanged

## Problem

The fifi.cooking collection holds 1,881 human recipes with ingredients, free-text amounts,
prose steps and 24 language translations. The recipe schema already defines `verification.level`
V0 ("described") below V1 ("structured"), but nothing said what a V0 document may contain, and
every operation in the vocabulary is executable, so a prose step mapped to the nearest operation
would look executable to a planner while carrying no end condition.

## Decision

1. **A V0 document is a described recipe, never an executable one.** It carries the original
   ingredients (quantities parsed where the text allows, the original wording kept in
   `display`), the original steps in order, the dish names in every language the source has,
   source, licence and legacy links. It carries no end conditions, no hazards placed on nodes
   and no critical control points, because none were verified.
2. **`cw.op.legacy_step`** is added to the operation vocabulary with `executable: false`. Each
   original step becomes one node with this operation, `params.sourceStep`, `params.phase` and
   an optional `params.opHint` (a keyword guess at the executable operation, for the V1
   conversion, never for control). No device capability lists this operation, so the Core 0.2
   dry run assigns the step to a person when one is present and refuses otherwise. Nothing
   changes in the dry run or in Core.
3. **Text sidecars.** The document carries `text.en` and `text.ar`. The other languages are
   published as sidecars at `/v1/recipes/{id}/text/{lang}.json` (listed in `textSidecars`), so
   devices download small documents.
4. **Rights per collection.** Each document names its collection and source. Collections whose
   licence is not yet confirmed carry `license: "LicenseRef-source-credited"` instead of
   `CC-BY-4.0` and are shown on the site as "credited; licence under review". The export tool
   has a per-collection switch; the founder confirms each collection.
5. **Labels.** The site shows every V0 recipe as "V0: described, not machine-verified" and the
   count of V0 and V1 documents separately. The published-recipes statistic distinguishes them.

## Path to V1

A V0 document becomes V1 when a reviewed process graph replaces the legacy steps: typed
operations with parameters, end conditions, timeouts, hazards and critical control points,
validated by `cookwala validate` and the semantic checks. `params.opHint` and the parsed
quantities are the starting point. The conversion tooling is `tools/export_fifi.py`
(deterministic stages) and, later, the model-assisted stages described in
`docs/EXPORT-FIFI.md`.

## Alternatives rejected

- Mapping prose steps to executable operations without end conditions: a planner could not
  tell a guessed step from a verified one.
- Keeping V0 recipes out of the index until V1: the index exists to make recipes findable and
  attributable now; V0 is honest about what it is.
