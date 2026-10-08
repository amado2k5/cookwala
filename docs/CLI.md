# `cookwala` CLI

One binary for developers, robot makers, kitchens and recipe authors. Distributed as an
npm package (`npx cookwala`), a Python package (`pipx install cookwala`), Homebrew
(`brew install cookwala`) and a static Go/Rust binary for embedded Linux on robots. Output
is human-readable by default and `--json` for machines. Exit codes: `0` ok, `1` error,
`2` validation failure, `3` policy deny, `4` safety stop.

Global flags: `--index <url>` (default `https://cookwala.ai`), `--hub <url>`
(default discovered via mDNS `_cookwala._tcp`), `--lang <bcp47>`, `--json`, `--offline`
(use the local cache only), `--token <t>` / `COOKWALA_TOKEN`.

## Catalog (index)

```bash
cookwala search "couscous" --cuisine MA --exclude-allergens nuts --min-level V1
cookwala get fah-234                       # pretty view in --lang
cookwala get fah-234 --json > fah-234.cookwala.json
# The Python CLI (sdk/python) implements search, get and the cooklang/schema-org exports offline against the
# repository catalog: --cuisine, --course, --tag, --free-of nuts, --level V1, --limit, --json, and
# --certified halal --keys KEYS.json (only recipes whose exact revision holds a current, verified certification).
# Cooklang export omits hazards, CCPs and end conditions (Cooklang cannot carry them); never drive a device from it.
cookwala vocab ops                         # list operations
cookwala vocab show cw.op.simmer           # definition, params schema, sensors
cookwala policies list --jurisdiction SA
cookwala policies show us.fda-food-code-2022
cookwala sync [--full]                     # mirror manifest + changes (or full dump) into ~/.cookwala/cache
cookwala verify fah-234                    # signature + hash + recall check
```

## Authoring and validation

```bash
cookwala init recipe my-dish               # scaffold my-dish.cookwala.json
cookwala validate my-dish.cookwala.json    # JSON Schema + semantic checks:
                                           #  - every ingredient consumed exactly once
                                           #  - DAG acyclic, outputs used
                                           #  - every heat node has an until-condition and timeout path
                                           #  - CCPs present for meat/poultry/fish/eggs/rice/cooling
                                           #  - hazards present for frying/boiling/knives/pressure
                                           #  - op params valid against vocab/ops
cookwala lint my-dish.cookwala.json        # style: units, tolerances, text present in en+ar
cookwala hash my-dish.cookwala.json        # compute canonical hash
cookwala simulate my-dish.cookwala.json --scale 2 --kitchen kitchen.json
                                           # time/thermal dry run → Gantt, CCP coverage, lease conflicts
cookwala convert --from fifi /path/to/fifirecipes/public/data/recipes/fah-234.json
cookwala convert --from schema-org https://example.com/recipe.html   # V0 import
cookwala convert --to schema-org fah-234.cookwala.json               # back to schema.org JSON-LD
cookwala convert --to cooklang fah-234.cookwala.json
cookwala export cooklang fah-234 -o fah-234.cook     # same, by recipe id; --lang ar picks the text language
cookwala export schema-org fah-234                   # JSON-LD to stdout
cookwala sign my-dish.cookwala.json --key ~/.cookwala/keys/ed25519   # for index operators
cookwala submit my-dish.cookwala.json --author your-github-login [--open-pr]
                                           # add it to recipes/community/: hash, place, check
                                           # schema+semantics+namespace ownership, then open a
                                           # pull request (needs `gh`, --open-pr) or print the
                                           # commands to do it by hand (docs/CONTRIBUTE-RECIPES.md, RFC-0013)
```

### Certification (RFC-0010)

Implemented in the Python CLI (`sdk/python`). `--keys` is always required: it is the list of authority
KeyRecords you trust, and there is no default trust list. Exit codes: `0` ok, `1` nothing current or bad
input, `2` a certification failed verification.

```bash
# Readers: does this certification hold for the recipe I have?
cookwala verify-cert cert-halal-kofta-oven-2026-10.json --keys keys.json --subject kofta-oven.cookwala.json
cookwala verify-cert examples/certifications --keys conformance/keys/certification-test-keys.json --json

# Which certifications hold right now (newest per authority and scheme wins; older ones are superseded)
cookwala current-certs kofta-oven.cookwala.json --keys keys.json [--certs DIR_OR_FILE ...] [--scheme halal] [--authority did:web:...]

# Certifying authorities: issue and withdraw (Ed25519 seed file, 64 hex characters)
cookwala certify my-recipe.cookwala.json --scheme halal --authority did:web:authority.example \
    --key ~/.cookwala/keys/ed25519.seed --name "Authority name" --valid-until 2027-10-01T00:00:00Z -o cert.json
cookwala revoke-cert cert.json --key ~/.cookwala/keys/ed25519.seed --reason "ingredient source changed" -o cert.json
cookwala revoke-cert cert.json --key ~/.cookwala/keys/ed25519.seed --suspend -o cert.json
```

`certify` prints the public key for the seed; the authority publishes it as a KeyRecord at its `did:web`
so readers can verify. `current-certs` defaults `--certs` to `examples/certifications`, whose authorities
are fictional and sign with the public RFC 8032 test keys.

The catalog relays certifications at `https://cookwala.ai/v1/certifications/index.json` (all documents) and
`https://cookwala.ai/v1/certifications/{id}.json` (one). The site is static, so filter the list yourself.

Also: `cookwala search --certified halal --keys keys.json`, and the MCP tools `verify_certification` and
`current_certifications`. Still to come: certifier registration and key management. See [CERTIFICATION_IMPLEMENTATION_STATUS.md](../CERTIFICATION_IMPLEMENTATION_STATUS.md).

## Kitchen (hub)

```bash
cookwala hub discover                      # find hubs on the LAN
cookwala hub start [--config hub.yaml]     # run the reference hub
cookwala hub status
cookwala pair --manifest robot.json        # device pairing (shows a code to approve)
cookwala devices list
cookwala devices show robot:neo-1

cookwala can-cook --limit 20               # match: what this kitchen can cook now (uses inventory)
cookwala plan fah-234 --servings 4 --serve-at 19:30 --mode assisted
                                           # prints assignments, leases, human steps, policy result
cookwala session create fah-234 --servings 4 --serve-at 19:30
cookwala session confirm <id>              # interactive allergen/hazard acknowledgement (human)
cookwala session start <id>
cookwala session watch <id>                # live task/telemetry/CCP view (TUI)
cookwala session pause|resume|abort <id>
cookwala task input <taskId> --answer yes  # answer an input_required step
cookwala estop "smoke near hob"            # emergency stop (always allowed)

cookwala inventory show
cookwala inventory add cw.ing.egg_chicken_large 12pcs --storage fridge --expires 2026-10-20
cookwala inventory check fah-234 --servings 4
cookwala order create --from-session <id>  # OrderIntent, awaiting approval
cookwala order approve <id>                # human only; hands off to the configured UCP/ACP adapter

cookwala policy active
cookwala policy set us.fda-food-code-2022 dietary.halal household.default
cookwala policy eval fah-234

cookwala events tail --types cookwala.safety.,cookwala.task.
cookwala report submit <sessionId>         # anonymous execution report to the index (opt-in)
```

## Ask and course-correct (reasoner)

Every command below sends an `AdviceRequest` (to the hub if one is found, otherwise to the
index, statelessly) and prints ranked options with safety verdicts. `--apply <option>`
applies an option to the running session; `--json` prints the full `AdviceResponse`.

```bash
cookwala ask "I burnt the bottom of the rice, can I save dinner?"   # any language; routes to an intent
cookwala can-cook --with "chicken, rice, onions, yogurt" --servings 5 --missing 1 --use-first yogurt
cookwala can-cook --from-inventory --mode budget --max-time 45m
cookwala swap buttermilk --in add-112 --reason missing          # substitution keeping the ingredient's role
cookwala fix too_salty --session s-42 --node n7 --observed saltAddedG=15,saltExpectedG=5
cookwala fix left_out --minutes 190 --ambient 27                # → discard (safety gate) + alternatives
cookwala fix sauce_split --session s-42 --apply new_base        # apply the chosen option and resume
cookwala rescue --intermediate "mushy cooked rice 900g"         # repurpose into other dishes
cookwala adapt fah-234 --missing oven --have hob,microwave      # equipment adaptation
cookwala scale fah-234 --servings 13 | --limit "beef_minced=600g"
cookwala retime --session s-42 --guests-late 45m
cookwala diagnose --session s-42 --task t-7 --sensor oil_temp --expected 175 --observed 140
cookwala texture fah-234 --iddsi 5
cookwala store fah-234 --for 3d --not-cooked-yet --containers "glass 500ml x6"
cookwala feed --people 40 --within 3h --budget 60USD --energy gas --diners "30 adult, 10 child:peanuts"
cookwala feed --people 4 --meals 14 --horizon 7d --mode week_saver --include-storage
cookwala personalize --members p1,p2,p3 --recipe ec-160 --optimize nutrition_fit,waste,cost   # hub only (private data)
cookwala shop --plan <responseId> --cheapest --require organic,halal_certified
```

## Teams of robots (and people)

```bash
cookwala team plan fah-234 --helpers robot:arm-1,robot:cooker-1 --serve-at 19:30 --objective on_time
cookwala team cfp --session s-42 --tasks n1,n2,n3 --window 5s   # broadcast a call for help, collect bids, award
cookwala team show --session s-42                                 # Gantt in the terminal
```

## Operating modes

```bash
cookwala mode show
cookwala mode set eco                                   # presets: normal eco budget fast quiet off_grid week_saver feast outage battery_saver relief
cookwala mode set --energy prefer=induction,gas --peak-limit 3500W --budget low:40USD/week
cookwala mode set --robot robot:neo-1=low:22% --reserve 15%
cookwala mode set --conserve ingredients=7d:stretch --protect beef_minced
```

## Profiles (clients, kitchens, cookware, robots, organizations)

```bash
cookwala profile add kitchen kitchen.json               # private by default
cookwala profile add cookware cookware.json
cookwala profile add client family.json --local-only    # sensitive: never leaves the hub
cookwala profile list | show <id> | rm <id>
```

## Extensions, flows, catalogs (customize everything)

```bash
cookwala ext search halal | install https://acme.example/cookwala/extension.json | enable x-acme | disable x-acme
cookwala ext init --kind filter --runtime wasm          # scaffold your own extension
cookwala flow install https://example.org/flows/weekly-budget.json --input people=4 --input budget=40
cookwala flow run flow-weekly-budget | flow init         # build your own flow
cookwala catalog init ./my-recipes --private            # host your own recipes anywhere
cookwala catalog add https://chef.example --trust <key> --priority 20
cookwala publish my-dish.cookwala.json --catalog ./my-recipes
cookwala registry submit --kind extension --url https://acme.example/cookwala/extension.json
```

## Market

```bash
cookwala market offers --ingredient cw.ing.lamb_shoulder --credential halal_certified --near 30.05,31.24
cookwala market providers --role robot_rental --country EG
cookwala market quote --need "catering 80 people 2026-11-20 halal" --budget 400USD
cookwala provider init --roles grocer,delivery         # publish your own Provider + offer feed
```

## Relief (feeding people who need it)

```bash
cookwala relief programs --country EG
cookwala relief needs --open --country EG
cookwala relief pledge --program prog-community-kitchens-cairo --surplus "tomatoes 120kg until 2026-11-04"
cookwala relief pledge --program ... --robot-capacity 180/h --hours 08:00-12:00
cookwala relief need --program ... --people 650 --window "2026-11-03 11:00-14:00" --diet halal --avoid peanuts   # coordinators
cookwala relief allocate --program ... --objective max_people_fed                                               # coordinators
cookwala relief impact --program ... --format hxl-csv
```

## Device makers

```bash
cookwala device init --kind robot          # scaffold capabilities.json + executor adapter (TS/Python/ROS 2)
cookwala device validate capabilities.json
cookwala conformance run --profile executor --target http://robot.local:8080
cookwala conformance run --profile hub --target https://cookwala-hub.local:7878
cookwala bridge matter --pair <code>       # add a Matter oven/cooktop/hood/fridge/alarm as an executor/sensor
```

## Config

`~/.cookwala/config.yaml`:

```yaml
index: https://cookwala.ai
lang: ar
hub: https://cookwala-hub.local:7878
policyPacks: [sa.sfda, dietary.halal, household.default]
cache: ~/.cookwala/cache
```
