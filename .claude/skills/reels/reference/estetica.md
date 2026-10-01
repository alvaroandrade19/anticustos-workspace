# estetica.md: the premium minimalist look + anti-slop copy guard

Read this BEFORE writing any on-screen line or rendering. This is the moat: the difference
between a video that looks like a default AI template and one that looks like a designer made it.
Everything here draws on established references (kinetic-typography + Reels safe-zone guides, AI-slop
detection checklists, BR anti-slop lists), sources noted inline.

## 1. O visual em um parágrafo (v2)
Fundo escuro do tema, uma ideia por cena, um elemento dominante, legenda branca curta cortando seca no
tempo da voz. Grão e vinheta sutis pra nunca parecer limpo demais. A contenção é o que lê como premium:
nada se mexe só pra "dar dinâmica" (regra-mãe em `registros.md`: mostrar a prova, apontar, concluir).

## 2. Tipografia
- **Anton** (em `assets/fonts/`, OFL) na legenda, nas tipográficas e nos números. Nunca Arial,
  Helvetica, Segoe ou Inter como título: são a assinatura do vídeo padrão de IA.
- Rótulos pequenos (`sub`, `unidade`, `fonte`): Arial em caixa alta espaçada, cor `ink2`. É o único
  lugar da segunda família.
- **Legenda:** ~84px a 1080 de largura (glifo ~57px, o corpo medido na referência), centralizada em
  0,70 da altura, 1 a 3 palavras por bloco, uma linha quase sempre, sombra + fundo escuro suave.
- **Tipográfica:** o corpo sai do comprimento da maior linha (até 22% da largura). `*palavra*` pinta de
  acento.
- Frase que começa com letra solta ("O", "A", "É") colada na seguinte pode fundir no Anton apertado
  (um "O C" virou "Q" num teste). Reescreva.

## 3. Movimento
- **Legenda não anima.** Corte seco no quadro da palavra. A fluidez vem da cadência (~2,5 blocos/s),
  não de easing: animar a entrada de um bloco de 0,3s gasta metade da vida dele.
- **Cena:** o herói já está em voo no primeiro quadro; o evento importante cai na palavra, ±3 quadros.
- **Câmera** de 0 a 4% por cena. Câmera e objeto não empurram juntos.
- **Transição:** `corte` é o padrão; `flash` pra trocar de prova; `push` pra fechar ideia. Sem flip, sem
  deslize lateral, sem wipe, sem estrela, sem glitch.
- Proibido: bounce, spin gratuito, letra tremendo, máquina de escrever em tipografia editorial,
  estroboscópio, tudo aparecendo de uma vez.

## 4. Composição e áreas seguras (1080x1920)
- Área segura do Instagram: 90px à esquerda, 150px à direita (botões), 180px em cima, 340px embaixo
  (legenda do post e nome do áudio). O motor respeita; não pôr nada importante fora disso.
- Herói na zona de 0,1 a 0,6 da altura, centrado em ~0,37; legenda em 0,70. Não sobrepor.
- **Um dominante por cena.** Insert de identificação (logo, pessoa, documento) é o HERÓI da janela,
  ~55% da largura ou mais, nunca selo pequeno ao lado de outra coisa.
- Duas bordas nunca se tangenciam: ou sobrepõem de verdade, ou afastam 40px.

## 5. Ritmo e estrutura
- **Gancho:** orientação em 1,5s (o espectador sabe do que se trata) e proposta em 3s. 50 a 60% da
  desistência acontece nos primeiros 3 segundos.
- Cena de 1,2 a 5s; nunca mais de 1 a 2s sem novidade visual (corte, evento, marca-texto riscando).
- Arco: gancho → escalada → virada → fecho. Última cena com `push`.
- **Duração:** o conteúdo manda, mas acima de ~45s o reel precisa de viradas fortes pra segurar
  (interpretação nossa, não dado medido). Roteiro pra voz: conte palavras FALADAS; número e ano vão na
  imagem, não na narração ("34. 11." falado vira ruído).

## 6. Luz e acabamento
- `orb`/`hero3d` são a marca: brilham o acento e respiram devagar; nunca trocam de cor.
- Grão ~7% + vinheta: o que tira o "limpo demais = IA". Sutil.
- Acento raro: até 2 usos no reel inteiro.

## 7. Anti-slop COPY guard (PT-BR), the lines must not smell like AI
The on-screen text is the product as much as the visuals. Ban these:
- **AI vícios (cited, Envox-style lists):** incrível, fascinante, essencial, revolucionário,
  "Não é apenas X, é Y", connector spam (além disso, ademais, portanto piling up), arbitrary
  travessões/em-dashes, hollow metaphors ("um mar de possibilidades"), "no mundo de hoje".
- **Genre clichés of the tech-motivational reel (avoid as empty filler):** "o futuro é agora",
  "à frente da multidão", "pare de ser comum", "a era da IA chegou", "não fique para trás",
  "isso vai mudar tudo". (Genre knowledge, not a cited list, use judgment; a sharp concrete line
  beats a grand vague one.)
- **No income/guru hype:** no "ganhe R$X", no "fature", no "em X dias", no promised outcomes, no
  "segredo que ninguém te conta". This is a hard pack rule.
- **Avoid a lone one-letter word ("O", "A", "É"...) as the FIRST word of a line.** At tight Anton
  tracking it can visually fuse with the next word's first letter (a standalone "O" before a word
  starting with "C" rendered as a fake "Q" in testing, cost a full render cycle to catch). Rewrite
  the line so it doesn't open on a bare single letter, instead of relying on the frame-check to spot it.
- **Write concrete, not grand.** "você descreve / a IA constrói / sem digitar código" beats
  "transforme sua realidade com o poder infinito da inteligência artificial". Short verbs,
  specific nouns, one idea per beat.

## 8. Checklist antes de entregar (tudo verdadeiro)
1. `plano.mjs` sem erro; avisos lidos e decididos.
2. Registros alternando; ícone/svg no máximo 3; nenhum objeto repetido.
3. Todo dado pousa na palavra (`evento`); toda prova é página real com a marca no trecho citado.
4. Legenda verbatim, correções só de escuta, blocos curtos, nada fechando em "o/de/que".
5. Prancha lida (dominante, encenação, texto não repete a fala, nada vazando da tela).
6. QA aprovado (quadros, formato, áudio, -14 LUFS, pico, sem tela preta, sem trecho parado).
7. Folha de contato do MP4 final vista.
8. Zero travessão, zero clichê de IA, zero promessa de renda.
