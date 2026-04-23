// Exporta brandbook.html → brandbook-cenica.pdf via Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function main() {
  const htmlPath = path.resolve(__dirname, 'brandbook.html');
  const outPath  = path.resolve(__dirname, 'brandbook-cenica.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('brandbook.html não encontrado em', htmlPath);
    process.exit(1);
  }

  console.log('[1] Abrindo navegador...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Viewport largo para renderizar como desktop (sidebar visível)
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  console.log('[2] Carregando brandbook.html...');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Aguarda fontes do Google carregarem
  await page.evaluate(() => document.fonts.ready);

  // Injeta estilos de impressão: mostra sidebar inline, remove stickiness
  await page.addStyleTag({ content: `
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }

    /* Para PDF: sidebar vira header estático por seção */
    .bb-nav { display: none !important; }
    .bb-topbar { display: none !important; }
    .bb-main { margin-left: 0 !important; }

    /* Cada seção começa em nova página */
    .bb-section { page-break-before: always; }
    .bb-cover   { page-break-before: auto; min-height: auto; padding: 120px 80px; }
    .bb-footer  { page-break-before: always; }

    /* Remove animações */
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  ` });

  console.log('[3] Gerando PDF...');
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:9px;color:#8A7A92;padding:8px 40px;display:flex;justify-content:space-between;">
      <span style="color:#D4863A;font-weight:700;">Cênica</span>
      <span>Brand Book 2025</span>
    </div>`,
    footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:9px;color:#8A7A92;padding:8px 40px;display:flex;justify-content:space-between;">
      <span>Documento de uso interno e parceiros</span>
      <span class="pageNumber"></span>/<span class="totalPages"></span>
    </div>`,
  });

  await browser.close();

  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`[4] ✅ PDF gerado: ${outPath} (${size} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
