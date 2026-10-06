# apk / aports — APKBUILD proven in CI, blocked on an aports merge request

Every `samples.yml` run: `abuild-keygen`, `abuild -r` (fetch + checksum + `check()` running the
demo), `apk add`, demo, `apk del` inside `alpine:3.20`. The package builds and installs cleanly;
edge/community has no `cookwala-samples` (the claims checker verifies).

## Submitting to aports

1. Alpine development lives on `gitlab.alpinelinux.org` — a maintainer creates an account there.
2. Fork `alpinelinux/aports`, add `testing/cookwala-samples/APKBUILD` — new packages enter
   `testing/`, and are promoted to `community/` only after proving maintained.
3. `python samples/packaging/build.py` renders the APKBUILD; run `abuild checksum` after any
   `source`/`pkgver` change, commit, open the merge request. aports CI rebuilds every arch.
4. aports conventions our APKBUILD already follows: `# Maintainer:` line, `arch="noarch"`,
   `options="!check"` absent (we *do* run the demo as `check()`), `pkgdesc` under ~60 chars.

## Blocked on maintainer

- The GitLab account + the MR itself (submission is a public act, needs the go-ahead).
- Tile flips to `live` only after `apk add cookwala-samples` works against a real Alpine repo
  (testing or community).
