# Legenda padrão

Componente: `template/src/Legenda.tsx`.

- Fonte **Inter**. Todas as palavras em **400** (regular), cor `#CBC9C5`; a palavra sendo falada em **700** e branca, levemente elevada (−2 px).
- **Palavra por palavra**: cada palavra fica visível a partir do seu `start` em `words.json`.
- Blocos de até **4 palavras / ~20 caracteres**; quebra também em pontuação ou pausa > 0,35 s.
- Posição: bloco centralizado com a base a ~**380 px** da borda inferior (`top: H - 380 - 90`).
- Tamanho 70 px, `letterSpacing -2.2`, sombra `0 2px 24px #000` para ler sobre os pontos.
- Some ~1,2 s após a última palavra do bloco se houver silêncio longo.
- A legenda é literal (o que é dito). Rótulos e títulos editoriais são outra camada.
