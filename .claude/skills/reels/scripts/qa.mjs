#!/usr/bin/env node
/*
 * qa.mjs: travas medidas do vídeo pronto. "Medir, não estimar": laudo que existe pra verificar
 * não pode ter número que ninguém mediu. render.mjs roda isto sozinho no fim.
 *
 * Checa: duração contra o plano, presença de áudio, volume integrado e pico verdadeiro (a meta é
 * -14 LUFS / pico ≤ -1 dBTP, perto do que o Instagram normaliza), trecho de tela preta (cena vazia,
 * o reel antigo tinha uma), trecho congelado acima de 1,5s e bitrate. Grava <video>.qa.json.
 *
 * Uso: node qa.mjs --video <mp4> [--frames <total esperado>] [--com-audio]
 * Sai 0 se aprovado, 5 se alguma trava reprovou.
 */
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const video = get('--video');
const frames = get('--frames') ? parseInt(get('--frames'), 10) : null;
const comAudio = args.includes('--com-audio');
if (!video) { console.error('uso: node qa.mjs --video <mp4> [--frames N] [--com-audio]'); process.exit(2); }

const ff = (a) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...a], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}).stderr || '';
const probe = (a) => (spawnSync('ffprobe', ['-v', 'error', ...a, '-of', 'default=noprint_wrappers=1:nokey=1', video], {encoding: 'utf8'}).stdout || '').trim();

const r = {video, travas: [], medidas: {}};
const trava = (nome, ok, detalhe) => r.travas.push({nome, ok, detalhe});

// duração
// duração da TRILHA DE VÍDEO: a do contêiner inclui o preenchimento do codec de áudio (~0,1s) e engana
const dur = parseFloat(probe(['-select_streams', 'v:0', '-show_entries', 'stream=duration']));
const nq = parseInt(probe(['-select_streams', 'v:0', '-show_entries', 'stream=nb_frames']), 10);
r.medidas.duracao_s = +dur.toFixed(3);
r.medidas.quadros = nq;
if (frames) trava('quadros batem com o plano', Math.abs(nq - frames) <= 1, `${nq} medidos, ${frames} no plano`);
const dims = probe(['-select_streams', 'v:0', '-show_entries', 'stream=width,height']).split(/\s+/).join('x');
trava('formato 1080x1920', dims === '1080x1920', dims);
const br = parseInt(probe(['-show_entries', 'format=bit_rate']), 10);
r.medidas.bitrate_kbps = Math.round(br / 1000);

// áudio
const temAudio = probe(['-select_streams', 'a', '-show_entries', 'stream=codec_name']).length > 0;
if (comAudio) trava('tem áudio', temAudio, temAudio ? 'ok' : 'vídeo narrado sem trilha de áudio');
// volume só se cobra com voz ou trilha (--com-audio); um reel só com os efeitos fica baixo de propósito
if (temAudio && comAudio) {
  const e = ff(['-i', video, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const I = parseFloat((e.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
  const tpm = e.match(/Peak:\s+(-?[\d.]+) dBFS/g);
  const TP = tpm ? parseFloat(tpm.pop().match(/-?[\d.]+/)[0]) : NaN;
  r.medidas.lufs = I;
  r.medidas.true_peak_db = TP;
  trava('volume entre -16 e -12 LUFS', I >= -16 && I <= -12, `${I} LUFS`);
  trava('pico verdadeiro ≤ -1 dBTP', TP <= -1.0, `${TP} dBTP`);
}

// tela preta: o fundo do tema é quase preto, então só acusa quadro PRETO E VAZIO por mais de 0,4s
const bd = ff(['-i', video, '-vf', 'blackdetect=d=0.4:pix_th=0.06:pic_th=0.995', '-an', '-f', 'null', '-']);
const pretos = [...bd.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
r.medidas.trechos_pretos = pretos;
trava('nenhuma cena vazia (preto > 0,4s)', pretos.length === 0, pretos.length ? pretos.map(([a, b]) => `${a.toFixed(1)}s a ${b.toFixed(1)}s`).join(', ') : 'ok');

// congelado: nada muda por mais de 1,5s (o grão mexe pouco; limiar calibrado acima dele)
const fz = ff(['-i', video, '-vf', 'freezedetect=n=0.002:d=1.5', '-an', '-f', 'null', '-']);
const cong = [...fz.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_end: ([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
r.medidas.trechos_congelados = cong;
trava('nada parado acima de 1,5s', cong.length === 0, cong.length ? cong.map(([a, b]) => `${a.toFixed(1)}s a ${b.toFixed(1)}s`).join(', ') : 'ok');

const reprovadas = r.travas.filter((t) => !t.ok);
r.aprovado = reprovadas.length === 0;
writeFileSync(video.replace(/\.mp4$/i, '.qa.json'), JSON.stringify(r, null, 2));
console.log(`[qa] ${video}`);
for (const t of r.travas) console.log(`  ${t.ok ? 'OK   ' : 'FALHA'} ${t.nome}: ${t.detalhe}`);
console.log(`  bitrate ${r.medidas.bitrate_kbps} kbps`);
console.log(r.aprovado ? '[qa] aprovado.' : `[qa] REPROVADO em ${reprovadas.length} trava(s).`);
process.exit(r.aprovado ? 0 : 5);
