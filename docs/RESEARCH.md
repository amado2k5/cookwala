# How robots cook: research, industry and policy landscape (October 2026)

A landscape scan to ground the Cookwala design. It covers what universities, companies and
governments are doing about robots executing cooking tasks, and the interoperability
standards Cookwala must sit alongside. Sources are linked inline and listed at the end. Claims
come from those sources. Market figures from blogs and vendor pages are marked as such and
should be re-checked before quoting them publicly.

## 1. Key findings

1. **Nobody owns the recipe → execution layer.** Appliances have Matter, robots have ROS 2
   and the IEEE task ontologies, AI agents have MCP and A2A, commerce has UCP/ACP/AP2. No
   open standard describes *a recipe a machine can execute safely*. Each cooking-device
   vendor keeps a closed library (Posha 1,000+ recipes, Thermomix Cookidoo, Samsung + Jamie
   Oliver, Moley chef menus). That gap is what Cookwala fills.
2. **Research has converged on "recipe → structured plan → food-state checks".** The
   strongest academic systems turn text recipes into a formal plan (PDDL, LTL or knowledge
   graphs) and use vision-language models to check the **state of the food** before moving
   on. Cookwala's design (typed operations plus `until` conditions on food state) matches this
   directly.
3. **General-purpose robot "brains" (VLAs) are arriving, but long tasks still mostly fail.**
   Gemini Robotics 2 (July 2026), π0.5 and Xiaomi-Robotics-1 show broad manipulation. Yet on
   Stanford's BEHAVIOR-1K the best team reached only **12.4% full-task success** in early
   2026. Robots need goals, checkpoints, recovery paths and human handoffs, not motion
   scripts. Cookwala must make **human-in-the-loop and partial automation first-class**.
4. **Home robots are reaching consumers in assistant roles.** 1X NEO (preorders, 2026
   delivery) acts as a sous-chef (fetching from the fridge, stirring, timers) with cooking
   initially restricted. Posha ships a countertop robot. Optimus isn't available to homes.
   The near-term reality is **mixed teams: appliance + robot + human + AI agent**, which is
   exactly what the Cookwala coordination layer targets.
5. **Regulation is tightening around exactly the data Cookwala carries.** The EU Machinery
   Regulation (applies **20 January 2027**) explicitly covers ML-driven safety functions and
   works with the AI Act and the Cyber Resilience Act. ISO 13482 (service robots) was revised
   with cybersecurity and data-protection clauses. China released a **national standard for
   commercial intelligent cooking machines** (effective 1 November 2026) and a humanoid /
   embodied-intelligence standard system. Machine-readable safety data, audit logs and
   policy evaluation will be expected.
6. **Agentic commerce now has standards.** UCP (Google + Shopify, January 2026), ACP (OpenAI +
   Stripe) and AP2 (signed payment mandates). A food-vertical council (DoorDash, Uber Eats,
   Toast, Square, Google) formed in July 2026. Cookwala should **emit shopping lists and order
   intents that map onto UCP/ACP**, not invent payments.
7. **Agent interop is consolidating at the Linux Foundation.** MCP (agent ↔ tools) and A2A
   (agent ↔ agent, v1.0 January 2026, AgentCard at `/.well-known/agent-card.json`, 8-state
   task lifecycle) sit under the Agentic AI Foundation. Cookwala should **speak A2A and MCP**
   rather than define a new agent transport.

## 2. Universities and research labs

| Work | What it shows | Cookwala takeaway |
|---|---|---|
| *Real-World Cooking Robot System from Recipes Based on Food State Recognition Using Foundation Models and PDDL* ([arXiv 2410.02874](https://arxiv.org/abs/2410.02874)) | An LLM plans cooking behaviour as PDDL; a VLM learns food-state recognition from little data; a PR2 dual-arm robot cooked new recipes in a real kitchen | Steps need **pre/post food states**, not just times → `until` conditions + `cw.sense.*` cues |
| *Cook2LTL* ([arXiv 2310.00163](https://arxiv.org/pdf/2310.00163)) | LLMs translate recipes into unambiguous Linear Temporal Logic task specs | Ordering and timing constraints must be formal → process DAG + `timing` constraints |
| *Actionable Knowledge Graphs for Robotic Meal Preparation* (2025, [Frontiers in Robotics and AI](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2025.1682031/full)) | Maps recipe instructions into **six core categories of robotic manipulation tasks** | A small, closed operation vocabulary works → `cw.op.*` (~40 verbs grouped into families) |
| *Robot Cooking: Transferring Observations into a Planning Language* ([MDPI Eng 2023](https://www.mdpi.com/2673-4117/4/4/143)) | Tracked human motion → machine-readable PDDL recipe/process data | Cookwala should allow **learned skill references** per op (bindings), not mandate them |
| *Kitchen Robotic Manipulation utilizing Foundation Models* (2026, [Springer ISR 19:92](https://link.springer.com/article/10.1007/s11370-026-00749-8), [project](https://raivlab.github.io/FM_kitchen/)) | Open-vocabulary detection + 6D pose for dishware; deployed without environment-specific retraining | Equipment needs **abstract classes + physical constraints** a perception stack can match |
| Stanford **BEHAVIOR-1K** / BEHAVIOR Challenge ([site](https://behavior.stanford.edu/challenge/index.html), [GitHub](https://github.com/StanfordVL/BEHAVIOR-1K)) | 1,000 household activities incl. cooking; best full-task success ~12.4% in early 2026 ([eWeek](https://www.eweek.com/news/humanoid-robots-fail-88-percent-household-tasks/)) | Plan for **partial automation**: per-step assignment to robot *or* human, handoffs, retries |
| *VLA Safety: Threats, Challenges, Evaluations, Mechanisms* ([arXiv 2604.23775](https://arxiv.org/pdf/2604.23775)); *Towards Trustworthy Physical AI* ([arXiv 2607.22877](https://arxiv.org/pdf/2607.22877)) | Safety for learned robot policies needs layered guards and lifecycle evaluation | Recipe-level safety envelopes (max temps, hazards, never-leave steps) are guards a VLA runtime can enforce |
| *ARC: Autonomous Robotics Compliance, a three-layer governance architecture* ([arXiv 2609.12932](https://arxiv.org/pdf/2609.12932)) | Separates governance into layers for deployed autonomous systems | Confirms Cookwala's split: recipe data ↔ policy packs ↔ device enforcement |
| *Embodied AI: Emerging Risks and Opportunities for Policy Action* ([arXiv 2509.00117](https://arxiv.org/pdf/2509.00117)) | Policy gaps for embodied AI in homes | Audit logs + incident reporting belong in the standard |
| *Governance Gaps in Agent Interoperability Protocols (MCP, A2A, ACP)* ([arXiv 2606.31498](https://arxiv.org/pdf/2606.31498)) | Agent protocols can't express many governance constraints | Cookwala must carry its own **policy + consent + safety** semantics on top of A2A/MCP |
| **FoodOn** ontology ([foodon.org](https://foodon.org/design/robot-managed-vocabularies/)); *FoodSEM* entity linking ([arXiv 2509.22125](https://arxiv.org/html/2509.22125v1)) | Open food ontology; LLM-based linking of food mentions to ontologies | Link `cw.ing.*` to FoodOn/Wikidata; use entity linking to build the vocabulary |

## 3. Companies and products

| Player | Status (per sources) | How recipes are executed |
|---|---|---|
| **Posha** | ~$1,500 + $15/month; 1,000+ recipes; first units shipped late 2025; at IFA 2026 ([TechCrunch](https://techcrunch.com/2025/05/06/meet-posha-a-countertop-robot-that-cooks-your-meals-for-you), [Meridiem](https://www.themeridiem.com/consumer-tech/2025/12/22/robot-cooking-crosses-into-production-as-posha-ships-first-units), [TechTimes](https://www.techtimes.com/articles/326632/20260904/ifa-2026-kitchen-robot-posha-camera-watches-food-while-humanoids-wait.htm)) | Human preps and loads; camera watches the food; closed recipe library |
| **Thermomix TM7** (Vorwerk) | ~$2,649; AI features ([Feast](https://www.feast-magazine.co.uk/daily-highlights/thermomix-tm7-the-ai-powered-kitchen-robot-with-giant-screen-and-sleek-design-55090)) | Guided cooking; steps carry time/temp/speed; Cookidoo subscription |
| **Samsung Bespoke AI** | Fridge camera recognizes food → recipe suggestions; SmartThings Cooking preheats per recipe; Gemini built in; Jamie Oliver recipes ([Samsung](https://news.samsung.com/us/samsungs-unveils-bespoke-ai-kitchen-appliances-technology-connectivity-simplify-meal-planning-cooking/), [UK](https://news.samsung.com/uk/samsung-partners-with-jamie-oliver-to-create-new-recipe-range-on-bespoke-ai-appliances)) | Recipe → appliance settings inside one brand ecosystem |
| **Moley Robotics** | A-AiR two-armed robotic kitchen in beta; London showroom; Novelli menus from spring 2026 ([Moley](https://www.moley.com/news/), [A-AiR](https://www.moley.com/a-air-kitchen/)) | Recipes recorded from chef motion |
| **1X NEO** | Preorders Oct 2025; $20k or $499/month; 2026 delivery; sous-chef tasks; cooking initially restricted ([Robot Report](https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/)) | General humanoid + vision; assists a human cook |
| **Tesla Optimus** | Not available for homes as of Aug 2026 ([optimusk.blog](https://optimusk.blog/blog/what-can-tesla-optimus-do-at-home/)) | Demos only |
| **Google DeepMind Gemini Robotics 2** | Announced 30 July 2026: VLA + embodied-reasoning + on-device VLA ([Google](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/), [Wikipedia](https://en.wikipedia.org/wiki/Gemini_Robotics)) | Natural-language goals → reasoning → motor control |
| **Physical Intelligence π0.5**; **Xiaomi-Robotics-1** ([arXiv 2607.15330](https://arxiv.org/pdf/2607.15330)) | Open-world VLA generalization; VLA trained on 100K+ hours of real trajectories | Same: goals + success checks matter more than scripts |
| **Bosch/Siemens Home Connect** | Works with Matter ([Home Connect](https://www.home-connect.com/global/works-with/matter)) | Appliance control; recipes via partners |
| Chinese stir-fry / catering robots | "2025, first year of cooking robots"; large funding rounds; silver-economy use ([36Kr](https://eu.36kr.com/en/p/3742006515642885), [36Kr](https://eu.36kr.com/en/p/3804162814500353)) | Dispenser-based, mostly commercial (~95% of revenue per 36Kr) |

Market sizing in blogs (e.g. "$12.37B by 2035" via [exgateai](https://exgateai.blogspot.com/2026/06/cooking-robots-in-2026-is-1500-robot_01456207452.html) / [Research Nester](https://www.researchnester.com/reports/cooking-robot-market/2617)) is low-confidence. Don't quote it.

## 4. Governments and standards bodies

| Body | What | Relevance |
|---|---|---|
| **EU**: Machinery Regulation (EU) 2023/1230 | Applies 20 Jan 2027; covers ML/self-evolving safety functions; used with the AI Act and the Cyber Resilience Act ([EE World](https://www.eeworldonline.com/how-does-the-machinery-regulation-eu-2023-1230-affect-designs/), [sopx](https://sopx.io/insights/eu-machinery-regulation-2023-1230/), [d-fairy](https://www.d-fairy.fr/atlas/en/eu-ai-act-standards/)) | Robot makers selling in the EU need risk assessment + logs; Cookwala safety data and execution logs help them |
| **EU** rolling plan for ICT standardisation, robotics ([Interoperable Europe](https://interoperable-europe.ec.europa.eu/collection/rolling-plan-ict-standardisation/robotics-and-autonomous-systems-rp-2023)) | Coordinates robotics standards work | Possible venue to present Cookwala later |
| **ISO 13482** revision (service robots) | Finalised early 2026; restructured by robot type; adds cybersecurity + data protection ([iTeh prEN ISO 13482](https://standards.iteh.ai/catalog/standards/cen/dffe4c3c-bed0-4d01-86a8-8582e7c5624a/pren-iso-13482)) | Devices declare it in the Cookwala capability manifest |
| **IEEE 1872** family: 1872-2015 (CORA), **1872.1-2024 Robot Task Representation**, 1872.2-2021 (Autonomous Robotics) ([IEEE SA 1872.1](https://standards.ieee.org/ieee/1872.1/6993/), [IEEE RAS](https://www.ieee-ras.org/industry-government/standards/existing-projects/)) | Ontologies for robot tasks and hierarchical planning | Cookwala's JSON-LD context maps `cw.op` / process nodes to 1872.1 task concepts |
| **CSA, Matter** | 1.2 added Smoke/CO alarms; 1.3 added ovens, cooktops, microwaves, extractor hoods; refrigerators supported; inventory *not* covered ([CSA 1.2](https://csa-iot.org/newsroom/matter-1-2-arrives-with-nine-new-device-types-improvements-across-the-board/), [TechHive 1.3](https://www.techhive.com/article/2324571/matter-version-1-3-announced.html), [MatterAlpha](https://www.matteralpha.com/industry-news/matter-1-3-levels-up-your-smart-home)) | Cookwala binds to Matter for appliances and alarms; Cookwala defines the inventory data Matter lacks |
| **VDA 5050 / Open-RMF** | Vendor-neutral fleet control for mobile robots; shared-resource (doors, lifts) scheduling ([arXiv 2311.14615](https://arxiv.org/abs/2311.14615), [Ekumen](https://ekumenlabs.com/blog/posts/deep-dive-into-openrmf/)) | Model for Cookwala's **resource leases** (burner, oven cavity, counter zone) and multi-vendor coordination |
| **China**: MIIT | 2023 humanoid guidance; 2025 action plan; Humanoid Robot & Embodied Intelligence Standardization Technical Committee (Dec 2025); national standard system (Mar 2026) ([Diplomat](https://thediplomat.com/2026/03/chinas-new-five-year-plan-prioritizes-robotics-the-world-should-pay-attention/), [ETC Journal](https://etcjournal.com/2026/05/21/the-widening-gap-chinas-humanoid-robotics-dominance-may-2026/), [Robot Report](https://www.therobotreport.com/china-plans-to-mass-produce-humanoids-by-2025/)) | Largest robot market; Cookwala should be usable by Chinese makers (zh vocab labels, no US-only assumptions) |
| **China**: cooking-robot standards | National standard for *commercial intelligent cooking machines* (released Oct 2025, effective 1 Nov 2026: safety, hygiene, functions, reliability, compatibility); group standard T/ZSA 288-2024 for intelligent catering robot systems ([Beijing SAMR](https://scjgj.beijing.gov.cn/zwxx/scjgdt/202503/t20250317_4036310.html), [T/ZSA 288-2024 PDF](https://www.ttbz.org.cn/Home/PdfFileStreamGet/c3QsMTI5MjE2), [Substack](https://chinesestoryforbeginner.substack.com/p/from-chefs-to-smart-kitchens-learn)) | First government cooking-robot standard. Hardware-focused, not recipe interchange; Cookwala policy pack `cn.cooking-machine` can reference it |
| **US**: USCC humanoid report; CSIS | Strategic-competition framing; US strong in AI, weak in volume manufacturing ([USCC](https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf), [CSIS](https://www.csis.org/blogs/strategic-technologies-blog/why-united-states-needs-robots-rebuild)) | No federal cooking-robot rule; FDA Food Code (food safety) is the operative reference for policy packs |
| **Linux Foundation, Agentic AI Foundation** | Hosts MCP and A2A (A2A v1.0 Jan 2026) ([FlowHunt](https://www.flowhunt.io/blog/agentic-ai-foundation-a2a-mcp-standards/), [Atlan](https://atlan.com/know/agent-interoperability-protocols/), [DEV](https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li)) | Cookwala exposes an MCP server and an A2A AgentCard |
| **Agentic commerce**: UCP / ACP / AP2 | UCP (Google + Shopify, Jan 2026) covers discovery → checkout → orders; ACP (OpenAI + Stripe) checkout; AP2 signed mandates; Food Technical Council July 2026 ([digitalapplied](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide), [gladly](https://www.gladly.ai/blog/making-sense-of-agentic-commerce/), [wetheflywheel](https://wetheflywheel.com/en/agentic-commerce/acp-vs-ap2/), [eco](https://eco.com/support/en/articles/14839400-what-is-agentic-commerce-the-2026-guide)) | Cookwala `OrderIntent` maps to UCP/ACP carts; payment authorization stays in AP2 / the merchant |

## 5. What this means for the Cookwala design

| Finding | Design response (where in the spec) |
|---|---|
| Plans must check food state | `until` conditions over `cw.sense.*` (recipe schema `$defs/Condition`) |
| Small closed op vocabulary works | ~40 `cw.op.*` in 8 families, each with a param schema (`vocab/ops`) |
| Long tasks fail → partial automation | Per-node `assignment` (robot / appliance / human / any), handoffs, `ask_human` (INTEROP §4) |
| Multi-vendor teams | Local **Kitchen Hub** + resource leases modelled on Open-RMF; A2A task states (INTEROP §3) |
| Appliances already on Matter | Matter bindings for oven, cooktop, microwave, hood, fridge, smoke/CO (INTEROP §6) |
| Inventory missing from Matter | `inventory.schema.json` + events (INTEROP §7) |
| Commerce standards exist | `OrderIntent` → UCP/ACP adapters; never handle payment credentials (INTEROP §8) |
| Regulation wants logs + safety data | Signed docs, CCP logs, execution reports, policy packs (PLAN §3.4–3.5, report schema) |
| Agents speak MCP/A2A | MCP server + AgentCard + A2A task mapping (API.md §5) |
| Ontologies exist (IEEE 1872.1, FoodOn, schema.org) | JSON-LD `@context` mapping Cookwala terms to them (schemas/context.jsonld) |

## Sources

- https://arxiv.org/abs/2410.02874
- https://arxiv.org/pdf/2310.00163
- https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2025.1682031/full
- https://www.mdpi.com/2673-4117/4/4/143
- https://link.springer.com/article/10.1007/s11370-026-00749-8 · https://arxiv.org/abs/2608.04042 · https://raivlab.github.io/FM_kitchen/
- https://behavior.stanford.edu/challenge/index.html · https://github.com/StanfordVL/BEHAVIOR-1K · https://www.eweek.com/news/humanoid-robots-fail-88-percent-household-tasks/
- https://arxiv.org/pdf/2604.23775 · https://arxiv.org/pdf/2607.22877 · https://arxiv.org/pdf/2609.12932 · https://arxiv.org/pdf/2509.00117 · https://arxiv.org/pdf/2606.31498
- https://foodon.org/design/robot-managed-vocabularies/ · https://arxiv.org/html/2509.22125v1
- https://techcrunch.com/2025/05/06/meet-posha-a-countertop-robot-that-cooks-your-meals-for-you · https://www.themeridiem.com/consumer-tech/2025/12/22/robot-cooking-crosses-into-production-as-posha-ships-first-units · https://www.techtimes.com/articles/326632/20260904/ifa-2026-kitchen-robot-posha-camera-watches-food-while-humanoids-wait.htm
- https://www.feast-magazine.co.uk/daily-highlights/thermomix-tm7-the-ai-powered-kitchen-robot-with-giant-screen-and-sleek-design-55090
- https://news.samsung.com/us/samsungs-unveils-bespoke-ai-kitchen-appliances-technology-connectivity-simplify-meal-planning-cooking/ · https://news.samsung.com/uk/samsung-partners-with-jamie-oliver-to-create-new-recipe-range-on-bespoke-ai-appliances
- https://www.moley.com/news/ · https://www.moley.com/a-air-kitchen/
- https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/ · https://optimusk.blog/blog/what-can-tesla-optimus-do-at-home/
- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/ · https://en.wikipedia.org/wiki/Gemini_Robotics · https://arxiv.org/pdf/2607.15330
- https://www.home-connect.com/global/works-with/matter
- https://eu.36kr.com/en/p/3742006515642885 · https://eu.36kr.com/en/p/3804162814500353
- https://www.eeworldonline.com/how-does-the-machinery-regulation-eu-2023-1230-affect-designs/ · https://sopx.io/insights/eu-machinery-regulation-2023-1230/ · https://www.d-fairy.fr/atlas/en/eu-ai-act-standards/ · https://interoperable-europe.ec.europa.eu/collection/rolling-plan-ict-standardisation/robotics-and-autonomous-systems-rp-2023
- https://standards.iteh.ai/catalog/standards/cen/dffe4c3c-bed0-4d01-86a8-8582e7c5624a/pren-iso-13482
- https://standards.ieee.org/ieee/1872.1/6993/ · https://www.ieee-ras.org/industry-government/standards/existing-projects/
- https://csa-iot.org/newsroom/matter-1-2-arrives-with-nine-new-device-types-improvements-across-the-board/ · https://www.techhive.com/article/2324571/matter-version-1-3-announced.html · https://www.matteralpha.com/industry-news/matter-1-3-levels-up-your-smart-home
- https://arxiv.org/abs/2311.14615 · https://ekumenlabs.com/blog/posts/deep-dive-into-openrmf/
- https://thediplomat.com/2026/03/chinas-new-five-year-plan-prioritizes-robotics-the-world-should-pay-attention/ · https://etcjournal.com/2026/05/21/the-widening-gap-chinas-humanoid-robotics-dominance-may-2026/ · https://www.therobotreport.com/china-plans-to-mass-produce-humanoids-by-2025/
- https://scjgj.beijing.gov.cn/zwxx/scjgdt/202503/t20250317_4036310.html · https://www.ttbz.org.cn/Home/PdfFileStreamGet/c3QsMTI5MjE2 · https://chinesestoryforbeginner.substack.com/p/from-chefs-to-smart-kitchens-learn
- https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf · https://www.csis.org/blogs/strategic-technologies-blog/why-united-states-needs-robots-rebuild
- https://www.flowhunt.io/blog/agentic-ai-foundation-a2a-mcp-standards/ · https://atlan.com/know/agent-interoperability-protocols/ · https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li
- https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide · https://www.gladly.ai/blog/making-sense-of-agentic-commerce/ · https://wetheflywheel.com/en/agentic-commerce/acp-vs-ap2/ · https://eco.com/support/en/articles/14839400-what-is-agentic-commerce-the-2026-guide
