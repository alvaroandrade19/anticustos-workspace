#!/usr/bin/env node
/*
 * pontos.mjs: imagem (retrato, objeto, foto de produto) → pontos pro mundo (forma "imagem").
 * Porta do imagem-para-pontos.mjs da skill de pontilhismo (reference/pontilhismo/, MIT), com:
 *  - grade AUTOMÁTICA: mede quanto da imagem é sujeito e escolhe a grade pra dar ~--alvo pontos
 *    (o original pedia a grade na mão e errava pra mais ou pra menos);
 *  - saída {w, h, pontos}: o motor respeita a proporção do recorte em vez de supor um rosto;
 *  - prévia PNG dos pontos, pra conferir o sujeito ANTES de gastar render;
 *  - base suavizada (opcional): o busto termina em degradê, não num corte reto.
 *
 * Uso:
 *   node pontos.mjs <imagem> --out <pontos.json> [--alvo 5000] [--corte x,y,w,h] [--limiar 0.22]
 *                   [--faixa 0.5] [--inverter] [--suavizar-base 0.2] [--sem-previa]
 *   --corte     recorte em FRAÇÕES da imagem (0.1,0,0.8,0.85 = só a cabeça)
 *   --limiar    luminância mínima (0..1); abaixo vira fundo
 *   --inverter  sujeito escuro sobre fundo claro
 * Fundo claro ou texturizado: remova o fundo antes (PNG transparente); o script compõe sobre preto.
 * Sai 0 e imprime OUT=<json>. A prévia fica ao lado: <pontos>.previa.png.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const input = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const output = opt('--out');
if (!input || !output || input.startsWith('--')) {
  console.error('uso: node pontos.mjs <imagem> --out <pontos.json> [--alvo 5000] [--corte x,y,w,h] [--limiar 0.22] [--faixa 0.5] [--inverter] [--suavizar-base 0.2] [--sem-previa]');
  process.exit(2);
}
if (!fs.existsSync(input)) { console.error(`[pontos] imagem não encontrada: ${input}`); process.exit(2); }
const alvo = +opt('--alvo', '5000');
const corte = opt('--corte', '0,0,1,1').split(',').map(Number);
const limiar = +opt('--limiar', '0.22');
const faixa = +opt('--faixa', '0.5');
const inverter = args.includes('--inverter');
const suavizar = +opt('--suavizar-base', '0');

const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', input]).toString().trim().split('x').map(Number);
const cw = Math.round(w * corte[2]), chh = Math.round(h * corte[3]);
const crop = `crop=${cw}:${chh}:${Math.round(w * corte[0])}:${Math.round(h * corte[1])}`;

// amostra a imagem numa grade GW x GH (luminância 0..1 por célula)
const amostrar = (GW, GH) => {
  const raw = path.join(os.tmpdir(), `pontos-${process.pid}-${GW}.raw`);
  // compõe sobre preto (respeita transparência) → recorta → cinza → reduz pra grade (área média)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=black:s=${w}x${h}`, '-i', input, '-filter_complex', `[0][1]overlay=shortest=1,${crop},format=gray,scale=${GW}:${GH}:flags=area`, '-frames:v', '1', '-f', 'rawvideo', raw]);
  const px = fs.readFileSync(raw);
  fs.unlinkSync(raw);
  return px;
};
const valor = (px, i) => {
  let v = px[i] / 255;
  if (inverter) v = 1 - v;
  return (v - limiar) / faixa;
};

// 1ª passada: fração da imagem que é sujeito
const asp = chh / cw;
const G0 = 80;
const p0 = amostrar(G0, Math.max(1, Math.round(G0 * asp)));
let cheias = 0;
for (let i = 0; i < p0.length; i++) if (valor(p0, i) > 0.05) cheias++;
const fr = Math.max(0.02, cheias / p0.length);
// 2ª passada: grade que dá ~alvo pontos
const GW = Math.max(20, Math.min(240, Math.round(Math.sqrt(alvo / (fr * asp)))));
const GH = Math.max(20, Math.round(GW * asp));
const px = amostrar(GW, GH);
const pts = [];
for (let y = 0; y < GH; y++)
  for (let x = 0; x < GW; x++) {
    let n = valor(px, y * GW + x);
    if (suavizar > 0) n *= Math.min(1, (1 - y / GH) / suavizar);
    if (n > 0.05) pts.push([+((x + 0.5) / GW).toFixed(4), +((y + 0.5) / GH).toFixed(4), +Math.min(1, n).toFixed(2)]);
  }
fs.mkdirSync(path.dirname(path.resolve(output)), {recursive: true});
fs.writeFileSync(output, JSON.stringify({w: cw, h: chh, grade: [GW, GH], pontos: pts}));
console.log(`[pontos] ${pts.length} pontos (grade ${GW}x${GH}, ${Math.round(fr * 100)}% da imagem é sujeito)`);
if (fr > 0.8) console.warn('[pontos] AVISO: quase a imagem inteira virou ponto; o fundo entrou. Suba --limiar, use --corte ou remova o fundo.');
if (pts.length < 1500) console.warn('[pontos] AVISO: poucos pontos; o sujeito vai ficar ralo. Baixe --limiar ou suba --alvo.');

// prévia: os pontos desenhados como discos, do tamanho que o motor usa (raio pela intensidade)
if (!args.includes('--sem-previa')) {
  const S = 7;
  const PW = GW * S, PH = GH * S;
  const img = Buffer.alloc(PW * PH, 6);
  for (const [x, y, v] of pts) {
    const cx = x * PW, cy = y * PH, r = 0.6 + v * 2.4, lum = Math.round(60 + 195 * v);
    for (let yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++)
      for (let xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++)
        if (xx >= 0 && yy >= 0 && xx < PW && yy < PH && (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) img[yy * PW + xx] = lum;
  }
  const raw = path.join(os.tmpdir(), `previa-${process.pid}.raw`);
  fs.writeFileSync(raw, img);
  const prev = output.replace(/\.json$/i, '') + '.previa.png';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${PW}x${PH}`, '-i', raw, '-vf', `scale=${Math.min(PW, 720)}:-1`, prev]);
  fs.unlinkSync(raw);
  console.log(`[pontos] prévia: ${prev}`);
}
console.log(`OUT=${output}`);
