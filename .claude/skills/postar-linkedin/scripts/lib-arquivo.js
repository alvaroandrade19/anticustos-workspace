// Move a pasta de uma peça pelos estados de publicação e registra o que aconteceu.
//
//   conteudo/carrosseis/<slug>      em produção, ainda não saiu
//   conteudo/agendado/<rede>/<slug> na fila, esperando a hora
//   conteudo/publicado/<rede>/<slug>  no ar
//
// A pasta é movida de verdade, para que conteudo/carrosseis/ tenha só o que ainda não
// foi publicado. Cada pasta movida ganha um _estado.md com o histórico, então dá pra
// saber de onde veio e para onde foi sem depender do git.
//
// Este arquivo é duplicado nas skills postar-linkedin e publicar-social-ratos de
// propósito: as duas são unidades distribuíveis independentes.
'use strict';

const fs = require('fs');
const path = require('path');

// scripts -> <skill> -> skills -> .claude -> raiz do workspace
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const AGENDADO = path.join(RAIZ, 'conteudo', 'agendado');
const PUBLICADO = path.join(RAIZ, 'conteudo', 'publicado');

// Subpastas geradas (web/ do otimizar.js) não são a peça: a peça é a pasta acima.
const SUBPASTAS_GERADAS = ['web'];

// Para onde a peça volta se o agendamento for cancelado e não houver origem registrada.
const AREA_DE_PRODUCAO = {
  instagram: path.join('conteudo', 'carrosseis'),
  linkedin: path.join('conteudo', 'linkedin'),
};

function pastaDaPeca(caminho) {
  let p = path.resolve(caminho);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) p = path.dirname(p);
  while (SUBPASTAS_GERADAS.includes(path.basename(p))) p = path.dirname(p);
  return p;
}

function relativo(p) {
  return path.relative(RAIZ, p).split(path.sep).join('/');
}

// rename falha entre volumes diferentes; nesse caso copia e apaga.
function mover(origem, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  try {
    fs.renameSync(origem, destino);
  } catch (erro) {
    if (erro.code !== 'EXDEV') throw erro;
    fs.cpSync(origem, destino, { recursive: true });
    fs.rmSync(origem, { recursive: true, force: true });
  }
  return destino;
}

function destinoLivre(base, slug) {
  let destino = path.join(base, slug);
  let n = 2;
  while (fs.existsSync(destino)) destino = path.join(base, slug + '-' + n++);
  return destino;
}

function lerEstado(pasta) {
  const arquivo = path.join(pasta, '_estado.md');
  if (!fs.existsSync(arquivo)) return null;
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const bloco = bruto.match(/```json\n([\s\S]*?)\n```/);
  if (!bloco) return null;
  try {
    return JSON.parse(bloco[1]);
  } catch (_) {
    return null;
  }
}

function formatar(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// O _estado.md é legível por humano e por script: a prosa em cima, o JSON embaixo.
function gravarEstado(pasta, dados) {
  const linhas = [
    '# Estado da publicação',
    '',
    '- **Rede:** ' + dados.rede,
    '- **Peça:** ' + dados.slug,
    '- **Estado:** ' + dados.estado,
  ];
  if (dados.origem) linhas.push('- **Veio de:** `' + dados.origem + '`');
  if (dados.quando) linhas.push('- **Agendado para:** ' + formatar(dados.quando));
  if (dados.agendadoEm) linhas.push('- **Entrou na fila em:** ' + formatar(dados.agendadoEm));
  if (dados.publicadoEm) linhas.push('- **Publicado em:** ' + formatar(dados.publicadoEm));
  if (dados.url) linhas.push('- **Link:** ' + dados.url);
  if (dados.idFila) linhas.push('- **Id na fila:** `' + dados.idFila + '`');
  if (dados.erro) linhas.push('- **Erro:** ' + dados.erro);

  linhas.push('', '<!-- não editar à mão: escrito pelas skills de publicação -->', '', '```json');
  linhas.push(JSON.stringify(dados, null, 2));
  linhas.push('```', '');

  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, '_estado.md'), linhas.join('\n'), 'utf8');
}

// --- transições ---

function paraAgendado(caminhoConteudo, rede, dados) {
  const peca = pastaDaPeca(caminhoConteudo);
  const slug = path.basename(peca);
  const destino = destinoLivre(path.join(AGENDADO, rede), slug);
  const anterior = lerEstado(peca) || {};
  mover(peca, destino);
  gravarEstado(destino, Object.assign({}, anterior, dados, {
    rede: rede,
    slug: slug,
    estado: 'agendado',
    origem: anterior.origem || relativo(peca),
    agendadoEm: new Date().toISOString(),
  }));
  return destino;
}

function paraPublicado(caminhoConteudo, rede, dados) {
  const peca = pastaDaPeca(caminhoConteudo);
  const slug = path.basename(peca);
  const destino = destinoLivre(path.join(PUBLICADO, rede), slug);
  const anterior = lerEstado(peca) || {};
  mover(peca, destino);
  gravarEstado(destino, Object.assign({}, anterior, dados, {
    rede: rede,
    slug: slug,
    estado: 'publicado',
    origem: anterior.origem || relativo(peca),
  }));
  return destino;
}

// Cancelar agendamento devolve a peça para onde ela estava antes.
function devolverDaFila(rede, slug) {
  const atual = path.join(AGENDADO, rede, slug);
  if (!fs.existsSync(atual)) return null;
  const estado = lerEstado(atual) || {};
  const padrao = AREA_DE_PRODUCAO[rede] || path.join('conteudo', rede);
  const destino = estado.origem ? path.join(RAIZ, estado.origem) : path.join(RAIZ, padrao, slug);
  if (fs.existsSync(destino)) {
    throw new Error('Já existe ' + relativo(destino) + '. Mova ou renomeie antes de cancelar.');
  }
  mover(atual, destino);
  const arquivo = path.join(destino, '_estado.md');
  if (fs.existsSync(arquivo)) fs.rmSync(arquivo);
  return destino;
}

// Acha a pasta de uma peça agendada pelo slug, para mover quando o post sair.
function acharAgendado(rede, slug) {
  const direto = path.join(AGENDADO, rede, slug);
  if (fs.existsSync(direto)) return direto;
  const base = path.join(AGENDADO, rede);
  if (!fs.existsSync(base)) return null;
  const parecido = fs.readdirSync(base).find((n) => n === slug || n.startsWith(slug + '-'));
  return parecido ? path.join(base, parecido) : null;
}

module.exports = {
  RAIZ,
  AGENDADO,
  PUBLICADO,
  pastaDaPeca,
  relativo,
  mover,
  lerEstado,
  gravarEstado,
  paraAgendado,
  paraPublicado,
  devolverDaFila,
  acharAgendado,
};
