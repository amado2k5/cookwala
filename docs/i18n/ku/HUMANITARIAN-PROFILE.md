<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Profile-ê mirovî yê Cookwala (taslak 0.2)

**Rewşa:** nûska ji bo nirxandina food banks, bernameyên alîkariyê û pisporên ewlehiya xwarinê û bajûraniyê. Ji aliyê WFP, WHO, FAO, Global FoodBanking Network an jî kêgehên din ên li vir hatî navê nehat nirxandin an jî nehat piştgirîkirin.

**Dosyer:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- mînak: [`examples/humanitarian/`](../examples/humanitarian)
- pakên rêkan: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (hemû), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; hemû nûsî dema lêkolîna profesyonel li benda ne, binêre [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- rêberên xebatkirî: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank li Cairo, xwarinên dibistanê, metbexê karesatê, metbexê robotî), her yek bi `ImpactSummary` ku hatiye hesabkirin
- protokola ceribandinê: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- şablonên spreadsheet û SMS: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- kontrolkera referansê: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Tiştê ku 0.2 lê zêde dike (RFC-0003, RFC-0004)

Zêde li ser 0.1; xwendevan her duyan jî qebûl dikin.

- **Ji fermê heta plakatê:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) û `Item.harvestedAt`; rolan `farm`, `caterer`, `robot_kitchen`; peyva SMS `FARM`.
- **Qanûnên xwedîderketinê:** `Item.foodClasses` û `Distribution.menu.foodClasses` (hekgî, şîrê ne-pasteurîkirî, qerîqên tam, birîca çêkirî...), cureyê qanûnê `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; sê pakêtên nû yên taslakê.
- **Nîgar:** `RulePack.reviews` profesyon, rêxistin, dîrok, çarçove û encama her nîgarê qeyd dike; `status: reviewed` pêdivî bi nîgareke pejirandî heye.
- **Bandor:** `ImpactSummary` bi neh mezinan, ku her yek `method` (measured, modelled, assumed, not recorded) digire, bi rêya `tools/humanitarian_check.py --summary` tê hesabkirin.
- **Dem ji bo îddiakirinê:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` da ku kilogramên xilaskirî yek carî werin hesibandin.
- **Cureyên bernameyan** li ser `Manifest`.

## 1. Armanc

Beşekî piçûk, hiştimend, bêyî daneyên kesane yên Cookwala ji bo saziyên ku mirov xwedî dikin:
food bank, metbexên civakî, bernameyên xwarina dibistanan, bernameyên alîkariyê, donorkar (firoşkarên xwarinê, restoran, fermên çandinê, xwediyên xwarinê, გადამზიდ û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kolokan û kol

1. **Pêşkêşkirina xwarina surplus** û daxwazkirina wê, bi lez û bi dadperwerî.
2. **Seristakirina her handover** a hiştinê, bi kontrola germî (kontrola cold-chain).
3. **Reportkirina tiştê ku hatî xwarin** tenê wekî hejmarên komkar.
4. **Kontrolkirina menû û handoveran** li gorî qaîdên vexwarin û ewlehiya xwarinê yên ku ji aliyê makîneyan ve dikarin bê xwendin.

**Bê robot, app an jî internetê dixebite.** Astên H0 û H1 li ser spreadsheets, SMS û telefonên bingehîn dixebitin. Robot, hub û agent consumerên opsiyonel ên heman belgeyan in.

## 2. Prensîb

- **Ziyanê nede.** Tiştên ku dikarin kesek an malbatê nas bikin, cihê wan diyar bikin an profileya wan çêbikin, kom neke. Di rewşên nerm de, daneyên derbarê miletên alîkar de rîska parastinê ne.
- **Prînsîbên mirovî** (mirovî, nøytralî, bêyanî, serbixwedî): ne markayên bazirganî li ser alîkariyê hebin, û ne jî bikaranîna daneyan ji bo marketîngê hebe.
- **Strit û piçûk.** Her obyek qadên nenas red dike (ji bilî zelalên `x-`), lewma xeletiyên nivîsê û qadên kesane yên zêde di validasyonê de vedikevin.
- **Yekeyên tam:** kilogram, derece Celsius, toleransên mutlak, û pere wekî tîpên desimal.
- **Qanûnên herêmî serbilind in.** Rule packs dikarin bi qanûnên neteweyî yên ewlehiya xwarinê û danasînê werin guhertin.
- **Açik:** spec a bê mîras, amûrên open-source. Profile ji bo pêkanîna Digital Public Goods Standard û Principles for Digital Development hatiye amadekirin.

## 3. Astên conformance

| Ast | Tiştê ku beşdar dike | Pêdivî |
|---|---|---|
| **H0 — Kaxez & SMS** | Pêşniyar, teslîmkirin û belavkirinan di şablonên CSV de (bi rêzên hashtag ên HXL) an jî bi SMS (beşa 8.3) qeyd dike | Tabloya elektronîk an telefonek bingehîn |
| **H1 — Rizgarkirin** | Belgeyên `Offer`, `Claim`, `Handover` û `Distribution` di ser API de dinivîze; peywerê state machine (beşa 5) bişopîne | Her client-ek HTTP |
| **H2 — Safety & nutrition** | `RulePack`ê li ser her teslîmkirin û menûyê sepîne, û `findings` qeyd bike | Kontrolkera referans an yekî wekhev |
| **H3 — Interoperability** | Komkirinên (aggregates) ji bo HXL, DHIS2 û `ImpactReport`ê bingehîn ê Cookwala derxe; nîşaneyên GS1 bikar bîne | Karê entegrasyonê |

Beşdar `Manifest`ek li `/.well-known/cookwala-humanitarian.json` weşandike ku
astên xwe, rule packs, endpoints û `personalData: "none"` diyar dike.

## 4. Dokumant

## 4. Documents

| Belge | Kîkes dinivîse | Armanc |
|---|---|---|
| `Offer` | Daner | Xwarina surplus ji bo komkirinê: tişt (kg, storer, nîşanên dîrokê, alerjen), dem, cih, germahî |
| `Claim` | Food bank, metîn, bername | Hemû an jî beşek ji `Offer` daxwaz dike, bi demê wergirtinê û celebê wesayît re |
| `Handover` | Wergerê xwedîderketinê | Yek ji bo her gav: germahî, kg hatine qebûlkirin an redkirin bi kodê sedemê re, û encamên rule |
| `Distribution` | Metîn, food bank, dibistan | Komkirina xwarin û mirovên ku li cihê dirojekê hatine xizmetkirin; bîst û bihayên menûyê yên vedeger |
| `RulePack` | Bername an rayedar | Rêzên vexwarin û ewlehiya xwarinê yên bi versiyon (beşa 6) |
| `Manifest` | Her beşdar | Şiyandin û daxuyaniya parastina daneyan |

Dokumantên bingehîn ên Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` di `relief.schema.json` de) ji bo plankirinê amade dimînin. Ev profil pêvajoya operasyonel digerîne.

## 5. Çarçoveya jiyana pêşniyarê

| Ji bo | Rewşên `next` yên pêşve guncaw |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (daxwaz derbas bû), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | tune (dawî) |

**Rêzên ji bo guhertinên rewşê:**

- Her guhertin `version`ê zêde dike. Nivîskar `If-Match: <version>` dişînin; heke ne wekî hev bin **409** vedigerî, û nivîskar dîsa dixwîne û dîsa ceribîne dike.
- Veguhastineke neqayde dabe **409** bi veguhastinên destûrî vedegere.
- Pêşniyar di `window.to` de bi otomâtî diçin `expired`.
- Dawa (Claims) di `pickupBy` re û bi demeke berdewam a ku bername diyar dike (bi default 30 minutes) bi dawî dibin.

**Daxwazkirina li hev.** Bi default, daxwazên yekemîn di nav qada serdestî (priority tier) ku bername diyar dike de tên wergirtin:
mînak, aşpazxaneyên ku yekemîn xizmetê didin zarokan, paşê aşpazaneyên din, paşê food bank. Qad û
her qaîdeya vegerê (rotation rules) divê di `Manifest`ê bernameyê an jî malperê de were weşandin.

## 6. Paketên rêkan ên ewlehiya xwarinê û bîtoranê

`RulePack` di nav xwe de six çend cure rêzan dide:

- `temperature`: sar, ≤ 5 °C, germ-parastin ≥ 60 °C, qelîb ≥ −18 °C;
- `time`: xwarinên çêkirî derve ji kontrola germê heta herî kêm 2 h;
- `date_mark`: blokên bi temam biqedî, hişyariyên berî temam biqedî;
- `allergen`: bloka alerjenên îfşa nekirî;
- `nutrient`: meriv-roj an jî ji bo xwarinê;
- `energy_share`: paya enerjiyê ji şekirên azad, rûn, rûnê têşewitî, rûnê trans an jî proteîn.

Her rêz an `block` e (qebûl neke an xizmetê nede) an jî `warn` e (destûr e, wekî dîtinek tê qeydkirin).

Paketa default `basic-nutrition-food-safety@0.1.0` **pêşniyareke ku ji rêberiya giştî derbas bûye**: rêberiya WHO ya ji bo xwarina saxlem, sodyum, şekir û rûn, Çar Kuncên WHO yên ji bo Xwarina Bêhtir, kodên Codex yên etiketkirinê û xwarinên berfireh (frozen-food), û ramanên plansaziyê yên rasyonê ya herî kêm a Sphere ye. Ew sadekirî ye, ne şîreta bijîşkî ye, xwarina zarokên nêzik û xwarina terapîtiqî dihewîne, û divê ji aliyê xebatkarên bajarî ve were nirxandin. Divê bername kopî bikin û li gorî xwe biguherînin, `jurisdiction` deynin, û nirxandina wê di `reviewedBy` de qeydkirin.

Girtinên di astê H2 de pakê di her teslîdkirinê de û li ser her menûyê dicîninê, û ID-yên rêkan di `findings` de qeyd dikin. Kontrolkera referansê raportê dide ku li ku encamên hatine daxwazkirin û encamên hatine hesabkirin ne li hev in.

## 7. Parastina daneyan

**Profil tuwen data yên kesane naxîne. Divê belge ne tenê bibin:**

- nav, hejmarên telefonê, e-mail an jî nîşandêrên neteweyî, koçber an jî biyometrik yên her kesî;
- dîrokên di asta malbatê de, an jî cihên malan an jî kesên taybet;
- tenduristî, astengî, ol an jî neteweya her kesî.

**Li şûna wê çi bihewîne:**

- **Tenê rêkxistîn.** Her alîyek rêxistinek e ku bi `did:web`, hejmara Cookwala (GLN) an jî ID-a registry-ê tê naskirin. Mirov tenê wekî rolan xuya dibin (`checkedBy: "trained_staff"`).
- **Tenê komkarî.** `Distribution.people` hejmarên li gorî koman digire, û her hejmarek di bin 10an de wekî `"<10"` tê raporkirin.
- **Tenê malper.** `Site` cihê rêxistinekê an qadeke îdarî ye (OCHA P-codes), qet malbat nîn e.
- **Notên kurt.** Nivîsa azad tenê ji bo notên operasyonel ên 280-çarenivîsan e û divê daneyên kesane tê de nebin. Divê di pêkanînê de, berî hilberandina wan, not ji bo hejmarên telefonê û ID-an bêne skenerkirin.

**Parastin û audit:**

- **Parastin:** her beşdar `retentionDays` di `Manifest`ê xwe de daxuyandî dide û piştî wê belgeyan jê dibe.
- **Audit (vebijark, `hash_only`):** her bername ji bo yekek sequencer (bi normalî food bank an jî operaterê bernameyê) SHA-256 hash ê RFC 8785 canonical JSON ê her belgeyî lê zêde dike. Naverok bi awayekî cuda tê parastin û dikare bê jêbirin. Rêkxistineke heval, her roj checkpointekê careke din îmze dike, da ku dîrok neyê yeniden nivîsandin bi awayekî bêdeng. Yekemîn sequencer pêşî li çêkirina forkên di zincîrê de digire.
- **Hosting** divê di nav weldê de be, li ku qanûn an jî bername pêdivî bi wê dike.

## 8. Veguhastin

### 8.1 API (astay H1)

| Rêbaz | Rê | Têbinî |
|---|---|---|
| `POST` | `/offers` | Pêşniyarekê çêdike (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Pêşniyarên nêzî wergir nîşan dide |
| `POST` | `/offers/{id}/claims` | Pêşniyarekî daxwaz dike; `If-Match` pêwîst e; dema jixwe daxwaz kiribû 409 vedegere |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` pêwîst e |
| `POST` | `/handovers` | Teslîmkirinê qeyd dike |
| `POST` | `/distributions` | Belavkirinê qeyd dike |
| `GET` | `/reports?from=…&to=…` | Ji bo demeke diyar kom dike |

Qewdem û rêzikên veguhastinê:

- **Idempotency:** her `POST` ji bo `Idempotency-Key`ekê tê.\
  Server keyan herî kêm 24 h parêze û ji bo dubarebûnê bersiva orjînal vedide.\
- **Authentication:** kerîyên OAuth 2.1 client, her saziyek ji bo yek client.\
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  herî kêm carekê tên danîn, bi `id`yeke bûyerê ji bo dubarebûnê û bi hejmara rêzê ya ji bo her offerê ji bo rêzkirinê.

### 8.2 Tabloyên Spreadsheet (ast H0)

Şablonên CSV di `profiles/humanitarian/templates/` de bi kar bînin. Rêza wan a duyemîn hashtagên [HXL](https://hxlstandard.org) dihewîne, da ku amûrên daneyên mirovî rasterast bikaribin wan bixwînin.

### 8.3 SMS (astay H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Gramatîk di `tools/cookwala_ref.py` (`parse_sms`) de hatîye pêkanîn û bi `conformance/profiles/sms.json` hatiye testa kirin. Peyvên sereke bi îngilîzî ne; rîsmên Arabic-Indic (٠-٩) û Farisî (۰-۹) li her derê ku rîsmek hebe têne qebûlkirin, lewma telefonek ku li ser yek ji klavyeyan hatî sexetkirin kar dike.

Kodên vebergirî: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Nîşaneyên dîrokê: `UB` use-by,
`BB` best-before, `HV` harvested, wek `DDMM`. Kodên sedema redkirinê: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; her peyveke din wek `other` tê qeydkirin. Bersiva `HELP`
PÊREYA DU dema her komandê divê yek mînak be, ASCII ya sade, di bin 160 karakteran de be.

Pira (gateway) PÊWÎST e berî ku belgeyek binivîsî van kontrolan pêk bîne (`sms_storage_findings` di referansê de; ids dîtinên blok in):

| Bibîn | Care |
|---|---|
| `safety.temp_not_recorded` | `HAND`ek li ser xeteke sar, berfîkirî an jî germ-parastî ne xwedî xwendina `T` e: bersiv bide ku bipirsî, tişt nezinî |
| `safety.hot_hold_min` | `OFFER`ek bi hilberîna `H` ya di bin 60 °C de: red bike li ser lîsteyê |
| `safety.storage_class_mismatch` | peyvên tiştî îşaretê didin şîr, et, mirîşk, masiy, hêk an xwarina çêkirî û hilberîn `A` ye: red bike li ser lîsteyê |
| `safety.chilled_max`, `safety.frozen_max` | xwendinên li ser 5 °C an jî li ser −18 °C di `OFFER` an jî di გადაشتan (handover) de |

Pêşniyarên xwarinên germ hatine parastin piştî du saetan (saeteke ji bo birîca çêkirî) diqedin; gateway qet xwendineke placeholder naxîne nav xwe. Gateway hejmara navdar a senderê veguherîne organîzasyonekê, qet ne ji bo kesekî di belgeyan de.

## 9. Interoperability

| Sîstem | Mapkirin |
|---|---|
| HXL | Şablonên CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (berhem); `Site.gln` û `OrgId` `gln:` (cih) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Qîmetên daneyên komkar li gorî site û serdemê ji `Distribution` (xwarin, mirov li gorî kom, kg, bûyer) |
| WFP SCOPE û sîstemên din ên mifaidegeran | **Tenê komkar.** Tu nirxandina mifaidegeran nakeve hundur an derdê vê profîlê |
| Appsên Food-rescue | Adaptersyan lîsteyên xwe dikin `Offer` û wergirtina wan dikin `Claim` û `Handover` |
| Core Cookwala | `Item.ingredientId` û `menu.recipes` bi îndeksa rêçetê ve girêdayî ne; `relief.ImpactReport` `Distribution`an kom dike |

## 10. Metrîkên pilot (bi vî rengî hatine pênasekirin ku navend dikarin bên hevalkirin)

Ji aliyê `python tools/humanitarian_check.py --summary DIR` ve di `ImpactSummary` de hatî hesabkirin. Çawa pilot tê xurtkirin û nirxandin: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrik | Pênase |
|---|---|
| Kg xilasandin | Komê `Handover.kgAccepted` li ser qonaxa yekem ji qerendiyan |
| Rêjeya daxwazkirinê | Pêşniyarên ku digihêjin `claimed` ÷ pêşniyarên hatine afirandin |
| Demê daxwazkirinê | Navînê deqeyan ji afirandina `Offer` heta rewşa `claimed` |
| Redkirin bi sedem | Komê `kgRejected` bi `reason` |
| Xwarinên xizmetkirinê | Komê `Distribution.meals` |
| Rêjeya derbasbûna xwarinê | Belavkirinên bi menû û bê dîtinên `nutrition.*` ÷ belavkirinên bi menû |
| Biha ji bo her xwarinê | (xwarin + veguhastin + xebatkar + enerjî) ÷ xwarin |
| Deqeyênစေ volunteer li ser her 100 kg | `volunteerMinutes` ÷ (kg hatine bikaranîn ÷ 100) |
| Ewlehî | Hejmara dîtinên blokê `safety.*`, û `safetyIncidents` |

## 11. Ewlehî

- **Undanî (Signatures) li H1 ne mecbûrî ne** û ji bo audit a navbera saziyan li H3 pêwîst in
  (EdDSA, kîleyên li `did:web` a saziyê hatine weşandin).
- **Têbîni û nav di belgeyan de daneyên ne bawerbar in.** Divê yazılım û agentên AI tu carî
  wekî rêberan (instructions) li wan binêrin.
- **Rule packs bi dîrokçûn (versioned) û bi pîvan (pinned) in** (`id@version`) di her dîtinê de, da ku encam dikarin
  bi nîşan bixin (reproducible).

## 12. Bi qest bi dilोxwe li derve hat wergirtin

- Qeydkirina miletê, eligibility û hedefgirtin (ev dikevin nav
  sîstemên parastî yên bernameyê).
- Dîs (Payments): Cookwala qet pere nanevejin.
- Reseteyên xwarinê û cotbêjkirina robotê (spec-a sereke). Profile tenê navên resetan dixe û
  nîşanên xwarinê (nutrients) raport dike.
- Xwarina bijîşkî û terapotîk.

## 13. Çawa nirxîn bibe

Ji kerema xwe re li ser [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) bi etiketa `humanitarian` pirsgirêkan vekirin. Ev nirxandin berhemberî herî bikarhatî ne:

- xebatkarên bilindiya xwarinê `rule pack` û sedemên redkirinê kontrol dikin;
- operaterên `food-bank` çaredariya jiyanê û rêya SMSê kontrol dikin;
- oficêrên parastina daneyan beşa 7 kontrol dikin.

