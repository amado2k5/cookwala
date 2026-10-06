# Accounts needed to finish the distribution claims

One-time maintainer signups. Every channel below is **free** — no paid tier anywhere.
For each: the site, the exact clicks, what to hand back, and what happens next.

Legend: *I* = something only the human maintainer can do (signup forms, email
verification, accepting terms). *Agent* = what I do once you have the account.

---

## 1. conda-forge — NO new account needed

Uses your existing GitHub account (`amado2k5`).

- *I*: open a pull request to `conda-forge/staged-recipes` adding
  `recipes/cookwala-samples/meta.yaml` (rendered from `samples/packaging/conda/meta.yaml.in`
  against the PyPI sdist — which is already live).
- You will be listed as a recipe maintainer in the PR.
- Once merged, the conda-forge bot builds and publishes `cookwala-samples` automatically,
  and the feedstock repo `conda-forge/cookwala-samples-feedstock` is created for you.
- Nothing to sign up for — just say go and I file it.
- Unblocks: tile `manual` → `live`.

## 2. Snap Store (snap)

- *I*: register at <https://snapcraft.io/account> — it uses **Ubuntu One**; if you
  already have an Ubuntu One account (e.g. for Launchpad) it is the same login.
- During signup it asks to **register a snap name**: register `cookwala-samples`
  (first-come; name disputes are rare for unique names).
- *I*: install `snapcraft` locally, run `snapcraft login --with` or export a macaroon
  (`snapcraft export-login`), then `snapcraft upload` + `snapcraft release` the snap that
  CI already builds (`samples-channel-snap.yml` proves install).
- Hand back: nothing if you do the `snapcraft login` step on this Mac; otherwise I give
  you the login command to run and paste back.
- Unblocks: tile `manual` → `live`.

## 3. Fedora COPR (rpm)

- *I*: create a Fedora account at <https://accounts.fedoraproject.org> — free,
  just email verification. This single account also covers Fedora infra generally.
- Go to <https://copr.fedorainfracloud.org>, log in with the Fedora account, create a
  project named `cookwala`, enable the Fedora chroots (latest releases, x86_64+aarch64).
- *Agent*: submit the rendered `cookwala-samples.spec` (already proven by `rpmbuild` in CI)
  as an SRPM build into that COPR.
- Unblocks: `sudo dnf install cookwala-samples` via the COPR → tile `manual` → `live`.

## 4. AUR (pacman/Arch)

- *I*: register at <https://aur.archlinux.org/register> — free; needs an SSH key
  (`ssh-keygen -t ed25519`, paste the public key into the AUR account profile).
- *Agent*: clone `ssh://aur@aur.archlinux.org/cookwala-samples.git`, commit the rendered
  `PKGBUILD` + `.SRCINFO` (PKGBUILD already tested by `makepkg` in CI), push.
- Hand back: the AUR username you chose + confirm the SSH key is saved. (I can generate
  the keypair locally; the private key stays on your Mac.)
- Unblocks: `yay -S cookwala-samples` → tile `manual` → `live`.

## 5. Alpine aports (apk)

- *I*: register at <https://gitlab.alpinelinux.org> — free GitLab instance
  (email confirmation; GitHub OAuth login is offered too).
- *Agent*: fork `alpine/aports`, add `community/cookwala-samples/APKBUILD` (rendered
  from `packaging/alpine/APKBUILD.in`, already proven by `abuild` in CI), open a merge
  request. Alpine merges take a maintainer review — days, not hours.
- Hand back: your GitLab username (so the MR is attributable).
- Unblocks: `apk add cookwala-samples` on Alpine edge → tile `manual` → `live`.

## 6. apt repository (two free paths — pick one)

The `.deb` on GitHub Releases is already live; this is about `apt install cookwala-samples`.

**Option A — Launchpad PPA** (free, Canonical-hosted):
- *I*: create a Launchpad account at <https://launchpad.net/+login> (also Ubuntu One),
  create a PPA named `cookwala`, and register an OpenPGP key (I can generate one locally;
  you upload the public key to Launchpad).
- *Agent*: build and `dput` the signed source package to the PPA.

**Option B — Cloudsmith OSS** (free open-source tier):
- *I*: sign up at <https://cloudsmith.com> (GitHub OAuth works), create an OSS repository.
- *Agent*: `cloudsmith push deb` the release `.deb`; they host the apt repo.

## 7. OpenShift (optional — claim is already honest as "deploy")

- *I*: free Red Hat Developer Sandbox at <https://developers.redhat.com/developer-sandbox>
  — Red Hat account (free), instant 30-day sandbox cluster, no card.
- *Agent*: `oc login` against the sandbox, apply `samples/cloud/openshift/template.yaml`
  and `knative-service.yaml`, verify endpoints, screenshot the proof.
- Hand back: the `oc login` token command from the sandbox console (or let me drive it).

## 8. Chocolatey — nothing to do

Already submitted; the feed shows `Pending Automated Review` with validation passing.
The tile honestly says "awaiting moderation" — the claims checker will flag it the moment
the package goes live, no action needed from you.

---

## Suggested order (all can be done in one sitting, ~30 min total)

1. conda-forge — say go, I file the PR immediately.
2. Snap Store / Ubuntu One — this login also covers Launchpad (item 6A).
3. Fedora account (COPR).
4. AUR + Alpine GitLab.
5. Optional: Red Hat Developer Sandbox for the OpenShift template.
