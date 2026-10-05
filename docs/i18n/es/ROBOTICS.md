<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala y el stack de robótica

Cookwala no reemplaza ninguna parte de un robot. Añade la capa que le falta al stack de robótica para cocinar: **qué hacer, cuándo se completa cada paso y qué es lo que nunca debe suceder**, en una forma que cualquier robot, electrodoméstico, simulador o pipeline de aprendizaje pueda leer y verificar.

## Dónde encaja

| Capa | Ejemplos de la capa (2026; no existe integración con ninguno de ellos) | Lo que Cookwala añade |
|---|---|---|
| Robots y electrodomésticos | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, robots de cocina (Moley, Miso, Chef Robotics), hornos inteligentes | Una receta independiente del dispositivo que puede realizar un dry run, rechazar o cocinar; límites de seguridad en el dispositivo |
| Middleware | ROS 2, ros-controls, Open-RMF (flotas), Matter (electrodomésticos) | Acciones de ROS 2 para recetas y pasos (`bindings/ros2`); un borrador de mapeo de op de Matter (`bindings/matter.json`, no verificado); una tarea de Open-RMF es una contribución planificada |
| Aprendizaje de robots | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Tareas de pasos en lenguaje natural y segmentos de pasos para conjuntos de datos; criterios de "done" como objetivos de evaluación |
| Simulación | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes y vectores de conformance como condiciones de prueba |
| Agentes de IA | MCP, A2A, Claude, OpenAI y modelos abiertos | AgentMandate, regla de untrusted-text, benchmark de seguridad de agentes de cocina |

Cookwala está deliberadamente **above motion**. Los robots modernos aprenden la manipulación de extremo a extremo;
Cookwala les da la tarea, la prueba de éxito y el safety envelope, y recibe a cambio un
execution log.

## ROS 2

`bindings/ros2/` define dos acciones:

| Acción | Objetivo | Feedback | Resultado |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Estado final, motivo de refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Un nodo de receta, su operation envelope, un objetivo opcional más estrecho | Progreso, medium temperature, objetivo alcanzado | Envelope OK, rung utilizado, resumen de paso, desviación |

**Cancelar** un objetivo `ExecuteRecipe` es un `StopRequest`: el servidor debe detenerse de forma segura.
Los **límites de seguridad** permanecen dentro del dispositivo; ningún campo de objetivo puede cambiarlos. Un hub que divide una receta entre varios robots envía objetivos `ExecuteNode`, y puede entregar el despacho a nivel de flota a **Open-RMF** como tareas.

## LeRobot y conjuntos de datos de robot-learning

El bucle de LeRobot es teleoperate → record → train → deploy, y su LeRobotDataset v2.1 almacena
tareas en lenguaje natural en `meta/tasks.jsonl` (v3 movió los metadatos a parquet; el exportador escribe el
archivo estilo v2.1 hoy y un escritor v3 es next). Las recetas de Cookwala ya contienen una oración
por paso, y los execution logs registran cuándo cada paso comenzó y terminó.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Esto escribe:
- `meta/tasks.jsonl`, una tarea por paso de la receta;
- `meta/cookwala/<log>.json` con el hash de la receta, los segmentos del paso (segundos de inicio y fin,
  sensor-ladder rung, envelope result) y el consentimiento del household.

El video y las acciones provienen del propio grabador del robot. La exportación rechaza los logs sin el consentimiento del dataset.

## Simulación

Los vectores de conformance en `conformance/envelope.json` (trazas de temperatura con resultados esperados) y las reglas de sensor-ladder están listos para el simulador. Una simulación térmica o física de una sartén, una olla o un horno puede calificarse frente a los mismos envelopes que un dispositivo real debe mantener. Isaac Lab, Gazebo y MuJoCo son candidatos para un benchmark público de "cook in simulation".

## Observabilidad

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Esto escribe un trazo de OpenTelemetry: un span por paso, con atributos `cookwala.*` (rung, envelope OK, deviation) y eventos de límite de seguridad. Se carga en cualquier backend OTLP (Jaeger, Grafana Tempo, LangSmith…), para que los equipos puedan depurar dispositivos de la misma manera que depuran agentes.

## Dry run: ¿puede este dispositivo cocinar esta receta?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

El dry run responde antes de que algo se caliente. Indica qué pasos realiza el dispositivo, qué pasos realiza una persona, cómo se verificará cada paso (sensor, modelo, tiempo o persona), o la primera razón por la que debe haber refusal before heat.

