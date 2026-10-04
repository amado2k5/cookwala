# Federation: how Cookwala works with no centre

**Status:** draft, 2026-10-04 (RFC-0006). The founder's picture was a beehive: no central
command, yet harmony and recovery. This page says what that means in practice.

## 1. Nodes

| Node | What it serves | Who runs one |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | a recipe publisher, a food-bank network, a university, a device maker, cookwala.ai |
| **Registry** | `/v1/registry.json`: pointers to catalogs, collections, devices, packs, benchmarks | anyone; cookwala.ai runs one |
| **Hub** | the Core API for a kitchen, local safety limits, the household context | every kitchen; works offline |
| **Mirror** | republishes other nodes' signed items unchanged | anyone who wants resilience in their region |

A static folder is a valid catalog. A phone with the CSV templates is a valid humanitarian
participant at level H0.

## 2. Feeds, not commands

Nodes publish signed feeds: recalls, anonymous incidents, registry changes, key records.
Other nodes poll what they trust and may republish it. Nothing is pushed into a kitchen; a
kitchen pulls when it is online and keeps working when it is not.

## 3. Verify against the issuer, never the relay

A recall that arrives through a mirror is only as good as the **issuer's** signature. A hub
resolves the issuer's `KeyRecord` from the issuer's own discovery document or did:web and
verifies the body byte for byte. The mirror's key proves nothing about the content; a mirror
that edits a recall breaks the signature. Profile vectors in `conformance/profiles/federation.json`
show the three cases.

## 4. Trust lists

Each hub keeps a list of catalogs and registries it trusts, with their keys and a priority. A
node may suggest peers (`federation.peers`); the hub decides. cookwala.ai is one entry on
such a list, not a root.

## 5. Freshness

Registry entries carry a status and a publication time; recalls carry an issue time; household
facets carry a validity. Stale items are re-fetched or dropped. Nothing is trusted because it
is old, nothing is deleted silently: withdrawn entries stay as tombstones.

## 6. History

Event logs with witnessed checkpoints (Core section 5) make rewrites detectable without a
blockchain: a second party counter-signs the head of the log, and a later rewrite no longer
matches. Public anchoring of checkpoint heads is optional and is a founder decision
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Three nodes that interoperate

- **A food-bank network** runs a registry of its kitchens and donors, a catalog of its rule
  packs adapted to national law, and an SMS gateway. It lists itself in the cookwala.ai
  directory or not; its data never has to leave its country.
- **A device maker** runs a catalog of its capability documents and safety-limit packs,
  publishes conformance reports, and polls the recall feeds of the catalogs its customers use.
- **A university lab** runs a catalog of benchmark recipes and execution logs (with consent),
  mirrors the vocabularies, and publishes its own vectors.

None of them needs cookwala.ai to be online.

## 8. What is not built

A central orchestrator, a central identity provider, a token, a blockchain. The Mission
profile's quorum decisions and orchestrators stay optional and experimental.
