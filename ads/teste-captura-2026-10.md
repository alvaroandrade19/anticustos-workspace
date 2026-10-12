# Teste A/B de captura: rodada 03

Aberto em 2026-10-08. Subida programada para terça, 13/10/2026.
Documento de retomada: leia isto antes de analisar os dados quando eles chegarem.

---

## 1. A pergunta que este teste responde

**Pedir o telefone antes das perguntas custa mais conversas do que rende números?**

A `/diagnostico` pede nome e WhatsApp na etapa 0, antes de entregar qualquer coisa.
A `/diagnostico-b` não pede nada: a pessoa responde as 6 perguntas, vê o resultado e
decide se abre conversa no WhatsApp.

A A entrega conversas **mais** telefones de quem nunca mandou mensagem.
A B entrega só conversas. A assimetria é exatamente o que está em teste.

---

## 2. Por que chegamos aqui: o diagnóstico da rodada 01

Rodada de 17 a 26/09/2026, duas campanhas, R$ 107,49 gastos.

**Resultado: 606 sessões, zero leads reais.** Os dois registros no KV são teste do
próprio Alvaro (nome "Alvaro", um com telefone 98888-8888).

**Causa principal, e não era o anúncio:** 79,8% da verba foi para o `CARROSSEL_01` e o
`CRIATIVO_03`, que vendem velocidade de resposta a lead, oferta herdada de outro
negócio, apontando para uma página que entrega diagnóstico de horas. Promessa e
destino eram coisas diferentes.

**Sobraram 116 sessões de teste honesto** (criativos 06 e 07, os únicos on-offer), e
116 sessões com zero leads não condenam a página: se a taxa real fosse 2%, dar zero
acontece em 9,6% das vezes. Com as 606 totais seria conclusivo (0,2%), mas 490 delas
vieram de anúncio que prometia outro produto.

**O CBO foi o mecanismo do desperdício.** Ele otimiza custo por clique e converge em
horas. Deu 91% das impressões ao criativo de PIOR CTR:

| Posição por CTR | Criativo | CTR | Gasto | Posição por gasto |
|---|---|---|---|---|
| 1º | CRIATIVO_07 | 11,70% | R$ 9,48 | 4º |
| 2º | CRIATIVO_06 | 8,93% | R$ 12,25 | 3º |
| 3º | CRIATIVO_03 | 6,60% | R$ 24,73 | 2º |
| 4º | CARROSSEL_01 | 4,08% | R$ 61,03 | 1º |

Relação perfeitamente inversa entre verba e qualidade de gancho. Cinco dos oito
anúncios não cruzaram o piso de 1.000 impressões do protocolo.

**O que está descartado:** quebra técnica. O teste de 18/09 veio do navegador interno
do Instagram, no iPhone, pelo link real do anúncio, completou as 7 etapas, gravou no
KV, disparou Telegram e subiu Lead pela Conversions API.

---

## 3. A estrutura no ar

Fatorial 2x2. Página no nível da campanha, criativo no nível do conjunto.
Cada fator é lido com a amostra inteira (é a vantagem do fatorial sobre testar
uma variável por vez).

```
CAMPANHA A   [TRÁFEGO] [DIAG-A] [INSTA] [ABO-10] [FRIO] [CT] [1-2-2] [03]
destino: /diagnostico          (captura na etapa 0)
├─ 01 - [INSTA] [Aberto] [25-55] [CRIATIVO_06]   R$ 10/dia
└─ 02 - [INSTA] [Aberto] [25-55] [CRIATIVO_07]   R$ 10/dia

CAMPANHA B   [TRÁFEGO] [DIAG-B] [INSTA] [ABO-10] [FRIO] [CT] [1-2-2] [03]
destino: /diagnostico-b        (sem captura)
├─ 01 - [INSTA] [Aberto] [25-55] [CRIATIVO_06]   R$ 10/dia
└─ 02 - [INSTA] [Aberto] [25-55] [CRIATIVO_07]   R$ 10/dia

R$ 40/dia · sem data de término · pausa manual pela regra da seção 7
```

**Configuração idêntica nos quatro conjuntos:**
objetivo Tráfego · otimização por **visualizações da página de destino** ·
Aberto 25-55 · sem segmentação detalhada · posicionamento MANUAL, só Instagram
(Feed, Stories, Reels, Explorar) · sem Facebook, sem Audience Network, sem
Messenger · sem música · aprimoramentos automáticos de texto do criativo
desligados (senão a Meta reescreve a copy e o teste perde a leitura; confirmado
pelo Alvaro em 11/10) · mesma data e hora de início.

**Links:**
```
A/06  https://anticustos.vercel.app/diagnostico?utm_source=meta&utm_medium=paid-social&utm_campaign=diag-a-ct-03&utm_content=criativo_06
A/07  https://anticustos.vercel.app/diagnostico?utm_source=meta&utm_medium=paid-social&utm_campaign=diag-a-ct-03&utm_content=criativo_07
B/06  https://anticustos.vercel.app/diagnostico-b?utm_source=meta&utm_medium=paid-social&utm_campaign=diag-b-ct-03&utm_content=criativo_06
B/07  https://anticustos.vercel.app/diagnostico-b?utm_source=meta&utm_medium=paid-social&utm_campaign=diag-b-ct-03&utm_content=criativo_07
```

---

## 4. Por que cada decisão foi tomada

**ABO em vez de CBO.** CBO decide o vencedor em horas e nunca revisa, que é o que
matou a rodada 01. ABO devolve a alocação para quem está testando.

**Só criativo on-offer.** O carrossel e o 03 estão aposentados do tráfego pago.
Vendem produto que não está à venda.

**Público Aberto.** Audiência é a segunda variável do pipeline e entra depois.
Amplo também compra ~33% mais sessões pelo mesmo dinheiro (R$ 0,155 contra R$ 0,206
por sessão no consultório, que não converteu melhor). E o teste de público da rodada
01 está contaminado: público e música mudaram juntos, e o nome da campanha dizia
`[CONSULTORIO]` enquanto o nome do conjunto dizia `[Aberto]`, contradição nunca
resolvida.

**Instagram puro.** CPM de R$ 5,64 é baixo demais para feed de Instagram no Brasil,
indício de que boa parte da entrega estava em inventário de baixo valor. Sessão de
Audience Network que nunca converte é sessão paga para não aprender nada.

**Objetivo Tráfego, não Conversões.** A Meta pede ~50 eventos por conjunto por semana
para sair do aprendizado. A R$ 10/dia são R$ 70/semana, o que exigiria custo por lead
de R$ 1,40. Não existe.

**Otimização por visualização de página, não por clique.** Três razões: o denominador
da métrica primária é sessão, não clique; 137 dos 743 cliques da rodada 01 (18,4%,
cerca de R$ 20) nunca viraram sessão; e o volume não aperta, porque a R$ 0,50 por
sessão são 140 eventos por semana contra o piso de 50.

**O sinal existe, e foi verificado.** O Pixel do navegador não carrega no load (só
depois da primeira interação, para não cobrar 188KB de quem passa). Mas o Worker
`quiz-leads` dispara **`PageView` e `ViewContent` juntos pela Conversions API a cada
carregamento**, com `action_source: website` e ID de deduplicação. É isso que alimenta
a Visualização de Página de Destino, e é por isso que a rodada 01 reportou 606.
A razão 606/743 = 81,6% confirma que a correspondência de evento está saudável;
se estivesse ruim viria na casa de 20% a 30%.

---

## 5. A base de comparação, 17 a 26/09

| | Gasto | Sessões | R$/sessão | CPM | CTR | Carregamento |
|---|---|---|---|---|---|---|
| diag-ct-01 Aberto | R$ 52,41 | 338 | **R$ 0,155** | R$ 5,64 | 4,47% | 81,4% |
| diag-ct-02 Consultório | R$ 55,08 | 268 | R$ 0,206 | R$ 10,07 | 6,00% | 81,7% |
| Total | R$ 107,49 | 606 | R$ 0,177 | R$ 7,28 | 5,03% | **81,6%** |

Só os dois criativos que estão rodando: R$ 21,73 e 116 sessões, **R$ 0,187 por sessão**.

A fórmula que decompõe tudo, conferida no centavo contra os dados reais:

```
R$/sessão = (CPM / 1000) ÷ (CTR × taxa de carregamento)
Aberto: (5,64/1000) ÷ (4,47% × 81,4%) = R$ 0,1551   medido R$ 0,1551
```

### O que é justo comparar entre rodadas, e o que não é

**Justo:**
- **Taxa de carregamento.** 81,6% é a base. É o ÚNICO número cross-rodada que diz
  alguma coisa, porque mede diretamente se a troca de otimização funcionou. Subir
  para 88% a 92% significa que pagou. Ficar em 81% significa que o ganho veio só
  do corte de posicionamento.
- Conversa por sessão. Era zero, então qualquer número é novidade.

**Injusto:**
- CPC e CTR: o evento otimizado mudou.
- CPM: o conjunto de posicionamentos mudou.
- R$/sessão em valor absoluto: os dois acima mudaram juntos.

### Projeção, para não confundir efeito esperado com regressão

| Cenário | CPM | CTR | Carreg. | R$/sessão | Sessões com R$ 280 |
|---|---|---|---|---|---|
| Otimista | R$ 9 | 5,5% | 90% | R$ 0,18 | 1.540 |
| **Central** | R$ 13,50 | 4,0% | 90% | **R$ 0,38** | 747 |
| Pessimista | R$ 20 | 3,0% | 88% | R$ 0,76 | 370 |

**Planejar com R$ 0,40 por sessão**, que é 2,6x a base antiga. O salto é o preço de
comprar tráfego representativo, não um problema.

**Alarme real:** acima de **R$ 1,00 por sessão** não é efeito da mudança, é defeito
(criativo recusado, página lenta, público pequeno demais).

---

## 6. Como ler quando os dados chegarem

**Métrica primária: conversas iniciadas por 100 sessões.**
Conversa iniciada = mensagem que CHEGOU no WhatsApp.
- mensagens da A abrem com "Fiz o diagnóstico" e trazem o nome
- mensagens da B abrem com "Acabei de fazer o diagnóstico", sem nome

**Secundária:** evento `Contact` por `ViewContent`, no Gerenciador de Eventos,
separado por `variante` (a / b). Mede intenção, inclusive de quem clicou e desistiu
antes de enviar.

**Bônus só da A:** telefones capturados na etapa 0 de quem nunca mandou mensagem.
Conta como ativo só se a lista for realmente trabalhada.

**As quatro regras de comparação:**
1. **Página:** campanha A inteira contra campanha B inteira. Soma os dois conjuntos
   de cada uma. Amostra cheia dos dois lados.
2. **Criativo:** (06 na A + 06 na B) contra (07 na A + 07 na B). Soma atravessando
   as campanhas. Amostra cheia dos dois lados.
3. **Nunca** compare célula contra célula. São ~140 sessões cada e é ruído.
4. Sempre **taxa**, nunca número absoluto. Orçamento igual produz gasto igual e não
   impressões iguais, porque o CPM varia por criativo.

**Régua do criativo** (coluna de serviço de `Wiki/Gerencial/Métricas e Diagnóstico.md`):
CTR bom acima de 2%, corte abaixo de 1,5%. Na rodada 01 o 07 fez 11,70% e o 06 fez
8,93%, os dois abaixo do piso de 1.000 impressões. Esta rodada finalmente cruza o piso.

**Volume necessário, para saber o que a amostra permite afirmar:**

| Sessões por braço | Permite |
|---|---|
| 99 | detectar taxa de 3% com 95% de confiança |
| 149 | detectar 2%, e separar 0% de 3% com significância |
| 299 | detectar 1% |
| 400+ | comparar 2% contra 5% |

---

## 7. Regra de parada e de decisão, escritas antes de ver o número

**Parar** quando cada campanha chegar em **250 sessões**, ou no **dia 10**, o que vier
primeiro. (A R$ 0,40 por sessão isso chega no dia 5; a R$ 0,60, no dia 7,5.)

**Não editar nada enquanto roda.** Orçamento, criativo, público ou posicionamento:
qualquer edição reinicia o aprendizado e invalida o que já rodou. Foi por isso que as
campanhas subiram sem data de término, para que estender não exija uma edição.

**Decisão:**

| Resultado | Veredito |
|---|---|
| Taxa de conversa da B claramente maior | **B vence.** Vira a página oficial |
| Taxas empatadas ou A maior | **A vence.** Entrega as mesmas conversas MAIS os telefones |
| As duas perto de zero com 400 sessões somadas | **Nenhuma.** O problema não é a posição da captura: sobe para oferta e público |

A vencedora vira a página oficial. A rodada seguinte testa **público** em cima dela,
uma variável de cada vez. Quando o público entrar: consultório **sem** música, ou
amplo **com** música, nunca as duas mudando juntas como na rodada 01.

---

## 8. Limitações conhecidas desta rodada

**A `/diagnostico-b` não escreve nada no KV.** Decisão deliberada de isolamento
(`verificar-b.js` garante "nenhuma requisição para /api/lead"). Consequência: o braço B
é legível apenas no Gerenciador de Eventos e na caixa do WhatsApp, nunca na base
própria. O objetivo secundário do PRD, usar o quiz como instrumento de pesquisa do
ICP, segue rendendo zero linha nos dois braços.

**Assimetria de mensagem.** A mensagem da A carrega `[origem: criativo_XX]` e a da B
não. É uma segunda diferença entre os braços, pequena, registrada como ruído conhecido.
A correção simétrica seria tirar a tag da A (a atribuição por criativo continua
inteira pelo Gerenciador, que atribui o `Contact` ao anúncio). Não foi aplicada.

**Interação fora de alcance.** O fatorial entrega os dois efeitos principais com
amostra cheia, e não entrega a interação (se o 06 rende especialmente melhor na B).
Isso exigiria o N por célula, que fica em ~140.

**Nenhum benchmark é próprio.** Tudo em `Métricas e Diagnóstico.md` tem vigência
`provisorio` e vem de agência de serviço BR, e-commerce e MAV. Serve como ordem de
grandeza. Esta rodada é a primeira chance de gerar número próprio.

---

## 9. Primeira coisa a fazer quando os dados chegarem

1. Exportar do Gerenciador por **campanha**, por **conjunto** e por **anúncio**,
   e colocar os CSVs em `ads/`.
2. Puxar também a quebra por **posicionamento**, que ficou pendente na rodada 01 e
   explica metade do custo por sessão.
3. Contar as conversas na caixa do WhatsApp, separando por abertura de mensagem.
4. Ler na ordem da seção 6, nunca pelo resultado final: principais primeiro para saber
   SE há problema, secundárias depois para saber ONDE.
