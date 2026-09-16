// Publica agora no Instagram pela Graph API: carrossel, imagem única ou Reels.
//
//   node .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js \
//     --pasta conteudo/carrosseis/<slug>
//
//   --pasta        pega as imagens em ordem e a legenda.md da mesma pasta
//   --images       lista separada por vírgula, alternativa ao --pasta
//   --video        um arquivo de vídeo, publica como Reels
//   --caption      legenda literal, se não vier de arquivo
//   --legenda      arquivo de legenda, se não for o legenda.md da pasta
//   --dry-run      sobe a mídia e para antes de falar com o Instagram
//   --sem-otimizar não gera versão leve, mesmo com imagem pesada
//   --sem-mover    não move a pasta para conteudo/publicado/
//
// Para publicar em hora marcada, com o computador desligado, use agendar.js.
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib-instagram.js');
const arq = require('./lib-arquivo.js');
const oti = require('./otimizar.js');

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

function acharLegenda(pasta) {
  for (const c of [path.join(pasta, 'legenda.md'), path.join(pasta, '..', 'legenda.md')]) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

(async function () {
  lib.carregarEnv();
  const opcoes = args();

  const token = lib.exigir('INSTAGRAM_ACCESS_TOKEN', 'Rode o setup da skill primeiro.');
  const userId = lib.exigir('INSTAGRAM_USER_ID', 'Rode o setup da skill primeiro.');

  // --- o que publicar ---
  let arquivos = [];
  let video = null;
  let pastaPeca = null;
  let arquivoLegenda = typeof opcoes.legenda === 'string' ? path.resolve(opcoes.legenda) : null;

  if (typeof opcoes.pasta === 'string') {
    const pasta = path.resolve(opcoes.pasta);
    if (!fs.existsSync(pasta)) throw new Error('Pasta não encontrada: ' + pasta);
    arquivos = oti.imagensDe(pasta);
    if (!arquivos.length) throw new Error('Nenhuma imagem em ' + pasta);
    pastaPeca = arq.pastaDaPeca(pasta);
    if (!arquivoLegenda) arquivoLegenda = acharLegenda(pasta);
  } else if (typeof opcoes.images === 'string') {
    arquivos = opcoes.images.split(',').map((s) => path.resolve(s.trim()));
    pastaPeca = arq.pastaDaPeca(arquivos[0]);
    if (!arquivoLegenda) arquivoLegenda = acharLegenda(path.dirname(arquivos[0]));
  } else if (typeof opcoes.video === 'string') {
    video = path.resolve(opcoes.video);
    if (!fs.existsSync(video)) throw new Error('Vídeo não encontrado: ' + video);
    pastaPeca = arq.pastaDaPeca(video);
    if (!arquivoLegenda) arquivoLegenda = acharLegenda(path.dirname(video));
  } else {
    throw new Error('Diga o que publicar: --pasta, --images ou --video.');
  }

  let legenda;
  if (typeof opcoes.caption === 'string') legenda = opcoes.caption;
  else if (arquivoLegenda && fs.existsSync(arquivoLegenda)) legenda = extrairLegenda(arquivoLegenda);
  else throw new Error('Faltou a legenda. Use --caption, --legenda <arquivo>, ou deixe um legenda.md na pasta.');
  lib.validarLegenda(legenda);

  // --- imagem pesada quebra o upload, então gera a versão leve antes ---
  if (!video && !opcoes['sem-otimizar'] && oti.precisaOtimizar(arquivos)) {
    const pastaOrigem = path.dirname(arquivos[0]);
    console.log('Imagem acima de 2MB: gerando versão de 1080px antes de subir.');
    console.log('(o Instagram reamostra pra 1080 de qualquer jeito, então nada se perde)');
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

  console.log('Tipo: ' + tipo + ' | ' + (video ? 1 : arquivos.length) + ' mídia(s) | ' + legenda.length + ' caracteres');

  // --- sobe a mídia para o host público ---
  // imgbb só aceita imagem. Vídeo (Reels) segue no catbox por ora, ver nota em agendar.js.
  // Imagem sobe em dois hosts: se a Meta recusar a URL principal na hora de criar o
  // container, a reserva entra sem refazer o upload.
  const urls = [];
  const reservas = [];
  for (const a of video ? [video] : arquivos) {
    if (video) {
      urls.push(await lib.subirParaCatbox(a));
      reservas.push(null);
    } else {
      const { url, reserva } = await lib.subirImagemComReserva(a);
      urls.push(url);
      reservas.push(reserva);
    }
    console.log('subiu: ' + path.basename(a));
  }

  if (opcoes['dry-run']) {
    console.log('\nDRY RUN: mídia pronta, nada publicado.');
    return;
  }

  // --- Graph API ---
  const G = lib.GRAPH;
  const criar = async (campos) => {
    const body = new URLSearchParams(Object.assign({ access_token: token }, campos));
    const j = await lib.chamarGraph(G + '/' + userId + '/media', { method: 'POST', body });
    return j.id;
  };
  const esperar = async (id, teto) => {
    const limite = Date.now() + teto;
    while (Date.now() < limite) {
      const j = await lib.chamarGraph(G + '/' + id + '?fields=status_code&access_token=' + token);
      if (j.status_code === 'FINISHED') return;
      if (j.status_code === 'ERROR' || j.status_code === 'EXPIRED') {
        throw new Error('Container ' + id + ' voltou ' + j.status_code);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error('Timeout esperando o container ' + id);
  };

  // Troca de host quando a Meta recusa a URL principal: o erro só aparece aqui, na
  // hora em que ela tenta baixar a imagem. Ver nota em lib-instagram.js.
  const criarImagem = async (campos, url, reserva) => {
    try {
      const id = await criar(Object.assign({ image_url: url }, campos));
      await esperar(id, 90000);
      return id;
    } catch (erro) {
      if (!reserva) throw erro;
      console.log('  host principal recusado pela Meta, tentando a reserva: ' + erro.message);
      const id = await criar(Object.assign({ image_url: reserva }, campos));
      await esperar(id, 90000);
      return id;
    }
  };

  let containerFinal;
  if (tipo === 'reels') {
    console.log('\nCriando container de vídeo (pode levar alguns minutos)...');
    containerFinal = await criar({ media_type: 'REELS', video_url: urls[0], caption: legenda });
    await esperar(containerFinal, 300000);
  } else if (tipo === 'imagem') {
    console.log('\nCriando container...');
    containerFinal = await criarImagem({ caption: legenda }, urls[0], reservas[0]);
  } else {
    console.log('\nCriando containers...');
    const filhos = [];
    for (let i = 0; i < urls.length; i++) {
      const id = await criarImagem({ is_carousel_item: 'true' }, urls[i], reservas[i]);
      filhos.push(id);
      console.log('  ok: ' + id);
    }
    console.log('Montando carrossel...');
    containerFinal = await criar({ media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda });
    await esperar(containerFinal, 90000);
  }

  console.log('Publicando...');
  const body = new URLSearchParams({ creation_id: containerFinal, access_token: token });
  const pub = await lib.chamarGraph(G + '/' + userId + '/media_publish', { method: 'POST', body });

  let link = null;
  try {
    const j = await lib.chamarGraph(G + '/' + pub.id + '?fields=permalink&access_token=' + token);
    link = j.permalink || null;
  } catch (_) { /* permalink é conforto, não pode derrubar o resto */ }

  console.log('\nPublicado!');
  if (link) console.log(link);

  // --- arquiva a peça ---
  if (pastaPeca && !opcoes['sem-mover'] && fs.existsSync(pastaPeca)) {
    const destino = arq.paraPublicado(pastaPeca, REDE, {
      tipo: tipo,
      mediaId: pub.id,
      url: link,
      publicadoEm: new Date().toISOString(),
    });
    console.log('Peça movida para ' + arq.relativo(destino));
  }
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
