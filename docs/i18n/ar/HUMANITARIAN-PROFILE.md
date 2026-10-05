<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# ملف Cookwala الإنساني (مسودة 0.2)

**الحالة:** مسودة للمراجعة من قبل food banks، وبرامج الإغاثة، والمتخصصين في سلامة الغذاء والتغذية. لم تتم مراجعتها أو اعتمادها من قبل WFP، أو WHO، أو FAO، أو Global FoodBanking Network أو أي منظمة أخرى مذكورة هنا.

**الملفات:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (الكل)، [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json)، [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json)، [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004؛ جميع المسودات في انتظار المراجعة المهنية، انظر [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank في القاهرة، وجبات مدرسية، مطبخ كوارث، مطبخ روبوت)، كل منها مع `ImpactSummary` محسوب
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. ما يضيفه 0.2 (RFC-0003, RFC-0004)

إضافي أكثر من 0.1؛ يتقبل القراء كلاهما.

- **من المزرعة إلى الطبق:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) و `Item.harvestedAt`; الأدوار `farm`, `caterer`, `robot_kitchen`; كلمة SMS هي `FARM`.
- **قواعد الرعاية:** `Item.foodClasses` و `Distribution.menu.foodClasses` (بيض نيء، ألبان غير مبسترة، مكسرات كاملة، أرز مطبوخ...)، نوع القاعدة `food_class` ، `Rule.audienceGroup` ، `Distribution.audienceGroups`؛ ثلاث حزم مسودة جديدة.
- **المراجعات:** يسجل `RulePack.reviews` المهنة، والمنظمة، والتاريخ، والنطاق، ونتيجة كل مراجعة؛ الحالة `status: reviewed` تتطلب مراجعة معتمدة.
- **الأثر:** `ImpactSummary` مع تسعة مقاييس، يحمل كل منها `method` (measured، modelled، assumed، not recorded)، ويتم حسابها بواسطة `tools/humanitarian_check.py --summary`.
- **وقت المطالبة:** `Offer.createdAt` ، `Claim.claimedAt`؛ `Handover.leg` لضمان احتساب الكيلوجرامات التي تم إنقاذها مرة واحدة فقط.
- **أنواع البرنامج** في الـ `Manifest`.

## 1. الغرض

جزء صغير، صارم، وخالٍ من البيانات الشخصية من Cookwala للمؤسسات التي تطعم الناس:
بنوك الطعام (food banks)، المطابخ المجتمعية، برامج الوجبات المدرسية، برامج الإغاثة، المتبرعون (البقالون، المطاعم، المزارع، متعهدو الطعام)، الناقلون والمخازن المبردة. وهو يغطي أربع وظائف:

1. **تقديم surplus food** والمطالبة به، بسرعة وعدالة.
2. **تسجيل كل handover** للحيازة، مع فحص درجة الحرارة (فحص cold-chain).
3. **الإبلاغ عما تم تقديمه** كأعداد إجمالية فقط.
4. **فحص القوائم و handovers** مقابل قواعد التغذية وسلامة الغذاء القابلة للقراءة آلياً.

**إنه يعمل بدون روبوتات، أو تطبيقات، أو إنترنت.** تعمل المستويات H0 و H1 على جداول البيانات، والرسائل النصية القصيرة (SMS)، والهواتف الأساسية. الروبوتات، و الhubs، والوكلاء هم مستهلكون اختياريون لنفس المستندات.

## 2. المبادئ

- **عدم إلحاق الضرر.** لا تجمع أي شيء يمكن أن يحدد هوية شخص أو أسرة أو يحدد موقعهم أو يحدد ملفهم الشخصي. في البيئات الهشة، تشكل البيانات المتعلقة بالمستفيدين خطرًا على الحماية.
- **المبادئ الإنسانية** (الإنسانية، الحياد، عدم الانحياز، الاستقلالية): لا توجد علامات تجارية تجارية على المساعدات، ولا يتم استخدام البيانات لأغراض التسويق.
- **صارم وصغير.** يرفض كل كائن الحقول غير المعروفة (باستثناء امتدادات `x-`)، لذا فإن الأخطاء المطبعية والحقول الشخصية الإضافية تفشل في عملية التحقق من الصحة.
- **وحدات دقيقة:** الكيلوجرامات، درجات مئوية °C، التفاوتات المطلقة، والمال كسلاسل عشرية.
- **القواعد المحلية هي الغالبة.** يمكن استبدال rule packs بقوانين سلامة الغذاء والتبرع الوطنية.
- **مفتوح:** مواصفات خالية من حقوق الملكية، وأدوات مفتوحة المصدر. تم تصميم الملف الشخصي ليلبي Digital Public Goods Standard و Principles for Digital Development.

## 3. مستويات conformance

| المستوى | ما يفعله المشارك | الاحتياجات |
|---|---|---|
| **H0 — Paper & SMS** | يسجل العروض، والتسليمات، والتوزيعات في قوالب CSV (مع صفوف HXL hashtag) أو عبر SMS (القسم 8.3) | جدول بيانات أو هاتف أساسي |
| **H1 — Rescue** | يتبادل مستندات `Offer` و `Claim` و `Handover` و `Distribution` عبر الـ API؛ ويتبع الـ state machine (القسم 5) | أي HTTP client |
| **H2 — Safety & nutrition** | يطبق `RulePack` على كل عملية تسليم وقائمة طعام، ويسجل الـ `findings` | الـ reference checker أو ما يعادله |
| **H3 — Interoperability** | يصدر التجميعات إلى HXL و DHIS2 و Cookwala `ImpactReport` الأساسي؛ ويستخدم معرفات GS1 | أعمال التكامل |

يقوم مشارك بنشر `Manifest` في `/.well-known/cookwala-humanitarian.json` يعلن عن مستوياته، وrule packs، ونقاط النهاية، و`personalData: "none"`.

## 4. المستندات

| المستند | من يكتبه | الغرض |
|---|---|---|
| `Offer` | المتبرع | surplus food متاح للاستلام: الأصناف (kg، التخزين، علامات التاريخ، مسببات الحساسية)، الفترة الزمنية، الموقع، درجات الحرارة |
| `Claim` | food bank، المطبخ، البرنامج | يطالب بكل أو جزء من `Offer` مع وقت الاستلام ونوع المركبة |
| `Handover` | مستلم الحيازة | واحد لكل مرحلة: درجات الحرارة، kg المقبولة أو المرفوضة مع رمز السبب، ونتائج الـ rule pack |
| `Distribution` | المطبخ، food bank، المدرسة | تجميع الوجبات والأشخاص الذين تمت خدمتهم في موقع ما في يوم معين؛ عناصر غذائية وتكاليف القائمة اختيارية |
| `RulePack` | البرنامج أو السلطة | قواعد التغذية وسلامة الغذاء ذات الإصدارات (القسم 6) |
| `Manifest` | كل مشارك | القدرات وإقرار حماية البيانات |

تظل وثائق Cookwala الأساسية للإغاثة (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` في `relief.schema.json`) متاحة للتخطيط. يتعامل هذا الملف الشخصي مع
التدفق التشغيلي.

## 5. دورة حياة العرض

| من | الحالات التالية المسموح بها |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (انتهت صلاحية المطالبة), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | لا شيء (نهائية) |

**قواعد تغيير الحالة:**

- كل تغيير يزيد من `version`. يرسل الكتاب `If-Match: <version>`; وفي حالة عدم التطابق يتم إرجاع
  **409**، ويقوم الكاتب بإعادة القراءة والمحاولة مرة أخرى.
- الانتقال غير القانوني يرجع **409** مع الانتقالات المسموح بها.
- تنتقل العروض إلى `expired` تلقائياً عند `window.to`.
- تنتهي صلاحية المطالبات عند `pickupBy` بالإضافة إلى فترة سماح يحددها البرنامج (الافتراضي 30 minutes).

**المطالبة العادلة.** افتراضياً، تكون المطالبات وفقاً لأسبقية الحضور ضمن فئة أولوية يحددها البرنامج:
على سبيل المثال، المطابخ التي تخدم الأطفال أولاً، ثم المطابخ الأخرى، ثم food banks. يجب نشر الفئات وأي قواعد تدوير في `Manifest` الخاص بالبرنامج أو موقعه الإلكتروني.

## 6. حزم قواعد سلامة الغذاء والتغذية

تحتوي `RulePack` على قواعد من ستة أنواع:

- `temperature`: مبرد ≤ 5 °C، محفوظ ساخن ≥ 60 °C، مجمد ≤ −18 °C؛
- `time`: طعام مطهو خارج نطاق التحكم في درجة الحرارة لمدة ساعتين كحد أقصى؛
- `date_mark`: كتل "يُستخدم قبل" (use-by)، تحذيرات "يفضل استخدامه قبل" (best-before)؛
- `allergen`: كتلة مسببات الحساسية غير المعلنة؛
- `nutrient`: الكميات لكل شخص-يوم أو لكل وجبة؛
- `energy_share`: حصة الطاقة من السكريات الحرة، أو الدهون، أو الدهون المشبعة، أو الدهون المتحولة، أو البروتين.

كل قاعدة هي إما `block` (عدم القبول أو التقديم) أو `warn` (مسموح بها، وتُسجل كـ finding).

إن الحزمة الافتراضية `who-codex-basic@0.1.0` هي **مسودة مشتقة من إرشادات عامة**: إرشادات منظمة الصحة العالمية بشأن النظام الغذائي الصحي، والصوديوم، والسكريات والدهون، والمفاتيح الخمسة لمنظمة الصحة العالمية لسلامة الغذاء، وقواعد Codex للبطاقات التعريفية والأغذية المجمدة، وأرقام تخطيط الحصص الدنيا من Sphere. إنها مبسطة، وليست نصيحة طبية، وتستثني تغذية الرضع والتغذية العلاجية، ويجب مراجعتها من قبل موظفين مؤهلين. يجب على البرامج نسخها وتكييفها، وتحديد `jurisdiction`، وتسجيل من قام بمراجعتها في `reviewedBy`.

يقوم المستلمون في المستوى H2 بتشغيل الـ pack عند كل عملية تسليم وفي كل قائمة طعام، وتسجيل معرفات القواعد في `findings`. ويقوم فاحص المرجع بالإبلاغ عن المواضع التي تختلف فيها النتائج المعلنة والمحسوبة.

## 7. حماية البيانات

**لا يحمل الملف الشخصي أي بيانات شخصية. يجب ألا تحتوي المستندات على:**

- الأسماء، أو أرقام الهواتف، أو رسائل البريد الإلكتروني، أو المعرفات الوطنية أو الخاصة باللاجئين أو البيومترية لأي شخص؛
- السجلات على مستوى household context، أو مواقع المنازل أو الأفراد؛
- الصحة، أو الإعاقة، أو الدين، أو الجنسية لأي شخص.

**ما يحمله بدلاً من ذلك:**

- **المنظمات فقط.** كل طرف هو منظمة يتم تحديدها بواسطة `did:web` أو رقم موقع عالمي (GLN) من GS1 أو معرف registry. يظهر الأشخاص فقط كأدوار (`checkedBy: "trained_staff"`).
- **المجاميع فقط.** يحتوي `Distribution.people` على أعداد حسب المجموعة، وأي عدد أقل من 10 يتم الإبلاغ عنه كـ `"<10"`.
- **المواقع فقط.** الـ `Site` هو مقر المنظمة أو منطقة إدارية (OCHA P-codes)، وليس household أبدًا.
- **ملاحظات قصيرة.** النص الحر يقتصر على ملاحظات تشغيلية بطول 280 حرفًا ويجب ألا يحتوي على بيانات شخصية. يجب على عمليات التنفيذ فحص الملاحظات بحثًا عن أرقام الهواتف والمعرفات قبل تخزينها.

**الاحتفاظ والتدقيق:**

- **Retention:** يعلن كل مشارك عن `retentionDays` في الـ `Manifest` الخاص به ويحذف
  المستندات بعد ذلك.
- **Audit (اختياري، `hash_only`):** يقوم مُسلسل واحد لكل برنامج (عادةً الـ food bank أو
  مشغل البرنامج) بإلحاق SHA-256 hash الخاص بـ RFC 8785 canonical JSON لكل مستند.
  يتم تخزين المحتويات بشكل منفصل وتظل قابلة للحذف. تقوم منظمة شريكة
  بالتوقيع المشترك على نقطة تفتيش (checkpoint) كل يوم، بحيث لا يمكن إعادة كتابة التاريخ بصمت.
  يمنع وجود مُسلسل واحد حدوث تفرعات (forks) في السلسلة.
- **Hosting** يجب أن يكون داخل الدولة حيثما يتطلب القانون أو البرنامج ذلك.

## 8. النقل

### 8.1 API (المستوى H1)

| الطريقة | المسار | ملاحظات |
|---|---|---|
| `POST` | `/offers` | ينشئ عرضاً (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | العروض المفتوحة بالقرب من مستلم |
| `POST` | `/offers/{id}/claims` | يطالب بعرض؛ مطلوب `If-Match`؛ 409 عندما يكون مطلوباً بالفعل |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`؛ مطلوب `If-Match` |
| `POST` | `/handovers` | يسجل عملية تسليم |
| `POST` | `/distributions` | يسجل عملية توزيع |
| `GET` | `/reports?from=…&to=…` | تجميع لفترة زمنية |

قواعد الطلب والنقل:

- **Idempotency:** كل `POST` يحمل `Idempotency-Key`. تحتفظ الخوادم بالمفاتيح لمدة 24 h على الأقل وتُرجع الاستجابة الأصلية في حالة التكرار.
- **Authentication:** اعتماد OAuth 2.1 client credentials، عميل واحد لكل مؤسسة.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  يتم تسليمها مرة واحدة على الأقل، مع `id` للحدث من أجل منع التكرار ورقم تسلسلي لكل عرض من أجل الترتيب.

### 8.2 جداول البيانات (المستوى H0)

استخدم قوالب CSV الموجودة في `profiles/humanitarian/templates/`. يحتوي الصف الثاني منها على وسوم [HXL](https://hxlstandard.org)، بحيث يمكن لأدوات البيانات الإنسانية قراءتها مباشرة.

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

يتم تنفيذ القواعد في `tools/cookwala_ref.py` (`parse_sms`) ويتم اختبارها بواسطة
`conformance/profiles/sms.json`. الكلمات المفتاحية باللغة الإنجليزية؛ وتُقبل الأرقام العربية-الهندية (٠-٩) والفارسية (۰-۹) أينما وجد رقم، لذا فإن أي هاتف مضبوط على أي من لوحتي المفاتيح سيعمل.

أكواد التخزين: `A` ambient، `C` chilled، `F` frozen، `H` hot-held. علامات التاريخ: `UB` use-by،
`BB` best-before، `HV` harvested، بصيغة `DDMM`. أكواد أسباب الرفض: `TEMP` temp_out_of_range،
`DATE` past_use_by، `PACK` packaging_damaged، `ALLERG` allergen_unlabelled، `QTY`
quantity_mismatch، `PEST` pests_or_contamination، `SPACE` no_capacity، `TRANSPORT`
no_transport، `LATE` arrived_late، `OTHER`؛ أي كلمة أخرى تُسجل كـ `other`. يجب أن تكون ردود `HELP`
مثالاً واحداً لكل أمر، بصيغة ASCII بسيطة، وأقل من 160 حرفاً.

يجب على البوابة تطبيق هذه الفحوصات قبل كتابة مستند (`sms_storage_findings` في المرجع؛ المعرفات هي نتائج الكتل):

| النتيجة | متى |
|---|---|
| `safety.temp_not_recorded` | وجود `HAND` على خط مبرد أو مجمد أو محفوظ ساخناً بدون قراءة `T`: رد بطلبها، ولا تكتب شيئاً آخر |
| `safety.hot_hold_min` | وجود `OFFER` مع تخزين `H` أقل من 60 °C: رفض إدراجه |
| `safety.storage_class_mismatch` | كلمات الصنف تشير إلى ألبان، أو لحوم، أو دواجن، أو أسماك، أو بيض، أو طعام مطبوخ والتخزين هو `A`: رفض إدراجه |
| `safety.chilled_max`, `safety.frozen_max` | قراءات أعلى من 5 °C أو أعلى من −18 °C عند العرض أو التسليم |

تغلق عروض الأطعمة المحفوظة ساخنة بعد ساعتين (ساعة واحدة للأرز المطبوخ)؛ لا تقوم البوابة أبداً بتخزين قراءة مؤقتة. تقوم البوابة بربط رقم المرسل المسجل بمنظمة، وليس بشخص أبداً في المستندات.

## 9. التوافق التشغيلي

| النظام | الربط |
|---|---|
| HXL | قوالب CSV؛ `Distribution` ← `#reached+…` ، `#adm1+name` ، `#value+meals` |
| GS1 | `Item.gtin` (المنتجات)؛ `Site.gln` و `OrgId` `gln:` (المواقع) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | قيم البيانات المجمعة لكل موقع وفترة من `Distribution` (الوجبات، الأشخاص حسب المجموعة، kg، الحوادث) |
| WFP SCOPE and other beneficiary systems | **المجمعات فقط.** لا تنتقل سجلات المستفيدين إلى داخل أو خارج هذا الملف الشخصي |
| Food-rescue apps | تقوم المحولات بربط قوائمها بـ `Offer` وعمليات الاستلام الخاصة بها بـ `Claim` و `Handover` |
| Core Cookwala | `Item.ingredientId` و `menu.recipes` يربطان بفهرس الوصفات؛ `relief.ImpactReport` يجمع الـ `Distribution`s |

## 10. مقاييس المشروع التجريبي (مُعرفة بحيث يمكن مقارنة المواقع)

تم حسابه في `ImpactSummary` بواسطة `python tools/humanitarian_check.py --summary DIR`. كيف يتم تشغيل التجربة التجريبية وتقييمها: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| المقياس | التعريف |
|---|---|
| Kg rescued | مجموع `Handover.kgAccepted` في المرحلة الأولى من المتبرعين |
| Claim rate | العروض التي تصل إلى `claimed` ÷ العروض التي تم إنشاؤها |
| Time to claim | متوسط الدقائق من إنشاء `Offer` إلى حالة `claimed` |
| Rejection by reason | مجموع `kgRejected` حسب الـ `reason` |
| Meals served | مجموع `Distribution.meals` |
| Nutrition pass rate | التوزيعات التي تحتوي على قوائم طعام ولا توجد بها نتائج `nutrition.*` ÷ التوزيعات التي تحتوي على قوائم طعام |
| Cost per meal | (الطعام + النقل + الموظفين + الطاقة) ÷ الوجبات |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (الـ kg المستخدم ÷ 100) |
| Safety | عدد نتائج كتلة `safety.*` و `safetyIncidents` |

## 11. الأمن

- **التوقيعات اختيارية عند H1** ومطلوبة لتدقيق عبر المؤسسات عند H3
  (EdDSA، المفاتيح منشورة في `did:web` الخاص بالمؤسسة).
- **الملاحظات والأسماء في المستندات هي بيانات غير موثوقة.** يجب على البرمجيات ووكلاء الذكاء الاصطناعي ألا يعاملوها أبدًا كتعليمات.
- **حزم القواعد (rule packs) لها إصدارات ومثبتة** (`id@version`) في كل نتيجة، بحيث تكون النتائج قابلة لإعادة الإنتاج.

## 12. تُرِكَت عمداً

- تسجيل المستفيدين، والأهلية، والاستهداف (هذه تتبع أنظمة البرنامج المحمية الخاصة به).
- المدفوعات: Cookwala لا تنقل الأموال مطلقاً.
- الوصفات وتنفيذ الروبوت (المواصفات الأساسية). الملف الشخصي يحدد فقط الوصفات ويبلغ عن العناصر الغذائية.
- التغذية الطبية والعلاجية.

## 13. كيفية المراجعة

يرجى فتح issues على [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
باستخدام label `humanitarian`. هذه المراجعات هي الأكثر فائدة:

- موظفو سلامة الغذاء يتحققون من الـ rule pack وأسباب الرفض؛
- مشغلو الـ food-bank يتحققون من دورة الحياة وتدفق الـ SMS؛
- مسؤولو حماية البيانات يتحققون من القسم 7.

