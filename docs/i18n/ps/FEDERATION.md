<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# فدراکشن: Cookwala پرته له مرکز څخه څنګه کار کوي

**Status:** draft, 2026-10-04 (RFC-0006). بنسټ گزار ته یو شیدې خټه وه: هیڅ مرکزي
امر (command) نشته، خو بیا هم همغږي او رغونه شتون لري. دا پاڼه وايي چې په عمل کې د دې معنی څه ده.

## ۱. Nodes

| Node | څه خدمت کوي | څوک یې چلوي |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | یو د ترکیب خپرونکی (recipe publisher)، یو food-bank شبکه، یوه پوهنتون، یو د وسیلې جوړونکي، cookwala.ai |
| **Registry** | `/v1/registry.json`: catalogs ته اشاره کونکي، collections، devices، packs، benchmarks | هر څوک؛ cookwala.ai یو چلوي |
| **Hub** | د پخلنځي لپاره Core API، ځايي د خوندیتوب محدودیتونه، household context | هر پخلنځی؛ په offline کار کوي |
| **Mirror** | د نورو nodes لاسلیک شوي توکي پرته بدلون بیا خپروي | هر څوک چې په خپل سیمه کې resilience غواړي |

یو ثابت فولډر (static folder) یو معتبر کټالوګ دی. یو تلیفون چې د CSV templates سره وي، په H0 کچې کې یو معتبر بشري مرستې ته ګډونوال دی.

## 2. تغذیه، نه امرونه

نودونه لاسلیک شوي فیډونه خپروي: recalls، بې نومې پېښې، registry بدلونونه، کلیدي ریکارډونه.
نور نودونه هغه څه پوښتنه کوي چې پر هغوی باور لري او ممکن یې بیا خپره کړي. هیڅ ነገር په پخلنځय (kitchen) کې نه کېښودل کېږي؛ یو kitchen هغه وخت معلومات اخلي کله چې آنلاین وي او کله چې آنلاین نه وي بیا هم کار کوي.

## 3. د صادرونکي په وړاندې تایید کړئ، هیڅکله د ریلې (relay) په وړاندې نه

هغه recall چې له یوې mirror څخه راځي، یوازې د **issuer's** لاسلیک په اندازه ښه دی. یو hub د issuer's `KeyRecord` د هغه خپل discovery document یا did:web څخه ترلاسه کوي او body byte for byte تاییدوي. د mirror key د منځپانګې په اړه هیڅ ثبوت نه وړاندې کوي؛ هغه mirror چې یو recall سموي، لاسلیک ماتوي. په `conformance/profiles/federation.json` کې Profile vectors درې حالتونه ښیي.

## 4. د باور لیستونه

هر hub د هغو کټالوګونو او registries یو لیست ساتي چې پرې باور لري، د هغوی کلیدونو او یوې ترجیح سره.
یو node ممکن همکاران (`federation.peers`) وړاندیز کړي؛ hub پرې پریکړه کوي. cookwala.ai په داسې یو لیست کې یوه ننوتنه ده، نه یو root.

## 5. تازه والی

د Registry اندراجونه یو حالت او د خپرولو وخت لري؛ recalls د خپرېدو وخت لري؛ د household facets اعتبار لري. پخوانی (stale) توکي بیا ترلاسه کېږي یا پرېښودل کېږي. هیڅ شی ځکه باور نه ورڅخه کېږي چې پخوانی دی، هیڅ شی په خاموشۍ کې نه مني: ځان پرېښودل شوي اندراجونه د tombstones په څېر پاتې کېږي.

## ۶. تاریخچه

د شاهدۍ ټکي (checkpoints) لرونکي د پېښو لاګونه (Core section 5) بیا لیکل پرته له blockchain څخه بلاکچین پرته د بیا لیکلو په موندلو کې مرسته کوي: یو دوهم لړۍ د لاګ سر باندې لاسلیک کوي، او یو later بیا لیکل بیا سم نه وي. د checkpoint سرونو عامه اېنکرینګ (anchoring) اختیاري دی او دا د بنسټ گزار پریکړه ده (`docs/research/BACKSTORY.md` section 4.7).

## ۷. درې نوډ (nodes) چې سره کار کوي

- **یو food bank شبکه** د خپلو پخلنځونو او ډونرانو یو registry، د ملي قانون ته سم شوي خپلو rule pack'ونو یو catalog، او یو SMS gateway چلوي. دا په cookwala.ai directory کې ځان لیستوي یا نه؛ د دې معلومات هیڅکله باید خپل هیواد څخه بهر لاړ نشي.
- **یو د وسیلې جوړونکي** د خپلو وړتیايي اسنادو او safety-limit pack'ونو یو catalog چلوي، conformance راپورونه خپره کوي، او د هغو catalogs د recall feeds پلټنه کوي چې त्याचे پیرودونکي کاروي.
- **یو پوهنتیاوي لابراتوار** د benchmark ترکیبونو او execution log'ونو (په رضایت سره) یو catalog چلوي، اصطلاحات په mirrored ډول وړاندې کوي، او خپل vector خپره کوي.

د هغوی څخه هیڅ یو ته اړتیا نلري چې cookwala.ai آنلاین وي.

## 8. څه چې نه دی جوړ شوی

یو مرکزي تنظیم کوونکی (orchestrator)، یو مرکزي هویت چمتو کوونکی، یو ټوکن، یو بلاک چین. د Mission profile's quorum پریکړې او تنظیم کوونکي (orchestrators) اختیاري او تجربوي پاتې کیږي.

