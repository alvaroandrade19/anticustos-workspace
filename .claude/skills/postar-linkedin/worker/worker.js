// Worker da Cloudflare que publica no LinkedIn na hora marcada.
//
// Acorda pelo cron, lê a fila no KV e publica o que já venceu. As imagens já foram
// enviadas ao LinkedIn pela máquina do Alvaro no momento do agendamento, então aqui
// só trafega texto e URN. Nenhum byte de imagem passa pela Cloudflare.
//
// Bindings esperados: FILA (KV), LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN,
// GATILHO_SECRET (para disparo manual via HTTP, usado nos testes).

const VERSAO_API = '202606';
const MAX_TENTATIVAS = 3;

// Mesma regra do publish.js: /rest/posts recusa esses caracteres sem escape.
// O '#' fica de fora para a hashtag continuar funcionando.
function escaparCommentary(texto) {
  return texto.replace(/[()[\]{}<>@|~_*\\]/g, (c) => '\\' + c);
}

function cabecalhos(env, versionado) {
  const h = {
    Authorization: 'Bearer ' + env.LINKEDIN_ACCESS_TOKEN,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  };
  if (versionado) h['LinkedIn-Version'] = VERSAO_API;
  return h;
}

async function chamarLinkedIn(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  const texto = await resposta.text();
  if (!resposta.ok) {
    throw new Error('LinkedIn ' + resposta.status + ': ' + (texto || '(sem corpo)').slice(0, 400));
  }
  return resposta.headers.get('x-restli-id');
}

async function publicar(item, env) {
  const autor = env.LINKEDIN_PERSON_URN;
  const visibilidade = item.visibilidade || 'PUBLIC';
  let id;

  if (item.modo === 'multi-imagem') {
    id = await chamarLinkedIn('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: cabecalhos(env, true),
      body: JSON.stringify({
        author: autor,
        commentary: escaparCommentary(item.texto),
        visibility: visibilidade,
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        content: {
          multiImage: {
            images: item.imagens.map((urn, i) => {
              const img = { id: urn };
              if (item.alt && item.alt[i]) img.altText = item.alt[i];
              return img;
            }),
          },
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
    });
  } else {
    const conteudo = {
      shareCommentary: { text: item.texto },
      shareMediaCategory: item.modo === 'imagem' ? 'IMAGE' : item.modo === 'link' ? 'ARTICLE' : 'NONE',
    };
    if (item.modo === 'imagem') {
      const media = { status: 'READY', media: item.asset };
      if (item.alt && item.alt[0]) media.description = { text: item.alt[0] };
      conteudo.media = [media];
    } else if (item.modo === 'link') {
      const media = { status: 'READY', originalUrl: item.link };
      if (item.titulo) media.title = { text: item.titulo };
      if (item.descricao) media.description = { text: item.descricao };
      conteudo.media = [media];
    }
    id = await chamarLinkedIn('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: cabecalhos(env, false),
      body: JSON.stringify({
        author: autor,
        lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': conteudo },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibilidade },
      }),
    });
  }

  return id ? 'https://www.linkedin.com/feed/update/' + id + '/' : null;
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
    if (Date.parse(item.quando) > agora) {
      relatorio.push({ chave: chave.name, estado: 'aguardando', quando: item.quando });
      continue;
    }

    const id = chave.name.slice('post:'.length);
    try {
      const url = await publicar(item, env);
      await env.FILA.put('resultado:' + id, JSON.stringify({
        ok: true, slug: item.slug, url: url, publicadoEm: new Date().toISOString(), modo: item.modo,
      }));
      await env.FILA.delete(chave.name);
      relatorio.push({ chave: chave.name, estado: 'publicado', url: url });
    } catch (erro) {
      item.tentativas = (item.tentativas || 0) + 1;
      item.ultimoErro = String(erro.message || erro);
      if (item.tentativas >= MAX_TENTATIVAS) {
        await env.FILA.put('resultado:' + id, JSON.stringify({
          ok: false, slug: item.slug, erro: item.ultimoErro, falhouEm: new Date().toISOString(), tentativas: item.tentativas,
        }));
        await env.FILA.delete(chave.name);
        relatorio.push({ chave: chave.name, estado: 'desistiu', erro: item.ultimoErro });
      } else {
        await env.FILA.put(chave.name, JSON.stringify(item));
        relatorio.push({ chave: chave.name, estado: 'vai tentar de novo', erro: item.ultimoErro });
      }
    }
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
      await env.FILA.put('heartbeat', JSON.stringify({ em: new Date().toISOString(), cron: evento.cron, naFila: fila.keys.length }));
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
