<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Critiche che abbiamo pubblicato

Abbiamo posto domande difficili su Cookwala e abbiamo scritto le risposte. Ogni preoccupazione ha un id nel [concern register dell'action plan](ACTION-PLAN.md#2-concern-register), insieme alla nostra risposta e al suo status. Le revisioni esterne sono benvenute e saranno elencate qui.

## Funzionerà? (strategy)

| Preoccupazione | Risposta breve | Stato |
|---|---|---|
| Il mercato non esiste ancora; la specifica è in anticipo sui prodotti | Small Core, prima la demo, nessuna nuova specifica senza utenti | Core 0.2 completato; demo del dispositivo next |
| Nessuno con potere ha un motivo per adottare | Guidare con il vantaggio per ogni adopter; utile senza robot | Cercasi pilota food-bank e partner per il dispositivo |
| I simulatori provano ciò che assumono | Baseline equa, intervalli, etichette "illustrative"; i piloti li sostituiscono | Open |
| La fame riguarda la povertà e i conflitti, non il surplus | Cookwala contribuisce; non sostiene di porre fine alla fame da sola | Messaggio cambiato |
| Sicurezza, responsabilità e superficie di attacco | Limiti imposti sul dispositivo; refusal; recall; report degli incidenti | Spec completata; revisione del certifier open |
| Privacy (dati sanitari e religiosi, ledger vs cancellazione) | Local-first, divulgazione selettiva, log solo hash, consenso | Spec completata; valutazione dell'impatto open |
| Troppo complesso | Core 0.2; tutto il resto contrassegnato come sperimentale | Done |
| Dipendenza dal fondatore | Percorso di governance verso una sede neutrale | GOVERNANCE.md |

## Il design tecnico è solido?

| Preoccupazione | Cosa è cambiato in Core 0.2 |
|---|---|
| Le operazioni non avevano un significato fisico | Envelopes, livelli di calore, sensor ladders, regola di altitudine, vettori di test |
| Bug di unità e numeri | Solo °C, tolleranze assolute, unità di cucina, densità, denaro decimale |
| Gli schemi accettavano refusi | Schemi rigorosi con estensioni `x-`; bundle offline |
| Un unico documento Mission mutabile | Event log + proiezione, sequencer singolo, tabella delle transizioni |
| Il ledger forniva poco | Record chiave con revoca, checkpoint testimoniati, rilevamento di riscrittura |
| Consegna degli eventi non definita; sicurezza sul bus | Numeri di sequenza, classi di latenza, heartbeats, "la sicurezza è locale" |
| Deriva delle superfici API | Core OpenAPI; ogni riferimento controllato in CI |
| Nessun verificatore | Libreria di riferimento e 106 vettori di conformance |

## Recensioni che stiamo richiedendo

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), scienziati alimentari
(envelopes), responsabili della sicurezza alimentare e dietisti (rule packs), un audit di sicurezza, una
revisione della protezione dei dati e un'analisi delle lacune di un ente di certificazione. Vedi il
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

