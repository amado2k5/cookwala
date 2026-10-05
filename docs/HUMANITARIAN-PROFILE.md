# Cookwala Humanitarian Profile (draft 0.2)

**Status:** draft for review by food banks, relief programs and food-safety and nutrition
professionals. It is not reviewed or endorsed by WFP, WHO, FAO, the Global FoodBanking
Network or any other organization named here.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (all), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; all drafts awaiting professional review, see [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank in Cairo, school meals, disaster kitchen, robot kitchen), each with a computed `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. What 0.2 adds (RFC-0003, RFC-0004)

Additive over 0.1; readers accept both.

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) and `Item.harvestedAt`; roles `farm`, `caterer`, `robot_kitchen`; the SMS word `FARM`.
- **Care rules:** `Item.foodClasses` and `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), rule kind `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; three new draft packs.
- **Reviews:** `RulePack.reviews` records the profession, organization, date, scope and outcome of each review; `status: reviewed` needs an approved review.
- **Impact:** `ImpactSummary` with nine measures, each carrying `method` (measured, modelled, assumed, not recorded), computed by `tools/humanitarian_check.py --summary`.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` so kilograms rescued count once.
- **Program types** on the `Manifest`.

## 1. Purpose

A small, strict, personal-data-free part of Cookwala for organizations that feed people:
food banks, community kitchens, school-meal programs, relief programs, donors (grocers,
restaurants, farms, caterers), transporters and cold stores. It covers four jobs:

1. **Offering surplus food** and claiming it, quickly and fairly.
2. **Recording each handover** of custody, with a temperature check (cold-chain check).
3. **Reporting what was served** as aggregate counts only.
4. **Checking menus and handovers** against machine-readable nutrition and food-safety rules.

**It works without robots, apps or internet.** Levels H0 and H1 run on spreadsheets, SMS
and basic phones. Robots, hubs and agents are optional consumers of the same documents.

## 2. Principles

- **Do no harm.** Collect nothing that could identify, locate or profile a person or
  household. In fragile settings, data about beneficiaries is a protection risk.
- **Humanitarian principles** (humanity, neutrality, impartiality, independence): no
  commercial branding on aid, and no use of data for marketing.
- **Strict and small.** Every object rejects unknown fields (except `x-` extensions),
  so typos and extra personal fields fail validation.
- **Exact units:** kilograms, degrees Celsius, absolute tolerances, and money as decimal strings.
- **Local rules win.** Rule packs are replaceable by national food-safety and donation law.
- **Open:** royalty-free spec, open-source tools. The profile is designed to meet the
  Digital Public Goods Standard and the Principles for Digital Development.

## 3. Conformance levels

| Level | What a participant does | Needs |
|---|---|---|
| **H0 — Paper & SMS** | Records offers, handovers and distributions in the CSV templates (with HXL hashtag rows) or by SMS (section 8.3) | A spreadsheet or a basic phone |
| **H1 — Rescue** | Exchanges `Offer`, `Claim`, `Handover` and `Distribution` documents over the API; follows the state machine (section 5) | Any HTTP client |
| **H2 — Safety & nutrition** | Applies a `RulePack` to every handover and menu, and records `findings` | The reference checker or an equivalent |
| **H3 — Interoperability** | Exports aggregates to HXL, DHIS2 and the core Cookwala `ImpactReport`; uses GS1 identifiers | Integration work |

A participant publishes a `Manifest` at `/.well-known/cookwala-humanitarian.json` that
declares its levels, rule packs, endpoints and `personalData: "none"`.

## 4. Documents

| Document | Who writes it | Purpose |
|---|---|---|
| `Offer` | Donor | Surplus food available for collection: items (kg, storage, date marks, allergens), window, site, temperatures |
| `Claim` | Food bank, kitchen, program | Claims all or part of an offer, with a pickup time and vehicle type |
| `Handover` | Receiver of custody | One per leg: temperatures, kg accepted or rejected with a reason code, and rule findings |
| `Distribution` | Kitchen, food bank, school | Aggregate meals and people served at a site on a day; optional menu nutrients and costs |
| `RulePack` | Program or authority | Versioned nutrition and food-safety rules (section 6) |
| `Manifest` | Every participant | Capabilities and data-protection declaration |

The core Cookwala relief documents (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) remain available for planning. This profile handles
the operational flow.

## 5. Offer lifecycle

| From | Allowed next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**Rules for state changes:**

- Every change increments `version`. Writers send `If-Match: <version>`; a mismatch returns
  **409**, and the writer re-reads and retries.
- An illegal transition returns **409** with the allowed transitions.
- Offers move to `expired` automatically at `window.to`.
- Claims lapse at `pickupBy` plus a grace period the program sets (default 30 minutes).

**Fair claiming.** By default, claims are first-come within a priority tier the program sets:
for example, kitchens serving children first, then other kitchens, then food banks. Tiers and
any rotation rules must be published in the program's `Manifest` or website.

## 6. Food safety and nutrition rule packs

A `RulePack` holds rules of six kinds:

- `temperature`: chilled ≤ 5 °C, hot-held ≥ 60 °C, frozen ≤ −18 °C;
- `time`: cooked food out of temperature control for at most 2 h;
- `date_mark`: use-by blocks, best-before warns;
- `allergen`: undeclared allergens block;
- `nutrient`: amounts per person-day or per meal;
- `energy_share`: share of energy from free sugars, fat, saturated fat, trans fat or protein.

Each rule is either `block` (do not accept or serve) or `warn` (allowed, recorded as a finding).

The default pack `who-codex-basic@0.1.0` is a **draft derived from public guidance**: WHO's
healthy-diet, sodium, sugars and fats guidance, the WHO Five Keys to Safer Food, Codex
labelling and frozen-food codes, and Sphere's minimum ration planning figures. It is
simplified, not medical advice, excludes infant and therapeutic feeding, and must be reviewed
by qualified staff. Programs should copy and adapt it, set `jurisdiction`, and record who
reviewed it in `reviewedBy`.

Receivers at level H2 run the pack at every handover and on every menu, and record rule ids
in `findings`. The reference checker reports where declared and computed findings disagree.

## 7. Data protection

**The profile carries no personal data. Documents MUST NOT contain:**

- names, phone numbers, emails, or national, refugee or biometric identifiers of any person;
- household-level records, or locations of homes or individuals;
- health, disability, religion or nationality of any person.

**What it carries instead:**

- **Organizations only.** Every party is an organization identified by `did:web`, a GS1
  Global Location Number (GLN) or a registry id. People appear only as roles
  (`checkedBy: "trained_staff"`).
- **Aggregates only.** `Distribution.people` holds counts by group, and any count under 10
  is reported as `"<10"`.
- **Sites only.** A `Site` is an organization's premises or an administrative area
  (OCHA P-codes), never a household.
- **Short notes.** Free text is limited to 280-character operational notes and must not
  contain personal data. Implementations should scan notes for phone numbers and ids
  before storing them.

**Retention and audit:**

- **Retention:** each participant declares `retentionDays` in its `Manifest` and deletes
  documents after it.
- **Audit (optional, `hash_only`):** one sequencer per program (normally the food bank or
  program operator) appends the SHA-256 hash of each document's RFC 8785 canonical JSON.
  Contents are stored separately and remain deletable. A partner organization
  counter-signs a checkpoint each day, so history can't be rewritten silently. A single
  sequencer avoids forks in the chain.
- **Hosting** should be in-country where the law or the program requires it.

## 8. Transport

### 8.1 API (level H1)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/offers` | Creates an offer (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Open offers near a receiver |
| `POST` | `/offers/{id}/claims` | Claims an offer; `If-Match` required; 409 when already claimed |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` required |
| `POST` | `/handovers` | Records a handover |
| `POST` | `/distributions` | Records a distribution |
| `GET` | `/reports?from=…&to=…` | Aggregates for a period |

Request and transport rules:

- **Idempotency:** every `POST` carries an `Idempotency-Key`. Servers keep keys for at
  least 24 h and return the original response for repeats.
- **Authentication:** OAuth 2.1 client credentials, one client per organization.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  are delivered at least once, with an event `id` for deduplication and a per-offer
  sequence number for ordering.

### 8.2 Spreadsheets (level H0)

Use the CSV templates in `profiles/humanitarian/templates/`. Their second row holds
[HXL](https://hxlstandard.org) hashtags, so humanitarian data tools can read them directly.

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

The grammar is implemented in `tools/cookwala_ref.py` (`parse_sms`) and tested by
`conformance/profiles/sms.json`. Keywords are English; Arabic-Indic (٠-٩) and Persian (۰-۹)
digits are accepted wherever a digit is, so a phone set to either keyboard works.

Storage codes: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Date marks: `UB` use-by,
`BB` best-before, `HV` harvested, as `DDMM`. Reject reason codes: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; any other word is recorded as `other`. The `HELP`
reply MUST be one example per command, plain ASCII, under 160 characters.

A gateway MUST apply these checks before it writes a document (`sms_storage_findings` in the
reference; ids are block findings):

| Finding | When |
|---|---|
| `safety.temp_not_recorded` | a `HAND` on a chilled, frozen or hot-held line carries no `T` reading: reply asking for it, write nothing |
| `safety.hot_hold_min` | an `OFFER` with storage `H` below 60 °C: refuse to list it |
| `safety.storage_class_mismatch` | the item words imply dairy, meat, poultry, fish, egg or cooked food and storage is `A`: refuse to list it |
| `safety.chilled_max`, `safety.frozen_max` | readings above 5 °C or above −18 °C on offer or handover |

Offers of hot-held food close after two hours (one hour for cooked rice); a gateway never
stores a placeholder reading. The gateway maps the sender's registered number to an
organization, never to a person in the documents.

## 9. Interoperability

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| Certifications (RFC-0010) | `Item.certifications[]` points at signed `Certification` documents (halal, kosher, organic…) by hash; a program verifies them against the authority's key, never from the message text |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Aggregate data values per site and period from `Distribution` (meals, people by group, kg, incidents) |
| WFP SCOPE and other beneficiary systems | **Aggregates only.** No beneficiary records cross into or out of this profile |
| Food-rescue apps | Adapters map their listings to `Offer` and their pickups to `Claim` and `Handover` |
| Core Cookwala | `Item.ingredientId` and `menu.recipes` link to the recipe index; `relief.ImpactReport` sums `Distribution`s |

## 10. Pilot metrics (defined so sites can be compared)

Computed into an `ImpactSummary` by `python tools/humanitarian_check.py --summary DIR`. How a pilot is run and judged: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metric | Definition |
|---|---|
| Kg rescued | Sum of `Handover.kgAccepted` on the first leg from donors |
| Claim rate | Offers that reach `claimed` ÷ offers created |
| Time to claim | Median minutes from `Offer` creation to the `claimed` state |
| Rejection by reason | Sum of `kgRejected` by `reason` |
| Meals served | Sum of `Distribution.meals` |
| Nutrition pass rate | Distributions with menus and no `nutrition.*` findings ÷ distributions with menus |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | Count of `safety.*` block findings, and `safetyIncidents` |

## 11. Security

- **Signatures are optional at H1** and required for cross-organization audit at H3
  (EdDSA, keys published at the organization's `did:web`).
- **Notes and names in documents are untrusted data.** Software and AI agents must never
  treat them as instructions.
- **Rule packs are versioned and pinned** (`id@version`) in every finding, so results are
  reproducible.

## 12. Deliberately left out

- Beneficiary registration, eligibility and targeting (these belong to the program's own
  protected systems).
- Payments: Cookwala never moves money.
- Recipes and robot execution (the core spec). The profile only names recipes and reports
  nutrients.
- Medical and therapeutic nutrition.

## 13. How to review

Please open issues on [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
with the label `humanitarian`. These reviews are the most useful:

- food-safety staff checking the rule pack and the reject reasons;
- food-bank operators checking the lifecycle and the SMS flow;
- data-protection officers checking section 7.
