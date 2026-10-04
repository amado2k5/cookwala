# Prior Art, Parallels and Novelty

Has anyone tried this before? What did other fields do with the same problems? How new
is the Cookwala Protocol ([PROTOCOL.md](PROTOCOL.md))?

Compiled 2026-10-03 from a web search plus well-known standards. It's not exhaustive, and
not a legal or patent opinion (see [PATENT-LANDSCAPE.md](PATENT-LANDSCAPE.md)).

## 1. Short answer

**Almost every individual building block has a precedent, often a mature one, in another
field.** I found **no prior effort that combines them into one standard for food**:

- a context-rich, privacy-scoped mission that travels across heterogeneous providers
  (AI, grocers, delivery, device makers, orchestrators);
- signed by each one;
- executed as a living plan by robots, appliances and humans under a safety kernel;
- aggregated into planet-scale demand signals that serve supply chains, cities, food
  relief and public health.

The closest attempt, RoboEarth, shared robot knowledge but didn't address households,
commerce, privacy, multi-party trust or food systems. So the **combination and the domain
are new**; the **parts are proven**. That's good news: Cookwala should **borrow
deliberately** from the parallels below rather than invent new mechanisms.

## 2. Direct predecessors (robots, cooking, recipes)

| Effort | What it did | What happened / lesson |
|---|---|---|
| **RoboEarth** (EU project, 2010–2014) → **Rapyuta**, **KnowRob**, **openEASE** | A "World Wide Web for robots": a cloud platform where robots share knowledge (action recipes, maps, object models) so they don't relearn the same things ([final report](https://roboearth.ethz.ch/wp-content/uploads/2011/03/document.pdf), [openEASE](https://www.researchgate.net/publication/274043439_OPEN-EASE_-_A_Knowledge_Processing_Service_for_Robots_and_RoboticsAI_Researchers), [cloud robotics](https://en.wikipedia.org/wiki/Cloud_robotics)) | Closest in spirit: robots learning from each other. It stayed largely academic, built on heavy ontologies with no commerce, privacy or industry incentives. **Lesson:** pragmatic JSON + extensions + real users beats perfect ontologies; tie it to products people use |
| **MILK / CURD** (CMU) | Minimal Instruction Language for the Kitchen: recipes as first-order logic with ingredient creation/deletion and temporal order ([SOUR CREAM paper](http://www.cs.cmu.edu/~nasmith/papers/tasse+smith.tr08.pdf)) | Proved recipes can be formal programs. Research-only. **Lesson:** keep the process graph, add food states and safety |
| **Cook2LTL**; **LLM + PDDL cooking robots** | Recipes → temporal logic or PDDL plans; vision checks food states ([Cook2LTL](https://arxiv.org/pdf/2310.00163), [PR2 cooking](https://arxiv.org/pdf/2410.02874)) | **Lesson:** the end conditions on food state are the key (already in Cookwala `until`) |
| **Moley robotic kitchen patents** | Recipes as libraries of recorded chef motions ([WO2015125017A2](https://patents.google.com/patent/WO2015125017A2/en)) | Device-specific motion replay. **Lesson:** stay device-agnostic (food-state goals, not motions); mind the patents |
| **Closed cooking ecosystems** (Thermomix/Cookidoo, Posha, Samsung SmartThings Cooking) | Recipe → appliance settings inside one brand | Works, but walled gardens. **Lesson:** the gap is the open, cross-vendor layer |
| **Home-robot governance commentary** (2026) | Home robots lack a rulebook for safety, privacy and liability; proposals include risk tiers by capability, data governance, tiered liability and incident reporting ([AI Frontiers, Mar 2026](https://ai-frontiers.org/articles/the-robot-in-your-living-room-has-no-rulebook)) | Matches Cookwala's autonomy levels, privacy views, ledger and incident reporting. Regulators are asking for exactly these mechanisms |

## 3. Parallels in other domains (and what to borrow)

| Your idea | Closest parallel | How they solved it | Borrow for Cookwala |
|---|---|---|---|
| **One rich request carrying the full context to decision services, which reply with advice** | **HL7 FHIR + CDS Hooks** (healthcare): the EHR sends patient context (conditions, meds, observations) to decision-support services on a "hook" and gets back **cards** with suggestions and actions ([CDS Hooks](https://smarthealthit.org/cds-hooks/), [guide](https://medblocks.com/blog/hl7-cds-hooks-a-practical-guide)) | Standard resources + **prefetch** of only the needed data + SMART on FHIR OAuth scopes + suggestion cards | Mission "hooks" (before_plan, on_incident…), **prefetch views** (minimum disclosure), advice as cards/options. FHIR's adoption playbook: resources + extensions + profiles/implementation guides + connectathons + maturity levels |
| **One shared record that every party reads and appends to instead of sending messages** | **IATA ONE Record** (air cargo): one shared shipment record with URIs, a Holder who controls it, and parties who read it or submit change requests; IATA's preferred method since Jan 2026 ([fact sheet](https://www.iata.org/en/iata-repository/pressroom/fact-sheets/fact-sheet-one-record/), [Cathay](https://www.cathaycargo.com/en-us/stories/our-business/iata-one-record-data-exchange.html)) | Linked-data objects, access model (holder/user/change request), standard API, years of pilots | The Mission as a **shared object with URIs**, a holder (the robot/household), change requests from providers. Adoption takes years even with an industry body, so start with willing partners |
| **Every actor signs what happened: who/what/when/where/why** | **GS1 EPCIS 2.0** event traceability; FDA **FSMA 204** critical tracking events with 24-hour reporting ([EPCIS for FSMA 204](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:0c934e38-7cd7-4a86-aac3-c54b4c9ef293/EPCIS-Recommendations-FSMA-204-Critical-Tracking-Events.pdf)) | Standard event types (object, aggregation, transaction, transformation) with business step and disposition | Ledger entries modelled on EPCIS events, so the Mission ledger can **feed food traceability and recalls** directly |
| **Ledger with multi-party signatures, aid to people who can't pay** | **WFP Building Blocks** (blockchain cash-for-food: about 1 million refugees, up to 98% lower transaction costs, multi-agency coordination) ([MIT TR](https://www.technologyreview.com/2018/04/12/143410/inside-the-jordan-refugee-camp-that-runs-on-blockchain/), [ITU](https://www.itu.int/hub/2020/04/how-the-world-food-programme-uses-blockchain-to-better-serve-refugees/)) | Permissioned chain coordinating agencies; criticized for biometric privacy risks ([JDC review](https://www.jointdatacenter.org/literature_review/where-life-hangs-by-a-chain-a-jordanian-refugee-camp-is-a-test-for-blockchain-based-identity-systems/)) | Use a ledger for **coordination and audit, never for personal or biometric data**. Hashes on the ledger, data off it |
| **Optimize food baskets for nutrition and cost at scale** | **WFP Optimus**: optimizes the food basket, sourcing and delivery together; saved more than US$30M ([WFP Innovation](https://innovation.wfp.org/project/optimus), [INFORMS](https://pubsonline.informs.org/doi/pdf/10.1287/ijoo.2019.0047)) | Mathematical programming over nutrition, cost and logistics | Cookwala's `feed` / `relief_allocate` should **interoperate with Optimus-style tools** (export menus and needs), not compete. Kitchen-level Missions are the missing last mile |
| **Machine-readable health guidance that countries adapt** | **WHO SMART Guidelines**: L1 narrative → L2 digital adaptation kits → L3 machine-readable (FHIR) → executable, with country adaptation ([Lancet Digital Health](https://www.thelancet.com/journals/landig/article/PIIS2589-7500(21)00038-8/fulltext), [JMIR](https://medinform.jmir.org/2025/1/e58858)) | Layered knowledge with testable logic and local adaptation | **The same layering for recipes and nutrition policies** (see [RECIPE-FORMAT.md](RECIPE-FORMAT.md)); WHO-style packs plug into Cookwala policy and knowledge packs |
| **Shared forecasts → near-exact supply, less waste** | **CPFR** (VICS 1998): retailers and suppliers share forecasts and plans; reduces inventory, stock-outs and the bullwhip effect ([overview](https://en.wikipedia.org/wiki/Collaborative_planning,_forecasting,_and_replenishment)) | Shared plans + exceptions + replenishment; adoption limited by trust and integration cost | **Demand signals** = CPFR from millions of kitchens, with privacy aggregation. Lesson: make integration cheap and standard, and give each party clear value |
| **Describe the environment the robot may operate in** | **Operational Design Domain (ODD)**, **ISO 34503** taxonomy for automated driving: scenery, environment, dynamic elements ([ISO 34503](https://www.iso.org/standard/78952.html), [DLR formalization](https://arxiv.org/html/2408.14481)) | Hierarchical taxonomy + formal format (ASAM OpenODD) + autonomy levels | A **Kitchen ODD**: Cookwala `space`/`devices`/`household` facets as an ODD taxonomy; autonomy levels tied to it (PROTOCOL §13) |
| **Detailed self-description of every device** | **Asset Administration Shell** (IEC 63278, Industry 4.0 digital twin with submodels: nameplate, technical data, maintenance…) ([IDTA spec](https://industrialdigitaltwin.org/wp-content/uploads/2023/06/IDTA-01001-3-0_SpecificationAssetAdministrationShell_Part1_Metamodel.pdf)) | Standard submodel templates per aspect, registries | Cookwala `self` and `devices` facets **as submodels**; possibly map them to AAS for industrial and restaurant kitchens |
| **Share data but keep control of how it's used** | **Data spaces** (IDSA, Gaia-X, Eclipse Dataspace Components) with **W3C ODRL** usage policies enforced by connectors ([IDSA usage control](https://internationaldataspaces.org/wp-content/uploads/dlm_uploads/IDSA-Position-Paper-Usage-Control-in-the-IDS-V3..pdf), [EDC/ODRL](https://arxiv.org/pdf/2507.20014)) | Policies travel with data; connectors enforce them | Express Mission view permissions as **ODRL-compatible usage policies** (purpose, retention, no onward sharing) |
| **Orders that survive contact with reality** | Military **mission command / five-paragraph order** (situation, mission, execution, sustainment, command and signal); commander's intent | Intent + constraints + freedom of action at the edge | Mission sections and the commander's-intent field (PROTOCOL §7.1) |
| **Robots dividing work without a boss** | **Market-based multi-robot coordination** (auctions) and **response-threshold** division of labor ([Dias et al. survey](https://www.ri.cmu.edu/pub_files/pub4/kalra_nidhi_2005_2/kalra_nidhi_2005_2.pdf), [threshold model](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5492433/)) | Bids or thresholds; trade-offs studied | Contract-net + thresholds (already in REASONING §5.4) |
| **Nature: decentralized harmony** | **Honeybee quorum sensing** (Seeley & Visscher 2004) ([American Scientist](https://www.americanscientist.org/article/group-decision-making-in-honey-bee-swarms)); **slime mold** reproducing the Tokyo rail network (Tero et al., Science 2010) ([ScienceDaily](https://www.sciencedaily.com/releases/2010/01/100121141051.htm)) | Local rules, quorum thresholds, reinforcement and pruning | Quorum decisions, stigmergic Mission marks, adaptive route networks (PROTOCOL §8) |
| **Agents calling tools and agents** | **MCP**, **A2A** (Linux Foundation AAIF); **UCP/ACP/AP2** for commerce | Capability discovery, task lifecycle, payment mandates | Already adopted as transports; Cookwala adds the food domain, context and safety semantics they lack |
| **Identity and proofs** | **W3C DIDs / Verifiable Credentials**, SD-JWT selective disclosure | Portable, verifiable claims | Robot, owner, subscription, warranty and insurance proofs (PROTOCOL §5) |
| **Smart home interop** | **Matter** (CSA) | Device types and clusters; local control | Appliance bindings; Cookwala sits above Matter |

## 4. What seems genuinely new

1. **A household-scale "situational mission" for physical service robots:** one envelope
   holding robot self-state, mandate, the ODD-like environment, household social context,
   health constraints, commerce preferences and incident memory, scoped per provider.
   Pieces exist (FHIR context, ODD, AAS), but not combined for a home robot serving
   people.
2. **Food-state-based, device-agnostic executable recipes bound to such missions,** with
   contingencies, pause/resume windows and salvage paths (RECIPE-FORMAT).
3. **A safety kernel between swappable AI and the kitchen,** standardized with conformance
   tests (CookBench). Aviation has envelope protection; consumer robots don't have a
   shared standard for it.
4. **Bottom-up demand signals from cooking plans** (not from sales) feeding CPFR-like
   planning for farms, retail, logistics and cities, with privacy guarantees.
5. **One protocol spanning home, restaurant, factory, relief kitchen and public health,**
   so the same robot, recipe and plan can serve a family or a famine response.

**Honest caveats:**
- **Big tech platforms and robot makers may be building proprietary equivalents** that
  aren't public. Samsung, Moley and Chinese cooking-robot vendors already link recipes to
  devices inside their ecosystems.
- **Patents cover parts of execution** (see PATENT-LANDSCAPE).
- **"Never done before" claims need a broader search** before public use: patent
  databases in CN/JP/KR/EP, standards bodies (ISO TC 299, IEEE RAS, CSA), and recent
  arXiv work on household robot context.

## 5. Lessons to apply now

1. **Follow FHIR's path:** pragmatic JSON resources + extensions + implementation guides
   + maturity levels + connectathons (plugfests with robot and app makers).
2. **Follow ONE Record's object model:** a Mission is a URI-addressable shared object with
   a holder and change requests.
3. **Model the ledger on EPCIS events,** making food traceability and recalls a
   by-product.
4. **Copy WHO SMART layering** for recipes and policies (narrative → operational →
   machine-readable → executable).
5. **Treat privacy as the adoption gate:** Building Blocks shows that strong privacy
   critique follows any ledger touching vulnerable people.
6. **Interoperate with incumbents** (Optimus, HXL/HDX, GS1, Matter, A2A/MCP) instead of
   replacing them.
7. **Watch adoption economics:** CPFR and RoboEarth stalled on integration cost and
   incentives. Every participant must get value on day one (free tools, real recipes,
   guided mode in apps).
