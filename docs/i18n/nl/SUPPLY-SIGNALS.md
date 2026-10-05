<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Boerenoverschot en aanbodsignalen

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Voorbeelden:
> `examples/supply/`. **Gate:** mededingingsrechtelijke toetsing voor elk productiematig gebruik
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai publiceert vandaag geen signalen.

## 1. Twee dingen die boeren nu nodig hebben

1. **Een manier om een overschot te vermelden voordat het rot.** Een boerderij is een donor in het Humanitarian Profile:
   een `Offer` met `Item.origin: farm` en `harvestedAt`, of via SMS:

FARM 120KG TOMATO A BB0411

De food bank claimt het, een keuken kookt het, de distributie telt het. Geen nieuw document,
geen persoonlijke gegevens, alleen organisaties.
2. **Een eerlijk signaal van wat nodig zal zijn.** Dat is het experimentele deel hieronder.

## 2. Vraag- en aanbodsignalen

| Document | Zegt | Regels |
|---|---|---|
| `DemandSignal` | In regio R, in ISO-week W, hebben keukens en programma's gepland om tussen L en H kg van ingrediënt **class** C te gebruiken | ten minste 20 bijdragende bronnen; gepubliceerd ten minste 7 dagen nadat de week is afgelopen; class niveau (peulvrucht, bladgroente, gevogelte), nooit een product of merk; **geen prijzen**; regio niet fijner dan admin1 tenzij 100 bronnen of meer |
| `SupplySignal` | In regio R, in week W, is class C in overvloed, normaal of beperkt voorraad, met een oogstvenster | gepubliceerd door een coöperatie, programma of marktoperator; **open voor iedereen**: publiek, gratis, identiek voor elke lezer |

De referentiecontrole is `check_signal()` in `tools/cookwala_ref.py`; de profielvectoren
(`conformance/profiles/signal.json`) laten zien wat wordt geaccepteerd en afgewezen.

## 3. Waarom deze regels

Het delen van voorspellingen tussen concurrenten is de informatie-uitwisseling waar mededingingsautoriteiten voor waarschuwen. Aggregatie, vertraging, klasseniveau, geen prijzen en openbare publicatie houden het signaal nuttig voor planning en nutteloos voor het coördineren van prijzen. De drempelwaarden zijn startpunten; juridisch advies en een statisticus zouden deze moeten vaststellen.

## 4. Wat het idee van de oprichter wordt

De macro loop (RFC-0007): geplande bereiding → geaggregeerde vraag →
boerderijen en winkels plannen de behoefte → minder verbouwd, verplaatst en weggegooid. De stad, het land en de
wereld-simulatoren tonen de omvang van het effect onder hun aannames (illustratief, geen
voorspelling). Deze twee documenten zijn de kleinste eerlijke stap in die richting.

## 5. Later

Plantadvies op basis van voorwaartse vraag; reservegrootte (een perfect slanke supply chain is
fragiel); grensoverschrijdende hulpstromen; leveringssignalen via SMS van coöperaties.

