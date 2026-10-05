<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Household Context Profile: het hele plaatje blijft thuis

> **Status: draft profile** (RFC-0001). Geen onderdeel van Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Lokale API:
> `api/household.openapi.yaml`. Voorbeeld: `examples/household/context.json`.

## 1. Waarom

Een robot die een gezin goed dient, moet veel weten: de apparaten en hun eigenaardigheden, wie er woont en wanneer zij thuis zijn, huisdieren, kinderen, diëten, allergieën, medicatietiming, rituelen, budget, winkelgewoonten, wat er de vorige keer misging. Dezelfde feiten vormen een inbraakplan en een profileringsinstrument. Dit profiel geeft de **planner at home** het volledige beeld en geeft iedereen anders slechts een **constraint**.

## 2. Drie ideeën

1. **Facets.** Elk een getypt feit (`cw.facet.household.health.allergies`), met wie het
   bevestigde (declared, observed, reported, inferred), wanneer, hoe lang, hoe zeker,
   en een privacyklasse (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in de registry.** Elk facet type geeft aan of de ruwe waarde de
   woning mag verlaten: `never` (45 types: kinderen, afwezigheid, lay-outs, gezondheidstoestanden, religie,
   gedrag, incidenten, inkomenspositie), alleen als een `derived` constraint (81 types), of als een
   `consented` disclosure na een expliciete toestemming (13 types, voornamelijk device self-state voor de
   maker).
3. **Derived constraints.** Het enige household object dat een kruidenier, planner, bezorgdienst,
   device maker of een andere robot ooit ontvangt: "lever 17:00–18:00 af bij de voordeur",
   "blokkeer pinda's", "geen robotbeweging in de gang 15:00–15:30", "budgetlimiet 18.00 USD per
   maaltijd". Elk benoemt de facet **types** waaruit het voortkwam, nooit hun waarden.

## 3. Wie krijgt wat

| Ontvangerrol | Mag ontvangen |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI of software die de maaltijd plant) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary only (counts of faults by category, no times, no household facts), en alleen wanneer de household een insurer heeft aangewezen als een recipient; RFC-0001 vermeldt dit als de rol die het meest waarschijnlijk wordt verwijderd als een privacy review bezwaar maakt |
| program (food bank, school) | niets |
| dataset | niets |

## 4. Regels

- Ruwe facets verlaten het apparaat nooit. Er is geen API die ze teruggeeft aan iemand buiten het thuisnetwerk.
- `inferred` facets worden nooit gebruikt voor veiligheidsbeslissingen.
- Er wordt geen gedragsscore van een persoon gegenereerd of opgeslagen. Gedragsfacets bestaan om het huishouden te dienen (portiegroottes, wanneer opruimen) en worden nooit verstuurd.
- Economisch niveau is een **door de eigenaar ingestelde budgethouding**, nooit afgeleid van iets.
- Gegevens over kinderen en afwezigheden zijn `secret` en worden nooit verstuurd, zelfs niet afgeleid, behalve als bewegings- en veiligheidszone constraints die geen schema onthullen.
- Elke facet is verwijderbaar. Verwijdering wordt voltooid binnen het venster van het huishouden (standaard 7 dagen, maximaal 30) en wordt gelogd zonder inhoud.
- Een privacyklasse mag boven de registry-standaard worden verhoogd, nooit verlaagd.

## 5. Het lokale incidentengeheugen

RFC-0001 vraagt wat de robot onthoudt over alarmen, conflicten, opgaven en lessen. `LocalIncident` bevat het: datum, categorie uit
`vocab/incidents.json`, wie er betrokken was per soort, een notitie en een les. Het verlaat nooit het
thuis. De publieke, anonieme `IncidentReport` in Core is een ander document waar elke
maker van leert.

## 6. Conformance

Profielvectoren (`conformance/profiles/disclosure_policy.json`) geven facets en een ontvangerrol en verwachten de exacte constraint types, gedisclocde ids en achtergehouden ids met redenen. De referentie-implementatie is `derive_constraints()` in `tools/cookwala_ref.py`.

## 7. Relatie met andere documenten

`ClientProfile`, `KitchenProfile` en `RobotProfile` (`profile.schema.json`) blijven als
handige bundels. Mission facets (`mission.schema.json`) gebruiken dezelfde registry ids. De
Core `AgentMandate` blijft de normatieve verklaring van wat een agent mag doen; mandate facets
beschrijven de regels van het huishouden lokaal.

## 8. Open vragen

Zie RFC-0001: closed recipient roles; raise-only privacy; een data-protection impact assessment met een reviewer.

