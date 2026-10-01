# Composio — só quando a automação valer a pena

Composio (composio.dev) dá OAuth gerenciado pra puxar dado de app externo (Meta Ads, Google
Sheets, etc.) sem guardar chave na mão. É opcional aqui, ao contrário do starter original, que
tratava isso como passo obrigatório de toda entrevista.

## Quando entra
- **Meta Ads → spend automático**: só quando o volume de campanha justificar automatizar (hoje
  é R$30-60/dia, ainda dá pra digitar o spend do dia direto no CRM). Reavalie quando a verba
  de mídia crescer ou quando o dado começar a ficar desatualizado por esquecimento.
- **Fonte nova que exija OAuth de verdade** (ex.: se algum dia entrar HubSpot, Stripe pra
  cobrança recorrente). Prospecção manual e lead de quiz não precisam disso — são arquivo e
  webhook, respectivamente.

## Setup (quando decidir usar)
1. Conta em composio.dev, gerar `COMPOSIO_API_KEY`, guardar em `.env.local` (server-side).
2. `npm i composio` no `crm/`, achar o app no catálogo (`meta` pra Meta Ads).
3. Gerar o link OAuth, o Alvaro autoriza uma vez.
4. Sincronização: pull agendado (cron chamando uma rota de sync) fazendo `upsert` idempotente
   por id em `eventos_funil`, guardando `raw` cru.

## Segurança
`COMPOSIO_API_KEY` só server-side, nunca `NEXT_PUBLIC_`.
