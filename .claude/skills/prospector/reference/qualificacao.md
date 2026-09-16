# qualificacao.md — derivação do sinal de necessidade, sinais por persona, pivô do anúncio, nota_calor

> Regra-mestre: prospecção é achar **NECESSIDADE**, não presença. Uma lista de "todos os X da cidade
> Y" qualquer extrator faz. O que vale é o cliente com um **sinal público de que precisa do serviço
> AGORA**. A MESMA empresa pontua OPOSTO por persona; o pivô é **"está rodando anúncio?"** — rodando →
> gestor/copy dominam; parado → web designer/social dominam. Emite score **por sinal**, nunca um score
> global cego. (As regras de conflito/derivação são síntese própria — `heurística`.)

## Índice
- §0 **Motor de derivação do sinal de necessidade — pra QUALQUER serviço (inclusive offline)**
- §1 Como detectar cada sinal DIGITAL (a partir do que é fetchável)
- §2 Checklist por persona (exemplos trabalhados do §0)
- §3 O pivô do anúncio (human-browse) — o que a skill PODE e NÃO pode afirmar
- §4 nota_calor — a conta (FIT + SINAL − dedução)

---

## §0 — Motor de derivação do sinal de necessidade (qualquer serviço)

As 4 personas do §2 (gestor / web designer / social / copy) são **exemplos** deste motor. Pra
QUALQUER outro serviço — pedreiro, contador, fotógrafo, marceneiro, personal, consultor — você
DERIVA o sinal do zero, em 4 passos, ANTES de sair buscando:

1. **QUEM compra esse serviço?** (o tipo de negócio/pessoa que paga por isso.)
2. **Qual o SINAL PÚBLICO de que essa pessoa precisa AGORA?** Um de três tipos:
   - **Defeito** — algo que ela tem e está ruim (site feio, fotos amadoras, fachada caindo).
   - **Falta** — algo que ela deveria ter e não tem (sem site, sem anúncio num nicho de volume).
   - **Gatilho** — um evento recente que cria a demanda (abriu agora, está reformando, expandindo,
     mudou de endereço, contratou, lançou produto).
3. **ONDE esse sinal é visível publicamente?** (qual fonte mostra — HTML do site, foto do Maps,
   anúncio de imóvel, notícia, "recém-inaugurado" no Maps, diretório do setor.)
4. **BUSQUE o sinal, não só o nicho.** A query vai atrás da DOR (`SKILL.md` Step 3 + `fontes.md` §5).

**Regra dura — necessidade é OBSERVÁVEL, nunca inventada.** Se você não consegue VER o sinal numa
fonte pública nesta sessão, o lead é **só-FIT** (firmográfico: nicho/porte/região batem) — marca
`sinal não observável publicamente` e ele é MORNO no teto. NUNCA invente a dor ("provavelmente o site
é ruim"); ou você viu, ou não viu.

**Regra dura — não force a lente digital onde ela não se aplica.** Pra serviço OFFLINE, o site
(pixel/viewport/PageSpeed) costuma ser IRRELEVANTE: um pedreiro-cliente não precisa de site bom. NÃO
penalize "sem site" nem pontue qualidade de página — o SINAL vem do gatilho/defeito/falta da tabela
abaixo. O §1 (sinais de HTML) só vale quando o PRÓPRIO serviço é digital (site/tráfego/social/copy).

### Tabela de derivação (arquétipos — estenda pro serviço que aparecer)
O usuário pode vender QUALQUER coisa; use isto como molde, não como lista fechada.

| Serviço do usuário | Quem precisa | Sinal público de "precisa agora" | Onde achar (fonte pública) |
|---|---|---|---|
| **Site / web design** | negócio ativo sem site bom | sem site; ou site sem HTTPS/viewport, copyright ≥2 anos, parkeado (3+ = quente) | HTML do site (§1); Maps sem campo "site" |
| **Gestor de tráfego** | negócio que vive de volume (estética, odonto, e-com) | anuncia mas sem pixel (cego); ou não anuncia num nicho que deveria | pixel no HTML (§1) + Biblioteca de Anúncios (§3, human-browse) |
| **Social media** | negócio com perfil fraco | bio vazia/sem proposta/sem link, follower baixo pro porte | `og:description` do IG (§1) |
| **Copywriter** | página viva com copy fraca | copy institucional, sem CTA, jargão, "descreve em vez de vender" | HTML da página/LP (§1) |
| **Pedreiro / reforma / obra** | quem constrói/reforma/abre | imóvel "precisa de reforma"; negócio "recém-inaugurado" (obra de loja); construtora que terceiriza; post de expansão | busca "reforma <cidade>", anúncio de imóvel, "recém-inaugurado" no Maps, notícia local |
| **Contador** | empresa nova / MEI / negócio crescendo / insatisfeito com o atual | abriu empresa há pouco; reclamação do contador atual; crescimento | busca "empresa aberta recentemente <cidade>", review/reclamação, Maps de negócio novo |
| **Fotógrafo (produto/comida/imóvel)** | e-com/restaurante/imobiliária com foto ruim | fotos amadoras/pixeladas no site, cardápio sem foto de prato, anúncio de imóvel com foto de celular | fotos do site/Maps/anúncio (olhar a imagem no snippet/HTML) |
| **Marceneiro / móvel planejado** | quem reformou/mudou/abriu | mesmos gatilhos do pedreiro (obra, mudança, loja nova) | idem pedreiro |
| **Consultor B2B (genérico)** | empresa com o problema que ele resolve | sinal do problema específico (ex.: gestão financeira → crescimento desordenado, reclamações) | varia — se não der pra observar, é só-FIT, marca honesto |
| **IA aplicada / automação (a persona da Anti Custos)** | PME com volume real e equipe pequena, gastando gente em tarefa repetitiva | vaga aberta pra atendimento/recepção/administrativo; avaliação reclamando de demora pra responder; atendimento só manual e em horário comercial; agendamento ou orçamento só por telefone/WhatsApp; acabou de expandir | anúncio de vaga (Indeed, Vagas, Catho, Gupy, post no IG/LinkedIn), avaliações do Google, Reclame Aqui, página de contato do site, notícia local de expansão |

> Não achou um arquétipo? Rode os 4 passos do topo do §0 na hora e EXPLIQUE pro usuário, em 1 linha,
> qual sinal você decidiu caçar (*"pra vender X, vou atrás de quem mostra Y. Concorda?"*) — isso deixa
> o usuário corrigir a mira antes de gastar busca. A coluna "Onde achar" é `heurística`: confirma na
> busca ao vivo, não promete uma fonte que não abriu.

**Regra dura — o gatilho tem que aterrissar num NEGÓCIO CONTATÁVEL, não numa categoria.** Sinal de
gatilho (sobretudo offline) costuma apontar pra algo difícil de contatar — "imóveis anunciados pra
reforma" é uma CATEGORIA, não um cliente. Antes de listar, traduza o gatilho pro **negócio nomeado e
contatável mais próximo dele**:
- Imóvel "precisa de reforma" → o cliente acionável é o **dono/quem anuncia** (às vezes a **imobiliária**
  que toca o anúncio — essa tem telefone público). Lista a imobiliária/anunciante, não "o imóvel".
- "Recém-inaugurado" → lista o **negócio novo** (tem nome, Maps, telefone) — não "lojas novas em geral".
- "Construtora que terceiriza" → é um negócio nomeado com CNPJ/contato — ótimo lead acionável.
Se o gatilho NÃO resolve num negócio com nome + canal de contato (só numa categoria), **diga isso ao
usuário** e ou (a) pivota pro negócio-vizinho contatável (a imobiliária, o portal), ou (b) monta o
**passo guiado** ("abre este anúncio/este perfil e me diz o contato", igual ao pivô do anúncio §3) —
nunca entrega "categoria" fingindo que é lead. Um lead sem nem-nome-nem-canal não conta pra N.

> **Assimetria que você deve nomear:** pra serviço DIGITAL o sinal "sem site" fecha o lead só com a
> busca (o negócio aparece nomeado, sem site = sinal). Pra serviço OFFLINE o gatilho quase sempre pede
> um passo a mais (abrir o anúncio/Maps pra achar o contato). Avise o usuário: *"no teu caso o sinal tá
> no anúncio/Maps, então pra alguns vou precisar que você abra 1 link e me diga o contato, ou rode de
> novo que eu aprofundo."* Isso é honesto e mantém o lead REAL, não uma categoria.

---

## §1 — Detecção de sinais (só do que fetcha)

Tudo abaixo sai do **HTML do site** (grep no source) ou do **snippet de busca** — zero login:

- **Meta Pixel:** `fbq(` , `connect.facebook.net` , `fbevents.js` no HTML. Presença = já mexeu com
  tráfego/rastreamento. Ausência num site que vende = "rodando às cegas".
- **GA4 / GTM:** `gtag(` , `gtag/js?id=G-` (GA4) ; `GTM-` , `dataLayer` (GTM).
- **Mobile/responsivo:** existe `<meta name="viewport" content="width=device-width...">`? Sem isso
  = site velho, não-responsivo.
- **HTTPS:** o site resolve em `https://` sem erro de certificado?
- **Copyright/atualidade:** ano no rodapé / `© 20XX`; blog/notícia com data ≥2 anos atrás = defasado.
- **Página parkeada:** frases-gatilho ("domínio à venda", "this domain is for sale", "GoDaddy",
  "Sedo", "Hospedado por", página em branco com só um logo de hosting). Monta sua lista amostrando
  parkeados .com.br reais (a lista exata é `heurística` — confirma no run).
- **Instagram (sem login):** `og:description` do perfil traz "X Followers, Y Following, Z Posts" +
  a bio. Pega follower count e se a bio tem proposta/contato. **Recência do último post NÃO é
  verificável sem login** — marca "não verificável" (não afirma "feed parado há N meses").
- **Existência/avaliação:** WebSearch confirma que o negócio existe no Maps + nota/nº de
  avaliações quando aparece no snippet (sinal de negócio vivo).

---

## §2 — Checklist por persona

### GESTOR DE TRÁFEGO
- **QUENTE:** roda anúncio AGORA **mas mal** — tem pixel mas a página de destino é lenta/não-
  responsiva; OU anuncia e NÃO tem pixel no HTML (mede nada); OU anúncios recém ficaram inativos
  (churn — só via human-browse). "Rodando às cegas" = lead quente clássico.
- **NEUTRO/EDUCATIVO:** não roda anúncio nenhum → é outro pitch (começar do zero), não o hot lead core.
- Sinais-chave: pixel ausente/presente + destino lento + status de anúncio (human-browse).

### WEB DESIGNER
- **QUENTE:** **não tem site** apesar do negócio estar ativo (fit máximo!), OU o site bate **3+**
  sinais estruturais.
- Sinais (1 ponto cada): sem viewport (não-responsivo); sem HTTPS; copyright/blog defasado ≥2
  anos; página parkeada; (se PageSpeed respondeu) mobile <80.
- **Anúncio é NEUTRO** pra essa persona — o que importa é a página.
- Regra numérica (`heurística` validada no BR): **3+ sinais = QUENTE** ("refazer é timing, não
  pergunta"); 1–2 = morno.

### SOCIAL MEDIA
- **QUENTE:** perfil existe MAS fraco — bio vazia/sem proposta, sem link/contato (só linktree
  genérico), follower count estagnado/baixo pro porte. (Recência do feed = não verificável sem
  login; não usa "parado há N meses" como gatilho duro.)
- **FRIO:** bio com proposta de valor + contato, perfil claramente cuidado.

### COPYWRITER
- **QUENTE:** página viva (especialmente LP de anúncio) com copy institucional / lista de
  features, SEM CTA imperativo, com jargão, "descreve o produto em vez do benefício".
- **FRIO:** página já com CTA forte + copy de benefício.

### IA APLICADA / AUTOMAÇÃO (a persona da Anti Custos)
Vende instalação de IA e automação pra PME cortar custo operacional (R$ 3.000 de instalação +
R$ 1.500/mês de recorrência). O cliente dessa persona não precisa de site bonito: precisa parar de
pagar gente pra fazer o que uma máquina faz. **Não rode a lente de web designer aqui.** Site velho
não é sinal, site bom não é dedução, pixel não interessa.

- **QUENTE:** dois ou mais dos sinais abaixo, cada um com prova clicável:
  1. **Vaga aberta** pra atendente, recepcionista, SDR, auxiliar administrativo, agendamento,
     cadastro ou telemarketing. É o sinal mais forte da persona: o negócio está prestes a assinar
     um salário pra exatamente o trabalho que a instalação substitui, e o anúncio vem com data,
     cargo e às vezes faixa salarial (o número que faz a conta do R$ 1.500/mês se explicar sozinha).
     `prova_url` = o anúncio da vaga.
  2. **Avaliação pública reclamando de demora:** "ninguém atende o telefone", "mandei mensagem e
     não responderam", "esperei três dias pelo orçamento". É o custo do processo manual aparecendo
     como cliente perdido. `prova_url` = a página de avaliações, e cite o trecho.
  3. **Atendimento declaradamente manual e limitado:** página de contato que só oferece formulário
     ou WhatsApp, "retornamos em até 48h", horário comercial estrito, nenhum agendamento online num
     negócio que vive de agenda. `prova_url` = a página de contato.
  4. **Volume comprovado com equipe pequena:** muitas avaliações no Google (demanda real) somadas a
     porte ME/EPP na Receita (mão de obra curta). Sozinho isso é FIT, não sinal. Junto com 1, 2 ou 3
     fecha o retrato.
  5. **Gatilho de expansão:** abriu filial, inaugurou, contratou em lote, saiu em notícia de
     crescimento. Volume subindo em processo manual é onde a dor nasce.
- **MORNO:** só o item 4, ou um único sinal fraco. Encaixe certo, sem motivo pra falar hoje.
- **FRIO:** quem já resolveu (agendamento online funcionando, resposta automática ativa, chatbot
  próprio) ou quem é pequeno demais pra sustentar a recorrência (ver a dedução de porte no §4).
- **Segmentos que costumam concentrar essa gordura:** clínica (odonto, estética, fisioterapia),
  oficina mecânica, imobiliária, escritório de contabilidade, escola e curso livre, distribuidora e
  atacado, laboratório, pet shop, advocacia, e-commerce pequeno.
- **O que NÃO conta como sinal aqui:** site velho, ausência de pixel, PageSpeed baixo, perfil de
  Instagram fraco. Isso é a lente das outras personas; usar aqui é inventar dor no lugar errado.

### GENÉRICO (fallback — quando o serviço não mapeia limpo numa persona)
- FIT firmográfico puro (segmento/porte/região certos) + qualquer problema observável: sem site
  mas com telefone, nota alta no Google com marketing fraco, avaliação recente (negócio vivo).

> Serviço mapeia em ≥2 personas (ex.: "marketing" → gestor+social+copy)? Pontua sob CADA uma e
> mostra a lente mais forte. Mapeia em nenhuma? Cai no GENÉRICO — nunca trava.

---

## §3 — O pivô do anúncio: o que PODE e NÃO pode afirmar

Meta Ad Library e Google Ads Transparency **não são fetcháveis** (`fontes.md` §4). Então:

- **O que a skill PODE afirmar por fetch:** "tem/não tem Meta Pixel no HTML" (proxy de já ter
  mexido com tráfego). Rotula como **proxy**, não como "está anunciando".
- **O que a skill faz pra confirmar anúncio:** monta a URL pré-filtrada da Biblioteca de Anúncios
  e pede 1 clique:
  > "Pra confirmar se [empresa] tá anunciando agora, abre este link (1 clique) e me diz se aparece
  > anúncio ativo: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=<NOME>&search_type=keyword_unordered&media_type=all`
  > Se preferir, eu marco como 'não verificado'."
- **O que NUNCA faz:** afirmar "está rodando anúncio" / "roda Google Ads" a partir de um fetch que
  não retornou. Sem confirmação → o sinal vai pra DADOS INSUFICIENTES.

---

## §4 — nota_calor (100 pontos, mostra a conta)

`nota_calor = FIT (0–50) + SINAL (0–50) − deduções`

- **FIT (0–50):** firmográfico — segmento certo, porte coerente com o serviço, região certa. Lead
  frio não tem dado comportamental → o peso vai pro SINAL observável, **nunca fabrica engajamento**.
- **SINAL (0–50):** força da evidência de problema-agora — pela checklist da persona (§2) OU pelo
  sinal derivado no §0 (defeito / falta / gatilho), pra serviço offline. **Lead só-FIT (nicho/porte/
  região batem mas NENHUM sinal de necessidade observável) → SINAL baixo e tier MORNO no teto**: é
  um nome certo sem prova de que precisa AGORA, não um lead quente. **Divide em dois tipos:**
  - **SINAL-de-busca** (confirmável só com a busca na web — funciona mesmo sem fetch profundo):
    **"sem site" confirmado pela busca**, existência no Maps, nota/avaliação no snippet, ausência
    de perfil/IG, bio fraca visível no snippet. Esses **pontuam normalmente**, não viram "não verificado".
    Pra web designer, "sem site" confirmado é SINAL ALTO (ex.: 35–45/50), não pendência.
  - **SINAL-de-fetch** (precisa ler a página/registro: pixel, viewport, PageSpeed, status de
    anúncio): só some quando o fetch profundo cai → entra como **parcial**.
  - Sinal só suposto (sem evidência viva de NENHUM dos dois tipos) NÃO soma.
- **Deduções (cap):**
  - situação cadastral ≠ ATIVA (código ≠ 2 / ≠ "Ativa") → −, forte se BAIXADA/NULA.
  - sem nenhum canal de contato funcional (sem telefone/WhatsApp/e-mail MX-ok) → cap baixo, por
    melhor que seja o fit (lead inacionável).
  - **porte incompatível com a recorrência** (persona de IA aplicada): negócio sem musculatura pra
    R$ 1.500/mês (MEI de uma pessoa só, autônomo sem equipe, nenhum sinal de volume) → cap de FIT,
    por mais forte que seja o sinal. Lead que precisa mas não paga não é lead.
  - duplicado de run anterior → fora (dedup).
  - sinal que é só suposição sem evidência → não conta como SINAL.
- **Thresholds:** **QUENTE ≥70 · MORNO 45–69 · FRIO <45**.
- **Mostra a aritmética por lead SEMPRE:** `FIT 38/50 + SINAL 30/50 − 0 = 68 → MORNO`. Penalizou?
  Mostra como item de linha (`−10 situação SUSPENSA`), nunca "arredondei".
- **Forma SEMPRE completa:** `FIT x/50 + SINAL y/50 − dedução = total → tier`. Nunca corta o
  `− dedução` nem o `→ tier`, mesmo quando a dedução é 0 (`− 0`) e mesmo em modo degradado.
- **Fetch profundo bloqueado / modo degradado:** o SINAL-de-busca (sem-site, existência, nota,
  ausência de IG) **ainda pontua de verdade**; só o SINAL-de-fetch (pixel/anúncio/PageSpeed) fica
  pendente. Mostra a conta com o que tem + a parte pendente rotulada:
  `FIT 42/50 + SINAL 35/50 (parcial: sem-site confirmado; pixel/anúncio a confirmar) − 0 = 77 →
  QUENTE (parcial)`. Se NENHUM SINAL é confirmável (nem por busca), aí sim
  `+ SINAL ?/50 (não verificado)` e tier `provisório`. **Nunca** vira só "a confirmar" sem a
  conta; nunca fabrica SINAL.
- **Multi-persona:** quando o serviço mapeia em ≥2 personas, mostra a conta SOB CADA persona
  aplicável e destaca a lente de maior nota (ex.: `gestor 62 · social 48 → lente gestor`).
- **No-domain não cai automático:** um lead sem site COM WhatsApp funcional pode ser QUENTE pra web
  designer (sem-site = SINAL alto), não rebaixa por "faltou domínio".

> O gancho (1ª linha de personalização) sai de um **fato verificável** do negócio ("4.7★ com 38
> avaliações mas sem site"). Sem fato → recusa o gancho e diz o porquê. (Vendor BR diz fato-real
> 12–22% vs merge-field 2–5% de resposta — `heurística, não auditada`.)
