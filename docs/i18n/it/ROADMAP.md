<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Roadmap: now, next, later

**Status:** 2026-10-04. Ogni elemento riporta uno stato: **done**, **in progress**, **planned**,
**not yet funded**. I gate provengono dalla sezione 4 di `ACTION-PLAN.md`. Nulla passa da planned
a done senza l'evidenza nominata.

## Ora (questo rilascio)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (entro circa un anno, secondo la disponibilità delle risorse)

| Item | Status | Gate |
|---|---|---|
| Revisione dello scienziato alimentare degli operation envelope | planned | reviewer agrees |
| Revisioni del dietista e dell'ufficiale per la sicurezza alimentare dei quattro rule pack | planned | reviews filed; packs move to reviewed |
| Valutazione dell'impatto sulla protezione dei dati del household profile | planned | reviewer agrees |
| Un pilota food-bank (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Risultati del benchmark di agent-safety per diverse famiglie di modelli | planned | runs published with method |
| wheel `pip install cookwala` e `@cookwala/sdk` su npm | planned | packaging that bundles vocabularies and schemas |
| Servizio Registry (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Primo produttore di dispositivi che implementa la Core API rispetto al reference hub | planned | one maker agrees; conformance report published |
| Conversione delle prime collezioni fifi.cooking | planned | founder decides rights per collection |
| Core 0.3 dal feedback dei dispositivi | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Item | Status |
|---|---|
| Un dispositivo reale che cucina una ricetta Cookwala, non modificata, in video | non ancora finanziato; necessita di un partner per i dispositivi |
| Schema di certification con un certifier indipendente | pianificato; nessun certifier impegnato |
| Fondazione neutrale per la specifica, il marchio e il segno | pianificato |
| Rete di contributori: registrazioni consensuali di ricette reali con credito | pianificato |
| Segnali di domanda e offerta pubblicati da programmi e cooperative | pianificato, dopo revisione della legge sulla concorrenza |
| Benchmark "Cook in simulation" (Isaac Lab, Gazebo o MuJoCo) | pianificato |
| Riconoscimento come Digital Public Good per l'Humanitarian Profile | pianificato, dopo prove pilota |
| Flussi di soccorso transregionali nel simulatore mondiale; effetti di clean-cooking | pianificato |

## Cosa non faremo

Raccogliere dati personali; pubblicare numeri senza un metodo; nominare un partner prima che accetti;
rivendicare una certification che non esiste; inserire dati household su qualsiasi ledger; costruire un
orchestratore centrale da cui le cucine dipendono; affermare di porre fine alla fame.

## Regole di kill e pivot

Dal piano d'azione: se due round di revisione esterna non riescono a produrre un produttore di dispositivi o un partner pilota, Cookwala si restringe al Humanitarian Profile e al formato della ricetta. Se un pilota mostra un guadagno inferiore al 5 %, i risultati vengono pubblicati e il profilo ridisegnato prima di qualsiasi scaling.

