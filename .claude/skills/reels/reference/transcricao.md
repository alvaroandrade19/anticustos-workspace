# transcricao.md: legenda VERBATIM a partir do áudio (Whisper local, sem chave de API)

O Alvaro grava (ou gera no ElevenLabs) e a legenda tem que SER aquele áudio: palavra por palavra, nada
inventado, nada cortado. As palavras são fixas; o que se decide é a cena de cada ideia.

## Transcrever

```bash
node "<skill>/scripts/transcribe.mjs" --audio "dados/audio/<arq>" --out "conteudo/reels/<slug>/words.json" [--model Xenova/whisper-small]
```

- Decodifica com ffmpeg e transcreve localmente (Whisper via `@huggingface/transformers`), offline
  depois do primeiro download. Primeira vez: instala (~1 a 2 min) e baixa o modelo (~150MB). Narrar a espera.
- Saída: `{"text", "words": [{"word","start","end"}], "duration"}`.
- Áudio difícil ou sotaque: `--model Xenova/whisper-small` (maior, mais lento, mais preciso).

## Corrigir (o portão é a garantia)

O Whisper acerta ~95% em português e erra justo o que importa: nome próprio, termo em inglês, número
("Claude" virou "Cloud"; "duzentos e oitenta" virou "280 e 80"; "aluguel" virou "a lugar").

1. `node "<skill>/scripts/plano.mjs" --rascunho --words <words.json>` imprime o texto com o índice de
   cada palavra e as pausas.
2. Mostrar o texto corrido ao Alvaro e pedir que aponte o que foi mal ouvido (AskUserQuestion: "tá certo /
   quero corrigir").
3. Cada correção vira uma entrada em `correcoes` no plano, pelo índice: `{"de": 76, "ate": 77, "texto":
   "aluguel"}` (junta duas palavras numa, mantendo o tempo do trecho); `{"de": 83, "texto": "estante,"}`;
   `"texto": ""` remove.
4. Só erro de escuta. Nunca parafrasear, encurtar ou "melhorar" o que ele falou: essa é a promessa.

## Legenda: quem monta é o plano.mjs

A v1 agrupava a fala em slides de até 9 palavras (`group-captions.mjs`, hoje legado). A v2 monta
blocos de 1 a 3 palavras, uma unidade de sentido, com corte seco no quadro da palavra: quebra em
pontuação, pausa de 0,25s, corte de cena e em volta da palavra de ênfase; nunca fecha em "o", "de",
"que" (devolve pro bloco seguinte); cala nas cenas tipográficas (a frase já está na tela) e onde a
cena pede `"legenda": false`. Ver os blocos com `plano.mjs --props <plano> --legendas`.

## Modos degradados (honestos, sem paráfrase silenciosa)

- Sem Node, instalação falhou ou transcrição errou → dizer isso e oferecer legendar a partir de texto
  digitado. Nunca cair pra uma paráfrase do áudio.
- Sem ffmpeg → não dá pra decodificar; dizer.
- Áudio muito ruidoso → apoiar mais no portão de correção; sugerir `whisper-small`.
