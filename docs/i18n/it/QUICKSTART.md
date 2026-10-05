<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

Cinque minuti, nessun hardware. Recupererai una ricetta, la trasformerai in hash, chiederai se un dispositivo può cucinarla, controllerai una traccia di temperatura rispetto alla banda sicura di un'operazione ed esporterai un log di cottura come traccia. Tutto ciò che segue funziona oggi.

## 1. Ottieni gli strumenti

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` e gli exporter utilizzano solo la libreria standard Python. Gli altri pacchetti
sono per la validazione completa e le firme. Un pacchetto `pip install cookwala` è next nella
roadmap.

## 2. Recupera una ricetta e calcolane l'hash

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Un executor cucina esattamente questa revisione e rifiuta se l'hash fornito non corrisponde.

## 3. Questo dispositivo può cucinarlo?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

La risposta è `refused` con motivo `needs_human_present`: il taglio potrebbe non essere eseguito senza supervisione.
Aggiungi una persona:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Ora è `accepted`. Il piano indica quali passaggi compie il braccio, quali compie una persona e come ogni passaggio sarà controllato (sensor, logged estimate, time o person). Prova la stessa cosa nel browser sulla [home page](/#demo).

## 4. Controllare una traccia di temperatura rispetto a una banda di sicurezza

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Valida tutto ed esegui i test di conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Trasformare un log di cottura in una traccia o in un dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` viene caricato in qualsiasi backend OpenTelemetry. `my-dataset/meta/` contiene un task per ogni passaggio della ricetta per i dataset in stile LeRobot. Entrambi rifiutano i log il cui household non ha effettuato l'opt in.

## Dove dopo

| Tu sei | Next |
|---|---|
| Costruire un robot o un elettrodomestico | [Robots, ROS 2 and datasets](ROBOTICS.md), poi la [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Costruire un agente AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) e l' [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Gestire una cucina o un food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Scrivere ricette | [Recipe format](RECIPE-FORMAT.md) e [Contributing](../CONTRIBUTING.md) |

