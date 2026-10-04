# Cookwala Registry: publishing and finding recipes, devices and packs

> **Status: draft profile.** Modelled on the official MCP Registry, which lists Model
> Context Protocol servers: verified namespaces, pinned versions, integrity hashes, a
> validation endpoint and a lifecycle status.

The registry is a **list of pointers**: what exists, who published it, which exact version,
and its hash. Content stays wherever its publisher hosts it (any catalog, any domain).
Anyone can run a registry. cookwala.ai runs the first one at `/v1/registry.json`.

## 1. Names prove who published

Every entry is named `<namespace>/<name>`. The namespace must be proven:

| Namespace | Example | Proof |
|---|---|---|
| A domain, reversed | `org.fifi-cooking/egyptian-home` | DNS TXT record `cookwala-verify=<token>` on `fifi-cooking.org`, or `https://fifi-cooking.org/.well-known/cookwala-verify` returning the token |
| A code-host account | `io.github.amado2k5/recipes` | GitHub (or GitLab) OIDC token from a CI job in that account |
| A key | any | A signature by a key already bound to the namespace (rotation) |

Names are never reused. Deleted entries stay as tombstones.

## 2. Versions are exact

- **Exact versions only.** Entries pin a version (`1.4.2`); ranges such as `^1.4` or `1.x`
  are rejected.
- **Hashes.** Each version records the artifact's `sha256`, and clients verify it before use.
  Recipes also carry their own Cookwala document hash, and executors refuse a mismatch.
- **Repository id.** Entries record the code host's stable repository id when there is one,
  so a deleted-and-recreated repository with the same name is detected.

## 3. Lifecycle

`active` → `deprecated` (still usable, a replacement exists) → `recalled` (unsafe; also
published in the recall feed, and executors refuse it) → `deleted` (tombstone).

## 4. Publishing flow

```bash
# 1. validate locally (same checks the registry runs)
python tools/validate_specs.py
python tools/cookwala_ref.py hash my-collection/recipe.cookwala.json

# 2. prove the namespace once (DNS TXT or /.well-known/cookwala-verify, or CI OIDC)

# 3. publish the entry
curl -X POST https://cookwala.ai/v1/registry/publish \
  -H "Authorization: Bearer $COOKWALA_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @registry-entry.json
```

The registry runs the same validation as `POST /v1/registry/validate`: schema, recipe
semantics (operation envelopes, temperatures), hashes and namespace proof. Every issue
comes back as a structured list, so CI can show it.

> The API is described in [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). The
> service comes later; today entries are added by pull request to `site/v1/registry.json`, which lists
> only what exists in this repository. Name and version rules are tested by
> `conformance/profiles/registry.json`.

## 5. Entry

See `catalog.schema.json#/$defs/RegistryEntry`:

```json
{
  "kind": "recipe_collection",
  "name": "org.fifi-cooking/egyptian-home",
  "description": "Egyptian home recipes from fifi.cooking, robot-ready.",
  "version": "0.3.0",
  "status": "active",
  "url": "https://cookwala.ai/v1/recipes/",
  "sha256": "…",
  "coreVersion": "0.2.0",
  "verification": { "method": "dns_txt", "verifiedAt": "2026-10-04T10:00:00Z", "by": "cookwala.ai" },
  "repository": { "url": "https://github.com/amado2k5/cookwala", "source": "github", "id": "…" }
}
```

## 6. Directory of organizations

`/v1/directory.json` lists organizations that **asked** to be listed
(`catalog.schema.json#/$defs/DirectoryEntry`): device makers, catalogs, registries, food banks,
community kitchens, school and relief programs, farms and cooperatives, grocers, restaurants,
recipe publishers, certifiers, research labs, health bodies, governments, insurers, translator
communities. Each entry has roles, a country, a URL, a verification record and, where it
claims conformance, the hashes of its published `ConformanceReport`s
(`docs/CERTIFICATION.md`). Listing is not endorsement, certification or partnership. Today the
directory has one entry, the operator of this site, because nobody else has asked yet.
