# Fundamentos e qualidade do negócio

Leia quando o modo é avaliar uma empresa (ação, BDR) ou um fundo. A pergunta que organiza tudo: o negócio ganha mais que o custo do dinheiro, com lucro que vira caixa, sem depender de dívida que não consegue pagar?

## Ordem de leitura do balanço

Fluxo de caixa primeiro, porque é o que o contador menos consegue maquiar. Depois balanço, depois resultado, depois notas explicativas e Formulário de Referência (riscos, controlador, partes relacionadas). Pelo `cvm.py` você tem os números; as notas você lê no documento da CVM.

## Rentabilidade: contra a régua, não contra um número fixo

Os repositórios de origem usavam "ROE acima de 15%" como bom. No Brasil com Selic de dois dígitos, essa regra não serve: **o piso de qualquer negócio é a Selic**. ROIC abaixo da Selic significa que o negócio rende menos que um título público, e o acionista ainda leva o risco.

- **ROIC** (NOPAT sobre capital investido): o indicador principal. Compare com a Selic e com o custo de capital que você usou no valuation.
- **ROE** com DuPont: margem líquida × giro do ativo × alavancagem. Pergunta: o ROE alto vem de margem, de eficiência ou de dívida? ROE que sobe só por alavancagem é risco, não qualidade.
- **Margens** em série de 3 a 5 anos e contra pares. Margem caindo ano após ano com receita subindo é preço ou custo saindo do controle.

## Qualidade do lucro

Lucro que não vira caixa é opinião contábil.

| Teste | Limiar de partida | O que significa quando falha |
|---|---|---|
| Caixa operacional / lucro líquido | abaixo de 80% por mais de um ano | lucro de baixa qualidade, ou capital de giro comendo o caixa |
| Accruals / ativo total | acima de 10% | lucro contábil muito acima do caixa |
| Prazo de recebimento (DSO) | subiu mais de 15% em um ano | receita crescendo à frente do caixa, risco de inadimplência ou venda empurrada |
| Itens não recorrentes | lucro depende de venda de ativo, crédito fiscal ou variação cambial | lucro que não se repete |
| Mudança de prática contábil | qualquer uma | pergunte por quê, e refaça a série comparável |

## Endividamento

- **Dívida líquida / EBITDA**: acima de 3x pede atenção, mas depende do setor (utility regulada aguenta mais, cíclica aguenta menos). Empresa com caixa maior que a dívida tem dívida líquida negativa: ótimo, e ainda assim confira se o caixa está disponível ou preso.
- **Cobertura de juros** (EBIT / despesa financeira): abaixo de 3x é pouca folga com Selic alta.
- **Cronograma de vencimento**: a dívida que vence nos próximos 12 meses contra o caixa. É onde empresa quebra, não na razão média.
- **Moeda**: dívida em dólar sem receita em dólar é aposta cambial que a empresa não declarou.
- Liquidez corrente abaixo de 1 não é veredito: varejo e utilities operam assim. Pergunte como rola o curto prazo.

## Capital de giro, prazos e geração de caixa

Base contábil do e-book da Ágora (material de cerca de 2010; ignore o grupo "Permanente", extinto, e a caderneta de poupança como taxa livre de risco, hoje é título público longo). O `fundamentos.py` já calcula o que está marcado com (script).

- **Análise vertical e horizontal**: peso de cada linha sobre a receita (vertical) e variação ano a ano de cada conta (horizontal). É assim que se vê margem comprimindo e despesa crescendo mais que a receita. (as margens e o crescimento do script cobrem o essencial)
- **Prazos médios** (script): recebimento = contas a receber ÷ receita × dias; estocagem = estoques ÷ custo × dias; pagamento = fornecedores ÷ custo × dias. O CPV serve de aproximação para as compras, que a demonstração não traz.
- **Ciclo operacional** vai da compra da matéria-prima ao recebimento da venda; **ciclo financeiro** (script) vai do pagamento ao fornecedor ao recebimento. Ciclo financeiro longo e crescendo exige capital de giro, que alguém financia.
- **Necessidade de capital de giro** = ativos cíclicos (clientes, estoques) menos passivos cíclicos (fornecedores, impostos, salários). Caixa e dívida bancária não entram: são financeiros.
- **Liquidez seca** (script) tira o estoque do ativo circulante: mostra a folga sem depender de vender estoque.
- **Da lucratividade ao caixa**: EBITDA = EBIT + depreciação e amortização; **fluxo de caixa operacional** = EBITDA menos imposto e variação da necessidade de capital de giro; **fluxo de caixa livre** = operacional menos investimento em imobilizado (capex). O livre da firma (FCFF) ainda não pagou credores nem acionistas; o livre do acionista (FCFE) já descontou principal e juros da dívida. O DCF de `valuation.md` usa o da firma.
- **Por ação**: LPA, valor patrimonial por ação e caixa por ação servem para colocar o preço em unidade comparável.
- **Peso da dívida de curto prazo** na dívida total (script): na literatura brasileira, quanto maior, pior o retorno associado. Alerta quando passa de 50% com dívida líquida positiva.

## Setores que exigem outro olhar

Os indicadores acima enganam nesses casos. Não aplique o `fundamentos.py` sem ressalva.

- **Bancos e seguradoras**: não existe dívida líquida nem EBITDA. Olhe ROE sustentável, índice de Basileia, inadimplência acima de 90 dias, cobertura de provisão, índice de eficiência, P/VP. O `cvm.py` não extrai plano financeiro: use o ITR/DFP direto.
- **FIIs**: P/VP, dividend yield contra a Selic, vacância (tijolo), indexador e prazo dos CRIs (papel), concentração de inquilino ou devedor, alavancagem, liquidez diária. Rendimento distribuído não é lucro: o fundo pode devolver capital.
- **Commodities e cíclicas** (petróleo, mineração, siderurgia, papel): **P/L baixo no pico do ciclo é armadilha clássica**, porque o lucro está inflado. Normalize o lucro pelo ciclo (média de 5 a 10 anos ou preço de commodity de longo prazo) antes de concluir.
- **Utilities e concessões**: prazo da concessão, regra de reajuste tarifário, risco regulatório, dívida longa indexada.
- **Varejo**: vendas mesmas lojas, giro de estoque, prazo de recebimento de cartão, endividamento do consumidor.
- **Crescimento e tecnologia**: receita recorrente, retenção, custo de aquisição contra valor do cliente, queima de caixa e quanto tempo de pista resta.
- **Estatais e controle concentrado**: risco de interferência política em preço e dividendo, política de dividendos escrita, direito dos minoritários (tag along, classe de ação), partes relacionadas.

## Moat (vantagem competitiva)

Cinco fontes: marca com preço premium, custo de troca alto, efeito de rede, vantagem de custo, ativo intangível ou regulatório (licença, patente, concessão). Teste: o que impede um concorrente bem financiado de tomar essa receita em cinco anos? Se a resposta é "nada", não há moat, e margem alta tende a ser competida para baixo. Para o ciclo de vida do setor (nascimento, crescimento, maturidade, declínio), o múltiplo aceitável muda: pagar caro por crescimento só vale se o crescimento é real.

## Armadilha de valor

Empresa barata em múltiplo e piorando em substância. Sinais: receita em queda por 3 anos, setor sendo substituído, perda de cliente-chave, margem comprimida, dívida subindo para pagar dividendo. Antes de chamar de barata, responda: **por que o mercado está errado aqui?** Sem resposta, o mercado provavelmente está certo.

## Checklist mínimo antes de qualquer veredito

- [ ] Entendo como a empresa ganha dinheiro em duas frases
- [ ] ROIC contra a Selic, em série de 3+ anos
- [ ] Caixa operacional acompanha o lucro
- [ ] Dívida vence de forma administrável, na moeda certa
- [ ] Comparei com pares do mesmo setor, não com número absoluto
- [ ] Li o que pode dar errado (fatores de risco, litígio, partes relacionadas)
- [ ] Sei o que o preço atual embute (DCF reverso, em `valuation.md`)
