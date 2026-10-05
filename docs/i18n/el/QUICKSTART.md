<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Γρήγορη έναρξη

Πέντε λεπτά, χωρίς hardware. Θα φέρετε μια συνταγή, θα την κάνετε hash, θα ρωτήσετε αν ένα device μπορεί να την μαγειρέψει, θα ελέγξετε ένα temperature trace σε σχέση με το safe band μιας operation και θα εξάγετε ένα cooking log ως trace. Όλα παρακάτω λειτουργούν σήμερα.

## 1. Αποκτήστε τα εργαλεία

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` και οι exporters χρησιμοποιούν μόνο τη Python standard library. Τα άλλα πακέτα
είναι για πλήρη validation και signatures. Ένα πακέτο `pip install cookwala` είναι next στο
roadmap.

## 2. Fetch a recipe and hash it

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Ένας executor μαγειρεύει ακριβώς αυτή την έκδοση και αρνείται εάν το hash που του δίνεται δεν ταιριάζει.

## 3. Μπορεί αυτή η συσκευή να το μαγειρέψει;

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Η απάντηση είναι `refused` με λόγο `needs_human_present`: η κοπή δεν μπορεί να εκτελεστεί χωρίς επίβλεψη.
Προσθέστε ένα άτομο:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Τώρα είναι `accepted`. Το σχέδιο αναφέρει ποια βήματα εκτελεί ο βραχίονας, ποια εκτελεί ένας άνθρωπος και πώς θα ελεγχθεί κάθε βήμα (sensor, logged estimate, time ή person). Δοκιμάστε το ίδιο στο browser στη [home page](/#demo).

## 4. Ελέγξτε μια καταγεγραμμένη θερμοκρασία σε σχέση με ένα ασφαλές εύρος

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Επαληθεύστε τα πάντα και εκτελέστε τα conformance tests

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Μετατρέψτε ένα καταλόγιο μαγειρέματος σε ένα trace ή ένα dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` φορτώνει σε οποιοδήποτε OpenTelemetry backend. Το `my-dataset/meta/` περιέχει μία εργασία ανά βήμα συνταγής για datasets τύπου LeRobot. Και τα δύο αρνούνται logs των οποίων το household δεν επέλεξε opt in.

## Πού μετά

| Είστε | Next |
|---|---|
| Κατασκευάζετε ένα ρομπότ ή μια συσκευή | [Robots, ROS 2 and datasets](ROBOTICS.md), μετά το [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Κατασκευάζετε έναν AI agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) και το [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Διαχειρίζεστε μια κουζίνα ή ένα food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Γράφετε συνταγές | [Recipe format](RECIPE-FORMAT.md) και [Contributing](../CONTRIBUTING.md) |

