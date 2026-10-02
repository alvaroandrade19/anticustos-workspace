# pontilhismo/: biblioteca de referência (não é skill)

Origem: skill `brabo-minimalista-pontilhismo` v1.0, de Fernando Araújo (BRABO), licença MIT
(`LICENSE`). Entrou no workspace em 01/10/2026 e foi absorvida pela `/reels` no mesmo dia.

**Por que deixou de ser skill:** a descrição dela disparava com "vídeo minimalista", gatilho que já é
da `/reels`, então o mesmo pedido podia cair em duas skills. E o resto do pipeline dela (transcrição,
legenda, revisão, render) a `/reels` já faz com âncora na palavra, validador, prancha, QA e render
incremental. O `SKILL.md` virou `SKILL-original.md` justamente pra não ser descoberto como skill.

**O que foi portado pro motor da `/reels`:** o mundo de pontos contínuo (um conjunto de partículas
que atravessa o vídeo e morfa de ideia em ideia) e a câmera 3D. Vive em
`assets/remotion/src/mundo.tsx`, reescrito em canvas e nos tokens da marca. Ver
`reference/pontos.md`.

**Pra que serve esta pasta agora:**
- `exemplos/`: quatro vídeos completos, com as receitas de forma (motor de indução em partes, olho
  vivo com pálpebra e íris, ampulheta, ilhas que se aproximam, linhagem). Consultar antes de inventar
  uma forma nova. As imagens dos exemplos ficam só no disco (fora do git, ver `.gitignore`).
- `references/ilustrar.md`: o método socrático ("o que a pessoa precisa VER?") e o repertório de
  formas.
- `scripts/`: `imagem-para-pontos.mjs` e `inserir-respiros.mjs` são candidatos a portar (Fase 3).

**O que NÃO vale aqui:** paleta P&B fixa, legenda em Inter, "sem efeito sonoro" como padrão e o
template em React 18. A marca (`marca/design-guide.md`) e as regras da `/reels` vencem.
