# Cookwala and the robotics stack

Cookwala doesn't replace any part of a robot. It adds the layer the robotics stack is
missing for cooking: **what to make, when each step is done, and what must never happen**,
in a form any robot, appliance, simulator or learning pipeline can read and check.

## Where it fits

| Layer | Examples (2026) | What Cookwala adds |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | A device-independent recipe it can dry-run, refuse or cook; on-device safety limits |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ROS 2 actions for recipes and steps; an Open-RMF task for multi-robot kitchens; a Matter binding |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Natural-language step tasks and step segments for datasets; done criteria as evaluation targets |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes and conformance vectors as test conditions |
| AI agents | MCP, A2A, Claude, OpenAI and open models | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala is deliberately **above motion**. Modern robots learn manipulation end to end;
Cookwala gives them the task, the success test and the safety envelope, and gets back an
execution log.

## ROS 2

`bindings/ros2/` defines two actions:

| Action | Goal | Feedback | Result |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Final state, refusal reason, `ExecutionLog` |
| `ExecuteNode` | One recipe node, its operation envelope, an optional narrower target | Progress, medium temperature, target reached | Envelope OK, rung used, step summary, deviation |

**Cancelling** an `ExecuteRecipe` goal is a `StopRequest`: the server must stop safely.
**Safety limits** stay inside the device; no goal field can change them. A hub that splits a
recipe across several robots sends `ExecuteNode` goals, and can hand fleet-level dispatch
to **Open-RMF** as tasks.

## LeRobot and robot-learning datasets

LeRobot's loop is teleoperate → record → train → deploy, and its LeRobotDataset v3 stores
natural-language tasks in `meta/tasks.jsonl`. Cookwala recipes already contain one sentence
per step, and execution logs record when each step started and ended.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

This writes:
- `meta/tasks.jsonl`, one task per recipe step;
- `meta/cookwala/<log>.json` with the recipe hash, step segments (start and end seconds,
  sensor-ladder rung, envelope result) and the household's consent.

Video and actions come from the robot's own recorder. The export refuses logs without
dataset consent.

## Simulation

The conformance vectors in `conformance/envelope.json` (temperature traces with expected
results) and the sensor-ladder rules are simulator-ready. A thermal or physics simulation of
a pan, a pot or an oven can be scored against the same envelopes a real device must keep.
Isaac Lab, Gazebo and MuJoCo are candidates for a public "cook in simulation" benchmark.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

This writes an OpenTelemetry trace: one span per step, with `cookwala.*` attributes (rung,
envelope OK, deviation) and safety-limit events. It loads into any OTLP backend
(Jaeger, Grafana Tempo, LangSmith…), so teams can debug devices the way they debug agents.

## Dry run: can this device cook this recipe?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

The dry run answers before anything heats up. It says which steps the device does, which a
person does, how each step will be verified (sensor, model, time or person), or the first
reason it must refuse.
