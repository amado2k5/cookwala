<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->
# Cookwala Core 0.2

**Status:** Entwurf, 2026-10-04. Dies ist der normative Teil von Cookwala. MUST, SHOULD und MAY folgen RFC 2119. Alles, was hier nicht aufgeführt ist, ist ein optionales **profile** (Abschnitt 10).

Ein Gerät sollte in der Lage sein, Core in etwa einer Woche zu implementieren. Core sagt aus, **was gemacht werden soll, wann es fertig ist und was niemals passieren darf**. Es sagt nicht aus, wie sich ein Roboter bewegt.

## 1. Conformance-Klassen

| Klasse | Muss implementieren |
|---|---|
| **Recipe publisher** | Gültige `recipe.schema.json` Dokumente; Temperaturen innerhalb der operation envelopes; ein Hash und eine Signatur |
| **Executor** (Roboter, Gerät oder hub) | Die Core API (`api/core.openapi.yaml`); operation envelopes und sensor ladders; lokale Sicherheitsgrenzwerte; refusal statt Vermutungen; das execution log |
| **Catalog** | Signierte Rezepte, `/.well-known/cookwala.json` mit Schlüsseldatensätzen, der recall feed, Incident Intake |
| **Agent** (KI oder Software, die für eine Person handelt) | Handelt nur unter einem `AgentMandate`; behandelt Dokumententext als Daten; fragt den Auftraggeber vor allem in `confirmBefore` |
| **Verifier** | Hashes, Signaturen, Schlüsselgültigkeit und Widerruf, Offenlegungen, Ereignisketten und Checkpoints |

Das Beanspruchen einer Klasse bedeutet, ihre `conformance` Vektoren zu bestehen (`conformance/`, Ausführung mit `tools/run_conformance.py`).

## 2. Kerndokumente

| Dokument | Schema |
|---|---|
| Rezept | `recipe.schema.json` |
| Gerätefähigkeiten | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Gemeinsame Typen (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Ereignisse | `event.schema.json` (CloudEvents) |
| Vokabulare: Operationen, Einheiten und Wärmestufen, Vorfälle | `vocab/*.json` |

Alle Schemata sind **strict**: unbekannte Felder werden abgelehnt, außer `x-<vendor>-…` Erweiterungen.
Reader ignorieren `x-` Felder, die sie nicht verstehen. `tools/bundle_schemas.py` erzeugt ein einzelnes
Bundle, damit Geräte offline validieren. Implementierungen dürfen Schemata NICHT zur Laufzeit abrufen.

## 3. Was Operationen bedeuten

- **Envelopes.** Jede wärmebasierte oder gefährliche Operation in `vocab/ops.json` hat ein `envelope`.
  Es spezifiziert:
  - das Medium (Wasser, Öl, Luft, Pfannenoberfläche, Produkt…);
  - seinen Temperaturbereich in °C (und Druck, beim Druckkochen);
  - Rühren, Deckel, Aufmerksamkeitsebene und ob der Schritt unbeaufsichtigt ausgeführt werden darf;
  - Gefahren;
  - eine Testmethode.

Beispiel: `cw.op.simmer` = wasserbasierte Flüssigkeit bei 85–96 °C; `cw.op.deep_fry` = Öl bei 160–190 °C.
- **Targets innerhalb von Envelopes.** Ein Rezept-Target (`params.tempC` oder ein `target` auf dem Sensor des Mediums) MUSS innerhalb der Envelope liegen. Der Validator lehnt Rezepte ab, die dies verletzen.
- **Executors halten das Medium innerhalb der Envelope.** Wenn das Rezept ein engeres Target vorgibt, halten sie es ebenfalls innerhalb dieses Targets, sobald es zum ersten Mal erreicht wurde.
- **Höhe.** Wasser- und Dampfbänder verschieben sich um −1 °C pro 300 m Küchenhöhe.
- **Heat levels** (`very_low` … `max`) haben eine gemeinsame Bedeutung: ein Pfannenoberflächen-Band in °C, definiert in `vocab/units.json`.
- **Sensor ladder.** Jede Envelope listet Wege auf, um den Schritt zu verifizieren, am besten in dieser Reihenfolge: ein spezifischer Sensor, dann `model` (eine geloggte Schätzung), dann `time`, dann `human`.
  - Der Executor nutzt die erste Stufe, die er erfüllen kann, und zeichnet dies in `verifiedBy` auf.
  - Wenn er **keine** Stufe erfüllen kann, MUSS er den Schritt verweigern (`missing_sensor_no_fallback`).
  - Operationen, die ständige Aufmerksamkeit erfordern und nicht unbeaufsichtigt laufen dürfen (Sautieren, Anbraten, Frittieren, Reduzieren, Karamellisieren …), fallen niemals allein auf `time` zurück: Ihre letzte Stufe ist eine Person, die zuschaut.
  - Deep frying hat keinen Fallback: Kein Öl-Temperatursensor bedeutet kein Deep frying.
  - Eine `Condition` kann dies mit `onSensorMissing` einschränken.
- **Refusal, nicht Raten.** Ein Executor, der die Envelope, die Ladder, die Ausrüstung oder die Sicherheitsgrenzen eines Schritts nicht einhalten kann, MUSS vor dem Start mit `refused` und einer Begründung antworten.

## 4. Zahlen und Einheiten

- **Temperaturen sind °C auf dem Draht.** Anzeigen können konvertieren.
- **Toleranzen.**
  - `tolerance` ist relativ und nur auf Verhältnisskalen-Einheiten zulässig.
  - `toleranceAbs` ist absolut in der Einheit des Wertes und ist die einzige auf °C zulässige Toleranz.
  - `Target.tolerance` ist absolut.
- **Kücheneinheiten haben exakte metrische Werte:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volumen ↔ Masse benötigt eine Dichte** (`Quantity.densityGPerMl`, oder das Zutaten-Vokabular);
  ohne eine ist es ein Fehler, niemals eine Schätzung.
- **Geld ist ein Dezimal-String** (`"12.70"`) mit einer ISO 4217 Währung, niemals ein float.

## 5. Integrität und Vertrauen

- **Hash.** `sha256:` plus der Hex-Digest des RFC 8785 canonical JSON des Dokuments,
  ohne seine `hash` und `signature` Felder. Der Referenz-Canonicalizer reproduziert das RFC
  8785 Beispiel exakt.
- **Signature.** Ed25519 (`EdDSA`) über den ASCII-Hash-String. `ES256` ist für P-256
  Hardware-Keys erlaubt. `kid` benennt einen `KeyRecord`.
- **Keys.** Ein `KeyRecord` gibt den öffentlichen Schlüssel, seinen Besitzer, ein Gültigkeitsfenster und `revokedAt` an.
  Eine Signatur, deren `signedAt` nach dem Widerruf oder außerhalb des Gültigkeitsfensters liegt, ist
  ungültig.
  - Kataloge veröffentlichen ihre Keys in `/.well-known/cookwala.json`.
  - Organisationen und Personen veröffentlichen ihre in did:web Dokumenten.
  - Geräte veröffentlichen ihre in ihrem Capabilities-Dokument.
  - Verifier cachen Key-Records für die Offline-Nutzung.
- **Selective disclosure.** Ein signiertes Dokument kann einen `Disclosure` Digest,
  `sha256(JCS([salt, value]))`, anstelle eines sensiblen Wertes enthalten. Der Inhaber offenbart den salt und
  value nur den Parteien, die berechtigt sind, sie zu sehen, und die Signatur ist weiterhin verifizierbar.
- **Event logs** (Mission profile):
  - Ein Sequencer pro Log weist `seq` und `prev` zu, sodass die Kette niemals abzweigt.
  - Checkpoints werden vom Sequencer signiert und von Zeugen gegengezeichnet, die einen
    Transparency-Service wie IETF SCITT einschließen können. Ein Umschreiben nach einem bezeugten Checkpoint ist
    erkennbar.
  - Im `hash_only` Modus befinden sich Payloads in löschbarem Speicher und das Log bewahrt nur deren Hashes auf.

## 6. Sicherheits- und Agentenregeln (normativ)

1. **Sicherheit ist lokal.** Executor erzwingen ein `SafetyLimits` pack auf dem Gerät.
   - Kein Rezept, Agent, Remote-Message, Extension oder Betriebsmodus kann ein Limit erhöhen oder deaktivieren.
   - Ein strengeres Limit gewinnt immer.
   - `profiles/core/safety-limits.default.json` ist ein Entwurf als Ausgangspunkt, den Gerätehersteller
     aus ihrem eigenen Safety Case verschärfen.
2. **Lokaler Stopp.** Eine Stopp-Steuerung am Gerät stoppt die Bewegung innerhalb von 0.5 s und unterbricht die Hitze innerhalb von
   1 s, mit oder ohne Netzwerk. `POST …/stop` wird niemals wegen Autorisierung verweigert, sobald der
   Aufrufer den Executor erreichen kann.
3. **Events berichten; sie schützen niemals.** `cookwalalatency: local_safety` Events berichten, was ein
   Gerät bereits getan hat. Keine Sicherheitsfunktion darf davon abhängen, dass ein Event eintrifft.
4. **Unzuverlässiger Text.** Jedes Freitextfeld (annotiert mit `x-cookwala-untrusted`) ist Daten und niemals
   eine Anweisung, sowohl für Software als auch für KI-Agenten. Versuche, durch Text Anweisungen zu geben, werden
   ignoriert und protokolliert (`cw.incident.untrusted_instruction`).
5. **Agenten handeln unter einem Mandat.** Eine von einem Agent gesendete Anfrage trägt ein `AgentMandate`, das vom
   Principal unterzeichnet wurde: Scopes, Ausgabenlimits, erlaubte Anbieter, Ablaufdatum und Aktionen, die eine
   Bestätigung benötigen.
   - `irreversible` und `safety_override` benötigen immer eine Bestätigung, ungeachtet dessen, was das Mandat sagt.
   - Executor verweigern Anfragen außerhalb des Mandats (`mandate_scope`).
6. **Unbeaufsichtigte Operationen benötigen eine Person.** Operationen, deren Envelope `unattended: false` angibt,
   benötigen eine verantwortliche Person vor Ort oder innerhalb einer Minute erreichbar.
7. **Allergen-Blöcke verweigern.** Jedes blockierte Allergen im Rezept oder im Inventar verweigert die
   Anfrage; es gibt keine Substitutionen um einen Block herum.
8. **Recalls.** Kataloge veröffentlichen unterzeichnete Recalls unter `GET /v1/recalls`. Executor pollen, wenn sie online sind,
   und verweigern zurückgerufene Revisionen. `block_and_stop_running` stoppt zudem laufende Executions sicher.
9. **Incident Reports** sind anonym (`IncidentReport`: nur Datum, keine Namen oder IDs) und
   werden an Kataloge übermittelt, damit jeder Hersteller aus jedem Beinaheunfall lernt.

## 7. Execution lifecycle und API

- **API:** `api/core.openapi.yaml`. Ihre Endpunkte sind:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - Katalog-Seite: `GET /v1/recalls`, `POST /v1/incidents`.
- **Zustände:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` und `stopping` → `stopped` im Verlauf;
  - `refused` und `failed` sind final.
  - Die vollständige Übergangstabelle befindet sich in `core.schema.json#/$defs/ExecutionState` und den
    conformance Vektoren.
- **Anforderungsregeln:**
  - Jeder POST trägt einen `Idempotency-Key`.
  - Änderungen an einer bestehenden execution tragen `If-Match: <seq>`; eine Nichtübereinstimmung liefert 412 zurück.
  - Stop erfordert kein If-Match.
- **Events:**
  - Die Zustellung erfolgt mindestens einmal (at least once).
  - Die CloudEvents `id` ist der Deduplizierungsschlüssel.
  - `cookwalaseq` ordnet Events pro Subjekt und gleicht den Status `seq` ab.
  - Geräte senden `cookwala.device.heartbeat`, sodass ein hub ein verlorenes Gerät erkennen und die Übergabe übernehmen kann.

## 8. Datenschutz

- **Execution logs enthalten keine personenbezogenen Daten** (`privacy.personalData: "none"`).
- **Sie verlassen das Gerät nur mit Opt-in-Einwilligung** (`consent.dataset`: `none` standardmäßig,
  `research_only` oder `open`). Die Einwilligung kann widerrufen werden.
- **Open Datasets vergröbern die Zeitangaben auf den Tag.**
- **Haushalts-, Gesundheits- und religiöse Daten bleiben zu Hause**, es sei denn, die Person entscheidet sich anders.
  Wenn sie übertragen werden müssen, erfolgt dies als selective disclosures.
- **Das Humanitarian Profile** enthält überhaupt keine personenbezogenen Daten.

## 9. Versionierung und Erweiterungen

- **Core-Versionen sind `0.2.x`.**
  - Reader akzeptieren jeden Patch ihrer Minor-Version.
  - Sie lehnen andere Minors mit `unsupported_version` ab.
  - Sie ignorieren unbekannte `x-` Felder.
- **Neue Operationen, Einheiten, Sensoren und Incident-Typen** werden ohne Versionsänderung zu den Vokabularen hinzugefügt.
- **Das Ändern der Bedeutung einer Operation ist eine neue id;** die alte wird als `deprecated` mit `replacedBy` markiert.
- **Profile** versionieren unabhängig und deklarieren die Core-Version, die sie benötigen.

## 10. Profile und ihr Status

| Profil | Status | Anmerkungen |
|---|---|---|
| Core (dieses Dokument) | **draft, normativ** | Ziel für die ersten Geräteimplementierungen |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Keine personenbezogenen Daten; funktioniert via SMS und CSV; surplus to plate, Impact-Zusammenfassungen, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Local-first Haushaltsfakten; nur derived constraints werden übertragen (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Nachgewiesene Namespaces, exakte Versionen, Tombstones; Organisationen auf Anfrage (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Signierte Berichte hinter jedem Conformance-Claim (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds und Relays; Verifizierung gegen den Aussteller (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurants, Community, Schule, Katastrophenhilfe und Roboter-Küchen (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Aggregierte, verzögerte Nachfrage- und Angebots-Signale auf Klassenebene; abhängig von einer wettbewerbsrechtlichen Prüfung (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + Projektion, Übergänge in `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Benötigt eine wettbewerbsrechtliche Prüfung vor der produktiven Nutzung |
| Relief planning (`relief.schema.json`) | experimental | Operationaler Ablauf wurde in das Humanitarian Profile verschoben |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | Die OpenAPI Core API ist die Referenzoberfläche |

Ein Profil wird stabil, wenn zwei unabhängige Implementierungen seine conformance-Vektoren bestehen und es echte Nutzer hat.

## 11. Tools

| Tool | Was es tut |
|---|---|
| `tools/validate_specs.py` | Überprüft Schemata, Beispiele, Rezeptsemantik (envelopes, op Parameter, keine Template-Platzhalter), Strenge und ob API-Referenzen aufgelöst werden |
| `tools/run_conformance.py` | Führt `conformance/*.json` und `conformance/profiles/*.json` aus und schreibt einen ConformanceReport mit `--report`: Hashing (einschließlich des RFC 8785 Beispiels), Signaturen (einschließlich eines RFC 8032 Schlüssels), Widerruf, Offenlegung, Ereignisketten und Checkpoints, Einheiten, envelopes, sensor ladders, Zustandsautomaten |
| `tools/cookwala_ref.py` | Referenzbibliothek und CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regeneriert die Vektoren (diff überprüfen) |
| `tools/bundle_schemas.py` | Offline-Schema-Bundle |
| `tools/humanitarian_check.py` | Humanitarian Profile rule-pack Prüfer und Impact-Zusammenfassungen |
| `tools/make_profile_vectors.py` | Regeneriert die Profil-Vektoren in `conformance/profiles/` |

## 12. Änderungen von 0.1

| Bereich | 0.1 | 0.2 |
|---|---|---|
| Schemas | Akzeptierte unbekannte Felder | Strikt, mit `x-` Erweiterungen |
| Temperaturen | °C oder °F, relative Toleranz erlaubt | Nur °C; absolute Toleranz |
| Geld | Zahl | Dezimal-String |
| Operationen | Prosa-Definitionen | Physische Envelopes, sensor ladders, Hitzestufen, Testvektoren |
| Signaturen | Festes EdDSA, Schlüssel ohne Lebenszyklus | EdDSA oder ES256, KeyRecords mit Gültigkeit und Widerruf |
| Missionen | Ein veränderbares Dokument, Ledger darin | Event log + Projektion, einzelner Sequencer, bezeugte Checkpoints, Hash-only-Modus |
| Agenten | Mandate nur innerhalb von Missionen | `AgentMandate` in common; erforderlich für Agenten-Anfragen |
| Sicherheit | In Rezepten deklariert | Auch lokal durch SafetyLimits erzwungen; recalls; Vorfallberichte |
| Daten | Kein Dataset-Modell | Einverstanden, personenbezogen-datenfreies ExecutionLog |
| Conformance | Nur Schema-Validierung | 106 Vektoren (44 Core, 62 Profile) plus eine Referenzimplementierung |

Um ein 0.1 Dokument zu migrieren: Konvertieren Sie °F in °C; ersetzen Sie relative Toleranzen bei Temperaturen durch `toleranceAbs`; wandeln Sie Geldbeträge in Dezimal-Strings um; entfernen oder benennen Sie unbekannte Felder in `x-` Felder um.

