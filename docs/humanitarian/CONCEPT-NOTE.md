# Concept note: a food-rescue pilot with the Cookwala Humanitarian Profile

**Status:** draft, 2026-10-04, for discussion with a food bank, community-kitchen network,
school-meal or relief program. No partner has been approached with this version; no
organization named here has agreed to anything. `docs/ACTION-PLAN.md` referred to "the concept
note"; this is it.

## 1. Summary

A 12-week pilot, after a 4-week baseline, in which one program records surplus offers,
claims, handovers with temperature checks and distributions using the Cookwala Humanitarian
Profile at level H0 (SMS and spreadsheets), applies a nutrition and food-safety rule pack
adapted to national law, and computes its impact with an open tool. The pilot tests whether
the program rescues more food, moves it faster, rejects less for safety reasons, and knows its
numbers, without collecting any personal data. Results are published whatever they show.

## 2. The problem the pilot addresses

Food banks and kitchens rescue surplus with phone calls and spreadsheets that differ by site.
Temperature checks are inconsistent; impact is reported in ways funders cannot compare; data
about the people served is sometimes collected without need. Cooking devices and AI agents
are arriving and will need the same documents.

## 3. What the profile provides

- Four documents: `Offer`, `Claim`, `Handover`, `Distribution`; an `ImpactSummary` computed
  from them.
- An SMS grammar (`OFFER`, `FARM`, `CLAIM`, `HAND`, `DIST`, `MENU`) and CSV templates with
  humanitarian data tags, so basic phones and spreadsheets are enough.
- Rule packs derived from public WHO, Codex and Sphere guidance for cold chain, time out of
  temperature control, date marks, allergens, sodium, sugars, fats, fruit and vegetables,
  and care rules for children and older adults; all drafts until reviewed.
- No personal data by design: organizations only, aggregate counts with small-cell
  suppression, sites never households, 280-character notes scanned for identifiers.
- Open tools: a checker that validates documents and computes the summary; a parser for the
  SMS grammar; conformance vectors.

## 4. Pilot design

See `PILOT-PROTOCOL.md` for the full protocol: hypotheses and thresholds pre-registered, a
4-week baseline, 12 weeks of use, at least two receiving sites and five donors, a comparison
site where possible, kill criteria, an independent evaluator, data-responsibility and ethics
review, publication of results.

## 5. What the partner provides

Staff time for two weeks of training and daily recording; a food-safety lead to adapt the
rule pack; access to a baseline of current practice; agreement to publish results (named or
unnamed, the partner's choice).

## 6. What Cookwala provides

The profile, the tools, the templates, training material in Arabic and English, a field
coordinator's time where funded, and the analysis. Cookwala takes no data about people and no
fee from the program. The profile is free for relief use, permanently.

## 7. Budget (indicative, assumed)

Items: an SMS gateway subscription for the period; printing; a part-time field coordinator for
16 weeks; a food-safety officer's review time (about one working day); an independent
evaluator's time (about three working days); travel between sites. The amount depends on the
country and the partner's existing capacity and is not stated here. Hardware: none beyond
phones the program already has.

## 8. Risks and how they are handled

| Risk | Handling |
|---|---|
| Recording burden on staff | H0 is designed for one SMS per event; recording time is a measured outcome with a kill criterion |
| Data about people slipping into notes | Notes are 280 characters and scanned; training says what never goes in a note; the evaluator audits a sample |
| Rule pack wrong for the country | Adapted by the program's food-safety lead before the start; recorded in `reviews` |
| A good result that is not real | Baseline, comparison site, pre-registration, independent evaluator |
| A bad result | Published with the same prominence; the profile is revised through an RFC |

## 9. After the pilot

If thresholds are met: a second site and the H1 API; an application for Digital Public Good
recognition with the evidence. If not: publication, revision, and a later pilot.

## 10. Contact

Issues on `github.com/amado2k5/cookwala` with the label `humanitarian`, or the contact on
cookwala.ai. Programs that want to talk are partners from the first conversation, not
recipients.
