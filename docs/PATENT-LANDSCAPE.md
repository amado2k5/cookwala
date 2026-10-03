# Patent landscape (preliminary)

Prepared 2026-10-03 as a starting point for patent counsel. **This is not a legal opinion
and not a freedom-to-operate (FTO) clearance.** It comes from a web search of Google
Patents and USPTO listings. It is US-focused, uses Google Patents' legal-status data
(not authoritative), and the full claim text was read only where quoted. China, Europe,
Japan, Korea and pending applications were not searched systematically.

**Conclusion:** Cookwala must not be treated as free of patent concerns. Risk is low for
publishing the specification, schemas, vocabularies and recipe data. It is higher for
software that **executes** cooking: the reference hub (orchestration of robots and
appliances), appliance control, automatic ordering, and inventory-based matching. Get an
FTO opinion before releasing those components.

## 1. Patents to review

| # | Patent | Owner | Status (Google Patents, 2026-10-03) | Overlap with Cookwala |
|---|---|---|---|---|
| 1 | [US8145854B1](https://patents.google.com/patent/US8145854B1/en): Method and apparatus for controlling automated food preparation systems | Rusty Shawn Lee (individual) | Active, expires 2031-01-25; maintenance fees paid 2019 and 2023 | **Highest priority.** See claim 1 below. Close to the hub (hub.openapi.yaml, INTEROP §2). The spec also describes a machine-independent "Recipe Interchange Format" (mix, bake, stir, heat, put, cool, assign) |
| 2 | [US10092129B2](https://patents.google.com/patent/US10092129B2/en): Automated cooking control via enhanced cooking equipment | Meyer Intellectual Properties Ltd (Hestan Cue) | Active, expires 2036-01-18 | Recipes in a markup language driving smart cooking devices; coordinating tasks; sensors; restricting operation by user proximity / credentials. Overlaps the hub, appliance bindings, presence rules. **Claim text not yet read** (PDF: patentimages.storage.googleapis.com/7b/4a/21/3fc53231da4652/US10092129.pdf) |
| 3 | [US9165320B1](https://patents.google.com/patent/US9165320B1/en): Automatic item selection and ordering based on recipe | Amazon Technologies Inc | Active, expires 2033-02-21 | Recipe → marketplace catalog items selected by preferences (budget, dietary) → cart or **purchase without explicit confirmation**. Overlaps OrderIntent + standing rules (order.schema.json, INTEROP §8) |
| 4 | [US10518409B2](https://patents.google.com/patent/US10518409B2/en) + continuations US11707837B2, US11738455B2, US12257711B2 | MBL Ltd (Moley Robotics) | Active, expires 2038-07-03 (continuations: check) | Robotic manipulation using electronic minimanipulation libraries in an instrumented kitchen. Mainly affects robot makers; check the `skill` field and any library of motion primitives |
| 5 | [US11117253B2](https://patents.google.com/patent/US11117253B2/en): Food preparation in a robotic cooking kitchen | MBL Ltd | **Expired, fee related** | Chef-motion recording → replication. Cookwala does not record chef motion (keep it that way) |
| 6 | [US12167817B2](https://patents.google.com/patent/US12167817B2/en): Systems and methods for automated cooking | Nala Robotics Inc | Active, expires 2042-03-21 | Robot identifies recipe for a customer order, computes ingredient quantities, retrieves and places them, cooks. Relevant to robot makers and to any reference executor with dispensers |
| 7 | US10264916B2 (pub. [US20170354294A1](https://patents.google.com/patent/US20170354294A1/en)): Recipe driven kitchen automation | Vinay Shivaiah (individual) | Active | Apparatus with master, storage, cleaning, manipulator and heater controllers. Hardware-specific; lower risk for a data standard |
| 8 | [US9965798B1](https://patents.google.com/patent/US9965798B1/en): Self-shopping refrigerator; [US20140095479A1](https://patents.google.com/patent/US20140095479A1/en): recipe recommendation and ingredient management; [US6204763B1](https://patents.google.com/patent/US6204763B1/en): automatic replenishment with intelligent refrigerator; plus many Samsung/LG/GE filings | Various | Mixed (check each) | Inventory-based recipe suggestions and reordering. Overlaps inventory.schema.json, `/v1/match` with inventory, expiry suggestions |
| 9 | "Graphical user interface system" family: [10936163](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10936163), [11372523](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11372523), [11861145](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11861145), [12248656](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12248656), [12405708](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12405708) | Not identified | Active | UI filters for halal/kosher/allergen dietary restrictions. Relevant to app UIs and search filters |
| 10 | [US12011116](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12011116): Device control system … for recipe | Not identified | Granted | Device control from recipe data. Not yet reviewed |
| 11 | Temperature probe systems: [11422037](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11422037), [11650105](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11650105), [12135244](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12135244) | Not identified | Granted | Probe-driven cooking. Relevant to CCP monitoring by devices |

### US8145854B1, claim 1 (verbatim)

> A method for controlling one or more automated food preparation systems, the method
> comprising the steps of: parsing one or more commands in a recipe by automatically
> extracting a list of ingredients and one or more measurements for the ingredients required
> for the recipe; automatically determining one or more pieces of equipment needed to fulfill
> the one or more commands; automatically generating one or more sequences of instructions
> for the one or more automated food preparation systems to control the one or more pieces of
> equipment; automatically transmitting the one or more sequences of instructions to the one
> or more automated food preparation systems; monitoring the execution of the one or more
> sequences of instructions on the one or more automated food preparation systems; and
> automatically creating any additional instructions necessary to ensure proper execution of
> the one or more sequences of instructions on the one or more automated food preparation
> systems.

Questions for counsel: does a hub that reads a pre-structured Cookwala document (equipment
and quantities already declared) "parse" and "determine equipment"? Does dispatching tasks
to executors that translate them into device commands count as "generating sequences of
instructions … to control equipment"? Are retries/reassignment "creating additional
instructions"? Is there invalidating prior art before June 2006?

## 2. Helpful prior art (publicly disclosed earlier)

- [WO2014131205A1](https://patents.google.com/patent/WO2014131205A1/en) (2014): programmable smart cooking machine with XML recipe programs.
- [US20030139843A1](https://patents.google.com/patent/US20030139843A1/en) (2003): automated cooking driven by machine-readable indicia + cooking programs.
- [US8344294B2](https://patents.google.com/patent/US8344294): cooking according to a C-value (sensor-driven doneness).
- [US20140170275A1](https://patents.google.com/patent/US20140170275): system for automating cooking steps.
- HACCP (decades old), the FDA Food Code, schema.org Recipe (2011+), CloudEvents, MQTT, Matter.
- Academic: PDDL/LTL recipe planning, food-state recognition (see RESEARCH.md).

## 3. Risk by component (non-legal assessment)

| Component | Risk | Notes |
|---|---|---|
| Specification, schemas, vocabularies, API definitions | Low | Data formats rarely infringe method/apparatus claims on their own |
| Public index (static data, search, filters) | Low–moderate | Search/dietary filtering is a crowded area (#9) |
| Reference hub (orchestration, dispatch, monitoring, retries) | **Higher** | #1, #2 |
| Appliance bridges (Matter etc.) | Moderate | #2, #10 |
| Auto-ordering, standing rules | **Higher** | #3 |
| Inventory matching, expiry suggestions | Moderate | #8 |
| Robot executors / motion skills | Device makers' concern | #4, #6, #7 |

## 4. Recommended actions

1. **FTO opinion** from a patent attorney before releasing the reference hub, appliance
   bridges, commerce adapter or inventory matching. Include non-US jurisdictions (CN, EP,
   JP, KR) and pending applications. Chinese cooking-robot filings are numerous.
2. **Release in risk order:** spec + schemas + vocab + index + recipe data first; hold
   back execution and commerce components until cleared.
3. **Design choices that lower risk** (confirm with counsel):
   - Human approval by default for every order; no purchase without confirmation unless
     counsel clears standing rules.
   - Leave catalog matching and checkout to the merchant (UCP/ACP side).
   - Keep device-command generation inside vendors' own executors; the hub dispatches
     declarative tasks only.
   - Never record or replay human motion; keep `skill` as an opaque vendor reference.
4. **Defensive publication:** publish the spec with dated releases (git tags, GitHub
   releases), and consider a defensive publication service (e.g. Technical Disclosure
   Commons) so later filings can't claim these ideas.
5. **Network protection:** ask counsel about joining LOT Network (protection from
   patents transferred to non-practicing entities) and whether filing defensive patents
   makes sense, given the [patent pledge](../PATENTS.md).
6. **Re-check statuses** before decisions. Maintenance-fee lapses and expirations change
   over time.

## 5. Scope of this search

Queries covered robotic kitchens and motion libraries, machine-readable recipes driving
appliances, sensor/vision doneness in recipe execution, multi-appliance and robot
orchestration, fridge inventory with recipe recommendation and ordering, and dietary
filtering. Sources: Google Patents, USPTO PDF links and freepatentsonline listings found via
web search on 2026-10-03.
