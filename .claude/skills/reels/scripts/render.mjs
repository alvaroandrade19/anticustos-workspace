#!/usr/bin/env node
/*
 * render.mjs: orquestrador do render em Remotion da skill reels (v2).
 *
 * Fluxo: lê o plano → resolve e valida (plano.mjs, erros barram) → copia pro motor tudo que o plano
 * cita (voz, trilha, sons, imagens de prova, logos, B-roll) → renderiza → normaliza o volume →
 * roda o QA (qa.mjs). Com --prancha, em vez do vídeo, gera folhas de contato (início, meio e fim de
 * cada cena) em segundos, pra aprovar a composição antes de gastar o render inteiro.
 *
 * Armadilhas do Windows já resolvidas (não regredir):
 *  - espaço no caminho do projeto quebra o Chromium ("Multiple targets are not supported")
 *      -> o motor mora numa pasta SEM ESPAÇO e o MP4 é copiado de volta pro projeto.
 *  - --props com JSON inline quebra no shell do Windows -> sempre um ARQUIVO ./props.json relativo.
 *  - download de 150-300MB do Chrome Headless Shell evitado com --browser-executable <Edge/Chrome>.
 *  - motor PERSISTENTE (instala uma vez; o rm de pasta temporária falhava em silêncio e deixava 390MB).
 *
 * Uso:
 *   node render.mjs --props <plano.json> --out <final.mp4> [--forcar] [--sem-qa] [--sem-cache]
 *   node render.mjs --props <plano.json> --prancha <pasta ou prefixo .jpg>
 *   node render.mjs --props <plano.json> --validar
 *   node render.mjs --limpar
 * Sai 0 no sucesso (imprime OUT=<caminho>), 3 se o plano reprovar, 1 em falha do render.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, cpSync, copyFileSync, rmSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir, homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {lerPlano, resolverPlano, imprimirLaudo, achar} from './plano.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const propsPath = getArg('--props');
const outPath = getArg('--out');
const pranchaOut = getArg('--prancha');
const assetsDir = getArg('--assets') || path.resolve(__dirname, '..', 'assets');
const log = (m) => console.log(`[reels] ${m}`);
const win = process.platform === 'win32';

// Self-heal do PATH: shell aberto antes do ffmpeg entrar no PATH (winget, 14/09/2026).
if (win) {
  try {
    execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
  } catch {
    const fallbackDir = 'C:\\Users\\aandr\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin';
    if (existsSync(path.join(fallbackDir, 'ffmpeg.exe'))) {
      process.env.PATH = `${fallbackDir};${process.env.PATH}`;
      log('ffmpeg não estava no PATH deste shell; usando a instalação do winget.');
    }
  }
}

// --- 0. onde o motor mora: pasta fixa, sem espaço no caminho ---
const semEspaco = (p) => Boolean(p) && !p.includes(' ');
const candidatos = win
  ? [process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'reel-engine'), 'C:\\reel-engine']
  : [path.join(homedir(), '.cache', 'reel-engine'), '/tmp/reel-engine'];
const engine = candidatos.filter(Boolean).find(semEspaco) || path.join(tmpdir(), 'reel-engine');

if (args.includes('--limpar')) {
  rmSync(engine, {recursive: true, force: true});
  log(`motor apagado: ${engine}`);
  process.exit(0);
}
if (!propsPath || (!outPath && !pranchaOut && !args.includes('--validar'))) {
  console.error('uso: node render.mjs --props <plano.json> (--out <final.mp4> | --prancha <saida> | --validar)');
  process.exit(2);
}

const browserCandidates = win
  ? [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]
  : process.platform === 'darwin'
  ? ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
  : ['/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const browser = browserCandidates.find((p) => existsSync(p));

const medir = (arq, entradas) =>
  execFileSync('ffprobe', ['-v', 'error', ...entradas, '-of', 'default=noprint_wrappers=1:nokey=1', arq], {encoding: 'utf8'}).trim();

// ---------------------------------------------------------------------------
// 1. plano: resolve e valida ANTES de mexer no motor (erro de plano não gasta instalação nem render)
// ---------------------------------------------------------------------------
let props;
let plan;
let base;
try {
  const lido = lerPlano(propsPath);
  plan = lido.plan;
  base = lido.base;
  const r = resolverPlano(plan, lido.words);
  imprimirLaudo(r);
  if (args.includes('--validar')) process.exit(r.erros.length ? 3 : 0);
  if (r.erros.length && !args.includes('--forcar')) {
    console.error('[reels] plano reprovado: corrija os ERROS acima (ou --forcar, se for consciente).');
    process.exit(3);
  }
  props = r.props;
} catch (e) {
  console.error(`[reels] não consegui ler o plano: ${e.message}`);
  process.exit(3);
}

const saidaTemp = path.join('out', `reel-${Date.now()}.mp4`);

try {
  // --- 2. sincronizar motor e fonte na pasta fixa ---
  mkdirSync(engine, {recursive: true});
  for (const n of readdirSync(tmpdir())) if (/^reel-\d{13}$/.test(n)) rmSync(path.join(tmpdir(), n), {recursive: true, force: true});
  cpSync(path.join(assetsDir, 'remotion'), engine, {recursive: true});
  copyFileSync(path.join(__dirname, 'prancha-runner.mjs'), path.join(engine, 'prancha-runner.mjs'));
  copyFileSync(path.join(__dirname, 'render-runner.mjs'), path.join(engine, 'render-runner.mjs'));
  const pub = path.join(engine, 'public');
  rmSync(path.join(pub, 'a'), {recursive: true, force: true}); // arquivos do plano anterior
  mkdirSync(path.join(pub, 'a'), {recursive: true});
  copyFileSync(path.join(assetsDir, 'fonts', 'Anton-Regular.ttf'), path.join(pub, 'Anton-Regular.ttf'));

  // copia um arquivo citado no plano pra public/a/ e devolve o caminho relativo a public/
  let seq = 0;
  const publicar = (p, rotulo) => {
    const abs = achar(p, base);
    if (!abs) throw new Error(`${rotulo}: arquivo "${p}" não encontrado (tentei relativo à raiz do projeto e à pasta do plano)`);
    const nome = `a/${String(seq++).padStart(3, '0')}${path.extname(abs).toLowerCase() || '.bin'}`;
    copyFileSync(abs, path.join(pub, nome));
    return {nome, abs};
  };

  // --- 2b. voz: falha alto se sumir (reel narrado mudo é pior que render falho) ---
  if (plan.audio) {
    const {nome, abs} = publicar(plan.audio.trim(), 'áudio (plano.audio)');
    props.audioSrc = nome;
    try {
      const s = parseFloat(medir(abs, ['-show_entries', 'format=duration']));
      log(`voz: ${s.toFixed(1)}s. O vídeo vai durar isso (+0,4s de cauda).`);
    } catch {}
  } else if (props.modo === 'audio') {
    throw new Error('o plano tem "words" mas não tem "audio"');
  }
  // trilha: vídeo sem voz sai MUDO pela API (ela não acessa a biblioteca de músicas do Instagram)
  if (plan.trilha) props.trilhaSrc = publicar(plan.trilha, 'trilha').nome;
  else if (!plan.audio) log('AVISO: sem voz e sem trilha. Agendado pela API, este reel vai ao ar MUDO. Defina "trilha" no plano.');

  // sons: biblioteca do plano (sfxDir), senão os sintetizados da skill
  const dirSfx = (plan.sfxDir && achar(plan.sfxDir, base)) || path.join(assetsDir, 'sfx');
  props.sfx = (props.sfx ?? []).flatMap((s) => {
    const arq = path.join(dirSfx, s.arquivo);
    if (!existsSync(arq)) { log(`som "${s.arquivo}" não existe em ${dirSfx}; evento pulado`); return []; }
    return [{src: publicar(arq, 'som').nome, from: s.from, gainDb: s.gainDb}];
  });

  // imagens de prova, logos e B-roll
  props.cenas = props.cenas.map((c, i) => {
    const arq = c.imagem ?? c.arquivo;
    if (!arq || !['prova', 'logo', 'video', 'animacao'].includes(c.visual)) return c;
    if (c.visual === 'animacao' && /\.lottie$/i.test(arq)) throw new Error(`cena ${i + 1}: .lottie precisa passar por "node scripts/lottie.mjs preparar" (vira .json recolorido)`);
    const {nome, abs} = publicar(arq, `cena ${i + 1}`);
    const out = {...c, src: nome};
    if (c.visual === 'animacao') {
      // metadados que o componente precisa pra tocar na velocidade real e no tamanho certo
      const a = JSON.parse(readFileSync(abs, 'utf8'));
      Object.assign(out, {lfr: a.fr || 30, lip: a.ip ?? 0, lop: a.op ?? 60, lw: a.w || 512, lh: a.h || 512, lbbox: a._reels?.bbox});
      if (!a._reels?.bbox) log(`cena ${i + 1}: animação sem medida de enquadramento (rode lottie.mjs revisar nela); vai pela margem do arquivo`);
    }
    if (c.visual === 'prova' && !(c.iw && c.ih)) {
      const [w, h] = medir(abs, ['-select_streams', 'v:0', '-show_entries', 'stream=width,height']).split(/\s+/).map(Number);
      out.iw = w;
      out.ih = h;
    }
    return out;
  });

  writeFileSync(path.join(engine, 'props.json'), JSON.stringify(props));

  // --- 3. instalar só quando precisa ---
  const q = (s) => (win && s.includes(' ') ? `"${s}"` : s);
  const assinatura = createHash('sha1').update(readFileSync(path.join(engine, 'package.json'))).digest('hex');
  const marca = path.join(engine, '.instalado');
  const jaInstalado = existsSync(path.join(engine, 'node_modules', 'remotion')) && existsSync(marca) && readFileSync(marca, 'utf8').trim() === assinatura;
  if (jaInstalado) log('motor já instalado.');
  else {
    log('instalando as ferramentas de vídeo (só na primeira vez, pode levar 1-2 min)...');
    execFileSync(win ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund', '--silent'], {cwd: engine, stdio: 'inherit', shell: win});
    writeFileSync(marca, assinatura, 'utf8');
  }

  // --- 3b. prancha: stills de cada cena, sem renderizar o vídeo ---
  if (pranchaOut) {
    const destino = path.resolve(pranchaOut.endsWith('.jpg') ? path.dirname(pranchaOut) : pranchaOut);
    mkdirSync(destino, {recursive: true});
    const pref = pranchaOut.endsWith('.jpg') ? path.basename(pranchaOut, '.jpg') : 'prancha';
    execFileSync(process.execPath, ['prancha-runner.mjs', '--dest', path.join(engine, 'out', 'prancha'), ...(browser ? ['--browser', browser] : [])], {cwd: engine, stdio: 'inherit'});
    const dirP = path.join(engine, 'out', 'prancha');
    const folhas = readdirSync(dirP).filter((n) => /^folha-\d+\.jpg$/.test(n)).sort();
    for (const f of folhas) copyFileSync(path.join(dirP, f), path.join(destino, `${pref}-${f.replace('folha-', '')}`));
    log(`prancha: ${folhas.length} folha(s) em ${destino} (cada linha = 2 cenas: início, meio, fim)`);
    console.log(`OUT=${destino}`);
    process.exit(0);
  }

  // --- 4. renderizar: incremental por cena (render-runner.mjs); o CLI inteiro fica de reserva ---
  const {cpus} = await import('node:os');
  const conc = Math.max(1, Math.min(cpus().length - 1, 6)); // núcleos menos 1 (medido: 4 núcleos → 3)
  log(`renderizando ${(props.totalFrames / 30).toFixed(1)}s de vídeo (só as cenas que mudaram desde o último render)...`);
  try {
    execFileSync(process.execPath, ['render-runner.mjs', '--out', saidaTemp, '--conc', String(conc), ...(browser ? ['--browser', browser] : []), ...(args.includes('--sem-cache') ? ['--sem-cache'] : [])], {cwd: engine, stdio: 'inherit'});
  } catch (e) {
    log(`render incremental falhou (${e.message.split(/\r?\n/)[0]}); refazendo pelo caminho inteiro.`);
    const renderArgs = ['remotion', 'render', 'src/index.ts', 'reel', saidaTemp, '--props=./props.json', '--crf=17', `--concurrency=${conc}`];
    if (browser) renderArgs.push(`--browser-executable=${q(browser)}`);
    execFileSync(win ? 'npx.cmd' : 'npx', renderArgs, {cwd: engine, stdio: 'inherit', shell: win});
  }

  // --- 5. volume: normaliza a -14 LUFS / pico -1,5 dBTP em duas passadas (vídeo copiado, sem reencode) ---
  const bruto = path.join(engine, saidaTemp);
  let final = bruto;
  if (props.audioSrc || props.trilhaSrc) {
    // passada 1 mede (o JSON do loudnorm sai no stderr), passada 2 aplica linear
    const m = spawnSync('ffmpeg', ['-hide_banner', '-i', bruto, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {encoding: 'utf8'});
    const js = (m.stderr || '').match(/\{[\s\S]*?"target_offset"[\s\S]*?\}/);
    if (js) {
      const d = JSON.parse(js[0]);
      const normal = bruto.replace(/\.mp4$/, '-norm.mp4');
      const f2 = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${d.input_i}:measured_TP=${d.input_tp}:measured_LRA=${d.input_lra}:measured_thresh=${d.input_thresh}:offset=${d.target_offset}:linear=true`;
      execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', bruto, '-c:v', 'copy', '-af', f2, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', normal]);
      final = normal;
      log(`volume normalizado: ${d.input_i} LUFS → -14 LUFS (pico alvo -1,5 dBTP).`);
    } else log('não consegui medir o volume; segue sem normalizar.');
  }

  // --- 6. copiar de volta e QA ---
  mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true});
  copyFileSync(final, outPath);
  writeFileSync(outPath.replace(/\.mp4$/i, '.resolvido.json'), JSON.stringify(props, null, 2));
  log(`pronto: ${outPath}`);
  if (!args.includes('--sem-qa')) {
    try {
      execFileSync(process.execPath, [path.join(__dirname, 'qa.mjs'), '--video', outPath, '--frames', String(props.totalFrames), ...(props.audioSrc || props.trilhaSrc ? ['--com-audio'] : [])], {stdio: 'inherit'});
    } catch {
      log('QA apontou problema (ver acima). O vídeo foi gerado, mas não entregue sem resolver.');
      console.log(`OUT=${outPath}`);
      process.exit(4);
    }
  }
  console.log(`OUT=${outPath}`);
} catch (err) {
  console.error(`[reels] falhou no Remotion: ${err.message}`);
  process.exit(1);
} finally {
  try {
    for (const n of readdirSync(path.join(engine, 'out'))) if (/^reel-\d+(-norm)?\.mp4$/.test(n)) rmSync(path.join(engine, 'out', n), {force: true});
  } catch {}
}
