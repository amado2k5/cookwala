# Cookwala strategy: message, product, website, docs, developer experience

**Status:** revised 2026-10-04 (v2). Covers the mission, vision, story, standard, website,
documentation, API and SDK, demos, community and metrics. It builds on the action plan
(`ACTION-PLAN.md`), the backstory and gap list (`research/BACKSTORY.md`), the architecture review
(`research/ARCHITECTURE-REVIEW.md`), the 23-site benchmark (`research/WEB-BENCHMARK.md`), the
stakeholder design (`STAKEHOLDERS.md`) and the messaging rules (`MESSAGING.md`). Section 1's table
is the first-pass study; the benchmark supersedes it where they differ.

---

## 0. Summary

**Cookwala's job.** It is the open way to tell any kitchen (a person, a food bank, an oven or
a humanoid robot) **what to make, when each step is done, and what must never happen**, and
to check all three on the device.

**What changes:**

1. **Message.** Retire "the world's first and largest robot cooking recipes index and CLI"
   and lead with the problem every robot maker and kitchen has. New one-liner:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** Robots are about to cook in homes, but nobody has written down, in a form a
   machine can check, what "done" and "safe" mean, or in which cuisines. Cookwala started
   from one family's Egyptian recipes. Its mission is to teach machines every cuisine
   safely, and to make sure good food reaches people.
3. **Proof before promise.** Live, real counters. Now / next / later labels. Published critiques.
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** device makers, AI-agent builders, kitchens and food banks, cooks,
   researchers.
6. **Code and a live demo on the first screen.** In-browser dry run ("Can this device cook
   this recipe?"), the simulators, and copy-paste commands that work today.
7. **Developer experience at the level of the best AI and robotics docs:** a 5-minute
   quickstart, docs organized as tutorials, how-to guides, reference and explanation,
   `llms.txt`, copy-page, a Python package and CLI, a typed JS/TS SDK, an MCP server, a
   reference hub you can run locally, a ROS 2 package, and a LeRobot bridge.
8. **A contributor network** (inspired by Figure's Index): cooks and kitchens contribute
   consented recordings of real recipes, so robots learn every cuisine, with credit to the
   people who taught them.

---

## 1. What we learned

| Site | Problem it solves | Approach | How it communicates | Audience | What we take |
|---|---|---|---|---|---|
| **Figure – Index** | Humanoids need huge amounts of real-world task data | Paid contributor network that records everyday tasks; services now, robots later | Cinematic, monochrome, huge light type; live counters (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Contributors, households, businesses | Contributor network with credit; **live proof counters**; a "today / soon" honesty line; one striking image |
| **Figure (home)** | Home help | A general-purpose humanoid | *"The future of home help is here."* One sentence, one video | Households, investors | The one-sentence promise; product before features |
| **MCP Registry** | Finding trustworthy MCP servers | Community registry; verified reverse-DNS namespaces; exact versions; integrity hashes; validation endpoint; lifecycle status | Clean OpenAPI reference; schema-first | Server publishers, client makers | **Verified namespaces, pinned versions, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | Building agents is fragmented | Open, model-agnostic frameworks plus a platform | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; trust center and status | Agent engineers, enterprises | **A lifecycle the reader recognizes**; trust center; academy and forum |
| **LangSmith Observability** | Seeing what agents did in production | Traces → monitoring → feedback → datasets for evals | Steps with links; concepts page; integrations | Agent teams | **Execution logs as traces**; traces become datasets → `execlog_export.py otel` |
| **OpenAI API docs** | First API call | Quickstart with code first; build paths; model cards | Dark, code-forward, "Ask AI", status and cookbook | Developers | **Code on the first screen; "build paths"** |
| **Claude Platform docs** | From first call to production | Two surfaces (Messages, Managed Agents); numbered developer journey; model family cards | ⌘K search; language tabs (Python … cURL, CLI); journey 1–4 | Developers, platform teams | **Numbered developer journey; language tabs; "choose how you build"** |
| **AsyncAPI** | Describing event-driven APIs | Open spec plus tools (generators, docs); open governance under the Linux Foundation | "Part of the Linux Foundation"; spec → docs → code demo; community meetings; sponsor tiers | Architects, tool builders | **Open governance badge, TSC, community calendar, sponsors** |
| **SiliconFlow** | Fast, cheap model inference | One-stop API for many models | Feature lists of performance, scalability, cost and security | Developers, enterprises | A crisp list of **characteristics** (ours: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Trial-and-error prompt engineering | Declarative test cases, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; why-choose list; workflow steps | LLM app developers, security | **Declarative safety tests** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; not Figure's Helix AI) | DeFi is too complex | Natural-language agent with confirmation before every transaction | Whitepaper: abstract → problem → solution → architecture → security model | Crypto users | **Whitepaper structure; explicit security model; "always confirm"** (we take the structure, not the token model) |
| **Hugging Face LeRobot** | Robotics is hard to start | Hardware-agnostic library; teleoperate → record → train → deploy; standard dataset format; community datasets | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; common problems | Makers, researchers | **"Pick your path"; dataset compatibility; common-problems section** |
| **ROS 2 / Open Robotics** | Robot software interoperability | Open middleware (ROS, Gazebo, Open-RMF) run by a non-profit | *"Powering the world's robots"* | Robot developers | **ROS 2 actions; non-profit stewardship** |
| **NVIDIA Isaac** | Developing and training robots | Simulation, libraries, foundation models (GR00T) | Platform map: libraries, simulation, models, blueprints | Robotics teams | **Simulation as the test bench** for envelopes |
| **1X, Unitree, Pollen** | Home humanoids, affordable robots, open robots for makers | Products with deposits, pre-orders and community | One product, one price, one button | Households, makers | Home robots are shipping now; our window is now |

**Patterns shared by the best:**
1. One sentence of who it's for and what it does.
2. A loop the reader recognizes.
3. Working code or a demo within one scroll.
4. Pick-your-path entry points.
5. Proof (numbers, users, governance).
6. Honest status (trust center, status page, now/next).
7. Community you can join today.
8. Docs built for both people and AI readers (copy page, `llms.txt`, "Ask AI").

---

## 2. Cookwala today

**Strengths:**
- A rare, concrete idea: physical operation envelopes, sensor ladders, refusal instead of
  guessing, safety enforced on the device, verifiable documents.
- Conformance vectors that include two independent standards results (RFC 8785, RFC 8032).
- Four playable simulators.
- A humanitarian profile that works without robots.
- A real recipe corpus (fifi.cooking) and a region with an identity (Egypt, the Arab world).
- An unusually honest critique-and-response record.

**Gaps:**

| Gap | Effect |
|---|---|
| Headline claims "first and largest" with 1 published recipe | Reads as hype; invites dismissal |
| "End world hunger" as the lead | Puts off funders and experts who know the drivers of hunger |
| Robots-only framing | Excludes the users who can adopt today (kitchens, food banks, agent builders) |
| No quickstart, no SDK, no runnable server | Nobody can succeed in 5 minutes |
| Docs are 25 markdown files with no navigation | Hard to find, hard to trust |
| No live proof or status | No sense of momentum or readiness |
| No way to join | Interest can't turn into contribution |

---

## 3. Positioning and message

### 3.1 Category and one-liner
- **Category:** an open standard (with free tools and an index) for executable, verifiable
  cooking.
- **One-liner:** *Cookwala is the open standard for cooking safely: people, kitchens and robots.*
- **Triad**, used everywhere:
  - **What to make.** Recipes as steps a machine can plan.
  - **When it's done.** Measurable end conditions: temperatures, food-state cues, times.
  - **What must never happen.** Safety limits the device enforces itself.

### 3.2 Mission and vision (revised)
- **Mission:** *Help everyone eat well, safely, affordably and without waste, whoever does
  the cooking.*
- **Vision:** *Any kitchen on Earth can cook any recipe safely, and good food reaches people
  instead of the bin.*
- **Why the change:** "end world hunger" stays as the long-term reason, told with evidence.
  Cookwala contributes to it through less waste, food rescue and cheaper cooking, alongside
  the programs, funding and policy that hunger needs.

### 3.3 The story

> Home robots are arriving: Figure 03, 1X NEO and kitchen robots are shipping or taking
> orders. They are learning to move, but nobody has written down, in a way a machine can
> check, what "simmer" means, when chicken is safe, or how a grandmother's molokhia is made.
> Each maker writes its own closed recipes, mostly from a few cuisines.
>
> Cookwala started from one family's Egyptian home recipes on fifi.cooking and asked a simple
> question: how do you hand a recipe to a machine, and know it will cook it safely?
>
> The answer is an open standard. It says what to make, when each step is done, and what must
> never happen. The device checks it before it heats anything up, and refuses rather than
> guesses. The same recipes work for people and food banks today, and they will let robots
> learn every cuisine on Earth tomorrow, with credit to the cooks who taught them.

*(The founder should confirm and personalize the origin sentence. Authentic beats polished.)*

### 3.4 Message house

| Pillar | Promise | Proof we can show today |
|---|---|---|
| **Safe by design** | Devices refuse rather than guess, and enforce limits locally | Operation envelopes for 32 operations; safety-limits pack; dry run; conformance |
| **Verifiable** | Anyone can check a recipe, a device and a record | Signatures, key revocation, event-log checkpoints; 106 vectors incl. RFC results |
| **Open and neutral** | Royalty-free, model-agnostic, device-agnostic | Licences; governance path; no API keys |
| **Every cuisine** | Built from real home cooking, multilingual | fifi.cooking corpus; Arabic and English; world-cuisines plan |
| **Useful before robots** | Kitchens and food banks benefit now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | Real cooking becomes better robots, with credit | ExecutionLog consent; LeRobot export; OTel traces |

### 3.5 Language rules
- **Use:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Avoid:** "revolutionary", "first and largest" (until true), "end hunger" (as a headline),
  "AI-powered" (vague).
- **Label every number** as *measured*, *modelled* or *assumed*.
- **Say "now / next / later"** instead of implying something exists when it doesn't.

---

## 4. Audiences and their first success

| Audience | Job to be done | First success (≤ 15 min) | Then |
|---|---|---|---|
| **Robot and appliance makers** | Ship cooking features without writing every recipe, safely | Dry-run their device profile against 5 recipes; see accept/refuse per step | Implement the Core API (reference hub), pass conformance, publish the device to the registry |
| **AI-agent builders** | Let agents plan meals and order food without harm | Add the Cookwala MCP server; run the agent-safety benchmark on their model | Use AgentMandate and the dry run before acting |
| **Kitchens and food banks** | Rescue surplus safely, plan nutritious menus | Send an SMS offer, or fill the CSV; see the rule-pack check | Pilot with the Humanitarian Profile |
| **Cooks and recipe creators** | Keep their recipes alive and credited | Convert one recipe with the editor; see it pass validation | Contribute recordings (consented); appear in credits |
| **Researchers and reviewers** | Data, benchmarks, honest assumptions | Run a simulator; read the critique and the conformance suite | Use datasets; publish reviews |
| **Funders and policymakers** | See impact, risks and governance | Read the 2-page whitepaper summary and concept note | Fund pilots; join governance |

---

## 5. Product architecture: what Cookwala offers

| Layer | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 after first device feedback | Core 1.0 under a foundation |
| **Index and registry** | Example recipes; registry spec | fifi.cooking corpus converted (1,881 recipes, Arabic + English); verified namespaces | Community collections, world cuisines |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Recipe editor (web) |
| **Reference hub** | Core API spec | Docker hub with a simulated device, so the quickstart `curl` works locally | Hardware-in-the-loop kit |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Isaac Lab "cook in simulation" benchmark |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Reviewed limits; public agent-safety results | Certification scheme with a certifier |
| **Humanitarian** | Profile, rule pack, templates, concept note | Egypt food-bank pilot | Food-bank network adoption |
| **Data** | ExecutionLog with consent | Contributor network, first consented dataset | Multi-cuisine benchmark on the Hugging Face Hub |

---

## 6. Website

### 6.1 Sitemap

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Home page, top to bottom

| # | Section | Purpose | Content |
|---|---|---|---|
| 1 | **Hero** | Say what it is in one breath | One-liner, triad, two buttons (*Try the dry run*, *Read the quickstart*); honest status chip "Draft standard · v0.2" |
| 2 | **Live demo** | Show, not tell | "Can this device cook this recipe?" Choose a recipe and a device; each step shows done / person / refuse, with the rule that decided |
| 3 | **The problem** | Make the gap felt | Robots are arriving; "simmer" means different things; closed recipes from few cuisines; food wasted while people go hungry |
| 4 | **The loop** | One mental model | Describe → Check → Cook → Learn, each with the artifact and the command |
| 5 | **Pick your path** | Route each visitor | Five cards (section 4), each with a first success |
| 6 | **Proof** | Momentum and honesty | Live counters from `/v1/stats.json` (operations defined, conformance vectors, schemas, recipes published, languages); every number labelled |
| 7 | **Safety** | Trust | Safety is local; refusal; agent rules; recalls; link to /trust |
| 8 | **Works today** | Usefulness before robots | Humanitarian Profile, SMS example, simulators |
| 9 | **Now / next / later** | Honest roadmap | From section 5 |
| 10 | **Open** | Neutral and joinable | Licences, governance path, contribute, GitHub |

### 6.3 Design direction
- **Feel:** calm, precise, warm. A professional instrument with a kitchen soul.
- **Type:** a precise grotesque for UI and a mono face for data and code. Large, light display
  type for the hero (borrowing Figure's confidence), without copying its cinematic darkness.
- **Colour:** neutral paper and ink with one heat accent (ember orange) that also marks
  temperature data. The palette is validated for colour-blind readers, and both light and
  dark themes are designed.
- **Imagery:** real hands and real home kitchens once we have them, never stock robots.
  Until then, diagrams and the live demo carry the page.
- **Motion:** one moment, the step-by-step dry run. Everything else is still.
- **Bilingual from the start:** English and Arabic (right-to-left layout), then others.
- **Accessibility:** WCAG 2.2 AA; keyboard; reduced motion; no information by colour alone.

### 6.4 Interactivity
1. In-browser dry run (recipe × device).
2. Envelope explorer: drag a temperature trace and see when it leaves "simmer".
3. Simulators, with the protocol on and off.
4. Recipe step viewer: a step's sentence, its JSON and its envelope side by side.
5. Later: a recipe editor that validates as you type.

---

## 7. Documentation

Organized by the Diátaxis framework, so each page has one job:

| Type | Purpose | Pages |
|---|---|---|
| **Tutorials** | Learn by doing | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | Solve one task | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | Look things up | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | Understand why | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Docs ergonomics:**
- left navigation, search, "Copy page", "Edit on GitHub", previous/next links;
- language tabs (Python / JavaScript / cURL / CLI);
- `llms.txt` and per-page markdown for AI readers;
- a cheat sheet and a common-problems page;
- a changelog with dates.

---

## 8. API and SDK

| Deliverable | What | Why |
|---|---|---|
| `cookwala` Python package | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (from `tools/`) | One command to first success |
| `@cookwala/sdk` (TypeScript) | Types generated from schemas; Core API client; dry run in the browser | Web and agent developers |
| Reference hub (Docker) | Core API with a simulated device and the safety limits | The quickstart's `curl` works locally; test bed for makers |
| MCP server | Tools: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Every MCP-capable agent can use Cookwala safely |
| ROS 2 package | `cookwala_msgs` (actions), a bridge node to the Core API | Robot makers |
| Exporters | LeRobot, OpenTelemetry (done) | Learning and observability |
| Evals | promptfoo agent-safety benchmark (done) | Agent builders, safety reviewers |
| Versioning | Semver for Core; dated schema bundle; changelog; deprecation windows | Stability promise |
| Status | Public status page for cookwala.ai endpoints | Trust |

---

## 9. Demos

| Demo | Audience | Status |
|---|---|---|
| In-browser dry run | Everyone | Building now |
| Simulators (home, city, country, world) | Everyone, funders | Live |
| Agent-safety results across models | Agent builders, AI labs | Next (run the benchmark, publish results with method) |
| SMS food-rescue walkthrough | Food banks | Next (recorded demo) |
| A real device cooking a Cookwala recipe, unedited | Everyone | Later (the most important demo; needs a device partner) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Robotics researchers | Later |

---

## 10. Community and growth

- **Contributor network** (inspired by Figure's Index):
  - *Cooks* record consented sessions of recipes they know, with credit on every recipe and
    dataset card.
  - *Kitchens and food banks* pilot.
  - *Makers* implement devices.
  - *Reviewers* review rule packs and envelopes.
  - *Translators* translate steps and vocabulary.
  - Paid contributions come later, funded by grants. Never pay for data without informed
    consent and fair terms.
- **Rituals:** monthly community call; quarterly "state of Cookwala" with real numbers;
  public review threads.
- **Partnership sequence:** the first ten from the stakeholder tracker (food bank, WFP
  Innovation Accelerator, Home Assistant, a device startup, a university lab, a certifier,
  World Central Kitchen, a foundation, a neutral home, one creator).
- **Channels:** GitHub Discussions, a newsletter, conference talks (ROSCon, IROS/ICRA
  workshops, food-tech events), Arabic-language channels.

---

## 11. Metrics

- **North-star metric:** *verified cooks*, the number of executions that ran a signed Cookwala
  recipe end to end with a consented, conforming log. While that is zero, track leading
  indicators.

| Funnel | Metric | Target by 2027-03 |
|---|---|---|
| Attract | Monthly visitors to /start | 2,000 |
| Activate | Dry runs completed (web + CLI) | 500 |
| Build | Independent Core implementations passing conformance | 2 |
| Adopt | Food-bank pilot kg rescued (measured) | First 6-month pilot running |
| Contribute | External contributors with merged changes | 15 |
| Trust | External reviews published | 6 |
| Learn | Consented execution logs | 1,000 |

---

## 12. Roadmap

The maintained roadmap with a status per item is [`ROADMAP.md`](ROADMAP.md). The table below is the
original 180-day plan, kept for the record.

| When | Website and story | Developer experience | Standard and safety | Community |
|---|---|---|---|---|
| **Now (this release)** | New home page with live dry run, triad, paths, proof, now/next/later; docs viewer; `llms.txt`; trust pages (security, governance) | Dry run; LeRobot and OTel exporters; ROS 2 actions; agent-safety benchmark | Registry spec (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Next 30 days** | /start quickstart; Arabic home page; claims pass on all pages | `pip install cookwala`; reference hub (Docker) | First benchmark results published | Concept note to food bank; Home Assistant proposal |
| **60 days** | /recipes index with fifi corpus (first 100 converted); /humanitarian | TS SDK; MCP server | Envelope review by a food scientist | First community call |
| **90 days** | Whitepaper + 2-page summary; /roadmap | ROS 2 package | Core 0.3 from device feedback | Device partner, university lab |
| **180 days** | Real-device demo video | Recipe editor | Certifier gap analysis | Pilot results; foundation application |

---

## 13. Risks to this strategy

| Risk | Mitigation |
|---|---|
| A polished site over a thin reality looks like hype | Every claim labelled; live counters from real data; now/next/later |
| Spreading across too many audiences | Two primary paths for the next 90 days: device makers and food banks. Others are supported but not chased |
| Big platforms ship closed alternatives | Be the neutral, verifiable layer they can adopt; partner with open players (Hugging Face, Open Robotics, Home Assistant) |
| Contributor data misuse | Opt-in, withdrawable consent; no personal data; published data cards |
| Founder bandwidth | Ship the developer experience (package, hub) before more spec; recruit a co-maintainer |
