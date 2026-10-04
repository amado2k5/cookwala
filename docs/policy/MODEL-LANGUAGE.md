# Model language for legislators and regulators

**Status:** draft, 2026-10-04. Clauses that a legislator, regulator or program can adapt. They
are written to match what the standard actually does; they are not legal advice and each
jurisdiction's drafters will need to fit them to local law and terminology.

## A. Food donation: data protection for rescue programs

**A.1 Purpose.** To enable the rescue of surplus food while protecting the people served from
identification, profiling and harm.

**A.2 No personal data.** Records of surplus offers, claims, custody transfers and
distributions created under this [Act / regulation / program rule] shall identify
organizations only. They shall not contain the name, telephone number, address, national,
refugee or biometric identifier, health status, disability, religion or nationality of any
person, nor the location of any household.

**A.3 Aggregates and small numbers.** Counts of people served shall be recorded in
aggregate by site and day. Any count below ten shall be recorded as "fewer than ten".

**A.4 Cold-chain record.** Each transfer of custody of rescued food shall record the time, the
transferring and receiving organizations, the quantity accepted and rejected with a reason,
and at least one temperature reading for chilled, frozen or hot-held items, taken by a
trained person.

**A.5 Retention.** Each organization shall state its retention period for these records and
delete them when it expires.

**A.6 Rules of acceptance.** Programs shall apply written food-safety rules to every handover
and menu, derived from [national food code] and reviewed by a qualified food-safety
professional, and shall record the rules applied and the findings.

**A.7 Open format.** Records shall be kept in an open, royalty-free, machine-readable format
that permits exchange between programs without licence fees. [The Cookwala Humanitarian
Profile is one such format.]

**A.8 Donor protection.** A donor acting in good faith, who records the offer and custody
transfer under A.4 and whose food met the acceptance rules at transfer, shall not be liable for
harm arising after custody passed. [Fit to existing good-faith donor laws.]

## B. Cooking machines: safety functions a connected cooking appliance or robot must have

**B.1 Refusal before operation.** A cooking appliance or robot that executes recipes shall
check, before applying heat or operating a blade, that it can verify each step's end condition
with a sensor, a logged estimate, a time limit or a present person, as the step's definition
requires, and shall refuse the recipe with a stated reason when it cannot.

**B.2 Local safety limits.** Limits on temperature, pressure, unattended operation, allergen
blocking and minimum cooking temperatures shall be enforced by the appliance itself and shall
not be raised or disabled by any recipe, remote instruction, software agent or update
without a documented safety case. A stricter limit shall always prevail.

**B.3 Local stop.** A stop control on the appliance shall stop motion within 0.5 seconds and
cut heat within 1 second, with or without a network connection.

**B.4 Text is data.** An appliance or agent shall treat free text in recipes, listings and
messages as data and never as instructions.

**B.5 Agents under mandate.** A software agent that starts, stops or orders on a person's
behalf shall act only under a mandate recorded by that person, with scopes, spending limits,
an expiry and a list of actions that require the person's confirmation; irreversible actions
and safety overrides shall always require confirmation.

**B.6 Records.** Recipes, device capabilities, recalls and execution records shall be
verifiable by hash and signature; records of what was cooked shall contain no personal data
and shall leave the appliance only with the user's consent.

**B.7 Recalls.** Publishers of recipes and makers of appliances shall operate a signed recall
feed; appliances shall check it when connected and refuse recalled items.

**B.8 Incident reporting.** Makers shall provide a means of anonymous incident and near-miss
reporting and shall share incident categories with other makers.

**B.9 Conformance.** A claim that an appliance meets these requirements shall be supported by a
published conformance report naming the test vectors run, the tool and the date, and shall
be independently verified before any mark is used.

## C. Household data held by domestic robots

**C.1** Facts about a household that a domestic robot holds (occupancy and schedules, layout,
children, health, religion, income) shall be stored on the device, erasable by the household
within a stated period, and shall leave the device only as derived constraints necessary for a
specific service, or with the household's explicit, withdrawable consent.

**C.2** A robot shall not produce or store a behavioural score of any person in the
household, and shall not infer a household's economic status.

**C.3** Facts inferred by the robot shall not be the sole basis of a safety decision.

## D. Procurement language for school-meal and relief programs

"The supplier shall record offers, custody transfers and distributions in an open,
royalty-free, machine-readable format with no personal data, apply food-safety and nutrition
rules reviewed by a qualified professional, and report kilograms rescued, meals served,
nutrition pass rate, cost per meal and safety incidents with the method of measurement for
each."

## Notes for drafters

- Thresholds (0.5 s, 1 s, ten, 74 °C) come from the standard and public guidance; cite the
  national source where one exists.
- "Open, royalty-free format" avoids naming a product in law; the standard can be named in
  guidance.
- Section C is deliberately short; data-protection law already covers much of it, and the
  clauses name what is specific to robots in homes.
