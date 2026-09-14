# Formato Terra Clara

Segundo sistema visual da skill. O escuro (Azul, Terra) é poster; este é **documento**: folha clara,
serifada editorial, hierarquia por fio e posição. Carregar só quando a peça for Terra Clara.

Porquês, paleta verificada e o que já foi recusado: `decisoes.md`. Não abrir durante a produção.

## Esqueleto

Folha de 1080x1350, margem 96px, coluna única. Em toda folha: `.topo` (marca e perfil, fio duplo) e
`.pe` (rótulo da seção, trilho de progresso, fólio). Os dois saem prontos do template.

Tudo vive dentro de `.corpo`. Ancoragem:

| Classe | Quando |
|---|---|
| `.corpo` | Padrão: começa no alto e desce. Folha densa, como a conta |
| `.corpo.centro` | Bloco fechado que deixaria mais de um quarto da folha vazio |
| `.corpo.base` | Só em `.placa`, onde o texto encosta na parte forte do scrim |

Vazio grande embaixo lê como folha inacabada. É o erro mais comum aqui.

## Layouts

| | Folha | Como monta |
|---|---|---|
| **T1** | Capa | Com imagem: `.slide.placa`. Sem imagem: folha limpa em `.centro` |
| **T2** | Texto | `.titulo` + dois ou três parágrafos |
| **T3** | Placa de miolo | Igual à capa com imagem. Nunca duas placas seguidas |
| **T4** | Destaque | `.destaque` entre dois fios. Uma por peça |
| **T5** | Conta | `.livro` + `.soma` + `.soma-l` + `.legenda` com ref `Base` |
| **T6** | Cláusulas | `.clausula` com ordinal mono, quando o número é posição de verdade |
| **T7** | Anexo | `.figura` com `.img.print` + `.legenda` com ref `Fig. 1` |
| **T8** | Encerramento | `.titulo` + `.texto` + `.assinatura` |

## Imagem

Dois modos, e a escolha é curta: **foto de assunto vai em placa, captura de tela vai em anexo.**

**Placa.** A foto ocupa a folha inteira e os tokens trocam de lado sozinhos: o papel vira tinta
sobre o barro. Sempre os dois scrims (`.scrim-base` e `.scrim-rampa`), nunca só um, e nunca confiar
na foto ser escura.

- Assunto no terço superior ou no meio alto, porque o texto ocupa o terço de baixo.
- `background-position` escolhido na mão, nunca `center` por reflexo. Ver a miniatura depois de
  renderizar: foto que virou textura pede outro recorte.
- Foto quente, escura ou dessaturada funciona melhor. A peça já tem uma fonte de cor, que é a
  caneta terracota, e foto fria e saturada briga com ela.

**Anexo.** `.img.print` é `contain`: print entra inteiro, nunca cortado, porque cortar apaga
justamente a informação que fez o print existir.

## Escrita

Vale tudo que já vale no sistema escuro: `filtro-editorial.md` inteiro, zero travessão, regra das
duas fontes de número, nenhuma prova social. Muda o continente, não o padrão de escrita.

- **Ênfase:** afirmação em `<strong>` (600, tinta cheia), desenvolvimento em 400. Nunca gradiente,
  nunca cor no corpo.
- **Densidade:** 70 a 140 palavras por folha. O formato aguenta mais texto que o escuro, e é essa
  a vantagem dele. Folha de 40 palavras no meio de uma folha branca parece rascunho.
- **Grifo:** um por peça inteira, só no título, só numa palavra ou expressão. É a assinatura do
  sistema, no lugar do gradiente. Nunca engrossar até virar marca-texto.
- **Headline de capa:** de quatro a oito palavras. O resto do raciocínio desce para o lead.
- **Número:** a fonte fica colada embaixo dele, em `.soma-l` e `.legenda`, nunca numa margem.

## Montagem

```bash
D=conteudo/carrosseis/[tema]; S=.claude/skills/carrossel
cp $S/template-terra-clara.html $D/carrossel.html && cp $S/estilo-terra-clara.css $D/
```

O template traz uma folha por layout. Apagar as que a peça não usa, repetir as que ela usa mais de
uma vez, acertar fólio (`folha 03 / 07`) e a largura do `.preench` (folha dividida pelo total).

Não escrever CSS dentro da peça. Se faltou um componente, ele não existe: usar outro layout.

## Antes de renderizar

- Todo fólio e todo `.preench` batem com o total real de folhas.
- Um grifo na peça inteira, um destaque, e nenhuma placa seguida de outra placa.
- Todo número com fonte colada.
- Nenhuma folha com mais de um quarto vazio embaixo.

O detector da `/impeccable` acusa `oversized-h1` (título grande é o ponto) e `cramped-padding` (a
área segura vive em `position:absolute`, que ele não enxerga). Os dois são falso positivo conhecido
neste formato. Qualquer outro achado é para corrigir.
