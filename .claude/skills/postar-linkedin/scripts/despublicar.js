// Apaga um post já publicado no LinkedIn. Não tem desfazer: o post some do feed,
// e reações e comentários que existirem vão junto.
//
//   node .claude/skills/postar-linkedin/scripts/despublicar.js urn:li:ugcPost:7503207386212524032
//   node ... despublicar.js https://www.linkedin.com/feed/update/urn:li:ugcPost:7503.../
'use strict';

const lib = require('./lib-linkedin.js');

function extrairUrn(entrada) {
  if (!entrada) throw new Error('Passe a URN ou a URL do post.');
  const achado = String(entrada).match(/urn:li:(ugcPost|share):\d+/);
  if (!achado) throw new Error('Não achei uma URN de post em: ' + entrada);
  return achado[0];
}

(async function () {
  lib.carregarEnv();
  const token = lib.exigir('LINKEDIN_ACCESS_TOKEN', 'Rode auth.js primeiro.');
  const urn = extrairUrn(process.argv[2]);

  // ugcPosts e shares saem pelo mesmo endpoint legado, com a URN codificada no caminho.
  await lib.chamar('https://api.linkedin.com/v2/ugcPosts/' + encodeURIComponent(urn), {
    method: 'DELETE',
    headers: lib.cabecalhos(token),
  });

  console.log('Apagado: ' + urn);
  console.log('O post saiu do feed. Se havia arquivo publicado.md, apagar ele também.');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  if (erro.status === 401) console.error('Token vencido. Rode auth.js de novo.');
  if (erro.status === 403) console.error('Esse post não é seu, ou o token perdeu o escopo w_member_social.');
  if (erro.status === 404) console.error('Post não encontrado. Pode já ter sido apagado.');
  process.exit(1);
});
