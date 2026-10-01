/*
 * Reel.tsx: compõe o plano RESOLVIDO (scripts/plano.mjs) num reel. v2.
 *
 * O que mudou da v1 e por quê (ver reference/estetica.md):
 *  - Tempo ABSOLUTO. Cada cena chega com `from`/`dur` em quadros, já presa à palavra-âncora da
 *    fala. A v1 esticava todas as durações na mesma proporção pra absorver transições, e o evento
 *    visual escorregava da palavra (o contador marcava 32 quando a voz dizia 34).
 *  - Duas camadas: a CENA (visual, dura o tempo da ideia) e a LEGENDA (fala verbatim, blocos curtos
 *    em corte seco). No modo texto (sem áudio) a frase continua como tipografia cinética da cena.
 *  - Transição por SENTIDO, não por rodízio: `corte` (padrão, no silêncio), `flash` (desfoca e
 *    estoura em claro, pra trocar de prova), `push` (a câmera acelera pra dentro, pra fechar ideia).
 *    Sem flip e sem deslize lateral: liam como template.
 *  - Herói já em voo no 1º quadro: o visual roda PRE quadros antes do corte. O corte é a revelação.
 * PARAMÉTRICO: a skill escreve o plano, nunca este arquivo.
 */
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender} from 'remotion';
import {Ambient, KenBurns, Orb, ParticleField, Figures, Wireframe, CodeScreen, Counter, Chart, CustomSVG, SvgMotion} from './visuals';
import {Waveform, Orbit, Ripple, Rocket, Gears, Pipeline, Radar, Constellation, Brain, Burst, Funnel, Coins, Checklist, Globe, Magnet, Hourglass, Lock, Typing, Lightbulb, Shield, Trophy, Phone, Target, Plant, Megaphone, Bell, Key, Gift, ObjectHero} from './motion';
import {Grid, Device, Crowd} from './scenes3d';
import {ThreeOrb} from './scenes-webgl';
import {Tipografica, Faixa, Barras, Prova, Logo, VideoBroll, Animacao} from './registros';
import {Legendas, Bloco} from './captions';
import {KineticText, FONT} from './text';
import {Theme, resolveTheme, ThemeProvider, useTheme} from './theme';

export type Trans = 'corte' | 'flash' | 'push';

export type Scene = {
  visual?: string;
  text?: string;
  sub?: string;
  big?: boolean;
  place?: 'top' | 'bottom';
  code?: string[];
  to?: number; de?: number; ate?: number; prefix?: string; suffix?: string; decimals?: number; unidade?: string;
  points?: number[];
  paths?: string[]; viewBox?: string; motion?: SvgMotion;
  name?: string;
  valores?: {rotulo?: string; valor: number}[]; destaque?: number; fonte?: string;
  src?: string; iw?: number; ih?: number; zoom?: number;
  marcas?: {x: number; y: number; w: number; h: number; em?: number}[];
  lente?: {x: number; y: number; r: number; em?: number};
  inicio?: number; vel?: number;
  lfr?: number; lip?: number; lop?: number; lw?: number; lh?: number; loop?: boolean; pico?: number; trecho?: [number, number]; escala?: number; lbbox?: number[]; renderer?: 'canvas' | 'svg'; // animacao (Lottie)
};

export type Cena = Scene & {from: number; dur: number; entrada?: Trans; saida?: Trans; evento?: number; registro?: string};

export type ReelProps = {
  modo?: 'audio' | 'texto';
  cenas: Cena[];
  legendas?: Bloco[];
  totalFrames: number;
  theme?: Partial<Theme> | string;
  audioSrc?: string;
  trilhaSrc?: string;
  trilhaVol?: number;
  sfx?: {src: string; from: number; gainDb: number}[];
};

export const PRE = 8; // quadros que o visual já rodou antes do corte
const FL = 6; // meia duração do flash
const PU = 10; // duração do push de saída

const useReelFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile('Anton-Regular.ttf')})`);
    face.load().then((l) => {(document.fonts as unknown as {add: (f: FontFace) => void}).add(l); continueRender(handle);}).catch(() => continueRender(handle));
  }, [handle]);
};

// f0 = quadro local do visual em que a cena corta; evento vem em quadros locais da CENA.
const VisualFor: React.FC<{c: Cena}> = ({c}) => {
  const f0 = PRE;
  const ev = c.evento !== undefined ? c.evento + PRE : undefined;
  switch (c.visual) {
    case 'tipografica': return <Tipografica text={c.text} sub={c.sub} dur={c.dur + PRE} />;
    case 'faixa': return <Faixa de={c.de} ate={c.ate} unidade={c.unidade} prefix={c.prefix} suffix={c.suffix} evento={ev} f0={f0} />;
    case 'barras': return <Barras valores={c.valores} destaque={c.destaque} unidade={c.unidade} fonte={c.fonte} suffix={c.suffix} evento={ev} f0={f0} />;
    case 'prova': return <Prova src={c.src} iw={c.iw} ih={c.ih} zoom={c.zoom} fonte={c.fonte} f0={f0} dur={c.dur + PRE} marcas={(c.marcas ?? []).map((m) => ({...m, em: m.em !== undefined ? m.em + PRE : undefined}))} lente={c.lente ? {...c.lente, em: c.lente.em !== undefined ? c.lente.em + PRE : undefined} : undefined} />;
    case 'logo': return <Logo src={c.src} sub={c.sub} f0={f0} />;
    case 'video': return <VideoBroll src={c.src} inicio={c.inicio} vel={c.vel} dur={c.dur} PRE={PRE} />;
    case 'animacao': return <Animacao src={c.src} lfr={c.lfr} lip={c.lip} lop={c.lop} lw={c.lw} lh={c.lh} vel={c.vel} loop={c.loop} pico={c.pico} trecho={c.trecho} escala={c.escala} lbbox={c.lbbox} renderer={c.renderer} evento={ev} f0={f0} />;
    case 'counter': return <Counter to={c.to} de={c.de} prefix={c.prefix} suffix={c.suffix} decimals={c.decimals} evento={ev} sub={c.sub} />;
    case 'particles': return <ParticleField density={210} />;
    case 'figures': return <Figures />;
    case 'wireframe': return <Wireframe kind="monitor" />;
    case 'network': return <Wireframe kind="network" />;
    case 'code': return <CodeScreen lines={c.code} />;
    case 'chart': return <Chart points={c.points} />;
    case 'svg': return <CustomSVG paths={c.paths} viewBox={c.viewBox} motion={c.motion} />;
    case 'icon': return <CustomSVG paths={c.paths} viewBox={c.viewBox} icon motion={c.motion} />;
    case 'hero3d': return <ThreeOrb />;
    case 'grid': return <Grid />;
    case 'device': return <Device lines={c.code} />;
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
    case 'object': return <ObjectHero name={c.name} />;
    case 'orb':
    default: return <Orb />;
  }
};

// ---------------------------------------------------------------------------
// Composição: visuais "compactos" (um elemento no espaço) são ampliados e centrados num eixo comum.
// No modo áudio a cena não carrega frase, então o herói cresce (~57% da largura, porte de insert
// da referência) e sobe pra deixar a faixa da legenda (0,70H) livre. Registros novos se compõem sozinhos.
// ---------------------------------------------------------------------------
const PROPRIOS = new Set(['tipografica', 'faixa', 'barras', 'prova', 'logo', 'video', 'animacao']);
const FILL_VISUALS = new Set<string>(['grid', 'crowd', 'particles']);
const SEM_CAMERA = new Set(['tipografica', 'prova', 'video', 'logo']); // já têm câmera própria
const CONTENT_CENTER: Record<string, number> = {
  orb: 0.30, hero3d: 0.30, wireframe: 0.27, network: 0.27, code: 0.28, counter: 0.31, chart: 0.27, svg: 0.29, icon: 0.29,
  device: 0.45, figures: 0.30, waveform: 0.30, orbit: 0.30, ripple: 0.30, rocket: 0.30, gears: 0.30, pipeline: 0.30,
  radar: 0.30, constellation: 0.30, brain: 0.30, burst: 0.30, funnel: 0.30, coins: 0.31, checklist: 0.30, globe: 0.30,
  magnet: 0.30, hourglass: 0.30, lock: 0.31, typing: 0.31, lightbulb: 0.30, shield: 0.30, trophy: 0.30, phone: 0.30,
  target: 0.30, plant: 0.31, megaphone: 0.30, bell: 0.30, key: 0.30, gift: 0.31, object: 0.28,
};
const COMPACT_SCALE: Record<string, number> = {
  orb: 1.34, hero3d: 1.34, wireframe: 1.4, network: 1.4, code: 1.05, counter: 1.25, chart: 1.45, svg: 1.55, icon: 1.12,
  device: 1.05, figures: 1.5, waveform: 1.1, orbit: 1.1, ripple: 1.0, rocket: 1.08, gears: 1.12, pipeline: 1.0, radar: 1.05,
  constellation: 1.0, brain: 1.05, burst: 1.1, funnel: 1.0, coins: 1.05, checklist: 1.0, globe: 1.08, magnet: 1.1,
  hourglass: 1.08, lock: 1.05, typing: 1.0, lightbulb: 1.08, shield: 1.05, trophy: 1.08, phone: 1.0, target: 1.05,
  plant: 1.05, megaphone: 1.08, bell: 1.08, key: 1.05, gift: 1.05, object: 1.1,
};
// ganho extra no modo áudio (sem frase na cena): telas grandes quase não crescem, ícones crescem mais
// device/code crescem até ~95% da largura (texto legível no celular); chart é largo e vazava pela borda
const GANHO_AUDIO: Record<string, number> = {code: 1.12, device: 1.22, counter: 1.1, chart: 0.8};

const CenaView: React.FC<{c: Cena; modo: 'audio' | 'texto'}> = ({c, modo}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const {ink} = useTheme();
  const v = c.visual ?? 'orb';

  // --- transição: entrada e saída nesta própria cena (cenas nunca se sobrepõem no tempo) ---
  let blur = 0;
  let clarao = 0;
  let escala = 1;
  if (c.entrada === 'flash' && frame < FL) {
    const k = 1 - frame / FL;
    blur = 20 * k;
    clarao = 0.8 * k;
  }
  if (c.saida === 'flash' && frame >= c.dur - FL) {
    const k = (frame - (c.dur - FL) + 1) / FL;
    blur = Math.max(blur, 20 * k);
    clarao = Math.max(clarao, 0.8 * k);
  }
  if (c.saida === 'push' && frame >= c.dur - PU) {
    const e = Math.pow((frame - (c.dur - PU) + 1) / PU, 2.4); // aceleração: o corte cai na velocidade
    escala = 1 + 0.4 * e;
    blur = Math.max(blur, 12 * e);
  }

  // --- posição do visual compacto ---
  const fill = FILL_VISUALS.has(v) || PROPRIOS.has(v);
  const top = c.place === 'top';
  const center = CONTENT_CENTER[v] ?? 0.3;
  let dy = 0;
  let sc = 1;
  if (!fill) {
    if (modo === 'audio') {
      dy = (0.37 - center) * height;
      sc = (COMPACT_SCALE[v] ?? 1.3) * (GANHO_AUDIO[v] ?? 1.28);
    } else {
      const lineCount = (c.text ?? '').split('\n').filter((l) => l.length).length;
      const extra = Math.max(0, lineCount - 2) * 0.07 + (c.big ? 0.05 : 0);
      dy = ((top ? 0.54 + extra : 0.39 - extra) - center) * height;
      sc = COMPACT_SCALE[v] ?? 1.3;
    }
  }
  const visual = (
    <AbsoluteFill style={{transform: `translateY(${dy}px) scale(${sc})`, transformOrigin: `50% ${center * height}px`}}>
      <Sequence from={-PRE} durationInFrames={c.dur + PRE}>
        <VisualFor c={c} />
      </Sequence>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: escala !== 1 ? `scale(${escala})` : undefined, filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
        {SEM_CAMERA.has(v) ? visual : <KenBurns seed={c.from + 1}>{visual}</KenBurns>}
        {modo === 'texto' && c.text && v !== 'tipografica' ? <KineticText text={c.text} sub={c.sub} big={c.big} hold={c.dur} place={c.place} entranceStyle={0} compact={!fill} /> : null}
      </AbsoluteFill>
      {clarao > 0.01 ? <AbsoluteFill style={{background: ink, opacity: clarao}} /> : null}
    </AbsoluteFill>
  );
};

const Body: React.FC<ReelProps> = ({cenas, legendas = [], modo = 'texto', audioSrc, trilhaSrc, trilhaVol, sfx = [], totalFrames}) => {
  useReelFont();
  const {bg} = useTheme();
  const T = totalFrames;
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} volume={(f) => interpolate(f, [0, 3, T - 4, T], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      {trilhaSrc ? <Audio src={staticFile(trilhaSrc)} loop volume={(f) => (trilhaVol ?? (audioSrc ? 0.1 : 0.35)) * interpolate(f, [0, 30, T - 45, T], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, T - Math.max(0, s.from))}>
          <Audio src={staticFile(s.src)} volume={Math.pow(10, s.gainDb / 20)} />
        </Sequence>
      ))}

      <AbsoluteFill style={{opacity: 0.5}}>
        <ParticleField density={70} />
      </AbsoluteFill>

      {cenas.map((c, i) => (
        <Sequence key={`c${i}`} from={c.from} durationInFrames={c.dur}>
          <CenaView c={c} modo={modo} />
        </Sequence>
      ))}

      {modo === 'audio' ? <Legendas blocos={legendas} /> : null}
      <Ambient />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = (props) => {
  const theme = resolveTheme(props.theme);
  return (
    <ThemeProvider theme={theme}>
      <Body {...props} />
    </ThemeProvider>
  );
};
