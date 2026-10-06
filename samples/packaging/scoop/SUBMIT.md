# Scoop — done, and how to keep it true

The bucket is live at `github.com/amado2k5/scoop-cookwala`. `scoop bucket add cookwala
https://github.com/amado2k5/scoop-cookwala && scoop install cookwala-samples` works today — the
`samples-channel-scoop` workflow proves it on `windows-latest` for every packaging change.

## What exists

- `bucket/cookwala-samples.json` — rendered from `cookwala-samples.json.in` with the real release
  URL and sha256 (never the hash of a local build; a locally built pyz is not byte-identical to the
  release artifact).
- `.github/workflows/excavator.yml` — `ScoopInstaller/GithubActions` every four hours, so
  `checkver`/`autoupdate` bump `version`/`url`/`hash` on each `samples-v*` release.
- `README.md` — the two-line install.

## Owner and rules

- Owner: `amado2k5` (the manifest is generated — hand-edit `cookwala-samples.json.in`, re-render,
  commit; do not hand-edit `bucket/cookwala-samples.json` except as Excavator does).
- `depends: python` resolves to Scoop's `main/python`; the shim runs `python pyz`.
- A release workflow failure means the bucket is stale; a `scoop install` failure in the
  `samples-channel-scoop` job is a page-claim regression — treat it as such.
