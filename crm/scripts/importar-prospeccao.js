// Importa prospeccao/*.csv (saída da skill /prospector) pra dentro de `negocios`.
// Idempotente: roda quantas vezes quiser, nunca regride o estágio de um negócio que
// o Alvaro já moveu no pipeline. Ver crm/docs/SPEC.md.
import './env.js';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sql } from '../lib/db.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PASTA_PROSPECCAO = path.join(RAIZ, 'prospeccao');

// Parser de CSV `;` com suporte a campo entre aspas (`;`, `"` e quebra de linha dentro).
function parseCsv(texto) {
  const linhas = [];
  let campo = '', linha = [], dentroAspas = false;
  const s = texto.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (dentroAspas) {
      if (c === '"' && s[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') dentroAspas = false;
      else campo += c;
    } else if (c === '"') {
      dentroAspas = true;
    } else if (c === ';') {
      linha.push(campo); campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.length > 1 || linha[0] !== '') linhas.push(linha);
      linha = [];
    } else {
      campo += c;
    }
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  if (!linhas.length) return [];
  const cabecalho = linhas[0];
  return linhas.slice(1).map((l) => Object.fromEntries(cabecalho.map((h, idx) => [h, l[idx] ?? ''])));
}

async function importar(caminhoCsv) {
  const linhas = parseCsv(readFileSync(caminhoCsv, 'utf8'));
  let inseridos = 0, atualizados = 0;
  for (const row of linhas) {
    if (!row.empresa) continue;
    const id = row.cnpj || `${row.lote || 'sem-lote'}:${row.empresa}`;
    const notaCalor = row.nota_calor ? parseInt(row.nota_calor, 10) : null;
    const [r] = await sql`
      insert into negocios (id, nome_empresa, origem, estagio, nota_calor, cnpj, lote, raw, criado_em, atualizado_em)
      values (${id}, ${row.empresa}, 'prospeccao', 'lead', ${notaCalor},
              ${row.cnpj || null}, ${row.lote || null}, ${sql.json(row)}, now(), now())
      on conflict (id) do update set
        nome_empresa = excluded.nome_empresa,
        nota_calor = excluded.nota_calor,
        raw = excluded.raw,
        atualizado_em = now()
      returning (xmax = 0) as inserido
    `;
    if (r?.inserido) inseridos++; else atualizados++;
  }
  return { arquivo: path.basename(caminhoCsv), linhas: linhas.length, inseridos, atualizados };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL não configurado ainda — nada importado. Ver .claude/skills/crm/references/backend.md.');
    return;
  }
  const arquivos = readdirSync(PASTA_PROSPECCAO).filter((f) => f.endsWith('.csv'));
  if (!arquivos.length) { console.log('Nenhum CSV em prospeccao/.'); return; }
  for (const nome of arquivos) {
    const r = await importar(path.join(PASTA_PROSPECCAO, nome));
    console.log(`${r.arquivo}: ${r.linhas} linhas, ${r.inseridos} novas, ${r.atualizados} atualizadas`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
