<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->

# Strategia Cookwala: messaggio, prodotto, sito web, documentazione, esperienza sviluppatore

**Status:** rivisto 2026-10-04 (v2). Copre la mission, la vision, la storia, lo standard, il sito web,
la documentazione, API e SDK, le demo, la community e le metriche. Si basa sul piano d'azione
(`ACTION-PLAN.md`), la backstory e la lista dei gap (`research/BACKSTORY.md`), la revisione dell'architettura
(`research/ARCHITECTURE-REVIEW.md`), il benchmark su 23 siti (`research/WEB-BENCHMARK.md`), il
design degli stakeholder (`STAKEHOLDERS.md`) e le regole di messaggistica (`MESSAGING.md`). La tabella della Sezione 1
è lo studio di prima fase; il benchmark la sostituisce laddove differiscono.

---

## 0. Riepilogo

**Il compito di Cookwala.** È il modo aperto per dire a qualsiasi cucina (una persona, un food bank, un forno o un robot umanoide) **cosa preparare, quando ogni passaggio è completato e cosa non deve mai accadere**, e per controllare tutti e tre sul dispositivo.

**Cosa cambia:**

1. **Message.** Rimuovere "the world's first and largest robot cooking recipes index and CLI"
   e iniziare con il problema che ogni produttore di robot e ogni cucina ha. Nuovo slogan:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** I robot stanno per cucinare nelle case, ma nessuno ha scritto, in una forma che una
   macchina possa verificare, cosa significhino "fatto" e "sicuro", o in quali cucine. Cookwala è partito
   dalle ricette egiziane di una famiglia. La sua missione è insegnare alle macchine ogni cucina
   in modo sicuro, e assicurarsi che il buon cibo raggiunga le persone.
3. **Proof before promise.** Contatori reali e live. Etichette now / next / later. Critiche pubblicate.
4. **Un ciclo che tutti comprendono:** *Describe → Check → Cook → Learn.*
5. **Percorsi per pubblico:** produttori di dispositivi, costruttori di agenti AI, cucine e food bank, cuochi,
   ricercatori.
6. **Codice e una demo live sulla prima schermata.** dry run nel browser ("Can this device cook
   this recipe?"), i simulatori e comandi copia-incolla che funzionano oggi.
7. **Esperienza sviluppatore al livello delle migliori documentazioni AI e robotica:** un
   quickstart di 5 minuti, documentazione organizzata come tutorial, guide how-to, riferimento e spiegazione,
   `llms.txt`, copy-page, un pacchetto Python e CLI, un SDK JS/TS tipizzato, un server MCP, un
   hub di riferimento che puoi eseguire localmente, un pacchetto ROS 2 e un bridge LeRobot.
8. **Una rete di contributori** (ispirata da Figure's Index): cuochi e cucine contribuiscono con
   registrazioni autorizzate di ricette reali, così i robot imparano ogni cucina, con il merito alle
   persone che gliele hanno insegnate.

---

## 1. Cosa abbiamo imparato

| Sito | Problema che risolve | Approccio | Come comunica | Pubblico | Cosa prendiamo |
|---|---|---|---|---|---|
| **Figure – Index** | Gli umanoidi necessitano di enormi quantità di dati su task del mondo reale | Rete di contributori pagati che registra task quotidiani; servizi now, robot later | Cinematico, monocromatico, tipografia enorme; contatori live (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Contributori, households, imprese | Rete di contributori con credito; **contatori di prova live**; una linea di onestà "today / soon"; un'immagine d'impatto |
| **Figure (home)** | Aiuto domestico | Un umanoide general-purpose | *"The future of home help is here."* Una frase, un video | Households, investitori | La promessa in una frase; prodotto prima delle features |
| **MCP Registry** | Trovare server MCP affidabili | Community registry; namespace reverse-DNS verificati; versioni esatte; hash di integrità; endpoint di validazione; stato del ciclo di vita | Riferimento OpenAPI pulito; schema-first | Publisher di server, produttori di client | **Namespace verificati, versioni fissate, hash, tombstones** → `REGISTRY.md` |
| **LangChain docs** | La costruzione di agent è frammentata | Framework open e model-agnostic più una piattaforma | *"The open agent engineering ecosystem"*; ciclo di vita Build → Test → Deploy → Monitor; trust center e stato | Ingegneri di agent, imprese | **Un ciclo di vita che il lettore riconosce**; trust center; academy e forum |
| **LangSmith Observability** | Vedere cosa hanno fatto gli agent in produzione | Traces → monitoring → feedback → dataset per evals | Passaggi con link; pagina dei concetti; integrazioni | Team di agent | **Execution logs come traces**; i traces diventano dataset → `execlog_export.py otel` |
| **OpenAI API docs** | Prima chiamata API | Quickstart con code first; build paths; model cards | Dark, code-forward, "Ask AI", stato e cookbook | Developer | **Code sulla prima schermata; "build paths"** |
| **Claude Platform docs** | Dalla prima chiamata alla produzione | Due superfici (Messages, Managed Agents); percorso developer numerato; model family cards | Ricerca ⌘K; tab di linguaggio (Python … cURL, CLI); journey 1–4 | Developer, platform teams | **Percorso developer numerato; tab di linguaggio; "choose how you build"** |
| **AsyncAPI** | Descrivere API event-driven | Spec aperta più strumenti (generatori, docs); open governance sotto la Linux Foundation | "Part of the Linux Foundation"; spec → docs → code demo; community meetings; sponsor tiers | Architetti, tool builders | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | Inferenza di modelli veloce ed economica | API all-in-one per molti modelli | Liste di feature su performance, scalabilità, costo e sicurezza | Developer, imprese | Una lista precisa di **characteristics** (le nostre: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Prompt engineering per tentativi ed errori | Casi di test dichiarativi, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; lista why-choose; passaggi del workflow | Sviluppatori di app LLM, security | **Test di sicurezza dichiarativi** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; not Figure's Helix AI) | DeFi è troppo complessa | Agent in natural-language con conferma prima di ogni transazione | Whitepaper: abstract → problem → solution → architecture → security model | Utenti crypto | **Struttura del whitepaper; security model esplicito; "always confirm"** (prendiamo la struttura, non il modello del token) |
| **Hugging Face LeRobot** | La robotica è difficile da iniziare | Libreria hardware-agnostic; teleoperate → record → train → deploy; formato dataset standard; community datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; common problems | Maker, ricercatori | **"Pick your path"; compatibilità dei dataset; sezione common-problems** |
| **ROS 2 / Open Robotics** | Interoperabilità del software robotico | Middleware open (ROS, Gazebo, Open-RMF) gestito da una non-profit | *"Powering the world's robots"* | Developer di robot | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | Sviluppare e addestrare robot | Simulazione, librerie, foundation models (GR00T) | Mappa della piattaforma: libraries, simulation, models, blueprints | Team di robotica | **Simulation come banco di prova** per gli envelopes |
| **1X, Unitree, Pollen** | Umanoidi domestici, robot accessibili, robot open per maker | Prodotti con depositi, pre-ordini e community | Un prodotto, un prezzo, un pulsante | Households, maker | I robot domestici sono in spedizione now; la nostra finestra è now |

**Pattern condivisi dai migliori:**
1. Una frase su chi è il destinatario e cosa fa.
2. Un ciclo che il lettore riconosce.
3. Codice funzionante o una demo entro uno scroll.
4. Punti di ingresso "scegli il tuo percorso".
5. Prove (numeri, utenti, governance).
6. Stato onesto (trust center, status page, now/next).
7. Community a cui puoi unirti oggi.
8. Documentazione costruita sia per persone che per lettori AI (pagina di copia, `llms.txt`, "Ask AI").

---

## 2. Cookwala oggi

**Punti di forza:**
- Un'idea rara e concreta: physical operation envelopes, sensor ladders, refusal invece di
  indovinare, sicurezza imposta sul dispositivo, documenti verificabili.
- Vettori di conformance che includono i risultati di due standard indipendenti (RFC 8785, RFC 8032).
- Quattro simulatori giocabili.
- Un profilo umanitario che funziona senza robot.
- Un vero corpus di ricette (fifi.cooking) e una regione con un'identità (Egitto, il mondo arabo).
- Un registro di critica e risposta insolitamente onesto.

**Lacune:**

| Gap | Effect |
|---|---|
| Il titolo afferma "il primo e il più grande" con 1 ricetta pubblicata | Sembra hype; invita al rifiuto |
| "Porre fine alla fame nel mondo" come apertura | Allontana finanziatori ed esperti che conoscono le cause della fame |
| Inquadramento solo per robot | Esclude gli utenti che possono adottarlo oggi (cucine, food bank, agent builders) |
| Nessun quickstart, nessun SDK, nessun server eseguibile | Nessuno può avere successo in 5 minuti |
| La documentazione è composta da 25 file markdown senza navigazione | Difficile da trovare, difficile da fidarsi |
| Nessuna prova live o status | Nessun senso di slancio o prontezza |
| Nessun modo per unirsi | L'interesse non può trasformarsi in contributo |

---

## 3. Posizionamento e messaggio

### 3.1 Categoria e one-liner
- **Categoria:** uno standard aperto (con strumenti gratuiti e un indice) per la cucina eseguibile e verificabile.
- **One-liner:** *Cookwala è lo standard aperto per cucinare in sicurezza: persone, cucine e robot.*
- **Triad**, usato ovunque:
  - **Cosa preparare.** Ricette come passaggi che una macchina può pianificare.
  - **Quando è pronto.** Condizioni finali misurabili: temperature, segnali dello stato del cibo, tempi.
  - **Cosa non deve mai accadere.** Limiti di sicurezza che il dispositivo impone autonomamente.

### 3.2 Missione e visione (revisionata)
- **Missione:** *Aiutare tutti a mangiare bene, in modo sicuro, conveniente e senza sprechi, chiunque si occupi
  della cucina.*
- **Visione:** *Qualsiasi cucina sulla Terra può cucinare qualsiasi ricetta in modo sicuro, e il buon cibo raggiunge le persone
  invece del cestino.*
- **Perché il cambiamento:** "end world hunger" rimane come ragione a lungo termine, comunicata con prove.
  Cookwala contribuisce ad essa attraverso meno sprechi, il recupero del cibo e una cucina più economica, insieme ai
  programmi, ai finanziamenti e alle politiche di cui la fame ha bisogno.

### 3.3 La storia

> I robot domestici stanno arrivando: Figure 03, 1X NEO e i robot da cucina sono in fase di spedizione o accettano
> ordini. Stanno imparando a muoversi, ma nessuno ha scritto, in un modo che una macchina possa
> controllare, cosa significhi "simmer", quando il pollo è sicuro, o come si prepari la molokhia di una nonna.
> Ogni produttore scrive le proprie ricette chiuse, principalmente basate su poche cucine.
>
> Cookwala è partito dalle ricette casalinghe egiziane di una famiglia su fifi.cooking e ha posto una semplice
> domanda: come si consegna una ricetta a una macchina, sapendo che la cucinerà in modo sicuro?
>
> La risposta è uno standard aperto. Stabilisce cosa preparare, quando ogni passaggio è completato e cosa non deve
> mai accadere. Il dispositivo lo controlla prima di riscaldare qualsiasi cosa, e rifiuta piuttosto che
> tirare a indovinare. Le stesse ricette oggi funzionano per le persone e i food bank, e domani permetteranno ai robot
> di imparare ogni cucina sulla Terra, dando credito ai cuochi che gliele hanno insegnate.

*(Il fondatore dovrebbe confermare e personalizzare la frase di origine. L'autenticità batte la perfezione.)*

### 3.4 Message house

| Pilastro | Promessa | Prova che possiamo mostrare oggi |
|---|---|---|
| **Safe by design** | I dispositivi rifiutano piuttosto che indovinare, e impongono i limiti localmente | Operation envelopes per 32 operations; safety-limits pack; dry run; conformance |
| **Verifiable** | Chiunque può controllare una ricetta, un dispositivo e un record | Firme, revoca delle chiavi, checkpoint dell'event-log; 106 vettori incl. risultati RFC |
| **Open and neutral** | Royalty-free, model-agnostic, device-agnostic | Licenze; percorso di governance; nessun API key |
| **Every cuisine** | Costruito sulla cucina casalinga reale, multilingue | fifi.cooking corpus; arabo e inglese; world-cuisines plan |
| **Useful before robots** | Cucine e food bank ne beneficiano now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | La cucina reale diventa robot migliori, con credito | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 Regole linguistiche
- **Usa:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Evita:** "revolutionary", "first and largest" (finché non è vero), "end hunger" (come titolo),
  "AI-powered" (vago).
- **Etichetta ogni numero** come *measured*, *modelled* o *assumed*.
- **Dì "now / next / later"** invece di implicare che qualcosa esista quando non è così.

---

## 4. Pubblici e il loro primo successo

| Pubblico | Compito da svolgere | Primo successo (≤ 15 min) | Poi |
|---|---|---|---|
| **Produttori di robot ed elettrodomestici** | Rilasciare funzionalità di cottura senza scrivere ogni ricetta, in sicurezza | Effettuare il dry run del profilo del dispositivo su 5 ricette; vedere accept/refuse per ogni passaggio | Implementare la Core API (reference hub), superare la conformance, pubblicare il dispositivo nel registry |
| **Sviluppatori di agenti AI** | Permettere agli agenti di pianificare pasti e ordinare cibo senza danni | Aggiungere il server Cookwala MCP; eseguire l'agent-safety benchmark sul loro modello | Usare AgentMandate e il dry run prima di agire |
| **Cucine e food bank** | Recuperare il surplus in sicurezza, pianificare menu nutrienti | Inviare un'offerta via SMS, o compilare il CSV; vedere il controllo del rule-pack | Avviare un pilota con l'Humanitarian Profile |
| **Cuochi e creatori di ricette** | Mantenere le loro ricette attive e accreditate | Convertire una ricetta con l'editor; vederla superare la validazione | Contribuire con registrazioni (consentire); apparire nei crediti |
| **Ricercatori e revisori** | Dati, benchmark, assunzioni oneste | Eseguire un simulatore; leggere la critica e la conformance suite | Usare dataset; pubblicare recensioni |
| **Finanziatori e decisori politici** | Vedere impatto, rischi e governance | Leggere il riassunto del whitepaper di 2 pagine e la concept note | Finanziare i piloti; unirsi alla governance |

---

## 5. Architettura del prodotto: cosa offre Cookwala

| Livello | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profili (draft / experimental) | Core 0.3 dopo il primo feedback del dispositivo | Core 1.0 sotto una foundation |
| **Index and registry** | Ricette di esempio; registry spec | corpus fifi.cooking convertito (2,380 recipes, Arabic + English); namespaces verificati | Collezioni della community, world cuisines |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Recipe editor (web) |
| **Reference hub** | Core API spec | Docker hub con un dispositivo simulato, così il quickstart `curl` funziona localmente | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Limiti revisionati; risultati pubblici sulla agent-safety | Certification scheme con un certifier |
| **Humanitarian** | Profile, rule pack, templates, concept note | Egypt food-bank pilot | Adozione della food-bank network |
| **Data** | ExecutionLog con consenso | Contributor network, primo dataset con consenso | Multi-cuisine benchmark su Hugging Face Hub |

---

## 6. Sito web

### 6.1 Sitemap

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Home page, dall'alto verso il basso

| # | Sezione | Scopo | Contenuto |
|---|---|---|---|
| 1 | **Hero** | Dire cos'è in un respiro | One-liner, triad, due bottoni (*Try the dry run*, *Read the quickstart*); chip di stato onesto "Draft standard · v0.2" |
| 2 | **Live demo** | Mostrare, non raccontare | "Questo dispositivo può cucinare questa ricetta?" Scegli una ricetta e un dispositivo; ogni passaggio mostra done / person / refuse, con la rule che ha deciso |
| 3 | **The problem** | Far sentire il divario | I robot stanno arrivando; "simmer" significa cose diverse; ricette chiuse da poche cucine; cibo sprecato mentre la gente soffre la fame |
| 4 | **The loop** | Un modello mentale | Describe → Check → Cook → Learn, ciascuno con l'artifact e il command |
| 5 | **Pick your path** | Instradare ogni visitatore | Cinque card (sezione 4), ciascuna con un primo successo |
| 6 | **Proof** | Momentum e onestà | Contatori live da `/v1/stats.json` (operations definite, conformance vectors, schemas, ricette pubblicate, lingue); ogni numero etichettato |
| 7 | **Safety** | Fiducia | La sicurezza è locale; refusal; agent rules; recalls; link a /trust |
| 8 | **Works today** | Utilità prima dei robot | Humanitarian Profile, esempio SMS, simulatori |
| 9 | **Now / next / later** | Roadmap onesta | Dalla sezione 5 |
| 10 | **Open** | Neutro e partecipabile | Licences, percorso di governance, contribuisci, GitHub |

### 6.3 Direzione del design
- **Feel:** calmo, preciso, caldo. Uno strumento professionale con un'anima da cucina.
- **Type:** un grotesque preciso per l'UI e un mono face per dati e codice. Un carattere di visualizzazione grande e leggero per l'hero (prendendo in prestito la sicurezza di Figure), senza copiarne l'oscurità cinematografica.
- **Colour:** carta e inchiostro neutri con un accento termico (ember orange) che marca anche i dati della temperatura. La palette è validata per lettori daltonici, e sono progettati sia i temi light che dark.
- **Imagery:** mani reali e vere cucine domestiche una volta che le avremo, mai robot stock. Fino ad allora, diagrammi e la live demo sosterranno la pagina.
- **Motion:** un momento, il dry run passo dopo passo. Tutto il resto è immobile.
- **Bilingue fin dall'inizio:** inglese e arabo (layout right-to-left), poi altri.
- **Accessibility:** WCAG 2.2 AA; tastiera; motion ridotto; nessuna informazione basata solo sul colore.

### 6.4 Interattività
1. dry run nel browser (ricetta × dispositivo).
2. Envelope explorer: trascina una traccia di temperatura e vedi quando esce da "simmer".
3. Simulatori, con il protocollo attivo o disattivato.
4. Recipe step viewer: la frase di uno step, il suo JSON e il suo envelope affiancati.
5. Later: un editor di ricette che valida mentre scrivi.

---

## 7. Documentazione

Organizzato secondo il framework Diátaxis, quindi ogni pagina ha un unico compito:

| Tipo | Scopo | Pagine |
|---|---|---|
| **Tutorial** | Imparare facendo | Quickstart; La tua prima ricetta Cookwala; Rendere un dispositivo Cookwala-ready; Aggiungere Cookwala a un agent; Avviare un pilot di food-rescue con SMS |
| **Guide pratiche** | Risolvere un compito | Dry-run di un dispositivo; Firmare e verificare; Pubblicare nel registry; Esportare i log in LeRobot o OpenTelemetry; Eseguire l'agent-safety benchmark; Segnalare un incidente; Emettere un recall |
| **Riferimento** | Cercare informazioni | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Spiegazione** | Capire il perché | Perché gli envelopes; la sicurezza è locale; modello di fiducia; privacy; design umanitario; critiche e risposte; simulatori e i loro limiti |

**Ergonomia della documentazione:**
- navigazione a sinistra, ricerca, "Copy page", "Edit on GitHub", link previous/next;
- schede della lingua (Python / JavaScript / cURL / CLI);
- `llms.txt` e markdown per pagina per i lettori AI;
- un cheat sheet e una pagina dei problemi comuni;
- un changelog con date.

---

## 8. API e SDK

| Deliverable | Cosa | Perché |
|---|---|---|
| pacchetto Python `cookwala` | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (da `tools/`) | Un comando per il primo successo |
| `@cookwala/sdk` (TypeScript) | Tipi generati da schemi; Core API client; dry run nel browser | Sviluppatori web e di agent |
| Reference hub (Docker) | Core API con un dispositivo simulato e i limiti di sicurezza | Il `curl` del quickstart funziona localmente; banco di prova per maker |
| server MCP | Strumenti: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Ogni agent capace di MCP può usare Cookwala in sicurezza |
| pacchetto ROS 2 | `cookwala_msgs` (azioni), un nodo bridge verso la Core API | Maker di robot |
| Exporters | LeRobot, OpenTelemetry (fatto) | Apprendimento e osservabilità |
| Evals | benchmark promptfoo agent-safety (fatto) | Costruttori di agent, revisori di sicurezza |
| Versioning | Semver per Core; bundle di schemi datati; changelog; finestre di deprecation | Promessa di stabilità |
| Status | Pagina di stato pubblica per gli endpoint di cookwala.ai | Fiducia |

---

## 9. Demos

| Demo | Pubblico | Stato |
|---|---|---|
| In-browser dry run | Tutti | In costruzione now |
| Simulatori (casa, città, paese, mondo) | Tutti, finanziatori | Live |
| Risultati di agent-safety attraverso i modelli | Agent builders, laboratori AI | Next (eseguire il benchmark, pubblicare i risultati con il metodo) |
| Walkthrough SMS food-rescue | Food banks | Next (demo registrata) |
| Un dispositivo reale che cucina una ricetta Cookwala, non modificata | Tutti | Later (la demo più importante; necessita di un partner per il dispositivo) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Ricercatori di robotica | Later |

---

## 10. Comunità e crescita

- **Rete di contributori** (ispirata a Figure's Index):
  - *Cuochi* registrano sessioni di ricette approvate che conoscono, con credito su ogni ricetta e
    dataset card.
  - *Cucine e food bank* pilota.
  - *Maker* implementano dispositivi.
  - *Reviewer* revisionano rule pack e envelope.
  - *Traduttori* traducono passaggi e vocabolario.
  - I contributi pagati arrivano later, finanziati da sovvenzioni. Non pagare mai per i dati senza
    consenso informato e termini equi.
- **Rituali:** chiamata mensile della community; "stato di Cookwala" trimestrale con numeri reali;
  thread di revisione pubblici.
- **Sequenza di partnership:** i primi dieci dal tracker degli stakeholder (food bank, WFP
  Innovation Accelerator, Home Assistant, una startup di dispositivi, un laboratorio universitario, un certifier,
  World Central Kitchen, una fondazione, una casa neutrale, un creator).
- **Canali:** GitHub Discussions, una newsletter, interventi in conferenza (ROSCon, workshop
  IROS/ICRA, eventi food-tech), canali in lingua araba.

---

## 11. Metriche

- **North-star metric:** *verified cooks*, il numero di esecuzioni che hanno eseguito una ricetta Cookwala firmata end to end con un log consenziente e conforme. Finché questo è zero, monitorare gli indicatori anticipatori.

| Funnel | Metrica | Obiettivo entro 2027-03 |
|---|---|---|
| Attract | Visitatori mensili a /start | 2,000 |
| Activate | dry run completati (web + CLI) | 500 |
| Build | Implementazioni Independent Core che superano la conformance | 2 |
| Adopt | kg salvati dal pilot food bank (measured) | Primo pilot di 6 mesi in corso |
| Contribute | Contributori esterni con modifiche mergeate | 15 |
| Trust | Recensioni esterne pubblicate | 6 |
| Learn | execution log con consenso | 1,000 |

---

## 12. Roadmap

La roadmap mantenuta con uno stato per ogni elemento è [`ROADMAP.md`](ROADMAP.md). La tabella qui sotto è il
piano originale di 180 giorni, conservato per il registro.

| Quando | Sito web e storia | Esperienza dello sviluppatore | Standard e sicurezza | Community |
|---|---|---|---|---|
| **Now (questa release)** | Nuova home page con live dry run, triad, paths, proof, now/next/later; docs viewer; `llms.txt`; pagine di fiducia (security, governance) | Dry run; esportatori LeRobot e OTel; azioni ROS 2; agent-safety benchmark | Specifica registry (namespaces, versioni, hash) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Prossimi 30 giorni** | /start quickstart; home page in arabo; claims pass su tutte le pagine | `pip install cookwala`; reference hub (Docker) | Primi risultati del benchmark pubblicati | Concept note per food bank; proposta Home Assistant |
| **60 giorni** | indice /recipes con fifi corpus (primi 100 convertiti); /humanitarian | TS SDK; server MCP | Revisione envelope da parte di uno scienziato alimentare | Prima community call |
| **90 giorni** | Whitepaper + riassunto di 2 pagine; /roadmap | pacchetto ROS 2 | Core 0.3 dal feedback dei dispositivi | Partner di dispositivi, laboratorio universitario |
| **180 giorni** | Video demo di un dispositivo reale | Editor di ricette | Analisi del gap del certifier | Risultati del pilota; domanda per la foundation |

---

## 13. Rischi per questa strategia

| Rischio | Mitigazione |
|---|---|
| Un sito patinato su una realtà sottile sembra hype | Ogni affermazione etichettata; contatori live da dati reali; now/next/later |
| Diffusione su troppi pubblici | Due percorsi primari per i prossimi 90 giorni: produttori di dispositivi e food bank. Altri sono supportati ma non ricercati |
| Le grandi piattaforme distribuiscono alternative chiuse | Essere lo strato neutrale e verificabile che possono adottare; collaborare con attori open (Hugging Face, Open Robotics, Home Assistant) |
| Uso improprio dei dati dei contributori | Consenso opt-in, revocabile; nessun dato personale; data cards pubblicate |
| Bandwidth del fondatore | Distribuire la developer experience (package, hub) prima di ulteriori specifiche; reclutare un co-maintainer |

