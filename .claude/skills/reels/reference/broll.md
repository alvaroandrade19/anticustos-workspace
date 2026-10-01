# broll.md: vídeo real dentro do reel

B-roll mostra a AÇÃO ou o LUGAR que a fala descreve, 3 a 5s, tela cheia. Não é enfeite: entra onde a
fala narra algo que acontece no mundo (atendente ao telefone, balcão de loja, planilha sendo
preenchida, estoque parado).

## De onde vem, em ordem de valor

1. **Gravação de tela real** (o agente rodando, o WhatsApp respondendo, a planilha): é prova, é de graça
   e ninguém tem igual. O Alvaro grava; entra como `video` do mesmo jeito.
2. **Banco gratuito: Pixabay (chave ativa) e Pexels (novas chaves pausadas em 09/2026; o script ignora
   marcador tipo `cole_aqui` e cai pro Pixabay se o Pexels recusar a chave).** Chaves grátis no `.env` da raiz
   (`PEXELS_API_KEY`, `PIXABAY_API_KEY`). O conteúdo pode ser usado comercialmente, mas os termos da
   API pedem crédito: Pexels exige "Vídeo de [autor] no Pexels" (e link pro Pexels quando der), Pixabay
   pede indicar a origem. Então **todo reel com B-roll leva o crédito na `legenda.md`**, montado a partir
   do `<arquivo>.credito.json`. Limites: Pexels 200 buscas/hora e 20 mil/mês; Pixabay 100 por minuto e
   pede guardar o resultado por 24h (a pasta `_busca` já faz isso). Não passa pela Cloudflare.
3. **Motion**, quando nenhum dos dois serve.

## Fluxo (cada passo com o script)

```bash
node "<skill>/scripts/broll.mjs" buscar "small business owner phone call" --out conteudo/reels/<slug>/broll/_busca
#   → candidatos.jpg (numerada) + candidatos.json. Consulta em inglês rende mais.
node "<skill>/scripts/broll.mjs" baixar <id> --out conteudo/reels/<slug>/broll/<nome>.mp4
#   → vertical 1080x1920, 30 qps, mudo, H.264 + <nome>.credito.json
node "<skill>/scripts/broll.mjs" revisar conteudo/reels/<slug>/broll/<nome>.mp4
#   → <nome>.revisao.jpg: 10 quadros do vídeo INTEIRO, com o tempo
```

Mostrar a folha de candidatos ao Alvaro e deixar ele escolher quando houver dúvida de tom.

## Revisão obrigatória (olhar a tira inteira, 4 quadros não aprovam movimento)

- **vídeo gerado por IA se passando por filmagem:** o Pixabay tem muito (anime, "pintura" com luz
  perfeita, mãos estranhas). Não é proibido, mas se parecer foto real de pessoa, pede o selo de IA do
  Instagram; na dúvida, prefira filmagem de verdade ou ilustração assumida;

- mão ou corpo deformado, objeto flutuando;
- texto, placa, logo ou tela legível de terceiros;
- marca concorrente em destaque;
- ação que não cabe na janela da cena.

Defeito num pedaço se resolve na edição: `"inicio"` (segundo do vídeo em que a cena começa) pula o trecho
ruim, `"vel"` (0,85) estica um trecho curto sem se notar.

## No plano

```json
{"visual": "video", "ancora": "atende o telefone", "arquivo": "broll/atendente.mp4", "inicio": 1.2, "vel": 1}
```

O motor aplica a mesma finalização do resto (grade escura, vinheta) e um fundo suave atrás da legenda.
A legenda continua por cima. Registro `video`: não repetir em cena vizinha.
