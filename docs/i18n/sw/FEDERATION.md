<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Shirikisho: jinsi Cookwala inavyofanya kazi bila kituo

**Status:** draft, 2026-10-04 (RFC-0006). Picha ya mwanzilishi ilikuwa kama mzinga wa nyuki: hakuna amri kuu, lakini kuna uwiano na urejesho. Ukurasa huu unasema maana yake katika vitendo.

## 1. Nodes

| Node | Inachochochea | Nani anamiliki |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | mchapishaji wa recipe, mtandao wa food-bank, chuo kikuu, mtengenezaji wa kifaa, cookwala.ai |
| **Registry** | `/v1/registry.json`: viashiria vya catalogs, collections, devices, packs, benchmarks | yeyote; cookwala.ai inamiliki moja |
| **Hub** | Core API kwa jiko, mipaka ya usalama ya ndani, household context | kila jiko; inafanya kazi offline |
| **Mirror** | inachapisha tena vitu vilivyotiwa saini vya node nyingine bila kubadilishwa | yeyote anayetaka uimara katika eneo lake |

Folder ya tuli ni katalog halali. Simu yenye templates za CSV ni mshiriki halali wa kibinadamu katika kiwango cha H0.

## 2. Michocheo, si amri

Nodi huchapisha virudisho vilivyotiwa saini: recalls, matukio yasiyo na majina, mabadiliko ya registry, rekodi muhimu.
Nodi nyingine huchunguza kile zinachokiamini na zinaweza kuchapisha tena. Hakuna kinachosukumwa ndani ya jikoni; jikoni huvuta wakati ikiwa mtandaoni na inaendelea kufanya kazi wakati haipo mtandaoni.

## 3. Thibitisha dhidi ya mtoaji, kamwe mrelay

A recall inayofika kupitia kioo ni nzuri tu kama vile saini ya **mtoaji**. hub
hutatua `KeyRecord` ya mtoaji kutoka kwenye hati yake ya ugunduzi au did:web na
hunhibitisha mwili (body) byte kwa byte. Funguo ya kioo haithibitishi chochote kuhusu maudhui; kioo
kinachohariri recall kinavunja saini. Vector za wasifu katika `conformance/profiles/federation.json`
zinaonyesha kesi tatu.

## 4. Orodha za uaminifu

Kila hub huweka orodha ya katalogi na registry zinazoaminiwa, pamoja na funguo zake na kipaumbele. Node inaweza kupendekeza peers (`federation.peers`); hub huamua. cookwala.ai ni ingizo moja kwenye orodha kama hiyo, si mzizi.

## 5. Uvivu

Ingizo za registry hubeba hali na muda wa uchapishaji; recalls hubeba muda wa toleo; household facets hubeba uhalali. Vitu vilivyopitwa na wakati hurejeshwa au kuondolewa. Hakuna kinachoaminika kwa sababu ni cha zamani, hakuna kinachofutwa kimyakimya: ingizo zilizovutwa zinabaki kama tombstones.

## 6. Historia

Logi za matukio zenye checkpoint zilizoshuhudiwa (Sehemu kuu 5) hufanya marekebisho yaandikwe kwa urahisi bila
blockchain: upande wa pili unatia saini kichwa cha logi, na marekebisho ya later hayalingani tena.
Uunganishaji wa umma wa vichwa vya checkpoint ni hiari na ni uamuzi wa mwanzilishi
(`docs/research/BACKSTORY.md` sehemu 4.7).

## 7. Nodi tatu zinazofanya kazi pamoja

- **Mtandao wa food bank** unaendesha registry ya majiko na wafadhili wake, katalog ya rule pack zake zilizorekebishwa kulingana na sheria ya kitaifa, na SMS gateway. Inajiorodhesha katika cookwala.ai directory au la; data yake haitakiwi kamwe kutoka nchi yake.
- **Mtengenezaji wa kifaa** unaendesha katalog ya nyaraka zake za uwezo na safety-limit packs, huchapisha ripoti za conformance, na huchunguza recall feeds za katalog ambazo wateja wake wanatumia.
- **Maabara ya chuo kikuu** inaendesha katalog ya mapishi ya benchmark na execution logs (kwa ridhaa), huakisi misamiati, na huchapisha vectors zake wenyewe.

Hakuna hata mmoja wao anayehitaji cookwala.ai kuwa mtandaoni.

## 8. Nini hakijajengwa

Mratibu mkuu, mtoa utambulisho mkuu, token, blockchain. Maamuzi ya quorum ya wasifu wa Mission na mratibu hubaki kuwa ya hiari na za majaribio.

