<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/REGISTRY.md -->
# Cookwala Registry: פרסום ומציאת מתכונים, מכשירים ו-packs

> **Status: draft profile.** Modelled על ה-MCP Registry הרשמי, המפרט שרתי Model
> Context Protocol: namespaces מאומתים, גרסאות נעולות, hashes של שלמות,
> validation endpoint וסטטוס lifecycle.

ה-registry הוא **רשימת מצביעים**: מה קיים, מי פרסם אותו, איזו גרסה מדויקת,
וה-hash שלו. התוכן נשאר היכן שמהמפרסם שלו מארח אותו (כל קטלוג, כל דומיין).
כל אחד יכול להריץ registry. cookwala.ai מריץ את הראשון ב-`/v1/registry.json`.

## 1. שמות מוכיחים מי פרסם

כל רשומה נקראת `<namespace>/<name>`. יש להוכיח את ה-namespace:

| Namespace | דוגמה | הוכחה |
|---|---|---|
| דומיין, הפוך | `org.fifi-cooking/egyptian-home` | רשומת DNS TXT מסוג `cookwala-verify=<token>` ב-`fifi-cooking.org`, או `https://fifi-cooking.org/.well-known/cookwala-verify` המחזירה את ה-token |
| חשבון code-host | `io.github.amado2k5/recipes` | טוקן OIDC מ-GitHub (או GitLab) מ-CI job בחשבון זה |
| מפתח | כלשהו | חתימה על ידי מפתח שכבר קשור ל-namespace (rotation) |

שמות לעולם לא משתמשים מחדש. רשומות שנמחקו נשארות כ-tombstones.

## 2. גרסאות הן מדויקות

- **גרסאות מדויקות בלבד.** ערכים מציינים גרסה (`1.4.2`); טווחים כגון `^1.4` או `1.x` נדחים.
- **Hashes.** כל גרסה רושמת את ה-`sha256` של הארטיפקט, ולקוחות מאמתים אותו לפני השימוש.
מתכונים נושאים גם את ה-Cookwala document hash שלהם, ומבצעים מבצעים refusal before heat במקרה של אי-התאמה.
- **Repository id.** ערכים רושמים את ה-stable repository id של מארח הקוד כאשר קיים כזה,
כך שמאגר שנמחק ונוצר מחדש עם אותו שם מזוהה.

## 3. מחזור חיים

`active` ← `deprecated` (עדיין ניתן לשימוש, קיים תחליף) ← `recalled` (לא בטוח; מפורסם גם ב-recall feed, ומבצעים מסרבים לו) ← `deleted` (tombstone).

## 4. תהליך פרסום

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

ה-registry מריץ את אותו אימות כמו `POST /v1/registry/validate`: סכימה, סמנטיקה של מתכונים (operation envelopes, טמפרטורות), hashes ו-namespace proof. כל בעיה חוזרת כרשימה מובנית, כך ש-CI יכול להציג אותה.

> ה-API מתואר ב-[`api/registry.openapi.yaml`](../api/registry.openapi.yaml) (RFC-0002). ה-
> שירות מגיע later; היום ערכים מתווספים על ידי pull request ל-`site/v1/registry.json`, אשר מפרט
> רק את מה שקיים ב-repository זה. חוקי שם וגרסה נבדקים על ידי
> `conformance/profiles/registry.json`.

## 5. כניסה

ראה `catalog.schema.json#/$defs/RegistryEntry`:

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

`/v1/directory.json` מפרט ארגונים ש**ביקשו** להופיע ברשימה
(`catalog.schema.json#/$defs/DirectoryEntry`): יצרני מכשירים, קטלוגים, registries, food banks,
מטבחים קהילתיים, תוכניות בית ספר וסיוע, חוות וקואופרטיבים, מכולות, מסעדות,
מוציאים לאור של מתכונים, certifiers, מעבדות מחקר, גופים בריאותיים, ממשלות, מבטחים, קהילות
מתרגמים. לכל רשומה יש תפקידים, מדינה, URL, רשומת אימות, ובמקום שבו היא
טוענת conformance, ה-hashes של ה-`ConformanceReport`s המפורסמים שלה
(`docs/CERTIFICATION.md`). רישום אינו מהווה אישור, certification או שותפות. כיום ב-directory
ישנה רשומה אחת, המפעיל של אתר זה, מכיוון שאיש מלבד הוא לא ביקש עדיין.

