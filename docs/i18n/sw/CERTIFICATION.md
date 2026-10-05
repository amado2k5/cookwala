<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->

# Conformance na njia ya certification

**Status:** draft, 2026-10-04 (RFC-0008). Hakuna mhakiki aliyekuwa amehusishwa bado; huu ndio njia
ambayo kiwango kinatoa.

## 1. Hatua tatu

| Hatua | Nani | Inamaanisha nini | Inaonyeshwa kama |
|---|---|---|---|
| **Self-declared** | Mtengenezaji au mchapishaji | Alitekeleza `public vectors` kwa kutumia `public tool` na kuchapisha `ConformanceReport` (`schemas/conformance.schema.json`), akiwa ametiwa saini kwa funguo yake yenyewe | ripoti, ikiwa na `suites` na `counts`; kamwe siyo `badge` |
| **Verified** | Opereta wa `registry` | Alirudia `run` dhidi ya `hash` ya seti ya `vector` ileile na kutia saini ripoti hiyo | ripoti pamoja na `verifier` |
| **Certified** | Mthibitishaji huru (hakuna anayepatikana leo) | Alitekeleza `suite` pamoja na ukaguzi wa `hardware` na `safety-case` chini ya `scheme` iliyochapishwa na kutoa alama | ripoti, mthibitishaji, alama |

Ripoti inayofeli vektor yoyote ya darasa inaweza isiidai darasa hilo. registry inaonyesha
ripoti, siyo badge.

Leo mwendeshaji pekee wa registry ni mtunza maelezo ya kiufundi (cookwala.ai), kwa hivyo "verified" haiongezi
uhuru wowote hadi registry ya pili ipatikane; hali bado inaonyeshwa kama self-verification.

## 2. Ripoti inajumuisha nini

Toleo kuu, darasa lililodaiwa (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) au dai la wasifu (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), mada (bidhaa, muuzaji, toleo), seti zilizotekelezwa pamoja na jumla na
id za vekta zilizofeli, hash ya seti ya vekta, zana na commit, tarehe, hali na
mthibitishaji. Mfano: `examples/conformance/report-reference.json`, iliyotengenezwa na

```bash
python tools/run_conformance.py --report report.json
```

## 3. Madarasa na kile yanayothibitisha

| Daraja | Vektori | Pia inahitajika kwa ajili ya certification (haikufunikwi na vektori) |
|---|---|---|
| Mchapishaji wa mapishi | hash, envelope (malengo ndani ya bandi), units | mapitio ya maudhui ya mapishi na mtaalamu wa usalama wa chakula |
| Mtendaji | envelope, sensor ladder, mabadiliko ya utekelezaji, sababu za refusal before heat | kesi ya usalama ya kifaa chenyewe (ISO 13482, IEC 60335, UL 3300 kama inavyofaa); latency ya kusimama kwa ndani measured; mipaka ya usalama inayosimamiwa bila mtandao |
| Katalogi | hash, sahihi, ubatilishaji wa funguo, recalls | utunzaji wa funguo na mchakato wa upokeaji wa matukio |
| Wakala | maandishi yasiyoaminika, upeo wa mandate (agent-safety benchmark) | matokeo yaliyochapishwa kwa kila model pamoja na mbinu |
| Mthibitishaji | seti zote za Core | hakuna |
| Humanitarian H0–H3 | sarufi ya SMS, mashine ya hali, rule packs | mapitio ya uwajibikaji wa data; hakuna ukaguzi wa data binafsi |
| Kaya | sera ya ufunuo | tathmini ya athari za ulinzi wa data |
| Registry | sheria za jina na toleo, tombstones | mchakato wa uthibitisho wa namespace |

## 4. Kile certification haiwezi kuahidi

Ripoti ya conformance inathibitisha kwamba programu ilitenda kama vile vekta zinavyohitaji siku ilipofanya kazi.
Haiidhibiti kwamba kifaa ni salama katika kila jiko, kwamba mapishi yana ladha sahihi, au kwamba
hakuna madhara yanayoweza kutokea. Kiwango ambacho kingeahidi madhara sifuri kingekuwa si la uaminifu; hiki kinaahidi
kwamba mipaka inasimamiwa mahali husika, kwamba refusals hutokea before heat, na kwamba rekodi zinaweza
kukaguliwa.

## 5. Utawala wa alama

Alama ya certification na sheria zake zinahamia kwenye msingi usio na upande ukiwa na alama ya biashara
(`GOVERNANCE.md`). Mpaka wakati huo hakuna alama inayojitokeza; ripoti pekee ndizo zipo.

