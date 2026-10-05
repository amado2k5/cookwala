<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/KITCHENS-AND-FLEETS.md -->
# Cozinhas e ciclos de produção: restaurantes, comunidade, escola, desastre e cozinhas robóticas

> **Status: experimental profile** (RFC-0005). Schema: `schemas/fleet.schema.json`.
> Examples: `examples/fleet/`.

## 1. Por que

O fundador pediu o mesmo protocolo em um restaurante, um casamento, uma campanha de doação ou uma fábrica de alimentos (RFC-0005). O briefing adiciona programas de merenda escolar e cozinhas de desastre. O Core cobre um dispositivo cozinhando uma receita; o Humanitarian Profile cobre a movimentação de surplus e a contagem de refeições. Entre eles está a **kitchen**: estações, dispositivos, pessoas, muitos lotes, uma janela de serviço, pontos críticos de controle e o link do execution log de um dispositivo para as refeições que um programa reporta.

## 2. Documentos

| Document | O que diz |
|---|---|
| `Kitchen` | A cozinha de uma organização: tipo, estações (prep, hob, oven, fryer, kettle, robot cell, plating, packing, hot hold, cooling, cold store, wash), dispositivos como referências de capacidade, capacidade em refeições por hora, equipamentos de hot-hold e cooling, rule packs em vigor, **contagens de pessoal por função**, horas de operação |
| `ProductionRun` | Receitas com contagens de lote e porções, uma janela de serviço, atribuições por etapa da receita para uma estação e para um `device`, uma `person` ou ambos, registros de ponto crítico de controle (cook core temperature, hot-hold, two-stage cooling, reheating, chilled storage, allergen segregation), as execuções Core produzidas, e um resultado (refeições produzidas e servidas, desperdício, rescued food usado, falhas, incidentes, energia, custo, o Humanitarian `Distribution` que ele emitiu) |
| `StationLease` | Uso exclusivo de uma estação por um device ou uma função por um tempo |

## 3. Como ele se une ao resto

- Um passo atribuído a um `device` é um Core `ExecuteRequest` (ou um objetivo `ExecuteNode` através do
  binding ROS 2); seu hash `ExecutionLog` vai em `executions`.
- Uma execução que serve a um programa emite um Humanitarian `Distribution`; os `ccps` da execução são a
  evidência por trás das descobertas de segurança da distribuição.
- Rule packs do Humanitarian Profile aplicam-se ao menu e itens da execução.
- O despacho da frota (qual robô vai para onde) pertence ao Open-RMF ou ao gerenciador de frota de um fornecedor,
  não a este perfil.

## 4. Exemplo resolvido

`examples/fleet/kitchen-disaster.json` e `production-run-disaster.json`: uma cozinha de alívio
com duas chaleiras a gás, unidades de hot-hold e um banho de gelo produz 710 refeições de sopa de lentilha e
arroz para uma janela de duas horas, registra temperaturas de cozimento e de hot-hold, encontra uma unidade de hot-hold
abaixo de 60 °C e reaquece esse lote antes de servir, e emite uma distribuição. O exemplo é
ilustrativo; nenhuma cozinha ou evento real é descrito.

## 5. O que é deliberadamente deixado de fora

Nomes e escalas de funcionários, salários, pedidos e pagamentos de clientes, preços do menu. Os funcionários aparecem como contagens por função para que o custo por refeição possa ser computado sem identificar ninguém.

## 6. Next

Exemplo de serviço de restaurante com uma estação de robô; um conjunto de conformance para a máquina de estados de execução; unificação de `StationLease` com sessões de leases (`session.schema.json`).

