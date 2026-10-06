# RPM — spec proven in CI, blocked on a COPR or Fedora submission

Every `samples.yml` run rebuilds the spec inside a Fedora 41 container: `rpmbuild -bb` (with
`%check` running the demo), `dnf install`, `cookwala-samples demo`, `dnf remove`. The package
itself is proven; there is no public `dnf install cookwala-samples` — Fedora carries no such
package and no `cookwala` COPR exists (the claims checker verifies both). The tile honestly says
"manifest ready · not yet submitted".

## Options for a real RPM repository

### COPR — recommended first step

Needs: a Fedora Account (FAS) and a COPR API token (`dnf install copr-cli`, then the token from
`copr.fedorainfracloud.org/api`).

```bash
copr-cli create cookwala-samples --chroot fedora-41-x86_64 --chroot epel-9-x86_64 \
  --description 'Cookwala samples — simulated devices or any Cookwala hub'
rpmbuild -bs cookwala-samples.spec           # or mock --rebuild our noarch rpm
copr-cli build cookwala-samples ~/rpmbuild/SRPMS/cookwala-samples-*.src.rpm
```

Users then `dnf copr enable amado2k5/cookwala-samples && dnf install cookwala-samples`.

### Fedora proper

Needs the FAS account plus a package-review ticket in Bugzilla and a reviewer — weeks, not days;
worth pursuing once a COPR shows real installs.

## Blocked on maintainer (task section 8)

- FAS account + COPR project + API token (`COPR_LOGIN` / `COPR_TOKEN` secrets if a tag-time
  `copr-cli build` step is wanted).
- The tile flips to `live` only after a clean `dnf copr enable … && dnf install` in a fresh
  container — the checker's `rpm:` check will flag it the moment the COPR appears.
