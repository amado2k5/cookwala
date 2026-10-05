<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# Cuisines et cycles de production : restaurants, communauté, école, catastrophe et cuisines robotisées

> **Statut : profil expérimental** (RFC-0005). Schéma : `schemas/fleet.schema.json`.
> Exemples : `examples/fleet/`.

## 1. Pourquoi

Le fondateur a demandé le même protocole dans un restaurant, un mariage, une collecte de dons ou une usine alimentaire (RFC-0005). Le brief ajoute les programmes de repas scolaires et les cuisines de catastrophe. Le Core couvre la cuisson d'une recette par un seul appareil ; le Humanitarian Profile couvre le déplacement du surplus et le comptage des repas. Entre les deux se trouve la **kitchen** : les stations, les appareils, les personnes, de nombreux lots, une fenêtre de service, les points de contrôle critiques, et le lien entre l'execution log d'un appareil et les repas qu'un programme rapporte.

## 2. Documents

| Document | Ce qu'il dit |
|---|---|
| `Kitchen` | La cuisine d'une organisation : type, stations (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), les appareils comme références de capacité, la capacité en repas par heure, l'équipement de hot-hold et de cooling, les rule packs en vigueur, les **comptages du personnel par rôle**, les heures d'ouverture |
| `ProductionRun` | Les recettes avec les nombres de lots et de portions, une fenêtre de service, les affectations par étape de recette à une station et à un `device`, une `person` ou les deux, les enregistrements des points de contrôle critiques (température à cœur de cuisson, hot-hold, cooling en deux étapes, réchauffage, stockage réfrigéré, ségrégation des allergènes), les exécutions Core produites, et un résultat (repas produits et servis, déchets, food rescued utilisée, échecs, incidents, énergie, coût, la `Distribution` Humanitaire qu'elle a émise) |
| `StationLease` | L'utilisation exclusive d'une station par un device ou un rôle pour un temps donné |

## 3. Comment il rejoint le reste

- Une étape assignée à un `device` est une `ExecuteRequest` Core (ou un objectif `ExecuteNode` via le binding ROS 2) ; son hash `ExecutionLog` va dans `executions`.
- Un run qui sert un programme émet une `Distribution` Humanitarian ; les `ccps` du run sont les preuves derrière les conclusions de sécurité de la distribution.
- Les rule packs du Humanitarian Profile s'appliquent au menu et aux articles du run.
- La répartition de la flotte (quel robot va où) appartient à Open-RMF ou au gestionnaire de flotte d'un fournisseur, pas à ce profil.

## 4. Exemple concret

`examples/fleet/kitchen-disaster.json` et `production-run-disaster.json` : une cuisine de secours
avec deux bouilloires à gaz, des unités de maintien au chaud et un bain de glace produit 710 repas de soupe de lentilles et
de riz pour une fenêtre de deux heures, enregistre les températures de cuisson et de maintien au chaud, trouve une unité de maintien au chaud
en dessous de 60 °C et réchauffe ce lot avant de servir, et émet une distribution. L'exemple est
illustratif ; aucune cuisine ou événement réel n'est décrit.

## 5. Ce qui est délibérément laissé de côté

Noms et horaires du personnel, salaires, commandes et paiements des clients, tarification du menu. Le personnel apparaît sous forme de décomptes par rôle afin que le coût par repas puisse être calculé sans identifier qui que ce soit.

## 6. Next

Exemple de service de restaurant avec une station robotisée ; une suite de conformance pour la machine à états de l'exécution ; unification de `StationLease` avec les baux de session (`session.schema.json`).

