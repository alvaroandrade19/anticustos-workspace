// Diz se dá pra publicar agora: token, escopos, validade e de qual perfil.
//   node .claude/skills/postar-linkedin/scripts/status.js
'use strict';

const lib = require('./lib-linkedin.js');

(async function () {
  lib.carregarEnv();

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const urn = process.env.LINKEDIN_PERSON_URN;

  if (!token || !urn) {
    console.log('Não configurado.');
    console.log('Falta: ' + [!token && 'LINKEDIN_ACCESS_TOKEN', !urn && 'LINKEDIN_PERSON_URN'].filter(Boolean).join(', '));
    console.log('Rode: node .claude/skills/postar-linkedin/scripts/auth.js');
    process.exit(1);
  }

  let nome = null;
  let vivo = true;
  try {
    const perfil = await lib.quemSou(token);
    nome = perfil.name;
  } catch (erro) {
    vivo = false;
    console.log('Token recusado pelo LinkedIn: ' + erro.message);
  }

  let expira = process.env.LINKEDIN_TOKEN_EXPIRA_EM || null;
  let escopos = null;
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    try {
      const dados = await lib.inspecionar(token, process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET);
      if (dados.expires_at) {
        expira = new Date(Number(dados.expires_at) * 1000).toISOString();
        lib.salvarEnv({ LINKEDIN_TOKEN_EXPIRA_EM: expira });
      }
      escopos = dados.scope || null;
      if (dados.status && dados.status !== 'active') vivo = false;
    } catch (erro) {
      console.log('Aviso: introspecção falhou (' + erro.message + ').');
    }
  }

  const dias = lib.diasAte(expira);

  console.log('Perfil: ' + (nome || '(não consegui ler)'));
  console.log('URN: ' + urn);
  console.log('Validade: ' + (expira ? expira.slice(0, 10) + ' (' + dias + ' dias)' : 'desconhecida'));
  if (escopos) console.log('Escopos: ' + escopos);

  const podePublicar = vivo && (dias === null || dias >= 0) && (!escopos || escopos.includes('w_member_social'));
  console.log('\n' + (podePublicar ? 'Pronto pra publicar.' : 'NÃO dá pra publicar agora. Rode auth.js de novo.'));
  if (podePublicar && dias !== null && dias <= 7) {
    console.log('Aviso: faltam ' + dias + ' dias de token. Vale renovar antes do próximo post.');
  }
  if (!podePublicar) process.exit(1);
})().catch(function (erro) {
  console.error('Erro: ' + erro.message);
  process.exit(1);
});
