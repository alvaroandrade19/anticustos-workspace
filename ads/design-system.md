# Design System: Superfície de Conversão (quiz, proposta, landing)

Extraído de `marca/design-guide.md`, que é a autoridade e vence sempre que este arquivo divergir.
Este arquivo existe para não reabrir o guia inteiro toda vez que se constrói uma tela de formulário
ou resultado. Se falta algo aqui, a resposta está no guia, não inventada.

**Escopo:** qualquer peça onde a atenção vira contato. Quiz de diagnóstico, proposta, landing.
Não cobre carrossel nem story, que têm o próprio `design-system.md` em
`.claude/skills/carrossel/references/` e são sempre escuros.

---

## Achado que trava uma decisão

`clientes/_modelo-cliente/proposta.html`, o modelo hoje usado para gerar proposta de cliente, está
em tokens **escuros** (`--bg:#05060A`). O `design-guide.md`, na seção "Superfície de conversão",
manda tokens **claros** para proposta e landing, com três razões escritas: o comprador abre no
celular sob luz de dia, a proposta pode virar PDF onde fundo quase preto lê como amador impresso, e
a compra é de previsibilidade, onde o claro carrega menos teatro.

Isso é inconsistência entre um arquivo de implementação e a regra atual, não contradição de fonte
externa, então não trava por si só. Mas como o quiz é a segunda peça de conversão que o negócio
constrói, ambas deveriam usar o mesmo sistema. Duas saídas: migrar `proposta.html` para claro na
mesma leva, ou registrar formalmente que só o quiz muda por ora. Pendente de decisão do Alvaro.
O quiz especificado neste documento já segue o guia (claro), independente da decisão sobre a proposta.

---

## Tokens

```css
:root{
  /* Superfície */
  --bg:      #EEF1F6;  /* --LB, fundo claro com viés azul */
  --surface: #FFFFFF;  /* --LS, card sobre fundo claro */
  --line:    #D8DEE9;  /* --LL, borda e divisor */

  /* Texto */
  --text:    #0B0E14;  /* --LT, texto principal */
  --text-2:  #454C5C;  /* --LT2, texto secundário, 7,6:1 */

  /* Acento, um só */
  --accent-strong: #1D4ED8;  /* botão primário, foco, link. 5,92:1 sobre --bg */

  /* Estado */
  --error:   #B42318;  /* único uso aceitável de vermelho: mensagem de erro de campo, nunca decoração */

  --radius: 16px;
  --ease: cubic-bezier(.16,1,.3,1);
}
html{ color-scheme: light; }
```

**Proibido nesta superfície:** `--accent` puro (`#2563EB`) como texto de corpo, porque dá 4,57:1 no
claro e fica no limite. Cinza puro e a escala neutra do Tailwind. Carmim ou rosa fora do uso de erro
acima (`#e11d48`, `#be123c`, `#fb7185`). Segunda cor de acento. Gradiente fora da headline, se
houver headline de carrossel reaproveitada, o que não é o caso aqui.

**Números.** Onde a tela mostrar medição de verdade (o resultado do quiz, valor de proposta), usa
IBM Plex Mono, `font-variant-numeric: tabular-nums`, nunca a família de corpo.

---

## Tipografia

Schibsted Grotesk em título e corpo, a mesma família nos dois. IBM Plex Mono só em número medido.

| Nível | Tamanho | Peso | Tracking | Uso |
|---|---|---|---|---|
| H1 | `clamp(34px, 5vw, 56px)` | 600 | `-0.03em` | Pergunta ou título de etapa |
| H2 | 32px | 600 | `-0.02em` | Número de resultado (classe `.valor`, ver componentes) |
| H3 | 20px | 600 | `-0.01em` | Rótulo de bloco dentro do resultado |
| Corpo | 17px | 400 | `0` | Texto de apoio, opção de escolha |
| Corpo pequeno | 15px | 400 | `0` | Legenda, nota de rodapé, linha de origem do número |
| Label | 13px | 500 | `0.01em` | Rótulo de campo, acima do input, sempre visível |

Peso máximo 600 em qualquer texto desta superfície. `line-height` 1.1 em título, 1.6 em corpo.
Medida de linha do corpo entre 65 e 75 caracteres, `max-width: 68ch`. Título de duas linhas ou mais
leva `text-wrap: balance`.

---

## Espaçamento

Escala de 4px, só estes valores: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128.**

- Padding vertical de etapa: 96px desktop, 48px mobile.
- Padding lateral do container: 32px desktop, 20px mobile.
- Largura máxima do card de pergunta: 560px. Largura máxima de conteúdo de leitura: 820px.
- Distância maior acima de um título do que abaixo dele, sempre.

---

## Componentes desta superfície

### Card de etapa

```css
.card{
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 32px;
  max-width: 560px;
}
```
Card dentro de card é proibido, sem exceção, igual em qualquer outra peça da marca.

### Indicador de progresso

Trilho simples, sem anel de progresso decorativo (proibido pelo guia como "medidor fazendo papel de
conteúdo"). Barra horizontal fina, preenchimento em `--accent-strong`, com rótulo textual ao lado:
`Etapa 3 de 7`. Nunca só a barra sem número, e nunca em forma de anel ou spinner.

```css
.progresso{ height: 4px; background: var(--line); border-radius: 9999px; overflow: hidden; }
.progresso-fill{ height: 100%; background: var(--accent-strong); transition: width .3s var(--ease); }
```

### Campo de formulário

Regras do guia, condição de entrega, nenhuma é opcional:

```html
<label class="label" for="nome">Nome</label>
<input id="nome" type="text" aria-describedby="nome-erro">
<p id="nome-erro" class="erro" hidden>Digite seu nome.</p>
```

```css
.label{ font-size:13px; font-weight:500; letter-spacing:.01em; color:var(--text-2); display:block; margin-bottom:8px; }
input{
  width:100%; min-height:44px; padding:12px 16px;
  border:1px solid var(--line); border-radius:12px;
  background:var(--surface); color:var(--text); font-size:17px;
}
input:focus-visible{ outline:2px solid var(--accent-strong); outline-offset:2px; }
.erro{ color:var(--error); font-size:15px; margin-top:8px; }
```

Placeholder nunca substitui o label. Erro sempre abaixo do campo que o causou, nunca só um aviso
geral no topo. Alvo de toque mínimo 44px, com 8px de folga entre campos vizinhos.

### Botão de escolha (opção do quiz)

Cada opção é um botão de largura total, não um radio nativo escondido atrás de estilo customizado
frágil. Estado de seleção por borda e fundo, nunca só por cor de texto.

```css
.opcao{
  width:100%; text-align:left; min-height:44px; padding:16px 20px;
  border:1px solid var(--line); border-radius:12px; background:var(--surface);
  color:var(--text); font-size:17px; cursor:pointer;
  transition: border-color .2s var(--ease), background .2s var(--ease);
}
.opcao:hover{ border-color:var(--accent-strong); }
.opcao[aria-pressed="true"]{
  border-color:var(--accent-strong); background:#EFF4FF; font-weight:500;
}
```

### Slider (etapas de volume e tempo)

Valor numérico sempre visível e editável ao lado do controle, nunca só a alça sem número. No slider
de tempo, o total calculado (`.valor`, ver abaixo) atualiza ao vivo junto com o arrasto, que é a
mecânica que faz a etapa funcionar.

```css
.slider-linha{ display:flex; align-items:center; gap:16px; }
input[type="range"]{ flex:1; accent-color: var(--accent-strong); }
.slider-valor{ font-family:"IBM Plex Mono"; font-variant-numeric:tabular-nums; min-width:3ch; text-align:right; }
```

### Botão de ação

```css
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  min-height:44px; padding:12px 32px;
  background:var(--accent-strong); color:#fff; font-weight:500; font-size:16px;
  border-radius:9999px; border:none; cursor:pointer;
  transition: background .2s var(--ease);
}
.btn:hover{ background:#1E40AF; }
.btn-secundario{
  background:transparent; color:var(--text); border:1px solid var(--line);
}
```

### Número de resultado, conta aberta

Mesma regra de "Apresentação de número" do guia geral, reaproveitada aqui porque o resultado do quiz
é exatamente isso: número com a base à mostra.

```html
<div class="valor">18 horas por semana</div>
<p class="origem">12 vezes por dia, 4 minutos cada, 5 dias por semana, arredondado para baixo.</p>
```

```css
.valor{
  font-family:"IBM Plex Mono"; font-variant-numeric:tabular-nums;
  font-size:32px; font-weight:500; color:var(--text);
}
.origem{ font-size:13px; color:var(--text-2); margin-top:4px; }
```

Percentual nunca aparece sozinho, sempre com o valor absoluto ao lado. Número arredondado só para
baixo. Proibido: número em tamanho de display com label pequeno embaixo (o template de métrica de
herói), sparkline, anel de progresso ou medidor decorativo, mais de uma série de dado na mesma tela.

---

## Movimento

Um momento autoral só nesta superfície: a transição entre etapas do quiz.

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

O bloco `prefers-reduced-motion` é condição de entrega, não opcional. Proibido: bounce, elastic,
marquee, beam giratório, brilho pulsante, parallax, contador regressivo, barra de progresso com
efeito de brilho correndo por cima.

---

## Foco e acessibilidade

`:focus-visible` com anel de 2px em `--accent-strong` e 2px de deslocamento, em todo elemento
interativo: input, opção, slider, botão. Remover o anel de foco é proibido, sem exceção. Todo campo
tem label associado por `for`/`id`. Todo erro tem `aria-describedby` apontando pra ele. Depois de
qualquer envio, três estados visíveis: carregando, sucesso, falha. Nunca silêncio.

---

## Cabeçalho de página

`<html lang="pt-BR">`, `<title>` com o nome real da marca, favicon próprio (nunca emoji fazendo
papel de ícone), Open Graph 1200x630 em fundo **escuro** da marca, porque ali a peça aparece dentro
do feed de outra pessoa, onde volta a valer a lógica do Instagram.

---

## Checklist antes de publicar

1. Fundo, card e texto nos tokens claros desta página, nenhum token escuro do carrossel misturado
2. Nenhuma cor fora de `--accent-strong` mais o vermelho de erro
3. Schibsted Grotesk em título e corpo, IBM Plex Mono só em número medido, peso máximo 600
4. Todo campo com label visível, erro abaixo dele com `aria-describedby`
5. Alvo de toque de 44px em todo elemento clicável, com 8px de folga
6. Anel de foco visível e nunca removido
7. Bloco `prefers-reduced-motion` presente
8. Todo número com a linha de origem colada embaixo, percentual nunca sozinho, arredondamento pra baixo
9. Nenhum template de métrica de herói, nenhum anel ou medidor decorativo
10. `lang="pt-BR"`, favicon próprio, OG 1200x630 em fundo escuro
