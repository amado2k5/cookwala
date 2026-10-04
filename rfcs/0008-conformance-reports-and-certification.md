# RFC-0008: Conformance reports and the certification path

**Status:** proposed, 2026-10-04. **Kind:** new schema outside Core; a document; tooling.
**Safety relevant:** yes (claims of safety conformance).

## Problem

A maker can run `tools/run_conformance.py` and say "we pass", but there is no record that
says which class, which vectors, which tool version, on what, when, and who checked. The
registry has a `conformance` field with no defined content. Certification needs a path from
a self-made claim to an independent mark.

## Proposal

1. **`schemas/conformance.schema.json`** with:
   - **`ConformanceReport`**: core version, conformance class (`recipe_publisher`,
     `executor`, `catalog`, `agent`, `verifier`) or profile (`humanitarian:H1`…), subject
     (vendor, model, firmware or tool and version), suites run with totals and failed vector
     ids, the hash of the vector set used, the tool version and repository commit, date,
     `status` (`self_declared`, `verified`, `certified`), verifier or certifier (an
     organization), optional signature;
   - **`ProfileVector`**: the vector format for profile suites (`kind` is any lower-case
     token), so Core's `ConformanceVector` enum stays frozen.
2. **Tooling:** `run_conformance.py --report out.json` writes a `ConformanceReport`; profile
   vectors live in `conformance/profiles/` and run with the Core vectors.
3. **The path** (`docs/CERTIFICATION.md`):
   - *self-declared*: the maker publishes a report and its hash in its capabilities document
     or registry entry;
   - *verified*: a registry operator reproduces the run against the published vectors and
     counter-signs;
   - *certified*: an independent certifier runs the suite plus hardware and safety-case
     checks and grants the mark. The mark and its rules move to the foundation with the
     trademark (`GOVERNANCE.md`).
4. **Honesty rule:** a report that fails any vector of a class may not claim that class; the
   registry shows the report, not a badge.

## Alternatives considered

- **Badges without reports.** Rejected: unverifiable.
- **Put `ConformanceReport` in `core.schema.json`.** Deferred to Core 1.0 to keep 0.2
  frozen; it lives in its own schema until then.

## Migration

Additive. Registry entries may reference report hashes.

## Open questions

1. Which certifiers to approach first: see the action plan's review program (UL Solutions
   or TÜV for a gap analysis). No certifier is named as a partner until one agrees.
2. Should verified reports expire? Proposal: yes, with each Core minor version.
