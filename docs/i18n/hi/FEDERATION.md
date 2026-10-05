<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Federation: बिना किसी केंद्र के Cookwala कैसे काम करता है

**Status:** draft, 2026-10-04 (RFC-0006). संस्थापक की तस्वीर एक मधुमक्खी के छत्ते जैसी थी: कोई केंद्रीय कमांड नहीं, फिर भी सद्भाव और रिकवरी। यह पेज बताता है कि व्यवहार में इसका क्या अर्थ है।

## 1. नोड्स

| Node | यह क्या सेवा देता है | इसे कौन चलाता है |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | एक recipe publisher, एक food-bank network, एक university, एक device maker, cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs, collections, devices, packs, benchmarks के pointers | कोई भी; cookwala.ai एक चलाता है |
| **Hub** | एक kitchen के लिए Core API, local safety limits, household context | हर kitchen; offline काम करता है |
| **Mirror** | अन्य nodes की signed items को बिना बदले पुनः प्रकाशित करता है | कोई भी जो अपने region में resilience चाहता है |

एक static folder एक वैध catalog है। CSV templates वाला एक phone level H0 पर एक वैध humanitarian participant है।

## 2. फीड्स, कमांड्स नहीं

नोड्स हस्ताक्षरित फ़ीड प्रकाशित करते हैं: recalls, anonymous incidents, registry changes, key records.
अन्य नोड्स उन चीज़ों को पोल करते हैं जिन पर वे भरोसा करते हैं और उन्हें पुन: प्रकाशित कर सकते हैं। रसोई में कुछ भी पुश नहीं किया जाता है; एक kitchen तब खींचता है जब वह online होता है और जब वह नहीं होता है तब भी काम करना जारी रखता है।

## 3. जारीकर्ता के विरुद्ध सत्यापित करें, रिले के विरुद्ध नहीं

एक recall जो एक mirror के माध्यम से आता है, वह केवल **issuer's** हस्ताक्षर जितना ही अच्छा होता है। एक hub issuer के अपने discovery document या did:web से issuer का `KeyRecord` को resolve करता है और body को byte for byte verify करता है। mirror की key सामग्री के बारे में कुछ भी सिद्ध नहीं करती है; एक mirror जो recall को edit करता है वह signature को तोड़ देता है। `conformance/profiles/federation.json` में profile vectors तीन मामले दिखाते हैं।

## 4. Trust lists

प्रत्येक hub उन catalogs और registries की एक सूची रखता है जिन पर वह भरोसा करता है, उनकी keys और एक priority के साथ। एक node peers (`federation.peers`) का सुझाव दे सकता है; hub निर्णय लेता है। cookwala.ai ऐसी सूची में एक entry है, root नहीं।

## 5. Freshness

Registry entries एक status और एक publication time ले जाते हैं; recalls एक issue time ले जाते हैं; household facets एक validity ले जाते हैं। Stale items को re-fetch किया जाता है या drop कर दिया जाता है। कुछ भी इसलिए trust नहीं किया जाता क्योंकि वह पुराना है, कुछ भी चुपचाप delete नहीं किया जाता: withdrawn entries tombstones के रूप में रहती हैं।

## 6. इतिहास

साक्षी चेकपॉइंट्स (Core section 5) के साथ इवेंट लॉग्स बिना किसी blockchain के rewrites को पता लगाने योग्य बनाते हैं: एक दूसरा पक्ष लॉग के head पर counter-sign करता है, और एक later rewrite अब मेल नहीं खाता। चेकपॉइंट heads की Public anchoring वैकल्पिक है और यह एक founder decision है (`docs/research/BACKSTORY.md` section 4.7)।

## 7. तीन नोड्स जो आपस में काम करते हैं

- **एक food bank नेटवर्क** अपने रसोईघरों और दाताओं की एक registry, राष्ट्रीय कानून के अनुकूल अपने rule pack के एक कैटलॉग, और एक SMS गेटवे का संचालन करता है। यह cookwala.ai directory में खुद को सूचीबद्ध करता है या नहीं; इसके डेटा को कभी भी अपने देश से बाहर जाने की आवश्यकता नहीं होती है।
- **एक डिवाइस निर्माता** अपने क्षमता दस्तावेजों और safety-limit pack के एक कैटलॉग का संचालन करता है, conformance रिपोर्ट प्रकाशित करता है, और उन कैटलॉग के recall फीड का सर्वेक्षण करता है जिनका उसके ग्राहक उपयोग करते हैं।
- **एक विश्वविद्यालय प्रयोगशाला** बेंचमार्क रेसिपी और execution log (सहमति के साथ) के एक कैटलॉग का संचालन करती है, शब्दावलियों को मिरर करती है, और अपने स्वयं के वेक्टर प्रकाशित करती है।

उनमें से किसी को भी cookwala.ai के ऑनलाइन होने की आवश्यकता नहीं है।

## 8. क्या नहीं बनाया गया है

एक केंद्रीय ऑर्केस्ट्रेटर, एक केंद्रीय पहचान प्रदाता, एक टोकन, एक ब्लॉकचेन। मिशन प्रोफाइल के कोरम निर्णय और ऑर्केस्ट्रेटर वैकल्पिक और प्रयोगात्मक रहते हैं।

