# modelo-saida.md — planilha, painel, dossiê por lead, roll-up, handoff

Tudo PT-BR, tom anti-guru. Escrita **incremental** (cada lead vira linha da planilha + card no roll-up
assim que clareia — se travar, o que já achou tá salvo). Duas saídas por run:
`prospeccao/<nicho>-<regiao>.csv` (planilha), `prospeccao/<nicho>-<regiao>.md` (roll-up +
dossiês). O CSV é também a entrada do CRM interno da Anti Custos (§5), sem arquivo à parte.

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

**Acompanhamento saiu da planilha.** As colunas `status`, `ultimo_contato` e `proxima_acao` não
existem mais aqui: quem cuida disso agora é o pipeline do CRM interno (§5), que guarda o estágio
do funil sem você mexer em planilha. A planilha é o **resultado da pesquisa**; o CRM é o
**acompanhamento**. Opt-out (marcar "não perturbe" um lead específico) ainda não existe no CRM,
ver nota no fim do §5.

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
- **Acompanhe no pipeline:** os leads já entraram sozinhos no CRM interno da Anti Custos (§5) —
  abre `npm run dev` dentro de `crm/` e olha `/pipeline` pra ver estágio, calor e gancho de cada
  um, e mover quem você já contatou pro próximo estágio.
- **Re-roda** pra puxar o **próximo lote** (já pulo quem tá na lista), quando entrar em região/
  nicho novo, ou pra reconferir sinais, porque o mercado mexe.
- **Escolheu um QUENTE?** O dossiê já tem Negócio + Sinal + Gancho prontos. Roda **`/gerar-proposta`**
  apontando pra esse lead que ela monta a proposta sem você redigitar nada.
```

---

## §4 — Handoff (regra)
- Aponta pro CRM interno pra acompanhar (§5) e pra `/gerar-proposta` pra propor, se essa skill
  estiver instalada neste workspace (confira antes de citar, ela não vem por padrão aqui).
  **Nunca cita curso nem método de fora do pack** (o pack é standalone — decisão 2026-06-07).
- O handoff é concreto: passa o dossiê do lead escolhido (Negócio/Sinal/Gancho) como entrada da 07.

---

## §5 — Entrega pro CRM interno

Todo run que achou pelo menos 1 lead também entra sozinho no CRM interno da Anti Custos (`crm/`,
skill `/crm`), sem arquivo intermediário: o CSV que o §1 já escreve é a própria fonte que o
importador lê, não existe painel separado nem `leads.json` próprio desta skill.

1. Depois de fechar `prospeccao/<nicho>-<regiao>.csv`, rode a partir da raiz do workspace:
```
node crm/scripts/importar-prospeccao.js
```
Ele lê **todos** os CSV em `prospeccao/`, não só o de agora, então é seguro rodar mesmo com lotes
antigos por perto. É idempotente (reimporta sem duplicar, por CNPJ ou nome+lote quando falta CNPJ)
e **nunca regride o estágio** de um lead que o Alvaro já moveu no pipeline manualmente.

2. **Reporte o número que o script imprimiu, nunca invente um:** algo como *"joguei N leads novos
   no CRM (M já estavam lá, só atualizei o dossiê deles)."*

3. Se o comando falhar (Node ausente, ou `DATABASE_URL` não configurado em `crm/.env.local`), diga
   em português simples que o CRM ainda não está de pé nesta máquina, **não repita o erro cru**, e
   não deixe o run parecer quebrado, a planilha e o roll-up já estão salvos de qualquer jeito.

**O que este fluxo ainda não cobre:** opt-out (marcar "não perturbe" um lead específico) não existe
no CRM hoje, o dedup é só por identidade (CNPJ/nome), não por preferência de contato. Se isso virar
necessidade real, o ajuste é em `crm/scripts/importar-prospeccao.js` e na tabela `negocios`
(`crm/docs/schema.sql`), não nesta skill.
