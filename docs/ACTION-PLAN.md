# Cookwala Action Plan: answering the critics

**Status:** draft, 2026-10-04. Owner: the Cookwala maintainer. Review this plan every month and
update the status column.

This plan answers every concern raised so far in one place:

- the **red-team critique** of the idea;
- the **technical critique** of the specs;
- what an **Elon Musk–style adopter**, **Claude** and **Anthropic** would need;
- what **WFP, food banks and WHO** would need;
- the **stakeholders** who may resist;
- the **technical reviewers**: standards bodies, food-safety and nutrition professionals,
  robotics researchers, AI-safety and security reviewers, humanitarian data bodies,
  regulators and lawyers.

## 1. The six commitments behind the plan

1. **Evidence before claims.** Simulators illustrate; pilots prove. Every public number says
   which one it is.
2. **A small core, optional profiles.** A device should be able to implement Cookwala in a
   week. Everything else must earn its place with real usage.
3. **Safety is enforced on the device**, whatever a recipe, an agent or the network says.
4. **People without robots come first.** Food banks, kitchens and phones before humanoids.
5. **Personal data stays home.** Minimal by default, erasable, never sold, never used for
   training without opt-in.
6. **Neutral and durable.** A foundation, a patent pledge and seats for the people affected.
   Nothing depends on one founder, one company or one AI model.

## 2. Concern register

Each concern has an id, the people who raised it, the response, the workstream (section 3)
and the evidence that closes it.

| Id | Concern | Raised by | Response | Work-stream | Closed when |
|---|---|---|---|---|---|
| C1 | No market yet; spec far ahead of products | Red team, Musk lens | Ship a small core and one working device demo before adding anything | W1, W7 | One device cooks 10 recipes from the index |
| C2 | Nobody powerful has a reason to adopt | Red team, Musk lens | Lead with what each adopter gains: device makers get recipes and a dataset, grocers get demand signals and less loss, food banks get free tools | W7, W10, W12 | Two independent implementers |
| C3 | Simulators are circular and use a strawman | Red team, Claude | Add a competent-integration baseline, ranges instead of single numbers, adjustable assumptions, sensitivity analysis; label everything "illustrative" | W5 | Simulator v1.0 with uncertainty published |
| C4 | Hunger is about poverty and conflict, not surplus | Red team, WFP lens | Reframe: the protocol contributes to access and less waste; the relief layer works with programs; no "ends hunger" claims without evidence | W6, W12 | Claims policy applied to site and docs |
| C5 | Safety, liability, attack surface of robots with heat and blades | Red team, technical critique, regulators, insurers | Safety limits enforced on the device; a local stop; recipe text treated as untrusted; recalls; incident reporting; a written safety case | W3 | Safety case reviewed by a certifier |
| C6 | Privacy: health and religion data, ledger vs right to erasure | Red team, technical critique, data-protection authorities, privacy groups | Local-first; selective disclosure; hash-only ledger; data-protection impact assessment | W4 | Assessment published, reviewed by a privacy professional |
| C7 | Antitrust risk of sharing demand signals | Red team, competition authorities | Aggregate and delay signals; publish an information-exchange policy reviewed by competition counsel | W4, W8 | Counsel opinion on file |
| C8 | Too complex: Missions, ledger, marketplace | Red team, Musk lens, technical critique | Core 1.0 on one page; Missions, ledger, market and relief become optional, experimental profiles | W1 | Core spec fits on one page |
| C9 | Cooking operations have no physical meaning | Technical critique, IEC TC 59, food scientists | Define temperature, power and time envelopes for each operation, a sensor fallback ladder and test vectors | W2 | Test vectors pass on two executors |
| C10 | Units and number bugs (relative temperature tolerance, float money, missing kitchen units) | Technical critique | Celsius only on the wire, absolute tolerances, decimal money, densities and kitchen units | W2 | Schemas updated, tests added |
| C11 | Schemas accept typos; no version rules | Technical critique, W3C TAG | Strict schemas (with an `x-` escape hatch), bundled offline, version-negotiation rules | W2 | Every schema strict; validator offline |
| C12 | Mission is one mutable document with many writers | Technical critique | An event log plus derived state, a formal state machine, one sequencer per Mission | W2 | State machine spec and reference implementation |
| C13 | The ledger is weaker than claimed | Technical critique, IETF SCITT | Witnessed checkpoints, identity bound to keys, rotation, revocation, offline verification, a real verifier tool | W2 | Verifier passes test vectors; SCITT feedback received |
| C14 | Event delivery undefined; safety on the bus | Technical critique | At-least-once delivery with idempotency; "safety is local" as a normative rule; latency classes; heartbeats | W2, W3 | Spec section and conformance tests |
| C15 | Five hand-written API surfaces drift apart | Technical critique | Generate OpenAPI, GraphQL and AsyncAPI from the schemas; contract tests | W2 | CI fails on drift |
| C16 | Doesn't fit end-to-end robot learning | Musk lens, robotics researchers | Position Cookwala as task definition, done criteria, safety limits and an execution dataset, not motion | W1, W7 | Paper or workshop accepted; one learning lab uses the format |
| C17 | No data flywheel | Musk lens, Anthropic lens | A consented execution log (recipe, sensors, outcome, rating) as an open benchmark and a licensable dataset | W7, W4 | First 1,000 logged executions with consent |
| C18 | AI agents need accountability and injection defense | Claude, Anthropic, OWASP, AI safety institutes | Mandates tied to a human; confirmation for irreversible actions; an untrusted-text rule; a kitchen agent-safety benchmark | W3, W7 | Benchmark published, with results for several models |
| C19 | Should build on MCP, stay model-neutral | Anthropic lens | Index and hub as MCP servers, a Cookwala Agent Skill, no dependence on one model | W7 | MCP servers published; tested with two model families |
| C20 | Works only for the rich; equity | Claude, WHO, WFP, world simulator | Humanitarian Profile (SMS, CSV); free forever for relief; equity metrics in every report | W6, W11 | Pilot running at level H0/H1 |
| C21 | Beneficiary data risk in fragile settings | WFP, ICRC, OCHA | Humanitarian Profile carries no personal data; small-number suppression; in-country hosting | W6, W4 | Review against ICRC and OCHA guidance |
| C22 | Volume over nutrition; "dumping" of unhealthy surplus | Food banks, WHO, dietitians | Nutrition rule pack; report nutrition pass rate, not only kg | W6 | Rule pack reviewed by a dietitian |
| C23 | Health claims are close to medical-device rules | Claude, WHO, regulators | Limit advice to general nutrition; condition management only with clinicians and regulatory advice | W3, W12 | Health claims policy in place |
| C24 | Clean cooking and full lifecycle impact ignored | WHO, Claude, energy reviewers | Add clean cooking and robot lifecycle carbon to the simulators; state where robots cost more than they save | W5 | Simulator update published |
| C25 | Western-centric vocabulary | Claude, translators, cuisine experts | World-cuisine coverage starting with fifirecipes' Egyptian recipes; communities govern their own techniques | W11 | 20 non-Western techniques defined with tests |
| C26 | Founder dependency, no IP policy, no neutral home | Red team, Anthropic lens, WFP | Foundation, charter, patent pledge, trademark policy, governing seats for food banks, low-income countries, labour and privacy | W8 | Accepted by a foundation |
| C27 | Who pays for the index, moderation and safety review | Red team | A company that sells services (certification, hub software, dataset licences, grocer fees) next to a free standard | W10 | First paying customer or grant |
| C28 | Labour displacement | Unions, red team | Engage early; prioritise uses that help people who can't cook (elderly, disabled, community kitchens); offer unions a governance seat | W11, W8 | Labour representative invited |
| C29 | Religious dietary rules for robot preparation | Halal and kosher authorities | Dietary-compliance profile written with certifiers | W11 | Draft reviewed by one certifier |
| C30 | No formal external review yet | All technical reviewers | Sequenced review program (section 5) | W9 | Six external reviews received and published |

### Spec progress (2026-10-04, Core 0.2)

| Concern | What changed in the spec | Still open |
|---|---|---|
| C8 complexity | Core 0.2 defined; other parts marked experimental | Cut Core to one page after first device feedback |
| C9 operation meaning | Envelopes for 32 operations, heat levels, sensor ladders, altitude rule, 12 envelope vectors; validator rejects out-of-envelope targets | Field-test the bands with a food scientist |
| C10 units and numbers | °C only, absolute tolerances, kitchen units, densities, decimal money | None in spec |
| C11 strict schemas, versions | All Cookwala schemas strict with `x-` extensions; offline bundle; version rules | None in spec |
| C12 Mission state | Event log + projection, single sequencer, transitions table, reference replay | Port the simulator to emit event logs |
| C13 ledger and trust | KeyRecords with revocation, witnessed checkpoints, rewrite detection, hash-only mode, reference verifier | SCITT review |
| C14 events | Sequence numbers, latency classes, heartbeat, "safety is local" | Update AsyncAPI channels |
| C15 API drift | Core OpenAPI; validator resolves every API reference | Generate GraphQL from schemas |
| C5 safety | SafetyLimits (local, non-overridable), local stop rule, recalls, incident reports | Certifier review of the limits |
| C6 privacy | Selective disclosure, consent-gated personal-data-free ExecutionLog, hash-only logs | Data-protection impact assessment |
| C17 data flywheel | ExecutionLog schema with consent | First real logs |
| C18 agents | AgentMandate, untrusted-text rule, mandate refusal | Agent-safety benchmark |

## 3. Workstreams

### W1. Scope: Cookwala Core 1.0
- **Core 1.0 on one page.** It contains:
  - a recipe: ingredients, steps, done criteria and safety limits;
  - device capabilities;
  - one execute-and-status API;
  - an execution log.
- **Everything else becomes a profile marked experimental:** Missions, the ledger, the
  market, relief, health and reasoning. Each profile needs two implementers and real usage
  before it can graduate.
- **Rewrite PLAN.md around the core,** and move the broad vision into a separate vision document.
- **Position for end-to-end learning:** Cookwala says *what to make, when it is done and what
  must never happen*, not how to move.

### W2. Technical correctness (the technical critique)
- **Cooking operations:** physical envelopes per operation (temperature band, power, agitation,
  time), a sensor fallback ladder (sensor → model estimate → time), and published test vectors.
- **Numbers:** Celsius only on the wire, absolute tolerances, decimal money, densities and
  kitchen units.
- **Schemas:** strict everywhere (`unevaluatedProperties: false` with `x-` extensions),
  bundled for offline use, with version-negotiation rules. The Humanitarian Profile already
  shows the pattern.
- **Missions:** an event log plus derived state, a formal state machine, one sequencer,
  merge rules.
- **Trust:** identity bound to keys (did:web plus device keys), rotation, revocation,
  offline verification, witnessed checkpoints, and SCITT alignment.
- **Selective disclosure:** a salted-digest format so partial views still verify.
- **Events:** at-least-once delivery with idempotency keys and ordering per subject;
  heartbeats; latency classes.
- **Single source of truth:** generate OpenAPI, GraphQL and AsyncAPI from the schemas, with
  contract tests in CI.
- **Conformance:** a test suite plus a verifier for hashes, signatures and ledgers; the
  simulator must pass it.

### W3. Safety and agent rules
- **Safety limits enforced on the device:** food-safety temperatures, allergen blocks, hot oil
  and blades, which hold whatever any recipe or agent says.
- **Local stop:** the stop button works without the network. "Safety is local" is a
  normative rule.
- **Untrusted text:** every free-text field is data, never instructions, for agents.
- **Recalls:** robots stop using a bad recipe or extension within minutes.
- **Incident reporting:** an open, anonymous system modelled on aviation's confidential
  near-miss reporting.
- **Safety case:** mapped to ISO 13482, IEC 60335 and UL 3300, for certifier review.
- **Recipe safety review track:** automated checks against rule packs, plus human review for
  high-risk recipes.
- **Health claims policy:** general nutrition only; anything for a medical condition needs
  clinicians.

### W4. Privacy, data and competition
- **Defaults:** local-first and minimal data. Health, religion and household data never leave
  the home unless the person chooses.
- **A data-protection impact assessment** for the core and each profile.
- **The ledger stores hashes only;** content lives in erasable storage.
- **Execution data for training is opt-in,** can be withdrawn, and contributors share in the
  benefits if it is licensed.
- **Competition:** an information-exchange policy (aggregation, delay, no price data between
  competitors), reviewed by counsel.

### W5. Evidence and honest modelling
- **Simulators:**
  - a "robots with good vendor integrations" baseline replaces the strawman;
  - ranges instead of single numbers, plus sensitivity analysis and assumption sliders;
  - clean cooking, robot lifecycle carbon and rebound effects added;
  - every chart says "illustrative model".
- **Claims policy:** every public number is tagged *measured*, *modelled* or *assumed*,
  with its source.
- **Pre-registered pilot evaluation** with an independent evaluator (J-PAL, IPA or a
  university), including kill criteria. Negative results are published too.

### W6. Humanitarian pilot (Egypt first)
- **Partners:** the Egyptian Food Bank (or another member of the Global FoodBanking Network)
  as pilot partner; the WFP Innovation Accelerator as funding route.
- **Approvals and reviews:**
  - university ethics approval;
  - a data-responsibility review against ICRC and OCHA guidance;
  - review of the rule pack by a food-safety officer and a dietitian, plus Egypt's National
    Food Safety Authority rules.
- **Tools:** an SMS gateway and CSV workflow (level H0), then an API adapter to the partner's
  current tools (level H1).
- **Recognition:** apply to the Digital Public Goods Alliance.

### W7. Device demo, AI integration and dataset
- **First device: a smart oven or kitchen-robot startup.** A smart oven is simpler and
  sooner than a humanoid.
- **Reference executor and a cooking benchmark:** 10, then 50 recipes, with a success rate
  per recipe.
- **AI integration:** MCP servers for the index and hub, plus a Cookwala Agent Skill, tested
  with at least two model families.
- **Kitchen agent-safety benchmark:**
  - poisoned recipes, overspending, unsafe temperatures, allergen traps, escalation;
  - results published for several models.
- **Consented execution dataset:** published as an open benchmark at a robotics venue
  (RoboCup@Home, or an ICRA/IROS workshop).

### W8. Governance and intellectual property
- **Charter:** a technical steering committee and decision process, documented in
  GOVERNANCE.md.
- **Seats** for food banks, low-income countries, labour, privacy, dietitians and device makers.
- **Policies:** a patent non-assertion pledge, a trademark policy for "Cookwala" and a
  certification mark, a code of conduct, and a security disclosure policy (SECURITY.md).
- **A neutral home:** the Joint Development Foundation, the Linux Foundation, or a similar body.

### W9. External review program
See section 5.

### W10. Sustainability and business
- **Two entities:** an open standard (foundation) and a company (a public benefit corporation
  fits).
- **Revenue:** certification, hub software, consented dataset licences, grocer and marketplace
  fees. Free forever for relief.
- **Funding pipeline:** WFP Innovation Accelerator, foundations (Rockefeller, Bezos Earth
  Fund, Google.org), the Anthology Fund (only with pilot data), regional programs (ITIDA, Hub71).

### W11. Inclusion, culture and labour
- **World-cuisine vocabulary,** starting from fifirecipes' Egyptian recipes, with
  community-governed extensions.
- **Accessibility:** languages, low literacy and voice.
- **A dietary-compliance profile** (halal, kosher, vegetarian and others) written with certifiers.
- **Labour:** early dialogue with unions; prioritise uses for elderly and disabled people and
  community kitchens.

### W12. Narrative and communication
- **New lead message:** "an open, safe way for people, kitchens and machines to plan, rescue
  and cook food with less waste", with robots as one consumer.
- **Demo first:** contact influencers only after a working demo.
- **Use the stakeholder tracker** as the single record of outreach; review it weekly.

## 4. Phases and decision gates

| Phase | Dates | Main outputs | Gate to pass before moving on |
|---|---|---|---|
| **0. Clean up** | Oct–Nov 2026 | Claims policy applied; strict schemas; unit and money fixes; CRITIQUE.md, PRINCIPLES.md, SECURITY.md, GOVERNANCE.md drafts; Humanitarian Profile committed; simulator baseline and ranges | **Gate A:** validator passes with strict schemas; site and docs pass the claims policy |
| **1. Core and reviews** | Nov 2026–Jan 2027 | Core 1.0 draft; cooking-operation envelopes and test vectors; conformance suite and verifier; MCP servers; arXiv paper; W3C TAG and IETF SCITT reviews requested; DPG application; pilot partner signed | **Gate B:** two external reviews received; a pilot partner commits in writing; one device maker agrees to try Core 1.0 |
| **2. Pilot and demo** | Feb–Jul 2027 | Food-bank pilot (6 months, pre-registered); device demo with 10 recipes; agent-safety benchmark; security audit; foundation application | **Gate C:** pilot meets its hypotheses, or the plan changes per its kill criteria; device success ≥ 90 % on 10 recipes; a second independent implementer |
| **3. Prove and widen** | Aug 2027–Mar 2028 | Independent evaluation published; certification scheme pilot with a certifier; ISO/IEC liaisons through EOS; second pilot city; dataset v1; Core 1.1 | **Gate D:** neutral home in place; Digital Public Good recognition; first revenue or multi-year grant |

**Kill and pivot rules:**
- If Gate B fails twice, narrow Cookwala to the Humanitarian Profile and the recipe format only.
- If the pilot shows less than a 5 % gain, publish the results and redesign before scaling.

## 5. External review program (sequenced)

| When | Reviewer | What we ask them to review | Output |
|---|---|---|---|
| Phase 0–1 | Public arXiv preprint and open GitHub review | Whole design | Issues and comments |
| Phase 1 | W3C TAG design review | JSON-LD, identity, privacy, versioning | TAG review issue |
| Phase 1 | IETF SCITT working group | Ledger and transparency design | Mailing-list feedback |
| Phase 1 | Digital Public Goods Alliance | Humanitarian Profile and tools | DPG assessment |
| Phase 1 | OWASP community and AI-security researchers | Agent threat model, untrusted text | Threat-model review |
| Phase 1–2 | IAFP/IFST member and a registered dietitian | Rule pack, temperatures, allergens, nutrition | Signed review in `reviewedBy` |
| Phase 2 | University ethics committee; J-PAL/IPA-style evaluator | Pilot protocol, consent, metrics | Approval; pre-registration |
| Phase 2 | ICRC and OCHA guidance, through a data-responsibility reviewer | Humanitarian data handling | Review memo |
| Phase 2 | Independent security auditor | Verifier, hub, signing, keys | Audit report (published) |
| Phase 2 | RoboCup@Home or ICRA/IROS workshop; NIST robot test-methods researchers | Benchmark, operation semantics | Paper or workshop presentation |
| Phase 2–3 | UL Solutions or TÜV | Safety case, certification scheme | Gap analysis |
| Phase 3 | ISO/TC 299, IEC TC 59 and TC 61 through EOS (Egypt) or another national body | Robot safety, appliance measurement methods | Liaison or new work item |
| Phase 3 | Codex committees through Egypt's national contact point; GS1 Egypt | Food-safety rules, traceability identifiers | Comments; EPCIS mapping review |
| Phase 3 | Data-protection authority sandbox (e.g. UK ICO, CNIL) or privacy counsel | Data-protection impact assessment, ledger erasure | Opinion |

## 6. Who this answers

| Group | Their main asks | Where in this plan |
|---|---|---|
| Red-team critic | Market, incentives, evidence, liability, complexity | C1–C8, W1, W5, W10 |
| Technical critic | Semantics, units, strictness, state, trust, events, codegen, conformance | C9–C15, W2 |
| Musk-style adopter | Demo, one page, data flywheel, fits end-to-end learning, speed | C1, C8, C16, C17, W1, W7 |
| Claude | Honest evidence, enforced safety, agent rules, people without robots, privacy, cultures, governance, lifecycle | C3, C5, C18, C20, C6, C25, C26, C24 |
| Anthropic | Agent accountability as a safety case, MCP-native, model-neutral, benchmark, pilot, an investable company | C18, C19, C17, W6, W10 |
| WFP and food banks | No personal data, low-tech, interoperable, Digital Public Good, cost-effective, nutrition quality | C20–C22, W6 |
| WHO | Guidance as executable rules, food safety, clean cooking, no medical claims, equity | C22–C24, W3, W5 |
| Possible resisters (labour, privacy, religious, consumer groups) | Jobs, home data, dietary rules, safety | C28, C6, C29, C5, W8, W11 |
| Standards bodies and technical reviewers | Formal reviews, conformance, measurement methods, liaisons | C30, W2, W9, section 5 |
| Regulators and insurers | Safety case, privacy, competition, liability evidence | C5–C7, W3, W4 |

## 7. People and money needed

| Role | When | Note |
|---|---|---|
| Maintainer (you) | Now | Direction, partners, governance |
| Spec and tooling engineer | Phase 0–2 | Much of W2 can start with Claude in the repo |
| Food-safety officer and registered dietitian (part-time) | Phase 1–2 | Rule pack and pilot |
| Field coordinator in Egypt | Phase 2 | Pilot operations and training |
| Robotics or embedded engineer at the partner device maker | Phase 2 | Reference executor |
| Security auditor | Phase 2 | Contracted |
| Privacy, competition and IP counsel | Phase 1–3 | Data-protection assessment, information-exchange policy, patent pledge, trademark |
| Independent evaluator | Phase 2–3 | Pilot evaluation |

**Indicative budget for phases 0–2:** about US$90k for the pilot (see the concept note), plus
about US$60–120k for engineering, the security audit, legal and reviews. The plan should be
financed through grants and pilot funding before any equity investment.

## 8. Next 30 days

| # | Task | Owner | Status |
|---|---|---|---|
| 1 | Commit the Humanitarian Profile | Claude (repo), you approve | To do |
| 2 | Apply the claims policy to README, the site, PLAN, MISSION and the simulator pages | Claude, you review | To do |
| 3 | Make every core schema strict; fix units, tolerances and money | Claude | Done (Core 0.2) |
| 4 | Write CRITIQUE.md (both critiques, linked to this register), PRINCIPLES.md, SECURITY.md, GOVERNANCE.md draft | Claude, you review | To do |
| 5 | Simulators: competent-integration baseline, ranges, "illustrative" labels | Claude | To do |
| 6 | Draft Core 1.0 (one page) and mark other parts experimental | Claude, you decide | Draft done as Core 0.2 ([CORE.md](CORE.md)) |
| 7 | Send the concept note to the Egyptian Food Bank; check the WFP Innovation Accelerator's next call | You | To do |
| 8 | Post a Home Assistant integration proposal; contact two kitchen-device startups | You | To do |
| 9 | Ask a dietitian and a food-safety officer to review the rule pack | You | To do |
| 10 | Add the technical reviewers to the stakeholder tracker | Claude | To do |
