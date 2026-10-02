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
import {Mundo, MundoSpec} from './mundo';
import {KineticText, FONT} from './text';
import {Theme, resolveTheme, ThemeProvider, useTheme} from './theme';

export type Trans = 'fundir' | 'corte' | 'flash' | 'push';

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
  mundo?: MundoSpec; // mundo de pontos contínuo (mundo.tsx); aparece nas cenas "visual": "mundo"
};

export const PRE = 8; // quadros que o visual já rodou antes do corte
const FL = 6; // meia duração do flash
const PU = 10; // duração do push de saída
// fundir (padrão desde 01/10/2026, pedido do Alvaro: "corte muito seco"): a cena que sai continua viva
// FU quadros por baixo e a que entra surge por cima (opacidade + desfoque que resolve + leve aproximação).
// A que sai some mais devagar que a outra entra (1 - k²): sem "mergulho" no escuro no meio da troca.
export const FU = 9;
const easeIO = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

const useReelFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile('Anton-Regular.ttf')})`);
    face.load().then((l) => {(document.fonts as unknown as {add: (f: FontFace) => void}).add(l); continueRender(handle);}).catch(() => continueRender(handle));
  }, [handle]);
};

// f0 = quadro local do visual em que a cena corta; evento vem em quadros locais da CENA.
const VisualFor: React.FC<{c: Cena; mundo?: MundoSpec}> = ({c, mundo}) => {
  const f0 = PRE;
  const ev = c.evento !== undefined ? c.evento + PRE : undefined;
  switch (c.visual) {
    case 'mundo': return mundo ? <Mundo spec={mundo} base={c.from - PRE} /> : null;
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
const PROPRIOS = new Set(['mundo', 'tipografica', 'faixa', 'barras', 'prova', 'logo', 'video', 'animacao']);
const FILL_VISUALS = new Set<string>(['grid', 'crowd', 'particles']);
const SEM_CAMERA = new Set(['mundo', 'tipografica', 'prova', 'video', 'logo']); // já têm câmera própria
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

const CenaView: React.FC<{c: Cena; modo: 'audio' | 'texto'; mundo?: MundoSpec; ext?: number}> = ({c, modo, mundo, ext = 0}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const {ink} = useTheme();
  const v = c.visual ?? 'orb';

  // --- transição: entrada e saída nesta própria cena. Só "fundir" sobrepõe duas cenas (ext quadros
  // de cauda da que sai); corte, flash e push continuam dentro da janela de cada uma.
  let blur = 0;
  let clarao = 0;
  let escala = 1;
  let opac = 1;
  if (c.entrada === 'fundir' && frame < FU) {
    const k = easeIO((frame + 1) / FU);
    opac = k;
    blur = 7 * (1 - k);
    escala = 1.03 - 0.03 * k;
  }
  if (ext > 0 && frame >= c.dur) {
    const k = (frame - c.dur + 1) / ext;
    opac = Math.min(opac, 1 - k * k);
    blur = Math.max(blur, 5 * k);
  }
  // flash e push suavizados na mesma revisão (metade do clarão e do desfoque, push mais curto no zoom)
  if (c.entrada === 'flash' && frame < FL) {
    const k = 1 - frame / FL;
    blur = Math.max(blur, 10 * k);
    clarao = 0.32 * k;
  }
  if (c.saida === 'flash' && frame >= c.dur - FL && frame < c.dur) {
    const k = (frame - (c.dur - FL) + 1) / FL;
    blur = Math.max(blur, 10 * k);
    clarao = Math.max(clarao, 0.32 * k);
  }
  if (c.saida === 'push' && frame >= c.dur - PU && frame < c.dur) {
    const e = Math.pow((frame - (c.dur - PU) + 1) / PU, 2.4); // aceleração: o corte cai na velocidade
    escala = 1 + 0.22 * e;
    blur = Math.max(blur, 7 * e);
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
      <Sequence from={-PRE} durationInFrames={c.dur + PRE + ext}>
        <VisualFor c={c} mundo={mundo} />
      </Sequence>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{opacity: opac < 0.999 ? opac : undefined}}>
      <AbsoluteFill style={{transform: escala !== 1 ? `scale(${escala})` : undefined, filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
        {SEM_CAMERA.has(v) ? visual : <KenBurns seed={c.from + 1}>{visual}</KenBurns>}
        {modo === 'texto' && c.text && v !== 'tipografica' ? <KineticText text={c.text} sub={c.sub} big={c.big} hold={c.dur} place={c.place} entranceStyle={0} compact={!fill} /> : null}
      </AbsoluteFill>
      {clarao > 0.01 ? <AbsoluteFill style={{background: ink, opacity: clarao}} /> : null}
    </AbsoluteFill>
  );
};

const Body: React.FC<ReelProps> = ({cenas, legendas = [], modo = 'texto', audioSrc, trilhaSrc, trilhaVol, sfx = [], totalFrames, mundo}) => {
  useReelFont();
  const {bg} = useTheme();
  const T = totalFrames;
  // o mundo recebe o total do reel (pro final em mergulho); memo pra não recriar a spec a cada quadro
  const spec = React.useMemo(() => (mundo ? {...mundo, total: totalFrames} : undefined), [mundo, totalFrames]);
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} volume={(f) => interpolate(f, [0, 3, T - 4, T], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      {trilhaSrc ? <Audio src={staticFile(trilhaSrc)} loop volume={(f) => (trilhaVol ?? (audioSrc ? 0.1 : 0.35)) * interpolate(f, [0, 30, T - 45, T], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, T - Math.max(0, s.from))}>
          <Audio src={staticFile(s.src)} volume={Math.pow(10, s.gainDb / 20)} />
        </Sequence>
      ))}

      {/* com mundo de pontos, a poeira dele faz o papel do campo de fundo (duas texturas de ponto brigavam) */}
      {spec ? null : (
        <AbsoluteFill style={{opacity: 0.5}}>
          <ParticleField density={70} />
        </AbsoluteFill>
      )}

      {cenas.map((c, i) => {
        // a cena seguinte entra fundindo: esta continua viva FU quadros por baixo dela
        const ext = cenas[i + 1]?.entrada === 'fundir' ? Math.min(FU, Math.max(0, T - c.from - c.dur)) : 0;
        return (
          <Sequence key={`c${i}`} from={c.from} durationInFrames={c.dur + ext}>
            <CenaView c={c} modo={modo} mundo={spec} ext={ext} />
          </Sequence>
        );
      })}

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
