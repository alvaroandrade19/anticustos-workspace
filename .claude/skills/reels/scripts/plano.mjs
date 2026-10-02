#!/usr/bin/env node
/*
 * plano.mjs: resolve e valida o plano de cenas (v2). É aqui que mora a sincronia e a direção.
 *
 * Entra o plano que a skill escreve (cenas com `ancora` na fala) + o transcript palavra a palavra.
 * Sai o plano RESOLVIDO que o motor desenha: cada cena com `from`/`dur` em quadros, os blocos de
 * legenda, os eventos de som e o total. E sai um laudo: erros barram o render, avisos não.
 *
 * Por que é script e não julgamento: sincronia e regra de direção são verificáveis. Tudo que dá pra
 * medir é medido aqui, pra ninguém "achar" que ficou em cima da palavra.
 *
 * Uso (CLI):
 *   node plano.mjs --props <plano.json>                 laudo (valida sem renderizar)
 *   node plano.mjs --props <plano.json> --saida <x.json> grava o plano resolvido
 *   node plano.mjs --rascunho --words <words.json>      transcript numerado com pausas, pra escrever as âncoras
 * Como módulo: import {resolverPlano, lerPlano} from './plano.mjs'
 */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const FPS = 30;
const PRE = 8; // espelha Reel.tsx: o visual roda 8 quadros antes do corte

// ---------------------------------------------------------------------------
// Registros: o TIPO de cena. Duas cenas vizinhas do mesmo registro leem como uma cena só,
// por mais que o objeto mude (foi o defeito do reel imposto-de-prateleira: 20 ícones seguidos).
// ---------------------------------------------------------------------------
export const REGISTRO = {
  tipografica: 'tipografica',
  counter: 'dado', faixa: 'dado', barras: 'dado', chart: 'dado',
  prova: 'prova', logo: 'prova',
  code: 'tela', device: 'tela', typing: 'tela',
  pipeline: 'processo', gears: 'processo', funnel: 'processo', checklist: 'processo',
  icon: 'icone', svg: 'icone',
  video: 'video',
  animacao: 'animacao',
  mundo: 'pontos',
  orb: 'marca', hero3d: 'marca',
  grid: 'atmosfera', crowd: 'atmosfera', particles: 'atmosfera', figures: 'atmosfera', network: 'atmosfera',
  wireframe: 'atmosfera', constellation: 'atmosfera', orbit: 'atmosfera', ripple: 'atmosfera', radar: 'atmosfera',
  brain: 'atmosfera', burst: 'atmosfera', waveform: 'atmosfera', globe: 'atmosfera',
};
const registroDe = (v) => REGISTRO[v] ?? 'objeto'; // heróis de objeto real (rocket, key, coins...) e `object`

// catálogo de objetos prontos (visual:"object"): nome errado caía numa esfera genérica sem avisar
const OBJETOS = (() => {
  try {
    const src = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'remotion', 'src', 'objetos.ts'), 'utf8');
    return new Set([...src.matchAll(/"([a-z-]+)":\s*\{/g)].map((m) => m[1]));
  } catch { return null; }
})();

const VISUAIS_TEMPLATE = new Set(['mundo', 'animacao', 'tipografica', 'counter', 'faixa', 'barras', 'chart', 'prova', 'logo', 'video', 'code', 'device', 'icon', 'svg']);
const TRANS = new Set(['fundir', 'corte', 'flash', 'push']);
const FUNCOES = new Set(['gancho', 'contexto', 'desenvolvimento', 'evolucao', 'resolucao', 'sintese']); // arco narrativo (registros.md)

// palavras que não podem fechar um bloco de legenda (artigo, preposição, conjunção, verbo de ligação solto)
const FUNCAO = new Set('a o as os um uma uns umas de da do das dos em na no nas nos num numa por pra pro pras pros para com sem e ou mas que se ao aos à às é são sua seu suas seus meu minha tua teu nem já muito mais menos tão como quando onde'.split(' '));

export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9%]+/g, '');

// ---------------------------------------------------------------------------
// Transcript: aplica as correções do plano. Nunca parafraseia: só conserta o que o Whisper ouviu errado.
// correcoes: [{de, ate?, texto}] troca as palavras de..ate (índices do words.json) por `texto`,
// mantendo o tempo do trecho; texto "" remove.
// ---------------------------------------------------------------------------
export const aplicarCorrecoes = (words, correcoes = []) => {
  const out = words.map((w, i) => ({texto: w.word, start: w.start, end: w.end, idx: i}));
  const ordenadas = [...correcoes].sort((a, b) => b.de - a.de); // de trás pra frente, índices estáveis
  for (const c of ordenadas) {
    const ate = c.ate ?? c.de;
    if (c.de < 0 || ate >= out.length || ate < c.de) throw new Error(`correção fora do transcript: ${JSON.stringify(c)}`);
    const trecho = out.slice(c.de, ate + 1);
    const novo = {texto: c.texto, start: trecho[0].start, end: trecho[trecho.length - 1].end, idx: trecho[0].idx};
    out.splice(c.de, ate - c.de + 1, ...(c.texto ? [novo] : []));
  }
  return out;
};

// acha a frase `alvo` (uma ou mais palavras) a partir do índice `desde`. "texto#2" = 2ª ocorrência.
const acharFrase = (ws, alvo, desde = 0) => {
  let [frase, n] = String(alvo).split('#');
  n = parseInt(n || '1', 10);
  const toks = frase.trim().split(/\s+/).map(norm).filter(Boolean);
  if (!toks.length) return -1;
  let achadas = 0;
  for (let i = desde; i <= ws.length - toks.length; i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) {
      if (norm(ws[i + k].texto) !== toks[k]) { ok = false; break; }
    }
    if (ok && ++achadas === n) return i;
  }
  return -1;
};

// corte no silêncio antes da palavra: no meio da pausa, no máximo 4 quadros antes do início dela
const quadroDoCorte = (ws, i) => {
  const t = ws[i].start;
  const antes = i > 0 ? ws[i - 1].end : 0;
  const folga = Math.max(0, Math.min((t - antes) / 2, 4 / FPS));
  return Math.max(0, Math.round((t - folga) * FPS));
};

// ---------------------------------------------------------------------------
// Legenda: blocos de 1 a 3 palavras, uma unidade de sentido, corte seco na palavra.
// Quebra em pontuação, pausa >= 0,25s, corte de cena e antes/depois da palavra de ênfase.
// Nunca fecha em palavra de função (o reel antigo fechava em "MAS O RESUMO" e o "DELA" ia pro seguinte).
// ---------------------------------------------------------------------------
const MAX_PAL = 3;
const MAX_CHARS = 17; // ~uma linha de Anton a 84px dentro da área segura (840px)
const limparExibicao = (t) => t.replace(/[.,;:…"“”]+$/g, '').replace(/^["“”]+/, '');

export const montarLegendas = (ws, {cortes = new Set(), enfase = [], silencios = [], fimTotal}) => {
  const enf = new Set(enfase.map(norm));
  const blocos = [];
  let cur = [];
  const fecha = () => { if (cur.length) blocos.push(cur); cur = []; };
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    const ehEnf = enf.has(norm(w.texto));
    if (cortes.has(i) || ehEnf) fecha();
    cur.push({...w, i});
    if (ehEnf) { fecha(); continue; }
    const prox = ws[i + 1];
    if (!prox) break;
    const pausa = prox.start - w.end;
    const pont = /[.,;:!?…]$/.test(w.texto);
    const chars = cur.map((x) => limparExibicao(x.texto)).join(' ').length + 1 + limparExibicao(prox.texto).length;
    const forcado = cortes.has(i + 1) || enf.has(norm(prox.texto));
    const quer = pont || pausa >= 0.25 || cur.length >= MAX_PAL || chars > MAX_CHARS;
    if (forcado) { fecha(); continue; }
    if (!quer) continue;
    // não fechar em palavra de função: devolve as palavras de função do fim pro bloco seguinte
    // ("O DINHEIRO É O" vira "O DINHEIRO" + "É O MENOR..."). Se o bloco inteiro for função, estica.
    const ehFuncao = (x) => FUNCAO.has(norm(x.texto)) && !/[.,;:!?…]$/.test(x.texto);
    let k = cur.length;
    while (k > 0 && ehFuncao(cur[k - 1])) k--;
    if (k === cur.length) fecha();
    // só devolve se o que fica ainda dura o bastante pra ler (0,3s); senão o bloco estica
    else if (k > 0 && pausa < 0.25 && cur[k - 1].end - cur[0].start >= 0.3) { const resto = cur.slice(k); cur = cur.slice(0, k); fecha(); cur = resto; }
    else if (cur.length >= MAX_PAL + 2) fecha();
  }
  fecha();
  // tempo: entra na 1ª palavra (seco); sai no início do próximo bloco, ou 0,35s depois da última palavra
  const res = blocos.map((b, k) => {
    const from = Math.round(b[0].start * FPS);
    const prox = blocos[k + 1];
    const limite = prox ? Math.round(prox[0].start * FPS) : fimTotal;
    let to = Math.min(limite, Math.round((b[b.length - 1].end + 0.35) * FPS));
    if (to - from < 6) to = Math.min(limite, from + 6);
    const texto = b.map((x) => limparExibicao(x.texto)).join(' ').replace(/\s+%/g, '%').toUpperCase();
    return {texto, from, to, enfase: b.length === 1 && enf.has(norm(b[0].texto)), primeiro: b[0].i};
  });
  // a legenda cala nas janelas de silêncio pedidas (cenas tipográficas / legenda:false)
  return res.filter((b) => !silencios.some(([a, z]) => b.from >= a && b.from < z)).map((b) => {
    const s = silencios.find(([a]) => a > b.from && a < b.to);
    return s ? {...b, to: s[0]} : b;
  });
};

// ---------------------------------------------------------------------------
// Som: eventos automáticos, com parcimônia (som pontua informação, não todo corte).
// whoosh em flash/push, tique quando um dado pousa, grave no corte de uma tipográfica.
// Intervalo mínimo de 2,5s entre sons automáticos.
// ---------------------------------------------------------------------------
const SFX_PADRAO = {
  whoosh: {arquivo: 'whoosh.wav', gainDb: -20, ataque: 0.2}, // pico da passagem ~0,2s após o início
  tique: {arquivo: 'tique.wav', gainDb: -17, ataque: 0},
  grave: {arquivo: 'grave.wav', gainDb: -15, ataque: 0},
};

// ---------------------------------------------------------------------------
// Mundo de pontos. Cada chave (forma) e cada câmera presa a uma palavra da fala, como as cenas.
// A regra que manda aqui é a mesma do reel inteiro: a forma ENCENA o que a voz está dizendo naquela
// palavra. Por isso toda chave exige `encena` (o que a forma mostra da frase), e o laudo imprime
// palavra, forma e encena lado a lado pra quem aprova conferir.
// ---------------------------------------------------------------------------
export const FORMAS_MUNDO = ['nuvem', 'poeira', 'esfera', 'anel', 'galaxia', 'onda', 'tunel', 'grupos', 'rede', 'glifo', 'imagem', 'logo'];
const POSES_MUNDO = new Set(['frente', 'perto', 'longe', 'cima', 'baixo', 'lado', 'diagonal', 'mergulho']);
const LEAD_MUNDO = 2; // quadros: o morph começa junto com a sílaba, não depois dela

const resolverMundo = (pm, {modo, ws, cenas, totalFrames, erros, avisos}) => {
  const E = (m) => erros.push(`mundo: ${m}`);
  const A = (m) => avisos.push(`mundo: ${m}`);
  // tempo de uma chave/câmera: âncora na fala (modo áudio) ou t/f explícito
  const tempo = (x, rotulo, cursor, primeira) => {
    if (x.ancora !== undefined) {
      if (modo !== 'audio') { E(`${rotulo}: "ancora" só existe com áudio; no modo texto use "t" (segundos)`); return {f: null, cursor}; }
      const idx = acharFrase(ws, x.ancora, cursor.w);
      if (idx < 0) { E(`${rotulo}: âncora "${x.ancora}" não achada na fala depois da palavra ${cursor.w}`); return {f: null, cursor}; }
      return {f: Math.max(0, Math.round(ws[idx].start * FPS) - LEAD_MUNDO), cursor: {w: idx + 1}, palavra: ws[idx].texto};
    }
    if (x.f !== undefined) return {f: Math.round(x.f), cursor};
    if (x.t !== undefined) return {f: Math.round(x.t * FPS), cursor};
    if (primeira) return {f: 0, cursor};
    E(`${rotulo}: sem "ancora" (nem "t"); a forma precisa estar presa a uma palavra da fala`);
    return {f: null, cursor};
  };

  const chavesIn = pm.chaves ?? [];
  if (!chavesIn.length) { E('sem chaves (a sequência de formas)'); return undefined; }
  const chaves = [];
  const cameras = [];
  let cur = {w: 0};
  chavesIn.forEach((k, i) => {
    const rot = `chave ${i + 1} (${k.forma})`;
    const {f, cursor, palavra} = tempo(k, rot, cur, i === 0);
    cur = cursor;
    if (!FORMAS_MUNDO.includes(k.forma)) E(`${rot}: forma inexistente. Opções: ${FORMAS_MUNDO.join(', ')}`);
    if (k.forma === 'glifo' && !k.texto) E(`${rot}: glifo sem "texto"`);
    if (k.forma === 'glifo' && k.texto && Math.max(...String(k.texto).split('\n').map((l) => l.length)) > 7) A(`${rot}: glifo com mais de 7 caracteres por linha perde leitura em pontos; quebre a linha ou encurte`);
    if ((k.forma === 'imagem' || k.forma === 'logo') && !k.arquivo && !k.src) E(`${rot}: ${k.forma} sem "arquivo"`);
    if (k.forma === 'grupos' && !(k.quantidade >= 1)) E(`${rot}: grupos sem "quantidade"`);
    // a regra do reel: a forma encena a fala. Abertura em nuvem/poeira é estado de espera, dispensa.
    const espera = i === 0 && (k.forma === 'nuvem' || k.forma === 'poeira');
    if (modo === 'audio' && !espera && !String(k.encena ?? '').trim()) E(`${rot}${k.ancora ? ` em "${k.ancora}"` : ''}: falta "encena" (o que esta forma mostra da frase dita nessa palavra). Forma sem ligação clara com a fala não entra`);
    if (f === null) return;
    const {t: _t, f: _f, camera, pousar, ...resto} = k;
    let fi = f;
    if (pousar && k.dur !== undefined) fi = Math.max(0, f - Math.round(k.dur * FPS)); // a forma termina de se formar NA palavra
    chaves.push({...resto, f: fi, _palavra: palavra});
    // atalho: "camera": "diagonal" ou {pose, orbita, dur} junto da chave
    if (camera) cameras.push({...(typeof camera === 'string' ? {pose: camera} : camera), f: fi, _de: rot});
  });
  for (let i = 1; i < chaves.length; i++) if (chaves[i].f <= chaves[i - 1].f) E(`chaves ${i} e ${i + 1} fora de ordem ou no mesmo quadro`);

  // duração do morph: proporcional ao tempo até a próxima forma. Frase curta pede morph curto
  // (0,3 a 0,5s), senão a forma nunca chega a existir e o espectador só vê nuvem.
  chaves.forEach((k, i) => {
    const prox = chaves[i + 1]?.f ?? totalFrames;
    const janela = (prox - k.f) / FPS;
    if (k.dur === undefined) k.dur = +Math.min(0.75, Math.max(0.3, janela * 0.4)).toFixed(2);
    if (k.spread === undefined) k.spread = +Math.min(0.28, janela * 0.15).toFixed(2);
    if (i === 0) return;
    const forma = k.dur + k.spread;
    const pronta = janela - forma;
    if (forma > janela * 0.85) E(`chave ${i + 1} (${k.forma}): o morph (${forma.toFixed(2)}s) ocupa a janela inteira (${janela.toFixed(2)}s); a forma nunca se completa. Encurte "dur"/"spread" ou mova a âncora seguinte`);
    else if (pronta < 0.8 && prox < totalFrames) A(`chave ${i + 1} (${k.forma}): fica só ${pronta.toFixed(2)}s formada; o desenho precisa de ~1s inteiro pra ser lido`);
  });

  // câmeras próprias (além dos atalhos), com cursor próprio na fala
  let cc = {w: 0};
  (pm.cameras ?? []).forEach((c, i) => {
    const rot = `câmera ${i + 1}`;
    const {f, cursor} = tempo(c, rot, cc, i === 0);
    cc = cursor;
    if (f === null) return;
    const {t: _t, ancora: _a, ...resto} = c;
    cameras.push({...resto, f, _de: rot});
  });
  cameras.forEach((c) => { if (c.pose && !POSES_MUNDO.has(c.pose)) E(`${c._de}: pose "${c.pose}" não existe. Opções: ${[...POSES_MUNDO].join(', ')}`); });
  cameras.sort((a, b) => a.f - b.f);

  // o que o espectador vê: as janelas das cenas "mundo"
  const janelas = cenas.filter((c) => c.visual === 'mundo').map((c) => [c.from, c.from + c.dur]);
  const visivel = (a, b) => janelas.some(([x, y]) => a < y && b > x);
  chaves.forEach((k, i) => {
    const fim = chaves[i + 1]?.f ?? totalFrames;
    if (janelas.length && !visivel(k.f, fim)) A(`chave ${i + 1} (${k.forma}) inteira fora das cenas de mundo: o espectador nunca vê essa forma. Se não é passagem de propósito, mova a âncora ou tire a chave`);
  });
  janelas.forEach(([a, b], j) => {
    let k = -1;
    chaves.forEach((c, i) => { if (c.f <= a) k = i; });
    const c = chaves[k];
    if (c) {
      // cada cena de mundo abre com a forma legível: protagonista formado em < 1s (regra do pontilhismo)
      const pronta = c.f + Math.round((c.dur + c.spread) * FPS);
      if (pronta > a + 30 && pronta < b) A(`cena de mundo ${j + 1} abre com "${c.forma}" ainda se formando por ${((pronta - a) / FPS).toFixed(1)}s; o primeiro segundo precisa mostrar algo legível`);
    }
    // teto de 5s vale entre beats (nova forma ou movimento de câmera), não pra cena inteira
    const beats = [a, ...chaves.map((x) => x.f), ...cameras.map((x) => x.f), b].filter((f) => f >= a && f <= b).sort((x, y) => x - y);
    let maior = 0;
    for (let i = 1; i < beats.length; i++) maior = Math.max(maior, beats[i] - beats[i - 1]);
    if (maior > 150) A(`cena de mundo ${j + 1}: ${(maior / FPS).toFixed(1)}s sem forma nova nem câmera; acima de 5s cansa. Ponha uma chave (ou câmera) presa à palavra em que a ideia muda`);
  });

  return {...pm, chaves, cameras};
};


// ---------------------------------------------------------------------------
// resolverPlano: o coração. `words` = conteúdo do words.json (ou null no modo texto).
// ---------------------------------------------------------------------------
export const resolverPlano = (plan, words) => {
  const erros = [];
  const avisos = [];
  const cenasIn = plan.scenes ?? plan.cenas ?? [];
  if (!cenasIn.length) erros.push('o plano não tem cenas');
  const modo = words ? 'audio' : 'texto';
  let ws = [];
  let totalFrames;
  const cenas = [];

  if (modo === 'audio') {
    ws = aplicarCorrecoes(words.words ?? [], plan.correcoes);
    const audioSeg = words.duration || (ws.length ? ws[ws.length - 1].end : 0);
    totalFrames = Math.ceil(audioSeg * FPS) + 12; // cauda curta: não termina seco na última sílaba
    let cursor = 0;
    const inicios = [];
    cenasIn.forEach((c, i) => {
      if (i === 0 && !c.ancora) { inicios.push({f: 0, w: 0}); return; }
      const idx = acharFrase(ws, c.ancora, cursor);
      if (idx < 0) { erros.push(`cena ${i + 1}: âncora "${c.ancora}" não achada na fala depois da palavra ${cursor}`); inicios.push({f: null, w: cursor}); return; }
      inicios.push({f: i === 0 ? 0 : quadroDoCorte(ws, idx), w: idx});
      cursor = idx + 1;
    });
    cenasIn.forEach((c, i) => {
      const from = inicios[i].f ?? 0;
      const prox = inicios.slice(i + 1).find((x) => x.f !== null);
      const to = prox ? prox.f : totalFrames;
      const cena = {...c, from, dur: Math.max(1, to - from)};
      // evento dentro da cena (a palavra em que o dado pousa)
      if (c.evento) {
        const e = acharFrase(ws, c.evento, inicios[i].w);
        if (e < 0) erros.push(`cena ${i + 1}: evento "${c.evento}" não achado na fala`);
        else {
          const fe = Math.round(ws[e].start * FPS);
          if (fe >= to) erros.push(`cena ${i + 1}: evento "${c.evento}" cai depois do fim da cena (a próxima âncora vem antes)`);
          cena.evento = Math.max(0, fe - from);
        }
      }
      // marcas de prova e lente presas a palavras
      if (Array.isArray(c.marcas)) {
        cena.marcas = c.marcas.map((m, k) => {
          if (!m.em) return {...m, em: undefined};
          const e = acharFrase(ws, m.em, inicios[i].w);
          if (e < 0) { erros.push(`cena ${i + 1}: marca ${k + 1} presa a "${m.em}", que não está na fala`); return {...m, em: undefined}; }
          return {...m, em: Math.max(0, Math.round(ws[e].start * FPS) - from)};
        });
      }
      if (c.lente?.em) {
        const e = acharFrase(ws, c.lente.em, inicios[i].w);
        cena.lente = {...c.lente, em: e < 0 ? undefined : Math.max(0, Math.round(ws[e].start * FPS) - from)};
      }
      cenas.push(cena);
    });
  } else {
    // modo texto (sem áudio): a duração vem do `hold` de cada cena, como na v1
    let f = 0;
    for (const c of cenasIn) {
      const dur = Math.max(20, Math.round(c.hold ?? plan.perScene ?? 78));
      cenas.push({...c, from: f, dur, evento: c.evento !== undefined && typeof c.evento === 'number' ? c.evento : undefined});
      f += dur;
    }
    totalFrames = f;
  }

  // --- transições: `transicao` da cena = como ELA entra. A cena anterior recebe a saída espelhada ---
  cenas.forEach((c, i) => {
    // padrão "fundir" (dissolução curta, 01/10/2026); plano legado mantém o corte seco com que foi aprovado
    const t = c.transicao ?? plan.transicao ?? (plan.legado ? 'corte' : 'fundir');
    if (!TRANS.has(t)) erros.push(`cena ${i + 1}: transição "${t}" não existe (use fundir, corte, flash ou push)`);
    c.registro = registroDe(c.visual ?? 'orb');
    if (i > 0) {
      c.entrada = t === 'flash' || t === 'fundir' ? t : 'corte'; // push é saída da anterior; a entrada é corte limpo
      cenas[i - 1].saida = t;
    }
  });

  // --- validação de direção ---
  const nIcone = cenas.filter((c) => c.registro === 'icone').length;
  // Lottie de autores diferentes misturam traço, perspectiva e paleta: a peça perde a cara de uma mão só
  const anims = cenas.filter((c) => c.visual === 'animacao');
  if (anims.length > 6) avisos.push(`${anims.length} animações Lottie; acima de 6 o reel vira colagem de estilos. Prefira o mesmo autor/traço e alterne com os outros registros`);
  anims.forEach((c) => { if (c.pico !== undefined && c.evento === undefined) avisos.push(`cena ${cenas.indexOf(c) + 1}: animação com "pico" mas sem "evento"; o pico só se alinha a uma palavra`); });
  // arquivo repetido conta como objeto repetido
  const arqs = anims.map((c) => c.arquivo);
  arqs.forEach((a, k) => { if (arqs.indexOf(a) !== k) erros.push(`cena ${cenas.indexOf(anims[k]) + 1}: repete a animação ${a}`); });
  if (nIcone > 3) avisos.push(`${nIcone} cenas de ícone/svg; o teto é 3 por reel (vira o registro dominante e lê como slide)`);
  const vistos = new Map();
  cenas.forEach((c, i) => {
    const n = i + 1;
    const seg = (c.dur / FPS).toFixed(2);
    // mesmo registro vizinho só vale como RAJADA: lista falada (A, B, C) trocando por flash, até 3 seguidas
    if (i > 0 && c.registro === cenas[i - 1].registro) {
      const rajada = c.transicao === 'flash' && ['objeto', 'icone', 'prova', 'animacao'].includes(c.registro);
      let tam = 1;
      for (let k = i; k > 0 && cenas[k].registro === c.registro && cenas[k].transicao === 'flash'; k--) tam++;
      if (!rajada) erros.push(`cenas ${i} e ${n}: mesmo registro vizinho (${c.registro}); troque o tipo de cena, não só o objeto (ou, se for lista falada, entre com flash)`);
      else if (tam > 3) erros.push(`cena ${n}: rajada de ${tam} ${c.registro} seguidos; o teto é 3`);
    }
    if (c.dur < 24) erros.push(`cena ${n}: ${seg}s; abaixo de 0,8s ninguém lê. Junte com a vizinha ou mova a âncora`);
    else if (c.dur < 36) avisos.push(`cena ${n}: ${seg}s; curta. O herói precisa de 1s inteiro resolvido na tela`);
    if (c.dur > 150 && c.visual !== 'video' && c.visual !== 'mundo') avisos.push(`cena ${n}: ${seg}s; acima de 5s uma cena só cansa. Decupe em beats (nova âncora no meio)`);
    if (i > 0 && c.transicao === 'push' && cenas[i - 1].transicao === 'push') avisos.push(`cenas ${i} e ${n}: push seguido de push vira tique`);
    // objeto repetido: heróis não repetem; templates (dado, prova, tela...) podem voltar com outro conteúdo
    const chave = c.visual === 'object' ? `object:${c.name}` : c.visual === 'icon' ? `icon:${(c.paths ?? []).join('')}` : c.visual;
    if (!VISUAIS_TEMPLATE.has(c.visual) || c.visual === 'icon') {
      if (vistos.has(chave)) erros.push(`cena ${n}: repete o objeto da cena ${vistos.get(chave)} (${c.visual === 'object' ? c.name : c.visual})`);
      else vistos.set(chave, n);
    }
    // campos obrigatórios por registro
    if (c.visual === 'object' && OBJETOS && !OBJETOS.has(c.name)) erros.push(`cena ${n}: objeto "${c.name}" não existe no catálogo. Opções: ${[...OBJETOS].join(', ')}`);
    if (c.visual === 'tipografica' && !c.text) erros.push(`cena ${n}: tipográfica sem text`);
    if (c.visual === 'faixa' && (c.de === undefined || c.ate === undefined)) erros.push(`cena ${n}: faixa precisa de "de" e "ate"`);
    if (c.visual === 'barras' && !(c.valores?.length >= 2)) erros.push(`cena ${n}: barras precisa de 2+ valores`);
    if (['prova', 'logo', 'video', 'animacao'].includes(c.visual) && !c.src && !c.imagem && !c.arquivo) erros.push(`cena ${n}: ${c.visual} sem arquivo (campo "imagem"/"arquivo")`);
    // a regra-mãe do reel: toda cena ENCENA o que a voz diz naquele trecho. Quem dirige escreve isso em
    // `encena`; sem a frase, o visual costuma ser só associação (ícone de documento pra "paper").
    // Tipográfica dispensa: a própria frase é a imagem. Plano antigo ("legado": true) recebe aviso.
    if (modo === 'audio' && c.visual !== 'tipografica' && !String(c.encena ?? '').trim()) {
      const msg = `cena ${n}${c.ancora ? ` em "${c.ancora}"` : ''}: falta "encena" (o que este visual mostra da frase dita aqui). Cena sem ligação clara com a fala não entra`;
      (plan.legado ? avisos : erros).push(msg);
    }
    if (c.funcao !== undefined && !FUNCOES.has(c.funcao)) avisos.push(`cena ${n}: funcao "${c.funcao}" fora do arco (${[...FUNCOES].join(', ')})`);
    if (modo === 'audio' && c.visual !== 'tipografica' && c.text) avisos.push(`cena ${n}: "text" é ignorado no modo áudio (a fala vira legenda). Número/nome vão no campo do próprio visual`);
    if (modo === 'audio' && ['counter', 'faixa', 'barras'].includes(c.visual) && c.evento === undefined) avisos.push(`cena ${n}: dado sem "evento"; o número vai pousar em ~0,5s em vez de na palavra dita`);
  });
  // --- mundo de pontos (mundo.tsx, reference/pontos.md): chaves e câmeras presas à fala ---
  const mundo = plan.mundo ? resolverMundo(plan.mundo, {modo, ws, cenas, totalFrames, erros, avisos}) : undefined;
  cenas.forEach((c, i) => { if (c.visual === 'mundo' && !mundo) erros.push(`cena ${i + 1}: visual "mundo" sem o bloco "mundo" no plano`); });

  const enf = plan.enfase ?? [];
  // acento raro: ênfase da legenda + *palavra* das tipográficas + formas do mundo em acento, teto 2 no reel
  const nAcMundo = mundo ? mundo.chaves.filter((k) => k.acento || k.destaque !== undefined).length : 0;
  const nAcTipo = cenas.filter((c) => c.visual === 'tipografica').reduce((a, c) => a + (String(c.text ?? '').match(/\*[^*]+\*/g) ?? []).length, 0);
  const nAc = enf.length + nAcMundo + nAcTipo;
  if (nAc > 2) avisos.push(`${nAc} usos de acento (${enf.length} na legenda, ${nAcTipo} em tipográfica, ${nAcMundo} no mundo); acento raro é acento (teto 2 por reel)`);

  // --- legenda ---
  let legendas = [];
  if (modo === 'audio' && plan.legenda !== false) {
    const cortes = new Set();
    cenas.forEach((c, i) => { if (i > 0) { const k = ws.findIndex((w) => Math.round(w.start * FPS) >= c.from); if (k >= 0) cortes.add(k); } });
    const silencios = cenas.filter((c) => c.visual === 'tipografica' || c.legenda === false).map((c) => [c.from, c.from + c.dur]);
    legendas = montarLegendas(ws, {cortes, enfase: enf, silencios, fimTotal: totalFrames}).map(({primeiro, ...b}) => b);
    const longos = legendas.filter((b) => b.texto.length > 22);
    if (longos.length) avisos.push(`${longos.length} bloco(s) de legenda com mais de 22 caracteres podem quebrar em 2 linhas: ${longos.slice(0, 3).map((b) => b.texto).join(' | ')}`);
  }

  // --- som automático ---
  const sfx = [];
  if (plan.sfx !== false) {
    let ultimo = -1e9;
    const pode = (f) => f - ultimo >= 2.5 * FPS;
    cenas.forEach((c, i) => {
      if (c.sfx === false) return;
      let tipo = null;
      let f = null;
      if (i > 0 && (c.transicao === 'flash' || c.transicao === 'push')) { tipo = 'whoosh'; f = c.from; }
      else if (c.visual === 'tipografica' && i > 0) { tipo = 'grave'; f = c.from; }
      else if (['counter', 'faixa', 'barras'].includes(c.visual) && c.evento !== undefined) { tipo = 'tique'; f = c.from + c.evento; }
      if (!tipo || !pode(f)) return;
      const s = SFX_PADRAO[tipo];
      sfx.push({tipo, arquivo: s.arquivo, from: Math.round(f - s.ataque * FPS), gainDb: s.gainDb});
      ultimo = f;
    });
  }

  return {
    erros,
    avisos,
    props: {...(plan.mapa ? {mapa: plan.mapa} : {}), modo, theme: plan.theme ?? 'anticustos', cenas, legendas, totalFrames, sfx, trilhaVol: plan.trilhaVol, ...(mundo ? {mundo} : {})},
    transcript: ws,
  };
};

// ---------------------------------------------------------------------------
// leitura de arquivos do plano (caminho relativo à raiz do projeto OU à pasta do plano)
// ---------------------------------------------------------------------------
export const achar = (p, base) => {
  if (!p) return null;
  const t = [path.isAbsolute(p) ? p : null, path.resolve(process.cwd(), p), path.resolve(base, p)].filter(Boolean);
  return t.find((x) => existsSync(x)) ?? null;
};

export const lerPlano = (propsPath) => {
  const plan = JSON.parse(readFileSync(propsPath, 'utf8'));
  const base = path.dirname(path.resolve(propsPath));
  let words = null;
  if (plan.words) {
    const wp = achar(plan.words, base);
    if (!wp) throw new Error(`transcript "${plan.words}" não encontrado`);
    words = JSON.parse(readFileSync(wp, 'utf8'));
  }
  return {plan, words, base};
};

// laudo legível
export const imprimirLaudo = ({erros, avisos, props}) => {
  const {cenas, legendas, totalFrames, sfx} = props;
  // mapa narrativo (registros.md): objetivo, transformação de percepção e arco, antes das cenas
  if (props.mapa) for (const [k, v] of Object.entries(props.mapa)) console.log(`[mapa] ${k}: ${v}`);
  console.log(`[plano] modo ${props.modo} · ${cenas.length} cenas · ${(totalFrames / FPS).toFixed(1)}s · ${legendas.length} blocos de legenda · ${sfx.length} sons`);
  cenas.forEach((c, i) => {
    const t = (c.from / FPS).toFixed(2).padStart(6);
    console.log(`  ${String(i + 1).padStart(2)} ${t}s  ${(c.dur / FPS).toFixed(2)}s  ${(c.registro ?? '').padEnd(11)} ${(c.visual ?? '').padEnd(11)} ${c.transicao && i ? `[${c.transicao}] ` : ''}${c.ancora ? `"${c.ancora}"` : ''}${c.evento !== undefined ? ` · evento +${(c.evento / FPS).toFixed(2)}s` : ''}${c.funcao ? ` [${c.funcao}]` : ''}${c.encena ? `  → ${c.encena}` : ''}`);
  });
  // mundo de pontos: palavra, forma e o que ela encena, lado a lado (é aqui que se confere a ligação com a fala)
  const m = props.mundo;
  if (m) {
    console.log(`[plano] mundo de pontos · ${m.chaves.length} formas · ${m.cameras.length} câmeras${m.final ? ` · final ${m.final}` : ''}`);
    m.chaves.forEach((k) => {
      const det = [k.texto ? `"${String(k.texto).replace(/\n/g, ' ')}"` : '', k.quantidade ? `${k.quantidade}` : '', k.acento || k.destaque !== undefined ? 'acento' : ''].filter(Boolean).join(' · ');
      console.log(`   ◦ ${(k.f / FPS).toFixed(2).padStart(6)}s  ${String(k.forma).padEnd(8)} ${k._palavra ? `na "${k._palavra}"`.padEnd(18) : ''.padEnd(18)}${det ? `${det}  ` : ''}${k.encena ? `→ ${k.encena}` : ''}`);
    });
  }
  for (const a of avisos) console.log(`  AVISO: ${a}`);
  for (const e of erros) console.log(`  ERRO:  ${e}`);
  console.log(erros.length ? `[plano] REPROVADO: ${erros.length} erro(s).` : `[plano] aprovado${avisos.length ? ` com ${avisos.length} aviso(s)` : ''}.`);
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const souCLI = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (souCLI) {
  const args = process.argv.slice(2);
  const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  try {
    if (args.includes('--rascunho')) {
      const wp = get('--words');
      const w = JSON.parse(readFileSync(wp, 'utf8'));
      const ws = w.words ?? [];
      let linha = '';
      ws.forEach((x, i) => {
        const pausa = i > 0 ? x.start - ws[i - 1].end : 0;
        if (pausa >= 0.35 && linha) { console.log(linha); console.log(`        · pausa ${pausa.toFixed(2)}s`); linha = ''; }
        if (!linha) linha = `${x.start.toFixed(2).padStart(6)}s `;
        linha += `${x.word}[${i}] `;
      });
      if (linha) console.log(linha);
      console.log(`[rascunho] ${ws.length} palavras, ${(w.duration ?? 0).toFixed(1)}s. Âncora = a palavra em que a cena corta.`);
      process.exit(0);
    }
    const pp = get('--props');
    if (!pp) { console.error('uso: node plano.mjs --props <plano.json> [--saida <resolvido.json>]  |  --rascunho --words <words.json>'); process.exit(2); }
    const {plan, words} = lerPlano(pp);
    const r = resolverPlano(plan, words);
    imprimirLaudo(r);
    if (args.includes('--legendas')) r.props.legendas.forEach((b) => console.log(`    ${(b.from / FPS).toFixed(2)} a ${(b.to / FPS).toFixed(2)}  ${b.enfase ? '*' : ' '} ${b.texto}`));
    const saida = get('--saida');
    if (saida) writeFileSync(saida, JSON.stringify(r.props, null, 2));
    process.exit(r.erros.length ? 3 : 0);
  } catch (e) {
    console.error(`[plano] falhou: ${e.message}`);
    process.exit(1);
  }
}
