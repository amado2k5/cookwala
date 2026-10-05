<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

پانچ منٹ، کوئی ہارڈ ویئر نہیں۔ آپ ایک ترکیب حاصل کریں گے، اسے ہیش کریں گے، پوچھیں گے کہ آیا کوئی ڈیوائس اسے پکا سکتی ہے، کسی آپریشن کے محفوظ بینڈ کے خلاف درجہ حرارت کے ٹریس کو چیک کریں گے، اور کوکنگ لاگ کو ایک ٹریس کے طور پر ایکسپورٹ کریں گے۔ نیچے دی گئی ہر چیز آج کام کرتی ہے۔

## 1. اوزار حاصل کریں

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` اور ایکسپورٹرز صرف Python standard library استعمال کرتے ہیں۔ دیگر پیکیجز مکمل validation اور signatures کے لیے ہیں۔ `pip install cookwala` پیکیج روڈ میپ پر next ہے۔

## 2. ایک ترکیب حاصل کریں اور اسے ہیش کریں

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

ایک executor بالکل یہی revision پکاتا ہے اور اگر اسے دیا گیا hash میچ نہ کرے تو refusal کرتا ہے۔

## 3. کیا یہ ڈیوائس اسے پکا سکتی ہے؟

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

جواب `refused` ہے جس کی وجہ `needs_human_present` ہے: کٹائی (cutting) بغیر نگرانی کے نہیں چل سکتی۔
ایک شخص شامل کریں:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

اب یہ `accepted` ہے۔ منصوبہ بتاتا ہے کہ بازو کون سے اقدامات کرتا ہے، ایک شخص کون سے اقدامات کرتا ہے، اور ہر قدم کو کیسے چیک کیا جائے گا (sensor، logged estimate، وقت یا شخص)۔ براؤزر میں [home page](/#demo) پر وہی چیز آزما کر دیکھیں۔

## 4. ایک محفوظ بینڈ کے خلاف درجہ حرارت کے ٹریس کی جانچ کریں

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. سب کچھ درست کریں اور conformance ٹیسٹ چلائیں

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. ایک कुकिंग لاگ کو ٹریس یا ڈیٹا سیٹ میں تبدیل کریں

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` کسی بھی OpenTelemetry backend میں لوڈ ہو جاتا ہے۔ `my-dataset/meta/` LeRobot-style datasets کے لیے ہر recipe step کے لیے ایک task رکھتا ہے۔ دونوں ان logs کو refuse کرتے ہیں جن کا household opt in نہیں کیا۔

## آگے کیا

| آپ ہیں | Next |
|---|---|
| روبوٹ یا اپلائنس بنانا | [Robots, ROS 2 and datasets](ROBOTICS.md), پھر [Core API](CORE.md#7-execution-lifecycle-and-api) |
| AI ایجنٹ بنانا | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) اور [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| کچن یا food bank چلانا | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| ریسیپیز لکھنا | [Recipe format](RECIPE-FORMAT.md) اور [Contributing](../CONTRIBUTING.md) |

