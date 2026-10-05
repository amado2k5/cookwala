<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Cookwala حکمت عملی: پیغام، پروڈکٹ، ویب سائٹ، دستاویزات، ڈویلپر کا تجربہ

**Status:** संशोधित 2026-10-04 (v2)۔ اس میں مشن، ویژن، کہانی، معیار، ویب سائٹ،
دستاویزیات، API اور SDK، ڈیموز، کمیونٹی اور میٹرکس شامل ہیں۔ یہ ایکشن پلان
(`ACTION-PLAN.md`)، پس منظر اور خلا کی فہرست (`research/BACKSTORY.md`)، آرکیٹیکچر ریویو
(`research/ARCHITECTURE-REVIEW.md`)، 23-سائٹ بینچ مارک (`research/WEB-BENCHMARK.md`)، اسٹیک ہولڈر ڈیزائن
(`STAKEHOLDERS.md`) اور میسجنگ رولز (`MESSAGING.md`) پر مبنی ہے۔ سیکشن 1 کا ٹیبل پہلی پاس کی مطالعہ ہے؛ جہاں ان میں فرق ہو وہاں بینچ مارک اس کی جگہ لے لیتا ہے۔

---

## 0. خلاصہ

**Cookwala کا کام۔** یہ کسی بھی کچن (ایک شخص، ایک food bank، ایک اوون یا ایک humanoid robot) کو یہ بتانے کا کھلا طریقہ ہے کہ **کیا بنانا ہے، جب ہر قدم مکمل ہو جائے، اور کیا کبھی نہیں ہونا چاہیے**، اور ڈیوائس پر ان تینوں کو چیک کرنا ہے۔

**کیا تبدیلیاں ہوئی ہیں:**

1. **Message.** "the world's first and largest robot cooking recipes index and CLI" کو ریٹائر کریں
   اور اس مسئلے سے آغاز کریں جو ہر روبوٹ بنانے والے اور کچن کو درپیش ہے۔ نیا one-liner:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** روبوٹس گھروں میں کھانا پکانے والے ہیں، لیکن کسی نے بھی ایسی شکل میں یہ نہیں لکھا، جسے ایک مشین چیک کر سکے، کہ "done" اور "safe" کا کیا مطلب ہے، یا کن cuisines میں۔ Cookwala کا آغاز ایک خاندان کی مصری ترکیبوں سے ہوا۔ اس کا مشن مشینوں کو ہر cuisine کو محفوظ طریقے سے سکھانا ہے، اور یہ یقینی بنانا ہے کہ اچھا کھانا لوگوں تک پہنچے۔
3. **Proof before promise.** لائیو، حقیقی کاؤنٹرز۔ Now / next / later لیبلز۔ شائع شدہ تنقید۔
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** device makers, AI-agent builders, kitchens and food banks, cooks,
   researchers.
6. **Code and a live demo on the first screen.** ان-براؤزر dry run ("Can this device cook
   this recipe?"), simulators، اور copy-paste commands جو آج کام کرتے ہیں۔
7. **Developer experience at the level of the best AI and robotics docs:** ایک 5 منٹ کا
   quickstart، tutorials، how-to guides، reference اور explanation کے طور پر منظم docs،
   `llms.txt`، copy-page، ایک Python package اور CLI، ایک typed JS/TS SDK، ایک MCP server، ایک
   reference hub جسے آپ مقامی طور پر چلا سکتے ہیں، ایک ROS 2 package، اور ایک LeRobot bridge۔
8. **A contributor network** (Figure's Index سے متاثر): cooks اور kitchens حقیقی ترکیبوں کی
   رضامندی سے ریکارڈنگز فراہم کرتے ہیں، تاکہ روبوٹس ہر cuisine سیکھ سکیں، ان لوگوں کے کریڈٹ کے ساتھ جنہوں نے انہیں سکھایا۔

---

## 1. ہم نے کیا سیکھا

| سائٹ | مسئلہ جسے یہ حل کرتا ہے | طریقہ کار | یہ کیسے رابطہ کرتا ہے | سامعین | ہم کیا لیتے ہیں |
|---|---|---|---|---|---|
| **Figure – Index** | Humanoids کو حقیقی دنیا کے ٹاسک ڈیٹا کی بڑی مقدار کی ضرورت ہوتی ہے | ادا شدہ contributor network جو روزمرہ کے ٹاسک ریکارڈ کرتا ہے؛ services now، robots later | Cinematic، monochrome، بڑا light type؛ live counters (29 M video uploads, $15 M paid)؛ *"Today, services on demand. Soon, robots on demand."* | Contributors، households، businesses | credit کے ساتھ Contributor network؛ **live proof counters**؛ ایک "today / soon" ایمانداری کی لائن؛ ایک نمایاں تصویر |
| **Figure (home)** | گھر کی مدد | ایک general-purpose humanoid | *"The future of home help is here."* ایک جملہ، ایک ویڈیو | Households، investors | ایک جملے کا وعدہ؛ features سے پہلے product |
| **MCP Registry** | قابل اعتماد MCP servers تلاش کرنا | Community registry؛ verified reverse-DNS namespaces؛ exact versions؛ integrity hashes؛ validation endpoint؛ lifecycle status | صاف OpenAPI reference؛ schema-first | Server publishers، client makers | **Verified namespaces, pinned versions, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | agents بنانا بکھرا ہوا ہے | Open، model-agnostic frameworks کے ساتھ ایک platform | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; trust center اور status | Agent engineers، enterprises | **ایک lifecycle جسے قاری پہچانتا ہے**؛ trust center؛ academy اور forum |
| **LangSmith Observability** | دیکھنا کہ agents نے production میں کیا کیا | Traces → monitoring → feedback → evals کے لیے datasets | لنکس کے ساتھ مراحل؛ concepts page؛ integrations | Agent teams | **Execution logs بطور traces**؛ traces بن کر datasets میں تبدیل ہوتے ہیں → `execlog_export.py otel` |
| **OpenAI API docs** | پہلی API call | code first کے ساتھ Quickstart؛ build paths؛ model cards | Dark، code-forward، "Ask AI"، status اور cookbook | Developers | **پہلی اسکرین پر Code; "build paths"** |
| **Claude Platform docs** | پہلی call سے production تک | دو surfaces (Messages, Managed Agents)؛ نمبروں کے ساتھ developer journey؛ model family cards | ⌘K search; language tabs (Python … cURL, CLI); journey 1–4 | Developers، platform teams | **نمبروں کے ساتھ developer journey; language tabs; "choose how you build"** |
| **AsyncAPI** | event-driven APIs کی وضاحت کرنا | Open spec کے ساتھ ٹولز (generators, docs)؛ Linux Foundation کے تحت open governance | "Part of the Linux Foundation"; spec → docs → code demo; community meetings; sponsor tiers | Architects، tool builders | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | تیز، سستا model inference | بہت سے models کے لیے One-stop API | performance, scalability, cost اور security کی Feature lists | Developers، enterprises | **characteristics** کی ایک واضح فہرست (ہمارے: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Trial-and-error prompt engineering | Declarative test cases, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; why-choose list; workflow steps | LLM app developers، security | **Declarative safety tests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; Figure کی Helix AI نہیں) | DeFi بہت پیچیدہ ہے | ہر transaction سے پہلے confirmation کے ساتھ Natural-language agent | Whitepaper: abstract → problem → solution → architecture → security model | Crypto users | **Whitepaper structure; explicit security model; "always confirm"** (ہم ڈھانچہ لیتے ہیں، token model نہیں) |
| **Hugging Face LeRobot** | Robotics شروع کرنا مشکل ہے | Hardware-agnostic library; teleoperate → record → train → deploy; standard dataset format; community datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; common problems | Makers، researchers | **"Pick your path"; dataset compatibility; common-problems section** |
| **ROS 2 / Open Robotics** | Robot software interoperability | ایک non-profit کے ذریعے چلایا جانے والا Open middleware (ROS, Gazebo, Open-RMF) | *"Powering the world's robots"* | Robot developers | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | Robots کو ڈویلپ کرنا اور ٹرین کرنا | Simulation, libraries, foundation models (GR00T) | Platform map: libraries, simulation, models, blueprints | Robotics teams | envelopes کے لیے **Simulation بطور test bench** |
| **1X, Unitree, Pollen** | Home humanoids، سستے robots، makers کے لیے open robots | deposits, pre-orders اور community کے ساتھ Products | ایک product, ایک price, ایک button | Households، makers | Home robots اب ship ہو رہے ہیں; ہمارا window now ہے |

**بہترین لوگوں کے ذریعے شیئر کیے گئے پیٹرنز:**
1. ایک جملہ کہ یہ کس کے لیے ہے اور کیا کرتا ہے۔
2. ایک لوپ جسے قاری پہچانتا ہو۔
3. ایک اسکرول کے اندر کام کرنے والا کوڈ یا ڈیمو۔
4. اپنی پسند کا راستہ منتخب کرنے والے انٹری پوائنٹس۔
5. ثبوت (نمبرز، صارفین، گورننس)۔
6. ایماندارانہ اسٹیٹس (ٹرسٹ سینٹر، اسٹیٹس پیج، now/next)۔
7. کمیونٹی جس میں آپ آج ہی شامل ہو سکتے ہیں۔
8. دستاویزات جو انسانوں اور AI قارئین دونوں کے لیے بنائی گئی ہیں (کاپی پیج، `llms.txt`، "Ask AI")۔

---

## 2. Cookwala آج

**خوبیاں:**
- ایک نایاب، ٹھوس خیال: جسمانی operation envelopes، sensor ladders، اندازہ لگانے کے بجائے refusal، ڈیوائس پر نافذ شدہ حفاظت، قابلِ تصدیق دستاویزات۔
- Conformance vectors جن میں دو آزادانہ معیاری نتائج (RFC 8785, RFC 8032) شامل ہیں۔
- چار قابلِ کھیل simulators۔
- ایک انسانی ہمدردی والا پروفائل جو روبوٹس کے بغیر کام کرتا ہے۔
- ایک حقیقی ترکیبوں کا مجموعہ (fifi.cooking) اور ایک شناخت والا خطہ (Egypt، عرب دنیا)۔
- ایک غیر معمولی طور پر ایماندارانہ تنقید اور جواب کا ریکارڈ۔

**خلا:**

| خلا | اثر |
|---|---|
| ہیڈ لائن 1 شائع شدہ ترکیب کے ساتھ "پہلا اور سب سے بڑا" دعویٰ کرتی ہے | یہ محض ہائپ لگتا ہے؛ مسترد کیے جانے کا سبب بنتا ہے |
| "دنیا سے بھوک ختم کریں" بطور لیڈ | ان فنڈرز اور ماہرین کو دور کرتا ہے جو بھوک کے محرکات کو جانتے ہیں |
| صرف روبوٹس تک محدود فریم ورک | ان صارفین کو خارج کرتا ہے جو آج اپنا سکتے ہیں (کچن، food bank، ایجنٹ بلڈرز) |
| کوئی quickstart نہیں، کوئی SDK نہیں، کوئی runnable server نہیں | کوئی بھی 5 منٹ میں کامیاب نہیں ہو سکتا |
| دستاویزات بغیر نیویگیشن کے 25 markdown فائلیں ہیں | تلاش کرنا مشکل، بھروسہ کرنا مشکل |
| کوئی لائیو ثبوت یا status نہیں | رفتار یا تیاری کا کوئی احساس نہیں |
| شامل ہونے کا کوئی طریقہ نہیں | دلچسپی کو شراکت میں نہیں بدلا جا سکتا |

---

## 3. پوزیشننگ اور پیغام

### 3.1 Category اور one-liner
- **Category:** ایک کھلا معیار (مفت ٹولز اور ایک انڈیکس کے ساتھ) قابلِ عمل، قابلِ تصدیق
  کھانے پکانے کے لیے۔
- **One-liner:** *Cookwala محفوظ طریقے سے کھانا پکانے کے لیے کھلا معیار ہے: لوگ، کچن اور روبوٹس۔*
- **Triad**, جو ہر جگہ استعمال ہوتا ہے:
  - **کیا بنانا ہے۔** ریسیپیز (Recipes) بطور مراحل جن کی ایک مشین منصوبہ بندی کر سکے۔
  - **یہ کب مکمل ہوتا ہے۔** قابلِ پیمائش اختتامی شرائط: درجہ حرارت، کھانے کی حالت کے اشارے، اوقات۔
  - **کیا کبھی نہیں ہونا چاہیے۔** حفاظتی حدود جو ڈیوائس خود نافذ کرتی ہے۔

### 3.2 مشن اور ویژن (نظرثانی شدہ)
- **Mission:** *ہر کسی کی مدد کرنا کہ وہ اچھی طرح، حفاظت سے، سستی اور بغیر ضائع کیے کھا سکے، چاہے کھانا پکانے والا کوئی بھی ہو۔*
- **Vision:** *زمین پر کوئی بھی کچن کسی بھی ترکیب کو حفاظت سے پکا سکتا ہے، اور اچھا کھانا کوڑے دان کے بجائے لوگوں تک پہنچتا ہے۔*
- **Why the change:** "end world hunger" طویل مدتی وجہ کے طور پر برقرار رہتا ہے، جو شواہد کے ساتھ بتایا گیا ہے۔ Cookwala اس میں کم ضائع ہونے والے مواد، food rescue اور سستی کوکنگ کے ذریعے حصہ ڈالتا ہے، ان پروگراموں، فنڈنگ اور پالیسی کے ساتھ جن کی بھوک کو ضرورت ہے۔

### 3.3 کہانی

> گھریلو روبوٹ آ رہے ہیں: Figure 03، 1X NEO اور کچن روبوٹ شپنگ ہو رہے ہیں یا آرڈرز لے رہے ہیں۔ وہ حرکت کرنا سیکھ رہے ہیں، لیکن کسی نے بھی اس طرح سے یہ نہیں لکھا ہے جسے مشین چیک کر سکے کہ "simmer" کا کیا مطلب ہے، کب چکن محفوظ ہے، یا ایک دادی کی مولخیہ کیسے بنائی جاتی ہے۔ ہر بنانے والا اپنی مخصوص ریسیپیز لکھتا ہے، جو زیادہ تر چند ہی کھانوں سے ہوتی ہیں۔
>
> Cookwala نے fifi.cooking پر ایک خاندان کی مصری گھریلو ریسیپیز سے آغاز کیا اور ایک سادہ سا سوال پوچھا: آپ ایک مشین کو ریسیپی کیسے دیتے ہیں، اور کیسے جانتے ہیں کہ وہ اسے محفوظ طریقے سے پکائے گی؟
>
> اس کا جواب ایک اوپن اسٹینڈرڈ ہے۔ یہ بتاتا ہے کہ کیا بنانا ہے، کب ہر مرحلہ مکمل ہوتا ہے، اور کیا کبھی نہیں ہونا چاہیے۔ ڈیوائس کسی بھی چیز کو گرم کرنے سے پہلے اسے چیک کرتی ہے، اور اندازہ لگانے کے بجائے refusal before heat کرتی ہے۔ وہی ریسیپیز آج لوگوں اور food bank کے لیے کام کرتی ہیں، اور وہ کل زمین پر موجود ہر کھانا پکانے کے طریقے کو سیکھنے دیں گی، ان باورچیوں کے کریڈٹ کے ساتھ جنہوں نے انہیں سکھایا۔

*(بانی کو اصل جملے کی تصدیق اور اسے ذاتی نوعیت کا بنانا چاہیے۔ اصلی ہونا نکھرے ہوئے ہونے سے بہتر ہے۔)*

### 3.4 میسج ہاؤس

| ستون | وعدہ | ثبوت جو ہم آج دکھا سکتے ہیں |
|---|---|---|
| **ڈیزائن سے محفوظ** | آلات اندازہ لگانے کے بجائے انکار کرتے ہیں، اور مقامی طور پر حدود نافذ کرتے ہیں | 32 operations کے لیے operation envelopes; safety-limits pack; dry run; conformance |
| **قابلِ تصدیق** | کوئی بھی ترکیب، ایک آلہ اور ایک ریکارڈ چیک کر سکتا ہے | Signatures, key revocation, event-log checkpoints; 106 vectors incl. RFC results |
| **کھلا اور غیر جانبدار** | Royalty-free, model-agnostic, device-agnostic | Licences; governance path; no API keys |
| **ہر پکوان** | حقیقی گھریلو کھانا پکانے سے بنا ہوا، multilingual | fifi.cooking corpus; Arabic and English; world-cuisines plan |
| **روبوٹس سے پہلے مفید** | کچن اور food banks کو اب فائدہ پہنچتا ہے | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **رضامندی کے ساتھ سیکھتا ہے** | حقیقی کھانا پکانا بہتر روبوٹس بن جاتا ہے، کریڈٹ کے ساتھ | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 زبان کے قواعد
- **استعمال کریں:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **پرہیز کریں:** "revolutionary", "first and largest" (جب تک کہ سچ نہ ہو), "end hunger" (بطور سرخی),
  "AI-powered" (غیر واضح)۔
- **ہر نمبر کو** *measured*, *modelled* یا *assumed* کے طور پر لیبل کریں۔
- کسی چیز کے موجود ہونے کا اشارہ دینے کے بجائے **"now / next / later"** کہیں۔

---

## 4. سامعین اور ان کی پہلی کامیابی

| سامعین | کام جو کرنا ہے | پہلی کامیابی (≤ 15 min) | پھر |
|---|---|---|---|
| **Robot and appliance makers** | ہر ترکیب لکھے بغیر، کوکنگ فیچرز کو محفوظ طریقے سے بھیجیں | 5 ترکیبوں کے خلاف اپنے ڈیوائس پروفائل کا dry run کریں؛ ہر مرحلے پر accept/refuse دیکھیں | Core API (reference hub) نافذ کریں، conformance پاس کریں، ڈیوائس کو registry میں شائع کریں |
| **AI-agent builders** | ایجنٹس کو نقصان کے بغیر کھانے کے منصوبے بنانے اور کھانا آرڈر کرنے دیں | Cookwala MCP سرور شامل کریں؛ اپنے ماڈل پر agent-safety benchmark چلائیں | عمل کرنے سے پہلے AgentMandate اور dry run کا استعمال کریں |
| **Kitchens and food banks** | surplus کو محفوظ طریقے سے بچائیں، غذائیت سے بھرپور مینیو ترتیب دیں | SMS پیشکش بھیجیں، یا CSV بھریں؛ rule-pack چیک دیکھیں | Humanitarian Profile کے ساتھ پائلٹ کریں |
| **Cooks and recipe creators** | اپنی ترکیبوں کو زندہ اور کریڈٹ کے ساتھ رکھیں | ایڈیٹر کے ساتھ ایک ترکیب کو تبدیل کریں؛ اسے validation پاس کرتے ہوئے دیکھیں | ریکارڈنگز کا حصہ بنائیں (رضامندی کے ساتھ)؛ کریڈٹس میں ظاہر ہوں |
| **Researchers and reviewers** | ڈیٹا، benchmarks، ایماندارانہ assumptions | سیمولیٹر چلائیں؛ تنقید اور conformance suite پڑھیں | datasets استعمال کریں؛ ریویوز شائع کریں |
| **Funders and policymakers** | اثرات، خطرات اور گورننس دیکھیں | 2 صفحات کا whitepaper خلاصہ اور concept note پڑھیں | پائلٹس کے لیے فنڈز فراہم کریں؛ گورننس میں شامل ہوں |

---

## 5. پروڈکٹ آرکیٹیکچر: Cookwala کیا پیش کرتا ہے

| تہہ (Layer) | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 پہلے device feedback کے بعد | Core 1.0 ایک foundation کے تحت |
| **Index and registry** | مثال کے طور پر recipes; registry spec | fifi.cooking corpus تبدیل شدہ (1,881 recipes, Arabic + English); verified namespaces | کمیونٹی کلیکشنز، عالمی پکوان |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Recipe editor (web) |
| **Reference hub** | Core API spec | Docker hub ایک simulated device کے ساتھ، تاکہ quickstart `curl` مقامی طور پر کام کرے | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | نظرثانی شدہ limits; عوامی agent-safety نتائج | Certification scheme ایک certifier کے ساتھ |
| **Humanitarian** | Profile, rule pack, templates, concept note | مصر food-bank پائلٹ | Food-bank network کا اپنایا جانا |
| **Data** | رضامندی کے ساتھ ExecutionLog | Contributor network، پہلی رضامندی شدہ dataset | Hugging Face Hub پر multi-cuisine benchmark |

---

## 6. ویب سائٹ

### 6.1 سائٹ میپ

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 ہوم پیج، اوپر سے نیچے

| # | سیکشن | مقصد | مواد |
|---|---|---|---|
| 1 | **Hero** | ایک ہی سانس میں بتائیں کہ یہ کیا ہے | ون لائنر، triad، دو بٹن (*Try the dry run*, *Read the quickstart*)؛ ایماندارانہ اسٹیٹس چپ "Draft standard · v0.2" |
| 2 | **Live demo** | بتائیں نہیں، دکھائیں | "کیا یہ ڈیوائس یہ ریسیپی پکا سکتی ہے؟" ایک ریسیپی اور ایک ڈیوائس کا انتخاب کریں؛ ہر قدم done / person / refuse دکھاتا ہے، اس رول کے ساتھ جس نے فیصلہ کیا |
| 3 | **The problem** | فرق کو محسوس کروائیں | روبوٹس آ رہے ہیں؛ "simmer" کے مختلف معنی ہیں؛ چند ہی کچن سے بند ریسیپیز؛ لوگ بھوکے رہتے ہیں جبکہ کھانا ضائع ہو جاتا ہے |
| 4 | **The loop** | ایک ذہنی ماڈل | Describe → Check → Cook → Learn، ہر ایک کے ساتھ artifact اور command |
| 5 | **Pick your path** | ہر وزیٹر کے لیے راستہ | پانچ کارڈز (سیکشن 4)، ہر ایک کے ساتھ پہلی کامیابی |
| 6 | **Proof** | مومینٹم اور ایمانداری | `/v1/stats.json` سے لائیو کاؤنٹرز (operations defined, conformance vectors, schemas, recipes published, languages)؛ ہر نمبر لیبل شدہ ہے |
| 7 | **Safety** | اعتماد | سیفٹی مقامی ہے؛ refusal؛ ایجنٹ رولز؛ recalls؛ /trust کا لنک |
| 8 | **Works today** | روبوٹس سے پہلے افادیت | Humanitarian Profile، SMS مثال، simulators |
| 9 | **Now / next / later** | ایماندارانہ روڈ میپ | سیکشن 5 سے |
| 10 | **Open** | غیر جانبدار اور شامل ہونے کے قابل | Licences، گورننس پاتھ، contribute، GitHub |

### 6.3 ڈیزائن کی سمت
- **احساس:** پرسکون، درست، گرمجوش۔ کچن کی روح کے ساتھ ایک پیشہ ورانہ آلہ۔
- **ٹائپ:** UI کے لیے ایک درست grotesque اور ڈیٹا اور کوڈ کے لیے ایک mono face۔ ہیرو کے لیے بڑا، ہلکا ڈسپلے ٹائپ (Figure کے اعتماد کو ادھار لیتے ہوئے)، بغیر اس کی سینیمیٹک تاریکی کی نقل کیے بغیر۔
- **رنگ:** نیوٹرل پیپر اور انک جس میں ایک ہیٹ ایکسنٹ (ember orange) ہو جو درجہ حرارت کے ڈیٹا کو بھی نشان زد کرے۔ پیلیٹ کو رنگ اندھے قارئین کے لیے ویلیڈیٹ کیا گیا ہے، اور لائٹ اور ڈارک دونوں تھیمز ڈیزائن کیے گئے ہیں۔
- **تصاویر:** حقیقی ہاتھ اور حقیقی گھریلو کچن جب ہمارے پاس ہوں، کبھی اسٹاک روبوٹس نہیں۔ تب تک، ڈایاگرامز اور لائیو ڈیمو صفحے کو آگے بڑھاتے ہیں۔
- **حرکت:** ایک لمحہ، مرحلہ وار dry run۔ باقی سب ساکن ہے۔
- **شروع سے ہی دو لسانی:** انگریزی اور عربی (دائیں سے بائیں لے آؤٹ)، پھر دیگر۔
- **رسائی (Accessibility):** WCAG 2.2 AA; کی بورڈ; کم شدہ حرکت; صرف رنگ کے ذریعے کوئی معلومات نہیں۔

### 6.4 Interactivity
1. براؤزر میں dry run (recipe × device)۔
2. Envelope explorer: ایک temperature trace کو ڈریگ کریں اور دیکھیں کہ یہ کب "simmer" سے باہر نکلتا ہے۔
3. Simulators، پروٹوکول کے on اور off ہونے کے ساتھ۔
4. Recipe step viewer: ایک قدم کا جملہ، اس کا JSON اور اس کا envelope ساتھ ساتھ۔
5. Later: ایک recipe editor جو ٹائپ کرتے وقت conformance کی تصدیق کرتا ہے۔

---

## 7. دستاویزات

Diátaxis فریم ورک کے ذریعے منظم، تاکہ ہر صفحہ کا ایک ہی کام ہو:

| قسم | مقصد | صفحات |
|---|---|---|
| **Tutorials** | کر کے سیکھیں | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | ایک کام حل کریں | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | چیزیں تلاش کریں | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | سمجھیں کہ کیوں | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Docs ergonomics:**
- بائیں جانب نیویگیشن، سرچ، "Copy page"، "Edit on GitHub"، پچھلے/اگلے لنکس؛
- زبان کے ٹیبز (Python / JavaScript / cURL / CLI)؛
- AI قارئین کے لیے `llms.txt` اور فی صفحہ مارک ڈاؤن؛
- ایک چیٹ شیٹ اور عام مسائل کا صفحہ؛
- تاریخوں کے ساتھ ایک چینج لاگ۔

---

## 8. API اور SDK

| Deliverable | کیا | کیوں |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (from `tools/`) | پہلی کامیابی کے لیے ایک کمانڈ |
| `@cookwala/sdk` (TypeScript) | schemas سے تیار کردہ Types؛ Core API client؛ براؤزر میں dry run | ویب اور ایجنٹ ڈویلپرز |
| Reference hub (Docker) | ایک simulated device اور safety limits کے ساتھ Core API | quickstart کا `curl` مقامی طور پر کام کرتا ہے؛ سازندگان کے لیے test bed |
| MCP server | Tools: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | ہر MCP-قابل ایجنٹ Cookwala کو محفوظ طریقے سے استعمال کر سکتا ہے |
| ROS 2 package | `cookwala_msgs` (actions)، Core API کے لیے ایک bridge node | روبوٹ ساز |
| Exporters | LeRobot, OpenTelemetry (مکمل) | سیکھنا اور observability |
| Evals | promptfoo agent-safety benchmark (مکمل) | ایجنٹ بنانے والے، safety reviewers |
| Versioning | Core کے لیے Semver؛ dated schema bundle؛ changelog؛ deprecation windows | استحکام کا وعدہ |
| Status | cookwala.ai endpoints کے لیے عوامی status page | اعتماد |

---

## 9. ڈیمو (Demos)

| ڈیمو | سامعین | اسٹیٹس |
|---|---|---|
| In-browser dry run | سب کے لیے | Building now |
| Simulators (home, city, country, world) | سب کے لیے، فنڈز دینے والے | Live |
| Agent-safety results across models | Agent builders, AI labs | Next (run the benchmark, publish results with method) |
| SMS food-rescue walkthrough | Food banks | Next (recorded demo) |
| ایک حقیقی ڈیوائس Cookwala ریسیپی پکا رہی ہے، غیر ترمیم شدہ | سب کے لیے | Later (سب سے اہم ڈیمو؛ ڈیوائس پارٹنر کی ضرورت ہے) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Robotics researchers | Later |

---

## 10. کمیونٹی اور ترقی

- **Contributor network** (Figure's Index سے متاثر):
  - *Cooks* ان ترکیبوں کے باہمت رضامندی والے سیشنز ریکارڈ کرتے ہیں جنہیں وہ جانتے ہیں، ہر ترکیب اور dataset card پر کریڈٹ کے ساتھ۔
  - *Kitchens and food banks* پائلٹ۔
  - *Makers* آلات نافذ کرتے ہیں۔
  - *Reviewers* rule packs اور envelopes کا جائزہ لیتے ہیں۔
  - *Translators* مراحل اور ذخیرہ الفاظ کا ترجمہ کرتے ہیں۔
  - بامعاوضہ شراکت later آتی ہے، جو grants سے فنڈڈ ہوتی ہے۔ باخبر رضامندی اور منصفانہ شرائط کے بغیر ڈیٹا کے لیے کبھی ادائیگی نہ کریں۔
- **Rituals:** ماہانہ کمیونٹی کال؛ حقیقی اعداد و شمار کے ساتھ سہ ماہی "state of Cookwala"؛ عوامی ریویو تھریڈز۔
- **Partnership sequence:** stakeholder tracker سے پہلے دس (food bank, WFP Innovation Accelerator, Home Assistant, ایک device startup, ایک یونیورسٹی لیب, ایک certifier, World Central Kitchen, ایک فاؤنڈیشن, ایک نیوٹرل گھر, ایک creator)۔
- **Channels:** GitHub Discussions، ایک نیوز لیٹر، کانفرنس ٹاکس (ROSCon, IROS/ICRA workshops, food-tech events)، عربی زبان کے چینلز۔

---

## 11. Metrics

- **North-star metric:** *verified cooks*, ان executions کی تعداد جنہوں نے ایک consented، conforming log کے ساتھ ایک signed Cookwala recipe کو end to end چلایا۔ جب تک وہ صفر ہے، leading indicators کو ٹریک کریں۔

| Funnel | Metric | Target by 2027-03 |
|---|---|---|
| Attract | /start کے ماہانہ وزٹرز | 2,000 |
| Activate | مکمل شدہ dry runs (web + CLI) | 500 |
| Build | conformance پاس کرنے والی Independent Core implementations | 2 |
| Adopt | بچائے گئے food-bank pilot kg (measured) | پہلا 6-month pilot چل رہا ہے |
| Contribute | merged changes کے ساتھ بیرونی contributors | 15 |
| Trust | شائع شدہ بیرونی reviews | 6 |
| Learn | رضامندی شدہ execution logs | 1,000 |

---

## 12. Roadmap

ہر آئٹم کے اسٹیٹس کے ساتھ برقرار رکھا گیا roadmap [`ROADMAP.md`](ROADMAP.md) ہے۔ نیچے دی گئی ٹیبل اصل 180-day پلان ہے، جسے ریکارڈ کے لیے رکھا گیا ہے۔

| کب | ویب سائٹ اور کہانی | ڈویلپر کا تجربہ | معیار اور حفاظت | کمیونٹی |
|---|---|---|---|---|
| **Now (یہ ریلیز)** | لائیو dry run، triad، paths، proof، now/next/later کے ساتھ نیا ہوم پیج؛ docs viewer؛ `llms.txt`؛ ٹرسٹ پیجز (security، governance) | Dry run؛ LeRobot اور OTel exporters؛ ROS 2 actions؛ agent-safety benchmark | Registry spec (namespaces، versions، hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **اگلے 30 دن** | /start quickstart؛ عربی ہوم پیج؛ تمام صفحات پر claims pass | `pip install cookwala`؛ reference hub (Docker) | پہلے benchmark نتائج شائع ہوئے | food bank کے لیے concept note؛ Home Assistant تجویز |
| **60 دن** | fifi corpus (پہلے 100 تبدیل شدہ) کے ساتھ /recipes index؛ /humanitarian | TS SDK؛ MCP server | ایک food scientist کی طرف سے envelope review | پہلی community call |
| **90 دن** | Whitepaper + 2-page summary؛ /roadmap | ROS 2 package | device feedback سے Core 0.3 | Device partner، یونیورسٹی لیب |
| **180 دن** | Real-device demo ویڈیو | Recipe editor | Certifier gap analysis | Pilot نتائج؛ foundation application |

---

## 13. اس حکمت عملی کے خطرات

| خطرہ | تدارک |
|---|---|
| ایک پتلی حقیقت پر ایک چمکدار سائٹ ہائپ (hype) معلوم ہوتی ہے | ہر دعویٰ لیبل شدہ؛ حقیقی ڈیٹا سے لائیو کاؤنٹرز؛ now/next/later |
| بہت زیادہ سامعین میں پھیل جانا | اگلے 90 دنوں کے لیے دو بنیادی راستے: ڈیوائس بنانے والے اور food bank۔ دوسروں کی مدد کی جاتی ہے لیکن ان کا پیچھا نہیں کیا جاتا |
| بڑے پلیٹ فارمز بند متبادل فراہم کرتے ہیں | وہ غیر جانبدار، قابل تصدیق تہہ بنیں جسے وہ اپنا سکیں؛ اوپن کھلاڑیوں (Hugging Face, Open Robotics, Home Assistant) کے ساتھ شراکت داری کریں |
| کنٹریبیوٹر ڈیٹا کا غلط استعمال | اختیاری، واپس لینے کے قابل رضامندی؛ کوئی ذاتی ڈیٹا نہیں؛ شائع شدہ ڈیٹا کارڈز |
| فاؤنڈر کی بینڈوتھ | مزید تفصیلات سے پہلے ڈویلپر کا تجربہ (package, hub) فراہم کریں؛ ایک co-maintainer بھرتی کریں |

