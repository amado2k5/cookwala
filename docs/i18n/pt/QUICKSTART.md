<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Quickstart

Cinco minutos, sem hardware. Você irá buscar uma receita, fazer o hash dela, perguntar se um dispositivo pode cozinhá-la, verificar um traço de temperatura contra a faixa segura de uma operação e exportar um log de cozimento como um traço. Tudo abaixo funciona hoje.

## 1. Obtenha as ferramentas

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` e os exportadores usam apenas a biblioteca padrão do Python. Os outros pacotes
são para validação completa e assinaturas. Um pacote `pip install cookwala` é o próximo no
roadmap.

## 2. Buscar uma receita e gerar seu hash

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Um executor cozinha exatamente esta revisão e recusa se o hash que lhe é fornecido não coincidir.

## 3. Este dispositivo consegue cozinhar isto?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

A resposta é `refused` com o motivo `needs_human_present`: o corte não pode ser executado sem supervisão.
Adicione uma pessoa:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Agora está `accepted`. O plano diz quais etapas o braço faz, quais uma pessoa faz, e como cada etapa será verificada (sensor, estimativa registrada, tempo ou pessoa). Tente a mesma coisa no navegador na [home page](/#demo).

## 4. Verifique um traço de temperatura contra uma banda de segurança

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Valide tudo e execute os testes de conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Transforme um log de cozimento em um trace ou um dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` é carregado em qualquer backend OpenTelemetry. `my-dataset/meta/` contém uma tarefa por etapa da receita para datasets no estilo LeRobot. Ambos recusam logs cujo household não optou por participar.

## Onde agora

| Você é | Next |
|---|---|
| Construindo um robô ou eletrodoméstico | [Robots, ROS 2 and datasets](ROBOTICS.md), depois a [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Construindo um agente de IA | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) e o [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Operando uma cozinha ou food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Escrevendo receitas | [Recipe format](RECIPE-FORMAT.md) e [Contributing](../CONTRIBUTING.md) |

