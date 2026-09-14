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

---

## Sistema Terra Clara: por que existe (2026-09-11)

Nasceu de uma proposta anterior, o sistema Papel, que foi descartada. Papel acertou o registro
(documento, não anúncio) e errou dois pontos: virou as costas para a imagem e distribuiu o texto
numa grade de duas colunas com marginália, que exigia leitura em zigue-zague e enchia a margem de
rótulo sem função. Terra Clara mantém a tese e conserta os dois.

**Por que um segundo sistema.** Três motivos, na ordem em que pesam:

1. A marca não tem prova social e está proibida de fabricar. O único ativo é aritmética aberta, e
   documento é o formato que faz aritmética parecer aritmética. Poster escuro faz aritmética
   parecer propaganda de aritmética.
2. O feed de IA inteiro é escuro com gradiente. O próprio `design-guide.md` já usa esse argumento
   para justificar superfície clara na hora de converter.
3. O sistema escuro comporta uma ideia por tela. Este comporta um argumento inteiro com conta,
   cláusula e anexo, porque diagramação de documento aguenta densidade sem virar poluição.

**A marginália do Papel foi removida.** O rótulo de margem repetia o que o título já dizia. O que
tinha função sobrou em dois lugares melhores: a fonte do número foi para baixo do número, que é o
que o `design-guide.md` já mandava, e a legenda de figura virou nota de pé de bloco.

**Cor.** Três voltas. Areia `#F1E9DE` (luminância 0,823), off-white `#F4F2EE` (0,889) e o papel
final `#F3EEE6` (0,859), que é o meio medido dos dois. O meio termo saiu do cálculo de luminância,
não do hex: luminância não é linear no valor hexadecimal.

A tinta é três, uma por nível tipográfico, e essa é a diferença mais sutil e mais útil do sistema:
título de capa `#2A1A0C` (14,53:1), título de miolo `#35281C` (12,36:1), corpo `#514D47` (7,27:1).
A hierarquia é lida por três canais ao mesmo tempo, tamanho, posição e temperatura, e a folha
respira sem precisar de mais peso.

A caneta `#8F4A24` (5,73:1) é a terracota `#AC6238` da paleta Terra escurecida até passar em corpo
de texto. A rampa original foi desenhada para brilhar sobre preto e desaparece sobre papel:
`#CD8552` sobre a folha dá 2,47:1. A família Terra entra aqui rebaixada em valor, não copiada.

Na placa, os tokens trocam de lado: o papel vira tinta sobre o barro `#110B07` (16,92:1). É o mesmo
par de cores nos dois papéis, e é isso que faz a folha de foto pertencer à mesma peça.

**Tipografia.** Newsreader carrega o argumento, com eixo óptico de verdade (`opsz`), que permite a
mesma face em 34px de corpo e 92px de capa sem parecer esticada. Libre Franklin, a sans da paleta
Terra, carrega a estrutura, e amarra este sistema àquele. IBM Plex Mono fica no número. A divisão é
conceitual: serifada é o que uma pessoa argumenta, o resto é o que a máquina registra.

**Capa: uma via recusada.** Foi testada e recusada uma capa de banda, com a imagem sangrando só no
topo e a headline sobre papel na metade de baixo. Fica registrado para não voltar à mesa. A capa
tem dois tratamentos e só dois: placa cheia quando há imagem, folha limpa quando não há.

**Divergências do `design-guide.md`**, todas conscientes e reversíveis:

1. Fundo claro no Instagram, contra o dark que é a base da marca. É a decisão mais séria, e foi do
   Alvaro. A capa com imagem é escura, o que dá ao feed um ponto de ancoragem no registro antigo.
2. Sem gradiente em texto. A assinatura vira o grifo de caneta.
3. Serifada no corpo, em vez de Schibsted Grotesk, porque argumento longo em grotesca vira
   relatório de software.
