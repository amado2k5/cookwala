<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Federazione: come Cookwala funziona senza un centro

**Status:** draft, 2026-10-04 (RFC-0006). L'immagine del fondatore era un alveare: nessun comando centrale, eppure armonia e recupero. Questa pagina spiega cosa significhi ciò in pratica.

## 1. Nodi

| Nodo | Cosa serve | Chi ne gestisce uno |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recipes, vocabularies, rule packs, keys, feeds | un editore di ricette, una rete food-bank, un'università, un produttore di dispositivi, cookwala.ai |
| **Registry** | `/v1/registry.json`: puntatori a catalogs, collections, devices, packs, benchmarks | chiunque; cookwala.ai ne gestisce uno |
| **Hub** | la Core API per una cucina, limiti di sicurezza locali, il household context | ogni cucina; funziona offline |
| **Mirror** | ripubblica gli elementi firmati di altri nodi senza modifiche | chiunque desideri resilienza nella propria regione |

Una cartella statica è un catalogo valido. Un telefono con i template CSV è un partecipante umanitario valido al livello H0.

## 2. Feed, non comandi

I nodi pubblicano feed firmati: recall, incidenti anonimi, modifiche al registry, record chiave.
Altri nodi interrogano ciò di cui si fidano e possono ripubblicarlo. Nulla viene spinto in una cucina; una
cucina effettua il pull quando è online e continua a lavorare quando non lo è.

## 3. Verificare rispetto all'issuer, mai rispetto al relay

Un recall che arriva attraverso uno specchio è valido solo quanto la firma dell'**issuer**. Un hub risolve la `KeyRecord` dell'issuer dal proprio documento di discovery o da did:web e verifica il corpo byte per byte. La chiave dello specchio non prova nulla riguardo al contenuto; uno specchio che modifica un recall rompe la firma. I vettori di profilo in `conformance/profiles/federation.json` mostrano i tre casi.

## 4. Liste di fiducia

Ogni hub mantiene un elenco di cataloghi e registry di cui si fida, con le relative chiavi e una priorità. Un nodo può suggerire peer (`federation.peers`); il hub decide. cookwala.ai è una voce in tale elenco, non una root.

## 5. Freschezza

Le voci del registry portano uno stato e un tempo di pubblicazione; i recall portano un tempo di emissione; i facet dell'household portano una validità. Gli elementi obsoleti vengono recuperati o scartati. Nulla è considerato affidabile perché è vecchio, nulla viene eliminato silenziosamente: le voci ritirate rimangono come tombstones.

## 6. Storia

I log degli eventi con checkpoint testimoniati (Core section 5) rendono le riscritture rilevabili senza una
blockchain: una seconda parte controfirma la testa del log, e una riscrittura later non corrisponde
più. L'ancoraggio pubblico delle teste dei checkpoint è opzionale ed è una decisione dei fondatori
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Tre nodi che interoperano

- **Una rete di food bank** gestisce un registry delle sue cucine e dei suoi donatori, un catalogo dei suoi rule pack adattati alla legge nazionale e un gateway SMS. Si elenca nel directory cookwala.ai o no; i suoi dati non devono mai lasciare il suo paese.
- **Un produttore di dispositivi** gestisce un catalogo dei suoi documenti di capacità e dei suoi safety-limit pack, pubblica report di conformance e interroga i feed di recall dei cataloghi utilizzati dai suoi clienti.
- **Un laboratorio universitario** gestisce un catalogo di ricette di benchmark e execution log (con consenso), rispecchia i vocabolari e pubblica i propri vettori.

Nessuno di loro ha bisogno che cookwala.ai sia online.

## 8. Cosa non è costruito

Un orchestratore centrale, un fornitore di identità centrale, un token, una blockchain. Le decisioni di quorum e gli orchestratori del profilo Mission rimangono opzionali ed sperimentali.

