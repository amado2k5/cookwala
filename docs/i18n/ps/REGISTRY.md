<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: د ترکیبونو، وسیلو او پیکس (packs) خپرول او موندل

> **تنظیمات: مسوداتو پروفایل.** په अधिकृत MCP Registry باندې ماډل شوی، چې لاندې Model
> Context Protocol سرورونه لیست کوي: تایید شوي namespaces، ټینګ شوي نسخې، د سالمیت hashes، یو
> validation endpoint او د ژوند دور (lifecycle) حالت.

رجسټري د **پوډرونو (pointers) یوه لیست** ده: څه شتون لري، چا یې خپر کړی، کومه دقیق نسخه ده،
او د هغې هیش (hash) څه دی. محتوا هلته پاتې کیږي چیرته چې خپرونکی یې ځای پر ځای کوي (هر کټالوګ، هر ډومین).
هر څوک کولی شي رجسټري چلوي. cookwala.ai لومړۍ رجسټري په `/v1/registry.json` چلوي.

## 1. نومونه ثابتوي چې چا خپرونه کړي دي

هر ننوتنه `<namespace>/<name>` ته نومول کېږي. باید فضای (namespace) ثابت شوې وي:

| Namespace | مثال | ثبوت |
|---|---|---|
| یو ډومین، شړل شوی | `org.fifi-cooking/egyptian-home` | DNS TXT ریکارډ `cookwala-verify=<token>` په `fifi-cooking.org` کې، یا `https://fifi-cooking.org/.well-known/cookwala-verify` چې ټوکن بیرونی کوي |
| یو کوډ-میلمند حساب | `io.github.amado2k5/recipes` | GitHub (یا GitLab) OIDC ټوکن د هغه حساب څخه په یو CI job کې |
| یو کلید | هر څه | د یو کلید په واسطه چې لا دمخه له namespace سره تړاو لري (rotation) |

د نومونو بیا کارول کېږي، نه. رامینځته شوي ننوتنې د tombstones په څېر پاتې کېږي.

## 2. نسخې دقیقې دي

- **یوازې دقیق نسخې.** ننوتنې یوه نسخه (`1.4.2`) ټینګوي؛ د `^1.4` یا `1.x` په څېر رینجونه رد شوي دي.
- **هاشونه.** هر نسخه د آرټیفیکټ `sha256` ثبتوي، او پیرودونکي یې له کارولو وړاندې تاییدوي.
ورکښې (Recipes) خپل Cookwala سند هاش هم لري، او اجرایونکي (executors) د ناسم سمون (mismatch) په صورت کې رد کوي.
- **Repository id.** ننوتنې د کوډ میزبان stable repository id ثبتوي کله چې هغه شتون ولري،
ترڅو په ورته نوم یو ډلیلي او بیا رغالي repository تشخیص شي.

## 3. ژوندنۍخه (Lifecycle)

`active` → `deprecated` (لاKal کیدی شي، بدل موجود دی) → `recalled` (ناامن؛ همدارنګه په recall feed کې خپر شوی، او executors یې ردوي) → `deleted` (tombstone).

## ۴. د خپرولو جریان (Publishing flow)

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

`registry` هماغه تایید (validation) ترسره کوي چې `POST /v1/registry/validate` ترسره کوي: schema، د ریسیپي معنايي (operation envelopes، درجات)، hashes او namespace proof. هر مسئله د یو جوړښت لرونکي لیست په توګه بیرته راځي، نو ځکه CI یې ښودلی شي.

> API په [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) کې بیان شوی دی.
> خدمت later راځي؛ نن اندراجونه د pull request له لارې `site/v1/registry.json` ته اضافه کېږي، چې یوازې هغه څه لیستوي چې په دې repository کې شتون لري. نوم او د نسخه قواعد د `conformance/profiles/registry.json` لخوا ازمویل کېږي.

## 5. ننوتنه

`catalog.schema.json#/$defs/RegistryEntry` وګورئ:

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

## 6. د سازمانونو ډയरेक्टري (Directory)

`/v1/directory.json` هغه سازمانونه لیست کوي چې **پوښتنه** یې کړې ده چې په لیست کې شامل شي
(`catalog.schema.json#/$defs/DirectoryEntry`): د وسیلو جوړونکي، کټالوګونه، registry، food bank،
ټولنیزې پخلنځي، ښوونځي او مرستندویه پروګرامونه، فارم‌ها او همکارۍ، د خوراکي توکو پلورونکي، رستورانتونه،
د ترکیبونو خپرونکي، certifiers، څیړنیزې لابراتوارونه، روغتیايي ادارې، حکومتونه، بیمه کونکي، ژباړلونکي
ټولنې. هر entry رولونه، یو هیواد، یو URL، یو د تحقق کولو ریکارډ او، چیرته چې دا
conformance ادعا کوي، د هغې د خپر شوي `ConformanceReport`ګ هیشونه لري
(`docs/CERTIFICATION.md`). لیست کول نه دي endorsement، certification یا شراکت. نن
directory یوازې یو entry لري، چې د دې سایټ اپریټر دی، ځکه چې تر اوسه بل چا پوښتنه نه ده کړې.

