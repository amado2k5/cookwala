<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance والمسار نحو certification

**الحالة:** مسودة، 2026-10-04 (RFC-0008). لم يتم الاستعانة بأي جهة إصدار شهادات بعد؛ هذا هو المسار
الذي يقدمه المعيار.

## 1. ثلاث خطوات

| الخطوة | من | ماذا تعني | تظهر كـ |
|---|---|---|---|
| **Self-declared** | الصانع أو الناشر | قام بتشغيل المتجهات العامة باستخدام الأداة العامة ونشر `ConformanceReport` (`schemas/conformance.schema.json`)، موقعاً بمفتاحه الخاص | التقرير، مع المجموعات والأعداد؛ لا تظهر أبداً كشارة |
| **Verified** | مشغل registry | أعاد إنتاج التشغيل مقابل نفس hash مجموعة المتجهات ووقع التقرير توقيعاً مضاداً | التقرير بالإضافة إلى الـ verifier |
| **Certified** | جهة certification مستقلة (لا توجد حالياً) | قامت بتشغيل المجموعة بالإضافة إلى فحوصات الأجهزة وحالات السلامة بموجب scheme منشور ومنحت العلامة | التقرير، جهة certification، العلامة |

التقرير الذي يفشل في أي متجه (vector) من فئة ما لا يجوز له ادعاء تلك الفئة. يُظهر الـ registry التقارير، وليس الـ badges.

اليوم، مشغل الـ registry الوحيد هو المسؤول عن المواصفات (cookwala.ai)، لذا فإن "verified" لا تضيف أي استقلالية حتى يوجد registry ثانٍ؛ لا تزال الحالة تظهر كـ self-verification.

## 2. ما يحتويه التقرير

الإصدار الأساسي، الفئة التي تم الادعاء بها (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) أو ادعاء ملف تعريف (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`)، الموضوع (المنتج، المورد، الإصدار)، المجموعات التي تم تشغيلها مع الإجماليات ومعرفات المتجهات الفاشلة، هاش مجموعة المتجهات، الأداة والالتزام (commit)، التاريخ، الحالة والـ verifier. مثال: `examples/conformance/report-reference.json` ، الذي تم إنتاجه بواسطة

```bash
python tools/run_conformance.py --report report.json
```

## 3. الفئات وما تثبته

| الفئة | المتجهات | مطلوب أيضاً من أجل certification (غير مغطى بواسطة المتجهات) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | مراجعة محتوى الوصفات من قبل متخصص في سلامة الغذاء |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | حالة السلامة الخاصة بالجهاز نفسه (ISO 13482, IEC 60335, UL 3300 حسب الاقتضاء)؛ زمن استجابة التوقف المحلي measured؛ فرض حدود السلامة بدون شبكة |
| Catalog | hash, signature, key revocation, recalls | عهدة المفاتيح وعملية استقبال الحوادث |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | النتائج المنشورة لكل model مع الطريقة |
| Verifier | جميع مجموعات Core | لا يوجد |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | مراجعة مسؤولية البيانات؛ لا يوجد تدقيق للبيانات الشخصية |
| Household | سياسة الإفصاح | تقييم أثر حماية البيانات |
| Registry | قواعد الاسم والإصدار، tombstones | عملية إثبات namespace |

## 4. ما لا يمكن للـ certification أن تضمنه

يثبت تقرير conformance أن البرمجيات تصرفت كما تتطلب المتجهات في اليوم الذي تم تشغيلها فيه.
إنه لا يثبت أن الجهاز آمن في كل مطبخ، أو أن الوصفة مذاقها صحيح، أو أنه
لا يمكن حدوث أي ضرر. إن المعيار الذي يعد بصفر ضرر سيكون غير صادق؛ هذا المعيار يعد
بأن الحدود يتم فرضها محلياً، وأن refusals happen before heat، وأن السجلات يمكن
التحقق منها.

## 5. حوكمة العلامة

تنتقل علامة certification وقواعدها إلى الأساس المحايد مع العلامة التجارية (`GOVERNANCE.md`). حتى ذلك الحين لا توجد علامة؛ توجد التقارير فقط.

