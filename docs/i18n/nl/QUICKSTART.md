<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

Vijf minuten, geen hardware. Je haalt een recept op, hasht het, vraagt of een apparaat het kan koken, controleert een temperatuurtrace tegen de veilige band van een operatie, en exporteert een kooklog als een trace. Alles hieronder werkt vandaag.

## 1. Pak de tools

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` en de exporters gebruiken alleen de Python standaardbibliotheek. De andere pakketten
zijn voor volledige validatie en handtekeningen. Een `pip install cookwala` pakket is next op de
roadmap.

## 2. Haal een recept op en hash het

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Een executor kookt exact deze revisie en weigert als de hash die wordt meegegeven niet overeenkomt.

## 3. Kan dit apparaat het bereiden?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Het antwoord is `refused` met reden `needs_human_present`: snijden mag niet onbeheerd worden uitgevoerd.
Voeg een persoon toe:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Nu is het `accepted`. Het plan geeft aan welke stappen de arm uitvoert, welke een persoon uitvoert, en hoe elke stap gecontroleerd zal worden (sensor, gelogde schatting, tijd of persoon). Probeer hetzelfde in de browser op de [home page](/#demo).

## 4. Controleer een temperatuurtrace tegen een veilige band

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Valideer alles en voer de conformance tests uit

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Zet een kooklog om in een trace of een dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` wordt geladen in elke OpenTelemetry backend. `my-dataset/meta/` bevat één taak per receptstap voor LeRobot-stijl datasets. Beide weigeren logs waarvan de household niet heeft ingestemd.

## Waar nu naar toe

| Je bent | Next |
|---|---|
| Het bouwen van een robot of apparaat | [Robots, ROS 2 and datasets](ROBOTICS.md), dan de [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Het bouwen van een AI agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) en de [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Het runnen van een keuken of food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Het schrijven van recepten | [Recipe format](RECIPE-FORMAT.md) en [Contributing](../CONTRIBUTING.md) |

