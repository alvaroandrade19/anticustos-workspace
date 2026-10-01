import { sql } from './db.js';

// Ordem do funil. Usada pra contar "alcançou este estágio ou passou dele", que é o que
// um funil de verdade mede — um negócio que já virou proposta continua contando como
// "diagnóstico realizado", não desaparece dessa contagem.
const ORDEM_ESTAGIO = {
  lead: 0, contato_feito: 1, diagnostico_agendado: 2,
  diagnostico_realizado: 3, proposta_enviada: 4, fechado: 5, perdido: 5,
};

export const ESTAGIOS = Object.keys(ORDEM_ESTAGIO).filter((e) => e !== 'perdido');

// Agregado do funil pro cockpit (lib/economics.js). `spend` fica em 0: Meta Ads
// automático é v2 (ver crm/docs/SPEC.md). clientes_ativos hoje é so um sinônimo de
// "fechado" (sem churn ainda) — revisar quando existir cancelamento de verdade.
export async function agregarFunil() {
  if (!sql) return null;
  const [r] = await sql`
    with rank as (
      select estagio,
        case estagio
          when 'lead' then 0 when 'contato_feito' then 1 when 'diagnostico_agendado' then 2
          when 'diagnostico_realizado' then 3 when 'proposta_enviada' then 4
          when 'fechado' then 5 when 'perdido' then 5
        end as r
      from negocios
    )
    select
      count(*)::int as leads,
      count(*) filter (where r >= 2)::int as "diagnosticosAgendados",
      count(*) filter (where r >= 3)::int as "diagnosticosRealizados",
      count(*) filter (where r >= 4)::int as "propostasEnviadas",
      count(*) filter (where estagio = 'fechado')::int as fechados,
      count(*) filter (where estagio = 'perdido')::int as perdidos,
      count(*) filter (where estagio = 'fechado')::int as "clientesAtivos"
    from rank
  `;
  return r;
}

// Lista pra tela de pipeline, do estágio mais avançado pro mais novo, e dentro do
// mesmo estágio do lead mais quente pro mais frio.
export async function listarPipeline() {
  if (!sql) return [];
  const rows = await sql`
    select id, nome_empresa, origem, estagio, nota_calor, criativo, valor_potencial, atualizado_em
    from negocios
    order by
      case estagio
        when 'fechado' then 5 when 'perdido' then 5 when 'proposta_enviada' then 4
        when 'diagnostico_realizado' then 3 when 'diagnostico_agendado' then 2
        when 'contato_feito' then 1 else 0
      end desc,
      nota_calor desc nulls last,
      atualizado_em desc
  `;
  return rows;
}

export async function moverEstagio(id, estagio) {
  if (!sql) throw new Error('DATABASE_URL não configurado.');
  if (!(estagio in ORDEM_ESTAGIO)) throw new Error('Estágio inválido: ' + estagio);
  await sql`update negocios set estagio = ${estagio}, atualizado_em = now() where id = ${id}`;
}
