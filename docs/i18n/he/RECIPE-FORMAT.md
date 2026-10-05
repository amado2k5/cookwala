<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# פורמט מתכון Cookwala: מתכונים שעובדים עם Missions

מתכון ב-Cookwala אינו רשימת הוראות. זהו **ידע בישול נייד**
שמתכנן *מקבץ* אל מול Mission ספציפי (household, robots, appliances,
energy, budget, health, timing) לכדי תוכנית ניתנת להרצה. הרובוט מריץ אז את התוכנית,
תוך התאמה למצבי חירום ו-playbooks כאשר המציאות משתנה.

סכימה: [`recipe.schema.json`](../schemas/recipe.schema.json). דוגמה מלאה ועבודה:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. ארבע שכבות (מותאם מגישת ה-WHO SMART Guidelines)

| שכבה | מה היא מכילה | מי כותב אותה | איפה היא נמצאת |
|---|---|---|---|
| **R1 Narrative** | טקסט מתכון אנושי, סיפור, הערות תרבותיות, תמונות | טבחים, שפים, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | מה המנה *היא* ומה היא *חייבת להיות*: זהות (חיונית מול גמישה), יעדים תחושתיים, תזונה, סגנון הגשה ואכילה, אחסון, בדיקות קבלה | עורכי מתכונים, בסיוע AI, נבדק | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | שיטה אגנוסטית למכשיר: נוסחה (יחסים + תפקידים), גרף תהליך של ops מוגדרים עם תנאי pre/post של מצב המזון, תנאי `until`, חלופות, חוקי השהיה, מצבי כשל, affordances, סכנות, CCPs, הכנת סביבה | צינור ייצוא + סקירה; מאומת על ידי simulator (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | מתכון R3 שקומפל עבור Mission *זו*: כמויות מדויקות, וריאנטים נבחרים, שחקנים ומכשירים שהוקצו, לוח זמנים, חכירות, מוניטורים, תוכניות מגירה | המתכנן/קומפיילר, בזמן ריצה | בתוך ה-**Mission** (`plan`), לעולם לא בקטלוג |

כמו קוד מקור ומהדר: **המתכון הוא ייצוג ביניים נייד
(R3 + R2). המשימה היא מכונת היעד.** זה מה ששומר על מתכונים תקפים כאשר רובוטים
ומרכיבי AI משתנים: מתכנן טוב יותר מייצר R4 טוב יותר מאותו מתכון.

## 2. מה כל סעיף עושה ב-Mission

| סעיף מתכון | בשימוש על ידי ה-Mission עבור… |
|---|---|
| `identity.essential / flexible / neverAdd` | תחליפים, מצבי תקציב ורציונים, התאמות תזונתיות: שינוי החלקים ה-flexible, לעולם לא את ה-essentials, כדי שהמנה תישאר עצמה |
| `formula` (ratios, min/max, role, scaling) | scaling מדויק לכל מספר אנשים, חלוקת רציונים של מרכיבים לאורך שבוע, מתיחת תקציב, ניצול מה שיש בהישג יד (ה-rescale של המרכיב המגביל) |
| `sensory` | נקודות בדיקה של ראייה, ארומה וטעם; פרופילי טעם של household (מלח 2 לעומת 4); החלטות על שימוש חוזר ותיקון |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **משימות הכנת סביבה:** אם הכיור או הכיריים תפוסים, המתכנן מוסיף משימות "clear, wash, dry"; משימות השריה או הפשרה מתוזמנות שעות מראש |
| `process.nodes[]` עם מצבי מזון `pre`/`post` | תכנון (להתחיל רק מה שמוכן), אימות (האם השלב הוליד את המצב?), המשך לאחר הפרעות |
| `until`, `onTimeout`, `retry` | ידיעה מתי שלב מסוים הסתיים ומה לעשות כשאינו מסתיים |
| `alternatives[]` + `energy` | גז לעומת אינדוקציה לעומת תנור, חיסכון בסוללה, מטבחים ללא תנור, שעות שקט |
| `pause` (pausable, safeState, maxPause, onExceeded) | **הפרעות:** ילד זקוק לעזרה, הבעלים מתקשר, הכלב מפיל משהו. הרובוט מעביר את השלב למצב ה-safe state שלו, מטפל באירוע, ואז ממשיך, מחמם מחדש, מציל או משליך בהתאם ל-pause budget |
| `failureModes` (incident, detect, prevent, playbook) | זיהוי מוקדם של בעיות ידועות וה-playbook המדויק להתאוששות |
| `affordances`, `space` | התאמת שלבים לרובוטים שיכולים לאחוז, להרים ולהגיע; שמירה על אזורים חמים רחוק מילדים |
| `safety` (hazards, CCPs, supervision, abort) | ה-safety kernel: invariants שכל תוכנית חייבת לשמר |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | הגשה: מה מונח על השולחן, לחדר, בתוך ה-lunchbox; תזכורות ומגבלות המתנה; סגנון אכילה תרבותי |
| `storage` | שאריות, משימות cook-ahead ו-lunchbox |
| `acceptance` | ה-*tests* של המתכון: ה-Mission מסתיימת כאשר אלו נשמרים |
| `nutrition`, `cost` | מנות אישיות, תקציב, רציוני סיוע |

## 3. דוגמה: שלב אחד עם הכל מצורף

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. כתיבת מתכון למשימה (מה המתכנן עושה)

1. **בחר את הווריאנט:** תזונה, מרקם (IDDSI), ציוד, אנרגיה ובחירת מצב מתוך
   `alternatives`. חיוביות הזהות חייבת לשרוד.
2. **קנה מידה:** מתוך `formula` והמנות, מנות לאדם (HEALTH.md), המרכיב
   המגביל, או אופק מנה. תבלינים באופן סאב-ליניארי, זמן לפי מעריך מסה.
3. **החלף** בתוך תפקידים, תוך כיבוד `identity.neverAdd`, אלרגנים, חבילות תזונה
   ומלאי.
4. **הכן את הסביבה:** השווה את `prep` עם פאצטים של מרחב המשימה (כיור מלא?
   כיריים תפוסות? קרש מלוכלך?) והוסף משימות סידור, שטיפה, ייבוש והכנה. תזמן
   `advanceTasks` (השריה, הפשרה, מרינדה, חימום מראש).
5. **קשור:** הקצה כל צומת לרובוטים, מכשירים או בני אדם לפי אפורדנסים ויכולות.
   השכר גזייה, כלי קיבול ואזורים. צמד מוניטורים (סיר חכם, זמן הגעה משוער,
   גלאי עשן).
6. **תזמן** לאחור מזמן ההגשה, תוך כיבוד תקציבי הפסקה, מגבלות סוללה ואנרגיה,
   שעות שקט בבית וחלונות שיתוף מטבח.
7. **צרף תוכניות מגירה:** `failureModes` וכללי `pause` של כל צומת, בנוסף
   למדיניות הגלובלית של המשימה (הפרעות, ילד או חיית מחמד ליד הכיריים, שומר כיריים,
   מעקב קלקול).
8. **אמת:** בדיקות סכימה + סמנטיקה, חבילות מדיניות, כיסוי CCP, dry run של סימולטור,
   אינווריאנטים של ערימת עדיפויות (PROTOCOL §7.2).
9. **פלוט R4** לתוך ה-`plan` של המשימה, חתום עליו, ומסור אותו לרובוט.

## 5. כתיבה והמרה

- **מ- fifi.cooking:** צינור ה-EXPORT-FIFI מייצר R1 + R2 + R3. הסעיפים החדשים
  (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  נוצרים על ידי מודלים מקומיים מהטקסט הקיים ונבדקים על ידי validators וביקורת אנושית מדוגמת.
- **מהרשת:** `cookwala convert --from schema-org` ← R1/R2 (V0), ואז אותה
  העשרה.
- **לפורמטים אחרים:** schema.org Recipe (R1/R2 עבור מנועי חיפוש), Cooklang (עריכה
  אנושית), PDDL או temporal logic (מתכנני מחקר) כולם יכולים להיות מיוצרים מ-R3.
- **בידנית:** `cookwala init recipe` בונה את כל השכבות; `cookwala validate` ו-
  `cookwala simulate` בודקים אותן.
- **גרסאות:** עדכונים הם immutable ומוצפנים ב-hash. Forks מתעדים את `meta.derivedFrom`.
  **patches** של מתכון (מ-playbooks או משוב) מוצעים כ-diffs ומועלים רק
  לאחר סקירה וראיות.

## 6. שפת טקסט השלב

משפטי שלבים נכתבים תחילה עבור אדם ולאחר מכן מנותחים על ידי מכונה. טקסט השלב בערבית בדוגמאות המתכונים משתמש בציווי בנקבה (قطّعي، سخّني), שהיא המוסכמה המקובלת בספרי בישול מצריים; זוהי בחירה מכוונת, לא מחדל, ומוציא לאור עשוי להשתמש בסביל ניטרלי מבחינה מגדרית (تُقطَّع البصلة) במקום זאת. השדות `op`, `params` ו-`until` נושאים את המשמעות; המשפט מיועד לטבח.

## 7. מדוע זה נשאר ערוך לעתיד

- מתכונים מתארים **תוצאות מזון ואילוצים, לא תנועות**. רובוטים חדשים ו-AI חדש
  מייצרים תוכניות R4 טובות יותר מאותה R3.
- כל הסעיפים החדשים הם **אופציונליים ותוספתיים**. מתכון V0 (R1 בלבד) עדיין עובד עבור
  בישול אנושי מונחה; כל שכבה שנוספת פותחת יותר אוטומציה.
- שדות `x-` לא ידועים עוברים הלאה. ספקים, שפים וגופי בריאות יכולים להרחיב מתכונים
  מבלי לשבור דבר עבור אף אחד.
- **בדיקות קבלה** מאפשרות לכל מריץ, אנושי או רובוט, להוכיח שהמנה יצאה נכונה,
  שזו הדרך שבה מתכונים מטפסים ל-V3 עם ראיות מהשטח.

