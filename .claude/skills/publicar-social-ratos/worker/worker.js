// Worker da Cloudflare que publica no Instagram na hora marcada.
//
// Acorda pelo cron, lê a fila no KV e publica o que já venceu. As imagens já foram
// enviadas ao catbox pela máquina do Alvaro no momento do agendamento, então aqui
// só trafega URL e texto. Nenhum byte de imagem passa pela Cloudflare.
//
// A Content Publishing API do Instagram não tem agendamento nativo e o container de
// mídia expira em 24h, então o container só pode ser criado agora, na hora de publicar.
// É por isso que este Worker faz mais trabalho que o do LinkedIn: cria, espera ficar
// FINISHED e só então publica.
//
// Bindings esperados: FILA (KV), INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID,
// GATILHO_SECRET (para disparo manual via HTTP, usado nos testes).

const GRAPH = 'https://graph.instagram.com/v21.0';
const MAX_TENTATIVAS = 3;
const INTERVALO_POLL_MS = 3000;
const TIMEOUT_IMAGEM_MS = 90000;
const TIMEOUT_VIDEO_MS = 300000;
// Depois disso, uma trava de publicação é considerada abandonada por queda do Worker.
const TRAVA_VELHA_MS = 10 * 60 * 1000;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function graph(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  const corpo = await resposta.json().catch(() => ({}));
  if (corpo.error) throw new Error(corpo.error.message || JSON.stringify(corpo.error));
  if (!resposta.ok) throw new Error('Instagram respondeu ' + resposta.status);
  return corpo;
}

function criarContainer(env, campos) {
  const body = new URLSearchParams(Object.assign({ access_token: env.INSTAGRAM_ACCESS_TOKEN }, campos));
  return graph(GRAPH + '/' + env.INSTAGRAM_USER_ID + '/media', { method: 'POST', body }).then((j) => j.id);
}

// O container nasce IN_PROGRESS. Publicar antes de FINISHED devolve erro.
async function esperarPronto(env, containerId, tetoMs) {
  const limite = Date.now() + tetoMs;
  while (Date.now() < limite) {
    const j = await graph(
      GRAPH + '/' + containerId + '?fields=status_code,status&access_token=' + env.INSTAGRAM_ACCESS_TOKEN
    );
    if (j.status_code === 'FINISHED') return;
    if (j.status_code === 'ERROR' || j.status_code === 'EXPIRED') {
      throw new Error('Container ' + containerId + ' voltou ' + j.status_code + ': ' + (j.status || 'sem detalhe'));
    }
    await dormir(INTERVALO_POLL_MS);
  }
  throw new Error('Timeout esperando o container ' + containerId + ' ficar pronto.');
}

async function publicarContainer(env, containerId) {
  const body = new URLSearchParams({ creation_id: containerId, access_token: env.INSTAGRAM_ACCESS_TOKEN });
  const j = await graph(GRAPH + '/' + env.INSTAGRAM_USER_ID + '/media_publish', { method: 'POST', body });
  return j.id;
}

async function permalink(env, mediaId) {
  try {
    const j = await graph(GRAPH + '/' + mediaId + '?fields=permalink&access_token=' + env.INSTAGRAM_ACCESS_TOKEN);
    return j.permalink || null;
  } catch (_) {
    return null;
  }
}

// Recuperação de trava abandonada: pergunta ao próprio Instagram se o post saiu.
// Evita o pior caso, que é republicar e deixar o carrossel duplicado no feed.
async function jaFoiPublicado(env, item) {
  const assinatura = (item.legenda || '').slice(0, 80).trim();
  if (!assinatura) return null;
  const j = await graph(
    GRAPH + '/' + env.INSTAGRAM_USER_ID +
    '/media?fields=id,caption,permalink,timestamp&limit=10&access_token=' + env.INSTAGRAM_ACCESS_TOKEN
  );
  const desde = Date.parse(item.publicando || item.quando) - 3600000;
  for (const m of j.data || []) {
    if (Date.parse(m.timestamp) < desde) continue;
    if ((m.caption || '').slice(0, 80).trim() === assinatura) return m;
  }
  return null;
}

// Container de imagem com troca de host, e a troca vale para o resto do carrossel.
//
// Aqui é o único ponto onde dá para descobrir que a Meta não consegue buscar a imagem:
// o erro só aparece quando ela tenta baixar, nunca no upload. Foi assim nas duas quebras
// reais, o catbox em 15/09/2026 ("An unknown error has occurred") e o imgbb em 16/09
// ("Only photo or video can be accepted as media type"), as duas com o arquivo no ar e
// o link abrindo normal.
//
// A troca é do host inteiro, não de uma imagem: se a primeira falhou, as outras oito
// vão falhar igual, e o plano grátis só dá 50 subrequisições por execução. Insistir no
// host morto imagem por imagem gasta o orçamento justamente quando ele é mais preciso.
function trocadorDeHost(env) {
  let naReserva = false;
  return async function criarImagem(campos, url, reserva) {
    if (naReserva && reserva) {
      const id = await criarContainer(env, Object.assign({ image_url: reserva }, campos));
      await esperarPronto(env, id, TIMEOUT_IMAGEM_MS);
      return id;
    }
    try {
      const id = await criarContainer(env, Object.assign({ image_url: url }, campos));
      await esperarPronto(env, id, TIMEOUT_IMAGEM_MS);
      return id;
    } catch (erro) {
      if (!reserva) throw erro;
      naReserva = true;
      const id = await criarContainer(env, Object.assign({ image_url: reserva }, campos));
      await esperarPronto(env, id, TIMEOUT_IMAGEM_MS);
      return id;
    }
  };
}

async function montarEPublicar(env, item) {
  const legenda = item.legenda || '';
  const reservas = item.midiaReserva || [];
  const criarImagem = trocadorDeHost(env);

  if (item.tipo === 'reels') {
    const id = await criarContainer(env, { media_type: 'REELS', video_url: item.midia[0], caption: legenda });
    await esperarPronto(env, id, TIMEOUT_VIDEO_MS);
    return publicarContainer(env, id);
  }

  if (item.tipo === 'imagem') {
    const id = await criarImagem({ caption: legenda }, item.midia[0], reservas[0]);
    return publicarContainer(env, id);
  }

  // Carrossel: cada imagem vira um filho, e só depois o container do álbum.
  const filhos = [];
  for (let i = 0; i < item.midia.length; i++) {
    filhos.push(await criarImagem({ is_carousel_item: 'true' }, item.midia[i], reservas[i]));
  }
  const album = await criarContainer(env, {
    media_type: 'CAROUSEL',
    children: filhos.join(','),
    caption: legenda,
  });
  await esperarPronto(env, album, TIMEOUT_IMAGEM_MS);
  return publicarContainer(env, album);
}

async function registrarSucesso(env, chave, item, mediaId, url) {
  const id = chave.slice('post:'.length);
  await env.FILA.put('resultado:' + id, JSON.stringify({
    ok: true,
    slug: item.slug,
    tipo: item.tipo,
    mediaId: mediaId,
    url: url,
    publicadoEm: new Date().toISOString(),
  }));
  await env.FILA.delete(chave);
}

async function registrarFalha(env, chave, item, erro) {
  const id = chave.slice('post:'.length);
  await env.FILA.put('resultado:' + id, JSON.stringify({
    ok: false,
    slug: item.slug,
    tipo: item.tipo,
    erro: erro,
    falhouEm: new Date().toISOString(),
    tentativas: item.tentativas || 0,
  }));
  await env.FILA.delete(chave);
}

async function processarItem(env, chave, item, agora, relatorio) {
  // Trava de um ciclo anterior que não terminou. Antes de qualquer coisa, descobrir
  // se aquele ciclo chegou a publicar, para não duplicar o post.
  if (item.publicando) {
    const idade = agora - Date.parse(item.publicando);
    if (idade < TRAVA_VELHA_MS) {
      relatorio.push({ chave: chave, estado: 'em andamento em outro ciclo' });
      return;
    }
    let achado = null;
    try {
      achado = await jaFoiPublicado(env, item);
    } catch (erro) {
      relatorio.push({ chave: chave, estado: 'trava velha, nao consegui checar', erro: String(erro.message || erro) });
      return;
    }
    if (achado) {
      await registrarSucesso(env, chave, item, achado.id, achado.permalink || null);
      relatorio.push({ chave: chave, estado: 'ja tinha publicado, trava liberada', url: achado.permalink });
      return;
    }
    delete item.publicando;
  }

  item.publicando = new Date().toISOString();
  await env.FILA.put(chave, JSON.stringify(item));

  try {
    const mediaId = await montarEPublicar(env, item);
    const url = await permalink(env, mediaId);
    await registrarSucesso(env, chave, item, mediaId, url);
    relatorio.push({ chave: chave, estado: 'publicado', url: url });
  } catch (erro) {
    item.tentativas = (item.tentativas || 0) + 1;
    item.ultimoErro = String(erro.message || erro);
    delete item.publicando;
    if (item.tentativas >= MAX_TENTATIVAS) {
      await registrarFalha(env, chave, item, item.ultimoErro);
      relatorio.push({ chave: chave, estado: 'desistiu', erro: item.ultimoErro });
    } else {
      await env.FILA.put(chave, JSON.stringify(item));
      relatorio.push({ chave: chave, estado: 'vai tentar de novo', erro: item.ultimoErro });
    }
  }
}

// Recebe a lista já pronta quando quem chamou acabou de fazê-la. Operação de list
// no KV grátis tem teto de 1000 por dia, então cada ciclo faz no máximo uma.
async function processarFila(env, listaPronta) {
  const agora = Date.now();
  const lista = listaPronta || (await env.FILA.list({ prefix: 'post:' }));
  const relatorio = [];

  for (const chave of lista.keys) {
    const item = await env.FILA.get(chave.name, 'json');
    if (!item) {
      await env.FILA.delete(chave.name);
      continue;
    }
    if (!item.publicando && Date.parse(item.quando) > agora) {
      relatorio.push({ chave: chave.name, estado: 'aguardando', quando: item.quando });
      continue;
    }
    await processarItem(env, chave.name, item, agora, relatorio);
  }

  return relatorio;
}

export default {
  async scheduled(evento, env, ctx) {
    ctx.waitUntil((async () => {
      // Batida de coração: prova que o cron acordou, mesmo que a publicação falhe.
      // Só grava quando há algo na fila, para não gastar o orçamento de escrita do KV.
      const fila = await env.FILA.list({ prefix: 'post:' });
      if (!fila.keys.length) return;
      await env.FILA.put('heartbeat', JSON.stringify({
        em: new Date().toISOString(), cron: evento.cron, naFila: fila.keys.length,
      }));
      await processarFila(env, fila);
    })());
  },

  // Disparo manual, só para teste. Exige o header com o segredo do Worker.
  async fetch(requisicao, env) {
    if (requisicao.headers.get('x-gatilho') !== env.GATILHO_SECRET) {
      return new Response('nao autorizado', { status: 401 });
    }
    const relatorio = await processarFila(env);
    return Response.json({ processado: new Date().toISOString(), itens: relatorio });
  },
};
