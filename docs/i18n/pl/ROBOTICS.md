<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala i stos robotyki

Cookwala nie zastępuje żadnej części robota. Dodaje warstwę, której brakuje stosowi robotyki w kontekście gotowania: **co przygotować, kiedy każdy krok jest gotowy i co nigdy nie może się wydarzyć**, w formie, którą każdy robot, urządzenie, symulator lub potok uczenia może odczytać i sprawdzić.

## Gdzie to pasuje

| Warstwa | Przykłady warstwy (2026; nie istnieje integracja z żadną z nich) | Co dodaje Cookwala |
|---|---|---|
| Roboty i urządzenia | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, roboty kuchenne (Moley, Miso, Chef Robotics), inteligentne piekarniki | Niezależny od urządzenia przepis, który może wykonać dry run, odmówić lub ugotować; ograniczenia bezpieczeństwa na urządzeniu |
| Middleware | ROS 2, ros-controls, Open-RMF (floty), Matter (urządzenia) | Akcje ROS 2 dla przepisów i kroków (`bindings/ros2`); projekt mapowania operacji Matter (`bindings/matter.json`, niezweryfikowane); zadanie Open-RMF jest planowanym wkładem |
| Uczenie robotów | LeRobot (Hugging Face), NVIDIA Isaac GR00T, modele Physical Intelligence π, Figure Helix | Zadania krokowe w języku naturalnym i segmenty kroków dla zbiorów danych; kryteria ukończenia jako cele ewaluacji |
| Symulacja | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes i wektory conformance jako warunki testowe |
| Agenci AI | MCP, A2A, Claude, OpenAI i modele open source | AgentMandate, reguła untrusted-text, benchmark kitchen agent-safety |

Cookwala jest celowo **above motion**. Nowoczesne roboty uczą się manipulacji end to end;
Cookwala daje im zadanie, test sukcesu oraz safety envelope, i otrzymuje w zamian
execution log.

## ROS 2

`bindings/ros2/` definiuje dwie akcje:

| Akcja | Cel | Informacja zwrotna | Wynik |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Stan końcowy, powód refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Jeden węzeł przepisu, jego operation envelope, opcjonalny węższy cel | Postęp, medium temperature, cel osiągnięty | Envelope OK, użyty rung, podsumowanie kroku, odchylenie |

**Anulowanie** celu `ExecuteRecipe` to `StopRequest`: serwer musi bezpiecznie przerwać działanie.
**Limity bezpieczeństwa** pozostają wewnątrz urządzenia; żadne pole celu nie może ich zmienić. hub, który rozdziela przepis na kilka robotów, wysyła cele `ExecuteNode` i może przekazać dyspozytację na poziomie floty do **Open-RMF** jako zadania.

## LeRobot i zestawy danych do uczenia robotów

Pętla LeRobot to teleoperate → record → train → deploy, a jej LeRobotDataset v2.1 przechowuje
zadania w języku naturalnym w `meta/tasks.jsonl` (v3 przeniosło metadane do parquet; exporter zapisuje dziś
plik w stylu v2.1, a writer v3 jest next). Przepisy Cookwala zawierają już jedno zdanie
na krok, a execution logs rejestrują, kiedy każdy krok się rozpoczął i zakończył.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

To zapisuje:
- `meta/tasks.jsonl`, jeden task na krok przepisu;
- `meta/cookwala/<log>.json` z hashem przepisu, segmentami kroków (sekundy startu i końca,
  sensor-ladder rung, wynik envelope) oraz zgodą household.

Wideo i działania pochodzą z własnego rejestratora robota. Eksport odrzuca logi bez zgody na dataset.

## Symulacja

Wektory conformance w `conformance/envelope.json` (wykresy temperatury z oczekiwanymi wynikami) oraz reguły sensor-ladder są gotowe do użycia w symulatorze. Symulacja termiczna lub fizyczna patelni, garnka lub piekarnika może być oceniana pod kątem tych samych operation envelope, których musi przestrzegać rzeczywiste urządzenie. Isaac Lab, Gazebo i MuJoCo są kandydatami do publicznego benchmarku "cook in simulation".

## Obserwowalność

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

To zapisuje ślad OpenTelemetry: jeden span na krok, z atrybutami `cookwala.*` (rung, envelope OK, deviation) oraz zdarzeniami limitów bezpieczeństwa. Ładuje się do dowolnego backendu OTLP (Jaeger, Grafana Tempo, LangSmith…), dzięki czemu zespoły mogą debugować urządzenia w taki sam sposób, w jaki debugują agentów.

## Dry run: czy to urządzenie może przygotować ten przepis?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run odpowiada na pytania, zanim cokolwiek się nagrzeje. Mówi, jakie kroki wykonuje urządzenie, jakie wykonuje osoba, w jaki sposób każdy krok zostanie zweryfikowany (sensor, model, czas lub osoba), lub jaki jest pierwszy powód, dla którego musi nastąpić refusal before heat.

