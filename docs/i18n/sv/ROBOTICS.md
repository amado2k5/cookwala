<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala och robotikstacken

Cookwala ersätter inte någon del av en robot. Den lägger till det lager som robotstacken saknar för matlagning: **vad som ska göras, när varje steg är klart, och vad som aldrig får hända**, i en form som vilken robot, apparat, simulator eller lärandepipeline som helst kan läsa och kontrollera.

## Var det passar in

| Lager | Exempel på lagret (2026; ingen integration med någon av dem existerar) | Vad Cookwala tillför |
|---|---|---|
| Robotar och apparater | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, köksrobotar (Moley, Miso, Chef Robotics), smarta ugnar | Ett enhetsoberoende recept som den kan dry-run, vägra eller laga; säkerhetsgränser på enheten |
| Middleware | ROS 2, ros-controls, Open-RMF (flottor), Matter (apparater) | ROS 2 actions för recept och steg (`bindings/ros2`); en utkast-Matter op-mappning (`bindings/matter.json`, overifierad); en Open-RMF-uppgift är ett planerat bidrag |
| Robotinlärning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π-modeller, Figure Helix | Steguppgifter i naturligt språk och stegsegment för dataset; done-kriterier som utvärderingsmål |
| Simulering | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes och conformance-vektorer som testförhållanden |
| AI-agenter | MCP, A2A, Claude, OpenAI och öppna modeller | AgentMandate, untrusted-text rule, kitchen agent-safety benchmark |

Cookwala är avsiktligt **above motion**. Moderna robotar lär sig manipulation end to end;
Cookwala ger dem uppgiften, framgångstestet och säkerhetskuvertet, och får tillbaka en
execution log.

## ROS 2

`bindings/ros2/` definierar två åtgärder:

| Åtgärd | Mål | Feedback | Resultat |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Slutgiltigt tillstånd, refusal reason, `ExecutionLog` |
| `ExecuteNode` | En receptnod, dess operation envelope, ett valfritt smalare mål | Progress, medium temperature, mål uppnått | Envelope OK, rung used, step summary, deviation |

**Avbrytande** av ett `ExecuteRecipe`-mål är en `StopRequest`: servern måste stanna säkert.
**Säkerhetsgränser** stannar inuti enheten; inget målfält kan ändra dem. En hub som delar upp ett
recept över flera robotar skickar `ExecuteNode`-mål, och kan lämna över flottnivå-dispatch
till **Open-RMF** som uppgifter.

## LeRobot och robot-learning-dataset

LeRobots loop är teleoperate → record → train → deploy, och dess LeRobotDataset v2.1 lagrar
naturliga språk-uppgifter i `meta/tasks.jsonl` (v3 flyttade metadata till parquet; exportören skriver
v2.1-stilen idag och en v3-skrivare är next). Cookwala-recept innehåller redan en mening
per steg, och execution logs registrerar när varje steg startade och slutade.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Detta skriver:
- `meta/tasks.jsonl`, en uppgift per receptsteg;
- `meta/cookwala/<log>.json` med receptets hash, stegsegment (start- och slutsekunder,
  sensor-ladder-steg, envelope-resultat) och hushållets samtycke.

Video och åtgärder kommer från robotens egen recorder. Exporten vägrar loggar utan dataset consent.

## Simulering

Conformance-vektorerna i `conformance/envelope.json` (temperaturspår med förväntade
resultat) och sensor-ladder-reglerna är redo för simulator. En termisk eller fysikalisk simulering av
en panna, en kastrull eller en ugn kan poängsättas mot samma envelopes som en verklig enhet måste hålla.
Isaac Lab, Gazebo och MuJoCo är kandidater för ett publikt "cook in simulation" benchmark.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Detta skriver en OpenTelemetry-trace: en span per steg, med `cookwala.*` attribut (rung,
envelope OK, deviation) och safety-limit events. Den laddas in i vilken OTLP backend
som helst (Jaeger, Grafana Tempo, LangSmith…), så att team kan debugga enheter på samma sätt som de debuggar agenter.

## Dry run: kan denna enhet laga detta recept?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run ger svar innan något värms upp. Den anger vilka steg enheten utför, vilka en person utför, hur varje steg kommer att verifieras (sensor, modell, tid eller person), eller den första anledningen till att den måste neka.

