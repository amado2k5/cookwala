# Conformance and the path to certification

**Status:** draft, 2026-10-04 (RFC-0008). No certifier has been engaged yet; this is the path
the standard offers.

## 1. Three steps

| Step | Who | What it means | Shown as |
|---|---|---|---|
| **Self-declared** | The maker or publisher | Ran the public vectors with the public tool and published a `ConformanceReport` (`schemas/conformance.schema.json`), signed with its own key | the report, with the suites and counts; never a badge |
| **Verified** | A registry operator | Reproduced the run against the same vector set hash and counter-signed the report | the report plus the verifier |
| **Certified** | An independent certifier (none exists today) | Ran the suite plus hardware and safety-case checks under a published scheme and granted the mark | the report, the certifier, the mark |

A report that fails any vector of a class may not claim that class. The registry shows
reports, not badges.

Today the only registry operator is the specification maintainer (cookwala.ai), so "verified" adds
no independence until a second registry exists; the status is still shown as self-verification.

## 2. What a report contains

Core version, the class claimed (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) or a profile claim (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), the subject (product, vendor, version), the suites run with totals and failed
vector ids, the hash of the vector set, the tool and commit, the date, the status and the
verifier, and a signature: a report without one does not validate and the tool will not write one.
The vector set is identified by `conformance/VECTORS-HASH.txt`, written when the vectors are
generated and checked on every run; a report whose `vectorsHash` differs was not run against the
published vectors. Example: `examples/conformance/report-reference.json`, produced by

```bash
python tools/run_conformance.py --report report.json --key <seed hex> --kid did:web:you.example#k1
python tools/run_conformance.py --verify-report report.json --keys your-keys.json
```

The example is signed with the public RFC 8032 test key (`conformance/keys/report-test-keys.json`)
so that it validates; a signature by that key is never a claim by anyone. A real report is signed
with the publisher's own key, published as a `KeyRecord` where its other keys live.

## 3. Classes and what they prove

| Class | Vectors | Also needed for certification (not covered by vectors) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review of recipes by a food-safety professional |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | the device's own safety case (ISO 13482, IEC 60335, UL 3300 as applicable); local stop latency measured; safety limits enforced without network |
| Catalog | hash, signature, key revocation, recalls | key custody and incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | results published per model with method |
| Verifier | all Core suites | none |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; no personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof process |

## 4. What certification cannot promise

A conformance report proves that software behaved as the vectors require on the day it ran.
It does not prove that a device is safe in every kitchen, that a recipe tastes right, or that
no harm can happen. A standard that promised zero harm would be dishonest; this one promises
that limits are enforced locally, that refusals happen before heat, and that records can be
checked.

## 5. Governance of the mark

The certification mark and its rules move to the neutral foundation with the trademark
(`GOVERNANCE.md`). Until then no mark exists; only reports do.
