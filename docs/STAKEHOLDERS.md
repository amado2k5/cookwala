# Stakeholders: a message, options, a first success and a flow for everyone

**Status:** 2026-10-04. For each group: why Cookwala matters to them, ways to engage from
light to deep, a first success in under 15 minutes, the path after it, and how engaging
advances their work and the world. Nothing here names a partner, a user or a pilot that does
not exist. Where something is planned, it says next or later.

The three goals behind every row: help end hunger, make people healthier, put robots to
work for people.

---

## 1. Builders: developers, robot and appliance makers, embedded engineers, AI-agent builders, smart-home and platform developers, open-source contributors

**Message.** Robots and appliances are learning to move. Nobody has written down, in a form a
machine can check, what "simmer" means, when chicken is safe, or when a step must be refused.
Cookwala is that layer: recipes a machine can plan, end conditions it can measure, and safety
limits it enforces on itself. It is open, royalty-free, model-neutral and device-neutral, and
it comes with a conformance suite you can run today.

**Options.**
- *Light:* run the browser dry run; read Core 0.2 (one evening).
- *Medium:* `pip install -e sdk/python`, dry-run your device's capabilities against the
  example recipes, run the conformance vectors, start the reference hub.
- *Deep:* implement the Core API on a device or a hub, publish a conformance report, add
  your device to the directory, propose an RFC, write a ROS 2 bridge node, add attack cases
  to the agent-safety benchmark.

**First success (under 15 minutes).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flow.** Dry run → implement the Core API against the reference hub → pass conformance →
publish the report → list the device → consented execution logs become LeRobot datasets and
OpenTelemetry traces.

**How it advances their work.** A shared task definition and success test for cooking, with
a public benchmark to measure against; recipes in every cuisine without writing them; a
safety story regulators can read; conformance reports as a sales document; first-mover
standing in a standard that will be governed by its implementers.

**How it advances society.** Fewer kitchen fires and foodborne illnesses from machines that
refuse rather than guess; machines that inherit the world's cuisines instead of a few.

---

## 2. Companies: startups, enterprises, food companies, grocers and delivery, restaurants and food service, insurers, certifiers, sales and partnership teams

**Message.** Every company that touches food will meet cooking machines and AI agents in the
next few years. Cookwala gives you one interface for all of them, the only one with safety
limits enforced on the device and records you can audit. For grocers and delivery: receive
delivery windows and allergen requirements, never a family's schedule. For insurers and
certifiers: a conformance report format and an incident-report feed designed for you.

**Options.**
- *Light:* read the Investors and partners page and the trust pages; map your products to
  the ingredient classes and operations.
- *Medium:* publish an offer feed (market profile, experimental) or a surplus offer to a
  local program (Humanitarian Profile); run the agent-safety benchmark on the agent you
  plan to deploy.
- *Deep:* implement the Core API in a product; sponsor a conformance verification; join the
  steering committee when it forms; adopt the certification path.

**First success.** Convert one product line to a market `Offer` with GTINs and allergen
credentials, validate it, and see which example recipes it can supply.

**Flow.** Offer feed → derived constraints from households → orders through your own
checkout → fulfilment events → reputation from execution reports (with consent).

**How it advances their work.** Access to a neutral layer instead of a dozen vendor
integrations; demand signals (later, after competition-law review) that reduce waste;
certification that insurers can price; a public record of safety.

**How it advances society.** Less food lost between store and plate; surplus reaching
kitchens before it rots; machines in homes that cannot be talked into unsafe actions.

---

## 3. Providers: grocers, farms and cooperatives, delivery, energy, AI and model vendors, recipe publishers

**Message.** Providers plug into Cookwala as peers, not tenants. A grocer or delivery service
gets a constraint, never a household's facts. An AI vendor gets a benchmark that shows its
model is safe in a kitchen and an MCP server to use today. A recipe publisher keeps its name
on every recipe and can publish a signed catalog from a static folder.

**Options.** Publish a catalog (recipes) · publish an offer feed · run the agent-safety
benchmark · run a registry node · offer surplus by SMS.

**First success.** Recipe publisher: `cookwala init my-dish`, edit, `cookwala validate`,
`cookwala hash`; your catalog is a folder with `/.well-known/cookwala.json`. AI vendor:
add the MCP server and run the ten agent-safety cases.

**Flow.** Catalog or feed → registry entry under your proven namespace → recall feed if
something goes wrong → reputation from outcomes.

**How it advances their work.** Reach every device and agent through one format;
credit and provenance by signature; a safety benchmark that is a marketing asset when
passed honestly.

**How it advances society.** Recipes stay attributed; agents that act for people are
measured before they are trusted.

---

## 4. Food: farmers, cooks and chefs, home cooks, recipe creators, culinary schools

**Message.** A recipe written for Cookwala keeps your name and your cuisine alive on every
device that cooks it, with the steps a machine must never skip written down. A farm with a
glut can list it by SMS and reach a kitchen the same day. A culinary school can teach food
safety with a format that checks itself.

**Options.**
- *Farmers:* `FARM 120KG TOMATO A BB0411` to a program's gateway (where one exists);
  later, read supply and demand signals.
- *Cooks and chefs:* turn one recipe you know by heart into a Cookwala recipe; review the
  step sentences in your language; later, record consented sessions with credit.
- *Schools:* use the nine example recipes as teaching cases; add your own.

**First success.** Cooks: `cookwala init`, write one recipe with an end condition for every
heat step, validate it. Farmers: send one SMS offer to a program that runs the profile (none
runs yet; the parser and vectors exist).

**Flow.** Recipe → validation → catalog → dry run on devices → execution logs show how it
performs on real machines → revisions with evidence.

**How it advances their work.** Attribution that travels; a recipe that can be cooked by
machines in other countries; for farmers, a way to turn a glut into meals instead of waste.

**How it advances society.** Culinary heritage preserved as working knowledge, not video;
less farm-gate waste.

---

## 5. Humanitarian: NGOs, food banks, community kitchens, school-meal programs, relief agencies, donors

**Message.** The Humanitarian Profile moves surplus food to plates with phones and
spreadsheets, records cold-chain checks, counts meals, and carries **no personal data**. It
works without robots, apps or internet. It gives you numbers you can defend: kilograms
rescued, meals served, nutrition pass rate, cost per meal, time to claim, safety incidents,
each with its method.

**Options.**
- *Light:* read the profile and the pilot protocol; try the SMS walkthrough.
- *Medium:* run the CSV templates in one site for four weeks (level H0) and compute an
  impact summary.
- *Deep:* a 12-week pre-registered pilot with a baseline and an independent evaluator;
  adapt the rule packs to national law with your food-safety lead; run your own registry
  node.

**First success.** Fill the three CSV templates for one day, run
`cookwala humanitarian --summary your-folder`, read the `ImpactSummary` with a method under
every number.

**Flow.** Offer → claim → handover with a temperature check → distribution → impact
summary → published results, whatever they show.

**How it advances their work.** Comparable numbers across sites; evidence for funders;
safety findings before, not after, a problem; a format that donors' systems can read (HXL,
GS1, DHIS2 mappings).

**How it advances society.** More food reaching people safely, with their dignity intact:
no names, no faces, no profiling.

---

## 6. Health: dietitians, food-safety officers, public-health agencies, care homes

**Message.** Nutrition and food-safety rules as machine-checkable packs, derived from public
guidance, applied to menus and handovers, with your review recorded by profession and
outcome. Nothing is medical advice; nothing is claimed beyond what the packs say.

**Options.** Review a pack with the template (two hours) · adapt a pack to national rules ·
propose care rules for the people you serve · later, read aggregate outcomes from programs.

**First success.** Open `profiles/humanitarian/care-vulnerable-groups.rulepack.json` and
the review template; mark three rules approved, changed or rejected; file the review.

**Flow.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**How it advances their work.** Your guidance runs in every kitchen that adopts it,
including robot kitchens, with your profession on the record; a publishable review; a
dataset of findings (aggregate, no personal data) for research.

**How it advances society.** Less sodium, sugar and saturated fat in mass-fed meals; safer
hot-holding and cooling; care for children and older people written into the machine.

---

## 7. Education: school teachers, educators, professors, researchers, students

**Message.** Cooking is the most familiar process in the world, and Cookwala turns it into a
teaching object: temperatures, units, fair sharing, safety, machines that follow rules. For
researchers it is a benchmark, a dataset format and an open-problems list.

**Options.**
- *Teachers:* the lesson kit (`docs/education/LESSON-KIT.md`): five lessons from "what is a
  simmer" to "what should a machine never do".
- *Professors and students:* the research topics list, the simulators, the conformance
  vectors as test conditions, the LeRobot export, thesis-sized open problems.
- *Researchers:* publish datasets of consented executions; critique the simulators'
  assumptions; propose vectors.

**First success.** Teachers: run the browser dry run in class and ask why the device
refused. Students: change one assumption in the city simulator and explain the result.

**Flow.** Lesson → project → dataset → paper → RFC.

**How it advances their work.** Free, open, citable material; a benchmark nobody owns;
co-authorship on the standard through RFCs.

**How it advances society.** A generation that knows what a safe kitchen is and can read a
safety sheet.

---

## 8. Government: governments, ministries, city officials, regulators, politicians and legislators, governing and standards bodies

**Message.** Home and commercial cooking machines are arriving under regulations written for
appliances and software separately. Cookwala gives regulators something concrete to point
to: safety limits enforced on the device, refusal before heat, signed records, anonymous
incident reporting, and a conformance suite anyone can run. For food-donation safety it gives
a data standard with no personal data. It is royalty-free and headed for neutral governance.

**Options.** Read the policy brief (`docs/policy/BRIEF.md`) · use the model language for
food-donation data and cooking-machine safety · ask your standards body to review Core 0.2
· run a national registry node · fund a pilot with your school-meal program.

**First success.** Read the two-page brief and check three things in the repository: the
safety limits pack, the conformance runner, the humanitarian data-protection rules.

**Flow.** Brief → review by a national standards body → reference in guidance → pilot →
certification scheme.

**How it advances their work.** A ready-made, reviewable technical basis; evidence from
pilots; a channel to industry through a neutral standard; interoperability with the
humanitarian data standards you already use.

**How it advances society.** Safer machines in homes; food rescue that protects the people
it serves; less waste in cities.

---

## 9. Capital: investors, entrepreneurs, philanthropies, development banks

**Message.** Cooking is about to become infrastructure. The standard is free; the services
around it are a business: certification, hub software, consented datasets, registry
operations, pilots. The humanitarian layer is a public good that development funders can
back with pre-registered evaluation. No financial promises are made anywhere on this site.

**Options.** Read the opportunity, business model, roadmap, risks and governance
(`/investors`) · fund a pilot or a review · back a company that sells services next to the
free standard · join governance as a funder observer.

**First success.** Read the whitepaper's problem, architecture and risks sections and the
action plan's concern register; every open risk is listed.

**Flow.** Evidence (pilots, conformance, adopters) → gates in the action plan → funding
tied to gates → neutral foundation for the standard, a company for services.

**How it advances their work.** Early position in a category-defining standard with honest
numbers; an investable services company separated from the public good.

**How it advances society.** Capital goes to what is measured, not what is claimed.

---

## 10. Thought: philosophers, ethicists, historians and futurists

**Message.** When a machine cooks a grandmother's recipe, who owns the knowledge? What does
dignity mean in automated care? What may a household's robot know, and who else may know it?
Cookwala has made choices about these questions in code; the essays (`docs/essays/`) say
what they were and invite disagreement.

**Options.** Read the essays · write a response · propose a rule (an RFC is a philosophical
argument with a schema) · sit on the ethics review of the household context profile.

**First success.** Read the essay on household data and the facet registry's travel rules;
find one facet whose default you would change, and say why.

**Flow.** Essay → public comment → RFC → changed default.

**How it advances their work.** A live case where ethical positions become running rules,
with a public record of the argument.

**How it advances society.** Decisions about intimate data and cultural inheritance made in
the open before the machines arrive in millions of homes.

---

## 11. Everyone: people who care about food, waste, jobs, the climate and the future

**Message.** Cookwala is a way to write a recipe so that anyone, or anything, can cook it
safely, and a way for food that would be thrown away to reach someone who needs it. It is
free, it belongs to no company, and it says what it does not know.

**Options.** Try the dry run · play a simulator · read the recipes · write one recipe you
love · follow the roadmap · tell a food bank or a school about it.

**First success.** Change the device in the dry run and watch a step be refused; read why.

**Flow.** Curiosity → one recipe → one conversation with a kitchen that could use it.

**How it advances their life.** Safer machines in the home, their own recipes preserved, a
way to help without giving money.

**How it advances society.** Less waste, safer food, machines that serve people who cannot
cook for themselves, and human time returned.

---

## 12. Jobs and dignity, said plainly

Cooking machines will change work. Cookwala's positions: humans can always cook; the first
uses are for people who cannot cook for themselves and for community kitchens that are
short of hands; a cook's name stays on a recipe wherever it is cooked; a labour voice has a
seat on the steering committee; new roles (recipe engineers, food-robot technicians,
certifiers, rule-pack reviewers) are named without promising numbers.

## 13. Where each group lands on the site

| Group | Page |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |
