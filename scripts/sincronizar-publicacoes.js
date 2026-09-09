// Sincroniza a fila de publicação das duas redes e arruma as pastas de conteúdo.
//
//   node scripts/sincronizar-publicacoes.js
//
// Roda no começo de cada sessão, pela skill /iniciar. Existe porque o Worker publica
// na Cloudflare e não alcança o disco desta máquina: a passagem de conteudo/agendado/
// para conteudo/publicado/ só acontece quando alguém roda o fila.js aqui. Sem isso o
// post sai igual, mas a pasta fica atrasada.
//
// Cola de workspace, não faz parte de nenhuma das duas skills: ele só chama as duas.
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');

const REDES = [
  { nome: 'LinkedIn', chaveEnv: 'LINKEDIN_FILA_KV_ID', skill: 'postar-linkedin' },
  { nome: 'Instagram', chaveEnv: 'INSTAGRAM_FILA_KV_ID', skill: 'publicar-social-ratos' },
];

function lerEnv() {
  const arquivo = path.join(RAIZ, '.env');
  if (!fs.existsSync(arquivo)) return {};
  const valores = {};
  for (const bruta of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha || linha.startsWith('#')) continue;
    const corte = linha.indexOf('=');
    if (corte === -1) continue;
    valores[linha.slice(0, corte).trim()] = linha.slice(corte + 1).trim();
  }
  return valores;
}

// Fila vazia e sem resultado novo não merece ocupar espaço no resumo de abertura.
function semNovidade(saida) {
  return saida.includes('(nada na fila)') && saida.includes('(nenhum ainda)');
}

const env = lerEnv();
const quietas = [];
let algumaFalou = false;

for (const rede of REDES) {
  const script = path.join(RAIZ, '.claude', 'skills', rede.skill, 'scripts', 'fila.js');

  if (!fs.existsSync(script)) continue;
  if (!env[rede.chaveEnv]) {
    quietas.push(rede.nome + ' (agendamento não configurado)');
    continue;
  }

  let saida;
  try {
    saida = execFileSync(process.execPath, [script], {
      cwd: RAIZ,
      encoding: 'utf8',
      timeout: 60000,
    });
  } catch (erro) {
    // Cloudflare fora do ar ou token vencido não pode travar o início da sessão.
    const motivo = String((erro.stderr || erro.message || '').trim().split('\n').pop());
    console.log('[' + rede.nome + '] não consegui consultar a fila: ' + motivo);
    algumaFalou = true;
    continue;
  }

  if (semNovidade(saida)) {
    quietas.push(rede.nome);
    continue;
  }

  console.log('--- ' + rede.nome + ' ---');
  console.log(saida.trim());
  console.log('');
  algumaFalou = true;
}

if (quietas.length) console.log('Sem novidade: ' + quietas.join(', ') + '.');
if (!algumaFalou && !quietas.length) console.log('Nenhuma rede com agendamento configurado.');
