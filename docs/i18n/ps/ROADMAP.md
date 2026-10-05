<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# نقشه: اوس، وروسته، بیا وروسته

**Status:** 2026-10-04. هر 항목 یو حالت لري: **done**، **in progress**، **planned**،
**not yet funded**. دروازې (Gates) د `ACTION-PLAN.md` څلورمې برخې څخه راځي. هیڅ ነገር له planned څخه
مخکې لاړ نه شي تر هغه چې نومېدل شوی شواهد (evidence) ته ورسېږي.

## اوس (دا ریلیز)

| توکي | حالت |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| په انګلیسي او عربي کې نه ډېرې نمونه ایښودل شوي خواړه | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| د روغتیا rule packs (بنیادي، د زیان منونکو ډلو پاملرنه، ښوونځي کې خواړه، د صوډیم کمول) د review template سره | done (drafts awaiting professional review) |
| Household Context Profile له یوې 139-type facet registry او disclosure vectors سره | done (draft) |
| Registry او directory API, honest `registry.json` او `directory.json` | done (static) |
| پخلنځي او production runs; supply signals | done (experimental) |
| Federation rules او relay vectors | done (draft) |
| څلور simulators چې پروتکول یې on او off دی | done (illustrative) |
| په انګلیسي او عربي کې ویب پاڼه چې د هر stakeholder لپاره یوه پاڼه، whitepaper او deck لري | in progress |

## Next (په اړه کې یو کال کې، لکه څنګه چې سرچینې اجازه ورکوي)

| توکي | حالت | دروازه |
|---|---|---|
| د operation envelopes په اړه د خوراکي توکو د ساینس پوه پرکتیک | planned | بیاکتنې کسان موافق دي |
| د څلورو rule packs په اړه د تغذیې پوه او د خوراکي توکو د خوندیتوب افسر بیاکتنې | planned | بیاکتنې ثبت شوي؛ packs REVIEWED ته ځي |
| د household profile د ډیټا خوندي کولو اغېزمنیت ارزونه | planned | بیاکتنې کسان موافق دي |
| یو food-bank پایلوت (12 ولۍ، مخکې ثبت شوی، خپلواک ارزونکی) | not yet funded | شریک او تمویل (`humanitarian/CONCEPT-NOTE.md`) |
| د څو ماډلونو لپاره د Agent-safety معیار پایلې | planned | په میتود سره چاپ شوي |
| `pip install cookwala` wheel او `@cookwala/sdk` په npm باندې | planned | هغه پیکیجینګ چې vocabularies او schemas یوځای کوي |
| Registry خدمت (`validate`, `publish`, tombstones) | planned | یو کارکوونکی او namespace proof |
| لومړی د وسیلو جوړونکی چې Core API د reference hub په وړاندې پلي کوي | planned | یو جوړونکی موافق دی؛ conformance راپور چاپ شوی |
| د لومړۍ fifi.cooking مجموعه اړول | planned | بنسټ گزار د هرې مجموعې لپاره حقونه پرېکوي |
| د وسیلو له فیډبک څخه Core 0.3 | planned | د دوو پلي کونکو فیډبک |
| Steering committee | planned | درې خپلواک adopters یا دوه implementations |

## وروسته

| توکي | حالت |
|---|---|
| یو حقیقي وسیله چې د Cookwala ریسیپي پخوي، بې له ترمیم، په ویډیو کې | لا نه دی تمویل شوی؛ د وسیلې شریک ته اړتیا لري |
| د یو خپلواک تایید کوونکي سره د certification سکیم | پلان شوی؛ هیڅ تایید کوونکی په کار کې نه دی |
| د مشخصاتو، نښې او علامې لپاره بې طرفه بنسټ | پلان شوی |
| د مرسته کوونکو شبکه: د حقیقي ریسیپیز رضاکارانه ریکارډونه په نوم سره | پلان شوی |
| د پروګرامونو او همکارۍ ټولنیزو لخوا خپړل شوي د تقاضا او وړاندې کولو سیګنالونه | پلان شوی، د رقابت قانون بیاکتنې وروسته |
| "په ماډل کې پخول" benchmark (Isaac Lab, Gazebo یا MuJoCo) | پلان شوی |
| د بشري پروفایل لپاره د ډیجیټل عامه ګټې پیژندل | پلان شوی، د پایلو (pilot evidence) وروسته |
| په نړۍ کې د ماډل کې د سیمه ییزې مرستې جریانونه؛ پاک پخولو ته اغېزې | پلان شوی |

## موږ به څه ونه کړو

شخصي معلومات راټولول؛ پرته له کومې طریقې څخه شمیره خپره کول؛ له موافقې وړاندې د شریک نومول؛
د داسې certification ادعا کول چې شتون نلري؛ د household data په هر ډول ledger کې اچول؛ داسې یو central
orchestrator جوړول چې پخلنځي پرې تړلي وي؛ د وږی ختمولو ادعا کول.

## د وژلو او بدلون (pivot) قواعد

له عملي پلان څخه: که دوه بهرنی بیاکتنه راؤنډونه د ډیوایس جوړونکي یا د پایلوټ شریک ترلاسه کولو کې ناکام شي، Cookwala د بشري پروفایل (Humanitarian Profile) او د ریسیپي فارمیټ ته محدودېږي. که یو پایلوټ له ۵ % څخه کم ګټه وښودله، نو پایلې خپره کېږي او د هر ډول پراختیا (scaling) څخه وړاندې پروفایل بیا ډیزاینېږي.

