# Brief for Claude Fable 5.1: rethink and rebuild Cookwala, from the standard to the website

You are taking on a long, deep piece of work. Take the time it needs:

1. Understand the founder's intentions first.
2. Research the field.
3. Think hard about the standard itself and about every stakeholder.
4. Write the story.
5. Build.
6. Verify everything yourself.

Quality, depth and truthfulness matter more than speed.

The work has two halves, equally important:

- **A. The standard and platform:** how Cookwala works, its architecture, the API, the SDKs,
  the demos, and the flows each stakeholder follows.
- **B. The web presence:** website, registry, directory, developer portal, investor and NGO
  pages, whitepaper and presentation.

Changes to A must show up in B, and B must never promise anything A doesn't deliver.

---

## 0. Start with the founder's backstory and intentions

Before anything else, read **`prompts/SESSION-PROMPTS.md`** from start to finish. It holds
every message the founder wrote in the session where Cookwala was conceived and built, in
order, over two days. It contains:

- the origin: a world-cuisines encyclopedia for fifi.cooking, a family collection of Egyptian
  home recipes;
- the realization that cooking robots have no shared standard, index or governance;
- the founder's long brainstorm (messages around 23:41–00:46 on 3–4 October): the robot's
  "enhanced payload" (kitchen layout, appliances, other robots, pets, the household's habits,
  culture, budget, routines, climate, shopping, eating rituals, waste, past incidents),
  providers and subscriptions, fleets in restaurants, the World Food Programme and the WHO,
  and nature-like decentralization ("like bees");
- signing and closing commitments, cost and time overruns, degraded robots, shared
  capabilities;
- the mission (ending world hunger, a healthier world) and the four simulators;
- the critiques from many perspectives (red team, technical, Elon Musk, Claude, Anthropic,
  WFP/WHO), the stakeholder map, the technical reviewers, the action plan and Core 0.2;
- the research into world-class sites and the robotics landscape.

Then write **`docs/research/BACKSTORY.md`**:

1. **The founder's intentions in their own terms:** goals, values, ambitions, fears, the
   things they repeated, and the ideas they had that the repo doesn't yet reflect.
2. **The evolution:** how the idea changed across the session, and which decisions were made
   and why.
3. **A gap list:** every intention from the messages, mapped to where the repo addresses it,
   partly addresses it, or doesn't address it yet. Be thorough. The brainstorm details (pets,
   culture, prayer times, ventilation, shopping habits, cleaning, incidents, bees) matter.
4. **Tensions to resolve:** for example, rich household context versus privacy and dignity;
   ending hunger versus honest claims; a single standard versus decentralization; robots
   versus jobs. State how you propose to resolve each.

Keep this backstory in mind for every decision that follows. When the founder's intent and
an existing doc disagree, flag it rather than silently choosing.

---

## 1. Context

**Cookwala** is an open, royalty-free standard, with free tools and an index, for cooking
safely: people, kitchens and robots. A Cookwala recipe says three things a machine can check:

1. **What to make.** Recipes as steps a machine can plan.
2. **When it's done.** Measurable end conditions: temperatures, food-state cues, times.
3. **What must never happen.** Safety limits the device enforces on itself, whatever any
   recipe, agent or message says.

Devices dry-run a recipe before cooking and refuse rather than guess. Records can be signed
and verified. AI agents act only under a signed mandate and treat all recipe text as data.
A humanitarian profile lets food banks rescue surplus food safely by SMS or spreadsheet, with
no personal data and no robots. Execution logs can become robot-learning datasets and traces,
but only with the household's consent.

**Repository:** `~/Documents/GitHub/cookwala` (GitHub `amado2k5/cookwala`); live at
https://cookwala.ai. After the backstory, read:

| Read | Why |
|---|---|
| `docs/STRATEGY.md` | Current positioning, message house, audiences, sitemap, roadmap. Improve it |
| `docs/CORE.md` | The normative standard (Core 0.2) |
| `docs/PROTOCOL.md`, `docs/MISSION.md`, `docs/DECISIONS.md`, `docs/REASONING.md`, `docs/HEALTH.md`, `docs/EXTENSIBILITY.md`, `docs/ECOSYSTEM.md` | The broader protocol from the brainstorm, now marked experimental |
| `docs/ACTION-PLAN.md`, `docs/CRITIQUES.md` | Hard questions already asked and our answers. Everything must survive these critiques |
| `docs/QUICKSTART.md`, `docs/ROBOTICS.md`, `docs/REGISTRY.md`, `docs/HUMANITARIAN-PROFILE.md` | Developer, robotics, registry and NGO stories |
| `docs/*SIMULATION*.md`, `sim/` | Four simulators and their honest limits |
| `schemas/`, `vocab/`, `api/`, `bindings/`, `profiles/`, `conformance/`, `evals/` | The machine-readable standard |
| `tools/` | Validator, reference library (`cookwala_ref.py`: hash, verify, dry run), conformance runner, exporters, site build |
| `site/`, `tools/build_site.sh` | Current website and build |
| `GOVERNANCE.md`, `SECURITY.md`, `CONTRIBUTING.md` | Trust and participation |

---

## 2. Research: study these deeply

Visit every URL. Go several pages deep where it helps: product pages, docs home, a quickstart,
a reference page, about or governance pages. For each, note:

- what problem it solves;
- how it approaches it;
- what it offers and to whom;
- how it communicates: headline, sentences, tone, structure, navigation, proof, calls to action;
- its visual system: type, colour, imagery, motion, density;
- what makes it world-class;
- for standards and platforms: how the **architecture, API, SDKs, registry, versioning,
  governance and onboarding** are designed;
- what Cookwala should borrow, adapt or avoid, both for the standard and for the website.

**Product, docs and standards sites:**
- https://www.figure.ai/index-app and https://www.figure.ai (imagery, confidence, restraint; a contributor network)
- https://registry.modelcontextprotocol.io/docs#/ (a registry: namespaces, versions, publishing)
- https://docs.langchain.com/ and https://docs.langchain.com/langsmith/observability (lifecycle, observability, evals)
- https://developers.openai.com/api/docs
- https://www.asyncapi.com/en (an open spec with open governance and tooling)
- https://platform.claude.com/docs/en/home
- https://docs.siliconflow.com/en/userguide/introduction
- https://www.promptfoo.dev/docs/intro/
- https://helix.org/docs/whitepaper and https://helix.org/docs. This is a crypto AI-agent
  product, not Figure's Helix AI model. Learn from the whitepaper structure and the
  "confirm before acting" model, not the token economics.

**Robotics landscape:**
- NVIDIA Isaac: https://developer.nvidia.com/isaac
- Hugging Face LeRobot: https://huggingface.co/docs/lerobot/index (and LeRobotDataset v3)
- 1X: https://www.1x.tech · Figure: https://www.figure.ai · Pollen Robotics: https://www.pollen-robotics.com · Unitree: https://www.unitree.com
- ROS 2: https://github.com/ros2 and https://docs.ros.org · Open Robotics: https://www.openrobotics.org (ROS, Gazebo, Open-RMF)
- Curated physical-AI and agent lists: https://github.com/awesome-ai-agents and similar
- IEEE Robotics and Automation Society: https://www.ieee-ras.org

**Optional:** world-class mission-driven organizations and open standards (public health,
climate, the web, the internet) whose storytelling and governance you admire.

Save your notes as `docs/research/WEB-BENCHMARK.md`. Quote at most one short phrase per
source; summarize in your own words; never copy layouts, assets or code.

---

## 3. Part A: the standard, architecture, API, SDKs and demos

Rethink Cookwala end to end in light of the backstory, the research and the critiques.
Propose and then implement what is needed. Don't treat the current design as fixed; do keep
what already works (Core 0.2's safety model, conformance tests, honesty rules).

### 3.1 Questions to answer, in writing (`docs/research/ARCHITECTURE-REVIEW.md`)

- Is the Core / profiles split right? What belongs in Core 1.0, and what should stay optional?
- How should the founder's household-context ideas be modelled? This means the robot's
  enhanced payload: kitchen, appliances, other robots, pets, people, habits, culture,
  routines, climate, shopping, rituals, waste, incidents. They must stay privacy-preserving,
  local-first, consented and dignified. What is shared, with whom, and how is it minimized?
- How do providers (grocers, AI vendors, delivery, energy, recipe creators) plug in, sign
  commitments, fail and recover? Is the Mission model the right shape, or is there a simpler
  one?
- How does the "like bees" vision (decentralized, emergent coordination, no central
  controller) become concrete architecture? Consider federation, local hubs, gossip,
  registries and transparency logs.
- What do farmers and supply chains need: harvest, surplus, demand signals, prices,
  fairness?
- What do fleets need: restaurants, community kitchens, disaster kitchens?
- What does the API look like for each actor? What is missing from the Core API (for example
  registry, discovery, households, providers, fleets, farms, food banks)?
- **SDKs:**
  - Python package and CLI (`pip install cookwala`);
  - TypeScript SDK generated from the schemas;
  - MCP server for AI agents;
  - ROS 2 package;
  - reference hub (Docker, simulated device);
  - LeRobot and OpenTelemetry exporters (exist).

  What is the minimum set for a great developer experience?
- **Demos:** what convinces each audience? Consider the in-browser dry run, the envelope
  explorer, simulators, an agent-safety leaderboard, an SMS food-rescue walkthrough, a
  "cook in simulation" benchmark, and a real-device video later.
- Versioning, governance, certification and the path to a neutral foundation.

### 3.2 Implement

Turn the review into changes:
- schemas, vocabularies, the Core API and new APIs;
- SDK packages (at least the Python package and CLI, the TypeScript types, and an MCP server
  skeleton);
- reference hub, demos, conformance vectors and docs.

**Rules for the standard:**
- Write a short RFC in `rfcs/` (see GOVERNANCE.md) for each significant change: problem, proposal,
  alternatives, migration, open questions.
- Keep the repo green after every step:
  - `python tools/validate_specs.py`;
  - `python tools/run_conformance.py` (add vectors for new behaviour);
  - `node sim/run.mjs`.
- No breaking change to Core without a version bump and a migration note.
- Every safety and privacy rule stays at least as strict as Core 0.2.

---

## 4. Every stakeholder: message, options, steps and flow

For each stakeholder below, design **a message** (why it matters to them), **options** (ways
to engage, from light to deep), **steps** (a concrete first success in under 15 minutes, then
a path) and **a flow**. Write it in `docs/STAKEHOLDERS.md` and reflect it in the standard,
the APIs, the demos and the website.

| Group | Stakeholders |
|---|---|
| Builders | Software developers, robot and appliance makers, embedded engineers, AI-agent builders, platform and smart-home developers, open-source contributors |
| Companies | Startups, enterprises, food companies, grocers and delivery, restaurants and food service, insurers, certifiers, sales and partnership teams |
| Providers | Grocers, farms and cooperatives, delivery, energy, AI and model vendors, recipe publishers |
| Food | Farmers, cooks and chefs, home cooks, recipe creators, culinary schools |
| Humanitarian | NGOs, food banks, community kitchens, school-meal programs, relief agencies, donors |
| Health | Dietitians, food-safety officers, public-health agencies, care homes |
| Education | School teachers, educators, professors, researchers, students |
| Government | Governments, ministries, city officials, regulators, politicians and legislators, governing and standards bodies |
| Capital | Investors, entrepreneurs, philanthropies, development banks |
| Thought | Philosophers, ethicists, historians and futurists thinking about machines, food, work and culture |
| Everyone | People who care about food, waste, jobs, the climate and the future |

Show explicitly how engaging advances each group's work and career: skills, research,
publications, products, contracts, certification, policy outcomes, teaching material,
community standing. Also show how it advances society.

**Examples of depth:**
- **School teachers:** a lesson kit, for example on food safety, units, fair sharing and
  machines that cook.
- **Professors:** datasets, benchmarks, open problems and thesis topics.
- **Politicians:** a one-page policy brief and model legislative language for food-donation
  safety and robot-cooking standards.
- **Farmers:** surplus listing by SMS and fair demand signals.
- **Philosophers:** essays and open questions on machines inheriting culinary culture,
  dignity in automated care, and the ethics of household data.

---

## 5. Part B: the web presence

### 5.1 The message: clear, impactful, deep, and subtle

Convey these layers with restraint and precision, never hype:

| Horizon | What to convey |
|---|---|
| **Short term (now to 2 years)** | Safer cooking devices; recipes that work across machines; food banks rescuing more food safely; agents that can't be tricked into unsafe actions; open tools developers can use today |
| **Medium term (2–10 years)** | Home and commercial robots that can cook every cuisine; a shared, consented dataset that keeps cultural recipes alive; new jobs (recipe engineers, food-robot technicians, certifiers); less food waste; cheaper, healthier meals; standards regulators can point to |
| **Long term (10+ years)** | Cooking as infrastructure: nutritious food available to anyone, anywhere, including disaster zones and people who can't cook for themselves; less waste and lower emissions; human time returned to people; machines that inherit the world's culinary heritage instead of erasing it |

Also address:
- the humanitarian cause, told honestly: Cookwala contributes; it doesn't solve hunger alone;
- health;
- the environment;
- technological progress and a civilization-scale shift;
- jobs and dignity (acknowledge labour concerns);
- culture and every cuisine;
- safety and trust;
- openness and decentralization.

Find effects we haven't named. Think like a historian of technology, a public-health expert,
an economist, an ethicist, a farmer and a chef. Then express them subtly and professionally,
so readers discover the scale rather than being told.

**Writing rules:**
- Plain, precise language and short sentences.
- No buzzwords or unearned superlatives.
- Every number labelled **measured**, **modelled** or **assumed**, with its source.
- **Now / next / later** instead of implying something exists.
- The triad (what to make, when it's done, what must never happen) used consistently.
- Write `docs/MESSAGING.md` before writing pages.

### 5.2 Information architecture (start from STRATEGY.md section 6, improve it)

At minimum:
- **Home**, **Why Cookwala**, **Impact** (humanitarian, health, environment, economy,
  culture, with sources)
- **For…** pages for every stakeholder group in section 4
- **Registry and directory:**
  - browse recipes, devices, rule packs, extensions and benchmarks;
  - publish flow;
  - a directory of participating organizations, empty-state ready, never invented
- **Developers:** quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
- **Playground:** live dry run, envelope explorer, simulators
- **Humanitarian program** · **Farmers and supply** · **Education** (lesson kits, research
  topics) · **Policy** (briefs, model language)
- **Investors and partners:** opportunity, timing, business model (open standard plus
  services), roadmap, risks, governance; no financial promises
- **Whitepaper:** web plus PDF
- **Presentation:** a 12–15 slide web deck, keyboard-navigable and shareable
- **Ideas and essays:** for thinkers
- **Trust:** safety, privacy, security, governance, critiques, status
- **Roadmap** · **Contribute and community** · **Contact**

### 5.3 Visual direction: crisp, confident, humane

- **Quality bar:** the restraint of Figure, the clarity of the Claude and OpenAI docs, the
  community warmth of AsyncAPI and Hugging Face.
- **Design system:** type scale, spacing, light and dark colour tokens (validated contrast),
  icons, diagram style, motion rules, documented in `site/DESIGN.md`.
- **Imagery:**
  - Prefer real, consented photography of real kitchens, farms, hands, food banks and cooks.
  - Until then, use precise diagrams, data visualisations, illustration, or honest generated
    imagery. The fifirecipes repo has a local FLUX.2 pipeline in `scripts/recipe-images/`.
  - Never depict a real company's robot or a real person, and never imply a product, pilot
    or partnership that doesn't exist. Label illustrative images.
- **Motion:** few, purposeful moments; respect reduced-motion settings.
- **Requirements:**
  - Excellent on phones.
  - Arabic (right-to-left) as a first-class second language, with i18n ready for more.
  - WCAG 2.2 AA.
  - Core Web Vitals green.
  - No tracking without consent.
- **Technical constraints:**
  - Static site deployed by GitHub Pages (`.github/workflows/pages.yml`,
    `tools/build_site.sh`). A static-site build step is fine if it clearly improves quality;
    justify it in `site/DESIGN.md`.
  - Keep existing URLs working: `/sim/…`, `/v1/…`, `/.well-known/…`, `/docs/`, `/llms.txt`.

### 5.4 Interactivity that invites participation
- **The live dry run:** more recipes, a device builder, shareable results.
- **The envelope explorer.**
- **The simulators**, explained for non-experts.
- **An audience pathfinder:** "I am a… / I want to…" leads to the right page and a first action.
- **Calls to action** for every stakeholder: try, read, build, publish, pilot, partner,
  invest, teach, review, legislate.
- **No data-collecting forms** without a real backend and a privacy notice. Until then, use
  GitHub Discussions or issues, or `mailto:` links shown as text.

---

## 6. How to work

1. **Backstory** (section 0) → `docs/research/BACKSTORY.md`.
2. **Plan:** `docs/research/PLAN.md` with phases, deliverables and acceptance checks. Keep a
   running `docs/research/PROGRESS.md`, so the work survives interruptions.
3. **Research** (section 2) → `docs/research/WEB-BENCHMARK.md`.
4. **Architecture review** (section 3.1), then RFCs and implementation (section 3.2).
5. **Stakeholders** (section 4) → `docs/STAKEHOLDERS.md`.
6. **Story:** update `docs/STRATEGY.md`; write `docs/MESSAGING.md`.
7. **Design system and wireframes**, then build page by page with real content. No lorem
   ipsum; empty states instead of fake data.
8. **Verify after each step:**
   - repo checks (validator, conformance, simulators);
   - `bash tools/build_site.sh <dir>` and a local preview (the Claude desktop launch config
     `cookwala-site`, or `python3 -m http.server`);
   - light and dark, phone and desktop, keyboard, no console errors, links, Arabic.
9. **Self-critique.** Review the standard and the site as a sceptical investor, a WFP
   officer, a robotics professor, a food-safety regulator, a farmer, a schoolteacher, a
   politician, a philosopher and a home cook. Fix what fails. Repeat until it is genuinely
   world-class.
10. **Ship on a branch** (`cookwala-v2`) in logical commits, and open a pull request with
    screenshots and a summary. **Do not merge to `main` or deploy without the founder's
    approval.**

---

## 7. Non-negotiables

- **Truth.** Never invent users, partners, pilots, quotes, logos, numbers or endorsements.
  Organizations may be named only as sources, or as "who we want to work with", clearly
  labelled. Figures come from the repository (`tools/site_stats.py`) or cited sources,
  labelled measured, modelled or assumed.
- **No impersonation** of any organization or person; no use of others' logos or imagery.
- **Safety and privacy:**
  - Never weaker than Core 0.2.
  - Household context stays local-first, minimal, consented and erasable.
  - The site must match the standard exactly.
- **Humanitarian framing:** dignity; no poverty imagery; no claim to end hunger alone.
- **Accessibility and performance targets are requirements.**
- **The repo stays green at every commit.**
- **Anything you can't verify, or that needs the founder's voice, gets a clearly marked
  TODO.** Examples: the origin story in their own words, partner names, final pricing of
  services.

---

## 8. Definition of done

- `docs/research/BACKSTORY.md` maps every intention in `prompts/SESSION-PROMPTS.md` to the
  repo, with the gaps closed or explicitly scheduled.
- The architecture review and RFCs are written. Standard, API, SDKs, reference hub and demos
  are implemented to the agreed scope, and conformance covers the new behaviour.
- `docs/STAKEHOLDERS.md` gives every group in section 4 a message, options, a first success
  and a flow, reflected on the site.
- A visitor from any group can, within 60 seconds, say what Cookwala is, why it matters to
  them, and one thing they can do today.
- All pages in section 5.2 are complete in English and Arabic, with the whitepaper (web and
  PDF) and the presentation deck.
- Benchmark, messaging, design system, plan, progress and self-critique are in the repo.
- A pull request on `cookwala-v2` includes screenshots (light and dark, phone and desktop,
  Arabic) and a list of what needs the founder's input.
