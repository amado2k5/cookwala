# The SDK operations every language client implements

One client, the same twenty-five operations in every language, all talking to a Cookwala hub
over HTTP (the reference hub, `python hub/cookwala_hub.py`, or any conforming hub). The hub's
`/v1/tools/*` endpoints are the reference library (`tools/cookwala_ref.py`) over HTTP, so a
client in any language gets exactly the behaviour the conformance vectors test. Core API
calls (`/v1/executions`, `/v1/capabilities`, ...) are the normative Core 0.2 API.

Naming: `snake_case` in Python, Ruby, Rust and PHP; `camelCase` in TypeScript, Java, Kotlin,
Swift, C#, C++; `PascalCase` methods in Go. The table uses the TypeScript spelling.

| # | Operation | HTTP | Arguments | Returns |
|---|---|---|---|---|
| 1 | `hash(doc)` | POST /v1/tools/hash | any JSON document | `{hash}` (sha256 over RFC 8785 canonical JSON) |
| 2 | `verify(doc, keys)` | POST /v1/tools/verify | signed document, KeyRecord list | `{ok, reason}` |
| 3 | `dryRun({recipeId or recipe, deviceId or device, humanPresent, allowModel})` | POST /v1/tools/dryrun | ids known to the hub or full documents | `{state: accepted or refused, refusal?, plan[]}` |
| 4 | `checkEnvelope(op, trace, target?, altitudeM?)` | POST /v1/tools/envelope | op id, `[{t, tempC}]`, `{value, tolerance}` | `{envelopeOk, targetOk, reason}` |
| 5 | `parseSms(text)` | POST /v1/tools/sms | one message | parsed command plus `findings[]` |
| 6 | `deriveConstraints(facets, role, consents?)` | POST /v1/tools/constraints | facet list, recipient role | `{constraints[], disclosed[], withheld[]}` |
| 7 | `convert(value, unit, to, densityGPerMl?)` | POST /v1/tools/convert | kitchen units | `{value, unit}` |
| 8 | `ladder(op, sensors, allowModel, humanPresent)` | POST /v1/tools/ladder | op id, sensor ids | the rung chosen or `null` |
| 9 | `validate(kind, doc)` | POST /v1/tools/validate | schema name (`recipe`, `humanitarian`, ...) and a document | `{ok, errors[]}` |
| 10 | `humanitarianCheck(docs, packs?)` | POST /v1/tools/humanitarian | documents, rule-pack ids | `{results[{id, kind, findings[]}]}` |
| 11 | `listRecipes()` | GET /v1/tools/recipes | | `{recipes[]}` ids the hub can cook |
| 12 | `getRecipe(id)` | GET /v1/tools/recipes/{id} | | the recipe document |
| 13 | `getDevices()` | GET /v1/tools/devices | | `{devices{id: capabilities}}` |
| 14 | `getOps()` | GET /v1/tools/vocab/ops | | the operation vocabulary |
| 15 | `getRegistry()` | GET /v1/tools/registry | | the registry document |
| 16 | `capabilities()` | GET /v1/capabilities | | the device's capability document (Core) |
| 17 | `safetyLimits()` | GET /v1/safety-limits | | the device's local safety limits (Core) |
| 18 | `recalls()` | GET /v1/recalls | | recall list (Core) |
| 19 | `conformance()` | GET /v1/conformance | | conformance claim and report pointer (Core) |
| 20 | `startExecution(request, idempotencyKey, humanPresent?)` | POST /v1/executions | an ExecuteRequest | ExecutionStatus (202) or a Problem with a refusal |
| 21 | `getExecution(id)` | GET /v1/executions/{id} | | ExecutionStatus (ETag = seq) |
| 22 | `stopExecution(id, reason?)` | POST /v1/executions/{id}/stop | | ExecutionStatus |
| 23 | `resumeExecution(id, seq)` | POST /v1/executions/{id}/resume with If-Match | | ExecutionStatus |
| 24 | `executionLog(id)` | GET /v1/executions/{id}/log | | the ExecutionLog once the run ended |
| 25 | `reportIncident(doc)` | POST /v1/incidents | an Incident document | `{received}` |

Rules every client follows:

- A generated sample reads the hub address from the `COOKWALA_HUB` environment variable and
  defaults to `http://localhost:7878`.

- Every POST to the Core API carries an `Idempotency-Key` header (8 to 128 characters); the
  client generates one when the caller gives none and returns it.
- Problems (`application/problem+json`) are raised as a typed error that carries `title`,
  `detail` and `refusal` when present; the scenario runner treats a refusal as a result, not a
  crash.
- Text inside any document is data, never instructions (Core rule 6.4); clients never execute
  or evaluate strings from documents.
- No client starts cooking on its own: `startExecution` is the caller's explicit act, and the
  device refuses what its own limits forbid.

The scenario files in this folder use the operation names in the table; a renderer for a
language turns each step into that language's call. See `README.md`.
