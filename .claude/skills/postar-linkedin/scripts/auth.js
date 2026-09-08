// Autoriza a conta do LinkedIn e grava token + URN do perfil no .env.
//
// Modos (do mais simples pro mais completo):
//   node .claude/skills/postar-linkedin/scripts/auth.js
//       cola um token gerado no Token Generator do portal de developers
//   node ... auth.js --token AQV...
//       mesma coisa, sem prompt
//   node ... auth.js --servidor
//       fluxo OAuth completo, abre o navegador e escuta o callback em 127.0.0.1
//   node ... auth.js --code AQT...
//       troca manual: você já tem o code da URL de retorno
//
// Extras: --urn urn:li:person:xxxx  (quando o token não tem escopo openid)
'use strict';

const http = require('http');
const readline = require('readline');
const { exec } = require('child_process');
const lib = require('./lib-linkedin.js');

const PORTA = 8888;
const REDIRECT_LOCAL = 'http://127.0.0.1:' + PORTA + '/callback';
const ESCOPOS = 'openid profile email w_member_social';

function args() {
  const saida = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const chave = argv[i].slice(2);
    const proximo = argv[i + 1];
    saida[chave] = proximo && !proximo.startsWith('--') ? argv[++i] : true;
  }
  return saida;
}

function perguntar(texto) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((ok) => rl.question(texto, (resposta) => { rl.close(); ok(resposta.trim()); }));
}

function abrirNavegador(url) {
  const comando = process.platform === 'win32'
    ? 'start "" "' + url + '"'
    : process.platform === 'darwin' ? 'open "' + url + '"' : 'xdg-open "' + url + '"';
  exec(comando, () => {});
}

async function trocarCodePorToken(code, redirectUri) {
  const clientId = lib.exigir('LINKEDIN_CLIENT_ID', 'Pega em developer.linkedin.com > seu app > Auth.');
  const clientSecret = lib.exigir('LINKEDIN_CLIENT_SECRET', 'Mesma tela, campo Primary Client Secret.');
  const corpo = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });
  const { corpo: resposta } = await lib.chamar('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: corpo.toString(),
  });
  return resposta.access_token;
}

async function fluxoServidor() {
  const clientId = lib.exigir('LINKEDIN_CLIENT_ID', 'Pega em developer.linkedin.com > seu app > Auth.');
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || REDIRECT_LOCAL;
  const estado = Math.random().toString(36).slice(2);
  const url = 'https://www.linkedin.com/oauth/v2/authorization?' + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: estado,
    scope: ESCOPOS,
  }).toString();

  console.log('Abrindo o navegador para autorizar. Se não abrir, cole esta URL:\n' + url + '\n');
  abrirNavegador(url);

  const code = await new Promise((ok, falhar) => {
    const servidor = http.createServer((req, res) => {
      const recebida = new URL(req.url, 'http://127.0.0.1:' + PORTA);
      if (!recebida.pathname.startsWith('/callback')) { res.writeHead(404); res.end(); return; }
      const erro = recebida.searchParams.get('error_description') || recebida.searchParams.get('error');
      const recebido = recebida.searchParams.get('code');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2 style="font-family:system-ui">' + (recebido ? 'Autorizado. Pode fechar essa aba.' : 'Falhou: ' + erro) + '</h2>');
      servidor.close();
      if (recebida.searchParams.get('state') !== estado) return falhar(new Error('State não confere. Refaça o fluxo.'));
      if (!recebido) return falhar(new Error('LinkedIn devolveu erro: ' + erro));
      ok(recebido);
    });
    servidor.on('error', falhar);
    servidor.listen(PORTA, '127.0.0.1', () => console.log('Esperando o retorno em ' + redirectUri + ' ...'));
  });

  return trocarCodePorToken(code, redirectUri);
}

(async () => {
  lib.carregarEnv();
  const opcoes = args();
  let token;

  if (opcoes.servidor) {
    token = await fluxoServidor();
  } else if (opcoes.code) {
    token = await trocarCodePorToken(opcoes.code, process.env.LINKEDIN_REDIRECT_URI || REDIRECT_LOCAL);
  } else if (typeof opcoes.token === 'string') {
    token = opcoes.token;
  } else {
    console.log('Gere um token em: https://www.linkedin.com/developers/tools/oauth/token-generator');
    console.log('Marque os escopos: openid, profile, email, w_member_social\n');
    token = await perguntar('Cole o access token aqui: ');
  }

  if (!token) throw new Error('Nenhum token informado.');
  token = token.trim();

  // Descobre o URN do perfil. Sem ele não dá pra publicar.
  let urn = typeof opcoes.urn === 'string' ? opcoes.urn : null;
  let nome = null;
  if (!urn) {
    const perfil = await lib.quemSou(token);
    urn = 'urn:li:person:' + perfil.sub;
    nome = perfil.name;
  }

  // Expiração real vem da introspecção; sem client id/secret, cai na estimativa de 60 dias.
  let expiraEm = null;
  let escopos = null;
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    try {
      const dados = await lib.inspecionar(token, process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET);
      if (dados.expires_at) expiraEm = new Date(Number(dados.expires_at) * 1000).toISOString();
      escopos = dados.scope || null;
    } catch (erro) {
      console.log('Aviso: não consegui inspecionar o token (' + erro.message + '). Usando estimativa de 60 dias.');
    }
  }
  if (!expiraEm) expiraEm = new Date(Date.now() + 60 * 86400000).toISOString();

  const caminho = lib.salvarEnv({
    LINKEDIN_ACCESS_TOKEN: token,
    LINKEDIN_PERSON_URN: urn,
    LINKEDIN_TOKEN_EXPIRA_EM: expiraEm,
  });

  console.log('\nSalvo em ' + caminho);
  if (nome) console.log('Perfil: ' + nome);
  console.log('URN: ' + urn);
  console.log('Expira em: ' + expiraEm.slice(0, 10) + ' (' + lib.diasAte(expiraEm) + ' dias)');
  if (escopos) console.log('Escopos: ' + escopos);
  if (escopos && !escopos.includes('w_member_social')) {
    console.log('\nATENÇÃO: falta w_member_social. Sem esse escopo o token não publica. Refaça marcando ele.');
  }

  // O Worker da Cloudflare guarda uma cópia do token. Se ele existe, atualiza junto,
  // senão o agendamento continuaria tentando publicar com token vencido.
  if (process.env.LINKEDIN_WORKER_NOME && process.env.CLOUDFLARE_API_TOKEN) {
    console.log('\nAtualizando o token no Worker da Cloudflare...');
    try {
      // Processo separado de propósito: ele precisa reler o .env já com o token novo.
      require('child_process').execFileSync(
        process.execPath,
        [require('path').join(__dirname, 'deploy-worker.js')],
        { stdio: 'inherit' }
      );
    } catch (erro) {
      console.log('Falhou. Rode na mão: node .claude/skills/postar-linkedin/scripts/deploy-worker.js');
    }
  }
})().catch((erro) => {
  console.error('\nErro: ' + erro.message);
  process.exit(1);
});
