<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/RECIPE-FORMAT.md -->
# Formato de Receita Cookwala: receitas que funcionam com Missions

Uma receita no Cookwala não é uma lista de instruções. É **conhecimento culinário portátil**
que um planejador *compila* contra uma Missão específica (household, robots, appliances,
energy, budget, health, timing) em um plano executável. O robô então executa esse plano,
adaptando-se através de contingências e playbooks quando a realidade muda.

Schema: [`recipe.schema.json`](../schemas/recipe.schema.json). Exemplo completo trabalhado:
[`examples/shakshuka.cookwala.json`](../examples/shakshuka.cookwala.json).

## 1. Quatro camadas (adaptado da abordagem das Diretrizes SMART da OMS)

| Camada | O que contém | Quem escreve | Onde reside |
|---|---|---|---|
| **R1 Narrative** | Texto de receita humano, história, notas culturais, fotos | Cozinheiros, chefs, fifi.cooking | `text`, `dish.images` |
| **R2 Dish spec** | O que o prato *é* e *deve ser*: identidade (essencial vs flexível), alvos sensoriais, nutrição, estilo de servir e comer, armazenamento, verificações de aceitação | Editores de receita, assistido por IA, revisado | `identity`, `sensory`, `service`, `storage`, `nutrition`, `acceptance` |
| **R3 Executable IR** | Método agnóstico de dispositivo: fórmula (proporções + papéis), grafo de processo de ops tipadas com condições pré/pós de estado do alimento, condições `until`, alternativas, regras de pausa, modos de falha, affordances, perigos, CCPs, preparação do ambiente | Pipeline de exportação + revisão; verificado por simulador (V2) | `formula`, `ingredients`, `equipment`, `prep`, `process`, `safety` |
| **R4 Bound plan** | A receita R3 compilada para *esta* Mission: quantidades exatas, variantes escolhidas, atores e dispositivos atribuídos, cronograma, leases, monitores, contingências | O planejador/compilador, em run time | Dentro da **Mission** (`plan`), nunca no catálogo |

Como código-fonte e um compilador: **a receita é uma representação intermediária portátil
(R3 + R2). A Missão é a máquina de destino.** É isso que mantém as receitas válidas conforme os robôs
e a IA mudam: um planejador melhor produz um R4 melhor a partir da mesma receita.

## 2. O que cada seção faz em uma Missão

| Seção da receita | Usado pela Missão para… |
|---|---|
| `identity.essential / flexible / neverAdd` | Substituições, modos de orçamento e ração, adaptações de dieta: altere as partes flexíveis, nunca as essenciais, para que o prato continue sendo ele mesmo |
| `formula` (ratios, min/max, role, scaling) | Escalonamento exato para qualquer número de pessoas, racionamento de ingredientes ao longo de uma semana, esticar o orçamento, usar o que se tem à mão (o rescale de ingrediente limitante) |
| `sensory` | Pontos de verificação de visão, aroma e sabor; perfis de sabor do household (sal 2 vs 4); decisões de reaproveitamento e correção |
| `prep` (tools, surfaces, clearFirst, advanceTasks) | **Tarefas de preparação do ambiente:** se a pia ou o fogão estiverem ocupados, o planejador adiciona tarefas de "limpar, lavar, secar"; tarefas de deixar de molho ou descongelar são agendadas com horas de antecedência |
| `process.nodes[]` com estados de comida `pre`/`post` | Planejamento (só iniciar o que estiver pronto), verificação (o passo produziu o estado?), retomar após interrupções |
| `until`, `onTimeout`, `retry` | Saber quando um passo está concluído e o que fazer quando não está |
| `alternatives[]` + `energy` | Gás vs indução vs forno, economia de bateria, cozinhas sem forno, horários de silêncio |
| `pause` (pausable, safeState, maxPause, onExceeded) | **Interrupções:** uma criança precisa de ajuda, o proprietário chama, o cachorro derruba algo. O robô coloca o passo em seu safeState, lida com o evento, então retoma, reaquece, salva ou descarta com base no orçamento de pausa |
| `failureModes` (incident, detect, prevent, playbook) | Detecção precoce de problemas conhecidos e o playbook exato para recuperar |
| `affordances`, `space` | Corresponder passos a robôs que podem agarrar, levantar e alcançar; manter zonas quentes longe de crianças |
| `safety` (hazards, CCPs, supervision, abort) | O kernel de segurança: invariantes que todo plano deve preservar |
| `service` (temps, vessel, accompaniments, tableware, eating style, portioning, packable) | Servir: o que vai para a mesa, para o cômodo, na lancheira; lembretes e limites de espera; estilo de comer cultural |
| `storage` | Sobras, cook-ahead e Missões de lancheira |
| `acceptance` | Os *testes* da receita: a Missão está concluída quando estes se mantêm |
| `nutrition`, `cost` | Porções pessoais, orçamento, rações de alívio |

## 3. Exemplo: um passo com tudo anexado

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

## 4. Compilando uma receita para uma Mission (o que o planner faz)

1. **Selecione a variante:** dieta, textura (IDDSI), equipamento, energia e escolha de modo a partir de
   `alternatives`. Os essenciais de identidade devem sobreviver.
2. **Escala:** a partir de `formula` e das porções, porções por pessoa (HEALTH.md), o
   ingrediente limitante, ou um horizonte de ração. Especiarias de forma sublinear, tempo pelo expoente de massa.
3. **Substitua** dentro de papéis, respeitando `identity.neverAdd`, alérgenos, pacotes dietéticos
   e inventário.
4. **Prepare o ambiente:** compare `prep` com as facetas de espaço da Missão (pia cheia?
   fogão ocupado? tábua suja?) e adicione tarefas de arrumar, lavar, secar e organizar. Agende
   `advanceTasks` (deixar de molho, descongelar, marinar, preaquecer).
5. **Vincule:** atribua cada nó a robôs, eletrodomésticos ou humanos por affordances e
   capacidades. Alugue queimadores, recipientes e zonas. Anexe monitores (panela inteligente, ETA de
   entrega, detector de fumaça).
6. **Agende** de trás para frente a partir do horário de servir, honrando orçamentos de pausa, limites de
   bateria e energia, horários de silêncio doméstico e janelas de compartilhamento de cozinha.
7. **Anexe contingências:** `failureModes` e regras de `pause` de cada nó, além das
   políticas globais da Missão (interrupções, criança ou animal de estimação perto do fogão, vigilante do fogão,
   vigilância de deterioração).
8. **Verifique:** verificações de esquema + semântica, pacotes de política, cobertura de CCP, dry run do simulador,
   invariantes da pilha de prioridade (PROTOCOL §7.2).
9. **Emita R4** no `plan` da Missão, assine-o e entregue-o ao robô.

## 5. Autoria e conversão

- **De fifi.cooking:** o pipeline EXPORT-FIFI gera R1 + R2 + R3. As novas
  seções (identity, sensory, formula, prep, service, pause, failureModes, affordances)
  são geradas por modelos locais a partir do texto existente e verificadas por validadores e
  amostragem de revisão humana.
- **Da web:** `cookwala convert --from schema-org` → R1/R2 (V0), então o mesmo
  enriquecimento.
- **Para outros formatos:** schema.org Recipe (R1/R2 para motores de busca), Cooklang (edição
  humana), PDDL ou lógica temporal (planejadores de pesquisa) podem todos ser gerados a partir de R3.
- **Manualmente:** `cookwala init recipe` estrutura todas as camadas; `cookwala validate` e
  `cookwala simulate` as verificam.
- **Versionamento:** revisões são imutáveis e com hash. Forks registram `meta.derivedFrom`.
  **patches** de receita (de playbooks ou feedback) são propostos como diffs e promovidos apenas
  após revisão e evidência.

## 6. Linguagem do texto do passo

As frases de etapa são escritas para uma pessoa primeiro e analisadas por uma máquina em segundo lugar. O texto da etapa em árabe nos exemplos de receitas utiliza o imperativo feminino (قطّعي، سخّني), que é a convenção comum dos livros de culinária egípcios; é uma escolha deliberada, não um descuido, e um editor pode usar a passiva de gênero neutro (تُقطَّع البصلة) em vez disso. Os campos `op`, `params` e `until` carregam o significado; a frase é para o cozinheiro.

## 7. Por que isso permanece à prova de futuro

- As receitas descrevem **food outcomes and constraints, not motions**. Novos robôs e novas IAs
  produzem melhores planos R4 a partir do mesmo R3.
- Todas as novas seções são **optional and additive**. Uma receita V0 (apenas R1) ainda funciona para
  o cozimento humano guiado; cada camada adicionada desbloqueia mais automação.
- Campos `x-` desconhecidos são repassados. Fornecedores, chefs e órgãos de saúde podem estender receitas
  sem quebrar nada para ninguém.
- **Acceptance checks** permitem que qualquer executor, humano ou robô, prove que o prato saiu correto,
  que é como as receitas sobem para V3 com field evidence.

