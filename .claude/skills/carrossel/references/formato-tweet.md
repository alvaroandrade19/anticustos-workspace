# Formato Tweet

Formato alternativo, para **publicação pontual**. Cada slide parece um post do X. O leitor já sabe
ler nesse formato, então a atenção vai inteira para o texto.

**Quem escolhe é o Alvaro, no começo da produção.** A skill pergunta e não decide sozinha.

## Quando faz sentido

- Opinião curta e afiada, que não precisa de diagnóstico nem de conta
- Reação a algo do setor, tese isolada, observação de bastidor
- **Três a cinco slides.** Acima disso o formato não serve, porque ele não tem barra de progresso
  e o leitor perde a noção de onde está. Peça longa volta para o formato Anti Custos.

## O que muda em relação ao formato padrão

| | Padrão Anti Custos | Tweet |
|---|---|---|
| Fundo | `--bg` com grão, atmosfera ou glow | `--bg` liso, sem grão e sem gradiente |
| Topo | Barra de marca | Avatar, nome e handle |
| Headline | Gradiente azul, peso 800 | Não existe headline separada |
| Corpo | 38px, diagramação de ênfase | 40px, peso 400, negrito nos termos-chave |
| Rodapé | Rótulo, progresso e contador | Nada |
| Imagem | Seis layouts | Anexo abaixo do texto, como no X |

## Adaptações deliberadas (e por quê)

**Fundo escuro, não branco.** A referência original usa branco puro. Aqui o fundo é `#0A0A0B`, o
mesmo do resto da marca. O feed inteiro é dark, e um slide branco no meio quebraria a coerência sem
ganhar nada: o formato já se identifica pelo avatar e pelo handle, não pela cor de fundo.

**Sem emoji.** A referência libera, porque faz parte da linguagem do X. A voz da Anti Custos é
direta e sóbria, e emoji aqui parece imitação de perfil de growth. O formato empresta o continente,
não o jeito de falar.

**Sem badge de verificado.** O `design-guide.md` registra que não há.

**Sem barra de progresso.** Tweet não tem. É o motivo do limite de cinco slides acima.

## Estrutura do slide

**Cabeçalho**, fixo em todos, a 110px do topo e 80px da esquerda. **Sai sozinho em todo `.slide`,
pelo `estilo-tweet.css`**: não escrever marcação de cabeçalho na peça. Nome, handle e inicial do
avatar vêm das variáveis `--nome`, `--handle` e `--inicial`, editáveis num lugar só.

- Avatar circular de 88px, com o gradiente azul e a inicial no tom do fundo, peso 800, 38px.
  Quando existir `marca/foto-perfil.jpg`, trocar o `background` do `.slide::before` pela foto.
- Nome à direita do avatar: 30px, peso 600, `--tx`
- Handle abaixo do nome: 26px, peso 400, `--tx-3`

**Corpo**, 40px abaixo do cabeçalho, com 80px de margem lateral:

- 40px, peso 400, entrelinha 1,5, cor `--tx`
- Termo-chave em peso 600, na mesma cor. **Negrito é o único recurso do texto**, sem gradiente,
  sem realce com fundo, sem cor de acento
- Espaço vazio embaixo é intencional. É assim que um post se parece

**Imagem**, só quando houver, logo abaixo do texto:

- Largura total dentro da margem, raio de 16px, borda de 1px em `--line`
- Print de tela em `contain`, foto em `cover`, mesma regra do formato padrão
- Sem card de preview de link, sem caixa com título e descrição. Só a imagem

## Variação entre slides

Mesmo sendo tweet, os slides não podem ser idênticos:

- **Texto puro:** o mais comum
- **Dado em destaque:** um número em 72px, peso 600, na cor `--g2`, dentro do corpo
- **Lista curta:** dois ou três itens com marcador tipográfico simples, nunca emoji
- **Capa:** menos texto, corpo em 48px
- **Fechamento:** a ação em peso 600, mais o handle repetido em `--g2`

## O que continua valendo integralmente

Todo o `filtro-editorial.md`. O formato muda o continente, não o padrão de escrita:

- Zero travessão
- Regra das duas fontes de número: dado público com fonte, ou conta aberta com a base à mostra
- Nenhuma prova social, porque não existe nenhuma
- Sem estrutura binária, sem cacoete de IA, artigos presentes

O `headlines.md` também vale: o slide de capa do tweet ainda precisa de um gancho que segure, e ele
sai da mesma engine, só que escrito como frase de post e não como manchete.
