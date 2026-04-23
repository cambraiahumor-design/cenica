const QRCode = require('qrcode');
const path   = require('path');

/* ── PIX PAYLOAD (EMV - padrão Banco Central) ── */
function pad(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function pixPayload({ key, name, city, txId = '***', amount = null }) {
  const merchantAccount = pad('00', 'BR.GOV.BCB.PIX') + pad('01', key);
  const additionalData  = pad('05', txId);

  let payload =
    pad('00', '01') +
    pad('26', merchantAccount) +
    pad('52', '0000') +
    pad('53', '986') +
    (amount ? pad('54', Number(amount).toFixed(2)) : '') +
    pad('58', 'BR') +
    pad('59', name.slice(0, 25)) +
    pad('60', city.slice(0, 15)) +
    pad('62', additionalData) +
    '6304';

  return payload + crc16(payload);
}

/* ── DADOS DO PIX ── */
const payload = pixPayload({
  key   : '+5585997041061',   // chave PIX — formato E.164 obrigatório
  name  : 'Joao Cambraia',
  city  : 'Teresina',
  txId  : 'PALESTRA',
  amount: 150.00,
});

console.log('Payload PIX:', payload);

/* ── EXPORTA PNG ── */
const OUT = path.resolve(__dirname, 'qrcode-pix-ingresso.png');

QRCode.toFile(OUT, payload, {
  width         : 600,
  margin        : 2,
  errorCorrectionLevel: 'M',
  color: {
    dark : '#0F0A1A',
    light: '#F5EFE6',
  },
}, (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('QR Code PIX salvo em:', OUT);
});
