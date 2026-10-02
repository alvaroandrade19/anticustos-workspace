# engine-remotion.md: o motor e o esquema do plano (v2)

O motor é Remotion 4.0.474 (React → Chrome headless → MP4). Você não escreve React: escreve o
`plano.json`. `scripts/plano.mjs` resolve (âncoras → quadros, legenda, sons) e `scripts/render.mjs`
entrega ao componente `assets/remotion/src/Reel.tsx`.

## plano.json

```json
{
  "theme": "anticustos",
  "audio": "dados/audio/<arq>.mp3",
  "words": "words.json",
  "correcoes": [{"de": 76, "ate": 77, "texto": "aluguel"}],
  "enfase": ["prateleira"],
  "trilha": null,
  "sfx": true,
  "sfxDir": null,
  "legenda": true,
  "scenes": [
    {"visual": "device", "code": ["$ listar ferramentas", "instaladas ...... 34"]},
    {"visual": "counter", "ancora": "34.", "evento": "34.", "to": 34, "sub": "ferramentas instaladas", "legenda": false},
    {"visual": "tipografica", "ancora": "11.", "text": "11\nNEM ERAM\n*MINHAS*"},
    {"visual": "prova", "ancora": "Um paper", "transicao": "flash", "imagem": "prova/paper.png", "fonte": "Yin et al., arXiv 2608.12610",
     "marcas": [{"x": 0.14, "y": 0.10, "w": 0.35, "h": 0.08, "em": "paper"}]},
    {"visual": "faixa", "ancora": "De 50", "evento": "280", "de": 50, "ate": 280, "unidade": "tokens por ferramenta"},
    {"visual": "video", "ancora": "atende", "arquivo": "broll/atendente.mp4", "inicio": 1.2},
    {"visual": "tipografica", "ancora": "Quantas", "text": "QUANTAS\nSOBREVIVEM?", "transicao": "push"}
  ]
}
```

Caminhos: relativos à raiz do projeto OU à pasta do plano (tenta os dois).

### Campos do plano

| Campo | O quê |
|---|---|
| `theme` | nome (`anticustos`, `anticustos-claro`, `mono-dark`, `claude`, `editorial`...) ou `{bg, ink, ink2, accent, mode}` |
| `audio` + `words` | liga o modo áudio (legenda + âncoras). Sem `words` = modo texto (`hold`) |
| `correcoes` | troca palavras do transcript por índice (`de`..`ate` → `texto`; `""` remove). Só erro de escuta |
| `enfase` | até 2 palavras que aparecem sozinhas, em acento e maiores, na legenda |
| `trilha`, `trilhaVol` | música de fundo (obrigatória se não houver voz e o reel for agendado) |
| `sfx`, `sfxDir` | efeitos automáticos (padrão ligado) e biblioteca própria |
| `legenda` | `false` desliga a legenda no reel inteiro |
| `mundo` | o mundo de pontos contínuo: `chaves`, `cameras`, `final`, `n`, `brilho` (ver `pontos.md`) |
| `legado` | `true` só em plano anterior a 01/10/2026: falta de `encena` vira aviso em vez de erro |

### Campos de cena comuns

| Campo | O quê |
|---|---|
| `visual` | ver tabela abaixo |
| `ancora` | palavra/frase da fala em que a cena corta (a 1ª cena não precisa) |
| `encena` | **obrigatório com áudio** (menos tipográfica): o que o visual mostra da frase dita ali |
| `funcao` | etapa do arco: `gancho`, `contexto`, `desenvolvimento`, `evolucao`, `resolucao`, `sintese` (aparece no laudo) |
| `evento` | palavra em que o dado pousa (counter, faixa, barras) |
| `transicao` | `fundir` (padrão), `corte`, `flash`, `push` = como ESTA cena entra. No plano, `"transicao"` no topo troca o padrão do reel |
| `legenda` | `false` cala a legenda só nesta cena (ex.: contador que já mostra o número falado) |
| `sfx` | `false` tira o som automático desta cena |
| `hold` | só no modo texto: duração em quadros (30 qps) |
| `text`, `sub`, `big`, `place` | modo texto: a frase da cena. No modo áudio, `text` só vale na `tipografica` |

### Visuais novos da v2

| visual | campos |
|---|---|
| `tipografica` | `text` (`\n` quebra, `*palavra*` = acento), `sub` |
| `faixa` | `de`, `ate`, `unidade`, `prefix`, `suffix`, `evento` |
| `barras` | `valores: [{rotulo, valor}]` (2+), `destaque` (índice), `unidade`, `fonte`, `suffix`, `evento` |
| `prova` | `imagem`, `marcas: [{x,y,w,h,em}]` (frações, de `captura.mjs`), `lente: {x,y,r,em}`, `zoom` (padrão 2), `fonte` |
| `logo` | `arquivo` (svg/png, de `logo.mjs`), `sub` |
| `video` | `arquivo` (de `broll.mjs`), `inicio` (s), `vel` |
| `animacao` | `arquivo` (.json de `lottie.mjs`), `loop`, `trecho: [ini, fim]`, `pico` + `evento`, `vel`, `escala` (ver `animacoes.md`) |
| `counter` | agora com `evento`, `de` (ponto de partida) e `sub` |
| `mundo` | nenhum na cena: mostra o mundo de pontos do bloco `mundo` do plano (ver `pontos.md`) |

Os visuais da v1 continuam (`orb`, `hero3d`, `code`, `device`, `chart`, `icon`, `svg`, `object`, heróis
de movimento, `grid`, `crowd`...), com catálogo em `biblioteca-movimento.md` e `biblioteca-icones.md`.
Nome de `object` é validado contra `assets/remotion/src/objetos.ts`.

## Como o motor compõe (não brigar com isso)

- Cenas em `<Sequence>` com `from`/`dur` absolutos; nunca se sobrepõem. Transição vive dentro das
  cenas (fim de uma, começo da outra).
- O visual roda 8 quadros antes do corte (herói em voo). Evento e marcas chegam em quadros locais.
- Modo áudio: herói compacto sobe pra 0,37H e cresce ~28%; a faixa da legenda (0,70H) fica livre.
  Registros novos se compõem sozinhos. Legenda com fundo escuro suave atrás (cena cheia não engole a letra).
- Câmera lenta 0 a 4% (`KenBurns`); prova, vídeo, logo e tipográfica têm câmera própria.
- Animação Lottie: o motor calcula o quadro pela velocidade real do arquivo e enquadra pelo desenho medido (`_reels.bbox` gravado pelo `lottie.mjs`).
- Grão, vinheta e poeira por cima de tudo (`Ambient`).

## Render (render.mjs)

1. Resolve e valida o plano antes de tocar no motor (erro de plano não gasta instalação).
2. Copia pro motor, sem espaço no caminho (`%LOCALAPPDATA%\reel-engine`): fonte, voz, trilha, sons,
   imagens, vídeos (`public/a/NNN.ext`).
3. Instala só se o `package.json` mudou. Usa o Edge/Chrome do sistema (evita baixar 300MB).
4. `--prancha`: `prancha-runner.mjs` (um bundle, um navegador, `renderStill` por foto, folhas 6x6).
5. **Render incremental** (`render-runner.mjs`): cada cena vira um trecho em cache (na pasta do motor,
   `cache/`), com chave pelo conteúdo (a cena, as legendas do intervalo, o conteúdo dos arquivos que ela
   usa, a versão do motor). Cenas seguidas que precisam renderizar saem num bloco só, com quadro-chave
   forçado no início de cada uma, e são fatiadas sem recodificar (cada fatia conferida quadro a quadro).
   O áudio também fica em cache pelo conteúdo. `--sem-cache` força tudo de novo. Se o incremental
   falhar, o render inteiro pelo CLI entra de reserva. `crf 17`, concorrência = núcleos menos 1.
6. Volume: loudnorm em duas passadas (-14 LUFS, pico -1,5 dBTP), vídeo copiado sem reencode.
7. QA (`qa.mjs`): quadros = plano, 1080x1920, áudio, LUFS, pico, sem tela preta, sem trecho parado.

## Custo medido (nesta máquina: i3-9100, 4 núcleos, GTX 1050)

| O quê | Custo por quadro | Nota |
|---|---|---|
| cena comum (tipográfica, dado, ícone) | ~0,16s | o grosso é o Chrome desenhar e fotografar 1080x1920 |
| animação Lottie em `canvas` | ~0,28s | em `svg` era ~0,74s (por isso o padrão é canvas) |
| B-roll (`video`) | ~0,5s | com GOP longo era ~0,77s (por isso o `broll.mjs` salva todo quadro como chave) |

- Concorrência 3 contra 4, e GPU (ANGLE): diferença de no máximo 10%, dentro do ruído; a GPU **piorou** a
  cena de vídeo (161s contra 115s). Fica desligada.
- Desfoque (`filter: blur`) em elemento que aparece o vídeo todo custa em todo quadro: não usar sem motivo.
- Uma chamada ao renderizador por cena pagava ~4s fixos cada (27 cenas: 13,5 min no vídeo novo); por isso
  os blocos.

## Fatos verificados (não regredir)

- `@remotion/*` todos na mesma versão; `--props` sempre ARQUIVO (inline quebra no shell do Windows).
- Scaffold de 3 arquivos (`index.ts` + `Root.tsx` + `Reel.tsx`); não existe `registerComposition`.
- Vídeo: `OffthreadVideo` com `trimBefore` (o `startFrom` foi renomeado).
- Node 20+ no Windows: `npm.cmd`/`npx.cmd` com `shell:true`; caminho do Edge entre aspas.
- Espaço no caminho do projeto quebra o Chromium ("Multiple targets are not supported").
- Duração: medir a trilha de VÍDEO. A do contêiner inclui o preenchimento do AAC (~0,1s).

## Licença

Remotion é grátis pra pessoa física e empresa com até 3 funcionários (critério é o tamanho da empresa).
Licença própria, não MIT. Empresa com 4+ funcionários precisa de remotion.pro.
