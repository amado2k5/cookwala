<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Surplus agricolo e segnali di offerta

> **Stato: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Esempi:
> `examples/supply/`. **Gate:** revisione della legge sulla concorrenza prima di qualsiasi uso in produzione
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai non pubblica alcun segnale oggi.

## 1. Due cose di cui gli agricoltori hanno bisogno now

1. **Un modo per elencare un surplus prima che marcisca.** Una fattoria è un donatore nel Humanitarian Profile:
   un `Offer` con `Item.origin: farm` e `harvestedAt`, o tramite SMS:

   FARM 120KG TOMATO A BB0411
   ```

Il food bank lo dichiara, una cucina lo cucina, la distribuzione lo conta. Nessun nuovo documento,
nessun dato personale, solo organizzazioni.
2. **Un segnale equo di ciò che sarà necessario.** Quella è la parte sperimentale qui sotto.

## 2. Segnali di domanda e offerta

| Document | Dice | Regole |
|---|---|---|
| `DemandSignal` | Nella regione R, nella settimana ISO W, cucine e programmi hanno pianificato di utilizzare tra L e H kg di ingrediente di **classe** C | almeno 20 fonti contributive; pubblicato almeno 7 giorni dopo la fine della settimana; livello di classe (legume, verdura a foglia, pollame), mai un prodotto o un marchio; **nessun prezzo**; regione non più dettagliata di admin1 a meno di 100 fonti o più |
| `SupplySignal` | Nella regione R, nella settimana W, la classe C è in eccesso, con offerta normale o scarsa, con una finestra di raccolto | pubblicato da una cooperativa, un programma o un operatore di mercato; **aperto a tutti**: pubblico, gratuito, identico per ogni lettore |

Il controllo di riferimento è `check_signal()` in `tools/cookwala_ref.py`; i vettori del profilo (`conformance/profiles/signal.json`) mostrano cosa è accettato e cosa è rifiutato.

## 3. Perché queste regole

La condivisione di previsioni tra concorrenti è lo scambio di informazioni di cui le autorità per la concorrenza mettono in guardia. L'aggregazione, il ritardo, il livello di classe, l'assenza di prezzi e la pubblicazione aperta mantengono il segnale utile per la pianificazione e inutile per coordinare i prezzi. Le soglie sono punti di partenza; un consulente e uno statistico dovrebbero stabilirle.

## 4. Cosa diventa l'idea del fondatore

Il ciclo macro (RFC-0007): cottura pianificata → domanda aggregata →
le fattorie e i negozi pianificano il fabbisogno → meno coltivato, spostato e buttato via. I simulatori di città, paese e
mondo mostrano l'entità dell'effetto sotto le loro assunzioni (illustrativo, non una
previsione). Questi due documenti sono il più piccolo passo onesto verso di esso.

## 5. Later

Consigli di semina dalla domanda anticipata; dimensionamento delle riserve (una catena di approvvigionamento perfettamente lean è
fragile); flussi di soccorso interregionali; segnali di approvvigionamento tramite SMS dalle cooperative.

