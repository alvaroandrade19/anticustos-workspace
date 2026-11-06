# Números de base

Leia quando precisar de um ponto de comparação: "esse endividamento é alto?", "a bolsa está cara?", "essa concentração é demais?". Número isolado não diz nada; comparado com um marco histórico, diz. Cada linha traz fonte, data, nível de evidência (A = medido aqui ou fonte primária; B = dito pela própria casa, não conferido; C = terceiros) e como usar.

Regra de uso: **marco histórico é régua de ordem de grandeza, não limiar automático.** Antes de usar um número B num relatório, confira na origem ou rotule "segundo [fonte], não conferido". Para somar um número, use o mesmo formato e diga de onde veio.

## 1. Mercado brasileiro como um todo (decisão de alocação)

| Métrica | Valor | Quando | Fonte | Evid. | Como usar |
|---|---|---|---|---|---|
| Dívida líquida / EBITDA agregada das empresas da bolsa | ~1,0x | out/2022 | Tiago Reis, live Terra e Suno | B | Termômetro de saúde do mercado. Perto de 1x: balanços folgados. |
| Idem, na última crise | ~3,0x | 2015 | idem | B | Marco de estresse. Agregado indo para 3x é sinal de ciclo ruim. |
| P/L do Ibovespa | ~6x | out/2022 | idem | B | Nível que ele diz só ter visto em 2008. Inclui commodity no pico, que infla o lucro. |
| P/L do Ibovespa sem commodities | abaixo da média histórica (valor não dito) | out/2022 | idem | B | Sempre olhar com e sem commodity. |
| Earnings yield do índice | ~16% | out/2022 | idem (inverso de ~6x) | B | Ler contra a NTN-B longa, nunca contra a Selic (`valuation.md`). |
| Prêmio de ações (earnings yield menos NTN-B longa) | ~10 pontos, "dos maiores da série" | out/2022 | idem | B | Marco de bolsa muito descontada. Prêmio pequeno (poucos pontos) = bolsa cara contra o juro real. |
| Alta necessária para voltar à média histórica do prêmio | ~40% | out/2022 | idem | B | Exemplo de leitura, não previsão. Não conferido o que aconteceu depois por esta métrica. |
| Selic no momento da live | 13,75% | out/2022 | Banco Central | A | Contexto dos números acima. |

**O que aconteceu depois (medido, evidência A):** do pico da Selic em ago/2022, o Ibovespa fez 5,9% em 12 meses contra 13,6% do CDI e 19,8% em 24 meses contra 26,6% (só preço). Bolsa barata pelo prêmio não garantiu ganhar do CDI em dois anos. Tabela completa dos 8 picos da Selic desde 2000 na tensão 11 de `filosofias.md`: o Ibovespa bateu o CDI em 5 de 8 picos (12 meses) e 4 de 7 (24 meses).

## 2. Construção de carteira (tetos de referência)

| Métrica | Valor | Fonte | Evid. | Onde já está |
|---|---|---|---|---|
| Teto por empresa | 20% | fundo do Tiago Reis (SunoFIA, 2022) | B | alerta do `carteira.py` |
| Teto por setor | 30% | idem | B | alerta do `carteira.py` |
| Número de posições num fundo de ações diversificado | ~40 | idem | B | referência para quem quer diversificar como fundo |
| Peso das 10 maiores posições | ~65% | idem | B | concentração "normal" de gestor profissional |
| Maior setor e maior posição reais do fundo | 15% (bancos) e 10% | idem | B | o fundo opera bem abaixo dos próprios tetos |
| Blue chip / small cap por posição | 12% a 18% / 3% a 5% | exemplo do Raul Sena | C | faixas do `carteira.py` |

## 3. Empresa e setor (padrões para tese)

| Métrica | Valor | Fonte | Evid. | Como usar |
|---|---|---|---|---|
| Participação do líder num mercado fragmentado | ~6% (sementes de soja, Boa Safra, 2022) | Tiago Reis, live | B | Contraste com a linha abaixo para medir espaço de consolidação. |
| Participação do líder em mercado maduro | 20% a 25% | idem | B | Teto plausível de consolidação. Exige vantagem de escala provada nos números. |
| ROIC de negócio com pouco ativo (asset light) | ~30% (Boa Safra, 2022) | idem | B | Ordem de grandeza de negócio excelente; comparar com a Selic e o WACC. |
| Banco grande "barato" | P/L 3x a 4x, P/VP 0,6 | idem, sobre o BB em 2022 | B | Marco de banco precificado como problema. Estatal é vetada aqui; o número serve só como referência de múltiplo de banco. |
| Desconto sobre patrimônio de empresa sem moat | preço de R$ 3,12 com patrimônio de R$ 7,50 por ação (~0,4x); valor de mercado de ~R$ 750 mi a 950 mi contra liquidação de ~R$ 1,5 bi | idem, Tri Sul | B | Ordem de grandeza da margem que ele exige no método de patrimônio (`valuation.md`). |
| Endividamento de empresa individual | atenção acima de 3x dívida líquida / EBITDA | `fundamentos-e-qualidade.md` | heurística | Agora casa com o marco agregado da crise de 2015. |

## 4. Números citados que não servem de régua

Retorno anual declarado das carteiras da Suno desde o início (Ibovespa 8%, dividendos 21%, valor 10,8%, small caps "30 e poucos"): autodeclarado numa peça de venda, sem auditoria nem período exato. Não usar como benchmark. O mesmo vale para "menor drawdown entre os melhores gestores", comparação contra pares escolhidos por ele.

## Fontes

- Live "Aprenda o jeito do Tiago Reis de investir em ações" (Terra Investimentos e Suno Asset, outubro de 2022), transcrição em `financas/referencias/`.
- Picos da Selic contra Ibovespa e CDI: calculado pela skill em 02/11/2026 com Banco Central (SGS 432 e 12) e Yahoo Finance (^BVSP).
