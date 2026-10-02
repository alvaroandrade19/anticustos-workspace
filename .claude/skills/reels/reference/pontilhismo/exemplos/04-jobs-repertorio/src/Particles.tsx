import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, ci, E_IO, H, lerp, W} from './kit';
import {rt} from './time';
import DOTS from './dots.json';

// ═══════════ ESTRUTURA ═══════════
// Um único sistema de ~2.600 partículas atravessa o vídeo inteiro.
// Cada "forma" devolve [x, y, raio, opacidade] para a partícula i no tempo t.
// Partículas além de M (as "sobras" do contorno) viram um campo sutil que preenche a composição.

type P = [number, number, number, number];
const N = (DOTS as number[][]).length;
const M = 1500;
const CX = 540;
const CY = 860;
const TAU = Math.PI * 2;

const R = (DOTS as number[][]).map(([px, py, v], i) => ({
	px,
	py,
	v,
	a: random('a' + i),
	b: random('b' + i),
	c: random('c' + i),
	dl: random('dl' + i),
	perm: 0,
}));
// permutação fixa: a ordem de cada contorno é embaralhada p/ morphs orgânicos
const order = Array.from({length: N}, (_, i) => i).sort((x, y) => R[x].c - R[y].c);
order.forEach((idx, k) => (R[idx].perm = k));

// ─── amostragem de contornos ───
type Pt = [number, number];
const circlePath = (cx: number, cy: number, r: number, a0 = 0, a1 = TAU, n = 64): Pt[] =>
	Array.from({length: n + 1}, (_, k) => {
		const a = a0 + ((a1 - a0) * k) / n;
		return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
	});
const rectPath = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const roundRect = (x: number, y: number, w: number, h: number, r: number): Pt[] => [
	...circlePath(x + r, y + r, r, Math.PI, Math.PI * 1.5, 10),
	...circlePath(x + w - r, y + r, r, Math.PI * 1.5, TAU, 10),
	...circlePath(x + w - r, y + h - r, r, 0, Math.PI * 0.5, 10),
	...circlePath(x + r, y + h - r, r, Math.PI * 0.5, Math.PI, 10),
	[x, y + r],
];
const sample = (paths: Pt[][], count: number, jitter = 3): Pt[] => {
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

// ─── contornos estáticos ───
const BULB = sample(
	[
		circlePath(CX, 760, 230, Math.PI * 0.72, Math.PI * 2.28, 90),
		[[CX - 150, 935], [CX - 95, 1040], [CX + 95, 1040], [CX + 150, 935]],
		[[CX - 95, 1070], [CX + 95, 1070]],
		[[CX - 85, 1100], [CX + 85, 1100]],
		[[CX - 60, 1130], [CX + 60, 1130]],
		[[CX - 60, 1040], [CX - 40, 830], [CX - 20, 880], [CX, 820], [CX + 20, 880], [CX + 40, 830], [CX + 60, 1040]],
	],
	M,
);
const FILM = sample(
	[
		rectPath(300, 360, 480, 1000),
		rectPath(370, 420, 340, 250),
		rectPath(370, 735, 340, 250),
		rectPath(370, 1050, 340, 250),
		...Array.from({length: 12}, (_, k) => rectPath(318, 380 + k * 82, 30, 40)),
		...Array.from({length: 12}, (_, k) => rectPath(732, 380 + k * 82, 30, 40)),
	],
	M,
	2,
);
const ridge = (y0: number, amp: number, seed: string): Pt[] =>
	Array.from({length: 40}, (_, k) => {
		const x = 120 + (k / 39) * 840;
		return [x, y0 - Math.abs(Math.sin(k * 0.45 + random(seed) * 3)) * amp - Math.sin(k * 0.17) * amp * 0.5];
	});
const MOUNTAIN = sample([ridge(1080, 260, 'r1'), ridge(1160, 150, 'r2'), [[120, 1200], [960, 1200]], circlePath(700, 640, 95, 0, TAU, 60)], M, 3);
const TALK = sample(
	[
		roundRect(170, 560, 480, 280, 60),
		[[250, 840], [210, 920], [330, 840]],
		roundRect(430, 960, 480, 280, 60),
		[[830, 1240], [870, 1320], [750, 1240]],
	],
	M,
	2,
);
const LIDS_N = 700;
const EYE_LIDS = sample(
	[
		Array.from({length: 60}, (_, k) => [150 + (k / 59) * 780, CY - Math.sin((Math.PI * k) / 59) * 230] as Pt),
		Array.from({length: 60}, (_, k) => [150 + (k / 59) * 780, CY + Math.sin((Math.PI * k) / 59) * 230] as Pt),
	],
	LIDS_N,
	2,
);
// íris preenchida: anéis concêntricos (relativos ao centro da íris)
const IRIS: Pt[] = sample(
	Array.from({length: 9}, (_, k) => circlePath(0, 0, 150 - k * 11, 0, TAU, 48)),
	M - LIDS_N,
	3,
);
/** olhar: sacadas rápidas de um lado pro outro */
const gaze = (t: number) => {
	const P = [0, -170, 165, -120, 60, 0];
	const T0 = [0, 0.35, 0.75, 1.15, 1.5, 1.85];
	const lt = t - K.eye;
	let x = P[0];
	for (let k = 1; k < P.length; k++) x = lerp(x, P[k], E_IO(ci(lt, [T0[k], T0[k] + 0.09], [0, 1])));
	return x;
};
// redes: nós fixos + arestas por vizinhança
const mkNet = (n: number, x0: number, x1: number, y0: number, y1: number, seed: string) => {
	const nodes: Pt[] = Array.from({length: n}, (_, k) => [x0 + random(seed + 'x' + k) * (x1 - x0), y0 + random(seed + 'y' + k) * (y1 - y0)]);
	const edges: [number, number][] = [];
	nodes.forEach((p, k) => {
		const near = nodes
			.map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1])] as [number, number])
			.filter(([j]) => j !== k)
			.sort((a, b) => a[1] - b[1])
			.slice(0, 2);
		near.forEach(([j]) => {
			if (!edges.some(([a, b]) => (a === j && b === k) || (a === k && b === j))) edges.push([k, j]);
		});
	});
	return {nodes, edges};
};
export const NET1 = mkNet(14, 200, 880, 480, 1240, 'n1');
/** posição viva de um nó (deriva orgânica) */
export const nodeAt = (net: {nodes: Pt[]}, k: number, t: number): Pt => [
	net.nodes[k][0] + Math.sin(t * 0.9 + k * 1.3) * 34 + Math.sin(t * 0.37 + k) * 16,
	net.nodes[k][1] + Math.cos(t * 0.75 + k * 1.9) * 28,
];
export const NET2 = mkNet(30, 120, 960, 240, 1560, 'n2');
const CLUSTERS: Pt[] = Array.from({length: 46}, (_, k) => [random('cl' + k) * W, random('cl2' + k) * H]);

// ─── tempos (na narração crua → convertidos) ───
export const K = {
	face: 0,
	zoom: rt(2.32),
	me: rt(2.32) + 0.38,
	me2: rt(9.32),
	me3: rt(33.36),
	rep2: rt(34.64),
	galaxy: rt(4.68),
	net: rt(6.2),
	breath: rt(9.32),
	crowd: rt(10.5),
	tunnel: rt(13.37),
	line: rt(15.98),
	bulb: rt(18.06),
	net2: rt(19.8),
	film: rt(22.0),
	mountain: rt(23.51),
	music: rt(25.03),
	talk: rt(25.69),
	eye: rt(26.46),
	galaxy2: rt(28.48),
	face2: rt(30.76),
	rep: rt(33.36),
};
export const END = rt(36.8) + 1.6;


const ambient = (i: number, t: number, o = 0.07): P => {
	const d = R[i];
	return [((d.a * W + Math.sin(t * 0.3 + d.b * 9) * 30) % W + W) % W, ((d.b * H - t * (8 + d.c * 14)) % H + H) % H, 1 + d.c * 1.4, o * (0.5 + 0.5 * Math.sin(t * 2 + d.a * 20))];
};
const outline = (pts: Pt[], i: number, t: number, o = 0.9): P => {
	const d = R[i];
	if (d.perm >= M) return ambient(i, t);
	const [x, y] = pts[d.perm];
	return [x, y + Math.sin(t * 2 + d.a * 6) * 1.5, 1.6 + d.v * 1.6, o * (0.7 + 0.3 * Math.sin(t * 3 + d.b * 20))];
};

const SCALE: Record<string, number> = {galaxy: 1.35, eye: 1.25, mountain: 1.2, film: 1.15, bulb: 1.2, talk: 1.1, music: 1.15};
const form = (name: string, i: number, t: number): P => {
	const p = form0(name, i, t);
	const k = SCALE[name];
	if (!k || (name !== 'galaxy' && R[i].perm >= M)) return p;
	return [CX + (p[0] - CX) * k, CY + (p[1] - CY) * k, p[2] * Math.sqrt(k), p[3]];
};
const form0 = (name: string, i: number, t: number): P => {
	const d = R[i];
	switch (name) {
		case 'scatter':
			return [540 + (d.a - 0.5) * W * 1.1, 760 + (d.b - 0.5) * 1300, 1.8, 0.5];
		case 'face':
			return [180 + d.px * 720, 330 + d.py * 1045 + Math.sin(t * 1.6 + d.py * 5) * 1.5, 1.1 + d.v * 3.9, 0.25 + 0.75 * d.v];
		case 'zoom': {
			// o rosto do Jobs explode em direção à câmera
			const s = 2.9;
			const x = 180 + d.px * 720;
			const y = 330 + d.py * 1045;
			return [540 + (x - 540) * s, 700 + (y - 700) * s, (1.1 + d.v * 3.9) * 2.2, (0.25 + 0.75 * d.v) * 0.45];
		}
		case 'galaxyBig': {
			// a mesma galáxia, só que grande e mais inclinada: a câmera está dentro dela
			const [x, y, r, o] = form('galaxy', i, t);
			return [CX + (x - CX) * 2.3, CY + 40 + (y - CY) * 2.6, r * 1.6, o];
		}
		case 'faceSmall':
			return [540 + (d.px - 0.5) * 430, 250 + d.py * 625, 0.8 + d.v * 2.4, (0.2 + 0.6 * d.v) * 0.5];
		case 'galaxy': {
			const arm = Math.floor(d.a * 3);
			const u = d.b;
			const rr = 30 + Math.pow(u, 0.75) * 500;
			const ang = (arm * TAU) / 3 + u * 4.8 + t * 0.35 + (d.c - 0.5) * 0.5;
			const tilt = 0.42;
			const z = Math.sin(ang);
			const depth = 1 + z * 0.35;
			return [CX + Math.cos(ang) * rr, CY + z * rr * tilt, (1 + (1 - u) * 2.4) * depth, (0.35 + 0.65 * (1 - u)) * (0.6 + 0.4 * depth)];
		}
		case 'net': {
			const net = NET1;
			const {edges} = net;
			const nodes = net.nodes.map((_, q) => nodeAt(net, q, t));
			if (d.perm % 4 === 0) {
				const [a, b] = edges[d.perm % edges.length];
				const u = d.c;
				return [lerp(nodes[a][0], nodes[b][0], u), lerp(nodes[a][1], nodes[b][1], u), 1.1, 0.45];
			}
			const n = nodes[d.perm % nodes.length];
			const rr = Math.pow(d.b, 1.6) * 34;
			const ang = d.a * TAU + t * 0.6;
			return [n[0] + Math.cos(ang) * rr, n[1] + Math.sin(ang) * rr, 1.3 + (1 - d.b) * 2, 0.5 + 0.5 * (1 - d.b)];
		}
		case 'breath': {
			const p = 1 + Math.sin(t * 3) * 0.12;
			const rr = Math.pow(d.b, 2) * 90 * p;
			const ang = d.a * TAU + t * 0.4;
			return [CX + Math.cos(ang) * rr, CY + Math.sin(ang) * rr, 0.8 + (1 - d.b) * 1.8, 0.3 + 0.7 * (1 - d.b)];
		}
		case 'crowd': {
			const k = d.perm % 35;
			const col = k % 5;
			const row = Math.floor(k / 5);
			const ang = d.a * TAU + t * 0.8;
			const cx = 200 + col * 170;
			const cy = 380 + row * 150;
			return [cx + Math.cos(ang) * 44, cy + Math.sin(ang) * 44 * 0.45, 1.3, 0.75];
		}
		case 'tunnel': {
			const k = d.perm % 26;
			const z = (((k / 26 + t * 0.22) % 1) + 1) % 1;
			const rr = 30 + Math.pow(z, 2.4) * 1250;
			const ang = d.a * TAU + t * 0.15;
			const o = ci(z, [0, 0.15], [0, 1]) * ci(z, [0.8, 1], [1, 0]);
			return [CX + Math.cos(ang) * rr, CY + Math.sin(ang) * rr, 0.6 + z * 3.6, o * 0.85];
		}
		case 'line':
			return [140 + (d.perm / N) * 800, CY + Math.sin(d.perm * 0.05 + t * 2) * 3, 1.3, 0.75];
		case 'bulb':
			return outline(BULB, i, t);
		case 'net2': {
			const net = NET2;
			const {edges} = net;
			const nodes = net.nodes.map((_, q) => nodeAt(net, q, t));
			if (d.perm % 3 === 0) {
				const [a, b] = edges[d.perm % edges.length];
				return [lerp(nodes[a][0], nodes[b][0], d.c), lerp(nodes[a][1], nodes[b][1], d.c), 1, 0.35];
			}
			const n = nodes[d.perm % nodes.length];
			const rr = Math.pow(d.b, 1.8) * 26;
			const ang = d.a * TAU + t * 0.7;
			return [n[0] + Math.cos(ang) * rr, n[1] + Math.sin(ang) * rr, 1.1 + (1 - d.b) * 2.2, 0.45 + 0.55 * (1 - d.b)];
		}
		case 'film': {
			const [x, y, r, o] = outline(FILM, i, t);
			if (d.perm >= M) return [x, y, r, o];
			const yy = (((y - 360 + (t - K.film) * 60) % 1000) + 1000) % 1000;
			return [x, yy + 360, r, o * ci(yy, [0, 60], [0, 1]) * ci(yy, [940, 1000], [1, 0])];
		}
		case 'mountain':
			return outline(MOUNTAIN, i, t);
		case 'music': {
			if (d.perm >= M) return ambient(i, t);
			const w = d.perm % 5;
			const x = 130 + (Math.floor(d.perm / 5) / (M / 5)) * 820;
			const env = Math.sin(((x - 130) / 820) * Math.PI);
			const amp = (60 + w * 22) * env;
			const y = CY + (w - 2) * 28 + Math.sin(x * 0.018 + t * (3 + w * 0.6) + w) * amp;
			return [x, y, 1.5, 0.55 + 0.35 * (1 - Math.abs(w - 2) / 2)];
		}
		case 'talk': {
			const p = outline(TALK, i, t);
			if (d.perm >= M || d.perm % 40 !== 0) return p;
			const dot = d.perm % 3;
			const up = Math.max(0, Math.sin(t * 6 - dot * 0.8)) * 10;
			return [630 + dot * 50 + (d.a - 0.5) * 12, 1100 - up + (d.b - 0.5) * 12, 2.2, 0.95];
		}
		case 'eye': {
			if (d.perm >= M) return ambient(i, t);
			const blink = 1 - Math.pow(Math.max(0, Math.sin((t - K.eye) * 1.6 - 1.2)), 40) * 0.9;
			if (d.perm < LIDS_N) {
				const [x, y] = EYE_LIDS[d.perm];
				return [x, CY + (y - CY) * blink, 1.6 + d.v * 1.4, 0.85];
			}
			const [ix, iy] = IRIS[d.perm - LIDS_N];
			const gx = gaze(t);
			// íris cheia de pontos; pupila escura no centro
			const rr = Math.hypot(ix, iy);
			const pupil = rr < 58 ? 0 : 1;
			const lid = 230 * Math.sin(Math.PI * ci(CX + gx + ix, [150, 930], [0, 1]));
			const inside = Math.abs(iy) > lid - 6 ? 0 : 1; // íris não passa da pálpebra
			return [CX + gx + ix, CY + iy * blink, 1.4 + (rr / 150) * 1.6, 0.9 * pupil * inside];
		}
		case 'rep': {
			const cl = CLUSTERS[d.perm % CLUSTERS.length];
			const grow = 1 + (t - K.me3) * 0.08;
			const rr = Math.pow(d.b, 1.7) * 38;
			const ang = d.a * TAU + t * 0.5;
			const x = CX + (cl[0] - CX) * grow + Math.cos(ang) * rr;
			const y = CY + (cl[1] - CY) * grow + Math.sin(ang) * rr;
			return [x, y, 0.9 + (1 - d.b) * 2.4, (0.3 + 0.7 * (1 - d.b)) * ci(t, [rt(35.27), rt(36.3)], [0.75, 1])];
		}
		default:
			return [CX, CY, 1, 0];
	}
};

const KEYS: {t: number; f: string; dur: number; spread: number}[] = [
	{t: -1, f: 'scatter', dur: 0.1, spread: 0},
	{t: 0, f: 'face', dur: 0.9, spread: 0.4},
	{t: K.zoom, f: 'zoom', dur: 0.4, spread: 0.08},
	{t: K.me, f: 'galaxyBig', dur: 1.0, spread: 0.4},
	{t: K.galaxy, f: 'galaxy', dur: 1.4, spread: 0.5},
	{t: K.net, f: 'net', dur: 1.1, spread: 0.5},
	{t: K.me2, f: 'breath', dur: 0.9, spread: 0.4},
	{t: K.crowd, f: 'crowd', dur: 0.9, spread: 0.4},
	{t: K.tunnel, f: 'tunnel', dur: 1.0, spread: 0.4},
	{t: K.line, f: 'line', dur: 0.9, spread: 0.4},
	{t: K.bulb, f: 'bulb', dur: 1.0, spread: 0.4},
	{t: K.net2, f: 'net2', dur: 1.0, spread: 0.5},
	{t: K.film, f: 'film', dur: 0.6, spread: 0.2},
	{t: K.mountain, f: 'mountain', dur: 0.6, spread: 0.2},
	{t: K.music, f: 'music', dur: 0.4, spread: 0.12},
	{t: K.talk, f: 'talk', dur: 0.4, spread: 0.12},
	{t: K.eye, f: 'eye', dur: 0.55, spread: 0.2},
	{t: K.galaxy2, f: 'galaxy', dur: 1.1, spread: 0.5},
	{t: K.face2, f: 'face', dur: 1.2, spread: 0.5},
	{t: K.me3, f: 'rep', dur: 1.3, spread: 0.6},
];

// janelas de visibilidade das linhas de conexão
const netLines = (t: number) => [
	{net: NET1, o: ci(t, [K.net + 0.6, K.net + 1.4], [0, 1]) * ci(t, [K.me2 - 0.1, K.me2 + 0.3], [1, 0])},
	{net: NET2, o: ci(t, [K.net2 + 0.5, K.net2 + 1.5], [0, 1]) * ci(t, [K.film - 0.1, K.film + 0.3], [1, 0])},
];

export const Particles: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	let k = 0;
	for (let j = 0; j < KEYS.length; j++) if (t >= KEYS[j].t) k = j;
	const cur = KEYS[k];
	const prev = KEYS[Math.max(0, k - 1)];
	const fade = ci(t, [END - 1.0, END], [1, 0]);
	const circles: React.ReactNode[] = [];
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
		circles.push(<circle key={i} cx={x} cy={y} r={r} fill={C.ink} opacity={o * fade} />);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{netLines(t).map(({net, o}, n) =>
				o > 0
					? net.edges.map(([a, b], e) => {
							const A = nodeAt(net, a, t);
							const B = nodeAt(net, b, t);
							const u = (((t * 0.55 + e * 0.37) % 1) + 1) % 1;
							return (
								<g key={n + '-' + e}>
									<line x1={A[0]} y1={A[1]} x2={lerp(A[0], B[0], o)} y2={lerp(A[1], B[1], o)} stroke={C.ink} strokeWidth={1} opacity={0.35 * o * ci(e, [0, net.edges.length], [1, 0.5])} />
									<circle cx={lerp(A[0], B[0], u)} cy={lerp(A[1], B[1], u)} r={2.6} fill={C.ink} opacity={o * Math.sin(Math.PI * u) * 0.9} />
								</g>
							);
						})
					: null,
			)}
			{circles}
			{(() => {
				const eo = ci(t, [K.eye + 0.3, K.eye + 0.6], [0, 1]) * ci(t, [K.galaxy2 - 0.1, K.galaxy2 + 0.2], [1, 0]);
				if (eo <= 0) return null;
				const gx = gaze(t);
				return (
					<g opacity={eo}>
						<ellipse cx={CX + (gx - 52) * 1.25} cy={CY - 62} rx={37} ry={30} fill={C.ink} />
						<circle cx={CX + (gx + 40) * 1.25} cy={CY + 52} r={11} fill={C.ink} opacity={0.85} />
					</g>
				);
			})()}
		</svg>
	);
};

// fundo: preto + brilho central + grão (nada nas extremidades)
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
export const Background: React.FC = () => {
	const f = useCurrentFrame();
	const g = Math.floor(f / 2);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 50% at 50% 45%, rgba(242,240,235,0.06) 0%, transparent 70%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)'}} />
			<AbsoluteFill
				style={{
					backgroundImage: NOISE,
					backgroundSize: '256px 256px',
					backgroundPosition: `${Math.floor(random('nx' + g) * 256)}px ${Math.floor(random('ny' + g) * 256)}px`,
					opacity: 0.1,
					mixBlendMode: 'overlay',
				}}
			/>
		</AbsoluteFill>
	);
};
