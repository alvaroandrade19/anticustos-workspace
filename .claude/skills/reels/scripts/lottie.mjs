#!/usr/bin/env node
/*
 * lottie.mjs: animações Lottie (feitas por animadores no After Effects) prontas pro motor.
 *
 * Por que existe: o herói desenhado em código e o ícone de linha nunca chegam no acabamento de uma
 * animação feita à mão. O LottieFiles tem centenas de milhares, e as públicas saem sob a Lottie
 * Simple License (uso comercial, crédito não obrigatório; registramos mesmo assim).
 *
 * O que ele resolve, além de baixar:
 *  - BUSCA POR POPULARIDADE: a busca padrão ordena por data e traz rascunho com 3 downloads.
 *  - COR DA MARCA: a maioria foi desenhada pra fundo branco (contorno preto some no nosso fundo
 *    escuro). O modo "marca" inverte a luz dos neutros (contorno preto vira claro, preenchimento branco
 *    vira escuro: sai um traço claro sobre o escuro, no nosso estilo) e gira todo matiz pro azul da
 *    marca mantendo luz e sombra.
 *  - FUNDO: remove a camada sólida de fundo que viria como um quadrado branco no meio do reel.
 *  - PRÉVIA: renderiza 8 quadros da animação JÁ RECOLORIDA sobre o fundo do tema, antes de entrar
 *    no plano. O que você aprova na prévia é o que sai no vídeo.
 *
 * Uso:
 *   node lottie.mjs buscar "<consulta em inglês>" --out <pasta> [--n 12]
 *        → candidatos.jpg (numerada, miniaturas) + candidatos.json
 *   node lottie.mjs baixar <id> --out <arquivo.json> [--cores marca|neutro|original] [--manter-fundo]
 *        → JSON processado + <arquivo>.credito.json + <arquivo>.revisao.jpg
 *   node lottie.mjs preparar <arquivo .json|.lottie> --out <arquivo.json> [--cores ...] [--manter-fundo]
 *        → mesmo processamento pra um arquivo que você trouxe
 *   node lottie.mjs revisar <arquivo.json> [--fundo #05060A]
 * Como módulo: import {processar, analisar} from './lottie.mjs'
 */
import {readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, copyFileSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GQL = 'https://graphql.lottiefiles.com/2022-08';
const TEMA = {bg: '#05060A', ink: '#F2F4F8', accent: '#2563EB'}; // tokens de marca/design-guide.md

// ---------------------------------------------------------------------------
// cor: Lottie guarda cor como [r,g,b(,a)] em 0..1
// ---------------------------------------------------------------------------
const hex2rgb = (h) => { const n = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255); };
const rgb2hsl = ([r, g, b]) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
};
const hsl2rgb = ([h, s, l]) => {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
};
const [ACC_H, ACC_S] = rgb2hsl(hex2rgb(TEMA.accent));

// a regra de cor de cada modo. Neutro = saturação baixa (cinza, preto, branco).
const mapaDeCor = (modo) => (rgb) => {
  if (modo === 'original') return rgb;
  const [h, s, l] = rgb2hsl(rgb);
  const neutro = s < 0.14 || l < 0.06 || l > 0.97;
  if (neutro) {
    if (modo === 'neutro') return rgb;
    // marca (fundo escuro): luz invertida, dentro da faixa fundo..texto do tema
    const li = 1 - l;
    const alvo = 0.04 + li * (0.955 - 0.04);
    return hsl2rgb([ACC_H, Math.min(s, 0.08), alvo]); // neutro frio, levemente puxado pro azul
  }
  // cor: matiz do acento, saturação nunca abaixo da do acento×0,7, luz preservada (sombra e brilho ficam)
  let ll = l;
  if (modo === 'marca') ll = Math.min(0.78, Math.max(0.38, l)); // no escuro, azul escuro demais some
  return hsl2rgb([ACC_H, Math.max(s, ACC_S * 0.7), ll]);
};

// percorre o JSON inteiro trocando toda cor que o lottie-web desenha
const recolorir = (anim, modo) => {
  if (modo === 'original') return 0;
  const m = mapaDeCor(modo);
  let n = 0;
  const cor = (arr) => { const [r, g, b] = m(arr.slice(0, 3)); n++; return arr.length > 3 ? [r, g, b, ...arr.slice(3)] : [r, g, b]; };
  const corAnimada = (prop) => {
    if (!prop || prop.k === undefined) return;
    if (Array.isArray(prop.k) && typeof prop.k[0] === 'number') prop.k = cor(prop.k);
    else if (Array.isArray(prop.k)) for (const kf of prop.k) { if (kf.s) kf.s = cor(kf.s); if (kf.e) kf.e = cor(kf.e); }
  };
  // gradiente: [pos,r,g,b, pos,r,g,b, ... (depois vem opacidade, que não se mexe)]
  const grad = (g) => {
    if (!g?.k) return;
    const nCores = g.p;
    const troca = (a) => { for (let i = 0; i < nCores; i++) { const [r, gg, b] = m(a.slice(i * 4 + 1, i * 4 + 4)); a[i * 4 + 1] = r; a[i * 4 + 2] = gg; a[i * 4 + 3] = b; n++; } return a; };
    if (Array.isArray(g.k.k) && typeof g.k.k[0] === 'number') g.k.k = troca(g.k.k);
    else if (Array.isArray(g.k.k)) for (const kf of g.k.k) { if (kf.s) kf.s = troca(kf.s); if (kf.e) kf.e = troca(kf.e); }
  };
  const visitar = (o) => {
    if (Array.isArray(o)) return o.forEach(visitar);
    if (!o || typeof o !== 'object') return;
    if ((o.ty === 'fl' || o.ty === 'st') && o.c) corAnimada(o.c);
    if ((o.ty === 'gf' || o.ty === 'gs') && o.g) grad(o.g);
    if (o.ty === 1 && typeof o.sc === 'string') { const [r, g, b] = m(hex2rgb(o.sc)); o.sc = '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); n++; }
    if (o.t?.d?.k) for (const k of o.t.d.k) if (k.s?.fc) k.s.fc = cor(k.s.fc); // camada de texto
    for (const v of Object.values(o)) if (v && typeof v === 'object') visitar(v);
  };
  visitar(anim.layers);
  visitar(anim.assets);
  return n;
};

// tira a camada de fundo: sólido do tamanho do quadro, ou forma chamada bg/background/fundo cobrindo tudo
const removerFundo = (anim) => {
  const removidas = [];
  const cobre = (w, h) => w >= anim.w * 0.9 && h >= anim.h * 0.9;
  const ehFundo = (L) => {
    if (L.ty === 1 && cobre(L.sw, L.sh)) return true;
    if (L.ty === 4 && /\b(bg|background|fundo|back ?ground)\b/i.test(L.nm || '')) return true;
    if (L.ty === 4) {
      const rc = JSON.stringify(L.shapes || []).match(/"ty":"rc"[^}]*?"s":\{"a":0,"k":\[([\d.]+),([\d.]+)\]/);
      if (rc && cobre(+rc[1], +rc[2]) && (L.shapes || []).length <= 2) return true;
    }
    return false;
  };
  const limpar = (layers) => layers.filter((L) => { if (ehFundo(L)) { removidas.push(L.nm || `camada ${L.ind}`); return false; } return true; });
  anim.layers = limpar(anim.layers || []);
  return removidas;
};

export const analisar = (anim, bytes) => {
  const fr = anim.fr || 30;
  const quadros = (anim.op ?? 0) - (anim.ip ?? 0);
  const imagens = (anim.assets || []).filter((a) => a.p && !a.layers).length;
  const expressoes = (JSON.stringify(anim.layers).match(/"x":"/g) || []).length;
  const avisos = [];
  if (imagens) avisos.push(`${imagens} imagem(ns) raster dentro (não recolorem, e pesam no render)`);
  if (expressoes) avisos.push(`${expressoes} expressão(ões) do After Effects (o lottie-web pode ignorar ou ficar lento)`);
  if (bytes > 900 * 1024) avisos.push(`arquivo de ${(bytes / 1024).toFixed(0)}KB; acima de ~900KB o render fica lento nessa cena`);
  if (quadros / fr < 1) avisos.push(`dura ${(quadros / fr).toFixed(2)}s; em cena longa ela vai repetir muitas vezes`);
  return {fr, ip: anim.ip ?? 0, op: anim.op ?? 0, w: anim.w, h: anim.h, duracao: +(quadros / fr).toFixed(2), camadas: (anim.layers || []).length, avisos};
};

export const processar = (anim, {cores = 'marca', manterFundo = false} = {}) => {
  const fundo = manterFundo ? [] : removerFundo(anim);
  const trocas = recolorir(anim, cores);
  return {fundo, trocas};
};

// .lottie (dotLottie) é um zip com animations/<id>.json dentro; o tar do Windows 10+ abre zip
const lerAnimacao = (arq) => {
  if (!arq.toLowerCase().endsWith('.lottie')) return JSON.parse(readFileSync(arq, 'utf8'));
  const tmp = path.join(tmpdir(), `lottie-${Date.now()}`);
  mkdirSync(tmp, {recursive: true});
  execFileSync('tar', ['-xf', arq, '-C', tmp]);
  const dir = path.join(tmp, 'animations');
  const j = existsSync(dir) ? readdirSync(dir).find((n) => n.endsWith('.json')) : null;
  if (!j) throw new Error('.lottie sem animations/*.json dentro');
  const anim = JSON.parse(readFileSync(path.join(dir, j), 'utf8'));
  rmSync(tmp, {recursive: true, force: true});
  return anim;
};

const gql = async (query) => {
  const r = await fetch(GQL, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({query})});
  if (!r.ok) throw new Error(`LottieFiles respondeu ${r.status}`);
  const d = await r.json();
  if (d.errors) throw new Error(d.errors.map((e) => e.message).join('; '));
  return d.data;
};
const baixar = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`download ${r.status}: ${u}`); return Buffer.from(await r.arrayBuffer()); };
const ffmpeg = (a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
// o filtro de texto do ffmpeg quebra com espaço no caminho ("Projeto Anticustos"): usa uma cópia da fonte no temp
const fonteRot = 'reels-anton.ttf'; // nome só: o ffmpeg com texto roda com cwd no temp (sem "C:" pra confundir o filtro)
const TMP = tmpdir();
if (!existsSync(path.join(TMP, fonteRot))) copyFileSync(path.resolve(__dirname, '..', 'assets', 'fonts', 'Anton-Regular.ttf'), path.join(TMP, fonteRot));
const ffmpegTxt = (a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], {cwd: TMP});

// ---------------------------------------------------------------------------
// prévia: 8 quadros da animação processada sobre o fundo do tema (Playwright + lottie-web do CDN)
// ---------------------------------------------------------------------------
export const revisar = async (arq, {fundo = TEMA.bg} = {}) => {
  const {chromium} = await import('playwright');
  const anim = JSON.parse(readFileSync(arq, 'utf8'));
  const info = analisar(anim, readFileSync(arq).length);
  const edge = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => existsSync(p));
  let browser;
  try { browser = await chromium.launch(); } catch { browser = await chromium.launch({executablePath: edge}); }
  // viewport na proporção do arquivo: assim a caixa medida já sai em fração do quadro da animação
  const VW = 360, VH = Math.max(120, Math.min(640, Math.round(360 * (info.h / info.w))));
  const page = await browser.newPage({viewport: {width: VW, height: VH}});
  await page.setContent(`<html><body style="margin:0;background:${fundo}"><div id="a" style="width:${VW}px;height:${VH}px"></div></body></html>`);
  await page.addScriptTag({url: 'https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie.min.js'});
  await page.evaluate((data) => new Promise((ok) => {
    window.__a = window.lottie.loadAnimation({container: document.getElementById('a'), renderer: 'svg', loop: false, autoplay: false, animationData: data});
    window.__a.addEventListener('DOMLoaded', ok);
  }), anim);
  const tmp = path.join(tmpdir(), `lrev-${Date.now()}`);
  mkdirSync(tmp, {recursive: true});
  const total = info.op - info.ip;
  for (let k = 0; k < 8; k++) {
    const q = Math.round((total - 1) * (k / 7));
    await page.evaluate((f) => window.__a.goToAndStop(f, true), q);
    const png = path.join(tmp, `f${k}.png`);
    await page.screenshot({path: png});
    const t = (q / info.fr).toFixed(2);
    ffmpegTxt(['-i', path.resolve(png), '-vf', `drawtext=fontfile=${fonteRot}:text='${t}s':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6`, path.resolve(tmp, `r${k}.png`)]);
  }
  // Quadro vazio no começo ou no fim (animação que "entra do nada" ou "some") deixa buraco na cena.
  // Amostra 24 pontos: mede se há desenho (máximo contra fundo), sugere o trecho útil e mede a caixa
  // que o desenho ocupa (a margem que cada animador deixa varia muito e encolhia o herói).
  const N = 24;
  const cheio = [];
  const caixas = [];
  for (let k = 0; k < N; k++) {
    const q = Math.round((total - 1) * (k / (N - 1)));
    await page.evaluate((f) => window.__a.goToAndStop(f, true), q);
    const png = path.join(tmp, `v${k}.png`);
    await page.screenshot({path: png});
    const st = spawnSync('ffmpeg', ['-hide_banner', '-i', png, '-vf', 'signalstats,metadata=print', '-f', 'null', '-'], {encoding: 'utf8'}).stderr || '';
    const ymax = parseFloat((st.match(/YMAX=([\d.]+)/) || [])[1] ?? '0');
    const ymin = parseFloat((st.match(/YMIN=([\d.]+)/) || [])[1] ?? '0');
    const ok = ymax - ymin > 12; // vazio = só fundo (máximo igual ao mínimo, medido)
    cheio.push({t: q / info.fr, ok});
    if (ok) {
      // caixa do desenho neste quadro (o que não é fundo); a união de todas vira o enquadramento
      const cd = spawnSync('ffmpeg', ['-hide_banner', '-i', png, '-vf', `cropdetect=limit=${((ymin + 10) / 255).toFixed(3)}:round=2:reset=1:skip=0`, '-f', 'null', '-'] /* skip=0: sem isso o ffmpeg 9 pula a única foto */, {encoding: 'utf8'}).stderr || '';
      const m = [...cd.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].pop();
      if (m) caixas.push({w: +m[1], h: +m[2], x: +m[3], y: +m[4]});
    }
  }
  if (caixas.length) {
    // mediana, não união: a união pega o objeto entrando pela borda (a pilha de dinheiro caindo do topo
    // dava 100% de altura). A mediana é a pose em que o desenho passa a maior parte do tempo.
    const med = (v) => { const o = [...v].sort((p, q) => p - q); return o[Math.floor(o.length / 2)]; };
    const x0 = med(caixas.map((c) => c.x)), y0 = med(caixas.map((c) => c.y));
    const x1 = med(caixas.map((c) => c.x + c.w)), y1 = med(caixas.map((c) => c.y + c.h));
    info.bbox = [x0 / VW, y0 / VH, (x1 - x0) / VW, (y1 - y0) / VH].map((v) => +Math.min(1, Math.max(0, v)).toFixed(4));
  }
  await browser.close();
  const iniVazio = !cheio[0].ok;
  const fimVazio = !cheio[N - 1].ok;
  if (iniVazio || fimVazio) {
    const ok = cheio.filter((c) => c.ok);
    if (!ok.length) info.avisos.push('a animação parece vazia sobre o fundo escuro (cor muito escura?); tente --cores neutro ou original');
    else {
      const ini = iniVazio ? ok[0].t : 0;
      const fim = fimVazio ? ok[ok.length - 1].t : info.duracao;
      info.trecho = [+ini.toFixed(2), +fim.toFixed(2)];
      info.avisos.push(`${iniVazio ? 'começa' : ''}${iniVazio && fimVazio ? ' e ' : ''}${fimVazio ? 'termina' : ''} vazia: use "loop": false${fimVazio ? ` e "trecho": [${info.trecho.join(', ')}]` : ''} (segura o último quadro, sem buraco na cena)`);
    }
  }
  if (info.bbox) {
    anim._reels = {...(anim._reels || {}), bbox: info.bbox}; // o motor enquadra pelo desenho, não pela margem do animador
    writeFileSync(arq, JSON.stringify(anim));
  }
  const out = arq.replace(/\.json$/i, '.revisao.jpg');
  ffmpeg(['-framerate', '1', '-i', path.join(tmp, 'r%d.png'), '-vf', 'tile=8x1:padding=4:color=0x333333', '-frames:v', '1', '-q:v', '3', out]);
  rmSync(tmp, {recursive: true, force: true});
  return {out, info};
};

const imprimirInfo = (info) => {
  console.log(`  ${info.duracao}s · ${info.fr} qps · ${info.w}x${info.h} · ${info.camadas} camadas${info.bbox ? ` · desenho ocupa ${Math.round(info.bbox[2] * 100)}% x ${Math.round(info.bbox[3] * 100)}% do quadro` : ''}`);
  for (const a of info.avisos) console.log(`  AVISO: ${a}`);
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const souCLI = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (souCLI) {
  const args = process.argv.slice(2);
  const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const [cmd, alvo] = args;
  const opc = {cores: get('--cores', 'marca'), manterFundo: args.includes('--manter-fundo')};
  if (!['marca', 'neutro', 'original'].includes(opc.cores)) { console.error('--cores: marca, neutro ou original'); process.exit(2); }
  const finalizar = async (anim, out, credito) => {
    const {fundo, trocas} = processar(anim, opc);
    mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
    writeFileSync(out, JSON.stringify(anim));
    if (credito) writeFileSync(out.replace(/\.json$/i, '.credito.json'), JSON.stringify(credito, null, 2));
    console.log(`[lottie] ${out}: ${trocas} cor(es) trocada(s) (modo ${opc.cores})${fundo.length ? `, fundo removido: ${fundo.join(', ')}` : ''}`);
    const {out: rev, info} = await revisar(out);
    imprimirInfo(info);
    console.log(`  prévia: ${rev}`);
    console.log(`OUT=${out}`);
  };
  try {
    if (cmd === 'buscar') {
      const outDir = get('--out', '.');
      const n = Math.min(24, parseInt(get('--n', '12'), 10));
      // popularidade separa animador de rascunho, mas puxa item popular fora do tema ("scroll down icon"
      // aparecia em toda busca). Busca 3x mais e só fica o que tem uma palavra de CONTEÚDO da consulta no
      // nome ou no endereço (palavra de estilo como line/icon/outline não conta).
      const ESTILO = new Set(['line', 'lines', 'icon', 'icons', 'outline', 'animation', 'animated', 'flat', '3d', 'simple', 'minimal', 'lottie', 'loop']);
      const conteudo = alvo.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !ESTILO.has(w));
      const d = await gql(`{ searchPublicAnimations(query: ${JSON.stringify(alvo)}, first: ${Math.min(60, n * 3)}, orderBy: "popular") { edges { node { id name downloads bgColor frameRate url imageUrl jsonUrl lottieUrl createdBy { firstName lastName } } } } }`);
      const todos = d.searchPublicAnimations.edges.map((e) => e.node);
      const relevantes = conteudo.length ? todos.filter((c) => conteudo.some((w) => `${c.name} ${c.url}`.toLowerCase().includes(w))) : todos;
      const cands = relevantes.slice(0, n);
      if (relevantes.length < todos.length) console.log(`[lottie] ${todos.length - relevantes.length} resultado(s) populares fora do tema descartados`);
      if (!cands.length) { console.log('[lottie] nada encontrado; tente outra consulta em inglês.'); process.exit(0); }
      mkdirSync(outDir, {recursive: true});
      const tmp = path.join(outDir, '_thumbs');
      mkdirSync(tmp, {recursive: true});
      for (let k = 0; k < cands.length; k++) {
        const src = path.join(tmp, `s${k}.png`);
        const dst = path.join(tmp, `t${String(k).padStart(2, '0')}.jpg`);
        try {
          writeFileSync(src, await baixar(cands[k].imageUrl));
          ffmpegTxt(['-i', path.resolve(src), '-vf', `scale=240:240:force_original_aspect_ratio=decrease,pad=240:240:(ow-iw)/2:(oh-ih)/2:color=white,drawtext=fontfile=${fonteRot}:text='${k + 1}':x=8:y=6:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.7`, path.resolve(dst)]);
        } catch { ffmpeg(['-f', 'lavfi', '-i', 'color=c=gray:s=240x240', '-frames:v', '1', dst]); }
      }
      const cols = Math.min(6, cands.length);
      ffmpeg(['-framerate', '1', '-i', path.join(tmp, 't%02d.jpg'), '-vf', `tile=${cols}x${Math.ceil(cands.length / cols)}:padding=4:color=0x333333`, '-frames:v', '1', path.join(outDir, 'candidatos.jpg')]);
      rmSync(tmp, {recursive: true, force: true});
      writeFileSync(path.join(outDir, 'candidatos.json'), JSON.stringify(cands, null, 2));
      cands.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2)}. id ${c.id} · ${c.name} · ${c.downloads} downloads · ${c.frameRate} qps · ${c.url}`));
      console.log('  (miniaturas no original, fundo branco; a cor da marca entra no baixar)');
      console.log(`OUT=${path.join(outDir, 'candidatos.jpg')}`);
    } else if (cmd === 'baixar') {
      const out = get('--out');
      if (!alvo || !out) throw new Error('uso: baixar <id> --out <arquivo.json>');
      const d = await gql(`{ publicAnimation(id: ${parseInt(alvo, 10)}) { id name url jsonUrl lottieUrl downloads createdBy { firstName lastName username } } }`);
      const a = d.publicAnimation;
      if (!a) throw new Error(`animação ${alvo} não encontrada`);
      let anim;
      if (a.jsonUrl) anim = JSON.parse((await baixar(a.jsonUrl)).toString('utf8'));
      else {
        const t = path.join(tmpdir(), `dl-${Date.now()}.lottie`);
        writeFileSync(t, await baixar(a.lottieUrl));
        anim = lerAnimacao(t);
        rmSync(t, {force: true});
      }
      const autor = [a.createdBy?.firstName, a.createdBy?.lastName].filter(Boolean).join(' ') || 'autor do LottieFiles';
      await finalizar(anim, out, {fonte: 'LottieFiles', id: a.id, nome: a.name, autor, pagina: a.url, licenca: 'Lottie Simple License (uso comercial, crédito não obrigatório)', credito_legenda: `Animação: ${autor} (LottieFiles)`, cores: opc.cores});
    } else if (cmd === 'preparar') {
      const out = get('--out');
      if (!alvo || !out) throw new Error('uso: preparar <arquivo.json|.lottie> --out <arquivo.json>');
      await finalizar(lerAnimacao(alvo), out, null);
    } else if (cmd === 'revisar') {
      const {out, info} = await revisar(alvo, {fundo: get('--fundo', TEMA.bg)});
      imprimirInfo(info);
      console.log(`OUT=${out}`);
    } else {
      console.error('uso: node lottie.mjs buscar "<consulta>" --out <pasta> | baixar <id> --out <json> | preparar <arquivo> --out <json> | revisar <json>');
      process.exit(2);
    }
  } catch (e) {
    console.error(`[lottie] falhou: ${e.message}`);
    process.exit(1);
  }
}
