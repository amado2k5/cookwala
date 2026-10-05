<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# پخلنځي او تولیدي جریانونه: رستورانتونه، ټولنه، ښوونځی، بیړني حالت او روبوټیک پخلنځيونه

> **تت: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> مثالونه: `examples/fleet/`.

## ۱. ولې

创建一个者 په یو رستورانت، په یو واده، په یو مرستندویه کمپاین یا په یو خواړه کارخانې کې ورته پروتکول غوښتی (RFC-0005). لنډیز د ښوونځي د ډوډۍ پروګرامونه او د ناڅاپي بیړتیا په وخت کې پخلي (disaster kitchens) هم اضافه کوي. Core یو وسیله چې یو خواړه پخوي پوښي؛ Humanitarian Profile د زیات (surplus) انتقال او د ډوډۍ شمېرle پوښي. د دوی ترمنځ **kitchen** موقعیت لري: سټیشنونه، وسیلې، خلک، ډېرې ډلې (batches)، د خدمت کولو کړکیฬ (serve window)، مهم کنټرول ټکي، او د یوې وسیلې د execution log څخه تر هغه ډوډۍ پورې تړاو چې یو پروګرام یې راپور ورکوي.

## 2. اسناد

| اسناد | څه وايي |
|---|---|
| `Kitchen` | یو سازمان پخلنځی: ډول، سټیشنونه (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash)، وسیلې د وړتیا په توګه، په هر ساعت کې د ډوډۍ ظرفیت، hot-hold او cooling تجهیزات، فعاله rule packs، د کارمندانو **د رول په اساس شمېر**، د کار ساعتونه |
| `ProductionRun` | ریسیپیز د batch counts او servings سره، یو serve window، د هر ریسیپي ګام لپاره یو سټیشن او یو `device` ته، یو `person` ته یا دواړو ته سپارښتنه، د critical control point ریکارډونه (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation)، تولید شوي Core executions، او یو پایله (تولید شوې او وړاندې شوې ډوډۍ، ضایعات، کارول شوي rescued food، پاتې پاتې کېدونکي (failures)، پېښې، انرژي، لګښت، هغه Humanitarian `Distribution` چې یې خپره کړې ده) |
| `StationLease` | د یوې ځانګړې دورې لپاره د یوې وسیلې یا رول لخوا د یو سټیشن ځانګړی کارول |

## ۳. دا څنګه له نورو سره یوځای کیږي

- یو ګام چې یو `device` ته ځانګړی شوی وي، یو Core `ExecuteRequest` (یا د ROS 2 binding له لارې یو `ExecuteNode` هدف) دی؛ د هغه `ExecutionLog` هیش په `executions` کې ځي.
- یو run چې یو پروګرام ته خدمت کوي، یو Humanitarian `Distribution` خپره کوي؛ د run `ccps` د ویش د خوندیتوب موندنو تر شا شواهد دي.
- د Humanitarian Profile څخه rule packs د run مینو او توکو باندې پلي کیږي.
- د Fleet dispatch (چې کوم روبوټ چېرته ځي) اړوند Open-RMF یا د پلورونکي fleet manager ته دی، نه دې profile ته.

## 4. پر کار کړل شوی مثال

`examples/fleet/kitchen-disaster.json` او `production-run-disaster.json`: یو مرستندویه پخلنځی
چې د دوو ګازي کټلو، د ګرم ساتلو واحدونو (hot-hold units) او د یخ په غوټۍ (ice bath) سره، د دوو ساعتونو لپاره ۷۱۰ ډوله د مېش (lentil soup) او وریژې تولیدوي، د پخلي او ګرم ساتلو درجات ثبتوي، یو ګرم ساتلو واحد له 60 °C څخه لاندې ومومي او هغه ډله مخکې له خدمت کولو څخه بیا ګرموي، او یوې وېشنې (distribution) ته یې راڅخه کوي. دا مثال یوازې د ښوونکي په توګه دی؛ هیڅ حقیقي پخلنځی یا پېښه بیان نه ده شوې.

## ۵. څه شی په قصدي ډول پرېښودل شوی دی

د کارمندانو نومونه او مهالوېره، معاشونه، د پیرودونکو غوښتنلیکونه او تادیات، د مینو نرخونه. کارمندان د رول په اساس د شمېر په ډول ښکاره کېږي ترڅو د هر چا په پیژندلو پرته د هر ډوډۍ لګښت محاسبه کېدای شي.

## 6. Next

د رستورانت خدمت نمونه د یو روبوټ سټیشن سره؛ د run state machine لپاره د conformance suite؛ د `StationLease` سره د session leases (`session.schema.json`) یوځای کول.

