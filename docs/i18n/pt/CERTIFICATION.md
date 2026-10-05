<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CERTIFICATION.md -->
# Conformance e o caminho para a certification

**Status:** rascunho, 2026-10-04 (RFC-0008). Nenhum certificador foi engajado ainda; este é o caminho
que o padrão oferece.

## 1. Três passos

| Passo | Quem | O que significa | Exibido como |
|---|---|---|---|
| **Self-declared** | O fabricante ou editor | Executou os vetores públicos com a ferramenta pública e publicou um `ConformanceReport` (`schemas/conformance.schema.json`), assinado com sua própria chave | o relatório, com os suites e contagens; nunca um selo |
| **Verified** | Um operador de registry | Reproduziu a execução contra o mesmo hash de conjunto de vetores e coassinou o relatório | o relatório mais o verifier |
| **Certified** | Um certifier independente (nenhum existe hoje) | Executou o suite mais verificações de hardware e safety-case sob um esquema publicado e concedeu a marca | o relatório, o certifier, a marca |

Um relatório que falha em qualquer vetor de uma classe não pode reivindicar essa classe. O registry mostra relatórios, não badges.

Hoje o único operador de registry é o mantenedor da especificação (cookwala.ai), portanto "verified" não adiciona nenhuma independência até que um segundo registry exista; o status ainda é mostrado como self-verification.

## 2. O que um relatório contém

Versão principal, a classe reivindicada (`recipe_publisher`, `executor`, `catalog`, `agent`,
`verifier`) ou uma reivindicação de perfil (`humanitarian:H1`, `household`, `registry`, `fleet`,
`supply`), o assunto (produto, fornecedor, versão), as suites executadas com totais e ids de
vetores que falharam, o hash do conjunto de vetores, a ferramenta e o commit, a data, o status e o
verifier. Exemplo: `examples/conformance/report-reference.json`, produzido por

```bash
python tools/run_conformance.py --report report.json
```

## 3. Classes e o que elas provam

| Classe | Vetores | Também necessário para certification (não coberto por vetores) |
|---|---|---|
| Recipe publisher | hash, envelope (targets inside bands), units | content review de receitas por um profissional de food-safety |
| Executor | envelope, sensor ladder, execution transitions, refusal reasons | o próprio safety case do dispositivo (ISO 13482, IEC 60335, UL 3300 conforme aplicável); local stop latency measured; safety limits enforced sem rede |
| Catalog | hash, signature, key revocation, recalls | custódia de chaves e processo de incident intake |
| Agent | untrusted text, mandate scope (agent-safety benchmark) | resultados publicados por model com método |
| Verifier | todos os Core suites | nenhum |
| Humanitarian H0–H3 | SMS grammar, state machine, rule packs | data-responsibility review; sem personal data audit |
| Household | disclosure policy | data-protection impact assessment |
| Registry | name and version rules, tombstones | namespace proof process |

## 4. O que a certification não pode prometer

Um relatório de conformance prova que o software se comportou como os vetores exigem no dia em que foi executado.
Ele não prova que um dispositivo é seguro em todas as cozinhas, que uma receita tem o sabor correto, ou que
nenhum dano pode acontecer. Um padrão que prometesse zero dano seria desonesto; este promete
que os limites são aplicados localmente, que refusals acontecem before heat, e que os registros podem ser
verificados.

## 5. Governança da marca

A marca de certification e suas regras movem-se para a fundação neutra com a marca registrada (`GOVERNANCE.md`). Até lá nenhuma marca existe; apenas relatórios existem.

