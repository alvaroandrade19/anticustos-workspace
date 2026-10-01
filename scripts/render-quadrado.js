// Renderiza o avatar quadrado em PNG, no dobro do canvas, com o log da pagina visivel.
// Uso: node scripts/render-quadrado.js <html> <png> [lado] [escala]
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const html = path.resolve(process.argv[2]);
  const png = path.resolve(process.argv[3]);
  const lado = Number(process.argv[4] || 1080);
  const escala = Number(process.argv[5] || 2);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: lado, height: lado }, deviceScaleFactor: escala });
  page.on('console', m => console.log('[pagina] ' + m.text()));
  await page.goto('file:///' + html.split(path.sep).join('/'));
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await (await page.$('.slide')).screenshot({ path: png });
  await browser.close();
  console.log('gerado: ' + png + '  (' + lado * escala + 'px)');
})();
