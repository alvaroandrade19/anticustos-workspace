import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C, ci, E_IO, lerp} from './kit';
import TESLA from './data/tesla.json';

// ═══════════ MUNDO 3D DE PONTOS + CÂMERA ═══════════
// Todas as formas vivem num espaço 3D (origem no centro da tela); uma câmera única
// orbita, aproxima e atravessa. As partículas são sempre as mesmas: morfam entre ideias.
export const W = 1080;
export const H = 1920;
const SX = 540;
const SY = 880;
const TAU = Math.PI * 2;
const N = 6000;
type P5 = [number, number, number, number, number]; // x y z raio opacidade
type Pt = [number, number];

const R = Array.from({length: N}, (_, i) => ({a: random('a' + i), b: random('b' + i), c: random('c' + i), dl: random('d' + i)}));

// ─── tempos (s) — narração e palavras já alinhadas ───
export const K = {
	portrait: 0,
	lamp: 1.24,
	lab: 3.16,
	head: 4.54,
	motor: 6.08,
	explode: 7.84,
	run: 8.86,
	alter: 9.97,
	coil: 12.02,
	today: 13.92,
	time: 16.38,
	gap: 17.67,
	absurd: 22.04,
	fall: 23.72,
	close: 26.22,
	describe: 27.85,
	head2: 30.28,
	exist: 32.06,
	eye: 34.04,
	see: 38.16,
};
export const END = 41.55;

// ═══════════ CÂMERA ═══════════
type Cam = {yaw: number; pitch: number; dist: number; x: number; y: number; roll: number};
const F = 1400;
const CAMS: {t: number; c: Cam; d?: number}[] = [
	{t: 0, c: {yaw: 0, pitch: 0, dist: 1500, x: 0, y: 0, roll: 0}},
	{t: 1.2, c: {yaw: 0.06, pitch: 0, dist: 1320, x: 0, y: 0, roll: 0}, d: 1.2},
	{t: K.head, c: {yaw: 0, pitch: 0, dist: 1400, x: 0, y: 0, roll: 0}, d: 0.6},
	{t: K.head + 0.5, c: {yaw: 0, pitch: 0, dist: 520, x: 90, y: -120, roll: 0}, d: 1.1},
	{t: K.motor, c: {yaw: -0.55, pitch: 0.35, dist: 1500, x: 0, y: 0, roll: 0}, d: 0.9},
	{t: K.motor + 0.9, c: {yaw: 0.35, pitch: 0.25, dist: 1350, x: 0, y: 0, roll: 0}, d: 0.9},
	{t: K.explode, c: {yaw: 1.15, pitch: 0.22, dist: 2300, x: 0, y: 0, roll: 0.05}, d: 0.9},
	{t: K.run, c: {yaw: 0.12, pitch: 0.08, dist: 1150, x: 0, y: 0, roll: 0}, d: 0.8},
	{t: K.alter, c: {yaw: 0.95, pitch: 0.3, dist: 2000, x: 0, y: 0, roll: 0}, d: 0.9},
	{t: K.today, c: {yaw: 0, pitch: 0, dist: 1400, x: 0, y: 0, roll: 0}, d: 0.5},
	{t: K.gap, c: {yaw: 0, pitch: 0.95, dist: 1900, x: 0, y: 0, roll: 0}, d: 1.0},
	{t: K.absurd, c: {yaw: -0.25, pitch: 0.8, dist: 1500, x: -200, y: 0, roll: 0}, d: 0.8},
	{t: K.fall, c: {yaw: 0.15, pitch: 0.55, dist: 1600, x: 0, y: 80, roll: 0}, d: 0.8},
	{t: K.close, c: {yaw: 0, pitch: 0.9, dist: 1800, x: 0, y: 0, roll: 0}, d: 0.8},
	{t: K.describe, c: {yaw: 0, pitch: 0, dist: 1400, x: 0, y: 0, roll: 0}, d: 0.6},
	{t: K.head2, c: {yaw: 0, pitch: 0, dist: 1500, x: 0, y: 0, roll: 0}, d: 0.6},
	{t: K.exist, c: {yaw: -0.8, pitch: 0.3, dist: 1700, x: 0, y: 0, roll: 0}, d: 0.8},
	{t: K.exist + 0.8, c: {yaw: 0.9, pitch: 0.25, dist: 1450, x: 0, y: 0, roll: 0}, d: 1.6},
	{t: K.eye, c: {yaw: 0, pitch: 0, dist: 1500, x: 0, y: 0, roll: 0}, d: 0.7},
	{t: K.see, c: {yaw: 0, pitch: 0, dist: 1100, x: 0, y: 0, roll: 0}, d: 0.9},
	{t: K.see + 0.9, c: {yaw: 0, pitch: 0, dist: 40, x: 0, y: 0, roll: 0}, d: 2.2},
];
export const camAt = (t: number): Cam => {
	let k = 0;
	for (let j = 0; j < CAMS.length; j++) if (t >= CAMS[j].t) k = j;
	const a = CAMS[Math.max(0, k - 1)].c;
	const b = CAMS[k];
	const m = k === 0 ? 1 : E_IO(ci(t, [b.t, b.t + (b.d ?? 0.8)], [0, 1]));
	const c = {} as Cam;
	(Object.keys(b.c) as (keyof Cam)[]).forEach((key) => (c[key] = lerp(a[key], b.c[key], m)));
	// respiração de câmera (nunca 100% parada)
	c.yaw += Math.sin(t * 0.35) * 0.02;
	c.pitch += Math.sin(t * 0.27) * 0.012;
	return c;
};
export const project = (x: number, y: number, z: number, c: Cam): [number, number, number] => {
	x -= c.x;
	y -= c.y;
	const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
	const x1 = x * cy + z * sy;
	const z1 = -x * sy + z * cy;
	const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
	const y1 = y * cp - z1 * sp;
	const z2 = y * sp + z1 * cp;
	const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
	const x2 = x1 * cr - y1 * sr;
	const y2 = x1 * sr + y1 * cr;
	const zz = z2 + c.dist;
	if (zz < 30) return [0, 0, -1];
	const s = F / zz;
	return [SX + x2 * s, SY + y2 * s, s];
};

// ═══════════ FORMAS ═══════════
const T = TESLA as number[][];
const portrait = (i: number, t: number): P5 => {
	if (i >= T.length) return ambient(i, t);
	const [px, py, v] = T[i];
	return [(px - 0.5) * 760, (py - 0.5) * 1000 - 20, 0, 0.9 + v * 3.2, 0.2 + 0.8 * v];
};
const ambient = (i: number, t: number, o = 0.05): P5 => {
	const d = R[i];
	return [(d.a - 0.5) * 2600, (d.b - 0.5) * 3600, (d.c - 0.5) * 2400 + Math.sin(t * 0.2 + d.a * 9) * 40, 1, o];
};

// cabeça de perfil (silhueta desenhada)
const HEAD_PATH: Pt[] = [
	[-40, -420], [60, -440], [170, -410], [260, -330], [310, -220], [320, -110], [305, -40], [355, 40], [335, 70], [315, 90], [325, 130], [305, 160], [315, 200], [290, 240], [240, 260], [205, 300], [200, 380], [60, 400], [-80, 390], [-150, 300], [-240, 240], [-300, 120], [-320, -20], [-300, -170], [-230, -300], [-140, -390], [-40, -420],
];
const sampleClosed = (path: Pt[], n: number): Pt[] => {
	const seg: number[] = [];
	let tot = 0;
	for (let k = 1; k < path.length; k++) {
		const l = Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]);
		seg.push(l);
		tot += l;
	}
	const out: Pt[] = [];
	let si = 0, acc = 0;
	for (let k = 0; k < n; k++) {
		const d = (k / n) * tot;
		while (si < seg.length - 1 && acc + seg[si] < d) acc += seg[si++];
		const u = (d - acc) / seg[si];
		out.push([lerp(path[si][0], path[si + 1][0], u), lerp(path[si][1], path[si + 1][1], u)]);
	}
	return out;
};
const HEAD = sampleClosed(HEAD_PATH, 2200);
const head = (i: number, t: number, glow = 1): P5 => {
	const d = R[i];
	if (i < HEAD.length) {
		const [x, y] = HEAD[i];
		return [x * 1.1, y * 1.1 - 40, (d.c - 0.5) * 12, 1.4 + d.a * 1.2, 0.85];
	}
	if (i < 3600) {
		// "a mente": uma névoa de pontos dentro do crânio, pulsando
		const a = d.a * TAU;
		const r = Math.sqrt(d.b) * 190 * (1 + Math.sin(t * 2.4 + d.c * 6) * 0.05);
		return [20 + Math.cos(a) * r, -150 + Math.sin(a) * r * 0.85, (d.c - 0.5) * 80, 0.9 + d.c, 0.35 * glow];
	}
	return ambient(i, t);
};

// ─── MOTOR DE INDUÇÃO (a invenção real de Tesla) ───
// peças: estator (carcaça), bobinas, rotor em gaiola, anéis do rotor, eixo, tampas, campo girante
type MotorState = {explode: number; spin: number; field: number; rotorOut: number; skew: number; scale: number; y: number; z: number};
const RANGES = {stator: [0, 1500], coils: [1500, 2500], bars: [2500, 3700], rings: [3700, 4100], shaft: [4100, 4400], caps: [4400, 5200], field: [5200, 5800]};
const inR = (i: number, r: number[]) => i >= r[0] && i < r[1];
const u01 = (i: number, r: number[]) => (i - r[0]) / (r[1] - r[0]);
export const motor = (i: number, t: number, s: MotorState): P5 => {
	const d = R[i];
	const L = 300; // meio comprimento
	let x = 0, y = 0, z = 0, r = 1.5, o = 0.85;
	if (inR(i, RANGES.stator)) {
		// casca cilíndrica com aletas
		const a = d.a * TAU;
		const rr = 330 + (Math.floor(d.b * 24) % 2 ? 0 : 14);
		x = Math.cos(a) * rr;
		y = Math.sin(a) * rr;
		z = (d.c - 0.5) * 2 * L;
		o = 0.55;
	} else if (inR(i, RANGES.coils)) {
		// 6 bobinas (polos) no interior do estator — afastam-se na vista explodida
		const k = Math.floor(u01(i, RANGES.coils) * 6);
		const a0 = (k / 6) * TAU;
		const loopA = d.a * TAU;
		const cr = 250 + s.explode * 260;
		const px = Math.cos(loopA) * 55;
		const pz = Math.sin(loopA) * 230;
		x = Math.cos(a0) * cr - Math.sin(a0) * px;
		y = Math.sin(a0) * cr + Math.cos(a0) * px;
		z = pz + (d.b - 0.5) * 16;
		r = 1.6;
		o = 0.95;
	} else if (inR(i, RANGES.bars)) {
		// rotor em gaiola: 16 barras (inclinam quando alterado)
		const k = Math.floor(u01(i, RANGES.bars) * 16);
		const zz = (d.a - 0.5) * 2 * (L - 30);
		const a = (k / 16) * TAU + s.spin + (zz / L) * s.skew;
		const rr = 170;
		x = Math.cos(a) * rr;
		y = Math.sin(a) * rr;
		z = zz + s.rotorOut + s.explode * 520;
		r = 1.5;
		o = 0.9;
	} else if (inR(i, RANGES.rings)) {
		const a = d.a * TAU + s.spin;
		const side = d.b > 0.5 ? 1 : -1;
		x = Math.cos(a) * 172;
		y = Math.sin(a) * 172;
		z = side * (L - 30) + s.rotorOut + s.explode * 520;
		o = 0.9;
	} else if (inR(i, RANGES.shaft)) {
		const a = d.a * TAU;
		x = Math.cos(a) * 26;
		y = Math.sin(a) * 26;
		z = (d.b - 0.5) * 2 * (L + 260) + s.rotorOut + s.explode * 820;
		r = 1.3;
		o = 0.8;
	} else if (inR(i, RANGES.caps)) {
		// tampas nas extremidades
		const side = d.c > 0.5 ? 1 : -1;
		const a = d.a * TAU;
		const rr = Math.sqrt(d.b) * 330;
		x = Math.cos(a) * rr;
		y = Math.sin(a) * rr;
		z = side * (L + 10 + s.explode * 420);
		o = 0.3 + 0.4 * (rr / 330);
	} else if (inR(i, RANGES.field)) {
		// campo magnético girante entre estator e rotor
		const a = d.a * TAU + t * 7.5;
		const rr = 235 + Math.sin(d.a * TAU * 3 - t * 7.5) * 18;
		x = Math.cos(a) * rr;
		y = Math.sin(a) * rr;
		z = (d.b - 0.5) * 2 * L;
		r = 1.8;
		o = s.field * (0.35 + 0.65 * Math.pow(Math.max(0, Math.cos(d.a * TAU * 2 - t * 7.5)), 4));
	} else return ambient(i, t);
	return [x * s.scale, y * s.scale + s.y, z * s.scale + s.z, r * Math.sqrt(s.scale), o];
};
const M0: MotorState = {explode: 0, spin: 0, field: 0, rotorOut: 0, skew: 0, scale: 1, y: 0, z: 0};

// ─── tempo: túnel ───
const tunnel = (i: number, t: number): P5 => {
	const d = R[i];
	const k = i % 30;
	const z = (((k / 30 + (t - K.today) * 0.45) % 1) + 1) % 1;
	const a = d.a * TAU;
	return [Math.cos(a) * 420, Math.sin(a) * 420, 2600 - z * 3600, 1.4, ci(z, [0, 0.2], [0, 0.8]) * ci(z, [0.8, 0.95], [1, 0])];
};
// ─── ampulheta ───
const hourglass = (i: number, t: number): P5 => {
	const d = R[i];
	const lt = t - K.time;
	if (i < 1400) {
		// contorno do vidro
		const u = i / 1400;
		const side = u < 0.5 ? -1 : 1;
		const v = (u % 0.5) * 2;
		const yy = (v - 0.5) * 760;
		const w = 40 + Math.pow(Math.abs(yy) / 380, 1.6) * 240;
		const a = d.a * TAU;
		return [side * w * (0.6 + 0.4 * Math.abs(Math.cos(a))), yy, Math.sin(a) * w * 0.3, 1.2, 0.6];
	}
	if (i < 3400) {
		// areia: cai do bulbo de cima para o de baixo
		const q = (i - 1400) / 2000;
		const fallen = q < ci(lt, [0, 1.6], [0.15, 0.6]);
		const a = d.a * TAU;
		if (fallen) {
			const h = Math.sqrt(d.b) * 160;
			return [Math.cos(a) * (1 - h / 180) * 220 * d.c, 380 - h, Math.sin(a) * 40, 1.3, 0.85];
		}
		const h = Math.sqrt(d.b) * 150;
		return [Math.cos(a) * (h / 160) * 210 * d.c, -60 - h, Math.sin(a) * 40, 1.3, 0.85];
	}
	if (i < 3600) {
		// fio de areia caindo
		const y = ((((i - 3400) / 200 + lt * 1.8) % 1) + 1) % 1;
		return [(d.a - 0.5) * 4, -40 + y * 400, 0, 1.2, 0.9];
	}
	return ambient(i, t);
};
// ─── as duas margens: imaginar × executar ───
export const ISLE = (gap: number) => ({L: -260 - gap / 2, R: 260 + gap / 2});
const XS = 0.5;
const isles = (i: number, t: number, gap: number, swell: number, bridge: number): P5 => {
	const p = isles0(i, t, gap, swell, bridge);
	return i < 4400 ? [p[0] * XS, p[1] * 0.8, p[2] * XS, p[3], p[4]] : p;
};
const isles0 = (i: number, t: number, gap: number, swell: number, bridge: number): P5 => {
	const d = R[i];
	const S = ISLE(gap);
	if (i < 1800) {
		// margem esquerda: plataforma + nuvem da ideia
		if (i < 900) {
			const x = S.L - 520 + d.a * 520;
			const z = (d.b - 0.5) * 900;
			return [x, 120, z, 1.3, 0.55];
		}
		const a = d.a * TAU;
		const phi = Math.acos(2 * d.b - 1);
		const rr = (140 + swell * 220) * Math.cbrt(d.c);
		return [S.L - 260 + Math.sin(phi) * Math.cos(a) * rr, -120 - swell * 120 + Math.cos(phi) * rr, Math.sin(phi) * Math.sin(a) * rr, 1.2 + swell, 0.8];
	}
	if (i < 3600) {
		// margem direita: plataforma + blocos (execução)
		if (i < 2700) {
			const x = S.R + d.a * 520;
			const z = (d.b - 0.5) * 900;
			return [x, 120, z, 1.3, 0.55];
		}
		const k = (i - 2700) % 6;
		const bx = S.R + 120 + (k % 3) * 120;
		const by = 60 - Math.floor(k / 3) * 120;
		const e = Math.floor(d.a * 3);
		const u = d.b;
		const edges: [number, number, number][] = [[bx + u * 100, by, 0], [bx, by - u * 100, 0], [bx + u * 100, by - 100, 0], [bx + 100, by - u * 100, 0]];
		const [x, y] = edges[Math.floor(d.c * 4)];
		return [x, y, (e - 1) * 50, 1.4, 0.85];
	}
	if (i < 4400) {
		// a ponte (só aparece quando a distância diminui)
		const u = (i - 3600) / 800;
		const x = lerp(S.L, S.R, u);
		const sag = Math.sin(u * Math.PI) * 40 * (1 - bridge);
		return [x, 120 + sag, (d.a - 0.5) * 220, 1.3, bridge * 0.9];
	}
	return ambient(i, t, 0.04);
};
// pontos tentando atravessar e caindo no abismo
const fallers = (i: number, t: number, gap: number): P5 => {
	const d = R[i];
	if (i < 4400 || i >= 5200) return isles(i, t, gap, 0.35, 0);
	const S = ISLE(gap);
	const cyc = (((t - K.fall) * 0.7 + d.a) % 1 + 1) % 1;
	const x = lerp(S.L, S.R, cyc * 0.75);
	const y = 60 - Math.sin(Math.min(cyc, 0.5) * Math.PI) * 120 + Math.max(0, cyc - 0.5) ** 2 * 3200;
	return [x * XS, y * 0.8, (d.b - 0.5) * 150, 1.8, 0.9 * ci(cyc, [0.85, 1], [1, 0])];
};
// ─── o olho (vivo: pisca, olha, a íris respira, a pupila dilata) ───
const blinkAt = (lt: number) => {
	// piscadas rápidas em momentos naturais
	let c = 0;
	for (const b of [1.15, 3.35]) c = Math.max(c, Math.sin(Math.PI * ci(lt, [b, b + 0.24], [0, 1])));
	return 1 - c * 0.96;
};
const gazeAt = (lt: number) => {
	const P = [0, -38, 30, -12, 0];
	const T0 = [0, 0.7, 1.7, 2.5, 3.8];
	let x = 0;
	for (let k = 1; k < P.length; k++) x = lerp(x, P[k], E_IO(ci(lt, [T0[k], T0[k] + 0.14], [0, 1])));
	return x;
};
export const eyeState = (t: number) => {
	const lt = t - K.eye;
	return {lt, open: ci(lt, [0, 0.6], [0.05, 1]) * blinkAt(lt), gx: gazeAt(lt), pupil: 92 + E_IO(ci(t, [K.see, K.see + 0.8], [0, 1])) * 40 + Math.sin(lt * 1.3) * 4};
};
const eye = (i: number, t: number): P5 => {
	const d = R[i];
	const {lt, open, gx, pupil} = eyeState(t);
	const EW = 760; // meia largura (passa da tela)
	if (i < 2200) {
		// pálpebras: faixas soltas de pontos
		const top = i < 1100;
		const u = d.a;
		const x = (u - 0.5) * 2 * EW;
		const band = (Math.pow(d.b, 2) - 0.1) * 46 * (0.4 + Math.sin(u * Math.PI));
		const h = Math.sin(u * Math.PI) * 330;
		const y = (top ? -1 : 1) * (h * (top ? open : 0.25 + 0.75 * open) - band);
		return [x, y, (d.c - 0.5) * 30, 0.9 + d.c * 1.3, (0.35 + 0.55 * (1 - d.b)) * ci(Math.abs(u - 0.5), [0.42, 0.5], [1, 0.3])];
	}
	if (i < 5600) {
		// íris: fibras radiais que giram devagar e respiram
		const fib = Math.floor(d.a * 110);
		const a = (fib / 110) * TAU + (d.c - 0.5) * 0.05 + lt * 0.06;
		const inner = pupil + 6;
		const outer = 270;
		const r = inner + Math.pow(d.b, 0.8) * (outer - inner) * (1 + Math.sin(lt * 2 + fib) * 0.015);
		const x = gx + Math.cos(a) * r;
		const y = Math.sin(a) * r;
		// a íris é cortada pelas pálpebras
		const lid = Math.sin(ci(x, [-EW, EW], [0, Math.PI])) * 330;
		const inside = Math.abs(y) < lid * open - 6 ? 1 : 0;
		const bright = 0.35 + 0.6 * Math.pow(Math.max(0, Math.sin(fib * 1.7 + lt * 0.8)), 2) * (0.5 + d.b * 0.5);
		const rim = r > outer - 18 ? 1.4 : 1;
		return [x, y, 0, 1.1 + d.b * 1.1, bright * rim * inside];
	}
	if (i < 5760) {
		// reflexo de luz na córnea
		const a = d.a * TAU;
		const r = Math.sqrt(d.b) * 26;
		return [gx - 95 + Math.cos(a) * r, -110 + Math.sin(a) * r * open, 0, 1.6, open > 0.3 ? 0.95 : 0];
	}
	return ambient(i, t);
};

const form = (name: string, i: number, t: number): P5 => {
	switch (name) {
		case 'scatter': {
			const d = R[i];
			return [(d.a - 0.5) * 900, (d.b - 0.5) * 1200, (d.c - 0.5) * 800, 1.4, 0.4];
		}
		case 'portrait':
			return portrait(i, t);
		case 'frame':
			return ambient(i, t, 0.08);
		case 'head':
			return head(i, t);
		case 'motorInHead': {
			if (i < HEAD.length) {
				const h = head(i, t);
				return [h[0], h[1], h[2], h[3], 0.35];
			}
			return motor(i, t, {...M0, spin: t * 0.6, scale: 0.42, y: -150});
		}
		case 'motor':
			return motor(i, t, {...M0, spin: t * 0.5});
		case 'explode': {
			const e = E_IO(ci(t, [K.explode, K.explode + 0.7], [0, 1]));
			return motor(i, t, {...M0, explode: e, spin: t * 0.3});
		}
		case 'run': {
			const e = 1 - E_IO(ci(t, [K.run, K.run + 0.5], [0, 1]));
			const sp = Math.pow(ci(t, [K.run + 0.3, K.alter], [0, 1]), 2) * 22;
			return motor(i, t, {...M0, explode: e, spin: sp, field: ci(t, [K.run + 0.3, K.run + 0.7], [0, 1])});
		}
		case 'alter': {
			const lt = t - K.alter;
			const out = E_IO(ci(lt, [0, 0.6], [0, 1])) * (1 - E_IO(ci(lt, [1.4, 1.95], [0, 1])));
			const skew = E_IO(ci(lt, [0.6, 1.2], [0, 1])) * 0.9;
			return motor(i, t, {...M0, rotorOut: out * 760, skew, spin: t * 2, field: 1 - out});
		}
		case 'today':
			return tunnel(i, t);
		case 'time':
			return hourglass(i, t);
		case 'gap':
			return isles(i, t, 700, 0, 0);
		case 'absurd':
			return isles(i, t, 700, E_IO(ci(t, [K.absurd, K.absurd + 1.2], [0, 1])), 0);
		case 'fall':
			return fallers(i, t, 700);
		case 'close': {
			const g = lerp(700, 40, E_IO(ci(t, [K.close, K.close + 1.3], [0, 1])));
			return isles(i, t, g, 0.35, ci(t, [K.close + 0.9, K.close + 1.5], [0, 1]));
		}
		case 'describe':
			return ambient(i, t, 0.07);
		case 'head2': {
			if (i < HEAD.length || i >= 5800) return head(i, t, 0.5);
			return motor(i, t, {...M0, spin: t * 0.8, field: 0.6, scale: 0.4, y: -150});
		}
		case 'exist': {
			const g = E_IO(ci(t, [K.exist, K.exist + 1.2], [0, 1]));
			return motor(i, t, {...M0, spin: t * 1.4, field: 1, scale: lerp(0.4, 1.25, g), y: lerp(-150, 0, g)});
		}
		case 'eye':
			return eye(i, t);
		case 'end':
			return portrait(i, t);
		default:
			return ambient(i, t);
	}
};

const KEYS: {t: number; f: string; dur: number; spread: number}[] = [
	{t: -1, f: 'scatter', dur: 0.1, spread: 0},
	{t: 0, f: 'portrait', dur: 0.6, spread: 0.25},
	{t: K.lamp, f: 'frame', dur: 0.5, spread: 0.2},
	{t: K.head, f: 'head', dur: 0.7, spread: 0.3},
	{t: K.motor, f: 'motorInHead', dur: 0.6, spread: 0.3},
	{t: K.motor + 0.8, f: 'motor', dur: 0.6, spread: 0.2},
	{t: K.explode, f: 'explode', dur: 0.1, spread: 0},
	{t: K.run, f: 'run', dur: 0.1, spread: 0},
	{t: K.alter, f: 'alter', dur: 0.1, spread: 0},
	{t: K.coil, f: 'frame', dur: 0.5, spread: 0.2},
	{t: K.today, f: 'today', dur: 0.6, spread: 0.3},
	{t: K.time, f: 'time', dur: 0.6, spread: 0.25},
	{t: K.gap, f: 'gap', dur: 0.8, spread: 0.3},
	{t: K.absurd, f: 'absurd', dur: 0.1, spread: 0},
	{t: K.fall, f: 'fall', dur: 0.3, spread: 0.1},
	{t: K.close, f: 'close', dur: 0.3, spread: 0.1},
	{t: K.describe, f: 'describe', dur: 0.6, spread: 0.3},
	{t: K.head2, f: 'head2', dur: 0.7, spread: 0.3},
	{t: K.exist, f: 'exist', dur: 0.2, spread: 0.05},
	{t: K.eye, f: 'eye', dur: 0.8, spread: 0.3},
];

export const World: React.FC = () => {
	const fr = useCurrentFrame();
	const t = fr / 30;
	const cam = camAt(t);
	let k = 0;
	for (let j = 0; j < KEYS.length; j++) if (t >= KEYS[j].t) k = j;
	const cur = KEYS[k];
	const prev = KEYS[Math.max(0, k - 1)];
	const fade = ci(t, [END - 0.7, END - 0.2], [1, 0]);
	const out: React.ReactNode[] = [];
	for (let i = 0; i < N; i++) {
		const m = E_IO(ci(t - cur.t - R[i].dl * cur.spread, [0, cur.dur], [0, 1]));
		let p: P5;
		if (m >= 1) p = form(cur.f, i, t);
		else {
			const a = form(prev.f, i, t);
			const b = form(cur.f, i, t);
			p = a.map((v, j) => lerp(v, b[j], m)) as P5;
		}
		if (p[4] * fade < 0.02) continue;
		const [x, y, s] = project(p[0], p[1], p[2], cam);
		if (s <= 0 || x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
		const r = Math.min(9, p[3] * s);
		const depthO = ci(s, [0.25, 0.7], [0.35, 1]);
		out.push(<circle key={i} cx={x} cy={y} r={r} fill={C.ink} opacity={p[4] * fade * depthO} />);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{out}
		</svg>
	);
};
