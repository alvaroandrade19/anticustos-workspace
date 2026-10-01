#!/usr/bin/env node
/*
 * sfx-gerar.mjs: sintetiza os 3 efeitos padrão da skill em assets/sfx/ (licença nenhuma a pagar,
 * nada de terceiros empacotado). Rodar de novo só se quiser recalibrar o timbre.
 *   whoosh.wav  passagem de ar curta (flash/push). O pico fica em ~0,2s: é ele que casa com o corte.
 *   tique.wav   clique seco e baixo (um dado pousando).
 *   grave.wav   pulso grave curto (corte pra uma tela tipográfica).
 * Todos com pico normalizado em -3 dBFS; o ganho de mixagem por evento fica no plano (plano.mjs).
 * Síntese não substitui escuta: o Alvaro aprova de ouvido. Biblioteca própria entra por "sfxDir".
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sfx');
mkdirSync(dir, {recursive: true});
const receitas = {
  whoosh: "anoisesrc=color=pink:duration=0.6:amplitude=0.8:seed=7,highpass=f=350,lowpass=f=3800,afade=t=in:st=0:d=0.2:curve=exp,afade=t=out:st=0.2:d=0.4:curve=exp",
  tique: "sine=f=1650:duration=0.06,afade=t=out:st=0.004:d=0.05:curve=exp,highpass=f=600",
  grave: "sine=f=58:duration=0.55,volume=1.0,afade=t=in:st=0:d=0.006,afade=t=out:st=0.03:d=0.5:curve=exp,lowpass=f=240",
};
for (const [nome, f] of Object.entries(receitas)) {
  const cru = path.join(dir, `${nome}-cru.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', f, '-ac', '2', '-ar', '48000', cru]);
  const vd = spawnSync('ffmpeg', ['-hide_banner', '-i', cru, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
  const pico = parseFloat(vd.match(/max_volume: (-?[\d.]+) dB/)[1]);
  const out = path.join(dir, `${nome}.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', cru, '-af', `volume=${(-3 - pico).toFixed(2)}dB`, '-c:a', 'pcm_s16le', out]);
  rmSync(cru, {force: true});
  console.log(`[sfx] ${nome}.wav (pico ajustado de ${pico} para -3 dBFS)`);
}
