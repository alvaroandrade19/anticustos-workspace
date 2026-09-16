// Sobe (ou atualiza) o Worker de imagem que serve de segundo host, atrás do imgbb.
// Idempotente: pode rodar quantas vezes quiser.
//
//   node .claude/skills/publicar-social-ratos/scripts/deploy-worker-imagens.js
//
// Pré-requisito manual, só pelo painel da Cloudflare (a API não aceita termos por
// você): R2 habilitado na conta, e o CLOUDFLARE_API_TOKEN do .env com a permissão
// "Workers R2 Storage" adicionada. Sem isso o script para com o erro da Cloudflare.
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./lib-instagram.js');
const cfl = require('./lib-cloudflare.js');

const NOME_WORKER = 'anticustos-imagens';
const NOME_BUCKET = 'anticustos-imagens';
// Teto do plano grátis do R2: 10GB de armazenamento, 1 milhão de escritas e 10 milhões
// de leituras por mês. Um carrossel de 9 slides ocupa ~1,5MB e gasta 9 escritas, então
// o gargalo real seria acúmulo, não volume. Com 30 dias de validade o bucket estabiliza
// bem abaixo de 1GB mesmo num ritmo de publicação muito acima do nosso.
const DIAS_DE_VALIDADE = 30;

(async function () {
  lib.carregarEnv();
  lib.exigir('CLOUDFLARE_API_TOKEN', 'Cole no .env o token da Cloudflare.');
  lib.exigir('CLOUDFLARE_ACCOUNT_ID', 'Cole no .env o Account ID da Cloudflare.');

  const subdominio = await cfl.garantirSubdominio(['anticustos', 'anticustos-ia', 'anticustos-alvaro']);
  console.log('Subdomínio: ' + subdominio + '.workers.dev');

  const bucket = await cfl.garantirBucketR2(NOME_BUCKET);
  console.log('Bucket R2: ' + (bucket.criado ? 'criado' : 'já existia') + ' (' + NOME_BUCKET + ')');

  await cfl.definirCicloDeVidaR2(NOME_BUCKET, DIAS_DE_VALIDADE);
  console.log('Ciclo de vida: objeto com mais de ' + DIAS_DE_VALIDADE + ' dias é apagado sozinho');

  const segredo = process.env.INSTAGRAM_IMG_UPLOAD_SECRET || crypto.randomBytes(16).toString('hex');

  const codigo = fs.readFileSync(path.join(__dirname, '..', 'worker-imagens', 'worker.js'), 'utf8');

  await cfl.subirWorker(NOME_WORKER, codigo, [
    { type: 'r2_bucket', name: 'BUCKET', bucket_name: NOME_BUCKET },
    { type: 'secret_text', name: 'UPLOAD_SECRET', text: segredo },
  ]);
  console.log('Worker publicado: ' + NOME_WORKER);

  await cfl.cf('/workers/scripts/' + NOME_WORKER + '/subdomain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true }),
  });
  const urlWorker = 'https://' + NOME_WORKER + '.' + subdominio + '.workers.dev';
  console.log('URL pública: ' + urlWorker);

  lib.salvarEnv({
    INSTAGRAM_IMG_WORKER_URL: urlWorker,
    INSTAGRAM_IMG_UPLOAD_SECRET: segredo,
  });

  console.log('\nPronto. subirImagem() em lib-instagram.js já usa este host como fallback do imgbb.');
})().catch(function (erro) {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
