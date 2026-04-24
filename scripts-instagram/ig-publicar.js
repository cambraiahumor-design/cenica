const axios = require('axios');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_TOKEN   = process.env.IG_TOKEN;
const IMAGE_URL  = process.env.IMAGE_URL;
const CAPTION    = process.env.CAPTION;
const API        = 'https://graph.facebook.com/v19.0';

(async () => {
  console.log('📸 Publicando no Instagram...');

  if (!IG_USER_ID || !IG_TOKEN || !IMAGE_URL || !CAPTION) {
    console.error('❌ Variáveis de ambiente ausentes.');
    process.exit(1);
  }

  // 1. Criar container
  const container = await axios.post(`${API}/${IG_USER_ID}/media`, {
    image_url: IMAGE_URL,
    caption: CAPTION,
    access_token: IG_TOKEN,
  });
  const containerId = container.data.id;
  console.log(`   📦 Container: ${containerId}`);

  // Aguarda 5s antes de publicar
  await new Promise(r => setTimeout(r, 5000));

  // 2. Publicar
  const pub = await axios.post(`${API}/${IG_USER_ID}/media_publish`, {
    creation_id: containerId,
    access_token: IG_TOKEN,
  });
  console.log(`   ✅ Publicado! ID: ${pub.data.id}`);
})().catch(e => {
  const err = e.response?.data?.error;
  console.error('❌ Erro:', err?.message || e.message);
  process.exit(1);
});
