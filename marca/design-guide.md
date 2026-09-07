# Guia de Design: Anti Custos

> Você pode editar esse arquivo a qualquer momento.
> As skills de carrossel, proposta e slide leem este arquivo antes de criar qualquer visual.

**Direção:** dark premium com respiro Apple. A base escura vem do site anterior do projeto (NEXUS AI). O que muda: acento único azul, muito mais espaço vazio, hierarquia por tamanho em vez de cor, neutros levemente azulados em vez de cinza puro, e nada de efeito chamativo.

**Este arquivo é o brief.** A skill `/impeccable` explicitamente diz que o brief vence as regras genéricas dela. Onde este guia for específico, ele manda. Onde ele for omisso, vale a impeccable.

---

## Cores

Todos os neutros têm um leve viés azul. Cinza puro em fundo colorido é um dos tells mais fáceis de identificar em peça gerada por IA, e o azul do acento fica mais coerente quando os neutros conversam com ele.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#05060A` | Fundo principal |
| `--surface` | `#0C0E14` | Card, painel, bloco elevado |
| `--surface-2` | `#141821` | Segundo nível de elevação, input, hover de card |
| `--line` | `rgba(126,146,196,.16)` | Borda de 1px, divisor |
| `--text` | `#F2F4F8` | Texto principal |
| `--text-2` | `#A8AEBF` | Texto secundário, legenda longa |
| `--text-3` | `#767D91` | Metadado, rodapé, label |
| `--accent` | `#2563EB` | Gráfico, ícone, borda de foco, texto grande |
| `--accent-strong` | `#1D4ED8` | Fundo de botão primário |
| `--accent-hover` | `#1E40AF` | Botão pressionado ou em hover |
| `--accent-link` | `#7CA5F5` | Link e texto de acento em corpo |

**Contraste, já verificado contra o fundo `#05060A`:**

- `--text` e `--text-2`: acima de 9:1. Folgado.
- `--text-3`: 4,87:1. Passa em corpo, mas só use em texto curto e não crítico.
- `--accent` como texto: 3,9:1. **Só em texto grande, ícone ou borda. Nunca em corpo.**
- Branco sobre `--accent`: 4,1:1, reprova. Por isso o botão primário usa `--accent-strong`, onde branco dá 6,7:1.
- `--accent-link` sobre o fundo: 8,2:1. Esse é o azul de link.

**Superfícies claras (carrossel e apresentação).** O dark é a base da marca, mas o carrossel alterna
claro e escuro por ritmo de leitura. Os tokens claros são estes, e não outros:

| Token | Valor | Uso |
|---|---|---|
| `--LB` | `#EEF1F6` | Fundo claro, off-white com o mesmo viés azul |
| `--LS` | `#FFFFFF` | Card sobre fundo claro |
| `--LT` | `#0B0E14` | Texto principal no claro |
| `--LT2` | `#454C5C` | Texto secundário no claro, 7,6:1 |
| `--LL` | `#D8DEE9` | Borda e divisor no claro |

Sobre fundo claro o acento é `--accent-strong` (5,9:1). `--accent` puro dá 4,5:1 no limite e não deve
carregar corpo de texto.

## Gradientes da marca

As peças já publicadas da Anti Custos usam gradiente **no texto da headline**, e é isso que dá a
assinatura visual do feed. São duas famílias registradas, mais o azul institucional.

| Família | Stops | Onde usar |
|---|---|---|
| **Azul** (único) | `#CDE8FF` → `#62A0FF` → `#4A72F0` | Headline de carrossel, rótulo e progresso do rodapé, número de resultado |
| **Institucional** | `#172554` → `#1E3A8A` → `#1D4ED8` | Fundo de slide, proposta e apresentação. Nunca em texto |

Contraste dos três stops sobre `#0A0A0B`: **15,6:1, 7,5:1 e 4,7:1**. O piso de 4,7 é deliberado,
porque headline em 82px seria aprovada com 3:1 e mesmo assim o gradiente inteiro passa no critério
de texto pequeno. Stop novo só entra depois da mesma verificação.

A rampa vai do gelo, no alto, ao azul saturado, embaixo. Ela ganha movimento por variar valor e
saturação dentro da mesma faixa de matiz, e é isso que evita o azul chapado de template de SaaS.

Uma família de gradiente quente (creme ao coral) foi testada a partir das peças antigas e
descartada: a marca é azul.

**Regra de aplicação.** O gradiente corre no bloco inteiro da headline, e não em cada linha, para
que cada linha pegue uma faixa diferente da rampa. Corpo de texto nunca leva gradiente: ênfase no
corpo é peso, não cor.

**Proibido:**
- Carmim e rosa (`#e11d48`, `#be123c`, `#fb7185`), herdados do site antigo
- Cinza puro (`#71717A`, `#A1A1AA` e a escala neutra do Tailwind) como texto secundário. Usar os neutros azulados da tabela
- Segunda cor de acento, gradiente multicolorido, verde neon
- Gradiente em corpo de texto. No corpo, ênfase é peso. Gradiente só na headline de carrossel

---

## Tipografia

**Família:** Schibsted Grotesk (Google Fonts, gratuita). Títulos e corpo na mesma família.
**Números e dados:** IBM Plex Mono, e só onde é medição de verdade (valor de proposta, economia mensal, horas por semana). Mono como enfeite de "tecnológico" está proibido.

*Passamos por Inter e por Geist antes de chegar aqui. O detector da `/impeccable` lista as duas, junto com Roboto, Plus Jakarta Sans, Space Grotesk e Fraunces, como faces saturadas por interface gerada por IA. Schibsted Grotesk é neo-grotesca de origem editorial: sóbria, aguenta tamanho grande e tem caráter suficiente para não parecer template. Verificada contra o detector, passa limpa.*

**Escala.** Passo claro entre níveis, nada de dois tamanhos quase iguais:

| Nível | Tamanho | Peso | Tracking |
|---|---|---|---|
| Display | `clamp(44px, 7vw, 88px)` | 600 | `-0.035em` |
| H1 | `clamp(34px, 5vw, 56px)` | 600 | `-0.03em` |
| H2 | `32px` | 600 | `-0.02em` |
| H3 | `20px` | 600 | `-0.01em` |
| Corpo | `17px` | 400 | `0` |
| Corpo pequeno | `15px` | 400 | `0` |
| Label | `13px` | 500 | `0.01em` |

**Exceção do carrossel.** Uma família só, Schibsted Grotesk, em três pesos: **800 na headline**,
600 na ênfase dentro do corpo e 400 no corpo. Headline em caixa de frase, nunca em uppercase, com
entrelinha apertada (0,95) e tracking negativo.

Barlow Condensed uppercase foi testado e descartado: as peças reais da Anti Custos usam grotesca
neutra em caixa de frase, e a coerência de família única entre headline e corpo é parte do que faz
o feed parecer de uma marca só. Detalhe em `.claude/skills/carrossel/references/design-system.md`.

**Regras (fora da exceção acima):**
- Peso máximo 600. Nunca 700, 800 ou 900. Presença vem de tamanho e de espaço em volta
- Piso de tracking: `-0.04em`. Não apertar mais que isso
- Teto de display: 6rem, ou 96px
- Medida de linha do corpo: 65 a 75 caracteres. Em HTML, `max-width: 68ch`
- `line-height` 1.1 em título, 1.6 em corpo
- Título de duas linhas ou mais leva `text-wrap: balance`

---

## Espaçamento e ritmo

Escala de 4px. Usar só estes valores: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128**.

- Grupo relacionado fica junto, grupo diferente fica longe. A distância comunica a relação
- Sempre mais espaço acima de um título do que abaixo dele. O título pertence ao que vem depois
- Padding vertical de seção: 96px no desktop, 56px no mobile
- Padding lateral do container: 32px no desktop, 20px no mobile
- Largura máxima de conteúdo de leitura: 820px

---

## Estilo geral

Silêncio visual. Uma ideia por tela, título grande, muito espaço em volta, um único elemento colorido puxando o olho pra ação. O material tem que passar sobriedade e previsibilidade, que é exatamente o que a PME compra quando contrata IA.

Se a peça parece cheia, o problema quase nunca é falta de organização. É excesso de elemento.

---

## Componentes

**Card**
Fundo `--surface`, borda 1px `--line`, radius 18px, padding 32px. Card existe pra agrupar coisa que de fato pertence junto. Card dentro de card está proibido, sem exceção. Fileira de cards iguais com ícone, título e texto como estrutura da página também está proibida: é o layout mais previsível que existe.

**Botão**
- Primário: fundo `--accent-strong`, texto branco, peso 500, padding 14px 28px, radius 9999px
- Secundário: fundo transparente, borda 1px `--line`, texto `--text`
- Transição de 200ms em `background`. Sem escala, sem bounce

**Borda e divisor**
1px em `--line`, sempre. Borda lateral colorida acima de 1px em card, item de lista ou alerta está proibida.

**Sombra**
Quase nunca. Quando usar, precisa ter deslocamento e blur suave: `0 12px 32px -8px rgba(0,0,0,.6)`. Halo colorido sem deslocamento é decoração, não profundidade.

**Glass**
Só quando existe camada de verdade por baixo, tipo um header fixo sobre conteúdo que rola. `backdrop-filter: blur(12px)` com fundo `rgba(12,14,20,.72)`. Glass como enfeite em card estático está proibido.

**Ícone**
Biblioteca de verdade (Lucide) ou SVG desenhado, com traço e peso consistentes. Emoji e glifo Unicode fazendo papel de ícone estão proibidos.

**Textura de fundo**
Grão sutil sobre o fundo escuro, opacidade entre 3% e 5%. É o que separa preto chapado de preto com
matéria. Gerado por SVG inline, nunca por arquivo de imagem.

**Rodapé do carrossel**
Uma barra só, em todo slide: rótulo da seção à esquerda em `#62A0FF`, trilho de progresso no meio e
contador `02/09` em fonte mono à direita. Sem seta de swipe, porque o gesto é nativo do Instagram.

**Barra de marca (carrossel)**
`®ANTI CUSTOS` à esquerda e `@anticustos.ia` à direita, no topo, uppercase com tracking largo.

**Superfícies do navegador**
Isso é o que separa página construída de página montada, e é o que mais se esquece. Tematizar sempre: seleção de texto, cursor, anel de foco, scrollbar customizada, offset do sublinhado e numeral tabular em dado numérico.

---

## Movimento

- Um momento autoral por peça, não efeito espalhado por toda seção
- Entrada: `opacity` de 0 a 1 mais `translateY` de 8px, duração 400ms, easing `cubic-bezier(.16,1,.3,1)`
- Partir de um estado já visível. Nada de conteúdo que só existe depois do scroll
- Proibido: bounce, elastic, marquee, beam giratório, brilho pulsante, parallax pesado, contador regressivo
- Respeitar `prefers-reduced-motion`

---

## Formatos e medidas

| Peça | Dimensão | Observação |
|---|---|---|
| Carrossel Instagram | 1080x1350 | Margem de 80px lateral e 96px embaixo. Produzido pela skill `/carrossel` |
| Story | 1080x1920 | Zona segura: 250px no topo, 300px embaixo |
| Card quadrado | 1080x1080 | |
| Slide 16:9 | 1920x1080 | Uma ideia por slide |
| Post LinkedIn | 1200x1500 | Vertical rende mais no feed |
| Proposta e landing | 820px de conteúdo | Renderizar também em modo impressão |

Render de HTML pra PNG via Playwright, conforme `templates/ferramentas/catalogo.md`.

---

## O que NUNCA fazer

- Travessão em qualquer texto de peça visual
- Eyebrow ou kicker acima de título. O título se sustenta sozinho
- Numeração de seção (01 / 02 / 03) quando a sequência não carrega informação
- Duas cores de acento na mesma peça
- Cinza puro como texto secundário
- Título em peso 800 ou 900
- Marquee, contador regressivo, selo de "40% OFF". Isso comunica promoção, não consultoria
- Emoji em proposta comercial e apresentação
- Stock photo de robô, cérebro digital ou mão tocando holograma
- Sparkline, anel de progresso e retângulo arredondado com sombra fazendo papel de conteúdo
- Template de métrica de herói: número gigante, label pequeno, três stats de apoio

---

## Logo

- **Arquivo:** *(ainda não definido. Salvar em `marca/logo.svg` ou `marca/logo.png` quando existir)*
- **Versão pra fundo escuro:** *(a principal, já que a base é dark)*
- **Onde usar:** slide final do carrossel (CTA), header de propostas, slides de apresentação
- **Tamanho sugerido:** largura entre 120-200px nos HTMLs

*Enquanto não houver logo, usar o nome "Anti Custos" em Schibsted Grotesk 600, tracking `-0.02em`, cor `--text`.*

---

## Perfil do autor

> Usado no estilo "tweet" do carrossel.

- **Nome:** Alvaro de Andrade
- **Handle:** @anticustos.ia
- **Foto:** *(ex: marca/foto-perfil.jpg)*
- **Badge verificado:** não

---

## Observações adicionais

Referência de origem: `C:\Users\aandr\OneDrive\Área de Trabalho\ASIMOV DESIGN\ASSETS\index.html`. Consultar para estrutura de seção e componente, ignorando a paleta carmim e os efeitos de energia visual.

Modelo de proposta já usando estes tokens: `clientes/_modelo-cliente/proposta.html`.
