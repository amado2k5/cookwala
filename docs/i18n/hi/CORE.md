<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. यह Cookwala का मानक भाग है। MUST, SHOULD और MAY RFC 2119 का पालन करते हैं। यहाँ सूचीबद्ध नहीं की गई हर चीज़ एक वैकल्पिक **profile** (section 10) है।

एक डिवाइस को लगभग एक सप्ताह में Core को लागू करने में सक्षम होना चाहिए। Core बताता है कि **क्या बनाना है, यह कब पूरा होता है और क्या कभी नहीं होना चाहिए**। यह यह नहीं बताता कि एक रोबोट कैसे चलता है।

## 1. Conformance classes

| Class | लागू करना चाहिए |
|---|---|
| **Recipe publisher** | वैध `recipe.schema.json` दस्तावेज़; operation envelopes के भीतर तापमान; एक hash और एक signature |
| **Executor** (robot, appliance or hub) | Core API (`api/core.openapi.yaml`); operation envelopes और sensor ladders; स्थानीय सुरक्षा सीमाएँ; अनुमान लगाने के बजाय refusal; execution log |
| **Catalog** | हस्ताक्षरित (Signed) रेसिपी, मुख्य रिकॉर्ड के साथ `/.well-known/cookwala.json`, recall feed, incident intake |
| **Agent** (AI या सॉफ्टवेयर जो किसी व्यक्ति के लिए कार्य करता है) | केवल `AgentMandate` के तहत कार्य करता है; दस्तावेज़ टेक्स्ट को डेटा के रूप में मानता है; `confirmBefore` में किसी भी चीज़ से पहले प्रिंसिपल से पूछता है |
| **Verifier** | Hashes, signatures, कुंजी वैधता और revocation, खुलासे (disclosures), event chains और checkpoints |

एक क्लास का दावा करने का अर्थ है उसके conformance vectors (`conformance/`, `tools/run_conformance.py` के साथ चलाएं) को पास करना।

## 2. मुख्य दस्तावेज़ (Core documents)

| दस्तावेज़ | स्कीमा |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

सभी schemas **strict** हैं: `x-<vendor>-…` extensions को छोड़कर, अज्ञात fields को अस्वीकार कर दिया जाता है।
Readers उन `x-` fields को अनदेखा कर देते हैं जिन्हें वे नहीं समझते हैं। `tools/bundle_schemas.py` एक एकल bundle बनाता है ताकि devices offline validate कर सकें। Implementations को run time पर schemas fetch नहीं करने चाहिए।

## 3. ऑपरेशन्स का क्या अर्थ है

- **Envelopes.** `vocab/ops.json` में प्रत्येक heat-based या hazardous operation का एक `envelope` होता है।
  यह निर्दिष्ट करता है:
  - माध्यम (water, oil, air, pan surface, product…);
  - °C में इसका temperature band (और pressure, pressure cooking के लिए);
  - agitation, lid, attention level और क्या step बिना किसी की देखरेख के run हो सकता है;
  - hazards;
  - एक test method।

Example: `cw.op.simmer` = 85–96 °C पर पानी-आधारित तरल; `cw.op.deep_fry` = 160–190 °C पर तेल।
- **envelopes के भीतर Targets.** एक रेसिपी target (`params.tempC` या माध्यम के sensor पर एक `target`) MUST envelope के भीतर होना चाहिए। validator उन रेसिपी को अस्वीकार कर देता है जो इसे तोड़ती हैं।
- **Executors माध्यम को envelope के भीतर रखते हैं।** यदि रेसिपी एक संकीर्ण target देती है, तो वे एक बार वहां पहुँचने के बाद उसे उसके भीतर भी रखते हैं।
- **Altitude.** रसोई की altitude के प्रति 300 m पर पानी और भाप के बैंड −1 °C से खिसक जाते हैं।
- **Heat levels** (`very_low` … `max`) का एक साझा अर्थ है: `vocab/units.json` में परिभाषित °C में एक pan-surface बैंड।
- **Sensor ladder.** प्रत्येक envelope चरण को सत्यापित करने के तरीके सूचीबद्ध करता है, सबसे अच्छा पहले: एक विशिष्ट sensor, फिर `model` (एक logged estimate), फिर `time`, फिर `human`|
  - executor उस पहले rung का उपयोग करता है जिसे वह संतुष्ट कर सकता है और उसे `verifiedBy` में रिकॉर्ड करता है।
  - यदि वह **किसी भी** rung को संतुष्ट नहीं कर सकता है, तो उसे MUST चरण को refuse करना चाहिए (`missing_sensor_no_fallback`)।
  - वे Operations जिन्हें निरंतर ध्यान देने की आवश्यकता होती है और जो बिना निगरानी के नहीं चल सकते (sautéing, searing, frying, reducing, caramelizing…) कभी भी केवल time पर fallback नहीं करते हैं: उनका अंतिम rung एक व्यक्ति है जो देख रहा हो।
  - Deep frying में कोई fallback नहीं है: no oil-temperature sensor का अर्थ है no deep frying।
  - एक `Condition` इसे `onSensorMissing` के साथ संकीर्ण कर सकता है।
- **Refusal, guessing नहीं।** एक executor जो किसी चरण के envelope, ladder, उपकरण या सुरक्षा सीमाओं को पूरा नहीं कर सकता है, उसे शुरू करने से पहले एक कारण के साथ `refused` उत्तर देना MUST है।

## 4. संख्याएँ और इकाइयाँ

- **तार पर तापमान °C में है।** डिस्प्ले बदल सकते हैं।
- **Tolerances.**
  - `tolerance` सापेक्ष है और केवल ratio-scale इकाइयों पर ही अनुमत है।
  - `toleranceAbs` मान की इकाई में absolute है, और °C पर केवल यही tolerance अनुमत है।
  - `Target.tolerance` absolute है।
- **किचन इकाइयों के सटीक metric मान हैं:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass के लिए density की आवश्यकता होती है** (`Quantity.densityGPerMl`, या ingredient vocabulary);
  इसके बिना यह एक error है, कभी भी guess नहीं।
- **Money एक decimal string है** (`"12.70"`) ISO 4217 currency के साथ, कभी भी float नहीं।

## 5. अखंडता और विश्वास

- **Hash.** `sha256:` दस्तावेज़ के RFC 8785 canonical JSON का hex digest, बिना इसके `hash` और `signature` फ़ील्ड के। संदर्भ canonicalizer RFC 8785 उदाहरण को बिल्कुल वैसा ही पुनरुत्पादित करता है।
- **Signature.** ASCII hash स्ट्रिंग पर Ed25519 (`EdDSA`)। P-256 हार्डवेयर कुंजियों के लिए `ES256` की अनुमति है। `kid` एक `KeyRecord` को नाम देता है।
- **Keys.** एक `KeyRecord` सार्वजनिक कुंजी, उसका स्वामी, एक वैधता विंडो और `revokedAt` प्रदान करता है। एक हस्ताक्षर जिसका `signedAt` रद्दीकरण (revocation) के बाद, या वैधता विंडो के बाहर आता है, वह अमान्य है।
  - कैटलॉग अपनी कुंजियाँ `/.well-known/cookwala.json` में प्रकाशित करते हैं।
  - संगठन और लोग अपनी कुंजियाँ did:web दस्तावेज़ों में प्रकाशित करते हैं।
  - डिवाइस अपनी कुंजियाँ अपने capabilities दस्तावेज़ में प्रकाशित करते हैं।
  - Verifiers ऑफलाइन उपयोग के लिए key records को कैश करते हैं।
- **Selective disclosure.** एक हस्ताक्षरित दस्तावेज़ में संवेदनशील मान के बजाय `Disclosure` digest, `sha256(JCS([salt, value]))` हो सकता है। धारक salt और value को केवल उन पक्षों को प्रकट करता है जिन्हें उन्हें देखने की अनुमति है, और हस्ताक्षर फिर भी सत्यापित होता है।
- **Event logs** (Mission profile):
  - प्रति लॉग एक sequencer `seq` और `prev` असाइन करता है, ताकि चेन कभी fork न हो।
  - Checkpoints sequencer द्वारा हस्ताक्षरित होते हैं और witnesses द्वारा counter-signed होते हैं, जिनमें IETF SCITT जैसी transparency service शामिल हो सकती है। एक witnessed checkpoint के बाद पुनलेखन (rewrite) पता लगाने योग्य होता है।
  - `hash_only` मोड में, payloads मिटने योग्य स्टोरेज में रहते हैं और लॉग केवल उनके hashes रखता है।

## 6. सुरक्षा और एजेंट नियम (मानक)

1. **Safety स्थानीय है।** Executors डिवाइस पर एक `SafetyLimits` pack लागू करते हैं।
   - कोई भी रेसिपी, agent, remote message, extension या operating mode किसी limit को बढ़ा या अक्षम नहीं कर सकता।
   - एक सख्त limit हमेशा जीतती है।
   - `profiles/core/safety-limits.default.json` एक ड्राफ्ट शुरुआती बिंदु है जिसे डिवाइस निर्माता अपने स्वयं के safety case से कड़ा करते हैं।
2. **Local stop।** डिवाइस पर एक stop control 0.5 s के भीतर गति को रोकता है और नेटवर्क के साथ या बिना 1 s के भीतर heat को काट देता है। एक बार जब caller executor तक पहुँच सके, तो `POST …/stop` को authorization के लिए कभी भी refuse नहीं किया जाता है।
3. **Events report करते हैं; वे कभी सुरक्षा नहीं करते।** `cookwalalatency: local_safety` events रिपोर्ट करते हैं कि डिवाइस ने पहले ही क्या किया है। कोई भी safety function किसी event के आने पर निर्भर नहीं हो सकता।
4. **Untrusted text।** प्रत्येक free-text field (जिसे `x-cookwala-untrusted` के रूप में चिह्नित किया गया है) डेटा है और कभी भी निर्देश नहीं है, सॉफ्टवेयर और AI agents दोनों के लिए समान रूप से। टेक्स्ट के माध्यम से निर्देश देने के प्रयासों को अनदेखा किया जाता है और log किया जाता है (`cw.incident.untrusted_instruction`)।
5. **Agents एक mandate के तहत कार्य करते हैं।** एक agent द्वारा भेजा गया अनुरोध principal द्वारा हस्ताक्षरित `AgentMandate` लेकर चलता है: scopes, spending caps, अनुमत providers, expiry, और वे actions जिन्हें confirmation की आवश्यकता होती है।
   - `irreversible` और `safety_override` को हमेशा confirmation की आवश्यकता होती है, mandate चाहे कुछ भी कहे।
   - Executors mandate के बाहर के अनुरोधों को refuse करते हैं (`mandate_scope`)।
6. **Unattended operations के लिए एक व्यक्ति की आवश्यकता होती है।** वे operations जिनका envelope `unattended: false` कहता है, उनमें एक जिम्मेदार व्यक्ति का उपस्थित होना, या एक मिनट के भीतर पहुँच योग्य होना आवश्यक है।
7. **Allergen blocks refuse करते हैं।** रेसिपी या inventory में कोई भी blocked allergen अनुरोध को refuse करता है; किसी block के आसपास कोई substitutions नहीं होते हैं।
8. **Recalls।** Catalogs `GET /v1/recalls` पर हस्ताक्षरित recalls प्रकाशित करते हैं। Executors ऑनलाइन होने पर poll करते हैं और recalled revisions को refuse करते हैं। `block_and_stop_running` चल रहे executions को भी सुरक्षित रूप से रोकना बंद कर देता है।
9. **Incident reports** anonymous होते हैं (`IncidentReport`: केवल तिथि, कोई नाम या ids नहीं) और catalogs को सबमिट किए जाते हैं ताकि प्रत्येक निर्माता प्रत्येक near miss से सीख सके।

## 7. Execution lifecycle और API

- **API:** `api/core.openapi.yaml`|। इसके endpoints हैं:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog side: `GET /v1/recalls`, `POST /v1/incidents`|।
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` और `stopping` → रास्ते में `stopped` में बदल जाते हैं;
  - `refused` और `failed` अंतिम हैं।
  - पूर्ण transition table `core.schema.json#/$defs/ExecutionState` और conformance vectors में है।
- **Request rules:**
  - प्रत्येक POST में एक `Idempotency-Key` होता है।
  - मौजूदा execution में बदलाव के लिए `If-Match: <seq>` आवश्यक है; mismatch होने पर 412 वापस मिलता है।
  - Stop के लिए If-Match की आवश्यकता नहीं है।
- **Events:**
  - Delivery कम से कम एक बार (at least once) होती है।
  - CloudEvents `id` deduplication key है।
  - `cookwalaseq` प्रत्येक subject के अनुसार events को क्रमबद्ध करता है और status `seq` से मेल खाता है।
  - Devices `cookwala.device.heartbeat` उत्सर्जित करते हैं, ताकि एक hub खोए हुए device का पता लगा सके और hand off कर सके।

## 8. गोपनीयता

- **Execution logs में कोई व्यक्तिगत डेटा नहीं होता है** (`privacy.personalData: "none"`).
- **वे केवल opt-in सहमति के साथ ही डिवाइस छोड़ते हैं** (`consent.dataset`: डिफ़ॉल्ट रूप से `none`,
  `research_only`, या `open`). सहमति वापस ली जा सकती है।
- **Open datasets समय को दिन तक मोटा (coarsen) कर देते हैं।**
- **Household, स्वास्थ्य और धार्मिक डेटा घर पर ही रहता है** जब तक कि व्यक्ति अन्यथा न चुने।
  जब इसे यात्रा करनी होती है, तो यह selective disclosures के रूप में यात्रा करता है।
- **The Humanitarian Profile** में बिल्कुल भी व्यक्तिगत डेटा नहीं होता है।

## 9. वर्शनिंग और एक्सटेंशन

- **Core versions `0.2.x` हैं।**
  - Readers अपने minor version के किसी भी patch को स्वीकार करते हैं।
  - वे अन्य minors को `unsupported_version` के साथ reject करते हैं।
  - वे अज्ञात `x-` fields को ignore करते हैं।
- **New operations, units, sensors और incident types** को version change के बिना vocabularies में जोड़ा जाता है।
- **किसी operation का meaning बदलना एक नया id है;** पुराने को `replacedBy` के साथ `deprecated` मार्क किया जाता है।
- **Profiles** स्वतंत्र रूप से version करते हैं और उस Core version को declare करते हैं जिसकी उन्हें आवश्यकता है।

## 10. प्रोफाइल्स और उनकी स्थिति

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | पहले device implementations के लिए लक्ष्य |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | कोई व्यक्तिगत डेटा नहीं; SMS और CSV द्वारा कार्य करता है; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first household facts; केवल derived constraints यात्रा करते हैं (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Proven namespaces, सटीक versions, tombstones; अनुरोध पर organizations (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | प्रत्येक conformance claim के पीछे हस्ताक्षरित reports (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds और relays; issuer के विरुद्ध सत्यापित करें (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurants, community, school, disaster और robot kitchens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Aggregated, delayed, class-level demand और supply signals; competition-law review पर गेटेड (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, `profiles/mission/transitions.json` में transitions |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | उत्पादन उपयोग से पहले competition-law review की आवश्यकता है |
| Relief planning (`relief.schema.json`) | experimental | Operational flow को Humanitarian Profile में स्थानांतरित कर दिया गया है |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API संदर्भ surface है |

एक प्रोफाइल तब स्थिर हो जाती है जब दो स्वतंत्र कार्यान्वयन इसके conformance vectors को पास कर लेते हैं
और इसके वास्तविक उपयोगकर्ता होते हैं।

## 11. Tools

| Tool | यह क्या करता है |
|---|---|
| `tools/validate_specs.py` | schemas, examples, recipe semantics (envelopes, op parameters, no template placeholders), strictness, और यह जाँचता है कि API references resolve होते हैं |
| `tools/run_conformance.py` | `conformance/*.json` और `conformance/profiles/*.json` चलाता है, और `--report` के साथ एक ConformanceReport लिखता है: hashing (RFC 8785 example सहित), signatures (RFC 8032 key सहित), revocation, disclosure, event chains और checkpoints, units, envelopes, sensor ladders, state machines |
| `tools/cookwala_ref.py` | Reference library और CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | vectors को पुन: उत्पन्न करता है (diff की समीक्षा करें) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack checker और impact summaries |
| `tools/make_profile_vectors.py` | `conformance/profiles/` में profile vectors को पुन: उत्पन्न करता है |

## 12. 0.1 से परिवर्तन

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Accepted unknown fields | Strict, `x-` extensions के साथ |
| Temperatures | °C या °F, relative tolerance की अनुमति है | केवल °C; absolute tolerance |
| Money | Number | Decimal string |
| Operations | Prose definitions | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, lifecycle के बिना keys | EdDSA या ES256, validity और revocation के साथ KeyRecords |
| Missions | एक mutable document, अंदर ledger | Event log + projection, single sequencer, witnessed checkpoints, hash-only mode |
| Agents | केवल Missions के अंदर Mandate | common में `AgentMandate`; agent requests के लिए आवश्यक |
| Safety | recipes में घोषित | SafetyLimits के माध्यम से स्थानीय रूप से भी लागू; recalls; incident reports |
| Data | No dataset model | Consented, personal-data-free ExecutionLog |
| Conformance | केवल Schema validation | 106 vectors (44 Core, 62 profile) और एक reference implementation |

0.1 दस्तावेज़ को माइग्रेट करने के लिए: °F को °C में बदलें; तापमान पर सापेक्ष सहनशीलता (relative tolerances) को `toleranceAbs` से बदलें; धनराशि को दशमलव स्ट्रिंग्स (decimal strings) में बदलें; अज्ञात फ़ील्ड्स को हटा दें या उन्हें `x-` फ़ील्ड्स में बदल दें।

