<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->
# Cookwala रणनीति: संदेश, उत्पाद, वेबसाइट, दस्तावेज़, डेवलपर अनुभव

**Status:** संशोधित 2026-10-04 (v2)। इसमें मिशन, विजन, कहानी, मानक, वेबसाइट,
दस्तावेज़ीकरण, API और SDK, डेमो, समुदाय और मेट्रिक्स शामिल हैं। यह एक्शन प्लान
(`ACTION-PLAN.md`), बैकस्टोरी और गैप लिस्ट (`research/BACKSTORY.md`), आर्किटेक्चर रिव्यू
(`research/ARCHITECTURE-REVIEW.md`), 23-साइट बेंचमार्क (`research/WEB-BENCHMARK.md`),
स्टेकहोल्डर डिज़ाइन (`STAKEHOLDERS.md`) और मैसेजिंग रूल्स (`MESSAGING.md`) पर आधारित है। सेक्शन 1 की टेबल फर्स्ट-पास स्टडी है; जहाँ वे भिन्न होते हैं, वहाँ बेंचमार्क उसका स्थान ले लेता है।

---

## 0. सारांश

**Cookwala का काम।** यह किसी भी रसोई (एक व्यक्ति, एक food bank, एक oven या एक humanoid robot) को यह बताने का खुला तरीका है कि **क्या बनाना है, प्रत्येक चरण कब पूरा होता है, और क्या कभी नहीं होना चाहिए**, और डिवाइस पर इन तीनों की जाँच करना है।

**क्या परिवर्तन हुए:**

1. **Message.** "the world's first and largest robot cooking recipes index and CLI" को रिटायर करें
   और उस समस्या के साथ शुरुआत करें जो हर रोबोट निर्माता और किचन के पास है। नया वन-लाइनर:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** रोबोट घरों में खाना पकाने वाले हैं, लेकिन किसी ने भी उस रूप में यह नहीं लिखा है जिसे
   मशीन चेक कर सके, कि "done" और "safe" का क्या अर्थ है, या किन व्यंजनों में। Cookwala की शुरुआत
   एक परिवार के मिस्र के व्यंजनों से हुई थी। इसका मिशन मशीनों को हर व्यंजन सुरक्षित रूप से
   सिखाना है, और यह सुनिश्चित करना है कि अच्छा भोजन लोगों तक पहुंचे।
3. **Proof before promise.** लाइव, वास्तविक काउंटर। Now / next / later लेबल। प्रकाशित आलोचनाएं।
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** डिवाइस निर्माता, AI-agent निर्माता, किचन और food banks, रसोइये,
   शोधकर्ता।
6. **Code and a live demo on the first screen.** इन-ब्राउज़र dry run ("Can this device cook
   this recipe?"), सिम्युलेटर, और कॉपी-पेस्ट कमांड जो आज काम करते हैं।
7. **Developer experience at the level of the best AI and robotics docs:** एक 5-मिनट का
   quickstart, ट्यूटोरियल के रूप में व्यवस्थित docs, how-to गाइड, संदर्भ और व्याख्या,
   `llms.txt`, copy-page, एक Python पैकेज और CLI, एक typed JS/TS SDK, एक MCP server, एक
   reference hub जिसे आप स्थानीय रूप से चला सकते हैं, एक ROS 2 पैकेज, और एक LeRobot bridge।
8. **A contributor network** (Figure's Index से प्रेरित): रसोइये और किचन वास्तविक व्यंजनों की
   सहमति प्राप्त रिकॉर्डिंग योगदान करते हैं, ताकि रोबोट हर व्यंजन सीख सकें, उन लोगों को श्रेय देते हुए
   जिन्होंने उन्हें सिखाया।

---

## 1. हमने क्या सीखा

| साइट | समस्या जिसे यह हल करता है | दृष्टिकोण | यह कैसे संवाद करता है | दर्शक | हम क्या लेते हैं |
|---|---|---|---|---|---|
| **Figure – Index** | Humanoids को वास्तविक दुनिया के कार्य डेटा की भारी मात्रा की आवश्यकता होती है | भुगतान करने वाला contributor network जो रोजमर्रा के कार्यों को रिकॉर्ड करता है; services now, robots later | Cinematic, monochrome, विशाल light type; live counters (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Contributors, households, businesses | credit के साथ Contributor network; **live proof counters**; एक "today / soon" ईमानदारी वाली लाइन; एक प्रभावशाली छवि |
| **Figure (home)** | घर की सहायता | एक general-purpose humanoid | *"The future of home help is here."* एक वाक्य, एक वीडियो | Households, investors | एक वाक्य का वादा; features से पहले product |
| **MCP Registry** | भरोसेमंद MCP servers खोजना | Community registry; सत्यापित reverse-DNS namespaces; सटीक versions; integrity hashes; validation endpoint; lifecycle status | Clean OpenAPI reference; schema-first | Server publishers, client makers | **Verified namespaces, pinned versions, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | agents बनाना खंडित है | Open, model-agnostic frameworks और एक platform | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; trust center और status | Agent engineers, enterprises | **एक lifecycle जिसे पाठक पहचानता है**; trust center; academy और forum |
| **LangSmith Observability** | यह देखना कि agents ने production में क्या किया | Traces → monitoring → feedback → evals के लिए datasets | लिंक्स के साथ Steps; concepts page; integrations | Agent teams | **Traces के रूप में Execution logs**; traces datasets बन जाते हैं → `execlog_export.py otel` |
| **OpenAI API docs** | पहली API call | code first के साथ Quickstart; build paths; model cards | Dark, code-forward, "Ask AI", status और cookbook | Developers | **पहली स्क्रीन पर Code; "build paths"** |
| **Claude Platform docs** | पहली call से production तक | दो surfaces (Messages, Managed Agents); क्रमांकित developer journey; model family cards | ⌘K search; language tabs (Python … cURL, CLI); journey 1–4 | Developers, platform teams | **क्रमांकित developer journey; language tabs; "choose how you build"** |
| **AsyncAPI** | event-driven APIs का वर्णन करना | Open spec और tools (generators, docs); Linux Foundation के तहत open governance | "Part of the Linux Foundation"; spec → docs → code demo; community meetings; sponsor tiers | Architects, tool builders | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | तेज़, सस्ता model inference | कई models के लिए One-stop API | performance, scalability, cost और security की Feature lists | Developers, enterprises | **characteristics** की एक स्पष्ट सूची (हमारा: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Trial-and-error prompt engineering | Declarative test cases, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; why-choose list; workflow steps | LLM app developers, security | **Declarative safety tests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; Figure के Helix AI नहीं) | DeFi बहुत जटिल है | हर transaction से पहले confirmation के साथ Natural-language agent | Whitepaper: abstract → problem → solution → architecture → security model | Crypto users | **Whitepaper structure; explicit security model; "always confirm"** (हम structure लेते हैं, token model नहीं) |
| **Hugging Face LeRobot** | Robotics शुरू करना कठिन है | Hardware-agnostic library; teleoperate → record → train → deploy; standard dataset format; community datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; common problems | Makers, researchers | **"Pick your path"; dataset compatibility; common-problems section** |
| **ROS 2 / Open Robotics** | Robot software interoperability | एक non-profit द्वारा संचालित Open middleware (ROS, Gazebo, Open-RMF) | *"Powering the world's robots"* | Robot developers | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | Robots का विकास और प्रशिक्षण | Simulation, libraries, foundation models (GR00T) | Platform map: libraries, simulation, models, blueprints | Robotics teams | envelopes के लिए **Simulation as the test bench** |
| **1X, Unitree, Pollen** | Home humanoids, किफायती robots, makers के लिए open robots | deposits, pre-orders और community के साथ Products | एक product, एक price, एक button | Households, makers | Home robots अब ship हो रहे हैं; हमारा window now है |

**सर्वश्रेष्ठ द्वारा साझा किए गए पैटर्न:**
1. एक वाक्य कि यह किसके लिए है और क्या करता है।
2. एक लूप जिसे पाठक पहचानता है।
3. एक स्क्रॉल के भीतर वर्किंग कोड या डेमो।
4. पिक-योर-पाथ एंट्री पॉइंट्स।
5. प्रमाण (नंबर, उपयोगकर्ता, गवर्नेंस)।
6. ईमानदार स्थिति (ट्रस्ट सेंटर, स्टेटस पेज, now/next)।
7. समुदाय जिसमें आप आज शामिल हो सकते हैं।
8. लोग और AI रीडर्स दोनों के लिए बनाए गए डॉक्स (कॉपी पेज, `llms.txt`, "Ask AI")।

---

## 2. Cookwala आज

**Strengths:**
- एक दुर्लभ, ठोस विचार: physical operation envelopes, sensor ladders, अनुमान लगाने के बजाय refusal, डिवाइस पर लागू सुरक्षा, सत्यापन योग्य दस्तावेज़।
- Conformance vectors जिनमें दो स्वतंत्र मानक परिणाम (RFC 8785, RFC 8032) शामिल हैं।
- चार खेलने योग्य simulators।
- एक मानवीय profile जो बिना रोबोट के काम करता है।
- एक वास्तविक recipe corpus (fifi.cooking) और एक पहचान वाला क्षेत्र (Egypt, अरब दुनिया)।
- एक असामान्य रूप से ईमानदार critique-and-response रिकॉर्ड।

**Gaps:**

| Gap | Effect |
|---|---|
| हेडलाइन "पहला और सबसे बड़ा" का दावा करती है जिसमें 1 प्रकाशित रेसिपी है | हाइप के रूप में पढ़ा जाता है; खारिज करने के लिए आमंत्रित करता है |
| "विश्व भूख मिटाएं" को मुख्य विषय के रूप में रखना | उन फंडर्स और विशेषज्ञों को दूर भगाता है जो भूख के कारणों को जानते हैं |
| केवल रोबोट-केंद्रित फ्रेमिंग | उन उपयोगकर्ताओं को बाहर करता है जो आज ही अपना सकते हैं (किचन, food banks, एजेंट बिल्डर्स) |
| कोई quickstart नहीं, कोई SDK नहीं, कोई runnable server नहीं | कोई भी 5 मिनट में सफल नहीं हो सकता |
| डॉक्स 25 markdown फाइलें हैं जिनमें कोई नेविगेशन नहीं है | ढूँढना कठिन है, भरोसा करना कठिन है |
| कोई लाइव प्रमाण या status नहीं | गति या तत्परता का कोई अहसास नहीं |
| जुड़ने का कोई तरीका नहीं | रुचि योगदान में नहीं बदल सकती |

---

## 3. स्थिति और संदेश

### 3.1 Category and one-liner
- **Category:** निष्पादन योग्य, सत्यापन योग्य खाना पकाने के लिए एक खुला मानक (मुफ्त टूल और एक इंडेक्स के साथ)।
- **One-liner:** *Cookwala सुरक्षित रूप से खाना पकाने के लिए खुला मानक है: लोग, रसोई और रोबोट।*
- **Triad**, हर जगह उपयोग किया जाता है:
  - **क्या बनाना है।** रेसिपी जैसे चरण जिन्हें एक मशीन प्लान कर सकती है।
  - **यह कब समाप्त होता है।** मापने योग्य समाप्ति स्थितियाँ: तापमान, खाद्य-अवस्था संकेत, समय।
  - **क्या कभी नहीं होना चाहिए।** सुरक्षा सीमाएँ जिन्हें डिवाइस स्वयं लागू करता है।

### 3.2 मिशन और विजन (संशोधित)
- **मिशन:** *चाहे खाना बनाने वाला कोई भी हो, सभी को अच्छी तरह, सुरक्षित रूप से, किफायती और बिना बर्बादी के खाने में मदद करना।*
- **विजन:** *पृथ्वी पर कोई भी रसोई किसी भी रेसिपी को सुरक्षित रूप से बना सकती है, और अच्छा भोजन कूड़ेदान के बजाय लोगों तक पहुँचता है।*
- **परिवर्तन क्यों:** "end world hunger" दीर्घकालिक कारण के रूप में बना रहता है, जिसे साक्ष्यों के साथ बताया गया है। Cookwala कम बर्बादी, food rescue और सस्ती कुकिंग के माध्यम से इसमें योगदान देता है, साथ ही उन कार्यक्रमों, फंडिंग और नीति के साथ भी जिनकी भूख को आवश्यकता है।

### 3.3 कहानी

> होम रोबोट आ रहे हैं: Figure 03, 1X NEO और किचन रोबोट शिप हो रहे हैं या ऑर्डर ले रहे हैं। वे चलना सीख रहे हैं, लेकिन किसी ने भी इस तरह से यह नहीं लिखा है जिसे मशीन चेक कर सके, कि "simmer" का क्या अर्थ है, कब चिकन सुरक्षित है, या एक दादी की molokhia कैसे बनाई जाती है। प्रत्येक निर्माता अपनी स्वयं की बंद रेसिपी लिखता है, जो ज्यादातर कुछ ही व्यंजनों से होती है।
>
> Cookwala ने fifi.cooking पर एक परिवार की मिस्र की घरेलू रेसिपी से शुरुआत की और एक सरल प्रश्न पूछा: आप किसी मशीन को रेसिपी कैसे सौंपते हैं, और कैसे जानते हैं कि वह इसे सुरक्षित रूप से पकाएगी?
>
> उत्तर एक ओपन स्टैंडर्ड है। यह बताता है कि क्या बनाना है, प्रत्येक चरण कब पूरा होता है, और क्या कभी नहीं होना चाहिए। डिवाइस किसी भी चीज़ को गर्म करने से पहले इसे चेक करता है, और अनुमान लगाने के बजाय refusal करता है। वही रेसिपी आज लोगों और food bank के लिए काम करती हैं, और वे कल पृथ्वी पर प्रत्येक व्यंजन को सीखने देंगे, उन रसोइयों को श्रेय देते हुए जिन्होंने उन्हें सिखाया।

*(संस्थापक को मूल वाक्य की पुष्टि और उसे व्यक्तिगत रूप से अनुकूलित करना चाहिए। प्रामाणिक होना पॉलिश होने से बेहतर है।)*

### 3.4 मैसेज हाउस

| स्तंभ | वादा | प्रमाण जो हम आज दिखा सकते हैं |
|---|---|---|
| **डिज़ाइन द्वारा सुरक्षित** | उपकरण अनुमान लगाने के बजाय मना करते हैं, और स्थानीय रूप से सीमाओं को लागू करते हैं | 32 operations के लिए operation envelopes; safety-limits pack; dry run; conformance |
| **सत्यापन योग्य** | कोई भी रेसिपी, एक डिवाइस और एक रिकॉर्ड की जांच कर सकता है | Signatures, key revocation, event-log checkpoints; RFC परिणामों सहित 106 vectors |
| **खुला और तटस्थ** | Royalty-free, model-agnostic, device-agnostic | Licences; governance path; no API keys |
| **हर व्यंजन** | वास्तविक घरेलू खाना पकाने से निर्मित, बहुभाषी | fifi.cooking corpus; Arabic और English; world-cuisines plan |
| **रोबोट से पहले उपयोगी** | Kitchens और food banks को अब लाभ मिलता है | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **सहमति के साथ सीखता है** | वास्तविक खाना पकाना बेहतर रोबोट बनता है, श्रेय के साथ | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 भाषा के नियम
- **उपयोग करें:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **बचें:** "revolutionary", "first and largest" (जब तक सच न हो), "end hunger" (एक हेडलाइन के रूप में),
  "AI-powered" (अस्पष्ट)।
- **प्रत्येक संख्या को लेबल करें** *measured*, *modelled* या *assumed* के रूप में।
- **"now / next / later" कहें** बजाय इसके कि कुछ मौजूद होने का संकेत दिया जाए जब वह मौजूद न हो।

---

## 4. दर्शक और उनकी पहली सफलता

| Audience | Job to be done | First success (≤ 15 min) | Then |
|---|---|---|---|
| **Robot and appliance makers** | हर रेसिपी लिखे बिना, सुरक्षित रूप से कुकिंग फीचर्स शिप करें | 5 रेसिपी के विरुद्ध अपने डिवाइस प्रोफाइल का dry run करें; प्रत्येक स्टेप पर accept/refuse देखें | Core API (reference hub) लागू करें, conformance पास करें, डिवाइस को registry में पब्लिश करें |
| **AI-agent builders** | एजेंटों को बिना किसी नुकसान के भोजन की योजना बनाने और ऑर्डर करने दें | Cookwala MCP server जोड़ें; उनके मॉडल पर agent-safety benchmark चलाएं | कार्य करने से पहले AgentMandate और dry run का उपयोग करें |
| **Kitchens and food banks** | surplus को सुरक्षित रूप से बचाएं, पौष्टिक मेनू की योजना बनाएं | SMS ऑफर भेजें, या CSV भरें; rule-pack चेक देखें | Humanitarian Profile के साथ पायलट करें |
| **Cooks and recipe creators** | अपनी रेसिपी को जीवित और क्रेडिट प्राप्त रखें | एडिटर के साथ एक रेसिपी को कन्वर्ट करें; इसे validation पास करते हुए देखें | रिकॉर्डिंग योगदान करें (सहमति के साथ); क्रेडिट में दिखाई दें |
| **Researchers and reviewers** | डेटा, benchmarks, ईमानदार assumptions | सिम्युलेटर चलाएं; critique और conformance suite पढ़ें | datasets का उपयोग करें; reviews पब्लिश करें |
| **Funders and policymakers** | प्रभाव, जोखिम और गवर्नेंस देखें | 2-पेज का whitepaper summary और concept note पढ़ें | पायलट को फंड करें; गवर्नेंस में शामिल हों |

---

## 5. उत्पाद आर्किटेक्चर: Cookwala क्या प्रदान करता है

| Layer | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | पहले device feedback के बाद Core 0.3 | एक foundation के तहत Core 1.0 |
| **Index and registry** | Example recipes; registry spec | fifi.cooking corpus परिवर्तित (1,881 recipes, Arabic + English); verified namespaces | Community collections, world cuisines |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Recipe editor (web) |
| **Reference hub** | Core API spec | एक simulated device के साथ Docker hub, ताकि quickstart `curl` स्थानीय रूप से काम करे | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Reviewed limits; public agent-safety results | एक certifier के साथ Certification scheme |
| **Humanitarian** | Profile, rule pack, templates, concept note | Egypt food-bank pilot | Food-bank network adoption |
| **Data** | consent के साथ ExecutionLog | Contributor network, पहला consented dataset | Hugging Face Hub पर Multi-cuisine benchmark |

---

## 6. वेबसाइट

### 6.1 साइटमैप

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 होम पेज, ऊपर से नीचे तक

| # | Section | Purpose | Content |
|---|---|---|---|
| 1 | **Hero** | एक ही सांस में बताएं कि यह क्या है | One-liner, triad, दो बटन (*Try the dry run*, *Read the quickstart*); ईमानदार status chip "Draft standard · v0.2" |
| 2 | **Live demo** | दिखाएं, बताएं नहीं | "क्या यह device इस recipe को पका सकता है?" एक recipe और एक device चुनें; प्रत्येक step done / person / refuse दिखाता है, उस rule के साथ जिसने निर्णय लिया |
| 3 | **The problem** | अंतर को महसूस कराएं | Robots आ रहे हैं; "simmer" के अलग-अलग अर्थ हैं; कुछ ही cuisines से closed recipes; लोग भूखे रह जाते हैं जबकि भोजन बर्बाद होता है |
| 4 | **The loop** | एक mental model | Describe → Check → Cook → Learn, प्रत्येक artifact और command के साथ |
| 5 | **Pick your path** | प्रत्येक visitor को मार्ग दें | पाँच cards (section 4), प्रत्येक में एक first success |
| 6 | **Proof** | Momentum और ईमानदारी | `/v1/stats.json` से Live counters (operations defined, conformance vectors, schemas, recipes published, languages); प्रत्येक number labelled है |
| 7 | **Safety** | Trust | Safety स्थानीय है; refusal; agent rules; recalls; /trust का link |
| 8 | **Works today** | Robots से पहले उपयोगिता | Humanitarian Profile, SMS example, simulators |
| 9 | **Now / next / later** | ईमानदार roadmap | section 5 से |
| 10 | **Open** | Neutral और joinable | Licences, governance path, contribute, GitHub |

### 6.3 डिज़ाइन दिशा
- **अनुभव (Feel):** शांत, सटीक, गर्म। एक पेशेवर उपकरण जिसमें रसोई की आत्मा हो।
- **प्रकार (Type):** UI के लिए एक सटीक grotesque और डेटा और कोड के लिए एक mono face। हीरो के लिए बड़ा, हल्का डिस्प्ले टाइप (Figure के आत्मविश्वास को उधार लेते हुए), बिना उसकी सिनेमाई डार्कनेस की नकल किए।
- **रंग (Colour):** न्यूट्रल पेपर और इंक, जिसमें एक हीट एक्सेंट (ember orange) हो जो तापमान डेटा को भी चिह्नित करे। पैलेट को कलर-ब्लाइंड पाठकों के लिए मान्य किया गया है, और लाइट और डार्क दोनों थीम डिज़ाइन की गई हैं।
- **छवियाँ (Imagery):** वास्तविक हाथ और वास्तविक घरेलू रसोई जब हमारे पास हों, कभी भी स्टॉक रोबोट नहीं। तब तक, आरेख (diagrams) और लाइव डेमो पेज को संभालते हैं।
- **मोशन (Motion):** एक क्षण, स्टेप-बाय-स्टेप dry run। बाकी सब स्थिर है।
- **शुरुआत से ही द्विभाषी:** अंग्रेजी और अरबी (right-to-left लेआउट), फिर अन्य।
- **एक्सेसिबिलिटी (Accessibility):** WCAG 2.2 AA; कीबोर्ड; रिड्यूस्ड मोशन; केवल रंग के माध्यम से कोई जानकारी नहीं।

### 6.4 इंटरएक्टिविटी
1. इन-ब्राउज़र dry run (रेसिपी × डिवाइस)।
2. एनवेलप एक्सप्लोरर: एक तापमान ट्रेस को ड्रैग करें और देखें कि यह कब "simmer" छोड़ता है।
3. सिम्युलेटर, प्रोटोकॉल ऑन और ऑफ के साथ।
4. रेसिपी स्टेप व्यूअर: एक स्टेप का वाक्य, उसका JSON और उसका एनवेलप साथ-साथ।
5. Later: एक रेसिपी एडिटर जो टाइप करते समय वैलिडेट करता है।

---

## 7. दस्तावेज़ीकरण

Diátaxis framework द्वारा व्यवस्थित, इसलिए प्रत्येक पृष्ठ का एक ही कार्य है:

| Type | Purpose | Pages |
|---|---|---|
| **Tutorials** | करके सीखें | Quickstart; आपकी पहली Cookwala रेसिपी; एक डिवाइस को Cookwala-ready बनाएं; एक agent में Cookwala जोड़ें; SMS के साथ food-rescue pilot चलाएं |
| **How-to guides** | एक कार्य हल करें | डिवाइस का dry run करें; Sign और verify करें; registry में publish करें; LeRobot या OpenTelemetry में logs export करें; agent-safety benchmark चलाएं; एक घटना की रिपोर्ट करें; एक recall जारी करें |
| **Reference** | चीजें खोजें | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | समझें क्यों | Envelopes क्यों; safety स्थानीय है; trust model; privacy; humanitarian design; आलोचनाएं और प्रतिक्रियाएं; simulators और उनकी सीमाएं |

**Docs ergonomics:**
- बायां नेविगेशन, खोज, "Copy page", "Edit on GitHub", पिछला/अगला लिंक;
- भाषा टैब (Python / JavaScript / cURL / CLI);
- AI रीडर्स के लिए `llms.txt` और प्रति-पृष्ठ markdown;
- एक चीट शीट और एक common-problems पेज;
- तारीखों के साथ एक changelog।

---

## 8. API और SDK

| Deliverable | क्या | क्यों |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (`tools/` से) | पहली सफलता के लिए एक कमांड |
| `@cookwala/sdk` (TypeScript) | schemas से जनरेट किए गए Types; Core API client; ब्राउज़र में dry run | Web और agent डेवलपर्स |
| Reference hub (Docker) | एक सिम्युलेटेड डिवाइस और safety limits के साथ Core API | quickstart का `curl` स्थानीय रूप से काम करता है; मेकर्स के लिए test bed |
| MCP server | Tools: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | प्रत्येक MCP-सक्षम agent सुरक्षित रूप से Cookwala का उपयोग कर सकता है |
| ROS 2 package | `cookwala_msgs` (actions), Core API के लिए एक bridge node | Robot मेकर्स |
| Exporters | LeRobot, OpenTelemetry (पूर्ण) | Learning और observability |
| Evals | promptfoo agent-safety benchmark (पूर्ण) | Agent बिल्डर्स, safety रिव्यूअर्स |
| Versioning | Core के लिए Semver; dated schema bundle; changelog; deprecation windows | स्थिरता का वादा |
| Status | cookwala.ai endpoints के लिए Public status page | विश्वास |

---

## 9. डेमोस

| डेमो | दर्शक | स्थिति |
|---|---|---|
| In-browser dry run | सभी | Building now |
| सिम्युलेटर (घर, शहर, देश, दुनिया) | सभी, फंडर्स | Live |
| मॉडल्स में Agent-safety परिणाम | Agent builders, AI labs | Next (benchmark चलाएं, विधि के साथ परिणाम प्रकाशित करें) |
| SMS food-rescue वॉकथ्रू | Food banks | Next (रिकॉर्डेड डेमो) |
| एक वास्तविक डिवाइस द्वारा Cookwala रेसिपी बनाना, बिना एडिट किया हुआ | सभी | Later (सबसे महत्वपूर्ण डेमो; डिवाइस पार्टनर की आवश्यकता है) |
| "Cook in simulation" (Isaac Lab / Gazebo) | रोबोटिक्स शोधकर्ता | Later |

---

## 10. समुदाय और विकास

- **Contributor network** (Figure के Index से प्रेरित):
  - *Cooks* उन रेसिपीज़ के सहमति प्राप्त सत्रों को रिकॉर्ड करते हैं जिन्हें वे जानते हैं, जिसमें प्रत्येक रेसिपी और dataset card पर क्रेडिट दिया जाता है।
  - *Kitchens and food banks* पायलट।
  - *Makers* उपकरणों को लागू करते हैं।
  - *Reviewers* rule packs और envelopes की समीक्षा करते हैं।
  - *Translators* चरणों और शब्दावली का अनुवाद करते हैं।
  - सशुल्क योगदान later आते हैं, जो अनुदान द्वारा वित्तपोषित होते हैं। सूचित सहमति और उचित शर्तों के बिना डेटा के लिए कभी भुगतान न करें।
- **Rituals:** मासिक सामुदायिक कॉल; वास्तविक संख्याओं के साथ त्रैमासिक "state of Cookwala"; सार्वजनिक समीक्षा थ्रेड्स।
- **Partnership sequence:** stakeholder tracker से पहले दस (food bank, WFP Innovation Accelerator, Home Assistant, एक device startup, एक university lab, एक certifier, World Central Kitchen, एक foundation, एक neutral home, एक creator)।
- **Channels:** GitHub Discussions, एक न्यूज़लेटर, कॉन्फ्रेंस टॉक (ROSCon, IROS/ICRA workshops, food-tech events), अरबी-भाषा चैनल।

---

## 11. मेट्रिक्स

- **North-star metric:** *verified cooks*, उन executions की संख्या जिसने एक consented, conforming log के साथ एक signed Cookwala recipe को end to end चलाया। जब तक वह शून्य है, leading indicators को ट्रैक करें।

| Funnel | Metric | 2027-03 तक लक्ष्य |
|---|---|---|
| Attract | /start पर मासिक विज़िटर्स | 2,000 |
| Activate | पूर्ण किए गए dry run (web + CLI) | 500 |
| Build | conformance पास करने वाले स्वतंत्र Core implementations | 2 |
| Adopt | Food-bank पायलट kg बचाए गए (measured) | पहला 6-महीने का पायलट चल रहा है |
| Contribute | मर्ज किए गए परिवर्तनों के साथ बाहरी योगदानकर्ता | 15 |
| Trust | प्रकाशित बाहरी समीक्षाएं | 6 |
| Learn | सहमति प्राप्त execution logs | 1,000 |

---

## 12. Roadmap

प्रत्येक आइटम के स्टेटस के साथ बनाए रखा गया रोडमैप [`ROADMAP.md`](ROADMAP.md) है। नीचे दी गई तालिका मूल 180-दिन की योजना है, जिसे रिकॉर्ड के लिए रखा गया है।

| कब | वेबसाइट और कहानी | डेवलपर अनुभव | मानक और सुरक्षा | समुदाय |
|---|---|---|---|---|
| **Now (यह रिलीज़)** | लाइव dry run, triad, paths, proof, now/next/later के साथ नया होम पेज; docs viewer; `llms.txt`; trust pages (security, governance) | Dry run; LeRobot और OTel exporters; ROS 2 actions; agent-safety benchmark | Registry spec (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **अगले 30 दिन** | /start quickstart; अरबी होम पेज; सभी पेजों पर claims pass | `pip install cookwala`; reference hub (Docker) | पहले benchmark परिणाम प्रकाशित | food bank को concept note; Home Assistant प्रस्ताव |
| **60 दिन** | fifi corpus (पहले 100 परिवर्तित) के साथ /recipes index; /humanitarian | TS SDK; MCP server | एक food scientist द्वारा envelope review | पहली community call |
| **90 दिन** | Whitepaper + 2-पेज सारांश; /roadmap | ROS 2 package | डिवाइस फीडबैक से Core 0.3 | डिवाइस पार्टनर, यूनिवर्सिटी लैब |
| **180 दिन** | Real-device डेमो वीडियो | Recipe editor | Certifier gap analysis | Pilot परिणाम; foundation application |

---

## 13. इस रणनीति के जोखिम

| जोखिम | शमन |
|---|---|
| एक पतली वास्तविकता के ऊपर एक पॉलिश की हुई साइट हाइप जैसी दिखती है | प्रत्येक दावे को लेबल किया गया; वास्तविक डेटा से लाइव काउंटर; now/next/later |
| बहुत अधिक दर्शकों में फैलना | अगले 90 दिनों के लिए दो प्राथमिक पथ: डिवाइस निर्माता और food bank। अन्य को समर्थन दिया जाता है लेकिन उनके पीछे नहीं भागते |
| बड़े प्लेटफॉर्म बंद विकल्प भेजते हैं | वह तटस्थ, सत्यापन योग्य परत बनें जिसे वे अपना सकें; ओपन खिलाड़ियों (Hugging Face, Open Robotics, Home Assistant) के साथ साझेदारी करें |
| योगदानकर्ता डेटा का दुरुपयोग | Opt-in, वापस लेने योग्य सहमति; कोई व्यक्तिगत डेटा नहीं; प्रकाशित डेटा कार्ड |
| संस्थापक बैंडविड्थ | अधिक spec से पहले डेवलपर अनुभव (package, hub) भेजें; एक co-maintainer की भर्ती करें |

