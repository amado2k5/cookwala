<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Cookwala Receptformaat: recepten die werken met Missions

Een recept in Cookwala is geen lijst met instructies. Het is **draagbare kookkennis**
die een planner *compileert* tegen een specifieke Mission (huishouden, robots, apparaten,
energie, budget, gezondheid, timing) tot een uitvoerbaar plan. De robot voert dat plan vervolgens uit,
waarbij het zich aanpast via contingencies en playbooks wanneer de realiteit verandert.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Volledig uitgewerkt voorbeeld:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Vier lagen (aangepast van de WHO SMART Guidelines aanpak)

| Laag | Wat het bevat | Wie het schrijft | Waar het leeft |
|---|---|---|---|
| **R1 Narratief** | Menselijke recepttekst, verhaal, culturele aantekeningen, foto's | Koks, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Gerecht spec** | Wat het gerecht *is* en *moet zijn*: identiteit (essentieel vs flexibel), sensorische doelen, voeding, serveer- en eetstijl, opslag, acceptatiecontroles | Receptredacteuren, AI-ondersteund, beoordeeld | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Uitvoerbare IR** | Apparaat-agnostische methode: formule (ratio's + rollen), procesgrafiek van getypeerde ops met food-state pre/post condities, `until` condities, alternatieven, pauzeregels, faalmodi, affordances, gevaren, CCP's, omgevingsvoorbereiding | Export pipeline + review; simulator-verified (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Gebonden plan** | Het R3 recept gecompileerd voor *deze* Mission: exacte hoeveelheden, gekozen varianten, toegewezen actoren en apparaten, schema, leases, monitors, contingenties | De planner/compiler, tijdens run time | Binnen de **Mission** (`plan`), nooit in de catalogus |

Zoals broncode en een compiler: **het recept is een draagbare intermediate representation
(R3 + R2). De Mission is de target machine.** Dat is wat recepten geldig houdt terwijl robots
en AI veranderen: een betere planner produceert een betere R4 uit hetzelfde recept.

## 2. Wat elke sectie doet in een Mission

| Receptsectie | Gebruikt door de Mission voor… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substituties, budget- en rantsoenmodi, dieetaanpassingen: verander de flexibele delen, nooit de essentiële delen, zodat het gerecht zichzelf blijft |
| `formula` (ratios, min/max, role, scaling) | Exacte schaling naar een willekeurig aantal personen, het rantsoeneren van ingrediënten over een week, budgetoptimalisatie, opmaken wat voorhanden is (de limiting-ingredient rescale) |
| `sensory` | Visuele, aroma- en smaakcheckpoints; household taste profiles (salt 2 vs 4); beslissingen over hergebruik en reparatie |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Omgevingsvoorbereidingstaken:** als de gootsteen of het kooktoestel bezet is, voegt de planner "clear, wash, dry" taken toe; week- of ontdooitaken worden uren van tevoren gepland |
| `process.nodes[]` met `pre`/`post` food states | Planning (start alleen wat klaar is), verificatie (heeft de stap de staat geproduceerd?), hervatten na onderbrekingen |
| `until`, `onTimeout`, `retry` | Weten wanneer een stap klaar is en wat te doen als dat niet zo is |
| `alternatives[]` + `energy` | Gas vs inductie vs oven, batterijbesparing, keukens zonder oven, stille uren |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Onderbrekingen:** een kind heeft hulp nodig, de eigenaar roept, de hond stoot iets om. De robot brengt de stap naar de safe state, handelt het event af, en hervat vervolgens, verwarmt opnieuw, redt of gooit weg op basis van het pause budget |
| `failureModes` (incident, detect, prevent, playbook) | Vroege detectie van bekende problemen en het exacte playbook om te herstellen |
| `affordances`, `space` | Stappen afstemmen op robots die kunnen grijpen, tillen en reiken; het houden van hot zones uit de buurt van kinderen |
| `safety` (hazards, CCPs, supervision, abort) | De safety kernel: invarianten die elk plan moet behouden |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Serveren: wat komt op tafel, in de kamer, in de lunchbox; herinneringen en hold limits; culturele eetstijl |
| `storage` | Restjes, cook-ahead en lunchbox Missions |
| `acceptance` | De *tests* van het recept: de Mission is voltooid wanneer deze standhouden |
| `nutrition`, `cost` | Persoonlijke porties, budget, noodrantsoenen |

## 3. Voorbeeld: één stap met alles eraan gekoppeld

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Het samenstellen van een recept voor een Mission (wat de planner doet)

1. **Selecteer de variant:** dieet, textuur (IDDSI), apparatuur, energie en modus selecteren uit
   `alternatives`. Essentiële identiteiten moeten behouden blijven.
2. **Schaal:** vanaf `formula` en de porties, porties per persoon (HEALTH.md), de
   beperkende ingrediënt, of een rantsoenhorizon. Specerijen sublineair, tijd via massa-exponent.
3. **Vervang** binnen rollen, met respect voor `identity.neverAdd`, allergenen, dieetpakketten
   en inventaris.
4. **Bereid de omgeving voor:** vergelijk `prep` met de ruimte-facets van de Missie (gootsteen vol?
   kookplaat bezet? plank vuil?) en voeg opruim-, was-, droog- en klaarzettaken toe. Plan
   `advanceTasks` (weken, ontdooien, marineren, voorverwarmen).
5. **Koppel:** wijs elke node toe aan robots, apparaten of mensen op basis van affordances en
   mogelijkheden. Lease branders, vaten en zones. Bevestig monitors (slimme pan, levering
   ETA, rookmelder).
6. **Plan** terug vanaf de serveertijd, met inachtneming van pauzebudgetten, batterij- en energielimieten,
   huishoudelijke stilte-uren en vensters voor het delen van de keuken.
7. **Voeg contingenties toe:** de `failureModes` en `pause` regels van elke node, plus de
   globale beleidsregels van de Missie (onderbrekingen, kind of huisdier nabij de kookplaat, stove watchdog,
   bederf-bewaking).
8. **Verifieer:** schema + semantische controles, beleidspakketten, CCP-dekking, simulator dry-run,
   priority-stack invarianten (PROTOCOL §7.2).
9. **Emitteer R4** naar het `plan` van de Missie, onderteken het, en overhandig het aan de robot.

## 5. Auteurschap en converteren

- **Van fifi.cooking:** de EXPORT-FIFI pipeline genereert R1 + R2 + R3. De nieuwe
  secties (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  worden gegenereerd door lokale modellen uit de bestaande tekst en gecontroleerd door validators en
  steekproefsgewijze menselijke beoordeling.
- **Van het web:** `cookwala convert --from schema-org` → R1/R2 (V0), daarna dezelfde
  verrijking.
- **Naar andere formaten:** schema.org Recipe (R1/R2 voor zoekmachines), Cooklang (menselijke
  bewerking), PDDL of temporele logica (onderzoek planners) kunnen allemaal worden gegenereerd uit R3.
- **Met de hand:** `cookwala init recipe` bouwt alle lagen op; `cookwala validate` en
  `cookwala simulate` controleren ze.
- **Versiebeheer:** revisies zijn onveranderlijk en gehasht. Forks registreren `meta.derivedFrom`.
  Recept **patches** (uit playbooks of feedback) worden voorgesteld als diffs en gepromoot pas
  na beoordeling en bewijs.

## 6. Taal van de staptekst

Stappen-zinnen zijn geschreven voor een persoon en worden tweede geparsed door een machine. De Arabische stappen-tekst in de voorbeeldrecepten gebruikt de vrouwelijke imperatief (قطّعي، سخّني), wat de gebruikelijke Egyptische kookboekconventie is; het is een bewuste keuze, geen vergissing, en een uitgever kan in plaats daarvan het genderneutrale passief (تُقطَّع البصلة) gebruiken. De `op`, `params` en `until` velden dragen de betekenis; de zin is voor de kok.

## 7. Waarom dit toekomstbestendig blijft

- Recepten beschrijven **food outcomes en constraints, geen bewegingen**. Nieuwe robots en nieuwe AI
  produceren betere R4-plannen vanuit dezelfde R3.
- Alle nieuwe secties zijn **optioneel en additief**. Een V0-recept (alleen R1) werkt nog steeds voor
  begeleid koken door mensen; elke toegevoegde laag ontgrendelt meer automatisering.
- Onbekende `x-` velden worden doorgegeven. Leveranciers, chefs en gezondheidsinstanties kunnen recepten uitbreiden
  zonder iets te breken.
- **Acceptance checks** laten elke executor, mens of robot, bewijzen dat het gerecht goed is geworden,
  wat de manier is waarop recepten naar V3 klimmen met veld-evidence.

