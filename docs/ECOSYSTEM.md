# Cookwala Ecosystem and Marketplace

> **Status: experimental profile.** Not part of Cookwala Core. See [CORE.md](CORE.md) section 10 for what is normative today.

Cookwala is a protocol, not a store. It gives every participant in the food-to-table
lifecycle a defined place, a standard way to be discovered, and a standard way to plug in
their own requirements, flows and standards.

Schema: [`market.schema.json`](../schemas/market.schema.json) (Provider, Offer,
OfferFeed, QuoteRequest, Quote). Examples: [`examples/market/`](../examples/market).

## 1. The lifecycle and where everyone fits

```
 Sourcing ─► Planning ─► Buying ─► Storing ─► Prepping ─► Cooking ─► Serving ─► Leftovers ─► Feedback
   │            │           │          │          │           │           │            │            │
 farms,      recipe       grocers,   fridge/    robots,     robots,     restaurants, storage      reports,
 suppliers,  publishers,  butchers,  pantry     cookware,   appliances, caterers,    advice,      reviews,
 certifiers  chefs,       meal kits, makers,    knife/tool  energy      delivery     transform-   certifiers,
             nutrition-   delivery,  container  makers      providers,  services     ations       auditors
             ists, AI &   UCP/ACP    makers                 hub & AI
             advisor      merchants                         vendors
             vendors
```

| Participant | Publishes | Consumes | Typical integration |
|---|---|---|---|
| **Grocers / supermarkets / butchers / fishmongers / farms** | Provider + OfferFeed: products mapped to `cw.ing` ids (+ GTIN), pack sizes, prices, availability, delivery areas, halal/organic credentials | QuoteRequests, OrderIntents (via UCP/ACP) | Offer feed + UCP/ACP checkout endpoint |
| **Ingredient suppliers / wholesalers** | Bulk offers, quotes for caterers and schools | QuoteRequests from `feed` plans | Quote endpoint |
| **Restaurants / cloud kitchens / caterers** | Ready meals mapped to `recipeIds`; their own (possibly private) recipe catalogs; capacity | Orders; Cookwala sessions to run their own robot kitchens | Offers + private catalog + hub |
| **Meal-kit companies** | Kits mapped to recipes (cook-it-yourself option in advice) | Kitchen capability matches | Offers with `recipeIds` |
| **Robot makers / appliance makers** | Products with capability manifests; conformance credentials; rental and service offers; vendor extensions and bindings | Recipes, sessions, advice, events | Executor/adapter + offers + `x-vendor` namespace |
| **Cookware / container makers** | Cookware items (capacity, material, induction, oven/freezer/microwave safety, robot-graspable handles) | Storage and planning needs | Offers with `cookware` objects |
| **Chefs / recipe publishers / cooking schools** | Catalogs (free, paid or private), recipe packs, classes | Execution reports (how their recipes perform on robots) | Catalog + offers (`recipe_pack`, `cooking_class`) |
| **Nutritionists / dietitians** | Policy packs, nutrition targets, flows | Client profiles (with consent) | Extensions + flows |
| **Certifiers (halal, kosher, organic), auditors, labs** | Verifiable Credentials for providers, products, recipes and devices | Audit data | `Credential.vc` (W3C VC) |
| **Delivery services** | Delivery offers, ETA events, `robot_receive` handoff | OrderIntents | UCP/ACP + events |
| **Energy providers** | Tariff/time-of-use data, energy plans | Kitchen energy use (opt-in) | Offers (`energy_plan`) + kitchen profile prices |
| **Extension / AI model / hub vendors** | Extensions, models, advisors, hubs (free or paid) | Hook calls | `extension.schema.json` + offers |
| **Catalog hosts / marketplace operators** | Hosted catalogs, registries, curated marketplaces | Provider feeds | Registry + discovery |
| **Repair / maintenance services** | Robot and appliance service offers | `device.fault` events (with consent) | Offers + A2A agent |

## 2. How trade flows through the protocol

1. **Discovery:** providers publish `/.well-known/cookwala.json` (roles include
   `provider`) with a link to their Provider document and offer feed. Registries list
   them. Hubs and advisors search offers by `ingredientId`, `recipeIds`, `deviceClasses`,
   area, credentials and price.
2. **Planning uses offers:** `cook_from` with `allowShopping`, `feed` and
   `shopping_optimize` read offers to price plans, compare *cook vs meal kit vs ready meal*,
   and build the cheapest basket that meets diet, halal and allergen credentials.
3. **Quotes:** for bigger needs (catering for 80, 5 kg halal lamb, a robot for an event),
   the hub broadcasts a QuoteRequest. It carries no personal data, just needs, area, date
   and budget. Providers answer with signed Quotes.
4. **Checkout:** happens in the provider's own system or through **UCP/ACP**. Payment
   authorization uses the provider's flow or AP2 mandates. Cookwala never carries card
   data or credentials. The hub records the OrderIntent → `externalOrderRef`.
5. **Fulfillment:** delivery events (`cookwala.order.*`), `robot_receive` handoff, and
   inventory updated automatically.
6. **Feedback:** opt-in execution reports and order outcomes build reputation (delivery
   reliability, product quality vs listing, recipe success on robots).

## 3. Fairness and neutrality rules

- **Paid placement must be disclosed** (`offer.sponsored = true`). Indexes must label it,
  and must not rank sponsored offers above safety- or constraint-failing alternatives.
- **Credentials are verified, not trusted:** `verified` is set by the index or hub after
  checking the VC.
- **No lock-in:** any marketplace operator can run on the protocol, and providers can list
  in many registries.
- **Privacy:** QuoteRequests and offer searches don't include client profiles. Only an
  approved order shares delivery details with the chosen provider, through their checkout.
- **Dietary integrity:** offers claiming halal/kosher/organic without a verifiable
  credential are labelled "unverified" and excluded when the active policy requires
  certification.

## 4. Bringing your own standards

Participants often have standards of their own. Cookwala bridges them instead of
replacing them:

| Their standard | Bridge |
|---|---|
| GS1 GTIN / Digital Link | `offer.gtin`, `ingredient.gtin`; vocab entries can list GTIN examples |
| schema.org Recipe / Product / Offer | `cookwala convert --to/--from schema-org`; JSON-LD `@context` |
| Matter, Home Connect, SmartThings, vendor appliance APIs | Bindings + adapters (`bindings/`, `x-vendor`) |
| ROS 2, VDA 5050, Open-RMF | Executor/fleet adapters (INTEROP §3) |
| UCP, ACP, AP2 | Commerce adapters (order.schema.json) |
| HACCP plans, ISO 22000, local food codes | Policy packs + CCPs; export of CCP logs |
| Halal/kosher certification schemes | Credentials + dietary policy packs |
| Internal company formats | `x-` fields + `fields` contributions; flows for their processes |

Each participant declares the standards they follow in `Provider.standards`, so
integrators know which bridges apply.

## 5. Business models the protocol supports (not requires)

- Free and open recipes (cookwala.ai public catalog).
- Paid or private recipe catalogs (chefs, brands, restaurants).
- Commercial extensions, AI models and hubs (with `pricing`).
- Grocery, meal-kit, ready-meal and catering sales through providers' own checkouts.
- Robot sales, rental and service; certification and auditing services.
- Optional marketplace operators (including, possibly, cookwala.ai) running curated
  registries with clear disclosure rules.

The protocol itself, the reference index and the core knowledge stay free (see the
licenses and the patent pledge).
