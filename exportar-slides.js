const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FILE = path.resolve(__dirname, 'carroseis/index.html');
const OUT  = path.resolve(__dirname, 'slides-exportados');

const CAROUSELS = [
  { name: '01-sinais-comunicacao', slides: 7 },
  { name: '02-teatro-vs-mba',      slides: 6 },
  { name: '03-voce-ja-e-capaz',    slides: 5 },
  { name: '04-tecnicas-teatrais',  slides: 5 },
  { name: '05-equipe-extraordinaria', slides: 6 },
  { name: '06-soft-skills',        slides: 8 },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

  await page.goto(`file:///${FILE.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#slide-frame');

  for (let ci = 0; ci < CAROUSELS.length; ci++) {
    const { name, slides } = CAROUSELS[ci];
    const folder = path.join(OUT, name);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    // load carousel
    await page.evaluate(i => {
      const cards = document.querySelectorAll('.nav-card');
      loadCarousel(i, cards[i]);
    }, ci);
    await new Promise(r => setTimeout(r, 400));

    for (let si = 0; si < slides; si++) {
      await new Promise(r => setTimeout(r, 200));

      const frame = await page.$('#slide-frame');
      const file  = path.join(folder, `slide-${String(si + 1).padStart(2, '0')}.png`);
      await frame.screenshot({ path: file });

      console.log(`✓ ${name} › slide ${si + 1}/${slides}`);

      if (si < slides - 1) {
        await page.click('#btn-next');
      }
    }
  }

  await browser.close();
  console.log(`\nPronto! ${CAROUSELS.length} carrosséis exportados em:\n${OUT}`);
})();
