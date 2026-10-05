<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. یہ Cookwala کا معیاری حصہ ہے۔ MUST، SHOULD اور MAY RFC 2119 کی پیروی کرتے ہیں۔ جو کچھ یہاں درج نہیں ہے وہ ایک اختیاری **profile** (section 10) ہے۔

ایک ڈیوائس کو تقریباً ایک ہفتے میں Core کو نافذ کرنے کے قابل ہونا چاہیے۔ Core بتاتا ہے کہ **کیا بنانا ہے، کب یہ مکمل ہوتا ہے اور کیا کبھی نہیں ہونا چاہیے**۔ یہ یہ نہیں بتاتا کہ ایک روبوٹ کیسے حرکت کرتا ہے۔

## 1. Conformance classes

| Class | لازمی طور پر نافذ کرنا چاہیے |
|---|---|
| **Recipe publisher** | درست `recipe.schema.json` دستاویزات؛ operation envelopes کے اندر درجہ حرارت؛ ایک hash اور ایک signature |
| **Executor** (robot, appliance or hub) | Core API (`api/core.openapi.yaml`); operation envelopes اور sensor ladders; مقامی حفاظتی حدود; اندازہ لگانے کے بجائے refusal; execution log |
| **Catalog** | دستخط شدہ تراکیب (recipes)، کلیدی ریکارڈز کے ساتھ `/.well-known/cookwala.json`، recall feed، حادثات کی وصولی (incident intake) |
| **Agent** (AI or software acting for a person) | صرف `AgentMandate` کے تحت عمل کرتا ہے؛ دستاویز کے متن کو ڈیٹا کے طور پر لیتا ہے; `confirmBefore` میں کسی بھی چیز سے پہلے اصل شخص (principal) سے پوچھتا ہے |
| **Verifier** | Hashes، signatures، کلیدی حیثیت اور منسوخی (revocation)، انکشافات (disclosures)، ایونٹ زنجیریں (event chains) اور چیک پوائنٹس |

ایک کلاس کا دعویٰ کرنے کا مطلب ہے اس کے conformance vectors (`conformance/`, run with
`tools/run_conformance.py`) کو پاس کرنا۔

## 2. بنیادی دستاویزات

| دستاویز | اسکیما |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

تمام schemas **strict** ہیں: نامعلوم fields مسترد کر دیے جاتے ہیں، سوائے `x-<vendor>-…` extensions کے۔
Readers ان `x-` fields کو نظر انداز کر دیتے ہیں جنہیں وہ نہیں سمجھتے۔ `tools/bundle_schemas.py` ایک واحد bundle تیار کرتا ہے تاکہ devices offline تصدیق کر سکیں۔ Implementations کو run time پر schemas fetch نہیں کرنے چاہئیں۔

## 3. آپریشنز کا کیا مطلب ہے

- **Envelopes.** `vocab/ops.json` میں ہر حرارت پر مبنی یا خطرناک operation کا ایک `envelope` ہوتا ہے۔
  یہ درج ذیل کی وضاحت کرتا ہے:
  - میڈیم (پانی، تیل، ہوا، pan surface، پروڈکٹ…);
  - °C میں اس کا temperature band (اور پریشر، pressure cooking کے لیے);
  - agitation، ڈھکن، توجہ کا لیول اور آیا یہ مرحلہ بغیر نگرانی کے چل سکتا ہے;
  - خطرات;
  - ایک ٹیسٹ میتھڈ۔

`cw.op.simmer` = 85–96 °C پر پانی پر مبنی مائع؛ `cw.op.deep_fry` = 160–190 °C پر تیل۔
- **envelopes کے اندر اہداف۔** ایک ترکیب کا ہدف (`params.tempC` یا میڈیم کے `sensor` پر ایک `target`) لازمی طور پر envelope کے اندر ہونا چاہیے۔ ویلیڈیٹر ان ترکیبوں کو مسترد کر دیتا ہے جو اس کی خلاف ورزی کرتی ہیں۔
- **Executors میڈیم کو envelope کے اندر رکھتے ہیں۔** اگر ترکیب ایک تنگ تر ہدف دیتی ہے، تو وہ اسے بھی اس کے اندر رکھتے ہیں، ایک بار جب وہ پہلی بار حاصل ہو جائے۔
- **Altitude۔** کچن کی altitude کے ہر 300 m پر پانی اور بھاپ کے بینڈز −1 °C سے منتقل ہوتے ہیں۔
- **Heat levels** (`very_low` … `max`) کا ایک مشترکہ مطلب ہے: °C میں ایک پین کی سطح کا بینڈ، جو `vocab/units.json` میں بیان کیا گیا ہے۔
- **Sensor ladder۔** ہر envelope مرحلے کی تصدیق کے طریقے فہرست میں درج کرتا ہے، سب سے بہتر پہلے: ایک مخصوص sensor، پھر `model` (ایک logged estimate)، پھر `time`, پھر `human`۔
  - Executor اس پہلے درجے (rung) کو استعمال کرتا ہے جسے وہ پورا کر سکتا ہے اور اسے `verifiedBy` میں ریکارڈ کرتا ہے۔
  - اگر وہ **کوئی** بھی درجہ پورا نہیں کر سکتا، تو اسے مرحلے کو منع کرنا (refuse) ہوگا (`missing_sensor_no_fallback`)۔
  - وہ آپریشنز جنہیں مسلسل توجہ کی ضرورت ہوتی ہے اور جو بغیر نگرانی کے نہیں چل سکتے (sautéing, searing, frying, reducing, caramelizing…) کبھی بھی صرف time پر انحصار نہیں کرتے: ان کا آخری درجہ ایک دیکھ بھال کرنے والا شخص ہے۔
  - Deep frying کا کوئی fallback نہیں ہے: تیل کے درجہ حرارت کے sensor نہ ہونے کا مطلب ہے کوئی deep frying نہیں۔
  - ایک `Condition` اسے `onSensorMissing` کے ذریعے محدود کر سکتا ہے۔
- **Refusal، اندازہ لگانا نہیں۔** ایک executor جو کسی مرحلے کے envelope، ladder، سامان یا حفاظتی حدود کو پورا نہیں کر سکتا، اسے شروع کرنے سے پہلے ایک وجہ کے ساتھ `refused` کا جواب دینا ہوگا۔

## 4. Numbers and units

- **تھرمل ویلیوز وائر پر °C ہیں۔** ڈسپلے تبدیل کر سکتے ہیں۔
- **Tolerances۔**
  - `tolerance` متعلقہ ہے اور صرف ratio-scale units پر ہی جائز ہے۔
  - `toleranceAbs` ویلیو کی یونٹ میں مطلق ہے، اور °C پر صرف یہی tolerance جائز ہے۔
  - `Target.tolerance` مطلق ہے۔
- **کچن کی یونٹس کی میٹرک ویلیوز بالکل درست ہیں:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ mass کے لیے density کی ضرورت ہے** (`Quantity.densityGPerMl`, یا ingredient vocabulary)؛
  اس کے بغیر یہ ایک error ہے، کبھی بھی guess نہیں ہو سکتا۔
- **رقم ایک decimal string ہے** (`"12.70"`) ایک ISO 4217 currency کے ساتھ، کبھی بھی float نہیں ہو سکتی۔

## 5. سالمیت اور اعتماد

- **Hash.** `sha256:` کے ساتھ دستاویز کے RFC 8785 canonical JSON کا hex digest،
  بغیر اس کے `hash` اور `signature` فیلڈز کے۔ ریفرنس canonicalizer RFC
  8785 کی مثال کو بالکل ویسے ہی دوبارہ تیار کرتا ہے۔
- **Signature.** ASCII hash string پر Ed25519 (`EdDSA`)۔ P-256
  hardware keys کے لیے `ES256` کی اجازت ہے۔ `kid` ایک `KeyRecord` کا نام بتاتا ہے۔
- **Keys.** ایک `KeyRecord` پبلک کی (public key)، اس کا مالک، ایک میعاد کا دورانیہ (validity window) اور `revokedAt` فراہم کرتا ہے۔
  ایسا دستخط جس کا `signedAt` منسوخی (revocation) کے بعد، یا میعاد کے دورانیے سے باہر ہو، وہ
  ناقابلِ اعتبار (invalid) ہے۔
  - کیٹلاگز اپنی کیز `/.well-known/cookwala.json` میں شائع کرتے ہیں۔
  - تنظیمیں اور لوگ اپنی کیز did:web دستاویزات میں شائع کرتے ہیں۔
  - ڈیوائسز اپنی کیز اپنی capabilities document میں شائع کرتی ہیں۔
  - ویریفائرز آف لائن استعمال کے لیے key records کو کیش (cache) کرتے ہیں۔
- **Selective disclosure.** ایک دستخط شدہ دستاویز ایک حساس ویلیو کے بجائے `Disclosure` digest،
  `sha256(JCS([salt, value]))` رکھ سکتی ہے۔ ہولڈر نمک (salt) اور ویلیو کو صرف ان فریقین کو ظاہر کرتا ہے جنہیں انہیں دیکھنے کی اجازت ہو، اور دستخط پھر بھی تصدیق (verify) ہو جاتا ہے۔
- **Event logs** (Mission profile):
  - فی لاگ ایک سیکوئنسر (sequencer) `seq` اور `prev` تفویض کرتا ہے، تاکہ چین کبھی تقسیم (fork) نہ ہو۔
  - چیک پوائنٹس (Checkpoints) سیکوئنسر کے ذریعے دستخط شدہ ہوتے ہیں اور گواہوں کے ذریعے کاؤنٹر-دستخط شدہ ہوتے ہیں، جن میں IETF SCITT جیسی شفافیت سروس (transparency service) شامل ہو سکتی ہے۔ ایک گواہ شدہ چیک پوائنٹ کے بعد دوبارہ لکھنا (rewrite) قابلِ شناخت ہے۔
  - `hash_only` موڈ میں، پے لوڈز (payloads) مٹائی جانے والی اسٹوریج (erasable storage) میں رہتے ہیں اور لاگ صرف ان کے ہیش (hashes) رکھتا ہے۔

## 6. حفاظت اور ایجنٹ کے اصول (normative)

1. **حفاظت مقامی ہے۔** Executors ڈیوائس پر `SafetyLimits` pack نافذ کرتے ہیں۔
   - کوئی بھی ترکیب، ایجنٹ، ریموٹ پیغام، ایکسٹینشن یا آپریٹنگ موڈ کسی حد (limit) کو بڑھا یا معطل نہیں کر سکتا۔
   - ایک سخت تر حد ہمیشہ جیت جاتی ہے۔
   - `profiles/core/safety-limits.default.json` ایک ڈرافٹ ابتدائی نقطہ ہے جسے ڈیوائس بنانے والے اپنے حفاظتی کیس سے مزید سخت کرتے ہیں۔
2. **مقامی سٹاپ۔** ڈیوائس پر ایک سٹاپ کنٹرول 0.5 s کے اندر حرکت کو روک دیتا ہے اور نیٹ ورک کے ساتھ یا اس کے بغیر 1 s کے اندر حرارت کو کاٹ دیتا ہے۔ ایک بار جب کالر executor تک پہنچ سکے تو `POST …/stop` کو اجازت (authorization) کے لیے کبھی مسترد نہیں کیا جاتا۔
3. **ایونٹس رپورٹ کرتے ہیں؛ وہ کبھی تحفظ فراہم نہیں کرتے۔** `cookwalalatency: local_safety` ایونٹس اس بات کی رپورٹ کرتے ہیں جو ایک ڈیوائس پہلے ہی کر چکی ہے۔ کوئی بھی حفاظتی فنکشن کسی ایونٹ کے آنے پر منحصر نہیں ہو سکتا۔
4. **غیر قابل اعتماد متن۔** ہر فری-ٹیکسٹ فیلڈ (جسے `x-cookwala-untrusted` کے طور پر نشان زد کیا گیا ہو) ڈیٹا ہے اور کبھی بھی ہدایت (instruction) نہیں ہے، سافٹ ویئر اور AI ایجنٹس دونوں کے لیے۔ متن کے ذریعے ہدایت دینے کی کوششوں کو نظر انداز کر دیا جاتا ہے اور لاگ کیا جاتا ہے (`cw.incident.untrusted_instruction`)۔
5. **ایجنٹس ایک mandate کے تحت کام کرتے ہیں۔** ایجنٹ کے ذریعے بھیجی گئی درخواست میں پرنسپل کے دستخط شدہ `AgentMandate` ہوتا ہے: اسکوپس، اخراجات کی حد، اجازت یافتہ فراہم کنندگان، میعاد ختم ہونا، اور وہ اقدامات جن کے لیے تصدیق کی ضرورت ہوتی ہے۔
   - `irreversible` اور `safety_override` کو ہمیشہ تصدیق کی ضرورت ہوتی ہے، چاہے mandate کچھ بھی کہے۔
   - Executors mandate سے باہر کی درخواستوں کو مسترد کرتے ہیں (`mandate_scope`)۔
6. **غیر نگرانی شدہ آپریشنز کے لیے ایک شخص کی ضرورت ہوتی ہے۔** وہ آپریشنز جن کا envelope `unattended: false` کہتا ہے، ان کے لیے ایک ذمہ دار شخص کا موجود ہونا، یا ایک منٹ کے اندر دستیاب ہونا ضروری ہے۔
7. **الرجن بلاکس مسترد کرتے ہیں۔** ترکیب یا انوینٹری میں کوئی بھی بلاک شدہ الرجن درخواست کو مسترد کر دیتا ہے؛ بلاک کے گرد کوئی متبادل نہیں ہوتا۔
8. **Recalls۔** کیٹلاگز `GET /v1/recalls` پر دستخط شدہ recalls شائع کرتے ہیں۔ Executors آن لائن ہونے پر پول کرتے ہیں اور recalled ریویژنز کو مسترد کرتے ہیں۔ `block_and_stop_running` چلنے والی executions کو بھی محفوظ طریقے سے روک دیتا ہے۔
9. **Incident reports** گمنام ہوتی ہیں (`IncidentReport`: صرف تاریخ، کوئی نام یا ids نہیں) اور کیٹلاگز کو جمع کرائی جاتی ہیں تاکہ ہر بنانے والا ہر قریب ترین حادثے (near miss) سے سیکھ سکے۔

## 7. Execution lifecycle اور API

- **API:** `api/core.openapi.yaml`۔ اس کے endpoints ہیں:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog side: `GET /v1/recalls`, `POST /v1/incidents`۔
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` اور `stopping` → راستے میں `stopped`؛
  - `refused` اور `failed` حتمی ہیں۔
  - مکمل transition table `core.schema.json#/$defs/ExecutionState` اور conformance vectors میں ہے۔
- **Request rules:**
  - ہر POST ایک `Idempotency-Key` لے کر چلتا ہے۔
  - موجودہ execution میں تبدیلیوں کے لیے `If-Match: <seq>` ضروری ہے؛ mismatch کی صورت میں 412 واپس آتا ہے۔
  - Stop کے لیے If-Match کی ضرورت نہیں ہے۔
- **Events:**
  - Delivery کم از کم ایک بار (at least once) ہے۔
  - CloudEvents `id` deduplication key ہے۔
  - `cookwalaseq` ہر subject کے مطابق events کی ترتیب دیتا ہے اور status `seq` سے مماثلٹ کرتا ہے۔
  - Devices `cookwala.device.heartbeat` خارج کرتے ہیں، تاکہ ایک hub کھوئے ہوئے device کا پتہ لگا سکے اور hand off کر سکے۔

## 8. رازداری

- **Execution logs میں کوئی ذاتی ڈیٹا نہیں ہوتا** (`privacy.personalData: "none"`).
- **وہ ڈیوائس کو صرف opt-in consent کے ساتھ چھوڑتے ہیں** (`consent.dataset`: ڈیفالٹ کے طور پر `none`,
  `research_only`, یا `open`). Consent واپس لی جا سکتی ہے۔
- **Open datasets وقت کو دن تک coarsens کرتے ہیں۔**
- **Household, صحت اور مذہبی ڈیٹا گھر میں ہی رہتا ہے** جب تک کہ شخص اس کے برعکس انتخاب نہ کرے۔
  جب اسے سفر کرنا ہو، تو یہ selective disclosures کے طور پر سفر کرتا ہے۔
- **The Humanitarian Profile** میں بالکل بھی کوئی ذاتی ڈیٹا نہیں ہوتا۔

## 9. Versioning اور extensions

- **Core versions `0.2.x` ہیں۔**
  - Readers اپنی minor version کا کوئی بھی patch قبول کرتے ہیں۔
  - وہ دیگر minors کو `unsupported_version` کے ساتھ مسترد کرتے ہیں۔
  - وہ نامعلوم `x-` fields کو نظر انداز کرتے ہیں۔
- **New operations, units, sensors اور incident types** کو version change کے بغیر vocabularies میں شامل کیے جاتے ہیں۔
- **کسی operation کا مطلب تبدیل کرنا ایک نیا id ہے؛** پرانے کو `replacedBy` کے ساتھ `deprecated` قرار دیا جاتا ہے۔
- **Profiles** آزادانہ طور پر version کرتے ہیں اور اس Core version کا اعلان کرتے ہیں جس کی انہیں ضرورت ہوتی ہے۔

## 10. پروفائلز اور ان کا status

| پروفائل | اسٹیٹس | نوٹس |
|---|---|---|
| Core (یہ دستاویز) | **draft, normative** | پہلے ڈیوائس امپلیمنٹیشنز کے لیے ہدف |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | کوئی ذاتی ڈیٹا نہیں؛ SMS اور CSV کے ذریعے کام کرتا ہے؛ surplus to plate، اثرات کے خلاصے، care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | مقامی-پہلے household facts؛ صرف derived constraints منتقل ہوتے ہیں (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | ثابت شدہ namespaces، درست ورژنز، tombstones؛ درخواست پر تنظیمیں (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | ہر conformance دعوے کے پیچھے دستخط شدہ رپورٹس (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds اور relays؛ جاری کنندہ کے خلاف تصدیق کریں (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | ریسٹورنٹس، کمیونٹی، اسکول، آفات اور روبوٹ کچن (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | مجموعی، تاخیری، کلاس-لیول ڈیمانڈ اور سپلائی سگنلز؛ مقابلے کے قانون کے جائزے پر پابندی (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | ایونٹ لاگ + پروجیکشن، `profiles/mission/transitions.json` میں عبور |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | پروڈکشن استعمال سے پہلے مقابلے کے قانون کے جائزے کی ضرورت ہے |
| Relief planning (`relief.schema.json`) | experimental | آپریشنل فلو Humanitarian Profile میں منتقل کر دیا گیا ہے |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API حوالہ سطح ہے |

ایک پروفائل اس وقت مستحکم ہو جاتا ہے جب دو آزادانہ امپلیمنٹیشنز اس کے conformance vectors پاس کر لیں
اور اس کے حقیقی صارفین موجود ہوں۔

## 11. Tools

| Tool | یہ کیا کرتا ہے |
|---|---|
| `tools/validate_specs.py` | schemas، examples، recipe semantics (envelopes، op parameters، no template placeholders)، strictness، اور یہ چیک کرتا ہے کہ API references resolve ہوں |
| `tools/run_conformance.py` | `conformance/*.json` اور `conformance/profiles/*.json` کو چلاتا ہے، اور `--report` کے ساتھ ایک ConformanceReport لکھتا ہے: hashing (بشمول RFC 8785 example)، signatures (بشمول RFC 8032 key)، revocation، disclosure، event chains اور checkpoints، units، envelopes، sensor ladders، state machines |
| `tools/cookwala_ref.py` | Reference library اور CLI: `hash`، `verify`، `chain` |
| `tools/make_conformance.py` | vectors کو دوبارہ تیار کرتا ہے (diff کا جائزہ لیں) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack checker اور impact summaries |
| `tools/make_profile_vectors.py` | `conformance/profiles/` میں profile vectors کو دوبارہ تیار کرتا ہے |

## 12. 0.1 سے تبدیلیاں

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Accepted unknown fields | Strict, `x-` extensions کے ساتھ |
| Temperatures | °C یا °F، relative tolerance کی اجازت ہے | صرف °C؛ absolute tolerance |
| Money | Number | Decimal string |
| Operations | Prose definitions | Physical envelopes, sensor ladders, heat levels, test vectors |
| Signatures | Fixed EdDSA, lifecycle کے بغیر keys | EdDSA یا ES256, validity اور revocation کے ساتھ KeyRecords |
| Missions | ایک mutable document, اندر ledger | Event log + projection, single sequencer, witnessed checkpoints, hash-only mode |
| Agents | صرف Missions کے اندر Mandate | common میں `AgentMandate`; agent requests کے لیے مطلوبہ |
| Safety | Recipes میں اعلان کردہ | SafetyLimits کے ذریعے مقامی طور پر بھی نافذ کردہ; recalls; incident reports |
| Data | کوئی dataset model نہیں | Consented, personal-data-free ExecutionLog |
| Conformance | صرف Schema validation | 106 vectors (44 Core, 62 profile) اور ایک reference implementation |

0.1 دستاویز کو منتقل کرنے کے لیے: °F کو °C میں تبدیل کریں؛ درجہ حرارت پر relative tolerances کو `toleranceAbs` سے بدلیں؛ رقم کی مقداروں کو decimal strings میں تبدیل کریں؛ نامعلوم fields کو ہٹا دیں یا انہیں `x-` fields میں تبدیل کر دیں۔

