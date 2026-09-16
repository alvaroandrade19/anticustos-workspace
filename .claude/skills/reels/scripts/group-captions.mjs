#!/usr/bin/env node
/*
 * group-captions.mjs — turn the VERBATIM transcript (words + timestamps) into well-PACED slides.
 *
 * The problem this solves (reported twice): captioning the whole audio is right, but if you split it
 * into too many slides, some flash by before they can be read. This groups the EXACT words (never
 * dropping/reordering/adding any) into slides that each own enough on-screen time to be READABLE,
 * while staying synced to the speech and not dragging. Pure JS, no deps.
 *
 * Usage:
 *   node group-captions.mjs --words <words.json> --out <captions.json>
 *       [--min 1.9] [--max 3.4] [--maxwords 9] [--pause 0.4]
 * Output: { slides:[{text, hold, seconds}], audioSeconds, audioDurationInFrames, fullText }
 *   - text: the slide's words, UPPERCASE, with \n line breaks (≤ ~4 words/line, ≤ 3 lines).
 *   - hold: frames (30fps) for the slide's on-screen window (start-of-this → start-of-next).
 */
import {readFileSync, writeFileSync} from 'node:fs';

const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const wordsPath = get('--words');
const outPath = get('--out');
const MIN = parseFloat(get('--min', '1.9')); // min seconds a slide stays on screen (readability floor)
const MAX = parseFloat(get('--max', '3.4')); // max seconds before forcing a split (don't drag)
const MAXW = parseInt(get('--maxwords', '9'), 10); // max words per slide
const PAUSE = parseFloat(get('--pause', '0.4')); // a speech gap this big is a good slide boundary
if (!wordsPath || !outPath) {
  console.error('uso: node group-captions.mjs --words <words.json> --out <captions.json>');
  process.exit(2);
}

const data = JSON.parse(readFileSync(wordsPath, 'utf8'));
let words = (data.words || []).filter((w) => w && w.word);
if (!words.length) {
  console.error('[group] sem palavras no transcript');
  process.exit(3);
}
// tidy ONLY mechanical splits (never change a spoken word): a lone "%" joins the previous number.
words = words.reduce((acc, w) => {
  if (/^%/.test(w.word) && acc.length) {
    acc[acc.length - 1] = {...acc[acc.length - 1], word: acc[acc.length - 1].word + w.word, end: w.end};
  } else acc.push(w);
  return acc;
}, []);
const audioSeconds = data.duration || words[words.length - 1].end || 0;

// --- 1. greedy grouping by readable time + natural boundaries ---
let groups = [];
let cur = [];
for (let i = 0; i < words.length; i++) {
  cur.push(words[i]);
  const first = cur[0];
  const last = words[i];
  const dur = last.end - first.start;
  const next = words[i + 1];
  const gap = next ? next.start - last.end : Infinity;
  const endsSentence = /[.!?…]$/.test(last.word);
  const enough = dur >= MIN;
  if (cur.length >= MAXW || dur >= MAX || (enough && (endsSentence || gap >= PAUSE))) {
    groups.push(cur);
    cur = [];
  }
}
if (cur.length) groups.push(cur);

// --- 2. display windows (start of this slide → start of next; first starts at 0, last ends at audio end) ---
const windows = (gs) =>
  gs.map((g, i) => {
    const start = i === 0 ? 0 : g[0].start;
    const end = i < gs.length - 1 ? gs[i + 1][0].start : audioSeconds;
    return {words: g, start, end, dur: Math.max(0, end - start)};
  });

// --- 3. merge any slide whose WINDOW is shorter than MIN into its shorter neighbor (kills flashes) ---
let win = windows(groups);
let guard = 0;
while (win.length > 1 && guard++ < 500) {
  const i = win.findIndex((w) => w.dur < MIN);
  if (i === -1) break;
  let j;
  if (i === 0) j = 1;
  else if (i === win.length - 1) j = i - 1;
  else j = win[i - 1].dur <= win[i + 1].dur ? i - 1 : i + 1;
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  groups = groups.slice(0, lo).concat([groups[lo].concat(groups[hi])]).concat(groups.slice(hi + 1));
  win = windows(groups);
}

// --- 4. render each slide's text (UPPERCASE, ≤ ~4 words/line, ≤ 3 lines) ---
const toText = (ws) => {
  const toks = ws.map((w) => w.word);
  const n = toks.length;
  const lineCount = Math.min(3, Math.max(1, Math.ceil(n / 4)));
  const per = Math.ceil(n / lineCount);
  const lines = [];
  for (let i = 0; i < n; i += per) lines.push(toks.slice(i, i + per).join(' '));
  return lines.join('\n').toUpperCase();
};

const slides = win.map((w) => ({
  text: toText(w.words),
  hold: Math.max(45, Math.round(w.dur * 30)),
  seconds: +w.dur.toFixed(2),
}));

const fullText = words.map((w) => w.word).join(' ');
writeFileSync(
  outPath,
  JSON.stringify({slides, audioSeconds: +audioSeconds.toFixed(2), audioDurationInFrames: Math.ceil(audioSeconds * 30), fullText}, null, 2)
);
console.error(`[group] ${slides.length} slides (${slides.map((s) => s.seconds + 's').join(', ')}) — ${words.length} palavras, ${audioSeconds.toFixed(1)}s`);
console.log('OUT=' + outPath);
