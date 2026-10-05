I read it properly — homepage, docs, roadmap, investors page. Here's my take.

What cookwala.ai actually is

Not the Indian cook-hiring site (cookwala.com) — this is a totally different project. Cookwala.ai is proposing an open standard for cooking safely, for people, kitchens, and robots.

The core idea is clean and I think genuinely smart: recipes as machine-checkable steps, not just text. Every recipe says three things:

What to make — steps a machine can plan
When it's done — temperatures, food-state cues, times it can actually measure
What must never happen — safety limits the device enforces itself

A Cookwala device dry-runs the recipe against its own capabilities before heating anything, and refuses rather than guesses. No oil thermometer, no deep frying. That "refuse rather than guess" default is the heart of it.

Around that they've built a lot: Core 0.2 spec, 106 conformance vectors, a cookwala dryrun CLI, SDKs in 13 languages, a reference hub, ROS 2 interfaces, and profiles for humanitarian food work and household context. The Humanitarian Profile is the most concrete piece — surplus food to plate, works over SMS on basic phones, no personal data by design.

Does it make sense?

Yes, the technical proposition makes sense. It's basically industrial safety-interlock thinking applied to cooking: verify the plan, enforce limits locally on the device, keep a signed audit trail. The separation is right — a small normative core plus optional profiles, so humanitarian work or kitchen production doesn't bloat the core.

And the honesty is exceptional. They label every number as measured or modelled, say outright there are 0 users, 0 pilots, 0 revenue, that the food-bank pilot is not yet funded, that no real device has cooked a recipe yet, and they publish their own critiques and kill rules. That makes me trust the rest more, not less.

The risks are where you'd expect: it's all software verification so far. The safety chain assumes honest, calibrated sensors — a lying thermometer defeats every envelope. The 57 operation safety envelopes are still awaiting professional food-scientist review, yet the spec calls itself "normative." And there's no real device yet, which is the hardest part. They know all this and say so, but it's still the gap.

The scope is ambitious to a fault — recipes, robots, hunger, health, supply signals, federation — but the architecture holds together. The real risk is resourcing: one founder, one repo, maintaining all of it.

What I'd improve or change

On messaging and UX:

Lead with the best line on the site. Buried halfway down is: "Robots are learning to move. Nobody had written down how to cook." That should be the hero, not "Core 0.2 · normative, under review." The current hero speaks only to standards engineers.

Give each visitor one path. Device makers, developers, food banks, and investors all land on the same jargon-heavy page with no primary call to action. Four visible cards right under the hero — each with one sentence and one action ("Ship recipes that can't violate your hardware limits" → conformance guide; "Run donated-food programs with auditable safety" → pilot contact) — would fix the "what do I do next?" problem.

De-jargon with layers, not dumbing down. Envelopes, sensor ladders, dryrun, conformance vectors, cw.op.deep_fry — fine for engineers, a wall for everyone else. Keep the precision but add plain-English glosses on first mention and replace the homepage JSON block with a simple diagram: recipe step → safe band → sensor check → pass/refuse.

Turn honesty into momentum. Keep the candor, it's the brand — but pair each "not yet funded" with the path forward and a contact. The "What exists today" section even rendered empty in my fetch; those counted stats (106 vectors, 13 SDK languages, 1,881 imported recipes) should be server-rendered as a proof strip.

State the positioning explicitly. The differentiation is real but never said: Schema.org describes recipes for search, LeRobot records what a robot did, HACCP is procedures for humans — none is a machine-enforced safety contract. One small comparison block would preempt every "why not just use X?" objection.

On technical credibility, in priority order:

Get the envelopes and rule packs professionally reviewed before "normative" carries safety weight. This is already on their roadmap as "planned" — it should be the gating milestone.
Add a sensor-trust model to Core. Calibration records, plausibility cross-checks between sensors, fault states as ladder inputs. Right now it's "safe assuming perfect sensing."
Prove the loop on one real device before expanding profiles. Even a single instrumented oven closing the loop on video would do more than another profile. Their own kill rules point this way — narrowing to the Humanitarian Profile plus recipe format if no device maker materializes.

Bottom line: this is a serious, unusually well-thought-out standards project with a sound core abstraction and rare intellectual honesty. What's missing is translation — of the value into a hero a non-engineer gets in 10 seconds, of the honesty into a visible path to deployment, and of the software-complete spec into one real, physical, boringly safe device.