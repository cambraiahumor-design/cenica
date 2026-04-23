const fs   = require('fs');
const path = require('path');
const https = require('https');

const IMGBB_KEY = 'f4793b81871acc667c3fac75976befb4';
const FILE = path.resolve(__dirname, 'folder-palestra-teresina.png');

const imageData = fs.readFileSync(FILE).toString('base64');

const body = new URLSearchParams({
  key: IMGBB_KEY,
  image: imageData,
  name: 'palestra-teresina-ingresso',
  expiration: '',
}).toString();

const options = {
  hostname: 'api.imgbb.com',
  path: '/1/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.success) {
      console.log('\n✅ Upload feito com sucesso!');
      console.log('🔗 Link para a BIO do Instagram:');
      console.log('   ' + json.data.url_viewer);
      console.log('\n📸 URL direta da imagem:');
      console.log('   ' + json.data.display_url);
    } else {
      console.error('Erro:', JSON.stringify(json, null, 2));
    }
  });
});

req.on('error', e => console.error('Erro na requisição:', e.message));
req.write(body);
req.end();
