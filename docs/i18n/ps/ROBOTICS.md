<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala او د روبوټیکس سټیک (robotics stack)

Cookwala د روبوټ هیڅ برخه نه بدلوي. دا هغه تሌ (layer) اضافه کوي چې د پخلي لپاره د روبوټیکس سټیک (robotics stack) ورته اړتیا لري: **څه جوړ کړي، کله چې هر ګام بشپړ شي، او څه باید هیڅکله ونه شي**، په داسې بڼه چې هر روبوټ، وسیله، سیمیلیټر یا زده کړې ته اړتیا لرونکی پائپلاین (learning pipeline) یې په لاس کې ونیسي او وګوري.

## دا چیرته چې سم ځای لري

| تیره (Layer) | د تېرې بېلګې (2026; له هیڅ څخه سره هیڅ ډول انټګریشن شتون نلري) | Cookwala څه اضافه کوي |
|---|---|---|
| روبوټونه او وسایل | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, د پخلنځي روبوټونه (Moley, Miso, Chef Robotics), هوښیار اوونونه | یو د وسیلې څخه خپلواک ریسیپي چې دا یې dry run، رد یا پخول کولی شي؛ په وسیله کې د خونديتوب محدودیتونه |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | د ریسیپيونو او ګامونو لپاره ROS 2 actions (`bindings/ros2`); د Matter op mapping یو مسودوي (`bindings/matter.json`, غیر تحقق شوی); یو Open-RMF کار یو پلان شوي Contribution دی |
| د روبوټ زده کړه | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | د ډیټا سیټونو لپاره په طبیعي ژبه کې ګامیز کارونه او ګامیز برخې؛ د ارزونې لپاره هدفونه د done criteria په توګه |
| سیمولیشن | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | د ازموینې شرایط په توګه operation envelopes او conformance vectors |
| AI agents | MCP, A2A, Claude, OpenAI او خلاص ماډلونه | AgentMandate, untrusted-text rule, د پخلنځي agent-safety benchmark |

Cookwala په هدفSensory **above motion** دی. عصري روبوټونه په end to end ډول manipulation زده کوي؛
Cookwala دوی ته task، د بریالیتوب test او safety envelope ورکوي، او په بدل کې execution log ترلاسه کوي.

## ROS 2

`bindings/ros2/` دوه اقدامات تعریفوي:

| عمل | هدف | فیډبیک | پایله |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | وروستۍ حالت، د انکار دلیل، `ExecutionLog` |
| `ExecuteNode` | یو د ریسیپي node، د هغې operation envelope، یو اختیاري ترڅخه کوچنی هدف | پرمختګ، medium temperature، ترلاسه شوی هدف | Envelope OK، کارول شوی rung، د ګام لنډیز، انحراف |

**Cancelling** یو `ExecuteRecipe` هدف یو `StopRequest` دی: سرور باید په خوندي ډول ودریږي.
**Safety limits** د وسیلې دننه پاتې کیږي؛ هیڅ هدف میدان نشي کولی هغه بدل کړي. یو hub چې یو recipe په څو روبوټونو کې ویشل کوي `ExecuteNode` هدفونه لېږي، او کولی شي د ناوستې کچې (fleet-level) لیږد **Open-RMF** ته د کارونو په توګه وسپاري.

## LeRobot او robot-learning ډېټا سیټونه

د LeRobot کړک ir teleoperate → record → train → deploy دی، او د هغې LeRobotDataset v2.1 په `meta/tasks.jsonl` کې
د طبیعي ژبې کارونه ذخیره کوي (v3 metadata ته parquet ته لیږدولی دی؛ exporter نن د v2.1-style فایل لیکي او د v3 writer کار په next کې دی). Cookwala ترکیبونه لا دمخه په هر ګام کې یوه جمله لري، او execution logs ثبتوي چې هر ګام کله پیل او کله پای ته رسیدلی دی.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

دا لیکي:
- `meta/tasks.jsonl`، په هر د پخلي په ګام کې یو کار؛
- `meta/cookwala/<log>.json` د پخلي له هیش (hash)، د ګام برخو (شروع او پای ثانیې، sensor-ladder پړاو، envelope پایله) او د کورنۍ له رضایت سره.

ویډیو او اقدامات د روبوټ د خپل ریکارډر څخه راځي. ایکسپورټ د dataset consent پرته لاګونه ردوي.

## سیمولیشن (Simulation)

په `conformance/envelope.json` کې د conformance وېکتورونه (تودوخې ته له وړاندې refusal ته اړوند تمه شوي پایلې) او د sensor-ladder مقررات د ماډل جوړولو لپاره چمتو دي. د یو کټورې، د یو دیګ یا د یو اوون حراري یا فزیکي ماډل کولای شي د هغو envelopes په وړاندې ارزښت ترلاسه کړي چې یو حقیقي وسیله باید یې وساتي. Isaac Lab، Gazebo او MuJoCo د یو عام "cook in simulation" معیار لپاره کاندیدان دي.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

دا یو OpenTelemetry trace لیکي: هر ګام لپاره یو span، د `cookwala.*` attributes (rung,
envelope OK, deviation) او safety-limit events سره. دا په هر OTLP backend
(Jaeger, Grafana Tempo, LangSmith…) کې load کیږي، ترڅو ډیمونه د هغه ډول ډیبیګ کولای شي لکه څنګه چې دوی ایجنټونه ډیبیګ کوي.

## dry run: ایا دا وسیله دا ریسیپي پخولی شي؟

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run مخکې له دې چې څه شي ګرم شي ځواب ورکوي. دا وايي چې کوم ګامونه وسیله ترسره کوي، کوم ګامونه یو کس ترسره کوي، هر ګام څنګه به وڅیړل شي (sensor، model، وخت یا کس)، یا لومړی دلیل چې باید refusal befor heat وکړي.

