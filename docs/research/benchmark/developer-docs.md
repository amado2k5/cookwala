# Developer documentation benchmark

Research for the Cookwala developer portal (quickstart, docs, API reference, SDKs, CLI, evals).
Sites visited 2026-10-04, 2–4 pages each, fetched as markdown via WebFetch. Visual observations are
therefore inferred from page structure, component names and theme hints rather than rendered pixels;
where a page could not be fetched this is stated. Marketing statements are flagged with "the site claims".
All descriptions are in our own words; at most one short quoted phrase per source.

Pages visited:

- LangChain / LangSmith: docs home, OSS Python quickstart, LangSmith observability landing, observability quickstart, observability concepts, evaluation concepts, llms.txt
- OpenAI: API docs home, developer quickstart, Responses "create" reference, key concepts, changelog, deprecations
- Claude Platform: docs home, get-started quickstart, Messages "create" reference, develop-tests (evals) guide, SDK/CLI overview, release notes
- SiliconFlow: introduction, quickstart, chat-completions reference, rate-limits concept page, llms.txt (models guide page returned 404)
- promptfoo: intro, getting started, configuration reference, assertions/metrics concept page, red-team quickstart

---

## 1. LangChain docs and LangSmith observability (docs.langchain.com)

### What problem it solves
Developers building LLM agents need one place covering an open-source framework (LangChain, LangGraph), a hosted lifecycle platform (LangSmith: tracing, evals, deployment, monitoring) and adjacent products (LLM gateway, no-code agents, a CLI agent). The docs unify a sprawling product family under one lifecycle story so a newcomer can find where they are.

### How it approaches it
The home page frames everything as an agent development lifecycle (build, test, deploy, monitor) with a card per stage, then a product row, then governance and resources. The headline positions LangChain as "The open agent engineering ecosystem". Observability is introduced as the record of what agents did in production, and that record is immediately linked to the next job (debugging, monitoring quality, building datasets) rather than described in isolation.

### What it offers and to whom
Open-source Python and TypeScript libraries for agent builders; LangSmith for teams running agents in production (traces, dashboards, automations, feedback, online evals, experiments); governance/admin docs for platform owners; an academy, forum, support portal, status page and trust centre for buyers. Free tier entry is emphasised, with the site noting no card is required.

### How it communicates
Headlines are short noun phrases; tone is encouraging and practical, with "in minutes" promises on quickstarts. Structure is card grids on landing pages and numbered steps on quickstarts. Navigation is a Mintlify sidebar with product switcher and Python/TypeScript split; search; GitHub edit and issue links on each page. Strong AI-readability: a large llms.txt index (roughly 1,700 pages, split by lifecycle stage and language) linking to markdown versions of every page, plus docs MCP servers users can connect to their editors, and OpenAPI specs. Proof is thin: no customer logos or scale numbers on the pages visited. CTAs are repetitive "Get started" buttons plus sign-up, enrol, join.

### Visual system
Mintlify defaults: clean sans-serif, generous whitespace, icon-led cards in 2–4 column grids, light and dark themes (code uses a light/dark pastel theme pair), code blocks with copy actions, language and provider tabs, callouts for tips/warnings, expandable long code. Density is moderate on guides and high on the evaluation concepts page, which uses a Mermaid lifecycle diagram, side-by-side light/dark UI screenshots, and comparison tables.

### Developer experience design
OSS quickstart: six sections, three package-manager tabs, nine model-provider tabs for API key and first agent, first working agent in 3–4 steps, then a longer research-agent build and a tracing step. Observability quickstart: four steps (env vars, instrument with a decorator or client wrapper, run, inspect nested trace in UI), Python/TypeScript/Java tabs, regional endpoint note. Concepts pages define runs, traces, threads, trajectories with a comparison table and one diagram, and explicitly map to OpenTelemetry. Evaluation concepts cover datasets, examples, evaluators (human, code, LLM-judge, typed decision, pairwise), experiments, offline vs online tables. Red-teaming is absent. API reference is a separate reference site. Changelog exists per product; status page linked from home.

### What makes it world-class (and what is weak)
World-class: the lifecycle framing, the llms.txt and MCP commitment, the concept pages that teach a vocabulary with tables and diagrams, the many-provider tabs. Weak: product sprawl (seven products on one home page) makes first orientation hard; landing pages are card walls with little prose; no social proof; language coverage is uneven (Python first, TypeScript second, Java sparse).

### What Cookwala should borrow, adapt or avoid
Borrow: lifecycle framing (for Cookwala: specify, simulate, certify, operate, monitor), concept pages with comparison tables (mission vs decision vs reconciliation), llms.txt plus markdown mirrors, docs MCP server. Adapt: the trace concept into "cook traces" for robots and kitchens, with evaluator types mapped to safety evaluators. Avoid: card-wall home pages with no narrative, and product sprawl before the core standard is understood.

---

## 2. OpenAI API docs (developers.openai.com/api/docs)

### What problem it solves
A very large API surface (text, images, audio, realtime, tools, agents, fine-tuning, admin) must be approachable for a first call in minutes yet deep enough for production teams. The docs separate conceptual guides from an exhaustive generated reference.

### How it approaches it
A guides-first, task-oriented structure: a short home, a progressive quickstart, then over a hundred guides grouped by capability, with models, pricing, changelog and deprecations as first-class top-level items. Reference is a separate, typed, nested tree.

### What it offers and to whom
Quickstart and guides for application developers; model catalogue with comparison for architects; deprecations and changelog for platform owners; safety guides; agent-building products; a playground for experimenters. Seven language surfaces (JavaScript, Python, .NET, Java, Go, Ruby, curl).

### How it communicates
Imperative, active headlines (learn, build, use). Tone is friendly and congratulatory on first success, procedural on policy pages. Every page is also served as markdown by appending .md to the URL and an llms.txt index is announced at the top of pages, which is the most explicit AI-readability signal of the five. Changelog entries carry type tags (feature, update, fix, announcement) and affected model/API tags. Deprecations page states a policy (notice periods by model class, email notification) and uses three-column tables (shutdown date, item, replacement). Proof is implicit through breadth; CTAs are quiet (quickstart, playground, billing).

### Visual system
Restrained, near-monochrome, large type, wide measure; light and dark. Reference pages are single-column nested lists with inline type annotations and "optional" markers rather than tables, and collapse deep objects with "N more" toggles. Code is short (5–15 lines) with language tabs. Density is low on guides and very high on reference.

### Developer experience design
Quickstart: key, install, first call, then images/files, tools, streaming, agents, each in seven language tabs; first output promised within moments. Reference style: exhaustive typed parameters, enum lists, little example code in-line (examples live in guides). Versioning: dated model snapshots, explicit deprecation policy with minimum notice windows, separate changelog. Status page exists separately. Evals exist as a product but were not in the pages visited; the key-concepts page is short prose with no diagrams.

### What makes it world-class (and what is weak)
World-class: the .md-per-page and llms.txt convention, the deprecation policy as a documented contract, tagged changelog, breadth of language tabs. Weak: reference pages are dense and example-poor on their own; the concepts page is thin; the home page is a long category list rather than a guided path.

### What Cookwala should borrow, adapt or avoid
Borrow: .md mirror of every page, llms.txt, a written deprecation and versioning policy (notice periods per spec maturity: draft, candidate, stable), typed changelog entries. Adapt: the "models" catalogue into a "profiles and conformance levels" catalogue (home, commercial kitchen, robot classes). Avoid: an undifferentiated 100-guide list; keep a guided path first.

---

## 3. Claude Platform docs (platform.claude.com/docs)

### What problem it solves
Lets a developer go from zero to a working API call, then to production, across two surfaces (direct Messages API and Managed Agents) and three clouds, without losing the thread.

### How it approaches it
A hero with three quick chips (quickstart, get key, API reference), then a "choose how you build" pair of platform cards, then a tabbed developer journey (get started, build, evaluate and ship, operate) listing the exact pages for each stage, then a model family table, then resources. The subtitle promises "From first API call to production." and the page is literally organised that way.

### What it offers and to whom
Messages API and Managed Agents quickstarts; a CLI (ant) with OAuth login; seven client SDKs (Python, TypeScript, C#, Go, Java, PHP, Ruby) plus Swift and OpenAI-compatibility libraries; cookbook, courses, deployable starter apps; admin, usage and cost APIs for operators; evals guidance for quality teams.

### How it communicates
Calm, precise, second-person. Headline style: short label + sentence title + one-line description per section. Navigation: Mintlify sidebar grouped by journey stage, tabs for surfaces, search, and (per platform convention) copy-page and ask-AI style affordances; markdown source is served to fetchers. Proof is the model table and cloud partner row rather than customer logos. CTAs: quickstart, get API key, try in playground.

### Visual system
Warm neutral palette with a single accent, large serif-leaning display type over a humanist sans body (as rendered elsewhere on the brand), pictogram cards, light and dark. Code blocks carry a language label and an "Output" block immediately after, so every step shows expected result. Steps components give numbered vertical rails. Reference pages are single-column nested parameter trees with inline constraints (min/max, defaults), union types, and inline deprecation notes.

### Developer experience design
Quickstart: nine tabs (curl, CLI, Python, TypeScript, C#, Go, Java, PHP, Ruby); each tab is set key, create project and install, create file, run, with expected output; Java even nests Gradle/Maven tabs. Time to first success is roughly five minutes. SDK matrix: one card per language with a one-line idiomatic note (async, builder pattern, type system). Versioning: dated API version header, dated tool-type versions, release notes in reverse chronology with explicit retirement dates and migration links; no RSS. Status page exists separately. Evals guide is excellent: SMART success criteria, bad-vs-good criteria tables, eight criteria accordions, five grading methods (exact match, embedding similarity, ROUGE-L, LLM Likert, LLM binary) each with edge cases and runnable code in all SDK languages.

### What makes it world-class (and what is weak)
World-class: journey-ordered home page, output shown after every code block, uniform multi-language quickstart, SDK cards with idiomatic notes, the evals guide as a teaching document. Weak: reference pages lack visible language tabs and response examples in the fetched view; release notes have no subscribe mechanism; density of the Messages reference is high.

### What Cookwala should borrow, adapt or avoid
Borrow: the journey home page; expected-output blocks after each step; SDK cards with an idiomatic one-liner; an evals page that teaches how to write success criteria for safety (for example: fewer than X unsafe op envelopes per 10,000 simulated missions). Adapt: the model family table into a conformance-level table (Core 0.2 profiles). Avoid: shipping a reference without response and error examples.

---

## 4. SiliconFlow docs (docs.siliconflow.com)

### What problem it solves
An inference cloud offering many open models behind an OpenAI-compatible API needs docs that get a developer from sign-up to a streaming call quickly, and that make limits, tiers and model availability legible.

### How it approaches it
A conventional Mintlify user guide (introduction, quickstart, guides, FAQ) plus an API reference generated from OpenAPI, in English and Chinese. The introduction is positioning copy: product features and six "characteristics" (speed, scalability, cost, stability, intelligence, security).

### What it offers and to whom
Chat, embeddings, rerank, image, video and audio endpoints; a playground; usage tiers L0–L5; integration tutorials for roughly fifteen third-party tools (editors, agent builders); BYOC deployment for enterprises. Aimed at cost-sensitive developers and teams in the Chinese and global open-model ecosystem.

### How it communicates
Enterprise-brochure tone on the intro (the site claims a "globally leading inference acceleration engine"), practical tone on the rate-limits page. Headlines are plain nouns. Navigation: sidebar, language switcher, search, llms.txt and OpenAPI index. Proof: none beyond assertions. CTAs are weak; the quickstart links out to playground and key pages but has no formal next steps.

### Visual system
Mintlify defaults with a brand accent; light and dark; single-column prose; tables for metrics and tiers; one Python code block in the quickstart. Low design investment and low density. Reference is a schema-first view with required markers and inline examples but no visible language tabs or try-it panel in the fetched view.

### Developer experience design
Quickstart: create account, browse models, test in playground, then one Python snippet using the OpenAI client with a swapped base URL; no language tabs, no expected output, no stated time to success. Rate-limits page is the strongest content: seven metrics defined, model-category table, six-tier table, scope rule (account not key), a worked example and a notebook for handling errors. Versioning and changelog not visible; status page not visible; evals not covered. Models guide URL returned 404, a sign of link rot.

### What makes it world-class (and what is weak)
Strength: the OpenAI-compatibility strategy means near-zero migration cost, and the tier table is a model of clarity. Weak: marketing copy where orientation should be, single-language code, missing output, broken link, no changelog or status visibility, uneven translation polish.

### What Cookwala should borrow, adapt or avoid
Borrow: the limits-and-tiers table pattern (for Cookwala: safety limits per profile, trust tiers, conformance levels in one table). Adapt: compatibility positioning, i.e. "works with the tools you already use" (ROS 2, Home Assistant, existing recipe formats). Avoid: leading with superlatives, a quickstart with one language and no output, and unchecked links.

---

## 5. promptfoo (promptfoo.dev/docs)

### What problem it solves
LLM apps are tuned by trial and error; promptfoo makes evaluation and red-teaming a repeatable, config-driven, CI-friendly step so prompts, models and RAG pipelines can be compared and attacked systematically.

### How it approaches it
Declarative YAML: prompts, providers, tests, assertions. A CLI runs the matrix, a local web viewer shows side-by-side results, and a red-team mode generates adversarial inputs via plugins and strategies against a target. The intro positions this as "test-driven LLM development".

### What it offers and to whom
Open-source CLI and library for engineers; red-teaming with 50+ vulnerability categories mapped to OWASP, NIST and EU frameworks for security teams; a hosted product and demo for enterprises (solutions pages by industry). Providers: 60+ model integrations.

### How it communicates
Direct, example-led, confident. Proof is prominent: a GitHub star count badge, the claim that it was originally built for apps serving over ten million users (the site claims), SOC2 and ISO 27001 badges, Discord link. Navigation: Docusaurus sidebar (Evals, Red teaming, Providers, Integrations, Code scanning, Model audit), top nav with Products and Solutions, search, version dropdown, on-this-page anchors, "last updated" stamps, direct-link anchors on headings. CTAs: book a demo, log in, red-team quickstart.

### Visual system
Docusaurus with a blue primary and dark-blue headings, grey body, light/dark toggle; screenshots of comparison grids and risk dashboards; SVG workflow diagrams; tabbed install commands (npx, npm, brew); collapsible YAML examples. Density is medium; reference pages are long tables.

### Developer experience design
Getting started: one init command with an example, run, open viewer; first eval in minutes. Config reference is table-driven (field, type, required, description) for Config, Test Case, Assertion, Assertion Set, plus TypeScript interfaces and a JSON schema URL for editor validation. Assertions concept page splits deterministic (equals, contains, regex, is-json) from model-graded (rubric, faithfulness, relevance, factuality), explains weights, thresholds and named metrics with a UI screenshot. Red-team quickstart defines target, plugin and strategy, walks setup/run/report, and describes the report (categories, severity, logs, mitigations), citing research from large vendors for credibility. Datasets are tests plus CSV loading; traces are not a core concept here. Versioned docs via dropdown; changelog on GitHub.

### What makes it world-class (and what is weak)
World-class: a config schema that doubles as the mental model, deterministic vs model-graded taxonomy, red-teaming explained in three nouns, JSON schema for editors, CI integration as a first-class path, visible trust signals. Weak: marketing nav mixed into docs, Node-only runtime, visual polish is standard Docusaurus, concept pages lean on screenshots.

### What Cookwala should borrow, adapt or avoid
Borrow: a YAML eval config with a published JSON schema; assertion taxonomy (deterministic safety limits vs judged quality); a red-team vocabulary (target = robot or kitchen controller, plugin = hazard generator, strategy = attack wrapping, report = severity plus mitigation); init-with-example as the first command. Adapt: the matrix viewer into a protocol-on vs protocol-off comparison, which Cookwala's simulators already express. Avoid: letting sales navigation crowd the docs.

---

## Patterns across these five

- Journey over catalogue: the best homes (Claude, LangChain) order content by developer stage; the weaker ones list categories or brochure copy.
- Quickstart = key, install, first call, expected output, next step, in five minutes; language tabs are table stakes (seven to nine on the strongest sites).
- AI-readable docs are now standard: llms.txt, markdown mirrors of every page, OpenAPI specs, and docs MCP servers.
- Versioning is a contract: dated versions, a written deprecation policy with notice windows, tagged changelogs, migration guides, and a separate status page.
- Concept pages teach vocabulary with comparison tables and one diagram (trace vs thread, offline vs online, deterministic vs model-graded).
- Evals are taught as success criteria first, graders second, with runnable code; red-teaming is explained as target, generator, strategy, report.
- Reference pages are typed nested trees with required/optional markers, constraints and enums; the best pair them with examples and expected responses.
- Proof is light everywhere except promptfoo; trust is signalled through status pages, trust centres and certifications rather than logos.

## Developer-portal checklist for Cookwala

Portal and navigation
- [ ] Home page organised as a journey: understand the standard, run the simulator, implement the protocol, certify, operate.
- [ ] Three quick chips above the fold: quickstart, get a sandbox credential or run locally, API/schema reference.
- [ ] Sidebar grouped by journey stage; product/profile tabs (people, kitchens, robots); search; on-this-page anchors; last-updated stamps.
- [ ] Copy page as markdown, .md mirror per URL, llms.txt index, published OpenAPI and JSON schemas, a docs MCP server.
- [ ] Light and dark themes; phone-width layout; consistent callouts (safety warning, tip, note).

Quickstart and SDKs
- [ ] Five-minute quickstart with tabs for curl, CLI and every SDK language; each step followed by an expected-output block.
- [ ] Init-with-example CLI command that produces a runnable mission and a passing conformance check.
- [ ] SDK matrix page: one card per language with an idiomatic one-liner, install command, GitHub link, version badge.
- [ ] Compatibility pages: works with ROS 2, Home Assistant, existing recipe formats.

Reference and versioning
- [ ] Schema reference as typed nested trees with required markers, constraints, enums, plus request and response examples and error catalogue.
- [ ] Spec versioning policy page: maturity levels, notice periods, deprecation table (shutdown date, item, replacement), migration guides.
- [ ] Tagged changelog (feature, update, fix, announcement) with RSS, and a status page for any hosted services.

Concepts
- [ ] Concept pages with a comparison table and one diagram each: mission vs decision vs reconciliation; op envelope vs safety limit; trust layer tiers.
- [ ] Limits-and-tiers table in one place (safety limits per profile, conformance levels).

Evals, benchmark and safety
- [ ] Evals guide that teaches success criteria (SMART, bad-vs-good examples) before graders, with runnable code in every SDK language.
- [ ] Declarative eval config (YAML) with a JSON schema URL for editor validation; deterministic vs judged assertion taxonomy; weights, thresholds, named metrics.
- [ ] Red-team vocabulary and quickstart: target, hazard plugins, strategies, report with severity and mitigations; mapping to relevant safety standards.
- [ ] Benchmark pages that show protocol-on vs protocol-off side by side, with reproducible commands and dataset downloads.
- [ ] Trust signals: conformance suite results, trust centre, security disclosure page, community links.
