import { economics } from '@/lib/economics';
import { brl, num, pct } from '@/lib/fmt';
import { agregarFunil } from '@/lib/negocios';
import KpiCard from '@/components/KpiCard';

export const dynamic = 'force-dynamic';

// DEMO: só usado se DATABASE_URL não estiver configurado ainda.
const SAMPLE = {
  leads: 42, diagnosticosAgendados: 11, diagnosticosRealizados: 8,
  propostasEnviadas: 5, fechados: 1, perdidos: 2, clientesAtivos: 1,
};
const SAMPLE_ADS = { spend: 900 };

export default async function Cockpit() {
  const real = await agregarFunil();
  const amostra = !real;
  const cur = economics(real || SAMPLE, amostra ? SAMPLE_ADS : {});

  return (
    <div className="crm-page">
      <div className="microcaps" style={{ marginBottom: 14 }}>
        Cockpit{amostra
          ? <> · <span style={{ color: 'var(--warn)' }}>dados de amostra</span> — configure <b className="fg">DATABASE_URL</b> pra plugar os seus</>
          : null}
      </div>
      <div className="kpi-grid">
        <KpiCard title="Leads" value={num(cur.leads)} />
        <KpiCard title="Diagnóstico agendado" value={num(cur.diagAgendados)} sub={pct(cur.taxaLeadParaDiag)} />
        <KpiCard title="Diagnóstico realizado" value={num(cur.diagRealizados)} sub={pct(cur.taxaShowUp)} />
        <KpiCard title="Propostas enviadas" value={num(cur.propostas)} />
        <KpiCard title="Fechados" value={num(cur.fechados)} tone="ok" sub={pct(cur.taxaFechamento)} />
        <KpiCard title="Perdidos" value={num(cur.perdidos)} tone={cur.perdidos > 0 ? 'bad' : undefined} />
        <KpiCard title="Clientes ativos" value={num(cur.clientesAtivos)} sub={`meta 20 · faltam ${cur.faltaParaMeta}`} />
        <KpiCard title="MRR" value={brl(cur.mrr)} tone="ok" />
        <KpiCard title="Receita de setup" value={brl(cur.receitaSetup)} />
        <KpiCard title="Investimento em ads" value={brl(cur.spend)} />
        <KpiCard title="Custo por lead" value={brl(cur.cpl)} />
        <KpiCard title="Custo por cliente" value={brl(cur.cac)} />
      </div>
      <div className="card"><div className="card-b microcaps" style={{ lineHeight: 1.7 }}>
        {amostra
          ? <>Dado de amostra vindo de <b className="fg">lib/economics.js</b>. Configure <b className="fg">DATABASE_URL</b> em <b className="fg">crm/.env.local</b> e rode os scripts de importação pra ver o funil de verdade.</>
          : <>Agregado ao vivo de <b className="fg">negocios</b> (prospecção manual + quiz de diagnóstico). Rode <b className="fg">npm run importar-prospeccao</b> e <b className="fg">npm run sincronizar-quiz</b> pra atualizar.</>}
      </div></div>
    </div>
  );
}
