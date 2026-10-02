# registros.md: o manual do diretor (v2)

Ler ANTES de escrever o plano de cenas. Isto substitui "escolher um objeto por frase" por "escolher um
TIPO de cena por ideia". Veio do estudo de motion editorial (skill motion-vox do Edit Labs) aplicado ao
nosso motor, e foi confirmado no reel `imposto-de-prateleira`: 20 cenas de ícone seguidas, nenhum
objeto repetido, e mesmo assim o vídeo lia como uma cena só.

## Regra-mãe

**Mostrar a prova, apontar o detalhe, concluir. Nessa ordem.** Movimento acompanha raciocínio: nada se
mexe só pra "dar dinâmica".

**Toda cena e toda animação encena o que a voz diz naquele trecho**, minimalista ou não. Não basta
combinar com o tema do reel: tem que se encaixar, de forma clara, na frase que está sendo dita. Por isso
cada cena (e cada forma do mundo de pontos) leva `encena`, uma frase dizendo o que o visual mostra da
fala; o validador barra cena sem ele e o roteiro de aprovação mostra a frase ao lado da âncora. Se você
não consegue escrever o `encena` sem forçar, o visual está errado, não a frase.

**Duas perguntas antes de escolher o visual de cada ideia** (método do pontilhismo):
1. O que a pessoa precisa **VER** para entender isso? (não "o que combina com isso")
2. Como esta cena **nasce** da anterior? (corte com sentido, morph de pontos, prova que abre)

**Antes das cenas, o mapa** (vai no topo do roteiro de aprovação, 3 linhas): o **objetivo** (o que o
espectador entende no fim), a **transformação de percepção** que estrutura a fala (de "ferramenta parada não
custa" pra "toda ferramenta instalada cobra em toda mensagem") e o **arco**: gancho → contexto →
desenvolvimento → evolução → resolução → síntese. O arco é flexível: não force conflito ou promessa que o
conteúdo não tem. Cada cena leva `funcao` com a sua etapa; uma cena sem etapa clara costuma ser enfeite.

## Verbo visual: da fala pra ação

O que a fala FAZ decide a ação visual, não o substantivo que ela cita. Referência, não fórmula:

| Verbo da fala | Ação que o espectador vê | Onde está no motor |
|---|---|---|
| começar | algo emerge do vazio | poeira → forma; herói já em voo (`PRE`) |
| organizar | o disperso se alinha | nuvem/poeira → `grupos`, `onda` |
| conectar | o separado se liga | `rede`; `pipeline` |
| simplificar | o desnecessário some, sobra o essencial | `grupos` 34 → 3; `densidade` menor |
| priorizar | um se destaca, o resto recua | `destaque`/`acento`; marca-texto na `prova` |
| acumular | unidades se somam | `counter` com `evento`; `grupos` crescendo |
| crescer | expande | `barras`, `faixa`, `chart` |
| evoluir | um estado vira outro | morph de pontos (mesma matéria) |
| romper, conflitar | choque, dispersão | `explosao`, forma → `nuvem` |
| progredir | a sequência se completa | `checklist`, `pipeline` |
| repetir | ciclo | `anel`, `tunel` |
| libertar | a restrição some, o espaço abre | `galaxia`, câmera `longe` |
| concluir | converge e estabiliza | forma final; `push`; `"final": "mergulho"` |

Prefira a metáfora que pede menos esforço pra entender, que permite transformação legível e que conversa com
as cenas vizinhas. Símbolo genérico só quando nada mais específico existe.

## Os registros

| Registro | Visuais | Quando usar | O que carrega |
|---|---|---|---|
| **tipográfica** | `tipografica` | a frase É a imagem: gancho, virada, conceito nomeado, número de fecho | a própria frase (`text`, `*palavra*` = acento). A legenda cala nesta cena |
| **dado** | `counter`, `faixa`, `barras`, `chart` | número VERIFICÁVEL dito na fala | o número, pousando na palavra (`evento`) |
| **prova** | `prova`, `logo` | paper, notícia, print, painel real; marca citada pelo nome | o documento real com marca-texto na palavra; o logo oficial |
| **tela** | `code`, `device`, `typing` | "o agente faz", comando, mecanismo de software | linhas REAIS do assunto, nunca lorem |
| **processo** | `pipeline`, `gears`, `funnel`, `checklist` | "de X pra Y", método, etapas, automação | a transformação |
| **animação** | `animacao` (Lottie, ver `animacoes.md`) | substantivo ou ação concreta que ganha com movimento de animador | ilustração animada recolorida pra marca; o pico pode cair na palavra |
| **objeto** | heróis de objeto real (`coins`, `key`, `lightbulb`...) e `object` (catálogo de 50) | substantivo concreto da fala | a coisa, reconhecível na hora |
| **ícone** | `icon`, `svg` | substantivo sem herói pronto | no máximo 3 por reel (o validador avisa) |
| **atmosfera** | `grid`, `crowd`, `ripple`, `orbit`, `radar`, `brain`, `constellation`... | ideia ampla, "o mundo", "todos", respiro entre blocos densos | clima, não informação |
| **marca** | `orb`, `hero3d` | abertura/fecho da marca, pausa de virada | a assinatura visual |
| **vídeo** | `video` | ação ou lugar que a fala descreve (balcão, telefone, estoque) | B-roll real (ver `broll.md`) |
| **pontos** | `mundo` (ver `pontos.md`) | contagem que muda (34 → 3), transformação de uma coisa em outra, conceito abstrato (conexão, escala, tempo), fio que costura cenas | um conjunto de pontos contínuo que morfa na palavra; cada forma com seu `encena` |

## As regras que o validador cobra (scripts/plano.mjs)

1. **Nunca o mesmo registro em cenas vizinhas.** Exceção: **rajada**, quando a fala LISTA coisas em
   sequência ("a assinatura... a licença... o relatório..."). Aí até 3 cenas do mesmo registro (objeto,
   ícone, prova ou animação) entram trocando por `"transicao": "flash"`. Lê como ritmo, não como repetição.
2. **Nunca o mesmo objeto duas vezes no reel.** Templates (dado, prova, tela, tipográfica) podem voltar
   com outro conteúdo.
3. **Cena entre 1,2s e 5s.** Abaixo de 0,8s é erro (ninguém lê). Acima de 5s, decupe: uma ideia por
   beat, na ordem da fala, com corte no silêncio.
4. **Todo dado tem `evento`**: a palavra em que o número pousa. Contador que chega em 32 quando a voz
   diz 34 é o defeito que esta versão existe pra matar.
5. **Ênfase rara:** no máximo 2 palavras de acento no reel (`enfase` da legenda + `*acento*` das
   tipográficas). Na referência medida, 94% das linhas são brancas.
6. **Objeto do catálogo com nome certo** (`credit-card`, não `card`). Nome errado caía numa esfera
   genérica sem aviso; agora é erro, com a lista de opções.

## Julgamento que script não mede (você responde, por escrito, na prancha)

- **Um dominante por cena.** Desfoque o quadro na cabeça até sobrar mancha: se sobram duas manchas do
  mesmo peso, a cena não tem assunto.
- **O visual ENCENA a frase ou só se associa a ela?** Quem não lê o texto entende o conceito? "Paper
  mediu o custo" com ícone de documento é associação; o paper real com o trecho riscado é encenação.
- **Nome citado pede prova real, não símbolo.** Ferramenta, empresa, estudo: logo oficial
  (`scripts/logo.mjs`) ou captura da página (`scripts/captura.mjs`). Símbolo genérico só quando a
  identidade não está confirmada.
- **A cena acrescenta camada nova?** O mesmo conceito mostrado de novo sem informação nova se corta
  (callback de propósito é outra coisa: a mesma forma volta TRANSFORMADA).
- **A troca tem motivo?** Pra cada transição, uma resposta curta a "por que esta imagem vira a próxima?".
- **O fecho é consequência?** A última imagem resume o que o desenvolvimento construiu, não um enfeite novo.
- **Texto de cena nunca repete a fala.** A fala mora na legenda. No visual só entra número, nome ou
  termo (`sub`, `unidade`, `fonte`). Se o contador mostra 34, a legenda daquela cena pode calar
  (`"legenda": false`).
- **Fato ≠ estimativa.** Número que o falante afirma e dá pra checar vai limpo (`counter`, `barras`,
  `faixa`). Estimativa ("uns 30%") não vira gráfico: vai na legenda, ou numa tipográfica com "~".
  Casa com a regra do workspace de separar fato, interpretação e especulação.
- **Faixa não é contador.** "De 50 a 280" é `faixa`; um contador subindo de 0 diz "cresceu", que é
  outra ideia.

## Pontos: quando entra e quando perde

O mundo de pontos é o registro da **continuidade**: a ideia seguinte nasce dos pontos da anterior. Usar quando
a fala transforma uma coisa em outra ("34 ferramentas... 11 nem eram minhas... sobraram 3"), quando o
conceito é abstrato e não tem prova fotografável (conexão, escala, tempo passando) e como fio entre blocos
de prova (o mundo some na prova e volta já na forma nova). Hierarquia quando competem pela mesma frase:
**prova real > dado verificável > pontos > animação > objeto > ícone.** Nome citado pede o logo real (`logo`
de prova, ou `"forma": "logo"` em pontos se a cena é de transformação). Pontos não substituem a prova: o
paper que mediu o custo aparece como paper.

Regras próprias (o validador cobra as mensuráveis, `pontos.md` tem o detalhe):
- **Uma ideia = uma forma.** Repetir forma só quando é a mesma coisa voltando (callback de propósito).
- **Frase curta, morph curto** (0,3 a 0,5s); cada forma fica ~1s inteira formada antes da próxima.
- **A cena de mundo abre legível:** no primeiro segundo já há forma, não nuvem.
- **Câmera viva, mas a serviço:** órbita em escala/conexão, vista de cima em grade/onda, mergulho pra fechar.
- **Acento num aglomerado só** (o que a fala aponta) e conta no teto de 2 do reel.
- Duas cenas de mundo vizinhas são uma cena só: ponha as formas como chaves dentro dela.

## Ligação entre cenas: por que esta imagem vira a próxima?

Toda troca responde essa pergunta. Mecanismos, do mais conectado ao mais neutro:
1. **Morph de pontos:** a mesma matéria vira a ideia seguinte (as 34 bolhas viram o número).
2. **Callback/match:** forma, posição ou escala que volta (as bolhas da abertura voltam pro "de 34 pra 3").
3. **Câmera:** aproximar, orbitar ou afastar revela a camada seguinte (dentro do mundo, `cameras`).
4. **Composição e cor:** o elemento principal no mesmo lugar da tela entre as duas cenas.
5. **`fundir`:** o padrão quando não há relação direta. É o piso da ligação, não o teto: se existe uma das
   relações acima, use-a; não invente morph entre coisas sem parentesco.
6. **`corte`:** revelação de impacto, de propósito. **`flash`:** rajada de lista. **`push`:** fechar.

Quando der, termine a cena com o que a próxima aproveita (a forma que sobra, o lugar do olhar).

## Transições (campo `transicao` da cena = como ELA entra)

| Valor | Efeito | Quando |
|---|---|---|
| `fundir` (padrão) | dissolução de 0,3s: a cena que sai continua viva por baixo e a que entra surge por cima, com desfoque que resolve e leve aproximação | quase sempre. Liga uma ideia na outra sem tranco (pedido do Alvaro em 01/10/2026: o corte seco lia como solavanco) |
| `corte` | corte seco no silêncio antes da palavra-âncora | só de propósito: a revelação que precisa de impacto (um número que cai, uma virada) |
| `flash` | desfoque com clarão leve (0,4s; suavizado em 01/10/2026) | rajada de lista (obrigatório nela), troca brusca de bloco |
| `push` | a cena anterior acelera pra dentro e o corte cai na velocidade | fechar uma ideia; a última cena |

Sem flip e sem deslize lateral: liam como PowerPoint. Push seguido de push vira tique (avisado). A legenda
não entra nessa regra: ela continua cortando seco na palavra (é cadência de leitura, medida). Plano com
`"legado": true` mantém o corte como padrão, pra re-render sair igual ao aprovado.

## Tempo e movimento (o motor já faz; não brigar com ele)

- O herói já está em voo no 1º quadro (o visual roda 8 quadros antes do corte).
- Câmera lenta de 0 a 4% por cena. Câmera e objeto não empurram juntos.
- Todo elemento central fica pelo menos 1s inteiro resolvido na tela antes de sair.

## Refrão de série (opcional, forte)

Uma unidade visual que se repete idêntica entre reels vira a medida da série (no estudo Porsche, a
mesma ficha aparece seis vezes). Para a Anti Custos, candidata natural: uma cena `barras` ou `faixa`
de "custo por mês" sempre no mesmo formato. Decidir com o Alvaro antes de fixar. Outra candidata, desde
01/10/2026: o fechamento em pontos com `"final": "mergulho"` (a câmera mergulha e o reel termina no escuro,
o replay emenda sem costura).
