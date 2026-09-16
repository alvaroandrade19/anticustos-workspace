// Worker que guarda e serve imagem pública para o pipeline de Instagram.
//
// Existe porque a Meta bloqueou o catbox.moe para buscar imagem (achado em 16/09/2026,
// ver notas em lib-instagram.js). O imgbb.com é o host principal; este é o reserva,
// na mesma conta Cloudflare que já roda os dois Workers de fila. Fica atrás de um
// bucket R2 privado: nada aqui é acessível pela API do R2 direto, só por este Worker.
//
// PUT  /<chave>   sobe o arquivo. Exige o header x-upload-secret
// GET  /<chave>   serve o arquivo sem autenticação: é o que o crawler da Meta busca
// GET  /_uso      quanto o bucket ocupa. Exige x-upload-secret
//
// Bindings esperados: BUCKET (r2_bucket), UPLOAD_SECRET (secret_text).
//
// O teto do plano grátis do R2 é inegociável (o cartão da conta está vinculado), então
// aqui existem duas travas: o PUT recusa arquivo grande e exige content-length, e o
// bucket tem regra de ciclo de vida apagando objeto com mais de 30 dias (ver
// deploy-worker-imagens.js). Imagem publicada não precisa sobreviver: a Meta baixa e
// re-hospeda no momento da publicação, o link daqui só precisa durar esse instante.

const MAX_BYTES = 10 * 1024 * 1024;

function autorizado(requisicao, env) {
  return requisicao.headers.get('x-upload-secret') === env.UPLOAD_SECRET;
}

export default {
  async fetch(requisicao, env) {
    const url = new URL(requisicao.url);
    const chave = decodeURIComponent(url.pathname.slice(1));

    if (chave === '_uso') {
      if (!autorizado(requisicao, env)) return new Response('nao autorizado', { status: 401 });
      let bytes = 0;
      let objetos = 0;
      let cursor;
      do {
        const lote = await env.BUCKET.list(cursor ? { cursor } : {});
        for (const objeto of lote.objects) {
          bytes += objeto.size;
          objetos++;
        }
        cursor = lote.truncated ? lote.cursor : null;
      } while (cursor);
      return Response.json({ objetos, bytes });
    }

    if (!chave) return new Response('chave vazia', { status: 400 });

    if (requisicao.method === 'PUT') {
      if (!autorizado(requisicao, env)) return new Response('nao autorizado', { status: 401 });
      // Sem content-length não dá para barrar antes de gravar, então recusa de saída.
      const tamanho = Number(requisicao.headers.get('content-length') || 0);
      if (!tamanho) return new Response('content-length obrigatorio', { status: 411 });
      if (tamanho > MAX_BYTES) {
        return new Response('arquivo acima de ' + MAX_BYTES + ' bytes', { status: 413 });
      }
      const tipo = requisicao.headers.get('content-type') || 'application/octet-stream';
      await env.BUCKET.put(chave, requisicao.body, { httpMetadata: { contentType: tipo } });
      return new Response('ok');
    }

    if (requisicao.method === 'GET' || requisicao.method === 'HEAD') {
      const objeto = await env.BUCKET.get(chave);
      if (!objeto) return new Response('nao encontrado', { status: 404 });
      const cabecalhos = new Headers();
      objeto.writeHttpMetadata(cabecalhos);
      cabecalhos.set('etag', objeto.httpEtag);
      // A chave carrega timestamp + aleatório, então o mesmo link nunca muda de
      // conteúdo: cachear pesado poupa leitura no bucket sem risco de versão velha.
      cabecalhos.set('cache-control', 'public, max-age=31536000, immutable');
      return new Response(requisicao.method === 'HEAD' ? null : objeto.body, { headers: cabecalhos });
    }

    return new Response('metodo nao suportado', { status: 405 });
  },
};
