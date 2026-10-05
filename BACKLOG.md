# Backlog: proposed changes, ideas and open questions

**Status:** living document, started 2026-10-05. Anyone may review it, argue with it, or pick an
item up. Open an issue or a discussion on GitHub naming the item's id (for example `P-04`), or
send a pull request. Items marked **decision** wait for the founder; items marked **reviewer**
need a named professional before they can be accepted; everything else is open to anyone.

How items got here: an internal review of the site and the standard run on 2026-10-04 from
[`prompts/critique-prompt.md`](prompts/critique-prompt.md); feedback from outside readers of the
site; and the maintainer's own list. Nothing here
is a promise or a date. "Done" items stay for a while so a reader can see what changed.

Labels: `standard` (schemas, vocabularies, Core text), `reference` (reference library, hub,
SDKs, vectors), `site`, `governance`, `data` (recipes and vocabularies), `review` (needs a
professional), `decision` (founder), `good first issue`.

## 1. Decisions waiting for the founder

| Id | Item | Why it matters |
|---|---|---|
| D-01 | **The one-liner.** Decided 2026-10-05: the hero reads "Robots are learning to move. Nobody had written down how to cook." over "Cookwala is the open standard for cooking safely: people, kitchens and robots."; done. Earlier candidates for the record: Five candidates exist: the current "The open standard for cooking safely: people, kitchens and robots"; "Cookwala turns cooking knowledge into instructions machines can understand, and conditions they can verify"; "an open way to write recipes so that people, ovens and robots can all cook them safely, and refuse when they can't"; the hero line "Robots are learning to move. Nobody had written down how to cook."; and a pairing of the last two | Every page, the GitHub description and the social card repeat it |
| D-02 | **Recipe rights per imported collection.** Decided 2026-10-05: the four uncredited-rights collections publish structured facts only (`text: facts`), `LicenseRef-source-credited` is defined in `LICENSES/`, and a collection moves to full text when its rights holder confirms in writing | done; the written confirmations remain to be obtained |
| D-03 | **The signature scheme.** Done 2026-10-05 as RFC-0012 (Core 0.2.1): the signing header covers alg, hash, kid, kind and signedAt; comment window open to 2026-11-04 | done |
| D-04 | **Origin story in the founder's voice.** Done 2026-10-05 on the home and why pages in six languages; the founder may still edit the wording | done |
| D-05 | **Four audience cards under the hero.** Done 2026-10-05: device makers, developers, food banks, funders and partners | done |
| D-06 | **Host analytics.** Keep the host's cookie-less beacon and keep disclosing it, or switch it off | The trust page now says what it does; the choice is the founder's |
| D-07 | **Community Specification License 1.0.** Adopted 2026-10-05: LICENSE-SPEC.md, SCOPE.md, NOTICES.md, contributor agreement with sign-off; the legal person behind fifi.cooking still to be stated after counsel review | done |
| D-08 | **A contact address** for programs, funders and press | Every "path forward" line ends at GitHub Discussions today |
| D-09 | **Transparency log or public-chain anchoring** for event-log checkpoints and certifications | RFC-0010 models chain anchors as optional evidence only |
| D-10 | **Rename the `basic-nutrition-food-safety` rule pack** to a name that does not put WHO in a product name; a registry name change needs a tombstone and a new entry | The labelling fixes are done; the id remains |
| D-11 | **Status badges in three states**: spec only, software ready, hardware pending, replacing normative/draft/experimental on the site | Says what runs, not how mature the document is |
| D-12 | **Registry accounts for the samples.** Who owns the PyPI project `cookwala-samples`, the npm scope `@cookwala`, the Maven namespace `ai.cookwala`, the NuGet ids `Cookwala.*`, the Chocolatey package, the tap `amado2k5/homebrew-cookwala` and the Artifactory instance; then the repository secrets listed in `samples/DISTRIBUTION.md` | Every channel is built and tested; nothing is published until these exist |

## 2. The standard and the protocol

| Id | Item | Label | Status |
|---|---|---|---|
| P-01 | Signing header, one verification path, backdated-signature vector | standard, reference | done (RFC-0012) |
| P-02 | Witnessed checkpoints: independent witness required; fork vector | standard, reference | done (RFC-0012) |
| P-03 | Selective disclosure: salt at least 128 bits of fresh randomness per value, never reused; verifier rejects short salts; a vector | standard, reference | open |
| P-04 | Sensor-ladder rungs `model` and `time`: `model` requires a declared model capability with logged accuracy; `time` disallowed for operations carrying the time-temperature hazard | standard | open |
| P-05 | Capability claims: a vision-cue vocabulary that excludes thermal sensor ids; capabilities documents signed by the maker and checked against the registry | standard | open; RFC-0011 covers health and calibration |
| P-06 | Presence as a device-sensed, signed fact in the execution log; a request may only ask for unattended mode; define an observable for "reachable within one minute" | standard | open |
| P-07 | Agent mandates: signature required and verified, expiry checked, mandate hash and a nonce bound into the request | standard, reference | open |
| P-08 | Event `proposedBy` inside the event hash, or documented as unsigned metadata | standard | open |
| P-09 | A wire-level conformance suite that drives the Core API on a real endpoint (status validity, idempotency replay with a different body, ETag and If-Match, stop without headers, problem documents) | reference | open; the hub passes these by hand |
| P-10 | One `Refusal` shape in both the status document and the problem document; publish the error-type pages the problem `type` URIs point at; `recipe_not_found` as its own reason; idempotency keys scoped per principal with a body hash and a TTL | standard, reference | open |
| P-11 | RFC 8785 canonicaliser: ECMAScript number formatting (shortest round-trip, decimal between 1e-7 and 1e21), reject integers beyond 2^53, vectors computed by a second implementation | reference | open |
| P-12 | `format` enforcement everywhere (date-time, uri); map time-parsing errors to `invalid_timestamp` instead of a 500 | reference | open, good first issue |
| P-13 | Core text: rewrite each rule in sections 3 to 9 with an RFC 2119 keyword and a vector id; list the rules that are deliberately untestable; tag every vector with its conformance class so "passing its class" is computable | standard | open |
| P-14 | Envelope sources: a `source` object per envelope (document, section, year, reviewer or "unsourced"); reconcile hold 57 vs 60 °C, cool staging, pressure-cook venting, smoke core temperature, deep-fry parameter maximum vs envelope; clamp altitude; `testMethod` points at files that exist | standard, review | needs a food scientist |
| P-15 | Ingredient vocabulary: one canonical entry per food with preparation modifiers, FoodOn ids, allergen and density fields, reviewed allergen classes; today 188 label-collision groups, zero densities, zero allergens | data, review | open |
| P-16 | Units: every `Unit` enum member in `units.json`, reject unknown units, make pinch and dash ingredient-qualified; validator rules for heat within envelope, attention at least the envelope's, `minTime` at most `maxTime` | standard, reference | open, good first issue |
| P-17 | Versioning: version in the schema `$id` path, a negotiation section (reader behaviour for the next minor and for unknown non-`x-` fields), a `DEPRECATIONS.md` with field, since, removal version and migration (`elderly` to `older_adults` is the first entry), examples at the current Core version, an `unsupported_version` vector, publish the schema bundle with its hash | standard | open |
| P-18 | Humanitarian mappings: GS1 check-digit validation, an HXL header test against the official schema, a real DHIS2 payload example or removal of the claim, examples regenerated from the checker | standard, data | open |
| P-19 | Import quality: keep `min` and `max` for ranges, `null` for to-taste and count them unparsed; derive allergens from the ingredient vocabulary; never emit an empty `mayContain` as a positive statement; headline the executable count separately from the described cards | data | open |
| P-20 | SDKs generated from one OpenAPI source; local signature verification and canonical hashing in every language or a documented "trusts the hub"; the hub-private presence field out of the public clients | reference | open |
| P-21 | Hub: recalls feed populated and `recipe_recalled` exercised by a scenario; safety-limits pack consulted during the run, not only at the dry run; rate limits; cursor pagination on recalls | reference | open |
| P-22 | Untrusted-text rule enforced in code: a vector that feeds instruction-like text through the planner and asserts the plan is unchanged and `cw.incident.untrusted_instruction` is emitted | reference | open |
| P-23 | RFC-0010 follow-ups: a controlled vocabulary of named standards per certification scheme, catalog counter-signing of relayed certifications, mapping to GS1 Digital Link and Verifiable Credentials 2.0 | standard, review | needs certification bodies |
| P-24 | RFC-0011 follow-ups: signed calibration records, default accuracy per sensor class set by a metrologist, whether `degraded` may satisfy a rung with a widened tolerance | standard, review | needs a metrologist |
| P-25 | A recipe revision model that separates the authored recipe, the execution, the observation, a machine recommendation and a human-approved revision (from outside feedback) | standard | idea |
| P-26 | Calibration and provenance for the "Learn" loop: who owns execution data, how a machine-proposed change becomes a revision, versioning of changes | standard, governance | idea |
| P-27 | Samples (`samples/`): clients, agents, orchestrators, gates, recovery and reporting in Python, JavaScript, Java and C#, tested against the reference dry run; packages for PyPI, npm, Maven Central, NuGet, Homebrew, Chocolatey, Scoop, apt, RPM, pacman, apk, conda, snap, OCI, Helm and Artifactory; functions for Azure, AWS, Google Cloud and OpenShift | reference | built and tested; publishing waits for D-12; Go and Rust sample ports open |

## 3. Conformance, certification and governance

| Id | Item | Label | Status |
|---|---|---|---|
| G-01 | A hardware checklist schema with measured values (local stop latency, limits enforced without network) alongside the document vectors | standard | open |
| G-02 | Registry: remove verification records that were not performed; label the registry "static, maintained by pull request" until a service exists; a device maker publishes a report by pull request today | governance, site | partly done on the device-makers page |
| G-03 | Patent pledge: sign-off line and transferee binding now come from the Community Specification License (done 2026-10-05); naming the legal person waits for counsel | governance, decision | partly done |
| G-04 | RFC process: write open and close dates into every RFC header; a real decision log (`docs/DECISIONS.md` is the Mission profile today); name an interim second approver | governance | open |
| G-05 | Vocabulary and schema version table in one place; vocab versions documented in Core | standard | open, good first issue |
| G-06 | External reviews sought: food scientist (envelopes), dietitian and food-safety officer (rule packs), metrologist (RFC-0011), halal and kosher certification bodies (RFC-0010), security audit (trust model), data-protection impact assessment (household profile), W3C and IETF (identity, JSON-LD, SCITT) | review | open; the review template is at `docs/health/REVIEW-TEMPLATE.md` |
| G-07 | A first physical device cooking a Cookwala recipe, unedited, on video | partner | the one proof every outside reader asked for |

## 4. The website

| Id | Item | Label | Status |
|---|---|---|---|
| S-01 | Hero: the one-liner pairing (D-01) and four audience cards (D-05) | site, decision | waiting |
| S-02 | Origin story section (D-04) | site, decision | waiting |
| S-03 | Diagrams: author at a 480-unit viewBox with captions; RTL variants of the horizontal flows; arrowheads on the dry-run diagram on the goals page; wrap the household box text; move hard-coded English out of translated diagrams; diagrams that are still missing: the sensor ladder in detail, event-log checkpoints, the certification path | site | partly done (home diagram is vertical and captioned) |
| S-04 | Recipe pages: hreflang only for languages with a static page; `lastmod` in the sitemap; consider `noindex` on machine-translated V0 pages; split the sitemap | site | open |
| S-05 | Publish or delete the 18 translated-but-unbuilt document languages in `docs/i18n/`; fail the build when a shipped fragment contains untranslated English sentences; translate page titles; fix the French safety vocabulary (rappel, enveloppe, échelle) | site | open |
| S-06 | Tap targets at least 24 px; favicon, apple-touch-icon and manifest; a simpler mark below 32 px | site | open, good first issue |
| S-07 | Home URL should not be rewritten with default query parameters on load; the playground should say when it falls back from an unknown device id | site | open, good first issue |
| S-08 | Fingerprinted asset names and long cache lifetimes; preload the body font face; drop the weight-300 face; `ops.json` fetched once on the playground | site | open |
| S-09 | Information architecture: delete the goals and horizons sections from the why page, the roadmap block from the investors page, merge the trust status table into the roadmap; cut "honest" and "honestly" from headings | site | open |
| S-10 | A browser path for recipe authors: write a recipe, add end conditions, validate, sign, get a credited document, without a terminal | site, reference | idea, large |
| S-11 | A recipe provenance page per recipe: author, origin, revision, hash, which devices can cook it (from outside feedback) | site | idea |
| S-12 | Status badges in three states (D-11) | site, decision | waiting |
| S-13 | Deck: slide heading announced on navigation; keyboard-reachable envelope handles in the playground (`role="slider"`, arrow keys) | site | open |
| S-14 | A 90-second recording of a refusal in the playground, captions only, for the press folder | site | open |

## 5. Done recently (so the list above makes sense)

- Reference dry run refuses targets, oil temperatures, pressure and heat levels outside the envelope, non-numeric numbers and values above a stricter local limit; the legacy step is non-executable; seven vectors.
- Hub: optional bearer token, no CORS by default, stop exempt from headers, allergen blocks match allergens, status documents validate, quoted ETag, incident validation.
- Conformance reports are signed or not written; the vector set has a published hash; `--verify-report`.
- RFC-0010 certifications (halal, kosher, vegetarian, organic and others; many authorities; re-certification) and RFC-0011 sensor trust (health, calibration, plausibility).
- Site: fonts self-hosted; the trust page describes the host's analytics; language counts and evidence labels corrected in six editions; contrast, deck keyboard handling and Arabic number direction fixed; Recipes in the navigation; every recipe page says what Cookwala is; the proof strip is rendered at build time; the home JSON block became a captioned diagram; first-mention glosses; a positioning block; every planned item names its gate; a device-makers page.

## 6. How to pick something up

1. Comment on or open an issue with the item id. For `review` items, say which profession you bring; your name is not published unless you want it to be.
2. Small fixes: a pull request. Vocabulary entries and vendor namespaces: a pull request with a 7-day window. Spec changes: an RFC in `rfcs/` with a 30-day comment window ([`GOVERNANCE.md`](GOVERNANCE.md)).
3. Run `python tools/validate_specs.py`, `python tools/run_conformance.py` and `python tools/scenarios/run.py` before you send anything; the vectors hash in `conformance/VECTORS-HASH.txt` must be regenerated with `tools/make_conformance.py` when vectors change.
