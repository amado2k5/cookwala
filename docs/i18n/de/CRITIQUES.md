<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Kritiken, die wir veröffentlicht haben

Wir haben schwierige Fragen zu Cookwala gestellt und die Antworten aufgeschrieben. Jedes Anliegen hat eine id im [action plan's concern register](ACTION-PLAN.md#2-concern-register), zusammen mit unserer Antwort und ihrem Status. Bewertungen von außen sind willkommen und werden hier aufgelistet.

## Wird das funktionieren? (strategy)

| Anliegen | Kurze Antwort | Status |
|---|---|---|
| Der Markt existiert noch nicht; die Spezifikation ist der Produktentwicklung voraus | Small Core, erst Demo, keine neue Spezifikation ohne Nutzer | Core 0.2 erledigt; device demo next |
| Niemand mit Macht hat einen Grund zur Einführung | Fokus auf den Nutzen für jeden Adopter; nützlich ohne Roboter | Food-bank Pilot und device Partner gesucht |
| Die Simulatoren beweisen, was sie assume | Faire Baseline, Bereiche, „illustrative“ Labels; Piloten ersetzen sie | Open |
| Hunger hat mit Armut und Konflikten zu tun, nicht mit surplus | Cookwala trägt dazu bei; es beansprucht nicht, den Hunger allein zu beenden | Message geändert |
| Sicherheit, Haftung und Angriffsfläche | Limits auf dem device erzwungen; refusal; recalls; Incident Reports | Spec erledigt; certifier review open |
| Datenschutz (Gesundheits- und Religionsdaten, Ledgers vs. Löschung) | Local-first, selektive Offenlegung, Hash-only Logs, Consent | Spec erledigt; Impact Assessment open |
| Zu komplex | Core 0.2; alles andere als experimental markiert | Erledigt |
| Gründerabhängigkeit | Governance-Pfad zu einer neutralen Heimat | GOVERNANCE.md |

## Ist das technische Design fundiert?

| Anliegen | Was sich in Core 0.2 geändert hat |
|---|---|
| Operationen hatten keine physische Bedeutung | Envelopes, Hitzestufen, sensor ladders, altitude rule, Testvektoren |
| Einheiten- und Zahlenfehler | Nur °C, absolute Toleranzen, Kücheneinheiten, Dichten, Dezimalbeträge |
| Schemas akzeptierten Tippfehler | Strikte Schemas mit `x-` Erweiterungen; Offline-Bundle |
| Ein veränderbares Mission-Dokument | Event log + Projektion, einzelner Sequencer, Transitions-Tabelle |
| Das Ledger lieferte wenig | Key records mit Revocation, witnessed Checkpoints, Rewrite-Erkennung |
| Undefinierte Ereigniszustellung; Sicherheit auf dem Bus | Sequenznummern, Latenzklassen, Heartbeats, „safety is local“ |
| API-Oberflächen driften ab | Core OpenAPI; jeder Referenzcheck in CI |
| Kein Verifizierer | Referenzbibliothek und 106 conformance Vektoren |

## Bewertungen, um die wir bitten

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), Lebensmittelwissenschaftler
(envelopes), Lebensmittelsicherheitsbeauftragte und Ernährungsberater (rule packs), ein Sicherheitsaudit, eine
Datenschutzprüfung und eine Gap-Analyse eines Zertifizierers. Siehe das
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

