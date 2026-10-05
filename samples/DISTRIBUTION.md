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
| **Maven Central (Maven, Gradle, sbt, Leiningen)** | `ai.cookwala:cookwala-samples:0.1.0` | `java/pom.xml`, `java/build.gradle.kts` | CI on tag | `MAVEN_CENTRAL_USERNAME/PASSWORD`, `MAVEN_GPG_PRIVATE_KEY/PASSPHRASE`, the `ai.cookwala` namespace |
| **GitHub Packages (Maven)** | as above, with the GitHub Packages repository | `java/build.gradle.kts` | CI on tag | nothing extra (`GITHUB_TOKEN`) |
| **NuGet** | `dotnet add package Cookwala.Samples` · `dotnet tool install -g Cookwala.Samples.Tool` | `dotnet/src/*/*.csproj` | CI on tag | `NUGET_API_KEY` |
| **Homebrew (macOS, Linux)** | `brew install amado2k5/cookwala/cookwala-samples` | `packaging/homebrew/cookwala-samples.rb.in` | CI on tag, to the tap repository | a tap repo `amado2k5/homebrew-cookwala`, `HOMEBREW_TAP_TOKEN` |
| **Chocolatey (Windows)** | `choco install cookwala-samples` | `packaging/chocolatey/` | CI on tag (Windows runner) | `CHOCO_API_KEY`; community moderation before it is public |
| **Scoop (Windows)** | `scoop bucket add cookwala https://github.com/amado2k5/scoop-cookwala` · `scoop install cookwala-samples` | `packaging/scoop/cookwala-samples.json.in` | by hand: copy the rendered manifest into a bucket repo | a bucket repository |
| **apt (Debian, Ubuntu)** | `sudo apt install ./cookwala-samples_0.1.0_all.deb`, or from an apt repository | built by `packaging/build.py` | GitHub release asset; Artifactory Debian repo | an apt repository (Artifactory, Cloudsmith, a PPA) for `apt install cookwala-samples` |
| **RPM (dnf, yum, zypper)** | `sudo dnf install cookwala-samples` | `packaging/rpm/cookwala-samples.spec.in` | by hand: `rpmbuild -ba`, Fedora COPR or openSUSE OBS | a COPR or OBS project |
| **pacman (Arch, AUR)** | `yay -S cookwala-samples` | `packaging/arch/PKGBUILD.in` | by hand: push the rendered PKGBUILD to the AUR | an AUR account |
| **apk (Alpine)** | `apk add cookwala-samples` | `packaging/alpine/APKBUILD.in` | by hand: aports merge request | an aports maintainer |
| **conda-forge (conda, mamba, pixi)** | `conda install -c conda-forge cookwala-samples` | `packaging/conda/meta.yaml.in` (from the PyPI sdist) | by hand: staged-recipes pull request | the PyPI release first |
| **Snap** | `sudo snap install cookwala-samples --edge` | `packaging/snap/snapcraft.yaml` | by hand: `snapcraft upload` | a Snap Store account |
| **OCI image (GHCR, Docker Hub, Quay, ECR, ACR)** | `docker run --rm -p 8080:8080 ghcr.io/amado2k5/cookwala-samples` | `packaging/docker/Containerfile` | CI on tag (GHCR) | nothing extra (`GITHUB_TOKEN`) |
| **Helm (Kubernetes)** | `helm install samples packaging/helm/cookwala-samples` | `packaging/helm/cookwala-samples/` | from the repository; an OCI chart push is one command (`helm push`) | a chart registry, if wanted |
| **JFrog Artifactory** | the native client of each type, pointed at your Artifactory | `packaging/artifactory/publish.sh` | CI on tag, or by hand | `ARTIFACTORY_URL`, `ARTIFACTORY_USER`, `ARTIFACTORY_TOKEN` (+ `ARTIFACTORY_DOCKER_REGISTRY`) |
| **GitHub release** | download the pyz, deb, wheel, sdist and `SHA256SUMS` | `.github/workflows/samples.yml` | CI on tag | nothing extra |
| **Azure Functions** | deploy | `cloud/azure-functions/` | by hand (`az`, `func`) | an Azure subscription |
| **AWS Lambda** | deploy | `cloud/aws-lambda/` (SAM) | by hand (`sam deploy`) | an AWS account |
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
3. Merge, then tag: `git tag samples-v0.1.0 && git push origin samples-v0.1.0`.
4. CI tests every port, builds every package, creates the GitHub release, and publishes to each registry whose secret is set. The other channels take the rendered manifests from the release's `samples-packages` artifact.

## Verified in this repository (2026-10-05)

| What | How |
|---|---|
| Python tests, including equality with the reference dry run for every example recipe and device, JSON Schema validation of every request, status, log and incident, and the demo against the reference hub over HTTP | `python -m unittest discover -s samples/python/tests` |
| pyz, wheel and sdist build; `twine check` passes; the wheel installs and runs | `packaging/build.py` |
| the `.deb` installs with `dpkg -i`, runs, and removes cleanly | Ubuntu 24.04 |
| the image builds without network, runs the demo, and serves HTTP as an arbitrary uid on a read-only root filesystem | Docker 29 |
| the Helm chart lints and renders a Deployment, Service, Ingress and Route | Helm 3.16 |
| the AWS Lambda (HTTP API v2 and REST v1 events), Azure Functions (v2 model) and Google Cloud functions handlers answer locally | the platform libraries' local test harnesses |
| the rendered Homebrew formula parses (`ruby -c`), the PKGBUILD's `check` and `package` run, the APKBUILD parses, the Scoop JSON and the nuspec parse | locally |
| not run here: `brew install`, `choco`, `scoop`, `rpmbuild`, `makepkg`, `abuild`, `snapcraft`, `conda build`, or a real cloud deployment | needs those platforms or accounts |
