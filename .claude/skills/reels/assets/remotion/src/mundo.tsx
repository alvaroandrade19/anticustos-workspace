/*
 * mundo.tsx: o mundo de pontos contínuo (registro "pontos"). Portado da skill de pontilhismo de
 * Fernando Araújo (BRABO, MIT; original em reference/pontilhismo/) e reescrito pra este motor.
 *
 * A ideia: UM conjunto de N partículas atravessa o reel inteiro e morfa de forma em forma. Nada
 * nasce do nada, uma ideia nasce dos pontos da anterior. As cenas com "visual": "mundo" mostram esse
 * mundo; nas outras ele continua andando fora de vista, então quando volta já está na forma nova.
 *
 * Por que é uma função pura do quadro ABSOLUTO: o render incremental guarda cada cena num trecho em
 * cache e renderiza quadros fora de ordem em abas paralelas. O mundo não guarda estado entre quadros;
 * o quadro 812 sai igual sozinho ou no meio do vídeo. É isso que deixa o mundo contínuo e o cache
 * por cena convivendo.
 *
 * O que mudou do original e por quê:
 *  - Canvas em vez de 5-6 mil <circle> em SVG. Os pontos são agrupados por opacidade e cor (20 níveis
 *    x 2 cores) e cada grupo vira UM fill: ~40 chamadas de desenho por quadro em vez de 6 mil nós que
 *    o React reconcilia e o Chrome rasteriza um a um.
 *  - Correspondência coerente: cada ponto tem um ângulo (th) e um raio (rho) fixos, e TODA forma
 *    distribui os seus pontos respeitando essa ordem (fatias por ângulo, raio dentro da fatia). O ponto
 *    que está à esquerda no "34" vai pra esquerda no "3": o morph flui em vez de cruzar em caos.
 *  - Trajetória curva (campo `curva`) e espalhamento por ponto: o morph é orgânico, não linear.
 *  - Cor da marca: pontos em `ink`, acento só onde a chave pede (acento raro, como no resto do reel).
 *  - Formas pensadas pro conteúdo da Anti Custos: glifo (número e palavra em pontos), grupos (contagem:
 *    34 ferramentas viram 3), rede, onda, túnel, além das do original.
 *
 * Unidades da spec (props.mundo, montada pelo plano.mjs): `f` em QUADROS absolutos; `dur` e `spread`
 * em SEGUNDOS. Coordenadas do mundo com origem no centro da cena, y pra baixo, ~1 unidade = 1px na
 * distância padrão da câmera.
 */
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, Easing, random, staticFile, useCurrentFrame} from 'remotion';
import {useTheme} from './theme';
import {FONT} from './text';

const FPS = 30;
const W = 1080;
const H = 1920;
const TAU = Math.PI * 2;
const FOCAL = 1400;
const DIST = 1500;
const E_IO = Easing.bezier(0.65, 0, 0.35, 1);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export type Chave = {
  f: number; // quadro absoluto em que o morph começa
  forma: string;
  dur?: number; // s
  spread?: number; // s, atraso máximo por ponto
  curva?: number; // 0..1, o quanto a trajetória arqueia
  explosao?: number; // 0..1, os pontos abrem pra fora no meio do morph
  densidade?: number; // fração dos N pontos que a forma usa; o resto vira poeira
  escala?: number; giro?: number; rotY?: number; inclinacao?: number; balanco?: number;
  x?: number; y?: number; z?: number;
  tamanho?: number; opacidade?: number;
  acento?: boolean | number; // true = a forma toda; 0..1 = salpico dessa fração
  [k: string]: unknown;
};
export type CameraKey = {f: number; pose?: string; dur?: number; yaw?: number; pitch?: number; dist?: number; x?: number; y?: number; orbita?: number};
export type MundoSpec = {
  n?: number;
  chaves: Chave[];
  cameras?: CameraKey[];
  brilho?: number; // 0..1, halo aditivo (só tema escuro)
  tamanho?: number; // multiplicador global do ponto
  centroY?: number; // fração da altura onde fica o centro do mundo (0,40 deixa a faixa da legenda livre)
  final?: 'mergulho';
  total?: number; // quadros do reel (pro final)
};

// ---------------------------------------------------------------------------
// sementes: fixas por ponto, as mesmas em todo quadro e em toda aba
// ---------------------------------------------------------------------------
type Sementes = {n: number; a: Float32Array; b: Float32Array; c: Float32Array; dl: Float32Array; th: Float32Array; rho: Float32Array; rank: Int32Array; porTh: Int32Array};
const SEM = new Map<number, Sementes>();
const sementes = (n: number): Sementes => {
  let s = SEM.get(n);
  if (s) return s;
  const a = new Float32Array(n), b = new Float32Array(n), c = new Float32Array(n), dl = new Float32Array(n), th = new Float32Array(n), rho = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = random('ma' + i); b[i] = random('mb' + i); c[i] = random('mc' + i); dl[i] = random('md' + i);
    th[i] = random('mt' + i) * TAU; rho[i] = random('mr' + i); r[i] = random('mk' + i);
  }
  const ordem = Array.from({length: n}, (_, i) => i).sort((x, y) => r[x] - r[y]);
  const rank = new Int32Array(n);
  ordem.forEach((i, k) => (rank[i] = k));
  const porTh = Int32Array.from(Array.from({length: n}, (_, i) => i).sort((x, y) => th[x] - th[y]));
  s = {n, a, b, c, dl, th, rho, rank, porTh};
  SEM.set(n, s);
  return s;
};

// ---------------------------------------------------------------------------
// buffers reaproveitados (zero alocação por quadro)
// ---------------------------------------------------------------------------
type Buf = {x: Float32Array; y: Float32Array; z: Float32Array; r: Float32Array; o: Float32Array; k: Float32Array};
const novoBuf = (n: number): Buf => ({x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), r: new Float32Array(n), o: new Float32Array(n), k: new Float32Array(n)});
const BUFS = new Map<number, {A: Buf; B: Buf; sx: Float32Array; sy: Float32Array; sr: Float32Array; key: Int16Array; ord: Int32Array}>();
const bufs = (n: number) => {
  let b = BUFS.get(n);
  if (!b) {
    b = {A: novoBuf(n), B: novoBuf(n), sx: new Float32Array(n), sy: new Float32Array(n), sr: new Float32Array(n), key: new Int16Array(n), ord: new Int32Array(n)};
    BUFS.set(n, b);
  }
  return b;
};

// ---------------------------------------------------------------------------
// formas estáticas (glifo, imagem): amostra uma vez, distribui pelos pontos com a ordem coerente
// ---------------------------------------------------------------------------
type Alvo = {k: number; tx: Float32Array; ty: Float32Array; tv: Float32Array};
const ALVOS = new Map<string, Alvo>();
const DADOS = new Map<string, unknown>(); // JSON de pontos carregados (imagem)

const FATIAS = 48;
/** Distribui K amostras (x, y, v) pelos pontos de rank < K: fatias de mesma contagem por ângulo,
 *  e dentro da fatia, raio da amostra casado com o rho do ponto. */
const distribuir = (S: Sementes, xs: number[], ys: number[], vs: number[]): Alvo => {
  const n = S.n;
  const k = Math.min(xs.length, n);
  let cx = 0, cy = 0;
  for (let j = 0; j < k; j++) { cx += xs[j]; cy += ys[j]; }
  cx /= k || 1; cy /= k || 1;
  const amostras = Array.from({length: k}, (_, j) => j).sort((p, q) => Math.atan2(ys[p] - cy, xs[p] - cx) - Math.atan2(ys[q] - cy, xs[q] - cx));
  const membros: number[] = [];
  for (const i of S.porTh) if (S.rank[i] < k) membros.push(i);
  const tx = new Float32Array(n).fill(NaN), ty = new Float32Array(n), tv = new Float32Array(n);
  for (let f = 0; f < FATIAS; f++) {
    const a0 = Math.floor((f * k) / FATIAS), a1 = Math.floor(((f + 1) * k) / FATIAS);
    const sa = amostras.slice(a0, a1).sort((p, q) => Math.hypot(xs[p] - cx, ys[p] - cy) - Math.hypot(xs[q] - cx, ys[q] - cy));
    const sm = membros.slice(a0, a1).sort((p, q) => S.rho[p] - S.rho[q]);
    for (let j = 0; j < sa.length; j++) { const i = sm[j], s = sa[j]; tx[i] = xs[s]; ty[i] = ys[s]; tv[i] = vs[s]; }
  }
  return {k, tx, ty, tv};
};

/** Número ou palavra em pontos, na fonte do reel. Amostragem com passo adaptado pra dar ~alvo pontos. */
const amostrarGlifo = (texto: string, contorno: boolean, alvoN: number, largura: number, jit: (j: number) => number) => {
  const linhas = texto.split('\n');
  const cv = document.createElement('canvas');
  const g = cv.getContext('2d', {willReadFrequently: true});
  let fs = 600;
  g.font = `400 ${fs}px ${FONT}`;
  const maxW = Math.max(...linhas.map((l) => g.measureText(l).width), 1);
  fs = Math.min(fs * (1300 / maxW), 1100 / linhas.length);
  const lh = fs * 0.98;
  cv.width = 1400;
  cv.height = Math.ceil(lh * linhas.length + fs * 0.2);
  g.font = `400 ${fs}px ${FONT}`;
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  linhas.forEach((l, k) => g.fillText(l, cv.width / 2, fs * 0.1 + lh * (k + 0.5)));
  return amostrarCanvas(g, cv, contorno, alvoN, largura, jit);
};

/** Logo (SVG de uma cor, do scripts/logo.mjs) em pontos: desenha os caminhos com Path2D no navegador. */
const amostrarSvg = (paths: string[], viewBox: string, contorno: boolean, alvoN: number, largura: number, jit: (j: number) => number) => {
  const [vx, vy, vw, vh] = viewBox.split(/[\s,]+/).map(Number);
  const cv = document.createElement('canvas');
  const lado = 1300;
  const k = lado / Math.max(vw, vh);
  cv.width = Math.ceil(vw * k) + 40;
  cv.height = Math.ceil(vh * k) + 40;
  const g = cv.getContext('2d', {willReadFrequently: true});
  g.fillStyle = '#fff';
  g.setTransform(k, 0, 0, k, 20 - vx * k, 20 - vy * k);
  for (const d of paths) g.fill(new Path2D(d));
  g.setTransform(1, 0, 0, 1, 0, 0);
  return amostrarCanvas(g, cv, contorno, alvoN, largura, jit);
};

/** Amostra a área preenchida de um canvas com passo adaptado pra dar ~alvoN pontos, centrada e na largura pedida. */
const amostrarCanvas = (g: CanvasRenderingContext2D, cv: HTMLCanvasElement, contorno: boolean, alvoN: number, largura: number, jit: (j: number) => number) => {
  const {data, width: cw, height: ch} = g.getImageData(0, 0, cv.width, cv.height);
  const cheio = (x: number, y: number) => x >= 0 && y >= 0 && x < cw && y < ch && data[(y * cw + x) * 4 + 3] > 127;
  const ok = (x: number, y: number) => cheio(x, y) && (!contorno || !cheio(x - 3, y) || !cheio(x + 3, y) || !cheio(x, y - 3) || !cheio(x, y + 3));
  let total = 0, x0 = cw, x1 = 0, y0 = ch, y1 = 0;
  for (let y = 0; y < ch; y += 2) for (let x = 0; x < cw; x += 2) if (ok(x, y)) { total += 4; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const passo = Math.max(1, Math.sqrt(total / alvoN));
  const xs: number[] = [], ys: number[] = [], vs: number[] = [];
  const esc = largura / Math.max(1, x1 - x0);
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  let j = 0;
  for (let y = y0; y <= y1; y += passo)
    for (let x = x0; x <= x1; x += passo) {
      const px = Math.round(x), py = Math.round(y);
      if (!ok(px, py)) continue;
      xs.push((px - mx + jit(j) * passo * 0.35) * esc);
      ys.push((py - my + jit(j + 7919) * passo * 0.35) * esc);
      vs.push(1);
      j++;
    }
  return {xs, ys, vs};
};

const alvoDe = (ch: Chave, S: Sementes): Alvo => {
  const chave = JSON.stringify([S.n, ch.forma, ch.texto, ch.contorno, ch.src, ch.largura, ch.altura, ch.densidade, ch.paths, ch.viewBox]);
  let al = ALVOS.get(chave);
  if (al) return al;
  const alvoN = Math.floor(S.n * (ch.densidade ?? (ch.forma === 'imagem' ? 0.9 : 0.8)));
  const jit = (j: number) => random('gj' + j) - 0.5;
  if (ch.forma === 'glifo') {
    const {xs, ys, vs} = amostrarGlifo(String(ch.texto ?? '?'), Boolean(ch.contorno), alvoN, (ch.largura as number) ?? 760, jit);
    al = distribuir(S, xs, ys, vs);
  } else if (ch.forma === 'logo') {
    const {xs, ys, vs} = amostrarSvg((ch.paths as string[]) ?? [], String(ch.viewBox ?? '0 0 24 24'), Boolean(ch.contorno), alvoN, (ch.largura as number) ?? 560, jit);
    al = distribuir(S, xs, ys, vs);
  } else {
    // imagem: [[x 0..1, y 0..1, v 0..1]] ou {w, h, pontos}; sai de scripts/pontos.mjs (Fase 3)
    const d = DADOS.get(String(ch.src)) as number[][] | {w?: number; h?: number; pontos: number[][]} | undefined;
    const pts = Array.isArray(d) ? d : d?.pontos ?? [];
    const asp = !Array.isArray(d) && d?.w && d?.h ? d.h / d.w : 1.3;
    const lw = (ch.largura as number) ?? 760;
    const lh = (ch.altura as number) ?? lw * asp;
    const manter = Math.min(1, alvoN / Math.max(1, pts.length));
    const xs: number[] = [], ys: number[] = [], vs: number[] = [];
    const cel = Math.sqrt((lw * lh) / Math.max(1, pts.length)) * 0.32;
    pts.forEach((p, j) => { if (manter >= 1 || random('ik' + j) < manter) { xs.push((p[0] - 0.5) * lw + jit(j) * cel); ys.push((p[1] - 0.5) * lh + jit(j + 104729) * cel); vs.push(p[2] ?? 1); } });
    al = distribuir(S, xs, ys, vs);
  }
  ALVOS.set(chave, al);
  return al;
};

// rede: nós e arestas determinísticos, por quantidade de nós
const REDES = new Map<number, {nos: number[][]; arestas: number[][]}>();
const redeDe = (nos: number) => {
  let r = REDES.get(nos);
  if (r) return r;
  // nós em espiral de girassol (ocupação uniforme, sem buraco nem amontoado) com um tremor leve
  const ns = Array.from({length: nos}, (_, k) => {
    const rr = Math.sqrt((k + 0.5) / nos), ang = k * 2.39996;
    return [Math.cos(ang) * rr * 400 + (random('rx' + k) - 0.5) * 70, Math.sin(ang) * rr * 520 + (random('ry' + k) - 0.5) * 70, (random('rz' + k) - 0.5) * 320];
  });
  const d = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const ar: number[][] = [];
  const visto = new Set<string>();
  const liga = (k: number, j: number) => { const id = k < j ? `${k}-${j}` : `${j}-${k}`; if (!visto.has(id)) { visto.add(id); ar.push([k, j]); } };
  // árvore mínima (Prim): garante uma rede só, nunca dois pedaços soltos
  const dentro = new Set([0]);
  while (dentro.size < nos) {
    let melhor = [0, 0, Infinity];
    for (const k of dentro) for (let j = 0; j < nos; j++) if (!dentro.has(j) && d(ns[k], ns[j]) < melhor[2]) melhor = [k, j, d(ns[k], ns[j])];
    liga(melhor[0], melhor[1]);
    dentro.add(melhor[1]);
  }
  // + o vizinho mais próximo de cada nó: fecha alguns ciclos e a rede deixa de parecer árvore
  ns.forEach((p, k) => { const j = ns.map((q, jj) => [jj, d(p, q)]).filter(([jj]) => jj !== k).sort((u, v) => u[1] - v[1])[1]?.[0]; if (j !== undefined) liga(k, j); });
  r = {nos: ns, arestas: ar};
  REDES.set(nos, r);
  return r;
};

// ---------------------------------------------------------------------------
// formas: escrevem no buffer a posição LOCAL; a transformação comum (escala, giro, inclinação,
// deslocamento) vem depois, igual pra todas
// ---------------------------------------------------------------------------
const POEIRA_O = 0.06;
const poeira = (S: Sementes, i: number, t: number, B: Buf) => {
  B.x[i] = (S.a[i] - 0.5) * 2600;
  B.y[i] = (S.b[i] - 0.5) * 3600;
  B.z[i] = (S.c[i] - 0.5) * 2400 + Math.sin(t * 0.2 + S.a[i] * 9) * 40;
  B.r[i] = 1;
  B.o[i] = POEIRA_O;
  B.k[i] = 0;
};

const GIRO_PADRAO: Record<string, number> = {esfera: 0.35, nuvem: 0.08, rede: 0.12};
const INCL_PADRAO: Record<string, number> = {galaxia: 1.05, onda: 0.62, anel: 1.15};
const DENS_PADRAO: Record<string, number> = {poeira: 0, nuvem: 0.7, esfera: 0.85, anel: 0.6, galaxia: 0.95, onda: 0.9, tunel: 0.9, grupos: 0.75, rede: 0.75};

const avaliar = (ch: Chave, t: number, S: Sementes, B: Buf): void => {
  const n = S.n;
  const forma = ch.forma;
  const lt = t - ch.f / FPS; // tempo local da forma (anima por dentro enquanto a câmera trabalha)
  const tam = ch.tamanho ?? 1;
  const op = ch.opacidade ?? 1;
  const ac = ch.acento;
  const acF = ac === true ? 1 : typeof ac === 'number' ? ac : 0;
  const estatica = forma === 'glifo' || forma === 'imagem' || forma === 'logo';
  const al = estatica ? alvoDe(ch, S) : null;
  const K = al ? al.k : Math.floor(n * (ch.densidade ?? DENS_PADRAO[forma] ?? 0.8));
  // transformação comum
  const esc = ch.escala ?? 1;
  const balanco = ch.balanco ?? (estatica ? 0.16 : 0);
  const ry = (ch.rotY ?? 0) + (ch.giro ?? GIRO_PADRAO[forma] ?? 0) * t + balanco * Math.sin(t * 0.55);
  const rx = ch.inclinacao ?? INCL_PADRAO[forma] ?? 0;
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  const ox = ch.x ?? 0, oy = ch.y ?? 0, oz = ch.z ?? 0;
  // parâmetros por forma
  const raio = (ch.raio as number) ?? 0;
  const q = Math.max(1, Math.round((ch.quantidade as number) ?? 3));
  let cols = 1, cel = 0, linhasG = 1;
  if (forma === 'grupos') {
    cols = Math.max(1, Math.round(Math.sqrt(q * 0.7)));
    linhasG = Math.ceil(q / cols);
    cel = Math.min(880 / cols, 1040 / linhasG);
  }
  // destaque: um índice ou uma lista ("11 dos 34 eram de terceiros" = 11 grupos em acento)
  const destaques = forma === 'grupos' && ch.destaque !== undefined ? new Set<number>(([] as number[]).concat(ch.destaque as number | number[])) : null;
  const rede = forma === 'rede' ? redeDe(Math.max(3, Math.round((ch.nos as number) ?? 16))) : null;
  const latCols = forma === 'onda' ? Math.max(2, Math.round(Math.sqrt(K * 1.0))) : 0;

  for (let i = 0; i < n; i++) {
    if (S.rank[i] >= K || (al && Number.isNaN(al.tx[i]))) { poeira(S, i, t, B); continue; }
    const a = S.a[i], b = S.b[i], c = S.c[i], th = S.th[i], rho = S.rho[i];
    let x = 0, y = 0, z = 0, r = 1.3, o = 0.85;
    B.k[i] = acF > 0 && (acF >= 1 || c < acF) ? 1 : 0;
    switch (forma) {
      case 'nuvem': {
        const R = raio || 430;
        const rr = R * Math.cbrt(rho) * (1 + 0.04 * Math.sin(lt * 1.3 + a * 6));
        const ph = Math.acos(2 * a - 1);
        x = rr * Math.sin(ph) * Math.cos(th); y = rr * Math.cos(ph); z = rr * Math.sin(ph) * Math.sin(th);
        r = 1.2; o = 0.5 + 0.3 * b;
        break;
      }
      case 'esfera': {
        const R = raio || 330;
        const u = 2 * a - 1, s = Math.sqrt(1 - u * u);
        x = Math.cos(th) * s * R; y = u * R; z = Math.sin(th) * s * R;
        r = 1.3; o = 0.85;
        break;
      }
      case 'anel': {
        const R = raio || 380;
        const e = (ch.espessura as number) ?? 70;
        const ang = th + lt * 0.3;
        const rr = R + (rho - 0.5) * e;
        x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; y = (b - 0.5) * e * 0.3;
        r = 1.35; o = 0.8;
        break;
      }
      case 'galaxia': {
        const R = raio || 540;
        const bracos = Math.max(1, Math.round((ch.bracos as number) ?? 3));
        const rr = R * Math.pow(rho, 0.7);
        const braco = Math.floor(a * bracos);
        const ang = (braco * TAU) / bracos + (rr / R) * ((ch.torcao as number) ?? 2.8) + (b - 0.5) * 0.55 * (1 - rho * 0.5) + lt * 0.12;
        x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; y = (c - 0.5) * 50 * (1 - rho);
        r = 1.1 + (1 - rho) * 1.4; o = 0.45 + 0.5 * (1 - rho);
        break;
      }
      case 'onda': {
        const L = (ch.largura as number) ?? 920;
        const j = S.rank[i];
        const col = j % latCols, lin = Math.floor(j / latCols);
        const lins = Math.ceil(K / latCols);
        x = (col / (latCols - 1) - 0.5) * L;
        z = (lin / Math.max(1, lins - 1) - 0.5) * L;
        const amp = (ch.amplitude as number) ?? 80;
        y = amp * Math.sin(x * 0.007 + lt * 1.5) * Math.cos(z * 0.006 + lt * 1.05);
        r = 1.15; o = 0.55 + 0.4 * (0.5 + y / (2 * amp));
        break;
      }
      case 'tunel': {
        const R = raio || 320;
        const vel = (ch.vel as number) ?? 0.22;
        // anéis discretos avançando: lê como túnel (pontos soltos liam como céu estrelado)
        const aneis = Math.max(4, Math.round((ch.aneis as number) ?? 22));
        const u = (Math.floor(b * aneis) / aneis + lt * vel) % 1;
        const rr = R * (1 + (rho - 0.5) * 0.06);
        x = Math.cos(th) * rr; y = Math.sin(th) * rr; z = 2400 - u * 3300;
        r = 1.25; o = (0.25 + 0.7 * u) * Math.min(1, (1 - u) * 6);
        break;
      }
      case 'grupos': {
        const g = Math.min(q - 1, Math.floor((th / TAU) * q));
        const gc = g % cols, gl = Math.floor(g / cols);
        const naLinha = gl === linhasG - 1 ? q - gl * cols : cols; // última linha centralizada
        const gx = (gc - (naLinha - 1) / 2) * cel;
        const gy = (gl - (linhasG - 1) / 2) * cel;
        const cr = cel * 0.34 * Math.sqrt(rho);
        x = gx + Math.cos(a * TAU) * cr; y = gy + Math.sin(a * TAU) * cr; z = (c - 0.5) * cel * 0.2;
        r = 1.25; o = 0.85;
        if (destaques) B.k[i] = destaques.has(g) ? 1 : 0;
        break;
      }
      case 'rede': {
        const {nos, arestas} = rede!;
        if (b < 0.4) {
          // nó: aglomerado denso e brilhante
          const p = nos[Math.floor(a * nos.length)];
          const jr = 30 * Math.pow(rho, 0.6);
          x = p[0] + Math.cos(th) * jr; y = p[1] + Math.sin(th) * jr; z = p[2] + (c - 0.5) * 24;
          r = 1.6; o = 0.95;
        } else {
          // aresta: pontos correndo de um nó ao outro (o fluxo da conexão)
          const [p0, p1] = arestas[Math.floor(a * arestas.length)].map((k) => nos[k]);
          const u = (rho + lt * ((ch.vel as number) ?? 0.18)) % 1;
          x = p0[0] + (p1[0] - p0[0]) * u; y = p0[1] + (p1[1] - p0[1]) * u; z = p0[2] + (p1[2] - p0[2]) * u;
          r = 1.2; o = 0.5 + 0.45 * Math.sin(Math.PI * u);
        }
        break;
      }
      case 'glifo':
      case 'logo':
      case 'imagem': {
        x = al!.tx[i]; y = al!.ty[i];
        const v = al!.tv[i];
        z = (c - 0.5) * ((ch.profundidade as number) ?? 36);
        if (forma === 'imagem') { r = 0.9 + v * 2.4; o = 0.2 + 0.8 * v; }
        else { r = 1.8; o = 1; }
        break;
      }
      default: { poeira(S, i, t, B); continue; }
    }
    // transformação comum
    x *= esc; y *= esc; z *= esc;
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    B.x[i] = x1 + ox; B.y[i] = y1 + oy; B.z[i] = z2 + oz;
    B.r[i] = r * tam; B.o[i] = o * op;
  }
};

/** segmentos de linha da forma (só a rede tem), já transformados pro mundo */
const linhasDe = (ch: Chave, t: number): number[][] => {
  if (ch.forma !== 'rede') return [];
  const {nos, arestas} = redeDe(Math.max(3, Math.round((ch.nos as number) ?? 16)));
  const esc = ch.escala ?? 1;
  const ry = (ch.rotY ?? 0) + (ch.giro ?? GIRO_PADRAO.rede) * t;
  const rx = ch.inclinacao ?? 0;
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  const tf = (p: number[]) => {
    const x = p[0] * esc, y = p[1] * esc, z = p[2] * esc;
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    return [x1 + (ch.x ?? 0), y * cx - z1 * sx + (ch.y ?? 0), y * sx + z1 * cx + (ch.z ?? 0)];
  };
  return arestas.map(([k, j]) => [...tf(nos[k]), ...tf(nos[j])]);
};

// ---------------------------------------------------------------------------
// câmera: poses com nome, interpolação suave, órbita contínua e respiração (nunca 100% parada)
// ---------------------------------------------------------------------------
type Cam = {yaw: number; pitch: number; dist: number; x: number; y: number};
const POSES: Record<string, Partial<Cam>> = {
  frente: {yaw: 0, pitch: 0, dist: DIST, x: 0, y: 0},
  perto: {yaw: 0, pitch: 0, dist: 980},
  longe: {yaw: 0, pitch: 0, dist: 2300},
  cima: {yaw: 0, pitch: 1.05, dist: 1700},
  baixo: {yaw: 0, pitch: -0.42, dist: 1500},
  lado: {yaw: 0.85, pitch: 0.1, dist: 1550},
  diagonal: {yaw: -0.5, pitch: 0.32, dist: 1600},
  mergulho: {dist: 38},
};
const CAM0: Cam = {yaw: 0, pitch: 0, dist: DIST, x: 0, y: 0};
const alvoCam = (k: CameraKey, base: Cam): Cam => ({...base, ...(k.pose ? POSES[k.pose] ?? {} : {}), ...Object.fromEntries((['yaw', 'pitch', 'dist', 'x', 'y'] as const).filter((p) => k[p] !== undefined).map((p) => [p, k[p]]))});

const camAt = (keys: CameraKey[], t: number): Cam => {
  let ini: Cam = {...CAM0};
  let cur: Cam = {...CAM0};
  for (let j = 0; j < keys.length; j++) {
    const k = keys[j];
    const t0 = k.f / FPS;
    if (t < t0) break;
    const prox = keys[j + 1];
    // pose desta chave avaliada em t (ou no começo da próxima, que vira o ponto de partida dela)
    const te = prox && t >= prox.f / FPS ? prox.f / FPS : t;
    const alvo = alvoCam(k, ini);
    if (k.orbita) alvo.yaw += k.orbita * (te - t0);
    const m = E_IO(clamp01((te - t0) / (k.dur ?? 0.9)));
    cur = {yaw: ini.yaw + (alvo.yaw - ini.yaw) * m, pitch: ini.pitch + (alvo.pitch - ini.pitch) * m, dist: ini.dist + (alvo.dist - ini.dist) * m, x: ini.x + (alvo.x - ini.x) * m, y: ini.y + (alvo.y - ini.y) * m};
    ini = cur;
  }
  return {...cur, yaw: cur.yaw + Math.sin(t * 0.35) * 0.02, pitch: cur.pitch + Math.sin(t * 0.27) * 0.012};
};

// ---------------------------------------------------------------------------
// preparo assíncrono: fonte do reel (glifo) e JSON de pontos (imagem). Uma vez por aba.
// ---------------------------------------------------------------------------
let fonteP: Promise<void> | null = null;
const prepararFonte = () =>
  (fonteP ??= new FontFace(FONT, `url(${staticFile('Anton-Regular.ttf')})`)
    .load()
    .then((f) => { (document.fonts as unknown as {add: (x: FontFace) => void}).add(f); })
    .catch(() => undefined));
const preparar = (spec: MundoSpec) =>
  Promise.all([
    prepararFonte(),
    ...spec.chaves.filter((c) => c.forma === 'imagem' && c.src && !DADOS.has(String(c.src))).map((c) =>
      fetch(staticFile(String(c.src))).then((r) => r.json()).then((j) => { DADOS.set(String(c.src), j); }).catch(() => DADOS.set(String(c.src), []))),
  ]);

// ---------------------------------------------------------------------------
// o componente
// ---------------------------------------------------------------------------
const NIV = 20; // níveis de opacidade por cor (bucketing do desenho)

export const Mundo: React.FC<{spec: MundoSpec; base: number}> = ({spec, base}) => {
  const frame = useCurrentFrame() + base; // quadro ABSOLUTO do reel
  const {ink, accent, mode} = useTheme();
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender('mundo de pontos'));
  const [pronto, setPronto] = useState(false);
  const liberado = useRef(false);
  useEffect(() => { preparar(spec).then(() => setPronto(true)); }, [spec]);

  useLayoutEffect(() => {
    if (!pronto) return;
    const cv = ref.current;
    const g = cv?.getContext('2d');
    if (g) desenhar(g, spec, frame, ink, accent, mode);
    if (!liberado.current) { liberado.current = true; continueRender(handle); }
  }, [pronto, frame, spec, ink, accent, mode, handle]);

  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}} />;
};

const desenhar = (g: CanvasRenderingContext2D, spec: MundoSpec, frame: number, ink: string, accent: string, mode: 'dark' | 'light') => {
  const n = Math.max(500, Math.min(12000, Math.round(spec.n ?? 6000)));
  const S = sementes(n);
  const {A, B, sx, sy, sr, key, ord} = bufs(n);
  const t = frame / FPS;
  const chaves = spec.chaves.length ? spec.chaves : [{f: 0, forma: 'nuvem'} as Chave];

  // chave atual e anterior
  let k = 0;
  for (let j = 0; j < chaves.length; j++) if (frame >= chaves[j].f) k = j;
  const cur = chaves[k];
  const prev = chaves[Math.max(0, k - 1)];
  const dur = Math.max(0.05, cur.dur ?? 0.75);
  const spread = cur.spread ?? 0.28;
  const t0 = cur.f / FPS;
  const emMorph = k > 0 && t < t0 + dur + spread;
  avaliar(cur, t, S, B);
  if (emMorph) avaliar(prev, t, S, A);
  const curva = cur.curva ?? 0.22;
  const expl = cur.explosao ?? 0;

  // câmera (+ mergulho final automático)
  let cams = spec.cameras ?? [];
  if (spec.final === 'mergulho' && spec.total) cams = [...cams, {f: spec.total - 34, pose: 'mergulho', dur: 1.0}];
  const cam = camAt(cams, t);
  const cyw = Math.cos(cam.yaw), syw = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const SX = W / 2, SY = H * (spec.centroY ?? 0.4);
  const tamG = spec.tamanho ?? 1;
  const fimFade = spec.final === 'mergulho' && spec.total ? clamp01((spec.total - frame) / 10) : 1;

  // 1) posição final de cada ponto, projeção, chave de desenho (nível de opacidade x cor)
  let vis = 0;
  for (let i = 0; i < n; i++) {
    let x = B.x[i], y = B.y[i], z = B.z[i], r = B.r[i], o = B.o[i], ac = B.k[i];
    if (emMorph) {
      const m = E_IO(clamp01((t - t0 - S.dl[i] * spread) / dur));
      if (m < 1) {
        const ax = A.x[i], ay = A.y[i], az = A.z[i];
        const dx = x - ax, dy = y - ay;
        const arco = Math.sin(Math.PI * m);
        const lado = (S.c[i] - 0.5) * 2 * curva * arco;
        const ex = expl * arco;
        x = ax + dx * m - dy * lado + ax * ex;
        y = ay + dy * m + dx * lado + ay * ex;
        z = az + (z - az) * m + az * ex;
        r = A.r[i] + (r - A.r[i]) * m;
        o = A.o[i] + (o - A.o[i]) * m;
        ac = A.k[i] + (ac - A.k[i]) * m;
      }
    }
    // projeção
    const px = x - cam.x, py = y - cam.y;
    const x1 = px * cyw + z * syw, z1 = -px * syw + z * cyw;
    const y1 = py * cp - z1 * sp, z2 = py * sp + z1 * cp;
    const zz = z2 + cam.dist;
    key[i] = -1;
    if (zz < 30) continue;
    const s = FOCAL / zz;
    const X = SX + x1 * s, Y = SY + y1 * s;
    if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
    let rad = Math.min(10, r * s * tamG);
    let alfa = o * fimFade * (s < 0.25 ? 0.35 : s > 0.7 ? 1 : 0.35 + ((s - 0.25) / 0.45) * 0.65);
    if (ac >= 0.5) { rad *= 1.35; alfa = Math.max(alfa, 0.9 * fimFade); } // acento: o azul em ponto fino lia como cinza-escuro
    if (rad < 0.55) { alfa *= rad / 0.55; rad = 0.55; } // subpixel: troca tamanho por opacidade, sem cintilar
    if (alfa < 0.02) continue;
    sx[i] = X; sy[i] = Y; sr[i] = rad;
    key[i] = (ac >= 0.5 ? NIV : 0) + Math.min(NIV - 1, Math.floor(alfa * NIV));
    vis++;
  }

  // 2) ordenação por contagem (sem alocar) e desenho em lote
  const cont = new Int32Array(NIV * 2 + 1);
  for (let i = 0; i < n; i++) if (key[i] >= 0) cont[key[i] + 1]++;
  for (let b = 1; b <= NIV * 2; b++) cont[b] += cont[b - 1];
  const pos = cont.slice();
  for (let i = 0; i < n; i++) if (key[i] >= 0) ord[pos[key[i]]++] = i;

  g.clearRect(0, 0, W, H);
  const escuro = mode === 'dark';
  const brilho = escuro ? spec.brilho ?? 0.55 : 0;

  // linhas da rede (sob os pontos)
  const linhas = [...linhasDe(cur, t).map((l) => [l, emMorph ? E_IO(clamp01((t - t0) / (dur + spread))) : 1] as const), ...(emMorph ? linhasDe(prev, t).map((l) => [l, 1 - E_IO(clamp01((t - t0) / (dur * 0.6)))] as const) : [])];
  if (linhas.length) {
    g.strokeStyle = ink;
    g.lineWidth = 1.2;
    for (const [l, a] of linhas) {
      if (a <= 0.01) continue;
      const pr = (x: number, y: number, z: number) => {
        const px = x - cam.x, py = y - cam.y;
        const x1 = px * cyw + z * syw, z1 = -px * syw + z * cyw;
        const zz = py * sp + z1 * cp + cam.dist;
        const s = FOCAL / Math.max(30, zz);
        return [SX + x1 * s, SY + (py * cp - z1 * sp) * s];
      };
      const [x0, y0] = pr(l[0], l[1], l[2]);
      const [x1, y1] = pr(l[3], l[4], l[5]);
      g.globalAlpha = 0.22 * a * fimFade;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }

  const passe = (raioMul: number, alfaMul: number) => {
    for (let b = 0; b < NIV * 2; b++) {
      const a0 = cont[b], a1 = cont[b + 1];
      if (a1 <= a0) continue;
      g.fillStyle = b >= NIV ? accent : ink;
      g.globalAlpha = Math.min(1, ((b % NIV) + 0.5) / NIV * alfaMul);
      g.beginPath();
      for (let j = a0; j < a1; j++) {
        const i = ord[j];
        const r = sr[i] * raioMul;
        g.moveTo(sx[i] + r, sy[i]);
        g.arc(sx[i], sy[i], r, 0, TAU);
      }
      g.fill();
    }
  };
  if (brilho > 0 && vis) {
    g.globalCompositeOperation = 'lighter';
    passe(2.6, 0.11 * brilho);
    g.globalCompositeOperation = 'source-over';
  }
  passe(1, 1);
  g.globalAlpha = 1;
};
