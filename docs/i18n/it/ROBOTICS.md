<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala e lo stack robotico

Cookwala non sostituisce alcuna parte di un robot. Aggiunge lo strato che manca allo stack di robotica per la cucina: **cosa preparare, quando ogni passaggio è completato e cosa non deve mai accadere**, in una forma che qualsiasi robot, elettrodomestico, simulatore o pipeline di apprendimento può leggere e controllare.

## Dove si inserisce

| Layer | Esempi del layer (2026; non esiste alcuna integrazione con essi) | Cosa aggiunge Cookwala |
|---|---|---|
| Robots and appliances | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, kitchen robots (Moley, Miso, Chef Robotics), smart ovens | Una ricetta indipendente dal dispositivo che può eseguire un dry run, rifiutare o cucinare; limiti di sicurezza on-device |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | ROS 2 actions per ricette e step (`bindings/ros2`); una bozza di mappatura op Matter (`bindings/matter.json`, non verificata); un task Open-RMF è un contributo pianificato |
| Robot learning | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Task in linguaggio naturale e segmenti di step per dataset; criteri di done come obiettivi di valutazione |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelope e vettori di conformance come condizioni di test |
| AI agents | MCP, A2A, Claude, OpenAI and open models | AgentMandate, rule untrusted-text, kitchen agent-safety benchmark |

Cookwala è deliberatamente **above motion**. I robot moderni imparano la manipolazione end to end;
Cookwala fornisce loro il compito, il test di successo e la safety envelope, e riceve in cambio un
execution log.

## ROS 2

`bindings/ros2/` definisce due azioni:

| Azione | Obiettivo | Feedback | Risultato |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Stato finale, motivo del refusal, `ExecutionLog` |
| `ExecuteNode` | Un nodo della ricetta, la sua operation envelope, un target opzionale più ristretto | Progresso, medium temperature, target raggiunto | Envelope OK, rung utilizzato, riepilogo dello step, deviazione |

**Annullare** un obiettivo `ExecuteRecipe` è una `StopRequest`: il server deve fermarsi in sicurezza.
I **limiti di sicurezza** rimangono all'interno del dispositivo; nessun campo dell'obiettivo può modificarli. Un hub che suddivide una ricetta tra diversi robot invia obiettivi `ExecuteNode` e può delegare il dispatch a livello di flotta a **Open-RMF** come task.

## LeRobot e i dataset di robot-learning

Il loop di LeRobot è teleoperate → record → train → deploy, e il suo LeRobotDataset v2.1 memorizza
task in linguaggio naturale in `meta/tasks.jsonl` (v3 ha spostato i metadati in parquet; l'exporter scrive il
file in stile v2.1 oggi e un writer v3 è next). Le ricette Cookwala contengono già una frase
per ogni step, e gli execution log registrano quando ogni step è iniziato e terminato.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Questo scrive:
- `meta/tasks.jsonl`, un task per ogni passaggio della ricetta;
- `meta/cookwala/<log>.json` con l'hash della ricetta, i segmenti del passaggio (secondi di inizio e fine,
  sensor-ladder rung, envelope result) e il consenso della household.

Video e azioni provengono dal registratore del robot stesso. L'esportazione rifiuta i log senza il consenso del dataset.

## Simulazione

I vettori di conformance in `conformance/envelope.json` (tracce di temperatura con risultati attesi) e le regole della sensor-ladder sono pronti per il simulatore. Una simulazione termica o fisica di una padella, una pentola o un forno può essere valutata rispetto agli stessi envelope che un dispositivo reale deve mantenere. Isaac Lab, Gazebo e MuJoCo sono candidati per un benchmark pubblico "cook in simulation".

## Osservabilità

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Questo scrive una traccia OpenTelemetry: uno span per ogni passaggio, con attributi `cookwala.*` (rung, envelope OK, deviation) ed eventi di limite di sicurezza. Carica in qualsiasi backend OTLP (Jaeger, Grafana Tempo, LangSmith…), così i team possono eseguire il debug dei dispositivi nello stesso modo in cui eseguono il debug degli agenti.

## Dry run: questo dispositivo può cucinare questa ricetta?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

Il dry run risponde prima che qualsiasi cosa si scaldi. Indica quali passaggi esegue il dispositivo, quali esegue una persona, come ogni passaggio sarà verificato (sensor, model, time o persona), o il primo motivo per cui deve rifiutare.

