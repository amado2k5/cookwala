<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala మానవతా ప్రొఫైల్ (draft 0.2)

**Status:** food banks, relief programs మరియు food-safety and nutrition professionals ద్వారా సమీక్ష కోసం డ్రాఫ్ట్. ఇది WFP, WHO, FAO, Global FoodBanking Network లేదా ఇక్కడ పేర్కొనబడిన మరే ఇతర సంస్థ ద్వారా సమీక్షించబడలేదు లేదా ఆమోదించబడలేదు.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (అన్నీ), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; వృత్తిపరమైన సమీక్ష కోసం వేచి ఉన్న డ్రాఫ్ట్‌లన్నీ, [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md) చూడండి)
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (Cairo లో food bank, school meals, disaster kitchen, robot kitchen), ప్రతిదీ ఒక గణించబడిన `ImpactSummary` తో
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. 0.2 ఏమి జోడిస్తుంది (RFC-0003, RFC-0004)

0.1 కంటే ఎక్కువ ఉన్న అడిటివ్ (Additive); రీడర్లు రెండింటినీ అంగీకరిస్తారు.

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) మరియు `Item.harvestedAt`; పాత్రలు `farm`, `caterer`, `robot_kitchen`; SMS పదం `FARM`.
- **Care rules:** `Item.foodClasses` మరియు `Distribution.menu.foodClasses` (raw egg, unpasteurized dairy, whole nuts, cooked rice…), rule kind `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; మూడు కొత్త draft packs.
- **Reviews:** `RulePack.reviews` ప్రతి review యొక్క వృత్తి, సంస్థ, తేదీ, పరిధి మరియు ఫలితాన్ని నమోదు చేస్తుంది; `status: reviewed` కు ఒక approved review అవసరం.
- **Impact:** తొమ్మిది కొలతలతో `ImpactSummary`, ప్రతిదీ `method` (measured, modelled, assumed, not recorded) కలిగి ఉంటుంది, ఇది `tools/humanitarian_check.py --summary` ద్వారా గణించబడుతుంది.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` తద్వారా రక్షించబడిన కిలోగ్రాములు ఒకేసారి లెక్కించబడతాయి.
- **Program types** `Manifest` పై.

## 1. ఉద్దేశ్యం

ప్రజలకు ఆహారం అందించే సంస్థల కోసం Cookwala యొక్క ఒక చిన్న, కఠినమైన, వ్యక్తిగత-డేటా-రహిత భాగం:
food banks, community kitchens, school-meal programs, relief programs, donors (grocers,
restaurants, farms, caterers), transporters మరియు cold stores. ఇది నాలుగు పనులను కవర్ చేస్తుంది:

1. **surplus food అందించడం** మరియు దానిని వేగంగా మరియు నిష్పక్షపాతంగా క్లెయిమ్ చేయడం.
2. ఉష్ణోగ్రత తనిఖీతో (cold-chain check) కూడిన, కస్టడీ యొక్క **ప్రతి handover ని నమోదు చేయడం**.
3. **ఏమి వడ్డించబడిందో రిపోర్ట్ చేయడం**, కేవలం aggregate counts గా మాత్రమే.
4. మెషిన్-రీడబుల్ పోషకాహార మరియు ఆహార-భద్రత rule pack లతో పోల్చి **మెనూలు మరియు handovers ని తనిఖీ చేయడం**.

**ఇది రోబోలు, యాప్‌లు లేదా ఇంటర్నెట్ లేకుండా పనిచేస్తుంది.** H0 మరియు H1 స్థాయిలు స్ప్రెడ్‌షీట్‌లు, SMS మరియు బేసిక్ ఫోన్‌లపై నడుస్తాయి. రోబోలు, hubs మరియు ఏజెంట్లు అదే పత్రాల ఐచ్ఛిక వినియోగదారులు.

## 2. సూత్రాలు

- **హాని చేయవద్దు.** ఒక వ్యక్తిని లేదా household ను గుర్తించేలా, స్థానాన్ని తెలుసుకునేలా లేదా ప్రొఫైల్ చేసేలా ఉండే ఏదీ సేకరించవద్దు. సున్నితమైన పరిస్థితులలో, లబ్ధిదారుల గురించి డేటా అనేది ఒక రక్షణ రిస్క్.
- **మానవతావాద సూత్రాలు** (humanity, neutrality, impartiality, independence): సహాయంపై ఎటువంటి వాణిజ్య బ్రాండింగ్ ఉండకూడదు, మరియు మార్కెటింగ్ కోసం డేటాను ఉపయోగించకూడదు.
- **కఠినమైన మరియు చిన్నది.** ప్రతి ఆబ్జెక్ట్ తెలియని ఫీల్డ్స్‌ను తిరస్కరిస్తుంది ( `x-` extensions మినహా), కాబట్టి typos మరియు అదనపు వ్యక్తిగత ఫీల్డ్స్ validation లో విఫలమవుతాయి.
- **ఖచ్చితమైన యూనిట్లు:** kilograms, degrees Celsius, absolute tolerances, మరియు డబ్బు decimal strings గా ఉండాలి.
- **స్థానిక నియమాలే ముఖ్యం.** Rule packs లను జాతీయ ఆహార-భద్రత మరియు విరాళాల చట్టం ద్వారా భర్తీ చేయవచ్చు.
- **ఓపెన్:** royalty-free spec, open-source tools. ఈ ప్రొఫైల్ Digital Public Goods Standard మరియు Principles for Digital Development కు అనుగుణంగా రూపొందించబడింది.

## 3. Conformance levels

| స్థాయి | ఒక భాగస్వామి చేసేది | అవసరాలు |
|---|---|---|
| **H0 — Paper & SMS** | CSV templates (HXL hashtag rows తో) లో లేదా SMS ద్వారా (section 8.3) ఆఫర్లు, హ్యాండోవర్లు మరియు పంపిణీలను నమోదు చేస్తారు | ఒక spreadsheet లేదా ఒక బేసిక్ ఫోన్ |
| **H1 — Rescue** | API ద్వారా `Offer`, `Claim`, `Handover` మరియు `Distribution` పత్రాలను మారుస్తారు; state machine (section 5) ను అనుసరిస్తారు | ఏదైనా HTTP client |
| **H2 — Safety & nutrition** | ప్రతి హ్యాండోవర్ మరియు మెనూకి ఒక `RulePack` ను వర్తింపజేస్తారు, మరియు `findings` ను నమోదు చేస్తారు | The reference checker లేదా దానికి సమానమైనది |
| **H3 — Interoperability** | aggregates ను HXL, DHIS2 మరియు కోర్ Cookwala `ImpactReport` కు ఎగుమతి చేస్తారు; GS1 identifiers ను ఉపయోగిస్తారు | Integration work |

ఒక భాగస్వామి `/.well-known/cookwala-humanitarian.json` వద్ద ఒక `Manifest` ను ప్రచురిస్తారు, ఇది దాని స్థాయిలు, rule packs, endpoints మరియు `personalData: "none"` ను ప్రకటిస్తుంది.

## 4. పత్రాలు

| పత్రం (Document) | ఎవరు రాస్తారు (Who writes it) | ఉద్దేశ్యం (Purpose) |
|---|---|---|
| `Offer` | Donor | సేకరణ కోసం అందుబాటులో ఉన్న surplus food: వస్తువులు (kg, storage, date marks, allergens), window, site, temperatures |
| `Claim` | Food bank, kitchen, program | ఒక offer లోని మొత్తం లేదా కొంత భాగాన్ని, pickup time మరియు vehicle type తో క్లెయిమ్ చేయడం |
| `Handover` | Receiver of custody | ప్రతి leg కి ఒకటి: temperatures, కారణం (reason code) తో అంగీకరించిన లేదా తిరస్కరించిన kg, మరియు rule findings |
| `Distribution` | Kitchen, food bank, school | ఒక రోజున ఒక site వద్ద అందించిన meals మరియు people యొక్క మొత్తం వివరాలు; ఐచ్ఛికంగా menu nutrients మరియు costs |
| `RulePack` | Program or authority | వెర్షన్ చేయబడిన nutrition మరియు food-safety rules (section 6) |
| `Manifest` | ప్రతి participant | Capabilities మరియు data-protection declaration |

ప్రధాన Cookwala ఉపశమనం పత్రాలు (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) ప్రణాళిక కోసం అందుబాటులో ఉంటాయి. ఈ ప్రొఫైల్
operational flow ని నిర్వహిస్తుంది.

## 5. Offer lifecycle

| నుండి | అనుమతించబడిన next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (the claim lapsed), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | none (final) |

**స్థితి మార్పుల కోసం నియమాలు:**

- ప్రతి మార్పు `version` ను పెంచుతుంది. రైటర్లు `If-Match: <version>` పంపుతారు; ఒకవేళ అది సరిపోకపోతే **409** తిరిగి వస్తుంది, మరియు రైటర్ మళ్ళీ చదివి ప్రయత్నిస్తారు.
- ఒక అక్రమ ట్రాన్సిషన్ (illegal transition) అనుమతించబడిన ట్రాన్సిషన్లతో కలిపి **409** ను తిరిగి ఇస్తుంది.
- ఆఫర్లు `window.to` వద్ద ఆటోమేటిక్‌గా `expired` కి మారుతాయి.
- క్లెయిమ్‌లు `pickupBy` మరియు ప్రోగ్రామ్ సెట్ చేసే గ్రేస్ పీరియడ్ (డిఫాల్ట్ 30 minutes) తర్వాత ముగిసిపోతాయి.

**సమానమైన క్లెయిమింగ్.** డిఫాల్ట్‌గా, క్లెయిమ్‌లు ప్రోగ్రామ్ నిర్ణయించిన ప్రాధాన్యత స్థాయి (priority tier) లో ముందు వచ్చిన వారికి లభిస్తాయి:
ఉదాహరణకు, పిల్లలకు సేవ చేసే కిచెన్‌లు మొదట, తర్వాత ఇతర కిచెన్‌లు, ఆపై food banks. స్థాయిలు (Tiers) మరియు
ఏవైనా రొటేషన్ నియమాలు ప్రోగ్రామ్ యొక్క `Manifest` లేదా వెబ్‌సైట్‌లో ప్రచురించబడాలి.

## 6. ఆహార భద్రత మరియు పోషకాహార rule packs

ఒక `RulePack` ఆరు రకాల నియమాలను కలిగి ఉంటుంది:

- `temperature`: chilled ≤ 5 °C, hot-held ≥ 60 °C, frozen ≤ −18 °C;
- `time`: cooked food temperature control వెలుపల గరిష్టంగా 2 h;
- `date_mark`: use-by blocks, best-before warns;
- `allergen`: undeclared allergens block;
- `nutrient`: person-day లేదా per meal కి గాను పరిమాణాలు;
- `energy_share`: free sugars, fat, saturated fat, trans fat లేదా protein నుండి వచ్చే energy share.

ప్రతి rule `block` (అంగీకరించకూడదు లేదా అందించకూడదు) లేదా `warn` (అనుమతించబడింది, ఒక finding గా నమోదు చేయబడింది).

డిఫాల్ట్ ప్యాక్ `who-codex-basic@0.1.0` అనేది ఒక **public guidance నుండి రూపొందించబడిన draft**: WHO యొక్క healthy-diet, sodium, sugars మరియు fats guidance, WHO Five Keys to Safer Food, Codex labelling మరియు frozen-food codes, మరియు Sphere యొక్క minimum ration planning figures. ఇది సరళీకరించబడింది, ఇది వైద్య సలహా కాదు, శిశువు మరియు therapeutic feeding ను మినహాయించింది, మరియు దీనిని అర్హత కలిగిన సిబ్బంది ద్వారా సమీక్షించబడాలి. ప్రోగ్రామ్‌లు దీనిని కాపీ చేసి అనువదించుకోవాలి, `jurisdiction` ను సెట్ చేయాలి, మరియు ఎవరు సమీక్షించారో `reviewedBy` లో నమోదు చేయాలి.

H2 స్థాయి వద్ద ఉన్న Receivers ప్రతి handover మరియు ప్రతి menu వద్ద pack ను run చేస్తారు, మరియు rule ids ను `findings` లో record చేస్తారు. డిక్లేర్ చేయబడిన మరియు కంప్యూట్ చేయబడిన findings విభేదించినప్పుడు reference checker నివేదిస్తుంది.

## 7. డేటా రక్షణ

**ఈ ప్రొఫైల్‌లో ఎటువంటి వ్యక్తిగత డేటా లేదు. పత్రాలలో ఇవి ఉండకూడదు:**

- ఏ వ్యక్తి యొక్క పేర్లు, ఫోన్ నంబర్లు, ఈమెయిల్స్, లేదా జాతీయ, శరణార్థి లేదా బయోమెట్రిక్ గుర్తింపులు;
- గృహ-స్థాయి రికార్డులు, లేదా ఇళ్లు లేదా వ్యక్తుల యొక్క స్థానాలు;
- ఏ వ్యక్తి యొక్క ఆరోగ్యం, వైకల్యం, మతం లేదా జాతీయత.

**దానికి బదులుగా ఇది ఏమి మోస్తుంది:**

- **సంస్థలు మాత్రమే.** ప్రతి పక్షం `did:web`, ఒక GS1 Global Location Number (GLN) లేదా ఒక registry id ద్వారా గుర్తించబడిన సంస్థ. వ్యక్తులు కేవలం పాత్రలుగా మాత్రమే కనిపిస్తారు (`checkedBy: "trained_staff"`).
- **అగ్రిగేట్లు మాత్రమే.** `Distribution.people` అనేది సమూహం వారీగా గణనలను కలిగి ఉంటుంది, మరియు 10 కంటే తక్కువగా ఉన్న ఏ గణననైనా `"<10"` గా నివేదించబడుతుంది.
- **సైట్లు మాత్రమే.** ఒక `Site` అనేది ఒక సంస్థ యొక్క ప్రాంగణం లేదా ఒక పరిపాలనా ప్రాంతం (OCHA P-codes), ఇది ఎన్నడూ ఒక household కాదు.
- **చిన్న నోట్లు.** ఫ్రీ టెక్స్ట్ అనేది 280-క్యారెక్టర్ల ఆపరేషనల్ నోట్లకు మాత్రమే పరిమితం చేయబడింది మరియు ఇందులో వ్యక్తిగత డేటా ఉండకూడదు. ఇంప్లిమెంటేషన్లు నోట్లను నిల్వ చేసే ముందు ఫోన్ నంబర్లు మరియు ids కోసం వాటిని స్కాన్ చేయాలి.

**Retention and audit:**

- **Retention:** ప్రతి భాగస్వామి తన `Manifest` లో `retentionDays` ని ప్రకటిస్తుంది మరియు దాని తర్వాత పత్రాలను తొలగిస్తుంది.
- **Audit (optional, `hash_only`):** ప్రతి ప్రోగ్రామ్ కు ఒక సీక్వెన్సర్ (సాధారణంగా food bank లేదా ప్రోగ్రామ్ ఆపరేటర్) ప్రతి పత్రం యొక్క RFC 8785 canonical JSON యొక్క SHA-256 hash ను జోడిస్తుంది. కంటెంట్ విడిగా నిల్వ చేయబడుతుంది మరియు తొలగించదగినదిగా ఉంటుంది. ఒక భాగస్వామ్య సంస్థ ప్రతిరోజూ ఒక checkpoint కు కౌంటర్-సైన్ చేస్తుంది, తద్వారా చరిత్రను నిశ్శబ్దంగా తిరిగి రాయలేరు. ఒకే ఒక సీక్వెన్సర్ చైన్ లో forks ను నివారిస్తుంది.
- **Hosting** చట్టం లేదా ప్రోగ్రామ్ కోరినట్లయితే దేశంలోనే ఉండాలి.

## 8. Transport

### 8.1 API (level H1)

| పద్ధతి | మార్గం | గమనికలు |
|---|---|---|
| `POST` | `/offers` | ఒక ఆఫర్‌ను సృష్టిస్తుంది (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | రిసీవర్‌కు దగ్గరలో ఉన్న ఓపెన్ ఆఫర్‌లు |
| `POST` | `/offers/{id}/claims` | ఒక ఆఫర్‌ను క్లెయిమ్ చేస్తుంది; `If-Match` అవసరం; ఇప్పటికే క్లెయిమ్ చేయబడితే 409 |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` అవసరం |
| `POST` | `/handovers` | ఒక హ్యాండోవర్‌ను రికార్డ్ చేస్తుంది |
| `POST` | `/distributions` | ఒక డిస్ట్రిబ్యూషన్‌ను రికార్డ్ చేస్తుంది |
| `GET` | `/reports?from=…&to=…` | ఒక కాలానికి సంబంధించిన అగ్రిగేషన్స్ |

అభ్యర్థన మరియు రవాణా నియమాలు:

- **Idempotency:** ప్రతి `POST` ఒక `Idempotency-Key`ని కలిగి ఉంటుంది. సర్వర్లు కనీసం 24 h వరకు కీలను ఉంచుతాయి మరియు పునరావృతాల కోసం అసలు ప్రతిస్పందనను తిరిగి ఇస్తాయి.
- **Authentication:** OAuth 2.1 క్లయింట్ క్రెడెన్షియల్స్, ప్రతి సంస్థకు ఒక క్లయింట్.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  కనీసం ఒక్కసారైనా డెలివరీ చేయబడతాయి, డూప్లికేషన్ నివారణ కోసం ఒక ఈవెంట్ `id` మరియు క్రమబద్ధీకరణ కోసం ప్రతి ఆఫర్‌కు ఒక సీక్వెన్స్ నంబర్ ఉంటాయి.

### 8.2 Spreadsheets (level H0)

`profiles/humanitarian/templates/` లోని CSV templates ఉపయోగించండి. వాటి రెండవ వరుసలో
[HXL](https://hxlstandard.org) hashtags ఉంటాయి, తద్వారా humanitarian data tools వాటిని నేరుగా చదవగలవు.

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

గ్రామర్ `tools/cookwala_ref.py` (`parse_sms`) లో అమలు చేయబడింది మరియు
`conformance/profiles/sms.json` ద్వారా పరీక్షించబడింది. కీవర్డ్స్ ఇంగ్లీష్; అరేబిక్-ఇండిక్ (٠-٩) మరియు పర్షియన్ (۰-۹)
అంకెలు ఎక్కడైనా అంకె ఉన్న చోట అంగీకరించబడతాయి, కాబట్టి ఏదో ఒక కీబోర్డ్‌కు సెట్ చేయబడిన ఫోన్ పనిచేస్తుంది.

స్టోరేజ్ కోడ్‌లు: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. తేదీ గుర్తులు: `UB` use-by,
`BB` best-before, `HV` harvested, `DDMM` గా. తిరస్కరణ కారణం కోడ్‌లు: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; మరే ఇతర పదం అయినా `other` గా రికార్డ్ చేయబడుతుంది. `HELP`
సమాధానం ప్రతి కమాండ్‌కు ఒక ఉదాహరణగా, ప్లెయిన్ ASCII లో, 160 క్యారెక్టర్ల కంటే తక్కువ ఉండాలి.

ఒక గేట్‌వే డాక్యుమెంట్‌ను (`sms_storage_findings` రిఫరెన్స్‌లో; ids లు బ్లాక్ findings లు) వ్రాయడానికి ముందు ఈ తనిఖీలను తప్పనిసరిగా వర్తింపజేయాలి:

| కనుగొన్న అంశం | ఎప్పుడు |
|---|---|
| `safety.temp_not_recorded` | చల్లబరిచిన, గడ్డకట్టిన లేదా వేడిగా ఉంచబడిన లైన్ పై `HAND` ఉన్నప్పుడు ఎటువంటి `T` రీడింగ్ లేకపోతే: దాని కోసం అడుగుతూ ప్రత్యుత్తరం ఇవ్వండి, ఏమీ వ్రాయకండి |
| `safety.hot_hold_min` | నిల్వ `H` 60 °C కంటే తక్కువగా ఉన్న `OFFER` ఉన్నప్పుడు: దానిని జాబితా చేయడాన్ని నిరాకరించండి |
| `safety.storage_class_mismatch` | ఐటమ్ పదాలు డైరీ, మాంసం, పౌల్ట్రీ, చేపలు, కోడిగుడ్డు లేదా వండిన ఆహారాన్ని సూచిస్తూ నిల్వ `A` గా ఉన్నప్పుడు: దానిని జాబితా చేయడాన్ని నిరాకరించండి |
| `safety.chilled_max`, `safety.frozen_max` | ఆఫర్ లేదా హ్యాండోవర్ సమయంలో రీడింగ్‌లు 5 °C కంటే ఎక్కువగా లేదా −18 °C కంటే ఎక్కువగా ఉన్నప్పుడు |

వేడిని నిలిపి ఉంచే ఆహారపు ఆఫర్లు రెండు గంటల తర్వాత ముగిసిపోతాయి (ఉడికించిన అన్నం కోసం ఒక గంట); ఒక gateway ఎప్పుడూ placeholder రీడింగ్‌ను నిల్వ చేయదు. gateway పంపినవారి రిజిస్టర్డ్ నంబర్‌ను ఒక సంస్థకు మ్యాప్ చేస్తుంది, పత్రాలలో ఎప్పుడూ ఒక వ్యక్తికి మ్యాప్ చేయదు.

## 9. Interoperability

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (products); `Site.gln` and `OrgId` `gln:` (locations) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | `Distribution` నుండి సైట్ మరియు కాలపరిమితికి సంబంధించిన అగ్రిగేట్ డేటా విలువలు (meals, people by group, kg, incidents) |
| WFP SCOPE మరియు ఇతర beneficiary systems | **Aggregates only.** ఏ beneficiary records కూడా ఈ profile లోకి లేదా దీని నుండి బయటకు రావు |
| Food-rescue apps | Adapters వాటి listingsలను `Offer` కి మరియు వాటి pickupsలను `Claim` మరియు `Handover` కి మ్యాప్ చేస్తాయి |
| Core Cookwala | `Item.ingredientId` మరియు `menu.recipes` రెసిపీ ఇండెక్స్‌కు లింక్ చేయబడతాయి; `relief.ImpactReport` `Distribution`లను సమ్ చేస్తుంది |

## 10. పైలట్ మెట్రిక్స్ (సైట్‌లను పోల్చడానికి వీలుగా నిర్వచించబడ్డాయి)

`python tools/humanitarian_check.py --summary DIR` ద్వారా `ImpactSummary` లోకి గణించబడింది. పైలట్ ఎలా నడపబడుతుంది మరియు తీర్పు ఇవ్వబడుతుంది: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metric | Definition |
|---|---|
| Kg rescued | దాతల నుండి మొదటి దశలో `Handover.kgAccepted` మొత్తం |
| Claim rate | `claimed` స్థితికి చేరుకున్న ఆఫర్లు ÷ సృష్టించబడిన ఆఫర్లు |
| Time to claim | `Offer` సృష్టి నుండి `claimed` స్థితికి మధ్య ఉండే మధ్యస్థ నిమిషాలు |
| Rejection by reason | `reason` ద్వారా `kgRejected` మొత్తం |
| Meals served | `Distribution.meals` మొత్తం |
| Nutrition pass rate | మెనూలు కలిగి ఉండి `nutrition.*` కనుగొనబడని పంపిణీలు ÷ మెనూలు కలిగి ఉన్న పంపిణీలు |
| Cost per meal | (food + transport + staff + energy) ÷ meals |
| Volunteer minutes per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Safety | `safety.*` బ్లాక్ కనుగొనబడిన అంశాల సంఖ్య, మరియు `safetyIncidents` |

## 11. భద్రత

- **H1 వద్ద Signatures optional** మరియు H3 వద్ద cross-organization audit కోసం అవసరం
  (EdDSA, సంస్థ యొక్క `did:web` లో ప్రచురించబడిన keys).
- **పత్రాలలో Notes మరియు names untrusted data.** Software మరియు AI agents వాటిని ఎప్పుడూ
  instructions గా పరిగణించకూడదు.
- **Rule packs versioned మరియు pinned** (`id@version`) చేయబడతాయి, తద్వారా ఫలితాలు
  reproducible గా ఉంటాయి.

## 12. కావాలని వదిలివేయబడింది

- లబ్ధిదారుల నమోదు, అర్హత మరియు లక్ష్యీకరణ (ఇవి ప్రోగ్రామ్ యొక్క స్వంత
  రక్షిత వ్యవస్థలకు చెందినవి).
- చెల్లింపులు: Cookwala ఎప్పుడూ డబ్బును తరలించదు.
- రెసిపీలు మరియు రోబోట్ execution (కోర్ spec). ప్రొఫైల్ కేవలం రెసిపీలను మాత్రమే పేర్కొంటుంది మరియు
  పోషకాలను నివేదిస్తుంది.
- వైద్య మరియు చికిత్సా పోషకాహారం.

## 13. ఎలా సమీక్షించాలి

దయచేసి [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues) లో `humanitarian` లేబుల్‌తో ఇష్యూలను (issues) తెరవండి. ఈ రివ్యూలు అత్యంత ఉపయోగకరమైనవి:

- food-safety staff rule pack మరియు reject reasons తనిఖీ చేస్తున్నారు;
- food-bank operators lifecycle మరియు SMS flow తనిఖీ చేస్తున్నారు;
- data-protection officers section 7 తనిఖీ చేస్తున్నారు.

