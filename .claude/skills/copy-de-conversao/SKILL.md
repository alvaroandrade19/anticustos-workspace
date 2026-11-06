---
name: copy-de-conversao
description: "Motor de copy de conversão (CopyOS adaptado à Anti Custos). Use para escrever, reescrever ou diagnosticar copy de venda que não tem skill própria: anúncio de Meta (texto principal, headline, descrição, legenda de estático, roteiro de anúncio em vídeo), ganchos e ângulos, página de captura ou de vendas, VSL, e-mail ou sequência de mensagens (inclusive WhatsApp), isca, texto de proposta comercial, abertura de call. Gatilhos: 'escreve o anúncio', 'me dá ganchos', 'melhora essa página', 'reescreve essa copy', 'por que esse anúncio não converte', 'texto da proposta'. NÃO use para carrossel (/carrossel), post de LinkedIn (/postar-linkedin) nem reel (/reels): essas skills têm método próprio e chamam o revisor-chefe no fim. Decisão de oferta (pacote, preço, garantia) é da /ofertaos. Não faz prompt visual nem compra de mídia."
---
# Copy de Conversão: o Motor

## O que esta skill faz
Transforma conceito, oferta e prova em copy pronta para colar. Nas peças que carregam a venda inteira, a arquitetura
é decidida antes da redação, num bloco `ARCHITECTURE` rotulado; depois vem a escrita completa contra esse bloco. Todo
rascunho voltado ao cliente termina na passada do `revisor-chefe`; alegações recebem as flags da
`checagem-de-alegacoes`; nada vai ao ar sem a `checagem-pre-lancamento`.

## Contexto deste workspace (leia antes de escrever)

1. **O negócio:** `_contexto/empresa.md`, `_contexto/preferencias.md`, `_contexto/estrategia.md`, `_contexto/agora.md`
   e `PRODUCT.md`. É a única fonte da verdade: não crie brief paralelo, `BUSINESS-MEMORY.md` nem pasta de memória
   própria. Copy para cliente lê `clientes/<nome>/` e nunca mistura com a Anti Custos.
2. **Doutrina de copy do vault:** `Wiki/Gerencial/Copy - Estruturas em Uso.md` (pesquisa, consciência, Big Idea, as 10
   perguntas, as 4 resistências, vereditos do negócio) e `Wiki/Projeto/Voz e Estilo.md` (regras de frase). O vault fica
   em `C:\Users\aandr\OneDrive\Documentos\Obsidian Vault\Wiki\`. ICP, persona, preço e vocabulário de origem clínica
   dessas páginas não se aplicam (ressalva do `AGENTS.md`): use só a estrutura.
3. **Anúncio:** a seção "Tráfego pago" do `AGENTS.md` (nomenclatura, UTM dentro do link de destino) e o protocolo de
   teste vigente em `ads/`. Para julgar performance, `Wiki/Gerencial/Métricas e Diagnóstico.md`.

**Regras da casa, que vencem qualquer referência desta skill e da biblioteca:**
- Zero travessão, nem o curto, em toda copy. Vírgula, dois-pontos, parênteses ou frase curta.
- Nenhuma construção "não é X, é Y" ou "não é só X, é Y". Diga a coisa positiva direto.
- Todo número é dado público com fonte ou conta aberta com a base à mostra. Prova nunca é fabricada (`PRODUCT.md`);
  sem case, demonstre o mecanismo funcionando. A única prova de primeira mão hoje está registrada no `PRODUCT.md`.
- Teste da cópia barata: toda peça carrega ao menos um número, nome próprio, framework ou fato que só existe no nosso
  contexto.
- Instagram e anúncio falam como Anti Custos (institucional, assinatura "Anti Custos", nunca o nome do Alvaro).
  LinkedIn é primeira pessoa do Alvaro. Proposta comercial pede sobriedade acima de empolgação.

## Como o trabalho flui

Carregue você mesmo, pela ferramenta de skills, o que o trabalho pedir. O usuário não precisa chamar nada.

- `revisor-chefe`: passada final em todo rascunho voltado ao cliente.
- `checagem-de-alegacoes`: quando houver número, porcentagem, mecanismo, garantia, depoimento ou risco de rejeição.
- `checagem-pre-lancamento`: antes de qualquer peça ir ao ar ou de subir um anúncio.
- `voz-do-cliente`: quando faltar evidência de mercado. Ofereça uma vez, como flag; nunca segure o trabalho.
- `biblioteca-dos-mestres`: profundidade além das referências desta skill.
- `/ofertaos`: quando o problema é a oferta (pacote, promessa, garantia, preço).

**Antes de reescrever peça que não converte**, rode o diagnóstico de restrição em
`../ofertaos/references/diagnostico-de-restricao.md`. Copy melhor não conserta oferta fraca, medição cega nem falta
de capacidade, e dizer isso com clareza vale mais que uma reescrita.

## Quando perguntar

Pergunte só o que muda a peça. Separe o que você não sabe em dois grupos: (a) o que muda o texto (para quem é e o que
essa pessoa já sabe, a coisa que só este negócio pode dizer, a prova real que existe, para onde vai o clique) e (b) o
que dá para presumir e avisar (tom, tamanho, formato). Só o grupo (a) vira pergunta.

- No máximo três perguntas por vez, numa mensagem só, e depois escreva. "Não sei" é resposta válida e vira um
  `[placeholder]` nomeado com flag.
- Não pergunte o que já foi dito na conversa ou o que `_contexto/` já responde.

## O que você entrega

Copy finalizada em força total, depois uma nota curta. Três partes, nesta ordem:

1. **A copy.** Cada peça pedida, pronta para colar. Anúncio Meta segue o pacote de
   `references/pacote-de-anuncio-meta.md`: dois textos principais que abrem com tipos de lead diferentes sobre um corpo
   compartilhado, duas headlines, duas descrições, o botão de CTA, mais a legenda e a direção de imagem para estático.
2. **Flags.** Até cinco linhas, só quando algo precisa do usuário: alegação a sustentar, `[placeholder]` a preencher,
   linha com chance de rejeição, suposição feita. Sem flags, sem seção.
3. **Uma linha do Chefe.** Exemplo: `Chefe: 25 checagens, corrigiu 3 (gancho, uma virada, meio lento). Diga "mostre a revisão" para a passada completa.`

O método fica nas notas de trabalho (rótulos de consciência, notas de estratégia, scorecard, revisão ponto a ponto,
tabela de alegações). Entregue na íntegra quando pedirem ("mostre a revisão", "mostre seu trabalho"). Comprimento e
forma seguem o pedido; sem pedido e com várias variações, varie o comprimento (curto, padrão, longo). Faça uma pergunta
só quando a resposta mudar o trabalho; senão decida, escreva e ponha a suposição nas flags.

## Modo de intensidade

**Padrão da casa:** força total de argumento, contraste concreto, tensão e mecanismo, sem relativização genérica
("pode", "talvez", "vale conferir") no lugar de prova, sem hype de guru, sem urgência que não seja verdade. Fiel ao tom
de `_contexto/preferencias.md`: direto, mas não superficial.

Flags que o usuário pode escrever no pedido (contrato em `references/biblioteca-de-marketing/metodos/_compartilhado/flags-de-modo.md`):
`--extreme` (intensidade máxima de resposta direta), `--unrestricted` (o usuário define tom, tamanho e formato) e
`--lite` (peça pequena, exploração e revisão mínimas). Nenhuma flag libera travessão, dado inventado apresentado como
real, escassez falsa ou garantia de faturamento.

## Checagem de Venda Completa (rode antes de redigir)

**ARQUITETURA PRIMEIRO**, porque carregam um argumento de venda completo: VSL nova ou reconstruída; página de vendas
para tráfego frio; advertorial ou pré-venda de grande porte; sequência que carrega o argumento inteiro ao longo das
mensagens; um argumento de oferta que o negócio nunca fez; reconstrução estrutural de peça ou funil que não converte.

Para estas, abra o rascunho com um bloco `ARCHITECTURE` e resolva-o primeiro: rota escolhida e por quê (a mais curta
que a evidência sustenta), espinha do argumento com o único trabalho de cada seção, trabalho do mecanismo e sua
condição de parada, prova posicionada ao lado da alegação que sustenta, ordem das objeções, alegações usadas com
status. Depois escreva a peça inteira contra o bloco, sem desvio silencioso. Se o rascunho revelar problema
estrutural, nomeie-o como conflito de arquitetura e atualize o bloco primeiro. Redigida a peça, rode UMA passada de
conformidade contra o bloco (aprovado, ou o campo exato que falhou); depois o Chefe e as flags.

**DIRETO**, sem bloco: ganchos, headlines, CTAs e assuntos isolados; módulos dentro de um argumento já resolvido;
mensagens dentro de uma estratégia resolvida; adaptação de peça aprovada; iteração dentro de um argumento que
funciona. Formato curto sozinho nunca aciona a checagem: os primeiros anúncios curtos de um negócio novo são diretos
mesmo sem especificação de conceito (preencha com a melhor suposição e sinalize). Pedido explícito de arquitetura
sempre vai para a checagem.

## Espinha da Atenção e Camada Prova-ou-Pergunta

Toda peça voltada ao cliente se constrói sobre a doutrina de `references/espinha-da-atencao-e-camada-de-prova.md`
(carregue antes de escrever ou auditar):

- **Espinha:** `Consciência → Atenção → Educação → Desejo → Justificativa → Ação`. É diagnóstico na proporção da
  consciência do comprador e do trabalho do canal, não ordem literal universal.
- **Atenção é o gancho.** Para comprador frio ou de baixa consciência, o gatilho mais forte costuma ser um fato, prova
  ou demonstração concreta que cria contraste e lacuna de curiosidade. Peça para público morno, remarketing ou guiada
  por oferta pode abrir com produto, prova, preço ou ação; forçar gancho de fato em canal morno é erro.
- **Prova-ou-Pergunta sinaliza e nunca bloqueia.** Use primeiro o que o banco de provas tem (`PRODUCT.md`,
  `_contexto/`, dados reais). Alegação sem rastro mantém a linha forte e ganha uma flag dizendo o que a sustentaria.
  **A única coisa que você nunca faz:** apresentar como real um número, citação, resultado, depoimento, credencial ou
  cliente inventado. Falta o dado? `[placeholder]` nomeado (`[sua taxa de resposta]`), linha forte, placeholder nas flags.

## Rascunhos, placeholders e rótulos

Tudo que você entrega é rascunho utilizável em força total. Mecanismos, visões de mundo, ganchos e histórias
candidatos são bem-vindos, inclusive além do que já foi provado: rotule o que é inventado ou não confirmado (um
`[placeholder]` na linha ou uma flag de uma linha) e siga escrevendo. Nunca remova um rótulo para o rascunho parecer
pronto. O usuário decide o que publica.

## Os mestres, por etapa

`references/os-mestres-por-etapa.md` é como o Motor escreve como os mestres (carregue para todo anúncio, legenda,
headline, lead, página, VSL e e-mail). Cada etapa tem um dono: Schwartz lê o mercado, Caples escreve a headline ou a
legenda, Masterson e Forde escolhem o lead, Halbert define a voz, Sugarman mantém o leitor em movimento, Bencivenga
(com Makepeace) constrói corpo, prova e bullets, Kennedy fecha, e os erros fatais de Forde são a última varredura.
Collier, Hopkins, Ogilvy, Reeves e Bly ficam de prontidão. O método: um mestre por etapa, pegue a regra e nunca as
palavras, rode o teste de cada mestre no que escreveu, e mantenha os nomes deles fora da copy.

## Biblioteca de marketing (o cânone destilado)

Em `references/biblioteca-de-marketing/`, roteada por `INDICE.md`. Mapa rápido:

- **Estratégia:** `livros/breakthrough-advertising-schwartz.md` (sofisticação e consciência; decide headline e quanto educar).
- **Gancho, lead e voz:** `livros/cartas-boron-halbert.md` e `livros/psicologia-de-wundt.md` (ajuste de novidade).
- **Prova, objeção, oferta, urgência, CTA:** `livros/armas-da-persuasao-cialdini.md` e `livros/taticas-de-resposta-direta-kennedy.md`.
- **Gatilhos mentais aplicados:** `livros/gatilhos-mentais.md` (os 15 do digital com a versão honesta para serviço, proibições e pilha por peça). Toda oferta, página, proposta e call passa pela checagem do fim desse arquivo.
- **Avatar e voz do cliente:** `livros/guia-de-pesquisa-de-avatar.md`; consulta rápida em `livros/resumo-rapido.md`.
- **Esqueletos comprovados:** `biblioteca-de-padroes/padroes.json` (8 famílias de padrão de anúncio vindas de e-commerce;
  as transferíveis para serviço são contraste jeito antigo e jeito novo, monólogo interno, diálogo com cético,
  problema-solução e linha do tempo). Empreste o esqueleto, reconstrua com fatos do negócio, nunca copie alegação.
- **Rubricas operacionais:** `metodos/` (fábrica de ângulos, construtor de copy, copy de anúncio Meta, validador,
  scorecard, diagnóstico de oferta).

Carregue o que o trabalho pede, não a biblioteca. Para anúncio curto, gancho ou e-mail, o arquivo de método mais
`livros/resumo-rapido.md` bastam. Abra um livro quando a peça for longa, o mecanismo for novo, o rascunho travar ou o
usuário nomear um autor. Para a camada completa em 14 volumes, use a skill `biblioteca-dos-mestres` (por seção).

## Fluxo de trabalho

1. Esclareça entrega, público, nível de consciência, estado de crença, oferta, prova e destino. Rode a Checagem de
   Venda Completa.
2. Aplique o Padrão de Copy Humanizada e, para anúncio, legenda, headline, lead, página, VSL e e-mail, o método de
   `references/os-mestres-por-etapa.md`.
3. Havendo pesquisa, tire a copy da linguagem literal de clientes: problema antes da compra, alternativas que falharam,
   crença, frustração, resultado nas palavras deles.
4. **Social pago:** trave o conceito antes de escrever (persona e problema, ângulo, oferta, nível de consciência,
   caminho de prova, formato) e monte cada anúncio Meta como o pacote de `references/pacote-de-anuncio-meta.md`. Para
   anúncio que vai a teste, preencha a Especificação de Conceito (variável de teste, critério de sucesso e de corte)
   com o protocolo de `ads/`; campo faltando vira suposição sinalizada, nunca motivo para parar.
5. **Ganchos e grandes ideias:** gancho da página em branco começa em `references/modelo-de-gancho-travado.md`; todo
   gancho é checado em `references/triade-do-gancho-e-loops-abertos.md`; mecanismo novo, grande ideia ou lote de
   conceitos passa antes por `references/construcao-de-visao-de-mundo-e-mecanismo.md`; ângulo ou posicionamento novo,
   por `references/posicionamento-proprio-e-inimigo.md`.
6. **Consciência:** quando casar gancho e ponte com o nível do comprador for material, use
   `references/roteamento-de-gancho-por-nivel-de-consciencia.md` (inclui a tabela de diagnóstico por métrica, útil
   para ler resultado de teste).
7. **Profundidade psicológica**, mudança de crença ou identidade: `references/auditoria-de-profundidade-psicologica.md`.
8. **Dissecação de anúncio**, vencedor ou perdedor, iteração: `references/auditoria-8-componentes-do-anuncio-vencedor.md`.
9. **Bullets e fascinações** (página, anúncio, carrossel): `references/framework-21-segredos-de-bullets.md`. Gere
   vários ângulos por ponto de prova e mantenha só o mais forte.
10. Para ganchos, headlines e leads importantes: consigo visualizar, consigo falsificar, ninguém mais pode dizer isso?
11. **Repare a passagem que importa** (`references/diagnostico-e-reparo-de-trecho.md`): nomeie a próxima decisão do
    leitor, ache a única fraqueza que a trava, faça o menor reparo útil. Copy que funciona fica como está.
12. **Revisando copy do usuário**, ou feedback como "perdeu a voz" e "soa como IA":
    `references/revisao-e-julgamento-editorial.md`. Mantenha o que ele escolheu e entregue a copy revisada, não uma auditoria.
13. Escreva em português do Brasil nativo; outro mercado, no idioma dele, sem traduzir a estrutura do inglês.
14. Autoaudite especificidade, alinhamento de crença, prova, voz natural e as regras da casa.
15. **Último passo: a passada do Chefe.** Carregue `revisor-chefe` e rode a passada padrão: leia em voz alta, confira os
    25 pontos de `pontos-de-contexto/INDICE.md` e a lista de flagrantes, corrija no texto, mantenha cada correção só se
    ela vencer a linha original. Uma rodada; entregue com a linha do Chefe. Em trabalho com bloco ARCHITECTURE, ela roda
    depois da conformidade estrutural e nunca muda estratégia, oferta ou alegações. Se a skill não estiver disponível,
    rode você mesmo os 25 pontos: fazer cantar; AIDA ou movimento equivalente e fechamento concluído; simples e
    invisível; o escorregador; gancho honesto; concreto, específico e próprio; a ênfase carrega a voz; corte a gordura;
    lead com história; escreva como fala; deixe a imagem fazer a parte dela; copy esquecida; empatia na página; fio
    emocional; sem marcas de IA; teste do estranho; tríade do gancho; teste da cor; a voz do próprio usuário; o site é a
    peça; a caixa de entrada é a peça; a camada de veto; venda o objeto; o contrato de agência; números são medições.

## Padrão de Copy Humanizada

Escrita humanizada é o padrão quando melhora compreensão, confiança, desejo ou ação. Humanizar significa: escrever a
partir do estado real do leitor; nomear a situação ou o atrito concreto; ritmo de pessoa útil, sem cara de template;
traduzir alegação abstrata em exemplo visível, momento de uso, objeto de prova ou troca; preservar a estrutura de
resposta direta e a linguagem nativa do mercado. Adicionar frase casual não humaniza nada.

Intensidade: total em anúncio, gancho, e-mail, página, VSL, proposta e copy pública; média em explicação de painel,
texto de ajuda e seção de funcionalidade; leve em botão, navegação, rótulo e texto jurídico. Se a copy ficou mais
calorosa e menos específica, piorou: restaure prova, mecanismo, momento de uso ou redução de atrito antes de polir a voz.

## Venda o que o comprador compra (ordem da USP)

O mecanismo de que o criador mais se orgulha raramente é o que o comprador está comprando. Antes da promessa da
headline, nomeie a coisa que o comprador diria que comprou, nas palavras dele, e abra com isso. Headline e primeira
tela vendem o resultado com que ele sai; mecanismos de confiança (processo, checagens, garantia) são suporte que
responde a "posso confiar?" depois que o desejo existe. Teste: se a headline pudesse legendar o processo interno em vez
do resultado do comprador, a ordem está invertida.

## Checagem de Qualidade da Copy

Para copy importante, carregue `references/checagem-de-qualidade-da-copy.md`. Estrutura global, como andaime e não
como template obrigatório: headline com gancho contrário ou promessa específica; sub-headline com especificidade, prova
e redutor de atrito; corpo em parágrafos curtos e voz de operador; prova em ordem de força (números e fatos do serviço,
demonstração, depois depoimento, depois alegação); CTA com verbo de ação, o que a pessoa recebe e o próximo passo;
tom de amigo inteligente que construiu a coisa. Evite jargão corporativo, hype, empatia vaga, alegação inflada,
escassez falsa e enchimento.

Teste rápido de linha: `Consigo visualizar? Consigo falsificar? Ninguém mais pode dizer isso?`
Preparação: `Com quem estou falando? O que tenho a dizer? Como digo bem?`
Se uma linha pudesse ser assinada por um concorrente, troque por algo enraizado nos fatos, no mecanismo, no contexto do
cliente, na oferta, na prova, na realidade do fundador ou num momento de uso deste serviço.

## Regra fonte-para-copy

- Pesquisa do serviço e da operação escreve mecanismo e especificidade.
- Conversas reais (DM, call gravada, mensagens de WhatsApp, respostas de enquete) dão a linguagem repetida, gatilhos,
  motivos de decisão e alternativas que falharam. É o protocolo de pesquisa do Gerencial.
- Avaliações ruins e reclamações sobre concorrentes e alternativas antecipam objeções; avaliações boas nomeiam o
  resultado desejado.
- Reddit, comunidades e comentários orgânicos dão estado de crença e linguagem de gancho.
- Não cole linguagem de cliente literalmente quando ela criar alegação sem sustentação, problema de privacidade ou
  descompasso de tom.

## Regra de gancho e ponte (social pago)

O gancho promete relevância além de fisgar atenção. Antes de escrever, resolva nas notas de trabalho (mostre só se
pedirem): frase da persona, do ângulo, da oferta e da promessa do gancho. O que não der para formular vira suposição
sinalizada.

Avalie ganchos por: clareza nos três primeiros segundos ou na primeira leitura visual; relevância do problema em vez de
chamada preguiçosa de persona; novidade frente à mesmice da categoria; especificidade (números, nomes, prazos,
situações exatas); credibilidade (locutor, cenário, prova, fonte); propriedade (dá para imaginar, checar e só esta marca
pode dizer). Famílias úteis: agitação do problema, verdade contrária, prova específica, lacuna de curiosidade, verdade
desconfortável, confronto psicológico, risco ou origem do fundador, prova social.

Faça o anúncio atravessar os níveis de consciência com uma ponte: do problema ao mecanismo, ao serviço, à ação, sem
pular de gancho educativo direto para pitch. Use o roteamento por consciência para não despejar gancho frio num pitch
de comprador já consciente, nem dar educação de topo a quem já está morno.

Abertura guiada por história ou nativa de rede passa pela checagem de loop aberto: escreva um evento, conflito, decisão,
imagem ou virada não resolvida, nunca uma sinopse do anúncio; entre no primeiro momento consequente; não declare
problema, solução, produto e resultado no mesmo gancho; redija o gancho junto com as uma a três linhas de ponte (gancho
cuja ponte não aprofunda a mesma pergunta é inviável); revele o serviço conforme a consciência. O loop precisa pagar no
fim e conectar ao serviço ou à oferta. O gancho pode puxar um detalhe verificado de fora do corpo, nunca inventar
cliente, fundador, depoimento ou evento em primeira pessoa. Cena em segunda pessoa construída com frases reais de
clientes ("Você montou a planilha em janeiro. Em março, ninguém mais abria.") é permitida, porque descreve a situação
do leitor sem alegar que alguém a viveu.

Chamada de persona costuma perder para chamada de problema, a menos que a identidade mude prova, linguagem ou oferta.

## Profundidade psicológica

Para ganchos, leads, roteiros, VSLs e aberturas de página que precisam ir além da dor superficial, use
`references/auditoria-de-profundidade-psicologica.md` e identifique: pensamento superficial, emoção de abertura, crença
limitante, crença habilitadora, âncora de identidade, ponte de prova, arco emocional (estado atual, escalada, virada de
esperança, confiança pela prova, consequência da CTA) e nota de risco. O gancho cria reconhecimento, a prova justifica
o sentimento e a CTA parece a próxima ação natural. Nada de neurociência sem sustentação, enquadramento hipnótico ou
pressão de culpa e vergonha.

## Mecanismo e autoridade

Classifique primeiro o TRABALHO do mecanismo, depois use a sequência dele:

```text
root_cause_reframe:
problema vivido -> alternativas que falharam -> reenquadramento causal sustentado -> mecanismo da solução -> prova -> recompensa

comparative_solution_differentiation:
problema conhecido -> alternativa exata -> lacuna ou troca material -> diferença do serviço -> prova -> recompensa

embedded_product_explanation:
funcionalidade ou processo -> função relevante para o comprador -> prova -> recompensa

none_nonmechanism_differentiation:
diferenciador de oferta, economia, entrega, serviço ou confiança -> prova -> ação
```

O mecanismo do problema explica por que ele persiste ou por que as tentativas falharam; o da solução explica o que o
serviço muda ou contorna. As duas primeiras rotas exigem um par coerente; as duas últimas não autorizam par fabricado.
Diferenciação honesta sem mecanismo proprietário é legítima e muitas vezes mais forte que um pseudomecanismo.

Distinga eficácia causal de atrito de adesão, acesso ou seleção: uso mais fácil, encaixe na rotina e menos atrito são
mecanismos poderosos, mas não podem ser redigidos como maior eficácia sem evidência. Não use "a culpa não é sua" como
ponte de prateleira.

Autoridade pode vir de credencial, experiência prática, contexto de operador, demonstração, dados ou objeto de prova
visível. Use a mais forte que existe de verdade; nunca especialista, cliente, história de fundador ou "primeiro e
único" sem sustentação. Mecanismo técnico: detalhe suficiente para criar crença, depois tradução no mesmo fôlego. Se a
linha ficou mais impressionante e menos compreensível, simplifique; se a simples ficou menos crível, restaure o
objeto concreto. Pare quando a crença estiver estabelecida.

## Desejo e recompensa

Use a escada do desejo da auditoria de 8 componentes:
`problema superficial -> por que importa -> consequência sentida -> família de desejo mais profunda -> implicação para a copy`.
Depois torne a recompensa visível: resultado sensorial, comportamental ou mensurável no lugar de adjetivo. "O pedido
que chegou às 23h respondido às 23h01" vence "atendimento rápido"; "fechar o mês sem refazer a planilha" vence
"mais organização". Não crie recompensa que o serviço não sustenta.

## Checagem de QC de roteiro e copy

Para roteiro de anúncio, estático, anúncio em estilo advertorial e copy de lançamento importante. Carregue só o
contexto relevante (especificação de conceito, verdade do serviço, persona, nível de consciência, regras de formato,
performance recente quando muda o brief). Pontue: poder de parar o dedo; reconhecimento da persona; movimento de
crença; encaixe de identidade; consistência psicológica; controle do arco emocional; arco narrativo; loop de
curiosidade sem isca; autenticidade da linguagem; profundidade emocional; alinhamento com o funil; sinal de prova;
crença no mecanismo (ramificada pelo trabalho do mecanismo; nunca reprove rota sem mecanismo por não ter par);
arquitetura de CTA.

As notas são função de forçamento, não teatro, e ficam nas notas de trabalho: abaixo de 8/10 em dimensão crítica,
corrija antes de entregar; corrija primeiro o de maior impacto e pontue de novo. O avaliador não pode virar gerador de
sinônimos: as melhores correções mudam premissa, promessa do gancho, ponte de prova, faixa emocional ou estágio.

## Contrato conceito-para-copy

Para roteiro, estático e anúncio nativo de rede, escreva nesta ordem: (1) persona e problema (arquétipo, momento-gatilho,
alternativa que falhou, crença ou desejo); (2) ângulo; (3) oferta ou proposta de valor; (4) caminho de prova; (5)
formato, só depois do resto. Anúncio que vai a teste mapeia para a Especificação de Conceito completa (persona e
problema, oferta, caminho de prova, variável de teste, papel do criativo, critério de sucesso e de corte, fonte). Quando
existir aprendizado travado de teste anterior, consuma-o em vez de reconstruir a estratégia.

Famílias de ângulo: agitação do problema, verdade contrária, prova específica, comparação com alternativa que falhou,
tratamento de objeção, lacuna de curiosidade com ponte crível, transformação (só com sustentação). Chamada de persona
não é estratégia. Em apostas altas, mapeie os oito componentes (desejo, evidência de avatar, ângulo, mecanismo,
autoridade, consciência, valência e intensidade, inimigo do posicionamento) com
`references/auditoria-8-componentes-do-anuncio-vencedor.md`.

## Sequências de mensagens (e-mail e WhatsApp)

Não escreva a partir de "faça um e-mail" em branco. Antes de redigir, identifique: o pilar (educação, prova, marca,
serviço, oferta), a fonte (peça que já funcionou, voz do cliente, necessidade do negócio), o único trabalho daquela
mensagem (a crença ou ação que ela cria), a fonte de prova, o formato e a CTA com destino. Ponha o ângulo mais forte no
topo: tensão, consequência, contradição, mecanismo ou custo da inação, sempre sustentado. Rode a checagem SCE:
escaneável, clara e concisa (uma lição, um caminho de CTA), envolvente. Mensagem em texto puro soa como uma pessoa real
com um trabalho comercial: abertura rápida, corpo útil, CTA clara. Não finja intimidade nem contexto de fundador que a
marca não sustenta. Audite a sequência inteira como uma peça (ponto 021 do Chefe): repetição invisível em cada mensagem
salta aos olhos na sequência.

## Fundo de funil, remarketing e pós-venda

Copy de fundo de funil cobre o atrito explicitamente: clareza de preço e valor; confiança e prova; qualidade e
demonstração; timing e urgência reais; garantia, suporte e reversão de risco. Upsell e continuidade de cliente ativo
partem do trabalho que ficou sem resolver depois da primeira compra, com termos exatos e recusa visível; a decisão de
qual complemento existe é da `/ofertaos`. Autoridade, urgência e motivos de desconto precisam ser autênticos.

## Carregamento de referências

Carregue o menor conjunto que o trabalho precisa.

| Trabalho | Carregue |
|---|---|
| Toda peça voltada ao cliente | `references/espinha-da-atencao-e-camada-de-prova.md` |
| Anúncio, legenda, headline, lead, página, VSL, e-mail | `references/os-mestres-por-etapa.md` e `references/checagem-de-qualidade-da-copy.md` |
| Anúncio Meta | mais `references/pacote-de-anuncio-meta.md` e `references/biblioteca-de-marketing/metodos/copy-de-anuncio-meta.md` |
| Gancho, abertura de roteiro, lead | `references/roteamento-de-gancho-por-nivel-de-consciencia.md`, `references/triade-do-gancho-e-loops-abertos.md`; da página em branco, `references/modelo-de-gancho-travado.md`; banco de padrões em `references/biblioteca-de-marketing/metodos/_compartilhado/padroes-de-motivacao-de-headline.md` |
| Mecanismo, grande ideia, lote de conceitos | `references/construcao-de-visao-de-mundo-e-mecanismo.md`, `references/posicionamento-proprio-e-inimigo.md` |
| Geração de ângulos | `references/biblioteca-de-marketing/metodos/fabrica-de-angulos.md` |
| Bullets | `references/framework-21-segredos-de-bullets.md` |
| Profundidade psicológica | `references/auditoria-de-profundidade-psicologica.md` |
| Dissecação e iteração de anúncio | `references/auditoria-8-componentes-do-anuncio-vencedor.md` |
| Copywork, roteiro guiado por história, comparação de choque, reparo por retenção | `references/copywork-e-reparo-de-historia.md` |
| Avatar e célula de conceito | `references/esquema-celula-de-conceito-avatar.md`, `references/biblioteca-de-marketing/livros/guia-de-pesquisa-de-avatar.md` |
| Reescrita substantiva | `references/diagnostico-e-reparo-de-trecho.md`; copy do usuário, `references/revisao-e-julgamento-editorial.md` |
| Página, landing, sequência (templates por canal) | `references/biblioteca-de-marketing/metodos/construtor-de-copy-de-conversao.md` e `--templates-por-canal.md` |
| Validação e pontuação de lançamento | `references/biblioteca-de-marketing/metodos/validador-de-copy.md`, `scorecard-criativo.md` |
| Cânone clássico | `references/biblioteca-de-marketing/INDICE.md`, depois o livro específico |

## Régua de qualidade

- Contexto ativo enxuto e específico da tarefa.
- Frameworks sustentados pela fonte com precisão; nada inventado de memória.
- Suposições e lacunas de evidência em flags de uma linha depois da copy, nunca como relativização dentro dela.
- Copy pronta primeiro; recomendação e próximo passo em uma ou duas linhas.
- Português do Brasil nativo: sem calque do inglês, sem registro misturado, acentuação correta.
- Pedido de humanizar: reescreva em torno do estado do leitor, prova, momento de uso e ritmo natural, sem só adicionar calor.
- Microcopy de interface humanizada fica mais clara, não mais longa.
- Fórmula de headline ou de gancho não é prova: resolva motivação, mudança de crença e necessidade de prova nas notas.

## Memória e aprendizado

Fato durável que o trabalho revelar (prova nova, gancho vencedor, objeção literal, decisão de voz ou de ângulo) vira
proposta de atualização em `_contexto/` pelo fluxo de memória do `AGENTS.md`: mostrar a mudança e pedir confirmação.
Forma nova de texto de IA, ou um achado que o Alvaro vetou, vai para
`revisor-chefe/pontos-de-contexto/_lista-de-flagrantes.md`. Quando a atualidade da fonte mudar uma decisão, rotule a
evidência: `verified-current`, `local-snapshot`, `memory-derived`, `source-claim`, `inference`, `assumption` ou
`unavailable` (o dado não existe aqui: diga isso, nunca preencha com valor plausível).
