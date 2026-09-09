// Sobe (ou atualiza) o Worker que publica a fila do Instagram na hora marcada.
// Idempotente: pode rodar quantas vezes quiser. Rodar de novo depois de renovar o
// token do Instagram, para o Worker receber o token novo.
//
//   node .claude/skills/publicar-social-ratos/scripts/deploy-worker.js
//
// Convive com o Worker do LinkedIn: nome, KV e cron são próprios. Os dois juntos
// gastam 576 operações de list por dia no KV, dentro do teto de 1000 do plano grátis.
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./lib-instagram.js');
const cfl = require('./lib-cloudflare.js');

const NOME_WORKER = 'anticustos-instagram-agendador';
const TITULO_KV = 'anticustos-instagram-fila';
const CRON = '*/5 * * * *';

(async function () {
  lib.carregarEnv();

  const token = lib.exigir('INSTAGRAM_ACCESS_TOKEN', 'Rode o setup da skill primeiro.');
  const userId = lib.exigir('INSTAGRAM_USER_ID', 'Rode o setup da skill primeiro.');
  lib.exigir('CLOUDFLARE_API_TOKEN', 'Cole no .env o token da Cloudflare.');
  lib.exigir('CLOUDFLARE_ACCOUNT_ID', 'Cole no .env o Account ID da Cloudflare.');

  // Falhar aqui é melhor que descobrir o token morto quando o post não sair.
  const eu = await lib.quemSou(token);
  console.log('Conta: @' + eu.username + ' (' + eu.account_type + ')');
  if (eu.id !== userId) {
    throw new Error('O INSTAGRAM_USER_ID do .env (' + userId + ') não bate com o da conta do token (' + eu.id + ').');
  }

  // Sem subdomínio workers.dev a conta recusa cron e rota, com erro 10063.
  const subdominio = await cfl.garantirSubdominio(['anticustos', 'anticustos-ia', 'anticustos-alvaro']);
  console.log('Subdomínio: ' + subdominio + '.workers.dev');

  const ns = await cfl.garantirNamespace(TITULO_KV);
  console.log('KV: ' + (ns.criado ? 'namespace criado' : 'namespace já existia') + ' (' + ns.id + ')');

  const gatilho = process.env.INSTAGRAM_GATILHO_SECRET || crypto.randomBytes(16).toString('hex');

  const codigo = fs.readFileSync(path.join(__dirname, '..', 'worker', 'worker.js'), 'utf8');

  await cfl.subirWorker(NOME_WORKER, codigo, [
    { type: 'kv_namespace', name: 'FILA', namespace_id: ns.id },
    { type: 'secret_text', name: 'INSTAGRAM_ACCESS_TOKEN', text: token },
    { type: 'secret_text', name: 'INSTAGRAM_USER_ID', text: userId },
    { type: 'secret_text', name: 'GATILHO_SECRET', text: gatilho },
  ]);
  console.log('Worker publicado: ' + NOME_WORKER);

  await cfl.definirCron(NOME_WORKER, [CRON]);
  console.log('Cron: ' + CRON + ' (acorda de 5 em 5 minutos)');

  // Endpoint HTTP só para disparo manual nos testes. Se a conta não tiver
  // subdomínio workers.dev, o cron continua funcionando do mesmo jeito.
  let urlWorker = process.env.INSTAGRAM_WORKER_URL || '';
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
    INSTAGRAM_FILA_KV_ID: ns.id,
    INSTAGRAM_WORKER_NOME: NOME_WORKER,
    INSTAGRAM_GATILHO_SECRET: gatilho,
    INSTAGRAM_WORKER_URL: urlWorker,
  });

  console.log('\nPronto. O Worker publica sozinho o que estiver vencido na fila.');
  console.log('Lembrete: depois de renovar o token do Instagram, rodar este script de novo.');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
