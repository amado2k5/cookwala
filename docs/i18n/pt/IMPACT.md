<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/IMPACT.md -->

# Impacto: o que Cookwala pode mudar, com fontes e rótulos

**Status:** 2026-10-04. Cada número abaixo é rotulado como **measured** (contado ou relatado pela
fonte nomeada), **modelled** (produzido por nossos simuladores sob suposições declaradas) ou
**assumed** (um valor de planejamento). Nada aqui é um resultado do Cookwala em campo: nenhum piloto
foi executado. Esta página declara o tamanho dos problemas e os mecanismos pelos quais o Cookwala
contribui.

## 1. Fome

| Fato | Figura | Rótulo e fonte |
|---|---|---|
| Pessoas que enfrentaram a fome em 2023 | cerca de 733 milhões | measured pela fonte: FAO, IFAD, UNICEF, WFP, WHO, *The State of Food Security and Nutrition in the World 2024* |
| Pessoas com insegurança alimentar moderada ou grave em 2023 | cerca de 2,3 bilhões | measured pela fonte: SOFI 2024 |
| Alimentos perdidos entre a colheita e o varejo | cerca de 14 % dos alimentos produzidos | measured pela fonte: FAO, *The State of Food and Agriculture 2019* (UNEP arredonda o mesmo valor para 13 %) |
| Alimentos desperdiçados no varejo, serviços de alimentação e households em 2022 | cerca de 1,05 bilhão de toneladas; cerca de 132 kg por pessoa; cerca de 79 kg por pessoa em households | measured pela fonte: UNEP, *Food Waste Index Report 2024* |

**Mecanismos do Cookwala:** ofertas de surplus que chegam a uma cozinha antes que o alimento estrague, com uma verificação de cold-chain em cada transferência (Humanitarian Profile); impacto contado da mesma forma em cada site para que os programas possam comparar e melhorar; later, sinais agregados de demanda e oferta para que menos seja cultivado e movido para ser descartado (experimental, condicionado à revisão de competition-law). **O que ele não faz:** abordar pobreza, conflito, choques climáticos, preços ou política, que impulsionam a maior parte da fome.

**Modelled, ilustrativo, não é uma previsão:** o rollout misto do simulador do país resgata
refeições equivalentes a cerca de 4.7 % do que sua população fictícia em situação de insegurança alimentar necessita; o cenário "protocolo, sem robôs" do simulador mundial atinge cerca de 40 milhões de aproximadamente 770 milhões (a baseline assumed do simulador, um arredondamento dos 733 milhões measured acima)
de pessoas famintas apenas através do rescue. Ambos dizem a mesma coisa: o rescue importa e não é
suficiente.

## 2. Saúde

| Fato | Figura | Rótulo e fonte |
|---|---|---|
| Doenças por alimentos inseguros a cada ano | cerca de 600 milhões; cerca de 420.000 mortes | measured pela fonte: WHO, *Estimates of the global burden of foodborne diseases* (2015) |
| Ingestão de sal versus a diretriz | a maioria das pessoas consome de 9 a 12 g de sal por dia; WHO recomenda menos de 5 g (2 g de sódio) | measured pela fonte: WHO fact sheet on salt reduction |
| Mortes atribuíveis ao alto teor de sódio a cada ano | cerca de 1,9 milhão | measured pela fonte: WHO, *Global report on sodium intake reduction* (2023) |
| Pessoas que dependem de combustíveis de cozinha poluentes | cerca de 2,1 bilhões; cerca de 3,2 milhões de mortes por ano devido à poluição do ar doméstico | measured pela fonte: WHO fact sheet on household air pollution (2024) |

**Mecanismos do Cookwala:** pontos de controle crítico e limites de manutenção a quente, resfriamento e reaquecimento aplicados no dispositivo e registrados; rule packs que sinalizam sódio, açúcares livres, gordura saturada e frutas e vegetais nos menus; regras de cuidado para crianças, gravidez e idosos; um registro de revisão para que nutricionistas e oficiais de segurança alimentar possam atestar um pack.
**O que ele não faz:** diagnosticar, tratar ou computar dietas terapêuticas; veja `docs/health/CLAIMS-POLICY.md`.

**Clean cooking** está no cenário, mas não no modelo: os simuladores ainda não contabilizam o cozimento com lenha e carvão ou seus efeitos na saúde (listado como uma limitação; next).

## 3. Ambiente

| Fato | Figura | Rótulo e fonte |
|---|---|---|
| Participação das emissões globais de gases de efeito estufa provenientes de perda e desperdício de alimentos | cerca de 8 a 10 % | measured pela fonte: UNEP, *Food Waste Index Report 2024* |

**Modelled, ilustrativo:** no simulador de mundo, "many robots with the protocol" reduz todo o
alimento perdido ou desperdiçado em cerca de 4.1 % e as emissões em cerca de 5.2 % ao longo de cinco anos em comparação com o
mesmo mundo sem eles; "many robots alone" reduz o desperdício doméstico, mas aumenta as perdas antes das
residências em cerca de 3 % (um efeito chicote). A eletricidade dos robôs (cerca de 164 TWh ao longo de cinco anos nesse
cenário) é contabilizada. Estas são as saídas do modelo sob suas suposições, listadas em
cada página do simulador.

## 4. Economia e trabalho

**Assumed and modelled:** o simulador da cidade estima cerca de 5 USD por pessoa por mês
menos gastos com comida e cerca de 10 horas por casa por mês a menos de cozinhar e fazer compras com robôs
cozinheiros, hardware não incluído. Nenhum valor para empregos é fornecido em lugar algum; novos papéis são nomeados
(recipe engineers, food-robot technicians, certifiers, rule-pack reviewers) sem
números.

## 5. Cultura

Sem número. A afirmação é qualitativa e verificável: uma receita Cookwala carrega o nome do cozinheiro, a identidade do prato (o que é essencial, o que é flexível, o que nunca é adicionado), texto no idioma do cozinheiro e uma assinatura. Máquinas que o cozinham herdam a receita como conhecimento prático, com crédito.

## 6. O que mediremos quando houver algo para medir

| Medida | Método | Onde definido |
|---|---|---|
| Quilogramas resgatados, refeições servidas, pessoas alcançadas, taxa de aprovação nutricional, custo por refeição, tempo para reivindicação, taxa de reivindicação, descobertas de bloqueio de segurança, incidentes de segurança | computado a partir de documentos de Offer, Claim, Handover e Distribution | Humanitarian Profile seção 10; `ImpactSummary` |
| Cozinheiros verificados: execuções que rodaram uma receita assinada de ponta a ponta com um log de conformance | execution logs com consentimento | `STRATEGY.md` seção 11 |
| Implementações independentes passando em conformance | relatórios de conformance publicados | `docs/CERTIFICATION.md` |
| Resultados de agent-safety por modelo | o benchmark promptfoo, com model id, data e config hash | `evals/kitchen-agent-safety/` |

## 7. O que ainda não sabemos

Se um food bank resgata mais com o perfil do que com seu método atual (o protocolo do pilot existe; nenhum pilot foi executado). Se os envelopes estão corretos para cada culinária (um cientista de alimentos não os revisou). Se as suposições comportamentais dos simuladores se sustentam (elas estão listadas e são ajustáveis). O quão grandes são os efeitos de rebote. Nada aqui é uma promessa.

## 8. O que deu errado

Nada foi implantado, portanto nada deu errado em campo. No repositório: a
primeira linha única ("world's first and largest robot cooking recipes index") superestimou o que
existia e foi alterada; o primeiro esquema Mission aceitava campos desconhecidos e foi tornado
estrito; os primeiros simuladores usavam uma linha de base strawman e ganharam uma linha de base de
integração competente e intervalos. As críticas que impulsionaram essas mudanças estão publicadas
(`docs/CRITIQUES.md`).

## 9. Fontes

- FAO, IFAD, UNICEF, WFP e WHO, *The State of Food Security and Nutrition in the World
  2024*, Roma, 2024.
- FAO, *The State of Food and Agriculture 2019: Moving forward on food loss and waste
  reduction*, Roma, 2019.
- UNEP, *Food Waste Index Report 2024*, Nairobi, 2024.
- WHO, *WHO estimates of the global burden of foodborne diseases*, Genebra, 2015.
- WHO, *Global report on sodium intake reduction*, Genebra, 2023; WHO fact sheet *Salt
  reduction*.
- WHO fact sheet *Household air pollution*, 2024.

As figuras são citadas conforme as fontes as publicam, arredondadas; re-verifique cada uma em relação à edição atual antes de citar na impressão. As organizações são fontes, não parceiras.

