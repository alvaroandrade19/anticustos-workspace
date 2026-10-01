// Núcleo de economia do pipeline Anti Custos. Puro, sem I/O — testável com fixture.
// Modelo de venda de serviço (setup + recorrência), não de checkout/e-commerce.
// Ajuste as constantes se o preço mudar (hoje espelha _contexto/estrategia.md).

export const PRECO_SETUP = 3000;        // cobrança única na virada pra fechado
export const PRECO_RECORRENCIA = 1500;  // por cliente ativo, por mês
export const META_CLIENTES_ATIVOS = 20; // capacidade-alvo antes de contratar equipe

// raw = agregado do funil no período { leads, diagnosticosAgendados, diagnosticosRealizados, propostasEnviadas, fechados, perdidos, clientesAtivos }
// ads = agregado de mídia paga { spend }
// Retorna o painel completo pro cockpit consumir.
export function economics(raw = {}, ads = {}) {
  const leads = +raw.leads || 0;
  const diagAgendados = +raw.diagnosticosAgendados || 0;
  const diagRealizados = +raw.diagnosticosRealizados || 0;
  const propostas = +raw.propostasEnviadas || 0;
  const fechados = +raw.fechados || 0;
  const perdidos = +raw.perdidos || 0;
  const clientesAtivos = +raw.clientesAtivos || 0;
  const spend = +ads.spend || 0;

  const receitaSetup = fechados * PRECO_SETUP;
  const mrr = clientesAtivos * PRECO_RECORRENCIA;

  return {
    leads, diagAgendados, diagRealizados, propostas, fechados, perdidos, clientesAtivos,
    spend, receitaSetup, mrr,
    cpl: leads ? spend / leads : null,                        // custo por lead
    cac: fechados ? spend / fechados : null,                  // custo por cliente fechado
    taxaLeadParaDiag: leads ? diagAgendados / leads : null,    // lead -> diagnóstico agendado
    taxaShowUp: diagAgendados ? diagRealizados / diagAgendados : null, // agendado -> compareceu
    taxaFechamento: propostas ? fechados / propostas : null,   // proposta -> fechado
    faltaParaMeta: Math.max(0, META_CLIENTES_ATIVOS - clientesAtivos),
  };
}
