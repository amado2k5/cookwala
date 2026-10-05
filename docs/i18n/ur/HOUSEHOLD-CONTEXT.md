<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Cookwala Core کا حصہ نہیں ہے۔ Schema:
> `schemas/household.schema.json`۔ Registry: `vocab/facets.json` (139 facet types)۔
> Recipient rules: `profiles/household/recipient-roles.json`۔ Local API:
> `api/household.openapi.yaml`۔ Example: `examples/household/context.json`۔

## 1. کیوں

ایک روبوٹ جو خاندان کی اچھی خدمت کرتا ہے اسے بہت کچھ جاننے کی ضرورت ہوتی ہے: آلات اور ان کی خصوصیات، وہاں کون رہتا ہے اور وہ کب گھر پر ہوتے ہیں، پالتو جانور، بچے، غذائی معمولات، الرجی، ادویات کا وقت، رسومات، بجٹ، خریداری کی عادات، پچھلی بار کیا غلط ہوا تھا۔ یہی حقائق چوری کا منصوبہ اور پروفائلنگ کا آلہ ہیں۔ یہ پروفائل **گھر پر منصوبہ ساز** کو مکمل تصویر فراہم کرتا ہے اور باقی سب کو صرف ایک **constraint** دیتا ہے۔

## 2. تین آئیڈیاز

1. **Facets.** ہر ایک ٹائپ شدہ حقیقت (`cw.facet.household.health.allergies`) کے ساتھ جس نے اسے بیان کیا (declared, observed, reported, inferred)، کب، کتنی دیر کے لیے، کتنی یقین دہانی، اور ایک پرائیویسی کلاس (`public`, `household`, `sensitive`, `secret`)۔
2. **registry میں Travel rules.** ہر facet type یہ بتاتا ہے کہ آیا اس کی خام قدر (raw value) گھر سے باہر جا سکتی ہے: `never` (45 types: children, absences, layouts, health conditions, religion, behaviour, incidents, income posture)، صرف ایک `derived` constraint کے طور پر (81 types)، یا ایک واضح اجازت کے بعد `consented` प्रकटीकरण (disclosure) کے طور پر (13 types, زیادہ تر maker کے لیے device self-state)۔
3. **Derived constraints.** واحد household object جو ایک grocer, planner, delivery service, device maker یا کوئی دوسرا robot کبھی وصول کرتا ہے: "deliver 17:00–18:00 to the front door", "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per meal"۔ ہر ایک ان facet **types** کے نام بتاتا ہے جہاں سے وہ آیا ہے، ان کی values کبھی نہیں۔

## 3. کسے کیا ملتا ہے

| وصول کنندہ کا کردار | موصول کر سکتا ہے |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI یا سافٹ ویئر جو کھانا ترتیب دیتا ہے) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | صرف device fault summary (کیٹیگری کے لحاظ سے غلطیوں کی تعداد، کوئی وقت نہیں، کوئی household facts نہیں)، اور صرف اس وقت جب household نے کسی insurer کو وصول کنندہ کے طور پر نامزد کیا ہو؛ RFC-0001 اسے وہ کردار قرار دیتا ہے جس کے پرائیویسی ریویو کی مخالفت کرنے پر ہٹائے جانے کا سب سے زیادہ امکان ہے |
| program (food bank, school) | کچھ نہیں |
| dataset | کچھ نہیں |

## 4. قواعد

- Raw facets کبھی بھی ڈیوائس سے باہر نہیں جاتے۔ کوئی ایسی API نہیں ہے جو انہیں ہوم نیٹ ورک سے باہر کسی کو واپس کرے۔
- `inferred` facets کبھی بھی حفاظتی فیصلوں کے لیے استعمال نہیں کیے جاتے۔
- کسی بھی شخص کا کوئی سلوک کا اسکور (behavioural score) تیار یا محفوظ نہیں کیا جاتا۔ Behaviour facets کا مقصد گھر کی خدمت کرنا ہے (portion sizes, کب صفائی کرنی ہے) اور وہ کبھی منتقل نہیں ہوتے۔
- معاشی سطح ایک **owner-set budget posture** ہے، اسے کبھی بھی کسی چیز سے inferred نہیں کیا جاتا۔
- بچوں کا ڈیٹا اور غیر موجودگی `secret` ہے اور کبھی منتقل نہیں ہوتی، یہاں تک کہ derived بھی نہیں، سوائے حرکت اور safe-zone constraints کے جو کوئی شیڈول ظاہر نہیں کرتے۔
- ہر facet کو مٹایا جا سکتا ہے۔ Erasure گھر کے ونڈو کے اندر مکمل ہوتا ہے (ڈیفالٹ 7 دن، زیادہ سے زیادہ 30) اور بغیر مواد کے log کیا جاتا ہے۔
- Privacy class کو registry default سے اوپر بڑھایا جا سکتا ہے، کبھی کم نہیں کیا جا سکتا۔

## 5. مقامی واقعہ کی یادداشت (local incident memory)

RFC-0001 پوچھتا ہے کہ روبوٹ الارمز، تنازعات، ہار ماننے اور اسباق کے بارے میں کیا یاد رکھتا ہے۔ `LocalIncident` اسے محفوظ رکھتا ہے: تاریخ، `vocab/incidents.json` سے کیٹیگری، کس قسم کے لوگ شامل تھے، ایک نوٹ اور ایک سبق۔ یہ کبھی گھر سے باہر نہیں جاتا۔ Core میں عوامی، گمنام `IncidentReport` ایک مختلف دستاویز ہے جس سے ہر میکر سیکھتا ہے۔

## 6. Conformance

پروفائل ویکٹرز (`conformance/profiles/disclosure_policy.json`) facets اور ایک وصول کنندہ کا کردار (role) فراہم کرتے ہیں اور بالکل وہی constraint types، disclose کیے گئے ids اور وجوہات کے ساتھ withheld ids کی توقع کرتے ہیں۔ ریفرنس امپلیمنٹیشن `tools/cookwala_ref.py` میں `derive_constraints()` ہے۔

## 7. دیگر دستاویزات سے تعلق

`ClientProfile`, `KitchenProfile` اور `RobotProfile` (`profile.schema.json`) آسان بنڈلز کے طور پر رہتے ہیں۔ مشن facets (`mission.schema.json`) وہی registry ids استعمال کرتے ہیں۔ Core `AgentMandate` اس بات کا معیاری بیان رہتا ہے کہ ایک agent کیا کر سکتا ہے؛ mandate facets مقامی طور پر household کے rules بیان کرتے ہیں۔

## 8. کھلے سوالات

RFC-0001 دیکھیں: closed recipient roles; raise-only privacy; ایک reviewer کے ساتھ data-protection impact assessment۔

