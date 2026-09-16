# raio-x-presenca.md — o retrato completo do negócio antes de você falar com ele

Site é só uma das janelas. Quem vende serviço precisa saber **como o negócio existe hoje**: onde ele
aparece, se está vivo nas redes, o que os clientes dizem dele, e se a empresa está regular. É isso
que separa "achei um site com defeito" de "conheço esse negócio".

Roda na **camada 4** (finalistas), nunca nos 200 da descoberta — é o passo caro.

---

## §1 — A restrição que define o método (medida em 2026-07-28)

**Instagram e Facebook não são mais legíveis por leitura direta.** Testado: o HTML cru do perfil
volta com centenas de KB de JavaScript, **sem** `og:description`, **sem** contador de seguidores,
**sem** data de post. O caminho antigo (ler o `og:description` do perfil) **morreu** — se você tentar,
volta vazio, e vazio não pode virar "não tem Instagram".

**O que funciona: a BUSCA.** O buscador indexa o que o perfil mostra publicamente e devolve isso no
resultado — seguidores, número de publicações, nota, número de avaliações, endereço. É a fonte certa
pra este capítulo inteiro. Uma busca por negócio costuma resolver várias frentes de uma vez.

---

## §2 — As buscas que fazem o retrato

Para cada finalista, dispare buscas dirigidas (junte o que der, não gaste uma busca por campo):

| O que você quer | Como buscar | O que costuma voltar |
|---|---|---|
| Perfil e tamanho no Instagram | `<empresa> <cidade> instagram` | link do perfil, seguidores, nº de publicações |
| Facebook | `<empresa> <cidade> facebook` | link da página, categoria, às vezes telefone |
| Google do negócio | `<empresa> <cidade> avaliações google` | nota, quantidade de avaliações, endereço, horário |
| Reputação | `<empresa> <cidade> reclamação OR avaliações` | Tripadvisor, guias, sites de reclamação |
| Está vivo? | `<empresa> <cidade>` (geral) | notícia, inauguração, mudança de endereço, "fechou" |

Regras:
- **Confirme que é a MESMA empresa** antes de anotar: cidade batendo, endereço batendo ou nome
  idêntico. Perfil de outra unidade ou de empresa homônima entra como dado errado — e dado errado é
  pior que dado ausente.
- O que a busca não devolveu fica **vazio**. Nunca escreva "sem Instagram" sem ter procurado; e se
  procurou e não achou, escreva "não achei perfil" (que é diferente de "não tem").

---

## §3 — Os campos que saem daqui

- `instagram` — @ do perfil. `instagram_numeros` — ex.: `4.816 seguidores · 563 posts`.
- `facebook` — a página.
- `google_negocio` — ex.: `4,3 de 5 (292 avaliações)`. `google_negocio_url` — o link do perfil/mapa.
- `redes_atividade` — a resposta pra "está postando?", **com a data ou o período que você viu**.
- `reputacao` — nota e volume, com a fonte (ex.: `4,3 no Tripadvisor, #55 de 769 na cidade`).
- `situacao_cadastral`, `porte`, `abertura` — dos dados públicos da empresa.
- `tecnologia` — como o site é feito, quando dá pra ver no HTML (WordPress e versão, construtor).

---

## §4 — "Está postando?" — o campo mais fácil de errar

A data do último post **não é lida diretamente** (o perfil não entrega isso sem login). Então:

- **Se a busca mostrar data** (um post indexado, uma notícia, um evento), use e cite: *"post indexado
  de março/2026"*.
- **Se não mostrar**, escreva o que você sabe e nada mais: *"perfil existe, com 4.816 seguidores; não
  consegui confirmar a última postagem"*. Isso é informação útil e honesta.
- **Nunca** transforme "não consegui ver" em "está abandonado". Abandono só vira SINAL com data na
  mão (§3 de `prova-do-problema.md`).
- Quando a atividade importar de verdade pro serviço vendido (social media, principalmente), monte o
  link do perfil e peça **um clique** ao usuário — o mesmo caminho honesto da Biblioteca de Anúncios:
  *"abre esse perfil e me diz a data do último post"*.

---

## §5 — Onde isso entra na pontuação

O raio-x não é enfeite: ele muda o lead.

- **Reforça o SINAL** quando confirma dor no serviço vendido: sem perfil nenhum e vendendo social;
  nota baixa com muitas avaliações e vendendo reputação; perfil com muitos seguidores e nenhum site
  (o negócio tem público e não tem casa própria — lead forte pra quem vende site).
- **Reforça o FIT** quando mostra porte e vida real: avaliações recentes, muitas fotos, movimento.
- **Deduz** quando mostra que o negócio pode estar morto ou irregular: situação cadastral não-ativa,
  "fechado permanentemente" no Google, sem sinal de vida em lugar nenhum. Lead assim sai da lista, e
  você diz por quê.

Um negócio com **público grande e presença digital fraca** é o lead mais valioso que existe pra quem
vende serviço: já tem demanda, e a falha é exatamente o que você conserta. Priorize esses.
