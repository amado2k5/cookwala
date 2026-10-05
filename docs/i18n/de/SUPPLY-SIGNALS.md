<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Farm surplus und Versorgungs-Signale

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Beispiele:
> `examples/supply/`. **Gate:** wettbewerbsrechtliche Prüfung vor jeder Produktionsnutzung
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai veröffentlicht heute keine Signale.

## 1. Zwei Dinge, die Landwirte now benötigen

1. **Ein Weg, einen Überschuss aufzulisten, bevor er verrottet.** Ein Bauernhof ist ein Spender im Humanitarian Profile:
   ein `Offer` mit `Item.origin: farm` und `harvestedAt`, oder per SMS:

FARM 120KG TOMATO A BB0411

Die food bank beansprucht es, eine Küche kocht es, die Verteilung zählt es. Kein neues Dokument,
   keine personenbezogenen Daten, nur Organisationen.
2. **Ein faires Signal dessen, was benötigt wird.** Das ist der experimentelle Teil unten.

## 2. Nachfrage- und Angebotsignale

| Dokument | Sagt | Regeln |
|---|---|---|
| `DemandSignal` | In Region R, in ISO-Woche W, planen Küchen und Programme die Verwendung von zwischen L und H kg der Zutat **Klasse** C | mindestens 20 beitragende Quellen; veröffentlicht mindestens 7 Tage nach Ende der Woche; Klassenebene (Hülsenfrucht, Blattgemüse, Geflügel), niemals ein Produkt oder eine Marke; **keine Preise**; Region nicht feiner als admin1, es sei denn, 100 Quellen oder mehr |
| `SupplySignal` | In Region R, in Woche W, ist Klasse C im Überfluss, normal oder knapp, mit einem Erntefenster | veröffentlicht durch eine Genossenschaft, ein Programm oder einen Marktbetreiber; **offen für alle**: öffentlich, kostenlos, identisch für jeden Leser |

Die Referenzprüfung ist `check_signal()` in `tools/cookwala_ref.py`; die Profilvektoren
(`conformance/profiles/signal.json`) zeigen, was akzeptiert und abgelehnt wird.

## 3. Warum diese Regeln

Das Teilen von Prognosen zwischen Wettbewerbern ist der Informationsaustausch, vor dem Wettbewerbsbehörden warnen. Aggregation, Verzögerung, Klassenebene, keine Preise und offene Veröffentlichung halten das Signal nützlich für die Planung und nutzlos für die Preiskoordination. Die Schwellenwerte sind Ausgangspunkte; ein Berater und ein Statistiker sollten sie festlegen.

## 4. Was aus der Idee des Gründers wird

Die Makroschleife (RFC-0007): geplante Zubereitung → aggregierte Nachfrage →
Farmen und Läden planen den Bedarf → weniger Anbau, Transport und Abfall. Die Stadt-, Länder- und
Welt-Simulatoren zeigen die Größe des Effekts unter ihren Annahmen (illustrativ, keine
Prognose). Diese zwei Dokumente sind der kleinste ehrliche Schritt in diese Richtung.

## 5. Later

Anbauhinweise aus der vorausschauenden Nachfrage; Reservengröße (eine perfekt schlanke Lieferkette ist
fragil); regionenübergreifende Entlastungsströme; Versorgungsignale per SMS von Genossenschaften.

