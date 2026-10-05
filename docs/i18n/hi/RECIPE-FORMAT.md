<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala रेसिपी फॉर्मेट: रेसिपी जो Missions के साथ काम करती हैं

Cookwala में एक रेसिपी निर्देशों की सूची नहीं है। यह **पोर्टेबल कुकिंग नॉलेज** है
जिसे एक प्लानर एक विशिष्ट मिशन (household, robots, appliances,
energy, budget, health, timing) के विरुद्ध *compile* करता है ताकि एक निष्पादन योग्य योजना बनाई जा सके। फिर रोबोट उस योजना को चलाता है, और जब वास्तविकता बदलती है तो आकस्मिकताओं और प्लेबुक्स के माध्यम से अनुकूलित होता है।

स्कीमा: [`recipe.schema.json`](../schemas/recipe.schema.json). पूर्ण कार्य किया गया उदाहरण:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. चार परतें (WHO SMART Guidelines दृष्टिकोण से अनुकूलित)

| Layer | इसमें क्या होता है | इसे कौन लिखता है | यह कहाँ रहता है |
|---|---|---|---|
| **R1 Narrative** | मानव रेसिपी टेक्स्ट, कहानी, सांस्कृतिक नोट्स, फोटो | Cooks, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | व्यंजन *क्या है* और *क्या होना चाहिए*: identity (essential बनाम flexible), sensory targets, पोषण, परोसने और खाने की शैली, भंडारण, acceptance checks | Recipe editors, AI-assisted, reviewed | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | डिवाइस-अज्ञेयवादी विधि: formula (ratios + roles), typed ops का process graph जिसमें food-state pre/post conditions, `until` conditions, विकल्प, pause rules, failure modes, affordances, hazards, CCPs, पर्यावरण की तैयारी | Export pipeline + review; simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | *इस* Mission के लिए संकलित R3 रेसिपी: सटीक मात्रा, चुने हुए variants, सौंपे गए actors और devices, शेड्यूल, leases, monitors, contingencies | The planner/compiler, run time पर | **Mission** (`plan`) के अंदर, कभी भी catalog में नहीं |

सोर्स कोड और एक कंपाइलर की तरह: **रेसिपी एक पोर्टेबल इंटरमीडिएट रिप्रेजेंटेशन (R3 + R2) है। मिशन टारगेट मशीन है।** यही चीज़ रेसिपी को वैध बनाए रखती है क्योंकि रोबोट और AI बदलते रहते हैं: एक बेहतर प्लानर उसी रेसिपी से एक बेहतर R4 तैयार करता है।

## 2. एक Mission में प्रत्येक अनुभाग क्या करता है

| रेसिपी सेक्शन | मिशन द्वारा उपयोग किया जाता है… |
|---|---|
| `identity.essential / flexible / neverAdd` | प्रतिस्थापन (Substitutions), बजट और राशन मोड, आहार अनुकूलन: flexible भागों को बदलें, essentials को कभी नहीं, ताकि व्यंजन अभी भी वही रहे |
| `formula` (ratios, min/max, role, scaling) | किसी भी संख्या में लोगों के लिए सटीक scaling, एक सप्ताह में सामग्री का राशनिंग, बजट का विस्तार, जो पास में है उसका उपयोग करना (limiting-ingredient rescale) |
| `sensory` | दृष्टि, सुगंध और स्वाद चेकपॉइंट; household taste profiles (salt 2 vs 4); repurpose और fix निर्णय |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Environment preparation tasks:** यदि सिंक या hob व्यस्त है, तो planner "clear, wash, dry" कार्य जोड़ता है; soak या thaw कार्य घंटों पहले निर्धारित किए जाते हैं |
| `process.nodes[]` `pre`/`post` खाद्य अवस्थाओं के साथ | योजना बनाना (केवल वही शुरू करें जो तैयार है), सत्यापन (क्या चरण ने वह अवस्था उत्पन्न की?), व्यवधानों के बाद resume करना |
| `until`, `onTimeout`, `retry` | यह जानना कि कब एक चरण पूरा हो गया है और जब वह नहीं होता है तो क्या करना है |
| `alternatives[]` + `energy` | Gas बनाम induction बनाम oven, battery saver, no-oven रसोई, quiet hours |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruptions:** एक बच्चे को मदद चाहिए, मालिक बुलाता है, कुत्ता कुछ गिरा देता है। रोबोट चरण को उसकी safe state में डालता है, घटना को संभालता है, फिर pause budget के आधार पर resume, reheat, salvage या discard करता है |
| `failureModes` (incident, detect, prevent, playbook) | ज्ञात समस्याओं का शीघ्र पता लगाना और रिकवर करने के लिए सटीक playbook |
| `affordances`, `space` | उन रोबोटों के साथ चरणों का मिलान जो पकड़ सकते हैं, उठा सकते हैं और पहुँच सकते हैं; hot zones को बच्चों से दूर रखना |
| `safety` (hazards, CCPs, supervision, abort) | safety kernel: invariants जिन्हें प्रत्येक योजना को सुरक्षित रखना चाहिए |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | परोसना: मेज पर, कमरे में, लंचबॉक्स में क्या जाता है; रिमाइंडर और hold limits; सांस्कृतिक eating style |
| `storage` | leftovers, cook-ahead और lunchbox Missions |
| `acceptance` | रेसिपी के *tests*: मिशन तब पूरा होता है जब ये बने रहते हैं |
| `nutrition`, `cost` | व्यक्तिगत portions, बजट, relief rations |

## 3. उदाहरण: सब कुछ संलग्न होने के साथ एक चरण

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. एक Mission के लिए रेसिपी संकलित करना (planner क्या करता है)

1. **variant चुनें:** `alternatives` में से diet, texture (IDDSI), equipment, energy और mode चुनें। Identity essentials का बचना अनिवार्य है।
2. **Scale:** `formula` और servings, प्रति व्यक्ति portions (HEALTH.md), limiting ingredient, या ration horizon से। Spices sub-linearly, time mass exponent द्वारा।
3. **Substitute** roles के भीतर, `identity.neverAdd`, allergens, dietary packs और inventory का सम्मान करते हुए।
4. **environment तैयार करें:** Mission के space facets (sink full? hob occupied? board dirty?) के साथ `prep` की तुलना करें और tidy, wash, dry और stage tasks जोड़ें। `advanceTasks` (soak, thaw, marinate, preheat) को schedule करें।
5. **Bind:** affordances और capabilities द्वारा प्रत्येक node को robots, appliances या humans को assign करें। Burners, vessels और zones को lease करें। Monitors (smart pot, delivery ETA, smoke detector) को attach करें।
6. **Schedule** serve time से पीछे की ओर, pause budgets, battery और energy limits, household quiet hours और kitchen-sharing windows का सम्मान करते हुए।
7. **contingencies attach करें:** प्रत्येक node के `failureModes` और `pause` rules, साथ ही Mission की global policies (interruptions, child or pet near the hob, stove watchdog, spoilage watch)।
8. **Verify:** schema + semantic checks, policy packs, CCP coverage, simulator dry-run, priority-stack invariants (PROTOCOL §7.2)।
9. **R4 emit करें** Mission के `plan` में, इसे sign करें, और robot को सौंप दें।

## 5. लेखन और रूपांतरण

- **fifi.cooking से:** EXPORT-FIFI pipeline R1 + R2 + R3 जनरेट करता है। नए
  sections (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  मौजूदा टेक्स्ट से स्थानीय मॉडलों द्वारा जनरेट किए जाते हैं और validators तथा
  sampled human review द्वारा चेक किए जाते हैं।
- **वेब से:** `cookwala convert --from schema-org` → R1/R2 (V0), फिर वही
  enrichment।
- **अन्य formats में:** schema.org Recipe (search engines के लिए R1/R2), Cooklang (human
  editing), PDDL या temporal logic (research planners) सभी R3 से जनरेट किए जा सकते हैं।
- **हाथ से:** `cookwala init recipe` सभी layers को scaffold करता है; `cookwala validate` और
  `cookwala simulate` उन्हें चेक करते हैं।
- **Versioning:** revisions immutable हैं और hashed हैं। Forks `meta.derivedFrom` रिकॉर्ड करते हैं।
  Recipe **patches** (playbooks या feedback से) diffs के रूप में प्रस्तावित किए जाते हैं और केवल
  review और evidence के बाद ही promote किए जाते हैं।

## 6. स्टेप टेक्स्ट की भाषा

Step वाक्य पहले एक व्यक्ति के लिए लिखे जाते हैं और दूसरे में मशीन द्वारा पार्स किए जाते हैं। उदाहरण रेसिपी में अरबी step टेक्स्ट स्त्रीलिंग आज्ञावाचक (قطّعي، سخّني) का उपयोग करता है, जो कि सामान्य मिस्र की कुकबुक परंपरा है; यह एक जानबूझकर किया गया चुनाव है, कोई चूक नहीं, और एक प्रकाशक इसके बजाय लिंग-तटस्थ कर्मवाच्य (تُقطَّع البصلة) का उपयोग कर सकता है। `op`, `params` और `until` फ़ील्ड अर्थ वहन करते हैं; वाक्य रसोइया के लिए है।

## 7. यह भविष्य के लिए सुरक्षित क्यों है

- रेसिपीज़ **food outcomes and constraints, not motions** का वर्णन करती हैं। नए रोबोट और नया AI एक ही R3 से बेहतर R4 प्लान तैयार करते हैं।
- सभी नए सेक्शन **optional and additive** हैं। एक V0 रेसिपी (केवल R1) अभी भी निर्देशित मानव खाना पकाने के लिए काम करती है; जोड़ा गया प्रत्येक layer अधिक automation को अनलॉक करता है।
- अज्ञात `x-` fields बिना किसी बाधा के पास हो जाते हैं। Vendors, chefs और स्वास्थ्य निकाय किसी को बाधित किए बिना रेसिपीज़ का विस्तार कर सकते हैं।
- **Acceptance checks** किसी भी executor, मानव या रोबोट को यह सिद्ध करने देते हैं कि डिश सही बनी है, और इसी तरह रेसिपीज़ field evidence के साथ V3 तक पहुँचती हैं।

