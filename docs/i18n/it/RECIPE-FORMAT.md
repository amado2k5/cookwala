<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Formato ricetta Cookwala: ricette che funzionano con le Missioni

Una ricetta in Cookwala non è un elenco di istruzioni. È **conoscenza culinaria portabile**
che un pianificatore *compila* rispetto a una Mission specifica (household, robots, appliances,
energy, budget, health, timing) in un piano eseguibile. Il robot esegue quindi quel piano,
adattandosi attraverso contingency e playbook quando la realtà cambia.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Esempio completo svolto:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Quattro livelli (adattato dall'approccio delle WHO SMART Guidelines)

| Layer | Cosa contiene | Chi lo scrive | Dove risiede |
|---|---|---|---|
| **R1 Narrative** | Testo della ricetta umana, storia, note culturali, foto | Cuochi, chef, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Cosa il piatto *è* e *deve essere*: identità (essenziale vs flessibile), obiettivi sensoriali, nutrizione, stile di servizio e consumo, conservazione, controlli di accettazione | Editor di ricette, assistito da AI, revisionato | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Metodo agnostico rispetto al dispositivo: formula (rapporti + ruoli), grafo del processo di ops tipizzate con pre/post condizioni dello stato del cibo, condizioni `until`, alternative, regole di pausa, modalità di fallimento, affordance, pericoli, CCP, preparazione dell'ambiente | Pipeline di esportazione + revisione; verificato dal simulatore (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | La ricetta R3 compilata per *questa* Mission: quantità esatte, varianti scelte, attori e dispositivi assegnati, programma, leasing, monitor, contingenze | Il planner/compilatore, al run time | All'interno della **Mission** (`plan`), mai nel catalogo |

Come il codice sorgente e un compilatore: **la ricetta è una rappresentazione intermedia portabile
(R3 + R2). La Mission è la macchina target.** È questo che mantiene le ricette valide mentre i robot
e l'IA cambiano: un pianificatore migliore produce un R4 migliore dalla stessa ricetta.

## 2. Cosa fa ogni sezione in una Mission

| Sezione della ricetta | Usata dalla Mission per… |
|---|---|
| `identity.essential / flexible / neverAdd` | Sostituzioni, modalità budget e razione, adattamenti dietetici: cambia le parti `flexible`, mai le `essential`, affinché il piatto sia ancora se stesso |
| `formula` (ratios, min/max, role, scaling) | Scaling esatto per qualsiasi numero di persone, razionamento degli ingredienti su una settimana, estensione del budget, utilizzo di ciò che è a disposizione (il rescale dell'ingrediente limitante) |
| `sensory` | Checkpoint di visione, aroma e gusto; profili del gusto `household` (sale 2 vs 4); decisioni di riutilizzo e correzione |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Task di preparazione dell'ambiente:** se il lavandino o il piano cottura sono occupati, il planner aggiunge task di "pulire, lavare, asciugare"; i task di ammollo o scongelamento sono pianificati con ore di anticipo |
| `process.nodes[]` con stati del cibo `pre`/`post` | Pianificazione (inizia solo ciò che è pronto), verifica (lo step ha prodotto lo stato?), riprendi dopo le interruzioni |
| `until`, `onTimeout`, `retry` | Sapere quando uno step è terminato e cosa fare quando non lo è |
| `alternatives[]` + `energy` | Gas vs induzione vs forno, risparmio batteria, cucine senza forno, ore di silenzio |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruzioni:** un bambino ha bisogno di aiuto, il proprietario chiama, il cane fa cadere qualcosa. Il robot mette lo step nel suo `safeState`, gestisce l'evento, poi riprende, riscalda, salva o scarta in base al budget di pausa |
| `failureModes` (incident, detect, prevent, playbook) | Rilevamento precoce di problemi noti e il `playbook` esatto per recuperare |
| `affordances`, `space` | Abbinamento degli step a robot che possono afferrare, sollevare e raggiungere; mantenere le zone calde lontane dai bambini |
| `safety` (hazards, CCPs, supervision, abort) | Il kernel di sicurezza: invarianti che ogni piano deve preservare |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servizio: cosa va in tavola, nella stanza, nella lunchbox; promemoria e limiti di attesa; stile di mangiare culturale |
| `storage` | Avanzi, Mission di cook-ahead e lunchbox |
| `acceptance` | I *test* della ricetta: la Mission è terminata quando questi sono rispettati |
| `nutrition`, `cost` | Porzioni personali, budget, razioni di soccorso |

## 3. Esempio: un passaggio con tutto collegato

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Compilazione di una ricetta per una Mission (cosa fa il planner)

1. **Seleziona la variante:** dieta, consistenza (IDDSI), attrezzatura, energia e scelta della modalità da
   `alternatives`. Gli elementi essenziali dell'identità devono sopravvivere.
2. **Scala:** dalla `formula` e dalle porzioni, porzioni per persona (HEALTH.md), l'ingrediente
   limitante, o un orizzonte di razionamento. Spezie in modo sub-lineare, tempo tramite esponente di massa.
3. **Sostituisci** all'interno dei ruoli, rispettando `identity.neverAdd`, allergeni, pacchetti dietetici
   e inventario.
4. **Prepara l'ambiente:** confronta `prep` con le facet dello spazio della Missione (lavandino pieno?
   fornello occupato? tagliere sporco?) e aggiungi compiti di riordino, lavaggio, asciugatura e preparazione. Pianifica
   `advanceTasks` (ammollo, scongelamento, marinatura, preriscaldamento).
5. **Associa:** assegna ogni nodo a robot, elettrodomestici o umani tramite affordance e
   capacità. Noleggia fornelli, recipienti e zone. Attacca monitor (pentola smart, ETA della consegna,
   rilevatore di fumo).
6. **Pianifica** a ritroso rispetto all'ora del servizio, rispettando i budget di pausa, i limiti di batteria
   ed energia, le ore di silenzio domestico e le finestre di condivisione della cucina.
7. **Attacca le contingenze:** le `failureModes` e le regole di `pause` di ogni nodo, oltre alle
   policy globali della Missione (interruzioni, bambino o animale domestico vicino al fornello, watchdog del piano cottura,
   controllo deterioramento).
8. **Verifica:** controlli schema + semantici, pacchetti di policy, copertura CCP, dry run del simulatore,
   invarianti dello stack di priorità (PROTOCOL §7.2).
9. **Emetti R4** nel `plan` della Missione, firmalo e consegnalo al robot.

## 5. Autore e conversione

- **Da fifi.cooking:** la pipeline EXPORT-FIFI genera R1 + R2 + R3. Le nuove
  sezioni (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  sono generate da modelli locali dal testo esistente e controllate da validator e
  revisione umana campionata.
- **Dal web:** `cookwala convert --from schema-org` → R1/R2 (V0), poi lo stesso
  arricchimento.
- **Verso altri formati:** schema.org Recipe (R1/R2 per i motori di ricerca), Cooklang (editing
  umano), PDDL o logica temporale (research planners) possono tutti essere generati da R3.
- **A mano:** `cookwala init recipe` crea lo scaffold di tutti i livelli; `cookwala validate` e
  `cookwala simulate` li controllano.
- **Versioning:** le revisioni sono immutabili e hashate. I fork registrano `meta.derivedFrom`.
  I **patches** delle ricette (da playbook o feedback) sono proposti come diff e promossi solo
  dopo revisione ed evidenza.

## 6. Lingua del testo del passaggio

Le frasi dei passaggi sono scritte prima per una persona e poi analizzate da una macchina. Il testo dei passaggi in arabo negli esempi di ricette utilizza l'imperativo femminile (قطّعي، سخّني), che è la convenzione comune dei libri di cucina egiziani; è una scelta deliberata, non una svista, e un editore può utilizzare il passivo neutro (تُقطَّع البصلة) al suo posto. I campi `op`, `params` e `until` portano il significato; la frase è per il cuoco.

## 7. Perché questo rimane a prova di futuro

- Le ricette descrivono **food outcomes and constraints, not motions**. Nuovi robot e nuove AI
  producono piani R4 migliori dallo stesso R3.
- Tutte le nuove sezioni sono **optional and additive**. Una ricetta V0 (solo R1) funziona ancora per
  la cottura umana guidata; ogni livello aggiunto sblocca maggiore automazione.
- I campi `x-` sconosciuti vengono trasmessi. Fornitori, chef ed enti sanitari possono estendere le ricette
  senza interrompere nessuno.
- Gli **acceptance checks** permettono a qualsiasi esecutore, umano o robot, di dimostrare che il piatto sia venuto bene,
  che è il modo in cui le ricette salgono a V3 con field evidence.

