<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: weşandina û dîtina rêçan, amûr û pakînan

> **Rewşa: profîla taslak.** Modelî li ser Registry MCP ya fermî hat kirin, ku Model
> Context Protocol serveran dihejînin: namespacesên piştrastkirî, versiyonên hatine binguhêrtin,
> hashên yekserî (integrity hashes), endpointekî validationê û rewşa lifecycleê.

Registry **lîsteya nîşaneyan e**: çi heye, kî publish kiriye, kîjan versiyona tam,
û hashê wê çi ye. Naverok li her derê dimîne ku publishkarê wê li ser dimîne (her katalog, her domain).
Her kes dikare registryekê bixe amadekirin. cookwala.ai yekemîn li `/v1/registry.json` dixemîne.

## 1. Navên îspat dikin kî dikiriye weşandinê

Her kirdekar bi navê `<namespace>/<name>` tê navînkirin. Divê namespace were îspatkirin:

| Namespace | Mînak | Delîl |
|---|---|---|
| Domainek, vegerandî | `org.fifi-cooking/egyptian-home` | Rekorda DNS TXT `cookwala-verify=<token>` li `fifi-cooking.org`, an `https://fifi-cooking.org/.well-known/cookwala-verify` ku tokenê vedigerîne |
| Hesapê host-code | `io.github.amado2k5/recipes` | Tokenê OIDC yê GitHub (an GitLab) ji karê CI di wê hesabê de |
| Mikilek | her | İmza ji aliyê mikilekê ve ku jixwe bi namespace ve girêdayî ye (rotation) |

Nav never ji nû ve nayên bikaranîn. Navên hatine jêbirin wekî tombstones dimînin.

## 2. Versiyonan exactly in

## 2. Versiyon in exactly in

- **Tenê versiyonên tam.** Naventî versiyonekê (`1.4.2`) diyar dikin; ramanên wek `^1.4` an `1.x` têne redkirin.
- **Hashes.** Her versiyon `sha256` ya artefaktê qeyd dike, û klientan berî bikaranînê ew piştrast dikin.
    Reseteyên (Recipes) jî hashê belgeya xwe ya Cookwala digirin, û pêkanîner (executors) nebaşiyê red dikin.
- **Repository id.** Naventî dema ku `repository id` yê stabî yê mêzini (host) hebe, qeyd dikin,
  da ku repositoryyeke ku hatiye jêbirîn û dîsa bi heman navî hatiye avakirin were tespîtkirin.

## 3. Çarçoveya Jiyanê

`active` → `deprecated` (hîn dikare were bikaranîn, cihgirek heye) → `recalled` (neewlemend; her wiha di feedê recall de tê weşandin, û pêkanîkar refûz dike) → `deleted` (tombstone).

## 4. Rêberiya weşandinê

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

`registry` heman valîdasyonê wekî `POST /v1/registry/validate` dimeşe: schema, semantîka rêçan (operation envelopes, germahî), hashes û proofê namespaceê. Her pirsgirêk wekî lîsteyekî perest (structured) vedigere, da ku CI bikaribe nîşan bide.

> API di [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) de tê pênasekirin.
> xizmetmetî hîn dereng tê; îro navkêş bi pull request tê zêdekirin ji `site/v1/registry.json`, ku tenê tiştên di vê repo-yê de hene di nav listeyê de diке. Rêzên nav û versiyonê ji aliyê `conformance/profiles/registry.json` ve têne ceribandin.

## 5. Têketin

Li `catalog.schema.json#/$defs/RegistryEntry` binêre:

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

`/v1/directory.json` rêzimanên ku **daxwaziye** ku werin di rêziman de werin navandin dihewîne
(`catalog.schema.json#/$defs/DirectoryEntry`): çêkerên amîran, kataloq, registry, food bank,
metbexên civakî, bernameyên dibistan û alîkariyê, fermeyên çandiniyê û kooperatîvên, diler, restoran,
berhembêrên rêçan, sertifikîdkêr, laboratoyên lêkolînê, saziyên tenduristiyê, hikûmet, bîniman,
cemeyên wergerê. Her navnîşandeyî rolek, welatek, URL, rekorda piştrastkirinê û, li cihên ku
dibêje conformance, hashên `ConformanceReport`ên wî yên weşandî dihewîne
(`docs/CERTIFICATION.md`). Rêziman kirin ne piştevaniya, certification an jî hevkariya we ye. Îro
directory yek navnîşandeyî heye, operaterê vê malperê, ji ber ku tu kesê din hîn daxwaz nekiriye.

