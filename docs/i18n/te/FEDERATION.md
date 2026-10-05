<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federation: కేంద్రం లేకుండా Cookwala ఎలా పనిచేస్తుంది

**Status:** draft, 2026-10-04 (RFC-0006). వ్యవస్థాపకుని చిత్రం ఒక తేనెపట్టు వంటిది: ఎటువంటి కేంద్ర కమాండ్ లేదు, అయినప్పటికీ సామరస్యం మరియు రికవరీ ఉన్నాయి. ఆ విషయం ఆచరణలో ఏమిటో ఈ పేజీ చెబుతుంది.

## 1. నోడ్స్ (Nodes)

| Node | ఇది దేనికి సేవ చేస్తుంది | ఎవరు నడుపుతారు |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | ఒక recipe publisher, ఒక food-bank network, ఒక university, ఒక device maker, cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs, collections, devices, packs, benchmarks లకు పాయింటర్లు | ఎవరైనా; cookwala.ai ఒకదాన్ని నడుపుతుంది |
| **Hub** | ఒక kitchen కోసం Core API, local safety limits, household context | ప్రతి kitchen; offline లో పనిచేస్తుంది |
| **Mirror** | ఇతర nodes యొక్క signed items లను మార్చకుండా తిరిగి ప్రచురిస్తుంది | తమ region లో resilience కావాలనుకునే ఎవరైనా |

ఒక static folder అనేది ఒక valid catalog. CSV templates ఉన్న ఫోన్ అనేది level H0 వద్ద ఒక valid humanitarian participant.

## 2. ఫీడ్స్, కమాండ్స్ కాదు

నోడ్స్ సంతకం చేయబడిన ఫీడ్‌లను ప్రచురిస్తాయి: recalls, 익명의 సంఘటనలు, registry మార్పులు, కీలక రికార్డులు.
ఇతర నోడ్స్ అవి నమ్మే వాటిని పోల్ చేస్తాయి మరియు వాటిని తిరిగి ప్రచురించవచ్చు. వంటగదిలోకి (kitchen) ఏదీ పుష్ చేయబడదు; ఒక kitchen ఆన్‌లైన్‌లో ఉన్నప్పుడు పుల్ (pull) చేస్తుంది మరియు ఆన్‌లైన్‌లో లేనప్పుడు కూడా పని చేస్తూనే ఉంటుంది.

## 3. ఇష్యూయర్ (issuer) తో సరిచూడండి, రిలే (relay) తో కాదు

ఒక అద్దం (mirror) ద్వారా వచ్చే recall అనేది **issuer's** సంతకం ఎంత బాగుంటే అంత బాగుంటుంది. ఒక hub అనేది issuer యొక్క స్వంత discovery document లేదా did:web నుండి issuer యొక్క `KeyRecord`ను పరిష్కరిస్తుంది మరియు bodyని byte by byte ధృవీకరిస్తుంది. అద్దం యొక్క కీ కంటెంట్ గురించి దేనినీ నిరూపించదు; ఒక recallను సవరించే అద్దం సంతకాన్ని విచ్ఛిన్నం చేస్తుంది. `conformance/profiles/federation.json` లోని Profile vectors ఆ మూడు సందర్భాలను చూపుతాయి.

## 4. Trust lists

ప్రతి hub తాను నమ్మే catalogలు మరియు registries యొక్క జాబితాను, వాటి keys మరియు ఒక priority తో ఉంచుకుంటుంది. ఒక node తోటివారిని (`federation.peers`) సూచించవచ్చు; hub నిర్ణయిస్తుంది. cookwala.ai అటువంటి జాబితాలో ఒక entry మాత్రమే, root కాదు.

## 5. తాజాదనం

Registry entries ఒక status మరియు ఒక publication time కలిగి ఉంటాయి; recalls ఒక issue time కలిగి ఉంటాయి; household facets ఒక validity కలిగి ఉంటాయి. Stale items తిరిగి re-fetch చేయబడతాయి లేదా drop చేయబడతాయి. పాతది కాబట్టి దేనినీ నమ్మలేము, దేనినీ నిశ్శబ్దంగా delete చేయలేము: withdrawn entries tombstones గానే ఉంటాయి.

## 6. చరిత్ర

సాక్ష్యమిచ్చిన checkpoints (Core section 5) కలిగిన Event logs, blockchain లేకుండానే rewrites ని గుర్తించగలిగేలా చేస్తాయి: ఒక second party log యొక్క head కి counter-sign చేస్తుంది, మరియు ఒక later rewrite ఇకపై సరిపోలదు. Checkpoint heads యొక్క Public anchoring అనేది ఐచ్ఛికం మరియు ఇది ఒక founder decision (`docs/research/BACKSTORY.md` section 4.7).

## 7. పరస్పరం పనిచేసే మూడు నోడ్లు

- **ఒక food bank నెట్‌వర్క్** తన కిచెన్‌లు మరియు దాతల యొక్క registryని, జాతీయ చట్టానికి అనుగుణంగా రూపొందించబడిన తన rule packల యొక్క catalogను, మరియు ఒక SMS gatewayని నిర్వహిస్తుంది. ఇది తనను తాను cookwala.ai directoryలో జాబితా చేస్తుంది లేదా చేయదు; దాని డేటా ఎప్పుడూ దాని దేశాన్ని దాటవలసి లేదు.
- **ఒక device maker** తన capability documents మరియు safety-limit packs యొక్క catalogను నిర్వహిస్తుంది, conformance నివేదికలను ప్రచురిస్తుంది, మరియు తన కస్టమర్లు ఉపయోగించే catalogల యొక్క recall ఫీడ్‌లను పోల్ చేస్తుంది.
- **ఒక university lab** benchmark రెసిపీలు మరియు execution logల (సమ్మతితో) యొక్క catalogను నిర్వహిస్తుంది, vocabulariesని mirror చేస్తుంది, మరియు తన స్వంత vectorsలను ప్రచురిస్తుంది.

వీరికి ఎవరికీ cookwala.ai ఆన్‌లైన్‌లో ఉండాల్సిన అవసరం లేదు.

## 8. ఏమిటి నిర్మించబడలేదు

ఒక సెంట్రల్ ఆర్కెస్ట్రేటర్, ఒక సెంట్రల్ ఐడెంటిటీ ప్రొవైడర్, ఒక టోకెన్, ఒక బ్లాక్‌చైన్. మిషన్ ప్రొఫైల్ యొక్క quorum నిర్ణయాలు మరియు ఆర్కెస్ట్రేటర్లు ఆప్షనల్ మరియు ఎక్స్‌పెరిమెంటల్ గానే ఉంటాయి.

