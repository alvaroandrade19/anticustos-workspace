# Teste de posicionamento: rodada 04

Aberto em 2026-10-14. No ar desde 21/10/2026 às 08:00. **Stories retirado em 21/10 por volta das 22h:
a contagem recomeça daí. Parada: 150 sessões contadas da edição, ou 31/10.** Ver seção 11.
Documento de retomada: leia isto antes de analisar os dados quando eles chegarem.
A rodada anterior, com o diagnóstico que levou a esta, está em `teste-captura-2026-10.md`.

---

## 1. A pergunta que este teste responde

**Fora do Reels, quem chega à página começa o quiz?**

Uma pergunta só, e ela vem antes de qualquer outra. Enquanto ninguém começa o quiz,
não dá para avaliar quiz, resultado, oferta nem WhatsApp, porque não chega ninguém lá.

---

## 2. Por que chegamos aqui: o diagnóstico da rodada 03

Rodada de 13 e 14/10/2026, R$ 66,17, 804 sessões, zero conversas. Pausada em 14/10.

| Etapa (página B) | Número | Taxa |
|---|---|---|
| Sessões | 394 | |
| Começou o quiz (`QuizStart`) | 9 | 2,3% das sessões |
| Chegou ao resultado (`Lead`) | 4 | 44% de quem começou |
| Tocou no WhatsApp (`Contact`) | 0 | |
| Conversa no WhatsApp | 0 | |

Na página A, que pede telefone na entrada, foram 410 sessões e zero telefones.

**O funil quebrou na chegada.** 97,7% saíram da primeira tela sem tocar em nada.
**A causa é o posicionamento.** Quase 100% da entrega foi para Reels. Otimizando por
visualização da página, a Meta foi para o inventário onde a visita sai mais barata, e
no Reels o botão de chamada fica sobreposto ao vídeo e a pessoa está rolando para se
distrair. CTR de 12%, visita a R$ 0,08 e 2,3% de início são o mesmo fenômeno.

**Consequência que muda a leitura das duas rodadas:** a oferta e a página ainda não
foram testadas com tráfego que tenha intenção. A rodada 01 mandou anúncio de outro
produto; a 03 mandou gente rolando Reels. Somadas: R$ 173,66, 1.410 sessões, zero
conversas, e nenhuma delas condena a oferta.

**O que a rodada 03 deixou decidido:**
- Base é a `/diagnostico-b`. Pedir telefone na entrada leva o início de 2,3% a zero.
- O quiz não foi condenado: 4 de 9 que começaram chegaram ao resultado.
- Criativo 07 tem CTR maior que o 06 nas duas rodadas (13,25% contra 10,99%, z ≈ 2,9).

---

## 3. A estrutura

```
CAMPANHA   [TRÁFEGO] [DIAG-B] [INSTA] [ABO-20] [FRIO] [CT] [1-1-1] [04]
destino: /diagnostico-b          (sem captura, base vinda da rodada 03)
└─ 01 - [FEED] [Aberto] [25-55] [CRIATIVO_07]   R$ 20/dia
   └─ CRIATIVO_07   (imagem 7_feed.png)

R$ 20/dia · sem data de término · pausa manual pela regra da seção 7
```

**Configuração:**
objetivo Tráfego · otimização por **visualizações da página de destino** (a mesma da
rodada 03, para que só o posicionamento mude) · Aberto 25-55 · sem segmentação
detalhada · posicionamento MANUAL, **só Feed do Instagram** · sem Reels, Stories,
Explorar, Facebook, Audience Network e Messenger · sem música · aprimoramentos
automáticos de texto do criativo **desligados** · mesma copy do 07 na rodada 03.

**Link:**
```
https://anticustos.vercel.app/diagnostico-b?utm_source=meta&utm_medium=paid-social&utm_campaign=diag-b-ct-04&utm_content=criativo_07
```

### 3.1 Montagem passo a passo

O caminho mais seguro é **duplicar a campanha B da rodada 03** em vez de criar do zero:
a cópia herda público, otimização, pixel e o anúncio do 07 com a copy aprovada, e só
quatro coisas mudam. Criar do zero abre espaço para uma configuração diferente passar
despercebida e virar uma segunda variável.

**Campanha.** Duplicar `[TRÁFEGO] [DIAG-B] [INSTA] [ABO-10] [FRIO] [CT] [1-2-2] [03]`.
- Renomear para `[TRÁFEGO] [DIAG-B] [INSTA] [ABO-20] [FRIO] [CT] [1-1-1] [04]`
- Orçamento Advantage da campanha (CBO): **desligado**
- Teste A/B da Meta: desligado

**Conjuntos.** A cópia traz dois. **Excluir** o do CRIATIVO_06 e ficar com o do 07.
- Renomear para `01 - [FEED] [Aberto] [25-55] [CRIATIVO_07]` (sem "R$ 10/dia" no nome)
- Orçamento diário: **R$ 20**
- Programação: data de início, **sem data de término**
- Meta de desempenho: maximizar **visualizações da página de destino** (não mudar)
- Público: não mudar (Aberto, 25 a 55, sem segmentação detalhada, mesma localização)
- Posicionamentos: **Manual**. Desmarcar Facebook, Messenger e Audience Network. No
  Instagram, deixar marcado **só "Feed do Instagram"**: desmarcar Stories, Reels,
  Explorar, Feed do perfil e todo o resto da lista.

**Anúncio.** Manter só o `CRIATIVO_07`.
- Imagem `7_feed.png` (4:5). Se a cópia trouxe personalização por posicionamento com
  `7_story.png`, tudo bem: com só o Feed marcado, ela não aparece.
- Link de destino trocado para o da seção 3 (`utm_campaign=diag-b-ct-04`). Conferir
  que o campo "Parâmetros de URL" do Meta está **vazio**, senão a UTM duplica.
- Aprimoramentos do criativo (Advantage+ creative, texto e imagem): **todos desligados**
- Copy: igual à da rodada 03, sem nenhuma edição

**Antes de publicar.** Na prévia, ver o anúncio no Feed com a imagem inteira. No
resumo do conjunto, conferir que aparece um posicionamento só.

**Quando subir.** De terça a quinta, de manhã. Subir na sexta põe os dias de
aprendizado em cima do fim de semana, que tem outro público rolando o Feed.

**Depois de publicar.** Com o anúncio ativo (pode levar horas na revisão), fazer o
teste no celular pelo link real até o WhatsApp e anotar o horário, para descontar.

---

## 4. Por que cada decisão foi tomada

**Só Feed, e não Feed contra Stories.** O desenho com dois conjuntos foi considerado e
descartado pelo custo: a visita no Feed deve sair perto de R$ 0,80, e dois conjuntos
de R$ 10/dia levariam duas semanas para juntar 150 sessões cada. O Feed é o
posicionamento de maior intenção, então é ele que responde à pergunta. Stories tem o
mesmo comportamento de toque em tela cheia do Reels e entra só se o Feed funcionar.

**Só o criativo 07.** Com um conjunto só, dois criativos voltariam a disputar verba
dentro dele. O 07 é o de maior CTR nas duas rodadas.

**Mesma otimização e mesmo público.** Se o posicionamento for a única coisa que muda,
a comparação com a rodada 03 é limpa: mesma página, mesmo criativo, mesmo público,
mesmo evento otimizado.

**Métrica nova: custo por `QuizStart`.** A rodada 03 mostrou que o custo por sessão
engana. Ele pode ser excelente com zero intenção por trás. A partir daqui o que se lê
é quantas pessoas começaram o quiz e quanto custou cada uma. Para isso existir no
Gerenciador de Anúncios, precisa da conversão personalizada da seção 8.

---

## 5. A base de comparação

Rodada 03, página B, quase tudo entregue no Reels:

| | Valor |
|---|---|
| Custo por sessão | R$ 0,084 |
| Taxa de início do quiz | **2,3%** (9 de 394) |
| **Custo por `QuizStart`** | **R$ 3,67** |
| Resultado por início | 44% (4 de 9) |
| Conversas | 0 |

**Comparação justa entre as rodadas:** taxa de início, taxa de resultado, conversas.
**Não comparar:** CPM, CTR e custo por sessão, que mudam por definição quando o
posicionamento muda. Visita mais cara no Feed é o preço da mudança, não defeito.

### Projeção

```
R$/sessão = (CPM / 1000) ÷ (CTR × taxa de carregamento)
```

| Cenário | CPM | CTR | Carreg. | R$/sessão | Dias até 150 sessões |
|---|---|---|---|---|---|
| Otimista | R$ 12 | 3,0% | 92% | R$ 0,43 | 3,3 |
| **Central** | R$ 18 | 2,5% | 90% | **R$ 0,80** | 6 |
| Pessimista | R$ 25 | 1,5% | 88% | R$ 1,89 | 10 (com ~105 sessões) |

**Planejar com R$ 0,80 por sessão e R$ 120 a R$ 200 no total.**

**Ponto de empate com o Reels:** a R$ 0,80 por sessão, o Feed precisa de 22% de
início para empatar no custo por `QuizStart`. Mas empatar no custo não é a régua
principal: no Reels, 9 inícios deram zero conversas. Um início vindo do Feed vale mais
se ele avançar até o resultado e o WhatsApp.

**Alarme:** acima de **R$ 2,50 por sessão** é defeito, não efeito (anúncio limitado ou
recusado, público pequeno demais, página lenta). Investigar antes de esperar mais.

---

## 6. Como ler quando os dados chegarem

**Métrica primária: taxa de início do quiz** (`QuizStart` ÷ sessões).

**Secundárias, em ordem:**
1. Custo por `QuizStart`, no Gerenciador de Anúncios, pela conversão personalizada
2. `Lead` ÷ `QuizStart` (quem começou e terminou)
3. `QuizStep` por etapa, se o furo de instrumentação estiver resolvido: em qual
   pergunta a pessoa desiste
4. `Contact` ÷ `Lead` e conversas no WhatsApp (mensagem abre com "Olá! Acabei de fazer
   o diagnóstico no site.")

**Régua do criativo no Feed** (coluna de serviço de `Wiki/Gerencial/Métricas e
Diagnóstico.md`, que finalmente se aplica): CTR bom acima de 2%, corte abaixo de 1,5%.

**Onde contar:** Gerenciador de Eventos, pixel `1175560701016650`, período da rodada.
A página A está pausada e o Pixel dela só carrega depois do telefone, então os
eventos do quiz no período são todos da B. Descontar qualquer teste próprio, e os
testes do agente das páginas de 14/10 (`utm_source=teste`, `utm_content=teste-agente`).
No `QuizStep`, as etapas 1, 2, 5 e 6 trazem `opcao` (posição da resposta); traduzir
pelo mapa no topo de `quiz-b.js`.

---

## 7. Regra de parada e de decisão, escritas antes de ver o número

**Parar** com **150 sessões** ou no **dia 10**, o que vier primeiro.
**Não editar nada enquanto roda.** Qualquer edição reinicia o aprendizado.

**Por que 10 inícios é a linha:** se o Feed tivesse a mesma taxa do Reels (2,3%), 150
sessões dariam 3,4 inícios em média, e chegar a 10 ou mais teria 0,3% de chance. Dez
inícios em 150 sessões (6,7%) é o menor número que separa o Feed do Reels com folga.

| Resultado com 150 sessões | Veredito | Próxima rodada |
|---|---|---|
| **10 ou mais inícios** | **O posicionamento era o problema.** Feed vira o padrão | Seguir o funil: onde os inícios param (quiz, resultado ou WhatsApp) decide a rodada 05 |
| **6 a 9 inícios** | Direção melhor, sem certeza | Estender até 250 sessões sem editar nada, se a verba couber |
| **5 ou menos** | **O posicionamento não era o problema.** Feed igual ao Reels | Problema sobe para a mensagem: anúncio e primeira tela prometendo coisas diferentes, ou público sem dono de empresa. A rodada 05 testa a primeira tela |
| **Qualquer conversa no WhatsApp** | É o primeiro sinal de demanda real em três rodadas | Registrar com criativo, horário e resposta, e atender antes de qualquer análise |

Se parar no dia 10 com menos de 150 sessões, aplicar a mesma tabela em proporção
(6,7% como linha de corte) e registrar que a amostra ficou curta.

---

## 8. Checklist antes de subir

**Alvaro, no Meta:**
- [x] Criar a conversão personalizada (14/10): `QuizStart - DIAG-B - anuncio`, evento
      `QuizStart`, regras URL contém `diagnostico-b` E URL contém `utm_source=meta`
      (exclui a `/`, a `/diagnostico` e os testes com `utm_source=teste`). Categoria
      "Iniciar teste", escolhida por não coincidir com Lead, Contato nem Visualização
      de conteúdo, que são eventos lidos na análise. Sem valor. Só conta daqui para a
      frente. Colunas de resultado e custo dela já estão no Gerenciador de Anúncios.
- [x] Aba Diagnóstico do pixel (14/10): sem aviso de saúde nem de evento restrito.
      `QuizStep` e `Contact` dos testes do agente apareceram na Visão geral, o que
      confirma a correção do furo da rodada 03.
- [x] Na prévia do anúncio, confirmar que o Feed usa `7_feed.png` (4:5).
- [x] Confirmar que os aprimoramentos automáticos de texto estão desligados.

**Agente das páginas:**
- [x] Resolver o furo do `QuizStep` (14/10). O evento saía do navegador com 200 nas 6
      etapas, levando o texto da resposta ("Clínica ou consultório"). Hipótese: filtro
      de dado de saúde do Meta. Agora vai `{ step, opcao }`, com `opcao` = posição da
      opção (1 = primeira); o mapa posição para texto está no topo de `quiz-b.js`.
      Conferido no ar (`quiz-b.js?v=20261014`). Prova final: o `QuizStep` aparecer no
      Gerenciador de Eventos.
- [x] Verificar a `/diagnostico-b` de ponta a ponta no ar, até o botão do WhatsApp
      (47 de 47 no `verificar-b.js`, local e no ar).
- [x] Desligar os eventos automáticos do Pixel (14/10, conferido no ar em `/`,
      `/diagnostico` e `/diagnostico-b`): `fbq('set', 'autoConfig', false,
      '1175560701016650')` antes do `fbq('init', ...)`. O `SubscribedButtonClick`
      automático manda o texto de cada botão tocado, inclusive "Clínica ou
      consultório", e mantém o risco do filtro de saúde.

**Alvaro, no celular:**
- [x] Teste no celular feito em 21/10, fluxo inteiro até o WhatsApp sem erro. Descontar
      1 `QuizStart`, 1 `Lead` e 1 `Contact` desse dia na leitura.

---

## 9. Limitações conhecidas

**A `/diagnostico-b` não grava nada na base própria.** Tudo se lê no Gerenciador de
Eventos e na caixa do WhatsApp.

**Comparação entre rodadas, não simultânea.** O Reels não roda junto, então a base
de 2,3% vem de outra semana. Se o Feed vencer por pouco, a diferença de semana pode
explicar parte dela. É o motivo de a linha de corte ser alta (10 inícios).

**Nenhum benchmark de Feed é próprio.** A projeção usa a coluna de serviço do
Gerencial, de vigência `provisorio`. Esta rodada é a primeira medida própria de Feed.

---

## 10. Primeira coisa a fazer quando os dados chegarem

1. Exportar do Gerenciador por campanha e por anúncio, com a coluna da conversão
   QuizStart, e colocar os CSVs em `ads/`.
2. Anotar do Gerenciador de Eventos: `ViewContent`, `QuizStart`, `QuizStep` (com a
   quebra por `step`), `Lead`, `Contact`.
3. Contar as conversas no WhatsApp.
4. Ler pela tabela da seção 7, que foi escrita antes do número.

---

## 11. Dia 1 com Stories junto (21/10, antes da edição)

A cópia da campanha subiu com **Feed e Stories** marcados, e não só Feed como a
seção 3 pede: o Reels foi retirado e o Stories ficou. Percebido no fim do dia 1 pelo
ritmo de visitas, corrigido por volta das 22h (edição de posicionamento, que reinicia
o aprendizado). CSV em `ads/BM-01---Conta-de-anúncios-Campanhas-21-de-out-de-2026-21-de-out-de-2026.csv`.

| | Feed | Stories |
|---|---|---|
| Gasto | R$ 8,19 | R$ 5,69 |
| Impressões | 1.899 | 1.192 |
| CPM | R$ 4,31 | R$ 4,77 |
| CTR de link | 1,58% | 1,51% |
| Sessões | 31 | 19 |
| R$/sessão | R$ 0,26 | R$ 0,30 |
| `QuizStart` atribuído | 0 | 0 |

**O que esse dia mostra, sem decidir nada:**
- O CTR caiu de 12% (Reels) para ~1,5%, o comportamento esperado de quem rola o Feed
  com atenção. Fica em cima da linha de corte da coluna de serviço (1,5%).
- A sessão saiu a R$ 0,26, bem abaixo da projeção central de R$ 0,80, porque o CPM
  veio a R$ 4,31 em vez de R$ 18. A rodada deve chegar a 150 sessões antes do previsto.
- Zero `QuizStart` em 50 sessões. Com a taxa do Reels (2,3%) isso é o normal. Com 10%
  teria 0,5% de chance; com 6,7%, a linha de corte, 3%. É um sinal amarelo contra uma
  taxa alta de início, não veredito, porque a atribuição no Gerenciador de Anúncios pode
  atrasar horas. Conferir o total bruto de `QuizStart` de 21/10 no Gerenciador de
  Eventos (descontando o teste do celular).
- O teste no celular de 21/10 foi feito pelo link da prévia, que não é clique de
  anúncio, então não entra na coluna atribuída; só no total bruto do Gerenciador de Eventos.

**Na leitura final:** a rodada 04 é só o Feed a partir da edição. O dia 1 fica de fora
da tabela da seção 7 e entra apenas como contexto.

---

## 12. Leitura e veredito (29/10/2026)

CSVs de 29/09 a 28/10 por campanha e por conjunto em `ads/`. O export cobre a rodada
inteira (21 a 28/10); os números só de Feed saem tirando o dia 1 da seção 11.

| | Rodada inteira | Dia 1 (Feed + Stories) | **Só Feed, após a edição** |
|---|---|---|---|
| Gasto | R$ 86,16 | R$ 13,88 | **R$ 72,28** |
| Impressões | 21.442 | 3.091 | 18.351 |
| CTR de link | 1,45% | ~1,55% | ~1,43% |
| Sessões | 295 | 50 | **245** |
| R$/sessão | R$ 0,29 | R$ 0,28 | R$ 0,30 |
| `QuizStart` atribuído | 4 | 0 | **4 (1,6%)** |
| Conversas no WhatsApp | 0 | | **0** |

A parada de 150 sessões foi passada (a campanha rodou até 245 sessões de Feed). Não
muda a leitura, só deixa a amostra maior.

**Veredito: o posicionamento não era o problema** (linha "5 ou menos" da seção 7).
Taxa de início no Feed de 1,6%, intervalo de 95% entre 0,45% e 4,1%, contra 2,3% no
Reels. Se o Feed tivesse 6,7% (a linha de corte), dar 4 ou menos em 245 teria 0,02%
de chance. Feed e Reels começam o quiz na mesma taxa.

**O que isso muda:** no Feed o clique é deliberado (CTR de 1,4%, sem toque acidental)
e, mesmo assim, 98,4% saem da primeira tela sem tocar. O defeito está na passagem do
anúncio para a primeira tela, ou em quem clica: anúncio e página prometendo coisas
diferentes, ou público aberto que se interessa pelo assunto mas não é dono de empresa.

**Acumulado das três rodadas** (01, 03 e 04): R$ 264,57, 1.762 sessões, zero conversas.

**Decisão de 29/10:** ver `_contexto/agora.md` e a conversa de 29/10. A recomendação
registrada é pausar o tráfego pago e mudar a aquisição para prospecção ativa por sinal
de necessidade (`/prospector`), usando o diagnóstico como ferramenta da conversa, até
haver conversas reais que deem a linguagem para reescrever anúncio e primeira tela.
