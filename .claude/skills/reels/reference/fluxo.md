# fluxo.md: a ordem do trabalho (v2)

`<skill>` = caminho absoluto de `.claude/skills/reels`. Rodar tudo da raiz do projeto.

## 0. Pasta da peça

`conteudo/reels/<slug>/`: `plano.json`, `words.json`, `prova/`, `broll/`, `_prancha/`, `<slug>.mp4`,
`<slug>.qa.json`, `<slug>.resolvido.json`, `legenda.md`. Áudio original em `dados/audio/`.

## 1. Entrada

- **Áudio** (principal): arquivo em `dados/audio/`. Se estiver vazio e o Alvaro citou áudio, pedir o
  caminho.
- **Tema ou frase** (modo texto): você escreve as frases (ver `estetica.md` §7); se ele deu as frases,
  respeitar, corrigindo só vício de IA e dizendo o que mudou.
- Assunto de notícia: WebSearch pra checar fato e data antes de pôr na tela.

## 2. Transcrever (modo áudio)

```bash
node "<skill>/scripts/transcribe.mjs" --audio "dados/audio/<arq>" --out "conteudo/reels/<slug>/words.json"
node "<skill>/scripts/plano.mjs" --rascunho --words "conteudo/reels/<slug>/words.json"
```

O rascunho numera cada palavra (`palavra[índice]`) e marca as pausas. Mostrar o texto corrido ao Alvaro
e pedir que aponte palavra mal ouvida (nome próprio e termo em inglês erram mais: "Cloud" por "Claude").
Cada correção vira uma linha em `correcoes` (`{"de": 76, "ate": 77, "texto": "aluguel"}`).

## 2b. Respiros (opcional, voz corrida)

Se a fala está corrida demais pra caber uma cena por ideia, alongar as pausas antes de dirigir:
```bash
node "<skill>/scripts/respiros.mjs" --audio "dados/audio/<arq>" --words "conteudo/reels/<slug>/words.json" \
     --out-audio "conteudo/reels/<slug>/voz-respiros.wav" --out-words "conteudo/reels/<slug>/words-respiros.json"
```
Só corta em silêncio real; os índices das palavras não mudam. O plano passa a apontar `audio`/`words` pros
arquivos novos. Dizer ao Alvaro que as emendas precisam ser ouvidas (o agente mede, não escuta).

## 3. Dirigir (ler `registros.md` antes)

Primeiro o **mapa** (objetivo, transformação de percepção, arco; ver `registros.md`). Depois a fala ideia
por ideia: **o que a pessoa precisa ver** (o verbo da fala decide a ação) → registro → visual → âncora →
conteúdo específico → `encena` → `funcao` (etapa do arco) → **ligação** com a anterior. Storyboard:

| Fala (âncora) | Função | O que precisa ver | Registro / visual | Encena | Ligação |
|---|---|---|---|---|---|
| "34." | gancho | o total contado | pontos: glifo "34" | o total contado vira o número | morph das bolhas |

Se o `encena` só sai forçado, troque o visual.

- **Âncora** = a primeira palavra (ou frase curta) da ideia. A cena corta no silêncio antes dela. Busca
  em ordem, sem acento e sem caixa; `"texto#2"` pega a 2ª ocorrência depois da cena anterior.
- **Evento** (dados): a palavra em que o número pousa.
- **Prova:** achou a fonte? Capture a página real e marque o trecho que a fala cita:
  ```bash
  node "<skill>/scripts/captura.mjs" --url <url> --out conteudo/reels/<slug>/prova/<nome>.png \
       --bloco "frase do parágrafo" --marcar "trecho 1" --marcar "trecho 2" [--altura 400] [--ocultar ".banner"]
  ```
  Copie as coordenadas do `.json` gerado pra `marcas` da cena, cada uma com `em` (a palavra em que risca).
  Página responsiva pode trocar de layout na largura estreita: se aparecer botão ou menu no recorte,
  `--ocultar` com a classe dele (achar no HTML).
- **Logo:** `node "<skill>/scripts/logo.mjs" <slug-simpleicons> --out conteudo/reels/<slug>/prova/<marca>.svg`
- **Animação (Lottie):** `reference/animacoes.md`. Buscar, baixar (já recolore e gera prévia), olhar a
  prévia, usar o `trecho`/`loop` que ela sugerir e prender o `pico` à palavra.
- **B-roll:** `reference/broll.md`.
- **Pontos:** `reference/pontos.md`. Imagem → `scripts/pontos.mjs` (olhar a prévia); logo → `logo.mjs` e
  `"forma": "logo"`. Chaves do mundo com `ancora` e `encena`, como as cenas.
- 1,2 a 5s por cena; lista falada vira rajada com `flash`; última cena com `push`.

## 4. Validar

```bash
node "<skill>/scripts/plano.mjs" --props conteudo/reels/<slug>/plano.json --legendas
```

Imprime a linha do tempo (início, duração, registro, âncora, evento), os blocos de legenda e o laudo.
Erro barra. Aviso se lê e se decide (ex.: cena de 5,5s num gancho de tela digitando pode ficar).

## 5. Aprovar o roteiro (AskUserQuestion)

```
Objetivo: entender que ferramenta instalada cobra em toda mensagem, usada ou não.
Transformação: de "parada não custa" pra "parada cobra aluguel". Arco: gancho 34/11 → paper → nome → auditoria → pergunta.
Roteiro (~80s, 27 cenas):
 1. 0,0s  "Essa semana"  [gancho] pontos: 34 bolhas → glifo 34  → cada bolha é uma ferramenta instalada
 2. 6,7s  "11"           tipográfica: "11 NEM ERAM MINHAS"
 3. 17,5s "Um paper"     prova: paper real, marca o título  → o estudo que mediu o custo, na fonte
 ...
```
Cada linha leva o `encena`: é nele que o Alvaro confere se o visual se encaixa na fala.
Opções: aprovar e gerar prancha / ajustar cenas / ajustar texto.

## 6. Prancha

```bash
node "<skill>/scripts/render.mjs" --props conteudo/reels/<slug>/plano.json --prancha conteudo/reels/<slug>/_prancha
```

Folhas com início, meio e fim de cada cena (rotuladas "12 meio"). ~1,5 min pra 27 cenas (2 abas em paralelo). Ler cada folha
respondendo por escrito: há um dominante? o visual encena a frase? algo vaza da tela ou fica pequeno
demais pra ler no celular? texto de cena repete a fala? Corrigir e, se mudou muito, gerar de novo.

## 7. Render

```bash
node "<skill>/scripts/render.mjs" --props conteudo/reels/<slug>/plano.json --out conteudo/reels/<slug>/<slug>.mp4
```

Render incremental: só as cenas que mudaram desde o último render são refeitas (o resto sai do cache).
Vídeo novo de 80s leva alguns minutos; corrigir uma cena leva ~1 min. Narrar a espera. No fim, sozinho:
volume normalizado pra -14 LUFS, `<slug>.resolvido.json` (o plano com os quadros calculados) e QA.
Saída 3 = plano reprovado, 4 = QA reprovou (vídeo existe, não entregar sem resolver), 1 = falha do
Remotion (→ `fallback-ffmpeg.md`).

## 8. Olhar e entregar

```bash
ffmpeg -v error -y -i <slug>.mp4 -vf "fps=1/3,scale=270:-1,tile=6x5" -frames:v 1 _contato.jpg
```

Olhar a folha. Entregar: caminho, duração, resultado do QA em uma linha, o que mudou em relação ao
pedido. Depois `legenda.md` (regras de voz da marca, fonte citada quando houver prova, crédito de cada B-roll pelo `credito_legenda` do `.credito.json`) e oferta de
agendamento. Re-render de uma frase é barato: oferecer.
