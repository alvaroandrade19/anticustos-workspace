import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C, ci, E_IO, lerp, SANS} from './kit';
import {rt} from './time';
import BUSTO from './data/busto.json';

// ═══════════ UM ÚNICO SISTEMA DE PONTOS ═══════════
// ~5.700 pontos (o busto de Sócrates) atravessam o vídeo inteiro, virando cada ideia.
export const W = 1080;
export const H = 1920;
const CX = 540;
const CY = 900;
const TAU = Math.PI * 2;
type P = [number, number, number, number];
type Pt = [number, number];

const B = BUSTO as number[][];
const N = B.length;
const R = B.map(([px, py, v], i) => ({px, py, v, a: random('a' + i), b: random('b' + i), c: random('c' + i), dl: random('d' + i), perm: 0}));
[...R.keys()].sort((x, y) => R[x].c - R[y].c).forEach((idx, k) => (R[idx].perm = k));

// ─── tempos (narração crua → final) ───
export const K = {
	bust: 0,
	book: rt(2.85),
	lineage: rt(4.32),
	img1: rt(7.76),
	img2: rt(9.37),
	tunnel: rt(10.75),
	ask: rt(12.55),
	again: rt(13.8),
	certain: rt(14.62),
	crack: rt(15.3),
	contra: rt(15.92),
	know: rt(17.97),
	shrink: rt(20.0),
	now: rt(22.45),
	easy: rt(24.5),
	prompt: rt(26.62),
	skill: rt(30.7),
	good: rt(33.85),
	all: rt(35.48),
	worth: rt(38.47),
};
export const END = rt(40.59) + 2.6;

// ─── amostragem ───
const sample = (paths: Pt[][], count: number, jitter = 2): Pt[] => {
	const segs: {a: Pt; b: Pt; len: number}[] = [];
	for (const p of paths) for (let k = 1; k < p.length; k++) segs.push({a: p[k - 1], b: p[k], len: Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])});
	const total = segs.reduce((s, g) => s + g.len, 0);
	const out: Pt[] = [];
	let si = 0;
	let acc = 0;
	for (let k = 0; k < count; k++) {
		const d = (k / count) * total;
		while (si < segs.length - 1 && acc + segs[si].len < d) acc += segs[si++].len;
		const g = segs[si];
		const u = g.len ? (d - acc) / g.len : 0;
		out.push([lerp(g.a[0], g.b[0], u) + (random('jx' + k) - 0.5) * jitter, lerp(g.a[1], g.b[1], u) + (random('jy' + k) - 0.5) * jitter]);
	}
	return out;
};
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 40): Pt[] => Array.from({length: n + 1}, (_, k) => [cx + Math.cos(a0 + ((a1 - a0) * k) / n) * rx, cy + Math.sin(a0 + ((a1 - a0) * k) / n) * ry]);

// livro aberto (páginas vazias)
const BOOK = sample(
	[[[540, 830], [300, 790], [170, 820], [170, 1160], [300, 1130], [540, 1170], [780, 1130], [910, 1160], [910, 820], [780, 790], [540, 830]], [[540, 830], [540, 1170]]],
	1900,
	2,
);

/** retângulo das imagens (x, y, w, h) — as partículas orbitam ao redor */
export const FRAMES: Record<string, [number, number, number, number]> = {
	img1: [110, 560, 860, 580],
	img2: [110, 560, 860, 580],
	now: [250, 420, 580, 780],
};
const framePt = (rect: [number, number, number, number], u: number, off: number): Pt => {
	const [x, y, w, h] = rect;
	const per = 2 * (w + h);
	let d = ((u % 1) + 1) % 1 * per;
	if (d < w) return [x + d, y - off];
	d -= w;
	if (d < h) return [x + w + off, y + d];
	d -= h;
	if (d < w) return [x + w - d, y + h + off];
	d -= w;
	return [x - off, y + h - d];
};
// linhagem: Sócrates → hoje
export const LINE_NODES: [number, string, string][] = [
	[330, 'SÓCRATES', '−470'],
	[520, 'PLATÃO', '−427'],
	[700, 'ARISTÓTELES', '−384'],
	[880, 'AGOSTINHO', '354'],
	[1060, 'TOMÁS DE AQUINO', '1225'],
	[1240, 'DESCARTES', '1596'],
	[1420, 'HOJE', '2026'],
];
const LINEAGE = sample(
	[
		[[540, 330], [540, 1420]],
		...LINE_NODES.map(([y]) => arc(540, y, 16, 16, 0, TAU, 24)),
		// ramificações: a influência se espalha
		...LINE_NODES.slice(1).map(([y], k) => [[540, y], [540 + (k % 2 ? 1 : -1) * (140 + k * 40), y + 60]] as Pt[]),
		...LINE_NODES.slice(2).map(([y], k) => [[540, y], [540 + (k % 2 ? -1 : 1) * (90 + k * 30), y + 110]] as Pt[]),
	],
	2600,
	2,
);

// texto em pontos (canvas) — calculado uma vez no navegador
const glyphCache: Record<string, Pt[]> = {};
const glyph = (ch: string, size: number, step: number, weight = 700, font = SANS): Pt[] => {
	const key = ch + size + step + weight;
	if (glyphCache[key]) return glyphCache[key];
	if (typeof document === 'undefined') return [[0, 0]];
	const c = document.createElement('canvas');
	c.width = Math.ceil(size * 1.2);
	c.height = Math.ceil(size * 1.2);
	const g = c.getContext('2d')!;
	g.font = `${weight} ${size}px "${font}"`;
	g.fillStyle = '#fff';
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.fillText(ch, c.width / 2, c.height / 2);
	const img = g.getImageData(0, 0, c.width, c.height).data;
	const out: Pt[] = [];
	for (let y = 0; y < c.height; y += step)
		for (let x = 0; x < c.width; x += step) if (img[(y * c.width + x) * 4 + 3] > 120) out.push([x - c.width / 2, y - c.height / 2]);
	glyphCache[key] = out.length ? out : [[0, 0]];
	return glyphCache[key];
};

let BUBC: Pt[] | null = null;
const bubble = () => {
	if (BUBC) return BUBC;
	const r = 90;
	const x = 200, y = 700, w = 680, h = 360;
	const path: Pt[] = [...arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 12), ...arc(x + w - r, y + r, r, r, Math.PI * 1.5, TAU, 12), ...arc(x + w - r, y + h - r, r, r, 0, Math.PI * 0.5, 12), [x + 260, y + h], [x + 150, y + h + 110], [x + 170, y + h], ...arc(x + r, y + h - r, r, r, Math.PI * 0.5, Math.PI, 12), [x, y + r]];
	BUBC = sample([path], 1800, 2);
	return BUBC;
};
const ambient = (i: number, t: number, o = 0.06): P => {
	const d = R[i];
	return [((d.a * W + Math.sin(t * 0.3 + d.b * 9) * 30) % W + W) % W, ((d.b * H - t * (6 + d.c * 10)) % H + H) % H, 0.8 + d.c * 1.2, o * (0.5 + 0.5 * Math.sin(t * 2 + d.a * 20))];
};
const outline = (pts: Pt[], i: number, t: number, o = 0.9, r = 2.2): P => {
	const d = R[i];
	if (d.perm >= pts.length) return ambient(i, t);
	const [x, y] = pts[d.perm];
	return [x, y + Math.sin(t * 2 + d.a * 6) * 1.2, r * (0.7 + 0.5 * d.v), o * (0.75 + 0.25 * Math.sin(t * 3 + d.b * 20))];
};
/** glifo em 3D (extrudado em camadas) girando */
const glyph3D = (pts: Pt[], i: number, t: number, cx: number, cy: number, scale: number, rotY: number, o = 1, layers = 3): P => {
	const d = R[i];
	const n = pts.length * layers;
	if (d.perm >= n) return ambient(i, t);
	const [gx, gy] = pts[d.perm % pts.length];
	const z = (Math.floor(d.perm / pts.length) - (layers - 1) / 2) * 34;
	const x3 = gx * Math.cos(rotY) + z * Math.sin(rotY);
	const z3 = -gx * Math.sin(rotY) + z * Math.cos(rotY);
	const s = 1400 / (1400 + z3 * scale);
	const depth = ci(z3, [-80, 80], [1, 0.45]);
	return [cx + x3 * scale * s, cy + gy * scale * s, (1.2 + d.v * 1.8) * s * Math.sqrt(scale), o * depth];
};

const form = (name: string, i: number, t: number): P => {
	const d = R[i];
	switch (name) {
		case 'scatter':
			return [540 + (d.a - 0.5) * 760, 760 + (d.b - 0.5) * 1000, 1.4, 0.35];
		case 'bust':
			return [190 + d.px * 700, 200 + d.py * 1100 + Math.sin(t * 1.4 + d.py * 5) * 1.2, 1.0 + d.v * 3.3, (0.2 + 0.8 * d.v) * ci(d.py, [0.8, 1], [1, 0])];
		case 'bustUp':
			return [540 + (d.px - 0.5) * 420, 180 + d.py * 660, 0.8 + d.v * 2.2, (0.15 + 0.6 * d.v) * ci(d.py, [0.8, 1], [1, 0]) * 0.7];
		case 'book':
			return outline(BOOK, i, t);
		case 'img1':
		case 'img2':
		case 'now': {
			// moldura viva: pontos correndo ao redor da imagem
			if (d.perm >= 2600) return ambient(i, t);
			const u = d.perm / 2600 + (t * 0.05) * (d.perm % 2 ? 1 : -1);
			const off = 18 + (d.perm % 5) * 7 + Math.sin(t * 2 + d.a * 9) * 3;
			const [x, y] = framePt(FRAMES[name], u, off);
			return [x, y, 1 + d.v * 1.4, 0.35 + 0.5 * (1 - (d.perm % 5) / 5)];
		}
		case 'tunnel': {
			// túnel: anéis de pontos vindo em direção à câmera
			const ring = d.perm % 22;
			const z = (((ring / 22 + (t - K.tunnel) * 0.28) % 1) + 1) % 1;
			const dd = 0.2 + (1 - z) * 6;
			const a = d.a * TAU;
			const rr = 420 / dd;
			if (rr > 1400) return ambient(i, t);
			return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr * 1.1, Math.min(2.4, 0.4 + 1.6 / dd), 0.8 * ci(z, [0, 0.2], [0, 1]) * ci(rr, [80, 300], [0.2, 1])];
		}
		case 'lineage': {
			const p = outline(LINEAGE, i, t, 0.7, 1.8);
			if (d.perm >= LINEAGE.length) return p;
			// pulso de luz descendo a linha do tempo
			const py = ((t - K.lineage) * 420) % 1300 + 300;
			const glow = Math.exp(-Math.pow((p[1] - py) / 70, 2));
			return [p[0], p[1], p[2] * (1 + glow * 0.9), Math.min(1, p[3] * (0.55 + glow))];
		}

		case 'ask': {
			const G = glyph('?', 900, 12, 800);
			return glyph3D(G, i, t, CX, CY - 40, 1, Math.sin((t - K.ask) * 0.9) * 0.9, 0.95);
		}
		case 'again': {
			// ecos: a mesma pergunta, de novo e de novo, em profundidade
			const G = glyph('?', 900, 14, 800);
			const k = d.perm % 3;
			const idx = Math.floor(d.perm / 3);
			if (idx >= G.length) return ambient(i, t);
			const [gx, gy] = G[idx];
			const sc = [0.62, 0.42, 0.28][k];
			const ox = [-190, 160, 20][k];
			const oy = [-40, -140, -300][k];
			const lt = t - K.again;
			const on = ci(lt, [k * 0.22, k * 0.22 + 0.3], [0, 1]);
			return [CX + ox + gx * sc, CY + oy + gy * sc, (1 + d.v * 1.6) * (0.6 + sc), (1 - k * 0.25) * on];
		}
		case 'certain': {
			// esfera sólida de certeza… que racha
			const u = d.a * 2 - 1;
			const th = d.b * TAU + (t - K.certain) * 0.5;
			const rr = 320 * Math.cbrt(0.35 + 0.65 * d.c);
			const s = Math.sqrt(1 - u * u);
			const x = Math.cos(th) * s * rr;
			const z = Math.sin(th) * s * rr;
			const y = u * rr;
			const crack = E_IO(ci(t, [K.crack, K.crack + 0.8], [0, 1]));
			const side = x + y * 0.35 > 0 ? 1 : -1;
			const depth = 1 + z / 900;
			return [CX + x * depth + side * crack * 120, CY + y * depth + side * crack * 40, (1 + d.v * 1.6) * depth, 0.25 + 0.55 * ci(z, [-320, 320], [0.3, 1])];
		}
		case 'contra': {
			// A e não-A: duas linhas que se cruzam
			const lineA = d.perm % 2 === 0;
			const u = (Math.floor(d.perm / 2) / (N / 2)) * 1.1 - 0.05;
			const lt = t - K.contra;
			const reach = ci(lt, [0.2, 1.4], [0, 1]);
			if (u > reach) return ambient(i, t);
			const x = lerp(lineA ? 140 : 940, lineA ? 940 : 140, u);
			const y = lerp(560, 1240, u) + Math.sin(u * 14 + t * 2) * 4;
			const near = Math.exp(-Math.pow((u - 0.5) / 0.05, 2));
			return [x, y, 1.3 + near * 2.5 * ci(lt, [1.0, 1.3], [0, 1]), 0.75 + near * 0.25];
		}
		case 'know': {
			// "o que eu acho que sei" (grande) → encolhe no campo do que não sei
			const sh = E_IO(ci(t, [K.shrink, K.shrink + 1.6], [0, 1]));
			const inside = d.perm < 1400;
			if (inside) {
				const rr = Math.sqrt(d.b) * lerp(360, 80, sh);
				const a = d.a * TAU + t * 0.2;
				return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 1.4 + d.v * 1.6, 0.9];
			}
			// o campo imenso do que não se sabe
			const rr = lerp(380, 180, sh) + Math.sqrt(d.c) * lerp(40, 820, sh);
			const a = d.a * TAU + t * 0.05;
			return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr * 1.15, 0.9 + d.v, lerp(0.05, 0.35, sh)];
		}
		case 'pixels': {
			// mármore → pixels: o busto em grade quadrada (digital)
			const gx = Math.round((190 + d.px * 700) / 22) * 22;
			const gy = Math.round((200 + d.py * 1100) / 22) * 22;
			return [gx, gy, 3.2 * d.v + 0.8, (0.2 + 0.8 * d.v) * ci(d.py, [0.8, 1], [1, 0]) * 0.8];
		}
		case 'easyOld': {
			// respostas chovendo: balões empilhando e rolando
			const k = d.perm % 26;
			const lt = t - K.easy;
			const y0 = 1600 - ((k * 130 + lt * 520) % 1700);
			const w = 300 + (k % 4) * 90;
			const left = k % 2 === 0;
			const x0 = left ? 150 : 930 - w;
			const u = (Math.floor(d.perm / 26) % 60) / 60;
			const per = u < 0.5 ? [x0 + u * 2 * w, y0] : [x0 + (u - 0.5) * 2 * w, y0 + 70];
			const edge = u < 0.02 || (u > 0.48 && u < 0.52) ? 1 : 0;
			return [per[0], per[1] + (edge ? 0 : 0), 1.3, 0.55 * ci(y0, [150, 400], [0, 1]) * ci(y0, [1500, 1650], [1, 0])];
		}
		case 'easy': {
			// uma resposta aparece na hora: balão de conversa + digitando
			const BUB = bubble();
			if (d.perm < BUB.length) return outline(BUB, i, t, 0.9, 2);
			const k = d.perm - BUB.length;
			if (k < 540) {
				const dot = k % 3;
				const up = Math.max(0, Math.sin((t - K.easy) * 7 - dot * 0.9)) * 18;
				const a = d.a * TAU;
				const r = Math.sqrt(d.b) * 16;
				return [440 + dot * 100 + Math.cos(a) * r, 880 - up + Math.sin(a) * r, 1.6, 0.95];
			}
			return ambient(i, t);
		}
		case 'prompt':
			return ambient(i, t, 0.08);
		case 'skill': {
			// o busto volta, pequeno, cercado de perguntas
			return [540 + (d.px - 0.5) * 460, 520 + d.py * 720, 0.9 + d.v * 2.4, (0.2 + 0.8 * d.v) * ci(d.py, [0.8, 1], [1, 0])];
		}
		case 'good': {
			const G = glyph('?', 1100, 12, 800);
			return glyph3D(G, i, t, CX, CY - 60, 1.05, Math.sin((t - K.good) * 0.7) * 0.6, 1);
		}
		case 'all': {
			// biblioteca infinita de respostas: cartões em perspectiva
			const cols = 7;
			const k = d.perm % 140;
			const col = (k % cols) - 3;
			const row = Math.floor(k / cols);
			const z = (((row / 20 + (t - K.all) * 0.12) % 1) + 1) % 1;
			const dd = 0.25 + (1 - z) * 5;
			const u = (Math.floor(d.perm / 140) % 40) / 40;
			const cw = 120;
			const px = col * 150 + (u < 0.5 ? -cw / 2 + u * 2 * cw : -cw / 2 + (u - 0.5) * 2 * cw);
			const py = u < 0.5 ? -60 : 60;
			const x = CX + (px / dd) * 1.6;
			const y = CY + 180 + ((py + 420) / dd) * 0.9;
			return [x, y, 2.2 / dd + 0.4, 0.5 * ci(z, [0, 0.2], [0, 1]) * ci(dd, [0.3, 0.7], [0.3, 1])];
		}
		case 'worth': {
			// tudo apaga… só uma pergunta fica acesa
			const G = glyph('?', 420, 9, 800);
			if (d.perm < G.length) {
				const [gx, gy] = G[d.perm];
				return [CX + gx, CY + gy - 40, 1.4 + d.v * 1.4, 1];
			}
			const [x, y, r, o] = form('all', i, t);
			return [x, y, r, o * ci(t, [K.worth, K.worth + 1.5], [1, 0.12])];
		}
		default:
			return [CX, CY, 1, 0];
	}
};

const KEYS: {t: number; f: string; dur: number; spread: number}[] = [
	{t: -1, f: 'scatter', dur: 0.1, spread: 0},
	{t: 0, f: 'bust', dur: 0.55, spread: 0.25},
	{t: K.book, f: 'book', dur: 0.55, spread: 0.2},
	{t: K.lineage, f: 'lineage', dur: 0.7, spread: 0.25},
	{t: K.img1, f: 'img1', dur: 0.7, spread: 0.3},
	{t: K.img2, f: 'img2', dur: 0.5, spread: 0.2},
	{t: K.tunnel, f: 'tunnel', dur: 0.6, spread: 0.25},
	{t: K.ask, f: 'ask', dur: 0.4, spread: 0.12},
	{t: K.again, f: 'again', dur: 0.3, spread: 0.1},
	{t: K.certain, f: 'certain', dur: 0.35, spread: 0.12},
	{t: K.contra, f: 'contra', dur: 0.35, spread: 0.1},
	{t: K.know, f: 'know', dur: 0.9, spread: 0.4},
	{t: K.now, f: 'now', dur: 0.7, spread: 0.3},
	{t: K.easy, f: 'easy', dur: 0.7, spread: 0.3},
	{t: K.prompt, f: 'prompt', dur: 0.6, spread: 0.3},
	{t: K.skill, f: 'skill', dur: 1.0, spread: 0.4},
	{t: K.good, f: 'good', dur: 0.7, spread: 0.35},
	{t: K.all, f: 'all', dur: 1.0, spread: 0.4},
	{t: K.worth, f: 'worth', dur: 1.1, spread: 0.4},
];

export const Particles: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	let k = 0;
	for (let j = 0; j < KEYS.length; j++) if (t >= KEYS[j].t) k = j;
	const cur = KEYS[k];
	const prev = KEYS[Math.max(0, k - 1)];
	const fade = ci(t, [END - 1.2, END], [1, 0]);
	const out: React.ReactNode[] = [];
	for (let i = 0; i < N; i++) {
		const m = E_IO(ci(t - cur.t - R[i].dl * cur.spread, [0, cur.dur], [0, 1]));
		let x: number, y: number, r: number, o: number;
		if (m >= 1) [x, y, r, o] = form(cur.f, i, t);
		else {
			const a = form(prev.f, i, t);
			const b = form(cur.f, i, t);
			[x, y, r, o] = [lerp(a[0], b[0], m), lerp(a[1], b[1], m), lerp(a[2], b[2], m), lerp(a[3], b[3], m)];
		}
		if (o * fade < 0.02) continue;
		out.push(<circle key={i} cx={x} cy={y} r={r} fill={C.ink} opacity={o * fade} />);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{out}
		</svg>
	);
};
