# Backend — decisão técnica direta, sem venda

## Default: Supabase
Gerenciado, tier grátis cobre o volume atual (dezenas de leads, não milhares), Postgres de
verdade. Setup: criar projeto em supabase.com → botão **Connect** (ícone de plugue no topo) →
aba **Transaction pooler** → copiar a connection string, trocar `[YOUR-PASSWORD]` pela senha do
banco (definida na criação do projeto, resetável em Project Settings → Database). Guardar em
`.env.local` como `DATABASE_URL` (nunca em `NEXT_PUBLIC_`).

**Não use `service_role key` / API URL aqui.** A API REST do Supabase (PostgREST) não faz
`upsert ... on conflict` com lógica condicional, e o antigo endpoint `/pg/query` que o starter
original usava não é público em projeto hospedado, só existe em stack self-hosted. `lib/db.js`
conecta direto no Postgres via `postgres` (npm), o que dá SQL cru de verdade com o pooler.

Tabelas mínimas pro SPEC v1: `negocios` (o pipeline: id, nome, origem, estágio, valor
potencial, criado_em, atualizado_em) e `eventos_funil` (snapshot diário/período pra alimentar
`lib/economics.js`: leads, diagnósticos, propostas, fechados, perdidos, clientes_ativos, spend).
Guarde `raw jsonb` quando o dado vier de fonte externa (quiz, prospecção).

## Alternativa
Se em algum momento o Alvaro preferir não depender de mais uma conta externa, `lib/db.js`
abstrai o suficiente pra trocar por Postgres próprio (Neon, Railway) sem tocar nas telas. Só
faça essa troca se ele pedir — Supabase é a escolha padrão até haver razão pra mudar.

## Regra
Um dono da query (`lib/db.js`), nada de SQL espalhado nas telas. `service_role` só server-side,
RLS ligado mesmo que a service role passe por cima (defesa em profundidade, não custa nada).
