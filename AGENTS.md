# Anti Custos | Claude Code OS

## O que é esse workspace

Workspace de trabalho da Anti Custos, negócio do Alvaro de Andrade que presta serviços de IA para pequenas e médias empresas. Aqui vive tudo que gera e sustenta demanda: conteúdo para redes, propostas comerciais, apresentações e o material de cada cliente.

**Estrutura de pastas:**
- `_contexto/`: memória do sistema (não apagar)
- `clientes/`: uma pasta por cliente, criada a partir de `_modelo-cliente/`
- `conteudo/`: produção de conteúdo, dividida em `carrosseis/`, `reels/`, `roteiros/`, `linkedin/` e `ideias.md`. Carrossel sai da skill `/carrossel`, uma pasta por peça. Post de LinkedIn sai da skill `/postar-linkedin`, que escreve e publica pela API oficial, uma pasta por post. Reel de Instagram sai da skill `/reels`, uma pasta por vídeo em `conteudo/reels/<slug>/` com `<slug>.mp4`, `plano.json` e `legenda.md`; o áudio de entrada, quando a legenda vem da voz do Alvaro, fica em `dados/audio/`. A peça anda por três estados e as skills movem a pasta sozinhas: fica em `carrosseis/` ou `linkedin/` enquanto está em produção, vai para `conteudo/agendado/<rede>/` quando entra na fila e para `conteudo/publicado/<rede>/` quando sai no ar, sempre com um `_estado.md` dentro registrando link, horário e origem. Não mover essas pastas à mão. O Worker que publica roda na Cloudflare e não alcança este disco, então quem faz a passagem de agendado para publicado é `node scripts/sincronizar-publicacoes.js`, que a skill `/iniciar` roda no começo de toda sessão. A Fila de `ideias.md` também pode ser alimentada pela skill global `/curadoria-x` (curadoria de threads de IA numa X List, via API paga da X com teto de gasto mensal), que mora fora deste projeto em `~/.claude/skills/curadoria-x/`. A mesma Fila também recebe da skill global `/curadoria-youtube` (`~/.claude/skills/curadoria-youtube/`), que lê os uploads recentes dos canais acompanhados, diz o que vale assistir e baixa transcrição só do vídeo escolhido, tudo de graça e sem chave de API
- `propostas/`: propostas que ainda não têm cliente definido ou que servem de modelo
- `apresentacoes/`: decks comerciais e institucionais
- `marca/`: identidade visual, `design-guide.md` e arquivos de logo
- `dados/`: arquivos para análise (CSV, PDF, imagem, print)
- `criativos/referencia/`: referências visuais de criativos de outras contas que valem de inspiração pra quando formos construir peça nova (estilo, composição, tipo de gancho visual). Não é padrão a seguir, é banco de ideias pra consultar
- `templates/skills/`: templates de skills prontos pra personalizar com /mapear
- `templates/ferramentas/catalogo.md`: APIs e ferramentas disponíveis pra usar em skills
- `tarefas.md`: lista de tarefas corrente

## Sobre o negócio

A Anti Custos vende implementação de IA para PME com uma promessa específica: cortar custo operacional e trazer previsibilidade, não "inovação" genérica. O negócio está em fase inicial, sem clientes fechados e sem audiência construída. O conteúdo orgânico em Instagram e LinkedIn é a principal aposta de aquisição no momento.

O escopo atual (conteúdo, proposta, apresentação) é ponto de partida. A oferta pode expandir para outras funções, então não tratar essa lista como limite.

## O que mais fazemos aqui

- Conteúdo para Instagram e LinkedIn: carrossel, roteiro, post de texto
- Propostas comerciais para PME
- Apresentações e decks de venda
- Material de diagnóstico e escopo para conversas com prospect

## Clientes e contexto

Clientes externos, pequenas e médias empresas. Ainda nenhum fechado. Alvaro trabalha solo e acumula todas as funções: prospecção, produção de conteúdo, proposta, entrega.

Quando o primeiro cliente entrar, criar `clientes/[nome-cliente]/` copiando `clientes/_modelo-cliente/`.

## Tom de voz

Direto, mas não superficial. Profundo, mas não prolixo. Tese clara logo no começo, raciocínio próprio, distinção entre fato, interpretação e especulação. Quando houver várias possibilidades, hierarquizar e recomendar em vez de listar tudo no mesmo peso. Em assunto criativo, fazer escolhas fortes em vez de entregar opções genéricas. Responder também à pergunta implícita: o que isso realmente significa.

**Regra dura: nunca usar travessão.** Vírgula, dois-pontos, parênteses ou frase curta no lugar. Vale para qualquer output, incluindo peça visual, proposta e post.

Evitar tudo que denuncia texto de IA. Lista completa de clichês e detalhe de estilo em `_contexto/preferencias.md`.

## Ferramentas conectadas

Ferramentas em uso: Google Drive, Instagram, LinkedIn, Canva, WhatsApp Business, Meta Ads.

LinkedIn e Instagram já publicam direto pelas APIs oficiais, de graça: LinkedIn pela skill `/postar-linkedin`, Instagram pela `/publicar-social-ratos` (Graph API, conta `anticustos.ia`). Credenciais no `.env`, tokens de 60 dias nos dois casos. As duas redes agendam post num Worker da Cloudflare com cron, também de graça, publicando com o computador desligado: são dois Workers separados, um por skill, cada um com seu KV. A API do Instagram não tem agendamento nativo (o container de mídia expira em 24h), então o Worker guarda a fila e só cria o container na hora de publicar. Publicar no Instagram sobe a imagem antes pro R2 da Cloudflare (Worker `anticustos-imagens`), porque a API só aceita URL pública, e imagem acima de uns 2MB precisa passar pelo `otimizar.js` antes. A mesma imagem sobe também pro imgbb.com como reserva, e as duas URLs viajam na fila: se a Meta recusar a principal na hora de publicar, o Worker troca sozinho sem perder o horário. Vídeo de Reels segue indo pro catbox.moe. Essa redundância não é zelo excessivo: em dois dias seguidos, 15 e 16/09/2026, dois hosts gratuitos diferentes derrubaram publicação agendada, o catbox por bloqueio da Meta e o imgbb por queda do CDN, e nos dois casos o upload deu certo e o erro só apareceu quando a Meta tentou baixar. O resto ainda não tem conector instalado. A lista do que configurar está em `tarefas.md`.

**Distribuição por canal:** Instagram publica pela página da Anti Custos. LinkedIn publica pelo perfil pessoal do Alvaro, por alcance orgânico. Isso muda a escrita, não só o destino: post de LinkedIn é em primeira pessoa do singular. Detalhe em `.claude/skills/postar-linkedin/references/voz-linkedin.md`.

---

## Como este workspace é organizado

`AGENTS.md` é a fonte de instrução (este arquivo), `CLAUDE.md` tem só `@AGENTS.md` e nunca recebe conteúdo. Skills ficam em `.claude/skills/<nome>/SKILL.md`, e a ponte `.agents/skills` (junction, fora do git) faz o Codex enxergar as mesmas skills automaticamente.

## Cloudflare: teto do plano grátis é regra inegociável

O cartão do Alvaro está vinculado à conta, então estourar o plano grátis vira cobrança de verdade. Nenhuma alteração pode nascer sem caber no teto, e "provavelmente cabe" não vale: a conta é uma só, e as cotas são da conta inteira, não por Worker.

**Os tetos que importam:** KV tem 1.000 escritas e 100 mil leituras por dia, e é o mais apertado (dois Workers de fila já consomem parte). R2 tem 10GB de armazenamento, 1 milhão de escritas e 10 milhões de leituras por mês, com egress sem custo. Workers têm 100 mil requisições por dia.

**As travas que já existem, que não devem ser removidas:** o bucket `anticustos-imagens` apaga sozinho objeto com mais de 30 dias (regra de ciclo de vida gravada por `deploy-worker-imagens.js`), o Worker de imagem recusa upload sem `content-length` ou acima de 10MB, e o `fila.js` avisa se o bucket passar de 1GB. A imagem publicada não precisa sobreviver: a Meta baixa e re-hospeda na hora da publicação, o link do R2 só precisa durar aquele instante.

**Antes de somar qualquer coisa nova na Cloudflare** (bucket, namespace, Worker, cron mais frequente), calcular o consumo por mês e dizer o número. Se a conta chegar perto do teto, a resposta é reduzir o consumo, nunca subir de plano sem falar.

## Roteamento de modelo

Opus é o padrão da thread principal, por decisão. Ao despachar subagente, escolher pelo trabalho, não por reflexo:

- **Haiku:** trabalho mecânico e verificável (listar arquivo, contar, checar status, coletar dado bruto, aplicar edição já especificada).
- **Sonnet:** leitura e síntese de escopo médio, revisão, rascunho que ainda vai passar por edição.
- **Opus:** decisão de arquitetura, texto que vai pro cliente, julgamento editorial, qualquer coisa em que errar custa retrabalho.

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (se existirem e estiverem configurados):

1. `_contexto/empresa.md`: quem é o usuário, o que faz, como funciona o negócio
2. `_contexto/preferencias.md`: tom de voz, estilo de escrita, o que evitar
3. `_contexto/estrategia.md`: foco atual, prioridades, o que pode esperar
4. `_contexto/agora.md`: contexto vivo, onde paramos, decisões recentes, pendências (atualizado a cada sessão)

Usar essas informações como base pra qualquer resposta ou decisão. Ao sugerir prioridades, formatos ou abordagens, considerar o foco atual descrito em `estrategia.md`.

Para qualquer tarefa visual (carrossel, proposta, slide, landing page), consultar `marca/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

---

## Trabalho visual

Qualquer peça visual (carrossel, story, proposta, slide, landing page, post): **ler `marca/design-guide.md` antes de construir** e não inventar cor, fonte, tamanho ou espaçamento fora dele. Ele é a única fonte para tipografia, neutros, acento e medidas de formato.

Roteamento: **carrossel de Instagram vai pela skill `/carrossel`**, nunca montado na mão. **Reel vai pela skill `/reels`**, que renderiza em Remotion com o tema `anticustos` (os tokens saem deste guia; a headline em Anton é exceção consciente, pela mesma razão do carrossel: tipografia cinética pede peso condensado). **Todo o resto vai pela `/impeccable`** (`shape`, depois `critique` e `audit`, depois `polish`).

**Consulta de dados de design:** a skill `ui-ux-pro-max` é uma base local pesquisável (estilos, paletas, pares tipográficos, 119 diretrizes de UX, padrões de landing, presets de animação, guias por stack). Não é etapa obrigatória do fluxo, é consulta sob demanda, e vale quando a decisão é aberta e o guia é omisso: estrutura de uma landing nova, padrão de UX de formulário, checagem de contraste, escolha de tipo de gráfico. Roda offline, sem API e sem dependência externa:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain <ux|style|color|typography|landing|chart|icons|gsap>
```

**Precedência quando discordam, do mais forte pro mais fraco:**

1. `marca/design-guide.md`, o brief. Cor, fonte, medida e formato saem daqui sempre. Paleta ou par tipográfico devolvido pelo `ui-ux-pro-max` não substitui o guia, serve no máximo de referência pra evoluir o guia numa decisão consciente.
2. `ui-ux-pro-max`, para estrutura, padrão de interação e acessibilidade onde o guia não fala.
3. `/impeccable`, para julgamento de execução e acabamento. A própria impeccable define que o brief vence as regras genéricas dela.

O `ui-ux-pro-max` entra como evidência, não como decisão pronta. Se a busca voltar vazia, dizer isso em vez de inventar resultado.

---

## Tráfego pago: nomenclatura de campanha

Padrão fechado em 2026-09-16, vale pra toda campanha de Meta Ads. Existe pra localizar campanha, conjunto e anúncio sem abrir nenhum deles, e pra fechar o rastro do anúncio até a conversa no WhatsApp. O procedimento de mídia (o que rodar, em qual ordem, quando cortar) fica em `Wiki/Gerencial/Tráfego Pago - Protocolo e Escala.md`, não aqui.

**Campanha:** `[OBJETIVO] [PRODUTO] [POSICIONAMENTO] [ORÇAMENTO] [TEMPERATURA] [FASE] [ESTRUTURA] [SEQ]`
Exemplo: `[TRÁFEGO] [DIAG] [INSTA] [CBO-30] [FRIO] [CT] [1-1-4] [01]`

**Conjunto:** `NN - [POSICIONAMENTO] [SEGMENTO] [FAIXA ETÁRIA]`
Exemplo: `01 - [INSTA] [Aberto] [25-55]`. O campo de segmento fica `Aberto` enquanto a fase for CT, porque público amplo é a definição da fase, e passa a carregar o interesse na fase de segmentação (`[Dentista]`, `[Contabilidade]`).

**Anúncio:** `CRIATIVO_NN`, com o número igual ao do arquivo em `criativos/` e igual ao `utm_content` do link. Exemplo: `CRIATIVO_07` para `criativos/7_feed.png` com `utm_content=criativo_07`.

**Dois campos mudam de valor conforme a fase e precisam ser mantidos honestos:** `FASE` usa o vocabulário do pipeline (`CT`, `SEGMENTAÇÃO`, `ESCALA`) e `ESTRUTURA` descreve a contagem real de campanha, conjunto e anúncio (`1-1-4` é uma campanha, um conjunto, quatro anúncios). Nome que não bate com a estrutura real perde a função de localizar.

**UTM padrão:** `utm_source=meta`, `utm_medium=paid-social`, `utm_campaign=<produto>-<fase>-<seq>` em minúsculo (`diag-ct-01`), `utm_content=<nome do anúncio em minúsculo>`. Vai dentro do link de destino do anúncio, nunca também no campo de parâmetros de URL do Meta, senão duplica.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe uma skill relevante em `.claude/skills/` (Claude Code) ou `.agents/skills/` (Codex).
Se encontrar, seguir as instruções da skill.
Se não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o padrão de repetição for claro.

---

## Manter a memória em dia

Dois gatilhos disparam isso, e os dois precisam ser reconhecidos:

**Gatilho 1, correção do usuário.** Ele corrige algo, melhora uma resposta ou dá instrução que soa permanente ("na verdade é assim", "não faça mais isso", "prefiro assim", "sempre que...", "evita...", "da próxima vez..."). Perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

**Gatilho 2, tarefa que mudou o projeto.** Terminou algo que alterou o estado real: novo cliente, nova skill, mudança de foco, novo processo, ferramenta instalada, estrutura de pastas mexida. Perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize os arquivos de memória?"

Se sim, em qualquer um dos dois casos, rotear assim:

| O que é | Onde salvar |
|---|---|
| Negócio, clientes, serviços, mercado, ferramenta nova | `_contexto/empresa.md` |
| Tom de voz, estilo, formato de resposta, o que evitar | `_contexto/preferencias.md` |
| Prioridade, foco atual, meta, prazo | `_contexto/estrategia.md` |
| Onde vai o quê, como nomear, fluxo desta pasta, skill criada | `AGENTS.md` |
| Cor, fonte, logo, medida | `marca/design-guide.md` |

Mostrar a mudança antes de salvar. Adicionar ou editar só a linha relevante, nunca reformatar o arquivo inteiro. Confirmar mostrando a linha.

**Quando NÃO perguntar:** correção óbvia do contexto imediato ("na verdade o arquivo se chama X"), tarefa pontual que não muda estado (um email, um post avulso), conversa sem ação.

**Dica:** na dúvida, rodar `/atualizar` pra uma varredura completa.

Existe também uma fonte externa de conhecimento gerencial: `Wiki/Gerencial/` no Obsidian Vault (`C:\Users\aandr\OneDrive\Documentos\Obsidian Vault\Wiki\Gerencial\`), com playbook de vendas, copy e do próprio negócio, escrito pra agente executar. Ainda em preenchimento. Rodar `/consultar-gerencial` pra cruzar com `_contexto/` e propor atualizações: fato de identidade (ICP, preço, oferta) só entra em `_contexto/` com aprovação explícita, e contradição nunca é resolvida sozinha. Referência de playbook (abaixo) a skill mantém sozinha, sem perguntar.

**Referências de playbook ativas** (mantidas automaticamente por `/consultar-gerencial` a cada página nova ou revisada no Gerencial):
- Proposta comercial, script de call, condução de venda: consultar `Wiki/Gerencial/Vendas - Prospecção, Call e Fechamento.md` (cadência, as 6 etapas da call, SPIN nas etapas 3 e 4) antes de escrever. **ICP e oferta desse arquivo são de clínica e não se aplicam aqui** (nosso ICP é PME genérica, preço é o de `estrategia.md`) — usar só a estrutura de processo, nunca os scripts por segmento, preço ou garantia de lá. A mesma ressalva vale para toda a camada Gerencial, cujo ICP mestre está em `O Negócio em Uma Página.md` (clínica, persona Dra. Camila, oferta Funcionário Digital 24/7™).
- Copy de carrossel, proposta, roteiro, post: consultar `Wiki/Gerencial/Copy - Estruturas em Uso.md` (pesquisa → nível de consciência → Big Idea/mecanismo → esqueleto + 10 perguntas → resistências → ganchos) antes de escrever peça.
- Funil de vendas, escada de oferta, isca de captura: consultar `Wiki/Gerencial/Funis - O que Usar e o que Não Usar.md` (book a call e squeeze como funis aprovados, isca sempre em vídeo, nunca PDF, um funil de cada vez até 100k de faturamento) antes de desenhar funil ou página de captura. ICP e o veredito de qual funil usar são de clínica; aproveitar só a estrutura de degraus e os critérios de escolha (CPA vs ACV, telefone + ligação rápida).
- Avaliação de anúncio ou campanha, quando Meta Ads entrar em uso: consultar `Wiki/Gerencial/Métricas e Diagnóstico.md` (faixas de CPM/CTR/hook rate, ordem de leitura do diagnóstico por etapa: principais primeiro, depois secundárias) antes de julgar performance. Benchmarks vêm de e-commerce e do MAV, não de dado próprio (vigência `provisorio`), servem como ordem de grandeza.
- Pauta, estrutura e cadência de post (Instagram, LinkedIn): consultar `Wiki/Gerencial/Conteúdo e Canal.md` (gancho → contexto → profundidade → conclusão → CTA, cadência de 4 a 7 posts por semana, venda mora no story, nunca no Reels) antes de planejar frequência ou formato. ICP de clínica não se aplica, mas o posicionamento de conteúdo descrito lá (mercado amplo, especialista em IA aplicada a negócios) é compatível com o nosso.
- Protocolo de tráfego pago, quando entrar verba: consultar `Wiki/Gerencial/Tráfego Pago - Protocolo e Escala.md` (pipeline CT → LT → segmentação, uma variável por vez, teto de 1.000 impressões por anúncio antes de decidir vencedor) antes de rodar a primeira campanha. Procedimento nunca rodado neste negócio nem no de origem (vigência `provisorio`).
- Regra de frase e auditoria de peça pronta: consultar `Wiki/Projeto/Voz e Estilo.md` (zero travessão, banir "não é X, é Y", lista numerada só quando for o ativo, conceito técnico com tradução no mesmo fôlego, dose de técnica por estágio do funil, teste de especificidade "cópia barata impulsionada por IA") antes de revisar peça pronta. **Persona (Álvaro ex-bancário), vocabulário próprio (Funcionário Digital 24/7™, Modo 1995) e exemplos de LinkedIn dessa página são da origem clínica e não se aplicam aqui** — usar só as regras de ofício. Página ainda sem aprovação humana no negócio de origem (30 dias de operação pendente).
- Passo a passo de prospecção e call com o porquê e a analogia de cada etapa: consultar `Wiki/Gerencial/Fluxo de Prospecção à Venda - Hormozi Aplicado.md` (22 passos do primeiro contato ao pós-venda, versão executável de `Vendas - Prospecção, Call e Fechamento.md`) antes de montar checklist de prospecção ou roteiro de call linha a linha. **Cenário e pronomes (clínica, "ela", marido/sócio) são da origem clínica e não se aplicam aqui** — usar só a estrutura dos 22 passos e o mecanismo de cada um.

---

## Criação de skills

Quando o usuário pedir pra criar uma skill nova, usar a skill `/criar-skill`, que carrega o procedimento completo.
