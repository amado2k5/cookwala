<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Rêber: niha, pey, paş

**Rewş:** 2026-10-04. Her tiştî rewşek heye: **done**, **in progress**, **planned**,
**not yet funded**. Dergeh ji beşa 4 a `ACTION-PLAN.md` tên. Tişt ji planned
ber bi done ve nabe bêyî delîla ku navê wê hatî diyarkirin.

## Niha (ev îrşad)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | qedi temam bûye (draft, di bin lêkolînê de) |
| 101 conformance vectors (Core and profiles), conformance report format | qedi temam bûye |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | qedi temam bûye (editable û source installs; registries next) |
| Çarçirêkên mînak bi îngilîzî û erebî | qedi temam bûye (V1: structured, ne field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | qedi temam bûye (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) bi şabloneke lêkolînê re | qedi temam bûye (drafts li benda lêkolîna profesyonel) |
| Household Context Profile bi registry a 139-type facet û disclosure vectors | qedi temam bûye (draft) |
| Registry and directory API, honest `registry.json` û `directory.json` | qedi temam bûye (static) |
| Kitchens û production runs; supply signals | qedi temam bûye (experimental) |
| Federation rules û relay vectors | qedi temam bûye (draft) |
| Çar simulatork bi protokola vekirî û girtî | qedi temam bûye (illustrative) |
| Malper bi îngilîzî û erebî bi rûpelek ji bo her stakeholder, whitepaper û deck | di pêvajoyê de |

## Nexwe (di nêzîkî salekê de, wekî ku çavkanî rê bide)

| Item | Status | Gate |
|---|---|---|
| Nirxandina zanistvanê xwarinê ya operation envelope | planned | nirxandinê razî dibe |
| Nirxandinên diyetîst û oficêrê ewlehiya xwarinê yên çar rule pack | planned | nirxandin hatin qeydkirin; packs diçin navbera reviewed |
| Nirxandina bandora parastina daneyan a profîla household | planned | nirxandinê razî dibe |
| Pilotek food-bank (12 hefte, berî qeydkirinê, nirxandineke serbixwe) | not yet funded | heval û fînansekirin (`humanitarian/CONCEPT-NOTE.md`) |
| Encamên benchmark ên agent-safety ji bo çend malbatên model | planned | dry run bi rêbazê hatin weşandin |
| wheel `pip install cookwala` û `@cookwala/sdk` li ser npm | planned | pakêta ku vocabularies û schemas bi hev re dihewîne |
| Xizmeta registry (`validate`, `publish`, tombstones) | planned | yekî kar û proof ê namespace |
| Çêkerê yekem ê amîran ku Core API li dijî hubê referans pêk tîne | planned | yek çêker razî dibe; reporta conformance hat weşandin |
| Veguherîna koleksiyonên yekem ên fifi.cooking | planned | damebarê li gorî koleksiyona xwe mafan biryar dide |
| Core 0.3 ji feedbackê amîran | planned | feedbackê du implementer |
| Komîteya rêveber | planned | sê adopterên serbixwe an du implementasyon |

## Paşê

| Item | Status |
|---|---|
| Amîrêkî rast ku di nav Cookwala de xwarinê amade dike, bêguherîn, li ser vîdyoyê | hîn ne bi fînanse kirî; hewceyî hevkariya amîrîkê heye |
| Sîstema certification bi sertifîkerekî serbixwe | hat plandan; tu sertifîker nehatî dexlasekirin |
| Bingehê nîtral ji bo specîfîkasyon, navê navcomî û nîşan | hat plandan |
| Torra beşdar: qeydkirinên bi razîbûn ên xwarinên rast bi navê beşdaran | hat plandan |
| Sînyalên daxwaz û dabînkirinê yên ji aliyê bername û kooperatîvan ve hatine weşandin | hat plandan, piştî nirxandina qanûna pêşveçûnê |
| Benchmark a "Cook in simulation" (Isaac Lab, Gazebo an MuJoCo) | hat plandan |
| Naskirina Digital Public Good ji bo Humanitarian Profile | hat plandan, piştî delîlên pilot |
| Flowên alîkariyê yên navbera herêman di simulatorê cîhanê de; bandorên xwarina paqij | hat plandan |

## Tiştên ku em ê nekerin

Danîna daneyên kesane; weşandina hejmeran bêyî metodek; navê hevalekî/ê berî ku ew razî bibe bide;
daxwazkirina certificationek ku tune ye; danîna daneyên household li ser her lejerekê; avakirina
orchestratorek navendî ku metbexên serdide; daxwazkirina dawîkirina birçîtiyê.

## Rêzên qetilkirin û veguherînê

Ji plana çalakiyê re: heke du wanêmên nirxandina derve nekarin çêkerê amûrê an partnereke pilot pêşkêş bikin, Cookwala teng dibe nav Humanitarian Profile û formata rêçê. Heke pilot kêmasiya 5 % ji zêdekirinê nîşan bide, encam têne weşandin û profile berî her cure mezinkirinê tê yeniden desainkirin.

