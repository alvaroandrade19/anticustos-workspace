# Imagens: pesquisa, pontilhismo e créditos

## Pesquisa

- Fonte principal: **Wikimedia Commons**. Download direto: `https://commons.wikimedia.org/wiki/Special:FilePath/<Arquivo.jpg>?width=1400` (envie um User-Agent).
- Prefira **domínio público** (obras antigas, fotos da NASA, fotos históricas). Para CC BY / CC BY-SA, **credite o autor** na tela e na descrição do post.
- Confira o arquivo baixado (`file img.jpg`) — às vezes vem HTML de erro.
- Nunca gere imagens que finjam ser registros históricos. Geração só para elementos claramente ilustrativos, e só se o usuário permitir.

## Retrato em pontilhismo (regra: o protagonista sempre aparece assim)

1. Escolha uma foto com o rosto bem iluminado. Fundo escuro e liso é ideal (ex.: busto de mármore).
2. Fundo claro ou texturizado → **remova o fundo** (qualquer removedor que gere PNG transparente). Remoção de fundo não é geração de imagem.
3. `node scripts/imagem-para-pontos.mjs foto.png src/data/retrato.json --corte 0.1,0,0.8,0.8 --grade 74x98 --limiar 0.2`
4. Meta: 3–6 mil pontos, rosto legível na folha de contato. Suavize a base (fade nos últimos 20% de y) para não terminar num corte reto.

## Obras e fotos históricas no vídeo

Use o componente `Obra`: abre do centro, moldura de pontos correndo em volta, crédito embaixo e fecha.

- Crédito: **título em itálico** + `AUTOR · ANO · ACERVO` em mono.
- Uma imagem por momento, com duração da frase (1,5–3 s). Nunca em rajada rápida.
- Sempre em preto e branco (`grayscale(1) contrast(1.12)`), com leve recuo de zoom (1,08 → 1).
- Retratos pequenos (círculos) também funcionam dentro de uma ilustração, como na linhagem de pensadores.
