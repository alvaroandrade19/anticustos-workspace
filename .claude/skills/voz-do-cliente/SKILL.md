---
name: voz-do-cliente
description: "VOZ DO CLIENTE / LEVANTAMENTO DE PESQUISA. Use quando o usuário pedir para pesquisar um mercado ou montar o dossiê de evidências de um produto, serviço, SaaS, oferta, programa de mentoria ou cliente, ou quando um rascunho pedido não tiver evidência de mercado (ofereça isso uma vez, como flag; nunca segure o trabalho pedido por causa disso). Reúne tudo de que as outras skills do CopyOS precisam: um levantamento de base completo, prompts de deep research (pesquisa profunda) prontos para colar, descoberta de fontes, mineração de avaliações e da voz do cliente (VOC) e um dossiê de evidências finalizado que alimenta o Banco de Provas, o posicionamento e todo rascunho. O usuário nunca deveria ter que descobrir O QUE pesquisar: esta skill já sabe."
---
# Voz do Cliente

O sistema de levantamento e pesquisa. Todas as outras skills do CopyOS rodam com evidência: a verdade do seu produto, a
linguagem do seu mercado, os movimentos dos seus concorrentes, as suas provas. Esta skill reúne tudo isso numa única
passada guiada, para QUALQUER negócio: produto físico, SaaS, serviço, agência, mentoria, infoproduto, negócio local.

A promessa: você responde perguntas e cola prompts. A máquina pensa.

## O fluxo (uma passada, 60 a 90 minutos para um dossiê completo)

### Passo 1 - Levantamento (você fala, ela pergunta)

Carregue primeiro o contexto que já existe: `_contexto/` e `PRODUCT.md` para a Anti Custos, `clientes/<nome>/` para cliente, e `Wiki/Gerencial/Copy - Estruturas em Uso.md` §1 (protocolo de pesquisa sem audiência: enquete, DM, 30 a 50 conversas, hipótese declarada como hipótese). Use `references/formulario-de-levantamento.md` só para os campos que ainda faltam, perguntando em tom de conversa; nunca pergunte de novo um fato já confirmado. Não entregue
o formulário em branco e vá embora: pergunte, aprofunde, preencha por eles. Registre o que eles sabem; marque cada lacuna
com honestidade como `unknown`. Lacuna vira tarefa de pesquisa, nunca palpite.

### Passo 2 - Descoberta de fontes (a máquina decide onde procurar)

A partir do levantamento, monte o mapa de fontes conforme `references/rubricas-de-pesquisa.md` (seção Source Discovery):
quais subreddits, plataformas de avaliação, comunidades, páginas de concorrentes, bibliotecas de anúncios, seções de comentários e
buscas vão responder às perguntas em aberto DESTE negócio. Priorize fontes que mostram o que os compradores
fizeram de fato (compraram, compararam, desistiram, pediram reembolso, recomendaram) em vez de pura opinião.

### Passo 3 - Deep research (prompts prontos para colar, já preenchidos)

Abra `references/pacote-de-prompts-de-deep-research.md`. Preencha os colchetes de cada prompt A PARTIR DO LEVANTAMENTO (nunca faça
o usuário preencher) e peça ao usuário que cole os prompts na ferramenta de deep research que preferir
(Claude com ferramentas de pesquisa/web, Perplexity ou qualquer IA de pesquisa profunda):

1. Panorama de mercado, concorrentes e preços.
2. Linguagem do comprador e voz do cliente.
3. Comprovação de alegações e provas.
4. Anúncios dos concorrentes e dissecação de ângulos.

Se ESTE assistente tiver ferramentas de web/pesquisa disponíveis, ofereça rodar os prompts diretamente.

### Passo 4 - Minere o que voltar

Passe a pesquisa que voltou pelas rubricas de extração (`references/rubricas-de-pesquisa.md`): eventos
gatilho, escadas de dor, alternativas que falharam, mapas de objeção, resultados dos sonhos, banco de frases literais,
ranking de frequência x intensidade. Só citações reais. Nada de percentual sem uma amostra real contada: diga
"tema recorrente" no lugar.

### Passo 5 - Monte o dossiê

Preencha `references/modelo-do-dossie-do-negocio.md` com tudo o que foi reunido. Este é o arquivo único de evidências
que todas as outras skills do CopyOS carregam. Depois, encaminhe as saídas:

- Fatos verificados, ofertas, citações, faixas de alegação → o Banco de Provas mantido por `checagem-de-alegacoes`.
- Avatares e lacunas → as células de conceito da `copy-de-conversao` (persona × ângulo × oferta × prova × formato), se o trabalho de conceito existir; caso contrário, mantenha-os no dossiê.
- O dossiê completo → `dados/pesquisa/<AAAA-MM-DD>-<tema>.md`.
- O que é duradouro (objeção recorrente, frase literal forte, prova verificada) → proposta de atualização em `_contexto/` ou na seção de prova do `PRODUCT.md`, pelo fluxo de memória do `AGENTS.md`.

### Passo 6 - Declare as lacunas

Termine toda rodada com uma lista honesta de lacunas: o que ainda está `unknown`, que evidência está fraca e o jeito
mais barato de fechar cada lacuna. Uma máquina que diz "ainda preciso de X" vale mais do que uma que finge.

## Regras rígidas

- Nunca invente fatos do produto, preços, citações, estatísticas, alegações de concorrentes ou tamanhos de mercado. Toda entrada
  do dossiê leva uma fonte e um rótulo de evidência: `verified-current`, `local-snapshot`, `inference`
  ou `assumption`.
- Funciona para qualquer modelo de negócio. Onde um prompt diz "produto", leia produto/serviço/software/programa.
- Respeite as regras das plataformas durante a pesquisa: páginas públicas, APIs aprovadas, exportações fornecidas pelo usuário, navegação
  manual. Nada de contornar login, paywall ou limite de requisições.
- Refaça a passada a cada trimestre ou a cada mudança de rumo: mercados mudam, dossiês apodrecem.

## Contrato de Saída

Toda rodada completa entrega: (1) o levantamento preenchido, (2) o mapa de fontes, (3) os prompts de pesquisa preenchidos
(ou a própria pesquisa), (4) a extração minerada (banco de frases, mapa de gatilhos, escadas de dor, objeções,
alternativas que falharam, temas ranqueados), (5) o dossiê do negócio completo, (6) a lista de lacunas com os próximos
passos de pesquisa.

## Contexto deste workspace

O contexto do negócio está em `_contexto/` (empresa, preferências, estratégia, agora) e no `PRODUCT.md`; para cliente,
em `clientes/<nome>/`. É a única fonte da verdade: não crie brief paralelo, `BUSINESS-MEMORY.md` nem pasta de memória
própria, e não pergunte o que esses arquivos já respondem. O pedido atual vem primeiro: faça o trabalho com o que existe
e ponha as lacunas nas flags. Fato durável que surgir vira proposta de atualização em `_contexto/` (prova verificada vai
para a seção de prova do `PRODUCT.md`) pelo fluxo de memória do `AGENTS.md`: mostrar a mudança e pedir confirmação.
As skills do CopyOS (`copy-de-conversao`, `revisor-chefe`, `checagem-de-alegacoes`, `checagem-pre-lancamento`,
`voz-do-cliente`, `biblioteca-dos-mestres`) se carregam entre si pela ferramenta de skills quando o trabalho pede.
