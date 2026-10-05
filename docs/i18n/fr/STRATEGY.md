<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->
# Stratégie Cookwala : message, produit, site web, docs, expérience développeur

**Status :** révisé 2026-10-04 (v2). Couvre la mission, la vision, l'histoire, la norme, le site web,
la documentation, l'API et le SDK, les démos, la communauté et les métriques. Il s'appuie sur le plan d'action
(`ACTION-PLAN.md`), l'histoire et la liste des lacunes (`research/BACKSTORY.md`), la revue d'architecture
(`research/ARCHITECTURE-REVIEW.md`), le benchmark de 23 sites (`research/WEB-BENCHMARK.md`), la conception
des parties prenantes (`STAKEHOLDERS.md`) et les règles de messagerie (`MESSAGING.md`). Le tableau de la section 1
est l'étude de première passe ; le benchmark le remplace lorsqu'ils diffèrent.

---

## 0. Résumé

**Le travail de Cookwala.** C'est la méthode ouverte pour dire à n'importe quelle cuisine (une personne, un food bank, un four ou un robot humanoïde) **quoi préparer, quand chaque étape est terminée, et ce qui ne doit jamais arriver**, et pour vérifier ces trois éléments sur l'appareil.

**Ce qui change :**

1. **Message.** Retirez "the world's first and largest robot cooking recipes index and CLI"
   et commencez par le problème auquel chaque fabricant de robots et chaque cuisine est confronté. Nouveau slogan :
   *"L'étalon ouvert pour cuisiner en toute sécurité : les personnes, les cuisines et les robots."*
2. **Story.** Les robots sont sur le point de cuisiner dans les foyers, mais personne n'a consigné, sous une forme qu'une
   machine peut vérifier, ce que signifient "cuit" et "sûr", ou dans quelles cuisines. Cookwala est parti
   des recettes égyptiennes d'une seule famille. Sa mission est d'enseigner aux machines chaque cuisine
   en toute sécurité, et de s'assurer que de la bonne nourriture parvienne aux gens.
3. **Proof before promise.** Des compteurs réels et en direct. Étiquettes now / next / later. Critiques publiées.
4. **Une boucle que tout le monde comprend :** *Describe → Check → Cook → Learn.*
5. **Paths par audience :** fabricants d'appareils, constructeurs d'agents IA, cuisines et food banks, cuisiniers,
   chercheurs.
6. **Code et une démo en direct sur le premier écran.** dry run dans le navigateur ("Cet appareil peut-il cuisiner
   cette recette ?"), les simulateurs, et des commandes à copier-coller qui fonctionnent aujourd'hui.
7. **Expérience développeur au niveau des meilleures docs d'IA et de robotique :** un
   quickstart de 5 minutes, des docs organisées en tutoriels, guides pratiques, référence et explication,
   `llms.txt`, copy-page, un package Python et CLI, un SDK JS/TS typé, un serveur MCP, un
   hub de référence que vous pouvez exécuter localement, un package ROS 2, et un pont LeRobot.
8. **Un réseau de contributeurs** (inspiré par l'Index de Figure) : les cuisiniers et les cuisines contribuent
   avec des enregistrements consentis de vraies recettes, afin que les robots apprennent chaque cuisine, avec crédit aux
   personnes qui leur ont enseigné.

---

## 1. Ce que nous avons appris

| Site | Problème qu'il résout | Approche | Comment il communique | Audience | Ce que nous retenons |
|---|---|---|---|---|---|
| **Figure – Index** | Les humanoïdes ont besoin de quantités massives de données de tâches réelles | Réseau de contributeurs rémunérés qui enregistre les tâches quotidiennes ; services now, robots later | Cinématographique, monochrome, typographie massive ; compteurs en direct (29 M video uploads, $15 M paid) ; *"Today, services on demand. Soon, robots on demand."* | Contributeurs, households, entreprises | Réseau de contributeurs avec crédit ; **compteurs de preuve en direct** ; une ligne d'honnêteté "today / soon" ; une image frappante |
| **Figure (home)** | Aide à domicile | Un humanoïde polyvalent | *"The future of home help is here."* Une phrase, une vidéo | Households, investisseurs | La promesse en une phrase ; le produit avant les fonctionnalités |
| **MCP Registry** | Trouver des serveurs MCP dignes de confiance | Registry communautaire ; namespaces reverse-DNS vérifiés ; versions exactes ; hashes d'intégrité ; endpoint de validation ; statut du cycle de vie | Référence OpenAPI propre ; schema-first | Éditeurs de serveurs, fabricants de clients | **Namespaces vérifiés, versions épinglées, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | La construction d'agents est fragmentée | Frameworks ouverts et agnostiques au modèle plus une plateforme | *"The open agent engineering ecosystem"*; cycle de vie Build → Test → Deploy → Monitor ; centre de confiance et statut | Ingénieurs en agents, entreprises | **Un cycle de vie que le lecteur reconnaît** ; centre de confiance ; académie et forum |
| **LangSmith Observability** | Voir ce que les agents ont fait en production | Traces → monitoring → feedback → datasets pour evals | Étapes avec liens ; page de concepts ; intégrations | Équipes d'agents | **Execution logs en tant que traces** ; les traces deviennent des datasets → `execlog_export.py otel` |
| **OpenAI API docs** | Premier appel API | Quickstart avec code d'abord ; build paths ; model cards | Sombre, axé sur le code, "Ask AI", statut et cookbook | Développeurs | **Code sur le premier écran ; "build paths"** |
| **Claude Platform docs** | Du premier appel à la production | Deux surfaces (Messages, Managed Agents) ; parcours développeur numéroté ; cartes de familles de modèles | Recherche ⌘K ; onglets de langage (Python … cURL, CLI) ; parcours 1–4 | Développeurs, équipes plateformes | **Parcours développeur numéroté ; onglets de langage ; "choose how you build"** |
| **AsyncAPI** | Décrire des API pilotées par les événements | Spécification ouverte plus outils (générateurs, docs) ; gouvernance ouverte sous la Linux Foundation | "Part of the Linux Foundation" ; spec → docs → code demo ; réunions communautaires ; niveaux de sponsors | Architectes, constructeurs d'outils | **Badge de gouvernance ouverte, TSC, calendrier communautaire, sponsors** |
| **SiliconFlow** | Inférence de modèle rapide et peu coûteuse | API tout-en-un pour de nombreux modèles | Listes de fonctionnalités de performance, scalabilité, coût et sécurité | Développeurs, entreprises | Une liste précise de **characteristics** (les nôtres : safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Prompt engineering par essais et erreurs | Cas de test déclaratifs, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; liste why-choose ; étapes de workflow | Développeurs d'applications LLM, sécurité | **Tests de sécurité déclaratifs** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; not Figure's Helix AI) | La DeFi est trop complexe | Agent en langage naturel avec confirmation avant chaque transaction | Whitepaper : abstract → problem → solution → architecture → security model | Utilisateurs crypto | **Structure du whitepaper ; security model explicite ; "always confirm"** (nous retenons la structure, pas le modèle de token) |
| **Hugging Face LeRobot** | La robotique est difficile à démarrer | Bibliothèque agnostique au matériel ; teleoperate → record → train → deploy ; format de dataset standard ; datasets communautaires | "Pick your path: I have a robot / no hardware yet / I want to contribute" ; cheat sheet ; problèmes courants | Makers, chercheurs | **"Pick your path" ; compatibilité des datasets ; section common-problems** |
| **ROS 2 / Open Robotics** | Interopérabilité des logiciels de robotique | Middleware ouvert (ROS, Gazebo, Open-RMF) géré par une organisation à but non lucratif | *"Powering the world's robots"* | Développeurs de robots | **ROS 2 actions ; gestion par une organisation à but non lucratif** |
| **NVIDIA Isaac** | Développer et entraîner des robots | Simulation, bibliothèques, modèles de fondation (GR00T) | Carte de la plateforme : bibliothèques, simulation, modèles, blueprints | Équipes de robotique | **La simulation comme banc d'essai** pour les envelopes |
| **1X, Unitree, Pollen** | Humanoïdes domestiques, robots abordables, robots ouverts pour les makers | Produits avec dépôts, précommandes et communauté | Un produit, un prix, un bouton | Households, makers | Les robots domestiques sont expédiés now ; notre fenêtre est now |

**Modèles partagés par les meilleurs :**
1. Une phrase sur qui cela s'adresse et ce que cela fait.
2. Une boucle que le lecteur reconnaît.
3. Du code fonctionnel ou une démo en un seul défilement.
4. Des points d'entrée au choix.
5. Des preuves (chiffres, utilisateurs, gouvernance).
6. Un statut honnête (centre de confiance, page de statut, now/next).
7. Une communauté que l'on peut rejoindre dès aujourd'hui.
8. Des docs conçus pour les humains et les lecteurs IA (page de copie, `llms.txt`, "Ask AI").

---

## 2. Cookwala aujourd'hui

**Forces :**
- Une idée rare et concrète : operation envelopes physiques, sensor ladders, refusal au lieu de
  deviner, sécurité appliquée sur l'appareil, documents vérifiables.
- Des vecteurs de conformance qui incluent deux résultats de standards indépendants (RFC 8785, RFC 8032).
- Quatre simulateurs jouables.
- Un profil humanitaire qui fonctionne sans robots.
- Un véritable corpus de recettes (fifi.cooking) et une région avec une identité (l'Égypte, le monde arabe).
- Un historique de critique-et-réponse inhabituellement honnête.

**Lacunes :**

| Écart | Effet |
|---|---|
| Le titre affirme « premier et plus grand » avec 1 recette publiée | Lu comme du battage publicitaire ; invite au rejet |
| « Éliminer la faim dans le monde » comme accroche | Repousse les bailleurs de fonds et les experts qui connaissent les causes de la faim |
| Cadrage uniquement sur les robots | Exclut les utilisateurs qui peuvent adopter la solution aujourd'hui (cuisines, food banks, constructeurs d'agents) |
| Pas de quickstart, pas de SDK, pas de serveur exécutable | Personne ne peut réussir en 5 minutes |
| La documentation est composée de 25 fichiers markdown sans navigation | Difficile à trouver, difficile à faire confiance |
| Pas de preuve en direct ou de statut | Aucun sentiment de dynamisme ou de préparation |
| Aucun moyen de rejoindre | L'intérêt ne peut pas se transformer en contribution |

---

## 3. Positionnement et message

### 3.1 Catégorie et résumé
- **Catégorie :** un standard ouvert (avec des outils gratuits et un index) pour une cuisine exécutable et vérifiable.
- **Résumé :** *Cookwala est le standard ouvert pour cuisiner en toute sécurité : les personnes, les cuisines et les robots.*
- **Triade**, utilisée partout :
  - **Ce qu'il faut préparer.** Des recettes sous forme d'étapes qu'une machine peut planifier.
  - **Quand c'est prêt.** Des conditions de fin mesurables : températures, indices d'état de l'aliment, durées.
  - **Ce qui ne doit jamais arriver.** Des limites de sécurité que l'appareil applique lui-même.

### 3.2 Mission et vision (révisé)
- **Mission :** *Aider tout le monde à bien manger, en toute sécurité, à moindre coût et sans gaspillage, peu importe qui fait
  la cuisine.*
- **Vision :** *N'importe quelle cuisine sur Terre peut cuisiner n'importe quelle recette en toute sécurité, et la bonne nourriture atteint les gens
  au lieu de la poubelle.*
- **Pourquoi le changement :** "end world hunger" reste la raison à long terme, étayée par des preuves.
  Cookwala y contribue par moins de gaspillage, le sauvetage alimentaire et une cuisine moins chère, aux côtés
  des programmes, du financement et des politiques dont la faim a besoin.

### 3.3 L'histoire

> Les robots domestiques arrivent : Figure 03, 1X NEO et les robots de cuisine sont en cours d'expédition ou prennent des commandes. Ils apprennent à se déplacer, mais personne n'a écrit, d'une manière qu'une machine puisse vérifier, ce que signifie « simmer », quand le poulet est sûr, ou comment se prépare la molokhia d'une grand-mère. Chaque fabricant écrit ses propres recettes fermées, provenant principalement de quelques cuisines.
>
> Cookwala est parti des recettes maison égyptiennes d'une famille sur fifi.cooking et a posé une question simple : comment transmettre une recette à une machine, et savoir qu'elle la cuira en toute sécurité ?
>
> La réponse est un standard ouvert. Il indique quoi préparer, quand chaque étape est terminée, et ce qui ne doit jamais arriver. L'appareil le vérifie avant de chauffer quoi que ce soit, et refuse plutôt que de deviner. Les mêmes recettes fonctionnent pour les gens et les food banks aujourd'hui, et elles permettront aux robots d'apprendre chaque cuisine sur Terre demain, en rendant crédit aux cuisiniers qui les ont enseignées.

*(Le fondateur doit confirmer et personnaliser la phrase d'origine. L'authentique l'emporte sur le poli.)*

### 3.4 Message house

| Pilier | Promesse | Preuve que nous pouvons montrer aujourd'hui |
|---|---|---|
| **Safe by design** | Les appareils refusent plutôt que de deviner, et imposent des limites localement | Operation envelopes pour 32 opérations ; safety-limits pack ; dry run ; conformance |
| **Verifiable** | N'importe qui peut vérifier une recette, un appareil et un enregistrement | Signatures, révocation de clés, points de contrôle de l'event-log ; 106 vecteurs incl. résultats RFC |
| **Open and neutral** | Libre de redevances, agnostique au modèle, agnostique à l'appareil | Licences ; voie de gouvernance ; pas de clés API |
| **Every cuisine** | Construit à partir de la cuisine domestique réelle, multilingue | corpus fifi.cooking ; arabe et anglais ; world-cuisines plan |
| **Useful before robots** | Les cuisines et les food banks en bénéficient now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | La cuisine réelle devient de meilleurs robots, avec crédit | Consentement ExecutionLog ; export LeRobot ; traces OTel |

### 3.5 Règles de langage
- **Utiliser :** recette, étape, terminé, sûr, vérifier, refuser, cuisine, cuisiner, ouvrir, vérifier, consentement.
- **Éviter :** « révolutionnaire », « premier et le plus grand » (jusqu'à ce que ce soit vrai), « mettre fin à la faim » (en tant que titre),
  « propulsé par l'IA » (vague).
- **Étiqueter chaque nombre** comme *measured*, *modelled* ou *assumed*.
- **Dire « now / next / later »** au lieu d'impliquer que quelque chose existe quand ce n'est pas le cas.

---

## 4. Audiences et leur premier succès

| Audience | Job to be done | First success (≤ 15 min) | Then |
|---|---|---|---|
| **Fabricants de robots et d'appareils** | Livrer des fonctionnalités de cuisson sans écrire chaque recette, en toute sécurité | Effectuer un dry run de leur profil d'appareil avec 5 recettes ; voir l'acceptation/le refus par étape | Implémenter la Core API (reference hub), réussir la conformance, publier l'appareil dans le registry |
| **Constructeurs d'agents IA** | Permettre aux agents de planifier des repas et de commander de la nourriture sans danger | Ajouter le serveur Cookwala MCP ; exécuter le benchmark agent-safety sur leur modèle | Utiliser AgentMandate et le dry run avant d'agir |
| **Cuisines et food banks** | Récupérer le surplus en toute sécurité, planifier des menus nutritifs | Envoyer une offre par SMS, ou remplir le CSV ; voir le contrôle du rule pack | Piloter avec le Humanitarian Profile |
| **Cuisiniers et créateurs de recettes** | Maintenir leurs recettes actives et crédités | Convertir une recette avec l'éditeur ; la voir passer la validation | Contribuer avec des enregistrements (consentis) ; apparaître dans les crédits |
| **Chercheurs et réviseurs** | Données, benchmarks, hypothèses honnêtes | Exécuter un simulateur ; lire la critique et la suite de conformance | Utiliser des jeux de données ; publier des revues |
| **Bailleurs de fonds et décideurs politiques** | Voir l'impact, les risques et la gouvernance | Lire le résumé du livre blanc de 2 pages et la note de concept | Financer des pilotes ; rejoindre la gouvernance |

---

## 5. Architecture du produit : ce que Cookwala offre

| Couche | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profils (draft / experimental) | Core 0.3 après le premier retour d'expérience appareil | Core 1.0 sous une fondation |
| **Index and registry** | Recettes d'exemple ; spécification registry | corpus fifi.cooking converti (1,881 recettes, arabe + anglais) ; namespaces vérifiés | Collections communautaires, cuisines du monde |
| **Tools** | Validator, bibliothèque de référence, dry run, conformance, exporters | `pip install cookwala` (CLI + library) ; JS/TS SDK | Éditeur de recettes (web) |
| **Reference hub** | Spécification Core API | Docker hub avec un appareil simulé, pour que le quickstart `curl` fonctionne localement | Kit Hardware-in-the-loop |
| **Bindings** | Actions ROS 2, Matter, LeRobot, OpenTelemetry | Package ROS 2 ; serveur MCP ; tâche Open-RMF | Benchmark Isaac Lab "cook in simulation" |
| **Safety** | Limits pack, recalls, incidents, benchmark agent | Limites révisées ; résultats publics sur la sécurité des agents | Schéma de certification avec un certificateur |
| **Humanitarian** | Profil, rule pack, templates, note conceptuelle | Pilote food bank en Égypte | Adoption du réseau food bank |
| **Data** | ExecutionLog avec consentement | Réseau de contributeurs, premier jeu de données consenti | Benchmark multi-cuisine sur le Hugging Face Hub |

---

## 6. Site Web

### 6.1 Plan du site

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Page d'accueil, de haut en bas

| # | Section | Purpose | Content |
|---|---|---|---|
| 1 | **Hero** | Dire ce que c'est en un souffle | One-liner, triad, deux boutons (*Try the dry run*, *Read the quickstart*) ; puce de statut honnête "Draft standard · v0.2" |
| 2 | **Live demo** | Montrer, ne pas raconter | "Can this device cook this recipe ?" Choisissez une recette et un appareil ; chaque étape montre done / person / refuse, avec la rule qui a décidé |
| 3 | **The problem** | Faire ressentir l'écart | Les robots arrivent ; "simmer" signifie des choses différentes ; recettes fermées de peu de cuisines ; nourriture gaspillée alors que les gens ont faim |
| 4 | **The loop** | Un modèle mental | Describe → Check → Cook → Learn, chacun avec l'artifact et la command |
| 5 | **Pick your path** | Orienter chaque visiteur | Cinq cartes (section 4), chacune avec un premier success |
| 6 | **Proof** | Momentum et honnêteté | Compteurs en direct depuis `/v1/stats.json` (operations defined, conformance vectors, schemas, recipes published, languages) ; chaque nombre est étiqueté |
| 7 | **Safety** | Confiance | La sécurité est locale ; refusal ; agent rules ; recalls ; lien vers /trust |
| 8 | **Works today** | Utilité avant les robots | Humanitarian Profile, exemple SMS, simulateurs |
| 9 | **Now / next / later** | Roadmap honnête | De la section 5 |
| 10 | **Open** | Neutre et rejoignable | Licences, voie de gouvernance, contribuer, GitHub |

### 6.3 Direction de conception
- **Ressenti :** calme, précis, chaleureux. Un instrument professionnel avec une âme de cuisine.
- **Type :** une grotesque précise pour l'UI et une mono face pour les données et le code. Une typographie d'affichage large et légère pour le hero (empruntant l'assurance de Figure), sans copier son obscurité cinématographique.
- **Couleur :** papier et encre neutres avec un accent thermique (orange braise) qui marque également les données de température. La palette est validée pour les lecteurs daltoniens, et les thèmes clair et sombre sont tous deux conçus.
- **Imagerie :** de vraies mains et de vraies cuisines domestiques une fois que nous les aurons, jamais de robots de banque d'images. D'ici là, les diagrammes et la démo en direct portent la page.
- **Mouvement :** un moment, le dry run étape par étape. Tout le reste est immobile.
- **Bilingue dès le départ :** anglais et arabe (mise en page de droite à gauche), puis d'autres.
- **Accessibilité :** WCAG 2.2 AA ; clavier ; mouvement réduit ; aucune information par la seule couleur.

### 6.4 Interactivité
1. dry run dans le navigateur (recette × appareil).
2. Explorateur d'enveloppe : faites glisser une trace de température et voyez quand elle quitte "simmer".
3. Simulateurs, avec le protocole activé ou désactivé.
4. Visionneuse d'étape de recette : la phrase d'une étape, son JSON et son enveloppe côte à côte.
5. Later : un éditeur de recette qui valide au fur et à mesure de la saisie.

---

## 7. Documentation

Organisé selon le framework Diátaxis, de sorte que chaque page a une mission unique :

| Type | Objectif | Pages |
|---|---|---|
| **Tutorials** | Apprendre par la pratique | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | Résoudre une tâche | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | Consulter des informations | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | Comprendre le pourquoi | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Ergonomie des docs :**
- navigation à gauche, recherche, « Copy page », « Edit on GitHub », liens précédent/suivant ;
- onglets de langue (Python / JavaScript / cURL / CLI) ;
- `llms.txt` et markdown par page pour les lecteurs IA ;
- un aide-mémoire et une page sur les problèmes courants ;
- un changelog avec dates.

---

## 8. API et SDK

| Livrable | Quoi | Pourquoi |
|---|---|---|
| package Python `cookwala` | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (depuis `tools/`) | Une commande pour le premier succès |
| `@cookwala/sdk` (TypeScript) | Types générés à partir des schémas ; client API Core ; dry run dans le navigateur | Développeurs Web et agents |
| Reference hub (Docker) | API Core avec un appareil simulé et les limites de sécurité | Le `curl` du quickstart fonctionne localement ; banc d'essai pour les makers |
| serveur MCP | Outils : `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Chaque agent capable de MCP peut utiliser Cookwala en toute sécurité |
| package ROS 2 | `cookwala_msgs` (actions), un nœud de pont vers l'API Core | Fabricants de robots |
| Exporters | LeRobot, OpenTelemetry (fait) | Apprentissage et observabilité |
| Evals | benchmark promptfoo agent-safety (fait) | Constructeurs d'agents, réviseurs de sécurité |
| Versioning | Semver pour Core ; bundle de schémas daté ; changelog ; fenêtres de dépréciation | Promesse de stabilité |
| Status | Page de statut publique pour les endpoints de cookwala.ai | Confiance |

---

## 9. Démos

| Démo | Audience | Statut |
|---|---|---|
| In-browser dry run | Tout le monde | Building now |
| Simulateurs (maison, ville, pays, monde) | Tout le monde, bailleurs de fonds | Live |
| Résultats de l'agent-safety à travers les modèles | Constructeurs d'agents, laboratoires d'IA | Next (run the benchmark, publish results with method) |
| Démonstration SMS food-rescue | Food banks | Next (recorded demo) |
| Un véritable appareil cuisinant une recette Cookwala, non édité | Tout le monde | Later (la démo la plus importante ; nécessite un partenaire de dispositif) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Chercheurs en robotique | Later |

---

## 10. Communauté et croissance

- **Réseau de contributeurs** (inspiré par Figure's Index) :
  - Les *Cooks* enregistrent des sessions consenties de recettes qu'ils connaissent, avec un crédit sur chaque recette et
    dataset card.
  - Pilote de *Kitchens and food banks*.
  - Les *Makers* implémentent les appareils.
  - Les *Reviewers* révisent les rule packs et les envelopes.
  - Les *Translators* traduisent les étapes et le vocabulaire.
  - Les contributions rémunérées arrivent later, financées par des subventions. Ne payez jamais pour des données sans
    consentement éclairé et des conditions équitables.
- **Rituels :** appel communautaire mensuel ; « état de Cookwala » trimestriel avec des chiffres réels ;
  fils de discussion publics.
- **Séquence de partenariat :** les dix premiers du stakeholder tracker (food bank, WFP
  Innovation Accelerator, Home Assistant, une startup d'appareils, un laboratoire universitaire, un certifier,
  World Central Kitchen, une fondation, un home neutre, un creator).
- **Canaux :** GitHub Discussions, une newsletter, des conférences (ROSCon, ateliers IROS/ICRA,
  événements food-tech), des canaux en langue arabe.

---

## 11. Métriques

- **North-star metric :** *verified cooks*, le nombre d'executions ayant exécuté une recette Cookwala signée de bout en bout avec un log consenti et conforme. Tant que celui-ci est à zéro, suivez les indicateurs avancés.

| Entonnoir | Métrique | Cible d'ici 2027-03 |
|---|---|---|
| Attirer | Visiteurs mensuels à /start | 2,000 |
| Activer | dry run complétés (web + CLI) | 500 |
| Construire | Implémentations Independent Core réussissant la conformance | 2 |
| Adopter | kg sauvés par le pilote food bank (measured) | Premier pilote de 6 mois en cours |
| Contribuer | Contributeurs externes avec changements fusionnés | 15 |
| Confiance | Revues externes publiées | 6 |
| Apprendre | execution log consentis | 1,000 |

---

## 12. Feuille de route

La feuille de route maintenue avec un statut par élément est [`ROADMAP.md`](ROADMAP.md). Le tableau ci-dessous est le
plan original de 180 jours, conservé pour archive.

| Quand | Site web et histoire | Expérience développeur | Standard et sécurité | Communauté |
|---|---|---|---|---|
| **Now (cette version)** | Nouvelle page d'accueil avec live dry run, triad, paths, proof, now/next/later ; visionneuse de docs ; `llms.txt` ; pages de confiance (sécurité, gouvernance) | Dry run ; exportateurs LeRobot et OTel ; actions ROS 2 ; benchmark agent-safety | Spécification Registry (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Next 30 days** | /start quickstart ; page d'accueil en arabe ; claims pass sur toutes les pages | `pip install cookwala` ; hub de référence (Docker) | Premiers résultats de benchmark publiés | Note conceptuelle pour food bank ; proposition Home Assistant |
| **60 days** | index /recipes avec corpus fifi (100 premiers convertis) ; /humanitarian | TS SDK ; serveur MCP | Revue de l'operation envelope par un scientifique de l'alimentation | Premier appel communautaire |
| **90 days** | Whitepaper + résumé de 2 pages ; /roadmap | package ROS 2 | Core 0.3 à partir des retours appareils | Partenaire appareil, laboratoire universitaire |
| **180 days** | Vidéo de démo sur appareil réel | Éditeur de recettes | Analyse d'écart de certification | Résultats pilotes ; demande de fondation |

---

## 13. Risques pour cette stratégie

| Risque | Atténuation |
|---|---|
| Un site poli sur une réalité mince ressemble à du battage médiatique | Chaque affirmation est étiquetée ; compteurs en direct à partir de données réelles ; now/next/later |
| Se disperser auprès de trop de publics | Deux voies primaires pour les 90 prochains jours : les fabricants d'appareils et les food banks. Les autres sont soutenus mais non poursuivis |
| Les grandes plateformes livrent des alternatives fermées | Être la couche neutre et vérifiable qu'ils peuvent adopter ; s'associer avec des acteurs ouverts (Hugging Face, Open Robotics, Home Assistant) |
| Utilisation abusive des données des contributeurs | Consentement opt-in, révocable ; aucune donnée personnelle ; data cards publiées |
| Bande passante du fondateur | Livrer l'expérience développeur (package, hub) avant plus de spécifications ; recruter un co-mainteneur |

