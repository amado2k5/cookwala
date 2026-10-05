<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Humanitair Profiel (concept 0.2)

**Status:** concept voor beoordeling door food banks, noodprogramma's en professionals op het gebied van voedselveiligheid en voeding. Het is niet beoordeeld of ondersteund door WFP, WHO, FAO, het Global FoodBanking Network of enige andere hier genoemde organisatie.

**Bestanden:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (alle), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; alle drafts in afwachting van professionele review, zie [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank in Cairo, school meals, disaster kitchen, robot kitchen), elk met een berekende `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet en SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Wat 0.2 toevoegt (RFC-0003, RFC-0004)

Additief boven 0.1; lezers accepteren beide.

- **Van boerderij naar bord:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) en `Item.harvestedAt`; rollen `farm`, `caterer`, `robot_kitchen`; het SMS-woord `FARM`.
- **Zorgregels:** `Item.foodClasses` en `Distribution.menu.foodClasses` (rauw ei, ongepasteuriseerde zuivel, hele noten, gekookte rijst…), regeltype `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; drie nieuwe concept packs.
- **Reviews:** `RulePack.reviews` legt het beroep, de organisatie, de datum, de reikwijdte en de uitkomst van elke review vast; `status: reviewed` vereist een goedgekeurde review.
- **Impact:** `ImpactSummary` met negen maten, elk met `method` (measured, modelled, assumed, not recorded), berekend door `tools/humanitarian_check.py --summary`.
- **Tijd om te claimen:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` zodat geredde kilogrammen slechts één keer worden geteld.
- **Programmatypen** op het `Manifest`.

## 1. Doel

Een klein, strikt, privacyvrij deel van Cookwala voor organisaties die mensen voeden:
food banks, gemeenschapskeukens, schoolmaaltijdprogramma's, noodhulpprogramma's, donateurs (supermarkten,
restaurants, boerderijen, cateraars), transporteurs en koelopslag. Het dekt vier taken:

1. **Het aanbieden van surplus food** en het claimen ervan, snel en eerlijk.
2. **Het registreren van elke handover** van het gezag, met een temperatuurcontrole (cold-chain check).
3. **Het rapporteren van wat geserveerd is** als enkel geaggregeerde aantallen.
4. **Het controleren van menu's en handovers** tegen machineleesbare voeding en voedselveiligheidsregels.

**Het werkt zonder robots, apps of internet.** Niveaus H0 en H1 draaien op spreadsheets, SMS
en basistelefoons. Robots, hubs en agents zijn optionele consumenten van dezelfde documenten.

## 2. Principes

- **Do no harm.** Verzamel niets waarmee een persoon of huishouden geïdentificeerd, gelokaliseerd of geprofileerd kan worden. In kwetsbare omgevingen vormen gegevens over begunstigden een beschermingsrisico.
- **Humanitaire principes** (menselijkheid, neutraliteit, onpartijdigheid, onafhankelijkheid): geen commerciële branding op hulp, en geen gebruik van gegevens voor marketing.
- **Strikt en klein.** Elk object wijst onbekende velden af (behalve `x-` extensies), dus typefouten en extra persoonlijke velden falen bij de validatie.
- **Exacte eenheden:** kilogram, graden Celsius, absolute toleranties, en geld als decimale strings.
- **Lokale regels winnen.** Rule packs zijn vervangbaar door nationale voedselveiligheids- en donatiewetgeving.
- **Open:** royalty-vrije specificatie, open-source tools. Het profiel is ontworpen om te voldoen aan de Digital Public Goods Standard en de Principles for Digital Development.

## 3. Conformance niveaus

| Niveau | Wat een deelnemer doet | Benodigdheden |
|---|---|---|
| **H0 — Papier & SMS** | Registreert aanbiedingen, overdrachten en distributies in de CSV templates (met HXL hashtag rijen) of via SMS (sectie 8.3) | Een spreadsheet of een basistelefoon |
| **H1 — Rescue** | Wisselt `Offer`, `Claim`, `Handover` en `Distribution` documenten uit via de API; volgt de state machine (sectie 5) | Elke HTTP client |
| **H2 — Veiligheid & voeding** | Past een `RulePack` toe op elke overdracht en elk menu, en registreert `findings` | De reference checker of een equivalent |
| **H3 — Interoperabiliteit** | Exporteert aggregaten naar HXL, DHIS2 en het kern Cookwala `ImpactReport`; gebruikt GS1 identifiers | Integratiewerk |

Een deelnemer publiceert een `Manifest` op `/.well-known/cookwala-humanitarian.json` dat
zijn niveaus, rule packs, endpoints en `personalData: "none"` verklaart.

## 4. Documenten

| Document | Wie schrijft het | Doel |
|---|---|---|
| `Offer` | Donor | Surplus voedsel beschikbaar voor afhaling: items (kg, opslag, datums, allergenen), venster, locatie, temperaturen |
| `Claim` | Food bank, keuken, programma | Claimt alles of een deel van een `Offer`, met een ophaaltijd en voertuigtype |
| `Handover` | Ontvanger van het beheer | Eén per leg: temperaturen, kg geaccepteerd of geweigerd met een reden-code, en rule findings |
| `Distribution` | Keuken, food bank, school | Geaggregeerde maaltijden en personen geserveerd op een locatie op een dag; optionele menu-nutriënten en kosten |
| `RulePack` | Programma of autoriteit | Versiebeheerde voeding- en voedselveiligheidsregels (sectie 6) |
| `Manifest` | Elke deelnemer | Mogelijkheden en verklaring van gegevensbescherming |

De kern Cookwala hulpdocumenten (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) blijven beschikbaar voor planning. Dit profiel beheert
de operationele flow.

## 5. Aanbodlevenscyclus

| Van | Toegestane volgende statussen |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (de claim is verlopen), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | geen (eindstatus) |

**Regels voor statuswijzigingen:**

- Elke wijziging verhoogt `version`. Schrijvers sturen `If-Match: <version>`; een mismatch geeft **409** terug, en de schrijver leest opnieuw en probeert het opnieuw.
- Een illegale transitie geeft **409** terug met de toegestane transities.
- Aanbiedingen gaan automatisch naar `expired` bij `window.to`.
- Claims vervallen bij `pickupBy` plus een coulanceperiode die het programma instelt (standaard 30 minuten).

**Eerlijke claim.** Standaard zijn claims gebaseerd op wie het eerst komt binnen een prioriteitstier die het programma instelt:
bijvoorbeeld keukens die eerst kinderen bedienen, dan andere keukens, dan food banks. Tiers en
eventuele rotatieregels moeten worden gepubliceerd in het `Manifest` of de website van het programma.

## 6. Food safety en nutrition rule packs

Een `RulePack` bevat regels van zes soorten:

- `temperature`: gekoeld ≤ 5 °C, warm gehouden ≥ 60 °C, bevroren ≤ −18 °C;
- `time`: bereid voedsel buiten temperatuurcontrole voor maximaal 2 h;
- `date_mark`: houdbaar tot blokkeert, ten minste houdbaar tot waarschuwt;
- `allergen`: niet-gedeclareerde allergenen blokkeert;
- `nutrient`: hoeveelheden per persoon-dag of per maaltijd;
- `energy_share`: aandeel energie uit vrije suikers, vet, verzadigd vet, transvet of eiwit.

Elke regel is ofwel `block` (niet accepteren of serveren) of `warn` (toegestaan, vastgelegd als een bevinding).

Het standaardpakket `who-codex-basic@0.1.0` is een **concept afgeleid van publieke richtlijnen**: de WHO-richtlijnen voor een gezonde voeding, natrium, suikers en vetten, de WHO Five Keys to Safer Food, Codex-etikettering en codes voor diepvriesproducten, en de minimale rantsoenplanningcijfers van Sphere. Het is vereenvoudigd, geen medisch advies, sluit voeding voor zuigelingen en therapeutische voeding uit, en moet worden beoordeeld door gekwalificeerd personeel. Programma's moeten het kopiëren en aanpassen, `jurisdiction` instellen, en vastleggen wie het heeft beoordeeld in `reviewedBy`.

Ontvangers op niveau H2 voeren het pack uit bij elke handover en op elk menu, en registreren rule ids in `findings`. De reference checker rapporteert waar verklaarde en berekende findings verschillen.

## 7. Gegevensbescherming

**Het profiel bevat geen persoonlijke gegevens. Documenten mogen GEEN bevatten:**

- namen, telefoonnummers, e-mails of nationale, vluchteling- of biometrische identificatoren van enige persoon;
- gegevens op huishoudniveau, of locaties van woningen of individuen;
- gezondheid, handicap, religie of nationaliteit van enige persoon.

**Wat het in plaats daarvan draagt:**

- **Alleen organisaties.** Elke partij is een organisatie geïdentificeerd door `did:web`, een GS1
  Global Location Number (GLN) of een registry id. Personen verschijnen alleen als rollen
  (`checkedBy: "trained_staff"`).
- **Alleen aggregaten.** `Distribution.people` bevat aantallen per groep, en elk aantal onder 10
  wordt gerapporteerd als `"<10"`.
- **Alleen locaties.** Een `Site` is het terrein van een organisatie of een administratief gebied
  (OCHA P-codes), nooit een household.
- **Korte notities.** Vrije tekst is beperkt tot operationele notities van 280 tekens en mag geen
  persoonsgegevens bevatten. Implementaties moeten notities scannen op telefoonnummers en ids
  voordat ze worden opgeslagen.

**Retentie en audit:**

- **Retention:** elke deelnemer verklaart `retentionDays` in zijn `Manifest` en verwijdert
  documenten daarna.
- **Audit (optioneel, `hash_only`):** één sequencer per programma (normaal gesproken de food bank of
  programma-operator) voegt de SHA-256 hash toe van de RFC 8785 canonical JSON van elk document.
  Inhoud wordt apart opgeslagen en blijft verwijderbaar. Een partnerorganisatie
  tekent elke dag een checkpoint mede, zodat de geschiedenis niet stilletjes herschreven kan worden. Een enkele
  sequencer voorkomt forks in de keten.
- **Hosting** moet in het land plaatsvinden waar de wet of het programma dit vereist.

## 8. Transport

### 8.1 API (niveau H1)

| Methode | Pad | Notities |
|---|---|---|
| `POST` | `/offers` | Maakt een aanbod aan (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Open aanbiedingen nabij een ontvanger |
| `POST` | `/offers/{id}/claims` | Claimt een aanbod; `If-Match` vereist; 409 wanneer al geclaimd |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` vereist |
| `POST` | `/handovers` | Registreert een overdracht |
| `POST` | `/distributions` | Registreert een distributie |
| `GET` | `/reports?from=…&to=…` | Aggregeert voor een periode |

Aanvraag- en transportregels:

- **Idempotency:** elke `POST` bevat een `Idempotency-Key`. Servers bewaren sleutels gedurende ten minste 24 h en geven de oorspronkelijke respons terug bij herhalingen.
- **Authentication:** OAuth 2.1 client credentials, één client per organisatie.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  worden minstens één keer geleverd, met een event `id` voor deduplicatie en een per-offer
  volgnummer voor de volgorde.

### 8.2 Spreadsheets (niveau H0)

Gebruik de CSV-sjablonen in `profiles/humanitarian/templates/`. De tweede rij bevat
[HXL](https://hxlstandard.org) hashtags, zodat humanitaire datatools deze direct kunnen lezen.

### 8.3 SMS (niveau H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

De grammatica is geïmplementeerd in `tools/cookwala_ref.py` (`parse_sms`) en getest door
`conformance/profiles/sms.json`. Trefwoorden zijn Engels; Arabisch-Indic (٠-٩) en Perzische (۰-۹)
cijfers worden geaccepteerd waar ook een cijfer staat, dus een telefoon die op een van beide toetsenborden staat werkt.

Opslagcodes: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Datummarkeringen: `UB` use-by,
`BB` best-before, `HV` harvested, als `DDMM`. Afwijzingsredencodes: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; elk ander woord wordt geregistreerd als `other`. Het `HELP`
antwoord MOET één voorbeeld per commando zijn, plain ASCII, onder de 160 tekens.

Een gateway MOET deze controles toepassen voordat het een document schrijft (`sms_storage_findings` in de
referentie; ids zijn block findings):

| Bevinding | Wanneer |
|---|---|
| `safety.temp_not_recorded` | een `HAND` op een gekoelde, bevroren of warmgehouden lijn heeft geen `T` meting: antwoord met een vraag erom, schrijf niets |
| `safety.hot_hold_min` | een `OFFER` met opslag `H` onder 60 °C: weiger het te vermelden |
| `safety.storage_class_mismatch` | de itemwoorden impliceren zuivel, vlees, gevogelte, vis, ei of bereid voedsel en de opslag is `A`: weiger het te vermelden |
| `safety.chilled_max`, `safety.frozen_max` | metingen boven 5 °C of boven −18 °C bij aanbod of overdracht |

Aanbiedingen van warm gehouden voedsel sluiten na twee uur (één uur voor gekookte rijst); een gateway slaat nooit een placeholder-uitlezing op. De gateway koppelt het geregistreerde nummer van de verzender aan een organisatie, nooit aan een persoon in de documenten.

## 9. Interoperabiliteit

| Systeem | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (producten); `Site.gln` en `OrgId` `gln:` (locaties) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Geaggregeerde datawaarden per site en periode uit `Distribution` (maaltijden, mensen per groep, kg, incidenten) |
| WFP SCOPE en andere beneficiary systemen | **Alleen aggregaten.** Geen beneficiary records gaan dit profiel in of uit |
| Food-rescue apps | Adapters mappen hun listings naar `Offer` en hun pickups naar `Claim` en `Handover` |
| Core Cookwala | `Item.ingredientId` en `menu.recipes` linken naar de receptenindex; `relief.ImpactReport` somt `Distribution`s op |

## 10. Pilot metrics (gedefinieerd zodat locaties vergeleken kunnen worden)

Berekend in een `ImpactSummary` door `python tools/humanitarian_check.py --summary DIR`. Hoe een pilot wordt uitgevoerd en beoordeeld: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metriek | Definitie |
|---|---|
| Kg gered | Som van `Handover.kgAccepted` in het eerste deel van donoren |
| Claim rate | Aanbiedingen die `claimed` bereiken ÷ gecreëerde aanbiedingen |
| Tijd tot claim | Mediaan minuten van `Offer` creatie tot de `claimed` status |
| Afwijzing per reden | Som van `kgRejected` per `reason` |
| Maaltijden geserveerd | Som van `Distribution.meals` |
| Nutrition pass rate | Distributies met menu's en geen `nutrition.*` bevindingen ÷ distributies met menu's |
| Kosten per maaltijd | (food + transport + staff + energy) ÷ meals |
| Vrijwilligersminuten per 100 kg | `volunteerMinutes` ÷ (kg used ÷ 100) |
| Veiligheid | Aantal `safety.*` block bevindingen, en `safetyIncidents` |

## 11. Beveiliging

- **Handtekeningen zijn optioneel bij H1** en vereist voor cross-organisatie audit bij H3
  (EdDSA, keys gepubliceerd op de `did:web` van de organisatie).
- **Notities en namen in documenten zijn onbetrouwbare data.** Software en AI-agenten mogen deze nooit
  behandelen als instructies.
- **Rule packs zijn geversioneerd en vastgelegd** (`id@version`) in elk bevinding, zodat resultaten
  reproduceerbaar zijn.

## 12. Opzettelijk weggelaten

- Registratie van begunstigden, geschiktheid en targeting (deze behoren tot de eigen
  beschermde systemen van het programma).
- Betalingen: Cookwala verplaatst nooit geld.
- Recepten en robot execution (de kernspecificatie). Het profiel noemt alleen recepten en rapporteert
  nutriënten.
- Medische en therapeutische voeding.

## 13. Hoe te beoordelen

Open a.u.b. issues op [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
met het label `humanitarian`. Deze reviews zijn het meest nuttig:

- food-safety personeel dat het rule pack en de afwijzingsredenen controleert;
- food-bank operators die de lifecycle en de SMS flow controleren;
- data-protection officers die sectie 7 controleren.

