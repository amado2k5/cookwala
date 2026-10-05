<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Cookwala Humanitarian Profile (draft 0.2)

**Status:** Entwurf zur Überprüfung durch food banks, Hilfsprogramme und Fachleute für Lebensmittelsicherheit und Ernährung. Er wurde nicht von WFP, WHO, FAO, dem Global FoodBanking Network oder einer anderen hier genannten Organisation geprüft oder unterstützt.

**Dateien:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (alle), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; alle Entwürfe warten auf professionelle Prüfung, siehe [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank in Kairo, Schulmahlzeiten, Katastrophenküche, Roboterküche), jeweils mit einem berechneten `ImpactSummary`
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet und SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Was 0.2 hinzufügt (RFC-0003, RFC-0004)

Additiv über 0.1; Leser akzeptieren beides.

- **Farm to plate:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) und `Item.harvestedAt`; Rollen `farm`, `caterer`, `robot_kitchen`; das SMS-Wort `FARM`.
- **Care rules:** `Item.foodClasses` und `Distribution.menu.foodClasses` (rohes Ei, unpasteurisierte Milchprodukte, ganze Nüsse, gekochter Reis…), Regeltyp `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; drei neue Entwurfspacks.
- **Reviews:** `RulePack.reviews` zeichnet den Beruf, die Organisation, das Datum, den Umfang und das Ergebnis jeder Review auf; `status: reviewed` benötigt eine genehmigte Review.
- **Impact:** `ImpactSummary` mit neun Maßen, von denen jedes eine `method` trägt (measured, modelled, assumed, not recorded), berechnet durch `tools/humanitarian_check.py --summary`.
- **Time to claim:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg`, damit gerettete Kilogramm nur einmal gezählt werden.
- **Program types** auf dem `Manifest`.

## 1. Zweck

Ein kleiner, strenger, datenschutzfreier Teil von Cookwala für Organisationen, die Menschen ernähren:
food banks, Gemeinschaftsküchen, Schulessen-Programme, Hilfsprogramme, Spender (Lebensmittelhändler,
Restaurants, Farmen, Caterer), Transporteure und Kühllager. Er deckt vier Aufgaben ab:

1. **Angebot von surplus Nahrungsmitteln** und deren Beanspruchung, schnell und fair.
2. **Aufzeichnung jeder Übergabe** der Obhut, mit einer Temperaturprüfung (Cold-Chain-Check).
3. **Berichterstattung darüber, was serviert wurde**, nur als aggregierte Zählwerte.
4. **Überprüfung von Menüs und Übergaben** gegen maschinenlesbare Ernährungs- und Lebensmittelsicherheits-rule packs.

**Es funktioniert ohne Roboter, Apps oder Internet.** Die Stufen H0 und H1 laufen über Tabellenkalkulationen, SMS und einfache Telefone. Roboter, hubs und Agenten sind optionale Konsumenten derselben Dokumente.

## 2. Prinzipien

- **Do no harm.** Sammeln Sie nichts, das eine Person oder einen Haushalt identifizieren, lokalisieren oder profilieren könnte. In fragilen Kontexten stellen Daten über Begünstigte ein Schutzrisiko dar.
- **Humanitäre Prinzipien** (Menschlichkeit, Neutralität, Unparteilichkeit, Unabhängigkeit): kein kommerzielles Branding auf Hilfsgütern und keine Nutzung von Daten für Marketing.
- **Strikt und klein.** Jedes Objekt lehnt unbekannte Felder ab (außer `x-` Erweiterungen), sodass Tippfehler und zusätzliche persönliche Felder die Validierung nicht bestehen.
- **Exakte Einheiten:** Kilogramm, Grad Celsius, absolute Toleranzen und Geld als Dezimalzeichenfolgen.
- **Lokale Regeln gewinnen.** Rule packs sind durch nationale Lebensmittelsicherheits- und Spendengesetze ersetzbar.
- **Offen:** lizenzfreie Spezifikation, Open-Source-Tools. Das Profil ist so konzipiert, dass es den Digital Public Goods Standard und die Principles for Digital Development erfüllt.

## 3. Conformance-Stufen

| Level | Was ein Teilnehmer tut | Bedürfnisse |
|---|---|---|
| **H0 — Paper & SMS** | Erfasst Angebote, Übergaben und Verteilungen in den CSV-Templates (mit HXL-Hashtag-Zeilen) oder per SMS (Abschnitt 8.3) | Eine Tabellenkalkulation oder ein einfaches Telefon |
| **H1 — Rescue** | Tauscht `Offer`, `Claim`, `Handover` und `Distribution` Dokumente über die API aus; folgt der State Machine (Abschnitt 5) | Jeder HTTP-Client |
| **H2 — Safety & nutrition** | Wendet ein `RulePack` auf jede Übergabe und jedes Menü an und erfasst `findings` | Der Reference Checker oder ein Äquivalent |
| **H3 — Interoperability** | Exportiert Aggregate nach HXL, DHIS2 und den zentralen Cookwala `ImpactReport`; nutzt GS1-Identifikatoren | Integrationsarbeit |

Ein Teilnehmer veröffentlicht ein `Manifest` unter `/.well-known/cookwala-humanitarian.json`, das seine Levels, rule packs, Endpunkte und `personalData: "none"` deklariert.

## 4. Dokumente

| Dokument | Wer schreibt es | Zweck |
|---|---|---|
| `Offer` | Spender | Surplus Lebensmittel zur Abholung verfügbar: Artikel (kg, Lagerung, Datumsangaben, Allergene), Zeitfenster, Standort, Temperaturen |
| `Claim` | Food bank, Küche, Programm | Beansprucht alles oder einen Teil eines `Offer`, mit Abholzeit und Fahrzeugtyp |
| `Handover` | Empfänger der Obhut | Einer pro Teilstrecke: Temperaturen, kg angenommen oder abgelehnt mit einem Grundcode, und Rule findings |
| `Distribution` | Küche, Food bank, Schule | Aggregierte Mahlzeiten und versorgte Personen an einem Standort an einem Tag; optionale Nährwerte und Kosten der Menüs |
| `RulePack` | Programm oder Behörde | Versionierte Ernährungs- und Lebensmittelsicherheitsregeln (Abschnitt 6) |
| `Manifest` | Jeder Teilnehmer | Fähigkeiten und Datenschutzerklärung |

Die zentralen Cookwala-Entlastungsdokumente (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` in `relief.schema.json`) bleiben für die Planung verfügbar. Dieses Profil verwaltet den
operationalen Ablauf.

## 5. Offer lifecycle

| Von | Erlaubte next states |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (der Anspruch ist erloschen), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | keine (final) |

**Regeln für Zustandsänderungen:**

- Jede Änderung erhöht `version`. Autoren senden `If-Match: <version>`; ein Missverhältnis führt zu **409**, und der Autor liest erneut und versucht es erneut.
- Ein illegaler Übergang liefert **409** mit den erlaubten Übergängen zurück.
- Angebote wechseln automatisch bei `window.to` zu `expired`.
- Ansprüche verfallen bei `pickupBy` plus einer vom Programm festgelegten Nachfrist (Standard 30 Minuten).

**Faire Beanspruchung.** Standardmäßig gilt das Prinzip „First-come“ innerhalb einer Prioritätsstufe, die das Programm festlegt:
zum Beispiel Küchen, die zuerst Kinder versorgen, dann andere Küchen, dann food banks. Stufen und
alle Rotationsregeln müssen im `Manifest` oder auf der Website des Programms veröffentlicht werden.

## 6. Food safety and nutrition rule packs

Ein `RulePack` enthält Regeln von sechs Arten:

- `temperature`: gekühlt ≤ 5 °C, warmhalten ≥ 60 °C, gefroren ≤ −18 °C;
- `time`: gekochte Lebensmittel außerhalb der Temperaturkontrolle für maximal 2 h;
- `date_mark`: Verbrauchsdatum blockiert, Mindesthaltbarkeitsdatum warnt;
- `allergen`: nicht deklarierte Allergene blockieren;
- `nutrient`: Mengen pro Person-Tag oder pro Mahlzeit;
- `energy_share`: Anteil der Energie aus freiem Zucker, Fett, gesättigten Fettsäuren, Transfetten oder Protein.

Jede Regel ist entweder `block` (nicht akzeptieren oder bereitstellen) oder `warn` (erlaubt, als Befund aufgezeichnet).

Das Standard-Pack `basic-nutrition-food-safety@0.1.0` ist ein **Entwurf, der aus öffentlichen Leitlinien abgeleitet wurde**: die WHO-Leitlinien zu gesunder Ernährung, Natrium, Zucker und Fetten, die WHO Five Keys to Safer Food, Codex-Kennzeichnungs- und Tiefkühlkost-Kodizes sowie die Sphere-Zahlen zur Mindestrationenplanung. Es ist vereinfacht, keine medizinische Beratung, schließt die Säuglings- und therapeutische Ernährung aus und muss von qualifiziertem Personal überprüft werden. Programme sollten es kopieren und anpassen, `jurisdiction` festlegen und aufzeichnen, wer es überprüft hat, in `reviewedBy`.

Empfänger auf Ebene H2 führen das Pack bei jeder Übergabe und bei jedem Menü aus und protokollieren rule ids in `findings`. Der Reference Checker meldet, wo deklarierte und berechnete findings voneinander abweichen.

## 7. Datenschutz

**Das Profil enthält keine personenbezogenen Daten. Dokumente dürfen NICHT enthalten:**

- Namen, Telefonnummern, E-Mails oder nationale, Flüchtlings- oder biometrische Identifikatoren einer Person;
- Auf Haushaltsebene erfasste Daten oder Standorte von Wohnungen oder Einzelpersonen;
- Gesundheit, Behinderung, Religion oder Nationalität einer Person.

**Was es stattdessen trägt:**

- **Nur Organisationen.** Jede Partei ist eine Organisation, die durch `did:web`, eine GS1
  Global Location Number (GLN) oder eine registry id identifiziert wird. Personen erscheinen nur als Rollen
  (`checkedBy: "trained_staff"`).
- **Nur Aggregate.** `Distribution.people` enthält Zählungen nach Gruppen, und jede Zählung unter 10
  wird als `"<10"` gemeldet.
- **Nur Standorte.** Ein `Site` ist das Gelände einer Organisation oder ein administrativer Bereich
  (OCHA P-codes), niemals ein household.
- **Kurze Notizen.** Freitext ist auf 280-Zeichen-betriebliche Notizen beschränkt und darf keine
  personenbezogenen Daten enthalten. Implementierungen sollten Notizen auf Telefonnummern und IDs
  scannen, bevor sie diese speichern.

**Aufbewahrung und Audit:**

- **Retention:** jeder Teilnehmer gibt `retentionDays` in seinem `Manifest` an und löscht
  Dokumente nach diesem Zeitraum.
- **Audit (optional, `hash_only`):** ein Sequencer pro Programm (normalerweise die food bank oder
  der Programmbetreiber) fügt den SHA-256 Hash des RFC 8785 canonical JSON jedes Dokuments an.
  Inhalte werden separat gespeichert und bleiben löschbar. Eine Partnerorganisation
  gegenzeichnet jeden Tag einen Checkpoint, damit die Historie nicht stillschweigend umgeschrieben werden kann. Ein einzelner
  Sequencer vermeidet Forks in der Kette.
- **Hosting** sollte im Land erfolgen, wo das Gesetz oder das Programm es erfordert.

## 8. Transport

### 8.1 API (level H1)

| Methode | Pfad | Anmerkungen |
|---|---|---|
| `POST` | `/offers` | Erstellt ein Angebot (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Offene Angebote in der Nähe eines Empfängers |
| `POST` | `/offers/{id}/claims` | Beansprucht ein Angebot; `If-Match` erforderlich; 409, wenn bereits beansprucht |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` erforderlich |
| `POST` | `/handovers` | Protokolliert eine Übergabe |
| `POST` | `/distributions` | Protokolliert eine Verteilung |
| `GET` | `/reports?from=…&to=…` | Aggregiert für einen Zeitraum |

Anfrage- und Transportregeln:

- **Idempotenz:** jeder `POST` trägt einen `Idempotency-Key`. Server bewahren Schlüssel für mindestens 24 h auf und geben bei Wiederholungen die ursprüngliche Antwort zurück.
- **Authentifizierung:** OAuth 2.1 client credentials, ein Client pro Organisation.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  werden mindestens einmal zugestellt, mit einer Event-`id` zur Deduplizierung und einer pro Angebot spezifischen Sequenznummer zur Sortierung.

### 8.2 Tabellenkalkulationen (Level H0)

Verwenden Sie die CSV-Templates in `profiles/humanitarian/templates/`. Ihre zweite Zeile enthält
[HXL](https://hxlstandard.org) Hashtags, sodass humanitäre Datenwerkzeuge diese direkt lesen können.

### 8.3 SMS (level H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

Die Grammatik wird in `tools/cookwala_ref.py` (`parse_sms`) implementiert und durch
`conformance/profiles/sms.json` getestet. Schlüsselwörter sind Englisch; Arabisch-Indische (٠-٩) und Persische (۰-۹)
Ziffern werden überall dort akzeptiert, wo eine Ziffer steht, sodass ein Telefon mit einer der beiden Tastaturen funktioniert.

Lagerungscodes: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Datumsmarkierungen: `UB` use-by,
`BB` best-before, `HV` harvested, als `DDMM`. Ablehnungsgrundcodes: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; jedes andere Wort wird als `other` aufgezeichnet. Die `HELP`-
Antwort MUSS ein Beispiel pro Befehl sein, einfaches ASCII, unter 160 Zeichen.

Ein Gateway MUSS diese Prüfungen anwenden, bevor es ein Dokument schreibt (`sms_storage_findings` in der
Referenz; ids sind Block-Findings):

| Befund | Wann |
|---|---|
| `safety.temp_not_recorded` | eine `HAND` an einer gekühlten, gefrorenen oder warmgehaltenen Linie weist keinen `T`-Messwert auf: Antwort mit Bitte um diesen senden, nichts schreiben |
| `safety.hot_hold_min` | ein `OFFER` mit einer Lagerung `H` unter 60 °C: die Auflistung verweigern |
| `safety.storage_class_mismatch` | die Artikelwörter implizieren Milchprodukte, Fleisch, Geflügel, Fisch, Ei oder gekochte Speisen und die Lagerung ist `A`: die Auflistung verweigern |
| `safety.chilled_max`, `safety.frozen_max` | Messwerte über 5 °C oder über −18 °C beim Angebot oder bei der Übergabe |

Angebote für warmgehaltene Lebensmittel enden nach zwei Stunden (eine Stunde für gekochten Reis); ein Gateway speichert niemals einen Platzhalterwert. Das Gateway ordnet die registrierte Nummer des Absenders einer Organisation zu, niemals einer Person in den Dokumenten.

## 9. Interoperabilität

| System | Mapping |
|---|---|
| HXL | CSV templates; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (Produkte); `Site.gln` und `OrgId` `gln:` (Standorte) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Aggregierte Datenwerte pro Standort und Zeitraum aus `Distribution` (Mahlzeiten, Personen nach Gruppe, kg, Vorfälle) |
| WFP SCOPE und andere Begünstigtensysteme | **Nur Aggregate.** Keine Begünstigten-Datensätze gehen in dieses Profil hinein oder daraus heraus |
| Food-rescue apps | Adapter bilden ihre Angebote auf `Offer` und ihre Abholungen auf `Claim` und `Handover` ab |
| Core Cookwala | `Item.ingredientId` und `menu.recipes` verlinken auf den Rezeptindex; `relief.ImpactReport` summiert `Distribution`s |

## 10. Pilot-Metriken (definiert, damit Standorte verglichen werden können)

Berechnet in ein `ImpactSummary` durch `python tools/humanitarian_check.py --summary DIR`. Wie ein Pilot durchgeführt und bewertet wird: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Metrik | Definition |
|---|---|
| Kg gerettet | Summe von `Handover.kgAccepted` auf der ersten Etappe von Spendern |
| Claim-Rate | Angebote, die `claimed` erreichen ÷ erstellte Angebote |
| Zeit bis zum Claim | Median-Minuten von der `Offer`-Erstellung bis zum `claimed`-Status |
| Ablehnung nach Grund | Summe von `kgRejected` nach `reason` |
| Servierte Mahlzeiten | Summe von `Distribution.meals` |
| Nährwert-Passrate | Verteilungen mit Menüs und ohne `nutrition.*` Befunde ÷ Verteilungen mit Menüs |
| Kosten pro Mahlzeit | (Lebensmittel + Transport + Personal + Energie) ÷ Mahlzeiten |
| Freiwilligenminuten pro 100 kg | `volunteerMinutes` ÷ (kg verwendet ÷ 100) |
| Sicherheit | Anzahl der `safety.*` Block-Befunde und `safetyIncidents` |

## 11. Sicherheit

- **Signaturen sind bei H1 optional** und erforderlich für die organisationsübergreifende Prüfung bei H3
  (EdDSA, Schlüssel veröffentlicht unter der `did:web` der Organisation).
- **Notizen und Namen in Dokumenten sind nicht vertrauenswürdige Daten.** Software und KI-Agenten dürfen sie niemals
  als Anweisungen behandeln.
- **Rule packs sind versioniert und fixiert** (`id@version`) in jedem Befund, sodass Ergebnisse
  reproduzierbar sind.

## 12. Vorsätzlich ausgelassen

- Registrierung der Begünstigten, Berechtigung und Targeting (diese gehören zu den eigenen
  geschützten Systemen des Programms).
- Zahlungen: Cookwala bewegt niemals Geld.
- Rezepte und Roboter-Ausführung (die Kernspezifikation). Das Profil benennt nur Rezepte und berichtet
  über Nährstoffe.
- Medizinische und therapeutische Ernährung.

## 13. So führen Sie die Überprüfung durch

Bitte eröffnen Sie Issues auf [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
mit dem Label `humanitarian`. Diese Reviews sind am nützlichsten:

- Personal für Lebensmittelsicherheit prüft das rule pack und die Ablehnungsgründe;
- food-bank Betreiber prüfen den Lebenszyklus und den SMS-Flow;
- Datenschutzbeauftragte prüfen Abschnitt 7.

