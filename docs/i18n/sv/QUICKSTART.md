<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Snabbstart

Fem minuter, ingen hårdvara. Du kommer att hämta ett recept, hasha det, fråga om en enhet kan tillaga det, kontrollera ett temperaturspår mot en operations säkra band, och exportera en cooklog som ett spår. Allt nedan fungerar idag.

## 1. Hämta verktygen

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` och exportörerna använder endast Pythons standardbibliotek. De andra paketen
är för fullständig validering och signaturer. Ett `pip install cookwala` paket är next på
roadmapen.

## 2. Hämta ett recept och hasha det

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

En exekutor tillagar exakt denna revision och vägrar om hashen den ges inte matchar.

## 3. Kan den här enheten laga det?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Svaret är `refused` med anledningen `needs_human_present`: skärning får inte köras obevakat.
Lägg till en person:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Nu är det `accepted`. Planen anger vilka steg armen utför, vilka en person utför, och hur
varje steg kommer att kontrolleras (sensor, loggad uppskattning, tid eller person). Prova samma sak
i webbläsaren på [home page](/#demo).

## 4. Kontrollera en temperaturkurva mot ett säkert band

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validera allt och kör conformance-testerna

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Omvandla en matlagningslogg till ett spår eller ett dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` laddas in i vilken OpenTelemetry-backend som helst. `my-dataset/meta/` innehåller en uppgift per receptsteg för LeRobot-style dataset. Båda avvisar loggar vars household inte valde att delta.

## Vart härnäst

| Du är | Next |
|---|---|
| Bygger en robot eller apparat | [Robots, ROS 2 and datasets](ROBOTICS.md), sedan [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Bygger en AI-agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) och [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Driver ett kök eller en food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Skriver recept | [Recipe format](RECIPE-FORMAT.md) och [Contributing](../CONTRIBUTING.md) |

