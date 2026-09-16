# modelo-saida.md — planilha, painel, dossiê por lead, roll-up, handoff

Tudo PT-BR, tom anti-guru. Escrita **incremental** (cada lead vira linha da planilha + card no roll-up
assim que clareia — se travar, o que já achou tá salvo). Três saídas por run:
`prospeccao/<nicho>-<regiao>.csv` (planilha), `prospeccao/<nicho>-<regiao>.md` (roll-up +
dossiês) e a entrada do **painel** em `prospeccao/crm/` (§5).

---

## §1 — A planilha (tem que ABRIR BONITO no Excel em português)

Cinco regras de formato. As duas primeiras são o que decide se a planilha abre organizada ou vira
um monte de texto numa coluna só:

1. **Separador `;` (ponto-e-vírgula), nunca vírgula.** O Excel em português espera `;`. Com vírgula,
   a linha inteira cai numa célula.
2. **BOM UTF-8 no começo do arquivo** (os bytes `EF BB BF`). Sem ele, "Anápolis" abre como "AnÃ¡polis".
3. **`nota_calor` é NÚMERO puro** (`82`), nunca a fórmula. Número ordena, filtra e colore; texto não.
   A conta vai em `nota_detalhe` (`FIT 42/50 + SINAL 40/50 = 82/100`) e a palavra em `tier`.
4. **Campo não verificado fica VAZIO.** Nada de "a confirmar" repetido linha após linha — isso é
   ruído. O que faltou vai em `pendencias`, uma frase, só nas linhas onde faltou mesmo.
5. **Linhas ordenadas do mais quente pro mais frio.** O lead bom é a primeira linha, não a décima.

Mais: campo com `;`, `"` ou quebra de linha vai entre aspas (e aspas interna vira `""`); uma aba só;
`empresa` é a única coluna que nunca pode estar vazia; append-only (nunca reescreve linha antiga).

**Ordem das colunas — o que decide a abordagem primeiro, o rastro de auditoria depois:**
```
empresa, cidade, uf, segmento, tier, nota_calor, whatsapp, telefone, email, instagram,
instagram_numeros, facebook, site, google_negocio, redes_atividade, reputacao,
sinal_oportunidade, prova_url, gancho_abordagem, responsavel, cargo_responsavel,
confianca_decisor, email_confianca, anuncio, situacao_cadastral, porte, abertura, tecnologia,
pendencias, origem_dado, nota_detalhe, cnpj, lote, data_coleta, link_dossie
```

Os campos do retrato do negócio (`raio-x-presenca.md`) e da prova (`prova-do-problema.md`):
- `instagram_numeros` = `4.816 seguidores · 563 posts` · `google_negocio` = `4,3 de 5 (292 avaliações)`
- `redes_atividade` = a resposta pra "está postando?", **com a data que você viu** (ou "não confirmei")
- `reputacao` = nota + volume + fonte · `tecnologia` = como o site é feito, quando dá pra ver
- **`prova_url` = o link onde o defeito APARECE** (não a home). Sem ele, não havia defeito.

O que cada campo de auditoria significa (não corta nenhum — é o que sustenta a LGPD e a honestidade):
- `tier` = `QUENTE` (≥70) | `MORNO` (45–69) | `FRIO` (<45).
- `email_confianca` = `mx_ok | padrao_nao_verificado | catch_all`.
- `confianca_decisor` = `CONFIRMADO | PROVÁVEL | NÃO CONFIRMADO`.
- `origem_dado` = de onde veio cada contato (ex.: `RDAP+site`, `Maps+bio`) — o registro de origem
  que a LGPD §6 exige.
- `pendencias` = em português simples, o que ficou faltando e qual é o passo manual.
- `lote` = `<nicho>-<regiao>`, a chave pra achar a rodada depois.

**Acompanhamento saiu da planilha.** As colunas `status`, `ultimo_contato`, `proxima_acao` e
`opt_out` não existem mais aqui: quem cuida disso agora é o painel da `/crm-leads` (§5), que guarda
coluna do funil, marcas e anotações sem você mexer em planilha. A planilha é o **resultado da
pesquisa**; o painel é o **acompanhamento**. Opt-out continua valendo e mora no painel (marca
"não perturbe"), e toda run futura pula quem está marcado assim.

---

## §2 — Dossiê por lead (seções fixas, no roll-up .md)

> **Regra dura de escrita, vale pra TUDO que sai daqui:** zero travessão. Nenhum campo do card, da
> tabela, da planilha, do sinal, do gancho ou da narração pode conter o caractere `—`. Use vírgula,
> dois-pontos, parênteses ou frase curta. Campo vazio se escreve vazio ou "não identificado".

```markdown
### {Nº}. {Empresa} · **Calor {X}/100 · {QUENTE|MORNO|FRIO}** {🔥 se QUENTE}

- **Negócio:** {segmento, cidade/UF, porte; situação na Receita; desde quando existe} [fonte](url)
- **Presença:** {Instagram com números · Facebook · Google com nota e nº de avaliações · está
  postando? · reputação}. O que não achou fica de fora, nunca vira "não tem"
- **Sinal de oportunidade (por que AGORA):** {o problema concreto + a evidência que você VIU}
- **Confira você mesmo:** {prova_url}, onde {o que ele vai ver ali}. **Obrigatório em todo sinal
  técnico**, e é o link do DEFEITO, não a home.
- **Decisor:** {Nome ou "não identificado"} ({CONFIRMADO|PROVÁVEL|NÃO CONFIRMADO}) {por que esse tier}
- **Contatos (ordem de toque):** WhatsApp `wa.me/55...` · Tel {..} · E-mail {..} (`{email_confianca}`)
  · IG @{..} · Site {..}, {cada um com origem}
- **Anúncio:** {"tem Meta Pixel (proxy: mexe com tráfego)" | "confirma no link da Biblioteca: <url>" |
  "não verificado"}. Nunca afirma rodar anúncio sem confirmação
- **Gancho de abordagem:** {1-2 linhas ancoradas num fato verificável; por canal se fizer sentido}
  {ou "sem gancho: não achei fato verificável pra personalizar, aborde no canal comercial"}
- **Nota (com a conta):** FIT {x}/50 + SINAL {y}/50 − {dedução} = **{total}/100**
- **Fontes:** [1]({url}) {nota} · [2]({url}) {nota}
```

---

> **Obrigatório em TODO run (inclusive degradado/empty/zero-resultado):** o roll-up sempre fecha
> com a seção "## Próximo movimento" contendo o handoff `/gerar-proposta` + o nudge de re-run, e
> toda linha com nota mostra a aritmética (com componente não-verificado rotulado `—/50`). Nunca
> termina só com uma pergunta ou só com um erro.

## §3 — Roll-up (topo do .md)

```markdown
# Lista de prospecção · {nicho} / {regiao} · {DATA}

> Salvo em `prospeccao/{nicho}-{regiao}.md` + CSV `prospeccao/{nicho}-{regiao}.csv`
> (vai gravando conforme acho, então se travar, o que já achei tá aqui).

**O que entendi:** {1 linha, lente suave: "Tu vende [serviço], então qualifiquei cada um pela
ótica de [persona]." SEM rótulo "você é perfil X".}

{AVISO LGPD verbatim, do lgpd-e-etica.md §2}

## Resumo
- **A varredura:** vasculhei **{TOTAL}** negócios · **{T2}** passaram na triagem · **{T3}** tinham
  problema de verdade · te entrego os **{N}** melhores. (Este placar é obrigatório, é o que mostra
  o tamanho do trabalho. Se os números forem pequenos, diga que a varredura foi pequena e por quê.)
- Você pediu **{N}**. Achei **{X}** com contato verificável · **{Q} QUENTES** · {Z} sem decisor/
  contato (em Dados insuficientes).
- **Comece por estes (QUENTES):** {lista curta}.

## Segunda fila (verificados, com problema real, fora do top {N})
{nome · cidade · o problema em 1 linha}. Quer o dossiê completo de algum destes? É só pedir.

## Tabela (ordenada por calor)
> Calor: **QUENTE ≥70 · MORNO de 45 a 69 · FRIO <45** (provisório = sinal técnico ainda não confirmado).

| # | Empresa | Cidade | Sinal | Calor | Gancho em 1 linha |
|---|---|---|---|---|---|
| 1 | {..} | {..} | {sinal curto} | {X → QUENTE/MORNO/FRIO} 🔥 | {gancho} |

## Dossiês
{os cards do §2, do mais quente pro mais frio}

## Dados insuficientes
- **{empresa}:** {o que faltou: "domínio PF, decisor não confirmado" / "Biblioteca de Anúncios não
  abre por fetch, confirma no link" / "sem MX, e-mail não confiável"}. Passo manual: {...}.

## Próximo movimento
- **Acompanhe num quadro:** roda **`/crm-leads`** que esses leads viram cards num painel no seu
  computador: você arrasta de Novos pra Contatado, anota o que rolou e marca quem é quente. Os
  próximos lotes caem no mesmo painel, sem duplicar.
- **Re-roda** pra puxar o **próximo lote** (já pulo quem tá na lista), quando entrar em região/
  nicho novo, ou pra reconferir sinais, porque o mercado mexe.
- **Escolheu um QUENTE?** O dossiê já tem Negócio + Sinal + Gancho prontos. Roda **`/gerar-proposta`**
  apontando pra esse lead que ela monta a proposta sem você redigitar nada.
```

---

## §4 — Handoff (regra)
- Aponta SÓ pras skills-irmãs do pack (`/crm-leads` pra acompanhar, `/gerar-proposta` pra propor).
  **Nunca cita curso nem método de fora do pack** (o pack é standalone — decisão 2026-06-07).
- O handoff é concreto: passa o dossiê do lead escolhido (Negócio/Sinal/Gancho) como entrada da 07.

---

## §5 — Entrega pro painel (kanban da `/crm-leads`)

Todo run que achou pelo menos 1 lead **também** joga os leads no painel, sozinho. É o que faz o lote
de hoje somar com o de ontem no mesmo quadro, em vez de virar mais um arquivo solto.

**Antes de qualquer coisa, descubra em qual dos 3 casos você está.** O teste é a presença do SCRIPT,
nunca a da pasta (a pasta pode existir vazia por causa de um run anterior):

- **A — painel montado:** existe `prospeccao/crm/importar.mjs` → grava a entrada lá e junta (passos 1 e 2).
- **B — painel não montado, mas a skill do painel está instalada:** a skill `crm-leads` tem uma pasta
  chamada `assets` e dentro dela o `importar.mjs`. Procure em `~/.claude/skills/crm-leads/` e em
  `.claude/skills/crm-leads/`. Achou → **monte o painel você mesmo** e junte: copie os 5 arquivos
  dessa pasta pra `prospeccao/crm/` e crie `leads.json` como `{"versao":1,"leads":[]}`. Não crie
  `estado.json` (quem cria é o painel). Depois siga os passos 1 e 2 normalmente.
- **C — a skill do painel não está instalada:** grava a entrada em `prospeccao/entrada-<slug>.json`
  (fora da pasta `crm/`, que não deve ser criada), e no fechamento diz em UMA linha que existe a
  `/crm-leads` no pack pra ver isso num quadro. Não invente painel, não copie arquivo que não existe.

1. Escreva a entrada `entrada-<nicho>-<regiao>.json` (em `prospeccao/crm/` nos casos A e B):
```json
{"leads":[
  {"empresa":"...","segmento":"...","cidade":"...","uf":"GO",
   "whatsapp":"55629...","telefone":"","email":"","email_confianca":"",
   "site":"","instagram":"@perfil","instagram_numeros":"4.816 seguidores · 563 posts",
   "facebook":"","google_negocio":"4,3 de 5 (292 avaliações)","google_negocio_url":"",
   "redes_atividade":"post indexado de março/2026","reputacao":"",
   "responsavel":"","cargo_responsavel":"","confianca_decisor":"",
   "cnpj":"","origem_dado":"...","sinal_oportunidade":"...",
   "prova_url":"https://.../cardapio","prova_nota":"a página do cardápio devolve erro 404",
   "gancho_abordagem":"...",
   "nota_calor":82,"nota_detalhe":"FIT 42/50 + SINAL 40/50 = 82/100","tier":"QUENTE",
   "anuncio":"","situacao_cadastral":"ATIVA","porte":"ME","abertura":"1999","tecnologia":"",
   "pendencias":"","lote":"<nicho>-<regiao>","data_coleta":"AAAA-MM-DD",
   "fontes":[{"url":"...","nota":"..."}]}
]}
```
O painel mostra `prova_url` como um botão "Confira você mesmo" embaixo do sinal. **É o link do
DEFEITO, nunca a home bonita** — mostrar a home enquanto o defeito está em outra página faz parecer
que a skill mentiu.
Mesmas regras da planilha: `nota_calor` NÚMERO, campo não verificado VAZIO, nada inventado.

2. Nos casos A e B, junte e **reporte os números que o script imprimiu** (nunca os seus):
```
cd prospeccao/crm && node importar.mjs entrada-<nicho>-<regiao>.json
```
Sem Bash disponível: deixe a entrada gravada, diga que ela está pronta pra entrar e siga.
Se o comando falhar (sem Node, por exemplo), diga em português leigo que o painel precisa do Node,
**não repita o erro cru** e não deixe o run parecer quebrado — a lista e a planilha já estão salvas.

3. **Antes de sair procurando** (isso acontece lá no Step 2, não aqui): se `importar.mjs` existe no
   projeto, rode `node importar.mjs --skip` e trate a lista como já-visitada — não traga de novo quem
   está lá, e **nunca** traga quem está marcado `nao-perturbe` (é opt-out, não é preferência). Isso
   substitui o velho dedup por CSV, que continua valendo pros arquivos antigos.

4. No fechamento, diga o que aconteceu em uma linha, com o número real: *"joguei os N leads novos no
   seu painel (M já estavam lá). Quer que eu abra?"* — e só abra se ele pedir. Abrir é
   `cd prospeccao/crm && node servidor.mjs` em segundo plano; passe o endereço que ele imprimiu e
   avise que a janela do terminal fica aberta enquanto usa.
