const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');

const CLOUD   = 'dag4aiqp5';
const API_KEY = '563635942185614';
const SECRET  = 'a9STpDTp6dDIC8HxRilCxqV5l_4';
const FILE    = path.resolve(__dirname, 'folder-palestra-teresina.png');

const timestamp = Math.floor(Date.now() / 1000).toString();
const public_id = 'palestra-teresina-ingresso';

const sigStr = `public_id=${public_id}&timestamp=${timestamp}${SECRET}`;
const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

const imageBase64 = fs.readFileSync(FILE).toString('base64');
const dataUri = `data:image/png;base64,${imageBase64}`;

const body = new URLSearchParams({
  file: dataUri,
  api_key: API_KEY,
  timestamp,
  public_id,
  signature,
}).toString();

const options = {
  hostname: `api.cloudinary.com`,
  path: `/v1_1/${CLOUD}/image/upload`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.secure_url) {
      console.log('\n✅ Upload OK!');
      console.log('🔗 Link para a BIO:');
      console.log('   ' + json.secure_url);
    } else {
      console.error('Erro:', JSON.stringify(json, null, 2));
    }
  });
});

req.on('error', e => console.error(e.message));
req.write(body);
req.end();
