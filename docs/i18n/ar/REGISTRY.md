<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->

# Cookwala Registry: نشر وإيجاد الوصفات والأجهزة وحزم الـ packs

> **الحالة: draft profile.** تم نمذجته بناءً على MCP Registry الرسمي، والذي يسرد خوادم Model
> Context Protocol: مساحات أسماء (namespaces) تم التحقق منها، وإصدارات مثبتة، وعلامات هاش للتكامل (integrity hashes)، ونقطة نهاية للتحقق (validation endpoint)، وحالة دورة حياة.

السجل هو **قائمة من المؤشرات**: ما هو موجود، ومن نشره، وأي إصدار محدد،
والـ hash الخاص به. يظل المحتوى حيثما يستضيفه الناشر (أي كتالوج، أي نطاق).
يمكن لأي شخص تشغيل registry. يعمل cookwala.ai على تشغيل الأول في `/v1/registry.json`.

## 1. الأسماء تثبت من قام بالنشر

كل إدخال مسمى `<namespace>/<name>`. يجب إثبات الـ namespace:

| Namespace | Example | Proof |
|---|---|---|
| نطاق (domain)، معكوس | `org.fifi-cooking/egyptian-home` | سجل DNS TXT ‏`cookwala-verify=<token>` على `fifi-cooking.org`، أو `https://fifi-cooking.org/.well-known/cookwala-verify` يُرجع الـ token |
| حساب مستضيف للكود (code-host account) | `io.github.amado2k5/recipes` | رمز OIDC من GitHub (أو GitLab) من وظيفة CI في ذلك الحساب |
| مفتاح (key) | أي | توقيع بواسطة مفتاح مرتبط بالفعل بالـ namespace (تدوير/rotation) |

الأسماء لا تُعاد استخدامها أبدًا. المدخلات المحذوفة تظل كشواهد (tombstones).

## 2. الإصدارات دقيقة

- **الإصدارات الدقيقة فقط.** تُثبّت المدخلات إصداراً معيناً (`1.4.2`)؛ وتُرفض النطاقات مثل `^1.4` أو `1.x`.
- **الهاشات (Hashes).** يسجل كل إصدار الـ `sha256` الخاص بالأثر (artifact)، ويتحقق العملاء منه قبل الاستخدام. كما تحمل الوصفات هاش مستند Cookwala الخاص بها، ويرفض المنفذون أي عدم تطابق.
- **معرف المستودع (Repository id).** تسجل المدخلات معرف المستودع المستقر لمضيف الكود في حال وجوده، بحيث يتم اكتشاف المستودع الذي تم حذفه وإعادة إنشائه بنفس الاسم.

## 3. دورة الحياة

`active` ← `deprecated` (لا يزال قابلاً للاستخدام، يوجد بديل له) ← `recalled` (غير آمن؛ يُنشر أيضاً في feed الـ recall، ويرفضه الـ executors) ← `deleted` (tombstone).

## 4. تدفق النشر

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

يقوم الـ registry بتشغيل نفس عملية التحقق (validation) الخاصة بـ `POST /v1/registry/validate`: المخطط (schema)، ودلالات الوصفة (recipe semantics) (نطاقات التشغيل operation envelopes، ودرجات الحرارة)، والهاشات (hashes)، وإثبات مساحة الأسماء (namespace proof). تعود كل مشكلة في شكل قائمة منظمة، بحيث يمكن لـ CI عرضها.

> يتم وصف الـ API في [`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002).
> الخدمة ستأتي later؛ اليوم يتم إضافة المدخلات عبر pull request إلى `site/v1/registry.json` الذي يسرد
> فقط ما هو موجود في هذا المستودع. يتم اختبار قواعد الاسم والإصدار بواسطة
> `conformance/profiles/registry.json`.

## 5. المدخل

انظر `catalog.schema.json#/$defs/RegistryEntry`:

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

تدرج قائمة `/v1/directory.json` المنظمات التي **طلبت** إدراجها
(`catalog.schema.json#/$defs/DirectoryEntry`): صانعي الأجهزة، الكتالوجات، الـ registries، الـ food banks،
المطابخ المجتمعية، البرامج المدرسية وبرامج الإغاثة، المزارع والتعاونيات، البقالين، المطاعم،
ناشري الوصفات، الجهات المانحة للـ certification، مختبرات الأبحاث، الهيئات الصحية، الحكومات، شركات التأمين،
ومجتمعات المترجمين. يحتوي كل إدخال على أدوار، ودولة، و URL، وسجل تحقق، وحيثما
يدعي الـ conformance، فإن الـ hashes الخاصة بـ `ConformanceReport`s المنشورة
(`docs/CERTIFICATION.md`). الإدراج ليس تأييداً أو certification أو شراكة. اليوم يحتوي
الـ directory على إدخال واحد، وهو مشغل هذا الموقع، لأنه لم يطلب أحد غيره بعد.

