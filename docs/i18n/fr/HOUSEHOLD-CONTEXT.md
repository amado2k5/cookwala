<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->

# Profil de Household Context : l'ensemble de l'image reste à la maison

> **Statut : draft profile** (RFC-0001). Ne fait pas partie de Cookwala Core. Schéma :
> `schemas/household.schema.json`. Registry : `vocab/facets.json` (139 facet types).
> Règles du destinataire : `profiles/household/recipient-roles.json`. API locale :
> `api/household.openapi.yaml`. Exemple : `examples/household/context.json`.

## 1. Pourquoi

Un robot qui sert bien une famille doit en savoir beaucoup : les appareils et leurs particularités, qui vit là et quand ils sont à la maison, les animaux de compagnie, les enfants, les régimes alimentaires, les allergies, les horaires de prise de médicaments, les rituels, le budget, les habitudes de shopping, ce qui s'est mal passé la dernière fois. Ces mêmes faits constituent un plan de cambriolage et un outil de profilage. Ce profil donne au **planner at home** une vue d'ensemble et ne donne à tous les autres qu'une **constraint**.

## 2. Trois idées

1. **Facets.** Un fait saisi chacun (`cw.facet.household.health.allergies`), avec qui
   l'a affirmé (déclaré, observé, rapporté, inféré), quand, pendant combien de temps, le degré de confiance,
   et une classe de confidentialité (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules in the registry.** Chaque type de facet indique si sa valeur brute peut quitter
   le foyer : `never` (45 types : enfants, absences, configurations, conditions de santé, religion,
   comportement, incidents, posture de revenus), uniquement en tant que contrainte `derived` (81 types), ou en tant que
   divulgation `consented` après une autorisation explicite (13 types, principalement l'auto-état de l'appareil pour le
   fabricant).
3. **Derived constraints.** Le seul objet de contexte domestique qu'un épicier, un planificateur, un service de livraison,
   un fabricant d'appareils ou un autre robot reçoit jamais : « livrer 17:00–18:00 à la porte d'entrée »,
   « bloquer les arachides », « aucun mouvement de robot dans le couloir 15:00–15:30 », « plafond budgétaire 18.00 USD par
   repas ». Chacun nomme les **types** de facet dont il provient, jamais leurs valeurs.

## 3. Qui reçoit quoi

| Rôle du destinataire | Peut recevoir |
|---|---|
| épicier | delivery window, access point, allergen block, budget cap, labelling, packaging |
| livraison | delivery window, access point, packaging |
| planificateur (IA ou logiciel qui planifie le repas) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| fabricant de l'appareil | robot runtime, device fault summary; device self-state facets by consent |
| autre robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| assureur | device fault summary uniquement (comptages de fautes par catégorie, pas de temps, pas de faits liés au household context), et uniquement lorsque le household context a nommé un assureur comme destinataire ; RFC-0001 liste ce rôle comme celui le plus susceptible d'être supprimé si un examen de la vie privée s'y oppose |
| programme (food bank, école) | rien |
| jeu de données | rien |

## 4. Règles

- Les facets brutes ne quittent jamais l'appareil. Il n'existe aucune API qui les renvoie à quiconque en dehors du réseau domestique.
- Les facets `inferred` ne sont jamais utilisées pour des décisions de sécurité.
- Aucun score comportemental de toute personne n'est produit ou stocké. Les facets de comportement existent pour servir le ménage (tailles des portions, moment du débarrassage) et ne voyagent jamais.
- Le niveau économique est une **posture budgétaire définie par le propriétaire**, jamais déduite de quoi que ce soit.
- Les données et les absences des enfants sont `secret` et ne voyagent jamais, même pas dérivées, sauf en tant que contraintes de mouvement et de zone de sécurité qui ne révèlent aucun emploi du temps.
- Chaque facet est effaçable. L'effacement s'effectue dans le délai du ménage (7 jours par défaut, au maximum 30) et est consigné sans contenu.
- Une classe de confidentialité peut être élevée au-dessus de la valeur par défaut du registry, mais jamais abaissée.

## 5. La mémoire locale des incidents

RFC-0001 demande ce que le robot se souvient des alarmes, des conflits, des renoncements et des leçons. `LocalIncident` le contient : date, catégorie issue de
`vocab/incidents.json`, qui était impliqué par type, une note et une leçon. Cela ne quitte jamais le
foyer. L' `IncidentReport` public et anonyme dans Core est un document différent dont chaque
maker tire des enseignements.

## 6. Conformance

Les vecteurs de profil (`conformance/profiles/disclosure_policy.json`) fournissent des facets et un rôle de destinataire et attendent les types de contraintes exacts, les ids divulgués et les ids retenus avec les raisons. L'implémentation de référence est `derive_constraints()` dans `tools/cookwala_ref.py`.

## 7. Relation avec les autres documents

`ClientProfile`, `KitchenProfile` et `RobotProfile` (`profile.schema.json`) restent des bundles pratiques. Les facets de mission (`mission.schema.json`) utilisent les mêmes ids de registry. Le `AgentMandate` Core reste l'énoncé normatif de ce qu'un agent peut faire ; les facets de mandate décrivent les règles du household localement.

## 8. Questions ouvertes

Voir RFC-0001 : rôles de destinataires fermés ; confidentialité de type raise-only ; une analyse d'impact relative à la protection des données avec un réviseur.

