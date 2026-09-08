// Funções compartilhadas das rotinas de LinkedIn (auth, status, publish).
// Sem dependência externa: usa fetch nativo do Node 18+.
'use strict';

const fs = require('fs');
const path = require('path');

// scripts -> postar-linkedin -> skills -> .claude -> raiz do workspace
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const CAMINHO_ENV = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(RAIZ, '.env');

// Versão da REST API do LinkedIn (formato AAAAMM). Só é usada no caminho
// multi-imagem. Se a API reclamar da versão, subir aqui ou no .env.
const VERSAO_API = process.env.LINKEDIN_API_VERSION || '202606';

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

// A API /rest/posts exige escapar esses caracteres no commentary, senão devolve 422.
// O '#' fica de fora de propósito: escapado, ele deixa de virar hashtag.
function escaparCommentary(texto) {
  return texto.replace(/[()[\]{}<>@|~_*\\]/g, function (c) { return '\\' + c; });
}

function exigir(chave, dica) {
  const valor = process.env[chave];
  if (!valor) {
    throw new Error('Falta ' + chave + ' no .env. ' + (dica || ''));
  }
  return valor;
}

function cabecalhos(token, extras) {
  return Object.assign(
    {
      Authorization: 'Bearer ' + token,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    extras || {}
  );
}

async function chamar(url, opcoes) {
  const resposta = await fetch(url, opcoes || {});
  const texto = await resposta.text();
  let corpo = texto;
  if (texto) {
    try { corpo = JSON.parse(texto); } catch (_) { /* resposta não-JSON, mantém texto */ }
  }
  if (!resposta.ok) {
    const detalhe = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
    const erro = new Error('LinkedIn respondeu ' + resposta.status + ': ' + (detalhe || '(sem corpo)'));
    erro.status = resposta.status;
    erro.corpo = corpo;
    throw erro;
  }
  return { corpo, headers: resposta.headers };
}

// O endpoint de upload aceita PUT (é o que o exemplo oficial em cURL faz).
// Algumas contas respondem melhor a POST, então tem retry.
async function enviarBinario(uploadUrl, caminhoArquivo, token) {
  const dados = fs.readFileSync(caminhoArquivo);
  const base = {
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/octet-stream' },
    body: dados,
  };
  try {
    await chamar(uploadUrl, Object.assign({ method: 'PUT' }, base));
  } catch (erro) {
    if (erro.status && erro.status < 500 && erro.status !== 405) throw erro;
    await chamar(uploadUrl, Object.assign({ method: 'POST' }, base));
  }
}

const LIMITE_TEXTO = 3000;
const MAX_IMAGENS = 20;

function validarTexto(texto) {
  if (!texto) throw new Error('Texto vazio. Passe --texto <arquivo>.');
  if (/[–—]/.test(texto)) {
    const linha = texto.split(/\r?\n/).find(function (l) { return /[–—]/.test(l); });
    throw new Error('O texto tem travessão, e isso é regra dura da marca. Linha: "' + linha.trim() + '"');
  }
  if (texto.length > LIMITE_TEXTO) {
    throw new Error('Texto com ' + texto.length + ' caracteres. O limite do LinkedIn é ' + LIMITE_TEXTO + '.');
  }
}

// Caminho legado (assets + ugcPosts): é o documentado para o produto Share on LinkedIn.
async function subirImagemLegado(caminho, token, urn) {
  const registro = await chamar('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: cabecalhos(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: urn,
        serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
      },
    }),
  });
  const valor = registro.corpo.value;
  const mecanismo = valor.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
  await enviarBinario(mecanismo.uploadUrl, caminho, token);
  return valor.asset;
}

// Caminho novo (/rest/images): necessário para o post multi-imagem.
async function subirImagemRest(caminho, token, urn) {
  const inicio = await chamar('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: cabecalhos(token, { 'Content-Type': 'application/json', 'LinkedIn-Version': VERSAO_API }),
    body: JSON.stringify({ initializeUploadRequest: { owner: urn } }),
  });
  await enviarBinario(inicio.corpo.value.uploadUrl, caminho, token);
  return inicio.corpo.value.image;
}

async function quemSou(token) {
  const { corpo } = await chamar('https://api.linkedin.com/v2/userinfo', { headers: cabecalhos(token) });
  return corpo;
}

// Devolve expiração real e escopos do token. Precisa de client id e secret.
async function inspecionar(token, clientId, clientSecret) {
  const corpoForm = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    token: token,
  });
  const { corpo } = await chamar('https://www.linkedin.com/oauth/v2/introspectToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: corpoForm.toString(),
  });
  return corpo;
}

function diasAte(iso) {
  if (!iso) return null;
  const alvo = new Date(iso).getTime();
  if (Number.isNaN(alvo)) return null;
  return Math.floor((alvo - Date.now()) / 86400000);
}

module.exports = {
  RAIZ,
  CAMINHO_ENV,
  VERSAO_API,
  LIMITE_TEXTO,
  MAX_IMAGENS,
  validarTexto,
  subirImagemLegado,
  subirImagemRest,
  lerEnv,
  carregarEnv,
  salvarEnv,
  exigir,
  escaparCommentary,
  cabecalhos,
  chamar,
  enviarBinario,
  quemSou,
  inspecionar,
  diasAte,
};
