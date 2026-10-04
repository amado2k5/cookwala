# RFC-0001: Household Context Profile

**Status:** proposed, 2026-10-04. **Kind:** new optional profile (no Core change).
**Safety or privacy relevant:** yes (privacy). Reviewer wanted: a data-protection
professional.

## Problem

A cooking robot that serves a family well needs to know a great deal about the home:
appliances and their quirks, who lives there and when they are home, pets, children, diets,
allergies, medications, rituals, budget, shopping habits, past incidents (founder brainstorm,
`prompts/SESSION-PROMPTS.md` M31–M41). `docs/PROTOCOL.md` describes 15 facet families in
prose and `mission.schema.json` has a generic `Facet`, but nothing machine-readable says
*which* facts exist, *how private* each one is, or *what may leave the home*. Left open,
every implementer decides alone, and the most intimate data a house has becomes a product.
The same facts are a burglary plan (who is away, where the door is) and a profiling tool
(religion, income, health).

## Proposal

1. **A facet registry**, `vocab/facets.json`, with one entry per fact type: id
   (`cw.facet.<family>.<name>`), family, labels in English and Arabic, a value hint, allowed
   sources (`declared`, `observed`, `reported`, `inferred`), a **default privacy class**
   (`public`, `household`, `sensitive`, `secret`), a **travel rule** and the constraint types
   it may derive into:
   - `never`: the fact never leaves the home, not even derived (children, absences,
     layouts, health conditions, religion, behaviour, incidents, income posture);
   - `derived`: only a derived constraint may leave ("deliver 17:00–18:00 to the door", "no
     grapefruit", "no robot movement in the hallway 15:00–15:30");
   - `consented`: may leave as a selective disclosure after explicit consent (an allergen
     block sent to a grocer for labelling).
2. **`schemas/household.schema.json`** with four documents:
   - `HouseholdContext`: local-only, `sensitive`; facets, consent grants, retention and
     erasure settings, and a **local incident memory** (never exported; the public
     `IncidentReport` in Core is a separate, anonymous document);
   - `ConsentGrant`: who (a role, never a name), what (facet families or ids), to whom (a
     recipient role), for what purpose, until when, withdrawable;
   - `DerivedConstraint`: the only household-originated object a provider or agent ever
     receives: a type from a closed list, a value, validity, the recipient role, and the facet
     **types** (never values) it came from;
   - `LocalIncident`: date, category from `vocab/incidents.json`, who was involved by kind,
     a note, a lesson, resolved or not.
3. **Rules** (normative inside the profile):
   - raw facets never leave the device; `inferred` facets are never used for safety
     decisions; no behavioural score of any person is ever produced or stored;
   - economic level is an owner-set **budget posture** and is never inferred;
   - children's data and absences are `secret` and `never` travel; health and religion are
     `sensitive` and travel only as derived constraints or by consent;
   - every facet is erasable; erasure completes within the household's `erasureWindowDays`
     (default 7, maximum 30) and is logged locally;
   - a recipient role may receive only the constraint types listed for it in the registry's
     `recipientRoles` table.
4. **A local API**, `api/household.openapi.yaml`, served by the hub on the home network
   only: read and write facets, grant and revoke consent, derive constraints for a role and
   purpose, erase.
5. **Conformance:** a `disclosure_policy` vector kind (profile vectors, outside Core): given
   facets and a recipient role, the expected derived constraint types and the withheld facet
   ids. The reference library gains `derive_constraints(facets, role)`.

## Alternatives considered

- **Keep facets inside the Mission profile only.** Rejected: the privacy rules are needed
  before Missions exist, by any planner or agent that touches household data.
- **A free-form profile with `sensitive: true`.** This is `ClientProfile` today. Rejected
  as insufficient: it cannot say which fields travel or what a grocer may see.
- **Encrypt everything to providers' keys (views).** Still planned for Missions; this RFC is
  the simpler rule that applies even without encryption: derive, don't disclose.

## Migration

Additive. `ClientProfile`, `KitchenProfile` and `RobotProfile` remain as convenient bundles;
their fields map to facet ids in the registry (`x-cookwala-facet` annotations may be added
later). Mission `Facet` objects validate against the same registry ids.

## Open questions

1. Should `recipientRoles` be extensible by `x-` roles, or closed until two implementations
   exist? Proposal: closed.
2. Should a household be able to lower a facet's default privacy class? Proposal: raise
   only, never lower, except by the owner for `household` → `public` on non-personal facts
   (for example appliance models).
3. Data-protection impact assessment: to be written with a reviewer (action plan W4).
