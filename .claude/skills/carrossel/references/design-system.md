# Design System do Carrossel

Método editorial da BrandsDecoded (anatomia de slide, ritmo de leitura, arcos) na identidade da
Anti Custos. Slides em **1080x1350 nativos**, sem transform.

**Como as peças de referência entram aqui.** Elas não são molde. Delas vieram duas coisas, e só
duas: a **integração de imagem** (caixa arredondada, foto de fundo com escurecimento) e a **forma
de escrita chamativa** (diagramação de ênfase, headline em gradiente). Todo o resto, cor, rodapé,
estrutura e tom, segue o que já estava definido no `design-guide.md` e no `PRODUCT.md`.

## Divergências assumidas em relação ao método original

1. **Fonte.** O original usa Plus Jakarta Sans no corpo e condensada pesada uppercase na headline.
   Aqui é **Schibsted Grotesk em toda a peça**, headline em 800 e caixa de frase. As peças reais da
   marca usam família única, e é isso que faz o feed parecer de uma marca só. Plus Jakarta Sans
   também está na lista de faces saturadas do detector da `/impeccable`.
2. **Gradiente no texto.** O original proíbe. A marca usa, e é a assinatura dela. Liberado só na
   headline e no número de resultado, com todos os stops verificados em contraste.
3. **Tag acima do título.** O original pede em todo slide. É eyebrow, proibido pelo design guide e
   pela `/impeccable`. Ela vive no rodapé, ao lado da barra de progresso.
5. **Borda lateral colorida em card.** Proibida nos dois lados. Card leva borda de 1px.
6. **Fontes em base64.** Desnecessário: o `render-carrossel.js` espera `document.fonts.ready`.

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

## Tokens

```css
:root{
  /* Fundo */
  --bg:#0A0A0B;          /* preto com matéria, não #000 chapado */
  --bg-2:#111114;
  --line:rgba(255,255,255,.14);

  /* Texto */
  --tx:#FFFFFF;
  --tx-2:rgba(255,255,255,.78);
  --tx-3:rgba(255,255,255,.52);

  /* Gradiente Azul, único */
  --g1:#CDE8FF; --g2:#62A0FF; --g3:#4A72F0;
  --grad:linear-gradient(180deg,var(--g1) 0%,var(--g2) 48%,var(--g3) 100%);

  --r:40px;              /* raio da caixa de imagem */
}
```

**Contraste verificado sobre `--bg`:** os três stops do gradiente dão 15,6:1, 7,5:1 e 4,7:1.
`--tx-2` acima de 13:1, `--tx-3` 6,1:1. Stop novo só entra depois da mesma verificação.

O azul do gradiente também é a cor do rótulo e do preenchimento de progresso no rodapé, o que
amarra a peça sem precisar de segunda cor.

---

## Escala tipográfica

Família única: **Schibsted Grotesk**. Números de medição em IBM Plex Mono.

| Elemento | Tamanho | Peso | Entrelinha | Tracking |
|---|---|---|---|---|
| Headline de capa | 96 a 108px | 800 | 0,95 | -0.03em |
| Headline interna | 76 a 88px | 800 | 0,98 | -0.025em |
| Corpo | 36 a 40px | 400 | 1,32 | -0.01em |
| Ênfase no corpo | 36 a 40px | 700 | 1,32 | -0.01em |
| Numeração grande | 120px | 200 | 1 | -0.02em |
| Barra de marca | 22px | 600 | 1 | 0.12em, uppercase |
| Rótulo do rodapé | 16px | 700 | 1 | 0.18em, uppercase |
| Contador | 16px | 500 | 1 | 0.08em |

Headline sempre em **caixa de frase**. Uppercase só na barra de marca e no rótulo do rodapé.
Corpo em uppercase está proibido.

Se a headline passar de 5 linhas, reduzir de 8 em 8px, com piso em 80px. Se ainda não couber,
encurtar o texto mantendo o padrão da headline (ver `headlines.md`).

---

## A diagramação de ênfase

É o que dá densidade às peças da marca, e é a técnica que mais muda o resultado.

**Regra:** dentro de um mesmo parágrafo, a **afirmação vai em peso 700 e branco puro**, e o
**desenvolvimento vai em peso 400 e `--tx-2`**. O olho pega a tese antes de ler a frase inteira.

```html
<p class="corpo"><b>Liderar inteligências será a habilidade mais valorizada do mercado.</b>
Quem dominar isso primeiro terá mais tempo, mais lucro e mais liberdade.</p>
```

Duas variações válidas:

- **Ênfase de abertura:** a primeira frase em 700, o resto em 400. É a mais usada.
- **Ênfase de fechamento:** o desenvolvimento em 400 e a conclusão em 700, quando o peso da frase
  está no fim.

**Terceiro registro: o realce.** Uma expressão de uma a três palavras com fundo em `--g1` e texto
em `#0A0A0B`, que dá 15,6:1. Serve para o termo que a peça quer que o leitor leve embora, tipo o
nome do custo ou o número. **Um realce por peça inteira, não por slide.** Dois já viram decoração.

Trocar a cor da palavra e nada mais é o registro mais fraco de todos, e está proibido: ou é peso,
ou é realce com fundo.

**Limites:** no máximo dois trechos em 700 por slide, e o trecho em 700 nunca passa de duas linhas.
Parágrafo inteiro em 700 anula a técnica, porque sem contraste não existe ênfase.

Gradiente nunca entra no corpo. No corpo, ênfase é peso.

---

## Ocupação do canvas

O método original manda ancorar tudo no terço inferior. **As peças reais da Anti Custos não fazem
isso: elas preenchem.** Zona morta grande no topo é o erro mais visível do formato, e a regra aqui é
outra, por tipo de slide:

- **Slide só de texto:** o bloco fica opticamente centrado entre a barra de marca e o rodapé.
- **Slide com foto de fundo:** o texto ancora embaixo, onde o scrim é mais forte.
- **Slide numerado:** ancora no alto, logo abaixo da régua.
- **Slide com caixa de imagem:** o texto começa depois da caixa, nunca por cima dela.

Se sobrar mais de um terço de vazio: subir o corpo para 44px, virar layout numerado, ou fundir com o
slide seguinte. Pedir mais conteúdo ao usuário é o último recurso.

**Densidade controlada.** Ou muito ar, ou muita informação. Nunca o meio-termo morno, que é o
estado em que o slide não é editorial nem é denso, só parece inacabado.

Referência numérica: 45 a 90 palavras em slide de texto, 60 a 100 no numerado. Abaixo de 40 o slide
precisa virar full bleed de duas ou três palavras por linha, não continuar sendo um parágrafo curto
perdido no meio do canvas.

---

## Layouts

Seis. Cada slide usa exatamente um.

### L1, Capa com imagem de fundo

Imagem full-bleed, escurecida pelo scrim padrão. Headline em gradiente ocupando do meio para baixo,
subtexto em branco logo abaixo.

Uso: sempre o slide 1 quando houver imagem.

### L2, Capa ou slide só de texto

Fundo `--bg` com grão. Headline em gradiente e corpo com diagramação de ênfase.

Uso: capa sem imagem, e qualquer slide de tese forte. É o layout mais legível da coleção e o que
melhor sobrevive à miniatura do feed.

### L3, Imagem em caixa

Imagem dentro de caixa com raio de 40px, ocupando do topo até cerca de 62% da altura, com margem de
40px nas laterais. Texto abaixo com diagramação de ênfase.

Uso: quando a imagem é retrato, ilustração ou captura que precisa ser vista inteira. Melhor escolha
quando a imagem tem detalhe fino, porque ela não compete com texto por cima.

### L4, Imagem de fundo com scrim inferior

Imagem full-bleed. A metade de baixo recebe scrim forte e recebe o texto. A de cima fica livre para
o assunto da foto.

Uso: quando o assunto da foto está no topo do enquadramento.

### L5, Numerado

Numeral grande em peso 200 no alto, régua de 1px abaixo dele, e o corpo com diagramação de ênfase
ocupando o resto. Sem headline separada.

Uso: sequência de argumentos, etapas ou blocos de dado. Substitui a tag do método original, e a
numeração aqui carrega informação de verdade, que é a posição na sequência.

### L6, Citação

Aspas decorativas gigantes ao fundo (280px, opacidade 8%), texto da citação por cima em corpo
grande, atribuição embaixo em `--tx-3`.

Uso: quando a peça cita alguém de verdade, com nome e fonte. Nunca para inventar citação.

### L7, Split

Metade do slide é bloco sólido em `--g2` com o numeral ou o rótulo em texto quase preto, a outra
metade é o texto sobre `--bg`. Divisão vertical.

Uso: quebra de ritmo no meio da peça, ou contraste entre duas ideias. Texto sobre o bloco sólido é
sempre `#0A0A0B`, que dá 7,5:1. Nunca branco sobre `--g2`, que reprova.

### L8, CTA

Fecha a peça. Ponte, ação e assinatura, com a barra de progresso cheia.

**O CTA tem que parecer diferente de todos os outros slides.** Se ele usar o mesmo layout de um
slide anterior, o leitor não percebe que a peça acabou. Marcar com o glow, com o bloco sólido ou
com a logo, quando ela existir.

---

## Tratamento de imagem

O usuário envia as imagens. A skill nunca busca, gera nem inventa imagem.

### Scrim: a regra que garante legibilidade

Texto sobre foto só é aceitável com scrim. **Nunca confiar na foto ser escura.** O scrim é sempre
duas camadas, nesta ordem:

```css
/* 1. Base: derruba o brilho geral da foto */
.scrim-base{position:absolute;inset:0;background:rgba(8,8,10,.55)}

/* 2. Rampa: garante o contraste onde o texto de fato mora */
.scrim-rampa{position:absolute;inset:0;background:linear-gradient(180deg,
  rgba(8,8,10,.10) 0%, rgba(8,8,10,.35) 38%, rgba(8,8,10,.86) 66%, rgba(8,8,10,.97) 100%)}
```

Para L4, subir a rampa: 45% no ponto de 30% e 0,92 já em 55%.

**Piso obrigatório:** a soma das duas camadas nunca desce abaixo de 70% de opacidade na faixa onde
o texto se apoia. Se a foto for clara ou muito detalhada nessa faixa, subir a base para 0,68 antes
de qualquer outra tentativa.

**Verificação:** depois de renderizar, olhar o PNG e checar se o texto continua legível na
miniatura. Foto ocupada atrás de headline em gradiente é o modo de falha mais comum do formato:
o gradiente tem partes claras, e parte clara sobre parte clara some.

### Como escolher entre foto de fundo e caixa

Esta ordem é obrigatória e não se reinterpreta:

1. **Se o usuário disse o que quer** ("quero como fundo", "coloca em box"), usar o que ele pediu.
   Ponto final, sem reclassificar por conta própria.
2. **Se ele não disse**, decidir pelo tipo de imagem: foto, retrato ou ambiente vai de fundo (L1 ou
   L4); print de tela, interface, gráfico ou captura de conversa vai em caixa (L3).
3. **Na dúvida, perguntar antes de gerar.** Errar aqui custa um render inteiro.

### Enquadramento

**Regra geral: nunca cortar nem esticar uma imagem de forma que ela perca informação.**

- **Foto de fundo:** `object-fit: cover`, com `object-position` escolhido para não decapitar o
  assunto. `left center` é um padrão melhor que `center` quando a pessoa está à esquerda do quadro.
- **Print ou captura de tela:** `object-fit: contain`, **nunca cover**. Cover corta a borda do print
  e destrói justamente a informação que fez o print existir. Fundo da caixa em
  `rgba(255,255,255,.05)` para o print não flutuar no vazio.
- Print pequeno nunca é esticado para preencher a caixa. Melhor sobrar moldura que perder nitidez.
- Assunto da foto no terço superior em L1 e L4, centralizado em L3.
- Foto em preto e branco ou dessaturada combina melhor com headline em gradiente, porque a peça
  passa a ter uma fonte de cor só. Foto colorida e saturada pede L3, onde a caixa isola a imagem.

### Quando não há foto

O slide não pode parecer que faltou a foto. Recursos, em ordem de preferência:

- **Atmosfera:** gradiente de fundo em `linear-gradient(160deg,#101218,#0A0A0B,#08080A)`, com
  amplitude de 1,9x de luminância. É quase imperceptível de propósito: tira o preto chapado sem
  puxar atenção. É o tratamento padrão do slide sem imagem.
- **Glow:** `radial-gradient` de `--g2` a 13% atrás do bloco de texto. Puxa foco, então fica
  reservado para os dois slides que merecem: o de tese e o de fechamento.

**Atmosfera e glow são mutuamente exclusivos.** Um slide recebe um ou outro, nunca os dois, e slide
com foto não recebe nenhum. Empilhar os dois é exatamente o que faz o fundo roubar a headline.
- **Numeral gigante de textura:** 300 a 600px, opacidade de 3% a 8%, podendo vazar da área segura.
  Diferente do contador do rodapé, que é informação. Este é matéria.
- **Full bleed de texto:** duas ou três palavras por linha, impacto máximo.
- **Split:** bloco sólido em metade do slide.

### Grão

Grão de 3% a 5% sobre o fundo, e também sobre a foto em L1 e L4. Ele une a foto ao fundo e é o que
separa preto chapado de preto com matéria. Gerado por SVG inline com `feTurbulence`, nunca arquivo.

---

## Elementos fixos

**Barra de marca**, topo, 56px de recuo: `®ANTI CUSTOS` à esquerda, `@anticustos.ia` à direita,
uppercase, 22px, peso 600, tracking 0.12em, `--tx-3`.

**Rodapé**, em todo slide: rótulo da seção à esquerda em `--g2`, trilho de progresso no meio com o
preenchimento proporcional ao slide atual, e contador `02/09` em fonte mono à direita. Sem seta de
swipe: o gesto é nativo do Instagram e a barra já comunica que existe mais peça pela frente.

**Área segura:** 56px na horizontal, 56px no topo, 130px embaixo por causa do rodapé.

---

## Componentes

**Tabela de conta aberta.** Cabeçalho com fundo `rgba(255,255,255,.06)`, valores em IBM Plex Mono
com numeral tabular. Três linhas ou mais. Valor final em `--g2`.

**Número grande de resultado.** IBM Plex Mono 500 em 140px, preenchido com o gradiente, com o label
logo abaixo em `--tx-3`.

**Linhas com marcador.** Duas ou três, marcador tipográfico em `--g2`. Mais de quatro vira lista.

**Card.** Fundo `--bg-2`, borda de 1px em `--line`, raio de 24px. Card dentro de card é proibido.

**Logo no fechamento.** Quando `marca/design-guide.md` tiver arquivo de logo, ele entra no slide de
CTA com 120 a 200px de largura. Enquanto não houver, o fechamento usa o nome em peso 800.

---

## Checklist antes de renderizar

0. Nenhum texto por cima da caixa de imagem, e nenhum slide com mais de um terço de vazio
1. Gradiente só na headline e no número de resultado
2. Gradiente só na headline, nunca no corpo
3. No máximo dois trechos em peso 700 por slide
4. Scrim de duas camadas em toda foto com texto por cima, piso de 70%
5. Texto legível na miniatura, conferido no PNG
6. Headline em caixa de frase, em até 5 linhas
7. Área segura respeitada, 150px embaixo
8. Nunca três slides seguidos do mesmo layout
9. Rodapé com rótulo, progresso e contador em todo slide
9b. Print e captura de tela em `contain`, foto em `cover`, e nenhuma imagem esticada
9c. CTA visualmente diferente de todos os outros slides
10. Nenhuma prova social, porque não existe nenhuma

## Anti-patterns visuais

- Texto sobre foto sem scrim, ou com scrim de uma camada só
- Gradiente claro sobre região clara da foto
- Gradiente no corpo do texto
- Gradiente em qualquer coisa que não seja headline ou número de resultado
- Parágrafo inteiro em peso 700
- Headline em uppercase
- Texto centralizado horizontalmente em slide de conteúdo
- Card dentro de card
- Borda lateral colorida acima de 1px
- Emoji fazendo papel de ícone
- Stock de robô, cérebro digital ou mão tocando holograma
