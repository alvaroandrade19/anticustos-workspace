---
description: Escreve e publica post no LinkedIn pessoal pela API oficial
argument-hint: [tema, pasta do carrossel, "status" ou "renovar"]
---

Invocar a skill `postar-linkedin` e seguir o fluxo dela com o que veio em `$ARGUMENTS`.

Atalhos que não passam pelo fluxo de escrita:

- `status`: rodar só `node .claude/skills/postar-linkedin/scripts/status.js` e reportar o resultado, sem escrever post nenhum.
- `renovar`: rodar `node .claude/skills/postar-linkedin/scripts/auth.js --servidor` e avisar o Alvaro para clicar em Allow no navegador.
- `despublicar <url ou urn>`: rodar `node .claude/skills/postar-linkedin/scripts/despublicar.js` com o alvo, depois de confirmar que é isso mesmo.
- `fila`: rodar `node .claude/skills/postar-linkedin/scripts/fila.js` e mostrar o que está agendado e o que já saiu.
- `agendar <quando>`: seguir o fluxo normal de escrita e aprovação, e no fim usar `agendar.js --quando` em vez de `publish.js`.

Sem argumento, perguntar de onde parte o post (tema novo, adaptação de carrossel ou texto pronto).

A regra de ouro da skill continua valendo aqui: nunca publicar sem "pode publicar" explícito nesta conversa, e sempre mostrar a prévia com `--dry` antes de perguntar.
