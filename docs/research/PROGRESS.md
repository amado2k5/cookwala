# Progress log

Newest first. Each entry: date, phase, what was done, what is next, blockers.

## 2026-10-04 · P3 Standard and P4 SDKs, hub, recipes

- Standard (commit ed04550): facets registry (139 types), household schema and local API,
  registry and directory API with honest `registry.json` and `directory.json`, Humanitarian
  0.2 (origin, food classes, reviews, ImpactSummary, SMS parser, four flows, pilot protocol),
  three draft rule packs with a review template and claims policy, fleet and supply schemas,
  conformance reports and 57 profile vectors (101 total).
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
