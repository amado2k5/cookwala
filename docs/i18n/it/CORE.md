<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Questa è la parte normativa di Cookwala. MUST, SHOULD e MAY seguono RFC 2119. Tutto ciò che non è elencato qui è un **profile** opzionale (sezione 10).

Un dispositivo dovrebbe essere in grado di implementare Core in circa una settimana. Core dice **cosa fare, quando è fatto e cosa non deve mai accadere**. Non dice come si muove un robot.

## 1. Classi di conformance

| Classe | Deve implementare |
|---|---|
| **Recipe publisher** | Documenti `recipe.schema.json` validi; temperature all'interno di operation envelopes; un hash e una firma |
| **Executor** (robot, appliance o hub) | La Core API (`api/core.openapi.yaml`); operation envelopes e sensor ladders; limiti di sicurezza locali; refusal invece di indovinare; l'execution log |
| **Catalog** | Ricette firmate, `/.well-known/cookwala.json` con record chiave, il recall feed, l'incident intake |
| **Agent** (AI o software che agisce per una persona) | Agisce solo sotto un `AgentMandate`; tratta il testo del documento come dati; chiede al principale prima di qualsiasi cosa in `confirmBefore` |
| **Verifier** | Hash, firme, validità e revoca delle chiavi, disclosures, catene di eventi e checkpoint |

Rivendicare una classe significa superare i suoi vettori di conformance (`conformance/`, eseguito con
`tools/run_conformance.py`).

## 2. Documenti principali

| Documento | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

Tutti gli schemi sono **strict**: i campi sconosciuti vengono rifiutati, ad eccezione delle estensioni `x-<vendor>-…`.
I lettori ignorano i campi `x-` che non comprendono. `tools/bundle_schemas.py` produce un singolo
bundle in modo che i dispositivi possano convalidare offline. Le implementazioni NON DEVONO recuperare gli schemi al run time.

## 3. Cosa significano le operazioni

- **Envelopes.** Ogni operazione basata sul calore o pericolosa in `vocab/ops.json` ha un `envelope`.
  Specifica:
  - il mezzo (acqua, olio, aria, superficie della padella, prodotto…);
  - la sua fascia di temperatura in °C (e la pressione, per la cottura a pressione);
  - agitazione, coperchio, livello di attenzione e se lo step può essere eseguito senza supervisione;
  - pericoli;
  - un metodo di test.

Esempio: `cw.op.simmer` = liquido a base acquosa a 85–96 °C; `cw.op.deep_fry` = olio a 160–190 °C.
- **Target all'interno degli operation envelope.** Un target della ricetta (`params.tempC` o un `target` sul sensore del mezzo) DEVE trovarsi all'interno dell'envelope. Il validatore rifiuta le ricette che violano questo limite.
- **Gli esecutori mantengono il mezzo all'interno dell'operation envelope.** Se la ricetta fornisce un target più ristretto, lo mantengono all'interno anche di quello, una volta raggiunto per la prima volta.
- **Altitudine.** Le fasce di acqua e vapore si spostano di −1 °C ogni 300 m di altitudine della cucina.
- **Livelli di calore** (`very_low` … `max`) hanno un unico significato condiviso: una fascia della superficie della padella in °C, definita in `vocab/units.json`.
- **Sensor ladder.** Ogni envelope elenca i modi per verificare lo step, preferibilmente in questo ordine: un sensore specifico, poi `model` (una stima registrata), poi `time`, poi `human`.
  - L'esecutore utilizza il primo gradino che può soddisfare e lo registra in `verifiedBy`.
  - Se non può soddisfare **alcun** gradino, DEVE rifiutare lo step (`missing_sensor_no_fallback`).
  - Le operazioni che richiedono attenzione costante e che potrebbero non essere eseguite senza supervisione (saltare, rosolare, friggere, ridurre, caramellizzare…) non ricorrono mai al solo tempo: il loro ultimo gradino è una persona che osserva.
  - Il deep frying non ha fallback: nessun sensore di temperatura dell'olio significa nessun deep frying.
  - Una `Condition` può restringere questo aspetto con `onSensorMissing`.
- **Refusal, non supposizione.** Un esecutore che non può rispettare l'envelope, la ladder, l'attrezzatura o i limiti di sicurezza di uno step DEVE rispondere `refused` con una ragione prima di iniziare.

## 4. Numeri e unità

- **Le temperature sono in °C sul wire.** I display possono convertirle.
- **Tolleranze.**
  - `tolerance` è relativa e consentita solo su unità a scala di rapporto.
  - `toleranceAbs` è assoluta nell'unità del valore, ed è l'unica tolleranza consentita su °C.
  - `Target.tolerance` è assoluta.
- **Le unità da cucina hanno valori metrici esatti:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ massa richiede una densità** (`Quantity.densityGPerMl`, o il vocabolario degli ingredienti);
  senza una di esse è un errore, mai una supposizione.
- **Il denaro è una stringa decimale** (`"12.70"`) con una valuta ISO 4217, mai un float.

## 5. Integrità e fiducia

- **Hash.** `sha256:` più l'esadecimale del digest del JSON canonico RFC 8785 del documento,
  senza i suoi campi `hash` e `signature`. Il canonicalizer di riferimento riproduce esattamente
  l'esempio RFC 8785.
- **Signature.** Ed25519 (`EdDSA`) sulla stringa hash ASCII. `ES256` è consentito per chiavi
  hardware P-256. `kid` nomina un `KeyRecord`.
- **Keys.** Un `KeyRecord` fornisce la chiave pubblica, il suo proprietario, una finestra di validità e `revokedAt`.
  Una firma il cui `signedAt` cade dopo la revoca, o al di fuori della finestra di validità, è
  invalida.
  - I cataloghi pubblicano le loro chiavi in `/.well-known/cookwala.json`.
  - Le organizzazioni e le persone pubblicano le proprie in documenti did:web.
  - I dispositivi pubblicano le proprie nel proprio capabilities document.
  - I verificatori mettono in cache i record delle chiavi per l'uso offline.
- **Selective disclosure.** Un documento firmato può contenere un digest `Disclosure`,
  `sha256(JCS([salt, value]))`, invece di un valore sensibile. Il titolare rivela il salt e il
  value solo alle parti autorizzate a vederli, e la firma viene comunque verificata.
- **Event logs** (Mission profile):
  - Un sequencer per ogni log assegna `seq` e `prev`, in modo che la catena non si divida mai.
  - I checkpoint sono firmati dal sequencer e controfirmati dai testimoni, che possono includere
    un servizio di trasparenza come IETF SCITT. Una riscrittura dopo un checkpoint testimoniato è
    rilevabile.
  - In modalità `hash_only`, i payload risiedono in uno storage cancellabile e il log conserva solo i loro hash.

## 6. Sicurezza e regole dell'agente (normative)

1. **La sicurezza è locale.** Gli esecutori applicano un pacchetto `SafetyLimits` sul dispositivo.
   - Nessuna ricetta, agente, messaggio remoto, estensione o modalità operativa può aumentare o disabilitare un limite.
   - Un limite più restrittivo vince sempre.
   - `profiles/core/safety-limits.default.json` è un punto di partenza bozza che i produttori di dispositivi
     restringono in base al proprio caso di sicurezza.
2. **Stop locale.** Un controllo di arresto sul dispositivo ferma il movimento entro 0.5 s e interrompe il calore entro
   1 s, con o senza rete. `POST …/stop` non viene mai rifiutato per autorizzazione una volta che il
   chiamante può raggiungere l'esecutore.
3. **Gli eventi riportano; non proteggono mai.** Gli eventi `cookwalalatency: local_safety` riportano ciò che un
   dispositivo ha già fatto. Nessuna funzione di sicurezza può dipendere dall'arrivo di un evento.
4. **Testo non attendibile.** Ogni campo di testo libero (annotato `x-cookwala-untrusted`) è un dato e mai
   un'istruzione, sia per il software che per gli agenti AI. I tentativi di istruire tramite testo vengono
   ignorati e registrati (`cw.incident.untrusted_instruction`).
5. **Gli agenti agiscono sotto un mandate.** Una richiesta inviata da un agente porta un `AgentMandate` firmato
   dal mandante: ambiti, limiti di spesa, fornitori consentiti, scadenza e azioni che richiedono
   conferma.
   - `irreversible` e `safety_override` richiedono sempre conferma, qualunque cosa dica il mandate.
   - Gli esecutori rifiutano le richieste al di fuori del mandate (`mandate_scope`).
6. **Le operazioni non presidiate necessitano di una persona.** Le operazioni la cui envelope dice `unattended: false`
   necessitano di una persona responsabile presente, o raggiungibile entro un minuto.
7. **I blocchi allergeni rifiutano.** Qualsiasi allergene bloccato nella ricetta o nell'inventario rifiuta la
   richiesta; non esistono sostituzioni che aggirino un blocco.
8. **Recall.** I cataloghi pubblicano recall firmati su `GET /v1/recalls`. Gli esecutori interrogano i cataloghi quando sono online
   e rifiutano le revisioni oggetto di recall. `block_and_stop_running` interrompe anche le esecuzioni in corso in modo sicuro.
9. **I report di incidenti** sono anonimi (`IncidentReport`: solo data, nessun nome o id) e
   inviati ai cataloghi affinché ogni produttore possa imparare da ogni near miss.

## 7. Ciclo di vita dell'esecuzione e API

- **API:** `api/core.openapi.yaml`. I suoi endpoint sono:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - lato catalogo: `GET /v1/recalls`, `POST /v1/incidents`.
- **Stati:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` e `stopping` → `stopped` lungo il percorso;
  - `refused` e `failed` sono finali.
  - La tabella completa delle transizioni si trova in `core.schema.json#/$defs/ExecutionState` e nei vettori di conformance.
- **Regole di richiesta:**
  - Ogni POST trasporta un `Idempotency-Key`.
  - Le modifiche a un'esecuzione esistente trasportano `If-Match: <seq>`; un mismatch restituisce 412.
  - Stop non richiede If-Match.
- **Eventi:**
  - La consegna è almeno una volta (at least once).
  - L' `id` di CloudEvents è la chiave di deduplicazione.
  - `cookwalaseq` ordina gli eventi per soggetto e corrisponde allo status `seq`.
  - I dispositivi emettono `cookwala.device.heartbeat`, quindi un hub può rilevare un dispositivo perso e gestire il passaggio.

## 8. Privacy

- **Gli execution log non contengono dati personali** (`privacy.personalData: "none"`).
- **Lasciano il dispositivo solo con consenso opt-in** (`consent.dataset`: `none` di default,
  `research_only`, o `open`). Il consenso può essere revocato.
- **I dataset open approssimano i tempi al giorno.**
- **I dati relativi a household, salute e religione rimangono a casa** a meno che la persona non scelga diversamente.
  Quando devono viaggiare, viaggiano come selective disclosures.
- **L'Humanitarian Profile** non contiene alcun dato personale.

## 9. Versioning e estensioni

- **Le versioni Core sono `0.2.x`.**
  - I Readers accettano qualsiasi patch della loro minor version.
  - Rifiutano altre minor con `unsupported_version`.
  - Ignorano campi `x-` sconosciuti.
- **Nuove operations, units, sensors e incident types** vengono aggiunti ai vocabularies senza un
  cambio di versione.
- **Cambiare il significato di un'operation è un nuovo id;** il vecchio è marcato `deprecated` con
  `replacedBy`.
- **I Profiles** versionano indipendentemente e dichiarano la Core version di cui hanno bisogno.

## 10. Profili e il loro stato

| Profilo | Stato | Note |
|---|---|---|
| Core (questo documento) | **draft, normative** | Target per le prime implementazioni dei dispositivi |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Nessun dato personale; funziona tramite SMS e CSV; surplus to plate, riepiloghi di impatto, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Fatti della household in modalità local-first; solo derived constraints vengono trasmessi (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespace provati, versioni esatte, tombstones; organizzazioni su richiesta (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Report firmati dietro ogni affermazione di conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feed e relay; verifica rispetto all'issuer (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Ristoranti, community, scuola, disastri e robot kitchens (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Segnali di domanda e offerta aggregati, ritardati, a livello di classe; subordinati a revisione della legge sulla concorrenza (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + proiezione, transizioni in `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Richiede una revisione della legge sulla concorrenza prima dell'uso in produzione |
| Relief planning (`relief.schema.json`) | experimental | Flusso operativo spostato nel Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | L'OpenAPI Core API è la superficie di riferimento |

Un profilo diventa stabile quando due implementazioni indipendenti superano i suoi vettori di conformance
e ha utenti reali.

## 11. Strumenti

| Tool | Cosa fa |
|---|---|
| `tools/validate_specs.py` | Controlla schemi, esempi, semantica delle ricette (envelopes, parametri op, assenza di segnaposto template), severità e che i riferimenti API vengano risolti |
| `tools/run_conformance.py` | Esegue `conformance/*.json` e `conformance/profiles/*.json`, e scrive un ConformanceReport con `--report`: hashing (incluso l'esempio RFC 8785), firme (inclusa una chiave RFC 8032), revoca, disclosure, catene di eventi e checkpoint, unità, envelopes, sensor ladders, macchine a stati |
| `tools/cookwala_ref.py` | Libreria di riferimento e CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Rigenera i vettori (controllare il diff) |
| `tools/bundle_schemas.py` | Bundle di schemi offline |
| `tools/humanitarian_check.py` | Controllore del rule-pack Humanitarian Profile e riepiloghi di impatto |
| `tools/make_profile_vectors.py` | Rigenera i vettori del profilo in `conformance/profiles/` |

## 12. Modifiche dalla versione 0.1

| Area | 0.1 | 0.2 |
|---|---|---|
| Schemas | Campi sconosciuti accettati | Rigidi, con estensioni `x-` |
| Temperatures | °C o °F, tolleranza relativa consentita | Solo °C; tolleranza assoluta |
| Money | Numero | Stringa decimale |
| Operations | Definizioni in prosa | Physical envelopes, sensor ladders, livelli di calore, test vectors |
| Signatures | EdDSA fisso, chiavi senza ciclo di vita | EdDSA o ES256, KeyRecords con validità e revoca |
| Missions | Un documento mutabile, ledger all'interno | Event log + proiezione, singolo sequencer, checkpoint testimoniati, modalità hash-only |
| Agents | Mandate solo all'interno di Missions | `AgentMandate` in comune; richiesto per le richieste degli agenti |
| Safety | Dichiarata nelle ricette | Applicata anche localmente tramite SafetyLimits; recalls; incident reports |
| Data | Nessun modello di dataset | ExecutionLog consensuale e privo di dati personali |
| Conformance | Solo validazione dello schema | 106 vettori (44 Core, 62 profile) più un'implementazione di riferimento |

Per migrare un documento 0.1: convertire °F in °C; sostituire le tolleranze relative sulle temperature con `toleranceAbs`; trasformare gli importi monetari in stringhe decimali; rimuovere o rinominare i campi sconosciuti in campi `x-`.

