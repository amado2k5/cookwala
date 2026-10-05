<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Formata Resetpêya Cookwala: reseptên ku bi Missionan re dixebitin

Reseptek di Cookwala de ne lîsteya rêberan. Ew **zanîna çêkirina xwarinê ya bêveguherî** ye
ku pergalkar li dijî Misyoneke taybet (*household*, robots, appliances,
energy, budget, health, timing) *kom dike* û dike planeke ku dikare were pêkanîn. Robot paşê ew plan dicerîne,
bi rêya contingency û playbookan xwe li gorî guhertinên realîteyê hildibijêre.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Mînakek temam hatî kirin:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Çar qat (ji nêzîkatiya SMART Guidelines a WHO hatî guhertin)

| Tager | Çi dihewîne | Kî diketibe | Li ku derê dijî |
|---|---|---|---|
| **R1 Çîrok** | Nivîsa çêkirina xwarinê ya mirovî, çîrok, note yên çandî, wêneyên | Xwarinçê, şef, fifi.cooking | `text`, `dish.images` |
| **R2 Specê Xwarinê** | Xwarin *çiye* û *divê çi be*: nasname (bingehîn vs fleksîbel), armancên hesî (sensory), bîstî, şêwazê xwarin û servîsê, hilberîn, kontrolên qebûlkirinê | Edîtorên çêkirina xwarinê, bi alîkariya AI, ji aliyê kesên re revederîkirî | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 IR yê Çalakbûnê** | Metoda bêgirî bi amîrê (device-agnostic): formula (rêjeyên + rolan), grafîka pêvajoyê ya operasyonên tîpkirî bi şert û mercên berî/piştî rewşa xwarinê, şertên `until`, alternatîf, rêzên sekinandinê, şêwazên têkçûnê, bixweberî (affordances), metirsî, CCPs, amadekarî ya jîngehê | Pîpelîna eksport + revedarin; ji aliyê simulator ve hatî piştrastkirin (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Plana Sînorî** | Çêkirina R3 ya ji bo vê Mission: miqdara tam, guhertoyên hatiye hilbijartin, lîstikvan û amûrên hatine taybetkirin, bername, kirê, çavdêr, rewşên awarte | Plankê/kompîler, di dema xebatê de | Di hundirê **Mission** (`plan`) de, qet di katalogê de nîne |

Wek koda çavkaniyê û kompîlerê: **pelçik (recipe) nîşaneya navberî ya bêveguherî ye (R3 + R2). Misyon makîneya armanc e.** Ev e ku pelçikan wekî vala dimîne dema robota û AI guherin: plankerê çêtir R4-ya çêtir ji heman pelçikê berhevkirine.

## 2. Di Missionekê de her beşek çi dike

| Beşa çêkirina xwarinê | Ji bo... ji aliyê Mission ve tê bikaranîn |
|---|---|
| `identity.essential / flexible / neverAdd` | Guhertin, modeyên budçe û rasyonê, adaptasyonên xwarinê: beşên `flexible` biguherîne, qet `essentials` ne, da ku xwarin hîn jî xwe be |
| `formula` (ratios, min/max, role, scaling) | Scaling aînekî tam ji bo her hejmarekî mirovan, rasyonkirina navokan li ser hefteyê, berfirehkirina budçeyê, bikaranîna tiştên li destê mirovan (the limiting-ingredient rescale) |
| `sensory` | Çểmên kontrolê yên dîtin, bîhn û tamê; profilên tamê yên `household` (salt 2 vs 4); biryarên ji bo bikaranîna nû û sererastkirinê |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Erkên amadekarî ya hawirdorê:** heke sink an hob bi kar were hatin bikaranîn, plannêr erkên "clear, wash, dry" lê zêde dike; erkên "soak" an "thaw" hemanî de li ber çavan têne carekirin |
| `process.nodes[]` bi rewşên xwarinê yên `pre`/`post` | Plankirin (tenê tiştê amade destpê bike), piştrastkirin (gelawazî/gav rewşê afirand?), piştî pedarîna (interruptions) dubare bibe |
| `until`, `onTimeout`, `retry` | Zanîna dema ku gavek temam dibe û çi bête kirin dema ku temam nabe |
| `alternatives[]` + `energy` | Gaz vs induction vs oven, saverê bataryayê, metbexên bê oven, saetên bê deng |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Pedarî (Interruptions):** zarokek alîkariyê dixwaze, xwedî dibêje, kûçik tiştekî dike barê erdê ve. Robot gavê dixe nav `safeState` xwe, bûyerê birêve dibe, paşê dubare dibe, germ dike, rizgarkirine an jî ji bo budçeya `pause` jê derdixe |
| `failureModes` (incident, detect, prevent, playbook) | Agahdariya zû ya pirsgirêkên naskirî û `playbook` a tam ji bo vegerê |
| `affordances`, `space` | Guncandina gavên robotên ku dikarin bigirin, hildin û bigihîjin; dûr xistina zonên germ ji zarokan |
| `safety` (hazards, CCPs, supervision, abort) | Safety kernel: invariantên ku her plan divê biparêze |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Xizmetkirin: çi dikeve ser masê, di nav odeyê de, di nav lunchbox de; bîranînerî û sînorên hilgirinê; stîla xwarinê ya çandî |
| `storage` | Mayî, Missionên cook-ahead û lunchbox |
| `acceptance` | *Test*ên çêkirina xwarinê: dema ev yek lê nehatin, Mission temam dibe |
| `nutrition`, `cost` | Porsiyonên kesane, budçe, rasyonên alîkariyê |

## 3. Mînak: carek bi her tiştê girêdayî re

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Kompilakirina rêçetekê ji bo Missionekê (tiştê ku planner dike)

1. **Varyanta hilbijêre:** ji `alternatives` re xwarin, tekstûr (IDDSI), amûr, enerjî û mode hilbijêre. Divê esasiyên nasnameyî (identity essentials) bimînin.
2. **Mezin e/kêş:** ji `formula` û xizmetan, porsiyonên ji bo her kesî (HEALTH.md), encama cudakirî ya belavkirinê (limiting ingredient), an jî qada rasyonê. Bawran bi awayê sub-lineary, dem bi rêya exponent a mezinahiyê.
3. **Înawike** di nav rolan de, bi rêza `identity.neverAdd`, alerjen, pakêtên xwarinê û inventar.
4. **Hawirdora amade bike:** `prep` bi facetên space yên Missionê re bidxema (serçav tije ye? hob bi kar tê? board pîs e?) û karên rêzkirin, şûştin, hişkandin û amadekirinê lê zêde bike. `advanceTasks` (bi avdan, avdan, marinate, germkirina pêşîn) carekê de bixebitîne.
5. **Girê de:** her node ji bo robot, amûr an mirov bi rêya affordances û şiyanên wan deyne. Burner, vessel û zoneyan kirê bide. Monitoran (smart pot, delivery ETA, smoke detector) li gorî bixe.
6. **Bername bike** ji dema xwarinê ve, bi rêz li budçeyên rawestandinê, sînorên baterî û enerjiyê, saetên bêdengiya household û demên parvekirina metbexê bide.
7. **Plana awarte (contingencies) lê bixe:** rêzên `failureModes` û `pause` yên her node, tevî polîsên giştî yên Missionê (binavbûn, zarok an heywan li nêzîkî hob, stove watchdog, spoilage watch).
8. **Binirxîne:** kontrolên schema + semantic, pakêtên polîs, coverage CCP, simulator dry-run, invariantên priority-stack (PROTOCOL §7.2).
9. **R4 derxe** di nav `plan` ê Missionê de, îmze bike, û bide robot.

## 5. Nivîsandin û veguherîn

- **Ji fifi.cooking:** pîpeline-a EXPORT-FIFI R1 + R2 + R3 çêdike. Beşên nû (identity, sensory, formula, prep, service, pause, failureModes, affordances) ji aliyê modelên lokal ve ji nivîsa heyî têne çêkirin û ji aliyê valîdator û nirxandina mirovî ya berhevkirî ve têne kontrolkirin.
- **Ji webê:** `cookwala convert --from schema-org` → R1/R2 (V0), paşê heman dewlemendkirinê.
- **Bo formatên din:** Recipe schema.org (R1/R2 ji bo motorên lêgerînê), Cooklang (deristkirina mirovî), PDDL an mantîqa demkî (plankêrên lêkolînê) hemû dikarin ji R3 werin çêkirin.
- **Bi destan:** `cookwala init recipe` hemû qatan avaker dike; `cookwala validate` û `cookwala simulate` wan kontrol dikin.
- **Versionization:** revîzyon neverguhertî ne û hash dibin. Fork dibêjin `meta.derivedFrom`. **Patches** ên Recipe (ji playbook an feedback) wekî diff têne pêşniyarkirin û tenê piştî nirxandin û delîlê têne berwerandin.

## 6. Zimanê nivîsa gavê

Cînatîyên gavan ji bo mirovekî pêşî tên nivîsandin û ji aliyê makîneyekî re di dema duyemîn de tên analîzkirin. Nivîsa gavê ya bi zimanê Erebî di mînakên çêkirina xwarinê de emrê jinan (قطّعي، سخّني) bikar tîne, ku ev rêwîtiya pirtûkên xwarinê yên Misrê ye; ev hilbijartineke berdewam e, ne kêmasiyek e, û dibe ku weşêger bi pasîfa bê cins (تُقطَّع البصلın) cihê wê bigire. Warên `op`, `params` û `until` wateyê digirin; hevok ji bo çêkerê xwarinê ye.

## 7. Çima ev wekî pêşerojê dimîne

- Resepte **encamên xwarinê û kısındarîyan dinivîsin, ne tevgeran**. Robota nû û AI nû plansên R4 yên çêtir ji R3 yê heman ji bo amade dikin.
- Hemû beşên nû **neçarî û zêde dibin**. Respeta V0 (tenê R1) ji bo çêkirina xwarinê ya bi rêberiya mirov hîn kar dike; her qat a ku tê lêkirin, otomasyona mezinhtir dike ve.
- Qadên `x-` ne naskirî derbas dibin. Vendôr, şef û saziyên tenduristiyê dikarin reseptan berfireh bikin bêyî ku destwerdanê li her kesî bikin.
- **Kontrolên qebûlkirinê** rê dide her pêkanîkirvan, mirov an robot, îspat bike ku xwarin rast derket, ev jî ew rê ye ku resete bi delîlên qadê çûn V3.

