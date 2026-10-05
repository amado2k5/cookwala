<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: kuchapisha na kupata mapishi, vifaa na rule pack

> **Hali: draft profile.** Imeundwa kulingana na MCP Registry rasmi, ambayo inaorodhesha seva za Model
> Context Protocol: namespaces zilizothibitishwa, matoleo yaliyofungwa, integrity hashes, kiunganishi cha
> validation na hali ya lifecycle.

Registry ni **orodha ya viashiria**: nini kipo, nani alichapisha, toleo gani kamili,
na hash yake. Maudhui yanabaki popote ambapo mchapishaji wake anayahifadhi (katalog yoyote, domain yoyote).
Mtu yeyote anaweza kuendesha registry. cookwala.ai inaendesha ya kwanza kwenye `/v1/registry.json`.

## 1. Majina yanathibitisha nani aliyechapisha

Kila ingizo linaitwa `<namespace>/<name>`. Namespace lazima ithibitishwe:

| Namespace | Mfano | Ushahidi |
|---|---|---|
| Domain, iliyogeuzwa | `org.fifi-cooking/egyptian-home` | Rekodi ya DNS TXT `cookwala-verify=<token>` kwenye `fifi-cooking.org`, au `https://fifi-cooking.org/.well-known/cookwala-verify` inayorudisha token |
| Akaunti ya code-host | `io.github.amado2k5/recipes` | Token ya OIDC kutoka GitHub (au GitLab) kutoka kazi ya CI katika akaunti hiyo |
| Funguo | yoyote | Saini inayotolewa na funguo ambayo tayari imeunganishwa na namespace (rotation) |

Majina hayatumiwi tena kamwe. Ingizo zilizofutwa hubaki kama tombstones.

## 2. Matoleo ni sahihi

- **Matoleo kamili pekee.** Ingizo hufunga toleo (`1.4.2`); masafa kama `^1.4` au `1.x`
  yanakataliwa.
- **Hashes.** Kila toleo huandika `sha256` ya kifaa, na wateja huithibitisha kabla ya kuitumia.
  Mapishi pia hubeba hash yake yenyewe ya hati ya Cookwala, na watekelezaji hukataa kutofautiana.
- **Repository id.** Ingizo huandika repository id thabiti ya mwenyeji wa kodi ikiwa ipo,
  ili repository iliyofutwa na kuundwa upya yenye jina lilelile itambulike.

## 3. Maisha ya Mzunguko

`active` → `deprecated` (bado inaweza kutumika, mbadala upo) → `recalled` (si salama; pia
imechapishwa kwenye recall feed, na watekelezaji huikataa) → `deleted` (tombstone).

## 4. Mtiririko wa kuchapisha

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

`registry` huendesha uhakiki ule ule kama `POST /v1/registry/validate`: schema, semantics za recipe (operation envelopes, joto), hashes na ushahidi wa namespace. Kila tatizo hurudi kama orodha iliyopangwa, ili CI iweze kuonyesha.

> API inaelezwa katika [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). Huduma
> inakuja later; leo ingizo zinaongezwa kwa pull request kwenye `site/v1/registry.json`, ambayo inaorodhesha
> tu kile kinachopo katika repository hii. Sheria za jina na toleo zinajaribiwa na
> `conformance/profiles/registry.json`.

## 5. Kuingia

Angalia `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory ya mashirika

`/v1/directory.json` inaorodhesha mashirika ambayo **yaliomba** kuorodheshwa
(`catalog.schema.json#/$defs/DirectoryEntry`): watengenezaji wa vifaa, katalogi, registries, food banks,
jiko za jamii, programu za shule na misaada, mashamba na ushirika, wauzaji wa bidhaa, migahawa,
wachapishaji wa mapishi, watia sifa, maabara za utafiti, vyombo vya afya, serikali, bima, jamii za
watafsiri. Kila ingizo lina majukumu, nchi, URL, rekodi ya uhakiki na, pale inapodai conformance,
hashi za `ConformanceReport` zake zilizochapishwa
(`docs/CERTIFICATION.md`). Kuorodheshwa si uthibitisho, certification au ushirika. Leo
directory ina ingizo moja, mwendeshaji wa tovuti hii, kwa sababu hakuna mwingine aliyeomba bado.

