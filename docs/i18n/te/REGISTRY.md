<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: రెసిపీలు, పరికరాలు మరియు ప్యాక్‌లను ప్రచురించడం మరియు కనుగొనడం

> **Status: draft profile.** Modelled on the official MCP Registry, which lists Model
> Context Protocol servers: verified namespaces, pinned versions, integrity hashes, a
> validation endpoint and a lifecycle status.

> **Status: draft profile.** Model Context Protocol సర్వర్లను జాబితా చేసే అధికారిక MCP Registry పై Modelled చేయబడింది: verified namespaces, pinned versions, integrity hashes, ఒక validation endpoint మరియు ఒక lifecycle status.

registry అనేది ఒక **list of pointers**: ఏమి ఉందో, ఎవరు దానిని ప్రచురించారో, ఏ ఖచ్చితమైన వెర్షన్,
మరియు దాని hash. కంటెంట్ దాని ప్రచురణకర్త ఎక్కడ హోస్ట్ చేస్తే అక్కడ ఉంటుంది (ఏ catalog, ఏ domain).
ఎవరైనా registry ని నడపవచ్చు. cookwala.ai మొదటి దానిని `/v1/registry.json` వద్ద నడుపుతుంది.

## 1. పేర్లు ఎవరు ప్రచురించారో నిరూపిస్తాయి

ప్రతి ఎంట్రీ `<namespace>/<name>` గా పేరు చేయబడింది. namespace ని నిరూపించాలి:

| Namespace | Example | Proof |
|---|---|---|
| ఒక డొమైన్, రివర్స్ చేయబడినది | `org.fifi-cooking/egyptian-home` | `fifi-cooking.org` పై DNS TXT record `cookwala-verify=<token>`, లేదా `https://fifi-cooking.org/.well-known/cookwala-verify` టోకెన్‌ను తిరిగి ఇవ్వడం |
| ఒక కోడ్-హోస్ట్ ఖాతా | `io.github.amado2k5/recipes` | ఆ ఖాతాలోని ఒక CI job నుండి వచ్చిన GitHub (లేదా GitLab) OIDC టోకెన్ |
| ఒక కీ | any | ఇప్పటికే namespaceకి బైండ్ చేయబడిన కీ ద్వారా సంతకం (rotation) |

Names are never reused. Deleted entries stay as tombstones.

పేర్లు ఎప్పుడూ మళ్ళీ ఉపయోగించబడవు. తొలగించబడిన ఎంట్రీలు tombstones గానే ఉంటాయి.

## 2. వెర్షన్లు ఖచ్చితమైనవి

- **ఖచ్చితమైన వెర్షన్లు మాత్రమే.** ఎంట్రీలు ఒక వెర్షన్‌ను (`1.4.2`) పిన్ చేస్తాయి; `^1.4` లేదా `1.x` వంటి రేంజ్‌లు తిరస్కరించబడతాయి.
- **Hashes.** ప్రతి వెర్షన్ ఆర్టిఫాక్ట్ యొక్క `sha256`ను రికార్డ్ చేస్తుంది, మరియు క్లయింట్లు ఉపయోగించే ముందు దానిని ధృవీకరిస్తారు. రెసిపీలు వాటి స్వంత Cookwala డాక్యుమెంట్ hashను కూడా కలిగి ఉంటాయి, మరియు ఎగ్జిక్యూటర్లు అసమతుల్యతను (mismatch) refusal చేస్తారు.
- **Repository id.** ఎంట్రీలు కోడ్ హోస్ట్ యొక్క స్థిరమైన repository idని రికార్డ్ చేస్తాయి, ఒకవేళ అది ఉంటే, తద్వారా ఒకే పేరుతో తొలగించబడిన మరియు తిరిగి సృష్టించబడిన repository గుర్తించబడుతుంది.

## 3. Lifecycle

`active` → `deprecated` (ఇంకా ఉపయోగించవచ్చు, ఒక ప్రత్యామ్నాయం ఉంది) → `recalled` (అసురక్షితం; అలాగే
recall feed లో ప్రచురించబడింది, మరియు executors దీనిని నిరాకరిస్తారు) → `deleted` (tombstone).

## 4. ప్రచురణ ప్రవాహం (Publishing flow)

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

`POST /v1/registry/validate` లాగే registry కూడా అదే validationను నిర్వహిస్తుంది: schema, recipe semantics (operation envelopes, temperatures), hashes మరియు namespace proof. ప్రతి issue ఒక structured list రూపంలో తిరిగి వస్తుంది, తద్వారా CI దానిని చూపగలదు.

> APIని [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) లో వివరించారు.
> సేవ later వస్తుంది; ఈరోజు ఎంట్రీలు `site/v1/registry.json` కి pull request ద్వారా జోడించబడతాయి, ఇది
> ఈ రిపోజిటరీలో ఉన్న వాటిని మాత్రమే జాబితా చేస్తుంది. పేరు మరియు వెర్షన్ నియమాలు
> `conformance/profiles/registry.json` ద్వారా పరీక్షించబడతాయి.

## 5. Entry

`catalog.schema.json#/$defs/RegistryEntry` చూడండి:

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

## 6. సంస్థల Directory

`/v1/directory.json` జాబితాలో ఉండాలని **కోరిన** సంస్థలను జాబితా చేస్తుంది
(`catalog.schema.json#/$defs/DirectoryEntry`): పరికర తయారీదారులు, catalogs, registries, food banks,
community kitchens, school and relief programs, farms and cooperatives, grocers, restaurants,
recipe publishers, certifiers, research labs, health bodies, governments, insurers, translator
communities. ప్రతి entry కి roles, ఒక country, ఒక URL, ఒక verification record మరియు, ఎక్కడైతే అది conformance కలిగి ఉందని పేర్కొంటుందో, దాని ప్రచురించబడిన `ConformanceReport`ల hashes ఉంటాయి
(`docs/CERTIFICATION.md`). Listing అనేది endorsement, certification లేదా partnership కాదు. ఈరోజు
directory లో ఒక entry మాత్రమే ఉంది, అది ఈ సైట్ యొక్క operator, ఎందుకంటే ఇంకా ఎవరూ అడగలేదు.

