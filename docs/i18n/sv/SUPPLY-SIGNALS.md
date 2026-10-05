<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Jordbrukets surplus och försörjningssignaler

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Examples:
> `examples/supply/`. **Gate:** competition-law review before any production use
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai publishes no signals today.

## 1. Två saker bönder behöver nu

1. **Ett sätt att lista ett överskott innan det ruttnar.** En gård är en donator i Humanitarian Profile:
   en `Offer` med `Item.origin: farm` och `harvestedAt`, eller via SMS:

   FARM 120KG TOMATO A BB0411
   ```

food bank gör anspråk på det, ett kök tillagar det, distributionen räknar det. Inget nytt dokument,
   inga personuppgifter, endast organisationer.
2. **En rättvis signal om vad som kommer att behövas.** Det är den experimentella delen nedan.

## 2. Efterfråge- och utbudssignaler

| Dokument | Säger | Regler |
|---|---|---|
| `DemandSignal` | I region R, i ISO-vecka W, planerade kök och program att använda mellan L och H kg av ingrediens **klass** C | minst 20 bidragande källor; publicerad minst 7 dagar efter att veckan avslutats; klassnivå (baljväxt, bladgrönsak, fågel), aldrig en produkt eller ett varumärke; **inga priser**; region inte finare än admin1 såvida inte 100 källor eller fler |
| `SupplySignal` | I region R, i vecka W, är klass C i överskott, normal eller bristfällig tillgång, med ett skördefönster | publicerad av ett kooperativ, ett program eller en marknadsoperatör; **öppen för alla**: offentlig, gratis, identisk för varje läsare |

Referenskontrollen är `check_signal()` i `tools/cookwala_ref.py`; profilvektorerna
(`conformance/profiles/signal.json`) visar vad som accepteras och förkastas.

## 3. Varför dessa regler

Att dela prognoser mellan konkurrenter är den informationsutbyte som konkurrensmyndigheter varnar för. Aggregering, fördröjning, klassnivå, inga priser och öppen publicering håller signalen användbar för planering och oanvändbar för priskoordinering. Tröskelvärdena är startpunkter; rådgivare och en statistiker bör fastställa dem.

## 4. Vad grundarens idé blir till

Makromaskinen (RFC-0007): planerad matlagning → aggregerad efterfrågan →
jordbruk och butiker planerar behov → mindre odlat, flyttat och slängt. Stad-, land- och
världssimulatorerna visar storleken på effekten under sina antaganden (illustrativt, inte en
prognos). Dessa två dokument är det minsta ärliga steget mot det.

## 5. Later

Planteringsråd från framåtriktad efterfrågan; reservstorlek (en perfekt slimmad försörjningskedja är
skör); gränsöverskridande hjälpförsörjningsflöden; försörjningssignaler via SMS från kooperativ.

