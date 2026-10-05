<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Muundo wa Mapishi ya Cookwala: mapishi yanayofanya kazi na Missions

Mapishi katika Cookwala si orodha ya maelekezo. Ni **maarifa ya kupika yanayohamishika**
ambayo mpangaji *huyaweka pamoja* dhidi ya Mission maalum (household, roboti, vifaa,
nishati, bajeti, afya, muda) kuwa mpango unaoweza kutekelezwa. Kisha roboti huendesha mpango huo,
ikijirekebisha kupitia contingencies na playbooks wakati uhalisia unapobadilika.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Mfano kamili uliofanyiwa kazi:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Tabaka nne (zilizorekebishwa kutoka kwa mbinu ya WHO SMART Guidelines)

| Tabaka | Inayobeba | Nani anaandika | Inapoishi |
|---|---|---|---|
| **R1 Narrative** | Maandishi ya mapishi ya binadamu, hadithi, maelezo ya kitamaduni, picha | Wapishi, wapishi wa kitaalamu, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Jinsi chakula *kilivyo* na *kinavyopaswa kuwa*: utambulisho (muhimu dhidi ya unaoweza kubadilika), malengo ya hisia, lishe, mtindo wa kutoa na kula, uhifadhi, ukaguzi wa ukubalika | Wahariri wa mapishi, msaada wa AI, yaliyopitiwa | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Njia isiyo tegemezi na kifaa: fomula (uwiano + majukumu), grafu ya mchakato ya ops zilizowekwa aina pamoja na hali ya chakula kabla/baada, masharti ya `until`, mbadala, sheria za kusimama, njia za kushindwa, uwezo, hatari, CCPs, maandalizi ya mazingira | Mchakato wa kuhamisha + mapitio; imethibitishwa na simulator (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | Mapishi ya R3 yaliyokusanywa kwa ajili ya Mission *hii*: kiasi kamili, matoleo yaliyochaguliwa, wahusika na vifaa vilivyopangiwa, ratiba, ukodishaji, watazamati, mipango ya dharura | Mpangaji/mkusanyaji, wakati wa run time | Ndani ya **Mission** (`plan`), kamwe kwenye katalogi |

Kama vile msimbo chanzo na kiondoa msimbo: **mapishi ni uwakilishi wa kati unaohamishika
(R3 + R2). Misheni ni mashine inayolengwa.** Hiyo ndiyo inayofanya mapishi yawe sahihi wakati roboti
na AI zinapobadilika: mpangaji bora huzalisha R4 bora zaidi kutoka kwa mapishi yaleyale.

## 2. Kazi ya kila sehemu katika Mission

| Sehemu ya mapishi | Inatumiwa na Mission kwa ajili ya… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutions, hali za bajeti na rasilimali, mabadiliko ya mlo: badilisha sehemu za `flexible`, kamwe usibadilishe `essentials`, ili chakula kiendelee kuwa kile kile |
| `formula` (ratios, min/max, role, scaling) | Scaling sahihi kwa idadi yoyote ya watu, rationing ya viungo kwa wiki moja, kutanua bajeti, kutumia kile kilichopo (the limiting-ingredient rescale) |
| `sensory` | Maeneo ya ukaguzi ya kuona, harufu na ladha; household taste profiles (salt 2 vs 4); maamuzi ya repurpose na fix |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Kazi za maandalizi ya mazingira:** ikiwa sinki au hob imetumika, mpangaji huongeza kazi za "clear, wash, dry"; kazi za soak au thaw hupangwa saa kadhaa kabla |
| `process.nodes[]` ikiwa na hali za chakula za `pre`/`post` | Planning (anza tu kile kilicho tayari), verification (je hatua ilizalisha hali hiyo?), resume baada ya interruptions |
| `until`, `onTimeout`, `retry` | Kujua wakati hatua imekamilika na nini cha kufanya wakati haijakamilika |
| `alternatives[]` + `energy` | Gas vs induction vs oven, battery saver, jikoni zisizo na oven, quiet hours |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruptions:** mtoto anahitaji msaada, mmiliki anaita, mbwa anaangusha kitu. Robot huweka hatua katika safe state yake, kushughulikia tukio, kisha resume, reheats, salvages au discards kulingana na pause budget |
| `failureModes` (incident, detect, prevent, playbook) | Early detection ya matatizo yanayojulikana na playbook sahihi ya kupona |
| `affordances`, `space` | Kuoanisha hatua na robot zinazoweza grip, lift na reach; kuweka hot zones mbali na watoto |
| `safety` (hazards, CCPs, supervision, abort) | Safety kernel: invariants ambazo kila mpango lazima azihifadhi |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Serving: nini kinaenda mezani, chumbani, kwenye lunchbox; reminders na hold limits; mtindo wa kula wa kitamaduni |
| `storage` | Leftovers, cook-ahead na lunchbox Missions |
| `acceptance` | *Tests* za mapishi: Mission inakamilika wakati hizi zinaposhikiliwa |
| `nutrition`, `cost` | Portion za kibinafsi, bajeti, relief rations |

## 3. Mfano: hatua moja ikiwa na kila kitu kilichoambatishwa

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

## 4. Kukusanya mapishi kwa ajili ya Mission (kile ambacho planner hufanya)

1. **Chagua toleo:** mlo, ulaini (IDDSI), vifaa, nishati na uchaguzi wa aina kutoka
   `alternatives`. Mahitaji ya utambulisho lazima yastahimiliwe.
2. **Ongeza kipimo:** kutoka `formula` na vipande, sehemu kwa kila mtu (HEALTH.md), kiungo
   kinachoweka kikomo, au upeo wa rasilimali. Viungo kwa njia isiyo ya mstari, muda kwa kiwango cha masi.
3. **Badilisha** ndani ya majukumu, ukizingatia `identity.neverAdd`, viashiria vya mzio, vifurushi vya mlo
   na akiba.
4. **Andaa mazingira:** linganisha `prep` na vipengele vya nafasi vya Mission (sinki imejaa?
   hob imechukuliwa? ubao ni mchafu?) na uongeze kazi za kupanga, kuosha, kukausha na kuandaa. Ratibu
   `advanceTasks` (loweka, thaw, marinate, preheat).
5. **Unganisha:** panga kila node kwa roboti, vifaa au binadamu kwa uwezo na
   uwezo wa utendaji. Kukodisha majiko, vyombo na maeneo. Ambatanisha vifaa vya ufuatiliaji (smart pot, delivery
   ETA, smoke detector).
6. **Ratibu** kuanzia muda wa kutoa chakula, ukizingatia bajeti za mapumziko, mipaka ya betri na nishati,
   saa za utulivu za nyumbani na vipindi vya kushiriki jikoni.
7. **Ambatisha mipango mbadala:** `failureModes` na sheria za `pause` za kila node, pamoja na
   sera za kimataifa za Mission (vikwazo, mtoto au mnyama karibu na hob, stove watchdog,
   spoilage watch).
8. **Thibitisha:** ukaguzi wa schema + semantic, vifurushi vya sera, ufunikaji wa CCP, simulator dry-run,
   invariants za priority-stack (PROTOCOL §7.2).
9. **Toa R4** ndani ya `plan` ya Mission, iweke saini, na imkabidhi roboti.

## 5. Uandishi na ubadilishaji

- **Kutoka fifi.cooking:** pipeline ya EXPORT-FIFI inazalisha R1 + R2 + R3. Sehemu mpya
  (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  zinazalishwa na modeli za ndani kutoka kwenye maandishi yaliyopo na kukaguliwa na validators na
  mapitio ya kibinadamu ya sampuli.
- **Kutoka kwenye wavuti:** `cookwala convert --from schema-org` → R1/R2 (V0), kisha utajiri
  uleule.
- **Kwenda kwenye mifumo mingine:** schema.org Recipe (R1/R2 kwa injini za utafutaji), Cooklang (uhariri wa
  kibinadamu), PDDL au temporal logic (research planners) zote zinaweza kuzalishwa kutoka R3.
- **Kwa mkono:** `cookwala init recipe` inatengeneza tabaka zote; `cookwala validate` na
  `cookwala simulate` zinazikagua.
- **Utoleo (Versioning):** marekebisho hayabadiliki na yana hash. Forks zinarekodi `meta.derivedFrom`.
  **patches** za Recipe (kutoka playbooks au feedback) zinapendekezwa kama diffs na kupandishwa tu
  baada ya mapitio na ushahidi.

## 6. Lugha ya maandishi ya hatua

Sentensi za hatua zimeandikwa kwa ajili ya mtu kwanza na kuchambuliwa na mashine pili. Maandishi ya hatua ya Kiarabu katika mifano ya mapishi yanatumia amri ya jinsia ya kike (قطّعي، سخّني), ambayo ni utaratibu wa kawaida wa kitabu cha mapishi cha Misri; ni chaguo la makusudi, siyo kosa, na mchapishaji anaweza kutumia kauli ya kutendwa isiyo na jinsia (تُقطَّع البصلة) badala yake. Vipengele vya `op`, `params` na `until` vinabeba maana; sentensi ni kwa ajili ya mpishi.

## 7. Kwa nini hii inabaki kuwa imara kwa siku zijazo

- Mapishi yanaelezea **matokeo ya chakula na vikwazo, si miondoko**. Roboti mpya na AI mpya
  zinazalisha mipango bora ya R4 kutoka R3 ileile.
- Sehemu zote mpya ni **hiari na za kuongeza**. Recipe ya V0 (R1 pekee) bado inafanya kazi kwa
  upishi wa mwongozo wa binadamu; kila tabaka linaloongezwa hufungua otomatiki zaidi.
- Vipengele visivyojulikana vya `x-` hupitishwa. Wauzaji, wapishi na vyombo vya afya wanaweza kupanua mapishi
  bila kumvunja mtu yeyote.
- **Vipimo vya ukubalifu** huruhusu mtendaji yeyote, binadamu au roboti, kuthibitisha kuwa chakula kimetoka sawa,
  ambayo ndiyo jinsi mapishi yanavyopanda hadi V3 kwa ushahidi wa nyanjani.

