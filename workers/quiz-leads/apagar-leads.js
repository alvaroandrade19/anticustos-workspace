// Apaga leads de teste do KV do quiz-leads, por id.
// Acha a chave completa (lead:<ts_inicio>:<id>) sozinho e remove junto o indice
// fone:<whatsapp>, para nao deixar rastro nenhum do teste no KV de producao.
//
//   node workers/quiz-leads/apagar-leads.js <id1> <id2> ...
'use strict';

const env = require('./lib-env.js');
const cfl = require('./lib-cloudflare.js');

(async function () {
  env.carregarEnv();
  const ns = env.exigir('QUIZ_LEADS_KV_ID', 'Rode workers/quiz-leads/criar-kv.js primeiro.');

  const idsAlvo = process.argv.slice(2);
  if (!idsAlvo.length) {
    console.error('Uso: node apagar-leads.js <id1> <id2> ...');
    process.exit(1);
  }

  // A chave e "lead:<ts_inicio>:<id>", e o ts_inicio (ISO) tem dois-pontos
  // dentro dele, entao separar por ':' nao isola o id. endsWith resolve sem
  // depender do formato do timestamp.
  const chaves = await cfl.kvListar(ns, 'lead:');
  let apagados = 0;

  for (const chave of chaves) {
    const bate = idsAlvo.some((id) => chave.name.endsWith(':' + id));
    if (!bate) continue;

    const lead = await cfl.kvLer(ns, chave.name);
    await cfl.kvApagar(ns, chave.name);
    console.log('apagado:', chave.name);
    apagados++;

    const foneDigits = String((lead && lead.whatsapp) || '').replace(/\D/g, '');
    if (foneDigits) {
      await cfl.kvApagar(ns, `fone:${foneDigits}`);
      console.log('apagado:', `fone:${foneDigits}`);
    }
  }

  const naoAchados = idsAlvo.filter((id) => !chaves.some((c) => c.name.endsWith(':' + id)));
  if (naoAchados.length) console.log('nao encontrados no KV:', naoAchados.join(', '));
  console.log(`\n${apagados} lead(s) apagado(s).`);
})().catch((erro) => {
  console.error('Erro:', erro.message);
  process.exit(1);
});
