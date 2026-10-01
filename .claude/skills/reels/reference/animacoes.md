# animacoes.md: ilustração animada (Lottie) no reel

Ler antes de usar o visual `animacao`. Lottie é animação vetorial feita por animador no After Effects,
tocada pelo motor via `@remotion/lottie`. É o registro que mais sobe o acabamento: o herói desenhado em
código e o ícone de linha nunca chegam no nível de uma animação feita à mão.

## Quando usar (e quando não)

- **Usar:** substantivo concreto ou ação que a fala cita e que ganha com movimento de verdade (servidor
  guardando, dinheiro caindo na pilha, caixa abrindo, telefone tocando, gráfico subindo com personagem).
  Substitui com vantagem o `icon`/`svg` e os heróis de objeto quando existe uma boa animação do tema.
- **Não usar:** pra número (vai `counter`/`faixa`/`barras`, que pousam no número exato), pra prova (vai
  `prova`: animação não prova nada), nem como enfeite de cena que não tem assunto.
- **Coerência de estilo manda:** Lottie de autores diferentes misturam traço, perspectiva e volume. Num
  reel, escolha UMA família (ex.: isométrico plano, ou traço fino, ou ilustração com personagem) e,
  quando der, o mesmo autor. O validador avisa acima de 6 animações. O modo de cor `marca` ajuda muito
  na coerência (tudo no azul da marca), mas não conserta perspectiva misturada.

## Fluxo

```bash
# 1. buscar: ordena por popularidade (animador > rascunho) e descarta resultado fora do tema
node "<skill>/scripts/lottie.mjs" buscar "database server" --out conteudo/reels/<slug>/animacoes/_busca --n 12
#    → candidatos.jpg (numerada; miniatura no original, fundo branco) + candidatos.json
#    consulta em inglês; palavra de estilo ajuda a achar família: "isometric", "line", "flat", "3d"

# 2. baixar: recolore pra marca, tira o fundo, mede e gera a prévia
node "<skill>/scripts/lottie.mjs" baixar <id> --out conteudo/reels/<slug>/animacoes/<nome>.json [--cores marca|neutro|original] [--manter-fundo]
#    → <nome>.json (processado) + <nome>.credito.json + <nome>.revisao.jpg (8 quadros, com o tempo)

# arquivo que você trouxe (.json ou .lottie):
node "<skill>/scripts/lottie.mjs" preparar <arquivo> --out conteudo/reels/<slug>/animacoes/<nome>.json
```

**Olhar a prévia antes de pôr no plano.** O que aparece nela é o que sai no vídeo. O script avisa:
- **"começa vazia"** (a animação entra do nada) → `"loop": false`, e ela segura o último quadro;
- **"termina vazia"** (some no fim) → `"loop": false` + `"trecho": [ini, fim]` com o fim antes do sumiço
  (o script sugere; refine pela prévia: pare onde o desenho está estável);
- raster embutido, expressão do After Effects, arquivo pesado (> ~900KB, render lento), duração < 1s.

## Cor

| `--cores` | O que faz | Quando |
|---|---|---|
| `marca` (padrão) | neutros com a luz invertida (contorno preto vira claro, branco vira escuro) e todo matiz girado pro azul da marca, com luz e sombra preservadas | animação feita pra fundo branco, que é a maioria |
| `neutro` | só gira o matiz; preto e branco ficam | animação já pensada pra fundo escuro |
| `original` | não mexe | logo animado de marca de terceiros, ou quando a cor original É a informação |

A troca é feita no arquivo na hora do download (o render não recolore nada, fica rápido).

## No plano

```json
{"visual": "animacao", "ancora": "O dinheiro", "arquivo": "animacoes/dinheiro.json",
 "loop": false, "trecho": [0.13, 1.9], "pico": 0.8, "evento": "dinheiro", "escala": 0.78}
```

| Campo | O quê |
|---|---|
| `arquivo` | o `.json` processado pelo `lottie.mjs` (nunca `.lottie` cru: o render recusa) |
| `loop` | `true` (padrão) repete; `false` toca uma vez e segura o último quadro |
| `trecho` | `[ini, fim]` em segundos da prévia: só essa parte toca |
| `pico` + `evento` | o segundo `pico` da animação (o momento-chave visto na prévia: a caixa abrindo, a pilha pousando) cai exatamente na palavra `evento` da fala |
| `vel` | velocidade (0,85 estica, 1,2 acelera). A velocidade real já vem certa: o motor compensa o qps do arquivo |
| `escala` | ajuste fino do tamanho (o padrão já enquadra o desenho em até 64% da largura) |
| `renderer` | `canvas` (padrão, ~2x mais rápido, visual idêntico no teste) ou `svg` se algum efeito da animação não aparecer |

## O que o motor faz sozinho

- **Velocidade real:** o componente oficial avança um quadro da animação por quadro do vídeo; uma
  animação de 60 qps tocaria em câmera lenta a 30 qps. O motor calcula o quadro certo pelo qps do arquivo.
- **Enquadramento pelo desenho:** cada animador deixa uma margem diferente (medimos desenhos ocupando
  de 38% a 65% do quadro). O `lottie.mjs` mede a caixa do desenho na prévia e o motor usa essa caixa
  pra fazer dele o herói da janela, centrado em 0,38 da altura, sem invadir a legenda.
- **Já em voo:** a animação começa 8 quadros antes do corte.

## Licença e crédito

Animações públicas do LottieFiles saem sob a Lottie Simple License: uso comercial liberado, crédito não
obrigatório. O `<nome>.credito.json` guarda autor e página mesmo assim (`credito_legenda` pronto, se
quiser creditar). Logo animado de marca de terceiros continua sendo marca de terceiros: só em uso
nominativo (a fala cita a ferramenta).
