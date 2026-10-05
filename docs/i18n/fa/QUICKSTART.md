<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->
# شروع سریع

پنج دقیقه، بدون سخت‌افزار. شما یک دستور پخت را فراخوانی می‌کنید، آن را هش می‌کنید، می‌پرسید که آیا یک دستگاه می‌تواند آن را بپزد، یک ردپای دما را با باند ایمن یک operation چک می‌کنید، و یک cooking log را به عنوان یک trace صادر می‌کنید. همه موارد زیر امروز کار می‌کنند.

## ۱. ابزارها را تهیه کنید

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash` ، `dryrun` و اکسپورترها تنها از کتابخانه استاندارد Python استفاده می‌کنند. سایر بسته‌ها برای اعتبارسنجی کامل و امضاها هستند. یک بسته `pip install cookwala` در مرحله next در نقشه راه قرار دارد.

## 2. یک دستور پخت را واکشی کرده و آن را هش کنید

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

یک اجراکننده دقیقاً همین بازبینی را پخته و اگر هش داده شده به آن مطابقت نداشته باشد، امتناع می‌کند.

## ۳. آیا این دستگاه می‌تواند آن را بپزد؟

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

پاسخ `refused` با دلیل `needs_human_present` است: برش ممکن است بدون نظارت اجرا نشود.
یک نفر اضافه کنید:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

اکنون `accepted` است. برنامه می‌گوید که بازو کدام مراحل را انجام می‌دهد، یک فرد کدام مراحل را انجام می‌دهد، و هر مرحله چگونه بررسی خواهد شد (sensor، تخمین ثبت شده، زمان یا فرد). همین کار را در مرورگر در [home page](/#demo) امتحان کنید.

## ۴. بررسی یک ردپای دما در برابر یک باند ایمن

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## ۵. همه چیز را اعتبارسنجی کنید و تست‌های conformance را اجرا کنید

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. تبدیل یک log پخت‌وپز به یک trace یا یک dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` در هر backend مربوط به OpenTelemetry بارگذاری می‌شود. `my-dataset/meta/` برای مجموعه‌داده‌های سبک LeRobot، هر مرحله از دستور پخت را در قالب یک task نگه می‌دارد. هر دو، logهایی را که household آن‌ها opt in نکرده بود، refuse می‌کنند.

## بعد (next)

| شما هستید | Next |
|---|---|
| سازنده یک ربات یا لوازم خانگی | [Robots, ROS 2 and datasets](ROBOTICS.md)، سپس [Core API](CORE.md#7-execution-lifecycle-and-api) |
| سازنده یک عامل AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) و [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| مدیریت یک آشپزخانه یا food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| نوشتن دستور پخت | [Recipe format](RECIPE-FORMAT.md) و [Contributing](../CONTRIBUTING.md) |

