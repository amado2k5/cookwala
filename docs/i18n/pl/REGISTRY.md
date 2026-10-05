<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: publikowanie i wyszukiwanie przepisów, urządzeń i pakietów

> **Status: draft profile.** Modelled na oficjalnym MCP Registry, który wymienia serwery Model
> Context Protocol: zweryfikowane przestrzenie nazw, przypięte wersje, skróty kontrolne integralności,
> punkt końcowy walidacji oraz status cyklu życia.

Registry to **lista wskaźników**: co istnieje, kto to opublikował, która to dokładnie wersja
i jaki jest jej hash. Treść pozostaje tam, gdzie hostuje ją jej wydawca (dowolny katalog, dowolna domena).
Każdy może prowadzić registry. cookwala.ai prowadzi pierwsze pod adresem `/v1/registry.json`.

## 1. Nazwy potwierdzają, kto opublikował

Każdy wpis jest nazwany `<namespace>/<name>`. Przestrzeń nazw musi zostać udowodniona:

| Przestrzeń nazw | Przykład | Dowód |
|---|---|---|
| Domena, odwrócona | `org.fifi-cooking/egyptian-home` | Rekord DNS TXT `cookwala-verify=<token>` na `fifi-cooking.org`, lub `https://fifi-cooking.org/.well-known/cookwala-verify` zwracający token |
| Konto hosta kodu | `io.github.amado2k5/recipes` | Token OIDC GitHub (lub GitLab) z zadania CI w tym koncie |
| Klucz | dowolny | Podpis za pomocą klucza już powiązanego z przestrzenią nazw (rotacja) |

Names are never reused. Deleted entries stay as tombstones.

## 2. Wersje są dokładne

- **Tylko dokładne wersje.** Wpisy przypisują wersję (`1.4.2`); zakresy takie jak `^1.4` lub `1.x` są odrzucane.
- **Hashe.** Każda wersja rejestruje `sha256` artefaktu, a klienci weryfikują go przed użyciem. Przepisy również posiadają własny hash dokumentu Cookwala, a wykonawcy odrzucają niezgodność.
- **Repository id.** Wpisy rejestrują stabilny repository id hosta kodu, jeśli taki istnieje, dzięki czemu usunięte i ponownie utworzone repozytorium o tej samej nazwie zostaje wykryte.

## 3. Cykl życia

`active` → `deprecated` (nadal używalne, istnieje zamiennik) → `recalled` (niebezpieczne; publikowane również w recall feed, a wykonawcy odmawiają jego użycia) → `deleted` (tombstone).

## 4. Przepływ publikacji

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

`registry` uruchamia tę samą walidację co `POST /v1/registry/validate`: schemat, semantykę przepisu (operation envelopes, temperatury), hashe i dowód przestrzeni nazw. Każdy problem wraca jako ustrukturyzowana lista, dzięki czemu CI może go wyświetlić.

> API jest opisane w [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002).
> Usługa pojawi się later; dzisiaj wpisy są dodawane poprzez pull request do `site/v1/registry.json`, który wymienia
> tylko to, co istnieje w tym repozytorium. Reguły nazwy i wersji są testowane przez
> `conformance/profiles/registry.json`.

## 5. Wpis

Zobacz `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory organizacji

`/v1/directory.json` wymienia organizacje, które **poprosiły** o wpisanie na listę
(`catalog.schema.json#/$defs/DirectoryEntry`): producentów urządzeń, katalogi, registries, food banks,
kuchnie społecznościowe, programy szkolne i pomocowe, gospodarstwa rolne i spółdzielnie, sklepikarzy, restauracje,
wydawców przepisów, certyfikatorów, laboratoria badawcze, organy zdrowia, rządy, ubezpieczycieli, społeczności
tłumaczy. Każdy wpis posiada role, kraj, URL, rekord weryfikacji i, jeśli
twierdzi, że posiada conformance, hashe swoich opublikowanych `ConformanceReport`s
(`docs/CERTIFICATION.md`). Wpisanie na listę nie jest poparciem, certification ani partnerstwem. Obecnie
directory ma jeden wpis, operator tej strony, ponieważ nikt inny jeszcze nie prosił.

