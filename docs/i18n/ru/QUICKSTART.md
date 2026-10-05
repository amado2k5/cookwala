<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Быстрый старт

Пять минут, никакого оборудования. Вы получите рецепт, хешируете его, спросите, может ли устройство его приготовить, проверите температурный след на соответствие безопасному диапазону операции и экспортируете журнал приготовления в виде трассировки. Все нижеперечисленное работает сегодня.

## 1. Получите инструменты

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` и экспортеры используют только стандартную библиотеку Python. Остальные пакеты предназначены для полной валидации и подписей. Пакет `pip install cookwala` — следующий в roadmap.

## 2. Получите рецепт и создайте его хеш

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Исполнитель готовит именно эту ревизию и отказывается, если полученный им хеш не совпадает.

## 3. Может ли это устройство приготовить это?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Ответ `refused` с причиной `needs_human_present`: резка не может выполняться без присмотра.
Добавьте человека:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Теперь статус `accepted`. План указывает, какие шаги выполняет манипулятор, какие выполняет человек, и как будет проверяться каждый шаг (sensor, logged estimate, time или person). Попробуйте сделать то же самое в браузере на [home page](/#demo).

## 4. Проверка температурного трейса на соответствие безопасному диапазону

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Проверьте всё и запустите тесты conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Превратите журнал приготовления пищи в трассировку или набор данных

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` загружается в любой бэкенд OpenTelemetry. `my-dataset/meta/` содержит одну задачу на каждый шаг рецепта для датасетов в стиле LeRobot. Оба отклоняют логи, чьи household не выбрали opt in.

## Что дальше

| Вы — | Next |
|---|---|
| Создаете робота или бытовой прибор | [Robots, ROS 2 and datasets](ROBOTICS.md), затем [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Создаете AI агента | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) и [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Управляете кухней или food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Пишете рецепты | [Recipe format](RECIPE-FORMAT.md) и [Contributing](../CONTRIBUTING.md) |

