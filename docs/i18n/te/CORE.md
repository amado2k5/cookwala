<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. ఇది Cookwala యొక్క normatve భాగం. MUST, SHOULD మరియు MAY RFC 2119 ని అనుసరిస్తాయి. ఇక్కడ జాబితా చేయబడని ప్రతిదీ ఒక ఐచ్ఛిక **profile** (section 10).

ఒక పరికరం సుమారు ఒక వారంలో Core ను అమలు చేయగలగాలి. Core అనేది **ఏమి చేయాలి, అది ఎప్పుడు పూర్తవుతుంది మరియు ఏమి జరగకూడదు** అని చెబుతుంది. రోబోట్ ఎలా కదులుతుందో అది చెప్పదు.

## 1. Conformance classes

| Class | తప్పనిసరిగా అమలు చేయాలి |
|---|---|
| **Recipe publisher** | చెల్లుబాటు అయ్యే `recipe.schema.json` పత్రాలు; operation envelopes లోపల ఉష్ణోగ్రతలు; ఒక hash మరియు ఒక signature |
| **Executor** (robot, appliance or hub) | Core API (`api/core.openapi.yaml`); operation envelopes మరియు sensor ladders; స్థానిక భద్రతా పరిమితులు; ఊహించడానికి బదులుగా refusal; execution log |
| **Catalog** | సంతకం చేయబడిన రెసిపీలు, కీలక రికార్డులతో `/.well-known/cookwala.json`, recall feed, incident intake |
| **Agent** (AI లేదా ఒక వ్యక్తి కోసం పనిచేసే సాఫ్ట్‌వేర్) | `AgentMandate` కింద మాత్రమే పనిచేస్తుంది; పత్రంలోని వచనాన్ని డేటాగా పరిగణిస్తుంది; `confirmBefore` లోని దేనికైనా ముందు ప్రాధాన్యత కలిగిన వ్యక్తిని అడుగుతుంది |
| **Verifier** | Hashes, signatures, కీలక ప్రామాణికత మరియు revocation, disclosures, event chains మరియు checkpoints |

ఒక క్లాస్‌ను క్లెయిమ్ చేయడం అంటే దాని conformance వెక్టర్లను (`conformance/`, `tools/run_conformance.py` తో రన్ చేయండి) పాస్ చేయడం అని అర్థం.

## 2. ప్రధాన పత్రాలు

| పత్రం (Document) | స్కీమా (Schema) |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

అన్ని schemas **strict**: `x-<vendor>-…` extensions మినహా, తెలియని fields తిరస్కరించబడతాయి.
Readers తాము అర్థం చేసుకోలేని `x-` fieldsలను విస్మరిస్తారు. `tools/bundle_schemas.py` ఒకే ఒక bundleను ఉత్పత్తి చేస్తుంది, తద్వారా devices offline లో validate చేయగలవు. Implementations run time లో schemasలను fetch చేయకూడదు.

## 3. ఆపరేషన్స్ అంటే ఏమిటి

- **Envelopes.** `vocab/ops.json` లోని ప్రతి heat-based లేదా hazardous operation కి ఒక `envelope` ఉంటుంది.
  ఇది వీటిని నిర్దేశిస్తుంది:
  - మాధ్యమం (water, oil, air, pan surface, product…);
  - °C లో దాని temperature band (మరియు pressure cooking కోసం pressure);
  - agitation, lid, attention level మరియు ఆ step unattended గా నడవవచ్చా లేదా అనేది;
  - hazards;
  - ఒక test method.

- `cw.op.simmer` = 85–96 °C వద్ద నీటి ఆధారిత ద్రవం; `cw.op.deep_fry` = 160–190 °C వద్ద నూనె.
- **Envelopes లోపల Targets.** ఒక రెసిపీ target (`params.tempC` లేదా మీడియం యొక్క `target` on the sensor) తప్పనిసరిగా envelope లోపల ఉండాలి. దీనిని ఉల్లంఘించే రెసిపీలను validator తిరస్కరిస్తుంది.
- **Executors మీడియంను envelope లోపల ఉంచుతారు.** రెసిపీ మరింత ఇరుకైన target ను ఇస్తే, అది మొదటిసారి చేరుకున్న తర్వాత, వారు దానిని కూడా లోపలే ఉంచుతారు.
- **Altitude.** వంటగది altitude లో ప్రతి 300 m కి −1 °C చొప్పున నీరు మరియు ఆవిరి బ్యాండ్‌లు మారుతాయి.
- **Heat levels** (`very_low` … `max`) ఒకే ఉమ్మడి అర్థాన్ని కలిగి ఉంటాయి: `vocab/units.json` లో నిర్వచించబడిన °C లో ఒక pan-surface band.
- **Sensor ladder.** ప్రతి envelope ఆ దశను ధృవీకరించే మార్గాలను జాబితా చేస్తుంది, ఉత్తమమైనది మొదట: ఒక నిర్దిష్ట sensor, తర్వాత `model` (ఒక logged estimate), తర్వాత `time`, తర్వాత `human`.
  - Executor తాను సంతృప్తి పరచగలిగే మొదటి rung ను ఉపయోగిస్తుంది మరియు దానిని `verifiedBy` లో నమోదు చేస్తుంది.
  - ఒకవేళ అది **ఏ** rung ను కూడా సంతృప్తి పరచలేకపోతే, అది తప్పనిసరిగా ఆ దశను refuse చేయాలి (`missing_sensor_no_fallback`).
  - నిరంతర శ్రద్ధ అవసరమయ్యే మరియు unattended గా నడపలేని Operations (sautéing, searing, frying, reducing, caramelizing…) ఎప్పుడూ కేవలం time కి మాత్రమే fallback అవ్వవు: వాటి చివరి rung ఒక వ్యక్తి పర్యవేక్షించడం.
  - Deep frying కి fallback లేదు: oil-temperature sensor లేకపోతే deep frying ఉండదు.
  - ఒక `Condition` దీనిని `onSensorMissing` తో ఇరుకుగా చేయగలదు.
- **Refusal, guessing కాదు.** ఒక దశ యొక్క envelope, ladder, equipment లేదా safety limits ను అందుకోలేని executor, ప్రారంభించడానికి ముందే కారణంతో `refused` అని సమాధానం చెప్పాలి.

## 4. సంఖ్యలు మరియు యూనిట్లు

- **వైరుపై ఉష్ణోగ్రతలు °C లో ఉంటాయి.** డిస్‌ప్లేలు మార్చవచ్చు.
- **Tolerances.**
  - `tolerance` అనేది సాపేక్షమైనది మరియు ratio-scale యూనిట్లపై మాత్రమే అనుమతించబడుతుంది.
  - `toleranceAbs` అనేది విలువ యొక్క యూనిట్‌లో సంపూర్ణమైనది (absolute), మరియు °C పై అనుమతించబడే ఏకైక tolerance ఇది.
  - `Target.tolerance` అనేది సంపూర్ణమైనది (absolute).
- **Kitchen యూనిట్లు ఖచ్చితమైన మెట్రిక్ విలువలను కలిగి ఉంటాయి:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass కి ఒక density అవసరం** (`Quantity.densityGPerMl`, లేదా ingredient vocabulary);
  అది లేకుండా అది ఒక error, ఎప్పుడూ ఒక guess కాదు.
- **Money అనేది ఒక decimal string** (`"12.70"`) మరియు ISO 4217 కరెన్సీతో ఉంటుంది, ఎప్పుడూ float కాదు.

## 5. సమగ్రత మరియు నమ్మకం

- **Hash.** `sha256:` మరియు దాని `hash` మరియు `signature` ఫీల్డ్‌లు లేకుండా, పత్రం యొక్క RFC 8785 canonical JSON యొక్క hex digest,
  రిఫరెన్స్ canonicalizer RFC 8785 ఉదాహరణను ఖచ్చితంగా పునరుత్పత్తి చేస్తుంది.
- **Signature.** ASCII hash string పై Ed25519 (`EdDSA`). P-256 hardware keys కోసం `ES256` అనుమతించబడుతుంది. `kid` అనేది ఒక `KeyRecord` ను సూచిస్తుంది.
- **Keys.** ఒక `KeyRecord` పబ్లిక్ కీ, దాని యజమాని, ఒక validity window మరియు `revokedAt` ను ఇస్తుంది.
  `signedAt` అనేది revocation తర్వాత లేదా validity window వెలుపల ఉన్న signature చెల్లదు.
  - Catalogs వాటి కీలను `/.well-known/cookwala.json` లో ప్రచురిస్తాయి.
  - Organizations మరియు వ్యక్తులు వాటిని did:web documents లో ప్రచురిస్తారు.
  - Devices వాటిని వాటి capabilities document లో ప్రచురిస్తాయి.
  - Verifiers offline ఉపయోగం కోసం key records ను cache చేస్తారు.
- **Selective disclosure.** ఒక signed document సున్నితమైన విలువకు బదులుగా `Disclosure` digest,
  `sha256(JCS([salt, value]))` ను కలిగి ఉండవచ్చు. హోల్డర్ salt మరియు value ను వాటిని చూడటానికి అనుమతించబడిన పక్షాలకు మాత్రమే వెల్లడిస్తారు, మరియు signature ఇంకా వెరిఫై అవుతుంది.
- **Event logs** (Mission profile):
  - ప్రతి log కు ఒక sequencer `seq` మరియు `prev` ను కేటాయిస్తుంది, తద్వారా chain ఎప్పుడూ fork అవ్వదు.
  - Checkpoints లు sequencer ద్వారా sign చేయబడతాయి మరియు witnesses ద్వారా counter-sign చేయబడతాయి, ఇందులో IETF SCITT వంటి transparency service ఉండవచ్చు. ఒక witnessed checkpoint తర్వాత rewrite చేయడం గుర్తించవచ్చు.
  - `hash_only` mode లో, payloads erasable storage లో ఉంటాయి మరియు log కేవలం వాటి hashes మాత్రమే ఉంచుతుంది.

## 6. భద్రత మరియు ఏజెంట్ నియమాలు (normative)

1. **Safety అనేది లోకల్.** Executors పరికరంపై `SafetyLimits` ప్యాక్‌ను అమలు చేస్తారు.
   - ఏ రెసిపీ, ఏజెంట్, రిమోట్ మెసేజ్, ఎక్స్‌టెన్షన్ లేదా ఆపరేటింగ్ మోడ్ కూడా లిమిట్‌ను పెంచలేవు లేదా నిలిపివేయలేవు.
   - కఠినమైన లిమిట్ ఎప్పుడూ గెలుస్తుంది.
   - `profiles/core/safety-limits.default.json` అనేది ఒక డ్రాఫ్ట్ ప్రారంభ పాయింట్, దీనిని పరికరం తయారీదారులు వారి స్వంత సేఫ్టీ కేస్ నుండి మరింత కఠినతరం చేస్తారు.
2. **లోకల్ స్టాప్.** పరికరంలోని స్టాప్ కంట్రోల్ 0.5 s లోపు కదలికను ఆపుతుంది మరియు నెట్‌వర్క్ ఉన్నా లేకపోయినా 1 s లోపు వేడిని నిలిపివేస్తుంది. కాల్ చేసే వ్యక్తి ఎగ్జిక్యూటర్‌ను చేరుకోగలిగిన తర్వాత `POST …/stop` అనేది అథరైజేషన్ కోసం ఎప్పుడూ తిరస్కరించబడదు.
3. **ఈవెంట్స్ రిపోర్ట్ చేస్తాయి; అవి ఎప్పుడూ రక్షణ ఇవ్వవు.** `cookwalalatency: local_safety` ఈవెంట్స్ పరికరం ఇప్పటికే ఏమి చేసిందో రిపోర్ట్ చేస్తాయి. ఏ సేఫ్టీ ఫంక్షన్ కూడా ఒక ఈవెంట్ రావడంపై ఆధారపడకూడదు.
4. **అన్‌ట్రస్టెడ్ టెక్స్ట్.** ప్రతి ఫ్రీ-టెక్స్ట్ ఫీల్డ్ (`x-cookwala-untrusted` అని గుర్తించబడినది) అనేది డేటా మాత్రమే, సాఫ్ట్‌వేర్ మరియు AI ఏజెంట్ల కోసం అది ఎప్పుడూ ఇన్‌స్ట్రక్షన్ కాదు. టెక్స్ట్ ద్వారా ఇన్‌స్ట్రక్ట్ చేయడానికి చేసే ప్రయత్నాలు విస్మరించబడతాయి మరియు లాగ్ చేయబడతాయి (`cw.incident.untrusted_instruction`).
5. **ఏజెంట్లు ఒక mandate కింద పనిచేస్తారు.** ఏజెంట్ పంపిన రిక్వెస్ట్ ప్రిన్సిపల్ సంతకం చేసిన `AgentMandate`ను కలిగి ఉంటుంది: స్కోప్‌లు, ఖర్చు పరిమితులు, అనుమతించబడిన ప్రొవైడర్లు, గడువు మరియు కన్ఫర్మేషన్ అవసరమైన చర్యలు.
   - `irreversible` మరియు `safety_override` అనేవి mandate ఏం చెప్పినప్పటికీ ఎల్లప్పుడూ కన్ఫర్మేషన్ అవసరం.
   - Executors mandate వెలుపల ఉన్న రిక్వెస్ట్‌లను తిరస్కరిస్తారు (`mandate_scope`).
6. **Unattended ఆపరేషన్లకు ఒక వ్యక్తి అవసరం.** వాటి ఎన్వలప్ `unattended: false` అని చెప్పే ఆపరేషన్లకు ఒక బాధ్యతాయుతమైన వ్యక్తి సమక్షంలో ఉండాలి, లేదా ఒక నిమిషం లోపు అందుబాటులో ఉండాలి.
7. **అలెర్జెన్ బ్లాక్స్ తిరస్కరిస్తాయి.** రెసిపీలో లేదా ఇన్వెంటరీలో ఏవైనా బ్లాక్ చేయబడిన అలెర్జెన్ ఉంటే అది రిక్వెస్ట్‌ను తిరస్కరిస్తుంది; ఒక బ్లాక్ చుట్టూ ఎటువంటి ప్రత్యామ్నాయాలు ఉండవు.
8. **Recalls.** క్యాటలాగ్‌లు `GET /v1/recalls` వద్ద సంతకం చేసిన recalls ను ప్రచురిస్తాయి. Executors ఆన్‌లైన్‌లో ఉన్నప్పుడు పోల్ చేస్తారు మరియు recalled రివిజన్‌లను తిరస్కరిస్తారు. `block_and_stop_running` కూడా రన్ అవుతున్న ఎగ్జిక్యూషన్లను సురక్షితంగా ఆపుతుంది.
9. **Incident reports** అనామకంగా ఉంటాయి (`IncidentReport`: తేదీ మాత్రమే, పేర్లు లేదా ids ఉండవు) మరియు ప్రతి తయారీదారు ప్రతి near miss నుండి నేర్చుకోవడానికి క్యాటలాగ్‌లకు సమర్పించబడతాయి.

## 7. Execution lifecycle మరియు API

- **API:** `api/core.openapi.yaml`. దీని endpoints:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog side: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` మరియు `stopping` → మధ్యలో `stopped` కి మారుతాయి;
  - `refused` మరియు `failed` అనేవి తుది దశలు.
  - పూర్తి transition table `core.schema.json#/$defs/ExecutionState` మరియు conformance వెక్టర్లలో ఉంది.
- **Request rules:**
  - ప్రతి POST ఒక `Idempotency-Key` ని కలిగి ఉంటుంది.
  - ఉన్న execution లో మార్పులు `If-Match: <seq>` ని కలిగి ఉంటాయి; mismatch ఉంటే 412 రిటర్న్ అవుతుంది.
  - Stop కి If-Match అవసరం లేదు.
- **Events:**
  - Delivery కనీసం ఒకసారి (at least once) జరుగుతుంది.
  - CloudEvents `id` అనేది deduplication key.
  - `cookwalaseq` అనేది subject ప్రకారం events ని ఆర్డర్ చేస్తుంది మరియు status `seq` తో సరిపోలుస్తుంది.
  - Devices `cookwala.device.heartbeat` ని విడుదల చేస్తాయి, కాబట్టి ఒక hub పోయిన device ని గుర్తించి hand off చేయగలదు.

## 8. గోప్యత (Privacy)

- **Execution logs ఎటువంటి వ్యక్తిగత డేటాను కలిగి ఉండవు** (`privacy.personalData: "none"`).
- **అవి opt-in consent తో మాత్రమే పరికరం నుండి బయటకు వెళ్తాయి** (`consent.dataset`: డిఫాల్ట్‌గా `none`,
  `research_only`, లేదా `open`). Consentను ఉపసంహరించుకోవచ్చు.
- **Open datasets సమయాన్ని రోజు వరకు మారుస్తాయి.**
- **Household, health మరియు religious డేటా ఇంట్లోనే ఉంటాయి** ఒకవేళ వ్యక్తి వేరే విధంగా ఎంచుకోకపోతే తప్ప.
  అది ప్రయాణించాల్సి వచ్చినప్పుడు, అది selective disclosures గా ప్రయాణిస్తుంది.
- **The Humanitarian Profile** ఎటువంటి వ్యక్తిగత డేటాను కూడా కలిగి ఉండదు.

## 9. వెర్షనింగ్ మరియు ఎక్స్‌టెన్షన్స్

- **Core versions `0.2.x` గా ఉంటాయి.**
  - Readers తమ minor version యొక్క ఏదైనా patch ను అంగీకరిస్తారు.
  - అవి ఇతర minors ను `unsupported_version` తో తిరస్కరిస్తాయి.
  - అవి తెలియని `x-` fields ను విస్మరిస్తాయి.
- **కొత్త operations, units, sensors మరియు incident types** వెర్షన్ మార్పు లేకుండా vocabularies కి జోడించబడతాయి.
- **ఒక operation యొక్క అర్థాన్ని మార్చడం అనేది ఒక కొత్త id;** పాత దానిని `replacedBy` తో `deprecated` గా గుర్తించబడుతుంది.
- **Profiles** స్వతంత్రంగా వెర్షన్ అవుతాయి మరియు వాటికి అవసరమైన Core version ను ప్రకటిస్తాయి.

## 10. ప్రొఫైల్స్ మరియు వాటి status

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | మొదటి పరికరాల implementations కోసం లక్ష్యం |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | వ్యక్తిగత డేటా లేదు; SMS మరియు CSV ద్వారా పనిచేస్తుంది; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first household facts; కేవలం derived constraints మాత్రమే ప్రయాణిస్తాయి (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Proven namespaces, exact versions, tombstones; అభ్యర్థన మేరకు సంస్థలు (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | ప్రతి conformance claim వెనుక సంతకం చేసిన reports (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds మరియు relays; issuer కి వ్యతిరేకంగా వెరిఫై చేయండి (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurants, community, school, disaster మరియు robot kitchens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Aggregated, delayed, class-level demand మరియు supply signals; competition-law review పై ఆధారపడి ఉంటుంది (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, `profiles/mission/transitions.json` లో transitions |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | production use కి ముందు competition-law review అవసరం |
| Relief planning (`relief.schema.json`) | experimental | Operational flow ని Humanitarian Profile కి మార్చబడింది |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API అనేది reference surface |

రెండు స్వతంత్రమైన implementations దాని conformance vectors ను పాస్ చేసినప్పుడు మరియు దానికి నిజమైన వినియోగదారులు ఉన్నప్పుడు ఒక profile స్థిరంగా మారుతుంది.

## 11. Tools

| Tool | ఇది ఏమి చేస్తుంది |
|---|---|
| `tools/validate_specs.py` | schemas, examples, recipe semantics (envelopes, op parameters, no template placeholders), strictness, మరియు API references resolve అవుతున్నాయో లేదో తనిఖీ చేస్తుంది |
| `tools/run_conformance.py` | `conformance/*.json` మరియు `conformance/profiles/*.json`లను రన్ చేస్తుంది, మరియు `--report`తో ConformanceReportను రాస్తుంది: hashing (RFC 8785 exampleతో సహా), signatures (RFC 8032 keyతో సహా), revocation, disclosure, event chains మరియు checkpoints, units, envelopes, sensor ladders, state machines |
| `tools/cookwala_ref.py` | Reference library మరియు CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | vectorsలను తిరిగి సృష్టిస్తుంది (diffని సమీక్షించండి) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack checker మరియు impact summaries |
| `tools/make_profile_vectors.py` | `conformance/profiles/` లోని profile vectorsలను తిరిగి సృష్టిస్తుంది |

## 12. 0.1 నుండి మార్పులు

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Accepted unknown fields | Strict, `x-` extensions తో |
| Temperatures | °C లేదా °F, relative tolerance అనుమతించబడుతుంది | °C మాత్రమే; absolute tolerance |
| Money | Number | Decimal string |
| Operations | Prose definitions | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, lifecycle లేని keys | EdDSA లేదా ES256, validity మరియు revocation తో KeyRecords |
| Missions | ఒక mutable document, లోపల ledger | Event log + projection, single sequencer, witnessed checkpoints, hash-only mode |
| Agents | Missions లోపల మాత్రమే Mandate | common లో `AgentMandate`; agent requests కోసం అవసరం |
| Safety | Recipes లో ప్రకటించబడింది | SafetyLimits ద్వారా స్థానికంగా కూడా అమలు చేయబడుతుంది; recalls; incident reports |
| Data | No dataset model | Consented, personal-data-free ExecutionLog |
| Conformance | Schema validation మాత్రమే | 106 vectors (44 Core, 62 profile) మరియు ఒక reference implementation |

0.1 document ని migrate చేయడానికి: °F ని °C కి మార్చండి; ఉష్ణోగ్రతల (temperatures) పై ఉన్న relative tolerances ని `toleranceAbs` తో మార్చండి; డబ్బు మొత్తాలను (money amounts) decimal strings గా మార్చండి; తెలియని ఫీల్డ్స్ (unknown fields) ని తొలగించండి లేదా `x-` ఫీల్డ్స్ గా పేరు మార్చండి.

