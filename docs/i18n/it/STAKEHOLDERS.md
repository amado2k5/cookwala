<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Stakeholder: un messaggio, opzioni, un primo successo e un flusso per tutti

**Status:** 2026-10-04. Per ogni gruppo: perché Cookwala è importante per loro, modi per impegnarsi da
leggeri a profondi, un primo successo in meno di 15 minuti, il percorso dopo di esso, e come l'impegno
faccia progredire il loro lavoro e il mondo. Nulla qui nomina un partner, un utente o un pilota che non
esista. Dove qualcosa è pianificato, dice next o later.

I tre obiettivi dietro ogni riga: aiutare a porre fine alla fame, rendere le persone più sane, mettere i robot al lavoro per le persone.

---

## 1. Builders: sviluppatori, produttori di robot e apparecchi, ingegneri embedded, costruttori di agenti AI, sviluppatori di smart-home e piattaforme, contributori open-source

**Messaggio.** I robot e gli elettrodomestici stanno imparando a muoversi. Nessuno ha scritto, in una forma che una macchina possa controllare, cosa significhi "simmer", quando il pollo è sicuro o quando un passaggio deve essere rifiutato. Cookwala è quello strato: ricette che una macchina può pianificare, condizioni finali che può misurare e limiti di sicurezza che impone a se stessa. È aperto, royalty-free, model-neutral e device-neutral, e viene fornito con una suite di conformance che puoi eseguire oggi stesso.

**Opzioni.**
- *Light:* esegui il dry run del browser; leggi Core 0.2 (una sera).
- *Medium:* `pip install -e sdk/python`, esegui il dry-run delle capacità del tuo dispositivo rispetto alle ricette di esempio, esegui i vettori di conformance, avvia il reference hub.
- *Deep:* implementa la Core API su un dispositivo o un hub, pubblica un report di conformance, aggiungi il tuo dispositivo al directory, proponi un RFC, scrivi un nodo bridge ROS 2, aggiungi casi di attacco al benchmark agent-safety.

**Primo successo (sotto i 15 minuti).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flusso.** Dry run → implementare la Core API rispetto al reference hub → superare la conformance →
pubblicare il report → elencare il dispositivo → i consented execution logs diventano dataset LeRobot e
tracce OpenTelemetry.

**Come fa avanzare il loro lavoro.** Una definizione del compito e un test di successo condivisi per la cottura, con
un benchmark pubblico su cui misurarsi; ricette in ogni cucina senza doverle scrivere; una
storia sulla sicurezza che i regolatori possono leggere; report di conformance come documento di vendita;
posizione di primo arrivato in uno standard che sarà governato dai suoi implementatori.

**Come fa progredire la società.** Meno incendi in cucina e malattie trasmesse dagli alimenti grazie a macchine che
rifiutano piuttosto che tirare a indovinare; macchine che ereditano le cucine del mondo invece di poche.

---

## 2. Aziende: startup, imprese, aziende alimentari, commercianti e consegne, ristoranti e servizi di ristorazione, assicuratori, certificatori, team di vendita e partnership

**Messaggio.** Ogni azienda che si occupa di alimenti incontrerà macchine per cucinare e agenti AI nei prossimi anni. Cookwala ti offre un'unica interfaccia per tutti loro, l'unica con limiti di sicurezza applicati sul dispositivo e registri che puoi sottoporre ad audit. Per i commercianti e i servizi di consegna: ricevi finestre di consegna e requisiti sugli allergeni, mai il programma di una famiglia. Per assicuratori e certificatori: un formato di report di conformance e un feed di incident-report progettati per te.

**Opzioni.**
- *Light:* leggi la pagina Investors and partners e le pagine trust; mappa i tuoi prodotti sulle
  ingredient classes e operations.
- *Medium:* pubblica un offer feed (market profile, experimental) o una surplus offer a un
  programma locale (Humanitarian Profile); esegui l'agent-safety benchmark sull'agent che
  hai intenzione di distribuire.
- *Deep:* implementa la Core API in un prodotto; sponsorizza una conformance verification; unisciti al
  steering committee quando si formerà; adotta il certification path.

**Primo successo.** Converti una linea di prodotti in un `Offer` di mercato con GTIN e credenziali allergeniche, validala e vedi quali ricette di esempio può fornire.

**Flusso.** Offri feed → derived constraints dalle famiglie → ordini tramite il tuo checkout → eventi di fulfilment → reputazione dai report di execution (con consenso).

**Come fa avanzare il loro lavoro.** Accesso a uno strato neutrale invece di una dozzina di integrazioni di fornitori; segnali di domanda (later, dopo la revisione della legge sulla concorrenza) che riducono gli sprechi; certification che gli assicuratori possono prezzare; un registro pubblico della sicurezza.

**Come fa progredire la società.** Meno cibo perso tra il negozio e il piatto; surplus che raggiunge le cucine prima che marcisca; macchine nelle case che non possono essere indotte ad azioni non sicure.

---

## 3. Fornitori: alimentari, aziende agricole e cooperative, consegna, energia, venditori di AI e modelli, editori di ricette

**Messaggio.** I fornitori si collegano a Cookwala come peer, non come tenant. Un commerciante o un servizio di consegna riceve un constraint, mai i fatti di una household. Un fornitore di AI riceve un benchmark che mostra che il suo modello è sicuro in una cucina e un server MCP da usare oggi. Un editore di ricette mantiene il proprio nome su ogni ricetta e può pubblicare un catalogo firmato da una cartella statica.

**Options.** Pubblica un catalogo (ricette) · pubblica un feed di offerte · esegui l'agent-safety benchmark · esegui un registry node · offri surplus tramite SMS.

**Primo successo.** Editore di ricette: `cookwala init my-dish`, modifica, `cookwala validate`,
`cookwala hash`; il tuo catalogo è una cartella con `/.well-known/cookwala.json`. Fornitore AI:
aggiungi il server MCP ed esegui i dieci casi di agent-safety.

**Flusso.** Catalogo o feed → voce nel registry sotto il tuo namespace dimostrato → recall feed se
qualcosa va storto → reputazione dai risultati.

**Come fa avanzare il loro lavoro.** Raggiungi ogni dispositivo e agente attraverso un unico formato;
credito e provenienza tramite firma; un benchmark di sicurezza che è un asset di marketing quando
superato onestamente.

**Come fa progredire la società.** Le ricette rimangono attribuite; gli agenti che agiscono per le persone sono
measured prima di essere ritenuti affidabili.

---

## 4. Cibo: agricoltori, cuochi e chef, cuochi casalinghi, creatori di ricette, scuole di cucina

**Messaggio.** Una ricetta scritta per Cookwala mantiene il tuo nome e la tua cucina vivi su ogni
dispositivo che la cucina, con i passaggi che una macchina non deve mai saltare scritti. Un'azienda agricola con un
surplus può elencarlo via SMS e raggiungere una cucina lo stesso giorno. Una scuola di cucina può insegnare la sicurezza
alimentare con un formato che si controlla da solo.

**Opzioni.**
- *Agricoltori:* `FARM 120KG TOMATO A BB0411` verso il gateway di un programma (dove esistente);
  later, leggere i segnali di offerta e domanda.
- *Cuochi e chef:* trasformare una ricetta che conosci a memoria in una ricetta Cookwala; revisionare le
  frasi dei passaggi nella propria lingua; later, registrare sessioni con consenso con credito.
- *Scuole:* utilizzare le nove ricette di esempio come casi didattici; aggiungere le proprie.

**Primo successo.** Cooks: `cookwala init`, scrivi una ricetta con una condizione di fine per ogni
fase di calore, validala. Farmers: invia un'offerta SMS a un programma che esegue il profilo (nessuno
esegue ancora; il parser e i vettori esistono).

**Flusso.** Ricetta → validazione → catalogo → dry run sui dispositivi → gli execution logs mostrano come si comporta su macchine reali → revisioni con prove.

**Come fa avanzare il loro lavoro.** Attribuzione che viaggia; una ricetta che può essere cucinata da
macchine in altri paesi; per gli agricoltori, un modo per trasformare un surplus in pasti invece che in scarti.

**Come fa progredire la società.** Patrimonio culinario preservato come conoscenza operativa, non come video;
meno sprechi alla produzione agricola.

---

## 5. Umanitario: ONG, food bank, cucine comunitarie, programmi di pasti scolastici, agenzie di soccorso, donatori

**Messaggio.** Il Humanitarian Profile sposta il surplus di cibo verso i piatti con telefoni e fogli di calcolo, registra i controlli della catena del freddo, conta i pasti e non trasporta **nessun dato personale**. Funziona senza robot, app o internet. Ti fornisce numeri che puoi difendere: chilogrammi salvati, pasti serviti, tasso di conformità nutrizionale, costo per pasto, tempo per la richiesta, incidenti di sicurezza, ciascuno con il proprio metodo.

**Opzioni.**
- *Light:* leggi il profilo e il protocollo pilota; prova il walkthrough SMS.
- *Medium:* esegui i template CSV in un sito per quattro settimane (livello H0) e calcola un
  riepilogo dell'impatto.
- *Deep:* un pilota pre-registrato di 12 settimane con una baseline e un valutatore indipendente;
  adatta i rule pack alla legge nazionale con il tuo responsabile della sicurezza alimentare; esegui il tuo nodo registry.

**Primo successo.** Compila i tre template CSV per un giorno, esegui
`cookwala humanitarian --summary your-folder`, leggi l' `ImpactSummary` con un metodo sotto
ogni numero.

**Flusso.** Offerta → richiesta → consegna con controllo della temperatura → distribuzione → riepilogo dell'impatto → risultati pubblicati, qualunque essi siano.

**Come fa avanzare il loro lavoro.** Numeri comparabili tra i siti; prove per i finanziatori;
risultati sulla sicurezza prima, non dopo, un problema; un formato che i sistemi dei donatori possono leggere (mappature HXL,
GS1, DHIS2).

**Come fa progredire la società.** Più cibo che raggiunge le persone in modo sicuro, con la loro dignità intatta:
nessun nome, nessun volto, nessun profiling.

---

## 6. Salute: dietisti, responsabili della sicurezza alimentare, agenzie di sanità pubblica, case di cura

**Messaggio.** Regole di nutrizione e sicurezza alimentare come rule pack verificabili da una macchina, derivate da linee guida pubbliche, applicate a menu e passaggi di consegne, con la vostra revisione registrata per professione e esito. Nulla è un consiglio medico; nulla è affermato oltre quanto dichiarato dai rule pack.

**Opzioni.** Revisionare un rule pack con il template (due ore) · adattare un rule pack alle regole nazionali ·
proporre regole di cura per le persone che servite · later, leggere i risultati aggregati dai programmi.

**Primo successo.** Apri `profiles/humanitarian/care-vulnerable-groups.rulepack.json` e
il modello di revisione; segna tre regole come approvate, modificate o rifiutate; archivia la revisione.

**Flusso.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**Come fa avanzare il loro lavoro.** La tua guida opera in ogni cucina che la adotta,
comprese le cucine robotizzate, con la tua professione registrata; una revisione pubblicabile; un
dataset di risultati (aggregati, nessun dato personale) per la ricerca.

**Come fa progredire la società.** Meno sodio, zucchero e grassi saturi nei pasti distribuiti in massa; conservazione a caldo e raffreddamento più sicuri; cura per i bambini e gli anziani integrata nella macchina.

---

## 7. Educazione: insegnanti scolastici, educatori, professori, ricercatori, studenti

**Messaggio.** La cottura è il processo più familiare al mondo, e Cookwala la trasforma in un
oggetto di insegnamento: temperature, unità, condivisione equa, sicurezza, macchine che seguono regole. Per i
ricercatori è un benchmark, un formato di dataset e una lista di open-problems.

**Opzioni.**
- *Insegnanti:* il kit per le lezioni (`docs/education/LESSON-KIT.md`): cinque lezioni da "cos'è un
  simmer" a "cosa non dovrebbe mai fare una macchina".
- *Professori e studenti:* la lista dei temi di ricerca, i simulatori, i vettori di conformance
  come condizioni di test, l'export LeRobot, problemi aperti di dimensioni tesi di laurea.
- *Ricercatori:* pubblicare dataset di esecuzioni consenzienti; criticare le assumptions dei
  simulatori; proporre vettori.

**Primo successo.** Insegnanti: eseguite il dry run del browser in classe e chiedete perché il dispositivo ha rifiutato. Studenti: cambiate un'assunzione nel simulatore della città e spiegate il risultato.

**Flusso.** Lezione → progetto → dataset → articolo → RFC.

**Come fa avanzare il loro lavoro.** Materiale gratuito, aperto, citabile; un benchmark che nessuno possiede;
co-authorship sullo standard attraverso RFCs.

**Come fa progredire la società.** Una generazione che sa cos'è una cucina sicura e sa leggere una scheda di sicurezza.

---

## 8. Governo: governi, ministeri, funzionari cittadini, regolatori, politici e legislatori, organismi di governo e di standardizzazione

**Messaggio.** Le macchine per la cottura domestica e commerciale stanno arrivando sotto regolamentazioni scritte separatamente per elettrodomestici e software. Cookwala offre ai regolatori qualcosa di concreto a cui fare riferimento: limiti di sicurezza applicati sul dispositivo, refusal before heat, registrazioni firmate, segnalazione anonima di incidenti e una suite di conformance che chiunque può eseguire. Per la sicurezza delle donazioni alimentari, fornisce uno standard di dati senza dati personali. È royalty-free e destinato a una governance neutrale.

**Opzioni.** Leggi il policy brief (`docs/policy/BRIEF.md`) · usa il linguaggio del modello per i dati sulle donazioni di cibo e la sicurezza delle macchine per cucinare · chiedi al tuo ente di standardizzazione di revisionare Core 0.2 · esegui un nodo del registry nazionale · finanzia un progetto pilota con il tuo programma di pasti scolastici.

**Primo successo.** Leggi il brief di due pagine e controlla tre cose nel repository: il safety limits pack, il conformance runner, le regole di protezione dei dati umanitari.

**Flusso.** Breve → revisione da parte di un organismo nazionale di standardizzazione → riferimento nelle linee guida → pilota →
schema di certification.

**Come fa avanzare il loro lavoro.** Una base tecnica pronta all'uso e verificabile; prove provenienti da pilot; un canale verso l'industria attraverso uno standard neutrale; interoperabilità con gli standard di dati umanitari che già utilizzi.

**Come fa progredire la società.** Macchine più sicure nelle case; salvataggio alimentare che protegge le persone che serve; meno sprechi nelle città.

---

## 9. Capitale: investitori, imprenditori, filantropie, banche di sviluppo

**Messaggio.** La cottura sta per diventare un'infrastruttura. Lo standard è gratuito; i servizi
attorno ad esso sono un business: certification, hub software, dataset consenzienti, operazioni
di registry, progetti pilota. Lo strato umanitario è un bene pubblico che i finanziatori dello sviluppo possono
sostenere con una valutazione pre-registrata. Non vengono fatte promesse finanziarie in nessuna parte di questo sito.

**Opzioni.** Leggi l'opportunità, il modello di business, la roadmap, i rischi e la governance
(`/investors`) · finanzia un pilot o una revisione · sostieni un'azienda che vende servizi accanto allo
standard gratuito · unisciti alla governance come osservatore finanziatore.

**Primo successo.** Leggi le sezioni problem, architecture e risks del whitepaper e il concern register dell'action plan; ogni rischio aperto è elencato.

**Flusso.** Prove (piloti, conformance, adottanti) → gate nel piano d'azione → finanziamento legato ai gate → fondazione neutrale per lo standard, una società per i servizi.

**Come fa avanzare il loro lavoro.** Posizione precoce in uno standard che definisce una categoria con numeri onesti; una società di servizi investibile separata dal bene pubblico.

**Come fa progredire la società.** Il capitale va a ciò che è measured, non a ciò che è claimed.

---

## 10. Pensiero: filosofi, eticisti, storici e futuristi

**Messaggio.** Quando una macchina cucina la ricetta di una nonna, chi possiede la conoscenza? Cosa significa la dignità nella cura automatizzata? Cosa può sapere il robot di una famiglia, e chi altro può saperlo? Cookwala ha fatto delle scelte riguardo a queste domande nel codice; i saggi (`docs/essays/`) dicono quali siano state e invitano al disaccordo.

**Opzioni.** Leggi i saggi · scrivi una risposta · proponi una regola (un RFC è un argomento filosofico con uno schema) · siediti nel comitato di revisione etica del profilo del household context.

**Primo successo.** Leggi il saggio sui dati household e le regole di viaggio del facet registry;
trova un facet il cui default cambieresti, e spiega perché.

**Flusso.** Essay → commento pubblico → RFC → default modificato.

**Come fa avanzare il loro lavoro.** Un caso reale in cui le posizioni etiche diventano regole operative,
con un registro pubblico dell'argomentazione.

**Come fa progredire la società.** Decisioni su dati intimi e eredità culturale prese in
chiaro prima che le macchine arrivino in milioni di case.

---

## 11. Tutti: persone che si interessano al cibo, agli sprechi, al lavoro, al clima e al futuro

**Messaggio.** Cookwala è un modo per scrivere una ricetta in modo che chiunque, o qualsiasi cosa, possa cucinarla in sicurezza, e un modo affinché il cibo che verrebbe buttato via raggiunga qualcuno che ne ha bisogno. È gratuito, non appartiene a nessuna azienda e dichiara ciò che non sa.

**Opzioni.** Prova il dry run · gioca con un simulatore · leggi le ricette · scrivi una ricetta che
ami · segui la roadmap · parlane a un food bank o a una scuola.

**Primo successo.** Cambia il dispositivo nel dry run e osserva un passaggio essere rifiutato; leggi il perché.

**Flusso.** Curiosità → una ricetta → una conversazione con una cucina che potrebbe usarla.

**Come migliora la loro vita.** Macchine più sicure in casa, le proprie ricette preservate, un modo per aiutare senza dare denaro.

**Come fa progredire la società.** Meno sprechi, cibo più sicuro, macchine che servono persone che non possono
cucinare da sole, e tempo umano restituito.

---

## 12. Lavoro e dignità, detti chiaramente

Le macchine per cucinare cambieranno il lavoro. Posizioni di Cookwala: gli esseri umani possono sempre cucinare; i primi utilizzi sono per persone che non possono cucinare per se stesse e per le cucine comunitarie che sono carenti di personale; il nome di un cuoco rimane su una ricetta ovunque venga cucinata; una voce dei lavoratori ha un posto nel comitato direttivo; nuovi ruoli (ingegneri delle ricette, tecnici dei robot alimentari, certifiers, revisori del rule pack) vengono nominati senza promettere numeri.

## 13. Dove ogni gruppo si colloca nel sito

| Gruppo | Pagina |
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

