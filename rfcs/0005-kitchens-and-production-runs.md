# RFC-0005: Kitchens and production runs (fleets)

**Status:** proposed, 2026-10-04. **Kind:** new experimental profile. **Safety relevant:**
yes (mass catering food safety).

## Problem

The founder asked for the same protocol in restaurants, weddings, donation kitchens and food
factories (M46); the brief adds school-meal programs and disaster kitchens. Nothing in the
repository models a kitchen with stations and staff, a production run of many batches, or the
link between a device's Core executions and the meals a program reports. Fleet dispatch
belongs to Open-RMF or vendors; the **kitchen-level plan and record** does not exist.

## Proposal

`schemas/fleet.schema.json` with three documents:

1. **`Kitchen`**: an organization's kitchen: id, organization, type (`restaurant`,
   `community`, `school`, `disaster`, `care_home`, `central_production`, `robot`),
   stations (id, kind, heat sources, devices as capability references), capacity in meals
   per hour, hot-hold and cooling equipment, rule packs in force, staff roles (counts by
   role, never names), operating hours.
2. **`ProductionRun`**: id, kitchen, program (optional Humanitarian Program or Distribution
   id), recipes with batch counts and servings, serve window, assignments per step
   (station, `device`, `person` or `either`), critical control points to record
   (cook temperature, cooling, hot-hold), executions (device, execution id, log hash),
   outcome (meals produced, kg waste, incidents, findings), state machine
   (`planned` → `in_progress` → `completed` or `aborted`).
3. **`StationLease`**: station, holder (device or role), from, to, released. Keeps two
   robots from claiming one hob; the same idea as `session.schema.json` leases.

Examples: a disaster kitchen producing 650 meals of lentil soup and rice with hot-holding
and cooling records, linked to a Humanitarian `Distribution`; a restaurant lunch service
with a robot station and a human station.

Open-RMF mapping: a `ProductionRun` step assigned to `device` becomes an `ExecuteNode` goal
(ROS 2 binding); fleet dispatch stays outside Cookwala.

## Alternatives considered

- **Use `session.schema.json` as is.** Rejected: sessions are one meal in one kitchen; runs
  are many batches with program links and food-safety records.
- **Wait for the Mission profile.** Rejected: kitchens need a record now, with or without
  Missions.

## Migration

New profile; nothing changes elsewhere.

## Open questions

1. Should staffing counts by role be part of the record at all? They help cost per meal and
   never identify a person. Proposal: optional.
2. Lease semantics shared with sessions: unify in a later RFC.
