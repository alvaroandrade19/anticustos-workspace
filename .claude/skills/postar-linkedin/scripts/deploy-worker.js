// Sobe (ou atualiza) o Worker que publica a fila do LinkedIn na hora marcada.
// Idempotente: pode rodar quantas vezes quiser. Rodar de novo depois de renovar o
// token do LinkedIn, para o Worker receber o token novo.
//
//   node .claude/skills/postar-linkedin/scripts/deploy-worker.js
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./lib-linkedin.js');
const cfl = require('./lib-cloudflare.js');

const NOME_WORKER = 'anticustos-linkedin-agendador';
const TITULO_KV = 'anticustos-linkedin-fila';
const CRON = '*/5 * * * *';

(async function () {
  lib.carregarEnv();

  const tokenLinkedIn = lib.exigir('LINKEDIN_ACCESS_TOKEN', 'Rode auth.js primeiro.');
  const urn = lib.exigir('LINKEDIN_PERSON_URN', 'Rode auth.js primeiro.');
  lib.exigir('CLOUDFLARE_API_TOKEN', 'Cole no .env o token da Cloudflare.');
  lib.exigir('CLOUDFLARE_ACCOUNT_ID', 'Cole no .env o Account ID da Cloudflare.');

  // Sem subdomínio workers.dev a conta recusa cron e rota, com erro 10063.
  const subdominio = await cfl.garantirSubdominio(['anticustos', 'anticustos-ia', 'anticustos-alvaro']);
  console.log('Subdomínio: ' + subdominio + '.workers.dev');

  const ns = await cfl.garantirNamespace(TITULO_KV);
  console.log('KV: ' + (ns.criado ? 'namespace criado' : 'namespace já existia') + ' (' + ns.id + ')');

  const gatilho = process.env.LINKEDIN_GATILHO_SECRET || crypto.randomBytes(16).toString('hex');

  const codigo = fs.readFileSync(path.join(__dirname, '..', 'worker', 'worker.js'), 'utf8');

  await cfl.subirWorker(NOME_WORKER, codigo, [
    { type: 'kv_namespace', name: 'FILA', namespace_id: ns.id },
    { type: 'secret_text', name: 'LINKEDIN_ACCESS_TOKEN', text: tokenLinkedIn },
    { type: 'secret_text', name: 'LINKEDIN_PERSON_URN', text: urn },
    { type: 'secret_text', name: 'GATILHO_SECRET', text: gatilho },
  ]);
  console.log('Worker publicado: ' + NOME_WORKER);

  await cfl.definirCron(NOME_WORKER, [CRON]);
  console.log('Cron: ' + CRON + ' (acorda de 5 em 5 minutos)');

  // Endpoint HTTP só para disparo manual nos testes. Se a conta não tiver
  // subdomínio workers.dev, o cron continua funcionando do mesmo jeito.
  let urlWorker = process.env.LINKEDIN_WORKER_URL || '';
  try {
    await cfl.cf('/workers/scripts/' + NOME_WORKER + '/subdomain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    });
    urlWorker = 'https://' + NOME_WORKER + '.' + subdominio + '.workers.dev';
    console.log('Disparo manual: ' + urlWorker);
  } catch (erro) {
    console.log('Aviso: não consegui expor o endpoint de teste (' + erro.message + '). O cron não depende disso.');
  }

  lib.salvarEnv({
    LINKEDIN_FILA_KV_ID: ns.id,
    LINKEDIN_WORKER_NOME: NOME_WORKER,
    LINKEDIN_GATILHO_SECRET: gatilho,
    LINKEDIN_WORKER_URL: urlWorker,
  });

  console.log('\nPronto. O Worker publica sozinho o que estiver vencido na fila.');
  console.log('Lembrete: depois de renovar o token do LinkedIn, rodar este script de novo.');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
