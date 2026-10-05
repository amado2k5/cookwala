<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# نقشه راه: now، next، later

**Status:** 2026-10-04. هر مورد دارای یک وضعیت است: **done**، **in progress**، **planned**،
**not yet funded**. گیت‌ها از بخش ۴ `ACTION-PLAN.md` می‌آیند. هیچ چیزی از planned
به done بدون شواهد نام‌گذاری شده منتقل نمی‌شود.

## Now (این نسخه)

| مورد | وضعیت |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| ۱0۱ conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| ۹ دستور پخت نمونه به زبان‌های انگلیسی و عربی | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) با یک قالب بازبینی | done (drafts awaiting professional review) |
| Household Context Profile با یک 139-type facet registry و disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| ۴ شبیه‌ساز با پروتکل روشن و خاموش | done (illustrative) |
| وب‌سایت به زبان‌های انگلیسی و عربی با صفحه‌ای برای هر ذینفع، whitepaper و deck | in progress |

## Next (در حدود یک سال، در صورت فراهم بودن منابع)

| مورد | وضعیت | دروازه |
|---|---|---|
| بررسی دانشمند مواد غذایی بر روی operation envelopes | planned | بازبین موافق است |
| بررسی‌های متخصص تغذیه و افسر ایمنی مواد غذایی بر روی چهار rule packs | planned | بررسی‌ها ثبت شدند؛ بسته‌ها به reviewed منتقل می‌شوند |
| ارزیابی تأثیر حفاظت از داده‌ها بر پروفایل household context | planned | بازبین موافق است |
| یک طرح آزمایشی food-bank (۱۲ هفته، پیش‌ثبت‌نام شده، ارزیاب مستقل) | not yet funded | شریک و تأمین مالی (`humanitarian/CONCEPT-NOTE.md`) |
| نتایج معیار ایمنی عامل برای چندین خانواده مدل | planned | اجراها همراه با روش منتشر می‌شوند |
| wheel مربوط به `pip install cookwala` و `@cookwala/sdk` در npm | planned | بسته‌بندی که واژگان و طرحواره‌ها را تجمیع می‌کند |
| سرویس Registry (`validate`, `publish`, tombstones) | planned | یک کارگر و اثبات namespace |
| اولین سازنده دستگاه که Core API را در برابر reference hub پیاده‌سازی می‌کند | planned | یک سازنده موافق است؛ گزارش conformance منتشر می‌شود |
| تبدیل اولین مجموعه‌های fifi.cooking | planned | مؤسس حقوق هر مجموعه را تعیین می‌کند |
| Core 0.3 بر اساس بازخورد دستگاه | planned | بازخورد دو پیاده‌ساز |
| کمیته هدایت | planned | سه پذیرنده مستقل یا دو پیاده‌سازی |

## Later

| مورد | وضعیت |
|---|---|
| یک دستگاه واقعی در حال پخت دستور پخت Cookwala، بدون ویرایش، روی ویدئو | هنوز تامین مالی نشده است؛ نیاز به شریک دستگاه دارد |
| طرح certification با یک تاییدکننده مستقل | برنامه‌ریزی شده؛ هیچ تاییدکننده‌ای درگیر نشده است |
| بنیاد خنثی برای مشخصات، علامت تجاری و نشان | برنامه‌ریزی شده |
| شبکه مشارکت‌کننده: ضبط‌های رضایت‌یافته از دستور پخت‌های واقعی با ذکر اعتبار | برنامه‌ریزی شده |
| سیگنال‌های عرضه و تقاضا منتشر شده توسط برنامه‌ها و تعاونی‌ها | برنامه‌ریزی شده، پس از بررسی قانون رقابت |
| معیار "پخت در شبیه‌سازی" (Isaac Lab، Gazebo یا MuJoCo) | برنامه‌ریزی شده |
| شناسایی Digital Public Good برای پروفایل بشردوستانه | برنامه‌ریزی شده، پس از شواهد آزمایشی |
| جریان‌های امداد میان‌منطقه‌ای در شبیه‌ساز جهانی؛ اثرات پخت‌وپز پاک | برنامه‌ریزی شده |

## آنچه انجام نخواهیم داد

جمع‌آوری داده‌های شخصی؛ انتشار اعداد بدون یک روش؛ نام بردن از یک شریک پیش از موافقت آن؛
ادعای یک certification که وجود ندارد؛ قرار دادن داده‌های household در هر ledger؛ ساخت یک
orchestrator مرکزی که آشپزخانه‌ها به آن وابسته هستند؛ ادعای پایان دادن به گرسنگی.

## قوانین Kill and pivot

از برنامه اقدام: اگر دو دور بازبینی خارجی منجر به یافتن سازنده دستگاه یا یک شریک pilot نشود، Cookwala به Humanitarian Profile و قالب دستور پخت محدود می‌شود. اگر یک pilot افزایشی کمتر از 5 % نشان دهد، نتایج منتشر شده و پروفایل پیش از هرگونه scaling بازطراحی می‌شود.

