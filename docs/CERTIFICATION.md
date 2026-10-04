# Conformance and the path to certification

**Status:** draft, 2026-10-04 (RFC-0008). No certifier has been engaged yet; this is the path
the standard offers.

## 1. Three steps

| Step | Who | What it means | Shown as |
|---|---|---|---|
| **Self-declared** | The maker or publisher | Ran the public vectors with the public tool and published a `ConformanceReport` (`schemas/conformance.schema.json`), signed with its own key | the report, with the suites and counts; never a badge |
| **Verified** | A registry operator | Reproduced the run against the same vector set hash and counter-signed the report | the report plus the verifier |
| **Certified** | An independent certifier | Ran the suite plus hardware and safety-case checks under a published scheme and granted the mark | the report, the certifier, the mark |

A report that fails any vector of a class may not claim that class. The registry shows
reports, not badges.

## 2. What a report contains

Core version, the class claimed (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) or a profile claim (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), the subject (product, vendor, version), the suites run with totals and failed
vector ids, the hash of the vector set, the tool and commit, the date, the status and the
verifier. Example: `examples/conformance/report-reference.json`, produced by

```bash
python tools/run_conformance.py --report report.json
```

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
