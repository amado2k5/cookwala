<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# వంటశాలలు మరియు ఉత్పత్తి రన్‌లు: రెస్టారెంట్లు, కమ్యూనిటీ, స్కూల్, డిజాస్టర్ మరియు రోబోట్ కిచెన్‌లు

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Examples: `examples/fleet/`.

## 1. ఎందుకు

స్థాపకుడు ఒక రెస్టారెంట్, వివాహం, విరాళాల సేకరణ లేదా ఒక food factory (RFC-0005) లో కూడా అదే ప్రోటోకాల్ కావాలని కోరారు. ఈ బ్రీఫ్ school-meal programs మరియు disaster kitchensలను కూడా జోడిస్తుంది. Core అనేది ఒక పరికరం ఒక రెసిపీని వండడాన్ని కవర్ చేస్తుంది; Humanitarian Profile అనేది surplus ని తరలించడం మరియు meals ని లెక్కించడాన్ని కవర్ చేస్తుంది. వాటి మధ్య **kitchen** ఉంటుంది: stations, devices, people, అనేక batches, ఒక serve window, critical control points, మరియు ఒక device యొక్క execution log నుండి ఒక program రిపోర్ట్ చేసే meals కి మధ్య ఉన్న లింక్.

## 2. పత్రాలు

| పత్రం (Document) | ఇది ఏమి చెబుతుంది (What it says) |
|---|---|
| `Kitchen` | ఒక సంస్థ యొక్క కిచెన్: రకం, స్టేషన్లు (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), సామర్థ్య రిఫరెన్స్‌లుగా పరికరాలు, గంటకు భోజనాల సంఖ్యలో సామర్థ్యం, hot-hold మరియు cooling పరికరాలు, అమలులో ఉన్న rule packs, పాత్రల వారీగా సిబ్బంది **counts**, పని గంటలు |
| `ProductionRun` | బ్యాచ్ కౌంట్లు మరియు సర్వింగ్‌లతో కూడిన రెసిపీలు, ఒక serve window, ప్రతి రెసిపీ స్టెప్ కోసం ఒక స్టేషన్‌కు మరియు ఒక `device` కి, ఒక `person` కి లేదా రెండింటికీ కేటాయింపులు, క్రిటికల్ కంట్రోల్ పాయింట్ రికార్డులు (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), ఉత్పత్తి చేయబడిన Core executions, మరియు ఒక ఫలితం (ఉత్పత్తి చేయబడిన మరియు సర్వ్ చేయబడిన భోజనాలు, వ్యర్థాలు, ఉపయోగించిన rescued food, వైఫల్యాలు, సంఘటనలు, శక్తి, ఖర్చు, అది విడుదల చేసిన Humanitarian `Distribution`) |
| `StationLease` | ఒక నిర్ణీత సమయం కోసం ఒక పరికరం లేదా ఒక పాత్ర ద్వారా ఒక స్టేషన్‌ను ప్రత్యేకంగా ఉపయోగించడం |

## 3. ఇది మిగిలిన వాటితో ఎలా చేరుతుంది

- ఒక `device` కి కేటాయించబడిన ఒక step అనేది Core `ExecuteRequest` (లేదా ROS 2 binding ద్వారా ఒక `ExecuteNode` goal); దాని `ExecutionLog` hash `executions` లోకి వెళ్తుంది.
- ఒక program కి సేవ చేసే run ఒక Humanitarian `Distribution` ను విడుదల చేస్తుంది; ఆ run యొక్క `ccps` లు distribution యొక్క safety findings వెనుక ఉన్న evidence.
- Humanitarian Profile నుండి వచ్చే rule packs లు run యొక్క menu మరియు items కి వర్తిస్తాయి.
- Fleet dispatch (ఏ రోబోట్ ఎక్కడికి వెళ్లాలి) అనేది Open-RMF కి లేదా ఒక vendor యొక్క fleet manager కి చెందుతుంది, ఈ profile కి కాదు.

## 4. సాధన చేసిన ఉదాహరణ

`examples/fleet/kitchen-disaster.json` మరియు `production-run-disaster.json`: రెండు గ్యాస్ కెటిల్స్, హాట్-హోల్డ్ యూనిట్లు మరియు ఒక ఐస్ బాత్ ఉన్న ఒక రిలీఫ్ కిచెన్ రెండు గంటల విండోలో 710 పప్పు సూప్ మరియు రైస్ భోజనాలను ఉత్పత్తి చేస్తుంది, వంట మరియు హాట్-హోల్డ్ ఉష్ణోగ్రతలను రికార్డ్ చేస్తుంది, 60 °C కంటే తక్కువగా ఉన్న ఒక హాట్-హోల్డ్ యూనిట్‌ను కనుగొని సర్వ్ చేయడానికి ముందు ఆ బ్యాచ్‌ను తిరిగి వేడి చేస్తుంది, మరియు ఒక డిస్ట్రిబ్యూషన్‌ను విడుదల చేస్తుంది. ఈ ఉదాహరణ వివరణాత్మకమైనది; ఎటువంటి నిజమైన కిచెన్ లేదా ఈవెంట్ వివరించబడలేదు.

## 5. కావాలని వదిలివేయబడినవి ఏమిటి

సిబ్బంది పేర్లు మరియు షెడ్యూల్‌లు, వేతనాలు, కస్టమర్ ఆర్డర్‌లు మరియు చెల్లింపులు, మెనూ ధరలు. ఎవరినీ గుర్తించకుండా భోజనం ఖర్చును లెక్కించడానికి వీలుగా సిబ్బంది పాత్రల వారీగా సంఖ్యలుగా కనిపిస్తారు.

## 6. Next

రోబోట్ స్టేషన్‌తో రెస్టారెంట్ సర్వీస్ ఉదాహరణ; రన్ స్టేట్ మెషీన్ కోసం ఒక conformance సూట్; `StationLease` ను సెషన్ లీజులతో (`session.schema.json`) ఏకీకరణ.

