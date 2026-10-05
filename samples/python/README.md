# cookwala-samples (Python)

Sample clients, agents, orchestrators, gates, recovery and reporting for the
[Cookwala](https://cookwala.ai) Core 0.2 API, the open standard for cooking safely. Standard
library only, Python 3.9 or newer.

Samples, not certified software; simulated devices; the executor is always the authority.

```bash
pip install cookwala-samples
cookwala-samples demo                      # six orders on a simulated four-device kitchen, as a Markdown report
cookwala-samples demo --format junit       # or json, csv
cookwala-samples gates koshari --device demo-hob-robot-basic --human-present
cookwala-samples plan shakshuka --block eggs
cookwala-samples run lentil koshari --human-present --fault 'example-koshari#n14=overheat'
cookwala-samples serve --port 8080         # the same, as an HTTP service
cookwala-samples demo --hub http://localhost:7878   # against a real hub (python hub/cookwala_hub.py)
```

## The six roles

| Role | Module | What it shows |
|---|---|---|
| Clients | `clients` | `HubClient` (HTTP, retries reuse the Idempotency-Key) and `LocalClient` (simulated executor) share one interface |
| Agents | `agents` | `PlannerAgent` acts under a mandate, never substitutes around an allergen block, asks a person before anything in `confirmBefore`; `MonitorAgent` checks transitions and temperatures |
| Orchestrators | `orchestrators` | gates, dry run on every device, best device, start, poll, recover, log, incident |
| Gates | `gates` | version, hash, recall, mandate, allergen, untrusted text, envelope, attendance, capability; fail closed |
| Recovery | `recovery` | never retry around safety; next device; ask a person; stop; discard and report; transport retries |
| Reporting | `reporting` | JSON, Markdown, JUnit XML, CSV; anonymous `IncidentReport` |

## As a library

```python
from cookwala_samples import (BundleCatalog, LocalClient, Orchestrator, PlannerAgent, Reporter,
                              ScriptedHuman, make_mandate, Job)

kitchen = {d: LocalClient.for_device(d) for d in ('demo-hob-robot', 'demo-oven')}
person = ScriptedHuman(present=True)
planner = PlannerAgent('agent:me', make_mandate('household:h-1/person:p-1', 'agent:me'), BundleCatalog(), person)
orch = Orchestrator(kitchen, planner=planner, human=person)
report = Reporter([orch.run(Job('dinner', order={'dish': 'lentil', 'servings': 4}, human_present=True))])
print(report.to_markdown())
```

Swap `LocalClient` for `HubClient('https://your-hub/…', token=…)` to drive a real executor.

Source, the other language ports and every distribution channel:
<https://github.com/amado2k5/cookwala/tree/main/samples>. Apache-2.0; the bundled recipes are
CC BY 4.0 and the vocabularies CC0 (see each recipe's `source` and `license`).
