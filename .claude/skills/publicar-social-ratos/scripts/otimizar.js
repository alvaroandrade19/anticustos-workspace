// Gera versões leves das imagens de um carrossel, prontas para publicação.
//
//   node .claude/skills/publicar-social-ratos/scripts/otimizar.js conteudo/carrosseis/<slug>
//
// Também é módulo: publish-graph-api.js e agendar.js chamam sozinhos quando a imagem
// está pesada demais para o host aceitar.
//
// Por que existe: o /carrossel renderiza em 2x (2160x2700) para ficar nítido em tela
// de retina, e o arquivo sai com 5MB. O Instagram reamostra tudo para 1080 de largura
// de qualquer jeito, então esse peso não vira qualidade nenhuma no feed, só faz o host
// de imagens dar timeout. Aqui reduzimos para 1080 de largura em JPEG.
//
// Escreve numa subpasta "web/", sem tocar nos arquivos originais.
// Usa o Playwright, que o /carrossel já instala.
'use strict';

const fs = require('fs');
const path = require('path');

const LARGURA_ALVO = 1080;
const QUALIDADE = 0.92;
const EXT = ['.png', '.jpg', '.jpeg'];
// Acima disso o catbox começa a devolver 504.
const LIMITE_BYTES = 2 * 1024 * 1024;

function imagensDe(pasta) {
  return fs
    .readdirSync(pasta)
    .filter((n) => EXT.includes(path.extname(n).toLowerCase()))
    .sort()
    .map((n) => path.join(pasta, n));
}

function precisaOtimizar(arquivos) {
  return arquivos.some((a) => fs.existsSync(a) && fs.statSync(a).size > LIMITE_BYTES);
}

// Devolve os caminhos das versões leves, em <pasta>/web/.
async function otimizarPasta(pasta, aoProgredir) {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (_) {
    throw new Error('Playwright não instalado, não dá para otimizar. Rode: npm install playwright');
  }

  const arquivos = imagensDe(pasta);
  if (!arquivos.length) throw new Error('Nenhuma imagem em ' + pasta);

  const saida = path.join(pasta, 'web');
  fs.mkdirSync(saida, { recursive: true });

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  const gerados = [];

  try {
    for (const origem of arquivos) {
      const nome = path.basename(origem);
      const bytesAntes = fs.statSync(origem).size;
      const mime = path.extname(nome).toLowerCase() === '.png' ? 'png' : 'jpeg';
      const dataUrl = 'data:image/' + mime + ';base64,' + fs.readFileSync(origem).toString('base64');

      const jpeg = await pagina.evaluate(
        async ({ src, largura, qualidade }) => {
          const img = new Image();
          img.src = src;
          await img.decode();
          const escala = Math.min(1, largura / img.naturalWidth);
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * escala);
          c.height = Math.round(img.naturalHeight * escala);
          const ctx = c.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, c.width, c.height);
          return c.toDataURL('image/jpeg', qualidade);
        },
        { src: dataUrl, largura: LARGURA_ALVO, qualidade: QUALIDADE }
      );

      const destino = path.join(saida, path.basename(nome, path.extname(nome)) + '.jpg');
      fs.writeFileSync(destino, Buffer.from(jpeg.split(',')[1], 'base64'));
      gerados.push(destino);
      if (aoProgredir) {
        aoProgredir(
          nome + ' -> web/' + path.basename(destino) + '  ' +
          (bytesAntes / 1048576).toFixed(1) + 'MB para ' + (fs.statSync(destino).size / 1024).toFixed(0) + 'KB'
        );
      }
    }
  } finally {
    await navegador.close();
  }

  return gerados;
}

module.exports = { LIMITE_BYTES, imagensDe, precisaOtimizar, otimizarPasta };

// --- uso direto na linha de comando ---
if (require.main === module) {
  (async function () {
    const alvo = process.argv[2];
    if (!alvo) throw new Error('Diga a pasta: otimizar.js conteudo/carrosseis/<slug>');
    const pasta = path.resolve(alvo);
    if (!fs.existsSync(pasta)) throw new Error('Pasta não encontrada: ' + pasta);

    const gerados = await otimizarPasta(pasta, (linha) => console.log(linha));
    console.log('\nPronto: ' + path.join(pasta, 'web') + ' (' + gerados.length + ' arquivos)');
    console.log('Publicar ou agendar apontando para essa pasta.');
  })().catch(function (erro) {
    console.error('\nErro: ' + erro.message);
    process.exit(1);
  });
}
