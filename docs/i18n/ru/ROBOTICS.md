<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala и стек робототехники

Cookwala не заменяет какую-либо часть робота. Она добавляет слой, которого не хватает стеку робототехники для приготовления пищи: **что готовить, когда выполнен каждый шаг и чего никогда не должно происходить**, в форме, которую может прочитать и проверить любой робот, бытовой прибор, симулятор или конвейер обучения.

## Где это уместно

| Слой | Примеры слоя (2026; интеграция ни с одним из них не существует) | Что добавляет Cookwala |
|---|---|---|
| Роботы и бытовая техника | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, кухонные роботы (Moley, Miso, Chef Robotics), умные духовки | Независимый от устройства рецепт, который он может выполнить как dry run, отклонить или приготовить; встроенные в устройство лимиты безопасности |
| Middleware | ROS 2, ros-controls, Open-RMF (парки роботов), Matter (бытовая техника) | ROS 2 actions для рецептов и шагов (`bindings/ros2`); черновик сопоставления Matter op (`bindings/matter.json`, не проверено); задача Open-RMF является запланированным вкладом |
| Обучение роботов | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Задачи по шагам на естественном языке и сегменты шагов для наборов данных; критерии выполнения в качестве целей оценки |
| Симуляция | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes и векторы conformance в качестве условий тестирования |
| AI агенты | MCP, A2A, Claude, OpenAI и открытые модели | AgentMandate, правило untrusted-text, бенчмарк безопасности кухонного агента |

Cookwala намеренно находится **above motion**. Современные роботы обучаются манипуляции end to end;
Cookwala дает им задачу, тест на успех и safety envelope, и получает взамен
execution log.

## ROS 2

`bindings/ros2/` определяет два действия:

| Действие | Цель | Обратная связь | Результат |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Конечное состояние, причина refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Один узел рецепта, его operation envelope, необязательная более узкая цель | Прогресс, medium temperature, цель достигнута | Envelope OK, использованная ступень sensor ladder, сводка шага, отклонение |

**Отмена** цели `ExecuteRecipe` является `StopRequest`: сервер должен безопасно остановиться.
**Пределы безопасности** остаются внутри устройства; никакое поле цели не может их изменить. hub, который распределяет рецепт между несколькими роботами, отправляет цели `ExecuteNode` и может передать диспетчеризацию на уровне флота в **Open-RMF** в качестве задач.

## LeRobot и наборы данных для обучения роботов

Цикл LeRobot — это teleoperate → record → train → deploy, и его LeRobotDataset v2.1 хранит
задачи на естественном языке в `meta/tasks.jsonl` (v3 перенес метаданные в parquet; экспортер записывает
файл в стиле v2.1 сегодня, а writer для v3 будет next). Рецепты Cookwala уже содержат по одному предложению
на каждый шаг, а execution log записывает, когда каждый шаг начался и закончился.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Это записывает:
- `meta/tasks.jsonl`, по одной задаче на каждый шаг рецепта;
- `meta/cookwala/<log>.json` с хешем рецепта, сегментами шагов (секунды начала и конца,
  ступень sensor-ladder, результат operation envelope) и согласием household.

Видео и действия поступают из собственного рекордера робота. Экспорт отклоняет логи без
согласия на dataset.

## Симуляция

Векторы conformance в `conformance/envelope.json` (температурные траектории с ожидаемыми результатами) и правила sensor-ladder готовы к использованию в симуляторе. Тепловая или физическая симуляция сковороды, кастрюли или духовки может быть оценена на соответствие тем же envelopes, которые должен соблюдать реальное устройство. Isaac Lab, Gazebo и MuJoCo являются кандидатами для публичного бенчмарка "cook in simulation".

## Наблюдаемость

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Это записывает OpenTelemetry trace: по одному span на каждый шаг, с атрибутами `cookwala.*` (rung, envelope OK, deviation) и событиями safety-limit. Это загружается в любой OTLP backend (Jaeger, Grafana Tempo, LangSmith…), так что команды могут отлаживать устройства так же, как они отлаживают агентов.

## Dry run: может ли это устройство приготовить этот рецепт?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run дает ответы до того, как что-либо нагреется. Он указывает, какие шаги выполняет устройство, какие шаги выполняет человек, как будет проверяться каждый шаг (sensor, model, time или person), или первую причину, по которой должен произойти refusal before heat.

