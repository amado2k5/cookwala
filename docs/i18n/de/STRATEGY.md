<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->
# Cookwala-Strategie: Nachricht, Produkt, Website, Dokumentation, Developer Experience

**Status:** überarbeitet 2026-10-04 (v2). Deckt die Mission, Vision, Story, den Standard, die Website,
Dokumentation, API und SDK, Demos, Community und Metriken ab. Es baut auf dem Aktionsplan
(`ACTION-PLAN.md`), der Hintergrundgeschichte und der Gap-Liste (`research/BACKSTORY.md`), dem Architektur-Review
(`research/ARCHITECTURE-REVIEW.md`), dem 23-Seiten-Benchmark (`research/WEB-BENCHMARK.md`), dem
Stakeholder-Design (`STAKEHOLDERS.md`) und den Messaging-Regeln (`MESSAGING.md`) auf. Die Tabelle in Abschnitt 1
ist die Erstprüfung; der Benchmark ersetzt sie, sofern sie voneinander abweichen.

---

## 0. Zusammenfassung

**Cookwalas Aufgabe.** Es ist der offene Weg, um jeder Küche (einer Person, einer food bank, einem Ofen oder einem humanoiden Roboter) mitzuteilen, **was zubereitet werden soll, wann jeder Schritt abgeschlossen ist und was niemals passieren darf**, und alle drei auf dem Gerät zu überprüfen.

**Was sich ändert:**

1. **Message.** Ersetzen Sie „the world's first and largest robot cooking recipes index and CLI“
   und führen Sie mit dem Problem an, das jeder Roboterhersteller und jede Küche hat. Neuer One-Liner:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** Roboter werden bald in Haushalten kochen, aber niemand hat in einer Form, die eine
   Maschine prüfen kann, aufgeschrieben, was „fertig“ und „sicher“ bedeuten oder für welche Küchen. Cookwala
   begann mit den ägyptischen Rezepten einer Familie. Seine Mission ist es, Maschinen jede Küche
   sicher beizubringen und sicherzustellen, dass gutes Essen die Menschen erreicht.
3. **Proof before promise.** Live, echte Zähler. Now / next / later Labels. Veröffentlichte Kritiken.
4. **Ein Kreislauf, den jeder versteht:** *Describe → Check → Cook → Learn.*
5. **Pfade nach Zielgruppe:** Gerätehersteller, KI-Agent-Entwickler, Küchen und food banks, Köche,
   Forscher.
6. **Code und eine Live-Demo auf dem ersten Bildschirm.** In-Browser dry run („Kann dieses Gerät
   dieses Rezept kochen?“), die Simulatoren und Copy-Paste-Befehle, die heute funktionieren.
7. **Developer Experience auf dem Niveau der besten KI- und Robotik-Dokumentationen:** ein 5-Minuten-
   Quickstart, Dokumentationen organisiert als Tutorials, How-to-Guides, Referenz und Erklärungen,
   `llms.txt`, Copy-Page, ein Python-Paket und CLI, ein typed JS/TS SDK, ein MCP-Server, ein
   Reference hub, den man lokal ausführen kann, ein ROS 2 Paket und eine LeRobot Bridge.
8. **Ein Contributor-Netzwerk** (inspiriert von Figure's Index): Köche und Küchen tragen
   eingewilligte Aufnahmen echter Rezepte bei, damit Roboter jede Küche lernen, mit Anerkennung für die
   Menschen, die sie unterrichtet haben.

---

## 1. Was wir gelernt haben

| Site | Problemit löst | Ansatz | Wie es kommuniziert | Zielgruppe | Was wir übernehmen |
|---|---|---|---|---|---|
| **Figure – Index** | Humanoiden benötigen riesige Mengen an Real-World-Aufgabendaten | Bezahltes Mitwirkenden-Netzwerk, das alltägliche Aufgaben aufzeichnet; Services now, Roboter later | Kinoreif, monochrome, riesige Lichttypografie; Live-Counter (29 M Video-Uploads, $15 M bezahlt); *"Today, services on demand. Soon, robots on demand."* | Mitwirkende, Haushalte, Unternehmen | Mitwirkenden-Netzwerk mit Credit; **Live-Beweis-Counter**; eine "today / soon" Ehrlichkeitslinie; ein prägnantes Bild |
| **Figure (home)** | Hilfe im Haushalt | Ein Allzweck-Humanoide | *"The future of home help is here."* Ein Satz, ein Video | Haushalte, Investoren | Das Versprechen in einem Satz; Produkt vor Features |
| **MCP Registry** | Finden von vertrauenswürdigen MCP-Servern | Community-Registry; verifizierte Reverse-DNS-Namespaces; exakte Versionen; Integritäts-Hashes; Validierungs-Endpoint; Lifecycle-Status | Saubere OpenAPI-Referenz; Schema-first | Server-Publisher, Client-Entwickler | **Verifizierte Namespaces, gepinnte Versionen, Hashes, Tombstones** → `REGISTRY.md` |
| **LangChain docs** | Das Erstellen von Agenten ist fragmentiert | Offene, modellagnostische Frameworks plus eine Plattform | *"The open agent engineering ecosystem"*; Lifecycle Build → Test → Deploy → Monitor; Trust Center und Status | Agent-Entwickler, Unternehmen | **Ein Lifecycle, den der Leser wiederkennt**; Trust Center; Academy und Forum |
| **LangSmith Observability** | Sehen, was Agenten in der Produktion getan haben | Traces → Monitoring → Feedback → Datasets für Evals | Schritte mit Links; Concepts-Seite; Integrationen | Agent-Teams | **Execution logs als Traces**; Traces werden zu Datasets → `execlog_export.py otel` |
| **OpenAI API docs** | Erster API-Aufruf | Quickstart mit Code-First; Build-Pfade; Model Cards | Dunkel, Code-fokussiert, "Ask AI", Status und Cookbook | Entwickler | **Code auf dem ersten Bildschirm; "build paths"** |
| **Claude Platform docs** | Vom ersten Aufruf bis zur Produktion | Zwei Oberflächen (Messages, Managed Agents); nummerierte Developer Journey; Model-Family-Cards | ⌘K Suche; Sprach-Tabs (Python … cURL, CLI); Journey 1–4 | Entwickler, Plattform-Teams | **Nummerierte Developer Journey; Sprach-Tabs; "choose how you build"** |
| **AsyncAPI** | Beschreiben von eventgesteuerten APIs | Offene Spezifikation plus Tools (Generatoren, Docs); Open Governance unter der Linux Foundation | "Part of the Linux Foundation"; Spec → Docs → Code-Demo; Community-Meetings; Sponsor-Tiers | Architekten, Tool-Entwickler | **Open Governance Badge, TSC, Community-Kalender, Sponsoren** |
| **SiliconFlow** | Schnelle, günstige Modell-Inferenz | One-Stop-API für viele Modelle | Feature-Listen zu Performance, Skalierbarkeit, Kosten und Sicherheit | Entwickler, Unternehmen | Eine prägnante Liste von **Characteristics** (unsere: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Trial-and-Error Prompt Engineering | Deklarative Testfälle, Red Teaming, CI | *"Test-driven LLM development, not trial-and-error"*; Why-Choose-Liste; Workflow-Schritte | LLM-App-Entwickler, Security | **Deklarative Sicherheitstests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; nicht Figure's Helix AI) | DeFi ist zu komplex | Natural-Language-Agent mit Bestätigung vor jeder Transaktion | Whitepaper: Abstract → Problem → Solution → Architecture → Security Model | Krypto-Nutzer | **Whitepaper-Struktur; explizites Security Model; "always confirm"** (wir übernehmen die Struktur, nicht das Token-Modell) |
| **Hugging Face LeRobot** | Robotik ist schwer zu beginnen | Hardware-agnostische Library; Teleoperate → Record → Train → Deploy; Standard-Dataset-Format; Community-Datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; Cheat Sheet; Common Problems | Maker, Forscher | **"Pick your path"; Dataset-Kompatibilität; Common-Problems-Abschnitt** |
| **ROS 2 / Open Robotics** | Interoperabilität von Roboter-Software | Offene Middleware (ROS, Gazebo, Open-RMF), betrieben von einer Non-Profit-Organisation | *"Powering the world's robots"* | Roboter-Entwickler | **ROS 2 Actions; Non-Profit Stewardship** |
| **NVIDIA Isaac** | Entwicklung und Training von Robotern | Simulation, Libraries, Foundation Models (GR00T) | Plattform-Map: Libraries, Simulation, Models, Blueprints | Robotik-Teams | **Simulation als Testbank** für Envelopes |
| **1X, Unitree, Pollen** | Heim-Humanoide, erschwingliche Roboter, offene Roboter für Maker | Produkte mit Anzahlung, Vorbestellung und Community | Ein Produkt, ein Preis, ein Button | Haushalte, Maker | Heim-Roboter werden now versendet; unser Fenster ist now |

**Muster, die die Besten teilen:**
1. Ein Satz darüber, für wen es ist und was es tut.
2. Eine Schleife, die der Leser wiederkennt.
3. Funktionsfähiger Code oder eine Demo innerhalb eines Scrollvorgangs.
4. Einstiegspunkte nach Wahl (Pick-your-path).
5. Beweis (Zahlen, Nutzer, Governance).
6. Ehrlicher Status (Trust Center, Status-Seite, now/next).
7. Eine Community, der man heute beitreten kann.
8. Dokumentation, die sowohl für Menschen als auch für KI-Leser erstellt wurde (Copy-Seite, `llms.txt`, „Ask AI“).

---

## 2. Cookwala heute

**Stärken:**
- Eine seltene, konkrete Idee: physische operation envelopes, sensor ladders, refusal statt
  Raten, auf dem Gerät erzwungene Sicherheit, verifizierbare Dokumente.
- Conformance-Vektoren, die zwei unabhängige Standardergebnisse einschließen (RFC 8785, RFC 8032).
- Vier spielbare Simulatoren.
- Ein humanitäres Profil, das ohne Roboter funktioniert.
- Ein echtes Rezept-Korpus (fifi.cooking) und eine Region mit einer Identität (Ägypten, die arabische Welt).
- Ein ungewöhnlich ehrlicher Kritik-und-Antwort-Verlauf.

**Lücken:**

| Lücke | Effekt |
|---|---|
| Schlagzeile behauptet „erstes und größtes“ mit 1 veröffentlichtem Rezept | Wirkt wie Hype; lädt zur Ablehnung ein |
| „Welthunger beenden“ als Leitmotiv | Schreckt Geldgeber und Experten ab, die die Ursachen von Hunger kennen |
| Framing nur für Roboter | Schließt Nutzer aus, die heute adoptieren können (Küchen, food banks, Agent-Builder) |
| Kein Quickstart, kein SDK, kein ausführbarer Server | Niemand kann in 5 Minuten Erfolg haben |
| Docs sind 25 Markdown-Dateien ohne Navigation | Schwer zu finden, schwer zu vertrauen |
| Kein Live-Beweis oder Status | Kein Gefühl von Momentum oder Bereitschaft |
| Keine Möglichkeit beizutreten | Interesse kann sich nicht in Beitrag verwandeln |

---

## 3. Positionierung und Nachricht

### 3.1 Kategorie und One-liner
- **Kategorie:** ein offener Standard (mit kostenlosen Tools und einem Index) für ausführbares, verifizierbares Kochen.
- **One-liner:** *Cookwala ist der offene Standard für sicheres Kochen: Menschen, Küchen und Roboter.*
- **Triad**, überall verwendet:
  - **Was zubereitet werden soll.** Rezepte als Schritte, die eine Maschine planen kann.
  - **Wann es fertig ist.** Messbare Endbedingungen: Temperaturen, Hinweise zum Lebensmittelzustand, Zeiten.
  - **Was niemals passieren darf.** Sicherheitsgrenzwerte, die das Gerät selbst erzwingt.

### 3.2 Mission und Vision (überarbeitet)
- **Mission:** *Helfen Sie jedem, gut, sicher, erschwinglich und ohne Verschwendung zu essen, wer auch immer
  das Kochen übernimmt.*
- **Vision:** *Jede Küche auf der Erde kann jedes Rezept sicher kochen, und gutes Essen erreicht die Menschen,
  anstatt im Müll zu landen.*
- **Warum die Änderung:** "end world hunger" bleibt als langfristiger Grund bestehen, untermauert durch Belege.
  Cookwala trägt dazu durch weniger Verschwendung, Food Rescue und günstigeres Kochen bei, neben
  den Programmen, der Finanzierung und der Politik, die Hunger bekämpfen.

### 3.3 Die Geschichte

> Heimroboter kommen an: Figure 03, 1X NEO und Küchenroboter werden ausgeliefert oder nehmen
> Bestellungen entgegen. Sie lernen sich zu bewegen, aber niemand hat auf eine Weise aufgeschrieben, die eine Maschine
> prüfen kann, was „simmer“ bedeutet, wann Hähnchen sicher ist oder wie die Molokhia einer Großmutter zubereitet wird.
> Jeder Hersteller schreibt seine eigenen geschlossenen Rezepte, meist aus nur wenigen Küchen.
>
> Cookwala begann mit den ägyptischen Hausrezepten einer Familie auf fifi.cooking und stellte eine einfache
> Frage: Wie übergibt man einer Maschine ein Rezept und weiß, dass sie es sicher zubereiten wird?
>
> Die Antwort ist ein offener Standard. Er besagt, was zubereitet werden soll, wann jeder Schritt abgeschlossen ist und was niemals
> passieren darf. Das Gerät prüft dies, bevor es etwas aufheizt, und verweigert die Ausführung, anstatt zu
> raten. Die gleichen Rezepte funktionieren heute für Menschen und food banks, und sie werden es Robotern
> morgen ermöglichen, jede Küche der Erde zu erlernen, mit Anerkennung für die Köche, die sie unterrichtet haben.

*(Der Gründer sollte den Ursprungssatz bestätigen und personalisieren. Authentizität schlägt Perfektion.)*

### 3.4 Message house

| Säule | Versprechen | Beweis, den wir heute zeigen können |
|---|---|---|
| **Safe by design** | Geräte verweigern eher, als zu raten, und erzwingen Limits lokal | Operation envelopes für 32 Operationen; safety-limits pack; dry run; conformance |
| **Verifiable** | Jeder kann ein Rezept, ein Gerät und einen Datensatz prüfen | Signaturen, Key Revocation, Event-log Checkpoints; 106 Vektoren inkl. RFC-Ergebnissen |
| **Open and neutral** | Lizenzfrei, modellagnostisch, geräteagnostisch | Lizenzen; Governance-Pfad; keine API-Keys |
| **Every cuisine** | Basierend auf echtem Kochen im Haushalt, mehrsprachig | fifi.cooking corpus; Arabisch und Englisch; world-cuisines plan |
| **Useful before robots** | Küchen und food banks profitieren now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | Echtes Kochen führt zu besseren Robotern, mit Credit | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 Sprachregeln
- **Verwenden:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Vermeiden:** "revolutionary", "first and largest" (bis es wahr ist), "end hunger" (als Schlagzeile),
  "AI-powered" (vage).
- **Beschriften Sie jede Zahl** als *measured*, *modelled* oder *assumed*.
- **Sagen Sie "now / next / later"**, anstatt zu implizieren, dass etwas existiert, wenn es das nicht tut.

---

## 4. Zielgruppen und ihr erster Erfolg

| Zielgruppe | Zu erledigende Aufgabe | Erster Erfolg (≤ 15 min) | Dann |
|---|---|---|---|
| **Roboter- und Gerätehersteller** | Kochfunktionen sicher ausliefern, ohne jedes Rezept schreiben zu müssen | Dry-run ihres Geräteprofils gegen 5 Rezepte durchführen; Akzeptanz/Ablehnung pro Schritt sehen | Core API (reference hub) implementieren, conformance bestehen, das Gerät im registry veröffentlichen |
| **KI-Agenten-Entwickler** | Agenten erlauben, Mahlzeiten zu planen und Lebensmittel ohne Schaden zu bestellen | Cookwala MCP server hinzufügen; den agent-safety benchmark auf ihrem Modell ausführen | AgentMandate und den dry run vor dem Handeln nutzen |
| **Küchen und food banks** | Überschüsse sicher retten, nahrhafte Menüs planen | Ein SMS-Angebot senden oder die CSV ausfüllen; die rule-pack Prüfung sehen | Pilotprojekt mit dem Humanitarian Profile |
| **Köche und Rezept-Ersteller** | Ihre Rezepte lebendig halten und die Urheberschaft wahren | Ein Rezept mit dem Editor konvertieren; sehen, wie es die Validierung besteht | Aufnahmen beisteuern (eingewilligt); in den Credits erscheinen |
| **Forscher und Reviewer** | Daten, Benchmarks, ehrliche assumptions | Einen Simulator ausführen; die Kritik und die conformance suite lesen | Datensätze nutzen; Reviews veröffentlichen |
| **Förderer und politische Entscheidungsträger** | Auswirkungen, Risiken und Governance sehen | Die 2-seitige Whitepaper-Zusammenfassung und das Concept Note lesen | Piloten finanzieren; der Governance beitreten |

---

## 5. Produktarchitektur: was Cookwala bietet

| Layer | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, Profile (draft / experimental) | Core 0.3 nach erstem Geräte-Feedback | Core 1.0 unter einem Fundament |
| **Index and registry** | Beispielrezepte; registry spec | fifi.cooking corpus konvertiert (1,881 Rezepte, Arabisch + Englisch); verifizierte Namespaces | Community-Sammlungen, Weltküchen |
| **Tools** | Validator, Referenzbibliothek, dry run, conformance, Exporter | `pip install cookwala` (CLI + library); JS/TS SDK | Rezepteditor (web) |
| **Reference hub** | Core API spec | Docker hub mit einem simulierten Gerät, damit der Quickstart `curl` lokal funktioniert | Hardware-in-the-loop Kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" Benchmark |
| **Safety** | Limits pack, recalls, Vorfälle, Agent-Benchmark | Überprüfte Limits; öffentliche Agent-Safety-Ergebnisse | Certification-Schema mit einem Zertifizierer |
| **Humanitarian** | Profil, rule pack, Templates, Concept Note | Ägypten food-bank Pilotprojekt | Food-bank Netzwerk-Adaption |
| **Data** | ExecutionLog mit Einwilligung | Mitwirkenden-Netzwerk, erster datenschutzkonformer Datensatz | Multi-Küche Benchmark auf dem Hugging Face Hub |

---

## 6. Website

### 6.1 Sitemap

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Startseite, von oben nach unten

| # | Abschnitt | Zweck | Inhalt |
|---|---|---|---|
| 1 | **Hero** | In einem Atemzug sagen, was es ist | One-Liner, Triade, zwei Buttons (*Try the dry run*, *Read the quickstart*); ehrlicher Status-Chip "Draft standard · v0.2" |
| 2 | **Live demo** | Zeigen, nicht nur erzählen | "Kann dieses Gerät dieses Rezept kochen?" Wählen Sie ein Rezept und ein Gerät; jeder Schritt zeigt done / person / refuse, mit der entscheidenden rule |
| 3 | **Das Problem** | Die Lücke spürbar machen | Roboter kommen an; "simmer" bedeutet unterschiedliche Dinge; geschlossene Rezepte aus wenigen Küchen; Lebensmittel werden verschwendet, während Menschen hungern |
| 4 | **Der Loop** | Ein mentales Modell | Beschreiben → Prüfen → Kochen → Lernen, jeweils mit dem Artefakt und dem Befehl |
| 5 | **Wählen Sie Ihren Pfad** | Jeden Besucher leiten | Fünf Karten (Abschnitt 4), jede mit einem ersten Erfolg |
| 6 | **Beweis** | Momentum und Ehrlichkeit | Live-Zähler aus `/v1/stats.json` (definierte operations, conformance Vektoren, Schemata, veröffentlichte Rezepte, Sprachen); jede Zahl beschriftet |
| 7 | **Sicherheit** | Vertrauen | Sicherheit ist lokal; refusal; Agenten-Regeln; recalls; Link zu /trust |
| 8 | **Funktioniert heute** | Nützlichkeit vor Robotern | Humanitarian Profile, SMS-Beispiel, Simulatoren |
| 9 | **now / next / later** | Ehrliche Roadmap | Aus Abschnitt 5 |
| 10 | **Offen** | Neutral und beitreten | Lizenzen, Governance-Pfad, beitragen, GitHub |

### 6.3 Designrichtung
- **Gefühl:** ruhig, präzise, warm. Ein professionelles Instrument mit einer Küchenseele.
- **Typografie:** eine präzise Grotesk für das UI und eine Mono-Schrift für Daten und Code. Große, leichte Display-Schrift für den Hero (angelehnt an die Souveränität von Figure), ohne dessen filmische Dunkelheit zu kopieren.
- **Farbe:** neutrales Papier und Tinte mit einem Hitze-Akzent (Glut-Orange), der auch Temperaturdaten markiert. Die Palette ist für farbenblinde Leser validiert, und sowohl helle als auch dunkle Themes sind konzipiert.
- **Bildsprache:** echte Hände und echte heimische Küchen, sobald wir diese haben, niemals Stock-Roboter. Bis dahin tragen Diagramme und die Live-Demo die Seite.
- **Bewegung:** ein Moment, der schrittweise dry run. Alles andere ist statisch.
- **Von Beginn an zweisprachig:** Englisch und Arabisch (Rechts-nach-Links-Layout), dann weitere.
- **Barrierefreiheit:** WCAG 2.2 AA; Tastatur; reduzierte Bewegung; keine Informationen allein durch Farbe.

### 6.4 Interaktivität
1. In-Browser dry run (Rezept × Gerät).
2. Envelope explorer: ziehen Sie eine Temperaturkurve und sehen Sie, wann sie „simmer“ verlässt.
3. Simulatoren, mit aktiviertem oder deaktiviertem Protokoll.
4. Rezeptschritt-Viewer: der Satz eines Schritts, sein JSON und seine envelope nebeneinander.
5. Later: ein Rezepteditor, der während der Eingabe validiert.

---

## 7. Dokumentation

Organisiert nach dem Diátaxis-Framework, sodass jede Seite eine Aufgabe hat:

| Typ | Zweck | Seiten |
|---|---|---|
| **Tutorials** | Lernen durch Handeln | Quickstart; Dein erstes Cookwala Rezept; Mache ein Gerät Cookwala-ready; Füge Cookwala einem Agenten hinzu; Führe einen food-rescue Pilot mit SMS durch |
| **How-to guides** | Eine Aufgabe lösen | Dry-run eines Geräts; Signieren und Verifizieren; In die registry veröffentlichen; Logs nach LeRobot oder OpenTelemetry exportieren; Führe den agent-safety benchmark aus; Einen Vorfall melden; Einen recall ausgeben |
| **Reference** | Nachschlagen | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vektoren; CLI |
| **Explanation** | Verstehen, warum | Warum envelopes; Sicherheit ist lokal; trust model; Datenschutz; humanitarian design; Kritiken und Antworten; Simulatoren und ihre Grenzen |

**Docs-Ergonomie:**
- linke Navigation, Suche, „Seite kopieren“, „Auf GitHub bearbeiten“, Vorherige/Nächste-Links;
- Sprach-Tabs (Python / JavaScript / cURL / CLI);
- `llms.txt` und pro Seite Markdown für KI-Reader;
- ein Cheat Sheet und eine Seite für häufige Probleme;
- ein Changelog mit Daten.

---

## 8. API und SDK

| Deliverable | Was | Warum |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (aus `tools/`) | Ein Befehl zum ersten Erfolg |
| `@cookwala/sdk` (TypeScript) | Aus Schemas generierte Typen; Core API Client; dry run im Browser | Web- und Agent-Entwickler |
| Reference hub (Docker) | Core API mit einem simulierten Gerät und den Sicherheitsgrenzwerten | Das `curl` des Quickstarts funktioniert lokal; Testumgebung für Maker |
| MCP server | Tools: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Jeder MCP-fähige Agent kann Cookwala sicher nutzen |
| ROS 2 package | `cookwala_msgs` (actions), eine Bridge-Node zur Core API | Roboter-Maker |
| Exporters | LeRobot, OpenTelemetry (erledigt) | Lernen und Observability |
| Evals | promptfoo agent-safety benchmark (erledigt) | Agent-Builder, Safety-Reviewer |
| Versioning | Semver für Core; datierte Schema-Bundle; Changelog; Deprecation-Fenster | Stabilitätsversprechen |
| Status | Öffentliche Statusseite für cookwala.ai Endpoints | Vertrauen |

---

## 9. Demos

| Demo | Zielgruppe | Status |
|---|---|---|
| In-Browser dry run | Alle | Building now |
| Simulatoren (Zuhause, Stadt, Land, Welt) | Alle, Geldgeber | Live |
| Agent-Safety-Ergebnisse über Modelle hinweg | Agent-Entwickler, KI-Labore | Next (Benchmark ausführen, Ergebnisse mit Methode veröffentlichen) |
| SMS Food-Rescue Walkthrough | Food banks | Next (aufgezeichnete Demo) |
| Ein echtes Gerät kocht ein Cookwala Rezept, ungeschnitten | Alle | Later (die wichtigste Demo; benötigt einen Gerätepartner) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Robotik-Forscher | Later |

---

## 10. Community und Wachstum

- **Contributor-Netzwerk** (inspiriert von Figure's Index):
  - *Köche* protokollieren eingewilligte Sessions von Rezepten, die sie kennen, mit Nennung auf jeder Rezept- und
    Dataset-Card.
  - *Küchen und food banks* Pilotprojekt.
  - *Maker* implementieren Geräte.
  - *Reviewer* prüfen rule packs und envelopes.
  - *Übersetzer* übersetzen Schritte und Vokabular.
  - Bezahlte Beiträge kommen later, finanziert durch Zuschüsse. Bezahlen Sie niemals für Daten ohne informierte
    Einwilligung und faire Bedingungen.
- **Rituale:** monatlicher Community-Call; vierteljährlicher „State of Cookwala“ mit realen Zahlen;
  öffentliche Review-Threads.
- **Partnerschaftssequenz:** die ersten zehn aus dem Stakeholder-Tracker (food bank, WFP
  Innovation Accelerator, Home Assistant, ein Geräte-Startup, ein Universitätslabor, ein Certifier,
  World Central Kitchen, eine Stiftung, ein neutrales Zuhause, ein Creator).
- **Kanäle:** GitHub Discussions, ein Newsletter, Konferenzvorträge (ROSCon, IROS/ICRA
  Workshops, Food-Tech-Events), arabischsprachige Kanäle.

---

## 11. Metriken

- **North-star metric:** *verified cooks*, die Anzahl der executions, die ein signiertes Cookwala-Rezept end-to-end mit einem consented, conforming log ausgeführt haben. Solange dies null ist, tracke leading indicators.

| Funnel | Metrik | Ziel bis 2027-03 |
|---|---|---|
| Attract | Monatliche Besucher von /start | 2.000 |
| Activate | Abgeschlossene dry runs (web + CLI) | 500 |
| Build | Unabhängige Core-Implementierungen, die conformance bestehen | 2 |
| Adopt | Food-bank Pilot kg gerettet (measured) | Erster 6-Monats-Pilot läuft |
| Contribute | Externe Mitwirkende mit gemergten Änderungen | 15 |
| Trust | Veröffentlichte externe Reviews | 6 |
| Learn | Zugestimmte execution logs | 1.000 |

---

## 12. Roadmap

Die gepflegte Roadmap mit einem Status pro Element ist [`ROADMAP.md`](ROADMAP.md). Die folgende Tabelle ist der ursprüngliche 180-Tage-Plan, der zur Dokumentation aufbewahrt wird.

| Wann | Website und Story | Developer Experience | Standard und Sicherheit | Community |
|---|---|---|---|---|
| **Now (dieser Release)** | Neue Startseite mit Live dry run, Triade, Pfaden, Beweis, now/next/later; Docs-Viewer; `llms.txt`; Vertrauensseiten (Security, Governance) | Dry run; LeRobot und OTel Exporter; ROS 2 Actions; Agent-Safety Benchmark | Registry-Spezifikation (Namespaces, Versionen, Hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Nächste 30 Tage** | /start Quickstart; Arabische Startseite; Claims auf allen Seiten bestehen | `pip install cookwala`; Reference Hub (Docker) | Erste Benchmark-Ergebnisse veröffentlicht | Concept Note an Food Bank; Home Assistant Vorschlag |
| **60 Tage** | /recipes Index mit fifi Corpus (erste 100 konvertiert); /humanitarian | TS SDK; MCP Server | Envelope Review durch einen Lebensmittelwissenschaftler | Erster Community Call |
| **90 Tage** | Whitepaper + 2-seitige Zusammenfassung; /roadmap | ROS 2 Package | Core 0.3 aus Device-Feedback | Device Partner, Universität-Labor |
| **180 Tage** | Real-Device Demo-Video | Rezept-Editor | Certifier Gap-Analyse | Pilot-Ergebnisse; Foundation-Antrag |

---

## 13. Risiken für diese Strategie

| Risiko | Mitigation |
|---|---|
| Eine polierte Website über einer dünnen Realität wirkt wie Hype | Jede Behauptung ist gekennzeichnet; Live-Zähler aus echten Daten; now/next/later |
| Verbreitung über zu viele Zielgruppen | Zwei primäre Pfade für die nächsten 90 Tage: Gerätehersteller und food banks. Andere werden unterstützt, aber nicht aktiv verfolgt |
| Große Plattformen liefern geschlossene Alternativen | Seien Sie die neutrale, verifizierbare Ebene, die sie übernehmen können; Partnerschaften mit Open-Source-Akteuren (Hugging Face, Open Robotics, Home Assistant) |
| Missbrauch von Mitwirkenden-Daten | Opt-in, widerruflich; keine personenbezogenen Daten; veröffentlichte Data Cards |
| Kapazität der Gründer | Die Developer Experience (Package, hub) ausliefern, bevor weitere Spezifikationen folgen; einen Co-Maintainer rekrutieren |

