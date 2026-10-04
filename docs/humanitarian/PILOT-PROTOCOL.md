# How a Cookwala food-rescue pilot is run and judged

**Status:** draft protocol, 2026-10-04 (RFC-0003). For a food bank, community kitchen,
school-meal or relief program that wants to try the Humanitarian Profile. No pilot has run
yet. This document says how one would be run so that its result, good or bad, can be trusted.

## 1. What a pilot tests

A pilot tests one claim: *with the Humanitarian Profile (SMS, spreadsheets or an API, plus
rule packs), a program rescues more food safely, serves it sooner, and knows its own numbers,
compared with how it works today.* It does not test robots, and it does not claim to reduce
hunger in a city.

## 2. Hypotheses, written before the pilot starts

| # | Hypothesis | Measure | Minimum worth continuing |
|---|---|---|---|
| H1 | More surplus reaches kitchens | kilograms rescued per week (first-leg `Handover.kgAccepted`) | at least 10 % more than baseline |
| H2 | Food moves faster | median minutes from `Offer` to `claimed` | at least 20 % shorter than baseline |
| H3 | Less is rejected for safety reasons at handover | `kgRejected` by reason | no increase; `temp_out_of_range` falls |
| H4 | Menus meet the nutrition rules more often | nutrition pass rate on `Distribution.menu` | rises or stays, never falls |
| H5 | Cost per meal does not rise | (food + transport + staff + energy) / meals | no more than 5 % higher |
| H6 | Staff and volunteers find it no harder | minutes of recording per 100 kg; a short survey | not worse than baseline |
| Safety | No safety incident is caused by the tools | `safetyIncidents`, block findings acted on | zero attributable incidents |

The exact thresholds are set with the partner before the start and pre-registered (a dated
file in the program's repository or a public registry such as the Open Science Framework).

## 3. Baseline

Four weeks of the program's current practice, recorded with the same measures by hand (the
CSV templates work for this), before any Cookwala tool is used. Without a baseline there is no
result.

## 4. Design

- **Duration:** 12 weeks after the baseline, plus two weeks of training.
- **Sites:** at least two receiving sites and five regular donors, so one unusual donor does
  not decide the result. Where possible, one site keeps the old method for the same period
  (a comparison site); if not possible, say so.
- **Level:** start at H0 (SMS and spreadsheets). Move to H1 (API) only if the partner wants
  it and H0 ran for at least four weeks.
- **Rule packs:** `who-codex-basic` plus, where children or older adults are served,
  `care-vulnerable-groups`; adapted to national rules by the program's food-safety lead and
  recorded in `reviews`.
- **Who records:** the program's trained staff, by role. No person is named in any document.

## 5. Data responsibility

- No personal data enters any document (profile section 7). The SMS gateway maps numbers to
  organizations only.
- A data-responsibility review against the ICRC Handbook on Data Protection in Humanitarian
  Action and OCHA's data-responsibility guidelines is done before the start and recorded.
- University or institutional ethics approval where the partner requires it.
- Hosting in-country where the program or the law requires it; retention set in the
  `Manifest`; deletion after the pilot unless the partner keeps the documents.

## 6. Analysis

- Measures are computed with `tools/humanitarian_check.py --summary` from the documents,
  never typed by hand. The `ImpactSummary` lists the method and the number of documents behind
  each value.
- Compare pilot weeks with baseline weeks; report ranges, not single numbers, when weeks vary.
- An evaluator independent of Cookwala and of the partner reads the raw documents and the
  summary and signs the result.

## 7. Kill criteria

Stop the pilot early if any safety incident is attributed to the tools, if recording time per
100 kg is more than double the baseline after week four, or if the partner asks. Stopping is a
result and is published.

## 8. Publication

The protocol, the baseline, the `ImpactSummary` and the evaluator's note are published on
cookwala.ai whatever they show, with a "what went wrong" section. Negative results are
published with the same prominence as positive ones. The partner is named only with its
written agreement; otherwise the site says "a food bank in Cairo" and no more.

## 9. Budget (indicative, assumed)

An SMS gateway subscription, printed templates, two weeks of training time for staff, a
part-time field coordinator for 16 weeks, a food-safety officer's review time, and an
evaluator's fee. Hardware: none beyond phones the program already has. A figure in money
depends on the country and is not stated here.

## 10. After the pilot

If the thresholds are met: a second site and the H1 API; application for Digital Public
Good recognition with the pilot evidence. If not: the result is published, the profile is
revised through an RFC, and the next pilot waits for the revision.
