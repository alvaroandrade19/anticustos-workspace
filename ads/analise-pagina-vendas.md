# Análise da página de vendas, anticustos.vercel.app

Auditoria para tráfego pago frio do Instagram. Data: 2026-09-15.
Fonte auditado: `C:\Users\aandr\OneDrive\Área de Trabalho\ASIMOV DESIGN\ASSETS\index.html` (43KB, 561 linhas), que é a página que está no ar.

Réguas usadas, na ordem de precedência que o `AGENTS.md` define: `PRODUCT.md` e `_contexto/` para oferta, preço e ICP; `marca/design-guide.md` como brief visual; `Wiki/Gerencial/Copy - Estruturas em Uso.md` para a sequência de copy e as 10 perguntas; `Wiki/Gerencial/Funis` e `Vendas` para função da página no funil; `Wiki/Gerencial/Métricas e Diagnóstico.md` para os pisos; `Wiki/Projeto/Voz e Estilo.md` para regra de frase. Política da Meta verificada na web em 2026-09.

---

## Veredito em uma linha

**4,4/10.** O esqueleto está na ordem certa e o conteúdo está oco, o que a outra avaliação diagnosticou bem. O que ela não viu: a página tem duas exposições que colocam a conta de anúncio em risco antes de colocar a conversão em risco, e o eixo técnico e visual, que ela não pontuou, é onde o dinheiro de mídia vaza primeiro.

**E a recomendação central dela deve ser recusada.** Ela prescreve a oferta de clínica (Funcionário Digital 24/7, TMA sub-10s, 6x R$499, 10 vagas, No-Show Shield, "sua clínica", "onde o paciente vaza"). Nada disso é este negócio. Detalhe na seção "Onde eu divirjo".

---

## Nota por seção

| # | Seção | Nota | Problema central |
|---|---|---|---|
| 0 | Barra marquee "OFERTA DE LANÇAMENTO +40% OFF", repetida 10x | **1,5** | Desconto sem preço em lugar nenhum da página. É a primeira coisa que o olho pega, e é passivo de política |
| 1 | Hero, "antes que ela torne você irrelevante" | **3,5** | O vilão é o leitor. Ameaça produz relutância, não clique. Sem mecanismo, sem bullets, sem imagem concreta |
| 2 | Dores, 15h / 20% / decisões lentas | **6,5** | Melhor bloco. Números sem fonte, sem cena, e em segunda pessoa sobre a situação financeira de quem lê |
| 3 | A Jornada 01-02-03 | **4,5** | Descreve processo genérico de consultoria. É o slot onde a demonstração do mecanismo deveria estar |
| 4 | Para quem é / não é | **7,0** | Melhor bloco funcional. Contradiz a si mesmo em um item e encosta na regra de não culpar o leitor |
| 5 | Objeções (complexo / funciona / mudar tudo) | **5,5** | Ataca a frase, não o medo. As três abrem com negação. Faltam as duas que travam de verdade |
| 6 | Fechamento, "Pare de operar no limite" | **3,5** | Sem oferta e sem motivo para agir agora. "Sem compromisso" zera o valor da conversa |
| G1 | Prova e autoridade | **1,0** | Zero. Nenhum rosto, nenhum nome, e a única medição real que o negócio tem ficou fora |
| G2 | Técnico e visual contra o brief | **2,0** | Quatro animações banidas, três tipografias reprovadas, cinza puro, escuro onde o brief manda claro |
| G3 | Branding | **0,0** | "NEXUS AI - Premium Solutions" no header, no `<title>` e no Open Graph |

---

## Os dois riscos que vêm antes da conversão

**1. A página é passivo de política de anúncio.** A Meta revisa a página de destino, e duas coisas aqui são gatilho conhecido. A barra anuncia "+ DE 40% OFF" e a página não tem preço nenhum, o que é o formato clássico de oferta enganosa. E as dores estão escritas em segunda pessoa sobre situação financeira ("Você está perdendo até 15 horas", "até 20% do seu custo pode estar sendo desperdiçado"), que é exatamente a superfície de Atributos Pessoais, onde situação financeira é categoria protegida e a fiscalização de 2026 passou a pegar implicação indireta. Numa conta de anúncio nova, marca de política custa mais que um mês de mídia.

**2. Os números não têm fonte.** O Princípio 1 do produto é número antes de adjetivo, com conta atrás, e o design guide exige que todo número carregue a linha de origem colada nele, em duas formas possíveis: dado público com referência, ou conta aberta com a base à mostra. "Até 15 horas" e "até 20%" não têm nenhuma das duas. Isso é problema de credibilidade e de política ao mesmo tempo.

---

## Onde eu divirjo da outra avaliação

O diagnóstico dela está certo em quase tudo. A prescrição, não.

**Ela importa a oferta de clínica inteira.** Prescreve Funcionário Digital 24/7, "na voz da sua clínica", "onde o paciente vaza", TMA abaixo de 10s como garantia verificável, menos 20 a 40% de no-show, mais 15 a 30% de lead para agendamento, ancoragem em R$17.897, preço de 6x R$499 ou R$2.997 à vista, 10 primeiras clínicas, No-Show Shield, Reactivation Sprint 30, Reputação 5 Estrelas Autopilot e Modo 1995.

O `AGENTS.md` é explícito: ICP, oferta, preço, persona e vocabulário da camada Gerencial são da origem clínica e não se aplicam aqui. A oferta real, em `PRODUCT.md` e `_contexto/estrategia.md`, é **R$3.000 de instalação mais R$1.500 por mês de recorrência**, com posicionamento de operação assistida contínua.

Três consequências concretas de seguir aquela prescrição:

1. **Ela destrói o modelo de receita.** 6x R$499 é R$2.994 cobrados uma vez. O contrato daqui só passa da instalação no mês 3, e `PRODUCT.md` diz que o valor mora na retenção. Trocar recorrência por parcelamento de entrada é o oposto do negócio.
2. **Ela coloca na página promessa proibida.** Os percentuais das narrativas são ilustrativos por admissão da própria fonte e estão vedados como resultado. Publicar "menos 20 a 40% de no-show" numa página é exatamente o que `PRODUCT.md` proíbe e o que a detecção semântica de resultado irrealista da Meta procura.
3. **Ela inventa uma quebra de LGPD.** Sugere escrever "dados isolados por clínica, sem treinar modelo público, acesso com trilha". O acervo registra que não existe quebra escrita para essa objeção e que a instrução é escalar para o humano. Afirmação de arquitetura que ninguém verificou não entra em página.

**Ela também empurra preço para a página, e isso contraria duas regras.** A página de Vendas tem regra dura: não passar preço antes de ancorar valor. E o achado registrado é que tráfego frio para página com a variante cara deu zero venda, enquanto a página de persona venceu. A função desta página com tráfego frio é ganhar a conversa, não fechar. A crítica dela ao "CTA para conversa sem motivo para agir agora" está certa, mas o conserto não é desconto, é um diagnóstico específico e finito. Está na ordem de ação abaixo.

**E ela não pontuou o eixo técnico**, que é onde a mídia paga vaza primeiro. Está tudo na seção do item 8.

---

## O que fazer, por ordem de retorno

### 1. Branding. Meia hora, risco zero, bloqueia tudo o resto

Header, `<title>`, `og:title` e `og:description` dizem "NEXUS AI - Premium Solutions". Tráfego frio que clica num anúncio da Anti Custos e chega num nome diferente assume template ou golpe, e nenhuma linha de copy conserta isso. O favicon é um emoji de foguete, que o guia proíbe (emoji fazendo papel de ícone) e que comunica o oposto de previsibilidade.

Trocar para Anti Custos, e adicionar imagem de Open Graph 1200x630 em fundo escuro da marca, que o guia exige porque ali a página aparece dentro do feed de outra pessoa.

### 2. Matar a barra de 40% OFF

Ela sai e nada entra no lugar. Três motivos somados: promete desconto de um valor que não existe na página, é passivo de política, e o design guide bane explicitamente marquee, contador regressivo e selo de OFF com a frase "isso comunica promoção, não consultoria". O comprador aqui está comprando previsibilidade.

### 3. Refazer o hero com H1, H2, bullets e CTA

O guia e a régua de copy pedem os quatro na primeira dobra, e CTA em toda dobra. Hoje tem título, subtítulo e um CTA, e depois trechos longos sem nenhum.

O erro maior é o vilão. "Antes que ela torne você irrelevante" coloca a culpa em quem lê, e a regra é que a culpa vai sempre no método antigo e o vilão nunca é o leitor.

Proposta, usando só o que é defensável:

> **H1:** Um processo por vez, automatizado e medido, com o ganho no papel todo mês.
>
> **H2:** A Anti Custos escolhe um processo operacional do seu negócio, mede quanto ele consome hoje em horas, monta a automação e acompanha o resultado mês a mês.
>
> **Bullets:**
> A medição de antes vem primeiro. Sem número, não começa.
> Um processo entregue por vez, em vez de transformação ampla prometida.
> O acompanhamento continua depois da entrega, com relatório do ganho.
>
> **CTA:** Quero o diagnóstico do meu processo mais caro

Por que funciona: passa nos 3S (específica, tangível, desejável), responde a pergunta 1 (como é diferente) e a 8 (como funciona) de uma vez, e promete a coisa que `PRODUCT.md` define como sucesso, que é o cliente conseguir apontar em reais ou em horas o que deixou de gastar. Nenhum percentual inventado.

**Pendência de decisão:** o mecanismo precisa de nome, porque sem isso as perguntas 1 e 8 ficam sem resposta em toda peça. Proposta: **Um Processo Por Vez**, tirado do Princípio 2 do produto. Aguarda aprovação. O prazo da instalação também está em aberto no `PRODUCT.md` e precisa ser preenchido antes de ir pra página.

### 4. Trocar a Jornada por demonstração do mecanismo

"Analisamos, estruturamos, implementamos" é o que toda consultoria escreve, então reprova no teste da cópia barata. Pior: é o slot onde o design guide manda a demonstração entrar. A regra dele para superfície de conversão é literal, onde o padrão pede prova de terceiro (logo, selo, depoimento, case) entra demonstração do mecanismo, e a marca está proibida de fabricar prova.

A demonstração já existe e está fora da página: a auditoria no próprio ambiente do Alvaro, **de 34 para 3 ferramentas, cerca de 1.290 tokens a menos em toda mensagem**, medida antes e depois. É a única prova de primeira mão que o negócio tem.

Entra com as regras de número do guia: valor absoluto ao lado do percentual, nunca percentual sozinho, IBM Plex Mono tabular, linha de origem colada embaixo, e a declaração de que é medição do próprio ambiente e não resultado de cliente. Print de tela real vale mais que descrição, e em serviço de automação a prova visual é a mais forte e a mais barata de produzir.

### 5. Colocar o rosto e o nome

A página não tem nenhum ser humano. Para um serviço de R$3.000 mais recorrência vendido por uma pessoa só, a pessoa é o produto. A objeção de legitimidade ("esse cara faz o que ensina ou só ensina") está no inventário e só se resolve antes da conversa.

Foto, nome, duas linhas de origem. Antecipar vale mais que responder, e antecipação é a técnica mais forte e a menos usada.

### 6. Reescrever as objeções pelo medo, e adicionar as duas que faltam

As três atuais estão na ordem certa e erram no mesmo ponto: respondem a frase em vez de nomear o medo, e todas abrem com negação ("Não é.", "Não.", "Não vendemos"), que é a estrutura que a voz canônica bane como marca mais rápida de texto de IA.

| Objeção | Medo por trás | Quebra |
|---|---|---|
| Parece complexo demais | Virar responsável por manter uma coisa que ele não entende | O acompanhamento é o produto. A manutenção não fica com ele |
| Funciona no meu negócio? | Pagar para descobrir que não servia | O diagnóstico mede antes. Se o volume do processo não justificar, isso é dito antes de vender |
| Vou precisar mudar tudo? | Parar a operação no meio do expediente | Um processo por vez. O resto continua como está |
| Meu cliente prefere falar com humano | Perder o vínculo que sustenta a recompra | O repetitivo sai. O que exige julgamento continua com ele |
| E meus dados? | Responsabilidade que ele não sabe medir | **Sem quebra escrita no acervo.** Não inventar |

A última é restrição, não preguiça. Não existe quebra pronta e a instrução é escalar para o humano. Duas saídas honestas: o Alvaro escreve ele mesmo uma linha factual sobre o que acontece com os dados, ou a objeção fica fora da página e é tratada na conversa. Promessa de arquitetura não verificada não entra.

### 7. Consertar o fechamento sem colocar preço

"Sem compromisso. Sem complexidade." zera o valor percebido da conversa, e conversa de valor zero é conversa com comparecimento baixo. O problema real que a outra avaliação apontou está certo: falta motivo para agir agora, e inércia é a resistência mais cara, porque é gente que já foi convencida e não agiu.

O conserto é um diagnóstico específico e finito, com escassez verdadeira:

> Diagnóstico de 30 minutos. Você sai dele com a conta de um processo seu: quantas horas por semana ele consome hoje e o que custaria automatizar. Se o volume não justificar, eu digo na hora.
>
> Atendo poucos diagnósticos por semana, porque a implementação é minha.

A escassez aí é real e documentada (operação de uma pessoa só até a meta de 20 ativos), o que a diferencia de "10 vagas" fabricado. E o aviso final, anti-inércia, sem culpar o leitor e sem gatilho de política:

> O processo manual não piora com o tempo. Ele só repete. A conta de hoje é a mesma do mês que vem.

### 8. O eixo técnico, que a outra avaliação não pontuou

Tudo abaixo foi verificado no fonte.

**Animação.** O CSS roda `spin-beam`, `pulse-glow`, `ticker-marquee` e `float` em loop infinito. O design guide proíbe nominalmente beam giratório, brilho pulsante e marquee. E não existe nenhum bloco `prefers-reduced-motion` no arquivo, quando o guia diz que esse bloco é condição de entrega e que peça sem ele não está pronta.

**Tipografia.** A página carrega Inter, Space Grotesk e Space Mono. As três estão na lista de faces que o detector da `/impeccable` marca como saturadas por interface gerada por IA, e foi exatamente por isso que a marca saiu de Inter e escolheu Schibsted Grotesk com IBM Plex Mono. A página usa zero tipografia da marca.

**Cor.** O corpo é `#050505` com `text-neutral-300`, ou seja, preto chapado e a escala neutra do Tailwind, os dois banidos pelo guia, que manda `#05060A` e neutros com viés azul. E sobraram `rose-500`, `rose-400`, `#fb7185` e `#e11d48` no CSS, que são precisamente os carmins herdados do site antigo que foram descartados por decisão de 2026-09-05. Somados ao azul, são duas cores de acento na mesma peça, também banido.

**Claro ou escuro.** O guia decide isso de forma explícita para superfície de conversão: proposta e landing usam os tokens claros, o Instagram continua escuro, e dá três motivos (o comprador abre no celular sob luz do dia, a proposta vira PDF e fundo quase preto lê como amador impresso, e a compra é de previsibilidade, onde o claro carrega menos teatro). A página está escura. Como a tipografia e os neutros vão ser refeitos de qualquer jeito, o custo marginal de fazer no claro é pequeno, e o brief vence.

**Peso.** A página carrega Bootstrap 5 por CDN, Tailwind por CDN (que compila no navegador), Lucide do unpkg, três famílias do Google Fonts, e faz `preload` de um `hero-background.mp4`. A régua de métricas põe piso de 80% em carregamento e connect rate, e em mídia paga cada ponto perdido aí é dinheiro que entrou e não viu a página. Tirar Bootstrap, embutir os ícones usados, cortar as fontes não usadas e tirar o vídeo do preload.

### 9. O Pixel já está instalado, e isso muda o plano de anúncio

O fonte tem Meta Pixel ativo, id `1175560701016650`, disparando PageView. O plano de mídia que escrevemos antes assumia que não havia site nem pixel, com registro manual. Atualiza assim:

- Definir o evento de conversão no clique do WhatsApp (Contact), porque hoje só PageView dispara e o clique de saída não é medido.
- Criar já os públicos de site (visitou, visitou e não clicou), que acumulam de graça e viram o conjunto de retargeting no degrau de R$45 por dia.
- A conta de fase de aprendizado não muda: 50 eventos por semana por conjunto continua fora de alcance com R$24 por dia, então a otimização segue em evento de topo.

---

## O que medir depois de mexer

Ordem de leitura por etapa, nunca pelo resultado final, porque ticket alto mascara gargalo. Na página: carregamento acima de 80%, e taxa de clique no CTA do WhatsApp por visita. No anúncio: CPM, CTR acima de 1% e custo por clique. Na conversa: resposta em menos de um minuto, e comparecimento ao diagnóstico.

Nenhum desses tem benchmark próprio ainda. Tudo que existe hoje é ordem de grandeza importada, e a primeira medição própria substitui.

---

## Resumo do veredito

A página tem a ordem certa e o recheio errado, e três coisas precisam sair antes de qualquer melhoria de copy: o nome NEXUS AI, a barra de 40% OFF e os números sem fonte. Depois disso, o maior ganho por esforço é colocar na página a única prova que o negócio tem (de 34 para 3, medição própria declarada) no lugar da Jornada genérica, e colocar o rosto do Alvaro.

Preço não entra na página enquanto o tráfego for frio. O que entra é um diagnóstico específico, finito, com a conta de um processo como entregável, e uma escassez que é verdade.

A oferta de clínica da outra avaliação fica fora, inteira.
