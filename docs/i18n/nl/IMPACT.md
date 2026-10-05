<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->
# Impact: wat Cookwala kan veranderen, met bronnen en labels

**Status:** 2026-10-04. Elk getal hieronder is gelabeld als **measured** (geteld of gerapporteerd door
de genoemde bron), **modelled** (geproduceerd door onze simulators onder de opgegeven aannames) of
**assumed** (een planningscijfer). Niets hier is een resultaat van Cookwala in het veld: er heeft
geen pilot gelopen. Deze pagina vermeldt de omvang van de problemen en de mechanismen waarmee Cookwala
bijdraagt.

## 1. Honger

| Feit | Cijfer | Label en bron |
|---|---|---|
| Mensen die in 2023 te maken hadden met honger | ongeveer 733 miljoen | measured door de bron: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Mensen die in 2023 matig of ernstig voedselonzeker waren | ongeveer 2.3 miljard | measured door de bron: SOFI 2024 |
| Voedselverlies tussen oogst en detailhandel | ongeveer 14 % van geproduceerd voedsel | measured door de bron: FAO, *The State of Food and Agriculture 2019* (UNEP rondt hetzelfde cijfer af naar 13 %) |
| Voedselverspilling bij detailhandel, horeca en households in 2022 | ongeveer 1.05 miljard ton; ongeveer 132 kg per persoon; ongeveer 79 kg per persoon in households | measured door de bron: UNEP, *Food Waste Index Report 2024* |

**Cookwala's mechanismen:** surplus aanbiedingen die een keuken bereiken voordat het voedsel bederft, met een
cold-chain check bij elke overdracht (Humanitarian Profile); impact op dezelfde manier geteld op
elke locatie zodat programma's kunnen vergelijken en verbeteren; later, geaggregeerde vraag- en aanbodsignalen
zodat er minder wordt verbouwd en verplaatst om weggegooid te worden (experimental, gated on competition-law
review). **Wat het niet doet:** armoede, conflict, klimaatshocks, prijzen of
beleid aanpakken, welke de meeste honger veroorzaken.

**Modelled, illustratief, geen voorspelling:** de gemengde uitrol van de landensimulator redt
maaltijden gelijk aan ongeveer 4.7 % van wat zijn fictieve voedselonzekere populatie nodig heeft; het wereld-
simulator-scenario "protocol, geen robots" bereikt ongeveer 40 miljoen van de circa 770 miljoen (de assumed baseline van de simulator, een afronding van de 733 miljoen measured hierboven)
hongerige mensen door enkel rescue. Beiden zeggen hetzelfde: rescue is belangrijk en is niet
genoeg.

## 2. Gezondheid

| Feit | Cijfer | Label en bron |
|---|---|---|
| Ziekten door onveilig voedsel elk jaar | ongeveer 600 miljoen; ongeveer 420.000 sterfgevallen | measured door de bron: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Zoutinname versus de richtlijn | de meeste mensen eten 9 tot 12 g zout per dag; WHO adviseert minder dan 5 g (2 g natrium) | measured door de bron: WHO fact sheet on salt reduction |
| Sterfgevallen toe te schrijven aan een hoge natriuminname elk jaar | ongeveer 1,9 miljoen | measured door de bron: WHO, *Global report on sodium intake reduction* (2023) |
| Mensen die afhankelijk zijn van vervuilende kookbrandstoffen | ongeveer 2,1 miljard; ongeveer 3,2 miljoen sterfgevallen per jaar door luchtvervuiling in de household context | measured door de bron: WHO fact sheet on household air pollution (2024) |

**Cookwala's mechanismen:** kritieke controlepunten en hot-holding, koel- en opwarmingslimieten afgedwongen op het apparaat en geregistreerd; rule packs die natrium, vrije suikers, verzadigd vet en fruit en groenten op menu's signaleren; zorgregels voor kinderen, zwangerschap en ouderen; een beoordelingsverslag zodat diëtisten en voedselveiligheidsfunctionarissen een pack kunnen waarborgen.
**Wat het niet doet:** diagnosticeren, behandelen of therapeutische diëten berekenen; zie `docs/health/CLAIMS-POLICY.md`.

**Clean cooking** is in beeld maar niet in het model: de simulators tellen nog geen
hout- en houtskoolkoken of de gezondheidseffecten daarvan (vermeld als een beperking; next).

## 3. Omgeving

| Feit | Cijfer | Label en bron |
|---|---|---|
| Aandeel van de wereldwijde broeikasgasemissies door voedselverlies en -verspilling | ongeveer 8 tot 10 % | measured door de bron: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustratief:** in de wereldsimulator vermindert "many robots with the protocol" alle verloren of verspilde voeding met ongeveer 4.1 % en emissies met ongeveer 5.2 % over vijf jaar vergeleken met dezelfde wereld zonder hen; "many robots alone" vermindert huishoudelijk afval maar verhoogt verliezen vóór woningen met ongeveer 3 % (een bullwhip-effect). Robotelektriciteit (ongeveer 164 TWh over vijf jaar in dat scenario) is meegeteld. Dit zijn de outputs van het model onder zijn assumptions, vermeld op elke simulatorpagina.

## 4. Economie en werk

**Assumed and modelled:** de stadssimulator schat ongeveer 5 USD per persoon per maand
minder voedseluitgaven en ongeveer 10 uur per huishouden per maand minder koken en winkelen met robot
koks, hardware niet inbegrepen. Er wordt nergens een cijfer voor banen gegeven; nieuwe rollen worden genoemd
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) zonder
aantallen.

## 5. Cultuur

Geen nummer. De bewering is kwalitatief en controleerbaar: een Cookwala recept draagt de naam van de kok, de identiteit van het gerecht (wat is essentieel, wat is flexibel, wat wordt nooit toegevoegd), tekst in de taal van de kok, en een handtekening. Machines die het bereiden erven het recept als werkende kennis, met erkenning.

## 6. Wat we gaan meten wanneer er iets te meten valt

| Maatstaf | Methode | Waar gedefinieerd |
|---|---|---|
| Kilogrammen gered, maaltijden geserveerd, mensen bereikt, voedingswaarde slaagpercentage, kosten per maaltijd, tijd tot claim, claimpercentage, bevindingen veiligheidsblok, veiligheidsincidenten | berekend uit Offer, Claim, Handover en Distribution documenten | Humanitarian Profile sectie 10; `ImpactSummary` |
| Geverifieerde koks: executies die een ondertekend recept van begin tot eind hebben uitgevoerd met een conform log | execution logs met toestemming | `STRATEGY.md` sectie 11 |
| Onafhankelijke implementaties die conformance halen | gepubliceerde conformance rapporten | `docs/CERTIFICATION.md` |
| Agent-safety resultaten per model | de promptfoo benchmark, met model id, datum en config hash | `evals/kitchen-agent-safety/` |

## 7. Wat we nog niet weten

Of een food bank meer redt met het profiel dan met de huidige methode (het pilot protocol bestaat; er heeft nog geen pilot gedraaid). Of de envelopes juist zijn voor elke keuken (een voedselwetenschapper heeft ze niet beoordeeld). Of de gedragsmatige assumptions van de simulators standhouden (ze staan vermeld en zijn aanpasbaar). Hoe groot de rebound effects zijn. Niets hier is een belofte.

## 8. Wat ging er mis

Er is niets uitgerold, dus er is niets misgegaan in het veld. In de repository: de
eerste one-liner ("world's first and largest robot cooking recipes index") overdreven wat
bestond en is gewijzigd; het eerste Mission schema accepteerde onbekende velden en is
strikt gemaakt; de eerste simulators gebruikten een strawman baseline en kregen een competent-integration
baseline en ranges. De kritieken die deze wijzigingen hebben gedreven zijn gepubliceerd
(`docs/CRITIQUES.md`).

## 9. Bronnen

- FAO, IFAD, UNICEF, WFP en WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

Cijfers worden geciteerd zoals de bronnen ze publiceren, afgerond; controleer elk cijfer opnieuw aan de hand van de huidige editie voordat u deze in druk citeert. De organisaties zijn bronnen, geen partners.

