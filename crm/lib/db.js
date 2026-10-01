import postgres from 'postgres';

// Sem 'server-only' aqui de propósito: este módulo roda tanto dentro do Next.js
// (rotas/telas) quanto em script Node avulso (crm/scripts/*.js). O guard do pacote
// 'server-only' só entende o primeiro caso e derruba o segundo com erro. A proteção
// real (nunca importar isto de um arquivo 'use client') continua sendo disciplina de código.
// Conexão direta ao Postgres (Supabase ou qualquer outro — é só trocar DATABASE_URL).
// prepare:false porque o pooler de transação do Supabase (porta 6543) não suporta
// prepared statement. UM dono da conexão: nada de SQL cru fora daqui.
export const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { prepare: false })
  : null;

// Chame no início de qualquer função que precisa do banco — erro claro em vez de
// silêncio quando DATABASE_URL ainda não foi configurado.
export function exigirDb() {
  if (!sql) throw new Error('DATABASE_URL não configurado. Ver .claude/skills/crm/references/backend.md.');
  return sql;
}
