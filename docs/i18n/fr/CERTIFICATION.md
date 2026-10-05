<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance et le chemin vers la certification

**Status:** draft, 2026-10-04 (RFC-0008). Aucun certificateur n'a encore été engagé ; c'est la voie
que propose la norme.

## 1. Trois étapes

| Étape | Qui | Ce que cela signifie | Affiché sous forme de |
|---|---|---|---|
| **Auto-déclaré** | Le fabricant ou l'éditeur | A exécuté les vecteurs publics avec l'outil public et a publié un `ConformanceReport` (`schemas/conformance.schema.json`), signé avec sa propre clé | le rapport, avec les suites et les décomptes ; jamais un badge |
| **Vérifié** | Un opérateur de registry | A reproduit l'exécution par rapport au même hash de l'ensemble de vecteurs et a contresigné le rapport | le rapport plus le vérificateur |
| **Certifié** | Un certificateur indépendant (aucun n'existe aujourd'hui) | A exécuté la suite plus les vérifications matérielles et de safety-case sous un schéma publié et a accordé la marque | le rapport, le certificateur, la marque |

Un rapport qui échoue à n'importe quel vecteur d'une classe ne peut pas revendiquer cette classe. Le registry montre des rapports, pas des badges.

Aujourd'hui, le seul opérateur de registry est le mainteneur de la spécification (cookwala.ai), donc « verified » n'ajoute aucune indépendance tant qu'un second registry n'existe pas ; le statut est toujours affiché comme une auto-vérification.

## 2. Ce qu'un rapport contient

Version de base, la classe revendiquée (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) ou une revendication de profil (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), le sujet (produit, vendeur, version), les suites exécutées avec les totaux et les
identifiants de vecteurs en échec, le hash de l'ensemble de vecteurs, l'outil et le commit, la date, le statut et le
vérificateur. Exemple : `examples/conformance/report-reference.json`, produit par

```bash
python tools/run_conformance.py --report report.json
```

## 3. Classes et ce qu'elles prouvent

| Classe | Vecteurs | Également nécessaire pour la certification (non couvert par les vecteurs) |
|---|---|---|
| Éditeur de recettes | hash, envelope (cibles à l'intérieur des bandes), units | revue du contenu des recettes par un professionnel de la sécurité alimentaire |
| Exécuteur | envelope, sensor ladder, transitions d'exécution, raisons de refusal before heat | le propre cas de sécurité de l'appareil (ISO 13482, IEC 60335, UL 3300 selon le cas) ; latence d'arrêt locale measured ; limites de sécurité appliquées sans réseau |
| Catalogue | hash, signature, révocation de clé, recalls | garde des clés et processus de réception des incidents |
| Agent | texte non fiable, portée du mandate (agent-safety benchmark) | résultats publiés par modèle avec méthode |
| Vérificateur | toutes les suites Core | aucune |
| Humanitaire H0–H3 | grammaire SMS, machine à états, rule packs | revue de la responsabilité des données ; aucun audit des données personnelles |
| Household | politique de divulgation | analyse d'impact sur la protection des données |
| Registry | règles de nom et de version, tombstones | processus de preuve d'espace de noms |

## 4. Ce que la certification ne peut pas promettre

Un rapport de conformance prouve que le logiciel s'est comporté comme les vecteurs l'exigent le jour où il a été exécuté.
Il ne prouve pas qu'un appareil est sûr dans chaque cuisine, qu'une recette a bon goût, ou qu'aucun dommage ne peut survenir. Une norme qui promettait zéro dommage serait malhonnête ; celle-ci promet que les limites sont appliquées localement, que les refus arrivent before heat, et que les enregistrements peuvent être vérifiés.

## 5. Gouvernance de la marque

La marque de certification et ses règles passent à la fondation neutre avec la marque déposée (`GOVERNANCE.md`). D'ici là, aucune marque n'existe ; seuls les rapports existent.

