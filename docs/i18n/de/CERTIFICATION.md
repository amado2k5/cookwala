<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance und der Weg zur certification

**Status:** Entwurf, 2026-10-04 (RFC-0008). Es wurde noch kein Zertifizierer beauftragt; dies ist der Weg, den der Standard bietet.

## 1. Drei Schritte

| Schritt | Wer | Was es bedeutet | Wird angezeigt als |
|---|---|---|---|
| **Self-declared** | Der Hersteller oder Herausgeber | Hat die öffentlichen Vektoren mit dem öffentlichen Tool ausgeführt und einen `ConformanceReport` (`schemas/conformance.schema.json`) veröffentlicht, signiert mit dem eigenen Schlüssel | der Bericht, mit den Suites und Zählungen; niemals ein Badge |
| **Verified** | Ein Registry-Betreiber | Hat den Durchlauf gegen denselben Vektor-Set-Hash reproduziert und den Bericht gegengezeichnet | der Bericht plus der Verifizierer |
| **Certified** | Ein unabhängiger Zertifizierer (existiert heute nicht) | Hat die Suite plus Hardware- und Safety-Case-Prüfungen unter einem veröffentlichten Schema ausgeführt und das Markenzeichen erteilt | der Bericht, der Zertifizierer, das Markenzeichen |

Ein Bericht, der einen Vektor einer Klasse nicht erfüllt, darf diese Klasse nicht beanspruchen. Das registry zeigt
Berichte, keine Badges.

Heute ist der einzige registry-Betreiber der Spezifikations-Maintainer (cookwala.ai), daher fügt „verified“ keine Unabhängigkeit hinzu, bis eine zweite registry existiert; der Status wird weiterhin als self-verification angezeigt.

## 2. Was ein Bericht enthält

Kernversion, die beanspruchte Klasse (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) oder ein Profilanspruch (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), das Subjekt (Produkt, Anbieter, Version), die ausgeführten Suites mit Summen und fehlgeschlagenen
Vektor-IDs, der Hash des Vektorsatzes, das Tool und der Commit, das Datum, der Status und der
Verifier. Beispiel: `examples/conformance/report-reference.json`, erstellt von

```bash
python tools/run_conformance.py --report report.json
```

## 3. Klassen und was sie beweisen

| Klasse | Vektoren | Ebenfalls benötigt für certification (nicht durch Vektoren abgedeckt) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review von Rezepten durch einen Lebensmittelsicherheitsexperten |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | das eigene safety case des Geräts (ISO 13482, IEC 60335, UL 3300 wie anwendbar); lokale Stopp-Latenz measured; Sicherheitsgrenzwerte ohne Netzwerk erzwungen |
| Catalog | hash, signature, key revocation, recalls | Key-Verwahrung und Incident-Intake-Prozess |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | Ergebnisse pro Modell mit Methode veröffentlicht |
| Verifier | alle Core suites | keine |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; kein Audit personenbezogener Daten |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof Prozess |

## 4. Was die certification nicht versprechen kann

Ein conformance-Bericht beweist, dass sich die Software so verhalten hat, wie es die Vektoren an dem Tag erforderten, an dem sie lief.
Er beweist nicht, dass ein Gerät in jeder Küche sicher ist, dass ein Rezept gut schmeckt oder dass
kein Schaden entstehen kann. Ein Standard, der null Schaden verspricht, wäre unehrlich; dieser hier verspricht,
dass Limits lokal durchgesetzt werden, dass refusals before heat stattfinden und dass Aufzeichnungen
geprüft werden können.

## 5. Governance der Marke

Das Zertifizierungszeichen und seine Regeln gehen mit der Marke in das neutrale Fundament über (`GOVERNANCE.md`). Bis dahin existiert kein Zeichen; es gibt nur Berichte.

