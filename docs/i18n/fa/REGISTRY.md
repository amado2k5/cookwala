<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: انتشار و یافتن دستور پخت‌ها، دستگاه‌ها و packها

> **Status: draft profile.** Modelled بر اساس official MCP Registry، که لیست می‌کند Model
> Context Protocol servers: verified namespaces، pinned versions، integrity hashes، یک
> validation endpoint و یک lifecycle status.

the registry یک **لیست از نشانگرها** است: چه چیزی وجود دارد، چه کسی آن را منتشر کرده است، کدام نسخه دقیق،
و hash آن. محتوا هر جا که ناشر آن را میزبانی کند باقی می‌ماند (هر کاتالوگ، هر دامنه).
هر کسی می‌تواند یک registry را اجرا کند. cookwala.ai اولین آن را در `/v1/registry.json` اجرا می‌کند.

## ۱. نام‌ها ثابت می‌کنند چه کسی منتشر کرده است

هر ورودی با نام `<namespace>/<name>` نام‌گذاری شده است. namespace باید اثبات شود:

| Namespace | Example | Proof |
|---|---|---|
| یک دامنه، معکوس شده | `org.fifi-cooking/egyptian-home` | رکورد DNS TXT به صورت `cookwala-verify=<token>` در `fifi-cooking.org` یا `https://fifi-cooking.org/.well-known/cookwala-verify` که توکن را بازمی‌گرداند |
| یک حساب کد-میزبان | `io.github.amado2k5/recipes` | توکن OIDC از GitHub (یا GitLab) حاصل از یک CI job در آن حساب |
| یک کلید | any | یک امضا توسط کلیدی که از قبل به namespace متصل شده است (rotation) |

نام‌ها هرگز دوباره استفاده نمی‌شوند. ورودی‌های حذف شده به عنوان سنگ‌چین (tombstones) باقی می‌مانند.

## 2. نسخه‌ها دقیق هستند

- **فقط نسخه‌های دقیق.** ورودی‌ها یک نسخه (`1.4.2`) را تثبیت می‌کنند؛ بازه‌هایی مانند `^1.4` یا `1.x` رد می‌شوند.
- **هش‌ها.** هر نسخه `sha256` اثر را ثبت می‌کند و کلاینت‌ها آن را قبل از استفاده تأیید می‌کنند. دستورالعمل‌ها نیز هش سند Cookwala خود را همراه دارند و اجراکنندگان در صورت عدم تطابق، refusal before heat انجام می‌دهند.
- **Repository id.** ورودی‌ها stable repository id میزبان کد را در صورت وجود ثبت می‌کنند، بنابراین یک مخزن حذف‌شده و دوباره ساخته‌شده با همان نام شناسایی می‌شود.

## 3. چرخه حیات

`active` → `deprecated` (هنوز قابل استفاده است، یک جایگزین وجود دارد) → `recalled` (ناایمن؛ همچنین در recall feed منتشر می‌شود، و اجراکنندگان آن را refuse می‌کنند) → `deleted` (tombstone).

## 4. جریان انتشار

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

`registry` همان اعتبارسنجی `POST /v1/registry/validate` را اجرا می‌کند: schema، معناشناسی دستور پخت (operation envelopes، دماها)، هش‌ها و اثبات namespace. هر مشکل به صورت یک لیست ساختاریافته باز می‌گردد، بنابراین CI می‌تواند آن را نشان دهد.

> API در [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002) توصیف شده است.
> سرویس later ارائه می‌شود؛ امروز ورودی‌ها از طریق pull request به `site/v1/registry.json` اضافه می‌شوند، که تنها مواردی را که در این مخزن وجود دارد فهرست می‌کند. قوانین نام و نسخه توسط
> `conformance/profiles/registry.json` تست می‌شوند.

## 5. ورود

مشاهده کنید `catalog.schema.json#/$defs/RegistryEntry`:

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

## 6. Directory سازمان‌ها

`/v1/directory.json` سازمان‌هایی را فهرست می‌کند که **درخواست** کرده‌اند فهرست شوند
(`catalog.schema.json#/$defs/DirectoryEntry`): سازندگان دستگاه، کاتالوگ‌ها، registryها، food bankها،
آشپزخانه‌های محلی، برنامه‌های مدارس و امدادی، مزارع و تعاونی‌ها، خواربارفروشان، رستوران‌ها،
ناشران دستور پخت، certifierها، آزمایشگاه‌های تحقیقاتی، نهادهای سلامت، دولت‌ها، بیمه‌گران، جوامع
مترجم. هر ورودی دارای نقش‌ها، یک کشور، یک URL، یک سابقه تأیید و در جایی که ادعای conformance دارد، هش‌های `ConformanceReport`های منتشر شده‌اش است
(`docs/CERTIFICATION.md`). فهرست کردن به معنای تأیید، certification یا مشارکت نیست. امروزه
directory دارای یک ورودی است، اپراتور این سایت، زیرا هنوز هیچ‌کس دیگری درخواست نداده است.

