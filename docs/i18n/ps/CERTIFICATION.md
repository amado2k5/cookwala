<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# conformance او د certification لاره

**Status:** draft, 2026-10-04 (RFC-0008). لا تر اوسه هیڅ certifier په کار کې نه دی اخیستی؛ دا هغه لاره ده
چې معیار وړاندیزوي.

## ۱. درې पाوع

| ګام | څوک | د دې معنی څه ده | ښودل کېږي داسې |
|---|---|---|---|
| **Self-declared** | جوړونکي یا خپرونکی | په عامه وسیله سره عامه وېکټورونه (vectors) چل کړل او یو `ConformanceReport` (`schemas/conformance.schema.json`) یې خپره کړ، چې په خپل کلید (key) باندې لاسلیک شوی وي | راپور، له سویټونو (suites) او شمېرونو سره؛ هیڅکله بدج (badge) نه |
| **Verified** | د registry عملیات کوونکی | په ورته وېکټور سیټ هیش (vector set hash) باندې چل بیا ترسره کړ او راپور یې بیا لاسلیک کړ | راپور او ورې事情 (verifier) |
| **Certified** | یو خپل ایست (independent) certifier (نن ورځ هیڅ یو شتون نلري) | په خپره شوې طرحه (scheme) باندې سویټ او د هارډویر او خوندیتوب-کیس (safety-case) معاینات ترسره کړل او نښه یې ورکړه | راپور، certifier، نښه |

هغه راپور چې د یوې ټولګې (class) څخه هر ډول وېکتور (vector) ناکام کوي، نشي کولی هغه ټولګی ادعا کړي. registry راپورونه ښيي، نه badges.

نن یوازী registry اپریټر مشخصات ساتونکی (cookwala.ai) دی، نو تر هغه وخته چې دویم registry شتون ونژدي، "verified" هیڅ ډول استقلال نه زیاتوي؛ حالت لا هم د self-verification په توګه ښودل کیږي.

## 2. راپور څهមានوي

بنیادي نسخه، هغه کلاسم چې ادعا شو (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) یا د پروفایل ادعا (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`)، موضوع (product, vendor, version)، هغه suite چې په مجموعه کې چلېږي او د وتلیو او ناکامیدو vector ids، د vector set هیش، وسیله او commit، تاریخ، حالت او
verifier. مثال: `examples/conformance/report-reference.json`, چې د دې لخوا تولید شوی دی

```bash
python tools/run_conformance.py --report report.json
```

## ۳. ټولګې او هغه څه چې ते ثابتوي

| کلاسه | وېکتورونه (Vectors) | د certification لپاره نور هم اړین دي (چې د وېکتورونو لخوا نه دي پوښل شوي) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | د خوراک خوندي ساتنې متخصص لخوا د ترکیبونو (recipes) د منځپانګې بیاکتنه |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | د وسیلې خپل safety case (ISO 13482, IEC 60335, UL 3300 لکه څنګه چې लागू وي); اندازه شوي (measured) ځدني ځنډ (local stop latency); پرته له شبکې څخه د خوندي حدودو پلي کول |
| Catalog | hash, signature, key revocation, recalls | د کلید ساتنه او د پېښې ترلاسه کولو پروسه |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | د ماډل له مخې په طریقه (method) خپر شوي پایلې |
| Verifier | ټول Core suites | هیڅ |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | د معلوماتو د مسؤلیت بیاکتنه; د شخصي معلوماتو audting نشته |
| Household | disclosure policy | د معلوماتو د خوندي ساتنې اغېزمنነት ارزونه |
| Registry | نوم او د आवृत्ती (version) قواعد، tombstones | د namespace ثبوت پروسه |

## 4. هغه څه چې certification نشي تضمین کولی کولی

د conformance راپور ثابتوي چې سافټویر په هغه ورځ چې چل شوی و، د وېکټرونو (vectors) اړتیاو سره سم چلند کړی دی.
دا ثابت نه کوي چې یو وسیله په هر پخلنځي کې خوندي ده، یا یو خواړه (recipe) خوند یې سم دی، یا دا چې
هیڅ ډول زیان نشي کولی. د هغه معیار چې د صفر زیان ژمن کوي، ناڅرخي به وي؛ دا معیار ژمنوي
چې محدودیتونه په سیمه ییزه کچه پلي کیږي، refusal before heat پلي کیږي، او records چک کیدی شي.

## 5. د نښې حکومتداري

د certification نښه او د هغې قواعد له trademark سره د بې طرفه بنسټ ته ځي (`GOVERNANCE.md`). تر هغه ጊዜ پورې هیڅ نښه شتون نلري؛ یوازې راپورونه شتون لري.

