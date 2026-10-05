<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala మరియు రోబోటిక్స్ స్టాక్

Cookwala రోబోట్ యొక్క ఏ భాగాన్ని భర్తీ చేయదు. వంట కోసం రోబోటిక్స్ స్టాక్‌కు లేని పొరను ఇది జోడిస్తుంది: **ఏమి చేయాలి, ప్రతి దశ ఎప్పుడు పూర్తవుతుంది, మరియు ఏమి అస్సలు జరగకూడదు**, దీనిని ఏ రోబోట్, అప్లయన్స్, సిమ్యులేటర్ లేదా లెర్నింగ్ పైప్‌లైన్ అయినా చదవగలిగే మరియు తనిఖీ చేయగలిగే రూపంలో అందిస్తుంది.

## ఇది ఎక్కడ సరిపోతుంది

| Layer | లేయర్ యొక్క ఉదాహరణలు (2026; వీటిలో ఏదీ ఒకదానితోనూ ఇంటిగ్రేషన్ లేదు) | Cookwala ఏమి జోడిస్తుంది |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | ఇది dry-run చేయగల, refuse చేయగల లేదా వండగల ఒక device-independent recipe; on-device safety limits |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | recipes మరియు steps కోసం ROS 2 actions (`bindings/ros2`); ఒక డ్రాఫ్ట్ Matter op mapping (`bindings/matter.json`, unverified); ఒక Open-RMF task అనేది ఒక planned contribution |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | datasets కోసం Natural-language step tasks మరియు step segments; evaluation targets గా done criteria |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | test conditions గా operation envelopes మరియు conformance vectors |
| AI agents | MCP, A2A, Claude, OpenAI మరియు open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala కావాలని **above motion**. ఆధునిక రోబోలు manipulation end to end నేర్చుకుంటాయి;
Cookwala వాటికి task, success test మరియు safety envelope ని అందిస్తుంది, మరియు తిరిగి ఒక execution log ని పొందుతుంది.

## ROS 2

`bindings/ros2/` రెండు చర్యలను నిర్వచిస్తుంది:

| Action | Goal | Feedback | Result |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Final state, refusal reason, `ExecutionLog` |
| `ExecuteNode` | ఒక recipe node, దాని operation envelope, ఒక ఐచ్ఛికమైన ఇరుకైన target | Progress, medium temperature, target reached | Envelope OK, rung used, step summary, deviation |

**Cancelling** ఒక `ExecuteRecipe` లక్ష్యం అనేది ఒక `StopRequest`: సర్వర్ సురక్షితంగా ఆగాలి.
**Safety limits** పరికరంలోనే ఉంటాయి; ఏ లక్ష్యం ఫీల్డ్ కూడా వాటిని మార్చలేదు. ఒక రెసిపీని పలు రోబోల మధ్య విభజించే ఒక hub, `ExecuteNode` లక్ష్యాలను పంపుతుంది, మరియు ఫ్లీట్-లెవల్ డిస్పాచ్‌ను టాస్క్‌లుగా **Open-RMF** కి అప్పగించగలదు.

## LeRobot మరియు robot-learning datasets

LeRobot యొక్క లూప్ teleoperate → record → train → deploy, మరియు దాని LeRobotDataset v2.1 `meta/tasks.jsonl` లో natural-language tasksలను నిల్వ చేస్తుంది (v3 metadataను parquet కి మార్చింది; exporter నేడు v2.1-style ఫైల్‌ను రాస్తుంది మరియు v3 writer is next). Cookwala రెసిపీలలో ఇప్పటికే ప్రతి step కి ఒక వాక్యం ఉంటుంది, మరియు execution logs ప్రతి step ఎప్పుడు ప్రారంభమైందో మరియు ముగిసిందో record చేస్తాయి.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

ఇది వ్రాస్తుంది:
- `meta/tasks.jsonl`, ప్రతి రెసిపీ స్టెప్‌కు ఒక టాస్క్;
- `meta/cookwala/<log>.json` రెసిపీ hash, స్టెప్ సెగ్మెంట్స్ (start మరియు end సెకన్లు,
  sensor-ladder rung, envelope result) మరియు household యొక్క consent తో.

వీడియో మరియు చర్యలు రోబోట్ యొక్క స్వంత రికార్డర్ నుండి వస్తాయి. ఎగుమతి (export) dataset consent లేకుండా logs ను నిరాకరిస్తుంది.

## సిమ్యులేషన్

`conformance/envelope.json` లోని conformance వెక్టార్లు (ఆశించిన ఫలితాలతో కూడిన temperature traces) మరియు sensor-ladder నియమాలు simulator-ready గా ఉన్నాయి. ఒక pan, ఒక pot లేదా ఒక oven యొక్క thermal లేదా physics simulation ను, ఒక real device పాటించవలసిన అదే envelopes తో పోల్చి స్కోర్ చేయవచ్చు. Isaac Lab, Gazebo మరియు MuJoCo లు ఒక public "cook in simulation" benchmark కోసం అభ్యర్థులు.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

ఇది ఒక OpenTelemetry trace ని రాస్తుంది: ప్రతి step కి ఒక span, `cookwala.*` attributes (rung,
envelope OK, deviation) మరియు safety-limit events తో. ఇది ఏదైనా OTLP backend
(Jaeger, Grafana Tempo, LangSmith…) లోకి load అవుతుంది, తద్వారా teams తమ agents ని debug చేసే విధానంలోనే devices ని debug చేయగలరు.

## dry run: ఈ పరికరం ఈ రెసిపీని వండుగలదా?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

ఏదీ వేడెక్కకముందే dry run సమాధానాలు ఇస్తుంది. పరికరం చేసే దశలు, ఒక వ్యక్తి చేసే దశలు, ప్రతి దశ ఎలా ధృవీకరించబడుతుందో (sensor, model, time లేదా person), లేదా అది తిరస్కరించడానికి (refusal before heat) ఉండవలసిన మొదటి కారణాన్ని ఇది చెబుతుంది.

