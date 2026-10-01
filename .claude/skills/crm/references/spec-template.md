# Template do SPEC (escreva em crm/docs/SPEC.md)

Contrato técnico do que existe. Direto, sem tradução pra não-técnico.

```markdown
# SPEC — CRM Anti Custos

## Pra que serve
<1 parágrafo: pipeline de prospecção e clientes, o que o Alvaro quer responder olhando o cockpit>

## Estágios do funil
lead → contato feito → diagnóstico agendado → diagnóstico realizado → proposta enviada →
fechado / perdido → cliente ativo (recorrência)
<ajuste conforme a entrevista>

## Fontes de dado
- Prospecção manual: arquivos em `prospeccao/` (saída da skill `prospector`) → entrada manual ou import
- Quiz de diagnóstico (`/diagnostico`, campanhas Meta Ads): <webhook direto? planilha? manual por ora?>
- Meta Ads spend: <manual v1 / Composio quando o volume justificar>
- Atualização de estágio: manual, o Alvaro move o negócio

## Números do topo (com fórmula, reuse lib/economics.js)
- **CPL** = spend / leads
- **CAC** = spend / fechados
- **Taxa lead → diagnóstico**, **taxa show-up**, **taxa de fechamento**
- **MRR** = clientes ativos × R$1.500
- **Receita de setup** = fechados × R$3.000
Janelas: <hoje · 7d · 30d · mês>

## Telas
- Cockpit (obrigatório): KPIs do topo
- Pipeline: lista de negócios por estágio, kanban ou tabela
- <outras telas que a entrevista revelar>
- Login single-user

## Modelo de dados
- `negocios`: id, nome, origem, estágio, valor_potencial, criado_em, atualizado_em, raw
- `eventos_funil`: período, leads, diagnosticos_agendados, diagnosticos_realizados,
  propostas_enviadas, fechados, perdidos, clientes_ativos, spend

## Fora do escopo (v1)
<o que não vai ter agora>

## Como valida
<1 número do CRM bate com a fonte real, ex.: leads do dia == linhas novas em prospeccao/ + respostas do quiz>
```

Regra: mínimo que resolve. Uma tela a menos > uma tela confusa.
