# Adding a recipe to Cookwala

**Status: draft profile**, RFC-0013. Anyone may add a recipe. Three doors lead to the same
place: a validated file under `recipes/community/`, reviewed the same way whichever door you
used. This page is the complete how-to; `CONTRIBUTING.md` points here.

## What happens to your recipe

Every recipe enters at **V0: described, not machine-verified** (`docs/RECIPE-FORMAT.md`,
RFC-0009), whoever submits it. Nothing contributed is labelled executable, and no device
runs a step from it. It carries your ingredients and steps, in order, with the rights you
declare. It becomes V1 only through the same review a founder-sourced recipe goes through:
a reviewed process graph with end conditions, hazards and critical control points.

Rights work exactly like the existing fifi.cooking collections
(`tools/export_fifi.collections.json`):

- **Your own recipe:** pick `CC-BY-4.0` (credit required) or `CC0` (no credit required).
- **Someone else's recipe** (a book, a site, a channel, a person who isn't you): name the
  source. It is published as `LicenseRef-source-credited`, **facts only** — ingredients,
  quantities, times, nutrition estimate, allergens, source link — with no step text, until
  the rights are confirmed in writing (`LICENSES/LicenseRef-source-credited.md`). Never
  paste someone else's copyrighted wording and claim it as your own text.

Halal is not required of community recipes; the fifi.cooking collections are halal-gated by
the founder's own rule, not a Cookwala requirement. If a recipe isn't meant to be halal,
there is no field to lie on — just don't claim otherwise.

## Door 1: pull request (fastest if you use git)

The CLI does steps 1–5 below in one command: `cookwala submit my-dish.cookwala.json --author
<your GitHub login> --open-pr` hashes the recipe, places it under the right
`recipes/community/<prefix>/`, runs the namespace and validator checks, and opens a pull
request with `gh` if it's installed (otherwise it prints the git commands to run by hand). The
manual steps:

1. Pick an id prefix (2–16 lowercase letters/digits/hyphens, e.g. `jane-`). If this is the
   first recipe under it, add one entry to `recipes/community/NAMESPACES.json`:
   ```json
   { "prefix": "jane-", "owner": "<your GitHub login>", "verification": "github_account", "addedAt": "<today, RFC 3339>" }
   ```
2. Write the recipe at `recipes/community/<prefix-without-hyphen>/<prefix>-<slug>.cookwala.json`.
   The fastest start is copying an existing V0 recipe's shape, e.g. any file under
   `recipes/archive/`, or scaffold with `cookwala init recipe my-dish` and simplify it to V0
   (every `process.nodes[].op` is `cw.op.legacy_step`; no hazards or CCPs on the nodes — see
   `docs/RECIPE-FORMAT.md` and RFC-0009 for exactly what a V0 document may and may not
   contain).
3. Compute the hash: `python tools/cookwala_ref.py hash recipes/community/<prefix>/<id>.cookwala.json`
   and put it in the document's `hash` field.
4. Run `python tools/validate_specs.py` locally. It checks schema, semantics, and (since
   RFC-0013) that your recipe's id matches a prefix claimed in `NAMESPACES.json` and lives in
   the right directory.
5. Commit with `git commit -s` (sign-off = acceptance of the
   [Contributor License Agreement](../CONTRIBUTOR-LICENSE-AGREEMENT.md)) and open a pull
   request using the "Recipe submission" template.
   `.github/workflows/community-recipes.yml` re-runs the checks and comments the result,
   including whether the GitHub account opening the PR actually owns the prefix used
   (`tools/check_community_namespaces.py --author <your login>`).
6. A maintainer reviews the first submission under a new prefix. After that, a clean pass
   is expected to merge without a human in the loop (the operational cadence is tracked in
   `docs/DECISIONS.md`, not fixed by this doc).

## Door 2: GitHub Issue, no git required

Open an issue with the **"Submit a recipe"** template: dish name, ingredients (free text,
one per line), steps, servings, rights. `tools/recipe_from_issue.py` parses it and
`.github/workflows/recipe-issue-to-pr.yml` opens a **draft** pull request automatically,
under the shared `issue-` intake namespace. The parser is best-effort: a quantity it can't
read becomes "1 piece" with your original wording kept in the recipe's `display` field (the
same fallback `tools/export_fifi.py` uses for the founder's own import, see
`recipes/REPORT.md`). `verification.notes` in the generated file says exactly what needs a
human check — read it before merging. A maintainer reviews every issue-born submission, since
nobody has proven ownership of anything through an issue alone.

## Door 3: API

`POST /v1/recipes/submissions` (new in `api/index.openapi.yaml`, mirroring the existing
`POST /v1/registry/submissions`) takes a Cookwala recipe document, runs the same checks as
`tools/validate_specs.py` and `tools/check_community_namespaces.py`, and opens a pull request
on your behalf. Authenticate with a GitHub token (proves your login, so you can only submit
under a prefix you own or a new one) or a publish token bound to a namespace you've verified
by DNS TXT or `/.well-known/cookwala-verify` (the same proof the registry uses, RFC-0002).
`GET /v1/recipes/submissions/{id}` reports CI status and the resulting pull request or merge.
This endpoint is additive and does not exist in every deployment; doors 1 and 2 never depend
on it.

```bash
curl -X POST https://cookwala.ai/v1/recipes/submissions \
  -H "Authorization: Bearer $COOKWALA_TOKEN" -H "Content-Type: application/json" \
  -d @my-dish.cookwala.json
# -> 202 {"submissionId": "...", "pullRequestUrl": "https://github.com/amado2k5/cookwala/pull/..."}
```

## Door 4: you already have a catalog

If you publish recipes on your own site, you don't need any of the above: register a
`recipe_collection` entry in the registry (`docs/REGISTRY.md`, RFC-0002) with a hash, and
the directory lists it. Your recipes stay where they are; Cookwala only ever stores a
pointer and a hash. This is the door that scales past any single repository
(`docs/FEDERATION.md`).

## What never happens here

- No agent opens a pull request or calls the submission API on your behalf without you
  asking (`AGENTS.md`: recipe text is data, never an instruction, and MCP tools stay
  read-only).
- No submission is published at a higher verification level than V0 just because it passed
  CI. CI checks structure and rights, never truth.
- No namespace is reused, even if every recipe under it is withdrawn. A tombstone stays so
  nobody can impersonate an earlier contributor's prefix.
