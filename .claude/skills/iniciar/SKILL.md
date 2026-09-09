---
name: iniciar
description: Inicia a sessão de trabalho lendo o contexto do negócio e ajudando o usuário a começar. Usar no começo de cada sessão nova do Claude Code.
---

# Skill: /iniciar

Use essa skill no começo de cada sessão de trabalho.

## O que fazer

1. Verificar se `_contexto/empresa.md` existe e está configurado (sem `<!-- NOT CONFIGURED -->`)
2. Verificar se `_contexto/preferencias.md` existe e está configurado
3. Verificar se `_contexto/estrategia.md` existe e está configurado
4. Ler `_contexto/agora.md` (contexto vivo: onde paramos, decisões recentes, pendências) se estiver configurado
5. Ler AGENTS.md se existir
6. Sincronizar a fila de publicação (ver abaixo)
7. Apresentar um resumo de contexto e perguntar o que o usuário quer fazer

## Sincronizar a fila de publicação

Rodar sempre, antes de montar o resumo:

```bash
node scripts/sincronizar-publicacoes.js
```

O Worker que publica os posts agendados roda na Cloudflare e não alcança o disco desta
máquina. Então, quando um post agendado sai, a pasta da peça só migra de
`conteudo/agendado/` para `conteudo/publicado/` quando alguém roda isso aqui. O post vai
ao ar de qualquer jeito: o que fica desatualizado é a organização das pastas.

O script fica quieto quando não há nada. Se ele imprimir algo, incluir no resumo:

- Post publicado desde a última sessão: dizer qual e o link
- Post ainda na fila: dizer qual e o horário marcado
- Post que falhou: **avisar em destaque**, com o erro. É a coisa mais importante do
  resumo, porque significa conteúdo que o usuário achava que tinha saído e não saiu
- Aviso de token perto de vencer: mencionar, com o comando de renovação

Se o script falhar (Cloudflare fora do ar, token vencido), não travar o início da
sessão: mencionar em uma linha e seguir.

## Fluxo

### Se os arquivos de memória existem e estão configurados

Leia `_contexto/empresa.md`, `_contexto/preferencias.md`, `_contexto/estrategia.md` e, se configurado, `_contexto/agora.md`.

Apresente um resumo curto e direto no formato:

```
Tudo certo. Contexto carregado:

**Negócio:** [nome e o que faz, em uma linha]
**Foco agora:** [prioridade principal de estrategia.md — se não configurado, omitir essa linha]
**Onde paramos:** [de agora.md — a última coisa em andamento; omitir se agora.md não configurado]
**Pendências:** [de agora.md — até 2 itens em aberto mais relevantes; omitir se não houver]
**Lembretes:** [qualquer preferência importante, ex: "sem travessões", "responder em PT"]

O que você quer fazer hoje?
```

Mantenha o resumo enxuto (até 6 linhas). Não reescreva tudo que está nos arquivos, só o essencial pra retomar.

### Se os arquivos de memória não existem ou têm `<!-- NOT CONFIGURED -->`

Avise o usuário:

```
Parece que o sistema ainda não foi configurado.
Rode /setup pra eu aprender sobre o seu negócio — leva uns 5 minutos.
Depois de configurado, o /iniciar vai funcionar completo.
```

## Comportamento

- Tom direto, sem enrolação. Não diga "Olá! Fico feliz em ajudar!"
- Não liste os arquivos que foram lidos. Só mostre o que importa.
- Se houver tarefas pendentes em `tarefas.md`, mencione até 3 itens no topo
- Após o resumo, aguarde o usuário responder o que quer fazer
