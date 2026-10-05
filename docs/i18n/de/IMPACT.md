<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Auswirkungen: was Cookwala verändern kann, mit Quellen und Labels

**Status:** 2026-10-04. Jede unten stehende Zahl ist als **measured** (gezählt oder von der genannten Quelle gemeldet), **modelled** (erzeugt durch unsere Simulatoren unter angegebenen Annahmen) oder **assumed** (eine Planungszahl) gekennzeichnet. Nichts hier ist ein Ergebnis von Cookwala im Feld: kein Pilot wurde durchgeführt. Diese Seite gibt die Größe der Probleme und die Mechanismen an, durch die Cookwala beiträgt.

## 1. Hunger

| Fakt | Zahl | Label und Quelle |
|---|---|---|
| Menschen, die 2023 Hunger erfuhren | etwa 733 Millionen | measured durch die Quelle: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Menschen, die 2023 mäßig oder schwer ernährungsunsicher waren | etwa 2,3 Milliarden | measured durch die Quelle: SOFI 2024 |
| Lebensmittelverluste zwischen Ernte und Einzelhandel | etwa 14 % der produzierten Lebensmittel | measured durch die Quelle: FAO, *The State of Food and Agriculture 2019* (UNEP rundet dieselbe Zahl auf 13 %) |
| Lebensmittelverschwendung im Einzelhandel, in der Gastronomie und in Haushalten im Jahr 2022 | etwa 1,05 Milliarden Tonnen; etwa 132 kg pro Person; etwa 79 kg pro Person in Haushalten | measured durch die Quelle: UNEP, *Food Waste Index Report 2024* |

**Cookwala-Mechanismen:** surplus-Angebote, die eine Küche erreichen, bevor die Lebensmittel verderben, mit einer Cold-Chain-Prüfung bei jeder Übergabe (Humanitarian Profile); Auswirkungen werden an jedem Standort auf die gleiche Weise gezählt, damit Programme vergleichen und sich verbessern können; later, aggregierte Nachfrage- und Angebotsignale, damit weniger angebaut und transportiert wird, um es wegzuwerfen (experimental, gated on competition-law review). **Was es nicht tut:** Armut, Konflikte, Klimaschocks, Preise oder politische Maßnahmen angehen, welche den Großteil des Hungers verursachen.

**Modelled, illustrativ, keine Prognose:** der gemischte Rollout des Länder-Simulators rettet
Mahlzeiten in Höhe von etwa 4,7 % dessen, was seine fiktive, von Ernährungsunsicherheit betroffene Bevölkerung benötigt; das Szenario des Welt-Simulators „Protokoll, keine Roboter“ erreicht allein durch Rettung etwa 40 Millionen von rund 770 Millionen (die assumed Baseline des Simulators, eine Aufrundung der oben gemessenen 733 Millionen)
hungrigen Menschen. Beide sagen dasselbe: Rettung ist wichtig und reicht nicht aus.

## 2. Gesundheit

| Fakt | Zahl | Label und Quelle |
|---|---|---|
| Jährliche Erkrankungen durch unsichere Lebensmittel | etwa 600 Millionen; etwa 420.000 Todesfälle | measured durch die Quelle: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Salzkonsum im Vergleich zum Richtwert | die meisten Menschen essen 9 bis 12 g Salz pro Tag; WHO empfiehlt unter 5 g (2 g Natrium) | measured durch die Quelle: WHO fact sheet on salt reduction |
| Jährliche Todesfälle aufgrund von hohem Natriumgehalt | etwa 1,9 Millionen | measured durch die Quelle: WHO, *Global report on sodium intake reduction* (2023) |
| Menschen, die auf verschmutzende Brennstoffe zum Kochen angewiesen sind | etwa 2,1 Milliarden; etwa 3,2 Millionen Todesfälle pro Jahr durch Luftverschmutzung im household context | measured durch die Quelle: WHO fact sheet on household air pollution (2024) |

**Cookwala-Mechanismen:** kritische Kontrollpunkte sowie Warmhalten, Kühlen und Aufwärmen;
auf dem Gerät erzwungene und aufgezeichnete Limits; rule packs, die Natrium, freien Zucker,
gesättigte Fette sowie Obst und Gemüse auf Menüs kennzeichnen; Sorgeregeln für Kinder, Schwangerschaft und
ältere Erwachsene; ein Review-Protokoll, damit Ernährungsberater und Lebensmittelsicherheitsbeauftragte für ein Pack bürgen können.
**Was es nicht tut:** diagnostizieren, behandeln oder therapeutische Diäten berechnen; siehe
`docs/health/CLAIMS-POLICY.md`.

**Sauberes Kochen** ist im Bild enthalten, aber nicht im Modell: Die Simulatoren berücksichtigen noch nicht das Kochen mit Holz und Holzkohle oder dessen gesundheitliche Auswirkungen (als Einschränkung aufgeführt; next).

## 3. Umgebung

| Fakt | Zahl | Label und Quelle |
|---|---|---|
| Anteil der globalen Treibhausgasemissionen aus Lebensmittelverlusten und -abfällen | etwa 8 bis 10 % | measured durch die Quelle: UNEP, *Food Waste Index Report 2024* |

**Modelled, illustrative:** in der Welt-Simulation reduziert „viele Roboter mit dem Protokoll“ den gesamten, ansonsten verlorenen oder verschwendeten Lebensmittelverlust um etwa 4,1 % und die Emissionen um etwa 5,2 % über fünf Jahre im Vergleich zur gleichen Welt ohne sie; „viele Roboter allein“ reduziert den Haushaltsabfall, erhöht aber die Verluste vor den Haushalten um etwa 3 % (ein Peitscheneffekt). Der Roboter-Stromverbrauch (etwa 164 TWh über fünf Jahre in diesem Szenario) wird mitgerechnet. Dies sind die Outputs des Modells unter seinen Annahmen, aufgelistet auf jeder Simulator-Seite.

## 4. Wirtschaft und Arbeit

**Assumed and modelled:** der Stadt-Simulator schätzt etwa 5 USD pro Person pro Monat
weniger Nahrungsmittelausgaben und etwa 10 Stunden pro Haushalt pro Monat weniger Kochen und Einkaufen mit Roboter-
köchen, Hardware nicht enthalten. Keine Zahl für Arbeitsplätze wird irgendwo angegeben; neue Rollen werden genannt
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) ohne
Zahlen.

## 5. Kultur

Keine Nummer. Die Behauptung ist qualitativ und überprüfbar: Ein Cookwala-Rezept trägt den Namen des Kochs, die Identität des Gerichts (was essenziell ist, was flexibel ist, was niemals hinzugefügt wird), Text in der Sprache des Kochs und eine Signatur. Maschinen, die es kochen, erben das Rezept als Arbeitswissen, mit Anerkennung.

## 6. Was wir messen werden, wenn es etwas zu messen gibt

| Maßnahme | Methode | Wo definiert |
|---|---|---|
| Gerettete Kilogramm, servierte Mahlzeiten, erreichte Personen, Ernährungs-Passrate, Kosten pro Mahlzeit, Zeit bis zum Claim, Claim-Rate, Safety Block Befunde, Sicherheitsvorfälle | berechnet aus Offer, Claim, Handover und Distribution Dokumenten | Humanitarian Profile section 10; `ImpactSummary` |
| Verifizierte Köche: Ausführungen, die ein signiertes Rezept von Anfang bis Ende mit einem konformen Log ausgeführt haben | execution logs mit Einwilligung | `STRATEGY.md` section 11 |
| Unabhängige Implementierungen, die die conformance bestehen | veröffentlichte conformance Berichte | `docs/CERTIFICATION.md` |
| Agent-safety Ergebnisse pro Modell | der promptfoo benchmark, mit model id, Datum und config hash | `evals/kitchen-agent-safety/` |

## 7. Was wir noch nicht wissen

Ob eine food bank mit dem Profil mehr rettet als mit ihrer aktuellen Methode (das pilot protocol existiert; kein pilot wurde durchgeführt). Ob die envelopes für jede Küche richtig sind (ein food scientist hat sie nicht überprüft). Ob die Verhaltensannahmen der Simulatoren halten (sie sind aufgelistet und anpassbar). Wie groß die Rebound-Effekte sind. Nichts hier ist ein Versprechen.

## 8. Was ist schiefgelaufen

Es wurde nichts bereitgestellt, daher ist im Feld nichts schiefgelaufen. Im Repository: Der erste Einzeiler („world's first and largest robot cooking recipes index“) hat übertrieben, was existierte, und wurde geändert; das erste Mission-Schema akzeptierte unbekannte Felder und wurde auf strict gesetzt; die ersten Simulatoren nutzten eine strawman baseline und erhielten eine competent-integration baseline und Bereiche. Die Kritiken, die diese Änderungen vorangetrieben haben, sind veröffentlicht (`docs/CRITIQUES.md`).

## 9. Quellen

- FAO, IFAD, UNICEF, WFP und WHO, *The State of Food Security and Nutrition in the World
  2024*, Rom, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rom, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Genf, 2015.
- WHO, *Global report on sodium intake reduction*, Genf, 2023; WHO Factsheet *Salt
  reduction*.
- WHO Factsheet *Household air pollution*, 2024.

Abbildungen werden so zitiert, wie die Quellen sie veröffentlichen, gerundet; gleichen Sie jede vor dem Zitieren im Druck mit der aktuellen Ausgabe ab. Die Organisationen sind Quellen, keine Partner.

