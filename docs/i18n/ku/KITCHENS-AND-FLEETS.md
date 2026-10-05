<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Metengah û rêberên hilberînê: metengahên restoranan, civakî, dibistanê, karesatê û robotan

> **Rewşa: profîla eksperîmental** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Mînak: `examples/fleet/`.

## 1. Çima

Damekarîger xwest protokolê heman bi navê di restoranekê, dawetekê, kampanyeke belavkirina xwarinê an jî fabrika xwarinê de (RFC-0005) bikar bîne. Kurteya di dema xwarinên dibistanê û metrizên karesatê de zêde dike. Core yek amûrê ku rêçeke xwarinê çêdike dike; Humanitarian Profile veguhastina surplus û hejmartin xwarinan dike. Di navbera wan de **kitchen** heye: stasyon, amûr, mirov, gelek batch, demeke xizmetê, xalên kontrola krîtîk, û girêdan ji execution log ê amûrê heta xwarinên ku program rapor dike.

## 2. Dokumên

| Belge | Çi dibêje |
|---|---|
| `Kitchen` | Metbaxa saziyekê: cure, stasyon (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), amûr wek referansên şiyanebûnê, kapasîte di xwarinên bi saetê de, amûrên hot-hold û cooling, rule packên di hêla de, **hejmara** xebatkaran li gorî rola wan, saetên xebatê |
| `ProductionRun` | Reseteyên bi hejmara batch û xizmetan, demeke xizmetê, erandin ji bo her gavê ji bo stasyonekê û ji bo `device`ekî, `person`ekî an jî her duyan, tîpên qeyda xalên kontrola krîtîk (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), Core executionên hatine hilberandin, û encamek (xwarinên hatine hilberandin û xizmetkirin, çop, xwarina hatî rizgarkirin bikaranîn, têkçûn, bûyer, enerjî, cost, Humanitarian `Distribution` ku derketî) |
| `StationLease` | Bikaranîna ekskluzîf a stasyonekê ji aliyê `device`ekî an rolekê ve ji bo demeke diyar |

## 3. Çawa bi padîvan re girêdayî ye

- Gavek ku ji `device` re hatî diyarkirin, `ExecuteRequest` (an jî armanceke `ExecuteNode` bi rêya ROS 2 binding) e; hashê `ExecutionLog` wê di `executions` de diçe.
- Xebat (run) ku xizmetê dide bernameyekê, `Distribution` Humanitarian radest dike; `ccps` yên xebatê, delîlên li pişt dîtinên ewlehiya radestkirinê ne.
- Rule packên ji Profile Humanitarian ve, li ser menû û tiştên xebatê (run) hatine sepandin.
- Şandina fleetê (kîjan robot biçe ku derê) aîdî Open-RMF an birêveberê fleetê yê firodekar e, ne ji vê profile re ye.

## 4. Mînak a çêkirî

`examples/fleet/kitchen-disaster.json` û `production-run-disaster.json`: metbexeke alîkariyê
bi du ketelên gazê, yekeyên germkirinê (hot-hold units) û banyoeke berfê 710 xwarinên supêya mercîmekê û
birinc ji bo demeke du saatiyan berheman dike, germiya çêkirinê û germkirinê (hot-hold) qeyd dike, yekeya germkirinê ya
di bin 60 °C de dibîne û wê qonçika wê berî xizmetkirinê ji nû ve germ dike, û belavkirinek dişkîne. Mînak
nîşandî ye; tu metbex an bûyereke rast nayê vegotin.

## 5. Çi bi qest bi destpêkirî hatiye derxistin

Navên karmendan û bername, mişan, zamówên mişteriyan û dravdan, bihayê meniyê. Karmendan wekî hejmar li gorî rola xwe xuya dibin da ku biha perê dikaribe bê hesibandin bêyî ku kesek were nasîn.

## 6. Paşê

Mînakê xizmeta restoranê bi stasyoneke robotî; pakêta conformance ji bo makîneya rewşa dry run; yekkirina `StationLease` bi leasên session re (`session.schema.json`).

