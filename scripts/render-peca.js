// Renderiza uma peça única (LinkedIn, story, card) em PNG, no tamanho real do elemento.
// Uso: node scripts/render-peca.js <caminho/peca.html> [--seletor .peca] [--escala 2] [--saida 01.png]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const args = process.argv.slice(2);
  const alvo = args[0];
  if (!alvo) {
    console.error('Uso: node scripts/render-peca.js <caminho/peca.html> [--seletor .peca] [--escala 2] [--saida 01.png]');
    process.exit(1);
  }
  const opcao = (nome, padrao) => {
    const i = args.indexOf('--' + nome);
    return i === -1 ? padrao : args[i + 1];
  };
  const seletor = opcao('seletor', '.peca');
  const escala = Number(opcao('escala', '2'));
  const saida = opcao('saida', '01.png');

  const abs = path.resolve(alvo);
  if (!fs.existsSync(abs)) {
    console.error('Arquivo não encontrado: ' + abs);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 2000 }, deviceScaleFactor: escala });
  await page.goto(pathToFileURL(abs).href);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);

  const el = await page.$(seletor);
  if (!el) {
    console.error('Seletor não encontrado no HTML: ' + seletor);
    await browser.close();
    process.exit(1);
  }
  const caixa = await el.boundingBox();
  const destino = path.join(path.dirname(abs), saida);
  await el.screenshot({ path: destino });
  await browser.close();
  console.log('gerado: ' + path.relative(process.cwd(), destino) +
    ' (' + Math.round(caixa.width * escala) + 'x' + Math.round(caixa.height * escala) + ')');
})();
