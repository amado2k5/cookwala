<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Föderation: wie Cookwala ohne Zentrum funktioniert

**Status:** Entwurf, 2026-10-04 (RFC-0006). Das Bild des Gründers war ein Bienenstock: kein zentrales
Kommando, und doch Harmonie und Erholung. Diese Seite erklärt, was das in der Praxis bedeutet.

## 1. Nodes

| Node | Was es dient | Wer eines betreibt |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, Rezepte, Vokabulare, rule packs, Schlüssel, Feeds | ein Rezept-Publisher, ein food-bank Netzwerk, eine Universität, ein Gerätehersteller, cookwala.ai |
| **Registry** | `/v1/registry.json`: Pointer auf Catalogs, Collections, Devices, Packs, Benchmarks | jeder; cookwala.ai betreibt eines |
| **Hub** | die Core API für eine Küche, lokale Sicherheitsgrenzwerte, der household context | jede Küche; funktioniert offline |
| **Mirror** | veröffentlicht signierte Elemente anderer Nodes unverändert neu | jeder, der Resilienz in seiner Region möchte |

Ein statischer Ordner ist ein gültiger Katalog. Ein Telefon mit den CSV-Templates ist ein gültiger humanitärer Teilnehmer auf Level H0.

## 2. Feeds, nicht Befehle

Knoten veröffentlichen signierte Feeds: recalls, anonyme Vorfälle, Registry-Änderungen, wichtige Datensätze.
Andere Knoten fragen ab, was sie vertrauen, und können es erneut veröffentlichen. Nichts wird in eine Küche gepusht; eine
Küche zieht sich die Daten, wenn sie online ist, und arbeitet weiter, wenn sie es nicht ist.

## 3. Gegen den Issuer prüfen, niemals gegen den Relay

Ein Recall, der über einen Mirror eintrifft, ist nur so gut wie die Signatur des **Ausstellers**. Ein Hub löst den `KeyRecord` des Ausstellers aus dem eigenen Discovery-Dokument des Ausstellers oder did:web auf und verifiziert den Body Byte für Byte. Der Key des Mirrors beweist nichts über den Inhalt; ein Mirror, der einen Recall bearbeitet, bricht die Signatur. Profil-Vektoren in `conformance/profiles/federation.json` zeigen die drei Fälle.

## 4. Vertrauenslisten

Jeder hub führt eine Liste von Katalogen und registries, denen er vertraut, mit deren Schlüsseln und einer Priorität. Ein node kann peers (`federation.peers`) vorschlagen; der hub entscheidet. cookwala.ai ist ein Eintrag auf einer solchen Liste, kein root.

## 5. Frische

Registry-Einträge tragen einen Status und eine Veröffentlichungszeit; recalls tragen eine Ausstellungszeit; household facets tragen eine Gültigkeit. Veraltete Elemente werden neu abgerufen oder verworfen. Nichts wird vertraut, nur weil es alt ist, nichts wird stillschweigend gelöscht: zurückgezogene Einträge bleiben als tombstones bestehen.

## 6. Geschichte

Event-Logs mit bezeugten Checkpoints (Core Abschnitt 5) machen Rewrites ohne eine
Blockchain nachweisbar: Eine zweite Partei unterzeichnet den Kopf des Logs, und ein later Rewrite
passt nicht mehr. Das öffentliche Anchoring von Checkpoint-Köpfen ist optional und ist eine Gründerentscheidung
(`docs/research/BACKSTORY.md` Abschnitt 4.7).

## 7. Drei Knoten, die interoperieren

- **Ein food-bank-Netzwerk** betreibt ein registry seiner Küchen und Spender, einen Katalog seiner an das nationale Recht angepassten rule packs und ein SMS-Gateway. Es listet sich im cookwala.ai directory auf oder nicht; seine Daten müssen niemals sein Land verlassen.
- **Ein Gerätehersteller** betreibt einen Katalog seiner Fähigkeitsdokumente und safety-limit packs, veröffentlicht conformance-Berichte und fragt die recall-Feeds der Kataloge ab, die seine Kunden nutzen.
- **Ein Universitätslabor** betreibt einen Katalog von Benchmark-Rezepten und execution logs (mit Zustimmung), spiegelt die Vokabulare und veröffentlicht seine eigenen Vektoren.

Keiner von ihnen benötigt cookwala.ai online zu sein.

## 8. Was nicht gebaut wurde

Ein zentraler Orchestrator, ein zentraler Identity Provider, ein Token, eine Blockchain. Die Quorum-Entscheidungen und Orchestratoren des Mission-Profils bleiben optional und experimentell.

