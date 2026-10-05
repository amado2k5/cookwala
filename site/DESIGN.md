# Cookwala design system

**Status:** 2026-10-04 (v2). The rules every page follows, and why the site has a build step.

## 1. Feel

Calm, precise, warm. A professional instrument with a kitchen soul. The restraint of the
best robotics sites in type and whitespace, without their darkness or their robots; the
clarity of the best developer docs; the plainness of the standards bodies that people trust.
Safety is the hero, shown as numbers with units. Nothing is exciting; everything is legible.

## 2. Why a build step

The v1 site was hand-written HTML plus a client-side Markdown viewer. v2 has about 25 pages in
two languages plus some 50 rendered documents, a whitepaper and a deck. A small Python
generator (`tools/build_site.py`, standard library only) gives: one layout for every page, a
language switch and `hreflang` links, server-rendered documentation that works without
JavaScript and is indexable, consistent status chips, and one place to change the navigation.
No npm dependency; GitHub Pages deployment is unchanged (`tools/build_site.sh` calls it).
Markdown is rendered by `tools/md.py`, a small converter for the subset the docs use.

## 3. Layout

- One centred column, maximum 1120 px, 20 px side gutters (16 px at phone width); full-bleed
  tinted bands for alternating sections.
- Phone first: every layout collapses to one column below 760 px; no horizontal scroll at
  360 px; tables scroll inside their own container.
- Sticky header with the brand, five navigation links, a "more" group, and the language switch.
- Documentation: three columns (navigation, content, on-this-page) collapsing to one.
- Right-to-left for Arabic: `dir="rtl"` on `<html>`, logical properties (`margin-inline`,
  `padding-inline`, `text-align: start`) everywhere, so no mirrored stylesheet is needed.

## 4. Type

- UI and prose: Geist (Google Fonts, `display=swap`), system sans fallback.
- Data and code: Geist Mono, monospace fallback.
- Arabic: IBM Plex Sans Arabic for prose, with the same sizes; Latin digits in technical content.
- Scale (px): 13 note, 14 small, 16 body, 17 h3, 26 to 36 h2 (fluid), 38 to 76 h1 (fluid,
  weight 300, letter-spacing −0.03em). Line height 1.6 body, 1.02 h1, 1.15 h2.
- Measure: prose at most 78 characters; captions at most 70.

## 5. Colour tokens

Defined on `:root`, redefined for dark under `@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]`. All pairs
checked at or above WCAG AA (4.5:1 for text, 3:1 for large text and UI).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | #f6f7f8 | #0f1113 | page background |
| `--surface` | #ffffff | #16191c | cards, code |
| `--band` | #eef0f3 | #14171a | alternating sections |
| `--ink` | #121417 | #eceef0 | text |
| `--ink-2` | #4a5059 | #a6adb6 | secondary text (7.1:1 light, 8.9:1 dark on paper) |
| `--line` | #dfe2e6 | #2a2f35 | borders |
| `--ember` | #d9481c | #ff7a45 | the one accent: links, primary buttons, temperature data |
| `--ember-ink` | #ffffff | #1a0b05 | text on ember |
| `--ember-soft` | #fbe6de | #2c1810 | accent backgrounds |
| `--ok` | #1f7a4d | #4cc38a | accepted, measured |
| `--warn` | #9a5b00 | #e2a64d | needs a person, modelled, draft |
| `--bad` | #b42318 | #f2867d | refused, blocked |

Colour never carries meaning alone: every status has a word.

## 6. Status chips

Every spec, profile, page and roadmap item shows one: **Core normative**, **draft profile**,
**experimental**, **planned**, **not yet funded**, **illustrative model**. Mono, 12 px,
uppercase, a dot in the status colour, the word always present.

## 7. Numbers

Every number on the site carries a label in small mono caps next to it: **measured**,
**modelled** or **assumed**, with the source in a title attribute or an adjacent note. Numbers
in prose are avoided; they live in stat tiles and tables. Tabular numerals.

## 8. Components

- **Hero:** chip, one sentence, triad, two buttons. One per page.
- **Pathfinder:** two selects ("I am a…", "I want to…") that route to a page and a first
  action; works without JavaScript as a list of links.
- **Stat tile:** kind label, number, label, source.
- **Path card:** title, one sentence, "first success" line.
- **Steps:** numbered vertical rail with a command and an expected output block.
- **Safety sheet:** a definition list of numbers with units.
- **Now / next / later** columns with a status on every item.
- **"What we don't know yet" and "What went wrong" blocks** on impact, humanitarian and
  roadmap pages; never empty ("nothing recorded yet").
- **Code block:** language label, copy button, output block after it.
- **Table:** scrolls inside its container; header row in band colour.

## 9. Diagrams

Inline SVG, stroke 1.5 px in `--ink-2`, fills in `--surface` and `--ember-soft`, text in Geist
13 px, one accent only. Each diagram has a title and a text alternative. Never a picture of a
robot; the mechanism is drawn (a step, an envelope, a feed, a handover).

## 10. Imagery

No stock robots, no photographs of real companies' products, no pictures of real people
without consent and a stated purpose, no children's faces, no poverty imagery. Until
consented photography of real kitchens, farms, hands and food banks exists, pages use
diagrams, the live demos and data. Any generated image, if ever used, is labelled
"illustration".

## 11. Motion

One purposeful moment per page at most (the dry run revealing its verdict, the envelope
trace drawing). Everything respects `prefers-reduced-motion: reduce`. No parallax, no
autoplay video, no animated backgrounds.

## 12. Accessibility

WCAG 2.2 AA: skip link, landmarks, one h1 per page, visible focus (2 px ember outline),
keyboard-operable controls, labels on every form control, `aria-live` on results, contrast as
above, no information by colour alone, reduced motion, text resizable to 200 % without loss,
target size at least 24 px. Arabic pages have `lang="ar"` and `dir="rtl"`.

## 13. Performance

Static HTML, one CSS file (about 12 KB), scripts deferred and only on pages that need them,
fonts with `display=swap` and preconnect, no third-party scripts except the fonts, no
tracking, no cookies. Images are SVG. Target: Largest Contentful Paint under 2.5 s on a slow
phone, no layout shift from fonts (metrics-compatible fallbacks), interaction ready
immediately.

## 14. Privacy

No analytics, no cookies, no forms that post anywhere. Contact is a GitHub link and a mailto
shown as text. The dry run and the walkthroughs run entirely in the browser.

## 15. Writing

`docs/MESSAGING.md` applies to every string, in both languages.

## Brand (2026-10-05)

- **Mark:** a bowl with an ember above it (`site/assets/mark.svg`, also the favicon). The bowl is
  drawn in `currentColor`, so it follows the theme; the ember keeps its warm gradient. Inline in
  the header so it needs no extra request.
- **Wordmark:** "Cookwala" set in Fraunces 600 (Google Fonts, loaded with the body fonts). In
  Arabic-script editions the brand string is the local name in the body font.
- **Logo and banner:** `site/assets/logo.svg` (mark + wordmark, for README and documents) and
  `site/assets/banner.png` (1200 × 630, the `og:image` for link previews; rendered from a small
  HTML page with headless Chrome, source in the session notes).
- **Diagrams:** inline SVG under `site/templates/diagrams/`, placed with `{{diagram:name}}`;
  every label is a site string (`goals.*`), so diagrams translate and switch theme with the page.
  Boxes use `--surface` and `--line`; refusals and limits use `--ember`. No stock imagery.
