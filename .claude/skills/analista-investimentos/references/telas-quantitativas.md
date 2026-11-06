# Telas quantitativas

Leia ao rodar `scripts/triagem.py` ou ao decidir limiares. Uma tela é uma lista de regras numéricas de uma filosofia. **Ela elimina; não recomenda.** Quem passa ainda precisa de entendimento do negócio (Buffett) e de valor em faixa (`valuation.md`). A Suno, que publica a tela mais popular do grupo, avisa o mesmo: passar no filtro não é motivo para comprar todas.

As regras moram em `modelos/telas.json` e podem ser editadas sem mexer no código. Limiar sem dono aparece como "a definir" e a triagem mostra N/D em vez de inventar.

## As telas instaladas

| Tela | Regras | Origem e limite |
|---|---|---|
| `vetos_alvaro` (roda primeiro) | não ser estatal; no máximo 1 prejuízo em 5 exercícios; pelo menos 5 exercícios de balanço | Decisões do Alvaro de 02/11/2026; os dois limiares numéricos foram estimados pela skill e são revisáveis |
| `graham_defensivo` | tamanho (receita de R$ 1 bi ou mais); liquidez corrente de 2 ou mais; lucro em todos os anos; dividendos por 20 anos; lucro com média trienal 1/3 maior em 10 anos; P/L até 15 sobre lucro médio de 3 anos; P/VP até 1,5 ou P/L x P/VP até 22,5 | Graham, via tabela do artigo de Almeida e Sales (FIPECAFI, 2019). Limiares do mercado americano, sem Selic de dois dígitos |
| `suno_checklist` | ROE acima de 10%; P/L abaixo de 20; dívida líquida / patrimônio abaixo de 100% | Artigo da Suno, casa de research com interesse comercial |
| `bazin_barsi` (**desligada**) | DY de pelo menos 6%; dívida líquida / patrimônio abaixo de 100%; lucro estável; 5 anos de dividendos | Desligada porque o Alvaro decidiu que dividendo é consequência. Roda só com `--tela bazin_barsi` |
| Magic Formula (em `comparar.py --magic`) | ranking por retorno sobre capital e por EBIT/EV | Greenblatt. É ranking entre empresas, não regra de corte: precisa de várias empresas com cotação no JSON |

## O piso de tamanho (estimativa da skill, 02/11/2026)

Graham pedia receita acima de US$ 100 milhões no início dos anos 1970. Corrigido pela inflação americana desde então (algo como 7 vezes) e convertido a R$ 5,40, daria por volta de R$ 4 bilhões, o que elimina boa parte da bolsa brasileira, bem menor que a americana. O objetivo da regra não é o número, é afastar empresa pequena demais para aguentar um ano ruim. **R$ 1 bilhão de receita anual** cumpre isso no Brasil: separa a empresa de porte médio para cima da small cap mais frágil, sem esvaziar a lista. É estimativa, não dado; revise se a triagem cortar demais ou de menos. O estudo da Magic Formula usou outro filtro complementar que vale copiar quando houver dado de volume: negociação média acima de R$ 500 mil por dia nos 60 dias anteriores, porque valor de mercado alto não garante que dê para comprar e vender.

## A melhor evidência local: Magic Formula na B3, 2006 a 2020

Conceição (UFF, Revista Produção Online, 2021) montou carteiras com as melhores empresas pelo ranking de Greenblatt (retorno sobre capital e EBIT/EV), excluindo financeiras e utilities, EBIT negativo e ações com menos de R$ 500 mil de volume diário.

| Carteira | Retorno médio anual |
|---|---|
| Melhores do ranking (10 a 20 ações, permanência de 6 a 24 meses) | **14,8% a 21,3%** |
| Piores do ranking | -1,7% a 6,7% |
| Ibovespa | 7,8% |
| CDI no mesmo período (calculado pela skill, Banco Central) | **10,0%** |

Leitura: o Ibovespa perdeu para o CDI em 15 anos, e as carteiras da fórmula bateram os dois. As piores do ranking ficaram abaixo do índice, o que é o sinal mais convincente de que o ranking separa algo real. **Ressalvas:** não há custo de transação nem imposto; a volatilidade das carteiras foi maior que a do índice; outro estudo brasileiro (Alberto, 2018) achou resultado abaixo do índice com outra metodologia; e é um único trabalho. Serve para dar à Magic Formula um peso maior que às outras telas, não para aplicá-la às cegas.

## Calibragem contra a Régua

Limiar de P/L e de DY nasceu quando a renda fixa pagava pouco. Um P/L de 15x equivale a lucro/preço de 6,7% e um de 20x, a 5,0%. Esse rendimento é aproximadamente real (o lucro acompanha a inflação), então a comparação justa é com o juro real longo (NTN-B), não com a Selic nominal; comparar 6,7% com 13,75% subestima a ação em toda a inflação do período. Com NTN-B longa na faixa de 6% a 7% real (ordem de grandeza dos últimos anos; confira a taxa do dia no Tesouro Direto), P/L de 15x mal empata sem crescimento, e 20x perde. Isso não torna a regra errada, mas obriga a pergunta: **quanto o lucro precisa crescer acima da inflação para esse preço se pagar contra o juro real?** Uma tela de valor com limiar de juro baixo reprova quase tudo num país de juro alto, e quem relaxa o limiar por conforto deve registrar a decisão (`criterios-pre-definidos.md`). O `triagem.py --selic` imprime esse alerta.

## O que o artigo de Graham no IBrX 100 prova e não prova

Fonte: "Indicadores da Análise Fundamentalista e o Retorno das Ações Listadas no IBrX 100 à Luz do Value Investing, 2009 a 2018" (Almeida e Sales, FECAP, Congresso USP). Testou 36 indicadores contra o retorno trimestral de 78 ações não financeiras, em painel com efeitos fixos. Nove saíram significativos: variação da média trienal do lucro, P/L médio, dívida financeira de curto prazo sobre a total (efeito negativo), liquidez seca, ativo total, liquidez corrente, P/VP, lucro por ação e ROA.

**Como usar:** como lista de indicadores que valem olhar, e eles já estão no `fundamentos.py` (inclui liquidez seca e peso da dívida de curto prazo).

**Por que não tratar como regra:**
- Mede associação com o retorno *no mesmo período*, não previsão. O resumo chama as variáveis de "preditoras", mas não há teste fora da amostra.
- P/L e P/VP têm o preço no numerador, e o preço é a variável explicada. Os próprios autores avisam que a relação é mecânica.
- A amostra são ações que estavam no IBrX 100 no 4º trimestre de 2019: quem saiu do índice antes fica de fora (viés de seleção, reconhecido no texto).
- Sinais intrigantes: lucro por ação e liquidez corrente com coeficiente negativo e P/L com positivo. O texto levanta hipóteses, mas não resolve.
- São 36 variáveis testadas e nove significativas a 10% ou menos; com tantos testes, alguns acertos saem por acaso.
- Não determina valores ideais por indicador. A conclusão de que isso "valida" os filtros de Graham vai além do que a regressão mostra; a evidência de carteiras de Graham superando o índice vem de estudos que o artigo cita (Artuso e Chaves Neto, 2010; Palazzo et al., 2018), não dele.

## O que a literatura brasileira sugere sobre o fator valor

Evidência acadêmica, de qualidade desigual e que depende de período, métrica e método:
- Tese de doutorado da USP (Queiroz, 2024), dados de 2010 a 2022: há prêmio de valor na B3, e o índice valor contábil/preço foi a métrica que melhor o captou. O fator tamanho não foi significativo.
- Backtests de repositórios de universidades (UFU e outros) concluem que ordenar por indicadores de valor melhora o retorno ajustado ao risco, com limitações.
- Guia fatorial da XP (material de corretora, não neutro): momentum teria sido o fator de maior retorno desde 2010 (cerca de 15,8% a.a.), com qualidade e baixo risco de melhor relação risco-retorno.
- Material de marca (como "ações baratas" da Empiricus) não é evidência.
Não localizei a série de fatores do Nefin-USP. Antes de apoiar uma decisão relevante num prêmio de valor, ler Queiroz (2024) e Palazzo et al. (2018) na íntegra.

## Procedimento

1. Fixe a tela e os limiares **antes** de olhar o ativo (`modelos/criterios-pre-definidos.md`).
2. `python scripts/cvm.py extrair <código> --anos 2015,...,2024` (quanto mais exercícios, mais regras de histórico ficam avaliáveis; 6 ou mais destravam o crescimento trienal).
3. `python scripts/triagem.py empresa.json --preco X --acoes Y --selic Z --estatal n` (preço e ações podem ir gravados no JSON pelo `cvm.py extrair --preco --acoes`). Falhou em `vetos_alvaro`, para aqui.
4. Leia N/D e `PASSA*` (janela curta) como lacunas a fechar, não como aprovação.
5. Quem passa vai para `comparar.py` (cego, só empresas do mesmo setor) ou `comparar.py --magic` (ranking entre setores), e depois para valuation em faixa.
