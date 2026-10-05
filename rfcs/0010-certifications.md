# RFC-0010: Certifications of ingredients, lots, recipes, meals and kitchens

**Status:** draft, 2026-10-05 · **Touches:** `schemas/common.schema.json` (new `Certification`, `CertificationRef` and parts), `schemas/recipe.schema.json` (`safety.dietary[].certifications`, `ingredients[].certifications`), `schemas/humanitarian.schema.json` (`Item.certifications`), `api/index.openapi.yaml` (`/v1/certifications`), `tools/cookwala_ref.py`, `conformance/profiles/certifications.json`, `examples/certifications/` · **Core 0.2 normative text:** unchanged · **Safety relevant:** yes (dietary and religious requirements are "critical" constraints in Missions) · **Reviewer:** none yet; a halal and a kosher certification body should read section 3.

## Problem

Recipes carry `safety.dietary[]` with a claim (`halal`, `kosher`, `vegetarian`, ...) and a `basis`
of `ingredients` or `certified`, plus one free-text `certificate` field. That cannot say who
certified what, when, under which standard, whether the certificate is still valid, or whether
a second authority also certified it. A kofta recipe is halal only if its beef is; the beef lot
changes every week; the recipe document is signed and immutable per revision. Food banks and
kitchens receive items whose halal, kosher or organic status matters to the people served, and
the Humanitarian Profile has no field for it. Nothing lets a provider certify an ingredient or a
meal in the pipeline, or let a different authority certify the same thing later.

## Proposal

1. **A detached, signed document.** `Certification` (in `common.schema.json`) says: `scheme`
   (halal, kosher, vegetarian, vegan, organic, gluten_free, dairy_free, nut_free, fair_trade,
   non_gmo, food_safety, or `x-…` for anything else), the `standard` applied, the `subject`
   (an ingredient, a lot with GTIN and lot number, a product, a recipe revision by hash, a meal,
   or a kitchen), the `authority` (a did:web or URL that publishes its `KeyRecord`s), `status`
   (valid, suspended, revoked), the dates (issued, valid from, valid until, revoked), the
   authority's own `certificateId`, free-text `scope` and `conditions`, optional `evidence`
   links, and the authority's **signature** over the document hash (Core section 5).
2. **Detached, not embedded.** The certification points at the certified thing by hash; the
   recipe need not change. A recipe or an item may carry `certifications[]` of
   `CertificationRef` (id, scheme, authority, hash, url) as a hint of what was known when it was
   signed. A reference is never proof: the reader fetches the document and verifies it.
3. **Many authorities, many times.** Any number of authorities may certify one subject. One
   authority re-certifies by issuing a new document with `supersedes` naming its earlier one;
   the newest verifying document of that authority wins and older ones are *superseded*. A
   revocation is a new status on a document the authority publishes, not an edit of the old one.
4. **Evidence is optional and outside the standard.** `evidence[]` may link the authority's
   certificate page, a W3C Verifiable Credential, a transparency-log entry (for example IETF
   SCITT), a public-chain anchor of the hash (`chain`, `txId`), a registry entry, or a file by
   hash. The standard verifies the signature; the links let a human check elsewhere. Whether
   Cookwala itself anchors to a transparency log or a chain is a separate, open decision.
5. **Verification rules** (`tools/cookwala_ref.py`, `verify_certification`,
   `current_certifications`): the signature verifies against a `KeyRecord` of `authority.id`;
   `subject.hash` equals the hash of the document the reader holds; `now` lies inside the
   validity window; status is `valid`; within one authority and scheme the newest document is
   current and the rest are superseded. Reasons are machine-readable (`expired`, `revoked`,
   `subject_mismatch`, `bad_signature`, `unsigned`, `unknown_key`, `superseded`).
6. **Where it is used.** Recipes (`safety.dietary[].certifications`, `ingredients[].certifications`),
   humanitarian items in offers, handovers and distributions (`Item.certifications`), catalogs
   (`GET /v1/certifications?subjectHash=…`). Planners treat a `dietary` claim with
   `basis: certified` as proven only when a current certification for the required scheme exists
   for the recipe revision or for every ingredient the rule pack names; which authorities count
   is the diner's or the program's policy, never the standard's.
7. **No personal data.** A certification is about a product, a recipe or a kitchen. A person's
   religion or diet stays in the Household Context Profile and travels only as a derived
   constraint ("needs halal"), never alongside a certification.

## Alternatives considered

- Extend the free-text `certificate` field: cannot be verified, cannot expire, cannot be re-issued.
- W3C Verifiable Credentials as the only format: good interoperability, heavy for small
  authorities and for SMS-and-spreadsheet food banks; kept as an `evidence` kind and as a
  future mapping.
- Embedding certifications in the recipe: forces a new signed revision for every re-certification
  and makes a stale certificate look current.

## Migration

Additive. `safety.dietary[].certificate` stays, marked deprecated; readers prefer
`certifications[]`. No existing document changes. Profile status: experimental until two
independent authorities have issued real documents.

## Open questions

- Should `scheme` carry a controlled vocabulary file (`vocab/certifications.json`) with the
  named standards per scheme, maintained with the certification bodies?
- Should a catalog counter-sign certifications it relays (as recalls are handled in the
  Federation profile), or is the authority's signature alone enough?
- Mapping to GS1 Digital Link and to Verifiable Credentials data model 2.0.
