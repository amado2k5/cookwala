<p align="center"><img src="site/assets/logo.svg" width="320" alt="Cookwala"></p>

# Cookwala

**The open standard for cooking safely: people, kitchens and robots.**

A Cookwala recipe says three things a machine can check: **what to make**, **when it's done**,
and **what must never happen**. Devices dry-run a recipe before heating anything and refuse rather
than guess; safety limits are enforced on the device and cannot be raised by any recipe, agent or
message; records are hashed and signed; AI agents act only under a signed mandate and treat all
text as data. A Humanitarian Profile lets food banks rescue surplus food safely by SMS and
spreadsheet, with no personal data. A Household Context Profile keeps a home's facts at home.

**Mission:** help end hunger, make people healthier, and put robots to work for people.
Hunger has many causes; Cookwala's part is real and partial: less waste, safer rescue, cheaper
and healthier meals, machines that can feed people who cannot cook for themselves, and food
organizations acting as one network. Evidence, with labels, is in [docs/IMPACT.md](docs/IMPACT.md).

Cookwala started as "the world's first and largest robot cooking recipes index and CLI", from
one family's Egyptian recipes on fifi.cooking. The index and the CLI are here; "first" and "largest" were the original ambition, not claims;
not a claim. Everything is open, royalty-free, model-neutral and device-neutral.

**Status:** Core 0.2 is a draft under public review; everything else is a draft or experimental
profile. Live at [cookwala.ai](https://cookwala.ai). Nothing is deployed in the field yet.

### v0.2.0 Feature Status

| Feature | Status | Note |
|---------|--------|------|
| Recipe format & schemas | ✅ Shipping | 2,266 recipes, 29 languages each |
| Dry-run (device compatibility) | ✅ Shipping | Python & TypeScript SDKs produce identical results |
| Temperature envelope validation | ✅ Shipping | Safety limits enforced on device |
| Python SDK | ✅ Shipping | CLI + library (all Core operations) |
| TypeScript SDK | ✅ Shipping | MCP server + library (all Core operations) |
| Allergen data | ⚠️ 86% | 282 recipes missing allergen info (need 90%) |
| MCP server `@cookwala/mcp` | ✅ Published | 0.2.0 on npm (`npx -y @cookwala/mcp`), listed in the MCP Registry as `ai.cookwala/cookwala`; 24 read-only tools (16 in 0.2.0, 24 from 0.3.0), [try it in five minutes](docs/MCP-TRY-IT.md); optional token-protected hosted endpoint `mcp.cookwala.ai/mcp` for mcprush tracking; open [recipe REST API](docs/REST-API.md) at `mcp.cookwala.ai/api` |
| Search endpoint | ⏳ Blocked | Documented in OpenAPI, edge worker not deployed |
| Humanitarian Profile | 🔧 Draft | SMS parsing & relief mode working |
| Certifications (RFC-0010: halal, kosher, vegetarian, ...) | 🔧 Partial | Verify, issue and revoke in the CLI; `search --certified`; MCP tools; static `/v1/certifications`. Certifier registry not yet; example authorities are fictional |

## Start here

| You want to… | Go to |
|---|---|
| See it work in 2 minutes | [Live dry run](https://cookwala.ai/#demo) · `cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json` |
| Read the standard | [docs/CORE.md](docs/CORE.md) (normative) · [whitepaper](docs/WHITEPAPER.md) · [RFCs](rfcs/) |
| Browse 2,389 recipes, or use the SDK in your language | [Recipe index](https://cookwala.ai/recipes/) (9 at V1, 2,380 imported from fifi.cooking at V0 (22 cuisines), names in 29 languages, text in Arabic and English) · [SDK and 100 scenarios](https://cookwala.ai/scenarios/) in Python, TypeScript, JavaScript, Go, Rust, Java, Kotlin, C#, Swift, C++, Ruby, PHP and curl · [the site in six languages](https://cookwala.ai/fr/) (English and Arabic by hand; French, Spanish, German and Portuguese by machine, labelled) |
| Build a device, hub or agent | [Quickstart](docs/QUICKSTART.md) · [Robots, ROS 2, datasets](docs/ROBOTICS.md) · [reference hub](hub/) · [MCP server for AI agents](docs/MCP.md) (`npx -y @cookwala/mcp`, [connect Claude, Codex, Copilot, Cursor, Windsurf, Devin, Antigravity](docs/AI-AGENTS.md)) · [Python](sdk/python/) · [TypeScript](sdk/typescript/) · [conformance](conformance/) |
| Start from working sample code | [Samples](samples/): clients, agents, orchestrators, gates, recovery and reporting in Python, JavaScript, Java and C#, on simulated devices or a hub · packaged for pip, npm, Maven, Gradle, NuGet, Homebrew, Chocolatey, Scoop, apt, RPM, pacman, conda, snap, OCI and Artifactory, and as functions on Azure, AWS, Google Cloud and OpenShift ([status](samples/DISTRIBUTION.md): published on PyPI, npm, Maven Central, NuGet, Homebrew and GHCR; the other channels are prepared, not yet submitted) |
| Rescue food with phones and spreadsheets | [Humanitarian Profile 0.2](docs/HUMANITARIAN-PROFILE.md) · [four worked flows](examples/humanitarian/flows/) · [pilot protocol](docs/humanitarian/PILOT-PROTOCOL.md) · [concept note](docs/humanitarian/CONCEPT-NOTE.md) |
| Review nutrition and food-safety rules | [rule packs](profiles/humanitarian/) · [review template](docs/health/REVIEW-TEMPLATE.md) · [claims policy](docs/health/CLAIMS-POLICY.md) |
| Understand what a household robot may know | [Household Context Profile](docs/HOUSEHOLD-CONTEXT.md) · [facet registry](vocab/facets.json) · [RFC-0001](rfcs/0001-household-context-profile.md) |
| Publish or find things | [Registry and directory](docs/REGISTRY.md) · [federation](docs/FEDERATION.md) · [certification path](docs/CERTIFICATION.md) |
| Add a recipe | [Open to anyone](docs/CONTRIBUTE-RECIPES.md): by pull request, by GitHub issue (no git needed) or by API (RFC-0013) |
| Teach, research, legislate, think | [lesson kit](docs/education/LESSON-KIT.md) · [research topics](docs/education/RESEARCH-TOPICS.md) · [policy brief](docs/policy/BRIEF.md) · [model language](docs/policy/MODEL-LANGUAGE.md) · [essays](docs/essays/) |
| Play the simulators | [home](https://cookwala.ai/sim/) · [city](https://cookwala.ai/sim/city/) · [country](https://cookwala.ai/sim/country/) · [world](https://cookwala.ai/sim/world/) (illustrative models, not forecasts) |
| See every stakeholder's path | [docs/STAKEHOLDERS.md](docs/STAKEHOLDERS.md) · [messaging rules](docs/MESSAGING.md) · [roadmap](docs/ROADMAP.md) |
| Read the hard questions | [critiques](docs/CRITIQUES.md) · [action plan](docs/ACTION-PLAN.md) · [backstory and gaps](docs/research/BACKSTORY.md) |
| Everything else | [strategy](docs/STRATEGY.md) · [protocol and Missions (experimental)](docs/PROTOCOL.md) · [kitchens and fleets](docs/KITCHENS-AND-FLEETS.md) · [supply signals](docs/SUPPLY-SIGNALS.md) · [prior art](docs/PRIOR-ART.md) · [patent landscape](docs/PATENT-LANDSCAPE.md) · [governance](GOVERNANCE.md) · [security](SECURITY.md) · [contributing](CONTRIBUTING.md) |

## Checks

```bash
python -m venv .venv && .venv/bin/pip install jsonschema pyyaml graphql-core cryptography
.venv/bin/python tools/validate_specs.py      # schemas, examples, vocabularies, facet registry, APIs
.venv/bin/python tools/run_conformance.py     # 137 vectors (Core and profiles); --report writes a ConformanceReport
.venv/bin/pip install -e sdk/python           # the `cookwala` command used in the table above
node sim/run.mjs                              # the four simulators
bash tools/build_site.sh _site                # the website
```

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

## Backlog

Proposed changes, ideas from outside feedback and open questions, with an id per item for anyone to
pick up or argue with: [BACKLOG.md](BACKLOG.md).

## Licenses

- Schemas, tools, SDKs, reference implementations: [Apache-2.0](LICENSE)
- Specification text and docs: [CC BY 4.0](LICENSE-CC-BY-4.0) for reuse of the text; participation, contributions and patent terms under the [Community Specification License 1.0](LICENSE-SPEC.md) ([SCOPE.md](SCOPE.md), [NOTICES.md](NOTICES.md), [contributor agreement](CONTRIBUTOR-LICENSE-AGREEMENT.md))
- Vocabularies, bindings, policy packs: [CC0 1.0](LICENSE-CC0)
- Recipe data: CC BY 4.0 where marked in each document's `license` field; collections whose rights are not yet confirmed carry `LicenseRef-source-credited` and publish structured facts only ([LICENSES/LicenseRef-source-credited.md](LICENSES/LicenseRef-source-credited.md))
- Patent pledge: [PATENTS.md](PATENTS.md)

Cookwala is started and operated by [fifi.cooking](https://fifi.cooking). fifi.cooking is open source too (MIT License): a static React, TypeScript, Vite and Tailwind CSS site on GitHub Pages, with native apps for Android, iPhone and iPad, Apple TV, Fire TV and Samsung TV that read its open JSON files. [How it is built](https://fifi.cooking/?page=technology). Cookwala data is
provided without warranty. Device makers and operators are responsible for safe
execution and for complying with local law.
