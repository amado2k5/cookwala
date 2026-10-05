<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Roadmap: now, next, later

**Status:** 2026-10-04. Jeder Punkt trägt einen Status: **done**, **in progress**, **planned**,
**not yet funded**. Gates stammen aus `ACTION-PLAN.md` Abschnitt 4. Nichts bewegt sich von planned
zu done ohne die benannte Evidence.

## Now (dieser Release)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (innerhalb von etwa einem Jahr, sofern die Ressourcen es zulassen)

| Item | Status | Gate |
|---|---|---|
| Food scientist review der operation envelopes | planned | reviewer agrees |
| Dietitian und food-safety officer reviews der vier rule packs | planned | reviews filed; packs move to reviewed |
| Data-protection impact assessment des household profile | planned | reviewer agrees |
| Ein food-bank Pilot (12 weeks, pre-registered, independent evaluator) | not yet funded | partner und funding (`humanitarian/CONCEPT-NOTE.md`) |
| Agent-safety benchmark Ergebnisse für mehrere model families | planned | runs published mit method |
| `pip install cookwala` wheel und `@cookwala/sdk` auf npm | planned | packaging, das vocabularies und schemas bündelt |
| Registry service (`validate`, `publish`, tombstones) | planned | ein worker und namespace proof |
| Erster device maker, der die Core API gegen den reference hub implementiert | planned | ein maker agrees; conformance report published |
| Konvertierung der ersten fifi.cooking collections | planned | founder entscheidet über Rechte pro collection |
| Core 0.3 aus device feedback | planned | feedback von zwei implementers |
| Steering committee | planned | drei independent adopters oder zwei implementations |

## Später

| Item | Status |
|---|---|
| Ein echtes Gerät, das ein Cookwala-Rezept kocht, ungeschnitten, auf Video | noch nicht finanziert; benötigt einen Gerätepartner |
| Certification-System mit einem unabhängigen Zertifizierer | geplant; kein Zertifizierer beauftragt |
| Neutrale Grundlage für die Spezifikation, Marke und das Kennzeichen | geplant |
| Mitwirkernetzwerk: eingewilligte Aufnahmen echter Rezepte mit Namensnennung | geplant |
| Nachfrage- und Angebotsignale, veröffentlicht durch Programme und Genossenschaften | geplant, nach wettbewerbsrechtlicher Prüfung |
| "Cook in simulation" Benchmark (Isaac Lab, Gazebo oder MuJoCo) | geplant |
| Anerkennung als Digital Public Good für das Humanitarian Profile | geplant, nach Pilot-Evidence |
| Regionale Hilfsflüsse im Welt-Simulator; Clean-Cooking-Effekte | geplant |

## Was wir nicht tun werden

Personenbezogene Daten sammeln; Zahlen ohne eine Methode veröffentlichen; einen Partner benennen, bevor er zustimmt;
eine certification beanspruchen, die nicht existiert; Haushaltsdaten auf irgendein Ledger legen; einen zentralen
Orchestrator aufbauen, von dem Küchen abhängen; behaupten, den Hunger zu beenden.

## Kill- und Pivot-Regeln

Aus dem Aktionsplan: Wenn zwei externe Überprüfungsrunden keinen Gerätehersteller oder einen Pilotpartner hervorbringen, verengt Cookwala den Fokus auf das Humanitarian Profile und das Rezeptformat. Wenn ein Pilot weniger als einen Gewinn von 5 % zeigt, werden die Ergebnisse veröffentlicht und das Profil vor jeder Skalierung neu gestaltet.

