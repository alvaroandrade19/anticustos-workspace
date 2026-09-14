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

Onde o método da BrandsDecoded conflita com 1, 2 ou 3, os arquivos do projeto vencem. O porquê de
cada divergência está em `references/decisoes.md`, que não se lê durante a produção.

## Antes de qualquer coisa

Ler, nesta ordem: `PRODUCT.md`, `_contexto/preferencias.md`, `marca/design-guide.md`.
Não anunciar a leitura.

Checar o handle: se `marca/design-guide.md` ainda tem o campo **Handle** vazio, perguntar uma vez
("Qual o @ do Instagram? Vai na barra de marca de todo slide") e salvar lá. Não perguntar de novo.

## Comportamento

- Bastidor invisível. Nunca narrar etapa, pipeline, eixo, funil ou validação. O usuário vê só o
  resultado da etapa atual.
- Resposta começa no formato da etapa. Sem preâmbulo, sem "vou fazer".
- Nunca inventar dado, fonte, estatística, case ou depoimento.
- Se o usuário tentar pular etapa, não avançar: repetir só a instrução mínima da etapa atual.
- Carregar cada referência só na etapa que a usa, nunca todas de uma vez.

## Ponto de entrada

Se o usuário não disse de onde parte, perguntar uma linha:

> "Tem um conteúdo pra transformar (link, texto, transcrição) ou é uma ideia sua pra desenvolver?"

Depois, perguntar o formato, sempre, numa linha:

> "Formato Anti Custos, Terra Clara ou estilo tweet?"

| Formato | O que é | Quando |
|---|---|---|
| **Anti Custos** (padrão) | Nove slides escuros, headline em gradiente, rodapé com progresso | Diagnóstico, tese desenvolvida, qualquer peça com conta |
| **Terra Clara** | Folha clara, serifada editorial, sete a oito folhas. Registro de documento, não de poster | Argumento denso, conta aberta, peça que precisa parecer memorando e não anúncio |
| **Tweet** | Três a cinco slides, avatar e handle no topo | Publicação pontual. Acima de cinco slides não serve, porque não tem barra de progresso |

O formato define o que carregar na Etapa 7: `formato-terra-clara.md` ou `formato-tweet.md`. Anti
Custos não carrega nenhum dos dois, porque o `design-system.md` da Etapa 4 já cobre.

A escolha é do Alvaro. Não decidir sozinho, e não sugerir formato só porque o tema é curto ou longo.

Se o formato for Anti Custos, perguntar também a paleta, numa linha:

> "Paleta Azul (padrão) ou Terra?"

Azul é a paleta oficial da marca. Terra é a alternativa em teste, barro e terracota com headline
serifada. Mesma estrutura e mesmo método nas duas, só cor e família mudam. Sem instrução em
contrário, o padrão é Azul. **Não alternar sozinho: só usar Terra ou Terra Clara quando o Alvaro
pedir por nome.**

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

Carregar `references/design-system.md` (vale até o fim da peça, não recarregar na Etapa 7) e
escrever o texto de todos os slides seguindo o arco escolhido.

Depois passar **todo bloco de copy** pelo `references/filtro-editorial.md`. Nota mínima 8 em cada um
dos 7 parâmetros. Um parâmetro abaixo de 8 reprova o bloco e exige reescrita antes de mostrar.

Rodar também a **regra das duas fontes de número** (mesmo arquivo): todo número no carrossel é dado
público com fonte e ano, ou conta aberta com a base à mostra. Não existe terceira categoria. Número
que não se encaixa em nenhuma das duas é cortado, não suavizado.

## Etapa 5: Aprovação do texto

Mostrar o texto final slide a slide, no formato:

```
Headline da capa: [uppercase, como vai aparecer]

Slide 2 (Hook)
Tag: [TAG]
Texto: [...]
```

Mais a legenda do Instagram. Fechar com: "Ajusta o que quiser. Quando estiver ok, fala 'aprovado'."

**Checkpoint 3. Nunca renderizar sem aprovação explícita do texto.**

## Etapa 6: Imagens

Criar `conteudo/carrosseis/[tema]/imagens/` antes de perguntar, mesmo sem saber ainda se vai ter
imagem. O usuário não consegue jogar arquivo numa pasta que não existe.

Analisar quais slides ganham com imagem e sugerir (só slide com menos de 60% de preenchimento
textual). Perguntar numa mensagem:

> "Esses slides ficariam mais fortes com imagem: [lista com o tipo de imagem sugerido].
> Joga as fotos em `conteudo/carrosseis/[tema]/imagens/` e me diz os nomes, ou fala 'sem imagem'."

Toda imagem enviada tem que ser usada. Imagem 1 vai sempre na capa.

**Foto de fundo ou caixa, nesta ordem:** se o usuário disse o que quer, obedecer sem reclassificar;
se não disse, foto e retrato vão de fundo e print de tela vai em caixa; na dúvida, perguntar antes
de gerar. Print sempre em `contain`, foto sempre em `cover`, e nunca esticar imagem pequena.
No Terra Clara os dois modos se chamam placa e anexo, e a regra é a mesma.

Sem imagem é um caminho legítimo e frequente: a capa tipográfica em fundo escuro funciona e é mais
coerente com a marca do que foto de banco de imagem. Nunca usar stock de robô, cérebro digital ou
mão tocando holograma (proibido no design guide).

## Etapa 7: HTML

Copiar template e estilo para a pasta da peça. O CSS fica fora do HTML: a peça é só marcação.

```bash
D=conteudo/carrosseis/[tema]; S=.claude/skills/carrossel
cp $S/template.html $D/carrossel.html && cp $S/estilo.css $D/                      # Anti Custos
cp $S/template-terra-clara.html $D/carrossel.html && cp $S/estilo-terra-clara.css $D/   # Terra Clara
cp $S/template-tweet.html $D/carrossel.html && cp $S/estilo-tweet.css $D/          # tweet
```

Paleta Terra: trocar `data-paleta="azul"` por `data-paleta="terra"` na tag `<html>`. É a única
mudança, e nada mais no arquivo muda por causa da paleta.

**Terra Clara:** carregar `references/formato-terra-clara.md` agora e montar por ele. O template
traz uma folha por layout, para apagar o que não se usa e repetir o que se usa.

**Anti Custos e tweet:** preencher o corpo seguindo `references/design-system.md`, que já está em
contexto desde a Etapa 4: escolher o layout de cada slide entre os oito e não escrever CSS novo
dentro da peça. Onde o usuário mandou imagem, trocar a classe `.ph` por
`style="background-image:url('imagens/NOME.jpg')"` no `.foto` ou no `.caixa`. Nada mais muda para a
imagem entrar.

A barra de marca sai sozinha em todo slide, pelo CSS. Não escrever `<div class="marca">`.

Verificar antes de renderizar, slide a slide, pelo checklist do `design-system.md`.

## Etapa 8: Render

```bash
node scripts/render-carrossel.js conteudo/carrosseis/[tema]/carrossel.html
```

O script fatia cada `.slide` em PNG 1080x1350 a 2x, esperando `document.fonts.ready`.
Se o Playwright não estiver instalado: `npm install playwright && npx playwright install chromium`.

Renderizar tudo, e mostrar a capa e o slide da conta antes de dizer que terminou.

Rodar o detector mecânico e agir sobre o que ele achar:

```bash
sh .claude/skills/impeccable/scripts/impeccable detect --json conteudo/carrosseis/[tema]/carrossel.html
```

Quatro avisos são falso positivo neste formato, porque o detector assume viewport de navegador e
aqui o canvas é fixo em 1080x1350. Ignorar: `oversized-h1` (headline grande é o ponto da peça),
`cramped-padding` (a área segura vive em `position:absolute` com insets, que o detector não enxerga),
`buried-raster` (é o grão em 4,5%, intencional) e `gradient-text` (assinatura da marca, registrada no
design guide). Qualquer outro achado é para corrigir de verdade.

## Etapa 9: Entrega

```
conteudo/carrosseis/[tema]/
  carrossel.html
  estilo*.css        (o do formato escolhido)
  legenda.md
  imagens/           (se houver)
  01.png ...
```

Perguntar ao final se o tema deve entrar no histórico de `conteudo/ideias.md`.

---

## Arquivos da skill

| Arquivo | Quando carregar |
|---|---|
| `references/headlines.md` | Etapa 2. Engine de headlines, padrões, banco, checklist de rejeição |
| `references/filtro-editorial.md` | Etapa 4. Anti-AI-slop, 7 parâmetros, duas fontes de número |
| `references/design-system.md` | Etapa 4, vale até o fim. Arcos, paletas, escala, layouts, checklist |
| `references/formato-terra-clara.md` | Etapa 7, só no formato Terra Clara |
| `references/formato-tweet.md` | Etapa 7, só no formato tweet |
| `references/exemplos.md` | Sob demanda, quando faltar referência de peça pronta |
| `references/decisoes.md` | Nunca durante a produção. Só para mudar ou entender uma decisão antiga |
| `template.html` + `estilo.css` | Etapa 7, formato Anti Custos. Paleta pelo `data-paleta` |
| `template-terra-clara.html` + `estilo-terra-clara.css` | Etapa 7, formato Terra Clara |
| `template-tweet.html` + `estilo-tweet.css` | Etapa 7, formato tweet |

Amostra renderizada do Terra Clara, para consulta visual rápida:
`conteudo/carrosseis/_amostra-terra-clara/`.
