<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance और certification का मार्ग

**Status:** draft, 2026-10-04 (RFC-0008). अभी तक किसी certifier को नियुक्त नहीं किया गया है; यह वह पथ है जो मानक प्रदान करता है।

## 1. तीन चरण

| Step | Who | What it means | Shown as |
|---|---|---|---|
| **Self-declared** | निर्माता या प्रकाशक | सार्वजनिक टूल के साथ सार्वजनिक vectors चलाए और अपने स्वयं के key के साथ हस्ताक्षरित एक `ConformanceReport` (`schemas/conformance.schema.json`) प्रकाशित किया | रिपोर्ट, suites और counts के साथ; कभी भी badge नहीं |
| **Verified** | एक registry operator | उसी vector set hash के विरुद्ध run को पुनरुत्पादित किया और रिपोर्ट को counter-sign किया | रिपोर्ट और verifier |
| **Certified** | एक स्वतंत्र certifier (आज कोई मौजूद नहीं है) | एक प्रकाशित scheme के तहत suite के साथ-साथ hardware और safety-case जाँच की और mark प्रदान किया | रिपोर्ट, certifier, mark |

एक रिपोर्ट जो किसी वर्ग के किसी भी वेक्टर में विफल हो जाती है, वह उस वर्ग का दावा नहीं कर सकती है। registry रिपोर्ट दिखाती है, badges नहीं।

आज एकमात्र registry ऑपरेटर specification maintainer (cookwala.ai) है, इसलिए जब तक दूसरा registry मौजूद नहीं होता, "verified" कोई स्वतंत्रता नहीं जोड़ता; स्थिति अभी भी self-verification के रूप में दिखाई जाती है।

## 2. एक रिपोर्ट में क्या होता है

कोर संस्करण, क्लास जिसका दावा किया गया (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) या प्रोफाइल दावा (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), विषय (उत्पाद, विक्रेता, संस्करण), कुल योग और विफल
vector ids के साथ चलाए गए सूट्स, वेक्टर सेट का हैश, टूल और कमिट, दिनांक, स्थिति और
verifier। उदाहरण: `examples/conformance/report-reference.json`, जिसे द्वारा निर्मित किया गया

```bash
python tools/run_conformance.py --report report.json
```

## 3. Classes और वे क्या सिद्ध करते हैं

| Class | Vectors | certification के लिए भी आवश्यक (vectors द्वारा कवर नहीं किया गया) |
|---|---|---|
| Recipe publisher | hash, envelope (bands के अंदर के targets), units | एक food-safety professional द्वारा recipes की content review |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | डिवाइस का अपना safety case (ISO 13482, IEC 60335, UL 3300 यथा लागू); measured local stop latency; बिना network के enforced safety limits |
| Catalog | hash, signature, key revocation, recalls | key custody और incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | method के साथ model के अनुसार published results |
| Verifier | सभी Core suites | none |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; no personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name और version rules, tombstones | namespace proof process |

## 4. certification क्या वादा नहीं कर सकता

एक conformance रिपोर्ट यह सिद्ध करती है कि जिस दिन सॉफ्टवेयर चला, उस दिन उसने वैसा ही व्यवहार किया जैसा vectors की आवश्यकता है।
यह यह सिद्ध नहीं करती है कि कोई डिवाइस हर रसोई में सुरक्षित है, कि कोई रेसिपी सही स्वाद देती है, या कि
कोई नुकसान नहीं हो सकता। एक मानक जो शून्य नुकसान का वादा करता वह बेईमान होगा; यह वादा करता है
कि limits स्थानीय रूप से लागू की जाती हैं, कि refusals heat से पहले होते हैं, और कि रिकॉर्ड्स की
जाँच की जा सकती है।

## 5. मार्क का गवर्नेंस

प्रमाणन चिह्न (certification mark) और इसके नियम ट्रेडमार्क (`GOVERNANCE.md`) के साथ तटस्थ आधार (neutral foundation) में चले जाते हैं। तब तक कोई चिह्न मौजूद नहीं है; केवल रिपोर्ट होती हैं।

