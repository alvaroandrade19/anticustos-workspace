// Agenda um post do Instagram para uma hora futura, sem depender do PC ligado.
//
// As imagens sobem para o catbox agora, daqui. O que vai para a Cloudflare é só a
// URL e a legenda, e o Worker cria o container e publica na hora marcada. O container
// não é criado agora de propósito: ele expira em 24h, então só serve se criado na hora.
//
//   node .claude/skills/publicar-social-ratos/scripts/agendar.js \
//     --pasta conteudo/carrosseis/custo-invisivel-v3 --quando "2026-09-10 08:30"
//
//   --pasta   pega os PNG/JPG em ordem e a legenda.md da mesma pasta
//   --imagens lista separada por vírgula, alternativa ao --pasta
//   --video   um arquivo de vídeo, publica como Reels
//   --legenda arquivo de legenda, se não for o legenda.md da pasta
//   --quando  "AAAA-MM-DD HH:MM" (horário daqui) ou relativo: +30min, +2h, +1d
//   --dry     mostra o que faria, sem subir nada nem agendar
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib-instagram.js');
const cfl = require('./lib-cloudflare.js');
const arq = require('./lib-arquivo.js');
const oti = require('./otimizar.js');

const REDE = 'instagram';
const EXT_IMAGEM = ['.png', '.jpg', '.jpeg'];

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

function interpretarQuando(entrada) {
  if (!entrada || entrada === true) {
    throw new Error('Faltou --quando. Ex: --quando "2026-09-10 08:30" ou --quando +2h');
  }
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

// O legenda.md que sai da skill /carrossel tem cabeçalho e notas internas. O que vai
// para o Instagram é só o bloco "## Legenda (Instagram)".
function extrairLegenda(arquivo) {
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const marca = bruto.indexOf('## Legenda (Instagram)');
  if (marca === -1) return bruto.trim();
  let corpo = bruto.slice(marca + '## Legenda (Instagram)'.length);
  const fim = corpo.search(/\n---\s*\n|\n## /);
  if (fim !== -1) corpo = corpo.slice(0, fim);
  return corpo.trim();
}

function imagensDaPasta(pasta) {
  return fs
    .readdirSync(pasta)
    .filter((n) => EXT_IMAGEM.includes(path.extname(n).toLowerCase()))
    .sort()
    .map((n) => path.join(pasta, n));
}

(async function () {
  lib.carregarEnv();
  const opcoes = args();

  const token = lib.exigir('INSTAGRAM_ACCESS_TOKEN', 'Rode o setup da skill primeiro.');
  lib.exigir('INSTAGRAM_USER_ID', 'Rode o setup da skill primeiro.');
  const ns = lib.exigir('INSTAGRAM_FILA_KV_ID', 'Rode deploy-worker.js primeiro.');

  const quando = interpretarQuando(opcoes.quando);
  const emMs = quando.getTime() - Date.now();
  if (emMs <= 0) throw new Error('Esse horário já passou: ' + formatarLocal(quando));

  // Token vencido no meio do caminho significa post que não sai e ninguém percebe.
  const expira = process.env.INSTAGRAM_TOKEN_EXPIRA_EM;
  if (expira && quando.getTime() > new Date(expira).getTime()) {
    throw new Error(
      'O token do Instagram vence em ' + expira.slice(0, 10) + ', antes desse agendamento. ' +
      'Rode renovar-token.js primeiro.'
    );
  }

  // --- o que publicar ---
  let arquivos = [];
  let video = null;
  let slug = 'avulso';
  let arquivoLegenda = typeof opcoes.legenda === 'string' ? path.resolve(opcoes.legenda) : null;

  if (typeof opcoes.pasta === 'string') {
    const pasta = path.resolve(opcoes.pasta);
    if (!fs.existsSync(pasta)) throw new Error('Pasta não encontrada: ' + pasta);
    arquivos = imagensDaPasta(pasta);
    if (!arquivos.length) throw new Error('Nenhuma imagem em ' + pasta);
    slug = path.basename(pasta) === 'web' ? path.basename(path.dirname(pasta)) : path.basename(pasta);
    if (!arquivoLegenda) {
      // A pasta "web/" criada pelo otimizar.js não tem legenda própria: usa a do carrossel.
      for (const candidato of [path.join(pasta, 'legenda.md'), path.join(pasta, '..', 'legenda.md')]) {
        if (fs.existsSync(candidato)) { arquivoLegenda = candidato; break; }
      }
    }
  } else if (typeof opcoes.imagens === 'string') {
    arquivos = opcoes.imagens.split(',').map((s) => path.resolve(s.trim()));
    slug = path.basename(path.dirname(arquivos[0]));
  } else if (typeof opcoes.video === 'string') {
    video = path.resolve(opcoes.video);
    if (!fs.existsSync(video)) throw new Error('Vídeo não encontrado: ' + video);
    slug = path.basename(path.dirname(video));
  } else {
    throw new Error('Diga o que publicar: --pasta, --imagens ou --video.');
  }

  if (!arquivoLegenda) throw new Error('Faltou a legenda. Use --legenda <arquivo> ou deixe um legenda.md na pasta.');
  if (!fs.existsSync(arquivoLegenda)) throw new Error('Arquivo de legenda não encontrado: ' + arquivoLegenda);
  const legenda = lib.validarLegenda(extrairLegenda(arquivoLegenda));

  // Imagem pesada faz o host dar 504. Gera a versão leve antes, já que o Instagram
  // reamostra tudo para 1080 de largura de qualquer jeito.
  if (!video && !opcoes['sem-otimizar'] && oti.precisaOtimizar(arquivos)) {
    const pastaOrigem = path.dirname(arquivos[0]);
    console.log('Imagem acima de 2MB: gerando versão de 1080px antes de subir.');
    arquivos = await oti.otimizarPasta(pastaOrigem, (linha) => console.log('  ' + linha));
    console.log('');
  }

  let tipo;
  if (video) {
    tipo = 'reels';
  } else {
    lib.validarImagens(arquivos);
    tipo = arquivos.length >= lib.MIN_CARROSSEL ? 'carrossel' : 'imagem';
  }

  if (opcoes.dry) {
    console.log('Tipo: ' + tipo + ' | slug: ' + slug);
    console.log('Publicaria em: ' + formatarLocal(quando) + ' (daqui a ' + Math.round(emMs / 60000) + ' min)');
    console.log('Legenda: ' + legenda.length + '/' + lib.LIMITE_LEGENDA + ' caracteres');
    const midia = video ? [video] : arquivos;
    console.log('Mídia (' + midia.length + '): ' + midia.map((m) => path.basename(m)).join(', '));
    console.log('\n--- legenda ---\n' + legenda);
    console.log('\n(--dry: nada foi enviado nem agendado)');
    return;
  }

  // --- sobe a mídia para o host público ---
  const midia = [];
  for (const arq of video ? [video] : arquivos) {
    midia.push(await lib.subirParaCatbox(arq));
    console.log('subiu: ' + path.basename(arq));
  }

  const item = {
    rede: 'instagram',
    slug: slug,
    tipo: tipo,
    quando: quando.toISOString(),
    legenda: legenda,
    midia: midia,
    criadoEm: new Date().toISOString(),
    tentativas: 0,
  };

  const id = quando.toISOString().replace(/[:.]/g, '-') + '_' + slug;
  await cfl.kvGravar(ns, 'post:' + id, item);

  console.log('\nAgendado.');
  console.log('id: ' + id);
  console.log('Publica em: ' + formatarLocal(quando));
  console.log('O Worker acorda de 5 em 5 minutos, então a publicação sai nessa janela.');

  // A peça sai da área de produção e vai para a fila, para conteudo/carrosseis/ ficar
  // só com o que ainda não saiu. O fila.js move de novo quando o post for publicado.
  const pastaPeca = arq.pastaDaPeca(
    typeof opcoes.pasta === 'string' ? path.resolve(opcoes.pasta) : (video || arquivos[0])
  );
  if (!opcoes['sem-mover'] && fs.existsSync(pastaPeca)) {
    const destino = arq.paraAgendado(pastaPeca, REDE, { tipo: tipo, quando: item.quando, idFila: id });
    console.log('Peça movida para ' + arq.relativo(destino));
  }

  console.log('Ver ou cancelar: node .claude/skills/publicar-social-ratos/scripts/fila.js');

  const dias = lib.diasAte(expira);
  if (dias !== null && dias <= 7) {
    console.log('\nAviso: o token do Instagram vence em ' + dias + ' dia(s). Rode renovar-token.js.');
  }
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
