<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Parties prenantes : un message, des options, un premier succès et un flux pour tout le monde

**Status :** 2026-10-04. Pour chaque groupe : pourquoi Cookwala est important pour eux, les façons de s'engager de léger à profond, un premier succès en moins de 15 minutes, le chemin après cela, et comment l'engagement fait progresser leur travail et le monde. Rien ici ne nomme un partenaire, un utilisateur ou un pilote qui n'existe pas. Lorsqu'une chose est prévue, il est indiqué next ou later.

Les trois objectifs derrière chaque ligne : aider à mettre fin à la faim, rendre les gens en meilleure santé, mettre les robots au service des gens.

---

## 1. Constructeurs : développeurs, fabricants de robots et d'appareils, ingénieurs en systèmes embarqués, constructeurs d'agents IA, développeurs de maisons intelligentes et de plateformes, contributeurs open-source

**Message.** Les robots et les appareils apprennent à se déplacer. Personne n'a consigné, sous une forme qu'une machine peut vérifier, ce que signifie « simmer », quand le poulet est sûr, ou quand une étape doit faire l'objet d'un refusal before heat. Cookwala est cette couche : des recettes qu'une machine peut planifier, des conditions de fin qu'elle peut mesurer, et des limites de sécurité qu'elle s'impose elle-même. C'est un système ouvert, libre de redevances, neutre vis-à-vis des modèles et des appareils, et il est accompagné d'une suite de conformance que vous pouvez exécuter dès aujourd'hui.

**Options.**
- *Light :* lancer le dry run du navigateur ; lire Core 0.2 (une soirée).
- *Medium :* `pip install -e sdk/python`, effectuer un dry-run des capacités de votre appareil par rapport aux recettes d'exemple, exécuter les vecteurs de conformance, démarrer le hub de référence.
- *Deep :* implémenter l'API Core sur un appareil ou un hub, publier un rapport de conformance, ajouter votre appareil au directory, proposer un RFC, écrire un nœud de pont ROS 2, ajouter des cas d'attaque au benchmark agent-safety.

**Premier succès (moins de 15 minutes).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Flux.** Dry run → implémenter la Core API par rapport au hub de référence → réussir la conformance →
publier le rapport → lister le dispositif → les execution logs consentis deviennent des jeux de données LeRobot et des
traces OpenTelemetry.

**Comment cela fait progresser leur travail.** Une définition de tâche et un test de réussite partagés pour la cuisine, avec
un benchmark public pour mesurer les résultats ; des recettes dans chaque cuisine sans avoir à les écrire ; une
histoire de sécurité que les régulateurs peuvent lire ; des rapports de conformance comme document de vente ; une
position de premier arrivant dans une norme qui sera gouvernée par ses implémenteurs.

**Comment cela fait progresser la société.** Moins d'incendies de cuisine et de maladies d'origine alimentaire grâce à des machines qui pratiquent le refusal before heat plutôt que de deviner ; des machines qui héritent des cuisines du monde entier au lieu de quelques-unes.

---

## 2. Entreprises : startups, entreprises, sociétés alimentaires, épiceries et livraison, restaurants et services alimentaires, assureurs, certificateurs, équipes de vente et de partenariat

**Message.** Chaque entreprise qui touche à l'alimentation rencontrera des machines de cuisson et des agents IA dans les prochaines années. Cookwala vous offre une interface unique pour tous, la seule avec des limites de sécurité appliquées sur l'appareil et des enregistrements que vous pouvez auditer. Pour les épiciers et la livraison : recevez des créneaux de livraison et des exigences en matière d'allergènes, jamais l'emploi du temps d'une famille. Pour les assureurs et les certificateurs : un format de rapport de conformance et un flux de rapports d'incidents conçus pour vous.

**Options.**
- *Light :* lisez la page Investors and partners et les pages trust ; mappez vos produits aux
  ingredient classes et operations.
- *Medium :* publiez un offer feed (market profile, experimental) ou une surplus offer à un
  local program (Humanitarian Profile) ; lancez le agent-safety benchmark sur l'agent que vous
  prévoyez de déployer.
- *Deep :* implémentez la Core API dans un produit ; parrainez une conformance verification ; rejoignez le
  steering committee lorsqu'il sera formé ; adoptez le certification path.

**Premier succès.** Convertir une ligne de produits en une `Offer` de marché avec des GTIN et des justificatifs d'allergènes, la valider, et voir quelles recettes d'exemple elle peut fournir.

**Flux.** Offrir le flux → contraintes dérivées des ménages → commandes via votre propre paiement → événements de satisfaction → réputation issue des rapports d'exécution (avec consentement).

**Comment cela fait progresser leur travail.** Accès à une couche neutre au lieu d'une douzaine d'intégrations de fournisseurs ; signaux de demande (later, après examen du droit de la concurrence) qui réduisent le gaspillage ; certification que les assureurs peuvent tarifer ; un registre public de la sécurité.

**Comment cela fait progresser la société.** Moins de nourriture perdue entre le magasin et l'assiette ; le surplus atteignant les cuisines avant de pourrir ; des machines dans les foyers à qui l'on ne peut pas faire accepter des actions dangereuses.

---

## 3. Fournisseurs : épiceries, fermes et coopératives, livraison, énergie, vendeurs d'IA et de modèles, éditeurs de recettes

**Message.** Les fournisseurs se connectent à Cookwala en tant que pairs, et non en tant que locataires. Un épicier ou un service de livraison reçoit une contrainte, jamais les faits d'un ménage. Un vendeur d'IA reçoit un benchmark qui montre que son modèle est sûr dans une cuisine et un serveur MCP à utiliser aujourd'hui. Un éditeur de recettes conserve son nom sur chaque recette et peut publier un catalogue signé à partir d'un dossier statique.

**Options.** Publier un catalogue (recettes) · publier un flux d'offres · exécuter le benchmark agent-safety · exécuter un nœud de registry · proposer le surplus par SMS.

**Premier succès.** Éditeur de recette : `cookwala init my-dish`, modifier, `cookwala validate`,
`cookwala hash` ; votre catalogue est un dossier avec `/.well-known/cookwala.json`. Fournisseur IA :
ajoutez le serveur MCP et exécutez les dix cas de sécurité des agents.

**Flux.** Catalogue ou flux → entrée dans le registry sous votre namespace prouvé → recall du flux si quelque chose ne va pas → réputation issue des résultats.

**Comment cela fait progresser leur travail.** Atteindre chaque appareil et agent via un format unique ;
crédit et provenance par signature ; un benchmark de sécurité qui est un atout marketing lorsqu'il est
réussi honnêtement.

**Comment cela fait progresser la société.** Les recettes restent attribuées ; les agents qui agissent pour les personnes sont
measured avant qu'ils ne soient dignes de confiance.

---

## 4. Alimentation : agriculteurs, cuisiniers et chefs, cuisiniers domestiques, créateurs de recettes, écoles culinaires

**Message.** Une recette écrite pour Cookwala maintient votre nom et votre cuisine en vie sur chaque
appareil qui la cuisine, avec les étapes qu'une machine ne doit jamais sauter écrites. Une ferme avec un
surplus peut l'inscrire par SMS et atteindre une cuisine le jour même. Une école culinaire peut enseigner la
sécurité alimentaire avec un format qui s'auto-vérifie.

**Options.**
- *Agriculteurs :* `FARM 120KG TOMATO A BB0411` vers la passerelle d'un programme (lorsqu'elle existe) ;
  later, lire les signaux d'offre et de demande.
- *Cuisiniers et chefs :* transformer une recette que vous connaissez par cœur en une recette Cookwala ; réviser les
  phrases d'étape dans votre langue ; later, enregistrer des sessions consenties avec crédit.
- *Écoles :* utiliser les neuf recettes d'exemple comme cas d'enseignement ; ajouter les vôtres.

**Premier succès.** Cooks : `cookwala init`, écrire une recette avec une condition de fin pour chaque étape de chaleur, la valider. Farmers : envoyer une offre par SMS à un programme qui exécute le profil (aucun ne s'exécute encore ; le parser et les vecteurs existent).

**Flux.** Recette → validation → catalogue → dry run sur les appareils → les execution logs montrent comment il se comporte sur des machines réelles → révisions avec preuves.

**Comment cela fait progresser leur travail.** Une attribution qui voyage ; une recette qui peut être cuisinée par des machines dans d'autres pays ; pour les agriculteurs, un moyen de transformer un surplus en repas plutôt qu'en déchets.

**Comment cela fait progresser la société.** Patrimoine culinaire préservé comme savoir pratique, et non comme vidéo ;
moins de gaspillage à la ferme.

---

## 5. Humanitaire : ONG, food banks, cuisines communautaires, programmes de repas scolaires, agences de secours, donateurs

**Message.** Le Profil Humanitaire déplace le surplus alimentaire vers les assiettes avec des téléphones et des feuilles de calcul, enregistre les contrôles de la chaîne du froid, compte les repas et ne transporte **aucune donnée personnelle**. Il fonctionne sans robots, applications ou internet. Il vous donne des chiffres que vous pouvez défendre : kilogrammes sauvés, repas servis, taux de réussite nutritionnelle, coût par repas, délai de réclamation, incidents de sécurité, chacun avec sa méthode.

**Options.**
- *Light :* lire le profil et le protocole pilote ; essayer le parcours SMS.
- *Medium :* exécuter les modèles CSV sur un site pendant quatre semaines (niveau H0) et calculer un
  résumé d'impact.
- *Deep :* un pilote pré-enregistré de 12 semaines avec une ligne de base et un évaluateur indépendant ;
  adapter les rule packs à la loi nationale avec votre responsable de la sécurité alimentaire ; exécuter votre propre nœud de registry.

**Premier succès.** Remplissez les trois modèles CSV pour une journée, exécutez
`cookwala humanitarian --summary your-folder`, lisez l' `ImpactSummary` avec une méthode sous
chaque nombre.

**Flux.** Offre → demande → remise avec un contrôle de température → distribution → résumé d'impact → résultats publiés, quels qu'ils soient.

**Comment cela fait progresser leur travail.** Des chiffres comparables entre les sites ; des preuves pour les bailleurs de fonds ; des conclusions de sécurité avant, et non après, un problème ; un format que les systèmes des donateurs peuvent lire (mappages HXL, GS1, DHIS2).

**Comment cela fait progresser la société.** Plus de nourriture atteignant les gens en toute sécurité, avec leur dignité intacte :
pas de noms, pas de visages, pas de profilage.

---

## 6. Santé : diététiciens, responsables de la sécurité alimentaire, agences de santé publique, maisons de soins

**Message.** Règles de nutrition et de sécurité alimentaire sous forme de rule packs vérifiables par machine, dérivées des orientations publiques, appliquées aux menus et aux handovers, avec votre revue enregistrée par profession et par résultat. Rien ne constitue un conseil médical ; rien n'est affirmé au-delà de ce que les packs indiquent.

**Options.** Examiner un rule pack avec le template (deux heures) · adapter un rule pack aux règles nationales ·
proposer des règles de soin pour les personnes que vous servez · later, lire les résultats agrégés des programmes.

**Premier succès.** Ouvrez `profiles/humanitarian/care-vulnerable-groups.rulepack.json` et
le modèle de revue ; marquez trois règles comme approuvées, modifiées ou rejetées ; archivez la revue.

**Flux.** Draft pack → révision → status reviewed → les programmes adoptent → conclusions dans chaque distribution → résultats publiés avec méthodes.

**Comment cela fait progresser leur travail.** Vos conseils s'appliquent dans chaque cuisine qui l'adopte, y compris les cuisines robotisées, avec votre profession mentionnée ; une revue publiable ; un ensemble de données de résultats (agrégées, sans données personnelles) pour la recherche.

**Comment cela fait progresser la société.** Moins de sodium, de sucre et de graisses saturées dans les repas servis en masse ; un maintien au chaud et un refroidissement plus sûrs ; la prise en charge des enfants et des personnes âgées intégrée dans la machine.

---

## 7. Éducation : enseignants, éducateurs, professeurs, chercheurs, étudiants

**Message.** La cuisine est le processus le plus familier au monde, et Cookwala en fait un
objet d'enseignement : températures, unités, partage équitable, sécurité, machines qui suivent des règles. Pour
les chercheurs, c'est une référence, un format de jeu de données et une liste de problèmes ouverts.

**Options.**
- *Enseignants :* le kit de leçon (`docs/education/LESSON-KIT.md`) : cinq leçons allant de « qu'est-ce qu'un
  simmer » à « ce qu'une machine ne devrait jamais faire ».
- *Professeurs et étudiants :* la liste des sujets de recherche, les simulateurs, les vecteurs de
  conformance comme conditions de test, l'export LeRobot, des problèmes ouverts de taille de thèse.
- *Chercheurs :* publier des jeux de données d'executions consenties ; critiquer les
  assumptions des simulateurs ; proposer des vecteurs.

**Premier succès.** Enseignants : lancez le `dry run` du navigateur en classe et demandez pourquoi l'appareil a refusé. Étudiants : changez une `assumed` dans le simulateur de ville et expliquez le résultat.

**Flux.** Leçon → projet → jeu de données → article → RFC.

**Comment cela fait progresser leur travail.** Matériel gratuit, ouvert et citable ; un benchmark dont personne n'est propriétaire ; co-autorat sur le standard via les RFCs.

**Comment cela fait progresser la société.** Une génération qui sait ce qu'est une cuisine sûre et qui peut lire une fiche de sécurité.

---

## 8. Gouvernement : gouvernements, ministères, responsables municipaux, régulateurs, politiciens et législateurs, organismes de gouvernance et de normalisation

**Message.** Les machines de cuisson domestiques et commerciales arrivent sous des réglementations écrites séparément pour les appareils et les logiciels. Cookwala donne aux régulateurs quelque chose de concret à désigner : des limites de sécurité appliquées sur l'appareil, le refusal before heat, des enregistrements signés, le signalement d'incidents anonyme, et une suite de conformance que n'importe qui peut exécuter. Pour la sécurité des dons alimentaires, il fournit un standard de données sans données personnelles. Il est libre de redevances et se dirige vers une gouvernance neutre.

**Options.** Lisez la note d'orientation (`docs/policy/BRIEF.md`) · utilisez le langage modèle pour les données de don de nourriture et la sécurité des machines de cuisson · demandez à votre organisme de normalisation d'examiner Core 0.2 · exécutez un nœud de registry national · financez un projet pilote avec votre programme de repas scolaires.

**Premier succès.** Lisez le dossier de deux pages et vérifiez trois choses dans le repository : le safety limits pack, le conformance runner, les humanitarian data-protection rules.

**Flux.** Bref → examen par un organisme national de normalisation → référence dans les orientations → pilote →
système de certification.

**Comment cela fait progresser leur travail.** Une base technique prête à l'emploi et révisable ; des preuves issues de pilots ; un canal vers l'industrie via une norme neutre ; l'interopérabilité avec les standards de données humanitaires que vous utilisez déjà.

**Comment cela fait progresser la société.** Des machines plus sûres dans les foyers ; le sauvetage alimentaire qui protège les personnes qu'il sert ; moins de gaspillage dans les villes.

---

## 9. Capital : investisseurs, entrepreneurs, philanthropies, banques de développement

**Message.** La cuisine est sur le point de devenir une infrastructure. La norme est gratuite ; les services qui l'entourent sont une activité commerciale : certification, logiciel de hub, jeux de données consentis, opérations de registry, pilotes. La couche humanitaire est un bien public que les bailleurs de fonds au développement peuvent soutenir par une évaluation pré-enregistrée. Aucune promesse financière n'est faite où que ce soit sur ce site.

**Options.** Lisez l'opportunité, le modèle économique, la feuille de route, les risques et la gouvernance
(`/investors`) · financez un pilote ou une revue · soutenez une entreprise qui vend des services à côté du
standard gratuit · rejoignez la gouvernance en tant qu'observateur financeur.

**Premier succès.** Lisez les sections problème, architecture et risques du whitepaper ainsi que le registre des préoccupations du plan d'action ; chaque risque ouvert est répertorié.

**Flux.** Preuves (pilotes, conformance, adoptants) → jalons dans le plan d'action → financement lié aux jalons → fondation neutre pour la norme, une entreprise pour les services.

**Comment cela fait progresser leur travail.** Position précoce dans une norme définissant une catégorie avec des chiffres honnêtes ; une entreprise de services investissable séparée du bien public.

**Comment cela fait progresser la société.** Le capital va à ce qui est measured, pas à ce qui est affirmé.

---

## 10. Pensée : philosophes, éthiciens, historiens et futuristes

**Message.** Lorsqu'une machine cuisine la recette d'une grand-mère, à qui appartient le savoir ? Que signifie la dignité dans les soins automatisés ? Que peut savoir le robot d'un ménage, et qui d'autre peut le savoir ? Cookwala a fait des choix concernant ces questions dans le code ; les essais (`docs/essays/`) indiquent quels étaient ces choix et invitent au désaccord.

**Options.** Lire les essais · écrire une réponse · proposer une règle (un RFC est un argument philosophique avec un schéma) · siéger au comité d'éthique du profil de household context.

**Premier succès.** Lisez l'essai sur les données de household et les règles de voyage du facet registry ;
trouvez une facet dont vous changeriez la valeur par défaut, et dites pourquoi.

**Flux.** Essai → commentaire public → RFC → défaut modifié.

**Comment cela fait progresser leur travail.** Un cas réel où les positions éthiques deviennent des règles actives,
avec un registre public de l'argumentation.

**Comment cela fait progresser la société.** Des décisions concernant les données intimes et l'héritage culturel prises en
public avant que les machines n'arrivent dans des millions de foyers.

---

## 11. Tout le monde : les personnes qui se soucient de la nourriture, du gaspillage, de l'emploi, du climat et de l'avenir

**Message.** Cookwala est un moyen d'écrire une recette pour que n'importe qui, ou n'importe quoi, puisse la cuisiner en toute sécurité, et un moyen pour que la nourriture qui serait jetée atteigne quelqu'un qui en a besoin. C'est gratuit, cela n'appartient à aucune entreprise, et cela dit ce qu'il ne sait pas.

**Options.** Essayez le dry run · jouez à un simulateur · lisez les recettes · écrivez une recette que vous aimez · suivez la roadmap · parlez-en à un food bank ou à une école.

**Premier succès.** Changez l'appareil dans le dry run et observez une étape être refusée ; lisez pourquoi.

**Flux.** Curiosité → une recette → une conversation avec une cuisine qui pourrait l'utiliser.

**Comment cela fait progresser leur vie.** Des machines plus sûres dans le foyer, leurs propres recettes préservées, un moyen d'aider sans donner d'argent.

**Comment cela fait progresser la société.** Moins de gaspillage, une alimentation plus sûre, des machines qui servent les personnes qui ne peuvent pas cuisiner pour elles-mêmes, et du temps humain restitué.

---

## 12. Emplois et dignité, dit simplement

Les machines de cuisson changeront le travail. Les positions de Cookwala : les humains peuvent toujours cuisiner ; les premières utilisations sont pour les personnes qui ne peuvent pas cuisiner pour elles-mêmes et pour les cuisines communautaires qui manquent de bras ; le nom d'un cuisinier reste sur une recette partout où elle est cuisinée ; une voix du travail a un siège au comité de direction ; de nouveaux rôles (ingénieurs de recettes, techniciens en robotique alimentaire, certifiers, réviseurs de rule-pack) sont nommés sans promettre de nombres.

## 13. Où chaque groupe se situe sur le site

| Groupe | Page |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

