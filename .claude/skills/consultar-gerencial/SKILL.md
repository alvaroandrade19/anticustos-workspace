---
name: consultar-gerencial
description: >
  Lê a camada Gerencial do Obsidian Vault (conhecimento de vendas, copy, marketing
  e do próprio negócio, escrito pra um agente executar) e compara com os arquivos
  de contexto do workspace, propondo atualizações e sinalizando contradições.
  Use quando o usuário chamar /consultar-gerencial, disser "consulta o gerencial",
  "vê o que tem de novo no vault", "puxa do wiki gerencial", "atualiza o contexto
  com o que tá no Obsidian" ou "cruza o vault com nosso contexto".
---

# /consultar-gerencial — Ponte com o Wiki Gerencial

## O que é essa fonte

`C:\Users\aandr\OneDrive\Documentos\Obsidian Vault\Wiki\Gerencial\` é uma camada do
Obsidian Vault do Alvaro, escrita pra ser lida por um agente operacional, não por
humano estudando. Cada página cobre um domínio inteiro (vendas, copy, o negócio em
si) em regra decidível, não panorama. Ainda está sendo preenchida: hoje só existem
`index.md`, `Copy - Estruturas em Uso.md` e `Vendas - Prospecção, Call e Fechamento.md`.
Mais páginas (funis, tráfego pago, conteúdo e canal, "o negócio em uma página") entram
com o tempo, na ordem que o próprio `index.md` descreve na seção "Fila sugerida".

Essa camada já carrega seu próprio protocolo de leitura e sua própria trava de
confiança. Não ignorar nenhum dos dois:

- **Frontmatter `vigencia`** em cada página: `estavel` (decidido, pode virar fato em
  `_contexto/`), `provisorio` (funciona por ora, mas ainda não validado, entra com
  aviso) e `em-aberto` (não decidido — nunca escrever como fato, só como pendência).
- **Protocolo de leitura do próprio `index.md`**: 1) o índice, 2) a página do domínio
  da pergunta, 3) a página de origem em `Wiki/` só se faltar nuance, 4) `Raw/` nunca.
  Esta skill segue os passos 1 e 2 sempre; não ir atrás de origem a menos que o
  usuário peça mais detalhe sobre algo específico.

## Passo 1: Ler o índice e mapear o que existe

Ler `Wiki/Gerencial/index.md` primeiro. Depois, listar de fato os arquivos `.md` da
pasta (`Glob` em `Wiki/Gerencial/*.md`) em vez de confiar só na tabela "Páginas desta
camada" do índice — a pasta está em preenchimento e pode ter página nova que ainda
não entrou na tabela.

Ler cada página encontrada (exceto `index.md`, já lido). Para cada uma, anotar:
`resumo`, `vigencia` e os pontos que tocam fato de negócio (ICP, preço, oferta,
posicionamento) versus os que são puro processo/playbook (estrutura de copy, roteiro
de call, cadência).

## Passo 2: Ler o contexto atual do workspace

Ler `_contexto/empresa.md`, `_contexto/estrategia.md`, `_contexto/preferencias.md` e
`AGENTS.md`. É contra isso que o conteúdo do vault vai ser comparado.

## Passo 3: Separar fato de negócio e playbook operacional

Isso decide **onde** cada achado vai, não só **se** vai:

- **Fato de identidade do negócio** (ICP, preço, oferta, posicionamento, promessa,
  o que pode e o que não pode ser prometido): candidato a atualizar `empresa.md` ou
  `estrategia.md`, porque esses arquivos são lidos no início de toda sessão.
- **Playbook operacional** (estrutura de copy, as 10 perguntas, etapas da call,
  scripts de prospecção): **não copiar o conteúdo inteiro pra dentro de um arquivo
  sempre carregado.** É exatamente o problema que o próprio `index.md` descreve
  (contexto grande demais deixa o agente mais lento, não mais capaz). Em vez disso,
  manter uma referência sob demanda, do mesmo jeito que o `ui-ux-pro-max` já funciona
  pra design: linha em `AGENTS.md`, na seção "**Referências de playbook ativas**"
  (criar a seção se ainda não existir), apontando pra página do Gerencial e dizendo
  quando consultar (ex: antes de escrever proposta comercial ou script de call).
  **Essa parte a skill mantém sozinha, sem perguntar** — é puramente aditiva/informativa,
  não decide fato de negócio. Ver Passo 6.

## Passo 4: Checar contradição antes de propor qualquer atualização

Comparar fato por fato com o que já está em `_contexto/`. Quando o vault e o contexto
atual **discordam** (preço diferente, ICP diferente, promessa diferente), isso não se
resolve sozinho aqui, nem escolhendo o mais recente por padrão. Mostrar os dois lados
lado a lado e perguntar ao usuário qual vale. Essa é a mesma regra que o próprio vault
segue pra ele mesmo ("contradição nova nunca é resolvida aqui em silêncio").

## Passo 5: Apresentar o diagnóstico

Formato:

```
## Gerencial → contexto

### Páginas lidas
- [página] — vigência: [estavel/provisorio/em-aberto] — [resumo em uma linha]

### Fato novo, sem conflito (proponho adicionar)
- **[arquivo de destino]:** [o que entra]

### Contradição com o contexto atual (preciso que você decida)
- **[tema]:** contexto atual diz "[X]" · Gerencial diz "[Y]" (vigência: [...]) — qual vale?

### Referência de playbook (aplicada direto, sem pedir aprovação)
- **[domínio]:** referência pra [[página]] adicionada/atualizada em AGENTS.md

### Em aberto no próprio vault (não decidir por conta própria)
- [item] — [página de origem]
```

Se não houver página nova desde a última consulta, dizer isso direto em vez de repetir
o diagnóstico anterior.

## Passo 6: Aplicar — automático pra referência, aprovação pra fato

Dois regimes diferentes, não misturar:

- **Referência de playbook** (seção "Referências de playbook ativas" em `AGENTS.md`):
  a skill aplica sozinha, sem perguntar antes. Cada página nova ou revisada no Gerencial
  que for puro processo (não fato de negócio) ganha ou atualiza sua linha ali. Reportar
  depois de feito, não pedir permissão antes: "adicionei/atualizei a referência de
  [página] em AGENTS.md".
- **Fato de identidade** (`empresa.md`, `estrategia.md`) e **qualquer contradição**: nunca
  automático. Mostrar a mudança proposta linha por linha, perguntar "quer que eu aplique
  essas atualizações?", editar só a linha relevante (nunca reformatar o arquivo inteiro),
  confirmar mostrando o que ficou.
- Contradição que o usuário já resolveu numa consulta anterior (fica registrada como nota
  em `AGENTS.md`, ex: "ICP e oferta desse arquivo são de clínica e não se aplicam aqui")
  não volta a ser perguntada — a skill lê essa nota no Passo 2 e trata como decidida.

## Regras

- Nunca promover conteúdo `em-aberto` a fato decidido em `_contexto/`, mesmo que o
  usuário não questione — sinalizar que é pendência do próprio vault primeiro.
- Nunca resolver uma contradição de fato escolhendo um lado sozinho. Perguntar — a menos
  que já exista decisão registrada em `AGENTS.md` pra aquele ponto específico.
- Referência de playbook não pede aprovação porque não decide fato, só aponta onde
  consultar. Se a referência já existir e nada mudou na página de origem, não reescrever.
- Não duplicar playbook operacional inteiro dentro de arquivo sempre carregado. Preferir
  referência que aponta pra página do Gerencial.
- Página do vault que ainda não tem `## Baseado em` lido, ou índice desatualizado, não é
  motivo pra travar a skill: ler o que existe e seguir.
- Se a pasta `Gerencial/` não existir mais no caminho esperado, avisar e não inventar
  conteúdo.
