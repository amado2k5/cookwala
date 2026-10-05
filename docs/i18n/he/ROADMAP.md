<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# מפת דרכים: now, next, later

**Status:** 2026-10-04. כל פריט נושא סטטוס: **done**, **in progress**, **planned**,
**not yet funded**. שערים (Gates) מגיעים מסעיף 4 של `ACTION-PLAN.md`. דבר לא עובר מ-planned
ל-done ללא הראיה (evidence) שצוינה.

## עכשיו (גרסה זו)

| פריט | סטטוס |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| תשע מתכונים לדוגמה באנגלית ובערבית | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| ארבעה סימולטורים עם הפרוטוקול מופעל וכבוי | done (illustrative) |
| אתר אינטרנט באנגלית ובערבית עם דף לכל מחזיק עניין, whitepaper ו-deck | in progress |

## Next (בתוך כשנה, ככל שהמשאבים יאפשרו)

| פריט | סטטוס | שער |
|---|---|---|
| סקירת מדען מזון של ה-operation envelopes | planned | המבקר מסכים |
| סקירות תזונאי וקצין בטיחות מזון של ארבעת ה-rule packs | planned | הסקירות הוגשו; החבילות עוברות ל-reviewed |
| הערכת השפעה על הגנת מידע של פרופיל ה-household context | planned | המבקר מסכים |
| פיילוט food bank (12 שבועות, רשום מראש, מעריך עצמאי) | not yet funded | שותף ומימון (`humanitarian/CONCEPT-NOTE.md`) |
| תוצאות benchmark בטיחות סוכן עבור מספר משפחות מודלים | planned | הרצות מפורסמות עם שיטה |
| wheel של `pip install cookwala` ו-`@cookwala/sdk` ב-npm | planned | אריזה המאחדת אוצר מילים וסכמות |
| שירות Registry (`validate`, `publish`, tombstones) | planned | עובד והוכחת namespace |
| יצרן מכשירים ראשון המטמיע את ה-Core API מול ה-hub הייחוס | planned | יצרן אחד מסכים; דוח conformance מפורסם |
| המרה של אוספי fifi.cooking הראשונים | planned | המייסד מחליט על זכויות לכל אוסף |
| Core 0.3 מתוך משוב מכשירים | planned | משוב של שני מטמיעים |
| ועדת היגוי | planned | שלושה מאמצים עצמאיים או שתי הטמעות |

## Later

| פריט | סטטוס |
|---|---|
| מכשיר אמיתי מבשל מתכון Cookwala, ללא עריכה, בווידאו | טרם מוממן; דורש שותף מכשירים |
| תוכנית certification עם מתקדם (certifier) עצמאי | מתוכנן; לא נשכר מתקדם |
| תשתית ניטרלית עבור המפרט, סימן המסחר והסימן | מתוכנן |
| רשת תורמים: הקלטות בהסכמה של מתכונים אמיתיים עם קרדיט | מתוכנן |
| אותות ביקוש והיצע שפורסמו על ידי תוכניות וקואופרטיבים | מתוכנן, לאחר בדיקת דיני תחרות |
| מדד "בישול בסימולציה" (Isaac Lab, Gazebo או MuJoCo) | מתוכנן |
| הכרה בנכס ציבורי דיגיטלי (Digital Public Good) עבור ה-Humanitarian Profile | מתוכנן, לאחר ראיות pilot |
| זרמי סיוע חוצי-אזורים בסימולטור העולמי; השפעות בישול נקי | מתוכנן |

## מה לא נעשה

לאסוף נתונים אישיים; לפרסם מספרים ללא שיטה; לציין שותף לפני שהוא מסכים;
לטעון ל-certification שאינו קיים; להציב נתוני household על כל ledger; לבנות orchestrator מרכזי שמטבחים תלויים בו; לטעון לסיום הרעב.

## חוקי Kill and pivot

מהתוכנית לפעולה: אם שני סבבי סקירה חיצוניים אינם מצליחים להניב יצרן מכשירים או שותף פיילוט, Cookwala מצטמצמת ל-Humanitarian Profile ולפורמט המתכון. אם פיילוט מראה רווח של פחות מ-5 %, התוצאות מפורסמות והפרופיל מעוצב מחדש לפני כל scaling.

