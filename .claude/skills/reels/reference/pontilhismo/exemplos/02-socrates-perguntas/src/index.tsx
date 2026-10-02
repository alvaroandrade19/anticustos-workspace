import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, random, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {C, ci, E_IN, E_IO, E_OUT, MONO, SERIF, sec} from './kit';
import {rt} from './time';
import WORDS from './data/words.json';
import {END, FRAMES, K, LINE_NODES, Particles, W, H} from './Particles';

const INTER = loadInter('normal', {weights: ['400', '700']}).fontFamily;
const INK = C.ink;
const win = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) => ci(t, [a, a + fi], [0, 1]) * ci(t, [b - fo, b], [1, 0]);
const useT = () => useCurrentFrame() / 30;

// ═══════════ LEGENDA (padrão dos vídeos anteriores) ═══════════
// Inter, mesma espessura; a palavra falada no momento fica em bold. Palavra por palavra, ~380 px acima da base.
type Wd = {w: string; s: number; e: number};
const WS: Wd[] = (WORDS as Wd[]).map((x) => ({...x, s: rt(x.s), e: rt(x.e)}));
const GROUPS: Wd[][] = (() => {
	const out: Wd[][] = [];
	let cur: Wd[] = [];
	WS.forEach((w, i) => {
		cur.push(w);
		const chars = cur.map((x) => x.w).join(' ').length;
		const next = WS[i + 1];
		const gap = next ? next.s - w.e : 9;
		if (/[.,!?…]$/.test(w.w) || cur.length >= 4 || chars > 20 || gap > 0.35) {
			out.push(cur);
			cur = [];
		}
	});
	if (cur.length) out.push(cur);
	return out;
})();
const Captions: React.FC = () => {
	const t = useT();
	const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.05 && t < (GROUPS[i + 1]?.[0].s ?? END) - 0.05);
	if (gi < 0) return null;
	const g = GROUPS[gi];
	const endG = GROUPS[gi + 1]?.[0].s ?? END;
	if (t > g[g.length - 1].e + 1.2 && endG - g[g.length - 1].e > 1.2) return null;
	let active = 0;
	g.forEach((w, i) => t >= w.s && (active = i));
	return (
		<div style={{position: 'absolute', left: 85, right: 85, top: H - 380 - 90, textAlign: 'center', fontFamily: INTER, fontSize: 70, lineHeight: 1.2, letterSpacing: -2.2, color: '#F2F0EB', textShadow: '0 2px 24px #000'}}>
			{g.map((w, i) => (
				<React.Fragment key={w.s}>
					<span style={{display: 'inline-block', visibility: t >= w.s ? 'visible' : 'hidden', color: i === active ? '#fff' : '#CBC9C5', fontWeight: i === active ? 700 : 400, transform: i === active ? 'translateY(-2px)' : 'none'}}>{w.w}</span>
					{i < g.length - 1 ? ' ' : ''}
				</React.Fragment>
			))}
		</div>
	);
};

// ═══════════ LINHA DO TEMPO HORIZONTAL (voltando 2.400 anos) ═══════════
const Ruler: React.FC = () => {
	const t = useT();
	const o = win(t, 0.15, K.book + 0.3, 0.35, 0.5);
	if (o <= 0) return null;
	const u = E_IO(ci(t, [0.35, rt(2.6)], [0, 1]));
	const year = 2026 - u * 2425;
	const PX = 0.9; // px por ano
	const ticks: React.ReactNode[] = [];
	const first = Math.floor((year - 700) / 50) * 50;
	for (let y = first; y < year + 700; y += 50) {
		const x = 540 + (y - year) * PX;
		if (x < 40 || x > 1040) continue;
		const big = y % 500 === 0;
		const edge = ci(Math.abs(x - 540), [300, 500], [1, 0]);
		ticks.push(<line key={y} x1={x} y1={1210} x2={x} y2={big ? 1180 : 1196} stroke={INK} strokeWidth={big ? 2 : 1} opacity={0.6 * edge} />);
		if (big)
			ticks.push(
				<text key={'t' + y} x={x} y={1168} fill={INK} opacity={0.45 * edge} fontFamily={MONO} fontSize={17} textAnchor="middle" letterSpacing={2}>
					{y <= 0 ? `${-y + (y === 0 ? 0 : 0)} A.C.` : y}
				</text>,
			);
	}
	const lbl = Math.round(year);
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			<line x1={60} y1={1210} x2={1020} y2={1210} stroke={INK} strokeWidth={1} opacity={0.35} />
			{ticks}
			<line x1={540} y1={1150} x2={540} y2={1232} stroke={INK} strokeWidth={2.5} />
			<text x={540} y={1300} fill={INK} fontFamily={SERIF} fontSize={64} textAnchor="middle">
				{lbl > 0 ? lbl : `${-lbl} a.C.`}
			</text>
		</svg>
	);
};

// ═══════════ LIVRO: PÁGINAS EM BRANCO VIRANDO ═══════════
const Pages: React.FC = () => {
	const t = useT();
	const o = win(t, K.book + 0.3, K.lineage + 0.1, 0.3, 0.4);
	if (o <= 0) return null;
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			{[0, 1, 2, 3].map((k) => {
				const u = E_IO(ci(t, [K.book + 0.35 + k * 0.32, K.book + 0.85 + k * 0.32], [0, 1]));
				if (u <= 0 || u >= 1) return null;
				// a página gira em torno da lombada (x = 540)
				const cos = Math.cos(u * Math.PI);
				const xr = 540 + cos * 370;
				const lift = Math.sin(u * Math.PI) * 70;
				return <path key={k} d={`M540 830 Q ${540 + cos * 190} ${790 - lift} ${xr} ${820 - lift * 0.4} L ${xr} ${1160 - lift * 0.4} Q ${540 + cos * 190} ${1130 - lift} 540 1170 Z`} fill="rgba(237,235,230,0.04)" stroke={INK} strokeWidth={1.4} strokeDasharray="2 6" opacity={0.8} />;
			})}
		</svg>
	);
};

// ═══════════ LINHAGEM: NOMES + RETRATOS DOS PENSADORES ═══════════
const FACES: Record<string, string> = {PLATÃO: 'platao', ARISTÓTELES: 'aristoteles', AGOSTINHO: 'agostinho', 'TOMÁS DE AQUINO': 'aquino', DESCARTES: 'descartes', SÓCRATES: 'busto'};
const Lineage: React.FC = () => {
	const t = useT();
	const lin = win(t, K.lineage + 0.4, K.img1 + 0.1, 0.4, 0.4);
	if (lin <= 0) return null;
	const span = K.img1 - K.lineage - 0.8;
	return (
		<AbsoluteFill style={{opacity: lin}}>
			{LINE_NODES.map(([y, name, yr], k) => {
				const at = K.lineage + 0.5 + (k / (LINE_NODES.length - 1)) * span;
				const p = E_IN(ci(t, [at, at + 0.4], [0, 1]));
				const side = k % 2 ? 1 : -1;
				const face = FACES[name];
				return (
					<React.Fragment key={name}>
						<div style={{position: 'absolute', top: y - 14, [side > 0 ? 'left' : 'right']: 584, fontFamily: MONO, fontSize: 19, letterSpacing: 3, color: INK, opacity: p, textAlign: side > 0 ? 'left' : 'right'}}>
							{name}
							<div style={{fontSize: 15, opacity: 0.5, marginTop: 4}}>{yr}</div>
						</div>
						{face && (
							<div style={{position: 'absolute', top: y - 52, [side > 0 ? 'right' : 'left']: 584, width: 104, height: 104, borderRadius: 52, overflow: 'hidden', border: '1.5px solid rgba(237,235,230,0.5)', opacity: p, transform: `scale(${0.7 + 0.3 * p})`, filter: `blur(${(1 - p) * 6}px)`}}>
								<Img src={staticFile(`img/${face}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', filter: 'grayscale(1) contrast(1.15)'}} />
							</div>
						)}
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

// ═══════════ OBRAS: ABREM NO CENTRO, PARTÍCULAS EM VOLTA, CRÉDITO EMBAIXO ═══════════
const WORKS: {a: number; b: number; key: keyof typeof FRAMES; src: string; pos: string; cap: string; sub: string}[] = [
	{a: K.img1, b: K.img2, key: 'img1', src: 'img/atenas.jpg', pos: '50% 42%', cap: 'A Escola de Atenas', sub: 'RAFAEL · 1509–1511 · VATICANO'},
	{a: K.img2, b: K.tunnel, key: 'img2', src: 'img/morte.jpg', pos: '62% 45%', cap: 'A Morte de Sócrates', sub: 'JACQUES-LOUIS DAVID · 1787 · THE MET'},
	{a: K.now, b: K.easy, key: 'now', src: 'img/busto2.jpg', pos: '50% 30%', cap: 'Sócrates', sub: 'BUSTO ROMANO · MUSEU PIO-CLEMENTINO'},
];
const Works: React.FC = () => {
	const t = useT();
	return (
		<>
			{WORKS.map((wk) => {
				if (t < wk.a || t > wk.b + 0.1) return null;
				const [x, y, w, h] = FRAMES[wk.key];
				const open = E_IO(ci(t, [wk.a + 0.25, wk.a + 0.85], [0, 1]));
				const close = E_OUT(ci(t, [wk.b - 0.5, wk.b], [0, 1]));
				const v = open * (1 - close);
				const inset = (1 - v) * 50;
				const zoom = 1.06 - 0.06 * ci(t, [wk.a, wk.b], [0, 1]);
				const cap = ci(t, [wk.a + 0.7, wk.a + 1.0], [0, 1]) * (1 - close);
				return (
					<React.Fragment key={wk.src + wk.a}>
						<div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', clipPath: `inset(${inset}% 0 ${inset}% 0)`}}>
							<Img src={staticFile(wk.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: wk.pos, transform: `scale(${zoom})`, filter: 'grayscale(1) contrast(1.12)'}} />
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: y + h + 44, textAlign: 'center', opacity: cap, transform: `translateY(${(1 - cap) * 12}px)`}}>
							<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: INK}}>{wk.cap}</div>
							<div style={{fontFamily: MONO, fontSize: 17, letterSpacing: 4, color: INK, opacity: 0.55, marginTop: 8}}>{wk.sub}</div>
						</div>
					</React.Fragment>
				);
			})}
		</>
	);
};

// ═══════════ TÚNEL DE RESPOSTAS (balões vindo em direção à câmera) ═══════════
const ANSWERS = ['Sim.', 'Depende.', 'É óbvio.', 'Com certeza.', 'Claro que sim.', 'Não.', '42.', 'Porque sim.', 'Todo mundo sabe.', 'Já te respondi.'];
const Balloons: React.FC = () => {
	const t = useT();
	const o = win(t, K.tunnel + 0.2, K.ask + 0.1, 0.4, 0.35);
	if (o <= 0) return null;
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			{ANSWERS.map((txt, k) => {
				const z = (((k / ANSWERS.length + (t - K.tunnel) * 0.32) % 1) + 1) % 1;
				const dd = 0.25 + (1 - z) * 5;
				const a = random('ba' + k) * Math.PI * 2;
				const rr = 260 / dd + 40;
				const x = 540 + Math.cos(a) * rr;
				const y = 900 + Math.sin(a) * rr * 1.1;
				const s = Math.min(2.2, 0.35 + 1.1 / dd);
				const op = ci(z, [0.05, 0.3], [0, 1]) * ci(z, [0.85, 0.98], [1, 0]);
				const bw = txt.length * 17 + 50;
				return (
					<g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
						<rect x={-bw / 2} y={-30} width={bw} height={60} rx={30} fill="rgba(5,5,5,0.7)" stroke={INK} strokeWidth={1.2 / s} />
						<path d={`M ${-bw / 2 + 26} 28 L ${-bw / 2 + 14} 48 L ${-bw / 2 + 44} 29`} fill="rgba(5,5,5,0.7)" stroke={INK} strokeWidth={1.2 / s} />
						<text x={0} y={9} fill={INK} fontFamily={INTER} fontSize={26} textAnchor="middle">
							{txt}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

// ═══════════ EASTER EGG: BRABO SPACE ═══════════
const BraboSpace: React.FC = () => {
	const t = useT();
	const a = K.prompt;
	const o = win(t, a, K.skill + 0.2, 0.5, 0.5);
	if (o <= 0) return null;
	const q = 'Consegue fazer um vídeo como esse, sobre Sócrates?';
	const nq = Math.floor(ci(t, [a + 0.3, a + 1.6], [0, q.length]));
	const ans = 'Consigo. Vou desenhar Sócrates em pontilhismo, passar pelas obras clássicas e narrar com a sua voz.';
	const t0 = rt(29.66) - 0.6;
	const na = Math.floor(ci(t, [t0, t0 + 1.2], [0, ans.length]));
	const secs = Math.max(0, Math.min(1.9, t - (a + 1.8)));
	const card = E_IN(ci(t, [a, a + 0.6], [0, 1]));
	return (
		<div style={{position: 'absolute', left: 90, top: 380, width: 900, opacity: o, transform: `translateY(${(1 - card) * 30}px)`, filter: `blur(${(1 - card) * 8}px)`}}>
			<div style={{borderRadius: 34, border: '1px solid rgba(237,235,230,0.18)', background: 'rgba(12,12,12,0.92)', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '24px 30px', borderBottom: '1px solid rgba(237,235,230,0.1)'}}>
					<div style={{width: 34, height: 34, borderRadius: 10, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 20, color: '#050505'}}>B</div>
					<span style={{fontFamily: INTER, fontWeight: 700, fontSize: 28, color: INK}}>Brabo Space</span>
					<span style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: INK, opacity: 0.45}}>AGENTE · MOTION</span>
				</div>
				<div style={{padding: 30, minHeight: 520}}>
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>
						<div style={{maxWidth: 640, padding: '20px 26px', borderRadius: '26px 26px 6px 26px', background: INK, color: '#050505', fontFamily: INTER, fontSize: 30, lineHeight: 1.3}}>
							{q.slice(0, nq)}
							{nq < q.length && <span style={{opacity: Math.floor(t * 3) % 2 ? 0 : 1}}>▍</span>}
						</div>
					</div>
					{t > a + 1.8 && (
						<div style={{marginTop: 30, display: 'flex', gap: 16, alignItems: 'flex-start'}}>
							<div style={{width: 44, height: 44, borderRadius: 22, border: `1.5px solid ${INK}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 18, color: INK}}>B</div>
							<div style={{flex: 1}}>
								<div style={{fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: INK, opacity: 0.5, marginBottom: 10}}>{na < ans.length ? 'PENSANDO…' : `RESPONDIDO EM ${secs.toFixed(1).replace('.', ',')} S`}</div>
								<div style={{fontFamily: INTER, fontSize: 30, lineHeight: 1.35, color: INK}}>
									{na === 0 ? (
										<span style={{letterSpacing: 6}}>{'•••'.slice(0, 1 + (Math.floor(t * 6) % 3))}</span>
									) : (
										ans.slice(0, na)
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

/** perguntas orbitando o busto (a habilidade) */
const Orbit: React.FC = () => {
	const t = useT();
	const o = win(t, K.skill + 0.4, K.good + 0.2, 0.6, 0.3);
	if (o <= 0) return null;
	return (
		<svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
			<ellipse cx={540} cy={880} rx={400} ry={440} fill="none" stroke={INK} strokeDasharray="2 9" opacity={0.3} />
			{Array.from({length: 7}, (_, k) => {
				const a = (k / 7) * Math.PI * 2 + t * 0.35;
				return (
					<text key={k} x={540 + Math.cos(a) * 400} y={880 + Math.sin(a) * 440 + 18} fill={INK} fontFamily={SERIF} fontSize={52} textAnchor="middle" opacity={0.5 + 0.5 * Math.sin(a) ** 2}>
						?
					</text>
				);
			})}
		</svg>
	);
};

const Socrates: React.FC = () => (
	<AbsoluteFill style={{background: '#050505'}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 46%, rgba(237,235,230,0.06) 0%, transparent 70%)'}} />
		<Works />
		<Particles />
		<Ruler />
		<Pages />
		<Lineage />
		<Balloons />
		<BraboSpace />
		<Orbit />
		<Captions />
		<AbsoluteFill style={{background: '#050505', opacity: ci(useCurrentFrame() / 30, [END - 1.0, END], [0, 1])}} />
		<Audio src={staticFile('narracao.mp3')} />
	</AbsoluteFill>
);

registerRoot(() => <Composition id="Socrates" component={Socrates} durationInFrames={sec(END)} fps={30} width={W} height={H} />);
