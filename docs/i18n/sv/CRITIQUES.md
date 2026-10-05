<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Kritik som vi publicerat

Vi ställde svåra frågor om Cookwala och skrev ner svaren. Varje oro har ett id
i [action plan's concern register](ACTION-PLAN.md#2-concern-register), tillsammans med vårt
svar och dess status. Recensioner utifrån är välkomna och kommer att listas här.

## Kommer detta att fungera? (strategy)

| Oro | Kort svar | Status |
|---|---|---|
| Marknaden existerar inte ännu; specifikationen ligger före produkterna | Small Core, demo först, ingen ny spec utan användare | Core 0.2 klar; device demo next |
| Ingen inflytelserik har en anledning att anta | Led med varje adoptörs vinst; användbart utan robotar | Food-bank pilot och device partner söks |
| Simulatorerna bevisar vad de assume | Rimlig baseline, intervall, "illustrative" etiketter; piloter ersätter dem | Open |
| Hunger handlar om fattigdom och konflikt, inte surplus | Cookwala bidrar; den påstår inte sig kunna avsluta hunger ensam | Message changed |
| Säkerhet, ansvar och attackyta | Gränser upprätthålls på enheten; refusal; recalls; incidentrapporter | Spec klar; certifier review open |
| Integritet (hälso- och religionsdata, ledgers vs radering) | Local-first, selektivt avslöjande, hash-only logs, samtycke | Spec klar; impact assessment open |
| För komplex | Core 0.2; allt annat markerat som experimentellt | Done |
| Grundarberoende | Governance-väg till ett neutralt hem | GOVERNANCE.md |

## Är den tekniska designen sund?

| Oro | Vad ändrades i Core 0.2 |
|---|---|
| Operationer hade ingen fysisk betydelse | Envelopes, värmenivåer, sensor ladders, altitude rule, test vectors |
| Buggar i enheter och nummer | Endast °C, absoluta toleranser, köksenheter, densiteter, decimal pengar |
| Scheman accepterade felskrivningar | Strikta scheman med `x-` extensions; offline bundle |
| Ett muterbart Mission-dokument | Event log + projection, single sequencer, transitions table |
| Huvudboken bevisade lite | Key records med revocation, witnessed checkpoints, rewrite detection |
| Odefinierad leverans av händelser; säkerhet på bussen | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API-ytor driver iväg | Core OpenAPI; varje referens kontrollerad i CI |
| Ingen verifierare | Reference library och 106 conformance vectors |

## Recensioner vi efterfrågar

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), livsmedelsforskare
(envelopes), livsmedelssäkerhetsansvariga och dietister (rule packs), en säkerhetsrevision, en
dataskyddsgranskning, och en certifierares gap-analys. Se
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

