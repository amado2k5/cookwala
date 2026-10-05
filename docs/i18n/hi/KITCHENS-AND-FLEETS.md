<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# रसोई और उत्पादन रन: रेस्तरां, समुदाय, स्कूल, आपदा और रोबोट रसोई

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Examples: `examples/fleet/`.

## 1. क्यों

संस्थापक ने एक रेस्तरां, एक शादी, एक दान अभियान या एक food factory (RFC-0005) में समान प्रोटोकॉल की मांग की। संक्षिप्त विवरण में school-meal programs और disaster kitchens को जोड़ा गया है। Core एक डिवाइस द्वारा एक recipe पकाने को कवर करता है; Humanitarian Profile surplus को स्थानांतरित करने और meals की गिनती करने को कवर करता है। उनके बीच **kitchen** स्थित है: stations, devices, लोग, कई batches, एक serve window, critical control points, और एक device के execution log से उन meals तक का लिंक जो एक program रिपोर्ट करता है।

## 2. दस्तावेज़

| Document | यह क्या कहता है |
|---|---|
| `Kitchen` | एक संगठन की kitchen: प्रकार, stations (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), capability references के रूप में devices, meals per hour में capacity, hot-hold और cooling equipment, लागू rule packs, भूमिका के अनुसार staff **counts**, operating hours |
| `ProductionRun` | batch counts और servings के साथ Recipes, एक serve window, प्रत्येक recipe step के लिए एक station और एक `device`, एक `person` या `either` को assignments, critical control point records (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), उत्पादित Core executions, और एक outcome (उत्पादित और परोसे गए meals, waste, उपयोग किया गया rescued food, failures, incidents, energy, cost, इसके द्वारा उत्सर्जित Humanitarian `Distribution`) |
| `StationLease` | एक समय के लिए किसी device या role द्वारा एक station का exclusive use |

## 3. यह बाकी के साथ कैसे जुड़ता है

- एक `device` को सौंपा गया एक step एक Core `ExecuteRequest` (या ROS 2 binding के माध्यम से एक `ExecuteNode` लक्ष्य) है; इसका `ExecutionLog` hash `executions` में जाता है।
- एक run जो एक program की सेवा करता है वह एक Humanitarian `Distribution` जारी करता है; run के `ccps` distribution के safety findings के पीछे का evidence हैं।
- Humanitarian Profile से rule packs run के menu और items पर लागू होते हैं।
- Fleet dispatch (कौन सा robot कहाँ जाएगा) Open-RMF या किसी vendor के fleet manager का हिस्सा है, इस profile का नहीं।

## 4. हल किया गया उदाहरण

`examples/fleet/kitchen-disaster.json` और `production-run-disaster.json`: एक राहत रसोई
दो गैस केतली, hot-hold units और एक ice bath के साथ दो घंटे की विंडो के लिए 710 दाल के सूप और
चावल के भोजन का उत्पादन करती है, cook और hot-hold तापमान रिकॉर्ड करती है, एक hot-hold unit को
60 °C से नीचे पाती है और परोसने से पहले उस बैच को फिर से गर्म करती है, और एक वितरण जारी करती है। यह उदाहरण
केवल सांकेतिक है; किसी वास्तविक रसोई या घटना का वर्णन नहीं किया गया है।

## 5. क्या जानबूझकर छोड़ दिया गया है

कर्मचारियों के नाम और शेड्यूल, मजदूरी, ग्राहकों के ऑर्डर और भुगतान, मेनू मूल्य निर्धारण। कर्मचारी भूमिका के अनुसार संख्या के रूप में दिखाई देते हैं ताकि किसी की पहचान किए बिना प्रति भोजन लागत की गणना की जा सके।

## 6. Next

एक रोबोट स्टेशन के साथ रेस्टोरेंट सेवा उदाहरण; रन स्टेट मशीन के लिए एक conformance सुइट; `StationLease` का सत्र लीज (`session.schema.json`) के साथ एकीकरण।

