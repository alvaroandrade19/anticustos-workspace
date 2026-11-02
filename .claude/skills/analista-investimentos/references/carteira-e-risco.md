# Carteira e risco

Leia quando o modo é diagnosticar a carteira ou decidir um aporte. Roda com `scripts/carteira.py`. Ideia central: **carteira não é soma de boas ações, é um conjunto de apostas que se movem juntas ou não**. Uma ação ótima no tamanho errado estraga a carteira.

## 1. Objetivo antes de ativo

Sem estas respostas, não existe "carteira boa", só carteira que subiu:
- Para que é o dinheiro e quando será usado (horizonte)? Dinheiro que será usado em menos de 3 anos não deve estar em renda variável.
- Existe reserva de emergência fora da carteira de risco? Sem ela, a primeira queda vira venda forçada no fundo.
- Qual queda você aguenta sem vender? Responda em reais, não em percentual. "Aguento 30%" muda de significado quando são R$ 30 mil.
- A carteira é da empresa (caixa excedente) ou pessoal? Caixa da empresa precisa de liquidez e previsibilidade, e a política de risco deve ser escrita e aprovada.

## 2. A régua: o que a renda variável precisa pagar

Compare sempre com o CDI acumulado do mesmo período (`bcb.py macro`) e com o juro real. Renda variável que rende o mesmo que o CDI com 20% de volatilidade foi pior que o Tesouro Selic, porque o risco foi tomado e não foi pago. O `carteira.py` calcula excesso sobre o CDI e Sharpe contra o CDI.

**O que é risco aqui** (Howard Marks): risco é a chance de **perda permanente**, não a oscilação. Volatilidade só vira perda permanente de dois jeitos: você vende no fundo, ou o ativo não volta por motivo de negócio. Por isso as duas defesas são reserva e horizonte (para não vender no fundo) e qualidade do negócio com margem de segurança (para ele voltar). Marks também lembra que o humor do mercado anda como um pêndulo entre ganância e medo e quase nunca para no meio: quando todo mundo concorda que não há risco, há.

## 3. Concentração, de verdade

- **Peso por posição**: o que importa é o tamanho da perda possível, não o peso. Perda possível = peso × queda plausível do ativo. Um ativo de 15% que pode cair 50% custa 7,5% da carteira.
- **Número efetivo de ativos** (1/HHI): 10 posições com um peso de 40% valem uns 3 ativos. É o que o script reporta.
- **Concentração escondida**: duas ações do mesmo setor, ETF de índice que já contém suas ações (sobreposição), vários ativos dependentes do mesmo preço (petróleo, juros, dólar), vários FIIs com o mesmo devedor ou indexador.
- **Correlação**: o script mostra a média e o par mais parecido. Em crise, correlação sobe. Correlação média acima de 0,6 em calmaria significa que a diversificação é menor do que o número de ativos sugere.
- **Moeda e indexador**: quanto da carteira depende do dólar, quanto de inflação, quanto de pré-fixado.

Faixas de partida (heurística, ajuste ao seu perfil): posição individual de renda variável costuma ficar entre 3% e 10% da carteira de risco; teto de 15% a 20% só com convicção alta e negócio de baixo risco; o script alerta em 20%.

## 4. Tamanho de posição

Defina a perda máxima que a posição pode causar *antes* de comprar, e deixe isso dizer o tamanho. Fórmula: peso máximo = perda tolerável da carteira ÷ queda plausível do ativo. Sobre a fórmula de Kelly que aparece nos repositórios de origem: ela exige probabilidade de acerto e razão ganho/perda conhecidas, e em investimento você não as conhece. Use apenas a lição qualitativa (apostar demais destrói mesmo com vantagem real) e prefira frações pequenas.

## 5. Rebalanceamento

Por bandas (rebalancear quando uma classe sai mais de 5 pontos da meta) ou por calendário (anual). Rebalancear vende o que subiu e compra o que ficou para trás, o que é desconfortável de propósito. Custo e imposto da venda entram na conta: tributação de renda variável e de renda fixa muda, **confirme a regra vigente com o contador** antes de recomendar venda por imposto.

## 6. Métricas de acompanhamento

Retorno contra CDI e contra o Ibovespa, volatilidade anual, queda máxima, Sharpe contra CDI, correlação média, peso por classe e setor. Ao ler: **o retorno do período passado com os pesos de hoje não é o resultado que você teve**, é um retrato do risco da composição atual. O script rotula assim e você também deve.

## 7. Revisar posição existente

Pergunta que corta o viés de ancoragem: **se eu não tivesse este ativo hoje, compraria a este preço, neste tamanho?** Se não, a única coisa que mantém a posição é o preço de compra, que o mercado não conhece. Preço médio, prejuízo acumulado e vontade de "empatar" não são argumento.

## 8. Diário de decisões

Todo aporte, venda ou veredito vira uma linha: data, ativo, ação, tese em duas frases, o que mudaria minha cabeça, e revisão marcada para 3 a 6 meses. Sem diário, o viés de retrospecto reescreve o que você pensava. Modelo em `modelos/diario-de-decisoes.md`.

## 9. Se for testar estratégia com dados históricos

Só vale com estas cinco proteções: sem uso de dado futuro (o sinal usa só o que existia na data), sem viés de sobrevivência (inclua empresas que quebraram ou saíram da bolsa), custos e impostos incluídos, teste fora da amostra (separe dados que a estratégia nunca viu) e poucos parâmetros. Resultado de backtest muito bonito (Sharpe acima de 2 ou 3) é mais provável ser sobreajuste do que descoberta. Estratégia de negociação frequente está fora do escopo desta skill.
