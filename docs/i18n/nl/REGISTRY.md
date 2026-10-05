<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: het publiceren en vinden van recepten, apparaten en packs

> **Status: draft profile.** Modelled op de officiële MCP Registry, die Model
> Context Protocol servers vermeldt: verified namespaces, pinned versions, integrity hashes, een
> validation endpoint en een lifecycle status.

De registry is een **lijst van pointers**: wat bestaat er, wie heeft het gepubliceerd, welke exacte versie,
en de hash ervan. Content blijft waar de uitgever het host (elke catalogus, elk domein).
Iedereen kan een registry draaien. cookwala.ai draait de eerste op `/v1/registry.json`.

## 1. Namen bewijzen wie heeft gepubliceerd

Elke invoer is benoemd `<namespace>/<name>`. De namespace moet bewezen zijn:

| Namespace | Voorbeeld | Bewijs |
|---|---|---|
| Een domein, omgekeerd | `org.fifi-cooking/egyptian-home` | DNS TXT record `cookwala-verify=<token>` op `fifi-cooking.org`, of `https://fifi-cooking.org/.well-known/cookwala-verify` die de token retourneert |
| Een code-host account | `io.github.amado2k5/recipes` | GitHub (of GitLab) OIDC token van een CI job in die account |
| Een sleutel | any | Een handtekening door een sleutel die al aan de namespace is gebonden (rotatie) |

Namen worden nooit hergebruikt. Verwijderde vermeldingen blijven als tombstones staan.

## 2. Versies zijn exact

- **Alleen exacte versies.** Invoer legt een versie vast (`1.4.2`); bereiken zoals `^1.4` of `1.x`
  worden afgewezen.
- **Hashes.** Elke versie registreert de `sha256` van het artefact, en clients verifiëren deze voor gebruik.
  Recepten bevatten ook hun eigen Cookwala document hash, en executors weigeren een mismatch.
- **Repository id.** Invoer registreert de stabiele repository id van de code host wanneer deze aanwezig is,
  zodat een verwijderde en opnieuw aangemaakte repository met dezelfde naam wordt gedetecteerd.

## 3. Lifecycle

`active` → `deprecated` (nog steeds bruikbaar, er bestaat een vervanging) → `recalled` (onveilig; wordt ook
gepubliceerd in de recall feed, en executors weigeren het) → `deleted` (tombstone).

## 4. Publicatieproces

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

De registry voert dezelfde validatie uit als `POST /v1/registry/validate`: schema, receptsemantiek (operation envelopes, temperaturen), hashes en namespace proof. Elk probleem komt terug als een gestructureerde lijst, zodat CI het kan tonen.

> De API wordt beschreven in [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). De
> service komt later; vandaag worden vermeldingen toegevoegd via pull request aan `site/v1/registry.json`, die
> alleen vermeldt wat in deze repository bestaat. Naam- en versie-regels worden getest door
> `conformance/profiles/registry.json`.

## 5. Invoer

Zie `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory van organisaties

`/v1/directory.json` bevat organisaties die hebben **gevraagd** om vermeld te worden
(`catalog.schema.json#/$defs/DirectoryEntry`): apparaatmakers, catalogi, registries, food banks,
gemeenschapskeukens, school- en noodhulpprogramma's, boerderijen en coöperaties, kruideniers, restaurants,
receptuitgevers, certifiers, onderzoekslaboratoria, gezondheidsinstanties, overheden, verzekeraars, vertaal-
gemeenschappen. Elke vermelding heeft rollen, een land, een URL, een verificatieverslag en, waar het
conformance claimt, de hashes van de gepubliceerde `ConformanceReport`s
(`docs/CERTIFICATION.md`). Vermelding is geen aanbeveling, certification of partnerschap. Vandaag heeft de
directory één vermelding, de exploitant van deze site, omdat niemand anders heeft gevraagd.

