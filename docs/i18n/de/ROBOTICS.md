<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala und der Robotics-Stack

Cookwala ersetzt keinen Teil eines Roboters. Es fügt die Ebene hinzu, die dem Robotics-Stack für das Kochen fehlt: **was zubereitet werden soll, wann jeder Schritt abgeschlossen ist und was niemals passieren darf**, in einer Form, die jeder Roboter, jedes Gerät, jeder Simulator oder jede Learning-Pipeline lesen und prüfen kann.

## Wo es passt

| Layer | Beispiele für die Layer (2026; keine Integration mit ihnen existiert) | Was Cookwala hinzufügt |
|---|---|---|
| Roboter und Geräte | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, Küchenroboter (Moley, Miso, Chef Robotics), Smart Ovens | Ein geräteunabhängiges Rezept, das es dry-run, verweigern oder kochen kann; On-Device-Sicherheitslimits |
| Middleware | ROS 2, ros-controls, Open-RMF (Flotten), Matter (Geräte) | ROS 2 Actions für Rezepte und Schritte (`bindings/ros2`); ein Entwurf für ein Matter op Mapping (`bindings/matter.json`, unverified); eine Open-RMF Task ist ein geplanter Beitrag |
| Roboterlernen | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π Modelle, Figure Helix | Aufgaben in natürlicher Sprache und Schrittsegmente für Datensätze; Done-Kriterien als Evaluationsziele |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes und Conformance-Vektoren als Testbedingungen |
| KI-Agenten | MCP, A2A, Claude, OpenAI und Open Models | AgentMandate, untrusted-text rule, Kitchen Agent-Safety Benchmark |

Cookwala ist bewusst **über Bewegung**. Moderne Roboter lernen Manipulation von Ende zu Ende;
Cookwala gibt ihnen die Aufgabe, den Erfolgstest und den Sicherheitsbereich vor, und erhält als Rückmeldung ein
execution log.

## ROS 2

`bindings/ros2/` definiert zwei Aktionen:

| Aktion | Ziel | Feedback | Ergebnis |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Endzustand, refusal reason, `ExecutionLog` |
| `ExecuteNode` | Ein Rezeptknoten, sein operation envelope, ein optionales engeres Ziel | Fortschritt, medium temperature, Ziel erreicht | Envelope OK, rung verwendet, Schrittzusammenfassung, Abweichung |

**Abbrechen** eines `ExecuteRecipe` Ziels ist ein `StopRequest`: der Server muss sicher stoppen.
**Sicherheitsgrenzwerte** bleiben innerhalb des Geräts; kein Zielfeld kann sie ändern. Ein hub, der ein Rezept auf mehrere Roboter aufteilt, sendet `ExecuteNode` Ziele und kann die Flottensteuerung an **Open-RMF** als Aufgaben übergeben.

## LeRobot und Robot-Learning-Datensätze

Der Loop von LeRobot ist teleoperate → record → train → deploy, und sein LeRobotDataset v2.1 speichert
Natural-Language-Aufgaben in `meta/tasks.jsonl` (v3 hat Metadaten nach parquet verschoben; der Exporter schreibt heute die
Datei im v2.1-Stil und ein v3-Writer ist next). Cookwala-Rezepte enthalten bereits einen Satz
pro Schritt, und execution logs zeichnen auf, wann jeder Schritt begann und endete.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Dies schreibt:
- `meta/tasks.jsonl`, eine Aufgabe pro Rezeptschritt;
- `meta/cookwala/<log>.json` mit dem Rezept-Hash, Schrittsegmenten (Start- und Endsekunden,
  sensor-ladder Sprosse, envelope Ergebnis) und der Einwilligung des Haushalts.

Video und Aktionen stammen aus dem eigenen Rekorder des Roboters. Der Export verweigert Logs ohne dataset consent.

## Simulation

Die Conformance-Vektoren in `conformance/envelope.json` (Temperaturverläufe mit erwarteten Ergebnissen) und die Sensor-Ladder-Regeln sind bereit für den Simulator. Eine thermische oder physikalische Simulation einer Pfanne, eines Topfes oder eines Ofens kann gegen dieselben Envelopes geprüft werden, die ein reales Gerät einhalten muss. Isaac Lab, Gazebo und MuJoCo sind Kandidaten für einen öffentlichen „cook in simulation“-Benchmark.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Dies schreibt einen OpenTelemetry-Trace: ein Span pro Schritt, mit `cookwala.*` Attributen (rung, envelope OK, deviation) und Sicherheitslimit-Events. Es wird in jedes OTLP-Backend geladen (Jaeger, Grafana Tempo, LangSmith…), sodass Teams Geräte so debuggen können, wie sie Agenten debuggen.

## Dry run: kann dieses Gerät dieses Rezept kochen?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

Der dry run liefert Antworten, bevor etwas aufheizt. Er besagt, welche Schritte das Gerät ausführt, welche eine Person ausführt, wie jeder Schritt verifiziert wird (sensor, model, time oder person) oder der erste Grund, warum es eine refusal before heat ausführen muss.

