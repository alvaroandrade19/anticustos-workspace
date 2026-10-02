# Narração e sincronização

Todo o vídeo é sincronizado pela fala. O arquivo `src/data/words.json` (tempo de cada palavra) é a espinha dorsal: morphs, câmera, imagens e legenda leem os tempos dele.

## Caminho A — narração automática (MCP da ElevenLabs)

Pré-requisito: o **MCP da ElevenLabs** conectado ao agente (Claude Code, Claude Desktop, etc.) com a conta da pessoa.

1. Liste as vozes disponíveis e escolha a voz da pessoa (clone) ou uma que combine com o tema.
2. Gere **uma** take com o modelo multilíngue (`eleven_multilingual_v2`). Escreva o roteiro com quebras de linha e reticências onde quer respiração — o modelo respeita.
3. Palavras que o modelo pronuncia mal: reescreva foneticamente **só no texto enviado à voz** (ex.: "IAs" → "inteligências artificiais"; "Claude" → "Clód"). Mantenha a grafia correta na legenda.
4. Baixe o áudio para `public/narracao-raw.mp3`. Informe o custo em créditos ao usuário.

## Caminho B — a pessoa entrega a narração

1. Receba o `.mp3`/`.wav` e salve em `public/narracao-raw.mp3`.
2. Não altere a velocidade da voz. Se estiver corrida, use respiros (abaixo).

## Transcrição por palavra

```bash
node scripts/transcrever-palavras.mjs public/narracao-raw.mp3 src/data/words.json pt
```

Usa whisper.cpp local (instala na 1ª vez em `~/.whisper-cpp`, modelo `medium`). Compare o texto impresso com o roteiro: corrija palavras erradas **à mão** no JSON (mantendo os tempos).

## Respiros (deixar a fala mais calma)

```bash
node scripts/inserir-respiros.mjs public/narracao-raw.mp3 src/data/words.json public/narracao.mp3
```

- Insere pausas após pontuação (ponto 0,45 s · reticências 0,55 s · vírgula 0,2 s — ajuste no topo do script).
- **Só corta onde há silêncio real** (procura o trecho mais silencioso entre as palavras). Quando não encontra, pula e avisa.
- Atualiza `words.json` com os tempos deslocados.
- **Ouça as emendas.** Frases emendadas (ex.: "estamos, porque…") às vezes não têm silêncio — melhor não pausar ali.

## Regras

- Duração típica: 35–50 s de fala + ~1–3 s de saída visual.
- Legendas usam **os tempos reais** — nunca estimar.
- Declare ao usuário o que foi ouvido e o que foi só verificado por medição.
