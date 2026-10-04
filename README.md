# Cookwala

**The world's first and largest robot cooking recipes index and CLI.**

**Mission:** help end world hunger and make people healthier. See [docs/MISSION.md](docs/MISSION.md) and [docs/HEALTH.md](docs/HEALTH.md).

Cookwala is an open, royalty-free standard and a free public index of recipes that robots,
smart appliances and AI agents can execute safely, end to end, alone or together with
people and other machines.

- **Recipes a machine can run:** every step is a typed operation with parameters, an end
  condition it can measure (core temperature, a food-state cue, a time window) and a defined
  failure path.
- **Safety as data:** hazards, food-safety checkpoints (HACCP CCPs), allergens, supervision
  levels, abort procedures and kitchen-wide safety events.
- **Local rules:** policy packs for food-safety codes, dietary rules (e.g. halal), venues
  and households, evaluated before cooking.
- **Kitchen teamwork:** a local hub protocol coordinates robots, ovens, cooktops, fridges,
  sensors, alarms, people, AI agents, grocery delivery and notifications.
- **Every interface:** static JSON, REST, GraphQL, MQTT/WebSocket/SSE events, MCP, A2A and the
  `cookwala` CLI.
- **A reasoner, not just a database:** "what can I cook with this", "I over-salted it, fix it and
  resume", "rescue this meal", "store it for 3 days", "feed 40 people in 3 hours on $60",
  "three robots, who does what", "the right portion for each person", all returned as actions a
  robot can apply, behind a food-safety gate.
- **Operating modes:** gas, electric or induction; robot battery high, medium or low; save energy
  or make ingredients last a week; low or open budget.
- **Customizable in every way:** your own recipes, fields, rules, filters, AI models, agents and
  flows, in public or private catalogs hosted anywhere.
- **An ecosystem:** grocers, restaurants, robot and cookware makers, chefs, certifiers, delivery
  and food organizations all have a defined place.
- **Open to everyone:** no API keys, no membership, Apache-2.0 / CC BY 4.0 / CC0, with a
  patent non-assertion pledge.

Status: **draft v0.1**. Specs are here; tools and the live index come next (see the
roadmap).

## Start here

| | |
|---|---|
| **Try it: virtual kitchen simulator** | [cookwala.ai/sim](https://cookwala.ai/sim/) · [docs/SIMULATION.md](docs/SIMULATION.md) · [findings](docs/SIM-FINDINGS.md) |
| **Try it: country, one-year simulator** | [cookwala.ai/sim/country](https://cookwala.ai/sim/country/) · [docs/COUNTRY-SIMULATION.md](docs/COUNTRY-SIMULATION.md) |
| **Cookwala Core 0.2 (normative)** | The small core devices implement first: [docs/CORE.md](docs/CORE.md) · [api/core.openapi.yaml](api/core.openapi.yaml) · [conformance/](conformance) |
| **Action plan** | How Cookwala answers its critics, reviewers and partners: [docs/ACTION-PLAN.md](docs/ACTION-PLAN.md) |
| **Humanitarian Profile (draft)** | Personal-data-free food rescue for food banks and kitchens: [docs/HUMANITARIAN-PROFILE.md](docs/HUMANITARIAN-PROFILE.md) |
| **Try it: world, five-year simulator** | [cookwala.ai/sim/world](https://cookwala.ai/sim/world/) · [docs/WORLD-SIMULATION.md](docs/WORLD-SIMULATION.md) |
| **Try it: two-city, one-month simulator** | [cookwala.ai/sim/city](https://cookwala.ai/sim/city/) · [docs/CITY-SIMULATION.md](docs/CITY-SIMULATION.md) |
| **The Cookwala Protocol: missions, context, swarm coordination** | [docs/PROTOCOL.md](docs/PROTOCOL.md) |
| Decisions, commitments, budgets, degraded operation | [docs/DECISIONS.md](docs/DECISIONS.md) |
| Recipe format (R1–R4 layers) | [docs/RECIPE-FORMAT.md](docs/RECIPE-FORMAT.md) |
| Prior art, parallels, novelty | [docs/PRIOR-ART.md](docs/PRIOR-ART.md) |
| Plan, principles, roadmap | [docs/PLAN.md](docs/PLAN.md) |
| Landscape research (universities, companies, governments) | [docs/RESEARCH.md](docs/RESEARCH.md) |
| How robots, appliances, humans and services work together | [docs/INTEROP.md](docs/INTEROP.md) |
| APIs (REST, GraphQL, events, MCP, A2A) | [docs/API.md](docs/API.md) |
| CLI | [docs/CLI.md](docs/CLI.md) |
| Mission (zero hunger) and health | [docs/MISSION.md](docs/MISSION.md), [docs/HEALTH.md](docs/HEALTH.md) |
| Reasoning (course-direct and course-correct) | [docs/REASONING.md](docs/REASONING.md) |
| Extensibility, federation, profiles | [docs/EXTENSIBILITY.md](docs/EXTENSIBILITY.md) |
| Ecosystem and marketplace | [docs/ECOSYSTEM.md](docs/ECOSYSTEM.md) |
| Full implementation plan | [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) |
| Knowledge packs | [knowledge/](knowledge) |
| Exporting fifi.cooking recipes | [docs/EXPORT-FIFI.md](docs/EXPORT-FIFI.md) |
| Patent landscape (preliminary, not legal advice) | [docs/PATENT-LANDSCAPE.md](docs/PATENT-LANDSCAPE.md) |
| JSON Schemas | [schemas/](schemas) |
| OpenAPI / GraphQL / AsyncAPI | [api/](api) |
| Operation vocabulary | [vocab/ops.json](vocab/ops.json) |
| Matter mapping | [bindings/matter.json](bindings/matter.json) |
| Examples (recipe, advice, profiles, extension, flow, market, relief) | [examples/](examples) |

## A recipe step, the Cookwala way

```json
{
  "id": "n11", "op": "cw.op.simmer", "inputs": ["eggs_in_wells"], "output": "shakshuka",
  "params": { "heat": "low", "lid": "on" },
  "until": { "all": [ { "vision": "cw.sense.egg_whites_set" },
                      { "sensor": "cw.sense.core_temp", "target": "egg_white", "gte": 63, "optional": true } ],
             "minTime": "PT5M", "maxTime": "PT10M" },
  "onTimeout": "ask_human", "ccp": "ccp_eggs", "hazards": ["hz_steam"], "attention": "monitor"
}
```

## Licenses

- Schemas, tools, SDKs, reference implementations: [Apache-2.0](LICENSE)
- Specification text and docs: [CC BY 4.0](LICENSE-CC-BY-4.0)
- Vocabularies, bindings, policy packs: [CC0 1.0](LICENSE-CC0)
- Recipe data: CC BY 4.0 where marked in each document's `license` field
- Patent pledge: [PATENTS.md](PATENTS.md)

Cookwala is started and operated by [fifi.cooking](https://fifi.cooking). Cookwala data is
provided without warranty. Device makers and operators are responsible for safe
execution and for complying with local law.
