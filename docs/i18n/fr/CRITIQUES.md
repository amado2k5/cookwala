<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->

# Critiques que nous avons publiées

Nous avons posé des questions difficiles sur Cookwala et avons consigné les réponses. Chaque préoccupation possède un id dans le [registre des préoccupations du plan d'action](ACTION-PLAN.md#2-concern-register), ainsi que notre réponse et son statut. Les avis extérieurs sont les bienvenus et seront répertoriés ici.

## Est-ce que cela va fonctionner ? (strategy)

| Préoccupation | Réponse courte | Statut |
|---|---|---|
| Le marché n'existe pas encore ; la spécification est en avance sur les produits | Small Core, démo d'abord, pas de nouvelle spec sans utilisateurs | Core 0.2 terminé ; démo de l'appareil next |
| Personne de puissant n'a de raison d'adopter | Mener par le gain de chaque adoptant ; utile sans robots | Pilote food bank et partenaire de l'appareil recherchés |
| Les simulateurs prouvent ce qu'ils assume | Base de référence équitable, plages, étiquettes "illustratives" ; les pilotes les remplacent | Open |
| La faim est une question de pauvreté et de conflit, pas de surplus | Cookwala contribue ; il ne prétend pas mettre fin à la faim seul | Message changé |
| Sécurité, responsabilité et surface d'attaque | Limites appliquées sur l'appareil ; refusal ; recalls ; rapports d'incident | Spec terminée ; revue du certifier open |
| Confidentialité (données de santé et de religion, registres vs effacement) | Local-first, divulgation sélective, logs hash-only, consentement | Spec terminée ; évaluation d'impact open |
| Trop complexe | Core 0.2 ; tout le reste marqué expérimental | Done |
| Dépendance au fondateur | Voie de gouvernance vers un foyer neutre | GOVERNANCE.md |

## La conception technique est-elle solide ?

| Préoccupation | Ce qui a changé dans Core 0.2 |
|---|---|
| Les opérations n'avaient pas de sens physique | Envelopes, niveaux de chaleur, sensor ladders, règle d'altitude, vecteurs de test |
| Bugs d'unités et de nombres | °C uniquement, tolérances absolues, unités de cuisine, densités, argent décimal |
| Les schémas acceptaient les fautes de frappe | Schémas stricts avec extensions `x-`; bundle hors ligne |
| Un seul document Mission mutable | Event log + projection, séquenceur unique, table de transitions |
| Le registre prouvait peu | Key records avec révocation, checkpoints témoins, détection de réécriture |
| Livraison d'événements indéfinie ; sécurité sur le bus | Numéros de séquence, classes de latence, heartbeats, "la sécurité est locale" |
| Dérive des surfaces API | Core OpenAPI ; chaque référence vérifiée dans CI |
| Pas de vérificateur | Bibliothèque de référence et 106 vecteurs de conformance |

## Avis que nous demandons

W3C TAG (identité, JSON-LD), IETF SCITT (transparence de l'event-log), scientifiques de l'alimentation
(envelopes), responsables de la sécurité alimentaire et diététiciens (rule packs), un audit de sécurité, une
revue de la protection des données, et une analyse d'écart par un certificateur. Voir le
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

