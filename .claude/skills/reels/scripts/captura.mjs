#!/usr/bin/env node
/*
 * captura.mjs: fotografa uma página REAL (paper, notícia, site, painel) pro registro `prova`, e
 * devolve onde está cada trecho que a cena vai marcar, em fração da imagem. O marca-texto do motor
 * usa essas coordenadas, então ele cai em cima do texto de verdade, não num retângulo chutado.
 *
 * Prova é prova: só captura o que existe e diz o que a fala diz. Se o trecho não está na página,
 * o script falha em vez de inventar coordenada.
 *
 * Uso:
 *   node captura.mjs --url <url> --out <arquivo.png> [--bloco "frase"] [--seletor "css"]
 *                    [--marcar "frase 1" --marcar "frase 2" ...] [--largura 820] [--escala 2]
 *   --bloco "frase"  recorta o bloco (parágrafo) que contém a frase, com respiro
 *   --seletor "css"  recorta o elemento (ex.: "#abs" na página de resumo do arXiv)
 *   sem os dois      recorta a tela visível do topo
 *   --ocultar "css"  esconde elementos antes (barra lateral, banner de cookie); pode repetir
 *   --altura <px>    corta o recorte nessa altura (px de página), pra prova não virar parede de texto
 * Saída: o PNG + <arquivo>.json {imagem, iw, ih, url, marcas:[{frase,x,y,w,h}]} (uma marca por linha
 * de texto, quando a frase quebra linha).
 */
import {chromium} from 'playwright';
import {writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const todos = (k) => args.flatMap((a, i) => (a === k ? [args[i + 1]] : []));
const url = get('--url');
const out = get('--out');
if (!url || !out) { console.error('uso: node captura.mjs --url <url> --out <png> [--bloco "frase" | --seletor css] [--marcar "frase"]...'); process.exit(2); }
const largura = parseInt(get('--largura', '820'), 10);
const escala = parseFloat(get('--escala', '2'));
const bloco = get('--bloco');
const seletor = get('--seletor');
const marcar = todos('--marcar');
const ocultar = todos('--ocultar');
const alturaMax = get('--altura') ? parseInt(get('--altura'), 10) : null;

const edge = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => existsSync(p));
let browser;
try { browser = await chromium.launch(); } catch { browser = await chromium.launch({executablePath: edge}); }
const ctx = await browser.newContext({viewport: {width: largura, height: 1400}, deviceScaleFactor: escala, locale: 'en-US'});
const page = await ctx.newPage();
await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});

// Dentro da página: acha cada frase atravessando nós de texto (ignora caixa e espaço repetido)
// e devolve os retângulos de cada linha. Também acha o bloco da frase de recorte.
const res = await page.evaluate(({bloco, seletor, marcar, ocultar, alturaMax}) => {
  for (const css of ocultar) document.querySelectorAll(css).forEach((el) => { el.style.display = 'none'; });
  const normCh = (c) => (/\s/.test(c) ? ' ' : c.toLowerCase());
  const indexar = (raiz) => {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    let s = '';
    const mapa = [];
    let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue;
      for (let k = 0; k < t.length; k++) {
        const c = normCh(t[k]);
        if (c === ' ' && s.endsWith(' ')) continue;
        s += c;
        mapa.push([n, k]);
      }
    }
    return {s, mapa};
  };
  const acharRange = (raiz, frase) => {
    const {s, mapa} = indexar(raiz);
    const alvo = frase.toLowerCase().replace(/\s+/g, ' ').trim();
    const i = s.indexOf(alvo);
    if (i < 0) return null;
    const r = document.createRange();
    r.setStart(mapa[i][0], mapa[i][1]);
    const [nf, kf] = mapa[i + alvo.length - 1];
    r.setEnd(nf, kf + 1);
    return r;
  };
  let area;
  if (seletor) {
    const el = document.querySelector(seletor);
    if (!el) return {erro: `seletor ${seletor} não achou nada`};
    el.scrollIntoView({block: 'start'});
    window.scrollBy(0, -40); // respiro acima do elemento
    area = el.getBoundingClientRect();
  } else if (bloco) {
    const r = acharRange(document.body, bloco);
    if (!r) return {erro: `frase de bloco não está na página: "${bloco}"`};
    let el = r.startContainer.parentElement;
    while (el && !/^(P|LI|BLOCKQUOTE|DIV|SECTION|TD|FIGCAPTION)$/.test(el.tagName)) el = el.parentElement;
    el.scrollIntoView({block: 'center'});
    area = el.getBoundingClientRect();
  } else area = {x: 0, y: 0, width: window.innerWidth, height: Math.min(window.innerHeight, 1400)};
  const pad = seletor || bloco ? 22 : 0;
  const y0 = Math.max(0, area.y - pad);
  const clip = {x: Math.max(0, area.x - pad), y: y0, width: Math.min(window.innerWidth, area.width + pad * 2), height: Math.min(alturaMax ?? 1e9, area.height + pad * 2, window.innerHeight - y0)};
  const marcas = [];
  const faltando = [];
  for (const f of marcar) {
    const r = acharRange(document.body, f);
    if (!r) { faltando.push(f); continue; }
    for (const q of r.getClientRects()) {
      if (q.width < 2) continue;
      marcas.push({frase: f, x: (q.x - clip.x) / clip.width, y: (q.y - clip.y) / clip.height, w: q.width / clip.width, h: q.height / clip.height});
    }
  }
  return {clip, marcas, faltando};
}, {bloco, seletor, marcar, ocultar, alturaMax});

if (res.erro) { console.error(`[captura] ${res.erro}`); await browser.close(); process.exit(3); }
if (res.faltando.length) { console.error(`[captura] trecho(s) não encontrado(s) na página: ${res.faltando.join(' | ')}`); await browser.close(); process.exit(3); }
const fora = res.marcas.filter((m) => m.x < 0 || m.y < 0 || m.x + m.w > 1.001 || m.y + m.h > 1.001);
if (fora.length) console.log(`[captura] AVISO: ${fora.length} marca(s) fora do recorte; use --bloco com a frase marcada ou --seletor maior.`);
mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
await page.screenshot({path: out, clip: res.clip});
await browser.close();
const meta = {imagem: out.replace(/\\/g, '/'), iw: Math.round(res.clip.width * escala), ih: Math.round(res.clip.height * escala), url, marcas: res.marcas.map((m) => ({...m, x: +m.x.toFixed(4), y: +m.y.toFixed(4), w: +m.w.toFixed(4), h: +m.h.toFixed(4)}))};
writeFileSync(out.replace(/\.png$/i, '.json'), JSON.stringify(meta, null, 2));
console.log(`[captura] ${out} (${meta.iw}x${meta.ih}), ${meta.marcas.length} marca(s):`);
for (const m of meta.marcas) console.log(`  "${m.frase}" x=${m.x} y=${m.y} w=${m.w} h=${m.h}`);
console.log(`OUT=${out}`);
