<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# پروفایل بشردوستانه Cookwala (پیش‌نویس 0.2)

**Status:** پیش‌نویس برای بررسی توسط food banks، برنامه‌های امدادی و متخصصان ایمنی غذا و تغذیه. توسط WFP، WHO، FAO، Global FoodBanking Network یا هر سازمان دیگری که در اینجا نام برده شده است، بررسی یا تأیید نشده است.

**فایل‌ها:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (همه)، [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json)، [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json)، [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004؛ تمام پیش‌نویس‌ها در انتظار بررسی حرفه‌ای هستند، ببینید [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank در قاهره، وعده‌های غذایی مدرسه، آشپزخانه بلایا، آشپزخانه رباتیک)، هر کدام با یک `ImpactSummary` محاسبه شده
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. آنچه 0.2 اضافه می‌کند (RFC-0003, RFC-0004)

افزایشی بیش از 0.1؛ خوانندگان هر دو را می‌پذیرند.

- **از مزرعه تا بشقاب:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) و `Item.harvestedAt`; نقش‌های `farm`, `caterer`, `robot_kitchen`; کلمه SMS عبارت `FARM`.
- **قوانین مراقبتی:** `Item.foodClasses` و `Distribution.menu.foodClasses` (تخم‌مرغ خام، لبنیات غیرپاستوریزه، آجیل کامل، برنج پخته...)، نوع قانون `food_class` ، `Rule.audienceGroup` ، `Distribution.audienceGroups`؛ سه بسته پیش‌نویس جدید.
- **بازبینی‌ها:** `RulePack.reviews` حرفه، سازمان، تاریخ، محدوده و نتیجه هر بازبینی را ثبت می‌کند؛ `status: reviewed` نیازمند یک بازبینی تایید شده است.
- **تأثیر:** `ImpactSummary` با نه معیار، که هر کدام دارای `method` (measured، modelled، assumed، not recorded) هستند، که توسط `tools/humanitarian_check.py --summary` محاسبه می‌شوند.
- **زمان ادعا:** `Offer.createdAt` ، `Claim.claimedAt`؛ `Handover.leg` تا کیلوگرم‌های نجات یافته یک بار شمارش شوند.
- **انواع برنامه** در `Manifest`.

## ۱. هدف

یک بخش کوچک، سخت‌گیرانه و بدون داده‌های شخصی از Cookwala برای سازمان‌هایی که به مردم غذا می‌دهند:
food banks، آشپزخانه‌های محلی، برنامه‌های وعده‌های غذایی مدارس، برنامه‌های امدادی، اهداکنندگان (خرده‌فروشان مواد غذایی، رستوران‌ها، مزارع، کترینگ‌ها)، حمل‌کنندگان و انبارهای سرد. این بخش چهار وظیفه را پوشش می‌دهد:

1. **پیشنهاد surplus food** و ادعای آن، به سرعت و به طور منصفانه.
2. **ثبت هر handover** از مالکیت، همراه با بررسی دما (بررسی زنجیره سرد).
3. **گزارش آنچه سرو شده است** تنها به صورت شمارش‌های مجموع.
4. **بررسی منوها و handovers** در برابر قوانین تغذیه و ایمنی غذا که توسط ماشین قابل خواندن هستند.

**بدون ربات‌ها، اپلیکیشن‌ها یا اینترنت کار می‌کند.** سطوح H0 و H1 روی صفحات گسترده، SMS و تلفن‌های ساده اجرا می‌شوند. ربات‌ها، hubها و عامل‌ها مصرف‌کنندگان اختیاری همان اسناد هستند.

## 2. اصول

- **آسیب نرسانید.** هیچ چیزی را که بتواند یک فرد یا household را شناسایی، مکان‌یابی یا پروفایل‌سازی کند، جمع‌آوری نکنید. در محیط‌های شکننده، داده‌ها درباره ذینفعان یک ریسک حفاظتی هستند.
- **اصول بشردوستانه** (انسانیت، بی‌طرفی، بی‌طرفی عملی، استقلال): هیچ برند تجاری روی کمک‌ها نباشد، و از داده‌ها برای بازاریابی استفاده نشود.
- **سخت‌گیرانه و کوچک.** هر شیء فیلدهای ناشناخته را رد می‌کند (به جز افزونه‌های `x-`)، بنابراین غلط‌های املایی و فیلدهای شخصی اضافی در اعتبارسنجی با شکست مواجه می‌شوند.
- **واحدهای دقیق:** کیلوگرم، درجه Celsius، تلرانس‌های مطلق، و پول به صورت رشته‌های اعشاری.
- **قوانین محلی برنده هستند.** rule packs توسط قوانین ملی ایمنی غذا و اهدا قابل جایگزینی هستند.
- **باز:** مشخصات بدون حق امتیاز، ابزارهای متن‌باز. این پروفایل برای مطابقت با Digital Public Goods Standard و Principles for Digital Development طراحی شده است.

## 3. سطوح conformance

| سطح | آنچه شرکت‌کننده انجام می‌دهد | نیازها |
|---|---|---|
| **H0 — Paper & SMS** | پیشنهادها، تحویل‌ها و توزیع‌ها را در قالب‌های CSV (همراه با ردیف‌های hashtag HXL) یا از طریق SMS (بخش 8.3) ثبت می‌کند | یک صفحه گسترده یا یک تلفن ساده |
| **H1 — Rescue** | اسناد `Offer` ، `Claim` ، `Handover` و `Distribution` را از طریق API مبادله می‌کند؛ از ماشین حالت (بخش 5) پیروی می‌کند | هر HTTP client |
| **H2 — Safety & nutrition** | یک `RulePack` را برای هر تحویل و منو اعمال می‌کند و `findings` را ثبت می‌کند | بررسی‌کننده مرجع یا معادل آن |
| **H3 — Interoperability** | مجموع‌ها را به HXL، DHIS2 و `ImpactReport` اصلی Cookwala صادر می‌کند؛ از شناسه‌های GS1 استفاده می‌کند | کار یکپارچه‌سازی |

یک شرکت‌کننده یک `Manifest` در `/.well-known/cookwala-humanitarian.json` منتشر می‌کند که سطوح، rule packs، نقاط پایانی و `personalData: "none"` خود را اعلام می‌کند.

## 4. اسناد

| سند | نویسنده | هدف |
|---|---|---|
| `Offer` | اهداکننده | surplus food موجود برای جمع‌آوری: اقلام (kg، ذخیره‌سازی، نشانه‌های تاریخ، آلرژن‌ها)، بازه زمانی، سایت، دماها |
| `Claim` | food bank، آشپزخانه، برنامه | ادعای تمام یا بخشی از یک `Offer` با زمان تحویل و نوع خودرو |
| `Handover` | تحویل‌گیرنده حضانت | یکی برای هر مرحله: دماها، kg پذیرفته یا رد شده به همراه یک کد دلیل، و یافته‌های rule |
| `Distribution` | آشپزخانه، food bank، مدرسه | مجموع وعده‌های غذایی و افراد خدمات‌رسانی شده در یک سایت در یک روز؛ مواد مغذی و هزینه‌های منوی اختیاری |
| `RulePack` | برنامه یا مرجع | قوانین تغذیه و ایمنی غذا نسخه‌بندی شده (بخش ۶) |
| `Manifest` | هر شرکت‌کننده | قابلیت‌ها و اعلامیه حفاظت از داده‌ها |

اسناد اصلی امداد Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` در `relief.schema.json`) برای برنامه‌ریزی در دسترس باقی می‌مانند. این پروفایل جریان عملیاتی را مدیریت می‌کند.

## 5. چرخه حیات پیشنهاد (Offer lifecycle)

| از | حالت‌های next مجاز |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**قوانین برای تغییرات وضعیت:**

- هر تغییر `version` را افزایش می‌دهد. نویسندگان `If-Match: <version>` ارسال می‌کنند؛ عدم تطابق منجر به بازگشت **409** می‌شود و نویسنده دوباره می‌خواند و تلاش مجدد می‌کند.
- یک انتقال غیرمجاز، **409** را به همراه انتقال‌های مجاز بازمی‌گرداند.
- پیشنهادها به‌طور خودکار در `window.to` به `expired` منتقل می‌شوند.
- ادعاها در زمان `pickupBy` به‌اضافه یک دوره مهلت که برنامه تعیین می‌کند (پیش‌فرض ۳۰ minutes) منقضی می‌شوند.

**ادعای منصفانه.** به‌صورت پیش‌فرض، ادعاها بر اساس اولویتِ تعیین‌شده توسط برنامه، به ترتیبِ رسیدن در یک tier هستند:
برای مثال، آشپزخانه‌هایی که ابتدا به کودکان خدمات می‌دهند، سپس سایر آشپزخانه‌ها، و سپس food banks. tierها و
هرگونه قوانین چرخش باید در `Manifest` برنامه یا وب‌سایت منتشر شوند.

## 6. بسته‌های قوانین ایمنی غذا و تغذیه

یک `RulePack` شامل شش نوع قوانین است:

- `temperature`: سرد ≤ 5 °C، گرم نگه داشته شده ≥ 60 °C، منجمد ≤ −18 °C؛
- `time`: غذای پخته شده خارج از کنترل دما برای حداکثر 2 h؛
- `date_mark`: بلوک‌های تاریخ انقضا (use-by)، هشدارهای تاریخ مصرف توصیه شده (best-before)؛
- `allergen`: بلوک آلرژن‌های اعلام نشده؛
- `nutrient`: مقادیر به ازای هر نفر-روز یا هر وعده غذایی؛
- `energy_share`: سهم انرژی از قندهای آزاد، چربی، چربی اشباع شده، چربی ترانس یا پروتئین.

هر قانون یا از نوع `block` است (پذیرش یا سرو نکنید) یا از نوع `warn` (مجاز است، به عنوان یک یافته ثبت می‌شود).

بسته پیش‌فرض `who-codex-basic@0.1.0` یک **پیش‌نویس مشتق شده از راهنمایی‌های عمومی** است: راهنمایی‌های WHO در مورد رژیم غذایی سالم، سدیم، قندها و چربی‌ها، پنج کلید WHO برای غذای ایمن‌تر، کدهای برچسب‌گذاری Codex و غذاهای منجمد، و ارقام برنامه‌ریزی حداقل جیره Sphere. این بسته ساده‌سازی شده است، توصیه پزشکی نیست، تغذیه نوزاد و درمانی را شامل نمی‌شود، و باید توسط کارکنان واجد شرایط بازبینی شود. برنامه‌ها باید آن را کپی و تطبیق دهند، `jurisdiction` را تنظیم کنند، و اینکه چه کسی آن را بازبینی کرده است در `reviewedBy` ثبت کنند.

گیرنده‌ها در سطح H2 pack را در هر handover و در هر menu اجرا می‌کنند، و rule ids را در `findings` ثبت می‌کنند. بررسی‌کننده مرجع گزارش می‌دهد که در کجا findings اعلام‌شده و محاسبه‌شده با هم اختلاف دارند.

## 7. حفاظت از داده‌ها

**پروفایل هیچ داده شخصی را با خود حمل نمی‌کند. اسناد نباید شامل موارد زیر باشند:**

- نام‌ها، شماره تلفن‌ها، ایمیل‌ها، یا شناسه‌های ملی، پناهندگی یا بیومتریک هر شخص؛
- سوابق در سطح household context، یا مکان خانه‌ها یا افراد؛
- سلامت، ناتوانی، مذهب یا ملیت هر شخص.

**آنچه در عوض با خود حمل می‌کند:**

- **فقط سازمان‌ها.** هر طرف یک سازمان است که توسط `did:web` ، یک شماره مکان جهانی GS1 (GLN) یا یک registry id شناسایی می‌شود. افراد فقط به عنوان نقش‌ها ظاهر می‌شوند (`checkedBy: "trained_staff"`).
- **فقط مجموع‌ها.** `Distribution.people` شمارش‌ها را بر اساس گروه نگه می‌دارد، و هر شمارشی زیر 10 به صورت `"<10"` گزارش می‌شود.
- **فقط سایت‌ها.** یک `Site` محوطه یک سازمان یا یک منطقه اداری (OCHA P-codes) است، و هرگز یک household نیست.
- **یادداشت‌های کوتاه.** متن آزاد به یادداشت‌های عملیاتی ۲۸۰ کاراکتری محدود می‌شود و نباید حاوی داده‌های شخصی باشد. پیاده‌سازی‌ها باید یادداشت‌ها را برای یافتن شماره تلفن‌ها و ids قبل از ذخیره کردن آن‌ها اسکن کنند.

**نگهداری و ممیزی:**

- **Retention:** هر شرکت‌کننده `retentionDays` را در `Manifest` خود اعلام می‌کند و اسناد را پس از آن حذف می‌کند.
- **Audit (اختیاری، `hash_only`):** یک sequencer برای هر برنامه (معمولاً food bank یا اپراتور برنامه) هش SHA-256 مربوط به RFC 8785 canonical JSON هر سند را پیوست می‌کند. محتویات به‌صورت جداگانه ذخیره می‌شوند و قابلیت حذف شدن را حفظ می‌کنند. یک سازمان همکار هر روز یک checkpoint را مجدداً امضا می‌کند، بنابراین تاریخچه نمی‌تواند به‌صورت بی‌صدا بازنویسی شود. یک sequencer واحد از ایجاد fork در زنجیره جلوگیری می‌کند.
- **Hosting** باید در کشوری باشد که قانون یا برنامه آن را ایجاب می‌کند.

## 8. حمل و نقل

### 8.1 API (سطح H1)

| روش | مسیر | یادداشت‌ها |
|---|---|---|
| `POST` | `/offers` | یک پیشنهاد ایجاد می‌کند (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | پیشنهادهای باز در نزدیکی یک گیرنده |
| `POST` | `/offers/{id}/claims` | یک پیشنهاد را ادعا می‌کند؛ `If-Match` الزامی است؛ در صورت ادعای قبلی ۴0۹ |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` الزامی است |
| `POST` | `/handovers` | یک تحویل را ثبت می‌کند |
| `POST` | `/distributions` | یک توزیع را ثبت می‌کند |
| `GET` | `/reports?from=…&to=…` | تجمیع برای یک دوره |

قوانین درخواست و حمل‌ونقل:

- **Idempotency:** هر `POST` یک `Idempotency-Key` به همراه دارد. سرورها کلیدها را حداقل به مدت 24 h نگه می‌دارند و برای تکرارها، پاسخ اصلی را بازمی‌گردانند.
- **Authentication:** اعتبارنامه‌های کلاینت OAuth 2.1، یک کلاینت برای هر سازمان.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  حداقل یک بار تحویل داده می‌شوند، همراه با یک `id` رویداد برای حذف تکرار و یک شماره توالی برای هر پیشنهاد جهت ترتیب‌بندی.

### 8.2 Spreadsheets (level H0)

از قالب‌های CSV در `profiles/humanitarian/templates/` استفاده کنید. ردیف دوم آن‌ها شامل هشتگ‌های [HXL](https://hxlstandard.org) است، بنابراین ابزارهای داده‌های بشردوستانه می‌توانند مستقیماً آن‌ها را بخوانند.

### 8.3 SMS (سطح H0)

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

دستور زبان در `tools/cookwala_ref.py` (`parse_sms`) پیاده‌سازی شده و توسط
`conformance/profiles/sms.json` تست می‌شود. کلمات کلیدی انگلیسی هستند؛ ارقام عربی-هندی (٠-٩) و فارسی (۰-۹)
در هر کجا که رقمی باشد پذیرفته می‌شوند، بنابراین تلفنی که روی هر کدام از این صفحه‌کلیدها تنظیم شده باشد کار می‌کند.

کدهای ذخیره‌سازی: `A` ambient، `C` chilled، `F` frozen، `H` hot-held. نشانگرهای تاریخ: `UB` use-by،
`BB` best-before، `HV` harvested، به صورت `DDMM`. کدهای دلیل رد کردن: `TEMP` temp_out_of_range،
`DATE` past_use_by، `PACK` packaging_damaged، `ALLERG` allergen_unlabelled، `QTY`
quantity_mismatch، `PEST` pests_or_contamination، `SPACE` no_capacity، `TRANSPORT`
no_transport، `LATE` arrived_late، `OTHER`؛ هر کلمه دیگری به عنوان `other` ثبت می‌شود. پاسخ `HELP`
باید برای هر دستور یک مثال باشد، با ASCII ساده، زیر ۱۶۰ کاراکتر.

یک gateway MUST این بررسی‌ها را قبل از نوشتن یک سند (`sms_storage_findings` در مرجع؛ ids یافته‌های بلوک هستند) اعمال کند:

| یافته | زمان |
|---|---|
| `safety.temp_not_recorded` | یک `HAND` روی یک خط خنک‌شده، منجمد یا گرم نگه داشته‌شده هیچ قرائت `T` ندارد: پاسخ با درخواست آن، چیزی ننویسید |
| `safety.hot_hold_min` | یک `OFFER` با ذخیره‌سازی `H` زیر 60 °C: از لیست کردن آن خودداری کنید |
| `safety.storage_class_mismatch` | کلمات مربوط به آیتم دلالت بر لبنیات، گوشت، مرغ، ماهی، تخم‌مرغ یا غذای پخته شده دارد و ذخیره‌سازی `A` است: از لیست کردن آن خودداری کنید |
| `safety.chilled_max`, `safety.frozen_max` | قرائت‌های بالای 5 °C یا بالای −18 °C در هنگام پیشنهاد یا تحویل |

پیشنهادهای غذای گرم نگه داشته شده پس از دو ساعت (یک ساعت برای برنج پخته شده) بسته می‌شوند؛ یک gateway هرگز یک reading جایگزین را ذخیره نمی‌کند. gateway شماره ثبت شده فرستنده را به یک سازمان، و هرگز به یک شخص در اسناد، نگاشت می‌کند.

## 9. قابلیت همکاری میان‌کنش‌ها

| سیستم | نگاشت |
|---|---|
| HXL | قالب‌های CSV؛ `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (محصولات)؛ `Site.gln` و `OrgId` `gln:` (مکان‌ها) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | مقادیر داده‌های تجمیعی به ازای هر سایت و دوره از `Distribution` (میان‌وعده‌ها، افراد بر اساس گروه، kg، حوادث) |
| WFP SCOPE and other beneficiary systems | **فقط تجمیعی.** هیچ رکورد ذینفعی به داخل یا خارج از این پروفایل وارد نمی‌شود |
| Food-rescue apps | آداپتورها لیست‌های آن‌ها را به `Offer` و جمع‌آوری‌های آن‌ها را به `Claim` و `Handover` نگاشت می‌کنند |
| Core Cookwala | `Item.ingredientId` و `menu.recipes` به شاخص دستور پخت لینک می‌شوند؛ `relief.ImpactReport` مجموع `Distribution`ها را محاسبه می‌کند |

## ۱۰. معیارهای پایلوت (تعریف شده برای اینکه سایت‌ها قابل مقایسه باشند)

محاسبه شده در یک `ImpactSummary` توسط `python tools/humanitarian_check.py --summary DIR`. نحوه اجرا و قضاوت یک pilot: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| معیار | تعریف |
|---|---|
| Kg rescued | مجموع `Handover.kgAccepted` در مرحله اول از اهداکنندگان |
| Claim rate | پیشنهادهایی که به وضعیت `claimed` می‌رسند ÷ پیشنهادهای ایجاد شده |
| Time to claim | میانه دقایق از ایجاد `Offer` تا وضعیت `claimed` |
| Rejection by reason | مجموع `kgRejected` بر اساس `reason` |
| Meals served | مجموع `Distribution.meals` |
| Nutrition pass rate | توزیع‌های دارای منو و بدون یافته‌های `nutrition.*` ÷ توزیع‌های دارای منو |
| Cost per meal | (غذا + حمل‌ونقل + کارکنان + انرژی) ÷ وعده‌های غذایی |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | تعداد یافته‌های بلوک `safety.*` و `safetyIncidents` |

## 11. امنیت

- **امضاها در H1 اختیاری هستند** و برای حسابرسی بین‌سازمانی در H3 الزامی می‌باشند
  (EdDSA، کلیدهای منتشر شده در `did:web` سازمان).
- **یادداشت‌ها و نام‌ها در اسناد، داده‌های غیرقابل اعتماد هستند.** نرم‌افزارها و عوامل AI هرگز نباید
  با آن‌ها به عنوان دستورالعمل برخورد کنند.
- **rule packها نسخه‌بندی و پین شده‌اند** (`id@version`) در هر یافته، تا نتایج
  تکرارپذیر باشند.

## ۱۲. عامدانه حذف شده

- ثبت‌نام ذینفع، واجد شرایط بودن و هدف‌گذاری (این موارد متعلق به سیستم‌های محافظت‌شده خودِ برنامه هستند).
- پرداخت‌ها: Cookwala هرگز پولی جابه‌جا نمی‌کند.
- دستور پخت‌ها و اجرای ربات (مشخصات اصلی). پروفایل فقط نام دستور پخت‌ها را ذکر کرده و مواد مغذی را گزارش می‌دهد.
- تغذیه پزشکی و درمانی.

## ۱۳. چگونه بازبینی کنیم

لطفاً در [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) با برچسب `humanitarian` ایشو باز کنید. این بررسی‌ها مفیدترین هستند:

- کارکنان ایمنی غذا در حال بررسی rule pack و دلایل رد شدن؛
- اپراتورهای food-bank در حال بررسی چرخه حیات و جریان SMS؛
- افسران حفاظت از داده در حال بررسی بخش 7.

