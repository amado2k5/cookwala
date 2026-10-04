# Scenarios: one hundred things you can do with the SDK, in every language

Each file `NNN-slug.json` is one scenario: who it is for, which of the three goals it serves
(hunger, health, robots), the steps, the command lines, and what to expect. The steps call the
twenty-five SDK operations defined in [OPERATIONS.md](OPERATIONS.md), so one scenario renders
into the same program in Python, TypeScript, JavaScript, Go, Rust, Java, Kotlin, C#, Swift,
C++, Ruby, PHP and curl, and the Python form is executed against the reference hub to prove the
expectations are true.

```bash
python tools/scenarios/run.py                 # executes every scenario against a hub it starts; writes out/*/result.json
python tools/scenarios/render.py              # writes out/<id>-<slug>/{README.md, python.py, typescript.ts, go.go, ...}
python tools/scenarios/run.py --ids 001,002   # a subset
```

The site publishes every scenario at `/scenarios/<id>/` with the steps, the command lines,
the code in each language and the recorded output.

Rules for writing a scenario:

- Use only what exists in this repository: the nine example recipes, the capability files in
  `examples/capabilities/`, the example documents under `examples/`, the rule packs in
  `profiles/humanitarian/`. Never invent a device, a partner or a result.
- Every `expect` must be true when the runner executes the scenario; run it before you commit.
- Notes say what the reader learns, in one or two sentences, without hype.
- A refusal is a result, not an error: scenarios that end in a refusal are as valuable as the
  ones that end in a plan.
- Scenarios are indexed by audience and goal on the site; cover every stakeholder group in
  `docs/STAKEHOLDERS.md`.

Numbering: 001 to 019 first steps; 020 to 039 devices, envelopes and the sensor ladder;
040 to 059 executions, logs, stops and incidents; 060 to 079 the humanitarian profile;
080 to 089 household context and privacy; 090 to 100 registry, conformance, federation and
agents.
