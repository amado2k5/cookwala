<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->

# Küchen und Produktionsläufe: Restaurants, Gemeinschaft, Schule, Katastrophenhilfe und Roboterküchen

> **Status: experimentelles Profil** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Beispiele: `examples/fleet/`.

## 1. Warum

Der Gründer fragte nach demselben Protokoll in einem Restaurant, einer Hochzeit, einer Spendenaktion oder einer Lebensmittel Fabrik (RFC-0005). Das Briefing ergänzt Schulmahlzeit-Programme und Katastrophenküchen. Der Kern deckt das Kochen eines Rezepts mit einem Gerät ab; das Humanitarian Profile deckt die Verteilung von surplus und das Zählen von Mahlzeiten ab. Dazwischen steht die **kitchen**: Stationen, Geräte, Menschen, viele Batches, ein Ausgabezeitfenster, kritische Kontrollpunkte und die Verbindung vom execution log eines Geräts zu den Mahlzeiten, die ein Programm meldet.

## 2. Dokumente

| Dokument | Was es sagt |
|---|---|
| `Kitchen` | Die Küche einer Organisation: Typ, Stationen (Vorbereitung, Kochfeld, Ofen, Fritteuse, Wasserkocher, Roboterzelle, Anrichten, Verpacken, Warmhalten, Kühlung, Kaltlager, Spülbereich), Geräte als Kapazitätsreferenzen, Kapazität in Mahlzeiten pro Stunde, Warmhalte- und Kühlgeräte, in Kraft befindliche rule packs, Personal **Anzahl nach Rolle**, Betriebszeiten |
| `ProductionRun` | Rezepte mit Chargenzahlen und Portionen, ein Servierfenster, Zuweisungen pro Rezeptschritt zu einer Station und zu einem `device`, einer `person` oder beidem, Aufzeichnungen zu kritischen Kontrollpunkten (Kernkochtemperatur, Warmhalten, zweistufige Kühlung, Aufwärmen, Kühl Lagerung, Allergen-Trennung), die erzeugten Core-Ausführungen und ein Ergebnis (produzierte und servierte Mahlzeiten, Abfall, genutztes gerettetes Essen, Fehler, Vorfälle, Energie, Kosten, die emittierte humanitäre `Distribution`) |
| `StationLease` | Exklusive Nutzung einer Station durch ein `device` oder eine Rolle für eine Zeitspanne |

## 3. Wie es sich mit dem Rest verbindet

- Ein einem `device` zugewiesener Schritt ist ein Core `ExecuteRequest` (oder ein `ExecuteNode` Ziel über das ROS 2 binding); sein `ExecutionLog` Hash geht in `executions`.
- Ein Durchlauf, der einem Programm dient, emittiert eine Humanitarian `Distribution`; die `ccps` des Durchlaufs sind die Belege hinter den Sicherheitsbefunden der Distribution.
- Rule packs aus dem Humanitarian Profile gelten für das Menü und die Artikel des Durchlaufs.
- Fleet dispatch (welcher Roboter wohin geht) gehört zu Open-RMF oder dem Fleet Manager eines Anbieters, nicht zu diesem Profil.

## 4. Durchgerechnetes Beispiel

`examples/fleet/kitchen-disaster.json` und `production-run-disaster.json`: eine Hilfsküche
mit zwei Gas-Kesseln, Warmhalteeinheiten und einem Eisbad produziert 710 Mahlzeiten aus Linsensuppe und
Reis für ein zwei-stündiges Zeitfenster, zeichnet Koch- und Warmhaltetemperaturen auf, findet eine Warmhalteeinheit
unter 60 °C und erwärmt diese Charge vor dem Servieren neu, und gibt eine Verteilung aus. Das Beispiel ist
illustrativ; es wird keine echte Küche oder ein echtes Ereignis beschrieben.

## 5. Was bewusst weggelassen wird

Mitarbeiternamen und Zeitpläne, Löhne, Kundenbestellungen und Zahlungen, Menüpreise. Mitarbeiter erscheinen
als Anzahl nach Rolle, sodass die Kosten pro Mahlzeit berechnet werden können, ohne jemanden zu identifizieren.

## 6. Next

Beispiel für Restaurant-Service mit einer Roboterstation; eine conformance Suite für die Run-State-Machine; Vereinigung von `StationLease` mit Session-Leases (`session.schema.json`).

