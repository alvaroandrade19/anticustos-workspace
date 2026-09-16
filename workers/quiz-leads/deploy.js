// Publica o Worker do quiz de diagnóstico (projeto INLEAD, fora deste repositório)
// pela API da Cloudflare, sem wrangler e sem login por navegador. Mesmo padrão dos
// Workers de LinkedIn e Instagram: token e conta já estão no .env deste projeto.
// Idempotente: pode rodar de novo (ex: depois de configurar o Telegram) sem duplicar nada.
//
//   node workers/quiz-leads/deploy.js
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const env = require('./lib-env.js');
const cfl = require('./lib-cloudflare.js');

const NOME_WORKER = 'quiz-leads';
const CAMINHO_CODIGO = 'C:\\Users\\aandr\\OneDrive\\Área de Trabalho\\ASIMOV DESIGN\\INLEAD\\workers\\quiz-leads\\index.js';
const ALLOWED_ORIGINS = 'https://anticustos.vercel.app';
const COMPAT_DATE = '2026-09-15';

(async function () {
  env.carregarEnv();
  env.exigir('CLOUDFLARE_API_TOKEN', 'Cole no .env o token da Cloudflare.');
  env.exigir('CLOUDFLARE_ACCOUNT_ID', 'Cole no .env o Account ID da Cloudflare.');
  const kvId = env.exigir('QUIZ_LEADS_KV_ID', 'Rode workers/quiz-leads/criar-kv.js primeiro.');

  if (!fs.existsSync(CAMINHO_CODIGO)) {
    throw new Error('Não achei o código do Worker em ' + CAMINHO_CODIGO);
  }
  const codigo = fs.readFileSync(CAMINHO_CODIGO, 'utf8');

  const subdominio = await cfl.garantirSubdominio(['anticustos', 'anticustos-ia', 'anticustos-alvaro']);
  console.log('Subdomínio: ' + subdominio + '.workers.dev');

  let leadsToken = process.env.QUIZ_LEADS_ACCESS_TOKEN;
  if (!leadsToken) {
    leadsToken = crypto.randomBytes(24).toString('hex');
    console.log('LEADS_ACCESS_TOKEN gerado agora (primeira vez).');
  }

  const bindings = [
    { type: 'kv_namespace', name: 'QUIZ_KV', namespace_id: kvId },
    { type: 'plain_text', name: 'ALLOWED_ORIGINS', text: ALLOWED_ORIGINS },
    { type: 'secret_text', name: 'LEADS_ACCESS_TOKEN', text: leadsToken },
  ];

  if (process.env.QUIZ_TELEGRAM_BOT_TOKEN && process.env.QUIZ_TELEGRAM_CHAT_ID) {
    bindings.push({ type: 'secret_text', name: 'TELEGRAM_BOT_TOKEN', text: process.env.QUIZ_TELEGRAM_BOT_TOKEN });
    bindings.push({ type: 'secret_text', name: 'TELEGRAM_CHAT_ID', text: process.env.QUIZ_TELEGRAM_CHAT_ID });
    console.log('Telegram: secrets incluídos.');
  } else {
    console.log('Telegram: ainda sem QUIZ_TELEGRAM_BOT_TOKEN/QUIZ_TELEGRAM_CHAT_ID no .env, publicando sem aviso por enquanto.');
  }

  if (process.env.QUIZ_META_CAPI_TOKEN) {
    bindings.push({ type: 'secret_text', name: 'CAPI_TOKEN', text: process.env.QUIZ_META_CAPI_TOKEN });
    console.log('Meta Conversions API: secret CAPI_TOKEN incluído.');
  }
  if (process.env.QUIZ_META_CAPI_VERSION) {
    bindings.push({ type: 'plain_text', name: 'CAPI_VERSION', text: process.env.QUIZ_META_CAPI_VERSION });
    console.log('Meta Conversions API: versão ' + process.env.QUIZ_META_CAPI_VERSION + ' incluída.');
  }
  if (process.env.QUIZ_META_CAPI_TEST_CODE) {
    bindings.push({ type: 'plain_text', name: 'CAPI_TEST_CODE', text: process.env.QUIZ_META_CAPI_TEST_CODE });
    console.log('Meta Conversions API: CAPI_TEST_CODE incluído (' + process.env.QUIZ_META_CAPI_TEST_CODE + ') — LEMBRAR DE TIRAR DEPOIS DO TESTE.');
  }

  await cfl.subirWorker(NOME_WORKER, codigo, bindings, COMPAT_DATE);
  console.log('Worker publicado: ' + NOME_WORKER);

  let urlWorker = process.env.QUIZ_LEADS_WORKER_URL || '';
  try {
    await cfl.cf('/workers/scripts/' + NOME_WORKER + '/subdomain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    });
    urlWorker = 'https://' + NOME_WORKER + '.' + subdominio + '.workers.dev';
    console.log('URL: ' + urlWorker);
  } catch (erro) {
    console.log('Aviso: não consegui expor o endpoint (' + erro.message + ').');
  }

  env.salvarEnv({
    QUIZ_LEADS_ACCESS_TOKEN: leadsToken,
    QUIZ_LEADS_WORKER_URL: urlWorker,
  });

  console.log('\nPronto. Salvo em .env: QUIZ_LEADS_ACCESS_TOKEN e QUIZ_LEADS_WORKER_URL.');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
