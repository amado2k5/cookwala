<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Detta är den normativa delen av Cookwala. MUST, SHOULD och MAY följer RFC 2119. Allt som inte listas här är en valfri **profile** (avsnitt 10).

En enhet bör kunna implementera Core på ungefär en vecka. Core säger **vad som ska göras, när det är klart och vad som aldrig får hända**. Den säger inte hur en robot rör sig.

## 1. Conformance-klasser

| Klass | Måste implementera |
|---|---|
| **Recipe publisher** | Giltiga `recipe.schema.json` dokument; temperaturer inom operation envelopes; en hash och en signatur |
| **Executor** (robot, appliance eller hub) | Core API (`api/core.openapi.yaml`); operation envelopes och sensor ladders; lokala säkerhetsgränser; refusal istället för gissningar; execution log |
| **Catalog** | Signerade recept, `/.well-known/cookwala.json` med nyckelposter, recall-flödet, incidentintag |
| **Agent** (AI eller programvara som agerar för en person) | Aggerar endast under en `AgentMandate`; behandlar dokumenttext som data; frågar huvudmannen innan något i `confirmBefore` |
| **Verifier** | Haschar, signaturer, nyckelgiltighet och återkallelse, upplysningar, händelsekedjor och kontrollpunkter |

Att göra anspråk på en klass innebär att passera dess conformance-vektorer (`conformance/`, kör med
`tools/run_conformance.py`).

## 2. Kärndokument

| Dokument | Schema |
|---|---|
| Recept | `recipe.schema.json` |
| Enhetens förmågor | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Delade typer (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Händelser | `event.schema.json` (CloudEvents) |
| Vokabulärer: operationer, enheter och värmenivåer, incidenter | `vocab/*.json` |

Alla scheman är **strict**: okända fält avvisas, förutom `x-<vendor>-…` utökningar.
Läsare ignorerar `x-` fält som de inte förstår. `tools/bundle_schemas.py` producerar ett enda
bundle så att enheter validerar offline. Implementeringar FÅR INTE hämta scheman vid körning.

## 3. Vad operationer betyder

- **Envelopes.** Varje värmebaserad eller farlig operation i `vocab/ops.json` har en `envelope`.
  Den specificerar:
  - mediet (vatten, olja, luft, panyta, produkt…);
  - dess temperaturintervall i °C (och tryck, för tryckkokning);
  - omrörning, lock, uppmärksamhetsnivå och om steget får köras oövervakat;
  - faror;
  - en testmetod.

`cw.op.simmer` = vattenbaserad vätska vid 85–96 °C; `cw.op.deep_fry` = olja vid 160–190 °C.
- **Mål inom envelopes.** Ett receptmål (`params.tempC` eller ett `target` på mediets
  sensor) MÅSTE ligga inom envelopen. Valideraren avvisar recept som bryter mot detta.
- **Executors håller mediet inom envelopen.** Om receptet anger ett smalare mål,
  håller de det även inom det, när det väl har uppnåtts för första gången.
- **Höjd.** Vatten- och ångband förskjuts med −1 °C per 300 m kökshöjd.
- **Värmenivåer** (`very_low` … `max`) har en gemensam betydelse: ett band för panytan i °C,
  definierat i `vocab/units.json`.
- **Sensor ladder.** Varje envelope listar sätt att verifiera steget, helst i denna ordning: en specifik sensor,
  sedan `model` (en loggad uppskattning), sedan `time`, sedan `human`.
  - Executorn använder det första steget den kan uppfylla och registrerar det i `verifiedBy`.
  - Om den inte kan uppfylla **något** steg, MÅSTE den neka steget (`missing_sensor_no_fallback`).
  - Operationer som kräver konstant uppmärksamhet och som inte får köras utan tillsyn (fräsa, bryna,
    steka, reducera, karamellisera…) faller aldrig tillbaka på enbart tid: deras sista steg är en person
    som tittar på.
  - Deep frying har ingen fallback: ingen oljetemperatursensor innebär ingen deep frying.
  - En `Condition` kan smalna av detta med `onSensorMissing`.
- **Refusal, inte gissningar.** En executor som inte kan möta ett stegs envelope, ladder, utrustning
  eller säkerhetsgränser MÅSTE svara `refused` med en anledning innan start.

## 4. Siffror och enheter

- **Temperaturer är °C på ledningen.** Visningar kan konverteras.
- **Toleranser.**
  - `tolerance` är relativ och tillåts endast på enheter med kvotintervall.
  - `toleranceAbs` är absolut i värdets enhet, och är den enda toleransen som tillåts på °C.
  - `Target.tolerance` är absolut.
- **Köksenheter har exakta metriska värden:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volym ↔ massa behöver en densitet** (`Quantity.densityGPerMl`, eller ingrediensvokabulären);
  utan en sådan är det ett fel, aldrig en gissning.
- **Pengar är en decimalsträng** (`"12.70"`) med en ISO 4217-valuta, aldrig en float.

## 5. Integritet och tillit

- **Hash.** `sha256:` plus hex-digestet av RFC 8785 canonical JSON för dokumentet,
  utan dess `hash` och `signature` fält. Den refererade canonicalizern återskapar RFC
  8785-exemplet exakt.
- **Signature.** Ed25519 (`EdDSA`) över ASCII-hash-strängen. `ES256` är tillåtet för P-256
  hårdvarunycklar. `kid` namnger en `KeyRecord`.
- **Keys.** En `KeyRecord` anger den publika nyckeln, dess ägare, ett giltighetsfönster och `revokedAt`.
  En signatur vars `signedAt` faller efter återkallelse, eller utanför giltighetsfönstret, är
  ogiltig.
  - Kataloger publicerar sina nycklar i `/.well-known/cookwala.json`.
  - Organisationer och personer publicerar sina i did:web-dokument.
  - Enheter publicerar sina i sitt capabilities-dokument.
  - Verifierare cachar key records för offline-användning.
- **Selective disclosure.** Ett signerat dokument kan innehålla en `Disclosure` digest,
  `sha256(JCS([salt, value]))`, istället för ett känsligt värde. Innehavaren avslöjar saltet och
  värdet endast för parter som tillåts se dem, och signaturen verifieras fortfarande.
- **Event logs** (Mission profile):
  - En sequencer per log tilldelar `seq` och `prev`, så att kedjan aldrig förgrenas.
  - Checkpoints signeras av sequencern och mottecknas av vittnen, som kan inkludera
    en transparency service såsom IETF SCITT. En omskrivning efter en vittnad checkpoint är
    detekterbar.
  - I `hash_only` mode lever payloads i raderbart lagringsutrymme och loggen behåller endast deras hashes.

## 6. Säkerhets- och agentregler (normativa)

1. **Säkerhet är lokal.** Utförare (Executors) tillämpar ett `SafetyLimits` pack på enheten.
   - Ingen recept, agent, fjärrmeddelande, tillägg eller driftsläge kan höja eller inaktivera en gräns.
   - En striktare gräns vinner alltid.
   - `profiles/core/safety-limits.default.json` är en utkastmässig startpunkt som tillverkare av enheter
     stramar åt utifrån sitt eget säkerhetsfall.
2. **Lokalt stopp.** En stoppkontroll på enheten stoppar rörelse inom 0.5 s och bryter värme inom
   1 s, med eller utan nätverk. `POST …/stop` nekas aldrig för auktorisering när
   anroparen kan nå utföraren.
3. **Händelser rapporterar; de skyddar aldrig.** `cookwalalatency: local_safety` händelser rapporterar vad en
   enhet redan har gjort. Ingen säkerhetsfunktion får bero på att en händelse anländer.
4. **Otrovärdig text.** Varje fritextfält (annoterat `x-cookwala-untrusted`) är data och aldrig
   en instruktion, varken för programvara eller AI-agenter. Försök att instruera via text
   ignoreras och loggas (`cw.incident.untrusted_instruction`).
5. **Agenter agerar under ett mandate.** En begäran skickad av en agent bär med sig ett `AgentMandate` signerat
   av huvudmannen: omfattning, utgiftsstak, tillåtna leverantörer, utgångsdatum och åtgärder som kräver
   bekräftelse.
   - `irreversible` och `safety_override` kräver alltid bekräftelse, oavsett vad mandatet säger.
   - Utförare nekar begäranden utanför mandatet (`mandate_scope`).
6. **Oövervakade operationer behöver en person.** Operationer vars envelope säger `unattended: false`
   behöver en ansvarig person närvarande, eller nåbar inom en minut.
7. **Allergenblock nekar.** Varje blockerad allergen i receptet eller i lagret nekar
   begäran; det finns inga substitutioner som kringgår ett block.
8. **Recalls.** Kataloger publicerar signerade recalls vid `GET /v1/recalls`. Utförare pollar när de är online
   och nekar återkallade revisioner. `block_and_stop_running` stoppar även pågående körningar på ett säkert sätt.
9. **Incidentrapporter** är anonyma (`IncidentReport`: endast datum, inga namn eller ids) och
   skickas till kataloger så att varje tillverkare lär sig av varje tillbud.

## 7. Execution lifecycle och API

- **API:** `api/core.openapi.yaml`. Dess endpoints är:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - katalog sida: `GET /v1/recalls`, `POST /v1/incidents`.
- **Tillstånd:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` och `stopping` → `stopped` längs vägen;
  - `refused` och `failed` är slutgiltiga.
  - Den fullständiga övergångstabellen finns i `core.schema.json#/$defs/ExecutionState` och
    conformance-vektorerna.
- **Begäransregler:**
  - Varje POST bär på en `Idempotency-Key`.
  - Ändringar i en befintlig execution bär på `If-Match: <seq>`; en mismatch returnerar 412.
  - Stop kräver inte If-Match.
- **Händelser:**
  - Leverans sker minst en gång.
  - CloudEvents `id` är dedupliceringsnyckeln.
  - `cookwalaseq` ordnar händelser per subjekt och matchar status `seq`.
  - Enheter sänder `cookwala.device.heartbeat`, så en hub kan upptäcka en förlorad enhet och lämna över.

## 8. Integritet

- **Execution logs innehåller inga personuppgifter** (`privacy.personalData: "none"`).
- **De lämnar endast enheten med opt-in-samtycke** (`consent.dataset`: `none` som standard,
  `research_only`, eller `open`). Samtycke kan återkallas.
- **Öppna dataset grovhugger tider till dagen.**
- **Data om hushåll, hälsa och religion stannar hemma** såvida inte personen väljer annorlunda.
  När det måste transporteras, transporteras det som selektiva upplysningar.
- **The Humanitarian Profile** innehåller inte alls några personuppgifter.

## 9. Versionering och utökningar

- **Kärnversioner är `0.2.x`.**
  - Läsare accepterar vilken patch som helst av sin minor-version.
  - De avvisar andra minor-versioner med `unsupported_version`.
  - De ignorerar okända `x-` fält.
- **Nya operationer, enheter, sensorer och incidenttyper** läggs till i vokabulärer utan en
  versionsändring.
- **Att ändra en operations betydelse är ett nytt id;** den gamla markeras som `deprecated` med
  `replacedBy`.
- **Profiler** versioneras oberoende och deklarerar den Core-version de behöver.

## 10. Profiler och deras status

| Profil | Status | Anteckningar |
|---|---|---|
| Core (detta dokument) | **draft, normative** | Mål för de första enhetsimplementeringarna |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Inga personuppgifter; fungerar via SMS och CSV; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first household facts; endast derived constraints skickas (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Bevisade namespaces, exakta versioner, tombstones; organisationer på begäran (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Signerade rapporter bakom varje conformance claim (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds och relays; verifiera mot utfärdaren (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restauranger, community, skola, katastrof- och robotkök (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Aggregerade, fördröjda, efterfråge- och utbudssignaler på klassnivå; begränsas av konkurrensrättslig granskning (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projection, transitions i `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Kräver en konkurrensrättslig granskning före produktionsanvändning |
| Relief planning (`relief.schema.json`) | experimental | Operational flow har flyttats till Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | OpenAPI Core API är referensytan |

En profil blir stabil när två oberoende implementationer passerar dess conformance-vektorer
och den har verkliga användare.

## 11. Verktyg

| Verktyg | Vad det gör |
|---|---|
| `tools/validate_specs.py` | Kontrollerar scheman, exempel, receptsemantik (envelopes, op-parametrar, inga template-platshållare), strikthet och att API-referenser kan lösas |
| `tools/run_conformance.py` | Kör `conformance/*.json` och `conformance/profiles/*.json`, och skriver en ConformanceReport med `--report`: hashning (inklusive RFC 8785-exemplet), signaturer (inklusive en RFC 8032-nyckel), återkallelse, utlämnande, händelsekedjor och checkpoints, enheter, envelopes, sensor ladders, tillståndsmaskiner |
| `tools/cookwala_ref.py` | Referensbibliotek och CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regenererar vektorerna (granska diffen) |
| `tools/bundle_schemas.py` | Offline schema-bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack-kontrollant och sammanfattningar av påverkan |
| `tools/make_profile_vectors.py` | Regenererar profilvektorerna i `conformance/profiles/` |

## 12. Ändringar från 0.1

| Område | 0.1 | 0.2 |
|---|---|---|
| Scheman | Accepterar okända fält | Strikt, med `x-` extensions |
| Temperaturer | °C eller °F, relativ tolerans tillåten | Endast °C; absolut tolerans |
| Pengar | Tal | Decimalsträng |
| Operationer | Prosa-definitioner | Fysiska envelopes, sensor ladders, värmenivåer, testvektorer |
| Signaturer | Fixerad EdDSA, nycklar utan livscykel | EdDSA eller ES256, KeyRecords med giltighet och återkallelse |
| Missioner | Ett muterbart dokument, ledger inuti | Event log + projektion, enskild sequencer, vittnade checkpoints, hash-only mode |
| Agenter | Mandate endast inuti Missioner | `AgentMandate` i common; krävs för agentförfrågningar |
| Säkerhet | Deklarerad i recept | Även genomdrivs lokalt via SafetyLimits; recalls; incidentrapporter |
| Data | Ingen dataset-modell | Samtyckt, personuppgiftsfri ExecutionLog |
| Conformance | Endast schema-validering | 106 vektorer (44 Core, 62 profile) plus en referensimplementering |

För att migrera ett 0.1 dokument: konvertera °F till °C; ersätt relativa toleranser för temperaturer med
`toleranceAbs`; omvandla belopp till decimalsträngar; ta bort eller döp om okända fält till
`x-` fält.

