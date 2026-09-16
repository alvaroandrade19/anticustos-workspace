# Reels — vídeo minimalista a partir de 1 frase

Essa skill transforma **uma frase** num vídeo minimalista preto e branco (fundo preto, uma
esfera de luz que pulsa, texto grande aparecendo palavra por palavra) — vertical 1080x1920,
pronto pra postar no Reels, TikTok ou Shorts.

Você fala o tema. Ela escreve o roteiro, **te mostra as frases pra você aprovar**, e só então
renderiza o vídeo. Nada de editor, nada de CapCut.

---

## Como instalar

Copia a pasta `reels/` inteira pra dentro da sua pasta de skills:

- **Windows:** `C:\Users\SEU-NOME\.claude\skills\reels\`
- **Mac/Linux:** `~/.claude/skills/reels/`

Tem que ficar `.../.claude/skills/reels/SKILL.md` (a pasta precisa se chamar `reels`).

Não precisa de chave de API. Não precisa configurar nada. A fonte do vídeo já vem junto.

> **Uma coisa só:** o motor de qualidade usa o **Node.js** (a skill instala o resto sozinha na
> primeira vez). Se você não tem Node, a skill ainda funciona num modo mais simples (só com o
> ffmpeg). A skill **03 — Preparador de Máquina** instala o Node pra você em 1 comando, se precisar.

---

## Como usar

Abre o Claude Code na pasta onde você quer salvar os vídeos e fala, por exemplo:

- `cria um reel sobre criar ferramentas com IA`
- `faz um vídeo minimalista sobre disciplina`
- `transforma essa frase num vídeo: "você descreve, a IA constrói"`
- `/reels um reel pra minha padaria sobre pão fresco`

Ela mostra o roteiro (as frases que vão aparecer na tela), você aprova, e ela entrega o MP4 numa
pasta `reels/`.

---

## Antes e depois (o que muda com a skill)

**Sem a skill**, você pede um vídeo pro ChatGPT e recebe: um roteiro em texto (você ainda tem que
montar no CapCut), OU um vídeo de IA genérico com fonte errada, cor errada e cara de template.

**Com a skill**, sai um **MP4 vertical pronto** e ANIMADO, **feito pro seu texto**: cada frase
ganha uma cena que combina com o que ela diz — esfera de luz, tela de código digitando o SEU
assunto, um monitor que se desenha, um gráfico subindo quando você fala de crescimento, um número
contando, silhuetas correndo, e até **um desenho que a IA cria na hora** pro que você tá falando
(um foguete, um raio, o que fizer sentido). Com transições, câmera, grão de cinema.

Tem **cenas com profundidade 3D que enchem a tela**: um chão em perspectiva, um monitor 3D
inclinado com o código rodando, uma multidão de silhuetas com você na frente — não é só objeto
no meio da tela preta.

**As cores são suas:** o padrão é um look **escuro e cinematográfico** (fundo escuro, uma luz que
respira, tipografia grande) — é onde o brilho e a atmosfera aparecem. Mas dá pra escolher a cor da
sua marca ou a cor que combina com o tema (falou de Claude? vira laranja). E se você tiver um
**áudio** (sua voz, uma narração), a skill põe como som de fundo e ajusta o vídeo pra durar o tempo
do áudio, com a legenda acompanhando frase a frase. Você aprova a copy antes, e re-renderiza
trocando uma frase em segundos.

---

## O áudio (e a legenda na SUA voz)

O jeito mais forte de usar: **grave um áudio falando** (sua voz, no celular mesmo) e **coloque o
arquivo na pasta `audio/`** do seu projeto (a skill cria essa pasta pra você). Aí é só pedir o reel.
Ela **transcreve sua fala aqui no seu computador** (sem mandar pra lugar nenhum, sem chave de API) e a
legenda vira **exatamente o que você falou** — palavra por palavra, nada inventado, nada cortado. Ela
ainda **administra os slides** pra cada frase ficar tempo suficiente na tela (sem passar voando). Te
mostra a transcrição **pra você conferir e corrigir uma palavra** (se ela ouvir errado algum nome)
antes de gerar. O áudio entra como som do vídeo e a legenda acompanha sua fala. (Na primeira vez ela
baixa o motor de transcrição uma vez — depois é rápido e offline.)

> **As pastas:** seus áudios ficam em **`audio/`** e os vídeos prontos saem em **`reels/`**, tudo
> dentro do seu projeto. A skill cria as duas sozinha na primeira vez.

Se você **não** mandar áudio, o vídeo sai **sem som de propósito** — não dá pra embutir música sem
risco de direito autoral. A recomendação (que ainda ajuda no alcance): põe um **áudio em alta** direto
no editor do Reels/TikTok na hora de postar.

---

## Combina com

- O **Carrossel**: se já existe um `brand.md` de um cliente no projeto, essa skill puxa a cor da
  marca. Post e reel saem no mesmo visual.

---

## Observação honesta (licença)

O motor premium usa o **Remotion**, que é **gratuito pra pessoa física e empresas de até 3
funcionários** — ou seja, pra você criar seus próprios vídeos, não paga nada. (Só se você for uma
empresa com 4+ funcionários é que o Remotion pede uma licença própria deles. É uma licença
"source-available", não MIT.) Nada disso aparece no seu vídeo.
