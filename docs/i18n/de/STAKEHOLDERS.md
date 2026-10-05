<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->

# Stakeholder: eine Nachricht, Optionen, ein erster Erfolg und ein Ablauf für alle

**Status:** 2026-10-04. Für jede Gruppe: warum Cookwala für sie wichtig ist, Möglichkeiten des Engagements von leicht bis tiefgehend, ein erster Erfolg in unter 15 Minuten, der Weg danach und wie Engagement ihre Arbeit und die Welt voranbringt. Nichts hier benennt einen Partner, einen Nutzer oder einen Piloten, der nicht existiert. Wo etwas geplant ist, steht next oder later.

Die drei Ziele hinter jeder Zeile: helfen, Hunger zu beenden, Menschen gesünder zu machen, Roboter für Menschen arbeiten zu lassen.

---

## 1. Ersteller: Entwickler, Roboter- und Gerätehersteller, Embedded-Ingenieure, KI-Agenten-Entwickler, Smart-Home- und Plattformentwickler, Open-Source-Mitwirkende

**Nachricht.** Roboter und Geräte lernen sich zu bewegen. Niemand hat in einer Form, die eine Maschine prüfen kann, aufgeschrieben, was „simmer“ bedeutet, wann Hähnchen sicher ist oder wann ein Schritt verweigert werden muss. Cookwala ist diese Ebene: Rezepte, die eine Maschine planen kann, Endbedingungen, die sie messen kann, und Sicherheitsgrenzwerte, die sie selbst erzwingt. Es ist offen, lizenzfrei, modellneutral sowie geräteneutral und wird mit einer conformance Suite geliefert, die Sie heute bereits ausführen können.

**Optionen.**
- *Light:* führen Sie den Browser dry run aus; lesen Sie Core 0.2 (einen Abend).
- *Medium:* `pip install -e sdk/python`, führen Sie einen dry-run der Fähigkeiten Ihres Geräts gegen die
  Beispielrezepte durch, führen Sie die conformance Vektoren aus, starten Sie den Reference hub.
- *Deep:* implementieren Sie die Core API auf einem Gerät oder einem hub, veröffentlichen Sie einen conformance Bericht, fügen Sie
  Ihr Gerät dem directory hinzu, schlagen Sie ein RFC vor, schreiben Sie einen ROS 2 bridge node, fügen Sie Angriffsfälle
  dem agent-safety benchmark hinzu.

**Erster Erfolg (unter 15 Minuten).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flow.** Dry run → implement die Core API gegen den reference hub → conformance bestehen →
den Bericht veröffentlichen → das Gerät auflisten → consented execution logs werden zu LeRobot datasets und
OpenTelemetry traces.

**Wie es ihre Arbeit vorantreibt.** Eine gemeinsame Aufgabendefinition und ein Erfolgstest für das Kochen, mit einem öffentlichen Benchmark zum Messen; Rezepte in jeder Küche, ohne sie schreiben zu müssen; eine Sicherheitsgeschichte, die Regulierungsbehörden lesen können; Conformance-Berichte als Verkaufsdokument; die Position als First-Mover in einem Standard, der von seinen Implementierern verwaltet wird.

**Wie es die Gesellschaft voranbringt.** Weniger Küchenbrände und lebensmittelbedingte Krankheiten durch Maschinen, die eine refusal before heat zeigen, anstatt zu raten; Maschinen, die die Küchen der Welt erben, anstatt nur weniger.

---

## 2. Unternehmen: Startups, Unternehmen, Lebensmittelunternehmen, Lebensmittelhändler und Lieferdienste, Restaurants und Gastronomie, Versicherer, Zertifizierer, Vertriebs- und Partnerschaftsteams

**Nachricht.** Jedes Unternehmen, das mit Lebensmitteln zu tun hat, wird in den nächsten Jahren auf Kochmaschinen und KI-Agenten treffen. Cookwala bietet Ihnen eine einzige Schnittstelle für alle diese Systeme, die einzige mit auf dem Gerät erzwungenen Sicherheitsgrenzwerten und Protokollen, die Sie prüfen können. Für Lebensmittelhändler und Lieferdienste: erhalten Sie Lieferfenster und Allergenanforderungen, niemals den Zeitplan einer Familie. Für Versicherer und Zertifizierer: ein Format für Konformance-Berichte und ein Feed für Vorfallberichte, die speziell für Sie entwickelt wurden.

**Optionen.**
- *Light:* lesen Sie die Seite „Investors and partners“ und die Trust-Seiten; ordnen Sie Ihre Produkte den
  Zutatenklassen und Operationen zu.
- *Medium:* veröffentlichen Sie einen Offer Feed (Market Profile, experimental) oder ein Surplus-Angebot an ein
  lokales Programm (Humanitarian Profile); führen Sie den Agent-Safety-Benchmark auf dem Agenten aus, den Sie
  einsatzbereit machen wollen.
- *Deep:* implementieren Sie die Core API in einem Produkt; sponsern Sie eine Conformance-Verifizierung; treten Sie dem
  Lenkungsausschuss bei, wenn er sich bildet; wählen Sie den Certification-Pfad.

**Erster Erfolg.** Konvertieren Sie eine Produktlinie in ein Markt-`Offer` mit GTINs und Allergen-Nachweisen, validieren Sie es und sehen Sie, welche Beispielrezepte es liefern kann.

**Flow.** Angebot anbieten → derived constraints von Haushalten → Bestellungen über Ihren eigenen Checkout → Erfüllungsereignisse → Reputation aus execution reports (mit Einwilligung).

**Wie es ihre Arbeit voranbringt.** Zugang zu einer neutralen Ebene anstelle von einem Dutzend Anbieterintegrationen; Nachfragesignale (later, nach wettbewerbsrechtlicher Prüfung), die Verschwendung reduzieren; certification, die Versicherer kalkulieren können; ein öffentliches Register der Sicherheit.

**Wie es die Gesellschaft voranbringt.** Weniger Lebensmittelverlust zwischen Geschäft und Teller; surplus, das Küchen erreicht, bevor es verrottet; Maschinen in Haushalten, die nicht zu unsicheren Handlungen überredet werden können.

---

## 3. Anbieter: Lebensmittelhändler, Bauernhöfe und Genossenschaften, Lieferung, Energie, KI- und Modellanbieter, Rezeptverleger

**Nachricht.** Anbieter schließen sich an Cookwala als Peers an, nicht als Mandanten. Ein Lebensmittelhändler oder Lieferdienst erhält eine constraint, niemals die Fakten eines Haushalts. Ein KI-Anbieter erhält einen Benchmark, der zeigt, dass sein Modell in einer Küche sicher ist, und einen MCP-Server zur heutigen Nutzung. Ein Rezeptverleger behält seinen Namen auf jedem Rezept und kann einen signierten Katalog aus einem statischen Ordner veröffentlichen.

**Optionen.** Einen Katalog (Rezepte) veröffentlichen · einen Offer Feed veröffentlichen · den agent-safety benchmark ausführen · einen registry node ausführen · surplus per SMS anbieten.

**Erster Erfolg.** Rezept-Publisher: `cookwala init my-dish`, bearbeiten, `cookwala validate`,
`cookwala hash`; Ihr Katalog ist ein Ordner mit `/.well-known/cookwala.json`. AI-Anbieter:
den MCP-Server hinzufügen und die zehn Agent-Safety-Cases ausführen.

**Flow.** Katalog oder Feed → registry-Eintrag unter Ihrem nachgewiesenen Namespace → recall feed, falls etwas schiefgeht → Reputation aus Ergebnissen.

**Wie es ihre Arbeit vorantreibt.** Erreichen Sie jedes Gerät und jeden Agenten durch ein einziges Format;
Gutschrift und Provenienz durch Signatur; ein Sicherheits-Benchmark, der ein Marketing-Asset ist, wenn er
ehrlich bestanden wird.

**Wie es die Gesellschaft voranbringt.** Rezepte bleiben zugeordnet; Agenten, die für Menschen handeln, werden measured, bevor ihnen vertraut wird.

---

## 4. Lebensmittel: Landwirte, Köche und Chefköche, Hausköche, Rezeptentwickler, Kochschulen

**Nachricht.** Ein für Cookwala geschriebenes Rezept hält deinen Namen und deine Küche auf jedem Gerät, das es kocht, lebendig, wobei die Schritte, die eine Maschine niemals überspringen darf, aufgeschrieben sind. Ein Bauernhof mit einem Überschuss kann es per SMS auflisten und noch am selben Tag eine Küche erreichen. Eine Kochschule kann Lebensmittelsicherheit mit einem Format lehren, das sich selbst prüft.

**Optionen.**
- *Landwirte:* `FARM 120KG TOMATO A BB0411` an das Gateway eines Programms (sofern vorhanden);
  later, Versorgungs- und Nachfragesignale lesen.
- *Köche und Chefköche:* verwandeln Sie ein Rezept, das Sie auswendig kennen, in ein Cookwala Rezept; überprüfen Sie die
  Schrittsätze in Ihrer Sprache; later, aufgezeichnete Sitzungen mit Credit festhalten.
- *Schulen:* nutzen Sie die neun Beispielrezepte als Lehrfälle; fügen Sie eigene hinzu.

**Erster Erfolg.** Cooks: `cookwala init`, schreiben Sie ein Rezept mit einer Endbedingung für jeden
Hitzeschritt, validieren Sie es. Farmers: senden Sie ein SMS-Angebot an ein Programm, das das Profil ausführt (keines
läuft bereits; der Parser und die Vektoren existieren).

**Flow.** Rezept → Validierung → Katalog → dry run auf Geräten → execution logs zeigen, wie es auf echten Maschinen performt → Revisionen mit Belegen.

**Wie es ihre Arbeit voranbringt.** Attribution, die mitreist; ein Rezept, das von Maschinen in anderen Ländern gekocht werden kann; für Landwirte ein Weg, einen Überschuss in Mahlzeiten statt in Abfall zu verwandeln.

**Wie es die Gesellschaft voranbringt.** Kulinarisches Erbe bewahrt als praktisches Wissen, nicht als Video;
weniger Abfall am Erzeugerhof.

---

## 5. Humanitär: NGOs, food banks, Gemeinschaftsküchen, Schulmahlzeit-Programme, Hilfsorganisationen, Spender

**Nachricht.** Das Humanitarian Profile bewegt surplus Lebensmittel mit Telefonen und Tabellenkalkulationen auf Teller, protokolliert Kühlkettenprüfungen, zählt Mahlzeiten und enthält **keine personenbezogenen Daten**. Es arbeitet ohne Roboter, Apps oder Internet. Es liefert Ihnen Zahlen, die Sie verteidigen können: gerettete Kilogramm, servierte Mahlzeiten, Ernährungs-Passrate, Kosten pro Mahlzeit, Zeit bis zur Beanspruchung, Sicherheitsvorfälle, jeweils mit seiner Methode.

**Optionen.**
- *Light:* lesen Sie das Profil und das Pilotprotokoll; versuchen Sie den SMS-Walkthrough.
- *Medium:* führen Sie die CSV-Templates an einem Standort für vier Wochen aus (Level H0) und berechnen Sie eine
  Impact-Zusammenfassung.
- *Deep:* ein 12-wöchiger präregistrierter Pilot mit einer Baseline und einem unabhängigen Evaluator;
  passen Sie die rule packs mit Ihrem Food-Safety-Lead an das nationale Recht an; betreiben Sie Ihren eigenen registry
  Node.

**Erster Erfolg.** Füllen Sie die drei CSV-Templates für einen Tag aus, führen Sie
`cookwala humanitarian --summary your-folder` aus, lesen Sie das `ImpactSummary` mit einer Methode unter
jeder Zahl.

**Flow.** Angebot → Anspruch → Übergabe mit Temperaturprüfung → Verteilung → Wirkungszusammenfassung → veröffentlichte Ergebnisse, was auch immer sie zeigen.

**Wie es ihre Arbeit voranbringt.** Vergleichbare Zahlen über Standorte hinweg; Belege für Geldgeber;
Sicherheitsbefunde vor, nicht nach einem Problem; ein Format, das die Systeme der Spender lesen können (HXL,
GS1, DHIS2 Mappings).

**Wie es die Gesellschaft voranbringt.** Mehr Lebensmittel erreichen Menschen sicher, wobei ihre Würde gewahrt bleibt:
keine Namen, keine Gesichter, kein Profiling.

---

## 6. Gesundheit: Ernährungsberater, Lebensmittelsicherheitsbeauftragte, Gesundheitsbehörden, Pflegeheime

**Nachricht.** Ernährungs- und Lebensmittelsicherheitsregeln als maschinenprüfbare rule packs, abgeleitet aus öffentlichen Leitlinien, angewendet auf Menüs und Übergaben, wobei Ihre Überprüfung nach Beruf und Ergebnis aufgezeichnet wird. Nichts ist medizinischer Rat; nichts wird über das hinaus behauptet, was die packs sagen.

**Optionen.** Überprüfen Sie ein rule pack mit der Vorlage (zwei Stunden) · passen Sie ein rule pack an nationale Regeln an · schlagen Sie Pflege-Regeln für die Menschen vor, denen Sie dienen · später, lesen Sie aggregierte Ergebnisse aus Programmen.

**Erster Erfolg.** Öffnen Sie `profiles/humanitarian/care-vulnerable-groups.rulepack.json` und
die Review-Vorlage; markieren Sie drei Regeln als approved, changed oder rejected; reichen Sie die Review ein.

**Flow.** Entwurfspaket → Prüfung → Status geprüft → Programme übernehmen → Ergebnisse in jeder
Verteilung → Ergebnisse veröffentlicht mit Methoden.

**Wie es ihre Arbeit voranbringt.** Ihre Anleitung läuft in jeder Küche, die sie einführt, einschließlich Roboterküchen, mit Ihrem Beruf als Referenz; eine publizierbare Rezension; ein Datensatz von Erkenntnissen (aggregiert, keine personenbezogenen Daten) für die Forschung.

**Wie es die Gesellschaft voranbringt.** Weniger Natrium, Zucker und gesättigte Fette in Massenspeisungen; sichereres Warmhalten und Kühlen; Fürsorge für Kinder und ältere Menschen, die in die Maschine eingeschrieben ist.

---

## 7. Bildung: Schullehrer, Pädagogen, Professoren, Forscher, Studenten

**Message.** Kochen ist der vertrauteste Prozess der Welt, und Cookwala verwandelt ihn in ein
Lehrobjekt: Temperaturen, Einheiten, gerechte Aufteilung, Sicherheit, Maschinen, die Regeln folgen. Für
Forscher ist es ein Benchmark, ein Datensatzformat und eine Liste offener Probleme.

**Optionen.**
- *Lehrer:* das Lesson Kit (`docs/education/LESSON-KIT.md`): fünf Lektionen von „was ist ein
  simmer“ bis „was eine Maschine niemals tun sollte“.
- *Professoren und Studenten:* die Liste der Forschungsthemen, die Simulatoren, die Conformance-
  Vektoren als Testbedingungen, der LeRobot-Export, offenstehende Probleme im Umfang einer Abschlussarbeit.
- *Forscher:* Veröffentlichung von Datensätzen einvernehmlicher Executions; Kritik an den Annahmen der Simulatoren; Vorschlag von Vektoren.

**Erster Erfolg.** Lehrer: führen Sie den Browser dry run im Unterricht aus und fragen Sie, warum das Gerät die Verweigerung (refusal before heat) gezeigt hat. Schüler: ändern Sie eine assumption im Stadt-Simulator und erklären Sie das Ergebnis.

**Flow.** Lektion → Projekt → Datensatz → Paper → RFC.

**Wie es ihre Arbeit voranbringt.** Kostenloses, offenes, zitierfähiges Material; ein Benchmark, an dem niemand Anteile hält;
Mitautorenschaft am Standard durch RFCs.

**Wie es die Gesellschaft voranbringt.** Eine Generation, die weiß, was eine sichere Küche ist, und ein Sicherheitsdatenblatt lesen kann.

---

## 8. Regierung: Regierungen, Ministerien, Stadtbeamte, Regulierungsbehörden, Politiker und Gesetzgeber, Regierungs- und Standardisierungsorgane

**Nachricht.** Haushalts- und gewerbliche Kochmaschinen treffen unter Vorschriften ein, die separat für Geräte und Software geschrieben wurden. Cookwala gibt Regulierungsbehörden etwas Konkretes, auf das sie verweisen können: Sicherheitsgrenzwerte, die auf dem Gerät erzwungen werden, refusal before heat, signierte Aufzeichnungen, anonyme Meldung von Vorfällen und eine conformance Suite, die jeder ausführen kann. Für die Sicherheit bei Lebensmittelspenden bietet es einen Datenstandard ohne personenbezogene Daten. Es ist lizenzfrei und strebt eine neutrale Governance an.

**Optionen.** Lesen Sie den Policy Brief (`docs/policy/BRIEF.md`) · verwenden Sie die Modellsprache für Lebensmittelspenden-Daten und die Sicherheit von Kochmaschinen · bitten Sie Ihr Normungsorgan, Core 0.2 zu prüfen · betreiben Sie einen nationalen Registry-Knoten · finanzieren Sie ein Pilotprojekt mit Ihrem Schulessen-Programm.

**Erster Erfolg.** Lesen Sie das zwei Seiten umfassende Briefing und prüfen Sie drei Dinge im Repository: das safety limits pack, den conformance runner, die humanitären Datenschutzregeln.

**Flow.** Kurz → Prüfung durch eine nationale Normungsorganisation → Referenz in Leitlinien → Pilot →
certification scheme.

**Wie es ihre Arbeit voranbringt.** Eine fertige, überprüfbare technische Basis; Belege aus Pilots; ein Kanal zur Industrie durch einen neutralen Standard; Interoperabilität mit den humanitären Datenstandards, die Sie bereits verwenden.

**Wie es die Gesellschaft voranbringt.** Sicherere Maschinen in Haushalten; Lebensrettung bei Lebensmitteln, die den Menschen dient, die sie versorgt; weniger Abfall in Städten.

---

## 9. Kapital: Investoren, Unternehmer, Philanthropien, Entwicklungsbanken

**Message.** Kochen wird bald zur Infrastruktur. Der Standard ist kostenlos; die Dienstleistungen
darum herum sind ein Geschäft: certification, hub Software, eingewilligte Datensätze, registry
Operationen, Pilotprojekte. Die humanitäre Ebene ist ein öffentliches Gut, das Entwicklungsorganisationen
mit vorregistrierter Evaluierung unterstützen können. Es werden nirgendwo auf dieser Seite finanzielle Versprechen gemacht.

**Optionen.** Lesen Sie die Gelegenheit, das Geschäftsmodell, die Roadmap, die Risiken und die Governance
(`/investors`) · finanzieren Sie einen dry run oder eine Überprüfung · unterstützen Sie ein Unternehmen, das neben dem
kostenlosen Standard Dienste verkauft · treten Sie der Governance als Förderer-Beobachter bei.

**Erster Erfolg.** Lesen Sie die Abschnitte Problem, Architektur und Risiken des Whitepapers sowie das Concern Register des Aktionsplans; jedes offene Risiko ist aufgeführt.

**Flow.** Evidence (pilots, conformance, adopters) → gates in the action plan → funding
tied to gates → neutral foundation for the standard, a company for services.

**Wie es ihre Arbeit voranbringt.** Frühe Position in einem kategoriedefinierenden Standard mit ehrlichen Zahlen; ein investierbares Dienstleistungsunternehmen, getrennt vom Gemeinwohl.

**Wie es die Gesellschaft voranbringt.** Kapital fließt dorthin, was measured ist, nicht dorthin, was behauptet wird.

---

## 10. Gedanke: Philosophen, Ethiker, Historiker und Futuristen

**Nachricht.** Wenn eine Maschine das Rezept einer Großmutter kocht, wem gehört das Wissen? Was bedeutet Würde in der automatisierten Pflege? Was darf der Roboter eines Haushalts wissen, und wer sonst noch darf es wissen? Cookwala hat in Code Entscheidungen über diese Fragen getroffen; die Essays (`docs/essays/`) sagen aus, welche dies waren, und laden zu Meinungsverschiedenheiten ein.

**Optionen.** Essays lesen · eine Antwort schreiben · eine Regel vorschlagen (ein RFC ist ein philosophisches Argument mit einem Schema) · im Ethik-Review des household context Profils sitzen.

**Erster Erfolg.** Lesen Sie den Essay über household data und die travel rules des facet registry;
finden Sie eine facet, deren default Sie ändern würden, und sagen Sie warum.

**Flow.** Essay → öffentlicher Kommentar → RFC → geänderter Standard.

**Wie es ihre Arbeit vorantreibt.** Ein Live-Fall, in dem ethische Positionen zu laufenden Regeln werden,
mit einem öffentlichen Protokoll der Argumentation.

**Wie es die Gesellschaft voranbringt.** Entscheidungen über intime Daten und kulturelles Erbe, die offen getroffen werden, bevor die Maschinen in Millionen von Haushalten eintreffen.

---

## 11. Alle: Menschen, denen Lebensmittel, Abfall, Arbeitsplätze, das Klima und die Zukunft am Herzen liegen

**Nachricht.** Cookwala ist eine Möglichkeit, ein Rezept so zu schreiben, dass jeder oder alles es sicher kochen kann, und ein Weg, damit Lebensmittel, die weggeworfen würden, jemanden erreichen, der sie braucht. Es ist kostenlos, es gehört keinem Unternehmen und es sagt, was es nicht weiß.

**Optionen.** Versuche den dry run · spiele einen Simulator · lies die Rezepte · schreibe ein Rezept, das du liebst · folge der Roadmap · erzähle einer food bank oder einer Schule davon.

**Erster Erfolg.** Ändere das Gerät im dry run und beobachte, wie ein Schritt abgelehnt wird; lies, warum.

**Flow.** Neugier → ein Rezept → ein Gespräch mit einer Küche, die es gebrauchen könnte.

**Wie es ihr Leben voranbringt.** Sicherere Maschinen im Haushalt, ihre eigenen Rezepte bewahrt, ein Weg zu helfen, ohne Geld zu geben.

**Wie es die Gesellschaft voranbringt.** Weniger Abfall, sicherere Lebensmittel, Maschinen, die Menschen dienen, die nicht für sich selbst kochen können, und zurückgewonnene menschliche Zeit.

---

## 12. Jobs und Würde, ganz offen gesagt

Kochmaschinen werden die Arbeit verändern. Cookwala-Positionen: Menschen können immer kochen; die ersten Nutzungen sind für Menschen, die nicht für sich selbst kochen können, und für Gemeinschaftsküchen, denen es an Arbeitskräften mangelt; der Name eines Kochs bleibt bei einem Rezept erhalten, egal wo es gekocht wird; eine Stimme der Arbeit hat einen Sitz im Lenkungsausschuss; neue Rollen (Rezept-Ingenieure, Lebensmittel-Roboter-Techniker, Certifier, Rule-Pack-Reviewer) werden genannt, ohne Zahlen zu versprechen.

## 13. Wo jede Gruppe auf der Seite landet

| Gruppe | Seite |
|---|---|
| Builder | `/for/developers/`, `/developers/`, `/playground/` |
| Unternehmen | `/for/companies/`, `/investors/` |
| Anbieter | `/for/providers/`, `/registry/` |
| Lebensmittel | `/for/food/`, `/farmers/` |
| Humanitäres | `/for/humanitarian/`, `/humanitarian/` |
| Gesundheit | `/for/health/` |
| Bildung | `/for/education/`, `/education/` |
| Regierung | `/for/government/`, `/policy/` |
| Kapital | `/for/capital/`, `/investors/` |
| Denken | `/for/thought/`, `/ideas/` |
| Alle | `/`, `/why/`, `/impact/` |

