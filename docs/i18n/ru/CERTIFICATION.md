<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance и путь к certification

**Status:** draft, 2026-10-04 (RFC-0008). Ни один сертифицирующий орган еще не был привлечен; это путь,
который предлагает стандарт.

## 1. Три шага

| Шаг | Кто | Что это значит | Отображается как |
|---|---|---|---|
| **Self-declared** | Изготовитель или издатель | Выполнил публичные векторы с помощью публичного инструмента и опубликовал `ConformanceReport` (`schemas/conformance.schema.json`), подписанный собственным ключом | отчет, с наборами и количеством; никогда не значок |
| **Verified** | Оператор registry | Воспроизвел запуск по тому же хешу набора векторов и поставил контрподпись на отчет | отчет плюс верификатор |
| **Certified** | Независимый certifier (на данный момент не существует) | Выполнил проверку наборов, а также аппаратных средств и safety-case в рамках опубликованной схемы и предоставил знак | отчет, certifier, знак |

Отчет, который не проходит по любому вектору класса, не может претендовать на этот класс. registry показывает
отчеты, а не значки.

Сегодня единственным оператором registry является составитель спецификации (cookwala.ai), поэтому «verified» не добавляет никакой независимости, пока не появится второй registry; статус по-прежнему отображается как self-verification.

## 2. Что содержит отчет

Основная версия, заявленный класс (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) или заявленный профиль (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), субъект (продукт, вендор, версия), запущенные наборы с итогами и ID не прошедших
векторов, хеш набора векторов, инструмент и коммит, дата, статус и
верификатор. Пример: `examples/conformance/report-reference.json`, созданный

```bash
python tools/run_conformance.py --report report.json
```

## 3. Классы и то, что они доказывают

| Класс | Векторы | Также необходимо для certification (не охвачено векторами) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review of recipes by a food-safety professional |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | собственный safety case устройства (ISO 13482, IEC 60335, UL 3300, если применимо); measured local stop latency; соблюдение safety limits без сети |
| Catalog | hash, signature, key revocation, recalls | процесс хранения ключей и приема инцидентов |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | результаты, опубликованные per model с методом |
| Verifier | все Core suites | none |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; no personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | процесс namespace proof |

## 4. Что не может гарантировать certification

Отчет о conformance доказывает, что программное обеспечение вело себя так, как того требуют векторы в день его выполнения.
Он не доказывает, что устройство безопасно на каждой кухне, что рецепт имеет правильный вкус или что вред не может наступить. Стандарт, обещающий нулевой вред, был бы нечестным; этот обещает, что ограничения соблюдаются локально, что refusal before heat происходит и что записи могут быть проверены.

## 5. Управление знаком

Знак certification и его правила переходят в нейтральный foundation вместе с товарным знаком (`GOVERNANCE.md`). До тех пор знак не существует; существуют только отчеты.

