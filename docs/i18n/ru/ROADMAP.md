<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Дорожная карта: now, next, later

**Статус:** 2026-10-04. Каждый элемент имеет статус: **done**, **in progress**, **planned**,
**not yet funded**. Шлюзы взяты из раздела 4 `ACTION-PLAN.md`. Ничто не переходит из planned
в done без указанного доказательства.

## Now (этот релиз)

| Предмет | Статус |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (в течение примерно года, по мере наличия ресурсов)

| Предмет | Статус | Шлюз |
|---|---|---|
| Рецензия эксперта по пищевым продуктам на operation envelopes | planned | reviewer agrees |
| Рецензии диетолога и офицера по пищевой безопасности на четыре rule packs | planned | reviews filed; packs move to reviewed |
| Оценка воздействия на защиту данных профиля household context | planned | reviewer agrees |
| Пилотный проект food-bank (12 недель, предварительная регистрация, независимый оценщик) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Результаты бенчмарка безопасности агентов для нескольких семей моделей | planned | runs published with method |
| wheel `pip install cookwala` и `@cookwala/sdk` в npm | planned | packaging that bundles vocabularies and schemas |
| Сервис Registry (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Первый производитель устройств, внедряющий Core API относительно reference hub | planned | one maker agrees; conformance report published |
| Конвертация первых коллекций fifi.cooking | planned | founder decides rights per collection |
| Core 0.3 на основе отзывов устройств | planned | two implementers' feedback |
| Руководящий комитет | planned | three independent adopters or two implementations |

## Later

| Предмет | Статус |
|---|---|
| Реальное устройство, готовящее рецепт Cookwala, без монтажа, на видео | еще не профинансировано; нужен партнер по устройствам |
| Схема certification с независимым сертифицирующим органом | запланировано; сертифицирующий орган не привлечен |
| Нейтральный фундамент для спецификации, товарного знака и марки | запланировано |
| Сеть контрибьюторов: согласованные записи реальных рецептов с указанием авторства | запланировано |
| Сигналы спроса и предложения, публикуемые программами и кооперативами | запланировано, после проверки на соответствие антимонопольному законодательству |
| Бенчмарк "Cook in simulation" (Isaac Lab, Gazebo или MuJoCo) | запланировано |
| Признание Digital Public Good для Humanitarian Profile | запланировано, после пилотных доказательств |
| Межрегиональные потоки помощи в мировом симуляторе; эффекты чистого приготовления пищи | запланировано |

## Что мы не будем делать

Собирать персональные данные; публиковать числа без метода; называть партнера до того, как он даст согласие;
заявлять о certification, которой не существует; помещать household data в любой реестр; создавать центральный
orchestrator, от которого зависят кухни; заявлять о прекращении голода.

## Правила kill and pivot

Из плана действий: если два раунда внешнего обзора не приведут к появлению производителя устройств или пилотного партнера, Cookwala сужается до Humanitarian Profile и формата рецептов. Если пилотный проект показывает прирост менее 5 %, результаты публикуются, а профиль перерабатывается перед любым масштабированием.

