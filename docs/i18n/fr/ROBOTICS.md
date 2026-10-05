<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala et la pile robotique

Cookwala ne remplace aucune partie d'un robot. Il ajoute la couche qui manque à la pile robotique pour la cuisine : **quoi préparer, quand chaque étape est terminée, et ce qui ne doit jamais arriver**, sous une forme que n'importe quel robot, appareil, simulateur ou pipeline d'apprentissage peut lire et vérifier.

## Où cela s'insère

| Couche | Exemples de la couche (2026 ; aucune intégration avec l'un d'entre eux n'existe) | Ce que Cookwala ajoute |
|---|---|---|
| Robots et appareils | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, robots de cuisine (Moley, Miso, Chef Robotics), fours intelligents | Une recette indépendante du dispositif qu'il peut dry-run, refuser ou cuisiner ; limites de sécurité sur l'appareil |
| Middleware | ROS 2, ros-controls, Open-RMF (flottes), Matter (appareils) | Actions ROS 2 pour les recettes et les étapes (`bindings/ros2`) ; un projet de mapping d'op Matter (`bindings/matter.json`, non vérifié) ; une tâche Open-RMF est une contribution planifiée |
| Apprentissage robotique | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | Tâches par étapes en langage naturel et segments d'étapes pour les jeux de données ; critères de "done" comme cibles d'évaluation |
| Simulation | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes et vecteurs de conformance comme conditions de test |
| Agents IA | MCP, A2A, Claude, OpenAI et modèles ouverts | AgentMandate, règle untrusted-text, benchmark de sécurité des agents de cuisine |

Cookwala est délibérément **au-dessus du mouvement**. Les robots modernes apprennent la manipulation de bout en bout ;
Cookwala leur donne la tâche, le test de réussite et l'enveloppe de sécurité, et reçoit en retour un
execution log.

## ROS 2

`bindings/ros2/` définit deux actions :

| Action | But | Feedback | Résultat |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | État final, raison de refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Un nœud de recette, son operation envelope, une cible optionnelle plus étroite | Progrès, medium temperature, cible atteinte | Envelope OK, rung utilisée, résumé de l'étape, déviation |

**Annuler** un objectif `ExecuteRecipe` est une `StopRequest` : le serveur doit s'arrêter en toute sécurité.
Les **limites de sécurité** restent à l'intérieur de l'appareil ; aucun champ d'objectif ne peut les modifier. Un hub qui répartit une recette sur plusieurs robots envoie des objectifs `ExecuteNode`, et peut confier la répartition au niveau de la flotte à **Open-RMF** sous forme de tâches.

## LeRobot et les jeux de données de robot-learning

La boucle de LeRobot est teleoperate → record → train → deploy, et son LeRobotDataset v2.1 stocke les
tâches en langage naturel dans `meta/tasks.jsonl` (v3 a déplacé les métadonnées vers parquet ; l'exportateur écrit le
fichier de style v2.1 aujourd'hui et un écrivain v3 est next). Les recettes Cookwala contiennent déjà une phrase
par étape, et les execution logs enregistrent quand chaque étape a commencé et s'est terminée.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Ceci écrit :
- `meta/tasks.jsonl`, une tâche par étape de recette ;
- `meta/cookwala/<log>.json` avec le hash de la recette, les segments d'étape (début et fin en secondes,
  échelon de la sensor ladder, résultat de l'operation envelope) et le consentement du household.

La vidéo et les actions proviennent de l'enregistreur propre du robot. L'exportation refuse les logs sans le consentement du dataset.

## Simulation

Les vecteurs de conformance dans `conformance/envelope.json` (traces de température avec résultats attendus) et les règles de la sensor-ladder sont prêts pour le simulateur. Une simulation thermique ou physique d'une poêle, d'une casserole ou d'un four peut être évaluée par rapport aux mêmes envelopes qu'un appareil réel doit respecter. Isaac Lab, Gazebo et MuJoCo sont des candidats pour un benchmark public de « cook in simulation ».

## Observabilité

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Ceci écrit une trace OpenTelemetry : un span par étape, avec des attributs `cookwala.*` (rung, envelope OK, deviation) et des événements de limite de sécurité. Il se charge dans n'importe quel backend OTLP (Jaeger, Grafana Tempo, LangSmith…), de sorte que les équipes peuvent déboguer les appareils de la même manière qu'elles déboguent les agents.

## dry run : cet appareil peut-il cuisiner cette recette ?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

Le dry run répond avant que quoi que ce soit ne chauffe. Il indique quelles étapes l'appareil effectue, quelles étapes une personne effectue, comment chaque étape sera vérifiée (sensor, model, time ou person), ou la première raison pour laquelle il doit effectuer un refusal before heat.

