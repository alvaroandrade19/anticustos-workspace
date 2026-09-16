// Leitura e escrita do .env na raiz do workspace. Sem dependência externa.
'use strict';

const fs = require('fs');
const path = require('path');

// workers/quiz-leads -> workers -> raiz do workspace
const RAIZ = path.resolve(__dirname, '..', '..');
const CAMINHO_ENV = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(RAIZ, '.env');

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
  if (!valor) {
    throw new Error('Falta ' + chave + ' no .env. ' + (dica || ''));
  }
  return valor;
}

module.exports = { RAIZ, CAMINHO_ENV, lerEnv, carregarEnv, salvarEnv, exigir };
