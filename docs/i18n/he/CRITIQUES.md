<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# ביקורות שפרסמנו

שאלנו שאלות קשות על Cookwala וכתבנו את התשובות. לכל חשש יש id
ב-[concern register של ה-action plan](ACTION-PLAN.md#2-concern-register), יחד עם
התגובה שלנו והסטטוס שלה. ביקורות מבחוץ יתקבלו בברכה ויופיעו כאן.

## האם זה הולך לעבוד? (strategy)

| Concern | Short answer | Status |
|---|---|---|
| השוק עדיין לא קיים; המפרט מקדים את המוצרים | Small Core, דמו ראשון, ללא מפרט חדש ללא משתמשים | Core 0.2 done; device demo next |
| לאף גורם בעל כוח אין סיבה לאמץ | הובילו עם הרווח של כל מאמץ; שימושי ללא רובוטים | Food-bank pilot and device partner sought |
| הסימולטורים מוכיחים את מה שהם assumed | baseline הוגן, טווחים, תוויות "illustrative"; פיילוטים מחליפים אותם | Open |
| רעב קשור לעוני וסכסוכים, לא ל-surplus | Cookwala תורמת; היא לא טוענת שהיא תסיים את הרעב לבדה | Message changed |
| בטיחות, אחריות ושטח תקיפה | מגבלות נאכפות על המכשיר; refusal; recalls; דיווחי אירועים | Spec done; certifier review open |
| פרטיות (נתוני בריאות ודת, ledgers מול מחיקה) | Local-first, גילוי סלקטיבי, לוגים של hash-only, הסכמה | Spec done; impact assessment open |
| מורכב מדי | Core 0.2; כל השאר מסומן כניסיוני | Done |
| תלות במייסד | נתיב ממשל (governance) לבית ניטרלי | GOVERNANCE.md |

## האם התכנון הטכני תקין?

| דאגה | מה השתנה ב-Core 0.2 |
|---|---|
| לפעולות לא היה משמעות פיזיקלית | Envelopes, רמות חום, sensor ladders, חוק גובה, וקטורי בדיקה |
| באגים ביחידות ובמספרים | °C בלבד, טולרנסים מוחלטים, יחידות מטבח, צפיפויות, כסף עשרוני |
| סכמות קיבלו שגיאות כתיב | סכמות קשיחות עם הרחבות `x-`; חבילה לא מקוונת |
| מסמך Mission אחד הנתון לשינוי | יומן אירועים + הקרנה, רצף יחיד, טבלת מעברים |
| הספרכה הוכיחה מעט מאוד | רשומות מפתח עם ביטול, נקודות בקרה עם עדות, זיהוי כתיבה מחדש |
| מסירה לא מוגדרת של אירועים; בטיחות על ה-bus | מספרי רצף, מחלקות שיהוי, דופק, "safety is local" |
| סטיות במשטחי API | Core OpenAPI; כל הפניות נבדקות ב-CI |
| אין מאמת | ספריית ייחוס ו-106 וקטורי conformance |

## ביקורות שאנו מבקשים

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), מדעני מזון
(envelopes), מפקחי בטיחות מזון ודיאטנים (rule packs), ביקורת אבטחה,
סקירת הגנת נתונים, וניתוח פערים של מתקף (certifier's gap analysis). ראו את
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

