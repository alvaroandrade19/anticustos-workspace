/*
 * registros.tsx: os registros visuais da v2 (ver reference/registros.md).
 *
 * Cada um é um JEITO de compor, não só um objeto: tipográfica (a palavra é o herói), dado
 * (faixa, barras), prova (documento real com marca-texto), logo (marca citada) e vídeo (B-roll).
 * Regras que valem em todos, herdadas do estudo de motion editorial:
 *  - um dominante por cena; o texto de cena é só número, nome ou termo (a fala mora na legenda);
 *  - o evento importante cai na palavra (`evento`, em quadros locais do visual);
 *  - câmera OU objeto se move, nunca os dois empurrando ao mesmo tempo.
 * `f0` = quadro local em que a cena "corta" (o visual já roda PRE quadros antes, herói em voo).
 */
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Freeze, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender, cancelRender} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {useTheme, alpha} from './theme';
import {FONT} from './text';

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fmt = (n: number, dec = 0) => Number(n.toFixed(dec)).toLocaleString('pt-BR');

// *palavra* no texto = ênfase na cor de acento. Sem biblioteca de markdown, só isso.
const Enfatizado: React.FC<{texto: string; accent: string}> = ({texto, accent}) => (
  <>
    {texto.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, i) =>
      p.startsWith('*') && p.endsWith('*') ? <span key={i} style={{color: accent}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>
    )}
  </>
);

// ---------------------------------------------------------------------------
// Tipográfica: a frase É a imagem. Corte seco (o corte é a revelação), câmera empurra 0→5%.
// A legenda cala durante esta cena (o plano resolve isso), senão seriam duas tipografias.
// ---------------------------------------------------------------------------
export const Tipografica: React.FC<{text?: string; sub?: string; dur: number}> = ({text = '', sub, dur}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, ink2, accent} = useTheme();
  const linhas = text.split('\n');
  const maior = Math.max(...linhas.map((l) => l.replace(/\*/g, '').length), 1);
  // corpo pelo comprimento da maior linha: Anton ~0,46em por caractere, largura útil 0,80W
  const fs = Math.min(width * 0.22, (width * 0.86) / (maior * 0.47));
  const push = interpolate(frame, [0, dur], [1, 1.05], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: height * 0.12}}>
      <div style={{transform: `scale(${push})`, textAlign: 'center'}}>
        {linhas.map((l, i) => (
          <div key={i} style={{fontFamily: `${FONT}, Impact, sans-serif`, fontSize: fs, lineHeight: 0.98, color: ink, textTransform: 'uppercase', letterSpacing: '-0.01em'}}>
            <Enfatizado texto={l} accent={accent} />
          </div>
        ))}
        {sub ? <div style={{fontFamily: 'Arial, sans-serif', fontSize: width * 0.036, color: ink2, marginTop: 28, letterSpacing: '0.06em'}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Faixa: um intervalo ("de 50 a 280"). Um contador subindo de 0 diria "cresceu", que é outra
// ideia; aqui o trilho mostra onde a faixa mora e a ponta chega no `ate` na palavra.
// ---------------------------------------------------------------------------
export const Faixa: React.FC<{de?: number; ate?: number; unidade?: string; prefix?: string; suffix?: string; evento?: number; f0: number}> = ({de = 0, ate = 100, unidade, prefix = '', suffix = '', evento, f0}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, ink2, accent} = useTheme();
  const max = ate * 1.15;
  const W = width * 0.74;
  const x0 = (de / max) * W;
  const x1 = (ate / max) * W;
  const fim = Math.max(evento ?? f0 + 22, f0 + 10);
  const p = interpolate(frame, [f0 - 4, fim], [0, 1], {...clamp, easing: EXPO});
  const xa = x0 + (x1 - x0) * p;
  const valorAtual = de + (ate - de) * p;
  const pulso = interpolate(frame, [fim, fim + 6, fim + 16], [1, 1.06, 1], clamp);
  const y = height * 0.4;
  const num = width * 0.15;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: (width - W) / 2, top: y, width: W, height: 14, borderRadius: 7, background: alpha(ink2, 0.28)}} />
      <div style={{position: 'absolute', left: (width - W) / 2 + x0, top: y - 3, width: Math.max(4, xa - x0), height: 20, borderRadius: 10, background: accent}} />
      {/* marcador fixo no início da faixa */}
      <div style={{position: 'absolute', left: (width - W) / 2 + x0 - 2, top: y - 26, width: 4, height: 66, background: ink2}} />
      <div style={{position: 'absolute', left: (width - W) / 2 + x0, top: y - num * 1.18, transform: 'translateX(-50%)', fontFamily: `${FONT}, Impact`, fontSize: num * 0.62, color: ink2}}>{prefix}{fmt(de)}{suffix}</div>
      {/* ponta viva: carrega o número */}
      <div style={{position: 'absolute', left: (width - W) / 2 + xa, top: y + 40, transform: `translateX(-50%) scale(${pulso})`, transformOrigin: '50% 0', fontFamily: `${FONT}, Impact`, fontSize: num, color: ink, lineHeight: 1}}>
        {prefix}{fmt(valorAtual)}<span style={{color: accent}}>{suffix}</span>
      </div>
      {unidade ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y + 40 + num * 1.08, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: width * 0.034, color: ink2, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{unidade}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Barras: comparação de valores CONFIRMADOS (2+). Base alinhada, valor em cima, destaque em acento,
// fonte citada embaixo quando houver. Número estimado não vem pra cá (vai marcado como "~").
// ---------------------------------------------------------------------------
export const Barras: React.FC<{valores?: {rotulo?: string; valor: number}[]; destaque?: number; unidade?: string; fonte?: string; suffix?: string; evento?: number; f0: number}> = ({valores = [], destaque, unidade, fonte, suffix = '', evento, f0}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, ink2, accent} = useTheme();
  const vs = valores.length ? valores : [{valor: 1}];
  const max = Math.max(...vs.map((v) => v.valor), 1);
  const n = vs.length;
  const base = height * 0.56;
  const Hmax = height * 0.3;
  const colW = Math.min(width * 0.22, (width * 0.7) / n);
  const gap = colW * 0.45;
  const total = n * colW + (n - 1) * gap;
  const left0 = (width - total) / 2;
  const iDest = destaque ?? vs.findIndex((v) => v.valor === Math.min(...vs.map((x) => x.valor)));
  const fim = Math.max(evento ?? f0 + 24, f0 + 12);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: left0 - 30, width: total + 60, top: base, height: 3, background: alpha(ink2, 0.5)}} />
      {vs.map((v, i) => {
        // a barra de destaque pousa no evento; as outras entram antes, em cascata
        const alvo = i === iDest ? fim : f0 + 6 + i * 5;
        const p = interpolate(frame, [alvo - 16, alvo], [0, 1], {...clamp, easing: EXPO});
        const h = Math.max(6, (v.valor / max) * Hmax * p);
        const x = left0 + i * (colW + gap);
        const cor = i === iDest ? accent : alpha(ink, 0.88);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: base - h, width: colW, height: h, background: cor, borderRadius: '6px 6px 0 0'}} />
            <div style={{position: 'absolute', left: x, width: colW, top: base - h - width * 0.12 - 14, textAlign: 'center', fontFamily: `${FONT}, Impact`, fontSize: width * 0.12, lineHeight: 1, color: i === iDest ? accent : ink, opacity: p}}>{fmt(v.valor * p)}{suffix}</div>
            {v.rotulo ? <div style={{position: 'absolute', left: x - 20, width: colW + 40, top: base + 18, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: width * 0.032, color: ink2, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{v.rotulo}</div> : null}
          </React.Fragment>
        );
      })}
      {unidade ? <div style={{position: 'absolute', left: 0, right: 0, top: height * 0.16, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: width * 0.036, color: ink2, letterSpacing: '0.1em', textTransform: 'uppercase'}}>{unidade}</div> : null}
      {fonte ? <div style={{position: 'absolute', left: 0, right: 0, top: base + 70, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontStyle: 'italic', fontSize: width * 0.024, color: alpha(ink2, 0.8)}}>fonte: {fonte}</div> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Prova: documento/print REAL num cartão. O marca-texto (acento em multiply) risca cada trecho
// na palavra em que ele é citado, e a câmera aproxima do trecho ativo. Anotação nunca redesenha
// o que o documento já mostra. `lente` = círculo translúcido que colore uma região (em foto).
// Coordenadas das marcas em FRAÇÃO da imagem (0..1), geradas por scripts/captura.mjs.
// ---------------------------------------------------------------------------
type Marca = {x: number; y: number; w: number; h: number; em?: number};
export const Prova: React.FC<{src?: string; iw?: number; ih?: number; marcas?: Marca[]; lente?: {x: number; y: number; r: number; em?: number}; fonte?: string; zoom?: number; f0: number; dur: number}> = ({src, iw = 1000, ih = 700, marcas = [], lente, fonte, zoom = 2, f0, dur}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink2, accent} = useTheme();
  if (!src) return null;
  // janela do cartão: parte de cima do quadro, a legenda fica no escuro embaixo
  const winW = width * 0.92;
  const escala = winW / iw; // imagem ajustada pela largura
  const imgH = ih * escala;
  // imagem larga: o cartão não fica com caixa branca vazia, mas cresce o bastante pro zoom ter onde
  // mostrar 3 a 4 linhas do trecho marcado (senão a aproximação espreme o texto numa fresta)
  const winH = Math.min(height * 0.46, Math.max(imgH, imgH * zoom * 0.62));
  const topo = Math.max(height * 0.08, height * 0.37 - winH / 2); // centrado na zona do herói, acima da legenda
  // tempo de cada marca: a do plano (`em`) ou em cascata a partir do corte
  const ts = marcas.map((m, i) => m.em ?? f0 + 8 + i * 20);
  // marca ativa = a última que já começou; a câmera vai até o centro dela
  let ativa = -1;
  ts.forEach((t, i) => { if (frame >= t - 10) ativa = i; });
  const alvoDe = (i: number) => {
    if (i < 0) return {cx: 0.5, cy: Math.min(0.5, (winH / imgH) / 2), z: 1};
    const m = marcas[i];
    return {cx: m.x + m.w / 2, cy: m.y + m.h / 2, z: zoom};
  };
  // interpolação entre o alvo anterior e o atual, 18 quadros, expo
  const tA = ativa >= 0 ? ts[ativa] - 10 : 0;
  const k = interpolate(frame, [tA, tA + 18], [0, 1], {...clamp, easing: EXPO});
  const a = alvoDe(ativa - 1);
  const b = alvoDe(ativa);
  const cx = a.cx + (b.cx - a.cx) * k;
  const cy = a.cy + (b.cy - a.cy) * k;
  const z = (a.z + (b.z - a.z) * k) * interpolate(frame, [0, dur], [1, 1.03], clamp);
  // translação que põe (cx,cy) no centro da janela, sem deixar sobrar borda vazia
  const Wz = winW * z;
  const Hz = imgH * z;
  let tx = winW / 2 - cx * Wz;
  let ty = winH / 2 - cy * Hz;
  tx = Math.min(0, Math.max(winW - Wz, tx));
  ty = Hz <= winH ? (winH - Hz) / 2 : Math.min(0, Math.max(winH - Hz, ty)); // menor que a janela: centra
  const entra = interpolate(frame, [f0 - 8, f0 + 6], [0.94, 1], {...clamp, easing: EXPO});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: (width - winW) / 2, top: topo, width: winW, height: winH, overflow: 'hidden', borderRadius: 10, background: '#fff', boxShadow: `0 30px 60px ${alpha('#000000', 0.55)}`, transform: `scale(${entra})`}}>
        <div style={{position: 'absolute', left: tx, top: ty, width: Wz, height: Hz}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', display: 'block'}} />
          {marcas.map((m, i) => {
            const p = interpolate(frame, [ts[i], ts[i] + 9], [0, 1], clamp); // traço de caneta: velocidade quase constante
            return <div key={i} style={{position: 'absolute', left: `${m.x * 100}%`, top: `${(m.y - m.h * 0.08) * 100}%`, width: `${m.w * 100 * p}%`, height: `${m.h * 116}%`, background: alpha(accent, 0.42), mixBlendMode: 'multiply', borderRadius: 3}} />;
          })}
          {lente ? (() => {
            const t = lente.em ?? f0 + 10;
            const p = interpolate(frame, [t, t + 10], [0, 1], {...clamp, easing: EXPO});
            return <div style={{position: 'absolute', left: `${(lente.x - lente.r) * 100}%`, top: `calc(${lente.y * 100}% - ${lente.r * Wz}px)`, width: `${lente.r * 200}%`, aspectRatio: '1', borderRadius: '50%', background: alpha(accent, 0.35), mixBlendMode: 'multiply', transform: `scale(${p})`}} />;
          })() : null}
        </div>
      </div>
      {fonte ? <div style={{position: 'absolute', left: 0, right: 0, top: topo + winH + 22, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: width * 0.026, color: alpha(ink2, 0.9), letterSpacing: '0.04em'}}>{fonte}</div> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Logo: marca citada pelo nome aparece com o logo real, como herói da janela (~56% da largura).
// ---------------------------------------------------------------------------
export const Logo: React.FC<{src?: string; sub?: string; f0: number}> = ({src, sub, f0}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink2, accent} = useTheme();
  if (!src) return null;
  const p = interpolate(frame, [f0 - 8, f0 + 10], [0, 1], {...clamp, easing: EXPO});
  const fy = Math.sin(frame / 22) * 6;
  const L = width * 0.56;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: width / 2 - L, top: height * 0.38 - L, width: L * 2, height: L * 2, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(accent, 0.18)} 0%, ${alpha(accent, 0)} 62%)`, filter: 'blur(24px)'}} />
      <Img src={staticFile(src)} style={{position: 'absolute', left: (width - L) / 2, top: height * 0.38 - L / 2 + fy, width: L, height: L, objectFit: 'contain', opacity: p, transform: `scale(${0.92 + 0.08 * p})`}} />
      {sub ? <div style={{position: 'absolute', left: 0, right: 0, top: height * 0.38 + L / 2 + 30, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: width * 0.034, color: ink2, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{sub}</div> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Vídeo (B-roll): tela cheia, mudo, com a mesma finalização (grade escura, vinheta) e um scrim
// embaixo pra legenda branca ler sobre qualquer imagem. `inicio` pula o trecho ruim, `vel` estica.
// ---------------------------------------------------------------------------
export const VideoBroll: React.FC<{src?: string; inicio?: number; vel?: number; dur: number; PRE: number}> = ({src, inicio = 0, vel = 1, dur, PRE}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const {bg} = useTheme();
  if (!src) return null;
  const push = interpolate(frame, [PRE, PRE + dur], [1, 1.05], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(Math.max(0, inicio) * fps)} playbackRate={vel} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.78) contrast(1.06) brightness(0.8)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, ${alpha(bg, 0.25)} 0%, ${alpha(bg, 0)} 22%, ${alpha(bg, 0)} 52%, ${alpha(bg, 0.72)} ${Math.round(0.8 * 100)}%, ${alpha(bg, 0.85)} 100%)`, height}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Animação (Lottie): ilustração animada por animador (After Effects), já recolorida pra marca e sem
// fundo por scripts/lottie.mjs. Três cuidados que o componente oficial não tem:
//  - VELOCIDADE REAL: o @remotion/lottie avança 1 quadro da animação por quadro do vídeo. Uma animação
//    de 60 qps tocaria em câmera lenta a 30 qps; aqui o playbackRate compensa pelo frameRate do arquivo.
//  - PICO NA PALAVRA: `pico` (segundos da animação, visto na prévia) cai exatamente no `evento` da fala.
//  - JÁ EM VOO: sem pico, a animação começa PRE quadros antes do corte.
//  - TRECHO: `trecho: [ini, fim]` (segundos) toca só a parte útil; sem loop, segura o último quadro dela
//    (animação que entra do nada ou some no fim não deixa buraco na cena).
// ---------------------------------------------------------------------------
export const Animacao: React.FC<{src?: string; lfr?: number; lip?: number; lop?: number; lw?: number; lh?: number; vel?: number; loop?: boolean; pico?: number; trecho?: [number, number]; escala?: number; lbbox?: number[]; renderer?: 'canvas' | 'svg'; evento?: number; f0: number}> = ({src, lfr = 30, lip = 0, lop = 60, lw = 512, lh = 512, vel = 1, loop = true, pico, trecho, escala = 1, lbbox, renderer = 'canvas', evento, f0}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const [dados, setDados] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender(`lottie ${src}`));
  useEffect(() => {
    if (!src) { continueRender(handle); return; }
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((j) => { setDados(j); continueRender(handle); })
      .catch((e) => cancelRender(e)); // falha alto: animação que não carrega não pode virar cena vazia
  }, [src, handle]);
  if (!dados) return null;
  // Tempo controlado aqui, não pelo componente: calculamos o quadro da animação (lf) e congelamos o
  // Lottie nele. Assim cabem velocidade real, trecho útil, pico na palavra e loop sem salto.
  const rate = (lfr / 30) * vel; // quadros da animação por quadro do vídeo
  // quadros contados a partir do ponto de entrada da animação (é o que o lottie-web e a prévia usam)
  const a = trecho ? trecho[0] * lfr : 0; // início do trecho útil
  const b = trecho ? Math.min(trecho[1] * lfr, lop - lip) : lop - lip; // fim
  const span = Math.max(1, b - a);
  let s = 0; // quadro do visual em que a animação está em `a`
  if (pico !== undefined && evento !== undefined) s = evento - (pico * lfr - a) / rate;
  const t = (frame - s) * rate; // quadros da animação desde `a`
  const lf = loop ? a + (((t % span) + span) % span) : Math.min(b - 1, Math.max(a, a + t)); // sem loop: segura o último quadro do trecho
  // Enquadramento pelo DESENHO (lbbox, medido pelo lottie.mjs), não pela margem que o animador deixou:
  // o desenho vira herói da janela (até 64% da largura e 44% da altura), centrado em 0,38H.
  const [bx, by, bw, bh] = lbbox && lbbox[2] > 0.05 && lbbox[3] > 0.05 ? lbbox : [0, 0, 1, 1];
  const kW = (width * 0.64 * escala) / (bw * lw);
  const kH = (height * 0.44 * escala) / (bh * lh);
  const k = Math.min(kW, kH); // px de tela por unidade da animação
  const W = lw * k;
  const H = lh * k;
  const left = width / 2 - (bx + bw / 2) * W;
  const top = height * 0.38 - (by + bh / 2) * H;
  const entra = interpolate(frame, [f0 - 8, f0 + 6], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left, top, width: W, height: H, transform: `scale(${entra})`, transformOrigin: `${(bx + bw / 2) * 100}% ${(by + bh / 2) * 100}%`}}>
        <Freeze frame={Math.round(lf)}>
          {/* canvas: medido ~2x mais rápido que svg por quadro, visual idêntico; "renderer": "svg" na cena se algum efeito não desenhar */}
          <Lottie animationData={dados} loop={false} renderer={renderer} style={{width: W, height: H}} />
        </Freeze>
      </div>
    </AbsoluteFill>
  );
};
