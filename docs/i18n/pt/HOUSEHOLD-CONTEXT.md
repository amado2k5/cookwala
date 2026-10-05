<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HOUSEHOLD-CONTEXT.md -->
# Perfil de Household Context: a imagem completa permanece em casa

> **Status: draft profile** (RFC-0001). Não faz parte do Cookwala Core. Schema:
> `schemas/household.schema.json`. Registry: `vocab/facets.json` (139 facet types).
> Recipient rules: `profiles/household/recipient-roles.json`. Local API:
> `api/household.openapi.yaml`. Example: `examples/household/context.json`.

## 1. Por que

Um robô que serve bem uma família precisa saber muita coisa: os eletrodomésticos e suas peculiaridades, quem mora lá e quando estão em casa, animais de estimação, crianças, dietas, alergias, horários de medicação, rituais, orçamento, hábitos de compra, o que deu errado da última vez. Os mesmos fatos são um plano de assalto e uma ferramenta de perfilamento. Este perfil dá ao **planner at home** a visão completa e dá a todos os outros apenas uma **constraint**.

## 2. Três ideias

1. **Facets.** Um fato digitado para cada uma (`cw.facet.household.health.allergies`), com quem
   o afirmou (declarado, observado, relatado, inferido), quando, por quanto tempo, quão confiável,
   e uma classe de privacidade (`public`, `household`, `sensitive`, `secret`).
2. **Travel rules no registry.** Cada tipo de facet diz se seu valor bruto pode sair de
   casa: `never` (45 tipos: crianças, ausências, layouts, condições de saúde, religião,
   comportamento, incidentes, postura de renda), apenas como uma restrição `derived` (81 tipos), ou como uma
   divulgação `consented` após uma concessão explícita (13 tipos, principalmente o estado de auto-dispositivo para o
   fabricante).
3. **Derived constraints.** O único objeto de household que um merceeiro, planejador, serviço de entrega,
   fabricante de dispositivo ou outro robô recebe: "entregar 17:00–18:00 na porta da frente",
   "bloquear amendoim", "sem movimento de robô no corredor 15:00–15:30", "limite de orçamento 18.00 USD por
   refeição". Cada uma nomeia os **types** de facet de onde veio, nunca seus valores.

## 3. Quem recebe o quê

| Função do destinatário | Pode receber |
|---|---|
| grocer | delivery window, access point, allergen block, budget cap, labelling, packaging |
| delivery | delivery window, access point, packaging |
| planner (IA ou software que planeja a refeição) | allergen block, diet rule, avoid ingredient, serve window, budget cap, heat sources, equipment, texture level, portion count, presence required, caution level, robot runtime, serving form, cuisine, spice, quiet hours, no-movement zones, pet-safe storage, child-safe zones |
| device maker | robot runtime, device fault summary; device self-state facets by consent |
| other robot | no-movement zones, quiet hours, child-safe zones, pet-safe storage, equipment |
| insurer | apenas device fault summary (contagens de falhas por categoria, sem horários, sem fatos do household), e apenas quando o household tiver nomeado um insurer como destinatário; RFC-0001 lista esta como a função com maior probabilidade de ser removida se uma revisão de privacidade objetar |
| program (food bank, school) | nada |
| dataset | nada |

## 4. Regras

- Facets brutas nunca saem do dispositivo. Não existe uma API que as retorne a ninguém fora da rede doméstica.
- Facets `inferred` nunca são usadas para decisões de segurança.
- Nenhum score comportamental de qualquer pessoa é produzido ou armazenado. Facets de comportamento existem para servir o household (tamanhos de porções, quando limpar) e nunca viajam.
- O nível econômico é uma **postura de orçamento definida pelo proprietário**, nunca inferida de nada.
- Dados e ausências de crianças são `secret` e nunca viajam, nem mesmo derivados, exceto como restrições de movimento e de zona segura que não revelam nenhum cronograma.
- Cada facet é apagável. A exclusão é concluída dentro da janela do household (padrão 7 dias, no máximo 30) e é registrada sem conteúdo.
- Uma classe de privacidade pode ser elevada acima do padrão do registry, nunca reduzida.

## 5. A memória de incidentes local

O RFC-0001 pergunta o que o robô lembra sobre alarmes, conflitos, desistências e lições. O `LocalIncident` contém isso: data, categoria de `vocab/incidents.json`, quem estava envolvido por tipo, uma nota e uma lição. Ele nunca sai da residência. O `IncidentReport` público e anônimo no Core é um documento diferente do qual todo maker aprende.

## 6. Conformance

Vetores de perfil (`conformance/profiles/disclosure_policy.json`) fornecem facets e um papel de destinatário e esperam os tipos exatos de constraint, ids divulgados e ids retidos com motivos. A implementação de referência é `derive_constraints()` em `tools/cookwala_ref.py`.

## 7. Relação com outros documentos

`ClientProfile`, `KitchenProfile` e `RobotProfile` (`profile.schema.json`) permanecem como
pacotes convenientes. As facets da missão (`mission.schema.json`) usam os mesmos ids do registry. O
`AgentMandate` do Core permanece como a declaração normativa do que um agente pode fazer; as facets do mandate
descrevem as regras do household localmente.

## 8. Questões abertas

Veja RFC-0001: closed recipient roles; raise-only privacy; um data-protection impact assessment com um revisor.

