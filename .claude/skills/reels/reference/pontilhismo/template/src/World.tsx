import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {ci, E_IO, INK, lerp, TAU, W, H} from './kit';
import RETRATO from './data/retrato.json';

// ═══════════ MUNDO 3D DE PONTOS ═══════════
// Um único conjunto de N pontos atravessa o vídeo inteiro e MORFA de uma forma para outra.
// Cada forma devolve, para o ponto i no tempo t: [x, y, z, raio, opacidade] em coordenadas do mundo
// (origem no centro da tela). Uma câmera única projeta tudo — órbita, aproximação, mergulho.
//
// COMO USAR:
//   1. Crie formas em FORMAS (cada ideia do roteiro = uma forma).
//   2. Liste a sequência em CHAVES (tempo de início de cada forma, duração do morph, espalhamento).
//   3. Movimente a câmera em CAMERAS.
export const N = 5000;
type P5 = [number, number, number, number, number];
const SX = W / 2;
const SY = 880; // centro visual um pouco acima do meio (a legenda fica embaixo)

const R = Array.from({length: N}, (_, i) => ({a: random('a' + i), b: random('b' + i), c: random('c' + i), dl: random('d' + i)}));

// ─── tempos-chave (segundos da narração final) ───
export const K = {
	retrato: 0,
	esfera: 3,
	anel: 6,
	fim: 9,
};
export const END = 10;

// ═══════════ CÂMERA ═══════════
type Cam = {yaw: number; pitch: number; dist: number; x: number; y: number};
const FOCAL = 1400;
const CAMERAS: {t: number; c: Cam; d?: number}[] = [
	{t: 0, c: {yaw: 0, pitch: 0, dist: 1500, x: 0, y: 0}},
	{t: 1, c: {yaw: 0.06, pitch: 0, dist: 1320, x: 0, y: 0}, d: 1.6}, // aproximação lenta no retrato
	{t: K.esfera, c: {yaw: -0.5, pitch: 0.3, dist: 1600, x: 0, y: 0}, d: 0.9},
	{t: K.esfera + 0.9, c: {yaw: 0.5, pitch: 0.25, dist: 1400, x: 0, y: 0}, d: 2.0}, // órbita
	{t: K.anel, c: {yaw: 0, pitch: 0.9, dist: 1700, x: 0, y: 0}, d: 1.0}, // vista de cima
	{t: K.fim, c: {yaw: 0, pitch: 0, dist: 60, x: 0, y: 0}, d: 1.0}, // mergulho no centro (fecha em preto → loop)
];
export const camAt = (t: number): Cam => {
	let k = 0;
	for (let j = 0; j < CAMERAS.length; j++) if (t >= CAMERAS[j].t) k = j;
	const a = CAMERAS[Math.max(0, k - 1)].c;
	const b = CAMERAS[k];
	const m = k === 0 ? 1 : E_IO(ci(t, [b.t, b.t + (b.d ?? 0.8)], [0, 1]));
	const c = {} as Cam;
	(Object.keys(b.c) as (keyof Cam)[]).forEach((key) => (c[key] = lerp(a[key], b.c[key], m)));
	c.yaw += Math.sin(t * 0.35) * 0.02; // a câmera nunca fica 100% parada
	c.pitch += Math.sin(t * 0.27) * 0.012;
	return c;
};
export const project = (x: number, y: number, z: number, c: Cam): [number, number, number] => {
	x -= c.x;
	y -= c.y;
	const x1 = x * Math.cos(c.yaw) + z * Math.sin(c.yaw);
	const z1 = -x * Math.sin(c.yaw) + z * Math.cos(c.yaw);
	const y1 = y * Math.cos(c.pitch) - z1 * Math.sin(c.pitch);
	const z2 = y * Math.sin(c.pitch) + z1 * Math.cos(c.pitch);
	const zz = z2 + c.dist;
	if (zz < 30) return [0, 0, -1];
	const s = FOCAL / zz;
	return [SX + x1 * s, SY + y1 * s, s];
};

// ═══════════ FORMAS ═══════════
const ambiente = (i: number, t: number, o = 0.05): P5 => {
	const d = R[i];
	return [(d.a - 0.5) * 2600, (d.b - 0.5) * 3600, (d.c - 0.5) * 2400 + Math.sin(t * 0.2 + d.a * 9) * 40, 1, o];
};
const RT = RETRATO as number[][];

const FORMAS: Record<string, (i: number, t: number) => P5> = {
	/** nuvem inicial (os pontos nascem dela) */
	nuvem: (i) => {
		const d = R[i];
		return [(d.a - 0.5) * 900, (d.b - 0.5) * 1200, (d.c - 0.5) * 800, 1.4, 0.4];
	},
	/** retrato em pontilhismo (gerado com scripts/imagem-para-pontos.mjs) */
	retrato: (i, t) => {
		if (i >= RT.length) return ambiente(i, t);
		const [px, py, v] = RT[i];
		return [(px - 0.5) * 760, (py - 0.5) * 1000, 0, 0.9 + v * 3.2, 0.2 + 0.8 * v];
	},
	/** esfera 3D girando (exemplo de forma volumétrica) */
	esfera: (i, t) => {
		const d = R[i];
		const u = d.a * 2 - 1;
		const th = d.b * TAU + t * 0.4;
		const r = 320;
		const s = Math.sqrt(1 - u * u);
		return [Math.cos(th) * s * r, u * r, Math.sin(th) * s * r, 1.3, 0.8];
	},
	/** anel/órbita (exemplo de forma que a câmera vê de cima) */
	anel: (i, t) => {
		const d = R[i];
		const a = d.a * TAU + t * 0.3;
		const r = 380 + (d.b - 0.5) * 60;
		return [Math.cos(a) * r, (d.c - 0.5) * 20, Math.sin(a) * r, 1.4, 0.8];
	},
};

// sequência de formas: quando cada uma começa, quanto dura o morph e o espalhamento (atraso aleatório por ponto)
const CHAVES: {t: number; f: string; dur: number; spread: number}[] = [
	{t: -1, f: 'nuvem', dur: 0.1, spread: 0},
	{t: K.retrato, f: 'retrato', dur: 0.6, spread: 0.25}, // rosto forma em < 1 s
	{t: K.esfera, f: 'esfera', dur: 0.8, spread: 0.3},
	{t: K.anel, f: 'anel', dur: 0.8, spread: 0.3},
];

export const World: React.FC = () => {
	const t = useCurrentFrame() / 30;
	const cam = camAt(t);
	let k = 0;
	for (let j = 0; j < CHAVES.length; j++) if (t >= CHAVES[j].t) k = j;
	const cur = CHAVES[k];
	const prev = CHAVES[Math.max(0, k - 1)];
	const fade = ci(t, [END - 0.7, END - 0.2], [1, 0]);
	const out: React.ReactNode[] = [];
	for (let i = 0; i < N; i++) {
		const m = E_IO(ci(t - cur.t - R[i].dl * cur.spread, [0, cur.dur], [0, 1]));
		let p: P5;
		if (m >= 1) p = FORMAS[cur.f](i, t);
		else {
			const a = FORMAS[prev.f](i, t);
			const b = FORMAS[cur.f](i, t);
			p = a.map((v, j) => lerp(v, b[j], m)) as P5;
		}
		if (p[4] * fade < 0.02) continue;
		const [x, y, s] = project(p[0], p[1], p[2], cam);
		if (s <= 0 || x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
		out.push(<circle key={i} cx={x} cy={y} r={Math.min(9, p[3] * s)} fill={INK} opacity={p[4] * fade * ci(s, [0.25, 0.7], [0.35, 1])} />);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{out}
		</svg>
	);
};
