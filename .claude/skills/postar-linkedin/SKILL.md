---
name: postar-linkedin
description: >
  Escreve e publica posts no LinkedIn pessoal do Alvaro pela API oficial, de graça, sem
  intermediário. Cobre texto, link, imagem única e carrossel de imagens, valida o texto
  contra as regras da marca e arquiva o que foi publicado. Use quando o usuário disser
  "posta no LinkedIn", "publica no LinkedIn", "manda esse post pro LinkedIn", "adapta o
  carrossel pro LinkedIn" ou "escreve um post de LinkedIn".
---

# /postar-linkedin

Publicação direta no perfil pessoal do Alvaro via API oficial do LinkedIn (produto self-serve
"Share on LinkedIn", escopo `w_member_social`). Sem Post for Me, sem Buffer, sem assinatura.

**Publica sempre no perfil pessoal, nunca na página da empresa.** Decisão de distribuição, não
limitação técnica: no LinkedIn o alcance orgânico de perfil pessoal supera o de página com folga.
A consequência editorial disso está em `references/voz-linkedin.md` e não é opcional.

## Precedência

1. `_contexto/preferencias.md` manda em tom e escrita. Travessão é proibido, sem exceção.
2. `PRODUCT.md` manda no que pode ser afirmado. Não existe case, não existe prova, e inventar é proibido.
3. `references/voz-linkedin.md` manda no formato do post e na voz de primeira pessoa.
4. Esta skill manda no fluxo e nos comandos.

## Regra de ouro

**Nunca publicar sem "pode publicar" explícito do Alvaro nesta conversa.** Post é irreversível na
prática: sai para a rede dele, notifica seguidor, e apagar depois deixa rastro. Aprovação de um post
não vale para o próximo.

Antes de perguntar, sempre rodar `--dry` e mostrar o texto exato que vai sair.

---

## Setup (uma vez só, e depois a cada 60 dias)

Se `LINKEDIN_ACCESS_TOKEN` não estiver no `.env`, a skill não tem o que fazer. Nesse caso, abrir
`references/setup.md` e conduzir o Alvaro pelos passos. São cerca de 10 minutos na primeira vez.

Checar antes de qualquer post:

```bash
node .claude/skills/postar-linkedin/scripts/status.js
```

Saída esperada: nome do perfil, URN, dias de validade do token e "Pronto pra publicar". Se faltarem
7 dias ou menos, avisar o Alvaro e oferecer renovar antes de escrever o post, não depois.

Renovar o token (60 em 60 dias, é o preço de não pagar assinatura):

```bash
node .claude/skills/postar-linkedin/scripts/auth.js
```

---

## Fluxo

### 1. Descobrir de onde parte

Três entradas possíveis, e a pergunta é uma linha só quando não estiver óbvio:

> "Post novo do zero, adaptação de um carrossel que já existe, ou você já tem o texto pronto?"

- **Do zero:** tema ou insight vira post. Escrever seguindo `references/voz-linkedin.md`.
- **Adaptação de carrossel:** ler o `carrossel.html` da pasta em `conteudo/carrosseis/` e reescrever
  em prosa de LinkedIn. Não é transcrição de slide. O carrossel foi escrito para ser lido em imagem,
  o post é lido em texto corrido, e a estrutura muda.
- **Texto pronto:** nunca publicar direto. O Alvaro pede avaliação crítica em toda peça que chega
  pronta, e ela vem antes do agendamento: o que está fraco na escrita, no tema e no ângulo, com a
  correção proposta e o porquê. Ordenar por impacto, recomendar em vez de listar tudo no mesmo peso.
  Se estiver bom, dizer que está bom e não mexer por mexer.

### 1b. Decidir a imagem, e é decisão do Alvaro

No LinkedIn quem retém é o texto. A imagem é âncora visual, não conteúdo, então reaproveitar o
carrossel do Instagram não é o padrão. Perguntar numa linha, sem decidir sozinho:

> "Esse post vai sem imagem, com imagem gerada por IA, com peça feita na /impeccable, ou com o carrossel inteiro?"

Quando cada caminho é o certo está em `references/voz-linkedin.md`. Roteamento curto:

- **Gerada por IA:** âncora visual sem tipografia. Ler `references/imagem-ia.md` e seguir o passo 2c.
- **/impeccable:** qualquer peça com texto, número, gráfico ou logo. Nunca pela `/carrossel`, o
  formato do feed do LinkedIn não é o do Instagram.
- **Carrossel inteiro:** só quando a peça tem progressão real e a sequência acrescenta.

### 2. Escrever

Seguir `references/voz-linkedin.md`. Escrever o post inteiro, não um esqueleto.

Salvar em `conteudo/linkedin/<slug>/post.md`, texto puro, sem título markdown e sem metadado no meio.
O arquivo é publicado literalmente, byte a byte. O que estiver lá dentro sai no feed.

O `<slug>` vem do tema, em kebab-case. Se for adaptação de carrossel, usar o mesmo nome da pasta do
carrossel para amarrar as duas peças.

### 2b. Rodapé obrigatório

Todo post do LinkedIn termina com a nota de transparência, sem exceção e sem perguntar. Ela entra no
`post.md` já escrita, exatamente assim:

```
Nota: da pesquisa à publicação, este post passou por automações que eu mesmo construí a partir das minhas anotações. O objetivo é sempre o mesmo: dividir o que ando estudando e puxar discussão boa no comentário.
```

Ordem do fim do arquivo: corpo do post, linha em branco, nota, linha em branco, hashtags. A nota vem
antes das hashtags para não ficar órfã depois do bloco de tags.

Texto normal, sem asterisco de itálico. O LinkedIn não renderiza markdown e o `post.md` é publicado
literalmente, então `*itálico*` sairia com os asteriscos à mostra. Itálico em Unicode (𝘵𝘦𝘹𝘵𝘰) também
não entra: quebra leitor de tela e não tem acento em português, palavra com ã ou ç volta para a
fonte normal no meio da frase.

A nota não conta como fecho do post. O post continua precisando da posição declarada antes dela.

### 2c. Três sugestões de imagem, com prompt pronto

Só quando o caminho escolhido em 1b foi imagem gerada por IA, e só depois do texto pronto: o
conceito visual nasce da tese final, não do tema solto.

Ler `references/imagem-ia.md` e entregar três conceitos, um de cada família (objeto metáfora, cena
humana documental, abstração estrutural), cada um com nome, uma linha de por que amarra na tese, o
prompt em inglês dentro de code fence pronto para colar no gerador, e uma linha de risco. Fechar
recomendando uma. Nada além disso, o arquivo de referência traz o formato exato e as regras.

O Alvaro gera a imagem por fora e traz o arquivo. Salvar em `conteudo/linkedin/<slug>/imagem/01.png`.

### 3. Filtrar antes de mostrar

Checar, e corrigir antes de mostrar ao Alvaro:

- Nenhum travessão. O script recusa e é chato descobrir isso na hora de publicar.
- Máximo 3000 caracteres.
- As duas primeiras linhas seguram sozinhas antes do "ver mais". Se o gancho depende do terceiro
  parágrafo, o post morre no feed.
- Nenhum número sem fonte pública ou conta aberta na frente. Mesma regra do carrossel.
- Nenhum clichê da lista de `_contexto/preferencias.md`.
- Nada que insinue cliente, case ou resultado que não existe.
- A nota de transparência está no fim, antes das hashtags, em texto normal.

### 4. Prévia e aprovação

```bash
node .claude/skills/postar-linkedin/scripts/publish.js --texto conteudo/linkedin/<slug>/post.md --dry
```

Mostrar o texto na conversa junto com contagem de caracteres e, se houver, os nomes das imagens.
Fechar com uma pergunta direta: "Publico assim?"

**Checkpoint. Esperar resposta.**

### 5. Publicar

Só depois do OK, rodar o mesmo comando sem `--dry`.

| Tipo de post | Comando |
|---|---|
| Só texto | `--texto post.md` |
| Uma imagem | `--texto post.md --imagem caminho/01.png` |
| Carrossel de imagens | `--texto post.md --imagem 01.png --imagem 02.png ...` (de 2 a 20) |
| Link com preview | `--texto post.md --link https://... --titulo "..." --descricao "..."` |

Exemplo real, adaptando um carrossel já renderizado:

```bash
node .claude/skills/postar-linkedin/scripts/publish.js \
  --texto conteudo/linkedin/custo-invisivel/post.md \
  --imagem conteudo/carrosseis/custo-invisivel/01.png \
  --imagem conteudo/carrosseis/custo-invisivel/02.png \
  --imagem conteudo/carrosseis/custo-invisivel/03.png
```

Opções extras: `--visibilidade CONNECTIONS` restringe a conexões de primeiro grau (o padrão é
`PUBLIC`, que é o que interessa para construir audiência). `--alt "..."` repetido descreve cada
imagem na ordem.

### 6. Arquivar

Depois de publicar, gravar `conteudo/linkedin/<slug>/publicado.md` com data, URL devolvida pelo
script, tipo de post e quais imagens foram junto. É o registro que permite comparar desempenho
depois, e sem ele não existe aprendizado de conteúdo.

Se o post nasceu de um carrossel, anotar isso lá também.

### 7. Agendar, quando o post não é para agora

Mesmo fluxo até a aprovação. Só troca o comando final:

```bash
node .claude/skills/postar-linkedin/scripts/agendar.js \
  --texto conteudo/linkedin/<slug>/post.md --quando "2026-09-10 08:30"
```

`--quando` aceita `"AAAA-MM-DD HH:MM"` no horário daqui, ou relativo (`+30min`, `+2h`, `+1d`). Todas
as outras opções são iguais às do `publish.js`.

Como funciona: as imagens sobem para o LinkedIn agora, desta máquina, e só o texto mais as URNs vão
para o KV da Cloudflare. Um Worker acorda de 5 em 5 minutos e publica o que já venceu, com o PC
desligado. Nenhum byte de imagem passa pela Cloudflare.

Ver, cancelar ou forçar:

```bash
node .claude/skills/postar-linkedin/scripts/fila.js                    # lista fila e resultados
node .claude/skills/postar-linkedin/scripts/fila.js --cancelar <id>    # tira da fila
node .claude/skills/postar-linkedin/scripts/fila.js --disparar         # acorda o Worker na hora
```

**Regra operacional aprendida na marra:** toda alteração de cron ou novo deploy do Worker leva **até
15 minutos para propagar** na rede da Cloudflare, e nesse intervalo o cron simplesmente não acorda.
Medido em 08/09/2026: a batida veio exatamente 15 minutos depois da última alteração. Consequências:

- Não agendar post para menos de 20 minutos depois de mexer no Worker.
- Ao diagnosticar cron que não dispara, **parar de mexer e esperar 15 minutos** antes de concluir
  qualquer coisa. Redeploy repetido reinicia o relógio e faz o sintoma parecer permanente.

**Teto do KV grátis:** 1000 operações de list por dia. O ciclo faz uma só, então o cron de 5 minutos
usa 288 por dia. Cron de 1 em 1 minuto estouraria o limite (1440), e por isso não é uma opção.

Cuidados que o script já cobra:

- Agendamento depois da data de expiração do token é recusado, porque publicaria com token morto.
- Agendamento com imagem a mais de 7 dias exige `--forcar`. Não se sabe por quanto tempo o LinkedIn
  guarda imagem enviada e não publicada, e essa é a incerteza aberta do desenho.
- Depois de renovar o token, o `auth.js` reenvia ele para o Worker sozinho. Se falhar, rodar
  `node .claude/skills/postar-linkedin/scripts/deploy-worker.js`.

Depois que o Worker publicar, arquivar o `publicado.md` como no item 6, pegando a URL em `fila.js`.

### 8. Despublicar, quando pedido

```bash
node .claude/skills/postar-linkedin/scripts/despublicar.js <url ou urn do post>
```

Apagar é definitivo: o post some do feed e leva junto reação e comentário que tenha recebido. Fazer
só com pedido explícito, e depois apagar o `publicado.md` da pasta, para o post voltar ao estado de
rascunho não publicado.

---

## Comportamento

- Bastidor invisível. Não narrar etapa nem anunciar leitura de arquivo.
- Não publicar em lote, não agendar, não publicar "quando terminar". Um post por vez, cada um com seu OK.
- Se o Alvaro pedir para postar na página da empresa, explicar em uma linha que isso exige a
  Community Management API, que tem fila de aprovação, e perguntar se quer que entre em `tarefas.md`.
- Se a publicação falhar, mostrar o erro cru do LinkedIn junto da tradução. Não tentar de novo
  automaticamente: post duplicado é pior que post que falhou.

## Quando algo dá errado

| Erro | O que é | O que fazer |
|---|---|---|
| 401 | Token vencido ou revogado | `auth.js` de novo |
| 403 | Token sem `w_member_social` | Refazer o token marcando o escopo (`references/setup.md`) |
| 422 | LinkedIn recusou o conteúdo | Quase sempre caractere no texto ou imagem fora do padrão. Testar sem as imagens para isolar |
| 426 ou erro de versão | `LinkedIn-Version` velha | Subir `LINKEDIN_API_VERSION` no `.env` para o mês atual, formato `AAAAMM` |
| 429 | Passou de 150 chamadas no dia | Esperar o dia virar em UTC |

O caminho multi-imagem usa a REST API nova (`/rest/posts` com `multiImage`), diferente do caminho de
texto e imagem única, que usa `ugcPosts`. **Verificado em 08/09/2026:** funciona com o app tendo só
os produtos self-serve, 9 imagens publicadas na primeira tentativa com a versão de API `202606`. Se
um dia voltar 403 ali enquanto o post simples continua funcionando, é a API nova recusando o app:
publicar com uma imagem só e registrar o caso, em vez de insistir.

## Limites conhecidos

- 3000 caracteres por post, 150 chamadas de API por dia, 20 imagens por post.
- Vídeo não está implementado. Se precisar, é o mesmo fluxo de upload trocando a recipe.
- Post em formato documento (o PDF que o LinkedIn exibe como carrossel nativo) não está implementado.
  É o próximo passo natural se o carrossel de imagens não performar.
- Agendamento existe e roda com o PC desligado, mas a granularidade é de 5 minutos, que é o
  intervalo do cron. Post agendado para 08:30 sai entre 08:30 e 08:35.
- O token do LinkedIn vive em dois lugares (`.env` e secret do Worker). O `auth.js` sincroniza os
  dois, mas se alguém editar o `.env` na mão, o Worker fica para trás.

## Ciclo de vida da peca

A pasta da peca anda por tres estados, e a skill move sozinha. Nunca mover a mao.

| Estado | Onde fica | Quem move pra la |
|---|---|---|
| Em producao | `conteudo/linkedin/<slug>` | quem escreve o post |
| Na fila | `conteudo/agendado/linkedin/<slug>` | `agendar.js` |
| No ar | `conteudo/publicado/linkedin/<slug>` | `publish.js` na hora, ou `fila.js` quando o Worker publica |

Cada pasta movida ganha um `_estado.md` com rede, horario, link do post e caminho de
origem. Cancelar um agendamento (`fila.js --cancelar`) devolve a peca para a origem
registrada ali.

O Worker roda na Cloudflare e nao alcanca o disco desta maquina, entao a passagem de
"na fila" para "no ar" acontece quando o `fila.js` roda aqui e ve o resultado.

Para publicar sem mover nada, passar `--sem-mover`. Mesma estrutura vale para o
Instagram, na skill `/publicar-social-ratos`.

---

## Arquivos

- `scripts/auth.js`: autoriza a conta e grava token, URN e validade no `.env`
- `scripts/status.js`: diz se dá pra publicar agora e quantos dias faltam
- `scripts/publish.js`: publica, valida o texto e devolve a URL do post
- `scripts/despublicar.js`: apaga um post já publicado, recebendo a URL ou a URN
- `scripts/agendar.js`: sobe as imagens e põe o post na fila para uma hora futura
- `scripts/fila.js`: lista, cancela e dispara a fila agendada
- `scripts/deploy-worker.js`: cria o KV, sobe o Worker e configura o cron. Idempotente
- `worker/worker.js`: o que roda na Cloudflare, acordando de 5 em 5 minutos
- `scripts/lib-linkedin.js`: funções compartilhadas do LinkedIn, sem dependência externa
- `scripts/lib-cloudflare.js`: cliente mínimo da API da Cloudflare, sem wrangler
- `scripts/lib-arquivo.js`: move a pasta da peça entre produção, fila e publicado
- `references/setup.md`: criação do app no portal de developers, passo a passo
- `references/voz-linkedin.md`: como um post de perfil pessoal precisa soar
