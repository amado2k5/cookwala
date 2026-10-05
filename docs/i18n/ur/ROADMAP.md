<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# روڈ میپ: now، next، later

**Status:** 2026-10-04. ہر آئٹم ایک اسٹیٹس رکھتا ہے: **done**, **in progress**, **planned**,
**not yet funded**۔ گیٹس `ACTION-PLAN.md` سیکشن 4 سے آتے ہیں۔ نامزد کردہ ثبوت کے بغیر کوئی بھی چیز planned
سے done میں منتقل نہیں ہوتی۔

## Now (یہ ریلیز)

| آئٹم | اسٹیٹس |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (تقریباً ایک سال کے اندر، جیسا کہ وسائل اجازت دیں)

| آئٹم | Status | Gate |
|---|---|---|
| operation envelopes کا food scientist ریویو | planned | reviewer agrees |
| چار rule packs کا dietitian اور food-safety officer ریویو | planned | reviews filed; packs move to reviewed |
| household profile کا data-protection impact assessment | planned | reviewer agrees |
| ایک food-bank پائلٹ (12 weeks، pre-registered، independent evaluator) | not yet funded | partner اور funding (`humanitarian/CONCEPT-NOTE.md`) |
| کئی model families کے لیے Agent-safety benchmark نتائج | planned | runs published with method |
| `pip install cookwala` wheel اور npm پر `@cookwala/sdk` | planned | packaging جو vocabularies اور schemas کو bundle کرتی ہے |
| Registry service (`validate`, `publish`, tombstones) | planned | ایک worker اور namespace proof |
| reference hub کے خلاف Core API نافذ کرنے والا پہلا device maker | planned | ایک maker agrees; conformance report published |
| پہلی fifi.cooking collections کی conversion | planned | founder ہر collection کے لیے rights کا فیصلہ کرتا ہے |
| device feedback سے Core 0.3 | planned | دو implementers' feedback |
| Steering committee | planned | تین independent adopters یا دو implementations |

## Later

| آئٹم | اسٹیٹس |
|---|---|
| ایک حقیقی ڈیوائس جو Cookwala ریسیپی پکا رہی ہے، غیر ترمیم شدہ، ویڈیو پر | ابھی تک فنڈز فراہم نہیں کیے گئے؛ ڈیوائس پارٹنر کی ضرورت ہے |
| ایک آزاد سرٹیفائر کے ساتھ Certification اسکیم | منصوبہ بندی کی گئی؛ کوئی سرٹیفائر شامل نہیں کیا گیا |
| سپیسیفیکیشن، ٹریڈ مارک اور مارک کے لیے غیر جانبدارانہ بنیاد | منصوبہ بندی کی گئی |
| کنٹریبیوٹر نیٹ ورک: کریڈٹ کے ساتھ حقیقی ریسیپیز کی رضامندی سے ریکارڈ شدہ ویڈیوز | منصوبہ بندی کی گئی |
| پروگراموں اور کوآپریٹیوز کے ذریعے شائع کردہ ڈیمانڈ اور سپلائی سگنلز | منصوبہ بندی کی گئی، مقابلے کے قانون کے جائزے کے بعد |
| "Cook in simulation" بینچ مارک (Isaac Lab, Gazebo یا MuJoCo) | منصوبہ بندی کی گئی |
| Humanitarian Profile کے لیے Digital Public Good کی شناخت | منصوبہ بندی کی گئی، پائلٹ ثبوت کے بعد |
| ورلڈ سیمولیٹر میں کراس ریجن ریلیف فلو؛ کلین کوکنگ کے اثرات | منصوبہ بندی کی گئی |

## ہم کیا نہیں کریں گے

ذاتی ڈیٹا جمع کریں؛ بغیر کسی طریقے کے نمبر شائع کریں؛ کسی شراکت دار کا نام اس کی رضامندی سے پہلے لیں؛
ایسی certification کا دعویٰ کریں جو موجود نہیں ہے؛ کسی بھی لیجر پر household data رکھیں؛ ایک مرکزی
orchestrator بنائیں جس پر کچن منحصر ہوں؛ بھوک ختم کرنے کا دعویٰ کریں۔

## Kill اور pivot rules

ایکشن پلان سے: اگر دو بیرونی ریویو راؤنڈز کسی ڈیوائس میکر یا پائلٹ پارٹنر کو پیدا کرنے میں ناکام رہتے ہیں، تو Cookwala Humanitarian Profile اور ریسیپی فارمیٹ تک محدود ہو جاتا ہے۔ اگر ایک پائلٹ 5 % سے کم اضافہ دکھاتا ہے، تو نتائج شائع کر دیے جاتے ہیں اور کسی بھی اسکیلنگ سے پہلے پروفائل کو دوبارہ ڈیزائن کیا جاتا ہے۔

