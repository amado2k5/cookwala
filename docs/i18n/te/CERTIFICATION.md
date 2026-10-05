<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance మరియు certification కి మార్గం

**Status:** draft, 2026-10-04 (RFC-0008). ఇంకా ఏ certifier ని నియమించలేదు; ఇది standard అందిస్తున్న మార్గం.

## 1. మూడు దశలు

| Step | Who | What it means | Shown as |
|---|---|---|---|
| **Self-declared** | తయారీదారు లేదా ప్రచురణకర్త | పబ్లిక్ టూల్‌తో పబ్లిక్ వెక్టార్లను రన్ చేసి, దాని స్వంత కీతో సంతకం చేసిన `ConformanceReport` (`schemas/conformance.schema.json`) ను ప్రచురించారు | రిపోర్ట్, సూట్లు మరియు కౌంట్‌లతో; ఎప్పుడూ బ్యాడ్జ్ కాదు |
| **Verified** | ఒక registry ఆపరేటర్ | అదే వెక్టర్ సెట్ హ్యాష్‌పై రన్‌ను పునరుత్పత్తి చేసి రిపోర్ట్‌ను కౌంటర్-సైన్ చేశారు | రిపోర్ట్ ప్లస్ వెరిఫైయర్ |
| **Certified** | ఒక స్వతంత్ర certifier (ప్రస్తుతం ఎవరూ లేరు) | ప్రచురించబడిన స్కీమ్ కింద సూట్ ప్లస్ హార్డ్‌వేర్ మరియు సేఫ్టీ-కేస్ తనిఖీలను రన్ చేసి మార్క్‌ను మంజూరు చేశారు | రిపోర్ట్, certifier, మార్క్ |

ఒక క్లాస్ యొక్క ఏ వెక్టార్‌లోనైనా విఫలమయ్యే రిపోర్ట్ ఆ క్లాస్‌ను క్లెయిమ్ చేయలేకపోవచ్చు. registry రిపోర్ట్‌లను చూపుతుంది, బ్యాడ్జీలను కాదు.

ఈరోజు ఏకైక registry ఆపరేటర్ స్పెసిఫికేషన్ మెయింటైనర్ (cookwala.ai), కాబట్టి రెండవ registry ఉన్నంత వరకు "verified" ఎటువంటి స్వతంత్రతను జోడించదు; స్థితి ఇంకా self-verification గానే చూపబడుతుంది.

## 2. ఒక రిపోర్ట్ దేనిని కలిగి ఉంటుంది

కోర్ వెర్షన్, క్లెయిమ్ చేయబడిన క్లాస్ (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) లేదా ప్రొఫైల్ క్లెయిమ్ (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), సబ్జెక్ట్ (product, vendor, version), టోటల్స్ మరియు ఫెయిల్డ్
vector ids తో రన్ చేయబడిన సూట్లు, వెక్టర్ సెట్ యొక్క hash, టూల్ మరియు commit, తేదీ, స్టేటస్ మరియు
verifier. ఉదాహరణ: `examples/conformance/report-reference.json`, దీనిని ఉత్పత్తి చేసింది

```bash
python tools/run_conformance.py --report report.json
```

## 3. తరగతులు మరియు అవి ఏమి నిరూపిస్తాయి

| Class | Vectors | certification కోసం కూడా అవసరం (vectors ద్వారా కవర్ చేయబడలేదు) |
|---|---|---|
| Recipe publisher | hash, envelope (bands లోపల ఉన్న targets), units | food-safety professional ద్వారా recipes యొక్క content review |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | పరికరం యొక్క స్వంత safety case (ISO 13482, IEC 60335, UL 3300 వర్తించే విధంగా); measured local stop latency; network లేకుండా enforced safety limits |
| Catalog | hash, signature, key revocation, recalls | key custody మరియు incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | method తో పాటు model ప్రకారం published చేయబడిన results |
| Verifier | అన్ని Core suites | ఏదీ లేదు |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; personal data audit లేదు |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name మరియు version rules, tombstones | namespace proof process |

## 4. certification దేనిని వాగ్దానం చేయలేదు

ఒక conformance report సాఫ్ట్‌వేర్ అది నడిచిన రోజున వెక్టర్స్ కోరిన విధంగా ప్రవర్తించిందని నిరూపిస్తుంది.
అది ఒక పరికరం ప్రతి వంటగదిలో సురక్షితంగా ఉంటుందని, ఒక రెసిపీ రుచి సరిగ్గా ఉంటుందని, లేదా ఎటువంటి హాని జరగదని నిరూపించదు. సున్నా హానిని వాగ్దానం చేసే ప్రమాణం నిజాయితీ లేనిది అవుతుంది; ఇది పరిమితులు స్థానికంగా అమలు చేయబడతాయని, refusals before heat జరుగుతాయని, మరియు రికార్డులను తనిఖీ చేయవచ్చని వాగ్దానం చేస్తుంది.

## 5. మార్క్ యొక్క గవర్నెన్స్

సర్టిఫికేషన్ మార్క్ మరియు దాని నియమాలు ట్రేడ్‌మార్క్‌తో పాటు న్యూట్రల్ ఫౌండేషన్‌కు మారుతాయి (`GOVERNANCE.md`). అప్పటి వరకు ఎటువంటి మార్క్ ఉండదు; కేవలం రిపోర్టులు మాత్రమే ఉంటాయి.

