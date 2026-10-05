<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala Recipe Format: Missions తో పనిచేసే recipes

Cookwala లోని ఒక రెసిపీ అనేది సూచనల జాబితా కాదు. ఇది ఒక ప్లానర్ ఒక నిర్దిష్ట Mission (household, robots, appliances, energy, budget, health, timing) కి వ్యతిరేకంగా ఒక ఎగ్జిక్యూటబుల్ ప్లాన్‌గా *compile* చేసే **portable cooking knowledge**. వాస్తవికత మారినప్పుడు, అత్యవసర పరిస్థితులు మరియు playbooks ద్వారా అనుగుణ్యతను సాధిస్తూ, రోబోట్ ఆ ప్లాన్‌ను రన్ చేస్తుంది.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). పూర్తిగా పనిచేసే ఉదాహరణ:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. నాలుగు పొరలు (WHO SMART Guidelines విధానం నుండి తీసుకోబడినవి)

| Layer | ఇది దేనిని కలిగి ఉంటుంది | ఎవరు రాస్తారు | ఇది ఎక్కడ ఉంటుంది |
|---|---|---|---|
| **R1 Narrative** | మానవ రెసిపీ టెక్స్ట్, కథ, సాంస్కృతిక గమనికలు, ఫోటోలు | వంట చేసేవారు, చెఫ్‌లు, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | వంటకం *ఏమిటి* మరియు *ఎలా ఉండాలి*: identity (essential vs flexible), sensory targets, పోషకాహారం, వడ్డన మరియు తినే శైలి, నిల్వ, acceptance checks | రెసిపీ ఎడిటర్లు, AI-assisted, సమీక్షించబడినవి | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Device-agnostic పద్ధతి: formula (ratios + roles), food-state pre/post conditions తో కూడిన typed ops యొక్క process graph, `until` conditions, ప్రత్యామ్నాయాలు, pause rules, failure modes, affordances, hazards, CCPs, environment prep | Export pipeline + review; simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | *ఈ* Mission కోసం compiled చేయబడిన R3 రెసిపీ: ఖచ్చితమైన పరిమాణాలు, ఎంచుకున్న variants, కేటాయించిన actors మరియు devices, షెడ్యూల్, leases, monitors, contingencies | Planner/compiler, run time లో | **Mission** (`plan`) లోపల, ఎప్పుడూ catalog లో ఉండదు |

సోర్స్ కోడ్ మరియు కంపైలర్‌లా: **రెసిపీ అనేది పోర్టబుల్ ఇంటర్మీడియట్ రిప్రజెంటేషన్
(R3 + R2). మిషన్ అనేది టార్గెట్ మెషీన్.** రోబోలు మరియు AI మారినప్పుడు రెసిపీలు చెల్లుబాటు అయ్యేలా ఉంచేది అదే: ఒక మెరుగైన ప్లానర్ అదే రెసిపీ నుండి మెరుగైన R4 ని ఉత్పత్తి చేస్తుంది.

## 2. ఒక Mission లో ప్రతి విభాగం చేసే పని ఏమిటి

| Recipe section | Mission ద్వారా దీని కోసం ఉపయోగించబడుతుంది… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutions, budget మరియు ration modes, diet adaptations: flexible భాగాలను మార్చండి, essentials ని ఎప్పుడూ మార్చకండి, తద్వారా వంటకం తన స్వభావాన్ని కోల్పోదు |
| `formula` (ratios, min/max, role, scaling) | ఏ సంఖ్యలోనైనా వ్యక్తులకు ఖచ్చితమైన scaling, వారం అంతటా ingredients ని ration చేయడం, budget ని విస్తరించడం, అందుబాటులో ఉన్న వాటిని ఉపయోగించుకోవడం (the limiting-ingredient rescale) |
| `sensory` | Vision, aroma మరియు taste checkpoints; household taste profiles (salt 2 vs 4); repurpose మరియు fix నిర్ణయాలు |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Environment preparation tasks:** ఒకవేళ sink లేదా hob నిగాడుబడి ఉంటే, planner "clear, wash, dry" tasks ని జోడిస్తుంది; soak లేదా thaw tasks గంటల ముందుగానే షెడ్యూల్ చేయబడతాయి |
| `process.nodes[]` with `pre`/`post` food states | Planning (సిద్ధంగా ఉన్న వాటిని మాత్రమే ప్రారంభించండి), verification (ఆ step ఆ state ని ఉత్పత్తి చేసిందా?), interruptions తర్వాత resume చేయడం |
| `until`, `onTimeout`, `retry` | ఒక step ఎప్పుడు పూర్తవుతుందో మరియు అది పూర్తి కానప్పుడు ఏమి చేయాలో తెలుసుకోవడం |
| `alternatives[]` + `energy` | Gas vs induction vs oven, battery saver, no-oven kitchens, quiet hours |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruptions:** ఒక బిడ్డకు సహాయం కావాలి, యజమాని పిలుస్తారు, కుక్క ఏదైనా పడగొడుతుంది. రోబో ఆ step ని దాని safe state లోకి మారుస్తుంది, ఆ event ని హ్యాండిల్ చేస్తుంది, ఆపై pause budget ఆధారంగా resume, reheat, salvage లేదా discard చేస్తుంది |
| `failureModes` (incident, detect, prevent, playbook) | తెలిసిన సమస్యల యొక్క ముందస్తు detection మరియు తిరిగి పొందడానికి ఖచ్చితమైన playbook |
| `affordances`, `space` | పట్టుకోగల, ఎత్తగల మరియు చేరుకోగల రోబోలకు steps ని సరిపోల్చడం; hot zones ని పిల్లలకు దూరంగా ఉంచడం |
| `safety` (hazards, CCPs, supervision, abort) | The safety kernel: ప్రతి plan తప్పనిసరిగా కాపాడవలసిన invariants |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Serving: టేబుల్ మీదకు, గదిలోకి, lunchbox లోకి ఏమి వెళ్తుంది; reminders మరియు hold limits; సాంస్కృతిక eating style |
| `storage` | Leftovers, cook-ahead మరియు lunchbox Missions |
| `acceptance` | వంటకం యొక్క *tests*: ఇవి పాటించినప్పుడు Mission పూర్తవుతుంది |
| `nutrition`, `cost` | Personal portions, budget, relief rations |

## 3. ఉదాహరణ: అన్నింటితో అనుసంధానించబడిన ఒక దశ

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

## 4. ఒక Mission కోసం రెసిపీని రూపొందించడం (ప్లానర్ చేసే పని)

1. **వేరియంట్‌ను ఎంచుకోండి:** `alternatives` నుండి diet, texture (IDDSI), equipment, energy మరియు mode ఎంచుకోండి. Identity essentials తప్పనిసరిగా నిలవాలి.
2. **Scale:** `formula` మరియు servings, ఒక వ్యక్తికి పోర్షన్లు (HEALTH.md), పరిమిత పదార్థం (limiting ingredient), లేదా ration horizon నుండి. మసాలాలు sub-linearly, సమయం mass exponent ద్వారా.
3. **Substitute:** పాత్రల (roles) లోపల, `identity.neverAdd`, allergens, dietary packs మరియు inventoryలను గౌరవిస్తూ మార్చండి.
4. **పరిసరాలను సిద్ధం చేయండి:** Mission యొక్క space facets (sink full? hob occupied? board dirty?) తో `prep` ను పోల్చండి మరియు tidy, wash, dry మరియు stage పనులను జోడించండి. `advanceTasks` (soak, thaw, marinate, preheat) షెడ్యూల్ చేయండి.
5. **Bind:** సామర్థ్యాలు (affordances) మరియు నైపుణ్యాల (capabilities) ఆధారంగా ప్రతి నోడ్‌ను రోబోలు, ఉపకరణాలు లేదా మనుషులకు కేటాయించండి. Burners, vessels మరియు zones లను లీజుకు తీసుకోండి. మానిటర్లను (smart pot, delivery ETA, smoke detector) అనుసంధానించండి.
6. **Schedule:** serve time నుండి వెనక్కి షెడ్యూల్ చేయండి, pause budgets, battery మరియు energy limits, household quiet hours మరియు kitchen-sharing windowsలను గౌరవిస్తూ.
7. **Attach contingencies:** ప్రతి నోడ్ యొక్క `failureModes` మరియు `pause` నియమాలు, తో పాటు Mission యొక్క global policies (interruptions, child or pet near the hob, stove watchdog, spoilage watch).
8. **Verify:** schema + semantic checks, policy packs, CCP coverage, simulator dry-run, priority-stack invariants (PROTOCOL §7.2).
9. **Emit R4** ను Mission యొక్క `plan` లోకి పంపండి, దానిపై సంతకం చేయండి, మరియు రోబోకు అందించండి.

## 5. రచించడం మరియు మార్చడం

- **fifi.cooking నుండి:** EXPORT-FIFI పైప్‌లైన్ R1 + R2 + R3 ని ఉత్పత్తి చేస్తుంది. కొత్త
  విభాగాలు (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  ఉన్నత పాఠశాల వచనం నుండి స్థానిక మోడల్స్ ద్వారా ఉత్పత్తి చేయబడతాయి మరియు వాలిడేటర్లు మరియు
  నమూనా మానవ సమీక్ష ద్వారా తనిఖీ చేయబడతాయి.
- **వెబ్ నుండి:** `cookwala convert --from schema-org` → R1/R2 (V0), ఆపై అదే
  ఎన్‌రిచ్‌మెంట్.
- **ఇతర ఫార్మాట్‌లకు:** schema.org Recipe (సెర్చ్ ఇంజన్ల కోసం R1/R2), Cooklang (మానవ
  ఎడిటింగ్), PDDL లేదా టెంపోరల్ లాజిక్ (రీసెర్చ్ ప్లానర్స్) అన్నీ R3 నుండి ఉత్పత్తి చేయబడవచ్చు.
- **చేతితో:** `cookwala init recipe` అన్ని పొరలను స్కాఫోల్డ్ చేస్తుంది; `cookwala validate` మరియు
  `cookwala simulate` వాటిని తనిఖీ చేస్తాయి.
- **వెర్షనింగ్:** సవరణలు మార్చలేనివి మరియు హాష్ చేయబడినవి. ఫోర్క్‌లు `meta.derivedFrom` ని రికార్డ్ చేస్తాయి.
  రెసిపీ **patches** (ప్లేబుక్స్ లేదా ఫీడ్‌బ్యాక్ నుండి) డిఫ్స్‌లుగా ప్రతిపాదించబడతాయి మరియు సమీక్ష మరియు
  సాక్ష్యం తర్వాత మాత్రమే ప్రమోట్ చేయబడతాయి.

## 6. స్టెప్ టెక్స్ట్ యొక్క భాష

Step వాక్యాలు మొదట ఒక వ్యక్తి కోసం వ్రాయబడతాయి మరియు రెండవది యంత్రం ద్వారా విశ్లేషించబడతాయి. ఉదాహరణ రెసిపీలలోని అరబిక్ step టెక్స్ట్ స్త్రీలింగ ఆజ్ఞాదేశాన్ని (قطّعي، سخّني) ఉపయోగిస్తుంది, ఇది సాధారణ ఈజిప్షియన్ వంటల పుస్తక సంప్రదాయం; ఇది ఒక ఉద్దేశపూర్వక ఎంపిక, పొరపాటు కాదు, మరియు ప్రచురణకర్త దీనికి బదులుగా లింగ-తటస్థ కర్మణి (تُقطَّع البصلة)ని ఉపయోగించవచ్చు. `op`, `params` మరియు `until` ఫీల్డ్‌లు అర్థాన్ని మోసుకెళ్తాయి; ఆ వాక్యం వంట చేసే వ్యక్తి కోసం.

## 7. ఇది ఎందుకు భవిష్యత్తుకు అనుగుణంగా ఉంటుంది

- రెసిపీలు **food outcomes and constraints, not motions** ను వివరిస్తాయి. కొత్త రోబోలు మరియు కొత్త AI ఒకే R3 నుండి మెరుగైన R4 ప్లాన్‌లను ఉత్పత్తి చేస్తాయి.
- అన్ని కొత్త సెక్షన్‌లు **optional and additive**. ఒక V0 రెసిపీ (R1 మాత్రమే) ఇప్పటికీ గైడెడ్ హ్యూమన్ కుకింగ్ కోసం పనిచేస్తుంది; జోడించబడిన ప్రతి లేయర్ మరింత ఆటోమేషన్‌ను అన్‌లాక్ చేస్తుంది.
- తెలియని `x-` ఫీల్డ్‌లు పాస్ అవుతాయి. వెండర్లు, చెఫ్‌లు మరియు హెల్త్ బాడీలు ఎవరికీ ఇబ్బంది కలగకుండా రెసిపీలను విస్తరించవచ్చు.
- **Acceptance checks** ఏ ఎగ్జిక్యూటర్ అయినా, హ్యూమన్ లేదా రోబోట్ అయినా, వంటకం సరిగ్గా వచ్చిందని నిరూపించడానికి అనుమతిస్తాయి, దీని ద్వారానే రెసిపీలు ఫీల్డ్ ఎవిడెన్స్‌తో V3 కి చేరుకుంటాయి.

