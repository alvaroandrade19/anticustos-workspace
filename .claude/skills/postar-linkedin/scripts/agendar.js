// Agenda um post do LinkedIn para uma hora futura, sem depender do PC ligado.
//
// As imagens sobem para o LinkedIn agora, daqui. O que vai para a Cloudflare é só
// texto e URN, e o Worker publica na hora marcada.
//
//   node .claude/skills/postar-linkedin/scripts/agendar.js \
//     --texto conteudo/linkedin/<slug>/post.md --quando "2026-09-10 08:30"
//
//   --quando aceita "AAAA-MM-DD HH:MM" (horário daqui) ou relativo: +30min, +2h, +1d
//   Demais opções são as mesmas do publish.js: --imagem, --link, --alt,
//   --titulo, --descricao, --visibilidade, --dry
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib-linkedin.js');
const cfl = require('./lib-cloudflare.js');
const arq = require('./lib-arquivo.js');

const REDE = 'linkedin';

const LIMITE_AVISO_DIAS = 7;

function args() {
  const saida = { imagem: [], alt: [] };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const chave = argv[i].slice(2);
    const proximo = argv[i + 1];
    const valor = proximo && !proximo.startsWith('--') ? argv[++i] : true;
    if (chave === 'imagem' || chave === 'alt') saida[chave].push(valor);
    else saida[chave] = valor;
  }
  return saida;
}

function interpretarQuando(entrada) {
  if (!entrada || entrada === true) throw new Error('Faltou --quando. Ex: --quando "2026-09-10 08:30" ou --quando +2h');
  const texto = String(entrada).trim();

  const relativo = texto.match(/^\+(\d+)\s*(min|m|h|d)$/i);
  if (relativo) {
    const n = Number(relativo[1]);
    const unidade = relativo[2].toLowerCase();
    const ms = unidade === 'd' ? n * 86400000 : unidade === 'h' ? n * 3600000 : n * 60000;
    return new Date(Date.now() + ms);
  }

  // "2026-09-10 08:30" é lido como horário local da máquina, que é o que o Alvaro espera.
  const data = new Date(texto.replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) {
    throw new Error('Não entendi a data "' + texto + '". Use "AAAA-MM-DD HH:MM" ou +30min, +2h, +1d.');
  }
  return data;
}

function formatarLocal(data) {
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

(async function () {
  lib.carregarEnv();
  const opcoes = args();

  const token = lib.exigir('LINKEDIN_ACCESS_TOKEN', 'Rode auth.js primeiro.');
  const urn = lib.exigir('LINKEDIN_PERSON_URN', 'Rode auth.js primeiro.');
  const ns = lib.exigir('LINKEDIN_FILA_KV_ID', 'Rode deploy-worker.js primeiro.');

  const quando = interpretarQuando(opcoes.quando);
  const emMs = quando.getTime() - Date.now();
  if (emMs <= 0) throw new Error('Esse horário já passou: ' + formatarLocal(quando));

  const visibilidade = typeof opcoes.visibilidade === 'string' ? opcoes.visibilidade.toUpperCase() : 'PUBLIC';
  if (visibilidade !== 'PUBLIC' && visibilidade !== 'CONNECTIONS') {
    throw new Error('Visibilidade inválida: use PUBLIC ou CONNECTIONS.');
  }

  const expira = process.env.LINKEDIN_TOKEN_EXPIRA_EM;
  if (expira && quando.getTime() > new Date(expira).getTime()) {
    throw new Error('O token do LinkedIn vence em ' + expira.slice(0, 10) + ', antes desse agendamento. Renove primeiro.');
  }

  if (!opcoes.texto) throw new Error('Faltou --texto <arquivo>.');
  const arquivoTexto = path.resolve(String(opcoes.texto));
  if (!fs.existsSync(arquivoTexto)) throw new Error('Arquivo de texto não encontrado: ' + arquivoTexto);
  const texto = fs.readFileSync(arquivoTexto, 'utf8').trim();
  lib.validarTexto(texto);

  const imagens = opcoes.imagem.map(function (i) { return path.resolve(String(i)); });
  for (const img of imagens) {
    if (!fs.existsSync(img)) throw new Error('Imagem não encontrada: ' + img);
  }
  if (imagens.length > lib.MAX_IMAGENS) throw new Error('Máximo de ' + lib.MAX_IMAGENS + ' imagens por post.');

  const link = typeof opcoes.link === 'string' ? opcoes.link : null;
  if (link && imagens.length) throw new Error('Não dá pra combinar --link com --imagem no mesmo post.');

  const modo = imagens.length >= 2 ? 'multi-imagem' : imagens.length === 1 ? 'imagem' : link ? 'link' : 'texto';
  const slug = path.basename(path.dirname(arquivoTexto));
  const dias = emMs / 86400000;

  // Imagem enviada e não usada pode ser descartada pelo LinkedIn. Não achamos prazo
  // documentado, então agendamento longo com imagem exige confirmação explícita.
  if (imagens.length && dias > LIMITE_AVISO_DIAS && !opcoes.forcar) {
    throw new Error(
      'Agendamento com imagem a ' + Math.round(dias) + ' dias de distância. Não se sabe por quanto tempo ' +
      'o LinkedIn guarda imagem enviada e não publicada. Repita com --forcar se quiser assumir o risco.'
    );
  }

  if (opcoes.dry) {
    console.log('Modo: ' + modo + ' | slug: ' + slug);
    console.log('Publicaria em: ' + formatarLocal(quando) + ' (daqui a ' + Math.round(emMs / 60000) + ' min)');
    console.log('Visibilidade: ' + visibilidade + ' | caracteres: ' + texto.length + '/' + lib.LIMITE_TEXTO);
    if (imagens.length) console.log('Imagens: ' + imagens.map(function (i) { return path.basename(i); }).join(', '));
    if (link) console.log('Link: ' + link);
    console.log('\n--- texto ---\n' + texto);
    console.log('\n(--dry: nada foi enviado nem agendado)');
    return;
  }

  const item = {
    slug: slug,
    quando: quando.toISOString(),
    modo: modo,
    texto: texto,
    visibilidade: visibilidade,
    criadoEm: new Date().toISOString(),
    tentativas: 0,
  };

  if (modo === 'multi-imagem') {
    item.imagens = [];
    for (const img of imagens) {
      item.imagens.push(await lib.subirImagemRest(img, token, urn));
      console.log('subiu: ' + path.basename(img));
    }
    item.alt = opcoes.alt.map(String);
  } else if (modo === 'imagem') {
    item.asset = await lib.subirImagemLegado(imagens[0], token, urn);
    console.log('subiu: ' + path.basename(imagens[0]));
    item.alt = opcoes.alt.map(String);
  } else if (modo === 'link') {
    item.link = link;
    if (typeof opcoes.titulo === 'string') item.titulo = opcoes.titulo;
    if (typeof opcoes.descricao === 'string') item.descricao = opcoes.descricao;
  }

  const id = quando.toISOString().replace(/[:.]/g, '-') + '_' + slug;
  await cfl.kvGravar(ns, 'post:' + id, item);

  console.log('\nAgendado.');
  console.log('id: ' + id);
  console.log('Publica em: ' + formatarLocal(quando));
  console.log('O Worker acorda de 5 em 5 minutos, então a publicação sai nessa janela.');
  // A peca sai da area de producao e vai para a fila, para conteudo/linkedin/ ficar
  // so com o que ainda nao saiu. O fila.js move de novo quando o post for publicado.
  const pastaPeca = arq.pastaDaPeca(arquivoTexto);
  if (!opcoes['sem-mover'] && fs.existsSync(pastaPeca)) {
    const destino = arq.paraAgendado(pastaPeca, REDE, { modo: modo, quando: item.quando, idFila: id });
    console.log('Peca movida para ' + arq.relativo(destino));
  }

  console.log('Ver ou cancelar: node .claude/skills/postar-linkedin/scripts/fila.js');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
