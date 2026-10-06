# RFC-0013: Community recipe submissions

**Status:** proposed, 2026-10-06. **Kind:** draft profile formalized; one additive
definition in `catalog.schema.json`; two new tools; new CI; new API endpoints. **Safety
relevant:** indirectly (a bad recipe is V0 by rule and goes through the existing lifecycle,
never executed).

## Problem

Cookwala can be queried and used by anyone, but recipes themselves came from one source
(fifi.cooking, RFC-0009) through one pipeline the founder controls. There is no way for
someone outside that pipeline to add a recipe: no namespace to claim, no checklist, no CI
path, no API. "An open recipe directory" needs a door in, not just a door out, and it needs
one that does not let a contributor collide with another contributor's ids, claim rights
they do not have, or get a recipe labelled more verified than it is.

## Proposal

1. **`recipes/community/`** holds every community-submitted recipe, one subdirectory per
   claimed id prefix: `recipes/community/<prefix>/<id>.cookwala.json`, `id` starting with
   `<prefix>-`. The founder's own collections (`archive`, `chefteta`, `osool`, `abdennour`,
   `abuhaty`, `world`) are untouched and their prefixes become reserved.
2. **`recipes/community/NAMESPACES.json`** records one entry per claimed prefix: `prefix`,
   `owner` (the GitHub login that proved it by opening the claiming pull request),
   `verification` method, `addedAt`. A prefix is claimed once, in the same pull request as
   the first recipe under it, and is never reused even if every recipe under it is later
   recalled. New `$def` `CommunityNamespaceFile` in `catalog.schema.json` for this file.
3. **Three doors, one validator.** A pull request, the CLI, and the API (below) all produce
   the same file in the same place and are checked by the same code, so the answer is
   identical everywhere:
   - **`tools/check_community_namespaces.py`**: every recipe's id matches a claimed,
     non-reserved prefix; the recipe lives under the directory named after its prefix; with
     `--author <login>`, the prefix is owned by that login (used on pull requests).
   - Wired into `tools/validate_specs.py`, so `recipes/community/` gets the same schema and
     semantic checks as everything else in `recipes/`, with no separate command to remember.
   - `.github/workflows/community-recipes.yml` runs both on every pull request touching
     `recipes/community/**` and posts the result as a comment.
4. **Submission level is always V0** (RFC-0009): a contributed recipe is described, not
   executable, until it goes through the same review path as any other recipe reaching V1.
   This also means it needs no process-graph expertise to submit one.
5. **Rights, same rule as every other collection.** A contributor's own recipe can be
   `CC-BY-4.0` or `CC0`. A recipe credited to someone else enters as
   `LicenseRef-source-credited`, facts only, no step text, exactly like `chefteta`,
   `osool`, `abdennour`, `abuhaty` and `world` today (`tools/export_fifi.collections.json`).
6. **A GitHub pull request** (`.github/PULL_REQUEST_TEMPLATE/recipe-submission.md`) is the
   primary door for anyone with git: add the file, claim the prefix if needed, sign off
   (the existing Contributor License Agreement), open the PR. Checks above run
   automatically; a maintainer reviews the first submission under each new prefix, after
   which a clean pass may auto-merge (operational decision, not specified here).
7. **A GitHub Issue Form** (`.github/ISSUE_TEMPLATE/recipe-submission.yml`) is the door for
   someone without git: dish name, ingredients, steps, servings, rights. The issue has no
   access to this repository, so `tools/recipe_from_issue.py` converts it into exactly the
   same kind of file (best-effort free-text parsing, same documented fallback the
   fifi.cooking import uses: unparsed quantities become one piece with the original text
   kept) and `.github/workflows/recipe-issue-to-pr.yml` opens a **draft** pull request from
   it automatically, into the shared `issue-` intake namespace, flagged for human review.
8. **An API** (new paths in `api/index.openapi.yaml`): `POST /v1/recipes/submissions`
   accepts a Cookwala document (or, later, a schema.org `Recipe`), runs the same checks as
   `tools/validate_specs.py` and `tools/check_community_namespaces.py`, and opens a pull
   request through a GitHub App — mirroring the existing
   `POST /v1/registry/submissions` ("reviewed, also possible by GitHub PR"). Authentication
   is a GitHub token (the submitter's own prefix) or a publish token bound to a verified
   namespace (RFC-0002's proof methods). `GET /v1/recipes/submissions/{id}` reports CI
   status and the resulting pull request or merge. The service is not required to exist for
   doors 1 and 2 above to work; it is additive.
9. **No MCP write tool.** Agents may run the validator and get back a structured issue list;
   nothing in `sdk/mcp-js` opens a pull request or calls the submission endpoint. Recipe text
   reaching an agent is data (`AGENTS.md` in `cookwala/`), never an instruction, and a recipe
   is not published by an agent deciding it should be.
10. **Federation stays the real scale path.** A publisher who wants to keep recipes on their
    own site does not use this pipeline at all: they register a `recipe_collection` in the
    registry (RFC-0002) with a hash, and the directory lists it. Submission to this
    repository is for people without their own catalog.

## Alternatives considered

- **A database and an account system.** Rejected: duplicates what a GitHub repository
  already provides (identity, review, history, CI), and this project runs no server today.
- **Open write access to `recipes/` with no namespace.** Rejected: id collisions and
  impersonation of another contributor's recipes, the same reason the registry proves
  namespaces (RFC-0002).
- **Requiring every submission to come in at the recipe's claimed verification level.**
  Rejected: nobody outside the founder's own review process can currently produce V1
  evidence for a new recipe; V0-only entry keeps that honest and keeps the bar for
  submitting low.

## Migration

Additive. No existing recipe, schema, or API path changes meaning.

## Open questions

1. Auto-merge policy after the first reviewed submission under a prefix: this RFC specifies
   the checks, not whether a clean pass merges unattended. Operational, logged in
   `docs/DECISIONS.md` once decided.
2. Whether the submission API runs as a Cloudflare Worker, a GitHub Action dispatched by
   `repository_dispatch`, or something else: implementation detail, not normative.
3. A per-submitter rate limit and abuse handling on the API, mirroring RFC-0002's open
   question 2 for the registry.
