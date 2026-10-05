<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala انسانی ہمدردی کا پروفائل (ڈرافٹ 0.2)

**Status:** food banks، relief programs اور food-safety and nutrition professionals کے جائزے کے لیے ڈرافٹ ہے۔ اس کا WFP، WHO، FAO، Global FoodBanking Network یا یہاں نامزد کسی دوسری تنظیم کی طرف سے جائزہ نہیں لیا گیا اور نہ ہی اس کی توثیق کی گئی ہے۔

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (تمام)، [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json)، [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json)، [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; تمام ڈرافٹس پیشہ ورانہ نظرثانی کے منتظر ہیں، دیکھیں [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (قاہرہ میں food bank، اسکول کے کھانے، ڈیزاسٹر کچن، روبوٹ کچن)، ہر ایک کے ساتھ ایک محسوب شدہ `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet اور SMS ٹیمپلیٹس: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 کیا اضافہ کرتا ہے (RFC-0003, RFC-0004)

0.1 سے زیادہ کا اضافہ؛ قارئین دونوں کو قبول کرتے ہیں۔

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) اور `Item.harvestedAt`; کردار `farm`, `caterer`, `robot_kitchen`; SMS لفظ `FARM`۔
- **Care rules:** `Item.foodClasses` اور `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), رول کی قسم `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; تین نئے ڈرافٹ پیکس۔
- **Reviews:** `RulePack.reviews` ہر ریویو کے پیشہ، تنظیم، تاریخ، دائرہ کار اور نتیجے کو ریکارڈ کرتا ہے؛ `status: reviewed` کے لیے ایک منظور شدہ ریویو کی ضرورت ہوتی ہے۔
- **Impact:** نو پیمانوں کے ساتھ `ImpactSummary`, جس میں سے ہر ایک میں `method` (measured, modelled, assumed, not recorded) شامل ہے، جو `tools/humanitarian_check.py --summary` کے ذریعے کمپیوٹ کیا جاتا ہے۔
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` تاکہ بچائے گئے کلوگرام ایک ہی بار گنے جائیں۔
- **Program types** `Manifest` پر۔

## 1. مقصد

Cookwala کا ایک چھوٹا، سخت، ذاتی ڈیٹا سے پاک حصہ ان تنظیموں کے لیے جو لوگوں کو کھانا کھلاتی ہیں:
food banks، کمیونٹی کچن، اسکول کے کھانے کے پروگرام، ریلیف پروگرام، عطیہ دہندگان (grocers،
restaurants، farms، caterers)، ٹرانسپورٹرز اور cold stores۔ یہ چار کاموں کا احاطہ کرتا ہے:

1. **surplus food کی پیشکش** کرنا اور اس کا دعویٰ کرنا، تیزی سے اور منصفانہ طریقے سے۔
2. **حفاظت کی ہر handover کی ریکارڈنگ** کرنا، درجہ حرارت کی جانچ (cold-chain check) کے ساتھ۔
3. **جو پیش کیا گیا اس کی رپورٹنگ** صرف مجموعی تعداد (aggregate counts) کے طور پر۔
4. **مینو اور handovers کی جانچ** مشین کے قابل پڑھنے والے غذائیت اور food-safety rules کے مطابق۔

**یہ روبوٹس، ایپس یا انٹرنیٹ کے بغیر کام کرتا ہے۔** لیولز H0 اور H1 اسپریڈ شیٹس، SMS اور بنیادی فونز پر چلتے ہیں۔ روبوٹس، hubs اور ایجنٹس انہی دستاویزات کے اختیاری صارفین ہیں۔

## 2. اصول

- **نقصان نہ پہنچائیں۔** ایسی کوئی چیز جمع نہ کریں جو کسی شخص یا household کی شناخت، مقام یا پروفائل کر سکے۔ نازک حالات میں، beneficiaries کے بارے میں ڈیٹا تحفظ کا خطرہ ہے۔
- **انسانی ہمدردی کے اصول** (انسانیت، غیر جانبداری، غیر تعصب، آزادی): امداد پر کوئی تجارتی برانڈنگ نہیں، اور مارکیٹنگ کے لیے ڈیٹا کا کوئی استعمال نہیں۔
- **سخت اور مختصر۔** ہر object نامعلوم fields کو مسترد کر دیتا ہے (سوائے `x-` extensions کے)، اس لیے typos اور اضافی personal fields validation میں ناکام ہو جاتے ہیں۔
- **درست units:** kilograms، degrees Celsius، absolute tolerances، اور رقم decimal strings کے طور پر۔
- **مقامی rules جیتتے ہیں۔** Rule packs کو قومی food-safety اور عطیہ کے قانون سے تبدیل کیا جا سکتا ہے۔
- **کھلا:** royalty-free spec، open-source tools۔ پروفائل کو Digital Public Goods Standard اور Principles for Digital Development کو پورا کرنے کے لیے ڈیزائن کیا گیا ہے۔

## 3. Conformance levels

| سطح | ایک شریک کیا کرتا ہے | ضروریات |
|---|---|---|
| **H0 — Paper & SMS** | CSV templates (HXL hashtag rows کے ساتھ) میں یا SMS (section 8.3) کے ذریعے پیشکش، ہینڈ اوور اور تقسیم کا ریکارڈ رکھتا ہے | ایک spreadsheet یا ایک بنیادی فون |
| **H1 — Rescue** | API کے ذریعے `Offer`, `Claim`, `Handover` اور `Distribution` دستاویزات کا تبادلہ کرتا ہے؛ state machine (section 5) پر عمل کرتا ہے | کوئی بھی HTTP client |
| **H2 — Safety & nutrition** | ہر handover اور مینو پر `RulePack` لاگو کرتا ہے، اور `findings` کا ریکارڈ رکھتا ہے | reference checker یا اس کے مساوی |
| **H3 — Interoperability** | aggregates کو HXL، DHIS2 اور بنیادی Cookwala `ImpactReport` میں ایکسپورٹ کرتا ہے؛ GS1 identifiers استعمال کرتا ہے | Integration work |

ایک شریک `/.well-known/cookwala-humanitarian.json` پر ایک `Manifest` شائع کرتا ہے جو اپنے levels، rule packs، endpoints اور `personalData: "none"` کا اعلان کرتا ہے۔

## 4. دستاویزات

| دستاویز | کون لکھتا ہے | مقصد |
|---|---|---|
| `Offer` | Donor | جمع کرنے کے لیے دستیاب surplus food: اشیاء (kg, storage, date marks, allergens), window, site, temperatures |
| `Claim` | Food bank, kitchen, program | ایک offer کے تمام یا کچھ حصے کا دعویٰ، pickup time اور vehicle type کے ساتھ |
| `Handover` | Receiver of custody | ہر leg کے لیے ایک: temperatures, kg accepted یا rejected ایک reason code کے ساتھ، اور rule findings |
| `Distribution` | Kitchen, food bank, school | ایک دن میں ایک site پر فراہم کردہ meals اور لوگوں کا مجموعہ؛ اختیاری menu nutrients اور costs |
| `RulePack` | Program یا authority | ورژن شدہ nutrition اور food-safety rules (section 6) |
| `Manifest` | ہر participant | Capabilities اور data-protection declaration |

بنیادی Cookwala ریلیف دستاویزات (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) منصوبہ بندی کے لیے دستیاب ہیں۔ یہ پروفائل
آپریشنل فلو کو سنبھالتا ہے۔

## 5. پیشکش کا لائف سائیکل (Offer lifecycle)

| From | Allowed next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**حالت کی تبدیلیوں کے لیے قواعد:**

- ہر تبدیلی `version` میں اضافہ کرتی ہے۔ مصنفین `If-Match: <version>` بھیجتے ہیں؛ غلط مماثلت (mismatch) پر **409** واپس آتا ہے، اور مصنف دوبارہ پڑھتا ہے اور دوبارہ کوشش کرتا ہے۔
- ایک غیر قانونی تبدیلی (illegal transition) اجازت یافتہ تبدیلیوں کے ساتھ **409** واپس کرتی ہے۔
- پیشکشیں (Offers) خود بخود `window.to` پر `expired` ہو جاتی ہیں۔
- دعوے (Claims) `pickupBy` کے ساتھ پروگرام کے ذریعے مقرر کردہ رعایت کی مدت (ڈیفالٹ 30 minutes) کے بعد ختم ہو جاتے ہیں۔

**منصفانہ دعویٰ۔** ڈیفالٹ کے طور پر، دعوے پروگرام کے ذریعے مقرر کردہ ترجیحی درجے (priority tier) کے اندر پہلے آنے والے کے حق میں ہوتے ہیں:
مثال کے طور پر، وہ کچن جو پہلے بچوں کو خدمات فراہم کرتے ہیں، پھر دیگر کچن، پھر food bank۔ درجے اور
کوئی بھی گردش کے اصول (rotation rules) پروگرام کے `Manifest` یا ویب سائٹ میں شائع کیے جانے چاہئیں۔

## 6. Food safety اور nutrition rule packs

ایک `RulePack` چھ قسم کے قوانین رکھتا ہے:

- `temperature`: ٹھنڈا ≤ 5 °C، گرم رکھا ہوا ≥ 60 °C، منجمد ≤ −18 °C؛
- `time`: پکا ہوا کھانا زیادہ سے زیادہ 2 h کے لیے درجہ حرارت کے کنٹرول سے باہر؛
- `date_mark`: use-by بلاک کرتا ہے، best-before خبردار کرتا ہے؛
- `allergen`: غیر اعلانیہ allergens بلاک کرتا ہے؛
- `nutrient`: فی شخص-دن یا فی کھانا مقدار؛
- `energy_share`: free sugars، fat، saturated fat، trans fat یا protein سے توانائی کا حصہ۔

ہر قاعدہ یا تو `block` (قبول نہ کریں یا فراہم نہ کریں) ہے یا `warn` (اجازت ہے، ایک finding کے طور پر ریکارڈ کیا گیا) ہے۔

ڈیفالٹ پیک `who-codex-basic@0.1.0` ایک **public guidance سے اخذ کردہ ڈرافٹ ہے**: WHO کی
healthy-diet, sodium, sugars اور fats guidance، WHO کے Five Keys to Safer Food، Codex
labelling اور frozen-food codes، اور Sphere کے minimum ration planning figures۔ یہ
سادہ کیا گیا ہے، طبی مشورہ نہیں ہے، اس میں شیر خوار بچوں اور therapeutic feeding کو شامل نہیں کیا گیا، اور اسے اہل عملے کے ذریعے نظرثانی کی جانی چاہیے۔ پروگراموں کو اسے کاپی اور ایڈاپٹ کرنا چاہیے، `jurisdiction` سیٹ کرنا چاہیے، اور `reviewedBy` میں ریکارڈ کرنا چاہیے کہ کس نے اس کی نظرثانی کی۔

لیول H2 پر موجود Receivers ہر handover اور ہر menu پر pack کو چلاتے ہیں، اور rule ids کو `findings` میں ریکارڈ کرتے ہیں۔ reference checker اس جگہ رپورٹ کرتا ہے جہاں declared اور computed findings میں اختلاف ہو۔

## 7. ڈیٹا پروٹیکشن

**پروفائل میں کوئی ذاتی ڈیٹا نہیں ہے۔ دستاویزات میں درج ذیل چیزیں نہیں ہونی چاہئیں:**

- کسی بھی شخص کے نام، فون نمبر، ای میلز، یا قومی، پناہ گزین یا بائیومیٹرک شناختی معلومات؛
- گھریلو سطح کے ریکارڈز، یا گھروں یا افراد کے مقامات؛
- کسی بھی شخص کی صحت، معذوری، مذہب یا قومیت۔

**اس کے بجائے یہ کیا لے کر آتا ہے:**

- **صرف تنظیمات۔** ہر فریق ایک تنظیم ہے جس کی شناخت `did:web`، ایک GS1
  Global Location Number (GLN) یا ایک registry id سے ہوتی ہے۔ لوگ صرف کرداروں کے طور پر ظاہر ہوتے ہیں
  (`checkedBy: "trained_staff"`)۔
- **صرف مجموعات۔** `Distribution.people` گروپ کے لحاظ سے تعداد رکھتا ہے، اور 10 سے کم کوئی بھی تعداد
  `"<10"` کے طور پر رپورٹ کی جاتی ہے۔
- **صرف سائٹس۔** ایک `Site` کسی تنظیم کے احاطے یا انتظامی علاقے
  (OCHA P-codes) کو کہتے ہیں، کبھی بھی household نہیں ہوتا۔
- **مختصر نوٹ۔** آزاد متن 280-کردار کے آپریشنل نوٹ تک محدود ہے اور اس میں ذاتی ڈیٹا
  نہیں ہونا چاہیے۔ امپلیمنٹیشنز کو اسٹور کرنے سے پہلے نوٹوں میں فون نمبرز اور ids کو اسکین کرنا چاہیے۔

**Retention and audit:**

- **Retention:** ہر شریک `retentionDays` کو اپنے `Manifest` میں اعادہ کرتا ہے اور اس کے بعد دستاویزات حذف کر دیتا ہے۔
- **Audit (optional, `hash_only`):** ہر پروگرام کے لیے ایک sequencer (عام طور پر food bank یا program operator) ہر دستاویز کے RFC 8785 canonical JSON کا SHA-256 hash شامل کرتا ہے۔ مواد علیحدہ سے محفوظ کیا جاتا ہے اور حذف کرنے کے قابل رہتا ہے۔ ایک پارٹنر تنظیم ہر دن ایک checkpoint پر counter-sign کرتی ہے، تاکہ تاریخ کو خاموشی سے دوبارہ نہیں لکھا جا سکتا۔ ایک واحد sequencer chain میں forks سے بچاتا ہے۔
- **Hosting** اسی ملک میں ہونی چاہیے جہاں قانون یا پروگرام اس کا تقاضا کرتا ہے۔

## 8. Transport

### 8.1 API (level H1)

| طریقہ | راستہ | نوٹ |
|---|---|---|
| `POST` | `/offers` | ایک پیشکش بناتا ہے (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | وصول کنندہ کے قریب کھلی پیشکشیں |
| `POST` | `/offers/{id}/claims` | ایک پیشکش کا دعویٰ کرتا ہے؛ `If-Match` ضروری ہے؛ جب پہلے سے دعویٰ کیا جا چکا ہو تو 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` ضروری ہے |
| `POST` | `/handovers` | ہینڈ اوور ریکارڈ کرتا ہے |
| `POST` | `/distributions` | تقسیم ریکارڈ کرتا ہے |
| `GET` | `/reports?from=…&to=…` | ایک مدت کے لیے مجموعہ |

درخواست اور ٹرانسپورٹ کے اصول:

- **Idempotency:** ہر `POST` ایک `Idempotency-Key` لے کر آتا ہے۔ سرورز کم از کم 24 h کے لیے keys رکھتے ہیں اور تکرار کے لیے اصل رسپانس واپس کرتے ہیں۔
- **Authentication:** OAuth 2.1 client credentials، فی تنظیم ایک کلائنٹ۔
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  کم از کم ایک بار فراہم کیے جاتے ہیں، جس میں deduplication کے لیے ایک ایونٹ `id` اور ترتیب کے لیے فی-offer ایک sequence number ہوتا ہے۔

### 8.2 Spreadsheets (level H0)

`profiles/humanitarian/templates/` میں موجود CSV templates استعمال کریں۔ ان کی دوسری قطار میں
[HXL](https://hxlstandard.org) hashtags ہوتے ہیں، تاکہ humanitarian data tools انہیں براہ راست پڑھ سکیں۔

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

گرامر کو `tools/cookwala_ref.py` (`parse_sms`) میں نافذ کیا گیا ہے اور اسے
`conformance/profiles/sms.json` کے ذریعے ٹیسٹ کیا گیا ہے۔ کلیدی الفاظ (Keywords) انگریزی ہیں؛ جہاں بھی ہندسہ ہو وہاں عربی-ہند (٠-٩) اور فارسی (۰-۹) ہندسے قبول کیے جاتے ہیں، لہذا ایسا فون جو کسی بھی کی بورڈ پر سیٹ ہو وہ کام کرے گا۔

اسٹوریج کوڈز: `A` ambient، `C` chilled، `F` frozen، `H` hot-held۔ تاریخ کے نشانات: `UB` use-by،
`BB` best-before، `HV` harvested، بطور `DDMM`۔ مسترد کرنے کی وجہ کے کوڈز: `TEMP` temp_out_of_range،
`DATE` past_use_by، `PACK` packaging_damaged، `ALLERG` allergen_unlabelled، `QTY`
quantity_mismatch، `PEST` pests_or_contamination، `SPACE` no_capacity، `TRANSPORT`
no_transport، `LATE` arrived_late، `OTHER`؛ کوئی بھی دوسرا لفظ `other` کے طور پر ریکارڈ کیا جاتا ہے۔ `HELP`
جواب ہر کمانڈ کے لیے ایک مثال، سادہ ASCII، 160 حروف سے کم ہونا MUST ہے۔

ایک گیٹ وے کو دستاویز لکھنے سے پہلے یہ چیک لاگو کرنا MUST ہے (`sms_storage_findings` ریفرنس میں؛ ids بلاک findings ہیں):

| نتیجہ | کب |
|---|---|
| `safety.temp_not_recorded` | ایک ٹھنڈی، جمی ہوئی یا گرم رکھی گئی لائن پر `HAND` کا کوئی `T` ریڈنگ نہیں ہے: اسے مانگتے ہوئے جواب دیں، کچھ نہ لکھیں |
| `safety.hot_hold_min` | 60 °C سے نیچے اسٹوریج `H` کے ساتھ ایک `OFFER`: اسے فہرست میں شامل کرنے سے انکار کریں |
| `safety.storage_class_mismatch` | آئٹم کے الفاظ ڈیری، گوشت، مرغی، مچھلی، انڈے یا پکے ہوئے کھانے کا اشارہ دیتے ہیں اور اسٹوریج `A` ہے: اسے فہرست میں شامل کرنے سے انکار کریں |
| `safety.chilled_max`, `safety.frozen_max` | پیشکش یا ہینڈ اوور پر 5 °C سے زیادہ یا −18 °C سے زیادہ ریڈنگز |

گرم رکھے ہوئے کھانے کی پیشکش دو گھنٹوں کے بعد ختم ہو جاتی ہے (پکے ہوئے چاول کے لیے ایک گھنٹہ)؛ ایک gateway کبھی بھی placeholder ریڈنگ اسٹور نہیں کرتا۔ gateway بھیجنے والے کے رجسٹرڈ نمبر کو دستاویزات میں کسی تنظیم سے نقشہ بندی کرتا ہے، کسی شخص سے نہیں۔

## 9. Interoperability

| سسٹم | میپنگ |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (پروڈکٹس); `Site.gln` اور `OrgId` `gln:` (لوکیشنز) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | `Distribution` سے ہر سائٹ اور دورانیے کے لیے مجموعی ڈیٹا ویلیوز (meals, people by group, kg, incidents) |
| WFP SCOPE اور دیگر beneficiary systems | **صرف Aggregates۔** کوئی بھی beneficiary records اس پروفائل میں داخل یا باہر نہیں جاتے |
| Food-rescue apps | Adapters ان کی listings کو `Offer` اور ان کے pickups کو `Claim` اور `Handover` سے میپ کرتے ہیں |
| Core Cookwala | `Item.ingredientId` اور `menu.recipes` recipe index سے لنک ہوتے ہیں؛ `relief.ImpactReport` `Distribution`s کا مجموعہ کرتا ہے |

## 10. پائلٹ میٹرکس (اس طرح سے بیان کیے گئے ہیں تاکہ سائٹس کا موازنہ کیا جا سکے)

`python tools/humanitarian_check.py --summary DIR` کے ذریعے ایک `ImpactSummary` میں کمپیوٹ کیا گیا۔ ایک پائلٹ کیسے چلایا اور پرکھا جاتا ہے: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)۔

| میٹرک | تعریف |
|---|---|
| Kg rescued | عطیہ دہندگان سے پہلے مرحلے پر `Handover.kgAccepted` کا مجموعہ |
| Claim rate | `claimed` تک پہنچنے والی پیشکشیں ÷ بنائی گئی پیشکشیں |
| Time to claim | `Offer` کی تخلیق سے `claimed` کی حالت تک کے وسطی منٹ |
| Rejection by reason | `reason` کے ذریعے `kgRejected` کا مجموعہ |
| Meals served | `Distribution.meals` کا مجموعہ |
| Nutrition pass rate | مینو کے ساتھ تقسیم جن میں `nutrition.*` کے نتائج نہ ہوں ÷ مینو کے ساتھ تقسیم |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | `safety.*` بلاک کے نتائج کی تعداد، اور `safetyIncidents` |

## 11. سیکیورٹی

- **H1 پر دستخط اختیاری ہیں** اور H3 پر بین الکلیاتی آڈٹ کے لیے ضروری ہیں
  (EdDSA، کلیدیں تنظیم کے `did:web` پر شائع کی جاتی ہیں)۔
- **دستاویزات میں نوٹس اور نام غیر قابل اعتماد ڈیٹا ہیں۔** سافٹ ویئر اور AI ایجنٹس کو انہیں کبھی بھی
  ہدایات کے طور پر نہیں لینا چاہیے۔
- **Rule packs ورژن شدہ اور پن کیے گئے ہیں** (`id@version`) ہر نتیجے میں، تاکہ نتائج
  reproducible ہوں۔

## 12. جان بوجھ کر چھوڑ دیا گیا

- مستفید کنندگان کی رجسٹریشن، اہلیت اور نشاندہی (یہ پروگرام کے اپنے محفوظ سسٹمز سے تعلق رکھتے ہیں)۔
- ادائیگیاں: Cookwala کبھی رقم منتقل نہیں کرتا۔
- ریسیپیز اور روبوٹ کا execution (بنیادی spec)۔ پروفائل صرف ریسیپیز کا نام لیتا ہے اور غذائی اجزاء کی رپورٹ کرتا ہے۔
- طبی اور علاج کے مقاصد کے لیے غذائیت۔

## 13. جائزہ لینے کا طریقہ کیسے لیں

براہ کرم [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) پر `humanitarian` لیبل کے ساتھ ایشوز (issues) کھولیں۔ یہ ریویوز (reviews) سب سے زیادہ مفید ہیں:

- food-safety عملہ rule pack اور ریجیکٹ وجوہات کی جانچ کر رہا ہے؛
- food-bank آپریٹرز lifecycle اور SMS flow کی جانچ کر رہے ہیں؛
- data-protection افسران سیکشن 7 کی جانچ کر رہے ہیں۔

