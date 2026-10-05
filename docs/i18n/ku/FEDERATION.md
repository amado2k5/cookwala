<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federasyon: Cookwala bê navendî çawa kar dike

**Status:** draft, 2026-10-04 (RFC-0006). Wêneyê damezirîner qîsê mêş bû: ne komanda navendî, lê dîsa jî hengaarmonî û veger. Ev rûpel dibêje ka ew di pratîkê de çi tê wateyê.

## 1. Nodên

| Node | Çi xizmetê dide | Kîjan kes dimeşîne |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | weşêderê recipe, tora food-bank, zanîngeh, çêkerê amûr, cookwala.ai |
| **Registry** | `/v1/registry.json`: pointer bo catalog, collections, devices, packs, benchmarks | her kes; cookwala.ai yek dimeşîne |
| **Hub** | Core API bo metînê, sînorên ewlehiya herêmî, household context | her metîn; bi awayê offline kar dike |
| **Mirror** | tiştên îmzekirî yên nodeyên din bê guhertin vedisaniyîne | her kesê ku dixwaze di herêma xwe de resilience hebe |

Foldera statîk katalogek vala ye. Telefonek bi şablonên CSV re beşdarê mirovî yê vala ye li asta H0.

## 2. Xurak, ne fermand

## 2. Xurak, ne fermand

Node-an xwarinên îmzekirî weş dikin: recalls, bûyerên bênav û bênavan, guhertinên registry, rekorên sereke.
Node-ên din tiştên ku bawerî dikin pol dikin û dikarin wan dubare weşikin. Tişt ne tê xistine nav metebexekê; metebexek dema ku onlayn be daxwaz dike û dema ku onlayn nebe jî kar dike.

## 3. Li dijî derhêner bipirsin, tu carî ne li dijî veguhestî

A `recall` ku bi rêya aynayê (mirror) tê, tenê ew qas baş e ku îmzeyê **derxêner** (issuer) hebe. `hub`ek `KeyRecord`ê derxêner ji belgeya dîtina derxêner an jî `did:web` çareser dike û laş (body) byte bi byte piştrast dike. Pirsê aynayê (mirror) tiştekî li ser naverokê îsbat nake; aynayek ku `recall`ekê redakte dike, îmzeyê têk dide. Vektorên profile di `conformance/profiles/federation.json` de sê rewşan nîşan didin.

## 4. Lîsteyên baweriyê

Her hub lîsteyek katalog û registryyên ku bawerî pê dike diparêze, bi kuncên wan û sererastiyekê re. Node dikare hevalên xwe pêşniyar bike (`federation.peers`); hub biryarê dide. cookwala.ai di lîsteyek wisa de yek ji navçeyan e, ne rûyek e.

## 5. Tevazewî

Navên registry status û demeke weşandinê digirin; recall demeke derketinê digirin; facetên household validîteke digirin. Tiştên kevin dîsa tên hildan an jî tên jêbirin. Tişt ne ji ber ku kevin e tê bawer kirin, tişt bi bêdengî nayê jêbirin: navên ku hatine vekişandin wek tombstones dimînin.

## 6. Dîrok

Logên bûyeran bi xalên kontrolkirinê yên şahidîkirî (Beşa Core 5) dikin ku dinivîsandinên nû bêne tespîtkirin bêyî blockchain: aliyekî duyem serê logê îmze dike, û dinivîsînek nû ya `later` êdî bi ser nehatiye. Çakirinav (anchoring) ya giştî ya serê xalên kontrolkirinê vebijark e û biryara damezeran e (`docs/research/BACKSTORY.md` beşa 4.7).

## 7. Sê nodên ku bi hev re kar dikin

- **Torrekeya food bank** dîrokeke registry ya metborxên û donorkerên xwe, kataloga rule packên xwe yên li gorî qanûna neteweyî hatine guncandin, û gatewayeke SMS birêve dibe. Ew xwe di directory ya cookwala.ai de diyar dike an na; daneyên wê qet divê ji welatê xwe dernekevin.
- **Çêkerê amîrkanî** kataloga belgeyên şiyana xwe û packên sînorên ewlehiyê birêve dibe, raporên conformance yên xwe vediguhêze, û feedên recall yên katalogên ku mişteriyên wê bikar tînin lêkolîn dike.
- **Laboratûreya zanîngehê** kataloka reseptên benchmark û execution log (bi razîkirin) birêve dibe, ferhenga peyvan nîşan dide, û vektora xwe vediguhêze.

Tu ji wan re naxwazî cookwala.ai bixebite.

## 8. Çi ne hatî avakirin

Orkestratorek navendî, pêşkêşkarê nasnameya navendî, token, blockchain. Biryarên quorum ên profîla Mission û orkestrator nabe ku ne vebijarkî û hesînekî bin.

