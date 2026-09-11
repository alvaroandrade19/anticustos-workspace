---
name: carrossel
description: >
  Cria carrosséis de Instagram para a Anti Custos usando o método editorial da BrandsDecoded
  (triagem, 10 headlines, espinha dorsal, validação editorial, aprovação de texto, render)
  aplicado na identidade visual da marca. Gera HTML em 1080x1350, renderiza em PNG via
  Playwright e entrega a legenda pronta. Use quando o usuário disser "carrossel", "post pro
  Instagram", "transforma isso em carrossel", "cria conteúdo", ou trouxer um tema, link,
  transcrição ou insight para virar post.
---

# /carrossel

Sistema de carrossel com opinião editorial. Não é um gerador de slides: é um pipeline que
recusa headline fraca, recusa número sem base e recusa texto que parece gerado por IA.

## Precedência (resolver aqui qualquer conflito)

1. **`_contexto/preferencias.md`** manda em tom e escrita. A regra do travessão é absoluta.
2. **`PRODUCT.md`** manda no que pode ser afirmado. Não existe prova, e fabricar prova é proibido.
3. **`marca/design-guide.md`** manda em cor, tipografia e espaçamento.
4. **`references/*.md` desta skill** manda no método editorial e na estrutura dos slides.

Onde o método da BrandsDecoded conflita com 1, 2 ou 3, os arquivos do projeto vencem.
As divergências já resolvidas estão anotadas em cada referência, com o motivo.

## Antes de qualquer coisa

Ler, nesta ordem: `PRODUCT.md`, `_contexto/preferencias.md`, `marca/design-guide.md`.
Não anunciar a leitura.

Checar o handle: se `marca/design-guide.md` ainda tem o campo **Handle** vazio, perguntar uma vez
("Qual o @ do Instagram? Vai na barra de marca de todo slide") e salvar lá. Não perguntar de novo.

## Comportamento

- Bastidor invisível. Nunca narrar etapa, pipeline, eixo, funil ou validação. O usuário vê só o resultado da etapa atual.
- Resposta começa no formato da etapa. Sem preâmbulo, sem "vou fazer".
- Nunca inventar dado, fonte, estatística, case ou depoimento.
- Se o usuário tentar pular etapa, não avançar: repetir só a instrução mínima da etapa atual.

## Ponto de entrada

Se o usuário não disse de onde parte, perguntar uma linha:

> "Tem um conteúdo pra transformar (link, texto, transcrição) ou é uma ideia sua pra desenvolver?"

Depois, perguntar o formato, sempre, numa linha:

> "Formato Anti Custos ou estilo tweet?"

- **Anti Custos** é o padrão: nove slides, headline em gradiente, rodapé com progresso. Serve para
  diagnóstico, tese desenvolvida e qualquer peça com conta.
- **Tweet** é para publicação pontual: três a cinco slides, avatar e handle no topo, texto limpo.
  Carregar `references/formato-tweet.md` e usar `template-tweet.html`. Peça de mais de cinco slides
  não usa este formato, porque ele não tem barra de progresso.

A escolha é do Alvaro. Não decidir sozinho, e não sugerir tweet só porque o tema é curto.

Com o insumo e o formato definidos, ir para a Etapa 1. Não fazer briefing longo: o público, o tom, a
marca e o visual já estão nos arquivos do projeto. Perguntar só o que falta de verdade.

---

## Etapa 1: Triagem (interna, não mostrar)

Extrair do insumo:

| Campo | O que extrair |
|---|---|
| Transformação | O que mudou, com a consequência |
| Fricção central | A tensão real do fenômeno |
| Ângulo dominante | A leitura mais forte para o carrossel |
| Evidências | O que é observável de verdade (A, B, C) |

Classificar internamente **etapa do funil**: Topo (alcançar quem não conhece), Meio (aquecer quem
segue), Fundo (converter). O padrão da Anti Custos hoje é Topo, conforme `_contexto/estrategia.md`.

Se o insumo tiver afirmação factual que você não consegue sustentar, pesquisar com WebSearch antes
de escrever. Fonte brasileira e recente é preferível: IBGE, Sebrae, FGV, CAGED, Datafolha, Abrasel,
associações setoriais. Nunca escrever um número que não passou por essa checagem.

## Etapa 2: Dez headlines

Carregar `references/headlines.md` e seguir. Entregar exatamente 10, no formato de tabela que a
referência define, mais as duas linhas de triagem. Nunca mostrar headline reprovada, nunca entregar
menos de 10, nunca explicar o processo.

**Checkpoint 1.** Esperar o usuário escolher, pedir ajuste numa específica ou mandar refazer.

## Etapa 3: Espinha dorsal

Montar e mostrar:

| Campo | Conteúdo |
|---|---|
| Headline escolhida | como vai aparecer na capa |
| Hook | contextualiza a tensão da headline |
| Mecanismo | por que o fenômeno acontece |
| Prova | A), B), C) com base observável, cada uma marcada como `[público]` ou `[conta aberta]` |
| Aplicação | a consequência para o dono de PME |
| Direção | o próximo passo lógico, sem CTA comercial |

Fechar com: "Estrutura aprovada? Se sim, escrevo o texto de cada slide."

**Checkpoint 2.**

## Etapa 4: Escrever e validar (interna)

Escrever o texto de todos os slides seguindo o arco escolhido (`references/design-system.md`).

Depois passar **todo bloco de copy** pelo `references/filtro-editorial.md`. Nota mínima 8 em cada um
dos 7 parâmetros. Um parâmetro abaixo de 8 reprova o bloco e exige reescrita antes de mostrar.

Rodar também a **regra das duas fontes de número** (`references/filtro-editorial.md`): todo número
no carrossel é dado público com fonte e ano, ou conta aberta com a base à mostra. Não existe terceira
categoria. Número que não se encaixa em nenhuma das duas é cortado, não suavizado.

## Etapa 5: Aprovação do texto

Mostrar o texto final slide a slide, no formato:

```
Headline da capa: [uppercase, como vai aparecer]

Slide 2 (Dark, Hook)
Tag: [TAG]
Texto: [...]

Slide 3 (Light, Mecanismo)
Tag: [TAG]
Texto: [...]
```

Mais a legenda do Instagram. Fechar com: "Ajusta o que quiser. Quando estiver ok, fala 'aprovado'."

**Checkpoint 3. Nunca renderizar sem aprovação explícita do texto.**

## Etapa 6: Imagens

Criar `conteudo/carrosseis/[tema]/imagens/` antes de perguntar, mesmo sem saber ainda se vai ter
imagem. O usuário não consegue jogar arquivo numa pasta que não existe.

Analisar quais slides ganham com imagem e sugerir (regra em `references/design-system.md`: só slide
com menos de 60% de preenchimento textual). Perguntar numa mensagem:

> "Esses slides ficariam mais fortes com imagem: [lista com o tipo de imagem sugerido].
> Joga as fotos em `conteudo/carrosseis/[tema]/imagens/` e me diz os nomes, ou fala 'sem imagem'."

Toda imagem enviada tem que ser usada. Imagem 1 vai sempre na capa.

**Como decidir entre foto de fundo e caixa, nesta ordem:** se o usuário disse o que quer, obedecer
sem reclassificar; se não disse, foto e retrato vão de fundo e print de tela vai em caixa; na dúvida,
perguntar antes de gerar. Print sempre em `contain`, foto sempre em `cover`, e nunca esticar imagem
pequena para preencher espaço.

Sem imagem é um caminho legítimo e frequente: a capa tipográfica em fundo escuro funciona e é mais
coerente com a marca do que foto de banco de imagem. Nunca usar stock de robô, cérebro digital ou
mão tocando holograma (proibido no design guide).

## Etapa 7: HTML

Copiar `template.html` (ou `template-tweet.html`, se o formato escolhido foi tweet) para
`conteudo/carrosseis/[tema]/carrossel.html` e preencher.
Seguir `references/design-system.md` para escolher o layout de cada slide.

Escolher o layout de cada slide entre os seis do design system. Onde o usuário mandou imagem,
trocar a classe `.ph` por `background-image:url('imagens/NOME.jpg')` no `.foto` ou no `.caixa`.
Nada mais muda para a imagem entrar.

Verificar antes de renderizar, slide a slide:
- Toda foto com texto por cima tem scrim de duas camadas, piso de 70% na faixa do texto
- Uma família de gradiente só, e gradiente apenas na headline
- No máximo dois trechos em peso 700 por slide
- Nenhum texto por cima da caixa de imagem
- Headline em caixa de frase, no máximo 5 linhas
- Nenhum slide com mais de um terço de vazio
- Nunca três slides seguidos do mesmo layout

## Etapa 8: Render

```bash
node scripts/render-carrossel.js conteudo/carrosseis/[tema]/carrossel.html
```

O script fatia cada `.slide` em PNG 1080x1350 a 2x, esperando `document.fonts.ready`.
Se o Playwright não estiver instalado: `npm install playwright && npx playwright install chromium`.

Renderizar tudo, e mostrar a capa e o slide da conta antes de dizer que terminou.

Rodar o detector mecânico no HTML e agir sobre o que ele achar:

```bash
sh .claude/skills/impeccable/scripts/impeccable detect --json conteudo/carrosseis/[tema]/carrossel.html
```

Três avisos são falso positivo neste formato e devem ser ignorados, porque o detector assume
viewport de navegador e aqui o canvas é fixo em 1080x1350:

- `oversized-h1`: headline grande é o ponto da peça
- `cramped-padding`: a área segura existe, mas vive em `position:absolute` com insets, que o detector
  não enxerga
- `buried-raster`: é o grão em 4,5% de opacidade, e ele é intencional
- `gradient-text`: o gradiente na headline é a assinatura da marca, decisão registrada no design guide

Qualquer outro achado é para corrigir de verdade.

## Etapa 9: Entrega

```
conteudo/carrosseis/[tema]/
  carrossel.html
  legenda.md
  imagens/          (se houver)
  01.png ... 09.png
```

Perguntar ao final se o tema deve entrar no histórico de `conteudo/ideias.md`.

---

## Referências

- `references/headlines.md`: engine de headlines, padrões, banco e checklist de rejeição
- `references/filtro-editorial.md`: anti-AI-slop, 7 parâmetros, regra das duas fontes de número
- `references/design-system.md`: arcos narrativos, anatomia dos slides, spec visual completa
- `references/exemplos.md`: carrosséis de referência já adaptados ao contexto da Anti Custos
- `references/formato-tweet.md`: formato alternativo para publicação pontual, de 3 a 5 slides
