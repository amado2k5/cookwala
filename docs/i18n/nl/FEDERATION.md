<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Federatie: hoe Cookwala werkt zonder centrum

**Status:** concept, 2026-10-04 (RFC-0006). De foto van de oprichter was een bijenkorf: geen centraal
commando, toch harmonie en herstel. Deze pagina legt uit wat dat in de praktijk betekent.

## 1. Nodes

| Node | Wat het dient | Wie beheert er een |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | een receptenuitgever, een food-bank netwerk, een universiteit, een apparaatfabrikant, cookwala.ai |
| **Registry** | `/v1/registry.json`: pointers naar catalogs, collections, devices, packs, benchmarks | iedereen; cookwala.ai beheert er een |
| **Hub** | de Core API voor een keuken, lokale veiligheidslimieten, de household context | elke keuken; werkt offline |
| **Mirror** | republiceert ongewijzigde, ondertekende items van andere nodes | iedereen die veerkracht wil in hun regio |

Een statische map is een geldige catalogus. Een telefoon met de CSV templates is een geldige humanitaire
deelnemer op niveau H0.

## 2. Feeds, geen commando's

Nodes publiceren ondertekende feeds: recalls, anonieme incidenten, registry wijzigingen, belangrijke records.
Andere nodes pollen wat zij vertrouwen en kunnen dit herpubliceren. Niets wordt naar een keuken gepusht; een
keuken pullt wanneer deze online is en blijft werken wanneer deze dat niet is.

## 3. Verifieer tegen de uitgever, nooit tegen de relay

Een recall die via een mirror binnenkomt, is slechts zo goed als de handtekening van de **issuer**. Een hub
lost de `KeyRecord` van de issuer op uit het eigen discovery document van de issuer of did:web en
verifieert de body byte voor byte. De key van de mirror bewijst niets over de inhoud; een mirror
die een recall bewerkt, verbreekt de handtekening. Profile vectors in `conformance/profiles/federation.json`
tonen de drie gevallen.

## 4. Vertrouwenslijsten

Elk hub houdt een lijst bij van catalogi en registries die het vertrouwt, met hun keys en een prioriteit. Een node kan peers (`federation.peers`) voorstellen; het hub beslist. cookwala.ai is één vermelding op een dergelijke lijst, geen root.

## 5. Versheid

Registry-items bevatten een status en een publicatietijd; recalls bevatten een uitgiftetijd; household facets bevatten een geldigheid. Verouderde items worden opnieuw opgehaald of verwijderd. Niets wordt vertrouwd omdat het oud is, niets wordt stilzwijgend verwijderd: ingetrokken entries blijven als tombstones bestaan.

## 6. Geschiedenis

Event logs met getuigenis-checkpoints (Core sectie 5) maken herschrijvingen detecteerbaar zonder een
blockchain: een tweede partij ondertekent de kop van het logboek, en een later rewrite komt niet
meer overeen. Publieke verankering van checkpoint-koppen is optioneel en is een besluit van de oprichters
(`docs/research/BACKSTORY.md` sectie 4.7).

## 7. Drie knooppunten die interopereren

- **Een food-bank netwerk** beheert een registry van zijn keukens en donoren, een catalogus van zijn rule packs aangepast aan de nationale wetgeving, en een SMS-gateway. Het vermeldt zichzelf in de cookwala.ai directory of niet; de gegevens hoeven nooit het land te verlaten.
- **Een apparaatfabrikant** beheert een catalogus van zijn capability documents en safety-limit packs, publiceert conformance rapporten, en raadpleegt de recall feeds van de catalogi die zijn klanten gebruiken.
- **Een universitair lab** beheert een catalogus van benchmark recepten en execution logs (met toestemming), spiegelt de vocabularies, en publiceert zijn eigen vectoren.

Geen van hen heeft cookwala.ai nodig om online te zijn.

## 8. Wat niet is gebouwd

Een centrale orchestrator, een centrale identity provider, een token, een blockchain. De quorumbeslissingen en orchestrators van het Mission-profiel blijven optioneel en experimenteel.

