<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: publicera och hitta recept, enheter och packs

> **Status: draft profile.** Modelled på den officiella MCP Registry, som listar Model
> Context Protocol-servrar: verifierade namespaces, fixerade versioner, integritetshashar, en
> validerings-endpoint och en lifecycle status.

Registry är en **lista med pekare**: vad som existerar, vem som publicerade det, vilken exakt version,
och dess hash. Innehåll stannar där dess utgivare hostar det (vilken katalog som helst, vilket domän som helst).
Vem som helst kan köra en registry. cookwala.ai kör den första vid `/v1/registry.json`.

## 1. Namn bevisar vem som publicerade

Varje post är namngiven `<namespace>/<name>`. Namnrymden måste bevisas:

| Namespace | Exempel | Bevis |
|---|---|---|
| Ett domännamn, omvänt | `org.fifi-cooking/egyptian-home` | DNS TXT-post `cookwala-verify=<token>` på `fifi-cooking.org`, eller `https://fifi-cooking.org/.well-known/cookwala-verify` som returnerar token |
| Ett kodvärdskonto | `io.github.amado2k5/recipes` | GitHub (eller GitLab) OIDC-token från ett CI-jobb i det kontot |
| En nyckel | valfri | En signatur av en nyckel som redan är bunden till namnrymden (rotation) |

Namn återanvänds aldrig. Raderade poster förblir gravstenar.

## 2. Versioner är exakta

- **Endast exakta versioner.** Poster låser en version (`1.4.2`); intervall som `^1.4` eller `1.x`
  avvisas.
- **Hasher.** Varje version registrerar artefaktens `sha256`, och klienter verifierar den före användning.
  Recept bär också sin egen Cookwala dokumenthash, och exekutorer utför refusal before heat vid en avvikelse.
- **Repository id.** Poster registrerar kodvärdens stabila repository id när ett sådant finns,
  så att ett raderat och återställt repository med samma namn upptäcks.

## 3. Livscykel

`active` → `deprecated` (fortfarande användbar, en ersättare finns) → `recalled` (osäker; publiceras även i recall-flödet, och utförare vägrar den) → `deleted` (tombstone).

## 4. Publiceringsflöde

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

`registry` kör samma validering som `POST /v1/registry/validate`: schema, receptsemantik (operation envelopes, temperaturer), hashar och namespace proof. Varje problem kommer tillbaka som en strukturerad lista, så att CI kan visa det.

> API:et beskrivs i [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Tjänsten kommer later; idag läggs poster till via pull request till `site/v1/registry.json`, som endast listar vad som existerar i detta repository. Namn- och versionsregler testas av
> `conformance/profiles/registry.json`.

## 5. Inmatning

Se `catalog.schema.json#/$defs/RegistryEntry`:

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

`/v1/directory.json` listar organisationer som **bad** om att bli listade
(`catalog.schema.json#/$defs/DirectoryEntry`): tillverkare av enheter, kataloger, registries, food banks,
gemenskapskök, skol- och hjälpprogram, gårdar och kooperativ, livsmedelshandlare, restauranger,
receptutgivare, certifierare, forskningslaboratorier, hälsomyndigheter, regeringar, försäkringsbolag, översättar-
communities. Varje post har roller, ett land, en URL, ett verifieringsprotokoll och, där den
hävdar conformance, hasharna för sina publicerade `ConformanceReport`s
(`docs/CERTIFICATION.md`). Listning är inte ett godkännande, certification eller partnerskap. Idag har
directory en post, operatören av denna sida, eftersom ingen annan har bett än.

