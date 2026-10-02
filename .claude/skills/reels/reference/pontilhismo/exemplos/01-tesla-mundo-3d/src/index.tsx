import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, random, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {C, ci, E_IN, E_IO, E_OUT, MONO, SERIF, sec} from './kit';
import WORDS from './data/words.json';
import {camAt, END, ISLE, K, project, World, W, H} from './World';

const INTER = loadInter('normal', {weights: ['400', '700']}).fontFamily;
const INK = C.ink;
const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => ci(t, [a, a + fi], [0, 1]) * ci(t, [b - fo, b], [1, 0]);
const useT = () => useCurrentFrame() / 30;

// ═══════════ LEGENDA — Inter, palavra falada em bold, ~380 px da base ═══════════
type Wd = {text: string; start: number; end: number};
const WS = WORDS as Wd[];
const GROUPS: Wd[][] = (() => {
	const out: Wd[][] = [];
	let cur: Wd[] = [];
	WS.forEach((w, i) => {
		cur.push(w);
		const chars = cur.map((x) => x.text).join(' ').length;
		const next = WS[i + 1];
		const gap = next ? next.start - w.end : 9;
		if (/[.,!?…:]$/.test(w.text) || cur.length >= 4 || chars > 20 || gap > 0.35) {
			out.push(cur);
			cur = [];
		}
	});
	if (cur.length) out.push(cur);
	return out;
})();
const Captions: React.FC = () => {
	const t = useT();
	const gi = GROUPS.findIndex((g, i) => t >= g[0].start - 0.05 && t < (GROUPS[i + 1]?.[0].start ?? END) - 0.05);
	if (gi < 0) return null;
	const g = GROUPS[gi];
	if (t > g[g.length - 1].end + 1.2) return null;
	let active = 0;
	g.forEach((w, i) => t >= w.start && (active = i));
	return (
		<div style={{position: 'absolute', left: 85, right: 85, top: H - 380 - 90, textAlign: 'center', fontFamily: INTER, fontSize: 70, lineHeight: 1.2, letterSpacing: -2.2, color: '#F2F0EB', textShadow: '0 2px 24px #000'}}>
			{g.map((w, i) => (
				<React.Fragment key={w.start}>
					<span style={{display: 'inline-block', visibility: t >= w.start ? 'visible' : 'hidden', color: i === active ? '#fff' : '#CBC9C5', fontWeight: i === active ? 700 : 400, transform: i === active ? 'translateY(-2px)' : 'none'}}>{w.text}</span>
					{i < g.length - 1 ? ' ' : ''}
				</React.Fragment>
			))}
		</div>
	);
};

// ═══════════ FOTOS HISTÓRICAS — abrem no centro, pontos correm em volta, crédito embaixo ═══════════
const WORKS: {a: number; b: number; rect: [number, number, number, number]; src: string; pos: string; cap: string; sub: string}[] = [
	{a: K.lamp, b: K.lab, rect: [200, 380, 680, 870], src: 'img/lampada-web.jpg', pos: '50% 35%', cap: 'Tesla e a lâmpada sem fio', sub: 'NAPOLEON SARONY · c. 1898'},
	{a: K.lab, b: K.head, rect: [80, 520, 920, 700], src: 'img/laboratorio-web.jpg', pos: '50% 50%', cap: 'Laboratório, Colorado Springs', sub: 'DICKENSON V. ALLEY · 1899 · DUPLA EXPOSIÇÃO'},
	{a: K.coil, b: K.today, rect: [230, 400, 620, 830], src: 'img/bobina.jpg', pos: '50% 50%', cap: 'A bobina em funcionamento', sub: 'DICKENSON V. ALLEY · COLORADO SPRINGS · 1899'},
];
const Works: React.FC = () => {
	const t = useT();
	return (
		<>
			{WORKS.map((wk) => {
				if (t < wk.a - 0.05 || t > wk.b + 0.05) return null;
				const [x, y, w, h] = wk.rect;
				const open = E_IO(ci(t, [wk.a, wk.a + 0.5], [0, 1]));
				const close = E_OUT(ci(t, [wk.b - 0.4, wk.b], [0, 1]));
				const v = open * (1 - close);
				const inset = (1 - v) * 50;
				const zoom = 1.08 - 0.08 * ci(t, [wk.a, wk.b], [0, 1]);
				const cap = ci(t, [wk.a + 0.45, wk.a + 0.75], [0, 1]) * (1 - close);
				const per = 2 * (w + h);
				return (
					<React.Fragment key={wk.src}>
						<div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', clipPath: `inset(${inset}% 0 ${inset}% 0)`}}>
							<Img src={staticFile(wk.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: wk.pos, transform: `scale(${zoom})`, filter: 'grayscale(1) contrast(1.12)'}} />
						</div>
						<svg width={W} height={H} style={{position: 'absolute', opacity: v}}>
							{Array.from({length: 520}, (_, k) => {
								const off = 16 + (k % 5) * 7;
								let dd = ((((k / 520 + t * 0.05 * (k % 2 ? 1 : -1)) % 1) + 1) % 1) * per;
								let px = 0, py = 0;
								if (dd < w) [px, py] = [x + dd, y - off];
								else if ((dd -= w) < h) [px, py] = [x + w + off, y + dd];
								else if ((dd -= h) < w) [px, py] = [x + w - dd, y + h + off];
								else [px, py] = [x - off, y + h - (dd - w)];
								return <circle key={k} cx={px} cy={py} r={1 + random('fr' + k) * 1.4} fill={INK} opacity={0.3 + 0.5 * (1 - (k % 5) / 5)} />;
							})}
						</svg>
						<div style={{position: 'absolute', left: 0, right: 0, top: y + h + 44, textAlign: 'center', opacity: cap, transform: `translateY(${(1 - cap) * 12}px)`}}>
							<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, color: INK}}>{wk.cap}</div>
							<div style={{fontFamily: MONO, fontSize: 16, letterSpacing: 4, color: INK, opacity: 0.55, marginTop: 8}}>{wk.sub}</div>
						</div>
					</React.Fragment>
				);
			})}
		</>
	);
};

// ═══════════ RÓTULOS 3D (seguem a câmera) ═══════════
const Tag: React.FC<{p: [number, number, number]; o: number; label: string; dx?: number; dy?: number}> = ({p, o, label, dx = 120, dy = -70}) => {
	const t = useT();
	const [x, y, s] = project(p[0], p[1], p[2], camAt(t));
	if (o <= 0.01 || s <= 0) return null;
	return (
		<g opacity={o}>
			<circle cx={x} cy={y} r={4} fill={INK} />
			<line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={INK} strokeWidth={1} opacity={0.7} />
			<text x={x + dx + (dx > 0 ? 8 : -8)} y={y + dy + 6} fill={INK} fontFamily={MONO} fontSize={19} letterSpacing={3} textAnchor={dx > 0 ? 'start' : 'end'}>
				{label}
			</text>
		</g>
	);
};
const Labels: React.FC = () => {
	const t = useT();
	const ex = win(t, K.explode + 0.5, K.run + 0.1);
	const run = win(t, K.run + 0.5, K.alter + 0.1);
	const alt = win(t, K.alter + 0.7, K.coil, 0.3, 0.3);
	const gapO = win(t, K.gap + 0.8, K.describe, 0.4, 0.4);
	const gap = t < K.close ? 700 : 700 - (660 * E_IO(ci(t, [K.close, K.close + 1.3], [0, 1])));
	const S = ISLE(gap);
	return (
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Tag p={[0, -345, -120]} o={ex} label="ESTATOR" dx={-150} dy={-90} />
			<Tag p={[0, -510, 0]} o={ex} label="BOBINAS · 6 POLOS" dx={150} dy={-60} />
			<Tag p={[0, 170, 520]} o={ex} label="ROTOR EM GAIOLA" dx={150} dy={80} />
			<Tag p={[0, 0, 1350]} o={ex} label="EIXO" dx={-130} dy={70} />
			<Tag p={[235, 0, 0]} o={run} label="CAMPO MAGNÉTICO GIRANTE" dx={60} dy={-300} />
			<Tag p={[0, 170, 760]} o={alt} label="ROTOR · V1 → V2 · BARRAS 0° → 12°" dx={-40} dy={-360} />
			<Tag p={[(S.L - 260) * 0.5, -300, 0]} o={gapO} label="IMAGINAR" dx={-20} dy={-120} />
			<Tag p={[(S.R + 240) * 0.5, -120, 0]} o={gapO} label="EXECUTAR" dx={20} dy={-200} />
		</svg>
	);
};

/** 1887 → 2026 */
const Years: React.FC = () => {
	const t = useT();
	const o = win(t, K.today + 0.3, K.time + 0.1, 0.4, 0.4);
	if (o <= 0) return null;
	const y = Math.round(1887 + E_IO(ci(t, [K.today + 0.4, K.time - 0.3], [0, 1])) * (2026 - 1887));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', opacity: o, color: INK}}>
			<div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 6, opacity: 0.55}}>MOTOR DE INDUÇÃO · PATENTE DE 1888</div>
			<div style={{fontFamily: SERIF, fontSize: 130, marginTop: 4}}>{y}</div>
		</div>
	);
};

/** descrever o que você enxerga */
const Describe: React.FC = () => {
	const t = useT();
	const o = win(t, K.describe, K.head2 + 0.2, 0.4, 0.4);
	if (o <= 0) return null;
	const txt = 'Um motor com campo magnético girante, 6 polos, rotor em gaiola, girando suave…';
	const n = Math.floor(ci(t, [K.describe + 0.3, K.head2 - 0.3], [0, txt.length]));
	const card = E_IN(ci(t, [K.describe, K.describe + 0.5], [0, 1]));
	return (
		<div style={{position: 'absolute', left: 110, top: 640, width: 860, opacity: o, transform: `translateY(${(1 - card) * 24}px)`, filter: `blur(${(1 - card) * 8}px)`}}>
			<div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: INK, opacity: 0.5, marginBottom: 18}}>DESCREVA O QUE VOCÊ ESTÁ VENDO</div>
			<div style={{border: '1px solid rgba(237,235,230,0.25)', borderRadius: 28, padding: '30px 34px', fontFamily: SERIF, fontSize: 50, lineHeight: 1.25, color: INK, minHeight: 260, background: 'rgba(8,8,8,0.6)'}}>
				{txt.slice(0, n)}
				<span style={{opacity: Math.floor(t * 3) % 2 ? 0 : 1}}>▍</span>
			</div>
		</div>
	);
};

const Tesla: React.FC = () => (
	<AbsoluteFill style={{background: '#050505'}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 46%, rgba(237,235,230,0.06) 0%, transparent 70%)'}} />
		<World />
		<Works />
		<Labels />
		<Years />
		<Describe />
		<Captions />
		<AbsoluteFill style={{background: '#050505', opacity: ci(useCurrentFrame() / 30, [END - 0.8, END], [0, 1])}} />
		<Audio src={staticFile('narracao.wav')} />
	</AbsoluteFill>
);

registerRoot(() => <Composition id="Tesla" component={Tesla} durationInFrames={sec(END)} fps={30} width={W} height={H} />);
