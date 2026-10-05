<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# پروفایل Household Context: تصویر کامل در خانه می‌ماند

> **وضعیت: draft profile** (RFC-0001). بخشی از Cookwala Core نیست. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> قوانین گیرنده: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. مثال: `examples/household/context.json`.

## ۱. چرا

روباتی که به خوبی به یک خانواده خدمت می‌کند، باید اطلاعات بسیار زیادی بداند: لوازم خانگی و ویژگی‌های خاص آن‌ها، اینکه چه کسی در آنجا زندگی می‌کند و چه زمانی در خانه هستند، حیوانات خانگی، کودکان، رژیم‌های غذایی، حساسیت‌ها، زمان‌بندی دارو، آداب و رسوم، بودجه، عادت‌های خرید، و اینکه دفعه قبل چه مشکلی پیش آمده است. همین حقایق، هم یک نقشه سرقت هستند و هم یک ابزار پروفایل‌سازی. این پروفایل به **planner at home** تصویر کامل را می‌دهد و به بقیه فقط یک **constraint** می‌دهد.

## ۲. سه ایده

1. **Facets.** هر کدام یک واقعیت تایپ‌شده (`cw.op.simmer`)، همراه با اینکه چه کسی آن را اثبات کرده است (declared، observed، reported، inferred)، چه زمانی، برای چه مدت، چقدر با اطمینان، و یک کلاس حریم خصوصی (`public`، `household`، `sensitive`، `secret`).
2. **قوانین سفر در registry.** هر نوع facet بیان می‌کند که آیا مقدار خام آن می‌تواند خانه را ترک کند یا خیر: `never` (۴۵ نوع: کودکان، غیبت‌ها، چیدمان‌ها، شرایط سلامتی، مذهب، رفتار، حوادث، وضعیت درآمد)، فقط به عنوان یک محدودیت `derived` (۸۱ نوع)، یا به عنوان یک افشای `consented` پس از یک اجازه صریح (۱۳ نوع، عمدتاً وضعیت خودِ دستگاه برای سازنده).
3. **Derived constraints.** تنها شیء household که یک خواربارفروش، برنامه‌ریز، سرویس تحویل، سازنده دستگاه یا ربات دیگری دریافت می‌کند: "تحویل ۱۷:۰۰–۱۸:۰۰ به درب جلویی"، "مسدود کردن بادام‌زمینی"، "عدم حرکت ربات در راهرو ۱۵:۰۰–۱۵:۳۰"، "سقف بودجه ۱۸.۰۰ USD برای هر وعده". هر کدام **types** facet که از آن‌ها آمده است را نام می‌برند، هرگز مقادیر آن‌ها را.

## ۳. چه کسی چه چیزی دریافت می‌کند

| نقش گیرنده | ممکن است دریافت کند |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI یا نرم‌افزاری که وعده غذایی را برنامه‌ریزی می‌کند) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | فقط device fault summary (تعداد خطاها بر اساس دسته، بدون زمان، بدون حقایق household)، و تنها زمانی که household یک insurer را به عنوان گیرنده نام برده باشد؛ RFC-0001 این نقش را به عنوان نقشی که در صورت اعتراض یک بررسی حریم خصوصی، بیشترین احتمال حذف شدن را دارد، فهرست می‌کند |
| program (food bank, school) | هیچ چیز |
| dataset | هیچ چیز |

## 4. قوانین

- facetهای خام هرگز دستگاه را ترک نمی‌کنند. هیچ API ای وجود ندارد که آن‌ها را به هیچ‌کس خارج از شبکه خانه بازگرداند.
- facetهای `inferred` هرگز برای تصمیمات ایمنی استفاده نمی‌شوند.
- هیچ امتیاز رفتاری برای هیچ شخصی تولید یا ذخیره نمی‌شود. facetهای رفتار برای خدمت به household (اندازه وعده‌ها، زمان جمع‌آوری) وجود دارند و هرگز جابه‌جا نمی‌شوند.
- سطح اقتصادی یک **owner-set budget posture** است، که هرگز از هیچ‌چیز استنباط نمی‌شود.
- داده‌ها و غیبت‌های کودکان `secret` هستند و هرگز جابه‌جا نمی‌شوند، حتی به صورت derived، مگر به عنوان محدودیت‌های movement و safe-zone که هیچ برنامه‌ای را فاش نمی‌کنند.
- هر facet قابل پاک‌سازی است. پاک‌سازی در بازه زمانی household تکمیل می‌شود (پیش‌فرض ۷ روز، حداکثر ۳۰ روز) و بدون محتوا ثبت می‌شود.
- یک privacy class ممکن است بالاتر از پیش‌فرض registry تعیین شود، اما هرگز پایین‌تر نمی‌آید.

## ۵. حافظه حادثه محلی

RFC-0001 می‌پرسد که ربات چه چیزی را درباره هشدارها، تضادها، تسلیم‌ها و درس‌ها به خاطر می‌سپارد. `LocalIncident` آن را نگه می‌دارد: تاریخ، دسته از `vocab/incidents.json` ، کسانی که بر اساس نوع درگیر بودند، یک یادداشت و یک درس. این هرگز خانه را ترک نمی‌کند. `IncidentReport` عمومی و ناشناس در Core یک سند متفاوت است که هر سازنده‌ای از آن می‌آموزد.

## 6. Conformance

بردارهای پروفایل (`conformance/profiles/disclosure_policy.json`) facetها و یک نقش گیرنده را ارائه می‌دهند و انتظار انواع دقیق constraintها، idهای افشا شده و idهای پنهان شده به همراه دلایل را دارند. پیاده‌سازی مرجع `derive_constraints()` در `tools/cookwala_ref.py` است.

## 7. رابطه با سایر اسناد

`ClientProfile` ،`KitchenProfile` و `RobotProfile` (`profile.schema.json`) به عنوان بسته‌های مناسب باقی می‌مانند. facetهای ماموریت (`mission.schema.json`) از همان idهای registry استفاده می‌کنند. `AgentMandate` هسته اصلی، به عنوان بیانیه هنجاری از آنچه یک agent می‌تواند انجام دهد باقی می‌ماند؛ facetهای mandate قوانین household را به صورت محلی توصیف می‌کنند.

## ۸. پرسش‌های باز

RFC-0001 را ببینید: نقش‌های گیرنده بسته؛ حریم خصوصی raise-only؛ یک ارزیابی اثر محافظت از داده با یک بازبین.

