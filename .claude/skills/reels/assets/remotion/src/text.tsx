/*
 * text.tsx — kinetic typography overlay in the LOWER THIRD (never collides with the upper
 * visual). Line-by-line rise + spring scale-punch on "big". Colors from the active Theme.
 * No overflow:hidden mask (it clips PT diacritics Ê/Ó/Ç). Anton display face, UPPERCASE.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {useTheme} from './theme';

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const FONT = 'AntonReel';

// Premium per-WORD / per-char entrance system. Research-backed: fast-in / slow-settle (expo-out),
// overshoot ≤ a hair, NEVER multi-bounce; words cascade in (not the whole line as one block) so it
// reads dynamic. No overflow:hidden mask (it clips PT diacritics Ê/Ó/Ç/Ã) — reveals are rise+fade+blur.
type EntStyle = 'rise' | 'pop' | 'cascade' | 'blur';
// rotated by scene index; 'rise' twice = the workhorse, sprinkled with pop + cascade. big → 'blur'.
const ENT_STYLES: EntStyle[] = ['rise', 'pop', 'cascade', 'rise'];

// per-WORD style. `order` = the word's position in the whole text → stagger.
const wordStyleFor = (frame: number, fps: number, order: number, style: EntStyle): React.CSSProperties => {
  switch (style) {
    case 'pop': {
      const f = frame - order * 4;
      const s = spring({frame: f, fps, config: {damping: 14, stiffness: 120, mass: 0.7}}); // single gentle overshoot
      return {opacity: interpolate(f, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), transform: `scale(${interpolate(s, [0, 1], [0.84, 1])})`};
    }
    case 'blur': {
      const p = interpolate(frame - order * 4, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
      return {opacity: p, filter: `blur(${interpolate(p, [0, 1], [16, 0])}px)`, transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`};
    }
    case 'rise':
    default: {
      const p = interpolate(frame - order * 3.5, [0, 17], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
      return {opacity: p, transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px)`};
    }
  }
};

// per-CHARACTER cascade — narrow window so it waves in, never one-letter-at-a-time
const charStyleFor = (frame: number, order: number): React.CSSProperties => {
  const p = interpolate(frame - order * 1.6, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  return {opacity: p, transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`};
};

export const KineticText: React.FC<{
  text: string;
  sub?: string;
  big?: boolean;
  hold: number;
  place?: 'top' | 'bottom';
  entranceStyle?: number; // 0=rise 1=punch 2=slide-left 3=drop; cycles with scene index
  compact?: boolean; // compact (non-frame-filling) scene → text sits closer to the centered visual
}> = ({text, sub, big, hold, place = 'bottom', entranceStyle = 0, compact = false}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ink, accent} = useTheme();
  const lines = text.split('\n');
  const fontSize = big ? width * 0.125 : width * 0.09;
  const outStart = hold - 16;
  const fadeOut = interpolate(frame, [outStart, hold], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const top = place === 'top';
  const style: EntStyle = big ? 'blur' : ENT_STYLES[entranceStyle % ENT_STYLES.length];
  const cascade = style === 'cascade';
  // continuous order counters across the whole text block → smooth staggered cascade
  let wordOrder = 0;
  let charOrder = 0;
  const subDelay = (text.replace(/\n/g, ' ').split(' ').filter(Boolean).length) * 3.5 + 8;

  return (
    <AbsoluteFill style={{justifyContent: top ? 'flex-start' : 'flex-end', alignItems: 'center', paddingLeft: 64, paddingRight: 96, paddingTop: top ? (compact ? height * 0.19 : 150) : 0, paddingBottom: top ? 0 : (compact ? height * 0.28 : 300), opacity: fadeOut}}>
      <div style={{textAlign: 'center'}}>
        {lines.map((line, li) => (
          <div
            key={li}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-end',
              columnGap: fontSize * 0.24,
              fontFamily: `${FONT}, Impact, sans-serif`,
              color: ink,
              textTransform: 'uppercase',
              letterSpacing: '-0.015em',
              lineHeight: 1.06,
              fontSize,
            }}
          >
            {line.split(' ').filter((w) => w.length).map((word, wi) => {
              if (cascade) {
                const node = (
                  <span key={wi} style={{display: 'inline-block', whiteSpace: 'pre'}}>
                    {word.split('').map((c, ci) => (
                      <span key={ci} style={{display: 'inline-block', whiteSpace: 'pre', ...charStyleFor(frame, charOrder++)}}>{c}</span>
                    ))}
                  </span>
                );
                wordOrder++;
                return node;
              }
              return <span key={wi} style={{display: 'inline-block', ...wordStyleFor(frame, fps, wordOrder++, style)}}>{word}</span>;
            })}
          </div>
        ))}
        {sub ? (
          <div style={{fontFamily: 'Arial, sans-serif', textTransform: 'none', letterSpacing: '0.08em', fontSize: fontSize * 0.26, color: accent, opacity: interpolate(frame, [subDelay, subDelay + 16], [0, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), marginTop: 26}}>
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
