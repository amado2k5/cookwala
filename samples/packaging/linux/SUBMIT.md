# apt — .deb published on every release; a hosted repository is the open piece

`cookwala-samples_<v>_all.deb` is a real release asset and the tile's `apt install
./cookwala-samples_<v>_all.deb` is verified `live` — `install-test.sh` builds a local
`apt-ftparchive` repository on every CI run and proves `apt-get update && apt-get install`,
demo, remove inside `debian:12-slim`.

What does **not** exist is a hosted, signed apt repository, so `apt install cookwala-samples`
with no `.deb` argument does nothing. That is a deliberate non-claim today; here is how to make
it real.

## Options, cheapest first

1. **GitHub Pages + reprepro** — free, we control it, no third party. A tag-time job downloads
   the release `.deb`, runs `reprepro -b debian includedeb stable cookwala-samples_*_all.deb`,
   signs `Release`/`InRelease` with a dedicated repo key, and pushes `debian/` to gh-pages.
   Users add the keyring + `deb https://amado2k5.github.io/cookwala/debian stable main`.
   Needs: a dedicated GPG signing keypair — private half as a repo secret
   (`APT_REPO_GPG_PRIVATE_KEY`), public half served from the repo. Generating a signing key is a
   maintainer decision; nothing is signed here yet.
2. **Cloudsmith / Gemfury OSS tier** — hosted repositories, they serve; still needs an account,
   our signing config, and an API token secret.
3. **Debian proper (in the distribution)** — needs a Debian maintainer sponsor and the ITP →
   review → new-queue path; months. Worth it only if the project grows a Debian user base.

## Blocked on maintainer (task section 8)

- Choosing the host; creating/storing the signing key; approving the tag-time job that signs a
  repository.
- If option 1 lands, the tile command changes from `apt install ./…deb` to a two-line
  sources-list setup — and stays `live` because the .deb already is.
