# Web benchmark: what the best sites do, and what Cookwala takes from them

**Status:** research, 2026-10-04. Twenty-three sites were read two to four pages deep. The
per-site notes (problem, approach, offer, communication, visual system, architecture and
governance, borrow/adapt/avoid) are in four files:

| File | Sites |
|---|---|
| [`benchmark/robotics-products.md`](benchmark/robotics-products.md) | Figure (home, Figure 03, Helix, company, Index app), 1X (NEO, about, AI), Unitree (G1, open source, SDK), Pollen Robotics (Reachy Mini, docs), NVIDIA Isaac (Sim, Lab, GR00T) |
| [`benchmark/standards-registries.md`](benchmark/standards-registries.md) | MCP Registry, AsyncAPI, ROS 2 / Open Robotics / OSRA (Gazebo, Open-RMF), IEEE RAS, Hugging Face LeRobot |
| [`benchmark/developer-docs.md`](benchmark/developer-docs.md) | LangChain and LangSmith observability, OpenAI API docs, Claude Platform docs, SiliconFlow, promptfoo |
| [`benchmark/whitepaper-mission.md`](benchmark/whitepaper-mission.md) | helix.org whitepaper and docs (crypto agent, structure only), a curated agents list, Open Food Facts, Digital Public Goods Alliance, HXL, W3C, IETF, WFP Innovation Accelerator |

Fetch caveats are recorded in each file (bot walls, JavaScript-only pages, 404s). Quotes
were limited to one short phrase per source; layouts, assets and code were not copied.
Organizations named here are studied as examples; none is a partner or endorser.

---

## 1. Ten lessons that change what Cookwala builds

1. **Safety is the hero, because nobody else makes it one.** Across five robotics sites,
   only one treats safety as a design argument, and none has a safety page. Cookwala's
   proposition *is* safety. Every device, recipe and kitchen page leads with the safety
   sheet: numbers with units (bands in °C, stop latency in seconds, hot-hold minimum), never
   the word "safe" alone.
2. **Numbers beat adjectives; methods beat numbers.** The credible lines everywhere are
   measurable. The humanitarian sites that earn trust put a method under each figure; the
   ones that do not show reach totals without method. Cookwala labels every number
   *measured*, *modelled* or *assumed* with its source, and every impact page has a "what
   we don't know yet" and a "what went wrong" block.
3. **Status labels are the strongest honesty device.** W3C document types, IETF RFC
   statuses, the Digital Public Goods designation that expires, stage-sorted project lists.
   Cookwala prints a maturity label on every spec, profile, page and roadmap item: Core
   normative, draft profile, experimental, planned.
4. **One recommended first path.** The strong platforms give exactly one: three lines of
   code, a quick install, "try in simulation". Cookwala's is the browser dry run (no
   install), then one CLI command that ends in a verifiable artifact (a conformance report).
5. **Journey over catalogue.** The best docs homes are ordered by developer stage
   (understand, run, implement, certify, operate), not by product list. Quickstarts show
   the expected output after every step and offer tabs for curl, CLI and each SDK.
6. **Registries hold pointers, prove names, pin versions, keep tombstones.** The MCP
   Registry's reverse-DNS names, DNS TXT or well-known key proof, immutable versions,
   dated schema URLs and `active / deprecated / deleted` status with tombstones are the model.
   Cookwala adds what a safety standard needs: a mandatory, registry-verified content hash and
   a pointer to a conformance report, not a badge.
7. **Governance only works when written with numbers.** AsyncAPI's charter (quorum, voting
   window, employer cap, amendment threshold, published fees) and ROS 2's REP process with
   statuses and a reference-implementation rule are the examples. Projects without a
   charter are the ones where "who decides" is unclear. Cookwala's `GOVERNANCE.md` gains
   numbers before the steering committee forms.
8. **Versioning is a trust signal.** Version selector, release notes, migration guide per
   breaking change, deprecation table with dates, a status page for hosted services.
9. **AI-readable docs are now table stakes.** `llms.txt`, a markdown mirror of every page,
   published OpenAPI and JSON Schemas, and a docs MCP server. Cookwala has the first three
   and adds the fourth through its MCP server.
10. **Two registers, one template.** Consumer robotics pages sell a feeling with low density;
    platform pages sell the spec with high density. Cookwala needs both, on separate pages,
    and one repeating section template across every audience page and every profile so the
    site is learnable.

## 2. Patterns by area

### Message and story

- One sentence of who it is for and what it does, repeated on every page (Figure's
  discipline of a single storyline).
- Short declarative headlines; sub-lines under fifteen words; one idea per screen (1X).
- Proof from outside the organization is worth more than self-claims: a public conformance
  run, a lab, a standards body liaison. Until those exist, show live counters from the
  repository and say so.
- "Today / soon" and "done / in progress / planned / not yet funded" instead of implying
  something exists.

### Visual system

- Every trusted standards and mission site is restrained: a light page, one accent colour,
  a sans-serif, monospace for code and data, few decorations, photographs or data as the
  only emotional content. The denser the standard, the fewer the photographs.
- Robotics product sites are cinematic and dark; Cookwala borrows their confidence in type
  and whitespace, not their darkness or their robots.
- Diagrams: one hand-drawn or simple architecture diagram per concept, comparison tables for
  vocabulary (trace vs thread; envelope vs safety limit).
- Code blocks with language label and an output block directly after.

### Developer experience

- Three quick chips above the fold: quickstart, run locally, reference.
- Sidebar by journey stage; tabs for surfaces (people, kitchens, robots); search;
  on-this-page anchors; last-updated stamps; copy page; edit on GitHub.
- SDK matrix: one card per language with an idiomatic one-liner, install command, link,
  version.
- Reference pages as typed nested trees with required markers, constraints, enums,
  examples and an error catalogue.
- Evals taught as success criteria first, graders second, with runnable code; red-teaming
  explained as target, hazards, strategies, report.
- Common problems above the fold; a cheat sheet; CLI and API side by side.

### Registry, versioning, governance

- Names: `<reverse-dns-namespace>/<artifact>`; proof by DNS TXT or `/.well-known` record
  carrying a versioned string and a public key, or by code-host login.
- Artifacts carry a back-pointer to their registry name and their dated schema URL.
- Immutable versions; `latest` computed, never set; a `validate` endpoint that never
  publishes; tombstones for anything withdrawn.
- Quality is declared, then peer-reviewed, and the site says so plainly.
- Proposal process: numbered, in Markdown, statuses, public discussion first, a reference
  implementation before final.
- Licences per layer stated in every footer; a royalty-free patent commitment in the
  charter.

### Whitepaper and trust

- The credible whitepaper spine: abstract → numbered problem → principles → solution in one
  page → scope and non-goals → architecture → operation model (read-only, world-changing,
  never-delegable) → trust and security → food-safety and humanitarian layer → conformance
  as running code → governance → registry → impact with methods → roadmap with status →
  risks and limitations → how to participate. Version and date under the title; stage label
  on every page.
- "Confirm before acting" implemented as a class split, limited and revocable delegation, a
  legible summary before execution, a log after. Cookwala already has the mandate, the
  confirm-before list, the local safety limits and the execution log; the whitepaper names
  them in this order.

### Humanitarian dignity

- Describe people by role and situation, never by deficit or pity; no "the vulnerable" as a
  noun; people as partners and contributors.
- Imagery of competence and agency, activity captions, faces only with consent, no
  children's faces by default.
- Every number with a method line; every impact page with a limitations block; corrections
  public; sensitive data governed by a written rule before any collection, default do not
  collect.
- Separate claims about Cookwala from claims about any organization named as a source.

## 3. What Cookwala avoids

- Treating safety as a footnote or a disclaimer.
- Superlatives ("first and largest", "revolutionary") as headlines.
- Collecting home data without saying who owns it and how it is erased.
- Badges without reports; registries that do not check hashes.
- Breaking schema changes with no overlap window.
- A docs landing page that renders empty without JavaScript.
- Reach numbers without method; roadmap items without status; project pages without a
  limitations section.
- Naming organizations or people as supporters.

## 4. How this feeds the work

| Lesson | Where it lands |
|---|---|
| Safety sheet as hero, numbers with units | Home, device and recipe pages; `MESSAGING.md` |
| Method under every number; limitations blocks | `IMPACT.md`, Impact and Humanitarian pages, simulators |
| Status labels everywhere | Design system (`site/DESIGN.md`) status chip; docs headers |
| One first path; expected output after each step | Quickstart rewrite; CLI `cookwala init` ending in a conformance report |
| Journey-ordered developer home; SDK matrix; reference trees | Developers page and docs navigation |
| Registry mechanics; conformance report pointer | RFC-0002, RFC-0008 |
| Governance with numbers | `GOVERNANCE.md` update (steering committee rules) |
| Whitepaper spine; never-delegable class | `docs/WHITEPAPER.md` and the web whitepaper |
| Dignity rules | Humanitarian pages, imagery policy in `site/DESIGN.md` |
| Two registers, one template | Page template for every "For…" page |
