# Policy brief: safe cooking machines and safe food donation

**For:** ministers and officials for food safety, consumer protection, digital policy and
social protection; legislators; standards bodies. **Length:** two pages. **Status:** draft,
2026-10-04. Cookwala is an open, royalty-free technical standard maintained in public; it is
not endorsed by any government or agency.

## The situation

1. Cooking machines are entering homes and commercial kitchens: countertop robots, smart
   ovens, and general-purpose robots whose makers say they will cook. Each maker writes its
   own recipes and decides alone what "done" and "safe" mean. Regulation covers appliances
   and software separately; nothing covers "a recipe a machine executes".
2. AI agents are beginning to plan meals, order groceries and start appliances for people.
   They can be instructed by text they read, including text planted in a recipe.
3. Food banks and school-meal programs rescue surplus food with phone calls and
   spreadsheets. Cold-chain checks and impact counts differ by site; data about the people
   served is sometimes collected without need.

## What an open standard offers

Cookwala Core 0.2 is a small standard that we estimate a device maker could implement in about a week (assumed; no maker has implemented it yet). It
defines:

- **Operation envelopes:** every heat operation has a physical temperature band and a
  ladder of ways to verify it; a device that cannot verify a step **refuses** before heating
  anything. No oil thermometer means no deep frying.
- **Safety limits enforced on the device**, which no recipe, agent, message or update can
  raise; a local stop that works without a network.
- **Signed, hashed records**: recipes, device capabilities, recalls and execution logs can be
  checked by anyone; keys can be revoked; event logs carry witnessed checkpoints.
- **Agent rules:** an agent acts only under a signed mandate with spending caps and a list
  of actions that need a person's confirmation; all text in recipes is data, never
  instructions.
- **Anonymous incident reporting**, modelled on aviation's confidential reporting, so every
  maker learns from each near miss.
- **A conformance suite** (106 public test vectors) and a report format behind any claim.

The **Humanitarian Profile** adds a data standard for food donation with **no personal
data**: organizations only, aggregate counts, temperature checks at every handover, and
nutrition and food-safety rules derived from WHO and Codex guidance, reviewable by
professionals and replaceable by national rules. It works by SMS and spreadsheet.

## What governments can do

| Action | Effort | Effect |
|---|---|---|
| Ask the national standards body to review Core 0.2 and comment publicly | weeks | A technical basis for guidance on cooking machines; complementary to ISO 13482 and IEC 60335, which it does not replace |
| Fund a 12-week pre-registered pilot with a school-meal or food-bank program | months | Evidence, published whatever it shows |
| Review the Humanitarian Profile's data-protection rules for food-donation programs (no personal data, aggregates, small-cell suppression); its rule packs are unreviewed drafts | months | Food rescue that protects the people it serves and produces comparable numbers |
| Reference "refusal before heat", on-device safety limits and incident reporting in guidance for connected cooking appliances, after independent review and two implementations | later | Makers have a concrete target; consumers get machines that refuse rather than guess |
| Use the model language (`MODEL-LANGUAGE.md`) for donor-protection and data clauses | at drafting | Clauses that match a working data standard |
| Run a national registry node and recall feed | months | Recalls of unsafe recipes and devices reach kitchens without depending on a foreign server |

## What this is not

Not a certification (the path to one is described; no certifier has been engaged). Not
medical advice. Not a product. Not a claim to end hunger: hunger is driven by poverty,
conflict, climate and prices, and this standard contributes through waste, safety and
coordination.

## Status and governance

Core 0.2 is a draft under public review; everything else is a draft or experimental profile.
Decisions are made in public on GitHub with written reasons; a steering committee with seats
for food banks, a low- or middle-income country, labour, privacy and dietetics takes over
once there are independent adopters; the specification moves to a neutral foundation with a
patent non-assertion pledge. Critiques are published with the responses
(`docs/CRITIQUES.md`).

## Where to look

cookwala.ai · `docs/CORE.md` · `docs/HUMANITARIAN-PROFILE.md` · `docs/CERTIFICATION.md` ·
`conformance/` · `GOVERNANCE.md`
