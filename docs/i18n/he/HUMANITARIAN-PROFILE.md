<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Humanitarian Profile (draft 0.2)

**Status:** טיוטה לבדיקה על ידי food banks, תוכניות סיוע ואנשי מקצוע בתחומי בטיחות מזון ותזונה. היא אינה נבדקת או מאושרת על ידי WFP, WHO, FAO, ה-Global FoodBanking Network או כל ארגון אחר המוזכר כאן.

**קבצים:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (הכל), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; כל הטיוטות ממתינות לסקירה מקצועית, ראו [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank בקהיר, ארוחות בית ספר, מטבח אסון, מטבח רובוטי), כל אחד עם `ImpactSummary` מחושב
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. מה 0.2 מוסיף (RFC-0003, RFC-0004)

תוספת מעל 0.1; הקוראים מקבלים את שניהם.

- **מהחווה לצלחת:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) ו-`Item.harvestedAt`; תפקידים `farm`, `caterer`, `robot_kitchen`; מילת ה-SMS `FARM`.
- **חוקי טיפול:** `Item.foodClasses` ו-`Distribution.menu.foodClasses` (ביצה נאה, מוצרי חלב לא מפוסטרים, אגוזים שלמים, אורז מבושל...), סוג חוק `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; שלושה rule pack חדשים בטיוטה.
- **סקירות:** `RulePack.reviews` מתעד את המקצוע, הארגון, התאריך, ההיקף והתוצאה של כל סקירה; `status: reviewed` דורש סקירה מאושרת.
- **השפעה:** `ImpactSummary` עם תשעה מדדים, כל אחד נושא `method` (measured, modelled, assumed, not recorded), מחושב על ידי `tools/humanitarian_check.py --summary`.
- **זמן לתביעה:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` כדי שקילוגרמים שהצילו ייספרו פעם אחת.
- **סוגי תוכנית** ב-`Manifest`.

## 1. מטרה

חלק קטן, קפדני, ללא נתונים אישיים של Cookwala עבור ארגונים המאכילים אנשים:
food banks, מטבחים קהילתיים, תוכניות ארוחות בית ספריות, תוכניות סיוע, תורמים (מכולות מזון, מסעדות, חוות, קייטרינג), מובילים ומחסני קירור. הוא מכסה ארבע משימות:

1. **הצעת surplus food** ותביעתה, במהירות ובהגינות.
2. **תיעוד כל handover** של משמורת, עם בדיקת טמפרטורה (בדיקת cold-chain).
3. **דיווח על מה שהוגש** כספירות מצטברות בלבד.
4. **בדיקת תפריטים ו-handovers** מול חוקי תזונה ובטיחות מזון הניתנים לקריאה על ידי מכונה.

**זה עובד ללא רובוטים, אפליקציות או אינטרנט.** רמות H0 ו-H1 פועלות על גיליונות אלקטרוניים, SMS
וטלפונים בסיסיים. רובוטים, hubs וסוכנים הם צרכנים אופציונליים של אותם מסמכים.

## 2. עקרונות

- **אל תגרום נזק.** אל תאסוף דבר שעלול לזהות, לאתר או ליצור פרופיל לאדם או
  למשק בית. במסגרות שבירות, נתונים על מוטבים מהווים סיכון הגנתי.
- **עקרונות הומניטריים** (אנושיות, ניטרליות, חוסר פניות, עצמאות): ללא
  מיתוג מסחרי על סיוע, וללא שימוש בנתונים לצורכי שיווק.
- **קשיח וקטן.** כל אובייקט דוחה שדות לא ידועים (למעט הרחבות `x-`),
  כך ששגיאות כתיב ושדות אישיים נוספים נכשלים באימות.
- **יחידות מדויקות:** קילוגרמים, מעלות צלזיוס, טולרנסים מוחלטים, וכסף כמחרוזות עשרוניות.
- **חוקים מקומיים גוברים.** rule packs ניתנים להחלפה על ידי חוקי בטיחות מזון ותרומות לאומיים.
- **פתוח:** מפרט ללא תמלוגים, כלי קוד פתוח. הפרופיל תוכנן לעמוד ב-Digital Public Goods Standard וב-Principles for Digital Development.

## 3. רמות conformance

| רמה | מה משתתף עושה | צרכים |
|---|---|---|
| **H0 — Paper & SMS** | רושם הצעות, מסירות והפצות בתבניות ה-CSV (עם שורות HXL hashtag) או באמצעות SMS (סעיף 8.3) | גיליון אלקטרוני או טלפון בסיסי |
| **H1 — Rescue** | מחליף מסמכי `Offer`, `Claim`, `Handover` ו-`Distribution` דרך ה-API; עוקב אחר מכונת המצבים (סעיף 5) | כל HTTP client |
| **H2 — Safety & nutrition** | מחיל `RulePack` על כל מסירה ותפריט, ורושם `findings` | ה-reference checker או מקביל לו |
| **H3 — Interoperability** | מייצא אגרגטים ל-HXL, DHIS2 ול-`ImpactReport` הליבה של Cookwala; משתמש במזהי GS1 | עבודת אינטגרציה |

משתתף מפרסם `Manifest` ב-`/.well-known/cookwala-humanitarian.json`
המצהיר על הרמות שלו, rule packs, נקודות קצה ו-`personalData: "none"`.

## 4. מסמכים

| מסמך | מי כותב אותו | מטרה |
|---|---|---|
| `Offer` | תורם | Surplus food זמין לאיסוף: פריטים (kg, אחסון, סימוני תאריך, אלרגנים), חלון זמן, אתר, טמפרטורות |
| `Claim` | food bank, מטבח, תוכנית | תובע הכל או חלק מהצעה, עם זמן איסוף וסוג רכב |
| `Handover` | מקבל המשמורת | אחד לכל שלב: טמפרטורות, kg שהתקבלו או נדחו עם קוד סיבה, וממצאי rule pack |
| `Distribution` | מטבח, food bank, בית ספר | ריכוז ארוחות ואנשים שירתו באתר ביום מסוים; חיובי תזונה ועלויות בתפריט |
| `RulePack` | תוכנית או רשות | חוקי תזונה ובטיחות מזון עם גרסה (סעיף 6) |
| `Manifest` | כל משתתף | הצהרת יכולות והגנת נתונים |

מסמכי ה-Cookwala core (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` ב-`relief.schema.json`) נותרו זמינים לתכנון. פרופיל זה מטפל
בזרימה המבצעית.

## 5. מחזור חיי הצעה

| מ- | מצבי next מותרים |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (התביעה פגה), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | אף אחד (סופי) |

**כללים לשינויי מצב:**

- כל שינוי מגדיל את `version`. כותבים שולחים `If-Match: <version>`; חוסר התאמה מחזיר
  **409**, והכותב קורא מחדש ומנסה שוב.
- מעבר לא חוקי מחזיר **409** עם המעברים המותרים.
- הצעות עוברות ל-`expired` באופן אוטומטי ב-`window.to`.
- תביעות פוקעות ב-`pickupBy` בתוספת תקופת חסד שהתוכנית קובעת (ברירת מחדל 30 דקות).

**תביעה הוגנת.** כברירת מחדל, תביעות מתבצעות לפי סדר הגעתן בתוך שכבת עדיפות שהתוכנית קובעת:
למשל, מטבחים המשרתים ילדים תחילה, לאחר מכן מטבחים אחרים, ולאחר מכן food banks. שכבות וכל
חוקי רוטציה חייבים להיות מפורסמים ב-`Manifest` של התוכנית או באתר האינטרנט.

## 6. חבילות חוקי בטיחות מזון ותזונה

`RulePack` מכיל חוקים מששת הסוגים:

- `temperature`: chilled ≤ 5 °C, hot-held ≥ 60 °C, frozen ≤ −18 °C;
- `time`: cooked food out of temperature control for at most 2 h;
- `date_mark`: use-by blocks, best-before warns;
- `allergen`: undeclared allergens block;
- `nutrient`: amounts per person-day or per meal;
- `energy_share`: share of energy from free sugars, fat, saturated fat, trans fat or protein.

כל כלל הוא או `block` (אל תקבל או תגיש) או `warn` (מורשה, מתועד כממצא).

החבילה ברירת המחדל `who-codex-basic@0.1.0` היא **טיוטה הנגזרת מהנחיות ציבוריות**: ההנחיות של WHO בנושא תזונה בריאה, נתרן, סוכרים ושומנים, חמשת המפתחות של WHO למזון בטוח יותר, קודי Codex לסימון ומזון קפוא, ונתוני תכנון המנות המינימליות של Sphere. היא מפושטת, אינה מהווה ייעוץ רפואי, אינה כוללת הזנה של תינוקות והזנה טיפולית, ויש לתת אותה לבדיקה על ידי צוות מוסמך. תוכניות צריכות להעתיק ולהתאים אותה, להגדיר `jurisdiction`, ולתעד מי בדק אותה ב-`reviewedBy`.

מקבלים ברמה H2 מריצים את ה-pack בכל handover ובכל תפריט, ומתעדים rule ids ב-`findings`. בודק ההתאמה (reference checker) מדווח במקומות שבהם findings שהוצהרו ו-findings שחושבו אינם תואמים.

## 7. הגנת נתונים

**הפרופיל אינו נושא נתונים אישיים. מסמכים לא חייבים להכיל:**

- שמות, מספרי טלפון, כתובות אימייל, או מזהים לאומיים, של פליטים או מזהים ביומטריים של כל אדם;
- רישומים ברמת household context, או מיקומים של בתים או יחידים;
- בריאות, מוגבלות, דת או לאום של כל אדם.

**מה הוא נושא במקום זאת:**

- **ארגונים בלבד.** כל צד הוא ארגון המזוהה על ידי `did:web`, מספר מיקום גלובלי (GLN) של GS1
  או מזהה registry. אנשים מופיעים רק כתפקידים
  (`checkedBy: "trained_staff"`).
- **אגרגטים בלבד.** `Distribution.people` מכיל ספירות לפי קבוצה, וכל ספירה מתחת ל-10
  מדווחת כ-`"<10"`.
- **אתרים בלבד.** `Site` הוא שטח של ארגון או אזור מנהלי
  (OCHA P-codes), לעולם לא household.
- **הערות קצרות.** טקסט חופשי מוגבל להערות תפעוליות של 280 תווים ואינו חייב
  להכיל מידע אישי. מימושים צריכים לסרוק הערות עבור מספרי טלפון ומזהים
  לפני אחסונם.

**שימור וביקורת:**

- **Retention:** כל משתתף מצהיר על `retentionDays` ב-`Manifest` שלו ומוחק
  מסמכים לאחר מכן.
- **Audit (אופציונלי, `hash_only`):** מפענח (sequencer) אחד לכל תוכנית (בדרך כלל ה-food bank או
  מפעיל התוכנית) מצרף את ה-SHA-256 hash של ה-RFC 8785 canonical JSON של כל מסמך.
  התוכן נשמר בנפרד ונותר ניתן למחיקה. ארגון שותף
  חותם על נקודת בקרה (checkpoint) בכל יום, כך שלא ניתן לשכתב היסטוריה בשקט. מפענח (sequencer)
  יחיד מונע פיצולים (forks) בשרשרת.
- **Hosting** צריך להיות בתוך המדינה שבה החוק או התוכנית דורשים זאת.

## 8. Transport

### 8.1 API (רמה H1)

| שיטה | נתיב | הערות |
|---|---|---|
| `POST` | `/offers` | יוצר הצעה (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | פותח הצעות בקרבת מקבל |
| `POST` | `/offers/{id}/claims` | תובע הצעה; נדרש `If-Match`; 409 כאשר כבר תובע |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; נדרש `If-Match` |
| `POST` | `/handovers` | מתעד מסירה |
| `POST` | `/distributions` | מתעד הפצה |
| `GET` | `/reports?from=…&to=…` | מרכז נתונים לתקופה |

חוקי בקשה והובלה:

- **Idempotency:** כל `POST` נושא `Idempotency-Key`. השרתים שומרים מפתחות למשך 24 h לפחות ומחזירים את התגובה המקורית עבור חזרות.
- **Authentication:** OAuth 2.1 client credentials, לקוח אחד לכל ארגון.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  נמסרים לפחות פעם אחת, עם `id` של אירוע לצורך הסרת כפילויות ומספר רצף לכל הצעה לצורך סדר.

### 8.2 גיליונות אלקטרוניים (רמה H0)

השתמש בתבניות ה-CSV ב-`profiles/humanitarian/templates/`. השורה השנייה שלהן מכילה
[HXL](https://hxlstandard.org) hashtags, כך שכלים של נתונים הומניטריים יכולים לקרוא אותם ישירות.

### 8.3 SMS (רמה H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

הדקדוק מיושם ב-`tools/cookwala_ref.py` (`parse_sms`) ונבדק על ידי
`conformance/profiles/sms.json`. מילות המפתח הן באנגלית; ספרות ערביות-אינדיות (٠-٩) ופרסיות (۰-۹)
מתקבלות בכל מקום שבו מופיעה ספרה, כך שטלפון המוגדר לאחד המקלדות יעבוד.

קודי אחסון: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. סימוני תאריך: `UB` use-by,
`BB` best-before, `HV` harvested, כ-`DDMM`. קודי סיבת דחייה: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; כל מילה אחרת נרשמת כ-`other`. תגובת ה-`HELP`
חייבת להיות דוגמה אחת לכל פקודה, ASCII פשוט, מתחת ל-160 תווים.

שער (gateway) חייב להחיל בדיקות אלו לפני שהוא כותב מסמך (`sms_storage_findings` ב-
reference; ה-ids הם block findings):

| ממצא | מתי |
|---|---|
| `safety.temp_not_recorded` | `HAND` על קו צונן, קפוא או חם (hot-held) אינו נושא קריאת `T`: השב בבקשה לקבלתה, אל תכתוב דבר |
| `safety.hot_hold_min` | `OFFER` עם אחסון `H` מתחת ל-60 °C: סרב לרשום אותו |
| `safety.storage_class_mismatch` | מילות הפריט מרמזות על מוצרי חלב, בשר, עוף, דגים, ביצה או מזון מבושל והאחסון הוא `A`: סרב לרשום אותו |
| `safety.chilled_max`, `safety.frozen_max` | קריאות מעל 5 °C או מעל −18 °C בהצעה (offer) או במסירה (handover) |

הצעות למזון חם נסגרות לאחר שעתיים (שעה אחת לאורז מבושל); gateway לעולם אינו שומר קריאת placeholder. ה-gateway ממפה את המספר הרשום של השולח לארגון, לעולם לא לאדם במסמכים.

## 9. Interoperability

| מערכת | מיפוי |
|---|---|
| HXL | תבניות CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (מוצרים); `Site.gln` ו-`OrgId` `gln:` (מיקומים) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | ערכי נתונים אגרגטיביים לכל site וperiod מתוך `Distribution` (meals, people by group, kg, incidents) |
| WFP SCOPE ומערכות מועדפים אחרות | **אגרגטים בלבד.** שום רשומות מועדפים אינן נכנסות או יוצאות מתוך פרופיל זה |
| Food-rescue apps | מתאמים (Adapters) ממפים את הרישומים שלהם ל-`Offer` ואת האיסופים שלהם ל-`Claim` ו-`Handover` |
| Core Cookwala | `Item.ingredientId` ו-`menu.recipes` מקשרים לאינדקס המתכונים; `relief.ImpactReport` מסכם `Distribution`s |

## 10. מדדי פיילוט (מוגדרים כך שניתן יהיה להשוות בין אתרים)

מחושב לתוך `ImpactSummary` על ידי `python tools/humanitarian_check.py --summary DIR`. כיצד מריצים ושופטים פיילוט: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| מדד | הגדרה |
|---|---|
| Kg rescued | סכום של `Handover.kgAccepted` בשלב הראשון מתורמים |
| Claim rate | הצעות שמגיעות למצב `claimed` ÷ הצעות שנוצרו |
| Time to claim | חציון דקות מבריאת `Offer` למצב `claimed` |
| Rejection by reason | סכום של `kgRejected` לפי `reason` |
| Meals served | סכום של `Distribution.meals` |
| Nutrition pass rate | הפצות עם תפריטים וללא ממצאי `nutrition.*` ÷ הפצות עם תפריטים |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | ספירה של ממצאי בלוק `safety.*`, ו-`safetyIncidents` |

## 11. אבטחה

- **חתימות הן אופציונליות ב-H1** ונדרשות עבור ביקורת חוצת-ארגונים ב-H3
  (EdDSA, מפתחות שפורסמו ב-`did:web` של הארגון).
- **הערות ושמות במסמכים הם נתונים שאינם מהימנים.** תוכנה וסוכני AI לעולם לא
  צריכים להתייחס אליהם כהוראות.
- **rule packs הם בעלי גרסה ונעוצים** (`id@version`) בכל ממצא, כך שהתוצאות הן
  reproducible.

## 12. הושמט במכוון

- רישום מוטבים, זכאות ומיקוד (אלו שייכים למערכות המוגנות של התוכנית עצמה).
- תשלומים: Cookwala לעולם אינו מעביר כסף.
- מתכונים והרצת רובוט (מפרט הליבה). הפרופיל רק מציין מתכונים ומדווח על רכיבי תזונה.
- תזונה רפואית וטיפולית.

## 13. איך לבצע סקירה

אנא פתחו issues ב-[amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
עם התווית `humanitarian`. סקירות אלו הן המועילות ביותר:

- צוות בטיחות מזון בודק את ה-rule pack ואת סיבות הדחייה;
- מפעילים של food-bank בודקים את מחזור החיים ואת זרימת ה-SMS;
- מטעמי הגנת מידע בודקים את סעיף 7.

