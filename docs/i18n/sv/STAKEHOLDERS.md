<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Intressenter: ett meddelande, alternativ, en första framgång och ett flöde för alla

**Status:** 2026-10-04. För varje grupp: varför Cookwala betyder något för dem, sätt att engagera sig från
lätt till djupt, en första framgång på under 15 minuter, vägen efteråt, och hur engagemang
förstärker deras arbete och världen. Ingenting här namnger en partner, en användare eller en pilot som inte
existerar. Där något är planerat står det next eller later.

De tre målen bakom varje rad: hjälpa till att avsluta hunger, göra människor friskare, sätta robotar i arbete för människor.

---

## 1. Builders: utvecklare, robot- och apparattillverkare, inbyggda ingenjörer, AI-agentbyggare, smart-hem- och plattformsutvecklare, open-source-bidragsgivare

**Meddelande.** Robotar och apparater lär sig att röra sig. Ingen har skrivit ner, i en form som en maskin kan kontrollera, vad "simmer" betyder, när kyckling är säker, eller när ett steg måste nekas. Cookwala är det lagret: recept som en maskin kan planera, slutvillkor som den kan mäta, och säkerhetsgränser som den upprätthåller på sig själv. Det är öppet, royaltyfritt, modellneutralt och enhetsneutralt, och det kommer med en conformance-svit som du kan köra idag.

**Alternativ.**
- *Lätt:* kör webbläsarens dry run; läs Core 0.2 (en kväll).
- *Medel:* `pip install -e sdk/python`, kör en dry run av din enhets förmågor mot exempelrecepten, kör conformance-vektorerna, starta referenshubben.
- *Djup:* implementera Core API på en enhet eller en hub, publicera en conformance-rapport, lägg till din enhet i directory, föreslå en RFC, skriv en ROS 2 bridge node, lägg till attackfall till agent-safety benchmark.

**Första framgång (under 15 minuter).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flöde.** Dry run → implementera Core API mot referenshubben → passera conformance →
publicera rapporten → lista enheten → samtyckta execution logs blir LeRobot-dataset och
OpenTelemetry traces.

**Hur det främjar deras arbete.** En delad uppgiftsdefinition och ett framgångstest för matlagning, med
ett publikt benchmark att mäta mot; recept i varje kök utan att skriva dem; en
säkerhetshistoria som tillsynsmyndigheter kan läsa; conformance-rapporter som ett försäljningsdokument;
förstahandsställning i en standard som kommer att styras av dess implementerare.

**Hur det främjar samhället.** Färre köksbränder och livsmedelsburna sjukdomar från maskiner som
utför refusal before heat snarare än gissningar; maskiner som ärver världens kök istället för bara några få.

---

## 2. Företag: startups, företag, livsmedelsföretag, livsmedelsbutiker och leverans, restauranger och foodservice, försäkringsbolag, certifierare, sälj- och partnerskapsteam

**Meddelande.** Varje företag som hanterar livsmedel kommer att möta matlagningsmaskiner och AI-agenter under de närmaste åren. Cookwala ger dig ett gränssnitt för alla dessa, det enda med säkerhetsgränser som upprätthålls på enheten och loggar som du kan granska. För livsmedelshandlare och leverantörer: ta emot leveransfönster och allergenkrav, aldrig en familjs schema. För försäkringsbolag och certifierare: ett format för conformance-rapporter och ett flöde för incidentrapporter designat för dig.

**Alternativ.**
- *Light:* läs sidan Investors and partners och trust-sidorna; mappa dina produkter till
  ingrediensklasser och operationer.
- *Medium:* publicera ett offertfält (market profile, experimental) eller ett surplus-erbjudande till ett
  lokalt program (Humanitarian Profile); kör agent-safety benchmark på den agent du
  planerar att driftsätta.
- *Deep:* implementera Core API i en produkt; sponsra en conformance-verifiering; gå med i
  steering committee när den bildas; anta certification-vägen.

**Första framgången.** Konvertera en produktlinje till ett marknads-`Offer` med GTINs och allergen-legitimationer, validera det, och se vilka exempelrecept det kan tillhandahålla.

**Flöde.** Erbjud feed → derived constraints från households → order genom din egen checkout → fulfilment events → reputation från execution reports (med samtycke).

**Hur det främjar deras arbete.** Tillgång till ett neutralt lager istället för ett dussin leverantörsintegrationer; efterfrågesignaler (later, efter konkurrensrättslig granskning) som minskar svinn; certification som försäkringsbolag kan prissätta; ett offentligt register över säkerhet.

**Hur det främjar samhället.** Mindre mat går förlorad mellan butik och tallrik; surplus når
kök innan den ruttnar; maskiner i hem som inte kan övertalas till osäkra handlingar.

---

## 3. Leverantörer: livsmedelsbutiker, gårdar och kooperativ, leverans, energi, AI- och modellleverantörer, receptutgivare

**Meddelande.** Leverantörer ansluter till Cookwala som jämlikar, inte hyresgäster. En livsmedelshandlare eller leveranstjänst får en constraint, aldrig ett hushålls fakta. En AI-leverantör får ett benchmark som visar att dess modell är säker i ett kök och en MCP server att använda idag. En receptutgivare behåller sitt namn på varje recept och kan publicera en signerad katalog från en statisk mapp.

**Alternativ.** Publicera en katalog (recept) · publicera ett erbjudande-flöde · kör agent-safety-benchmark · kör en registry-nod · erbjud surplus via SMS.

**Första framgången.** Receptutgivare: `cookwala init my-dish`, redigera, `cookwala validate`,
`cookwala hash`; din katalog är en mapp med `/.well-known/cookwala.json`. AI-leverantör:
lägg till MCP-servern och kör de tio agent-safety-fallen.

**Flöde.** Katalog eller feed → registry-post under ditt bevisade namespace → recall feed om något går fel → rykte från utfall.

**Hur det främjar deras arbete.** Nå varje enhet och agent genom ett format;
kredit och proveniens genom signatur; en säkerhetsbenchmark som är en marknadsföringsresurs när
den klaras av ärligt.

**Hur det främjar samhället.** Recept förblir tillskrivna; agenter som agerar för människor är
measured innan de litar pås.

---

## 4. Mat: bönder, kockar och bagare, hemkok, receptskapare, kulinariska skolor

**Meddelande.** Ett recept skrivet för Cookwala håller ditt namn och din matlagning vid liv på varje
enhet som tillagar det, med stegen som en maskin aldrig får hoppa över nedskrivna. En gård med ett
överskott kan lista det via SMS och nå ett kök samma dag. En kulinarisk skola kan lära ut livsmedelssäkerhet
med ett format som kontrollerar sig självt.

**Alternativ.**
- *Bönder:* `FARM 120KG TOMATO A BB0411` till ett programs gateway (där en sådan finns);
  later, läs utbud- och efterfrågesignaler.
- *Kockar och kockar:* förvandla ett recept du kan utantill till ett Cookwala-recept; granska
  stegmeningarna på ditt språk; later, registrera samtyckta sessioner med kredit.
- *Skolor:* använd de nio exempelrecepten som undervisningsfall; lägg till dina egna.

**Första framgång.** Cooks: `cookwala init`, skriv ett recept med ett slutvillkor för varje
värmesteg, validera det. Farmers: skicka ett SMS-erbjudande till ett program som kör profilen (inget
körs ännu; parsern och vektorerna existerar).

**Flöde.** Recept → validering → katalog → dry run på enheter → execution logs visar hur det
presterar på riktiga maskiner → revideringar med bevis.

**Hur det främjar deras arbete.** Attribution som färdas; ett recept som kan tillagas av
maskiner i andra länder; för bönder, ett sätt att förvandla ett surplus till måltider istället för avfall.

**Hur det främjar samhället.** Kulinariskt arv bevarat som praktisk kunskap, inte video;
mindre svinn vid gården.

---

## 5. Humanitära: NGO:er, food banks, community kitchens, skollunchprogram, hjälporganisationer, donatorer

**Meddelande.** Humanitarian Profile flyttar surplus mat till tallrikar med telefoner och
kalkylblad, registrerar kylkedjekontroller, räknar måltider och bär **inga personuppgifter**. Det
fungerar utan robotar, appar eller internet. Det ger dig siffror som du kan försvara: kilogram
räddade, måltider serverade, nutrition pass rate, kostnad per måltid, tid till anspråk, säkerhetsincidenter,
var och en med sin metod.

**Alternativ.**
- *Light:* läs profilen och pilotprotokollet; prova SMS-genomgången.
- *Medium:* kör CSV-mallarna på en plats i fyra veckor (nivå H0) och beräkna en
  impact summary.
- *Deep:* en 12-veckors förregistrerad pilot med en baseline och en oberoende utvärderare;
  anpassa rule packs till nationell lag med din food-safety lead; kör din egen registry
  node.

**Första framgången.** Fyll de tre CSV-mallarna för en dag, kör
`cookwala humanitarian --summary your-folder`, läs `ImpactSummary` med en metod under
varje nummer.

**Flöde.** Erbjudande → anspråk → överlämning med en temperaturkontroll → distribution → sammanfattning av påverkan → publicerade resultat, vad de än visar.

**Hur det främjar deras arbete.** Jämförbara siffror mellan platser; bevis för finansiärer;
säkerhetsfynd före, inte efter, ett problem; ett format som donatorers system kan läsa (HXL,
GS1, DHIS2 mappings).

**Hur det främjar samhället.** Mer mat når människor på ett säkert sätt, med deras värdighet intakt:
inga namn, inga ansikten, ingen profilering.

---

## 6. Hälsa: dietister, livsmedelssäkerhetsansvariga, folkhälsomyndigheter, vårdhem

**Meddelande.** Nutrition- och livsmedelssäkerhetsregler som maskincheckbara rule packs, härledda från offentlig vägledning, tillämpade på menyer och överlämningar, med din granskning registrerad efter profession och utfall. Ingenting är medicinsk rådgivning; ingenting hävdas utöver vad paketen säger.

**Alternativ.** Granska ett pack med mallen (två timmar) · anpassa ett pack till nationella regler ·
föreslå vårdregler för de människor du betjänar · later, läs aggregerade utfall från program.

**Första framgången.** Öppna `profiles/humanitarian/care-vulnerable-groups.rulepack.json` och
granskningsmallen; markera tre regler som godkända, ändrade eller avvisade; arkivera granskningen.

**Flöde.** Utkastpaket → granskning → status granskad → program antar → fynd i varje
distribution → utfall publicerade med metoder.

**Hur det främjar deras arbete.** Din vägledning körs i varje kök som antar det,
inklusive robotkök, med ditt yrke dokumenterat; en publicerbar recension; ett
dataset med fynd (aggregerat, inga personuppgifter) för forskning.

**Hur det främjar samhället.** Mindre natrium, socker och mättat fett i måltider som serveras i stor skala; säkrare varmhållning och kylning; omsorg om barn och äldre inbyggd i maskinen.

---

## 7. Utbildning: lärare, pedagoger, professorer, forskare, studenter

**Meddelande.** Matlagning är den mest bekanta processen i världen, och Cookwala förvandlar den till ett
lärande objekt: temperaturer, enheter, rättvis fördelning, säkerhet, maskiner som följer regler. För
forskare är det en benchmark, ett datasetformat och en lista över öppna problem.

**Alternativ.**
- *Lärare:* lektionspaketet (`docs/education/LESSON-KIT.md`): fem lektioner från "vad är en
  simmer" till "vad en maskin aldrig bör göra".
- *Professorer och studenter:* listan över forskningsteman, simulatorerna, conformance
  vektorer som testförhållanden, LeRobot-exporten, öppna problem i avhandlingsskala.
- *Forskare:* publicera dataset av samtyckta executions; kritisera simulatorernas
  assumptions; föreslå vektorer.

**Första framgången.** Lärare: kör webbläsarens dry run i klassrummet och fråga varför enheten
vägrade. Studenter: ändra en assumption i stads-simulatorn och förklara resultatet.

**Flöde.** Lektion → projekt → dataset → paper → RFC.

**Hur det främjar deras arbete.** Fritt, öppet, citerbart material; en benchmark som ingen äger;
medförfattarskap till standarden genom RFCs.

**Hur det främjar samhället.** En generation som vet vad ett säkert kök är och kan läsa ett säkerhetsblad.

---

## 8. Myndigheter: regeringar, departement, stadsfunktionärer, tillsynsmyndigheter, politiker och lagstiftare, styrande organ och standardiseringsorgan

**Meddelande.** Hem- och kommersiella matlagningsmaskiner anländer under regleringar skrivna för
apparater och programvara separat. Cookwala ger tillsynsmyndigheter något konkret att peka
på: säkerhetsgränser som upprätthålls på enheten, refusal before heat, signerade register, anonym
incidentrapportering och en conformance suite som vem som helst kan köra. För säkerhet vid matdonation ger det
en datastandard utan personuppgifter. Det är royaltyfritt och på väg mot neutral styrning.

**Alternativ.** Läs policybriefen (`docs/policy/BRIEF.md`) · använd modellspråket för
matdonationsdata och säkerhet för matlagningsmaskiner · be din standardiseringsorganisation att granska Core 0.2
· kör en nationell registry-nod · finansiera ett pilotprojekt med ditt skolmåltidsprogram.

**Första framgången.** Läs den tvåsidiga sammanfattningen och kontrollera tre saker i repositoriet:
safety limits pack, conformance runner, de humanitära dataskyddsreglerna.

**Flöde.** Kort → granskning av ett nationellt standardiseringsorgan → referens i vägledning → pilot →
certification scheme.

**Hur det främjar deras arbete.** En färdig, granskningsbar teknisk bas; bevis från
piloter; en kanal till industrin genom en neutral standard; interoperabilitet med de
humanitära datastandarder du redan använder.

**Hur det främjar samhället.** Säkerare maskiner i hem; maträddning som skyddar människorna
den tjänar; mindre avfall i städer.

---

## 9. Kapital: investerare, entreprenörer, filantropier, utvecklingsbanker

**Meddelande.** Matlagning håller på att bli infrastruktur. Standarden är gratis; tjänsterna runt den är en verksamhet: certification, hub-programvara, samtyckta dataset, registry-operationer, piloter. Det humanitära lagret är en kollektiv nyttighet som utvecklingsfinansiärer kan stödja med förregistrerad utvärdering. Inga finansiella löften ges någonstans på denna webbplats.

**Alternativ.** Läs möjligheten, affärsmodellen, roadmap, risker och styrning
(`/investors`) · finansiera en pilot eller en granskning · stöd ett företag som säljer tjänster vid sidan av den
kostnadsfria standarden · gå med i styrningen som en finansiärsobservatör.

**Första framgången.** Läs whitepaper-avsnitten om problem, arkitektur och risker samt åtgärdsplanens concern register; varje öppen risk är listad.

**Flöde.** Bevis (piloter, conformance, adoptörer) → grindar i handlingsplanen → finansiering kopplad till grindar → neutral grund för standarden, ett företag för tjänster.

**Hur det främjar deras arbete.** Tidig position i en kategoridefinierande standard med ärliga siffror; ett investerbart tjänsteföretag separerat från det allmänna goda.

**Hur det främjar samhället.** Kapital går till det som är measured, inte det som påstås.

---

## 10. Tanke: filosofer, etiker, historiker och futurister

**Meddelande.** När en maskin tillagar en mormors recept, vem äger kunskapen? Vad betyder
värdighet i automatiserad omsorg? Vad får ett hushålls robot veta, och vem annan får veta det?
Cookwala har gjort val gällande dessa frågor i kod; essäerna (`docs/essays/`) anger
vad de var och bjuder in till oenighet.

**Alternativ.** Läs essäerna · skriv ett svar · föreslå en regel (en RFC är ett filosofiskt
argument med ett schema) · sitta i den etiska granskningen av household context-profilen.

**Första framgång.** Läs essän om household data och facet registrys travel rules;
hitta en facet vars default du skulle ändra, och säg varför.

**Flöde.** Essay → public comment → RFC → changed default.

**Hur det främjar deras arbete.** Ett levande fall där etiska ståndpunkter blir löpande regler,
med ett offentligt register över argumentationen.

**Hur det främjar samhället.** Beslut om intima data och kulturellt arv som fattas öppet innan maskinerna anländer till miljontals hem.

---

## 11. Alla: människor som bryr sig om mat, avfall, jobb, klimatet och framtiden

**Meddelande.** Cookwala är ett sätt att skriva ett recept så att vem som helst, eller vad som helst, kan laga det säkert, och ett sätt för mat som annars skulle ha kastats bort att nå någon som behöver den. Det är gratis, det tillhör inget företag, och det säger vad det inte vet.

**Alternativ.** Prova en dry run · spela en simulator · läs recepten · skriv ett recept som du
älskar · följ roadmapen · berätta för en food bank eller en skola om det.

**Första framgången.** Ändra enheten i dry run och se ett steg bli nekad; läs varför.

**Flöde.** Nyfikenhet → ett recept → en konversation med ett kök som skulle kunna använda det.

**Hur det förbättrar deras liv.** Säkerare maskiner i hemmet, deras egna recept bevarade, ett
sätt att hjälpa utan att ge pengar.

**Hur det främjar samhället.** Mindre svinn, säkrare mat, maskiner som tjänar människor som inte kan laga mat själva, och mänsklig tid som återges.

---

## 12. Jobb och värdighet, enkelt uttryckt

Matlagningsmaskiner kommer att förändra arbetet. Cookwala:s positioner: människor kan alltid laga mat; de första användningsområdena är för personer som inte kan laga mat själva och för storkök som har brist på händer; en kocks namn står kvar på ett recept oavsett var det tillagas; en arbetarröst har en plats i styrkommittén; nya roller (receptingenjörer, matrobottekniker, certifierare, rule-pack-granskare) nämns utan att lova antal.

## 13. Var varje grupp hamnar på webbplatsen

| Grupp | Sida |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

