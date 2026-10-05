# Progress log

Newest first. Each entry: date, phase, what was done, what is next, blockers.

## 2026-10-04 (evening) · Q1 to Q3: fifi.cooking import, SDK in 13 languages with 100 scenarios, the site in 25 languages

- Founder changed the shipping rule to direct, incremental pushes to main (every ~20 minutes);
  PR #1 is closed as superseded. Every push deploys cookwala.ai.
- Q1 Import: `tools/export_fifi.py` converts all 1,881 fifi.cooking recipes into V0 documents
  (RFC-0009, `cw.op.legacy_step`): 99.3 % of quantities parsed, names in 25 languages, text
  sidecars for 23 languages, a 3,953-entry ingredient vocabulary, `recipes/INDEX.json` and
  `recipes/REPORT.md`. Licence per collection in `tools/export_fifi.collections.json`:
  only the family archive is CC-BY-4.0; the four book- and channel-derived collections are
  "credited, licence under review" until the founder confirms. The validator checks all of them.
- Q2 SDK: the reference hub exposes the library over HTTP (`/v1/tools/*`); clients in Python,
  TypeScript, JavaScript, Go, Rust, Java, Kotlin, C#, Swift, C++, Ruby, PHP and curl implement the
  25 operations of `scenarios/OPERATIONS.md`; 100 scenarios as data, rendered to 13 code samples
  each and executed against the hub (100/100 pass). Compiled and run here: Python, TypeScript,
  JavaScript, curl, Java, Swift, C++, Ruby. Reviewed but not compiled here: Go, Rust, Kotlin,
  C#, PHP (no toolchain on this machine; their READMEs say so).
- Q3 Languages: the generator builds 25 languages (discovered from `site/content/<lang>/`),
  RTL for five, fonts per script, a language menu and hreflang on every page, a visible
  machine-translation notice. English and Arabic are human-written; the other 23 are being
  produced by a local model (`tools/translate_site.py`, `tools/translate_docs.py` with
  gemma4:26b) and committed as they land; the documentation set is 16 to 17 documents per
  language so far. Recipe pages exist statically in English and Arabic; a viewer serves the
  other languages from the sidecars.
- Site: 4,283 pages, 51k files, zero missing links (175k checked); recipe browse with search
  in any script; scenario pages with tabs per language and recorded output.
- Open: founder confirmation of collection licences; first compile of the five untested
  clients; translations still running; screenshots for the new pages.

## 2026-10-04 · P9 Self-critique: nine viewpoints, fixes applied

- Reviews from investor, food-agency officer, farmer, home cook, robotics professor,
  food-safety regulator, teacher, policy adviser and philosopher viewpoints, plus an Arabic
  editor and a static accessibility scan; findings and status in `SELF-CRITIQUE.md`.
- Truth fixes: self-written critiques no longer described as outside critics or "in the voice
  of" named agencies; present-tense capability claims made conditional; "certification" sold by
  the company replaced by test-lab services with third-party certificates; hype phrases cut;
  founder TODOs moved out of user-facing copy; counts injected from the repository (106 vectors).
- Safety fixes in the SMS path: missing temperature blocks a handover, hot food below 60 °C and
  chilled-class food declared ambient are refused before listing, partial rejection
  (`HAND <id> <kg> REJ <kg> <REASON>`), reason codes, harvest date, Arabic-Indic digits, a
  readable HELP; five new vectors (106/106).
- Pilot protocol: evaluator time log for burden, baseline from existing records, H3 reframed,
  detectability statement, survey consent. Policy clauses: gross-negligence carve-out,
  limits aligned to Core, thresholds moved to a schedule, recall duty scoped.
- Recipes: koshari, molokhia, kofta, basbousa, salata baladi and rice fixed and re-hashed.
- Arabic: status chips, nav and assistive strings in Arabic; terminology collisions resolved.
- Open for the founder: see the pull request.

## 2026-10-04 · P5 to P8: story, design system, site build, pages, verification

- Story documents committed (stakeholders, messaging, impact, whitepaper in English and
  Arabic, roadmap, concept note, pilot protocol, lesson kit, research topics, policy brief and
  model language, five essays, governance numbers).
- Site v2: `site/DESIGN.md`; a standard-library generator (`tools/build_site.py`) with a
  Markdown renderer (`tools/md.py`); one layout, docs layout and deck layout; bilingual
  strings; 17 content pages in English and the same 17 in Arabic (right-to-left); 11
  stakeholder pages per language generated from `site/content/for.json`; 70 rendered
  documents under `/docs/<ID>/` with `?p=` kept working; whitepaper web and PDF in both
  languages; five essays; a 14-slide keyboard deck in both languages; `llms.txt`, sitemap,
  robots.
- Interactive: dry run with nine recipes, five presets, a device builder and shareable URLs;
  envelope explorer (drag a trace, altitude, targets); SMS walkthrough with an in-browser
  gateway and summary; pathfinder; registry and directory browser reading the static files.
- Verification: 138 pages, zero broken internal links, one h1 and a skip link on every page
  (simulators patched), no console errors on home, playground, humanitarian, docs; no
  horizontal overflow at 375 px in English or Arabic after fixing the demo controls;
  screenshots in `docs/research/screenshots/` (light, dark, phone, desktop, Arabic).
- Next: P9 self-critique from nine viewpoints, fixes, then the pull request.

## 2026-10-04 · P3 Standard and P4 SDKs, hub, recipes

- Standard (commit ed04550): facets registry (139 types), household schema and local API,
  registry and directory API with honest `registry.json` and `directory.json`, Humanitarian
  0.2 (origin, food classes, reviews, ImpactSummary, SMS parser, four flows, pilot protocol),
  three draft rule packs with a review template and claims policy, fleet and supply schemas,
  conformance reports and 57 profile vectors (101 total at the time; 106 after the SMS grammar grew).
- SDKs: `sdk/python` (editable install, `cookwala` CLI with 14 subcommands), `sdk/typescript`
  (types generated from all 24 schemas by `tools/gen_ts_types.py`, type-checked; the browser
  dry run moved here as the single source), `sdk/mcp` (stdio MCP server, 8 tools), `hub/`
  (Core API with a simulated device, Dockerfile; smoke-tested: refusal, acceptance, progress,
  stop, log), `bindings/ros2/cookwala_msgs` interface package.
- Recipes: eight example recipes (lentil soup, ful medames, rice with vermicelli, salata
  baladi, oven kofta, molokhia, koshari, basbousa), V1, English and Arabic, every heat step
  inside its envelope, hazards and critical control points explicit; all validate.
- Next: P5 stakeholders, messaging, impact, concept note, education, policy, essays,
  whitepaper; then the site.

## 2026-10-04 · P1 Research and P2 Architecture review

- Four parallel research passes covered 23 sites (robotics products, standards and
  registries, developer docs, whitepaper and mission sites). Per-site notes in
  `docs/research/benchmark/`; synthesis with ten lessons in `WEB-BENCHMARK.md`.
- `ARCHITECTURE-REVIEW.md` answers every question in brief §3.1 and fixes the scope: Core 0.2
  unchanged; eight RFCs (household context, registry and directory, humanitarian 0.2, health
  rule packs, kitchens and production runs, federation, farm and supply signals, conformance
  reports and certification).
- RFCs written in `rfcs/` with problem, proposal, alternatives, migration, open questions.
- Next: P3 implementation in this order: conformance profile vectors and report format
  (RFC-0008) → facets registry and household schema (RFC-0001) → registry/directory
  (RFC-0002) → humanitarian 0.2 and health packs (RFC-0003/0004) → fleet and supply schemas
  (RFC-0005/0007) → federation fields (RFC-0006).

## 2026-10-04 · P0 Orientation

- Read `prompts/SESSION-PROMPTS.md` (85 messages) and `prompts/fable-website-brief.md`
  in full, then every document in `docs/`, the schemas, vocabularies, APIs, tools, examples,
  profiles, conformance vectors, simulators and the current site.
- Baseline checks on `main` (83bfb91): validator ok, conformance 44/44, simulators ok,
  humanitarian checker ok (one intended block), site builds (119 files). Python deps live in
  `.venv-cw/` (gitignored); system Python has none.
- Created branch `cookwala-v2`, `docs/research/`, `rfcs/`.
- Wrote `BACKSTORY.md` (intentions, evolution, 62-item gap list, 11 tensions with
  resolutions, founder TODOs) and `PLAN.md`.
- Next: P1 research (parallel agents, one group of sites each) and P2 architecture review.
- Blockers: none. Founder decisions pending are listed in `BACKSTORY.md` §5; work proceeds
  under stated assumptions.
