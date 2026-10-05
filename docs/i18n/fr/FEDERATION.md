<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->

# Fédération : comment Cookwala fonctionne sans centre

**Status :** draft, 2026-10-04 (RFC-0006). La photo du fondateur était une ruche : pas de commandement central, pourtant une harmonie et un rétablissement. Cette page explique ce que cela signifie en pratique.

## 1. Nœuds

| Nœud | Ce qu'il dessert | Qui en gère un |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, recettes, vocabulaires, rule packs, clés, flux | un éditeur de recettes, un réseau de food bank, une université, un fabricant d'appareils, cookwala.ai |
| **Registry** | `/v1/registry.json` : pointeurs vers les catalogs, collections, devices, packs, benchmarks | n'importe qui ; cookwala.ai en gère un |
| **Hub** | l'API Core pour une cuisine, limites de sécurité locales, le household context | chaque cuisine ; fonctionne hors ligne |
| **Mirror** | republie les éléments signés des autres nœuds sans modification | n'importe qui souhaitant de la résilience dans sa région |

Un dossier statique est un catalogue valide. Un téléphone avec les modèles CSV est un participant humanitaire valide au niveau H0.

## 2. Des flux, pas des commandes

Les nœuds publient des flux signés : recalls, incidents anonymes, changements de registry, enregistrements clés.
Les autres nœuds interrogent ce en quoi ils ont confiance et peuvent le republier. Rien n'est poussé dans une cuisine ; une
cuisine tire les données lorsqu'elle est en ligne et continue de fonctionner lorsqu'elle ne l'est pas.

## 3. Vérifier par rapport à l'émetteur, jamais par rapport au relais

Un recall qui arrive via un miroir n'est aussi bon que la signature de l'**émetteur**. Un hub
résout le `KeyRecord` de l'émetteur à partir du propre document de découverte de l'émetteur ou de did:web et
vérifie le corps octet par octet. La clé du miroir ne prouve rien concernant le contenu ; un miroir
qui modifie un recall rompt la signature. Les vecteurs de profil dans `conformance/profiles/federation.json`
montrent les trois cas.

## 4. Listes de confiance

Chaque hub conserve une liste de catalogues et de registries en lesquels il a confiance, avec leurs clés et une priorité. Un nœud peut suggérer des pairs (`federation.peers`) ; le hub décide. cookwala.ai est une entrée sur une telle liste, pas une racine.

## 5. Fraîcheur

Les entrées du registry portent un statut et une heure de publication ; les recalls portent une heure d'émission ; les facets household portent une validité. Les éléments périmés sont récupérés à nouveau ou abandonnés. Rien n'est considéré comme fiable parce que c'est ancien, rien n'est supprimé silencieusement : les entrées retirées restent sous forme de tombstones.

## 6. Historique

Les journaux d'événements avec des points de contrôle attestés (section Core 5) rendent les réécritures détectables sans une
blockchain : une seconde partie contresigne l'en-tête du journal, et une réécriture later ne correspond plus. L'ancrage public des en-têtes de points de contrôle est optionnel et est une décision des fondateurs
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Trois nœuds qui interopèrent

- **Un réseau de food bank** gère un registry de ses cuisines et donateurs, un catalogue de ses rule packs adaptés à la loi nationale, et une passerelle SMS. Il s'inscrit dans le directory cookwala.ai ou non ; ses données n'ont jamais à quitter son pays.
- **Un fabricant de dispositifs** gère un catalogue de ses documents de capacité et de ses safety-limit packs, publie des rapports de conformance, et interroge les flux de recall des catalogues utilisés par ses clients.
- **Un laboratoire universitaire** gère un catalogue de recettes de référence et d'execution logs (avec consentement), assure le miroir des vocabulaires, et publie ses propres vecteurs.

Aucun d'entre eux n'a besoin que cookwala.ai soit en ligne.

## 8. Ce qui n'est pas construit

Un orchestrateur central, un fournisseur d'identité central, un jeton, une blockchain. Les décisions de quorum et les orchestrateurs du profil Mission restent optionnels et expérimentaux.

