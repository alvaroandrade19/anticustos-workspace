# metodologia.md — pipeline, budget do PRO, narração, modo degradado

## Índice
- §1 Pipeline por REQUISIÇÃO (uma vez por run)
- §2 Pipeline por LEAD
- §3 Budget tier pro piso do PRO (top-K profundo + cauda rasa)
- §4 Narração (PT-BR, sem nome de ferramenta)
- §5 Modo degradado / zero-resultado
- §6 Re-run: dedup, delta "o que mudou", próximo lote

---

## §1 — Pipeline por REQUISIÇÃO

1. **Gate de ética** (`lgpd-e-etica.md` §1) — recusa/redireciona alvo ilegal, blast em massa,
   mineração de CPF. Só então segue.
2. **Intake do ICP** — serviço + região (normaliza: cidade/UF/metro/nacional/online) + **o SINAL DE
   NECESSIDADE** (o que faz o cliente PRECISAR — deriva no `qualificacao.md` §0) + **N**. Info rica →
   não pergunta, confirma em 1 linha e vai. Info rasa → **um punhado de até 3 perguntas curtas numa
   ÚNICA chamada AskUserQuestion** (uma tela, não um debate de ida-e-volta), só as que faltam; fallback
   texto se indisponível. Vazio → pergunta o punhado + roda amostra, nunca trava (`SKILL.md` Step 1).
3. **Aviso LGPD** verbatim (`lgpd-e-etica.md` §2), uma vez.
4. **Histórico** — Glob `prospeccao/*.csv`; caminho com slug normalizado
   `<nicho>-<regiao>.csv` (lowercase, sem acento, UF sobre nome-de-cidade, sinônimo canônico de
   nicho). Se existe, Read → skip-set (CNPJ > telefone normalizado > empresa+cidade lowercase) +
   **todo `opt_out=true` no skip-set pra sempre**. Planeja delta + próximo lote.
5. **Sourcing** (`fontes.md` §5) — WebSearch descobre candidatos; pré-screen firmográfico → top-K.
6. **Loop por lead** (§2) — profundo no top-K, raso na cauda (§3).
7. **Dedup + append** — só grava lead novo; linha PT-BR: "X novos, Y já estavam (pulei)".
8. **Dois artefatos** (`modelo-saida.md`) — roll-up markdown + CSV cumulativo, escrita incremental.
9. **Tally honesto + handoff** — N pedido vs achado vs QUENTE; oferta de ampliar; handoff
   `/gerar-proposta` (sem citar método).

---

## §2 — Pipeline por LEAD

Ordem de toque (para no primeiro que resolve cada campo; nunca inventa):

1. **Domínio** — da descoberta. Tem site → fetch HTML. **Sem domínio → branch sem-domínio**
   (`descoberta-contato.md` §5): o "sem site" É o sinal de oportunidade (fit máximo de web
   designer), não uma lacuna. Enriquece por nome+cidade → (name→CNPJ manual) → QSA/telefone →
   WhatsApp de Maps/bio → decisor PROVÁVEL/NÃO CONFIRMADO. Não rebaixa automático um lead sem-site
   que tem WhatsApp funcional.
2. **RDAP** (`fontes.md` §2) → CNPJ + nome do titular (PJ ou PF) + e-mail admin/tech.
3. **Enrich CNPJ** — cadeia de fallback com backoff; normaliza situação (código→string) e nomes de
   campo. `email` geralmente null — não depende.
4. **Decisor** (`descoberta-contato.md` §1-3) → CONFIRMADO / PROVÁVEL / NÃO CONFIRMADO. Nunca chuta nome.
5. **Sinais da persona** (`qualificacao.md`) — grep HTML (pixel/viewport/HTTPS/copyright/parked);
   IG follower+bio (count-level, recência não verificável); **anúncio = human-browse guiado** ou
   proxy do pixel, rotulado; PageSpeed opcional (tolera 429).
6. **Contatos** (`descoberta-contato.md` §4) — e-mail por escada MX-gated + `email_confianca`;
   WhatsApp `wa.me/55…`; `origem_dado` por contato.
7. **`nota_calor`** = FIT(0–50) + SINAL(0–50) − deduções, **com a conta na tela** (`qualificacao.md` §score).
8. **Gancho** — só de fato verificável; sem fato, recusa o gancho e diz o porquê.
9. **Dossiê-card** + linha do CSV, incremental.

---

## §3 — VARREDURA PROFUNDA: o funil de 5 camadas (este é o padrão)

**A regra que manda aqui: garimpo largo, entrega estreita.** O usuário pede 5 leads — isso é o que
ele RECEBE, não o que você procura. Você procura **dezenas**, joga fora a maioria, e entrega só os
que sobreviveram com problema PROVADO. Um run que olhou 8 negócios e entregou 5 é um run fraco:
significa que quase nada foi descartado, ou seja, quase nada foi filtrado.

**Não pare por tempo. Pare por cobertura.** Demorar é aceitável e esperado. O que não é aceitável é
entregar lead raso porque a varredura foi curta.

### Camada 1 — Descoberta ampla (só busca, sem leitura de página)
Alvo: **60 a 200 nomes** de negócios reais. Se veio menos de 40 e ainda há ângulo não tentado, você
NÃO terminou esta camada. Rode **8 a 15 buscas de ângulos DIFERENTES** (a lista de ângulos está em
`fontes.md` §5): nicho+cidade, cidades vizinhas e bairros grandes um a um, guias e diretórios locais,
listas "melhores X em Y", associação/sindicato do setor, perfis do Instagram do nicho na cidade,
o gatilho da dor (recém-inaugurado, em expansão, reformando), e o nicho + termos do serviço.
Critério de parada: **3 buscas seguidas sem nenhum nome novo** = a veia secou, siga.
Nesta camada você anota só: nome, cidade, e o que o snippet já entregou (tem site? tem perfil?).

### Camada 2 — Triagem por snippet (de graça, sem gastar leitura)
Dos 60–200, corte sem dó e **diga quantos caíram em cada peneira**:
- fora do nicho ou fora da região;
- repetido (mesma empresa em duas buscas);
- **grande demais pra ser seu cliente** (rede nacional, franquia grande, multinacional) ou
  **pequeno demais** pra pagar o serviço, quando dá pra ver pelo porte;
- fechado / sem sinal de vida nenhum;
- quem já está na base do painel (skip-set).
Sobram: **30 a 60 candidatos**.

### Camada 3 — Verificação (1 leitura por candidato, é aqui que o problema aparece)
Nos 30–60, faça a checagem barata que **prova ou desmente** o problema, seguindo
`prova-do-problema.md`: abre o endereço, confere o que responde de verdade, lê o HTML.
Aqui a maioria cai — e cai porque **não tem problema nenhum**, o que é ótimo: é exatamente o filtro
que o usuário quer. Sobram: **os que têm defeito real, tipicamente 10 a 30**.

Se a leitura de página estiver bloqueada no ambiente, esta camada vira "sinal de busca" (tem site ou
não tem, existe ou não existe) e **você diz isso na cara** — não transforma suposição em defeito.

### Camada 4 — Dossiê completo (o caro, só nos finalistas)
Nos melhores — **no mínimo o dobro do N pedido, e nunca menos que 10** quando a camada 3 permitir —
roda a investigação inteira: registro do domínio, CNPJ e sócios, e-mail com checagem de MX,
**raio-x de presença** (`raio-x-presenca.md`: Instagram, Facebook, Google do negócio, reputação,
está postando?), decisor, anúncio, e o gancho ancorado na prova.

### Camada 5 — Entrega
- **Os N melhores** com dossiê completo, do mais quente pro mais frio.
- **A segunda fila**: os outros verificados que têm problema real mas ficaram fora do top N, em lista
  curta (nome, cidade, problema em 1 linha) — o usuário decide se quer o dossiê deles depois.
- **O placar da varredura, sempre**, em uma linha:
  *"Vasculhei 143 negócios, 47 passaram na triagem, 22 tinham problema de verdade, e te entrego os 5
  melhores."* Esse número é o que mostra o trabalho. Se ele for pequeno, o run foi pequeno — assuma.

### Custo, e o que fazer quando bater no teto
O gasto está na camada 3 e 4, não na 1. Descoberta é barata: 15 buscas cobrem dezenas de nomes.
Se o ambiente cortar no meio: **entregue o que já está pronto** (a escrita é incremental, nada se
perde), diga em que camada parou e com quantos, e ofereça continuar do ponto onde parou no próximo
run. Nunca reduza a AMPLITUDE da camada 1 pra economizar — reduza a quantidade de dossiês da
camada 4, que é o que custa.

### Modo rápido (só quando o usuário pedir)
Se a pessoa disser explicitamente que quer algo rápido / uma amostra / "só me dá uma ideia", aí sim
rode enxuto (1 camada de busca, 8 a 10 candidatos, verificação nos melhores) e **avise que foi uma
amostra**, oferecendo a varredura completa depois. Fora esse pedido explícito, o padrão é o funil
completo acima.

---

## §4 — Narração (PT-BR, sem jargão de ferramenta)

Antes: *"Vou fazer a varredura completa: procuro dezenas de negócios, jogo fora a maioria e te
entrego só os que têm problema de verdade. Não é rápido, e é de propósito. Vou salvando conforme
acho, então se travar no meio o que já achei tá lá."*

Entre camadas, **sempre com o número na frente** (é o que mostra o tamanho do trabalho) e sem citar
ferramenta: *"Levantando negócios do nicho... já são 68."*, *"Passando a peneira: caíram 41, sobraram
27."*, *"Conferindo um por um se o problema existe mesmo..."*, *"22 tinham defeito real. Montando o
dossiê dos melhores."*, *"Olhando redes, avaliações e quem decide..."*.

---

## §5 — Modo degradado / zero-resultado

Distingue dois estados e NUNCA fabrica lead pra fechar N. **Regra de linguagem:** fala sempre em
LEIGO — nunca cita RDAP, MX, HTML, "API de CNPJ", WebFetch ou nome de tool pro usuário. E **sempre
emite ≥2 linhas de progresso antes**, mantém o aviso LGPD, mostra a aritmética da nota (com
componente não-verificado rotulado) e fecha com o bloco "Próximo movimento" (handoff + nudge).

**IMPORTANTE — descoberta ≠ enriquecimento.** A DESCOBERTA da lista (busca de candidatos) e a
detecção de **"tem site / não tem site"** saem da **busca na web**, que é uma capacidade SEPARADA
do enriquecimento profundo (leitura de página/registro público). Se só o enriquecimento profundo
cai, **ainda dá pra entregar leads reais**: nome do negócio + cidade + se aparenta ter site +
FIT firmográfico do snippet — só o SINAL técnico e o contato/decisor ficam "a confirmar". NUNCA
trate "não consegui ler a página" como "não achei o negócio": continue a descoberta, entregue os
candidatos com FIT pontuado e o que faltou marcado. "Sem site" confirma-se pela busca (o negócio
aparece sem domínio próprio) — é SINAL, não pendência de leitura.

- **Nicho raso de verdade** (busca funcionou e voltou pouco): *"Busquei e esse nicho+região tem
  pouca empresa com presença online, achei só X reais. Quer ampliar pra [UF / cidade vizinha /
  nacional] ou afrouxar o filtro?"*
- **Coleta bloqueada** (não deu pra ler os dados públicos das empresas): *"Achei os negócios, mas
  não consegui ler os dados públicos deles agora pra confirmar contato e dono. Pode ser limite do
  plano ou indisponibilidade. Te entrego o que já achei marcado como 'a confirmar' e você reabre
  depois, ou tento de novo agora. O que prefere?"* (NÃO diz "o RDAP/MX/HTML caiu".)
- **Fonte pontual bloqueada** (um campo de um lead): vai pra DADOS INSUFICIENTES com o passo
  manual em linguagem leiga (ex.: "abre a Biblioteca de Anúncios nesse link e me diz se aparece
  anúncio"), sem valor chutado.
- **Nota em modo degradado:** mostra `FIT x/50 + SINAL ?/50 (não verificado) = provisório` — a
  aritmética aparece mesmo sem o sinal técnico; nunca vira só "a confirmar" sem conta. O FIT
  firmográfico (segmento/porte/região) quase sempre dá pra estimar da própria busca.

---

## §6 — Re-run: dedup, delta, próximo lote

- **Dedup:** pula quem já está no CSV (e pra sempre quem tem `opt_out=true`).
- **Delta "o que mudou":** nos leads já existentes, re-checa o sinal e emite o que mudou (ganhou/
  perdeu site, começou/parou de anunciar, mudou avaliação) e re-pontua. (Espelha o "o que mudou
  desde a última" da skill-ouro.)
- **Próximo lote:** "rodar de novo no mesmo nicho+região" **continua além do skip-set** (puxa
  leads novos), não re-acha os mesmos.
- **Nudge de re-run:** *"Roda de novo pra puxar o próximo lote (já pulo quem tá na lista), quando
  entrar em região/nicho novo, ou pra reconferir sinais, porque o mercado mexe."*
