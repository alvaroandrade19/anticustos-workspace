/*
 * Reel.tsx — composes the scene plan into a finished reel. THEME-AWARE + optional background AUDIO.
 *
 * PARAMETRIC: renders whatever scene plan + theme arrive in props. The skill writes the PLAN and
 * picks the THEME; it never edits this file. Each scene = an animated VISUAL archetype + kinetic
 * text, wrapped in a Ken-Burns camera, joined by cross-dissolves, over a particle bed + grain +
 * vignette. If `audioSrc` is given, it plays under the video and the scenes are time-scaled so the
 * whole reel matches the audio length (beat-level caption sync — each line shows over its slice).
 */
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  delayRender,
  continueRender,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {flip} from '@remotion/transitions/flip';
import {Ambient, KenBurns, Orb, ParticleField, Figures, Wireframe, CodeScreen, Counter, Chart, CustomSVG, SvgMotion} from './visuals';
import {Waveform, Orbit, Ripple, Rocket, Gears, Pipeline, Radar, Constellation, Brain, Burst, Funnel, Coins, Checklist, Globe, Magnet, Hourglass, Lock, Typing, Lightbulb, Shield, Trophy, Phone, Target, Plant, Megaphone, Bell, Key, Gift, ObjectHero} from './motion'; // continuous moving-object heroes
import {Grid, Device, Crowd} from './scenes3d';
import {ThreeOrb} from './scenes-webgl'; // Three.js imperative — no @react-three/fiber needed
import {KineticText, FONT} from './text';
import {Theme, resolveTheme, ThemeProvider, useTheme} from './theme';

export type Visual = 'orb' | 'hero3d' | 'particles' | 'figures' | 'wireframe' | 'network' | 'code' | 'counter' | 'chart' | 'svg' | 'icon' | 'grid' | 'device' | 'crowd' | 'waveform' | 'orbit' | 'ripple' | 'rocket' | 'gears' | 'pipeline' | 'radar' | 'constellation' | 'brain' | 'burst' | 'funnel' | 'coins' | 'checklist' | 'globe' | 'magnet' | 'hourglass' | 'lock' | 'typing' | 'lightbulb' | 'shield' | 'trophy' | 'phone' | 'target' | 'plant' | 'megaphone' | 'bell' | 'key' | 'gift' | 'object';

export type Scene = {
  text?: string;
  sub?: string;
  big?: boolean;
  hold?: number;
  place?: 'top' | 'bottom'; // text placement (default bottom)
  visual?: Visual;
  code?: string[]; // for visual:code / device
  to?: number; prefix?: string; suffix?: string; decimals?: number; // for visual:counter
  points?: number[]; // for visual:chart
  paths?: string[]; viewBox?: string; // for visual:svg (bespoke) / visual:icon
  motion?: SvgMotion; // for visual:svg/icon — continuous life: float/spin/pulse/trace/draw
  name?: string; // for visual:object — a curated real object from src/objetos.ts (rocket, bell, heart…)
};

export type ReelProps = {
  scenes: Scene[];
  perScene?: number;
  theme?: Partial<Theme> | string;
  audioSrc?: string; // filename copied into public/ by the render script
  audioDurationInFrames?: number; // probed by the render script
  // legacy
  accent?: string;
  bg?: string;
};

export const TRANSITION = 14;

// Deterministic transition picker by index — no Math.random.
// Uses only PUSH-type transitions (slide/flip/fade) — avoids wipe which clips both scenes
// simultaneously, causing text-collision at the bottom. clockWipe/iris crash in 4.0.474.
// Last transition always fades into the CTA.
const pickPresentation = (i: number, total: number) => {
  if (i === total - 1) return fade(); // calm dissolve into the CTA scene
  switch (i % 7) {
    case 0: return slide({direction: 'from-bottom'});
    case 1: return slide({direction: 'from-left'});
    case 2: return flip({direction: 'from-left'});
    case 3: return slide({direction: 'from-top'});
    case 4: return slide({direction: 'from-right'});
    case 5: return flip({direction: 'from-right'});
    case 6: return fade();
    default: return fade();
  }
};

// Punchy transitions (flip variants) trigger a light-flash at the start of the incoming scene.
const isPunchy = (i: number, total: number): boolean => {
  if (i === total - 1) return false; // last is always fade
  const t = i % 7;
  return t === 2 || t === 5; // flip-left / flip-right
};

// scale each scene's hold so the composed timeline matches the audio (if any)
const planHolds = (scenes: Scene[], perScene: number, audioFrames?: number) => {
  const raw = scenes.map((s) => s.hold ?? perScene);
  if (!audioFrames || audioFrames <= 0) return raw;
  const transitions = Math.max(0, scenes.length - 1) * TRANSITION;
  const sum = raw.reduce((a, b) => a + b, 0);
  const targetSum = audioFrames + transitions; // composed = sum - transitions = audioFrames
  const k = targetSum / sum;
  return raw.map((h) => Math.max(20, Math.round(h * k)));
};

export const reelDuration = (scenes: Scene[], perScene = 75, audioFrames?: number) => {
  const holds = planHolds(scenes, perScene, audioFrames);
  const total = holds.reduce((a, b) => a + b, 0);
  return Math.max(30, total - Math.max(0, scenes.length - 1) * TRANSITION);
};

const useReelFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile('Anton-Regular.ttf')})`);
    face.load().then((l) => {(document.fonts as FontFaceSet).add(l); continueRender(handle);}).catch(() => continueRender(handle));
  }, [handle]);
};

const FlashIn: React.FC = () => {
  const frame = useCurrentFrame();
  const {ink} = useTheme();
  const op = interpolate(frame, [0, 2, 8], [0, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: ink, mixBlendMode: 'overlay', opacity: op, pointerEvents: 'none'}} />;
};

const VisualFor: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.visual) {
    case 'particles': return <ParticleField density={210} />;
    case 'figures': return <Figures />;
    case 'wireframe': return <Wireframe kind="monitor" />;
    case 'network': return <Wireframe kind="network" />;
    case 'code': return <CodeScreen lines={scene.code} />;
    case 'counter': return <Counter to={scene.to} prefix={scene.prefix} suffix={scene.suffix} decimals={scene.decimals} />;
    case 'chart': return <Chart points={scene.points} />;
    case 'svg': return <CustomSVG paths={scene.paths} viewBox={scene.viewBox} motion={scene.motion} />;
    case 'icon': return <CustomSVG paths={scene.paths} viewBox={scene.viewBox} icon motion={scene.motion} />;
    case 'hero3d': return <ThreeOrb />;
    case 'grid': return <Grid />;
    case 'device': return <Device lines={scene.code} />;
    case 'crowd': return <Crowd />;
    case 'waveform': return <Waveform />;
    case 'orbit': return <Orbit />;
    case 'ripple': return <Ripple />;
    case 'rocket': return <Rocket />;
    case 'gears': return <Gears />;
    case 'pipeline': return <Pipeline />;
    case 'radar': return <Radar />;
    case 'constellation': return <Constellation />;
    case 'brain': return <Brain />;
    case 'burst': return <Burst />;
    case 'funnel': return <Funnel />;
    case 'coins': return <Coins />;
    case 'checklist': return <Checklist />;
    case 'globe': return <Globe />;
    case 'magnet': return <Magnet />;
    case 'hourglass': return <Hourglass />;
    case 'lock': return <Lock />;
    case 'typing': return <Typing />;
    case 'lightbulb': return <Lightbulb />;
    case 'shield': return <Shield />;
    case 'trophy': return <Trophy />;
    case 'phone': return <Phone />;
    case 'target': return <Target />;
    case 'plant': return <Plant />;
    case 'megaphone': return <Megaphone />;
    case 'bell': return <Bell />;
    case 'key': return <Key />;
    case 'gift': return <Gift />;
    case 'object': return <ObjectHero name={scene.name} />;
    case 'orb':
    default: return <Orb />;
  }
};

// ---------------------------------------------------------------------------
// Composition system — every video must come out well-composed (no dead gap, centered)
// WITHOUT per-video hand-tuning. Visuals split into:
//  - FILL: naturally full-bleed (floor/crowd/starfield) → no transform, text overlays top/bottom.
//  - compact: a single element in space → scaled up + pulled to a SHARED vertical center, with
//    the text raised to sit just below (compact text padding in text.tsx). Kills the middle void.
// CONTENT_CENTER ≈ where each compact visual's mass currently sits (0..1 of height); we shift it
// to TARGET so the visual+text read as one centered composition.
const FILL_VISUALS = new Set<string>(['grid', 'crowd', 'particles']);
// where each compact visual's mass sits today (fraction of height) — used as the scale pivot
const CONTENT_CENTER: Record<string, number> = {
  orb: 0.30, hero3d: 0.30, wireframe: 0.27, network: 0.27, code: 0.45,
  counter: 0.31, chart: 0.27, svg: 0.29, icon: 0.29, device: 0.45, figures: 0.30,
  waveform: 0.30, orbit: 0.30, ripple: 0.30, rocket: 0.30, gears: 0.30,
  pipeline: 0.30, radar: 0.30, constellation: 0.30,
  brain: 0.30, burst: 0.30, funnel: 0.30, coins: 0.31, checklist: 0.30,
  globe: 0.30, magnet: 0.30, hourglass: 0.30, lock: 0.31, typing: 0.31,
  lightbulb: 0.30, shield: 0.30, trophy: 0.30, phone: 0.30, target: 0.30,
  plant: 0.31, megaphone: 0.30, bell: 0.30, key: 0.30, gift: 0.31,
  object: 0.28,
};
// per-visual enlargement: thin line-icons grow a lot; big terminals barely move
const COMPACT_SCALE: Record<string, number> = {
  orb: 1.34, hero3d: 1.34, wireframe: 1.4, network: 1.4, code: 1.05,
  counter: 1.25, chart: 1.45, svg: 1.55, icon: 1.12, device: 1.05, figures: 1.5,
  waveform: 1.1, orbit: 1.1, ripple: 1.0, rocket: 1.08, gears: 1.12,
  pipeline: 1.0, radar: 1.05, constellation: 1.0,
  brain: 1.05, burst: 1.1, funnel: 1.0, coins: 1.05, checklist: 1.0,
  globe: 1.08, magnet: 1.1, hourglass: 1.08, lock: 1.05, typing: 1.0,
  lightbulb: 1.08, shield: 1.05, trophy: 1.08, phone: 1.0, target: 1.05,
  plant: 1.05, megaphone: 1.08, bell: 1.08, key: 1.05, gift: 1.05,
  object: 1.1,
};
const TARGET_BOTTOM = 0.39; // visual center when text is at the bottom
const TARGET_TOP = 0.54; // visual center when text is at the top (text + visual centered as a group)

const Body: React.FC<ReelProps> = ({scenes, perScene = 75, audioSrc, audioDurationInFrames}) => {
  useReelFont();
  const {bg} = useTheme();
  const {durationInFrames, height} = useVideoConfig();
  const holds = planHolds(scenes, perScene, audioDurationInFrames);
  const totalTransitions = scenes.length - 1;
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      {audioSrc ? (
        <Audio src={staticFile(audioSrc)} volume={(f) => interpolate(f, [0, 12, durationInFrames - 18, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      ) : null}

      <AbsoluteFill style={{opacity: 0.5}}>
        <ParticleField density={70} />
      </AbsoluteFill>

      <TransitionSeries>
        {scenes.flatMap((scene, i) => {
          const hold = holds[i];
          // Scene entered via a punchy transition → add a light-flash overlay at frame 0
          const incomingFlash = i > 0 && isPunchy(i - 1, totalTransitions);
          // composition: center + enlarge compact visuals so there's no dead gap
          const v = scene.visual ?? 'orb';
          const fill = FILL_VISUALS.has(v);
          const top = scene.place === 'top';
          const center = CONTENT_CENTER[v] ?? 0.3;
          // taller text (3+ lines) needs more room → push the visual away from the text.
          // big:true enlarges the font (and often wraps into more visual lines than \n implies),
          // so it needs extra clearance too — without this, big + 3-line scenes collided with
          // tall/compact visuals like svg and hero3d (verified in render QA).
          const lineCount = (scene.text ?? '').split('\n').filter((l) => l.length).length;
          const extra = Math.max(0, lineCount - 2) * 0.07 + (scene.big ? 0.05 : 0);
          const target = top ? TARGET_TOP + extra : TARGET_BOTTOM - extra;
          const dy = fill ? 0 : (target - center) * height;
          const sc = fill ? 1 : (COMPACT_SCALE[v] ?? 1.3);
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={hold}>
              <KenBurns seed={i + 1}>
                <AbsoluteFill style={{transform: `translateY(${dy}px) scale(${sc})`, transformOrigin: `50% ${center * height}px`}}>
                  <VisualFor scene={scene} />
                </AbsoluteFill>
              </KenBurns>
              {scene.text ? <KineticText text={scene.text} sub={scene.sub} big={scene.big} hold={hold} place={scene.place} entranceStyle={i % 4} compact={!fill} /> : null}
              {(scene.big || incomingFlash) ? <FlashIn /> : null}
            </TransitionSeries.Sequence>
          );
          if (i === scenes.length - 1) return [seq];
          return [
            seq,
            <TransitionSeries.Transition
              key={`t${i}`}
              timing={linearTiming({durationInFrames: TRANSITION})}
              presentation={pickPresentation(i, totalTransitions)}
            />,
          ];
        })}
      </TransitionSeries>

      <Ambient />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = (props) => {
  const theme = resolveTheme(props.theme ?? (props.bg || props.accent ? {bg: props.bg, accent: props.accent} : undefined));
  return (
    <ThemeProvider theme={theme}>
      <Body {...props} />
    </ThemeProvider>
  );
};
