<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Profilo Umanitario Cookwala (bozza 0.2)

**Status:** bozza per la revisione da parte di food bank, programmi di soccorso e professionisti della sicurezza alimentare e della nutrizione. Non è revisionata né approvata da WFP, WHO, FAO, Global FoodBanking Network o qualsiasi altra organizzazione qui menzionata.

**Files:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (tutti), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; tutte le bozze in attesa di revisione professionale, vedere [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank al Cairo, pasti scolastici, cucina per disastri, cucina robotica), ciascuno con un `ImpactSummary` calcolato
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet e modelli SMS: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Cosa aggiunge lo 0.2 (RFC-0003, RFC-0004)

Additivo superiore a 0.1; i lettori accettano entrambi.

- **Dal produttore al piatto:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) e `Item.harvestedAt`; ruoli `farm`, `caterer`, `robot_kitchen`; la parola SMS `FARM`.
- **Regole di cura:** `Item.foodClasses` e `Distribution.menu.foodClasses` (uovo crudo, latticini non pastorizzati, frutta a guscio intera, riso cotto…), tipo di regola `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; tre nuovi draft packs.
- **Revisioni:** `RulePack.reviews` registra la professione, l'organizzazione, la data, l'ambito e l'esito di ogni revisione; `status: reviewed` richiede una revisione approvata.
- **Impatto:** `ImpactSummary` con nove misure, ciascuna con `method` (measured, modelled, assumed, not recorded), calcolate da `tools/humanitarian_check.py --summary`.
- **Tempo per la richiesta:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` in modo che i chilogrammi salvati vengano conteggiati una sola volta.
- **Tipi di programma** sul `Manifest`.

## 1. Scopo

Una piccola, rigorosa parte di Cookwala priva di dati personali per le organizzazioni che nutrono le persone:
food bank, cucine comunitarie, programmi di pasti scolastici, programmi di soccorso, donatori (alimentari,
ristoranti, fattorie, catering), trasportatori e depositi frigoriferi. Copre quattro compiti:

1. **Offrire surplus food** e reclamarlo, in modo rapido ed equo.
2. **Registrare ogni handover** della custodia, con un controllo della temperatura (controllo della catena del freddo).
3. **Segnalare cosa è stato servito** solo come conteggi aggregati.
4. **Controllare menu e handover** rispetto a regole di nutrizione e sicurezza alimentare leggibili dalle macchine.

**Funziona senza robot, app o internet.** I livelli H0 e H1 funzionano su fogli di calcolo, SMS
e telefoni base. Robot, hub e agenti sono consumatori opzionali degli stessi documenti.

## 2. Principi

- **Do no harm.** Non raccogliere nulla che possa identificare, localizzare o profilare una persona o un
  household. In contesti fragili, i dati sui beneficiari rappresentano un rischio per la protezione.
- **Humanitarian principles** (umanità, neutralità, imparzialità, indipendenza): nessun
  branding commerciale sugli aiuti e nessun uso dei dati per il marketing.
- **Strict and small.** Ogni oggetto rifiuta campi sconosciuti (eccetto le estensioni `x-`),
  quindi errori di battitura e campi personali extra falliscono la validazione.
- **Exact units:** chilogrammi, gradi Celsius, tolleranze assolute e denaro come stringhe decimali.
- **Local rules win.** I rule pack sono sostituibili dalla legge nazionale sulla sicurezza alimentare e sulle donazioni.
- **Open:** specifica royalty-free, strumenti open-source. Il profilo è progettato per soddisfare il
  Digital Public Goods Standard e i Principles for Digital Development.

## 3. Livelli di conformance

| Livello | Cosa fa un partecipante | Necessità |
|---|---|---|
| **H0 — Carta & SMS** | Registra offerte, passaggi di mano e distribuzioni nei template CSV (con righe hashtag HXL) o tramite SMS (sezione 8.3) | Un foglio di calcolo o un telefono base |
| **H1 — Rescue** | Scambia documenti `Offer`, `Claim`, `Handover` e `Distribution` tramite l'API; segue la macchina a stati (sezione 5) | Qualsiasi client HTTP |
| **H2 — Sicurezza & nutrizione** | Applica un `RulePack` a ogni passaggio di mano e menu, e registra i `findings` | Il reference checker o un equivalente |
| **H3 — Interoperabilità** | Esporta aggregati in HXL, DHIS2 e il core Cookwala `ImpactReport`; utilizza identificatori GS1 | Lavoro di integrazione |

Un partecipante pubblica un `Manifest` in `/.well-known/cookwala-humanitarian.json` che
dichiara i suoi livelli, rule packs, endpoint e `personalData: "none"`.

## 4. Documenti

| Documento | Chi lo scrive | Scopo |
|---|---|---|
| `Offer` | Donatore | Surplus food disponibile per il ritiro: articoli (kg, stoccaggio, date, allergeni), finestra temporale, sito, temperature |
| `Claim` | Food bank, cucina, programma | Richiede tutto o parte di un'offerta, con un orario di ritiro e il tipo di veicolo |
| `Handover` | Ricevente della custodia | Uno per ogni tratta: temperature, kg accettati o rifiutati con un codice motivo, e riscontri delle rule |
| `Distribution` | Cucina, food bank, scuola | Aggregato di pasti e persone servite in un sito in un giorno; nutrienti e costi del menu opzionali |
| `RulePack` | Programma o autorità | Regole di nutrizione e sicurezza alimentare versionate (sezione 6) |
| `Manifest` | Ogni partecipante | Capacità e dichiarazione sulla protezione dei dati |

I documenti principali di Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) rimangono disponibili per la pianificazione. Questo profilo gestisce
il flusso operativo.

## 5. Ciclo di vita dell'offerta

| Da | Stati successivi consentiti |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (la richiesta è scaduta), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | nessuno (finale) |

**Regole per i cambiamenti di stato:**

- Ogni modifica incrementa `version`. Gli scrittori inviano `If-Match: <version>`; un disallineamento restituisce
  **409**, e lo scrittore rilegge e riprova.
- Una transizione illegale restituisce **409** con le transizioni consentite.
- Le offerte passano a `expired` automaticamente a `window.to`.
- Le richieste scadono a `pickupBy` più un periodo di grazia impostato dal programma (predefinito 30 minuti).

**Rivendicazione equa.** Per impostazione predefinita, le rivendicazioni seguono l'ordine di arrivo all'interno di un livello di priorità stabilito dal programma:
ad esempio, cucine che servono prima i bambini, poi altre cucine, poi i food bank. I livelli e
qualsiasi regola di rotazione devono essere pubblicati nel `Manifest` del programma o sul sito web.

## 6. rule pack sulla sicurezza alimentare e la nutrizione

Un `RulePack` contiene regole di sei tipi:

- `temperature`: refrigerato ≤ 5 °C, mantenimento a caldo ≥ 60 °C, congelato ≤ −18 °C;
- `time`: cibo cotto fuori dal controllo della temperatura per al massimo 2 h;
- `date_mark`: i blocchi use-by, gli avvisi best-before;
- `allergen`: blocco allergeni non dichiarati;
- `nutrient`: quantità per persona-giorno o per pasto;
- `energy_share`: quota di energia da zuccheri liberi, grassi, grassi saturi, grassi trans o proteine.

Ogni regola è o `block` (non accettare o servire) o `warn` (consentito, registrato come un finding).

Il pacchetto predefinito `basic-nutrition-food-safety@0.1.0` è una **bozza derivata da linee guida pubbliche**: le linee guida WHO su healthy-diet, sodium, sugars e fats, le WHO Five Keys to Safer Food, i Codex labelling e frozen-food codes, e le cifre di Sphere per la pianificazione delle razioni minime. È semplificato, non è un consiglio medico, esclude l'alimentazione infantile e terapeutica, e deve essere revisionato da personale qualificato. I programmi dovrebbero copiarlo e adattarlo, impostare `jurisdiction` e registrare chi lo ha revisionato in `reviewedBy`.

I ricevitori al livello H2 eseguono il pack ad ogni handover e su ogni menu, e registrano i rule ids in `findings`. Il controllo di riferimento segnala dove i findings dichiarati e calcolati non concordano.

## 7. Protezione dei dati

**Il profilo non contiene dati personali. I documenti NON DEVONO contenere:**

- nomi, numeri di telefono, email o identificatori nazionali, di rifugiati o biometrici di qualsiasi persona;
- record a livello di household, o posizioni di case o individui;
- salute, disabilità, religione o nazionalità di qualsiasi persona.

**Cosa trasporta invece:**

- **Solo organizzazioni.** Ogni parte è un'organizzazione identificata da `did:web`, un GS1
  Global Location Number (GLN) o un registry id. Le persone appaiono solo come ruoli
  (`checkedBy: "trained_staff"`).
- **Solo aggregati.** `Distribution.people` contiene conteggi per gruppo, e qualsiasi conteggio inferiore a 10
  è riportato come `"<10"`.
- **Solo siti.** Un `Site` è la sede di un'organizzazione o un'area amministrativa
  (OCHA P-codes), mai un household.
- **Note brevi.** Il testo libero è limitato a note operative di 280 caratteri e non deve
  contenere dati personali. Le implementazioni dovrebbero scansionare le note alla ricerca di numeri di telefono e id
  prima di memorizzarli.

**Ritenzione e audit:**

- **Retention:** ogni partecipante dichiara `retentionDays` nel proprio `Manifest` e cancella
  i documenti dopo tale periodo.
- **Audit (opzionale, `hash_only`):** un sequencer per programma (normalmente il food bank o
  l'operatore del programma) appende l'hash SHA-256 del JSON canonico RFC 8785 di ogni documento.
  I contenuti sono memorizzati separatamente e rimangono eliminabili. Un'organizzazione partner
  controfirma un checkpoint ogni giorno, in modo che la cronologia non possa essere riscritta silenziosamente. Un singolo
  sequencer evita fork nella catena.
- **Hosting** dovrebbe essere in-country dove la legge o il programma lo richiedono.

## 8. Trasporto

### 8.1 API (livello H1)

| Metodo | Percorso | Note |
|---|---|---|
| `POST` | `/offers` | Crea un'offerta (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Offerte aperte vicino a un ricevitore |
| `POST` | `/offers/{id}/claims` | Rivendica un'offerta; `If-Match` richiesto; 409 quando già rivendicata |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` richiesto |
| `POST` | `/handovers` | Registra un passaggio di consegne |
| `POST` | `/distributions` | Registra una distribuzione |
| `GET` | `/reports?from=…&to=…` | Aggrega per un periodo |

Regole di richiesta e trasporto:

- **Idempotency:** ogni `POST` trasporta un `Idempotency-Key`. I server conservano le chiavi per almeno 24 h e restituiscono la risposta originale per le ripetizioni.
- **Authentication:** OAuth 2.1 client credentials, un client per organizzazione.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  vengono consegnati almeno una volta, con un `id` dell'evento per la deduplicazione e un numero di sequenza per offerta per l'ordinamento.

### 8.2 Fogli di calcolo (livello H0)

Usa i template CSV in `profiles/humanitarian/templates/`. La loro seconda riga contiene gli hashtag [HXL](https://hxlstandard.org), in modo che gli strumenti per i dati umanitari possano leggerli direttamente.

### 8.3 SMS (livello H0)

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

La grammatica è implementata in `tools/cookwala_ref.py` (`parse_sms`) e testata da
`conformance/profiles/sms.json`. Le parole chiave sono in inglese; le cifre
arabo-indic (٠-٩) e persiane (۰-۹) sono accettate ovunque sia presente una cifra, quindi un telefono impostato su una qualsiasi delle due tastiere funziona.

Codici di conservazione: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Segni di data: `UB` use-by,
`BB` best-before, `HV` harvested, come `DDMM`. Codici motivo di rifiuto: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; qualsiasi altra parola viene registrata come `other`. La risposta `HELP` DEVE essere un esempio per comando, ASCII semplice, inferiore a 160 caratteri.

Un gateway DEVE applicare questi controlli prima di scrivere un documento (`sms_storage_findings` nel
riferimento; gli ids sono blocchi di findings):

| Finding | When |
|---|---|
| `safety.temp_not_recorded` | un `HAND` su una linea refrigerata, congelata o mantenuta calda non riporta alcuna lettura `T`: rispondi chiedendola, non scrivere nulla |
| `safety.hot_hold_min` | un `OFFER` con conservazione `H` sotto i 60 °C: rifiuta di elencarlo |
| `safety.storage_class_mismatch` | le parole dell'articolo implicano latticini, carne, pollame, pesce, uova o cibo cotto e la conservazione è `A`: rifiuta di elencarlo |
| `safety.chilled_max`, `safety.frozen_max` | letture sopra i 5 °C o sopra −18 °C in fase di offerta o consegna |

Le offerte di cibo mantenuto caldo terminano dopo due ore (un'ora per il riso cotto); un gateway non memorizza mai una lettura placeholder. Il gateway mappa il numero registrato del mittente a un'organizzazione, mai a una persona nei documenti.

## 9. Interoperabilità

| Sistema | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (prodotti); `Site.gln` e `OrgId` `gln:` (località) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Valori dati aggregati per sito e periodo da `Distribution` (pasti, persone per gruppo, kg, incidenti) |
| WFP SCOPE e altri sistemi beneficiari | **Solo aggregati.** Nessun record di beneficiari entra o esce da questo profilo |
| Food-rescue apps | Gli adapter mappano i loro elenchi su `Offer` e i loro ritiri su `Claim` e `Handover` |
| Core Cookwala | `Item.ingredientId` e `menu.recipes` collegano all'indice delle ricette; `relief.ImpactReport` somma le `Distribution` |

## 10. Metriche pilota (definite in modo che i siti possano essere confrontati)

Calcolato in un `ImpactSummary` da `python tools/humanitarian_check.py --summary DIR`. Come viene eseguito e giudicato un pilot: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrica | Definizione |
|---|---|
| Kg salvati | Somma di `Handover.kgAccepted` sulla prima tratta dai donatori |
| Tasso di rivendicazione | Offerte che raggiungono lo stato `claimed` ÷ offerte create |
| Tempo di rivendicazione | Mediana dei minuti dalla creazione di `Offer` allo stato `claimed` |
| Rifiuto per motivo | Somma di `kgRejected` per `reason` |
| Pasti serviti | Somma di `Distribution.meals` |
| Tasso di conformità nutrizionale | Distribuzioni con menu e nessun riscontro `nutrition.*` ÷ distribuzioni con menu |
| Costo per pasto | (cibo + trasporto + personale + energia) ÷ pasti |
| Minuti di volontariato per 100 kg | `volunteerMinutes` ÷ (kg utilizzati ÷ 100) |
| Sicurezza | Conteggio dei riscontri del blocco `safety.*` e di `safetyIncidents` |

## 11. Sicurezza

- **Le firme sono opzionali a H1** e richieste per l'audit cross-organizzazione a H3
  (EdDSA, chiavi pubblicate al `did:web` dell'organizzazione).
- **Note e nomi nei documenti sono dati non attendibili.** Software e agenti AI non devono mai
  trattarli come istruzioni.
- **I rule pack sono versionati e fissati** (`id@version`) in ogni finding, in modo che i risultati siano
  riproducibili.

## 12. Deliberatamente escluso

- Registrazione dei beneficiari, idoneità e targeting (questi appartengono ai sistemi protetti
  del programma stesso).
- Pagamenti: Cookwala non sposta mai denaro.
- Ricette ed esecuzione del robot (la specifica principale). Il profilo nomina solo le ricette e riporta i
  nutrienti.
- Nutrizione medica e terapeutica.

## 13. Come revisionare

Per favore apri delle issue su [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
con l'etichetta `humanitarian`. Queste revisioni sono le più utili:

- personale della sicurezza alimentare che controlla il rule pack e i motivi del rifiuto;
- operatori del food-bank che controllano il ciclo di vita e il flusso SMS;
- responsabili della protezione dei dati che controllano la sezione 7.

