<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala ومجموعة تقنيات الروبوتات

لا يحل Cookwala محل أي جزء من الروبوت. بل يضيف الطبقة التي تفتقر إليها حزمة الروبوتات (robotics stack) من أجل الطهي: **ماذا نصنع، ومتى يتم إنجاز كل خطوة، وما الذي يجب ألا يحدث مطلقاً**، وذلك في شكل يمكن لأي روبوت أو جهاز أو محاكي أو مسار تعلم (learning pipeline) قراءته والتحقق منه.

## أين يوضع

| الطبقة | أمثلة على الطبقة (2026؛ لا يوجد تكامل مع أي منها حالياً) | ما تضيفه Cookwala |
|---|---|---|
| الروبوتات والأجهزة | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | وصفة مستقلة عن الجهاز يمكنه إجراء dry run لها، أو رفضها، أو طهيها؛ حدود سلامة على الجهاز |
| البرمجيات الوسيطة (Middleware) | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | إجراءات ROS 2 للوصفات والخطوات (`bindings/ros2`)؛ مسودة لخرائط Matter op (`bindings/matter.json`, unverified)؛ مهمة Open-RMF هي مساهمة مخططة |
| تعلم الروبوتات | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | مهام الخطوات باللغة الطبيعية وقطع الخطوات لمجموعات البيانات؛ معايير الإنجاز كأهداف للتقييم |
| المحاكاة | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | operation envelope ومتجهات conformance كشروط للاختبار |
| وكلاء الذكاء الاصطناعي | MCP, A2A, Claude, OpenAI and open models | AgentMandate، قاعدة untrusted-text، معيار kitchen agent-safety |

Cookwala تقع عمداً **فوق الحركة**. تتعلم الروبوتات الحديثة المناولة من البداية إلى النهاية؛
تمنحها Cookwala المهمة، واختبار النجاح، ونطاق السلامة، وتستلم في المقابل
execution log.

## ROS 2

`bindings/ros2/` تُعرف إجراءين:

| الإجراء | الهدف | التغذية الراجعة | النتيجة |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | الحالة النهائية، سبب الرفض، `ExecutionLog` |
| `ExecuteNode` | عقدة وصفة واحدة، الـ operation envelope الخاص بها، هدف أضيق اختياري | التقدم، درجة حرارة الوسط، الوصول للهدف | الـ Envelope سليم، الـ rung المستخدم، ملخص الخطوة، الانحراف |

**إلغاء** هدف `ExecuteRecipe` هو `StopRequest`: يجب أن يتوقف الخادم بأمان.
**حدود السلامة** تظل داخل الجهاز؛ لا يمكن لأي حقل هدف تغييرها. الـ hub الذي يقسم وصفة عبر عدة روبوتات يرسل أهداف `ExecuteNode` ، ويمكنه تسليم إرسال مستوى الأسطول إلى **Open-RMF** كمهام.

## LeRobot ومجموعات بيانات تعلم الروبوتات

حلقة LeRobot هي teleoperate ← record ← train ← deploy، ويقوم LeRobotDataset v2.1 بتخزين مهام اللغة الطبيعية في `meta/tasks.jsonl` (انتقل الإصدار v3 بالبيانات الوصفية إلى parquet؛ يقوم المصدر بكتابة ملف بأسلوب v2.1 اليوم، وسيكون كاتب v3 هو الخطوة التالية). تحتوي وصفات Cookwala بالفعل على جملة واحدة لكل خطوة، وتسجل execution logs متى بدأت كل خطوة ومتى انتهت.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

هذا يكتب:
- `meta/tasks.jsonl`، مهمة واحدة لكل خطوة وصفة؛
- `meta/cookwala/<log>.json` مع hash الوصفة، أجزاء الخطوة (بداية ونهاية الثواني،
  sensor-ladder rung، نتيجة envelope) وموافقة الـ household.

تأتي الفيديوهات والإجراءات من مسجل الروبوت الخاص. يرفض التصدير السجلات بدون موافقة مجموعة البيانات.

## المحاكاة

إن نواقل conformance في `conformance/envelope.json` (مسارات درجة الحرارة مع النتائج المتوقعة) وقواعد sensor ladder جاهزة للمحاكاة. يمكن تقييم محاكاة حرارية أو فيزيائية لمقلاة أو قدر أو فرن مقابل نفس الـ envelopes التي يجب على الجهاز الحقيقي الالتزام بها. تُعد Isaac Lab و Gazebo و MuJoCo مرشحة لمعيار "cook in simulation" عام.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

يقوم هذا بكتابة تتبع OpenTelemetry: span واحد لكل خطوة، مع سمات `cookwala.*` (rung، envelope OK، deviation) وأحداث حدود السلامة. يتم تحميله في أي backend يدعم OTLP (مثل Jaeger، Grafana Tempo، LangSmith...)، بحيث يمكن للفرق استكشاف أخطاء الأجهزة وإصلاحها بنفس الطريقة التي يستكشفون بها أخطاء الوكلاء.

## dry run: هل يمكن لهذا الجهاز طهي هذه الوصفة؟

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

تُجيب الـ dry run قبل أن يسخن أي شيء. وهي توضح الخطوات التي يقوم بها الجهاز، والخطوات التي يقوم بها الشخص، وكيف سيتم التحقق من كل خطوة (sensor، أو model، أو time، أو person)، أو السبب الأول الذي يجعله يقوم بالـ refusal before heat.

