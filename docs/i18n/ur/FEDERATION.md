<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# فیڈریشن: Cookwala بغیر کسی مرکز کے کیسے کام کرتا ہے

**Status:** draft, 2026-10-04 (RFC-0006). بانی کی تصویر ایک شہد کی مکھی کے چھتے جیسی تھی: کوئی مرکزی کمانڈ نہیں، پھر بھی ہم آہنگی اور بحالی۔ یہ صفحہ بتاتا ہے کہ عملی طور پر اس کا کیا مطلب ہے۔

## 1. Nodes

| Node | یہ کیا فراہم کرتا ہے | اسے کون چلاتا ہے |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | ایک recipe publisher, ایک food-bank network, ایک یونیورسٹی, ایک device maker, cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs, collections, devices, packs, benchmarks کے اشارے | کوئی بھی; cookwala.ai ایک چلاتا ہے |
| **Hub** | ایک کچن کے لیے Core API, مقامی safety limits, household context | ہر کچن; offline کام کرتا ہے |
| **Mirror** | دوسرے nodes کی signed items کو بغیر کسی تبدیلی کے دوبارہ شائع کرتا ہے | کوئی بھی جو اپنے علاقے میں resilience چاہتا ہو |

ایک static folder ایک معتبر catalog ہے۔ CSV templates والا ایک فون level H0 پر ایک معتبر humanitarian participant ہے۔

## 2. فیڈز، کمانڈز نہیں

نوڈز دستخط شدہ فیڈز شائع کرتے ہیں: recalls، گمنام واقعات، registry کی تبدیلیاں، کلیدی ریکارڈز۔
دیگر نوڈز ان چیزوں کو پول کرتے ہیں جن پر وہ بھروسہ کرتے ہیں اور انہیں دوبارہ شائع کر سکتے ہیں۔ کچن میں کچھ بھی پش نہیں کیا جاتا؛ ایک کچن تب پول کرتا ہے جب وہ آن لائن ہو اور جب وہ نہیں ہوتا تو کام جاری رکھتا ہے۔

## 3. جاری کرنے والے کے خلاف تصدیق کریں، ریلے کے خلاف کبھی نہیں

ایک recall جو آئینے (mirror) کے ذریعے پہنچتا ہے وہ صرف **issuer** کے دستخط جتنا ہی قابل اعتماد ہوتا ہے۔ ایک hub issuer کے اپنے discovery document یا did:web سے issuer کا `KeyRecord` حل کرتا ہے اور باڈی کو byte for byte تحقق کرتا ہے۔ آئینے کی key مواد کے بارے میں کچھ ثابت نہیں کرتی؛ ایک mirror جو recall میں ترمیم کرتا ہے وہ signature کو توڑ دیتا ہے۔ `conformance/profiles/federation.json` میں profile vectors تینوں صورتیں دکھاتے ہیں۔

## 4. Trust lists

ہر hub ان catalogs اور registries کی ایک فہرست رکھتا ہے جن پر وہ بھروسہ کرتا ہے، ان کی keys اور ایک priority کے ساتھ۔ ایک node peers (`federation.peers`) تجویز کر سکتا ہے؛ hub فیصلہ کرتا ہے۔ cookwala.ai ایسی فہرست میں ایک entry ہے، root نہیں ہے۔

## 5. تازگی

Registry entries ایک status اور ایک publication time رکھتے ہیں؛ recalls ایک issue time رکھتے ہیں؛ household facets ایک validity رکھتے ہیں۔ Stale items کو re-fetch کیا جاتا ہے یا drop کر دیا جاتا ہے۔ کسی بھی چیز پر بھروسہ نہیں کیا جاتا کیونکہ وہ old ہے، کچھ بھی خاموشی سے delete نہیں کیا جاتا: withdrawn entries tombstones کے طور پر رہتی ہیں۔

## 6. تاریخ

مشاہدہ شدہ checkpoints (Core section 5) کے ساتھ event logs بلاک چین کے بغیر بھی rewrites کو قابلِ شناخت بنا دیتے ہیں: ایک دوسرا فریق log کے head پر counter-sign کرتا ہے، اور ایک later rewrite اب مزید مطابقت نہیں رکھتا۔ checkpoint heads کی public anchoring اختیاری ہے اور یہ ایک founder decision ہے (`docs/research/BACKSTORY.md` section 4.7)۔

## 7. تین نوڈز جو آپس میں کام کرتے ہیں

- **ایک food bank نیٹ ورک** اپنے کچن اور عطیہ دہندگان کی ایک registry، قومی قانون کے مطابق ڈھلے ہوئے اپنے rule pack کا ایک کیٹلاگ، اور ایک SMS گیٹ وے چلاتا ہے۔ یہ خود کو cookwala.ai directory میں درج کرتا ہے یا نہیں؛ اس کا ڈیٹا کبھی بھی اپنے ملک سے باہر جانے کی ضرورت نہیں ہوتی۔
- **ایک ڈیوائس بنانے والا** اپنی قابلیت کے دستاویزات اور safety-limit pack کا ایک کیٹلاگ چلاتا ہے، conformance رپورٹس شائع کرتا ہے، اور ان کیٹلاگز کے recall فیڈز کا جائزہ لیتا ہے جنہیں اس کے صارفین استعمال کرتے ہیں۔
- **ایک یونیورسٹی لیب** بینچ مارک ریسیپیز اور execution log (رضامندی کے ساتھ) کا ایک کیٹلاگ چلاتی ہے، اصطلاحات کی عکاسی کرتی ہے، اور اپنے vectors شائع کرتی ہے۔

انہیں ان میں سے کسی کو بھی cookwala.ai کے آن لائن ہونے کی ضرورت نہیں ہے۔

## 8. کیا نہیں بنایا گیا ہے

ایک مرکزی آرکیسٹریٹر، ایک مرکزی شناخت فراہم کنندہ، ایک ٹوکن، ایک بلاک چین۔ مشن پروفائل کے کورم فیصلے اور آرکیسٹریٹرز اختیاری اور تجرباتی رہتے ہیں۔

