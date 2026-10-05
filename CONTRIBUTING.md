# Contributing to Cookwala

Thank you. There are many ways to help, and most don't need code.

| You are | Start here |
|---|---|
| A device or robot maker | Dry-run your device against the example recipes (`docs/ROBOTICS.md`), implement the Core API, run `tools/run_conformance.py`, and tell us what failed |
| An AI agent builder | Run the agent-safety benchmark (`evals/kitchen-agent-safety/`) and propose new attack cases |
| A cook or recipe creator | Turn a recipe you know well into a Cookwala recipe; review the step sentences in your language |
| A food scientist, food-safety officer or dietitian | Review the operation envelopes (`vocab/ops.json`), the safety limits (`profiles/core/`) and the humanitarian rule pack (`profiles/humanitarian/`) |
| A food bank or community kitchen | Read the Humanitarian Profile and the concept note, then talk to us about a pilot |
| A researcher | Use the simulators and conformance vectors; critique the assumptions; propose datasets |
| A translator | Translate step sentences, vocabulary labels and the website |

## Rules for specific contributions

- **Recipes:** include the source and licence; never copy copyrighted text or photos.
  Temperatures must sit inside the operation envelopes (the validator checks this).
- **Vocabularies:** add ingredients, operations, equipment, sensors or hazards with labels in
  as many languages as you can, plus links (Wikidata, FoodOn, USDA FoodData Central).
- **Rule packs and policy packs:** cite the legal or scientific source and effective date for
  every rule, and mark the review status honestly.
- **Device adapters and bindings:** use an `x-<vendor>` namespace; reserve it by pull request
  (a namespace registry file comes with the registry service).
- **Spec changes:** follow the RFC process in [GOVERNANCE.md](GOVERNANCE.md).

Looking for something to do: [BACKLOG.md](BACKLOG.md) lists open items with an id, a label and
whether a professional reviewer or a founder decision is needed first.

## How changes work

1. Open an issue first for anything that changes Core (`docs/CORE.md`).
2. Keep pull requests small. Run `python tools/validate_specs.py` and
   `python tools/run_conformance.py`; both must pass.
3. If you change behaviour, change or add a conformance vector.
4. Write plainly. Every public number says whether it is measured, modelled or assumed.

By contributing you agree your contribution is licensed under the repository licences
(Apache-2.0 for code, CC BY 4.0 for the spec, CC0 for vocabularies) and covered by the
[patent pledge](PATENTS.md).

See also [GOVERNANCE.md](GOVERNANCE.md) and [SECURITY.md](SECURITY.md).
