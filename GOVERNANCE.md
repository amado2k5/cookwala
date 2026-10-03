# Governance

## Roles

- **Editor** (initially fifi.cooking): merges changes, cuts releases, operates the
  reference index and its signing keys.
- **Maintainers:** review PRs for schemas, vocabularies, tools and policy packs.
- **Steering group** (formed once there are at least 3 independent adopters): device
  makers, food-safety and dietary-certification experts, and community seats. It approves
  major versions and the conformance program, and can replace the editor.

## Changes

1. Small fixes (typos, examples, vocabulary labels and translations): PR, one maintainer
   approval.
2. New vocabulary entries and vendor `x-` namespaces: PR, one maintainer, 7-day window.
3. Spec changes: an RFC in `rfcs/NNNN-title.md` via PR, a **30-day public comment period**,
   then an editor decision with written reasons.
4. Safety-relevant changes (CCPs, hazards, policy packs, abort semantics) also need review
   by a qualified food-safety or robot-safety reviewer.

## Versioning

SemVer per spec. Minor versions are additive only. Major versions are announced 12
months ahead. The index serves each major version (`/v1`, `/v2`) for at least 3 years.

## Neutrality

No required field may depend on one vendor. Vendor features live in `x-` namespaces until
two independent implementations exist; then they can be promoted to core.

## Code of conduct

Contributor Covenant 2.1.
