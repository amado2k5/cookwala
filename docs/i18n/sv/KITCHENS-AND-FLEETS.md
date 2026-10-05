<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# Kök och produktionskörningar: restauranger, community, skola, katastrof- och robotkök

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Exempel: `examples/fleet/`.

## 1. Varför

Grundaren bad om samma protokoll i en restaurang, ett bröllop, en insamlingskampanj eller en
livsmedelsfabrik (RFC-0005). Briefen lägger till skolmatsprogram och
katastrofkök. Core täcker en enhet som tillagar ett recept; Humanitarian Profile täcker
förflyttning av surplus och räkning av måltider. Mellan dem finns **köket**: stationer, enheter,
människor, många batcher, ett serveringsfönster, kritiska kontrollpunkter, och länken från en enhets
execution log till de måltider som ett program rapporterar.

## 2. Dokument

| Dokument | Vad det säger |
|---|---|
| `Kitchen` | En organisations kök: typ, stationer (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), enheter som förmåge-referenser, kapacitet i måltider per timme, hot-hold och kylutrustning, rule packs som är i kraft, personal **counts by role**, öppettider |
| `ProductionRun` | Recept med batch counts och portioner, ett serve window, tilldelningar per receptsteg till en station och till en `device`, en `person` eller `either`, critical control point-poster (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), de Core executions som producerats, och ett utfall (måltider producerade och serverade, waste, rescued food used, failures, incidents, energy, cost, den Humanitarian `Distribution` den emitterade) |
| `StationLease` | Exklusiv användning av en station av en `device` eller en roll under en tid |

## 3. Hur det ansluter till resten

- Ett steg som tilldelas en `device` är en Core `ExecuteRequest` (eller ett `ExecuteNode` mål genom
  ROS 2-bindningen); dess `ExecutionLog` hash hamnar i `executions`.
- En run som tjänar ett program emitterar en Humanitarian `Distribution`; run's `ccps` är
  bevisen bakom distributionens säkerhetsfynd.
- Rule packs från Humanitarian Profile gäller för run's meny och artiklar.
- Fleet dispatch (vilken robot som går var) tillhör Open-RMF eller en leverantörs fleet manager,
  inte denna profil.

## 4. Genomgångsexempel

`examples/fleet/kitchen-disaster.json` och `production-run-disaster.json`: ett hjälpkök
med två gaspannor, varmhållningsenheter och ett isbad producerar 710 måltider av linssoppa och
ris under ett tvåtimmarsfönster, registrerar tillagning- och varmhållningstemperaturer, finner en varmhållningsenhet
under 60 °C och värmer upp det partiet igen före servering, och skickar ut en distribution. Exemplet är
illustrativt; inget verkligt kök eller någon verklig händelse beskrivs.

## 5. Vad som medvetet lämnats utanför

Personalnamn och scheman, löner, kundorder och betalningar, menyprissättning. Personal visas
som antal per roll så att kostnad per måltid kan beräknas utan att identifiera någon.

## 6. Next

Exempel på restaurangservice med en robotstation; en conformance-svit för run state machine; unifiering av `StationLease` med session leases (`session.schema.json`).

