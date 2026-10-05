<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

ఐదు నిమిషాలు, హార్డ్‌వేర్ లేదు. మీరు ఒక రెసిపీని తీసుకుంటారు, దానిని hash చేస్తారు, ఒక పరికరం దానిని వండగలదో లేదో అడుగుతారు, ఒక operation యొక్క safe band తో temperature trace ని తనిఖీ చేస్తారు, మరియు వంట log ని ఒక trace గా ఎగుమతి చేస్తారు. క్రింద ఉన్నవన్నీ ఈరోజు పనిచేస్తాయి.

## 1. సాధనాలను పొందండి

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` మరియు ఎక్స్‌పోర్టర్లు కేవలం Python standard library మాత్రమే ఉపయోగిస్తాయి. మిగిలిన ప్యాకేజీలు పూర్తి validation మరియు signatures కోసం. `pip install cookwala` ప్యాకేజీ రోడ్‌మ్యాప్‌లో next లో ఉంది.

## 2. ఒక రెసిపీని తీసుకుని దానిని hash చేయండి

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

ఒక executor సరిగ్గా ఈ revision ను వండుతుంది మరియు దానికి ఇవ్వబడిన hash సరిపోలకపోతే refuse చేస్తుంది.

## 3. ఈ పరికరం దీనిని వండుగలదా?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

జవాబు `refused` కారణం `needs_human_present`: cutting unattended గా రన్ కాకపోవచ్చు.
ఒక వ్యక్తిని జోడించండి:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

ఇప్పుడు ఇది `accepted`. ప్లాన్ అనేది చేయి ఏ దశలను చేస్తుంది, ఒక వ్యక్తి ఏ దశలను చేస్తారు, మరియు ప్రతి దశ ఎలా తనిఖీ చేయబడుతుందో (sensor, logged estimate, time లేదా person) చెబుతుంది. బ్రౌజర్‌లో [home page](/#demo) లో అదే ప్రయత్నించండి.

## 4. ఒక సురక్షితమైన బ్యాండ్‌తో ఉష్ణోగ్రత ట్రేస్‌ను తనిఖీ చేయండి

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. అన్నింటినీ ధృవీకరించండి మరియు conformance పరీక్షలను రన్ చేయండి

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. వంట లాగ్‌ను (cooking log) ఒక ట్రేస్ లేదా డేటాసెట్‌గా మార్చండి

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` ఏదైనా OpenTelemetry backend లోకి లోడ్ అవుతుంది. `my-dataset/meta/` అనేది LeRobot-style datasets కోసం ప్రతి recipe step కు ఒక task ను కలిగి ఉంటుంది. household opt in అవ్వని రెండు refusal logs ను కూడా ఇది తిరస్కరిస్తుంది.

## తర్వాత ఎక్కడ

| మీరు | Next |
|---|---|
| రోబోట్ లేదా అప్లయన్స్ నిర్మించడం | [Robots, ROS 2 and datasets](ROBOTICS.md), ఆపై [Core API](CORE.md#7-execution-lifecycle-and-api) |
| AI ఏజెంట్‌ను నిర్మించడం | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) మరియు [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| కిచెన్ లేదా food bank నడపడం | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| రెసిపీలు రాయడం | [Recipe format](RECIPE-FORMAT.md) మరియు [Contributing](../CONTRIBUTING.md) |

