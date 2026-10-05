<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/HUMANITARIAN-PROFILE.md -->

# Perfil Humanitário Cookwala (rascunho 0.2)

**Status:** rascunho para revisão por food banks, programas de ajuda e profissionais de segurança alimentar e nutrição. Não é revisado ou endossado pelo WFP, WHO, FAO, o Global FoodBanking Network ou qualquer outra organização aqui mencionada.

**Arquivos:**

- schema: [`schemas/humanitarian.schema.json`](../schemas/humanitarian.schema.json)
- examples: [`examples/humanitarian/`](../examples/humanitarian)
- rule packs: [`who-codex-basic`](../profiles/humanitarian/who-codex-basic.rulepack.json) (todos), [`care-vulnerable-groups`](../profiles/humanitarian/care-vulnerable-groups.rulepack.json), [`school-meals-basic`](../profiles/humanitarian/school-meals-basic.rulepack.json), [`sodium-reduction`](../profiles/humanitarian/sodium-reduction.rulepack.json) (RFC-0004; todos os rascunhos aguardando revisão profissional, veja [`docs/health/REVIEW-TEMPLATE.md`](health/REVIEW-TEMPLATE.md))
- API: [`api/humanitarian.openapi.yaml`](../api/humanitarian.openapi.yaml)
- worked flows: [`examples/humanitarian/flows/`](../examples/humanitarian/flows) (food bank no Cairo, refeições escolares, cozinha de desastre, cozinha robótica), cada um com um `ImpactSummary` computado
- pilot protocol: [`docs/humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md)
- spreadsheet and SMS templates: [`profiles/humanitarian/templates/`](../profiles/humanitarian/templates)
- reference checker: [`tools/humanitarian_check.py`](../tools/humanitarian_check.py)

## 0. O que o 0.2 adiciona (RFC-0003, RFC-0004)

Aditivo acima de 0.1; leitores aceitam ambos.

- **Da fazenda ao prato:** `Item.origin` (`farm`, `processor`, `wholesale`, `retail`, `food_service`, `kitchen`) e `Item.harvestedAt`; funções `farm`, `caterer`, `robot_kitchen`; a palavra SMS `FARM`.
- **Regras de cuidado:** `Item.foodClasses` e `Distribution.menu.foodClasses` (ovo cru, laticínios não pasteurizados, nozes inteiras, arroz cozido…), tipo de regra `food_class`, `Rule.audienceGroup`, `Distribution.audienceGroups`; três novos rascunhos de rule pack.
- **Revisões:** `RulePack.reviews` registra a profissão, organização, data, escopo e resultado de cada revisão; `status: reviewed` requer uma revisão aprovada.
- **Impacto:** `ImpactSummary` com nove medidas, cada uma contendo `method` (measured, modelled, assumed, not recorded), computado por `tools/humanitarian_check.py --summary`.
- **Tempo para reivindicar:** `Offer.createdAt`, `Claim.claimedAt`; `Handover.leg` para que os quilogramas resgatados sejam contados apenas uma vez.
- **Tipos de programa** no `Manifest`.

## 1. Propósito

Uma pequena, estrita, parte de Cookwala livre de dados pessoais para organizações que alimentam pessoas:
food banks, cozinhas comunitárias, programas de merenda escolar, programas de ajuda, doadores (mercearias,
restaurantes, fazendas, empresas de buffet), transportadores e armazéns frigoríficos. Cobre quatro tarefas:

1. **Oferecer surplus food** e reivindicá-la, de forma rápida e justa.
2. **Registrar cada handover** de custódia, com uma verificação de temperatura (verificação de cold-chain).
3. **Relatar o que foi servido** apenas como contagens agregadas.
4. **Verificar menus e handovers** em relação a regras de nutrição e segurança alimentar legíveis por máquina.

**Funciona sem robôs, apps ou internet.** Os níveis H0 e H1 funcionam em planilhas, SMS
e telefones básicos. Robôs, hubs e agentes são consumidores opcionais dos mesmos documentos.

## 2. Princípios

- **Não causar danos.** Não colete nada que possa identificar, localizar ou traçar o perfil de uma pessoa ou
  household. Em contextos frágeis, dados sobre beneficiários são um risco de proteção.
- **Princípios humanitários** (humanidade, neutralidade, imparcialidade, independência): sem
  branding comercial na ajuda, e sem uso de dados para marketing.
- **Estrito e pequeno.** Cada objeto rejeita campos desconhecidos (exceto extensões `x-`),
  então erros de digitação e campos pessoais extras falham na validação.
- **Unidades exatas:** quilogramas, graus Celsius, tolerâncias absolutas, e dinheiro como strings decimais.
- **Regras locais vencem.** Rule packs são substituíveis por leis nacionais de segurança alimentar e doação.
- **Aberto:** especificação livre de royalties, ferramentas de código aberto. O perfil é projetado para atender ao
  Digital Public Goods Standard e aos Principles for Digital Development.

## 3. Níveis de conformance

| Nível | O que um participante faz | Necessidades |
|---|---|---|
| **H0 — Papel & SMS** | Registra ofertas, handovers e distribuições nos templates CSV (com linhas de hashtag HXL) ou por SMS (seção 8.3) | Uma planilha ou um telefone básico |
| **H1 — Resgate** | Troca documentos `Offer`, `Claim`, `Handover` e `Distribution` via API; segue a máquina de estados (seção 5) | Qualquer cliente HTTP |
| **H2 — Segurança & nutrição** | Aplica um `RulePack` a cada handover e menu, e registra `findings` | O reference checker ou um equivalente |
| **H3 — Interoperabilidade** | Exporta agregados para HXL, DHIS2 e o `ImpactReport` principal do Cookwala; usa identificadores GS1 | Trabalho de integração |

Um participante publica um `Manifest` em `/.well-known/cookwala-humanitarian.json` que
declara seus níveis, rule packs, endpoints e `personalData: "none"`.

## 4. Documentos

| Documento | Quem escreve | Propósito |
|---|---|---|
| `Offer` | Doador | Surplus food disponível para coleta: itens (kg, armazenamento, marcas de data, alérgenos), janela, local, temperaturas |
| `Claim` | Food bank, cozinha, programa | Reivindica todo ou parte de uma `Offer`, com um horário de coleta e tipo de veículo |
| `Handover` | Receptor da custódia | Um por trecho: temperaturas, kg aceitos ou rejeitados com um código de motivo, e descobertas de regras |
| `Distribution` | Cozinha, food bank, escola | Agrega refeições e pessoas atendidas em um local em um dia; nutrientes e custos de menu opcionais |
| `RulePack` | Programa ou autoridade | Regras de nutrição e segurança alimentar versionadas (seção 6) |
| `Manifest` | Todo participante | Capacidades e declaração de proteção de dados |

Os documentos principais de alívio do Cookwala (`Program`, `Need`, `Pledge`, `Allocation`,
`ImpactReport` em `relief.schema.json`) permanecem disponíveis para planejamento. Este perfil gerencia o
fluxo operacional.

## 5. Ciclo de vida da oferta

| De | Próximos estados permitidos |
|---|---|
| `offered` | `claimed`, `expired`, `withdrawn` |
| `claimed` | `collected`, `offered` (o claim expirou), `expired`, `withdrawn` |
| `collected` | `delivered`, `rejected` |
| `delivered` | `distributed`, `rejected` |
| `distributed`, `expired`, `withdrawn`, `rejected` | nenhum (final) |

**Regras para mudanças de estado:**

- Cada alteração incrementa `version`. Escritores enviam `If-Match: <version>`; uma incompatibilidade retorna
  **409**, e o escritor releitura e tenta novamente.
- Uma transição ilegal retorna **409** com as transições permitidas.
- Ofertas movem-se para `expired` automaticamente em `window.to`.
- Reivindicações expiram em `pickupBy` mais um período de carência que o programa define (padrão 30 minutos).

**Reivindicação justa.** Por padrão, as reivindicações seguem a ordem de chegada dentro de um nível de prioridade que o programa estabelece:
por exemplo, cozinhas que servem crianças primeiro, depois outras cozinhas, depois food banks. Níveis e
quaisquer regras de rotação devem ser publicados no `Manifest` do programa ou no website.

## 6. rule packs de segurança alimentar e nutrição

Um `RulePack` contém regras de seis tipos:

- `temperature`: resfriado ≤ 5 °C, mantido quente ≥ 60 °C, congelado ≤ −18 °C;
- `time`: alimentos cozidos fora de controle de temperatura por no máximo 2 h;
- `date_mark`: use-by bloqueia, best-before alerta;
- `allergen`: undeclared allergens bloqueia;
- `nutrient`: quantidades por pessoa-dia ou por refeição;
- `energy_share`: parcela de energia de açúcares livres, gordura, gordura saturada, gordura trans ou proteína.

Cada regra é ou `block` (não aceitar ou servir) ou `warn` (permitido, registrado como um finding).

O pacote padrão `who-codex-basic@0.1.0` é um **rascunho derivado de orientações públicas**: as orientações da WHO sobre dieta saudável, sódio, açúcares e gorduras, as Cinco Chaves para uma Alimentação Segura da WHO, os códigos de rotulagem e de alimentos congelados do Codex, e os números de planejamento de ração mínima da Sphere. Ele é simplificado, não é aconselhamento médico, exclui alimentação infantil e terapêutica, e deve ser revisado por pessoal qualificado. Os programas devem copiá-lo e adaptá-lo, definir `jurisdiction` e registrar quem o revisou em `reviewedBy`.

Os receptores no nível H2 executam o pack em cada handover e em cada menu, e registram rule ids em `findings`. O verificador de referência reporta onde findings declarados e computados discordam.

## 7. Proteção de dados

**O perfil não contém dados pessoais. Documentos NÃO DEVEM conter:**

- nomes, números de telefone, e-mails ou identificadores nacionais, de refugiados ou biométricos de qualquer pessoa;
- registros de nível doméstico, ou localizações de residências ou indivíduos;
- saúde, deficiência, religião ou nacionalidade de qualquer pessoa.

**O que ele carrega em vez disso:**

- **Apenas organizações.** Cada parte é uma organização identificada por `did:web`, um GS1
  Global Location Number (GLN) ou um registry id. Pessoas aparecem apenas como funções
  (`checkedBy: "trained_staff"`).
- **Apenas agregados.** `Distribution.people` contém contagens por grupo, e qualquer contagem abaixo de 10
  é relatada como `"<10"`.
- **Apenas locais.** Um `Site` é as instalações de uma organização ou uma área administrativa
  (OCHA P-codes), nunca um household.
- **Notas curtas.** O texto livre é limitado a notas operacionais de 280 caracteres e não deve
  conter dados pessoais. As implementações devem escanear as notas em busca de números de telefone e ids
  antes de armazená-los.

**Retenção e auditoria:**

- **Retenção:** cada participante declara `retentionDays` em seu `Manifest` e deleta
  documentos após esse período.
- **Auditoria (opcional, `hash_only`):** um sequenciador por programa (normalmente o food bank ou
  operador do programa) anexa o hash SHA-256 do RFC 8785 canonical JSON de cada documento.
  Os conteúdos são armazenados separadamente e permanecem deletáveis. Uma organização parceira
  assina um checkpoint a cada dia, para que o histórico não possa ser reescrito silenciosamente. Um único
  sequenciador evita forks na cadeia.
- **Hospedagem** deve ser no país onde a lei ou o programa exigir.

## 8. Transporte

### 8.1 API (nível H1)

| Método | Caminho | Notas |
|---|---|---|
| `POST` | `/offers` | Cria uma oferta (`state: offered`) |
| `GET` | `/offers?status=offered&admin2=…&storage=…` | Ofertas abertas perto de um receptor |
| `POST` | `/offers/{id}/claims` | Reivindica uma oferta; `If-Match` obrigatório; 409 quando já reivindicada |
| `POST` | `/offers/{id}/transitions` | `{ "to": "collected" }`; `If-Match` obrigatório |
| `POST` | `/handovers` | Registra uma entrega |
| `POST` | `/distributions` | Registra uma distribuição |
| `GET` | `/reports?from=…&to=…` | Agrega por um período |

Regras de solicitação e transporte:

- **Idempotência:** cada `POST` carrega um `Idempotency-Key`. Os servidores mantêm as chaves por pelo menos 24 h e retornam a resposta original para repetições.
- **Autenticação:** credenciais de cliente OAuth 2.1, um cliente por organização.
- **Webhooks** (`offer.created`, `offer.claimed`, `offer.expired`, `handover.recorded`)
  são entregues pelo menos uma vez, com um `id` de evento para deduplicação e um número de sequência por oferta para ordenação.

### 8.2 Planilhas (nível H0)

Use os templates CSV em `profiles/humanitarian/templates/`. A sua segunda linha contém hashtags [HXL](https://hxlstandard.org), para que as ferramentas de dados humanitários possam lê-las diretamente.

### 8.3 SMS (nível H0)

```
OFFER 36KG YOGURT C 4C UB0511          → reply: OFFER A7K open until 08:00
FARM 120KG TOMATO A HV0411             → an offer with origin farm, harvested 4 November (0.2)
CLAIM A7K ALL                          → reply: CLAIMED A7K pickup by 20:30
HAND A7K 36 T4.6                       → accepted 36 kg at 4.6 °C
HAND A7K 30 REJ 6 PACK T4.6            → accepted 30 kg, rejected 6 kg, packaging_damaged (0.2)
HAND A7K 0 REJ 18 TEMP T52             → rejected 18 kg, temp_out_of_range
DIST 410 MEALS 410 PEOPLE 96KG          → distribution for today at the sender's site
MENU D12 KCAL650 SODIUM540 FV95         → per-meal nutrients for distribution D12 (0.2)
HELP · CANCEL A7K
```

A gramática é implementada em `tools/cookwala_ref.py` (`parse_sms`) e testada por
`conformance/profiles/sms.json`. As palavras-chave são em inglês; dígitos
árabe-indic (٠-٩) e persas (۰-۹) são aceitos onde quer que haja um dígito, portanto, um telefone configurado para qualquer um dos teclados funciona.

Códigos de armazenamento: `A` ambient, `C` chilled, `F` frozen, `H` hot-held. Marcas de data: `UB` use-by,
`BB` best-before, `HV` harvested, como `DDMM`. Códigos de motivo de rejeição: `TEMP` temp_out_of_range,
`DATE` past_use_by, `PACK` packaging_damaged, `ALLERG` allergen_unlabelled, `QTY`
quantity_mismatch, `PEST` pests_or_contamination, `SPACE` no_capacity, `TRANSPORT`
no_transport, `LATE` arrived_late, `OTHER`; qualquer outra palavra é registrada como `other`. A resposta `HELP` DEVE ser um exemplo por comando, ASCII puro, com menos de 160 caracteres.

Um gateway DEVE aplicar estas verificações antes de escrever um documento (`sms_storage_findings` na
referência; ids são block findings):

| Finding | When |
|---|---|
| `safety.temp_not_recorded` | um `HAND` em uma linha resfriada, congelada ou de manutenção a quente não possui leitura `T`: responda solicitando-a, não escreva nada |
| `safety.hot_hold_min` | um `OFFER` com armazenamento `H` abaixo de 60 °C: recuse a listá-lo |
| `safety.storage_class_mismatch` | as palavras do item implicam laticínios, carne, aves, peixe, ovo ou comida cozida e o armazenamento é `A`: recuse a listá-lo |
| `safety.chilled_max`, `safety.frozen_max` | leituras acima de 5 °C ou acima de −18 °C em oferta ou entrega |

Ofertas de comida mantida quente fecham após duas horas (uma hora para arroz cozido); um gateway nunca armazena uma leitura de placeholder. O gateway mapeia o número registrado do remetente para uma organização, nunca para uma pessoa nos documentos.

## 9. Interoperabilidade

| Sistema | Mapeamento |
|---|---|
| HXL | Modelos CSV; `Distribution` → `#reached+…`, `#adm1+name`, `#value+meals` |
| GS1 | `Item.gtin` (produtos); `Site.gln` e `OrgId` `gln:` (locais) |
| OCHA common operational datasets | `Site.pcode` |
| DHIS2 | Valores de dados agregados por local e período de `Distribution` (refeições, pessoas por grupo, kg, incidentes) |
| WFP SCOPE e outros sistemas de beneficiários | **Apenas agregados.** Nenhum registro de beneficiário entra ou sai deste perfil |
| Apps de resgate de alimentos | Adaptadores mapeiam suas listagens para `Offer` e suas coletas para `Claim` e `Handover` |
| Core Cookwala | `Item.ingredientId` e `menu.recipes` vinculam-se ao índice de receitas; `relief.ImpactReport` soma `Distribution`s |

## 10. Métricas do piloto (definidas para que os sites possam ser comparados)

Computado em um `ImpactSummary` por `python tools/humanitarian_check.py --summary DIR`. Como um piloto é executado e julgado: [`humanitarian/PILOT-PROTOCOL.md`](humanitarian/PILOT-PROTOCOL.md).

| Métrica | Definição |
|---|---|
| Kg resgatados | Soma de `Handover.kgAccepted` na primeira etapa dos doadores |
| Taxa de reivindicação | Ofertas que atingem `claimed` ÷ ofertas criadas |
| Tempo para reivindicação | Mediana de minutos desde a criação da `Offer` até o estado `claimed` |
| Rejeição por motivo | Soma de `kgRejected` por `reason` |
| Refeições servidas | Soma de `Distribution.meals` |
| Taxa de aprovação nutricional | Distribuições com menus e sem descobertas `nutrition.*` ÷ distribuições com menus |
| Custo por refeição | (alimento + transporte + equipe + energia) ÷ refeições |
| Minutos de voluntários por 100 kg | `volunteerMinutes` ÷ (kg usados ÷ 100) |
| Segurança | Contagem de descobertas do bloco `safety.*`, e `safetyIncidents` |

## 11. Segurança

- **Assinaturas são opcionais em H1** e obrigatórias para auditoria entre organizações em H3
  (EdDSA, chaves publicadas no `did:web` da organização).
- **Notas e nomes em documentos são dados não confiáveis.** Softwares e agentes de IA nunca devem
  tratá-los como instruções.
- **Rule packs são versionados e fixados** (`id@version`) em cada descoberta, para que os resultados sejam
  reproduzíveis.

## 12. Deliberadamente deixado de fora

- Registro de beneficiários, elegibilidade e direcionamento (estes pertencem aos próprios
  sistemas protegidos do programa).
- Pagamentos: Cookwala nunca movimenta dinheiro.
- Receitas e execução do robô (a especificação principal). O perfil apenas nomeia receitas e relata
  nutrientes.
- Nutrição médica e terapêutica.

## 13. Como revisar

Por favor, abra issues em [amado2k5/cookwala](https://github.com/amado2k5/cookwala/issues)
com a label `humanitarian`. Estas reviews são as mais úteis:

- pessoal de segurança alimentar verificando o rule pack e os motivos de rejeição;
- operadores de food-bank verificando o ciclo de vida e o fluxo de SMS;
- encarregados de proteção de dados verificando a seção 7.

