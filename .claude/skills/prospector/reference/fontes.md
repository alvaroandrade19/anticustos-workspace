# fontes.md — fontes públicas BR, padrões de URL, o que é zero-config vs BLOQUEADO

Todas verificadas em 2026-06 no run de pesquisa (RDAP, CNPJ APIs, DNS MX, PageSpeed: fetch 200
confirmado; Meta/Google ad libraries: confirmado NÃO-fetchável). Onde diz "shape não byte-verificado",
confirma os nomes de campo com 1 call ao vivo antes de depender.

## Índice
- §1 Fontes fetcháveis zero-config (a espinha dorsal)
- §2 Tabela de URL patterns
- §3 Normalização: situação cadastral (código→string) + nomes de campo divergentes
- §4 O que é BLOQUEADO (login/JS/socket) — e o substituto honesto
- §5 Descoberta da lista (sourcing) + name→CNPJ manual

---

## §1 — Fontes fetcháveis zero-config (sem chave, sem instalar)

1. **RDAP registro.br** — titular do domínio .com.br. PJ: CNPJ + razão social, NÃO redigido.
   PF: **nome do titular aparece** (vcard `fn`), só o **CPF é mascarado** (`***.NNN.NNN-**`). E-mail
   dos contatos `administrative`/`technical` costuma vir no vcard aninhado.
2. **APIs de CNPJ zero-key** (cadeia de fallback — ver §2): razão social, QSA (sócios),
   telefones, situação, CNAE, natureza jurídica, porte. **`email` quase sempre vem null** — NÃO
   depende dele.
3. **DNS-over-HTTPS MX** (`dns.google`) — gate de e-mail: se o domínio tem registro MX, ele recebe
   e-mail; sem MX, descarta o palpite de e-mail.
4. **PageSpeed Insights v5** (keyless) — **best-effort**: dá HTTP 429 fácil em ambiente
   compartilhado. Usa se responder; se 429, segue sem ele (o score de web designer NÃO depende
   de PageSpeed — depende do grep no HTML, que sempre fetcha).
5. **HTML do próprio site** (WebFetch) — a mina de sinais: pixel, viewport, HTTPS, ano de
   copyright, página parkeada, mailto, links sociais.
6. **WebSearch** — descoberta de candidatos **e a fonte do perfil social/reputação**. É por aqui que
   saem seguidores do Instagram, número de publicações, nota e quantidade de avaliações do Google,
   Facebook e reputação. Ver `raio-x-presenca.md`.

> **Mudança medida em 2026-07-28 — não tente ler perfil de rede social direto.** O HTML cru de
> `instagram.com/<perfil>` e de `facebook.com/<pagina>` responde 200 com centenas de KB de
> JavaScript e **sem** `og:description`, **sem** contador de seguidores e **sem** data de post.
> O caminho antigo (ler o `og:description` do perfil) parou de funcionar. Vazio devolvido por fetch
> **não** é "não tem perfil" — é fetch cego. Use a busca.

---

## §2 — Tabela de padrões de URL

| Fonte | Padrão | Retorna | Nota |
|---|---|---|---|
| **RDAP .com.br** | `https://rdap.registro.br/domain/<dom>.com.br` (header `Accept: application/rdap+json`) | CNPJ em `entities[].publicIds[{type:"cnpj"}]`; razão social em vcard `fn`; e-mail admin/tech | 404 = domínio não registrado |
| **OpenCNPJ** (1º da cadeia) | `https://api.opencnpj.org/<CNPJ14>` | `QSA`, `situacao` (STRING "Ativa"), CNAE, porte, telefones | sem token; CNPJ só dígitos |
| **minhareceita** | `https://minhareceita.org/<CNPJ14>` | QSA, telefone, situação (CÓDIGO numérico) | 200 confirmado |
| **BrasilAPI** | `https://brasilapi.com.br/api/cnpj/v1/<CNPJ14>` | `ddd_telefone_1/2`, `qsa[]` (`nome_socio`,`qualificacao_socio`), `situacao_cadastral` (CÓDIGO) | shape confirmado |
| **cnpj.ws público** | `https://publica.cnpj.ws/cnpj/<CNPJ14>` | `socios[]`, natureza jurídica, qualificação | **limite 3/min grátis** (429 + penalidade). É o ÚLTIMO da cadeia |
| **DNS MX** | `https://dns.google/resolve?name=<dom>&type=MX` | `Answer[]` com MX = recebe e-mail | gate de deliverability |
| **PageSpeed** | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<SITE>&strategy=mobile` | score em `lighthouseResult.categories.performance.score`×100; LCP em `audits["largest-contentful-paint"].displayValue` | keyless → **429 fácil**; opcional |

**Cadeia de fallback do CNPJ** (tenta em ordem, com backoff curto entre tentativas; para no 1º que
responde com QSA): OpenCNPJ → BrasilAPI → minhareceita → cnpj.ws (3/min, deixa por último).

---

## §3 — Normalização obrigatória

### Situação cadastral (código numérico → string)
BrasilAPI/minhareceita retornam **número**; OpenCNPJ retorna **string**. Normaliza antes de pontuar:

| Código | Situação | Dedução? |
|---|---|---|
| `2` ou `"Ativa"` | ATIVA | não |
| `8` | BAIXADA | sim (forte) |
| `4` | INAPTA | sim |
| `3` | SUSPENSA | sim |
| `1` | NULA | sim (forte) |

Comparar com a STRING "ATIVA" sem normalizar pontua errado TODO lead — sempre mapeia o código.

### Nomes de campo divergentes (achata antes da escada do decisor)
- Lista de sócios: `QSA` (OpenCNPJ) | `qsa` (BrasilAPI) | `socios` (cnpj.ws).
- Nome do sócio: `nome_socio` | `nome`.
- Qualificação: `qualificacao_socio` | `qualificacao`.
- Telefone: `ddd_telefone_1`/`_2` (BrasilAPI) | `telefones[]` (OpenCNPJ).
Faz um adaptador mental: leia qualquer um desses como "sócios[] com {nome, qualificação}".

---

## §4 — BLOQUEADO (não é zero-config) + o substituto honesto

| Bloqueado | Por quê | Substituto honesto |
|---|---|---|
| **Meta Ad Library** (`facebook.com/ads/library`) | socket fechado em fetch server-side; precisa navegador | **human-browse guiado**: monta a URL pré-filtrada, usuário abre em 1 clique e te diz; OU proxy = Meta Pixel (`fbq(`) no HTML, rotulado como proxy |
| **Google Ads Transparency** (`adstransparency.google.com`) | SPA Angular, 2.5MB de shell JS, sem dado no HTML | idem human-browse; nunca afirma "roda Google Ads" por fetch |
| **Instagram e Facebook (perfil inteiro)** | login-wall + página montada por JS; **medido em 2026-07-28: sem og:description, sem contadores, sem data de post no HTML** | **a BUSCA é a fonte** (seguidores, nº de posts, nota, avaliações vêm no resultado indexado). Recência de post: só se a busca mostrar data, senão marca "não confirmei" ou pede 1 clique. Ver `raio-x-presenca.md` |
| **LinkedIn scrape** | frágil legal/técnico (Apollo banido 06/03/2025) | só busca pública indexada (`site:linkedin.com/in <empresa> sócio`), nunca replica o scrape |
| **Google Maps como backend de contato** | ToS proíbe diretório/publicidade | só como **sinal de existência** via WebSearch (confirma que o negócio existe) |
| **RDAP pra MINERAR lista** | política proíbe uso comercial/lista | usa pra **verificar** UM domínio/titular, não pra varrer a base |
| **SMTP mailbox-level** | não dá sem enviar | só MX-level (domínio aceita). Catch-all (20–30% das empresas) responde "sim" pra tudo → marca `catch_all` |
| **Reclame Aqui** | anti-scraping, cap pág. 50 | sinal **manual**, não dependência |
| **RFB open-data dump** (`dadosabertos.rfb.gov.br/CNPJ/`) | ConnectionRefused | sem backend zero-config pra discovery por CNAE — **diz isso**; enrich-by-CNPJ via OpenCNPJ é o caminho confirmado |

**Regra:** fonte bloqueada → o campo vai pra DADOS INSUFICIENTES com o passo manual. Nunca chuta valor.

---

## §5 — Sourcing (montar a lista de candidatos)

**Busque o SINAL DE NECESSIDADE, não só o nicho** (`qualificacao.md` §0). A query de presença
(`<nicho> <cidade>`) só monta a base; some uma camada que mira a DOR:
- **Serviço digital (site/tráfego/social/copy):** ache o nicho e depois CHEQUE cada um pelo sinal —
  `<nicho> <cidade>` → para cada candidato, vê se tem site (Maps sem campo "site" = lead de web
  designer), lê o HTML (pixel/viewport). Não há query mágica de "site ruim"; o sinal sai do fetch.
- **Serviço offline (pedreiro/contador/fotógrafo/marceneiro…):** busque o GATILHO, não o nicho do
  cliente. Padrões: `"reforma" <cidade>`, `"recém-inaugurado" <segmento> <cidade>`, `"empresa aberta
  recentemente" <cidade>`, anúncios de imóvel "precisa de reforma", notícia local de expansão/
  inauguração, diretório/sindicato do setor. O candidato é quem MOSTRA o gatilho, não qualquer
  empresa do ramo.
- **IA aplicada / automação (Anti Custos):** busque o CUSTO DO PROCESSO MANUAL, não o nicho. O
  ângulo mais forte é o **anúncio de vaga** (tem data, cargo e prova clicável). Padrões:
  `vaga atendente OR recepcionista OR "auxiliar administrativo" <cidade>`,
  `site:vagas.com.br <cargo> <cidade>`, `site:indeed.com.br <cargo> <cidade>`,
  `<segmento> <cidade> avaliações google` (procure "não atendem", "não responderam", "demorou"),
  `<segmento> <cidade> reclame aqui demora atendimento`,
  `<segmento> <cidade> "orçamento pelo whatsapp"`,
  `"inauguramos" OR "nova filial" <segmento> <cidade>`.
- **Fontes de gatilho não-digitais (sinal, não backend):** anúncio de imóvel (OLX/Zap como sinal de
  reforma), Maps "aberto há pouco"/avaliações recentes, notícia local, post público de inauguração.
  Trate como SINAL via WebSearch — nunca como diretório pra raspar em massa (mesma regra do Maps, §4).

- **Local — os ângulos da camada 1** (`metodologia.md` §3 manda rodar 8 a 15 buscas DIFERENTES, não
  uma; alvo de 60 a 200 nomes). Cada linha abaixo é um ângulo que descobre negócios que os outros
  não descobrem:
  1. `<nicho> <cidade>` e `<nicho> <cidade> contato`
  2. **cada cidade vizinha e cada bairro grande, um por busca** (é o que mais multiplica a lista)
  3. `melhores <nicho> <cidade>` / `<nicho> <cidade> lista` (listicles e guias locais)
  4. `site:instagram.com <nicho> <cidade>` (quem só existe no perfil)
  5. diretório/guia local (guiamais, apontador, guia da cidade) e **associação ou sindicato do setor**
  6. `<nicho> <cidade>` + termo do serviço vendido (ex.: `orçamento`, `agendamento`, `delivery`)
  7. o **gatilho da dor** (`qualificacao.md` §0): recém-inaugurado, em expansão, reformando, mudou de endereço
  8. notícia local do setor (inauguração, feira, prêmio) — de onde saem nomes que não aparecem em busca comum
  Maps confirma existência.
  **Parada:** 3 buscas seguidas sem nome novo. Antes disso, você não terminou a descoberta.
- **Nacional/online:** tira o token de cidade, busca por vertical/segmento + sinais de canal
  (`<nicho> Brasil`, `<nicho> loja online`, marketplaces, diretórios de associação do setor).
- **name→CNPJ:** **não há rota grátis programática confirmada** (casadosdados POST deu 404; RFB dump
  fora do ar; cnpj.biz é só UI). Quando precisar do CNPJ a partir do nome, é **passo manual** na UI
  do `cnpj.biz/empresas` ou `casadosdados.com.br` → pega o CNPJ → joga nas APIs JSON do §2. Diz isso
  ao usuário; **não promete busca por nome automática**.
- **Pré-screen firmográfico** barato (nicho/região/porte batem?) → escolhe o **top-K** pra varredura
  profunda; o resto leva passo raso (Maps/IG), rotulado. Ver `metodologia.md` §budget.
