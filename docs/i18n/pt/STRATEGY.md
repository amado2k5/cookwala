<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STRATEGY.md -->
# Estratégia Cookwala: mensagem, produto, website, docs, experiência do desenvolvedor

**Status:** revisado 2026-10-04 (v2). Abrange a missão, visão, história, padrão, website,
documentação, API e SDK, demos, comunidade e métricas. Baseia-se no plano de ação
(`ACTION-PLAN.md`), na história de fundo e lista de lacunas (`research/BACKSTORY.md`), na revisão de arquitetura
(`research/ARCHITECTURE-REVIEW.md`), no benchmark de 23 sites (`research/WEB-BENCHMARK.md`), no
design de stakeholders (`STAKEHOLDERS.md`) e nas regras de mensagens (`MESSAGING.md`). A tabela da Seção 1
é o estudo de primeira passagem; o benchmark o substitui onde eles diferem.

---

## 0. Resumo

**O trabalho da Cookwala.** É a maneira aberta de dizer a qualquer cozinha (uma pessoa, um food bank, um forno ou um robô humanoide) **o que fazer, quando cada etapa é concluída e o que nunca deve acontecer**, e verificar todos os três no dispositivo.

**O que muda:**

1. **Message.** Retire "the world's first and largest robot cooking recipes index and CLI"
   e comece com o problema que todo fabricante de robôs e cozinha possui. Novo slogan:
   *"The open standard for cooking safely: people, kitchens and robots."*
2. **Story.** Robôs estão prestes a cozinhar em casas, mas ninguém escreveu, de uma forma que uma
   máquina possa verificar, o que "pronto" e "seguro" significam, ou em quais culinárias. A Cookwala começou
   a partir das receitas egípcias de uma família. Sua missão é ensinar às máquinas cada culinária
   de forma segura, e garantir que comida boa chegue às pessoas.
3. **Proof before promise.** Contadores reais e ao vivo. Rótulos now / next / later. Críticas publicadas.
4. **One loop everyone understands:** *Describe → Check → Cook → Learn.*
5. **Paths by audience:** fabricantes de dispositivos, construtores de agentes de IA, cozinhas e food banks, cozinheiros,
   pesquisadores.
6. **Code and a live demo on the first screen.** dry run no navegador ("Can this device cook
   this recipe?"), os simuladores, e comandos de copiar e colar que funcionam hoje.
7. **Developer experience at the level of the best AI and robotics docs:** um quickstart de 5 minutos,
   docs organizados como tutoriais, guias de como fazer, referência e explicação,
   `llms.txt`, copy-page, um pacote Python e CLI, um SDK JS/TS tipado, um servidor MCP, um
   hub de referência que você pode rodar localmente, um pacote ROS 2, e uma ponte LeRobot.
8. **A contributor network** (inspirado no Index da Figure): cozinheiros e cozinhas contribuem com
   gravações consentidas de receitas reais, para que os robôs aprendam cada culinária, com crédito às
   pessoas que os ensinaram.

---

## 1. O que aprendemos

| Site | Problema que resolve | Abordagem | Como comunica | Público | O que extraímos |
|---|---|---|---|---|---|
| **Figure – Index** | Humanoides precisam de enormes quantidades de dados de tarefas do mundo real | Rede de colaboradores pagos que registra tarefas cotidianas; serviços now, robôs later | Cinemático, monocromático, tipografia de luz enorme; contadores ao vivo (29 M video uploads, $15 M paid); *"Today, services on demand. Soon, robots on demand."* | Colaboradores, households, empresas | Rede de colaboradores com crédito; **contadores de prova ao vivo**; uma linha de honestidade "today / soon"; uma imagem impactante |
| **Figure (home)** | Ajuda doméstica | Um humanoide de propósito geral | *"The future of home help is here."* Uma frase, um vídeo | Households, investidores | A promessa de uma frase; produto antes de features |
| **MCP Registry** | Encontrar servidores MCP confiáveis | Registry da comunidade; namespaces reverse-DNS verificados; versões exatas; hashes de integridade; endpoint de validação; status de lifecycle | Referência OpenAPI limpa; schema-first | Publicadores de servidores, fabricantes de clientes | **Namespaces verificados, versões fixas, hashes, tombstones** → `REGISTRY.md` |
| **LangChain docs** | A construção de agentes é fragmentada | Frameworks abertos e model-agnostic mais uma plataforma | *"The open agent engineering ecosystem"*; lifecycle Build → Test → Deploy → Monitor; centro de confiança e status | Engenheiros de agentes, empresas | **Um lifecycle que o leitor reconhece**; centro de confiança; academia e fórum |
| **LangSmith Observability** | Ver o que os agentes fizeram em produção | Traces → monitoramento → feedback → datasets para evals | Passos com links; página de conceitos; integrações | Equipes de agentes | **Execution logs como traces**; traces tornam-se datasets → `execlog_export.py otel` |
| **OpenAI API docs** | Primeira chamada de API | Quickstart com código primeiro; build paths; model cards | Escuro, focado em código, "Ask AI", status e cookbook | Desenvolvedores | **Código na primeira tela; "build paths"** |
| **Claude Platform docs** | Da primeira chamada à produção | Duas superfícies (Messages, Managed Agents); jornada do desenvolvedor numerada; model family cards | Busca ⌘K; abas de linguagem (Python … cURL, CLI); jornada 1–4 | Desenvolvedores, equipes de plataforma | **Jornada do desenvolvedor numerada; abas de linguagem; "choose how you build"** |
| **AsyncAPI** | Descrever APIs orientadas a eventos | Especificação aberta mais ferramentas (generators, docs); governança aberta sob a Linux Foundation | "Part of the Linux Foundation"; spec → docs → code demo; reuniões da comunidade; níveis de sponsor | Arquitetos, construtores de ferramentas | **Selo de governança aberta, TSC, calendário da comunidade, sponsors** |
| **SiliconFlow** | Inferência de modelo rápida e barata | API única para muitos modelos | Listas de features de performance, escalabilidade, custo e segurança | Desenvolvedores, empresas | Uma lista nítida de **characteristics** (nossas: safe, verifiable, open, offline, private, inclusive) |
| **promptfoo** | Engenharia de prompt por tentativa e erro | Casos de teste declarativos, red teaming, CI | *"Test-driven LLM development, not trial-and-error"*; lista why-choose; passos de workflow | Desenvolvedores de apps de LLM, segurança | **Testes de segurança declarativos** → `evals/kitchen-agent-safety/` |
| **helix.org** (crypto agent; não o Helix AI da Figure) | DeFi é muito complexa | Agente de linguagem natural com confirmação antes de cada transação | Whitepaper: abstract → problem → solution → architecture → security model | Usuários de crypto | **Estrutura do whitepaper; security model explícito; "always confirm"** (extraímos a estrutura, não o modelo de token) |
| **Hugging Face LeRobot** | Robótica é difícil de começar | Biblioteca hardware-agnostic; teleoperate → record → train → deploy; formato de dataset padrão; datasets da comunidade | "Pick your path: I have a robot / no hardware yet / I want to contribute"; cheat sheet; problemas comuns | Makers, pesquisadores | **"Pick your path"; compatibilidade de dataset; seção de common-problems** |
| **ROS 2 / Open Robotics** | Interoperabilidade de software de robô | Middleware aberto (ROS, Gazebo, Open-RMF) operado por uma organização sem fins lucrativos | *"Powering the world's robots"* | Desenvolvedores de robôs | **ROS 2 actions; stewardship sem fins lucrativos** |
| **NVIDIA Isaac** | Desenvolver e treinar robôs | Simulação, bibliotecas, foundation models (GR00T) | Mapa da plataforma: libraries, simulation, models, blueprints | Equipes de robótica | **Simulação como o test bench** para envelopes |
| **1X, Unitree, Pollen** | Humanoides domésticos, robôs acessíveis, robôs abertos para makers | Produtos com depósitos, pre-orders e comunidade | Um produto, um preço, um botão | Households, makers | Robôs domésticos estão sendo enviados now; nossa janela é now |

**Padrões compartilhados pelos melhores:**
1. Uma frase sobre para quem é e o que faz.
2. Um loop que o leitor reconhece.
3. Código funcional ou uma demo dentro de uma rolagem.
4. Pontos de entrada de escolha do usuário.
5. Prova (números, usuários, governança).
6. Status honesto (centro de confiança, página de status, now/next).
7. Comunidade que você pode se juntar hoje.
8. Docs construídos tanto para pessoas quanto para leitores de IA (página de cópia, `llms.txt`, "Ask AI").

---

## 2. Cookwala hoje

**Pontos fortes:**
- Uma ideia rara e concreta: operation envelopes físicos, sensor ladders, refusal em vez de
  suposições, segurança aplicada no dispositivo, documentos verificáveis.
- Vetores de conformance que incluem dois resultados de padrões independentes (RFC 8785, RFC 8032).
- Quatro simuladores jogáveis.
- Um perfil humanitário que funciona sem robôs.
- Um corpus de receitas real (fifi.cooking) e uma região com uma identidade (Egito, o mundo árabe).
- Um registro de crítica e resposta excepcionalmente honesto.

**Lacunas:**

| Gap | Effect |
|---|---|
| Manchete afirma "primeiro e maior" com 1 receita publicada | Soa como hype; convida ao descrédito |
| "Acabar com a fome no mundo" como o destaque | Afasta financiadores e especialistas que conhecem os drivers da fome |
| Enquadramento apenas para robôs | Exclui os usuários que podem adotar hoje (cozinhas, food banks, construtores de agentes) |
| Sem quickstart, sem SDK, sem servidor executável | Ninguém consegue ter sucesso em 5 minutos |
| Docs são 25 arquivos markdown sem navegação | Difícil de encontrar, difícil de confiar |
| Sem prova ao vivo ou status | Sem sensação de momentum ou prontidão |
| Sem forma de participar | O interesse não pode se transformar em contribuição |

---

## 3. Posicionamento e mensagem

### 3.1 Categoria e resumo
- **Categoria:** um padrão aberto (com ferramentas gratuitas e um índice) para culinária executável e verificável.
- **Resumo:** *Cookwala é o padrão aberto para cozinhar com segurança: pessoas, cozinhas e robôs.*
- **Triad**, usado em todos os lugares:
  - **O que fazer.** Receitas como etapas que uma máquina pode planejar.
  - **Quando está pronto.** Condições de término mensuráveis: temperaturas, sinais de estado do alimento, tempos.
  - **O que nunca deve acontecer.** Limites de segurança que o próprio dispositivo impõe.

### 3.2 Missão e visão (revisado)
- **Missão:** *Ajudar todos a comer bem, com segurança, de forma acessível e sem desperdício, quem quer que faça
  a cozinha.*
- **Visão:** *Qualquer cozinha na Terra pode cozinhar qualquer receita com segurança, e a boa comida chega às pessoas
  em vez do lixo.*
- **Por que a mudança:** "end world hunger" permanece como a razão de longo prazo, relatada com evidências.
  Cookwala contribui para isso através de menos desperdício, resgate de alimentos e cozinha mais barata, juntamente
  com os programas, financiamento e políticas que a fome necessita.

### 3.3 A história

> Robôs domésticos estão chegando: Figure 03, 1X NEO e robôs de cozinha estão sendo enviados ou aceitando
> pedidos. Eles estão aprendendo a se mover, mas ninguém escreveu, de uma forma que uma máquina possa
> verificar, o que "simmer" significa, quando o frango está seguro, ou como se faz a molokhia de uma avó.
> Cada fabricante escreve suas próprias receitas fechadas, principalmente de algumas culinárias.
>
> Cookwala começou a partir das receitas caseiras egípcias de uma família no fifi.cooking e fez uma pergunta
> simples: como você entrega uma receita para uma máquina e sabe que ela irá cozinhá-la com segurança?
>
> A resposta é um padrão aberto. Ele diz o que fazer, quando cada etapa é concluída e o que nunca deve
> acontecer. O dispositivo verifica isso antes de aquecer qualquer coisa e apresenta refusal before heat em vez de
> tentar adivinhar. As mesmas receitas funcionam para pessoas e food banks hoje, e permitirão que robôs
> aprendam cada culinária na Terra amanhã, com crédito aos cozinheiros que os ensinaram.

*(O fundador deve confirmar e personalizar a frase de origem. O autêntico supera o polido.)*

### 3.4 Message house

| Pilar | Promessa | Prova que podemos mostrar hoje |
|---|---|---|
| **Safe by design** | Dispositivos recusam em vez de adivinhar, e impõem limites localmente | Operation envelopes para 32 operações; safety-limits pack; dry run; conformance |
| **Verifiable** | Qualquer pessoa pode verificar uma receita, um dispositivo e um registro | Assinaturas, revogação de chaves, checkpoints de event-log; 106 vetores incl. resultados RFC |
| **Open and neutral** | Livre de royalties, agnóstico a modelo, agnóstico a dispositivo | Licenças; caminho de governança; sem API keys |
| **Every cuisine** | Construído a partir de culinária caseira real, multilíngue | corpus fifi.cooking; Árabe e Inglês; world-cuisines plan |
| **Useful before robots** | Cozinhas e food banks beneficiam-se now | Humanitarian Profile, SMS/CSV, rule pack, concept note |
| **Learns with consent** | Culinária real torna-se robôs melhores, com crédito | Consentimento ExecutionLog; exportação LeRobot; traces OTel |

### 3.5 Regras de linguagem
- **Use:** recipe, step, done, safe, check, refuse, kitchen, cook, open, verify, consent.
- **Evite:** "revolutionary", "first and largest" (até que seja verdade), "end hunger" (como manchete),
  "AI-powered" (vago).
- **Rotule cada número** como *measured*, *modelled* ou *assumed*.
- **Diga "now / next / later"** em vez de implicar que algo existe quando não existe.

---

## 4. Públicos e seu primeiro sucesso

| Público | Tarefa a ser realizada | Primeiro sucesso (≤ 15 min) | Depois |
|---|---|---|---|
| **Fabricantes de robôs e eletrodomésticos** | Lançar recursos de culinária sem escrever cada receita, com segurança | Realizar o dry run do perfil do dispositivo contra 5 receitas; ver aceitar/recusar por etapa | Implementar a Core API (reference hub), passar na conformance, publicar o dispositivo no registry |
| **Construtores de agentes de IA** | Permitir que agentes planejem refeições e peçam comida sem danos | Adicionar o servidor Cookwala MCP; executar o benchmark de agent-safety no modelo deles | Usar AgentMandate e o dry run antes de agir |
| **Cozinhas e food banks** | Resgatar surplus com segurança, planejar menus nutritivos | Enviar uma oferta por SMS, ou preencher o CSV; ver a verificação do rule pack | Pilotar com o Humanitarian Profile |
| **Cozinheiros e criadores de receitas** | Manter suas receitas vivas e creditadas | Converter uma receita com o editor; vê-la passar na validação | Contribuir com gravações (consentidas); aparecer nos créditos |
| **Pesquisadores e revisores** | Dados, benchmarks, assumptions honestas | Executar um simulador; ler a crítica e a suite de conformance | Usar datasets; publicar reviews |
| **Financiadores e formuladores de políticas** | Ver impacto, riscos e governança | Ler o resumo do whitepaper de 2 páginas e a concept note | Financiar pilotos; participar da governança |

---

## 5. Arquitetura do produto: o que o Cookwala oferece

| Camada | Now | Next | Later |
|---|---|---|---|
| **Standard** | Core 0.2, profiles (draft / experimental) | Core 0.3 após o primeiro feedback de dispositivo | Core 1.0 sob uma foundation |
| **Index and registry** | Receitas de exemplo; registry spec | corpus fifi.cooking convertido (1,881 recipes, Arabic + English); namespaces verificados | Coleções da comunidade, world cuisines |
| **Tools** | Validator, reference library, dry run, conformance, exporters | `pip install cookwala` (CLI + library); JS/TS SDK | Editor de receitas (web) |
| **Reference hub** | Core API spec | Docker hub com um dispositivo simulado, para que o quickstart `curl` funcione localmente | Kit Hardware-in-the-loop |
| **Bindings** | ROS 2 actions, Matter, LeRobot, OpenTelemetry | ROS 2 package; MCP server; Open-RMF task | Benchmark Isaac Lab "cook in simulation" |
| **Safety** | Limits pack, recalls, incidents, agent benchmark | Limites revisados; resultados públicos de agent-safety | Certification scheme com um certifier |
| **Humanitarian** | Profile, rule pack, templates, concept note | Piloto de food-bank no Egito | Adoção da rede de food-bank |
| **Data** | ExecutionLog com consentimento | Rede de contribuidores, primeiro dataset com consentimento | Benchmark multi-cuisine no Hugging Face Hub |

---

## 6. Website

### 6.1 Sitemap

```
/                 Home: one sentence, triad, live dry run, pathfinder, loop, proof, now/next/later
/why/             Why Cookwala: the problem, the story, the three goals told honestly
/impact/          Hunger, health, environment, economy, culture; every number labelled; what we don't know
/for/<group>/     One page per stakeholder group (developers, companies, providers, food, humanitarian,
                  health, education, government, capital, thought, everyone): message, options, first
                  success, flow, how it advances their work and society
/developers/      Quickstart, docs, API reference, SDKs, CLI, conformance, bindings, evals
/docs/            Documentation (rendered pages; /docs/?p=NAME keeps working)
/playground/      Live dry run with a device builder and shareable results, envelope explorer, simulators explained
/sim/...          Home, city, country, world simulators (unchanged URLs)
/registry/        Browse recipes, devices, rule packs, extensions, benchmarks; publish flow; directory of organizations (empty-state ready)
/humanitarian/    Food banks and kitchens: profile, SMS walkthrough, four flows, pilot protocol, concept note
/farmers/         Surplus by SMS; fair signals (next, after counsel review)
/education/       Lesson kit, research topics, open problems
/policy/          Brief and model language
/investors/       Opportunity, timing, business model, roadmap, risks, governance; no financial promises
/whitepaper/      Web and PDF
/deck/            12 to 15 slides, keyboard-navigable, shareable
/ideas/           Essays for thinkers
/trust/           Safety, privacy, security, governance, critiques, conformance, status
/roadmap/         Now / next / later with a status on every item
/contribute/      RFCs, translation, vectors, recipes, reviews; community; contact
/ar/...           Every page above in Arabic, right-to-left
/.well-known/     cookwala.json, security.txt · /llms.txt · /v1/...
```

### 6.2 Página inicial, de cima para baixo

| # | Seção | Propósito | Conteúdo |
|---|---|---|---|
| 1 | **Hero** | Dizer o que é em um fôlego | One-liner, tríade, dois botões (*Try the dry run*, *Read the quickstart*); chip de status honesto "Draft standard · v0.2" |
| 2 | **Live demo** | Mostrar, não apenas falar | "Can this device cook this recipe?" Escolha uma receita e um dispositivo; cada etapa mostra done / person / refuse, com a rule que decidiu |
| 3 | **The problem** | Fazer o gap ser sentido | Robôs estão chegando; "simmer" significa coisas diferentes; receitas fechadas de poucas culinárias; comida desperdiçada enquanto pessoas passam fome |
| 4 | **The loop** | Um modelo mental | Describe → Check → Cook → Learn, cada um com o artifact e o command |
| 5 | **Pick your path** | Roteirizar cada visitante | Cinco cards (seção 4), cada um com um primeiro sucesso |
| 6 | **Proof** | Momentum e honestidade | Contadores ao vivo de `/v1/stats.json` (operations definidas, conformance vectors, schemas, receitas publicadas, idiomas); cada número rotulado |
| 7 | **Safety** | Confiança | Safety é local; refusal; agent rules; recalls; link para /trust |
| 8 | **Works today** | Utilidade antes dos robôs | Humanitarian Profile, exemplo de SMS, simuladores |
| 9 | **Now / next / later** | Roadmap honesto | Da seção 5 |
| 10 | **Open** | Neutro e convidativo | Licences, caminho de governança, contribuir, GitHub |

### 6.3 Direção de design
- **Sensação:** calma, precisa, calorosa. Um instrumento profissional com alma de cozinha.
- **Tipo:** uma grotesque precisa para UI e uma mono face para dados e código. Tipo de exibição grande e leve para o hero (emprestando a confiança da Figure), sem copiar sua escuridão cinematográfica.
- **Cor:** papel e tinta neutros com um destaque de calor (ember orange) que também marca os dados de temperatura. A paleta é validada para leitores daltônicos, e tanto os temas claros quanto os escuros são projetados.
- **Imagens:** mãos reais e cozinhas domésticas reais assim que as tivermos, nunca robôs de banco de imagens. Até lá, diagramas e a live demo conduzem a página.
- **Movimento:** um momento, o dry run passo a passo. Todo o resto é estático.
- **Bilíngue desde o início:** Inglês e Árabe (layout da direita para a esquerda), depois outros.
- **Acessibilidade:** WCAG 2.2 AA; teclado; movimento reduzido; sem informação apenas por cor.

### 6.4 Interatividade
1. dry run no navegador (receita × dispositivo).
2. Explorador de envelope: arraste um traçado de temperatura e veja quando ele sai de "simmer".
3. Simuladores, com o protocolo ligado e desligado.
4. Visualizador de etapa de receita: a frase de uma etapa, seu JSON e seu envelope lado a lado.
5. Later: um editor de receitas que valida enquanto você digita.

---

## 7. Documentação

Organizado pelo framework Diátaxis, de modo que cada página tem um objetivo:

| Tipo | Propósito | Páginas |
|---|---|---|
| **Tutorials** | Aprender fazendo | Quickstart; Your first Cookwala recipe; Make a device Cookwala-ready; Add Cookwala to an agent; Run a food-rescue pilot with SMS |
| **How-to guides** | Resolver uma tarefa | Dry-run a device; Sign and verify; Publish to the registry; Export logs to LeRobot or OpenTelemetry; Run the agent-safety benchmark; Report an incident; Issue a recall |
| **Reference** | Consultar informações | Core spec; schemas; Core API; ROS 2 actions; vocabularies; conformance vectors; CLI |
| **Explanation** | Entender o porquê | Why envelopes; safety is local; trust model; privacy; humanitarian design; critiques and responses; simulators and their limits |

**Ergonomia de Docs:**
- navegação à esquerda, busca, "Copy page", "Edit on GitHub", links previous/next;
- abas de linguagem (Python / JavaScript / cURL / CLI);
- `llms.txt` e markdown por página para leitores de IA;
- uma cheat sheet e uma página de common-problems;
- um changelog com datas.

---

## 8. API e SDK

| Entregável | O quê | Por quê |
|---|---|---|
| Pacote Python `cookwala` | `validate`, `hash`, `verify`, `dryrun`, `export`, `conformance` (de `tools/`) | Um comando para o primeiro sucesso |
| `@cookwala/sdk` (TypeScript) | Tipos gerados de schemas; Cliente da Core API; dry run no navegador | Desenvolvedores web e de agentes |
| Reference hub (Docker) | Core API com um dispositivo simulado e os limites de segurança | O `curl` do quickstart funciona localmente; leito de teste para makers |
| Servidor MCP | Ferramentas: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_mandate` | Todo agente capaz de MCP pode usar Cookwala com segurança |
| Pacote ROS 2 | `cookwala_msgs` (actions), um nó de ponte para a Core API | Makers de robôs |
| Exporters | LeRobot, OpenTelemetry (feito) | Aprendizado e observabilidade |
| Evals | benchmark promptfoo agent-safety (feito) | Construtores de agentes, revisores de segurança |
| Versionamento | Semver para Core; pacote de schema datado; changelog; janelas de deprecation | Promessa de estabilidade |
| Status | Página de status pública para endpoints de cookwala.ai | Confiança |

---

## 9. Demos

| Demo | Público | Status |
|---|---|---|
| In-browser dry run | Todos | Building now |
| Simuladores (casa, cidade, país, mundo) | Todos, financiadores | Live |
| Resultados de agent-safety entre modelos | Construtores de agentes, laboratórios de IA | Next (run the benchmark, publish results with method) |
| Passo a passo de SMS food-rescue | Food banks | Next (recorded demo) |
| Um dispositivo real cozinhando uma receita Cookwala, sem edição | Todos | Later (the most important demo; needs a device partner) |
| "Cook in simulation" (Isaac Lab / Gazebo) | Pesquisadores de robótica | Later |

---

## 10. Comunidade e crescimento

- **Rede de colaboradores** (inspirada no Figure's Index):
  - *Cozinheiros* registram sessões consentidas de receitas que conhecem, com crédito em cada receita e
    dataset card.
  - *Cozinhas e food banks* em piloto.
  - *Makers* implementam dispositivos.
  - *Revisores* revisam rule packs e envelopes.
  - *Tradutores* traduzem passos e vocabulário.
  - Contribuições pagas vêm later, financiadas por subsídios. Nunca pague por dados sem consentimento
    informado e termos justos.
- **Rituais:** chamada comunitária mensal; "estado do Cookwala" trimestral com números reais;
  threads de revisão pública.
- **Sequência de parceria:** os dez primeiros do stakeholder tracker (food bank, WFP
  Innovation Accelerator, Home Assistant, uma startup de dispositivos, um laboratório universitário, um certifier,
  World Central Kitchen, uma fundação, um lar neutro, um criador).
- **Canais:** GitHub Discussions, uma newsletter, palestras em conferências (ROSCon, workshops de IROS/ICRA,
  eventos de food-tech), canais em língua árabe.

---

## 11. Métricas

- **Métrica North-star:** *verified cooks*, o número de execuções que rodaram uma receita Cookwala assinada de ponta a ponta com um log consentido e em conformance. Enquanto isso for zero, acompanhe os leading indicators.

| Funil | Métrica | Meta até 2027-03 |
|---|---|---|
| Atrair | Visitantes mensais para /start | 2.000 |
| Ativar | dry run concluídos (web + CLI) | 500 |
| Construir | Implementações Independent Core passando em conformance | 2 |
| Adotar | kg resgatados em piloto de food bank (measured) | Primeiro piloto de 6 meses em execução |
| Contribuir | Contribuidores externos com mudanças mescladas | 15 |
| Confiar | Revisões externas publicadas | 6 |
| Aprender | execution logs consentidos | 1.000 |

---

## 12. Roadmap

O roadmap mantido com um status por item é [`ROADMAP.md`](ROADMAP.md). A tabela abaixo é o plano original de 180 dias, mantido para registro.

| Quando | Website e história | Experiência do desenvolvedor | Padrão e segurança | Comunidade |
|---|---|---|---|---|
| **Now (este lançamento)** | Nova página inicial com live dry run, triad, paths, proof, now/next/later; docs viewer; `llms.txt`; páginas de confiança (security, governance) | Dry run; exportadores LeRobot e OTel; ROS 2 actions; agent-safety benchmark | Especificação do registry (namespaces, versions, hashes) | CONTRIBUTING, GOVERNANCE, SECURITY |
| **Próximos 30 dias** | /start quickstart; página inicial em árabe; claims pass em todas as páginas | `pip install cookwala`; hub de referência (Docker) | Primeiros resultados de benchmark publicados | Concept note para food bank; proposta para Home Assistant |
| **60 dias** | índice /recipes com fifi corpus (primeiros 100 convertidos); /humanitarian | TS SDK; MCP server | Revisão do operation envelope por um cientista de alimentos | Primeira chamada da comunidade |
| **90 dias** | Whitepaper + resumo de 2 páginas; /roadmap | Pacote ROS 2 | Core 0.3 a partir do feedback do dispositivo | Parceiro de dispositivo, laboratório universitário |
| **180 dias** | Vídeo de demo com dispositivo real | Editor de receitas | Análise de lacunas do certifier | Resultados do piloto; aplicação para fundação |

---

## 13. Riscos para esta estratégia

| Risco | Mitigação |
|---|---|
| Um site polido sobre uma realidade rasa parece hype | Cada afirmação rotulada; contadores ao vivo de dados reais; now/next/later |
| Espalhar-se por muitos públicos | Dois caminhos primários para os próximos 90 dias: fabricantes de dispositivos e food banks. Outros são suportados, mas não perseguidos |
| Grandes plataformas lançam alternativas fechadas | Seja a camada neutra e verificável que eles podem adotar; faça parcerias com players abertos (Hugging Face, Open Robotics, Home Assistant) |
| Uso indevido de dados de contribuidores | Consentimento opt-in e revogável; sem dados pessoais; data cards publicados |
| Largura de banda do fundador | Entregue a experiência do desenvolvedor (package, hub) antes de mais especificações; recrute um co-maintainer |

