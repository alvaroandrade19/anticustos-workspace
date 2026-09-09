// Publica um post no perfil pessoal do LinkedIn.
//
//   node .claude/skills/postar-linkedin/scripts/publish.js --texto conteudo/linkedin/<pasta>/post.md
//   ... --imagem 01.png                       (post com uma imagem)
//   ... --imagem 01.png --imagem 02.png ...   (carrossel de imagens, de 2 a 20)
//   ... --link https://exemplo.com            (post com preview de link)
//   ... --dry                                 (mostra o que iria, não publica)
//
// Opcionais: --visibilidade PUBLIC|CONNECTIONS (padrão PUBLIC),
//            --titulo, --descricao (só no modo link), --alt (repetível, por imagem)
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib-linkedin.js');
const arq = require('./lib-arquivo.js');

const REDE = 'linkedin';

const LIMITE_TEXTO = lib.LIMITE_TEXTO;
const MAX_IMAGENS = lib.MAX_IMAGENS;

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

const validarTexto = lib.validarTexto;
const subirImagemLegado = lib.subirImagemLegado;
const subirImagemRest = lib.subirImagemRest;

function urlDoPost(headers) {
  const id = headers.get('x-restli-id');
  if (!id) return null;
  return 'https://www.linkedin.com/feed/update/' + id + '/';
}

(async function () {
  lib.carregarEnv();
  const opcoes = args();
  const token = lib.exigir('LINKEDIN_ACCESS_TOKEN', 'Rode auth.js primeiro.');
  const urn = lib.exigir('LINKEDIN_PERSON_URN', 'Rode auth.js primeiro.');

  const visibilidade = typeof opcoes.visibilidade === 'string' ? opcoes.visibilidade.toUpperCase() : 'PUBLIC';
  if (visibilidade !== 'PUBLIC' && visibilidade !== 'CONNECTIONS') {
    throw new Error('Visibilidade inválida: use PUBLIC ou CONNECTIONS.');
  }

  const expira = process.env.LINKEDIN_TOKEN_EXPIRA_EM;
  const dias = lib.diasAte(expira);
  if (dias !== null && dias < 0) {
    throw new Error('O token venceu em ' + expira.slice(0, 10) + '. Rode auth.js de novo antes de publicar.');
  }

  if (!opcoes.texto) throw new Error('Faltou --texto <arquivo>.');
  const arquivoTexto = path.resolve(String(opcoes.texto));
  if (!fs.existsSync(arquivoTexto)) throw new Error('Arquivo de texto não encontrado: ' + arquivoTexto);
  const texto = fs.readFileSync(arquivoTexto, 'utf8').trim();
  validarTexto(texto);

  const imagens = opcoes.imagem.map(function (i) { return path.resolve(String(i)); });
  for (const img of imagens) {
    if (!fs.existsSync(img)) throw new Error('Imagem não encontrada: ' + img);
  }
  if (imagens.length > MAX_IMAGENS) throw new Error('Máximo de ' + MAX_IMAGENS + ' imagens por post.');

  const link = typeof opcoes.link === 'string' ? opcoes.link : null;
  if (link && imagens.length) throw new Error('Não dá pra combinar --link com --imagem no mesmo post.');

  const modo = imagens.length >= 2 ? 'multi-imagem'
    : imagens.length === 1 ? 'imagem'
    : link ? 'link' : 'texto';

  if (opcoes.dry) {
    console.log('Modo: ' + modo);
    console.log('Autor: ' + urn + ' | visibilidade: ' + visibilidade);
    console.log('Caracteres: ' + texto.length + '/' + LIMITE_TEXTO);
    if (imagens.length) console.log('Imagens: ' + imagens.map(function (i) { return path.basename(i); }).join(', '));
    if (link) console.log('Link: ' + link);
    if (dias !== null) console.log('Token expira em ' + dias + ' dias');
    console.log('\n--- texto ---\n' + texto);
    console.log('\n(--dry: nada foi publicado)');
    return;
  }

  let resultado;

  if (modo === 'multi-imagem') {
    // Multi-imagem só existe na REST API nova, com content.multiImage.
    const urns = [];
    for (const img of imagens) {
      urns.push(await subirImagemRest(img, token, urn));
      console.log('subiu: ' + path.basename(img));
    }
    const corpo = {
      author: urn,
      commentary: lib.escaparCommentary(texto),
      visibility: visibilidade,
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: {
        multiImage: {
          images: urns.map(function (id, i) {
            const item = { id: id };
            if (opcoes.alt[i]) item.altText = String(opcoes.alt[i]);
            return item;
          }),
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };
    resultado = await lib.chamar('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: lib.cabecalhos(token, { 'Content-Type': 'application/json', 'LinkedIn-Version': lib.VERSAO_API }),
      body: JSON.stringify(corpo),
    });
  } else {
    const conteudo = {
      shareCommentary: { text: texto },
      shareMediaCategory: imagens.length ? 'IMAGE' : link ? 'ARTICLE' : 'NONE',
    };
    if (imagens.length) {
      const asset = await subirImagemLegado(imagens[0], token, urn);
      console.log('subiu: ' + path.basename(imagens[0]));
      const media = { status: 'READY', media: asset };
      if (opcoes.alt[0]) media.description = { text: String(opcoes.alt[0]) };
      conteudo.media = [media];
    } else if (link) {
      const media = { status: 'READY', originalUrl: link };
      if (typeof opcoes.titulo === 'string') media.title = { text: opcoes.titulo };
      if (typeof opcoes.descricao === 'string') media.description = { text: opcoes.descricao };
      conteudo.media = [media];
    }
    resultado = await lib.chamar('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: lib.cabecalhos(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        author: urn,
        lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': conteudo },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibilidade },
      }),
    });
  }

  const url = urlDoPost(resultado.headers);
  console.log('\nPublicado (' + modo + ').');
  if (url) console.log(url);
  else console.log('Post criado, mas o LinkedIn não devolveu o id. Confere no feed do perfil.');

  // A peca sai da area de producao e vai para conteudo/publicado/linkedin/.
  const pastaPeca = arq.pastaDaPeca(arquivoTexto);
  if (!opcoes['sem-mover'] && fs.existsSync(pastaPeca)) {
    const destino = arq.paraPublicado(pastaPeca, REDE, {
      modo: modo,
      url: url || null,
      publicadoEm: new Date().toISOString(),
    });
    console.log('Peca movida para ' + arq.relativo(destino));
  }
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  if (erro.status === 401) console.error('Token vencido ou inválido. Rode auth.js de novo.');
  if (erro.status === 403) console.error('Sem permissão. Confere se o token tem o escopo w_member_social.');
  if (erro.status === 422) console.error('O LinkedIn recusou o conteúdo. Costuma ser caractere no texto ou imagem fora do padrão.');
  if (erro.status === 429) console.error('Bateu o limite diário de 150 chamadas por membro. Tenta amanhã.');
  process.exit(1);
});
