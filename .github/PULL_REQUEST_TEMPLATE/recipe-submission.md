<!-- Adding a recipe? Use this template. For anything else, GitHub's default PR form is fine. -->

## Recipe submission

- [ ] This is my own recipe, **or** I've named the source and it allows this (see "Rights" below).
- [ ] The file lives at `recipes/community/<my-prefix>/<id>.cookwala.json`, and the id starts with `<my-prefix>-`.
- [ ] If this is the first recipe under this prefix, I added one entry for it to `recipes/community/NAMESPACES.json` in this same PR, with `"owner"` equal to my GitHub login.
- [ ] `python tools/validate_specs.py` passes locally (or I've read the CI comment this PR gets and I'm asking for help with what's left).
- [ ] I ran `git commit -s` (sign-off = acceptance of the [Contributor License Agreement](../../CONTRIBUTOR-LICENSE-AGREEMENT.md)).
- [ ] No pork, alcohol, or hidden non-halal ingredients, **or** I've noted that this recipe isn't meant to be halal-gated (see `docs/CONTRIBUTE-RECIPES.md`).

### Rights

What is this recipe based on, and what am I allowed to publish?

- [ ] My own recipe. Licence: CC-BY-4.0 or CC0 (pick one and put it in the `license` field).
- [ ] From a book, site, channel or person who isn't me. I've put their name/URL in `source`, and I understand this enters as **facts only** (`license: "LicenseRef-source-credited"`, no step text) until rights are confirmed — see `docs/CONTRIBUTE-RECIPES.md` and `LICENSES/LicenseRef-source-credited.md`.

### What it is

<!-- Dish name, cuisine, why it's worth adding. One or two lines is plenty. -->

### Checks

<!-- Leave this section for the bot. It will comment with the validator output. -->
