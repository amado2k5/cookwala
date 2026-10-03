# Cookwala Interoperability

How robots, appliances, sensors, humans, AI agents and outside services cook together
using Cookwala. The rule of thumb: **Cookwala defines the recipe, the plan and the kitchen
coordination. Everything else plugs in through existing standards** (Matter, ROS 2,
A2A, MCP, UCP/ACP, CloudEvents, MQTT) via thin adapters.

## 1. Architecture

```
                         ┌──────────────────────────────────────────┐
   Internet              │  Cookwala Index (cookwala.ai)  │  static + edge worker
                         │  recipes · vocab · policies · search ·   │  REST · GraphQL · MCP · A2A
                         │  match · reports · recalls               │
                         └───────────────────┬──────────────────────┘
                                             │ HTTPS (signed manifest, hashes), offline dumps
 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
   Home / restaurant LAN                     │
                         ┌───────────────────▼──────────────────────┐
                         │             Cookwala Hub                 │  REST · GraphQL · SSE/WS
                         │ planner · policy engine · lease manager  │  MQTT event bus
                         │ safety supervisor · CCP log · notifier   │  MCP server · A2A agent
                         └──┬──────┬───────┬───────┬───────┬────────┘
            executor API /  │      │       │       │       │  adapters
            events          │      │       │       │       │
   ┌────────────────┐ ┌─────▼──┐ ┌─▼────────────┐ ┌▼──────────────┐ ┌▼─────────────────────┐
   │ Robots         │ │Humans  │ │ Appliances   │ │ Sensors &     │ │ Services             │
   │ humanoid, arm, │ │app,    │ │ via Matter / │ │ safety:       │ │ grocery/delivery     │
   │ countertop     │ │screen, │ │ Home Connect │ │ smoke/CO/gas, │ │ (UCP/ACP), notify    │
   │ (ROS 2 / vendor│ │voice,  │ │ / SmartThings│ │ cameras,      │ │ (push/SMS), security │
   │ SDK adapters)  │ │watch   │ │ / vendor     │ │ presence, leak│ │ monitoring, AI agents│
   └────────────────┘ └────────┘ └──────────────┘ └───────────────┘ └──────────────────────┘
```

- **Index:** global, read-mostly and stateless. It never controls anything.
- **Hub:** one per kitchen, local-first. It keeps working offline from cached recipes. Any
  vendor can build one, and the reference hub is open source. A robot may embed a hub. When
  two hubs are present, one is elected `primary` (lowest priority value, then oldest).
  The other one becomes a standby.
- **Participants:** anything that publishes a capability manifest
  (`schemas/capabilities.schema.json`) and speaks the executor API or the event bus,
  directly or through an adapter.

## 2. Lifecycle of a cook

1. **Pick:** a human or agent searches the index or the hub (`match` returns what this
   kitchen can cook from its capabilities + inventory).
2. **Session:** `POST /sessions` with recipes, `serveAt` and mode
   (`guided | assisted | autonomous`).
3. **Verify:** the hub checks the manifest signature and recipe hash, plus the recipe's
   verification level against each executor's `minVerificationLevel`.
4. **Plan:** the hub assigns every process node to an actor (robot, appliance or human),
   schedules backwards from `serveAt`, and books **leases** for burners, oven cavities,
   vessels, counter zones and arms. Nodes no machine can do go to a human, or the session
   is refused if no human is available.
5. **Policy:** the active policy packs (jurisdiction + dietary + venue + household + device)
   are evaluated. Result: `allow`, `allow_with_warnings` or `deny`.
6. **Inventory:** `inventory/check`, then optionally an **OrderIntent** for missing items
   (human approval needed unless a standing budget rule covers it).
7. **Confirm:** a human acknowledges allergens, hazards and warnings
   (`POST /sessions/{id}/confirm`). This is mandatory for every mode.
8. **Run:** the hub dispatches tasks to executors (`POST /executor/tasks`), watches
   telemetry and `until` conditions, records CCPs, coordinates handoffs, and notifies
   humans when input is needed.
9. **Close:** `completed`/`aborted`, inventory consumed, optional anonymous report to the
   index.

## 3. Robot ↔ robot

- **No direct robot-to-robot commands.** Robots coordinate *through the hub*: tasks, leases
  and handoffs. That prevents two vendors' robots from fighting over the same pan.
- **Leases** (`session.schema.json#/$defs/Lease`) are exclusive holds on resources, named
  `appliance:hob-1/zone-2`, `vessel:pan-28`, `zone:counter-left`, `robot:neo-1/arm-right`.
  This follows the Open-RMF idea of brokering shared infrastructure between fleets from
  different vendors.
- **Handoffs** (`$defs/Handoff`): robot A finishes `sauce` and proposes a handoff to robot B.
  B acknowledges when it has a grip, or a lease on the vessel. Hot vessels carry
  `hazards: ["hot_vessel"]`, and the receiver must ack before A lets go.
- **Spatial safety:** robots publish `cookwala.human.presence` and
  `cookwala.safety.child_or_pet_in_zone` when they see people. Every robot respects the
  most restrictive zone state.
- **ROS 2 bridge:** an adapter maps `POST /executor/tasks` to a ROS 2 action
  (`/cookwala/execute_node`, goal = node + params + until, feedback = telemetry, result =
  complete/fail). Fleet robots already on VDA 5050 / Open-RMF keep their fleet manager,
  and the hub talks to it as one executor.

- **Teaming on demand:** a robot that needs help publishes `cookwala.team.cfp`; helpers bid
  (capability, ETA, battery after, energy); the hub awards tasks with a CP-SAT plan
  (contract-net, see [REASONING.md §5.4](REASONING.md)). Battery levels and operating modes
  shape who gets what.

## 4. Robot ↔ human

- **Every node can say who may do it** (`assignment.allowed`), and every task has a
  `fallback` chain that normally ends with a human. When a robot fails or times out, the
  task goes to `input_required` or is reassigned, and the human gets a notification with
  the step text in their language.
- **Guided mode** (no robots): the same plan drives a step-by-step UI on a phone, tablet,
  fridge screen or TV. Timers and appliance pre-heating are still automatic.
- **Confirmations:** humans can satisfy vision checks (`humanConfirm: true`) such as "are
  the whites set?" from a photo on their phone.
- **Overrides:** humans may pause, skip optional steps, or take over at any time
  (`cookwala.human.override`). They can never override a `deny` from a policy whose rule
  says `overridable: no`.
- **Presence:** `supervision: presence_required` means the hub must detect a human at
  home (presence sensor, phone geofence or a camera) before starting and while heat is on.
  If they leave, the hub pauses at the next safe point and notifies them.

## 5. Robot ↔ AI agents

- The hub exposes an **MCP server** (tools: `search_recipes`, `get_recipe`,
  `match_kitchen`, `create_session`, `get_session`, `confirm_session`, `start_session`,
  `pause_session`, `abort_session`, `get_inventory`, `update_inventory`,
  `create_order_intent`, `notify`, `emergency_stop`). Any LLM assistant can drive cooking
  through it, under the same scopes as a paired device.
- The hub also publishes an **A2A AgentCard** (`/.well-known/agent-card.json`) with
  skills `plan_meal`, `cook_recipe`, `restock_kitchen`. Hub task states map 1:1 to A2A
  states, so a calendar or meal-planning agent can delegate "dinner for 4 at 19:30" and
  track it.
- **Agents never get extra powers.** Safety-relevant actions (`confirm_session`, approving
  orders) need a human actor. An agent can prepare them but not complete them.

## 6. Appliances (smart stove, oven, microwave, hood, fridge, dishwasher)

| Appliance | Bridge | Cookwala ops it can execute | Notes |
|---|---|---|---|
| Oven / range | **Matter** Oven device type (1.3+): operational mode, temperature control, cook time; or Home Connect / SmartThings / vendor API | `cw.op.bake`, `roast`, `grill`, `heat` (preheat), `hold`, `steam` (if supported) | Remote start only if `remoteStartAllowed` and the policy allows |
| Cooktop / hob | **Matter** Cooktop + Cook Surface (per-zone temperature on induction) | `heat`, `simmer`, `boil`, `fry` (temp-controlled), `hold` | A pan on a hob still needs a robot or human for stirring/adding |
| Microwave | **Matter** Microwave Oven (time, power) | `heat` (reheat), `steam` (bag) | |
| Extractor hood | **Matter** Extractor Hood (fan speed) | `cw.op.vent` (auxiliary) | Hub auto-raises fan when `safety.environment.ventilation` is set |
| Refrigerator / freezer | **Matter** Refrigerator (state, door, temperature) + Cookwala **inventory** | `chill`, `cool` (as storage), inventory source | Matter covers the appliance state, not its contents, so camera fridges publish `inventory.schema.json` |
| Thermocooker (Thermomix-class), countertop robots (Posha-class) | Vendor adapter | Most ops on their own vessel | Adapter declares limits in its capability manifest |
| Probe thermometers, scales | Matter sensors / BLE adapters | Sensors only (`cw.sense.core_temp`, `mass`) | Make CCPs verifiable |
| Dishwasher | Matter Dishwasher | `cw.op.clean` (post-session) | Optional |

The hub keeps a **mapping table** per bridge (`bindings/matter.json` in this repo). For
example: `cw.op.bake {targetC: 180}` → OvenCavityOperationalState Start + OvenMode
"Bake" + TemperatureControl setpoint 18000. Recipes may also carry `bindings["x-oven.matter"]`
hints.

## 7. Inventory (smart fridge, pantry, receipts)

- Sources: fridge cameras, smart scales, RFID/barcode pantries, grocery receipts,
  delivered orders, or manual entry. All of them write `PATCH /inventory`, or publish
  `cookwala.inventory.changed`.
- Camera inventories are approximate, so items carry `confidence`. The planner treats
  low-confidence items as "probably there, confirm" and asks a human before relying on them.
- Planning **reserves** items for a session (`reservedBy`) and **consumes** them when
  tasks complete. Expiring items trigger `cookwala.inventory.expiring`, and `match` can
  rank recipes that use them ("cook what's about to expire").
- Dietary fields on items (`halal_certified` etc.) let policy packs check that the actual
  product used is compliant, not just the recipe.

## 8. Ordering and delivery

- The hub creates an **OrderIntent** (`order.schema.json`) for missing ingredients, or a
  `ready_meal` order when cooking isn't feasible in time.
- **Commerce adapters** translate an OrderIntent into the merchant's protocol: **UCP**
  (discovery → cart → checkout), **ACP** (checkout handshake), or a vendor API. Payment
  authorization stays with the merchant and the user's payment mandate (e.g. AP2).
  **Cookwala never carries card numbers or credentials.**
- Approval: `ask_every_time` (default) or a `standing_rule` (budget cap + allowed
  merchants) that the user set explicitly. Approvals are recorded with the human actor.
- Delivery: `delivery.handoff = robot_receive` lets a home robot receive the bag and put
  cold items away first. The hub raises `cookwala.order.delivered` so sessions waiting on
  `awaiting_ingredients` can start.
- Constraints travel with each line: `dietary: ["halal_certified"]` for meat,
  allergen exclusions, substitution rules, max unit price.

## 9. Safety and security systems

- **Inputs:** Matter Smoke/CO alarms (1.2+), gas leak sensors, water leak sensors, thermal
  cameras, robot vision, appliance over-temperature and boil-over detection, power-loss
  signals, and home-security systems (door/zone intrusion, "away" mode). All of them
  publish `cookwala.safety.*` events (retained, QoS 2), directly or through the hub's
  bridges.
- **Response matrix:** `data.action` tells every participant what to do. `pause_all`
  holds safely. `heat_off_all` cuts heat on every appliance and makes robots run
  `abort.steps`. `abort_session` ends the session. `evacuate` also alerts humans and
  emergency contacts.
- **E-stop:** `POST /safety/estop` (any paired actor, physical button, voice phrase).
  It is idempotent and always wins.
- **Unattended heat watchdog:** if heat is on, `supervision ≠ unattended`, and no human
  is present for longer than the policy allows, the hub raises `cookwala.safety.unattended_heat`.
- **Expected smoke:** recipes flag `safety.environment.smokeExpected` (searing, grilling).
  The hub adds context to alarm notifications ("searing step in progress"), but **never
  silences or delays a smoke/CO alarm**.
- **Security posture:** pairing with human approval, scoped tokens, TLS on the LAN,
  signed recipes and manifests, recall feed checked before each session, audit log of
  every command (who, what, when). This aligns with ETSI EN 303 645, the EU Cyber
  Resilience Act and the ISO 13482 revision's cybersecurity clauses.
- **Privacy:** diner profiles are minimal and local. Camera frames stay local unless
  the user opts in. Reports to the index are anonymous and country-level only.

## 10. Notifications

- Any participant can `POST /notify` (or publish `cookwala.notify.request`) with
  audience, urgency, a localized message and action buttons.
- **Notification bridges** subscribe to `cookwala/{kitchen}/notify/#` and deliver to
  phones (Web Push / APNs / FCM via the hub app), smart speakers (TTS), TVs (the fifi TV
  apps can show a cooking overlay), watches, Matter-capable lights (flash on
  `time_critical`), SMS/email for emergencies, and webhooks for third-party services.
- Escalation: `time_critical` is not acknowledged within N seconds → next channel → next
  household member → emergency contact (for `emergency` only). The urgency levels map to
  each OS's interruption levels.

## 11. Conformance profiles

A product claims one or more profiles and passes the matching conformance tests:

| Profile | Must implement |
|---|---|
| **Cookwala Reader** | Fetch + verify signature/hash, honour recalls, render text |
| **Cookwala Guided** | Reader + run a session in guided mode for humans, timers, CCP prompts |
| **Cookwala Executor** | Capability manifest, executor API, until-conditions, abort, safety events |
| **Cookwala Appliance Bridge** | Executor for appliance ops via Matter/vendor API + safety events |
| **Cookwala Hub** | Hub API, planner, leases, handoffs, policy engine, event bus, safety supervisor |
| **Cookwala Inventory Source** | inventory.schema.json updates + events |
| **Cookwala Commerce Adapter** | OrderIntent → UCP/ACP, approvals, status events, no credential handling |
| **Cookwala Notifier** | notify channel delivery + acknowledgements + escalation |
