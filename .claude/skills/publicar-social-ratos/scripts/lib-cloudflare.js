// Cliente mínimo da API da Cloudflare: KV e Workers. Sem wrangler, sem dependência.
'use strict';

const BASE = 'https://api.cloudflare.com/client/v4';

function credenciais() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const conta = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !conta) {
    throw new Error('Faltam CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID no .env.');
  }
  return { token: token, conta: conta };
}

async function cf(caminho, opcoes) {
  const { token, conta } = credenciais();
  const url = BASE + '/accounts/' + conta + caminho;
  const cfg = Object.assign({}, opcoes || {});
  cfg.headers = Object.assign({ Authorization: 'Bearer ' + token }, cfg.headers || {});
  const resposta = await fetch(url, cfg);
  const texto = await resposta.text();
  let corpo = texto;
  if (texto) {
    try { corpo = JSON.parse(texto); } catch (_) { /* valor cru do KV não é JSON */ }
  }
  if (!resposta.ok) {
    const detalhe = typeof corpo === 'string' ? corpo : JSON.stringify(corpo.errors || corpo);
    const erro = new Error('Cloudflare respondeu ' + resposta.status + ': ' + detalhe);
    erro.status = resposta.status;
    throw erro;
  }
  return corpo;
}

// ----- KV -----

async function acharNamespace(titulo) {
  const r = await cf('/storage/kv/namespaces?per_page=100');
  const achado = (r.result || []).find(function (n) { return n.title === titulo; });
  return achado ? achado.id : null;
}

async function garantirNamespace(titulo) {
  const existente = await acharNamespace(titulo);
  if (existente) return { id: existente, criado: false };
  const r = await cf('/storage/kv/namespaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titulo }),
  });
  return { id: r.result.id, criado: true };
}

async function kvGravar(ns, chave, valor) {
  return cf('/storage/kv/namespaces/' + ns + '/values/' + encodeURIComponent(chave), {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: typeof valor === 'string' ? valor : JSON.stringify(valor),
  });
}

async function kvLer(ns, chave) {
  try {
    return await cf('/storage/kv/namespaces/' + ns + '/values/' + encodeURIComponent(chave));
  } catch (erro) {
    if (erro.status === 404) return null;
    throw erro;
  }
}

async function kvListar(ns, prefixo) {
  const r = await cf('/storage/kv/namespaces/' + ns + '/keys?limit=1000' + (prefixo ? '&prefix=' + encodeURIComponent(prefixo) : ''));
  return r.result || [];
}

async function kvApagar(ns, chave) {
  return cf('/storage/kv/namespaces/' + ns + '/values/' + encodeURIComponent(chave), { method: 'DELETE' });
}

// ----- R2 -----

async function acharBucketR2(nome) {
  const r = await cf('/r2/buckets');
  const buckets = (r.result && r.result.buckets) || [];
  return buckets.some(function (b) { return b.name === nome; });
}

// Exige R2 já habilitado na conta pelo painel (não dá para aceitar os termos pela API)
// e o token com a permissão "Workers R2 Storage" adicionada, também só pelo painel.
async function garantirBucketR2(nome) {
  if (await acharBucketR2(nome)) return { criado: false };
  await cf('/r2/buckets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome }),
  });
  return { criado: true };
}

// Apaga sozinho objeto com mais de `dias`. É a trava que garante que o bucket nunca
// cresce sem limite e o plano grátis nunca estoura (o cartão da conta está vinculado).
// Imagem publicada não precisa sobreviver: a Meta baixa e re-hospeda na publicação.
async function definirCicloDeVidaR2(bucket, dias) {
  return cf('/r2/buckets/' + bucket + '/lifecycle', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rules: [
        {
          id: 'apagar-antigos',
          enabled: true,
          conditions: { prefix: '' },
          deleteObjectsTransition: { condition: { type: 'Age', maxAge: dias * 86400 } },
        },
      ],
    }),
  });
}

// ----- Workers -----

// A conta precisa ter um subdomínio workers.dev antes de aceitar cron ou rota.
// Normalmente ele nasce quando alguém abre Workers no dashboard; aqui criamos pela API.
async function garantirSubdominio(preferidos) {
  try {
    const atual = await cf('/workers/subdomain');
    if (atual.result && atual.result.subdomain) return atual.result.subdomain;
  } catch (erro) {
    if (erro.status !== 404) throw erro;
  }
  let ultimo = null;
  for (const nome of preferidos) {
    try {
      const r = await cf('/workers/subdomain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: nome }),
      });
      return (r.result && r.result.subdomain) || nome;
    } catch (erro) {
      ultimo = erro;
    }
  }
  throw new Error('Não consegui criar subdomínio workers.dev. Último erro: ' + (ultimo && ultimo.message));
}

async function subirWorker(nome, codigo, bindings, compatDate) {
  const metadata = {
    main_module: 'worker.js',
    compatibility_date: compatDate || '2026-06-01',
    bindings: bindings || [],
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
  form.append('worker.js', new Blob([codigo], { type: 'application/javascript+module' }), 'worker.js');
  // Sem Content-Type manual: o fetch monta o boundary do multipart sozinho.
  return cf('/workers/scripts/' + nome, { method: 'PUT', body: form });
}

async function definirCron(nome, crons) {
  return cf('/workers/scripts/' + nome + '/schedules', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crons.map(function (c) { return { cron: c }; })),
  });
}

async function workerExiste(nome) {
  try {
    await cf('/workers/scripts/' + nome);
    return true;
  } catch (erro) {
    if (erro.status === 404) return false;
    throw erro;
  }
}

module.exports = {
  cf,
  acharNamespace,
  garantirNamespace,
  garantirSubdominio,
  kvGravar,
  kvLer,
  kvListar,
  kvApagar,
  acharBucketR2,
  garantirBucketR2,
  definirCicloDeVidaR2,
  subirWorker,
  definirCron,
  workerExiste,
};
