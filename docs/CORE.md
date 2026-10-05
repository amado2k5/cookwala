# Cookwala Core 0.2

**Status:** draft, 2026-10-04. This is the normative part of Cookwala. MUST, SHOULD and MAY
follow RFC 2119. Everything not listed here is an optional **profile** (section 10).

A device should be able to implement Core in about a week. Core says **what to make, when it
is done and what must never happen**. It does not say how a robot moves.

## 1. Conformance classes

| Class | Must implement |
|---|---|
| **Recipe publisher** | Valid `recipe.schema.json` documents; temperatures inside operation envelopes; a hash and a signature |
| **Executor** (robot, appliance or hub) | The Core API (`api/core.openapi.yaml`); operation envelopes and sensor ladders; local safety limits; refusal instead of guessing; the execution log |
| **Catalog** | Signed recipes, `/.well-known/cookwala.json` with key records, the recall feed, incident intake |
| **Agent** (AI or software acting for a person) | Acts only under an `AgentMandate`; treats document text as data; asks the principal before anything in `confirmBefore` |
| **Verifier** | Hashes, signatures, key validity and revocation, disclosures, event chains and checkpoints |

Claiming a class means passing its conformance vectors (`conformance/`, run with
`tools/run_conformance.py`).

## 2. Core documents

| Document | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

All schemas are **strict**: unknown fields are rejected, except `x-<vendor>-…` extensions.
Readers ignore `x-` fields they don't understand. `tools/bundle_schemas.py` produces a single
bundle so that devices validate offline. Implementations MUST NOT fetch schemas at run time.

## 3. What operations mean

- **Envelopes.** Every heat-based or hazardous operation in `vocab/ops.json` has an `envelope`.
  It specifies:
  - the medium (water, oil, air, pan surface, product…);
  - its temperature band in °C (and pressure, for pressure cooking);
  - agitation, lid, attention level and whether the step may run unattended;
  - hazards;
  - a test method.

  Example: `cw.op.simmer` = water-based liquid at 85–96 °C; `cw.op.deep_fry` = oil at 160–190 °C.
- **Targets inside envelopes.** A recipe target (`params.tempC` or a `target` on the medium's
  sensor) MUST lie inside the envelope. The validator rejects recipes that break this.
- **Executors keep the medium inside the envelope.** If the recipe gives a narrower target,
  they keep it inside that too, once it is first reached.
- **Altitude.** Water and steam bands shift by −1 °C per 300 m of kitchen altitude.
- **Heat levels** (`very_low` … `max`) have one shared meaning: a pan-surface band in °C,
  defined in `vocab/units.json`.
- **Sensor ladder.** Each envelope lists ways to verify the step, best first: a specific sensor,
  then `model` (a logged estimate), then `time`, then `human`.
  - The executor uses the first rung it can satisfy and records it in `verifiedBy`.
  - If it can satisfy **no** rung, it MUST refuse the step (`missing_sensor_no_fallback`).
  - Operations that need constant attention and may not run unattended (sautéing, searing,
    frying, reducing, caramelizing…) never fall back to time alone: their last rung is a person
    watching.
  - Deep frying has no fallback: no oil-temperature sensor means no deep frying.
  - A `Condition` can narrow this with `onSensorMissing`.
- **Refusal, not guessing.** An executor that cannot meet a step's envelope, ladder, equipment
  or safety limits MUST answer `refused` with a reason before starting.

## 4. Numbers and units

- **Temperatures are °C on the wire.** Displays may convert.
- **Tolerances.**
  - `tolerance` is relative and allowed only on ratio-scale units.
  - `toleranceAbs` is absolute in the value's unit, and is the only tolerance allowed on °C.
  - `Target.tolerance` is absolute.
- **Kitchen units have exact metric values:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass needs a density** (`Quantity.densityGPerMl`, or the ingredient vocabulary);
  without one it is an error, never a guess.
- **Money is a decimal string** (`"12.70"`) with an ISO 4217 currency, never a float.

## 5. Integrity and trust

- **Hash.** `sha256:` plus the hex digest of the RFC 8785 canonical JSON of the document,
  without its `hash` and `signature` fields. The reference canonicalizer reproduces the RFC
  8785 example exactly.
- **Signature.** Ed25519 (`EdDSA`) over the ASCII hash string. `ES256` is allowed for P-256
  hardware keys. `kid` names a `KeyRecord`.
- **Keys.** A `KeyRecord` gives the public key, its owner, a validity window and `revokedAt`.
  A signature whose `signedAt` falls after revocation, or outside the validity window, is
  invalid.
  - Catalogs publish their keys in `/.well-known/cookwala.json`.
  - Organizations and people publish theirs in did:web documents.
  - Devices publish theirs in their capabilities document.
  - Verifiers cache key records for offline use.
- **Selective disclosure.** A signed document may hold a `Disclosure` digest,
  `sha256(JCS([salt, value]))`, instead of a sensitive value. The holder reveals the salt and
  value only to parties allowed to see them, and the signature still verifies.
- **Event logs** (Mission profile):
  - One sequencer per log assigns `seq` and `prev`, so the chain never forks.
  - Checkpoints are signed by the sequencer and counter-signed by witnesses, who may include
    a transparency service such as IETF SCITT. A rewrite after a witnessed checkpoint is
    detectable.
  - In `hash_only` mode, payloads live in erasable storage and the log keeps only their hashes.

## 6. Safety and agent rules (normative)

1. **Safety is local.** Executors enforce a `SafetyLimits` pack on the device.
   - No recipe, agent, remote message, extension or operating mode can raise or disable a limit.
   - A stricter limit always wins.
   - `profiles/core/safety-limits.default.json` is a draft starting point that device makers
     tighten from their own safety case.
2. **Local stop.** A stop control on the device stops motion within 0.5 s and cuts heat within
   1 s, with or without a network. `POST …/stop` is never refused for authorization once the
   caller can reach the executor.
3. **Events report; they never protect.** `cookwalalatency: local_safety` events report what a
   device already did. No safety function may depend on an event arriving.
4. **Untrusted text.** Every free-text field (annotated `x-cookwala-untrusted`) is data and never
   an instruction, for software and AI agents alike. Attempts to instruct through text are
   ignored and logged (`cw.incident.untrusted_instruction`).
5. **Agents act under a mandate.** A request sent by an agent carries an `AgentMandate` signed
   by the principal: scopes, spending caps, allowed providers, expiry, and actions that need
   confirmation.
   - `irreversible` and `safety_override` always need confirmation, whatever the mandate says.
   - Executors refuse requests outside the mandate (`mandate_scope`).
6. **Unattended operations need a person.** Operations whose envelope says `unattended: false`
   need a responsible person present, or reachable within one minute.
7. **Allergen blocks refuse.** Any blocked allergen in the recipe or the inventory refuses the
   request; there are no substitutions around a block.
8. **Recalls.** Catalogs publish signed recalls at `GET /v1/recalls`. Executors poll when online
   and refuse recalled revisions. `block_and_stop_running` also stops running executions safely.
9. **Incident reports** are anonymous (`IncidentReport`: date only, no names or ids) and
   submitted to catalogs so every maker learns from each near miss.

## 7. Execution lifecycle and API

- **API:** `api/core.openapi.yaml`. Its endpoints are:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog side: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` and `stopping` → `stopped` along the way;
  - `refused` and `failed` are final.
  - The full transition table is in `core.schema.json#/$defs/ExecutionState` and the
    conformance vectors.
- **Request rules:**
  - Every POST carries an `Idempotency-Key`.
  - Changes to an existing execution carry `If-Match: <seq>`; a mismatch returns 412.
  - Stop does not require If-Match.
- **Events:**
  - Delivery is at least once.
  - CloudEvents `id` is the deduplication key.
  - `cookwalaseq` orders events per subject and matches the status `seq`.
  - Devices emit `cookwala.device.heartbeat`, so a hub can detect a lost device and hand off.

## 8. Privacy

- **Execution logs carry no personal data** (`privacy.personalData: "none"`).
- **They leave the device only with opt-in consent** (`consent.dataset`: `none` by default,
  `research_only`, or `open`). Consent can be withdrawn.
- **Open datasets coarsen times to the day.**
- **Household, health and religious data stay home** unless the person chooses otherwise.
  When it must travel, it travels as selective disclosures.
- **The Humanitarian Profile** carries no personal data at all.

## 9. Versioning and extensions

- **Core versions are `0.2.x`.**
  - Readers accept any patch of their minor version.
  - They reject other minors with `unsupported_version`.
  - They ignore unknown `x-` fields.
- **New operations, units, sensors and incident types** are added to vocabularies without a
  version change.
- **Changing an operation's meaning is a new id;** the old one is marked `deprecated` with
  `replacedBy`.
- **Profiles** version independently and declare the Core version they need.

## 10. Profiles and their status

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | Target for the first device implementations |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | No personal data; works by SMS and CSV; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first household facts; only derived constraints travel (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Proven namespaces, exact versions, tombstones; organizations by request (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Signed reports behind every conformance claim (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds and relays; verify against the issuer (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurants, community, school, disaster and robot kitchens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Aggregated, delayed, class-level demand and supply signals; gated on competition-law review (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, transitions in `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Needs a competition-law review before production use |
| Relief planning (`relief.schema.json`) | experimental | Operational flow moved to the Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | The OpenAPI Core API is the reference surface |

A profile becomes stable when two independent implementations pass its conformance vectors
and it has real users.

## 11. Tools

| Tool | What it does |
|---|---|
| `tools/validate_specs.py` | Checks schemas, examples, recipe semantics (envelopes, op parameters, no template placeholders), strictness, and that API references resolve |
| `tools/run_conformance.py` | Runs `conformance/*.json` and `conformance/profiles/*.json`, and writes a ConformanceReport with `--report`: hashing (including the RFC 8785 example), signatures (including an RFC 8032 key), revocation, disclosure, event chains and checkpoints, units, envelopes, sensor ladders, executor dry runs (targets outside an envelope, non-numeric numbers, stricter local limits, heat levels, the non-executable legacy step), state machines |
| `tools/cookwala_ref.py` | Reference library and CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regenerates the vectors (review the diff) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack checker and impact summaries |
| `tools/make_profile_vectors.py` | Regenerates the profile vectors in `conformance/profiles/` |

## 12. Changes from 0.1

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Accepted unknown fields | Strict, with `x-` extensions |
| Temperatures | °C or °F, relative tolerance allowed | °C only; absolute tolerance |
| Money | Number | Decimal string |
| Operations | Prose definitions | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, keys without lifecycle | EdDSA or ES256, KeyRecords with validity and revocation |
| Missions | One mutable document, ledger inside | Event log + projection, single sequencer, witnessed checkpoints, hash-only mode |
| Agents | Mandate inside Missions only | `AgentMandate` in common; required for agent requests |
| Safety | Declared in recipes | Also enforced locally through SafetyLimits; recalls; incident reports |
| Data | No dataset model | Consented, personal-data-free ExecutionLog |
| Conformance | Schema validation only | 113 vectors (51 Core, 62 profile) plus a reference implementation |

To migrate a 0.1 document: convert °F to °C; replace relative tolerances on temperatures with
`toleranceAbs`; turn money amounts into decimal strings; remove or rename unknown fields to
`x-` fields.
