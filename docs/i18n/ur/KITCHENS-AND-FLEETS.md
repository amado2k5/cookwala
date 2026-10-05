<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# کچن اور پروڈکشن رنز: ریسٹورنٹس، کمیونٹی، اسکول، ڈیزاسٹر اور روبوٹ کچنز

> **حالت: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> مثالیں: `examples/fleet/`.

## 1. کیوں

بانی نے ایک ریسٹورنٹ، ایک شادی، ایک عطیہ مہم یا ایک food factory (RFC-0005) میں اسی پروٹوکول کا مطالبہ کیا۔ خلاصہ اسکول کے کھانے کے پروگراموں اور disaster kitchens کو بھی شامل کرتا ہے۔ Core ایک ڈیوائس کے ایک ترکیب پکانے کا احاطہ کرتا ہے؛ Humanitarian Profile surplus کی منتقلی اور کھانوں کی گنتی کا احاطہ کرتا ہے۔ ان کے درمیان **kitchen** واقع ہے: اسٹیشنز، ڈیوائسز، لوگ، بہت سے batches، ایک serve window، critical control points، اور ایک ڈیوائس کے execution log سے ان کھانوں تک کا لنک جو ایک پروگرام رپورٹ کرتا ہے۔

## 2. دستاویزات

| دستاویز | یہ کیا کہتا ہے |
|---|---|
| `Kitchen` | ایک تنظیم کا کچن: قسم، اسٹیشنز (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash)، صلاحیت کے حوالے کے طور پر آلات، فی گھنٹہ کھانوں کی تعداد میں گنجائش، hot-hold اور cooling کے آلات، نافذ العمل rule packs، عملہ **کردار کے لحاظ سے تعداد**، کام کے اوقات |
| `ProductionRun` | بیچ کی تعداد اور سرو کرنے کے ساتھ تراکیب، ایک سرو ونڈو، ہر ترکیب کے مرحلے کے لیے ایک اسٹیشن اور ایک `device` کو، ایک `person` کو یا `either` کو تفویض، اہم کنٹرول پوائنٹ کے ریکارڈز (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation)، تیار کردہ Core executions، اور ایک نتیجہ (تیار کردہ اور سرو کیے گئے کھانے، ضائع شدہ مواد، استعمال شدہ rescued food، ناکامیاں، واقعات، توانائی، لاگت، وہ Humanitarian `Distribution` جو اس نے خارج کیا) |
| `StationLease` | ایک مخصوص وقت کے لیے کسی آلے یا کردار کے ذریعے ایک اسٹیشن کا خصوصی استعمال |

## 3. یہ باقی کے ساتھ کیسے جڑتا ہے

- ایک `device` کو تفویض کردہ ایک قدم ایک Core `ExecuteRequest` (یا ROS 2 binding کے ذریعے ایک `ExecuteNode` مقصد) ہے؛ اس کا `ExecutionLog` hash `executions` میں جاتا ہے۔
- ایک run جو ایک پروگرام کی خدمت کرتا ہے وہ ایک Humanitarian `Distribution` جاری کرتا ہے؛ run کے `ccps` اس distribution کے safety findings کے پیچھے ثبوت ہیں۔
- Humanitarian Profile سے rule packs run کے menu اور items پر لاگو ہوتے ہیں۔
- Fleet dispatch (کون سا روبوٹ کہاں جائے گا) Open-RMF یا کسی vendor کے fleet manager سے متعلق ہے، اس profile سے نہیں۔

## 4. حل شدہ مثال

`examples/fleet/kitchen-disaster.json` اور `production-run-disaster.json`: ایک ریلیف کچن
دو گیس کیٹلز، hot-hold units اور ایک آئس باتھ کے ساتھ دو گھنٹے کے وقفے کے لیے 710 دال کے سوپ اور
چاول کے کھانے تیار کرتا ہے، پکانے اور hot-hold کے درجہ حرارت کا ریکارڈ رکھتا ہے، ایک hot-hold unit کو
60 °C سے نیچے پاتا ہے اور سرو کرنے سے پہلے اس بیچ کو دوبارہ گرم کرتا ہے، اور ایک ڈسٹری بیوشن جاری کرتا ہے۔ یہ مثال
وضاحتی ہے؛ کسی حقیقی کچن یا واقعے کی وضاحت نہیں کی گئی ہے۔

## 5. کیا جان بوجھ کر چھوڑ دیا گیا ہے

عملے کے نام اور شیڈول، اجرتیں، صارفین کے آرڈر اور ادائیگیاں، مینو کی قیمتیں۔ عملہ کردار کے لحاظ سے تعداد میں ظاہر ہوتا ہے تاکہ کسی کی شناخت کیے بغیر فی کھانا لاگت کا حساب لگایا جا سکے۔

## 6. Next

ایک روبوٹ اسٹیشن کے ساتھ ریسٹورنٹ سروس کی مثال؛ رن اسٹیٹ مشین کے لیے ایک conformance سوٹ؛ `StationLease` کا سیشن لیز (`session.schema.json`) کے ساتھ ہم آہنگی۔

