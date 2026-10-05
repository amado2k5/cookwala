<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

Fünf Minuten, keine Hardware. Sie werden ein Rezept abrufen, es hashen, fragen, ob ein Gerät es kochen kann, eine Temperaturspur gegen das sichere Band einer Operation prüfen und ein Kochprotokoll als Spur exportieren. Alles unten funktioniert heute.

## 1. Hol dir die Werkzeuge

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` und die Exporter verwenden nur die Python-Standardbibliothek. Die anderen Pakete
dienen der vollständigen Validierung und Signaturen. Ein `pip install cookwala` Paket ist next auf der
Roadmap.

## 2. Ein Rezept abrufen und hashen

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Ein Executor kocht genau diese Revision und verweigert, wenn der übergebene Hash nicht übereinstimmt.

## 3. Kann dieses Gerät es kochen?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Die Antwort ist `refused` mit dem Grund `needs_human_present`: das Schneiden darf nicht unbeaufsichtigt ausgeführt werden.
Fügen Sie eine Person hinzu:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Jetzt ist es `accepted`. Der Plan besagt, welche Schritte der Arm ausführt, welche eine Person ausführt und wie jeder Schritt überprüft wird (Sensor, protokolliert geschätzter Wert, Zeit oder Person). Versuchen Sie dasselbe im Browser auf der [home page](/#demo).

## 4. Überprüfen eines Temperaturverlaufs gegen ein sicheres Band

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validieren Sie alles und führen Sie die Conformance-Tests aus

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Einen Kochlog in einen Trace oder einen Datensatz umwandeln

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` wird in jedes OpenTelemetry-Backend geladen. `my-dataset/meta/` enthält eine Aufgabe pro Rezeptschritt für LeRobot-Stil Datensätze. Beide verweigern Logs, deren household nicht opt in gewählt hat.

## Wo als Nächstes

| Sie sind | Next |
|---|---|
| Bau eines Roboters oder Geräts | [Robots, ROS 2 and datasets](ROBOTICS.md), dann die [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Bau eines KI-Agenten | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) und der [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Betrieb einer Küche oder einer food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Schreiben von Rezepten | [Recipe format](RECIPE-FORMAT.md) und [Contributing](../CONTRIBUTING.md) |

