# descoberta-contato.md — decisor, confiança, e-mail MX-gated, WhatsApp, branch sem-domínio

> Regra dura: **nunca inventar nome, e-mail ou telefone.** O fallback honesto é sempre contato de
> nível-empresa SEM nome — jamais um nome chutado. Nome errado queima a abordagem.

## Índice
- §1 Escada de descoberta do decisor
- §2 Ranking do decisor pela qualificação
- §3 Modelo de confiança (3 tiers)
- §4 E-mail por padrão + MX-gate + WhatsApp
- §5 Branch sem-domínio

---

## §1 — Escada do decisor (para no primeiro que resolve)

1. **RDAP** `rdap.registro.br/domain/<dom>.com.br` → CNPJ do titular em
   `entities[].publicIds[{type:"cnpj"}]`, razão social no vcard `fn`. Para **PJ a LGPD não redige o
   CNPJ**. Para **PF o NOME do titular aparece** no vcard `fn` (só o CPF vem mascarado) — é dado
   pessoal, então confiança no máx. PROVÁVEL. E-mail do contato admin/tech no vcard aninhado.
2. **CNPJ → QSA** (cadeia de APIs, `fontes.md` §2) → `sócios[]` com `{nome, qualificação}` (lembra
   da normalização de nomes de campo).
3. **Ranking pela qualificação** (§2).
4. **Fallback site/social** (quando o domínio é PF ambíguo, ou o QSA tem muitos sócios): scrape
   `/sobre`, `/quem-somos`, `/equipe`, rodapé; `site:linkedin.com/in <empresa> sócio OR fundador`;
   bio do Instagram. (Convenção, não fonte única — `heurística`.)

---

## §2 — Ranking do decisor pela qualificação

Ordena os sócios pela `qualificação` (quem manda):
- **Topo:** Presidente · Administrador · Sócio-Administrador · Titular · Diretor.
- **Depois:** Sócio · Conselheiro.
- **Decisor inequívoco:** natureza jurídica **MEI / Empresário Individual / Sociedade Unipessoal**,
  OU `qsa` com **1 sócio só** → esse é o dono, sem ambiguidade.
- Vários sócios sem um "Administrador" claro → não elege um; marca PROVÁVEL e lista os candidatos.

---

## §3 — Modelo de confiança (3 tiers — NUNCA inventa)

- **CONFIRMADO** — nome na QSA/titular da Receita com **dupla amarração** (mesma razão social/
  endereço E é o registrante/dono do domínio). MEI/EI de dono único = CONFIRMADO.
- **PROVÁVEL** — nome em `/sobre` ou LinkedIn como fundador/dono, mas SEM amarração ao QSA (ex.: 4
  sócios, não dá pra dizer qual manda); OU nome de titular PF do RDAP (dado pessoal).
- **NÃO CONFIRMADO** — sem QSA legível e sem dono no site → emite só contato de nível-empresa
  (`contato@`, WhatsApp comercial) e **diz explicitamente que o decisor não foi verificado**.

No dossiê, o campo é sempre `Decisor: <nome ou "não identificado"> (<CONFIRMADO|PROVÁVEL|NÃO CONFIRMADO>)`.

---

## §4 — E-mail por padrão + MX-gate + WhatsApp

**Ordem do e-mail** (lembra: `email` das APIs de CNPJ quase sempre vem null — não conta com ele):
1. E-mail real achado: admin/tech do RDAP, `mailto:` no HTML, e-mail na bio/contato.
2. **Role aliases** (alta taxa em hospedagem cPanel .com.br): `contato@`, `comercial@`,
   `atendimento@`, `vendas@`, `financeiro@`.
3. **Pessoal do nome do QSA:** `primeironome@`, `primeiro.sobrenome@`, `inicialsobrenome@`.

**MX-gate obrigatório antes de afirmar qualquer e-mail derivado:**
- `dns.google/resolve?name=<dom>&type=MX` → tem `Answer[]` com MX? Então o domínio **recebe**
  e-mail (o padrão é plausível). Sem MX → descarta o palpite.
- **Limite honesto:** MX-gate prova que o DOMÍNIO aceita e-mail, **não** que a caixa existe
  (nível-SMTP não é verificável sem enviar). E **catch-all** (20–30% das empresas) aceita qualquer
  endereço → marca `catch_all`.
- Por isso todo e-mail derivado carrega `email_confianca`:
  - `mx_ok` — e-mail real OU domínio com MX e padrão plausível.
  - `padrao_nao_verificado` — derivado, sem MX confirmado.
  - `catch_all` — domínio aceita tudo, não dá pra garantir a caixa.
- **Pattern-propagation:** confirmou o padrão de UM e-mail da empresa → aplica pro resto. O padrão
  costuma seguir o porte (1–10 func.: `primeironome@` ~71%; 51–200: `inicial+sobrenome@`; 1k+:
  `primeiro.sobrenome@`) — **percentuais são `heurística, não auditada`**, usa só pra priorizar
  qual permutação testar primeiro, nunca como certeza.

**WhatsApp:** tira tudo que não é dígito, prefixa `55` → `wa.me/55DDDNUMERO`. Fonte do número, em
ordem: Receita `ddd_telefone_1` > Google Maps/Business > rodapé do site > bio do Instagram.

---

## §5 — Branch sem-domínio (lead sem site)

Domínio não resolve / negócio só tem Maps+IG. **O "sem site" É o sinal de oportunidade** (fit
máximo de web designer) — NÃO é lacuna de dado, e não rebaixa a nota sozinho.

> **"Sem site" confirma-se pela BUSCA, não por leitura de página.** Se o negócio aparece no Maps/
> redes mas não tem domínio próprio indexado, isso já É o sinal — marca SINAL alto por "sem site"
> e segue. Não trave esperando "ler a página" (não há página). Um lead sem-site COM WhatsApp da
> bio/Maps é acionável → não leva o cap de "sem contato".

Enriquece por outra ordem:
1. **Nome + cidade** → confirma existência (Maps via busca) + segmento.
2. **name→CNPJ** (passo MANUAL, `fontes.md` §5) quando precisar do CNPJ → QSA/telefone via APIs.
3. **WhatsApp/telefone** de Maps/bio do IG (geralmente existe mesmo sem site).
4. **Decisor** fica PROVÁVEL/NÃO CONFIRMADO (sem RDAP pra amarrar) — contato de nível-empresa.
5. Dossiê deixa claro: *"Sem site = a oportunidade. Tem WhatsApp ativo, dá pra abordar."* Um
   lead sem-site COM WhatsApp funcional **não** leva o cap-baixo de "sem contato".
