<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/FEDERATION.md -->
# Federação: como Cookwala funciona sem um centro

**Status:** rascunho, 2026-10-04 (RFC-0006). A foto do fundador era uma colmeia: sem comando central, mas com harmonia e recuperação. Esta página diz o que isso significa na prática.

## 1. Nós

| Nó | O que ele serve | Quem executa um |
|---|---|---|
| **Catalog** | `/.well-known/cookwala.json`, receitas, vocabulários, rule packs, chaves, feeds | um editor de receitas, uma rede de food bank, uma universidade, um fabricante de dispositivos, cookwala.ai |
| **Registry** | `/v1/registry.json`: ponteiros para catalogs, collections, devices, packs, benchmarks | qualquer pessoa; cookwala.ai executa um |
| **Hub** | a Core API para uma cozinha, limites de segurança locais, o household context | cada cozinha; funciona offline |
| **Mirror** | republica itens assinados de outros nós sem alterações | qualquer pessoa que queira resiliência em sua região |

Uma pasta estática é um catálogo válido. Um telefone com os templates CSV é um participante humanitário válido no nível H0.

## 2. Feeds, não comandos

Nós publicam feeds assinados: recalls, incidentes anônimos, mudanças no registry, registros de chave.
Outros nós consultam o que confiam e podem republicar. Nada é enviado para uma cozinha; uma
cozinha puxa quando está online e continua trabalhando quando não está.

## 3. Verifique contra o emissor, nunca contra o relay

Um recall que chega através de um mirror é tão bom quanto a assinatura do **issuer**. Um hub resolve o `KeyRecord` do issuer a partir do próprio documento de descoberta do issuer ou did:web e verifica o corpo byte por byte. A chave do mirror não prova nada sobre o conteúdo; um mirror que edita um recall quebra a assinatura. Vetores de perfil em `conformance/profiles/federation.json` mostram os três casos.

## 4. Listas de confiança

Cada hub mantém uma lista de catálogos e registries nos quais confia, com suas chaves e uma prioridade. Um node pode sugerir peers (`federation.peers`); o hub decide. cookwala.ai é uma entrada em tal lista, não um root.

## 5. Frescor

As entradas do registry carregam um status e um tempo de publicação; recalls carregam um tempo de emissão; facets de household carregam uma validade. Itens obsoletos são buscados novamente ou descartados. Nada é confiável apenas por ser antigo, nada é deletado silenciosamente: entradas retiradas permanecem como tombstones.

## 6. Histórico

Logs de eventos com checkpoints testemunhados (Core section 5) tornam as reescritas detectáveis sem uma
blockchain: uma segunda parte assina o cabeçalho do log, e uma reescrita later não
corresponde mais. O ancoramento público dos cabeçalhos de checkpoint é opcional e é uma decisão dos fundadores
(`docs/research/BACKSTORY.md` section 4.7).

## 7. Três nós que interoperam

- **Uma rede de food bank** gerencia um registry de suas cozinhas e doadores, um catálogo de seus rule packs adaptados à lei nacional e um gateway de SMS. Ela se lista no directory cookwala.ai ou não; seus dados nunca precisam sair de seu país.
- **Um fabricante de dispositivos** gerencia um catálogo de seus documentos de capacidade e safety-limit packs, publica relatórios de conformance e consulta os feeds de recall dos catálogos que seus clientes utilizam.
- **Um laboratório universitário** gerencia um catálogo de receitas de benchmark e execution logs (com consentimento), espelha os vocabulários e publica seus próprios vetores.

Nenhum deles precisa que o cookwala.ai esteja online.

## 8. O que não é construído

Um orquestrador central, um provedor de identidade central, um token, uma blockchain. As decisões de quórum e os orquestradores do perfil da Missão permanecem opcionais e experimentais.

