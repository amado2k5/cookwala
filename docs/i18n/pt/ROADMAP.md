<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROADMAP.md -->

# Roadmap: now, next, later

**Status:** 2026-10-04. Cada item carrega um status: **done**, **in progress**, **planned**,
**not yet funded**. Os gates vêm da seção 4 de `ACTION-PLAN.md`. Nada passa de planned
para done sem a evidência nomeada.

## Now (esta versão)

| Item | Status |
|---|---|
| Core 0.2: envelopes, sensor ladders, refusal, local safety limits, signed records, agent rules | done (draft, under review) |
| 101 conformance vectors (Core and profiles), conformance report format | done |
| Reference library, Python package and CLI, TypeScript types, MCP server, reference hub, ROS 2 interface package | done (editable and source installs; registries next) |
| Nine example recipes in English and Arabic | done (V1: structured, not field-verified) |
| Humanitarian Profile 0.2: surplus to plate, SMS grammar and parser, four worked flows, impact summaries, pilot protocol, concept note | done (draft) |
| Health rule packs (basic, care for vulnerable groups, school meals, sodium reduction) with a review template | done (drafts awaiting professional review) |
| Household Context Profile with a 139-type facet registry and disclosure vectors | done (draft) |
| Registry and directory API, honest `registry.json` and `directory.json` | done (static) |
| Kitchens and production runs; supply signals | done (experimental) |
| Federation rules and relay vectors | done (draft) |
| Four simulators with the protocol on and off | done (illustrative) |
| Website in English and Arabic with a page for every stakeholder, whitepaper and deck | in progress |

## Next (dentro de cerca de um ano, conforme os recursos permitirem)

| Item | Status | Gate |
|---|---|---|
| Revisão de cientista de alimentos dos operation envelopes | planned | reviewer agrees |
| Revisões de nutricionista e oficial de segurança alimentar dos quatro rule packs | planned | reviews filed; packs move to reviewed |
| Avaliação de impacto de proteção de dados do household profile | planned | reviewer agrees |
| Um piloto de food-bank (12 weeks, pré-registrado, avaliador independente) | not yet funded | partner and funding (`humanitarian/CONCEPT-NOTE.md`) |
| Resultados de benchmark de agent-safety para várias famílias de modelos | planned | runs published with method |
| wheel `pip install cookwala` e `@cookwala/sdk` no npm | planned | packaging that bundles vocabularies and schemas |
| Serviço de Registry (`validate`, `publish`, tombstones) | planned | a worker and namespace proof |
| Primeiro fabricante de dispositivos implementando a Core API contra o reference hub | planned | one maker agrees; conformance report published |
| Conversão das primeiras coleções fifi.cooking | planned | founder decides rights per collection |
| Core 0.3 a partir do feedback de dispositivos | planned | two implementers' feedback |
| Steering committee | planned | three independent adopters or two implementations |

## Later

| Item | Status |
|---|---|
| Um dispositivo real cozinhando uma receita Cookwala, sem edição, em vídeo | ainda não financiado; precisa de um parceiro de dispositivo |
| Esquema de certification com um certificador independente | planejado; nenhum certificador engajado |
| Fundação neutra para a especificação, marca registrada e selo | planejado |
| Rede de contribuintes: gravações consentidas de receitas reais com crédito | planejado |
| Sinais de demanda e oferta publicados por programas e cooperativas | planejado, após revisão de direito concorrencial |
| Benchmark "Cook in simulation" (Isaac Lab, Gazebo ou MuJoCo) | planejado |
| Reconhecimento de Digital Public Good para o Humanitarian Profile | planejado, após evidência piloto |
| Fluxos de ajuda entre regiões no simulador mundial; efeitos de clean-cooking | planejado |

## O que não faremos

Coletar dados pessoais; publicar números sem um método; nomear um parceiro antes que ele concorde;
alegar uma certification que não existe; colocar dados de household em qualquer ledger; construir um
orchestrator central do qual as cozinhas dependem; alegar o fim da fome.

## Regras de kill e pivot

Do plano de ação: se duas rodadas de revisão externa não produzirem um fabricante de dispositivos ou um parceiro piloto, a Cookwala estreita para o Humanitarian Profile e o formato de receita. Se um piloto mostrar um ganho inferior a 5 %, os resultados são publicados e o perfil redesenhado antes de qualquer scaling.

