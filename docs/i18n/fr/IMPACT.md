<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->
# Impact : ce que Cookwala peut changer, avec sources et labels

**Status :** 2026-10-04. Chaque nombre ci-dessous est étiqueté **measured** (compté ou rapporté par la source nommée), **modelled** (produit par nos simulateurs selon des hypothèses énoncées) ou **assumed** (un chiffre de planification). Rien ici n'est le résultat de Cookwala sur le terrain : aucun pilote n'a été exécuté. Cette page indique l'ampleur des problèmes et les mécanismes par lesquels Cookwala contribue.

## 1. Faim

| Fait | Chiffre | Étiquette et source |
|---|---|---|
| Personnes ayant souffert de la faim en 2023 | environ 733 millions | measured par la source : FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Personnes en situation d'insécurité alimentaire modérée ou grave en 2023 | environ 2,3 milliards | measured par la source : SOFI 2024 |
| Aliments perdus entre la récolte et la vente au détail | environ 14 % de la nourriture produite | measured par la source : FAO, *The State of Food and Agriculture 2019* (UNEP arrondit ce même chiffre à 13 %) |
| Aliments gaspillés dans la vente au détail, la restauration et les ménages en 2022 | environ 1,05 milliard de tonnes ; environ 132 kg par personne ; environ 79 kg par personne dans les ménages | measured par la source : UNEP, *Food Waste Index Report 2024* |

**Les mécanismes de Cookwala :** des offres de surplus qui atteignent une cuisine avant que la nourriture ne se gâte, avec une vérification de la chaîne du froid à chaque transfert (Humanitarian Profile) ; un impact comptabilisé de la même manière sur chaque site afin que les programmes puissent comparer et s'améliorer ; plus tard, des signaux agrégés de la demande et de l'offre pour que moins de produits soient cultivés et déplacés pour être jetés (experimental, gated on competition-law review). **Ce qu'il ne fait pas :** traiter la pauvreté, les conflits, les chocs climatiques, les prix ou les politiques, qui sont les causes de la majeure partie de la faim.

**Modelled, illustratif, pas une prévision :** le déploiement mixte du simulateur national sauve des repas équivalents à environ 4,7 % de ce dont sa population fictive en situation d'insécurité alimentaire a besoin ; le scénario « protocole, pas de robots » du simulateur mondial atteint environ 40 millions sur environ 770 millions (la baseline assumed du simulateur, un arrondi des 733 millions measured ci-dessus) de personnes affamées uniquement grâce au rescue. Les deux disent la même chose : le rescue compte et n'est pas suffisant.

## 2. Santé

| Fait | Chiffre | Étiquette et source |
|---|---|---|
| Maladies dues à une alimentation non sûre chaque année | environ 600 millions ; environ 420 000 décès | measured par la source : WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Apport en sel par rapport à la directive | la plupart des gens consomment 9 à 12 g de sel par jour ; l'OMS recommande moins de 5 g (2 g de sodium) | measured par la source : WHO fact sheet on salt reduction |
| Décès attribuables à une consommation élevée de sodium chaque année | environ 1,9 million | measured par la source : WHO, *Global report on sodium intake reduction* (2023) |
| Personnes dépendant de combustibles de cuisson polluants | environ 2,1 milliards ; environ 3,2 millions de décès par an dus à la pollution de l'air domestique | measured par la source : WHO fact sheet on household air pollution (2024) |

**Les mécanismes de Cookwala :** points de contrôle critiques et limites de maintien au chaud, de refroidissement et de réchauffage appliquées sur l'appareil et enregistrées ; rule packs qui signalent le sodium, les sucres libres, les graisses saturées et les fruits et légumes sur les menus ; règles de soin pour les enfants, la grossesse et les personnes âgées ; un registre de révision pour que les diététiciens et les responsables de la sécurité alimentaire puissent garantir un pack.
**Ce qu'il ne fait pas :** diagnostiquer, traiter ou calculer des régimes thérapeutiques ; voir `docs/health/CLAIMS-POLICY.md`.

**La cuisson propre** est présente dans l'image mais pas dans le modèle : les simulateurs ne comptabilisent pas encore la cuisson au bois et au charbon ou ses effets sur la santé (listés comme une limitation ; next).

## 3. Environnement

| Fait | Chiffre | Étiquette et source |
|---|---|---|
| Part des émissions mondiales de gaz à effet de serre provenant des pertes et du gaspillage alimentaires | environ 8 à 10 % | measured par la source : UNEP, *Food Waste Index Report 2024* |

**Modelled, illustratif :** dans le simulateur de monde, « de nombreux robots avec le protocole » réduit toute la nourriture perdue ou gaspillée d'environ 4.1 % et les émissions d'environ 5.2 % sur cinq ans par rapport au même monde sans eux ; « de nombreux robots seuls » réduit les déchets ménagers mais augmente les pertes avant les foyers d'environ 3 % (un effet coup de fouet). L'électricité des robots (environ 164 TWh sur cinq ans dans ce scénario) est comptabilisée. Ce sont les sorties du modèle sous ses hypothèses, listées sur chaque page du simulateur.

## 4. Économie et travail

**Assumed and modelled :** le simulateur de ville estime environ 5 USD par personne par mois
moins de dépenses alimentaires et environ 10 heures par foyer par mois de moins en cuisine et en courses avec les robots
cuisiniers, matériel non inclus. Aucun chiffre pour les emplois n'est donné nulle part ; de nouveaux rôles sont nommés
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) sans
chiffres.

## 5. Culture

Aucun numéro. L'affirmation est qualitative et vérifiable : une recette Cookwala porte le nom du cuisinier, l'identité du plat (ce qui est essentiel, ce qui est flexible, ce qui n'est jamais ajouté), du texte dans la langue du cuisinier, et une signature. Les machines qui la cuisinent héritent de la recette en tant que connaissance opérationnelle, avec crédit.

## 6. Ce que nous mesurerons lorsqu'il y aura quelque chose à mesurer

| Mesure | Méthode | Où est défini |
|---|---|---|
| Kilogrammes sauvés, repas servis, personnes atteintes, taux de réussite nutritionnelle, coût par repas, délai de réclamation, taux de réclamation, conclusions sur les blocages de sécurité, incidents de sécurité | calculé à partir des documents Offer, Claim, Handover et Distribution | section 10 du Humanitarian Profile ; `ImpactSummary` |
| Cuisiniers vérifiés : exécutions ayant lancé une recette signée de bout en bout avec un log de conformance | execution logs avec consentement | section 11 de `STRATEGY.md` |
| Implémentations indépendantes passant la conformance | rapports de conformance publiés | `docs/CERTIFICATION.md` |
| Résultats d'agent-safety par modèle | le benchmark promptfoo, avec model id, date et config hash | `evals/kitchen-agent-safety/` |

## 7. Ce que nous ne savons pas encore

Si une food bank sauve plus avec le profil qu'avec sa méthode actuelle (le protocole pilote existe ; aucun pilote n'a été effectué). Si les envelopes sont adaptés à chaque cuisine (un scientifique des aliments ne les a pas examinés). Si les behavioural assumptions des simulateurs se maintiennent (elles sont listées et ajustables). Quelle est l'ampleur des effets de rebond. Rien ici n'est une promesse.

## 8. Ce qui s'est mal passé

Rien n'a été déployé, donc rien ne s'est mal passé sur le terrain. Dans le repository : la
première ligne unique ("world's first and largest robot cooking recipes index") surestimait ce qui
existait et a été modifiée ; le premier schéma Mission acceptait des champs inconnus et a été rendu
strict ; les premiers simulateurs utilisaient une base de référence strawman et ont acquis une base de
référence d'intégration compétente et des plages. Les critiques qui ont conduit à ces changements sont publiées
(`docs/CRITIQUES.md`).

## 9. Sources

- FAO, IFAD, UNICEF, WFP et WHO, *The State of Food Security and Nutrition in the World
  2024*, Rome, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Rome, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Geneva, 2015.
- WHO, *Global report on sodium intake reduction*, Geneva, 2023 ; fiche d'information de la WHO *Salt
  reduction*.
- Fiche d'information de la WHO *Household air pollution*, 2024.

Les chiffres sont cités tels que les sources les publient, arrondis ; vérifiez chaque chiffre par rapport à l'édition actuelle avant de le citer à l'impression. Les organisations sont des sources, pas des partenaires.

