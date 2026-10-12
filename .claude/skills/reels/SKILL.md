---
name: reels
description: >-
  Cria reels verticais 1080x1920 pra Instagram, TikTok e Shorts no motor Remotion da Anti Custos:
  a partir de um áudio narrado (legenda verbatim sincronizada palavra a palavra + cenas presas às
  palavras da fala) ou de UMA frase/tema (tipografia cinética). Direção por registros visuais (dado,
  prova real com marca-texto, tipográfica, animação Lottie recolorida pra marca, tela, processo,
  objeto, B-roll), prancha de aprovação
  antes do render, som e QA medidos. Use quando a pessoa quiser criar um reel, fazer um vídeo
  minimalista, montar vídeo pro TikTok ou Shorts, transformar uma frase ou um áudio num vídeo, ou
  pôr legenda num áudio. Gatilhos: "cria um reel", "faz um vídeo", "vídeo pro tiktok", "vídeo pro
  shorts", "transforma esse áudio em reel", "legenda esse áudio", "reel sobre". NÃO é pra imagem
  parada nem carrossel (isso é a /carrossel).
argument-hint: "[o tema, a frase ou o áudio do vídeo]"
allowed-tools: Read, Write, Edit, Glob, Bash, AskUserQuestion, WebSearch, WebFetch
effort: high
model: inherit
---

# Reels (v2, 29/09/2026)

## Anti Custos: o que vale neste workspace (vence o resto do arquivo)

1. **Travessão é proibido** em tudo: tela, legenda, plano, chat. Vírgula, dois-pontos, parênteses.
2. **Marca:** `marca/design-guide.md`. Tema padrão `anticustos` (fundo `#05060A`, texto `#F2F4F8`,
   acento `#2563EB`); claro é `anticustos-claro`. Anton na tipografia do vídeo é exceção consciente
   (tipografia cinética pede peso condensado), como no carrossel.
3. **Pastas:** produção em `conteudo/reels/<slug>/` (`<slug>.mp4`, `plano.json`, `legenda.md`,
   `words.json`, `prova/`, `broll/`). Áudio de entrada em `dados/audio/`. Agendado e publicado **não
   se move à mão**: quem move é o `agendar.js` da `/publicar-social-ratos`.
4. **Publicação:** depois de aprovado, escrever `legenda.md` e oferecer o agendamento:
   `node .claude/skills/publicar-social-ratos/scripts/agendar.js --video "conteudo/reels/<slug>/<slug>.mp4" --quando "AAAA-MM-DD HH:MM"`
   (`+30min`, `+2h`, `+1d` também valem; na hora, `publish-graph-api.js --video ...`).
5. **A API não põe música.** Reel sem voz precisa de `trilha` no plano, senão vai ao ar mudo
   (`reference/som.md`). Nunca mais orientar "adicione som no editor do Instagram" pra peça agendada.
6. **ffmpeg** 9.0.1 no PATH (o render se cura sozinho se o shell for antigo). Motor do Remotion
   persistente em `%LOCALAPPDATA%\reel-engine` (`node scripts/render.mjs --limpar` libera disco).
7. **B-roll:** chaves grátis `PEXELS_API_KEY` / `PIXABAY_API_KEY` no `.env` (`reference/broll.md`).

## O que mudou na v2 e por quê

A v1 esticava todas as cenas na mesma proporção pra caber no áudio, empilhava a fala inteira em
slides de 9 a 12 palavras e escolhia um ícone por slide. O reel `imposto-de-prateleira` saiu com 20
cenas de ícone seguidas e um contador marcando 32 quando a voz dizia 34. A v2 aplica o método de
motion editorial (estudo da skill motion-vox, adaptado sem gerador pago):

- **Duas camadas:** a legenda (fala verbatim em blocos de 1 a 3 palavras, corte seco na palavra) e a
  cena (dura o tempo da ideia, presa à palavra-âncora).
- **Tempo absoluto:** cada cena e cada evento (número pousando, marca-texto riscando) cai na palavra,
  ±3 quadros. Quem calcula é `scripts/plano.mjs`, não o olho.
- **Registros, não objetos:** tipo de cena alternando, prova real no lugar de símbolo.
- **Transição por sentido**, não em rodízio: `fundir` é o padrão (dissolução curta, desde 01/10/2026);
  corte seco, flash e push só quando o sentido pede.
- **Prancha antes do render, QA medido depois**, volume normalizado, sons discretos.

## Arquivos (ler cada um QUANDO chegar no passo)

- `reference/registros.md`: **o manual do diretor.** Registros, regras cobradas, transições. Ler antes de escrever qualquer plano.
- `reference/estetica.md`: o visual premium e a guarda anti-clichê do texto.
- `reference/fluxo.md`: a ordem do trabalho, passo a passo, com os comandos.
- `reference/engine-remotion.md`: o esquema do `plano.json` (todos os campos) e as armadilhas do Windows.
- `reference/transcricao.md`: áudio → transcript palavra a palavra, correções.
- `reference/animacoes.md`: ilustração animada Lottie (busca, cor da marca, trecho, pico na palavra).
- `reference/broll.md`: vídeo real (Pexels/Pixabay/gravação de tela).
- `reference/pontos.md`: o mundo de pontos contínuo (`"visual": "mundo"`), formas, câmera e números de
  performance. `reference/pontilhismo/` é a biblioteca de referência de onde ele veio (não é skill).
- `reference/som.md`: voz, trilha, efeitos, volume.
- `reference/biblioteca-movimento.md` e `reference/biblioteca-icones.md`: catálogo de heróis e ícones.
- `reference/fallback-ffmpeg.md`: sem Node.

Scripts sempre pelo caminho absoluto da skill (o cwd é o projeto):
`plano.mjs` (resolve e valida), `render.mjs` (prancha, render, volume, QA), `qa.mjs`, `captura.mjs`
(página real → PNG + coordenadas do trecho), `logo.mjs` (logo oficial), `lottie.mjs` (animação Lottie), `broll.mjs`, `transcribe.mjs`,
`sfx-gerar.mjs`, `pontos.mjs` (imagem → pontos do mundo), `respiros.mjs` (pausas em narração corrida). `group-captions.mjs` é legado do modo slide e não se usa mais no modo áudio.

## Regras que não se negociam

1. **Texto antes do render.** O roteiro (e, no modo áudio, o transcript corrigido) é aprovado antes de
   qualquer render. Render custa 5 a 10 minutos; frase errada desperdiça isso.
2. **Legenda de áudio é VERBATIM.** Só se corrige o que o Whisper ouviu errado, via `correcoes` no plano
   (índices do `words.json`). Nunca parafrasear, resumir, tirar ou pôr palavra.
3. **Toda cena encena a fala.** Cada cena e cada animação, minimalista ou não, tem que se encaixar
   claramente no que a voz diz naquele trecho (não só no tema). Campo `encena` obrigatório, cobrado pelo
   validador e mostrado no roteiro de aprovação.
4. **Prova é prova.** `captura.mjs` só fotografa o que existe e falha se o trecho não está na página.
   Se a fala afirma algo que a fonte não sustenta, a cena não leva prova (e isso se avisa ao Alvaro).
5. **O plano passa no validador.** `plano.mjs` com erro não renderiza. Avisos se leem e se decidem.
6. **Prancha aprovada antes do render completo**, com a leitura escrita das perguntas de julgamento
   de `registros.md` (dominante, encenação, texto repetindo fala).
7. **Olhar antes de entregar.** QA aprovado + folha de contato do MP4 final vista. Nunca entregar vídeo
   que ninguém olhou.
8. **Anti-guru:** nada de promessa de renda, "fature", "em X dias". R$ nunca como `$` solto.
9. **Nunca falhar em silêncio.** Remotion não roda → fallback ffmpeg, e dizer qual motor gerou.
10. **Passada do Chefe só no texto que é nosso.** A fala transcrita é verbatim e nunca passa pelo
    revisor. Passam pela skill `revisor-chefe` (passada padrão, como bastidor): o `text` das cenas no
    modo texto, antes de aprovar o roteiro, e a `legenda.md` do post, antes de oferecer o agendamento.
    O Chefe respeita o limite de palavras por linha, o arco do modo texto e as âncoras já aprovadas.

## O fluxo (detalhe e comandos em `reference/fluxo.md`)

1. **Entrada.** Áudio em `dados/audio/` (modo áudio, o principal) ou tema/frase (modo texto).
2. **Transcrever** (modo áudio): `transcribe.mjs` → `words.json` na pasta da peça. Rascunho numerado:
   `node plano.mjs --rascunho --words <words.json>`. Mostrar o texto ao Alvaro e anotar as correções.
3. **Dirigir** (ler `registros.md`): uma cena por ideia, cada uma com `ancora` (palavra em que corta),
   `evento` nos dados, prova real onde houver fonte (`captura.mjs`, `logo.mjs`), animação Lottie onde um
   objeto ou ação ganha com movimento de animador (`lottie.mjs`, uma família de estilo por reel), B-roll
   onde a fala descreve ação/lugar, mundo de pontos onde uma ideia se transforma na outra (`pontos.md`).
   Cada cena com `encena`. 1,2 a 5s por cena.
4. **Validar:** `node plano.mjs --props <plano.json> --legendas`. Zerar erros.
5. **Aprovar o roteiro** (AskUserQuestion): lista numerada das cenas com registro e âncora.
6. **Prancha:** `render.mjs --props <plano.json> --prancha conteudo/reels/<slug>/_prancha` (~1,5 min).
   Ler as folhas, corrigir, mostrar ao Alvaro.
7. **Render:** `render.mjs --props <plano.json> --out conteudo/reels/<slug>/<slug>.mp4`. Incremental: só
   as cenas alteradas renderizam (corrigir uma cena leva ~1 min). Normaliza o volume e roda o QA sozinho;
   sai 4 se o QA reprovar. `--sem-cache` refaz tudo.
8. **Olhar e entregar:** folha de contato do MP4, caminho, duração, o que mudou. Depois `legenda.md` e
   oferta de agendamento.

## Modo texto (sem áudio)

Mesmo motor e mesmas regras de registro, com `hold` (quadros) no lugar de `ancora`, e a frase de cada
cena em `text` (tipografia cinética). Precisa de `trilha` se for agendado. Ganchos por cena ≤ 9
palavras por linha, arco gancho → escalada → virada → fecho.

## Modo degradado

- Sem Node → `reference/fallback-ffmpeg.md` (movimento mais simples; dizer isso).
- Sem chave de B-roll → cena volta a ser motion, e avisar que a chave falta.
- Transcrição falhou → dizer, e oferecer legendar a partir de texto digitado (nunca paráfrase).
- Assunto de notícia com a web fora → frase atemporal em vez de afirmação não verificada.

## Casos de borda

- Pedido vazio → perguntar o tema numa linha.
- Nicho fora de tecnologia (padaria, advogado) → o visual serve, a copy se adapta ao nicho.
- Texto ofensivo, ilegal ou difamatório na tela → recusar e oferecer alternativa.
- Formato quadrado ou horizontal → esta versão é 9:16; entregar 9:16 e dizer.
