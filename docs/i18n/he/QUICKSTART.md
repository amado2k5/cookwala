<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

חמש דקות, ללא חומרה. תביאו מתכון, תבצעו לו hash, תשאלו האם מכשיר יכול לבשל אותו, תבדקו עקבת טמפרטורה מול הטווח הבטוח של פעולה, ותייצאו יומן בישול כעקבה. כל מה שמופיע מטה עובד היום.

## 1. השג את הכלים

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` והמייצאים משתמשים רק בספריית הסטנדרט של Python. החבילות האחרות
נועדו לאימות מלא וחתימות. חבילת `pip install cookwala` היא ה-next ב-
roadmap.

## 2. Fetch a recipe and hash it

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

מבצע מבשל בדיוק את הגרסה הזו ומסרב אם ה-hash שניתן לו אינו תואם.

## 3. האם המכשיר הזה יכול לבשל את זה?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

התשובה היא `refused` עם הסיבה `needs_human_present`: חיתוך אינו יכול להתבצע ללא השגחה.
הוסף אדם:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

כעת הוא `accepted`. התוכנית מציינת אילו שלבים הזרוע מבצעת, אילו שלבים אדם מבצע, וכיצד
כל שלב ייבדק (sensor, הערכה מתועדת, זמן או אדם). נסה את אותו הדבר
בדפדפן ב-[home page](/#demo).

## 4. בדוק עקבת טמפרטורה מול טווח בטוח

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. וודא הכל והרצ את בדיקות ה-conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. הפוך יומן בישול ל-trace או ל-dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` נטען לכל backend של OpenTelemetry. `my-dataset/meta/` מחזיק משימה אחת לכל
שלב במתכון עבור datasets בסגנון LeRobot. שניהם מסרבים ללוגים שבהם ה-household לא בחר ב-opt in.

## לאן הלאה

| אתה | Next |
|---|---|
| בונה רובוט או מכשיר | [Robots, ROS 2 and datasets](ROBOTICS.md), ואז ה-[Core API](CORE.md#7-execution-lifecycle-and-api) |
| בונה סוכן AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) וה-[agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| מנהל מטבח או food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| כותב מתכונים | [Recipe format](RECIPE-FORMAT.md) ו-[Contributing](../CONTRIBUTING.md) |

