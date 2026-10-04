# @cookwala/sdk (TypeScript)

Types for every Cookwala document, generated from the JSON Schemas in `schemas/` by
`tools/gen_ts_types.py`, plus the browser dry run that the cookwala.ai home page uses.

```ts
import type { core, recipe, household, humanitarian } from "@cookwala/sdk";
// core.ExecuteRequest, core.ExecutionStatus, recipe.Recipe, household.HouseholdContext, humanitarian.Offer
import { CookwalaDryRun } from "@cookwala/sdk/dryrun"; // or <script src="/assets/dryrun.js">

const result = CookwalaDryRun.dryRun(recipe, device, opsById, /* humanPresent */ true, /* allowModel */ true);
// { state: "accepted", plan: [...] } or { state: "refused", refusal: { reason, node, detail } }
```

Status: **source package**, consumed from the repository (`"@cookwala/sdk": "file:../cookwala/sdk/typescript"`)
or by copying `src/`. Publishing to npm is next on the roadmap. `npm run typecheck` checks the
generated types compile; `npm run generate` regenerates them after a schema change.

`dryrun.js` is a pure-function port of `tools/cookwala_ref.py` (`ladder_choice`, `dry_run`) and
is kept in step with the Python reference; the conformance vectors in `conformance/envelope.json`
cover the sensor-ladder choices it makes.
