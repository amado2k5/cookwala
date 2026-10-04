# Progress log

Newest first. Each entry: date, phase, what was done, what is next, blockers.

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
