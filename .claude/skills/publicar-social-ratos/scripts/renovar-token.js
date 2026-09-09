// Renova o token de longa duração do Instagram e reenvia o token novo para o Worker.
//
//   node .claude/skills/publicar-social-ratos/scripts/renovar-token.js
//   node ... renovar-token.js --status     só mostra quanto tempo falta, não renova
//
// O token IGA dura 60 dias e só aceita renovação depois de 24h de vida. Renovar
// devolve outro token de 60 dias, contados de hoje. Sem isso, o agendamento para de
// funcionar em silêncio: o Worker acorda, tenta e falha.
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const lib = require('./lib-instagram.js');

(async function () {
  lib.carregarEnv();
  const somenteStatus = process.argv.includes('--status');
  const token = lib.exigir('INSTAGRAM_ACCESS_TOKEN', 'Rode o setup da skill primeiro.');

  const eu = await lib.quemSou(token);
  console.log('Conta: @' + eu.username + ' (' + eu.account_type + ')');

  const dias = lib.diasAte(process.env.INSTAGRAM_TOKEN_EXPIRA_EM);
  if (dias === null) {
    console.log('Validade: não registrada no .env ainda. Renovar agora grava a data.');
  } else {
    console.log('Validade: vence em ' + dias + ' dia(s) (' + process.env.INSTAGRAM_TOKEN_EXPIRA_EM.slice(0, 10) + ')');
  }

  if (somenteStatus) return;

  const novo = await lib.renovarToken(token);
  if (!novo.access_token) throw new Error('A API não devolveu token novo: ' + JSON.stringify(novo));

  const segundos = Number(novo.expires_in || 60 * 86400);
  const expiraEm = new Date(Date.now() + segundos * 1000).toISOString();

  lib.salvarEnv({
    INSTAGRAM_ACCESS_TOKEN: novo.access_token,
    INSTAGRAM_TOKEN_EXPIRA_EM: expiraEm,
  });
  console.log('\nToken renovado. Nova validade: ' + expiraEm.slice(0, 10));

  // O filho herda o process.env deste processo, e carregarEnv() não sobrescreve o que
  // já existe. Sem atualizar aqui, o deploy reenviaria o token velho ao Worker.
  process.env.INSTAGRAM_ACCESS_TOKEN = novo.access_token;
  process.env.INSTAGRAM_TOKEN_EXPIRA_EM = expiraEm;

  // O Worker guarda o token como secret, então precisa receber o novo. Sem isso o
  // .env local fica certo e a publicação agendada continua falhando.
  if (!process.env.INSTAGRAM_WORKER_NOME) {
    console.log('Worker ainda não implantado, nada a reenviar.');
    return;
  }
  console.log('Reenviando o token para o Worker...');
  execFileSync(process.execPath, [path.join(__dirname, 'deploy-worker.js')], { stdio: 'inherit' });
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
