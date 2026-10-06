# Artifactory — bring your own instance, proven end to end

Artifactory is deliberately **BYO-instance** on the samples page: there is no public
`cookwala-samples` Artifactory, and the tile does not claim one. What is proven is that
`publish.sh` really works — the `samples-channel-artifactory` workflow runs it against a throwaway
Artifactory OSS container on every change: the local maven/generic repositories are declared in
`artifactory.repository.config.import.json` (the repository REST API is Pro-gated — on OSS even
creating a local repository needs the bootstrap path), the script deploys through the real REST
endpoints, and the artifacts resolve back out of the instance.

## What exists

- `publish.sh` — publishes to pypi / npm / maven / gradle / nuget / debian / rpm / docker / generic
  local repositories given `ARTIFACTORY_URL` / `ARTIFACTORY_USER` / `ARTIFACTORY_TOKEN`.
- Artifactory **OSS** serves Maven/Gradle/Ivy/SBT and generic repositories only. pypi, npm, NuGet,
  Debian and RPM are Pro features — OSS accepts such repo definitions in the config but their REST
  endpoints do not exist (every `api/<type>` call returns 404), so `publish.sh` targets beyond
  `maven`/`generic` require a licensed instance. The workflow passes exactly that subset
  (`maven generic`), matching what OSS can actually serve.
- The tag-time publish job in `samples.yml` calls `publish.sh` when the `ARTIFACTORY_*` secrets are
  set; it is skipped otherwise.

## For a maintainer pointing at their own instance

1. Create the local repositories matching the package types you want (`cookwala-maven-local`,
   `cookwala-generic-local`, …, or set the `*_REPO` overrides in the script header). On OSS, local
   repos are created via `artifactory.repository.config.import.json` in `etc/artifactory/` — the
   repositories REST API is Pro-gated.
2. Export the three `ARTIFACTORY_*` variables (an access token with deploy rights).
3. `python samples/packaging/build.py` then `samples/packaging/artifactory/publish.sh <targets>` —
   `maven generic` on OSS, the other types need Artifactory Pro.

Nothing here is blocked on accounts — only on *an instance*, which is the point of the tile.
