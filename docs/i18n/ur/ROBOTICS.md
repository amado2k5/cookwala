<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala اور robotics stack

Cookwala کسی روبوٹ کے کسی حصے کو تبدیل نہیں کرتا۔ یہ اس تہہ کو شامل کرتا ہے جو کھانا پکانے کے لیے robotics stack میں موجود نہیں ہے: **کیا بنانا ہے، جب ہر مرحلہ مکمل ہو جائے، اور کیا کبھی نہیں ہونا چاہیے**، ایک ایسی شکل میں جسے کوئی بھی روبوٹ، appliance، simulator یا learning pipeline پڑھ اور چیک کر سکے۔

## یہ کہاں فٹ بیٹھتا ہے

| تہہ (Layer) | تہہ کی مثالیں (2026؛ ان میں سے کسی کے ساتھ بھی انضمام موجود نہیں ہے) | Cookwala کیا اضافہ کرتا ہے |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | ایک device-independent ترکیب جسے یہ dry-run، refuse یا پکا سکتا ہے؛ on-device safety limits |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ترکیبوں اور مراحل کے لیے ROS 2 actions (`bindings/ros2`); ایک Matter op mapping کا مسودہ (`bindings/matter.json`, unverified); ایک Open-RMF ٹاسک ایک منصوبہ بند شراکت ہے |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | datasets کے لیے natural-language step tasks اور step segments; evaluation targets کے طور پر done criteria |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | ٹیسٹ شرائط کے طور پر operation envelopes اور conformance vectors |
| AI agents | MCP, A2A, Claude, OpenAI and open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala جان بوجھ کر **above motion** ہے۔ جدید روبوٹ end to end manipulation سیکھتے ہیں؛
Cookwala انہیں task، success test اور safety envelope دیتا ہے، اور بدلے میں ایک
execution log حاصل کرتا ہے۔

## ROS 2

`bindings/ros2/` دو actions کی تعریف کرتا ہے:

| ایکشن | مقصد | فیڈ بیک | نتیجہ |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | حتمی حالت، refusal reason، `ExecutionLog` |
| `ExecuteNode` | ایک recipe node، اس کا operation envelope، ایک اختیاری تنگ تر target | پیشرفت، medium temperature، target حاصل ہو گیا | Envelope OK، rung استعمال ہوا، step summary، انحراف |

`ExecuteRecipe` مقصد کو **منسوخ کرنا** ایک `StopRequest` ہے: سرور کو محفوظ طریقے سے رکنا چاہیے۔
**حفاظتی حدود** ڈیوائس کے اندر رہتی ہیں؛ کوئی بھی مقصد فیلڈ انہیں تبدیل نہیں کر سکتی۔ ایک hub جو ایک ترکیب کو کئی روبوٹس میں تقسیم کرتا ہے وہ `ExecuteNode` مقاصد بھیجتا ہے، اور فلیٹ لیول ڈسپیکچ کو ٹاسک کے طور پر **Open-RMF** کے حوالے کر سکتا ہے۔

## LeRobot اور robot-learning datasets

LeRobot کا لوپ teleoperate → record → train → deploy ہے، اور اس کا LeRobotDataset v2.1
natural-language tasks کو `meta/tasks.jsonl` میں محفوظ کرتا ہے (v3 نے metadata کو parquet میں منتقل کر دیا ہے؛ exporter آج
v2.1-style فائل لکھتا ہے اور v3 writer next ہے)۔ Cookwala recettes میں پہلے سے ہی ہر قدم کے لیے ایک جملہ موجود ہے، اور execution logs ریکارڈ کرتے ہیں کہ ہر قدم کب شروع اور ختم ہوا۔

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

یہ لکھتا ہے:
- `meta/tasks.jsonl`, ہر ترکیب کے مرحلے کے لیے ایک ٹاسک؛
- `meta/cookwala/<log>.json` ترکیب کے ہیش، مرحلہ ٹکڑوں (شروع اور ختم ہونے والے سیکنڈز، sensor-ladder rung، envelope result) اور گھرانے کی رضامندی کے ساتھ۔

ویڈیو اور ایکشنز روبوٹ کے اپنے ریکارڈر سے آتے ہیں۔ ایکسپورٹ ڈیٹا سیٹ کی رضامندی کے بغیر لاگز کو مسترد کر دیتا ہے۔

## Simulation

`conformance/envelope.json` میں conformance vectors (متوقع نتائج کے ساتھ درجہ حرارت کے ٹریسز) اور sensor-ladder rules سمیلیٹر کے لیے تیار ہیں۔ ایک پین، ایک پٹ یا ایک اوون کی تھرمل یا فزکس سمولیشن کو انہی envelopes کے خلاف اسکور کیا جا سکتا ہے جنہیں ایک حقیقی ڈیوائس کو برقرار رکھنا چاہیے۔ Isaac Lab، Gazebo اور MuJoCo ایک عوامی "cook in simulation" بینچ مارک کے لیے امیدوار ہیں۔

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

یہ ایک OpenTelemetry trace لکھتا ہے: ہر قدم کے لیے ایک span، `cookwala.*` attributes (rung, envelope OK, deviation) اور safety-limit events کے ساتھ۔ یہ کسی بھی OTLP backend (Jaeger, Grafana Tempo, LangSmith…) میں لوڈ ہو جاتا ہے، تاکہ ٹیمیں آلات کو اسی طرح debug کر سکیں جیسے وہ agents کو debug کرتی ہیں۔

## dry run: کیا یہ ڈیوائس یہ ریسیپی پکا سکتی ہے؟

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run اس سے پہلے جواب دیتا ہے کہ کچھ بھی گرم ہو۔ یہ بتاتا ہے کہ کون سے اقدامات ڈیوائس کرتی ہے، کون سے ایک شخص کرتا ہے، ہر قدم کی تصدیق کیسے کی جائے گی (sensor، model، وقت یا شخص)، یا پہلا وجہ جس کی وجہ سے اسے refusal before heat کرنا چاہیے۔

