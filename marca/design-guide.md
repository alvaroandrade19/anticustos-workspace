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

- `--text`: 18,39:1. `--text-2`: 9,13:1. Folgado nos dois.
- `--text-3`: 4,93:1. Passa em corpo, mas só use em texto curto e não crítico.
- `--accent` como texto: 3,92:1. **Só em texto grande, ícone ou borda. Nunca em corpo.**
- Branco sobre `--accent`: 5,17:1, passa em AA para corpo. Ainda assim o botão primário usa `--accent-strong`, onde branco dá 6,70:1: em alvo de toque a folga vale mais que a saturação.
- `--accent-link` sobre o fundo: 8,25:1. Esse é o azul de link.

*Recalculado em 2026-09-08 pela fórmula WCAG. Duas correções: branco sobre `--accent` constava aqui como 4,1:1 e "reprova", o que estava errado, e `--text` estava subdeclarado como "acima de 9:1" quando dá 18,39:1. Stop ou token novo só entra depois do mesmo recálculo.*

**Superfícies claras (carrossel e apresentação).** O dark é a base da marca, mas o carrossel alterna
claro e escuro por ritmo de leitura. Os tokens claros são estes, e não outros:

| Token | Valor | Uso |
|---|---|---|
| `--LB` | `#EEF1F6` | Fundo claro, off-white com o mesmo viés azul |
| `--LS` | `#FFFFFF` | Card sobre fundo claro |
| `--LT` | `#0B0E14` | Texto principal no claro |
| `--LT2` | `#454C5C` | Texto secundário no claro, 7,6:1 |
| `--LL` | `#D8DEE9` | Borda e divisor no claro |

Sobre fundo claro o acento é `--accent-strong` (5,92:1). `--accent` puro dá 4,57:1, no limite, e não
deve carregar corpo de texto.

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

**Exceção do carrossel.** Uma família só, Schibsted Grotesk, em **exatamente três pesos: 800 na
headline, 600 na ênfase dentro do corpo e 400 no corpo**. Peso 700 não existe nesse sistema, nem
aqui nem fora daqui. Headline em caixa de frase, nunca em uppercase, com entrelinha apertada (0,95)
e tracking negativo.

**Teto de tamanho da headline de carrossel.** O formato é julgado em miniatura no feed, então ele
tem teto próprio de **104px**, acima do teto geral de 96px. Em troca, vale o limite de extensão:
headline com mais de 60 caracteres desce um degrau de tamanho, e acima de 100 caracteres desce dois.
Frase inteira em corpo de display ocupa a tela toda e não sobra hierarquia para nada.

Barlow Condensed uppercase foi testado e descartado: as peças reais da Anti Custos usam grotesca
neutra em caixa de frase, e a coerência de família única entre headline e corpo é parte do que faz
o feed parecer de uma marca só. Detalhe em `.claude/skills/carrossel/references/design-system.md`.

**Regras (fora da exceção acima):**
- Peso máximo 600. Nunca 700, 800 ou 900. Presença vem de tamanho e de espaço em volta
- Piso de tracking: `-0.04em`. Não apertar mais que isso
- Teto de display: 6rem, ou 96px. A única exceção é a headline de carrossel, especificada acima
- Medida de linha do corpo: 65 a 75 caracteres. Em HTML, `max-width: 68ch`
- `line-height` 1.1 em título, 1.6 em corpo
- Título de duas linhas ou mais leva `text-wrap: balance`

---

## Espaçamento e ritmo

Escala de 4px. Usar só estes valores: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128**.

Isso vale também para os componentes especificados neste arquivo. Se uma medida daqui não está na
escala, a medida está errada, não a escala. Valor fora dela só entra com token nomeado e motivo
escrito. Medida de formato de peça (1080x1350, margem de 80px do carrossel, zona segura de story)
não é espaçamento de layout e não passa por essa regra.

- Grupo relacionado fica junto, grupo diferente fica longe. A distância comunica a relação
- Sempre mais espaço acima de um título do que abaixo dele. O título pertence ao que vem depois
- Padding vertical de seção: 96px no desktop, 48px no mobile
- Padding lateral do container: 32px no desktop, 20px no mobile
- Largura máxima de conteúdo de leitura: 820px

---

## Estilo geral

Silêncio visual. Uma ideia por tela, título grande, muito espaço em volta, um único elemento colorido puxando o olho pra ação. O material tem que passar sobriedade e previsibilidade, que é exatamente o que a PME compra quando contrata IA.

Se a peça parece cheia, o problema quase nunca é falta de organização. É excesso de elemento.

---

## Componentes

**Card**
Fundo `--surface`, borda 1px `--line`, radius 16px, padding 32px. Card existe pra agrupar coisa que de fato pertence junto. Card dentro de card está proibido, sem exceção. Fileira de cards iguais com ícone, título e texto como estrutura da página também está proibida: é o layout mais previsível que existe.

**Botão**
- Primário: fundo `--accent-strong`, texto branco, peso 500, padding 12px 32px, radius 9999px. Altura mínima de 44px, que é o alvo de toque
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

## Apresentação de número

O Princípio 1 do produto é "número antes de adjetivo", e a única prova que a marca tem é uma
medição. Logo, o número não é ornamento da peça, é o argumento dela. Esta seção diz como ele
aparece, porque proibir sem especificar o positivo produz peça tímida.

**Forma padrão.** IBM Plex Mono, `font-variant-numeric: tabular-nums`, tamanho de H2 (32px), peso
500, cor `--text`. Tamanho de display fica reservado para a headline, não para o número: quem
convence é a conta, não o corpo tipográfico.

**Todo número carrega a fonte colada nele.** Logo abaixo, em Label (13px, `--text-3`), uma linha
dizendo de onde ele veio. Sem essa linha, o número não entra na peça. Vale a regra das duas fontes:
ou é dado público com referência, ou é conta aberta com a base à mostra. Não existe terceira opção.

**Percentual nunca aparece sozinho.** Sempre com o valor absoluto ao lado ("de 34 para 3", não
"queda de 91%"). Percentual sem base é a forma mais fácil de inflar resultado sem mentir, e é
exatamente o que a marca se proibiu de fazer.

**Comparação antes e depois.** Barra horizontal simples, ordenada por magnitude, rótulo e valor
escritos direto na barra, nunca em legenda separada. Máximo de uma série por peça. Barra em
`--accent`, trilho em `--surface-2`. Eixo com rótulo ou sem eixo, nunca eixo mudo.

**Medição própria é sempre nomeada como própria.** "Medição no meu ambiente" ou equivalente, na
mesma peça, com o mesmo peso visual do número. Nunca projetada como resultado de cliente, nunca
generalizada em "empresas economizam X".

**Proibido:**
- Número em tamanho de display com label minúsculo embaixo, com ou sem stats de apoio. É o template
  de métrica de herói, e continua banido
- Mais de uma série de dados na mesma peça
- Sparkline, anel de progresso, medidor e barra de progresso como enfeite de dado
- Cor sozinha carregando o significado de uma categoria. Sempre rótulo direto junto
- Número arredondado para cima "para ficar melhor". Se precisa arredondar, arredonda para baixo

---

## Movimento

- Um momento autoral por peça, não efeito espalhado por toda seção
- Entrada: `opacity` de 0 a 1 mais `translateY` de 8px, duração 400ms, easing `cubic-bezier(.16,1,.3,1)`
- Partir de um estado já visível. Nada de conteúdo que só existe depois do scroll
- Proibido: bounce, elastic, marquee, beam giratório, brilho pulsante, parallax pesado, contador regressivo
- **Respeitar `prefers-reduced-motion`, e isso é condição de entrega.** Peça sem esse bloco não está
pronta. O bloco é sempre o mesmo, copiado inteiro:

```css
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

## Superfície de conversão

Cobre proposta, landing e qualquer página onde a atenção vira contato. O carrossel gera atenção e
para aqui: sem esta seção especificada, o funil termina num vazio.

**Base clara, e isso é deliberado.** Proposta e landing usam os tokens claros (`--LB` de fundo,
`--LS` de card, `--LT` de texto, `--LT2` de secundário, `--LL` de borda), com `--accent-strong` como
acento. O Instagram continua escuro, sem exceção. Três motivos: o comprador abre no celular no meio
do expediente, muitas vezes sob luz de dia; a proposta é impressa ou vira PDF, e fundo `#05060A` em
papel lê como amador; e a compra é de previsibilidade, onde o claro carrega menos teatro. O dark
premium é o figurino padrão da categoria de hype de IA contra a qual a marca se posiciona, e é
justamente na hora de fechar que vale não parecer com ela.

*Para reverter esta decisão, troque os cinco tokens claros pelos escuros equivalentes e o acento por
`--accent-link`. O resto da seção continua valendo igual.*

**Ordem de seção da landing.** Hero com a tese, demonstração do mecanismo, oferta, caminho para o
contato. É o padrão Trust & Authority com uma substituição obrigatória: **onde o padrão pede prova
de terceiro (logo de cliente, selo, depoimento, case), entra demonstração do mecanismo**, ou seja,
mostrar o processo funcionando. A marca não tem prova social e está proibida de fabricar. Essa é a
regra que mais vai ser tentada de contornar sob pressão de encher a página, e ela não se contorna.

**Formulário e contato.**
- Label sempre visível acima do campo. Placeholder sozinho fazendo papel de label está proibido
- Erro abaixo do campo que o causou, com `aria-describedby`. Nunca só um erro geral no topo
- Depois do envio, estado de carregando e depois sucesso ou falha. Nunca silêncio
- Menos campo é mais. Nome e WhatsApp bastam para abrir conversa
- Alvo de toque mínimo de 44px de altura, com 8px de folga entre alvos vizinhos

**Foco visível.** `:focus-visible` com anel de 2px em `--accent-strong` e 2px de deslocamento.
Remover anel de foco está proibido, sem exceção.

**Impressão.** Toda proposta leva `@media print`: fundo branco, texto `--LT`, borda `--LL`, link com
o destino escrito por extenso, e nenhuma sombra. A proposta existe para ser impressa e mostrada ao
sócio.

**Compartilhamento.** Toda página tem `<html lang="pt-BR">`, favicon e imagem de Open Graph em
1200x630. A OG usa fundo escuro da marca, porque ali ela aparece dentro do feed de outra pessoa e
volta a valer a lógica do Instagram. Toda imagem com conteúdo leva `alt` descritivo; imagem
decorativa leva `alt=""`.

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
