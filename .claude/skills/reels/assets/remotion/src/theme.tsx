/*
 * theme.tsx — color theming. The reel is NOT locked to black/white. A Theme defines the
 * background, ink (foreground), a dim ink, an accent, and a mode (dark/light). Light mode is
 * handled specially (solid orb core instead of emissive glow, dark multiply grain, soft vignette).
 *
 * The skill writes `theme` into props.json (picked from the user's brand / the topic / a named
 * palette / default mono-dark). Components read it via useTheme().
 */
import React, {createContext, useContext} from 'react';

export type Theme = {
  bg: string;
  ink: string; // primary foreground (text, orb core, lines)
  ink2: string; // dimmer foreground (secondary lines, sub text)
  accent: string; // one highlight color
  mode: 'dark' | 'light';
};

export const PALETTES: Record<string, Theme> = {
  // Anti Custos. Tokens copiados de marca/design-guide.md, não inventados aqui: bg --bg,
  // ink --text, ink2 --text-2, accent --accent. Contraste já verificado lá (18,39:1 e 9,13:1
  // do texto sobre o fundo). No claro, o acento é --accent-strong, porque --accent puro sobre
  // #EEF1F6 dá 4,57:1 e fica no limite. É o tema padrão deste workspace.
  'anticustos': {bg: '#05060A', ink: '#F2F4F8', ink2: '#A8AEBF', accent: '#2563EB', mode: 'dark'},
  'anticustos-claro': {bg: '#EEF1F6', ink: '#0B0E14', ink2: '#454C5C', accent: '#1D4ED8', mode: 'light'},
  'mono-dark': {bg: '#000000', ink: '#f5f5f5', ink2: '#9a9a9a', accent: '#cfe0ff', mode: 'dark'},
  'mono-light': {bg: '#faf9f5', ink: '#141413', ink2: '#6a6a68', accent: '#444444', mode: 'light'},
  'editorial': {bg: '#f4f2ee', ink: '#14141a', ink2: '#6b6a66', accent: '#4f46e5', mode: 'light'},
  'editorial-lime': {bg: '#f4f2ee', ink: '#14141a', ink2: '#6b6a66', accent: '#3f7d20', mode: 'light'},
  'ink': {bg: '#0e0e12', ink: '#f4f2ee', ink2: '#8a8a92', accent: '#4f46e5', mode: 'dark'},
  'claude': {bg: '#141413', ink: '#faf9f5', ink2: '#a8a39a', accent: '#d97757', mode: 'dark'},
  'midnight': {bg: '#0a0f1f', ink: '#eaf0ff', ink2: '#8a96b5', accent: '#6a9bcc', mode: 'dark'},
  'emerald': {bg: '#05140d', ink: '#eafff4', ink2: '#7fae97', accent: '#2ecc8f', mode: 'dark'},
  'crimson': {bg: '#160606', ink: '#ffecec', ink2: '#b58a8a', accent: '#e2473f', mode: 'dark'},
  'gold': {bg: '#0a0a06', ink: '#f7f1e0', ink2: '#a89e80', accent: '#d4af37', mode: 'dark'},
  'violet': {bg: '#0d0716', ink: '#f3eaff', ink2: '#9b88b5', accent: '#a06cff', mode: 'dark'},
};

export const resolveTheme = (t?: Partial<Theme> | string): Theme => {
  if (typeof t === 'string') return PALETTES[t] ?? PALETTES['mono-dark'];
  const base = PALETTES['mono-dark'];
  return {...base, ...(t || {})};
};

const ThemeContext = createContext<Theme>(PALETTES['mono-dark']);
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider: React.FC<{theme: Theme; children: React.ReactNode}> = ({theme, children}) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

// helpers for alpha-tinting an ink/accent without a color lib (hex -> rgba)
export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};
