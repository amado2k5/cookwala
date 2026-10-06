# conda-forge — recipe proven in CI, blocked on a staged-recipes PR

Every `samples.yml` run builds the recipe on `miniforge3` (`conda build` executes its `test:`
section), then `conda create -c <local> -c conda-forge cookwala-samples` and runs the demo. The
recipe is proven; `conda-forge` has no `cookwala-samples` (the claims checker verifies — HTTP 404).

## Submitting to conda-forge

1. Fork `conda-forge/staged-recipes`, add `recipes/cookwala-samples/meta.yaml` — the rendered
   recipe from `samples/build/manifests/conda/meta.yaml`.
2. Recipe requirements ours already meets: license file bundled (`license_file`), `noarch:
   python` (pure zipapp), complete `about:` block, `requirements: run: python >=3.9`, and a
   `test:` that runs the demo.
3. `recipe-maintainers:` must list a GitHub user who consents — conventionally the person opening
   the PR (`amado2k5`).
4. Open the PR → staged-recipes CI (linux + win + osx, `noarch` still tests all three) → a
   conda-forge member merges → the `cookwala-samples-feedstock` repo is created and the package
   reaches the CDN about an hour later.
5. After that, the conda-forge bot opens a version-bump PR on the feedstock for every PyPI
   release automatically — keeping it green is routine maintainer work.

## Blocked on maintainer

- The staged-recipes PR itself is a public submission — needs the explicit go-ahead plus the
  maintainer's consent to be listed in `recipe-maintainers`.
- Tile flips to `live` only after `conda install -c conda-forge cookwala-samples` runs clean in
  a fresh environment.
