<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Cookwala Humanitarian Profile (draft 0.2)

**Status:** food banks, relief programs और food-safety and nutrition professionals द्वारा समीक्षा के लिए draft है। इसकी समीक्षा या समर्थन WFP, WHO, FAO, Global FoodBanking Network या यहाँ नामित किसी अन्य संगठन द्वारा नहीं किया गया है।

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (सभी), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; सभी drafts पेशेवर समीक्षा की प्रतीक्षा में हैं, देखें [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (Cairo में food bank, school meals, disaster kitchen, robot kitchen), प्रत्येक के साथ एक computed `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet और SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 क्या जोड़ता है (RFC-0003, RFC-0004)

0.1 से अधिक का योज्य (Additive); पाठक दोनों को स्वीकार करते हैं।

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) और `Item.harvestedAt`; भूमिकाएँ `farm`, `caterer`, `robot_kitchen`; SMS शब्द `FARM`।
- **Care rules:** `Item.foodClasses` और `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), नियम प्रकार `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; तीन नए draft packs।
- **Reviews:** `RulePack.reviews` प्रत्येक review के profession, organization, date, scope और outcome को रिकॉर्ड करता है; `status: reviewed` के लिए एक approved review की आवश्यकता होती है।
- **Impact:** नौ measures के साथ `ImpactSummary`, प्रत्येक में `method` (measured, modelled, assumed, not recorded) होता है, जिसकी गणना `tools/humanitarian_check.py --summary` द्वारा की जाती है।
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` ताकि बचाए गए किलोग्राम एक ही बार गिने जाएँ।
- **Program types** `Manifest` पर।

## 1. उद्देश्य

Cookwala का एक छोटा, सख्त, व्यक्तिगत-डेटा-मुक्त हिस्सा उन संगठनों के लिए जो लोगों को भोजन कराते हैं:
food banks, सामुदायिक रसोई, स्कूल-भोजन कार्यक्रम, राहत कार्यक्रम, दाता (किराना स्टोर,
रेस्तरां, खेत, कैटरर्स), ट्रांसपोर्टर और कोल्ड स्टोर। यह चार कार्यों को कवर करता है:

1. **surplus food की पेशकश करना** और उसका दावा करना, तेज़ी से और निष्पक्ष रूप से।
2. **प्रत्येक हैंडओवर** की रिकॉर्डिंग करना, तापमान जांच (cold-chain check) के साथ।
3. **क्या परोसा गया इसकी रिपोर्टिंग** केवल aggregate counts के रूप में करना।
4. **मेन्यू और हैंडओवर की जांच करना** मशीन-पठनीय पोषण और खाद्य-सुरक्षा नियमों के विरुद्ध।

**यह रोबोट, ऐप्स या इंटरनेट के बिना काम करता है।** स्तर H0 और H1 स्प्रेडशीट्स, SMS और बेसिक फोन पर चलते हैं। रोबोट, hubs और agents उन्हीं दस्तावेजों के वैकल्पिक उपभोक्ता हैं।

## 2. सिद्धांत

- **कोई नुकसान न पहुँचाएँ।** ऐसी कोई भी चीज़ एकत्र न करें जिससे किसी व्यक्ति या household की पहचान, स्थान या प्रोफाइलिंग की जा सके। संवेदनशील परिवेश में, लाभार्थियों के बारे में डेटा एक सुरक्षा जोखिम है।
- **मानवीय सिद्धांत** (मानवता, तटस्थता, निष्पक्षता, स्वतंत्रता): सहायता पर कोई व्यावसायिक ब्रांडिंग नहीं, और मार्केटिंग के लिए डेटा का कोई उपयोग नहीं।
- **सख्त और छोटा।** प्रत्येक ऑब्जेक्ट अज्ञात फ़ील्ड्स को अस्वीकार कर देता है (सिवाय `x-` extensions के), इसलिए टाइपो और अतिरिक्त व्यक्तिगत फ़ील्ड्स वैलिडेशन में विफल हो जाते हैं।
- **सटीक इकाइयाँ:** किलोग्राम, डिग्री Celsius, पूर्ण सहनशीलता (absolute tolerances), और पैसा दशमलव स्ट्रिंग्स के रूप में।
- **स्थानीय नियम जीतते हैं।** Rule packs को राष्ट्रीय खाद्य-सुरक्षा और दान कानून द्वारा बदला जा सकता है।
- **खुला:** रॉयल्टी-मुक्त विनिर्देश, ओपन-सोर्स उपकरण। प्रोफाइल को Digital Public Goods Standard और Principles for Digital Development को पूरा करने के लिए डिज़ाइन किया गया है।

## 3. Conformance स्तर

| स्तर | एक प्रतिभागी क्या करता है | आवश्यकताएं |
|---|---|---|
| **H0 — Paper & SMS** | CSV templates (HXL hashtag rows के साथ) में या SMS (section 8.3) द्वारा प्रस्तावों, हैंडओवर और वितरणों को रिकॉर्ड करता है | एक spreadsheet या एक बुनियादी फोन |
| **H1 — Rescue** | API के माध्यम से `Offer`, `Claim`, `Handover` और `Distribution` दस्तावेजों का आदान-प्रदान करता है; state machine (section 5) का पालन करता है | कोई भी HTTP client |
| **H2 — Safety & nutrition** | प्रत्येक handover और menu पर `RulePack` लागू करता है, और `findings` रिकॉर्ड करता है | reference checker या उसके समकक्ष |
| **H3 — Interoperability** | aggregates को HXL, DHIS2 और मुख्य Cookwala `ImpactReport` में निर्यात करता है; GS1 identifiers का उपयोग करता है | Integration work |

एक प्रतिभागी `/.well-known/cookwala-humanitarian.json` पर एक `Manifest` प्रकाशित करता है जो अपने levels, rule packs, endpoints और `personalData: "none"` घोषित करता है।

## 4. दस्तावेज़ (Documents)

| दस्तावेज़ | कौन लिखता है | उद्देश्य |
|---|---|---|
| `Offer` | दाता | संग्रह के लिए उपलब्ध surplus भोजन: वस्तुएं (kg, भंडारण, तिथि चिह्न, एलर्जेन), विंडो, साइट, तापमान |
| `Claim` | food bank, रसोई, कार्यक्रम | एक offer के सभी या कुछ हिस्सों का दावा, pickup समय और वाहन प्रकार के साथ |
| `Handover` | कस्टडी प्राप्तकर्ता | प्रत्येक leg के लिए एक: तापमान, कारण कोड के साथ स्वीकार या अस्वीकार किए गए kg, और rule निष्कर्ष |
| `Distribution` | रसोई, food bank, स्कूल | एक दिन में एक साइट पर परोसे गए भोजन और लोगों का कुल योग; वैकल्पिक मेनू पोषक तत्व और लागत |
| `RulePack` | कार्यक्रम या प्राधिकरण | versioned पोषण और खाद्य-सुरक्षा नियम (अनुभाग 6) |
| `Manifest` | प्रत्येक प्रतिभागी | क्षमताएं और डेटा-संरक्षण घोषणा |

मुख्य Cookwala राहत दस्तावेज़ (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) योजना के लिए उपलब्ध रहते हैं। यह प्रोफ़ाइल
operational flow को संभालता है।

## 5. Offer lifecycle

| From | Allowed next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**state changes के लिए नियम:**

- प्रत्येक परिवर्तन `version` को बढ़ाता है। लेखक `If-Match: <version>` भेजते हैं; बेमेल होने पर **409** वापस मिलता है, और लेखक फिर से पढ़ता है और पुनः प्रयास करता है।
- एक अवैध ट्रांज़िशन अनुमत ट्रांज़िशन के साथ **409** वापस करता है।
- ऑफर्स `window.to` पर स्वचालित रूप से `expired` में चले जाते हैं।
- क्लेम्स `pickupBy` और प्रोग्राम द्वारा निर्धारित ग्रेस पीरियड (डिफ़ॉल्ट 30 minutes) के बाद समाप्त हो जाते हैं।

**निष्पक्ष दावा।** डिफ़ॉल्ट रूप से, दावे कार्यक्रम द्वारा निर्धारित प्राथमिकता टियर के भीतर पहले आओ-पहले पाओ के आधार पर होते हैं:
उदाहरण के लिए, पहले बच्चों को सेवा देने वाली रसोई, फिर अन्य रसोई, फिर food banks। टियर और
किसी भी रोटेशन नियम को कार्यक्रम के `Manifest` या वेबसाइट में प्रकाशित किया जाना चाहिए।

## 6. खाद्य सुरक्षा और पोषण rule packs

एक `RulePack` छह प्रकार के नियमों को रखता है:

- `temperature`: chilled ≤ 5 °C, hot-held ≥ 60 °C, frozen ≤ −18 °C;
- `time`: पका हुआ भोजन अधिकतम 2 h के लिए तापमान नियंत्रण से बाहर;
- `date_mark`: use-by blocks, best-before warns;
- `allergen`: undeclared allergens block;
- `nutrient`: प्रति person-day या प्रति meal मात्रा;
- `energy_share`: free sugars, fat, saturated fat, trans fat या protein से ऊर्जा का हिस्सा।

प्रत्येक rule या तो `block` (स्वीकार न करें या सेवा न दें) है या `warn` (अनुमत, एक finding के रूप में दर्ज) है।

डिफ़ॉल्ट पैक `who-codex-basic@0.1.0` एक **सार्वजनिक मार्गदर्शन से प्राप्त ड्राफ्ट है**: WHO का
healthy-diet, sodium, sugars और fats मार्गदर्शन, WHO के Five Keys to Safer Food, Codex
labelling और frozen-food कोड, और Sphere के minimum ration planning आंकड़े। यह
सरलीकृत है, कोई चिकित्सा सलाह नहीं है, इसमें शिशु और चिकित्सीय आहार (therapeutic feeding) शामिल नहीं है, और इसे योग्य कर्मचारियों द्वारा समीक्षा की जानी चाहिए। कार्यक्रमों को इसे कॉपी और अनुकूलित करना चाहिए, `jurisdiction` सेट करना चाहिए, और `reviewedBy` में रिकॉर्ड करना चाहिए कि इसकी समीक्षा किसने की।

लेवल H2 पर रिसीवर्स हर हैंडओवर और हर मेनू पर पैक चलाते हैं, और `findings` में rule ids रिकॉर्ड करते हैं। रेफरेंस चेकर रिपोर्ट करता है कि कहाँ घोषित और कंप्यूटेड findings में असहमति है।

## 7. डेटा संरक्षण

**प्रोफ़ाइल में कोई व्यक्तिगत डेटा नहीं है। दस्तावेज़ों में यह नहीं होना चाहिए:**

- किसी भी व्यक्ति के नाम, फ़ोन नंबर, ईमेल, या राष्ट्रीय, शरणार्थी या बायोमेट्रिक पहचानकर्ता;
- household-level रिकॉर्ड, या घरों या व्यक्तियों के स्थान;
- किसी भी व्यक्ति का स्वास्थ्य, विकलांगता, धर्म या राष्ट्रीयता।

**इसके बजाय यह क्या ले जाता है:**

- **केवल संगठन।** प्रत्येक पक्ष एक संगठन है जिसे `did:web`, एक GS1
  Global Location Number (GLN) या एक registry id द्वारा पहचाना जाता है। लोग केवल भूमिकाओं के रूप में दिखाई देते हैं
  (`checkedBy: "trained_staff"`).
- **केवल समुच्चय।** `Distribution.people` समूह के अनुसार गणना रखता है, और 10 से कम की कोई भी गणना
  `"<10"` के रूप में रिपोर्ट की जाती है।
- **केवल साइटें।** एक `Site` किसी संगठन का परिसर या एक प्रशासनिक क्षेत्र
  (OCHA P-codes) है, कभी भी household नहीं।
- **संक्षिप्त नोट्स।** मुक्त पाठ 280-कैरेक्टर के परिचालन नोट्स तक सीमित है और इसमें
  व्यक्तिगत डेटा नहीं होना चाहिए। कार्यान्वयन को उन्हें संग्रहीत करने से पहले फोन नंबरों और ids के लिए नोट्स को स्कैन करना चाहिए।

**Retention and audit:**

- **Retention:** प्रत्येक प्रतिभागी अपने `Manifest` में `retentionDays` घोषित करता है और उसके बाद दस्तावेज़ों को हटा देता है।
- **Audit (optional, `hash_only`):** प्रति प्रोग्राम एक sequencer (सामान्यतः food bank या program operator) प्रत्येक दस्तावेज़ के RFC 8785 canonical JSON का SHA-256 hash जोड़ता है। सामग्री अलग से संग्रहीत की जाती है और हटाने योग्य रहती है। एक भागीदार संगठन प्रत्येक दिन एक checkpoint पर counter-signs करता है, ताकि इतिहास को चुपचाप फिर से नहीं लिखा जा सके। एक एकल sequencer श्रृंखला में forks से बचाता है।
- **Hosting** उसी देश में होनी चाहिए जहाँ कानून या प्रोग्राम इसकी आवश्यकता करता है।

## 8. परिवहन

### 8.1 API (स्तर H1)

| विधि | पथ | नोट्स |
|---|---|---|
| `POST` | `/offers` | एक offer बनाता है (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | एक receiver के पास खुले offers |
| `POST` | `/offers/{id}/claims` | एक offer का claim करता है; `If-Match` आवश्यक है; पहले से claim होने पर 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` आवश्यक है |
| `POST` | `/handovers` | एक handover रिकॉर्ड करता है |
| `POST` | `/distributions` | एक distribution रिकॉर्ड करता है |
| `GET` | `/reports?from=…&to=…` | एक अवधि के लिए aggregates |

अनुरोध और परिवहन नियम:

- **Idempotency:** प्रत्येक `POST` में एक `Idempotency-Key` होती है। सर्वर कम से कम 24 h के लिए कुंजियाँ (keys) रखते हैं और दोहराव के लिए मूल प्रतिक्रिया (original response) वापस करते हैं।
- **Authentication:** OAuth 2.1 क्लाइंट क्रेडेंशियल, प्रति संगठन एक क्लाइंट।
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  कम से कम एक बार डिलीवर किए जाते हैं, जिसमें डिडुप्लिकेशन (deduplication) के लिए एक इवेंट `id` और क्रमबद्धता (ordering) के लिए प्रति-ऑफर सीक्वेंस नंबर होता है।

### 8.2 स्प्रेडशीट्स (level H0)

`profiles/humanitarian/templates/` में CSV templates का उपयोग करें। उनकी दूसरी पंक्ति में
[HXL](https://hxlstandard.org) hashtags होते हैं, ताकि humanitarian data tools उन्हें सीधे पढ़ सकें।

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

व्याकरण `tools/cookwala_ref.py` (`parse_sms`) में लागू किया गया है और `conformance/profiles/sms.json` द्वारा परीक्षण किया गया है। कीवर्ड अंग्रेजी हैं; जहाँ भी अंक है वहाँ अरबी-इंडिक (٠-٩) और फारसी (۰-۹) अंक स्वीकार किए जाते हैं, इसलिए किसी भी कीबोर्ड पर सेट फोन काम करता है।

स्टोरेज कोड: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. दिनांक चिह्न: `UB` use-by,
`BB` best-before, `HV` harvested, `DDMM` के रूप में। रिजेक्शन कारण कोड: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; कोई भी अन्य शब्द `other` के रूप में रिकॉर्ड किया जाता है। `HELP`
जवाब प्रत्येक कमांड के लिए एक उदाहरण, plain ASCII, 160 वर्णों से कम होना चाहिए।

एक गेटवे को दस्तावेज़ लिखने से पहले इन जाँचों को लागू करना चाहिए (`sms_storage_findings` संदर्भ में; ids ब्लॉक findings हैं):

| Finding | When |
|---|---|
| `safety.temp_not_recorded` | एक ठंडी, जमी हुई या गर्म-रखी (hot-held) लाइन पर `HAND` में कोई `T` रीडिंग नहीं है: इसके लिए पूछते हुए उत्तर दें, कुछ भी न लिखें |
| `safety.hot_hold_min` | 60 °C से नीचे भंडारण `H` के साथ एक `OFFER`: इसे सूचीबद्ध करने से मना करें |
| `safety.storage_class_mismatch` | आइटम के शब्द डेयरी, मांस, पोल्ट्री, मछली, अंडा या पका हुआ भोजन होने का संकेत देते हैं और भंडारण `A` है: इसे सूचीबद्ध करने से मना करें |
| `safety.chilled_max`, `safety.frozen_max` | ऑफर या हैंडओवर पर 5 °C से ऊपर या −18 °C से ऊपर की रीडिंग |

गर्म-रखे भोजन (hot-held food) के प्रस्ताव दो घंटे बाद बंद हो जाते हैं (पके हुए चावल के लिए एक घंटा); एक gateway कभी भी placeholder रीडिंग स्टोर नहीं करता है। gateway प्रेषक के पंजीकृत नंबर को एक संगठन से मैप करता है, दस्तावेजों में कभी भी किसी व्यक्ति से नहीं।

## 9. Interoperability

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | `Distribution` से प्रति साइट और अवधि के Aggregate data values (meals, group के अनुसार people, kg, incidents) |
| WFP SCOPE और अन्य beneficiary systems | **केवल Aggregates.** कोई भी beneficiary records इस profile में न तो प्रवेश करते हैं और न ही बाहर जाते हैं |
| Food-rescue apps | Adapters उनकी listings को `Offer` और उनके pickups को `Claim` और `Handover` से मैप करते हैं |
| Core Cookwala | `Item.ingredientId` और `menu.recipes` recipe index से लिंक करते हैं; `relief.ImpactReport` `Distribution`s का योग करता है |

## 10. पायलट मेट्रिक्स (इस तरह परिभाषित ताकि साइटों की तुलना की जा सके)

`python tools/humanitarian_check.py --summary DIR` द्वारा एक `ImpactSummary` में संगणित। एक pilot कैसे चलाया और आंका जाता है: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metric | Definition |
|---|---|
| Kg rescued | दाताओं से पहले चरण में `Handover.kgAccepted` का योग |
| Claim rate | `claimed` तक पहुँचने वाले ऑफर्स ÷ बनाए गए ऑफर्स |
| Time to claim | `Offer` निर्माण से `claimed` स्थिति तक के औसत मिनट |
| Rejection by reason | `reason` द्वारा `kgRejected` का योग |
| Meals served | `Distribution.meals` का योग |
| Nutrition pass rate | मेनू वाले वितरण और कोई `nutrition.*` निष्कर्ष नहीं ÷ मेनू वाले वितरण |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | `safety.*` ब्लॉक निष्कर्षों की संख्या, और `safetyIncidents` |

## 11. सुरक्षा

- **H1 पर Signatures optional हैं** और H3 पर cross-organization audit के लिए आवश्यक हैं
  (EdDSA, keys organization के `did:web` पर प्रकाशित हैं)।
- **दस्तावेजों में Notes और names untrusted data हैं।** Software और AI agents को उन्हें कभी भी
  instructions के रूप में नहीं मानना चाहिए।
- **Rule packs versioned और pinned हैं** (`id@version`) हर finding में, ताकि परिणाम
  reproducible हों।

## 12. जानबूझकर छोड़ दिया गया

- लाभार्थी पंजीकरण, पात्रता और लक्ष्यीकरण (ये कार्यक्रम के अपने संरक्षित प्रणालियों से संबंधित हैं)।
-भुगतान: Cookwala कभी भी पैसा नहीं भेजता है।
-रेसिपी और रोबोट निष्पादन (मुख्य विनिर्देश)। प्रोफाइल केवल रेसिपी का नाम बताती है और पोषक तत्वों की रिपोर्ट करती है।
-चिकित्सा और चिकित्सीय पोषण।

## 13. समीक्षा कैसे करें

कृपया [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) पर `humanitarian` लेबल के साथ issues खोलें। ये समीक्षाएं सबसे उपयोगी हैं:

- food-safety staff rule pack और reject reasons की जाँच कर रहे हैं;
- food-bank operators lifecycle और SMS flow की जाँच कर रहे हैं;
- data-protection officers section 7 की जाँच कर रहे हैं।

