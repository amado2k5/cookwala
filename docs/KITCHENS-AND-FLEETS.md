# Kitchens and production runs: restaurants, community, school, disaster and robot kitchens

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Examples: `examples/fleet/`.

## 1. Why

The founder asked for the same protocol in a restaurant, a wedding, a donation drive or a
food factory (`prompts/SESSION-PROMPTS.md` M46). The brief adds school-meal programs and
disaster kitchens. Core covers one device cooking one recipe; the Humanitarian Profile covers
moving surplus and counting meals. Between them sits the **kitchen**: stations, devices,
people, many batches, a serve window, critical control points, and the link from a device's
execution log to the meals a program reports.

## 2. Documents

| Document | What it says |
|---|---|
| `Kitchen` | An organization's kitchen: type, stations (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), devices as capability references, capacity in meals per hour, hot-hold and cooling equipment, rule packs in force, staff **counts by role**, operating hours |
| `ProductionRun` | Recipes with batch counts and servings, a serve window, assignments per recipe step to a station and to a `device`, a `person` or `either`, critical control point records (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), the Core executions produced, and an outcome (meals produced and served, waste, rescued food used, failures, incidents, energy, cost, the Humanitarian `Distribution` it emitted) |
| `StationLease` | Exclusive use of a station by a device or a role for a time |

## 3. How it joins the rest

- A step assigned to a `device` is a Core `ExecuteRequest` (or an `ExecuteNode` goal through
  the ROS 2 binding); its `ExecutionLog` hash goes in `executions`.
- A run that serves a program emits a Humanitarian `Distribution`; the run's `ccps` are the
  evidence behind the distribution's safety findings.
- Rule packs from the Humanitarian Profile apply to the run's menu and items.
- Fleet dispatch (which robot goes where) belongs to Open-RMF or a vendor's fleet manager,
  not to this profile.

## 4. Worked example

`examples/fleet/kitchen-disaster.json` and `production-run-disaster.json`: a relief kitchen
with two gas kettles, hot-hold units and an ice bath produces 710 meals of lentil soup and
rice for a two-hour window, records cook and hot-hold temperatures, finds one hot-hold unit
below 60 °C and reheats that batch before serving, and emits a distribution. The example is
illustrative; no real kitchen or event is described.

## 5. What is deliberately left out

Staff names and schedules, wages, customer orders and payments, menu pricing. Staff appear
as counts by role so cost per meal can be computed without identifying anyone.

## 6. Next

Restaurant service example with a robot station; a conformance suite for the run state
machine; unification of `StationLease` with session leases (`session.schema.json`).
