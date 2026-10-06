# Distributing the Cookwala samples

**Status (2026-10-05): prepared, not published.** Every channel below has its manifest in this
repository and is built or checked by CI. Nothing reaches a public registry until a maintainer
pushes a `samples-v<version>` tag and sets that registry's credentials. Version: [`VERSION`](VERSION)
(`python packaging/build.py --check-versions` fails CI if a manifest disagrees).

## One payload, many channels

The Python package is standard library only, so one file, `cookwala-samples-<v>.pyz` (a zipapp),
runs on any Python 3.9+ on any OS. The OS package managers ship that file plus a one-line
launcher; language registries ship their native port.

`python samples/packaging/build.py` builds the pyz, the wheel and sdist, the `.deb`, and renders
every manifest below into `samples/build/manifests/` with the version, URLs and sha256 filled in.
Assets are expected at `https://github.com/amado2k5/cookwala/releases/download/samples-v<v>/`;
pass `--base-url` to point them at another host, such as an Artifactory generic repository.

## Channels

| Channel | Install (once published) | Source in this repo | Published by | Needs |
|---|---|---|---|---|
| **PyPI (pip, pipx, uv)** | `pip install cookwala-samples` | `python/pyproject.toml` | CI on tag | PyPI trusted publisher for this workflow |
| **npm** | `npm i -g @cookwala/samples` · `npx @cookwala/samples demo` | `js/package.json` | CI on tag | `NPM_TOKEN`, the `@cookwala` npm scope |
| **Maven Central (Maven, Gradle, sbt, Leiningen)** | `ai.cookwala:cookwala-samples:0.3.0` | `java/pom.xml`, `java/build.gradle.kts` | CI on tag | `MAVEN_CENTRAL_USERNAME/PASSWORD`, `MAVEN_GPG_PRIVATE_KEY/PASSPHRASE`, the `ai.cookwala` namespace |
| **GitHub Packages (Maven)** | as above, with the GitHub Packages repository | `java/build.gradle.kts` | CI on tag | nothing extra (`GITHUB_TOKEN`) |
| **NuGet** | `dotnet add package Cookwala.Samples` · `dotnet tool install -g Cookwala.Samples.Tool` | `dotnet/Directory.Build.props`, `dotnet/src/*/*.csproj` | CI on tag | a nuget.org trusted-publishing policy (owner amado2k5, repo cookwala, workflow `samples.yml`, environment `release`, pattern `Cookwala.*`); the package owner name is read from the `NUGET_USER` repository variable (default `amado2026`); or a `NUGET_API_KEY` secret |
| **Homebrew (macOS, Linux)** | `brew install amado2k5/cookwala/cookwala-samples` | `packaging/homebrew/cookwala-samples.rb.in` | CI on tag, to the tap repository | a tap repo `amado2k5/homebrew-cookwala`, `HOMEBREW_TAP_TOKEN` |
| **Chocolatey (Windows)** | `choco install cookwala-samples` | `packaging/chocolatey/` | CI on tag (Windows runner) | `CHOCO_API_KEY`; community moderation before it is public |
| **Scoop (Windows)** | `scoop bucket add cookwala https://github.com/amado2k5/scoop-cookwala` · `scoop install cookwala-samples` | `packaging/scoop/cookwala-samples.json.in` | by hand: copy the rendered manifest into a bucket repo | a bucket repository |
| **apt (Debian, Ubuntu)** | `sudo apt install ./cookwala-samples_0.3.0_all.deb`, or from an apt repository | built by `packaging/build.py` | GitHub release asset; Artifactory Debian repo | an apt repository (Artifactory, Cloudsmith, a PPA) for `apt install cookwala-samples` |
| **RPM (dnf, yum, zypper)** | `sudo dnf install cookwala-samples` | `packaging/rpm/cookwala-samples.spec.in` | by hand: `rpmbuild -ba`, Fedora COPR or openSUSE OBS | a COPR or OBS project |
| **pacman (Arch, AUR)** | `yay -S cookwala-samples` | `packaging/arch/PKGBUILD.in` | by hand: push the rendered PKGBUILD to the AUR | an AUR account |
| **apk (Alpine)** | `apk add cookwala-samples` | `packaging/alpine/APKBUILD.in` | by hand: aports merge request | an aports maintainer |
| **conda-forge (conda, mamba, pixi)** | `conda install -c conda-forge cookwala-samples` | `packaging/conda/meta.yaml.in` (from the PyPI sdist) | by hand: staged-recipes pull request | the PyPI release first |
| **Snap** | `sudo snap install cookwala-samples --edge` | `packaging/snap/snapcraft.yaml` | by hand: `snapcraft upload` | a Snap Store account |
| **OCI image (GHCR, Docker Hub, Quay, ECR, ACR)** | `docker run --rm -p 8080:8080 ghcr.io/amado2k5/cookwala-samples` | `packaging/docker/Containerfile` | CI on tag (GHCR) | nothing extra (`GITHUB_TOKEN`) |
| **Helm (Kubernetes)** | `helm install samples packaging/helm/cookwala-samples` | `packaging/helm/cookwala-samples/` | from the repository; an OCI chart push is one command (`helm push`) | a chart registry, if wanted |
| **JFrog Artifactory** | the native client of each type, pointed at your Artifactory | `packaging/artifactory/publish.sh` | CI on tag, or by hand | `ARTIFACTORY_URL`, `ARTIFACTORY_USER`, `ARTIFACTORY_TOKEN` (+ `ARTIFACTORY_DOCKER_REGISTRY`) |
| **GitHub release** | download the pyz, deb, wheel, sdist and `SHA256SUMS` | `.github/workflows/samples.yml` | CI on tag | nothing extra |
| **Azure Functions** | deploy | `cloud/azure-functions/` | CI on demand (`samples-cloud.yml`, `target=azure`), or by hand (`az`, `func`) | an Azure subscription + `cloud-test` environment secrets |
| **AWS Lambda** | deploy | `cloud/aws-lambda/` (SAM) | CI on demand (`samples-cloud.yml`, `target=aws`), or by hand (`sam deploy`) | an AWS account + `cloud-test` environment secret |
| **Google Cloud Run functions** | deploy | `cloud/gcp-functions/` | by hand (`gcloud`) | a GCP project |
| **OpenShift, OpenShift Serverless** | deploy | `cloud/openshift/` | by hand (`oc`) | a cluster |

Not provided, with the reason: **winget** needs a native Windows installer (exe or msi) and the
samples ship a Python zipapp; Windows users have Chocolatey, Scoop, pip and npm. **Go modules**
and **crates.io** have no sample port yet (the SDKs exist in `sdk/go` and `sdk/rust`).

## Artifactory

`packaging/artifactory/publish.sh` pushes each package type to a local repository of the
matching type, with each ecosystem's own client: twine (PyPI), npm, Maven (`-Partifactory`) or
Gradle, `dotnet nuget push`, Debian (with `deb.distribution`, `deb.component`, `deb.architecture`
properties), RPM, Docker, and a generic repository for the pyz. Create the repositories first
(default keys `cookwala-<type>-local`, overridable by environment variables listed in the
script); then point remote or virtual repositories at them as usual.

## Releasing

1. Bump `samples/VERSION` and every manifest (`python samples/packaging/build.py --check-versions` lists them); add a line to the Python, npm, Maven and NuGet changelogs if you keep them.
2. Regenerate the bundle if the vocabularies, limits or example recipes changed: `python samples/tools/build_bundle.py`.
3. Merge, then tag: `git tag samples-v0.3.0 && git push origin samples-v0.3.0`.
4. CI tests every port, builds every package, creates the GitHub release, and publishes to each registry whose secret is set. The other channels take the rendered manifests from the release's `samples-packages` artifact.

## Verified in this repository (2026-10-05)

### Installed the way a user installs, from local stand-ins for each registry

`packaging/install-test.sh` repeats all of this, and CI runs it on every change (`install` job). No registry is
contacted: npm gets a Verdaccio registry, pip a PEP 503 index, Maven and Gradle a file repository, NuGet a folder feed,
apt a repository made with `apt-ftparchive`, Homebrew a local tap and a local copy of the release asset.

| Channel | What ran | Where |
|---|---|---|
| npm | `npx @cookwala/samples demo`; `npm i -g @cookwala/samples`; `import { demo } from '@cookwala/samples'` in a new project | empty npm home and cache |
| PyPI | `pip install cookwala-samples` from the wheel and from the sdist; `pipx install`; `uvx cookwala-samples` | new virtual environments |
| single file | `python3 cookwala-samples-0.3.0.pyz demo` | any Python 3.9+ |
| Maven | a new project depending on `ai.cookwala:cookwala-samples:0.3.0`, compiled and run; `java -jar` on the artifact | empty local repository |
| Gradle | a new project with `implementation("ai.cookwala:cookwala-samples:0.3.0")`, `gradle run` | empty Gradle home |
| NuGet | `dotnet add package Cookwala.Samples` in a new console app, `dotnet run`; `dotnet tool install -g Cookwala.Samples.Tool`, then `cookwala-samples` | empty NuGet cache and tool home |
| apt | `apt-get install cookwala-samples` from an apt repository (pulls in python3), run, `apt-get remove` leaves nothing | Debian 12 container |
| RPM | `rpmbuild -bb` on the rendered spec (its `%check` runs the pyz), `dnf install`, run, `dnf remove` | Fedora 41 container |
| pacman | `makepkg` (checks the sha256 and runs `check()`), `pacman -U`, run, `pacman -R` | Arch Linux container |
| apk | `abuild -r` (sha256, `check()`, signed), `apk add`, run, `apk del` | Alpine 3.20 container |
| Homebrew | `brew install` from a tap (installs python@3.12), run, `brew test` passes | Homebrew's Linux container |
| conda | `conda build` on the rendered recipe from the sdist (its tests run), `conda create`, run | Miniforge container |
| Chocolatey | `choco pack` makes the `.nupkg`; the install and uninstall scripts run under PowerShell, download the asset, check its sha256, create and remove the command; Chocolatey's three helper functions are stood in | PowerShell on Linux; a real `choco install` needs Windows |
| Scoop | the manifest parses; `pre_install` writes the launcher; running it needs Windows | PowerShell on Linux |
| OCI image | runs the demo; serves HTTP as an arbitrary uid on a read-only root filesystem | Docker |
| AWS Lambda | the handler answers inside AWS's own `public.ecr.aws/lambda/python:3.12` image (runtime interface emulator) | Docker |
| Azure Functions | `func start` with Azure Functions Core Tools 4 serves `/api/health`, `/api/v1/samples/plan` and the demo | local Functions host |
| Google Cloud functions | `functions-framework --target samples` serves every endpoint | local Functions Framework |

The first manual pass found two real bugs, now fixed and covered by tests: the JavaScript and Java `run` commands exited
0 when a job did not complete (Python and C# exited 1), and an unknown `--fault` kind was ignored instead of being a
usage error. The four CLIs now give the same exit codes and the same reports.

### Tests and builds

| What | How |
|---|---|
| Python: 33 tests, including equality with the reference dry run for every example recipe and device, JSON Schema validation of every request, status, log and incident, the demo against the reference hub over HTTP, and every service endpoint with the network disabled | `python -m unittest discover -s samples/python/tests` |
| JavaScript: 42 tests (Node 18 and 22); Markdown and CSV demo reports byte-identical to Python | `npm test` in `samples/js` |
| Java: tests under both Maven and Gradle (Java 17 and 21); demo identical to Python; sources and javadoc jars for Maven Central | `mvn -B package`, `gradle build` in `samples/java` |
| .NET: 55 tests; demo identical to Python | `dotnet test` in `samples/dotnet` |
| pyz, wheel and sdist build; `twine check` passes | `packaging/build.py` |
| the Helm chart lints and renders a Deployment, Service, Ingress and Route | Helm 3.16 |
| the Helm chart installs into a throwaway kind cluster and the Knative service answers over Kourier, both serving `/health` and the demo report | `.github/workflows/samples-cloud.yml` `kind` job (kind, Knative Serving 1.23) |
| the Azure Functions deploy runs on a real subscription: Bicep stack, zip publish, `/health` + `/plan` + demo report over the public URL, then the resource group is deleted | `.github/workflows/samples-cloud.yml` `azure` job (`workflow_dispatch`, `cloud-test` environment) |

### Not run here

`snapcraft` (needs snapd), a real `choco install` and `scoop install` (need Windows), and the OpenShift template (needs
a cluster). For the clouds: the **Azure Functions** and **AWS Lambda** deploys are proven — see below. The Google Cloud
deploy exists as a `workflow_dispatch` job in `.github/workflows/samples-cloud.yml`, written end-to-end with
`always()` teardown, but has never run — it needs the OIDC credentials named at the top of the job.

### Proven against a real account: Azure Functions and AWS Lambda

Run [37443213472](https://github.com/amado2k5/cookwala/actions/runs/37443213472) (2026-10-06, `samples-cloud.yml`
dispatched with `target=azure` behind the protected `cloud-test` environment):

- OIDC login via `azure/login` — a Microsoft Entra app registration (`cookwala-ci`) with a federated credential
  scoped to `environment:cloud-test`; no stored client secret.
- `az group create` + `az deployment group create` deployed `samples/cloud/azure-functions/main.bicep` (storage
  account, Y1 consumption plan, Application Insights, Function App) to `eastus` — overridable via the `AZURE_REGION`
  variable, since new subscriptions reject some regions (`RequestDisallowedByAzure` / "not accepting new customers").
- Zip-deployed `samples/cloud/azure-functions/` with a remote build.
- Called the real endpoints: `GET /api/health` returned `{"ok": true, ...}`, `POST /api/v1/samples/plan` ranked the
  devices, and `GET /api/v1/samples/demo?format=markdown` produced the report with `3 completed`.
- `if: always()` teardown deleted the resource group.

Required secrets in the `cloud-test` environment: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.
One setup detail worth noting: because this repository was renamed, GitHub emits the OIDC subject with numeric entity
ids (`repo:amado2k5@20147989/cookwala@1403544608:environment:cloud-test`) — the federated credential's subject must
match that form, not `repo:amado2k5/cookwala:...`.

Run [37448439405](https://github.com/amado2k5/cookwala/actions/runs/37448439405) (2026-10-06, `target=aws`):

- OIDC role assumption via `configure-aws-credentials` — an IAM OIDC provider for
  `token.actions.githubusercontent.com` plus a `cookwala-ci` role whose trust policy matches
  `repo:amado2k5*/cookwala*:environment:cloud-test`; no stored access keys.
- `sam build` + `sam deploy` created the stack `cw-samples-ci-37448439405` in `eu-west-1`: the Lambda function,
  its execution role, and an HTTP API.
- Called the public `HttpApiUrl`: `/health` returned `{"ok": true, ...}` and `/v1/samples/demo?format=markdown`
  produced the report with `3 completed`.
- `if: always()` teardown ran `sam delete`.

Two findings this run exposed, both fixed in the same PR: the SAM template's `AuthType: NONE` needed an explicit
`AWS::Lambda::Permission` for `lambda:InvokeFunctionUrl`, and anonymous Function-URL calls are blocked on brand-new
AWS accounts regardless — so the workflow proves the deploy through the API Gateway `HttpApiUrl` output instead.
Required secret in the `cloud-test` environment: `AWS_ROLE_TO_ASSUME` (the role ARN).
