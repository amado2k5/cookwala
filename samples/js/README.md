# @cookwala/samples (JavaScript)

Sample clients, agents, orchestrators, gates, recovery and reporting for the
[Cookwala](https://cookwala.ai) Core 0.2 API, the open standard for cooking safely. No
dependencies. Node.js 18 or newer.

Samples, not certified software; simulated devices; the executor is always the authority.

## Install

```bash
npm i -g @cookwala/samples
cookwala-samples demo                      # six orders on a simulated four-device kitchen, as a Markdown report
npx @cookwala/samples demo                 # the same, without installing
cookwala-samples demo --format junit       # or json, csv
cookwala-samples gates koshari --device demo-hob-robot-basic --human-present
cookwala-samples plan shakshuka --block eggs
cookwala-samples run lentil koshari --human-present --fault 'example-koshari#n14=overheat'
cookwala-samples serve --port 8080         # the same, as an HTTP service
cookwala-samples demo --hub http://localhost:7878   # against a real hub (python hub/cookwala_hub.py)
```

Exit codes: 0 ok, 1 something was refused or failed, 2 usage.

## The six roles

| Role | Module | What it shows |
|---|---|---|
| Clients | `clients` | `HubClient` (HTTP with fetch; retries reuse the Idempotency-Key) and `LocalClient` (simulated executor) share one interface |
| Agents | `agents` | `PlannerAgent` acts under a mandate, never substitutes around an allergen block, asks a person before anything in `confirmBefore`; `MonitorAgent` checks transitions and temperatures |
| Orchestrators | `orchestrator` | gates, dry run on every device, best device, start, poll, recover, log, incident |
| Gates | `gates` | version, hash, recall, mandate, allergen, untrusted text, envelope, attendance, capability; fail closed |
| Recovery | `recovery` | never retry around safety; next device; ask a person; stop; discard and report; transport retries |
| Reporting | `reporting` | JSON, Markdown, JUnit XML, CSV; anonymous `IncidentReport` |

## As a library

```js
import { BundleCatalog, LocalClient, Orchestrator, PlannerAgent, Reporter, ScriptedHuman, makeMandate, Job } from '@cookwala/samples';

const kitchen = { 'demo-hob-robot': LocalClient.forDevice('demo-hob-robot'), 'demo-oven': LocalClient.forDevice('demo-oven') };
const person = new ScriptedHuman({ present: true });
const planner = new PlannerAgent('agent:me', makeMandate('household:h-1/person:p-1', 'agent:me'), new BundleCatalog(), person);
const orch = new Orchestrator(kitchen, { planner, human: person });
const report = new Reporter([await orch.run(new Job('dinner', { order: { dish: 'lentil', servings: 4 }, humanPresent: true }))]);
console.log(report.toMarkdown());
```

Swap `LocalClient` for `new HubClient('https://your-hub/…', { token })` to drive a real executor.
The orchestrator is async, so the same code works with both clients.

Each module is also a subpath: `@cookwala/samples/jcs` (`canonical`, `docHash`),
`@cookwala/samples/simulator` (`dryRun`, `SimulatedExecutor`), `@cookwala/samples/service`
(`handle`, `handleRaw`, `serve`), and so on.

## Tests

```bash
npm test
```

The tests check the RFC 8785 vectors, the recipe hashes and every expected dry run in
`data/bundle.json`, the gates, the simulator, the agents, recovery, the demo outcomes, the reports
and the HTTP service. Inside the Cookwala repository they also run the demo against the reference
hub, if `python3` is installed.

## Differences from the Python sample

- `stopExecution` on an execution that is still `accepted` goes straight to `stopped`. Stop never fails.
- Numbers print the JavaScript way: `plan --servings 3` prints `3`, not `3.0`.

Source, the other language ports and every distribution channel:
<https://github.com/amado2k5/cookwala/tree/main/samples>. Apache-2.0; the bundled recipes are
CC BY 4.0 and the vocabularies CC0 (see each recipe's `source` and `license`).
