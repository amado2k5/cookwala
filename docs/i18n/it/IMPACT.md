<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Impatto: cosa Cookwala può cambiare, con fonti ed etichette

**Status:** 2026-10-04. Ogni numero qui sotto è etichettato come **measured** (conteggiato o riportato dalla
fonte nominata), **modelled** (prodotto dai nostri simulatori sotto assunzioni dichiarate) o
**assumed** (una cifra di pianificazione). Nulla qui è un risultato di Cookwala sul campo: nessun pilot
è stato eseguito. Questa pagina indica la dimensione dei problemi e i meccanismi attraverso i quali Cookwala
contribuisce.

## 1. Fame

| Fatto | Cifra | Etichetta e fonte |
|---|---|---|
| Persone che hanno affrontato la fame nel 2023 | circa 733 milioni | measured dalla fonte: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Persone con insicurezza alimentare moderata o grave nel 2023 | circa 2,3 miliardi | measured dalla fonte: SOFI 2024 |
| Cibo perso tra il raccolto e la vendita al dettaglio | circa 14 % del cibo prodotto | measured dalla fonte: FAO, *The State of Food and Agriculture 2019* (UNEP arrotonda la stessa cifra al 13 %) |
| Cibo sprecato nella vendita al dettaglio, nel servizio alimentare e nelle household nel 2022 | circa 1,05 miliardi di tonnellate; circa 132 kg per persona; circa 79 kg per persona nelle household | measured dalla fonte: UNEP, *Food Waste Index Report 2024* |

**Meccanismi di Cookwala:** offerte di surplus che raggiungono una cucina prima che il cibo si deteriori, con un controllo della catena del freddo a ogni passaggio di consegna (Humanitarian Profile); impatto conteggiato allo stesso modo in ogni sito in modo che i programmi possano confrontarsi e migliorare; later, segnali aggregati di domanda e offerta in modo che si coltivi e si sposti meno cibo destinato allo scarto (experimental, gated on competition-law review). **Cosa non fa:** affrontare la povertà, i conflitti, gli shock climatici, i prezzi o le politiche, che sono i motori della maggior parte della fame.

**Modelled, illustrativo, non una previsione:** il rollout misto del simulatore nazionale salva
pasti pari a circa il 4.7 % di ciò di cui ha bisogno la sua popolazione fittizia in insicurezza alimentare; lo scenario "protocollo, no robot" del simulatore mondiale raggiunge circa 40 milioni di circa 770 milioni (il baseline assumed del simulatore, un arrotondamento dei 733 milioni measured sopra) di persone
affamate solo attraverso il rescue. Entrambi dicono la stessa cosa: il rescue è importante e non è
sufficiente.

## 2. Salute

| Fatto | Cifra | Etichetta e fonte |
|---|---|---|
| Malattie causate da cibo non sicuro ogni anno | circa 600 milioni; circa 420.000 morti | measured dalla fonte: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Assunzione di sale rispetto alla linea guida | la maggior parte delle persone consuma da 9 a 12 g di sale al giorno; WHO raccomanda meno di 5 g (2 g di sodio) | measured dalla fonte: WHO fact sheet on salt reduction |
| Morti attribuibili all'alto contenuto di sodio ogni anno | circa 1,9 milioni | measured dalla fonte: WHO, *Global report on sodium intake reduction* (2023) |
| Persone che si affidano a combustibili da cucina inquinanti | circa 2,1 miliardi; circa 3,2 milioni di morti all'anno per l'inquinamento dell'aria domestica | measured dalla fonte: WHO fact sheet on household air pollution (2024) |

**Meccanismi di Cookwala:** punti di controllo critici e limiti di mantenimento in caldo, raffreddamento e riscaldamento applicati sul dispositivo e registrati; rule pack che segnalano sodio, zuccheri liberi, grassi saturi e frutta e verdura nei menu; care rules per bambini, gravidanza e anziani; un registro di revisione in modo che dietisti e responsabili della sicurezza alimentare possano garantire un pack.
**Cosa non fa:** diagnosticare, trattare o calcolare diete terapeutiche; vedere `docs/health/CLAIMS-POLICY.md`.

**Clean cooking** è presente nell'immagine ma non nel modello: i simulatori non tengono ancora conto della cottura a legna e carbone o dei suoi effetti sulla salute (elencati come una limitazione; next).

## 3. Ambiente

| Fatto | Figura | Etichetta e fonte |
|---|---|---|
| Quota delle emissioni globali di gas serra derivanti da perdite e sprechi alimentari | circa 8 to 10 % | measured dalla fonte: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrativo:** nel simulatore del mondo, "many robots with the protocol" riduce tutto il
cibo perso o sprecato di circa il 4.1 % e le emissioni di circa il 5.2 % in cinque anni rispetto al
medesimo mondo senza di essi; "many robots alone" riduce i rifiuti domestici ma aumenta le perdite prima
delle case di circa il 3 % (un effetto bullwhip). L'elettricità dei robot (circa 164 TWh in cinque anni in
quello scenario) è conteggiata. Questi sono gli output del modello sotto le sue assumptions, elencati su
ogni pagina del simulatore.

## 4. Economia e lavoro

**Assumed and modelled:** il simulatore della città stima circa 5 USD per persona al mese
meno spesa alimentare e circa 10 ore per casa al mese in meno di cucina e spesa con i robot
cuochi, hardware non incluso. Nessuna cifra per i lavori è fornita da nessuna parte; nuovi ruoli sono nominati
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) senza
numeri.

## 5. Cultura

Nessun numero. L'affermazione è qualitativa e verificabile: una ricetta Cookwala porta il nome del cuoco, l'identità del piatto (cosa è essenziale, cosa è flessibile, cosa non viene mai aggiunto), il testo nella lingua del cuoco e una firma. Le macchine che la cucinano ereditano la ricetta come conoscenza operativa, con il relativo credito.

## 6. Cosa misureremo quando ci sarà qualcosa da misurare

| Misura | Metodo | Dove definito |
|---|---|---|
| Chilogrammi salvati, pasti serviti, persone raggiunte, tasso di superamento nutrizionale, costo per pasto, tempo per la richiesta, tasso di richiesta, risultati del blocco di sicurezza, incidenti di sicurezza | calcolato dai documenti Offer, Claim, Handover e Distribution | sezione Humanitarian Profile 10; `ImpactSummary` |
| Cuochi verificati: esecuzioni che hanno eseguito una ricetta firmata end to end con un log conforme | execution logs con consenso | sezione 11 di `STRATEGY.md` |
| Implementazioni indipendenti che superano la conformance | report di conformance pubblicati | `docs/CERTIFICATION.md` |
| Risultati di agent-safety per modello | il benchmark promptfoo, con model id, data e config hash | `evals/kitchen-agent-safety/` |

## 7. Cosa non sappiamo ancora

Se un food bank salva di più con il profilo rispetto al suo metodo attuale (il protocollo del pilot esiste; nessun pilot è stato eseguito). Se gli operation envelope siano corretti per ogni cucina (uno scienziato del cibo non li ha revisionati). Se le behavioural assumptions dei simulatori siano valide (sono elencate e regolabili). Quanto siano grandi gli effetti di rimbalzo. Nulla qui è una promessa.

## 8. Cosa è andato storto

Nulla è stato distribuito, quindi nulla è andato storto sul campo. Nel repository: la prima riga singola ("world's first and largest robot cooking recipes index") ha esagerato ciò che esisteva ed è stata modificata; il primo schema Mission accettava campi sconosciuti ed è stato reso strict; i primi simulatori utilizzavano un baseline strawman e hanno ottenuto un baseline di competent-integration e dei range. Le critiche che hanno guidato questi cambiamenti sono pubblicate (`docs/CRITIQUES.md`).

## 9. Fonti

- FAO, IFAD, UNICEF, WFP e WHO, *The State of Food Security and Nutrition in the World
  2024*, Roma, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Roma, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Ginevra, 2015.
- WHO, *Global report on sodium intake reduction*, Ginevra, 2023; scheda informativa WHO *Salt
  reduction*.
- Scheda informativa WHO *Household air pollution*, 2024.

Le figure sono citate così come le pubblicano le fonti, arrotondate; ricontrollare ciascuna rispetto all'edizione corrente prima di citarla in stampa. Le organizzazioni sono fonti, non partner.

