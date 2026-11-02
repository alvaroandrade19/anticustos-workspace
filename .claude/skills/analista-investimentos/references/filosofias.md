# Filosofias de referência

Leia no início de toda análise e sempre que for decidir tamanho de posição. São as lentes que o Alvaro escolheu para embasar decisões: **Raul Sena, Tiago Reis, Warren Buffett, Bruno Perini e Tio Huli**. Funcionam como filtros e perguntas, não como oráculos. Onde duas lentes discordam, quem decide é o Alvaro. Para somar outro investidor, acrescente uma ficha no mesmo formato (camada, princípios, como checamos, nível de evidência, fonte).

## A descoberta que organiza tudo: são camadas, não métodos concorrentes

Os cinco respondem a perguntas diferentes. Aplicar na ordem evita a confusão de comparar "o método do Buffett" com "o método do Perini", que não competem.

| Camada | Pergunta | Quem responde | Onde vira ferramenta |
|---|---|---|---|
| 0. Estrutura do dinheiro | Para que serve cada parcela? Há reserva antes do risco? | Perini | passo 1 da skill, `carteira-e-risco.md` seção 1 |
| 1. Risco da carteira | Quanto risco, em quais classes e mercados? Por que comprar, manter ou vender? | Tio Huli | `carteira.py`, `modelos/diario-de-decisoes.md` |
| 2. Seleção do negócio | Eu entendo o negócio? O setor presta? Há veto? | Buffett, Raul | `modelos/criterios-pre-definidos.md`, `comparar.py` (cego) |
| 3. Filtro numérico e valor | Passa nos vetos e nas telas? Quanto vale e a que preço? | Tiago Reis, Graham, Greenblatt, Damodaran | `triagem.py`, `comparar.py --magic`, `valuation.py`, `telas-quantitativas.md` |
| 4. Tamanho da posição | Quanto, dado o risco? | Raul | coluna `risco` do `carteira.py` |
| Comportamento (transversal) | Sou sócio ou especulador? Estou seguindo a manada? | Buffett, Huli | `vieses-e-armadilhas.md` |

## Fichas

**Nível de evidência:** A = fonte primária vista; B = entrevista ou artigo da própria casa; C = perfil ou resumo de terceiros. Quase tudo aqui é B ou C. Nada abaixo é regra dura até ser conferido na origem.

### Bruno Perini (camada 0, evidência C)
Educador financeiro (canal Você MAIS Rico, curso Viver de Renda). **Não encontrei método publicado de escolha de ações**, só princípios de organização do dinheiro. Não o use como referência de seleção; é referência de estrutura.
- Gastar menos do que ganha e aportar de forma recorrente; constância e tempo pesam mais que retornos pontuais.
- **Cada parcela do dinheiro tem uma função**: uma busca segurança e liquidez, outra busca crescimento e aceita oscilar.
- **Reserva de emergência antes das posições voláteis**, para não vender na hora errada.
- Diversificar também geograficamente (exterior) para reduzir dependência do Brasil e do real.
- Como checamos: o passo 1 da skill exige função, horizonte e reserva antes de qualquer ativo. Alocação em percentual dele: não encontrada.

### Tio Huli, Hulisses Dias (camada 1, evidência B-)
- **"Amadores focam no retorno, profissionais focam no controle de risco."**
- Diversificar entre classes de ativos e entre mercados foi, segundo ele, o principal acerto da carreira.
- Método definido: saber o motivo de comprar, manter ou vender **antes** de agir. Longo prazo.
- Evita taxas altas, reação ao movimento diário, e perder horas por dia lendo relatório. Defende autoconhecimento: "uma hora o mercado vai testar suas crenças".
- Menciona factor investing (valor, momentum, qualidade etc.), **sem detalhar critérios**. A literatura geral de fatores é outra coisa e não deve ser creditada a ele.
- Como checamos: diário de decisões com motivo de compra, manutenção e venda escritos antes; limite de custos; exposição por classe e por moeda no `carteira.py`.

### Warren Buffett (camadas 2 e comportamento, evidência B e A parcial)
Princípios vindos do texto de corretora que o Alvaro colou, mais frases de cartas aos acionistas vistas em fontes secundárias (o site da Berkshire recusou a conexão nesta sessão, então **a citação literal ainda precisa ser conferida**).
- **Círculo de competência**: avaliar só o que entende; o tamanho do círculo importa menos que conhecer seus limites (carta de 1996, citação secundária).
- **Margem de segurança** na compra (carta de 1992, herdada de Graham) e boas empresas a preço abaixo do valor intrínseco.
- **Postura de sócio**: pensar como quem compraria o negócio inteiro e o manteria por muito tempo.
- **Não seguir a manada**: preço popular raramente é preço barato; comprar quando poucos querem.
- **Reconhecer o que não sabe**: o maior risco é achar que sabe.
- Como checamos: duas frases sobre como a empresa ganha dinheiro antes de qualquer número; faixa de valor com margem; nota de "popular ou odiada e por quê" antes de comprar.

### Raul Sena, o Investidor Sardinha (camadas 2 e 4, evidência C)
Empreendedor e criador do canal Investidor Sardinha (perfil do Investidor10); vende curso próprio. Buy and hold como método declarado. Carteira real não encontrada; a carteira do artigo é exemplo de dimensionamento.
- **Setor primeiro**, em cinco perguntas: existe há 100 anos (Efeito Lindy; **filtro rejeitado pelo Alvaro em 02/11/2026**, não elimina nada)? Dá lucro consistente? Quanto depende do Estado? Vende para empresas (B2B), para o consumidor (B2C) ou ambos? É muito alavancado? E quais indicadores o RI do setor repete (VGV, vendas mesmas lojas, PDD).
- **Análise cega**: fixar os indicadores antes de olhar as empresas, para o gosto não escolher a métrica depois.
- **Peso pelo risco, não igual para todos**: blue chip entre 12% e 18%, small cap entre 3% e 5% no exemplo do artigo.
- Evita estatais, prejuízo recorrente, e prefere empresa com histórico e investimento consistente em P&D.
- Como checamos: cinco perguntas em `criterios-pre-definidos.md`; `comparar.py` cego; coluna `risco` e alertas no `carteira.py`.

### Tiago Reis, fundador da Suno (camada 3, evidência B)
- **Value investing**: comprar abaixo do que vale e manter. Menciona o modelo de dotações de Yale como inspiração (uma única fonte; tratar com cautela).
- **Critérios indispensáveis** (InfoMoney): balanço forte, baixo endividamento, rentabilidade sobre o capital acima da média, boa administração e várias avenidas de crescimento, de preferência acima do PIB. Riscos toleráveis e valuation interessante.
- **Dividendo é consequência, não objetivo**: vem de alocação eficiente de capital, caixa e resiliência. Alerta contra ranking passado de dividendos sem checar se são recorrentes.
- A casa publica checklist numérico (ROE acima de 10%, P/L abaixo de 20, dívida líquida abaixo de 100% do patrimônio) e, em lista de dividendos de 2024, aplicou o método Bazin (DY acima de 6% e dívida baixa). Os autores avisam que passar não significa comprar todas.
- Como checamos: tela `suno_checklist` e `bazin_barsi` no `triagem.py`; os critérios qualitativos entram no passo de moat e gestão de `fundamentos-e-qualidade.md`.
- Cuidado de fonte: casa de research vive de assinatura. Houve em 2023 acusações públicas contra a casa por parte de uma gestora e investigações noticiadas; são alegações, não condenações, e não as verifiquei.

## Referências complementares (preenchem lacunas das cinco)

Escolhidas pela lacuna que fecham, não pela fama. Cada uma entra numa camada já existente.

| Referência | Lacuna que fecha | O que entra na skill | Evidência |
|---|---|---|---|
| **Aswath Damodaran** (NYU) | Os números do custo de capital em reais, que nenhum dos cinco dá | Prêmio de risco do Brasil e prêmio de ações total para o CAPM (`valuation.md`, `valuation.py capm --crp`) | A: dado publicado por ele, jan/2026 |
| **Joel Greenblatt** (Magic Formula) | Uma tela simples com teste no Brasil, coisa que nem Graham nem a Suno têm aqui | Ranking por retorno sobre capital e EBIT/EV (`comparar.py --magic`) | B: estudo acadêmico de 2021 com B3, 2006 a 2020; ver `telas-quantitativas.md` |
| **Howard Marks** (Oaktree) | Definição de risco e leitura de ciclo, que a camada do Tio Huli só aponta | Risco é perda permanente, não volatilidade; pensamento de segundo nível; pêndulo entre ganância e medo | B: memorandos de 2014 e 2015 vistos por fontes secundárias |
| **Charlie Munger** | Disciplina contra o próprio erro, que fecha a camada de comportamento | Inversão (pergunte como perder e evite), incentivos explicam comportamento, checklist antes de decidir | C: frases amplamente atribuídas, não conferidas na origem |

Ficaram de fora de propósito: Barsi e Bazin, porque o Alvaro decidiu que dividendo é consequência (a tela deles existe, desligada); e nomes de estratégia de curto prazo, fora do escopo.

## Tensões e decisões

1. **Círculo de competência contra filtro Lindy. DECIDIDO em 02/11/2026:** o filtro dos 100 anos não vale. O círculo de competência do Alvaro (tecnologia, IA, serviços) é a porta de entrada.
2. **Estatais. DECIDIDO em 02/11/2026: veto.** Empresa controlada direta ou indiretamente pelo governo sai na primeira tela (`vetos_alvaro`). Confira o controlador no Formulário de Referência, porque o mercado chama de "ex-estatal" empresa em que o governo ainda manda.
3. **"A Bolsa sempre entrega os melhores resultados no longo prazo."** Testado em 02/11/2026 com Banco Central e Yahoo: em 5 anos o CDI rendeu 12,8% a.a. contra 9,7% do Ibovespa; em 10 anos o Ibovespa fez 10,0% a.a. contra 9,4% do CDI (só preço, sem dividendos). "Sempre" não se sustenta; a tese vale se a ação pagar prêmio sobre o CDI, a Régua.
4. **Dividendo como meta ou como consequência. DECIDIDO em 02/11/2026: consequência** (Tiago Reis). DY não é filtro. Entra como verificação: o dividendo é coberto por caixa livre e recorrente? A tela `bazin_barsi` fica desligada e só roda se pedida pelo nome.
5. **Concentrar ou diversificar.** Buffett concentra no que conhece; Tio Huli e Raul defendem diversificar e pesar por risco. Compatível por camadas: diversificar entre classes e mercados (Huli), pesar por faixa de risco dentro da renda variável (Raul), e concentrar só dentro do círculo de competência (Buffett). Quanto o Alvaro considera estar dentro do próprio círculo é decisão dele.
6. **Efeito Lindy é necessário, não suficiente.** Mede a sobrevivência do setor, não da empresa nem o retorno. Varejo e aviação são setores velhos e cemitério de empresas.
7. **Buy and hold sem gatilho de saída vira ancoragem.** Três gatilhos escritos antes da compra: tese quebrada, preço bem acima da faixa de valor, alternativa claramente melhor.
8. **Contrário à manada contra armadilha de valor.** Comprar o impopular exige provar que a empresa não está piorando de fato.
9. **Incentivo de quem ensina.** Casa de research vende assinatura, e influenciadores vendem curso e audiência; carteira declarada em vídeo não é auditada. Isso não invalida o conteúdo, mas rebaixa a evidência: ideia vira hipótese e passa pela Prova. Vale também o viés de sobrevivência: vemos quem deu certo, não quanto foi método e quanto foi época.

## Fontes (acessadas em 02/11/2026)

- Tiago Reis, critérios: [InfoMoney](https://www.infomoney.com.br/?p=1908347); checklist numérico: [Suno, como selecionar ações](https://www.suno.com.br/artigos/como-selecionar-acoes/amp/); modelo de Yale: [fiis.com.br](https://fiis.com.br/noticias/fiis-oportunidade-diversificacao-tiago-reis-suno/).
- Bruno Perini: [Investidor10](https://investidor10.com.br/conteudo/bruno-perini-conheca-a-trajetoria/) e [Nord Investimentos](https://www.nordinvestimentos.com.br/blog/quem-e-bruno-perini/) (perfis, sem citação primária).
- Tio Huli: [EQI, Money Week](https://www.euqueroinvestir.com/tio-huli-hulisses-dias-money-week/).
- Raul Sena: [Investidor10](https://investidor10.com.br/conteudo/raul-sena-o-investidor-sardinha/) e o artigo colado pelo Alvaro.
- Buffett: texto de corretora colado pelo Alvaro; frases de 1992 e 1996 vistas em fontes secundárias. **Conferir nas cartas em berkshirehathaway.com.**
- Bazin: [Acionista](https://acionista.com.br/metodo-decio-bazin/) e [brapi](https://brapi.dev/blog/metodo-bazin-estrategia-renda-passiva-acoes-dividendos), secundárias.
- Damodaran, prêmio de risco por país: [NYU Stern, ctryprem](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html) (atualização de janeiro de 2026; ele revisa a cada ano).
- Greenblatt no Brasil: Conceição, "Análise do desempenho da Magic Formula aplicada ao mercado de capitais brasileiro", [Revista Produção Online, 2021](https://producaoonline.org.br/rpo/article/download/4385/2129/13664).
- Marks: memorandos [Risk Revisited (2014)](https://www.oaktreecapital.com/docs/default-source/memos/2014-09-03-risk-revisited.pdf) e [Risk Revisited Again (2015)](https://www.oaktreecapital.com/docs/default-source/memos/2015-06-08-risk-revisited-again.pdf), no arquivo da Oaktree.
