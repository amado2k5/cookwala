<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Roadmap: now, next, later

**Status:** 2026-10-04. Elk item heeft een status: **done**, **in progress**, **planned**,
**not yet funded**. Gates komen uit `ACTION-PLAN.md` sectie 4. Niets gaat van planned
naar done zonder de genoemde evidence.

## Nu (deze release)

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

## Next (binnen ongeveer een jaar, naarmate middelen dit toelaten)

| Item | Status | Gate |
|---|---|---|
| Food scientist review van de operation envelopes | planned | reviewer agrees |
| Dietitian en food-safety officer reviews van de vier rule packs | planned | reviews filed; packs move to reviewed |
| Data-protection impact assessment van het household profile | planned | reviewer agrees |
| Een food-bank pilot (12 weeks, pre-registered, independent evaluator) | not yet funded | partner en funding (`humanitarian/CONCEPT-NOTE.md`) |
| Agent-safety benchmark resultaten voor verschillende model families | planned | runs published with method |
| `pip install cookwala` wheel en `@cookwala/sdk` op npm | planned | packaging die vocabularies en schemas bundelt |
| Registry service (`validate`, `publish`, tombstones) | planned | een worker en namespace proof |
| Eerste device maker die de Core API implementeert tegen de reference hub | planned | één maker agrees; conformance report published |
| Conversie van de eerste fifi.cooking collections | planned | founder beslist rechten per collection |
| Core 0.3 vanuit device feedback | planned | feedback van twee implementers |
| Steering committee | planned | drie independent adopters of twee implementations |

## Later

| Item | Status |
|---|---|
| Een echt apparaat dat een Cookwala recept kookt, onbewerkte video | nog niet gefinancierd; heeft een apparaatpartner nodig |
| Certification-schema met een onafhankelijke certifier | gepland; geen certifier ingeschakeld |
| Neutrale basis voor de specificatie, het handelsmerk en het keurmerk | gepland |
| Contributor-netwerk: toestemmingsregistraties van echte recepten met vermelding | gepland |
| Vraag- en aanbodsignalen gepubliceerd door programma's en coöperaties | gepland, na toetsing aan het mededingingsrecht |
| "Cook in simulation" benchmark (Isaac Lab, Gazebo of MuJoCo) | gepland |
| Digital Public Good-erkenning voor het Humanitarian Profile | gepland, na pilot evidence |
| Grensoverschrijdende hulpstromen in de wereldsimulator; clean-cooking effecten | gepland |

## Wat we niet zullen doen

Verzamel persoonlijke gegevens; publiceer getallen zonder een methode; noem een partner voordat deze instemt;
claim een certification die niet bestaat; plaats household data op een willekeurige ledger; bouw een centrale
orchestrator waar keukens van afhankelijk zijn; claim honger te beëindigen.

## Kill and pivot rules

Uit het actieplan: als twee externe reviewrondes geen apparaatmaker of een pilotpartner opleveren, vernauwt Cookwala tot het Humanitarian Profile en het receptformaat. Als een pilot een winst van minder dan 5 % laat zien, worden de resultaten gepubliceerd en het profiel opnieuw ontworpen voordat er enige schaling plaatsvindt.

