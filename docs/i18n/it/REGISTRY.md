<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: pubblicazione e ricerca di ricette, dispositivi e pack

> **Status: draft profile.** Modelled sul MCP Registry ufficiale, che elenca i server del Model
> Context Protocol: namespace verificati, versioni fissate, hash di integrità, un
> endpoint di validazione e uno stato del ciclo di vita.

Il registry è una **lista di puntatori**: cosa esiste, chi lo ha pubblicato, quale versione esatta,
e il suo hash. Il contenuto rimane ovunque il suo publisher lo ospiti (qualsiasi catalogo, qualsiasi dominio).
Chiunque può eseguire un registry. cookwala.ai esegue il primo a `/v1/registry.json`.

## 1. I nomi provano chi ha pubblicato

Ogni voce è denominata `<namespace>/<name>`. Il namespace deve essere provato:

| Namespace | Esempio | Prova |
|---|---|---|
| Un dominio, invertito | `org.fifi-cooking/egyptian-home` | Record DNS TXT `cookwala-verify=<token>` su `fifi-cooking.org`, o `https://fifi-cooking.org/.well-known/cookwala-verify` che restituisce il token |
| Un account code-host | `io.github.amado2k5/recipes` | Token OIDC di GitHub (o GitLab) da un job CI in quell'account |
| Una chiave | any | Una firma da una chiave già associata al namespace (rotation) |

Names are never reused. Deleted entries stay as tombstones.

## 2. Le versioni sono esatte

- **Solo versioni esatte.** Le voci fissano una versione (`1.4.2`); intervalli come `^1.4` o `1.x`
  sono rifiutati.
- **Hash.** Ogni versione registra lo `sha256` dell'artifact, e i client lo verificano prima dell'uso.
  Le ricette portano anche il proprio hash del documento Cookwala, ed gli executor rifiutano un mismatch.
- **Repository id.** Le voci registrano lo stable repository id dell'host del codice quando presente,
  così un repository eliminato e ricreato con lo stesso nome viene rilevato.

## 3. Ciclo di vita

`active` → `deprecated` (ancora utilizzabile, esiste un sostituto) → `recalled` (non sicuro; inoltre
pubblicato nel feed di recall, ed gli esecutori lo rifiutano) → `deleted` (tombstone).

## 4. Flusso di pubblicazione

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

Il registry esegue la stessa validazione di `POST /v1/registry/validate`: schema, semantica delle ricette (operation envelopes, temperature), hash e prova del namespace. Ogni problema viene restituito come una lista strutturata, in modo che la CI possa mostrarlo.

> L'API è descritta in [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Il
> servizio arriverà later; oggi le voci vengono aggiunte tramite pull request a `site/v1/registry.json`, che elenca
> solo ciò che esiste in questo repository. Le regole di nome e versione sono testate da
> `conformance/profiles/registry.json`.

## 5. Ingresso

Vedi `catalog.schema.json#/$defs/RegistryEntry`:

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

`/v1/directory.json` elenca le organizzazioni che hanno **chiesto** di essere elencate
(`catalog.schema.json#/$defs/DirectoryEntry`): produttori di dispositivi, cataloghi, registry, food bank,
cucine comunitarie, programmi scolastici e di soccorso, aziende agricole e cooperative, alimentari, ristoranti,
editori di ricette, certifiers, laboratori di ricerca, enti sanitari, governi, assicuratori, comunità di
traduttori. Ogni voce ha ruoli, un paese, un URL, un record di verifica e, laddove
dichiara conformance, gli hash dei suoi `ConformanceReport` pubblicati
(`docs/CERTIFICATION.md`). L'elenco non costituisce approvazione, certification o partnership. Oggi la
directory ha una voce, l'operatore di questo sito, perché nessun altro ha ancora chiesto.

