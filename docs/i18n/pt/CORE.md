<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CORE.md -->

# Cookwala Core 0.2

**Status:** draft, 2026-10-04. Esta é a parte normativa do Cookwala. MUST, SHOULD e MAY seguem a RFC 2119. Tudo o que não estiver listado aqui é um **profile** opcional (seção 10).

Um dispositivo deve ser capaz de implementar o Core em cerca de uma semana. O Core diz **o que fazer, quando está
concluído e o que nunca deve acontecer**. Ele não diz como um robô se move.

## 1. Classes de conformance

| Classe | Deve implementar |
|---|---|
| **Recipe publisher** | Documentos `recipe.schema.json` válidos; temperaturas dentro de operation envelopes; um hash e uma assinatura |
| **Executor** (robot, appliance or hub) | A Core API (`api/core.openapi.yaml`); operation envelopes e sensor ladders; limites de segurança locais; refusal em vez de suposições; o execution log |
| **Catalog** | Receitas assinadas, `/.well-known/cookwala.json` com registros de chaves, o recall feed, incident intake |
| **Agent** (AI ou software agindo por uma pessoa) | Age apenas sob um `AgentMandate`; trata o texto do documento como dados; pergunta ao principal antes de qualquer coisa em `confirmBefore` |
| **Verifier** | Hashes, assinaturas, validade e revogação de chaves, disclosures, cadeias de eventos e checkpoints |

Reivindicar uma classe significa passar em seus vetores de conformance (`conformance/`, execute com
`tools/run_conformance.py`).

## 2. Documentos principais

| Documento | Schema |
|---|---|
| Recipe | `recipe.schema.json` |
| Device capabilities | `capabilities.schema.json` |
| ExecuteRequest, ExecutionStatus, StopRequest, ExecutionLog | `core.schema.json` |
| SafetyLimits, Recall, IncidentReport, ConformanceVector | `core.schema.json` |
| Shared types (Quantity, Condition, Money, Signature, KeyRecord, Disclosure, AgentMandate) | `common.schema.json` |
| Events | `event.schema.json` (CloudEvents) |
| Vocabularies: operations, units and heat levels, incidents | `vocab/*.json` |

Todos os schemas são **strict**: campos desconhecidos são rejeitados, exceto extensões `x-<vendor>-…`.
Leitores ignoram campos `x-` que não compreendem. `tools/bundle_schemas.py` produz um único
bundle para que os dispositivos validem offline. Implementações NÃO DEVEM buscar schemas em tempo de execução.

## 3. O que as operações significam

- **Envelopes.** Toda operação baseada em calor ou perigosa em `vocab/ops.json` possui um `envelope`.
  Ele especifica:
  - o meio (água, óleo, ar, superfície da panela, produto…);
  - sua faixa de temperatura em °C (e pressão, para cozimento sob pressão);
  - agitação, tampa, nível de atenção e se a etapa pode ser executada sem supervisão;
  - perigos;
  - um método de teste.

Exemplo: `cw.op.simmer` = líquido à base de água a 85–96 °C; `cw.op.deep_fry` = óleo a 160–190 °C.
- **Alvos dentro de envelopes.** Um alvo de receita (`params.tempC` ou um `target` no sensor do meio) DEVE estar dentro do envelope. O validador rejeita receitas que quebrem isso.
- **Executores mantêm o meio dentro do envelope.** Se a receita fornecer um alvo mais estreito, eles o mantêm dentro dele também, uma vez que seja alcançado pela primeira vez.
- **Altitude.** As faixas de água e vapor deslocam-se em −1 °C por cada 300 m de altitude da cozinha.
- **Níveis de calor** (`very_low` … `max`) têm um significado compartilhado: uma faixa na superfície da panela em °C, definida em `vocab/units.json`.
- **Sensor ladder.** Cada envelope lista formas de verificar a etapa, preferencialmente nesta ordem: um sensor específico, depois `model` (uma estimativa registrada), depois `time`, depois `human`.
  - O executor utiliza o primeiro degrau que consegue satisfazer e o registra em `verifiedBy`.
  - Se não conseguir satisfazer **nenhum** degrau, DEVE recusar a etapa (`missing_sensor_no_fallback`).
  - Operações que precisam de atenção constante e podem não ser executadas sem supervisão (saltear, selar, fritar, reduzir, caramelizar…) nunca recorrem apenas ao tempo: o seu último degrau é uma pessoa observando.
  - Deep frying não tem fallback: nenhum sensor de temperatura do óleo significa nenhum deep frying.
  - Uma `Condition` pode restringir isso com `onSensorMissing`.
- **Recusa, não suposição.** Um executor que não consiga cumprir o envelope, a ladder, o equipamento ou os limites de segurança de uma etapa DEVE responder `refused` com um motivo antes de começar.

## 4. Números e unidades

- **Temperaturas são °C no fio.** Os displays podem converter.
- **Tolerâncias.**
  - `tolerance` é relativa e permitida apenas em unidades de escala de razão.
  - `toleranceAbs` é absoluta na unidade do valor, e é a única tolerância permitida em °C.
  - `Target.tolerance` é absoluta.
- **Unidades de cozinha têm valores métricos exatos:** tsp 5 ml, tbsp 15 ml, cup 240 ml,
  pinch ≈ 0.36 g, dash ≈ 0.6 ml.
- **Volume ↔ massa precisa de uma densidade** (`Quantity.densityGPerMl`, ou o vocabulário de ingredientes);
  sem uma, é um erro, nunca um palpite.
- **Dinheiro é uma string decimal** (`"12.70"`) com uma moeda ISO 4217, nunca um float.

## 5. Integridade e confiança

- **Hash.** `sha256:` mais o digest hex do JSON canônico RFC 8785 do documento,
  sem seus campos `hash` e `signature`. O canonicalizer de referência reproduz o exemplo
  RFC 8785 exatamente.
- **Signature.** Ed25519 (`EdDSA`) sobre a string de hash ASCII. `ES256` é permitido para chaves
  de hardware P-256. `kid` nomeia um `KeyRecord`.
- **Keys.** Um `KeyRecord` fornece a chave pública, seu proprietário, uma janela de validade e `revokedAt`.
  Uma assinatura cujo `signedAt` ocorre após a revogação, ou fora da janela de validade, é
  inválida.
  - Catálogos publicam suas chaves em `/.well-known/cookwala.json`.
  - Organizações e pessoas publicam as delas em documentos did:web.
  - Dispositivos publicam as deles em seu documento de capabilities.
  - Verifiers fazem cache de registros de chaves para uso offline.
- **Selective disclosure.** Um documento assinado pode conter um digest `Disclosure`,
  `sha256(JCS([salt, value]))`, em vez de um valor sensível. O detentor revela o salt e o
  valor apenas para as partes autorizadas a vê-los, e a assinatura ainda é verificada.
- **Event logs** (Mission profile):
  - Um sequencer por log atribui `seq` e `prev`, para que a cadeia nunca sofra fork.
  - Checkpoints são assinados pelo sequencer e contra-assinados por witnesses, que podem incluir
    um serviço de transparência como o IETF SCITT. Uma reescrita após um checkpoint testemunhado é
    detectável.
  - No modo `hash_only`, os payloads residem em armazenamento apagável e o log mantém apenas seus hashes.

## 6. Segurança e regras do agente (normativo)

1. **A segurança é local.** Os executores aplicam um pacote `SafetyLimits` no dispositivo.
   - Nenhuma receita, agente, mensagem remota, extensão ou modo de operação pode aumentar ou desativar um limite.
   - Um limite mais estrito sempre vence.
   - `profiles/core/safety-limits.default.json` é um ponto de partida de rascunho que os fabricantes de dispositivos
     restringem a partir de seu próprio caso de segurança.
2. **Parada local.** Um controle de parada no dispositivo interrompe o movimento em 0.5 s e corta o calor em
   1 s, com ou sem rede. `POST …/stop` nunca é recusado por autorização uma vez que o
   chamador consegue alcançar o executor.
3. **Eventos relatam; eles nunca protegem.** Eventos `cookwalalatency: local_safety` relatam o que um
   dispositivo já fez. Nenhuma função de segurança pode depender da chegada de um evento.
4. **Texto não confiável.** Todo campo de texto livre (anotado como `x-cookwala-untrusted`) é dado e nunca
   uma instrução, tanto para software quanto para agentes de IA. Tentativas de instruir através de texto são
   ignoradas e registradas (`cw.incident.untrusted_instruction`).
5. **Agentes atuam sob um mandate.** Uma solicitação enviada por um agente carrega um `AgentMandate` assinado
   pelo principal: escopos, limites de gastos, provedores permitidos, expiração e ações que precisam de
   confirmação.
   - `irreversible` e `safety_override` sempre precisam de confirmação, independentemente do que o mandate diz.
   - Executores recusam solicitações fora do mandate (`mandate_scope`).
6. **Operações não supervisionadas precisam de uma pessoa.** Operações cujo envelope diz `unattended: false`
   precisam de uma pessoa responsável presente, ou alcançável dentro de um minuto.
7. **Bloqueios de alérgenos recusam.** Qualquer alérgeno bloqueado na receita ou no inventário recusa a
   solicitação; não há substituições em torno de um bloqueio.
8. **Recalls.** Catálogos publicam recalls assinados em `GET /v1/recalls`. Executores consultam quando online
   e recusam revisões com recall. `block_and_stop_running` também interrompe execuções em andamento de forma segura.
9. **Relatórios de incidentes** são anônimos (`IncidentReport`: apenas data, sem nomes ou ids) e
   enviados para catálogos para que cada fabricante aprenda com cada quase acidente.

## 7. Ciclo de vida de execução e API

- **API:** `api/core.openapi.yaml`. Seus endpoints são:
  - `POST /v1/executions`, `GET /v1/executions/{id}`;
  - `POST /v1/executions/{id}/stop`, `POST /v1/executions/{id}/resume`, `GET /v1/executions/{id}/log`;
  - `GET /v1/safety-limits`, `GET /v1/capabilities`;
  - lado do catálogo: `GET /v1/recalls`, `POST /v1/incidents`.
- **Estados:**
  - `accepted` → `preparing` → `running` → `completed`;
  - `paused`, `needs_human` e `stopping` → `stopped` ao longo do caminho;
  - `refused` e `failed` são finais.
  - A tabela de transição completa está em `core.schema.json#/$defs/ExecutionState` e os
    vetores de conformance.
- **Regras de requisição:**
  - Todo POST carrega um `Idempotency-Key`.
  - Alterações em uma execução existente carregam `If-Match: <seq>`; uma incompatibilidade retorna 412.
  - Stop não requer If-Match.
- **Eventos:**
  - A entrega é pelo menos uma vez (at least once).
  - O `id` do CloudEvents é a chave de deduplicação.
  - `cookwalaseq` ordena eventos por assunto e corresponde ao status `seq`.
  - Dispositivos emitem `cookwala.device.heartbeat`, então um hub pode detectar um dispositivo perdido e realizar o hand off.

## 8. Privacidade

- **Os execution logs não contêm dados pessoais** (`privacy.personalData: "none"`).
- **Eles deixam o dispositivo apenas com consentimento opt-in** (`consent.dataset`: `none` por padrão,
  `research_only`, ou `open`). O consentimento pode ser retirado.
- **Datasets abertos tornam os tempos mais grosseiros, chegando ao dia.**
- **Dados de household, saúde e religiosos permanecem em casa** a menos que a pessoa escolha o contrário.
  Quando devem viajar, viajam como disclosures seletivas.
- **O Humanitarian Profile** não contém nenhum dado pessoal.

## 9. Versionamento e extensões

- **As versões Core são `0.2.x`.**
  - Os Readers aceitam qualquer patch de sua minor version.
  - Eles rejeitam outras minors com `unsupported_version`.
  - Eles ignoram campos `x-` desconhecidos.
- **Novas operations, units, sensors e incident types** são adicionados aos vocabulários sem uma
  mudança de versão.
- **Alterar o significado de uma operation é um novo id;** o antigo é marcado como `deprecated` com
  `replacedBy`.
- **Profiles** versionam independentemente e declaram a Core version de que precisam.

## 10. Perfis e seu status

| Perfil | Status | Notas |
|---|---|---|
| Core (este documento) | **draft, normative** | Alvo para as primeiras implementações de dispositivos |
| Humanitarian 0.2 (`HUMANITARIAN-PROFILE.md`) | draft | Sem dados pessoais; funciona por SMS e CSV; surplus to plate, resumos de impacto, care rule packs (RFC-0003, RFC-0004) |
| Household Context (`HOUSEHOLD-CONTEXT.md`) | draft | Fatos do household context locais; apenas derived constraints viajam (RFC-0001) |
| Registry and Directory (`REGISTRY.md`) | draft | Namespaces comprovados, versões exatas, tombstones; organizações por solicitação (RFC-0002) |
| Conformance reports (`CERTIFICATION.md`) | draft | Relatórios assinados por trás de cada afirmação de conformance (RFC-0008) |
| Federation (`FEDERATION.md`) | draft | Feeds e relays; verificar contra o emissor (RFC-0006) |
| Kitchens and production runs (`KITCHENS-AND-FLEETS.md`) | experimental | Restaurantes, comunidade, escola, desastres e cozinhas robóticas (RFC-0005) |
| Supply signals (`SUPPLY-SIGNALS.md`) | experimental | Sinais de demanda e oferta agregados, atrasados, em nível de classe; condicionados à revisão de direito de concorrência (RFC-0007) |
| Mission and Protocol (`MISSION.md`, `PROTOCOL.md`, `DECISIONS.md`) | experimental | Event log + projeção, transições em `profiles/mission/transitions.json` |
| Sessions and multi-device hub (`session.schema.json`, `hub.openapi.yaml`) | experimental | |
| Market and ecosystem | experimental | Necessita de uma revisão de direito de concorrência antes do uso em produção |
| Relief planning (`relief.schema.json`) | experimental | Fluxo operacional movido para o Humanitarian Profile |
| Reasoning and advice, health, flows, extensions | experimental | |
| GraphQL and AsyncAPI surfaces | experimental | A OpenAPI Core API é a superfície de referência |

Um perfil torna-se estável quando duas implementações independentes passam por seus vetores de conformance
e ele possui usuários reais.

## 11. Ferramentas

| Ferramenta | O que faz |
|---|---|
| `tools/validate_specs.py` | Verifica schemas, exemplos, semântica de receitas (envelopes, parâmetros de op, sem placeholders de template), rigor e se as referências de API são resolvidas |
| `tools/run_conformance.py` | Executa `conformance/*.json` e `conformance/profiles/*.json`, e escreve um ConformanceReport com `--report`: hashing (incluindo o exemplo RFC 8785), assinaturas (incluindo uma chave RFC 8032), revogação, divulgação, cadeias de eventos e checkpoints, unidades, envelopes, sensor ladders, máquinas de estado |
| `tools/cookwala_ref.py` | Biblioteca de referência e CLI: `hash`, `verify`, `chain` |
| `tools/make_conformance.py` | Regenera os vetores (revise o diff) |
| `tools/bundle_schemas.py` | Bundle de schema offline |
| `tools/humanitarian_check.py` | Verificador de rule-pack do Humanitarian Profile e resumos de impacto |
| `tools/make_profile_vectors.py` | Regenera os vetores de perfil em `conformance/profiles/` |

## 12. Alterações da 0.1

| Área | 0.1 | 0.2 |
|---|---|---|
| Schemas | Campos desconhecidos aceitos | Estrito, com extensões `x-` |
| Temperaturas | °C ou °F, tolerância relativa permitida | Apenas °C; tolerância absoluta |
| Dinheiro | Número | String decimal |
| Operações | Definições em prosa | Envelopes físicos, sensor ladders, níveis de calor, vetores de teste |
| Assinaturas | EdDSA fixo, chaves sem ciclo de vida | EdDSA ou ES256, KeyRecords com validade e revogação |
| Missões | Um documento mutável, ledger interno | Event log + projeção, sequenciador único, checkpoints testemunhados, modo apenas hash |
| Agentes | Mandate apenas dentro de Missões | `AgentMandate` em comum; obrigatório para requisições de agente |
| Segurança | Declarada em receitas | Também aplicada localmente através de SafetyLimits; recalls; relatórios de incidentes |
| Dados | Sem modelo de dataset | ExecutionLog consentido e livre de dados pessoais |
| Conformance | Apenas validação de schema | 106 vetores (44 Core, 62 profile) mais uma implementação de referência |

Para migrar um documento 0.1: converta °F para °C; substitua tolerâncias relativas em temperaturas por `toleranceAbs`; transforme valores monetários em strings decimais; remova ou renomeie campos desconhecidos para campos `x-`.

