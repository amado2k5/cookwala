<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Humanitarian Profile (draft 0.2)

**Status:** rasimu ya mapitio kwa food banks, programu za misaada na wataalamu wa usalama wa chakula na lishe. Haijapitiwa wala kuidhinishwa na WFP, WHO, FAO, Global FoodBanking Network au shirika lingine lolote lililotajwa hapa.

**Faili:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- mifano: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (zote), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; rasimu zote zinazosubiri mapitio ya kitaalamu, tazama [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- mtiririko uliofanyiwa kazi: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank jijini Cairo, school meals, disaster kitchen, robot kitchen), kila moja ikiwa na `ImpactSummary` iliyopigiwa hesabu
- itifaki ya jaribio: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet na templates za SMS: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- kikiangalia marejeo: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Kile 0.2 inachoongeza (RFC-0003, RFC-0004)

Ongezeko zaidi ya 0.1; wasomaji hukubali zote mbili.

- **Kutoka shambani hadi kwenye sahani:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) na `Item.harvestedAt`; majukumu `farm`, `caterer`, `robot_kitchen`; neno la SMS `FARM`.
- **Sheria za utunzaji:** `Item.foodClasses` na `Distribution.menu.foodClasses` (yai mbichi, bidhaa za maziwa zisizopasuliwa, karanga nzima, wali uliopikwa…), aina ya sheria `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; paketi tatu mpya za rasimu.
- **Mapitio:** `RulePack.reviews` inarekodi taaluma, shirika, tarehe, wigo na matokeo ya kila mapitio; `status: reviewed` inahitaji mapitio yaliyoidhinishwa.
- **Athari:** `ImpactSummary` ikiwa na vipimo tisa, kila kikiwa na `method` (measured, modelled, assumed, not recorded), kikipigiwa hesabu na `tools/humanitarian_check.py --summary`.
- **Muda wa kudai:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` ili kilogramu zilizookolewa zihesabiwe mara moja.
- **Aina za programu** kwenye `Manifest`.

## 1. Madhumuni

Sehemu ndogo, kali, isiyo na data binafsi ya Cookwala kwa mashirika yanayolisha watu:
food banks, jikoni za jamii, programu za milo shuleni, programu za misaada, wafadhili (maduka ya vyakula,
migahawa, mashamba, watoa huduma za chakula), wasafirishaji na maghala ya baridi. Inahusu kazi nne:

1. **Kutoa surplus food** na kuidai, kwa haraka na kwa haki.
2. **Kurekodi kila handover** ya ulinzi, pamoja na ukaguzi wa joto (cold-chain check).
3. **Kuripoti kile kilichotolewa** kama idadi za jumla pekee.
4. **Kukagua menyu na handovers** dhidi ya kanuni za lishe na usalama wa chakula zinazoweza kusomwa na mashine.

**Inafanya kazi bila roboti, programu au intaneti.** Viwango H0 na H1 huendeshwa kwenye hati za spreadsheet, SMS
na simu za kawaida. Roboti, hubs na mawakala ni watumiaji wa hiari wa hati zilezile.

## 2. Kanuni

- **Usilete madhara.** Usikusanye chochote kinachoweza kumtambulisha, kumtambua mahali au kumwelezea mtu au kaya. Katika mazingira tete, data kuhusu wanufaika ni hatari ya ulinzi.
- **Kanuni za kibinadamu** (utu, kutopendelea, usawa, uhuru): hakuna chapa ya kibiashara kwenye misaada, na hakuna matumizi ya data kwa ajili ya masoko.
- **Ngumu na ndogo.** Kila kitu hukataa nyanja zisizojulikana (isipokuwa upanuzi wa `x-`), hivyo makosa ya uandishi na nyanja za ziada za kibinafsi hukataa uhakiki.
- **Vipimo sahihi:** kilogramu, nyuzi Celsius, uvumilivu kamili, na pesa kama mfululizo wa desimali.
- **Sheria za ndani hushinda.** Rule packs zinaweza kubadilishwa na sheria za kitaifa za usalama wa chakula na michango.
- **Wazi:** maelezo bila malipo ya hakimiliki, zana za chanzo huru. Wasifu umeundwa kukidhi Digital Public Goods Standard na Principles for Digital Development.

## 3. Viwango vya conformance

| Kiwango | Kile mshiriki anachofanya | Mahitaji |
|---|---|---|
| **H0 — Karatasi & SMS** | Anarekodi ofa, makabidhiano na usambazaji katika muchanganuo wa CSV (pamoja na mistari ya hashtag ya HXL) au kwa SMS (sehemu 8.3) | Jedwali la takwimu au simu ya msingi |
| **H1 — Uokoaji** | Anabadilishana hati za `Offer`, `Claim`, `Handover` na `Distribution` kupitia API; anafuata mashine ya hali (sehemu 5) | Mteja wowote wa HTTP |
| **H2 — Usalama & lishe** | Anatumia `RulePack` kwenye kila makabidhiano na menyu, na anarekodi `findings` | Mchunguzi wa rejeleo au sawa na huo |
| **H3 — Uingiliano** | Anatoa jumla kwenda HXL, DHIS2 na Cookwala `ImpactReport` ya msingi; anatumia utambulisho wa GS1 | Kazi ya ushirikiano |

Mshiriki huchapisha `Manifest` kwenye `/.well-known/cookwala-humanitarian.json` inayotangaza viwango vyake, rule packs, endpoints na `personalData: "none"`.

## 4. Nyaraka

| Nyaraka | Nani anaandika | Madhumuni |
|---|---|---|
| `Offer` | Mtoaji | Surplus food inayopatikana kwa ajili ya kukusanywa: bidhaa (kg, uhifadhi, alama za tarehe, viashiria vya mzio), dirisha, tovuti, joto |
| `Claim` | Food bank, jikoni, programu | Inadai sehemu au yote ya offer, ikiwa na muda wa kuchukua na aina ya chombo cha usafiri |
| `Handover` | Mpokeaji wa dhamana | Moja kwa kila leg: joto, kg zilizokubaliwa au kukataliwa pamoja na kodi ya sababu, na matokeo ya rule pack |
| `Distribution` | Jikoni, food bank, shule | Jumla ya milo na watu waliohudumiwa kwenye tovuti siku fulani; virutubisho vya menyu na gharama (hiari) |
| `RulePack` | Programu au mamlaka | Kanuni za lishe na usalama wa chakula zenye toleo (sehemu ya 6) |
| `Manifest` | Kila mshiriki | Uwezo na tamko la ulinzi wa data |

Nyaraka kuu za Cookwala za `relief` (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` katika `relief.schema.json`) zinabaki zinapatikana kwa ajili ya upangaji. Profaili hii inashughulikia
mtiririko wa kiutendaji.

## 5. Maisha ya ofa

| Kutoka | Hali zinazoruhusiwa next |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (dai lilipita), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | hakuna (mwisho) |

**Sheria za mabadiliko ya hali:**

- Kila mabadiliko huongeza `version`. Waandishi hutuma `If-Match: <version>`; kutolingana kurudisha
  **409**, na mwandishi husoma tena na kujaribu tena.
- Mpito haramu hurudisha **409** pamoja na mipito inayoruhusiwa.
- Ofa huhamia kwenye `expired` kiotomatiki kwenye `window.to`.
- Madai hupita kwenye `pickupBy` pamoja na kipindi cha neema ambacho programu huweka (kiwango cha dakika 30).

**Madai ya haki.** Kwa kawaida, madai hufuata kanuni ya "aliyeingia kwanza" ndani ya ngazi ya kipaumbele ambayo programu huweka:
kwa mfano, jikoni zinazohudumia watoto kwanza, kisha jikoni nyingine, kisha food banks. Ngazi na
sheria zozote za mzunguko lazima zichapishwe katika `Manifest` ya programu au tovuti.

## 6. Rule packs za usalama wa chakula na lishe

`RulePack` inaholder sheria za aina sita:

- `temperature`: baridi ≤ 5 °C, moto-hifadhi ≥ 60 °C, kugandishwa ≤ −18 °C;
- `time`: chakula kilichopikwa nje ya udhibiti wa halijoto kwa wakati usiozidi saa 2;
- `date_mark`: vizuizi vya tumia-kabla, onyo la bora-kabla;
- `allergen`: kizuizi cha viashiria vya mzio visivyotajwa;
- `nutrient`: kiasi kwa kila mtu-siku au kwa kila mlo;
- `energy_share`: sehemu ya nishati kutoka sukari huru, mafuta, mafuta yaliyoshiba, mafuta ya trans au protini.

Kila kanuni ni ama `block` (usikubali au usitoe huduma) au `warn` (inaruhusiwa, inarekodiwa kama uvumbuzi).

Paketi ya kawaida `basic-nutrition-food-safety@0.1.0` ni **rasimu iliyotolewa kutoka kwa mwongozo wa umma**: mwongozo wa WHO wa healthy-diet, sodium, sugars na fats, WHO Five Keys to Safer Food, kanuni za Codex za labelling na frozen-food, na takwimu za Sphere za minimum ration planning. Imerahisishwa, si ushauri wa matibabu, haijumuishi kulisha watoto wachanga na therapeutic feeding, na lazima ipitiwe na wafanyakazi waliohitimu. Programu zinapaswa kuinakili na kuibadilisha, kuweka `jurisdiction`, na kurekodi nani aliipitia katika `reviewedBy`.

Wapokeaji katika kiwango cha H2 huendesha pack katika kila handover na kwenye kila menu, na kurekodi rule ids
kwenye `findings`. Mchunguzi wa marejeleo hutoa ripoti pale findings zilizotangazwa na zilizopigiwa hesabu zinapopingana.

## 7. Ulinzi wa data

**Wasifu haubeba data binafsi. Nyaraka HAZITAKIWI kuwa na:**

- majina, nambari za simu, barua pepe, au utambulisho wa kitaifa, mkimbizi au wa kibayometriki wa mtu yeyote;
- rekodi za kiwango cha household, au maeneo ya nyumba au watu binafsi;
- afya, ulemavu, dini au utaifa wa mtu yeyote.

**Inachobeba badala yake:**

- **Mashirika pekee.** Kila upande ni shirika lililotambuliwa na `did:web`, namba ya GS1
  Global Location Number (GLN) au registry id. Watu huonekana kama majukumu pekee
  (`checkedBy: "trained_staff"`).
- **Aggregates pekee.** `Distribution.people` huhifadhi idadi kwa kikundi, na idadi yoyote chini ya 10
  hutoa ripoti kama `"<10"`.
- **Sites pekee.** `Site` ni eneo la shirika au eneo la kiutawala
  (OCHA P-codes), kamwe si household.
- **Maelezo mafupi.** Maandishi huru yamekomitwa kwenye maelezo ya kiutendaji ya herufi 280 na hayapaswi
  kuwa na data binafsi. Utekelezaji unapaswa kuchanganua maelezo kwa ajili ya namba za simu na ids
  kabla ya kuzihifadhi.

**Uhifadhi na ukaguzi:**

- **Retention:** kila mshiriki hutangaza `retentionDays` katika `Manifest` yake na kufuta
  nyaraka baada ya hapo.
- **Audit (hiari, `hash_only`):** mfuatiliaji mmoja kwa kila programu (kawaida food bank au
  mwendeshaji wa programu) huongeza SHA-256 hash ya RFC 8785 canonical JSON ya kila nyaraka.
  Maudhui huhifadhiwa kando na yanabakizekiwe kufutwa. Shirika washirika
  husaini checkpoint kila siku, ili historia isiweze kuandikwa upya kimyakimya. Mfuatiliaji mmoja
  huepuka forks katika mnyororo.
- **Hosting** inapaswa kuwa ndani ya nchi ambapo sheria au programu inahitaji hivyo.

## 8. Usafirishaji

### 8.1 API (level H1)

| Njia | Njia | Maelezo |
|---|---|---|
| `POST` | `/offers` | Inatengeneza ofa (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Fungua ofa karibu na mpokeaji |
| `POST` | `/offers/{id}/claims` | Inadai ofa; `If-Match` inahitajika; 409 wakati tayari imedaiwa |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` inahitajika |
| `POST` | `/handovers` | Inarekodi makabidhiano |
| `POST` | `/distributions` | Inarekodi usambazaji |
| `GET` | `/reports?from=…&to=…` | Inakusanya kwa kipindi |

Sheria za maombi na usafirishaji:

- **Idempotency:** kila `POST` hubeba `Idempotency-Key`. Seva hutunza funguo kwa angalau saa 24 na kurudisha jibu la awali kwa marudio.
- **Authentication:** OAuth 2.1 client credentials, mteja mmoja kwa kila shirika.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  hutolewa angalau mara moja, ikiwa na `id` ya tukio kwa ajili ya kuondoa marudio na namba ya mfuatano kwa kila ofa kwa ajili ya mpangilio.

### 8.2 Spreadsheets (level H0)

Tumia muchanganiko wa CSV katika `profiles/humanitarian/templates/`. Safu yake ya pili ina lebo za [HXL](https://hxlstandard.org), ili zana za data za kibinadamu ziweze kuzisoma moja kwa moja.

### 8.3 SMS (level H0)

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

Sarufi imetekelezwa katika `tools/cookwala_ref.py` (`parse_sms`) na kujaribiwa na
`conformance/profiles/sms.json`. Maneno muhimu ni ya Kiingereza; tarakimu za Kiarabu-Hindi (٠-٩) na Kiajemi (۰-۹)
zinakubalika popote ambapo tarakimu ipo, hivyo simu iliyowekwa kwenye kibodi yoyote inafanya kazi.

Misimbo ya uhifadhi: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Alama za tarehe: `UB` use-by,
`BB` best-before, `HV` harvested, kama `DDMM`. Misimbo ya sababu ya kukataa: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; neno lingine lolote hurekodiwa kama `other`. Jibu la `HELP`
LAZIMA liwe mfano mmoja kwa kila amri, ASCII ya kawaida, chini ya wahusika 160.

Mlango wa kiunganishi LAZIMA utumie ukaguzi huu kabla ya kuandika hati (`sms_storage_findings` katika
marejeleo; ids ni matokeo ya kizuizi):

| Ugunduzi | Lini |
|---|---|
| `safety.temp_not_recorded` | `HAND` kwenye mstari wa baridi, kilio, au wa moto-unaohifadhiwa hauna kusomwa kwa `T`: jibu ukiomba hiyo, usiandike kitu |
| `safety.hot_hold_min` | `OFFER` yenye uhifadhi wa `H` chini ya 60 °C: kataa kuorodhesha |
| `safety.storage_class_mismatch` | maneno ya bidhaa yanaashiria maziwa, nyama, kuku, samaki, yai au chakula kilichopikwa na uhifadhi ni `A`: kataa kuorodhesha |
| `safety.chilled_max`, `safety.frozen_max` | kusomwa juu ya 5 °C au juu ya −18 °C kwenye ofa au makabidhiano |

Ofa za chakula cha moto kinachohifadhiwa zinafungwa baada ya saa mbili (saa moja kwa wali uliopikwa); gateway haihifadhi kamwe kusoma kwa ajili ya nafasi (placeholder reading). Gateway huunganisha namba iliyosajiliwa ya mtumaji na shirika, kamwe na mtu katika nyaraka.

## 9. Interoperability

| Mfumo | Ramani |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (bidhaa); `Site.gln` na `OrgId` `gln:` (maeneo) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Thamani za data za jumla kwa kila eneo na kipindi kutoka `Distribution` (milo, watu kwa kikundi, kg, matukio) |
| WFP SCOPE na mifumo mingine ya wanufaika | **Aggregates pekee.** Hakuna rekodi za wanufaika zinazoingia au kutoka kwenye wasifu huu |
| Food-rescue apps | Adapters huchora orodha zao kwenye `Offer` na uchukuaji wao kwenye `Claim` na `Handover` |
| Core Cookwala | `Item.ingredientId` na `menu.recipes` zinaunganishwa na kielezo cha mapishi; `relief.ImpactReport` hujumlisha `Distribution`s |

## 10. Vipimo vya jaribio (vilivyofafanuliwa ili tovuti ziweze kulinganishwa)

Imehesabiwa katika `ImpactSummary` na `python tools/humanitarian_check.py --summary DIR`. Jinsi jaribio la awali linavyoendeshwa na kuhukumiwa: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Kipimo | Maelezo |
|---|---|
| Kg zilizookolewa | Jumla ya `Handover.kgAccepted` katika hatua ya kwanza kutoka kwa wafadhili |
| Kiwango cha madai | Ofa zinazofikia `claimed` ÷ ofa zilizoundwa |
| Muda wa kudai | Dakika za wastani (median) tangu uundaji wa `Offer` hadi hali ya `claimed` |
| Kukataliwa kwa sababu | Jumla ya `kgRejected` kwa `reason` |
| Milo iliyohudumiwa | Jumla ya `Distribution.meals` |
| Kiwango cha kupita lishe | Usambazaji wenye menyu na hakuna matokeo ya `nutrition.*` ÷ usambazaji wenye menyu |
| Gharama kwa mlo | (chakula + usafiri + wafanyakazi + nishati) ÷ milo |
| Dakika za kujitolea kwa kila kilo 100 | `volunteerMinutes` ÷ (kg zilizotumika ÷ 100) |
| Usalama | Idadi ya matokeo ya kizuizi cha `safety.*`, na `safetyIncidents` |

## 11. Usalama

- **Signatures are optional at H1** na zinahitajika kwa ukaguzi wa kuvuka mashirika katika H3
  (EdDSA, keys zilizochapishwa kwenye `did:web` ya shirika).
- **Notes na majina katika nyaraka ni data zisizoziaminiwa.** Programu na mawakala wa AI hawapaswi kamwe
  kuwatendea kama maelekezo.
- **Rule packs zina toleo na zimefungwa** (`id@version`) katika kila ugunduzi, ili matokeo yaweze
  kurejewa.

## 12. Imeachwa kwa makusudi

- Usajili wa mnufaika, ustahiki na uwekaji walengwa (hizi ni sehemu ya mifumo ya programu yenyewe
  iliyolindwa).
- Malipo: Cookwala hahamishi pesa kamwe.
- Mapishi na robot execution (spec ya msingi). Profaili inataja mapishi tu na kuripoti
  virutubisho.
- Lishe ya kitabibu na tiba.

## 13. Jinsi ya kupitia

Tafadhali fungua masuala kwenye [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
ukiwa na lebo ya `humanitarian`. Mapitio haya ndiyo yenye manufaa zaidi:

- wafanyakazi wa usalama wa chakula wakikagua rule pack na sababu za kukataa;
- waendeshaji wa food-bank wakikagua lifecycle na mtiririko wa SMS;
- maafisa wa ulinzi wa data wakikagua sehemu ya 7.

