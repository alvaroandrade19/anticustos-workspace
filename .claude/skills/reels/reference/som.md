# som.md: voz, trilha e efeitos

## A falha que isto corrige

A v1 mandava "publicar mudo e pôr música do momento no editor do Instagram". Nós agendamos pela API,
e a API não acessa a biblioteca de músicas do Instagram. **Reel sem voz ia ao ar mudo de verdade.**
Agora o render avisa quando o plano não tem nem `audio` nem `trilha`.

## Camadas

| Camada | Campo | Regra |
|---|---|---|
| voz | `audio` | é o conteúdo. Nunca abaixada pra caber efeito |
| trilha | `trilha` (arquivo em `marca/audio/trilhas/`, licença livre pra redes) | loop. Volume 0,10 sob voz, 0,35 sem voz (`trilhaVol` sobrescreve) |
| efeitos | automáticos, desligáveis com `"sfx": false` (plano) ou por cena | pontuam informação, não todo corte |

## Efeitos automáticos (scripts/plano.mjs)

- `whoosh` na entrada com `flash` ou `push` (o pico da passagem cai no corte);
- `tique` quando um dado pousa (`evento`);
- `grave` no corte pra uma tipográfica.

Intervalo mínimo de 2,5s entre sons automáticos. Ganho de -15 a -20 dB por evento.

Os três arquivos padrão são sintetizados (`scripts/sfx-gerar.mjs`, sem licença de terceiros). Biblioteca
própria (CC0, Pixabay SFX, Kenney) entra por `"sfxDir": "marca/sfx"` com os mesmos nomes de arquivo.
**Síntese e medição não substituem escuta:** o Alvaro aprova de ouvido na primeira vez que um som novo
entra. Não declarar "ficou bom" sobre som que ninguém ouviu.

## Volume final

O render normaliza em duas passadas pra -14 LUFS com pico verdadeiro ≤ -1,5 dBTP (perto do que o
Instagram faz, então o vídeo não muda de volume no feed) e o `qa.mjs` confere: faixa aceita de -16 a
-12 LUFS e pico ≤ -1 dBTP.
