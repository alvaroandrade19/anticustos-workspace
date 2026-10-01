# SPEC — CRM Anti Custos

## Pra que serve
Pipeline único de prospecção e clientes. Alvaro abre o cockpit e responde: quantos leads
entraram, quantos viraram diagnóstico, quantos viraram proposta, quantos fecharam, e quanto
disso já é receita recorrente (MRR). Decidido em entrevista direta em 17/09/2026.

## Estágios do funil
`lead` → `contato_feito` → `diagnostico_agendado` → `diagnostico_realizado` →
`proposta_enviada` → `fechado` / `perdido` → (fechado vira) `cliente_ativo`

Espelha as etapas de `Wiki/Gerencial/Vendas - Prospecção, Call e Fechamento.md`, sem o
ICP/script de clínica de lá (ver ressalva em `AGENTS.md`).

## Fontes de dado (automáticas na v1)
- **Prospecção manual** (`prospeccao/*.csv`, saída da skill `prospector`, schema fixo em
  `.claude/skills/prospector/reference/modelo-saida.md` §1): import por
  `crm/scripts/importar-prospeccao.js`, roda sob demanda ou no início da sessão. Cria/atualiza
  `negocios` em estágio `lead`, origem `prospeccao`, dedup por `cnpj` (fallback `empresa+lote`).
  Cada linha chega com `nota_calor`, `gancho_abordagem` e o dossiê inteiro guardado em `raw`.
- **Quiz de diagnóstico** (`/diagnostico`, Worker `quiz-leads` do projeto INLEAD, mesma conta
  Cloudflare): `crm/scripts/sincronizar-quiz.js` chama `GET {QUIZ_LEADS_WORKER_URL}/leads?token=
  {QUIZ_LEADS_ACCESS_TOKEN}` (variáveis já existem no `.env` da raiz do workspace) e faz upsert
  em `negocios`, estágio `lead` se `completou=false`, `diagnostico_realizado` se `completou=true`,
  origem `ads`, dedup por `id`. UTM (`utm.content`) vira o campo `criativo` pra casar com a
  nomenclatura de campanha do `AGENTS.md`.
- **Meta Ads (spend)**: fora do escopo da v1 (verba ainda pequena, R$30-60/dia). Quando entrar,
  ver `.claude/skills/crm/references/composio.md`.
- **Mudança de estágio**: manual, o Alvaro move o negócio na tela de pipeline.

## Achado durante o design (não vira fonte automática)
A skill `prospector` referencia uma skill companheira, `crm-leads` (kanban local dos leads de
prospecção, com opt-out e dedup próprios). Ela não está instalada neste ambiente (nem em
`~/.claude/skills/` nem no projeto) e **não entra no desenho**: consolidar tudo num pipeline só
é o objetivo desta skill, então o CSV do `prospector` entra direto em `negocios` por
`importar-prospeccao.js` em vez de passar por um segundo painel.

## Números do topo (fórmula em lib/economics.js)
- **CPL** = spend / leads (spend = 0 até Ads entrar na v2)
- **CAC** = spend / fechados
- **Taxa lead → diagnóstico**, **taxa show-up** (agendado → realizado), **taxa de fechamento** (proposta → fechado)
- **MRR** = clientes ativos × R$1.500
- **Receita de setup** = fechados no período × R$3.000
Janelas: hoje · 7d · 30d · mês.

## Telas
- **Cockpit** (existe): KPIs do topo, lê `negocios` de verdade quando `DATABASE_URL` está configurado, cai pra amostra senão.
- **Pipeline** (existe, `/pipeline`): lista todos os `negocios` ordenados por estágio e nota_calor, com ação de mover estágio por linha (server action, `lib/negocios.js::moverEstagio`).
- Login single-user (existe).

## Modelo de dados
- `negocios`: id, nome_empresa, origem (`prospeccao`|`ads`|`manual`), estagio, valor_potencial,
  nota_calor (nullable), criativo (nullable, só origem ads), cnpj (nullable), lote (nullable, só
  prospecção), criado_em, atualizado_em, raw (jsonb, o registro cru da fonte)
- `eventos_funil`: periodo, leads, diagnosticos_agendados, diagnosticos_realizados,
  propostas_enviadas, fechados, perdidos, clientes_ativos, spend — snapshot que alimenta
  `economics()`. Pode ser calculado on-the-fly a partir de `negocios` em vez de tabela própria;
  decidir na implementação conforme o volume (hoje é dezenas de linhas, não precisa de
  pré-agregação ainda).

## Fora do escopo (v1)
Ads/Meta Ads spend automático, Composio, deploy em VPS, notificação push, kanban separado de
prospecção (`crm-leads`).

## Como valida
Leads de hoje no cockpit == linhas novas em `prospeccao/*.csv` desde o último import + leads
novos retornados por `GET /leads` no Worker `quiz-leads` desde a última sincronização.
