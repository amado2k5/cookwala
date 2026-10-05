<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Stakeholders: een bericht, opties, een eerste succes en een flow voor iedereen

**Status:** 2026-10-04. Voor elke groep: waarom Cookwala voor hen belangrijk is, manieren om betrokken te raken van
licht tot diep, een eerste succes in minder dan 15 minuten, het pad daarna, en hoe betrokkenheid
hun werk en de wereld vooruithelpt. Niets hier benoemt een partner, een gebruiker of een pilot die niet
bestaat. Waar iets gepland is, staat next of later.

De drie doelen achter elke rij: helpen honger te beëindigen, mensen gezonder maken, robots aan het werk zetten voor mensen.

---

## 1. Builders: ontwikkelaars, robot- en apparaatfabrikanten, embedded engineers, AI-agent builders, smart-home en platformontwikkelaars, open-source bijdragers

**Bericht.** Robots en apparaten leren bewegen. Niemand heeft opgeschreven, in een vorm die een machine kan controleren, wat "simmer" betekent, wanneer kip veilig is, of wanneer een stap moet worden geweigerd. Cookwala is die laag: recepten die een machine kan plannen, eindcondities die het kan meten, en veiligheidslimieten die het op zichzelf afdwingt. Het is open, royalty-vrij, model-neutraal en device-neutraal, en het wordt geleverd met een conformance suite die u vandaag nog kunt draaien.

**Opties.**
- *Light:* voer de browser dry run uit; lees Core 0.2 (één avond).
- *Medium:* `pip install -e sdk/python`, voer een dry-run uit van de mogelijkheden van je apparaat tegen de
  voorbeeldrecepten, voer de conformance vectoren uit, start de reference hub.
- *Deep:* implementeer de Core API op een apparaat of een hub, publiceer een conformance rapport, voeg
  je apparaat toe aan de directory, stel een RFC voor, schrijf een ROS 2 bridge node, voeg attack cases
  toe aan de agent-safety benchmark.

**Eerste succes (onder 15 minuten).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flow.** Dry run → implementeer de Core API tegen de reference hub → slaag voor conformance →
publiceer het rapport → lijst het apparaat op → toegestane execution logs worden LeRobot datasets en
OpenTelemetry traces.

**Hoe het hun werk vooruithelpt.** Een gedeelde taakdefinitie en succes-test voor koken, met
een publieke benchmark om tegen te meten; recepten in elke keuken zonder ze te schrijven; een
veiligheidsverhaal dat toezichthouders kunnen lezen; conformance-rapporten als verkoopdocument;
first-mover positie in een standaard die wordt beheerd door de implementeerders ervan.

**Hoe het de samenleving vooruithelpt.** Minder keukenbranden en voedselgerelateerde ziekten door machines die
weigeren in plaats van gokken; machines die de keukens van de wereld erven in plaats van slechts enkele.

---

## 2. Bedrijven: startups, ondernemingen, voedselbedrijven, supermarkten en bezorging, restaurants en horeca, verzekeraars, certificeerders, verkoop- en partnershipteams

**Bericht.** Elk bedrijf dat met voedsel te maken heeft, zal in de komende jaren kookmachines en AI-agenten tegenkomen. Cookwala geeft u één interface voor al deze systemen, de enige met veiligheidslimieten die op het apparaat worden afgedwongen en gegevens die u kunt auditeren. Voor supermarkten en bezorgdiensten: ontvang bezorgvensters en allergenenvereisten, nooit het schema van een gezin. Voor verzekeraars en certificeerders: een conformance-rapportformaat en een incidentrapportage-feed die voor u zijn ontworpen.

**Opties.**
- *Light:* lees de Investors and partners pagina en de trust pagina's; map je producten naar
  de ingredient classes en operations.
- *Medium:* publiceer een offer feed (market profile, experimental) of een surplus aanbod aan een
  lokaal programma (Humanitarian Profile); voer de agent-safety benchmark uit op de agent die je
  van plan bent te deployen.
- *Deep:* implementeer de Core API in een product; sponsor een conformance verificatie; word lid van de
  steering committee wanneer deze wordt gevormd; volg het certification pad.

**Eerste succes.** Converteer één productlijn naar een markt `Offer` met GTINs en allergenen-credentials, valideer deze, en zie welke voorbeeldrecepten deze kan leveren.

**Flow.** Bied voeding aan → derived constraints van huishoudens → bestellingen via je eigen checkout → fulfilment events → reputatie van execution reports (met toestemming).

**Hoe het hun werk vooruithelpt.** Toegang tot een neutrale laag in plaats van een dozijn leveranciersintegraties; vraagsignalen (later, na toetsing aan de mededingingswetgeving) die verspilling verminderen; certification die verzekeraars kunnen prijzen; een openbaar verslag van veiligheid.

**Hoe het de samenleving vooruithelpt.** Minder voedselverlies tussen winkel en bord; surplus dat keukens bereikt voordat het rot; machines in huishoudens die niet kunnen worden overgehaald tot onveilige acties.

---

## 3. Aanbieders: supermarkten, boerderijen en coöperaties, bezorging, energie, AI- en modelleveranciers, receptenuitgevers

**Bericht.** Aanbieders sluiten aan bij Cookwala als peers, niet als tenants. Een kruidenier of bezorgdienst krijgt een constraint, nooit de feiten van een huishouden. Een AI-leverancier krijgt een benchmark die laat zien dat zijn model veilig is in een keuken en een MCP server om vandaag te gebruiken. Een receptenuitgever behoudt zijn naam op elk recept en kan een ondertekende catalogus publiceren vanuit een statische map.

**Opties.** Publiceer een catalogus (recepten) · publiceer een aanbodfeed · voer de agent-safety benchmark uit · draai een registry node · bied surplus aan via SMS.

**Eerste succes.** Receptuitgever: `cookwala init my-dish`, bewerk, `cookwala validate`,
`cookwala hash`; je catalogus is een map met `/.well-known/cookwala.json`. AI-leverancier:
voeg de MCP server toe en voer de tien agent-safety cases uit.

**Flow.** Catalog of feed → registry entry onder uw bewezen namespace → recall feed als
er iets misgaat → reputatie van uitkomsten.

**Hoe het hun werk vooruithelpt.** Bereik elk apparaat en elke agent via één formaat;
credit en provenance via handtekening; een veiligheidsbenchmark die een marketingactiva is wanneer
deze eerlijk wordt behaald.

**Hoe het de samenleving vooruithelpt.** Recepten blijven toegeschreven; agenten die handelen voor mensen worden
measured voordat ze worden vertrouwd.

---

## 4. Voedsel: boeren, koks en chefs, thuiskoks, receptmakers, culinaire scholen

**Bericht.** Een recept geschreven voor Cookwala houdt je naam en je keuken levend op elk
apparaat dat het bereidt, met de stappen die een machine nooit mag overslaan opgeschreven. Een boerderij met een
overschot kan het via SMS aanmelden en dezelfde dag nog een keuken bereiken. Een kookschool kan voedselveiligheid
onderwijzen met een formaat dat zichzelf controleert.

**Opties.**
- *Boeren:* `FARM 120KG TOMATO A BB0411` naar de gateway van een programma (waar aanwezig);
  later, lees vraag- en aanbodsignalen.
- *Koks en chefs:* verander een recept dat je uit je hoofd kent in een Cookwala recept; bekijk de
  stapzinnen in jouw taal; later, leg met toestemming sessies vast met credit.
- *Scholen:* gebruik de negen voorbeeldrecepten als casussen voor het onderwijs; voeg je eigen toe.

**Eerste succes.** Koks: `cookwala init`, schrijf één recept met een eindconditie voor elke
warmtestap, valideer het. Boeren: stuur één SMS-aanbod naar een programma dat het profiel draait (geen
draait nog; de parser en vectoren bestaan).

**Flow.** Recept → validatie → catalogus → dry run op apparaten → execution logs laten zien hoe het
presteert op echte machines → revisies met bewijs.

**Hoe het hun werk vooruithelpt.** Toeschrijving die reist; een recept dat kan worden gekookt door machines in andere landen; voor boeren, een manier om een overschot om te zetten in maaltijden in plaats van afval.

**Hoe het de samenleving vooruithelpt.** Culinaire erfenis bewaard als werkende kennis, niet als video;
minder afval bij de boer.

---

## 5. Humanitair: NGO's, food banks, gemeenschapskeukens, schoolmaaltijdprogramma's, hulporganisaties, donoren

**Bericht.** Het Humanitarian Profile verplaatst surplus voedsel naar borden met telefoons en
spreadsheets, registreert cold-chain checks, telt maaltijden en draagt **geen persoonlijke data**. Het
werkt zonder robots, apps of internet. Het geeft u cijfers die u kunt verdedigen: kilogrammen
gered, geserveerde maaltijden, nutrition pass rate, kosten per maaltijd, tijd tot claim, veiligheidsincidenten,
elk met zijn eigen methode.

**Opties.**
- *Light:* lees het profiel en het pilot-protocol; probeer de SMS walkthrough.
- *Medium:* voer de CSV templates uit op één locatie gedurende vier weken (niveau H0) en bereken een
  impact summary.
- *Deep:* een 12-weekse pre-registered pilot met een baseline en een onafhankelijke evaluator;
  pas de rule packs aan op de nationale wetgeving met je food-safety lead; draai je eigen registry
  node.

**Eerste succes.** Vul de drie CSV-templates voor één dag in, voer
`cookwala humanitarian --summary your-folder` uit, lees de `ImpactSummary` met een methode onder
elk nummer.

**Flow.** Aanbod → claim → overdracht met een temperatuurcontrole → distributie → impactoverzicht → gepubliceerde resultaten, wat ze ook laten zien.

**Hoe het hun werk vooruithelpt.** Vergelijkbare cijfers over verschillende locaties; bewijs voor financiers;
veiligheidsbevindingen vóór, niet na, een probleem; een formaat dat de systemen van donoren kunnen lezen (HXL,
GS1, DHIS2 mappings).

**Hoe het de samenleving vooruithelpt.** Meer voedsel dat mensen veilig bereikt, met hun waardigheid intact:
geen namen, geen gezichten, geen profilering.

---

## 6. Gezondheid: diëtisten, voedselveiligheidsfunctionarissen, instanties voor de volksgezondheid, zorginstellingen

**Bericht.** Voedings- en voedselveiligheidsregels als machinecontroleerbare packs, afgeleid van publieke richtlijnen, toegepast op menu's en overdrachten, waarbij uw beoordeling wordt vastgelegd per beroep en uitkomst. Niets is medisch advies; er wordt niets beweerd dat verder gaat dan wat de packs zeggen.

**Opties.** Beoordeel een pack met de template (twee uur) · pas een pack aan nationale rules aan ·
stel care rules voor de mensen die je dient voor · later, lees geaggregeerde uitkomsten van programma's.

**Eerste succes.** Open `profiles/humanitarian/care-vulnerable-groups.rulepack.json` en
het review template; markeer drie regels als approved, changed of rejected; dien de review in.

**Flow.** Concept pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**Hoe het hun werk vooruithelpt.** Uw begeleiding vindt plaats in elke keuken die het adopteert,
inclusief robotkeukens, met uw beroep op de record; een publiceerbare review; een
dataset van bevindingen (geaggregeerd, geen persoonlijke gegevens) voor onderzoek.

**Hoe het de samenleving vooruithelpt.** Minder natrium, suiker en verzadigd vet in maaltijden voor massale distributie; veiliger
warmhouden en koelen; zorg voor kinderen en ouderen ingebouwd in de machine.

---

## 7. Educatie: schoolleraren, opvoeders, professoren, onderzoekers, studenten

**Bericht.** Koken is het meest vertrouwde proces ter wereld, en Cookwala maakt er een
leerobject van: temperaturen, eenheden, eerlijke verdeling, veiligheid, machines die regels volgen. Voor
onderzoekers is het een benchmark, een datasetformaat en een lijst met open problemen.

**Opties.**
- *Docenten:* de leskit (`docs/education/LESSON-KIT.md`): vijf lessen van "wat is een
  simmer" tot "wat een machine nooit zou mogen doen".
- *Professoren en studenten:* de lijst met onderzoeksonderwerpen, de simulators, de conformance
  vectoren als testcondities, de LeRobot export, open problemen op thesis-niveau.
- *Onderzoekers:* publiceer datasets van geautoriseerde executions; bekritiseer de assumptions van de simulators; stel vectoren voor.

**Eerste succes.** Docenten: voer de browser dry run uit in de klas en vraag waarom het apparaat weigerde. Studenten: verander één assumption in de city simulator en leg het resultaat uit.

**Flow.** Les → project → dataset → paper → RFC.

**Hoe het hun werk vooruithelpt.** Gratis, open, citeerbaar materiaal; een benchmark die niemand bezit;
co-auteurschap op de standaard via RFCs.

**Hoe het de samenleving vooruithelpt.** Een generatie die weet wat een veilige keuken is en een
veiligheidsblad kan lezen.

---

## 8. Overheid: overheden, ministeries, stadsbestuurders, toezichthouders, politici en wetgevers, bestuurs- en normeringsinstanties

**Bericht.** Huishoudelijke en commerciële kookmachines arriveren onder regelgeving die apart is geschreven voor apparaten en software. Cookwala geeft toezichthouders iets concreets om naar te verwijzen: veiligheidslimieten die op het apparaat worden afgedwongen, refusal before heat, ondertekende verslagen, anonieme incidentrapportage en een conformance suite die iedereen kan draaien. Voor de veiligheid van voedseldonatie biedt het een datastandaard zonder persoonlijke gegevens. Het is royaltyvrij en is onderweg naar neutraal bestuur.

**Opties.** Lees de beleidsbrief (`docs/policy/BRIEF.md`) · gebruik de modeltaal voor
voedseldonatiegegevens en de veiligheid van kookmachines · vraag uw standaardisatieorganisatie om Core 0.2 te beoordelen
· draai een nationale registry node · financier een pilot met uw schoolmaaltijdprogramma.

**Eerste succes.** Lees de twee pagina's tellende briefing en controleer drie zaken in de repository: het safety limits pack, de conformance runner, de humanitarian data-protection rules.

**Flow.** Kort → beoordeling door een nationale standaardisatieorganisatie → verwijzing in richtlijnen → pilot →
certification scheme.

**Hoe het hun werk vooruithelpt.** Een kant-en-klare, controleerbare technische basis; bewijs uit
pilots; een kanaal naar de industrie via een neutrale standaard; interoperabiliteit met de
humanitaire datastandaarden die u al gebruikt.

**Hoe het de samenleving vooruithelpt.** Veiligere machines in huishoudens; voedselredding die de mensen beschermt die het bedient; minder verspilling in steden.

---

## 9. Kapitaal: investeerders, ondernemers, filantropieën, ontwikkelingsbanken

**Bericht.** Koken staat op het punt infrastructuur te worden. De standaard is gratis; de diensten eromheen zijn een bedrijf: certification, hub software, toegestane datasets, registry operaties, pilots. De humanitaire laag is een publiek goed dat ontwikkelingsfinanciers kunnen ondersteunen met vooraf geregistreerde evaluatie. Er worden nergens op deze site financiële beloften gedaan.

**Opties.** Lees de kans, het bedrijfsmodel, de roadmap, de risico's en het bestuur
(`/investors`) · financier een pilot of een review · steun een bedrijf dat diensten verkoopt naast de
gratis standaard · neem deel aan het bestuur als financierend waarnemer.

**Eerste succes.** Lees de secties probleem, architectuur en risico's van het whitepaper en het concernregister van het actieplan; elk openstaand risico is vermeld.

**Flow.** Bewijs (pilots, conformance, adopters) → poorten in het actieplan → financiering gekoppeld aan poorten → neutrale basis voor de standaard, een bedrijf voor diensten.

**Hoe het hun werk vooruithelpt.** Vroege positie in een categorie-definierende standaard met eerlijke
cijfers; een investeerbaar dienstenbedrijf gescheiden van het algemeen belang.

**Hoe het de samenleving vooruithelpt.** Kapitaal gaat naar wat gemeten is, niet naar wat wordt beweerd.

---

## 10. Gedachte: filosofen, ethici, historici en futuristen

**Bericht.** Wanneer een machine een recept van een grootmoeder kookt, wie bezit dan de kennis? Wat betekent waardigheid in geautomatiseerde zorg? Wat mag de robot van een huishouden weten, en wie anders mag het weten? Cookwala heeft keuzes gemaakt over deze vragen in code; de essays (`docs/essays/`) vertellen wat deze waren en nodigen uit tot onenigheid.

**Opties.** Lees de essays · schrijf een reactie · stel een regel voor (een RFC is een filosofisch
argument met een schema) · neem deel aan de ethische toetsing van het household context profiel.

**Eerste succes.** Lees het essay over household data en de travel rules van de facet registry;
vind één facet waarvan je de default zou veranderen, en zeg waarom.

**Flow.** Essay → publieke reactie → RFC → gewijzigde standaard.

**Hoe het hun werk vooruithelpt.** Een live casus waarbij ethische posities veranderen in actieve regels,
met een openbaar verslag van het argument.

**Hoe het de samenleving vooruithelpt.** Beslissingen over intieme data en cultureel erfgoed genomen in het openbaar voordat de machines in miljoenen huishoudens arriveren.

---

## 11. Iedereen: mensen die geven om voedsel, verspilling, banen, het klimaat en de toekomst

**Bericht.** Cookwala is een manier om een recept te schrijven zodat iedereen, of iets, het veilig kan bereiden, en een manier voor voedsel dat weggegooid zou worden om iemand te bereiken die het nodig heeft. Het is gratis, het behoort aan geen enkel bedrijf toe, en het zegt wat het niet weet.

**Opties.** Probeer de dry run · gebruik een simulator · lees de recepten · schrijf één recept waar je van houdt · volg de roadmap · vertel een food bank of een school hierover.

**Eerste succes.** Verander het apparaat in de dry run en kijk hoe een stap wordt geweigerd; lees waarom.

**Flow.** Nieuwsgierigheid → één recept → één gesprek met een keuken die het zou kunnen gebruiken.

**Hoe het hun leven vooruithelpt.** Veiligere machines in huis, hun eigen recepten bewaard, een
manier om te helpen zonder geld te geven.

**Hoe het de samenleving vooruithelpt.** Minder verspilling, veiliger voedsel, machines die mensen dienen die niet voor zichzelf kunnen koken, en menselijke tijd die wordt teruggegeven.

---

## 12. Banen en waardigheid, simpel gezegd

Kookmachines zullen werk veranderen. Posities van Cookwala: mensen kunnen altijd koken; de eerste
gebruiken zijn voor mensen die niet voor zichzelf kunnen koken en voor gemeenschapskeukens die
een tekort aan handen hebben; de naam van een kok blijft op een recept staan, waar het ook gekookt wordt; een stem van de arbeid heeft een
zetel in het sturende comité; nieuwe rollen (recept-engineers, voedselrobot-technici,
certifiers, rule-pack reviewers) worden genoemd zonder aantallen te beloven.

## 13. Waar elke groep op de site terechtkomt

| Groep | Pagina |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Bedrijven | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Voedsel | `/for/food/`, `/farmers/` |
| Humanitair | `/for/humanitarian/`, `/humanitarian/` |
| Gezondheid | `/for/health/` |
| Onderwijs | `/for/education/`, `/education/` |
| Overheid | `/for/government/`, `/policy/` |
| Kapitaal | `/for/capital/`, `/investors/` |
| Denken | `/for/thought/`, `/ideas/` |
| Iedereen | `/`, `/why/`, `/impact/` |

