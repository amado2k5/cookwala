# Benchmark: standards, registries and open governance

Research notes for Cookwala (open, royalty-free standard for cooking safely: people, kitchens, robots). Focus: how five reference organisations run a registry (namespaces, versions, hashes), open governance, and developer onboarding, and how their websites communicate it.

Date: 2026-10-04. Method: pages read with WebFetch, 2–4 pages deep per site. Where a page could not be fetched this is stated and a WebSearch summary is used, clearly marked. All text below is paraphrase; at most one short quoted phrase per source.

Fetch notes:
- `docs.ros.org` and `ros.org/reps` are behind the Anubis bot-challenge and returned an access-denied page. ROS 2 docs and REPs were read instead from their GitHub sources (`ros2/ros2_documentation`, `ros-infrastructure/rep`), which are the same text the site renders.
- `registry.modelcontextprotocol.io/docs` returned a near-empty shell; the registry's documentation was read from `modelcontextprotocol.io/registry/*` and the `modelcontextprotocol/registry` repository.
- `gazebosim.org` returned only a title; Gazebo release facts come from a WebSearch summary (marked).
- The RAS "approved standards" page URL changed; the list of approved standards comes from a WebSearch summary (marked).

---

## 1. MCP Registry (registry.modelcontextprotocol.io, modelcontextprotocol.io/registry)

### What problem it solves
Model Context Protocol servers were being published on npm, PyPI, Docker Hub and random GitHub releases with no shared way to discover them, know who really published them, or install them consistently. The registry is a single, neutral metadata index that tells clients and marketplaces what exists, where to get it and how to run it, while leaving code hosting to the existing package ecosystems. The site is explicit that the registry is in preview and that breaking changes or data resets may still happen.

### How it approaches it
It is a "metaregistry": it stores `server.json` metadata only, never binaries. Trust comes from namespace proof (you can only publish under a name you can prove you control), not from code review. Curation, ratings and security scanning are deliberately pushed down to subregistries and aggregators (the docs name Smithery, PulseMCP and GitHub's MCP registry as examples) and up to the package registries. The official registry positions itself as a canonical, unopinionated feed that aggregators poll roughly hourly.

### What it offers and to whom
- Server publishers: a CLI (`mcp-publisher`) with `init`, `login`, `validate`, `publish`, `status`, `logout`; a schema-validated `server.json`; a namespace they own.
- Aggregators and marketplaces: a REST API (`/v0.1/servers`, per-server version lists, per-version detail, `updated_since` and `include_deleted` filters) plus an OpenAPI spec other registries may implement so hosts can speak one interface.
- Host applications: told explicitly not to consume the official registry directly but to go through a downstream registry implementing the same OpenAPI.
- Private servers are out of scope; the docs tell you to run your own registry for those and say the official codebase is not designed for self-hosting.

### How it communicates
Headlines are plain nouns ("The MCP Registry", "Package Types", "Moderation Policy"). Tone is candid engineering prose: a preview banner on every page, a moderation policy that opens with a TL;DR admitting the registry is permissive and under-moderated, an FAQ that answers "can I delete my server" with "currently, no". Structure follows the Diátaxis pattern (quickstart, guides, reference, explanations, design, contributing, administration). Proof is institutional rather than numeric: the site claims backing from Anthropic, GitHub, PulseMCP and Microsoft. CTAs are developer verbs: install the CLI, log in, publish, open a GitHub issue. There is an `llms.txt` index for machine readers.

### Visual system
Mintlify-style docs: white or dark canvas, a single accent colour, system sans-serif, generous code blocks with tabbed variants (Ed25519 / ECDSA / Google KMS / Azure Key Vault), one hand-drawn Excalidraw ecosystem diagram, callout boxes for notes and warnings. Density is medium-high; pages are long and command-driven. Almost no imagery.

### Architecture, API, SDKs, registry, versioning, governance and onboarding
- Naming: reverse-DNS names with a slash, `<namespace>/<server>`. Two namespace classes: `io.github.<user-or-org>/*` and `<reverse-domain>/*` (e.g. `io.modelcontextprotocol/everything`).
- Name proof: GitHub OAuth device flow (or GitHub OIDC inside Actions) unlocks `io.github.*`. Domain namespaces are proven either by a DNS TXT record of the form `v=MCPv1; k=ed25519|ecdsap384; p=<base64 public key>` or by hosting the same string at `/.well-known/mcp-registry-auth`; the publisher then signs a login challenge with the matching private key (optionally held in a cloud KMS). The authentication method constrains which name prefixes you may publish.
- Package proof: every distribution channel must carry a back-pointer to the server name: npm `mcpName` in `package.json`; PyPI/NuGet/crates.io a `mcp-name: <server>` string in the README (crates.io strips HTML comments so it must be visible text); OCI images a label `io.modelcontextprotocol.server.name`; MCPB bundles a GitHub/GitLab release URL containing "mcp" plus a mandatory `fileSha256`, which the registry does not check but clients must verify before install. Supported OCI hosts are an allow-list (Docker Hub, GHCR, Artifact Registry, ACR, MCR).
- Schema: `server.json` carries a `$schema` URL that is date-versioned (`.../schemas/2025-12-11/server.schema.json`). The changelog shows a hard camelCase migration in 2025-09 with no deprecation window, and the removal of registry-managed fields (status, official metadata) from the publisher schema so publishers cannot forge them. Publisher-provided `_meta` is capped at 4 KB.
- Versions: one `server.json` per version; the FAQ says published version metadata is immutable, so updating means publishing a new unique version string. Package versions must match the server version. Semver is recommended.
- Status: `active` (default), `deprecated` (shown with warning), `deleted` (hidden unless `include_deleted`). Status is patched per version or across all versions, with an optional message up to 500 characters. Takedown is implemented as status `deleted` with metadata kept so aggregators can de-index; only in extreme cases is metadata erased.
- Moderation: removes illegal content, malware, spam and non-functioning servers; explicitly does not remove buggy, vulnerable, duplicative or adult servers. Appeals and abuse reports are GitHub issues with a title prefix.
- Governance: no charter page. Decision-making is by the maintainers of the `modelcontextprotocol/registry` repo under the MCP project; the site presents stewardship as a coalition of named companies. Contribution path: GitHub issues and PRs; `docs/contributing` and `docs/administration` folders exist.
- Onboarding: a single quickstart that walks from `package.json` edits through `npm publish`, `mcp-publisher init`, login, validate, publish, and a `curl` to confirm the server is searchable, with a troubleshooting list of the three most common failures.

### What makes it world-class (and what is weak)
World-class: the cleanest separation of concerns in this set (identity proof vs. code hosting vs. curation); cryptographic, self-service namespace proof with KMS options; back-pointer validation that stops anyone registering someone else's package; dated schema URLs; status-as-tombstone so downstream indexes stay consistent; brutally honest moderation and FAQ pages; an OpenAPI contract so the registry is a protocol, not just a service.
Weak: governance is implicit (no charter, no voting rules, no published maintainers list); no deletion or dispute process; hashes are optional for most package types and unchecked by the registry; breaking schema changes with no deprecation period; the web entry point at `/docs` is thin.

### What Cookwala should borrow, adapt or avoid
Borrow: reverse-DNS namespaces with slash-separated artifact names; DNS TXT / well-known proof using a versioned record string (e.g. `v=CWv1; k=ed25519; p=...`); mandatory back-pointer from the artifact to its registry name; per-version immutability; the three-state lifecycle with tombstones and a 500-char status message; date-stamped schema URLs; a `validate` endpoint that never publishes; an `llms.txt`.
Adapt: Cookwala is a safety standard, so make the content hash mandatory and registry-verified (MCP leaves `fileSha256` unchecked); add a `conformance` field pointing to a test-suite run, not just a package pointer.
Avoid: shipping without a written governance page; breaking schema migrations with no overlap window; a `/docs` landing page that renders empty without JavaScript.

---

## 2. AsyncAPI Initiative (asyncapi.com)

### What problem it solves
Event-driven systems (Kafka, MQTT, AMQP, WebSockets) had no machine-readable contract comparable to OpenAPI for REST, so documentation, code generation, validation and mocking were ad hoc. AsyncAPI defines that contract and grows a tool ecosystem around it, under vendor-neutral governance.

### How it approaches it
A specification (currently 3.x, with 2.x still documented) written in RFC 2119 language and versioned semver-style, plus first-party tools (Generator, Modelina, Parser, Studio, CLI) and a community tools dashboard. Governance is open by design: the project is a Series of LF Projects, LLC, with a charter, a Technical Steering Committee of maintainers and ambassadors, automated voting and a small elected Governance Board. Sponsorship is tiered and visible on the homepage.

### What it offers and to whom
- Architects and developers: the spec, a Specification Explorer, concepts and tutorials, migration guides between major versions.
- Tool builders: a dashboard with 19 categories and filters (open source vs commercial, AsyncAPI-owned, language, technology); listing is self-service by adding a `.asyncapi-tool` file to your repository.
- Contributors: over 100 good-first-issues (the site claims), Slack across 83+ countries (the site claims), a maintainers path to TSC membership, an Ambassador program, working groups.
- Sponsors: Platinum, Gold, Silver tiers and in-kind service sponsors, each with logo placement.

### How it communicates
Headline is an outcome statement about building the future of event-driven architecture, with a sub-line that calls the spec the industry standard (a claim). Tone is warm and slightly playful (emoji, informal asides) but the spec itself is formal. Homepage structure: hero, five use-case cards (specification, documentation, code generation, community, governance), a live editor-to-output demo, community invitation, sponsor wall, footer. Navigation: Docs, Tools, Community, Case Studies, Blog, language switcher, GitHub star count. Docs are organised Concepts / Tutorials / Guides / Tools / Reference / Migration / Community with Ctrl-K search, breadcrumbs, an on-this-page TOC and GitHub edit links. CTAs: join Slack, subscribe, support us (sponsor).

### Visual system
Dark hero with light content sections; a mint/teal accent against near-black and white; a geometric sans-serif for headings and a monospace face for the ever-present YAML/JSON samples; illustrations are flat and schematic; sponsor logos in greyscale rows; TSC members shown as a card grid of GitHub avatars with affiliation tags such as "Individual Member" or "Available for hire". Density is medium; the homepage breathes, the spec page is dense tables.

### Architecture, API, SDKs, registry, versioning, governance and onboarding
- Spec versioning: `major.minor.patch`; patch releases must stay compatible with existing major.minor tooling; the docs sidebar exposes 3.1.0, 3.0.0 and 2.x side by side with per-version explorers and a Migrations section. A `$schema`-style version field sits at the top of every document (`asyncapi: 3.1.0`).
- Extension points: `x-` extensions and protocol bindings are specified as separate, independently versioned objects at server, channel, operation and message level, so transport-specific detail never pollutes the core.
- Registry equivalent: the Tools dashboard is a federated registry. Each tool self-describes via a `.asyncapi-tool` manifest in its own repo; a bot harvests them. There is no cryptographic name proof; the proof is the GitHub repository itself.
- Governance (charter): voting TSC members are committers listed in CODEOWNERS plus Ambassadors; no term limit and no maximum size but a minimum of three; one employer may hold at most one-third of TSC seats (the membership doc says 25%); members who skip all votes for three months are automatically removed. Decisions pass by simple majority of votes cast; members have seven calendar days to vote; quorum is 51% of current TSC; if quorum is not reached within four weeks the topic is reassessed. Charter amendments need two-thirds of the entire TSC with two-thirds quorum, with a fallback after two failed attempts. A five-person Governance Board is elected first-past-the-post by the TSC for 24-month staggered terms and acts as servant-leader with powers limited to the charter; the project no longer has an Executive Director.
- Mechanics: votes run through the git-vote bot on GitHub issues, started with `/vote` by a Governance Board member; reactions are for / against / abstain and abstentions count toward quorum. Membership is self-declared by flipping `isTscMember: true` in `MAINTAINERS.yaml` once you are a CODEOWNER; a subscription list emails every new vote.
- Licensing: Apache 2.0 for code and spec, CC-BY 4.0 for docs, CDLA-Permissive 1.0 for data. Trademarks held by LF Projects.
- Onboarding: contributors start at good-first-issues or by donating a project; maintainers come from sustained contribution or by creating/donating a repo; Ambassadors from community work.

### What makes it world-class (and what is weak)
World-class: the most legible open-governance stack in this set, with every rule in a markdown file and every vote in a public issue; the employer cap and auto-removal for non-voters protect neutrality; spec versions are first-class in the IA with migration guides; the bindings model keeps the core small; a self-service tools registry keeps the ecosystem page alive without curation labour; sponsor tiers are transparent.
Weak: no artifact registry with name proof or hashes (tools are listed, not verified); the homepage leans on claims rather than numbers; the Spanish/German translation and the blog date quickly; governance docs are split across GOVERNANCE.md, CHARTER.md, TSC_MEMBERSHIP.md and voting.md with some inconsistencies (one-third vs 25% employer cap).

### What Cookwala should borrow, adapt or avoid
Borrow: a charter with explicit numbers (quorum, voting window, employer cap, amendment threshold); automated votes in public issues; a self-declared maintainers YAML that drives the website; a Migrations section between spec majors; bindings-style separation of core schema from kitchen/robot-vendor extensions; CC-BY for docs and Apache 2.0 for code and schemas; sponsor tiers published openly.
Adapt: Cookwala's "tools dashboard" should be the conformance registry, with each entry carrying a passed-suite hash, not just a manifest file.
Avoid: splitting governance rules across four files with drifting numbers; marketing claims of "industry standard" before adoption proves it.

---

## 3. ROS 2 ecosystem (docs.ros.org via GitHub source, github.com/ros2, openrobotics.org, osralliance.org)

### What problem it solves
Robot software was rebuilt from scratch per lab and per vendor. ROS provides shared middleware, tooling and conventions so robots from different makers and researchers can share code, and ROS 2 adds real-time, security and multi-robot support. Open Robotics (the OSRF) stewards ROS, Gazebo (simulation), Open-RMF (multi-fleet interoperability) and ros-controls; since 2024 the Open Source Robotics Alliance (OSRA) carries the governance and funding.

### How it approaches it
A distribution model copied from Linux: a named, versioned set of packages released every year on 23 May, with long- and short-support lines, plus a continuously updated "Rolling" line that may break. Design decisions are written down as REPs (ROS Enhancement Proposals) with a formal lifecycle. Quality is declared, not enforced: REP 2004 defines five package quality levels and a `QUALITY_DECLARATION.md` that peers review. Governance moved from a vendor-funded Technical Steering Committee to OSRA's mixed membership-and-meritocracy model with a Technical Governance Committee above per-project Project Management Committees.

### What it offers and to whom
- Developers: installation per distribution, tutorials, how-to guides, concepts, per-package API docs at `docs.ros.org/en/<distro>/p/<package>/` generated by rosdoc2, a glossary and citation guidance.
- Integrators and companies: Gazebo (WebSearch: Harmonic LTS to 2029, Ionic short-term to Dec 2026, Jetty LTS to 2030) and Open-RMF, which the site describes as a common language for robot interoperability across doors, lifts and fleets.
- Organisations: OSRA membership at Platinum ($20k–$175k by headcount), Gold ($7.5k–$60k), Silver ($3.5k–$30k), Associate and Supporting Organisation ($1k), Supporting Individual ($50), buying TGC seats, PMC voting weight and logo placement.
- Community: Discourse, Zulip, ROSCon, 146 repositories in the ros2 org with a consistent prefix grammar (rcl, rclcpp, rclpy, rmw_*, ros2cli).

### How it communicates
Three sites, three voices. docs.ros.org is Sphinx: a long left tree, a distribution switcher in the header, a plain welcome paragraph, and a hard rule that most people should use the latest stable distribution. openrobotics.org leads with the aspiration "Powering the world's robots" and four product logos; navigation is Technology Strategy, Donate, Leadership, News. osralliance.org is a membership site: tier logos, executive testimonials, Join Now. Proof is adoption breadth (member logos, repo stars, ROSCon). Tone is sober and institutional; humour is absent except turtle names.

### Visual system
docs.ros.org: default Sphinx/RTD look, blue links, monospace commands, almost no imagery, extremely dense. openrobotics.org: white, blue and grey, a wide banner of robots, logo tiles per project, low density. OSRA: corporate blue, logo walls grouped by tier, a box-and-line governance diagram. Gazebo and Open-RMF each have their own brand but share the blue family.

### Architecture, API, SDKs, registry, versioning, governance and onboarding
- Versioning: distributions are the unit of compatibility; cross-distribution communication is not guaranteed; core packages receive only bug fixes after release. Support windows differ (Humble to May 2027, Jazzy to May 2029, Kilted to Dec 2026). Rolling is the staging line.
- Registry: ROS Index (index.ros.org) plus `rosdistro`, a Git repository of YAML files listing every released package per distribution; adding a package is a pull request reviewed by maintainers, so the registry is Git-backed with human review and the name proof is the PR itself and repository ownership. Binary builds come from the shared build farm.
- Quality levels (REP 2004): Level 1 production (rclcpp, tf2), Level 2 solid, Level 3 tools, Level 4 demos, Level 5 default. Seven requirement categories: version policy (semver with API/ABI promises), change control (PRs with CI and reviewer confirmation), documentation, testing with coverage, dependencies at equal or higher level, tier-1 platform support, security disclosure policy. Claims live in a `QUALITY_DECLARATION.md` and are peer-reviewed via a central list, not machine-enforced.
- REP process (REP 1): vet the idea on Discourse first, write the REP in reStructuredText, editors assign a number; statuses Draft, Accepted, Final, plus Deferred, Rejected, Withdrawn, Replaced, and Active for process REPs; Standards Track REPs need a reference implementation before Final; a named final arbiter decides contested cases.
- Governance (OSRA): a Technical Governance Committee of paid-member seats, project leaders, OSRF leaders and merit seats oversees all projects; the ROS PMC (around 20 voting members and 13 committers at the time of reading, from KUKA, Intrinsic, eProsima, independents) runs weekly public meetings at a fixed UTC time; community members may observe and submit agenda items through a PMC member. Each project (ROS, Gazebo, Open-RMF, ros-controls, Infrastructure) has a charter; there is a Physical AI Special Interest Group and a published policy on generative tools in contributions.
- Onboarding: contributors are told to discuss on Discourse before writing code, follow the Developer Guide, and expect quarterly review of contributions; committers and PMC members are invited, not applied for, based on the prior year's merged code and reviews, and receive training before write access.

### What makes it world-class (and what is weak)
World-class: the distribution-plus-LTS model gives integrators a predictable compatibility unit; REPs provide a durable, numbered memory of decisions with explicit statuses; REP 2004 is the best existing template for tiered conformance claims in robotics; OSRA publishes fees and the governance box diagram; weekly public PMC meetings.
Weak: three overlapping web properties with different voices; docs.ros.org's bot wall blocks programmatic readers (and, today, this research); the quickstart is buried under distribution choice; no cryptographic name proof in rosdistro; package documentation quality varies widely; the OSRF site says little about governance itself.

### What Cookwala should borrow, adapt or avoid
Borrow: named, dated releases with declared support windows and a "rolling" draft line; a numbered proposal process (CEPs) with Draft / Accepted / Final / Replaced statuses and a required reference implementation; REP 2004-style quality levels as Cookwala conformance tiers with a self-declaration file that peers review; public weekly meetings with a fixed UTC slot; published membership fees and a governance diagram.
Adapt: replace the Git-PR-only registry with signed submissions, but keep the human review step for safety-relevant entries.
Avoid: scattering identity across several domains; bot walls on documentation; invitation-only paths with no stated criteria.

---

## 4. IEEE Robotics and Automation Society (ieee-ras.org)

### What problem it solves
Researchers and engineers in robotics need venues to publish, meet, be recognised and set standards with the authority of a professional body. RAS supplies peer-reviewed journals, flagship conferences (ICRA, IROS, CASE), technical committees, awards and an IEEE Standards Association pipeline for robotics standards.

### How it approaches it
A classic society structure: an elected Administrative Committee (18 elected members plus eight officers), an Executive Committee of the President and eight Vice Presidents each chairing a board (Conference, Educational, Financial, Industrial, Media, Member, Publication, Technical Activities, plus Science and Technology Watch), standing committees for constitution, nominations, awards and long-range planning, and 40+ technical committees. Standards are developed through the RAS Standing Committee for Standards Activities (RAS-SCSA) inside the IEEE SA process: a Project Authorization Request (PAR), a working group, a sponsor ballot, then publication by IEEE SA.

### What it offers and to whom
- Members (the site claims 19,000+): journal access (T-RO, T-ASE, RA-L, RA-M), the RAS Digital Conference Library, 40+ technical committees, chapters in 40+ countries, a Resource Center of videos and webinars, distinguished-lecturer and young-reviewer programmes, student travel support.
- Industry: a standards portfolio. Approved (WebSearch summary): IEEE 1872-2015 Ontologies for Robotics and Automation (CORA), IEEE 1872.2-2021 Autonomous Robotics Ontology, IEEE 1873-2015 Map Data Representation, IEEE 7007-2021 Ontological Standard for Ethically Driven Robotics. Active: P1872.1.1 task representation, P1872.3 multi-robot ontology reasoning, P2817 verification of autonomous systems, P2940 robot agility, P3107/P3108 human-robot interaction, P3140.x semantic maps, P7008 ethically driven nudging, a humanoid study group.
- Organisers and authors: conference sponsorship tiers, paper deadlines, awards.

### How it communicates
Headline positions RAS as the leading global organisation in its field (a claim). Tone is institutional and inclusive; it foregrounds diversity, equity and inclusion. Navigation is a mega-menu of eight pillars (About, Members, Conferences, Publications, Education, Awards, Industry) with deep sub-trees. Proof is scale: member counts, publication counts, event counts, attendance growth percentages, board photographs, a founder's video. CTAs: Join, Renew, Volunteer, Gift a membership, fill in the Standards Interest Form, submit a paper. Standards pages link out to IEEE SA for the actual documents, which are paywalled.

### Visual system
IEEE corporate blue with white; a neutral sans-serif; photographic imagery of robots, conferences and committee members; card grids and accordion sections; moderate-to-high density with long menus. Little code or diagrams; this is a membership site, not a developer site.

### Architecture, API, SDKs, registry, versioning, governance and onboarding
- Registry equivalent: the IEEE SA standards catalogue. Names are numbered designations (1872, 1872.2, 7007) with a year suffix as the version (1872-2015); "P" prefix marks a project in development. Each standard passes through PAR approval, working-group drafting, sponsor ballot (75% approval of returned ballots is the IEEE SA norm), RevCom approval, publication, then reaffirmation, revision or withdrawal on a roughly ten-year clock. Amendments and corrigenda are separate numbered documents.
- Name proof and ownership: IEEE SA holds copyright; the Society sponsors; working-group membership is individual and open to anyone who participates (IEEE SA individual-method process) with recorded attendance and voting rights earned by participation.
- Governance: Constitution, Bylaws, and a Policies and Procedures manual; AdCom elected by members; officers appointed; terms staggered; technical committees chartered by the Technical Activities Board.
- Onboarding: join IEEE then RAS; join a technical committee or chapter; for standards, submit the interest form, join a working group, attend meetings to gain voting rights.
- No API, SDK, or machine-readable registry; standards are PDFs.

### What makes it world-class (and what is weak)
World-class: a durable, legally recognised path from idea to published standard with balloting rules that courts and regulators accept; clear separation of society (people, meetings) from SA (documents, IP); explicit governance documents and elections; strong recognition mechanisms (Fellow, awards) that motivate volunteers.
Weak: standards are paywalled and slow (years per document); the website is a brochure with no developer surface, no versioned machine-readable artifacts, no conformance tooling; membership is pay-to-read; navigation depth hides the standards work.

### What Cookwala should borrow, adapt or avoid
Borrow: the PAR-like "project" state before a standard exists (P-numbers), the year-suffixed version, a formal ballot with a published approval threshold, scheduled reaffirmation/withdrawal, separate amendment documents, a written constitution and bylaws, recognition programmes for contributors, and a one-form standards interest sign-up.
Adapt: run the ballot in public (GitHub issue with git-vote) rather than behind membership; publish every standard royalty-free.
Avoid: paywalls, multi-year cycles, mega-menus, and a site that never shows a schema or a line of code.

---

## 5. LeRobot (huggingface.co/docs/lerobot, huggingface.co/lerobot)

### What problem it solves
Real-robot learning was gated by expensive hardware, incompatible data formats and lab-only code. LeRobot gives a Python-native, hardware-agnostic interface for cheap arms through humanoids, one dataset format that streams from the Hugging Face Hub, and state-of-the-art policies trainable with the same handful of CLI commands. The stated goal is to lower the barrier so everyone can contribute to and benefit from shared datasets and models.

### How it approaches it
A single loop (Teleoperate, Record, Train, Deploy) drives the docs, the CLI (`lerobot-teleoperate`, `lerobot-record`, `lerobot-train`, `lerobot-rollout`) and the Hub. Data is the protocol: LeRobotDataset v3 decouples storage (few large Parquet and MP4 shards) from the API (episode-level access via metadata). The Hub is the registry: datasets and policies are `user/name` repos, tagged `LeRobot`, versioned by Git commit, browsable and visualisable online.

### What it offers and to whom
- Hardware owners: robot-specific assembly and calibration pages, cameras guide, LeLab browser GUI as a no-CLI path.
- People with no robot: Hub datasets, simulation benchmarks (LIBERO, Meta-World), free Colab notebooks.
- Contributors: a contributing guide, policy and hardware extension guides, Discord, a community review policy requiring each contributor to review one other PR first.
- Everyone: a cheat sheet of every command, a compute-and-hardware guide for picking a policy by GPU, an org page with (at reading) 68 models and 189 datasets, and tens of thousands of community datasets under the `LeRobot` tag (the listing page showed a large total with examples from allenai, physical-intelligence, yaak-ai and individuals).

### How it communicates
Headline is a capability statement about state-of-the-art machine learning for real robots. Tone is friendly, emoji-led, second person, with the four-step loop stated up front. The home page is a pick-your-path triage: "I have a robot", "No hardware yet", "I want to contribute", each with three concrete next links, followed by six "explore" cards and a "Common Problems" list that names the four most frequent failures (camera lighting, build errors, GPU fit, still stuck → Discord). Every tutorial pairs a CLI command with the equivalent Python API in tabs. Proof is demonstrative: embedded task videos, GIFs, Hub counts. CTAs are commands to run and a Discord link.

### Visual system
Hugging Face docs: white or dark canvas, yellow-orange brand accent, system sans-serif, rounded bordered cards with emoji icons, a left sidebar grouped by Get Started, Robots, Datasets, Policies, Simulation, Contribute. Dense with code; images are product screenshots, a dataset-layout diagram and short videos. Light-hearted but not childish.

### Architecture, API, SDKs, registry, versioning, governance and onboarding
- Dataset format (v3): `meta/info.json` is the canonical schema (features, dtypes, shapes, fps, `codebase_version`, path templates); `meta/stats.json` normalisation stats; `meta/tasks.jsonl` task text to integer id; `meta/episodes/` chunked Parquet with per-episode lengths and byte/frame offsets; `data/` Parquet shards and `videos/` MP4 shards each holding many episodes. Episode boundaries are metadata, not file boundaries. v2.1 to v3 has a one-command converter; a `finalize()` call is mandatory before push or the Parquet footers are missing.
- Versioning: the format version is written into every dataset (`codebase_version`); the library version is pinned in docs (v3 requires `lerobot >= 0.4.0`); Hub repos are Git, so a dataset or policy can be pinned by commit, branch or tag; training checkpoints pushed to the Hub are tagged by step so `--policy.pretrained_revision=010000` recovers an exact artifact.
- Registry: the Hub. Names are `namespace/repo`; the namespace is the authenticated user or org (proof is Hub login and write token); automatic `LeRobot` tag plus free tags; licence, private flag and tags are CLI flags; a hosted Space visualises any dataset by repo id. Streaming without download is first-class.
- SDK and CLI: one pip package with feature-scoped extras (`dataset`, `training`, `hardware`, `viz`) and composite extras (`core_scripts`, `evaluation`); Python API mirrors every CLI command; `lerobot-find-port` and `lerobot-find-cameras` remove the two most common setup blockers.
- Governance: a Hugging Face team decides; contributions via fork, rebase, pre-commit, pytest, issue and PR templates; a Code of Conduct and an explicit AI policy for contributions; no charter, no elections, no published maintainer list beyond the org page. Hardware and policy additions have their own how-to pages.
- Onboarding: install (three install profiles), pick a path, run the cheat sheet, visualise, ask on Discord. A Colab notebook generates all commands for your specific ports and ids.

### What makes it world-class (and what is weak)
World-class: the best onboarding in this set: triage by situation, a common-problems list on the home page, CLI/API parity, a cheat sheet, and a conversion tool for format migration; the data format is a genuine open standard with a written version field and a Hub-native streaming story; the Hub turns every user into a publisher with zero registry bureaucracy; the peer-review-first PR policy scales maintainers.
Weak: governance is a company team, not a community body; the format spec lives in a tutorial rather than a normative document; no checksums or signatures beyond Git; the docs show a "will be included in 0.4.0" line that has aged; heavy Hugging Face lock-in for the registry.

### What Cookwala should borrow, adapt or avoid
Borrow: the three-door home page (I run a kitchen / I build robots or appliances / I want to contribute), a Common Problems block above the fold, CLI and SDK parity in tabbed examples, a cheat sheet, a compute-or-hardware fit guide, a `codebase_version`-style field in every Cookwala artifact, a hosted validator/visualiser that takes a registry id, and a converter for every schema bump.
Adapt: keep Hub-like self-service publishing but add signed hashes and conformance status, and host a mirror so the registry is not tied to one vendor.
Avoid: leaving the normative spec inside a tutorial; governance by a single employer.

---

## Patterns across these five

- Identity is reverse-DNS or `owner/name`, and the proof of ownership is whatever the platform already authenticates (GitHub login, DNS record, Hub token, a reviewed PR, a balloted working group). The strongest (MCP) binds a cryptographic key to a domain and also demands a back-pointer from the artifact to its registry name.
- Versions are immutable once published; updates are new versions, never edits. The spec or format version is written into the artifact itself (`$schema` date URL, `asyncapi: 3.1.0`, `codebase_version`, REP number and status, standard-year).
- Lifecycle is a small enum with tombstones: active / deprecated / deleted (MCP), Draft / Accepted / Final / Replaced (REP), P-project / approved / reaffirmed / withdrawn (IEEE), named distro with EOL date (ROS, Gazebo). Nothing disappears silently.
- Registries store metadata and pointers, not the thing itself; code, binaries, datasets and PDFs stay where they are hosted, and curation is pushed to downstream aggregators.
- Governance that works is written in plain markdown with numbers: quorum, voting window, employer cap, amendment threshold, membership fees, meeting time. The two developer-led projects without a charter (MCP registry, LeRobot) are the ones where "who decides" is unclear.
- Quality is declared then peer-reviewed, not machine-enforced (REP 2004, moderation policies, IEEE ballots); the sites say so explicitly rather than over-promising.
- Onboarding converges on: one install page with profiles, one quickstart that ends with a verifiable artifact, a triage by situation, a common-problems list, CLI and API side by side, and a chat channel.
- Visuals are restrained: one accent colour, system or geometric sans, monospace code, cards for choices, logo walls for proof, a single hand-drawn architecture diagram. The denser the standard, the fewer the photographs.

## Concrete registry and governance mechanisms Cookwala should adopt

1. Names: `<reverse-dns-namespace>/<artifact>` (e.g. `com.example-kitchens/sous-vide-safety-envelope`), with a `cookwala.org/<community-handle>/*` namespace for individuals proven by GitHub or email-domain login.
2. Namespace proof: DNS TXT or `/.well-known/cookwala-registry-auth` containing `v=CWv1; k=ed25519; p=<pubkey>`, signed challenge at login; keys may live in a KMS.
3. Artifact proof: every published artifact (recipe layer, envelope, conformance report, SDK package) embeds its registry name and its `cookwala_schema` date-versioned URL, and the registry verifies a mandatory SHA-256 of the canonical JSON before accepting it.
4. Immutable versions with semver; `latest` computed, never set; a 4 KB cap on free-form publisher metadata; a `/validate` endpoint that never publishes.
5. Status enum `draft | active | deprecated | withdrawn | revoked` with a 500-char message, patchable per version or across versions; revoked entries stay readable as tombstones so downstream mirrors can de-index; `include_withdrawn` query flag.
6. Conformance tiers modelled on REP 2004: Level 1 (safety-critical, independently tested), Level 2 (self-tested with published suite results), Level 3 (declared), each with a `CONFORMANCE_DECLARATION.md` reviewed by a listed peer and linked from the registry entry.
7. Proposal process (Cookwala Enhancement Proposals): numbered, in Markdown, statuses Draft / Accepted / Final / Replaced / Withdrawn, discussed in a public forum first, a reference implementation required before Final.
8. Charter with numbers: TSC of maintainers and ambassadors, quorum 51%, seven-day voting window, four-week quorum limit, one-third employer cap, automatic removal after three months without a vote, two-thirds for amendments; votes by bot on public issues; a five-seat board with staggered 24-month terms.
9. Releases: a dated, named release line each year with a declared support window, plus a rolling draft line; a Migrations section and a converter for every schema bump.
10. Openness: Apache 2.0 for code and schemas, CC-BY 4.0 for the standard text, royalty-free patent commitment in the charter; published sponsor and member tiers with fees; weekly public meeting at a fixed UTC time with notes.
11. Website: a three-door home (kitchens, builders, contributors), a Common Problems block, CLI and SDK side by side, a cheat sheet, an `llms.txt`, and a moderation page that states plainly what the registry does and does not check.
