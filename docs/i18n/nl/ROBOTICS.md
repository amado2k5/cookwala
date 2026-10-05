<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala en de robotics stack

Cookwala vervangt geen enkel onderdeel van een robot. Het voegt de laag toe die de robotics stack mist voor koken: **wat te maken, wanneer elke stap is voltooid, en wat nooit mag gebeuren**, in een vorm die elke robot, apparaat, simulator of learning pipeline kan lezen en controleren.

## Waar het past

| Laag | Voorbeelden van de laag (2026; er bestaat geen integratie met een van hen) | Wat Cookwala toevoegt |
|---|---|---|
| Robots en apparaten | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, keukenrobots (Moley, Miso, Chef Robotics), slimme ovens | Een apparaatonafhankelijk recept dat het kan dry-run, weigeren of koken; veiligheidslimieten op het apparaat |
| Middleware | ROS 2, ros-controls, Open-RMF (vloten), Matter (apparaten) | ROS 2 acties voor recepten en stappen (`bindings/ros2`); een concept Matter op mapping (`bindings/matter.json`, niet geverifieerd); een Open-RMF taak is een geplande bijdrage |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π modellen, Figure Helix | Natuurlijke taal stap-taken en stapsegmenten voor datasets; done criteria als evaluatiedoelen |
| Simulatie | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes en conformance vectoren als testcondities |
| AI agents | MCP, A2A, Claude, OpenAI en open modellen | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala is opzettelijk **boven beweging**. Moderne robots leren manipulatie end to end;
Cookwala geeft hen de taak, de succes-test en de safety envelope, en krijgt een
execution log terug.

## ROS 2

`bindings/ros2/` definieert twee acties:

| Actie | Doel | Feedback | Resultaat |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Eindstatus, refusal reason, `ExecutionLog` |
| `ExecuteNode` | Eén recipe node, de operation envelope, een optioneel nauwer doel | Voortgang, medium temperature, doel bereikt | Envelope OK, rung gebruikt, step summary, afwijking |

**Het annuleren** van een `ExecuteRecipe` doel is een `StopRequest`: de server moet veilig stoppen.
**Veiligheidslimieten** blijven binnen het apparaat; geen enkel doelveld kan ze veranderen. Een hub die een
recept verdeelt over verschillende robots stuurt `ExecuteNode` doelen, en kan vloot-niveau dispatch
overdragen aan **Open-RMF** als taken.

## LeRobot en robot-learning datasets

De loop van LeRobot is teleoperate → record → train → deploy, en de LeRobotDataset v2.1 slaat
natuurlijke taal taken op in `meta/tasks.jsonl` (v3 verplaatste metadata naar parquet; de exporter schrijft
vandaag het bestand in v2.1-stijl en een v3 writer is next). Cookwala recepten bevatten al één zin
per stap, en execution logs registreren wanneer elke stap begon en eindigde.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Dit schrijft:
- `meta/tasks.jsonl`, één taak per receptstap;
- `meta/cookwala/<log>.json` met de recept hash, stapsegmenten (start en eind seconden,
  sensor-ladder trede, envelope resultaat) en de toestemming van het huishouden.

Video en acties komen van de eigen recorder van de robot. De export weigert logs zonder
dataset consent.

## Simulatie

De conformance vectoren in `conformance/envelope.json` (temperatuursporen met verwachte
resultaten) en de sensor-ladder regels zijn simulator-klaar. Een thermische of fysica simulatie van
een pan, een pot of een oven kan worden gescoord tegen dezelfde envelopes die een echt apparaat moet aanhouden.
Isaac Lab, Gazebo en MuJoCo zijn kandidaten voor een publieke "cook in simulation" benchmark.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Dit schrijft een OpenTelemetry trace: één span per stap, met `cookwala.*` attributen (rung, envelope OK, deviation) en safety-limit events. Het laadt in elke OTLP backend (Jaeger, Grafana Tempo, LangSmith…), zodat teams apparaten kunnen debuggen op de manier waarop ze agents debuggen.

## Dry run: kan dit apparaat dit recept koken?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

De dry run geeft antwoorden voordat er iets opwarmt. Het geeft aan welke stappen het apparaat uitvoert, welke een persoon uitvoert, hoe elke stap wordt geverifieerd (sensor, model, tijd of persoon), of de eerste reden waarom het een refusal before heat moet geven.

