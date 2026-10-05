<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Keukens en productieruns: restaurants, community, school, rampen en robotkeukens

> **Status: experimenteel profiel** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Voorbeelden: `examples/fleet/`.

## 1. Waarom

De oprichter vroeg om hetzelfde protocol in een restaurant, een bruiloft, een inzamelingsactie of een voedselfabriek (RFC-0005). De briefing voegt schoolmaaltijdprogramma's en noodkeukens toe. De kern beslaat het koken van één recept met één apparaat; het Humanitarian Profile beslaat het verplaatsen van surplus en het tellen van maaltijden. Daartussenin bevindt zich de **kitchen**: stations, apparaten, mensen, veel batches, een serveerperiode, kritieke controlepunten, en de link van het execution log van een apparaat naar de maaltijden die een programma rapporteert.

## 2. Documenten

| Document | Wat het zegt |
|---|---|
| `Kitchen` | De keuken van een organisatie: type, stations (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), apparaten als capability references, capaciteit in maaltijden per uur, hot-hold en cooling apparatuur, rule packs die van kracht zijn, personeels**aantallen per rol**, openingstijden |
| `ProductionRun` | Recepten met batch counts en porties, een serve window, toewijzingen per receptstap aan een station en aan een `device`, een `person` of `either`, critical control point records (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), de Core executies die zijn geproduceerd, en een uitkomst (geproduceerde en geserveerde maaltijden, waste, rescued food gebruikt, failures, incidents, energie, kosten, de Humanitarian `Distribution` die het heeft uitgezonden) |
| `StationLease` | Exclusief gebruik van een station door een device of een rol voor een bepaalde tijd |

## 3. Hoe het zich bij de rest voegt

- Een stap toegewezen aan een `device` is een Core `ExecuteRequest` (of een `ExecuteNode` doel via
  de ROS 2 binding); de `ExecutionLog` hash gaat in `executions`.
- Een run die een programma dient, geeft een Humanitarian `Distribution` af; de `ccps` van de run zijn de
  evidence achter de veiligheidsbevindingen van de distributie.
- Rule packs van het Humanitarian Profile zijn van toepassing op het menu en de items van de run.
- Fleet dispatch (welke robot gaat waarheen) behoort tot Open-RMF of de fleet manager van een leverancier,
  niet tot dit profiel.

## 4. Uitgewerkt voorbeeld

`examples/fleet/kitchen-disaster.json` en `production-run-disaster.json`: een noodkeuken
met twee gasketels, hot-hold units en een ijsbad produceert 710 maaltijden linzensoep en
rijst voor een venster van twee uur, registreert kook- en hot-hold temperaturen, vindt één hot-hold unit
onder 60 °C en warmt die batch opnieuw op voor het serveren, en geeft een distributie uit. Het voorbeeld is
illustratief; er wordt geen echte keuken of gebeurtenis beschreven.

## 5. Wat opzettelijk wordt weggelaten

Namen en schema's van personeel, lonen, klantbestellingen en betalingen, menuprijzen. Personeel verschijnt
als aantallen per rol, zodat de kosten per maaltijd kunnen worden berekend zonder iemand te identificeren.

## 6. Next

Voorbeeld van restaurantbediening met een robotstation; een conformance suite voor de run state machine; unificatie van `StationLease` met sessieleases (`session.schema.json`).

