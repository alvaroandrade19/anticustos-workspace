# Design System do Carrossel

Slides em **1080x1350 nativos**, sem transform. Todo o CSS vive em `estilo.css` (formato Anti
Custos) e `estilo-tweet.css` (formato tweet). Este arquivo é a regra de uso: o que escolher, quando
e por quê. O histórico das decisões está em `decisoes.md`, que não se lê durante a produção.

**Não escrever CSS novo no HTML da peça.** Se falta uma classe, ela entra no `estilo.css`, não numa
tag `<style>` da peça. Inline só para o que muda por slide: `background-image` de foto, `width` do
progresso e ajuste pontual de margem.

---

## Arcos narrativos

| Arco | Sequência |
|---|---|
| **Diagnóstico de Custo** (padrão) | Custo nomeado → Onde mora → A conta → Por que é invisível → Por que nunca é cortado → O que muda → Teste → CTA |
| Tese Contraintuitiva | Crença comum → Dados que desafiam → Verdade → Novo modelo → Aplicação → CTA |
| Tendência Interpretada | Hook → Contexto → Mudança → Impacto → Ação → CTA |
| Case / Benchmark | Resultado → Quem fez → Como → Princípio → Como replicar → CTA |

Diagnóstico de Custo é o padrão porque é o único que se sustenta sem prova social: a prova dele é
aritmética. Case só quando existir case público de terceiro, já que a Anti Custos não tem os seus.

Nunca três slides seguidos do mesmo layout. O ritmo vem de alternar peça com imagem e peça só de
texto, não de alternar claro e escuro: **a marca é dark do começo ao fim**.

---

## Paletas

Duas, no mesmo `estilo.css`. Trocar é trocar o atributo no `<html>`, nada mais.

| | Azul (`data-paleta="azul"`, padrão) | Terra (`data-paleta="terra"`) |
|---|---|---|
| Fundo | `#0A0A0B` | `#110B07` |
| Gradiente | `#CDE8FF → #62A0FF → #4A72F0` | `#EAD0A6 → #CD8552 → #AC6238` |
| Contraste dos stops sobre o fundo | 15,6:1 / 7,5:1 / 4,7:1 | 13,1:1 / 6,6:1 / 4,2:1 |
| Headline | Schibsted Grotesk 800 | Calistoga (peso único) |
| Corpo | Schibsted Grotesk, ênfase em 700 | Libre Franklin, ênfase em 600 |

`--tx-2` fica acima de 13:1 e `--tx-3` em 6,1:1 no Azul. **Stop novo só entra depois da mesma
verificação de contraste.** Números de medição em IBM Plex Mono nas duas paletas.

O acento do gradiente também é a cor do rótulo e do preenchimento de progresso no rodapé, o que
amarra a peça sem precisar de segunda cor.

Sem instrução em contrário, o padrão é Azul. Terra é alternativa em teste: só usar quando o Alvaro
pedir por nome. Estrutura, layouts, diagramação e método editorial são idênticos nas duas.

---

## Escala tipográfica

| Elemento | Classe | Azul | Terra |
|---|---|---|---|
| Headline de capa | `.hl.hl-capa` | 104px / 800 / 0,95 / -0.03em | 98px / 400 / 1,03 / -0.01em |
| Headline interna | `.hl.hl-int` | 82px / 800 / 0,98 / -0.025em | 76px / 400 / 1,06 / -0.008em |
| Headline do slide de conta | `+ .hl-conta` | 64px | 60px |
| Corpo | `.corpo` | 38px / 400 / 1,32 | 38px / 400 / 1,34 |
| Ênfase no corpo | `.corpo b` | 700 | 600 |
| Corpo menor / maior | `.corpo-sm` / `.corpo-lg` | 34px / 44px | 34px / 44px |
| Numeração grande | `.num` | 120px / 200 | idem |
| Barra de marca | automática | 22px / 600 / 0.12em / uppercase | idem |
| Rótulo do rodapé | `.tag` | 16px / 700 / 0.18em / uppercase | idem |
| Contador | `.passo` | 16px / 500 / 0.08em | idem |

Headline sempre em **caixa de frase**. Uppercase só na barra de marca e no rótulo do rodapé. Corpo
em uppercase está proibido.

Se a headline passar de 5 linhas, reduzir de 8 em 8px, com piso em 80px. Se ainda não couber,
encurtar o texto mantendo o padrão da headline (ver `headlines.md`).

---

## A diagramação de ênfase

É o que dá densidade às peças da marca, e é a técnica que mais muda o resultado.

**Regra:** dentro de um mesmo parágrafo, a **afirmação vai em negrito e branco puro**, e o
**desenvolvimento vai em peso 400 e `--tx-2`**. O olho pega a tese antes de ler a frase inteira.

```html
<p class="corpo"><b>Liderar inteligências será a habilidade mais valorizada do mercado.</b>
Quem dominar isso primeiro terá mais tempo, mais lucro e mais liberdade.</p>
```

Duas variações válidas:

- **Ênfase de abertura:** a primeira frase em negrito, o resto em 400. É a mais usada.
- **Ênfase de fechamento:** o desenvolvimento em 400 e a conclusão em negrito, quando o peso da
  frase está no fim.

**Terceiro registro: o realce** (`.realce`). Uma expressão de uma a três palavras com fundo em `--g1`
e texto na cor do fundo, que dá 15,6:1. Serve para o termo que a peça quer que o leitor leve embora,
tipo o nome do custo ou o número. **Um realce por peça inteira, não por slide.** Dois já viram
decoração.

Trocar a cor da palavra e nada mais é o registro mais fraco de todos, e está proibido: ou é peso,
ou é realce com fundo.

**Limites:** no máximo dois trechos em negrito por slide, e o trecho em negrito nunca passa de duas
linhas. Parágrafo inteiro em negrito anula a técnica, porque sem contraste não existe ênfase.

Gradiente nunca entra no corpo. No corpo, ênfase é peso.

---

## Ocupação do canvas

**As peças da Anti Custos preenchem o canvas.** Zona morta grande no topo é o erro mais visível do
formato. A âncora muda por tipo de slide:

- **Slide só de texto:** o bloco fica opticamente centrado entre a barra de marca e o rodapé
  (`.corpo-area` puro).
- **Slide com foto de fundo:** o texto ancora embaixo, onde o scrim é mais forte (`.base`).
- **Slide numerado:** ancora no alto, logo abaixo da régua (`.top`).
- **Slide com caixa de imagem:** o texto começa depois da caixa, nunca por cima dela (`.abaixo`).

Se sobrar mais de um terço de vazio: subir o corpo para 44px (`.corpo-lg`), virar layout numerado,
ou fundir com o slide seguinte. Pedir mais conteúdo ao usuário é o último recurso.

**Densidade controlada.** Ou muito ar, ou muita informação. Nunca o meio-termo morno, que é o
estado em que o slide não é editorial nem é denso, só parece inacabado.

Referência numérica: 45 a 90 palavras em slide de texto, 60 a 100 no numerado. Abaixo de 40 o slide
precisa virar full bleed de duas ou três palavras por linha, não continuar sendo um parágrafo curto
perdido no meio do canvas.

---

## Layouts

Oito. Cada slide usa exatamente um.

| | Layout | Como monta | Quando usar |
|---|---|---|---|
| **L1** | Capa com imagem de fundo | `.foto` + `.scrim-base` + `.scrim-rampa`, `.corpo-area.base` | Sempre o slide 1 quando houver imagem |
| **L2** | Capa ou slide só de texto | `.atmosfera`, `.corpo-area` | Capa sem imagem e qualquer slide de tese forte. O mais legível da coleção e o que melhor sobrevive à miniatura do feed |
| **L3** | Imagem em caixa | `.caixa` (raio 40px, até ~62% da altura), `.corpo-area.abaixo` | Retrato, ilustração ou captura que precisa ser vista inteira. Melhor escolha quando a imagem tem detalhe fino, porque não compete com texto por cima |
| **L4** | Imagem de fundo com scrim inferior | `.foto` + `.scrim-rampa.alta`, `.corpo-area.base` | Quando o assunto da foto está no topo do enquadramento |
| **L5** | Numerado | `.num` + `.regua`, `.corpo-area.top`, sem headline separada | Sequência de argumentos, etapas ou blocos de dado. A numeração carrega informação de verdade, que é a posição na sequência |
| **L6** | Citação | `.aspas` (280px, 8%) ao fundo, `.citacao` + `.autoria` | Quando a peça cita alguém de verdade, com nome e fonte. Nunca para inventar citação |
| **L7** | Split | `.split` com `.rotulo` em gradiente, `.corpo-area.direita` | Quebra de ritmo no meio da peça, ou contraste entre duas ideias |
| **L8** | CTA | Ponte, ação e assinatura, progresso cheio | Fecha a peça |

**L7:** o painel é ancorado embaixo, então o padding inferior dele respeita a mesma área segura do
rodapé, 130px, senão o rótulo colide com a tag e a barra de progresso quando o texto quebra em
várias linhas. Nunca preencher o painel com `--g2` sólido.

**L8:** o CTA tem que parecer diferente de todos os outros slides. Se ele usar o mesmo layout de um
slide anterior, o leitor não percebe que a peça acabou. Marcar com o glow, com o bloco sólido ou com
a logo, quando ela existir.

---

## Tratamento de imagem

O usuário envia as imagens. A skill nunca busca, gera nem inventa imagem.

### Scrim: a regra que garante legibilidade

Texto sobre foto só é aceitável com scrim. **Nunca confiar na foto ser escura.** O scrim é sempre
duas camadas: `.scrim-base` derruba o brilho geral e `.scrim-rampa` garante o contraste onde o texto
de fato mora. Em L4, usar `.scrim-rampa.alta`, que sobe a rampa. As duas classes já acompanham a
paleta ativa.

**Piso obrigatório:** a soma das duas camadas nunca desce abaixo de 70% de opacidade na faixa onde
o texto se apoia. Se a foto for clara ou muito detalhada nessa faixa, subir a base para 0,68 antes
de qualquer outra tentativa.

**Verificação:** depois de renderizar, olhar o PNG e checar se o texto continua legível na
miniatura. Foto ocupada atrás de headline em gradiente é o modo de falha mais comum do formato: o
gradiente tem partes claras, e parte clara sobre parte clara some.

### Como escolher entre foto de fundo e caixa

Esta ordem é obrigatória e não se reinterpreta:

1. **Se o usuário disse o que quer** ("quero como fundo", "coloca em box"), usar o que ele pediu.
   Ponto final, sem reclassificar por conta própria.
2. **Se ele não disse**, decidir pelo tipo de imagem: foto, retrato ou ambiente vai de fundo (L1 ou
   L4); print de tela, interface, gráfico ou captura de conversa vai em caixa (L3).
3. **Na dúvida, perguntar antes de gerar.** Errar aqui custa um render inteiro.

### Enquadramento

**Regra geral: nunca cortar nem esticar uma imagem de forma que ela perca informação.**

- **Foto de fundo:** `cover`, com `background-position` escolhido para não decapitar o assunto.
  `left center` é um padrão melhor que `center` quando a pessoa está à esquerda do quadro.
- **Print ou captura de tela:** usar `.caixa.print`, que já é `contain`. **Nunca cover:** cover corta
  a borda do print e destrói justamente a informação que fez o print existir.
- Print pequeno nunca é esticado para preencher a caixa. Melhor sobrar moldura que perder nitidez.
- Assunto da foto no terço superior em L1 e L4, centralizado em L3.
- Foto em preto e branco ou dessaturada combina melhor com headline em gradiente, porque a peça
  passa a ter uma fonte de cor só. Foto colorida e saturada pede L3, onde a caixa isola a imagem.

### Quando não há foto

O slide não pode parecer que faltou a foto. Recursos, em ordem de preferência:

- **Atmosfera** (`.atmosfera`): gradiente de fundo quase imperceptível de propósito, amplitude de
  1,9x de luminância. Tira o preto chapado sem puxar atenção. É o tratamento padrão do slide sem
  imagem.
- **Glow** (`.glow`): radial atrás do bloco de texto. Puxa foco, então fica reservado para os dois
  slides que merecem: o de tese e o de fechamento.
- **Numeral gigante de textura** (`.textura`): matéria, podendo vazar da área segura. Diferente do
  contador do rodapé, que é informação.
- **Full bleed de texto:** duas ou três palavras por linha, impacto máximo.
- **Split** (L7).

**Atmosfera e glow são mutuamente exclusivos.** Um slide recebe um ou outro, nunca os dois, e slide
com foto não recebe nenhum. Empilhar os dois é exatamente o que faz o fundo roubar a headline.

### Grão

`.grao` entra em todo slide, inclusive sobre a foto em L1 e L4. Ele une a foto ao fundo e é o que
separa preto chapado de preto com matéria. Gerado por SVG inline com `feTurbulence`, nunca arquivo.

---

## Elementos fixos

**Barra de marca**, topo, 56px de recuo: nome à esquerda, handle à direita. **Sai sozinha em todo
`.slide`**, via pseudo-elemento. Não escrever `<div class="marca">` na peça. Para trocar o handle,
mexer em `--handle` no `estilo.css`, um lugar só.

**Rodapé** (`.rodape`), em todo slide: rótulo da seção à esquerda, trilho de progresso no meio com o
preenchimento proporcional ao slide atual, e contador `02/09` em mono à direita. Sem seta de swipe:
o gesto é nativo do Instagram e a barra já comunica que existe mais peça pela frente.

**Área segura:** 56px na horizontal, 56px no topo, 130px embaixo por causa do rodapé.

---

## Componentes

**Tabela de conta aberta** (`.tab`). Cabeçalho, valores em mono com numeral tabular, três linhas ou
mais, última linha destacada. Fecha com `.resultado` (número grande em gradiente), `.res-label` e
`.nota` com a ressalva da estimativa.

**Linhas com marcador** (`.linha` + `.mk` + `.tx`). Duas ou três. Mais de quatro vira lista.

**Card** (`.card`). Fundo `--bg-2`, borda de 1px, raio de 24px. Card dentro de card é proibido.

**Logo no fechamento.** Quando `marca/design-guide.md` tiver arquivo de logo, ele entra no slide de
CTA com 120 a 200px de largura. Enquanto não houver, o fechamento usa o nome em peso 800.

---

## Checklist antes de renderizar

1. Nenhum texto por cima da caixa de imagem, e nenhum slide com mais de um terço de vazio
2. Gradiente só na headline e no número de resultado, nunca no corpo
3. No máximo dois trechos em negrito por slide, e um realce na peça inteira
4. Scrim de duas camadas em toda foto com texto por cima, piso de 70%
5. Texto legível na miniatura, conferido no PNG
6. Headline em caixa de frase, em até 5 linhas
7. Área segura respeitada: 56px nas laterais e no topo, 130px embaixo
8. Nunca três slides seguidos do mesmo layout
9. Rodapé com rótulo, progresso e contador em todo slide, e nenhuma `<div class="marca">` na peça
10. Print e captura de tela em `contain`, foto em `cover`, e nenhuma imagem esticada
11. CTA visualmente diferente de todos os outros slides
12. Nenhum CSS novo dentro da peça, e nenhuma prova social, porque não existe nenhuma

## Anti-patterns visuais

- Texto sobre foto sem scrim, ou com scrim de uma camada só
- Gradiente claro sobre região clara da foto
- Gradiente no corpo do texto, ou em qualquer coisa que não seja headline ou número de resultado
- Parágrafo inteiro em negrito
- Headline em uppercase
- Texto centralizado horizontalmente em slide de conteúdo
- Card dentro de card
- Borda lateral colorida acima de 1px
- Emoji fazendo papel de ícone
- Stock de robô, cérebro digital ou mão tocando holograma
