# AUR — PKGBUILD proven in CI, blocked on an AUR account

Every `samples.yml` run does `makepkg` (fetch + checksum + `check()` running the demo),
`pacman -U`, `cookwala-samples demo`, `pacman -R` inside an `archlinux` container. The build is
proven; `yay -S cookwala-samples` finds nothing — the AUR knows no `cookwala-samples` (the claims
checker verifies).

## What a maintainer must do

1. Register at `aur.archlinux.org` and add an SSH public key to the account.
2. `git clone ssh://aur@aur.archlinux.org/cookwala-samples.git` (empty repo = new package).
3. `python samples/packaging/build.py`, copy `samples/build/manifests/arch/PKGBUILD` in, then
   `makepkg --printsrcinfo > .SRCINFO` — **.SRCINFO must be regenerated on every PKGBUILD change
   or the push is rejected**.
4. Commit both files and push. The package is a release pyz + launcher: `depends=('python>=3.9')`,
   `source` = the GitHub release asset — no `*-git` suffix, it tracks tagged releases.

## Rules that matter here

- Search before submitting (`cookwala-samples` is unclaimed); no duplicate or renamed packages.
- Maintainers must respond to comments and orphan requests; TU flagging is automated.
- Pin a release + sha256, never `source=('git+…#branch=main')` for a binary-styled package.
- Tile flips to `live` only after `yay -S cookwala-samples` works in a clean container.
