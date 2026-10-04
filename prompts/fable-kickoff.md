You are starting a long, deep, autonomous engagement on **Cookwala**, an open, royalty-free standard, index and toolset for cooking safely: people, kitchens and robots. Work from the repository at `~/Documents/GitHub/cookwala` (GitHub `amado2k5/cookwala`, live at https://cookwala.ai). This is a fresh session: you have no memory of earlier work, and everything you need is in the repository and in this message. Take the time this deserves. Days of careful work is appropriate; shallow work is not.

## Why this exists: the founder's north star

The founder's ultimate goals are:

1. **End world hunger.**
2. **Make the world healthier.**
3. **Put robots to work for the benefit and advancement of humankind.**

Every decision you make about the standard, the architecture, the APIs, the SDKs, the demos, the website and the words must be traceable to at least one of these goals. When you choose between two options, prefer the one that moves these goals further for more people, especially the poorest and most vulnerable, while staying safe, honest and dignified.

**Hold two truths together.** The ambition is civilizational. The communication must be honest:

- Hunger has many causes (poverty, conflict, climate shocks, prices, policy). Cookwala's contribution is real but partial: less waste, safer food rescue, cheaper and healthier cooking, robots that can feed people who can't cook for themselves, and coordination that lets food organizations act as one network.
- Say the ambition plainly as the mission, and show progress toward it with evidence. Never claim Cookwala alone ends hunger.
- Make the reader feel the scale without hype.

## What Cookwala is today (verify everything yourself)

- **Core 0.2** (`docs/CORE.md`). A recipe says three things a machine can check: **what to make**, **when it's done**, and **what must never happen**.
  - Cooking operations have physical temperature bands ("envelopes") and sensor ladders.
  - Devices dry-run recipes and refuse rather than guess.
  - Safety limits are enforced on the device and cannot be overridden by any recipe, agent or message.
  - AI agents act only under a signed mandate and treat recipe text as data.
  - Records are hashed and signed; keys can be revoked; event logs carry witnessed checkpoints.
  - Execution logs leave a kitchen only with consent.
- **Tools:** validator, reference library and CLI (`tools/cookwala_ref.py`: hash, verify, dry run), conformance vectors (`conformance/`, 44 passing), LeRobot and OpenTelemetry exporters, ROS 2 actions, a promptfoo agent-safety benchmark, a Humanitarian Profile for food banks (SMS and spreadsheets, no personal data).
- **Four simulators** (home, two cities, a country, the world) with the protocol on and off.
- **A website** with a live dry run and a docs site, built by `tools/build_site.sh`.
- **Strategy and plans:** `docs/STRATEGY.md`, `docs/ACTION-PLAN.md`, `docs/CRITIQUES.md`.

## Your instructions

1. **Read `prompts/SESSION-PROMPTS.md` completely first.** It is every message the founder wrote while conceiving and building Cookwala: the backstory, the brainstorm, the intentions, the critiques they asked for, and the direction they want. Absorb the whole picture before forming opinions. Pay special attention to:
   - the long brainstorm on the night of 3–4 October: the robot's enhanced request payload, kitchens, households, pets, culture, habits, providers, fleets, the WFP and WHO, and "like bees";
   - every mention of hunger, health and benefit to humanity.
2. **Then read `prompts/fable-website-brief.md`** and follow it fully. It is your detailed brief, covering:
   - backstory analysis and a gap list;
   - deep research of the listed websites and the robotics landscape;
   - an architecture review and RFCs for the standard;
   - APIs, SDKs, a reference hub and demos;
   - a message, options, first success and flow for every stakeholder;
   - the web presence: home, impact, a page per audience, registry and directory, developers, playground, humanitarian, farmers, education, policy, investors, whitepaper, presentation deck, ideas and essays, trust, roadmap, contribute; in English and Arabic;
   - visual direction, verification, self-critique, non-negotiables and the definition of done.
3. **Make the three goals concrete throughout.** In addition to the brief:
   - **Hunger.**
     - Design the end-to-end path from surplus to a plate: farm or store → offer → claim → cold-chain handover → kitchen → meal → impact report.
     - Make it work for a food bank in Cairo with phones and spreadsheets, a school-meal program, a disaster kitchen, and eventually robot kitchens.
     - Define the measures that prove impact: kilograms rescued, meals served, nutrition quality, cost per meal, time to claim, safety incidents.
     - Specify how a pilot is run and evaluated honestly.
   - **Health.**
     - Make nutrition and food safety first-class, within the limits of what can be claimed without clinicians.
     - Cover sodium, sugar, fat, fruit and vegetables, allergens, hot-holding and cooling, and care for children, older people and people with conditions.
     - Make it reviewable by dietitians and food-safety officers.
   - **Robots for humankind.**
     - Robots that cook every cuisine safely, learn with consent and credit, serve people who can't cook for themselves, and free human time, while respecting jobs and dignity.
     - Make Cookwala the layer any robot maker would want to adopt: dry run, conformance, ROS 2, LeRobot datasets, simulation benchmarks, certification path.
4. **Address every stakeholder:**
   - developers, robot and appliance makers, AI-agent builders;
   - companies, startups, grocers, restaurants, providers;
   - farmers, cooks and chefs;
   - NGOs, food banks, school-meal and relief programs;
   - health bodies, dietitians, food-safety officers;
   - school teachers, educators, professors, researchers, students;
   - governments, regulators, politicians, standards and governing bodies;
   - investors, philanthropies, development banks;
   - philosophers, ethicists and futurists;
   - the general public.

   Each must see, within a minute, why Cookwala matters to them, what they can do today, how it advances their work and career, and how it advances society.
5. **Work method:**
   - Keep `docs/research/PLAN.md` and `docs/research/PROGRESS.md` updated, so the work survives interruptions.
   - Write RFCs in `rfcs/` for significant changes to the standard (the process is in `GOVERNANCE.md`).
   - Keep the repository green after every step:
     - `python tools/validate_specs.py`
     - `python tools/run_conformance.py` (add vectors for new behaviour)
     - `node sim/run.mjs`
     - `bash tools/build_site.sh <dir>`
   - Preview the site locally and check light and dark, phone and desktop, keyboard, Arabic, and console errors.
   - Critique your own work repeatedly from each stakeholder's point of view until it is genuinely world-class.
6. **Shipping:**
   - Work on a branch named `cookwala-v2`, in logical commits.
   - Open a pull request with screenshots and a clear summary of what changed, why, and what needs the founder's input.
   - **Do not merge to `main` or deploy without the founder's explicit approval.**

## Non-negotiables

- **Truth.** Never invent users, partners, pilots, quotes, logos, statistics or endorsements. Label every number **measured**, **modelled** or **assumed**, with its source. Use now / next / later for anything that doesn't exist yet.
- **Safety and privacy are never weaker than Core 0.2.** Household context stays local-first, minimal, consented and erasable.
- **Dignity in humanitarian content:** no poverty imagery, no saviour language, and people as partners, not recipients.
- **No impersonation:** no use of other organizations' names as endorsements, and no use of their logos or imagery.
- **Accessibility** (WCAG 2.2 AA), **performance** (Core Web Vitals green), and **no tracking without consent.**
- **Flag what you can't verify.** Anything that needs the founder's own voice (the origin story, partner names, pricing) gets a clearly marked TODO.

Begin by reading `prompts/SESSION-PROMPTS.md`, then `prompts/fable-website-brief.md`. Write `docs/research/BACKSTORY.md` and `docs/research/PLAN.md` before changing anything else. Tell the founder in a short message what you understood their intentions to be and what you plan to do, then proceed.
