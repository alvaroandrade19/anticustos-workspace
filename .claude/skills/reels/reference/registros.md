# registros.md: o manual do diretor (v2)

Ler ANTES de escrever o plano de cenas. Isto substitui "escolher um objeto por frase" por "escolher um
TIPO de cena por ideia". Veio do estudo de motion editorial (skill motion-vox do Edit Labs) aplicado ao
nosso motor, e foi confirmado no reel `imposto-de-prateleira`: 20 cenas de ícone seguidas, nenhum
objeto repetido, e mesmo assim o vídeo lia como uma cena só.

## Regra-mãe

**Mostrar a prova, apontar o detalhe, concluir. Nessa ordem.** Movimento acompanha raciocínio: nada se
mexe só pra "dar dinâmica".

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
- **Texto de cena nunca repete a fala.** A fala mora na legenda. No visual só entra número, nome ou
  termo (`sub`, `unidade`, `fonte`). Se o contador mostra 34, a legenda daquela cena pode calar
  (`"legenda": false`).
- **Fato ≠ estimativa.** Número que o falante afirma e dá pra checar vai limpo (`counter`, `barras`,
  `faixa`). Estimativa ("uns 30%") não vira gráfico: vai na legenda, ou numa tipográfica com "~".
  Casa com a regra do workspace de separar fato, interpretação e especulação.
- **Faixa não é contador.** "De 50 a 280" é `faixa`; um contador subindo de 0 diz "cresceu", que é
  outra ideia.

## Transições (campo `transicao` da cena = como ELA entra)

| Valor | Efeito | Quando |
|---|---|---|
| `corte` (padrão) | corte seco no silêncio antes da palavra-âncora | quase sempre. O corte É a revelação |
| `flash` | desfoca e estoura em claro (0,4s), resolve na próxima | troca de prova, rajada de lista, virada de bloco |
| `push` | a cena anterior acelera pra dentro e o corte cai na velocidade | fechar uma ideia; a última cena |

Sem flip e sem deslize lateral: liam como PowerPoint. Push seguido de push vira tique (avisado).

## Tempo e movimento (o motor já faz; não brigar com ele)

- O herói já está em voo no 1º quadro (o visual roda 8 quadros antes do corte).
- Câmera lenta de 0 a 4% por cena. Câmera e objeto não empurram juntos.
- Todo elemento central fica pelo menos 1s inteiro resolvido na tela antes de sair.

## Refrão de série (opcional, forte)

Uma unidade visual que se repete idêntica entre reels vira a medida da série (no estudo Porsche, a
mesma ficha aparece seis vezes). Para a Anti Custos, candidata natural: uma cena `barras` ou `faixa`
de "custo por mês" sempre no mesmo formato. Decidir com o Alvaro antes de fixar.
