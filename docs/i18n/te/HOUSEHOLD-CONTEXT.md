<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: the whole picture stays home

> **Status: draft profile** (RFC-0001). Cookwala Core లో భాగం కాదు. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. ఎందుకు

ఒక కుటుంబానికి చక్కగా సేవ చేసే రోబోకు చాలా విషయాలు తెలియాలి: ఉపకరణాలు మరియు వాటి వింతలు, అక్కడ ఎవరు నివసిస్తున్నారు మరియు వారు ఎప్పుడు ఇంట్లో ఉంటారు, పెంపుడు జంతువులు, పిల్లలు, ఆహారపు అలవాట్లు, అలర్జీలు, మందులు తీసుకునే సమయం, ఆచారాలు, బడ్జెట్, షాపింగ్ అలవాట్లు, గతంలో ఏమి తప్పు జరిగింది. ఇదే వాస్తవాలు దొంగతనం ప్రణాళిక మరియు ప్రొఫైలింగ్ సాధనం కూడా. ఈ ప్రొఫైల్ **planner at home** కు పూర్తి చిత్రాన్ని ఇస్తుంది మరియు మిగిలిన అందరికీ కేవలం ఒక **constraint** మాత్రమే ఇస్తుంది.

## 2. మూడు ఆలోచనలు

1. **Facets.** ప్రతి ఒక్కటి ఒక టైప్ చేయబడిన వాస్తవం (`cw.facet.household.health.allergies`), దానిని ఎవరు
   నిర్ధారించారు (declared, observed, reported, inferred), ఎప్పుడు, ఎంత కాలం, ఎంత నమ్మకంతో,
   మరియు ఒక ప్రైవసీ క్లాస్ (`public`, `household`, `sensitive`, `secret`).
2. **registry లోని Travel rules.** ప్రతి facet రకం దాని ముడి విలువ (raw value) ఇంటి నుండి బయటకు వెళ్లవచ్చా లేదా అని చెబుతుంది: `never` (45 రకాలు: children, absences, layouts, health conditions, religion,
   behaviour, incidents, income posture), కేవలం ఒక `derived` constraint గా మాత్రమే (81 రకాలు), లేదా ఒక స్పష్టమైన అనుమతి తర్వాత `consented` disclosure గా (13 రకాలు, ఎక్కువగా device self-state కోసం maker కి).
3. **Derived constraints.** ఒక కిరాణా కొట్టు వ్యక్తి, ప్లానర్, డెలివరీ సర్వీస్,
   device maker లేదా మరొక రోబోట్ ఎప్పుడూ అందుకునే ఏకైక household object: "deliver 17:00–18:00 to the front door",
   "block peanuts", "no robot movement in the hallway 15:00–15:30", "budget cap 18.00 USD per
   meal". ప్రతిదీ అది ఏ facet **types** నుండి వచ్చిందో పేరు చెబుతుంది, వాటి విలువలను (values) ఎప్పుడూ చెప్పదు.

## 3. ఎవరికి ఏమి లభిస్తుంది

| గ్రహీత పాత్ర (Recipient role) | పొందవచ్చు (May receive) |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (AI లేదా భోజనాన్ని ప్లాన్ చేసే సాఫ్ట్‌వేర్) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | device fault summary only (counts of faults by category, no times, no household facts), మరియు household ఒక insurer ను గ్రహీతగా పేరు పెట్టినప్పుడు మాత్రమే; RFC-0001 దీనిని privacy review అభ్యంతరం తెలిపితే తొలగించబడే అవకాశం ఉన్న పాత్రగా జాబితా చేస్తుంది |
| program (food bank, school) | ఏమీ లేదు |
| dataset | ఏమీ లేదు |

## 4. Rules

- Raw facets ఎప్పుడూ పరికరం నుండి బయటకు వెళ్ళవు. హోమ్ నెట్‌వర్క్ వెలుపల ఎవరికీ వాటిని తిరిగి ఇచ్చే API ఏదీ లేదు.
- `inferred` facets ఎప్పుడూ భద్రతా నిర్ణయాల కోసం ఉపయోగించబడవు.
- ఏ వ్యక్తి యొక్క ప్రవర్తనా స్కోరు (behavioural score) కూడా ఉత్పత్తి చేయబడదు లేదా నిల్వ చేయబడదు. ప్రవర్తనా facets (Behaviour facets) గృహ అవసరాల కోసం (portion sizes, ఎప్పుడు క్లియర్ చేయాలి) మాత్రమే ఉంటాయి మరియు ఎప్పుడూ ప్రయాణించవు.
- ఆర్థిక స్థాయి (Economic level) అనేది ఒక **owner-set budget posture**, ఇది దేని నుండి కూడా inferred చేయబడదు.
- పిల్లల డేటా మరియు గైర్హాజరు `secret` మరియు ఎప్పుడూ ప్రయాణించవు, అవి derived అయినప్పటికీ, కదలికలు మరియు safe-zone constraints గా తప్ప, ఇవి ఎటువంటి షెడ్యూల్‌ను వెల్లడించవు.
- ప్రతి facet తొలగించదగినది (erasable). తొలగింపు గృహాల యొక్క విండోలో (డిఫాల్ట్ 7 రోజులు, గరిష్టంగా 30) పూర్తవుతుంది మరియు కంటెంట్ లేకుండా లాగ్ చేయబడుతుంది.
- ఒక privacy class ని registry డిఫాల్ట్ కంటే ఎక్కువగా పెంచవచ్చు, ఎప్పుడూ తగ్గించబడదు.

## 5. స్థానిక ఇన్సిడెంట్ మెమరీ

RFC-0001 అలారమ్‌లు, సంఘర్షణలు, వదులుకోవడం మరియు పాఠాల గురించి రోబోట్ ఏమి గుర్తుంచుకుంటుందో అడుగుతుంది. `LocalIncident` దానిని కలిగి ఉంటుంది: తేదీ, `vocab/incidents.json` నుండి వర్గం, రకాన్ని బట్టి ఎవరు పాల్గొన్నారు, ఒక నోట్ మరియు ఒక పాఠం. ఇది ఎప్పుడూ ఇంటిని దాటదు. Core లోని పబ్లిక్, అనామక `IncidentReport` అనేది ప్రతి మేకర్ నేర్చుకునే ఒక భిన్నమైన పత్రం.

## 6. Conformance

ప్రొఫైల్ వెక్టర్స్ (`conformance/profiles/disclosure_policy.json`) facets మరియు ఒక రిసిపియంట్ రోల్ (recipient role) ను ఇస్తాయి మరియు ఖచ్చితమైన constraint types, disclosed ids మరియు కారణాలతో కూడిన withheld ids లను ఆశిస్తాయి. రెఫరెన్స్ ఇంప్లిమెంటేషన్ అనేది `tools/cookwala_ref.py` లోని `derive_constraints()`.

## 7. ఇతర పత్రాలతో సంబంధం

`ClientProfile`, `KitchenProfile` మరియు `RobotProfile` (`profile.schema.json`) అనుకూలమైన బండిల్స్‌గా (bundles) ఉంటాయి. మిషన్ facets (`mission.schema.json`) అదే registry idsలను ఉపయోగిస్తాయి. Core `AgentMandate` ఒక ఏజెంట్ ఏమి చేయవచ్చో తెలిపే normatve statement గా ఉంటుంది; mandate facets గృహ సందర్భాన్ని (household context) స్థానికంగా వివరిస్తాయి.

## 8. బహిరంగ ప్రశ్నలు

RFC-0001 చూడండి: closed recipient roles; raise-only privacy; ఒక రివ్యూవర్‌తో data-protection impact assessment.

