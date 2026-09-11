# Decisões de design do carrossel, com o porquê

Registro histórico. **Não é leitura de produção**: nada aqui é instrução de execução, e a skill não
carrega este arquivo durante um carrossel. Abrir só quando alguém quiser mudar uma decisão que já
foi tomada, ou entender por que o sistema é como é.

As regras que valem na hora de produzir estão em `design-system.md`.

---

## Por que divergimos do método original da BrandsDecoded

1. **Fonte.** O original usa Plus Jakarta Sans no corpo e condensada pesada uppercase na headline.
   Aqui é Schibsted Grotesk na peça inteira, headline em 800 e caixa de frase. As peças reais da
   marca usam família única, e é isso que faz o feed parecer de uma marca só. Plus Jakarta Sans
   também está na lista de faces saturadas do detector da `/impeccable`.
2. **Gradiente no texto.** O original proíbe. A marca usa, e é a assinatura dela. Liberado só na
   headline e no número de resultado, com todos os stops verificados em contraste.
3. **Tag acima do título.** O original pede em todo slide. É eyebrow, proibido pelo design guide e
   pela `/impeccable`. Ela vive no rodapé, ao lado da barra de progresso.
4. **Borda lateral colorida em card.** Proibida nos dois lados. Card leva borda de 1px.
5. **Fontes em base64.** Desnecessário: o `render-carrossel.js` espera `document.fonts.ready`.
6. **Ancoragem no terço inferior.** O original manda ancorar tudo embaixo. As peças reais da marca
   preenchem o canvas, e zona morta grande no topo é o erro mais visível do formato.

**Como as peças de referência entraram aqui.** Elas não são molde. Delas vieram duas coisas, e só
duas: a integração de imagem (caixa arredondada, foto de fundo com escurecimento) e a forma de
escrita chamativa (diagramação de ênfase, headline em gradiente). Todo o resto, cor, rodapé,
estrutura e tom, segue o que já estava no `design-guide.md` e no `PRODUCT.md`.

---

## L7, o split: por que o painel é escuro (2026-09-10)

A primeira versão preenchia o painel com `--g2` sólido e texto quase preto por cima. Ficou com cara
de bloco de cor de template, e a marca não usa acento como preenchimento grande em nenhum outro
lugar, só em texto, ícone e borda. Trocado por painel escuro com o rótulo em gradiente, que é o
mesmo tratamento da headline e mantém a peça inteira em preto com um acento só.

---

## Paleta Terra: como chegou no que é hoje (2026-09-11)

Teste iniciado a pedido do Alvaro, pra alternar com o Azul entre posts. Passou por duas rodadas: a
primeira só recoloriu os tokens do Azul, a segunda puxou mais pro terra e trocou a fonte da
headline. A segunda é a que ficou.

**Fundo e contraste.** O piso do gradiente cai de 4,7:1 (Azul) pra 4,2:1 porque o marrom escurece
mais rápido que o preto neutro pra mesma sensação de profundidade. Continua folgado sobre o piso de
3:1 de texto grande, e a headline em 76-98px nunca cai nesse critério. Scrim, atmosfera, glow e
placeholder de imagem seguem a cor de `--bg` em vez do preto frio original, pra não voltar um viés
azulado por trás da paleta quente.

**Tri-stack de família.** Pesquisado via `ui-ux-pro-max`
(`search.py "warm editorial bold display" --domain typography`): entre as paletas quentes do banco,
**Calistoga** foi a face que mais repetiu em buscas por "warm, editorial, bold, human warmth". Virou
display serifado rústico só na headline e no rótulo do split, peso único da própria fonte. Pro
corpo, marca e rodapé, o banco só oferecia parceiros já banidos (Inter, Roboto) ou infantis demais
(Nunito, Quicksand) pra conversar com o Calistoga, então a escolha veio de fora do banco, por
parentesco de registro: **Libre Franklin**, herdeira do Franklin Gothic americano, tem a mesma raiz
de letreiro utilitário do século passado que o Calistoga cita, então lê como parente e não como
importação. Números continuam IBM Plex Mono.

**Glow.** Testada uma versão em banda de horizonte (duas camadas de radial simulando a luz onde o
campo encontra o céu), e ficou destoando forte perto do Azul na comparação lado a lado. Voltou pra
mesma geometria do glow original, só recolorida e um pouco mais discreta (.10 em vez de .13, porque
a cor quente lê mais presente que a fria no mesmo alpha).

`design-guide.md` continua com o azul como acento oficial da marca. Terra não substitui isso, é
alternativa em teste dentro da skill, registrada como nota separada lá.

---

## Consolidação dos templates (2026-09-11)

Antes existiam `template.html` e `template-terra.html`, dois arquivos de 16 a 18KB com o mesmo corpo
e o mesmo CSS, divergindo em cerca de 25 declarações. Manter os dois em dia era convite a drift, e
cada peça gerada carregava o CSS inteiro embutido.

Agora o CSS mora em `estilo.css`, com o Azul em `:root` e o Terra num bloco
`[data-paleta="terra"]` que só sobrescreve o que muda. O template virou só marcação, e trocar de
paleta é trocar um atributo no `<html>`. A barra de marca (e, no formato tweet, o cabeçalho inteiro)
saiu da marcação e virou pseudo-elemento alimentado por variável, então o handle tem um lugar só pra
ser editado em vez de nove.
