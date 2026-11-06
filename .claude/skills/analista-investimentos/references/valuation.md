# Valuation

Leia quando a pergunta é "quanto vale" ou "está caro ou barato". Regra mestra: **valuation devolve uma faixa, nunca um preço-alvo**. Ele transforma premissas em número, e a qualidade está nas premissas. Um relatório que entrega "alvo de R$ 52,30" vende precisão que ninguém tem.

## Qual método para qual empresa

| Perfil | Método principal | Cuidado |
|---|---|---|
| Geradora estável de caixa | DCF e múltiplos de fluxo (EV/EBIT, FCF yield) | peso da perpetuidade |
| Pagadora regular de dividendo | Gordon (`valuation.py gordon`) | payout irregular quebra o modelo |
| Banco, seguradora | P/VP contra ROE sustentável | DCF de firma não se aplica |
| FII | P/VP, dividend yield contra Selic | rendimento não é lucro |
| Cíclica (commodity) | lucro normalizado pelo ciclo, EV/EBITDA médio de ciclo | P/L no pico engana |
| Crescimento sem lucro | cenários sobre receita futura e margem-alvo | quase tudo é especulação, rotule |
| Empresa madura e lucrativa, filtro rápido | número de Graham (`valuation.py graham`) | triagem, não valor |
| Sem vantagem competitiva | P/VP, valor de liquidação (ativos a valor de venda menos todo passivo) contra o valor de mercado | DCF não se aplica |

**O moat decide entre DCF e patrimônio** (regra do Tiago Reis, ver `filosofias.md`). A perpetuidade do DCF pressupõe retorno acima do custo de capital para sempre, e só vantagem competitiva sustenta isso. Sem moat, o retorno converge para o custo de capital e o crescimento deixa de criar valor: a âncora honesta é o patrimônio ou o valor de liquidação, e a margem de segurança é comprar abaixo dele. Responda o teste de moat de `fundamentos-e-qualidade.md` antes de escolher o método. Usar DCF numa empresa sem moat é projetar uma vantagem que ela não tem.

## DCF em reais, passo a passo

1. **Fluxo de caixa livre inicial**: caixa operacional menos investimento recorrente. Normalize o que é atípico. FCF não positivo derruba o método.
2. **Crescimento**: a ferramenta faz o crescimento cair em linha reta do crescimento inicial até o perpétuo. Crescimento alto para sempre é o erro mais comum.
3. **Crescimento perpétuo**: em termos nominais, perto do crescimento de longo prazo da economia mais inflação. Acima de uns 6% nominal exige defesa. Nunca acima do custo de capital (o script barra).
4. **Taxa de desconto (WACC)**: custo do capital próprio por CAPM (`valuation.py capm`), custo da dívida depois do imposto, ponderados pela estrutura de capital. Os prêmios vêm do Damodaran (NYU), que publica por país e revisa todo janeiro; em jan/2026 o Brasil tinha rating Ba1, spread soberano de 2,13%, prêmio de risco-país de 3,24% e prêmio de ações total de 7,47% (mercado maduro: 4,23%). Escolha **um** caminho e não misture:
   - **Em reais:** juro nominal longo em reais menos o spread soberano (2,13%), mais beta × 7,47%. O juro em reais já carrega o risco do país, por isso o spread sai e não se soma risco-país de novo.
   - **Em dólar:** juro do Tesouro americano + beta × 4,23% + 3,24% de risco-país (`--crp 0.0324`), depois converta para reais multiplicando por (1 + inflação esperada no Brasil) / (1 + inflação esperada nos EUA).
   O beta sai de regressão contra o Ibovespa ou de beta setorial do próprio Damodaran. Declare a origem de cada número: o resultado muda muito com eles. Confira o ano da tabela antes de usar.
5. **Valor da firma → valor do acionista**: subtraia dívida líquida (e minoritários, se relevantes), divida pelas ações.
6. **Peso da perpetuidade**: se mais de uns 75% do valor vem do valor terminal, o resultado depende do que você assumiu para daqui a 10 anos. A ferramenta avisa.

## As três perguntas que mais valem

1. **DCF reverso** (`valuation.py reverso`): *que crescimento o preço atual já embute?* É melhor que o DCF direto, porque troca "quanto vale" (que depende da sua crença) por "o que o mercado está assumindo" (que dá para julgar contra o histórico). Se o preço exige crescimento acima do que a empresa entregou em qualquer ano recente, está caro. Se exige menos que o pior ano recente, tem margem.
2. **Tabela de sensibilidade**: se a conclusão muda dentro de 1 ponto de WACC ou 0,5 ponto de crescimento perpétuo, ela não está decidida, e o veredito honesto é "depende".
3. **Cenários** (`valuation.py cenarios`): baixa, base, alta com probabilidades. As probabilidades são julgamento seu, não dado. Escreva isso. A utilidade está em ver o tamanho da perda no cenário ruim contra o ganho no bom.

## Monte Carlo

`valuation.py montecarlo` sorteia crescimento, crescimento perpétuo e WACC em faixas que você declara. A distribuição resultante mede **a incerteza que você admitiu**, não a incerteza do mundo. Útil para dizer "em que percentil das minhas premissas o preço está", inútil para fingir que o risco foi medido. Mudanças de regime, fraude e choque regulatório não estão nas faixas.

## Múltiplos relativos

P/L, EV/EBIT, EV/EBITDA, P/VP, FCF yield contra pares do mesmo setor e contra a própria história. Três regras: compare só empresas comparáveis (mesmo modelo, mesmo ciclo, mesma alavancagem); barato contra o par pode só significar que o par está caro; e múltiplo é consequência, o que importa é por que ele está onde está. **Earnings yield** (inverso do P/L) é retorno aproximadamente **real**, porque o lucro acompanha a inflação. Por isso a comparação justa é contra o juro real longo (NTN-B de prazo longo, taxa no site do Tesouro Direto), não contra a Selic nominal. Contra a Selic, só depois de somar a inflação esperada (`bcb.py focus`) ao earnings yield. Ação com earnings yield abaixo do juro real longo só se paga se o lucro crescer acima da inflação.

**Prêmio de ações do mercado** (termômetro da live do Tiago Reis): earnings yield do índice menos a NTN-B longa. Em out/2022 ele estimava 16% menos uns 6%, perto de 10 pontos, entre os maiores da série. Serve para a decisão de alocação (quanto em renda variável), não para escolher ação. O P/L do índice vem de fonte de mercado, não dos scripts daqui: cite a fonte e a data, e lembre que o índice brasileiro pesa commodity, cujo lucro no pico infla o earnings yield (calcule também sem elas, quando a fonte permitir). Marcos históricos e o que aconteceu depois de out/2022 em `numeros-de-base.md`.

## Margem de segurança

Distância entre o valor central da faixa e o preço. Quanto menor a previsibilidade do negócio, maior deve ser. Referência de partida, não regra: negócio previsível e de baixo endividamento aceita margem menor; cíclica, alavancada ou de crescimento exige margem larga. Margem de segurança grande com premissa ruim é só autoengano com folga.

## O que o valuation não faz

Não prevê o preço de curto prazo. Não protege de fraude contábil. Não substitui entender o negócio. Se você não consegue explicar em duas frases por que o fluxo de caixa deve crescer o que o modelo diz, o modelo está decorando uma opinião.
