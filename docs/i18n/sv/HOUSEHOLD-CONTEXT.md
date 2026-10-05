<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: hela bilden stannar hemma

> **Status: draft profile** (RFC-0001). Ingår inte i Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet typer).
> Recipient rules: `profiles/household/recipient-roles.json`. Lokal API:
> `api/household.openapi.yaml`. Exempel: `examples/household/context.json`.

## 1. Varför

En robot som tjänar en familj väl behöver veta mycket: apparaterna och deras egenheter, vem som bor där och när de är hemma, husdjur, barn, dieter, allergier, medicineringstider, ritualer, budget, shoppingvanor, vad som gick fel förra gången. Samma fakta utgör en inbrottsplan och ett profileringverktyg. Denna profil ger **planeraren i hemmet** hela bilden och ger alla andra endast en **constraint**.

## 2. Tre idéer

1. **Facets.** Ett typat faktum vardera (`cw.facet.household.health.allergies`), med vem
   som hävdade det (declared, observed, reported, inferred), när, hur länge, hur säker,
   och en integritetsklass (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Varje facet type anger om dess råvärde får lämna
   hemmet: `never` (45 typer: barn, frånvaro, layout, hälsotillstånd, religion,
   beteende, incidenter, inkomstställning), endast som en `derived` constraint (81 typer), eller som
   en `consented` disclosure efter ett explicit medgivande (13 typer, främst enhets-självstatus för
   tillverkaren).
3. **Derived constraints.** Det enda household object som en livsmedelshandlare, planerare, leveranstjänst,
   enhetstillverkare eller en annan robot någonsin får: "leverera 17:00–18:00 till ytterdörren",
   "blockera jordnötter", "ingen robotrörelse i hallen 15:00–15:30", "budgettak 18.00 USD per
   måltid". Varje enskild namnger de facet **types** som den kom ifrån, aldrig deras värden.

## 3. Vem får vad

| Mottagarroll | Kan erhålla |
|---|---|
| livsmedelshandlare | leveransfönster, åtkomstpunkt, allergenblock, budgettak, märkning, förpackning |
| leverans | leveransfönster, åtkomstpunkt, förpackning |
| planerare (AI eller programvara som planerar måltiden) | allergenblock, dietregel, undvik ingrediens, serveringsfönster, budgettak, värmekällor, utrustning, texturnivå, portionsantal, närvaro krävs, försiktighetsnivå, robotkörtid, serveringsform, kök, krydda, tysta timmar, no-movement zones, husdjurssäker förvaring, barnsäkra zoner |
| tillverkare av enhet | robotkörtid, sammanfattning av enhetsfel; enhetens egna tillstånds-facets genom samtycke |
| annan robot | no-movement zones, tysta timmar, barnsäkra zoner, husdjurssäker förvaring, utrustning |
| försäkringsbolag | endast sammanfattning av enhetsfel (antal fel per kategori, inga tider, inga hushållsfakta), och endast när hushållet har namngivit ett försäkringsbolag som mottagare; RFC-0001 listar detta som den roll som mest sannolikt kommer att tas bort om en integritetsgranskning invänder |
| program (food bank, skola) | ingenting |
| dataset | ingenting |

## 4. Regler

- Råa facets lämnar aldrig enheten. Det finns inget API som returnerar dem till någon utanför hemmetätverket.
- `inferred` facets används aldrig för säkerhetsbeslut.
- Ingen beteendescore för någon person produceras eller lagras. Beteendefacets existerar för att tjäna hushållet (portionsstorlekar, när man ska plocka undan) och förflyttas aldrig.
- Ekonomisk nivå är en **owner-set budget posture**, aldrig härledd från något.
- Barns data och frånvaro är `secret` och förflyttas aldrig, inte ens härledda, förutom som rörelse- och safe-zone constraints som inte avslöjar något schema.
- Varje facet är raderbart. Radering slutförs inom hushållets fönster (standard 7 dagar, högst 30) och loggas utan innehåll.
- En privacy class kan höjas över registry default, aldrig sänkas.

## 5. Det lokala incidentminnet

RFC-0001 frågar vad roboten kommer ihåg om larm, konflikter, ge-upp och lärdomar. `LocalIncident` håller det: datum, kategori från
`vocab/incidents.json`, vem som var involverad efter typ, en anteckning och en lärdom. Det lämnar aldrig
hemmet. Den offentliga, anonyma `IncidentReport` i Core är ett annat dokument som varje
maker lär sig av.

## 6. Conformance

Profilvektorer (`conformance/profiles/disclosure_policy.json`) ger facets och en mottagarroll och förväntar sig de exakta constraint-typerna, disclosed ids och withheld ids med anledningar. Referensimplementeringen är `derive_constraints()` i `tools/cookwala_ref.py`.

## 7. Relation till andra dokument

`ClientProfile`, `KitchenProfile` och `RobotProfile` (`profile.schema.json`) förblir som
bekväma paket. Mission facets (`mission.schema.json`) använder samma registry ids.
Core `AgentMandate` förblir det normativa uttalandet om vad en agent får göra; mandate facets
beskriver hushållets regler lokalt.

## 8. Öppna frågor

Se RFC-0001: closed recipient roles; raise-only privacy; en data-protection impact assessment med en reviewer.

