<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# మేము ప్రచురించిన Critiques

మేము Cookwala గురించి కఠినమైన ప్రశ్నలు అడిగాము మరియు సమాధానాలను రాసి ఉంచాము. ప్రతి ఆందోళన యొక్క id [action plan's concern register](ACTION-PLAN.md#2-concern-register)లో, మా ప్రతిస్పందన మరియు దాని status తో పాటు ఉంది. బయటి నుండి వచ్చే సమీక్షలు స్వాగతించబడతాయి మరియు ఇక్కడ జాబితా చేయబడతాయి.

## ఇది పని చేస్తుందా? (strategy)

| ఆందోళన | క్లుప్త సమాధానం | Status |
|---|---|---|
| మార్కెట్ ఇంకా లేదు; spec ఉత్పత్తుల కంటే ముందే ఉంది | Small Core, మొదట demo, వినియోగదారులు లేకుండా కొత్త spec లేదు | Core 0.2 పూర్తయింది; device demo next |
| శక్తివంతమైన వారు ఎవరూ దీనిని స్వీకరించడానికి కారణం లేదు | ప్రతి adopter యొక్క లాభంతో ముందుండి నడిపించడం; రోబోలు లేకుండానే ఉపయోగకరం | Food-bank pilot మరియు device partner కోసం అన్వేషణ జరుగుతోంది |
| simulators అవి assume చేసే వాటిని నిరూపిస్తాయి | Fair baseline, ranges, "illustrative" labels; pilots వాటిని భర్తీ చేస్తాయి | Open |
| ఆకలి అనేది పేదరికం మరియు సంఘర్షణకు సంబంధించినది, surplus కి కాదు | Cookwala సహకరిస్తుంది; ఇది ఒంటరిగా ఆకలిని అంతం చేస్తామని క్లెయిమ్ చేయదు | Message changed |
| Safety, liability మరియు attack surface | device పై పరిమితులు అమలు చేయబడతాయి; refusal; recalls; incident reports | Spec పూర్తయింది; certifier review open |
| Privacy (health మరియు religion data, ledgers vs erasure) | Local-first, selective disclosure, hash-only logs, consent | Spec పూర్తయింది; impact assessment open |
| చాలా సంక్లిష్టంగా ఉంది | Core 0.2; మిగిలినవన్నీ experimental గా గుర్తించబడ్డాయి | Done |
| Founder dependency | ఒక neutral home కి governance path | GOVERNANCE.md |

## సాంకేతిక రూపకల్పన సరైనదేనా?

| ఆందోళన | Core 0.2 లో ఏమి మారింది |
|---|---|
| Operations కి భౌతిక అర్థం లేదు | Envelopes, heat levels, sensor ladders, altitude rule, test vectors |
| Unit మరియు number బగ్‌లు | °C మాత్రమే, absolute tolerances, kitchen units, densities, decimal money |
| Schemas టైపోలను అంగీకరించాయి | `x-` extensions తో strict schemas; offline bundle |
| ఒకే ఒక mutable Mission document | Event log + projection, single sequencer, transitions table |
| Ledger తక్కువ సమాచారాన్ని అందించింది | Revocation తో Key records, witnessed checkpoints, rewrite detection |
| Undefined event delivery; bus పై safety | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces drift | Core OpenAPI; ప్రతి reference CI లో తనిఖీ చేయబడింది |
| No verifier | Reference library మరియు 106 conformance vectors |

## మేము కోరుతున్న రివ్యూలు

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), food scientists
(envelopes), food-safety officers and dietitians (rule packs), a security audit, a
data-protection review, and a certifier's gap analysis. చూడండి [external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

