# CONTEXT — decisões do CRM Anti Custos (leia antes de mexer)

Este app nasceu de um starter de curso de terceiro ("Ninja das Automações", pensado pra guiar
aluno não-técnico a montar o próprio painel). O esqueleto técnico era bom; o roteiro em volta
não servia pro nosso caso (vendia VPS por link de afiliado, escondia jargão de propósito, e a
economia era de checkout/e-commerce — pedido, ROAS, MEL de escala de anúncio). Reaproveitamos
só a base e reescrevemos a economia pro nosso modelo real: venda de serviço B2B por pipeline.

## O modelo de economia (`lib/economics.js`)
Não existe "pedido". Existe funil: lead → diagnóstico agendado → diagnóstico realizado →
proposta enviada → fechado/perdido → cliente ativo (recorrência). As constantes espelham
`_contexto/estrategia.md`: setup R$3.000, recorrência R$1.500/mês, meta de 20 clientes ativos.
Atualize as constantes ali se o preço mudar, nunca hardcode preço em tela.

## Princípios (herdados do starter, ainda valem)
- **Fonte única da verdade**: dado cru no backend, número derivado in-app (não dependa de dashboard de terceiro).
- **Segredo só server-side.** `DATABASE_URL`, `COMPOSIO_API_KEY`, `AUTH_SECRET` nunca em `NEXT_PUBLIC_`.
- **Um dono da query** (`lib/db.js`); nada de SQL cru espalhado nas telas; `esc()` no input do usuário.
- **Design**: radius 0, moeda pt-BR 2 casas, número mono tabular, sem gradiente em texto. Rebrande em `globals.css`.
- **Mobile cabe**: grids `minmax(0,1fr)`, tabela em `.scroll-x`, safe-area.
- **Deploy é ação de mundo real** → confirmar com o Alvaro antes de subir ou gastar (VPS, Supabase pago, Composio pago).

## Variáveis de ambiente
O harness bloqueia escrita em qualquer `.env*`, então não existe `.env.example` neste repo —
crie `.env.local` (dev) / `app.env` na VPS (produção) na mão, nunca commitado, com:
`AUTH_PASSWORD`, `AUTH_SECRET`, `DATABASE_URL` (connection string do Postgres, ver
`references/backend.md` — não é a `service_role key`), `COMPOSIO_API_KEY` (quando entrar),
`HOSTINGER_API_TOKEN` (só na hora do deploy).

## Acesso ao banco (correção de 18/09/2026)
A primeira versão de `lib/db.js`, herdada do starter, batia em `{SUPABASE_URL}/pg/query` com a
`service_role key`. Esse endpoint não existe em projeto Supabase hospedado (só em self-host) —
teria falhado silenciosamente. Trocado por conexão direta ao Postgres via pacote `postgres`,
usando `DATABASE_URL` (connection string do pooler). `sql` agora é template literal parametrizado
(`sql\`select ... where id = ${id}\``), não mais string com `esc()` manual.

## Como isso evolui
A skill `.claude/skills/crm/` (não mais aninhada num starter) é quem mantém isto vivo: adiciona
fonte de dado, ajusta estágio do funil, escreve tela nova. Rodar `/crm` de novo quando o pipeline
precisar de algo que a v1 não previu.
