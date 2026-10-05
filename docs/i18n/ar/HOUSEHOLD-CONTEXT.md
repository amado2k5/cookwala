<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# ملف Household Context: الصورة الكاملة تبقى في المنزل

> **الحالة: draft profile** (RFC-0001). ليس جزءًا من Cookwala Core. المخطط:
> `schemas/household.schema.json`. السجل: `vocab/facets.json` (139 facet types).
> قواعد المستلم: `profiles/household/recipient-roles.json`. واجهة برمجة التطبيقات المحلية:
> `api/household.openapi.yaml`. مثال: `examples/household/context.json`.

## 1. لماذا

الروبوت الذي يخدم عائلة بشكل جيد يحتاج إلى معرفة الكثير: الأجهزة وغرائبها، ومن يعيش هناك ومتى يكونون في المنزل، والحيوانات الأليفة، والأطفال، والأنظمة الغذائية، والحساسية، وتوقيت الأدوية، والطقوس، والميزانية، وعادات التسوق، وما الذي سار بشكل خاطئ في المرة الأخيرة. هذه الحقائق نفسها هي خطة سرقة وأداة لتحديد السمات الشخصية. هذا الملف الشخصي يعطي **المخطط في المنزل** الصورة الكاملة ويعطي الجميع الآخرين فقط **constraint**.

## 2. ثلاث أفكار

1. **Facets.** حقيقة واحدة مكتوبة لكل منها (`cw.facet.household.health.allergies`)، مع تحديد من
   أكدها (declared، observed، reported، inferred)، ومتى، ولمدة كم، ومدى الثقة،
   وفئة الخصوصية (`public`، `household`، `sensitive`، `secret`).
2. **Travel rules in the registry.** يحدد كل نوع facet ما إذا كانت قيمته الخام يمكن أن تغادر
   المنزل: `never` (45 نوعاً: children، absences، layouts، health conditions، religion،
   behaviour، incidents، income posture)، أو فقط كـ `derived` constraint (81 نوعاً)، أو كـ
   `consented` disclosure بعد منح صريح (13 نوعاً، معظمها device self-state لصانع
   الجهاز).
3. **Derived constraints.** الكائن المنزلي الوحيد الذي يتلقاه البقال، أو المخطط، أو خدمة التوصيل،
   أو صانع الجهاز، أو روبوت آخر على الإطلاق: "deliver 17:00–18:00 to the front door"،
   "block peanuts"، "no robot movement in the hallway 15:00–15:30"، "budget cap 18.00 USD per
   meal". يحدد كل منها **types** الـ facet التي جاء منها، ولا يحدد قيمها أبداً.

## 3. من يحصل على ماذا

| دور المستلم | قد يتلقى |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI or software that plans the meal) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary only (counts of faults by category, no times, no household facts), and only when the household has named an insurer as a recipient; RFC-0001 lists this as the role most likely to be removed if a privacy review objects |
| program (food bank, school) | لا شيء |
| dataset | لا شيء |

## 4. القواعد

- الـ facets الخام لا تغادر الجهاز أبدًا. لا توجد API تعيدها إلى أي شخص خارج شبكة المنزل.
- الـ facets الـ `inferred` لا تُستخدم أبدًا لاتخاذ قرارات السلامة.
- لا يتم إنتاج أو تخزين أي درجة سلوكية لأي شخص. الـ Behaviour facets موجودة لخدمة الـ household (أحجام الحصص، موعد التنظيف) ولا تنتقل أبدًا.
- المستوى الاقتصادي هو **owner-set budget posture**، ولا يتم استنتاجه أبدًا من أي شيء.
- بيانات الأطفال وغيابهم هي `secret` ولا تنتقل أبدًا، حتى لو كانت derived، باستثناء قيود الحركة والـ safe-zone التي لا تكشف عن أي جدول زمني.
- كل facet قابل للمسح. يكتمل المسح ضمن الـ window الخاص بالـ household (الافتراضي 7 أيام، بحد أقصى 30) ويتم تسجيله في الـ execution log بدون محتوى.
- يمكن رفع فئة الخصوصية فوق الـ registry default، ولكن لا يمكن خفضها أبدًا.

## 5. ذاكرة الحوادث المحلية

يطلب RFC-0001 معرفة ما يتذكره الروبوت عن التنبيهات، والتعارضات، والتنازلات، والدروس. يحتفظ `LocalIncident` بها: التاريخ، والفئة من `vocab/incidents.json` ، ومن شارك حسب النوع، وملاحظة ودرس. لا يغادر المنزل أبداً. أما `IncidentReport` العام والمجهول في Core فهو مستند مختلف يتعلم منه كل صانع.

## 6. Conformance

تعطي ناقلات الملف الشخصي (`conformance/profiles/disclosure_policy.json`) الـ facets ودور المستلم وتتوقع أنواع الـ constraint الدقيقة، والـ disclosed ids والـ withheld ids مع الأسباب. التنفيذ المرجعي هو `derive_constraints()` في `tools/cookwala_ref.py`.

## 7. العلاقة بالوثائق الأخرى

تظل `ClientProfile` و `KitchenProfile` و `RobotProfile` (`profile.schema.json`) كحزم مريحة. وتستخدم جوانب المهمة (`mission.schema.json`) نفس معرفات الـ registry. ويظل الـ `AgentMandate` الأساسي هو البيان المعياري لما يجوز للوكيل فعله؛ بينما تصف جوانب الـ mandate قواعد الـ household محلياً.

## 8. أسئلة مفتوحة

انظر RFC-0001: أدوار المستلمين المغلقة؛ الخصوصية القائمة على الرفع فقط؛ تقييم أثر حماية البيانات مع مراجع.

