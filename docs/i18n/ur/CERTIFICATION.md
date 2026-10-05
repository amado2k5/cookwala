<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance اور certification کی طرف راستہ

**Status:** draft, 2026-10-04 (RFC-0008). ابھی تک کسی certifier کو شامل نہیں کیا گیا ہے؛ یہ وہ راستہ ہے جو standard پیش کرتا ہے۔

## 1. تین اقدامات

| قدم | کون | اس کا کیا مطلب ہے | اس طرح دکھایا جاتا ہے |
|---|---|---|---|
| **Self-declared** | بنانے والا یا پبلشر | پبلک ٹول کے ساتھ پبلک ویکٹرز چلائے اور اپنے ہی کی (key) سے دستخط شدہ ایک `ConformanceReport` (`schemas/conformance.schema.json`) شائع کی | رپورٹ، سویٹس (suites) اور کاؤنٹس کے ساتھ؛ کبھی بھی بیج (badge) کے طور پر نہیں |
| **Verified** | ایک registry آپریٹر | اسی ویکٹر سیٹ ہیش کے خلاف رن کو دوبارہ دہرایا اور رپورٹ پر کاؤنٹر سائن کیا | رپورٹ کے ساتھ ساتھ ویریفائر |
| **Certified** | ایک آزاد سرٹیفائر (آج کوئی موجود نہیں ہے) | ایک شائع شدہ اسکیم کے تحت سویٹ کے ساتھ ساتھ ہارڈ ویئر اور سیفٹی کیس چیک کیے اور نشان (mark) عطا کیا | رپورٹ، سرٹیفائر، نشان |

ایک رپورٹ جو کسی کلاس کے کسی بھی ویکٹر میں ناکام ہو جائے وہ اس کلاس کا دعویٰ نہیں کر سکتی۔ registry رپورٹس دکھاتی ہے، badges نہیں۔

آج واحد registry آپریٹر specification maintainer (cookwala.ai) ہے، اس لیے جب تک دوسری registry موجود نہیں ہوتی "verified" کوئی آزادی نہیں لاتا؛ status اب بھی self-verification کے طور پر دکھایا جاتا ہے۔

## 2. ایک رپورٹ میں کیا شامل ہوتا ہے

بنیادی ورژن، وہ کلاس جس کا دعویٰ کیا گیا (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) یا پروفائل دعویٰ (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`)، موضوع (پروڈکٹ، وینڈر، ورژن)، وہ سویٹس جو ٹوٹل اور فیلڈ
vector ids کے ساتھ چلائے گئے، ویکٹر سیٹ کا ہیش، ٹول اور کمٹ، تاریخ، اسٹیٹس اور
verifier۔ مثال: `examples/conformance/report-reference.json`, جو کہ تیار کیا گیا ہے

```bash
python tools/run_conformance.py --report report.json
```

## 3. کلاسز اور وہ کیا ثابت کرتی ہیں

| کلاس | ویکٹرز | certification کے لیے مزید درکار ہے (ویکٹرز کے ذریعے کور نہیں کیا گیا) |
|---|---|---|
| Recipe publisher | hash, envelope (bands کے اندر targets), units | food-safety professional کی طرف سے recipes کا content review |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | ڈیوائس کا اپنا safety case (ISO 13482, IEC 60335, UL 3300 جیسا کہ لاگو ہو)؛ measured local stop latency؛ بغیر نیٹ ورک کے enforced safety limits |
| Catalog | hash, signature, key revocation, recalls | key custody اور incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | method کے ساتھ model کے مطابق شائع شدہ results |
| Verifier | تمام Core suites | کوئی نہیں |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; کوئی personal data audit نہیں |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name اور version rules, tombstones | namespace proof process |

## 4. certification کیا وعدہ نہیں کر سکتی

ایک conformance رپورٹ یہ ثابت کرتی ہے کہ سافٹ ویئر نے اس دن ویسا ہی برتاؤ کیا جیسا کہ vectors تقاضا کرتے ہیں۔
یہ اس بات کا ثبوت نہیں ہے کہ کوئی ڈیوائس ہر کچن میں محفوظ ہے، کہ کوئی ترکیب ذائقے میں درست ہے، یا کہ
کوئی نقصان نہیں پہنچ سکتا۔ ایک ایسا معیار جو صفر نقصان کا وعدہ کرے وہ غیر ایماندارانہ ہوگا؛ یہ معیار وعدہ کرتا ہے
کہ limits مقامی طور پر نافذ کی جاتی ہیں، کہ refusals heat سے پہلے ہوتے ہیں، اور کہ ریکارڈز کو
چیک کیا جا سکتا ہے۔

## 5. مارک کی گورننس (Governance)

سرٹیفیکیشن کا نشان اور اس کے اصول ٹریڈ مارک کے ساتھ نیوٹرل فاؤنڈیشن میں منتقل ہو جاتے ہیں (`GOVERNANCE.md`)۔ تب تک کوئی نشان موجود نہیں ہے؛ صرف رپورٹس موجود ہیں۔

