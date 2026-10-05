<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# خارطة الطريق: now، next، later

**الحالة:** 2026-10-04. كل عنصر يحمل حالة: **done**، **in progress**، **planned**،
**not yet funded**. تأتي البوابات من قسم 4 في `ACTION-PLAN.md`. لا ينتقل أي شيء من planned
إلى done بدون الدليل المسمى.

## الآن (هذا الإصدار)

| العنصر | الحالة |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| تسع وصفات أمثلة باللغتين الإنجليزية والعربية | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) مع نموذج مراجعة | done (drafts awaiting professional review) |
| Household Context Profile مع registry لـ 139-type facet و disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| المطابخ و production runs؛ إشارات الإمداد | done (experimental) |
| Federation rules و relay vectors | done (draft) |
| أربعة simulators مع تشغيل وإيقاف البروتوكول | done (illustrative) |
| موقع إلكتروني باللغتين الإنجليزية والعربية مع صفحة لكل stakeholder، و whitepaper و deck | in progress |

## Next (خلال حوالي عام، حسب توفر الموارد)

| العنصر | الحالة | البوابة |
|---|---|---|
| مراجعة عالم الأغذية لـ operation envelopes | planned | يوافق المراجع |
| مراجعات أخصائي التغذية ومسؤول سلامة الأغذية لـ rule packs الأربعة | planned | تم إيداع المراجعات؛ تنتقل الـ packs إلى reviewed |
| تقييم أثر حماية البيانات لـ household profile | planned | يوافق المراجع |
| تجربة food-bank (مدة 12 أسابيع، مسجلة مسبقاً، مقيم مستقل) | not yet funded | الشريك والتمويل (`humanitarian/CONCEPT-NOTE.md`) |
| نتائج معيار سلامة الوكيل لعدة عائلات نماذج | planned | يتم نشر الـ runs مع الطريقة |
| wheel الخاص بـ `pip install cookwala` و `@cookwala/sdk` على npm | planned | التغليف الذي يجمع المفردات والمخططات |
| خدمة Registry (`validate`, `publish`, tombstones) | planned | عامل وإثبات namespace |
| أول صانع أجهزة ينفذ Core API مقابل الـ reference hub | planned | يوافق صانع واحد؛ يتم نشر تقرير conformance |
| تحويل أول مجموعات fifi.cooking | planned | المؤسس يقرر الحقوق لكل مجموعة |
| Core 0.3 من ملاحظات الأجهزة | planned | ملاحظات منفذين اثنين |
| لجنة التوجيه | planned | ثلاثة مستخدمين مستقلين أو تنفيذان |

## Later

| العنصر | الحالة |
|---|---|
| جهاز حقيقي يطهو وصفة Cookwala، بدون تعديل، عبر الفيديو | لم يتم تمويله بعد؛ يحتاج إلى شريك من مزودي الأجهزة |
| نظام certification مع جهة certifier مستقلة | مخطط له؛ لم يتم التعاقد مع certifier |
| أساس محايد للمواصفات، والعلامة التجارية، والرمز | مخطط له |
| شبكة المساهمين: تسجيلات بموافقة لوصفات حقيقية مع ذكر المصدر | مخطط له |
| إشارات العرض والطلب المنشورة بواسطة البرامج والتعاونيات | مخطط له، بعد مراجعة قانون المنافسة |
| معيار "الطهي في المحاكاة" (Isaac Lab، Gazebo أو MuJoCo) | مخطط له |
| اعتراف كـ Digital Public Good للملف الإنساني | مخطط له، بعد الأدلة التجريبية |
| تدفقات الإغاثة عبر المناطق في محاكي العالم؛ تأثيرات الطهي النظيف | مخطط له |

## ما لن نقوم به

جمع البيانات الشخصية؛ نشر الأرقام بدون طريقة؛ تسمية شريك قبل موافقته؛
ادعاء certification غير موجودة؛ وضع بيانات household على أي ledger؛ بناء
orchestrator مركزي تعتمد عليه المطابخ؛ ادعاء إنهاء الجوع.

## قواعد Kill and pivot

من خطة العمل: إذا فشلت جولتان من المراجعة الخارجية في التوصل إلى صانع أجهزة أو شريك تجريبي، تضيق Cookwala النطاق إلى Humanitarian Profile وتنسيق الوصفة. إذا أظهر المشروع التجريبي مكسباً أقل من 5 %، تُنشر النتائج ويُعاد تصميم الملف الشخصي قبل أي توسع.

