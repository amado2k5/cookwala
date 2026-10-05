<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Dit is het normatieve deel van Cookwala. MUST, SHOULD en MAY volgen RFC 2119. Alles wat hier niet wordt vermeld is een optioneel **profile** (sectie 10).

Een apparaat zou Core in ongeveer een week moeten kunnen implementeren. Core zegt **wat er gemaakt moet worden, wanneer het klaar is en wat er nooit mag gebeuren**. Het zegt niet hoe een robot beweegt.

## 1. Conformance klassen

| Class | Moet implementeren |
|---|---|
| **Recipe publisher** | Geldige `recipe.schema.json` documenten; temperaturen binnen operation envelopes; een hash en een signature |
| **Executor** (robot, appliance of hub) | De Core API (`api/core.openapi.yaml`); operation envelopes en sensor ladders; lokale veiligheidslimieten; refusal in plaats van gissen; het execution log |
| **Catalog** | Ondertekende recepten, `/.well-known/cookwala.json` met key records, de recall feed, incident intake |
| **Agent** (AI of software die handelt voor een persoon) | Handelt alleen onder een `AgentMandate`; behandelt documenttekst als data; vraagt het aan de principal voor iets in `confirmBefore` |
| **Verifier** | Hashes, signatures, key validity en revocation, disclosures, event chains en checkpoints |

Het claimen van een klasse betekent het passeren van de conformance vectoren (`conformance/`, uitvoeren met
`tools/run_conformance.py`).

## 2. Kern-documenten

| Document | Schema |
|---|---|
| Recept | `recipe.schema.json` |
| Apparaatcapaciteiten | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Gedeelde types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabulaires: operations, units and heat levels, incidents | `vocab/*.json` |

Alle schema's zijn **strict**: onbekende velden worden geweigerd, behalve `x-<vendor>-…` extensies.
Lezers negeren `x-` velden die ze niet begrijpen. `tools/bundle_schemas.py` produceert een enkele
bundle zodat apparaten offline valideren. Implementaties mogen GEEN schema's ophalen tijdens runtime.

## 3. Wat operaties betekenen

- **Envelopes.** Elke hittegebaseerde of gevaarlijke operatie in `vocab/ops.json` heeft een `envelope`.
  Het specificeert:
  - het medium (water, olie, lucht, pan-oppervlak, product…);
  - de temperatuurband in °C (en druk, voor druk koken);
  - agitatie, deksel, aandachtsniveau en of de stap onbeheerd mag worden uitgevoerd;
  - gevaren;
  - een testmethode.

Voorbeeld: `cw.op.simmer` = water-gebaseerde vloeistof bij 85–96 °C; `cw.op.deep_fry` = olie bij 160–190 °C.
- **Targets binnen envelopes.** Een recept target (`params.tempC` of een `target` op de sensor van het medium) MOET binnen de envelope liggen. De validator wijst recepten af die dit schenden.
- **Executors houden het medium binnen de envelope.** Als het recept een nauwer target geeft, houden zij het ook binnen dat target, zodra het voor het eerst is bereikt.
- **Hoogte.** Water- en stoombanden verschuiven met −1 °C per 300 m keukelhoogte.
- **Heat levels** (`very_low` … `max`) hebben één gedeelde betekenis: een pan-oppervlakteband in °C, gedefinieerd in `vocab/units.json`.
- **Sensor ladder.** Elke envelope vermeldt manieren om de stap te verifiëren, bij voorkeur eerst: een specifieke sensor, dan `model` (een gelogde schatting), dan `time`, dan `human`.
  - De executor gebruikt de eerste trede die hij kan voldoen en registreert dit in `verifiedBy`.
  - Als hij aan **geen** trede kan voldoen, MOET hij de stap weigeren (`missing_sensor_no_fallback`).
  - Operaties die constante aandacht vereisen en niet onbeheerd mogen draaien (sauteren, aanbraden, bakken, inkoken, karameliseren…) vallen nooit terug op alleen tijd: hun laatste trede is een persoon die toezicht houdt.
  - Deep frying heeft geen fallback: geen olie-temperatuursensor betekent geen deep frying.
  - Een `Condition` kan dit verfijnen met `onSensorMissing`.
- **Refusal, niet gokken.** Een executor die niet kan voldoen aan de envelope, ladder, apparatuur of veiligheidslimieten van een stap, MOET `refused` antwoorden met een reden voordat hij begint.

## 4. Getallen en eenheden

- **Temperaturen zijn °C op de draad.** Displays kunnen converteren.
- **Toleranties.**
  - `tolerance` is relatief en is alleen toegestaan op ratio-schaal eenheden.
  - `toleranceAbs` is absoluut in de eenheid van de waarde, en is de enige tolerantie die is toegestaan op °C.
  - `Target.tolerance` is absoluut.
- **Keukeneenheden hebben exacte metrische waarden:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ massa heeft een dichtheid nodig** (`Quantity.densityGPerMl`, of de ingrediënten-vocabulaire);
  zonder een dichtheid is het een fout, nooit een gok.
- **Geld is een decimale string** (`"12.70"`) met een ISO 4217 valuta, nooit een float.

## 5. Integriteit en vertrouwen

- **Hash.** `sha256:` plus de hex digest van de RFC 8785 canonical JSON van het document,
  zonder de `hash` en `signature` velden. De referentie canonicalizer reproduceert het RFC
  8785 voorbeeld exact.
- **Signature.** Ed25519 (`EdDSA`) over de ASCII hash string. `ES256` is toegestaan voor P-256
  hardware keys. `kid` benoemt een `KeyRecord`.
- **Keys.** Een `KeyRecord` geeft de publieke sleutel, de eigenaar, een geldigheidsvenster en `revokedAt`.
  Een handtekening waarvan de `signedAt` valt na intrekking, of buiten het geldigheidsvenster, is
  ongeldig.
  - Catalogi publiceren hun keys in `/.well-known/cookwala.json`.
  - Organisaties en personen publiceren de hunne in did:web documenten.
  - Apparaten publiceren de hunne in hun capabilities document.
  - Verifiers cachen key records voor offline gebruik.
- **Selective disclosure.** Een ondertekend document kan een `Disclosure` digest bevatten,
  `sha256(JCS([salt, value]))`, in plaats van een gevoelige waarde. De houder onthult de salt en
  value alleen aan partijen die gemachtigd zijn deze te zien, en de signature verifieert nog steeds.
- **Event logs** (Mission profile):
  - Eén sequencer per log wijst `seq` en `prev` toe, zodat de keten nooit splitst.
  - Checkpoints worden ondertekend door de sequencer en mede-ondertekend door witnesses, die een
    transparency service zoals IETF SCITT kunnen bevatten. Een herschrijving na een witnessed checkpoint is
    detecteerbaar.
  - In `hash_only` modus bevinden payloads zich in verwijderbare opslag en houdt de log alleen hun hashes bij.

## 6. Veiligheid en agentregels (normatief)

1. **Veiligheid is lokaal.** Executors dwingen een `SafetyLimits` pack af op het apparaat.
   - Geen enkel recept, agent, remote bericht, extensie of modus kan een limiet verhogen of uitschakelen.
   - Een striktere limiet wint altijd.
   - `profiles/core/safety-limits.default.json` is een conceptueel startpunt dat fabrikanten
     aanpassen op basis van hun eigen safety case.
2. **Lokale stop.** Een stopcontrole op het apparaat stopt beweging binnen 0.5 s en schakelt hitte uit binnen
   1 s, met of zonder netwerk. `POST …/stop` wordt nooit geweigerd voor autorisatie zodra de
   aanroeper de executor kan bereiken.
3. **Events rapporteren; ze beschermen nooit.** `cookwalalatency: local_safety` events rapporteren wat een
   apparaat al heeft gedaan. Geen enkele veiligheidsfunctie mag afhankelijk zijn van het aankomen van een event.
4. **Onbetrouwbare tekst.** Elk vrij tekstveld (geannoteerd als `x-cookwala-untrusted`) is data en nooit
   een instructie, zowel voor software als voor AI agents. Pogingen om via tekst instructies te geven worden
   genegeerd en gelogd (`cw.incident.untrusted_instruction`).
5. **Agents handelen onder een mandate.** Een verzoek verzonden door een agent bevat een `AgentMandate` ondertekend
   door de principal: scopes, uitgavenlimieten, toegestane providers, vervaldatum en acties die
   bevestiging vereisen.
   - `irreversible` en `safety_override` vereisen altijd bevestiging, ongeacht wat de mandate zegt.
   - Executors weigeren verzoeken buiten de mandate (`mandate_scope`).
6. **Onbeheerde operaties hebben een persoon nodig.** Operaties waarvan de envelope `unattended: false` aangeeft,
   vereisen een verantwoordelijke persoon die aanwezig is, of binnen één minuut bereikbaar is.
7. **Allergeen blokkades weigeren.** Elk geblokkeerd allergeen in het recept of de inventaris weigert het
   verzoek; er zijn geen substituties mogelijk rondom een blokkade.
8. **Recalls.** Catalogussen publiceren ondertekende recalls via `GET /v1/recalls`. Executors pollen wanneer ze online zijn
   en weigeren teruggeroepen revisies. `block_and_stop_running` stopt ook lopende executies veilig.
9. **Incident reports** zijn anoniem (`IncidentReport`: alleen datum, geen namen of ids) en
   ingediend bij catalogussen, zodat elke fabrikant leert van elke near miss.

## 7. Execution lifecycle en API

- **API:** `api/core.openapi.yaml`. De endpoints zijn:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - catalog zijde: `GET /v1/recalls`, `POST /v1/incidents`.
- **States:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` en `stopping` → `stopped` onderweg;
  - `refused` en `failed` zijn definitief.
  - De volledige transitietabel staat in `core.schema.json#/$defs/ExecutionState` en de
    conformance vectoren.
- **Request rules:**
  - Elke POST bevat een `Idempotency-Key`.
  - Wijzigingen aan een bestaande execution bevatten `If-Match: <seq>`; een mismatch retourneert 412.
  - Stop vereist geen If-Match.
- **Events:**
  - Levering is ten minste één keer.
  - CloudEvents `id` is de deduplicatie sleutel.
  - `cookwalaseq` ordent events per subject en komt overeen met de status `seq`.
  - Devices zenden `cookwala.device.heartbeat` uit, zodat een hub een verloren device kan detecteren en overdragen.

## 8. Privacy

- **Execution logs bevatten geen persoonlijke gegevens** (`privacy.personalData: "none"`).
- **Ze verlaten het apparaat alleen met opt-in toestemming** (`consent.dataset`: `none` standaard,
  `research_only`, of `open`). Toestemming kan worden ingetrokken.
- **Open datasets maken tijden minder nauwkeurig tot op de dag.**
- **Huishoudelijke, gezondheids- en religieuze gegevens blijven thuis** tenzij de persoon anders kiest.
  Wanneer ze moeten worden verzonden, gebeurt dit als selectieve openbaarmakingen.
- **Het Humanitarian Profile** bevat helemaal geen persoonlijke gegevens.

## 9. Versiebeheer en extensies

- **Core-versies zijn `0.2.x`.**
  - Readers accepteren elke patch van hun minor-versie.
  - Ze weigeren andere minors met `unsupported_version`.
  - Ze negeren onbekende `x-` velden.
- **Nieuwe operaties, eenheden, sensoren en incidenttypes** worden toegevoegd aan vocabularies zonder een
  versie-wijziging.
- **Het wijzigen van de betekenis van een operatie is een nieuwe id;** de oude wordt gemarkeerd als `deprecated` met
  `replacedBy`.
- **Profiles** verseren onafhankelijk en verklaren de Core-versie die ze nodig hebben.

## 10. Profielen en hun status

| Profiel | Status | Notities |
|---|---|---|
| Core (dit document) | **draft, normatief** | Doel voor de eerste device implementaties |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Geen persoonlijke gegevens; werkt via SMS en CSV; surplus to plate, impact summaries, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first household facts; alleen derived constraints worden verzonden (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Bewezen namespaces, exacte versies, tombstones; organisaties op aanvraag (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Ondertekende rapporten achter elke conformance claim (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds en relays; verifiëren tegen de issuer (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurants, community, school, disaster en robot keukens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Geaggregeerde, vertraagde, class-level vraag en aanbod signalen; afhankelijk van mededingingsrechtelijke toetsing (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projectie, transities in `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Vereist een mededingingsrechtelijke toetsing voor productiegebruik |
| Relief planning (`relief.schema.json`) | experimental | Operationele flow verplaatst naar het Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | De OpenAPI Core API is de referentie surface |

Een profiel wordt stabiel wanneer twee onafhankelijke implementaties zijn geslaagd voor de conformance vectoren
en het echte gebruikers heeft.

## 11. Tools

| Tool | Wat het doet |
|---|---|
| `tools/validate_specs.py` | Controleert schema's, voorbeelden, receptsemantiek (envelopes, op parameters, geen template placeholders), striktheid, en of API-referenties worden opgelost |
| `tools/run_conformance.py` | Voert `conformance/*.json` en `conformance/profiles/*.json` uit, en schrijft een ConformanceReport met `--report`: hashing (inclusief het RFC 8785 voorbeeld), handtekeningen (inclusief een RFC 8032 sleutel), intrekking, openbaarmaking, event chains en checkpoints, eenheden, envelopes, sensor ladders, state machines |
| `tools/cookwala_ref.py` | Referentielibary en CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regenereert de vectoren (bekijk de diff) |
| `tools/bundle_schemas.py` | Offline schema bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack checker en impact samenvattingen |
| `tools/make_profile_vectors.py` | Regenereert de profile vectoren in `conformance/profiles/` |

## 12. Wijzigingen vanaf 0.1

| Gebied | 0.1 | 0.2 |
|---|---|---|
| Schemas | Geaccepteerde onbekende velden | Strikt, met `x-` extensies |
| Temperaturen | °C of °F, relatieve tolerantie toegestaan | Alleen °C; absolute tolerantie |
| Geld | Getal | Decimale string |
| Operaties | Proza-definities | Fysieke envelopes, sensor ladders, hitte-niveaus, testvectoren |
| Handtekeningen | Vast EdDSA, keys zonder lifecycle | EdDSA of ES256, KeyRecords met geldigheid en revocation |
| Missies | Eén mutabel document, ledger binnenin | Event log + projectie, enkele sequencer, witnessed checkpoints, hash-only mode |
| Agenten | Mandate alleen binnen Missies | `AgentMandate` in common; vereist voor agent requests |
| Veiligheid | Verklaard in recepten | Ook lokaal afgedwongen via SafetyLimits; recalls; incident reports |
| Data | Geen dataset model | Toestemming, personal-data-free ExecutionLog |
| Conformance | Alleen schema validatie | 106 vectoren (44 Core, 62 profile) plus een reference implementation |

Om een 0.1 document te migreren: zet °F om naar °C; vervang relatieve toleranties op temperaturen door `toleranceAbs`; verander geldbedragen in decimale strings; verwijder of hernoem onbekende velden naar `x-` velden.

