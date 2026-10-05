<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->
# Feuille de route : now, next, later

**Status :** 2026-10-04. Chaque élément porte un statut : **done**, **in progress**, **planned**,
**not yet funded**. Les jalons proviennent de la section 4 de `ACTION-PLAN.md`. Rien ne passe de planned
à done sans l'évidence nommée.

## Now (cette version)

| Élément | Statut |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Neuf recettes d'exemple en anglais et en arabe | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Quatre simulateurs avec le protocole activé et désactivé | done (illustrative) |
| Site web en anglais et en arabe avec une page pour chaque partie prenante, whitepaper et deck | in progress |

## Next (dans environ un an, selon les ressources disponibles)

| Élément | Statut | Porte |
|---|---|---|
| Revue des operation envelopes par un scientifique de l'alimentation | planned | le réviseur est d'accord |
| Revues des quatre rule packs par un diététicien et un responsable de la sécurité alimentaire | planned | revues archivées ; les packs passent à reviewed |
| Évaluation de l'impact sur la protection des données du profil household context | planned | le réviseur est d'accord |
| Un pilote food bank (12 semaines, pré-enregistré, évaluateur indépendant) | not yet funded | partenaire et financement (`humanitarian/CONCEPT-NOTE.md`) |
| Résultats du benchmark de sécurité des agents pour plusieurs familles de modèles | planned | exécutions publiées avec la méthode |
| wheel `pip install cookwala` et `@cookwala/sdk` sur npm | planned | packaging qui regroupe les vocabulaires et les schémas |
| Service de registry (`validate`, `publish`, tombstones) | planned | un worker et une preuve de namespace |
| Premier fabricant de dispositifs implémentant la Core API par rapport au hub de référence | planned | un fabricant est d'accord ; rapport de conformance publié |
| Conversion des premières collections fifi.cooking | planned | le fondateur décide des droits par collection |
| Core 0.3 issu des retours des dispositifs | planned | retours de deux implémenteurs |
| Comité de pilotage | planned | trois adoptants indépendants ou deux implémentations |

## Later

| Item | Status |
|---|---|
| Un véritable appareil cuisinant une recette Cookwala, non édité, en vidéo | pas encore financé ; nécessite un partenaire matériel |
| Schéma de certification avec un certificateur indépendant | prévu ; aucun certificateur engagé |
| Fondation neutre pour la spécification, la marque déposée et le marquage | prévu |
| Réseau de contributeurs : enregistrements consentis de vraies recettes avec crédit | prévu |
| Signaux de demande et d'offre publiés par des programmes et des coopératives | prévu, après examen du droit de la concurrence |
| Benchmark "Cook in simulation" (Isaac Lab, Gazebo ou MuJoCo) | prévu |
| Reconnaissance en tant que Bien Public Numérique pour le Humanitarian Profile | prévu, après preuve pilote |
| Flux de secours transrégionaux dans le simulateur mondial ; effets de clean-cooking | prévu |

## Ce que nous ne ferons pas

Collecter des données personnelles ; publier des chiffres sans une méthode ; nommer un partenaire avant qu'il n'accepte ;
revendiquer une certification qui n'existe pas ; mettre des données de household sur n'importe quel registre ; construire un
orchestrateur central dont les cuisines dépendent ; prétendre mettre fin à la faim.

## Règles de kill and pivot

Du plan d'action : si deux cycles de revue externe ne parviennent pas à produire un fabricant de dispositifs ou un partenaire pilote, Cookwala se restreint au Humanitarian Profile et au format de recette. Si un pilote montre un gain inférieur à 5 %, les résultats sont publiés et le profil est redessiné avant toute mise à l'échelle.

