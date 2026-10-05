<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# రోడ్‌మ్యాప్: now, next, later

**Status:** 2026-10-04. ప్రతి అంశం ఒక స్థితిని కలిగి ఉంటుంది: **done**, **in progress**, **planned**,
**not yet funded**. Gates `ACTION-PLAN.md` section 4 నుండి వస్తాయి. పేర్కొన్న evidence లేకుండా planned నుండి done కి ఏదీ మారదు.

## Now (ఈ విడుదల)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| English మరియు Arabic భాషలలో తొమ్మిది ఉదాహరణ రెసిపీలు | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) ఒక review template తో | done (drafts awaiting professional review) |
| 139-type facet registry మరియు disclosure vectors తో Household Context Profile | done (draft) |
| Registry మరియు directory API, honest `registry.json` మరియు `directory.json` | done (static) |
| Kitchens మరియు production runs; supply signals | done (experimental) |
| Federation rules మరియు relay vectors | done (draft) |
| protocol on మరియు off తో నాలుగు simulators | done (illustrative) |
| ప్రతి stakeholder కోసం ఒక పేజీతో, whitepaper మరియు deck తో English మరియు Arabic భాషలలో Website | in progress |

## Next (సుమారు ఒక సంవత్సరం లోపు, వనరులు అనుమతించిన మేరకు)

| Item | Status | Gate |
|---|---|---|
| operation envelopes పై Food scientist సమీక్ష | planned | reviewer agrees |
| నాలుగు rule packs పై Dietitian మరియు food-safety officer సమీక్షలు | planned | reviews filed; packs move to reviewed |
| household profile యొక్క Data-protection impact assessment | planned | reviewer agrees |
| ఒక food-bank pilot (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| అనేక model families కోసం Agent-safety benchmark ఫలితాలు | planned | runs published with method |
| npm పై `pip install cookwala` wheel మరియు `@cookwala/sdk` | planned | vocabularies మరియు schemasలను బండిల్ చేసే packaging |
| Registry service (`validate`, `publish`, tombstones) | planned | a worker మరియు namespace proof |
| reference hub కి వ్యతిరేకంగా Core APIని అమలు చేస్తున్న మొదటి device maker | planned | ఒక maker agrees; conformance report published |
| మొదటి fifi.cooking collections యొక్క Conversion | planned | founder decides rights per collection |
| device feedback నుండి Core 0.3 | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters లేదా two implementations |

## Later

| Item | Status |
|---|---|
| ఒక నిజమైన పరికరం Cookwala రెసిపీని వండుతున్న వీడియో, ఎడిట్ చేయబడలేదు | not yet funded; needs a device partner |
| స్వతంత్ర సర్టిఫైయర్‌తో కూడిన Certification scheme | planned; no certifier engaged |
| specification, trademark మరియు mark కోసం తటస్థ పునాది | planned |
| Contributor network: క్రెడిట్‌తో నిజమైన రెసిపీల సమ్మతి పొందిన రికార్డింగ్‌లు | planned |
| ప్రోగ్రామ్‌లు మరియు సహకార సంఘాల ద్వారా ప్రచురించబడిన డిమాండ్ మరియు సప్లై సిగ్నల్స్ | planned, after competition-law review |
| "Cook in simulation" benchmark (Isaac Lab, Gazebo లేదా MuJoCo) | planned |
| Humanitarian Profile కోసం Digital Public Good గుర్తింపు | planned, after pilot evidence |
| వరల్డ్ సిమ్యులేటర్‌లో క్రాస్-రీజియన్ రిలీఫ్ ఫ్లోస్; clean-cooking ప్రభావాలు | planned |

## మేము చేయనివి

వ్యక్తిగత డేటాను సేకరించండి; పద్ధతి లేకుండా సంఖ్యలను ప్రచురించండి; అది అంగీకరించకముందే భాగస్వామిని పేర్కొనండి;
అస్తిత్వం లేని certification ని క్లెయిమ్ చేయండి; ఏదైనా లెడ్జర్‌పై household data ని ఉంచండి; కిచెన్‌లు ఆధారపడే ఒక సెంట్రల్
orchestrator ని నిర్మించండి; ఆకలిని అంతం చేస్తామని క్లెయిమ్ చేయండి.

## Kill and pivot rules

యాక్షన్ ప్లాన్ నుండి: రెండు బాహ్య సమీక్ష రౌండ్లు ఒక పరికరం తయారీదారుని లేదా ఒక pilot partnerని అందించడంలో విఫలమైతే, Cookwala యొక్క Humanitarian Profile మరియు recipe format కు పరిమితం చేయబడుతుంది. ఒక pilot 5 % కంటే తక్కువ లాభాన్ని చూపిస్తే, ఫలితాలు ప్రచురించబడతాయి మరియు ఏ scaling కంటే ముందు profile పునర్నిర్మించబడుతుంది.

