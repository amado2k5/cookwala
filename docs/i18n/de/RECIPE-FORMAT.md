<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->

# Cookwala Rezeptformat: Rezepte, die mit Missions funktionieren

Ein Rezept in Cookwala ist keine Liste von Anweisungen. Es ist **portables Kochwissen**, das ein Planer *erstellt*, um es gegen eine spezifische Mission (Haushalt, Roboter, Geräte, Energie, Budget, Gesundheit, Timing) in einen ausführbaren Plan zu überführen. Der Roboter führt diesen Plan dann aus und passt ihn durch Contingencies und Playbooks an, wenn sich die Realität ändert.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Vollständiges Arbeitsbeispiel:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Vier Schichten (adaptiert aus dem WHO SMART Guidelines Ansatz)

| Layer | Was es enthält | Wer es schreibt | Wo es lebt |
|---|---|---|---|
| **R1 Narrative** | Menschlicher Rezepttext, Geschichte, kulturelle Notizen, Fotos | Köche, Chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Was das Gericht *ist* und *sein muss*: Identität (essenziell vs. flexibel), sensorische Ziele, Ernährung, Servier- und Essstil, Lagerung, Akzeptanzprüfungen | Rezepteditoren, KI-unterstützt, geprüft | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Gerätunabhängige Methode: Formel (Verhältnisse + Rollen), Prozessgraph typisierter ops mit Food-State Pre/Post-Bedingungen, `until` Bedingungen, Alternativen, Pausenregeln, Fehlermodi, Affordanzen, Gefahren, CCPs, Umgebungsvorbereitung | Export-Pipeline + Review; simulator-verifiziert (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | Das für *diese* Mission kompilierte R3-Rezept: exakte Mengen, gewählte Varianten, zugewiesene Akteure und Geräte, Zeitplan, Leases, Monitore, Eventualitäten | Der Planner/Compiler, zur Laufzeit | Innerhalb der **Mission** (`plan`), niemals im Katalog |

Wie Quellcode und ein Compiler: **das Rezept ist eine portable Zwischenrepräsentation
(R3 + R2). Die Mission ist die Zielmaschine.** Das ist es, was Rezepte gültig hält, während Roboter
und KI sich verändern: ein besserer Planner erzeugt ein besseres R4 aus demselben Rezept.

## 2. Was jeder Abschnitt in einer Mission bewirkt

| Rezeptabschnitt | Wird von der Mission verwendet für… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutionen, Budget- und Rationierungsmodi, Diätanpassungen: ändere die flexiblen Teile, niemals die Essentials, damit das Gericht weiterhin sich selbst bleibt |
| `formula` (ratios, min/max, role, scaling) | Exakte Skalierung auf jede Anzahl von Personen, Rationierung von Zutaten über eine Woche, Budgetstreckung, Aufbrauchen dessen, was vorhanden ist (die Reskalierung basierend auf der limitierenden Zutat) |
| `sensory` | Sicht-, Aroma- und Geschmackskontrollpunkte; Geschmacksprofile im household context (Salz 2 vs 4); Entscheidungen zum Zweckentfremden und Korrigieren |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Umgebungsvorbereitungsaufgaben:** wenn das Spülbecken oder der Herd belegt ist, fügt der Planer „reinigen, waschen, trocknen“-Aufgaben hinzu; Einweich- oder Auftauaufgaben werden Stunden im Voraus geplant |
| `process.nodes[]` mit `pre`/`post` Food-Zuständen | Planung (nur starten, was bereit ist), Verifizierung (hat der Schritt den Zustand erzeugt?), Fortsetzen nach Unterbrechungen |
| `until`, `onTimeout`, `retry` | Wissen, wann ein Schritt abgeschlossen ist und was zu tun ist, wenn er es nicht ist |
| `alternatives[]` + `energy` | Gas vs. Induktion vs. Ofen, Energiesparmodus, Küchen ohne Ofen, Ruhezeiten |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Unterbrechungen:** ein Kind braucht Hilfe, der Besitzer ruft, der Hund stößt etwas um. Der Roboter versetzt den Schritt in seinen safeState, bearbeitet das Ereignis, setzt dann fort, erwärmt erneut, rettet oder entsorgt basierend auf dem Pause-Budget |
| `failureModes` (incident, detect, prevent, playbook) | Früherkennung bekannter Probleme und das exakte Playbook zur Wiederherstellung |
| `affordances`, `space` | Abgleich von Schritten mit Robotern, die greifen, heben und erreichen können; heiße Zonen von Kindern fernhalten |
| `safety` (hazards, CCPs, supervision, abort) | Der Safety-Kernel: Invarianten, die jeder Plan bewahren muss |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servieren: was auf den Tisch kommt, in den Raum, in die Lunchbox; Erinnerungen und Haltegrenzen; kultureller Essstil |
| `storage` | Reste, Cook-ahead und Lunchbox-Missionen |
| `acceptance` | Die *Tests* des Rezepts: Die Mission ist abgeschlossen, wenn diese Bestand haben |
| `nutrition`, `cost` | Persönliche Portionen, Budget, Hilfsrationen |

## 3. Beispiel: ein Schritt mit allem Anhang

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

## 4. Erstellen eines Rezepts für eine Mission (was der Planner tut)

1. **Wähle die Variante:** Diät, Textur (IDDSI), Ausrüstung, Energie und Modus aus
   `alternatives`. Identitäts-Essenzials müssen erhalten bleiben.
2. **Skalierung:** aus `formula` und den Portionen, Portionen pro Person (HEALTH.md), der
   limitierenden Zutat oder einem Ration-Horizont. Gewürze sublinear, Zeit nach Massenexponent.
3. **Ersetze** innerhalb von Rollen unter Beachtung von `identity.neverAdd`, Allergenen, Diät-Packs
   und Inventar.
4. **Bereite die Umgebung vor:** vergleiche `prep` mit den Raum-Facetten der Mission (Spüle voll?
   Herd belegt? Brett schmutzig?) und füge Aufräum-, Wasch-, Trocken- und Bereitstellungsaufgaben hinzu.
   Plane `advanceTasks` (einweichen, auftauen, marinieren, vorheizen).
5. **Binde:** Weise jeden Knoten Robotern, Geräten oder Menschen durch Affordanzen und
   Fähigkeiten zu. Lease Brenner, Gefäße und Zonen. Hänge Monitore an (Smart Pot, Liefer-
   ETA, Rauchmelder).
6. **Plane** rückwärts von der Servierzeit, unter Einhaltung von Pausen-Budgets, Batterie- und
   Energielimits, Ruhezeiten im Haushalt und Küchen-Sharing-Fenstern.
7. **Füge Eventualitäten hinzu:** die `failureModes` und `pause`-Regeln jedes Knotens, plus die
   globalen Richtlinien der Mission (Unterbrechungen, Kind oder Haustier am Herd, Herd-Watchdog,
   Verderb-Überwachung).
8. **Verifiziere:** Schema + semantische Prüfungen, Policy-Packs, CCP-Abdeckung, Simulator dry-run,
   Priority-Stack-Invarianten (PROTOCOL §7.2).
9. **Gib R4** in den `plan` der Mission aus, signiere ihn und übergib ihn dem Roboter.

## 5. Erstellen und Konvertieren

- **Von fifi.cooking:** Die EXPORT-FIFI-Pipeline generiert R1 + R2 + R3. Die neuen
  Abschnitte (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  werden von lokalen Modellen aus dem bestehenden Text generiert und durch Validatoren sowie
  stichprobenartige menschliche Überprüfung geprüft.
- **Aus dem Web:** `cookwala convert --from schema-org` → R1/R2 (V0), dann dieselbe
  Anreicherung.
- **In andere Formate:** schema.org Recipe (R1/R2 für Suchmaschinen), Cooklang (menschliche
  Bearbeitung), PDDL oder temporale Logik (Forschungs-Planer) können alle aus R3 generiert werden.
- **Von Hand:** `cookwala init recipe` erstellt das Gerüst für alle Ebenen; `cookwala validate` und
  `cookwala simulate` prüfen diese.
- **Versionierung:** Revisionen sind unveränderlich und gehasht. Forks protokollieren `meta.derivedFrom`.
  Rezept-**patches** (aus Playbooks oder Feedback) werden als Diffs vorgeschlagen und erst nach
  Überprüfung und Evidenz übernommen.

## 6. Sprache des Schritttextes

Schrittsätze sind primär für eine Person geschrieben und werden sekundär von einer Maschine geparst. Der arabische Schritttext in den Beispielrezepten verwendet den femininen Imperativ (قطّعي، سخّني), was der üblichen ägyptischen Kochbuchkonvention entspricht; es ist eine bewusste Entscheidung, kein Versehen, und ein Verleger kann stattdessen das geschlechtsneutrale Passiv (تُقطَّع البصلة) verwenden. Die Felder `op`, `params` und `until` tragen die Bedeutung; der Satz ist für den Koch.

## 7. Warum dies zukunftssicher bleibt

- Rezepte beschreiben **food outcomes und constraints, nicht motions**. Neue Roboter und neue KI
  erzeugen bessere R4-Pläne aus demselben R3.
- Alle neuen Abschnitte sind **optional und additiv**. Ein V0-Rezept (nur R1) funktioniert weiterhin
  für das geführte Kochen durch Menschen; jede hinzugefügte Ebene schaltet mehr Automatisierung frei.
- Unbekannte `x-` Felder werden durchgereicht. Anbieter, Köche und Gesundheitsbehörden können Rezepte
  erweitern, ohne jemanden zu behindern.
- **Acceptance checks** ermöglichen es jedem Executor, Mensch oder Roboter, zu beweisen, dass das Gericht richtig geworden ist,
  wodurch Rezepte mit Feldbelegen bis V3 aufsteigen.

