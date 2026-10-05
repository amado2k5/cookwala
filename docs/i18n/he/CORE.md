<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. זהו החלק הנורמטיבי של Cookwala. MUST, SHOULD ו-MAY
עוקבים אחר RFC 2119. כל מה שלא רשום כאן הוא **profile** אופציונלי (סעיף 10).

מכשיר צריך להיות מסוגל ליישם את Core תוך כשבוע. Core אומר **מה להכין, מתי זה מוכן ומה לעולם לא חייב לקרות**. הוא אינו אומר כיצד רובוט נע.

## 1. מחלקות conformance

| מחלקה | חייב לממש |
|---|---|
| **Recipe publisher** | מסמכי `recipe.schema.json` תקפים; טמפרטורות בתוך operation envelopes; hash וחתימה |
| **Executor** (רובוט, מכשיר או hub) | ה-Core API (`api/core.openapi.yaml`); operation envelopes ו-sensor ladders; מגבלות בטיחות מקומיות; refusal במקום ניחוש; ה-execution log |
| **Catalog** | מתכונים חתומים, `/.well-known/cookwala.json` עם רשומות מפתח, ה-recall feed, קליטת אירועים |
| **Agent** (AI או תוכנה הפועלת עבור אדם) | פועל רק תחת `AgentMandate`; מתייחס לטקסט המסמך כנתונים; שואל את בעל הנשכרים לפני כל דבר ב-`confirmBefore` |
| **Verifier** | hashes, חתימות, תוקף וביטול מפתח, גילויים, שרשראות אירועים ונקודות בקרה |

טענה למחלקה פירושה מעבר של וקטורי ה-conformance שלה (`conformance/`, הרצה עם
`tools/run_conformance.py`).

## 2. מסמכי ליבה

| מסמך | סכימה |
|---|---|
| מתכון | `recipe.schema.json` |
| יכולות מכשיר | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| טיפוסים משותפים (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| אירועים | `event.schema.json` (CloudEvents) |
| אוצר מילים: פעולות, יחידות ורמות חום, תקריות | `vocab/*.json` |

כל הסכמות הן **strict**: שדות לא ידועים נדחים, למעט הרחבות `x-<vendor>-…`.
קוראים מתעלמים משדות `x-` שהם לא מבינים. `tools/bundle_schemas.py` מייצר bundle יחיד כך שמכשירים יבצעו ולידציה offline. מימושים MUST NOT למשוך סכמות בזמן ריצה.

## 3. מה המשמעות של פעולות

- **Envelopes.** לכל פעולה מבוססת חום או מסוכנת ב-`vocab/ops.json` יש `envelope`.
  הוא מפרט:
  - את המדיום (מים, שמן, אוויר, משטח מחבת, מוצר…);
  - את טווח הטמפרטורה שלו ב-°C (ולחץ, עבור בישול בלחץ);
  - ערבוב, מכסה, רמת תשומת לב והאם ניתן להריץ את השלב ללא השגחה;
  - סכנות;
  - שיטת בדיקה.

`cw.op.simmer` = נוזל מבוסס מים ב-85–96 °C; `cw.op.deep_fry` = שמן ב-160–190 °C.
- **יעדים בתוך envelopes.** יעד מתכון (`params.tempC` או `target` על ה-sensor של המצע) חייב להיות בתוך ה-envelope. ה-validator דוחה מתכונים שמפרים זאת.
- **ה-Executors שומרים על המצע בתוך ה-envelope.** אם המתכון נותן יעד צר יותר, הם שומרים עליו גם בתוך זה, ברגע שהוא הושג לראשונה.
- **גובה.** רצועות מים ואדים זזות ב-−1 °C לכל 300 m של גובה המטבח.
- **רמות חום** (`very_low` … `max`) הן בעלות משמעות משותפת אחת: רצועת שטח-מחבת ב-°C, המוגדרת ב-`vocab/units.json`.
- **Sensor ladder.** כל envelope מפרט דרכים לאימות השלב, במיטבם תחילה: sensor ספציפי, לאחר מכן `model` (אומדן מתועד), לאחר מכן `time`, ולאחר מכן `human`.
  - ה-executor משתמש במדרגה הראשונה שהוא יכול לספק ומתעד אותה ב-`verifiedBy`.
  - אם הוא אינו יכול לספק **אף** מדרגה, הוא חייב לסרב לשלב (`missing_sensor_no_fallback`).
  - פעולות שדורשות תשומת לב קבועה ואינן יכולות להתבצע ללא השגחה (טיגון קל, צריבה, טיגון, צמצום, קרמליזציה…) לעולם אינן חוזרות ל-time לבדו: המדרגה האחרונה שלהן היא אדם צופה.
  - ל-Deep frying אין fallback: היעדר sensor לטמפרטורת שמן פירושו אין deep frying.
  - `Condition` יכול לצמצם זאת באמצעות `onSensorMissing`.
- **סירוב, לא ניחוש.** executor שאינו יכול לעמוד ב-envelope, ב-ladder, בציוד או במגבלות הבטיחות של שלב, חייב לענות `refused` עם סיבה לפני ההתחלה.

## 4. מספרים ויחידות

- **הטמפרטורות הן °C בחוט.** התצוגות עשויות להמיר.
- **סטיות מותרות (Tolerances).**
  - `tolerance` הוא יחסי ומותר רק ביחידות בסולם יחס (ratio-scale).
  - `toleranceAbs` הוא מוחלט ביחידת הערך, והוא הסטייה היחידה המותרת ב-°C.
  - `Target.tolerance` הוא מוחלט.
- **ליחידות מטבח יש ערכים מטריים מדויקים:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **נפח ↔ מסה דורשים צפיפות** (`Quantity.densityGPerMl`, או אוצר המילים של הרכיבים);
  ללא צפיפות זו מדובר בשגיאה, לעולם לא בניחוש.
- **כסף הוא מחרוזת עשרונית** (`"12.70"`) עם מטבע ISO 4217, לעולם לא float.

## 5. שלמות ואמון

- **Hash.** `sha256:` בתוספת ה-hex digest של ה-RFC 8785 canonical JSON של המסמך,
  ללא שדות ה-`hash` וה-`signature` שלו. ה-reference canonicalizer משחזר את דוגמת ה-RFC
  8785 בדיוק.
- **Signature.** Ed25519 (`EdDSA`) על מחרוזת ה-ASCII hash. `ES256` מותר עבור מפתחות
  חומרה מסוג P-256. `kid` מציין `KeyRecord`.
- **Keys.** `KeyRecord` מספק את המפתח הציבורי, את הבעלים שלו, חלון תוקף ו-`revokedAt`.
  חתימה ש-`signedAt` שלה חל לאחר הביטול, או מחוץ לחלון התוקף, היא
  לא תקפה.
  - קטלוגים מפרסמים את המפתחות שלהם ב-`/.well-known/cookwala.json`.
  - ארגונים ואנשים מפרסמים את שלהם במסמכי did:web.
  - מכשירים מפרסמים את שלהם במסמך ה-capabilities שלהם.
  - Verifiers שומרים ב-cache את רשומות המפתחות לשימוש offline.
- **Selective disclosure.** מסמך חתום עשוי להכיל `Disclosure` digest,
  `sha256(JCS([salt, value]))`, במקום ערך רגיש. המחזיק חושף את ה-salt וה-value רק לצדדים המורשים לראות אותם, והחתימה עדיין מאומתת.
- **Event logs** (Mission profile):
  - sequencer אחד לכל log מקצה `seq` ו-`prev`, כך שהשרשרת לעולם לא מתפצלת (forks).
  - Checkpoints נחתמים על ידי ה-sequencer ונחתמים בחתימה נוספת על ידי עדים, שעשויים לכלול
    שירות transparency כגון IETF SCITT. כתיבה מחדש לאחר checkpoint שנחזה היא
    ניתנת לזיהוי.
  - במצב `hash_only`, ה-payloads נמצאים באחסון הניתן למחיקה וה-log שומר רק את ה-hashes שלהם.

## 6. כללי בטיחות וסוכן (נורמטיביים)

1. **בטיחות היא מקומית.** מנהלים (Executors) אוכפים חבילת `SafetyLimits` על המכשיר.
   - אף מתכון, סוכן (agent), הודעה מרחוק, הרחבה או מצב פעולה אינם יכולים להעלות או לבטל מגבלה.
   - מגבלה מחמירה יותר תמיד מנצחת.
   - `profiles/core/safety-limits.default.json` הוא נקודת התחלה של טיוטה שמייצרי מכשירים
     מחמירים מתוך מקרה הבטיחות (safety case) שלהם.
2. **עצירה מקומית.** בקרת עצירה על המכשיר עוצרת תנועה תוך 0.5 s וקוטעת חום תוך
   1 s, עם או בלי רשת. `POST …/stop` לעולם אינו נדחה בשל הרשאה ברגע שהקורא
   יכול להגיע למנהל.
3. **דיווח אירועים; הם לעולם אינם מגינים.** אירועי `cookwalalatency: local_safety` מדווחים על מה ש
   מכשיר כבר עשה. אף פונקציית בטיחות אינה יכולה להיות תלויה בהגעת אירוע.
4. **טקסט לא מהימן.** כל שדה טקסט חופשי (מסומן `x-cookwala-untrusted`) הוא נתונים ולעולם אינו
   הוראה, הן עבור תוכנה והן עבור סוכני AI כאחד. ניסיונות להורות באמצעות טקסט
   מתעלמים ומתועדים (`cw.incident.untrusted_instruction`).
5. **סוכנים פועלים תחת mandate.** בקשה שנשלחת על ידי סוכן נושאת `AgentMandate` חתום
   על ידי העיקרי (principal): היקפים, תקרות הוצאות, ספקים מורשים, תוקף, ופעולות שדורשות
   אישור.
   - `irreversible` ו-`safety_override` תמיד דורשים אישור, לא משנה מה ה-mandate אומר.
   - מנהלים דוחים בקשות מחוץ ל-mandate (`mandate_scope`).
6. **פעולות ללא השגחה זקוקות לאדם.** פעולות שה-envelope שלהן אומר `unattended: false`
   זקוקות לאדם אחראי נוכח, או שניתן להשיגו תוך דקה אחת.
7. **חסימות אלרגנים דוחות.** כל אלרגן חסום במתכון או במלאי דוחה את
   הבקשה; אין תחליפים לעקיפת חסימה.
8. **Recalls.** קטלוגים מפרסמים recalls חתומים ב-`GET /v1/recalls`. מנהלים מבצעים polling כשהם מחוברים
   ומדחיים גרסאות שנקראו בחזרה (recalled). `block_and_stop_running` גם עוצר הרצות (executions) פעילות בבטיחות.
9. **דיווח אירועים** הם אנונימיים (`IncidentReport`: תאריך בלבד, ללא שמות או ids)
   ונשלחים לקטלוגים כדי שכל יצרן ילמד מכל כמעט-תאונה (near miss).

## 7. מחזור חיי ביצוע ו-API

- **API:** `api/core.openapi.yaml`. ה-endpoints שלו הם:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - צד קטלוג: `GET /v1/recalls`, `POST /v1/incidents`.
- **מצבים (States):**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` ו-`stopping` → `stopped` במהלך הדרך;
  - `refused` ו-`failed` הם סופיים.
  - טבלת המעברים המלאה נמצאת ב-`core.schema.json#/$defs/ExecutionState` וב-
    conformance vectors.
- **חוקי בקשה (Request rules):**
  - כל POST נושא `Idempotency-Key`.
  - שינויים ל-execution קיים נושאים `If-Match: <seq>`; חוסר התאמה מחזיר 412.
  - Stop אינו דורש If-Match.
- **אירועים (Events):**
  - מסירה היא לפחות פעם אחת (at least once).
  - ה-`id` של CloudEvents הוא מפתח ה-deduplication.
  - `cookwalaseq` מסדר אירועים לפי נושא ותואם ל-`seq` של הסטטוס.
  - מכשירים משדרים `cookwala.device.heartbeat`, כך ש-hub יכול לזהות מכשיר שאבד ולהעביר שליטה.

## 8. פרטיות

- **execution logs אינם מכילים נתונים אישיים** (`privacy.personalData: "none"`).
- **הם עוזבים את המכשיר רק עם הסכמה מפורשת** (`consent.dataset`: `none` כברירת מחדל,
  `research_only`, או `open`). ניתן לבטל את ההסכמה.
- **open datasets מעגלים את הזמנים ליום.**
- **נתונים משפחתיים, בריאותיים ודתיים נשארים בבית** אלא אם האדם בוחר אחרת.
  כאשר הם חייבים לעבור, הם עוברים כ-selective disclosures.
- **The Humanitarian Profile** אינו מכיל נתונים אישיים כלל.

## 9. גרסאות והרחבות

- **גרסאות Core הן `0.2.x`.**
  - קוראים מקבלים כל patch של גרסת ה-minor שלהם.
  - הם דוחים minors אחרים עם `unsupported_version`.
  - הם מתעלמים משדות `x-` לא ידועים.
- **פעולות, יחידות, חיישנים וסוגי אירועים חדשים** מתווספים למילונים (vocabularies) ללא שינוי גרסה.
- **שינוי המשמעות של פעולה הוא id חדש;** הישן מסומן כ-`deprecated` עם `replacedBy`.
- **פרופילים** מתעדכנים בגרסה עצמאית ומצהירים על גרסת ה-Core שהם צריכים.

## 10. פרופילים והסטטוס שלהם

| פרופיל | סטטוס | הערות |
|---|---|---|
| Core (מסמך זה) | **draft, normative** | יעד עבור מימושי המכשיר הראשונים |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | ללא נתונים אישיים; עובד באמצעות SMS ו-CSV; surplus to plate, סיכומי השפעה, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | עובדות household מקומיות; רק derived constraints עוברים (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | namespaces מוכחים, גרסאות מדויקות, tombstones; ארגונים לפי בקשה (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | דוחות חתומים מאחורי כל טענת conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds ו-relays; אימות מול המנפיק (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | מסעדות, קהילה, בית ספר, אסון ומטבחי רובוטים (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | אותות ביקוש והיצע מרוכזים, מושהים, ברמת class; כפוף לסקירת דיני תחרות (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, מעברים ב-`profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | דורש סקירת דיני תחרות לפני שימוש בייצור |
| Relief planning (`relief.schema.json`) | experimental | זרימה תפעולית הועברה ל-Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | ה-OpenAPI Core API הוא ה-reference surface |

פרופיל הופך ליציב כאשר שתי מימושים עצמאיים עוברים את וקטורי ה-conformance שלו
ויש לו משתמשים אמיתיים.

## 11. כלים

| כלי | מה הוא עושה |
|---|---|
| `tools/validate_specs.py` | בודק סכמות, דוגמאות, סמנטיקה של מתכונים (envelopes, פרמטרים של op, ללא מקומות שמורים של תבנית), קשיחות, ושזה שסימוכין API נפתרים |
| `tools/run_conformance.py` | מריץ את `conformance/*.json` ואת `conformance/profiles/*.json`, וכותב ConformanceReport עם `--report`: hashing (כולל דוגמת RFC 8785), חתימות (כולל מפתח RFC 8032), ביטול (revocation), חשיפה (disclosure), שרשראות אירועים ונקודות בקרה (checkpoints), יחידות, envelopes, sensor ladders, מכונות מצב (state machines) |
| `tools/cookwala_ref.py` | ספריית ייחוס ו-CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | מייצר מחדש את הווקטורים (עבור על ה-diff) |
| `tools/bundle_schemas.py` | חבילת סכמות לא מקוונת (offline) |
| `tools/humanitarian_check.py` | בודק rule-pack של Humanitarian Profile וסיכומי השפעה |
| `tools/make_profile_vectors.py` | מייצר מחדש את וקטורי הפרופיל ב-`conformance/profiles/` |

## 12. שינויים מ-0.1

| אזור | 0.1 | 0.2 |
|---|---|---|
| Schemas | שדות לא ידועים מאושרים | קשיח, עם הרחבות `x-` |
| טמפרטורות | °C או °F, סובלנות יחסית מותרת | °C בלבד; סובלנות מוחלטת |
| כסף | מספר | מחרוזת עשרונית |
| פעולות | הגדרות פרוזה | envelopes פיזיים, sensor ladders, רמות חום, וקטורי בדיקה |
| חתימות | EdDSA קבוע, מפתחות ללא מחזור חיים | EdDSA או ES256, KeyRecords עם תוקף וביטול |
| משימות | מסמך משתנה אחד, ledger בפנים | יומן אירועים + projection, sequencer יחיד, נקודות בקרה עם עדות, מצב hash-only בלבד |
| סוכנים | Mandate בתוך Missions בלבד | `AgentMandate` ב-common; נדרש עבור בקשות סוכן |
| בטיחות | מוצהר במתכונים | נאכף גם מקומית באמצעות SafetyLimits; recalls; דיווחי אירועים |
| נתונים | ללא מודל dataset | ExecutionLog בהסכמה, ללא נתונים אישיים |
| conformance | אימות Schema בלבד | 106 וקטורים (44 Core, 62 profile) בתוספת מימוש ייחוס |

כדי להעביר מסמך 0.1: המר °F ל-°C; החלף טולרנסים יחסיים בטמפרטורות ב-`toleranceAbs`; הפוך סכומי כסף למחרוזות עשרוניות; הסר או שנה שם של שדות לא ידועים לשדות `x-`.

