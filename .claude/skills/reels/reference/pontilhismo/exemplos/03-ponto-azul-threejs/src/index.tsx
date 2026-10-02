import React from 'react';
import {AbsoluteFill, Audio, Composition, random, registerRoot, Sequence, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, Chunks, ci, E_IN, E_IO, lerp, MONO, OUT, sec} from './kit';
import {rt} from './time';
import TEXT from './text.json';
import SAGAN from './data/sagan.json';
import PBD from './data/pbd.json';
import {Drift, Earth, Galaxy, galaxyCam, H, HERE, Lattice, Lorenz, Planet, Scene3D, SolarSystem, Voyager, W} from './Space';

const END = rt(41.24) + 3.0;
const CX = 540;
const INK = C.ink;

// linha do tempo (tempos da narração crua → tempo final)
const T = {
	sagan: 0,
	dissolve: rt(4.09),
	solar: rt(5.76),
	voy: rt(8.31),
	shot: rt(10.27),
	flash: rt(10.9),
	earth: rt(11.5),
	dot: rt(14.6),
	planet: rt(15.95),
	tech: rt(18.22),
	galaxy: rt(20.4),
	here: rt(23.39),
	lorenz: rt(26.59),
	wander: rt(29.92),
	leave: rt(30.84),
	touch: rt(34.83),
	contact: rt(35.66),
	final: rt(37.52),
};

const win = (t: number, a: number, b: number, fi = 0.6, fo = 0.6) => ci(t, [a, a + fi], [0, 1]) * ci(t, [b, b + fo], [1, 0]);

// ═══════════ 2D: CARL SAGAN EM PONTILHISMO ═══════════
const Sagan: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const dis = ci(t, [T.dissolve, T.solar + 0.3], [0, 1]);
	const S = SAGAN as number[][];
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{S.map(([px, py, v], i) => {
				const r0 = random('sg' + i);
				const pin = ci(t, [r0 * 0.9, r0 * 0.9 + 0.9], [0, 1], E_IN);
				const out = ci(dis, [r0 * 0.5, r0 * 0.5 + 0.5], [0, 1], E_IO);
				const ang = random('sa' + i) * Math.PI * 2;
				const x = 170 + px * 740;
				const y = 240 + py * 1088 + Math.sin(t * 1.5 + py * 6) * 1.2;
				const dx = (x - CX) * out * 1.6 + Math.cos(ang) * (1 - pin) * 80;
				const dy = (y - 800) * out * 1.6 + Math.sin(ang) * (1 - pin) * 80;
				const o = (0.25 + 0.75 * v) * pin * (1 - out) * ci(py, [0.72, 1], [1, 0]);
				if (o < 0.02) return null;
				return <circle key={i} cx={x + dx} cy={y + dy} r={(0.9 + v * 3.2) * (1 - out * 0.6)} fill={INK} opacity={o} />;
			})}
			<text x={CX} y={1440} fill={INK} opacity={0.55 * ci(t, [1.0, 1.8], [0, 1]) * (1 - dis)} fontFamily={MONO} fontSize={22} letterSpacing={4} textAnchor="middle">
				CARL SAGAN · 1934 — 1996
			</text>
		</svg>
	);
};

// ═══════════ 2D: DISTÂNCIA DA VOYAGER ═══════════
const Distance: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const km = Math.round(ci(t, [T.solar + 0.3, T.voy - 0.2], [0, 6.05], E_IO) * 100) / 100;
	const o = win(t, T.solar + 0.2, T.voy - 0.3, 0.5, 0.4);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: o, fontFamily: MONO, color: INK}}>
			<div style={{fontSize: 20, letterSpacing: 5, opacity: 0.55}}>VOYAGER 1 · DISTÂNCIA DA TERRA</div>
			<div style={{fontSize: 58, marginTop: 12, letterSpacing: 2}}>{km.toFixed(2).replace('.', ',')} bi km</div>
		</div>
	);
};

// ═══════════ 2D: VISOR + FLASH ═══════════
const Shot: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const o = win(t, T.voy + 0.8, T.earth - 0.1, 0.4, 0.4);
	const flash = ci(t, [T.flash, T.flash + 0.04], [0, 1]) * ci(t, [T.flash + 0.06, T.flash + 0.5], [1, 0]);
	const c = (x: number, y: number, sx: number, sy: number) => <path d={`M${x} ${y + 70 * sy} L${x} ${y} L${x + 70 * sx} ${y}`} stroke={INK} strokeWidth={2.5} fill="none" />;
	return (
		<>
			<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
				{c(160, 560, 1, 1)}
				{c(920, 560, -1, 1)}
				{c(160, 1360, 1, -1)}
				{c(920, 1360, -1, -1)}
				<line x1={525} y1={960} x2={555} y2={960} stroke={INK} strokeWidth={1.4} />
				<line x1={540} y1={945} x2={540} y2={975} stroke={INK} strokeWidth={1.4} />
				<text x={190} y={530} fill={INK} fontFamily={MONO} fontSize={20} letterSpacing={3} opacity={0.7}>
					14 FEV 1990 · 04:48 GMT
				</text>
				<text x={890} y={1400} fill={INK} fontFamily={MONO} fontSize={20} letterSpacing={3} opacity={0.7} textAnchor="end">
					ALVO: TERRA · 0,12 PX
				</text>
			</svg>
			<AbsoluteFill style={{background: INK, opacity: flash * 0.85}} />
		</>
	);
};

// ═══════════ 2D: O PÁLIDO PONTO AZUL (foto real em pontos) ═══════════
const PaleDot: React.FC<{t0: number; t1: number; label?: string}> = ({t0, t1, label = 'NÓS'}) => {
	const f = useCurrentFrame();
	const t = f / 30;
	const o = win(t, t0, t1, 0.9, 0.8);
	if (o <= 0) return null;
	const P = PBD as number[][];
	const w = 1080;
	const h = w / 0.738;
	const y0 = (H - h) / 2;
	const dx = 0.76 * w;
	const dy = y0 + 0.565 * h;
	const ringP = ci(t, [t0 + 0.8, t0 + 1.6], [0, 1], E_IN);
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			{P.map(([px, py, v], i) => {
				const r0 = random('pb' + i);
				const pin = ci(t, [t0 + r0 * 0.8, t0 + r0 * 0.8 + 0.7], [0, 1]);
				return <circle key={i} cx={px * w + (r0 - 0.5) * 4} cy={y0 + py * h} r={1 + v * 3.4} fill={INK} opacity={v * 0.55 * pin} />;
			})}
			<circle cx={dx} cy={dy} r={3.2} fill={INK} />
			<circle cx={dx} cy={dy} r={10} fill={INK} opacity={0.25} />
			<circle cx={dx} cy={dy} r={46 + Math.sin(t * 2) * 3} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray={290} strokeDashoffset={290 * (1 - ringP)} />
			<line x1={dx - 46} y1={dy} x2={dx - 150} y2={dy - 90} stroke={INK} strokeWidth={1} opacity={ringP * 0.7} />
			<text x={dx - 160} y={dy - 100} fill={INK} fontFamily={MONO} fontSize={20} letterSpacing={4} textAnchor="end" opacity={ringP * 0.8}>
				{label}
			</text>
		</svg>
	);
};

// ═══════════ 2D: "VOCÊ ESTÁ AQUI" NA GALÁXIA (projeção da câmera 3D) ═══════════
const Here: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const o = win(t, T.here, T.lorenz - 0.3, 0.6, 0.4);
	if (o <= 0) return null;
	const c = galaxyCam(t, T.galaxy);
	const cam = new THREE.PerspectiveCamera(50, W / H, 0.01, 5000);
	cam.position.set(...c.pos);
	cam.lookAt(...c.look);
	cam.updateMatrixWorld();
	const v = new THREE.Vector3(...HERE).applyAxisAngle(new THREE.Vector3(0, 1, 0), c.spin).project(cam);
	const x = ((v.x + 1) / 2) * W;
	const y = ((1 - v.y) / 2) * H;
	const r = ci(t, [T.here, T.here + 0.7], [0, 1], E_IN);
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			<circle cx={x} cy={y} r={4} fill={INK} />
			<circle cx={x} cy={y} r={34} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray={214} strokeDashoffset={214 * (1 - r)} />
			<line x1={x + 34} y1={y} x2={x + 130} y2={y - 80} stroke={INK} opacity={0.7 * r} />
			<text x={x + 140} y={y - 90} fill={INK} fontFamily={MONO} fontSize={20} letterSpacing={3} opacity={0.85 * r}>
				VOCÊ ESTÁ AQUI
			</text>
		</svg>
	);
};

// ═══════════ 2D: A IDEIA CURIOSA SAI DA GRADE… E TOCA ALGUÉM ═══════════
const wanderAt = (t: number): [number, number] => {
	// sai da grade, vagueia e segue até a constelação no alto
	const u = ci(t, [T.leave, T.touch], [0, 1]);
	const v = ci(t, [T.touch, T.contact], [0, 1], E_IO);
	const start: [number, number] = [540, 1060];
	const lx = start[0] + Math.sin(u * 7.3) * 260 * u + Math.sin(u * 17) * 30 * u;
	const ly = start[1] - u * 380 + Math.cos(u * 5.1) * 120 * u;
	return [lerp(lx, 540, v), lerp(ly, 420, v)];
};
const Wander: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const o = win(t, T.wander, T.final, 0.7, 0.7);
	if (o <= 0) return null;
	const grid: [number, number][] = [];
	for (let r = 0; r < 11; r++) for (let c = 0; c < 9; c++) grid.push([140 + c * 100, 760 + r * 60]);
	const trail: string[] = [];
	for (let k = 60; k >= 0; k--) {
		const tt = t - k * 0.04;
		if (tt < T.leave) continue;
		const [x, y] = wanderAt(tt);
		trail.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}
	const [wx, wy] = t < T.leave ? [540, 1060] : wanderAt(t);
	const contact = ci(t, [T.contact - 0.05, T.contact + 1.4], [0, 1]);
	// "alguém": uma pequena constelação no alto
	const other: [number, number][] = Array.from({length: 9}, (_, k) => [540 + Math.cos(k * 0.7) * (60 + k * 14), 420 + Math.sin(k * 1.3) * (40 + k * 8)]);
	const fade = ci(t, [T.leave, T.leave + 1.5], [1, 0.35]);
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			{grid.map(([x, y], i) =>
				x === 540 && y === 1060 ? null : <circle key={i} cx={x} cy={y} r={3} fill={INK} opacity={0.55 * fade * ci(t, [T.wander + (i % 9) * 0.03, T.wander + 0.5 + (i % 9) * 0.03], [0, 1])} />,
			)}
			<polyline points={trail.join(' ')} fill="none" stroke={INK} strokeWidth={1.6} opacity={0.6} strokeLinecap="round" />
			<circle cx={wx} cy={wy} r={6} fill={INK} />
			<circle cx={wx} cy={wy} r={16 + Math.sin(t * 5) * 3} fill="none" stroke={INK} opacity={0.5} />
			{/* alguém */}
			{other.map(([x, y], i) => (
				<circle key={'o' + i} cx={x} cy={y} r={2.5 + contact * 2} fill={INK} opacity={ci(t, [T.touch - 0.5, T.touch + 0.3], [0, 0.7]) + contact * 0.3} />
			))}
			{other.map(([x, y], i) => (
				<line key={'l' + i} x1={540} y1={420} x2={x} y2={y} stroke={INK} strokeWidth={1} opacity={0.5 * ci(contact, [i * 0.06, i * 0.06 + 0.3], [0, 1])} />
			))}
			{[0, 1, 2].map((k) => {
				const u = ci(t, [T.contact + k * 0.35, T.contact + k * 0.35 + 1.6], [0, 1]);
				return u > 0 && u < 1 ? <circle key={'rp' + k} cx={540} cy={420} r={20 + u * 360} fill="none" stroke={INK} strokeWidth={1.4} opacity={(1 - u) * 0.7} /> : null;
			})}
		</svg>
	);
};

// ═══════════ COMPOSIÇÃO ═══════════
type TX = Record<string, {parts: [string, number][]; y: number; size: number; serif?: boolean}>;
const SC = Object.entries(TEXT as unknown as TX).map(([k, v]) => ({k: +k, ...v, t: rt(v.parts[0][1])}));

const S3: React.FC<{a: number; b: number; children: (t: number) => React.ReactNode; fi?: number; fo?: number}> = ({a, b, children, fi = 0.7, fo = 0.7}) => {
	const f = useCurrentFrame();
	const t = f / 30;
	if (t < a - 0.05 || t > b + fo + 0.05) return null;
	return <Scene3D o={win(t, a, b, fi, fo)}>{children(t)}</Scene3D>;
};

const PontoAzul: React.FC = () => (
	<AbsoluteFill style={{background: '#040404'}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 50%, rgba(237,235,230,0.05) 0%, transparent 70%)'}} />
		<S3 a={T.dissolve} b={T.voy} fi={1.2}>{(t) => <SolarSystem t={t} t0={T.solar} t1={T.voy} />}</S3>
		<S3 a={T.voy} b={T.earth}>{(t) => <Voyager t={t} t0={T.voy} t1={T.shot} />}</S3>
		<S3 a={T.earth} b={T.dot + 0.6} fo={0.9}>{(t) => <Earth t={t} t0={T.earth} t1={T.planet} dot={T.dot} />}</S3>
		<S3 a={T.planet} b={T.tech}>{(t) => <Planet t={t} t0={T.planet} t1={T.tech} />}</S3>
		<S3 a={T.tech} b={T.galaxy}>{(t) => <Lattice t={t} t0={T.tech} t1={T.galaxy} />}</S3>
		<S3 a={T.galaxy} b={T.lorenz}>{(t) => <Galaxy t={t} t0={T.galaxy} t1={T.lorenz} />}</S3>
		<S3 a={T.lorenz} b={T.wander}>{(t) => <Lorenz t={t} t0={T.lorenz} t1={T.wander} />}</S3>
		<S3 a={T.final} b={END + 1}>{(t) => <Drift t={t} t0={T.final} t1={END} />}</S3>
		<Sagan />
		<Distance />
		<Shot />
		<PaleDot t0={T.dot} t1={T.planet} />
		<Here />
		<Wander />
		<PaleDot t0={T.final + 0.4} t1={END + 5} label="AINDA AQUI" />
		{SC.map((s, i) => {
			const from = sec(s.t);
			const next = i + 1 < SC.length ? sec(SC[i + 1].t) : sec(END) + 999;
			const d = next - from;
			return (
				<Sequence key={s.k} from={from} durationInFrames={Math.min(d + OUT, sec(END) - from)}>
					<AbsoluteFill style={{textShadow: '0 0 30px rgba(0,0,0,0.95)'}}>
						<Chunks k={s.k} d={d} y={s.y} size={s.size} serif={s.serif} />
					</AbsoluteFill>
				</Sequence>
			);
		})}
		<AbsoluteFill style={{background: '#040404', opacity: ci(useCurrentFrame() / 30, [END - 1.2, END], [0, 1])}} />
		<Audio src={staticFile('narracao.mp3')} />
	</AbsoluteFill>
);

registerRoot(() => <Composition id="PontoAzul" component={PontoAzul} durationInFrames={sec(END)} fps={30} width={W} height={H} />);
