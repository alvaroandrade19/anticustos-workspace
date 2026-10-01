// Puxa os leads do quiz de diagnóstico (Worker quiz-leads, projeto INLEAD, mesma conta
// Cloudflare) e faz upsert em `negocios`. Idempotente por id do lead. Ver crm/docs/SPEC.md.
import './env.js';
import { sql } from '../lib/db.js';

async function buscarLeads() {
  const url = process.env.QUIZ_LEADS_WORKER_URL;
  const token = process.env.QUIZ_LEADS_ACCESS_TOKEN;
  if (!url || !token) {
    console.log('QUIZ_LEADS_WORKER_URL/QUIZ_LEADS_ACCESS_TOKEN não configurados no .env — nada sincronizado.');
    return [];
  }
  const r = await fetch(`${url}/leads?token=${encodeURIComponent(token)}`);
  if (!r.ok) throw new Error(`quiz-leads respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const { leads } = await r.json();
  return leads || [];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL não configurado ainda — nada sincronizado. Ver .claude/skills/crm/references/backend.md.');
    return;
  }
  const leads = await buscarLeads();
  let inseridos = 0, atualizados = 0;
  for (const lead of leads) {
    if (!lead.id) continue;
    const estagio = lead.completou ? 'diagnostico_realizado' : 'lead';
    const criativo = lead.utm?.content || null;
    const [r] = await sql`
      insert into negocios (id, nome_empresa, origem, estagio, criativo, raw, criado_em, atualizado_em)
      values (${lead.id}, ${lead.nome || 'sem nome'}, 'ads', ${estagio}, ${criativo}, ${sql.json(lead)}, now(), now())
      on conflict (id) do update set
        nome_empresa = excluded.nome_empresa,
        estagio = case when negocios.estagio = 'lead' then excluded.estagio else negocios.estagio end,
        raw = excluded.raw,
        atualizado_em = now()
      returning (xmax = 0) as inserido
    `;
    if (r?.inserido) inseridos++; else atualizados++;
  }
  console.log(`quiz-leads: ${leads.length} leads na fonte, ${inseridos} novos, ${atualizados} atualizados`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
