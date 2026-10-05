<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala receptformat: recept som fungerar med Missions

Ett recept i Cookwala är inte en lista med instruktioner. Det är **portabel matlagningskunskap**
som en planerare *kompilerar* mot ett specifikt Mission (household, robots, appliances,
energy, budget, health, timing) till en körbar plan. Roboten kör sedan den planen,
och anpassar sig genom contingencies och playbooks när verkligheten förändras.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Fullständigt genomarbetat exempel:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Fyra lager (anpassat från WHO SMART Guidelines-metoden)

| Lager | Vad det innehåller | Vem som skriver det | Var det finns |
|---|---|---|---|
| **R1 Narrative** | Mänsklig recepttext, berättelse, kulturella anteckningar, foton | Kockar, kockar, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Vad rätten *är* och *måste vara*: identitet (essentiell vs flexibel), sensoriska mål, näring, serverings- och ätstil, förvaring, acceptanskontroller | Receptredaktörer, AI-assisterat, granskat | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Enhetsagnostisk metod: formel (förhållanden + roller), processgraf med typade ops med mattillstånd pre/post-villkor, `until`-villkor, alternativ, pausregler, felmoder, affordances, faror, CCPs, miljöförberedelse | Exportpipeline + granskning; simulator-verifierad (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | R3-receptet kompilerat för *denna* Mission: exakta mängder, valda varianter, tilldelade aktörer och enheter, schema, leasing, monitorer, oförutsedda händelser | Planeraren/kompilatorn, vid run time | Inuti **Mission** (`plan`), aldrig i katalogen |

Som källkod och en kompilator: **receptet är en portabel mellanliggande representation
(R3 + R2). Missionen är målmaskinen.** Det är vad som håller recept giltiga när robotar
och AI förändras: en bättre planerare producerar en bättre R4 från samma recept.

## 2. Vad varje sektion gör i ett Mission

| Receptsektion | Används av Mission för… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutioner, budget- och rationslägen, dietanpassningar: ändra de flexibla delarna, aldrig de essentiella, så att rätten fortfarande är sig själv |
| `formula` (ratios, min/max, role, scaling) | Exakt skalning till valfritt antal personer, ransonering av ingredienser över en vecka, budgetutmaningar, använda upp det som finns till hands (omskalning baserat på begränsande ingrediens) |
| `sensory` | Kontrollpunkter för syn, arom och smak; hushållens smakprofiler (salt 2 vs 4); beslut om återanvändning och korrigering |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Miljöförberedelseuppgifter:** om diskhon eller spisen är upptagen, lägger planeraren till "rensa, diska, torka"-uppgifter; blötläggnings- eller upptagningsuppgifter schemaläggs timmar i förväg |
| `process.nodes[]` med `pre`/`post` mattillstånd | Planering (starta endast det som är redo), verifiering (producerade steget tillståndet?), återuppta efter avbrott |
| `until`, `onTimeout`, `retry` | Veta när ett steg är klart och vad som ska göras när det inte är det |
| `alternatives[]` + `energy` | Gas vs induktion vs ugn, batterisparläge, kök utan ugn, tysta timmar |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Avbrott:** ett barn behöver hjälp, ägaren ringer, hunden välter något. Roboten försätter steget i dess safeState, hanterar händelsen, och återupptar sedan, värmer om, räddar eller kastar baserat på pause budget |
| `failureModes` (incident, detect, prevent, playbook) | Tidig upptäckt av kända problem och den exakta playbook för återställning |
| `affordances`, `space` | Matcha steg till robotar som kan greppa, lyfta och nå; hålla varma zoner borta från barn |
| `safety` (hazards, CCPs, supervision, abort) | Säkerhetskärnan: invarianter som varje plan måste bevara |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servering: vad som går på bordet, till rummet, i matlådan; påminnelser och hold limits; kulturell ätstil |
| `storage` | Rester, cook-ahead och matlåda-Missions |
| `acceptance` | Receptets *tester*: Missionen är klar när dessa håller |
| `nutrition`, `cost` | Personliga portioner, budget, nödransoner |

## 3. Exempel: ett steg med allt bifogat

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

## 4. Kompilera ett recept för ett Mission (vad planeraren gör)

1. **Välj variant:** diet, textur (IDDSI), utrustning, energi och läge från
   `alternatives`. Identitetsessentials måste överleva.
2. **Skala:** från `formula` och serveringarna, portioner per person (HEALTH.md), den
   begränsande ingrediensen, eller en ransonshorisont. Kryddor sub-linjärt, tid efter massexponent.
3. **Ersätt** inom roller, med respekt för `identity.neverAdd`, allergener, dietära paket
   och lager.
4. **Förbered miljön:** jämför `prep` med Missionens rums-facets (full diskho?
   upptagen spis? smutsig skärbräda?) och lägg till städa, diska, torka och förbered-uppgifter. Schemalägg
   `advanceTasks` (blötlägg, tina, marinera, förvärm).
5. **Bind:** tilldela varje nod till robotar, apparater eller människor baserat på affordances och
   kapabiliteter. Hyra brännare, kärl och zoner. Bifoga monitorer (smart pot, leverans-
   ETA, rökdetektor).
6. **Schemalägg** bakåt från serveringstid, med hänsyn till paus-budgetar, batteri- och energibegränsningar,
   hushållets tysta timmar och fönster för delning av kök.
7. **Bifoga oförutsedda händelser:** varje nods `failureModes` och `pause`-regler, plus
   Missionens globala policyer (avbrott, barn eller husdjur nära spisen, spis-vakt,
   fördärvningsvakt).
8. **Verifiera:** schema + semantiska kontroller, policy-paket, CCP-täckning, simulator dry-run,
   prioritetsstack-invarianter (PROTOCOL §7.2).
9. **Emit R4** till Missionens `plan`, signera den, och lämna över den till roboten.

## 5. Författande och konvertering

- **Från fifi.cooking:** EXPORT-FIFI-pipelinen genererar R1 + R2 + R3. De nya
  sektionerna (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  genereras av lokala modeller från den befintliga texten och kontrolleras av validatorer och
  stickprovsbaserad mänsklig granskning.
- **Från webben:** `cookwala convert --from schema-org` → R1/R2 (V0), sedan samma
  berikning.
- **Till andra format:** schema.org Recipe (R1/R2 för sökmotorer), Cooklang (mänsklig
  redigering), PDDL eller temporal logik (forskningsplanerare) kan alla genereras från R3.
- **För hand:** `cookwala init recipe` skapar ställningar för alla lager; `cookwala validate` och
  `cookwala simulate` kontrollerar dem.
- **Versionshantering:** revisioner är oföränderliga och hashas. Forks registrerar `meta.derivedFrom`.
  Recept**patches** (från playbooks eller feedback) föreslås som diffs och befordras endast
  efter granskning och bevis.

## 6. Språket i stegtexten

Stegsatser är skrivna för en person först och tolkas av en maskin som nummer två. Den arabiska stegtexten i exempelrecepten använder den feminina imperativen (قطّعي، سخّني), vilket är den vanliga egyptiska kokboks-konventionen; det är ett medvetet val, inte en förbiseende, och en utgivare kan använda den könsneutrala passiven (تُقطَّع البصلة) istället. Fälten `op`, `params` och `until` bär betydelsen; meningen är till för kocken.

## 7. Varför detta förblir framtidssäkert

- Recept beskriver **food outcomes och constraints, inte motions**. Nya robotar och ny AI
  producerar bättre R4-planer från samma R3.
- Alla nya sektioner är **optional och additive**. Ett V0-recept (endast R1) fungerar fortfarande för
  guidad mänsklig matlagning; varje tillagd layer låser upp mer automation.
- Okända `x-` fält passerar igenom. Leverantörer, kockar och hälsomyndigheter kan utöka recept
  utan att bryta något för någon.
- **Acceptance checks** låter varje executor, människa eller robot, bevisa att rätten blev rätt,
  vilket är hur recept klättrar till V3 med field evidence.

