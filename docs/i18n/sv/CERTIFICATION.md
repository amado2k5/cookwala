<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance och vägen till certification

**Status:** draft, 2026-10-04 (RFC-0008). Ingen certifier har engagerats ännu; detta är den väg
standarden erbjuder.

## 1. Tre steg

| Steg | Vem | Vad det betyder | Visas som |
|---|---|---|---|
| **Self-declared** | Tillverkaren eller utgivaren | Körde de publika vektorerna med det publika verktyget och publicerade en `ConformanceReport` (`schemas/conformance.schema.json`), signerad med sin egen nyckel | rapporten, med suites och antal; aldrig en badge |
| **Verified** | En registry-operatör | Återskapade körningen mot samma vektoruppsättnings-hash och motsignerade rapporten | rapporten plus verifieraren |
| **Certified** | En oberoende certifierare (ingen existerar idag) | Körde suiten plus hårdvaru- och säkerhetsfalls-kontroller under ett publicerat schema och beviljade märket | rapporten, certifieraren, märket |

En rapport som misslyckas med någon vektor i en klass får inte göra anspråk på den klassen. registry visar
rapporter, inte badges.

Idag är den enda registry-operatören specificationens underhållare (cookwala.ai), så "verified" tillför ingen oberoende förrän en andra registry existerar; statusen visas fortfarande som self-verification.

## 2. Vad en rapport innehåller

Kärnversion, den klass som hävdats (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) eller ett profilanspråk (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), subjektet (produkt, leverantör, version), de suites som körts med totaler och misslyckade
vector ids, hashen för vektorset, verktyget och commit, datumet, statusen och
verifieraren. Exempel: `examples/conformance/report-reference.json`, producerad av

```bash
python tools/run_conformance.py --report report.json
```

## 3. Klasser och vad de bevisar

| Klass | Vektorer | Behövs även för certification (inte täckt av vektorer) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review av recept av en food-safety professional |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | enhetens egen safety case (ISO 13482, IEC 60335, UL 3300 som tillämpligt); lokal stop latency measured; safety limits enforced utan nätverk |
| Catalog | hash, signature, key revocation, recalls | key custody och incident intake process |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | resultat publicerade per model med metod |
| Verifier | alla Core suites | ingen |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; ingen personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof process |

## 4. Vad certification inte kan lova

En conformance-rapport bevisar att programvaran beteende sig som vektorerna kräver den dag den kördes.
Den bevisar inte att en enhet är säker i varje kök, att ett recept smakar rätt, eller att
ingen skada kan uppstå. En standard som lovade noll skada skulle vara ohederlig; denna lovar
att gränser upprätthålls lokalt, att refusal before heat sker, och att poster kan
kontrolleras.

## 5. Styrning av märket

Certifieringsmärket och dess regler flyttas till den neutrala grunden med varumärket (`GOVERNANCE.md`). Fram till dess existerar inget märke; endast rapporter gör det.

