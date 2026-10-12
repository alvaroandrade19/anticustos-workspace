# CopyOS: instruções de instalação para a IA

Esta pasta é o pacote do CopyOS, um conjunto de nove skills de copywriting. Quem está lendo isto é a IA (Claude Code). O usuário só vai pedir "instale o CopyOS que está na pasta CopyOS-Claude-Code"; faça a instalação você mesma, sem pedir que ele copie arquivos.

## O que fazer

1. As skills estão em `skills/`, uma pasta por skill, cada uma com um `SKILL.md` na raiz:
- briefing-inteligente
- voz-do-cliente
- posicionamento-de-marca
- checagem-de-alegacoes
- copy-de-conversao
- revisor-chefe
- checagem-pre-lancamento
- memoria-e-checagem
- biblioteca-dos-mestres
2. Esta pasta foi colocada dentro do projeto em que o usuário trabalha. Copie as nove pastas, sem alterar nada dentro delas, para `.claude/skills/` na raiz desse projeto (a pasta que contém esta). Crie a pasta se não existir. Se o usuário pedir o CopyOS em todos os projetos, copie para `~/.claude/skills/` em vez disso.
3. Se já existir uma versão anterior de alguma dessas pastas no destino, substitua-a inteira (é uma atualização do CopyOS). Nunca toque em outras pastas que estejam lá.
4. Confira que cada uma das nove pastas copiadas tem o `SKILL.md` na raiz e diga ao usuário, em uma linha, que o CopyOS está instalado e que as skills passam a valer numa sessão nova.
5. Depois diga só isto: "Pronto. Abra uma sessão nova e peça o que precisa, por exemplo: quero um anúncio para o meu produto." A pasta CopyOS-Claude-Code pode ser apagada depois, mas não apague sem o usuário pedir.

## O que não fazer

- Não procure o CopyOS em outro lugar (Drive, GitHub, conversas antigas). Ele está nesta pasta.
- Não edite, resuma ou renomeie nenhum arquivo das skills.
- Não explique a estrutura interna das skills ao usuário; ele não precisa saber.
