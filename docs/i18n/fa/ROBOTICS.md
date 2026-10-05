<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->

# Cookwala و پشته رباتیک

Cookwala هیچ بخشی از یک ربات را جایگزین نمی‌کند. این ابزار لایه‌ای را اضافه می‌کند که در پشته رباتیک برای آشپزی مفقود است: **چه چیزی ساخته شود، چه زمانی هر مرحله انجام شده است، و چه چیزی هرگز نباید اتفاق بیفتد**، در قالبی که هر ربات، لوازم خانگی، شبیه‌ساز یا خط لوله یادگیری می‌تواند بخواند و بررسی کند.

## کجا قرار می‌گیرد

| لایه | نمونه‌هایی از لایه (2026؛ هیچ یکپارچگی با هیچ‌کدام از آن‌ها وجود ندارد) | آنچه Cookwala اضافه می‌کند |
|---|---|---|
| ربات‌ها و لوازم خانگی | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, ربات‌های آشپزخانه (Moley, Miso, Chef Robotics), فرهای هوشمند | یک دستور پخت مستقل از دستگاه که می‌تواند آن را dry-run، refuse یا پخت کند؛ محدودیت‌های ایمنی روی دستگاه |
| میان‌افزار | ROS 2, ros-controls, Open-RMF (ناوگان‌ها), Matter (لوازم خانگی) | اکشن‌های ROS 2 برای دستورهای پخت و مراحل (`bindings/ros2`); یک پیش‌نویس نگاشت عملیاتی Matter (`bindings/matter.json`, تایید نشده)؛ یک وظیفه Open-RMF یک مشارکت برنامه‌ریزی شده است |
| یادگیری ربات | LeRobot (Hugging Face), NVIDIA Isaac GR00T, مدل‌های Physical Intelligence π, Figure Helix | وظایف گام‌به‌گام با زبان طبیعی و بخش‌های گام برای مجموعه‌داده‌ها؛ معیارهای انجام شده به عنوان اهداف ارزیابی |
| شبیه‌سازی | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | operation envelopeها و بردارهای conformance به عنوان شرایط تست |
| عوامل هوش مصنوعی | MCP, A2A, Claude, OpenAI و مدل‌های متن‌باز | AgentMandate، قانون untrusted-text، بنچمارک ایمنی عامل آشپزخانه |

Cookwala عامداً **above motion** است. ربات‌های مدرن دست‌ورزی را به صورت end to end یاد می‌گیرند؛
Cookwala وظیفه، تست موفقیت و safety envelope را به آن‌ها می‌دهد و یک execution log دریافت می‌کند.

## ROS 2

`bindings/ros2/` دو اکشن را تعریف می‌کند:

| اقدام | هدف | بازخورد | نتیجه |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | حالت نهایی، دلیل refusal، `ExecutionLog` |
| `ExecuteNode` | یک node دستور پخت، operation envelope آن، یک هدف محدودتر اختیاری | پیشرفت، medium temperature، هدف حاصل شده | Envelope OK، rung استفاده شده، خلاصه مرحله، انحراف |

**لغو کردن** یک هدف `ExecuteRecipe` یک `StopRequest` است: سرور باید به‌صورت ایمن متوقف شود.
**محدودیت‌های ایمنی** داخل دستگاه باقی می‌مانند؛ هیچ فیلد هدفی نمی‌تواند آن‌ها را تغییر دهد. یک hub که یک دستور پخت را بین چندین ربات تقسیم می‌کند، اهداف `ExecuteNode` را ارسال می‌کند، و می‌تواند اعزام در سطح ناوگان را به عنوان وظایف به **Open-RMF** واگذار کند.

## LeRobot و مجموعه‌داده‌های robot-learning

حلقه LeRobot عبارت است از teleoperate ← record ← train ← deploy، و `LeRobotDataset v2.1` آن وظایف با زبان طبیعی را در `meta/tasks.jsonl` ذخیره می‌کند (v3 متادیتا را به parquet منتقل کرد؛ اکسپورتر امروزه فایل با سبک v2.1 را می‌نویسد و یک نویسنده v3 در مرحله next است). دستورالعمل‌های Cookwala از قبل شامل یک جمله برای هر مرحله هستند، و execution log زمان شروع و پایان هر مرحله را ثبت می‌کند.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

این می‌نویسد:
- `meta/tasks.jsonl` را، یک task برای هر مرحله دستور پخت؛
- `meta/cookwala/<log>.json` را با hash دستور پخت، بخش‌های مرحله (ثانیه‌های شروع و پایان،
  rung مربوط به sensor-ladder، نتیجه envelope) و رضایت household.

ویدیو و اقدامات از ضبط‌کننده خودِ ربات می‌آیند. خروجی، از ارسال logها بدون رضایت dataset خودداری می‌کند.

## شبیه‌سازی

بردارهای conformance در `conformance/envelope.json` (ردپاهای دما با نتایج مورد انتظار) و قوانین sensor-ladder برای شبیه‌ساز آماده هستند. یک شبیه‌سازی حرارتی یا فیزیکی از یک ماهیت، یک قابلمه یا یک فر می‌تواند در برابر همان envelopeهایی که یک دستگاه واقعی باید رعایت کند، امتیازدهی شود. Isaac Lab، Gazebo و MuJoCo کاندیداهایی برای یک بنچمارک عمومی "cook in simulation" هستند.

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

این یک trace از نوع OpenTelemetry می‌نویسد: یک span برای هر مرحله، با ویژگی‌های `cookwala.*` (rung، envelope OK، deviation) و رویدادهای safety-limit. این داده‌ها در هر backend از نوع OTLP (مانند Jaeger، Grafana Tempo، LangSmith...) بارگذاری می‌شوند، بنابراین تیم‌ها می‌توانند دستگاه‌ها را همان‌گونه که agentها را دیباگ می‌کنند، دیباگ کنند.

## dry run: آیا این دستگاه می‌تواند این دستور پخت را تهیه کند؟

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

dry run قبل از اینکه چیزی گرم شود پاسخ می‌دهد. این می‌گوید که دستگاه کدام مراحل را انجام می‌دهد، یک فرد کدام مراحل را انجام می‌دهد، هر مرحله چگونه تأیید خواهد شد (sensor، model، time یا person)، یا اولین دلیلی که باید refusal before heat را انجام دهد.

