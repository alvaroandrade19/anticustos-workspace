#!/usr/bin/env node
/*
 * logo.mjs: baixa o logo oficial de uma marca citada (Simple Icons, SVG de uma cor, CC0 no desenho;
 * a marca continua sendo de quem é, uso nominativo: citar a ferramenta de que a fala trata).
 * "Marca citada pede o logo real, não um símbolo": Claude é o logo do Claude, não a esfera.
 *
 * Uso: node logo.mjs <slug> --out <arquivo.svg> [--cor #F2F4F8 | --cor marca]
 *   slug = nome no simpleicons.org (claude, whatsapp, openai, googlesheets, notion...)
 *   --cor marca usa a cor oficial; o padrão é o texto do tema anticustos (#F2F4F8).
 */
import {writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const slug = args[0];
const out = get('--out');
const cor = get('--cor', '#F2F4F8');
if (!slug || !out) { console.error('uso: node logo.mjs <slug> --out <arquivo.svg> [--cor #hex|marca]'); process.exit(2); }

const base = 'https://cdn.jsdelivr.net/npm/simple-icons@latest';
const r = await fetch(`${base}/icons/${slug}.svg`);
if (!r.ok) { console.error(`[logo] "${slug}" não existe no Simple Icons (procure o slug em simpleicons.org).`); process.exit(3); }
let svg = await r.text();
let hex = cor;
if (cor === 'marca') {
  // o índice de dados mudou de caminho entre versões; tenta os dois
  for (const p of ['/data/simple-icons.json', '/_data/simple-icons.json']) {
    try {
      const d = await (await fetch(base + p)).json();
      const lista = Array.isArray(d) ? d : d.icons;
      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const it = lista.find((x) => (x.slug ?? norm(x.title)) === slug);
      if (it?.hex) { hex = `#${it.hex}`; break; }
    } catch {}
  }
  if (hex === 'marca') hex = '#F2F4F8';
}
svg = svg.replace('<svg ', `<svg fill="${hex}" `);
mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
writeFileSync(out, svg);
console.log(`[logo] ${out} (${slug}, ${hex})`);
console.log(`OUT=${out}`);
