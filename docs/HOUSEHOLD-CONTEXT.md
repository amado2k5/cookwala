# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Not part of Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. Why

A robot that serves a family well needs to know a great deal: the appliances and their
quirks, who lives there and when they are home, pets, children, diets, allergies, medication
timing, rituals, budget, shopping habits, what went wrong last time. The same facts are a
burglary plan and a profiling tool. This profile gives the **planner at home** the full
picture and gives everyone else only a **constraint**.

## 2. Three ideas

1. **Facets.** One typed fact each (`cw.facet.household.health.allergies`), with who
   asserted it (declared, observed, reported, inferred), when, for how long, how confident,
   and a privacy class (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Every facet type says whether its raw value may leave
   the home: `never` (45 types: children, absences, layouts, health conditions, religion,
   behaviour, incidents, income posture), only as a `derived` constraint (81 types), or as a
   `consented` disclosure after an explicit grant (13 types, mostly device self-state for the
   maker).
3. **Derived constraints.** The only household object a grocer, planner, delivery service,
   device maker or another robot ever receives: "deliver 17:00–18:00 to the front door",
   "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per
   meal". Each names the facet **types** it came from, never their values.

## 3. Who gets what

| Recipient role | May receive |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI or software that plans the meal) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary only (counts of faults by category, no times, no household facts), and only when the household has named an insurer as a recipient; RFC-0001 lists this as the role most likely to be removed if a privacy review objects |
| program (food bank, school) | nothing |
| dataset | nothing |

## 4. Rules

- Raw facets never leave the device. There is no API that returns them to anyone outside
  the home network.
- `inferred` facets are never used for safety decisions.
- No behavioural score of any person is produced or stored. Behaviour facets exist to serve
  the household (portion sizes, when to clear) and never travel.
- Economic level is an **owner-set budget posture**, never inferred from anything.
- Children's data and absences are `secret` and never travel, not even derived, except as
  movement and safe-zone constraints that reveal no schedule.
- Every facet is erasable. Erasure completes within the household's window (default 7 days,
  at most 30) and is logged without content.
- A privacy class may be raised above the registry default, never lowered.

## 5. The local incident memory

RFC-0001 asks what the robot remembers about alarms, conflicts, give-ups and lessons. `LocalIncident` holds it: date, category from
`vocab/incidents.json`, who was involved by kind, a note and a lesson. It never leaves the
home. The public, anonymous `IncidentReport` in Core is a different document that every
maker learns from.

## 6. Conformance

Profile vectors (`conformance/profiles/disclosure_policy.json`) give facets and a recipient
role and expect the exact constraint types, disclosed ids and withheld ids with reasons. The
reference implementation is `derive_constraints()` in `tools/cookwala_ref.py`.

## 7. Relation to other documents

`ClientProfile`, `KitchenProfile` and `RobotProfile` (`profile.schema.json`) remain as
convenient bundles. Mission facets (`mission.schema.json`) use the same registry ids. The
Core `AgentMandate` stays the normative statement of what an agent may do; mandate facets
describe the household's rules locally.

## 8. Open questions

See RFC-0001: closed recipient roles; raise-only privacy; a data-protection impact
assessment with a reviewer.
