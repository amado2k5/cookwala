<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Humanitarian Profile (draft 0.2)

**Status:** utkast för granskning av food banks, hjälpprogram samt experter inom livsmedelssäkerhet och nutrition. Det har inte granskats eller godkänts av WFP, WHO, FAO, the Global FoodBanking Network eller någon annan organisation som nämns här.

**Filer:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (alla), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; alla utkast väntar på professionell granskning, se [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank i Kairo, skolmåltider, katastrofkök, robotkök), var och en med en beräknad `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet och SMS-mallar: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Vad 0.2 tillför (RFC-0003, RFC-0004)

Additiv över 0.1; läsare accepterar båda.

- **Från gård till tallrik:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) och `Item.harvestedAt`; roller `farm`, `caterer`, `robot_kitchen`; SMS-ordet `FARM`.
- **Vårdrregler:** `Item.foodClasses` och `Distribution.menu.foodClasses` (rå ägg, opastöriserad mejeriprodukt, hela nötter, tillagad ris…), regeltyp `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; tre nya utkastpaket.
- **Granskningar:** `RulePack.reviews` registrerar yrke, organisation, datum, omfattning och utfall för varje granskning; `status: reviewed` kräver en godkänd granskning.
- **Påverkan:** `ImpactSummary` med nio mått, där varje mått har en `method` (measured, modelled, assumed, not recorded), beräknat av `tools/humanitarian_check.py --summary`.
- **Tid för anspråk:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` så att räddade kilogram räknas en gång.
- **Programtyper** på `Manifest`.

## 1. Syfte

En liten, strikt, personuppgiftsfri del av Cookwala för organisationer som matar människor:
food banks, community kitchens, school-meal programs, relief programs, donors (grocers,
restaurants, farms, caterers), transporters och cold stores. Den täcker fyra jobb:

1. **Erbjuder surplus food** och gör anspråk på den, snabbt och rättvist.
2. **Registrerar varje handover** av förvaltarskap, med en temperaturkontroll (cold-chain check).
3. **Rapporterar vad som serverades** endast som aggregerade antal.
4. **Kontrollerar menyer och handovers** mot maskinläsbara regler för nutrition och livsmedelssäkerhet.

**Det fungerar utan robotar, appar eller internet.** Nivåerna H0 och H1 körs på kalkylblad, SMS
och enkla telefoner. Robotar, hubs och agenter är valfria konsumenter av samma dokument.

## 2. Principer

- **Do no harm.** Samla inte in något som kan identifiera, lokalisera eller profilera en person eller
  household. I känsliga miljöer utgör data om förmånstagare en skyddsrisk.
- **Humanitarian principles** (humanitet, neutralitet, opartiskhet, oberoende): ingen
  kommersiell varumärkesprofilering på bistånd, och ingen användning av data för marknadsföring.
- **Strict and small.** Varje objekt avvisar okända fält (förutom `x-` extensions),
  så stavfel och extra personliga fält misslyckas vid validering.
- **Exact units:** kilogram, grader Celsius, absoluta toleranser, och pengar som decimalsträngar.
- **Local rules win.** Rule packs kan ersättas av nationell livsmedelssäkerhetslag och donationslag.
- **Open:** royalty-fri specifikation, open-source verktyg. Profilen är utformad för att uppfylla
  Digital Public Goods Standard och Principles for Digital Development.

## 3. Conformance-nivåer

| Nivå | Vad en deltagare gör | Behov |
|---|---|---|
| **H0 — Papper & SMS** | Registrerar erbjudanden, överlämningar och distributioner i CSV-mallarna (med HXL hashtag-rader) eller via SMS (avsnitt 8.3) | Ett kalkylblad eller en enkel telefon |
| **H1 — Rescue** | Utbyter `Offer`, `Claim`, `Handover` och `Distribution` dokument via API:et; följer tillståndsmaskinen (avsnitt 5) | Vilken HTTP-klient som helst |
| **H2 — Säkerhet & nutrition** | Tillämpar en `RulePack` på varje överlämning och meny, och registrerar `findings` | Referenskontrollanten eller en motsvarande |
| **H3 — Interoperabilitet** | Exporterar aggregat till HXL, DHIS2 och den centrala Cookwala `ImpactReport`; använder GS1-identifierare | Integrationsarbete |

En deltagare publicerar en `Manifest` vid `/.well-known/cookwala-humanitarian.json` som
deklarerar dess nivåer, rule packs, endpoints och `personalData: "none"`.

## 4. Dokument

| Dokument | Vem skriver det | Syfte |
|---|---|---|
| `Offer` | Donator | Surplus mat tillgänglig för avhämtning: artiklar (kg, lagring, datummarkeringar, allergener), tidsfönster, plats, temperaturer |
| `Claim` | Food bank, kök, program | Gör anspråk på allt eller delar av ett erbjudande, med en hämtningstid och fordonstyp |
| `Handover` | Mottagare av förvaring | En per etapp: temperaturer, kg accepterade eller avvisade med en anledningkod, samt regelresultat |
| `Distribution` | Kök, food bank, skola | Aggregerade måltider och personer som serverats på en plats under en dag; valfria näringsämnen och kostnader för meny |
| `RulePack` | Program eller myndighet | Versionshanterade regler för nutrition och livsmedelssäkerhet (avsnitt 6) |
| `Manifest` | Varje deltagare | Kapabiliteter och dataskyddserklaring |

De centrala Cookwala relief-dokumenten (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` i `relief.schema.json`) förblir tillgängliga för planering. Denna profil hanterar
det operativa flödet.

## 5. Livscykel för erbjudande

| Från | Tillåtna nästa tillstånd |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (anspråket löpte ut), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | inga (slutgiltiga) |

**Regler för tillståndsändringar:**

- Varje ändring ökar `version`. Skribenter skickar `If-Match: <version>`; en avvikelse returnerar
  **409**, och skribenten läser om och försöker igen.
- En olaglig övergång returnerar **409** med de tillåtna övergångarna.
- Erbjudanden flyttas till `expired` automatiskt vid `window.to`.
- Krav löper ut vid `pickupBy` plus en graceperiod som programmet sätter (standard 30 minutes).

**Rättvis anspråksställning.** Som standard gäller först till kvarn inom en prioritetsnivå som programmet fastställer:
till exempel kök som serverar barn först, sedan andra kök, sedan food banks. Nivåer och
eventuella rotationsregler måste publiceras i programmets `Manifest` eller på webbplatsen.

## 6. Regelpaket för livsmedelssäkerhet och nutrition

En `RulePack` innehåller regler av sex slag:

- `temperature`: kyld ≤ 5 °C, varmhållen ≥ 60 °C, fryst ≤ −18 °C;
- `time`: tillagad mat utanför temperaturkontroll i högst 2 h;
- `date_mark`: bäst före-datum varnar, sista förbrukningsdag blockerar;
- `allergen`: odeklarerade allergener blockerar;
- `nutrient`: mängder per person-dag eller per måltid;
- `energy_share`: andel energi från fria sockerarter, fett, mättat fett, transfett eller protein.

Varje regel är antingen `block` (acceptera eller servera inte) eller `warn` (tillåten, registrerad som en finding).

Standardpaketet `basic-nutrition-food-safety@0.1.0` är ett **utkast härlett från offentlig vägledning**: WHO:s
vägledning om healthy-diet, sodium, sugars och fats, WHO:s Five Keys to Safer Food, Codex
labelling och frozen-food codes, samt Spheres siffror för minimum ration planning. Det är
förenklat, inte medicinsk rådgivning, exkluderar spädbarnsmat och terapeutisk matning, och måste granskas
av kvalificerad personal. Program bör kopiera och anpassa det, ställa in `jurisdiction`, och registrera vem
som granskade det i `reviewedBy`.

Mottagare på nivå H2 kör paketet vid varje överlämning och på varje meny, och registrerar rule ids i `findings`. Referenskontrollanten rapporterar var deklarerade och beräknade fynd skiljer sig åt.

## 7. Dataskydd

**Profilen innehåller inga personuppgifter. Dokument FÅR INTE innehålla:**

- namn, telefonnummer, e-postadresser eller nationella, flykting- eller biometriska identifierare för någon person;
- poster på hushållsnivå, eller platser för hem eller individer;
- hälsa, funktionsnedsättning, religion eller nationalitet för någon person.

**Vad det istället bär:**

- **Endast organisationer.** Varje part är en organisation identifierad av `did:web`, ett GS1
  Global Location Number (GLN) eller ett registry id. Personer visas endast som roller
  (`checkedBy: "trained_staff"`).
- **Endast aggregat.** `Distribution.people` innehåller antal per grupp, och varje antal under 10
  rapporteras som `"<10"`.
- **Endast platser.** En `Site` är en organisations lokaler eller ett administrativt område
  (OCHA P-codes), aldrig ett household.
- **Korta anteckningar.** Fritext är begränsad till operativa anteckningar på 280 tecken och får inte
  innehålla personuppgifter. Implementeringar bör skanna anteckningar efter telefonnummer och id:n
  innan de lagras.

**Retention och audit:**

- **Retention:** varje deltagare deklarerar `retentionDays` i sin `Manifest` och raderar
  dokument efter det.
- **Audit (valfritt, `hash_only`):** en sequencer per program (normalt food bank eller
  programoperatör) lägger till SHA-256-hashen för varje dokuments RFC 8785 canonical JSON.
  Innehåll lagras separat och förblir raderbara. En partnerorganisation
  kontrasignerar en checkpoint varje dag, så att historiken inte kan skrivas om i tysthet. En enskild
  sequencer undviker forks i kedjan.
- **Hosting** bör ske i landet där lagen eller programmet kräver det.

## 8. Transport

### 8.1 API (nivå H1)

| Metod | Sökväg | Anteckningar |
|---|---|---|
| `POST` | `/offers` | Skapar ett erbjudande (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Öppna erbjudanden nära en mottagare |
| `POST` | `/offers/{id}/claims` | Gör anspråk på ett erbjudande; `If-Match` krävs; 409 när det redan är anspråkt |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` krävs |
| `POST` | `/handovers` | Registrerar en överlämning |
| `POST` | `/distributions` | Registrerar en distribution |
| `GET` | `/reports?from=…&to=…` | Aggregerar för en period |

Regel- och transportregler:

- **Idempotency:** varje `POST` bär på en `Idempotency-Key`. Servrar sparar nycklar i minst 24 h och returnerar det ursprungliga svaret vid upprepningar.
- **Authentication:** OAuth 2.1 client credentials, en klient per organisation.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  levereras minst en gång, med ett event `id` för deduplicering och ett sekvensnummer per erbjudande för ordning.

### 8.2 Kalkylblad (nivå H0)

Använd CSV-mallarna i `profiles/humanitarian/templates/`. Deras andra rad innehåller
[HXL](https://hxlstandard.org) hashtags, så att humanitära datavärktyg kan läsa dem direkt.

### 8.3 SMS (nivå H0)

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

Grammatiken implementeras i `tools/cookwala_ref.py` (`parse_sms`) och testas av
`conformance/profiles/sms.json`. Nyckelord är på engelska; arabisk-indiska (٠-٩) och persiska (۰-۹)
siffror accepteras där en siffra finns, så ett telefonuppsättning med något av tangentborden fungerar.

Lagringskoder: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Datummarkeringar: `UB` use-by,
`BB` best-before, `HV` harvested, som `DDMM`. Avvisningsorsakskoder: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; alla andra ord registreras som `other`. `HELP`-svaret MÅSTE vara ett exempel per kommando, ren ASCII, under 160 tecken.

En gateway MÅSTE tillämpa dessa kontroller innan den skriver ett dokument (`sms_storage_findings` i
referensen; ids är block findings):

| Fynd | När |
|---|---|
| `safety.temp_not_recorded` | en `HAND` på en kyld, fryst eller varmhållen linje har inget `T`-värde: svara genom att be om det, skriv ingenting |
| `safety.hot_hold_min` | ett `OFFER` med förvaring `H` under 60 °C: vägra att lista det |
| `safety.storage_class_mismatch` | artikelorden antyder mejeri, kött, fågel, fisk, ägg eller tillagad mat och förvaring är `A`: vägra att lista det |
| `safety.chilled_max`, `safety.frozen_max` | avläsningar över 5 °C eller över −18 °C vid erbjudande eller överlämning |

Erbjudanden av varmhållen mat avslutas efter två timmar (en timme för tillagad ris); en gateway lagrar aldrig en placeholder-avläsning. Gatewayen mappar avsändarens registrerade nummer till en organisation, aldrig till en person i dokumenten.

## 9. Interoperabilitet

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (produkter); `Site.gln` och `OrgId` `gln:` (platser) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Aggregerade datavärden per plats och period från `Distribution` (måltider, personer per grupp, kg, incidenter) |
| WFP SCOPE och andra förmånstagarsystem | **Endast aggregat.** Inga förmånstagarposter går in i eller ut ur denna profil |
| Food-rescue appar | Adaptrar mappar deras listningar till `Offer` och deras upphämtningar till `Claim` och `Handover` |
| Core Cookwala | `Item.ingredientId` och `menu.recipes` länkar till receptindex; `relief.ImpactReport` summerar `Distribution`s |

## 10. Pilot-mått (definierade så att platser kan jämföras)

Beräknat till en `ImpactSummary` av `python tools/humanitarian_check.py --summary DIR`. Hur en pilot körs och bedöms: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrik | Definition |
|---|---|
| Kg räddat | Summan av `Handover.kgAccepted` på första etappen från donatorer |
| Claim rate | Erbjudanden som når `claimed` ÷ skapade erbjudanden |
| Tid till claim | Medianminuter från skapandet av `Offer` till tillståndet `claimed` |
| Avvisning per anledning | Summan av `kgRejected` per `reason` |
| Serverade måltider | Summan av `Distribution.meals` |
| Nutrition pass rate | Distributioner med menyer och inga `nutrition.*` fynd ÷ distributioner med menyer |
| Kostnad per måltid | (mat + transport + personal + energi) ÷ måltider |
| Volontärminuter per 100 kg | `volunteerMinutes` ÷ (kg använda ÷ 100) |
| Säkerhet | Antal `safety.*` blockfynd, och `safetyIncidents` |

## 11. Säkerhet

- **Signaturer är valfria vid H1** och krävs för granskning mellan organisationer vid H3
  (EdDSA, nycklar publicerade vid organisationens `did:web`).
- **Anteckningar och namn i dokument är otillförlitlig data.** Programvara och AI-agenter får aldrig
  behandla dem som instruktioner.
- **Rule packs är versionshanterade och låsta** (`id@version`) i varje fynd, så att resultat är
  reproducerbara.

## 12. Avsiktligt utelämnad

- Registrering av förmånstagare, behörighet och målgrupp (dessa tillhör programmets egna
  skyddade system).
- Betalningar: Cookwala flyttar aldrig pengar.
- Recept och robotexekvering (kärnspecifikationen). Profilen namnger endast recept och rapporterar
  näringsämnen.
- Medicinsk och terapeutisk nutrition.

## 13. Hur man granskar

Vänligen öppna issues på [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
med etiketten `humanitarian`. Dessa recensioner är de mest användbara:

- livsmedelssäkerhetspersonal som kontrollerar rule pack och avvisningsorsaker;
- food-bank-operatörer som kontrollerar livscykeln och SMS-flödet;
- dataskyddsombud som kontrollerar avsnitt 7.

