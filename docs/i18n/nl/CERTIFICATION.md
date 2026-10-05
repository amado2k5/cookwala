<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance en het pad naar certification

**Status:** draft, 2026-10-04 (RFC-0008). Er is nog geen certifier ingeschakeld; dit is het pad
dat de standaard biedt.

## 1. Drie stappen

| Stap | Wie | Wat het betekent | Weergegeven als |
|---|---|---|---|
| **Self-declared** | De maker of uitgever | Voerde de publieke vectoren uit met de publieke tool en publiceerde een `ConformanceReport` (`schemas/conformance.schema.json`), ondertekend met de eigen sleutel | het rapport, met de suites en tellingen; nooit een badge |
| **Verified** | Een registry operator | Reproduceerde de run tegen dezelfde vector set hash en tegentekende het rapport | het rapport plus de verifier |
| **Certified** | Een onafhankelijke certifier (geen bestaat er vandaag) | Voerde de suite plus hardware- en safety-case controles uit onder een gepubliceerd schema en verleende het merk | het rapport, de certifier, het merk |

Een rapport dat een vector van een klasse niet doorstaat, mag die klasse niet claimen. De registry toont
rapporten, geen badges.

Vandaag is de enige registry operator de specificatiebeheerder (cookwala.ai), dus "verified" voegt geen onafhankelijkheid toe totdat er een tweede registry bestaat; de status wordt nog steeds getoond als zelfverificatie.

## 2. Wat een rapport bevat

Kernversie, de geclaimde klasse (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) of een profielclaim (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), het onderwerp (product, leverancier, versie), de suites uitgevoerd met totalen en gefaalde
vector ids, de hash van de vectorset, de tool en commit, de datum, de status en de
verifier. Voorbeeld: `examples/conformance/report-reference.json`, geproduceerd door

```bash
python tools/run_conformance.py --report report.json
```

## 3. Klassen en wat ze bewijzen

| Klasse | Vectoren | Ook nodig voor certification (niet gedekt door vectoren) |
|---|---|---|
| Recipe publisher | hash, envelope (targets binnen bands), units | content review van recepten door een food-safety professional |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | de eigen safety case van het apparaat (ISO 13482, IEC 60335, UL 3300 indien van toepassing); lokale stop latency measured; safety limits afgedwongen zonder netwerk |
| Catalog | hash, signature, key revocation, recalls | key custody en incident intake proces |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | resultaten gepubliceerd per model met methode |
| Verifier | alle Core suites | geen |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; geen personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name en version rules, tombstones | namespace proof proces |

## 4. Wat certification niet kan beloven

Een conformance rapport bewijst dat software zich gedroeg zoals de vectoren vereisen op de dag dat het werd uitgevoerd.
Het bewijst niet dat een apparaat veilig is in elke keuken, dat een recept goed smaakt, of dat
er geen schade kan optreden. Een standaard die nul schade belooft zou onjuist zijn; deze belooft
dat limieten lokaal worden afgedwongen, dat refusals gebeuren before heat, en dat gegevens kunnen
worden gecontroleerd.

## 5. Governance van het merk

Het certificeringsmerk en de bijbehorende regels gaan over naar de neutrale fundering met het handelsmerk (`GOVERNANCE.md`). Tot die tijd bestaat er geen merk; alleen rapporten doen dat.

