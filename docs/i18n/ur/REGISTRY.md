<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: ترکیبیں، آلات اور packs شائع کرنا اور تلاش کرنا

> **Status: draft profile.** Modelled on the official MCP Registry, which lists Model
> Context Protocol servers: verified namespaces, pinned versions, integrity hashes, a
> validation endpoint and a lifecycle status.

**Status: draft profile.** Modelled on the official MCP Registry, which lists Model
Context Protocol servers: verified namespaces, pinned versions, integrity hashes, a
validation endpoint and a lifecycle status.

registry ایک **pointers کی فہرست** ہے: کیا موجود ہے، کس نے اسے شائع کیا، کون سا بالکل درست ورژن،
اور اس کا hash۔ مواد وہیں رہتا ہے جہاں اس کا ناشر اسے host کرتا ہے (کوئی بھی catalog، کوئی بھی domain)۔
کوئی بھی registry چلا سکتا ہے۔ cookwala.ai پہلی registry `/v1/registry.json` پر چلاتا ہے۔

## 1. نام ثابت کرتے ہیں کہ کس نے شائع کیا

ہر انٹری کا نام `<namespace>/<name>` ہے۔ namespace کا ثابت ہونا ضروری ہے:

| Namespace | مثال | ثبوت |
|---|---|---|
| ایک ڈومین، الٹا | `org.fifi-cooking/egyptian-home` | `fifi-cooking.org` پر DNS TXT ریکارڈ `cookwala-verify=<token>`, یا `https://fifi-cooking.org/.well-known/cookwala-verify` کا ٹوکن واپس کرنا |
| ایک کوڈ-ہوسٹ اکاؤنٹ | `io.github.amado2k5/recipes` | اس اکاؤنٹ میں ایک CI جاب سے GitHub (یا GitLab) OIDC ٹوکن |
| ایک کی (key) | کوئی بھی | ایک دستخط جو پہلے سے namespace سے منسلک کی (key) کے ذریعے کیا گیا ہو (rotation) |

ناموں کو کبھی دوبارہ استعمال نہیں کیا جاتا۔ حذف شدہ اندراجات tombstones کے طور پر رہتے ہیں۔

## 2. ورژن بالکل درست ہیں

- **صرف بالکل درست ورژن۔** اندراجات ایک ورژن (`1.4.2`) کو مخصوص کرتے ہیں؛ `^1.4` یا `1.x` جیسے رینجز مسترد کر دیے جاتے ہیں۔
- **Hashes۔** ہر ورژن آرٹفیکٹ کا `sha256` ریکارڈ کرتا ہے، اور کلائنٹس استعمال سے پہلے اس کی تصدیق کرتے ہیں۔ ریسیپیز اپنے Cookwala دستاویز کا ہیش بھی ساتھ رکھتے ہیں، اور ایگزیکیوٹرز غلط ملاپ کی صورت میں refusal before heat کرتے ہیں۔
- **Repository id۔** اندراجات کوڈ ہوسٹ کا مستحکم repository id ریکارڈ کرتے ہیں جب وہ موجود ہو، تاکہ اسی نام کے ساتھ حذف شدہ اور دوبارہ تخلیق شدہ ریپوزٹری کا پتہ لگایا جا سکے۔

## 3. Lifecycle

`active` → `deprecated` (اب بھی قابل استعمال ہے، ایک متبادل موجود ہے) → `recalled` (غیر محفوظ؛ recall feed میں بھی شائع کیا گیا ہے، اور executors اسے مسترد کر دیتے ہیں) → `deleted` (tombstone)۔

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

`registry` وہی validation چلاتا ہے جو `POST /v1/registry/validate` کرتا ہے: schema، recipe semantics (operation envelopes، temperatures)، hashes اور namespace proof۔ ہر مسئلہ ایک structured list کے طور پر واپس آتا ہے، تاکہ CI اسے دکھا سکے۔

> API کی وضاحت [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) میں کی گئی ہے۔
> سروس later آئے گی؛ آج اندراجات `site/v1/registry.json` میں pull request کے ذریعے شامل کیے جاتے ہیں، جو صرف وہی فہرست میں شامل کرتا ہے جو اس ریپوزٹری میں موجود ہے۔ نام اور ورژن کے قواعد کی جانچ `conformance/profiles/registry.json` کے ذریعے کی جاتی ہے۔

## 5. داخلہ

`catalog.schema.json#/$defs/RegistryEntry` دیکھیں:

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

## 6. تنظیمات کی Directory

`/v1/directory.json` ان تنظیمات کو فہرست میں شامل کرتا ہے جنہوں نے فہرست میں شامل ہونے کی **درخواست** کی ہے
(`catalog.schema.json#/$defs/DirectoryEntry`): ڈیوائس بنانے والے، کیٹلاگ، registries، food banks،
کمیونٹی کچن، اسکول اور ریلیف پروگرام، فارمز اور کوآپریٹوز، گروسرز، ریسٹورنٹ،
ریسیپی پبلشرز، certifiers، تحقیقی لیبارٹریز، صحت کے ادارے، حکومتیں، انشورنس کمپنیاں، مترجم
کمیونٹیز۔ ہر انٹری کے پاس roles، ایک ملک، ایک URL، ایک تصدیقی ریکارڈ اور، جہاں یہ
conformance کا دعویٰ کرتی ہے، اس کے شائع شدہ `ConformanceReport`s کے ہیشز ہیں
(`docs/CERTIFICATION.md`)۔ فہرست میں شامل کرنا کوئی توثیق، certification یا شراکت داری نہیں ہے۔ آج
directory میں ایک انٹری ہے، اس سائٹ کا آپریٹر، کیونکہ ابھی تک کسی اور نے درخواست نہیں کی ہے۔

