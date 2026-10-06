#!/usr/bin/env bash
# Publish every Cookwala samples package to a JFrog Artifactory instance.
#
#   export ARTIFACTORY_URL=https://example.jfrog.io/artifactory
#   export ARTIFACTORY_USER=ci-bot ARTIFACTORY_TOKEN=...        # an access token with deploy rights
#   samples/packaging/artifactory/publish.sh [pypi npm maven nuget debian rpm docker generic]   # default: all
#
# Repository keys (create them as local repositories of the matching package type, or override):
#   PYPI_REPO=cookwala-pypi-local  NPM_REPO=cookwala-npm-local  MAVEN_REPO=cookwala-maven-local
#   NUGET_REPO=cookwala-nuget-local  DEBIAN_REPO=cookwala-debian-local  RPM_REPO=cookwala-rpm-local
#   DOCKER_REPO=cookwala-docker-local  GENERIC_REPO=cookwala-generic-local
#   DOCKER_REGISTRY=example.jfrog.io (the Docker registry host of the instance)
#
# Needs the tools of each channel you publish: python -m build + twine, npm, mvn, dotnet, docker, curl.
# Run samples/packaging/build.py first (pyz, wheel, sdist, deb).
# Note: Artifactory OSS serves only maven/gradle/ivy/sbt + generic — the other targets need a
# licensed (Pro) instance; on OSS their api/<type> endpoints simply do not exist.
set -euo pipefail

: "${ARTIFACTORY_URL:?set ARTIFACTORY_URL}" "${ARTIFACTORY_USER:?set ARTIFACTORY_USER}" "${ARTIFACTORY_TOKEN:?set ARTIFACTORY_TOKEN}"
HERE=$(cd "$(dirname "$0")" && pwd); SAMPLES=$(cd "$HERE/../.." && pwd); BUILD="$SAMPLES/build"
VERSION=$(cat "$SAMPLES/VERSION")
AF=${ARTIFACTORY_URL%/}
auth=(-u "$ARTIFACTORY_USER:$ARTIFACTORY_TOKEN")
targets=("$@"); [ ${#targets[@]} -eq 0 ] && targets=(pypi npm maven nuget debian rpm docker generic)

put() { # file, repository path
  curl -fsS "${auth[@]}" -H "X-Checksum-Sha256: $(sha256sum "$1" | cut -d' ' -f1)" -T "$1" "$AF/$2" >/dev/null && echo "  uploaded $(basename "$1") -> $2"
}

for t in "${targets[@]}"; do
  echo "== $t"
  case "$t" in
    pypi)
      python -m twine upload --non-interactive --repository-url "$AF/api/pypi/${PYPI_REPO:-cookwala-pypi-local}" \
        -u "$ARTIFACTORY_USER" -p "$ARTIFACTORY_TOKEN" "$BUILD"/cookwala_samples-"$VERSION"* ;;
    npm)
      reg="$AF/api/npm/${NPM_REPO:-cookwala-npm-local}/"
      (cd "$SAMPLES/js" && npm publish --registry "$reg" --//"${reg#https://}":_authToken="$ARTIFACTORY_TOKEN") ;;
    maven)
      # Maven needs a real settings file (it cannot read a process substitution); private to this user, removed afterwards.
      settings=$(mktemp); chmod 600 "$settings"
      printf '<settings><servers><server><id>artifactory</id><username>%s</username><password>%s</password></server></servers></settings>' "$ARTIFACTORY_USER" "$ARTIFACTORY_TOKEN" > "$settings"
      (cd "$SAMPLES/java" && mvn -B -Partifactory deploy -DskipTests -Dartifactory.url="$AF/${MAVEN_REPO:-cookwala-maven-local}" -s "$settings"); rc=$?
      rm -f "$settings"; [ $rc -eq 0 ] || exit $rc ;;
    gradle)
      (cd "$SAMPLES/java" && ARTIFACTORY_URL="$AF/${MAVEN_REPO:-cookwala-maven-local}" gradle --no-daemon publish) ;;
    nuget)
      (cd "$SAMPLES/dotnet" && dotnet pack -c Release -o "$BUILD/nuget" && \
        dotnet nuget push "$BUILD/nuget/*.nupkg" --source "$AF/api/nuget/v3/${NUGET_REPO:-cookwala-nuget-local}" --api-key "$ARTIFACTORY_USER:$ARTIFACTORY_TOKEN") ;;
    debian)
      deb="$BUILD/cookwala-samples_${VERSION}_all.deb"
      put "$deb" "${DEBIAN_REPO:-cookwala-debian-local}/pool/c/cookwala-samples/$(basename "$deb");deb.distribution=stable;deb.component=main;deb.architecture=all" ;;
    rpm)
      for f in "$BUILD"/*.rpm; do [ -e "$f" ] && put "$f" "${RPM_REPO:-cookwala-rpm-local}/$(basename "$f")"; done ;;
    docker)
      reg=${DOCKER_REGISTRY:?set DOCKER_REGISTRY}; img="$reg/${DOCKER_REPO:-cookwala-docker-local}/cookwala-samples:$VERSION"
      echo "$ARTIFACTORY_TOKEN" | docker login "$reg" -u "$ARTIFACTORY_USER" --password-stdin
      docker build -f "$SAMPLES/packaging/docker/Containerfile" -t "$img" "$SAMPLES" && docker push "$img" ;;
    generic)
      for f in "$BUILD"/cookwala-samples-"$VERSION".pyz "$BUILD"/SHA256SUMS; do put "$f" "${GENERIC_REPO:-cookwala-generic-local}/cookwala-samples/$VERSION/$(basename "$f")"; done
      echo "  render manifests against it: python samples/packaging/build.py --base-url $AF/${GENERIC_REPO:-cookwala-generic-local}/cookwala-samples/$VERSION" ;;
    *) echo "unknown target $t"; exit 2 ;;
  esac
done
