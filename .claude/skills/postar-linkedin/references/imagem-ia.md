# Imagem gerada por IA para o post

Ler este arquivo só quando o Alvaro escolher "imagem gerada por IA" no passo 1b. Nos outros
caminhos ele não entra e não gasta contexto.

Divisão de trabalho: **peça com texto, número, gráfico ou logo vai pela `/impeccable`**, sempre.
Modelo de imagem erra letra, erra mais ainda em português, e número sem a fonte colada quebra a
regra da marca. A IA generativa serve para **âncora visual sem tipografia**: atmosfera, metáfora,
cena. O texto mora no post.

## O que entregar, e o formato exato da entrega

Três conceitos, um de cada família abaixo, nunca três variações da mesma ideia. Para cada um, quatro
elementos e nada além disso:

```
**1. <nome do conceito>**
Por que amarra: <uma linha ligando à tese do post>
[bloco de prompt em code fence]
Risco: <uma linha do que pode sair torto na geração>
```

Fechar com uma linha só recomendando uma delas e o porquê em meia frase. Sem introdução, sem
resumo do post, sem comparar as três em parágrafo.

## As três famílias

1. **Objeto metáfora.** Um objeto físico comum que encarna a tese, em still life editorial. É a
   família mais segura: o modelo acerta quase sempre e o resultado não parece banco de imagem.
2. **Cena humana documental.** Alguém trabalhando no ambiente real de PME (balcão, estoque, sala
   pequena, papel na mesa), luz disponível, ninguém posando para a câmera.
3. **Abstração estrutural.** Forma, repetição, luz e sombra, sem figura reconhecível. Boa quando a
   tese é sobre sistema, processo ou escala, e é a que menos envelhece.

## Anatomia do prompt

Prompt em inglês, um parágrafo, nesta ordem de slots. Modelo de imagem lê o começo com mais peso,
então o sujeito vem primeiro e o acabamento por último:

`sujeito concreto e ação` → `ambiente` → `composição e enquadramento` → `luz` → `paleta com hex` →
`lente ou mídia` → `textura e acabamento` → `proporção` → `negativos`

Exemplo completo, família 1:

```
Editorial still life of a single worn brass service bell on a bare steel counter, empty small-office
back room behind it, subject left of frame with wide negative space to the right, one hard key light
from the upper right with deep falloff into shadow, near-black background #05060A with a cool blue
rim #2563EB catching the metal edge, 50mm lens, shallow depth of field, fine film grain, matte
finish, square 1:1. No text, no letters, no numbers, no logos, no watermark, no people.
```

Negativo padrão, colar no fim de todo prompt (ou no campo de negative prompt, quando o gerador
tiver um):

```
no text, no letters, no numbers, no logos, no watermark, no humanoid robot, no glowing brain, no
circuit board, no floating hologram, no binary code, no neon cyberpunk, no stock-photo smile
```

Proporção: escrever em palavra (`square 1:1`) e, se o gerador aceitar parâmetro, somar `--ar 1:1`.
Quadrado 1200x1200 é o padrão do feed. Interpretação, não fato apurado: quadrado ocupa mais altura
de tela no celular que paisagem, e retrato mais alto que 1:1 às vezes chega cortado no desktop.

## Paleta, já resolvida

Não abrir `marca/design-guide.md` para isso, os valores são estes:

| Uso | Hex |
|---|---|
| Fundo escuro, o padrão | `#05060A` |
| Luz e material claro na cena | `#F2F4F8` |
| Acento, um só na imagem | `#2563EB` |
| Acento suave, reflexo e névoa | `#7CA5F5` |
| Fundo claro, quando a peça pedir ar | `#EEF1F6` com matéria escura `#0B0E14` |

Um acento por imagem. Carmim, rosa e cinza puro estão banidos na marca e não entram nem aqui.

## Regras duras

- **Zero tipografia.** Nenhuma letra, número, placa, tela com texto ou logo. Inclusive logo da Anti
  Custos: marca não se gera, se aplica.
- **Nenhum clichê de IA.** Robô humanoide, cérebro de circuito, holograma azul flutuante, rede
  neural brilhante, 0 e 1 caindo, aperto de mão entre humano e androide. É o visual que grita
  "imagem genérica de IA" e derruba a credibilidade justamente de quem vende IA a sério.
- **Rosto sintético, não.** Pessoa de costas, de lado, só as mãos, ou plano aberto. Rosto nítido
  gerado por IA em post de perfil pessoal confunde autoria e cai no vale da estranheza.
- **Uma imagem só.** Sequência é carrossel, e carrossel é outra decisão.
- A imagem é âncora, não resumo. Se ela tenta explicar o post, virou slide e devia ter ido pela
  `/impeccable`.

## Depois que o Alvaro gerar

Salvar em `conteudo/linkedin/<slug>/imagem/01.png` e publicar com `--imagem`. Checar antes:

- Nenhuma letra sobrou na cena, nem em placa, etiqueta ou tela ao fundo
- Nenhuma mão com dedo a mais, nenhum objeto derretido na borda
- Um acento só, e a paleta bate com a tabela acima
- Ainda legível reduzida a 300px de largura, que é o tamanho real no feed do celular
