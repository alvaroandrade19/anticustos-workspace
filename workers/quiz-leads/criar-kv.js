// Cria (ou reaproveita) o namespace KV que guarda os leads do quiz de diagnóstico.
// Idempotente: pode rodar de novo sem duplicar. Sem wrangler, sem login por navegador,
// mesma API da Cloudflare que os Workers de LinkedIn e Instagram já usam.
//
//   node workers/quiz-leads/criar-kv.js
'use strict';

const env = require('./lib-env.js');
const cfl = require('./lib-cloudflare.js');

const TITULO_KV = 'anticustos-quiz-leads';

(async function () {
  env.carregarEnv();
  env.exigir('CLOUDFLARE_API_TOKEN', 'Cole no .env o token da Cloudflare.');
  env.exigir('CLOUDFLARE_ACCOUNT_ID', 'Cole no .env o Account ID da Cloudflare.');

  const ns = await cfl.garantirNamespace(TITULO_KV);
  console.log('KV: ' + (ns.criado ? 'namespace criado' : 'namespace já existia') + ' (' + ns.id + ')');

  env.salvarEnv({ QUIZ_LEADS_KV_ID: ns.id });
  console.log('Salvo em .env: QUIZ_LEADS_KV_ID=' + ns.id);
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
