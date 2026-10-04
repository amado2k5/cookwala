# Self-critique: nine viewpoints, what they found, what changed

**Status:** 2026-10-04, after the site build (P8). Method: the whole site and the story documents
were read by reviewers briefed to be harsh from one viewpoint each, with the non-negotiables
(truth labels, no invented partners or endorsements, dignity, no impersonation, safety never
weaker than Core 0.2) as the test. Every finding below is listed with what was done about it.
"Fixed" means changed in this branch; "open" means it needs the founder, a partner or a later
RFC. The reviews were produced in this session; no outside person has reviewed the site yet.

## 1. Investor

| Finding | Status |
|---|---|
| Investors page sold "certification" while the trust page called the certifier independent | Fixed: the company sells test-lab services; certificates come from third parties under a scheme the foundation owns |
| "Cooking is about to become infrastructure", "category-defining", "regulation is tightening around exactly this data" were hype by the site's own rules | Fixed: removed or replaced with what is true (no regulation references Cookwala) |
| "Free forever" is a promise one person cannot bind | Fixed: free for relief use under the current licences; the foundation charter will bind it |
| No ask, no team, no statement of what legally exists | Partly fixed: the page now says nothing legally exists (a repository and a domain). The raise, the team and pricing are the founder's: **open** |
| A visible `todo` chip on the three pages investors read first | Fixed: founder TODOs are now HTML comments in the source and listed in the pull request |

## 2. Programme officer at a food agency

| Finding | Status |
|---|---|
| A handover without a temperature was accepted and a placeholder 0 °C written into the document | Fixed: `safety.temp_not_recorded` blocks the handover and the gateway asks for the reading; no placeholder is ever stored |
| The SMS grammar could not express the most common real handover (part accepted, part rejected) | Fixed: `HAND <id> <kg> REJ <kg> <REASON>` in the reference parser, the browser gateway, the profile and five new conformance vectors |
| Hot food below 60 °C stayed listed for 14 hours | Fixed: refused before listing; hot offers close after 2 hours (1 hour for rice) |
| Chilled-class food declared "ambient" bypassed every temperature rule | Fixed: the gateway infers a food class from the item words and refuses a mismatch (`safety.storage_class_mismatch`) |
| Arabic-Indic digits rejected by the browser gateway but accepted by the reference | Fixed: both normalise digits; a vector covers it |
| HELP reply was 225 characters of notation with a `°` that forces four SMS segments | Fixed: one ASCII example per command under 160 characters |
| The pilot's recording-burden measure did not exist in the data model | Fixed: an evaluator-kept time log (`templates/time-log.csv`) defines it; `volunteerMinutes` is kitchen labour and is no longer used for this |
| Hypothesis H3 ("rejections fall") pushed volunteers to accept marginal food | Fixed: reframed to "every rejection has a reason; the share of offers arriving in band rises; more recorded rejections early is expected" |
| Baseline collected with the tool it measures; no statement of what a 12-week pilot can detect | Fixed: baseline transcribed by the evaluator from existing records; a detectability paragraph added |
| "Computed, never typed" was untrue for nutrition | Fixed: nutrition pass rate is labelled self-reported unless derived from linked recipes |
| Reject reasons were free words | Fixed: ten codes mapped to the profile enum |
| Farmers could not say when produce was harvested | Fixed: `HV<ddmm>` token |
| Cooling stages and reheating were claimed for the rule packs but live in the production run | Fixed: page copy and card link corrected |
| Staff survey had no consent language | Fixed: anonymous, voluntary, aggregated, pre-registered |
| Pilot partner, country, dates | **Open**: founder and partner |

## 3. Farmer or cooperative manager

| Finding | Status |
|---|---|
| "The first exists now" next to "no program runs it yet" | Fixed: "specified, tested and runnable by any program that adopts it; none has" |
| "Reach a kitchen the same day" stated as fact on two pages | Fixed: conditional, with "none does yet" |
| Nothing about collection, receipts, who the "organization" is for a smallholder | Fixed: a "What this means for you" section |
| Fair demand signals need a competition-law review | **Open**: needs a lawyer |

## 4. Home cook

| Finding | Status |
|---|---|
| Koshari sauce used oil that was not an input; cumin and salt split across nodes with no amounts | Fixed: explicit per-use ingredients |
| Molokhia's chicken left the process graph after the stock and was never held hot or served | Fixed: a hold node at or above 60 °C feeding the serve step |
| Kofta preheated olive oil empty at 220 °C with no attention | Fixed: 200 °C, tray oiled at loading, monitored |
| Basbousa almonds in the wrong node; salata parsley diced like a tomato | Fixed |
| Rice-vermicelli water ratio high for Egyptian short-grain | Fixed: 600 ml with "adjust once for your rice" |
| The home cook's "first step" was a command line | Fixed: a no-tooling first step; the CLI is optional |
| Arabic step text uses the feminine imperative without saying so | Fixed: the convention is stated in the recipe format document |
| Recipes are structured, not field-verified | **Open**: needs real kitchens (the roadmap says so) |

## 5. Robotics professor

| Finding | Status |
|---|---|
| README advertised the `cookwala` command but never installed it; `python -m cookwala` failed | Fixed |
| The first printed hash on the developers page was wrong | Fixed (and the recipe was re-hashed after its fix) |
| Vector counts hand-typed in about twenty places and already disagreeing (44, 101, 106) | Fixed: the site injects counts from the repository; the documents were corrected to 106 |
| ROBOTICS.md implied a Matter binding, an Open-RMF task and relevance to named robots that do not exist | Fixed: draft mapping, planned contribution, "no integration exists" |
| The one LeRobot-specific claim cited the wrong dataset version | Fixed: v2.1-style file today; v3 parquet next |
| "Give the device a presence sensor" was not implemented | Fixed: removed |
| The five demo device presets exist only in the browser | **Open**: export them as capability files so the CLI and the MCP server can use them |
| No hardware has run a recipe | **Open**: needs a device partner |

## 6. Food-safety regulator

| Finding | Status |
|---|---|
| Rule packs described as "reviewed by professionals" on the government page | Fixed: "awaiting professional review (none reviewed yet)" |
| "Measured latencies" for a stop nothing has measured | Fixed: specified |
| Reheat threshold differed between the site (75 °C) and the default limit (74 °C) | Fixed: the site states the default and the jurisdictional difference |
| "Verified" tier implied independence while the only registry operator is the maintainer | Fixed: stated on the certification page |
| Policy brief asked governments to reference a one-editor draft before the reviews it lists | Fixed: review and fund first; reference later, after independent review and two implementations |
| Model clause A.8 was a liability shield without a gross-negligence carve-out | Fixed |
| Model clause B.2 allowed limits to be raised "with a safety case" while the site said nothing can raise them | Fixed: aligned to Core (nothing at runtime; a maker changes a default only through a safety case and a signed firmware release) |
| Fixed latencies in statute text; recall duty on every blogger; "text is data" with no legal test | Fixed: schedule, scope, conformance reference |
| Household insurer role undocumented | Fixed: documented with its rationale and its removability |
| Rule packs, envelopes and health claims unreviewed | **Open**: the review template exists; reviewers do not |

## 7. Teacher

| Finding | Status |
|---|---|
| Lesson kit claimed English and Arabic; only English exists | Fixed: stated; Arabic kit is next |
| Everything else: one lesson, browser only, no accounts, numbers check out | No change |

## 8. Politician or policy adviser

| Finding | Status |
|---|---|
| "Interoperability with ISO 13482 and IEC 60335" read as alignment work that has not happened | Fixed: complementary, not a replacement |
| Self-written critiques described as "six critics" and "in the voice of the WFP and the WHO" | Fixed on every page in both languages: self-authored, six viewpoints, no outside review yet |
| Funding "pipeline" named real organizations | Fixed: labelled targets, none approached |
| Dated horizons (2028, 2036) with outcome claims | Fixed: undated, labelled assumed |

## 9. Philosopher

| Finding | Status |
|---|---|
| The dignity essay's people are the ones the sensor ladder refuses, and neither essay admitted it | Fixed: a "hard case" paragraph, a cross-reference from the refusal essay, and an open question on the ideas page and the deck |
| Data card "naming the households" contradicted "no personal data" | Fixed: credit by chosen name or pseudonym, or collectively |
| Governance seats described three ways; no seat for the people served | Fixed: wording aligned to GOVERNANCE.md; a seat for the people served is marked as a proposal. **Open**: the founder decides whether to add it |
| "Most intimate dataset ever", "last room without interlocks" | Fixed: hedged to what is true |
| People described by deficit | Fixed |

## Arabic edition and accessibility

An Arabic-editor pass found the register good and the terminology stable, with leaked English
status chips on about thirty pages, a dozen agreement and calque slips, and three terminology
collisions. Fixed: chips rendered in Arabic, the slips, "hub" as المحور, "measured" as مُقاس,
"ledger" as دفتر الأحداث, Sphere as «سفير» (Sphere), three operation labels, nav labels and
assistive-technology strings on every Arabic page. A static scan of all 138 pages passes every
check (one h1, labels, alt text, skip links, lang and dir, unique titles, reduced motion). The
three hand-written simulator pages fill their tables from script, so a static scan sees no
header cells; they have one now.

## What this pass could not do

- Replace outside review. Every reviewer here was briefed by the same author. The review
  template, the RFC process and the concern register exist for people who are not.
- Verify a recipe in a kitchen, a rule pack with a dietitian, or an envelope on a real hob.
- Decide the founder's questions: the one-liner, the origin story, pricing, the raise, partner
  names, the seat for people served, public anchoring of the transparency log.
