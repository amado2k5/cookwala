<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/SUPPLY-SIGNALS.md -->
# Excedente agrícola e sinais de oferta

> **Status: experimental** (RFC-0007). Schema: `schemas/supply.schema.json`. Examples:
> `examples/supply/`. **Gate:** competition-law review before any production use
> (`docs/ACTION-PLAN.md`, concern C7). cookwala.ai publishes no signals today.

## 1. Duas coisas que os agricultores precisam now

1. **Uma forma de listar um excedente antes que ele apodreça.** Uma fazenda é um doador no Humanitarian Profile:
   um `Offer` com `Item.origin: farm` e `harvestedAt`, ou por SMS:

   FARM 120KG TOMATO A BB0411
   ```

O food bank afirma, uma cozinha cozinha, a distribuição conta. Nenhum novo documento,
nenhum dado pessoal, apenas organizações.
2. **Um sinal justo do que será necessário.** Essa é a parte experimental abaixo.

## 2. Sinais de demanda e oferta

| Documento | Diz | Regras |
|---|---|---|
| `DemandSignal` | Na região R, na semana ISO W, cozinhas e programas planejaram usar entre L e H kg do **classe** C de ingrediente | pelo menos 20 fontes contribuintes; publicado pelo menos 7 dias após o fim da semana; nível de classe (legume, vegetal de folha, aves), nunca um produto ou marca; **sem preços**; região não mais detalhada que admin1, a menos que 100 fontes ou mais |
| `SupplySignal` | Na região R, na semana W, a classe C está em excesso, oferta normal ou escassa, com uma janela de colheita | publicado por uma cooperativa, programa ou operador de mercado; **aberto a todos**: público, gratuito, idêntico para cada leitor |

A verificação de referência é `check_signal()` em `tools/cookwala_ref.py`; os vetores de perfil (`conformance/profiles/signal.json`) mostram o que é aceito e rejeitado.

## 3. Por que estas regras

Compartilhar previsões entre concorrentes é a troca de informações sobre a qual as autoridades de concorrência alertam. Agregação, atraso, nível de classe, sem preços e publicação aberta mantêm o sinal útil para o planejamento e inútil para coordenar preços. Os limites são pontos de partida; um consultor e um estatístico devem defini-los.

## 4. O que a ideia do fundador se torna

O loop macro (RFC-0007): cozimento planejado → demanda agregada →
fazendas e lojas planejam precisar → menos cultivado, movido e descartado. Os simuladores da cidade, do país e do
mundo mostram o tamanho do efeito sob suas suposições (ilustrativo, não uma
previsão). Estes dois documentos são o menor passo honesto em direção a isso.

## 5. Later

Conselhos de plantio a partir da demanda futura; dimensionamento de reservas (uma cadeia de suprimentos perfeitamente enxuta é frágil); fluxos de alívio entre regiões; sinais de suprimento por SMS de cooperativas.

