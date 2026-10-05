<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Ukosoaji tuliochapisha

Tuliuliza maswali magumu kuhusu Cookwala na kuandika majibu yake. Kila wasiwasi una id
katika [action plan's concern register](ACTION-PLAN.md#2-concern-register), pamoja na
jibu letu na hali yake. Mapitio kutoka nje yanakaribishwa na yataorodheshwa hapa.

## Je, hii itafanya kazi? (strategy)

| Wasiwasi | Jibu fupi | Hali |
|---|---|---|
| Soko bado halipo; spec iko mbele ya bidhaa | Small Core, demo kwanza, hakuna spec mpya bila watumiaji | Core 0.2 imekamilika; device demo next |
| Hakuna mtu mwenye nguvu aliye na sababu ya kuitumia | Anza na faida ya kila mtumiaji; inafaa bila roboti | Food-bank pilot na mshirika wa device wanatafutwa |
| Simulators zinathibitisha kile zinachochukulia | Baseline ya haki, masafa, lebo za "illustrative"; pilots zinazibadilisha | Open |
| Njaa inahusu umaskini na migogoro, si surplus | Cookwala inachangia; haidai kumaliza njaa peke yake | Ujumbe umebadilishwa |
| Usalama, dhima na attack surface | Mipaka inasimamiwa kwenye device; refusal; recalls; ripoti za matukio | Spec imekamilika; certifier review open |
| Faragha (data za afya na dini, ledgers dhidi ya erasure) | Local-first, ufichuzi wa kuchagua, logs za hash-only, ridhaa | Spec imekamilika; impact assessment open |
| Ni ngumu sana | Core 0.2; kila kitu kingine kimeainishwa kama experimental | Done |
| Utegemezi kwa mwanzilishi | Njia ya governance kuelekea nyumba isiyo na upande | GOVERNANCE.md |

## Je, usanifu wa kiufundi ni thabiti?

| Wasiwasi | Nini kimebadilika katika Core 0.2 |
|---|---|
| Operations hazikuwa na maana ya kifizikia | Envelopes, viwango vya joto, sensor ladders, altitude rule, test vectors |
| Hitilafu za unit na namba | °C pekee, absolute tolerances, kitchen units, densities, decimal money |
| Schemas zilipokea typos | Strict schemas na `x-` extensions; offline bundle |
| Hati moja ya Mission inayoweza kubadilika | Event log + projection, single sequencer, transitions table |
| Ledger ilionyesha kidogo | Key records na revocation, witnessed checkpoints, rewrite detection |
| Uwasilishaji wa event usiojulikana; safety kwenye bus | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces zinabadilika | Core OpenAPI; kila reference inakaguliwa katika CI |
| Hakuna verifier | Reference library na 106 conformance vectors |

## Mapitio tunayoomba

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), wanasayansi wa chakula
(envelopes), maafisa wa usalama wa chakula na wataalamu wa lishe (rule packs), ukaguzi wa usalama,
mapitio ya ulinzi wa data, na uchambuzi wa pengo wa mhakiki. Tazama
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

