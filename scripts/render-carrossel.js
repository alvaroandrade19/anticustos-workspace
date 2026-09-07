// Renderiza cada .slide de um carrossel HTML em PNG separado, no tamanho do canvas.
// Uso: node scripts/render-carrossel.js conteudo/carrosseis/<pasta>/carrossel.html
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const alvo = process.argv[2];
  if (!alvo) {
    console.error('Uso: node scripts/render-carrossel.js <caminho/carrossel.html>');
    process.exit(1);
  }
  const abs = path.resolve(alvo);
  if (!fs.existsSync(abs)) {
    console.error('Arquivo não encontrado: ' + abs);
    process.exit(1);
  }
  const saida = path.dirname(abs);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + abs.replace(/\\/g, '/'));
  // Fontes do Google precisam terminar de carregar antes do print.
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const nome = path.join(saida, String(i + 1).padStart(2, '0') + '.png');
    await slides[i].screenshot({ path: nome });
    console.log('gerado: ' + path.relative(process.cwd(), nome));
  }
  await browser.close();
  console.log(slides.length + ' slides renderizados em ' + path.relative(process.cwd(), saida));
})();
