---
name: crm
description: Constrói e mantém o CRM interno da Anti Custos (pipeline de prospecção, clientes e, mais adiante, ads) em cima do core enxuto em `crm/`. Entrevista direta com o Alvaro → escreve o SPEC → implementa a tela/fonte de dado → publica quando pedido. Use quando o Alvaro rodar /crm, disser "atualiza o CRM", "abre o pipeline", "adiciona um lead", "muda o estágio do cliente X", ou pedir pra ver o painel de vendas.
---

# /crm — pipeline de prospecção e clientes da Anti Custos

O app vive em `crm/` (Next.js, core enxuto: login single-user, `lib/db.js` como dono único
da query, `lib/economics.js` com a matemática do funil, Docker pra deploy). Esta skill é quem
constrói em cima disso e mantém vivo — não é um curso pra "aluno", é ferramenta interna, e o
Alvaro é técnico o bastante pra não precisar de jargão escondido.

## Origem (contexto que evita repetir erro)
Este core veio de um starter de curso de terceiro que tratava quem usa como cliente
não-técnico: escondia palavra técnica de propósito, ancorava preço de VPS antes de pedir
acesso, e empurrava a compra por link de afiliado. Isso foi descartado. Ver `crm/CONTEXT.md`
pra decisões herdadas que continuam valendo (fonte única da verdade, segredo só server-side,
um dono da query).

## Regras
- **Fale direto, sem hand-holding.** Nada de "tranquilizar antes de pedir acesso" ou traduzir OAuth/VPS pra metáfora. O Alvaro decide rápido; trate como decisão técnica normal.
- **Nunca ofereça VPS por link de afiliado.** Se precisar de servidor, apresente o custo real e deixe a escolha do provedor com ele.
- **Composio é opcional, não obrigatório.** Só entra quando a fonte de dado realmente exigir OAuth gerenciado (ex.: puxar Meta Ads automaticamente). Prospecção manual e lead do quiz não precisam disso.
- **Confirme antes de qualquer ação de mundo real**: criar projeto Supabase, gerar chave, comprar/configurar VPS, publicar. Ver `references/deploy.md`.
- **Menos telas, bem feitas.** Corte o que não vira decisão.

## Fluxo

### Fase 1 — Entrevista curta (só na primeira vez ou quando o escopo mudar)
Leia `references/entrevista.md`. Objetivo: fechar os estágios do funil, as fontes de dado e as
métricas que o Alvaro quer ver, direto, sem grill de venda. Se já existe `docs/SPEC.md` em
`crm/`, pule pra Fase 2 e só reabra a entrevista se o pedido for mudança de escopo.

### Fase 2 — Backend
Leia `references/backend.md`. Decisão default: Supabase (gerenciado, tier grátis cobre o volume
atual). Registre a escolha em `.env.local` (ver `crm/CONTEXT.md` pras variáveis, já que `.env*`
não pode ser escrito por este agente — peça pro Alvaro colar o valor ou usar o terminal dele).

### Fase 3 — Fontes de dado
Hoje as fontes são automáticas: `crm/scripts/importar-prospeccao.js` lê `prospeccao/*.csv`
(saída da skill `prospector`) e `crm/scripts/sincronizar-quiz.js` puxa o Worker `quiz-leads`
(projeto INLEAD, `GET {QUIZ_LEADS_WORKER_URL}/leads`). Os dois são idempotentes e nunca
regridem um negócio que o Alvaro já moveu no pipeline — rode de novo sem medo. Mudança de
estágio além disso é manual, na tela de pipeline. Meta Ads spend automático via Composio é
passo futuro, só quando o volume de campanha justificar — ver `references/composio.md`.
Não instale a skill `crm-leads` que o `prospector` menciona: ela duplicaria o que este pipeline
já cobre (ver `crm/docs/SPEC.md`, seção "Achado durante o design").

### Fase 4 — SPEC
Escreva/atualize `crm/docs/SPEC.md` com `references/spec-template.md`. Contrato do que existe,
não história de venda — pode ser direto e técnico.

### Fase 5 — Implementar
Leia `references/implementar.md`. Reuse `lib/economics.js`, `lib/fmt.js`, `lib/windows.js`,
`lib/db.js`. Rode local (`npm run dev` em `crm/`) e mostre com dado real antes de considerar pronto.

### Fase 6 — Publicar (só quando pedido explicitamente)
Leia `references/deploy.md`. Custo real (~R$40/mês de VPS) e escolha de provedor ficam com o
Alvaro. Nunca suba sem confirmação explícita nesta sessão.

## Quando terminar
Diga o que mudou, onde ver (local ou link publicado), e o que falta pra próxima iteração.
