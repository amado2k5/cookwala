<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Démarrage rapide

Cinq minutes, sans matériel. Vous allez récupérer une recette, la hasher, demander si un appareil peut la cuisiner, vérifier une trace de température par rapport à la bande de sécurité d'une opération, et exporter un log de cuisson sous forme de trace. Tout ce qui suit fonctionne aujourd'hui.

## 1. Obtenir les outils

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` et les exportateurs utilisent uniquement la bibliothèque standard Python. Les autres packages
sont destinés à la validation complète et aux signatures. Un package `pip install cookwala` est next sur la
roadmap.

## 2. Récupérer une recette et la hasher

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Un exécuteur cuisine exactement cette révision et refuse si le hash qui lui est donné ne correspond pas.

## 3. Cet appareil peut-il le cuire ?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

La réponse est `refused` avec la raison `needs_human_present` : la découpe ne peut pas s'effectuer sans surveillance.
Ajouter une personne :

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Maintenant, c'est `accepted`. Le plan indique quelles étapes le bras effectue, quelles étapes une personne effectue, et comment chaque étape sera vérifiée (capteur, estimation enregistrée, temps ou personne). Essayez la même chose dans le navigateur sur la [home page](/#demo).

## 4. Vérifier une trace de température par rapport à une bande de sécurité

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Valider tout et exécuter les tests de conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Transformer un journal de cuisson en une trace ou un jeu de données

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` se charge dans n'importe quel backend OpenTelemetry. `my-dataset/meta/` contient une tâche par étape de recette pour les jeux de données de style LeRobot. Les deux refusent les logs dont le household n'a pas opté pour l'adhésion.

## Où ensuite

| Vous êtes | Next |
|---|---|
| En train de construire un robot ou un appareil | [Robots, ROS 2 and datasets](ROBOTICS.md), puis la [Core API](CORE.md#7-execution-lifecycle-and-api) |
| En train de construire un agent IA | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) et le [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| En train de gérer une cuisine ou un food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| En train d'écrire des recettes | [Recipe format](RECIPE-FORMAT.md) et [Contributing](../CONTRIBUTING.md) |

