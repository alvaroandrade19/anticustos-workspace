# Entrevista — direta, sem grill de venda

Objetivo: fechar os estágios do funil, as fontes de dado e as métricas do topo, com concretude
suficiente pra escrever o SPEC. O Alvaro conhece o próprio negócio a fundo — não puxe informação
que já está em `_contexto/estrategia.md`, `_contexto/agora.md` ou `AGENTS.md`; confirme com ele
em vez de perguntar do zero.

## O que já se sabe (ponto de partida, não pergunte de novo)
- Preço: R$3.000 de setup + R$1.500/mês de recorrência. Meta de 20 clientes ativos.
- Fontes de lead hoje: prospecção manual (skill `prospector`, arquivos em `prospeccao/`) e
  tráfego pago pro quiz `/diagnostico` (campanhas `diag-ct-01`/`diag-ct-02`, ver `agora.md`).
- Zero clientes fechados até o momento em que este starter foi montado (17/09/2026).

## O que perguntar (uma vez, direto)
1. **Estágios do funil**: proponha um default a partir do que existe no Gerencial
   (`Wiki/Gerencial/Vendas - Prospecção, Call e Fechamento.md`, as 6 etapas da call) — algo como
   lead → contato feito → diagnóstico agendado → diagnóstico realizado → proposta enviada →
   fechado/perdido → cliente ativo. Pergunte se bate com o fluxo real ou se falta/sobra etapa.
2. **O que ele quer ver todo dia**: pipeline aberto por estágio, ou só o topo (leads, fechados,
   MRR)? Confirme se `lib/economics.js` (leads, diagnósticos, propostas, fechados, perdidos,
   clientes ativos, spend) cobre ou se falta algo.
3. **Onde o dado nasce**: prospecção e quiz alimentam automático ou o Alvaro digita a mão? Se
   for a mão agora, tudo bem — é v1. Marque o que merece automação depois.
4. **Ads**: quer o spend de Meta Ads dentro do CRM já na v1, ou fica pra quando o volume de
   campanha crescer? (Hoje é R$30 a R$60/dia, primeira verba da história do negócio — pode não
   valer a automação ainda.)

## Saída (confirme e siga pra Fase 2)
Resuma em 5 linhas: estágios do funil, fontes de dado (automática vs. manual), métricas do topo,
se ads entra na v1, o que fica fora do escopo por ora. Isso vira a base do SPEC.
