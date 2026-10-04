# RFC-0002: Registry and Directory

**Status:** proposed, 2026-10-04. **Kind:** draft profile formalized; one additive
definition in `catalog.schema.json`; new API. **Safety relevant:** indirectly (recalls and
tombstones).

## Problem

`docs/REGISTRY.md` describes a registry modelled on the MCP Registry (proven namespaces,
pinned versions, hashes, lifecycle) and `catalog.schema.json#/$defs/RegistryEntry` exists,
but there is no API description, no conformance check for names and versions, no published
registry file, and no way to list the **organizations** that take part (device makers, food
banks, labs, certifiers) without inventing them. The website needs a registry and a
directory that are honest when nearly empty.

## Proposal

1. **Name and version rules become testable.**
   - A name is `<namespace>/<name>`; the namespace is a reverse-DNS domain
     (`org.fifi-cooking`) or a code-host account (`io.github.amado2k5`); 3–200 characters;
     lower case.
   - Versions are exact semver (`1.4.2`); ranges (`^1.4`, `1.x`, `latest`) are rejected.
   - Names are never reused; a deleted entry stays as a tombstone (`status: deleted`).
   - The reference library gains `registry_name_valid()` and `version_exact()`; profile
     vectors `registry_name` and `registry_version` cover valid and invalid cases.
2. **`DirectoryEntry`** (additive `$def` in `catalog.schema.json`): an organization, never a
   person: id (`did:web:` or `org:`), name, roles (device maker, catalog, registry, food bank,
   community kitchen, school program, relief program, farm or cooperative, grocer or
   retailer, restaurant or food service, certifier, research lab, health body, government,
   insurer, translator community, other), country, URL, claimed conformance (hashes of
   `ConformanceReport`s, RFC-0008), verification (`method`, `verifiedAt`, `by`), status,
   `addedAt`. Listing in the directory is by the organization's own request.
3. **`api/registry.openapi.yaml`:**
   - `GET /v1/registry.json` (the whole list, static-hostable);
   - `GET /v1/registry/entries?kind=&q=&status=`;
   - `GET /v1/registry/entries/{namespace}/{name}`;
   - `POST /v1/registry/validate` (same checks as publish; returns structured issues);
   - `POST /v1/registry/publish` (bearer token bound to a verified namespace);
   - `GET /v1/directory.json`, `POST /v1/directory/validate`, `POST /v1/directory/publish`.
4. **Published files on cookwala.ai:** `site/v1/registry.json` listing only what exists in
   this repository (the reference catalog, the example recipe collection, the default safety
   limits, the humanitarian rule pack), and `site/v1/directory.json` listing the operator
   only. The website shows empty states for everything else.
5. **Lifecycle:** `active` → `deprecated` → `recalled` (also in the recall feed) → `deleted`.

## Alternatives considered

- **A single global registry run by cookwala.ai.** Rejected: contradicts federation
  (RFC-0006). Anyone may run a registry; cookwala.ai runs one.
- **Listing organizations found in public sources.** Rejected: naming organizations that
  did not ask reads as endorsement.

## Migration

Additive. Existing `RegistryEntry` documents remain valid.

## Open questions

1. Namespace proof for organizations without a domain (small food banks): a code-host
   account or a registry-assigned `org:` id vouched for by a program. Proposal: allow `org:`
   ids vouched by a verified program, shown as "vouched" not "verified".
2. Rate limits and abuse handling for `validate` on a static host: served by a worker later.
