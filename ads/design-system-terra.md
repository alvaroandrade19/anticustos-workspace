# Design System: Terra Interativa

Sistema alternativo ao `ads/design-system.md` (frio, tokens claros do `marca/design-guide.md`),
para o quiz de diagnóstico. Não é mistura de cor entre Terra e Terra Clara, os dois já usam a mesma
paleta. É mistura de **função**: puxa a temperatura e a assinatura de ambos, e resolve o que nenhum
dos dois precisou resolver antes, que é vocabulário de interface. Terra e Terra Clara são carrossel,
peça estática de 1080x1350. O quiz tem input, botão, estado de seleção e slider, nenhum dos dois tem
isso hoje.

Fonte de cada peça, para não reabrir os arquivos originais:

| Veio de | O quê |
|---|---|
| **Terra Clara** (`estilo-terra-clara.css`) | Fundo claro e a paleta inteira, Newsreader no título, Libre Franklin na estrutura, o grifo de caneta como assinatura, cabeçalho de fio duplo |
| **Terra** (`estilo.css`, bloco `[data-paleta="terra"]`) | A placa escura para o cabeçalho de resultado, se a peça quiser um momento de contraste |
| **Novo aqui** | Botão, input, estado de seleção, slider, foco visível, toda a camada que faz a peça responder a clique |

---

## Uma decisão que precisa ser tua antes de eu construir

**Se o criativo do anúncio for Azul (o padrão hoje) e o quiz for Terra, existe uma quebra visual
entre o anúncio e a página.** Quem clica sai do azul frio e cai no barro quente, e isso é o tipo de
descontinuidade que aumenta desconfiança em tráfego frio, porque a pessoa não tem certeza se caiu no
lugar certo. Duas saídas, e as duas são válidas:

1. **O criativo do teste também vai de Terra.** Aí ad e página contam a mesma história visual, e o
   teste de criativo e o teste de página andam juntos. É a opção que eu recomendo, porque o Terra é
   mais distinto de qualquer concorrente de IA (que vive no azul frio de SaaS), e distinção ajuda
   justamente no anúncio, onde o objetivo é parar o scroll.
2. **O quiz fica no sistema frio** (`ads/design-system.md`), que já é o oficial da marca, e o Terra
   Interativa vira reserva para quando a campanha inteira migrar de paleta.

Nenhuma das duas está construída ainda, então não há custo afundado em decidir agora.

---

## Tokens

```css
:root{
  /* Superfície, herdada do Terra Clara */
  --bg:      #F3EEE6;  /* papel */
  --surface: #FBF8F2;  /* folha inserida: card, tabela, input */
  --line:    #DED7CA;  /* fio */

  /* Texto */
  --h1:  #2A1A0C;  /* título, marrom terra fundo. 14,53:1 sobre --bg */
  --h2:  #35281C;  /* título de miolo, marrom neutro. 12,36:1 */
  --text:   #2A1A0C;  /* tinta cheia: ênfase, número, botão. mesmo valor de --h1 */
  --text-2: #514D47;  /* corpo e estrutura, cinza quente. 7,27:1 */

  /* Acento, um só: a caneta terracota */
  --ink:    #8F4A24;  /* botão, foco, seleção, link. 5,73:1 sobre --bg */
  --ink-2:  #AC6238;  /* fim do traço do grifo, só gesto gráfico, nunca texto */

  --trilho: rgba(42,26,12,.14);
  --erro:   #A6341F;  /* vermelho terroso, não o carmim banido. Verificar contraste antes de shipar */

  --radius: 12px;   /* mais contido que o 16px do sistema frio: aqui a borda faz o trabalho, não o raio */
  --ease: cubic-bezier(.16,1,.3,1);

  --F:  'Libre Franklin', system-ui, sans-serif;  /* estrutura: label, botão, opção, rodapé */
  --FH: 'Newsreader', Georgia, serif;              /* pergunta e título de resultado */
  --M:  'IBM Plex Mono', ui-monospace, monospace;  /* todo número medido */
}
html{ color-scheme: light; }
```

**Por que Newsreader e não Calistoga aqui.** Calistoga é a headline do Terra escuro, feita para
poster, quatro a oito palavras em tamanho grande. A pergunta do quiz é frase inteira, lida como
formulário, e pede uma serifada que sustente leitura corrida, que é exatamente o que o Terra Claro já
resolveu escolhendo Newsreader. Se algum dia a peça quiser um número de resultado gigante em serifa,
Calistoga entra só ali, nunca na pergunta.

**Proibido nesta superfície:** azul do sistema frio (`--accent-strong` do outro design system) e
qualquer cor fora desta paleta, gradiente em texto (o grifo substitui o gradiente aqui, igual no
Terra Clara), cinza puro fora de `--text-2`, sombra decorativa.

---

## Tipografia

| Nível | Fonte | Tamanho | Peso | Uso |
|---|---|---|---|---|
| Pergunta (H1 de etapa) | `--FH` Newsreader | `clamp(28px, 4.5vw, 44px)` | 500 | Uma por etapa, `font-variation-settings:"opsz" 48` |
| Título de resultado | `--FH` Newsreader | 32px | 500 | "18 horas por semana" |
| Corpo, apoio de pergunta | `--F` Libre Franklin | 18px | 400 | Linha de contexto abaixo da pergunta |
| Opção de escolha | `--F` Libre Franklin | 18px | 400, 500 se selecionada | Texto dentro do botão de opção |
| Label de campo | `--F` Libre Franklin | 14px | 600, uppercase, tracking `.10em` | Acima do input, eco do `.topo` do Terra Clara |
| Legenda, origem do número | `--F` Libre Franklin | 14px | 400 | Colada embaixo do número, nunca em margem separada |
| Número medido | `--M` IBM Plex Mono | 32 a 56px conforme o peso do resultado | 500 | Único lugar onde a mono aparece |

`line-height` 1.25 na pergunta, 1.5 no corpo. Nenhum uppercase fora do label de campo e do rótulo de
progresso, pela mesma regra do sistema editorial: título em uppercase é proibido.

---

## O grifo, a assinatura desta superfície

Substitui gradiente e substitui negrito colorido. Um traço de tinta sob a palavra ou expressão que a
tela quer que fique. **Uma vez por etapa**, não uma vez pela peça inteira, porque aqui cada etapa é
uma tela separada, diferente do carrossel onde a peça inteira é uma unidade só.

```css
.grifo{
  background-image: linear-gradient(90deg, var(--ink), var(--ink-2));
  background-repeat: no-repeat;
  background-size: 100% 4px;
  background-position: 0 100%;
  padding-bottom: .1em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

```html
<h1 class="pergunta">Quanto tempo cada <span class="grifo">atendimento</span> leva, do começo ao fim?</h1>
```

---

## Cabeçalho e rodapé de página, ecoando o Terra Clara

Diferente do carrossel, o cabeçalho não se repete por etapa, é chrome fixo da página inteira. Fio
duplo, marca à esquerda, indicador de etapa à direita, no lugar onde o Terra Clara colocava o perfil.

```css
.topo{
  display:flex; justify-content:space-between; align-items:baseline;
  padding:24px 32px 16px; border-bottom:3px double var(--line);
  font-family:var(--F); font-size:14px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  color:var(--text-2);
}
```

Rodapé leve, uma linha, sem fio duplo (esse fica só no topo, para não pesar a tela pequena de
celular): aviso de privacidade e nada mais. Nenhuma placa, nenhuma foto de fundo aqui, formulário não
carrega imagem editorial.

---

## Progresso

Trilho quente em vez do azul do sistema frio, preenchido pela caneta.

```css
.progresso{ height:4px; background:var(--trilho); border-radius:9999px; overflow:hidden; }
.progresso-fill{ height:100%; background:var(--ink); transition:width .3s var(--ease); }
.progresso-label{
  font-family:var(--F); font-size:13px; font-weight:600; letter-spacing:.08em;
  color:var(--text-2); margin-top:8px;
}
```

---

## Campo de formulário

Estrutura idêntica em regra ao sistema frio (label sempre visível, erro abaixo do campo, alvo de
toque de 44px), só a cor muda.

```css
.label{
  font-family:var(--F); font-size:14px; font-weight:600; letter-spacing:.10em; text-transform:uppercase;
  color:var(--text-2); display:block; margin-bottom:8px;
}
input{
  width:100%; min-height:44px; padding:12px 16px;
  border:1px solid var(--line); border-radius:var(--radius);
  background:var(--surface); color:var(--text); font-family:var(--F); font-size:17px;
}
input:focus-visible{ outline:2px solid var(--ink); outline-offset:2px; }
.erro{ color:var(--erro); font-size:14px; margin-top:8px; font-family:var(--F); }
```

---

## Opção de escolha

Aqui está o componente que nem Terra nem Terra Clara tinham, porque nenhum dos dois precisa de algo
clicável. Desenhado como a `.clausula` do Terra Clara (ordinal em mono à esquerda, texto à direita),
só que agora é botão de verdade.

```css
.opcao{
  width:100%; display:flex; align-items:baseline; gap:20px;
  min-height:44px; padding:16px 20px;
  border:1px solid var(--line); border-radius:var(--radius); background:var(--surface);
  font-family:var(--F); font-size:17px; color:var(--text); text-align:left; cursor:pointer;
  transition: border-color .2s var(--ease), background .2s var(--ease);
}
.opcao .ord{
  font-family:var(--M); font-size:14px; font-weight:500; letter-spacing:.04em; color:var(--ink);
  flex-shrink:0;
}
.opcao:hover{ border-color:var(--ink); }
.opcao[aria-pressed="true"]{
  border-color:var(--ink); background:#F7F0E8; font-weight:500;
}
```

O ordinal em mono terracota é o mesmo dispositivo que o Terra Clara usa nas cláusulas, reaproveitado
como numeração de alternativa (A, B, C) em vez de numeração de parágrafo.

---

## Slider

```css
.slider-linha{ display:flex; align-items:center; gap:16px; }
input[type="range"]{ flex:1; accent-color: var(--ink); }
.slider-valor{
  font-family:var(--M); font-variant-numeric:tabular-nums; color:var(--text);
  min-width:3ch; text-align:right;
}
```

---

## Botão de ação

```css
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  min-height:44px; padding:12px 32px;
  background:var(--ink); color:var(--bg); font-family:var(--F); font-weight:600; font-size:16px;
  border-radius:9999px; border:none; cursor:pointer;
  transition: background .2s var(--ease);
}
.btn:hover{ background:#7A3E1D; }
.btn-secundario{ background:transparent; color:var(--text); border:1px solid var(--line); }
```

---

## Número de resultado, com opção de placa

Modo padrão, sobre papel, igual ao `.soma` do Terra Clara:

```css
.valor{
  font-family:var(--M); font-variant-numeric:tabular-nums;
  font-size:48px; font-weight:500; letter-spacing:-.02em; color:var(--text);
}
.valor-origem{ font-family:var(--F); font-size:14px; color:var(--text-2); margin-top:8px; }
```

**Modo placa**, opcional, reservado para o bloco de resultado se a tela quiser um momento de
contraste (o negativo do sistema, papel virando tinta): fundo `#110B07`, texto e número invertidos.
Usar no máximo uma vez na jornada inteira, no resultado final, nunca em tela de pergunta.

```css
.placa{
  background:#110B07; color:#F3EEE6; padding:32px; border-radius:var(--radius);
}
.placa .valor{ color:#F3EEE6; }
.placa .valor-origem{ color:#C9C3B9; }
```

---

## Movimento

Mesma regra de qualquer superfície da marca, um momento autoral só, o bloco de acessibilidade é
condição de entrega.

```css
@keyframes entrada{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }
.etapa-ativa{ animation: entrada .4s var(--ease); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Checklist antes de publicar

1. Nenhuma cor azul do sistema frio vazou para esta peça, e vice-versa nunca acontece na mesma peça
2. Newsreader na pergunta, Libre Franklin na estrutura, IBM Plex Mono só no número
3. Grifo usado no máximo uma vez por etapa, nunca como marca-texto grosso
4. Todo campo com label visível e erro abaixo dele
5. Alvo de toque de 44px, anel de foco em `--ink`, nunca removido
6. Trilho de progresso na cor quente, nunca reaproveitando `--accent-strong` do sistema frio
7. Bloco `prefers-reduced-motion` presente
8. Se usar `.placa`, no máximo uma vez, e só no resultado final
9. Número sempre com a origem colada embaixo, nunca em margem separada
10. Decisão tomada sobre o criativo do anúncio acompanhar esta paleta ou não, antes de rodar mídia
