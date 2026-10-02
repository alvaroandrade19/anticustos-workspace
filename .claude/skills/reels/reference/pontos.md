# pontos.md: o mundo de pontos contínuo (registro "pontos")

Motor em `assets/remotion/src/mundo.tsx`. Portado da skill de pontilhismo de Fernando Araújo (MIT,
original em `reference/pontilhismo/`) e reescrito pra este motor em 01/10/2026.

## A ideia

Um conjunto de N pontos atravessa o reel inteiro e morfa de forma em forma: uma ideia nasce dos pontos
da anterior, nada corta do nada. Cenas com `"visual": "mundo"` mostram o mundo; nas outras ele continua
andando fora de vista, e quando volta já está na forma nova. O uso mais forte é o híbrido: o mundo
costurando cenas de prova, dado e tipográfica.

## Como entra no plano

```json
"cenas": [
  {"visual": "mundo", "ancora": "..."},
  {"visual": "prova", "ancora": "...", "imagem": "prova/x.png"},
  {"visual": "mundo", "ancora": "...", "transicao": "flash"}
],
"mundo": {
  "final": "mergulho",
  "chaves": [
    {"forma": "nuvem"},
    {"ancora": "ferramentas", "forma": "grupos", "quantidade": 34, "encena": "cada bolha é uma ferramenta instalada", "camera": "diagonal"},
    {"ancora": "34", "forma": "glifo", "texto": "34", "encena": "o total contado vira o número", "camera": "frente"},
    {"ancora": "Nem", "forma": "grupos", "quantidade": 34, "destaque": [23,24,25,26,27,28,29,30,31,32,33], "encena": "as 11 de terceiros acendem dentro das 34"}
  ],
  "cameras": [{"ancora": "resumo", "pose": "diagonal", "orbita": 0.25}]
}
```

**Tempo:** com áudio, toda chave e toda câmera usa `ancora` (mesma busca das cenas: sem acento e sem
caixa, `"texto#2"` = 2ª ocorrência; cursor próprio pras chaves e outro pras câmeras). O morph começa
2 quadros antes da sílaba. `"pousar": true` (com `dur`) faz a forma TERMINAR de se formar na palavra.
Sem áudio, `t` em segundos. `"camera"` dentro da chave é atalho (pose em string ou objeto). `dur` e
`spread` em segundos; quando omitidos, saem do tempo até a próxima forma (frase curta, morph curto).

**`encena` é obrigatório** (com áudio) em toda chave, menos a nuvem/poeira de abertura: uma frase dizendo
o que a forma mostra da fala naquela palavra. Forma sem ligação clara com o que a voz diz não entra no
reel, e o validador barra. O laudo imprime palavra, forma e encena lado a lado pra aprovação.

**O que o validador cobra:** forma e pose existentes; glifo com texto, imagem/logo com arquivo, grupos
com quantidade; âncora achada; chaves em ordem; morph que cabe na janela (erro se ocupa mais de 85%);
aviso se a forma fica menos de ~1s formada, se uma forma nunca aparece (cai fora das cenas de mundo),
se a cena de mundo abre com morph em curso por mais de 1s, se passa 5s sem beat (forma ou câmera), e
acento do mundo somado à ênfase da legenda (teto 2).

## Formas

| forma | o que é | parâmetros próprios |
|---|---|---|
| `nuvem` | bolha de pontos respirando (estado de espera, abertura) | `raio` 430 |
| `poeira` | tudo vira poeira de fundo (some sem cortar) | |
| `esfera` | esfera 3D girando | `raio` 330 |
| `anel` | anel/órbita | `raio` 380, `espessura` 70 |
| `galaxia` | espiral de braços (escala, "o mercado inteiro") | `raio` 540, `bracos` 3, `torcao` 2.8 |
| `onda` | superfície em grade ondulando (fluxo, dado contínuo) | `largura` 920, `amplitude` 80 |
| `tunel` | anéis avançando pra câmera (tempo, passagem) | `raio` 320, `aneis` 22, `vel` 0.22 |
| `grupos` | Q aglomerados em grade: **contagem** (34 ferramentas → 3) | `quantidade`, `destaque` (índice ou lista em acento) |
| `rede` | nós ligados com pontos correndo nas arestas (conexão, integração) | `nos` 16, `vel` 0.18 |
| `glifo` | número ou palavra formada de pontos, na fonte do reel | `texto` (`\n` quebra), `largura` 760, `contorno` |
| `imagem` | retrato/objeto em pontilhismo, de um JSON de pontos | `arquivo` (JSON do `pontos.mjs`), `largura`, `altura` |
| `logo` | marca citada em pontos (SVG do `logo.mjs`) | `arquivo` (SVG), `largura` 560, `contorno` |

**Comuns a todas:** `escala`, `giro` (rad/s), `rotY`, `inclinacao` (rad), `balanco`, `x` `y` `z`,
`tamanho`, `opacidade`, `densidade` (fração dos N usada; o resto vira poeira), `acento` (`true` = forma
toda no acento; `0.1` = salpico de 10%). **Do morph:** `dur` (0,75s), `spread` (0,28s, atraso máximo por
ponto), `curva` (0,22, o arco da trajetória), `explosao` (0, os pontos abrem no meio do caminho).

## Ferramentas

- **Imagem → pontos:** `node <skill>/scripts/pontos.mjs <foto> --out conteudo/reels/<slug>/pontos/<nome>.json
  [--alvo 5000] [--corte x,y,w,h] [--limiar 0.22] [--inverter] [--suavizar-base 0.2]`. Grade automática pro
  alvo de pontos, saída `{w, h, pontos}`, prévia `<nome>.previa.png` (OLHAR antes de usar). Fundo claro ou
  texturizado: remover o fundo antes. Retrato só de pessoa pública citada, com imagem de licença livre e
  crédito na legenda do post; o Instagram é institucional, o Alvaro não vira retrato ali.
- **Logo → pontos:** `logo.mjs <slug> --out .../prova/<marca>.svg` e a chave `{"forma": "logo", "arquivo": ...}`.
  O render lê os caminhos do SVG e o motor desenha com Path2D.
- **Respiros:** `node <skill>/scripts/respiros.mjs --audio <voz> --words <words.json> --out-audio <x.wav>
  --out-words <words-respiros.json> [--pausa ".=0.45;,=0.2"]`. Pausa só em silêncio real; os índices das
  palavras não mudam (as `correcoes` continuam valendo). Rodar ANTES de dirigir, e ouvir as emendas.

## Câmera

Poses: `frente`, `perto`, `longe`, `cima`, `baixo`, `lado`, `diagonal`, `mergulho`. Campos explícitos
(`yaw`, `pitch`, `dist`, `x`, `y`) sobrescrevem a pose. `orbita` = giro contínuo em rad/s enquanto a chave
vale. `dur` = tempo da transição (0,9s). A câmera nunca para: respiração leve sempre ligada.
`"final": "mergulho"` mergulha no último ~1,1s e apaga no escuro (o replay emenda sem costura).

## Opções do mundo

`n` (6000; 12000 pra retrato denso), `brilho` (0,55, halo aditivo, só tema escuro), `tamanho` (1),
`centroY` (0,40: o centro do mundo fica acima da faixa da legenda).

## Por que é rápido e coerente (não regredir)

- **Canvas em lote:** pontos agrupados em 20 níveis de opacidade x 2 cores, um `fill` por grupo. Medido em
  01/10/2026, 120 quadros, sem cache: cena comum (orbe) 0,29s/quadro; **mundo 6 mil pontos com brilho
  0,175s/quadro**; sem brilho 0,16; 12 mil pontos 0,20. O mundo sai mais barato que uma cena comum.
- **Função pura do quadro absoluto:** nenhum estado entre quadros. É o que deixa o mundo contínuo
  conviver com o render incremental (cache por cena; a chave da cena `mundo` inclui a spec inteira).
- **Correspondência coerente:** cada ponto tem ângulo e raio fixos; toda forma distribui seus pontos
  nessa ordem (48 fatias por ângulo, raio dentro da fatia). O morph flui em vez de cruzar em caos.
- **Sem alocação por quadro:** sementes e buffers por N ficam em cache de módulo.

## Piloto (01/10/2026)

`conteudo/reels/imposto-de-prateleira-v3/`: reel de 80s, 24 cenas, 4 delas em pontos costurando prova,
dado e tipográfica, transição padrão `fundir`. Render completo 361s (0,15s/quadro, mais rápido que a v2 a
0,17s); corrigir uma cena depois: 57s (2 refeitas, 22 do cache). QA aprovado. O plano é a referência viva
de como escrever `mundo`, `encena` e câmeras presas à fala.
