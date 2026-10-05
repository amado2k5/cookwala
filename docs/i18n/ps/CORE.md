<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. دا د Cookwala معیاري برخه ده. MUST، SHOULD او MAY باید RFC 2119 ته تعقیب کړي. هر هغه څه چې دلته لیست شوي نه دي، یو اختیاري **profile** دی (بخش 10).

یو وسیله باید وکولی شي چې Core په تقریباً یو اونۍ کې پلي کړي. Core وايي **څه جوړ کړي، کله چې کار بشپړ شي او څه باید هیڅکله ونه شي**. دا نه وايي چې یو روبوټ څنګه حرکت کوي.

## ۱. د conformance کلاسي

| کلاسه | باید پلي کړي |
|---|---|
| **Recipe publisher** | 有 `recipe.schema.json` اسناد؛ د operation envelopes دننه درجات؛ یو hash او یو signature |
| **Executor** (روبوټ، وسیله یا hub) | Core API (`api/core.openapi.yaml`); operation envelopes او sensor ladders; ځايي د خوندیتوب محدودیتونه; د اټکل پر ځای refusal; execution log |
| **Catalog** | لاس اخیستل شوي recipes، `/.well-known/cookwala.json` له key records سره، recall feed، incident intake |
| **Agent** (AI یا سافټویر چې د یو شخص په استازیتوب کار کوي) | یوازې د `AgentMandate` لاندې عمل کوي؛ د اسنادو متن د ډیټا په توګه ګڼي؛ په `confirmBefore` کې له هر څه وړاندې له اصلي مالک څخه پوښتنه کوي |
| **Verifier** | Hashes، signatures، د key वैधता او revocation، disclosures، event chains او checkpoints |

د یو ټولګۍ ادعا کول پدې معنی ده چې د هغې conformance vectors (`conformance/`, چې په `tools/run_conformance.py` چلېږي) پاس شوي وي.

## 2. بنسټیز اسناد

| اسناد | سکیمه |
|---|---|
| ترکیب | `recipe.schema.json` |
| د وسیلې وړتیاوې | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| ګډ ډولونه (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| پېښې | `event.schema.json` (CloudEvents) |
| لغتونه: عملیات، واحدونه او د تودوżې کچې، پېښې | `vocab/*.json` |

ټول سکیماګانې **strict** دي: نامعلوم فیلډونه ردېږي، پرته له `x-<vendor>-…` توسیعونو څخه.
خوانونکي هغه `x-` فیلډونه نظراندازی کوي چې هغوی یې نه پوهېږي. `tools/bundle_schemas.py` یو واحد bundle تولیدوي ترڅو وسیلې په offline حالت کې تایید (validate) کړي. Implementation باید په run time کې سکیماګانې ترلاسه نه کړي.

## 3. عملیات څه معنی لري

- **Envelopes.** په `vocab/ops.json` کې هر تودوخې پر پایه یا خطرناک operation یو `envelope` لري.
  دا مشخص کوي:
  - واسطه (اوبه، تېل، هوا، د کټور سطح، محصول...);
  - د هغې د تودوخېې کچه په °C کې (او فشار، د فشار پخولو لپاره);
  - ګډوډول، سرپوش، د پاملرنې کچه او دا چې ایا دا ګام کېدای شي پرته له څارنې ترسره شي؛
  - خطرونه;
  - د ازموینې میتود.

`cw.op.simmer` = په ۸۵–۹۶ °C کې اوبه پر پایه مایع؛ `cw.op.deep_fry` = په ۱۶۰–۱۹۰ °C کې تیل.
- **Targetونه په envelopes کې.** د یوې ریسیپي target (`params.tempC` یا په medium باندې یو `target`) باید په envelope کې وي. validator هغه ریسیپۍ ردوي چې دا خبره ماتوي.
- **Executors medium په envelope کې ساتي.** که ریسیپي یو تر ډیره تنګ target ورکړي، دوی هغه هم په هغه کې ساتي، کله چې لومړی ته ورسیږي.
- **Altitude.** د اوبو او بخارې په بانډونو کې د پخلنځي د altitude په هر ۳۰۰ m کې په −۱ °C بدلون راځي.
- **Heat levels** (`very_low` … `max`) یو ګډ معنی لري: په °C کې د pan-surface یو بانډ، چې په `vocab/units.json` کې تعریف شوی دی.
- **Sensor ladder.** هر envelope د ګام د تحقق کولو لارې ښیي، چې تر ټولو غوره لومړی ده: یو ځانګړی sensor، بیا `model` (یو logged estimate)، بیا `time`, او بیا `human`.
  - executor هغه لومړی پړاو (rung) کاروي چې په کې بریالی شي او هغه په `verifiedBy` کې ثبتوي.
  - که هغه **هیڅ** پړاو پوره نهه کړي، نو باید ګام رد کړي (`missing_sensor_no_fallback`).
  - هغه عملیات چې دوامداره پاملرنه ته اړتیا لري او ممکن پرته له څارنې ونه ورځي (sautéing, searing, frying, reducing, caramelizing…) هیڅکله یوازې پر `time` تکیه نه کوي: د دوی وروستی پړاو یو څارونکی انسان دی.
  - Deep frying هیڅ fallback نه لري: که د oil-temperature sensor نشته، نو deep frying نشته.
  - یو `Condition` کولی شي دا په `onSensorMissing` سره محدود کړي.
- **Refusal، نه اټکل.** هغه executor چې نشي کولی د یو ګام's envelope، ladder، تجهیزات یا د خوندیتوب محدودیتونه پوره کړي، باید مخکې له دې چې پیل وکړي، د یو دلیل سره `refused` ځواب ورکړي.

## 4. شمېرې او واحدونه

- **په تار کې تودوخه °C ده.** ښکاره کېدونکي ممکنې بدلې شي.
- **تفاوتونه (Tolerances).**
  - `tolerance` نسبى دی او یوازې په ratio-scale units باندې اجازه ورکول کیږي.
  - `toleranceAbs` په ارزښت د واحد کې مطلق دی، او یوازې په °C باندې اجازه ورکړل شوی تفاوت دی.
  - `Target.tolerance` مطلق دی.
- **د پخلنځي واحدونو دقیق میټریک ارزښتونه لري:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **د حجم ↔ ډله لپاره کثافت ته اړتیا ده** (`Quantity.densityGPerMl`, یا د اجزاو لغتپاڼه);
  بې له دې دا یو خطا ده، هیڅکله یو اټکل نه دی.
- ** پیسې یو ډیسیمال سټټرینګ دی** (`"12.70"`) چې د ISO 4217 کارنسي لري، هیڅکله float نه دی.

## 5. صداقت او باور

- **Hash.** `sha256:` او د سند د RFC 8785 canonical JSON د hex digest سره،
  بې له `hash` او `signature` برخو. مرجع canonicalizer د RFC 8785 مثال په دقیق ډول بیا رامینځته کوي.
- **Signature.** د ASCII hash string په سر Ed25519 (`EdDSA`). د P-256 hardware keys لپاره `ES256` اجازه ورکړل شوې ده. `kid` یو `KeyRecord` ته نوم ورکوي.
- **Keys.** یو `KeyRecord` عامه key، د هغې مالک، د اعتبار وخت او `revokedAt` ورکوي.
  هغه signature چې `signedAt` یې د لغوه کېدو وروسته یا د اعتبار وخت څخه بهر وي، نامعتبر دی.
  - کټالوګونه خپل keys په `/.well-known/cookwala.json` کې خپروي.
  - سازمانونه او خلک خپل keys په did:web اسناد کې خپروي.
  - وسیلې خپل keys په خپل capabilities document کې خپروي.
  - Verifiers د offline کار لپاره key records cache کوي.
- **Selective disclosure.** یو لاس اخیستی سند ممکن د حساسې value پر ځای یو `Disclosure` digest، `sha256(JCS([salt, value]))` ولري. مالک یوازې هغه خوا ته salt او value ښکاره کوي چې د هغوی لیدلو اجازه لري، او signature بیا هم تاییدېږي.
- **Event logs** (Mission profile):
  - په هر log کې یو sequencer `seq` او `prev` ټاکي، ترڅو سلسله هیڅکله fork نشي.
  - Checkpoints د sequencer لخوا لاس اخیستل شوي او د شاهدانو لخوا counter-signed شوي دي، چې کېدای شي یو transparency service لکه IETF SCITT پکې شامل وي. د شاهد چک پوയിټ (checkpoint) وروسته بیا لیکل کېدل کېدای شي تشخیص شي.
  - په `hash_only` mode کې، payloads په eraser کېدونکي storage کې राहي او log یوازې د هغوی hashes ساتي.

## ۶. د خوندیتوب او ایجنټ قواعد (normative)

1. **خوندیتوب سیمه یي دی.** ایډیکټرونه (Executors) په وسیله باندې د `SafetyLimits` pack پلي کوي.
   - هیڅ ریسیپي، ایجنټ، لرې پیغام، توسیع یا عملیاتي حالت نشي کولی کوم محدودیت لوړ کړي یا غیر فعال کړي.
   - یو سخت‌تر محدودیت تل ګټونکی دی.
   - `profiles/core/safety-limits.default.json` یو مسودوي پیل دی چې د وسیلو جوړونکي
     د خپل خوندیتوب قضیې (safety case) له مخې یې سختوي.
2. **سیمه یي درته.** په وسیله باندې یو درته کنټرول په 0.5 s کې حرکت درته کوي او په 1 s کې حرارت پرې کوي، په شبکه سره یا پرته. `POST …/stop` هیڅکله د اجازه ورکولو لپاره رد نهڅെ کیږي کله چې اړیکې نیولونکی ایډیکټر ته ورسیږي.
3. **ایونټونه راپور ورکوي؛ ते هیڅکله محافظت نه کوي.** `cookwalalatency: local_safety` ایونټونه راپور ورکوي چې یوې وسیلې مخکې څه کړي دي. هیڅ خوندیتوب تابع (safety function) نشي کولی د یو ایونټ په رسیدلو پورې تړاو ولري.
4. **غیر معتبر متن.** هرې ازاد متن لرونکي ساحې (چې `x-cookwala-untrusted` ته یادښت ورکړل شوی وي) ډیټا ده او هیڅکله لارښوونه نه ده، د سافټویر او AI ایجنټونو لپاره په ورته ډول. د متن له لارې د لارښوونه کولو هڅې تر پتې کیږي او ثبت کیږي (`cw.incident.untrusted_instruction`).
5. **ایجنټونه د یو mandate لاندې عمل کوي.** د ایجنټ لخوا لیږل شوی غوښتنه یو `AgentMandate` لري چې د اصلي مالک لخوا لاسلیک شوی وي:范围 (scopes)، د لګښتونو حد، اجازه لرونکي وړاندې کوونکي، پای ته رسیدل، او هغه کړنې چې تایید ته اړتیا لري.
   - `irreversible` او `safety_override` تل تایید ته اړتیا لري، که څه هم mandate څه وایي.
   - ایډیکټرونه د mandate څخه بهر غوښتنې ردوي (`mandate_scope`).
6. **بې واټنې عملیاتونو ته یو کس اړتیا ده.** هغه عملیات چې د هغوی envelope وایي `unattended: false` یو مسؤل کس ته اړتیا لري چې شتون ولري، یا په یو دقیقې کې ورسره اړیکه کې وي.
7. **د الرژن بلاکونه رد کوي.** په ریسیپي یا انونټري کې هر بلاک شوی الرژن غوښتنه ردوي؛ د بلاک شاوخوا هیڅ بدل (substitutions) نشته.
8. **Recalls.** کټالوګونه په `GET /v1/recalls` کې لاسلیک شوي recalls خپروي. ایډیکټرونه کله چې آنلاین وي پلینګ (poll) کوي او یاد شوي (recalled) نسخې ردوي. `block_and_stop_running` هم د چلیدونکي executions په خوندي ډول درته کوي.
9. **د حادثو راپورونه** بې نوم دي (`IncidentReport`: یوازې تاریخ، بې له نومونو یا ids) او کټالوګونو ته وړاندې کیږي ترڅو هر جوړونکی له هر نږدې تېرویدونکي (near miss) څخه زده کړه وکړي.

## ۷. د execution lifecycle او API ژوندشکل

- **API:** `api/core.openapi.yaml`. د دې endpoints په لاندې ډول دي:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog side: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` او `stopping` → په لاره کې `stopped` ته؛
  - `refused` او `failed` وروستي دي.
  - بشپړه transition table په `core.schema.json#/$defs/ExecutionState` او conformance vectors کې ده.
- **Request rules:**
  - هر POST یو `Idempotency-Key` لري.
  - یوې شته execution ته بدلونونه `If-Match: <seq>` لري؛ که سم نه وي نو 412 بیرته ورکوي.
  - Stop ته `If-Match` ته اړتیا نشته.
- **Events:**
  - Delivery لږ تر لږه یو ځل ده.
  - CloudEvents `id` د deduplication key دی.
  - `cookwalaseq` د subject په اساس events ترتیبوي او status `seq` سره سمون کوي.
  - Devices `cookwala.device.heartbeat` خپروي، نو یو hub کولی شي یو ورک شوی device وپېژني او یې وسپاري.

## 8. गोपनीयता

- **Execution logs هیڅ شخصي معلومات نه وړي** (`privacy.personalData: "none"`).
- **دوی وسیله یوازې د opt-in رضایت سره پرېږدي** (`consent.dataset`: په پخواتیا کې `none`, `research_only`, یا `open`). رضایت بیرته اخیستل کېدی شي.
- **Open datasets وختونه تر ورځې پورې پراخوي.**
- **د کورنۍ، روغتیا او مذهبي معلومات په کور کې پاتې کیږي** که چیرې کس بل انتخاب ونه کړي. کله چې دا معلومات باید انتقال شي، د انتخابي افشاګرۍ (selective disclosures) په توګه انتقال کیږي.
- **The Humanitarian Profile** هیڅ ډول شخصي معلومات نه وړي.

## 9. د نسخې جوړول او توسیعونه

- **بنیادي نسخې `0.2.x` دي.**
  - لوستونکي د خپلې minor version څخه هر patch مني.
  - دوی نورې minors په `unsupported_version` سره ردوي.
  - دوی ناڅرګند `x-` fields نظر انداز کوي.
- **اዲስ operations، units، sensors او incident types** پرته له نسخه بدلون څخه په vocabularies کې اضافه کېږي.
- **د یو operation مانا بدلول یو نوی id دی؛** پخوانۍ `deprecated`标记 کیږي چې `replacedBy` لري.
- **Profiles** په خپلواک ډول نسخه کوي او هغه Core version اعلانوي چې دوی ورته اړتیا لري.

## ۱۰. پروفایلونه او د دوی حالت

| پروفایل | حالت | یادښتونه |
|---|---|---|
| Core (دا سند) | **draft, normative** | د لومړنیو وسیلو د پلي کولو لپاره هدف |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | شخصي معلومات نشته؛ د SMS او CSV له لارې کار کوي؛ surplus to plate، د اغېزو لنډیزونه، د پاملرنې rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | ځايي-لومړنی Household facts؛ یوازې derived constraints لیږل کیږي (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | ثابت شوي namespaces، دقیقې نسخې، tombstones؛ سازمانونه د غوښتنې پر اساس (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | د هر conformance ادعا تر شا لاسلیک شوي راپورونه (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds او relays؛ د issuer په وړاندې تایید کیږي (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | رستورانتونه، ټولنه، ښوونځي، بیړني حالت او روبوټ پخلنځي (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | ټول شوي، ځنډ شوي، د کلاسي کچې تقاضا او supply signals؛ د سیالیت قانون بیاکتنې پر اساس محدود شوي (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection، په `profiles/mission/transitions.json` کې بدلونونه |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | د تولید څخه وړاندې د سیالیت قانون بیاکتنې ته اړتیا لري |
| Relief planning (`relief.schema.json`) | experimental | عملیاتي جریان ته Humanitarian Profile ته لیږل شو |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API مرجع سطح ده |

یو پروفایل هغه وخت مستحکم کیږي کله چې دوه خپلواک پلي کول (implementations) د هغې conformance vectors تېر کړي او هغه حقیقي کاروونکي ولري.

## ۱۱. اوزار

| وسیله | هغه څه کوي |
|---|---|
| `tools/validate_specs.py` | स्कीماګانې، مثالونه، د ریسیپي معناګانې (envelopes، op parameters، no template placeholders)، سختۍ، او دا چې API مراجع حل شي وګوري |
| `tools/run_conformance.py` | `conformance/*.json` او `conformance/profiles/*.json` چلوي، او د `--report` په واسطه یو ConformanceReport لیکي: هیشینګ (د RFC 8785 مثال په شمول)، لاسونده (د RFC 8032 کلید په شمول)، لغوه کول، افشا کول، د ایونټ چینونه او ټکي، واحدونه، envelopes، sensor ladders، state machines |
| `tools/cookwala_ref.py` | مرجع کتابخانه او CLI: `hash`، `verify`، `chain` |
| `tools/make_conformance.py` | ویکٹرونه بیا جوړوي (diff وګورئ) |
| `tools/bundle_schemas.py` | آفلاین स्कीما بنډل |
| `tools/humanitarian_check.py` | د Humanitarian Profile rule-pack پلټونکی او د اغېزو لنډیزونه |
| `tools/make_profile_vectors.py` | په `conformance/profiles/` کې پروفایل ویکٹرونه بیا جوړوي |

## 12. له 0.1 څخه بدلونونه

| سیمه | 0.1 | 0.2 |
|---|---|---|
| Schemas | منبول شوي ناڅرګندې برخې | سخت، د `x-` توسیعاتو سره |
| Temperatures | °C یا °F، نسبتي تفاوت ته اجازه ورکړل شوې | یوازې °C؛ مطلق تفاوت |
| Money | شمېره | اعشاري رشته |
| Operations | نثر تعریفونه | فزیکي envelopes، sensor ladders، د تودوخې کچې، test vectors |
| Signatures | ثابت EdDSA، بې له lifecycle کلیدونو | EdDSA یا ES256، KeyRecords د validity او revocation سره |
| Missions | یو بدلیدونکی سند، دننه ledger | Event log + projection، یوازې sequencer، شاهد شوي checkpoints، یوازې hash mode |
| Agents | یوازې په Missions کې Mandate | په عام ډول `AgentMandate`؛ د agent requests لپاره اړین |
| Safety | په recipes کې اعلان شوي | همدارنګه په سیمه کې د SafetyLimits له لارې پلي کېږي؛ recalls؛ incident reports |
| Data | هیڅ dataset model نشته | رضایت منل شوی، personal-data-free ExecutionLog |
| Conformance | یوازې Schema validation | ۱۰۶ vectors (۴۴ Core، ۶۲ profile) او یو reference implementation |

د یو 0.1 سند د انتقال لپاره: °F څخه °C ته اړول؛ په درجات کې نسبتي پرتیاګرۍ (relative tolerances) په `toleranceAbs` بدلول؛ د پیسو مقدارونه په ډیسیمل سټرینګونو (decimal strings) بدلول؛ نامعلوم فیلډونه لرې کول یا په `x-` فیلډونو نومول.

