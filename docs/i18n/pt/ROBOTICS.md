<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala e a pilha de robótica

Cookwala não substitui nenhuma parte de um robô. Ele adiciona a camada que falta à pilha de robótica para cozinhar: **o que fazer, quando cada etapa é concluída e o que nunca deve acontecer**, em uma forma que qualquer robô, eletrodoméstico, simulador ou pipeline de aprendizado possa ler e verificar.

## Onde se encaixa

| Camada | Exemplos da camada (2026; não existe integração com nenhum deles) | O que o Cookwala adiciona |
|---|---|---|
| Robôs e eletrodomésticos | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, robôs de cozinha (Moley, Miso, Chef Robotics), fornos inteligentes | Uma receita independente de dispositivo que ele pode realizar um dry run, recusar ou cozinhar; limites de segurança no dispositivo |
| Middleware | ROS 2, ros-controls, Open-RMF (frotas), Matter (eletrodomésticos) | Ações ROS 2 para receitas e etapas (`bindings/ros2`); um rascunho de mapeamento de op Matter (`bindings/matter.json`, não verificado); uma tarefa Open-RMF é uma contribuição planejada |
| Aprendizado de robôs | LeRobot (Hugging Face), NVIDIA Isaac GR00T, modelos Physical Intelligence π, Figure Helix | Tarefas de etapas em linguagem natural e segmentos de etapas para conjuntos de dados; critérios de conclusão como alvos de avaliação |
| Simulação | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | Operation envelopes e vetores de conformance como condições de teste |
| Agentes de IA | MCP, A2A, Claude, OpenAI e modelos abertos | AgentMandate, regra de texto não confiável, benchmark de segurança de agente de cozinha |

Cookwala está deliberadamente **acima do movimento**. Robôs modernos aprendem manipulação de ponta a ponta;
Cookwala dá a eles a tarefa, o teste de sucesso e o envelope de segurança, e recebe de volta um
execution log.

## ROS 2

`bindings/ros2/` define duas ações:

| Ação | Objetivo | Feedback | Resultado |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | Estado final, motivo de refusal before heat, `ExecutionLog` |
| `ExecuteNode` | Um nó de receita, seu operation envelope, um alvo opcional mais estreito | Progresso, medium temperature, alvo alcançado | Envelope OK, rung usado, resumo do passo, desvio |

**Cancelar** um objetivo `ExecuteRecipe` é um `StopRequest`: o servidor deve parar com segurança.
**Limites de segurança** permanecem dentro do dispositivo; nenhum campo de objetivo pode alterá-los. Um hub que divide uma
receita entre vários robôs envia objetivos `ExecuteNode` e pode entregar o despacho em nível de frota
ao **Open-RMF** como tarefas.

## LeRobot e conjuntos de dados de robot-learning

O loop do LeRobot é teleoperate → record → train → deploy, e o seu LeRobotDataset v2.1 armazena
tarefas em linguagem natural em `meta/tasks.jsonl` (a v3 moveu os metadados para parquet; o exportador escreve o
arquivo no estilo v2.1 hoje e um escritor v3 é next). As receitas Cookwala já contêm uma frase
por passo, e os execution logs registram quando cada passo começou e terminou.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

Isto escreve:
- `meta/tasks.jsonl`, uma tarefa por etapa da receita;
- `meta/cookwala/<log>.json` com o hash da receita, segmentos da etapa (segundos de início e fim,
  sensor-ladder rung, envelope result) e o consentimento do household.

Vídeos e ações vêm do próprio gravador do robô. A exportação recusa logs sem consentimento do dataset.

## Simulação

Os vetores de conformance em `conformance/envelope.json` (traços de temperatura com resultados esperados) e as regras de sensor-ladder estão prontos para o simulador. Uma simulação térmica ou de física de uma frigideira, uma panela ou um forno pode ser pontuada contra os mesmos envelopes que um dispositivo real deve manter. Isaac Lab, Gazebo e MuJoCo são candidatos para um benchmark público de "cook in simulation".

## Observabilidade

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

Isso escreve um trace do OpenTelemetry: um span por etapa, com atributos `cookwala.*` (rung, envelope OK, deviation) e eventos de limite de segurança. Ele carrega em qualquer backend OTLP (Jaeger, Grafana Tempo, LangSmith…), para que as equipes possam depurar dispositivos da mesma forma que depuram agentes.

## Dry run: este dispositivo pode cozinhar esta receita?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

O dry run responde antes de qualquer coisa aquecer. Ele diz quais etapas o dispositivo realiza, quais uma pessoa realiza, como cada etapa será verificada (sensor, modelo, tempo ou pessoa), ou o primeiro motivo pelo qual ele deve recusar.

