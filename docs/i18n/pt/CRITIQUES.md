<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/CRITIQUES.md -->
# Críticas que publicamos

Fizemos perguntas difíceis sobre o Cookwala e anotamos as respostas. Cada preocupação possui um id no [action plan's concern register](ACTION-PLAN.md#2-concern-register), juntamente com nossa resposta e seu status. Revisões externas são bem-vindas e serão listadas aqui.

## Isso vai funcionar? (strategy)

| Preocupação | Resposta curta | Status |
|---|---|---|
| O mercado ainda não existe; a especificação está à frente dos produtos | Small Core, demo primeiro, sem nova especificação sem usuários | Core 0.2 concluído; demo do dispositivo next |
| Ninguém poderoso tem um motivo para adotar | Liderar com o ganho de cada adotante; útil sem robôs | Piloto de food-bank e parceiro de dispositivo buscados |
| Os simuladores provam o que eles assumem | Baseline justa, intervalos, rótulos "ilustrativos"; pilotos os substituem | Open |
| A fome é sobre pobreza e conflito, não surplus | Cookwala contribui; não afirma acabar com a fome sozinha | Mensagem alterada |
| Segurança, responsabilidade e superfície de ataque | Limites aplicados no dispositivo; refusal; recalls; relatórios de incidentes | Spec concluída; revisão do certifier open |
| Privacidade (dados de saúde e religião, ledgers vs apagamento) | Local-first, divulgação seletiva, logs apenas com hash, consentimento | Spec concluída; avaliação de impacto open |
| Complexo demais | Core 0.2; todo o resto marcado como experimental | Done |
| Dependência do fundador | Caminho de governança para um lar neutro | GOVERNANCE.md |

## O design técnico é sólido?

| Preocupação | O que mudou no Core 0.2 |
|---|---|
| Operações não tinham significado físico | Envelopes, níveis de calor, sensor ladders, regra de altitude, vetores de teste |
| Bugs de unidade e número | Apenas °C, tolerâncias absolutas, unidades de cozinha, densidades, dinheiro decimal |
| Schemas aceitavam erros de digitação | Schemas estritos com extensões `x-`; bundle offline |
| Um documento Mission mutável | Event log + projeção, sequenciador único, tabela de transições |
| O ledger provava pouco | Registros de chave com revogação, checkpoints testemunhados, detecção de reescrita |
| Entrega de evento indefinida; segurança no bus | Números de sequência, classes de latência, heartbeats, "safety is local" |
| Superfícies de API derivam | Core OpenAPI; cada referência verificada no CI |
| Sem verifier | Biblioteca de referência e 106 vetores de conformance |

## Avaliações que estamos solicitando

W3C TAG (identity, JSON-LD), IETF SCITT (event-log transparency), cientistas de alimentos
(envelopes), oficiais de segurança alimentar e dietistas (rule packs), uma auditoria de segurança, uma
revisão de proteção de dados e uma análise de lacunas de um certificador. Veja o
[external review program](ACTION-PLAN.md#5-external-review-program-sequenced).

