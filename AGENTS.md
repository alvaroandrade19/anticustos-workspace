# Anti Custos | Claude Code OS

## O que é esse workspace

Workspace de trabalho da Anti Custos, negócio do Alvaro de Andrade que presta serviços de IA para pequenas e médias empresas. Aqui vive tudo que gera e sustenta demanda: conteúdo para redes, propostas comerciais, apresentações e o material de cada cliente.

**Estrutura de pastas:**
- `_contexto/`: memória do sistema (não apagar)
- `clientes/`: uma pasta por cliente, criada a partir de `_modelo-cliente/`
- `conteudo/`: produção de conteúdo, dividida em `carrosseis/`, `roteiros/`, `linkedin/` e `ideias.md`. Carrossel sai da skill `/carrossel`, uma pasta por peça. Post de LinkedIn sai da skill `/postar-linkedin`, que escreve e publica pela API oficial, uma pasta por post
- `propostas/`: propostas que ainda não têm cliente definido ou que servem de modelo
- `apresentacoes/`: decks comerciais e institucionais
- `marca/`: identidade visual, `design-guide.md` e arquivos de logo
- `dados/`: arquivos para análise (CSV, PDF, imagem, print)
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

LinkedIn e Instagram já publicam direto pelas APIs oficiais, de graça: LinkedIn pela skill `/postar-linkedin`, Instagram pela `/publicar-social-ratos` (Graph API, conta `anticustos.ia`). Credenciais no `.env`, tokens de 60 dias nos dois casos. Post agendado do LinkedIn roda num Worker da Cloudflare com cron, também de graça, e publica com o computador desligado. O Instagram ainda não tem agendamento: a Content Publishing API não oferece agendamento nativo e o container de mídia expira em 24h, então agendar exigiria adaptar o mesmo Worker. Publicar no Instagram sobe as imagens antes pro catbox.moe, porque a API só aceita URL pública. O resto ainda não tem conector instalado. A lista do que configurar está em `tarefas.md`.

**Distribuição por canal:** Instagram publica pela página da Anti Custos. LinkedIn publica pelo perfil pessoal do Alvaro, por alcance orgânico. Isso muda a escrita, não só o destino: post de LinkedIn é em primeira pessoa do singular. Detalhe em `.claude/skills/postar-linkedin/references/voz-linkedin.md`.

---

## Como este workspace é organizado

`AGENTS.md` é a fonte de instrução (este arquivo), `CLAUDE.md` tem só `@AGENTS.md` e nunca recebe conteúdo. Skills ficam em `.claude/skills/<nome>/SKILL.md`, e a ponte `.agents/skills` (junction, fora do git) faz o Codex enxergar as mesmas skills automaticamente.

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

Roteamento: **carrossel de Instagram vai pela skill `/carrossel`**, nunca montado na mão. **Todo o resto vai pela `/impeccable`** (`shape`, depois `critique` e `audit`, depois `polish`).

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

---

## Criação de skills

Quando o usuário pedir pra criar uma skill nova, usar a skill `/criar-skill`, que carrega o procedimento completo.
