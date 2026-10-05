<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: Veröffentlichen und Finden von Rezepten, Geräten und Packs

> **Status: draft profile.** Modelled auf dem offiziellen MCP Registry, welches Model
> Context Protocol Server auflistet: verifizierte Namespaces, gepinnte Versionen, Integrity Hashes, einen
> Validation Endpoint und einen Lifecycle Status.

Das Registry ist eine **Liste von Pointern**: was existiert, wer es veröffentlicht hat, welche exakte Version,
und sein Hash. Der Inhalt bleibt dort, wo sein Herausgeber ihn hostet (jeder Katalog, jede Domain).
Jeder kann ein Registry betreiben. cookwala.ai betreibt das erste unter `/v1/registry.json`.

## 1. Namen beweisen, wer veröffentlicht hat

Jeder Eintrag ist `<namespace>/<name>` genannt. Der Namespace muss nachgewiesen werden:

| Namespace | Beispiel | Nachweis |
|---|---|---|
| Eine Domain, umgekehrt | `org.fifi-cooking/egyptian-home` | DNS TXT record `cookwala-verify=<token>` auf `fifi-cooking.org`, oder `https://fifi-cooking.org/.well-known/cookwala-verify` gibt das Token zurück |
| Ein Code-Host-Account | `io.github.amado2k5/recipes` | GitHub (oder GitLab) OIDC token aus einem CI job in diesem Account |
| Ein Key | beliebig | Eine Signatur durch einen Key, der bereits an den Namespace gebunden ist (Rotation) |

Namen werden niemals wiederverwendet. Gelöschte Einträge bleiben als Grabsteine bestehen.

## 2. Versionen sind exakt

- **Nur exakte Versionen.** Einträge fixieren eine Version (`1.4.2`); Bereiche wie `^1.4` oder `1.x`
  werden abgelehnt.
- **Hashes.** Jede Version zeichnet den `sha256` des Artefakts auf, und Clients verifizieren ihn vor der Verwendung.
  Rezepte tragen zudem ihren eigenen Cookwala-Dokument-Hash, und Executor verweigern eine Abweichung.
- **Repository id.** Einträge zeichnen die stabile repository id des Code-Hosts auf, sofern eine vorhanden ist,
  damit ein gelöschtes und neu erstelltes Repository mit demselben Namen erkannt wird.

## 3. Lebenszyklus

`active` → `deprecated` (noch verwendbar, ein Ersatz existiert) → `recalled` (unsicher; wird auch im recall feed veröffentlicht, und Ausführende verweigern es) → `deleted` (Tombstone).

## 4. Publishing flow

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

Das registry führt dieselbe Validierung wie `POST /v1/registry/validate` aus: Schema, Rezeptsemantik (operation envelopes, Temperaturen), Hashes und Namespace-Nachweis. Jedes Problem wird als strukturierte Liste zurückgegeben, sodass CI es anzeigen kann.

> Die API wird in [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) beschrieben. Der
> Service kommt later; heute werden Einträge per Pull Request zu `site/v1/registry.json` hinzugefügt, was
> nur auflistet, was in diesem Repository existiert. Namens- und Versionsregeln werden durch
> `conformance/profiles/registry.json` getestet.

## 5. Eintrag

Siehe `catalog.schema.json#/$defs/RegistryEntry`:

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

`/v1/directory.json` listet Organisationen auf, die darum **gebeten** haben, gelistet zu werden
(`catalog.schema.json#/$defs/DirectoryEntry`): Gerätehersteller, Kataloge, registries, food banks,
Gemeinschaftsküchen, Schul- und Hilfsprogramme, Farmen und Genossenschaften, Lebensmittelhändler, Restaurants,
Rezeptverleger, certifiers, Forschungslabore, Gesundheitsbehörden, Regierungen, Versicherer, Übersetzer-
communities. Jeder Eintrag hat Rollen, ein Land, eine URL, einen Verifizierungsdatensatz und, sofern er
conformance beansprucht, die Hashes seiner veröffentlichten `ConformanceReport`s
(`docs/CERTIFICATION.md`). Die Auflistung stellt keine Endorsement, certification oder Partnerschaft dar. Heute hat das
directory einen Eintrag, den Betreiber dieser Seite, da noch niemand anderes darum gebeten hat.

