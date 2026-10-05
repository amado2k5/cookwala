<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Påverkan: vad Cookwala kan förändra, med källor och etiketter

**Status:** 2026-10-04. Varje nummer nedan är märkt **measured** (räknat eller rapporterat av den angivna källan), **modelled** (producerat av våra simulatorer under angivna antaganden) eller **assumed** (en planeringssiffra). Ingenting här är ett resultat av Cookwala i fält: ingen dry run har genomförts. Denna sida anger storleken på problemen och de mekanismer genom vilka Cookwala bidrar.

## 1. Hunger

| Fakta | Siffra | Etikett och källa |
|---|---|---|
| Människor som drabbades av hunger 2023 | ungefär 733 miljoner | measured av källan: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Människor med måttlig eller svår livsmedelsosäkerhet 2023 | ungefär 2,3 miljarder | measured av källan: SOFI 2024 |
| Mat som gick förlorad mellan skörd och detaljhandel | ungefär 14 % av producerad mat | measured av källan: FAO, *The State of Food and Agriculture 2019* (UNEP avrundar samma siffra till 13 %) |
| Mat som slängdes vid detaljhandel, livsmedelstjänster och hushåll 2022 | ungefär 1,05 miljarder ton; ungefär 132 kg per person; ungefär 79 kg per person i hushåll | measured av källan: UNEP, *Food Waste Index Report 2024* |

**Cookwala's mekanismer:** surplus-erbjudanden som når ett kök innan maten fördärvas, med en
cold-chain-kontroll vid varje överlämning (Humanitarian Profile); påverkan räknas på samma sätt vid
varje plats så att program kan jämföra och förbättra; later, aggregerade efterfråge- och utbudssignaler
så att mindre odlas och flyttas för att kastas (experimental, gated on competition-law
review). **Vad det inte gör:** hantera fattigdom, konflikt, klimatchocker, priser eller
policy, vilket driver det mesta av hungern.

**Modelled, illustrativ, inte en prognos:** landssimulatorns blandade utrullning räddar
måltider motsvarande ungefär 4.7 % av vad dess fiktiva livsmedelsotrygga befolkning behöver; världssimulatorns
"protocol, no robots"-scenario når ungefär 40 miljoner av cirka 770 miljoner (simulatorns assumed baseline, en avrundning av de 733 miljoner measured ovan)
hungriga människor genom enbart räddning. Båda säger samma sak: räddning spelar roll och är inte
tillräckligt.

## 2. Hälsa

| Fakta | Siffra | Etikett och källa |
|---|---|---|
| Sjukdomar från osäker mat varje år | ungefär 600 miljoner; ungefär 420 000 dödsfall | measured av källan: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Saltintag kontra riktlinjen | de flesta äter 9 till 12 g salt per dag; WHO rekommenderar under 5 g (2 g natrium) | measured av källan: WHO fact sheet on salt reduction |
| Dödsfall som kan tillskrivas högt natrium varje år | ungefär 1,9 miljoner | measured av källan: WHO, *Global report on sodium intake reduction* (2023) |
| Människor som förlitar sig på förorenande matlagningsbränslen | ungefär 2,1 miljarder; ungefär 3,2 miljoner dödsfall per år från household air pollution | measured av källan: WHO fact sheet on household air pollution (2024) |

**Cookwalas mekanismer:** kritiska kontrollpunkter och gränser för varmhållning, kylning och återuppvärmning som tillämpas på enheten och registreras; rule packs som flaggar natrium, fritt socker, mättat fett samt frukt och grönsaker på menyer; care rules för barn, graviditet och äldre vuxna; ett granskningsregister så att dietister och livsmedelssäkerhetsansvariga kan intyga ett pack.
**Vad det inte gör:** diagnostisera, behandla eller beräkna terapeutiska dieter; se `docs/health/CLAIMS-POLICY.md`.

**Clean cooking** finns med i bilden men inte i modellen: simulatorerna räknar ännu inte med
ved- och kolmatlagning eller dess hälsoeffekter (listat som en begränsning; next).

## 3. Miljö

| Fakta | Siffra | Etikett och källa |
|---|---|---|
| Andel av globala växthusgasutsläpp från matförlust och matsvinn | ungefär 8 till 10 % | measured av källan: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrativ:** i världssimulatorn minskar "many robots with the protocol" allt
matförlust eller svinn med ungefär 4.1 % och utsläpp med ungefär 5.2 % över fem år jämfört med
samma värld utan dem; "many robots alone" minskar hushållsavfall men ökar förluster före
hemmen med ungefär 3 % (en bullwhip-effekt). Roboternas elektricitet (ungefär 164 TWh över fem år i
det scenariot) räknas med. Dessa är modellens utdata under dess antaganden, listade på
varje simulatorsida.

## 4. Ekonomi och arbete

**Assumed och modelled:** stadssimulatorn uppskattar ungefär 5 USD per person per månad
mindre matkostnader och ungefär 10 timmar per hem per månad mindre matlagning och shopping med robot-
kokar, hårdvara ej inkluderad. Inga siffror för jobb anges någonstans; nya roller nämns
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) utan
siffror.

## 5. Kultur

Inget nummer. Påståendet är kvalitativt och kontrollerbart: ett Cookwala-recept bär kockens
namn, rättens identitet (vad som är essentiellt, vad som är flexibelt, vad som aldrig tillsätts), text på
kockens språk, och en signatur. Maskiner som tillagar det ärver receptet som arbetande
kunskap, med erkännande.

## 6. Vad vi kommer att mäta när det finns något att mäta

| Mått | Metod | Var definierat |
|---|---|---|
| Kilogram räddade, måltider serverade, människor nådda, nutrition pass rate, kostnad per måltid, tid till anspråk, anspråksfrekvens, safety block findings, säkerhetsincidenter | beräknat från Offer, Claim, Handover och Distribution dokument | Humanitarian Profile section 10; `ImpactSummary` |
| Verifierade kockar: körningar som körde ett signerat recept från slut till slut med en conforming log | execution logs med samtycke | `STRATEGY.md` section 11 |
| Oberoende implementeringar som uppfyller conformance | publicerade conformance reports | `docs/CERTIFICATION.md` |
| Agent-safety resultat per modell | promptfoo benchmark, med model id, datum och config hash | `evals/kitchen-agent-safety/` |

## 7. Vad vi inte vet ännu

Om en food bank räddar mer med profilen än med sin nuvarande metod (pilotprotokollet existerar; ingen pilot har körts). Om envelopes är rätt för varje kök (en livsmedelsforskare har inte granskat dem). Om simulatorernas beteendeantaganden håller (de är listade och justerbara). Hur stora rebound-effekterna är. Ingenting här är ett löfte.

## 8. Vad gick fel

Inget har driftsatts, så inget har gått fel i fält. I repositoriet: den första
enradiga texten ("world's first and largest robot cooking recipes index") överdrev vad
som existerade och ändrades; det första Mission-schemat accepterade okända fält och gjordes
strikt; de första simulatorerna använde en strawman-baslinje och fick en competent-integration
baslinje och intervall. Kritikerna som drev dessa ändringar är publicerade
(`docs/CRITIQUES.md`).

## 9. Källor

- FAO, IFAD, UNICEF, WFP och WHO, *The State of Food Security and Nutrition in the World
  2024*, Rom, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rom, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Genève, 2015.
- WHO, *Global report on sodium intake reduction*, Genève, 2023; WHO faktablad *Salt
  reduction*.
- WHO faktablad *Household air pollution*, 2024.

Siffror anges som källorna publicerar dem, avrundade; kontrollera varje siffra mot den aktuella utgåvan innan de citeras i tryck. Organisationerna är källor, inte partners.

