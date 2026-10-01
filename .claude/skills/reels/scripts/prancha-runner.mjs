#!/usr/bin/env node
/*
 * prancha-runner.mjs: roda DENTRO da pasta do motor (render.mjs copia pra lá). Não chamar direto.
 *
 * Prancha antes de render: uma foto do início, do meio e do fim de cada cena, em folhas de contato.
 * Um bundle e um navegador só pra todas as fotos, então sai em segundos, não no minuto do render.
 * O início é tirado 3 quadros depois do corte (o herói já tem que estar em voo); o fim, antes da
 * saída (texto pela metade no fim = evento que não terminou).
 */
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {readFileSync, mkdirSync, rmSync, readdirSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const dest = get('--dest') || path.resolve('out', 'prancha');
const browserExecutable = get('--browser') || null;
rmSync(dest, {recursive: true, force: true});
mkdirSync(dest, {recursive: true});

const props = JSON.parse(readFileSync('props.json', 'utf8'));
console.log('[prancha] montando o bundle...');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'reel', inputProps: props, puppeteerInstance: browser, browserExecutable});

const POR_FOLHA = 12; // cenas por folha (6 linhas de 2 cenas × 3 estados)
const fotos = [];
props.cenas.forEach((c, i) => {
  const ini = c.from + Math.min(c.entrada === 'flash' ? 8 : 3, c.dur - 1); // depois do clarão, senão a foto mostra a transição
  const meio = c.from + Math.floor(c.dur / 2);
  const fim = c.from + Math.max(0, c.dur - 9);
  fotos.push([i, 'i', ini], [i, 'm', meio], [i, 'f', fim]);
});
console.log(`[prancha] ${fotos.length} fotos de ${props.cenas.length} cenas...`);
let n = 0;
const foto = async ([i, e, frame]) => {
  const folha = Math.floor(i / POR_FOLHA);
  const pos = (i % POR_FOLHA) * 3 + (e === 'i' ? 0 : e === 'm' ? 1 : 2);
  const bruto = path.join(dest, `b-${folha}-${String(pos).padStart(3, '0')}.jpg`);
  await renderStill({composition, serveUrl, output: bruto, frame: Math.min(frame, props.totalFrames - 1), inputProps: props, imageFormat: 'jpeg', jpegQuality: 82, scale: 0.25, puppeteerInstance: browser, timeoutInMilliseconds: 120000});
  // rótulo: número da cena + estado, pra conversar sobre a prancha sem ambiguidade
  const rot = `${i + 1}${e === 'i' ? ' início' : e === 'm' ? ' meio' : ' fim'}`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', bruto, '-vf', `drawtext=fontfile=public/Anton-Regular.ttf:text='${rot}':x=8:y=8:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6`, path.join(dest, `s-${folha}-${String(pos).padStart(3, '0')}.jpg`)]);
  rmSync(bruto, {force: true});
  if (++n % 15 === 0) console.log(`[prancha] ${n}/${fotos.length}`);
};
// fotos em paralelo no mesmo navegador (uma aba cada). Com 3 abas uma estourou o limite de 28s pra
// carregar (4 núcleos disputados); 2 abas com limite folgado é o ponto medido
const PARALELO = parseInt(process.env.PRANCHA_PARALELO || '2', 10);
const fila = [...fotos];
await Promise.all(Array.from({length: PARALELO}, async () => { while (fila.length) await foto(fila.shift()); }));
await browser.close({silent: true});

// completa a última folha com quadros pretos e monta 6x6
const folhas = Math.ceil(props.cenas.length / POR_FOLHA);
for (let f = 0; f < folhas; f++) {
  const tem = readdirSync(dest).filter((x) => x.startsWith(`s-${f}-`)).length;
  for (let p = tem; p < POR_FOLHA * 3; p++) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x111111:s=270x480', '-frames:v', '1', path.join(dest, `s-${f}-${String(p).padStart(3, '0')}.jpg`)]);
  }
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-start_number', '0', '-i', path.join(dest, `s-${f}-%03d.jpg`), '-vf', 'tile=6x6:padding=4:color=0x222222', '-frames:v', '1', '-q:v', '3', path.join(dest, `folha-${String(f + 1).padStart(2, '0')}.jpg`)]);
}
console.log(`[prancha] ${folhas} folha(s) prontas.`);
