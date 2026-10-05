<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# الانتقادات التي نشرناها

لقد طرحنا أسئلة صعبة حول Cookwala ودوّنا الإجابات. لكل مخاوف معرف `id` في [action plan's concern register](ACTION-PLAN.md#2-concern-register)، إلى جانب ردنا وحالته. المراجعات الخارجية مرحب بها وسيتم إدراجها هنا.

## هل سيعمل هذا؟ (strategy)

| Concern | Short answer | Status |
|---|---|---|
| السوق غير موجود بعد؛ المواصفات تسبق المنتجات | Small Core، عرض تجريبي أولاً، لا مواصفات جديدة بدون مستخدمين | Core 0.2 تم؛ عرض الجهاز next |
| لا يوجد طرف قوي لديه سبب للتبني | القيادة من خلال مكاسب كل متبنٍ؛ مفيد بدون روبوتات | البحث عن food-bank pilot وشريك جهاز |
| المحاكيات تثبت ما assume | خط أساس عادل، نطاقات، تسميات "illustrative"؛ التجارب التجريبية تحل محلها | Open |
| الجوع يتعلق بالفقر والنزاع، وليس surplus | Cookwala تساهم؛ هي لا تدعي إنهاء الجوع بمفردها | تم تغيير الرسالة |
| السلامة، المسؤولية القانونية، وسطح الهجوم | قيود مفروضة على الجهاز؛ refusal before heat؛ recalls؛ تقارير الحوادث | المواصفات تم؛ مراجعة certifier open |
| الخصوصية (بيانات الصحة والدين، السجلات مقابل المحو) | Local-first، إفصاح انتقائي، سجلات hash-only، موافقة | المواصفات تم؛ تقييم الأثر open |
| معقد للغاية | Core 0.2؛ كل شيء آخر مُصنف experimental | Done |
| الاعتماد على المؤسس | مسار الحوكمة للوصول إلى موطن محايد | GOVERNANCE.md |

## هل التصميم التقني سليم؟

| Concern | ما الذي تغير في Core 0.2 |
|---|---|
| العمليات لم يكن لها معنى مادي | Envelopes، مستويات الحرارة، sensor ladders، قاعدة الارتفاع، test vectors |
| أخطاء في الوحدات والأرقام | °C فقط، tolerances مطلقة، وحدات المطبخ، الكثافات، المبالغ العشرية |
| المخططات (Schemas) كانت تقبل الأخطاء المطبعية | مخططات صارمة مع امتدادات `x-`؛ حزمة offline |
| وثيقة Mission واحدة قابلة للتعديل | Event log + projection، sequencer واحد، جدول الانتقالات |
| السجل (ledger) لم يثبت الكثير | سجلات رئيسية مع revocation، نقاط تفتيش مشهودة، اكتشاف إعادة الكتابة |
| تسليم أحداث غير محدد؛ السلامة على الحافلة (bus) | أرقام التسلسل، فئات زمن الاستجابة (latency classes)، نبضات القلب (heartbeats)، "السلامة محلية" |
| انحراف واجهات API | Core OpenAPI؛ كل مرجع يتم فحصه في CI |
| لا يوجد متحقق (verifier) | مكتبة مرجعية و 106 conformance vectors |

## المراجعات التي نطلبها

W3C TAG (identity, JSON-LD)، وIETF SCITT (event-log transparency)، وعلماء الأغذية
(envelopes)، ومسؤولي سلامة الأغذية وأخصائيي التغذية (rule packs)، وعملية تدقيق أمني، و
مراجعة لحماية البيانات، وتحليل الفجوات الخاص بجهة منح الـ certification. راجع
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

