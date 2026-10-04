# Cookwala Virtual Simulation: plan

Goal: run the Cookwala Protocol end to end in a virtual house to find its **breaking
points**, gaps and needed improvements, and show it all on a playable, replayable
website (**cookwala.ai/sim**).

## 1. What gets simulated

| Part | Simulated as |
|---|---|
| **House** | Floor plan with kitchen (hob, sink, fridge, pantry, counter zones, robot arm), dining room, living room, hallway (robot dock, front door), kids' room, parents' room, backyard (garden), garage |
| **Family** | Mom (owner, authority 10), Dad (hypertension → low sodium), Sara 9 (severe peanut allergy), Adam 6, Bobby the dog; schedules, positions, requests and reactions |
| **Robot NEO-1** | Holder of the Mission: battery and health model, vision that degrades in low light, weakened left grip, safety kernel, task execution, interruptions, docking |
| **Other devices** | Counter arm Arm-1, induction hob (slow zone 2), fridge (leaky seal), smart lights (Matter), smoke detector, robot vacuum with its own schedule, dock |
| **Providers** | Planner A/B, Grocer A (flaky) / Grocer B, delivery courier, substitution arbiter, energy estimators A (physics) and B (fleet history), optional orchestrator |
| **Protocol** | Real Mission documents per `mission.schema.json`: facets, mandate, requirements with criticality and PACE, decision rights, escalation, budgets with thresholds, contributions with lifecycle, assessments and reconciliation, degradations and adaptations, SHA-256 hash-chained ledger, closure with calibration |

The engine is a deterministic discrete-event simulation: same seed + same toggles =
same run, so every run can be replayed and compared.

## 2. Stages shown

1. **Request:** Mom asks for dinner.
2. **Compose:** NEO builds the Mission from the world.
3. **Disclose and route:** scoped views go to providers.
4. **Enrich:** plan, groceries, substitutions, estimates.
5. **Reconcile:** conflicting estimates are fused.
6. **Approve:** budget and decision rights apply, with human approvals.
7. **Ready and commit:** readiness check and kernel verification.
8. **Execute:** tasks, interruptions, adaptations, handoffs.
9. **Serve.**
10. **Close:** outcome, calibration, closure signatures.

## 3. The website

- **House map:** live positions of the robot, people and dog; device states (lights,
  hob, dock, vacuum, smoke).
- **Swimlanes:** every actor and the messages between them, per frame.
- **Stage bar:** where the request is in its lifecycle.
- **Inspector tabs:** the Mission JSON at that moment (changed parts highlighted), ledger,
  budgets, decisions and assessments, findings.
- **Controls:** play/pause, step forward and back, speed, scrubber, scenario picker,
  fault toggles, seed. Replay is exact.

## 4. Breaking-point scenarios (fault toggles)

| Toggle | Tests |
|---|---|
| Grocer A times out | Retry budget, PACE failover, compensation |
| Both grocers fail | Mission-level fallback, change-dish approval, human timeout default |
| Planner A unavailable | Alternate planner, hedging |
| Single energy estimator | What happens without reconciliation (optimistic estimate → battery runs out mid-cook → handoff) |
| Low light in the evening | Degradation → adaptations (lights, probe sensing, coarse chop) |
| Dog knocks bowl | Interruption, safe-pause, re-plan, lesson |
| Robot vacuum schedule clash | Lease conflict with a device that isn't Cookwala-native |
| Mom unreachable for approvals | Decision-right timeouts and defaults |
| Child asks to turn the stove guard off | Authority model and refusal |
| Prompt injection in a provider reply | Kernel treats provider text as data, not instructions |
| Power cut during cooking | Playbook, alternative heat source, food-safety timers |
| Cost overrun | Budget thresholds, approval, cheaper mode |

## 5. How findings are captured

Whenever the engine needs something the spec doesn't define, it emits a **finding**
(gap, ambiguity or improvement) with the spec location. Findings appear on the website
and are collected in [SIM-FINDINGS.md](SIM-FINDINGS.md). A Node runner
(`sim/run.mjs`) executes every scenario and writes its final Missions to `sim/out/`. CI
validates them against the schemas, so schema breakage is caught automatically.

## 6. Build steps

1. Engine (`sim/engine/`): RNG, SHA-256, world, protocol helpers, kernel, providers,
   robot, scenarios, simulator → frames.
2. UI (`sim/index.html`, `sim/app.js`, `sim/style.css`): map, swimlanes, stages,
   inspector, controls.
3. Runner and CI validation.
4. Run all scenarios, record findings, publish at cookwala.ai/sim.

## Protocol on/off: the same evening with the robot alone

The header switch **Cookwala protocol: On | Off · robot alone** replays the same evening
with the same seed and the same faults. With the switch off, NEO works only through its
vendor's cloud ([`engine/alone.js`](../sim/engine/alone.js)). There is no Mission document,
no arbiter, no shared ledger, no leases on other devices and no budgets. The panel under
the timeline compares the two runs side by side. With the protocol off, the inspector shows
NEO's private log and the problems (A1–A13) caused by having no protocol.

| Preset | Served (on vs off) | Cost | Human interventions (count / minutes) | Notes |
|---|---|---|---|---|
| Happy evening | 19:30 vs 19:30 | $12.7 vs $15.8 | 0 / 0 vs 3 / 25 | Robot runs out of battery when off |
| Realistic evening | 19:36 vs 20:06 | $17.5 (approved) vs $20.6 (nobody approved) | 1 / 1 vs 6 / 37 | |
| Stress test | 20:05 vs 20:59 | $13.3 vs $20.6 | 1 / 1 vs 6 / 25 | |
| Battery trouble | 19:40 vs 19:46 | | 1 / 15 vs 5 / 33 | |
| Pantry empty | 19:30 vs 20:04 | | 0 / 0 vs 1 / 8 | |

Across presets, about 60 g of food is wasted with the protocol and about 140 g without it.
With the protocol, 35–44 signed ledger entries are kept. Without it there are none: the
family, the grocer and the robot maker cannot check what happened. Without the protocol,
Dad's low-salt plate never happens, because his diet lives nowhere the robot can read.
