# Decisions, Commitments, Budgets and Degraded Operation

How each party signs, commits, fails and closes its part of a Mission; who decides what
when the robot doesn't know; what can be dropped, what needs a plan B or C, and what
can never be compromised; how cost and time are kept under control; and how a robot
with low vision, low light or another impairment still gets a meal on the table.

Schema: [`mission.schema.json`](../schemas/mission.schema.json). Full worked example:
[`examples/mission/home-dinner.json`](../examples/mission/home-dinner.json). It includes a
grocer timeout with failover, an arbiter substitution, a budget threshold with owner
approval, a dog incident, low-light adaptations, and a hash-chained ledger.

## 1. Roles in a Mission

| Role | Who (typically) | Responsibilities |
|---|---|---|
| **Holder** | The robot (or hub) acting for the household | Owns the Mission; accepts or rejects contributions; enforces budgets and decision rights; executes; closes |
| **Owner** | Household adult / organization | Sets mandate, authority, budgets; approves decisions beyond limits |
| **Safety kernel** | Inside the holder (and the hub) | Verifies every plan, patch, decision and deviation; can veto anything; hard budget limits |
| **Orchestrator** (optional) | Paid or free service | Routes, retries, coordinates providers, fills the Mission, tracks delegated budgets. Never overrides the kernel |
| **Arbiter** (optional, narrow) | Specialist decision service | Decides one class within limits: substitutions, criticality, discard-vs-salvage, provider failover, re-scheduling |
| **Provider** | Planner, grocer, delivery, nutrition, device maker, monitor… | Contributes facets, advice, offers, orders, plans; commits with SLA; reports failure honestly |
| **Monitor** | Smart pot, delivery tracker, smoke detector, remote watcher | Streams signals into the Mission |
| **Approver** | Named human(s) | Approves spend, dish changes, delays and deviations beyond limits |
| **Executor** | The robot, other robots, appliances, humans | Performs tasks of the bound plan |
| **Auditor** (optional) | Insurer, certifier, program | Reads the ledger for compliance, impact and disputes |

Every role assignment is recorded in `roles`. Every action is a signed ledger entry.

## 2. Commitment lifecycle: signing, failing, closing

```
offered ──► accepted ──► committed ──► in_progress ──► fulfilled
   │           │             │              │      └──► partially_fulfilled
   └► rejected └► withdrawn  └► failed ─────┴──► compensated (saga) / superseded
```

- **Offered:** the provider adds a signed contribution (advice, quote, order, plan…), says
  how binding it is (`informational`, `advisory`, `binding_offer`, `commitment`), and
  states which requirements it satisfies.
- **Accepted / committed:** the holder accepts; for binding work the provider commits with
  an SLA (deadline, penalty, insurer) and an **idempotency key**, so retries never
  double-order.
- **Failed:** the provider reports a typed failure (`timeout`, `out_of_stock`,
  `insufficient_context`, `subscription_inactive`…), saying whether it's retryable,
  any partial result, what it would need to succeed, and suggested alternates. Silence
  counts as a timeout.
- **Compensated:** if the Mission changes after a commitment, the provider's declared
  **compensation** runs (cancel, refund, release slot). This is the saga pattern from
  distributed systems: no global locks, just undo steps.
- **Closure:** the Mission closes only when every committed contribution is fulfilled,
  compensated or released. The holder signs the final receipt, participants sign their
  part (`closure.participants`), and the ledger head can be anchored to a transparency log
  or public chain. Settlement and ratings feed provider reputation.

## 3. Criticality: what can be dropped, what needs plan B, what is untouchable

Every requirement carries a **criticality**:

| Criticality | Meaning | Examples | On failure |
|---|---|---|---|
| **critical** | Must hold exactly; never traded | Allergen-free, halal, CCP temperatures, child safety, the owner's hard NOs | Block or abort; no fallback may weaken it |
| **required** | Must be met, alternatives allowed | Serve by 19:30, the dish (or an approved alternative), groceries arriving | Walk the PACE chain; approvals as set |
| **preferred** | Nice to have; degrade gracefully | Saffron, a garnish, a specific brand | Substitute or drop within limits; record the loss |
| **optional** | Drop silently if unavailable | Toasted nuts on top, extra side | Drop; log only |

Where criticality comes from:
- the owner;
- recipe `identity` (essentials → required/critical, flexible → preferred/optional);
- policy packs (critical);
- clinicians (critical);
- the operating mode.

When the robot doesn't know how important something is, a **criticality arbiter** can
classify it. That's a narrow provider using the recipe identity, roles knowledge and
household context. The kernel then checks the result.

This mirrors aviation's **Minimum Equipment List**: what may be inoperative while the
flight still goes ahead safely.

## 4. Plan B, C, D: PACE fallbacks

Fallbacks are written as **PACE** (Primary, Alternate, Contingency, Emergency), a
military planning convention. They apply at three levels:

| Level | Primary | Alternate | Contingency | Emergency |
|---|---|---|---|---|
| **Item** | Buy saffron | Turmeric from the pantry | Skip (preferred) | — |
| **Provider** | Grocer A | Grocer B | Dish from inventory | Ready meal |
| **Step / method** | Induction simmer | Gas simmer | Pressure cooker | Ask a human |
| **Mission** | Planned dish | Alternate dish from inventory | Ready meal delivery | Safe no-cook meal |

Each fallback has a **trigger** (timeout, unavailable, failed check, budget exceeded,
quality below threshold), an **impact** (quality, extra cost, extra time) and who must
**approve** the switch (a decision class). Planners generate PACE chains when building
the plan, so the robot isn't improvising in the moment.

## 5. Who decides: decision rights

`decisionRights` lists each decision class with a decider, limits and what happens
beyond them. Classes include: substitute ingredient, drop optional or preferred, change
method, change dish, change provider, spend more, delay, reschedule, discard food,
salvage, serve degraded, accept deviation, abort, contact emergency, share more data,
budget increase, deadline extension, reduce scope, lower autonomy, request assistance.

| Decider | Use when |
|---|---|
| **Safety kernel** | Always for food-safety discards, CCPs, hazards. Not delegable |
| **Holder** (robot) | Routine choices within limits (drop optional, small delays, fallback to alternates) |
| **Arbiter** | The robot lacks knowledge for a narrow class (e.g. "is this substitution acceptable for this dish?") |
| **Quorum** | High-stakes choices with no human available: N of M independent arbiters/planners must agree (honeybee quorum) |
| **Orchestrator** | Coordination decisions it was delegated (provider failover, retries) |
| **Household human / named human** | Anything beyond limits: extra spend, dish change, big delays, quality deviations, sharing more data |

Every rule has a **timeout** and an **onTimeout** policy (`take_default`, `take_safest`,
`escalate`, `abort`), so a Mission never hangs waiting for an absent human. Every
decision is recorded with options, choice, rationale, confidence, votes and the kernel's
verification.

### With or without an orchestrator
- **No orchestrator:** the robot calls providers directly, using the PACE candidates in
  `routing.providers`, and asks arbiters for narrow decisions. Simple providers can each
  decide within their own slice: a grocer picks equivalent products under the line
  constraints, a planner picks method alternatives.
- **With an orchestrator:** it handles retries, failover, hedged requests and filling the
  Mission, and can be delegated budget control and some decision classes. The holder's
  kernel still verifies everything, and only the holder closes.

## 5a. Conflicting opinions from providers

When providers with overlapping capabilities disagree (e.g. one energy estimator says the
plan needs 34% battery and another, using fleet history, the robot's 82% battery health
and the slow hob zone, says 52%), nobody overrides anybody. Each opinion is an
**assessment**, and a **reconciler** decides under the Mission's `reconcileRules`:

1. **Detect the conflict** (spread above threshold) and its likely cause: different
   inputs, methods, assumptions, stale evidence.
2. **One rebuttal or evidence round:** ask the weaker-evidence provider to re-estimate
   with the facets it lacked, or have the robot measure.
3. **Fuse** by strategy (evidence priority, calibration weights, conservative,
   quorum…), applying the **safety bias** (p90 for feasibility).
4. **Act:** decisions such as `recharge_plan` (charge first, or dock during a passive
   step), `handoff_task` (another robot, housekeeper or owner continues while it charges),
   `delay` or `change_dish`. Each is subject to decision rights and escalation.
5. **Learn:** closure calibration updates each provider's weight for that topic.

The reconciler is set per topic: the robot by default, or a chosen central agent, a
quorum, or a human. Dissenting opinions stay recorded, never deleted.

## 6. Escalation: who to ask

The `escalation` ladder sets who's asked next, through which channel, how long to wait,
and the default if nobody answers:

1. holder;
2. arbiter for that decision class;
3. household member with authority;
4. maker support (robot faults);
5. emergency services (fire, medical).

The authority model (`mandate.authority`) decides whose answer wins: a parent outranks a
child, and a babysitter has authority over timing but not spending.

## 7. Budgets: keeping cost, time and resources under control

`budgets` makes cost and time first-class and tracked live:

| Field | Meaning |
|---|---|
| `kind` | cost, time, energy, gas, water, robot battery, retries, provider calls, hops, data disclosure, human attention, waste |
| `scope` | Whole Mission, a requirement, a step, a provider role or a provider |
| `limit` / `plan` | Hard ceiling and baseline |
| `status.spent` / `committed` / `forecastAtCompletion` / `variance` / `state` | Earned-value-style tracking: what's spent, what's promised, where it will end up |
| `thresholds[]` | At X% of limit (actual or forecast): log, notify, require approval, switch fallback, cheaper mode, reduce scope, pause, escalate, abort |
| `controller` | Who tracks it: holder by default, or delegated to an orchestrator or budget-controller provider. The holder's kernel enforces hard limits regardless |

**How it flows:**
- Every quote, order, energy reading, retry and elapsed minute writes a **meter entry**,
  which is also logged in the ledger.
- Forecasts update from the remaining plan.
- Thresholds fire automatically. In the example, cost forecast at 86% notified the
  parent, and at 90% required approval. The parent approved +$2.50.
- **Capability tokens carry per-provider caps** (a grocer can't spend more than its
  slice), so even a misbehaving provider can't blow the budget.
- **Time** is a budget too: when the forecast serve time slips past the plan, the
  `delay` decision right applies (the robot can absorb up to 15 minutes in the example).
  Beyond that it escalates to the human or switches to the time fallback (a ready meal).

**Who escalates when cost or time gets out of control?** The **budget controller**
detects it. The **decision rights** say who may approve more. The **escalation** ladder
says how to reach them. **onTimeout** says what happens if they don't answer. All of it
is visible in one place in the Mission.

## 8. Degraded operation: low vision, low light, weak grip, faults

A robot (or environment) declares **degradations** (`degradations[]`, and live in the
capability manifest's `currentLimitations`):
- vision, low light, glare, depth;
- touch and force, gripper, reach, mobility;
- temperature or smell sensing;
- compute, network, battery, calibration;
- missing tools, appliance faults, tight space, no human available.

Each has a severity, measurements and the operations or cues it affects.

Then the ecosystem **adapts** (`adaptations[]`), each with a named contributor:

| Strategy | Who can provide it | Example |
|---|---|---|
| **Fix the environment** | Robot, smart-home devices | Turn on hood and ceiling lights (Matter), close blinds against glare, clear clutter |
| **Substitute sensing** | Planner, maker extension | Probe temperature instead of colour; weight or torque instead of vision; timers with safety margin; sound cues |
| **Borrow perception** | Another robot or camera | Arm-1's camera streams a view of the pan |
| **Reassign tasks** | Planner / team plan | The other robot does precise cuts; a human drains the heavy hot pot |
| **Human or remote assist** | Household, a teleoperation service (market offer) | A human confirms "are the whites set?" from a photo; a remote operator guides a tricky step |
| **Simplify the method** | Planner, arbiter | Coarse chop instead of fine dice; blender instead of knife; one-pot method; oven instead of stovetop flipping |
| **Change equipment** | Planner | Pot with handles that fit the weakened grip; a lighter pan |
| **Widen safety margins** | Kernel / planner | Cook to firm yolks when doneness can't be seen; longer time at temperature |
| **Slow down / smaller batches** | Holder | Half-batches the weaker gripper can lift |
| **Pre-prepared ingredients** | Grocer (market) | Pre-cut onions or a cooked base delivered |
| **Change the recipe** | Planner + approval | A dish whose steps don't need the degraded ability |
| **Lower autonomy** | Kernel | CA3 → CA2: a human must be present until the degradation clears |

Every adaptation states its **deviation from the normal dish**:
- whether the dish identity is preserved;
- expected sensory changes (onions less browned, coarser texture, firmer yolks);
- quality level;
- nutrition, time and cost deltas.

Deviations within the holder's `accept_deviation` limits are accepted automatically and
logged. Bigger ones go to the household. **Safety is never relaxed to compensate.** Only
quality, speed and method flex. The outcome records what was delivered versus the
normal dish, and the household's feedback teaches future plans (e.g. "the family is fine
with coarse onions; they hate firm yolks").

## 9. Parallels this borrows from

| Mechanism | Parallel |
|---|---|
| Commitment lifecycle + compensation | Distributed **sagas** (long-running transactions with compensating actions) |
| Criticality | Aviation **Minimum Equipment List**; hospital triage categories |
| PACE fallbacks | Military **PACE** communication and contingency planning |
| Decision rights + authority | **RACI** matrices; Incident Command System delegation |
| Budgets + forecasts | Project **earned-value management**; cloud cost budgets with alert thresholds |
| Quorum decisions | Honeybee nest-site **quorum sensing** |
| Supervision and escalation | **Erlang/OTP supervision trees** ("who restarts what") |
| Shared record with holder + change requests | **IATA ONE Record** |
| Signed event ledger | **GS1 EPCIS** events; certificate transparency logs |
| Degraded operation | Aircraft degraded modes and "minimum equipment"; automotive limp-home modes |
