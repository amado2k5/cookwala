<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# وہ تنقیدات جو ہم نے شائع کیں

ہم نے Cookwala کے بارے میں مشکل سوالات پوچھے اور ان کے جوابات لکھ لیے۔ ہر تشویش کا ایک id [action plan's concern register](ACTION-PLAN.md#2-concern-register) میں موجود ہے، ساتھ ہی ہمارا جواب اور اس کا status بھی درج ہے۔ باہر سے کیے گئے reviews کو خوش آمدید کہا جاتا ہے اور انہیں یہاں فہرست میں شامل کیا جائے گا۔

## کیا یہ کام کرے گا؟ (strategy)

| تشویش | مختصر جواب | Status |
|---|---|---|
| مارکیٹ ابھی موجود نہیں ہے؛ spec مصنوعات سے آگے ہے | Small Core، پہلے demo، صارفین کے بغیر کوئی نئی spec نہیں | Core 0.2 مکمل؛ device demo next |
| کسی طاقتور کے پاس اپنانے کی کوئی وجہ نہیں ہے | ہر adopter کے فائدے کے ساتھ قیادت کریں؛ روبوٹس کے بغیر مفید | Food-bank pilot اور device partner کی تلاش جاری ہے |
| سیمولیٹرز وہی ثابت کرتے ہیں جو وہ assume کرتے ہیں | منصفانہ baseline، ranges، "illustrative" لیبلز؛ pilots ان کی جگہ لیں گے | Open |
| بھوک غربت اور تنازعات کے بارے میں ہے، surplus کے بارے میں نہیں | Cookwala حصہ ڈالتا ہے؛ یہ اکیلے بھوک ختم کرنے کا دعویٰ نہیں کرتا | Message تبدیل کر دیا گیا |
| حفاظت، ذمہ داری اور attack surface | device پر حدود نافذ؛ refusal؛ recalls؛ incident reports | Spec مکمل؛ certifier review open |
| رازداری (صحت اور مذہب کا ڈیٹا، ledgers بمقابلہ erasure) | Local-first، منتخبانہ انکشاف، hash-only logs، رضامندی | Spec مکمل؛ impact assessment open |
| بہت پیچیدہ | Core 0.2؛ باقی سب experimental کے طور پر نشان زد | Done |
| بانی پر انحصار | ایک غیر جانبدار گھر کے لیے governance کا راستہ | GOVERNANCE.md |

## کیا تکنیکی ڈیزائن درست ہے؟

| تشویش | Core 0.2 میں کیا تبدیل ہوا |
|---|---|
| Operations کا کوئی جسمانی مفہوم نہیں تھا | Envelopes، heat levels، sensor ladders، altitude rule، test vectors |
| Unit اور number کے بگ | صرف °C، absolute tolerances، kitchen units، densities، decimal money |
| Schemas نے ٹائپو قبول کیے | `x-` extensions کے ساتھ Strict schemas؛ offline bundle |
| ایک mutable Mission دستاویز | Event log + projection، single sequencer، transitions table |
| Ledger نے بہت کم ثابت کیا | Revocation کے ساتھ Key records، witnessed checkpoints، rewrite detection |
| Undefined event delivery؛ bus پر safety | Sequence numbers، latency classes، heartbeats، "safety is local" |
| API surfaces کا ڈرفٹ ہونا | Core OpenAPI؛ CI میں ہر reference چیک کیا گیا |
| کوئی verifier نہیں تھا | Reference library اور 106 conformance vectors |

## وہ ریویوز جو ہم مانگ رہے ہیں

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), food scientists
(envelopes), food-safety officers and dietitians (rule packs), a security audit, a
data-protection review, and a certifier's gap analysis. دیکھیں
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

