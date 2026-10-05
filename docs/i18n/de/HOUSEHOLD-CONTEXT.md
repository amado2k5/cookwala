<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Household Context Profile: das Gesamtbild bleibt zu Hause

> **Status: draft profile** (RFC-0001). Kein Teil von Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Empfängerregeln: `profiles/household/recipient-roles.json`. Lokale API:
> `api/household.openapi.yaml`. Beispiel: `examples/household/context.json`.

## 1. Warum

Ein Roboter, der einer Familie gut dient, muss sehr viel wissen: die Haushaltsgeräte und ihre Eigenheiten, wer dort lebt und wann sie zu Hause sind, Haustiere, Kinder, Diäten, Allergien, die Zeitplanung von Medikamenten, Rituale, Budget, Einkaufsgewohnheiten, was beim letzten Mal schiefgelaufen ist. Dieselben Fakten sind ein Einbruchsplan und ein Profiling-Werkzeug. Dieses Profil gibt dem **planner at home** das vollständige Bild und gibt allen anderen nur eine **constraint**.

## 2. Drei Ideen

1. **Facets.** Jeweils ein getippter Fakt (`cw.facet.household.health.allergies`), mit wer
   ihn behauptet hat (declared, observed, reported, inferred), wann, wie lange, wie sicher,
   und einer Privacy-Klasse (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Jeder Facet-Typ gibt an, ob sein Rohwert das Haus verlassen
   darf: `never` (45 Typen: Kinder, Abwesenheiten, Layouts, Gesundheitszustände, Religion,
   Verhalten, Vorfälle, Einkommensstatus), nur als `derived` constraint (81 Typen), oder als
   `consented` Offenlegung nach einer expliziten Erlaubnis (13 Typen, meist Gerätezustand für den
   Hersteller).
3. **Derived constraints.** Das einzige Household-Objekt, das ein Lebensmittelhändler, Planer, Lieferdienst,
   Gerätehersteller oder ein anderer Roboter jemals erhält: „Lieferung 17:00–18:00 an die Haustür“,
   „Erdnüsse blockieren“, „keine Roboterbewegung im Flur 15:00–15:30“, „Budgetobergrenze 18.00 USD pro
   Mahlzeit“. Jeder benennt die Facet-**types**, aus denen er stammt, niemals deren Werte.

## 3. Wer bekommt was

| Empfängerrolle | Darf erhalten |
|---|---|
| Lebensmittelhändler | Lieferfenster, Zugangspunkt, Allergenblock, Budgetobergrenze, Kennzeichnung, Verpackung |
| Zusteller | Lieferfenster, Zugangspunkt, Verpackung |
| Planer (KI oder Software, die die Mahlzeit plant) | Allergenblock, Diätregel, Zutat vermeiden, Servierfenster, Budgetobergrenze, Wärmequellen, Ausrüstung, Texturebene, Portionsanzahl, Anwesenheit erforderlich, Vorsichtsgrad, Roboterlaufzeit, Servierform, Küche, Gewürz, Ruhezeiten, No-Movement-Zonen, Haustiersichere Lagerung, Kindersichere Zonen |
| Gerätehersteller | Roboterlaufzeit, Zusammenfassung von Gerätefehlern; Geräte-Selbstzustands-Facetten nach Zustimmung |
| anderer Roboter | No-Movement-Zonen, Ruhezeiten, Kindersichere Zonen, Haustiersichere Lagerung, Ausrüstung |
| Versicherer | nur Zusammenfassung von Gerätefehlern (Anzahl der Fehler nach Kategorie, keine Zeiten, keine Haushaltsfakten), und nur wenn der Haushalt einen Versicherer als Empfänger benannt hat; RFC-0001 listet dies als die Rolle auf, die am wahrscheinlichsten entfernt wird, wenn eine Datenschutzprüfung Einspruch erhebt |
| Programm (food bank, Schule) | nichts |
| Datensatz | nichts |

## 4. Regeln

- Rohe Facets verlassen das Gerät niemals. Es gibt keine API, die sie an jemanden außerhalb des Heimnetzwerks zurückgibt.
- `inferred` Facets werden niemals für Sicherheitsentscheidungen verwendet.
- Es wird kein Verhaltensscore einer Person erstellt oder gespeichert. Verhaltens-Facets existieren, um dem Haushalt zu dienen (Portionsgrößen, wann aufzuräumen ist) und werden niemals übertragen.
- Das wirtschaftliche Niveau ist eine **vom Eigentümer festgelegte Budgethaltung**, niemals aus etwas abgeleitet.
- Daten über Kinder und Abwesenheiten sind `secret` und werden niemals übertragen, nicht einmal abgeleitet, außer als Bewegungs- und Sicherheitszonen-Constraints, die keinen Zeitplan offenbaren.
- Jede Facet ist löschbar. Die Löschung erfolgt innerhalb des Fensters des Haushalts (standardmäßig 7 Tage, maximal 30) und wird ohne Inhalt protokolliert.
- Eine Datenschutzklasse kann über den Registry-Standard angehoben, aber niemals gesenkt werden.

## 5. Der lokale Incident-Memory

RFC-0001 fragt, was sich der Roboter an Alarme, Konflikte, Abbruch und Lektionen erinnert. `LocalIncident` hält dies fest: Datum, Kategorie aus `vocab/incidents.json`, wer nach Art beteiligt war, eine Notiz und eine Lektion. Es verlässt niemals das Zuhause. Der öffentliche, anonyme `IncidentReport` in Core ist ein anderes Dokument, von dem jeder Maker lernt.

## 6. Conformance

Profilvektoren (`conformance/profiles/disclosure_policy.json`) geben Facets und eine Empfängerrolle vor und erwarten die exakten Constraint-Typen, offengelegten IDs und zurückgehaltenen IDs mit Gründen. Die Referenzimplementierung ist `derive_constraints()` in `tools/cookwala_ref.py`.

## 7. Beziehung zu anderen Dokumenten

`ClientProfile`, `KitchenProfile` und `RobotProfile` (`profile.schema.json`) bleiben als
praktische Bündel bestehen. Missions-Facetten (`mission.schema.json`) verwenden dieselben Registry-IDs.
Das Core `AgentMandate` bleibt die normative Aussage darüber, was ein Agent tun darf; Mandats-Facetten
beschreiben die Regeln des Haushalts lokal.

## 8. Offene Fragen

Siehe RFC-0001: geschlossene Empfängerrollen; raise-only Datenschutz; eine Datenschutz-Folgenabschätzung mit einem Reviewer.

