<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Cookwala Recipe Format: وہ تراکیب جو Missions کے ساتھ کام کرتی ہیں

Cookwala میں ایک ترکیب ہدایات کی فہرست نہیں ہے۔ یہ **portable cooking knowledge** ہے
جسے ایک planner ایک مخصوص Mission (household, robots, appliances,
energy, budget, health, timing) کے خلاف *compiles* کر کے ایک executable plan میں تبدیل کرتا ہے۔ روبوٹ پھر اس plan کو چلاتا ہے، اور جب حقیقت بدلتی ہے تو contingencies اور playbooks کے ذریعے خود کو ڈھالتا ہے۔

اسکیما: [`recipe.schema.json`](../schemas/recipe.schema.json). مکمل کام شدہ مثال:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. چار تہیں (WHO SMART Guidelines کے طریقہ کار سے ماخوذ)

| تہہ (Layer) | اس میں کیا ہوتا ہے | کون لکھتا ہے | یہ کہاں رہتا ہے |
|---|---|---|---|
| **R1 Narrative** | انسانی ترکیب کا متن، کہانی، ثقافتی نوٹس، تصاویر | Cookwala، شیفس، fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | ڈش *کیا ہے* اور اسے *کیا ہونا چاہیے*: شناخت (essental بمقابلہ flexible)، حسی اہداف، غذائیت، پیش کرنے اور کھانے کا انداز، اسٹوریج، قبولیت کے چیک | ترکیب کے ایڈیٹرز، AI-assisted، ریویو شدہ | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | ڈیوائس سے آزاد طریقہ: فارمولا (تناسب + کردار)، ٹائپ شدہ ops کا پروسیس گراف مع food-state pre/post شرائط، `until` شرائط، متبادل، وقفے کے اصول، ناکامی کے طریقے، affordances، خطرات، CCPs، ماحول کی تیاری | ایکسپورٹ پائپ لائن + ریویو؛ simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | *اس* Mission کے لیے کمپائل شدہ R3 ترکیب: درست مقدار، منتخب کردہ اقسام، تفویض کردہ اداکار اور ڈیوائسز، شیڈول، لیز، مانیٹرز، ہنگامی صورتحال | پلانر/کمپائلر، run time پر | **Mission** (`plan`) کے اندر، کیٹلاگ میں کبھی نہیں |

سورس کوڈ اور ایک کمپائلر کی طرح: **recipe ایک portable intermediate representation
(R3 + R2) ہے۔ Mission اصل target machine ہے۔** یہی چیز recipes کو valid رکھتی ہے جب robots
اور AI تبدیل ہوتے ہیں: ایک بہتر planner اسی recipe سے بہتر R4 تیار کرتا ہے۔

## 2. ایک Mission میں ہر سیکشن کیا کرتا ہے

| ترکیب کا حصہ (Recipe section) | مشن کے ذریعے استعمال کیا جاتا ہے… کے لیے |
|---|---|
| `identity.essential / flexible / neverAdd` | متبادلات، بجٹ اور راشن موڈز، ڈائٹ کی ترتیبات: flexible حصوں کو تبدیل کریں، essentials کو کبھی نہیں، تاکہ ڈش اپنی اصل حالت برقرار رکھے |
| `formula` (ratios, min/max, role, scaling) | لوگوں کی کسی بھی تعداد کے لیے درست scaling، ایک ہفتے کے دوران اجزاء کی تقسیم (rationing)، بجٹ کی بچت، جو دستیاب ہے اسے استعمال کرنا (limiting-ingredient rescale) |
| `sensory` | بصری، خوشبو اور ذائقہ کے چیک پوائنٹس؛ household taste profiles (salt 2 vs 4); دوبارہ استعمال اور درستگی کے فیصلے |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **ماحول کی تیاری کے کام:** اگر سنک یا ہوب مصروف ہے، تو پلانر "clear, wash, dry" کے کام شامل کرتا ہے؛ بھگونے یا پگھلانے کے کام گھنٹوں پہلے شیڈول کیے جاتے ہیں |
| `process.nodes[]` with `pre`/`post` food states | منصوبہ بندی (صرف وہی شروع کریں جو تیار ہے)، تصدیق (کیا اس مرحلے نے مطلوبہ حالت پیدا کی؟)، مداخلت کے بعد دوبارہ شروع کرنا |
| `until`, `onTimeout`, `retry` | یہ جاننا کہ کوئی مرحلہ کب مکمل ہوتا ہے اور جب وہ مکمل نہ ہو تو کیا کرنا ہے |
| `alternatives[]` + `energy` | گیس بمقابلہ انڈکشن بمقابلہ اوون، بیٹری سیور، بغیر اوون کے کچن، خاموش اوقات |
| `pause` (pausable, safeState, maxPause, onExceeded) | **مداخلتیں:** ایک بچے کو مدد کی ضرورت ہے، مالک پکارتا ہے، کتا کسی چیز کو گرا دیتا ہے۔ روبوٹ مرحلے کو اس کی safe state میں ڈال دیتا ہے، واقعے کو سنبھالتا ہے، پھر pause budget کی بنیاد پر دوبارہ شروع کرتا ہے، دوبارہ گرم کرتا ہے، بچاتا ہے یا ضائع کر دیتا ہے |
| `failureModes` (incident, detect, prevent, playbook) | معلوم مسائل کی جلد تشخیص اور بحالی کے لیے درست playbook |
| `affordances`, `space` | ان روبوٹس کے ساتھ مراحل کا ملاپ جو پکڑ سکتے ہیں، اٹھا سکتے ہیں اور پہنچ سکتے ہیں؛ گرم زونز کو بچوں سے دور رکھنا |
| `safety` (hazards, CCPs, supervision, abort) | سیفٹی کرنل: invariants جنہیں ہر پلان کو برقرار رکھنا چاہیے |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | پیش کرنا: میز پر، کمرے میں، لنچ باکس میں کیا جائے گا؛ یاد دہانیاں اور hold limits؛ ثقافتی کھانے کا انداز |
| `storage` | بچا ہوا کھانا، cook-ahead اور لنچ باکس مشنز |
| `acceptance` | ترکیب کے *tests*: مشن تب مکمل ہوتا ہے جب یہ برقرار رہیں |
| `nutrition`, `cost` | ذاتی پورشنز، بجٹ، امدادی راشن |

## 3. مثال: ایک قدم جس کے ساتھ سب کچھ منسلک ہے

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

## 4. ایک Mission کے لیے ترکیب تیار کرنا (جو planner کرتا ہے)

1. **ورائٹی منتخب کریں:** `alternatives` میں سے غذا، ساخت (IDDSI)، سامان، توانائی اور موڈ کا انتخاب کریں۔ شناخت کے ضروری عناصر برقرار رہنے چاہئیں۔
2. **اسکیل کریں:** `formula` اور سرونگز، فی کس حصے (HEALTH.md)، محدود جزو، یا راشن کے افق سے۔ مصالحے سب-لینیئرلی، وقت ماس ایکسپوننٹ کے ذریعے ۔
3. **تبدیل کریں:** کرداروں کے اندر، `identity.neverAdd`، الرجنز، غذائی پیکوں اور انوینٹری کا احترام کرتے ہوئے ۔
4. **ماحول تیار کریں:** مشن کے اسپیس فیسٹس (نلکا بھرا ہے؟ چولہا مصروف ہے؟ بورڈ گندا ہے؟) کے ساتھ `prep` کا موازنہ کریں اور صفائی، دھونے، خشک کرنے اور اسٹیج کے کام شامل کریں۔ `advanceTasks` (بھگوئیں، پگھلائیں، میرینیٹ کریں، پری ہیٹ کریں) کا شیڈول بنائیں۔
5. **بائنڈ کریں:** افورڈنسز اور صلاحیتوں کے ذریعے ہر نوڈ کو روبوٹس، آلات یا انسانوں کے سپرد کریں۔ برنر، برتن اور زونز لیز پر لیں۔ مانیٹرز منسلک کریں (اسمارٹ پاٹ، ڈیلیوری ETA، اسموک ڈیٹیکٹر)۔
6. **شیڈول کریں:** سرونگ کے وقت سے پیچھے کی طرف، وقفے کے بجٹ، بیٹری اور توانائی کی حدود، گھریلو خاموش گھنٹوں اور کچن شیئرنگ ونڈوز کا احترام کرتے ہوئے ۔
7. **ہنگامی صورتحال منسلک کریں:** ہر نوڈ کے `failureModes` اور `pause` کے اصول، نیز مشن کی عالمی پالیسیاں (مداخلتیں، چولہے کے قریب بچہ یا پالتو جانور، اسٹو واچ ڈاگ، خرابی کی نگرانی)۔
8. **تصدیق کریں:** اسکیما + سیمنٹک چیک، پالیسی پیک، CCP کوریج، سمیلیٹر dry run، ترجیحی اسٹیک انوائرینٹس (PROTOCOL §7.2)۔
9. **R4 خارج کریں** مشن کے `plan` میں، اس پر دستخط کریں، اور اسے روبوٹ کے حوالے کر دیں۔

## 5. تخلیق اور تبدیلی

- **fifi.cooking سے:** EXPORT-FIFI پائپ لائن R1 + R2 + R3 تیار کرتی ہے۔ نئے
  سیکشنز (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  موجودہ متن سے مقامی ماڈلز کے ذریعے تیار کیے جاتے ہیں اور validators اور
  نمونہ انسانی جائزے کے ذریعے چیک کیے جاتے ہیں۔
- **ویب سے:** `cookwala convert --from schema-org` → R1/R2 (V0)، پھر وہی
  enrichment۔
- **دیگر فارمیٹس میں:** schema.org Recipe (سرچ انجنوں کے لیے R1/R2)، Cooklang (انسانی
  ایڈیٹنگ)، PDDL یا temporal logic (ریسرچ پلانرز) سب R3 سے تیار کیے جا سکتے ہیں۔
- **ہاتھ سے:** `cookwala init recipe` تمام تہوں کا ڈھانچہ تیار کرتا ہے؛ `cookwala validate` اور
  `cookwala simulate` انہیں چیک کرتے ہیں۔
- **ورژننگ:** نظرثانی (revisions) ناقابل تبدیلی اور hashed ہوتی ہیں۔ Forks `meta.derivedFrom` ریکارڈ کرتے ہیں۔
  Recipe **patches** (playbooks یا feedback سے) diffs کے طور پر تجویز کیے جاتے ہیں اور صرف
  جائزے اور ثبوت کے بعد ہی پروموٹ کیے جاتے ہیں۔

## 6. مرحلہ متن کی زبان

مرحلہ وار جملے پہلے ایک انسان کے لیے لکھے جاتے ہیں اور دوسری بار مشین کے ذریعے پارس کیے جاتے ہیں۔ مثال کے طور پر دی گئی ریسیپیز میں عربی مرحلہ وار متن مؤنث امر (قطّعي، سخّني) کا استعمال کرتا ہے، جو کہ مصری کوک بک کا عام طریقہ کار ہے؛ یہ ایک دانستہ انتخاب ہے، کوئی کوتاہی نہیں، اور ایک پبلشر اس کے بجائے جنس سے غیر جانبدار غیر فعال (تُقطَّع البصلة) کا استعمال کر سکتا ہے۔ `op`, `params` اور `until` فیلڈز معنی رکھتے ہیں؛ جملہ باورچی کے لیے ہے۔

## 7. یہ کیوں مستقبل کے لیے محفوظ رہتا ہے

- ریسیپیز **food outcomes and constraints، motions نہیں** بیان کرتی ہیں۔ نئے روبوٹس اور نئی AI ایک ہی R3 سے بہتر R4 plans تیار کرتے ہیں۔
- تمام نئے سیکشنز **optional and additive** ہیں۔ ایک V0 recipe (صرف R1) اب بھی guided human cooking کے لیے کام کرتی ہے؛ شامل کیا گیا ہر لیئر مزید automation کو ان لاک کرتا ہے۔
- نامعلوم `x-` fields گزر جاتے ہیں۔ Vendors، chefs اور health bodies کسی کو متاثر کیے بغیر ریسیپیز کو extend کر سکتے ہیں۔
- **Acceptance checks** کسی بھی executor، انسان یا روبوٹ کو یہ ثابت کرنے دیتے ہیں کہ ڈش درست بنی ہے، اور اسی طرح ریسیپیز field evidence کے ساتھ V3 تک پہنچتی ہیں۔

