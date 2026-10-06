# Chocolatey — submitted to the community feed, in moderation

`cookwala-samples` **0.3.0** has been pushed to the community feed. The OData v2 feed shows it with
`PackageStatus = Submitted` — that means automated validation is running and the package is **not
installable from the normal feed** yet (`choco install cookwala-samples` still fails). The samples
page therefore keeps the tile at "built and tested, not yet published" with a moderation note; the
claims checker re-reads the same feed field daily and will warn the moment moderation clears —
flip `ready` → `live` in `samples/dist-channels.json` only after a real `choco install
cookwala-samples` succeeds in a clean environment.

## What exists

- `cookwala-samples.nuspec.in` — metadata, `python3` dependency, checksum'd payload.
- `tools/chocolatey{install,uninstall}.ps1.in` — download the release pyz, shim it, remove it.
- `samples-channel-chocolatey.yml` — on `windows-latest`: `choco pack`, install from the local
  `.nupkg` source (no moderation needed for a local source), demo, uninstall, and the feed status
  printed for visibility.
- The tag-time `chocolatey` job in `samples.yml` pushes the nupkg on `samples-v*` tags.

## Moderation — what to expect

- Automated: package-validator + package-verifier (VirusTotal etc.) — usually hours to a day.
- Human review follows if automation flags anything; typical community feed turnaround is days to
  a couple of weeks. The moderation thread lives on the package page
  (`community.chocolatey.org/packages/cookwala-samples`); only the maintainer who submitted can
  respond there.
- Common flags for a package like this: `python3` dependency pinning, and the shim-style install —
  both are already how similar packages (e.g. `yt-dlp`) are packaged.

## Blocked on maintainer (task section 8)

- Chocolatey community account `amado2k5` owns the submission; moderation replies and a resubmit
  (if validator fails) need that login.
- The `CHOCO_API_KEY` repo secret already backs the tag-time push step in `samples.yml`.
