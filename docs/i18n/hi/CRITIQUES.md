<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# हमारी प्रकाशित समीक्षाएं

हमने Cookwala के बारे में कठिन प्रश्न पूछे और उनके उत्तर लिखे। प्रत्येक चिंता का एक id [action plan's concern register](ACTION-PLAN.md#2-concern-register) में है, साथ ही हमारी प्रतिक्रिया और उसकी स्थिति भी है। बाहरी समीक्षाओं का स्वागत है और उन्हें यहाँ सूचीबद्ध किया जाएगा।

## क्या यह काम करने वाला है? (strategy)

| चिंता | संक्षिप्त उत्तर | स्थिति |
|---|---|---|
| बाजार अभी मौजूद नहीं है; spec उत्पादों से आगे है | Small Core, पहले demo, उपयोगकर्ताओं के बिना कोई नया spec नहीं | Core 0.2 पूरा; device demo next |
| किसी भी शक्तिशाली व्यक्ति के पास अपनाने का कोई कारण नहीं है | प्रत्येक adopter के लाभ के साथ नेतृत्व करें; robots के बिना उपयोगी | Food-bank pilot और device partner की तलाश जारी है |
| simulators वही सिद्ध करते हैं जो वे assume करते हैं | उचित baseline, ranges, "illustrative" labels; pilots उनकी जगह लेंगे | Open |
| भूख गरीबी और संघर्ष के बारे में है, surplus के बारे में नहीं | Cookwala योगदान देता है; यह अकेले भूख समाप्त करने का दावा नहीं करता है | Message बदला गया |
| सुरक्षा, दायित्व और attack surface | device पर सीमाएं लागू; refusal; recalls; incident reports | Spec पूरा; certifier review open |
| गोपनीयता (स्वास्थ्य और धर्म डेटा, ledgers बनाम erasure) | Local-first, selective disclosure, hash-only logs, सहमति | Spec पूरा; impact assessment open |
| बहुत जटिल | Core 0.2; बाकी सब experimental चिह्नित | Done |
| संस्थापक पर निर्भरता | एक तटस्थ घर की ओर governance पथ | GOVERNANCE.md |

## क्या तकनीकी डिज़ाइन सुदृढ़ है?

| चिंता | Core 0.2 में क्या बदला |
|---|---|
| Operations का कोई भौतिक अर्थ नहीं था | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| Unit और number बग्स | °C केवल, absolute tolerances, kitchen units, densities, decimal money |
| Schemas ने typos स्वीकार किए | `x-` extensions के साथ strict schemas; offline bundle |
| एक mutable Mission document | Event log + projection, single sequencer, transitions table |
| Ledger ने बहुत कम सिद्ध किया | revocation के साथ Key records, witnessed checkpoints, rewrite detection |
| Undefined event delivery; bus पर safety | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces drift | Core OpenAPI; CI में हर reference की जाँच की गई |
| No verifier | Reference library और 106 conformance vectors |

## समीक्षाएं जिनकी हम मांग कर रहे हैं

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), food scientists
(envelopes), food-safety officers and dietitians (rule packs), a security audit, a
data-protection review, and a certifier's gap analysis. देखें
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

