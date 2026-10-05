<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# Cucine e cicli di produzione: ristoranti, comunità, scuole, emergenze e cucine robotiche

> **Stato: profilo sperimentale** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Esempi: `examples/fleet/`.

## 1. Perché

Il fondatore ha chiesto lo stesso protocollo in un ristorante, un matrimonio, una raccolta di donazioni o una fabbrica di alimenti (RFC-0005). Il brief aggiunge programmi di pasti scolastici e cucine per emergenze. Il Core copre un dispositivo che cucina una ricetta; l'Humanitarian Profile copre lo spostamento del surplus e il conteggio dei pasti. Tra i due si trova la **kitchen**: stazioni, dispositivi, persone, molti lotti, una finestra di servizio, punti di controllo critici e il collegamento tra l'execution log di un dispositivo e i pasti che un programma riporta.

## 2. Documenti

| Document | Cosa dice |
|---|---|
| `Kitchen` | La cucina di un'organizzazione: tipo, stazioni (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), dispositivi come riferimenti di capacità, capacità in pasti per ora, attrezzature per hot-hold e cooling, rule packs in vigore, **conteggi del personale per ruolo**, orari di funzionamento |
| `ProductionRun` | Ricette con conteggi dei lotti e porzioni, una finestra di servizio, assegnazioni per ogni passaggio della ricetta a una stazione e a un `device`, a una `person` o a entrambi, record dei punti di controllo critici (temperatura al cuore della cottura, hot-hold, cooling a due stadi, riscaldamento, conservazione refrigerata, segregazione allergeni), le esecuzioni Core prodotte, e un esito (pasti prodotti e serviti, scarti, cibo recuperato utilizzato, fallimenti, incidenti, energia, costo, la `Distribution` umanitaria emessa) |
| `StationLease` | Uso esclusivo di una stazione da parte di un device o di un ruolo per un determinato tempo |

## 3. Come si unisce al resto

- Un passo assegnato a un `device` è un Core `ExecuteRequest` (o un obiettivo `ExecuteNode` attraverso
  il binding ROS 2); il suo hash `ExecutionLog` va in `executions`.
- Un run che serve un programma emette un Humanitarian `Distribution`; i `ccps` del run sono le
  prove alla base dei risultati di sicurezza della distribuzione.
- I rule pack del Humanitarian Profile si applicano al menu e agli elementi del run.
- Il dispatch della flotta (quale robot va dove) appartiene a Open-RMF o al fleet manager di un fornitore,
  non a questo profilo.

## 4. Esempio svolto

`examples/fleet/kitchen-disaster.json` e `production-run-disaster.json`: una cucina di soccorso
con due caldaie a gas, unità di mantenimento in caldo e un bagno di ghiaccio produce 710 pasti di zuppa di lenticchie e
riso per una finestra di due ore, registra le temperature di cottura e di mantenimento in caldo, trova un'unità di mantenimento in caldo
sotto i 60 °C e riscalda quel lotto prima del servizio, ed emette una distribuzione. L'esempio è
illustrativo; non viene descritta alcuna cucina o evento reale.

## 5. Cosa viene deliberatamente escluso

Nomi e turni del personale, salari, ordini e pagamenti dei clienti, prezzi del menu. Il personale appare come conteggi per ruolo, in modo che il costo per pasto possa essere calcolato senza identificare nessuno.

## 6. Next

Esempio di servizio ristorante con una stazione robotica; una suite di conformance per la macchina a stati di run; unificazione di `StationLease` con i session leases (`session.schema.json`).

