<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->

# Zêdebûna çandiniyê û signallên dabînkirinê

> **Rewşa: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Mînak:
> `examples/supply/`. **Gate:** nirxandina qanûna-benterî berî her bikaranîna berhembêrînê
> (`docs/ACTION-PLAN.md`, fikar C7). cookwala.ai îro tu sînyalan weşan nake.

## 1. Du tiştên ku çandekar niha hewcedar in

1. **Rêyek ji bo lîstirkirina zêdehiyê beriya ku bi xişk bibe.** Çarmayî di Profile-ê de donor e:
   `Offer` bi `Item.origin: farm` û `harvestedAt`, an jî bi SMS:

   FARM 120KG TOMATO A BB0411

Banka xwarinê vê dibêje, metboranê çêdike, belavkirin hesabê wê dike. Tu belgeya nû tune,
   tu daneyên kesane tune, tenê rêxistin.
2. **Sînyaleke dadwer ji tiştê ku dê hewce be.** Ew beşê ceribandinê yê jê bo jêrlê ne.

## 2. Sînyalên daxwaz û dabînkirinê

| Belge | Dibêje | Rêz |
|---|---|---|
| `DemandSignal` | Li herêma R, di hefteya ISO W de, metborxî û bername hatine plankirin ku di navbera L û H kg de bûn ji **tevegêra** C ya hêvikê | herî kêm 20 çavkaniyên beşdar; herî kêm 7 rojan piştî dawîbûna hefteyê hatine weşandin; asta tevegêrê (legume, leafy vegetable, poultry), qet ne berhem an markeyek; **ne biçem**; herêma ne hîn piçûktir ji admin1 mejî 100 çavkanî an bêtir |
| `SupplySignal` | Li herêma R, di hefteya W de, tevegêra C di rewşa zêde, normal an kêmiya hilberînê de ye, bi demeke biçînê re | ji aliyê kooperatîf, bername an operaterê bazirganiyê ve hatî weşandin; **ji bo her kesî vekirî**: giştî, belaş, ji bo her xwendevan wekhev |

Kontrola referansê `check_signal()` e di `tools/cookwala_ref.py` de; vektorên profilê (`conformance/profiles/signal.json`) nîşan didin ka çi tê qebûlkirin û çi tê redkirin.

## 3. Çima ev rêz

## 3. Çima ev rêz

Parvekirina pêşbîniyan di navbera rûberûberbûyan de ew danûstandina agahiyan e ku otora rûberûberbûnê hişyarî didin. Komkirin, paşxistink, asta klasê, bêyî bihayan û weşandina vekirî, îşaretê ji bo plankirinê bikar dikevin û ji bo koordînata bihayan bêfayde dimîne. Sînorên (thresholds) xalên destpêkê ne; divê şêwir û pisporê îstatîstîkê wan deynin.

## 4. Tiştê ku ruyê ramanê ya damezerê dibe

Lupa makro (RFC-0007): çêkirina plankirî → daxwaziya komkirî →
çandewar û dikan plan dikin ku hewce bin → kêmtir tê çandin, tê veguhestin û tê avêtin. Simîlatörên bajêr, welat û cîhanê mezinahiya bandorê di binفرضkirina wan de nîşan didin (nîşandê, ne pêşbîniyek e). Ev du belge herî piçûk gavên rastgirtî ber bi wê ve ne.

## 5. Paşê

Şîretên çandinê ji daxwaza pêşîn; mezinahiya rezervê (zincîra dabînkirinê ya pir kêm/lean mexisî/fîrî ye); herikîna alîkariyê ya navbera herêman; signallên dabînkirinê bi SMS ji kooperatîvan.

