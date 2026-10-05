<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Roadmap: now, next, later

**Status:** 2026-10-04. Varje objekt har en status: **done**, **in progress**, **planned**,
**not yet funded**. Gates kommer från `ACTION-PLAN.md` sektion 4. Ingenting flyttas från planned
till done utan den angivna evidensen.

## Nu (denna release)

| Objekt | Status |
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

## Next (inom ungefär ett år, i takt med att resurser tillåter)

| Objekt | Status | Gate |
|---|---|---|
| Livsmedelsvetenskaplig granskning av operation envelopes | planned | reviewer agrees |
| Dietist- och livsmedelssäkerhetsgranskningar av de fyra rule packs | planned | reviews filed; packs move to reviewed |
| Konsekvensbedömning avseende dataskydd för household profile | planned | reviewer agrees |
| Ett food-bank pilotprojekt (12 veckor, förregistrerat, oberoende utvärderare) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Agent-safety benchmark-resultat för flera modellfamiljer | planned | runs published with method |
| `pip install cookwala` wheel och `@cookwala/sdk` på npm | planned | packaging that bundles vocabularies and schemas |
| Registry-tjänst (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Första tillverkare som implementerar Core API mot reference hub | planned | one maker agrees; conformance report published |
| Konvertering av de första fifi.cooking collections | planned | founder decides rights per collection |
| Core 0.3 från enhetsfeedback | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Senare

| Objekt | Status |
|---|---|
| En verklig enhet som tillagar ett Cookwala-recept, oredigerat, på video | inte ännu finansierad; behöver en enhetspartner |
| Certification-system med en oberoende certifierare | planerad; ingen certifierare anlitad |
| Neutral grund för specifikationen, varumärket och märket | planerad |
| Bidragsgivarnätverk: samtyckta inspelningar av verkliga recept med kreditering | planerad |
| Efterfråge- och utbudssignaler publicerade av program och kooperativ | planerad, efter granskning av konkurrenslagstiftning |
| "Cook in simulation" benchmark (Isaac Lab, Gazebo eller MuJoCo) | planerad |
| Digital Public Good-erkännande för Humanitarian Profile | planerad, efter pilot-evidence |
| Gränsöverskridande hjälpförsörjning i världssimulatorn; clean-cooking-effekter | planerad |

## Vad vi inte kommer att göra

Samla in personuppgifter; publicera siffror utan en metod; nämna en partner innan den samtycker;
göra gällande en certification som inte existerar; placera household data på någon ledger; bygga en central
orchestrator som kök är beroende av; påstå att man ska få slut på hunger.

## Kill and pivot rules

Från handlingsplanen: om två externa granskningsrundor misslyckas med att frambringa en tillverkare av enheter eller en pilotpartner, smalnar Cookwala av till Humanitarian Profile och receptformatet. Om en pilot visar en vinst på mindre än 5 %, publiceras resultaten och profilen designas om före någon uppskalning.

