# Snap — built and installed in CI, blocked on a Snap Store account

The `samples-channel-snap` workflow builds `cookwala-samples_*.snap` with `snapcraft pack
--destructive-mode` and installs it `snap install --dangerous` on the same disposable runner,
then runs the demo. The package itself is proven; the public `snap install cookwala-samples
--edge` claim is **not** — the Snap Store knows no `cookwala-samples`.

## What exists

- `snapcraft.yaml` — core24, strict confinement, `python` plugin over `samples/python`, plugs
  `network`, `network-bind`, `home`; `grade: devel` (matches the `--edge` channel shown on the
  tile).

## What a maintainer must do (task section 8)

1. Register the snap name: `snapcraft register cookwala-samples` (needs a Snapcraft developer
   account — check name availability first; `cookwala-samples` is unclaimed as of writing).
2. Store credentials: `snapcraft export-login snapcraft.txt` (or the Ubuntu One / Snap Store
   login) — **do not commit** the exported file; it is a long-lived credential. Add it as the
   `SNAPCRAFT_STORE_CREDENTIALS` repo secret.
3. Release on tags, e.g. extend `samples.yml`'s tag-only publish job:

   ```yaml
   - uses: snapcore/action-publish@v1
     with:
       store_login: ${{ secrets.SNAPCRAFT_STORE_CREDENTIALS }}
       release: edge
       snap: cookwala-samples_*.snap
   ```

4. When the store has the snap and a clean `snap install cookwala-samples --edge` has run in a
   fresh environment, flip the tile to `live` in `samples/dist-channels.json` — the claims
   checker (`snap:` check) will keep it honest from then on.

## Verified vs not

- Verified: build, install, run, remove (this repo's CI).
- Not verified: anything on snapcraft.io — no account, no upload, no store review.
