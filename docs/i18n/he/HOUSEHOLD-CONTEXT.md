<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: התמונה המלאה נשארת בבית

> **סטטוס: draft profile** (RFC-0001). אינו חלק מ-Cookwala Core. סכימה:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> חוקי נמען: `profiles/household/recipient-roles.json`. API מקומי:
> `api/household.openapi.yaml`. דוגמה: `examples/household/context.json`.

## 1. למה

רובוט שמשרת משפחה היטב צריך לדעת הרבה מאוד: המכשירים והמוזרויות שלהם, מי גר שם ומתי הם בבית, חיות מחמד, ילדים, דיאטות, אלרגיות, זמני נטילת תרופות, טקסים, תקציב, הרגלי קניות, מה השתבש בפעם האחרונה. אותם עובדות הן תוכנית פריצה וכלי למידור (profiling). פרופיל זה נותן ל**מתכנן בבית** את התמונה המלאה ונותן לכל השאר רק **constraint**.

## 2. שלוש רעיונות

1. **Facets.** עובדה מוקלדת אחת לכל (`cw.facet.household.health.allergies`), עם מי
   הצהיר עליה (declared, observed, reported, inferred), מתי, למשך כמה זמן, רמת ביטחון,
   ומעמד פרטיות (`public`, `household`, `sensitive`, `secret`).
2. **חוקי נסיעה ב-registry.** כל סוג facet מציין האם הערך הגולמי שלו רשאי לעזוב את
   הבית: `never` (45 סוגים: ילדים, היעדרויות, פריסות, מצבים בריאותיים, דת,
   התנהגות, אירועים, מצב הכנסה), רק כמגבלת `derived` (81 סוגים), או כחשיפה
   במסגרת `consented` לאחר מתן אישור מפורש (13 סוגים, בעיקר מצב-עצמי של מכשיר עבור
   ה-maker).
3. **Derived constraints.** האובייקט הביתי היחיד שמוכר, מתכנן, שירות משלוחים,
   יצרן מכשירים או רובוט אחר מקבל אי פעם: "ספק 17:00–18:00 לדלת הקדמית",
   "חסום בוטנים", "אין תנועת רובוט במסדרון 15:00–15:30", "תקרת תקציב 18.00 USD לכל
   ארוחה". כל אחד מציין את **סוגי** ה-facet ממנו הוא הגיע, לעולם לא את הערכים שלהם.

## 3. מי מקבל מה

| תפקיד נמען | עשוי לקבל |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI או תוכנה המתכננת את הארוחה) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary only (counts of faults by category, no times, no household facts), ורק כאשר ה-household הגדיר insurer כנמען; RFC-0001 מפרט זאת כתפקיד שסביר ביותר שיוסר אם ביקורת פרטיות תתנגד |
| program (food bank, school) | כלום |
| dataset | כלום |

## 4. חוקים

- facets גולמיים לעולם אינם עוזבים את המכשיר. אין API שמחזיר אותם לאף אחד מחוץ לרשת הביתית.
- facets מסוג `inferred` לעולם אינם משמשים להחלטות בטיחות.
- ציון התנהגותי של אף אדם אינו מופק או נשמר. facets התנהגות קיימים כדי לשרת את ה-household (גודל מנות, מתי לפנות) ולעולם אינם עוברים.
- רמה כלכלית היא **owner-set budget posture**, לעולם אינה מוסקת מכל דבר אחר.
- נתונים על ילדים והיעדרויות הם `secret` ולעולם אינם עוברים, אפילו לא derived, אלא כ-movement ו-safe-zone constraints שאינם חושפים לוח זמנים.
- כל facet ניתן למחיקה. המחיקה מושלמת בתוך ה-window של ה-household (ברירת מחדל 7 ימים, לכל היותר 30) ומתועדת ב-execution log ללא תוכן.
- ניתן להעלות privacy class מעל ברירת המחדל של ה-registry, אך לעולם לא להוריד אותה.

## 5. זיכרון האירועים המקומי

RFC-0001 שואל מה הרובוט זוכר לגבי התראות, קונפליקטים, ויתורים ולקחים. `LocalIncident` מחזיק בזה: תאריך, קטגוריה מתוך
`vocab/incidents.json`, מי היה מעורב לפי סוג, הערה ולקח. הוא לעולם לא עוזב את ה-
home. ה-`IncidentReport` הציבורי והאנונימי ב-Core הוא מסמך שונה שכל
maker לומד ממנו.

## 6. Conformance

וקטורי פרופיל (`conformance/profiles/disclosure_policy.json`) נותנים facets ותפקיד נמען ומצפים לסוגי ה-constraint המדויקים, ids שנחשפו ו-ids שנשמרו עם סיבות. המימוש הייחוס הוא `derive_constraints()` ב-`tools/cookwala_ref.py`.

## 7. קשר למסמכים אחרים

`ClientProfile`, `KitchenProfile` ו-`RobotProfile` (`profile.schema.json`) נשארים כחבילות נוחות. facets של המשימה (`mission.schema.json`) משתמשים באותם מזהי registry. ה-`AgentMandate` הליבתי נשאר כהצהרה נורמטיבית של מה סוכן רשאי לעשות; facets של mandate מתארים את חוקי ה-household באופן מקומי.

## 8. שאלות פתוחות

ראה RFC-0001: תפקידי נמען סגורים; פרטיות מסוג raise-only; הערכת השפעה על הגנת נתונים עם בודק.

