<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Cookwala د ترکیب فارمیټ: هغه ترکیبونه چې د Missions سره کار کوي

په Cookwala کې یو ریسیپي د لارښوونو لیست نه دی. دا **منتقلید پخلي پوهه** ده
چې یو پلانر د یو ځانګړي Mission (household, robots, appliances,
energy, budget, health, timing) په وړاندې *compiles* کوي ترڅو په یو ایګزیکیو پلان بدل شي. بیا روبوټ هغه پلان چلوي، او کله چې حقیقت بدلیږي، د contingencies او playbooks له لارې ځان برابروي.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). بشپړ کار شوی مثال:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## ۱. څلور ت롭게 (د WHO SMART Guidelines podejسته اخیستل شوې)

| تیره (Layer) | څهmaty holds | څوک یې لیکي | چیرته چې ژوند کوي |
|---|---|---|---|
| **R1 Narrative** | د انسان پخولو متن، کیسه، کلتوري یادښتونه، عکسونه | پخونکي، شيفونه، fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | هغه څه چې خواړه *دي* او *باید وي*: هویت (اړین مقابل انعطاف‌پذیر)، حسي اهداف، تغذیه، د وړاندې کولو او خوړلو ډول، ذخیره، د منلو تपाوتونه | د ترکیب ایډیټورونه، په AI مرسته شوي، بیاکتنه شوي | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | د وسیلې څخه خپلواک میتود: فارمولا (تناسبونه + رولونه)، د ډول شوي ops د پروسې ګراف د خوراک حالت pre/post شرایطو سره، `until` شرایط، بدیل، د ځنډ قواعد، د ناکامۍ حالتونه، affordances، خطرونه، CCPs، د چا坏والي چمتووالی | Export pipeline + review; simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | د R3 ترکیب چې د *دا* Mission لپاره جوړ شوی: دقیق مقدارونه، غوره شوي ډولونه، ځانګړ کسان او وسیلې، مهالوېش، کرایه، څارونکي، احتمالي حالات | پلانر/کمپایلر، په run time کې | د **Mission** (`plan`) دننه، هیڅکله په catalog کې نه |

د ماډل کوډ او کمپایلر په څېر: **ریسیپي یو پورټ ایبل انټرمډیټ ریپریزنټیشن دی (R3 + R2). ماموریت هدف ماشین دی.** دا هغه څه دي چې ریسیپيونه د روبوټونو او AI په بدلون سره کار کوي: یو غوره پلانر له همدې ریسیپي څخه یو غوره R4 تولیدوي.

## 2. په یوه ماموریت کې هر برخه څه کوي

| د ریسیپي برخه | د ماموریت لخوا د... لپاره کارول کیږي |
|---|---|
| `identity.essential / flexible / neverAdd` | بدیلون، بودیجټ او راشن حالتونه، د ډایټ تطبیقونه: د flexible برخو بدلول، هیڅکله essentials نه، ترڅو ډش لا هم خپل ځان پاتې شي |
| `formula` (ratios, min/max, role, scaling) | د هر څومره خلکو لپاره دقیق scaling، په یوه اونۍ کې د اجزاوو راشن کول، د بودیجټ پراخول، هغه څه کارول چې په لاس کې دي (د محدود-اجزې rescale) |
| `sensory` | لید، بوی او خوند چک پوയിښټونه؛ د household taste profiles (salt 2 vs 4)؛ د repurpose او fix پریکړې |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **د چاودې (Environment) د چمتووالي کارونه:** که سینک یا هاب شتون ولري، پلانر "clear, wash, dry" کارونه اضافه کوي؛ د soak یا thaw کارونه څو ساعتونه وړاندې پلان کیږي |
| `process.nodes[]` له `pre`/`post` د خوړو حالتونو سره | پلان کول (یوازې هغه څه پیل کړئ چې چمتو دي)، تحقق کول (ایا پړاو هغه حالت تولید کړ؟)، د مداخلو وروسته بیا پیل کول |
| `until`, `onTimeout`, `retry` | پوهیدل چې یو پړاو کله پای ته رسیږي او کله چې پای ته نه رسیږي څه باید وشي |
| `alternatives[]` + `energy` | ګاز vs induction vs oven، د بیټرۍ خوندي ساتونکی، پرته له oven پخلنځي، ارامه ساعتونه |
| `pause` (pausable, safeState, maxPause, onExceeded) | **مداخلې:** یو ماشوم مرستې ته اړتیا لري، مالک غږوي، سپی څه پریولي. روبوټ پړاو په safe state کې اچوي، پېښه مدیریتوي، بیا پیل کوي، بیا ګرموي، یا د pause بودیجټ پر اساس خلاصوي یا پرېږدي |
| `failureModes` (incident, detect, prevent, playbook) | د پیژندل شوي ستونزو لومړنی تشخیص او د بیرته ترلاسه کولو لپاره دقیق playbook |
| `affordances`, `space` | د هغو روبوټونو سره د پړاوونو سمون چې کولی شي نیسي، پورته کړي او ورسیږي؛ د ګرم زونونو ساتل له ماشومانو څخه |
| `safety` (hazards, CCPs, supervision, abort) | د safety kernel: invariants چې هر پلان باید وساتي |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | وړاندې کول: څه پر مېز، په خونه، په lunchbox کې کېږي؛ یادونه او hold limits؛ کلتوري د خوړلو ډول |
| `storage` | پاتې شوي خواړه، cook-ahead او lunchbox ماموریتونه |
| `acceptance` | د ریسیپي *tests*: ماموریت هغه وخت پای ته رسیږي کله چې دا پاتې شي |
| `nutrition`, `cost` | شخصي برخې، بودیجټ، د مرستې راشنونه |

## ۳. مثال: یو ګام چې ټول شیان ورسره जोडل شوي دي

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. د یوې ماموریت لپاره د ترکیب جوړول (څه چې پلان کونکی کوي)

1. **متغیر انتخاب کړئ:** diet، texture (IDDSI)، equipment، energy او mode له `alternatives` څخه غوره کړئ. Identity essentials باید پاتې شي.
2. **Scale:** له `formula` او سروings، په هر کس باندې د portions (HEALTH.md)، محدود کونکي ingredient، یا ration horizon څخه. Spices په sub-linearly، او وخت په mass exponent سره.
3. **Substitute** په roles کې، په `identity.neverAdd`، allergens، dietary packs او inventory باندې درناوی سره.
4. **محیط چمتو کړئ:** `prep` له Mission's space facets سره پرتل کړئ (sink ډک دی؟ hob شیمه دی؟ board وچ دی؟) او tidy، wash، dry او stage کارونه اضافه کړئ. `advanceTasks` (soak، thaw، marinate، preheat) مهالوېळा کړئ.
5. **Bind:** هر node د affordances او capabilities له مخې روبوټونو، appliances یا انسانانو ته وپېژندئ. Burners، vessels او zones کرایه کړئ. Monitors (smart pot، delivery ETA، smoke detector) وصل کړئ.
6. **Schedule** د سرو وخت څخه شاته، د pause budgets، battery او energy limits، household quiet hours او kitchen-sharing windows ته درناوی سره.
7. **Attach contingencies:** د هر node `failureModes` او `pause` rules، په دې کې د Mission's global policies (interruptions، child یا pet hob ته نږدې، stove watchdog، spoilage watch) شاملې دي.
8. **Verify:** schema + semantic checks، policy packs، CCP coverage، simulator dry-run، priority-stack invariants (PROTOCOL §7.2).
9. **Emit R4** په Mission's `plan` کې، دا لاسلیک کړئ، او روبوټ ته یې وسپارئ.

## 5. لیکل او بدلول

- **له fifi.cooking څخه:** EXPORT-FIFI پائپلاین R1 + R2 + R3 تولیدوي. نوي
  سیکشنونه (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  د شته متن څخه د ځايي ماډلونو لخوا تولیدیږي او د ویلیډېټرانو او نمونوي بشري بیاکتنې لخوا چک کیږي.
- **له ویب څخه:** `cookwala convert --from schema-org` → R1/R2 (V0), بیا ورته
  enrichment.
- **بل ته فارمیټونو ته:** schema.org Recipe (د لټون انجنونو لپاره R1/R2), Cooklang (بشري
  اصلاح)، PDDL یا temporal logic (څېړنیز پلینرونه) ټول R3 څخه تولیدیدلی شي.
- **په لاس:** `cookwala init recipe` ټولې تلوې (layers) جوړوي؛ `cookwala validate` او
  `cookwala simulate` هغوی چک کوي.
- **د ورژننګ (Versioning) په اړه:** بیاکتنې غیر تغیر وړ او hashed دي. Forks `meta.derivedFrom` ثبتوي.
  د Recipe **patches** (له playbooks یا feedback څخه) د diffs په توګه وړاندیز کیږي او یوازې
  له بیاکتنې او شواهدو (evidence) وروسته ترویج کیږي.

## 6. د ګام متن ژبه

د ګامونو جملې لومړی د یو کس لپاره لیکل کیږي او بیا یې ماشین تجزیه کوي. په مثال کې ورکړل شوي ریسیپي کې عربي ګامي متن ښځینه امر (قطّعي، سخّني) کاروي، چې دا په مصرۍ پخپلو کتابونو کې عامه دود دی؛ دا یو هدفمن انتخاب دی، نه یو خطا، او یو ناشر ممکن د جنسیت بې طرفه مفعول (تُقطَّع البصلة) په ځای کاروي. `op`، `params` او `until` برخې مانا لري؛ جمله د پخ کنډکټر لپاره ده.

## ۷. ولې دا د راتلونکي لپاره خوندي پاتې کیږي

- ریسیپۍ **د خوراکي پایلو او محدودیتونو بیانوي، نه حرکتونو ته**. نوي روبوټونه او نوي AI له ورته R3 څخه غوره R4 پلانونه تولیدوي.
- ټول نوي برخې **اختیاري او اضافه کېدونکې دي**. یوه V0 ریسیپۍ (یوازې R1) لا هم د لارښود شوي انسان پخلي لپاره کار کوي؛ هر اضافه شوی لیヤー ډیرې اتوماتیکونې خلاصوي.
- نامعلوم `x-` فیلډونه تېرېږي. پلورونکي، شيفونه او روغتیايي ادارې کولی شي ریسیپۍ پراخې کړي پرته له دې چې چا ته زیان ورسوي.
- **قبولیت چیکونه** هر اجرا کوونکي، انسان یا روبوټ ته اجازه ورکوي چې ثابت کړي چې ډیس (dish) سم جوړ شوی دی، چې دا هغه طریقه ده چې ریسیپۍ د فیلډ شواهدو سره تر V3 پورې پورته کېږي.

