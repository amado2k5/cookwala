<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. این بخش هنجاری Cookwala است. MUST، SHOULD و MAY از RFC 2119 پیروی می‌کنند. هر چیزی که در اینجا فهرست نشده است، یک **profile** اختیاری است (بخش 10).

یک دستگاه باید بتواند Core را در حدود یک هفته پیاده‌سازی کند. Core می‌گوید **چه چیزی ساخته شود، چه زمانی تمام می‌شود و چه چیزی هرگز نباید اتفاق بیفتد**. Core نمی‌گوید یک ربات چگونه حرکت می‌کند.

## ۱. کلاس‌های conformance

| کلاس | باید پیاده‌سازی کند |
|---|---|
| **Recipe publisher** | اسناد معتبر `recipe.schema.json`؛ دماها در محدوده operation envelopes؛ یک hash و یک signature |
| **Executor** (ربات، لوازم خانگی یا hub) | Core API (`api/core.openapi.yaml`)؛ operation envelopes و sensor ladders؛ محدودیت‌های ایمنی محلی؛ refusal به جای حدس زدن؛ execution log |
| **Catalog** | دستورهای پخت امضا شده، `/.well-known/cookwala.json` با رکوردهای کلیدی، فید recall، دریافت حادثه |
| **Agent** (هوش مصنوعی یا نرم‌افزاری که به نمایندگی از یک شخص عمل می‌کند) | تنها تحت یک `AgentMandate` عمل می‌کند؛ متن سند را به عنوان داده در نظر می‌گیرد؛ قبل از هر چیزی در `confirmBefore` از اصیل درخواست می‌کند |
| **Verifier** | Hashها، signatureها، اعتبار و ابطال کلید، افشاگری‌ها، زنجیره‌های رویداد و checkpointها |

ادعای یک کلاس به معنای عبور از بردارهای conformance آن است (`conformance/` ، اجرا با `tools/run_conformance.py`).

## 2. اسناد اصلی

| سند | Schema |
|---|---|
| دستور پخت | `recipe.schema.json` |
| قابلیت‌های دستگاه | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| انواع مشترک (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| رویدادها | `event.schema.json` (CloudEvents) |
| واژگان: عملیات‌ها، واحدها و سطوح حرارت، حوادث | `vocab/*.json` |

تمام طرحواره‌ها **strict** هستند: فیلدهای ناشناخته رد می‌شوند، به استثنای افزونه‌های `x-<vendor>-…`.
خواننده‌ها فیلدهای `x-` را که درک نمی‌کنند نادیده می‌گیرند. `tools/bundle_schemas.py` یک باندل واحد تولید می‌کند تا دستگاه‌ها به صورت آفلاین اعتبارسنجی کنند. پیاده‌سازی‌ها نباید طرحواره‌ها را در زمان اجرا fetch کنند.

## 3. عملیات به چه معناست

- **Envelopes.** هر عملیات مبتنی بر حرارت یا خطرناک در `vocab/ops.json` دارای یک `envelope` است.
  آن مشخص می‌کند:
  - محیط (آب، روغن، هوا، سطح تابه، محصول...)؛
  - محدوده دمایی آن بر حسب °C (و فشار، برای پخت تحت فشار)؛
  - هم‌زدن، درب، سطح توجه و اینکه آیا مرحله می‌تواند بدون نظارت اجرا شود یا خیر؛
  - خطرات؛
  - یک روش تست.

`cw.op.simmer` = مایع بر پایه آب در ۸۵–۹۶ °C؛ `cw.op.deep_fry` = روغن در ۱۶۰–۱۹۰ °C.
- **اهداف داخل envelopeها.** یک هدف دستور پخت (`params.tempC` یا یک `target` روی sensor محیط) باید داخل envelope قرار داشته باشد. validator دستور پخت‌هایی را که این مورد را نقض کنند، رد می‌کند.
- **اجراکنندگان (Executors) محیط را داخل envelope نگه می‌دارند.** اگر دستور پخت هدف محدودتری ارائه دهد، آن‌ها پس از رسیدن به آن هدف برای اولین بار، محیط را داخل آن نیز نگه می‌دارند.
- **ارتفاع.** باندهای آب و بخار به ازای هر ۳۰۰ متر از ارتفاع آشپزخانه، ۱- °C تغییر می‌کنند.
- **سطوح حرارت** (`very_low` … `max`) یک معنای مشترک دارند: یک باند سطح تابه بر حسب °C، که در `vocab/units.json` تعریف شده است.
- **sensor ladder.** هر envelope روش‌های تأیید مرحله را فهرست می‌کند، در بهترین حالت ابتدا: یک sensor خاص، سپس `model` (یک تخمین ثبت شده)، سپس `time` و سپس `human`.
  - اجراکننده از اولین پله‌ای که می‌تواند برآورده کند استفاده کرده و آن را در `verifiedBy` ثبت می‌کند.
  - اگر نتواند **هیچ** پله‌ای را برآورده کند، باید مرحله را رد کند (`missing_sensor_no_fallback`).
  - عملیاتی که نیاز به توجه مداوم دارند و ممکن است بدون نظارت اجرا نشوند (تفت دادن، سرخ کردن سریع، سرخ کردن، غلیظ کردن، کاراملی کردن...) هرگز تنها به زمان متکی نیستند: آخرین پله آن‌ها فردی است که نظارت می‌کند.
  - سرخ کردن عمیق (Deep frying) هیچ fallback ای ندارد: نبود sensor دمای روغن به معنای عدم امکان deep frying است.
  - یک `Condition` می‌تواند این مورد را با `onSensorMissing` محدودتر کند.
- **refusal، نه حدس زدن.** اجراکننده‌ای که نمی‌تواند envelope، ladder، تجهیزات یا محدودیت‌های ایمنی یک مرحله را برآورده کند، MUST قبل از شروع، با ذکر دلیل پاسخ `refused` را بدهد.

## 4. اعداد و واحدها

- **دماها روی سیم °C هستند.** نمایشگرها ممکن است تبدیل کنند.
- **تولرانس‌ها.**
  - `tolerance` نسبی است و فقط روی واحدهای مقیاس نسبت مجاز است.
  - `toleranceAbs` در واحدِ مقدار، مطلق است و تنها تولرانس مجاز روی °C است.
  - `Target.tolerance` مطلق است.
- **واحدهای آشپزخانه مقادیر متریک دقیق دارند:** tsp 5 ml، tbsp 15 ml، cup 240 ml،
  pinch ≈ 0.36 g، dash ≈ 0.6 ml.
- **حجم ↔ جرم به یک چگالی نیاز دارد** (`Quantity.densityGPerMl` یا واژگان مواد اولیه)؛
  بدون آن یک خطا است، هرگز یک حدس نیست.
- **پول یک رشته اعشاری است** (`"12.70"`) با یک واحد پول ISO 4217، هرگز یک float نیست.

## 5. یکپارچگی و اعتماد

- **Hash.** `sha256:` به‌علاوه digest هگزادسیمال از RFC 8785 canonical JSON سند،
  بدون فیلدهای `hash` و `signature`. کانونیکالایزر مرجع، نمونه RFC 8785 را دقیقاً بازتولید می‌کند.
- **Signature.** از نوع Ed25519 (`EdDSA`) روی رشته hash با فرمت ASCII. استفاده از `ES256` برای کلیدهای سخت‌افزاری P-256 مجاز است. `kid` نام یک `KeyRecord` را مشخص می‌کند.
- **Keys.** یک `KeyRecord` کلید عمومی، مالک آن، بازه اعتبار و `revokedAt` را ارائه می‌دهد.
  امضایی که `signedAt` آن پس از ابطال، یا خارج از بازه اعتبار باشد، نامعتبر است.
  - کاتالوگ‌ها کلیدهای خود را در `/.well-known/cookwala.json` منتشر می‌کنند.
  - سازمان‌ها و افراد کلیدهای خود را در اسناد did:web منتشر می‌کنند.
  - دستگاه‌ها کلیدهای خود را در سند capabilities خود منتشر می‌کنند.
  - تاییدکننده‌ها (Verifiers) سوابق کلید را برای استفاده آفلاین کش می‌کنند.
- **Selective disclosure.** یک سند امضا شده ممکن است به‌جای یک مقدار حساس، یک digest از نوع `Disclosure` یعنی `sha256(JCS([salt, value]))` داشته باشد. دارنده، salt و value را تنها برای طرف‌هایی که اجازه مشاهده آن‌ها را دارند فاش می‌کند، و امضا همچنان تایید می‌شود.
- **Event logs** (پروفایل ماموریت):
  - یک توالی‌ساز (sequencer) برای هر log، مقادیر `seq` و `prev` را اختصاص می‌دهد، به‌گونه‌ای که زنجیره هرگز دچار شاخه شدن (fork) نمی‌شود.
  - چک‌پوینت‌ها توسط توالی‌ساز امضا شده و توسط شاهدان (witnesses) که ممکن است شامل یک سرویس شفافیت مانند IETF SCITT باشند، امضای مجدد می‌شوند. بازنویسی پس از یک چک‌پوینت شاهد‌گذاری شده، قابل تشخیص است.
  - در حالت `hash_only` ، محموله‌ها (payloads) در حافظه پاک‌شونده قرار دارند و log تنها hashهای آن‌ها را نگه می‌دارد.

## ۶. ایمنی و قوانین عامل (هنجاری)

1. **ایمنی محلی است.** اجراکننده‌ها یک بسته `SafetyLimits` را روی دستگاه اعمال می‌کنند.
   - هیچ دستور پخت، عامل، پیام از راه دور، افزونه یا حالت عملیاتی نمی‌تواند یک محدودیت را افزایش دهد یا غیرفعال کند.
   - یک محدودیت سخت‌گیرانه‌تر همیشه برنده است.
   - `profiles/core/safety-limits.default.json` یک نقطه شروع پیش‌نویس است که سازندگان دستگاه‌ها بر اساس مورد ایمنی (safety case) خود آن را محدودتر می‌کنند.
2. **توقف محلی.** یک کنترل توقف روی دستگاه، حرکت را ظرف 0.5 s و حرارت را ظرف 1 s متوقف می‌کند، با یا بدون شبکه. `POST …/stop` هرگز برای مجوزدهی رد نمی‌شود، زمانی که فراخواننده بتواند به اجراکننده دسترسی داشته باشد.
3. **گزارش رویدادها؛ آن‌ها هرگز محافظت نمی‌کنند.** رویدادهای `cookwalalatency: local_safety` آنچه را که یک دستگاه قبلاً انجام داده است گزارش می‌دهند. هیچ تابع ایمنی نب fact نباید به رسیدن یک رویداد وابسته باشد.
4. **متن غیرقابل اعتماد.** هر فیلد متن آزاد (که با `x-cookwala-untrusted` مشخص شده است) داده است و هرگز یک دستور نیست، هم برای نرم‌افزار و هم برای عامل‌های AI. تلاش‌ها برای دستور دادن از طریق متن نادیده گرفته شده و ثبت می‌شوند (`cw.incident.untrusted_instruction`).
5. **عامل‌ها تحت یک mandate عمل می‌کنند.** درخواستی که توسط یک عامل ارسال می‌شود، حامل یک `AgentMandate` است که توسط اصلی (principal) امضا شده است: محدوده‌ها، سقف هزینه‌ها، ارائه‌دهندگان مجاز، انقضا، و اقداماتی که نیاز به تأیید دارند.
   - `irreversible` و `safety_override` همیشه نیاز به تأیید دارند، هر آنچه که mandate بگوید.
   - اجراکننده‌ها درخواست‌های خارج از mandate را رد می‌کنند (`mandate_scope`).
6. **عملیات‌های بدون نظارت به یک شخص نیاز دارند.** عملیات‌هایی که envelope آن‌ها می‌گوید `unattended: false` است، به حضور یک شخص مسئول، یا فردی که ظرف یک دقیقه قابل دسترس باشد، نیاز دارند.
7. **بلاک‌های آلرژن رد می‌کنند.** هر آلرژن مسدود شده در دستور پخت یا موجودی، درخواست را رد می‌کند؛ هیچ جایگزینی برای دور زدن یک بلاک وجود ندارد.
8. **Recallها.** کاتالوگ‌ها recallهای امضا شده را در `GET /v1/recalls` منتشر می‌کنند. اجراکننده‌ها هنگام آنلاین بودن استعلام (poll) می‌کنند و نسخه‌های recall شده را رد می‌کنند. `block_and_stop_running` همچنین اجراهای در حال انجام را به صورت ایمن متوقف می‌کند.
9. **گزارش‌های حادثه** ناشناس هستند (`IncidentReport`: فقط تاریخ، بدون نام یا id) و به کاتالوگ‌ها ارسال می‌شوند تا هر سازنده از هر مورد نزدیک به خطا (near miss) درس بگیرد.

## 7. چرخه حیات اجرا و API

- **API:** `api/core.openapi.yaml`. نقاط پایانی آن عبارتند از:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - سمت کاتالوگ: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused` ، `needs_human` و `stopping` → در طول مسیر به `stopped` می‌رسند؛
  - `refused` و `failed` نهایی هستند.
  - جدول انتقال کامل در `core.schema.json#/$defs/ExecutionState` و بردارهای conformance موجود است.
- **Request rules:**
  - هر POST حاوی یک `Idempotency-Key` است.
  - تغییرات در یک execution موجود حاوی `If-Match: <seq>` است؛ عدم تطابق منجر به بازگشت 412 می‌شود.
  - Stop نیازی به If-Match ندارد.
- **Events:**
  - تحویل حداقل یک بار (at least once) است.
  - `id` در CloudEvents کلید حذف تکرار (deduplication key) است.
  - `cookwalaseq` رویدادها را بر اساس subject مرتب می‌کند و با وضعیت `seq` مطابقت دارد.
  - دستگاه‌ها `cookwala.device.heartbeat` را منتشر می‌کنند، بنابراین یک hub می‌تواند یک دستگاه از دست رفته را شناسایی کرده و وظیفه را واگذار کند.

## 8. حریم خصوصی

- **Execution logs هیچ داده شخصی به همراه ندارند** (`privacy.personalData: "none"`).
- **آن‌ها تنها با رضایت opt-in از دستگاه خارج می‌شوند** (`consent.dataset`: `none` به صورت پیش‌فرض،
  `research_only` یا `open`). رضایت قابل بازپس‌گیری است.
- **Open datasets زمان‌ها را تا سطح روز تقریبی می‌کنند.**
- **داده‌های مربوط به household، سلامت و مذهبی در خانه می‌مانند** مگر اینکه فرد طور دیگری را انتخاب کند.
  زمانی که باید منتقل شوند، به صورت selective disclosures منتقل می‌شوند.
- **The Humanitarian Profile** هیچ داده شخصی‌ای به همراه ندارد.

## 9. نسخه‌بندی و افزونه‌ها

- **نسخه‌های اصلی `0.2.x` هستند.**
  - خواننده‌ها هر patch از نسخه minor خود را می‌پذیرند.
  - آن‌ها سایر نسخه‌های minor را با `unsupported_version` رد می‌کنند.
  - آن‌ها فیلدهای ناشناخته `x-` را نادیده می‌گیرند.
- **عملیات‌ها، واحدها، سنسورها و انواع حادثه جدید** بدون تغییر نسخه به واژگان اضافه می‌شوند.
- **تغییر معنای یک operation یک id جدید است؛** نسخه قدیمی با `replacedBy` به عنوان `deprecated` علامت‌گذاری می‌شود.
- **Profileها** به طور مستقل نسخه می‌شوند و نسخه Core مورد نیاز خود را اعلام می‌کنند.

## ۱۰. پروفایل‌ها و وضعیت آن‌ها

| پروفایل | وضعیت | یادداشت‌ها |
|---|---|---|
| Core (این سند) | **draft, normative** | هدف برای اولین پیاده‌سازی‌های دستگاه |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | بدون داده‌های شخصی؛ کار با SMS و CSV؛ surplus to plate، خلاصه‌های اثرگذاری، care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | حقایق خانوار با اولویت محلی؛ فقط derived constraints منتقل می‌شوند (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | namespaceهای اثبات‌شده، نسخه‌های دقیق، tombstones؛ سازمان‌ها بر اساس درخواست (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | گزارش‌های امضا شده پشت هر ادعای conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | فیدها و رله‌ها؛ تایید در برابر صادرکننده (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | رستوران‌ها، جامعه، مدرسه، آشپزخانه‌های بلایای طبیعی و رباتیک (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | سیگنال‌های تقاضا و عرضه تجمیع‌شده، با تأخیر، در سطح کلاس؛ مشروط به بررسی قانون رقابت (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | log رویداد + پیش‌بینی، گذارها در `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | نیاز به بررسی قانون رقابت قبل از استفاده در تولید دارد |
| Relief planning (`relief.schema.json`) | experimental | جریان عملیاتی به Humanitarian Profile منتقل شد |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API سطح مرجع است |

یک پروفایل زمانی پایدار می‌شود که دو پیاده‌سازی مستقل از بردارهای conformance آن عبور کنند و کاربران واقعی داشته باشد.

## ۱۱. ابزارها

| ابزار | کاری که انجام می‌دهد |
|---|---|
| `tools/validate_specs.py` | طرحواره‌ها، مثال‌ها، معناشناسی دستور پخت (envelopes، پارامترهای op، عدم وجود جایگزین‌های template)، سخت‌گیری، و اینکه ارجاعات API حل می‌شوند را بررسی می‌کند |
| `tools/run_conformance.py` | فایل‌های `conformance/*.json` و `conformance/profiles/*.json` را اجرا می‌کند، و یک ConformanceReport با `--report` می‌نویسد: هش کردن (شامل مثال RFC 8785)، امضاها (شامل یک کلید RFC 8032)، ابطال، افشا، زنجیره‌های رویداد و نقاط بازرسی، واحدها، envelopes، sensor ladders، ماشین‌های حالت |
| `tools/cookwala_ref.py` | کتابخانه مرجع و CLI: `hash` ، `verify` ، `chain` |
| `tools/make_conformance.py` | بردارها را بازسازی می‌کند (تفاوت‌ها را مرور کنید) |
| `tools/bundle_schemas.py` | بسته طرحواره آفلاین |
| `tools/humanitarian_check.py` | بررسی‌کننده rule-pack پروفایل بشردوستانه و خلاصه‌های اثرگذاری |
| `tools/make_profile_vectors.py` | بردار‌های پروفایل را در `conformance/profiles/` بازسازی می‌کند |

## ۱۲. تغییرات از 0.1

| حوزه | 0.1 | 0.2 |
|---|---|---|
| Schemas | فیلدهای ناشناخته پذیرفته شده | سخت‌گیرانه، با افزونه‌های `x-` |
| Temperatures | °C یا °F، تلرانس نسبی مجاز است | فقط °C؛ تلرانس مطلق |
| Money | عدد | رشته اعشاری |
| Operations | تعاریف متنی | envelopes فیزیکی، sensor ladders، سطوح حرارت، بردارهای تست |
| Signatures | EdDSA ثابت، کلیدهای بدون چرخه حیات | EdDSA یا ES256، KeyRecords با اعتبار و ابطال |
| Missions | یک سند تغییرپذیر، دفتر کل در داخل | Event log + projection، یک sequencer واحد، چک‌پوینت‌های شاهد شده، حالت فقط هش |
| Agents | Mandate فقط در داخل Missions | `AgentMandate` در بخش مشترک؛ مورد نیاز برای درخواست‌های agent |
| Safety | اعلام شده در دستور پخت‌ها | همچنین اعمال شده به صورت محلی از طریق SafetyLimits؛ recalls؛ گزارش‌های حادثه |
| Data | بدون مدل مجموعه داده | ExecutionLog با رضایت داده شده و فاقد داده‌های شخصی |
| Conformance | فقط اعتبارسنجی Schema | ۱۰۶ بردار (۴۴ Core، ۶۲ profile) به علاوه یک پیاده‌سازی مرجع |

برای مهاجرت یک سند 0.1: تبدیل °F به °C؛ جایگزینی تلرانس‌های نسبی در دماها با `toleranceAbs`; تبدیل مبالغ پولی به رشته‌های اعشاری؛ حذف یا تغییر نام فیلدهای ناشناخته به فیلدهای `x-`.

