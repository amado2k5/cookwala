<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala और robotics stack

Cookwala किसी भी रोबोट के किसी भी हिस्से को रिप्लेस नहीं करता है। यह कुकिंग के लिए रोबोटिक्स स्टैक में मौजूद उस लेयर को जोड़ता है जिसकी कमी है: **क्या बनाना है, प्रत्येक स्टेप कब पूरा होता है, और क्या कभी नहीं होना चाहिए**, एक ऐसे रूप में जिसे कोई भी रोबोट, उपकरण, सिम्युलेटर या लर्निंग पाइपलाइन पढ़ और चेक कर सके।

## यह कहाँ फिट बैठता है

| Layer | layer के उदाहरण (2026; इनमें से किसी के साथ भी एकीकरण मौजूद नहीं है) | Cookwala क्या जोड़ता है |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | एक device-independent recipe जिसे यह dry-run, refuse या cook कर सकता है; on-device safety limits |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | recipes और steps के लिए ROS 2 actions (`bindings/ros2`); एक draft Matter op mapping (`bindings/matter.json`, unverified); एक Open-RMF task एक planned contribution है |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | datasets के लिए Natural-language step tasks और step segments; evaluation targets के रूप में done criteria |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | test conditions के रूप में operation envelopes और conformance vectors |
| AI agents | MCP, A2A, Claude, OpenAI और open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala जानबूझकर **above motion** है। आधुनिक रोबोट एंड टू एंड मैनिपुलेशन सीखते हैं;
Cookwala उन्हें कार्य, सफलता परीक्षण और सुरक्षा envelope देता है, और बदले में एक
execution log प्राप्त करता है।

## ROS 2

`bindings/ros2/` दो actions को परिभाषित करता है:

| Action | Goal | Feedback | Result |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Final state, refusal reason, `ExecutionLog` |
| `ExecuteNode` | एक recipe node, इसका operation envelope, एक optional संकरा target | Progress, medium temperature, target reached | Envelope OK, rung used, step summary, deviation |

**Cancelling** एक `ExecuteRecipe` लक्ष्य एक `StopRequest` है: सर्वर को सुरक्षित रूप से रुकना चाहिए।
**Safety limits** डिवाइस के अंदर रहती हैं; कोई भी लक्ष्य फ़ील्ड उन्हें बदल नहीं सकती। एक hub जो एक रेसिपी को कई रोबोट्स में विभाजित करता है, वह `ExecuteNode` लक्ष्य भेजता है, और फ़्लीट-स्तर के डिस्पैच को कार्यों के रूप में **Open-RMF** को सौंप सकता है।

## LeRobot और robot-learning datasets

LeRobot का लूप teleoperate → record → train → deploy है, और इसका LeRobotDataset v2.1
`meta/tasks.jsonl` में natural-language tasks को स्टोर करता है (v3 ने metadata को parquet में स्थानांतरित कर दिया है; exporter आज
v2.1-style फ़ाइल लिखता है और एक v3 writer next है)। Cookwala recipes में पहले से ही प्रत्येक step के लिए एक वाक्य शामिल है, और execution logs रिकॉर्ड करते हैं कि प्रत्येक step कब शुरू और समाप्त हुआ।

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

यह लिखता है:
- `meta/tasks.jsonl`, प्रत्येक रेसिपी स्टेप के लिए एक टास्क;
- `meta/cookwala/<log>.json` रेसिपी hash, स्टेप सेगमेंट्स (start और end seconds,
  sensor-ladder rung, envelope result) और household के consent के साथ।

वीडियो और क्रियाएं रोबोट के अपने रिकॉर्डर से आती हैं। एक्सपोर्ट डेटासेट सहमति के बिना लॉग्स को refuse करता है।

## सिमुलेशन

`conformance/envelope.json` में conformance vectors (अपेक्षित परिणामों के साथ तापमान ट्रेस) और sensor-ladder नियम simulator-ready हैं। एक पैन, एक पॉट या एक ओवन का thermal या physics simulation उन्हीं envelopes के विरुद्ध स्कोर किया जा सकता है जिन्हें एक वास्तविक डिवाइस को बनाए रखना चाहिए। Isaac Lab, Gazebo और MuJoCo एक सार्वजनिक "cook in simulation" benchmark के लिए उम्मीदवार हैं।

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

यह एक OpenTelemetry trace लिखता है: प्रत्येक चरण के लिए एक span, `cookwala.*` attributes (rung, envelope OK, deviation) और safety-limit events के साथ। यह किसी भी OTLP backend (Jaeger, Grafana Tempo, LangSmith…) में लोड हो जाता है, ताकि टीमें उपकरणों को उसी तरह debug कर सकें जैसे वे agents को debug करती हैं।

## dry run: क्या यह device इस recipe को पका सकता है?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run किसी भी चीज़ के गर्म होने से पहले उत्तर देता है। यह बताता है कि उपकरण कौन से चरण करता है, एक व्यक्ति कौन से चरण करता है, प्रत्येक चरण को कैसे सत्यापित किया जाएगा (sensor, model, time या person), या वह पहला कारण जिसके कारण इसे refusal before heat करना चाहिए।

