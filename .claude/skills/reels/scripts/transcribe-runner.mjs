// transcribe-runner.mjs — runs INSIDE the deps dir (where @huggingface/transformers is installed).
// Decodes the audio with ffmpeg and transcribes it locally with Whisper (no API key, offline after
// the model downloads once). Emits {text, words:[{word,start,end}], duration} as JSON.
import {pipeline, env} from '@huggingface/transformers';
import {spawn} from 'node:child_process';
import {writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';

// A shell opened before ffmpeg was added to PATH (winget install, 14/09/2026) spawns 'ffmpeg' as
// ENOENT even though it's installed — same landmine documented in SKILL.md §6. Retry once with the
// known install path before giving up, instead of failing the whole transcription.
const WIN_FFMPEG_FALLBACK = 'C:\\Users\\aandr\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe';

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const audioPath = get('--audio');
const outPath = get('--out');
const model = get('--model') || 'Xenova/whisper-base';

// persist the downloaded model next to the deps so it's fetched only once, ever
env.cacheDir = path.join(process.cwd(), '.cache');

// Decode any audio to 16kHz mono float32 PCM via ffmpeg (already on the machine).
function runFfmpeg(bin, p) {
  return new Promise((resolve, reject) => {
    const ff = spawn(bin, ['-i', p, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], {windowsHide: true});
    const chunks = [];
    let err = '';
    ff.stdout.on('data', (d) => chunks.push(d));
    ff.stderr.on('data', (d) => (err += d.toString()));
    ff.on('error', (e) => reject(e));
    ff.on('close', (code) => {
      if (code !== 0) return reject(new Error('ffmpeg falhou: ' + err.slice(-400)));
      const buf = Buffer.concat(chunks);
      const f32 = new Float32Array(buf.length / 4);
      for (let i = 0; i < f32.length; i++) f32[i] = buf.readFloatLE(i * 4);
      resolve(f32);
    });
  });
}
async function decode(p) {
  try {
    return await runFfmpeg('ffmpeg', p);
  } catch (e) {
    if (e.code === 'ENOENT' && process.platform === 'win32' && existsSync(WIN_FFMPEG_FALLBACK)) {
      return runFfmpeg(WIN_FFMPEG_FALLBACK, p);
    }
    throw e;
  }
}

const audio = await decode(audioPath);
const asr = await pipeline('automatic-speech-recognition', model);
const out = await asr(audio, {
  language: 'portuguese',
  task: 'transcribe',
  return_timestamps: 'word',
  chunk_length_s: 30,
  stride_length_s: 5,
});
const words = (out.chunks || [])
  .map((c) => ({
    word: (c.text || '').trim(),
    start: Array.isArray(c.timestamp) ? c.timestamp[0] : null,
    end: Array.isArray(c.timestamp) ? c.timestamp[1] : null,
  }))
  .filter((w) => w.word);
const duration = words.length ? words[words.length - 1].end ?? null : null;
writeFileSync(outPath, JSON.stringify({text: (out.text || '').trim(), words, duration}, null, 2));
console.error('[transcribe] ' + words.length + ' palavras transcritas');
