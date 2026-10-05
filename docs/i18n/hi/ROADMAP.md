<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# रोडमैप: now, next, later

**Status:** 2026-10-04. प्रत्येक आइटम एक status लेकर आता है: **done**, **in progress**, **planned**,
**not yet funded**। Gates `ACTION-PLAN.md` section 4 से आते हैं। बिना नामित evidence के कुछ भी planned
से done में नहीं बदलता है।

## Now (यह रिलीज़)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| English और Arabic में नौ उदाहरण रेसिपी | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) एक review template के साथ | done (drafts awaiting professional review) |
| 139-type facet registry और disclosure vectors के साथ Household Context Profile | done (draft) |
| Registry और directory API, honest `registry.json` और `directory.json` | done (static) |
| Kitchens और production runs; supply signals | done (experimental) |
| Federation rules और relay vectors | done (draft) |
| protocol on और off के साथ चार simulators | done (illustrative) |
| English और Arabic में Website जिसमें हर stakeholder के लिए एक page, whitepaper और deck है | in progress |

## Next (लगभग एक वर्ष के भीतर, जैसे संसाधन अनुमति दें)

| Item | Status | Gate |
|---|---|---|
| operation envelopes की Food scientist द्वारा समीक्षा | planned | reviewer agrees |
| चार rule packs की Dietitian और food-safety officer द्वारा समीक्षा | planned | reviews filed; packs move to reviewed |
| household profile का Data-protection impact assessment | planned | reviewer agrees |
| एक food-bank pilot (12 weeks, pre-registered, independent evaluator) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| कई model families के लिए Agent-safety benchmark परिणाम | planned | runs published with method |
| npm पर `pip install cookwala` wheel और `@cookwala/sdk` | planned | packaging that bundles vocabularies and schemas |
| Registry service (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| reference hub के विरुद्ध Core API लागू करने वाला पहला device maker | planned | one maker agrees; conformance report published |
| पहले fifi.cooking collections का रूपांतरण | planned | founder decides rights per collection |
| device feedback से Core 0.3 | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Item | Status |
|---|---|
| एक वास्तविक उपकरण द्वारा Cookwala रेसिपी बनाना, बिना किसी संपादन के, वीडियो पर | अभी तक फंड नहीं मिला; एक डिवाइस पार्टनर की आवश्यकता है |
| एक स्वतंत्र certifier के साथ Certification योजना | नियोजित; कोई certifier नियुक्त नहीं किया गया है |
| specification, trademark और mark के लिए तटस्थ foundation | नियोजित |
| Contributor network: क्रेडिट के साथ वास्तविक रेसिपी की consented recordings | नियोजित |
| कार्यक्रमों और सहकारी समितियों द्वारा प्रकाशित Demand and supply signals | नियोजित, competition-law समीक्षा के बाद |
| "Cook in simulation" benchmark (Isaac Lab, Gazebo या MuJoCo) | नियोजित |
| Humanitarian Profile के लिए Digital Public Good मान्यता | नियोजित, pilot evidence के बाद |
| विश्व सिम्युलेटर में Cross-region relief flows; clean-cooking प्रभाव | नियोजित |

## हम क्या नहीं करेंगे

व्यक्तिगत डेटा एकत्र करें; बिना किसी विधि के नंबर प्रकाशित करें; सहमति से पहले किसी भागीदार का नाम लें;
ऐसी certification का दावा करें जो मौजूद नहीं है; किसी भी लेजर पर household data रखें; एक केंद्रीय
orchestrator बनाएं जिस पर रसोई निर्भर हों; भूख मिटाने का दावा करें।

## Kill and pivot rules

कार्य योजना से: यदि दो बाहरी समीक्षा दौर किसी डिवाइस निर्माता या पायलट partner को खोजने में विफल रहते हैं, तो Cookwala Humanitarian Profile और रेसिपी फॉर्मेट तक सीमित हो जाता है। यदि कोई पायलट 5 % से कम लाभ दिखाता है, तो किसी भी स्केलिंग से पहले परिणाम प्रकाशित किए जाते हैं और प्रोफाइल को फिर से डिज़ाइन किया जाता है।

