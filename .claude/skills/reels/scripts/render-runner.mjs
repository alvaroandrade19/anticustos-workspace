#!/usr/bin/env node
/*
 * render-runner.mjs: roda DENTRO da pasta do motor (render.mjs copia pra lá). Não chamar direto.
 *
 * Render INCREMENTAL. Medimos: cada quadro custa ~0,17s (o Chrome desenhar e fotografar 1080x1920);
 * trocar concorrência ou GPU rende no máximo 10%. O ganho real é não renderizar de novo o que não mudou:
 * corrigir uma cena refazia os 80s inteiros (7 a 11 min). Agora cada cena vira um trecho em cache,
 * com chave pelo CONTEÚDO (a cena, as legendas do intervalo, os arquivos que ela usa e a versão do
 * motor). Só as cenas alteradas renderizam; o resto é reaproveitado e tudo é emendado sem recodificar.
 * O áudio (voz + trilha + sons) também fica em cache; no vídeo novo sai junto do bloco único.
 *
 * O resultado é idêntico ao render inteiro: cada trecho renderiza os quadros com o número ABSOLUTO
 * (grão, partículas e câmera dependem dele) e os blocos são contíguos, sem sobreposição.
 */
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, renameSync, utimesSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const out = path.resolve(get('--out'));
const browserExecutable = get('--browser') || null;
const conc = parseInt(get('--conc') || '3', 10);
const semCache = args.includes('--sem-cache');
const CACHE = path.resolve('cache');
mkdirSync(CACHE, {recursive: true});
mkdirSync(path.dirname(out), {recursive: true});

const sha = (x) => createHash('sha1').update(x).digest('hex');
const props = JSON.parse(readFileSync('props.json', 'utf8'));

// versão do motor: qualquer mudança em src/ ou nas dependências invalida o cache inteiro
const motor = sha(['package.json', ...readdirSync('src').sort().map((f) => `src/${f}`)].map((f) => readFileSync(f)).join('\u0000'));
// conteúdo dos arquivos (o nome em public/a/ é sequencial e pode apontar pra outro arquivo no próximo plano)
const hashArq = new Map();
const hashDe = (rel) => {
  if (!rel) return '';
  if (!hashArq.has(rel)) hashArq.set(rel, existsSync(path.join('public', rel)) ? sha(readFileSync(path.join('public', rel))) : 'ausente');
  return hashArq.get(rel);
};
const chaveDe = (c) => {
  const fim = c.from + c.dur;
  const leg = (props.legendas || []).filter((b) => b.to > c.from && b.from < fim);
  return sha(JSON.stringify({motor, theme: props.theme, modo: props.modo, total: props.totalFrames, c, leg, arq: hashDe(c.src)}));
};

console.log('[render] montando o bundle...');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});

// Sem GPU (ANGLE): medido nesta máquina, rende no máximo ~10% em cena comum e PIORA a cena de vídeo
// (161s contra 115s). Software é o caminho estável.
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'reel', inputProps: props, puppeteerInstance: browser, browserExecutable});

const t0 = Date.now();
const nQuadros = (f) => parseInt(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'csv=p=0', f], {encoding: 'utf8'}).trim(), 10);
const chaves = props.cenas.map((c) => path.join(CACHE, `${chaveDe(c)}.mp4`));
const falta = props.cenas.map((c, i) => semCache || !existsSync(chaves[i]) || statSync(chaves[i]).size === 0);
props.cenas.forEach((c, i) => { if (!falta[i]) { const n = new Date(); utimesSync(chaves[i], n, n); } }); // marca uso (a limpeza vai pela data)

// Cenas seguidas que precisam renderizar viram UM bloco: cada chamada ao renderizador paga ~4s fixos
// (encoder, página), e 27 chamadas deixavam o vídeo novo mais lento que o render inteiro. O bloco sai
// com quadro-chave forçado no início de cada cena e é fatiado sem recodificar; cada fatia vai pro cache.
const blocos = [];
props.cenas.forEach((c, i) => { if (!falta[i]) return; const ult = blocos[blocos.length - 1]; if (ult && ult[ult.length - 1] === i - 1) ult.push(i); else blocos.push([i]); });
const substituto = new Map(); // bloco que não pôde ser fatiado entra inteiro no lugar das suas cenas
// Áudio (voz + trilha + sons): cache pelo conteúdo. A passada só de áudio percorre a composição inteira
// (~2 min medidos); quando o vídeo é novo (um bloco com todas as cenas), o áudio sai junto dele.
const temAudio = Boolean(props.audioSrc || props.trilhaSrc || (props.sfx || []).length);
const chaveAudio = sha(JSON.stringify({motor, t: props.totalFrames, v: props.trilhaVol, a: hashDe(props.audioSrc), tr: hashDe(props.trilhaSrc), sfx: (props.sfx || []).map((x) => [hashDe(x.src), x.from, x.gainDb])}));
const audio = path.join(CACHE, `audio-${chaveAudio}.aac`);
const precisaAudio = temAudio && (semCache || !existsSync(audio));
if (temAudio && !precisaAudio) { const n = new Date(); utimesSync(audio, n, n); }
const blocoTotal = blocos.length === 1 && blocos[0].length === props.cenas.length;
let feitas = 0;
for (const bl of blocos) {
  const ti = Date.now();
  const c0 = props.cenas[bl[0]];
  const cN = props.cenas[bl[bl.length - 1]];
  const cortes = bl.slice(1).map((i) => props.cenas[i].from - c0.from); // quadros relativos ao bloco
  const tmp = path.join(CACHE, `bloco-${Date.now()}.parcial.mp4`);
  await renderMedia({
    composition, serveUrl, inputProps: props, codec: 'h264', muted: !(blocoTotal && precisaAudio), crf: 17,
    frameRange: [c0.from, cN.from + cN.dur - 1], outputLocation: tmp, concurrency: conc,
    puppeteerInstance: browser, logLevel: 'error',
    ffmpegOverride: ({args: a}) => (cortes.length ? [...a.slice(0, -1), '-force_key_frames', `expr:${cortes.map((q) => `eq(n,${q})`).join('+')}`, a[a.length - 1]] : a),
  });
  if (blocoTotal && precisaAudio) {
    // separa o áudio que veio junto e deixa o bloco só com vídeo (as fatias do cache são mudas)
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-map', '0:a', '-c', 'copy', audio]);
    const mudo = tmp.replace('.parcial.mp4', '.mudo.parcial.mp4');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-map', '0:v', '-c', 'copy', mudo]);
    rmSync(tmp, {force: true});
    renameSync(mudo, tmp);
  }
  if (bl.length === 1) renameSync(tmp, chaves[bl[0]]);
  else {
    const padrao = path.join(CACHE, `fatia-${Date.now()}-%03d.mp4`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-map', '0:v', '-c', 'copy', '-f', 'segment', '-segment_frames', cortes.join(','), '-reset_timestamps', '1', padrao]);
    const fatias = bl.map((_, k) => padrao.replace('%03d', String(k).padStart(3, '0')));
    const ok = fatias.every((f, k) => existsSync(f) && nQuadros(f) === props.cenas[bl[k]].dur);
    if (ok) { fatias.forEach((f, k) => renameSync(f, chaves[bl[k]])); rmSync(tmp, {force: true}); }
    else {
      fatias.forEach((f) => rmSync(f, {force: true}));
      const inteiro = tmp.replace('.parcial.mp4', '.mp4');
      renameSync(tmp, inteiro);
      substituto.set(bl[0], {arq: inteiro, cenas: bl});
      console.log('[render] AVISO: bloco não fatiou exato; entra inteiro (sem cache pra essas cenas).');
    }
  }
  feitas += bl.length;
  const seg = bl.reduce((a2, i) => a2 + props.cenas[i].dur, 0) / 30;
  console.log(`[render] cena(s) ${bl[0] + 1}${bl.length > 1 ? ` a ${bl[bl.length - 1] + 1}` : ''} renderizada(s) em ${((Date.now() - ti) / 1000).toFixed(0)}s (${seg.toFixed(1)}s de vídeo)`);
}
console.log(`[render] ${feitas} cena(s) renderizada(s), ${props.cenas.length - feitas} reaproveitada(s) do cache.`);
const trechos = [];
for (let i = 0; i < props.cenas.length; i++) {
  if (substituto.has(i)) { const sb = substituto.get(i); trechos.push(sb.arq); i = sb.cenas[sb.cenas.length - 1]; continue; }
  trechos.push(chaves[i]);
}

if (precisaAudio && !existsSync(audio)) {
  const ta = Date.now();
  await renderMedia({composition, serveUrl, inputProps: props, codec: 'aac', outputLocation: audio, puppeteerInstance: browser, logLevel: 'error'});
  console.log(`[render] áudio refeito em ${((Date.now() - ta) / 1000).toFixed(0)}s (voz, trilha ou sons mudaram)`);
} else if (temAudio) console.log(precisaAudio ? '[render] áudio saiu junto do bloco (agora em cache).' : '[render] áudio reaproveitado do cache.');
await browser.close({silent: true});

// emenda sem recodificar: todos os trechos têm os mesmos parâmetros e começam em quadro-chave
const lista = path.resolve('out', 'trechos.txt');
writeFileSync(lista, trechos.map((t) => `file '${t.replace(/\\/g, '/')}'`).join('\n'));
const muxArgs = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista];
if (temAudio) muxArgs.push('-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'copy');
muxArgs.push('-c:v', 'copy', '-movflags', '+faststart', out);
execFileSync('ffmpeg', muxArgs);
console.log(`[render] pronto em ${((Date.now() - t0) / 1000).toFixed(0)}s (sem contar o bundle).`);

// higiene do cache: some o que não é usado há 21 dias, e nunca passa de ~1,5GB
const agora = Date.now();
const itens = readdirSync(CACHE).map((f) => ({f: path.join(CACHE, f), s: statSync(path.join(CACHE, f))})).filter((x) => x.s.isFile());
for (const x of itens) if (agora - x.s.mtimeMs > 21 * 864e5 || x.f.endsWith('.parcial.mp4')) rmSync(x.f, {force: true});
let total = itens.reduce((a, x) => a + (existsSync(x.f) ? x.s.size : 0), 0);
for (const x of itens.filter((y) => existsSync(y.f)).sort((a, b) => a.s.mtimeMs - b.s.mtimeMs)) {
  if (total < 1.5e9) break;
  if (trechos.includes(x.f) || x.f === audio) continue;
  rmSync(x.f, {force: true});
  total -= x.s.size;
}
