<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance והדרך ל-certification

**Status:** טיוטה, 2026-10-04 (RFC-0008). עדיין לא נשכר מתקשר (certifier); זהו המסלול
הסטנדרט מציע.

## 1. שלושה שלבים

| שלב | מי | מה זה אומר | מוצג כ- |
|---|---|---|---|
| **Self-declared** | היצרן או המפרסם | הריץ את הוקטורים הציבוריים עם הכלי הציבורי ופרסם `ConformanceReport` (`schemas/conformance.schema.json`), חתום עם המפתח שלו | הדוח, עם ה-suites והספירות; לעולם לא תג (badge) |
| **Verified** | מפעיל registry | שחזר את הריצה מול אותו hash של סט וקטורים וחתם בשליליות על הדוח | הדוח בתוספת ה-verifier |
| **Certified** | certifier עצמאי (לא קיים כיום) | הריץ את ה-suite בתוספת בדיקות חומרה ומקרה בטיחות (safety-case) תחת scheme שפורסם והעניק את הסימן | הדוח, ה-certifier, הסימן |

דו"ח שנכשל בכל וקטור של מחלקה אינו רשאי לתבוע את אותה מחלקה. ה-registry מציג
reports, לא badges.

היום מפעיל ה-registry היחיד הוא האחראי על המפרט (cookwala.ai), לכן "verified" אינו מוסיף
עצמאות עד שקיים registry שני; הסטטוס עדיין מוצג כ-self-verification.

## 2. מה דוח מכיל

גרסה ליבה, המחלקה שנטען (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) או טענת פרופיל (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), הנושא (מוצר, ספק, גרסה), הסוויטות שהורצו עם סכומים ו-vector ids שנכשלו,
ה-hash של קבוצת ה-vector, הכלי וה-commit, התאריך, הסטטוס וה-verifier. דוגמה: `examples/conformance/report-reference.json`, הופק על ידי

```bash
python tools/run_conformance.py --report report.json
```

## 3. מחלקות ומה הן מוכיחות

| מחלקה | וקטורים | נדרש גם עבור certification (לא מכוסה על ידי וקטורים) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review of recipes על ידי איש מקצוע לבטיחות מזון |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | ה-safety case של המכשיר עצמו (ISO 13482, IEC 60335, UL 3300 ככל שרלוונטי); local stop latency measured; safety limits enforced ללא רשת |
| Catalog | hash, signature, key revocation, recalls | key custody ותהליך incident intake |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | תוצאות שפורסמו per model עם method |
| Verifier | כל ה-Core suites | ללא |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; ללא personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof process |

## 4. מה certification אינה יכולה להבטיח

דו"ח conformance מוכיח שהתוכנה התנהגה כפי שהווקטורים דורשים ביום שבו היא רצה.
הוא אינו מוכיח שמכשיר הוא בטוח בכל מטבח, שמתכון טעים כראוי, או שלא ניתן להיתקל בנזק. תקן שמבטיח אפס נזק יהיה לא ישר; תקן זה מבטיח
שמגבלות נאכפות מקומית, ש-refusal before heat מתרחש, ושאפשר לבדוק רישומים.

## 5. ממשל של הסימן

סימן ה-certification והכללים שלו עוברים לבסיס הניטרלי עם סימן המסחר
(`GOVERNANCE.md`). עד אז לא קיים סימן; קיימים רק דוחות.

