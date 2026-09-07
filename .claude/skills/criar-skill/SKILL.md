---
name: criar-skill
description: Cria uma skill nova pro workspace, calibrada pro contexto do negócio. Use quando o usuário disser "cria uma skill", "quero uma skill pra X", ou aceitar a oferta de virar skill.
---

# Criar skill

Quando o usuário pedir pra criar uma nova skill:

1. Verificar se existe um template relevante em `templates/skills/`. Se existir, usar como base e adaptar pro contexto do usuário.
2. Perguntar: "Essa skill é específica pra esse projeto ou vai ser útil em qualquer projeto?"
   - Específica desse negócio: salvar em `.claude/skills/nome-da-skill/SKILL.md` (local)
   - Útil em qualquer projeto: salvar em `~/.claude/skills/nome-da-skill/SKILL.md` (global)
3. Ler `_contexto/empresa.md` e `_contexto/preferencias.md` pra calibrar o conteúdo da skill ao contexto do negócio.
4. Se a skill precisar de arquivos de apoio (templates, referências, exemplos), criar dentro da pasta da skill.
5. Seguir o fluxo da skill-creator nativa do Claude Code.

## Escrever a description

A `description` é o que faz a skill disparar sozinha, e ela carrega em toda mensagem. Escrever curta (150 a 200 caracteres) e incluir as frases que o Alvaro realmente digita, em português, não sinônimo genérico. Uma frase de gatilho por intenção, sem repetir a mesma intenção em três formulações.

## Depois de criar

Registrar a skill nova no `AGENTS.md` se ela mudar algum fluxo de trabalho descrito lá, e avisar que ela já aparece pro Codex pela ponte `.agents/skills`.
