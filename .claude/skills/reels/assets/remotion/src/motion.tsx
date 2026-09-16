/*
 * motion.tsx — the MOVING-OBJECT library (the "se mexe" heroes).
 *
 * Unlike the draw-on visuals (which animate once then settle), every component here moves
 * CONTINUOUSLY — bars pulse, dots orbit, rings expand, a rocket rises, gears mesh — for the whole
 * scene. All motion is driven by useCurrentFrame() (never CSS animation — flickers on headless
 * render). Theme-aware (useTheme: ink / accent / mode). Each centers its mass near cy≈0.30 so the
 * composition system in Reel.tsx can place it predictably.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {noise2D} from '@remotion/noise';
import {evolvePath} from '@remotion/paths';
import {useTheme, alpha} from './theme';
import {OBJETOS} from './objetos';

// small helper: draw a path up to `prog` (0..1) — used by visuals that animate a check/curve.
const Stroke: React.FC<{d: string; prog: number; color: string; w: number}> = ({d, prog, color, w}) => {
  const e = evolvePath(Math.max(0, Math.min(1, prog)), d);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
};

// soft radial halo behind an object — gives depth on dark bg, breathes slowly
const GlowDisc: React.FC<{cx: number; cy: number; r: number; color: string; op?: number; breathe?: number}> = ({cx, cy, r, color, op = 0.2, breathe = 0}) => {
  const frame = useCurrentFrame();
  const pulse = breathe ? 1 + breathe * Math.sin(frame / 19) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(color, op)} 0%, ${alpha(color, 0)} 65%)`,
        filter: 'blur(38px)',
        transform: `scale(${pulse})`,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Waveform — a center-line audio visualizer. Bars pulse up/down forever.
// Meaning: áudio / voz / narração / som / fala. (On-brand: this skill is audio→video.)
// ---------------------------------------------------------------------------
export const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const N = 41;
  const span = width * 0.82;
  const gap = span / (N - 1);
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const t = frame / fps;
  return (
    <AbsoluteFill>
      <GlowDisc cx={cx} cy={cy} r={span * 0.5} color={accent} op={0.16} breathe={0.06} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: N}).map((_, i) => {
          const env = 0.32 + 0.68 * Math.sin((i / (N - 1)) * Math.PI); // taller in the middle
          const a = (0.5 + 0.5 * Math.sin(t * 6 + i * 0.5)) * env;
          const h = (12 + a * 220) * intro;
          const x = cx - span / 2 + i * gap;
          const isAccent = i % 4 === 0;
          return (
            <rect
              key={i}
              x={x - 3.4}
              y={cy - h / 2}
              width={6.8}
              height={h}
              rx={3.4}
              fill={isAccent ? accent : ink}
              opacity={0.5 + 0.5 * a}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Orbit — a glowing nucleus with dots traveling tilted elliptical orbits forever.
// Meaning: sistema / ecossistema / tudo conectado / em torno de / núcleo.
// ---------------------------------------------------------------------------
export const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 20, mass: 0.85}});
  const enter = interpolate(intro, [0, 1], [0.7, 1]);
  const orbits = [
    {rx: width * 0.37, ry: width * 0.13, tilt: -16, speed: 0.55, phase: 0, dots: 2},
    {rx: width * 0.24, ry: width * 0.39, tilt: 24, speed: -0.42, phase: 1.7, dots: 2},
    {rx: width * 0.43, ry: width * 0.25, tilt: 68, speed: 0.34, phase: 3.1, dots: 3},
  ];
  const dotColors = [ink, accent, ink];
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${enter})`}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.32} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {orbits.map((o, k) => (
          <g key={k} transform={`translate(${cx},${cy}) rotate(${o.tilt})`}>
            <ellipse rx={o.rx} ry={o.ry} fill="none" stroke={alpha(ink, 0.28)} strokeWidth={2.2} />
            {Array.from({length: o.dots}).map((_, j) => {
              const ang = (frame / fps) * o.speed * Math.PI * 2 + o.phase + (j / o.dots) * Math.PI * 2;
              const dx = o.rx * Math.cos(ang);
              const dy = o.ry * Math.sin(ang);
              const front = Math.sin(ang) > 0;
              const col = j === 0 ? dotColors[k] : j % 2 ? accent : ink;
              return <circle key={j} cx={dx} cy={dy} r={front ? 10 : 6} fill={col} opacity={front ? 1 : 0.32} />;
            })}
          </g>
        ))}
      </svg>
      {/* nucleus core */}
      <GlowDisc cx={cx} cy={cy} r={width * 0.1} color={accent} op={0.5} />
      <div
        style={{
          position: 'absolute',
          left: cx - width * 0.07,
          top: cy - width * 0.07,
          width: width * 0.14,
          height: width * 0.14,
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%, #ffffff 0%, ${ink} 22%, ${alpha(accent, 0.85)} 50%, ${alpha(accent, 0)} 80%)`,
          filter: 'blur(1px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ripple — concentric rings expanding outward from a pulsing core, forever.
// Meaning: alcance / viraliza / espalha / sinal / impacto / onda.
// ---------------------------------------------------------------------------
export const Ripple: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const N = 6;
  const maxR = width * 0.54;
  const period = fps * 2.4;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const corePulse = 1 + 0.16 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.2} color={accent} op={0.34} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: N}).map((_, k) => {
          const local = (((frame + k * (period / N)) % period) + period) % period / period; // 0..1
          const r = local * maxR;
          const ry = r * 0.72; // flattened rings: fill horizontally, stay clear of the text below
          const op = (1 - local) * 0.8 * Math.min(1, local * 7);
          // a dot riding the crest of each ring (the signal reaching out)
          const ang = (k * 1.4 + 0.5) * Math.PI;
          return (
            <g key={k}>
              <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="none" stroke={k % 2 ? accent : ink} strokeWidth={interpolate(local, [0, 1], [5, 1.2])} opacity={op} />
              <circle cx={cx + r * Math.cos(ang)} cy={cy + ry * Math.sin(ang)} r={interpolate(local, [0, 1], [7, 2])} fill={k % 2 ? ink : accent} opacity={op * 1.1} />
            </g>
          );
        })}
      </svg>
      {/* pulsing core */}
      <GlowDisc cx={cx} cy={cy} r={width * 0.08} color={accent} op={0.55} />
      <div
        style={{
          position: 'absolute',
          left: cx - width * 0.045,
          top: cy - width * 0.045,
          width: width * 0.09,
          height: width * 0.09,
          borderRadius: '50%',
          background: `radial-gradient(circle, #ffffff 0%, ${accent} 45%, ${alpha(accent, 0)} 80%)`,
          transform: `scale(${corePulse})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Rocket — a minimalist rocket rising, flame flickering, exhaust + starfield
// streaking DOWNWARD (so it reads as going up). Moves forever.
// Meaning: lançar / decolar / crescer rápido / subir / turbo.
// ---------------------------------------------------------------------------
export const Rocket: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 16, mass: 0.7}});
  const bob = Math.sin(frame / 5) * 4; // engine vibration
  const sway = Math.sin(frame / 23) * 6;
  const flame = 0.55 + 0.45 * Math.abs(Math.sin(frame / 2.3)); // flicker
  const U = width * 0.0019; // unit scale for the rocket body
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy + height * 0.06} r={width * 0.2} color={accent} op={0.22} breathe={0.05} />
      {/* downward speed streaks (background = rocket rising) */}
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: 16}).map((_, i) => {
          const lx = (noise2D('rkx', i, 0) * 0.5 + 0.5) * width;
          const speed = 6 + (noise2D('rks', i, 0) * 0.5 + 0.5) * 10;
          const ly = ((frame * speed + i * 130) % (height + 200)) - 100;
          const len = 22 + (noise2D('rkl', i, 0) * 0.5 + 0.5) * 40;
          return <line key={i} x1={lx} y1={ly} x2={lx} y2={ly + len} stroke={ink} strokeWidth={1.4} opacity={0.18} />;
        })}
        {/* exhaust particles falling away below the rocket */}
        {Array.from({length: 14}).map((_, i) => {
          const life = ((frame * 9 + i * 17) % 90) / 90; // 0..1
          const py = cy + 86 * U + life * height * 0.16;
          const px = cx + sway + (noise2D('rke', i, 0)) * 26 * (0.3 + life);
          const op = (1 - life) * 0.5;
          return <circle key={i} cx={px} cy={py} r={interpolate(life, [0, 1], [5, 1])} fill={i % 2 ? accent : ink} opacity={op} />;
        })}
      </svg>
      {/* the rocket */}
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', overflow: 'visible', transform: `translate(${sway}px, ${bob}px)`}}
      >
        <g transform={`translate(${cx},${cy})`} stroke={ink} strokeWidth={3.2} strokeLinejoin="round" strokeLinecap="round" fill="none">
          {/* flame (under the body) */}
          <path
            d={`M ${-16 * U} ${66 * U} Q ${0} ${(96 + flame * 70) * U} ${16 * U} ${66 * U} Z`}
            fill={alpha(accent, 0.85)}
            stroke="none"
            opacity={0.9}
          />
          <path
            d={`M ${-8 * U} ${66 * U} Q ${0} ${(96 + flame * 40) * U} ${8 * U} ${66 * U} Z`}
            fill="#ffffff"
            stroke="none"
            opacity={0.85}
          />
          {/* body */}
          <path d={`M 0 ${-86 * U} C ${30 * U} ${-58 * U} ${30 * U} ${30 * U} ${20 * U} ${66 * U} L ${-20 * U} ${66 * U} C ${-30 * U} ${30 * U} ${-30 * U} ${-58 * U} 0 ${-86 * U} Z`} fill={alpha(ink, 0.06)} />
          {/* window */}
          <circle cx={0} cy={-20 * U} r={13 * U} stroke={accent} fill={alpha(accent, 0.2)} />
          {/* fins */}
          <path d={`M ${-20 * U} ${30 * U} L ${-44 * U} ${70 * U} L ${-20 * U} ${60 * U}`} fill={alpha(ink, 0.06)} />
          <path d={`M ${20 * U} ${30 * U} L ${44 * U} ${70 * U} L ${20 * U} ${60 * U}`} fill={alpha(ink, 0.06)} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Gears — interlocking gears rotating (opposite directions) forever.
// Meaning: automação / funciona sozinho / engrenagem / mecanismo / processo.
// ---------------------------------------------------------------------------
const Gear: React.FC<{cx: number; cy: number; r: number; teeth: number; rot: number; color: string}> = ({cx, cy, r, teeth, rot, color}) => {
  const tw = (2 * Math.PI * r) / teeth * 0.52; // tooth width
  const th = r * 0.22; // tooth height
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
      {Array.from({length: teeth}).map((_, i) => (
        <rect
          key={i}
          x={-tw / 2}
          y={-r - th * 0.7}
          width={tw}
          height={th}
          rx={tw * 0.28}
          transform={`rotate(${(i / teeth) * 360})`}
          fill={color}
        />
      ))}
      <circle r={r} fill="none" stroke={color} strokeWidth={r * 0.16} />
      <circle r={r * 0.34} fill="none" stroke={color} strokeWidth={r * 0.1} />
      <circle r={r * 0.08} fill={color} />
    </g>
  );
};

export const Gears: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.8}});
  const enter = interpolate(intro, [0, 1], [0.74, 1]);
  const rA = width * 0.2;
  const rB = width * 0.14;
  const rC = width * 0.1;
  const speed = (frame / fps) * 42; // deg/s base
  // mesh: B and C spin opposite to A, scaled by gear ratio so teeth track
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${enter})`}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.2} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <Gear cx={cx - width * 0.13} cy={cy - height * 0.02} r={rA} teeth={14} rot={speed} color={ink} />
        <Gear cx={cx + width * 0.16} cy={cy + height * 0.01} r={rB} teeth={10} rot={-speed * (14 / 10) + 12} color={accent} />
        <Gear cx={cx + width * 0.04} cy={cy + height * 0.11} r={rC} teeth={8} rot={speed * (14 / 8) + 6} color={ink} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Pipeline — packets travel a track L→R through nodes, turning from raw (square, ink)
// into finished (rounded, accent) past the middle node. Loops forever.
// Meaning: transforma X em Y / processo / esteira / fluxo / passo a passo.
// ---------------------------------------------------------------------------
export const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cy = height * 0.3;
  const x0 = width * 0.13;
  const x1 = width * 0.87;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const nodes = [x0, (x0 + x1) / 2, x1];
  const P = 7;
  const travel = fps * 2.4;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={width / 2} cy={cy} r={width * 0.36} color={accent} op={0.14} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <line x1={x0} y1={cy} x2={x1} y2={cy} stroke={alpha(ink, 0.22)} strokeWidth={3} strokeDasharray="2 16" strokeLinecap="round" />
        {nodes.map((nx, i) => (
          <rect key={i} x={nx - 28} y={cy - 28} width={56} height={56} rx={14} fill={alpha(ink, 0.06)} stroke={i === 1 ? accent : ink} strokeWidth={3.2} />
        ))}
        {Array.from({length: P}).map((_, i) => {
          const p = (frame / travel + i / P) % 1;
          const x = x0 + p * (x1 - x0);
          const past = p >= 0.5;
          const s = 17 + 7 * Math.sin(p * Math.PI);
          const op = Math.min(1, p * 8) * Math.min(1, (1 - p) * 8);
          return <rect key={i} x={x - s / 2} y={cy - s / 2} width={s} height={s} rx={past ? s / 2 : 4} fill={past ? accent : ink} opacity={op} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Radar — a sweeping line rotates over range rings; blips light up as it passes them.
// Meaning: busca / encontra / varredura / analisa / monitora / descobre.
// ---------------------------------------------------------------------------
export const Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const R = width * 0.36;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.8}});
  const sweep = (frame / fps) * 95; // deg/s
  const sweepMod = ((sweep % 360) + 360) % 360;
  const blips = [
    {a: 35, r: 0.5},
    {a: 115, r: 0.82},
    {a: 200, r: 0.42},
    {a: 262, r: 0.9},
    {a: 320, r: 0.66},
  ];
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${interpolate(intro, [0, 1], [0.8, 1])})`}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.22} color={accent} op={0.2} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {[0.34, 0.67, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={R * f} fill="none" stroke={alpha(ink, 0.16)} strokeWidth={1.5} />
        ))}
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={alpha(ink, 0.1)} strokeWidth={1} />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={alpha(ink, 0.1)} strokeWidth={1} />
        {/* trailing sweep */}
        {[0, 5, 10, 16, 24, 34].map((off, j) => (
          <line key={j} transform={`translate(${cx},${cy}) rotate(${sweep - off})`} x1={0} y1={0} x2={R} y2={0} stroke={accent} strokeWidth={3.2} opacity={0.55 * (1 - off / 42)} />
        ))}
        {blips.map((b, i) => {
          const bx = cx + R * b.r * Math.cos((b.a * Math.PI) / 180);
          const by = cy + R * b.r * Math.sin((b.a * Math.PI) / 180);
          const diff = (b.a - sweepMod + 360) % 360;
          const lit = diff < 70 ? 1 - diff / 70 : 0;
          return <circle key={i} cx={bx} cy={by} r={5 + lit * 8} fill={accent} opacity={0.22 + lit * 0.78} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Constellation — drifting star nodes with links that fade in/out between near ones,
// twinkling forever. Meaning: rede / comunidade / conexões / pessoas / colaboração.
// ---------------------------------------------------------------------------
export const Constellation: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 20, mass: 0.85}});
  const N = 14;
  const R = width * 0.42;
  const nodes = Array.from({length: N}).map((_, i) => {
    const ang = (i / N) * Math.PI * 2 + noise2D('cn', i, 0);
    const rr = R * (0.28 + (noise2D('cr', i, 0) * 0.5 + 0.5) * 0.72);
    const dx = noise2D('cdx', i, frame / 130) * 20;
    const dy = noise2D('cdy', i, frame / 130) * 20;
    return {x: cx + rr * Math.cos(ang) + dx, y: cy + rr * 0.72 * Math.sin(ang) + dy, tw: 0.5 + 0.5 * Math.sin(frame / 12 + i)};
  });
  const maxD = R * 0.5;
  const edges: {ax: number; ay: number; bx: number; by: number; d: number; k: number}[] = [];
  let k = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < maxD) edges.push({ax: nodes[i].x, ay: nodes[i].y, bx: nodes[j].x, by: nodes[j].y, d, k: k++});
    }
  }
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.3} color={accent} op={0.14} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {edges.map((e) => {
          const op = (1 - e.d / maxD) * (0.28 + 0.32 * Math.sin(frame / 18 + e.k));
          return <line key={e.k} x1={e.ax} y1={e.ay} x2={e.bx} y2={e.by} stroke={ink} strokeWidth={1.3} opacity={Math.max(0, op)} />;
        })}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={3.5 + n.tw * 3.5} fill={i % 5 === 0 ? accent : ink} opacity={0.5 + n.tw * 0.5} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Brain — a neural cluster (two lobes) with synapse pulses firing along edges, forever.
// Meaning: IA / inteligência / pensar / aprender / cérebro / neural.
// ---------------------------------------------------------------------------
export const Brain: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 20, mass: 0.85}});
  const S = width * 0.3;
  const nodes = Array.from({length: 14}).map((_, i) => {
    const lobe = i < 7 ? -1 : 1;
    const a = noise2D('bn', i, 0) * Math.PI * 2;
    const r = (0.2 + (noise2D('br', i, 0) * 0.5 + 0.5) * 0.8) * S;
    const dx = noise2D('bdx', i, frame / 120) * 10;
    const dy = noise2D('bdy', i, frame / 120) * 10;
    return {x: cx + lobe * S * 0.42 + Math.cos(a) * r * 0.66 + dx, y: cy + Math.sin(a) * r * 0.82 + dy};
  });
  const edges: {ax: number; ay: number; bx: number; by: number; k: number}[] = [];
  let k = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < S * 0.62) edges.push({ax: nodes[i].x, ay: nodes[i].y, bx: nodes[j].x, by: nodes[j].y, k: k++});
    }
  }
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${interpolate(intro, [0, 1], [0.82, 1])})`}}>
      <GlowDisc cx={cx} cy={cy} r={S * 1.1} color={accent} op={0.16} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {edges.map((e) => {
          const phase = (frame / (fps * 1.4) + (e.k % 7) / 7) % 1;
          const px = e.ax + (e.bx - e.ax) * phase;
          const py = e.ay + (e.by - e.ay) * phase;
          const fire = Math.max(0, Math.sin(frame / 9 + e.k));
          return (
            <g key={e.k}>
              <line x1={e.ax} y1={e.ay} x2={e.bx} y2={e.by} stroke={alpha(ink, 0.16)} strokeWidth={1.2} />
              <circle cx={px} cy={py} r={2.5 + fire * 2.5} fill={accent} opacity={0.35 + fire * 0.6} />
            </g>
          );
        })}
        {nodes.map((n, i) => {
          const pulse = 0.6 + 0.4 * Math.sin(frame / 10 + i);
          return <circle key={i} cx={n.x} cy={n.y} r={4 + pulse * 3} fill={i % 4 === 0 ? accent : ink} opacity={0.55 + pulse * 0.45} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Burst — rays + sparkles exploding from a bright core, pulsing + slowly turning, forever.
// Meaning: ideia / insight / aha / estourou / eureka / sacada.
// ---------------------------------------------------------------------------
export const Burst: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 14, mass: 0.6}});
  const rot = (frame / fps) * 8;
  const N = 12;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.32} breathe={0.08} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
          {Array.from({length: N}).map((_, i) => {
            const ang = (i / N) * Math.PI * 2;
            const long = i % 2 === 0;
            const r0 = width * 0.06;
            const r1 = width * (long ? 0.27 : 0.18) * (0.8 + pulse * 0.3);
            return <line key={i} x1={Math.cos(ang) * r0} y1={Math.sin(ang) * r0} x2={Math.cos(ang) * r1} y2={Math.sin(ang) * r1} stroke={i % 3 === 0 ? accent : ink} strokeWidth={4} strokeLinecap="round" opacity={long ? 0.9 : 0.6} />;
          })}
          {Array.from({length: N}).map((_, i) => {
            const ang = (i / N) * Math.PI * 2;
            const r1 = width * (i % 2 === 0 ? 0.27 : 0.18) * (0.8 + pulse * 0.3);
            return <circle key={'s' + i} cx={Math.cos(ang) * r1} cy={Math.sin(ang) * r1} r={i % 2 === 0 ? 4 : 2.5} fill={accent} opacity={0.6 + pulse * 0.4} />;
          })}
        </g>
        <circle cx={cx} cy={cy} r={width * 0.05 * (0.9 + pulse * 0.2)} fill="#ffffff" opacity={0.92} />
        <circle cx={cx} cy={cy} r={width * 0.078} fill="none" stroke={accent} strokeWidth={3} opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Funnel — dots pour in wide at the top, converge through the funnel, exit as a focused stream.
// Meaning: funil / filtra / seleciona / converte / qualifica.
// ---------------------------------------------------------------------------
export const Funnel: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const topY = cy - height * 0.12;
  const midY = cy + height * 0.02;
  const botY = cy + height * 0.13;
  const topHalf = width * 0.26;
  const stemHalf = width * 0.04;
  const d = `M ${cx - topHalf} ${topY} L ${cx + topHalf} ${topY} L ${cx + stemHalf} ${midY} L ${cx + stemHalf} ${botY} L ${cx - stemHalf} ${botY} L ${cx - stemHalf} ${midY} Z`;
  const P = 11;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.3} color={accent} op={0.14} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <path d={d} fill={alpha(ink, 0.05)} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
        {Array.from({length: P}).map((_, i) => {
          const p = (frame / (fps * 2) + i / P) % 1;
          const startX = cx + noise2D('fl', i, 0) * topHalf * 0.9;
          const conv = Math.min(1, p / 0.55);
          const x = startX + (cx - startX) * conv;
          const y = topY + p * (botY - topY);
          const past = p > 0.6;
          const op = Math.min(1, p * 8) * Math.min(1, (1 - p) * 8);
          return <circle key={i} cx={x} cy={y} r={past ? 7 : 5} fill={past ? accent : ink} opacity={op} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Coins — a stack of coins with one dropping onto it on a loop. Meaning: dinheiro /
// faturamento / lucro / investimento / preço (the COPY guard forbids income promises, not the metaphor).
// ---------------------------------------------------------------------------
export const Coins: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const coinW = width * 0.2;
  const coinH = coinW * 0.34;
  const baseY = cy + height * 0.11;
  const stack = 5;
  const drop = (frame / (fps * 1.3)) % 1;
  const topOfStack = baseY - (stack - 1) * coinH * 0.82;
  const dropY = (cy - height * 0.17) + drop * (topOfStack - coinH - (cy - height * 0.17));
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.2} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: stack}).map((_, i) => {
          const y = baseY - i * coinH * 0.82;
          const top = i === stack - 1;
          return (
            <g key={i}>
              <ellipse cx={cx} cy={y} rx={coinW / 2} ry={coinH / 2} fill={alpha(top ? accent : ink, 0.1)} stroke={top ? accent : ink} strokeWidth={3} />
              <ellipse cx={cx} cy={y - coinH * 0.16} rx={coinW / 2} ry={coinH / 2} fill="none" stroke={alpha(top ? accent : ink, 0.4)} strokeWidth={1.5} />
            </g>
          );
        })}
        <ellipse cx={cx} cy={dropY} rx={coinW / 2} ry={coinH / 2} fill={alpha(accent, 0.12)} stroke={accent} strokeWidth={3} />
        <ellipse cx={cx} cy={dropY - coinH * 0.16} rx={coinW / 2} ry={coinH / 2} fill="none" stroke={alpha(accent, 0.5)} strokeWidth={1.5} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Checklist — items get checked off one by one (the tick draws on), looping.
// Meaning: passo a passo / checklist / método / pronto / organizado / concluído.
// ---------------------------------------------------------------------------
export const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const rows = 4;
  const rowH = height * 0.075;
  const startY = cy - ((rows - 1) * rowH) / 2;
  const boxX = cx - width * 0.27;
  const box = width * 0.06;
  const cyc = fps * 0.5;
  const loopLen = rows * cyc + fps * 1.2;
  const localFrame = frame % loopLen;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.32} color={accent} op={0.12} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: rows}).map((_, i) => {
          const y = startY + i * rowH;
          const t0 = i * cyc + 10;
          const checked = localFrame > t0;
          const prog = checked ? interpolate(localFrame, [t0, t0 + 11], [0, 1], {extrapolateRight: 'clamp'}) : 0;
          const checkD = `M ${boxX + box * 0.22} ${y + box * 0.04} L ${boxX + box * 0.43} ${y + box * 0.24} L ${boxX + box * 0.82} ${y - box * 0.26}`;
          const lineW = width * 0.3 * (0.55 + ((i * 7) % 5) * 0.1);
          return (
            <g key={i}>
              <rect x={boxX} y={y - box / 2} width={box} height={box} rx={box * 0.22} fill={checked ? alpha(accent, 0.14) : 'none'} stroke={checked ? accent : ink} strokeWidth={3.2} />
              {checked ? <Stroke d={checkD} prog={prog} color={accent} w={box * 0.16} /> : null}
              <rect x={boxX + box * 1.5} y={y - box * 0.16} width={lineW} height={box * 0.32} rx={box * 0.16} fill={alpha(ink, checked ? 0.5 : 0.22)} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Globe — a wireframe globe spinning (longitudes sweep) with pulsing surface markers.
// Meaning: global / mundo / internet / alcance mundial / em todo lugar / online.
// ---------------------------------------------------------------------------
export const Globe: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const R = width * 0.27;
  const intro = spring({frame, fps, config: {damping: 20, mass: 0.85}});
  const spin = (frame / fps) * 0.6;
  const longs = 6;
  const lats = [-0.6, -0.3, 0, 0.3, 0.6];
  const markers = [
    {a: 0.6, l: 0.2},
    {a: 2.4, l: -0.35},
    {a: 4.3, l: 0.45},
  ];
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${interpolate(intro, [0, 1], [0.82, 1])})`}}>
      <GlowDisc cx={cx} cy={cy} r={R * 1.25} color={accent} op={0.18} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <circle cx={cx} cy={cy} r={R} fill={alpha(ink, 0.04)} stroke={ink} strokeWidth={2.5} />
        {Array.from({length: longs}).map((_, i) => {
          const phase = spin + (i / longs) * Math.PI;
          const rx = Math.abs(Math.cos(phase)) * R;
          const op = 0.12 + Math.abs(Math.cos(phase)) * 0.2;
          return <ellipse key={i} cx={cx} cy={cy} rx={Math.max(1, rx)} ry={R} fill="none" stroke={ink} strokeWidth={1.4} opacity={op} />;
        })}
        {lats.map((l, i) => {
          const yy = cy + l * R;
          const rr = Math.sqrt(Math.max(0, 1 - l * l)) * R;
          return <ellipse key={i} cx={cx} cy={yy} rx={rr} ry={rr * 0.18} fill="none" stroke={alpha(ink, 0.22)} strokeWidth={1.2} />;
        })}
        {markers.map((m, i) => {
          const phase = m.a + spin;
          const visible = Math.cos(phase) > -0.1; // hide when on the far side
          const x = cx + Math.sin(phase) * R * Math.sqrt(Math.max(0, 1 - m.l * m.l));
          const y = cy + m.l * R;
          const pulse = 0.5 + 0.5 * Math.sin(frame / 8 + i * 2);
          return visible ? <circle key={i} cx={x} cy={y} r={4 + pulse * 4} fill={accent} opacity={0.5 + pulse * 0.5} /> : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Magnet — a horseshoe magnet pulling dots in toward its poles, forever.
// Meaning: atrai / atração / imã de clientes / puxa / capta / lead.
// ---------------------------------------------------------------------------
export const Magnet: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const w = width * 0.13;
  const h = height * 0.1;
  const th = width * 0.05;
  const mTop = cy - h * 0.3;
  const d = `M ${cx - w} ${mTop} L ${cx - w} ${cy} C ${cx - w} ${cy + h} ${cx + w} ${cy + h} ${cx + w} ${cy} L ${cx + w} ${mTop}`;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.18} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: 9}).map((_, i) => {
          const p = (frame / (fps * 1.7) + i / 9) % 1;
          const startX = cx + noise2D('mg', i, 0) * width * 0.34;
          const startY = mTop - height * 0.15 + noise2D('mgy', i, 0) * height * 0.04;
          const targetX = cx + (i % 2 ? w : -w);
          const x = startX + (targetX - startX) * p;
          const y = startY + (mTop - startY) * p;
          const op = Math.min(1, p * 6) * Math.min(1, (1 - p) * 4);
          return <circle key={i} cx={x} cy={y} r={6} fill={accent} opacity={op} />;
        })}
        <path d={d} fill="none" stroke={ink} strokeWidth={th} strokeLinecap="butt" />
        <rect x={cx - w - th / 2} y={mTop - th * 0.1} width={th} height={th * 0.7} fill={accent} />
        <rect x={cx + w - th / 2} y={mTop - th * 0.1} width={th} height={th * 0.7} fill={accent} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Hourglass — sand drains from the top chamber to the bottom, streaming at the neck, looping.
// Meaning: tempo / rápido / agora / prazo / urgência / economia de tempo.
// ---------------------------------------------------------------------------
export const Hourglass: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const w = width * 0.15;
  const h = height * 0.13;
  const topY = cy - h;
  const botY = cy + h;
  const midY = cy;
  const fill = (frame / (fps * 2.6)) % 1;
  // top sand: triangle anchored at the neck (apex), shrinking as it drains
  const ts = 1 - fill;
  const topSand = `M ${cx} ${midY} L ${cx - w * ts} ${midY - (midY - topY) * ts} L ${cx + w * ts} ${midY - (midY - topY) * ts} Z`;
  // bottom sand: trapezoid growing up from the base
  const yLevel = botY - (botY - midY) * fill;
  const bw = w * (1 - fill);
  const botSand = `M ${cx - w} ${botY} L ${cx + w} ${botY} L ${cx + bw} ${yLevel} L ${cx - bw} ${yLevel} Z`;
  const topGlass = `M ${cx - w} ${topY} L ${cx + w} ${topY} L ${cx} ${midY} Z`;
  const botGlass = `M ${cx - w} ${botY} L ${cx + w} ${botY} L ${cx} ${midY} Z`;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.18} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <path d={topSand} fill={alpha(accent, 0.85)} />
        <path d={botSand} fill={alpha(accent, 0.85)} />
        {fill > 0.02 && fill < 0.98 ? <line x1={cx} y1={midY} x2={cx} y2={yLevel} stroke={accent} strokeWidth={3} opacity={0.8} /> : null}
        <path d={topGlass} fill="none" stroke={ink} strokeWidth={3.4} strokeLinejoin="round" />
        <path d={botGlass} fill="none" stroke={ink} strokeWidth={3.4} strokeLinejoin="round" />
        <line x1={cx - w * 1.08} y1={topY} x2={cx + w * 1.08} y2={topY} stroke={ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={cx - w * 1.08} y1={botY} x2={cx + w * 1.08} y2={botY} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Lock — a padlock whose shackle lifts open with a glow, then resets, looping.
// Meaning: destrava / libera / acesso / exclusivo / segredo / desbloqueia.
// ---------------------------------------------------------------------------
export const Lock: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.31;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const bw = width * 0.22;
  const bh = height * 0.13;
  const bodyY = cy + height * 0.03;
  const cyc = (frame / (fps * 2.2)) % 1;
  const open = interpolate(cyc, [0.15, 0.4, 0.85, 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lift = open * bh * 0.45;
  const rot = open * 24;
  const shackleTop = bodyY - bh / 2;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.14 + open * 0.22} breathe={0.04} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${cx},${shackleTop}) translate(0,${-lift}) rotate(${rot})`}>
          <path d={`M ${-bw * 0.28} 4 L ${-bw * 0.28} ${-bh * 0.32} A ${bw * 0.28} ${bw * 0.28} 0 0 1 ${bw * 0.28} ${-bh * 0.32} L ${bw * 0.28} 4`} fill="none" stroke={open > 0.5 ? accent : ink} strokeWidth={width * 0.022} strokeLinecap="round" />
        </g>
        <rect x={cx - bw / 2} y={bodyY - bh / 2} width={bw} height={bh} rx={bw * 0.12} fill={alpha(ink, 0.07)} stroke={ink} strokeWidth={3.4} />
        <circle cx={cx} cy={bodyY} r={bw * 0.07} fill={accent} />
        <rect x={cx - bw * 0.022} y={bodyY} width={bw * 0.044} height={bh * 0.24} fill={accent} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Typing — a line of text fills in (caret) above a keyboard whose keys light in sequence.
// Meaning: escrever / criar / digitar / postar / produzir / texto.
// ---------------------------------------------------------------------------
export const Typing: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const cols = 10;
  const rows = 3;
  const kw = width * 0.052;
  const gap = width * 0.012;
  const kbW = cols * kw + (cols - 1) * gap;
  const kbX = cx - kbW / 2;
  const kbY = cy + height * 0.0;
  const pressIdx = Math.floor(frame / 4) % (cols * rows);
  const totalChars = 14;
  const charW = width * 0.02;
  const typed = Math.floor(((frame / (fps * 2.2)) % 1) * totalChars);
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy + height * 0.04} r={width * 0.34} color={accent} op={0.12} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {Array.from({length: totalChars}).map((_, i) => {
          const lx = cx - (totalChars * charW) / 2 + i * charW;
          const on = i < typed;
          return <rect key={i} x={lx} y={kbY - height * 0.07} width={charW * 0.7} height={height * 0.013} rx={2} fill={on ? (i === typed - 1 ? accent : ink) : alpha(ink, 0.15)} />;
        })}
        {Array.from({length: rows}).map((_, r) =>
          Array.from({length: cols}).map((__, c) => {
            const idx = r * cols + c;
            const x = kbX + c * (kw + gap);
            const y = kbY + r * (kw * 0.7 + gap);
            const lit = idx === pressIdx;
            return <rect key={idx} x={x} y={y} width={kw} height={kw * 0.7} rx={kw * 0.16} fill={lit ? alpha(accent, 0.3) : alpha(ink, 0.06)} stroke={lit ? accent : alpha(ink, 0.4)} strokeWidth={lit ? 3 : 2} />;
          })
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ===========================================================================
// REAL-OBJECT heroes — recognizable things (a viewer names them instantly) with motion that ENACTS
// the concept. These "objetos reais" land harder than abstract line-clusters.
// ===========================================================================

// Lightbulb — a real bulb that clicks ON (filament lights, rays flash, glow blooms), looping.
// Meaning: ideia / sacou / clareou / insight / acendeu / solução.
export const Lightbulb: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const cyc = (frame / (fps * 2.4)) % 1;
  const on = interpolate(cyc, [0.1, 0.24, 0.85, 1], [0.15, 1, 1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = interpolate(cyc, [0.1, 0.2, 0.34], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const r = width * 0.12;
  const by = cy - r * 0.35;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={by} r={width * 0.22} color={accent} op={0.1 + on * 0.3} breathe={0} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {flash > 0.01
          ? Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const r0 = r * 1.25;
              const r1 = r * (1.3 + 0.55 * flash);
              return <line key={i} x1={cx + Math.cos(a) * r0} y1={by + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={by + Math.sin(a) * r1} stroke={accent} strokeWidth={4} strokeLinecap="round" opacity={flash} />;
            })
          : null}
        {/* glass */}
        <circle cx={cx} cy={by} r={r} fill={alpha(accent, 0.05 + on * 0.16)} stroke={ink} strokeWidth={3.6} />
        {/* filament */}
        <path d={`M ${cx - r * 0.4} ${by + r * 0.25} Q ${cx - r * 0.2} ${by - r * 0.45} ${cx} ${by - r * 0.05} Q ${cx + r * 0.2} ${by - r * 0.45} ${cx + r * 0.4} ${by + r * 0.25}`} fill="none" stroke={on > 0.5 ? accent : alpha(ink, 0.5)} strokeWidth={3.2} strokeLinecap="round" />
        {/* neck + screw base */}
        <path d={`M ${cx - r * 0.42} ${by + r * 0.82} L ${cx - r * 0.34} ${by + r * 1.0} L ${cx + r * 0.34} ${by + r * 1.0} L ${cx + r * 0.42} ${by + r * 0.82}`} fill="none" stroke={ink} strokeWidth={3.2} strokeLinejoin="round" />
        <rect x={cx - r * 0.34} y={by + r * 1.0} width={r * 0.68} height={r * 0.5} rx={3} fill={alpha(ink, 0.1)} stroke={ink} strokeWidth={3} />
        <line x1={cx - r * 0.3} y1={by + r * 1.16} x2={cx + r * 0.3} y2={by + r * 1.16} stroke={alpha(ink, 0.55)} strokeWidth={2} />
        <line x1={cx - r * 0.3} y1={by + r * 1.32} x2={cx + r * 0.3} y2={by + r * 1.32} stroke={alpha(ink, 0.55)} strokeWidth={2} />
        <path d={`M ${cx - r * 0.18} ${by + r * 1.5} L ${cx + r * 0.18} ${by + r * 1.5} L ${cx + r * 0.1} ${by + r * 1.66} L ${cx - r * 0.1} ${by + r * 1.66} Z`} fill={ink} opacity={0.7} />
      </svg>
    </AbsoluteFill>
  );
};

// Shield — a protective shield with a scan sweeping down + a check drawing in, looping.
// Meaning: segurança / proteção / blindado / protegido / seguro / confiável.
export const Shield: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const w = width * 0.19;
  const topY = cy - height * 0.13;
  const midY = cy + height * 0.02;
  const botY = cy + height * 0.17;
  const d = `M ${cx - w} ${topY} L ${cx + w} ${topY} L ${cx + w} ${midY} C ${cx + w} ${botY - height * 0.04} ${cx + w * 0.45} ${botY} ${cx} ${botY} C ${cx - w * 0.45} ${botY} ${cx - w} ${botY - height * 0.04} ${cx - w} ${midY} Z`;
  const cyc = (frame / (fps * 2.6)) % 1;
  const checkProg = interpolate(cyc, [0.25, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scanT = (frame / (fps * 2.0)) % 1;
  const scanY = topY + scanT * (botY - topY);
  const checkD = `M ${cx - w * 0.4} ${cy + height * 0.0} L ${cx - w * 0.08} ${cy + height * 0.05} L ${cx + w * 0.45} ${cy - height * 0.06}`;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.18} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <clipPath id="shieldClip">
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={alpha(ink, 0.06)} stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />
        <g clipPath="url(#shieldClip)">
          <rect x={cx - w} y={scanY - 16} width={w * 2} height={32} fill={alpha(accent, 0.5)} opacity={scanT < 0.95 ? 0.7 : 0} />
        </g>
        <Stroke d={checkD} prog={checkProg} color={accent} w={width * 0.02} />
      </svg>
    </AbsoluteFill>
  );
};

// Trophy — a winner's cup with a shine sweeping across + sparkles, rising slightly.
// Meaning: vitória / conquista / troféu / campeão / o melhor / primeiro lugar.
export const Trophy: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 16, mass: 0.7}});
  const lift = interpolate(intro, [0, 1], [24, 0]);
  const w = width * 0.15;
  const topY = cy - height * 0.1;
  const cupBot = topY + height * 0.12;
  const bowl = `M ${cx - w} ${topY} L ${cx + w} ${topY} L ${cx + w * 0.74} ${cupBot} Q ${cx} ${cupBot + height * 0.03} ${cx - w * 0.74} ${cupBot} Z`;
  const hL = `M ${cx - w} ${topY + 8} C ${cx - w * 1.7} ${topY + 12} ${cx - w * 1.6} ${cupBot - 4} ${cx - w * 0.78} ${cupBot - height * 0.02}`;
  const hR = `M ${cx + w} ${topY + 8} C ${cx + w * 1.7} ${topY + 12} ${cx + w * 1.6} ${cupBot - 4} ${cx + w * 0.78} ${cupBot - height * 0.02}`;
  const shineT = (frame / (fps * 1.8)) % 1;
  return (
    <AbsoluteFill style={{opacity: intro, transform: `translateY(${lift}px)`}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.2} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <clipPath id="cupClip">
            <path d={bowl} />
          </clipPath>
        </defs>
        <path d={hL} fill="none" stroke={ink} strokeWidth={4} />
        <path d={hR} fill="none" stroke={ink} strokeWidth={4} />
        <path d={bowl} fill={alpha(accent, 0.12)} stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />
        <g clipPath="url(#cupClip)">
          <rect x={cx - w + (shineT * w * 2.4 - w * 0.6)} y={topY - 10} width={w * 0.4} height={height * 0.2} fill={alpha('#ffffff', 0.55)} transform={`skewX(-18)`} />
        </g>
        {/* stem + base */}
        <rect x={cx - w * 0.12} y={cupBot + height * 0.02} width={w * 0.24} height={height * 0.05} fill={alpha(ink, 0.1)} stroke={ink} strokeWidth={3} />
        <rect x={cx - w * 0.5} y={cupBot + height * 0.07} width={w} height={height * 0.025} rx={4} fill={alpha(ink, 0.1)} stroke={ink} strokeWidth={3} />
        {/* sparkles */}
        {[[-w * 0.9, -height * 0.02], [w * 0.95, height * 0.01], [w * 0.2, -height * 0.05]].map(([dx, dy], i) => {
          const tw = Math.max(0, Math.sin(frame / 7 + i * 2));
          return <circle key={i} cx={cx + dx} cy={topY + dy} r={2 + tw * 3} fill={accent} opacity={0.3 + tw * 0.7} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Phone — a smartphone with content scrolling on screen + a like/notification popping.
// Meaning: no celular / app / post / Instagram / na tela / conteúdo no feed.
export const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.8}});
  const pw = width * 0.26;
  const ph = pw * 1.5;
  const px = cx - pw / 2;
  const py = cy - ph * 0.42;
  const sx = px + pw * 0.07;
  const sy = py + ph * 0.08;
  const sw = pw * 0.86;
  const sh = ph * 0.84;
  const cardH = sh * 0.3;
  const scroll = (frame * 2.2) % (cardH + sh * 0.06);
  const popT = (frame / (fps * 2.2)) % 1;
  const pop = interpolate(popT, [0.1, 0.25, 0.6, 0.75], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${interpolate(intro, [0, 1], [0.85, 1])})`}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.26} color={accent} op={0.16} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <clipPath id="screenClip">
            <rect x={sx} y={sy} width={sw} height={sh} rx={pw * 0.05} />
          </clipPath>
        </defs>
        <rect x={px} y={py} width={pw} height={ph} rx={pw * 0.14} fill={alpha(ink, 0.07)} stroke={ink} strokeWidth={4} />
        <rect x={sx} y={sy} width={sw} height={sh} rx={pw * 0.05} fill={alpha(ink, 0.04)} stroke={alpha(ink, 0.25)} strokeWidth={1.5} />
        <g clipPath="url(#screenClip)">
          {Array.from({length: 5}).map((_, i) => {
            const cyy = sy + sh * 0.05 + i * (cardH + sh * 0.06) - scroll;
            return (
              <g key={i}>
                <rect x={sx + sw * 0.06} y={cyy} width={sw * 0.88} height={cardH} rx={pw * 0.04} fill={alpha(ink, i % 2 ? 0.07 : 0.1)} stroke={alpha(ink, 0.2)} strokeWidth={1.5} />
                <rect x={sx + sw * 0.12} y={cyy + cardH * 0.66} width={sw * 0.5} height={cardH * 0.12} rx={3} fill={alpha(i % 2 ? accent : ink, 0.5)} />
              </g>
            );
          })}
        </g>
        {/* notch + home bar */}
        <rect x={cx - pw * 0.12} y={py + ph * 0.03} width={pw * 0.24} height={ph * 0.016} rx={ph * 0.008} fill={alpha(ink, 0.5)} />
        <rect x={cx - pw * 0.14} y={py + ph * 0.95} width={pw * 0.28} height={ph * 0.01} rx={4} fill={alpha(ink, 0.4)} />
        {/* like badge pop (a heart that floats up + fades) */}
        {pop > 0.01 ? (
          <g transform={`translate(0 ${-(1 - pop) * sh * 0.1})`} opacity={pop}>
            <path d={`M ${cx + pw * 0.26} ${sy + sh * 0.22} c -7 -8 -18 -3 -18 6 c 0 8 18 16 18 16 c 0 0 18 -8 18 -16 c 0 -9 -11 -14 -18 -6 z`} fill={accent} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

// Target — a dartboard with a dart flying into the bullseye + an impact ring, looping.
// Meaning: meta / foco / alvo / acertar em cheio / objetivo / mira.
export const Target: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.8}});
  const R = width * 0.22;
  const cyc = (frame / (fps * 1.9)) % 1;
  const fly = interpolate(cyc, [0, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sx = cx + R * 1.9;
  const sy = cy - R * 1.9;
  const dx = sx + (cx - sx) * fly;
  const dy = sy + (cy - sy) * fly;
  const hit = cyc > 0.5;
  const impact = hit ? interpolate(cyc, [0.5, 0.72], [0, 1], {extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill style={{opacity: intro, transform: `scale(${interpolate(intro, [0, 1], [0.84, 1])})`}}>
      <GlowDisc cx={cx} cy={cy} r={R * 1.2} color={accent} op={0.18} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {[1, 0.74, 0.48].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={R * f} fill={i % 2 ? alpha(ink, 0.05) : alpha(accent, 0.05)} stroke={i % 2 ? accent : ink} strokeWidth={3} />
        ))}
        <circle cx={cx} cy={cy} r={R * 0.13} fill={accent} />
        {impact > 0 ? <circle cx={cx} cy={cy} r={R * 0.13 + impact * R * 0.5} fill="none" stroke={accent} strokeWidth={3 * (1 - impact)} opacity={1 - impact} /> : null}
        {/* dart */}
        <g opacity={fly > 0.02 ? 1 : 0}>
          <line x1={dx + (sx - cx) * 0.18} y1={dy + (sy - cy) * 0.18} x2={dx} y2={dy} stroke={ink} strokeWidth={5} strokeLinecap="round" />
          <path d={`M ${dx} ${dy} l ${(sx - cx) * 0.05} ${(sy - cy) * 0.05 - 8} M ${dx} ${dy} l ${(sx - cx) * 0.05 + 8} ${(sy - cy) * 0.05}`} stroke={accent} strokeWidth={4} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Plant — a sprout growing from soil, leaves unfurling, looping.
// Meaning: crescer / do zero / evoluir / semente / começar / florescer.
export const Plant: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const groundY = cy + height * 0.15;
  const cyc = (frame / (fps * 3.0)) % 1;
  const grow = interpolate(cyc, [0.05, 0.62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stemH = height * 0.26 * grow;
  const stemD = `M ${cx} ${groundY} C ${cx - width * 0.02} ${groundY - stemH * 0.5} ${cx + width * 0.02} ${groundY - stemH * 0.75} ${cx} ${groundY - stemH}`;
  const leaf = (dir: number, at: number) => {
    const ly = groundY - stemH * at;
    const s = Math.max(0, Math.min(1, (grow - at * 0.6) * 2.5));
    const lw = width * 0.075 * s * dir;
    const lh = height * 0.05 * s;
    return s > 0.02 ? <path d={`M ${cx} ${ly} Q ${cx + lw * 0.6} ${ly - lh * 1.3} ${cx + lw} ${ly - lh * 0.2} Q ${cx + lw * 0.5} ${ly + lh * 0.3} ${cx} ${ly} Z`} fill={alpha(accent, 0.18)} stroke={accent} strokeWidth={3} /> : null;
  };
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.14} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {/* soil mound */}
        <path d={`M ${cx - width * 0.13} ${groundY} Q ${cx} ${groundY - height * 0.02} ${cx + width * 0.13} ${groundY} L ${cx + width * 0.11} ${groundY + height * 0.035} L ${cx - width * 0.11} ${groundY + height * 0.035} Z`} fill={alpha(ink, 0.12)} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
        <path d={stemD} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" />
        {leaf(-1, 0.55)}
        {leaf(1, 0.78)}
        {/* tip bud */}
        {grow > 0.9 ? <circle cx={cx} cy={groundY - stemH} r={6} fill={accent} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// Megaphone — a bullhorn with sound waves pulsing out of the bell, forever.
// Meaning: divulga / anuncia / alcança / grita / espalha a voz / chamada.
export const Megaphone: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const bob = Math.sin(frame / 16) * 4;
  // cone pointing up-right
  const backX = cx - width * 0.12;
  const frontX = cx + width * 0.06;
  const bellTop = cy - height * 0.1;
  const bellBot = cy + height * 0.04;
  const backTop = cy - height * 0.04;
  const backBot = cy - height * 0.0;
  const cone = `M ${backX} ${backTop} L ${frontX} ${bellTop} L ${frontX} ${bellBot} L ${backX} ${backBot} Z`;
  return (
    <AbsoluteFill style={{opacity: intro, transform: `translateY(${bob}px)`}}>
      <GlowDisc cx={cx + width * 0.08} cy={cy - height * 0.02} r={width * 0.24} color={accent} op={0.16} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {/* sound waves from the bell */}
        {Array.from({length: 3}).map((_, k) => {
          const local = (((frame + k * (fps * 0.5)) % (fps * 1.5)) / (fps * 1.5));
          const rr = width * (0.04 + local * 0.14);
          const op = (1 - local) * 0.8;
          return <path key={k} d={`M ${frontX + width * 0.03 + rr} ${(bellTop + bellBot) / 2 - rr} A ${rr} ${rr} 0 0 1 ${frontX + width * 0.03 + rr} ${(bellTop + bellBot) / 2 + rr}`} fill="none" stroke={accent} strokeWidth={4 * (1 - local) + 1} opacity={op} />;
        })}
        {/* mouthpiece + handle */}
        <rect x={backX - width * 0.03} y={backTop - 2} width={width * 0.03} height={backBot - backTop + 4} rx={4} fill={alpha(ink, 0.12)} stroke={ink} strokeWidth={3} />
        <path d={`M ${cx - width * 0.04} ${backBot} L ${cx - width * 0.06} ${cy + height * 0.09}`} stroke={ink} strokeWidth={5} strokeLinecap="round" />
        {/* cone */}
        <path d={cone} fill={alpha(accent, 0.12)} stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

// Bell — a notification bell swinging side to side, ring arcs flashing + a badge popping.
// Meaning: notificação / aviso / toca o sino / lembrete / engajamento / ativa.
export const Bell: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const swing = Math.sin(frame / 6) * 9;
  const pivotY = cy - height * 0.12;
  const w = width * 0.13;
  const h = height * 0.17;
  const bell = `M ${cx} ${pivotY} C ${cx - w * 0.2} ${pivotY} ${cx - w} ${pivotY + h * 0.25} ${cx - w} ${pivotY + h * 0.78} L ${cx - w * 1.15} ${pivotY + h * 0.9} L ${cx + w * 1.15} ${pivotY + h * 0.9} L ${cx + w} ${pivotY + h * 0.78} C ${cx + w} ${pivotY + h * 0.25} ${cx + w * 0.2} ${pivotY} ${cx} ${pivotY} Z`;
  const popT = (frame / (fps * 1.8)) % 1;
  const pop = interpolate(popT, [0.05, 0.18, 0.7, 0.85], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.16} breathe={0.05} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`rotate(${swing} ${cx} ${pivotY})`}>
          {/* top loop */}
          <circle cx={cx} cy={pivotY - 8} r={7} fill="none" stroke={ink} strokeWidth={3.4} />
          <path d={bell} fill={alpha(ink, 0.07)} stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />
          {/* clapper */}
          <circle cx={cx} cy={pivotY + h * 1.02} r={9} fill={accent} />
        </g>
        {/* ring arcs */}
        {[-1, 1].map((s, i) => {
          const fl = Math.max(0, Math.sin(frame / 6) * s);
          return <path key={i} d={`M ${cx + s * w * 1.5} ${pivotY + h * 0.2} q ${s * w * 0.5} ${h * 0.2} 0 ${h * 0.5}`} fill="none" stroke={accent} strokeWidth={3} opacity={fl * 0.7} />;
        })}
        {/* badge */}
        {pop > 0.01 ? <circle cx={cx + w * 0.9} cy={pivotY - 2} r={10 * (0.6 + pop * 0.4)} fill={accent} opacity={pop} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// Key — a recognizable key that turns (rotates) with a glow on the turn, looping.
// Meaning: a chave pra / solução / acesso / desbloqueia / segredo / abre portas.
export const Key: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.3;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const cyc = (frame / (fps * 2.4)) % 1;
  const turn = interpolate(cyc, [0.15, 0.42, 0.82, 1], [0, 90, 90, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const turned = turn > 45;
  const bow = width * 0.07; // head radius
  const headX = cx - width * 0.13;
  const shaftLen = width * 0.26;
  const col = turned ? accent : ink;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.12 + (turned ? 0.2 : 0)} breathe={0.04} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`rotate(${turn} ${cx} ${cy})`}>
          {/* head (bow) */}
          <circle cx={headX} cy={cy} r={bow} fill="none" stroke={col} strokeWidth={width * 0.018} />
          <circle cx={headX} cy={cy} r={bow * 0.42} fill={alpha(col, 0.2)} />
          {/* shaft */}
          <rect x={headX + bow} y={cy - width * 0.013} width={shaftLen} height={width * 0.026} rx={width * 0.012} fill={alpha(col, 0.12)} stroke={col} strokeWidth={width * 0.012} />
          {/* teeth */}
          <rect x={headX + bow + shaftLen * 0.62} y={cy + width * 0.013} width={width * 0.02} height={width * 0.05} fill={col} />
          <rect x={headX + bow + shaftLen * 0.82} y={cy + width * 0.013} width={width * 0.02} height={width * 0.07} fill={col} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Gift — a present whose lid lifts off with a sparkle burst, looping.
// Meaning: bônus / presente / brinde / surpresa / ganhou / oferta especial.
export const Gift: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const cy = height * 0.32;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const cyc = (frame / (fps * 2.6)) % 1;
  const open = interpolate(cyc, [0.2, 0.45, 0.85, 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lift = open * height * 0.07;
  const bw = width * 0.22;
  const bh = height * 0.15;
  const bx = cx - bw / 2;
  const boxTop = cy - bh * 0.35;
  const lidY = boxTop - bh * 0.18 - lift;
  return (
    <AbsoluteFill style={{opacity: intro}}>
      <GlowDisc cx={cx} cy={cy} r={width * 0.24} color={accent} op={0.14 + open * 0.16} breathe={0.04} />
      <svg width={width} height={height} style={{position: 'absolute', overflow: 'visible'}}>
        {/* sparkles from inside when open */}
        {open > 0.1
          ? Array.from({length: 7}).map((_, i) => {
              const a = (i / 7) * Math.PI - Math.PI * 0.05;
              const d = open * height * 0.1;
              return <circle key={i} cx={cx + Math.cos(a) * width * 0.08 * open} cy={boxTop - d * (0.5 + Math.sin(a))} r={3} fill={accent} opacity={open * 0.9} />;
            })
          : null}
        {/* box body */}
        <rect x={bx} y={boxTop} width={bw} height={bh} rx={6} fill={alpha(ink, 0.08)} stroke={ink} strokeWidth={3.6} />
        <rect x={cx - bw * 0.06} y={boxTop} width={bw * 0.12} height={bh} fill={alpha(accent, 0.4)} />
        {/* lid + bow (lifts) */}
        <g transform={`translate(0 ${-lift})`}>
          <rect x={bx - bw * 0.04} y={lidY} width={bw * 1.08} height={bh * 0.28} rx={6} fill={alpha(ink, 0.1)} stroke={ink} strokeWidth={3.6} />
          <path d={`M ${cx} ${lidY} C ${cx - bw * 0.22} ${lidY - bh * 0.3} ${cx - bw * 0.26} ${lidY + bh * 0.05} ${cx - bw * 0.02} ${lidY} C ${cx + bw * 0.26} ${lidY + bh * 0.05} ${cx + bw * 0.22} ${lidY - bh * 0.3} ${cx} ${lidY} Z`} fill={alpha(accent, 0.25)} stroke={accent} strokeWidth={3} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ===========================================================================
// ObjectHero — renders ANY of the 50 curated real objects (src/objetos.ts, Tabler-sourced) in the
// premium reel style: bold white stroke + accent glow halo + a FITTING continuous motion per object
// (rocket rises, bell swings, heart pulses, star spins, trophy shines…). ONE component, 50 objects.
// Used via {"visual":"object","name":"rocket"}. Falls back to a soft orb if the name is unknown.
// ===========================================================================
export const ObjectHero: React.FC<{name?: string}> = ({name}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const cx = width / 2;
  const intro = spring({frame, fps, config: {damping: 18, mass: 0.7}});
  const o = name ? OBJETOS[name] : undefined;
  const paths = o?.paths ?? [];
  const motion = o?.motion ?? 'float';
  const t = frame;
  let tx = 0;
  let ty = 0;
  let rot = 0;
  let sc = 1;
  let origin = '50% 50%';
  let glowOp = 0.16;
  let thruster = 0;
  switch (motion) {
    case 'float': ty = Math.sin(t / 17) * 7; sc = 1 + 0.025 * Math.sin(t / 23); break;
    case 'bob': ty = Math.sin(t / 14) * 10; break;
    case 'drift': tx = Math.sin(t / 22) * 18; ty = Math.sin(t / 30) * 5; break;
    case 'spin': rot = (t / fps) * 50; break;
    case 'tick': rot = Math.round(Math.sin(t / 22) * 2.2) * 7; break;
    case 'pulse': sc = 1 + 0.07 * Math.sin(t / 8); glowOp = 0.18 + 0.12 * (Math.sin(t / 8) * 0.5 + 0.5); break;
    case 'swing': rot = Math.sin(t / 6) * 9; origin = '50% 12%'; break;
    case 'rise': ty = Math.sin(t / 10) * 6 - 5; thruster = 0.5 + 0.5 * Math.abs(Math.sin(t / 4)); break;
    case 'shine': sc = 1 + 0.02 * Math.sin(t / 12); break;
    case 'pop': { const c = (t / (fps * 1.4)) % 1; sc = 1 + interpolate(c, [0, 0.1, 0.26], [0, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}); break; }
    default: break;
  }
  const size = width * 0.5;
  const top = height * 0.13;
  const sparkleAng = (t / fps) * 1.5;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: top}}>
      <div style={{position: 'absolute', left: cx - size * 0.62, top: top + size * 0.5 - size * 0.62, width: size * 1.24, height: size * 1.24, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(accent, glowOp + 0.06)} 0%, ${alpha(accent, 0)} 65%)`, filter: 'blur(34px)', transform: `translateY(${ty}px)`}} />
      {motion === 'rise' ? <div style={{position: 'absolute', left: cx - size * 0.18, top: top + size * 0.74, width: size * 0.36, height: size * 0.5, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(accent, 0.4 * thruster)} 0%, ${alpha(accent, 0)} 70%)`, filter: 'blur(24px)'}} /> : null}
      {paths.length ? (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: 'visible', transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`, transformOrigin: origin, opacity: intro}}>
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={ink} strokeWidth={0.72} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {motion === 'shine' ? <circle cx={12 + Math.cos(sparkleAng) * 7} cy={12 + Math.sin(sparkleAng) * 7} r={0.7 + 0.5 * (Math.sin(t / 5) * 0.5 + 0.5)} fill="#ffffff" /> : null}
        </svg>
      ) : (
        <div style={{width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: `radial-gradient(circle at 50% 40%, #fff 0%, ${ink} 30%, ${alpha(accent, 0.5)} 60%, ${alpha(accent, 0)} 80%)`}} />
      )}
    </AbsoluteFill>
  );
};
