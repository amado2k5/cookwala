<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: the whole picture stays home

> **Статус: draft profile** (RFC-0001). Не является частью Cookwala Core. Схема:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Правила получателя: `profiles/household/recipient-roles.json`. Локальный API:
> `api/household.openapi.yaml`. Пример: `examples/household/context.json`.

## 1. Почему

Роботу, который хорошо обслуживает семью, нужно знать очень многое: бытовые приборы и их особенности, кто там живет и когда они дома, домашних животных, детей, диеты, аллергии, время приема лекарств, ритуалы, бюджет, привычки в покупках, что пошло не так в прошлый раз. Те же самые факты являются планом ограбления и инструментом профилирования. Этот профиль дает **planner at home** полную картину, а всем остальным дает только **constraint**.

## 2. Три идеи

1. **Facets.** Один типизированный факт для каждого (`cw.facet.household.health.allergies`), с указанием того, кто
   его утвердил (declared, observed, reported, inferred), когда, как долго, уровень уверенности
   и класс конфиденциальности (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Каждый тип facet указывает, может ли его исходное значение покидать
   дом: `never` (45 типов: дети, отсутствие дома, планировки, состояния здоровья, религия,
   поведение, инциденты, уровень дохода), только как `derived` constraint (81 тип), или как
   `consented` раскрытие после явного разрешения (13 типов, в основном self-state устройства для
   производителя).
3. **Derived constraints.** Единственный household объект, который бакалейщик, планировщик, служба доставки,
   производитель устройств или другой робот когда-либо получает: "доставить 17:00–18:00 к входной двери",
   "запретить арахис", "никакого движения роботов в коридоре 15:00–15:30", "бюджетный лимит 18.00 USD на
   прием пищи". Каждый называет **типы** facet, из которых он был получен, но никогда не их значения.

## 3. Кто что получает

| Роль получателя | Может получать |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI или ПО, планирующее прием пищи) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | только device fault summary (количество сбоев по категориям, без времени, без household facts), и только если household указал insurer в качестве получателя; RFC-0001 указывает, что эта роль наиболее вероятна к удалению, если проверка конфиденциальности выявит возражения |
| program (food bank, school) | ничего |
| dataset | ничего |

## 4. Правила

- Исходные facets никогда не покидают устройство. Не существует API, который возвращал бы их кому-либо за пределами домашней сети.
- `inferred` facets никогда не используются для принятия решений по безопасности.
- Поведенческий показатель любого человека не создается и не хранится. Behaviour facets существуют для обслуживания household (размеры порций, когда убирать посуду) и никогда не передаются.
- Экономический уровень — это **установленная владельцем бюджетная позиция**, которая никогда не выводится из чего-либо.
- Данные о детях и их отсутствии являются `secret` и никогда не передаются, даже производные, за исключением ограничений по перемещению и безопасным зонам, которые не раскрывают расписание.
- Каждый facet может быть удален. Удаление завершается в рамках окна household (по умолчанию 7 дней, максимум 30) и фиксируется в execution log без содержания.
- Класс конфиденциальности может быть повышен выше значения по умолчанию в registry, но никогда не понижен.

## 5. Локальная память инцидентов

RFC-0001 спрашивает, что робот помнит об аварийных сигналах, конфликтах, отказах и уроках. `LocalIncident` хранит это: дату, категорию из
`vocab/incidents.json`, кто был вовлечен по типу, заметку и урок. Это никогда не покидает
дом. Публичный анонимный `IncidentReport` в Core — это другой документ, из которого учится каждый
мейкер.

## 6. Conformance

Векторы профилей (`conformance/profiles/disclosure_policy.json`) предоставляют facets и роль получателя и ожидают точные типы constraints, раскрытые ids и скрытые ids с причинами. Эталонная реализация — `derive_constraints()` в `tools/cookwala_ref.py`.

## 7. Связь с другими документами

`ClientProfile`, `KitchenProfile` и `RobotProfile` (`profile.schema.json`) остаются удобными наборами. Фасеты миссии (`mission.schema.json`) используют те же ids в registry. Core `AgentMandate` остается нормативным утверждением того, что может делать агент; фасеты mandate описывают правила household локально.

## 8. Открытые вопросы

См. RFC-0001: закрытые роли получателей; privacy только для чтения; оценка воздействия на защиту данных с рецензентом.

