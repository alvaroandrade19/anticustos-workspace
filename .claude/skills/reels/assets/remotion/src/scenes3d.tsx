/*
 * scenes3d.tsx — frame-filling, 3D-DEPTH scenes (grid floor, tilted device, marching crowd,
 * rotating polyhedron). The depth/scale upgrade that matches a high-end competitor while staying
 * theme-aware. Light mode = soft shadow + dark lines (NOT neon glow) — our differentiated look.
 *
 * All motion via useCurrentFrame(). CSS 3D needs transformStyle:'preserve-3d' on every nested
 * 3D parent. The grid scroll wraps by the cell size for seamless infinite recession.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';
import {useTheme, alpha} from './theme';

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const HORIZON = 0.4;

// Shared perspective grid floor. Dark mode: glowing accent lines. Light mode: dark low-alpha lines.
export const GridFloor: React.FC<{intro?: boolean}> = ({intro = true}) => {
  const frame = useCurrentFrame();
  const {accent, mode} = useTheme();
  const light = mode === 'light';
  const lineColor = light ? 'rgba(18,18,32,0.28)' : alpha(accent, 0.55);
  const scroll = (frame * 2.6) % 88;
  const reveal = intro ? interpolate(frame, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO}) : 1;
  return (
    <AbsoluteFill style={{perspective: '520px', perspectiveOrigin: `50% ${HORIZON * 100}%`, overflow: 'hidden', opacity: reveal}}>
      <div style={{position: 'absolute', inset: 0, filter: light ? 'none' : `drop-shadow(0 0 8px ${alpha(accent, 0.6)})`}}>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-50%',
            width: '200%',
            height: '230%',
            transformOrigin: '50% 100%',
            transform: `rotateX(73deg) translateY(${scroll}px)`,
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0 86px, ${lineColor} 86px 88px), repeating-linear-gradient(90deg, transparent 0 86px, ${lineColor} 86px 88px)`,
            WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 48%, transparent 94%)',
            maskImage: 'linear-gradient(to top, #000 0%, #000 48%, transparent 94%)',
          }}
        />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: `${HORIZON * 100}%`, height: 160, transform: 'translateY(-80px)', background: `radial-gradient(ellipse at center, ${light ? alpha('#14141a', 0.06) : alpha(accent, 0.4)}, transparent 70%)`, filter: 'blur(12px)'}} />
    </AbsoluteFill>
  );
};

// A rotating low-poly polyhedron (octahedron) — pure math → SVG. The floating signature motif.
const OCTA: number[][] = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];
const OCTA_EDGES = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]];

export const Polyhedron: React.FC<{cx: number; cy: number; size: number; solid?: boolean}> = ({cx, cy, size, solid}) => {
  const frame = useCurrentFrame();
  const {ink, accent, mode} = useTheme();
  const ay = frame * 0.018;
  const ax = frame * 0.011 + 0.5;
  const persp = 600;
  const pr = OCTA.map(([x, y, z]) => {
    let X = x * cos(ay) + z * sin(ay);
    let Z = -x * sin(ay) + z * cos(ay);
    const Y = y * cos(ax) - Z * sin(ax);
    Z = y * sin(ax) + Z * cos(ax);
    const s = persp / (persp - Z * size);
    return {x: cx + X * size * s, y: cy + Y * size * s, z: Z};
  });
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {solid ? (
        <polygon points={pr.map((p) => `${p.x},${p.y}`).join(' ')} fill={alpha(accent, 0.12)} />
      ) : null}
      {OCTA_EDGES.map(([a, b], i) => (
        <line key={i} x1={pr[a].x} y1={pr[a].y} x2={pr[b].x} y2={pr[b].y} stroke={i % 4 === 0 ? accent : ink} strokeWidth={2.4} strokeLinecap="round" opacity={interpolate((pr[a].z + pr[b].z) / 2, [-1, 1], [0.35, 1])} />
      ))}
    </svg>
  );
};
const cos = Math.cos;
const sin = Math.sin;

// GRID scene: the perspective floor + the floating rotating motif above the horizon.
export const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {accent, mode} = useTheme();
  const light = mode === 'light';
  const float = Math.sin(frame / fps) * 18;
  const drop = interpolate(spring({frame, fps, config: {damping: 16}}), [0, 1], [-140, 0]);
  const cy = height * 0.46 + float + drop;
  return (
    <AbsoluteFill>
      <GridFloor />
      {/* contact shadow on the floor under the object */}
      <div style={{position: 'absolute', left: width / 2 - width * 0.18, top: height * 0.6, width: width * 0.36, height: width * 0.08, borderRadius: '50%', background: light ? 'rgba(20,20,40,0.14)' : alpha(accent, 0.18), filter: 'blur(18px)', transform: `scaleY(${0.7 + Math.sin(frame / fps) * 0.05})`}} />
      <Polyhedron cx={width / 2} cy={cy} size={width * 0.28} solid />
    </AbsoluteFill>
  );
};

// DEVICE scene: a 3D-tilted monitor (preserve-3d) filling the frame, code/UI on the screen.
export const Device: React.FC<{lines?: string[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, ink2, accent, mode, bg} = useTheme();
  const light = mode === 'light';
  const W = width * 0.74;
  const H = W * 0.64;
  const D = 26;
  const ry = Math.sin(frame / 46) * 16;
  const rx = -8;
  const intro = interpolate(spring({frame, fps, config: {damping: 18}}), [0, 1], [0.7, 1]);
  const screenBg = light ? '#0e0e14' : '#06070b';
  const code = lines && lines.length ? lines : ['function build(ideia) {', '  const app = gerar(ideia)', '  deploy(app)', '  return "no ar"', '}'];
  const typed = Math.floor(interpolate(frame, [12, 12 + fps * 2], [0, code.join('\n').length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  let rem = typed;
  const shown = code.map((l) => { if (rem <= 0) return ''; const s = l.slice(0, rem); rem -= l.length + 1; return s; });
  const face = (t: string, c: string): React.CSSProperties => ({position: 'absolute', inset: 0, background: c, transform: t, backfaceVisibility: 'hidden'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: '1300px', paddingBottom: height * 0.14}}>
      <div style={{position: 'relative', width: W, height: H, transformStyle: 'preserve-3d', transform: `scale(${intro}) rotateX(${rx}deg) rotateY(${ry}deg)`, filter: light ? 'drop-shadow(0 40px 60px rgba(20,20,40,0.25))' : `drop-shadow(0 0 60px ${alpha(accent, 0.25)})`}}>
        {/* edges (dark) */}
        <div style={face(`rotateY(90deg) translateZ(${W / 2}px)`, light ? '#c9c7c0' : '#0c0e16')} />
        <div style={face(`rotateY(-90deg) translateZ(${W / 2}px)`, light ? '#c9c7c0' : '#0c0e16')} />
        <div style={face(`rotateX(90deg) translateZ(${H / 2}px)`, light ? '#d8d6cf' : '#15181f')} />
        <div style={face(`rotateX(-90deg) translateZ(${H / 2}px)`, light ? '#bdbbb4' : '#0a0b11')} />
        {/* screen */}
        <div style={{...face(`translateZ(${D / 2}px)`, screenBg), borderRadius: 10, padding: '34px 40px', overflow: 'hidden', boxShadow: 'inset 0 0 0 2px ' + alpha('#ffffff', 0.08)}}>
          <div style={{display: 'flex', gap: 9, marginBottom: 24}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 13, height: 13, borderRadius: '50%', background: alpha('#fff', 0.45)}} />)}</div>
          <pre style={{margin: 0, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: W * 0.04, lineHeight: 1.6, color: '#e6e6e6', whiteSpace: 'pre-wrap'}}>
            {shown.map((l, i) => <div key={i} style={{color: l.includes('return') || l.includes('deploy') ? accent : alpha('#fff', 0.85)}}>{l}</div>)}
          </pre>
        </div>
        {/* back */}
        <div style={face(`rotateY(180deg) translateZ(${D / 2}px)`, light ? '#cfcdc6' : '#0c0e16')} />
      </div>
    </AbsoluteFill>
  );
};

// A single solid marching silhouette (filled). Stride animates via leg/arm swing.
const Walker: React.FC<{cx: number; cy: number; h: number; phase: number; color: string; fps: number; frame: number}> = ({cx, cy, h, phase, color, fps, frame}) => {
  const t = (frame + phase) / fps * 5;
  const sw = Math.sin(t);
  const bob = Math.abs(Math.cos(t)) * h * 0.02;
  const u = h / 300; // scale unit (viewBox height ~300)
  const leg = (dir: number) => `rotate(${dir * sw * 16} 60 164)`;
  const arm = (dir: number) => `rotate(${dir * sw * -24} 60 90)`;
  return (
    <g transform={`translate(${cx - 60 * u} ${cy - (h - bob)}) scale(${u})`}>
      {/* contact shadow on the ground */}
      <ellipse cx="60" cy="282" rx="34" ry="9" fill={color} opacity={0.22} />
      <g fill={color}>
        {/* back leg (starts inside the hips so it stays attached) */}
        <g transform={leg(-1)}><path d="M50 156 q8 -4 16 0 l3 116 q1 8 -7 9 q-8 1 -9 -7 l-6 -114 q0 -4 4 -4 z" /></g>
        {/* back arm */}
        <g transform={arm(-1)}><path d="M48 88 q6 -3 10 1 l3 70 q1 6 -5 7 q-6 0 -7 -6 l-4 -66 q0 -3 4 -6 z" /></g>
        {/* torso + head */}
        <circle cx="60" cy="32" r="24" />
        <path d="M60 56 q-10 0 -14 8 l-8 92 q-2 12 10 13 l24 0 q12 -1 10 -13 l-8 -92 q-4 -8 -14 -8 z" />
        {/* front leg */}
        <g transform={leg(1)}><path d="M58 156 q8 -4 16 0 l3 116 q1 8 -7 9 q-8 1 -9 -7 l-6 -114 q0 -4 4 -4 z" /></g>
        {/* front arm */}
        <g transform={arm(1)}><path d="M62 88 q6 -3 10 1 l3 70 q1 6 -5 7 q-6 0 -7 -6 l-4 -66 q0 -3 4 -6 z" /></g>
      </g>
    </g>
  );
};

// CROWD scene: depth-stacked marching silhouettes on the grid + one big hero in front.
export const Crowd: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, ink2, accent, mode} = useTheme();
  const light = mode === 'light';
  const heroColor = light ? '#101018' : ink;
  const horizonY = height * HORIZON;
  const rows = [
    {r: 0, n: 5, scale: 0.34, op: 0.28, blur: 3},
    {r: 1, n: 4, scale: 0.5, op: 0.45, blur: 1.5},
    {r: 2, n: 3, scale: 0.72, op: 0.7, blur: 0},
  ];
  return (
    <AbsoluteFill>
      <GridFloor />
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {rows.map((row) =>
          Array.from({length: row.n}).map((_, i) => {
            const spread = width * (0.16 + row.r * 0.06);
            const cx = width / 2 + (i - (row.n - 1) / 2) * spread + ((i * 53) % 40) - 20;
            const cy = horizonY + 30 + row.r * (height * 0.12);
            const col = light ? alpha('#101018', row.op) : alpha(row.r === 2 ? ink : ink2, row.op);
            return <g key={`${row.r}-${i}`} style={{filter: row.blur ? `blur(${row.blur}px)` : 'none'}}><Walker cx={cx} cy={cy} h={height * 0.1 * row.scale * 1.6} phase={(row.r * 20 + i * 13)} color={col} fps={fps} frame={frame} /></g>;
          })
        )}
        {/* hero in front */}
        <Walker cx={width * 0.42} cy={height * 0.84} h={height * 0.24} phase={0} color={heroColor} fps={fps} frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
