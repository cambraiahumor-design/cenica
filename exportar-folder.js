const puppeteer = require('puppeteer');
const QRCode    = require('qrcode');
const path      = require('path');

const FILE = path.resolve(__dirname, 'folder-palestra-teresina.html');
const OUT  = path.resolve(__dirname, 'folder-palestra-teresina.png');

/* PIX payload (EMV - Banco Central) */
function pad(id, value) {
  return `${id}${String(value.length).padStart(2,'0')}${value}`;
}
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) { crc = (crc & 0x8000) ? (crc<<1)^0x1021 : crc<<1; crc &= 0xFFFF; }
  }
  return crc.toString(16).toUpperCase().padStart(4,'0');
}
function pixPayload({ key, name, city, txId='***', amount=null }) {
  const ma = pad('00','BR.GOV.BCB.PIX') + pad('01', key);
  let p = pad('00','01') + pad('26',ma) + pad('52','0000') + pad('53','986') +
    (amount ? pad('54', Number(amount).toFixed(2)) : '') +
    pad('58','BR') + pad('59', name.slice(0,25)) + pad('60', city.slice(0,15)) +
    pad('62', pad('05',txId)) + '6304';
  return p + crc16(p);
}

const PIX = pixPayload({ key:'+5585997041061', name:'Joao Cambraia', city:'Teresina', txId:'PALESTRA' });

(async () => {
  const qrDataUrl = await QRCode.toDataURL(PIX, {
    width: 160, margin: 1,
    color: { dark: '#F5EFE6', light: '#00000000' },
    errorCorrectionLevel: 'M',
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 540, deviceScaleFactor: 2 });
  await page.goto(`file:///${FILE.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  // Injeta o QR code na página
  await page.evaluate((dataUrl) => {
    const el = document.getElementById('qr-code');
    if (el) el.src = dataUrl;
  }, qrDataUrl);

  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT, fullPage: false });
  await browser.close();
  console.log('Folder exportado: ' + OUT);
})();
