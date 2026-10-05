<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Critiques die we hebben gepubliceerd

We stelden moeilijke vragen over Cookwala en schreven de antwoorden op. Elk bezwaar heeft een id
in het [action plan's concern register](ACTION-PLAN.md#2-concern-register), samen met onze
reactie en de status ervan. Reviews van buitenaf zijn welkom en zullen hier worden vermeld.

## Gaat dit werken? (strategie)

| Zorg | Kort antwoord | Status |
|---|---|---|
| De markt bestaat nog niet; de spec loopt voor op producten | Small Core, eerst demo, geen nieuwe spec zonder gebruikers | Core 0.2 gedaan; device demo next |
| Niemand met macht heeft een reden om te adopteren | Leid met het voordeel voor elke adopter; nuttig zonder robots | Food-bank pilot en device partner gezocht |
| De simulators bewijzen wat ze assumed | Eerlijke baseline, ranges, "illustratieve" labels; pilots vervangen ze | Open |
| Honger gaat over armoede en conflict, niet over surplus | Cookwala draagt bij; het claimt niet alleen honger te beëindigen | Bericht gewijzigd |
| Veiligheid, aansprakelijkheid en attack surface | Limieten afgedwongen op het device; refusal; recalls; incident reports | Spec gedaan; certifier review open |
| Privacy (gezondheids- en religiedata, ledgers vs erasure) | Local-first, selectieve disclosure, hash-only logs, consent | Spec gedaan; impact assessment open |
| Te complex | Core 0.2; de rest gemarkeerd als experimental | Done |
| Afhankelijkheid van de oprichter | Governance pad naar een neutrale thuisbasis | GOVERNANCE.md |

## Is het technisch ontwerp deugdelijk?

| Zorg | Wat veranderde in Core 0.2 |
|---|---|
| Operaties hadden geen fysieke betekenis | Envelopes, hitte-niveaus, sensor ladders, altitude rule, test vectors |
| Eenheids- en getalbugs | Alleen °C, absolute toleranties, keuken-eenheden, dichtheden, decimale valuta |
| Schema's accepteerden typefouten | Strikte schema's met `x-` extensies; offline bundle |
| Eén mutabel Mission document | Event log + projectie, enkele sequencer, transitions table |
| Het grootboek bewees weinig | Key records met revocation, witnessed checkpoints, rewrite detection |
| Ongedefinieerde event delivery; veiligheid op de bus | Sequence numbers, latency classes, heartbeats, "safety is local" |
| API surfaces drift | Core OpenAPI; elke referentie gecontroleerd in CI |
| Geen verifier | Reference library en 106 conformance vectors |

## Reviews waar we om vragen

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), voedselwetenschappers
(envelopes), voedselveiligheidsfunctionarissen en diëtisten (rule packs), een beveiligingsaudit, een
gegevensbeschermingsbeoordeling, en een gap-analyse door een certifier. Zie het
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

