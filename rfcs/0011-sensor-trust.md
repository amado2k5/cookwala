# RFC-0011: Sensor trust: health, calibration and plausibility

**Status:** draft, 2026-10-05 · **Touches:** `schemas/capabilities.schema.json` (`sensors[].state`, `sensors[].calibration`), `vocab/incidents.json` (two entries), `tools/cookwala_ref.py` (`trusted_sensors`, `check_plausibility`, `dry_run`), `sdk/typescript/src/dryrun.js`, `conformance/profiles/sensor_trust.json` · **Core 0.2 normative text:** unchanged; proposes one sentence for Core 0.3 (section 3) · **Safety relevant:** yes · **Reviewer:** none yet; a metrology or appliance-safety engineer should read section 2.

## Problem

Every envelope and every refusal in Core 0.2 assumes the sensors are honest and calibrated. A
sensor counts as a ladder rung because the capabilities document lists it. A thermometer that
reads 20 °C low defeats the deep-fry envelope and the core-temperature control point at once,
and nothing in the standard would notice. An outside reviewer named this first: "the safety
chain assumes honest, calibrated sensors; a lying thermometer defeats every envelope".

## Proposal

1. **Sensor health.** Each sensor record may carry `state`: `ok`, `degraded`, `fault` or
   `unknown`. Only `ok` (or an absent state, for 0.2 documents) lets the sensor satisfy a rung.
   The other three fall through to the next rung of the ladder: a logged estimate, time, or a
   person, or refusal where the envelope allows no fallback.
2. **Calibration record.** Each sensor record may carry `calibration`: `lastAt`, `validUntil`,
   `by`, `method`, `certificate`. A sensor whose `validUntil` has passed does not count as a
   rung, exactly like a fault. The executor logs `cw.incident.sensor_uncalibrated` when it
   skips one for that reason.
3. **Plausibility between sensors.** When two or more sensors read the same medium during a
   step, their readings must agree within the sum of their stated accuracies (default ±2 °C
   when none is stated) plus 1 °C. If they do not, both are demoted for that step, the
   executor logs `cw.incident.sensor_implausible`, and the step is verified by the next rung or
   refused. A reading that is not a finite number is never plausible.
4. **The dry run uses the trusted set.** `trusted_sensors(capabilities, now)` is what the dry
   run and the ladder read; the browser port mirrors it. A device that wants deep frying
   therefore needs an oil thermometer that is healthy and in calibration, not merely listed.
5. **Proposed Core 0.3 sentence** (section 3, sensor ladder): "A sensor satisfies a rung only
   if its health is `ok` and its calibration, when declared, has not expired; implausible
   readings demote the sensors involved for that step."

## What this does not solve

A single lying sensor with no second sensor on the medium and a valid calibration record still
passes. The remaining defences are the calibration record's provenance (who signed the
capabilities document), the plausibility check where a second sensor exists, the safety-limits
pack (which cuts heat on the device's own reading), and the person watching for operations that
may not run unattended. A hardware test under a certification scheme is the only complete answer.

## Alternatives considered

- Require two sensors per heat medium: right for fryers and pressure cookers, too costly for a
  hob; left to the safety-limits pack and the certification scheme.
- Treat `unknown` as `ok`: rejected; silence is not health.

## Migration

Additive. Records without `state` or `calibration` behave as in 0.2. The two incident ids are
new vocabulary entries.

## Open questions

- Should calibration records be signed by the calibrating party, as certifications are (RFC-0010)?
- Default accuracy when none is stated: 2 °C is a guess; a metrologist should set it per sensor class.
- Whether `degraded` should be allowed to satisfy a rung with a widened tolerance instead of none.
