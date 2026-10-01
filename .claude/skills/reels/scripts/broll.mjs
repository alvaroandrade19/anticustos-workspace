#!/usr/bin/env node
/*
 * broll.mjs: B-roll de banco gratuito (Pexels, com Pixabay de reserva). Chaves grátis no .env da
 * raiz: PEXELS_API_KEY e/ou PIXABAY_API_KEY. Uso comercial liberado, mas os termos da API pedem crédito
 * (Pexels: "Vídeo de [autor] no Pexels"; Pixabay: indicar a origem). O crédito sai em <arquivo>.credito.json
 * e vai na legenda.md de todo reel que usar o vídeo.
 *
 * B-roll mostra AÇÃO ou LUGAR que a fala descreve (balcão, atendente no telefone, estoque), 3 a 5s,
 * entra na palavra-âncora e volta no silêncio. Nada de texto, logo ou tela legível de terceiros.
 * Todo vídeo baixado é revisado INTEIRO antes de entrar (subcomando revisar): 4 quadros não aprovam
 * movimento.
 *
 * Uso:
 *   node broll.mjs buscar "<consulta em inglês>" --out <pasta> [--n 8] [--fonte pexels|pixabay]
 *        → candidatos.json + candidatos.jpg (folha numerada pra escolher)
 *   node broll.mjs baixar <id> --out <arquivo.mp4> [--fonte pexels|pixabay]
 *        → o vídeo vertical na melhor resolução até 1080x1920 + <arquivo>.credito.json
 *   node broll.mjs revisar <arquivo.mp4>
 *        → <arquivo>.revisao.jpg: 10 quadros do vídeo inteiro, com o tempo de cada um
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// o filtro de texto do ffmpeg quebra com espaço no caminho ("Projeto Anticustos"): usa uma cópia da fonte no temp
const fonteRot = 'reels-anton.ttf'; // nome só: o ffmpeg com texto roda com cwd no temp (sem "C:" pra confundir o filtro)
const TMP = tmpdir();
if (!existsSync(path.join(TMP, fonteRot))) copyFileSync(path.resolve(__dirname, '..', 'assets', 'fonts', 'Anton-Regular.ttf'), path.join(TMP, fonteRot));
const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [cmd, alvo] = args;

// .env da raiz do projeto (sobe a partir do cwd e da pasta da skill)
const lerEnv = () => {
  const env = {};
  for (const ini of [process.cwd(), path.resolve(__dirname, '..', '..', '..', '..')]) {
    const p = path.join(ini, '.env');
    if (!existsSync(p)) continue;
    for (const l of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return {...env, ...process.env};
};
const env = lerEnv();
// marcador de passo a passo ("cole_aqui") ou valor curto demais não é chave: conta como ausente
// (chave real: Pexels ~56 caracteres, Pixabay ~34). Sem isso o script tentava o Pexels com o marcador.
const valida = (k) => Boolean(k) && k.length >= 20 && !/cole|aqui|sua_chave|seu_|xxx|<|>/i.test(k);
const KEYS = {pexels: valida(env.PEXELS_API_KEY) ? env.PEXELS_API_KEY : null, pixabay: valida(env.PIXABAY_API_KEY) ? env.PIXABAY_API_KEY : null};
let fonte = get('--fonte', KEYS.pexels ? 'pexels' : 'pixabay');
let chave = KEYS[fonte];
const exigirChave = () => {
  if (chave) return;
  const qual = get('--fonte') ? (fonte === 'pexels' ? 'PEXELS_API_KEY' : 'PIXABAY_API_KEY') : 'PEXELS_API_KEY (ou PIXABAY_API_KEY)';
  console.error(`[broll] falta ${qual} no .env da raiz.\n` +
    '  Pexels (grátis): https://www.pexels.com/api/ → "Get started" → copie a chave.\n' +
    '  Pixabay (grátis): https://pixabay.com/api/docs/ → logado, a chave aparece na própria página.');
  process.exit(6);
};

const pexels = async (u) => {
  const r = await fetch(u, {headers: {Authorization: chave}});
  if (!r.ok) throw new Error(`Pexels respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const pixabay = async (params) => {
  const r = await fetch(`https://pixabay.com/api/videos/?key=${chave}&${params}`);
  if (!r.ok) throw new Error(`Pixabay respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const baixarArquivo = async (u, dest) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`download ${r.status}`);
  writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
};

// normaliza os dois bancos no mesmo formato de candidato
const buscar = async (q, n) => {
  if (fonte === 'pexels') {
    const d = await pexels(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=portrait&size=medium&per_page=${n}`);
    return d.videos.map((v) => ({id: String(v.id), fonte, duracao: v.duration, w: v.width, h: v.height, autor: v.user?.name, pagina: v.url, thumb: v.image}));
  }
  const d = await pixabay(`q=${encodeURIComponent(q)}&per_page=${Math.max(3, n * 2)}&safesearch=true`);
  // a API de vídeo do Pixabay não filtra orientação: verticais primeiro, horizontais depois (viram corte central)
  const vertical = (h) => h.videos.medium.height >= h.videos.medium.width;
  return [...d.hits.filter(vertical), ...d.hits.filter((h) => !vertical(h))]
    .slice(0, n).map((h) => ({id: String(h.id), fonte, duracao: h.duration, w: h.videos.medium.width, h: h.videos.medium.height, autor: h.user, pagina: h.pageURL, thumb: h.videos.medium.thumbnail || `https://i.vimeocdn.com/video/${h.picture_id}_640x360.jpg`}));
};

try {
  if (cmd === 'buscar') {
    exigirChave();
    const outDir = get('--out', '.');
    const n = parseInt(get('--n', '8'), 10);
    mkdirSync(outDir, {recursive: true});
    let cands;
    try {
      cands = await buscar(alvo, n);
    } catch (e) {
      // Pexels recusou a chave (inválida, pausada, revogada) e há Pixabay: segue pelo Pixabay sem parar o trabalho
      if (fonte === 'pexels' && /respondeu (401|403)/.test(e.message) && KEYS.pixabay && !get('--fonte')) {
        console.log('[broll] Pexels recusou a chave; buscando no Pixabay.');
        fonte = 'pixabay';
        chave = KEYS.pixabay;
        cands = await buscar(alvo, n);
      } else throw e;
    }
    if (!cands.length) { console.log('[broll] nada encontrado; tente outra consulta (em inglês rende mais).'); process.exit(0); }
    // folha numerada de miniaturas
    const tmp = path.join(outDir, '_thumbs');
    mkdirSync(tmp, {recursive: true});
    let k = 0;
    for (const c of cands) {
      const t = path.join(tmp, `t${String(k).padStart(2, '0')}.jpg`);
      try {
        await baixarArquivo(c.thumb, t + '.src');
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.resolve(t + '.src'), '-vf', `scale=270:480:force_original_aspect_ratio=increase,crop=270:480,drawtext=fontfile=${fonteRot}:text='${k + 1}':x=10:y=10:fontsize=40:fontcolor=white:box=1:boxcolor=black@0.6`, path.resolve(t)], {cwd: TMP});
      } catch {
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=270x480', '-frames:v', '1', t]);
      }
      k++;
    }
    const cols = Math.min(4, cands.length);
    const rows = Math.ceil(cands.length / cols);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, 't%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=4`, '-frames:v', '1', path.join(outDir, 'candidatos.jpg')]);
    writeFileSync(path.join(outDir, 'candidatos.json'), JSON.stringify(cands, null, 2));
    cands.forEach((c, i) => console.log(`  ${i + 1}. id ${c.id} · ${c.duracao}s · ${c.w}x${c.h} · ${c.autor} · ${c.pagina}`));
    console.log(`OUT=${path.join(outDir, 'candidatos.jpg')}`);
  } else if (cmd === 'baixar') {
    exigirChave();
    const out = get('--out');
    if (!alvo || !out) throw new Error('uso: baixar <id> --out <arquivo.mp4>');
    let arquivos;
    let credito;
    if (fonte === 'pexels') {
      const v = await pexels(`https://api.pexels.com/videos/videos/${alvo}`);
      arquivos = v.video_files.filter((f) => f.file_type === 'video/mp4').map((f) => ({url: f.link, w: f.width, h: f.height}));
      credito = {fonte: 'Pexels', autor: v.user?.name, perfil: v.user?.url, pagina: v.url, licenca: 'Pexels License; termos da API pedem crédito', credito_legenda: `Vídeo de ${v.user?.name} no Pexels`};
    } else {
      const d = await pixabay(`id=${alvo}`);
      const h = d.hits[0];
      arquivos = Object.values(h.videos).filter((f) => f.url).map((f) => ({url: f.url, w: f.width, h: f.height}));
      credito = {fonte: 'Pixabay', autor: h.user, pagina: h.pageURL, licenca: 'Pixabay Content License; termos da API pedem indicar a origem', credito_legenda: `Vídeo de ${h.user} no Pixabay`};
    }
    // prefere vertical; entre os verticais, o menor que ainda cobre 1080 de largura (arquivo leve, nítido)
    const vert = arquivos.filter((f) => f.h >= f.w);
    const pool = vert.length ? vert : arquivos;
    const bons = pool.filter((f) => Math.min(f.w, f.h) >= 1080).sort((a, b) => a.w * a.h - b.w * b.h);
    const esc = bons[0] ?? pool.sort((a, b) => b.w * b.h - a.w * a.h)[0];
    mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
    const cru = out.replace(/\.mp4$/i, '.orig.mp4');
    await baixarArquivo(esc.url, cru);
    // padroniza: 1080x1920 cortado ao centro, 30 qps, sem áudio, H.264 com TODO quadro sendo chave (-g 1):
    // o render pede quadros fora de ordem em 3 abas; com GOP longo cada pedido decodificava desde o
    // último quadro-chave (medido: cena de vídeo 35% mais rápida assim; o arquivo fica ~7x maior, ok)
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', cru, '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-an', '-c:v', 'libx264', '-g', '1', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', out]);
    rmSync(cru, {force: true});
    writeFileSync(out.replace(/\.mp4$/i, '.credito.json'), JSON.stringify({...credito, id: alvo, original: `${esc.w}x${esc.h}`}, null, 2));
    console.log(`[broll] ${out} (de ${esc.w}x${esc.h}) · ${credito.autor} · ${credito.fonte}${vert.length ? '' : ' · AVISO: não havia versão vertical, foi cortado de horizontal'}`);
    console.log(`OUT=${out}`);
  } else if (cmd === 'revisar') {
    if (!alvo) throw new Error('uso: revisar <arquivo.mp4>');
    const d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', alvo], {encoding: 'utf8'}));
    const out = alvo.replace(/\.mp4$/i, '.revisao.jpg');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.resolve(alvo), '-vf', `fps=${(10 / d).toFixed(4)},scale=216:384,drawtext=fontfile=${fonteRot}:text='%{pts\\:hms}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=5x2:padding=4`, '-frames:v', '1', path.resolve(out)], {cwd: TMP});
    console.log(`[broll] ${d.toFixed(1)}s. Revise: mão ou corpo deformado, texto/logo/tela legível, rosto que não devia, ação que não cabe na janela.`);
    console.log(`OUT=${out}`);
  } else {
    console.error('uso: node broll.mjs buscar "<consulta>" --out <pasta> | baixar <id> --out <mp4> | revisar <mp4>');
    process.exit(2);
  }
} catch (e) {
  console.error(`[broll] falhou: ${e.message}`);
  process.exit(1);
}
