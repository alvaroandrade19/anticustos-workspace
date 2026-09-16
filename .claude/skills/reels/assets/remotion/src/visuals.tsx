/*
 * visuals.tsx — animated, THEME-AWARE scene archetypes + global ambience.
 *
 * Every motion is driven by useCurrentFrame() (never CSS animation / Math.random per frame).
 * Colors come from the active Theme (useTheme): bg / ink / ink2 / accent / mode. Light mode is
 * handled specially (solid orb core, dark multiply grain, soft vignette).
 *
 * Archetypes: Orb, ParticleField, Figures, Wireframe, CodeScreen, Counter, Chart, CustomSVG.
 * Plus Ambient (grain+vignette+dust) and the KenBurns camera wrapper.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import {noise2D} from '@remotion/noise';
import {evolvePath, getLength} from '@remotion/paths';
import {Trail} from '@remotion/motion-blur';
import {useTheme, alpha} from './theme';

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// --- ICON STYLE: white stroke + soft accent glow behind ---
const ICON_GLOW = true; // soft accent halo behind library icons (depth on dark bg)
const ICON_STROKE = (ink: string, _accent: string) => ink; // white stroke (max contrast/legibility)

// ---------------------------------------------------------------------------
// KenBurns — slow filmed feel.
// ---------------------------------------------------------------------------
export const KenBurns: React.FC<{children: React.ReactNode; seed?: number}> = ({children, seed = 1}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.09], {extrapolateRight: 'clamp'});
  const dx = noise2D(`camx${seed}`, frame / 120, 0) * 16;
  const dy = noise2D(`camy${seed}`, frame / 140, 0) * 12;
  return <AbsoluteFill style={{transform: `scale(${scale}) translate(${dx}px, ${dy}px)`}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------
// Ambient — grain + vignette + dust (theme-aware).
// ---------------------------------------------------------------------------
const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink} = useTheme();
  const N = 15;
  return (
    <AbsoluteFill>
      {Array.from({length: N}).map((_, i) => {
        const baseX = (noise2D('dx', i, 0) * 0.5 + 0.5) * width;
        const baseY = (noise2D('dy', i, 0) * 0.5 + 0.5) * height;
        const x = baseX + noise2D('ddx', i, frame / 90) * 40;
        const y = baseY + noise2D('ddy', i, frame / 90) * 40 - (frame % (height * 2)) * 0.05;
        const op = 0.04 + (noise2D('do', i, 0) * 0.5 + 0.5) * 0.1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: ((y % height) + height) % height, width: 2, height: 2, borderRadius: '50%', background: ink, opacity: op}} />
        );
      })}
    </AbsoluteFill>
  );
};

export const Ambient: React.FC = () => {
  const frame = useCurrentFrame();
  const {mode} = useTheme();
  const gx = noise2D('grainx', frame / 2, 0) * 6;
  const gy = noise2D('grainy', 0, frame / 2) * 6;
  const light = mode === 'light';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Dust />
      <AbsoluteFill
        style={{
          opacity: light ? 0.05 : 0.07,
          mixBlendMode: light ? 'multiply' : 'overlay',
          transform: `translate(${gx}px, ${gy}px) scale(1.1)`,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '200px 200px',
        }}
      />
      <AbsoluteFill
        style={{
          background: light
            ? 'radial-gradient(ellipse 82% 70% at 50% 46%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)'
            : 'radial-gradient(ellipse 78% 64% at 50% 44%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.62) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Orb — living sphere. Dark mode: emissive glow. Light mode: solid core + soft shadow.
// ---------------------------------------------------------------------------
export const Orb: React.FC<{cy?: number; entrance?: boolean}> = ({cy = 0.3, entrance = true}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent, mode} = useTheme();
  const cx = width / 2;
  const cyPx = height * cy;
  const breath = 1 + 0.035 * Math.sin((frame / fps) * Math.PI * 0.7);
  const intro = entrance ? spring({frame, fps, config: {damping: 18, mass: 0.8}}) : 1;
  const enterScale = interpolate(intro, [0, 1], [0.6, 1]);
  const size = width * 0.5;
  const light = mode === 'light';

  const halo = Array.from({length: 36}).map((_, i) => {
    const speed = 0.25 + (noise2D('hs', i, 0) * 0.5 + 0.5) * 0.5;
    const R = size * (0.55 + (noise2D('hr', i, 0) * 0.5 + 0.5) * 0.5);
    const angle = (i / 36) * Math.PI * 2 + (frame / fps) * speed;
    const px = cx + R * Math.cos(angle);
    const py = cyPx + R * 0.34 * Math.sin(angle);
    const front = Math.sin(angle) > 0;
    return {px, py, front, op: front ? 0.8 : 0.22, key: i};
  });

  const Glow = (blur: number, op: number, s: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx - (size * s) / 2,
        top: cyPx - (size * s) / 2,
        width: size * s,
        height: size * s,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(accent, 0.85)} 0%, ${alpha(accent, 0.28)} 42%, ${alpha(accent, 0)} 70%)`,
        filter: `blur(${blur}px)`,
        opacity: op,
      }}
    />
  );

  const Ring = (tilt: number, speed: number, rsize: number, color: string) => (
    <div
      style={{
        position: 'absolute',
        left: cx - rsize / 2,
        top: cyPx - rsize / 2,
        width: rsize,
        height: rsize,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${tilt}deg) rotateZ(${interpolate(frame, [0, 300], [0, 360 * speed])}deg)`,
      }}
    >
      <div style={{width: '100%', height: '100%', borderRadius: '50%', border: `1.5px solid ${color}`}} />
    </div>
  );

  return (
    <AbsoluteFill style={{transform: `scale(${breath * enterScale})`, opacity: intro, perspective: 900}}>
      {!light && Glow(90, 0.16, 1.5)}
      {!light && Glow(45, 0.3, 1.05)}
      {halo.filter((p) => !p.front).map((p) => (
        <div key={p.key} style={{position: 'absolute', left: p.px, top: p.py, width: 3, height: 3, borderRadius: '50%', background: ink, opacity: p.op}} />
      ))}
      {Ring(74, 1, size * 1.25, alpha(ink, 0.4))}
      {Ring(60, -0.7, size * 1.5, alpha(accent, 0.5))}
      {!light && Glow(18, 0.55, 0.7)}
      {/* core */}
      <div
        style={{
          position: 'absolute',
          left: cx - size * 0.2,
          top: cyPx - size * 0.2,
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: '50%',
          background: light
            ? `radial-gradient(circle at 40% 30%, ${alpha(ink, 0.5)} 0%, ${ink} 46%, #050505 100%)`
            : `radial-gradient(circle at 50% 40%, #ffffff 0%, ${ink} 18%, ${alpha(accent, 0.85)} 42%, ${alpha(accent, 0.22)} 64%, ${alpha(accent, 0)} 78%)`,
          filter: light ? 'none' : 'blur(2px)',
          boxShadow: light ? `0 30px 80px ${alpha(accent, 0.35)}` : 'none',
        }}
      />
      {halo.filter((p) => p.front).map((p) => (
        <div key={p.key} style={{position: 'absolute', left: p.px, top: p.py, width: 3, height: 3, borderRadius: '50%', background: ink, opacity: p.op}} />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// ParticleField — depth starfield (also ambient bed).
// ---------------------------------------------------------------------------
export const ParticleField: React.FC<{density?: number; travel?: boolean}> = ({density = 150, travel = true}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink} = useTheme();
  return (
    <AbsoluteFill>
      {Array.from({length: density}).map((_, i) => {
        const sx = noise2D('sx', i, 0) * 0.5 + 0.5;
        const sy = noise2D('sy', i, 0) * 0.5 + 0.5;
        let depth = Math.abs(noise2D('sz', i, 0));
        if (travel) depth = (depth + (frame / fps) * 0.06) % 1;
        const size = interpolate(depth, [0, 1], [0.6, 2.6]);
        const op = interpolate(depth, [0, 1], [0.1, 0.8]);
        const px = (sx + noise2D('pw', i, frame / 60) * 0.01) * width + (depth - 0.5) * 60;
        const py = sy * height + (depth - 0.5) * 60;
        return (
          <div key={i} style={{position: 'absolute', left: ((px % width) + width) % width, top: ((py % height) + height) % height, width: size, height: size, borderRadius: '50%', background: ink, opacity: op}} />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Figures — running silhouettes with motion-blur trail + speed streak.
// ---------------------------------------------------------------------------
const Runner: React.FC<{x: number; y: number; scale: number; phase: number; fps: number; frame: number; ink: string}> = ({x, y, scale, phase, fps, frame, ink}) => {
  const t = (frame + phase) / fps * 7;
  const bob = Math.sin(t * 2) * 4 * scale;
  const sw = Math.sin(t);
  const backFootX = 22 + sw * 10;
  const backFootY = 96 - sw * 4;
  const frontKneeX = 60 + sw * 6;
  const frontFootX = 66 + sw * 10;
  const frontFootY = 80 + sw * 6;
  const backHandX = 30 + sw * 8;
  const frontHandX = 70 - sw * 8;
  return (
    <div style={{position: 'absolute', left: x, top: y + bob, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <div style={{position: 'absolute', left: -90, top: 54, width: 150, height: 6, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${alpha(ink, 0.28)})`, filter: 'blur(3px)'}} />
      <svg width={150} height={150} viewBox="0 0 100 120" style={{overflow: 'visible'}}>
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth={9}>
          <line x1={56} y1={30} x2={44} y2={60} strokeWidth={11} />
          <line x1={44} y1={60} x2={32} y2={78} />
          <line x1={32} y1={78} x2={backFootX} y2={backFootY} />
          <line x1={44} y1={60} x2={frontKneeX} y2={64} />
          <line x1={frontKneeX} y1={64} x2={frontFootX} y2={frontFootY} />
          <line x1={54} y1={34} x2={backHandX} y2={40} strokeWidth={7} />
          <line x1={backHandX} y1={40} x2={backHandX - 2} y2={52} strokeWidth={7} />
          <line x1={54} y1={34} x2={frontHandX} y2={38} strokeWidth={7} />
          <line x1={frontHandX} y1={38} x2={frontHandX + 2} y2={50} strokeWidth={7} />
          <line x1={56} y1={30} x2={59} y2={22} strokeWidth={8} />
        </g>
        <circle cx={61} cy={16} r={7} fill={ink} />
      </svg>
    </div>
  );
};

export const Figures: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink} = useTheme();
  const runners = [
    {scale: 1.2, baseY: height * 0.34, speed: 1.05, delay: 0},
    {scale: 0.82, baseY: height * 0.27, speed: 0.82, delay: 34},
    {scale: 0.58, baseY: height * 0.22, speed: 0.62, delay: 68},
  ];
  return (
    <AbsoluteFill>
      {runners.map((r, i) => {
        const t = ((frame - r.delay) / (fps * 3)) * r.speed;
        const x = interpolate(t, [0, 1], [-180, width + 120], {extrapolateLeft: 'clamp'});
        return (
          <Trail key={i} layers={14} lagInFrames={0.7} trailOpacity={0.45}>
            <Runner x={x} y={r.baseY} scale={r.scale} phase={i * 30} fps={fps} frame={frame} ink={ink} />
          </Trail>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Wireframe — line-art that draws itself on.
// ---------------------------------------------------------------------------
const DrawPath: React.FC<{d: string; delay: number; draw: number; frame: number; w?: number; color: string; loop?: boolean}> = ({d, delay, draw, frame, w = 2, color, loop = false}) => {
  // non-loop is identical to before: interpolate(frame-delay, [0,draw]) == interpolate(frame, [delay,delay+draw]).
  // loop mode redraws the line every cycle (a "living" trace) — used by motion:"trace".
  const cycle = draw + 45;
  const t = loop ? (((frame - delay) % cycle) + cycle) % cycle : frame - delay;
  const progress = interpolate(t, [0, draw], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const e = evolvePath(progress, d);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
};

export const Wireframe: React.FC<{kind?: 'monitor' | 'network'}> = ({kind = 'monitor'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, ink2, accent} = useTheme();
  const shimmer = 0.85 + 0.15 * Math.sin(frame / 12);
  const sway = noise2D('wsway', frame / 80, 0) * 6;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.1, transform: `translateX(${sway}px)`}}>
      <svg width={width * 0.62} height={width * 0.62} viewBox="0 0 100 100" style={{opacity: shimmer, overflow: 'visible'}}>
        {kind === 'monitor' ? (
          <>
            <DrawPath d="M14 20 H86 V64 H14 Z" delay={0} draw={26} frame={frame} color={ink} />
            <DrawPath d="M44 64 V76 M32 78 H68" delay={20} draw={14} frame={frame} color={ink} />
            <DrawPath d="M22 30 H62" delay={30} draw={10} frame={frame} w={1.4} color={ink2} />
            <DrawPath d="M22 38 H50" delay={36} draw={10} frame={frame} w={1.4} color={ink2} />
            <DrawPath d="M22 46 H70" delay={42} draw={10} frame={frame} w={1.4} color={accent} />
            <DrawPath d="M22 54 H42" delay={48} draw={10} frame={frame} w={1.4} color={ink2} />
          </>
        ) : (
          <>
            <DrawPath d="M50 18 L26 44 M50 18 L74 44 M26 44 L50 70 M74 44 L50 70 M26 44 L74 44" delay={0} draw={30} frame={frame} w={1.4} color={ink2} />
            {[[50, 18], [26, 44], [74, 44], [50, 70]].map(([x, y], i) => {
              const pop = interpolate(frame, [24 + i * 6, 36 + i * 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return <circle key={i} cx={x} cy={y} r={3.4 * pop} fill={i === 0 ? accent : ink} />;
            })}
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CodeScreen — terminal with code typing in.
// ---------------------------------------------------------------------------
const DEFAULT_CODE = ['> claude: criar ferramenta', '', 'function build(ideia) {', '  const app = gerar(ideia)', '  return app.pronto', '}', '', '✓ ferramenta no ar'];

export const CodeScreen: React.FC<{lines?: string[]}> = ({lines = DEFAULT_CODE}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, ink2, accent, bg} = useTheme();
  const total = lines.join('\n').length;
  const typed = Math.floor(interpolate(frame, [10, 10 + fps * 2.4], [0, total], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  let remaining = typed;
  const shown: string[] = [];
  for (const ln of lines) {
    if (remaining <= 0) { shown.push(''); continue; }
    shown.push(ln.slice(0, remaining));
    remaining -= ln.length + 1;
  }
  const cursorOn = Math.floor(frame / (fps / 2)) % 2 === 0;
  const w = width * 0.8;
  const lastTyped = shown.filter((s) => s.length).length - 1;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.15}}>
      <div style={{width: w, borderRadius: 18, border: `2px solid ${alpha(ink, 0.42)}`, background: alpha(ink, 0.05), boxShadow: `0 0 110px ${alpha(ink, 0.12)}, inset 0 0 0 1px ${alpha(ink, 0.05)}`, overflow: 'hidden'}}>
        <div style={{display: 'flex', gap: 9, padding: '16px 20px', borderBottom: `1px solid ${alpha(ink, 0.25)}`}}>
          {[0, 1, 2].map((i) => (<div key={i} style={{width: 12, height: 12, borderRadius: '50%', background: alpha(ink, 0.5)}} />))}
        </div>
        <pre style={{margin: 0, padding: '26px 30px', fontFamily: 'ui-monospace, Consolas, "Courier New", monospace', fontSize: w * 0.038, lineHeight: 1.55, color: ink, whiteSpace: 'pre-wrap', minHeight: w * 0.52}}>
          {shown.map((l, i) => (
            <div key={i} style={{color: l.startsWith('>') || l.startsWith('✓') ? accent : l.trim().startsWith('//') ? ink2 : alpha(ink, 0.85)}}>
              {l}
              {i === lastTyped && cursorOn ? <span style={{color: ink}}>▋</span> : null}
            </div>
          ))}
        </pre>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Counter — a big number that counts up to a target. "growth / scale / metric".
// ---------------------------------------------------------------------------
export const Counter: React.FC<{to?: number; prefix?: string; suffix?: string; decimals?: number}> = ({to = 100, prefix = '', suffix = '', decimals = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const p = interpolate(spring({frame, fps, config: {damping: 200, mass: 1.2}}), [0, 1], [0, 1]);
  const val = (to * p).toFixed(decimals);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.24}}>
      <div style={{fontFamily: 'AntonReel, Impact, sans-serif', fontSize: width * 0.26, color: ink, lineHeight: 1, letterSpacing: '-0.02em'}}>
        {prefix}
        {Number(val).toLocaleString('pt-BR')}
        <span style={{color: accent}}>{suffix}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Chart — a draw-on upward line with an area fill + a dot at the tip. "growth".
// ---------------------------------------------------------------------------
export const Chart: React.FC<{points?: number[]}> = ({points}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, ink2, accent} = useTheme();
  const pts = points && points.length >= 2 ? points : [8, 20, 14, 34, 30, 54, 70, 96];
  const W = width * 0.64;
  const H = W * 0.62;
  const max = Math.max(...pts);
  const stepX = W / (pts.length - 1);
  const coords = pts.map((v, i) => [i * stepX, H - (v / max) * H]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const progress = interpolate(frame, [6, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const e = evolvePath(progress, line);
  const tip = coords[Math.min(coords.length - 1, Math.floor(progress * (coords.length - 1)))];
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.16}}>
      <svg width={W} height={H + 20} viewBox={`-6 -10 ${W + 12} ${H + 24}`} style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={alpha(accent, 0.4)} />
            <stop offset="100%" stopColor={alpha(accent, 0.03)} />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line x1={0} y1={H} x2={W} y2={H} stroke={alpha(ink2, 0.5)} strokeWidth={1.5} />
        {/* area */}
        <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill="url(#areaG)" opacity={progress} />
        {/* the rising line */}
        <path d={line} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
        {progress > 0.05 ? <circle cx={tip[0]} cy={tip[1]} r={7} fill={ink} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CustomSVG — the BESPOKE primitive: the director authors path "d" strings for THIS topic;
// the engine draws them on. Guarded: getLength() throws on malformed paths (we skip those),
// the element is rebuilt from validated DATA (never raw markup injected), and an empty/all-bad
// set renders nothing harmful (the scene still has text + ambient). Keep 1-3 simple paths.
// ---------------------------------------------------------------------------
const SAFE_D = /^[MmLlHhVvCcSsQqTtAaZz0-9\s.,-]+$/;
// motion presets — the "create a new moving visual" lever: the director authors a path (or picks an
// icon) and gives it CONTINUOUS life. 'float' bobs + breathes (default for icons); 'spin' rotates
// (wheels/suns/loaders); 'pulse' beats (hearts/alerts); 'trace' re-draws the line forever
// (paths/journeys/signals); 'draw' draws once + settles (default for bespoke svg).
export type SvgMotion = 'draw' | 'float' | 'spin' | 'pulse' | 'trace';
export const CustomSVG: React.FC<{paths?: string[]; viewBox?: string; icon?: boolean; motion?: SvgMotion}> = ({paths = [], viewBox = '0 0 100 100', icon = false, motion}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const valid = paths
    .filter((d) => typeof d === 'string' && d.length < 1200 && SAFE_D.test(d))
    .filter((d) => {
      try {
        return getLength(d) > 0;
      } catch {
        return false;
      }
    })
    .slice(0, icon ? 14 : 5);
  // stroke-width scaled to the viewBox so a 24-unit Tabler icon and a 100-unit bespoke path both
  // render at the same on-screen weight (~14px). icon mode draws faster + more simultaneous.
  const safeVb = SAFE_D.test(viewBox.replace(/\s/g, '')) || /^[-0-9.\s]+$/.test(viewBox) ? viewBox : '0 0 100 100';
  const vbW = parseFloat(safeVb.trim().split(/\s+/)[2]) || 100;
  const strokeW = vbW * 0.022;
  const sway = noise2D('csway', frame / 80, 0) * 5;
  const iconColor = icon ? ICON_STROKE(ink, accent) : null;
  // resolve the motion: icons FLOAT by default; bespoke svg DRAWs once unless given a motion.
  const m: SvgMotion = motion ?? (icon ? 'float' : 'draw');
  const spin = m === 'spin' ? (frame / fps) * 52 : 0;
  const fY = m === 'float' ? Math.sin(frame / 17) * 7 : 0;
  const breathe = m === 'pulse' ? 1 + 0.075 * Math.sin(frame / 8) : m === 'float' ? 1 + 0.025 * Math.sin(frame / 23) : 1;
  const loop = m === 'trace';
  const gPulse = 0.78 + 0.22 * (Math.sin(frame / 19) * 0.5 + 0.5);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: height * 0.12, transform: `translateX(${sway}px)`}}>
      {icon && ICON_GLOW ? (
        <div style={{position: 'absolute', left: width * 0.5 - width * 0.45, top: height * 0.12 + width * 0.3 - width * 0.45, width: width * 0.9, height: width * 0.9, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(accent, 0.22)} 0%, ${alpha(accent, 0)} 65%)`, filter: 'blur(30px)', opacity: gPulse, transform: `translateY(${fY}px)`}} />
      ) : null}
      <svg width={width * 0.6} height={width * 0.6} viewBox={safeVb} style={{overflow: 'visible', transform: `translateY(${fY}px) rotate(${spin}deg) scale(${breathe})`, transformOrigin: '50% 50%'}}>
        {valid.map((d, i) => (
          <DrawPath key={i} d={d} delay={i * (icon ? 4 : 8)} draw={icon ? 22 : 28} frame={frame} w={strokeW} color={icon ? (iconColor as string) : i === valid.length - 1 ? accent : ink} loop={loop} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
