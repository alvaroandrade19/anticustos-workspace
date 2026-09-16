# lgpd-e-etica.md — aviso obrigatório + gate de ética no intake

Fonte: Guia Orientativo de Legítimo Interesse da ANPD (02/2024) + LGPD (Lei 13.709/2018) +
CDC. Framing sóbrio — **isto não é parecer jurídico**. As citações de artigo devem ser conferidas
na fonte oficial antes de serem repetidas como texto de lei.

---

## 1. Gate de ética no intake (Step 0 — roda ANTES de coletar qualquer coisa)

Classifica a intenção e o alvo. Recusa ou redireciona em UMA linha PT-BR sóbria, sem afirmar
classificação criminal:

- **Nicho-alvo ilegal / regulado por licença** (apostas/bet, agiotagem, pirâmide/marketing
  multinível enganoso, rifa não autorizada, golpe, "fique rico rápido"):
  > "Isso em geral é área regulada ou exige autorização específica, então não vou montar lista
  > de prospecção pra esse alvo. Se for outro serviço pra esse mesmo público, me diz."
  Não afirma crime; só recusa montar a lista.

- **Intenção de disparo em massa** ("é pra mandar pra todo mundo no WhatsApp", "lista pra
  blast", "disparo em massa"): NÃO recusa a prospecção — **redireciona** pro modo certo:
  > "Disparo idêntico em massa no WhatsApp é a causa nº1 de número banido e fura a LGPD. Eu te
  > entrego a lista qualificada com gancho individual pra você falar 1 a 1: fecha muito mais e
  > não queima teu número. Segue assim?"

- **Coleta de dado pessoal em escala / CPF** ("pega o CPF de todo mundo", "lista de pessoas
  físicas pra vender"): recusa.
  > "Essa skill trabalha com dado público de EMPRESA (CNPJ, razão social, contato comercial),
  > não com mineração de dado pessoal. Pra isso eu não vou."

Prospecção honesta de qualquer serviço lícito (tráfego, site, social, copy, consultoria, etc.)
→ segue normal.

---

## 2. Aviso LGPD/CDC obrigatório (emitir VERBATIM na 1ª saída de cada run)

Emite uma vez por run, antes de coletar. Texto:

> **⚠️ AVISO LGPD/CDC (leia antes de usar):** Esta ferramenta usa só dados **públicos de
> empresas** (CNPJ, razão social, CNAE, endereço, contato comercial), com base no Art. 7º, §4º
> da LGPD. Dado de empresa (PJ) não é dado pessoal, mas **nome de sócio/dono é dado pessoal**:
> trate com cuidado e prefira o canal comercial. Pra prospectar dentro da lei: (1) fale no canal
> **comercial/corporativo**, não no pessoal; (2) mensagem **relevante** pro ramo do contato;
> (3) **identifique-se** sempre (seu nome + sua empresa + por que está falando); (4) respeite
> **na hora** qualquer pedido pra parar, e tira de TODAS as suas campanhas; (5) guarde
> **registro da origem** dos dados e dos opt-outs, que é sua defesa numa fiscalização da ANPD.
> **Não dispare a mesma mensagem em massa no WhatsApp**, porque é a causa nº1 de número banido.
> Isto **não é parecer jurídico**: operação de alto volume valide com advogado de proteção de
> dados. _Base: Guia de Legítimo Interesse da ANPD (02/2024)._

(Pode encurtar visualmente em re-runs do mesmo nicho, mas o conteúdo dos 5 pontos + "não é
parecer jurídico" + opt-out permanece.)

---

## 3. Guardrails que viram regra da skill (encodar no comportamento)

- **Base legal certa = legítimo interesse (Art. 7º, IX) + dado manifestamente público (Art. 7º,
  §4º).** Consentimento é a base ERRADA pra cold B2B — **não citar consentimento** como base.
- **ANPD é leniente com dado público da Receita, dura com vazamento/scraping/spam.** O risco real
  é massa idêntica + ignorar opt-out — não "falar com um estranho uma vez".
- **Opt-out é imediato E vale pra todo o portfólio** (sai de TODAS as cadências). Regra dura nº1.
  No CSV isso vira a coluna `opt_out` (data) — e **toda run futura pula quem tem `opt_out`**.
- **WhatsApp = canal de continuidade, não de abertura fria em massa.** Nunca recomendar blast
  cold de WhatsApp como passo 1. O App Business é mais arriscado que a API pra volume.
- **Toda mensagem carrega remetente real identificável** (CDC Art. 33 + LGPD). Abordagem anônima
  fura os dois regimes.
- **"Não Me Perturbe"** (ANATEL/FEBRABAN) cobre telecom + financeiro de consumidor — mencionar só
  se o alvo for B2C financeiro/telecom.
- **Nome de PF lido no RDAP** (titular de domínio pessoa física) é dado pessoal → confiança no
  máximo PROVÁVEL + reforça o guardrail de "fale no canal comercial".
- 4 requisitos de validade da abordagem: **canal corporativo / relevância ao cargo / opt-out
  claro / auto-identificação**.

---

## 4. O que a skill NUNCA faz (mesmo que peçam)
- Não inventa contato, nome de decisor, e-mail ou "está rodando anúncio".
- Não monta lista pra disparo em massa idêntico.
- Não minera CPF / dado pessoal em escala.
- Não apresenta dado bloqueado/não-verificado como fato — marca `não confirmado` + o passo manual.
