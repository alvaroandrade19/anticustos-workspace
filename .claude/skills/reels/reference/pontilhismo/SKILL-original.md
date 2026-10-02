---
name: brabo-minimalista-pontilhismo
description: Criar vídeos verticais minimalistas narrados (1080×1920, preto e branco) em que milhares de pontos desenham, morfam e conduzem o olhar — retratos em pontilhismo, objetos 3D, obras históricas com moldura de partículas e legenda palavra por palavra. Use para conteúdos curtos sobre uma pessoa/ideia (ex.: Sócrates, Tesla, Carl Sagan) a partir de um roteiro narrado, em Remotion. Não usar para edição de vídeo com apresentador (use brabo-edicao-video-dinamica).
metadata:
  version: "1.0"
  autor: "Fernando Araújo (BRABO)"
---

# BRABO — Vídeo minimalista em pontilhismo

Um roteiro narrado vira uma viagem visual: **um único conjunto de pontos atravessa o vídeo inteiro** e se transforma na ideia de cada frase. Nada corta do nada; tudo morfa. A pessoa assiste e é conduzida.

Referências: [exemplos/](exemplos/) — 4 vídeos completos com código. Comece pelo [Tesla](exemplos/01-tesla-mundo-3d/) (o mais completo).

---

## 0. O que você precisa antes de começar

| Requisito | Para quê |
|---|---|
| Node 18+ e **ffmpeg** no PATH | Remotion, áudio, amostragem de imagens |
| Um roteiro | cada frase vira um momento visual |
| **Narração** — escolha UM caminho: | |
| **A)** MCP da **ElevenLabs** conectado ao seu agente | narração automática com a voz escolhida/clonada |
| **B)** Você grava e entrega o áudio (`.mp3`/`.wav`) | o agente transcreve e sincroniza tudo com a sua fala |

**Sem narração não há vídeo**: todo o timing (morphs, câmera, legenda) nasce do tempo de cada palavra falada. Se não houver MCP de voz nem arquivo de áudio, **peça um dos dois antes de continuar**. Detalhes em [references/narracao.md](references/narracao.md).

---

## 1. Fluxo de trabalho

1. **Narração** → caminho A (gere com a ElevenLabs, 1 take, modelo multilíngue) ou B (receba o arquivo). Salve como `public/narracao-raw.mp3`.
2. **Palavras** → `node scripts/transcrever-palavras.mjs public/narracao-raw.mp3 src/data/words.json pt`. Confira o texto contra o roteiro.
3. **Respiros** (opcional, recomendado para voz sintética rápida) → `node scripts/inserir-respiros.mjs public/narracao-raw.mp3 src/data/words.json public/narracao.mp3`. Só corta em silêncio real. Ouça as emendas.
4. **Pesquisa de imagens** → retratos/obras em **domínio público** (Wikimedia Commons). Uma foto do protagonista vira pontilhismo **(regra da estética)**. Ver [references/imagens.md](references/imagens.md).
5. **Pontos** → `node scripts/imagem-para-pontos.mjs <foto> src/data/retrato.json --corte ... --limiar ...`. Fundo claro/texturizado: remova o fundo antes.
6. **Storyboard socrático** → para cada frase, pergunte *"o que a pessoa precisa VER para entender isso?"*. Monte a tabela fala → ilustração → câmera. Ver [references/ilustrar.md](references/ilustrar.md). **Mostre a tabela ao usuário antes de codar.**
7. **Código** → copie [template/](template/), crie uma forma por ideia em `World.tsx`, sequencie em `CHAVES`, mova a `CAMERAS`. Ver [references/motor.md](references/motor.md).
8. **Revisão** → `node scripts/contact-sheet.mjs Video <um segundo por cena>`; olhe a folha. Corrija o que não se lê. Ver [references/revisao.md](references/revisao.md).
9. **Render** → [references/render.md](references/render.md). Entregue só a narração (sem efeitos sonoros), salvo pedido contrário.

---

## 2. Regras da estética (não negociáveis)

- **Preto e branco.** Fundo `#050505`, pontos/texto `#EDEBE6`. Fotos sempre em `grayscale`.
- **Um sistema de partículas contínuo.** As mesmas ~5–6 mil partículas viram retrato → objeto → metáfora → ... Transições são morphs, não cortes.
- **O protagonista em pontilhismo** logo no início, formado em **menos de 1 s** (morph ~0,6 s).
- **Cada frase tem uma ilustração que explica o verbo** — nunca a mesma forma genérica repetida para ideias diferentes.
- **Câmera viva.** Mundo 3D projetado: aproximação, órbita, vista de cima, mergulho. Nunca 100% parada (respiração sutil).
- **Obras/fotos têm momento próprio**: abrem do centro, pontos correm em volta como moldura, crédito embaixo, fecham e os pontos seguem. Nada de imagem em corte seco interrompendo uma ilustração.
- **Legenda padrão**: Inter, mesma espessura; a palavra falada em **bold**; palavra por palavra; ~380 px acima da base. Ver [references/legenda.md](references/legenda.md).
- **Nada nas bordas** (Reels/Shorts cobrem as extremidades). Conteúdo principal entre y≈250 e y≈1450.
- **Final em loop**: a câmera mergulha (ex.: na pupila, num ponto) e o vídeo termina no preto — o início nasce do escuro, fechando o ciclo.
- **Sem efeitos sonoros** por padrão. Só a narração.

## 3. Arquitetura de um vídeo

```
src/
  kit.ts        tokens (cores, easings, ci/lerp/win)
  World.tsx     mundo 3D de pontos: FORMAS · CHAVES (sequência) · CAMERAS · projeção
  Obra.tsx      imagem histórica com moldura de partículas + crédito
  Legenda.tsx   legenda padrão palavra por palavra
  index.tsx     composição e camadas
  data/         words.json (tempos) · retrato.json (pontos) · outros pontos
public/         narracao.mp3 · img/
scripts/        transcrever-palavras · inserir-respiros · imagem-para-pontos · contact-sheet
```

Camadas (baixo → cima): fundo → mundo de pontos → obras → rótulos/UI → legenda → fade final.

## 4. Erros que já cometemos (evite)

| Erro | Correção |
|---|---|
| Mesma forma (ex.: rede de neurônios) ilustrando 5 frases diferentes | uma forma por ideia; protagonista recorrente só quando é a mesma coisa |
| Objeto 3D tão largo que sai da tela no vertical | projete, confira a folha de contato, reduza escala/afaste a câmera |
| Morph longo em frase curta → só se vê "nuvem" | dur 0,3–0,5 s para frases < 1,5 s |
| Corte de respiro no meio de palavra ("voz picotada") | só cortar em silêncio real; ouvir as emendas |
| Retrato com o fundo junto (bloco retangular de pontos) | remover o fundo antes; `--corte` só na cabeça |
| Textos soltos que não acrescentam | se o desenho explica, não rotule |
| Imagem em corte seco no meio da ilustração | momento próprio + moldura de pontos + crédito |
| Render falha em pasta com acento (Windows) | junção sem acento ou `--browser-executable` (ver render.md) |
