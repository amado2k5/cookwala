# Artifactory — bring your own instance, proven end to end

Artifactory is deliberately **BYO-instance** on the samples page: there is no public
`cookwala-samples` Artifactory, and the tile does not claim one. What is proven is that
`publish.sh` really works — the `samples-channel-artifactory` workflow runs it against a throwaway
Artifactory OSS container on every change: the local pypi/npm/maven/generic repositories are
declared in an `artifactory.config.bootstrap.xml` (the repository REST API is Pro-only — on OSS
even creating a local repository needs it), the script publishes every artifact through the real
REST endpoints, and the pypi and maven packages install back out of the instance.

## What exists

- `publish.sh` — publishes to pypi / npm / maven / gradle / nuget / debian / rpm / docker / generic
  local repositories given `ARTIFACTORY_URL` / `ARTIFACTORY_USER` / `ARTIFACTORY_TOKEN`.
- OSS edition supports generic, maven, npm and pypi local repositories. NuGet, Debian and RPM are
  Pro-only; on an OSS instance `publish.sh` will fail those targets — pass only the OSS-supported
  subset, as the workflow does (`pypi npm maven generic`).
- The tag-time publish job in `samples.yml` calls `publish.sh` when the `ARTIFACTORY_*` secrets are
  set; it is skipped otherwise.

## For a maintainer pointing at their own instance

1. Create the local repositories matching the package types you want (`cookwala-pypi-local`,
   `cookwala-maven-local`, …, or set the `*_REPO` overrides in the script header).
2. Export the three `ARTIFACTORY_*` variables (an access token with deploy rights).
3. `python samples/packaging/build.py` then `samples/packaging/artifactory/publish.sh <targets>`.

Nothing here is blocked on accounts — only on *an instance*, which is the point of the tile.
