// Mostra e mexe na fila de posts agendados que vive no KV da Cloudflare.
//
//   node .claude/skills/postar-linkedin/scripts/fila.js              lista tudo
//   node ... fila.js --cancelar <id>                                 tira da fila
//   node ... fila.js --disparar                                      acorda o Worker na hora (teste)
//   node ... fila.js --limpar-resultados                             apaga o histórico de resultados
'use strict';

const lib = require('./lib-linkedin.js');
const cfl = require('./lib-cloudflare.js');

function args() {
  const saida = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const chave = argv[i].slice(2);
    const proximo = argv[i + 1];
    saida[chave] = proximo && !proximo.startsWith('--') ? argv[++i] : true;
  }
  return saida;
}

function local(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

(async function () {
  lib.carregarEnv();
  const opcoes = args();
  const ns = lib.exigir('LINKEDIN_FILA_KV_ID', 'Rode deploy-worker.js primeiro.');

  if (typeof opcoes.cancelar === 'string') {
    const chave = opcoes.cancelar.startsWith('post:') ? opcoes.cancelar : 'post:' + opcoes.cancelar;
    const existente = await cfl.kvLer(ns, chave);
    if (!existente) throw new Error('Não achei esse agendamento: ' + chave);
    await cfl.kvApagar(ns, chave);
    console.log('Cancelado: ' + chave);
    console.log('As imagens já enviadas ao LinkedIn ficam órfãs, e isso não gera post nem cobrança.');
    return;
  }

  if (opcoes.disparar) {
    const url = lib.exigir('LINKEDIN_WORKER_URL', 'Rode deploy-worker.js primeiro.');
    const segredo = lib.exigir('LINKEDIN_GATILHO_SECRET', 'Rode deploy-worker.js primeiro.');
    const resposta = await fetch(url, { headers: { 'x-gatilho': segredo } });
    const corpo = await resposta.text();
    console.log('Worker respondeu ' + resposta.status + ':');
    console.log(corpo);
    return;
  }

  if (opcoes['limpar-resultados']) {
    const chaves = await cfl.kvListar(ns, 'resultado:');
    for (const c of chaves) await cfl.kvApagar(ns, c.name);
    console.log(chaves.length + ' resultado(s) apagado(s).');
    return;
  }

  const pendentes = await cfl.kvListar(ns, 'post:');
  const resultados = await cfl.kvListar(ns, 'resultado:');

  console.log('=== Agendados (' + pendentes.length + ') ===');
  if (!pendentes.length) console.log('(nada na fila)');
  for (const chave of pendentes) {
    const item = await cfl.kvLer(ns, chave.name);
    if (!item) continue;
    const atrasado = new Date(item.quando).getTime() < Date.now();
    console.log('- ' + chave.name.slice(5));
    console.log('  quando: ' + local(item.quando) + (atrasado ? '  (já venceu, sai no próximo ciclo)' : ''));
    console.log('  modo: ' + item.modo + ' | slug: ' + item.slug + ' | ' + item.texto.length + ' caracteres');
    if (item.tentativas) console.log('  tentativas: ' + item.tentativas + ' | último erro: ' + item.ultimoErro);
  }

  console.log('\n=== Resultados (' + resultados.length + ') ===');
  if (!resultados.length) console.log('(nenhum ainda)');
  for (const chave of resultados) {
    const r = await cfl.kvLer(ns, chave.name);
    if (!r) continue;
    if (r.ok) console.log('- ' + r.slug + ' publicado em ' + local(r.publicadoEm) + '\n  ' + r.url);
    else console.log('- ' + r.slug + ' FALHOU em ' + local(r.falhouEm) + '\n  ' + r.erro);
  }
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
