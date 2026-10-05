#!/usr/bin/env bash
# Install every built package the way a user would, from local stand-ins for each registry, and run it.
#
#   python samples/packaging/build.py          # first: pyz, wheel, sdist, deb, rendered manifests
#   samples/packaging/install-test.sh [npm pip maven gradle nuget apt rpm arch alpine brew conda choco scoop]   # default: all
#
# Nothing is published anywhere. Local registries: Verdaccio (npm), a PEP 503 index served over HTTP (pip, pipx, uv),
# a file Maven repository (Maven, Gradle), a NuGet folder feed, an apt repository (apt-ftparchive), and a plain HTTP
# directory for the release assets (Homebrew). Distribution package managers run in clean containers of that
# distribution: Debian (apt), Fedora (rpmbuild, dnf), Arch (makepkg, pacman), Alpine (abuild, apk), Homebrew, Miniforge
# (conda-build). Chocolatey and Scoop need Windows: their scripts run under PowerShell for Linux, with Chocolatey's three
# helper functions stood in.
#
# Needs: python3, node and npm, mvn, gradle, dotnet, docker, curl. Images come from mirror.gcr.io (Docker Hub rate limits)
# unless MIRROR is set. Behind a TLS-inspecting proxy, set CA_BUNDLE to its CA file; it is added to every container.
set -uo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SAMPLES=$(cd "$HERE/.." && pwd); BUILD="$SAMPLES/build"
V=$(cat "$SAMPLES/VERSION"); W=${WORK:-$(mktemp -d)}; MIRROR=${MIRROR:-mirror.gcr.io/library}; CA=${CA_BUNDLE:-}
targets=("$@"); [ ${#targets[@]} -eq 0 ] && targets=(npm pip maven gradle nuget apt rpm arch alpine brew conda choco scoop)
[ -f "$BUILD/cookwala-samples-$V.pyz" ] || { echo "run samples/packaging/build.py first"; exit 2; }
declare -A RESULT; pids=()
ok()   { RESULT[$1]="ok   $2"; echo "  ok: $2"; }
bad()  { RESULT[$1]="FAIL $2"; echo "  FAIL: $2"; }
freeport() { python3 -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])'; }
# Every local registry gets a port the OS says is free, so a server left over from an earlier run can never answer instead.
P_NPM=$(freeport); P_PYPI=$(freeport); P_APT=$(freeport); P_REL=$(freeport); P_SDIST=$(freeport)
serve() { (cd "$2" && exec python3 -m http.server "$1" --bind 127.0.0.1 >/dev/null 2>&1) & pids+=($!)
  for _ in $(seq 1 50); do curl -s -o /dev/null "http://127.0.0.1:$1/" && return 0; sleep 0.1; done; echo "  server on $1 did not start"; return 1; }
served_rel=""; serve_rel() { [ -n "$served_rel" ] && return 0; mkdir -p "$W/rel" && cp "$BUILD/cookwala-samples-$V.pyz" "$W/rel/" && serve "$P_REL" "$W/rel" && served_rel=1; }
cleanup() { for p in "${pids[@]:-}"; do kill "$p" 2>/dev/null; done; }
trap cleanup EXIT
cavol=(); [ -n "$CA" ] && cavol=(-v "$CA:/ca.crt:ro")
expect_demo() { grep -q "6 runs: 3 completed, 1 failed, 1 refused, 1 stopped" "$1"; }

t_npm() {
  local R=http://127.0.0.1:$P_NPM/
  mkdir -p "$W/verdaccio" && printf 'storage: ./storage\nuplinks: {}\npackages:\n  "**": {access: $all, publish: $all}\nlog: {type: stdout, level: error}\n' > "$W/verdaccio/config.yaml"
  npm i --silent --prefix "$W/vtool" verdaccio@6 >/dev/null 2>&1 || { bad npm "verdaccio install"; return; }
  (cd "$W/verdaccio" && exec "$W/vtool/node_modules/.bin/verdaccio" --config config.yaml --listen 127.0.0.1:$P_NPM >/dev/null 2>&1) & pids+=($!)
  for _ in $(seq 1 100); do curl -s -o /dev/null "$R-/ping" && break; sleep 0.2; done
  (cd "$SAMPLES/js" && npm publish --registry $R --//127.0.0.1:$P_NPM/:_authToken=x >/dev/null 2>&1) || { bad npm "publish to the local registry"; return; }
  local U="$W/npmuser"; mkdir -p "$U"
  ( export HOME=$U NPM_CONFIG_CACHE=$U/cache NPM_CONFIG_PREFIX=$U/global NPM_CONFIG_REGISTRY=$R; cd "$U"
    npx --yes @cookwala/samples demo > npx.out && expect_demo npx.out &&
    npm i -g @cookwala/samples >/dev/null 2>&1 && "$U/global/bin/cookwala-samples" version | grep -q "$V" ) \
    && ok npm "npx @cookwala/samples demo; npm i -g @cookwala/samples" || bad npm "npx or npm i -g"
}

t_pip() {
  local idx="$W/pypi/simple/cookwala-samples"; mkdir -p "$idx" && cp "$BUILD"/cookwala_samples-"$V"* "$idx"/
  (cd "$idx" && for f in cookwala_samples-*; do echo "<a href=\"$f#sha256=$(sha256sum "$f" | cut -d' ' -f1)\">$f</a>"; done > index.html)
  serve "$P_PYPI" "$W/pypi" || { bad pip "index server"; return; }; local I=http://127.0.0.1:$P_PYPI/simple
  python3 -m venv "$W/pip1" && "$W/pip1/bin/pip" install -q --index-url $I cookwala-samples 2>/dev/null && "$W/pip1/bin/cookwala-samples" demo > "$W/pip.out" && expect_demo "$W/pip.out" \
    && python3 -m venv "$W/pip2" && "$W/pip2/bin/pip" install -q --no-binary cookwala-samples --index-url $I --extra-index-url https://pypi.org/simple cookwala-samples 2>/dev/null && "$W/pip2/bin/cookwala-samples" version | grep -q "$V" \
    && python3 "$BUILD/cookwala-samples-$V.pyz" version | grep -q "$V" \
    && ok pip "pip install (wheel and sdist); python3 cookwala-samples-$V.pyz" || bad pip "pip install"
  if command -v uvx >/dev/null; then UV_CACHE_DIR="$W/uv" uvx --index-url $I cookwala-samples version | grep -q "$V" && ok uv "uvx cookwala-samples" || bad uv "uvx"; fi
}

t_maven() {
  (cd "$SAMPLES/java" && mvn -B -q deploy -DskipTests -DaltDeploymentRepository=local::file://"$W/m2repo" >/dev/null 2>&1) || { bad maven "deploy to a file repository"; return; }
  mkdir -p "$W/mvnapp/src/main/java/app"
  printf '<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>app</groupId><artifactId>c</artifactId><version>1</version><properties><maven.compiler.release>17</maven.compiler.release></properties><repositories><repository><id>t</id><url>file://%s/m2repo</url></repository></repositories><dependencies><dependency><groupId>ai.cookwala</groupId><artifactId>cookwala-samples</artifactId><version>%s</version></dependency></dependencies></project>\n' "$W" "$V" > "$W/mvnapp/pom.xml"
  printf 'package app;\npublic class Main { public static void main(String[] a) { System.out.println(ai.cookwala.samples.Scenarios.demo().summary().get("outcomes")); } }\n' > "$W/mvnapp/src/main/java/app/Main.java"
  (cd "$W/mvnapp" && mvn -B -q -Dmaven.repo.local="$W/m2cache" compile exec:java -Dexec.mainClass=app.Main 2>/dev/null | grep -q "completed=3") \
    && java -jar "$W/m2repo/ai/cookwala/cookwala-samples/$V/cookwala-samples-$V.jar" version 2>/dev/null | grep -q "$V" \
    && ok maven "dependency ai.cookwala:cookwala-samples:$V; java -jar" || bad maven "consumer project"
}

t_gradle() {
  [ -d "$W/m2repo" ] || t_maven
  mkdir -p "$W/gradleapp/src/main/java/app" && cp "$W/mvnapp/src/main/java/app/Main.java" "$W/gradleapp/src/main/java/app/"
  echo 'rootProject.name = "c"' > "$W/gradleapp/settings.gradle.kts"
  printf 'plugins { application }\nrepositories { maven { url = uri("file://%s/m2repo") } }\ndependencies { implementation("ai.cookwala:cookwala-samples:%s") }\napplication { mainClass.set("app.Main") }\n' "$W" "$V" > "$W/gradleapp/build.gradle.kts"
  (cd "$W/gradleapp" && GRADLE_USER_HOME="$W/gradlehome" gradle -q --no-daemon run 2>/dev/null | grep -q "completed=3") \
    && ok gradle "implementation(\"ai.cookwala:cookwala-samples:$V\")" || bad gradle "consumer project"
}

t_nuget() {
  (cd "$SAMPLES/dotnet" && dotnet pack -v q -c Release -o "$W/feed" >/dev/null 2>&1) || { bad nuget "dotnet pack"; return; }
  ( export DOTNET_CLI_HOME="$W/dotnetuser" NUGET_PACKAGES="$W/dotnetuser/pkgs" DOTNET_NOLOGO=1 DOTNET_CLI_TELEMETRY_OPTOUT=1
    cd "$W" && dotnet new console -o netapp >/dev/null 2>&1 && cd netapp && dotnet nuget add source "$W/feed" -n local >/dev/null &&
    dotnet add package Cookwala.Samples --version "$V" >/dev/null 2>&1 &&
    printf 'Console.WriteLine(Cookwala.Samples.Scenarios.Demo().Summary()["outcomes"]?.ToJsonString());\n' > Program.cs &&
    dotnet run -v q 2>/dev/null | grep -q '"completed":3' &&
    dotnet tool install -g Cookwala.Samples.Tool --version "$V" --add-source "$W/feed" >/dev/null 2>&1 &&
    "$DOTNET_CLI_HOME/.dotnet/tools/cookwala-samples" version | grep -q "$V" ) \
    && ok nuget "dotnet add package Cookwala.Samples; dotnet tool install -g Cookwala.Samples.Tool" || bad nuget "dotnet add package or tool install"
}

t_apt() {
  mkdir -p "$W/apt" && cp "$BUILD/cookwala-samples_${V}_all.deb" "$W/apt/"
  (cd "$W/apt" && docker run --rm -v "$W/apt:/r" -w /r "$MIRROR/debian:12-slim" sh -c 'apt-get update -qq >/dev/null && apt-get install -y -qq apt-utils >/dev/null 2>&1; apt-ftparchive packages . > Packages; apt-ftparchive release . > Release') >/dev/null 2>&1
  serve "$P_APT" "$W/apt" || { bad apt "repository server"; return; }
  docker run --rm --network host -e P="$P_APT" "$MIRROR/debian:12-slim" sh -c 'echo "deb [trusted=yes] http://127.0.0.1:$P ./" > /etc/apt/sources.list.d/c.list && apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq cookwala-samples >/dev/null 2>&1 && cookwala-samples demo | grep -q "6 runs: 3 completed" && apt-get remove -y -qq cookwala-samples >/dev/null 2>&1 && [ ! -e /usr/bin/cookwala-samples ]' \
    && ok apt "apt-get install cookwala-samples (Debian 12), run, remove" || bad apt "apt-get install"
}

t_rpm() {
  docker run --rm -v "$BUILD:/b:ro" "${cavol[@]}" "$MIRROR/fedora:41" sh -c '[ -f /ca.crt ] && cp /ca.crt /etc/pki/ca-trust/source/anchors/proxy.crt && update-ca-trust; dnf install -y -q rpm-build python3 >/dev/null 2>&1; mkdir -p ~/rpmbuild/SOURCES && cp /b/*.pyz ~/rpmbuild/SOURCES/ && rpmbuild -bb /b/manifests/rpm/cookwala-samples.spec >/dev/null 2>&1 && dnf install -y -q ~/rpmbuild/RPMS/noarch/*.rpm >/dev/null 2>&1 && cookwala-samples demo | grep -q "6 runs: 3 completed" && dnf remove -y -q cookwala-samples >/dev/null 2>&1' \
    && ok rpm "rpmbuild -bb (with %check); dnf install (Fedora 41), run, remove" || bad rpm "rpmbuild or dnf"
}

t_arch() {
  docker run --rm -v "$BUILD:/b:ro" "${cavol[@]}" "$MIRROR/archlinux:latest" sh -c '[ -f /ca.crt ] && cp /ca.crt /etc/ca-certificates/trust-source/anchors/proxy.crt && update-ca-trust; pacman -Sy --noconfirm --needed base-devel python >/dev/null 2>&1; useradd -m b; mkdir /home/b/p && cp /b/manifests/arch/PKGBUILD /b/*.pyz /home/b/p/ && chown -R b /home/b/p; su b -c "cd ~/p && makepkg -f >/dev/null 2>&1" && pacman -U --noconfirm /home/b/p/*.pkg.tar.zst >/dev/null 2>&1 && cookwala-samples demo | grep -q "6 runs: 3 completed" && pacman -R --noconfirm cookwala-samples >/dev/null' \
    && ok arch "makepkg (sha256 and check()); pacman -U, run, pacman -R" || bad arch "makepkg or pacman"
}

t_alpine() {
  docker run --rm -v "$BUILD:/b:ro" "${cavol[@]}" "$MIRROR/alpine:3.20" sh -c '[ -f /ca.crt ] && cat /ca.crt >> /etc/ssl/certs/ca-certificates.crt; apk add -q alpine-sdk python3 >/dev/null 2>&1; adduser -D b; addgroup b abuild; mkdir -p /home/b/a/cookwala-samples /home/b/src && cp /b/manifests/alpine/APKBUILD /home/b/a/cookwala-samples/ && cp /b/*.pyz /home/b/src/ && chown -R b /home/b; su b -c "abuild-keygen -a -n >/dev/null 2>&1" && cp /home/b/.abuild/*.rsa.pub /etc/apk/keys/ && su b -c "cd ~/a/cookwala-samples && SRCDEST=~/src abuild -r >/dev/null 2>&1" && apk add -q /home/b/packages/a/x86_64/cookwala-samples-*.apk && cookwala-samples demo | grep -q "6 runs: 3 completed" && apk del -q cookwala-samples' \
    && ok alpine "abuild -r (sha256 and check()); apk add, run, apk del" || bad alpine "abuild or apk"
}

t_brew() {
  serve_rel || { bad brew "asset server"; return; }
  sed "s#url \".*/cookwala-samples-#url \"http://127.0.0.1:$P_REL/cookwala-samples-#" "$BUILD/manifests/homebrew/cookwala-samples.rb" > "$W/cookwala-samples.rb"
  docker run --rm --network host -u root -v "$W/cookwala-samples.rb:/f.rb:ro" "${cavol[@]}" ghcr.io/homebrew/brew:latest sh -c '[ -f /ca.crt ] && cat /ca.crt >> /etc/ssl/certs/ca-certificates.crt; chown -R linuxbrew /home/linuxbrew; su linuxbrew -c "export HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_ANALYTICS=1 HOMEBREW_CURLRC=1; echo cacert=/etc/ssl/certs/ca-certificates.crt > ~/.curlrc; eval \$(/home/linuxbrew/.linuxbrew/bin/brew shellenv); brew tap-new -q --no-git local/cookwala >/dev/null 2>&1; cp /f.rb \$(brew --repo local/cookwala)/Formula/cookwala-samples.rb && brew install -q local/cookwala/cookwala-samples >/dev/null 2>&1 && cookwala-samples demo | grep -q \"6 runs: 3 completed\" && brew test local/cookwala/cookwala-samples >/dev/null 2>&1"' \
    && ok brew "brew install (with python@3.12), run, brew test" || bad brew "brew install or test"
}

t_conda() {
  [ -f "$BUILD/cookwala_samples-$V.tar.gz" ] || { bad conda "no sdist (pip install build, then build.py)"; return; }
  mkdir -p "$W/sdist" "$W/conda" && cp "$BUILD/cookwala_samples-$V.tar.gz" "$W/sdist/"; serve "$P_SDIST" "$W/sdist" || { bad conda "sdist server"; return; }
  sed "s#url: https://pypi.org/packages/source/c/cookwala-samples/#url: http://127.0.0.1:$P_SDIST/#" "$BUILD/manifests/conda/meta.yaml" > "$W/conda/meta.yaml"
  docker run --rm --network host -v "$W/conda:/recipe:ro" "${cavol[@]}" mirror.gcr.io/condaforge/miniforge3:latest bash -c '[ -f /ca.crt ] && { conda config --set ssl_verify /ca.crt; export REQUESTS_CA_BUNDLE=/ca.crt SSL_CERT_FILE=/ca.crt; }; step() { "$@" > /tmp/step.log 2>&1 || { echo "  failed: $*"; tail -25 /tmp/step.log | sed "s/^/    | /"; exit 1; }; }; step conda install -y -q conda-build; step conda build -q /recipe --output-folder /tmp/out; step conda create -y -q -n t -c /tmp/out -c conda-forge cookwala-samples; conda run -n t cookwala-samples demo | grep -q "6 runs: 3 completed"' \
    && ok conda "conda build (with the recipe tests); conda create, run" || bad conda "conda build or install"
}

t_choco() {
  serve_rel || { bad choco "asset server"; return; }
  cat > "$W/choco.ps1" <<'PS'
$ErrorActionPreference = 'Stop'
function Get-ChocolateyWebFile { param($PackageName, $FileFullPath, $Url, $Checksum, $ChecksumType)
  Invoke-WebRequest -Uri ($Url -replace '^https://.*/', "http://127.0.0.1:$env:P/") -OutFile $FileFullPath
  if ((Get-FileHash $FileFullPath -Algorithm SHA256).Hash.ToLower() -ne $Checksum) { throw 'checksum mismatch' } }
function Update-SessionEnvironment {}
function Install-BinFile { param($Name, $Path, $Command) Set-Content "/usr/local/bin/$Name" "#!/bin/sh`nexec $Path $($Command.Trim('""')) `"`$@`""; chmod +x "/usr/local/bin/$Name" }
function Uninstall-BinFile { param($Name) Remove-Item "/usr/local/bin/$Name" }
New-Item -ItemType Directory /pkg/tools -Force | Out-Null; Copy-Item /src/tools/*.ps1 /pkg/tools/
& /pkg/tools/chocolateyinstall.ps1
if (-not ((& cookwala-samples version) -match '\d')) { exit 1 }
& /pkg/tools/chocolateyuninstall.ps1
if (Test-Path /usr/local/bin/cookwala-samples) { exit 1 }
PS
  docker run --rm --network host -e P="$P_REL" -v "$BUILD/manifests/chocolatey:/src:ro" -v "$W/choco.ps1:/h.ps1:ro" mcr.microsoft.com/powershell:latest sh -c '(apt-get update -qq && apt-get install -y -qq python3) >/dev/null 2>&1; ln -sf /usr/bin/python3 /usr/local/bin/python; pwsh -NoProfile -File /h.ps1' \
    && docker run --rm -v "$BUILD/manifests/chocolatey:/src:ro" mirror.gcr.io/chocolatey/choco:latest sh -c 'cp -r /src /w && cd /w && choco pack cookwala-samples.nuspec >/dev/null' \
    && ok choco "choco pack; install and uninstall scripts under PowerShell (Chocolatey helpers stood in)" || bad choco "choco pack or scripts"
}

t_scoop() {
  docker run --rm -v "$BUILD/manifests/scoop:/s:ro" mcr.microsoft.com/powershell:latest pwsh -NoProfile -Command '$m = Get-Content /s/cookwala-samples.json | ConvertFrom-Json; $dir = "/tmp/a"; New-Item -ItemType Directory $dir | Out-Null; Invoke-Expression $m.pre_install; if ((Get-Content "$dir/cookwala-samples.cmd") -notmatch "cookwala-samples.pyz") { exit 1 }; if ($m.hash.Length -ne 64) { exit 1 }' \
    && ok scoop "manifest parses; pre_install writes the launcher (running it needs Windows)" || bad scoop "manifest"
}

for t in "${targets[@]}"; do echo "== $t"; "t_$t"; done
echo; echo "Summary (work dir $W):"; fails=0
for k in "${!RESULT[@]}"; do echo "  $k: ${RESULT[$k]}"; [[ ${RESULT[$k]} == FAIL* ]] && fails=$((fails + 1)); done
exit $fails
