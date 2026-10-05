<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# هغه نیوکې چې موږ خپره کړې دي

موږ د Cookwala په اړه سختې پوښتنې وکړې او ځوابونه یې ولیکل. هرې اندിښنې ته په [action plan's concern register](ACTION-PLAN.md#2-concern-register) کې یو id ورکړل شوی دی، چې د زموږ ځواب او د هغې status هم ورسره دی. له بهر څخه راغلي بیاکتنې ښه راغلاست لرून دي او دلته به لیست شوي شي.

## ایا دا کار به کوي؟ (strategy)

| اندېښنه | لنډ ځواب | حالت |
|---|---|---|
| بازار لا تر اوسه شتون نلري؛ مشخصات د محصولاتو څخه مخکې دي | Small Core، لومړی ډیمو، پرته له کاروونکو څخه نوي مشخصات نشته | Core 0.2 بشپړ شو؛ د وسیلې ډیمو next |
| هیڅ باوري څوک د کارولو لپاره دلیل نلري | د هر کاروونکي ګټې سره مخکې لاړ شئ؛ پرته له روبوټونو ګټور دی | د Food-bank پایلوټ او د وسیلې شریک لټل کیږي |
| سیمولیټرونه هغه څه ثابتوي چې دوی assume کوي | منصفانه baseline،范围، "illustrative" لیبلونه؛ پایلوټونه هغه ځای نیسي | Open |
| ભૂکې د فقر او شخړو په اړه ده، نه د surplus په اړه | Cookwala مرسته کوي؛ دا ادعا نه کوي چې یوازې ભૂکې پای ته رسوي | پیغام بدلون موندلی |
| خوندیتوب، مسؤلیت او attack surface | په وسیله باندې محدودیتونه پلي شوي؛ refusal؛ recalls؛ د حادثو راپورونه | مشخصات بشپړ شول؛ د certifier بیاکتنه open ده |
| شخصي معلومات (د روغتیا او دیني معلومات، ledegers په مقابل کې erasure) | Local-first، انتخابي افشاګرۍ، یوازې hash logs، رضایت | مشخصات بشپړ شول؛ د اغېزو ارزونه open ده |
| ډېر پیچلي | Core 0.2؛ نور هر څه experimental وټاکل شوي | Done |
| د بنسټ گزار په تړاو अवलंबភាព | یو بې طرفه کور ته د governance لار | GOVERNANCE.md |

## ایا تخنیکي ډیزاین باثبات دی؟

| اندېښنه | په Core 0.2 کې څه بدلون راغی |
|---|---|
| عملیات هیڅ فزیکي مانا نه درلوده | Envelopes، د تودوخې کچې، sensor ladders، د الټیټیوډ قاعده، test vectors |
| د واحد او شمېرې غلطۍ | یوازې °C، مطلق ټولرانس، د پخلنځي واحدونه، کثافتونه، اعشاري پیسې |
| Schemas غلط مخې写 (typos) منل | `x-` سره سخت Schemas؛ offline bundle |
| یو بدلیدونکی Mission سند | Event log + projection، یوازې sequencer، transitions table |
| Ledger ډېر کم ثبوت وړاندې کړ | د لغوه کولو سره کلیدي ریکارډونه، شاهد چک پوټونه، د بیا لیکلو تشخیص |
| تعریف شوي ایونټ ډلیورۍ؛ په bus کې خوندیتوب | Sequence numbers، latency classes، heartbeats، "safety is local" |
| API surfaces ډریفت | Core OpenAPI؛ په CI کې هر ریفرنس چک شوی |
| هیڅ verifier نشته | Reference library او ۱۰۶ conformance vectors |

## هغه بیاکتنې چې موږ یې غواړو

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), د خوراکي توکو ساینس پوهان
(envelopes), د خوراکي توکو خوندیتوب افسران او ډایټیشن (rule packs), یو امنیتي audit، یو
د معلوماتو ساتنې review، او د یو certifier gap analysis. وګورئ:
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

