<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# מטבחים וסבבי ייצור: מסעדות, קהילה, בית ספר, אסון ומטבחי רובוט

> **סטטוס: פרופיל ניסיוני** (RFC-0005). סכימה: `schemas/fleet.schema.json`.
> דוגמאות: `examples/fleet/`.

## 1. למה

המייסד ביקש את אותו פרוטוקול במסעדה, בחתונה, במבצע תרומות או במפעל מזון (RFC-0005). ה-brief מוסיף תוכניות ארוחות בית ספריות ומטבחי אסון. ה-Core מכסה מכשיר אחד המבשל מתכון אחד; ה-Humanitarian Profile מכסה העברת surplus וספירת ארוחות. ביניהם ניצבת ה-**kitchen**: תחנות, מכשירים, אנשים, מנות רבות (batches), חלון הגשה, נקודות בקרה קריטיות, והקישור מ-execution log של מכשיר לארוחות שתוכנית מדווחת עליהן.

## 2. מסמכים

| מסמך | מה הוא אומר |
|---|---|
| `Kitchen` | מטבח של ארגון: סוג, תחנות (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), מכשירים כרפרנס ליכולות, קיבולת במנות לשעה, ציוד hot-hold ו-cooling, rule packs בתוקף, **ספירת** צוות לפי תפקיד, שעות פעילות |
| `ProductionRun` | מתכונים עם ספירות batch ומנות, חלון הגשה, הקצאות לכל שלב במתכון לתחנה ול-`device`, ל-`person` או ל-`either`, רישומי נקודות בקרה קריטיות (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), ה-Core executions שיוצרו, ותוצאה (מנות שיוצרו והוגשו, waste, rescued food שנעשה בו שימוש, failures, incidents, energy, cost, ה-Humanitarian `Distribution` שהיא פלטה) |
| `StationLease` | שימוש בלעדי בתחנה על ידי device או תפקיד לזמן מסוים |

## 3. כיצד זה מתחבר לשאר

- שלב המוקצה ל-`device` הוא Core `ExecuteRequest` (או יעד `ExecuteNode` דרך ה-ROS 2 binding); ה-hash של ה-`ExecutionLog` שלו נכנס ל-`executions`.
- ריצה המשרתת תוכנית מפיקה Humanitarian `Distribution`; ה-`ccps` של הריצה הם ה-evidence שמאחורי ממצאי הבטיחות של ה-distribution.
- rule packs מה-Humanitarian Profile חלים על התפריט והפריטים של הריצה.
- Fleet dispatch (איזה רובוט הולך לאן) שייך ל-Open-RMF או ל-fleet manager של ספק, לא לפרופיל זה.

## 4. דוגמה מחושבת

`examples/fleet/kitchen-disaster.json` ו-`production-run-disaster.json`: מטבח סיוע
עם שני קומקומים גז, יחידות שמירה בחום (hot-hold units) ואמבט קרח מייצר 710 מנות של מרק עדשים ו-
אורז לחלון זמן של שעתיים, מתעד טמפרטורות בישול ושמירה בחום, מוצא יחידת שמירה בחום אחת
מתחת ל-60 °C ומחמם מחדש את המנה הזו לפני ההגשה, ומשחרר הפצה (distribution). הדוגמה היא
איור בלבד; לא מתוארת מטבח או אירוע אמיתיים.

## 5. מה הושמט במכוון

שמות עובדים ולוחות זמנים, שכר, הזמנות ותשלומים של לקוחות, תמחור תפריט. עובדים מופיעים
כמספרים לפי תפקיד כך שניתן לחשב עלות לכל ארוחה מבלי לזהות איש.

## 6. Next

דוגמה לשירות במסעדה עם תחנת רובוט; חבילת conformance עבור מכונת מצבי ה-run; איחוד של `StationLease` עם חוזי session (`session.schema.json`).

