# Sistema Papel

Proposta de **segundo sistema visual**, não de paleta nova. Azul, Terra e tweet são variações do
mesmo esqueleto: fundo escuro, headline gigante em gradiente, bloco de texto flutuando no centro,
rodapé com progresso. Papel troca o esqueleto inteiro.

**Arquivos:** `estilo-papel.css`, `template-papel.html` (1080x1350), `template-papel-card.html`
(1080x1080). Autossuficiente: não toca em `estilo.css`, `template.html` nem em nenhum dos formatos
que já existem.

---

## A tese

A peça não parece um post. Parece um documento interno da empresa: nota de custo, demonstrativo,
memorando. É o registro visual que o dono de PME já sabe ler, porque ele vive dentro de planilha,
guia, folha de pagamento e balancete.

Isso resolve três problemas de uma vez, e é por isso que vale como sistema separado:

1. **A marca não tem prova social e está proibida de fabricar.** O único ativo é aritmética aberta.
   Documento é o formato que faz aritmética parecer aritmética. Poster escuro faz aritmética parecer
   propaganda de aritmética.
2. **O feed de IA inteiro é escuro com gradiente.** É o figurino padrão da categoria de hype contra
   a qual a Anti Custos se posiciona, e o próprio `design-guide.md` já usa esse argumento para
   justificar superfície clara na hora de converter. Uma folha clara no meio de um feed preto é o
   diferenciador mais barato disponível.
3. **O sistema escuro comporta uma ideia por tela.** Papel comporta um argumento inteiro com conta,
   cláusula e anexo, porque a diagramação de documento aguenta densidade sem virar poluição.

---

## O que muda

| | Sistema escuro (Azul, Terra) | Papel |
|---|---|---|
| Fundo | Preto, com grão, atmosfera ou glow | Papel claro `#EEF1F6` com fibra de 5,5% |
| Hierarquia | Tamanho e cor: headline 104px em gradiente | Fio, posição e grade. Título em 62 a 78px |
| Família | Grotesca (ou serifada display na Terra) | Newsreader (serifada editorial) no argumento, IBM Plex Sans na estrutura, IBM Plex Mono no número |
| Composição | Um bloco centralizado no vazio | Grade de duas colunas: margem de anotação à esquerda, leitura à direita |
| Acento | Gradiente de três stops na headline | Um grifo de caneta, fio de 4px, uma vez por peça |
| Imagem | Fundo com scrim de duas camadas | Anexo emoldurado com referência na margem |
| Rodapé | Rótulo, barra de progresso, contador | Fio, perfil e fólio (`folha 03 / 07`) |
| Densidade | 45 a 90 palavras por slide | 70 a 140 por folha. O formato aguenta, e vazio grande aqui lê como folha inacabada |

---

## Cor: nada de novo

Os seis tokens saem inteiros da tabela **Superfícies claras** do `marca/design-guide.md`, já
verificados lá: papel `#EEF1F6`, folha `#FFFFFF`, tinta `#0B0E14` (16,9:1), tinta secundária
`#454C5C` (7,6:1), fio `#D8DEE9`, caneta `#1D4ED8` (5,92:1). Nenhuma cor inventada, nenhum stop novo
pra verificar. O sistema é radical na forma e ortodoxo no token.

## Tipografia: de onde veio

`ui-ux-pro-max` foi consultado em três domínios e entregou pouco, o que já tinha acontecido na
Terra: em `--domain style`, `e-ink-paper` e `editorial-grid-magazine` sustentam a direção (tinta
sobre off-white, textura de papel, serifada para leitura, zero gradiente, grade assimétrica, fio de
seção); em `--domain typography`, os pares devolvidos eram Inter, Playfair Display e Roboto, todos
na lista de faces saturadas do detector da `/impeccable`, então a escolha veio de fora do banco.

- **Newsreader** carrega o argumento. Serifada de origem noticiosa, desenhada para tela, com eixo
  óptico de verdade (`opsz`), que é o que permite usar a mesma face em 33px de corpo e 78px de
  título sem parecer a mesma coisa esticada.
- **IBM Plex Sans** carrega a estrutura: cabeçalho, rótulo de margem, rodapé, cabeçalho de tabela.
- **IBM Plex Mono** continua no número, que é a regra que a marca já tinha. Plex Sans e Plex Mono
  são a mesma superfamília, então a máquina fala uma língua só e a serifada fala a outra.

A divisão é conceitual, não decorativa: **serifada é o que uma pessoa argumenta, Plex é o que a
máquina registra.**

---

## A grade

Margem de 96px. Duas colunas: `160px` de margem de anotação, calha de 32px, resto para leitura. Os
fios atravessam as duas colunas, e é isso que faz a grade aparecer em vez de ficar implícita.

- **Cabeçalho de folha:** marca à esquerda, seção à direita, fio duplo embaixo. O rótulo de seção
  vive aqui como running head, nunca acima do título.
- **Margem (`.nota`):** rótulo curto alinhado à direita, encostado na calha. É onde mora o `§`, o
  `Fig. 1` e a fonte do número. Uma por folha, duas no máximo.
- **Rodapé:** fio, `anticustos.ia` à esquerda, fólio à direita.
- **Ancoragem:** documento começa no alto e desce (`.corpo`, padrão). `.centro` é exceção de capa,
  de card e de folha curta. Sobrou mais de um quarto vazio numa folha ancorada no alto? Falta
  conteúdo, e o formato aguenta mais texto.

## Layouts

| | Layout | Componente | Quando |
|---|---|---|---|
| **P1** | Capa | `.titulo.capa` + `.grifo` + `.texto.lead`, em `.centro` | Primeira folha |
| **P2** | Texto | `.titulo` + `.texto` com dois ou três parágrafos | O miolo do argumento |
| **P3** | Destaque | `.destaque` entre dois fios de tinta cheia | A frase que o leitor leva embora. Uma por peça |
| **P4** | Livro | `.livro` + `.soma` + `.soma-l`, com a base na margem | Conta aberta. É a folha mais forte do sistema |
| **P5** | Cláusulas | `.clausula` com ordinal mono em caneta | Sequência onde o número carrega posição de verdade |
| **P6** | Anexo | `.figura` com `.img` (`cover`) ou `.img.print` (`contain`) | Print, captura ou foto |
| **P7** | Encerramento | `.titulo` + `.texto` + `.assinatura` | Fecha a peça assinada, não com CTA de anúncio |

**Card único (1080x1080):** mesma folha, `.folha.card`, sempre em `.centro`, fólio vira
`nota avulsa`. Duas variantes prontas: tese e demonstrativo.

---

## Divergências deliberadas do design-guide

Cada uma é consciente e reversível. Se alguma for recusada, o sistema continua de pé sem ela.

1. **Fundo claro no Instagram.** O guia diz que o dark é a base e o `design-system.md` diz que a
   marca é dark do começo ao fim. Papel contraria isso de propósito, usando o mesmo argumento que o
   guia já aceita na superfície de conversão: o escuro é o uniforme da categoria de hype. **É a
   decisão mais séria aqui, e é sua.** Custo real: o feed deixa de ser homogêneo, e passa a ter dois
   registros. Ganho: o segundo registro se identifica de longe como "isto é conta, não é gancho".
2. **Sem gradiente.** A assinatura do sistema escuro não entra aqui. No lugar entra o grifo de
   caneta. Gradiente sobre papel claro vira decoração, e documento não tem decoração.
3. **Rótulo de seção no cabeçalho.** O guia proíbe eyebrow acima do título. Aqui o rótulo fica no
   canto superior direito da folha, separado por fio duplo, com o título muito abaixo: é running
   head de documento, não kicker.
4. **Serifada no corpo.** O guia especifica Schibsted Grotesk. Papel usa Newsreader porque documento
   longo em grotesca vira relatório de software.
5. **Medida de linha de 45 a 50 caracteres**, abaixo dos 65 a 75 do guia, porque a coluna de
   anotação come largura. É a mesma ordem de grandeza que o sistema escuro já pratica.

## O que continua valendo integralmente

`filtro-editorial.md` inteiro e as regras de escrita do `design-system.md`: zero travessão, regra das
duas fontes de número (dado público com fonte, ou conta aberta com a base à mostra), diagramação de
ênfase (afirmação em 600 na tinta cheia, desenvolvimento em 400 na secundária), nenhuma prova social.
O sistema muda o continente. O padrão de escrita não muda.

## Detector

`impeccable detect` devolve três achados neste template, todos falso positivo conhecido:
`cramped-padding` (a área segura vive em `position:absolute`, que o detector não enxerga),
`oversized-h1` (título grande é o ponto) e `low-contrast 2,9:1 tinta sobre caneta` (o detector lê o
grifo como preenchimento atrás do texto; ele é um fio de 4px abaixo da linha de base, e o texto está
sobre o papel, em 16,9:1). **Esse último vira problema de verdade se alguém engrossar o grifo até
virar marca-texto: grifo é fio, nunca preenchimento.**

## Render

```bash
node scripts/render-carrossel.js conteudo/carrosseis/[tema]/carrossel.html
```

O script fatia por `.slide`. Como aqui a folha é `.folha`, trocar o seletor ou renomear a classe na
hora de integrar. É a única mudança de encanamento que falta se o sistema for aprovado.
