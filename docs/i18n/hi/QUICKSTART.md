<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

पाँच मिनट, कोई हार्डवेयर नहीं। आप एक रेसिपी प्राप्त करेंगे, उसे hash करेंगे, पूछेंगे कि क्या कोई डिवाइस उसे पका सकता है, किसी operation के safe band के विरुद्ध temperature trace की जाँच करेंगे, और cooking log को एक trace के रूप में export करेंगे। नीचे दी गई हर चीज़ आज काम करती है।

## 1. उपकरण प्राप्त करें

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` और exporters केवल Python standard library का उपयोग करते हैं। अन्य packages पूर्ण validation और signatures के लिए हैं। `pip install cookwala` package roadmap पर next है।

## 2. एक रेसिपी प्राप्त करें और उसे hash करें

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

एक executor ठीक इसी revision को cook करता है और यदि दिया गया hash मेल नहीं खाता है तो refusal करता है।

## 3. क्या यह डिवाइस इसे पका सकता है?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

उत्तर `refused` है जिसका कारण `needs_human_present` है: cutting बिना किसी की देखरेख के नहीं चल सकता।
एक व्यक्ति जोड़ें:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

अब यह `accepted` है। योजना बताती है कि हाथ कौन से चरण करता है, एक व्यक्ति कौन से चरण करता है, और प्रत्येक चरण की जाँच कैसे की जाएगी (sensor, logged estimate, time या person)। ब्राउज़र में [home page](/#demo) पर वही चीज़ आज़माएँ।

## 4. एक सुरक्षित बैंड के विरुद्ध तापमान ट्रेस की जाँच करें

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. सब कुछ सत्यापित करें और conformance परीक्षण चलाएं

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. एक cooking log को trace या dataset में बदलें

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` किसी भी OpenTelemetry backend में लोड होता है। `my-dataset/meta/` LeRobot-style datasets के लिए प्रत्येक recipe step के प्रति एक task रखता है। दोनों उन logs को refuse करते हैं जिनका household opt in नहीं हुआ था।

## आगे क्या

| आप हैं | Next |
|---|---|
| एक रोबोट या उपकरण बनाना | [Robots, ROS 2 and datasets](ROBOTICS.md), फिर [Core API](CORE.md#7-execution-lifecycle-and-api) |
| एक AI एजेंट बनाना | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) और [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| एक किचन या food bank चलाना | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| रेसिपी लिखना | [Recipe format](RECIPE-FORMAT.md) और [Contributing](../CONTRIBUTING.md) |

