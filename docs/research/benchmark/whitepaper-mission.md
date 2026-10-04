# Benchmark: whitepaper structure, trust models, and mission-driven storytelling

Research notes for Cookwala (open, royalty-free standard for safe cooking by people, kitchens and robots, with a humanitarian mission). Date: 2026-10-04.

Scope: eight sites, 2–4 pages each. All descriptions are paraphrased in my own words; at most one short quoted phrase per source. Where a site reports a number or outcome, it is written as "the site claims…". Nothing here implies any relationship between Cookwala and any of these organisations; they are studied only for communication and governance patterns.

Fetch notes (honesty about method):

- helix.org is JavaScript-rendered; plain fetches returned only a page title. The whitepaper and docs were read through the built-in browser pane, which rendered them fully. A different project at docs.helix.org (a lending protocol) shares the name and was ignored.
- github.com/awesome-ai-agents is an empty organisation with no public repositories. The closest well-known curated list, e2b-dev/awesome-ai-agents, was read via its raw README.
- hxlstandard.org returned HTTP 444 to every fetch and rendered blank in the browser. The HXL section relies on a WebSearch summary plus the OCHA knowledge-base page about HXL, and is marked as such.
- Open Food Facts, DPGA, W3C, IETF and WFP Innovation Accelerator were fetched directly (home plus two or three sub-pages each).

---

## 1. Helix AI (helix.org/docs/whitepaper and /docs)

Pages read: /docs/whitepaper, /docs (Getting Started, Pricing, AI Models, Skills, Developer API, x402 sections).

**Problem and approach.** The whitepaper frames blockchain interaction as too fragmented and error-prone for ordinary people, and proposes a conversational agent that turns plain-language intent into on-chain actions. Token economics occupy sections 8–9 and 11 and are ignored here.

**Offer and audience.** A chat agent for retail users, a developer API for builders, and "skills" (user-authored markdown playbooks) for power users.

**Whitepaper structure (the useful part).** Abstract → 1 Introduction (with 1.1 Vision, 1.2 Mission) → 2 Problem Statement (four numbered sub-problems) → 3 The Solution (design principles, each a short numbered subsection) → 4 Architecture (layered: application, AI processing, tool execution, wallet, data) → 5 Agent Framework (intent recognition, multi-step execution, memory, knowledge base, safety guardrails) → 6 Operations (one subsection per capability) → 7 Security Model → 8–9 economics → 10 Access and Extensibility → 11 Governance (scope plus a "progressive decentralisation" promise) → 12 Roadmap (phases labelled Completed / In Progress / unlabelled) → 13 Risk Factors → 14 Conclusion. Each heading is numbered to two levels; subsections are two to five sentences; there is a version and date line under the title ("Version 1.1" visible in the header area). The Risk Factors section is unusually candid for a product paper: it states that generated contracts are unaudited and that the model may misread intent.

**The "confirm before acting" model.** This is the part Cookwala should study closely. Three mechanisms are described: (a) tools are split into stateless (read-only) and stateful (world-changing) classes; (b) the agent holds a scoped, time-limited, revocable session key that can propose but not unilaterally execute; (c) every state-changing operation shows a summary (amounts, addresses, fees, costs) and waits for explicit approval; the user can reject at any point. Supporting guardrails: balance checks before actions, explicit cost disclosure, a cap of ten tool calls per turn, input validation. The site claims the agent is instructed by its system prompt to always ask before executing. The whitepaper's own phrase is "mandatory confirmation before any state-changing transaction".

**Communication.** Headline style is declarative product naming ("Helix AI: Autonomous Blockchain Intelligence"). Tone is confident, technical, first-person plural in the vision section, impersonal elsewhere. Proof is mostly architectural description rather than evidence; no third-party audits are cited. CTAs: "Launch App" in the header; the conclusion invites readers to try it.

**Visual system.** Light theme, white background, near-black text, a single blue accent for the primary button, a small-caps eyebrow label ("WHITEPAPER") above a large sans-serif title, a one-paragraph lede, then a sticky left table of contents of numbered sections. Docs pages use the same frame with a vertical section list instead of a nested tree. Tables for parameters; code blocks for API examples; very few images.

**Borrow / adapt / avoid.**
- Borrow: the numbered Abstract → Problem → Solution → Architecture → Security → Governance → Roadmap → Risks → Conclusion spine; the read-only vs world-changing tool split; the "propose, show, confirm, execute, log" loop; the scoped/revocable/time-limited delegation idea; the Risk Factors section; roadmap phases with status labels; a version/date line under the title.
- Adapt: for Cookwala the "state-changing" class becomes physical operations (heat, blades, pressure, serving to a person) and the confirmation must be legible to a non-technical, possibly impaired person; add a "cannot be delegated" class (actions no session may ever do).
- Avoid: marketing superlatives in a standard; proof by assertion; mixing the business model into the standard; an unlabelled final roadmap phase.

---

## 2. Curated list: e2b-dev/awesome-ai-agents (stand-in for github.com/awesome-ai-agents)

Pages read: repository page, raw README. The requested organisation exists but is empty.

**Problem and approach.** A single README that indexes roughly 150 AI agent projects so newcomers can find them, split into open-source and closed-source halves, each alphabetical.

**Offer and audience.** Developers and investors scanning the field; projects wanting visibility. The site claims about 30k stars.

**How entries are presented.** Each entry is a collapsible block: name as a link, category tags (general purpose, coding, research, multi-agent, productivity, science and so on), two to five bullet points of what it does, a links row (repo, docs, Discord, X, authors), and an optional screenshot. A banner image of the "landscape" sits at the top; badges link to a web UI with filters. Maturity is not labelled; it leaks through adjectives like experimental or early-stage. Contribution is by pull request or a form; the rule set is thin (alphabetical order, correct category). Its CTA sentence is "Create a pull request or fill in this form".

**Communication.** Friendly, emoji-led headings, short bullets, no narrative. Proof is social (stars, forks). No verification of claims made by listed projects.

**Visual system.** Markdown only: a wide landscape banner, shield badges, logos inside collapsed blocks, two-column tables in places. It depends entirely on GitHub's rendering.

**Borrow / adapt / avoid.**
- Borrow: one-screen entry template (name, tags, three bullets, links); open-source and proprietary kept in separate sections; a web view with filters generated from the same data.
- Adapt: Cookwala's registry should add machine-readable status (conformance level, last verified date, who verified) because its entries are safety-relevant, not just interesting.
- Avoid: unlabelled maturity; letting listees write their own uncaveated blurbs; a landscape image that implies endorsement; popularity as the only proof.

---

## 3. Open Food Facts (world.openfoodfacts.org)

Pages read: home, /who-we-are, /data.

**Problem and approach.** Food labels are opaque and the data behind them is locked up; the project crowdsources a product database from barcode scans and photos and publishes it as open data. Its defining phrase is "made by everyone, for everyone".

**Offer and audience.** A searchable database (the site claims roughly 4.8 million products), mobile apps that scan and contribute, computed scores (Nutri-Score, Green-Score), bulk exports (CSV, JSONL, Parquet, MongoDB dump) and an API. Audiences, in this order: eaters, contributors, producers, researchers, developers.

**Communication.** Headlines are plain statements of what the thing is and who made it; the tone is warm, collective and slightly activist. Proof is a live product count and the volunteer count; honesty shows in the origin story (a founder in 2012, an NGO in 2014, first public sponsor in 2019, a small paid team of about seven) and in the data page admitting that if a product is missing the reuser's own users can photograph it. CTAs: install the app, create an account, donate, and for reusers a guide to licence compliance. Independence is stated outright (non-profit, donation-funded, sponsor list published).

**Dignity and honesty.** People are contributors, not beneficiaries. No pity imagery; no claims about health outcomes. Uncertainty is handled structurally: scores are computed and labelled, missing data is visible as missing. The licence page is explicit about ODbL for the database, DbCL for contents and CC-BY-SA for images, with attribution wording given.

**Visual system.** White background, a horizontal wordmark, friendly flat illustrations (globe, puzzle pieces, clouds), rounded buttons, system-style sans-serif, product photos as the real content. Visually modest, not polished; it reads as a commons rather than a brand.

**Governance.** An association (NGO) plus a wiki, a code of conduct, Slack and forum; volunteers self-organise into topic teams (taxonomies, prices). Governance detail is thin on the public pages.

**Borrow / adapt / avoid.**
- Borrow: the "who we are" page as a timeline with money and headcount named; licence stack with ready-made attribution text; "data made by everyone" framing; a reuse page that is also a compliance guide.
- Adapt: Cookwala's equivalent of a product record is a recipe/safety record; show what is missing rather than hiding it.
- Avoid: thin governance pages; letting the illustration style drift into cuteness on safety content.

---

## 4. Digital Public Goods Alliance (digitalpublicgoods.net)

Pages read: home, /standard, /registry, GitHub DPGAlliance/DPG-Standard.

**Problem and approach.** Open solutions for public needs are hard to discover and hard to trust; the Alliance publishes a standard, reviews nominated projects against it, and lists the ones that pass in a registry.

**Offer and audience.** The DPG Standard (nine indicators: relevance to the SDGs, open licensing, clear ownership, platform independence, documentation, non-PII data extraction, privacy and law, open standards, and a three-part do-no-harm block on data security, illegal content and harassment), an eligibility self-check tool, a registry (the site claims about 255 entries) and membership (the site claims about 56 organisations). Audiences: governments, implementers, product teams, funders.

**Communication.** Headline style is outcome-oriented and slightly grand; tone is institutional but readable. Proof is counts, member logos, a few named outcomes and endorsements. CTAs: explore the registry, use the eligibility tool, contribute on GitHub, meet the members, subscribe. People served are mostly absent from imagery; the pictures are of implementers, leaders and infographics.

**Standard and registry governance (strongest part).** The standard is versioned (the GitHub repo shows 1.1.6, dated), has a CHANGELOG, a governance.md describing how proposals are welcomed, reviewed and merged, and is itself CC BY-SA 4.0. Review is a pipeline: application → L1 review → L2 review, with loops back for clarification or expert consultation, ending in designated / ineligible / awaiting information. Status expires: a designation is "valid for a period of one year" and must be reassessed, and projects are archived if they lapse. Registry cards carry category, SDGs, one-sentence description, an activity indicator, and link to a detail page; there is an API.

**Visual system.** Dark navy header, white body, green/teal accents, SDG wheel and icon set, clean sans-serif, grid of logo cards. Formal, UN-adjacent, low emotion.

**Borrow / adapt / avoid.**
- Borrow: a numbered indicator list with a do-no-harm block; a public self-assessment tool before formal review; two-level review with named outcomes; expiring status with annual reassessment; standard versioned in a repo with CHANGELOG and governance file; the standard itself under an open licence.
- Adapt: Cookwala's indicators should include physical-safety conformance tests, not only policy checks; the "activity indicator" should become "last conformance run".
- Avoid: imagery that shows only officials; reporting member counts as impact.

---

## 5. Humanitarian Exchange Language, HXL (hxlstandard.org) — fallback sources only

The site could not be fetched (HTTP 444) or rendered (blank page). This section is based on a WebSearch summary and the OCHA knowledge-base page describing HXL; treat it as second-hand.

**Problem and approach.** In emergencies, data arrives as inconsistent spreadsheets from many organisations. HXL does not introduce a new file format; it adds a single row of hashtags (for example tags for place, organisation, sector, population count) between the header row and the data, so existing spreadsheets become machine-readable without retraining anyone. Its own tagline, as reported by the search summary, is "a simple standard for messy data".

**Offer and audience.** A tagging convention plus a dictionary of about 32 core hashtags with attributes, an online proxy for cleaning and transforming tagged data, and Python/JavaScript libraries. Audiences: field information managers, data providers, tool builders.

**Communication (as reported).** Instructional, modest, field-first. Proof is field trials (the summary cites two real responses used as trials during the beta) rather than adoption numbers. Multilingual postcards for field staff suggest the audience is people with little time. The beta-to-1.0 story was told openly: a public call for comments, a working group deciding which tags to restore or add, and a final release described as nearly identical to the beta.

**Governance (as reported).** An HXL Working Group sets the standard; OCHA's Centre for Humanitarian Data provides operational support; discussion runs on a public mailing list; versions are explicit (1.0 beta, 1.0 final, 1.1 final) and published at versioned URLs.

**Dignity.** Not assessable from the fallbacks; the OCHA page does not discuss sensitive-data handling, which is itself a gap worth noting.

**Visual system.** Not observed. Do not describe.

**Borrow / adapt / avoid.**
- Borrow: the "augment what people already use" design philosophy (Cookwala layers on existing recipes and existing appliances rather than replacing them); versioned, permanent URLs per release; public comment periods with the working group's decisions written up; field trials as the honest form of proof.
- Adapt: Cookwala should state its sensitive-data rules where HXL's public page is silent.
- Avoid: a site that cannot be fetched by ordinary tools; a standard whose home page is unreachable is a trust problem.

---

## 6. W3C — Web Standards (w3.org/standards)

Pages read: /standards, /standards/about, /standards/types.

**Problem and approach.** Explain to a general reader what a web standard is, why one body coordinates them, and how a document becomes one.

**Offer and audience.** Overview pages for the public, a deep process document for participants, a document-types page for implementers deciding what is safe to build on.

**Communication.** Headlines are short nouns ("Web Standards", "Types of documents W3C publishes"). Tone is calm and definitional; the overview uses an everyday metaphor (building blocks) and the deeper pages switch to RFC-style normative verbs. Proof is the process itself: consensus, public review, horizontal review, royalty-free patent commitments. CTAs are gentle (explore, become a member, support us), and the process page states plainly that "Public input is welcome at any stage".

**Maturity labelling (the strongest part).** A single table distinguishes Working Draft, Candidate Recommendation (Draft and Snapshot), Proposed Recommendation, Recommendation, Notes, Statements and Registries. For each, four facts are given: how much review it has had, whether patent commitments apply, what implementers should do (implement at own risk / feedback encouraged / should implement), and whether W3C endorses it. The normative verbs make maturity legible at a glance: MUST NOT cite as stable versus SHOULD implement.

**Royalty-free policy.** Presented as a core value: participants commit to royalty-free licensing of essential claims as a condition of taking part, and the commitment starts at first publication.

**Visual system.** Wide white pages, deep blue brand colour, a globe illustration, generous whitespace, system sans-serif, breadcrumb navigation, few images. Institutional, dense but navigable.

**Borrow / adapt / avoid.**
- Borrow: a document-types page with a four-column table (review received, IP commitment, what implementers may rely on, endorsement); stage names printed on every spec page; a royalty-free commitment that binds participants, explained in one paragraph; horizontal reviews (Cookwala's equivalents: safety, accessibility, privacy, food-security).
- Adapt: Cookwala's stages can be fewer (Draft, Candidate, Recommended, Retired) but must carry the same four facts.
- Avoid: burying the maturity table three clicks deep; prose that assumes the reader already knows the acronyms.

---

## 7. IETF — About and RFCs (ietf.org/about, /about/introduction, /process/rfcs)

Pages read: /about, /about/introduction, /process/rfcs.

**Problem and approach.** Explain how a body with no formal membership produces the Internet's technical standards, and how to read its documents.

**Offer and audience.** An introduction for newcomers, guides for draft authors and chairs, the RFC series for implementers. The site claims more than 7,000 people participate each year.

**Communication.** Plain, slightly engineering-flavoured prose; headlines are literal ("Introduction to the IETF", "The Work"). Five principles are listed and each is explained in a sentence: open process, technical competence, a volunteer core, protocol ownership, and the famous "rough consensus and running code". Participation is framed as "subscribe to a list and show up", with a code of conduct and anti-harassment policy stated near the top. CTAs: get started, join a working group, attend a meeting.

**Process and status labels.** Work flows Internet-Draft → working-group adoption → list discussion → IESG review → RFC. RFC status types are Internet Standard, Proposed Standard, Best Current Practice, Informational, Experimental and Historic. Two rules make the series trustworthy: a published RFC is never edited (errors become errata; changes become a new RFC that obsoletes the old one), and the status is printed on the document. Governance is split across three named bodies (steering group, architecture board, an administrative LLC) so that technical and administrative control do not sit in one place.

**Visual system.** White pages, a strong blue, documentary photographs of meetings and people at laptops, clear hierarchy, little decoration. Credible rather than attractive.

**Borrow / adapt / avoid.**
- Borrow: a five-principles list on the About page; immutability of published documents plus errata and "obsoleted by" links; status printed on every spec; "no membership, just show up" participation; a code of conduct stated early; separation of technical steering from administration.
- Adapt: Cookwala's "running code" test should literally be the conformance suite and simulator; "rough consensus" needs a tie-break rule for safety disputes (safety reviewers can block).
- Avoid: English-only working assumptions without saying so; long acronym chains.

---

## 8. WFP Innovation Accelerator (innovation.wfp.org)

Pages read: home, /about, /projects, /project/building-blocks.

**Problem and approach.** A UN innovation unit that scouts, funds and scales projects against hunger, and has to present them to donors, partners and applicants.

**Offer and audience.** Programmes with named stages (innovation challenges, bootcamps, a sprint programme for pilots and business-model tests, a scale-up enablement programme) and an application route. Audiences: start-ups and WFP country teams (apply), partners and donors (fund), press.

**Communication.** Headlines are active and project-specific ("Taking farmers from seed to market" style). Tone is optimistic but operational. Proof is aggregate numbers on the home page (the site claims innovations it supports reached 132.5 million people in 75 countries) and per-project figures on detail pages (the Building Blocks page claims 4.8 million households and 159 organisations). The About page admits the unit expects to "fail as well as succeed", which is the only place uncertainty is voiced; project pages present finished systems and do not discuss limits, caveats or what did not work. The project list is sorted by stage (scale-up, sprint, alumni) with icons, which is a useful honesty device, but individual results are not caveated.

**Dignity.** People served are described by role and context (smallholder farmers, households, vendors) and shown doing skilled work (drying food, weighing crops), not in distress; captions describe the activity rather than naming or characterising the person. Beneficiary privacy is a stated design value of the flagship project (anonymous identifiers rather than stored personal data). Faces are mostly not the focus.

**Visual system.** Institutional blue and white, large documentary photographs as card covers, a grid of teaser cards, a short subtitle per card, modern sans-serif. Photographs carry the emotion; the text stays sober.

**Borrow / adapt / avoid.**
- Borrow: stage-sorted project list with icons; asset-based language for people served; photographs of competence and agency with activity captions; stating up front that the programme expects failures; privacy by design as a headline property.
- Adapt: Cookwala should add what WFP omits: a "what we don't know yet" and "what went wrong" block on every impact claim, and a methodology note under every number.
- Avoid: aggregate reach numbers without method; project pages with no limitations section; "largest in the world" superlatives.

---

## (a) Recommended whitepaper outline for Cookwala

Version and date under the title; stage label (Draft / Candidate / Recommended) on every page.

1. Abstract — one paragraph: what Cookwala is, for whom, what it standardises, and the single-sentence safety promise.
2. The problem — four numbered sub-problems: cooking injuries and foodborne illness, food waste and unsafe rescue, people who cannot cook for themselves, and robots without a shared safety language.
3. Principles — five short commitments (open and royalty-free, safety over convenience, human confirms the risky step, works with what people already have, dignity of the person served).
4. The solution in one page — what a Cookwala-conformant kitchen, device or robot does differently, with three concrete walk-throughs.
5. Scope and non-goals — what the standard does not cover and why.
6. Architecture — layers: recipe and safety data, missions and decisions, physical operation envelopes, trust and session layer, reconciliation and audit.
7. The operation model — read-only vs world-changing vs never-delegable operations; the propose → show → confirm → execute → log loop; how confirmation is made legible to non-technical and impaired users.
8. Trust and security model — scoped, time-limited, revocable delegation; safety limits that no session can exceed; data minimisation; threat model and known residual risks.
9. Food-safety and humanitarian layer — food-rescue rules, allergens, dignity and consent rules for serving people, sensitive-data handling.
10. Conformance — the test suite and simulator as "running code"; levels; what a listed implementation must publish; expiry and re-verification.
11. Governance — who decides, how proposals are reviewed, who can block on safety, how documents are versioned and obsoleted, code of conduct.
12. Registry and ecosystem — how implementations and recipes are listed, entry template, status labels, what listing does and does not mean.
13. Impact and evidence — what has been measured, by what method, what has not, and what failed.
14. Roadmap — phases, each with an explicit status (Done / In progress / Planned / Not yet funded).
15. Risk factors and limitations — plain list, including model error, hardware failure, misuse, regulatory variation.
16. Conclusion and how to participate — one paragraph and three concrete entry points.

## (b) Dignity and honesty rules for Cookwala humanitarian pages

1. Describe people by role and situation (a resident, a parent, a person recovering from surgery), never by deficit, diagnosis or pity label; no "the vulnerable" as a noun.
2. Show competence and agency in imagery: people cooking, choosing, tasting, teaching; never distress, never staged gratitude, never a robot "rescuing" a passive person.
3. Faces only with informed consent and a stated purpose; prefer activity captions over names; no children's faces by default.
4. Every number carries a method line (what was counted, over what period, by whom) and a confidence word; no reach totals without method.
5. Every impact page has a "What we don't know yet" and a "What went wrong" block; empty blocks are not allowed, write "nothing recorded yet" instead.
6. Separate claims about Cookwala from claims about partners; never imply endorsement by or relationship with any organisation named as a reference.
7. State who pays, how much staff there is, and what the money funds, on the About page, in the open.
8. Label the maturity of every feature and document (Draft / Candidate / Recommended / Retired) and the status of every roadmap item; never present a plan as a result.
9. Say what the standard cannot prevent; a safety standard that promises zero harm is dishonest.
10. Sensitive data about people served (health, diet, religion, income) is governed by a written rule before any collection; default is do not collect.
11. Write for someone with little time and no jargon first; put the technical depth behind a link, not in front of the reader.
12. Corrections are public: errata lists, dated changelog entries, and never silently editing a published claim.

## (c) Cross-site patterns

1. The credible whitepaper spine is the same everywhere: Abstract → Problem (numbered) → Principles/Solution → Architecture → Security or trust model → Governance → Roadmap with status → Risks → Conclusion. Helix supplies the spine; W3C and IETF supply the maturity and immutability rules that make it trustworthy.
2. "Confirm before acting" is implemented as a class split (read-only vs world-changing), a limited and revocable delegation, a legible summary before execution, and a log after. Cookwala adds a never-delegable class for physical harm.
3. Status labelling is the single strongest honesty device: W3C's document types, IETF's RFC statuses, DPGA's expiring designation and WFP's stage-sorted project list all let the reader judge how much to trust a thing before reading it.
4. Standards that last are versioned in a public repository with a CHANGELOG, a governance file, permanent per-version URLs, and are themselves openly licensed (DPGA, HXL, IETF).
5. Proof hierarchy, best to worst: running code and field trials (IETF, HXL) → review pipelines with named outcomes (DPGA) → counts with method (Open Food Facts product count) → aggregate reach numbers without method (WFP home) → social proof (stars on a curated list) → assertion (Helix architecture claims).
6. Mission organisations that earn trust name their money and their people (Open Food Facts timeline, DPGA secretariat, IETF's three bodies) and state a code of conduct early (IETF, Open Food Facts).
7. Dignity is done through role-based language, imagery of competence, activity captions, and privacy by design; the gap across all humanitarian sites studied is the absence of a limitations or failure section on individual project pages. Cookwala can lead by including one.
8. Visually, every trusted site here is restrained: white pages, one brand colour (blue in four cases), a sans-serif, few decorations, and photographs or data as the only emotional content. Cookwala should look calm and legible, not exciting.
