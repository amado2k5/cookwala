# RFC-0006: Federation: catalogs, registries, feeds and relays

**Status:** proposed, 2026-10-04. **Kind:** additive fields on `Discovery`; a guide; a
conformance rule. **Safety relevant:** yes (recall propagation).

## Problem

The founder wants a system that works "like bees": no central command, harmony, recovery
(M49). The repository has the pieces (catalogs anyone can host, a registry spec, signed
documents, recall feeds, witnessed checkpoints) but no statement of how they form a network,
and no rule that stops a relay from forging what it relays.

## Proposal

1. **Nodes and roles.** Any host may be a *catalog* (serves `/.well-known/cookwala.json`
   and `/v1`), a *registry* (serves `/v1/registry.json`), a *hub* (local kitchen), a
   *mirror* (republishes others' signed items) or several at once. cookwala.ai is one node.
2. **Feeds, not commands.** `Discovery.feeds` lists the node's feeds: `recalls`,
   `incidents` (anonymous), `registry` (changes), `keys` (key records). Nodes poll feeds
   they trust and may republish items unchanged.
3. **Verify against the issuer, never the relay.** A relayed recall, recipe, rule pack or
   registry entry verifies only with the **issuer's** `KeyRecord` (resolved from the
   issuer's own discovery document or did:web). A relay's key proves nothing about the
   content. Profile vectors demonstrate this with the existing `signature` kind: the same
   recall verifies with the issuer key and is `unknown_key` with only the mirror's key.
4. **Provenance.** A republished item may carry `x-relay` metadata (who relayed, when); the
   signed body is untouched.
5. **Trust lists.** Hubs keep a list of catalogs and registries with keys and priorities;
   `Discovery.peers` lets a node suggest peers, which a hub may ignore.
6. **Freshness.** Registry entries carry `status` and `publishedAt`; recalls carry
   `issuedAt`; facets carry `validFor`. Stale items are re-fetched or dropped, never trusted
   by age.
7. **History.** Event logs with witnessed checkpoints (Core §5) stay the mechanism for
   tamper evidence. No blockchain is required; public anchoring remains optional.
8. **Guide:** `docs/FEDERATION.md` explains how a food-bank network, a device maker and a
   university lab each run their own node and still interoperate.

## Alternatives considered

- **A central registry and recall authority.** Rejected: single point of failure and of
  capture; contradicts neutrality.
- **Gossip protocol with push.** Rejected for now: polling signed feeds is enough for the
  volumes expected and works through firewalls and offline windows.

## Migration

Additive: `feeds` and `peers` are optional on `Discovery`.

## Open questions

1. Minimum poll interval for recall feeds on devices: proposal, hourly when online, and on
   every start.
2. Should mirrors be able to add their own "seen at" attestation as a counter-signature?
   Proposal: later, as a witness in a transparency log.
