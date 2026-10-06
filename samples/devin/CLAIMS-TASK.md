# Devin task: make every claim on https://cookwala.ai/samples/ true, and keep it true

Repository: https://github.com/amado2k5/cookwala (default branch `main`)
Tap repository: https://github.com/amado2k5/homebrew-cookwala
Owner / maintainer: amado2k5

## 0. Ground rules (read first, they override everything below)

1. **Truth over polish.** A tile on the samples page may say "Published" only if you have just
   installed that package from the *public* registry in a clean environment and run it. Never
   change a status to make the page look better. If you cannot verify a channel, say so in the PR.
2. **No invented credentials, accounts or results.** If a step needs an account, token, namespace
   or cloud subscription you were not given, do not fake it, do not create accounts with made-up
   details, and do not commit secrets. Finish everything that does not need it, then list exactly
   what you are blocked on and what the maintainer must do (Section 8).
3. **Never put secrets in the repo, logs, PR text or workflow output.** Use GitHub Actions
   secrets/variables and OIDC. Mask anything sensitive.
4. **Small, reviewable PRs, one per phase** (branch names below). Do not push to `main`. Open PRs
   as drafts if a phase is incomplete. Every PR description must list: what changed, how you
   verified it, and what you could *not* verify.
5. **Do not tag a release or publish to any registry** (no `samples-v*` tag, no `twine upload`, no
   `npm publish`, no `choco push`, no `snapcraft upload`) unless the maintainer explicitly tells
   you to in this task thread. Publishing is irreversible.
6. **Cloud deployments create billable resources.** Use a throwaway resource group / project /
   stack with a unique name, a budget or TTL tag where the provider supports it, and always tear it
   down in an `always()` cleanup step. Never touch existing resources.
7. Match the existing code style, comment density and naming. Read `CONTRIBUTING.md` and
   `samples/DISTRIBUTION.md` and `samples/README.md` before editing.
8. Keep English and Arabic pages in sync (hand-written). French, Spanish, German and Portuguese
   pages fall back to English and are labelled machine-translated; check how the build handles
   them (`tools/build_site.sh`) and do not hand-edit generated output.

## 1. Context: what was verified on 2026-10-06 (do not re-litigate; re-verify only in Phase 4)

Live and verified (installed/downloaded and ran):
- PyPI `cookwala-samples` 0.2.0, 0.3.0. `pip install cookwala-samples==0.3.0` then
  `cookwala-samples demo 6` prints "6 runs: 3 completed, 1 failed, 1 refused, 1 stopped. ..."
- npm `@cookwala/samples` 0.2.0, 0.3.0 (`npx @cookwala/samples demo 6` works)
- Maven Central `ai.cookwala:cookwala-samples:0.3.0` (jar, sources jar, pom). Gradle uses the same.
- NuGet `Cookwala.Samples` and `Cookwala.Samples.Tool`, 0.2.0 and 0.3.0
- GitHub release `samples-v0.3.0` with `.pyz`, `.deb`, wheel, sdist, `SHA256SUMS`
  (the `.pyz` sha256 matches `SHA256SUMS`)
- Homebrew tap `amado2k5/homebrew-cookwala`, `Formula/cookwala-samples.rb` (url + sha256 match the release)
- GHCR `ghcr.io/amado2k5/cookwala-samples` tags `0.3.0` and `latest` exist
- Latest `Samples (test, package, publish)` workflow run on `main` is green

Wrong or outdated on the page `site/content/en/samples.html` (and `site/content/ar/samples.html`):
- **JFrog Artifactory** tile says "Published · install now". False. `samples/packaging/artifactory/publish.sh`
  only pushes to an Artifactory instance the *user* supplies (`ARTIFACTORY_URL`, ...). There is no
  public instance. `site/content/en/roadmap.html` (~line 42) still lists it as "planned".
- **OCI image** tile says "Built and tested · not yet published". Outdated: the image is on GHCR.
- **Scoop, RPM, pacman (AUR), apk (Alpine), conda-forge, Snap** tiles say "Manifest ready ·
  submitted by hand", which reads as already submitted. Verified not listed anywhere: conda-forge
  API 404, AUR 404, Snap Store "no snap named cookwala-samples", Scoop bucket repo
  `amado2k5/scoop-cookwala` not reachable.
- **Chocolatey**: `https://community.chocolatey.org/api/v2/package/cookwala-samples` redirects to a
  downloadable `cookwala-samples.0.3.0.nupkg`, but the public feed query
  `Packages()?$filter=Id eq 'cookwala-samples'` returns an empty feed, so the package is almost
  certainly in moderation. "Built and tested · not yet published" is correct until it is listed.

Honest but never proven in a real environment (the page says "Deploy to your own account" /
"In the repository, runs today"):
- Azure Functions (`samples/cloud/azure-functions/`, has `main.bicep`), AWS Lambda
  (`samples/cloud/aws-lambda/`, SAM), Google Cloud Run functions (`samples/cloud/gcp-functions/`),
  OpenShift template and Knative service (`samples/cloud/openshift/`), Helm chart
  (`samples/packaging/helm/cookwala-samples/`). Locally: Azure under Functions Core Tools 4, Lambda
  in AWS's runtime-emulator image, GCP under the Functions Framework, Helm lint + render only.
  Nobody has deployed any of them to a real cloud account or run `helm install` in a cluster.
- apt: only a `.deb` on GitHub Releases. `sudo apt install cookwala-samples` (no `./`) needs a
  hosted apt repository, which does not exist.

Files you will need: `samples/DISTRIBUTION.md`, `samples/VERSION`, `samples/packaging/build.py`,
`samples/packaging/install-test.sh`, `samples/packaging/*/` manifests, `.github/workflows/samples.yml`,
`.github/workflows/pages.yml`, `site/content/{en,ar}/samples.html`, `site/content/en/roadmap.html`,
`site/templates/`, `tools/build_site.sh`, root `README.md` ("Start from working sample code" row).

## 2. Phase 1: make the page truthful (branch `claude/samples-truth-phase1`)

No outside accounts needed. Do all of it.

1. Find how tile statuses are defined (look in `site/content/en/samples.html`, `site/templates/`
   and any `samples/VERSION`-driven generation). Prefer one source of truth for status over
   hand-editing 40 tiles; if a data file exists, edit that.
2. Define a small fixed vocabulary of statuses and use it everywhere:
   - `Published · install now` (verified from the public registry)
   - `Built and tested · not yet published`
   - `Manifest ready · not yet submitted`
   - `Script ready · bring your own instance` (Artifactory)
   - `In the repository, runs today` (Helm, CI)
   - `Deploy to your own account` (cloud functions, OpenShift, Knative)
3. Apply: Artifactory -> `Script ready · bring your own instance`; OCI image -> `Published · install now`
   with command `docker run --rm -p 8080:8080 ghcr.io/amado2k5/cookwala-samples`; Scoop, RPM, pacman,
   apk, conda-forge, Snap -> `Manifest ready · not yet submitted`; Chocolatey stays
   `Built and tested · not yet published` (add "awaiting moderation" only if you can confirm it
   from the moderation page or the maintainer says so).
4. Fix the sentence "Published on PyPI, npm, NuGet, Maven Central and Homebrew, with the single
   file and the .deb ..." so it also lists the GHCR image, and keep it accurate.
5. Update `site/content/en/roadmap.html` (Artifactory and Chocolatey rows) and
   `samples/DISTRIBUTION.md` (the channels table "Published by" and status header) to match. Remove
   "submitted" wording anywhere it implies submission that did not happen. Update the root
   `README.md` row ("built, not yet published") to match reality.
6. Mirror every change in `site/content/ar/samples.html` and the Arabic roadmap if present. Keep
   the Arabic natural; do not machine-translate word for word. If you are not confident in an
   Arabic phrase, keep the existing Arabic wording for unchanged parts and flag the new strings in
   the PR for a native-speaker review.
7. Verify: `bash tools/build_site.sh _site` succeeds; open the built `_site/samples/index.html`
   (and `_site/ar/samples/`) in headless Chromium (Playwright is preinstalled; do not run
   `playwright install`), take screenshots at 1280px and 390px width, confirm no horizontal scroll
   and every tile status matches the vocabulary. Attach screenshots to the PR.

Acceptance: no tile claims more than has been verified; Artifactory is no longer "Published".

## 3. Phase 4 first (branch `claude/samples-claims-check`): automated claim checker

Do this before Phases 2 and 3 so later status changes are guarded. (Numbered 4 because it
protects the rest.)

1. Add `tools/check_samples_claims.py` (standard library only). It parses the tile list (or the
   status data file from Phase 1) and, for every tile whose status is `Published · install now`,
   asserts against the public registry:
   - PyPI: `https://pypi.org/pypi/cookwala-samples/<VERSION>/json` -> 200
   - npm: `https://registry.npmjs.org/@cookwala%2fsamples/<VERSION>` -> 200
   - Maven Central: `https://repo1.maven.org/maven2/ai/cookwala/cookwala-samples/<VERSION>/cookwala-samples-<VERSION>.pom` -> 200
   - NuGet: `https://api.nuget.org/v3-flatcontainer/cookwala.samples/index.json` contains VERSION; same for `cookwala.samples.tool`
   - GitHub release: tag `samples-v<VERSION>` has `.pyz`, `.deb`, wheel, sdist, `SHA256SUMS`; downloaded `.pyz` sha256 equals the line in `SHA256SUMS`
   - Homebrew: raw `Formula/cookwala-samples.rb` in the tap contains that version's URL and the same sha256
   - GHCR: anonymous token + `tags/list` contains VERSION
   - Chocolatey: OData feed `Packages()?$filter=Id eq 'cookwala-samples' and Version eq '<VERSION>'` returns an entry
   - Snap, AUR, conda-forge, Scoop bucket: the respective public APIs/URLs
   It also asserts the reverse for statuses that say *not* published (so the page cannot silently
   understate; it should warn, not fail, when something labelled unpublished turns out to be live).
   Read `VERSION` from `samples/VERSION`.
2. Add a scheduled workflow `.github/workflows/samples-claims.yml` (daily + `workflow_dispatch`,
   `permissions: contents: read`, `issues: write`) that runs the script and, on failure, opens or
   updates a single GitHub issue titled "Samples page claims out of date" with the diff. Do not
   make it block unrelated PRs; run it on PRs only when `site/content/*/samples.html`,
   `samples/DISTRIBUTION.md` or the status data change.
3. Tolerate registry lag: Maven Central and Chocolatey can lag; retry 3 times over 10 minutes
   before failing, and report "lagging" separately from "missing".
4. Unit-test the parser and the classification logic offline with recorded fixtures.

Acceptance: running the script today reports the Phase 1 statuses as consistent; temporarily
changing a tile to `Published` for Snap makes it fail with a clear message (show this in the PR,
then revert).

## 4. Phase 2: prove the cloud and cluster claims (branch `claude/samples-cloud-deploy`)

Only mark anything "deployed and tested" after a real deployment passed. If the maintainer has
not provided credentials, still write and dry-run everything, open a draft PR, and list the
required secrets in Section 8.

For each target, add a `workflow_dispatch`-only job (not on push, to avoid cost) in a new
`.github/workflows/samples-cloud.yml` using OIDC federated credentials where possible, with
`permissions: id-token: write, contents: read` and a protected environment `cloud-test`:

1. **Azure Functions** (`samples/cloud/azure-functions/`):
   - `az login` via `azure/login@v2` with OIDC (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
     `AZURE_SUBSCRIPTION_ID` as secrets).
   - Create resource group `cw-samples-ci-${{ github.run_id }}`, deploy `main.bicep`, publish the
     function app with `func azure functionapp publish` (or zip deploy), wait until `/api/health`
     returns 200, then call `/api/v1/samples/plan` and `/api/v1/samples/demo?format=markdown`
     and assert the documented output (3 completed, 1 failed, 1 refused, 1 stopped).
   - Teardown: `az group delete --yes --no-wait` in an `if: always()` step; fail the job loudly if
     teardown fails, and print the resource group name for manual cleanup.
   - Check the Bicep and runtime: confirm the Python version and Functions runtime in
     `main.bicep`/`host.json` are currently supported by Azure, and fix them if not.
2. **AWS Lambda** (`samples/cloud/aws-lambda/`): `aws-actions/configure-aws-credentials@v4` with an
   OIDC role (`AWS_ROLE_TO_ASSUME`), `sam build && sam deploy --stack-name cw-samples-ci-$RUN_ID
   --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset`, call the function URL or API
   endpoint for `/health` and the demo, then `sam delete --no-prompts` in `always()`. Confirm the
   runtime in `template.yaml` is a currently supported Python runtime.
3. **Google Cloud Run functions** (`samples/cloud/gcp-functions/`): `google-github-actions/auth@v2`
   with workload identity federation, `gcloud functions deploy cookwala-samples-ci-$RUN_ID --gen2
   --runtime python312 --trigger-http --allow-unauthenticated ...`, call the endpoints, then
   `gcloud functions delete` in `always()`. The unauthenticated endpoint must only serve the
   self-contained simulated demo (it never contacts other hosts); assert that in a test.
4. **Helm / Kubernetes**: add a CI job (runs on every PR touching `samples/packaging/helm/**` or
   `samples/packaging/docker/**`) that creates a `kind` cluster (`helm/kind-action`), loads the
   locally built image, runs `helm install samples samples/packaging/helm/cookwala-samples --wait`,
   port-forwards, curls `/health` and `/v1/samples/demo?format=markdown`, then `helm uninstall`. This
   needs no secrets, so do it fully.
5. **Knative / OpenShift Serverless**: in the same kind job (or a second one), install Knative
   Serving, `kubectl apply` a copy of `samples/cloud/openshift/knative-service.yaml` adapted only
   for the lack of OpenShift-specific fields (document each adaptation), and curl it. For the
   OpenShift `template.yaml` (Route, Security Context Constraints behaviour) use a free OpenShift
   Local / Developer Sandbox only if the maintainer provides access; otherwise leave it as
   "Deploy to your own account" and say why.
6. For each target that passes, update the tile to `Deployed and tested in CI · deploy to your own
   account` (add this status to the vocabulary and to the Phase 4 checker as "has a successful
   `samples-cloud.yml` run on `main` within the last 90 days", queried through the Actions API).
   Targets that were not run keep `Deploy to your own account`.
7. Record what ran, when, and the run URLs in `samples/DISTRIBUTION.md` under "Verified in this
   repository", and move the items that now ran out of its "Not run here" section.

Acceptance: a green `workflow_dispatch` run URL for each target that is marked deployed; teardown
confirmed (no leftover resources; show the list-resources command output in the PR).

## 5. Phase 3: ship the by-hand channels (branch per channel: `claude/samples-channel-<name>`)

Prepare everything you can; the final submission needs the maintainer's accounts. Do not submit,
upload, or open external pull requests without explicit go-ahead in the task thread (a PR to
conda-forge/staged-recipes or Alpine aports is public and cannot be fully retracted).

For each channel: re-render the manifest with `python samples/packaging/build.py`, validate it
with the channel's own lint, test the install in a clean container, and write a short
`samples/packaging/<channel>/SUBMIT.md` with the exact commands and who owns each account.

1. **Scoop**: create the bucket repo content (`bucket/cookwala-samples.json` with `checkver` and
   `autoupdate` pointing at GitHub releases) ready to push to `amado2k5/scoop-cookwala`. If the
   maintainer grants access to create that repo, create it, add the manifest and a CI job using
   Scoop's `excavator` action. Test on a `windows-latest` runner: `scoop bucket add`, `scoop
   install`, `cookwala-samples demo`.
2. **AUR**: validate the `PKGBUILD` with `namcap` and `makepkg` in an Arch container; prepare the
   `.SRCINFO`. Submission needs the maintainer's AUR account and SSH key.
3. **conda-forge**: write the `meta.yaml` from the PyPI sdist for staged-recipes; run
   `conda smithy`-style lint (`conda-forge-lint`/`grayskull` check) and a local `conda build`.
   Submission is a PR to `conda-forge/staged-recipes` by the maintainer.
4. **Snap**: build with `snapcraft` in a `snapcore/action-build` CI job, install the produced snap
   in the runner, run the demo, and wire an upload step guarded by a `SNAPCRAFT_STORE_CREDENTIALS`
   secret that only runs on `samples-v*` tags. The name must be registered by the maintainer
   first (`snapcraft register cookwala-samples`).
5. **RPM**: prepare a COPR project config and a GitHub Action or `copr-cli` step guarded by a COPR
   API token secret; test `rpmbuild` + `dnf install` in Fedora and openSUSE containers.
6. **apk**: validate `abuild` in Alpine 3.20+, prepare the aports merge-request description (or
   host a private apk repository as an alternative and document it).
7. **apt repository**: propose the simplest hosted option (Cloudsmith free OSS tier or a signed
   repo on GitHub Pages built with `aptly`/`reprepro` and a dedicated GPG key stored as a secret).
   Implement the GitHub Pages option only if the maintainer approves key handling; then document
   `curl ... | gpg --dearmor`, `echo deb ... | sudo tee`, `sudo apt install cookwala-samples`, and
   test it in a clean Debian 12 and Ubuntu 24.04 container.
8. **Chocolatey**: check the moderation status of the existing submission at
   https://community.chocolatey.org/packages/cookwala-samples (it needs the maintainer's login for
   anything beyond public pages). Address any validator or reviewer comments in the nuspec and
   install scripts, test on `windows-latest` with a real `choco install` from a local source,
   and report the exact reviewer messages.
9. **winget**: out of scope (needs a native installer). Keep the existing "Not provided" note.
10. **Artifactory**: keep it a "bring your own instance" channel. Add a CI job that spins up
    `releases-docker.jfrog.io/jfrog/artifactory-oss` in Docker (free OSS edition), creates the
    repositories `publish.sh` expects, runs the script against it, and installs back from it with
    pip, npm, Maven, NuGet. That proves the script works without claiming a public instance.
    Update the tile to `Script ready · tested against Artifactory OSS` if it passes.

After the maintainer completes a submission and the package is publicly installable, flip that
tile to `Published · install now` only in a follow-up PR that includes the clean-container install
output. The Phase 4 checker must pass.

## 6. Cross-cutting requirements

- Run before every push: `python tools/validate_specs.py`, `python -m unittest discover -s
  samples/python/tests`, `npm test` in `samples/js`, `mvn -B package` in `samples/java`,
  `dotnet test` in `samples/dotnet` (skip a runner you cannot install and say so),
  `python samples/packaging/build.py --check-versions`, `python samples/tools/build_bundle.py --check`,
  `bash tools/build_site.sh _site`.
- Do not bump `samples/VERSION` or touch the bundle unless a phase requires it. No release tags.
- Do not remove honest caveats ("Samples, not certified software", the "Not run here" list) unless
  the thing is now actually run.
- Do not weaken the service's safety property: the HTTP service and every cloud function talk only
  to their own simulated devices. Any new test must keep asserting this.
- Pin third-party GitHub Actions to a major version at least (prefer commit SHAs for any action
  that handles credentials). Minimal `permissions:` per job.
- Commit messages: imperative, explain why. Do not mention which AI model or tool wrote them.

## 7. Final deliverable (post this as the last comment on the last PR and as your final message)

A table with one row per tile on the samples page (all ~35): channel, status before, status after,
evidence (command run + output excerpt or run URL), and "needs maintainer" if blocked. Then a list
of all PRs opened with their phase, and the open items from Section 8.

## 8. What only the maintainer can provide (ask once, up front, then continue with the rest)

- Azure: subscription + OIDC app registration (client id, tenant id, subscription id) with
  Contributor on a dedicated test scope.
- AWS: an IAM role for GitHub OIDC limited to CloudFormation, Lambda, API Gateway/Function URL,
  S3 (SAM bucket) and IAM role creation for the stack.
- GCP: a project, workload identity pool/provider, and a service account allowed to deploy Cloud
  Run functions.
- GitHub: repository `amado2k5/scoop-cookwala` created (or permission to create it); Actions
  environment `cloud-test` with required reviewers.
- Accounts for: AUR (SSH key), conda-forge (GitHub PR), Snap Store (name registration and
  `SNAPCRAFT_STORE_CREDENTIALS`), Fedora COPR (API token), Alpine aports (MR), Chocolatey (login
  to see moderation messages), apt repository hosting and a GPG signing key.
- An explicit go-ahead before any public submission or release tag.

If any of these is missing, do not stop: complete Phases 1 and 4 and every credential-free part of
Phases 2 and 3, then report precisely what is blocked.
