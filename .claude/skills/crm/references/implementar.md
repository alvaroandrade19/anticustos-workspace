# Implementar — do core enxuto ao SPEC

Você tem o SPEC + o backend decidido. Construa em cima do que já existe em `crm/`, não reinvente.

## O que o core já dá (não reescreva)
- `lib/economics.js` — matemática do funil (leads, diagnósticos, propostas, fechados, MRR,
  CPL, CAC, taxas de conversão por etapa). Ajuste as constantes de preço se mudarem; a fórmula
  em si só muda se o modelo de negócio mudar.
- `lib/fmt.js` — moeda pt-BR (2 casas), número, percentual.
- `lib/windows.js` — janelas de tempo (hoje/7d/30d). Fuso já em `America/Sao_Paulo`.
- `lib/db.js` — adaptador do backend, plugado na Fase 2.
- `app/` — layout, login single-user, cockpit de exemplo com dado de amostra.
- `components/` — Shell (nav) + KpiCard.
- `proxy.js` — trava tudo atrás do login (convenção `proxy` do Next 16, era `middleware.js`).

## Passos
1. **Modelo de dados**: crie `negocios` e `eventos_funil` (ou o que o SPEC pedir) no backend.
2. **Camada de agregação**: uma função por número, lendo o backend, alimentando `economics()`.
   Nada de fórmula duplicada nas telas.
3. **Cockpit**: troque `SAMPLE`/`SAMPLE_ADS` em `app/page.jsx` pela agregação real.
4. **Pipeline**: tela de lista/kanban dos `negocios` por estágio, com ação de mudar estágio.
5. **Rode local** (`npm run dev` dentro de `crm/`) e mostre com dado real. Um número tem que
   bater com a fonte (ex.: leads do dia == linhas novas em `prospeccao/` + respostas do quiz).

## Princípios de qualidade (herdados, ainda valem)
- Fonte única da verdade: dado cru no backend, número derivado in-app.
- Design limpo: sem gradiente em texto, moeda pt-BR completa, número mono tabular.
- Mobile cabe: grids `minmax(0,1fr)`, tabela larga em `.scroll-x`.
- Nada de segredo no browser.
- Menos telas, bem feitas.

Quando um número novo for pedido depois: adicione a query + o KPI, não reescreva o resto.
