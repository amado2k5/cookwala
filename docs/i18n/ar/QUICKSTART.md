<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# البداية السريعة

خمس دقائق، بدون أجهزة. ستقوم بجلب وصفة، وعمل hash لها، والسؤال عما إذا كان بإمكان جهاز ما طهيها، والتحقق من أثر درجة الحرارة مقابل النطاق الآمن للعملية، وتصدير سجل طهي كأثر. كل ما يلي يعمل اليوم.

## 1. احصل على الأدوات

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

تستخدم `hash` و `dryrun` والمصدرون مكتبة Python القياسية فقط. الحزم الأخرى مخصصة للتحقق الكامل والتوقيعات. حزمة `pip install cookwala` هي الخطوة next في خارطة الطريق.

## 2. جلب وصفة وعمل hash لها

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

يقوم المنفذ بطهي هذه المراجعة بالضبط ويرفض إذا لم يتطابق الهاش المعطى له.

## 3. هل يمكن لهذا الجهاز طهيه؟

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

الإجابة هي `refused` مع السبب `needs_human_present`: قد لا يتم القص دون إشراف.
أضف شخصاً:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

الآن الحالة هي `accepted`. توضح الخطة الخطوات التي يقوم بها الذراع، والخطوات التي يقوم بها الشخص، وكيفية التحقق من كل خطوة (sensor، أو logged estimate، أو time أو person). جرب الشيء نفسه في المتصفح على [home page](/#demo).

## 4. تحقق من مسار درجة الحرارة مقابل نطاق آمن

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. تحقق من كل شيء وقم بتشغيل اختبارات conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. تحويل سجل الطهي إلى trace أو مجموعة بيانات

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

يتم تحميل `trace.json` في أي backend خاص بـ OpenTelemetry. يحتوي `my-dataset/meta/` على مهمة واحدة لكل خطوة وصفة لمجموعات بيانات بأسلوب LeRobot. كلاهما يرفض السجلات التي لم يقم household الخاص بها باختيار opt in.

## أين الخطوة التالية

| أنت تقوم بـ | Next |
|---|---|
| بناء روبوت أو جهاز | [Robots, ROS 2 and datasets](ROBOTICS.md)، ثم [Core API](CORE.md#7-execution-lifecycle-and-api) |
| بناء وكيل ذكاء اصطناعي | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) و [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| إدارة مطبخ أو food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| كتابة وصفات طعام | [Recipe format](RECIPE-FORMAT.md) و [Contributing](../CONTRIBUTING.md) |

