# RFC-0012: The signing header: what a Cookwala signature covers

**Status:** accepted by the editor 2026-10-05 and implemented as Core 0.2.1; public comment window open until 2026-11-04 (objections reopen it) · **Touches:** `docs/CORE.md` section 5 (normative), `schemas/common.schema.json` (`Signature.signedAt` required), `tools/cookwala_ref.py`, every signed vector and example · **Safety relevant:** yes (recalls, key revocation, event-log checkpoints) · **Reviewer:** none yet; a security reviewer should read section 2.

## Problem

Core 0.2.0 signed the bare ASCII hash string of a document. Three things followed, found by the
review of 2026-10-04:

1. `signedAt` lived in the `signature` object, which is excluded from the hash, so it was not
   signed. A holder of a leaked, later-revoked key could backdate a forgery to a time before the
   revocation and every verifier accepted it.
2. Neither `kid` nor `alg` was signed. The same public key registered under a second key id let
   a signature be relabelled; nothing bound a signature to the kind of document it signed.
3. Documents, events and checkpoints were verified by two different functions; one skipped
   revocation when `signedAt` was absent and never checked validity windows. A checkpoint with
   no witnesses, or witnessed by the sequencer itself, verified.

## Decision

1. A signature covers the RFC 8785 canonical JSON of the **signing header**
   `{"alg", "hash", "kid", "kind", "signedAt"}`: the document hash, the key id, the algorithm,
   the signing time, and the document kind when it has one (`Event` for log events,
   `Checkpoint` for checkpoints, otherwise the document's `kind`).
2. `signedAt` is required. A signature without it is `unsigned_time`, never verified.
3. One verification path (`verify_signature`) serves documents, events and checkpoints: known
   key, algorithm match and support, parseable time, validity window and revocation at
   `signedAt`, then the signature over the header.
4. A checkpoint needs at least one witness whose key id differs from the sequencer's
   (`no_independent_witness` otherwise). Two checkpoints of one log at the same `seq` with
   different heads are a detected fork (`detect_fork`).
5. New vectors: backdated `signedAt` after revocation, missing `signedAt`, key id rebound,
   unwitnessed checkpoint, self-witnessed checkpoint, fork. The existing signature, ledger,
   federation and certification vectors and the signed examples were regenerated.

## Why not a comment window first

The governance document asks for a 30-day comment window before a Core change. There is no
external implementer yet, the defect is a safety one, and leaving the 0.2.0 scheme live for 30
days would have meant publishing a known-forgeable signature. The editor accepted the change on
2026-10-05 and opened the window at the same time; an objection reopens the decision. This is
recorded here so that it is not a precedent for ordinary changes.

## Compatibility

A 0.2.0 verifier cannot verify 0.2.1 signatures and the reverse. Core is 0.2.1 from this change;
documents carry `cookwala: 0.2.x` and the signing header is the only incompatible difference.
No 0.2.0 signature is known to exist outside this repository's examples and vectors.

## Alternatives considered

- JWS (RFC 7515) detached signatures: a complete answer, heavier for devices; the header here is
  the JWS protected header's job done in the project's own canonical form. Mapping to JWS stays
  open for a later RFC.
- Signing the whole canonical document instead of the hash: equivalent in strength, larger
  messages for hardware keys; rejected.

## Open questions

- Should `kind` be required in the header even for kind-less documents (a fixed string)?
- Domain separation between Cookwala deployments (a catalog URL in the header)?
