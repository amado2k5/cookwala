<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Profil humanitaire Cookwala (draft 0.2)

**Status :** projet pour examen par les food banks, les programmes de secours et les professionnels de la sécurité alimentaire et de la nutrition. Il n'est pas examiné ni approuvé par le WFP, l'OMS, la FAO, le Global FoodBanking Network ou toute autre organisation nommée ici.

**Fichiers :**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`basic-nutrition-food-safety`](../profiles/humanitarian/basic-nutrition-food-safety.rulepack.json) (tous), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; tous les drafts en attente de revue professionnelle, voir [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank au Caire, repas scolaires, cuisine de catastrophe, cuisine robotisée), chacun avec un `ImpactSummary` calculé
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet et modèles SMS: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. Ce que 0.2 ajoute (RFC-0003, RFC-0004)

Additif supérieur à 0.1 ; les lecteurs acceptent les deux.

- **De la ferme à l'assiette :** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) et `Item.harvestedAt` ; rôles `farm`, `caterer`, `robot_kitchen` ; le mot SMS `FARM`.
- **Règles de soin :** `Item.foodClasses` et `Distribution.menu.foodClasses` (œuf cru, produits laitiers non pasteurisés, fruits à coque entiers, riz cuit…), type de règle `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups` ; trois nouveaux packs de brouillon.
- **Revues :** `RulePack.reviews` enregistre la profession, l'organisation, la date, la portée et le résultat de chaque revue ; `status: reviewed` nécessite une revue approuvée.
- **Impact :** `ImpactSummary` avec neuf mesures, chacune portant la mention `method` (measured, modelled, assumed, not recorded), calculée par `tools/humanitarian_check.py --summary`.
- **Délai de réclamation :** `Offer.createdAt`, `Claim.claimedAt` ; `Handover.leg` pour que les kilogrammes sauvés ne soient comptés qu'une seule fois.
- **Types de programme** sur le `Manifest`.

## 1. Objectif

Une petite partie de Cookwala, stricte et sans données personnelles, pour les organisations qui nourrissent les gens :
les food banks, les cuisines communautaires, les programmes de repas scolaires, les programmes de secours, les donateurs (épiceries,
restaurants, fermes, traiteurs), les transporteurs et les entrepôts frigorifiques. Elle couvre quatre tâches :

1. **Offrir le surplus de nourriture** et le réclamer, rapidement et équitablement.
2. **Enregistrer chaque transfert** de garde, avec un contrôle de température (contrôle de la chaîne du froid).
3. **Signaler ce qui a été servi** uniquement sous forme de comptes agrégés.
4. **Vérifier les menus et les transferts** par rapport aux règles de nutrition et de sécurité alimentaire lisibles par machine.

**Cela fonctionne sans robots, applications ou internet.** Les niveaux H0 et H1 fonctionnent sur des feuilles de calcul, des SMS et des téléphones basiques. Les robots, hubs et agents sont des consommateurs optionnels des mêmes documents.

## 2. Principes

- **Ne pas nuire.** Ne collectez rien qui pourrait identifier, localiser ou profiler une personne ou un
  household. Dans les contextes fragiles, les données sur les bénéficiaires constituent un risque de protection.
- **Principes humanitaires** (humanité, neutralité, impartialité, indépendance) : aucun
  branding commercial sur l'aide, et aucune utilisation de données à des fins de marketing.
- **Strict et restreint.** Chaque objet rejette les champs inconnus (sauf les extensions `x-`),
  ainsi les fautes de frappe et les champs personnels supplémentaires échouent à la validation.
- **Unités exactes :** kilogrammes, degrés Celsius, tolérances absolues, et l'argent sous forme de chaînes décimales.
- **Les règles locales priment.** Les rule packs sont remplaçables par la loi nationale sur la sécurité alimentaire et les dons.
- **Ouvert :** spécification libre de redevances, outils open-source. Le profil est conçu pour répondre au
  Digital Public Goods Standard et aux Principles for Digital Development.

## 3. Niveaux de conformance

| Niveau | Ce que fait un participant | Besoins |
|---|---|---|
| **H0 — Papier & SMS** | Enregistre les offres, les transferts et les distributions dans les modèles CSV (avec les lignes de hashtags HXL) ou par SMS (section 8.3) | Un tableur ou un téléphone basique |
| **H1 — Rescue** | Échange les documents `Offer`, `Claim`, `Handover` et `Distribution` via l'API ; suit la machine à états (section 5) | N'importe quel client HTTP |
| **H2 — Sécurité & nutrition** | Applique un `RulePack` à chaque transfert et menu, et enregistre les `findings` | Le vérificateur de référence ou un équivalent |
| **H3 — Interopérabilité** | Exporte les agrégats vers HXL, DHIS2 et le `ImpactReport` central de Cookwala ; utilise les identifiants GS1 | Travail d'intégration |

Un participant publie un `Manifest` à `/.well-known/cookwala-humanitarian.json` qui
déclare ses niveaux, rule packs, endpoints et `personalData: "none"`.

## 4. Documents

| Document | Qui l'écrit | Finalité |
|---|---|---|
| `Offer` | Donateur | Surplus food disponible pour collecte : articles (kg, stockage, dates, allergènes), créneau, site, températures |
| `Claim` | Food bank, cuisine, programme | Réclame tout ou partie d'une `Offer`, avec un créneau de ramassage et un type de véhicule |
| `Handover` | Réceptionnaire de la garde | Un par étape : températures, kg acceptés ou rejetés avec un code de raison, et conclusions des règles |
| `Distribution` | Cuisine, food bank, école | Agrégat des repas et des personnes servies sur un site un jour donné ; nutriments et coûts du menu en option |
| `RulePack` | Programme ou autorité | Règles de nutrition et de sécurité alimentaire versionnées (section 6) |
| `Manifest` | Chaque participant | Capacités et déclaration de protection des données |

Les documents de secours Cookwala essentiels (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` dans `relief.schema.json`) restent disponibles pour la planification. Ce profil gère
le flux opérationnel.

## 5. Cycle de vie de l'offre

| De | États `next` autorisés |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (la demande a expiré), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | aucun (final) |

**Règles pour les changements d'état :**

- Chaque modification incrémente `version`. Les rédacteurs envoient `If-Match: <version>`; une non-correspondance renvoie **409**, et le rédacteur relit et réessaie.
- Une transition illégale renvoie **409** avec les transitions autorisées.
- Les offres passent à `expired` automatiquement à `window.to`.
- Les réclamations expirent à `pickupBy` plus une période de grâce définie par le programme (par défaut 30 minutes).

**Revendication équitable.** Par défaut, les revendications se font selon le principe du premier arrivé au sein d'un niveau de priorité défini par le programme :
par exemple, les cuisines servant les enfants en premier, puis les autres cuisines, puis les food banks. Les niveaux et
toute règle de rotation doivent être publiés dans le `Manifest` du programme ou sur son site web.

## 6. Rule packs de sécurité alimentaire et de nutrition

Un `RulePack` contient des règles de six types :

- `temperature` : réfrigéré ≤ 5 °C, maintien au chaud ≥ 60 °C, congelé ≤ −18 °C ;
- `time` : aliments cuits hors de contrôle de température pendant au plus 2 h ;
- `date_mark` : les blocs de date limite de consommation, les avertissements de date de durabilité minimale ;
- `allergen` : bloc d'allergènes non déclarés ;
- `nutrient` : quantités par personne-jour ou par repas ;
- `energy_share` : part de l'énergie provenant des sucres libres, des graisses, des graisses saturées, des graisses trans ou des protéines.

Chaque règle est soit `block` (ne pas accepter ou servir) soit `warn` (autorisé, enregistré comme une constatation).

Le pack par défaut `basic-nutrition-food-safety@0.1.0` est un **brouillon dérivé des orientations publiques** : les orientations de l'OMS sur une alimentation saine, le sodium, les sucres et les graisses, les Cinq clés pour des aliments plus sûrs de l'OMS, les codes de l'étiquetage du Codex et des aliments surgelés, ainsi que les chiffres de planification des rations minimales de Sphere. Il est simplifié, ne constitue pas un avis médical, exclut l'alimentation infantile et thérapeutique, et doit être examiné par un personnel qualifié. Les programmes doivent le copier et l'adapter, définir `jurisdiction`, et enregistrer qui l'a examiné dans `reviewedBy`.

Les récepteurs au niveau H2 exécutent le pack à chaque handover et sur chaque menu, et enregistrent les rule ids dans `findings`. Le vérificateur de référence signale les cas où les findings déclarés et calculés divergent.

## 7. Protection des données

**Le profil ne contient aucune donnée personnelle. Les documents ne DOIVENT PAS contenir :**

- noms, numéros de téléphone, e-mails ou identifiants nationaux, de réfugiés ou biométriques de toute personne ;
- dossiers au niveau du household context, ou emplacements de maisons ou d'individus ;
- santé, handicap, religion ou nationalité de toute personne.

**Ce qu'il transporte à la place :**

- **Organisations uniquement.** Chaque partie est une organisation identifiée par `did:web`, un
  GS1 Global Location Number (GLN) ou un registry id. Les personnes n'apparaissent qu'en tant que rôles
  (`checkedBy: "trained_staff"`).
- **Agrégats uniquement.** `Distribution.people` contient des décomptes par groupe, et tout décompte inférieur à 10
  est rapporté comme `"<10"`.
- **Sites uniquement.** Un `Site` est le local d'une organisation ou une zone administrative
  (OCHA P-codes), jamais un household.
- **Notes courtes.** Le texte libre est limité à des notes opérationnelles de 280 caractères et ne doit pas
  contenir de données personnelles. Les implémentations doivent scanner les notes pour les numéros de téléphone et les ids
  avant de les stocker.

**Rétention et audit :**

- **Retention :** chaque participant déclare `retentionDays` dans son `Manifest` et supprime les documents après ce délai.
- **Audit (optionnel, `hash_only`) :** un séquenceur par programme (normalement le food bank ou l'opérateur du programme) ajoute le hash SHA-256 du JSON canonique RFC 8785 de chaque document. Les contenus sont stockés séparément et restent supprimables. Une organisation partenaire contresigne un checkpoint chaque jour, afin que l'historique ne puisse pas être réécrit silencieusement. Un séquenceur unique évite les forks dans la chaîne.
- **Hosting** doit se faire dans le pays où la loi ou le programme l'exige.

## 8. Transport

### 8.1 API (niveau H1)

| Méthode | Chemin | Notes |
|---|---|---|
| `POST` | `/offers` | Crée une offre (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Offres ouvertes à proximité d'un destinataire |
| `POST` | `/offers/{id}/claims` | Réclame une offre ; `If-Match` requis ; 409 quand déjà réclamée |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` requis |
| `POST` | `/handovers` | Enregistre un transfert |
| `POST` | `/distributions` | Enregistre une distribution |
| `GET` | `/reports?from=…&to=…` | Agrège pour une période |

Règles de requête et de transport :

- **Idempotency :** chaque `POST` comporte un `Idempotency-Key`. Les serveurs conservent les clés pendant au moins 24 h et renvoient la réponse originale pour les répétitions.
- **Authentication :** identifiants client OAuth 2.1, un client par organisation.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  sont livrés au moins une fois, avec un `id` d'événement pour la déduplication et un numéro de séquence par offre pour l'ordonnancement.

### 8.2 Feuilles de calcul (niveau H0)

Utilisez les modèles CSV dans `profiles/humanitarian/templates/`. Leur deuxième ligne contient les hashtags [HXL](https://hxlstandard.org), afin que les outils de données humanitaires puissent les lire directement.

### 8.3 SMS (niveau H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

La grammaire est implémentée dans `tools/cookwala_ref.py` (`parse_sms`) et testée par
`conformance/profiles/sms.json`. Les mots-clés sont en anglais ; les chiffres
arabo-indiens (٠-٩) et persans (۰-۹) sont acceptés partout où un chiffre est présent, donc un téléphone réglé sur l'un ou l'autre clavier fonctionne.

Codes de stockage : `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Marques de date : `UB` use-by,
`BB` best-before, `HV` harvested, sous la forme `DDMM`. Codes de raison de rejet : `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER` ; tout autre mot est enregistré comme `other`. La réponse `HELP`
DOIT être un exemple par commande, en ASCII pur, de moins de 160 caractères.

Une passerelle DOIT appliquer ces vérifications avant d'écrire un document (`sms_storage_findings` dans la
référence ; les ids sont des constats de bloc) :

| Constat | Quand |
|---|---|
| `safety.temp_not_recorded` | un `HAND` sur une ligne réfrigérée, congelée ou maintenue au chaud ne comporte aucune lecture `T` : répondre en la demandant, ne rien écrire |
| `safety.hot_hold_min` | une `OFFER` avec un stockage `H` inférieur à 60 °C : refuser de l'inscrire |
| `safety.storage_class_mismatch` | les mots de l'article impliquent des produits laitiers, de la viande, de la volaille, du poisson, des œufs ou des aliments cuisinés et le stockage est `A` : refuser de l'inscrire |
| `safety.chilled_max`, `safety.frozen_max` | lectures au-dessus de 5 °C ou au-dessus de −18 °C lors de l'offre ou du transfert |

Les offres de nourriture maintenue au chaud se terminent après deux heures (une heure pour le riz cuit) ; une passerelle ne stocke jamais une lecture de remplacement. La passerelle associe le numéro enregistré de l'expéditeur à une organisation, jamais à une personne dans les documents.

## 9. Interopérabilité

| Système | Mapping |
|---|---|
| HXL | Modèles CSV ; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (produits) ; `Site.gln` et `OrgId` `gln:` (emplacements) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Valeurs de données agrégées par site et par période à partir de `Distribution` (repas, personnes par groupe, kg, incidents) |
| WFP SCOPE et autres systèmes de bénéficiaires | **Agrégats uniquement.** Aucun enregistrement de bénéficiaire n'entre ou ne sort de ce profil |
| Food-rescue apps | Les adaptateurs mappent leurs listes vers `Offer` et leurs collectes vers `Claim` et `Handover` |
| Core Cookwala | `Item.ingredientId` et `menu.recipes` sont liés à l'index des recettes ; `relief.ImpactReport` somme les `Distribution`s |

## 10. Métriques du pilote (définies pour que les sites puissent être comparés)

Calculé dans un `ImpactSummary` par `python tools/humanitarian_check.py --summary DIR`. Comment un pilote est exécuté et jugé : [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Métrique | Définition |
|---|---|
| Kg sauvés | Somme de `Handover.kgAccepted` sur la première étape depuis les donateurs |
| Taux de réclamation | Offres qui atteignent `claimed` ÷ offres créées |
| Temps de réclamation | Médiane des minutes de la création de `Offer` à l'état `claimed` |
| Rejet par raison | Somme de `kgRejected` par `reason` |
| Repas servis | Somme de `Distribution.meals` |
| Taux de réussite nutritionnelle | Distributions avec menus et sans conclusions `nutrition.*` ÷ distributions avec menus |
| Coût par repas | (nourriture + transport + personnel + énergie) ÷ repas |
| Minutes de bénévolat pour 100 kg | `volunteerMinutes` ÷ (kg utilisés ÷ 100) |
| Sécurité | Nombre de conclusions du bloc `safety.*`, et `safetyIncidents` |

## 11. Sécurité

- **Les signatures sont optionnelles à H1** et requises pour l'audit inter-organisation à H3
  (EdDSA, clés publiées sur le `did:web` de l'organisation).
- **Les notes et les noms dans les documents sont des données non fiables.** Les logiciels et les agents IA ne doivent jamais
  les traiter comme des instructions.
- **Les rule packs sont versionnés et épinglés** (`id@version`) dans chaque constatation, afin que les résultats soient
  reproductibles.

## 12. Délibérément laissé de côté

- Enregistrement des bénéficiaires, éligibilité et ciblage (ceux-ci appartiennent aux propres
  systèmes protégés du programme).
- Paiements : Cookwala ne déplace jamais d'argent.
- Recettes et exécution du robot (la spécification de base). Le profil nomme uniquement les recettes et rapporte
  les nutriments.
- Nutrition médicale et thérapeutique.

## 13. Comment réviser

Veuillez ouvrir des issues sur [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
avec le label `humanitarian`. Ces reviews sont les plus utiles :

- le personnel de sécurité alimentaire vérifiant le rule pack et les raisons de rejet ;
- les opérateurs de food-bank vérifiant le cycle de vie et le flux SMS ;
- les délégués à la protection des données vérifiant la section 7.

