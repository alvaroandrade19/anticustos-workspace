# Agora: contexto vivo

> Este é o contexto que muda toda semana (diferente de `estrategia.md`, que é o foco de fundo).
> O `/iniciar` lê isto no começo da sessão; o `/atualizar` escreve aqui no fim.
> Mantenha curto: o que passou de ~30 dias sai daqui (vai pro histórico ou some).

## Onde paramos
Primeira campanha de tráfego pago montada e programada para entrar no ar em 17/09: `[TRÁFEGO] [DIAG] [INSTA] [CBO-30] [FRIO] [CT] [1-1-4] [01]`, R$30/dia, destino `/diagnostico`. Quatro criativos no teste (`3_feed`, `6_feed`, `7_feed` e `carrossel1`), com a copy de cada um escrita pela régua do `Wiki/Gerencial/Copy - Estruturas em Uso.md`. Os criativos 6 e 7 nasceram nesta sessão, dos ângulos de honestidade ("se o volume não justificar, eu digo isso no diagnóstico") e de isca do quiz. O lote antigo de 1 a 5 é de velocidade de resposta a lead, herdado de outra oferta, e só o 3 entrou no teste. Foi criada também uma variação com público de consultórios, aproveitando audiência que já rendeu boa taxa em teste antigo, e nela entraram as músicas recomendadas pelo Meta.

<!-- anterior -->
Skill `/carrossel` refatorada para consumo de token: CSS saiu do HTML e virou `estilo.css`, o template duplicado da paleta Terra foi eliminado e o histórico de decisões saiu do caminho da produção. Render conferido byte a byte contra a versão anterior nas três variantes. O sistema visual **Terra Clara** foi fechado e já é o terceiro formato da skill, em uso no carrossel `problema-do-milenio`, agendado para 16/09.

<!-- anterior -->
Carrossel do imposto de prateleira pronto e renderizado em `conteudo/carrosseis/imposto-de-prateleira/`, com legenda e rastreabilidade dos números. Próximo passo: publicar e medir. Primeira prova de primeira mão da marca registrada no PRODUCT.md: auditoria de 34 para 3 ferramentas, ~1.290 tokens a menos por mensagem.

<!-- anterior -->
Skill `/carrossel` criada, com o método editorial da BrandsDecoded adaptado à marca. A primeira versão do carrossel foi reprovada e o template novo está em `conteudo/carrosseis/custo-invisivel-v2/`. Próximo passo: rodar `/carrossel` de verdade num tema e publicar.

## Decisões recentes

- 2026-09-05: identidade visual definida como base dark com acento azul único, inspiração Apple. Carmim e rosa do site antigo (NEXUS AI) descartados.
- 2026-09-05: tipografia definida como **Schibsted Grotesk**, com IBM Plex Mono para número. Inter saiu primeiro, Geist entrou e também saiu: o detector da `/impeccable` lista as duas como faces saturadas por peça gerada por IA. Schibsted passa limpa no detector.
- 2026-09-05: neutros passaram a ter viés azul. Cinza puro como texto secundário está fora.
- 2026-09-05: botão primário usa `#1D4ED8`, não `#2563EB`. Branco sobre `#2563EB` dá 4,1:1 e reprova em contraste AA.
- 2026-09-05: `.gitignore` alterado para versionar o trabalho (`clientes/`, `conteudo/`, `propostas/`, `tarefas.md`) e as skills criadas localmente. Continuam ignorados `.env`, `dados/*` e `*.png`.
- 2026-09-05: skill `/impeccable` instalada por cópia do repositório, sem o instalador `npx` e **sem os hooks** que rodariam a cada edição. Decisão revisitável.
- 2026-09-05: `PRODUCT.md` criado. Público definido como dono de PME de serviço que opera dentro do negócio. Posicionamento definido como **operação assistida contínua**, não projeto avulso.
- 2026-09-05: stack delegada ao agente e decidida como HTML e CSS estático, sem build. Astro fica como troca natural se surgir site com muitas páginas.
- 2026-09-05: primeiro carrossel terá objetivo de alcance, não de conversão. Conversão vira uma segunda superfície, separada.
- 2026-09-05: preço definido. R$ 3.000 de instalação, cobrança única, mais R$ 1.500 por mês de recorrência, cobrindo manutenção no ar, atualização e proposta de melhorias.
- 2026-09-05: meta de capacidade definida em 20 clientes ativos, patamar em que entra contratação de equipe.
- 2026-09-05: a instalação de R$ 3.000 compra tempo de projeto (desenhar e montar a automação), não licença nem ferramenta.
- 2026-09-05: primeiro carrossel produzido. Ângulo escolhido: o custo da repetição escondido dentro do salário. Sem prova e sem hype, o ativo que gera alcance é ponto de vista próprio.
- 2026-09-05: fluxo de render definido. `node scripts/render-carrossel.js <html>` fatia cada `.slide` em PNG 1080x1350 em 2x, via Playwright.
- 2026-09-06: primeira versão do carrossel reprovada pelo Alvaro (design minimalista demais, resultado fraco).
- 2026-09-06: skill `/carrossel` criada a partir dos cinco documentos da BrandsDecoded, misturados com o design guide e o PRODUCT.md. Método editorial da BD mantido, identidade visual da Anti Custos por cima.
- 2026-09-06: exceção tipográfica aberta no design guide. Headline de carrossel usa Barlow Condensed 900 uppercase, porque o formato é julgado em miniatura no feed. Vale só para a headline.
- 2026-09-06: criada a regra das duas fontes de número, que é como a marca resolve não ter prova nenhuma: todo número é dado público com fonte, ou conta aberta com a base à mostra. Não existe terceira opção.
- 2026-09-06: handle definido, @anticustos.ia.
- 2026-09-06: identidade visual do carrossel corrigida a partir de dez peças reais que o Alvaro mandou. Três decisões minhas foram revertidas: Barlow Condensed uppercase saiu (as peças usam grotesca em caixa de frase), a regra do terço inferior saiu (as peças preenchem o canvas) e o azul deixou de ser o acento do carrossel.
- 2026-09-06: azul confirmado como cor primária. O gradiente da headline é #CDE8FF a #62A0FF a #4A72F0, do gelo ao azul saturado, com contraste de 15,6:1, 7,5:1 e 4,7:1. A família quente âmbar foi testada e descartada.
- 2026-09-06: rodapé do carrossel definido como rótulo da seção, barra de progresso e contador. A pílula "arraste para o lado" das referências foi descartada.
- 2026-09-06: gradiente em texto passou a ser permitido, contra o que o design guide e a /impeccable dizem, porque é a assinatura visual real da marca. Restrito à headline, com todos os stops verificados em contraste.
- 2026-09-06: borda lateral colorida grossa recusada. A proibição do design guide e da /impeccable vale, e o repertório da skill de referência que dependia dela ficou de fora.
- 2026-09-06: gradiente de fundo liberado como "atmosfera", só em slide sem imagem, com amplitude de 1,9x de luminância. Atmosfera e glow são mutuamente exclusivos: um slide recebe um ou outro, nunca os dois.
- 2026-09-06: formato tweet adicionado como alternativa pontual, de 3 a 5 slides, em `template-tweet.html` e `references/formato-tweet.md`. A skill pergunta o formato no começo e a escolha é do Alvaro.
- 2026-09-06: skill `carrossel-ratos` avaliada. Entraram dela: regra de escolha entre foto de fundo e caixa, `contain` para print e `cover` para foto, glow radial para slide sem imagem, realce de palavra com fundo claro, layouts de citação e split, e a exigência de o CTA parecer diferente dos demais.
- 2026-09-06: das peças de referência entraram duas coisas apenas, por decisão do Alvaro: integração de imagem (caixa arredondada e foto de fundo com scrim de duas camadas) e a escrita chamativa (diagramação de ênfase e headline em gradiente). O resto segue o que já estava definido.
- 2026-09-11: paleta **Terra** criada como alternativa em teste ao Azul, para alternar entre posts. Barro e terracota, headline em Calistoga e corpo em Libre Franklin. Não substitui o azul como acento oficial da marca, e só é usada quando o Alvaro pedir por nome.
- 2026-09-11: skill `/carrossel` otimizada em consumo de token, sem perda de funcionalidade. O CSS saiu de dentro do HTML e virou `estilo.css` (Azul em `:root`, Terra no bloco `[data-paleta="terra"]`), o que eliminou o `template-terra.html`, que era cópia quase integral do `template.html`. A barra de marca virou pseudo-elemento alimentado por `--nome` e `--handle`, então o handle tem um lugar só para ser editado em vez de nove. O histórico das decisões foi para `references/decisoes.md`, que não se lê durante a produção. O HTML que o agente escreve por peça caiu de 16,5KB para 7,9KB. Render conferido byte a byte contra a versão anterior nas três variantes, e o detector não acusou achado novo.
- 2026-09-11: quatro contradições internas da skill corrigidas no mesmo passo: o design system dizia seis layouts e listava oito, o SKILL dizia três falsos positivos do detector e listava quatro, o checklist pedia área segura de 150px embaixo contra os 130px da spec e do CSS, e o `formato-tweet.md` especificava peso 700 onde o CSS sempre usou 600.
- 2026-09-11: sistema visual **Terra Clara** fechado, terceiro formato da skill `/carrossel`, ao lado do Anti Custos e do tweet. Nasceu da proposta Papel (documento claro em vez de poster escuro) e parou no meio do caminho entre ela e a paleta Terra: folha clara `#F3EEE6`, serifada editorial, hierarquia por fio e posição, com o modo placa invertendo tinta e papel sobre barro. Os arquivos `*-papel.*` e a proposta renderizada foram deletados. Usa `.slide` como os outros formatos, então o `render-carrossel.js` fatia sem mudança, e o `SKILL.md` já oferece Terra Clara na pergunta de formato. Como a paleta Terra, só entra quando o Alvaro pedir por nome.
- 2026-09-16: teste de criativo estruturado pelo protocolo do Gerencial. Uma campanha, CBO, público amplo, os quatro criativos dentro do mesmo conjunto, desligando cada anúncio na mão ao bater a faixa de 1.000 a 3.000 impressões. A alternativa de separar públicos desde o começo foi descartada, porque audiência é a segunda variável e entra só depois de haver criativo vencedor.
- 2026-09-16: padrão de nomenclatura de campanha de Meta Ads fechado e gravado no `AGENTS.md`, em três níveis. O campo que antes acumulava gênero e segmento de interesse foi separado, porque carregava dois significados no mesmo lugar, e o gênero saiu por não carregar sinal para esse ICP.
- 2026-09-16: UTM vai dentro do link de destino do anúncio, nunca também no campo de parâmetros de URL do Meta, senão duplica. `utm_content` igual ao nome do anúncio em minúsculo, que por sua vez é igual ao número do arquivo em `criativos/`.
- 2026-09-16: variação com público de consultórios e músicas do Meta criada em paralelo, por decisão do Alvaro, com base em taxa boa em teste antigo. Consequência para a leitura: a comparação entre criativos vale dentro de cada conjunto, não entre conjuntos, porque público, música e provável distribuição de posicionamento mudam juntos.
- 2026-09-16: causa raiz de duas publicações de Instagram falhando achada. Desde 15/09 a Meta passou a recusar qualquer container de mídia apontando pra imagem hospedada no catbox.moe, com o erro genérico "An unknown error has occurred" (código 1, HTTP 500), em qualquer conta e qualquer imagem testada, provável bloqueio de domínio do lado da Meta. Não é bug no código nem na peça. Host de imagem trocado pra **imgbb.com** (`IMGBB_API_KEY` no `.env`), vídeo de Reels segue no catbox por ora. `problema-do-milenio` e `martir-de-quatro-meses` foram devolvidos, reagendados com o novo host e confirmados na fila: hoje (16/09) 19h30 e amanhã (17/09) 18h.
- 2026-09-16: no mesmo dia, o imgbb caiu no meio de uma publicação agendada: `api.imgbb.com` aceitando upload normal enquanto o CDN `i.ibb.co` recusava conexão, e a Meta respondendo "Only photo or video can be accepted as media type". Dois hosts gratuitos diferentes derrubaram post em dois dias seguidos. Três consequências: o **R2 virou o host principal** e o imgbb a reserva (infraestrutura nossa ganha de host gratuito de terceiro), a imagem passou a subir **nos dois hosts** com as duas URLs viajando na fila, e a **troca de host passou a acontecer na publicação**, não no upload. Esse último ponto é o que resolve de verdade: nas duas quebras o upload deu certo e o erro só apareceu quando a Meta tentou baixar, então fallback no upload nunca teria salvado nenhuma das duas.
- 2026-09-16: teto do plano grátis da Cloudflare virou regra escrita no `AGENTS.md`, porque o cartão do Alvaro está vinculado à conta. Travas implementadas: bucket apaga objeto com mais de 30 dias sozinho, Worker de imagem recusa upload sem `content-length` ou acima de 10MB, e o `fila.js` avisa se o bucket passar de 1GB. Consumo real de um carrossel: ~1,8MB e 9 escritas, contra teto de 10GB e 1 milhão de escritas por mês.
- 2026-09-16: R2 ativado no painel da Cloudflare e ligado como segundo host de imagem, redundância ao imgbb. Foi preciso trocar o `CLOUDFLARE_API_TOKEN`: o token antigo sumiu da lista de "Tokens de API" do painel (provável login em conta diferente da que criou o token original, nunca identificado ao certo), então um token novo foi gerado com as três permissões que os três Workers da conta precisam (Workers Scripts, Workers KV Storage, Workers R2 Storage, todas Edit). Testado sem regressão nos três: LinkedIn, Instagram e o `quiz-leads` da INLEAD continuam enxergando suas filas normalmente. Bucket `anticustos-imagens` e Worker `anticustos-imagens` criados via `deploy-worker-imagens.js`, `lib.subirImagem` confirmado caindo pro R2 quando o imgbb falha.
- 2026-09-16: bug secundário corrigido no `fila.js`: uma falha de publicação só saía do KV em sucesso, de propósito, mas isso deixava resultado velho sobrescrevendo o `_estado.md` de uma peça já reagendada, marcando como "falhou" algo que só ainda não tinha sido tentado de novo. `agendar.js` agora limpa `resultado:` do mesmo slug ao reagendar.

## Pendências

- Apurar o custo real de operação por cliente. A estimativa de R$ 500/mês nunca foi verificada, e ela decide se o lucro por cliente é R$ 1.000 ou bem menos.
- Nomear os entregáveis da instalação. Sabe-se que ela compra tempo de projeto, falta dizer o que o cliente recebe por escrito no fim.
- Definir se existe prazo mínimo de contrato. O modelo só fecha a partir do mês 3.
- Definir quais processos atacar primeiro dentro da PME de serviço.

- Rodar `/mapear` para criar as skills do dia a dia.
- Rodar `/syncar` para conectar ao GitHub.
- Configurar integrações. Lista em `tarefas.md`.
- Definir logo da Anti Custos e preencher o handle das redes em `marca/design-guide.md`.

## Quente agora

Campanha `diag-ct-01` no ar a partir de 17/09, primeira verba de mídia da história do negócio. O risco dominante agora é decidir cedo demais: o piso de leitura do protocolo é de 1.000 impressões por anúncio, e com oito anúncios dividindo a verba isso leva mais que os dois dias previstos. Leitura por etapa, CTR e custo por clique primeiro, início e conclusão do quiz depois. Comparecimento ainda não tem volume para significar nada, e não existe CPM próprio: toda estimativa de ritmo hoje é importada, e a primeira medição real substitui.

A restrição de fundo continua valendo em tudo: não existe prova nenhuma (nem case, nem número, nem cliente), e fabricar prova está proibido no `PRODUCT.md`. A única prova de primeira mão é a auditoria do próprio ambiente, de 34 para 3 ferramentas, e ela ainda não entrou em nenhuma peça.
