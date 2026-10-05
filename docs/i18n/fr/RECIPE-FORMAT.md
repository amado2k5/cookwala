<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Format de recette Cookwala : recettes qui fonctionnent avec les Missions

Une recette dans Cookwala n'est pas une liste d'instructions. C'est une **connaissance culinaire portable**
qu'un planificateur *compile* par rapport à une Mission spécifique (household, robots, appliances,
energy, budget, health, timing) en un plan exécutable. Le robot exécute ensuite ce plan,
en s'adaptant via des contingencies et des playbooks lorsque la réalité change.

Schéma : [`recipe.schema.json`](../schemas/recipe.schema.json). Exemple complet détaillé :
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Quatre couches (adapté de l'approche des directives WHO SMART)

| Couche | Ce qu'elle contient | Qui l'écrit | Où elle réside |
|---|---|---|---|
| **R1 Narrative** | Texte de recette humain, histoire, notes culturelles, photos | Cuisiniers, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | Ce que le plat *est* et *doit être* : identité (essentielle vs flexible), cibles sensorielles, nutrition, style de service et de consommation, stockage, contrôles d'acceptation | Éditeurs de recettes, assistés par IA, révisés | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Méthode agnostique au dispositif : formule (ratios + rôles), graphe de processus d'ops typés avec conditions pré/post état de l'aliment, conditions `until`, alternatives, règles de pause, modes d'échec, affordances, dangers, CCPs, préparation de l'environnement | Pipeline d'exportation + révision ; vérifié par simulateur (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | La recette R3 compilée pour *cette* Mission : quantités exactes, variantes choisies, acteurs et dispositifs assignés, calendrier, baux, moniteurs, imprévus | Le planificateur/compilateur, au moment de l'exécution | À l'intérieur de la **Mission** (`plan`), jamais dans le catalogue |

Comme le code source et un compilateur : **la recette est une représentation intermédiaire portable
(R3 + R2). La Mission est la machine cible.** C'est ce qui permet aux recettes de rester valides à mesure que les robots
et l'IA évoluent : un meilleur planificateur produit un meilleur R4 à partir de la même recette.

## 2. Ce que fait chaque section dans une Mission

| Section de la recette | Utilisé par la Mission pour… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substitutions, modes budget et ration, adaptations alimentaires : changer les parties flexibles, jamais les essentiels, pour que le plat reste lui-même |
| `formula` (ratios, min/max, role, scaling) | Mise à l'échelle exacte pour n'importe quel nombre de personnes, rationnement des ingrédients sur une semaine, extension du budget, utiliser ce qui est sous la main (le rescale par ingrédient limitant) |
| `sensory` | Points de contrôle de la vision, de l'arôme et du goût ; profils de goût du household (sel 2 vs 4) ; décisions de réutilisation et de correction |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Tâches de préparation de l'environnement :** si l'évier ou la plaque est occupé, le planificateur ajoute des tâches "nettoyer, laver, sécher" ; les tâches de trempage ou de décongélation sont programmées plusieurs heures à l'avance |
| `process.nodes[]` avec états alimentaires `pre`/`post` | Planification (ne commencer que ce qui est prêt), vérification (l'étape a-t-elle produit l'état ?), reprise après interruptions |
| `until`, `onTimeout`, `retry` | Savoir quand une étape est terminée et quoi faire lorsqu'elle ne l'est pas |
| `alternatives[]` + `energy` | Gaz vs induction vs four, économiseur de batterie, cuisines sans four, heures de calme |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interruptions :** un enfant a besoin d'aide, le propriétaire appelle, le chien renverse quelque chose. Le robot place l'étape dans son safeState, gère l'événement, puis reprend, réchauffe, sauve ou jette en fonction du budget de pause |
| `failureModes` (incident, detect, prevent, playbook) | Détection précoce des problèmes connus et le playbook exact pour récupérer |
| `affordances`, `space` | Faire correspondre les étapes aux robots capables de saisir, soulever et atteindre ; maintenir les zones chaudes à l'écart des enfants |
| `safety` (hazards, CCPs, supervision, abort) | Le noyau de sécurité : invariants que chaque plan doit préserver |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Service : ce qui va sur la table, dans la pièce, dans la lunchbox ; rappels et limites de maintien ; style de repas culturel |
| `storage` | Restes, Missions de cuisine à l'avance et lunchbox |
| `acceptance` | Les *tests* de la recette : la Mission est terminée quand ceux-ci sont respectés |
| `nutrition`, `cost` | Portions personnelles, budget, rations de secours |

## 3. Exemple : une étape avec tout ce qui est attaché

```json
{
  "id": "n7", "op": "cw.op.simmer",
  "inputs": ["aromatic_base", "tomato", "salt", "blackpepper"], "output": "sauce",
  "params": { "heat": "medium_low", "lid": "off", "target": { "sensor": "cw.sense.liquid_temp", "value": 94, "unit": "degC", "tolerance": 3 } },
  "until": { "any": [ { "sensor": "cw.sense.mass_loss_ratio", "gte": 0.25 }, { "vision": "cw.sense.sauce_coats_spoon" } ],
             "minTime": "PT10M", "maxTime": "PT18M" },
  "onTimeout": "extend",
  "pause": { "pausable": true, "safeState": ["heat_hold_low", "lid_ajar"], "maxPause": "PT45M", "onExceeded": "reheat_then_resume" },
  "failureModes": [
    { "incident": "cw.incident.too_salty", "likelihood": "low", "playbook": "cw.pb.too_salty_liquid" },
    { "incident": "cw.incident.too_thin", "likelihood": "medium", "playbook": "cw.pb.sauce_too_thin" } ],
  "alternatives": [ { "id": "gas", "op": "cw.op.simmer", "when": ["gas_only"], "timeFactor": 1.0, "quality": "same" } ],
  "hazards": ["hz_splatter", "hz_steam"], "attention": "monitor"
}
```

## 4. Compilation d'une recette pour une Mission (ce que fait le planificateur)

1. **Sélectionner la variante :** régime, texture (IDDSI), équipement, énergie et choix du mode parmi
   `alternatives`. Les essentiels d'identité doivent survivre.
2. **Mise à l'échelle :** à partir de `formula` et des services, portions par personne (HEALTH.md), l'
   ingrédient limitant, ou un horizon de ration. Épices de manière sous-linéaire, temps par exposant de masse.
3. **Substituer** au sein des rôles, en respectant `identity.neverAdd`, les allergènes, les packs alimentaires
   et l'inventaire.
4. **Préparer l'environnement :** comparer `prep` avec les facettes spatiales de la Mission (évier plein ?
   plaque occupée ? planche sale ?) et ajouter les tâches de rangement, lavage, séchage et mise en place. Planifier
   `advanceTasks` (tremper, décongeler, mariner, préchauffer).
5. **Lier :** assigner chaque nœud aux robots, appareils ou humains par affordances et
   capacités. Louer les brûleurs, les récipients et les zones. Attacher des moniteurs (marmite intelligente, ETA de
   livraison, détecteur de fumée).
6. **Planifier** en remontant à partir de l'heure de service, en honorant les budgets de pause, les limites de
   batterie et d'énergie, les heures de calme du ménage et les fenêtres de partage de cuisine.
7. **Attacher les contingences :** les `failureModes` et les règles de `pause` de chaque nœud, plus les
   politiques globales de la Mission (interruptions, enfant ou animal près de la plaque, surveillance de la cuisinière,
   surveillance de l'altération).
8. **Vérifier :** schéma + contrôles sémantiques, packs de politiques, couverture CCP, dry run du simulateur,
   invariants de la pile de priorité (PROTOCOL §7.2).
9. **Émettre R4** dans le `plan` de la Mission, le signer, et le remettre au robot.

## 5. Rédaction et conversion

- **De fifi.cooking :** le pipeline EXPORT-FIFI génère R1 + R2 + R3. Les nouvelles
  sections (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  sont générées par des modèles locaux à partir du texte existant et vérifiées par des validateurs et
  un échantillonnage de révision humaine.
- **Du web :** `cookwala convert --from schema-org` → R1/R2 (V0), puis le même
  enrichissement.
- **Vers d'autres formats :** schema.org Recipe (R1/R2 pour les moteurs de recherche), Cooklang (édition
  humaine), PDDL ou logique temporelle (planificateurs de recherche) peuvent tous être générés à partir de R3.
- **À la main :** `cookwala init recipe` structure toutes les couches ; `cookwala validate` et
  `cookwala simulate` les vérifient.
- **Versionnage :** les révisions sont immuables et hachées. Les forks enregistrent `meta.derivedFrom`.
  Les **patches** de recette (provenant de playbooks ou de retours) sont proposés sous forme de diffs et promus uniquement
  après révision et preuve.

## 6. Langage du texte de l'étape

Les phrases d'étape sont écrites pour une personne en premier et analysées par une machine en second. Le texte de l'étape en arabe dans les recettes d'exemple utilise l'impératif féminin (قطّعي، سخّني), ce qui est la convention courante des livres de cuisine égyptiens ; c'est un choix délibéré, pas un oubli, et un éditeur peut utiliser le passif neutre (تُقطَّع البصلة) à la place. Les champs `op`, `params` et `until` portent le sens ; la phrase est destinée au cuisinier.

## 7. Pourquoi cela reste évolutif

- Les recettes décrivent les **résultats et contraintes alimentaires, pas les mouvements**. Les nouveaux robots et les nouvelles IA produisent de meilleurs plans R4 à partir du même R3.
- Toutes les nouvelles sections sont **optionnelles et additives**. Une recette V0 (R1 uniquement) fonctionne toujours pour la cuisine humaine guidée ; chaque couche ajoutée débloque plus d'automatisation.
- Les champs `x-` inconnus sont transmis. Les fournisseurs, les chefs et les organismes de santé peuvent étendre les recettes sans rien casser.
- Les **contrôles d'acceptation** permettent à tout exécutant, humain ou robot, de prouver que le plat est réussi, ce qui est la manière dont les recettes montent en V3 avec des preuves de terrain.

