<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

پنځه دقیقې، پرته له هارډویر څخه. تاسو به یو ریسیپي ترلاسه کړئ، هغه به هیش کړئ، پوښتنه به وکړئ چې ایا یو وسیله کولی شي هغه پخلی، د یو عملیاتو خوندي بانډ (safe band) په وړاندې به د تودوخې ټریس (temperature trace) وګورئ، او د پخولو لاګ (cooking log) به د یو ټریس په توګه ایکسپورټ کړئ. لاندې هر څه نن کار کوي.

## ۱. وسایل ترلاسه کړئ

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` او eksporters یوازې د Python standard library څخه کارយកي. نور پیکیجونه د بشپړ validation او signatures لپاره دي. یو `pip install cookwala` پیکیج په roadmap کې `next` دی.

## 2. یو خواړه (recipe) ترلاسه کړئ او هغه ته hash ورکړئ

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

یو ایګزیکیوټر (executor) په دقیق ډول دا ریویژن پخلی کوي او که ورکړل شوی هیش (hash) سم نه وي، نو انکار کوي.

## 3. ایا دا وسیله کولی شي دا پخلی کړي؟

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

ځواب `refused` دی چې دلیل یې `needs_human_present` دی: پروسه ممکن پرته له څارنې سره مه ترسره شي.
یو کس اضافه کړئ:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

اوس دا `accepted` دی. پلان وایي چې لاس کوم ګامونه ترسره کوي، یو کس کوم ګامونه ترسره کوي، او هر ګام څنګه به چک شي (sensor، logged estimate، وخت یا کس). په براوزر کې په [home page](/#demo) کې ورته کار هڅه کړئ.

## 4. د تودورتیا په Trace کې د خونديې په محدوده (safe band) کې چک کول

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. هرڅه تایید کړئ او د conformance ازموയنې ترسره کړئ

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. د پخلي لاګ (cooking log) په ټریس (trace) یا ډیټا سیټ (dataset) بدلول

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` په هر OpenTelemetry backend کې लोड کیږي. `my-dataset/meta/` د LeRobot-style datasets لپاره د هرې ریسیپي (recipe) مرحلې لپاره یو کار ساتي. دواړه هغه لاګونه ردوي چې د هغوی household برخه نه وه اخیستې.

## بل څه ته

| تاسو څه کوئ | Next |
|---|---|
| د روبوټ یا وسیلې جوړول | [Robots, ROS 2 and datasets](ROBOTICS.md), بیا [Core API](CORE.md#7-execution-lifecycle-and-api) |
| د AI agent جوړول | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) او [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| د پخلنځي یا food bank چلول | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| د ترکیبونو (recipes) لیکل | [Recipe format](RECIPE-FORMAT.md) او [Contributing](../CONTRIBUTING.md) |

