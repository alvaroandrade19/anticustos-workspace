import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {random, useCurrentFrame} from 'remotion';
import LAND from './data/land.json';

// ═══════════ TRÊS.JS — ESPAÇO EM PONTOS ═══════════
export const W = 1080;
export const H = 1920;
const TAU = Math.PI * 2;
const ci = (x: number, a: [number, number], b: [number, number]) => {
	const u = Math.min(1, Math.max(0, (x - a[0]) / (a[1] - a[0])));
	return b[0] + (b[1] - b[0]) * u;
};
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp3 = (a: number[], b: number[], u: number) => a.map((v, i) => v + (b[i] - v) * u) as [number, number, number];

// sprite circular macio (ponto com glow)
let SPRITE: THREE.Texture | null = null;
const sprite = () => {
	if (SPRITE) return SPRITE;
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const g = c.getContext('2d')!;
	const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	grd.addColorStop(0, 'rgba(255,255,255,1)');
	grd.addColorStop(0.35, 'rgba(255,255,255,0.8)');
	grd.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = grd;
	g.fillRect(0, 0, 64, 64);
	SPRITE = new THREE.CanvasTexture(c);
	return SPRITE;
};

/** nuvem de pontos genérica (posições + brilho por vértice) */
const Cloud: React.FC<{pos: Float32Array; bright?: Float32Array; size: number; opacity: number; count?: number; rotY?: number; rotX?: number; position?: [number, number, number]; scale?: number}> = ({pos, bright, size, opacity, count, rotY = 0, rotX = 0, position = [0, 0, 0], scale = 1}) => {
	const geo = useMemo(() => {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const col = new Float32Array(pos.length);
		for (let i = 0; i < pos.length / 3; i++) {
			const b = bright ? bright[i] : 1;
			col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = b;
		}
		g.setAttribute('color', new THREE.BufferAttribute(col, 3));
		return g;
	}, [pos, bright]);
	geo.setDrawRange(0, count ?? pos.length / 3);
	return (
		<points geometry={geo} rotation={[rotX, rotY, 0]} position={position} scale={scale}>
			<pointsMaterial size={size} map={sprite()} vertexColors transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
		</points>
	);
};

/** câmera controlada pelo frame */
const Cam: React.FC<{pos: [number, number, number]; look?: [number, number, number]; fov?: number}> = ({pos, look = [0, 0, 0], fov = 50}) => {
	const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
	cam.fov = fov;
	cam.near = 0.01;
	cam.far = 5000;
	cam.position.set(...pos);
	cam.lookAt(...look);
	cam.updateProjectionMatrix();
	return null;
};

// ─── geometrias ───
const STARS = (() => {
	const n = 7000;
	const p = new Float32Array(n * 3);
	const b = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const u = random('su' + i) * 2 - 1;
		const th = random('st' + i) * TAU;
		const r = 80 + random('sr' + i) * 300;
		const s = Math.sqrt(1 - u * u);
		p.set([Math.cos(th) * s * r, u * r, Math.sin(th) * s * r], i * 3);
		b[i] = 0.25 + Math.pow(random('sb' + i), 3) * 0.75;
	}
	return {p, b};
})();
export const Stars: React.FC<{o: number; spin?: number}> = ({o, spin = 0}) => <Cloud pos={STARS.p} bright={STARS.b} size={0.9} opacity={o} rotY={spin} />;

const ring = (r: number, n: number, y = 0, jitter = 0, seed = 'r') => {
	const p = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const a = (i / n) * TAU;
		const j = (random(seed + i) - 0.5) * jitter;
		p.set([Math.cos(a) * (r + j), y + (random(seed + 'y' + i) - 0.5) * jitter * 0.3, Math.sin(a) * (r + j)], i * 3);
	}
	return p;
};
const ball = (r: number, n: number, seed: string, shell = true) => {
	const p = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const u = random(seed + 'u' + i) * 2 - 1;
		const th = random(seed + 't' + i) * TAU;
		const rr = shell ? r : r * Math.cbrt(random(seed + 'r' + i));
		const s = Math.sqrt(1 - u * u);
		p.set([Math.cos(th) * s * rr, u * rr, Math.sin(th) * s * rr], i * 3);
	}
	return p;
};

// ═══════════ CENAS ═══════════
type SP = {t: number; t0: number; t1: number};

/** sistema solar + trajetória da Voyager */
const ORBITS = [1.6, 2.4, 3.3, 4.5, 7, 10].map((r, k) => ring(r, 420 + k * 80, 0, 0.04, 'o' + k));
const SUN = ball(0.35, 1400, 'sun', false);
const EARTH_DOT = ball(0.09, 200, 'earth', false);
const VOY_DOT = ball(0.18, 160, 'voy', false);
const PATH = (() => {
	const n = 1600;
	const p = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const u = i / (n - 1);
		// sai da órbita da Terra e se afasta do plano, para cima e para fora
		const a = 0.6 + u * 0.9;
		const r = 3.3 + Math.pow(u, 1.4) * 38;
		p.set([Math.cos(a) * r, Math.pow(u, 1.6) * 12, Math.sin(a) * r], i * 3);
	}
	return p;
})();
export const SolarSystem: React.FC<SP> = ({t, t0, t1}) => {
	const u = ease(ci(t, [t0, t1 + 0.6], [0, 1]));
	const earthA = t * 0.5;
	const drawn = Math.floor(ci(t, [t0 + 0.3, t1 - 0.4], [60, 1600]));
	const vi = Math.max(0, drawn - 1);
	const vpos: [number, number, number] = [PATH[vi * 3], PATH[vi * 3 + 1], PATH[vi * 3 + 2]];
	return (
		<>
			<Cam pos={lerp3([0, 5, 12], [8, 26, 58], u)} look={lerp3([0, 0, 0], [8, 4, 6], u)} />
			<Stars o={0.8} />
			<Cloud pos={SUN} size={0.05} opacity={0.7} />
			{ORBITS.map((o, k) => (
				<Cloud key={k} pos={o} size={0.05} opacity={0.35} />
			))}
			<Cloud pos={EARTH_DOT} size={0.07} opacity={1} position={[Math.cos(earthA) * 3.3, 0, Math.sin(earthA) * 3.3]} />
			<Cloud pos={PATH} size={0.11} opacity={0.8} count={drawn} />
			<Cloud pos={VOY_DOT} size={0.16} opacity={1} position={vpos} />
		</>
	);
};

/** a sonda Voyager em pontos, virando para trás */
const VOYAGER = (() => {
	const pts: number[] = [];
	// antena parabólica
	for (let i = 0; i < 2600; i++) {
		const r = Math.sqrt(random('dr' + i)) * 1.8;
		const a = random('da' + i) * TAU;
		pts.push(Math.cos(a) * r, 0.18 * r * r, Math.sin(a) * r);
	}
	for (let i = 0; i < 300; i++) {
		const a = (i / 300) * TAU;
		pts.push(Math.cos(a) * 1.8, 0.58, Math.sin(a) * 1.8);
	}
	// corpo (decágono)
	for (let i = 0; i < 900; i++) {
		const a = random('ba' + i) * TAU;
		pts.push(Math.cos(a) * 0.75, -0.2 - random('by' + i) * 0.55, Math.sin(a) * 0.75);
	}
	// hastes (magnetômetro, RTG, instrumentos)
	const boom = (x: number, y: number, z: number, n: number, s: string) => {
		for (let i = 0; i < n; i++) {
			const u = i / n;
			pts.push(x * u + (random(s + i) - 0.5) * 0.03, -0.4 + y * u, z * u + (random(s + 'z' + i) - 0.5) * 0.03);
		}
	};
	boom(-4.5, -0.3, 0.4, 700, 'm');
	boom(2.4, -0.9, -1.4, 400, 'r');
	boom(1.2, -0.2, 2.6, 400, 'i');
	// RTG (cilindro)
	for (let i = 0; i < 300; i++) {
		const a = random('ra' + i) * TAU;
		const u = random('ru' + i);
		pts.push(2.4 + Math.cos(a) * 0.14 + u * 0.5, -1.3 + Math.sin(a) * 0.14, -1.4 - u * 0.3);
	}
	return new Float32Array(pts);
})();
export const Voyager: React.FC<SP> = ({t, t0, t1}) => {
	const turn = ease(ci(t, [t0 + 0.5, t1 - 0.2], [0, 1]));
	return (
		<>
			<Cam pos={[0, 2.2, 12.5 - turn * 1.5]} look={[0, -0.4, 0]} />
			<Stars o={0.8} spin={-turn * Math.PI * 0.8} />
			<Cloud pos={VOYAGER} size={0.045} opacity={0.95} rotY={0.5 + turn * Math.PI} rotX={-0.35} />
		</>
	);
};

/** a Terra em pontos (continentes pelo mapa real) — depois vira um pixel */
const EARTH = (() => {
	const n = 26000;
	const p = new Float32Array(n * 3);
	const b = new Float32Array(n);
	const land = LAND as string;
	const g = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < n; i++) {
		const y = 1 - (i / (n - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const th = g * i;
		const x = Math.cos(th) * r;
		const z = Math.sin(th) * r;
		const lat = Math.asin(y);
		const lon = Math.atan2(z, x);
		const px = Math.floor(((lon + Math.PI) / TAU) * 360) % 360;
		const py = Math.min(179, Math.floor(((Math.PI / 2 - lat) / Math.PI) * 180));
		const isLand = land[py * 360 + px] === '1';
		p.set([x * 2, y * 2, z * 2], i * 3);
		b[i] = isLand ? 1 : 0.045;
	}
	return {p, b};
})();
const HALO = ring(2.12, 700, 0, 0.05, 'halo');
export const Earth: React.FC<SP & {dot: number}> = ({t, t0, t1, dot}) => {
	// aproxima, depois recua até a Terra virar um ponto
	const back = Math.pow(ci(t, [t0 + 1.2, dot], [0, 1]), 2.2);
	const z = 8.4 + back * 900;
	return (
		<>
			<Cam pos={[0, 0.6, z]} look={[0, 0, 0]} fov={45} />
			<Stars o={0.6 * ci(back, [0.1, 0.6], [0.2, 1])} />
			<Cloud pos={EARTH.p} bright={EARTH.b} size={0.04 + back * 1.5} opacity={1} rotY={t * 0.25} rotX={0.35} />
			<Cloud pos={HALO} size={0.03} opacity={0.4 * (1 - back)} rotX={Math.PI / 2 - 0.05} />
			{t1 && null}
		</>
	);
};

/** um planeta novo que não foi descoberto: forma e se desfaz */
const PLANET = ball(1.4, 9000, 'pl', true);
const PRING = ring(2.4, 2600, 0, 0.5, 'pr');
export const Planet: React.FC<SP> = ({t, t0, t1}) => {
	const undo = ease(ci(t, [t1 - 1.0, t1], [0, 1]));
	return (
		<>
			<Cam pos={[0, 1.2, 7.5]} />
			<Stars o={0.6} />
			<Cloud pos={PLANET} size={0.035} opacity={0.8 * (1 - undo)} rotY={t * 0.3} scale={1 + undo * 1.4} />
			<Cloud pos={PRING} size={0.03} opacity={0.6 * (1 - undo)} rotX={0.45} rotY={t * 0.1} scale={1 + undo * 2} />
			{t0 && null}
		</>
	);
};

/** tecnologia: treliça 3D de pontos que se apaga */
const LATTICE = (() => {
	const pts: number[] = [];
	for (let x = -4; x <= 4; x++)
		for (let y = -4; y <= 4; y++)
			for (let z = -4; z <= 4; z++) {
				pts.push(x * 0.5, y * 0.5, z * 0.5);
				if (random(`lt${x}${y}${z}`) > 0.6) for (let k = 1; k < 6; k++) pts.push(x * 0.5 + k * 0.1, y * 0.5, z * 0.5);
			}
	return new Float32Array(pts);
})();
export const Lattice: React.FC<SP> = ({t, t0, t1}) => {
	const dim = ci(t, [t0 + 0.8, t1], [1, 0.25]);
	return (
		<>
			<Cam pos={[3.5, 2.5, 6.5]} />
			<Stars o={0.5} />
			<Cloud pos={LATTICE} size={0.04} opacity={0.75 * dim} rotY={t * 0.2} />
		</>
	);
};

/** milhões de pessoas → a galáxia (nosso lugar no universo) */
const GALAXY = (() => {
	const n = 60000;
	const p = new Float32Array(n * 3);
	const b = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const arm = i % 4;
		const u = Math.pow(random('gu' + i), 0.8);
		const r = 0.3 + u * 9;
		const a = (arm / 4) * TAU + u * 5.2 + (random('ga' + i) - 0.5) * (0.6 - u * 0.3);
		const spread = (random('gs' + i) - 0.5) * (0.9 - u * 0.5);
		p.set([Math.cos(a) * r + spread, (random('gy' + i) - 0.5) * 0.5 * (1 - u), Math.sin(a) * r + spread], i * 3);
		b[i] = (0.25 + 0.75 * (1 - u)) * (0.5 + random('gb' + i) * 0.5);
	}
	return {p, b};
})();
export const HERE: [number, number, number] = [5.2 * Math.cos(0.9 * 1.0), 0, 5.2 * Math.sin(0.9 * 1.0)];
export const galaxyCam = (t: number, t0: number) => {
	const u = ease(ci(t, [t0, t0 + 6.5], [0, 1]));
	return {pos: lerp3([0, 0.8, 26], [0, 17, 7], u), look: [0, 0, 0] as [number, number, number], spin: t * 0.05};
};
export const Galaxy: React.FC<SP> = ({t, t0}) => {
	const c = galaxyCam(t, t0);
	return (
		<>
			<Cam pos={c.pos} look={c.look} />
			<Stars o={0.7} />
			<Cloud pos={GALAXY.p} bright={GALAXY.b} size={0.07} opacity={0.9} rotY={c.spin} />
		</>
	);
};

/** algo que não faz sentido de primeira: atrator de Lorenz sendo desenhado */
const LORENZ = (() => {
	const n = 26000;
	const p = new Float32Array(n * 3);
	let x = 0.1, y = 0, z = 0;
	const dt = 0.006;
	for (let i = 0; i < n; i++) {
		const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z;
		x += dx * dt; y += dy * dt; z += dz * dt;
		p.set([x * 0.12, (z - 25) * 0.12, y * 0.12], i * 3);
	}
	return p;
})();
export const Lorenz: React.FC<SP> = ({t, t0, t1}) => {
	const n = Math.floor(ci(t, [t0, t1], [200, 26000]));
	return (
		<>
			<Cam pos={[0, 0.4, 9]} />
			<Stars o={0.5} />
			<Cloud pos={LORENZ} size={0.03} opacity={0.85} count={n} rotY={t * 0.35} />
		</>
	);
};

/** o fim: estrelas se afastando devagar */
export const Drift: React.FC<SP> = ({t, t0}) => (
	<>
		<Cam pos={[0, 0, 20 + (t - t0) * 6]} />
		<Stars o={0.9} spin={t * 0.02} />
	</>
);

/** wrapper: um ThreeCanvas por cena */
export const Scene3D: React.FC<{children: React.ReactNode; o: number}> = ({children, o}) => {
	useCurrentFrame();
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o}}>
			<ThreeCanvas width={W} height={H} gl={{alpha: true, antialias: true, preserveDrawingBuffer: true}} style={{background: 'transparent'}}>
				{children}
			</ThreeCanvas>
		</div>
	);
};
