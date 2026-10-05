<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Ramani: now, next, later

**Status:** 2026-10-04. Kila kipengele hubeba hali: **done**, **in progress**, **planned**,
**not yet funded**. Milango inatokana na sehemu ya `ACTION-PLAN.md` 4. Hakuna kinachosogea kutoka planned
kwenda done bila ushahidi uliotajwa.

## Sasa (toleo hili)

| Kitu | Hali |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Mapishi tisa ya mfano katika Kiingereza na Kiarabu | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website katika Kiingereza na Kiarabu ikiwa na ukurasa kwa kila stakeholder, whitepaper na deck | in progress |

## Next (ndani ya takriban mwaka mmoja, rasilimali ziraporuhusu)

| Kitu | Hali | Geti |
|---|---|---|
| Mapitio ya mwanasayansi wa chakula kuhusu operation envelopes | planned | mhakiki anakubali |
| Mapitio ya mtaalamu wa lishe na afisa wa usalama wa chakula kuhusu rule packs nne | planned | mapitio yamehifadhiwa; packs zinaelekea kwenye reviewed |
| Tathmini ya athari za ulinzi wa data ya household profile | planned | mhakiki anakubali |
| Jaribio la food-bank (wiki 12, pre-registered, mhakiki huru) | not yet funded | mshirika na ufadhili (`humanitarian/CONCEPT-NOTE.md`) |
| Matokeo ya agent-safety benchmark kwa familia kadhaa za modeli | planned | runs zimechapishwa pamoja na mbinu |
| Wheel ya `pip install cookwala` na `@cookwala/sdk` kwenye npm | planned | upakiaji unaounganisha vocabularies na schemas |
| Huduma ya registry (`validate`, `publish`, tombstones) | planned | mfanyakazi na uthibitisho wa namespace |
| Mtengenezaji wa kifaa wa kwanza anayetekeleza Core API dhidi ya reference hub | planned | mtengenezaji mmoja anakubali; ripoti ya conformance imechapishwa |
| Ubadilishaji wa mkusanyiko wa kwanza wa fifi.cooking | planned | mwanzilishi anaamua haki kwa kila mkusanyiko |
| Core 0.3 kutoka kwenye mrejesho wa kifaa | planned | mrejesho wa watekelezaji wawili |
| Steering committee | planned | watumiaji watatu huru au implementations mbili |

## Later

| Kipengele | Hali |
|---|---|
| Kifaa halisi kinachopika mapishi ya Cookwala, bila kuhariri, kwenye video | bado hakijafadhiliwa; kinahitaji mshirika wa kifaa |
| Mpango wa certification na mthibitishaji huru | umepangwa; hakuna mthibitishaji aliyeajiriwa |
| Msingi usio na upendeleo kwa ajili ya maelezo, alama ya biashara na alama | umepangwa |
| Mtandao wa wachangiaji: rekodi zilizokubaliwa za mapishi halisi zenye sifa | umepangwa |
| Ishara za mahitaji na ugavi zilizochapishwa na programu na ushirika | umepangwa, baada ya mapitio ya sheria za ushindani |
| Kiwango cha "Cook in simulation" (Isaac Lab, Gazebo au MuJoCo) | umepangwa |
| Utambuzi wa Digital Public Good kwa Humanitarian Profile | umepangwa, baada ya ushahidi wa jaribio |
| Mitiririko ya misaada ya mikoa mbalimbali katika simulator ya dunia; athari za clean-cooking | umepangwa |

## Hatutafanya nini

Kusanya data binafsi; chapisha namba bila mbinu; taja mshirika kabla hajakubali;
dai certification ambayo haipo; weka data ya household kwenye ledger yoyote; jenga
orchestrator wa kati ambao jikoni hutegemea; dai kumaliza njaa.

## Sheria za kill na pivot

Kutoka kwenye mpango wa utekelezaji: ikiwa raundi mbili za mapitio ya nje zitashindwa kutoa mtengenezaji wa kifaa au washirika wa pilot, Cookwala inabana hadi kwenye Humanitarian Profile na muundo wa recipe. Ikiwa pilot itaonyesha faida ya chini ya 5 %, matokeo yanachapishwa na profile inafanyiwa usanifu upya kabla ya scaling yoyote.

