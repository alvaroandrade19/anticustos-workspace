#!/usr/bin/env node
/*
 * render.mjs — orquestrador do render em Remotion da skill reels.
 *
 * Por que existe: o caminho do render é o mesmo toda vez. A skill só gera o PLANO DE CENAS
 * (props.json); daqui pra frente é sempre igual, então vira script.
 *
 * Ele resolve as armadilhas já verificadas no Windows:
 *  - espaço no caminho do projeto quebra o Chromium ("Multiple targets are not supported")
 *      -> o motor mora numa pasta SEM ESPAÇO e o MP4 é copiado de volta pro projeto.
 *  - --props com JSON inline quebra no shell do Windows -> sempre um ARQUIVO ./props.json relativo.
 *  - download de 150-300MB do Chrome Headless Shell evitado com --browser-executable <Edge/Chrome>.
 *
 * O motor é PERSISTENTE. Antes, cada render criava uma pasta temporária nova, reinstalava o
 * Remotion inteiro (~390MB) e tentava apagar tudo no fim. No Windows esse rm falhava em silêncio
 * (o Chromium e o esbuild seguram arquivo aberto), então cada vídeo deixava 390MB pra trás.
 * Agora instala uma vez, reaproveita sempre, e só reinstala se o package.json mudar.
 *
 * Uso:
 *   node render.mjs --props "<plano.json>" --out "<final.mp4>" [--assets "<pasta assets>"]
 *   node render.mjs --limpar     apaga o motor instalado (libera disco; o próximo render reinstala)
 * Sai 0 no sucesso (imprime OUT=<caminho>), diferente de 0 na falha, pra skill cair no ffmpeg.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, cpSync, copyFileSync, rmSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir, homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const propsPath = getArg('--props');
const outPath = getArg('--out');
const assetsDir = getArg('--assets') || path.resolve(__dirname, '..', 'assets');
const log = (m) => console.log(`[reels] ${m}`);

const win = process.platform === 'win32';

// Self-heal do PATH: um shell aberto antes do ffmpeg entrar no PATH (winget, 14/09/2026) não acha
// nem ffmpeg nem ffprobe, e o ffprobe (usado pra medir a duração do áudio) falhava em silêncio.
// Se 'ffmpeg' não responde, tenta o caminho conhecido do winget e prepende ao PATH deste processo
// — cobre o ffprobe abaixo e qualquer coisa que o Remotion chame internamente.
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

if (!propsPath || !outPath) {
  console.error('uso: node render.mjs --props <plano.json> --out <final.mp4>');
  process.exit(2);
}

// Sobras das versões antigas do script (reel-<timestamp>), que ficavam com 390MB cada.
const varrerSobrasAntigas = () => {
  for (const base of [tmpdir(), win ? 'C:\\' : '/tmp']) {
    let nomes = [];
    try {
      nomes = readdirSync(base);
    } catch {
      continue;
    }
    for (const nome of nomes) {
      if (!/^reel-\d{13}$/.test(nome)) continue;
      try {
        rmSync(path.join(base, nome), {recursive: true, force: true});
        log(`limpei sobra de render antigo: ${path.join(base, nome)}`);
      } catch {}
    }
  }
};

// --- 1. procurar um navegador do sistema pra não baixar o headless shell ---
const browserCandidates = win
  ? [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]
  : process.platform === 'darwin'
  ? [
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ]
  : ['/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const browser = browserCandidates.find((p) => existsSync(p));

const saidaTemp = path.join('out', `reel-${Date.now()}.mp4`);

try {
  // --- 2. sincronizar motor, fonte e plano na pasta fixa ---
  mkdirSync(engine, {recursive: true});
  varrerSobrasAntigas();
  cpSync(path.join(assetsDir, 'remotion'), engine, {recursive: true});
  const pub = path.join(engine, 'public');
  mkdirSync(pub, {recursive: true});
  copyFileSync(path.join(assetsDir, 'fonts', 'Anton-Regular.ttf'), path.join(pub, 'Anton-Regular.ttf'));
  copyFileSync(propsPath, path.join(engine, 'props.json'));

  // sanidade: o plano precisa abrir e ter cenas
  const plan = JSON.parse(readFileSync(path.join(engine, 'props.json'), 'utf8'));
  if (!plan.scenes || !plan.scenes.length) throw new Error('props.json sem cenas');

  // --- 2b. áudio de fundo opcional: copia pra public/, mede a duração com ffprobe ---
  // `plan.audio` pode vir escrito de duas formas (a agente já fez as duas): relativo à raiz do
  // projeto (convenção do resto do workspace) ou relativo à pasta do próprio props.json. Tenta
  // as duas antes de desistir — resolver só de um jeito causou um vídeo publicado sem áudio
  // (o caminho virou uma pasta duplicada que não existe, e o erro ficou só numa linha de log).
  if (plan.audio) {
    const candidatos = plan.audio.trim();
    const tentativas = path.isAbsolute(candidatos)
      ? [candidatos]
      : [path.resolve(process.cwd(), candidatos), path.resolve(path.dirname(propsPath), candidatos)];
    const audioAbs = tentativas.find((p) => existsSync(p));
    if (audioAbs) {
      const ext = path.extname(audioAbs) || '.mp3';
      copyFileSync(audioAbs, path.join(pub, `voz${ext}`));
      plan.audioSrc = `voz${ext}`;
      try {
        const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioAbs], {encoding: 'utf8'}).trim();
        const secs = parseFloat(out);
        if (secs > 0) plan.audioDurationInFrames = Math.ceil(secs * 30);
        log(`áudio de fundo: ${secs.toFixed(1)}s, o vídeo vai durar isso.`);
      } catch {
        log('não consegui medir a duração do áudio (falta ffprobe); usando a duração das cenas.');
      }
      delete plan.audio;
      writeFileSync(path.join(engine, 'props.json'), JSON.stringify(plan));
    } else {
      // Falha alto e sai (em vez de seguir sem som): um reel narrado que sai mudo é pior que
      // um render que falha e aponta o caminho errado.
      throw new Error(`áudio pedido em plano.audio ("${plan.audio}") não encontrado. Tentei:\n  ` + tentativas.join('\n  '));
    }
  }

  // No Windows com Node 20+, rodar .cmd exige shell:true; sob shell, argumento com espaço vai entre aspas.
  const q = (s) => (win && s.includes(' ') ? `"${s}"` : s);

  // --- 3. instalar só quando precisa (primeira vez, ou package.json mudou) ---
  const assinatura = createHash('sha1').update(readFileSync(path.join(engine, 'package.json'))).digest('hex');
  const marca = path.join(engine, '.instalado');
  const jaInstalado =
    existsSync(path.join(engine, 'node_modules', 'remotion')) &&
    existsSync(marca) &&
    readFileSync(marca, 'utf8').trim() === assinatura;

  if (jaInstalado) {
    log('motor já instalado, indo direto pro render.');
  } else {
    log('instalando as ferramentas de vídeo (só na primeira vez, pode levar 1-2 min)...');
    execFileSync(win ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund', '--silent'], {
      cwd: engine,
      stdio: 'inherit',
      shell: win,
    });
    writeFileSync(marca, assinatura, 'utf8');
  }

  // --- 4. renderizar ---
  log('renderizando o vídeo...');
  const renderArgs = ['remotion', 'render', 'src/index.ts', 'reel', saidaTemp, '--props=./props.json'];
  if (browser) {
    renderArgs.push(`--browser-executable=${q(browser)}`);
    log(`usando navegador do sistema: ${path.basename(browser)}`);
  } else {
    log('navegador do sistema não encontrado; o Remotion vai baixar o dele (uma vez).');
  }
  execFileSync(win ? 'npx.cmd' : 'npx', renderArgs, {cwd: engine, stdio: 'inherit', shell: win});

  // --- 5. copiar o MP4 de volta pro caminho real (onde espaço é permitido) ---
  mkdirSync(path.dirname(outPath), {recursive: true});
  copyFileSync(path.join(engine, saidaTemp), outPath);
  log(`pronto: ${outPath}`);
  console.log(`OUT=${outPath}`);
} catch (err) {
  console.error(`[reels] falhou no Remotion: ${err.message}`);
  process.exit(1);
} finally {
  // O motor fica. Só o MP4 intermediário sai, pra pasta out/ não crescer sem limite.
  try {
    rmSync(path.join(engine, saidaTemp), {force: true});
  } catch {}
}
