<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**الحالة:** مسودة، 2026-10-04. هذا هو الجزء المعياري لـ Cookwala. يجب أن تتبع كلمات MUST و SHOULD و MAY معايير RFC 2119. كل ما لم يُذكر هنا هو **profile** اختياري (القسم 10).

يجب أن يكون الجهاز قادرًا على تنفيذ Core في حوالي أسبوع. يحدد Core **ما يجب صنعه، ومتى يتم الانتهاء منه، وما لا يجب أن يحدث أبدًا**. هو لا يحدد كيفية تحرك الروبوت.

## 1. فئات conformance

| الفئة | يجب أن تنفذ |
|---|---|
| **Recipe publisher** | مستندات `recipe.schema.json` صالحة؛ درجات الحرارة داخل operation envelopes؛ hash وتوقيع |
| **Executor** (روبوت، جهاز أو hub) | الـ Core API (`api/core.openapi.yaml`)؛ operation envelopes و sensor ladders؛ حدود السلامة المحلية؛ refusal بدلاً من التخمين؛ الـ execution log |
| **Catalog** | وصفات موقعة، `/.well-known/cookwala.json` مع سجلات رئيسية، الـ recall feed، استقبال الحوادث |
| **Agent** (ذكاء اصطناعي أو برنامج يعمل نيابة عن شخص) | يعمل فقط بموجب `AgentMandate`؛ يعامل نص المستند كبيانات؛ يسأل الأصيل قبل أي شيء في `confirmBefore` |
| **Verifier** | hashes، تواقيع، صلاحية المفاتيح وإلغاؤها، الإفصاحات، سلاسل الأحداث ونقاط التحقق |

المطالبة بفئة تعني اجتياز ناقلات الـ conformance الخاصة بها (`conformance/`، يتم التشغيل باستخدام
`tools/run_conformance.py`).

## 2. الوثائق الأساسية

| المستند | المخطط (Schema) |
|---|---|
| الوصفة | `recipe.schema.json` |
| قدرات الجهاز | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| الأنواع المشتركة (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| الأحداث | `event.schema.json` (CloudEvents) |
| المفردات: العمليات، الوحدات ومستويات الحرارة، الحوادث | `vocab/*.json` |

جميع المخططات (schemas) **صارمة**: يتم رفض الحقول غير المعروفة، باستثناء امتدادات `x-<vendor>-…`.
يتجاهل القراء حقول `x-` التي لا يفهمونها. يقوم `tools/bundle_schemas.py` بإنتاج حزمة (bundle) واحدة بحيث تتحقق الأجهزة من الصحة دون اتصال بالإنترنت. يجب على التنفيذات (Implementations) ألا تقوم بجلب المخططات في وقت التشغيل.

## 3. ماذا تعني العمليات

- **Envelopes.** كل عملية تعتمد على الحرارة أو عملية خطرة في `vocab/ops.json` لها `envelope`.
  تحدد ما يلي:
  - الوسط (ماء، زيت، هواء، سطح المقلاة، المنتج...)؛
  - نطاق درجة الحرارة الخاص بها بـ °C (والضغط، في حالة الطهي بالضغط)؛
  - التحريك، الغطاء، مستوى الانتباه وما إذا كان يمكن تنفيذ الخطوة دون مراقبة؛
  - المخاطر؛
  - طريقة اختبار.

`cw.op.simmer` = سائل يعتمد على الماء عند 85–96 °C؛ `cw.op.deep_fry` = زيت عند 160–190 °C.
- **الأهداف داخل الـ operation envelope.** يجب أن يقع هدف الوصفة (`params.tempC` أو `target` على مستشعر الوسط) داخل الـ envelope. يرفض المُحقق الوصفات التي تخرق ذلك.
- **المنفذون يحافظون على الوسط داخل الـ envelope.** إذا أعطت الوصفة هدفاً أضيق، فإنهم يحافظون عليه داخل ذلك الهدف أيضاً، بمجرد الوصول إليه لأول مرة.
- **الارتفاع.** تنزاح نطاقات الماء والبخار بمقدار −1 °C لكل 300 m من ارتفاع المطبخ.
- **مستويات الحرارة** (`very_low` … `max`) لها معنى مشترك واحد: نطاق سطح المقلاة بـ °C، والمُعرف في `vocab/units.json`.
- **sensor ladder.** يسرد كل envelope طرق التحقق من الخطوة، والأفضل أولاً: مستشعر محدد، ثم `model` (تقدير مسجل)، ثم `time`، ثم `human`.
  - يستخدم المنفذ أول درجة يمكنه تلبيتها ويسجلها في `verifiedBy`.
  - إذا لم يتمكن من تلبية **أي** درجة، فيجب عليه رفض الخطوة (`missing_sensor_no_fallback`).
  - العمليات التي تتطلب انتباهاً مستمراً والتي قد لا تعمل دون مراقبة (التشويح، التحمير، القلي، التكثيف، الكرملة...) لا تعتمد أبداً على الوقت وحده: درجتها الأخيرة هي شخص يراقب.
  - القلي العميق (Deep frying) ليس له fallback: عدم وجود مستشعر لدرجة حرارة الزيت يعني عدم وجود deep frying.
  - يمكن لـ `Condition` تضييق هذا باستخدام `onSensorMissing`.
- **الرفض، وليس التخمين.** المنفذ الذي لا يمكنه تلبية الـ envelope الخاص بالخطوة، أو الـ ladder، أو المعدات، أو حدود السلامة، يجب أن يجيب بـ `refused` مع ذكر السبب قبل البدء.

## 4. الأرقام والوحدات

- **درجات الحرارة هي °C على السلك.** قد تقوم الشاشات بالتحويل.
- **التفاوتات (Tolerances).**
  - `tolerance` هو قيمة نسبية ومسموح به فقط في وحدات المقياس النسبي (ratio-scale).
  - `toleranceAbs` هو قيمة مطلقة بوحدة القيمة، وهو التفاوت الوحيد المسموح به في °C.
  - `Target.tolerance` هو قيمة مطلقة.
- **وحدات المطبخ لها قيم مترية دقيقة:** tsp 5 ml، tbsp 15 ml، cup 240 ml،
  pinch ≈ 0.36 g، dash ≈ 0.6 ml.
- **الحجم ↔ الكتلة يحتاج إلى كثافة** (`Quantity.densityGPerMl`، أو مفردات المكونات)؛
  بدونها يعتبر خطأ، وليس مجرد تخمين أبدًا.
- **المال هو سلسلة عشرية** (`"12.70"`) مع عملة ISO 4217، وليس float أبدًا.

## 5. النزاهة والثقة

- **Hash.** الـ `sha256:` مضافاً إليه الـ hex digest الخاص بـ RFC 8785 canonical JSON للمستند،
  بدون حقول `hash` و `signature`. يقوم الـ reference canonicalizer بإعادة إنتاج مثال RFC
  8785 تماماً.
- **Signature.** الـ Ed25519 (`EdDSA`) فوق سلسلة الـ ASCII hash. يُسمح باستخدام `ES256` لمفاتيح
  الأجهزة (hardware keys) من نوع P-256. يحدد `kid` اسم الـ `KeyRecord`.
- **Keys.** يوفر الـ `KeyRecord` المفتاح العام، ومالكه، وفترة صلاحية، و `revokedAt`.
  أي توقيع يقع الـ `signedAt` الخاص به بعد الإلغاء، أو خارج فترة الصلاحية، يكون
  غير صالح.
  - تنشر الكتالوجات مفاتيحها في `/.well-known/cookwala.json`.
  - تنشر المؤسسات والأفراد مفاتيحهم في مستندات did:web.
  - تنشر الأجهزة مفاتيحها في مستند القدرات (capabilities document) الخاص بها.
  - يقوم الـ Verifiers بتخزين سجلات المفاتيح مؤقتاً للاستخدام دون اتصال بالإنترنت.
- **Selective disclosure.** قد يحتوي المستند الموقع على ملخص `Disclosure` وهو
  `sha256(JCS([salt, value]))` بدلاً من قيمة حساسة. يكشف الحائز عن الـ salt والـ
  value فقط للأطراف المسموح لها برؤيتهما، ويظل التوقيع صالحاً للتحقق.
- **Event logs** (Mission profile):
  - يقوم sequencer واحد لكل log بتعيين `seq` و `prev` بحيث لا تنقسم السلسلة أبداً.
  - يتم توقيع الـ Checkpoints بواسطة الـ sequencer وتوقيعها ثانوياً بواسطة الشهود (witnesses)، الذين قد يشملون
    خدمة شفافية مثل IETF SCITT. أي إعادة كتابة بعد checkpoint شهد عليه الشهود تكون
    قابلة للكشف.
  - في وضع `hash_only` ، تعيش الـ payloads في وحدة تخزين قابلة للمسح ويحتفظ الـ log فقط بالـ hashes الخاصة بها.

## 6. قواعد السلامة والوكيل (معيارية)

1. **الأمان محلي.** يقوم المنفذون بفرض حزمة `SafetyLimits` على الجهاز.
   - لا يمكن لأي وصفة، أو وكيل، أو رسالة عن بُعد، أو امتداد، أو وضع تشغيل أن يرفع حداً أو يعطله.
   - الحد الأكثر صرامة هو الذي يسود دائماً.
   - يُعد `profiles/core/safety-limits.default.json` نقطة بداية مسودة يقوم صانعو الأجهزة
     بتشديدها بناءً على حالة الأمان الخاصة بهم.
2. **التوقف المحلي.** يقوم عنصر تحكم في التوقف على الجهاز بإيقاف الحركة خلال 0.5 s وقطع الحرارة خلال
   1 s، بوجود شبكة أو بدونها. لا يتم رفض `POST …/stop` أبداً بسبب التفويض بمجرد أن
   يتمكن المستدعي من الوصول إلى المنفذ.
3. **الأحداث تُبلغ؛ وهي لا تحمي أبداً.** تُبلغ أحداث `cookwalalatency: local_safety` عما
   فعله الجهاز بالفعل. لا يجوز لأي وظيفة أمان أن تعتمد على وصول حدث ما.
4. **نص غير موثوق.** كل حقل نص حر (مُعلم بـ `x-cookwala-untrusted`) هو بيانات وليس
   أمرًا أبداً، سواء للبرمجيات أو لوكلاء الذكاء الاصطناعي على حد سواء. تُتجاهل محاولات إصدار الأوامر عبر النص
   وتُسجل (`cw.incident.untrusted_instruction`).
5. **الوكلاء يعملون بموجب mandate.** يحمل الطلب المرسل بواسطة وكيل `AgentMandate` موقعاً
   من الأصيل: النطاقات، وسقوف الإنفاق، والمزودون المسموح بهم، وتاريخ الانتهاء، والإجراءات التي تتطلب
   تأكيداً.
   - تتطلب `irreversible` و `safety_override` دائماً تأكيداً، بغض النظر عما يقوله الـ mandate.
   - يرفض المنفذون الطلبات الخارجة عن نطاق الـ mandate (`mandate_scope`).
6. **العمليات غير المراقبة تحتاج إلى شخص.** العمليات التي يشير الـ operation envelope الخاص بها إلى `unattended: false`
   تتطلب وجود شخص مسؤول، أو إمكانية الوصول إليه خلال دقيقة واحدة.
7. **حظر مسببات الحساسية يؤدي للرفض.** أي مسبب حساسية محظور في الوصفة أو في المخزون يؤدي لرفض
   الطلب؛ لا توجد بدائل لتجاوز الحظر.
8. **الـ recalls.** تنشر الكتالوجات recalls موقعة عند `GET /v1/recalls`. يقوم المنفذون بالاستعلام (poll) عند الاتصال بالإنترنت
   ويرفضون المراجعات التي تم عمل recall لها. كما يقوم `block_and_stop_running` بإيقاف عمليات التنفيذ الجارية بأمان.
9. **تقارير الحوادث** هي تقارير مجهولة (`IncidentReport`: التاريخ فقط، بدون أسماء أو ids)
   وتُقدم إلى الكتالوجات حتى يتعلم كل صانع من كل حادث وشيك.

## 7. دورة حياة التنفيذ و API

- **API:** `api/core.openapi.yaml`. نقاط النهاية الخاصة به هي:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - جانب الكتالوج: `GET /v1/recalls`, `POST /v1/incidents`.
- **الحالات:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` و `stopping` → `stopped` خلال المسار؛
  - `refused` و `failed` حالات نهائية.
  - جدول الانتقال الكامل موجود في `core.schema.json#/$defs/ExecutionState` ومتجهات الـ conformance.
- **قواعد الطلب:**
  - كل POST يحمل `Idempotency-Key`.
  - التغييرات على عملية تنفيذ موجودة تحمل `If-Match: <seq>`; عدم التطابق يؤدي إلى إرجاع 412.
  - الإيقاف (Stop) لا يتطلب `If-Match`.
- **الأحداث:**
  - التسليم يتم مرة واحدة على الأقل.
  - الـ `id` الخاص بـ CloudEvents هو مفتاح منع التكرار.
  - يقوم `cookwalaseq` بترتيب الأحداث لكل موضوع ومطابقة الـ `seq` الخاص بالحالة.
  - تصدر الأجهزة `cookwala.device.heartbeat` ، بحيث يمكن لـ hub اكتشاف جهاز مفقود وإتمام عملية التسليم.

## 8. الخصوصية

- **لا تحمل execution logs أي بيانات شخصية** (`privacy.personalData: "none"`).
- **لا تترك الجهاز إلا بموافقة opt-in** (`consent.dataset`: `none` افتراضياً،
  `research_only`، أو `open`). يمكن سحب الموافقة.
- **تُجعل مجموعات البيانات المفتوحة الأوقات خشنة لتصل إلى مستوى اليوم.**
- **تبقى بيانات household، والصحة، والبيانات الدينية في المنزل** ما لم يختار الشخص خلاف ذلك.
  وعندما يجب أن تنتقل، تنتقل في شكل selective disclosures.
- **Humanitarian Profile** لا يحمل أي بيانات شخصية على الإطلاق.

## 9. الإصدارات والامتدادات

- **الإصدارات الأساسية هي `0.2.x`.**
  - يقبل القراء أي patch لإصدارهم الفرعي (minor version).
  - يرفضون الإصدارات الفرعية الأخرى مع `unsupported_version`.
  - يتجاهلون حقول `x-` غير المعروفة.
- **العمليات الجديدة، والوحدات، والمستشعرات، وأنواع الحوادث** تُضاف إلى المفردات (vocabularies) دون تغيير في الإصدار.
- **تغيير معنى عملية ما يعني معرفًا (id) جديدًا؛** ويتم تمييز المعرف القديم كـ `deprecated` مع `replacedBy`.
- **الملفات التعريفية (Profiles)** لها إصدار مستقل وتعلن عن إصدار Core الذي تحتاجه.

## 10. الملفات الشخصية وحالتها

| Profile | Status | Notes |
|---|---|---|
| Core (this document) | **draft, normative** | الهدف لأول عمليات تنفيذ للأجهزة |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | لا توجد بيانات شخصية؛ يعمل عبر SMS و CSV؛ surplus to plate، ملخصات التأثير، care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | حقائق household محلية أولاً؛ فقط derived constraints يتم نقلها (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | namespaces مثبتة، إصدارات دقيقة، tombstones؛ المنظمات بناءً على الطلب (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | تقارير موقعة خلف كل ادعاء conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | feeds و relays؛ التحقق مقابل الجهة المصدرة (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | مطاعم، مجتمع، مدرسة، مطابخ الكوارث والروبوتات (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | signals طلب وإمداد مجمعة، متأخرة، وعلى مستوى الفئة؛ مقيدة بمراجعة قانون المنافسة (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | event log + projection، انتقالات في `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | يحتاج إلى مراجعة قانون المنافسة قبل الاستخدام في الإنتاج |
| Relief planning (`relief.schema.json`) | experimental | تم نقل التدفق التشغيلي إلى Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API هو السطح المرجعي |

يصبح الملف الشخصي مستقراً عندما تجتاز تجربتان مستقلتان (implementations) نواقل الـ conformance الخاصة به ويكون لديه مستخدمون حقيقيون.

## 11. الأدوات

| الأداة | ماذا تفعل |
|---|---|
| `tools/validate_specs.py` | تتحقق من المخططات (schemas)، والأمثلة، ودلالات الوصفات (envelopes، معاملات op، عدم وجود عناصر نائبة للقوالب)، والصرامة، ومن أن مراجع API يتم حلها |
| `tools/run_conformance.py` | تقوم بتشغيل `conformance/*.json` و `conformance/profiles/*.json` وتكتب ConformanceReport باستخدام `--report`: التجزئة (بما في ذلك مثال RFC 8785)، والتوقيعات (بما في ذلك مفتاح RFC 8032)، والإلغاء، والإفصاح، وسلاسل الأحداث ونقاط التفتيش، والوحدات، وenvelopes، وsensor ladders، وآلات الحالة |
| `tools/cookwala_ref.py` | مكتبة مرجعية وواجهة سطر أوامر (CLI): `hash` و `verify` و `chain` |
| `tools/make_conformance.py` | تعيد إنشاء المتجهات (راجع الـ diff) |
| `tools/bundle_schemas.py` | حزمة مخططات (schema bundle) غير متصلة بالإنترنت |
| `tools/humanitarian_check.py` | فاحص rule-pack لـ Humanitarian Profile وملخصات التأثير |
| `tools/make_profile_vectors.py` | تعيد إنشاء متجهات الملف الشخصي (profile vectors) في `conformance/profiles/` |

## 12. التغييرات من 0.1

| المنطقة | 0.1 | 0.2 |
|---|---|---|
| Schemas | حقول غير معروفة مقبولة | صارمة، مع ملحقات `x-` |
| درجات الحرارة | °C أو °F، يُسمح بالتفاوت النسبي | °C فقط؛ تفاوت مطلق |
| المال | رقم | سلسلة عشرية |
| العمليات | تعريفات نثرية | operation envelope، sensor ladders، مستويات الحرارة، متجهات الاختبار |
| التوقيعات | EdDSA ثابت، مفاتيح بدون دورة حياة | EdDSA أو ES256، KeyRecords مع الصلاحية والإلغاء |
| Missions | وثيقة واحدة قابلة للتغيير، ledger بداخلها | سجل أحداث + projection، sequencer واحد، نقاط تفتيش مشهودة، وضع hash-only |
| Agents | mandate داخل Missions فقط | `AgentMandate` في المشترك؛ مطلوب لطلبات agent |
| السلامة | مُعلنة في الوصفات | تُفرض أيضًا محليًا من خلال SafetyLimits؛ recalls؛ تقارير الحوادث |
| البيانات | لا يوجد نموذج مجموعة بيانات | ExecutionLog موافق عليه وخالٍ من البيانات الشخصية |
| Conformance | التحقق من Schema فقط | 106 متجهات (44 Core، 62 profile) بالإضافة إلى تنفيذ مرجعي |

لترحيل مستند 0.1: قم بتحويل °F إلى °C؛ استبدل التفاوتات النسبية في درجات الحرارة بـ `toleranceAbs`; حوّل مبالغ المال إلى سلاسل عشرية؛ قم بإزالة أو إعادة تسمية الحقول غير المعروفة إلى حقول `x-`.

