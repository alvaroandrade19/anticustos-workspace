#!/usr/bin/env node
/*
 * respiros.mjs: deixa uma narração corrida mais calma inserindo pausas entre frases, sem acelerar
 * nem distorcer a voz. Porta do inserir-respiros.mjs (reference/pontilhismo/, MIT) pro formato de
 * transcript desta skill ({text, words:[{word,start,end}], duration}).
 *
 * Regra de ouro (do original, não regredir): só corta onde há SILÊNCIO REAL. Procura o trecho mais
 * silencioso entre o fim de uma palavra e o começo da próxima; sem silêncio seguro, pula e avisa.
 * Cortar no meio ou na cauda de uma palavra é o defeito "voz picotada".
 *
 * Quando usar: voz sintética ou fala gravada muito corrida, ANTES de dirigir as cenas (os tempos
 * mudam). Os índices das palavras não mudam, então as `correcoes` do plano continuam valendo.
 *
 * Uso:
 *   node respiros.mjs --audio <voz> --words <words.json> --out-audio <voz-respiros.wav> --out-words <words-respiros.json>
 *                     [--pausa ".=0.45;?=0.45;…=0.55;:=0.35;,=0.2"]
 * Depois: no plano, "audio" e "words" apontam pros arquivos novos. OUÇA as emendas antes de seguir.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const input = get('--audio'), wordsPath = get('--words'), outAudio = get('--out-audio'), outWords = get('--out-words');
if (!input || !wordsPath || !outAudio || !outWords) {
  console.error('uso: node respiros.mjs --audio <voz> --words <words.json> --out-audio <saida.wav> --out-words <words-respiros.json> [--pausa ".=0.45;,=0.2"]');
  process.exit(2);
}
const PAUSA = {'.': 0.45, '!': 0.45, '?': 0.45, '…': 0.55, ':': 0.35, ',': 0.2};
for (const par of String(get('--pausa', '')).split(';').filter(Boolean)) {
  const i = par.lastIndexOf('=');
  if (i > 0) PAUSA[par.slice(0, i)] = +par.slice(i + 1);
}
const SR = 44100;

const raw = path.join(os.tmpdir(), `respiros-${process.pid}.f32`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-ac', '1', '-ar', String(SR), '-f', 'f32le', raw]);
const buf = fs.readFileSync(raw);
const x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const db = (t) => {
  const s = Math.round(t * SR), w = Math.round(SR * 0.01);
  let a = 0;
  for (let i = s; i < s + w; i++) a += (x[i] || 0) ** 2;
  return 20 * Math.log10(Math.sqrt(a / w) + 1e-9);
};

const tr = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
const words = tr.words;
const cuts = [];
words.forEach((w, i) => {
  const next = words[i + 1];
  if (!next) return;
  const p = PAUSA[String(w.word).trim().slice(-1)];
  if (!p) return;
  // o trecho silencioso mais longo entre esta palavra e a próxima, do limiar mais exigente ao mais tolerante
  let best = null;
  for (const th of [-44, -40, -37]) {
    let run = 0, rs = 0;
    for (let t = Math.max(w.end - 0.05, next.start - 0.45); t <= next.start + 0.06; t += 0.005) {
      if (db(t) < th) {
        if (!run) rs = t;
        run += 0.005;
        if (!best || run > best.len) best = {len: run, c: rs + run / 2};
      } else run = 0;
    }
    if (best && best.len >= 0.08) break;
  }
  if (best && best.len >= 0.07) cuts.push([+best.c.toFixed(3), p]);
  else console.warn(`[respiros] sem silêncio seguro antes de "${next.word}" (${next.start}s): pausa ignorada`);
});

// monta o áudio: trechos + silêncio, com micro-fades pra não estalar
const parts = [];
let prev = 0;
cuts.forEach(([c, s], i) => {
  parts.push(`[0:a]atrim=${prev}:${c},asetpts=N/SR/TB${i ? ',afade=t=in:d=0.01' : ''},afade=t=out:st=${(c - prev - 0.015).toFixed(3)}:d=0.015[a${i}]`);
  parts.push(`anullsrc=r=${SR}:cl=mono,atrim=0:${s}[s${i}]`);
  prev = c;
});
parts.push(`[0:a]atrim=${prev},asetpts=N/SR/TB${cuts.length ? ',afade=t=in:d=0.01' : ''}[a${cuts.length}]`);
parts.push(`${cuts.map((_, k) => `[a${k}][s${k}]`).join('')}[a${cuts.length}]concat=n=${2 * cuts.length + 1}:v=0:a=1[out]`);
const script = path.join(os.tmpdir(), `respiros-${process.pid}.txt`);
fs.writeFileSync(script, parts.join(';'));
fs.mkdirSync(path.dirname(path.resolve(outAudio)), {recursive: true});
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-/filter_complex', script /* ffmpeg 7+: -filter_complex_script saiu */, '-map', '[out]', '-ar', String(SR), '-ac', '1', ...(/\.mp3$/i.test(outAudio) ? ['-b:a', '192k'] : []), outAudio]);

// desloca os tempos (os índices não mudam: correções do plano continuam valendo)
const shift = (t) => t + cuts.reduce((a, [c, s]) => a + (t > c ? s : 0), 0);
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outAudio]).toString().trim();
const novo = {...tr, words: words.map((w) => ({...w, start: +shift(w.start).toFixed(3), end: +shift(w.end).toFixed(3)})), duration: +dur.toFixed(3), respiros: cuts};
fs.writeFileSync(outWords, JSON.stringify(novo, null, 1));
fs.unlinkSync(raw);
fs.unlinkSync(script);
const ganho = cuts.reduce((a, [, s]) => a + s, 0);
console.log(`[respiros] ${cuts.length} respiros (+${ganho.toFixed(2)}s) · narração ${tr.duration?.toFixed?.(2) ?? '?'}s → ${dur.toFixed(2)}s`);
console.log(`OUT=${outAudio}`);
