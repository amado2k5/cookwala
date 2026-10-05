<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# Quickstart

Cinco minutos, sin hardware. Obtendrás una receta, le aplicarás un hash, preguntarás si un dispositivo puede cocinarla, comprobarás un rastro de temperatura frente a la banda segura de una operación y exportarás un registro de cocción como un rastro. Todo lo siguiente funciona hoy.

## 1. Obtener las herramientas

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` y los exportadores utilizan únicamente la biblioteca estándar de Python. Los otros paquetes
son para validación completa y firmas. Un paquete `pip install cookwala` es next en la
hoja de ruta.

## 2. Obtener una receta y calcular su hash

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Un ejecutor cocina exactamente esta revisión y se niega si el hash que se le da no coincide.

## 3. ¿Puede este dispositivo cocinarlo?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

La respuesta es `refused` con el motivo `needs_human_present`: el corte no puede ejecutarse sin supervisión.
Añada una persona:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Ahora está `accepted`. El plan dice qué pasos hace el brazo, qué pasos hace una persona y cómo se comprobará cada paso (sensor, estimación registrada, tiempo o persona). Intenta lo mismo en el navegador en la [home page](/#demo).

## 4. Comprobar una traza de temperatura contra una banda segura

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validar todo y ejecutar las pruebas de conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Convertir un registro de cocina en un trazo o un conjunto de datos

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` se carga en cualquier backend de OpenTelemetry. `my-dataset/meta/` contiene una tarea por paso de receta para conjuntos de datos estilo LeRobot. Ambos rechazan logs cuyo household no optó por participar.

## Qué sigue después

| Tú eres | Next |
|---|---|
| Construyendo un robot o electrodoméstico | [Robots, ROS 2 and datasets](ROBOTICS.md), luego la [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Construyendo un agente de IA | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) y el [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Dirigiendo una cocina o food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Escribiendo recetas | [Recipe format](RECIPE-FORMAT.md) y [Contributing](../CONTRIBUTING.md) |

