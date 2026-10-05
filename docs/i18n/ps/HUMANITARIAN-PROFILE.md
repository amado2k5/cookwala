<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->
# Cookwala بشري پروفایل (draft 0.2)

**Status:** د food banks، د مرستو پروګرامونو او د خوراکي توکو د خوندیتوب او تغذیه متخصصینو لخوا د بیاکتنې لپاره مسودې په توګه. دا د WFP، WHO، FAO، د Global FoodBanking Network یا دلته ذکر شوي کوم بل سازمان لخوا بیاکتنه یا تایید نه دی.

**ملفات:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (ټول), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; ټول مسودې د مسلکي بیاکتنې په انتظار دي، وګورئ [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (په قاهره کې food bank، ښوونځي کې خواړه، आपत्कालीन پخلنځی، روبوټ پخلنځی)، هر یو د محاسبه شوي `ImpactSummary` سره
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. څه چې 0.2 اضافه کوي (RFC-0003, RFC-0004)

د 0.1 څخه زیات اضافه کول؛ لوستونکي دواړه مني.

- **څرېدنه څخه تر ډیس (Farm to plate):** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) او `Item.harvestedAt`; رولونه `farm`, `caterer`, `robot_kitchen`; د SMS کلمه `FARM`.
- **د پاملرنې قواعد (Care rules):** `Item.foodClasses` او `Distribution.menu.foodClasses` (خام هګۍ، غیر پاستور شوي شیدې، بشپړ مغز/نټس، پخول شوی وریژې...)، د قاعدې ډول `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; درې نوي مسودوي شوي rule pack.
- **څکلو (Reviews):** `RulePack.reviews` د هرې بیاکتنې مسلک، سازمان، تاریخ،范围 او پایله ثبتوي؛ `status: reviewed` یو تصویب شوی بیاکتنه ته اړتیا لري.
- **اثر (Impact):** `ImpactSummary` له نهه اندازه ګोडنو سره، چې هر یو `method` (measured, modelled, assumed, not recorded) لري، چې د `tools/humanitarian_check.py --summary` لخوا محاسبه کیږي.
- **د ادعا کولو وخت (Time to claim):** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` ترڅو خلاص شوي کیلوګرامه یوازې یو ځل شړل شي.
- **د پروګرام ډولونه (Program types)** په `Manifest` کې.

## ۱. هدف

د Cookwala یو کوچنی، سخت، او له شخصي معلوماتو خالي برخه د هغو سازمانونو لپاره چې خلک تغذیه کوي:
food banks، ټولنیزې پخلنځي، د ښوونځي د ډوډۍ پروګرامونه، د مرستې پروګرامونه، ډونر (ډکري، رستورانتونه، فارمونه، کیټرینګ)، ټرانسپورټر او یخ کڵو (cold stores). دا څلور کارونه پوښلي:

1. **د surplus food وړاندې کول** او د هغه ادعا کول، په ګړ速 او په انصاف سره.
2. **د هرې سپارلو (handover)** ثبتول، د تودوخې د معاین سره (cold-chain check).
3. **د هغه څه راپور ورکول چې خدمت شوي** یوازې د مجموعي شمېر په توګه.
4. **د مینو او سپارلو (handovers) معاینه کول** د ماشین لخوا د لوستل کېدونکو تغذیوي او د خوراک د خوندیتوب د नियاتو په وړاندې.

**دا پرته له روبوټونو، اپلیکیشنونو یا انټرنیټ څخه کار کوي.** کچې H0 او H1 په spreadsheet، SMS او بنسټیزو تلیفونونو باندې چلوي. روبوټونه، hubs او agents د هغو ورته اسنادو اختیاري مصرفونکي دي.

## 2. اصول

- **هیڅ ډول زیان مه رساوئ.** هیڅ داسې معلومات راټول نه کړئ چې یو کس یا household ته پېژندنه، ځای یا پروفایل ورکړي. په حساس شرایطو کې، د ګټه اخیستونکو په اړه معلومات د ساتنې له مخې یو خطر دی.
- **بشري اصول** (انسانیت، بې طرفي، عدالت، خپلواکي): په مرستو کې هیڅ ډول تجاري برانډینګ نشته، او د بازاراوبار لپاره د معلوماتو کارول نشته.
- **سخت او کوچني.** هر شی ناڅرچلې برخې ردوي (پرته له `x-` توسیعونو)، نو غلط املاګۍ او اضافي شخصي برخې د validation څخه ناکامېږي.
- **دقیق واحدونه:** کیلوګرامه، درجا Celsius، مطلق tolerances، او پیسې د decimal strings په توګه.
- **ځايي قوانین ګټمن دي.** Rule packs د ملي د خوړو د خوندیتوب او ډونیشن قانون لخوا بدلیدلی شي.
- **پرانیستل شوي:** royalty-free spec، open-source وسایل. پروفایل د Digital Public Goods Standard او د Principles for Digital Development پوره کولو لپاره ډیزاین شوی دی.

## 3. د conformance کچې

| کچه | یو ګډونوال څه کوي | اړتیاوې |
|---|---|---|
| **H0 — Paper & SMS** | په CSV templates کې (د HXL hashtag rows سره) یا د SMS له لارې (بخش 8.3) وړاندیزونه، سپارنې او ویشونه ثبتوي | یو spreadsheet یا یو بنسټیز تلیفون |
| **H1 — Rescue** | د API له لارې `Offer`، `Claim`، `Handover` او `Distribution` اسناد تبادله کوي؛ د state machine څخه پیروي کوي (بخش 5) | هر ډول HTTP client |
| **H2 — Safety & nutrition** | هره سپارنه او مینو ته `RulePack` پلي کوي، او `findings` ثبتوي | reference checker یا ورته |
| **H3 — Interoperability** | aggregates ته HXL، DHIS2 او اصلي Cookwala `ImpactReport` ایکسپورټ کوي؛ د GS1 identifiers څخه کار اخلي | د Integration کار |

یو ګډونوال په `/.well-known/cookwala-humanitarian.json` کې یو `Manifest` خپره کوي چې
خپلې کچې، rule packs، endpoints او `personalData: "none"` اعلانوي.

## 4. اسناد

| سند | څوک یې لیکي | purpose |
|---|---|---|
| `Offer` | ډونر | د راټولولو لپاره شته surplus food: توکي (kg, storage, date marks, allergens), وخت, ځای, درجات |
| `Claim` | food bank, پخلنځی, پروګرام | د یو offer ټول یا ځንګړی Claim کوي، د pickup وخت او د موټر ډول سره |
| `Handover` | د امانت ترلاسه کوونکی | په هر پړاو کې یو: درجات، هغه kg چې منل شوي یا رد شوي دي د یو reason code سره، او د rule findings |
| `Distribution` | پخلنځی, food bank, ښوونځی | په یو ځای کې په یوه ورځ کې ټولې خواړه او خدمت شوي خلک؛ اختیاري د منو पोषक عناصر او لګښتونه |
| `RulePack` | پروګرام یا واکمن | د تغذیه او د خوړو خوندیتوب اصول (section 6) چې نسخه لرونکي وي |
| `Manifest` | هر ګډونوال | وړتیاوې او د ډیټا خوندي ساتنې اعلان |

د Cookwala بنسټیزې مرستې اسناد (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` په `relief.schema.json` کې) د پلان جوړولو لپاره شتون لري. دا پروفایل عملیاتي جریان مدیریتوي.

## 5. د وړاندیز ژوندپناه (lifecycle)

| څخه | اجازه شوي `next` حالتونه |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (claim پاشل شو), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | هیڅ (final) |

**د حالتونو د بدلون لپاره مقررات:**

- هر بدلون `version` زیاتوي. لیکوالان `If-Match: <version>` لېږي؛ که سم نه وي نو **409** بیرته ورکوي، او لیکوال بیا یې لولي او هڅه کوي.
- یو غیرقانوني بدلون **409** له اجازه شوي بدلونونو سره بیرته ورکوي.
- وړاندیزونه په `window.to` کې په اتومات ډول `expired` ته ځي.
- ادعاګانې په `pickupBy` او د هغه له اضافي وخت (grace period) سره چې پروګرام یې ټاکي (په بشپړ ډول ۳۰ دقیقې) ختمېږي.

**منصفانه ادعا کول.** په بشپړ ډول، ادعاګانې د هغه لومړیتوب درجې په اساس چې پروګرام یې ټاکي، د لومړی راغلی په اساس دي:
د مثال په ډول، هغه پخلنځي چې لومړی ماشومانو ته خدمت کوي، بیا نور پخلنځي، او بیا food banks. درجې او
هر ډول د گردش قواعد باید د پروګرام په `Manifest` یا ویب پاڼه کې خپرې شي.

## 6. د خوراک خوندیتوب او تغذیه rule packs

یو `RulePack` شپږ ډول قواعد لري:

- `temperature`: یخ شوي ≤ 5 °C، ګرم ساتل شوي ≥ 60 °C، منجمد شوي ≤ −18 °C؛
- `time`: پخ شوي خواړه د تودوخې کنټرول څخه بهر تر ډېر شمېر 2 h؛
- `date_mark`: use-by بلاکونه، best-before خبرداری؛
- `allergen`: غیر اعلان شوي allergen بلاک؛
- `nutrient`: په هر کس-ورځ یا په هر خواړه کې مقدارونه؛
- `energy_share`: د وړیا شکر، غوښې، saturated fat، trans fat یا protein څخه د انرژۍ برخه.

هر قانون یا `block` دی (مه 받아 او خدمت مه کوئ) یا `warn` دی (اجازه ورکړل شوې، د یوې موندنې په توګه ثبت شوې).

د پټ (default) پېک `who-codex-basic@0.1.0` یو **د عامه لارښوونو څخه اخیستل شوی مسودوي (draft derived from public guidance)** دی: د WHO healthy-diet، sodium، sugars او fats لارښوونه، د WHO Five Keys to Safer Food، د Codex labelling او frozen-food codes، او د Sphere لږ تر لږه د راشن پلان کولو ارقام. دا ساده شوی دی، طبي مشوره نه ده، د شتاسو او درملic تغذیه (therapeutic feeding) څخه ایستل شوی، او باید د وړتیا لرونکو کارمندانو لخوا بیاکتنه شي. پروګرامونه باید یې کاپي او تطبیق کړي، `jurisdiction` وټاکي، او دا چې څوک یې بیاکتنه کړې ده په `reviewedBy` کې ثبت کړي.

په H2 کچې کې ترلاسه کونکي (Receivers) هر تسلیم (handover) او په هر مینو (menu) کې pack چلوي، او rule ids په `findings` کې ثبتوي. مرجع چک کول (reference checker) راپور ورکوي چې چیرته اعلان شوي او محاسبه شوي findings سره اختلاف لري.

## ۷. د معلوماتو ساتنه

**پروفایل هیڅ شخصي معلومات نه لري. اسناد باید شامل دې وي:**

- د هر شخص نومونه، د تلیفون شمیره، ایمیلونه، یا ملي، پناهګر یا بیومیټریک پیژندونکي؛
- د کورنۍ کچې ریکارډونه، یا د کورونو یا了个تنونو ځایونه؛
- د هر شخص روغتیا، معلولیت، دین یا مليت.

**د بدل کې څه وړي:**

- **یوازې سازمانونه.** هر لوری یو سازمان دی چې د `did:web`، یو GS1
  Global Location Number (GLN) یا د registry id له لارې پیژندل کیږي. خلک یوازې د رولونو په توګه ښکاري
  (`checkedBy: "trained_staff"`).
- **یوازې مجموعې.** `Distribution.people` د ګروپونو په اساس شمېرې ساتي، او هر شمېر چې تر 10 لاندې وي
  د `"<10"` په توګه راپور کیږي.
- **یوازې سایټونه.** یو `Site` د یو سازمان ځای یا اداري سیمه ده
  (OCHA P-codes)، هیڅکله کورنۍ نه ده.
- **لنډ یادښتونه.** وړیا متن محدود به 280-character عملیاتي یادښتونو ته وي او باید
  شخصي معلومات ونه لري. پلي کونکي باید یادښتونه د فون نمبرونو او ids لپاره وګوري
  مخکې له دې چې هغه خوندي کړي.

**سات پاتې کول او audit:**

- **Retention:** هر ګډونوال په خپل `Manifest` کې `retentionDays` اعلانوي او ورپسې اسناد مني.
- **Audit (اختیاري، `hash_only`):** د هر پروګرام لپاره یو sequencer (معمولاً food bank یا پروګرام اپریټر) د هر اسنادس RFC 8785 canonical JSON SHA-256 hash اضافه کوي. منځپانګه په جلا ډول ذخیره کیږي او د منلو وړ (deletable) پاتې کیږي. یو شریک سازمان هره ورځ یو checkpoint باندې لاسلیک کوي، ترڅو تاریخ په پټه بیا ولیکل نشي. یو واحد sequencer په链 کې forks مخنیوی کوي.
- **Hosting** باید په هغه هیواد کې وي چې قانون یا پروګرام یې غوښتنه کوي.

## 8. ټرانسپورټ

### 8.1 API (level H1)

| طریقه | لاره | یادښتونه |
|---|---|---|
| `POST` | `/offers` | یو وړاندیز جوړوي (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | نږدې ترلاسه کوونکي ته وړاندیزونه خلاصوي |
| `POST` | `/offers/{id}/claims` | یو وړاندیز ادعا کوي؛ `If-Match` ته اړتیا ده؛ کله چې لا دمخه ادعا شوی وي نو 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` ته اړتیا ده |
| `POST` | `/handovers` | یو سپارل (handover) ثبتوي |
| `POST` | `/distributions` | یو وېش (distribution) ثبتوي |
| `GET` | `/reports?from=…&to=…` | د یوې دورې لپاره راټولوي |

د غوښتنه او لېږدولو قواعد:

- **Idempotency:** هر `POST` یو `Idempotency-Key` لري. سرورونه لږترلږه د 24 h لپاره کلیدونه ساتي او د تکرارونو لپاره اصلي ځواب بیرته ورکوي.
- **Authentication:** OAuth 2.1 client credentials، هر سازمان لپاره یو klient.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  لږترلږه یو ځل وړاندې کیږي، چې د ډیډیوپلیکیشن (deduplication) لپاره یې یو ایونټ `id` او د ترتیب لپاره د هر وړاندیز لپاره یو تسلسل شمېره لري.

### 8.2 سپریډشټونه (level H0)

په `profiles/humanitarian/templates/` کې د CSV لارښودونو (templates) څخه کار واخلئ. د هغوی دوهم سڕ (row) [HXL](https://hxlstandard.org) هیشټګونه لري، ترڅو بشري مرستې ورکولو ته اړوند د ډیټا وسیلې په مستقیم ډول هغه لوستلی شي.

### 8.3 SMS (level H0)

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

ګرامر په `tools/cookwala_ref.py` (`parse_sms`) کې پلي شوی دی او د `conformance/profiles/sms.json` لخوا ازمویل شوی دی. کلیدي کلمې انګلیسي دي؛ عربي-اندیک (٠-٩) او فارسي (۰-۹) رقمونه هر هغه ځای چې رقم وي مني کیږي، نو که تلیفون په هر یو کیبورډ سیټ شوی وي کار کوي.

د ذخیره کولو کوډونه: `A` ambient، `C` chilled، `F` frozen، `H` hot-held. د تاریخ نښې: `UB` use-by،
`BB` best-before، `HV` harvested، د `DDMM` په ډول. د ردولو دلیل کوډونه: `TEMP` temp_out_of_range،
`DATE` past_use_by، `PACK` packaging_damaged، `ALLERG` allergen_unlabelled، `QTY`
quantity_mismatch، `PEST` pests_or_contamination، `SPACE` no_capacity، `TRANSPORT`
no_transport، `LATE` arrived_late، `OTHER`; هر بل لفظ د `other` په توګه ثبتېږي. `HELP`
ځواب باید په هر کمانډ لپاره یوه نمونه وي، ساده ASCII، او له 160 کرښو لاندې وي.

یو ګېټ وې (gateway) باید مخکې له دې چې کومه سند ولیکي، دا تपाوتونه پلي کړي (`sms_storage_findings` په
refrence کې؛ ids د block findings دي):

| موندنه | کله |
|---|---|
| `safety.temp_not_recorded` | یو `HAND` په یو یخ، منجمد یا ګرم شوي لاین کې هیڅ `T` لوستنه نه لري: ځواب ورکړئ چې هغه یې غواړي، هیڅ درېنه مه لیکئ |
| `safety.hot_hold_min` | یو `OFFER` چې د ذخیره کولو `H` یې له 60 °C څخه لاندې وي: د لیست کولو څخه انکار وکړئ |
| `safety.storage_class_mismatch` | د توکي کلمې د شیدې، غوښې، مرغۍ، مچۍ، هګۍ یا پخ شوي خوراک ته اشاره کوي او ذخیره `A` ده: د لیست کولو څخه انکار وکړئ |
| `safety.chilled_max`, `safety.frozen_max` | په `OFFER` یا سپارلو کې له 5 °C څخه پورته یا له −18 °C څخه پورته لوستنې |

د ګرمې پرېښودل شوي خوړو وړاندیزونه له دوو ساعتونو وروسته بندېږي (پخ شوی وریژې لپاره یو ساعت)؛ یو gateway هیڅکله placeholder reading ذخیره نه کوي. gateway په اسناد کې د لیږونکي ثبت شوی نمبر یو سازمان ته نښلوي، هیڅکله یو شخص ته نه.

## 9. Interoperability

| سیسټم | मॅپینګ |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (پروډکټونه); `Site.gln` او `OrgId` `gln:` (ځایونه) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | د `Distribution` څخه په هر ځای او دورې کې ټولیز معلومات (meals، په ګروپ کې خلک، kg، incidents) |
| WFP SCOPE او نورې ګټه اخیستونکو ته اړوند سیسټمونه | **یوازې Aggregates.** هیڅ ګټه اخیستونکي ریکارډونه دې پروفایل ته نه ننوځي او نه ترې بهر ځي |
| Food-rescue apps | Adapters د هغوی لیستونه `Offer` ته او د هغوی pickups `Claim` او `Handover` ته मॅپ کوي |
| Core Cookwala | `Item.ingredientId` او `menu.recipes` د recipe index سره تړل کېږي؛ `relief.ImpactReport` ټول `Distribution`s جمع کوي |

## ۱۰. پایلوټ میټریکونه (داسې تعریف شوي چې سایټونه له امله سره پرتله کېدای شي)

د `python tools/humanitarian_check.py --summary DIR` لخوا په `ImpactSummary` کې محاسبه شوی. یو پایلوټ څنګه چلول او ارزول کیږي: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| میتریک (Metric) | تعریف (Definition) |
|---|---|
| Kg rescued | د ډانورانو څخه په لومړۍ مرحله کې د `Handover.kgAccepted` مجموع |
| Claim rate | هغه وړاندیزونه چې `claimed` ته رسیږي ÷ جوړ شوي وړاندیزونه |
| Time to claim | د `Offer` د جوړېدو څخه تر `claimed` حالت پورې منځ کې اوسط دقیقې |
| Rejection by reason | د `reason` له مخې د `kgRejected` مجموع |
| Meals served | د `Distribution.meals` مجموع |
| Nutrition pass rate | هغه ویشونه چې مینو لري او `nutrition.*` موندنې یې نشته ÷ هغه ویشونه چې مینو لري |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | د `safety.*` بلاک موندنو شمېر، او `safetyIncidents` |

## ۱۱. امنیت

- **بڼې په H1 کې اختیاري دي** او په H3 کې د سازمانونو ترمنځ د audit لپاره اړین دي
  (EdDSA، کلیدونه چې په سازمان کې `did:web` کې خپر شوي دي).
- **په اسنادو کې یادښتونه او نومونه غیر معتبر معلومات دي.** سافټویر او AI ایجنټ باید هیڅکله
  د دوی سره د لارښوونو په توګه چلند ونهකړي.
- **Rule packs نسخه شوي او پinned دي** (`id@version`) په هر موندنې کې، ترڅو پایلې
  د بیا جوړولو وړ وي.

## ۱۲. په قصدي ډول پرېښودل شوی

- ګټه اخیستونکي ثبت، وړتیا او هدف نیول (دا د پروګرام د خپلو خوندي سیسټمونو پورې اړه لري).
- تادیات: Cookwala هیڅکله پیسې نه لیږدوي.
- ترکیبونه او روبوټ execution (اصلي مشخصات). پروفایل یوازې ترکیبونه نوموي او مغذی عناصر راپور کوي.
- طبي او درملic تغذیه.

## ۱۳. څنګه بیاکتنه وکړو

مهرباني وکړئ په [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) کې `humanitarian` لیبل سره ستونزې (issues) خلاص کړئ. دا بیاکتنې تر ټولو ګټور دي:

- د خوراک خوندیتوب کارکوونکي rule pack او د رد کېدو لاملونه څیړي؛
- د food-bank عملیالکاران lifecycle او SMS flow څیړي؛
- د ډیټا خوندي کولو افسران برخه ۷ څیړي.

