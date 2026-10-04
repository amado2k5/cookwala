# Research topics, datasets, benchmarks and open problems

**Status:** 2026-10-04. For professors, researchers and students. Everything listed exists in
the repository or is marked as a gap.

## 1. What exists to work with

| Asset | Where | Use |
|---|---|---|
| Operation envelopes for 56 operations (temperature bands, sensor ladders, hazards) | `vocab/ops.json` | test conditions for thermal and physics simulation; comparison with culinary science |
| 101 conformance vectors (hashing, signatures, revocation, ledgers, units, envelopes, state machines, disclosure policy, registry rules, SMS grammar, signal policy, relay verification) | `conformance/` | independent implementations; formal analysis |
| Eight example recipes in English and Arabic with end conditions, hazards and critical control points | `examples/*.cookwala.json` | planning, vision-language grounding, translation studies |
| Four deterministic simulators (home, two cities, a country, the world) with the protocol on and off and every assumption listed | `sim/` | agent-based modelling, sensitivity analysis, critique |
| Execution-log format with consent, and exporters to LeRobotDataset v3 tasks and OpenTelemetry traces | `schemas/core.schema.json`, `tools/execlog_export.py` | robot learning datasets; observability |
| Facet registry for household context with privacy classes and travel rules | `vocab/facets.json` | privacy engineering, HCI, ethics |
| Agent-safety benchmark (10 cases, promptfoo) | `evals/kitchen-agent-safety/` | LLM safety evaluation |
| Rule packs derived from public nutrition and food-safety guidance | `profiles/humanitarian/` | public health informatics |

## 2. Open problems, thesis-sized

1. **Envelope validation.** Are the bands in `ops.json` right for pans, pots and ovens of
   different mass and material? Measure medium temperatures in a real kitchen against the
   bands; propose corrections with evidence.
2. **Food-state cues as evaluation targets.** Can a vision-language model reliably detect
   `translucent`, `golden_brown`, `sauce_coats_spoon`, `egg_whites_set`? Build a labelled
   dataset of step-end frames aligned to recipe nodes (the LeRobot export gives the
   alignment).
3. **Refusal policies.** How often does a sensor ladder refuse a step that a human would have
   accepted, and the reverse? Quantify the trade-off between safety and usefulness per
   device class.
4. **Simulator calibration.** Replace the city simulator's assumed behavioural parameters
   with measured ones from a household waste study; publish uncertainty bands.
5. **Privacy of derived constraints.** Can a grocer infer a household's schedule from a
   sequence of delivery windows? Design and test k-anonymity or noise rules for the
   household API.
6. **Demand-signal thresholds.** What minimum source count and delay make class-level
   weekly signals useless for price coordination but useful for planting? A joint
   economics and statistics problem (RFC-0007).
7. **Multilingual recipe grounding.** Do Arabic and English step sentences for the same node
   lead to the same robot behaviour? Measure with the LeRobot tasks file.
8. **Cultural identity under substitution.** Formalize `identity.essential / flexible /
   neverAdd` and test whether planners preserve dish identity under budget and allergen
   constraints.
9. **Agent-safety coverage.** Extend the benchmark with multi-turn attacks, more cuisines
   and languages, and image-based injection (a recipe photo with text).
10. **Humanitarian pilot evaluation.** Design the statistical analysis for the pilot protocol
    with a comparison site and weekly variation.

## 3. Benchmarks we would like to see

- **Cook in simulation:** a thermal simulation of a pan, a pot and an oven scored against
  the envelopes, in Isaac Lab, Gazebo or MuJoCo.
- **Kitchen agent safety across models:** the ten cases run on several model families with
  results published with method.
- **Recipe conversion:** text recipe to Cookwala recipe, scored by validator pass rate and
  human review.

## 4. How to publish and get credit

Datasets of consented execution logs carry a data card and credit the contributing cooks.
Benchmarks and vectors are contributed by pull request and credited in the changelog. Papers
that use the repository can cite the commit hash; a citation block is on the site. Changes to
the standard go through RFCs (`GOVERNANCE.md`), where a reference implementation counts.

## 5. What is deliberately missing

Robot motion and manipulation; Cookwala is above motion. Medical nutrition. Anything that
needs personal data.
