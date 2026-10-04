# Plan: Cookwala v2 (standard, platform and web presence)

**Status:** live plan, started 2026-10-04 on branch `cookwala-v2`. Progress is logged in
[`PROGRESS.md`](PROGRESS.md). The brief is `prompts/fable-website-brief.md`; the founder's
intentions and the gap list are in [`BACKSTORY.md`](BACKSTORY.md).

## 0. Ground rules for every step

- The repository stays green: `tools/validate_specs.py`, `tools/run_conformance.py`,
  `node sim/run.mjs`, `tools/humanitarian_check.py`, `bash tools/build_site.sh <dir>`.
- Every number on the site is **measured**, **modelled** or **assumed**, with its source.
- Now / next / later for anything that does not exist yet.
- Safety and privacy never weaker than Core 0.2.
- No invented users, partners, pilots, quotes, logos or endorsements.
- Each phase ends with a commit and an entry in `PROGRESS.md`.

## 1. Phases

| Phase | Deliverables | Acceptance checks |
|---|---|---|
| **P0 Orientation** | `BACKSTORY.md`, this plan, `PROGRESS.md`; branch `cookwala-v2`; local venv for checks | Every message M1–M85 appears in the gap list; founder told what was understood |
| **P1 Research** | `WEB-BENCHMARK.md`: per-site notes for every URL in the brief (problem, approach, offer, communication, visuals, world-class traits, architecture/API/registry/governance lessons, borrow/adapt/avoid) | All 20+ sites covered; at most one short quote per source; a synthesis section of patterns |
| **P2 Architecture review** | `ARCHITECTURE-REVIEW.md` answering every question in brief §3.1; RFC set in `rfcs/` | Each RFC has problem, proposal, alternatives, migration, open questions; review names what goes in Core 1.0 and what stays optional |
| **P3 Standard changes** | Household Context Profile (facet registry, privacy classes, derived constraints, erasure); Registry and Directory; Humanitarian Profile 0.2 (farm offers, school meals, disaster kitchens, impact metrics, pilot protocol); Health profile rule packs; Fleet and community-kitchen profile; Federation; Farm and supply signals; certification path | Schemas strict and validated; new conformance vectors pass; examples for each new document; `CORE.md` unchanged or bumped with migration note |
| **P4 SDKs and demos** | `sdk/python` (`pip install -e`, `cookwala` CLI: hash, verify, dryrun, validate, envelope, export, conformance); `sdk/typescript` types generated from schemas; `sdk/mcp` server skeleton; `hub/` reference hub (Core API with a simulated device, Docker); first set of real recipes; browser dry run with device builder and shareable results; envelope explorer; SMS food-rescue walkthrough; audience pathfinder | CLI first success in under 15 minutes; hub answers the quickstart `curl`; MCP server lists tools and dry-runs; demos run offline in the browser; no console errors |
| **P5 Stakeholders and story** | `STAKEHOLDERS.md` (message, options, first success, flow for all 11 groups); `MESSAGING.md`; `STRATEGY.md` updated; `IMPACT.md` (hunger, health, environment, economy, culture with sources and labels); `humanitarian/CONCEPT-NOTE.md`, `humanitarian/PILOT-PROTOCOL.md`; `health/` review templates; `education/` lesson kit and research topics; `policy/` brief and model language; essays for thinkers | Every group has all four elements; every public claim labelled; no partner named as a commitment |
| **P6 Design system and site build** | `site/DESIGN.md`; static build step (`tools/build_site.py`) with templates and i18n; tokens validated for contrast; icons; diagram style; motion rules | Light and dark pass WCAG 2.2 AA contrast; phone layout at 360 px has no horizontal scroll; reduced motion respected |
| **P7 Pages** | Home, Why, Impact, For… (11 groups), Registry and Directory (empty-state ready), Developers (quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals), Playground (dry run, envelope explorer, simulators explained), Humanitarian, Farmers, Education, Policy, Investors, Whitepaper (web + PDF), Presentation deck, Ideas and essays, Trust, Roadmap, Contribute, Contact; English and Arabic | Every page exists in both languages; links resolve; existing URLs (`/sim/…`, `/v1/…`, `/.well-known/…`, `/docs/`, `/llms.txt`) still work |
| **P8 Verification** | Local preview; screenshots light/dark, phone/desktop, Arabic; keyboard pass; console clean; link check; build in CI style | Screenshot set saved under `docs/research/screenshots/`; zero broken internal links; zero console errors |
| **P9 Self-critique** | `SELF-CRITIQUE.md`: investor, WFP officer, robotics professor, food-safety regulator, farmer, teacher, politician, philosopher, home cook; fixes applied; repeat | Each critique lists failures found and what changed |
| **P10 Ship** | Logical commits; PR on `cookwala-v2` with screenshots, summary, and the founder-input list | PR open; nothing merged or deployed |

## 2. Scope decisions made now

- **Core stays 0.2.** New work lands as profiles and tooling; nothing in Core's normative
  text weakens. If a Core change proves necessary it gets an RFC and a 0.3 note.
- **Build step for the site:** a small Python generator (no npm dependency) producing
  static HTML from templates and bilingual content files, justified in `site/DESIGN.md`.
  GitHub Pages deployment stays unchanged.
- **Recipes:** a first batch authored by hand to the recipe schema, verification level V1,
  labelled as examples; the bulk fifi conversion waits for the founder's rights decisions.
- **Whitepaper PDF:** generated from the web page with a print stylesheet; the generator is
  documented. If no local PDF engine is available, the PDF is produced in CI or flagged.
- **Images:** diagrams and data visualisations; no generated photographs of robots or people.

## 3. Order of work

P0 → P1 (research agents run in parallel with P2 thinking) → P2 → P3 → P4 → P5 → P6 → P7 →
P8 → P9 (loop with P7) → P10. Commits at each phase boundary and at natural points inside
P3, P4 and P7.

## 4. Open items for the founder

Listed in `BACKSTORY.md` §5 and repeated in the PR.


## Addendum, 2026-10-04: SDK scenarios, the fifi.cooking import, every fifi language

Founder request: a full SDK with 100 scenarios (steps, command lines, code in every major
language), the whole fifi.cooking collection imported into the standard and published on the
site, and the website and its documentation in every language fifi.cooking has (25 with
English and Arabic).

| Phase | Deliverable | Acceptance |
|---|---|---|
| Q1 Import | `tools/export_fifi.py` (deterministic stages E0, E1-lite, E2, E6, E7 of EXPORT-FIFI.md); RFC-0009 and `cw.op.legacy_step`; `recipes/<collection>/*.cookwala.json` at V0; `vocab/ingredients.json` with labels in 25 languages; text sidecars; `/v1/manifest.json`, `/v1/index/<lang>/<page>.json`; recipe pages and a browse page with search; per-collection licence switch | 1,881 documents validate; semantics clean; dry run assigns every legacy step to a person; site shows V0 and V1 counts separately |
| Q2 SDK | Reference-hub tool endpoints; clients in Python, TypeScript/JavaScript, Go, Rust, Java, Kotlin, C#, Swift, C++, Ruby, PHP and curl; `scenarios/` with 100 scenarios as data, rendered to a page and twelve code samples each; a runner that executes every scenario in Python against the hub and records expected output | 100 scenarios run green; samples compile where a toolchain exists (Java, Swift, C++, Ruby, Node, Python); the rest are reviewed and marked untested |
| Q3 Languages | Site generator for 25 languages (RTL for ar, ur, fa, he, ps; fonts per script); per-language `strings.json`, `for.json` and content pages; whitepaper and deck; docs machine-translated by a local model in priority order with a visible "machine-translated, English is the reference" notice; recipe text from the fifi translations | every page builds in every language; no untranslated placeholders; hreflang on every page; a11y scan green |
| Q4 Verify and ship | validator, conformance, sims, build, link check, a11y scan, screenshots; PROGRESS; commits; PR updated | green; PR body lists what is translated by whom and what the founder must confirm (collection licences) |
