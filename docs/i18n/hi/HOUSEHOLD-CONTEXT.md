<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Cookwala Core का हिस्सा नहीं है। Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types)।
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. क्यों

एक रोबोट जो एक परिवार की अच्छी सेवा करता है, उसे बहुत कुछ जानने की आवश्यकता होती है: उपकरण और उनकी विशेषताएँ, वहाँ कौन रहता है और वे कब घर पर होते हैं, पालतू जानवर, बच्चे, आहार, एलर्जी, दवा का समय, रीति-रिवाज, बजट, खरीदारी की आदतें, पिछली बार क्या गलत हुआ था। यही तथ्य एक चोरी की योजना और एक प्रोफाइलिंग टूल भी हैं। यह प्रोफाइल **planner at home** को पूरी तस्वीर देता है और बाकी सभी को केवल एक **constraint** देता है।

## 2. तीन विचार

1. **Facets.** प्रत्येक के लिए एक टाइप किया गया तथ्य (`cw.facet.household.health.allergies`), जिसके साथ यह जानकारी हो कि किसने इसे प्रमाणित किया (declared, observed, reported, inferred), कब, कितनी अवधि के लिए, कितना विश्वसनीय, और एक गोपनीयता वर्ग (`public`, `household`, `sensitive`, `secret`)।
2. **registry में travel rules.** प्रत्येक facet type यह बताता है कि क्या उसका raw value घर से बाहर जा सकता है: `never` (45 types: children, absences, layouts, health conditions, religion, behaviour, incidents, income posture), केवल एक `derived` constraint के रूप में (81 types), या एक स्पष्ट अनुमति के बाद `consented` प्रकटीकरण के रूप में (13 types, अधिकतर maker के लिए device self-state)।
3. **Derived constraints.** एकमात्र household object जो एक grocer, planner, delivery service, device maker या कोई अन्य robot कभी प्राप्त करता है: "deliver 17:00–18:00 to the front door", "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per meal"। प्रत्येक उन facet **types** का नाम बताता है जिनसे वह आया है, उनके values का नहीं।

## 3. किसे क्या मिलता है

| प्राप्तकर्ता की भूमिका | प्राप्त कर सकता है |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI या सॉफ़्टवेयर जो भोजन की योजना बनाता है) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; consent द्वारा device self-state facets |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | केवल device fault summary (श्रेणी के अनुसार faults की संख्या, कोई समय नहीं, कोई household facts नहीं), और केवल तभी जब household ने किसी insurer को प्राप्तकर्ता के रूप में नामित किया हो; RFC-0001 इसे उस भूमिका के रूप में सूचीबद्ध करता है जिसे privacy review के विरोध करने पर हटाए जाने की सबसे अधिक संभावना है |
| program (food bank, school) | कुछ नहीं |
| dataset | कुछ नहीं |

## 4. Rules

- Raw facets कभी भी डिवाइस नहीं छोड़ते हैं। ऐसा कोई API नहीं है जो उन्हें होम नेटवर्क के बाहर किसी को भी वापस देता हो।
- `inferred` facets का उपयोग कभी भी सुरक्षा निर्णयों के लिए नहीं किया जाता है।
- किसी भी व्यक्ति का कोई व्यवहारिक स्कोर (behavioural score) उत्पन्न या संग्रहीत नहीं किया जाता है। Behaviour facets household की सेवा करने के लिए (portion sizes, कब सफाई करनी है) मौजूद हैं और कभी यात्रा नहीं करते हैं।
- Economic level एक **owner-set budget posture** है, जिसे कभी भी किसी चीज़ से inferred नहीं किया जाता है।
- बच्चों का डेटा और अनुपस्थिति `secret` है और कभी यात्रा नहीं करती है, यहाँ तक कि derived भी नहीं, सिवाय movement और safe-zone constraints के जो कोई शेड्यूल प्रकट नहीं करते हैं।
- प्रत्येक facet मिटाया जा सकने योग्य है। Erasure household के window के भीतर पूरा होता है (डिफ़ॉल्ट 7 दिन, अधिकतम 30) और बिना सामग्री के log किया जाता है।
- एक privacy class को registry default से ऊपर बढ़ाया जा सकता है, कभी कम नहीं किया जा सकता।

## 5. स्थानीय घटना स्मृति (local incident memory)

RFC-0001 पूछता है कि रोबोट अलार्म, संघर्षों, हार मानने और सीखों के बारे में क्या याद रखता है। `LocalIncident` इसे रखता है: तिथि, `vocab/incidents.json` से श्रेणी, प्रकार के अनुसार कौन शामिल था, एक नोट और एक सीख। यह घर कभी नहीं छोड़ता है। Core में सार्वजनिक, गुमनाम `IncidentReport` एक अलग दस्तावेज़ है जिससे हर निर्माता सीखता है।

## 6. Conformance

प्रोफ़ाइल वेक्टर्स (`conformance/profiles/disclosure_policy.json`) facets और एक प्राप्तकर्ता भूमिका देते हैं और सटीक constraint types, disclosed ids और कारणों के साथ withheld ids की अपेक्षा करते हैं। संदर्भ कार्यान्वयन `tools/cookwala_ref.py` में `derive_constraints()` है।

## 7. अन्य दस्तावेजों से संबंध

`ClientProfile`, `KitchenProfile` और `RobotProfile` (`profile.schema.json`) सुविधाजनक बंडलों के रूप में बने रहते हैं। मिशन facets (`mission.schema.json`) उन्हीं registry ids का उपयोग करते हैं। Core `AgentMandate` एक agent क्या कर सकता है, इसका normative statement बना रहता है; mandate facets स्थानीय रूप से household के rules का वर्णन करते हैं।

## 8. खुले प्रश्न

RFC-0001 देखें: closed recipient roles; raise-only privacy; एक reviewer के साथ data-protection impact assessment।

