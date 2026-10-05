<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/STAKEHOLDERS.md -->
# Stakeholders: uma mensagem, opções, um primeiro sucesso e um fluxo para todos

**Status:** 2026-10-04. Para cada grupo: por que o Cookwala é importante para eles, formas de engajamento do leve ao profundo, um primeiro sucesso em menos de 15 minutos, o caminho após isso, e como o engajamento avança o trabalho deles e o mundo. Nada aqui nomeia um parceiro, um usuário ou um piloto que não exista. Onde algo está planejado, diz next ou later.

Os três objetivos por trás de cada linha: ajudar a acabar com a fome, tornar as pessoas mais saudáveis, colocar robôs para trabalhar para as pessoas.

---

## 1. Builders: desenvolvedores, fabricantes de robôs e eletrodomésticos, engenheiros de sistemas embarcados, construtores de agentes de IA, desenvolvedores de smart-home e plataformas, contribuidores de código aberto

**Mensagem.** Robôs e eletrodomésticos estão aprendendo a se mover. Ninguém escreveu, de uma forma que uma máquina possa verificar, o que "simmer" significa, quando o frango está seguro ou quando um passo deve sofrer refusal before heat. Cookwala é essa camada: receitas que uma máquina pode planejar, condições de término que ela pode medir e limites de segurança que ela impõe a si mesma. É aberto, livre de royalties, neutro em relação ao modelo e neutro em relação ao dispositivo, e vem com um suite de conformance que você pode executar hoje.

**Opções.**
- *Light:* execute o dry run do navegador; leia o Core 0.2 (uma noite).
- *Medium:* `pip install -e sdk/python`, faça o dry-run das capacidades do seu dispositivo contra as
  receitas de exemplo, execute os vetores de conformance, inicie o hub de referência.
- *Deep:* implemente a Core API em um dispositivo ou em um hub, publique um relatório de conformance, adicione
  seu dispositivo ao directory, proponha um RFC, escreva um nó de ponte ROS 2, adicione casos de ataque
  ao benchmark de agent-safety.

**Primeiro sucesso (menos de 15 minutos).**
```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala && pip install -e sdk/python
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json
# refused: cw.op.boil, missing_capability (and later: no oil thermometer, no deep frying)
cookwala dryrun examples/koshari.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json          # 106 vectors; a signed-ready report
```

**Fluxo.** Dry run → implementar a Core API contra o hub de referência → passar na conformance →
publicar o relatório → listar o dispositivo → os execution logs consentidos tornam-se datasets LeRobot e
traces OpenTelemetry.

**Como isso avança o trabalho deles.** Uma definição de tarefa e teste de sucesso compartilhados para cozinhar, com
um benchmark público para medição; receitas em todas as culinárias sem escrevê-las; uma
história de segurança que os reguladores podem ler; relatórios de conformance como um documento de vendas; posição de pioneiro
em um padrão que será governado por seus implementadores.

**Como ele faz a sociedade avançar.** Menos incêndios na cozinha e doenças transmitidas por alimentos provenientes de máquinas que apresentam refusal before heat em vez de apenas supor; máquinas que herdam as culinárias do mundo em vez de apenas algumas.

---

## 2. Empresas: startups, empresas, empresas de alimentos, mercearias e entrega, restaurantes e serviços de alimentação, seguradoras, certificadoras, equipes de vendas e parcerias

**Mensagem.** Toda empresa que lida com alimentos encontrará máquinas de cozinha e agentes de IA nos próximos anos. A Cookwala oferece uma interface para todos eles, a única com limites de segurança aplicados no dispositivo e registros que você pode auditar. Para mercearias e entregas: receba janelas de entrega e requisitos de alérgenos, nunca o cronograma de uma família. Para seguradoras e certificadoras: um formato de relatório de conformance e um feed de relatório de incidentes projetado para você.

**Opções.**
- *Light:* leia a página de Investidores e parceiros e as páginas de confiança; mapeie seus produtos para as classes de ingredientes e operações.
- *Medium:* publique um feed de oferta (perfil de mercado, experimental) ou uma oferta de surplus para um programa local (Humanitarian Profile); execute o benchmark de agent-safety no agente que você planeja implantar.
- *Deep:* implemente a Core API em um produto; patrocine uma verificação de conformance; junte-se ao steering committee quando ele for formado; adote o caminho de certification.

**Primeiro sucesso.** Converta uma linha de produtos em uma `Offer` de mercado com GTINs e credenciais de alérgenos, valide-a e veja quais receitas de exemplo ela pode fornecer.

**Fluxo.** Oferecer feed → derived constraints de households → pedidos através do seu próprio checkout → eventos de fulfilment → reputação a partir de execution reports (com consentimento).

**Como isso avança o trabalho deles.** Acesso a uma camada neutra em vez de uma dúzia de integrações de fornecedores; sinais de demanda (later, após revisão de leis de concorrência) que reduzem o desperdício; certification que seguradoras podem precificar; um registro público de segurança.

**Como ele faz a sociedade avançar.** Menos comida perdida entre a loja e o prato; surplus chegando às cozinhas antes de apodrecer; máquinas em lares que não podem ser convencidas a realizar ações inseguras.

---

## 3. Provedores: mercearias, fazendas e cooperativas, entrega, energia, fornecedores de IA e modelos, editores de receitas

**Mensagem.** Provedores conectam-se ao Cookwala como pares, não como locatários. Um merceeiro ou serviço de entrega recebe uma constraint, nunca os fatos de uma household. Um fornecedor de IA recebe um benchmark que mostra que seu modelo é seguro em uma cozinha e um servidor MCP para usar hoje. Um editor de receitas mantém seu nome em cada receita e pode publicar um catálogo assinado a partir de uma pasta estática.

**Opções.** Publicar um catálogo (receitas) · publicar um feed de ofertas · executar o benchmark de agent-safety · executar um nó de registry · oferecer surplus por SMS.

**Primeiro sucesso.** Publicador de receita: `cookwala init my-dish`, editar, `cookwala validate`,
`cookwala hash`; seu catálogo é uma pasta com `/.well-known/cookwala.json`. Fornecedor de IA:
adicione o servidor MCP e execute os dez casos de agent-safety.

**Fluxo.** Catálogo ou feed → entrada no registry sob seu namespace comprovado → recall do feed se algo der errado → reputação a partir dos resultados.

**Como isso avança o trabalho deles.** Alcance cada dispositivo e agente através de um único formato;
crédito e proveniência por assinatura; um benchmark de segurança que é um ativo de marketing quando
passado honestamente.

**Como isso faz a sociedade avançar.** As receitas permanecem atribuídas; agentes que agem por pessoas são
measured antes de serem confiados.

---

## 4. Alimentos: agricultores, cozinheiros e chefs, cozinheiros domésticos, criadores de receitas, escolas culinárias

**Mensagem.** Uma receita escrita para Cookwala mantém seu nome e sua culinária vivos em cada
dispositivo que a cozinha, com os passos que uma máquina nunca deve pular escritos. Uma fazenda com um
excesso pode listá-lo por SMS e alcançar uma cozinha no mesmo dia. Uma escola culinária pode ensinar a
segurança alimentar com um formato que se verifica sozinho.

**Opções.**
- *Agricultores:* `FARM 120KG TOMATO A BB0411` para o gateway de um programa (onde um existir);
  later, leia os sinais de oferta e demanda.
- *Cozinheiros e chefs:* transforme uma receita que você sabe de cor em uma receita Cookwala; revise as
  sentenças de passo em seu idioma; later, grave sessões consentidas com crédito.
- *Escolas:* use as nove receitas de exemplo como casos de ensino; adicione as suas próprias.

**Primeiro sucesso.** Cozinheiros: `cookwala init`, escreva uma receita com uma condição de término para cada etapa de calor, valide-a. Agricultores: envie uma oferta por SMS para um programa que executa o perfil (nenhum executa ainda; o parser e os vetores existem).

**Fluxo.** Receita → validação → catálogo → dry run em dispositivos → execution logs mostram como ele
se comporta em máquinas reais → revisões com evidências.

**Como isso avança o trabalho deles.** Atribuição que viaja; uma receita que pode ser cozinhada por máquinas em outros países; para agricultores, uma maneira de transformar um surplus em refeições em vez de desperdício.

**Como isso faz a sociedade avançar.** Patrimônio culinário preservado como conhecimento prático, não vídeo;
menos desperdício na fazenda.

---

## 5. Humanitário: ONGs, food banks, cozinhas comunitárias, programas de merenda escolar, agências de ajuda, doadores

**Mensagem.** O Humanitarian Profile move surplus food para pratos com telefones e planilhas, registra verificações de cold-chain, conta refeições e não carrega **nenhum dado pessoal**. Ele funciona sem robôs, apps ou internet. Ele fornece números que você pode defender: quilogramas resgatados, refeições servidas, taxa de aprovação de nutrição, custo por refeição, tempo para reivindicação, incidentes de segurança, cada um com seu método.

**Opções.**
- *Light:* leia o perfil e o protocolo piloto; tente o passo a passo do SMS.
- *Medium:* execute os templates CSV em um site por quatro semanas (nível H0) e compute um
  resumo de impacto.
- *Deep:* um piloto pré-registrado de 12 semanas com uma linha de base e um avaliador independente;
  adapte os rule packs à lei nacional com seu líder de segurança alimentar; execute seu próprio nó de registry.

**Primeiro sucesso.** Preencha os três templates CSV para um dia, execute
`cookwala humanitarian --summary your-folder`, leia o `ImpactSummary` com um método sob
cada número.

**Fluxo.** Oferta → reivindicação → entrega com uma verificação de temperatura → distribuição → resumo de impacto → resultados publicados, o que quer que eles mostrem.

**Como isso avança o trabalho deles.** Números comparáveis entre sites; evidências para financiadores;
descobertas de segurança antes, não depois, de um problema; um formato que os sistemas dos doadores podem ler (mapeamentos HXL,
GS1, DHIS2).

**Como ele faz a sociedade avançar.** Mais comida chegando às pessoas com segurança, com sua dignidade intacta:
sem nomes, sem rostos, sem profiling.

---

## 6. Saúde: dietistas, oficiais de segurança alimentar, agências de saúde pública, lares de idosos

**Mensagem.** Regras de nutrição e segurança alimentar como pacotes verificáveis por máquina, derivados de orientações públicas, aplicados a menus e transferências, com sua revisão registrada por profissão e resultado. Nada é aconselhamento médico; nada é alegado além do que os pacotes dizem.

**Opções.** Revisar um pack com o template (duas horas) · adaptar um pack para regras nacionais ·
propor regras de cuidado para as pessoas que você atende · later, ler resultados agregados de programas.

**Primeiro sucesso.** Abra `profiles/humanitarian/care-vulnerable-groups.rulepack.json` e
o modelo de revisão; marque três regras como aprovadas, alteradas ou rejeitadas; arquive a revisão.

**Fluxo.** Draft pack → review → status reviewed → programs adopt → findings in every
distribution → outcomes published with methods.

**Como isso avança o trabalho deles.** Sua orientação ocorre em cada cozinha que a adota,
incluindo cozinhas robóticas, com sua profissão registrada; uma revisão publicável; um
conjunto de dados de descobertas (agregado, sem dados pessoais) para pesquisa.

**Como ele faz a sociedade avançar.** Menos sódio, açúcar e gordura saturada em refeições servidas em massa; manutenção de calor e resfriamento mais seguros; cuidado com crianças e idosos incorporado na máquina.

---

## 7. Educação: professores escolares, educadores, professores universitários, pesquisadores, estudantes

**Mensagem.** Cozinhar é o processo mais familiar do mundo, e o Cookwala o transforma em um
objeto de ensino: temperaturas, unidades, divisão justa, segurança, máquinas que seguem regras. Para
pesquisadores, é um benchmark, um formato de dataset e uma lista de problemas abertos.

**Opções.**
- *Professores:* o kit de lições (`docs/education/LESSON-KIT.md`): cinco lições de "o que é um
  simmer" a "o que uma máquina nunca deve fazer".
- *Professores e alunos:* a lista de tópicos de pesquisa, os simuladores, os vetores de
  conformance como condições de teste, o export do LeRobot, problemas abertos de escala de tese.
- *Pesquisadores:* publicar datasets de execuções consentidas; criticar as
  assumptions dos simuladores; propor vetores.

**Primeiro sucesso.** Professores: executem o dry run do navegador em classe e perguntem por que o dispositivo recusou. Alunos: alterem uma assumption no simulador da cidade e expliquem o resultado.

**Fluxo.** Lição → projeto → conjunto de dados → artigo → RFC.

**Como isso avança o trabalho deles.** Material gratuito, aberto e citável; um benchmark que ninguém possui;
coautoria no padrão por meio de RFCs.

**Como isso faz a sociedade avançar.** Uma geração que sabe o que é uma cozinha segura e consegue ler uma
folha de segurança.

---

## 8. Governo: governos, ministérios, autoridades municipais, reguladores, políticos e legisladores, órgãos governamentais e de padronização

**Mensagem.** Máquinas de cozinha domésticas e comerciais estão chegando sob regulamentações escritas para eletrodomésticos e software separadamente. Cookwala oferece aos reguladores algo concreto para apontar: limites de segurança aplicados no dispositivo, refusal before heat, registros assinados, relatórios de incidentes anônimos e um conjunto de conformance que qualquer um pode executar. Para a segurança de doação de alimentos, ele fornece um padrão de dados sem dados pessoais. É livre de royalties e caminha para uma governança neutra.

**Opções.** Leia o resumo de políticas (`docs/policy/BRIEF.md`) · use a linguagem do modelo para dados de doação de alimentos e segurança de máquinas de cozinha · peça ao seu órgão de normalização para revisar o Core 0.2 · execute um nó de registry nacional · financie um piloto com seu programa de merenda escolar.

**Primeiro sucesso.** Leia o resumo de duas páginas e verifique três coisas no repositório: o
safety limits pack, o conformance runner, as humanitarian data-protection rules.

**Fluxo.** Breve → revisão por um órgão nacional de normas → referência em orientações → piloto →
esquema de certification.

**Como isso avança o trabalho deles.** Uma base técnica pronta e revisável; evidências de pilotos; um canal para a indústria através de um padrão neutro; interoperabilidade com os padrões de dados humanitários que você já utiliza.

**Como ele faz a sociedade avançar.** Máquinas mais seguras em residências; resgate de alimentos que protege as pessoas que ele atende; menos desperdício nas cidades.

---

## 9. Capital: investidores, empreendedores, filantropias, bancos de desenvolvimento

**Mensagem.** A culinária está prestes a se tornar infraestrutura. O padrão é gratuito; os serviços ao seu redor são um negócio: certification, software de hub, conjuntos de dados consentidos, operações de registry, pilotos. A camada humanitária é um bem público que financiadores de desenvolvimento podem apoiar com avaliação pré-registrada. Nenhuma promessa financeira é feita em qualquer lugar deste site.

**Opções.** Leia a oportunidade, o modelo de negócio, o roadmap, os riscos e a governança
(`/investors`) · financie um pilot ou uma revisão · apoie uma empresa que vende serviços ao lado do
padrão gratuito · junte-se à governança como um observador financiador.

**Primeiro sucesso.** Leia as seções de problema, arquitetura e riscos do whitepaper e o registro de preocupações do plano de ação; cada risco aberto está listado.

**Fluxo.** Evidência (pilotos, conformance, adotantes) → gates no plano de ação → financiamento vinculado a gates → fundação neutra para o padrão, uma empresa para serviços.

**Como isso avança o trabalho deles.** Posição precoce em um padrão que define uma categoria com números honestos; uma empresa de serviços investível separada do bem público.

**Como ele faz a sociedade avançar.** O capital vai para o que é measured, não para o que é afirmado.

---

## 10. Pensamento: filósofos, eticistas, historiadores e futuristas

**Mensagem.** Quando uma máquina cozinha a receita de uma avó, quem detém o conhecimento? O que significa dignidade no cuidado automatizado? O que um robô de um household context pode saber, e quem mais pode saber?
Cookwala fez escolhas sobre estas questões em código; os ensaios (`docs/essays/`) dizem
o que foram e convidam ao desacordo.

**Opções.** Leia os ensaios · escreva uma resposta · proponha uma regra (um RFC é um argumento filosófico com um esquema) · participe da revisão ética do perfil do household context.

**Primeiro sucesso.** Leia o ensaio sobre dados de household e as regras de viagem do facet registry;
encontre um facet cujo default você alteraria, e diga o porquê.

**Fluxo.** Ensaio → comentário público → RFC → padrão alterado.

**Como isso avança o trabalho deles.** Um caso real onde posições éticas se tornam regras em execução,
com um registro público do argumento.

**Como isso faz a sociedade avançar.** Decisões sobre dados íntimos e herança cultural tomadas
abertamente antes que as máquinas cheguem a milhões de lares.

---

## 11. Todos: pessoas que se preocupam com a comida, o desperdício, os empregos, o clima e o futuro

**Mensagem.** Cookwala é uma forma de escrever uma receita para que qualquer pessoa, ou qualquer coisa, possa cozinhá-la com segurança, e uma forma para que o alimento que seria descartado chegue a alguém que precise dele. É gratuito, não pertence a nenhuma empresa e diz o que não sabe.

**Opções.** Tente o dry run · jogue um simulador · leia as receitas · escreva uma receita que você ama · siga o roadmap · conte a um food bank ou a uma escola sobre isso.

**Primeiro sucesso.** Altere o dispositivo no dry run e observe um passo ser recusado; leia o porquê.

**Fluxo.** Curiosidade → uma receita → uma conversa com uma cozinha que poderia usá-la.

**Como isso avança a vida deles.** Máquinas mais seguras no lar, suas próprias receitas preservadas, uma forma de ajudar sem dar dinheiro.

**Como ele faz a sociedade avançar.** Menos desperdício, alimentos mais seguros, máquinas que servem pessoas que não podem cozinhar para si mesmas e o tempo humano devolvido.

---

## 12. Empregos e dignidade, dito claramente

As máquinas de cozinhar mudarão o trabalho. Posições da Cookwala: humanos sempre podem cozinhar; os primeiros usos são para pessoas que não podem cozinhar para si mesmas e para cozinhas comunitárias que estão com falta de mãos; o nome de um cozinheiro permanece em uma receita onde quer que ela seja cozinhada; uma voz do trabalho tem um assento no comitê de direção; novos papéis (engenheiros de receitas, técnicos de robôs de comida, certifiers, revisores de rule pack) são nomeados sem prometer números.

## 13. Onde cada grupo se posiciona no site

| Grupo | Página |
|---|---|
| Builders | `/for/developers/`, `/developers/`, `/playground/` |
| Companies | `/for/companies/`, `/investors/` |
| Providers | `/for/providers/`, `/registry/` |
| Food | `/for/food/`, `/farmers/` |
| Humanitarian | `/for/humanitarian/`, `/humanitarian/` |
| Health | `/for/health/` |
| Education | `/for/education/`, `/education/` |
| Government | `/for/government/`, `/policy/` |
| Capital | `/for/capital/`, `/investors/` |
| Thought | `/for/thought/`, `/ideas/` |
| Everyone | `/`, `/why/`, `/impact/` |

