// Carrega variáveis de ambiente sem depender de pacote externo.
// Lê o .env da raiz do workspace (segredo de integrações existentes, ex. quiz-leads)
// e crm/.env.local (segredo do próprio CRM, ex. Supabase) por cima. Nunca sobrescreve
// uma env var já setada no processo (permite override manual na hora de rodar).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(here, '../..');
const CRM = path.resolve(here, '..');

function aplicar(caminho) {
  let texto;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch {
    return;
  }
  for (const linha of texto.split('\n')) {
    const l = linha.trim();
    if (!l || l.startsWith('#')) continue;
    const eq = l.indexOf('=');
    if (eq === -1) continue;
    const chave = l.slice(0, eq).trim();
    let valor = l.slice(eq + 1).trim();
    if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1);
    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}

aplicar(path.join(RAIZ, '.env'));
aplicar(path.join(CRM, '.env.local'));
