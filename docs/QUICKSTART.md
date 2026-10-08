# Quickstart

Five minutes, no hardware. You will fetch a recipe, hash it, ask whether a device can cook
it, check a temperature trace against an operation's safe band, and export a cooking log
as a trace. Everything below works today.

## 1. Get the tools

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` and the exporters use only the Python standard library. The other packages
are for full validation and signatures. A `pip install cookwala` package is next on the
roadmap.

## 2. Fetch a recipe and hash it

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

An executor cooks exactly this revision and refuses if the hash it is given doesn't match.

## 3. Can this device cook it?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

The answer is `refused` with reason `needs_human_present`: cutting may not run unattended.
Add a person:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Now it is `accepted`. The plan says which steps the arm does, which a person does, and how
each step will be checked (sensor, logged estimate, time or person). Try the same thing
in the browser on the [home page](/#demo).

## 4. Check a temperature trace against a safe band

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validate everything and run the conformance tests

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 137 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Turn a cooking log into a trace or a dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` loads into any OpenTelemetry backend. `my-dataset/meta/` holds one task per
recipe step for LeRobot-style datasets. Both refuse logs whose household didn't opt in.

## Where next

| You are | Next |
|---|---|
| Building a robot or appliance | [Robots, ROS 2 and datasets](ROBOTICS.md), then the [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Building an AI agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) and the [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Running a kitchen or food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Writing recipes | [Recipe format](RECIPE-FORMAT.md) and [Contributing](../CONTRIBUTING.md) |

## 7. More

- The recipe index: 2,266 documents at https://cookwala.ai/recipes/ (9 written for the standard at V1; 2,257 imported from fifi.cooking at V0, with text in 29 languages).
- The SDK in your language and 100 executed scenarios: https://cookwala.ai/scenarios/ (`scenarios/OPERATIONS.md` lists the 25 operations; `python tools/scenarios/run.py` executes every scenario against a hub).
