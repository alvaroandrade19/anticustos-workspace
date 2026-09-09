// Mostra e mexe na fila de posts do Instagram agendados que vive no KV da Cloudflare.
//
//   node .claude/skills/publicar-social-ratos/scripts/fila.js              lista tudo
//   node ... fila.js --cancelar <id>                                       tira da fila
//   node ... fila.js --disparar                                            acorda o Worker na hora (teste)
//   node ... fila.js --limpar-resultados                                   apaga o histórico de resultados
'use strict';

const lib = require('./lib-instagram.js');
const cfl = require('./lib-cloudflare.js');
const arq = require('./lib-arquivo.js');

const REDE = 'instagram';

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
  const ns = lib.exigir('INSTAGRAM_FILA_KV_ID', 'Rode deploy-worker.js primeiro.');

  if (typeof opcoes.cancelar === 'string') {
    const chave = opcoes.cancelar.startsWith('post:') ? opcoes.cancelar : 'post:' + opcoes.cancelar;
    const existente = await cfl.kvLer(ns, chave);
    if (!existente) throw new Error('Não achei esse agendamento: ' + chave);
    if (existente.publicando) {
      throw new Error('Esse item está publicando agora. Espere o ciclo terminar antes de cancelar.');
    }
    await cfl.kvApagar(ns, chave);
    console.log('Cancelado: ' + chave);

    // Cancelar devolve a peça para a área de produção de onde ela saiu.
    try {
      const devolvida = arq.devolverDaFila(REDE, existente.slug);
      if (devolvida) console.log('Peça devolvida para ' + arq.relativo(devolvida));
    } catch (erro) {
      console.log('Aviso: não consegui devolver a pasta (' + erro.message + '). Ela segue em conteudo/agendado/.');
    }

    console.log('As imagens seguem no catbox com link público. Nada foi postado.');
    return;
  }

  if (opcoes.disparar) {
    const url = lib.exigir('INSTAGRAM_WORKER_URL', 'Rode deploy-worker.js primeiro.');
    const segredo = lib.exigir('INSTAGRAM_GATILHO_SECRET', 'Rode deploy-worker.js primeiro.');
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
    console.log(
      '  tipo: ' + item.tipo + ' | slug: ' + item.slug +
      ' | ' + item.midia.length + ' mídia(s) | ' + item.legenda.length + ' caracteres'
    );
    if (item.publicando) console.log('  publicando desde ' + local(item.publicando));
    if (item.tentativas) console.log('  tentativas: ' + item.tentativas + ' | último erro: ' + item.ultimoErro);
  }

  console.log('\n=== Resultados (' + resultados.length + ') ===');
  if (!resultados.length) console.log('(nenhum ainda)');
  for (const chave of resultados) {
    const r = await cfl.kvLer(ns, chave.name);
    if (!r) continue;
    if (r.ok) console.log('- ' + r.slug + ' publicado em ' + local(r.publicadoEm) + '\n  ' + (r.url || '(sem permalink)'));
    else console.log('- ' + r.slug + ' FALHOU em ' + local(r.falhouEm) + '\n  ' + r.erro);

    // O Worker publica na Cloudflare e não alcança o disco daqui, então é aqui que a
    // peça sai de conteudo/agendado/ e vai para conteudo/publicado/.
    const pendente = arq.acharAgendado(REDE, r.slug);
    if (!pendente) continue;
    if (r.ok) {
      const destino = arq.paraPublicado(pendente, REDE, {
        tipo: r.tipo, mediaId: r.mediaId, url: r.url, publicadoEm: r.publicadoEm,
      });
      console.log('  peça movida para ' + arq.relativo(destino));
    } else {
      const estado = arq.lerEstado(pendente) || {};
      arq.gravarEstado(pendente, Object.assign({}, estado, {
        rede: REDE, slug: r.slug, estado: 'falhou', erro: r.erro,
      }));
      console.log('  peça segue em ' + arq.relativo(pendente) + ' (estado: falhou)');
    }
  }

  const dias = lib.diasAte(process.env.INSTAGRAM_TOKEN_EXPIRA_EM);
  if (dias !== null && dias <= 10) {
    console.log('\nAviso: o token do Instagram vence em ' + dias + ' dia(s). Rode renovar-token.js.');
  }
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
