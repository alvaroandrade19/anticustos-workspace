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
// O Instagram não aceita upload de bytes: só engole URL pública. O catbox é
// gratuito e sem conta. O arquivo fica publicamente acessível por esse link.

// O catbox devolve 504 com alguma frequência em arquivo grande, e a falha é passageira.
// Três tentativas com espera crescente resolvem quase sempre.
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
  chamarGraph,
  quemSou,
  renovarToken,
  diasAte,
};
