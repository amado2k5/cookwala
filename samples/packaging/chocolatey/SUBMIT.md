# Chocolatey — rejected on 2026-10-08

Moderator Windos rejected `cookwala-samples` 0.3.0: the Community Repository is for installable
software, and the samples are described as sample clients for a draft specification, not software.
They would review a package if Cookwala ships an end-user tool or SDK CLI later.

Consequences: the tile is gone from the samples page, the tag-time `chocolatey` push job is removed
from `samples.yml`, and the `CHOCO_API_KEY` environment secret in `release` is unused (may be deleted).
The files below stay so the packaging keeps building and `samples-channel-chocolatey.yml` keeps
proving the install on Windows. Resubmit only when a real end-user CLI exists.

## What exists

- `cookwala-samples.nuspec.in`, `tools/chocolatey{install,uninstall}.ps1.in`
- `samples-channel-chocolatey.yml` — `choco pack`, local-source install, demo, uninstall.
