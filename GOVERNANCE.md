# Governance (draft)

Cookwala is an open, royalty-free standard. Today it is maintained by its founder. This
document says how decisions are made now and how that changes.

## Now (2026)

- **Editor:** @amado2k5 (fifi.cooking) merges changes, cuts releases, and operates the
  reference index and its signing keys. Decisions are made in public on GitHub with written
  reasons.
- **Maintainers:** review pull requests for schemas, vocabularies, tools and rule packs.
- **Decision log:** decisions are recorded in `docs/DECISIONS.md` and the changelog sections
  of `docs/CORE.md`.
- **Reviews:** external critiques are published in the repo. Nothing is hidden because it is
  unflattering.

## Next: a steering committee

Once there are at least three independent adopters (or two independent implementations of
Core, whichever comes first), a steering committee of 5–9 seats takes over decisions on the
standard. It approves major versions and the conformance program, and can replace the editor. Seats are held by people, not companies;
at most two seats per organization. The TSC includes:

- device makers;
- food banks or relief programs;
- a dietitian or food-safety professional;
- a privacy or security expert;
- a representative from a low- or middle-income country;
- a labour or consumer voice.

Decisions use lazy consensus. Votes are a simple majority of seats; changes to Core
normative rules need two thirds.

## Later: a neutral home

The spec, the name and the certification mark move to a neutral foundation (for example the
Joint Development Foundation or the Linux Foundation) with a patent non-assertion pledge.
The founder keeps no veto.

## How changes are made

1. **Small fixes** (typos, examples, vocabulary labels and translations): pull request, one
   maintainer approval.
2. **New vocabulary entries and vendor `x-` namespaces:** pull request, one maintainer
   approval, 7-day window.
3. **Spec changes:** an RFC in `rfcs/NNNN-title.md` via pull request, a **30-day public
   comment period**, then an editor (later steering committee) decision with written reasons.
4. **Safety-relevant changes** (operation envelopes, safety limits, hazards, critical control
   points, rule packs, abort and refusal semantics) also need review by a qualified
   food-safety or robot-safety reviewer.

## Versioning

- **Semantic versioning** per spec. Minor versions are additive only.
- **Major versions** are announced 12 months ahead.
- **The index** serves each major version (`/v1`, `/v2`) for at least 3 years.

## Neutrality

No required field may depend on one vendor. Vendor features live in `x-` namespaces until
two independent implementations exist; then they can be promoted to Core.

## Code of conduct

Contributor Covenant 2.1.

## Status labels

- **Core:** normative and versioned (`docs/CORE.md`).
- **Draft profile:** proposed for adoption.
- **Experimental:** may change or be removed.

A profile becomes stable after two independent implementations pass its conformance vectors
and it has real users.
