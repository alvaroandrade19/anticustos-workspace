// Funções compartilhadas das rotinas de Instagram (publicar, agendar, fila).
// Sem dependência externa: usa fetch e FormData nativos do Node 18+.
'use strict';

const fs = require('fs');
const path = require('path');

// scripts -> publicar-social-ratos -> skills -> .claude -> raiz do workspace
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const CAMINHO_ENV = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(RAIZ, '.env');

const GRAPH = 'https://graph.instagram.com/v21.0';
const LIMITE_LEGENDA = 2200;
const MAX_IMAGENS = 10;
const MIN_CARROSSEL = 2;

// A API do Instagram recusa fora dessa faixa. 0.8 é o 4:5 clássico de carrossel.
const RATIO_MIN = 0.8;
const RATIO_MAX = 1.91;
// Teto de bytes por imagem aceito pela Content Publishing API.
const MAX_BYTES_IMAGEM = 8 * 1024 * 1024;

// ----- .env -----

function lerEnv() {
  if (!fs.existsSync(CAMINHO_ENV)) return {};
  const valores = {};
  for (const bruta of fs.readFileSync(CAMINHO_ENV, 'utf8').split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha || linha.startsWith('#')) continue;
    const corte = linha.indexOf('=');
    if (corte === -1) continue;
    const chave = linha.slice(0, corte).trim();
    let valor = linha.slice(corte + 1).trim();
    const aspas = (valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"));
    if (aspas) valor = valor.slice(1, -1);
    valores[chave] = valor;
  }
  return valores;
}

function carregarEnv() {
  const valores = lerEnv();
  for (const [chave, valor] of Object.entries(valores)) {
    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
  return valores;
}

function salvarEnv(novos) {
  let linhas = fs.existsSync(CAMINHO_ENV)
    ? fs.readFileSync(CAMINHO_ENV, 'utf8').split(/\r?\n/)
    : ['# Tokens e chaves. Nunca commitar. (.gitignore já bloqueia)'];
  while (linhas.length && linhas[linhas.length - 1].trim() === '') linhas.pop();
  for (const [chave, valor] of Object.entries(novos)) {
    const alvo = linhas.findIndex((l) => l.trim().startsWith(chave + '='));
    if (alvo >= 0) linhas[alvo] = chave + '=' + valor;
    else linhas.push(chave + '=' + valor);
  }
  while (linhas.length && linhas[linhas.length - 1].trim() === '') linhas.pop();
  fs.writeFileSync(CAMINHO_ENV, linhas.join('\n') + '\n', 'utf8');
  return CAMINHO_ENV;
}

function exigir(chave, dica) {
  const valor = process.env[chave];
  if (!valor) throw new Error('Falta ' + chave + ' no .env. ' + (dica || ''));
  return valor;
}

// ----- Leitura de PNG/JPEG sem biblioteca -----
// Só precisamos de largura e altura para barrar proporção que a API recusaria.

function dimensoes(arquivo) {
  const buf = fs.readFileSync(arquivo);
  if (buf.length > 24 && buf.toString('latin1', 1, 4) === 'PNG') {
    return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marcador = buf[i + 1];
      // SOF0..SOF15, fora dos marcadores que não carregam dimensão.
      if (marcador >= 0xc0 && marcador <= 0xcf && marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc) {
        return { altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null; // formato que não sabemos ler: deixa passar e a API decide
}

function validarLegenda(texto) {
  if (!texto || !texto.trim()) throw new Error('A legenda está vazia.');
  if (texto.length > LIMITE_LEGENDA) {
    throw new Error('Legenda com ' + texto.length + ' caracteres. O limite do Instagram é ' + LIMITE_LEGENDA + '.');
  }
  return texto;
}

function validarImagens(arquivos) {
  if (!arquivos.length) throw new Error('Nenhuma imagem informada.');
  if (arquivos.length > MAX_IMAGENS) {
    throw new Error('Instagram aceita no máximo ' + MAX_IMAGENS + ' imagens por carrossel. Vieram ' + arquivos.length + '.');
  }
  for (const arq of arquivos) {
    if (!fs.existsSync(arq)) throw new Error('Imagem não encontrada: ' + arq);
    const bytes = fs.statSync(arq).size;
    if (bytes > MAX_BYTES_IMAGEM) {
      throw new Error(path.basename(arq) + ' tem ' + (bytes / 1048576).toFixed(1) + 'MB. O limite da API é 8MB.');
    }
    const dim = dimensoes(arq);
    if (!dim) continue;
    const ratio = dim.largura / dim.altura;
    if (ratio < RATIO_MIN - 0.001 || ratio > RATIO_MAX + 0.001) {
      throw new Error(
        path.basename(arq) + ' tem proporção ' + ratio.toFixed(2) + ' (' + dim.largura + 'x' + dim.altura + '). ' +
        'O Instagram só aceita entre 0.8 (4:5) e 1.91.'
      );
    }
  }
  return arquivos;
}

// ----- Host público de mídia -----
// O Instagram não aceita upload de bytes: só engole URL pública. Por isso a imagem
// sobe primeiro para um host de terceiro e só a URL trafega até a Graph API.

// O catbox devolve 504 com alguma frequência em arquivo grande, e a falha é passageira.
// Três tentativas com espera crescente resolvem quase sempre.
//
// Desde 15/09/2026 o catbox saiu de uso: o upload em si continua funcionando (o link
// abre normal daqui), mas o crawler da Meta passa a devolver "An unknown error has
// occurred" (código 1, HTTP 500) ao tentar buscar qualquer imagem hospedada lá, em
// qualquer conta e qualquer imagem testada. Provável bloqueio do domínio do lado da
// Meta, não bug nosso. Função mantida como referência e fallback manual, mas fora do
// caminho padrão de publicação (ver subirImagem).
async function subirParaCatbox(arquivo, tentativas) {
  const total = tentativas || 3;
  const buf = fs.readFileSync(arquivo);
  let ultimo = '';

  for (let n = 1; n <= total; n++) {
    try {
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', new Blob([buf]), path.basename(arquivo));
      const resposta = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
      const texto = (await resposta.text()).trim();
      if (resposta.ok && texto.startsWith('https://')) return texto;
      ultimo = 'HTTP ' + resposta.status + ' ' + texto.replace(/\s+/g, ' ').slice(0, 120);
    } catch (erro) {
      ultimo = String(erro.message || erro);
    }
    if (n < total) await new Promise((r) => setTimeout(r, n * 4000));
  }

  throw new Error(
    'Catbox recusou ' + path.basename(arquivo) + ' em ' + total + ' tentativas: ' + ultimo +
    '\nArquivo com ' + (buf.length / 1048576).toFixed(1) + 'MB. Acima de uns 2MB o catbox engasga. ' +
    'Rode otimizar.js na pasta para gerar versões leves.'
  );
}

// imgbb.com, host padrão desde a troca do catbox. Precisa de conta gratuita e chave
// em IMGBB_API_KEY. Sobe em base64 porque o endpoint aceita tanto arquivo quanto texto,
// e base64 poupa a montagem de multipart.
async function subirParaImgbb(arquivo, tentativas) {
  const chave = process.env.IMGBB_API_KEY;
  if (!chave) throw new Error('Falta IMGBB_API_KEY no .env. Crie uma chave grátis em https://api.imgbb.com/.');

  const total = tentativas || 3;
  const b64 = fs.readFileSync(arquivo).toString('base64');
  let ultimo = '';

  for (let n = 1; n <= total; n++) {
    try {
      const form = new FormData();
      form.append('image', b64);
      const resposta = await fetch('https://api.imgbb.com/1/upload?key=' + encodeURIComponent(chave), {
        method: 'POST',
        body: form,
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (resposta.ok && corpo.success && corpo.data && corpo.data.url) return corpo.data.url;
      ultimo = 'HTTP ' + resposta.status + ' ' + JSON.stringify(corpo.error || corpo).slice(0, 160);
    } catch (erro) {
      ultimo = String(erro.message || erro);
    }
    if (n < total) await new Promise((r) => setTimeout(r, n * 4000));
  }

  throw new Error('imgbb recusou ' + path.basename(arquivo) + ' em ' + total + ' tentativas: ' + ultimo);
}

// Cloudflare R2, segundo host, redundância ao imgbb (decidida em 16/09/2026). Sobe pelo
// Worker anticustos-imagens (bucket privado por trás, exposto só via GET/PUT do Worker),
// criado por deploy-worker-imagens.js. Não fala com a API do R2 direto: o Worker evita
// ter que assinar requisição S3 aqui do lado do script.
async function subirParaR2(arquivo, tentativas) {
  const url = process.env.INSTAGRAM_IMG_WORKER_URL;
  const segredo = process.env.INSTAGRAM_IMG_UPLOAD_SECRET;
  if (!url || !segredo) {
    throw new Error(
      'Falta INSTAGRAM_IMG_WORKER_URL/INSTAGRAM_IMG_UPLOAD_SECRET no .env. ' +
      'Rode deploy-worker-imagens.js primeiro.'
    );
  }

  const total = tentativas || 3;
  const buf = fs.readFileSync(arquivo);
  const nomeLimpo = path.basename(arquivo).toLowerCase().replace(/[^a-z0-9.]/g, '-');
  const chave = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '-' + nomeLimpo;
  const tipo = path.extname(arquivo).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  let ultimo = '';

  for (let n = 1; n <= total; n++) {
    try {
      const resposta = await fetch(url + '/' + chave, {
        method: 'PUT',
        headers: { 'x-upload-secret': segredo, 'content-type': tipo },
        body: buf,
      });
      if (resposta.ok) return url + '/' + chave;
      ultimo = 'HTTP ' + resposta.status + ' ' + (await resposta.text()).slice(0, 120);
    } catch (erro) {
      ultimo = String(erro.message || erro);
    }
    if (n < total) await new Promise((r) => setTimeout(r, n * 3000));
  }

  throw new Error('R2 recusou ' + path.basename(arquivo) + ' em ' + total + ' tentativas: ' + ultimo);
}

// Host ativo de publicação, na ordem de preferência: R2 primeiro, imgbb como reserva.
//
// O R2 ficou na frente em 16/09/2026 depois que o imgbb saiu do ar no meio de uma
// publicação agendada (i.ibb.co recusando conexão, a Meta sem conseguir baixar). Host
// gratuito de terceiro cai e bloqueia sem aviso, foi o que aconteceu com o catbox um
// dia antes; o R2 é infraestrutura nossa, na borda da Cloudflare. O consumo não é
// argumento contra: um carrossel de 9 slides ocupa ~1,8MB e some em 30 dias pela regra
// de ciclo de vida, contra um teto de 10GB.
function backendsDeImagem() {
  const lista = [];
  if (process.env.INSTAGRAM_IMG_WORKER_URL) lista.push({ nome: 'r2', enviar: subirParaR2 });
  if (process.env.IMGBB_API_KEY) lista.push({ nome: 'imgbb', enviar: subirParaImgbb });
  return lista;
}

// Sobe a mesma imagem em dois hosts e devolve as duas URLs. A reserva viaja junto até
// a hora da publicação porque a falha que derrubou a operação em 15/09/2026 não foi no
// upload: o catbox aceitou a imagem, devolveu link que abria normal, e só a Meta é que
// não conseguia buscar. Cair de host só na hora do upload não cobre esse caso. Com as
// duas URLs na fila, o Worker tenta a segunda quando a Meta recusa a primeira.
async function subirImagemComReserva(arquivo) {
  const backends = backendsDeImagem();
  if (!backends.length) {
    throw new Error(
      'Nenhum host de imagem configurado. Falta IMGBB_API_KEY no .env ' +
      '(crie uma chave grátis em https://api.imgbb.com/).'
    );
  }

  // O principal insiste (precisa dar certo); a reserva tenta uma vez só, porque host
  // fora do ar não pode fazer o agendamento inteiro rastejar. Sem reserva o post ainda
  // sai, só sem rede de proteção.
  const urls = [];
  let ultimoErro;
  for (const backend of backends) {
    try {
      urls.push(await backend.enviar(arquivo, urls.length === 0 ? 3 : 1));
    } catch (erro) {
      ultimoErro = erro;
      console.log('  ' + backend.nome + ' falhou: ' + (erro.message || erro));
    }
  }

  if (!urls.length) {
    throw new Error(
      'Todos os hosts de imagem falharam para ' + path.basename(arquivo) + '. Último erro: ' +
      (ultimoErro && ultimoErro.message)
    );
  }
  return { url: urls[0], reserva: urls[1] || null };
}

// Quanto o bucket do R2 ocupa hoje. Serve para a checagem de teto do plano grátis.
async function usoDoR2() {
  const url = process.env.INSTAGRAM_IMG_WORKER_URL;
  const segredo = process.env.INSTAGRAM_IMG_UPLOAD_SECRET;
  if (!url || !segredo) return null;
  const resposta = await fetch(url + '/_uso', { headers: { 'x-upload-secret': segredo } });
  if (!resposta.ok) throw new Error('Não consegui ler o uso do R2: HTTP ' + resposta.status);
  return resposta.json();
}

// Sobe a imagem pelo primeiro host disponível e cai para o próximo em caso de erro.
// Existe porque o catbox parou de funcionar com a Meta sem aviso: nenhum host de
// terceiro é garantia permanente, então o pipeline não pode depender de um só.
async function subirImagem(arquivo) {
  const backends = backendsDeImagem();
  if (!backends.length) {
    throw new Error(
      'Nenhum host de imagem configurado. Falta IMGBB_API_KEY no .env ' +
      '(crie uma chave grátis em https://api.imgbb.com/).'
    );
  }
  let ultimoErro;
  for (const backend of backends) {
    try {
      return await backend.enviar(arquivo);
    } catch (erro) {
      ultimoErro = erro;
      console.log('  ' + backend.nome + ' falhou, tentando próximo host: ' + (erro.message || erro));
    }
  }
  throw new Error(
    'Todos os hosts de imagem falharam para ' + path.basename(arquivo) + '. Último erro: ' +
    (ultimoErro && ultimoErro.message)
  );
}

// ----- Graph API -----

async function chamarGraph(url, opcoes) {
  const resposta = await fetch(url, opcoes || {});
  const corpo = await resposta.json().catch(function () { return {}; });
  if (corpo.error) throw new Error(corpo.error.message || JSON.stringify(corpo.error));
  if (!resposta.ok) throw new Error('Instagram respondeu ' + resposta.status);
  return corpo;
}

async function quemSou(token) {
  return chamarGraph(GRAPH + '/me?fields=id,username,account_type&access_token=' + encodeURIComponent(token));
}

// O token IGA de longa duração dura 60 dias e só pode ser renovado depois de 24h de vida.
async function renovarToken(token) {
  return chamarGraph(
    'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(token)
  );
}

function diasAte(iso) {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

module.exports = {
  RAIZ,
  CAMINHO_ENV,
  GRAPH,
  LIMITE_LEGENDA,
  MAX_IMAGENS,
  MIN_CARROSSEL,
  lerEnv,
  carregarEnv,
  salvarEnv,
  exigir,
  dimensoes,
  validarLegenda,
  validarImagens,
  subirParaCatbox,
  subirParaImgbb,
  subirParaR2,
  subirImagem,
  subirImagemComReserva,
  usoDoR2,
  chamarGraph,
  quemSou,
  renovarToken,
  diasAte,
};
