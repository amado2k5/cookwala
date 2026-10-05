<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance e il percorso verso la certification

**Status:** draft, 2026-10-04 (RFC-0008). Nessun certificatore è stato ancora incaricato; questo è il percorso
che lo standard offre.

## 1. Tre passaggi

| Step | Chi | Cosa significa | Mostrato come |
|---|---|---|---|
| **Self-declared** | Il produttore o l'editore | Ha eseguito i vettori pubblici con lo strumento pubblico e ha pubblicato un `ConformanceReport` (`schemas/conformance.schema.json`), firmato con la propria chiave | il report, con le suite e i conteggi; mai un badge |
| **Verified** | Un operatore del registry | Ha riprodotto l'esecuzione contro lo stesso hash del set di vettori e ha controfirmato il report | il report più il verifier |
| **Certified** | Un certifier indipendente (nessuno esiste oggi) | Ha eseguito la suite più i controlli hardware e di safety-case sotto uno schema pubblicato e ha concesso il marchio | il report, il certifier, il marchio |

Un report che fallisce qualsiasi vettore di una classe non può rivendicare quella classe. Il registry mostra
report, non badge.

Oggi l'unico operatore del registry è il manutentore della specifica (cookwala.ai), quindi "verified" non aggiunge alcuna indipendenza finché non esiste un secondo registry; lo stato è ancora mostrato come self-verification.

## 2. Cosa contiene un report

Versione core, la classe dichiarata (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) o una dichiarazione di profilo (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), il soggetto (prodotto, fornitore, versione), le suite eseguite con i totali e gli id dei vettori falliti, l'hash del set di vettori, lo strumento e il commit, la data, lo stato e il
verifier. Esempio: `examples/conformance/report-reference.json`, prodotto da

```bash
python tools/run_conformance.py --report report.json
```

## 3. Classi e cosa dimostrano

| Classe | Vettori | Anche necessario per la certification (non coperto dai vettori) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review delle ricette da parte di un professionista della sicurezza alimentare |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | il safety case del dispositivo stesso (ISO 13482, IEC 60335, UL 3300 come applicabile); local stop latency measured; safety limits enforced senza rete |
| Catalog | hash, signature, key revocation, recalls | key custody e processo di incident intake |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | risultati pubblicati per model con metodo |
| Verifier | tutte le suite Core | nessuno |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; no personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof process |

## 4. Cosa la certification non può promettere

Un rapporto di conformance dimostra che il software si è comportato come richiesto dai vettori nel giorno in cui è stato eseguito.
Non dimostra che un dispositivo sia sicuro in ogni cucina, che una ricetta abbia un buon sapore o che
non possa accadere alcun danno. Uno standard che promettesse zero danni sarebbe disonesto; questo promette
che i limiti siano applicati localmente, che i refusal avvengano prima di heat, e che i record possano essere
controllati.

## 5. Governance del marchio

Il marchio di certification e le sue regole si spostano sulla fondazione neutrale con il marchio registrato (`GOVERNANCE.md`). Fino ad allora non esiste alcun marchio; esistono solo i report.

