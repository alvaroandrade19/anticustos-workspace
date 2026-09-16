#!/usr/bin/env node
/*
 * transcribe.mjs — local VERBATIM transcription for the reels skill (Whisper, no API key, offline).
 *
 * Why: when the user gives an AUDIO and wants the captions to be EXACTLY what they said (nothing
 * invented, nothing cut), the skill transcribes it locally and uses those exact words. This script
 * is the deterministic, repeatable transcription path — the SKILL only decides how to GROUP the
 * words into slides; this gets the words + per-word timing.
 *
 * Mirrors render.mjs: installs the engine ONCE into a persistent deps dir (the ~150MB model is
 * cached there too), uses ffmpeg (already on the machine) to decode, runs the runner from that dir.
 *
 * Usage:
 *   node transcribe.mjs --audio "<audio>" --out "<words.json>" [--model Xenova/whisper-base]
 * Output JSON: {text, words:[{word,start,end}], duration}. Exit 0 on success (prints OUT=<path>).
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync, copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const audioPath = getArg('--audio');
const outPath = getArg('--out');
const model = getArg('--model') || 'Xenova/whisper-base';

if (!audioPath || !outPath) {
  console.error('uso: node transcribe.mjs --audio <audio> --out <words.json> [--model <id>]');
  process.exit(2);
}
const log = (m) => console.error(`[transcribe] ${m}`);
const audioAbs = path.resolve(audioPath);
const outAbs = path.resolve(outPath);
if (!existsSync(audioAbs)) {
  console.error('[transcribe] áudio não encontrado: ' + audioAbs);
  process.exit(3);
}

// persistent, no-spaces deps dir (Chromium-style spaces issue doesn't apply, but npm/cache like it tidy)
const base = tmpdir();
const safeBase = base.includes(' ') ? (process.platform === 'win32' ? 'C:\\reel-tmp' : '/tmp') : base;
const deps = path.join(safeBase, 'reels-whisper');
mkdirSync(deps, {recursive: true});
const win = process.platform === 'win32';

// scaffold (idempotent): pinned dep + the runner
const pkg = {name: 'reels-whisper', private: true, type: 'module', dependencies: {'@huggingface/transformers': '^3.0.0'}};
writeFileSync(path.join(deps, 'package.json'), JSON.stringify(pkg, null, 2));
copyFileSync(path.join(__dirname, 'transcribe-runner.mjs'), path.join(deps, 'runner.mjs'));

try {
  if (!existsSync(path.join(deps, 'node_modules', '@huggingface', 'transformers'))) {
    log('instalando o motor de transcrição (só na primeira vez, ~1-2 min)...');
    execFileSync(win ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund', '--silent'], {cwd: deps, stdio: 'inherit', shell: win});
  }
  log('transcrevendo (a 1ª vez também baixa o modelo, ~150MB; depois fica em cache)...');
  // Na primeira execução o onnxruntime costuma falhar ao abrir o .onnx que acabou de ser
  // baixado ("system error number 13"): o arquivo ainda está preso pelo processo do download.
  // Verificado no Windows em 14/09/2026. A segunda tentativa, com o modelo já em cache, passa.
  const rodar = () => execFileSync('node', ['runner.mjs', '--audio', audioAbs, '--out', outAbs, '--model', model], {cwd: deps, stdio: 'inherit'});
  try {
    rodar();
  } catch (primeira) {
    log('a primeira tentativa falhou (modelo recém-baixado ainda travado). Tentando de novo...');
    rodar();
  }
  log('pronto: ' + outAbs);
  console.log('OUT=' + outAbs);
} catch (err) {
  console.error('[transcribe] falhou: ' + err.message);
  process.exit(1);
}
