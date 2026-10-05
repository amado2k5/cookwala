<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# د کورنۍ سیاق پروفایل: ټول تصویر په کور کې پاتې کیږي

> **حالت: draft profile** (RFC-0001). د Cookwala Core برخه نه دی. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> د ترلاسه کونکي قواعد: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. مثال: `examples/household/context.json`.

## ۱. ولې

هغه روبوټ چې یو کورنۍ ته ښه خدمت کوي، اړتیا لري چې ډېر څه په اړه پوه شي: وسایل او د هغوی ځانګړتیاوې، څوک هلته ژوند کوي او کله دوی په کور کې وي، पाळीونی حیوانات، ماشومان، خوراکونه، حساسیتونه، د درملو وخت، دودونه، بودیجټ، د پیرودلو عادتونه، او هغه څه چې مخکې وخت کې غلط شوي وو. همدې حقایق د یوې غلا د پلان جوړولو او د پروفایل جوړولو لپاره وسیله دي. دا پروفایل **په کور کې پلان جوړونکي** ته بشپړ انځور ورکوي او نورو ته یوازې یو **constraint** ورکوي.

## ۲. درې نظریې

1. **Facets.** هر یو ډول حقیقت (`cw.facet.household.health.allergies`)، د هغه چا سره چې یې بیان کړی (declared, observed, reported, inferred)، کله، د څومره وخت لپاره، څومره ډاډه، او یو شخصي معلوماتو کلا (`public`, `household`, `sensitive`, `secret`).
2. **د registry په کې د سفر قواعد.** هر facet type وايي چې ایا د هغه خام ارزښت کولی شي کور پریږدي: `never` (45 ډولونه: ماشومان، غیر حاضرۍ، نقشه/layout، روغتیايي حالتونه، دین، چلند، پېښې، د عاید حالت)، یوازې د یو `derived` constraint په توګه (81 ډولونه)، یا د یو واضح اجازې وروسته د `consented` disclosure په توګه (13 ډولونه، ډیری یې د وسیلې ځانګړی حالت دی د جوړونکي لپاره).
3. **Derived constraints.** یوازینی household object چې یو د خوراکي توکو پلورونکی، پلان کونکی، د ډیلیوري خدمت، د وسیلې جوړونکی یا بل روبوټ ترلاسه کوي: "17:00–18:00 په مخکني دروازه کې وړاندې کړئ"، "د 땅 (peanuts) بندول"، "په راهه کې د روبوټ حرکت نه، 15:00–15:30"، "د هر خوراکي توکي لپاره د بودیجې حد 18.00 USD". هر یو د هغو facet **types** نومवते چې څخه یې راغلي دي، هیڅکله د هغوی ارزښتونه نه.

## ۳. څوک څه ترلاسه کوي

| ترلاسه کوونکی رول | ممکن دی چې ترلاسه کړي |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI یا سافټویر چې ډوډۍ پلانوي) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | یوازې device fault summary (د کټګورۍ له مخې د خطاګانو شمېر، وختونه نه، د household facts نه), او یوازې کله چې household یو insurer د ترلاسه کوونکي په توګه نومولی وي؛ RFC-0001 دا رول د هغه رول په توګه لیست کوي چې که د privacy review اعتراض وکړي نو د لرې کېدو ډېر احتمال لري |
| program (food bank, school) | هیڅ نه |
| dataset | هیڅ نه |

## ۴. قواعد

- خام facets هیڅکله له وسیلې څخه بهر نه ځي. هیڅ API نشته چې هغه د کور شبکه (home network) څخه بهر چا ته بیرته کړي.
- `inferred` facets هیڅکله د خوندیتوب پریکړو لپاره کارول کیږي.
- د هیڅ شخص چلندي سکور (behavioural score) نه جوړیږي او نه ذخیره کیږي. د چلند facets د کورنۍ (household) خدمت کولو لپاره شتون لري (د خوراک اندازه، کله چې پاکول کیږي) او هیڅکله سفر نه کوي.
- اقتصادي کچه یو **د مالک لخوا ټاکل شوی بودیجه (owner-set budget posture)** دی، چې هیڅکله له هیڅ ነገር څخه `inferred` نه کیږي.
- د ماشومانو معلومات او غیر حضور `secret` دي او هیڅکله سفر نه کوي، حتی که `derived` هم وي، پرته له دې چې د حرکت او خوندي زون (safe-zone) constraints وي چې هیڅ ډول مهالوېش ښکاره نه کوي.
- هر facet پاکیدونکی دی. پاکول د کورنۍ په وخت (window) کې بشپړیږي (په بشپړ ډول 7 ورځې، ډیر شمېر 30 ورځې) او پرته له محتویې `logged` کیږي.
- د شخصي معلوماتو کچه (privacy class) ممکن د registry default څخه پورته لوړ شي، خو هیڅکله ټیټه نه کیږي.

## 5. سیمه ایه حادثه یادښت (local incident memory)

RFC-0001 پوښتنه کوي چې روبوټ د خبرتیاوو، تضادونو، پرېښودلو او درسونو په اړه څه یادوي. `LocalIncident` دا معلومات ساتي: نیټه، `vocab/incidents.json` څخه کټګوري، د ډول په اساس څوک شامل و، یوه یادښت او یو درس. دا هیڅکله کور نه پریږدي. په Core کې عام، بې نوم `IncidentReport` یو بل سند دی چې هر جوړونکي ترې زده کړه کوي.

## 6. Conformance

پروفایل وېکتورونه (`conformance/profiles/disclosure_policy.json`) facets او د ترلاسه کونکي رول ورکوي او د دقیق constraint types، ښکاره شوي ids او پټ شوي ids د دلیلونو سره هیله لري. مرجع پلي کول `derive_constraints()` په `tools/cookwala_ref.py` کې دي.

## 7. د نورو اسنادو سره اړیکه

`ClientProfile`، `KitchenProfile` او `RobotProfile` (`profile.schema.json`) د اسانتۍ لپاره د ډزې (bundles) په توګه پاتې کیږي. د ماموریتیت (mission) facets (`mission.schema.json`) همدې registry ids څخه کار اخلي. Core `AgentMandate` د هغه څه د معیاري بیان په توګه پاتې کیږي چې یو agent کولای شي؛ mandate facets په سیمه ییزه توګه د کورنۍ (household) قواعد بیانوي.

## 8. پرانی سوالونه

RFC-0001 وګورئ: تړلي ترلاسه کوونکي رولونه; یوازې لوړولو ته اړینتیا لرونکی حریم خصوصی; د یو بیاکتنې کونکي سره د ډیټا خوندي کولو اغیزې ارزونه.

