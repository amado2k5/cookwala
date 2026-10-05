<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: публикация и поиск рецептов, устройств и rule pack

> **Статус: draft profile.** Modelled на официальном MCP Registry, который перечисляет серверы Model
> Context Protocol: проверенные namespaces, закрепленные версии, хэши целостности, эндпоинт
> валидации и статус жизненного цикла.

Registry — это **список указателей**: что существует, кто это опубликовал, какая именно версия и её hash. Контент остается там, где его размещает издатель (любой каталог, любой домен). Любой может запустить registry. cookwala.ai запускает первый по адресу `/v1/registry.json`.

## 1. Имена доказывают, кто опубликовал

Каждая запись называется `<namespace>/<name>`. Пространство имен должно быть подтверждено:

| Пространство имен | Пример | Доказательство |
|---|---|---|
| Домен, в обратном порядке | `org.fifi-cooking/egyptian-home` | DNS TXT запись `cookwala-verify=<token>` на `fifi-cooking.org`, или `https://fifi-cooking.org/.well-known/cookwala-verify`, возвращающая токен |
| Аккаунт хоста кода | `io.github.amado2k5/recipes` | GitHub (или GitLab) OIDC токен из CI задания в этом аккаунте |
| Ключ | любой | Подпись ключом, уже привязанным к пространству имен (ротация) |

Имена никогда не используются повторно. Удаленные записи остаются в качестве надгробий.

## 2. Версии точны

- **Только точные версии.** Записи фиксируют версию (`1.4.2`); диапазоны, такие как `^1.4` или `1.x`, отклоняются.
- **Хеши.** Каждая версия записывает `sha256` артефакта, и клиенты проверяют его перед использованием.
  Рецепты также содержат собственный хеш документа Cookwala, и исполнители отклоняют несоответствие.
- **Repository id.** Записи фиксируют стабильный repository id хоста кода, если он существует,
  чтобы обнаруживать удаленный и повторно созданный репозиторий с тем же именем.

## 3. Жизненный цикл

`active` → `deprecated` (все еще можно использовать, существует замена) → `recalled` (небезопасно; также
публикуется в recall feed, и исполнители отказываются от него) → `deleted` (tombstone).

## 4. Процесс публикации

```bash
# 1. validate locally (same checks the registry runs)
python tools/validate_specs.py
python tools/cookwala_ref.py hash my-collection/recipe.cookwala.json

# 2. prove the namespace once (DNS TXT or /.well-known/cookwala-verify, or CI OIDC)

# 3. publish the entry
curl -X POST https://cookwala.ai/v1/registry/publish \
  -H "Authorization: Bearer $COOKWALA_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d @registry-entry.json
```

`registry` выполняет ту же валидацию, что и `POST /v1/registry/validate`: схему, семантику рецептов (operation envelopes, температуры), хеши и доказательство пространства имен. Каждая проблема возвращается в виде структурированного списка, чтобы CI мог её отобразить.

> API описан в [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002).
> Сервис появится later; сегодня записи добавляются через pull request в `site/v1/registry.json`, который перечисляет
> только то, что существует в этом репозитории. Правила имени и версии проверяются с помощью
> `conformance/profiles/registry.json`.

## 5. Входные данные

См. `catalog.schema.json#/$defs/RegistryEntry`:

```json
{
  "kind": "recipe_collection",
  "name": "org.fifi-cooking/egyptian-home",
  "description": "Egyptian home recipes from fifi.cooking, robot-ready.",
  "version": "0.3.0",
  "status": "active",
  "url": "https://cookwala.ai/v1/recipes/",
  "sha256": "…",
  "coreVersion": "0.2.0",
  "verification": { "method": "dns_txt", "verifiedAt": "2026-10-04T10:00:00Z", "by": "cookwala.ai" },
  "repository": { "url": "https://github.com/amado2k5/cookwala", "source": "github", "id": "…" }
}
```

## 6. Directory of organizations

`/v1/directory.json` перечисляет организации, которые **попросили** включить их в список
(`catalog.schema.json#/$defs/DirectoryEntry`): производители устройств, каталоги, registries, food banks,
общественные кухни, школьные и программы помощи, фермы и кооперативы, бакалейные лавки, рестораны,
издатели рецептов, certifiers, исследовательские лаборатории, органы здравоохранения, правительства, страховщики,
сообщества переводчиков. Каждая запись имеет роли, страну, URL, запись о проверке и, если она
заявляет о conformance, хеши своих опубликованных `ConformanceReport`s
(`docs/CERTIFICATION.md`). Включение в список не является одобрением, certification или партнерством. Сегодня в
directory одна запись — оператор этого сайта, потому что никто другой еще не просил.

